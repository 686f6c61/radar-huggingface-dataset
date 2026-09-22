# kaimaia/laya-pt-es-typed

## Resumen

Laya PT/ES Typed Decisions es un checkpoint de clasificación de texto desarrollado por el usuario kaimaia, obtenido mediante ajuste fino del modelo base convaiinnovations/laya-multilingual. No es un modelo generativo: reutiliza la arquitectura de encoder mmBERT de 322 millones de parámetros (321.908.998 exactos) y la especializa para devolver decisiones tipadas —selección entre opciones, puntuación ordinal y probabilidad sí/no— en una única pasada forward. Su publicación cubre un hueco poco habitual: los clasificadores de intención que devuelven etiquetas y probabilidades calibradas con latencias de milisegundos, sin coste de decodificación autoregresiva.

El modelo está entrenado exclusivamente para portugués y español, con licencia Apache-2.0, pesos en safetensors y un tamaño de repositorio de 0,7 GB. Incorpora tres primitivas definidas por el SDK de Laya: `choice` (elige una clave de un objeto de criterios definido en tiempo de ejecución), `score` (devuelve una puntuación ordinal sobre una lista de criterios) y `noul` (probabilidad entre 0 y 1 para una afirmación de sí/no). Las preguntas y los criterios se especifican en cada llamada, por lo que el mismo checkpoint sirve para tareas de clasificación distintas sin reentrenamiento.

