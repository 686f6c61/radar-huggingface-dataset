# drawthingsai/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de arquitectura Mixture-of-Experts (MoE) con 552B parametros en el backbone y soporte nativo de imagenes y texto, disenado para cargas de trabajo con contexto muy largo (hasta un millon de tokens). La innovacion central que declara su model card es la compresion agresiva de la cache KV: mediante las tecnicas Compressed Sparse Attention 2 (CSA2), SWA Bounded Replay y cache KV principal en FP4, reduce la huella de cache global a 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y 437 veces menos que DeepSeek-V1. El objetivo declarado son cargas de trabajo "input-heavy" tipicas de agentes, donde el coste de procesar entradas largas domina el presupuesto de inferencia.

La arquitectura es un transformer causal encoder-decoder (CED) de 40 capas, organizado como 20 capas de encoder causal seguidas de 20 capas de decoder, con proyeccion de la cache KV global desde los estados ocultos finales del encoder en lugar de derivarla capa a capa. Esto permite activar solo 8B parametros por token en prefill y 16B en decode, sobre un total de 552B. El modelo incorpora ademas un modulo Engram de memoria condicional de 196B parametros con acceso disperso por lookup basado en token, y descodificacion especulativa DSpark.

El repositorio de HuggingFace analizado esta publicado por el usuario `drawthingsai`, no por la organizacion oficial `deepseek-ai`, y registra 0 descargas y 0 likes en el momento de la consulta. La model card reproduce el contenido atribuido a DeepSeek AI (incluido un enlace a un informe tecnico alojado en el espacio de `deepseek-ai`), por lo que la procedencia del checkpoint debe verificarse antes de cualquier uso en produccion. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal encoder-decoder (CED) con Mixture-of-Experts; 40 capas (20 de encoder causal + 20 de decoder) |
| Parametros totales | 552B en el backbone, mas 196B del modulo Engram de memoria condicional; el total conjunto no se especifica |
| Parametros activos | 8B por token en prefill; 16B por token en decode |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | Cache KV principal en FP4 (formato E2M1, una escala E4M3 por cada 16 canales); cuantizacion de pesos no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en la model card y en los metadatos de HuggingFace) |
| Formato de pesos | no disponible (libreria declarada: transformers; repositorio de 524,1 GB) |
| Modalidades | Entrada de imagen y texto; salida de texto autoregresiva |
| Expertos por capa MoE | 1 experto compartido + 384 expertos enrutados; 6 expertos enrutados activos por token |
| Cache KV global | 890 bytes por token (E2M1 con escala E4M3 cada 16 canales) |
| Tecnicas de atencion | CSA2 (modos estaticos Full, Reindex y Reuse), Hierarchical Sparse Indexer, SWA Bounded Replay |
| Otras componentes | Single-Pass mHC (mezcla de flujo residual), Engram (memoria condicional, 196B, acceso disperso), DSpark (descodificacion especulativa) |
| Esfuerzo de razonamiento | Ajuste continuo y controlable, entero de 1 a 100 |
| Pipeline declarado | image-text-to-text |
| Repositorio | drawthingsai/DeepSeek-V4.1-Flash (524,1 GB; 0 descargas, 0 likes) |
| Fechas registradas | Creado el 20/09/2026; actualizado el 21/09/2026 |

## Arquitectura y entrenamiento

El componente distintivo es la arquitectura Causal Encoder-Decoder (CED): un transformer de 40 capas donde las 20 primeras actuan como encoder causal y las 20 restantes como decoder. La cache KV global del decoder se proyecta desde los estados ocultos finales del encoder, en lugar de calcularse a partir de los estados ocultos de cada capa del decoder. El efecto practico es una separacion entre el coste de prefill (8B parametros activos por token) y el de decode (16B por token), lo que abarata el procesamiento de entradas muy largas con salidas cortas, el patron habitual en agentes. SWA Bounded Replay reconstruye los estados KV de ventana deslizante que faltan replicando unicamente los *n*_win tokens mas recientes, lo que evita persistir esos estados en SSD y deja la cache KV persistente en aproximadamente 1/8 de la de DeepSeek-V4-Flash.

Sobre la atencion, CSA2 asigna a cada capa uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los indices de atencion dispersa Top-K. En el decoder, un Hierarchical Sparse Indexer restringe las capas de indexacion posteriores a un conjunto de candidatos construido por la primera capa en modo Full, lo que acota el coste del indexador en profundidad con independencia de la longitud de contexto. La cache KV principal se almacena en FP4 (E2M1 con una escala E4M3 por cada 16 canales), lo que situa la huella global en 890 bytes por token.

