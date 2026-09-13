# schwyzquant/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) orientado a cargas de trabajo agénticas con entradas muy largas. Segun la model card, combina un backbone de 552B parametros con un encoder de vision (DeepSeek-ViT) y un modulo de memoria condicional Engram de 196B parametros; el repositorio de HuggingFace publicado por el usuario schwyzquant declara 763.205.315.794 parametros totales en safetensors y un tamano de repo de 510,3 GB. El modelo procesa nativamente imagenes y texto, y genera texto de forma autoregresiva con una ventana de contexto de hasta un millon de tokens.

Su rasgo diferencial declarado es la compresion de la cache KV. Frente a DeepSeek-V4-Flash, reduce la huella de cache KV global por token a 890 bytes (aproximadamente 1/4) y la cache KV persistente a alrededor de 1/8, mediante atencion dispersa CSA2, cacheado FP4 de la KV principal en formato E2M1 con una escala E4M3 por cada 16 canales y la tecnica SWA Bounded Replay. La arquitectura Causal Encoder-Decoder (CED) permite activar solo 8B parametros por token en prefill y 16B en decode, lo que abarata el coste de las cargas con mucho input y poco output.

La relevancia practica del modelo esta en ese perfil: agentes que leen repositorios, documentos o capturas de pantalla muy extensos y devuelven respuestas cortas. La publicacion analizada es, no obstante, un repositorio de terceros con 0 descargas y 0 likes en el momento de la consulta, la model card esta truncada en la seccion de evaluacion y no se han facilitado cifras de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE causal encoder-decoder (CED) de 40 capas: 20 capas de encoder causal + 20 de decoder; atencion dispersa CSA2, Single-Pass mHC, memoria condicional Engram, decodificacion especulativa DSpark; encoder de vision DeepSeek-ViT con 2D-RoPE y downsampling 3x3 pixel-unshuffle |
| Parametros totales | 763.205.315.794 (dato de safetensors en el repositorio). La model card declara 552B en el backbone mas 196B en el modulo Engram |
| Parametros activos | 8B por token en prefill y 16B por token en decode (MoE con 1 experto compartido y 384 expertos enrutados por capa, 6 expertos enrutados activados por token) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit y FP8 (etiquetas del repositorio); cache KV principal en FP4 (formato E2M1, escala E4M3 por cada 16 canales) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (libreria transformers) |
| Pipeline declarado | image-text-to-text |
| Cache KV por token | 890 bytes (global); cache KV persistente ~1/8 de la de DeepSeek-V4-Flash |

## Arquitectura y entrenamiento

El modelo adopta una arquitectura Causal Encoder-Decoder: la cache KV global del decoder se proyecta a partir de los estados ocultos finales del encoder, en lugar de derivarse de los estados ocultos de cada capa del decoder. Segun la model card, esto permite activar 8B parametros por token en prefill y 16B en decode, lo que reduce el coste computacional en escenarios con mucho input y poco output. Sobre esa base se anaden varias piezas: SWA Bounded Replay reconstruye los estados KV de sliding window attention ausentes replicando solo los ultimos n_win tokens, evitando persistir esa cache en SSD; Compressed Sparse Attention 2 (CSA2) asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar indices Top-K de atencion dispersa; y un Hierarchical Sparse Indexer restringe las capas de indexado posteriores a un pool de candidatos construido por la primera capa en modo Full. Se suman Single-Pass mHC con el kernel Mega-mHC, la memoria condicional Engram de 196B parametros con acceso disperso por lookup de tokens, y la decodificacion especulativa DSpark con generacion de borradores semiautoregresiva y verificacion programada por confianza.