Su relevancia práctica está en el binomio rendimiento/latencia: declara una accuracy de 0,8073 y un Brier score de 0,1111 sobre una muestra fija de 384 decisiones, con 18,25 ms de mediana y 18,69 ms de p95 en una A100-40GB. Frente al modelo base sin ajustar (0,3620 de accuracy) y frente a TypeSafe Jev (0,7396), el autor lo posiciona como alternativa para enrutado y triaje en producción, aunque con la advertencia explícita de que el benchmark cubre solo cuatro flujos de negocio sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT (encoder transformer), heredada de convaiinnovations/laya-multilingual |
| Parametros totales | 321.908.998 (aproximadamente 322 M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors |
| Idiomas soportados | Portugues (pt) y espanol (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Libreria de inferencia | laya (SDK propio, `pip install laya`) |
| Salida | Decisiones tipadas y probabilidades en una sola pasada forward; no genera texto |
| Modelo base | convaiinnovations/laya-multilingual |
| Dataset de entrenamiento | LocalLLaMA/typed-decisions (revision ea9306458d6e9563628369a3d1e72e362fb381d2) |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint conserva la arquitectura mmBERT del modelo base, un encoder transformer de 322 M de parámetros, sin añadir ningún componente de inferencia adicional y sin capacidad de generación de texto. La entrada es un `state` textual acompañado de preguntas tipadas, y la salida son respuestas y probabilidades tipadas en un único forward pass. El ajuste se realizó con actualizaciones de modelo completo (full-model updates), sin LoRA, siguiendo la receta oficial RLCD de Laya.

El entrenamiento tuvo dos etapas. La primera entrenó una trayectoria durante 4, 8 y 16 épocas sobre decisiones tipadas en portugués y español, y la validación seleccionó el checkpoint de 8 épocas; el corpus de partida fue LocalLLaMA/typed-decisions, traducido con Qwen/Qwen3-4B-Instruct-2507, preservando tipos de tarea, criterios, etiquetas, objetivos suaves, identificadores de caso y agrupaciones de split. La segunda etapa continuó el checkpoint seleccionado durante dos épocas sobre 2.099 ejemplos difíciles en pt/es (827 de `choice`, 998 de `score` y 274 de `noul`), derivados de texto procedente de los corpus de audio públicos Common Voice 22.0 y Multilingual LibriSpeech, con decisiones generadas por Qwen/Qwen3-30B-A3B-Instruct-2507 y filtradas mediante validación por consenso. La función objetivo combinó RLCD y entropía cruzada, con cuatro perturbaciones, recompensa logarítmica más esférica y un calendario de ruido lineal de 0,4 a 0,1. La calibración se ajustó mediante temperature scaling por tipo de pregunta y número de opciones, usando 1.160 decisiones de validación.

## Capacidades

- Clasificación por elección (`choice`): selecciona una clave de un objeto de criterios definido en tiempo de ejecución, con las opciones y sus descripciones aportadas en la propia llamada.
- Puntuación ordinal (`score`): devuelve una puntuación sobre una lista ordenada de criterios proporcionada en tiempo de ejecución.
- Decisión binaria con probabilidad (`noul`): devuelve una probabilidad entre 0 y 1 para una afirmación de sí/no.
- Probabilidades calibradas: temperature scaling ajustado por tipo de pregunta y número de opciones, con un ECE declarado de 0,0271.
- Multilingüe limitado a portugués y español, con instrucciones y criterios que deben redactarse en el mismo idioma que el texto de entrada.
- Inferencia de una sola pasada, sin decodificación autoregresiva, con latencia declarada en el rango de decenas de milisegundos.
- No genera texto libre, no admite audio (el proyector de audio del ecosistema Laya no está incluido) y no se documenta soporte de tool calling ni de razonamiento multi-paso.

## Casos de uso

- Triaje de tickets de atención al cliente: definir un `choice` con los departamentos disponibles (facturación, técnico, otros) y clasificar cada mensaje entrante con el mismo criterio en portugués y español. Es adecuado porque el mismo modelo cubre ambos idiomas sin duplicar infraestructura y devuelve la etiqueta en una sola pasada.
- Priorización por urgencia: usar la primitiva `score` con criterios como baja, media y alta para ordenar una cola de casos en función de la puntuación ordinal devuelta, sin necesidad de un modelo generativo.
- Detección de intenciones explícitas: usar `noul` para comprobar afirmaciones como «el cliente ha pedido un estorno» o «el cliente solicita cancelar el contrato», con una probabilidad entre 0 y 1 que puede umbralizarse en el flujo de negocio.
- Enrutado en tiempo real en contact centers: la latencia declarada (18,25 ms de mediana y 18,69 ms de p95 en A100-40GB, batch 1) permite insertar el clasificador en línea dentro de un pipeline de mensajería sin añadir una espera perceptible, siempre que la ventana de contexto sea suficiente para el texto de entrada.
- Etiquetado de feedback de clientes en pipelines ETL: clasificar encuestas, reseñas y correos en portugués y español con etiquetas definidas en tiempo de ejecución, de modo que el equipo pueda cambiar los criterios sin reentrenar el modelo.
- Moderación y clasificación de contenido sensible: con ECE declarado de 0,0271, las probabilidades de `noul` son utilizables para fijar umbrales de revisión humana y derivar solo los casos dudosos a un revisor.
- Anotación asistida con human-in-the-loop: preetiquetar grandes volúmenes de documentos pt/es para que los anotadores solo corrijan, aprovechando que las decisiones y los criterios se definen por llamada y no requieren reentrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (métricas no verificadas por un tercero). La comparación usa 384 decisiones reservadas del split de test de `LocalLLaMA/typed-decisions`, con 64 ejemplos por celda de idioma y tarea (portugués y español; `choice`, `score` y `noul`). La latencia p50/p95 de TypeSafe incluye tiempo de red; la latencia local se midió con 48 llamadas en caliente con batch size 1 en un worker Modal A100-40GB.

| Modelo | Accuracy | PT | ES | Choice | Score | Noul | Brier | ECE | Score MAE | p50 / p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Laya PT/ES | 0,8073 | 0,8021 | 0,8125 | 0,7969 | 0,7891 | 0,8359 | 0,1111 | 0,0271 | 0,2327 | 18,25 / 18,69 ms |
| Laya multilingual (base) | 0,3620 | 0,3646 | 0,3594 | 0,2891 | 0,2734 | 0,5234 | 0,2709 | 0,0820 | 0,7670 | 18,67 / 19,23 ms |
| TypeSafe Jev | 0,7396 | 0,7708 | 0,7083 | 0,6484 | 0,7578 | 0,8125 | 0,1413 | 0,0577 | 0,3681 | 358,88 / 439,78 ms |

Métricas globales reportadas en el model-index para este checkpoint: accuracy 0,8072916666666666 y Brier score 0,11105663198708271. El autor indica que las métricas completas, los identificadores de muestra, el protocolo de latencia y las puertas de comparación están en `evaluation_results.json`.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada aritméticamente a partir de los 321.908.998 parámetros): aproximadamente 1,3 GB en fp32, 0,65 GB en fp16/bf16, 0,32 GB en int8 y 0,16 GB en int4. No se documentan cuantizaciones publicadas, por lo que estas cifras son estimaciones de peso, no configuraciones soportadas oficialmente.
- Al tratarse de un encoder de 322 M de parámetros, cabe con holgura en cualquier GPU de consumo actual (por ejemplo RTX 3060, 4060, 4090) e incluso en CPU para cargas de baja concurrencia.
- GPU de referencia en las mediciones del autor: A100-40GB en un worker de Modal, con batch size 1 y 48 llamadas en caliente.
- Latencia declarada: 18,25 ms de mediana y 18,69 ms de p95 en la configuración anterior; no se publica throughput ni comportamiento con batching.
- Despliegue: la vía documentada es el SDK de Laya (`pip install laya` y `laya.load(...)`). No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia, y el repositorio no publica pesos GGUF.
- La longitud de contexto soportada no está especificada, por lo que conviene validarla empíricamente antes de fijar el tamaño máximo de los textos de entrada.

## Comparativa con modelos similares

La model card solo ofrece comparación con el modelo base y con TypeSafe Jev; no se proporcionan parámetros, contexto ni licencia de las alternativas.

| Modelo | Parametros | Idiomas | Accuracy (384 decisiones) | Brier | ECE | Latencia p50 | Licencia |
|---|---|---|---|---|---|---|---|
| Laya PT/ES Typed Decisions | 321.908.998 | pt, es | 0,8073 | 0,1111 | 0,0271 | 18,25 ms | Apache-2.0 |
| Laya multilingual (base) | No disponible | Multilingue | 0,3620 | 0,2709 | 0,0820 | 18,67 ms | Apache-2.0 |
| TypeSafe Jev | No disponible | No disponible | 0,7396 | 0,1413 | 0,0577 | 358,88 ms (incluye red) | No disponible |

El checkpoint supera al modelo base en todas las métricas reportadas y a TypeSafe Jev en accuracy, Brier, ECE y latencia, dentro del protocolo descrito por el autor.

## Limitaciones y advertencias

- Solo acepta texto: no procesa audio directamente, ya que el proyector de audio del ecosistema no está incluido en este repositorio.
- El benchmark se limita a cuatro flujos de negocio sintéticos y a 384 decisiones; no demuestra rendimiento en dominios ajenos a esos flujos ni con textos largos.
- La primitiva `score` es, según el propio autor, la peor calibrada de las tres (accuracy 0,7891 y MAE 0,2327 en el conjunto de evaluación).
- Cobertura lingüística restringida a portugués y español; no hay datos sobre comportamiento en otros idiomas.
- Las etiquetas de la segunda etapa de entrenamiento se generaron con Qwen/Qwen3-30B-A3B-Instruct-2507 y se filtraron por consenso, lo que introduce dependencia de los sesgos y errores del generador.
- Las métricas del model-index figuran como no verificadas (`verified: false`) y el repositorio registra 0 descargas y 0 likes, por lo que no existe validación externa conocida.
- Discrepancia de identificador: el ejemplo de código de la model card carga `frankyy03/laya-pt-es-typed`, mientras que el repositorio analizado es `kaimaia/laya-pt-es-typed`. Conviene verificar qué checkpoint se está cargando en producción.
- Licencia del checkpoint Apache-2.0, apta para uso comercial, pero los datos de origen incluyen componentes con condiciones propias (Common Voice 22.0 bajo CC0-1.0 y Multilingual LibriSpeech bajo CC-BY-4.0), con requisitos de atribución recogidos en `ATTRIBUTIONS.md` y `provenance.json`.
- No se especifica la longitud de contexto soportada, lo que impide dimensionar con precisión entradas largas sin pruebas previas.
- No hay soporte documentado de generación de texto, tool calling ni razonamiento multi-paso; cualquier flujo que requiera texto libre necesita un modelo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaimaia/laya-pt-es-typed
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de decisiones tipadas: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Modelo de traduccion: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Generador de decisiones: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Corpus Common Voice 22.0: https://huggingface.co/datasets/fsicoli/common_voice_22_0
- Corpus Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- Ficheros de resultados y procedencia citados en la model card (no se publica URL directa): `evaluation_results.json`, `stage1_training_result.json`, `stage2_training_result.json`, `training.json`, `rl_agent_config.json`, `ATTRIBUTIONS.md`, `provenance.json`
- SDK de Laya: se instala con `pip install laya`; no se ha encontrado URL oficial en la informacion disponible.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; el unico resultado obtenido (WhatsApp Web) no guarda relacion con esta ficha.
