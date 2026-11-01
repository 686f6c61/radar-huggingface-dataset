# ReliquaryForge/teutonic-rl-async-v1-step-00000085

## Resumen

Teutonic-RL-Async-v1-step-00000085 es un modelo de lenguaje de 8,95 mil millones de parametros desarrollado por ReliquaryForge, un participante de la competicion de mejora de modelos de Bittensor Subnet 81. Se trata de un checkpoint intermedio (paso 85) de un proceso de ajuste supervisado (SFT) con destilacion sobre el modelo Teutonic-I, que a su vez es el resultado de la competicion abierta de mejora de modelos de Teutonic (Bittensor Subnet 3) partiendo de Qwen3.5-9B-Base.

El modelo emplea la arquitectura `Qwen3_5ForCausalLM`, una hibridacion que combina 24 capas gated-DeltaNet (un tipo de mezclador de tokens con estado recurrente) con 8 capas de atencion softmax completa. Esta configuracion busca un equilibrio entre eficiencia computacional en contextos largos y capacidad de atencion global. El modelo fue entrenado con una ventana de contexto de 64.000 tokens y dispone de modo de razonamiento (thinking mode).

Su relevancia radica en dos factores: por un lado, documenta una cadena de linaje poco habitual en el ecosistema open source, donde un modelo preentrenado mediante una competicion descentralizada (Bittensor) se somete a un injerto de atencion y posteriormente a destilacion supervisada desde un modelo mayor (Qwen3.8-27B). Por otro, su licencia Apache-2.0 y su compatibilidad con la arquitectura estandar de transformers lo hacen directamente desplegable sin fricciones de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (hibrida: 24 capas gated-DeltaNet + 8 capas de atencion softmax completa) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64.000 tokens (entrenado a 64k) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Teutonic-I, preentrenado en Bittensor Subnet 3. Sobre esa base se realizo un injerto de atencion: las 8 capas mezcladoras de tokens GLA (gated linear attention) originales, situadas en las capas 3, 7, ..., 31, se sustituyeron por la atencion softmax de Qwen3.5-9B-Base y se "curaron" entrenando unicamente esas capas sobre 50 millones de tokens de texto plano. El resto de componentes (embeddings, MLPs y las 24 capas gated-DeltaNet) provienen de Teutonic-I. El resultado adopta la arquitectura estandar `Qwen3_5ForCausalLM` con 32 capas, vocabulario de 248.320 tokens y precision bfloat16.

El ajuste supervisado realizado por Reliquary consta de dos fases. Primero, una epoca sobre la mezcla `full-v2` con 4.470 millones de tokens objetivo (matematicas 38 %, codigo 25 %, ciencia 14 %, general 11 %, agentico 8,4 %) con tasa de aprendizaje 4e-5 y decaimiento coseno. Despues, una pasada sobre 7.659 ejemplos de QA de documentos largos (documentos de 16k a 57k tokens, con preguntas y respuestas generadas por el profesor) mas 56 millones de tokens de replay de `full-v2`, con tasa de aprendizaje 1e-5. La destilacion se realiza desde Qwen3.8-27B e incluye modo de razonamiento. El checkpoint publicado corresponde al paso 85 de este proceso.

## Capacidades

