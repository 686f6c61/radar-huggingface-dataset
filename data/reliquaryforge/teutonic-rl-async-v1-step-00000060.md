# ReliquaryForge/teutonic-rl-async-v1-step-00000060

## Resumen
Teutonic-I Reliquary SFT (identificador `ReliquaryForge/teutonic-rl-async-v1-step-00000060`) es un modelo de lenguaje de 8,95 mil millones de parametros derivado de la familia Qwen3.5 y publicado por ReliquaryForge, el equipo de post-entrenamiento de Reliquary (Bittensor Subnet 81). Parte de `dendriteholdings/Teutonic-I`, un modelo preentrenado en la competicion abierta de mejora de modelos de Teutonic (Bittensor Subnet 3), y del base `Qwen/Qwen3.5-9B-Base`, sobre el que se ha realizado un injerto de atencion para recuperar la arquitectura estandar de Qwen3.5.

El modelo resuelve el problema de obtener un checkpoint con razonamiento explicito (thinking mode), capacidades agenticas y contexto largo a partir de un preentrenamiento hibrido. Para ello se sustituyeron los 8 mezcladores de tokens GLA de Teutonic-I por atencion softmax completa de Qwen3.5-9B-Base y se aplico un SFT por destilacion supervisada desde un profesor Qwen3.8-27B, con una mezcla orientada a matematicas, codigo, ciencia, conocimiento general y tareas agenticas.

