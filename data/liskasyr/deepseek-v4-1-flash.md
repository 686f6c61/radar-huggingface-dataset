# liskasYR/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de mezcla de expertos (MoE) publicado bajo el identificador `liskasYR/DeepSeek-V4.1-Flash` en HuggingFace. Segun la model card, se trata de un modelo de 552B parametros de espina dorsal (backbone) con soporte nativo de imagenes y texto, capaz de manejar contextos de hasta un millon de tokens. El repositorio declara 763.205.315.794 parametros contados en los ficheros safetensors, una diferencia respecto a la cifra de la model card que se explica parcialmente por los 196B parametros de memoria condicional Engram.

Su propuesta tecnica principal es la compresion agresiva de la cache KV. La arquitectura Causal Encoder-Decoder (CED) proyecta la cache KV global del decodificador desde los estados ocultos del codificador, de modo que solo se activan 8B parametros por token en prefill y 16B en decode. Combinado con Compressed Sparse Attention 2 (CSA2) y cache KV en FP4, el modelo reduce la huella de KV a 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash.

Es relevante para cargas de trabajo con entradas muy largas (documentos, repositorios de codigo, agentes multi-paso) donde el coste de prefill y de memoria de contexto domina el presupuesto de inferencia. Ademas incorpora un ajuste de esfuerzo de razonamiento continuo entre 1 y 100, que permite canjear coste de inferencia por precision. El repositorio no pertenece a la organizacion oficial `deepseek-ai` y, en el momento del registro, no tenia descargas ni valoraciones; conviene verificar la procedencia de los pesos antes de usarlos en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED), Transformer MoE de 40 capas (20 codificador causal + 20 decodificador) |
| Parametros totales | 763.205.315.794 (contados en safetensors); 552B de backbone declarados en la model card + 196B de memoria condicional Engram |
| Parametros activos | 8B por token en prefill y 16B por token en decode; 1 experto compartido y 384 expertos enrutados por capa MoE, 6 expertos enrutados activados por token |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | FP8 (8-bit) declarado en las etiquetas del repositorio; FP4 (formato E2M1, una escala E4M3 por cada 16 canales) para la cache KV principal; otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en el repositorio) |
| Formato de pesos | safetensors |
| Biblioteca | transformers |
| Pipeline | image-text-to-text |
| Autor del repositorio | liskasYR (no es la organizacion oficial deepseek-ai) |
| Tamano del repositorio | 510,3 GB |
| Fecha de creacion del repositorio | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |
| Etiquetas destacadas | deepseek_v41, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash emplea una arquitectura Causal Encoder-Decoder de 40 capas: 20 capas de codificador causal seguidas de 20 capas de decodificador. La innovacion clave es que la cache KV global del decodificador se proyecta desde los estados ocultos finales del codificador en lugar de derivarse de los estados de cada capa del decodificador. Esto reduce los parametros activos a 8B por token durante el prefill y 16B durante el decode. La tecnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante que faltan replicando unicamente los ultimos *n*_win tokens, lo que evita persistir esos estados en SSD y reduce la huella de cache KV persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

Sobre la atencion, el modelo usa Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar indices de atencion dispersa Top-K. En el decodificador, un indexador disperso jerarquico restringe las capas de indexacion posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexado en profundidad independientemente de la longitud del contexto. Con la cache KV principal en FP4, la huella global queda en 890 bytes por token. Se anaden componentes como Single-Pass mHC (mezcla de flujo residual con el kernel Mega-mHC), memoria condicional Engram de 196B parametros con acceso disperso por busqueda basada en token, y decodificacion especulativa DSpark con generacion de borradores semiautoregresiva y verificacion programada por confianza.

El modelo multimodal integra un codificador visual DeepSeek-ViT, entrenado desde cero con RoPE 2D y submuestreo pixel-unshuffle de 3x3, junto con un proyector MLP de dos capas que convierte las imagenes en embeddings visuales procesados conjuntamente con los embeddings de texto desde el inicio del preentrenamiento. El preentrenamiento se realizo desde cero sobre un corpus multimodal de 45 billones (45T) de tokens, con atencion dispersa entrenada a una longitud de secuencia de 64K y extension de contexto hasta 1M tokens en el punto de 34T tokens. El postentrenamiento sigue el paradigma estandar SFT -> RL -> destilacion on-policy (OPD), sin modificaciones algoritmicas, con cambios concentrados en el pipeline de datos: sintesis automatizada a gran escala de tareas y entornos de agente con escalado progresivo de datos, tareas y rollouts.

## Capacidades

