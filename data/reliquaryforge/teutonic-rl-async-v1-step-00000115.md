# ReliquaryForge/teutonic-rl-async-v1-step-00000115

## Resumen

Teutonic-I Reliquary SFT (checkpoint `step-00000115`) es un modelo de lenguaje de 8.953.803.264 parametros (8,95B) desarrollado por ReliquaryForge, el equipo de post-entrenamiento de Reliquary dentro de la subred 81 de Bittensor. Parte de `dendriteholdings/Teutonic-I`, un modelo preentrenado en la competicion abierta de mejora de modelos de Teutonic (subred 3 de Bittensor), y ha sido post-entrenado mediante destilacion supervisada a partir de un profesor Qwen3.8-27B, incorporando modo de razonamiento (thinking mode).

El modelo emplea una arquitectura hibrida: 32 capas en total, de las cuales 24 son capas gated-DeltaNet y 8 son capas de atencion softmax completas. Las 8 capas de mezcla de tokens GLA originales de Teutonic-I (capas 3, 7, ..., 31) fueron sustituidas por la atencion softmax de Qwen/Qwen3.5-9B-Base y posteriormente "curadas" entrenando solo esas capas sobre 50M tokens de texto plano. El resultado es la arquitectura estandar `Qwen3_5ForCausalLM`, con vocabulario de 248.320 tokens y entrenamiento a 64k de contexto.

La relevancia de este checkpoint reside en su caracter experimental y comunitario: es un ejemplo de modelo derivado de un pipeline descentralizado (Bittensor) que combina preentrenamiento competitivo, injerto de atencion y destilacion de razonamiento. Esta publicado bajo licencia Apache-2.0, con pesos en safetensors y compatibilidad con `transformers` y endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` hibrida: 32 capas (24 gated-DeltaNet + 8 atencion softmax completa) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k tokens (entrenado a 64k) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido con 32 capas: 24 capas gated-DeltaNet (un mecanismo de atencion lineal con estado recurrente) y 8 capas de atencion softmax completa. Las capas 3, 7, ..., 31 originalmente usaban mezcladores de tokens GLA (gated linear attention) en Teutonic-I; en este linaje fueron reemplazadas por la atencion softmax de Qwen3.5-9B-Base y reparadas mediante entrenamiento restringido a esas capas sobre 50M tokens de texto plano. El resto de componentes (embeddings, MLPs y las 24 capas gated-DeltaNet) procede de Teutonic-I. El vocabulario es de 248.320 tokens y los pesos estan en bfloat16.

El post-entrenamiento consta de dos fases. Primero, una epoca sobre la mezcla `full-v2` con 4,47B tokens objetivo (matematicas 38 %, codigo 25 %, ciencia 14 %, general 11 %, agentico 8,4 %), con learning rate 4e-5 y schedule coseno. Despues, una pasada sobre 7.659 ejemplos de QA sobre documentos largos (documentos de 16k a 57k tokens, con preguntas y respuestas escritas por el profesor) mas 56M tokens objetivo de replay de `full-v2`, con learning rate 1e-5. El metodo es destilacion supervisada (SFT) desde Qwen3.8-27B, con modo de razonamiento. No se documenta RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional y continuacion de texto.
- Razonamiento con modo thinking (el template de chat esta incluido en el repositorio).
- Capacidades matematicas reforzadas por la composicion del dataset de SFT (38 % matematicas).
- Generacion de codigo (25 % del mix de entrenamiento).
- Razonamiento cientifico (14 % del mix).
- Capacidades agenticas (8,4 % del mix, etiqueta `agentic`), aunque no se detalla soporte explicito de tool calling ni function calling.
- Procesamiento de documentos largos y QA sobre contexto extenso, gracias a la fase de entrenamiento con documentos de 16k-57k tokens y a la ventana de 64k.
- Capacidades multilingues: no documentadas.

## Casos de uso

- QA sobre documentos largos: el modelo fue entrenado especificamente con 7.659 ejemplos de preguntas y respuestas sobre documentos de 16k a 57k tokens, por lo que es adecuado para extraccion de informacion y resumen de contratos, informes o articulos extensos dentro de su ventana de 64k.
- Generacion de codigo asistida: el 25 % del mix de SFT es codigo, lo que lo hace util para autocompletado, generacion de funciones y explicacion de fragmentos en entornos de desarrollo.
- Razonamiento matematico paso a paso: con el 38 % del entrenamiento dedicado a matematicas y modo thinking, puede emplearse en resolucion de problemas, verificacion de calculos y tutoria educativa.
- Analisis cientifico y tecnico: el 14 % de ciencia en el mix permite su uso para resumir literatura, explicar conceptos y asistir en redaccion tecnica.
- Prototipado de agentes: la etiqueta agentica y el contexto de 64k permiten construir flujos multi-paso donde el modelo mantiene estado de conversacion y documentos de referencia.
- Experimentacion en pipelines descentralizados: al provenir de Bittensor (subredes 3 y 81), sirve como base para evaluar tecnicas de injerto de atencion y destilacion en entornos de mejora abierta.
- Investigacion sobre arquitecturas hibridas: util para estudiar el comportamiento de capas gated-DeltaNet combinadas con atencion softmax en tareas de razonamiento y contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para pesos (8,95B parametros x 2 bytes), mas overhead de KV cache y activaciones; en la practica se recomienda 24 GB o mas.
- En cuantizacion de 8 bits: alrededor de 9-10 GB de pesos; en 4 bits, alrededor de 5-6 GB, aunque el autor no documenta versiones cuantizadas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bfloat16; RTX 3090 (24 GB) como minimo practico para inferencia sin cuantizar.
- Cabe en GPU de consumo (RTX 4090, RTX 3090) en bfloat16 con contexto moderado; para contexto completo de 64k se necesita mas VRAM por la cache de atencion.
- Opciones de despliegue: `transformers` (libreria declarada), endpoints compatibles (tag `endpoints_compatible`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teutonic-I Reliquary SFT (este) | 8,95B | 64k | Hibrida (gated-DeltaNet + softmax) | Apache-2.0 | HuggingFace, 5 descargas |
| Qwen/Qwen3.5-9B-Base | ~9B | no disponible en la informacion | Transformer denso | no disponible en la informacion | HuggingFace (modelo base) |
| dendriteholdings/Teutonic-I | no disponible | no disponible | Hibrida con GLA | no disponible en la informacion | HuggingFace (modelo base) |

La comparacion con alternativas de la misma categoria no puede completarse con los datos proporcionados; no se dispone de resultados de benchmarks ni de especificaciones detalladas de los modelos base mas alla de lo citado en el linaje.

## Limitaciones y advertencias

- Modelo experimental con solo 5 descargas y 0 likes en el momento de la ficha; no hay validacion externa de su calidad.
- No se han publicado benchmarks, por lo que su rendimiento real frente a modelos comparables es desconocido.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto en castellano ni en otros idiomas distintos del ingles.
- Riesgo de alucinacion inherente a los modelos destilados de razonamiento; el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas.
- El injerto de atencion y el "healing" con solo 50M tokens pueden introducir degradaciones no detectadas en las capas sustituidas.
- No se documenta soporte explicito de tool calling ni function calling, pese a la etiqueta agentica.
- No hay versiones cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de Teutonic-I y Qwen3.5-9B-Base conviene verificar las condiciones de los modelos base.
- El checkpoint `step-00000115` sugiere un entrenamiento en curso; puede no ser la version final del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/ReliquaryForge/teutonic-rl-async-v1-step-00000115
- Modelo base Teutonic-I: https://huggingface.co/dendriteholdings/Teutonic-I
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
