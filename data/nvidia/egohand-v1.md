# nvidia/EgoHand-v1

## Resumen

EgoHand v1.0 es un modelo de estimación de pose y forma de mano en 3D a partir de una única imagen RGB, desarrollado por NVIDIA. Dado un recorte de imagen de una mano (cuadrado, con padding, redimensionado a 256×256) y la matriz de intrínsecos de cámara 3×3, el modelo predice los parámetros SOMA-hand (rotaciones de pose y coeficientes de forma/escala MHR de 27 dimensiones) junto con una traslación de cámara en perspectiva completa. La malla 3D final se obtiene deformando la identidad de reposo de la mano mediante cinemática directa con la pose predicha.

Arquitectónicamente combina un backbone vision transformer DINOv3, inicializado desde SAM 3D Body, con una cabeza TransformerDecoder (SOMAHandTransformerDecoderHeadV2) que emplea consultas aprendibles de pose, forma y cámara. El modelo tiene 883,5 millones de parámetros y un repositorio de 10,7 GB. Está pensado para el ámbito egocéntrico, es decir, grabaciones con cámaras montadas en la cabeza o dispositivos XR.

Su relevancia actual reside en el entrenamiento de modelos fundacionales de robótica: las trayectorias de mano extraídas de vídeo de demostración humana sirven como señal de supervisión para políticas de manipulación. El modelo está disponible bajo licencia OpenMDW 1.1 y NVIDIA lo declara apto tanto para uso comercial como no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer: backbone DINOv3 (ViT) + TransformerDecoder (SOMAHandTransformerDecoderHeadV2) |
| Parametros totales | 883,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen única de 256×256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | OpenMDW 1.1 (con Apache 2.0 como información adicional) |
| Formato de pesos | no disponible (librería `egohand`, runtime PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de dos etapas. Un backbone DINOv3, inicializado a partir de SAM 3D Body, extrae características del recorte de mano de 256×256; sobre esas características opera un TransformerDecoder con consultas aprendibles de pose inicial, forma y cámara, que produce los parámetros SOMA-hand y la traslación de cámara condicionada a los intrínsecos de entrada. Los coeficientes de forma/escala parametrizan la identidad de reposo de la mano en MHR, y el rig de SOMA aplica cinemática directa con la pose predicha para generar la malla final.

El entrenamiento combina datos sintéticos y reales: aproximadamente 14 millones de imágenes (unos 9 millones in-the-wild y de captura de movimiento, y unos 5 millones sintéticas) más unas 126 horas de vídeo. Los datos sintéticos se generan con el pipeline interno RigPlay/DigitalHuman, con ground truth exacto de keypoints 3D, parámetros MHR/SOMA y pose de cámara. Los datos reales provienen de captura de movimiento con rig de marcadores reflectantes (unas 16 horas en dos formatos: 1360×1360 a 30 FPS y 2464×2064 a 60 FPS) y de datos egocéntricos adquiridos a terceros. Las pérdidas se calculan en el marco del recorte e incluyen keypoints 2D, keypoints 3D y parámetros MHR/SOMA.

## Capacidades

- Estimación monocular de pose de mano en 3D a partir de un único recorte RGB.
- Predicción de parámetros SOMA-hand: rotaciones de pose y coeficientes de forma/escala MHR de 27 dimensiones.
- Predicción de traslación de cámara en perspectiva completa, condicionada a los intrínsecos de entrada.
- Reconstrucción de malla 3D de mano y joints 3D mediante el rig de SOMA.
- Funcionamiento en escenarios egocéntricos (cámaras montadas en cabeza, dispositivos XR como Apple Vision Pro).
- Post-entrenamiento permitido sobre datos propios del usuario.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente visio-geométrico.

## Casos de uso

- Entrenamiento de modelos fundacionales de robótica: extraer trayectorias 3D de mano de vídeo de demostración humana para supervisar o inicializar políticas de manipulación, aprovechando la predicción conjunta de pose y cámara.
- Aprendizaje por imitación en robots: convertir grabaciones egocéntricas de operarios en secuencias de keypoints 3D y mallas SOMA utilizables como referencia de movimiento.
- Teleoperación y captura de movimiento: reconstruir la pose de la mano en tiempo de grabación desde vídeo XR para animar avatares o controlar efectores finales.
- Análisis de destreza manual en investigación: cuantificar ángulos articulares y forma de la mano en estudios de motricidad con datos de cámaras egocéntricas.
- Generación de datos sintéticos anotados: usar el modelo para etiquetar automáticamente vídeo no anotado con keypoints 3D y parámetros SOMA, ampliando datasets de entrenamiento.
- Interacción en realidad extendida: estimar la pose de la mano del usuario a partir del recorte de cámara del visor para interfaces gestuales, con la ventaja de que el modelo predice también la traslación de cámara.
- Preprocesado en pipelines de captura (IsaacCapture): integrar la inferencia en la fase de post-procesado egocéntrico para obtener mallas de mano consistentes con los intrínsecos reales del sensor.

## Benchmarks y rendimiento

La model card indica que el modelo se evalúa en el benchmark egocéntrico real HOT3D, pero no publica cifras numéricas de resultados. Tampoco se han publicado resultados de MMLU, HumanEval, GSM8K ni métricas comparables en la información disponible, al no tratarse de un modelo lingüístico.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 883,5 M de parámetros, en FP16 el peso ronda los 1,8 GB, por lo que se estima un consumo moderado, aunque la cifra exacta no está publicada.
- GPU recomendadas: NVIDIA Ampere o superior según la model card; el modelo está optimizado para sistemas acelerados por GPU NVIDIA con CUDA.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con suficiente memoria para un ViT de este tamaño (no confirmado por el autor).
- Opciones de despliegue: runtime PyTorch con la librería `egohand`; pipeline de inferencia en IsaacCapture; fine-tuning en NVlabs/GEM-X. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Sistema operativo soportado: Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EgoHand v1.0 (NVIDIA) | 883,5 M | Imagen RGB 256×256 + intrínsecos | Parámetros SOMA-hand + traslación de cámara | no disponible | OpenMDW 1.1 | Hugging Face, 95.606 descargas |
| SAM 3D Body (Meta) | no disponible | Imagen | Pose/malla de cuerpo 3D | no disponible | no disponible | Hugging Face (usado como inicialización del backbone) |
| Alternativas específicas de pose de mano 3D | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numéricos de modelos comparables en la información proporcionada; la comparación se limita a la relación arquitectónica con SAM 3D Body, del que EgoHand hereda la inicialización del backbone DINOv3.

## Limitaciones y advertencias

- Modelo monocular: la precisión depende de la calidad del recorte de mano y de los intrínsecos de cámara proporcionados; errores en la matriz 3×3 degradan la traslación de cámara predicha.
- Entrada restringida a recortes de 256×256, lo que limita el detalle disponible para manos pequeñas o muy ocluidas.
- Sesgos de dominio: entrenado principalmente con datos egocéntricos y sintéticos; el rendimiento puede degradarse en cámaras no egocéntricas, iluminación extrema o manos con objetos que las ocluyan.
- Riesgo de predicciones plausibles pero incorrectas en poses extremas o fuera de distribución; no hay métricas de incertidumbre publicadas.
- La model card no publica cifras de benchmarks, por lo que la validación en el caso de uso concreto corre a cargo del integrador.
- Licencia OpenMDW 1.1: aunque NVIDIA declara uso comercial permitido, conviene revisar los términos completos del acuerdo antes de desplegar en producción; se añade Apache 2.0 como información adicional.
- Requiere entorno Linux con GPU NVIDIA Ampere o superior y PyTorch; no se documenta soporte para CPU ni para otras plataformas.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural ni tool calling.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/EgoHand-v1
- Licencia OpenMDW 1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Pipeline de inferencia EgoHand (IsaacCapture): https://github.com/NVIDIA/IsaacCapture/tree/main/src/python/isaaccapture_egopost
- Fine-tuning de EgoHand (GEM-X): https://github.com/NVlabs/GEM-X
- SAM 3D Body (inicialización del backbone): https://huggingface.co/facebook/sam-3d-body-dinov3
- NVIDIA: https://www.nvidia.com/