- Generacion de texto autoregresiva y procesamiento conjunto de imagenes y texto de forma nativa (pipeline image-text-to-text).
- Razonamiento con esfuerzo controlable: ajuste entero de 1 a 100 que permite canjear coste de inferencia por precision.
- Tareas agenticas: la model card menciona evaluacion en benchmarks agenticos y sintesis automatizada de tareas y entornos de agente durante el postentrenamiento.
- Contexto largo: hasta 1.000.000 de tokens, con atencion dispersa entrenada inicialmente a 64K y extendida a 1M.
- Vision: codificador DeepSeek-ViT entrenado desde cero con RoPE 2D y downsampling pixel-unshuffle 3x3, mas proyector MLP de dos capas.
- Eficiencia en prefill: activacion de solo 8B parametros por token, orientada a cargas con entradas muy largas.
- Decodificacion especulativa integrada (DSpark) con verificacion programada por confianza.
- Soporte de tool calling o function calling: no detallado en la informacion disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas soportados).

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M tokens de contexto, el modelo puede ingerir un arbol de codigo entero en una sola pasada y responder preguntas de arquitectura, dependencias o impacto de cambios sin trocear el contenido en fragmentos y sin perder referencias cruzadas entre ficheros.
- Agentes de larga duracion con historial extenso: la cache KV de 890 bytes por token permite mantener conversaciones o bucles de agente muy largos con un coste de memoria de contexto bajo; 1M tokens ocupan aproximadamente 890 MB de cache KV.
- Procesamiento de documentacion multimodal: al aceptar pares imagen-texto, resulta adecuado para digitalizar y razonar sobre informes escaneados, facturas, planos, capturas de pantalla o documentacion tecnica con diagramas.
- Control de coste por consulta: el parametro de esfuerzo de razonamiento (1-100) permite asignar esfuerzo bajo a tareas rutinarias y esfuerzo alto a casos complejos, ajustando el gasto de inferencia por peticion sin cambiar de modelo.
- Recuperacion aumentada (RAG) sobre corpus extensos: la combinacion de contexto de 1M tokens y cache KV reducida hace viable mantener muchos contextos largos simultaneos en un mismo servidor, aumentando el numero de sesiones concurrentes por GPU.
- Servicio de atencion al cliente multi-turno: el contexto largo permite arrastrar todo el historial de interacciones y la documentacion del producto, reduciendo la perdida de informacion que se produce con truncado de historial.
- Investigacion sobre arquitecturas eficientes: la combinacion CED, CSA2, FP4 en KV y SWA Bounded Replay lo convierte en una referencia para estudiar compresion de cache KV y atencion dispersa en modelos MoE multimodales.
- Analisis de imagenes tecnicas en pipelines industriales: la vision nativa con RoPE 2D permite interpretar imagenes junto con texto normativo o especificaciones en un mismo prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una seccion "Evaluation Results" con una tabla de modelos base evaluados en un framework interno, pero el contenido proporcionado se corta antes de mostrar cualquier cifra, y unicamente indica que las puntuaciones dentro de 0,3 puntos entre si se consideran equivalentes. Tampoco se dispone de resultados de MMLU, HumanEval, GSM8K ni de benchmarks agenticos en la informacion facilitada.

Unico dato cuantitativo de rendimiento disponible, referido a eficiencia de memoria:

| Metrica | Valor |
|---|---|
| Cache KV global por token | 890 bytes por token (FP4 principal, E2M1, con una escala E4M3 cada 16 canales) |
| Reduccion frente a DeepSeek-V4-Flash | Aproximadamente 4x menor |
| Reduccion frente a DeepSeek-V1 | Aproximadamente 437x menor |
| Huella de KV persistente (SWA) | Aproximadamente 1/8 de la de DeepSeek-V4-Flash |
| Parametros activos en prefill | 8B por token |
| Parametros activos en decode | 16B por token |

## Requisitos de hardware

Estimaciones de memoria para pesos, calculadas a partir de los 763.205.315.794 parametros declarados en safetensors. No incluyen activaciones, cache KV, buffers ni overhead del runtime.

| Precision de pesos | Memoria estimada | GPUs de 80 GB necesarias (solo pesos) |
|---|---|---|
| BF16 / FP16 | Aproximadamente 1,53 TB | 20 |
| FP8 / INT8 | Aproximadamente 763 GB | 10 |
| FP4 / INT4 | Aproximadamente 382 GB | 5 |

