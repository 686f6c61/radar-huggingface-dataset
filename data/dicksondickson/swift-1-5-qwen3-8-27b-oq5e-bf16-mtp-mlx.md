# dicksondickson/Swift-1.5-Qwen3.8-27b-oQ5e-bf16-mtp-MLX

## Resumen

dicksondickson/Swift-1.5-Qwen3.8-27b-oQ5e-bf16-mtp-MLX es una cuantizacion de 5 bits del modelo ukisai/Swift-1.5-Qwen3.8-27b, un modelo de lenguaje de aproximadamente 27.800 millones de parametros (~27,8 B) derivado de la familia Qwen3. El autor de la cuantizacion es el usuario de Hugging Face dicksondickson, que la ha generado con la herramienta oQ de oMLX (version 0.7.3.dev2) mediante cuantizacion de precision mixta con matriz de importancia (imatrix) y la variante "Better Low-Bit oQ". El resultado es un conjunto de pesos en formato MLX, pensado para ejecucion nativa en Apple Silicon.

La relevancia de esta publicacion es practica: permite ejecutar en hardware de Apple un modelo de ~27,8 B con una huella de memoria reducida respecto a los pesos originales en bf16, manteniendo los tensores considerados criticos en bf16. El repositorio ocupa 60,9 GB, lo que refleja que no se trata de una cuantizacion uniforme de 5 bits sobre todos los tensores, sino de una mezcla de precisones. La model card indica que los tensores importantes se dejan en bf16 para chips Apple M3 y posteriores, mientras que los equipos M1/M2 deben usar la variante fp16.

No se dispone de informacion publicada sobre la arquitectura interna exacta, el dataset de entrenamiento, los idiomas soportados ni los resultados de benchmarks del modelo base ni de esta cuantizacion. La licencia declarada es MIT, lo que facilita el uso comercial, aunque conviene verificar las condiciones del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como qwen3_5 / qwen en Hugging Face) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits con precision mixta (oQe de oMLX), tensores criticos en bf16; existe variante fp16 para M1/M2 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Tamano del repositorio | 60,9 GB |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b |
| Herramienta de cuantizacion | oQ (oMLX 0.7.3.dev2) con imatrix y Better Low-Bit oQ |
| Descargas / likes | 281 / 2 |
| Fecha de creacion / actualizacion | 2026-09-29 / 2026-10-25 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base ukisai/Swift-1.5-Qwen3.8-27b en la informacion disponible. Las etiquetas de Hugging Face lo asocian a la familia Qwen3 (tags qwen, qwen3.8, qwen3_5), y el recuento real de parametros en safetensors es de 27.781.427.952. No se especifica si se trata de un transformer denso o de una arquitectura con mezcla de expertos, ni el numero de capas, dimensiones ocultas o cabezas de atencion.

Tampoco hay datos sobre el proceso de entrenamiento: numero de tokens, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineacion. Lo unico documentado es el proceso de cuantizacion: se aplico oQ de oMLX 0.7.3.dev2 con matriz de importancia (imatrix) y precision mixta, dejando en bf16 los tensores de mayor impacto en la calidad. El sufijo "mtp" del nombre del repositorio sugiere multi-token prediction, pero la model card no lo confirma ni lo describe.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3 de ~27,8 B; no hay evaluacion publicada especifica de esta cuantizacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Ejecucion nativa en Apple Silicon mediante MLX, con soporte de cuantizacion mixta y tensores bf16 para M3 y posteriores.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y la cuantizacion mixta permiten cargar un modelo de ~27,8 B en equipos con memoria unificada suficiente, sin depender de GPUs dedicadas ni de servicios en la nube.
- Prototipado y experimentacion en estaciones de trabajo Apple: investigadores que trabajan en macOS pueden evaluar un modelo de escala media-alta de la familia Qwen3 con un coste de memoria menor que los pesos bf16 completos.
- Desarrollo de asistentes de texto privados: al ejecutarse en local, los datos no salen del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Generacion y revision de codigo en local: el tamano del modelo (~27,8 B) es compatible con tareas de programacion, aunque no hay benchmarks publicados que lo confirmen para esta cuantizacion.
- Fine-tuning o adaptacion posterior: al distribuirse en safetensors con licencia MIT, puede servir como punto de partida para ajustes, siempre que la herramienta de destino soporte el formato MLX o se convierta.
- Evaluacion comparativa de tecnicas de cuantizacion: util para medir el impacto de oQe con precision mixta frente a cuantizaciones uniformes de 4 y 5 bits del mismo modelo base.
- Despliegue en pipelines de investigacion sobre macOS: integrable en scripts Python con la libreria mlx para tareas por lotes de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 60,9 GB, por lo que se necesita un Mac con al menos ~64 GB de memoria unificada para cargar los pesos; el pico real durante la inferencia puede ser superior por el contexto y las activaciones.
- GPU recomendadas: Apple Silicon M3 o posteriores para la variante bf16; Apple M1/M2 deben usar la variante fp16 indicada por el autor.
- Cabe en GPU de consumo: no aplica directamente, ya que el formato es MLX para Apple Silicon; no se documenta soporte para GPUs NVIDIA o AMD.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx) y la libreria mlx. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| dicksondickson/Swift-1.5-Qwen3.8-27b-oQ5e-bf16-mtp-MLX | ~27,8 B | no disponible | MLX safetensors, 5 bits mixto | MIT | Cuantizacion para Apple Silicon |
| ukisai/Swift-1.5-Qwen3.8-27b | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Alternativas de la familia Qwen3 de ~27-32 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento, contexto o calidad con alternativas concretas.

## Limitaciones y advertencias

- La cuantizacion de 5 bits con precision mixta puede degradar la calidad respecto a los pesos bf16 originales; no hay evaluaciones publicadas que cuantifiquen esa perdida.
- El modelo esta empaquetado en formato MLX y depende de oMLX; no es portable directamente a otros runtimes sin conversion.
- La variante bf16 esta pensada para Apple M3 y posteriores; en M1/M2 hay que usar la variante fp16, lo que puede cambiar el consumo de memoria y el rendimiento.
- No se documentan sesgos, tasas de alucinacion ni comportamiento multilingue del modelo base.
- Aunque la licencia declarada es MIT, conviene revisar la licencia y condiciones del modelo base ukisai/Swift-1.5-Qwen3.8-27b antes de un uso comercial.
- El autor indica que el 24 de octubre de 2026 se recuantizo el modelo con oMLX 0.7.3.dev2; las copias descargadas antes de esa fecha pueden diferir.
- No hay informacion sobre el pipeline de la tarea ni sobre los idiomas soportados, lo que limita la planificacion de despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dicksondickson/Swift-1.5-Qwen3.8-27b-oQ5e-bf16-mtp-MLX
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Repositorio de oMLX: https://github.com/jundot/omlx
- Herramienta oQ (referenciada en la model card): https://github.com/jundot/omlx
