# EvidenceGuard-Experiments/evidenceguard

## Resumen

EvidenceGuard es un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por EvidenceGuard-Experiments, disenado especificamente para responder preguntas de opcion multiple ceñidas estrictamente a un contexto proporcionado. Su comportamiento clave es que, cuando el contexto no contiene informacion suficiente para decidir la respuesta, el modelo selecciona la opcion que indica "informacion insuficiente" si esta disponible. No es un modelo de chat general, sino un clasificador de decisiones de un solo paso hacia delante (single forward pass) sin generacion de razonamiento.

El modelo se entrena sobre grupos de decision de EvidenceGuard: cada grupo contiene una pregunta base y variantes controladas (parafrasis, reordenacion de opciones, adiciones irrelevantes que no deben cambiar la respuesta y ediciones decisivas que si deben cambiarla). Un grupo se considera resuelto solo si todas sus variantes se responden correctamente, lo que mide consistencia ademas de precision. El repositorio ocupa 0,4 GB y contiene unicamente los pesos del adaptador PEFT en formato safetensors.

La relevancia actual del modelo reside en su enfoque de evaluacion por consistencia y en su rendimiento en el conjunto de test propio (86,5% de preguntas correctas, 77,6% de grupos completamente correctos), superando a APIs de decision y LLMs con razonamiento en ese conjunto. Sin embargo, su ventaja no se traslada a dominios no vistos, donde empata con APIs de decision y queda por detras de modelos con razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.8-27B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.8-27B tiene 27B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el base admite bfloat16 en el ejemplo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

EvidenceGuard es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.8-27B, un transformer decoder-only de 27.000 millones de parametros. El adaptador se carga con la libreria PEFT y modifica el modelo base para la tarea de seleccion de opcion multiple. No se especifica el rango del LoRA, el numero de parametros entrenables ni la composicion exacta del dataset de entrenamiento, que el autor indica que aun no es publico.

El entrenamiento se realiza sobre grupos de decision de EvidenceGuard. Cada grupo consta de una pregunta base mas variantes controladas: parafrasis, reordenacion de opciones, adiciones irrelevantes (la respuesta no debe cambiar) y ediciones decisivas (la respuesta debe cambiar). La metrica de exito es estricta: un grupo se considera resuelto solo si todas sus variantes se contestan correctamente. La inferencia no genera texto: se leen los logits en la primera posicion de respuesta para cada letra de opcion (maximo sobre los tokens `"A"` y `" A"`), se aplica softmax sobre las K opciones con una temperatura de calibracion de 1,9433390039063905 (fichero `calibration.json`) y se devuelve la distribucion de probabilidad. El prompt usa una plantilla de chat con `enable_thinking=False`.

## Capacidades

- Respuesta a preguntas de opcion multiple (2 a 8 opciones) estrictamente basadas en un contexto proporcionado.
- Deteccion de informacion insuficiente: selecciona la opcion "informacion insuficiente" cuando el contexto no decide la respuesta.
- Consistencia ante variaciones controladas: parafrasis, reordenacion de opciones y adiciones irrelevantes no alteran la respuesta.
- Salida calibrada como distribucion de probabilidad sobre las opciones (softmax con temperatura de calibracion).
- Inferencia de un solo paso hacia delante, sin generacion de razonamiento ni cadena de pensamiento.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado; el modelo esta disenado para una unica decision).
- Capacidades multilingues limitadas al ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Moderacion de contenido basada en politicas: dado un contexto de normas y una pregunta sobre si un contenido las infringe, el modelo elige la opcion correspondiente y puede indicar informacion insuficiente cuando el caso no esta cubierto, reduciendo falsos positivos.
- Triaje de tickets de soporte: con el historial del ticket como contexto y opciones de categoria o prioridad, el modelo clasifica en un solo paso con latencia baja (unos 0,12 s por pregunta en una H200), adecuado para volumen alto.
- Verificacion de cumplimiento normativo: en dominios como legal o seguros, el modelo puede seleccionar entre opciones de cumplimiento o no cumplimiento a partir de un fragmento de normativa, aunque su rendimiento en dominios no vistos es limitado y requiere validacion humana.
- Evaluacion automatizada de respuestas: dado un contexto de referencia y opciones de calidad, el modelo puntua respuestas de forma consistente, util para pipelines de evaluacion de otros modelos.
- Clasificacion de documentos con evidencia: con un fragmento de documento como contexto, el modelo selecciona la opcion correcta sobre campos o categorias, y senala insuficiencia cuando el fragmento no contiene la informacion.
- Filtrado de preguntas ambiguas en encuestas: el modelo detecta cuando una pregunta no puede responderse con el contexto disponible y la marca para revision, mejorando la calidad de datos recogidos.
- Decisiones binarias o de opcion multiple en entornos de baja latencia: al no generar razonamiento, es adecuado para servicios que requieren respuestas en milisegundos y no pueden permitirse el coste de un LLM generativo.

## Benchmarks y rendimiento

### Conjunto de test EvidenceGuard (4.984 preguntas en 878 grupos)

