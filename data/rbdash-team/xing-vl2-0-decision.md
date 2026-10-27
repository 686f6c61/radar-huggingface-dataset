# RBDash-Team/Xing-VL2.0-Decision

## Resumen

Xing-VL2.0-Decision es un modelo multimodal de decisión tipada de 26.085.330.160 parámetros (aproximadamente 26,09 mil millones) desarrollado por RBDash-Team a partir de Qwen/Qwen3.8-27B. No es un modelo generativo: recibe un estado compuesto por texto y hasta cuatro imágenes, una pregunta y entre 1 y 255 opciones, y devuelve en una única pasada forward una distribución de probabilidad sobre cada opción. El modelo no produce texto libre y, por tanto, no puede cargarse con `AutoModelForCausalLM`.

El problema que resuelve es concreto: convertir la evaluación multimodal en una clasificación calibrada y puntuable en lugar de una generación que hay que parsear. Eso lo hace útil para pipelines donde se necesita una probabilidad por clase (triaje, moderación, control de calidad, enrutado de políticas en agentes) con un único forward pass en vez de decodificación autoregresiva. Su relevancia actual viene de que se publica con el kit de evaluación Decision Index, con un índice público de visión de 77,78 sobre 11 benchmarks y 12.210 filas, y de que hereda la licencia Apache 2.0.

El checkpoint es el renombrado de RBDash-Decision-v0.2: solo cambió el nombre, no se reentrenó, reejecutó ni repuntuó nada. La versión anterior sigue disponible como RBDash-Team/RBDash-Decision-v0.1. El repositorio ocupa 52,2 GB y acumula 1.871 descargas y 14 likes desde su creación el 22 de octubre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone vision-language Qwen3.5 (transformer multimodal): capas de atención completa no causal y capas de atención lineal con recurrencia causal; pooling del último token |
| Parametros totales | 26.085.330.160 (aprox. 26,09 mil millones, dato real de safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el checkpoint se publica y se evalúa en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `readout.safetensors` para la cabeza de decisión), precisión bfloat16, librería transformers |
| Cabeza de salida | Readout lineal de 255 vías que sustituye a la LM head; inicializado desde las filas de la LM head de 255 códigos de respuesta de un solo token (`A` a `JT`) |
| Calibracion | Una temperatura ajustada de 0,9766 almacenada en `decision_config.json` |
| Entradas por peticion | Texto más hasta 4 imágenes; resolución nativa con tope de 1.638.400 píxeles por imagen en la evaluación |
| Opciones por consulta | De 1 a 255 |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 52,2 GB |
| Descargas / likes | 1.871 / 14 (última actualización: 27-10-2026) |

La fórmula declarada por el autor es `probs = softmax(readout(hidden[-1])[:n_options] / T)`, es decir, se lee el prompt una sola vez, se toma el estado oculto del último token y se aplica el readout sobre las primeras `n_options` salidas.

## Arquitectura y entrenamiento

El modelo parte del backbone vision-language de la familia Qwen3.5 y sustituye la cabeza de lenguaje por un readout lineal de 255 clases. La atención está dividida: las capas de atención completa son no causales, mientras que la recurrencia de las capas de atención lineal permanece causal. El pooling se hace sobre el último token. La inicialización del readout a partir de las filas de la LM head correspondientes a 255 códigos de respuesta de un solo token permite arrancar el ajuste desde un mapeo ya alineado con el vocabulario del modelo base, en lugar de desde pesos aleatorios.

El ajuste fino se hizo sobre datos estáticos de decisión imagen-texto con tres tipos de pregunta: elección múltiple, sí/no y puntuación graduada. El objetivo es entropía cruzada con etiquetas suaves sobre los 255 códigos de respuesta. La torre de visión se congeló durante el entrenamiento, de modo que la adaptación multimodal se concentra en el backbone de lenguaje y en el readout. El autor declara una comprobación de solapamiento entre las imágenes de entrenamiento y las 12.210 imágenes públicas de evaluación de visión mediante hash exacto de bytes, sin coincidencias; no se comprobó solapamiento perceptual ni semántico. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

No hay innovaciones de decodificación que aplicar, porque no hay decodificación: al no generar texto, el coste por consulta es un único forward pass, con la salvedad de que el prompt forma parte del modelo entrenado y no debe modificarse.

## Capacidades

