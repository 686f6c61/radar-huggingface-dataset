# ReliquaryForge/teutonic-rl-async-v1-step-00000040

## Resumen

Teutonic-I Reliquary SFT (identificador `ReliquaryForge/teutonic-rl-async-v1-step-00000040`) es un modelo de lenguaje de 8,95 mil millones de parametros derivado de la familia Qwen3.5 y ajustado mediante supervisión y destilación por el proyecto Reliquary, asociado a la subred 81 de Bittensor. Su origen es poco convencional: parte de `dendriteholdings/Teutonic-I`, un modelo preentrenado en la competicion abierta de mejora de modelos de la subred 3 de Bittensor, al que se le sustituyeron ocho capas de mezcla de tokens GLA por atención softmax de `Qwen/Qwen3.5-9B-Base` y se reentrenaron esas capas sobre 50 millones de tokens de texto plano.

Sobre esa base hibrida, Reliquary aplico un ciclo de SFT con destilación supervisada desde un modelo profesor denominado Qwen3.8-27B, con modo de razonamiento (thinking mode) activado. El resultado conserva la arquitectura estandar `Qwen3_5ForCausalLM`, lo que facilita su integración en el ecosistema transformers, y esta entrenado con una ventana de contexto de 64k tokens, lo que lo sitúa en la franja de modelos de contexto largo de tamano medio.

El interes del modelo reside en dos frentes: por un lado, documenta un flujo de trabajo de injerto de atención (attention graft) sobre un transformer hibrido con capas gated-DeltaNet, una tecnica poco frecuente que permite reutilizar pesos preentrenados de una arquitectura y migrarlos a otra; por otro, ejemplifica el pipeline de entrenamiento distribuido de Bittensor aplicado a modelos abiertos con licencia Apache-2.0. No obstante, se trata de un checkpoint intermedio (step 40) de un experimento en curso, con escasa validación publica y sin benchmarks disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `Qwen3_5ForCausalLM`: 32 capas (24 gated-DeltaNet + 8 atención completa softmax) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64.000 tokens (entrenado a 64k) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `Qwen3_5ForCausalLM`, un transformer hibrido de 32 capas en el que 24 capas emplean mezcladores de estado gated-DeltaNet y 8 capas usan atención softmax completa. El vocabulario es de 248.320 tokens y los pesos estan en bfloat16. La peculiaridad del linaje es que las 8 capas de atención softmax no son originales de Teutonic-I: en este se usaban mezcladores GLA (gated linear attention) en las capas 3, 7, ..., 31, que fueron reemplazados por la atención softmax de Qwen3.5-9B-Base y posteriormente "curados" (healed) entrenando unicamente esas capas sobre 50 millones de tokens de texto plano. El resto de componentes (embeddings, MLPs y las 24 capas gated-DeltaNet) procede de Teutonic-I.

