# ikigai84/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) que procesa texto e imagenes de forma nativa y genera texto de manera autorregresiva, con soporte de contextos de hasta un millon de tokens. La model card declara 552.000 millones de parametros de backbone mas 196.000 millones de parametros de memoria condicional Engram, lo que concuerda con los 763.205.315.794 parametros totales (~763 B) leidos de los metadatos de safetensors del repositorio.

Su propuesta tecnica central es la compresion agresiva de la cache KV y del coste de prefill. Con una arquitectura Causal Encoder-Decoder (CED) y Compressed Sparse Attention 2 (CSA2), el modelo activa solo 8.000 millones de parametros por token en prefill y 16.000 millones en decode, y reduce la cache KV global a unos 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y 437 veces menos que la de DeepSeek-V1. Esto lo orienta a cargas agénticas con entradas muy largas, donde el coste dominante es el procesamiento del contexto de entrada.

Es relevante ahora porque ataca el cuello de botella practico de los modelos de contexto millonario: el coste de memoria y de computo asociado al prefill y a la cache KV. Conviene senalar que el repositorio analizado es una resubida de terceros (usuario ikigai84), con 0 descargas y 0 likes, y no la publicacion oficial de la organizacion deepseek-ai, por lo que la procedencia de los pesos no esta verificada. No se dispone de informacion sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal encoder-decoder (CED) con MoE: 40 capas (20 de encoder causal + 20 de decoder), 1 experto compartido y 384 expertos enrutados por capa, 6 expertos enrutados activados por token; encoder de vision DeepSeek-ViT con RoPE 2D y downsampling pixel-unshuffle 3x3, mas proyector MLP de 2 capas |
| Parametros totales | 763.205.315.794 (~763 B) segun metadatos de safetensors; la model card declara 552 B de backbone + 196 B de memoria Engram |
| Parametros activos | 8 B por token en prefill y 16 B por token en decode |
| Longitud de contexto | Hasta 1.000.000 tokens; atencion dispersa entrenada a 64K y contexto extendido a 1M a partir de los 34T tokens |
| Tipos de cuantizacion | Tags del repositorio: 8-bit y fp8. Cache KV principal en FP4 (formato E2M1, una escala E4M3 por cada 16 canales). No se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en la model card del repositorio de terceros) |
| Formato de pesos | safetensors (tamano del repositorio: 510,3 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Causal Encoder-Decoder: un encoder causal de 20 capas seguido de un decoder de 20 capas. La innovacion clave es que la cache KV global del decoder se proyecta a partir de los estados ocultos finales del encoder, en lugar de derivarse de los estados ocultos de cada capa del decoder. Esto permite activar solo 8 B por token en prefill y 16 B en decode. Sobre esa base se anaden varios mecanismos: SWA Bounded Replay, que reconstruye los estados KV de ventana deslizante ausentes replicando solo los ultimos n_win tokens y evita persistir esa cache en SSD, reduciendo la huella persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash; Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los indices Top-K de atencion dispersa; y un Hierarchical Sparse Indexer que restringe las capas de indexacion posteriores a un pool de candidatos construido por la primera capa en modo Full, acotando el coste del indexador independientemente de la longitud de contexto. La combinacion da una cache KV global de 890 bytes por token.

Se suman otros componentes: Single-Pass mHC (mezcla revisada del flujo residual con un kernel Mega-mHC), memoria condicional Engram de 196 B de parametros con acceso disperso por lookup basado en token, y decodificacion especulativa DSpark con generacion de borradores semiautorregresiva y verificacion planificada por confianza. La vision se integra mediante DeepSeek-ViT, entrenado desde cero, y un proyector MLP que convierte las imagenes en embeddings visuales procesados conjuntamente con los embeddings de texto desde el inicio del preentrenamiento. El preentrenamiento se hizo desde cero sobre un corpus multimodal de 45 billones (45T) de tokens. El post-entrenamiento sigue el paradigma estandar SFT, RL y destilacion on-policy (OPD) sin modificaciones algorítmicas, con el esfuerzo puesto en la sintesis automatizada a gran escala de tareas y entornos agénticos. El modelo admite un ajuste de esfuerzo de razonamiento continuo y controlable (entero de 1 a 100) que intercambia coste de inferencia por precision.

## Capacidades

- Generacion de texto autorregresiva en modelos de lenguaje de gran escala.
- Procesamiento multimodal nativo de imagen y texto (pipeline declarado: image-text-to-text), integrando embeddings visuales desde el inicio del preentrenamiento.
- Contexto de hasta 1.000.000 tokens, apto para entradas muy largas en una sola pasada.
- Cargas de trabajo agénticas: la model card menciona rendimiento en benchmarks agénticos y sintesis automatizada de tareas y entornos de agente con escalado progresivo de datos, tareas y rollouts.
- Razonamiento con esfuerzo controlable: parametro entero de 1 a 100 que permite ajustar el coste de inferencia frente a la precision.
- Decodificacion especulativa DSpark para acelerar la generacion en decode.
- Eficiencia de prefill: activacion de solo 8 B por token en prefill, orientada a entradas con mucho contexto.
- Soporte de tool calling o function calling: no documentado explicitamente en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Analisis de documentacion tecnica extensa con imagenes: el modelo puede ingerir manuales, planos o informes de cientos de miles de tokens junto con sus figuras en una sola llamada, gracias al contexto de 1M tokens y a la codificacion visual nativa.
- Pipelines agénticos con entradas muy pesadas: al activar solo 8 B por token en prefill, resulta adecuado para agentes que reprocesan grandes cantidades de contexto en cada paso, donde el coste dominante es la lectura de la entrada.
- Servicio de inferencia con cache KV reducida: con 890 bytes por token, un contexto de 1M tokens ocupa aproximadamente 890 MB de cache KV, lo que abarata el mantenimiento de sesiones largas concurrentes en comparacion con arquitecturas de cache convencional.
- Razonamiento de alto coste bajo demanda: el ajuste de esfuerzo de razonamiento (1-100) permite usar valores bajos para tareas de clasificacion o extraccion y valores altos para problemas que requieren cadenas de razonamiento largas, controlando el gasto por consulta.
- Revision de repositorios de codigo: con contexto de 1M tokens se pueden cargar varios modulos o un arbol de proyecto completo y formular preguntas transversales sobre dependencias y consistencia.
- Procesamiento de documentos escaneados y formularios: la combinacion de encoder de vision y contexto largo permite extraer y cruzar datos de lotes de documentos con figuras, tablas y texto.
- Analisis de imagenes medicas o tecnicas junto a historial textual: al procesar imagen y texto conjuntamente, admite casos donde la decision depende de una figura y de un historial narrativo extenso.
- Generacion asistida en flujos por lotes: la decodificacion especulativa DSpark reduce el coste por token generado, util en tareas de resumen o traduccion de gran volumen (idiomas soportados no disponibles).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una seccion "Evaluation Results" y referencias a figuras (rendimiento en benchmarks agénticos y tamano de la cache KV global por token), asi como a un informe tecnico en PDF, pero el extracto proporcionado se interrumpe al inicio de esa seccion, justo antes de las puntuaciones numericas. No se transcriben cifras de MMLU, HumanEval, GSM8K ni de ningun otro benchmark, por lo que no se incluyen valores.

## Requisitos de hardware

Las cifras de memoria son estimaciones derivadas del numero de parametros y del tamano del repositorio, no datos publicados por el autor.

- VRAM estimada para inferencia: el repositorio ocupa 510,3 GB; si corresponde integramente a pesos, implica unos 5,3 bits por parametro de media (763,2 B de parametros en 510,3 GB). Como minimo hacen falta ~510 GB solo para pesos, mas activaciones y cache KV. En una hipotetica carga en 8 bits serian ~763 GB y en 4 bits ~382 GB.
- Cache KV: a 890 bytes por token, 128K tokens ocupan ~114 MB, 1M tokens ~890 MB por secuencia.
- GPU recomendadas: se requiere despliegue multi-GPU o multi-nodo. Opciones realistas: 8x H200 (141 GB, 1.128 GB agregados), 16x H100 (80 GB, 1.280 GB), 8x MI300X (192 GB, 1.536 GB) u 8x A100 de 80 GB (640 GB, insuficiente en 8 bits si se cargan todos los pesos en esa precision). Se necesitan NVLink o Interconnect para el reparto de expertos.
- GPU de consumo: no cabe. Ni siquiera con cuantizacion de 4 bits (~382 GB) entra en una RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo habituales.
- Opciones de despliegue: el repositorio declara la libreria transformers y el tag endpoints_compatible. No se documenta soporte de vLLM, SGLang, TGI, llama.cpp ni Ollama, ni la existencia de pesos GGUF.
- Latencia y throughput estimados: no disponible. Solo se conocen los objetivos de diseno de 8 B de parametros activos por token en prefill y 16 B en decode.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (este repositorio) | 763 B totales; 8 B activos en prefill, 16 B en decode | 1.000.000 tokens | 890 bytes | MIT (declarada en repositorio de terceros) | Repositorio de terceros en HuggingFace, 0 descargas y 0 likes; org oficial no confirmada |
| DeepSeek-V4-Flash | no disponible | no disponible | ~3.560 bytes (derivado de la reduccion de 4x indicada en la model card) | no disponible | no disponible |
| DeepSeek-V1 | no disponible | no disponible | ~389.000 bytes (derivado de la reduccion de 437x indicada en la model card) | no disponible | no disponible |

No se dispone de datos de rendimiento ni de contexto de modelos comparables de otros fabricantes en la informacion proporcionada, por lo que la comparativa se limita a las generaciones anteriores de DeepSeek y a los datos de cache KV citados en la propia model card.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio pertenece al usuario ikigai84, no a la organizacion oficial deepseek-ai, y tiene 0 descargas y 0 likes. No hay confirmacion de que los pesos correspondan al modelo descrito.
- Licencia: la model card declara MIT, pero procede de una resubida de terceros y no se ha podido contrastar con la licencia oficial del modelo original. Verificar antes de cualquier uso comercial.
- Idiomas soportados: no disponible, lo que impide garantizar calidad multilingue ni el soporte del castellano.
- Tool calling: no documentado explicitamente, aunque si se mencionan cargas agénticas y sintesis de tareas de agente.
- Riesgo de alucinacion: inherente a los modelos generativos de este tipo; no se aportan tasas de error ni evaluaciones de fidelidad en la informacion disponible.
- Benchmarks: sin cifras publicadas en la informacion disponible, por lo que no es posible validar las afirmaciones de rendimiento de la model card.
- Limitacion de contexto: los 1M tokens son el maximo declarado, pero la atencion dispersa se entreno a 64K y el contexto se extendio a 34T tokens; el rendimiento real en la parte alta de la ventana no esta cuantificado.
- Requisitos de infraestructura: 510,3 GB de repositorio implican despliegue multi-GPU o multi-nodo, con coste elevado y sin opciones de cuantizacion ligera documentadas.
- Formato: no hay pesos GGUF ni cuantizaciones para inferencia en CPU o en hardware de gama de consumo, lo que limita las pruebas locales.
- Idiomas y sesgos: no se documenta composicion del dataset por idioma ni analisis de sesgos, por lo que no pueden evaluarse sesgos conocidos.
- La busqueda web realizada no devolvio resultados relevantes: los enlaces obtenidos corresponden a dominios de seguros ajenos al modelo y no aportan informacion tecnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikigai84/DeepSeek-V4.1-Flash
- Informe tecnico referenciado en la model card (ruta declarada como deepseek-ai/DeepSeek-V4.1-Flash): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Perfil de X/Twitter de DeepSeek: https://twitter.com/deepseek_ai
- Repositorio de figuras referenciado en la model card (DeepSeek-V2): https://github.com/deepseek-ai/DeepSeek-V2
