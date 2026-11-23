# Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit

## Resumen

DeepSeek-R1-Distill-Qwen-14B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo DeepSeek-R1-Distill-Qwen-14B, publicada por Outlier-Ai. El modelo original es un destilado de DeepSeek-R1 sobre la base Qwen2-14B, desarrollado por DeepSeek para transferir capacidades de razonamiento explícito (chain-of-thought) a un transformer denso de tamano medio. Esta conversión no altera los pesos subyacentes: solo cambia el formato en disco a safetensors MLX 4-bit con grupo de cuantización de 64 y simetría, para que pueda ejecutarse de forma nativa en Apple Silicon mediante la librería `mlx-lm`.

El interés practico de esta ficha es que permite ejecutar un modelo de razonamiento de 14.770.033.664 parametros en un Mac con memoria unificada, sin GPU dedicada y sin conexión a la nube. El repositorio ocupa 8,3 GB, lo que lo hace viable en equipos con 16 GB o mas de memoria unificada. Mantiene la licencia MIT del modelo base y declara soporte para diez idiomas (ingles, chino, frances, espanol, portugues, aleman, ruso, japones, coreano y arabe).

La relevancia actual radica en la combinacion de tres factores: un modelo de razonamiento con modo "thinking" explicito, una cuantización agresiva a 4 bits que reduce el peso a menos de la mitad del original en BF16, y un runtime (MLX) optimizado para el hardware de Apple. Es una pieza util para prototipado local, entornos con requisitos de privacidad estrictos y evaluacion de modelos de razonamiento sin coste de inferencia en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) con destilación de razonamiento de DeepSeek-R1 |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2-14B; consultar la model card de DeepSeek) |
| Tipos de cuantizacion | MLX 4-bit, grupo de 64, simetrica (solo esta variante en el repo) |
| Idiomas soportados | en, zh, fr, es, pt, de, ru, ja, ko, ar |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX 4-bit), shards multiples; incluye `config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso Qwen2 de aproximadamente 14.770 millones de parametros, sobre el que DeepSeek aplico un proceso de destilacion desde DeepSeek-R1. En la destilacion, el modelo grande de razonamiento actua como profesor y genera trazas de chain-of-thought que el modelo alumno aprende a reproducir, de modo que el modelo destilado adquiere patrones de razonamiento explicito sin necesidad de un entrenamiento RL a gran escala. El resultado es un modelo que, ante consultas complejas, produce primero un bloque de pensamiento y despues la respuesta final.

Esta conversión concreta de Outlier-Ai no modifica ni reentrena los pesos: solo los repaqueta en formato MLX 4-bit safetensors con grupo de cuantización de 64 y cuantización simetrica, compatible con `mlx-lm` 0.31.x. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO del modelo original; esos datos deben consultarse en la model card de `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B`.

## Capacidades

- Generacion de texto y razonamiento explicito con modo "thinking" (chain-of-thought) antes de la respuesta final.
- Razonamiento matematico y resolucion de problemas verbales, logicos y de tipo grid.
- Generacion y comprension de codigo, con soporte declarado de function calling / tool calling en las etiquetas del repositorio.
- Conversacion multi-turno con plantilla de chat propia (`chat_template.jinja`).
- Capacidades multilingues en diez idiomas: ingles, chino, frances, espanol, portugues, aleman, ruso, japones, coreano y arabe.
- Ejecucion totalmente local y offline en Apple Silicon, sin llamadas a API ni telemetria de nube.
- Integracion con `mlx-lm` tanto por CLI como por API de Python.

## Casos de uso

- Razonamiento matematico local: el modelo puede resolver problemas verbales y demostraciones paso a paso en un Mac, util para docencia, tutoria o validacion de ejercicios sin enviar datos a un servicio externo.
- Asistente de codigo privado: con soporte de function calling y plantilla de chat, puede integrarse en un IDE o script local para autocompletar, explicar y refactorizar codigo manteniendo el codigo fuente dentro de la maquina.
- Prototipado de agentes con razonamiento multi-paso: el modo thinking permite encadenar pasos intermedios antes de invocar herramientas, adecuado para pruebas de concepto de agentes en entornos controlados.
- Analisis de documentos sensibles: al ejecutarse offline, permite procesar textos confidenciales (legal, sanitario, financiero) sin salir del dispositivo, siempre que se respete la ventana de contexto del modelo base.
- Evaluacion comparativa de destilados de razonamiento: sirve como referencia local para medir la calidad de un modelo de 14B destilado frente a alternativas mas grandes o mas pequenas en la misma familia.
- Educacion e investigacion en PLN: util para estudiar el comportamiento de modelos con chain-of-thought en hardware de consumo, sin coste de GPU en la nube.
- Automatizacion de tareas de oficina en macOS: resumen, reescritura y extraccion de informacion en varios idiomas desde una app de escritorio o scripts con `mlx-lm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversión concreta. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tokens por segundo en Macs de la serie M, pero esos datos no se incluyen en el material proporcionado y no deben reproducirse sin verificacion.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 8,3 GB en disco; en ejecucion, la memoria necesaria es algo superior por el estado del runtime, el KV cache y los buffers de MLX. Se recomienda un minimo de 16 GB de memoria unificada para contexto corto y 24 GB o mas para contextos largos o uso concurrente.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 en sus variantes base, Pro, Max y Ultra). No es compatible con CUDA ni con GPUs de NVIDIA o AMD.
- Cabe en GPU de consumo: si, en Macs con 16 GB o mas de memoria unificada; en equipos de 8 GB no es recomendable.
- Opciones de despliegue: `mlx-lm` (CLI y Python), app Outlier para macOS (descarga gratuita, con tiers gratuitos y Pro de pago), y cualquier runtime compatible con MLX. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual (esos runtimes requieren formatos GGUF o safetensors estandar, no MLX 4-bit).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del chip (M1 vs M4 Max), del contexto y de la longitud de la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-14B-MLX-4bit (este) | 14,77B | no disponible | MLX 4-bit safetensors | MIT | Hugging Face, app Outlier |
| DeepSeek-R1-Distill-Qwen-7B-MLX-4bit (Outlier-Ai) | ~7B | no disponible | MLX 4-bit safetensors | MIT | Hugging Face |
| DeepSeek-R1-Distill-Qwen-32B-MLX-4bit (Outlier-Ai) | ~32B | no disponible | MLX 4-bit safetensors | MIT | Hugging Face |
| DeepSeek-R1-Distill-Llama-8B-MLX-4bit (Outlier-Ai) | ~8B | no disponible | MLX 4-bit safetensors | MIT | Hugging Face |