- Clasificación multimodal tipada: devuelve una probabilidad por cada opción (hasta 255) en una sola pasada, sin generar texto.
- Elección múltiple sobre imágenes: los elementos de una lista se convierten en las opciones A, B, C, etc.
- Preguntas de sí/no con probabilidad explícita de "sí" (modo `noul` en la API de ejemplo, usado para detección de contenido de odio en memes).
- Puntuación graduada, es decir, respuestas en una escala ordinal además de las categóricas.
- Entrada de hasta cuatro imágenes por consulta junto con el estado textual.
- Funcionamiento a resolución nativa de imagen, con tope de 1.638.400 píxeles por imagen en la evaluación publicada.
- Calibración de probabilidades mediante temperatura ajustada, lo que permite usar las salidas como scores y no solo como etiquetas.
- Integración con el kit Decision Index a través de un motor propio (`rbdash_decision_engine:RBDashEngine`).
- No soporta tool calling, function calling ni razonamiento multi-paso generativo: no produce texto ni llamadas a herramientas.

## Casos de uso

- Triaje y conteo sobre imagen médica: el ejemplo de la model card es una pregunta de elección múltiple ("How many organs are in the image?") con opciones numéricas sobre una imagen de escáner. El modelo devuelve la opción más probable y el vector completo de probabilidades, lo que permite fijar umbrales de derivación a revisión humana en lugar de depender de una cadena de texto parseada.

- Moderación de contenido en memes e imágenes: con la variante sí/no (`kind="noul"`) se obtiene directamente la probabilidad de que un meme sea odioso. Al ser un score calibrado, se puede ajustar el punto de corte por política sin reentrenar y encadenar el resultado a un sistema de revisión.

- Control de calidad visual en producción: dada una foto de una pieza y una lista cerrada de defectos posibles, el modelo asigna probabilidad a cada clase en un único forward pass. Es adecuado cuando el catálogo de defectos es fijo y se necesita latencia predecible por unidad inspeccionada.

- Enrutado de decisiones en agentes: con hasta 255 opciones se puede usar como selector de política o de siguiente acción a partir de una observación textual más capturas de pantalla, sustituyendo al parseo de la salida de un LLM generativo por una distribución explícita sobre acciones.

- Evaluación comparativa de sistemas multimodales: el repositorio incluye el motor necesario para reproducir la suite pública de visión del Decision Index (11 benchmarks, 12.210 filas), lo que permite puntuar el modelo con una métrica agregada y comparable.

- Puntuación graduada de severidad: para casos donde la respuesta no es categórica sino ordinal (grado de deterioro, nivel de riesgo, calidad de una imagen), el tercer tipo de pregunta entrenado (graded score) devuelve la distribución sobre los niveles definidos.

- Selección entre variantes de producto o documento: a partir de una foto y una pregunta, elegir entre candidatos discretos (modelo correcto, campo correcto de un formulario) usando la probabilidad como criterio de confianza y derivando los casos de baja confianza a un humano.

- Filtrado previo en pipelines de datos: clasificar pares imagen-pregunta antes de pasarlos a un modelo generativo más caro, usando el coste de un solo forward pass como etapa de descarte.

## Benchmarks y rendimiento

| Suite | Version | Benchmarks | Filas | Imagenes por fila | Indice publico | Errores |
|---|---|---|---|---|---|---|
| Decision Index, suite publica de vision | edicion 0.3 | 11 | 12.210 | 1 a 4 | 77,78 | 0 (todas las filas respondidas) |