El entrenamiento se realiza desde cero sobre un corpus multimodal de 45T tokens. La atencion dispersa se entrena con longitud de secuencia de 64K y el contexto se extiende hasta 1M tokens a partir de los 34T tokens. El post-entrenamiento sigue el paradigma estandar SFT, RL y destilacion on-policy (OPD) sin modificaciones algoritmicas; los cambios se concentran en el pipeline de datos, con sintesis automatica a gran escala de tareas y entornos de agente y escalado progresivo de datos, tareas y rollouts. El modelo expone un ajuste de esfuerzo de razonamiento continuo con valores enteros de 1 a 100 que intercambia coste de inferencia por precision. La parte multimodal emplea un encoder de vision DeepSeek-ViT entrenado desde cero y un proyector MLP de dos capas que convierte las imagenes en embeddings visuales procesados conjuntamente con el texto desde el inicio del preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva con contexto de hasta 1.000.000 tokens.
- Procesamiento multimodal nativo de imagen y texto (pipeline image-text-to-text): el encoder DeepSeek-ViT y el proyector de dos capas integran las imagenes en el espacio de embeddings del modelo de lenguaje.
- Razonamiento con esfuerzo configurable: el ajuste entero de 1 a 100 permite modular la profundidad de razonamiento y el coste por consulta.
- Orientacion a agentes: el post-entrenamiento incluye sintesis automatica de tareas y entornos de agente, lo que apunta a soporte de flujos multi-paso.
- Decodificacion especulativa DSpark integrada en la arquitectura, con verificacion programada por confianza.
- Compresion agresiva de cache KV, pensada para sesiones largas con muchas entradas y salidas cortas.
- Tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Idiomas soportados: no disponible; la model card no incluye listado de idiomas.
- Capacidades de audio o modos de pensamiento explicitos: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 1M tokens de contexto y 890 bytes de cache KV por token, un millon de tokens ocupa aproximadamente 890 MB de cache, lo que permite cargar manuales, normativas o expedientes completos sin troceado agresivo.
- Agentes autonomos sobre repositorios de codigo: el modelo puede leer un arbol de ficheros completo, razonar sobre dependencias y devolver parches, aprovechando el perfil de 8B parametros activos en prefill para entradas muy largas.
- Atencion al cliente con soporte de imagenes: al ser image-text-to-text, puede procesar capturas de pantalla, fotos de producto o documentos escaneados junto al historial de conversacion multi-turno.
- Inspeccion visual asistida por lotes: clasificacion y descripcion de imagenes industriales o medicas con contexto textual de referencia largo, ajustando el esfuerzo de razonamiento segun la criticidad del caso.
- Investigacion y sintesis bibliografica: consolidacion de decenas de articulos en una sola ventana de contexto para producir resumenes comparativos y extraer tablas de resultados.
- Pipelines de enriquecimiento de datos sinteticos: generacion de tareas y entornos de agente, replicando el propio pipeline de post-entrenamiento del modelo para crear datasets de entrenamiento.
- Auditoria de contratos y expedientes: extraccion de clausulas y deteccion de contradicciones entre documentos largos, con la cache KV comprimida reduciendo el coste de mantener sesiones persistentes.
- Despliegue con coste escalonado: enrutado de consultas sencillas con esfuerzo 1-10 y de consultas complejas con esfuerzo alto, usando el mismo modelo en lugar de dos modelos distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado "Evaluation Results" con una seccion de "Base Model" que describe la metodologia (evaluacion en un framework interno y criterio de equivalencia cuando las puntuaciones difieren en menos de 0,3), pero los valores numericos estan truncados en la informacion recuperada. Asimismo, se referencian dos figuras (rendimiento en benchmarks agenticos y tamano de cache KV por token a lo largo de las generaciones de DeepSeek) cuyos datos no se han facilitado.

Los unicos datos cuantitativos de rendimiento disponibles son de eficiencia, no de calidad:

| Metrica | Valor declarado |
|---|---|
| Cache KV global por token | 890 bytes |
| Reduccion de cache KV frente a DeepSeek-V4-Flash | ~4x |
| Reduccion de cache KV frente a DeepSeek-V1 | ~437x |
| Cache KV persistente frente a DeepSeek-V4-Flash | ~1/8 |
| Parametros activos en prefill | 8B por token |
| Parametros activos en decode | 16B por token |

## Requisitos de hardware