El preentrenamiento se realizo desde cero sobre un corpus multimodal de 45T tokens, con la atencion dispersa entrenada a una longitud de secuencia de 64K y extension de contexto hasta 1M tokens a partir de los 34T tokens. El post-entrenamiento sigue el paradigma SFT → RL → destilacion on-policy (OPD) sin modificaciones algoritmicas; los cambios se concentran en el pipeline de datos, con sintesis automatica a gran escala de tareas y entornos de agente y escalado progresivo de datos, tareas y rollouts. La torre de vision es un DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling 3×3 pixel-unshuffle, y un proyector MLP de dos capas que convierte las imagenes en embeddings visuales procesados conjuntamente con el texto desde el inicio del preentrenamiento.

## Capacidades

- Procesamiento nativo de imagenes y texto en una unica secuencia, con generacion de texto autoregresiva como unica salida.
- Contexto de hasta 1.000.000 de tokens, con atencion dispersa entrenada a 64K y extendida despues a 1M.
- Cargas de trabajo agenticas: la model card describe sintesis automatica de tareas y entornos de agente durante el post-entrenamiento y presenta benchmarks agenticos en la Figura 1.
- Esfuerzo de razonamiento controlable mediante un parametro entero de 1 a 100, que permite intercambiar coste de inferencia por precision.
- Decodificacion especulativa DSpark, con generacion de borradores semiautoregresiva y verificacion planificada por confianza.
- Memoria condicional Engram de 196B parametros con acceso disperso por lookup basado en token.
- Tool calling / function calling: la model card no documenta soporte explicito de llamadas a herramientas; no disponible.
- Capacidades multilingues: no disponible; los metadatos de HuggingFace no declaran idiomas.
- Audio, video u otras modalidades: no disponibles; solo se documentan imagen y texto.

## Casos de uso

- Agentes autonomos de larga duracion: con 1M tokens de contexto y una cache KV de 890 bytes por token (unos 890 MB para 1M tokens), el modelo puede mantener el historial completo de una sesion agentica con multiples pasos, lecturas de ficheros y llamadas a API sin truncar ni resumir el estado.
- Analisis de documentos tecnicos con componentes visuales: al aceptar imagen y texto de forma nativa via DeepSeek-ViT con downsampling 3×3 pixel-unshuffle, permite extraer y razonar sobre planos, diagramas, tablas escaneadas y capturas junto al texto que las acompana.
- Revision de repositorios de codigo completos: el contexto de 1M tokens permite cargar arboles de proyecto enteros y trazar dependencias entre ficheros en una sola pasada, con el coste de prefill reducido a 8B parametros activos por token.
- RAG sobre corpus extensos: la combinacion de contexto largo y cache KV comprimida reduce el numero de recuperaciones necesarias, ya que el modelo puede retener muchos mas fragmentos en contexto sin disparar el consumo de memoria por sesion.
- Automatizacion de tareas con esfuerzo de razonamiento ajustable: en produccion se puede fijar el parametro de esfuerzo (1-100) bajo para tareas de clasificacion o extraccion y elevarlo para tareas de planificacion, controlando el coste por peticion.
- Procesamiento por lotes de entradas masivas: en escenarios input-heavy (analisis de logs, contratos o historiales completos) donde la entrada domina y la salida es corta, el modo prefill de 8B parametros activos por token es el escenario declarado como objetivo de optimizacion.
- Indexacion y busqueda semantica asistida: el modulo Engram de memoria condicional con acceso por lookup basado en token esta disenado para recuperar informacion asociada a tokens concretos, util en pipelines de enriquecimiento de datos y memorizacion de entidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una seccion de resultados de evaluacion para el modelo base, indica que todos los modelos se evaluaron en un framework interno con los mismos ajustes y que las puntuaciones con una diferencia inferior a 0,3 se consideran equivalentes, pero el extracto disponible se interrumpe antes de mostrar cualquier valor. Tampoco se incluyen cifras concretas de la Figura 1, que representa el rendimiento en benchmarks agenticos.

Las unicas metricas cuantitativas verificables en la informacion proporcionada son de eficiencia, no de calidad:

| Metrica | Valor declarado |
|---|---|
| Cache KV global por token | 890 bytes |
| Reduccion de cache KV frente a DeepSeek-V4-Flash | Aproximadamente 4x |
| Reduccion de cache KV frente a DeepSeek-V1 | Aproximadamente 437x |
| Cache KV persistente frente a DeepSeek-V4-Flash | Aproximadamente 1/8 |
| Parametros activos en prefill | 8B por token |
| Parametros activos en decode | 16B por token |
| Tokens de preentrenamiento | 45T |
| Longitud de secuencia en entrenamiento de atencion dispersa | 64K, extendida a 1M |

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del numero de parametros declarado y del tamano del repositorio, no datos publicados por el autor.

