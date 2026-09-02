# alwoolley/Qwen3-4B-bnb-8bit

## Resumen

Qwen3-4B-bnb-8bit es una cuantización de 8 bits del modelo Qwen3-4B de Alibaba, publicada por el usuario alwoolley en Hugging Face. La cuantización se realiza con la librería bitsandbytes, empleando una técnica de preservación de outliers de 16 bits con un umbral de 6.0, lo que permite conservar la precisión en los valores extremos de las activaciones y pesos. El resultado es un modelo que mantiene las capacidades del Qwen3-4B original (razonamiento, generación de código, matemáticas y soporte multilingüe) a la vez que reduce los requisitos de memoria para su ejecución.

El modelo base Qwen3-4B es un transformer denso de 4.022 millones de parámetros con una ventana de contexto de 128K tokens, desarrollado por Alibaba Cloud. Incluye un modo de pensamiento híbrido (thinking y non-thinking) que permite alternar entre razonamiento profundo y respuestas rápidas. Esta versión cuantizada resulta especialmente útil para desplegar el modelo en hardware con VRAM limitada, como GPUs de consumo, sin sacrificar excesivamente la calidad de las respuestas. Aunque la licencia declarada es "other", el modelo base se distribuye bajo Apache 2.0, por lo que se recomienda verificar los términos exactos en el repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3, causal LM) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | 8-bit (bitsandbytes) con preservacion de outliers de 16 bits (umbral 6.0) |
| Idiomas soportados | No especificado en la model card; el modelo base Qwen3-4B soporta multiples idiomas (chino, ingles, espanol, frances, aleman, ruso, japones, coreano, etc.) |
| Licencia | other (verificar terminos; el modelo base usa Apache 2.0) |
| Formato de pesos | Safetensors (8-bit cuantizado) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantizacion post-entrenamiento del modelo Qwen3-4B original. El modelo base es un transformer denso con atencion full (no MoE) que incorpora la arquitectura Qwen3, la cual introduce un mecanismo de modo hibrido: el modelo puede operar en modo "thinking" (generacion de cadenas de razonamiento antes de la respuesta final) o en modo "non-thinking" (respuesta directa), conmutable mediante un token de control especial.

La cuantizacion se ha realizado con bitsandbytes en precision de 8 bits, aplicando un esquema de preservacion de outliers con umbral 6.0. Este umbral hace que los valores absolutos superiores a 6.0 se mantengan en precision de 16 bits (bfloat16) mientras que el resto se cuantiza a 8 bits, reduciendo la degradacion en tareas que dependen de valores extremos. No se ha realizado ningun ajuste fino adicional ni entrenamiento sobre esta version cuantizada; las capacidades y limitaciones son heredadas directamente del modelo base.

## Capacidades

- Generacion de texto y razonamiento de proposito general, con modo hibrido thinking/no-thinking que permite controlar la profundidad del razonamiento.
- Soporte de codigo en multiples lenguajes de programacion (Python, Java, C++, JavaScript, etc.) gracias al entrenamiento del modelo base en datos de codigo.
- Matematicas y resolucion de problemas logicos con cadenas de razonamiento.
- Capacidades multilingues: el modelo base fue entrenado con datos en mas de 30 idiomas, incluyendo espanol, chino, ingles, frances, aleman y otros.
- Tool calling / function calling: el modelo base Qwen3-4B soporta llamadas a funciones y puede integrarse en flujos de agentes.
- Ventana de contexto larga de 128K tokens, adecuada para documentos extensos o conversaciones multi-turno con historial amplio.
- No se detectan capacidades de vision, audio o multimodalidad en esta version; es exclusivamente texto.

## Casos de uso