- VRAM para pesos: el repositorio ocupa 510,3 GB y declara 8-bit y FP8. Con 763,2B parametros, un almacenamiento completo en 8 bits requeriria del orden de 763 GB, por lo que el tamano de 510,3 GB sugiere una mezcla de precisiones o componentes almacenados en menor precision. Estas cifras son calculos propios a partir de los datos del repositorio, no datos publicados por el autor.
- No cabe en ninguna GPU de consumo. Una RTX 4090 (24 GB) o una RTX 5090 no pueden alojar los pesos ni repartidos en un numero razonable de unidades.
- Configuraciones de servidor: se necesitan nodos multi-GPU. Como referencia, 8xH100 de 80 GB suman 640 GB, por debajo de los 763 GB si todos los pesos estan en 8 bits; serian necesarias del orden de 10-12xH100 80 GB, o bien 4-5xB200 de 192 GB (768-960 GB) para pesos, cache y activaciones. Estimacion propia, no confirmada por el autor.
- Cache KV: a 890 bytes por token, 128K tokens ocupan aproximadamente 114 MB y 1M tokens aproximadamente 890 MB. Es un requisito marginal frente al peso de los parametros.
- Opciones de despliegue: la model card no especifica motores de inferencia soportados. El repositorio declara compatibilidad con transformers y con endpoints_compatible, e incluye el tag deepseek_v41, lo que sugiere soporte en versiones recientes de transformers. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las generaciones citadas en la propia model card, y unicamente en terminos de cache KV. No hay datos de parametros, contexto ni benchmarks de los modelos de comparacion.

| Modelo | Cache KV global por token | Cache KV persistente | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 890 bytes | ~1/8 de DeepSeek-V4-Flash | 763,2B totales (552B backbone + 196B Engram) | 1M tokens | MIT (segun el repositorio) | Repositorio de terceros con 0 descargas |
| DeepSeek-V4-Flash | ~3.560 bytes (derivado de la relacion ~4x indicada) | Referencia | No disponible | No disponible | No disponible | No disponible |
| DeepSeek-V1 | ~389 KB (derivado de la relacion ~437x indicada) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas comparables de la misma categoria (modelos MoE multimodales de escala superior a 500B parametros con contexto de 1M tokens), por lo que no se puede establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Repositorio de terceros: la publicacion corresponde al usuario schwyzquant, no a la organizacion oficial deepseek-ai; la model card enlaza al logo, la web, el chat y el informe tecnico de DeepSeek AI, pero la ficha de HuggingFace analizada no es la oficial. Conviene verificar el origen de los pesos antes de usarlos en produccion.
- Sin traccion verificable: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-09-12 sin historial posterior.
- Sin benchmarks publicados: no hay cifras de MMLU, HumanEval, GSM8K ni de capacidad agentica; la seccion de evaluacion de la model card esta truncada.
- Discrepancia de parametros: la model card declara 552B en el backbone y 196B en Engram (748B en total), mientras que safetensors declara 763,2B. La diferencia podria corresponder al encoder de vision y a otros componentes, pero no se explica en la informacion disponible.
- Idiomas no declarados: se desconoce el soporte real multilingue y el comportamiento en castellano.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado tasas de error, evaluaciones de factualidad ni resultados de red teaming.
- Contexto de 1M tokens: aunque la ventana este soportada, no se han publicado resultados de recuperacion en el extremo superior del contexto (needle-in-a-haystack ni similares), por lo que la degradacion a distancias largas es desconocida.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con obligacion de incluir el aviso de copyright y la licencia. No se especifican terminos adicionales ni restricciones de uso aceptable en la informacion disponible.
- Requisitos de despliegue muy altos: cientos de gigabytes de pesos implican infraestructura multi-GPU de centro de datos, no entornos de un solo nodo con GPU de consumo.
- Dependencia de implementaciones especificas: caracteristicas como CSA2, FP4 KV en E2M1, DSpark o el kernel Mega-mHC requieren soporte en el motor de inferencia; su ausencia puede degradar el rendimiento o impedir la ejecucion.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: todos los enlaces recuperados correspondian a guias turisticas de Venecia, por lo que no aportan informacion tecnica.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/schwyzquant/DeepSeek-V4.1-Flash
- Informe tecnico referenciado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Twitter de DeepSeek AI: https://twitter.com/deepseek_ai
- Licencia declarada en el repositorio: https://huggingface.co/schwyzquant/DeepSeek-V4.1-Flash/blob/main/LICENSE
- Resultados de busqueda web: sin enlaces relevantes sobre el modelo en la informacion disponible.
