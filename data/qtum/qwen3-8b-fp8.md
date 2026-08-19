# qtum/Qwen3-8B-FP8

## Resumen

Qwen3-8B-FP8 es una cuantizacion FP8 (W8A8 dynamic) del modelo Qwen3-8B de Alibaba, producida por qtum mediante la herramienta llm-compressor de vLLM. El checkpoint se distribuye en formato compressed-tensors con safetensors, lo que permite una integracion directa en motores de inferencia como vLLM o SGLang sin necesidad de flags adicionales, ya que el esquema de cuantizacion se declara en el config.json.

El modelo base Qwen3-8B es un transformer autoregresivo de 8.190 millones de parametros con una ventana de contexto de 40.000 tokens, entrenado para tareas de generacion de texto, razonamiento, codigo y matematicas en ingles y chino. La version FP8 reduce aproximadamente a la mitad el tamano en memoria respecto al formato bf16 original, manteniendo una calidad cercana a la del modelo sin cuantizar, lo que la convierte en una opcion atractiva para despliegues en produccion con GPUs Hopper o Blackwell, donde la aritmetica FP8 es nativa.

La relevancia de este checkpoint radica en que ofrece una alternativa lista para servir con vLLM y SGLang, con menor huella de memoria y mayor throughput, manteniendo la licencia Apache-2.0 heredada del modelo base. Es una opcion practica para equipos que ya utilizan Qwen3-8B y buscan reducir costes de inferencia sin reentrenar ni modificar el pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (optimizado) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 40.000 tokens |
| Tipos de cuantizacion | FP8 (W8A8 dynamic) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3-8B emplea una arquitectura transformer autoregresiva estandar, optimizada para tareas de lenguaje general. No se trata de un modelo de mezcla de expertos (MoE), sino de un modelo denso con todos los parametros activos en cada inferencia. El entrenamiento original cubrio un corpus multilingue centrado en ingles y chino, con capacidades destacadas en generacion de texto, razonamiento, codigo y matematicas.

La cuantizacion FP8 aplicada por qtum utiliza el esquema W8A8 dynamic, donde tanto los pesos como las activaciones se representan en punto flotante de 8 bits, con escalas dinamicas calculadas en tiempo de ejecucion. Este metodo, implementado con llm-compressor, esta disenado para ser casi sin perdidas respecto al modelo en bf16, reduciendo el tamano de los pesos a la mitad. El formato compressed-tensors permite que el esquema de cuantizacion se declare en el config.json y sea detectado automaticamente por motores compatibles como vLLM y SGLang, sin necesidad de argumentos adicionales en el comando de despliegue.

## Capacidades