El post-entrenamiento realizado por Reliquary consta de dos fases. Primero, una epoca sobre la mezcla `full-v2` con 4,47 mil millones de tokens objetivo, compuesta por matemáticas (38 %), codigo (25 %), ciencia (14 %), general (11 %) y agentico (8,4 %), con tasa de aprendizaje 4e-5 y decaimiento coseno. Despues, una pasada sobre 7.659 ejemplos de QA sobre documentos largos (documentos de entre 16k y 57k tokens, con preguntas y respuestas generadas por el profesor) mas 56 millones de tokens de replay de `full-v2`, con tasa de aprendizaje 1e-5. El profesor de destilación es un modelo denominado Qwen3.8-27B, y el entrenamiento incorpora modo de razonamiento (thinking mode). La plantilla de chat esta incluida en el repositorio.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con plantilla de chat propia incluida en el repositorio.
- Razonamiento en modo thinking (cadena de pensamiento), heredado de la destilacion desde el profesor.
- Razonamiento matematico y resolucion de problemas, reforzado por el 38 % de tokens de matemáticas en la mezcla de SFT.
- Generacion y comprension de codigo, con un 25 % de tokens de codigo en el entrenamiento.
- Conocimiento cientifico y general, con un 14 % y un 11 % de la mezcla respectivamente.
- Capacidades agenticas y de razonamiento multi-paso, con un 8,4 % de datos agenticos en el SFT.
- Comprension de documentos largos y QA sobre ellos, gracias a los 7.659 ejemplos de 16k-57k tokens y al contexto de 64k.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles; no se documentan idiomas soportados.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- **Atencion al cliente automatizada con contexto largo**: el modelo puede gestionar conversaciones multi-turno y consultar historiales extensos o documentacion de producto de hasta 64k tokens en una sola ventana, lo que reduce la necesidad de trocear el contexto en recuperacion.
- **QA sobre documentacion tecnica y contratos**: los ejemplos de QA sobre documentos de 16k-57k tokens del entrenamiento lo hacen adecuado para responder preguntas sobre manuales, normativas o contratos largos, citando pasajes concretos dentro del contexto.
- **Asistente de codigo en pipelines de CI/CD**: con un 25 % de tokens de codigo en el SFT, puede generar parches, explicar errores de compilacion o revisar diffs; su integracion via transformers permite desplegarlo en servicios internos de revision automatica.
- **Tutoria y resolucion de problemas matematicos paso a paso**: el modo thinking y el peso de las matematicas en la mezcla permiten generar razonamientos detallados utiles en plataformas educativas o generacion de soluciones explicadas.
- **Agentes de investigacion multi-paso**: los datos agenticos del entrenamiento y la ventana de 64k permiten encadenar busquedas, lecturas de documentos y sintesis en un unico contexto, aunque el soporte de tool calling debe validarse empiricamente.
- **Generacion de resumenes de expedientes largos**: en entornos legales o administrativos, puede resumir expedientes de decenas de miles de tokens preservando detalles, gracias al entrenamiento especifico en documentos largos.
- **Prototipado e investigacion en arquitecturas hibridas**: al ser un checkpoint abierto con linaje documentado, sirve como referencia para estudiar tecnicas de injerto de atencion y migracion entre arquitecturas lineales y softmax.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en bfloat16**: aproximadamente 17,9 GB solo para pesos (coincide con el tamano del repositorio), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para contexto moderado y bastante mas para contexto de 64k.
- **Cuantizacion**: no se documentan tipos de cuantizacion soportados; al ser arquitectura `Qwen3_5ForCausalLM` con capas gated-DeltaNet, la compatibilidad con llama.cpp/GGUF no esta garantizada y requiere verificacion.
- **GPU recomendadas**: A100 40/80 GB o H100 para contexto largo y produccion; RTX 4090 (24 GB) puede alojar los pesos en bf16 pero con margen limitado para contextos extensos; RTX 3090 (24 GB) en las mismas condiciones.
- **Consumer GPU**: cabe en GPUs de 24 GB en bf16 para contextos cortos; para contextos de 32k-64k conviene cuantizar o usar GPUs de 40-80 GB.
- **Opciones de despliegue**: transformers (libreria declarada), con posibilidad de vLLM o TGI si la arquitectura hibrida esta soportada por esas herramientas; llama.cpp/Ollama solo si existe conversion a GGUF, no confirmada.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teutonic-I Reliquary SFT (este) | 8,95B | 64k | Hibrida (24 gated-DeltaNet + 8 softmax) | Apache-2.0 | Hugging Face, 23 descargas |
| Qwen/Qwen3.5-9B-Base | ~9B | No disponible en la informacion | Transformer estandar | No disponible en la informacion | Hugging Face |
| dendriteholdings/Teutonic-I | No disponible en la informacion | No disponible en la informacion | Hibrida con 8 capas GLA | No disponible en la informacion | Hugging Face |
| Profesor de destilacion (Qwen3.8-27B) | ~27B | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion |

La comparacion cuantitativa de rendimiento no es posible porque no se han publicado benchmarks para este checkpoint ni se dispone de cifras de los modelos de referencia en la informacion proporcionada.

## Limitaciones y advertencias

- **Checkpoint intermedio**: el identificador `step-00000040` sugiere que es un estado parcial de un entrenamiento en curso, no una version final; su calidad puede no representar el resultado del proceso completo.
- **Sin benchmarks publicos**: no hay evaluaciones independientes de MMLU, HumanEval, GSM8K ni similares, por lo que el rendimiento real es desconocido.
- **Idiomas no documentados**: no se especifican los idiomas soportados; el uso en castellano no esta garantizado ni evaluado.
- **Riesgo de alucinacion**: como todo modelo de lenguaje destilado, puede generar contenido plausible pero falso, especialmente en dominios fuera de la mezcla de entrenamiento (matematicas, codigo, ciencia, general y agentico).
- **Sesgos**: no se documenta ninguna evaluacion de sesgos; la mezcla de datos y el profesor de destilacion pueden introducir sesgos no caracterizados.
- **Tool calling no confirmado**: aunque los datos agenticos representan el 8,4 % del SFT, no se documenta soporte formal de function calling, por lo que su uso en agentes requiere validacion previa.
- **Compatibilidad de despliegue**: la arquitectura hibrida con capas gated-DeltaNet puede no estar soportada por todos los motores de inferencia (vLLM, llama.cpp, TGI) ni existir conversiones a GGUF.
- **Licencia**: Apache-2.0 permite uso comercial, pero al modificar Teutonic-I y Qwen3.5-9B-Base conviene revisar las condiciones de ambos modelos base y conservar los avisos de atribucion correspondientes.
- **Escasa adopcion**: 23 descargas y 0 likes en el momento de la consulta indican poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReliquaryForge/teutonic-rl-async-v1-step-00000040
- Modelo base preentrenado: https://huggingface.co/dendriteholdings/Teutonic-I
- Modelo base de referencia: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales.
