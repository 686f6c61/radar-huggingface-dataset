# iromu/Qwen3-0.6B-openjev-GGUF

## Resumen

Qwen3-0.6B-openjev-GGUF es la conversión a formato GGUF del fine-tune de decisión tipada `iromu/Qwen3-0.6B-openjev`, desarrollado por el usuario iromu a partir de `Qwen/Qwen3-0.6B-Base`. El modelo no es un asistente conversacional general: está entrenado para recibir un estado, una pregunta y un conjunto de opciones, y devolver una única letra de etiqueta correspondiente a la opción con mayor probabilidad. Resuelve, por tanto, el problema de la selección de etiqueta determinista y de bajo coste computacional en pipelines de clasificación y enrutado.

Técnicamente es un transformer decoder-only denso de 596.049.920 parámetros, ajustado mediante LoRA (rango 32) con NeMo-RL sobre el split `train` del corpus `ZefanCai/Open-Jev`. La model card declara únicamente inglés como idioma y licencia Apache-2.0. Su relevancia actual es acotada pero clara: demuestra que un modelo de menos de 600 millones de parámetros, cuantizado a 4-8 bits, puede sostener una tarea de decisión con formato estricto y ejecutarse en CPU o en GPU de gama de entrada.

El repositorio (2,7 GB) incluye cuatro precisiones GGUF: BF16, Q4_K_M, Q5_K_M y Q8_0. Según la validación publicada por el autor sobre 3.495 filas, el modelo base sin ajustar no emite ninguna letra válida (0,0%), mientras que el fine-tune en BF16 acierta el 85,0% de las etiquetas y Q8_0 alcanza el 84,9%, prácticamente paridad con la conversión de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), denso, ajustado con LoRA |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion; el entrenamiento uso secuencias de hasta 4096 tokens y la validacion un limite de 384 tokens |
| Tipos de cuantizacion | GGUF en BF16, Q4_K_M, Q5_K_M y Q8_0; existe ademas un checkpoint NVFP4 en repositorio hermano |
| Idiomas soportados | ingles (unico idioma declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base BF16 del que deriva) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-0.6B-Base`, un transformer decoder-only denso de la familia Qwen3, y se ajusta con supervisión completa (SFT) mediante LoRA de rango 32, alpha 32 y dropout 0,05 sobre todos los módulos de proyección (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se ejecutó con NeMo-RL en bfloat16, optimizador AdamW con learning rate 5e-5 y weight decay 0,01, warmup lineal de 100 pasos seguido de decaimiento coseno hasta 1e-6, batch global de 64 (micro-batch 2), 1.250 pasos totales y validación cada 125 pasos. La longitud máxima de secuencia fue de 4.096 tokens y la pérdida es entropía cruzada enmascarada al turno del asistente según la plantilla de chat de decisión, de modo que solo se penaliza la letra de respuesta.

Los datos provienen del split `train` del corpus `ZefanCai/Open-Jev`. Cada fila contiene un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre esas opciones; el objetivo de entrenamiento es el argmax de dicha distribución, serializado como una única letra de etiqueta. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si hubo fases posteriores de RLHF o DPO; el autor solo describe SFT con LoRA. La innovación técnica destacable no está en la arquitectura, sino en el formato: el ajuste fuerza que la salida sea siempre una letra válida, lo que convierte al modelo en un clasificador de vocabulario cerrado en lugar de un generador de texto libre.

## Capacidades

- Selección de etiqueta en tareas de decisión tipada: dado un estado, una pregunta y un conjunto de opciones, devuelve una sola letra correspondiente a la opción argmax.
- Clasificación de vocabulario cerrado con formato de salida fiable: el 100% de las 3.495 filas de validación reciben una letra, en las cuatro cuantizaciones evaluadas.
- Enrutado ligero dentro de pipelines: útil para elegir entre un conjunto finito de acciones, herramientas o categorías predefinidas.
- Ejecución en CPU y en dispositivos de borde mediante llama.cpp y los bindings de Python (`llama-cpp-python`).
- Compatibilidad declarada con endpoints de inferencia (tag `endpoints_compatible`) y con el ecosistema GGUF.
- Capacidades multilingües: no disponibles; la model card declara únicamente inglés.
- No soporta de forma declarada tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido; el autor indica explícitamente que no es un sustituto general de modelos Qwen mayores.

## Casos de uso

- Enrutado de tickets y peticiones: el modelo recibe la descripción del usuario y una lista cerrada de categorías y devuelve la letra de la categoría asignada, ejecutándose en CPU por debajo del coste de un modelo grande y con salida siempre parseable.
- Clasificación de bajo coste en el borde: al caber en cuantización Q4_K_M en torno a 0,4 GB, puede desplegarse en dispositivos sin GPU dedicada dentro de aplicaciones de etiquetado local o preprocesado previo al envío a un servidor.
- Selección de herramienta en un agente: dentro de un sistema mayor, el modelo actúa como cabecera de decisión que elige entre un conjunto fijo de herramientas o rutas, dejando la ejecución al orquestador.
- Etiquetado asistido de datasets: aplicar el modelo sobre corpus de decisión ya estructurados para preetiquetar filas y reservar la revisión humana a los casos de baja confianza, usando Q8_0 cuando la letra exacta es crítica.
- Filtrado y triaje en pipelines de datos: decidir si un documento entra en una de N rutas de procesamiento (aceptar, revisar, descartar) con una latencia mínima y sin dependencia de servicios externos.
- Experimentación educativa y de investigación en alineación de formato: sirve como caso de estudio reproducible de cómo un SFT con LoRA sobre un modelo de 0,6B transforma una tasa de formato válido del 0% al 100% en una tarea concreta.
- Pruebas de integración de llama.cpp: por su tamaño reducido, es adecuado como modelo de humo para validar despliegues GGUF, cuantizaciones y plantillas de chat antes de pasar a modelos mayores.

## Benchmarks y rendimiento

Los únicos datos publicados son la tabla de validación del autor sobre el split `validation` de Open-Jev (3.495 filas), con decodificación greedy y un límite de 384 tokens. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

| Modelo | Cuantizacion | n | Letra emitida | Letra correcta | Delta vs base |
|---|---|---|---|---|---|
| Qwen/Qwen3-0.6B-Base | BF16 | 3495 | 0/3495 (0,0%) | 0/3495 (0,0%) | (sin predecesor) |
| Qwen3-0.6B-openjev | GGUF-BF16 | 3495 | 3495/3495 (100,0%) | 2972/3495 (85,0%) | +85,0 pp |
| Qwen3-0.6B-openjev | GGUF-Q4_K_M | 3495 | 3495/3495 (100,0%) | 2932/3495 (83,9%) | +83,9 pp |
| Qwen3-0.6B-openjev | GGUF-Q5_K_M | 3495 | 3495/3495 (100,0%) | 2957/3495 (84,6%) | +84,6 pp |
| Qwen3-0.6B-openjev | GGUF-Q8_0 | 3495 | 3495/3495 (100,0%) | 2966/3495 (84,9%) | +84,9 pp |

La pérdida de fidelidad por cuantización es suave: Q4_K_M cede 1,1 puntos porcentuales respecto a BF16, Q5_K_M cede 0,4 y Q8_0 queda a 0,1 puntos, por lo que el autor recomienda Q8_0 cuando la letra exacta es determinante. No se publican cifras de latencia ni de throughput; la model card solo aclara que las mediciones corresponden a decodificación greedy de un único flujo, no a throughput de servidor.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 596 millones de parámetros, no publicada por el autor): aproximadamente 1,2 GB en BF16, unos 0,65 GB en Q8_0, unos 0,45 GB en Q5_K_M y unos 0,4 GB en Q4_K_M, sin contar el contexto ni el overhead del runtime.
- GPU recomendadas: no se especifican en la información. Por tamaño, cualquier GPU con 2 GB o más de memoria es suficiente; una RTX 4090, A100 o H100 queda muy por encima de lo necesario y solo tendría sentido para servir muchos flujos concurrentes.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 o superiores, e incluso en GPUs integradas con memoria compartida suficiente.
- Despliegue: llama.cpp (`llama-cli -hf iromu/Qwen3-0.6B-openjev-GGUF:Q4_K_M`), bindings de Python `llama-cpp-python` con `n_gpu_layers=99`, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere uso con endpoints de inferencia gestionados. No se documenta soporte de vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iromu/Qwen3-0.6B-openjev-GGUF | 596 M | no disponible (entrenamiento a 4096 tokens) | 85,0% de letra correcta en BF16; 83,9% en Q4_K_M | Apache-2.0 | GGUF en HuggingFace, 0 descargas |
| Qwen/Qwen3-0.6B-Base | 596 M (aproximado, no confirmado en la informacion) | no disponible | 0,0% de letra correcta en la misma validacion | Apache-2.0 (modelo base de Qwen) | HuggingFace |
| iromu/Qwen3-0.6B-openjev (BF16) | 596 M | no disponible | 85,0% de letra correcta | Apache-2.0 | HuggingFace |
| iromu/Qwen3-0.6B-openjev-NVFP4 | 596 M | no disponible | no disponible en la informacion | Apache-2.0 | HuggingFace |

Frente a alternativas de propósito general de tamaño similar, la comparación no es directa: este modelo solo emite una letra y no mantiene conversación ni genera texto libre, por lo que sus métricas no son trasladables a MMLU u otros benchmarks de conocimiento. Para tareas de clasificación genérica con etiquetas arbitrarias habría que evaluar modelos mayores, cuyos datos no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: solo responde al formato de decisión tipada con opciones y letra de salida; el autor advierte que no sustituye a modelos Qwen mayores.
- Tasa de error inherente: incluso en BF16, un 15,0% de las filas de validación reciben una letra incorrecta, y todas las cuantizaciones emiten siempre una letra, por lo que no existe señal de abstención.
- Idioma: únicamente inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Contexto no documentado: no se publica la ventana de contexto efectiva del artefacto GGUF, solo la longitud máxima de secuencia usada en entrenamiento (4.096) y el límite de 384 tokens de la validación.
- Dependencia de la plantilla: el ajuste se hizo con una plantilla de chat de decisión concreta y enmascarado al turno del asistente; la ficha no reproduce dicha plantilla, por lo que una integración con un formato distinto puede degradar la precisión.
- Riesgo de sobreajuste al corpus: el modelo se entrena solo con el split `train` de Open-Jev y se evalúa sobre el split `validation` del mismo corpus; no hay evaluación fuera de dominio.
- Cuantización: Q4_K_M pierde 1,1 puntos porcentuales de fidelidad frente a BF16; para usos donde la letra exacta importa se recomienda Q8_0.
- Sesgos: no se documenta ningún análisis de sesgos, composición demográfica ni evaluación de equidad del corpus Open-Jev.
- Licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3; conviene revisar los términos de `Qwen/Qwen3-0.6B-Base` antes de desplegar en producción.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación independiente por terceros.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/iromu/Qwen3-0.6B-openjev-GGUF
- Modelo BF16 y tabla de validación completa: https://huggingface.co/iromu/Qwen3-0.6B-openjev
- Checkpoint NVFP4: https://huggingface.co/iromu/Qwen3-0.6B-openjev-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Runtime llama.cpp: https://github.com/ggml-org/llama.cpp