| Modelo | Tipo | Preguntas correctas | Grupos completamente correctos |
|---|---|---|---|
| EvidenceGuard (este modelo) | fine-tuned, single pass | 86,5% | 77,6% |
| Jev 1.14 | decision API | 84,9% | 73,5% |
| GLM 5.3 | LLM con razonamiento | 85,5% | 68,8% |
| DeepSeek V4 Pro | LLM | 78,4% | 54,7% |
| GPT-6 Luna Decisions | decision API | 75,8% | 50,9% |
| Perplexity Decider v1.2 | decision API | 72,7% | 35,5% |

### Dominios nuevos no entrenados (1.122 preguntas en 187 grupos: legal, seguridad IT, seguros y RRHH)

| Modelo | Tipo | Preguntas correctas | Grupos completamente correctos |
|---|---|---|---|
| GLM 5.3 | LLM con razonamiento | 94,0% | 71,1% |
| EvidenceGuard (este modelo) | fine-tuned, single pass | 75,8% | 31,0% |
| Perplexity Decider v1.2 | decision API | 75,1% | 32,1% |
| Jev 1.14 | decision API | 71,4% | 31,0% |
| GPT-6 Luna Decisions | decision API | 76,5% | 28,3% |
| DeepSeek V4 Pro | LLM | 63,2% | 11,8% |

### System1-Arena (209 tareas, 13 dominios no agenticos)

| Modelo | Tipo | Precision |
|---|---|---|
| Jev 1.14 | decision API | 73,8% |
| EvidenceGuard (este modelo) | fine-tuned, single pass | 73,3% |
| Qwen 3.8 27B sin entrenar | modelo base | 71,0% |
| GPT-6 Luna Decisions | decision API | 68,0% |

Latencia mediana de aproximadamente 0,12 s por pregunta con batch size 1 en una GPU H200. Los modelos API se invocaron a traves de OpenRouter.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,4 GB, pero requiere cargar el modelo base Qwen3.8-27B. En bfloat16, el base de 27B necesita aproximadamente 54 GB de VRAM (sin cuantizar). Con cuantizacion a 8 bits, en torno a 27 GB; a 4 bits, en torno a 14-16 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: el autor reporta pruebas en una H200. Para bfloat16 se requieren GPU de 80 GB (A100, H100, H200) o varias GPU con `device_map="auto"`. Con cuantizacion podria caber en una RTX 4090 (24 GB) a 4 bits, aunque no esta documentado.
- Cabe en GPU consumer: posiblemente en RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantizacion a 4 bits del modelo base; no confirmado.
- Opciones de despliegue: transformers con PEFT (ejemplo oficial), vLLM (si soporta adaptadores LoRA sobre el base), llama.cpp/Ollama solo si se convierte el base a GGUF y se aplica el adaptador (no documentado). El ejemplo oficial usa `transformers` y `peft`.
- Latencia y throughput: latencia mediana de 0,12 s por pregunta en H200 con batch size 1. Throughput no documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento (test EvidenceGuard) |
|---|---|---|---|---|---|
| EvidenceGuard | LoRA sobre 27B | No disponible | Apache 2.0 | Hugging Face (adaptador) | 86,5% preguntas / 77,6% grupos |
| Jev 1.14 | No disponible (API) | No disponible | No disponible (API) | API de decision | 84,9% / 73,5% |
| GLM 5.3 | No disponible | No disponible | No disponible | LLM con razonamiento | 85,5% / 68,8% |
| DeepSeek V4 Pro | No disponible | No disponible | No disponible | LLM | 78,4% / 54,7% |

En dominios nuevos, GLM 5.3 supera ampliamente a EvidenceGuard (94,0% frente a 75,8% en preguntas), mientras que en System1-Arena EvidenceGuard (73,3%) queda ligeramente por debajo de Jev 1.14 (73,8%) y por encima del base sin entrenar (71,0%).

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en ingles y en preguntas de opcion multiple de 2 a 8 opciones; no es un modelo de chat general.
- Su ventaja en el conjunto de test propio no se traslada a dominios no vistos: alli empata con APIs de decision y queda muy por detras de modelos con razonamiento (31,0% de grupos completamente correctos frente a 71,1% de GLM 5.3).
- Las etiquetas de evaluacion de los dominios nuevos provienen de tres modelos de razonamiento y aun estan siendo revisadas manualmente, por lo que los resultados en esos dominios son provisionales.
- Los datos de entrenamiento no son publicos, lo que limita la reproducibilidad y el analisis de sesgos.
- Riesgo de alucinacion: aunque el diseno busca ceñirse al contexto, el modelo puede seleccionar opciones no respaldadas por el contexto en casos ambiguos; la metrica de grupos completamente correctos (77,6% en test) indica que aproximadamente uno de cada cuatro grupos tiene al menos una variante fallida.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene su propia licencia que debe verificarse por separado.
- No soporta tool calling, agentes ni razonamiento multi-paso; su uso esta acotado a decisiones de un solo paso.
- El prompt requiere seguir estrictamente la plantilla de chat con `enable_thinking=False` y la temperatura de calibracion de 1,9433390039063905; desviarse de esta configuracion puede degradar la calibracion.

## Enlaces

- Hugging Face: https://huggingface.co/EvidenceGuard-Experiments/evidenceguard
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- System1-Arena (benchmark externo): https://github.com/TianyuCodings/S1-Arena