- Generacion de texto conversacional y de formato largo, con plantilla de chat incluida en el repositorio.
- Razonamiento con modo de pensamiento (thinking mode), heredado de la destilacion desde Qwen3.8-27B.
- Razonamiento matematico, reforzado por el 38 % de la mezcla de entrenamiento dedicada a matematicas.
- Generacion y comprension de codigo, con un 25 % de la mezcla orientada a programacion.
- Capacidades cientificas, con un 14 % de la mezcla dedicada a ciencia.
- Capacidades agenticas y de razonamiento multi-paso, con un 8,4 % de la mezcla orientada a escenarios agenticos.
- Procesamiento de documentos largos y QA sobre ellos, gracias al entrenamiento especifico con documentos de 16k-57k tokens y a la ventana de 64k.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- **Atencion al cliente automatizada:** el modelo puede gestionar conversaciones multi-turno con contexto extenso gracias a su ventana de 64.000 tokens, lo que permite mantener el historial completo de la interaccion y documentacion de referencia en una sola sesion sin truncamiento.
- **Analisis de documentos largos:** con entrenamiento especifico en QA sobre documentos de 16k a 57k tokens, es adecuado para extraer respuestas y resumir contratos, informes tecnicos o expedientes que superan la ventana tipica de 8k-32k de modelos de su tamano.
- **Asistencia a la programacion:** el 25 % de la mezcla de codigo y el modo de razonamiento lo hacen util para generacion de funciones, explicacion de codigo heredado y revision de parches en entornos de desarrollo integrado.
- **Tutoria y resolucion de problemas matematicos:** el peso dominante de matematicas en el entrenamiento (38 %) lo orienta a la resolucion paso a paso de problemas, con trazas de razonamiento visibles en modo thinking.
- **Pipelines agenticos multi-paso:** el 8,4 % de datos agenticos permite emplearlo como planificador o ejecutor en flujos que requieren descomposicion de tareas y razonamiento encadenado, siempre que se valide el soporte de tool calling en la implementacion concreta.
- **Generacion aumentada por recuperacion (RAG) sobre corpus extensos:** la combinacion de contexto de 64k y entrenamiento en documentos largos permite inyectar varios fragmentos recuperados y mantener coherencia en la respuesta.
- **Prototipado e investigacion en entornos Bittensor:** al ser un checkpoint de un pipeline de destilacion descentralizada, sirve como referencia para estudiar el efecto del injerto de atencion y de la destilacion en modelos de ~9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada en bfloat16:** aproximadamente 17,9 GB solo para pesos (el tamano del repositorio coincide con esta cifra), mas memoria para cache KV y activaciones; en la practica se recomienda un minimo de 24 GB para contexto corto y 40-80 GB para aprovechar los 64k tokens de contexto.
- **VRAM estimada en cuantizacion de 8 bits:** en torno a 9-10 GB de pesos; requiere verificar la compatibilidad de la arquitectura hibrida con las herramientas de cuantizacion, no documentada en la informacion disponible.
- **GPU recomendadas:** A100 40/80 GB, H100 80 GB o L40S 48 GB para contexto largo sin cuantizar. Para contexto corto, una RTX 4090 de 24 GB puede alojar los pesos en bf16 con margen limitado.
- **GPU de consumo:** cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16 para contextos moderados; en GPUs de 16 GB o menos seria necesaria cuantizacion, cuya disponibilidad no esta documentada.
- **Opciones de despliegue:** transformers (libreria declarada); vLLM y TGI son plausibles al usar la arquitectura estandar `Qwen3_5ForCausalLM`, pero su compatibilidad no esta verificada en la informacion disponible. llama.cpp y Ollama requeririan conversion a GGUF, no publicada.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Teutonic-RL-Async-v1-step-00000085 | 8,95B | 64k | Hibrida (DeltaNet + atencion) | Apache-2.0 | Checkpoint intermedio de SFT con destilacion |
| Qwen3.5-9B-Base | ~9B | No disponible en la informacion | Transformer estandar | Apache-2.0 (presumible, no confirmado) | Modelo base del injerto de atencion |
| Teutonic-I | No disponible | No disponible | Hibrida GLA + DeltaNet | Apache-2.0 | Preentrenado en Bittensor Subnet 3; antecesor directo |
| Qwen3.8-27B | 27B | No disponible | No disponible | No disponible | Profesor de la destilacion; mayor capacidad |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Checkpoint intermedio:** el identificador `step-00000085` indica que no es un modelo final; su calidad puede ser inferior a la de un checkpoint convergido del mismo pipeline.
- **Riesgo de alucinacion:** como todo modelo destilado de un profesor mayor, puede reproducir errores del profesor y generar contenido plausible pero incorrecto, especialmente en dominios con poca cobertura en la mezcla (general 11 %).
- **Sesgos:** no se documentan evaluaciones de sesgo; la mezcla de entrenamiento esta dominada por matematicas, codigo y ciencia, lo que puede infrarepresentar registros conversacionales generales y culturas no anglosajonas.
- **Idiomas:** no se declaran idiomas soportados; el soporte multilingue no esta garantizado y debe validarse empiricamente antes de usarlo en produccion en castellano u otras lenguas.
- **Tool calling:** no se documenta soporte explicito de function calling, pese a la etiqueta agentic; conviene verificar el formato de plantilla de chat incluido en el repositorio.
- **Cuantizacion:** no se publican pesos GGUF ni variantes cuantizadas; la arquitectura hibrida puede presentar problemas de compatibilidad con herramientas de cuantizacion estandar.
- **Licencia:** Apache-2.0 permite uso comercial, pero al modificar Teutonic-I y Qwen3.5-9B-Base conviene conservar los avisos de atribucion correspondientes y revisar las condiciones de los modelos antecesores.
- **Procedencia:** al tratarse de un modelo entrenado en un contexto de competicion descentralizada, la documentacion de datos y procesos es menos exhaustiva que la de un lanzamiento corporativo; la reproducibilidad no esta garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReliquaryForge/teutonic-rl-async-v1-step-00000085
- Modelo base (preentrenamiento): https://huggingface.co/dendriteholdings/Teutonic-I
- Modelo base (arquitectura y atencion): https://huggingface.co/Qwen/Qwen3.5-9B-Base
