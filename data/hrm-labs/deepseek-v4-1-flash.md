# hrm-labs/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, distribuido en el repositorio de Hugging Face bajo el identificador `hrm-labs/DeepSeek-V4.1-Flash`. El modelo procesa de forma nativa imagenes y texto, y genera texto de forma autorregresiva. Su propuesta central es la compresion agresiva de la cache KV: reduce su huella por token a unos 890 bytes, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y unas 437 veces menor que la de DeepSeek-V1, lo que abarata drasticamente las cargas de trabajo con entradas muy largas, tipicas de agentes.

La arquitectura es un transformer de 40 capas organizado como encoder-decoder causal (CED): 20 capas de encoder causal seguidas de 20 capas de decoder. El backbone MoE declara 552B parametros, con 8B activos por token durante el prefill y 16B durante la decodificacion. El checkpoint publicado en safetensors suma 763.205.315.794 parametros totales (incluyendo el encoder de vision y el modulo de memoria condicional Engram). Soporta contextos de hasta un millon de tokens.

El modelo resulta relevante para quien necesite inferencia multimodal de contexto largo con coste controlado, ya que combina decodificacion especulativa (DSpark), atencion dispersa comprimida (CSA2) y un razonamiento con esfuerzo configurable (entero de 1 a 100). La licencia MIT facilita su adopcion comercial, aunque el tamano del checkpoint (510,3 GB en el repositorio) condiciona fuertemente el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con encoder-decoder causal (CED), 40 capas (20 encoder + 20 decoder) |
| Parametros totales | 763.205.315.794 (safetensors); backbone declarado de 552B |
| Parametros activos | 8B por token en prefill; 16B por token en decode |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit, FP8 (segun tags); cache KV principal en FP4 (formato E2M1 con escala E4M3 por cada 16 canales) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Causal Encoder-Decoder: la cache KV global del decoder se proyecta a partir de los estados ocultos finales del encoder, en lugar de derivarse de las capas del propio decoder. Esto permite activar solo 8B parametros por token en prefill y 16B en decode. La tecnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante que faltan replicando unicamente los ultimos n_win tokens, lo que evita persistir esa cache en SSD y reduce la huella persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

