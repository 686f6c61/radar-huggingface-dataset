# ReliquaryForge/teutonic-rl-async-v1-step-00000110

## Resumen

Teutonic-RL-Async-v1-step-00000110 es un modelo de generacion de texto derivado de la linea Teutonic-I, un modelo preentrenado en la competicion abierta de mejora de modelos de Bittensor Subnet 3 (Teutonic). Sobre esa base, Reliquary (Bittensor Subnet 81) ha realizado un post-entrenamiento por destilacion supervisada desde un profesor Qwen3.8-27B, incorporando modo de razonamiento (thinking mode). El resultado es un checkpoint intermedio de un run de RL asincrono, identificado por el paso 110.

Tecnicamente, el modelo conserva la arquitectura hibrida de Teutonic-I: 32 capas, de las cuales 24 son capas gated-DeltaNet (un mecanismo de mezcla de tokens tipo SSM lineal) y 8 son capas de atencion softmax completa. Estas 8 capas de atencion fueron sustituidas por las de Qwen/Qwen3.5-9B-Base mediante un injerto de atencion y curadas con 50M tokens de texto plano, de modo que el modelo expone finalmente la arquitectura estandar `Qwen3_5ForCausalLM`. Cuenta con 8.953.803.264 parametros totales (8,6B segun la model card), vocabulario de 248.320 tokens, pesos en bfloat16 y entrenamiento a 64k de contexto.