Es relevante ahora porque demuestra un flujo de post-entrenamiento reproducible sobre infraestructura descentralizada (Bittensor) y porque conserva la arquitectura `Qwen3_5ForCausalLM`, lo que permite reutilizar el ecosistema de herramientas de Qwen3.5. El checkpoint publicado corresponde al paso 60 de un pipeline de RL asincrono, por lo que debe tratarse como un artefacto intermedio de investigacion mas que como un modelo final de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` hibrida: 32 capas (24 gated-DeltaNet + 8 atencion softmax completa) |
| Parametros totales | 8.953.803.264 (8,6B segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenado a 64k tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es un transformer hibrido con 32 capas: 24 capas de mezcla de tokens mediante gated-DeltaNet (un modelo de estado recurrente lineal) y 8 capas de atencion softmax completa, con un vocabulario de 248.320 tokens y pesos en bfloat16. El linaje es en tres etapas. Primero, el preentrenamiento de `dendriteholdings/Teutonic-I` en la competicion de Bittensor Subnet 3. Segundo, un injerto de atencion en el que los 8 mezcladores GLA originales (capas 3, 7, ..., 31) se reemplazan por la atencion softmax de `Qwen/Qwen3.5-9B-Base` y se "curan" entrenando unicamente esas capas sobre 50M tokens de texto plano; el resto de componentes (embeddings, MLPs y las 24 capas gated-DeltaNet) permanece de Teutonic-I. Tercero, el SFT de Reliquary que produce este checkpoint.

El SFT se ejecuto en dos fases: una epoca sobre la mezcla `full-v2` (4,47B tokens objetivo; 38 % matematicas, 25 % codigo, 14 % ciencia, 11 % general, 8,4 % agentico) con LR 4e-5 y decaimiento coseno, seguida de una pasada sobre 7.659 ejemplos de QA de documentos largos (documentos de 16k a 57k tokens, con preguntas y respuestas generadas por el profesor) mas 56M tokens de replay de `full-v2` con LR 1e-5. La destilacion supervisada proviene de un profesor Qwen3.8-27B e incluye modo de razonamiento (thinking mode); la plantilla de chat esta incluida en el repositorio.

## Capacidades
- Generacion de texto conversacional multi-turno con contexto largo (entrenado a 64k tokens).
- Razonamiento explicito mediante thinking mode, destilado del profesor Qwen3.8-27B.
- Razonamiento matematico y resolucion de problemas, con un 38 % de la mezcla de SFT dedicada a matematicas.
- Generacion y comprension de codigo, con un 25 % de la mezcla dedicada a codigo.
- Conocimiento cientifico y general (14 % y 11 % de la mezcla respectivamente).
- Capacidades agenticas y de razonamiento multi-paso, con un 8,4 % de datos agenticos en la mezcla.
- QA sobre documentos largos: entrenado especificamente con ejemplos de 16k a 57k tokens.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con la libreria `transformers`.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no declarados en la model card).
- Vision y audio: no disponibles.

## Casos de uso
- Analisis de documentos largos: el modelo se entreno de forma especifica con pares pregunta-respuesta sobre documentos de 16k a 57k tokens, por lo que es adecuado para extraccion de informacion, resumen y QA sobre contratos, informes o articulos extensos dentro de la ventana de 64k.
- Asistencia en matematicas y ciencia: con un 52 % combinado de la mezcla de SFT en matematicas y ciencia, puede emplearse para resolver problemas paso a paso y explicar derivaciones, aprovechando el thinking mode para exponer el razonamiento.
- Generacion de codigo asistida: el 25 % de datos de codigo y la ventana de 64k permiten trabajar sobre repositorios o fragmentos extensos, generar parches y explicar cambios dentro de un mismo contexto.
- Flujos agenticos de varios pasos: los datos agenticos de la mezcla y el razonamiento explicito lo hacen utilizable como planificador en pipelines que requieran descomponer tareas, aunque la integracion con herramientas debe validarse porque el soporte de tool calling no esta documentado.
- Investigacion sobre post-entrenamiento descentralizado: al ser un checkpoint intermedio (paso 60) de un pipeline de RL asincrono sobre Bittensor, sirve como referencia para estudiar destilacion, injerto de atencion y recuperacion de arquitecturas hibridas.
- Despliegue en infraestructura existente de Qwen3.5: al conservar la arquitectura `Qwen3_5ForCausalLM` y la plantilla de chat en el repositorio, puede integrarse en stacks que ya sirven modelos Qwen3.5 sin cambios de arquitectura.
- Prototipado de asistentes conversacionales con contexto largo: la ventana de 64k permite mantener historiales extensos en atencion al cliente o asistencia tecnica, aunque la calidad en produccion debe evaluarse por tratarse de un checkpoint intermedio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para pesos (8,95B parametros a 2 bytes), mas overhead de activaciones y cache KV; el tamano del repositorio es de 17,9 GB.
- En cuantizacion de 8 bits, la estimacion teorica ronda los 9 GB de pesos; en 4 bits, alrededor de 4,5-5 GB. No se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la informacion disponible.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 64k y despliegue concurrente; RTX 4090 (24 GB) puede alojar los pesos en bfloat16 pero con margen limitado para contexto largo y batches mayores.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16 con contexto moderado, y en GPUs de 16 GB solo mediante cuantizacion, que no esta publicada oficialmente.
- Opciones de despliegue: `transformers` (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible, aunque la arquitectura Qwen3.5 y el tag `endpoints_compatible` sugieren compatibilidad con servidores de inferencia estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Teutonic-I Reliquary SFT (este) | 8,95B | 64k (entrenamiento) | Hibrida gated-DeltaNet + atencion | Apache-2.0 | Checkpoint intermedio, thinking mode, sin benchmarks publicados |
| Qwen/Qwen3.5-9B-Base | ~9B | no disponible | Qwen3.5 | no disponible | Base del injerto de atencion; sin post-entrenamiento de razonamiento |
| dendriteholdings/Teutonic-I | no disponible | no disponible | Hibrida con 8 mezcladores GLA | no disponible | Preentrenado en Bittensor Subnet 3; sin el injerto de atencion |
| Qwen3.8-27B (profesor) | 27B | no disponible | no disponible | no disponible | Profesor de la destilacion; mayor tamano, no es sustituto directo por coste |

## Limitaciones y advertencias
- Es un checkpoint intermedio (paso 60 de un pipeline de RL asincrono): no debe asumirse que representa el estado final del entrenamiento ni que su calidad este estabilizada.
- No hay resultados de benchmarks publicados, por lo que el rendimiento real frente a Qwen3.5-9B u otros modelos de tamano similar no esta verificado de forma independiente.
- No se declaran los idiomas soportados; el soporte multilingue es incierto y debe validarse antes de usarlo en produccion en castellano u otros idiomas.
- El soporte de tool calling y function calling no esta documentado, lo que limita su uso directo en pipelines agenticos que dependan de llamadas a herramientas.
- Riesgo de alucinacion inherente a los modelos destilados y a la mezcla de datos generados por profesor; las respuestas de razonamiento deben verificarse en dominios criticos.
- El injerto de atencion se entreno solo sobre 50M tokens en las capas sustituidas, lo que puede introducir diferencias de comportamiento frente a un modelo Qwen3.5 nativo.
- La licencia Apache-2.0 permite uso comercial, pero al modificar Teutonic-I y Qwen3.5-9B-Base conviene revisar las condiciones de los modelos de origen y de los datos de destilacion.
- El modelo tiene 20 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria significativa.
- La ventana de 64k es la longitud de entrenamiento; el rendimiento mas alla de ese limite no esta garantizado.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ReliquaryForge/teutonic-rl-async-v1-step-00000060
- Modelo base preentrenado: https://huggingface.co/dendriteholdings/Teutonic-I
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Papers, blogs, repositorios y demos adicionales: no disponibles en la informacion proporcionada.