La comparativa se limita a la familia de destilados de DeepSeek-R1 en formato MLX 4-bit publicados por el mismo autor, porque son las alternativas directamente intercambiables en el mismo runtime y hardware. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo hereda los sesgos y limitaciones del DeepSeek-R1-Distill-Qwen-14B original; no se han documentado mitigaciones especificas en esta conversión.
- Riesgo de alucinacion: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos, especialmente en dominios especializados o con contexto insuficiente.
- El modo thinking incrementa el numero de tokens generados y, por tanto, la latencia y el consumo de memoria; en contextos largos puede agotar la memoria unificada de equipos de 16 GB.
- La longitud de contexto no se especifica en la informacion proporcionada; debe consultarse en la model card del modelo base antes de disenar aplicaciones que dependan de ventanas largas.
- La cuantización a 4 bits puede degradar ligeramente la calidad frente al modelo original en BF16, especialmente en tareas de razonamiento fino o generacion de codigo.
- La licencia MIT permite uso comercial, pero se recomienda revisar la model card del modelo base para confirmar terminos y atribuciones.
- Compatibilidad limitada a Apple Silicon: no puede desplegarse en servidores con GPU NVIDIA/AMD ni en la mayoria de plataformas cloud sin una conversion adicional a otro formato.
- El repositorio es una conversión de terceros (Outlier-Ai), no una publicacion oficial de DeepSeek; la responsabilidad sobre la calidad de la cuantización recae en el autor de la conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Benchmarks del autor de la conversion: https://outlier.host/benchmarks
- App Outlier para macOS: https://outlier.host/
- Conversion hermana 7B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Conversion hermana 32B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-32B-MLX-4bit
- Conversion hermana Llama-8B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit
- Outlier-Core-27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