No se han publicado resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos similares en la información disponible. El autor advierte de que 77,78 corresponde únicamente a la mitad pública de la puntuación del board de visión: la puntuación Full incluye tests privados que ejecutan los mantenedores, por lo que el índice no equivale a una posición en la clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 60 GB de memoria libre en GPU para bfloat16, según indica el autor (coherente con 26,09 mil millones de parámetros y un repositorio de 52,2 GB de pesos).
- GPU recomendadas: A100 80 GB o H100 80 GB, que son las únicas configuraciones de un solo acelerador que cubren con holgura los 60 GB requeridos entre las mencionadas habitualmente; no se documenta soporte multi-GPU.
- GPU de consumo: no cabe en bfloat16 en una RTX 4090 (24 GB) ni en tarjetas de 48 GB; no se han publicado cuantizaciones alternativas que redujeran el requisito.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el modelo no puede cargarse con `AutoModelForCausalLM`, por lo que los servidores de inferencia de texto estándar no sirven. El despliegue previsto es el módulo `rbdash_decision.py` (clase `RBDashDecision`) sobre torch y transformers, o el motor `rbdash_decision_engine:RBDashEngine` para el kit Decision Index.
- Dependencias: torch, torchvision, transformers, safetensors, pillow y huggingface_hub. `requirements.txt` añade además `flash-linear-attention` (Python puro) para acelerar las capas de atención lineal; `causal-conv1d` es opcional y se instala aparte con `requirements-optional.txt` (wheel precompilado v1.7.0 para torch 2.6 a 2.10; si no hay wheel compatible, compila desde fuente y requiere `nvcc`).
- Latencia y throughput: no se publican cifras. El motor del kit procesa una petición a la vez en una GPU y serializa internamente los 8 hilos de trabajo por defecto del kit. La primera ejecución con `flash-linear-attention` es lenta porque Triton compila sus kernels en el primer uso; sin estas librerías el modelo funciona por rutas de PyTorch más lentas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing-VL2.0-Decision | 26,09 B (26.085.330.160) | no disponible | Distribución sobre 1 a 255 opciones | Apache 2.0 | HuggingFace, 1.871 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 27 B (nominal) | no disponible | Texto generativo | no disponible | HuggingFace |
| RBDash-Team/RBDash-Decision-v0.1 (predecesor) | no disponible | no disponible | Distribución sobre opciones | Apache 2.0 | HuggingFace |
| Otros clasificadores multimodales de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es frente al modelo base: mismo origen arquitectónico, pero Xing-VL2.0-Decision sustituye la generación de texto por una lectura de 255 vías, lo que cambia por completo el régimen de uso (no hay decodificación, no hay tool calling, no hay salida textual). No se dispone de datos de benchmarks del modelo base en la información proporcionada para comparar rendimiento.

## Limitaciones y advertencias

- No genera texto: no puede usarse con `AutoModelForCausalLM` ni en tareas de generación, resumen, diálogo o código. Cualquier caso de uso que espere texto de salida queda fuera de su alcance.
- Dependencia estricta del prompt: el autor advierte de que el prompt forma parte del modelo entrenado y que `rbdash_decision.py` debe mantenerse sin cambios, porque otra redacción puede alterar predicciones individuales. Esto limita la libertad de adaptar instrucciones en producción.
- Calibración global única: se aplica una sola temperatura (0,9766) a todas las opciones y dominios; no se documenta calibración por tarea ni por número de opciones, lo que puede producir sobreconfianza o infraconfianza en dominios alejados del entrenamiento.
- Sesgos conocidos: no se documenta ninguna evaluación de sesgos, toxicidad ni equidad en la información disponible, a pesar de que uno de los casos de uso previstos es la moderación de contenido.
- Riesgo de alucinación: al no generar texto libre el riesgo clásico se transforma en asignación de probabilidad alta a opciones incorrectas cuando la pregunta excede la distribución de entrenamiento; no se publican métricas de abstención ni de detección de fuera de dominio.
- Cobertura de idiomas: no disponible. No se declara qué idiomas maneja el backbone ni en qué idioma se entrenaron las preguntas.
- Límites de entrada: máximo cuatro imágenes por consulta y máximo 255 opciones; en la evaluación las imágenes se caparon a 1.638.400 píxeles, por lo que resoluciones mayores no están validadas.
- Validación incompleta de fuga de datos: la comprobación de solapamiento entre entrenamiento y evaluación se hizo solo por hash exacto de bytes; el propio autor indica que no se verificó solapamiento perceptual ni semántico, de modo que el índice de 77,78 podría estar inflado pornear-duplicates.
- Alcance de la evaluación: el 77,78 cubre solo la mitad pública del board; no es una posición en la clasificación y no hay resultados por benchmark que permitan diagnosticar puntos débiles.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación con atribución y aviso de cambios, pero el modelo base Qwen/Qwen3.8-27B tiene sus propias condiciones, que no se detallan en la información disponible y conviene verificar antes de un despliegue comercial.
- Requisito de hardware elevado: unos 60 GB de VRAM libres en bfloat16 y ausencia de cuantizaciones publicadas excluyen el despliegue en GPU de consumo y encarecen el escalado.
- Throughput limitado: el motor procesa una petición a la vez por GPU, sin batching documentado, lo que restringe escenarios de alta concurrencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RBDash-Team/Xing-VL2.0-Decision
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint previo (RBDash-Decision-v0.1): https://huggingface.co/RBDash-Team/RBDash-Decision-v0.1
- Kit de evaluación Decision Index: https://github.com/apolinario/decision-index
- Repositorio del modelo (descarga directa): https://huggingface.co/RBDash-Team/Xing-VL2.0-Decision/tree/main