- Generacion de texto y conversacion multilingue en ingles y chino, con formato de chat ChatML (`<|im_start|>`, `<|im_end|>`).
- Razonamiento y resolucion de problemas en tareas de logica, matematicas y comprension lectora.
- Generacion de codigo en multiples lenguajes de programacion, con capacidad para explicar y depurar fragmentos.
- Soporte de ventana de contexto de 40.000 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Compatible con tool calling y function calling, aunque el modelo base no incluye un modo de thinking explicito como otras variantes de Qwen3.
- Integracion directa con vLLM y SGLang para despliegue en produccion con alto throughput.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en ingles y chino con contexto largo (hasta 40.000 tokens), lo que permite mantener el historial completo de una interaccion sin truncamientos. Su formato ChatML facilita la integracion en sistemas de chatbot existentes.
- Generacion de codigo en produccion: con capacidades de generacion y explicacion de codigo, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests unitarios o documentar APIs. La cuantizacion FP8 reduce la latencia y el coste por peticion en entornos de alta demanda.
- Analisis de documentos extensos: la ventana de 40.000 tokens permite procesar contratos, informes tecnicos o articulos cientificos completos, extrayendo resumenes, respondiendo preguntas o identificando clausulas relevantes.
- Asistente de programacion local: al ocupar aproximadamente 9,5 GB en disco y requerir unos 16 GB de VRAM en FP8, puede ejecutarse en estaciones de trabajo con una RTX 4090 o similar, ofreciendo asistencia de codigo sin depender de servicios en la nube.
- Traduccion y transcripcion de contenido bilingue: al estar entrenado principalmente en ingles y chino, es adecuado para tareas de traduccion entre ambos idiomas, asi como para normalizar y reformular texto en contextos empresariales.
- Educacion y tutoria: puede actuar como tutor virtual explicando conceptos de programacion, matematicas o ciencias, adaptando las respuestas al nivel del estudiante y manteniendo el contexto de la conversacion durante sesiones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la cuantizacion FP8 es "casi sin perdidas" respecto al modelo base, pero no proporciona metricas concretas de MMLU, HumanEval, GSM8K u otros tests estandar. Para una evaluacion cuantitativa, se recomienda consultar la ficha tecnica del modelo base Qwen3-8B en el repositorio oficial de Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP8 con contexto de 40.000 tokens, incluyendo pesos, KV cache y activaciones. Con cuantizaciones adicionales como Q4_K_M, el requisito puede reducirse a unos 5 GB, aunque ese formato no esta incluido en este checkpoint.
- GPU recomendadas: NVIDIA H100, A100, RTX 4090, RTX 6000 Ada o cualquier GPU con soporte nativo FP8 (Hopper o Blackwell). En GPUs sin soporte FP8, el motor puede emular la aritmetica, pero con menor rendimiento.
- Compatibilidad con GPU de consumo: si, una RTX 4090 con 24 GB de VRAM puede ejecutar el modelo en FP8 con margen para contexto largo. Tarjetas con 16 GB (RTX 4080, RTX 4070 Ti) tambien son viables, aunque con limitaciones en la longitud del contexto.
- Opciones de despliegue: vLLM y SGLang son los motores recomendados, ya que detectan automaticamente el esquema compressed-tensors. Tambien es posible usar llama.cpp u Ollama si se convierte el modelo a formato GGUF, aunque no es el formato nativo de este checkpoint.
- Latencia y throughput: no se han publicado mediciones especificas para este checkpoint. En general, la cuantizacion FP8 en GPUs Hopper puede duplicar el throughput respecto a bf16, con una latencia por token inferior al 10 % en la mayoria de los casos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-8B (base) | 8,19 B | 40.000 | bf16 | Apache-2.0 | safetensors |
| qtum/Qwen3-8B-FP8 | 8,19 B | 40.000 | FP8 W8A8 | Apache-2.0 | compressed-tensors |
| nvidia/Qwen3-8B-FP8 | 8,19 B | 40.000 | FP8 (TensorRT) | Apache-2.0 | TensorRT-LLM |

La principal diferencia entre las dos versiones FP8 es la herramienta de cuantizacion: qtum utiliza llm-compressor con formato compressed-tensors, mientras que NVIDIA emplea TensorRT Model Optimizer. Ambos checkpoints son compatibles con vLLM, pero el de qtum es mas generico al usar un formato estandar abierto. El modelo base en bf16 ocupa aproximadamente el doble de memoria, por lo que la version FP8 es preferible en entornos con VRAM limitada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base puede reflejar sesgos presentes en sus datos de entrenamiento, predominantemente en ingles y chino. No se han realizado evaluaciones especificas de sesgo para este checkpoint cuantizado.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en temas especializados o de actualidad. La cuantizacion FP8 no altera significativamente este comportamiento.
- Limitaciones de idioma: el modelo esta optimizado para ingles y chino; su rendimiento en otros idiomas es limitado y no se recomienda para produccion en lenguas fuera de este par.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificacion, pero es necesario mantener la atribucion y los avisos de licencia. No hay restricciones adicionales conocidas.
- Caveat de produccion: aunque la cuantizacion FP8 es casi sin perdidas, se recomienda validar el rendimiento en el caso de uso concreto antes de desplegar en produccion, especialmente en tareas que requieren alta precision numerica o razonamiento complejo.
- El checkpoint no incluye un modo de thinking explicito como otras variantes de Qwen3; para tareas de razonamiento avanzado puede ser necesario usar prompting cuidadoso o modelos alternativos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qtum/Qwen3-8B-FP8
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Version FP8 de NVIDIA: https://huggingface.co/nvidia/Qwen3-8B-FP8
- Documentacion de llm-compressor: https://github.com/vllm-project/llm-compressor
- Guia de despliegue con vLLM: https://docs.vllm.ai/en/latest/
- Analisis de VRAM y compatibilidad: https://nodepedia.com/models/qwen3-8b-fp8/
