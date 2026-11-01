# BEDO97/egystormy-models

## Resumen

Egystormy Models es un repositorio de exportaciones ONNX de los modelos Demucs de Meta AI para separación de fuentes musicales (music source separation). Lo publica el proyecto Egystormy bajo licencia MIT y su propósito es ofrecer los pesos de Demucs en un formato portable (ONNX) que pueda ejecutarse fuera de PyTorch, facilitando su integración en pipelines de audio en producción, aplicaciones de escritorio o entornos con runtime ONNX Runtime.

El repositorio contiene dos variantes: un export de 4 stems (vocals, drums, bass, other) procedente del export ONNX/OpenVINO de Intel, y un export de 6 stems (drums, bass, other, vocals, guitar, piano) generado por el propio proyecto Egystormy a partir del checkpoint oficial de Demucs, con verificación numérica frente a PyTorch (coseno por stem >= 0.9999998). No se trata de un modelo de lenguaje ni de un modelo generativo de texto: es un modelo de audio especializado en separación de pistas.

La relevancia actual reside en la portabilidad: al estar en ONNX, el modelo puede desplegarse con ONNX Runtime en CPU o GPU sin depender del stack de PyTorch, lo que reduce la fricción de integración en productos de edición musical, karaoke, remasterización o herramientas de producción audiovisual. El tamaño del repositorio es de 2,7 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs (hybrid transformer Demucs para separación de fuentes musicales) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (export ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (con archivo de datos externo `.onnx.data` en la variante de 4 stems) |

## Arquitectura y entrenamiento

Los modelos son HTDemucs (Hybrid Transformer Demucs), la arquitectura de separación de fuentes de Meta AI que combina un backbone tipo transformer con componentes convolucionales en el dominio de la forma de onda y del espectrograma. El repositorio no aporta detalles adicionales sobre el entrenamiento: no se especifican número de tokens, composición del dataset, ni si hubo etapas de ajuste fino. La información disponible se limita a indicar que los pesos proceden del checkpoint oficial de Demucs (MIT) y que la variante de 4 stems proviene del export ONNX/OpenVINO de Intel.

La innovación técnica destacable es la exportación a ONNX con verificación numérica: el autor indica que la variante de 6 stems fue validada frente a PyTorch con un coseno por stem mayor o igual a 0,9999998, lo que garantiza que la inferencia en ONNX Runtime reproduce fielmente la salida del modelo original. La variante de 4 stems mantiene los pesos en un archivo externo (`htdemucs_fwd.onnx.data`) que debe descargarse junto al grafo.

## Capacidades

- Separación de audio musical en 4 stems: vocals, drums, bass y other (variante `htdemucs_fwd.onnx`).
- Separación de audio musical en 6 stems: drums, bass, other, vocals, guitar y piano (variante `htdemucs_6s.onnx`).
- Inferencia en formato ONNX, ejecutable con ONNX Runtime en CPU o GPU.
- Procesamiento de audio de forma independiente del idioma (no es un modelo lingüístico).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión, audio generativo ni capacidades multimodales más allá del procesamiento de audio de entrada.
- No se documentan capacidades multilingües porque no aplican.

## Casos de uso

- Herramientas de karaoke y eliminación de voces: la variante de 4 stems permite aislar la pista de vocals para generar versiones instrumentales, usando ONNX Runtime para integrarlo en aplicaciones de escritorio o web sin dependencia de PyTorch.
- Producción musical y remix: separar drums, bass y other facilita samplear o reemplazar componentes de una mezcla; la variante de 6 stems añade guitar y piano para stems más granulares.
- Remasterización y restauración de audio: aislar instrumentos permite aplicar procesado selectivo (ecualización, compresión) sobre pistas concretas antes de volver a mezclar.
- Plataformas de edición de vídeo: integrar la separación de stems en el pipeline de edición para que el usuario ajuste niveles de voz y música por separado en una banda sonora.
- Investigación en music information retrieval: usar los exports ONNX como referencia reproducible en experimentos de separación de fuentes, con la ventaja de la verificación numérica frente a PyTorch.
- Despliegue en entornos sin PyTorch: servicios en contenedores ligeros o dispositivos con ONNX Runtime que necesiten separación de fuentes sin instalar el stack completo de entrenamiento.
- Aplicaciones de accesibilidad: aislar la voz de una grabación musical para mejorar la inteligibilidad en subtitulado o transcripción asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta la verificación numérica del export de 6 stems frente a PyTorch (coseno por stem >= 0,9999998), que mide fidelidad del export, no calidad de separación (SDR, SIR, SAR).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,7 GB, por lo que se necesita al menos esa cantidad de memoria (RAM o VRAM) para cargar los pesos, más el margen del runtime.
- GPU recomendadas: no disponibles en la información proporcionada; al ser ONNX, es compatible con cualquier GPU soportada por ONNX Runtime (CUDA, DirectML, etc.).
- ¿Cabe en GPU consumer? No se especifica, pero por el tamaño del repositorio (2,7 GB) es plausible en GPUs consumer con suficiente VRAM; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (CPU/GPU); el export de 4 stems proviene de Intel/demucs-openvino, por lo que también es compatible con OpenVINO.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Stems | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Egystormy Models (este repo) | HTDemucs | 4 y 6 | ONNX | MIT | HuggingFace (BEDO97/egystormy-models) |
| Meta Demucs (original) | HTDemucs | 4 (oficial) | PyTorch | MIT | GitHub facebookresearch/demucs |
| Intel/demucs-openvino | HTDemucs | 4 | ONNX/OpenVINO | MIT | HuggingFace (Intel/demucs-openvino) |
| Spleeter (Deezer) | U-Net | 2, 4 y 5 | TensorFlow | MIT | GitHub deezer/spleeter |

La comparativa se limita a alternativas de la misma categoría (separación de fuentes musicales); no se dispone de datos de rendimiento comparativo (SDR) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; cualquier uso conversacional queda fuera de su alcance.
- Riesgo de artefactos en la separación: como todo modelo de separación de fuentes, puede introducir artefactos o sangrado entre stems en mezclas complejas; no se documentan métricas de calidad objetiva.
- Sin datos de sesgo: no se documentan sesgos conocidos, aunque el rendimiento puede variar según género musical, instrumentación y calidad de la grabación.
- Limitaciones de contexto o idioma: no aplican en el sentido lingüístico, pero no se especifican límites de duración de audio procesable por inferencia.
- Restricciones de licencia: la licencia es MIT, lo que permite uso comercial y modificación con atribución; conviene conservar el aviso de copyright de Meta AI y del export de Intel en la variante de 4 stems.
- Caveat de producción: la variante de 4 stems requiere descargar tanto el grafo `.onnx` como el archivo `.onnx.data` y mantenerlos juntos; un empaquetado incorrecto provoca fallos de carga.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del export.

## Enlaces

- HuggingFace: https://huggingface.co/BEDO97/egystormy-models
- Export de referencia de Intel: https://huggingface.co/Intel/demucs-openvino
- Repositorio oficial de Demucs (Meta AI): https://github.com/facebookresearch/demucs
- Spleeter (alternativa): https://github.com/deezer/spleeter
