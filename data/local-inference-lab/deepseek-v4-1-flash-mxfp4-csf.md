# local-inference-lab/DeepSeek-V4.1-Flash-MXFP4-CSF

## Resumen

DeepSeek-V4.1-Flash-MXFP4-CSF es un contenedor de pesos publicado por local-inference-lab sobre el modelo multimodal DeepSeek-V4.1-Flash de DeepSeek AI. Se trata de una distribucion en formato MXFP4 con escalas de bloque de los expertos enrutados comprimidas sin perdida (CSF): segun la model card, sus tensores son byte a byte identicos a los de local-inference-lab/DeepSeek-V4.1-Flash-lossless-CSF, que describe el layout, el servicio y la verificacion.

El modelo base es un Mixture-of-Experts (MoE) multimodal de 552B parametros de backbone, con arquitectura Causal Encoder-Decoder (CED) de 40 capas (20 de encoder causal y 20 de decoder) y soporte nativo de contexto de hasta un millon de tokens. Procesa imagenes y texto, y genera texto de forma autorregresiva.

Su relevancia para despliegue local radica en dos frentes: por un lado, la cuantizacion MXFP4 reduce el peso en disco y memoria del backbone; por otro, el modelo base incorpora Compressed Sparse Attention 2 (CSA2) y FP4 en la cache KV, que rebajan la huella de KV a 890 bytes por token, aproximadamente un cuarto de la de DeepSeek-V4-Flash. El repositorio ocupa 991,3 GB, por lo que sigue siendo un despliegue de escala servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Causal Encoder-Decoder (CED) de 40 capas (20 encoder causal + 20 decoder), Mixture-of-Experts (MoE) multimodal |
| Parametros totales | 552B en el backbone; 196B adicionales en memoria condicional Engram (total consolidado no disponible) |
| Parametros activos | 8B por token en prefill y 16B por token en decode |
| Longitud de contexto | Hasta 1M tokens (atencion dispersa entrenada a 64K, contexto extendido a 1M a los 34T tokens) |
| Tipos de cuantizacion | MXFP4-CSF (pesos con escalas de bloque de expertos enrutados comprimidas sin perdida); KV cache en FP4 (E2M1 con una escala E4M3 por cada 16 canales) |
| Idiomas soportados | no disponible |
| Licencia | Local Inference Lab License 1.0 (lil-license-1.0, SPDX LicenseRef-LIL-1.0); el modelo base DeepSeek se referencia bajo licencia MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 991,3 GB |
| Experto compartido / expertos enrutados | 1 experto compartido y 384 expertos enrutados por capa MoE; 6 expertos enrutados activados por token |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El backbone sigue una arquitectura Causal Encoder-Decoder (CED) en la que la cache KV global del decoder se proyecta a partir de los estados ocultos finales del encoder, en lugar de derivarse de los estados ocultos de cada capa del decoder. Con este diseno, el modelo activa solo 8B parametros por token durante el prefill y 16B durante el decode. La atencion usa Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y las K del indexador entre capas y reutilizar los indices Top-K. En el decoder, un Hierarchical Sparse Indexer restringe las capas de indexado posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexado en profundidad con independencia de la longitud del contexto. A esto se suman SWA Bounded Replay (que reconstruye los estados KV de ventana deslizante ausentes replicando solo los ultimos n_win tokens, sin persistir SWA KV en SSD), Single-Pass mHC con el kernel Mega-mHC, memoria condicional Engram de 196B parametros con acceso disperso por lookup de token, y decodificacion especulativa DSpark con generacion de borradores semiautorregresiva y verificacion planificada por confianza.

La parte multimodal la aporta un encoder de vision DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling 3x3 pixel-unshuffle, junto con un proyector MLP de dos capas que convierte las imagenes en embeddings visuales procesados conjuntamente con los embeddings de texto desde el inicio del preentrenamiento del modelo de lenguaje. El preentrenamiento se realizo desde cero sobre un corpus multimodal de 45T tokens. El postentrenamiento sigue el paradigma estandar SFT, RL y destilacion on-policy (OPD) sin modificaciones algoritmicas, con los cambios concentrados en el pipeline de datos, incluyendo sintesis automatizada a gran escala de tareas de agente.

Esta distribucion concreta no reentrena el modelo: es un contenedor de pesos cuantizados. La model card indica que las escalas de bloque de los expertos enrutados se han comprimido sin perdida y que los tensores son identicos a los de la variante lossless-CSF.

## Capacidades

