# b2z/FastBrain-9B-oQ4e

## Resumen

FastBrain-9B-oQ4e es una cuantizacion mixta de precision del modelo FastBrain-9B, un modelo de decision estructurada no autorregresivo (System-1) construido sobre un backbone hibrido Qwen3.5-9B. El modelo original combina 24 bloques de atencion lineal Gated DeltaNet con 8 bloques de atencion completa, y anade una cabeza de esquema conjunta (JointSchemaHead) de aproximadamente 116 millones de parametros. En lugar de generar texto token a token, FastBrain evalua un estado JSON y un conjunto de opciones en una sola pasada de prefill, puntuando cada alternativa de cada pregunta.

Esta version concreta, publicada por el usuario b2z, aplica cuantizacion mixta mediante oQ (oMLX v0.7.4.dev1), con una media efectiva de 5,518 bits por peso. El checkpoint resultante ocupa 6,6 GB en disco y contiene 9.409.813.744 parametros en formato safetensors para la libreria MLX, lo que lo hace ejecutable en hardware Apple Silicon. Es relevante porque demuestra un enfoque alternativo a la generacion autoregresiva para tareas de decision estructurada, con un coste de inferencia de una sola pasada.

La ficha se centra en la version cuantizada oQ4e, aunque parte de la informacion disponible proviene del modelo base FastBrain-9B y de sus variantes publicadas (GGUF, Transformers). No hay datos publicados de benchmarks ni de licencia del checkpoint cuantizado en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 24 bloques Gated DeltaNet (atencion lineal) + 8 bloques de atencion completa, con JointSchemaHead de ~116M parametros |
| Parametros totales | 9.409.813.744 (9,41B) en safetensors; 9.532B logicos segun la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64 (72,64%), affine 5-bit grupo 64 (10,62%), affine 6-bit grupo 64 (10,67%), BF16 (6,07%); media efectiva 5,518 bits/peso |
| Idiomas soportados | no disponible (la variante GGUF del modelo base indica ingles) |
| Licencia | no disponible en el checkpoint cuantizado; la variante GGUF del modelo base indica apache-2.0 |
| Formato de pesos | safetensors (MLX); existen variantes GGUF del modelo base |

## Arquitectura y entrenamiento

FastBrain-9B es un modelo de decision estructurada no autorregresivo. Su backbone es un transformer hibrido derivado de Qwen3.5-9B que intercala 24 bloques de atencion lineal Gated DeltaNet con 8 bloques de atencion completa, lo que reduce el coste computacional del prefill en secuencias largas. Sobre el backbone se acopla una JointSchemaHead de aproximadamente 116 millones de parametros que produce puntuaciones sobre opciones estructuradas. El modelo procesa un estado JSON junto con un conjunto de preguntas y opciones, y devuelve una puntuacion para cada opcion en una sola pasada hacia delante, sin decodificacion autoregresiva.

