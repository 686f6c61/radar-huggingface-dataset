# dcharlot65-openie/MiniCPM-OCR-1.0-LittleBit

## Resumen

MiniCPM-OCR-1.0-LittleBit es una adaptación del modelo de reconocimiento óptico de caracteres openbmb/MiniCPM-OCR-1.0, publicada por el usuario dcharlot65-openie. No se trata de un modelo entrenado desde cero, sino de un checkpoint "living-weights" pre-factorizado que combina la técnica LittleBit-2 con Sakana SVF y se distribuye en el formato propietario .jsyn para el runtime JouleDB. El modelo base MiniCPM-OCR-1.0 está orientado a tareas de OCR y comprensión de documentos.

La relevancia de esta ficha es principalmente de compresión extrema: el checkpoint declara 1.300.434.160 parámetros totales, un equivalente en FP16 de 2.480,38 MB y un tamaño comprimido en .jsyn de 15,93 MB, lo que supone una reducción de 155,68x y una media de 0,0390 bits por peso (sub-1-bit). Esta compresión se obtiene mediante factorización de tensores en bitplanes 2D (359 tensores) y vectores 1D de LayerNorm, bias y depthwise (420 vectores).

El modelo se distribuye bajo licencia Apache 2.0, heredada del modelo base. La información pública disponible es muy limitada: el repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta, y no se publican especificaciones de arquitectura, contexto, idiomas ni resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: openbmb/MiniCPM-OCR-1.0; adaptación LittleBit-2 ⊕ Sakana SVF) |
| Parámetros totales | 1.300.434.160 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | sub-1-bit (0,0390 BPW); tensores en bitplanes 2D y vectores 1D; compresión zstd + CRC32 en formato .jsyn |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .jsyn (JouleDB); no se distribuyen safetensors ni GGUF |
| Tamaño FP16 equivalente | 2.480,38 MB |
| Tamaño comprimido | 15,93 MB (155,68x menor) |
| Tensores 2D (bitplanes) | 359 |
| Vectores 1D (LayerNorm/bias/depthwise) | 420 |
| Librería / runtime | jouledb (v0.2.4+) |
| Modelo base | openbmb/MiniCPM-OCR-1.0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base MiniCPM-OCR-1.0 en la documentación proporcionada (tipo de transformer, número de capas, dimensiones ocultas, mecanismo de atención o estrategia de entrenamiento). Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica documentada corresponde exclusivamente al proceso de compresión: el checkpoint se presenta como "pre-factorized LittleBit-2 ⊕ Sakana SVF living-weights", con 359 tensores 2D almacenados como bitplanes y 420 vectores 1D (LayerNorm, bias, depthwise) preservados de forma separada. El empaquetado final usa compresión zstd con verificación CRC32 dentro del contenedor .jsyn, alcanzando 0,0390 bits por peso. No se especifica el procedimiento de factorización, la pérdida de calidad asociada ni el método de reconstrucción en inferencia más allá de que el runtime JouleDB lo soporta de forma nativa sin PyTorch.

## Capacidades

- Reconocimiento óptico de caracteres (OCR): capacidad heredada del modelo base openbmb/MiniCPM-OCR-1.0, orientado a extracción de texto en imágenes y documentos.
- Comprensión de documentos: no se detalla el alcance exacto (layout, tablas, fórmulas) en la información disponible.
- Generación de texto, razonamiento, código y matemáticas: no confirmado para este checkpoint en la documentación proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no se declaran).
- Capacidades especiales (thinking mode, visión, audio): no disponible; el modelo base es de OCR, pero no se confirma el soporte de visión general en este checkpoint.
- Inferencia sin PyTorch: soportada mediante el runtime JouleDB, con despliegue Kubernetes-native a través de JouleKube.

## Casos de uso

- Digitalización de documentos en pipelines Kubernetes: el checkpoint se integra en JouleKube como sustrato nativo, permitiendo desplegar el servicio de OCR junto al resto de la infraestructura sin dependencias de PyTorch ni de frameworks de deep learning convencionales.
- Extracción de texto en entornos con restricciones de almacenamiento: con 15,93 MB de pesos comprimidos, el modelo puede embeberse en imágenes de contenedor pequeñas o en nodos edge donde un checkpoint FP16 de 2,48 GB sería inviable.
- Procesamiento por lotes de facturas y formularios: el modelo base está orientado a OCR, por lo que puede emplearse para extraer campos de documentos escaneados en flujos automatizados de contabilidad o back office.
- Archivado y búsqueda de documentos históricos: la compresión extrema facilita mantener múltiples versiones del checkpoint o replicarlo en varias regiones sin coste significativo de almacenamiento.
- Prototipado rápido en investigación de compresión: sirve como referencia para evaluar la técnica LittleBit-2 ⊕ Sakana SVF frente al modelo base sin comprimir, comparando calidad de OCR y latencia en el runtime JouleDB.
- Despliegue en clústeres con orquestación declarativa: al ser Kubernetes-native, encaja en arquitecturas GitOps donde el modelo se sirve como un recurso más gestionado por JouleDB.
- Evaluación de inferencia sub-1-bit: caso de uso de investigación para medir la degradación de precisión en OCR a 0,0390 BPW frente al checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de precisión de OCR (por ejemplo, CER o WER), comparativas con el modelo base sin comprimir ni datos de latencia o throughput del runtime JouleDB.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El equivalente FP16 sería de aproximadamente 2,48 GB de pesos, pero el checkpoint se sirve en formato .jsyn mediante JouleDB, cuyo consumo real de memoria en inferencia no se documenta.
- GPU recomendadas: no disponible. No se especifican requisitos de GPU en la documentación proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Por el tamaño del modelo base (1,3 mil millones de parámetros) cabría esperar viabilidad en GPU de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: JouleDB v0.2.4+ (runtime propio, sin PyTorch), con despliegue Kubernetes-native mediante JouleKube. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR-1.0-LittleBit | 1.300.434.160 | no disponible | .jsyn (JouleDB) | Apache 2.0 | Hugging Face (0 descargas) |
| openbmb/MiniCPM-OCR-1.0 | no disponible en esta ficha | no disponible | no disponible | Apache 2.0 | Hugging Face (modelo base) |
| Alternativas OCR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas; los datos del modelo base y de modelos OCR comparables no están incluidos en la documentación proporcionada.

## Limitaciones y advertencias

- La compresión a 0,0390 BPW implica una pérdida de información muy agresiva; no se documenta la degradación de calidad en OCR respecto al modelo base.
- El checkpoint solo es utilizable con el runtime JouleDB; no se ofrecen pesos en safetensors, GGUF ni otros formatos estándar, lo que limita su uso fuera de ese ecosistema.
- El repositorio declara 0 GB de tamaño y 0 descargas, lo que impide verificar la integridad y el contenido real de los artefactos publicados.
- No se declaran idiomas soportados, por lo que no puede garantizarse el rendimiento multilingüe.
- No se publican datos de sesgos, tasas de alucinación ni evaluaciones de robustez.
- La licencia Apache 2.0 permite uso comercial, pero al ser una adaptación de un modelo de terceros conviene revisar los términos del modelo base openbmb/MiniCPM-OCR-1.0.
- No hay benchmarks ni métricas de latencia, lo que hace arriesgado su uso en producción sin una evaluación propia previa.
- El autor del checkpoint es un usuario individual (dcharlot65-openie), no el equipo de openbmb; no hay garantías de mantenimiento.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/dcharlot65-openie/MiniCPM-OCR-1.0-LittleBit
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
