# pablovela5620/egohand

## Resumen

EgoHand v1.0 es un modelo de estimación de pose de manos egocéntricas desarrollado por NVIDIA. Dada una imagen RGB recortada a partir de una caja delimitadora 2D de la mano y redimensionada a 256×256, junto con los intrínsecos de cámara, el modelo predice parámetros SOMA de mano (pose y coeficientes de forma/escala de 27 dimensiones del modelo MHR) y una traslación de cámara en perspectiva completa. La salida permite reconstruir mallas 3D de la mano mediante cinemática directa sobre el rig de SOMA.

Arquitectónicamente combina un backbone DINOv3 (Vision Transformer, inicializado desde SAM 3D Body) con una cabeza TransformerDecoder (SOMAHandTransformerDecoderHeadV2) que emplea consultas aprendibles de pose, forma y cámara. El modelo cuenta con 883,5 millones de parámetros y se distribuye en formato safetensors de solo pesos (3,55 GB), reempaquetado por un tercero a partir del checkpoint original de PyTorch Lightning.

Su relevancia actual reside en el entrenamiento de modelos fundacionales de robótica: las trayectorias 3D de manos extraídas de vídeo de demostración humana sirven como señal de supervisión para políticas de manipulación. El repositorio analizado es una copia no oficial, weights-only, bit-idéntica al original de NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer: backbone DINOv3 (ViT) + TransformerDecoder head (SOMAHandTransformerDecoderHeadV2) |
| Parámetros totales | 883,5 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto; entrada de imagen 256×256) |
| Tipos de cuantización | no disponible (pesos distribuidos en float32; no se han publicado variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | OpenMDW License Agreement v1.1 (con Apache 2.0 adicional) |
| Formato de pesos | safetensors (817 tensores float32); checkpoint original en PyTorch Lightning (.ckpt) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de dos etapas. Un backbone DINOv3, inicializado desde SAM 3D Body, extrae características visuales de la imagen de entrada de 256×256. Sobre estas características opera una cabeza TransformerDecoder con consultas aprendibles de pose inicial, forma y cámara, que produce los parámetros SOMA de la mano y la traslación de cámara condicionada a los intrínsecos de entrada. Los coeficientes de forma/escala parametrizan la identidad de mano en reposo del modelo MHR, y el rig de SOMA aplica cinemática directa con la pose predicha para generar la malla 3D final.

El entrenamiento combina datos sintéticos y reales: aproximadamente 14 millones de imágenes (unos 9 millones in-the-wild y de captura de movimiento, y unos 5 millones sintéticas) más aproximadamente 126 horas de vídeo. Las pérdidas se calculan en el marco del recorte e incluyen keypoints 2D, keypoints 3D y parámetros MHR/SOMA. La evaluación se realiza sobre el benchmark egocéntrico real HOT3D. El modelo admite post-entrenamiento con datos propios.

## Capacidades

- Estimación monocular de pose 3D de mano a partir de un único recorte RGB.
- Predicción de parámetros SOMA de mano: rotaciones de pose y coeficientes de forma/escala de 27 dimensiones del modelo MHR.
- Predicción de traslación de cámara en perspectiva completa, condicionada a los intrínsecos de entrada (matriz 3×3 con focal y punto principal).
- Reconstrucción de malla 3D de mano mediante el rig de SOMA y cinemática directa.
- Generación de keypoints 3D de mano utilizables como señal de entrenamiento.
- Post-entrenamiento (fine-tuning) sobre datos propios del usuario.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es un modelo puramente perceptivo de visión.

## Casos de uso

- Supervisión de políticas de manipulación robótica: las trayectorias 3D de mano extraídas de vídeo de demostración humana alimentan el entrenamiento de modelos fundacionales de robótica y políticas de manipulación, donde se requiere precisión en la trayectoria de la mano.
- Captura de movimiento de manos en primera persona: procesamiento de vídeo egocéntrico (por ejemplo, grabaciones con cámara montada en cabeza) para reconstruir poses y mallas de mano cuadro a cuadro, adecuado por su evaluación en el benchmark egocéntrico HOT3D.
- Anotación automática de datasets: generación de keypoints 3D y parámetros SOMA como etiquetas para conjuntos de datos de manos, reduciendo el coste de anotación manual en pipelines de datos a gran escala.
- Análisis de interacción mano-objeto: combinación de la pose de mano con la traslación de cámara para situar la mano en el espacio de la escena, útil en estudios de manipulación y en robótica de imitación.
- Prototipado en investigación de visión por computador: punto de partida para experimentos de estimación de pose de mano que requieran un backbone DINOv3 preentrenado con cabeza de decodificación de parámetros.
- Post-entrenamiento con datos propios: ajuste del modelo sobre dominios específicos (por ejemplo, cámaras o entornos industriales) partiendo de los pesos distribuidos en safetensors.
- Integración en pipelines de captura con Isaac: uso junto al pipeline de inferencia de NVIDIA IsaacCapture para procesamiento egocéntrico dentro del ecosistema CUDA.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card original indica únicamente que el modelo se evalúa sobre el benchmark egocéntrico real HOT3D, sin aportar cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan 3,55 GB; con activaciones y overhead de PyTorch, se estima un consumo en torno a 5-6 GB, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: el fabricante indica compatibilidad con microarquitectura NVIDIA Ampere (por ejemplo, A100, A10, RTX 30xx); no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM (RTX 3060/4060 y superiores), dado el tamaño de los pesos.
- Opciones de despliegue: PyTorch como motor de ejecución; el ecosistema indicado es CUDA sobre Linux. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- Sistema operativo soportado: Linux (según la model card original).

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EgoHand v1.0 (NVIDIA) | 883,5 M | Imagen 256×256 + intrínsecos | Parámetros SOMA + traslación de cámara | OpenMDW 1.1 | HuggingFace (nvidia/EgoHand-v1) |
| SAM 3D Body (Meta) | no disponible | Imagen | Cuerpo 3D | no disponible | HuggingFace (facebook/sam-3d-body-dinov3) |
| Alternativas de estimación de mano 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con modelos de la misma categoría. SAM 3D Body se cita únicamente como origen del backbone DINOv3, no como alternativa funcional directa.

## Limitaciones y advertencias

- El repositorio analizado es una copia no oficial reempaquetada por un tercero; no ha sido validada por NVIDIA. Para uso en producción conviene partir del repositorio original nvidia/EgoHand-v1.
- Modelo monocular: la precisión depende de la calidad del recorte de la caja delimitadora y de los intrínsecos de cámara proporcionados; errores en estos insumos degradan la reconstrucción 3D.
- Entrada limitada a recortes de 256×256, lo que puede perder detalle en manos pequeñas o con oclusiones.
- Riesgo de sesgo inherente a la distribución de los datos de entrenamiento (mezcla de sintético, in-the-wild y MOCAP); no se documentan análisis de sesgo en el material disponible.
- Riesgo de alucinación en el sentido de predicciones plausibles pero incorrectas en poses ambiguas u ocluidas; no se publican métricas de calibración de incertidumbre.
- La licencia OpenMDW 1.1 permite uso comercial según la model card, pero impone términos específicos que deben revisarse antes de desplegar; se añade Apache 2.0 como información adicional.
- Requiere entorno Linux con GPU NVIDIA Ampere y CUDA; no se garantiza funcionamiento en CPU ni en otras microarquitecturas.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones; cualquier uso en ese sentido queda fuera de su alcance.
- El autor del reempaquetado no ofrece garantías sobre la integridad más allá del hash SHA256 publicado.

## Enlaces

- Repositorio analizado: https://huggingface.co/pablovela5620/egohand
- Modelo original de NVIDIA: https://huggingface.co/nvidia/EgoHand-v1
- Backbone de referencia (SAM 3D Body): https://huggingface.co/facebook/sam-3d-body-dinov3
- Pipeline de inferencia EgoHand (IsaacCapture): https://github.com/NVIDIA/IsaacCapture/tree/main/src/python/isaaccapture_egopost
- Finetuning de EgoHand (GEM-X): https://github.com/NVlabs/GEM-X
- Licencia OpenMDW 1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