Sobre la atencion, CSA2 (Compressed Sparse Attention 2) asigna a cada capa uno de tres modos estaticos (Full, Reindex, Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los indices de atencion dispersa Top-K. En el decoder, un indexador disperso jerarquico restringe las capas de indexacion posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexador con independencia de la longitud del contexto. La cache KV principal en FP4 deja la huella global en 890 bytes por token.

El bloque MoE usa 1 experto compartido y 384 expertos enrutados por capa, activando 6 expertos enrutados por token. Se suman componentes como Single-Pass mHC (mezcla del flujo residual con kernel Mega-mHC), memoria condicional Engram (196B parametros accedidos de forma dispersa mediante lookup por token) y decodificacion especulativa DSpark (generacion de borradores semiautorregresiva con verificacion programada por confianza). El encoder de vision, DeepSeek-ViT, se entreno desde cero con 2D-RoPE y downsampling pixel-unshuffle 3x3, y un proyector MLP de dos capas convierte las imagenes en embeddings visuales procesados junto al texto desde el inicio del preentrenamiento.

El preentrenamiento se realizo desde cero sobre un corpus multimodal de 45T tokens, con atencion dispersa entrenada a longitud de secuencia de 64K y contexto extendido a 1M tokens a los 34T tokens. El postentrenamiento sigue el paradigma SFT → RL → destilacion on-policy (OPD) sin modificaciones algoritmicas; los cambios sustantivos estan en el pipeline de datos, con sintesis automatizada a gran escala de tareas y entornos de agente y escalado progresivo de datos, tareas y rollouts.

## Capacidades

- Generacion de texto autorregresiva y razonamiento con esfuerzo controlable mediante un ajuste entero de 1 a 100 que intercambia coste de inferencia por precision.
- Procesamiento nativo de imagenes y texto (pipeline image-text-to-text), con encoder de vision propio integrado desde el preentrenamiento.
- Contexto de hasta un millon de tokens, adecuado para documentos extensos, repositorios de codigo y trayectorias de agente largas.
- Capacidades de agente y razonamiento multi-paso, reforzadas por el entrenamiento con tareas y entornos sinteticos de agente.
- Decodificacion especulativa DSpark para acelerar la generacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible como capacidad separada; el control de razonamiento se realiza mediante el parametro de esfuerzo 1-100.

## Casos de uso

- Agentes autonomos con contexto largo: el modelo puede mantener trayectorias de multiples pasos sobre ventanas de hasta 1M tokens con una cache KV de solo 890 bytes por token, lo que reduce el coste de memoria en cargas con muchas entradas y pocas salidas (prefill de 8B parametros activos).
- Analisis de documentos extensos con imagenes: informes, contratos o papers con figuras y tablas pueden procesarse de una sola pasada gracias a la entrada multimodal nativa y al contexto de un millon de tokens.
- Asistentes de codigo sobre repositorios completos: la ventana de 1M tokens permite incluir varios ficheros y el historial de cambios; la decodificacion especulativa DSpark acelera la generacion en tareas de completado.
- Automatizacion de soporte tecnico multimodal: el modelo puede recibir capturas de pantalla o diagramas junto con texto y responder en conversaciones multi-turno largas, con el esfuerzo de razonamiento ajustado segun la complejidad del ticket.
- Extraccion de informacion estructurada de documentos escaneados: combinando vision y texto, se pueden transcribir y normalizar datos de facturas, formularios o informes en un unico pipeline.
- Razonamiento con presupuesto controlado: en produccion se puede fijar el parametro de esfuerzo (1-100) para equilibrar latencia y precision segun el SLA del servicio, usando valores bajos en tareas simples y altos en analisis complejo.
- Investigacion sobre compresion de cache KV: la arquitectura CSA2, SWA Bounded Replay y la cache FP4 sirven como referencia para estudiar tecnicas de atencion dispersa y compresion en modelos de contexto largo.

## Benchmarks y rendimiento

La model card menciona resultados de evaluacion para el modelo base y graficos de rendimiento en benchmarks de agente (Figura 1a), pero los valores numericos concretos no estan incluidos en la informacion proporcionada (el texto se corta en la seccion "Evaluation Results"). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en safetensors ocupa 510,3 GB; en FP8 el peso se situa en torno a los 380 GB (estimacion a partir del numero de parametros), y en formatos de 4 bits alrededor de 190 GB (estimacion). Los 8B parametros activos en prefill y 16B en decode reducen el coste computacional, pero no el de almacenamiento de pesos.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el despliegue requiere nodos multi-GPU de clase centro de datos (A100, H100 o superiores) con agregacion de memoria suficiente para el checkpoint.
- Cabe en GPU de consumo: no. Los 510,3 GB del checkpoint exceden con holgura la VRAM de cualquier GPU de consumo actual (RTX 4090 con 24 GB).
- Opciones de despliegue: libreria transformers (soporte declarado); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. La decodificacion especulativa DSpark y la reduccion de cache KV estan disenadas para mejorar el throughput en cargas de agente, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763B totales (552B backbone); 8B/16B activos | 1M tokens | 890 bytes (FP4) | MIT | Hugging Face (hrm-labs y deepseek-ai) |
| DeepSeek-V4-Flash | 291B | No disponible | Aproximadamente 4x mayor que V4.1-Flash (3.560 bytes, derivado de la reduccion de 4x) | No disponible | Hugging Face (deepseek-ai) |
| DeepSeek-V1 | No disponible | No disponible | Aproximadamente 437x mayor que V4.1-Flash (unos 389 KB, derivado) | No disponible | No disponible |

Las cifras de cache KV de DeepSeek-V4-Flash y DeepSeek-V1 se derivan de los factores de reduccion citados en la model card (4x y 437x respectivamente) y deben tomarse como estimaciones. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; el modelo se entrena sobre un corpus web a gran escala, por lo que es previsible que herede sesgos, pero no se documentan.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo de gran escala, requiere verificacion en aplicaciones de alta precision.
- Limitaciones de contexto o idioma: el contexto maximo es de 1M tokens, pero el rendimiento mas alla de la longitud de entrenamiento extendida (1M a 34T tokens) no esta documentado. Los idiomas soportados no se especifican.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribucion y sin garantias; conviene revisar los terminos exactos del fichero LICENSE del repositorio.
- Caveats de produccion: el checkpoint de 510,3 GB exige infraestructura multi-GPU de centro de datos; el ajuste de esfuerzo 1-100 introduce una variable de coste que debe calibrarse por caso de uso; el soporte en frameworks de inferencia de alto rendimiento (vLLM, TGI) no esta confirmado en la informacion disponible.
- El repositorio consultado pertenece a `hrm-labs` y no al organizador oficial `deepseek-ai`; conviene verificar la procedencia y la integridad de los pesos antes de desplegarlos en produccion.

## Enlaces

- Hugging Face (hrm-labs): https://huggingface.co/hrm-labs/DeepSeek-V4.1-Flash
- Hugging Face (deepseek-ai): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Informe tecnico (referenciado en la model card): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Web oficial: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- Organizacion en Hugging Face: https://huggingface.co/deepseek-ai
- Twitter/X: https://twitter.com/deepseek_ai
