# schneewolflabs/Wichtelchen-Qwen3.5-9B-GGUF

## Resumen

Wichtelchen-Qwen3.5-9B-GGUF es una colección de cuantizaciones GGUF del modelo Wichtelchen-Qwen3.5-9B, desarrollado por el laboratorio schneewolflabs. Este modelo aplica la "receta de operador Wichtel" sobre la base Qwen3.5-9B, un transformer denso de aproximadamente 9.200 millones de parámetros con capacidades multimodales (imagen y texto). La propuesta principal es mejorar la delegación de tareas y el razonamiento multi-paso, con un resultado reportado de 10/10 en delegación y un 56,1% en el benchmark Hemlock (hembench).

El modelo se distribuye exclusivamente en formato GGUF para su uso con llama.cpp y herramientas compatibles, e incluye un archivo mmproj para el procesamiento de imágenes. Está pensado para desarrolladores que necesitan un modelo de 9B eficiente, con soporte de tool calling y decodificación especulativa, ejecutable en hardware de consumo. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (contexto nativo del modelo base; el ejemplo de servidor usa 8192) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (segun la model card; el modelo base podria soportar mas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Wichtelchen-Qwen3.5-9B es un fine-tuning del modelo Qwen3.5-9B, que emplea una arquitectura transformer densa con mecanismos de atencion optimizados y un vocabulario amplio. El termino "receta de operador Wichtel" sugiere un entrenamiento orientado a mejorar la capacidad del modelo para actuar como agente: delegar subtareas, usar herramientas y mantener razonamientos multi-paso. Los datos de entrenamiento no se detallan en la informacion disponible, pero el rendimiento reportado en hembench (56,1%) indica un enfoque en tareas de agente.

Una innovacion destacable es la inclusion de un "MTP head" (multi-token prediction) en el checkpoint, que permite decodificacion especulativa con llama.cpp mediante la opcion `--spec-type draft-mtp`. Esto reduce la latencia en inferencia sin sacrificar calidad. Ademas, el modelo es multimodal: el archivo mmproj adjunto habilita el procesamiento de imagenes, aunque la model card no especifica la arquitectura del codificador visual.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `image-text-to-text`).
- Soporte de tool calling y function calling, orientado a agentes autonomos.
- Razonamiento multi-paso y delegacion de tareas (puntuacion 10/10 en delegacion segun el autor).
- Capacidades de codigo (tag `code`).
- Procesamiento de imagenes (vision) mediante el modulo mmproj incluido.
- Decodificacion especulativa gracias al MTP head, que acelera la inferencia en llama.cpp.
- Multilingue limitado: la model card indica solo ingles, aunque el modelo base Qwen3.5 probablemente soporte otros idiomas.

## Casos de uso

- Asistentes de codigo en produccion: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar, revisar y refactorizar codigo, aprovechando su soporte de tool calling para invocar linters o ejecutar pruebas.
- Agentes autonomos de automatizacion: gracias a su capacidad de delegacion y razonamiento multi-paso, puede orquestar subtareas (busqueda web, llamadas a APIs) en entornos como n8n o LangChain.
- Chatbots de atencion al cliente: con 262K tokens de contexto, puede mantener conversaciones largas y recordar el historial completo; su licencia Apache 2.0 facilita el despliegue comercial.
- Analisis de documentos con imagenes: al ser multimodal, puede extraer informacion de capturas, diagramas o formularios escaneados, combinando texto e imagen en un mismo prompt.
- Educacion y tutoria: puede explicar conceptos, generar ejercicios y evaluar respuestas, con un tamano que permite ejecutarlo en portatiles con GPU moderada.
- Prototipado rapido de aplicaciones RAG: su contexto largo y su eficiencia en cuantizacion Q4_K_M lo hacen adecuado para pruebas locales con bases de conocimiento antes de escalar a modelos mayores.
- Asistentes de voz con baja latencia: la decodificacion especulativa reduce el tiempo de primera respuesta, util para interfaces conversacionales en tiempo real.

## Benchmarks y rendimiento

Solo se dispone de los datos publicados por el autor en la model card. No hay resultados comparativos con otros modelos en la informacion proporcionada.

| Benchmark | Resultado |
|---|---|
| Hemlock (hembench) | 56,1% |
| Delegacion | 10/10 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, el archivo ocupa aproximadamente 5-6 GB; con Q8_0, alrededor de 9-10 GB. Se recomienda al menos 8 GB de VRAM para Q4_K_M y 12 GB para Q8_0 con contexto moderado.
- GPUs recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, o GPUs profesionales como A10G o L4. Para contexto largo (262K tokens) se necesitaria mas de 24 GB, por lo que en consumer se recomienda limitar el contexto a 8-16K.
- Si cabe en consumer GPU: si, con Q4_K_M o Q5_K_M en tarjetas de 8-12 GB, siempre que el contexto se ajuste.
- Opciones de despliegue: llama.cpp y llama-server (recomendado por el autor), Ollama (si se importa el GGUF), LM Studio, y cualquier herramienta compatible con GGUF. vLLM no soporta GGUF directamente; habria que convertir a safetensors para usarlo.
- Latencia y throughput estimados: no disponibles. La decodificacion especulativa con MTP puede reducir la latencia entre un 20-40% en CPUs o GPUs, segun la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wichtelchen-Qwen3.5-9B-GGUF | 9,2B | 262K | Apache 2.0 | GGUF | Fine-tune orientado a agentes, multimodal, MTP |
| Qwen3.5-9B (base) | 9,2B | 262K | Apache 2.0 | safetensors, GGUF | Modelo base sin fine-tune especifico |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Modelo generalista, sin vision nativa |
| Mistral 7B v0.3 | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Mas ligero, menos contexto, sin vision |

La comparativa es estructural; no hay datos de rendimiento homogeneos para los modelos listados.

## Limitaciones y advertencias

- La model card solo documenta ingles; el rendimiento en otros idiomas no esta verificado y podria degradarse.
- El benchmark Hemlock es especifico del autor y no es un estandar ampliamente reconocido; el 56,1% no es comparable con MMLU o HumanEval.
- El fine-tune puede haber sacrificado capacidades generales del modelo base en favor de tareas de agente; se recomienda evaluar en el caso de uso concreto.
- El contexto nativo de 262K tokens es teorico; en hardware consumer con cuantizacion, el contexto util se reduce considerablemente por limitaciones de memoria.
- No hay informacion sobre sesgos o riesgos de alucinacion especificos de este modelo; como cualquier LLM, puede generar contenido incorrecto o tendencioso.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 podria tener condiciones adicionales (aunque en la busqueda aparece como Apache 2.0). Verificar los terminos de Qwen3.5 si se usa en produccion.
- El archivo mmproj para vision no esta documentado en detalle; se desconoce su calidad frente a modelos dedicados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/schneewolflabs/Wichtelchen-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/schneewolflabs/Wichtelchen-Qwen3.5-9B
- Qwen3.5-9B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