- Pesos: con 552B parametros en el backbone, el checkpoint ocupa aproximadamente 1,1 TB en BF16, unos 552 GB en FP8 y unos 276 GB en FP4/INT4, sin contar el modulo Engram de 196B parametros si se materializa completo. El repositorio en HuggingFace ocupa 524,1 GB, consistente con un checkpoint cuantizado, aunque el formato exacto no esta declarado.
- VRAM para inferencia: en FP8 se necesitan del orden de 552 GB solo para pesos, lo que exige al menos un nodo de 8×H100 80 GB (640 GB) o 8×A100 80 GB; en FP4 el requisito baja a unos 276 GB, viable en 4×H100 80 GB. A esto hay que sumar la cache KV (890 bytes por token, aproximadamente 890 MB para 1M tokens) y los buffers de activaciones.
- GPU consumer: no es viable. Una RTX 4090 con 24 GB no puede alojar un backbone de 552B parametros, y el hecho de activar 8B o 16B parametros por token no reduce el requisito de memoria, porque todos los expertos enrutados deben estar residentes.
- Opciones de despliegue: la model card solo declara `library_name: transformers`. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI, ni de disponibilidad de pesos en GGUF.
- Latencia y throughput: no disponibles. Las tecnicas DSpark (descodificacion especulativa) y CSA2 apuntan a mejorar el throughput y a acotar el coste del indexador con contexto largo, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar contra las generaciones anteriores citadas en la propia model card, y unicamente en la metrica de cache KV. Los valores de DeepSeek-V4-Flash y DeepSeek-V1 son derivados de los ratios declarados (4x y 437x), no cifras publicadas directamente.

| Modelo | Cache KV por token | Cache KV persistente | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 890 bytes | Aproximadamente 1/8 de V4-Flash | 552B backbone + 196B Engram | 1M tokens | MIT |
| DeepSeek-V4-Flash | Aproximadamente 3.560 bytes (derivado) | Referencia | no disponible | no disponible | no disponible |
| DeepSeek-V1 | Aproximadamente 389.000 bytes (derivado) | no disponible | no disponible | no disponible | no disponible |

No hay datos de rendimiento, contexto o licencia de los modelos comparados en la informacion disponible, ni se identifican alternativas de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio esta publicado por el usuario `drawthingsai`, no por la organizacion oficial `deepseek-ai`, y registra 0 descargas y 0 likes. La model card atribuye el modelo a DeepSeek AI y enlaza a un informe tecnico alojado en el espacio de `deepseek-ai`, pero la autoria real del checkpoint subido no puede confirmarse con los datos disponibles.
- Ausencia de resultados de calidad: no hay cifras de MMLU, HumanEval, GSM8K ni de benchmarks agenticos en la informacion disponible, por lo que no es posible evaluar el rendimiento real frente a alternativas.
- Idiomas no declarados: los metadatos de HuggingFace no especifican idiomas soportados y la model card tampoco los detalla, lo que impide garantizar cobertura multilingue.
- Cadena de herramienta incierta: solo se declara `transformers`; no hay confirmacion de compatibilidad con vLLM, TGI, llama.cpp u Ollama, ni de pesos en GGUF.
- Coste de almacenamiento y despliegue: el repositorio ocupa 524,1 GB y el backbone tiene 552B parametros, lo que descarta el despliegue en hardware de consumo y exige nodos multi-GPU.
- Cuantizacion de la cache KV en FP4 (E2M1 con escala E4M3 cada 16 canales): la model card no documenta el impacto de esta cuantizacion sobre la precision, un aspecto critico en tareas que dependen de recuperar detalles exactos de contextos largos.
- Degradacion con contexto extremo: se declara soporte de 1M tokens, pero no se publican mediciones de calidad en funcion de la longitud de contexto, ni evaluaciones de recuperacion de informacion en el extremo de la ventana.
- Sesgos y alucinacion: no documentados en la informacion disponible. No hay seccion de limitaciones, analisis de sesgos ni tasas de alucinacion en el extracto de la model card.
- Licencia MIT declarada tanto en los metadatos como en la model card, lo que en principio permite uso comercial. Dado que el repositorio es una publicacion de terceros, conviene confirmar la licencia en la fuente original antes de integrar el modelo en un producto.
- Fechas de creacion y actualizacion registradas como septiembre de 2026, posteriores a la fecha habitual de consulta de este tipo de fichas; conviene verificar la vigencia del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/drawthingsai/DeepSeek-V4.1-Flash
- Informe tecnico enlazado desde la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Logo y recursos graficos referenciados en la model card: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/figures/logo.svg

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a paginas de soporte de Microsoft (contacto, inicio de sesion en Hotmail, blog de Copilot y tasa de refresco de monitor en Windows), sin relacion con DeepSeek-V4.1-Flash, por lo que se han descartado.
