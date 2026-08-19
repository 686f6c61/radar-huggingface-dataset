# canbingol/Qwen2.5-3B-Instruct-tool-call-en-mixed_data

## Resumen

Este modelo es un ajuste fino (fine-tune) de Qwen/Qwen2.5-3B-Instruct, desarrollado por el usuario canbingol, orientado específicamente a la llamada a herramientas (tool calling) en inglés. Se entrenó mediante aprendizaje supervisado (SFT) utilizando la librería TRL de Hugging Face, sobre un conjunto de datos mixto. El objetivo es mejorar la capacidad del modelo base para invocar funciones externas de forma estructurada y fiable, un requisito habitual en aplicaciones de agentes y asistentes conversacionales.

Al estar basado en Qwen2.5-3B, hereda la arquitectura transformer decoder-only de dicha familia, con 3 000 millones de parámetros y una ventana de contexto de 32 768 tokens (según las especificaciones públicas del modelo base). El repositorio tiene un tamaño de 0,9 GB, lo que sugiere pesos en precisión fp16 o bf16. La licencia no está especificada en la ficha del modelo, por lo que se debe consultar la del modelo base (Apache 2.0) con cautela.

Su relevancia radica en que ofrece una alternativa ligera y de bajo coste para integraciones de tool calling en entornos de producción donde no se dispone de GPUs de gran capacidad. No obstante, al ser un modelo reciente y con pocas descargas, su rendimiento y robustez aún no han sido validados por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-3B-Instruct) |
| Parametros totales | 3 000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (según modelo base) |
| Tipos de cuantizacion | no especificados; se puede aplicar cuantización GGUF/AWQ externa |
| Idiomas soportados | no especificados; entrenado para tool calling en inglés |
| Licencia | no disponible (la model card indica "license" sin detallar) |
| Formato de pesos | safetensors (según tags de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen2.5-3B-Instruct, que emplea una arquitectura transformer causal con atención de múltiples cabezas y normalización RMSNorm. No se trata de un modelo MoE ni híbrido; es un decoder puro. El entrenamiento se realizó con SFT (supervised fine-tuning) usando TRL, con un dataset mixto orientado a tool calling en inglés. No se especifican los datos exactos de entrenamiento, ni el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. La única innovación técnica destacable es la especialización en el formato de llamada a herramientas, que probablemente implica el ajuste de las plantillas de chat y los tokens especiales para funciones.

## Capacidades

- Generación de texto y diálogo conversacional en inglés, con razonamiento básico heredado del modelo base.
- Llamada a herramientas (tool calling): puede emitir invocaciones estructuradas a funciones externas, como consultas a APIs, bases de datos o motores de búsqueda.
- Soporte de agentes multi-paso: al poder encadenar llamadas a herramientas, puede participar en flujos de razonamiento que requieren acciones intermedias.
- Capacidades multilingües limitadas: aunque el fine-tune se centra en inglés, el modelo base Qwen2.5 soporta varios idiomas; el rendimiento fuera del inglés no está garantizado.
- No se indica soporte para visión, audio ni modos de pensamiento especiales (thinking mode).

## Casos de uso

- Asistentes virtuales con acceso a herramientas: el modelo puede gestionar peticiones del usuario, decidir qué función invocar (por ejemplo, obtener el tiempo, buscar vuelos) y formatear la respuesta con los resultados.
- Automatización de tareas de back-office: integrado en un sistema de tickets, puede extraer datos de un CRM mediante una llamada a API y actualizar registros.
- Chatbots de atención al cliente: combina generación de respuestas con consultas a bases de conocimiento externas a través de tool calling, reduciendo alucinaciones.
- Agentes de generación de código: puede invocar funciones de un entorno de ejecución para probar fragmentos de código y devolver el resultado al usuario.
- Orquestación de pipelines de datos: dado un comando en lenguaje natural, el modelo puede llamar a scripts o funciones de procesamiento y resumir la salida.
- Prototipado rápido de agentes: por su tamaño reducido, es adecuado para entornos de desarrollo y pruebas donde se necesita iterar rápidamente sin grandes costes de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de tool calling (como BFCL o API-Bank). Se recomienda realizar una evaluación propia con los conjuntos de datos de referencia antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 3B parámetros, en fp16 requiere aproximadamente 6 GB de VRAM; con cuantización de 4 bits (por ejemplo, GPTQ o AWQ) puede reducirse a unos 3 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para fp16 (RTX 3070, RTX 4060 Ti, A10); para cuantización, una RTX 3060 de 12 GB o incluso una GTX 1660 Super con 6 GB pueden ser suficientes.
- En consumer GPU: sí, cabe en GPUs de gama media y alta. En una RTX 4090 se puede ejecutar con margen y baja latencia.
- Opciones de despliegue: vLLM, llama.cpp (con GGUF), Ollama, TGI (Text Generation Inference) y Transformers de Hugging Face.
- Latencia y throughput: no se dispone de mediciones oficiales; para un modelo de 3B en una GPU moderna se espera una latencia de decodificación de 20-40 ms por token, y un throughput de 50-100 tokens por segundo en batch pequeño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3B | 32k | No nativo | Apache 2.0 | HuggingFace |
| canbingol/Qwen2.5-3B-Instruct-tool-call-en-mixed_data | 3B | 32k | Sí (fine-tune) | no disponible | HuggingFace |
| FireFunction-v1 | 3.9B | 32k | Sí | Apache 2.0 | HuggingFace |
| Gorilla-OpenFunctions-v2 | 7B | 8k | Sí | Apache 2.0 | HuggingFace |

No se dispone de comparativas de rendimiento publicadas entre estos modelos. La elección dependerá de la evaluación empírica en el caso de uso concreto.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tune del modelo base, puede heredar sesgos y generar contenido incorrecto cuando no se dispone de herramientas externas.
- Riesgo de tool calling incorrecto: la precisión de las llamadas a funciones no está validada; puede emitir argumentos malformados o invocar funciones equivocadas.
- Idioma: el fine-tune está orientado al inglés; el rendimiento en otros idiomas puede degradarse.
- Licencia no especificada: la model card indica "license" sin detallar; se debe contactar con el autor o asumir la licencia del modelo base (Apache 2.0) con precaución.
- Contexto largo: aunque el modelo base soporta 32k tokens, el fine-tune puede no haber sido entrenado con secuencias tan largas; se recomienda probar con contextos menores.
- Producción: al no haber benchmarks ni validación comunitaria, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canbingol/Qwen2.5-3B-Instruct-tool-call-en-mixed_data
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
