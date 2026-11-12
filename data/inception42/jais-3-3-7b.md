# inception42/Jais-3-3.7B

## Resumen

Jais-3-3.7B es el miembro denso de menor tamano de la familia Jais-3, desarrollada por Inception (Inception42/IFM) como continuacion de la saga Jais de modelos bilingues arabe-ingles. Se trata de un modelo decoder-only de 3.700 millones de parametros (nominales; el checkpoint en safetensors declara 5.058.255.360 parametros reales) disenado para generacion de texto, razonamiento y conversacion, con una ventana de contexto declarada de 512.000 tokens, una cifra excepcional para su categoria de tamano.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y llega acompanado de un ecosistema de formatos ya preparados por el autor: FP8, GGUF para llama.cpp y Ollama, y variantes MLX (4-bit, 8-bit y bf16) para Apple Silicon. Esa disponibilidad multi-formato reduce la friccion de despliegue tanto en servidores como en equipos de consumo.

Su relevancia actual radica en dos factores: por un lado, cubre el hueco de modelos densos pequenos con contexto ultralargo y foco real en arabe (un idioma historicamente infrarrepresentado en el ecosistema open source); por otro, su licencia permisiva y su huella de memoria contenida lo convierten en candidato para despliegues en produccion con presupuesto de GPU limitado. La model card incluye comparativas declaradas frente a Qwen3.5-4B, Gemma 4 E2B, granite-4.0-h-3b-ar y Falcon-H1-3B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 5.058.255.360 (segun safetensors); 3.7B nominales |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512K tokens (declarado en model card) |
| Tipos de cuantizacion | FP8, GGUF (llama.cpp/Ollama), MLX 4-bit, MLX 8-bit, MLX bf16 |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code); GGUF y MLX en repos derivados |

## Arquitectura y entrenamiento

La informacion disponible confirma una arquitectura transformer decoder-only de tipo denso, sin mezcla de expertos (MoE), con 3.7B parametros nominales y una ventana de contexto de 512K tokens. El repositorio declara `custom_code` en transformers, lo que implica que la implementacion de referencia requiere `trust_remote_code=True` y que parte del codigo de modelado (posiblemente relacionado con el mecanismo de atencion o el escalado de contexto) no es el estandar de la libreria. El tag `k2_horizon` aparece asociado al modelo, aunque no se detalla su significado en la informacion proporcionada.

No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, atencion dispersa) mas alla de la propia ventana de contexto extendida. Cualquier afirmacion adicional sobre el pipeline de entrenamiento seria especulativa.

## Capacidades