- Generacion de texto autorregresiva a partir de entradas de texto e imagen (pipeline image-text-to-text).
- Razonamiento multimodal: procesa imagenes y texto de forma conjunta desde el preentrenamiento, no mediante un adaptador anadido a posteriori.
- Contexto largo: ventana de hasta 1M tokens, con preentrenamiento de atencion dispersa a 64K y extension posterior.
- Flujos de agente y razonamiento multietapa: el postentrenamiento incluye sintesis automatizada de tareas de agente, orientada a cargas con mucha entrada (prefill) y poca salida.
- Decodificacion especulativa integrada (DSpark), con verificacion planificada por confianza.
- Memoria condicional Engram con acceso disperso por lookup de token.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Capacidades de audio o modos de pensamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes que consumen documentos extensos: con 1M tokens de contexto y 8B parametros activos en prefill, resulta adecuado para ingerir expedientes, bases de codigo o historiales completos y razonar sobre ellos sin trocear el material.
- Analisis de documentos escaneados y formularios: el encoder DeepSeek-ViT permite procesar la imagen de la pagina y el texto asociado en el mismo contexto, util para extraccion de datos en entornos administrativos o financieros.
- Automatizacion de tareas de agente multietapa: las tareas sintetizadas durante el postentrenamiento estan orientadas a pipelines donde el modelo planifica, llama a herramientas externas y verifica resultados.
- Servicio de inferencia con cache KV comprimida: con 890 bytes de KV por token, el coste de memoria por sesion concurrente baja lo suficiente como para sostener conversaciones de contexto muy largo en un servidor, aunque sigue requiriendo despliegue multi-GPU.
- Revision asistida de codigo e incidencias en repositorios grandes: la ventana de 1M tokens permite incluir arboles de proyecto amplios y trazas de ejecucion para diagnosticar fallos.
- Despliegue en infraestructura propia con pesos cuantizados: la distribucion MXFP4 reduce el espacio en disco y el ancho de banda de memoria frente a los pesos originales, lo que facilita servir el modelo en clusters propios con GPUs de centro de datos.
- Investigacion sobre atencion dispersa y compresion de KV: al ser una variante cuantizada verificable del modelo base, sirve como referencia para reproducir y auditar el comportamiento de CSA2, SWA Bounded Replay y la cache KV en FP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 991,3 GB, por lo que el modelo no se puede cargar en memoria de una sola GPU de consumo ni en una GPU profesional aislada.
- GPU recomendadas: no disponibles en la informacion proporcionada. Dado el tamano, el despliegue exige un cluster multi-GPU o multi-nodo de clase centro de datos (A100, H100 o equivalentes con memoria agregada suficiente); no se especifica una configuracion concreta.
- GPU de consumo: no cabe en ninguna GPU de consumo. Una RTX 4090 con 24 GB de VRAM es insuficiente por varios ordenes de magnitud.
- Opciones de despliegue: la libreria declarada es transformers; la model card del contenedor remite a la variante lossless-CSF para los detalles de servicio. No se confirman en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El diseno del modelo base declara 8B parametros activos por token en prefill y 16B en decode, lo que orienta el rendimiento hacia cargas con entrada dominante, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KV cache | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-MXFP4-CSF | 552B backbone + 196B Engram | 1M tokens | 890 bytes/token (FP4) | LIL 1.0 | Repositorio de 991,3 GB en HuggingFace |
| DeepSeek-V4.1-Flash (base) | 552B backbone + 196B Engram | 1M tokens | 890 bytes/token (FP4) | MIT (referenciada) | HuggingFace |
| DeepSeek-V4.1-Flash-lossless-CSF | 552B backbone + 196B Engram | 1M tokens | 890 bytes/token (FP4) | no disponible | HuggingFace (tensores identicos segun la model card) |
| DeepSeek-V4-Flash | no disponible | no disponible | ~1/4 de la del V4.1-Flash segun el autor | no disponible | no disponible |

No hay datos de rendimiento publicados que permitan comparar estos modelos en tareas concretas. Tampoco se dispone de informacion sobre alternativas de otros fabricantes en la misma categoria.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni evaluaciones independientes de esta distribucion cuantizada, por lo que no es posible cuantificar la degradacion frente a los pesos originales.
- La licencia aplicable a este repositorio es la Local Inference Lab License 1.0, no la licencia del modelo base. Los terminos completos no se detallan en la informacion disponible mas alla del nombre, la version, la referencia al fichero LICENSE y los identificadores canary; es imprescindible leerlos antes de cualquier uso comercial.
- La licencia del modelo original de DeepSeek se referencia como MIT, pero la model card indica que solo se cambiaron las referencias de licencia para apuntar al texto MIT en LICENSES/MIT.txt; conviene verificar la cadena de licencias antes de redistribuir.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Es un riesgo inherente a los modelos generativos de este tipo, agravado por la ausencia de datos de evaluacion.
- Idiomas soportados: no informados. No se puede asumir un rendimiento homogeneo en castellano ni en otras lenguas.
- Sesgos: no documentados en la informacion proporcionada.
- El campo de pipeline (image-text-to-text) implica capacidades de vision, pero no se detallan limitaciones de resolucion, numero de imagenes por contexto ni tipos de imagen admitidos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- El despliegue requiere infraestructura multi-GPU de gran escala; no es viable en hardware de consumo.
- La fecha de creacion del repositorio (2026-09-29) y la del modelo base deben tenerse en cuenta al planificar su mantenimiento y su compatibilidad con versiones futuras de transformers.

## Enlaces

- Repositorio del modelo: https://huggingface.co/local-inference-lab/DeepSeek-V4.1-Flash-MXFP4-CSF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Variante con tensores identicos: https://huggingface.co/local-inference-lab/DeepSeek-V4.1-Flash-lossless-CSF
- Informe tecnico (PDF): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Sitio de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Texto de licencia MIT referenciado: LICENSES/MIT.txt (dentro del repositorio)
- Texto de la licencia LIL 1.0: LICENSE (dentro del repositorio)

Nota: las busquedas web realizadas no han devuelto ningun resultado relevante sobre este modelo; los enlaces obtenidos corresponden a agencias de comunicacion y anuncios inmobiliarios sin relacion con el contenido de esta ficha.