El checkpoint oQ4e es una cuantizacion mixta de precision generada con oQ (oMLX v0.7.4.dev1). La distribucion asigna 4 bits al 72,64% de los pesos logicos, 5 bits al 10,62%, 6 bits al 10,67% y mantiene el 6,07% en BF16, con un grupo de cuantizacion de 64. El desglose por componentes distingue el modelo de lenguaje (8,954B, 5,419 GB), la torre de vision (0,456B, 0,912 GB) y la JointSchemaHead (0,122B, 0,244 GB). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Decision estructurada no autorregresiva: puntua todas las opciones de todas las preguntas en una sola pasada de prefill.
- Procesamiento de estado JSON y preguntas con opciones (formato de decision tipo "noul" o "score").
- Vision: el checkpoint incluye una torre de vision de 0,456B parametros.
- Tool calling y function calling: la variante GGUF del modelo base incluye etiquetas de tool-calling y function-calling.
- Clasificacion de intencion (intent-classification).
- Salida estructurada tipada (image-text-to-typed-output).
- Razonamiento de tipo System-1: respuestas rapidas en un solo paso, orientado a decisiones.
- Capacidades multilingues: no disponible.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: dado un mensaje de usuario y un conjunto de intenciones candidatas, el modelo puntua cada una en una sola pasada, lo que permite clasificar la intencion con baja latencia.
- Seleccion de herramientas en pipelines de agentes: con un estado JSON que describe el contexto y una lista de funciones disponibles, el modelo puntua cada funcion candidata para decidir cual invocar.
- Puntuacion de opciones en sistemas de recomendacion: dado un estado del usuario y un catalogo de opciones, el modelo asigna una puntuacion a cada alternativa en una unica pasada.
- Clasificacion multimodal de imagenes y texto: la presencia de una torre de vision permite procesar entradas imagen-texto y producir salidas estructuradas tipadas.
- Validacion de decisiones en produccion: al ser no autorregresivo, el coste de inferencia es de una sola pasada, lo que facilita desplegarlo como componente de decision dentro de un pipeline mayor.
- Prototipado en Apple Silicon: el formato MLX y la cuantizacion mixta de 5,518 bits permiten ejecutar el modelo en hardware Apple para experimentacion local.
- Investigacion sobre modelos no autorregresivos: sirve como referencia abierta para estudiar arquitecturas hibridas de atencion lineal y cabezas de decision estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 6,6 GB en disco (6,123 GiB de pesos); en memoria se requiere espacio adicional para el estado de ejecucion y el contexto.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU consumer: no confirmada; el formato es MLX, orientado a Apple Silicon (memoria unificada), no a CUDA.
- Opciones de despliegue: libreria MLX (formato nativo del checkpoint); el modelo base dispone de variantes GGUF para llama.cpp y etiquetas de sglang en Hugging Face.
- Latencia y throughput: no disponibles; por diseno, la inferencia es de una sola pasada de prefill, sin decodificacion autoregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| FastBrain-9B-oQ4e | 9,41B (safetensors) | no disponible | safetensors (MLX) | no disponible | Decision estructurada no autorregresiva, cuantizacion mixta |
| FastBrain-9B (TypeScript) | 9B | no disponible | Transformers | no disponible | Modelo base de generacion de texto |
| FastBrain-9B-GGUF (mradermacher) | 9B | no disponible | GGUF | apache-2.0 | Variante para llama.cpp/sglang |
| Qwen3.5-9B | 9B | no disponible | no disponible | no disponible | Backbone transformer hibrido del que deriva FastBrain |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint cuantizado no declara licencia en la informacion disponible; la licencia apache-2.0 aparece asociada a la variante GGUF del modelo base, no a este checkpoint.
- No se especifican los idiomas soportados; la variante GGUF del modelo base indica ingles.
- No hay datos de benchmarks que permitan evaluar la perdida de calidad introducida por la cuantizacion mixta.
- El modelo es no autorregresivo y esta disenado para decision estructurada; no debe esperarse de el generacion de texto libre de alta calidad.
- El formato MLX limita el despliegue a entornos Apple Silicon o a conversiones adicionales; no es directamente compatible con CUDA.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni comportamiento en contextos largos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-06), lo que indica que no ha sido validado por la comunidad.
- No se dispone de informacion sobre el proceso de entrenamiento, los datos utilizados ni posibles ajustes de alineacion.

## Enlaces

- Hugging Face (checkpoint cuantizado): https://huggingface.co/b2z/FastBrain-9B-oQ4e
- Repositorio GitHub del modelo base: https://github.com/camera-2018/FastBrain
- README del modelo base en GitHub: https://github.com/camera-2018/FastBrain/blob/main/README.md
- Variante Transformers: https://huggingface.co/TypeScript/FastBrain-9B
- Variante GGUF: https://huggingface.co/mradermacher/FastBrain-9B-GGUF
- Pagina del proyecto en jevlist.ai: https://jevlist.ai/projects/fastbrain-9b
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