Su relevancia actual es doble: por un lado, documenta un flujo poco habitual de reutilizacion de pesos (injerto de atencion sobre un backbone hibrido) que permite reaprovechar un modelo preentrenado con otra mezcla de capas; por otro, forma parte de un ecosistema de entrenamiento descentralizado (Bittensor) que publica checkpoints intermedios con licencia Apache-2.0, lo que facilita su inspeccion y reutilizacion por parte de investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` hibrida: 32 capas (24 gated-DeltaNet + 8 atencion softmax completa) |
| Parametros totales | 8.953.803.264 (8,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k tokens (entrenado a 64k) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `dendriteholdings/Teutonic-I`, preentrenado en Bittensor Subnet 3. Su backbone es hibrido: de las 32 capas, 24 usan gated-DeltaNet (mezcladores de tokens lineales con compuertas) y 8 usan atencion softmax completa. En un paso intermedio de la lineage, esas 8 capas de atencion (capas 3, 7, ..., 31) se sustituyeron por la atencion softmax de `Qwen/Qwen3.5-9B-Base` y se curaron entrenando unicamente esas capas sobre 50M tokens de texto plano; embeddings y MLPs permanecen los de Teutonic-I. El resultado adopta la arquitectura estandar `Qwen3_5ForCausalLM`, con vocabulario de 248.320 tokens y pesos en bfloat16.

El post-entrenamiento realizado por Reliquary consta de dos fases: primero, 1 epoca sobre la mezcla `full-v2` (4,47B tokens objetivo; matemáticas 38 %, codigo 25 %, ciencia 14 %, general 11 %, agentico 8,4 %) con learning rate 4e-5 y schedule coseno; despues, una pasada sobre 7.659 ejemplos de QA sobre documentos largos (documentos de 16k a 57k tokens, con preguntas y respuestas escritas por el profesor) mas 56M tokens objetivo de replay de `full-v2`, con learning rate 1e-5. El metodo es destilacion supervisada (SFT) desde Qwen3.8-27B, con modo de razonamiento activable mediante la plantilla de chat incluida en el repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia incluida en el repositorio.
- Razonamiento con modo thinking, heredado de la destilacion desde el profesor Qwen3.8-27B.
- Razonamiento matematico, reforzado por el 38 % de la mezcla de entrenamiento dedicado a matematicas.
- Generacion y comprension de codigo, con un 25 % de la mezcla de SFT orientada a codigo.
- Conocimiento cientifico, con un 14 % de la mezcla dedicada a ciencia.
- Capacidades agenticas, con un 8,4 % de la mezcla orientada a tareas agenticas y multi-step reasoning.
- QA sobre documentos largos: entrenado especificamente con ejemplos de documentos de 16k a 57k tokens.
- Contexto largo de hasta 64k tokens.
- Soporte de tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Capacidades multilingues: no disponible (los idiomas no estan documentados).
- Vision y audio: no disponible (el pipeline es exclusivamente text-generation).

## Casos de uso

- QA sobre documentacion tecnica extensa: el modelo se ha entrenado con 7.659 ejemplos de preguntas y respuestas sobre documentos de 16k a 57k tokens, por lo que es adecuado para responder preguntas sobre manuales, contratos o especificaciones que no caben en un contexto corto.
- Analisis de codigo en repositorios grandes: con 64k de contexto y un 25 % de la mezcla de SFT en codigo, puede recibir varios ficheros de un mismo modulo y razonar sobre dependencias, errores o refactorizaciones en una sola pasada.
- Resolucion de problemas matematicos paso a paso: el modo thinking y el 38 % de datos matematicos lo hacen util para asistencia en calculo simbolico, verificacion de derivaciones y explicacion de procedimientos.
- Asistente de razonamiento agentico: el 8,4 % de datos agenticos permite usarlo como planificador en pipelines multi-paso donde el modelo descompone una tarea en subtareas antes de ejecutar acciones.
- Generacion de resumenes cientificos: con el 14 % de datos de ciencia y contexto largo, puede condensar articulos o informes tecnicos conservando las cifras y relaciones entre secciones.
- Evaluacion e investigacion de entrenamiento descentralizado: al ser un checkpoint intermedio (paso 110) de un run de RL asincrono en Bittensor, sirve para estudiar la evolucion del modelo a lo largo del entrenamiento y comparar checkpoints de la misma linea.
- Base para fine-tuning posterior: al estar en safetensors, bfloat16 y licencia Apache-2.0, puede reutilizarse como punto de partida para ajustes especificos de dominio sin restricciones de licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para pesos (8,95B parametros x 2 bytes), mas KV cache y activaciones; en la practica se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB para pesos; en 4 bits, alrededor de 5-6 GB. Estas cifras son estimaciones a partir del numero de parametros, ya que no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para despliegue en bfloat16 con contexto largo; RTX 4090 (24 GB) puede alojar el modelo en bfloat16 con contexto limitado o en cuantizacion de 8 bits con mayor margen.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas en bfloat16 con contexto reducido, y en tarjetas de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada); vLLM y TGI son viables al exponer la arquitectura estandar `Qwen3_5ForCausalLM`, aunque no se documentan en la informacion disponible. Ollama y llama.cpp requeririan conversion a GGUF, que no se publica en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Teutonic-RL-Async-v1-step-00000110 | 8,95B | 64k | Hibrida (24 gated-DeltaNet + 8 atencion) | Apache-2.0 | Checkpoint intermedio de RL asincrono, destilado de Qwen3.8-27B |
| Qwen/Qwen3.5-9B-Base | ~9B | no disponible | Transformer denso | no disponible | Base del injerto de atencion; sin post-entrenamiento de razonamiento |
| dendriteholdings/Teutonic-I | no disponible | no disponible | Hibrida (gated-DeltaNet + atencion) | no disponible | Modelo preentrenado en Bittensor Subnet 3; origen de la lineage |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 110) de un run de RL asincrono, no una version final; su calidad puede variar respecto a checkpoints posteriores de la misma linea.
- Los idiomas soportados no estan documentados, por lo que no puede garantizarse un rendimiento adecuado fuera del ingles u otros idiomas presentes en la mezcla `full-v2`.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluacion de sesgos.
- Riesgo de alucinacion: no cuantificado; como modelo destilado con modo thinking, puede generar razonamientos plausibles pero incorrectos, especialmente en matematicas y ciencia.
- El soporte de tool calling y function calling no esta documentado, por lo que no debe asumirse en produccion sin verificar la plantilla de chat.
- La mezcla de entrenamiento esta fuertemente sesgada hacia matematicas (38 %) y codigo (25 %), lo que puede reducir el rendimiento en tareas generales o de dominio no cubierto.
- El contexto de 64k implica un coste elevado de KV cache en inferencia; en GPU de consumo puede requerir cuantizacion agresiva o limitar la longitud efectiva.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de Teutonic-I y Qwen3.5-9B-Base conviene verificar las condiciones de ambos modelos originales.
- El repositorio ocupa 17,9 GB y solo tiene 5 descargas y 0 likes; no hay validacion comunitaria ni demos publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReliquaryForge/teutonic-rl-async-v1-step-00000110
- Modelo base (preentrenamiento): https://huggingface.co/dendriteholdings/Teutonic-I
- Modelo base del injerto de atencion: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Papers, blogs, repositorios y demos adicionales: no disponible en la informacion proporcionada.
