# Bejczy/ENA-DreamBBQ-2B-GGUF

## Resumen

ENA-DreamBBQ-2B-GGUF es una cuantizacion en formato GGUF de un fine-tune LoRA sobre Qwen3.5-2B, publicada por el usuario Bejczy. El modelo base declarado es Qwen/Qwen3.5-2B (concretamente, segun la model card, una variante denominada Qwen3.5-2B-Uncensored-HauhauCS-Aggressive), y el resultado es un modelo de generacion de texto de 1.881.825.088 parametros (aproximadamente 1,88 mil millones) orientado a un personaje conversacional concreto: ENA, con dos voces alternantes (una entusiasta y comercial, otra hostil). El repositorio ocupa 1,3 GB e incluye pesos en Q4_K_M.

El modelo resuelve un problema muy especifico: ofrecer una personificacion ligera y ejecutable en hardware de consumo (la model card menciona entrenamiento en una AMD Radeon RX 6600 de 8 GB con ROCm 7.1), sin dependencia de la nube. No es un modelo de proposito general ni compite en razonamiento o codigo con modelos de su tamano; su interes es como ejemplo de pipeline completo de fine-tune y cuantizacion sobre una arquitectura hibrida reciente (qwen35), incluyendo la documentacion de dos bugs tecnicos relevantes en el proceso de conversion a GGUF.

La relevancia actual es doble: por un lado, demuestra el flujo LoRA sobre Qwen3.5-2B y su empaquetado a GGUF para llama.cpp; por otro, documenta problemas concretos de compatibilidad (RMSNorm con centro en cero y la regla DeltaNet troceada en transformers) que afectan a cualquiera que convierta modelos de esta familia. El idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con bloques de atencion completa y bloques gated-DeltaNet (arquitectura `qwen35`), 24 capas |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-2B, una arquitectura `qwen35` de 24 capas con vocabulario de 248.320 tokens y una combinacion de bloques de atencion completa y bloques gated-DeltaNet (mecanismo de atencion lineal con estado recurrente). Sobre esa base se aplico un adaptador LoRA con r=16 y alpha=32 sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El conjunto de entrenamiento consistio en 680 ejemplos escritos manualmente en el estilo del personaje, mas un conjunto de operaciones aritmeticas que debian ser correctas, durante una epoca con tasa de aprendizaje 1e-4. El entrenamiento se realizo en una AMD Radeon RX 6600 de 8 GB con ROCm 7.1 y `HSA_OVERRIDE_GFX_VERSION=10.3.0`, tras descomprimir el GGUF original a bf16 (3,6 GB) para permitir la diferenciacion.

El adaptador se fusiono con la base, se exporto a GGUF y se cuantizo a Q4_K_M (1,27 GB). La model card documenta dos incidencias tecnicas durante este proceso: (1) el RMSNorm de Qwen3.5 esta centrado en cero y calcula `x × (1 + weight)`, mientras que el GGUF ya almacena `1 + weight`, de modo que al cargar los pesos directamente en transformers se aplicaba cada normalizacion a aproximadamente el doble de intensidad, produciendo texto incoherente; (2) la regla DeltaNet troceada en transformers recurre a una sustitucion directa implementada a mano que devuelve NaN en aproximadamente el 7% de las entradas reales (47 de 680 medidas), mientras que la rama de resolucion triangular es estable. No se documenta uso de RLHF ni DPO; el ajuste es exclusivamente supervisado sobre el dataset descrito.

## Capacidades

- Generacion de texto conversacional en ingles con un estilo de personaje dual (voz entusiasta y voz hostil) que alterna dentro de una misma respuesta.
- Aritmetica basica verificable: la model card demuestra multiplicaciones de dos cifras con desglose del calculo (por ejemplo, 17 × 3 = 51).
- Razonamiento de un solo turno y conversacion multi-turno de complejidad baja.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles segun el campo `language` del repositorio.
- Etiquetado como `endpoints_compatible` y `conversational` en Hugging Face, lo que indica compatibilidad con la inferencia gestionada de la plataforma.

## Casos de uso

