# Ahsanz/virl39k-qwen25vl-7b-arms

## Resumen

Este repositorio no contiene un modelo unico, sino tres checkpoints de investigacion derivados de Qwen2.5-VL-7B-Instruct mediante aprendizaje por refuerzo: A1 (GRPO con recompensa de precision binaria), A3 (VPPO, con asignacion de credito basada en dependencia visual) y A4 (PRPO + RVD). Todos comparten una receta controlada: dataset ViRL39K (version deduplicada de Geo3K), 162 pasos de entrenamiento, batch global 128, 384 rollouts con n=8, learning rate 1e-6, recorte DAPO 0,2/0,28, perdida a nivel de token, respuesta maxima de 2048 tokens y torre de vision descongelada. El objetivo declarado es el estudio comparativo de algoritmos de RL en modelos vision-lenguaje, no la publicacion de un modelo listo para produccion.

El modelo base es Qwen2.5-VL-7B-Instruct, un transformer multimodal decoder-only con torre de vision, publicado por Alibaba Qwen bajo licencia Apache-2.0. Al descongelar la torre de vision, los checkpoints resultantes modifican tanto el decodificador de lenguaje como el codificador visual, por lo que difieren del base en mas lugares que un ajuste fino convencional con el backbone visual congelado. Los tres brazos se publican como checkpoints fusionados en formato HuggingFace dentro de un unico repositorio, en subcarpetas separadas.

La relevancia actual es metodologica: permiten reproducir y auditar comparaciones entre GRPO, VPPO y PRPO+RVD bajo un entorno de entrenamiento identico, algo poco frecuente porque la mayoria de publicaciones liberan solo el mejor resultado. Como contrapartida, el repositorio no incluye resultados de benchmarks, no declara idiomas soportados, no registra descargas ni interacciones y no aporta evaluacion de seguridad, por lo que debe tratarse como artefacto de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de lenguaje + torre de vision), heredada del modelo base Qwen2.5-VL-7B-Instruct; la model card no detalla la arquitectura |
| Parametros totales | Clase 7B segun el identificador del modelo. La model card no indica cifra exacta; el modelo base declara aproximadamente 8,3 mil millones de parametros en su documentacion publica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base Qwen2.5-VL-7B-Instruct declara hasta 128.000 tokens de contexto |
| Tipos de cuantizacion | No especificados por el autor. Al publicarse pesos safetensors estandar, admiten cuantizacion posterior (INT8, INT4, GPTQ, AWQ, GGUF), no verificada en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoints fusionados en formato HuggingFace) |
| Checkpoint publicado | global_step_162 (2 epocas, semilla 1, torre de vision descongelada) |
| Brazos incluidos | A1-7B-uvit (GRPO), A3-7B-uvit (VPPO), A4-7B-uvit (PRPO + RVD) |
| Dataset de RL | ViRL39K (Geo3K deduplicado) |
| Hiperparametros de RL | lr 1e-6, batch global 128, rollout 384 x n8, recorte DAPO 0,2/0,28, perdida a nivel de token, respuesta maxima 2048 tokens |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL-7B-Instruct: un transformer multimodal con torre de vision que procesa imagenes y video junto con texto, mas un decodificador de lenguaje autorregresivo. La model card de este repositorio no describe componentes internos (tipo de atencion, resolucion dinamica, codificacion temporal), por lo que la unica informacion verificable es que se trata de un derivado directo del base y que la torre de vision no permanecio congelada durante el RL. Ese detalle importa porque habilita cambios en la representacion visual, algo que las recetas con vision congelada no pueden producir.