- Cache KV: 890 bytes por token. A 1M tokens equivale a unos 890 MB (aproximadamente 849 MiB) por secuencia; a 128K tokens, unos 114 MB. Esta cifra es notablemente baja para un modelo de su tamano.
- GPUs recomendadas: despliegues multinodo con H100 (80 GB), H200 (141 GB) o B200. En FP8, ocho H200 suman 1.128 GB, suficientes para los pesos con margen para cache KV y activaciones. En FP4/INT4, ocho A100 o H100 de 80 GB (640 GB) serian suficientes para los pesos.
- GPU de consumo: no cabe en una sola GPU de consumo. Solo los pesos en 4 bits (aproximadamente 382 GB) requeririan del orden de 16 tarjetas de 24 GB (RTX 4090) o 12 de 32 GB, sin contar overhead, lo que descarta un despliegue monomaquina viable.
- Aclaracion importante: los 8B y 16B parametros activos por token afectan al coste de computo y al tamano de la cache KV, no al de almacenamiento. El conjunto completo de pesos debe residir en memoria.
- Opciones de despliegue: el repositorio declara compatibilidad con `transformers` y la etiqueta `endpoints_compatible`. El soporte en vLLM, SGLang, TGI, llama.cpp u Ollama no esta confirmado en la informacion disponible; dada la arquitectura `deepseek_v41` y el tamano del modelo, llama.cpp y Ollama no resultan opciones realistas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Unicamente es posible comparar con las generaciones de DeepSeek citadas en la model card y con los datos explicitamente indicados en ella. Las cifras de cache KV de las alternativas se han derivado de los factores de reduccion declarados (4x y 437x) y son aproximadas.

| Modelo | Parametros | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763.205.315.794 en safetensors (552B backbone declarados + 196B Engram) | 1.000.000 tokens | 890 bytes (FP4) | MIT (declarada en este repositorio) | Repositorio de terceros, 0 descargas y 0 likes en el momento del registro |
| DeepSeek-V4-Flash | no disponible | no disponible | Aproximadamente 3.560 bytes (derivado del factor 4x) | no disponible | no disponible |
| DeepSeek-V1 | no disponible | no disponible | Aproximadamente 389 KB (derivado del factor 437x) | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (por ejemplo, otros MoE multimodales de escala similar) en los datos proporcionados, por lo que no se incluye una comparacion adicional.

## Limitaciones y advertencias

- Procedencia del repositorio: el identificador es `liskasYR/DeepSeek-V4.1-Flash`, que no corresponde a la organizacion oficial `deepseek-ai`. La model card enlaza a recursos de `deepseek-ai` y a los sitios oficiales de DeepSeek, pero los pesos estan alojados por un tercero. Conviene verificar hashes e integridad antes de cualquier uso en produccion.
- Estado del repositorio: 0 descargas y 0 likes en el momento del registro, sin validacion por parte de la comunidad ni de la organizacion original.
- Discrepancia de parametros: los 763.205.315.794 parametros contados en safetensors no coinciden con los 552B de backbone declarados en el texto. La suma con los 196B de Engram (748B) se acerca, pero no cierra la diferencia de aproximadamente 15B, que queda sin explicar en la informacion disponible.
- Ausencia de benchmarks: la model card no proporciona cifras numericas de evaluacion, por lo que no es posible verificar las afirmaciones de rendimiento.
- Idiomas: no se declaran idiomas soportados, lo que impide confirmar el comportamiento multilingue.
- Riesgo de alucinacion: no documentado especificamente en la informacion disponible; como en cualquier modelo generativo de gran escala, debe asumirse y mitigarse con verificacion externa en aplicaciones criticas.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Licencia: el repositorio declara MIT, una licencia permisiva que permitiria uso comercial. No obstante, dado que el repositorio no pertenece a la organizacion original del modelo, conviene confirmar que quien lo publica esta facultado para otorgar dicha licencia y revisar las condiciones aplicables al modelo original de DeepSeek.
- Limitaciones de contexto: se declara soporte de 1M tokens, pero la atencion dispersa se entreno inicialmente a 64K y el rendimiento mas alla de esa longitud no esta cuantificado en la informacion disponible.
- Coste de despliegue: pese a la eficiencia en parametros activos y cache KV, el modelo exige infraestructura multinodo, lo que limita su uso a entornos con presupuesto de hardware elevado.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio figuran como 2026-09-11, lo que conviene contrastar antes de citar el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/liskasYR/DeepSeek-V4.1-Flash
- Sitio oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Technical report citado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Cuenta de X (Twitter) de DeepSeek: https://twitter.com/deepseek_ai
- Figuras de arquitectura y logotipo referenciadas en la model card: https://github.com/deepseek-ai/DeepSeek-V2/tree/main/figures

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron paginas generales de Microsoft, sin relacion con DeepSeek-V4.1-Flash, por lo que no se anaden mas enlaces.
