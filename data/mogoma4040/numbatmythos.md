# Mogoma4040/numbatMythos

## Resumen

`numbatMythos` es un checkpoint intermedio de preentrenamiento publicado en HuggingFace bajo el identificador `Mogoma4040/numbatMythos`. Segun la model card del autor, corresponderia a un modelo de aproximadamente 14 billones de parametros (14T), 114 capas y una arquitectura hibrida que combina Gated DeltaNet (GDN) con Multi-head Latent Attention (MLA), capas feed-forward de tipo Mixture-of-Experts con 1.224 expertos (top-48 mas 1 compartido) y Multi-Token Prediction. El checkpoint estaria cuantizado en NVFP4 y se presenta como una copia de evaluacion de un entrenamiento interno de Anthropic, con nombre en clave `numbat`, supuestamente citado en una filtracion del codigo fuente de Claude Code de marzo de 2026.

El repositorio incluye una implementacion de referencia completa (`configuration_numbat.py` y `modeling_numbat.py`) que, segun el autor, permite cargar el checkpoint con `load_state_dict(strict=True)` o mediante `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. El tamaño del repositorio es de 7.720,6 GB distribuidos en 772 shards en formato safetensors, con un total de 6.849.377.242.584 parametros segun los metadatos reales de safetensors.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: la procedencia del checkpoint no esta verificada de forma independiente, la model card contiene afirmaciones no contrastables (filtracion de codigo, origen Anthropic) y el modelo se encuentra en un estado de preentrenamiento sin post-entrenamiento ni RLHF. No se dispone de pipeline, licencia, idiomas ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Gated DeltaNet (GDN) + Multi-head Latent Attention (MLA) con capas MoE y Multi-Token Prediction |
| Parametros totales | 6.849.377.242.584 (~6,85T segun safetensors); la model card declara ~14T |
| Parametros activos | No disponible (MoE con 1.224 expertos, top-48 + 1 compartido; no se especifica el numero de parametros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (E4M3 scale blocks con payloads E2M1); tag `8-bit` y `modelopt` en HuggingFace |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (772 shards, ~10,6 GB por shard), mas implementacion de referencia en Python |
| Capas | 114 |
| Tokenizer | Byte-level BPE, 131.072 tokens |
| Paso de entrenamiento | 1.830.000 de ~1.960.000 (preentrenamiento) |
| Tamano del repo | 7.720,6 GB |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un stack hibrido que alterna capas de Gated DeltaNet (un mecanismo de atencion lineal con estado recurrente) y Multi-head Latent Attention (MLA, la atencion con compresion de KV cache popularizada por DeepSeek), combinado con capas feed-forward de tipo Mixture-of-Experts. El MoE consta de 1.224 expertos con enrutamiento top-48 mas un experto compartido, lo que implica un grado de activacion muy alto por token. Ademas, se incluye una capa de Multi-Token Prediction (MTP) accesible mediante `NumbatForCausalLM.draft`, lo que sugiere soporte para decodificacion especulativa o prediccion multi-token durante el entrenamiento.

El checkpoint corresponde, segun el autor, al paso 1.830.000 de un entrenamiento de aproximadamente 1.960.000 pasos, es decir, un estado de preentrenamiento casi completo pero sin post-entrenamiento ni RLHF. Los pesos estarian cuantizados en NVFP4 (formato de 4 bits con bloques de escala E4M3 y payloads E2M1), una decision que el autor justifica por la necesidad de ejecutar evaluaciones en un slice de Trainium2 en lugar del cluster completo de entrenamiento. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni detalles sobre el proceso de alineamiento. La implementacion de referencia incluida en el repositorio permite, teoricamente, cargar los tensores y ejecutar el forward del trunk y de la capa MTP.

## Capacidades

- Generacion de texto autoregresiva basica, limitada al estado de preentrenamiento (sin instrucciones ni alineamiento).
- Razonamiento y conocimiento factual derivados del preentrenamiento, sin garantias de calidad conversacional.
- Soporte de Multi-Token Prediction mediante `NumbatForCausalLM.draft`, potencialmente util para decodificacion especulativa.
- Arquitectura MoE de gran escala con 1.224 expertos, orientada a capacidad de modelado elevada.
- Tokenizer byte-level BPE de 131.072 tokens, lo que sugiere cobertura multilingue amplia (aunque no se detallan los idiomas).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento explicito.
- No se documenta alineamiento, filtrado de seguridad ni comportamiento conversacional.

## Casos de uso

- Investigacion sobre arquitecturas hibridas GDN/MLA: el checkpoint y la implementacion de referencia permiten estudiar el comportamiento de una pila que combina atencion lineal con MLA y MoE a gran escala, util para grupos que investigan eficiencia de atencion y enrutamiento de expertos.
- Estudio de cuantizacion NVFP4: al ser una copia de evaluacion cuantizada, sirve para analizar la fidelidad de NVFP4 frente a BF16 en un modelo de gran escala, incluyendo el comportamiento de los bloques de escala E4M3 y los payloads E2M1.
- Experimentos de decodificacion especulativa con MTP: la capa `draft` permite probar tecnicas de prediccion multi-token y comparar su tasa de aceptacion frente a decodificacion autoregresiva clasica.
- Analisis de enrutamiento MoE a gran escala: con 1.224 expertos y top-48, el checkpoint permite estudiar balanceo de carga, colapso de expertos y patrones de activacion en un modelo de este tamano.
- Reproducibilidad de evaluaciones: dado que el autor menciona que los evals se ejecutaron con un runtime Neuron-parallel interno, el checkpoint puede usarse para intentar reproducir esas evaluaciones con la implementacion de referencia en un solo dispositivo o en un cluster reducido.
- Formacion y docencia en sistemas distribuidos: la carga de 772 shards y ~7,7 TB de tensores constituye un caso practico de gestion de checkpoints masivos, indexado safetensors y carga con `strict=True`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existe una salida de eval harness en `ckpt_metadata.json`, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable. Con ~6,85T parametros en NVFP4 (4 bits), el peso de los tensores ronda los 3,4 TB, a lo que hay que sumar overhead de escalas, KV cache y activaciones. La model card afirma que se necesitan aproximadamente 85 Trainium2 solo para alojar los pesos.
- GPU recomendadas: no es viable en GPU consumer. Se requeriria un cluster de GPUs de centro de datos (H100, H200, B200 o equivalentes) o aceleradores Trainium2, con paralelismo de tensor y de expertos.
- Cabe en consumer GPU: no. Ni siquiera en configuraciones multi-GPU de gama alta (RTX 4090, etc.).
- Opciones de despliegue: la model card solo menciona la implementacion de referencia `modeling_numbat.py` y un runtime interno Neuron-parallel. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otras herramientas estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento ni especificaciones verificables de modelos comparables en la misma categoria (modelos MoE de escala frontera con atencion hibrida), y la naturaleza no verificada del checkpoint impide establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Procedencia no verificada: la atribucion a Anthropic y a una filtracion de codigo fuente no esta confirmada de forma independiente; debe tratarse como una afirmacion del autor.
- Estado de preentrenamiento: sin post-entrenamiento ni RLHF, la salida es texto crudo de completado, no apta para uso conversacional o de produccion.
- Discrepancia de parametros: la model card declara ~14T, mientras que los metadatos de safetensors indican ~6,85T. Esta diferencia no se explica en la informacion disponible.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; ante la ausencia de licencia explicita, debe asumirse restriccion total por defecto.
- Riesgo de alucinacion: alto, propio de un modelo sin alineamiento y sin datos de evaluacion publicados.
- Sesgos: no documentados; un modelo preentrenado sin filtrado hereda sesgos del corpus de entrenamiento.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto ni los idiomas soportados.
- Requisitos de hardware extremos: ~7,7 TB de tensores y necesidad de un cluster dedicado hacen inviable cualquier despliegue fuera de entornos de investigacion con infraestructura de gran escala.
- Riesgo de seguridad: la carga de codigo remoto (`trust_remote_code=True`) ejecuta Python del autor; debe auditarse antes de su uso.
- Posible contenido no verificado o malicioso: dado que el repositorio no tiene descargas ni likes y la procedencia es dudosa, se recomienda extremar las precauciones antes de descargar o ejecutar cualquier artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mogoma4040/numbatMythos
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