El entrenamiento consistio en un estudio multi-brazo controlado sobre ViRL39K, un subconjunto deduplicado de Geo3K orientado a razonamiento visual sobre figuras geometricas. Los tres brazos comparten el mismo presupuesto de optimizacion (162 pasos, batch global 128, 384 rollouts con n=8, learning rate 1e-6, recorte DAPO 0,2/0,28, perdida a nivel de token y limite de 2048 tokens por respuesta) y solo cambian la funcion de recompensa o el mecanismo de asignacion de credito: A1 usa GRPO con recompensa de precision binaria, A3 usa VPPO con asignacion de credito basada en dependencia visual y A4 usa PRPO combinado con RVD. El brazo A0 (base sin modificar) no se incluye en el repositorio y debe descargarse por separado desde el repositorio oficial de Qwen. No se documentan detalles sobre composicion exacta del dataset, numero de tokens vistos, fases de SFT previas ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento multimodal: al derivar de Qwen2.5-VL-7B-Instruct, conserva la capacidad de responder a instrucciones que combinan imagen y texto.
- Razonamiento geometrico y matematico sobre figuras: el RL se realizo sobre ViRL39K, derivado de Geo3K, por lo que el sesgo de entrenamiento apunta a problemas de geometria con diagramas.
- Procesamiento de imagenes de entrada: la torre de vision esta descongelada, de modo que el modelo puede haber adaptado su representacion visual a la tarea de recompensa.
- Capacidades multilingues: no disponibles. La model card no declara idiomas y el entrenamiento de RL se realizo sobre un dataset presumiblemente en ingles.
- Tool calling y function calling: no documentado en la model card. El modelo base si lo soporta, pero no hay confirmacion de que se preserve tras el RL.
- Comportamiento agentico y razonamiento multi-paso: no documentado. El limite de 2048 tokens por respuesta durante el RL sugiere cadenas de razonamiento acotadas.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponibles.
- Ajuste a preferencias humanas: no. El entrenamiento usa recompensas automaticas de precision sobre un dataset de geometria; no hay RLHF con anotadores humanos ni DPO.

## Casos de uso

- Reproduccion de estudios comparativos de RL: los tres brazos (A1, A3, A4) comparten receta e hiperparametros, lo que permite aislar el efecto del objetivo de RL sin confundirlo con diferencias de datos o de presupuesto de optimizacion. Es el uso principal para el que se publican.
- Investigacion en asignacion de credito con dependencia visual: el brazo A3 implementa VPPO, orientado a medir cuanto contribuye la imagen a la respuesta correcta; util para estudiar atajos de modalidad (responder sin mirar la figura).
- Ablacion de recompensas binarias: A1 usa recompensa de precision binaria, un punto de partida sencillo para comparar con objetivos mas elaborados y medir si la ganancia justifica la complejidad.
- Estudio de PRPO y RVD: A4 combina ambas tecnicas, por lo que sirve para analizar su comportamiento conjunto frente a GRPO y VPPO puros.
- Razonamiento geometrico asistido: dada una figura con datos numericos, el modelo puede producir un razonamiento paso a paso y una respuesta final; adecuado para prototipos de tutoria en geometria, siempre con supervision humana.
- Punto de partida para ajuste fino por dominio: al estar en safetensors y bajo Apache-2.0, puede usarse como inicializacion en un pipeline propio de SFT o RL sobre un dominio especifico.
- Evaluacion de robustez ante variaciones visuales: al tener la torre de vision descongelada, resulta util para medir sensibilidad a cambios de resolucion, recorte o ruido en la imagen.
- Analisis de olvido catastrofico: comparar cada brazo con el base A0 en tareas generales permite cuantificar cuanto rendimiento general se pierde tras 162 pasos de RL sobre un unico dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K, MathVista, MMMU ni de ninguna otra evaluacion, ni tampoco resultados sobre el propio ViRL39K o Geo3K de los brazos A1, A3 y A4 frente al base A0. No es posible, por tanto, verificar si el RL mejora al modelo base ni cuantificar el coste en capacidades generales.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 16-17 GB solo para pesos (base de aproximadamente 8,3 mil millones de parametros) y 20-24 GB contando activaciones y cache KV; las imagenes de alta resolucion incrementan el pico de memoria de activaciones.
- VRAM estimada en INT8: aproximadamente 9-10 GB de pesos, con margen para contexto e imagenes.
- VRAM estimada en INT4: aproximadamente 5-6 GB de pesos, la opcion mas viable en GPUs de gama media.
- GPUs de datacenter recomendadas: A100 (40 o 80 GB), H100 (80 GB) y L40S (48 GB) para bf16 con contexto amplio y batch alto.
- GPUs de consumo: RTX 4090 y RTX 3090 (24 GB) pueden ejecutar bf16 con contexto y resolucion de imagen moderados; RTX 4080 y RTX 4070 Ti Super (16 GB) quedan para INT8 o INT4. En GPUs de 8-12 GB solo es realista INT4 con contexto reducido.
- Opciones de despliegue: vLLM y SGLang (soportan la familia Qwen2.5-VL), TGI, y Transformers como referencia. llama.cpp, Ollama y LM Studio requieren una ruta GGUF; el soporte de vision en esa ruta puede ser parcial segun la version, por lo que conviene verificarlo antes de usarla en produccion.
- Latencia y throughput: no disponibles. Dependen de la cuantizacion, la resolucion de imagen y el backend; no hay mediciones publicadas para estos checkpoints.

