# APLUX-Agora/MediaPipe-Selfie-Segmentation

## Resumen

MediaPipe-Selfie-Segmentation es un paquete de recursos de despliegue para Qualcomm publicado por APLUX-Agora en su plataforma Agora. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de la conversión y empaquetado de un modelo de segmentación de imagen (segmentación de selfies, es decir, separación de la persona del fondo) optimizado para ejecutarse en aceleradores neuronales (QNN) de SoC Qualcomm. El repositorio contiene artefactos compilados por precisión y por placa, no los pesos originales en un formato estándar de entrenamiento.

El modelo resuelve la tarea de segmentación binaria de silueta humana en imágenes, un componente habitual en pipelines de videollamada, edición fotográfica y efectos de fondo. Su relevancia radica en la validación por placa: el autor reporta latencias medidas en hardware real (2,9 ms en QCS6490 y 1,1 ms en QCS8550), lo que lo hace útil para aplicaciones de AIoT con requisitos de tiempo real. La información disponible es muy escasa: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, y la model card no detalla arquitectura, parámetros ni datos de entrenamiento.

Cabe señalar que el nombre remite al modelo de segmentación de selfies de MediaPipe (Google), pero la ficha no puede confirmar que los artefactos correspondan exactamente a esa arquitectura, ya que el autor no publica esa información ni los pesos fuente. Todo lo indicado a continuación se limita a lo declarado en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentación de imagen; se desconoce la topología concreta) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | W8A16, W8A8 (QCS6490); FP16, W8A16, W8A8 (QCS8550) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm; license: other) |
| Formato de pesos | artefactos QNN compilados (`model.bin` y `model.json` por precisión y SoC); no se publican safetensors ni GGUF |
| Tarea | image-segmentation (entrada: imagen; salida: máscaras) |
| Entrada | image |
| Salida | masks |
| SoC soportados | QCS6490 (Rhino Pi A1), QCS8550 (Rhino Pi X1) |
| Tamano del repo | 0,0 GB (metadatos de Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card no describe la topología (si es una CNN ligera, un encoder-decoder o una variante de MobileNet), ni el número de parámetros, ni el conjunto de datos de entrenamiento, ni si hubo destilación, cuantización consciente del entrenamiento (QAT) o ajuste posterior. El autor solo indica que los recursos se han generado "usando el preprocesado y los ejemplos oficiales de Model Farm" y que se han validado placa a placa.

El aspecto técnico destacable es el pipeline de despliegue: los artefactos se organizan en `targets/<SoC>/`, con un `model.json` que declara la precisión por defecto y las rutas de las variantes, y un directorio por precisión que contiene los binarios compilados (`model.bin`). Esto implica una conversión previa al formato QNN de Qualcomm, con soporte de cuantización FP16, W8A16 y W8A8 según el SoC. No se documentan detalles sobre calibración de cuantización, dataset de calibración ni métricas de degradación de precisión tras la cuantización.

## Capacidades

- Segmentación de imagen orientada a selfies: separa la silueta de la persona del fondo y genera una máscara como salida.
- Ejecución en aceleradores QNN de Qualcomm, con variantes por precisión (FP16, W8A16, W8A8).
- Validación por placa: el autor reporta latencias medidas en QCS6490 y QCS8550.
- Preprocesado y postprocesado oficiales disponibles a través de la plataforma Agora (guía de despliegue y proyecto exportable).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, texto, visión general, audio ni modo de pensamiento.
- No se documentan capacidades multilingües (no aplica a un modelo de segmentación).

## Casos de uso

- Videollamadas y conferencias con sustitución de fondo: el modelo genera la máscara de la persona en tiempo real; con latencias de 1,1 ms en QCS8550 y 2,9 ms en QCS6490, es viable en flujos de vídeo a 30 fps sin penalización perceptible.
- Edición fotográfica en dispositivos móviles o cámaras AIoT: permite aplicar desenfoque de fondo, recorte automático o composición sobre nuevos fondos directamente en el dispositivo, sin enviar la imagen a la nube.
- Efectos de realidad aumentada y filtros en tiempo real: la máscara sirve como entrada para segmentar la silueta y aplicar máscaras, sombras o partículas sobre el fondo.
- Control de presencia o aforo en dispositivos edge: combinado con detección previa, la máscara permite aislar a la persona para conteo o análisis de ocupación en cámaras inteligentes con SoC Qualcomm.
- Pipelines de visión en robótica y domótica AIoT: separación de primer plano para tareas de seguimiento o interacción gestual en placas como Rhino Pi A1/X1.
- Prototipado rápido en la plataforma Agora: el autor ofrece ejecución online sin placa física y exportación de proyectos, lo que permite evaluar la segmentación antes de adquirir hardware.
- Integración en aplicaciones de captura de documentos o identidad: la máscara de silueta puede asistir en el recorte de retratos para carnés o verificaciones, siempre que se valide el sesgo y la precisión en condiciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de segmentación (IoU, Dice, mAP) en la información disponible. El autor solo reporta latencias de inferencia medidas en la plataforma Agora:

| SoC · placa | Precisiones | Latencia medida (precisión por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 2,9 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 1,1 ms |

No se especifica la resolución de entrada, el tamaño de lote ni las condiciones de medición, por lo que estos valores deben tomarse como orientativos y no como comparables con otros modelos sin validación propia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican pesos ni tamaño del modelo; los artefactos son binarios QNN para acelerador dedicado, no para GPU convencional).
- GPU recomendadas: no aplica; el despliegue está pensado para el NPU/QNN de SoC Qualcomm (QCS6490, QCS8550), no para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecución en GPUs NVIDIA o AMD.
- Opciones de despliegue: plataforma Agora (ejecución online y exportación de proyectos), descarga de artefactos por SoC mediante `hf download` con `--include "targets/<SoC>/*"`, y uso del runner y del pre/postprocesado oficiales de Model Farm.
- Latencia y throughput estimados: 2,9 ms (QCS6490) y 1,1 ms (QCS8550) según el autor; no se reporta throughput en fps ni condiciones de medición.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa: la model card no publica parámetros, arquitectura ni métricas de calidad, y no se han identificado en la información proporcionada modelos comparables con artefactos QNN validados por placa. Como referencia cualitativa, el modelo original de MediaPipe Selfie Segmentation (Google) es la alternativa más directa en cuanto a tarea, pero no se dispone de sus especificaciones en esta búsqueda para comparar parámetros, contexto o licencia. Se indica por tanto "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MediaPipe-Selfie-Segmentation (APLUX-Agora) | no disponible | no aplica | APLUX Model Farm License | Hugging Face, plataforma Agora |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información muy escasa: no se publican arquitectura, parámetros, datos de entrenamiento ni métricas de calidad, lo que impide evaluar su idoneidad frente a alternativas.
- Licencia restrictiva: se rige por la APLUX Model Farm License, no por una licencia open source estándar; es imprescindible revisar `LICENSE_MODEL_FARM.pdf` antes de cualquier uso comercial. La licencia del modelo fuente original también aplica según los términos de este.
- Dependencia de hardware Qualcomm: los artefactos están compilados para QNN y SoC concretos (QCS6490, QCS8550); no se garantiza su funcionamiento en otras plataformas ni en GPU convencionales.
- Riesgo de sesgo: al ser un modelo de segmentación de siluetas humanas, puede degradarse en función del tono de piel, iluminación, oclusión, fondos complejos o personas con determinadas características; no se documentan evaluaciones de equidad.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de errores de segmentación (bordes imprecisos, falsos positivos) que pueden afectar a aplicaciones críticas.
- Idiomas: no aplica ni se documenta; no es un modelo de texto.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Repositorio sin descargas ni validación comunitaria (0 descargas, 0 likes), lo que reduce la confianza en la reproducibilidad de los resultados reportados.
- No se especifican condiciones de medición de latencia (resolución, lote, versión de runtime), por lo que los tiempos deben validarse en el hardware objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/MediaPipe-Selfie-Segmentation
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/MediaPipe-Selfie-Segmentation/blob/main/LICENSE_MODEL_FARM.pdf
- Plataforma Agora (ejecución online del modelo): https://mega.aidlux.com/models/mediapipe-selfie-segmentation
- Agora (sitio principal): https://mega.aidlux.com
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos distintos de los anteriores.