- Generacion de texto bilingue arabe-ingles con calidad conversacional (tags `conversational` y `text-generation`).
- Razonamiento explicito (tag `reasoning`), orientado a tareas de varios pasos.
- Procesamiento de contexto ultralargo: hasta 512K tokens declarados, adecuado para documentos extensos, codebases o historiales de conversacion largos.
- Soporte nativo de arabe, incluyendo variantes regionales y texto mixto arabe-ingles.
- Integracion con el ecosistema transformers, con pesos en safetensors y codigo personalizado.
- Despliegue en llama.cpp y Ollama mediante los pesos GGUF publicados por el autor.
- Ejecucion en Apple Silicon mediante las variantes MLX (4-bit, 8-bit, bf16).
- No se documenta soporte de tool calling, function calling, vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede mantener conversaciones multi-turno con historiales muy largos gracias a la ventana de 512K tokens, lo que permite conservar todo el contexto de un cliente a lo largo de una sesion sin truncar.
- Procesamiento de documentos legales o administrativos en arabe: resumen, extraccion de clausulas y respuesta a preguntas sobre contratos extensos que superan con creces el contexto tipico de modelos de 3-4B.
- Analisis de codebases completas: con 512K tokens de contexto es viable cargar repositorios medianos y realizar tareas de explicacion, busqueda de bugs o generacion de tests sobre el codigo completo.
- Asistente de investigacion bilingue: sintesis de articulos y notas en arabe e ingles, con capacidad de razonamiento multi-paso sobre fuentes combinadas.
- Despliegue en edge o en equipos de desarrollo: las variantes GGUF y MLX permiten ejecutar el modelo en portatiles Apple Silicon o en estaciones con GPU de consumo, habilitando prototipado local sin infraestructura cloud.
- Generacion de contenido editorial en arabe: redaccion, reescritura y adaptacion de tono en medios digitales, con la ventaja de una licencia Apache 2.0 que no impone restricciones comerciales.
- Moderacion y clasificacion de texto a gran escala: el coste por token de un modelo denso de 3.7B es bajo, lo que permite procesar volumenes altos de contenido en pipelines de produccion.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.5-4B, Gemma 4 E2B, granite-4.0-h-3b-ar y Falcon-H1-3B-Instruct, pero los valores numericos de las metricas no estan recogidos en la informacion proporcionada (la tabla aparece truncada y solo se muestran las filas de parametros, parametros activos y arquitectura). Por tanto:

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 10 GB solo para pesos (5.058 millones de parametros), mas overhead de activaciones y cache KV; con contexto de 512K la cache KV puede crecer de forma significativa y requerir tecnicas de atencion eficiente o cuantizacion de cache.
- VRAM estimada en FP8: en torno a 5-6 GB para pesos.
- VRAM estimada en GGUF Q4: aproximadamente 3-4 GB para pesos, dependiendo del esquema exacto.
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S o A10G para despliegues concurrentes; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contextos moderados.
- GPU de consumo: cabe en RTX 3090/4090, RTX 4080 y similares usando cuantizacion FP8 o GGUF Q4/Q5; en contextos muy largos la cache KV puede forzar cuantizacion adicional o limitar el batch.
- Apple Silicon: las variantes MLX 4-bit y 8-bit estan pensadas para Macs con memoria unificada; un Mac con 16-32 GB puede ejecutar el modelo en 4-bit.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), vLLM (si soporta el codigo custom), llama.cpp, Ollama y MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|---|
| Jais-3-3.7B | 3.7B (5.058M reales) | 3.7B | Densa | 512K | Apache 2.0 |
| Qwen3.5-4B | 4B | 4B | Densa | no disponible | no disponible |
| Gemma 4 E2B | 5B | 2.3B | Densa | no disponible | no disponible |
| granite-4.0-h-3b-ar | 3B | 3B | Densa | no disponible | no disponible |
| Falcon-H1-3B-Instruct | 3B | 3B | Densa | no disponible | no disponible |

Jais-3-3.7B destaca frente a sus comparables por la ventana de contexto declarada (512K) y por la licencia Apache 2.0, mas permisiva que las habituales en modelos de Google (Gemma) o IBM (Granite). En cambio, su numero de parametros reales (5.058M) es superior al nominal, lo que implica mayor huella de memoria que un 3B convencional. Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgos; al estar entrenado principalmente en arabe e ingles, el rendimiento en otros idiomas (incluido el castellano) sera previsiblemente pobre o inexistente.
- Alucinacion: como todo modelo generativo de 3.7B, el riesgo de alucinacion es alto en tareas factuales, especialmente sin recuperacion aumentada (RAG).
- Contexto: aunque se declaran 512K tokens, no se aportan resultados de benchmarks de contexto largo (needle-in-a-haystack, RULER); la calidad en el extremo de la ventana no esta verificada en la informacion disponible.
- Codigo custom: el uso de `custom_code` obliga a `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los repos derivados (FP8, GGUF, MLX) por si anaden terminos adicionales.
- Idiomas: no hay soporte declarado de castellano ni de otras lenguas; no debe asumirse capacidad multilingue general.
- Produccion: la ausencia de benchmarks publicados y de documentacion sobre el entrenamiento dificulta la evaluacion rigurosa antes de adoptarlo; se recomienda validacion propia con el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inception42/Jais-3-3.7B
- Coleccion Jais-3 (IFM): https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- Variante FP8: https://huggingface.co/IFM/Jais-3-3.7B-FP8
- Variante GGUF (llama.cpp/Ollama): https://huggingface.co/IFM/Jais-3-3.7B-GGUF
- Variante MLX 4-bit: https://huggingface.co/IFM/Jais-3-3.7B-MLX-4bit
- Variante MLX 8-bit: https://huggingface.co/IFM/Jais-3-3.7B-MLX-8bit
- Variante MLX bf16: https://huggingface.co/IFM/Jais-3-3.7B-MLX-bf16
- Paper de referencia (arXiv:2611.10224): https://arxiv.org/abs/2611.10224