## Comparativa con modelos similares

Comparativa interna entre los brazos publicados y el base (unica comparacion con datos disponibles en la informacion proporcionada):

| Modelo | Objetivo de RL | Dataset | Pasos | Vision tower | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| A0 (base Qwen2.5-VL-7B-Instruct) | Sin RL | No aplica | No aplica | Congelada (original) | apache-2.0 | Repositorio oficial de Qwen |
| A1-7B-uvit | GRPO, recompensa de precision binaria | ViRL39K | 162 | Descongelada | apache-2.0 | Incluido en este repositorio |
| A3-7B-uvit | VPPO (credito por dependencia visual) | ViRL39K | 162 | Descongelada | apache-2.0 | Incluido en este repositorio |
| A4-7B-uvit | PRPO + RVD | ViRL39K | 162 | Descongelada | apache-2.0 | Incluido en este repositorio |

Alternativas de la misma categoria (VLM de aproximadamente 7-8 mil millones de parametros) como Qwen2.5-VL-7B-Instruct, InternVL2.5-8B o Llama-3.2-11B-Vision: no disponible la comparacion de rendimiento, porque no hay ninguna cifra de benchmark publicada para estos brazos, ni parametros, contexto o licencia declarados en la model card mas alla de la licencia Apache-2.0.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un modelo alineado con preferencias humanas. El entrenamiento usa recompensas automaticas de precision sobre geometria, sin RLHF ni DPO, por lo que no hay garantia de comportamiento seguro o util fuera del dominio.
- Sin evaluacion publicada: no hay benchmarks en la model card, de modo que la mejora frente al base A0 no esta demostrada con datos.
- Riesgo de sobreajuste al dominio: 162 pasos de RL sobre ViRL39K (Geo3K deduplicado) pueden degradar capacidades generales fuera del razonamiento geometrico; conviene medir el olvido catastrofico contra el base antes de reutilizar los checkpoints.
- Riesgo de alucinacion: inherente a los modelos vision-lenguaje. Una recompensa binaria de precision no penaliza respuestas incorrectas pero fluidas ni asegura fidelidad a la imagen.
- Atajos de modalidad: es un riesgo conocido en razonamiento visual; el brazo A3 (VPPO) esta disenado precisamente para atacarlo, lo que sugiere que los otros brazos pueden ser mas propensos a ignorar la imagen.
- Torrre de vision descongelada: los pesos visuales difieren del base, por lo que no cabe esperar un comportamiento identico en tareas puramente visuales ni en modelos derivados que asuman un encoder original.
- Limite de respuesta: durante el RL la respuesta maxima fue de 2048 tokens, lo que puede traducirse en cadenas de razonamiento mas cortas de lo deseable en problemas complejos.
- Idiomas y contexto: no declarados. El soporte multilingue no puede asumirse y la ventana efectiva de contexto no esta documentada para estos checkpoints.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece ninguna garantia ni evaluacion de seguridad; la responsabilidad de validar el modelo en produccion recae en quien lo despliega.
- Sesgos: no evaluados. No hay analisis de sesgos demograficos, culturales o de representacion en la model card.
- Validacion por la comunidad: el repositorio registra 0 descargas y 0 interacciones, y los checkpoints corresponden a una unica semilla (semilla 1), por lo que no hay estimacion de varianza entre ejecuciones.
- Empaquetado: los tres brazos viven en un mismo repositorio en subcarpetas; es necesario usar patrones de descarga selectiva (`allow_patterns`) para obtener un unico brazo y evitar descargar el conjunto completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ahsanz/virl39k-qwen25vl-7b-arms
- Modelo base (A0) en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct

Nota: la busqueda web asociada a este modelo no devolvio enlaces relevantes; los resultados obtenidos correspondian a paginas no relacionadas con el modelo, por lo que no se incluyen. No se han encontrado en la informacion proporcionada enlaces a papers, blogs tecnicos, repositorios de codigo ni demos.