- Asistentes de atencion al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128K tokens), lo que permite mantener el historial completo de una interaccion sin truncamientos. La cuantizacion 8-bit reduce el coste de despliegue en entornos con multiples instancias.
- Generacion de codigo en entornos de desarrollo: al soportar tool calling, puede integrarse en IDEs o pipelines de CI/CD para autocompletar, revisar o documentar codigo. Su tamano reducido permite ejecutarse en estaciones de trabajo con GPU de gama media.
- Analisis y resumen de documentos legales o tecnicos: la ventana de 128K permite procesar contratos, informes o articulos extensos en una sola pasada, produciendo resumenes o extrayendo clausulas relevantes.
- Chatbots internos de empresa: desplegable en infraestructura propia con VRAM moderada (6-8 GB), ofreciendo respuestas en espanol y otros idiomas sin depender de APIs externas.
- Educacion y tutoria: el modo thinking puede explicar paso a paso la resolucion de problemas matematicos o de programacion, util para plataformas de aprendizaje automatico.
- Prototipado rapido de agentes de IA: su compatibilidad con function calling y su bajo coste de inferencia lo convierten en una opcion para experimentar con arquitecturas de agentes antes de escalar a modelos mayores.
- Procesamiento de datos financieros (segun la etiqueta "financial-tape" del repositorio): puede utilizarse para extraer y estructurar informacion de informes financieros o cintas de transacciones, aunque no hay documentacion adicional que confirme un entrenamiento especifico para este dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version cuantizada (alwoolley/Qwen3-4B-bnb-8bit) en la informacion disponible. El modelo base Qwen3-4B, sin cuantizar, ha reportado resultados en evaluaciones como MMLU, HumanEval y GSM8K, pero no se dispone de cifras oficiales en los materiales consultados. Se recomienda consultar la documentacion oficial de Qwen3 para obtener datos comparativos del modelo original y tener en cuenta que la cuantizacion 8-bit puede introducir una degradacion minima (tipicamente inferior al 1-2% en tareas estandar).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo cuantizado a 8 bits ocupa aproximadamente 4 GB en memoria (4.022 millones de parametros x 1 byte por parametro mas overhead). Con la ventana de contexto completa (128K tokens) y el modo thinking, se recomienda al menos 8 GB de VRAM para evitar desbordamientos.
- GPU recomendadas: RTX 3060 12GB, RTX 4070, RTX 4090, A10, A100 (cualquier GPU con 8 GB o mas de VRAM). En CPUs con suficiente RAM tambien es viable mediante llama.cpp.
- Cabe en GPUs de consumo: si, en tarjetas con 8 GB o mas (por ejemplo, RTX 3070/4060 Ti 8GB, RTX 3080 10GB, etc.) con limitaciones en la longitud de contexto.
- Opciones de despliegue: vLLM, llama.cpp (conversion a GGUF), Ollama (si se convierte previamente), Hugging Face Transformers con bitsandbytes, TGI (Text Generation Inference).
- Latencia y throughput estimados: no se han publicado mediciones especificas. Como referencia, un modelo de 4B en 8-bit en una RTX 4090 puede alcanzar entre 50 y 100 tokens por segundo en generacion autoregresiva, dependiendo de la implementacion y el tamaño del batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alwoolley/Qwen3-4B-bnb-8bit | 4.0B | 128K | 8-bit bnb | other | Hugging Face |
| Qwen3-4B (original) | 4.0B | 128K | FP16/BF16 | Apache 2.0 | Hugging Face, Ollama |
| Llama-3.2-3B | 3.2B | 128K | FP16/GGUF | Llama 3.2 license | Hugging Face, Ollama |
| Phi-3-mini-4k | 3.8B | 4K | FP16/GGUF | MIT | Hugging Face, Ollama |

La principal diferencia de esta version cuantizada frente al original es la reduccion de memoria (de ~8 GB en FP16 a ~4 GB en 8-bit) a costa de una perdida minima de precision. Comparado con Llama-3.2-3B, Qwen3-4B ofrece un contexto mas largo (128K vs 128K, similar) y mejor rendimiento en tareas de codigo y matematicas segun las evaluaciones publicas del modelo base. Phi-3-mini tiene un contexto mucho menor (4K) y esta orientado a tareas mas ligeras. La licencia "other" de esta cuantizacion puede ser un factor limitante frente a las alternativas con licencias mas permisivas.

## Limitaciones y advertencias

- La cuantizacion 8-bit puede introducir ligeras imprecisiones en tareas que requieren alta precision numerica, como calculos cientificos o generacion de codigo con dependencias exactas.
- El modelo base puede presentar sesgos sociales y culturales heredados de sus datos de entrenamiento; no se ha realizado una evaluacion especifica de sesgos en esta version cuantizada.
- Riesgo de alucinacion en contextos donde la informacion no esta bien representada en los datos de entrenamiento; se recomienda verificar las salidas en aplicaciones criticas.
- La licencia "other" no especifica los terminos exactos en la model card; es necesario revisar la licencia del modelo base Qwen3-4B (Apache 2.0) y cualquier restriccion adicional impuesta por el autor de la cuantizacion antes de un uso comercial.
- No se garantiza el soporte de herramientas o function calling en todos los backends de inferencia; es necesario verificar la compatibilidad con la implementacion utilizada.
- El modelo no es multimodal; no procesa imagenes, audio ni video.
- La ventana de contexto de 128K es una capacidad del modelo base, pero el uso prolongado con contextos muy largos puede degradar la calidad de las respuestas y aumentar la latencia significativamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alwoolley/Qwen3-4B-bnb-8bit
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Coleccion de Qwen3 de unsloth (formatos GGUF y cuantizaciones): https://huggingface.co/collections/unsloth/qwen3
- Especificaciones y requisitos de VRAM de Qwen3-4B (apxml.com): https://apxml.com/models/qwen3-4b
- Benchmarks y comparativas de Qwen3 (dev.to): https://dev.to/best_codes/qwen-3-benchmarks-comparisons-model-specifications-and-more-4hoa
- Pagina de Qwen3:4b en Ollama: https://ollama.com/library/qwen3:4b
