# aibohphobia1/ScanAtlas-LFM2.5-350M-Planner-GGUF

## Resumen

ScanAtlas-LFM2.5-350M-Planner-GGUF es un ajuste fino (fine-tune) del modelo LiquidAI/LFM2.5-350M de Liquid AI, publicado por el usuario aibohphobia1. No se trata de un modelo de chat generalista, sino de un planificador de acciones especializado para el asistente en dispositivo de la aplicación ScanAtlas. El modelo espera el formato de prompt y la gramática JSON propias de la aplicación, por lo que su uso fuera de ese contexto no está previsto por el autor.

Técnicamente es un derivado del modelo base: se entrenó un LoRA sobre ejemplos de planificación de ScanAtlas, se fusionó con los pesos originales y el resultado se cuantizó a Q4_0 con llama.cpp (build b11799). El modelo cuenta con 354.483.968 parámetros y se distribuye en formato GGUF para su ejecución con llama.cpp, con un tamaño de repositorio de 0,2 GB.

Su relevancia radica en el nicho: demuestra un patrón de especialización extrema de modelos pequeños (350M) para tareas concretas de tool calling y planificación estructurada en 15 idiomas, ejecutables en dispositivo. La model card reporta 301 de 356 tareas superadas en PC con el pipeline de la aplicación, frente a 100 de 356 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LiquidAI/LFM2.5-350M) |
| Parametros totales | 354.483.968 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (unica publicada en el repositorio) |
| Idiomas soportados | 15 idiomas (segun la model card; lista concreta no disponible) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LiquidAI/LFM2.5-350M (no se confirma si es transformer denso, hibrido o SSM). Lo que si se documenta es el proceso de especializacion: se entrenó un adaptador LoRA sobre ejemplos de planificacion de la aplicacion ScanAtlas, se fusionó en los pesos del modelo base y posteriormente se cuantizó a Q4_0 mediante llama.cpp en la build b11799. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal no es arquitectonica sino de producto: el modelo esta condicionado al prompt y a una gramatica JSON especificos de la aplicacion, lo que restringe su salida a acciones estructuradas y lo convierte en un planificador determinista dentro de un pipeline de asistente en dispositivo. El conjunto de evaluacion consta de 356 tareas en 15 idiomas.

## Capacidades

- Planificacion de acciones para el asistente de ScanAtlas: genera planes en el formato JSON esperado por la aplicacion.
- Tool calling / function calling restringido al esquema de la aplicacion.
- Soporte multilingue: 15 idiomas segun la model card (lista no disponible).
- Ejecucion en dispositivo mediante llama.cpp y formato GGUF.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- Conversacional segun los tags del repositorio, aunque el autor advierte que no es un modelo de chat general.
- No se documentan capacidades de vision, audio, modo thinking ni razonamiento general fuera del dominio de la aplicacion.

## Casos de uso

- Asistente en dispositivo de ScanAtlas: el modelo recibe el prompt de la aplicacion y devuelve un plan de acciones en JSON; es su unico caso de uso previsto por el autor.
- Planificacion de acciones con salida estructurada: util como referencia de como un modelo de 350M puede restringirse a una gramatica JSON para producir salidas parseables sin postprocesado complejo.
- Procesamiento local sin conexion: al ejecutarse con llama.cpp en formato GGUF y ocupar 0,2 GB, es viable en dispositivos con recursos limitados cuando se necesita privacidad de datos.
- Evaluacion de tecnicas de especializacion: sirve como caso de estudio de fine-tune con LoRA fusionado y cuantizacion Q4_0 sobre un modelo base pequeno.
- Soporte multilingue en interfaces de voz o texto: el entrenamiento en 15 idiomas permite integrarlo en aplicaciones con usuarios de distintos idiomas, siempre dentro del esquema de la app.
- Prototipado de pipelines de agentes con modelos minimos: util para validar arquitecturas de planificacion antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | ScanAtlas-LFM2.5-350M-Planner | LiquidAI/LFM2.5-350M (base) |
|---|---|---|
| Tareas superadas (356 tareas, 15 idiomas, PC) | 301 | 100 |
| Evaluacion en telefono | no medida en esta build v2 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La evaluacion reportada es interna, sobre el pipeline de la aplicacion, y las tareas en idiomas distintos del ingles no han sido revisadas por hablantes nativos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_0 (repositorio de 0,2 GB); el modelo completo en precision original rondaria los 0,7 GB en FP16.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cualquier GPU consumer (incluidas integradas) es suficiente.
- Cabe en cualquier GPU consumer y en dispositivos moviles, dado su tamano.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, build b11799 o superior); Ollama y otros runners compatibles con GGUF segun disponibilidad.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card indica que esta build v2 aun no se ha medido en telefono.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ScanAtlas-LFM2.5-350M-Planner-GGUF | 354M | no disponible | LFM Open License v1.0 | GGUF (Q4_0) | Especializado en planificacion para ScanAtlas |
| LiquidAI/LFM2.5-350M | 350M (aprox.) | no disponible | LFM Open License v1.0 | safetensors (modelo base) | Modelo generalista del que deriva |
| Otros modelos de ~350M para tool calling | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la informacion |

La comparacion directa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; el unico punto de referencia documentado es el modelo base, sobre el que este ajuste mejora de 100 a 301 tareas superadas en la evaluacion interna.

## Limitaciones y advertencias

- No es un modelo de chat general: espera el prompt y la gramatica JSON de ScanAtlas; su uso fuera de ese pipeline producira resultados degradados.
- La evaluacion es interna y limitada: 356 tareas, sin revision por hablantes nativos de las tareas no inglesas.
- Esta build v2 no se ha medido en telefono; el rendimiento en dispositivo movil es desconocido.
- No se documentan sesgos conocidos, pero al derivar de un modelo base pequeno y de un dataset especifico, pueden aparecer sesgos del modelo original y del corpus de entrenamiento.
- Riesgo de alucinacion en la generacion de planes fuera de distribucion; la gramatica JSON restringe el formato pero no garantiza la correccion semantica.
- Licencia LFM Open License v1.0: es necesario revisar el archivo LICENSE del repositorio para confirmar las condiciones de uso comercial, que pueden incluir restricciones.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- Idiomas concretos no listados: solo se indica el numero (15), no cuales son.

## Enlaces

- Hugging Face: https://huggingface.co/aibohphobia1/ScanAtlas-LFM2.5-350M-Planner-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia (incluida en el repositorio): LICENSE
- llama.cpp: no se proporciona enlace en la informacion disponible
- Paper, blog o demo: no disponibles en la informacion proporcionada