- Prototipado de personajes conversacionales: el modelo sirve para experimentar con voces duales y cambios de registro dentro de una misma respuesta, con un coste de inferencia minimo (1,27 GB en Q4_K_M) que permite iterar en local.
- Pruebas de integracion con llama.cpp: al ser un GGUF de una arquitectura reciente (`qwen35`), es util para validar el soporte de llama.cpp y de herramientas derivadas (Ollama, LM Studio) sobre modelos hibridos con DeltaNet.
- Educacion sobre pipelines de fine-tune: la model card documenta el ciclo completo (descuantizacion a bf16, LoRA, fusion, exportacion a GGUF, cuantizacion) y dos bugs de conversion, lo que lo convierte en material de referencia para quien aborde tareas similares.
- Demostracion de entrenamiento en hardware AMD de consumo: sirve como caso documentado de fine-tune LoRA en una RX 6600 de 8 GB con ROCm, util para equipos sin acceso a CUDA.
- Generacion de respuestas con tono marcado en entornos controlados: por ejemplo, bots de entretenimiento o experiencias interactivas donde el estilo del personaje es el objetivo y no la precision factual.
- Evaluacion de robustez en modelos pequenos: sus fallos conocidos (eco del system prompt, bucles) lo hacen util como caso de prueba para tecnicas de mitigacion como penalizacion por repeticion o truncado de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para los pesos en Q4_K_M, mas la memoria del contexto y del runtime de llama.cpp; en la practica, cabe holgadamente en GPUs con 4 GB o mas.
- GPU recomendadas: cualquier GPU con soporte para llama.cpp; el autor documento el entrenamiento en una AMD Radeon RX 6600 de 8 GB con ROCm 7.1, por lo que esa tarjeta es un objetivo valido tambien para inferencia.
- Cabe en GPU de consumo: si, incluidas tarjetas de gama baja con 4-8 GB y ejecucion en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con los endpoints gestionados de Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ENA-DreamBBQ-2B-GGUF | 1,88 mil millones | No disponible | Ingles | Apache 2.0 | GGUF (Q4_K_M) | Fine-tune de personaje sobre Qwen3.5-2B; sin benchmarks publicados |
| Qwen3.5-2B (base) | 2 mil millones (aproximado) | No disponible | No disponible | No disponible | Safetensors, GGUF | Modelo base sin ajuste de personaje; capacidades generales superiores en tareas estandar |
| Modelos de 2B de proposito general (familia Qwen, Llama, Gemma) | 1-3 mil millones | Variable | Multilingue en general | Variable | Safetensors, GGUF | Mayor cobertura de tareas y benchmarks publicados; carecen del estilo de personaje especifico |

La comparacion directa con alternativas de la misma categoria es limitada porque no hay benchmarks publicados para este modelo y su proposito es la personificacion, no el rendimiento en tareas estandar. Frente al Qwen3.5-2B base, este fine-tune pierde capacidades generales y multilingues a cambio de un estilo muy concreto; frente a otros modelos de 2-3 mil millones de parametros de proposito general, la diferencia principal es la especializacion y la ausencia de datos de evaluacion.

## Limitaciones y advertencias

- El modelo tiende a repetir el system prompt palabra por palabra (eco), segun reconoce la propia model card, como consecuencia del tamano reducido y del dataset de 680 ejemplos.
- Tiende a entrar en bucles de repeticion ("I am the one. I am the one."), lo que exige penalizacion por repeticion o truncado en produccion.
- El dataset de entrenamiento es muy pequeno y escrito a mano, con una sola epoca; la cobertura de temas y la robustez fuera del personaje son limitadas.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion alto en cualquier tarea factual fuera del personaje y de la aritmetica basica.
- La variante base descrita en la model card es una version "uncensored"; el fine-tune puede producir contenido soez o insultante por diseno del personaje, lo que requiere moderacion si se expone a usuarios finales.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la variante base no censurada utilizada, ya que la model card no detalla su licencia original.
- La longitud de contexto no esta documentada en la informacion disponible.
- Los bugs de conversion documentados (RMSNorm duplicado y NaN en DeltaNet troceado) afectan a la reproducibilidad si se recarga el modelo fuera de llama.cpp; la carga directa en transformers puede producir salidas incorrectas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bejczy/ENA-DreamBBQ-2B-GGUF
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-2B
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.
