# dcharlot65-openie/BGE-Small-EN-v1.5-LittleBit

## Resumen

BGE-Small-EN-v1.5-LittleBit es un checkpoint de pesos comprimidos («living weights») publicado por el usuario dcharlot65-openie, derivado del modelo de embeddings BAAI/bge-small-en-v1.5. No se trata de un modelo nuevo entrenado desde cero, sino de una refactorización del modelo base mediante una combinación de LittleBit-2 y Sakana SVF, empaquetada en el formato `.jsyn` propietario de JouleDB, una base de datos termodinámica con runtime de inferencia sin PyTorch y orientada a Kubernetes (JouleKube).

El interés técnico del artefacto reside en su ratio de compresión: 33,6 millones de parámetros almacenados en 1,92 MB con zstd y CRC32, lo que equivale a 0,2560 bits por peso (BPW) frente a los 63,63 MB que ocuparía el mismo modelo en FP16, es decir, una reducción de 33,19 veces. Los tensores se almacenan como 76 bitplanes 2D más 123 vectores 1D de LayerNorm, bias y depthwise.

Es relevante ahora porque explora la vía de los pesos sub-1-bit y los formatos de despliegue nativos de Kubernetes para modelos de recuperación de información, un nicho donde el coste de almacenamiento y el arranque en frío importan tanto como la calidad del embedding. La información pública disponible es muy escasa: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, y la model card no documenta evaluación, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base BAAI/bge-small-en-v1.5, refactorizado con LittleBit-2 y Sakana SVF |
| Parametros totales | 33.360.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, no documentada en esta ficha) |
| Tipos de cuantizacion | Bitplanes 2D sub-1-bit (0,2560 BPW) con compresion zstd y CRC32; formato `.jsyn` |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | `.jsyn` (JouleDB); tamano comprimido 1,92 MB, equivalente FP16 63,63 MB |

## Arquitectura y entrenamiento

El checkpoint parte del transformer denso de BAAI/bge-small-en-v1.5, un modelo de embeddings de pequeno tamano (33,6 millones de parametros) orientado a recuperacion y similitud semantica. Sobre esa base, el autor aplica una factorizacion previa («pre-factorized») que combina LittleBit-2, un esquema de cuantizacion sub-1-bit basado en bitplanes, con Sakana SVF (singular value fine-tuning), una tecnica de adaptacion de bajo rango. El resultado se empaqueta en el formato `.jsyn` de JouleDB, con compresion zstd y verificacion CRC32.

No se documenta en la informacion disponible ningun proceso de entrenamiento adicional, numero de tokens, composicion del dataset, ni uso de RLHF o DPO. Tampoco se detalla el procedimiento exacto de factorizacion ni las metricas de degradacion introducidas por la compresion. La model card solo caracteriza el perfil de compresion termodinamica: 76 tensores en bitplanes 2D, 123 vectores 1D auxiliares y un promedio de 0,2560 BPW.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion de informacion, heredadas del modelo base BGE-Small-EN-v1.5.
- Similitud semantica y ranking de pasajes, uso tipico de los modelos BGE.
- Inferencia mediante el runtime de JouleDB, sin dependencia de PyTorch.
- Despliegue nativo en Kubernetes a traves de JouleKube.
- Integracion con la base de datos termodinamica JouleDB mediante `hf_pull` y conexion HTTP.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Recuperacion aumentada (RAG) en entornos Kubernetes: el checkpoint se sirve desde JouleDB con 1,92 MB de almacenamiento, lo que reduce el arranque en frio de pods y el consumo de capas de imagen en comparacion con un modelo FP16 de 63,63 MB.
- Busqueda semantica en bordes o dispositivos con almacenamiento limitado: el formato sub-1-bit permite embeber el indice y el modelo en el mismo contenedor sin superar restricciones de tamano.
- Indexacion de documentacion interna: al derivar de BGE-Small-EN-v1.5, puede emplearse para generar embeddings de pasajes y consultas en ingles dentro de pipelines de busqueda empresarial.
- Deduplicacion y agrupamiento de textos: los embeddings permiten calcular similitud coseno para agrupar registros duplicados en bases de datos operativas.
- Despliegue multi-tenant en cluster: JouleKube y el formato `.jsyn` facilitan replicar el modelo por tenant con un coste de almacenamiento marginal bajo.
- Experimentacion con pesos sub-1-bit: sirve como banco de pruebas para evaluar la perdida de calidad de recuperacion al pasar de FP16 a 0,2560 BPW en tareas de similitud semantica.
- Clasificacion y filtrado de contenido por similitud: uso de los embeddings para puntuar relevancia en colas de moderacion o enrutado de tickets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint comprimido ocupa 1,92 MB; el equivalente FP16 del modelo base ocupa 63,63 MB, por lo que la huella en memoria es marginal en cualquier GPU.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU consumer moderna seria suficiente, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base (33,6 millones de parametros), aunque no se documenta soporte oficial.
- Opciones de despliegue: JouleDB (`jouledb serve --http-addr 127.0.0.1:8080`) con `cargo binstall jouledb`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BGE-Small-EN-v1.5-LittleBit | 33,6 M | No disponible | `.jsyn` (JouleDB) | MIT | Hugging Face, 0 descargas |
| BAAI/bge-small-en-v1.5 | 33,6 M | No disponible en esta ficha | safetensors (modelo base) | MIT | Hugging Face, ampliamente usado |
| Otros modelos de embeddings de ~33 M | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de rendimiento ni de alternativas directamente equiparables en formato sub-1-bit dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No se documentan evaluaciones de calidad: se desconoce la degradacion de los embeddings tras la compresion a 0,2560 BPW frente al modelo base en FP16.
- Idiomas no declarados; el modelo base esta orientado al ingles, por lo que el uso en castellano no esta garantizado.
- Longitud de contexto no documentada en esta ficha; debe consultarse la del modelo base antes de usarlo en produccion.
- El formato `.jsyn` y la libreria `jouledb` son propietarios y requieren el runtime de JouleDB; no hay soporte documentado para ecosistemas estandar como Transformers, sentence-transformers, vLLM o llama.cpp.
- Repositorio sin descargas ni likes y creado y actualizado el mismo dia: no hay evidencia de uso en produccion ni de mantenimiento.
- Riesgo de alucinacion y sesgos: no evaluados; al ser un modelo de embeddings, los sesgos se manifiestan en la recuperacion y el ranking, no en la generacion.
- Licencia MIT permite uso comercial, pero la atribucion al modelo base BAAI/bge-small-en-v1.5 debe mantenerse.
- La model card no incluye informacion sobre el pipeline ni sobre tareas soportadas mas alla de la recuperacion.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/BGE-Small-EN-v1.5-LittleBit
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
