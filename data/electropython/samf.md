# ElectroPython/samf

## Resumen

SAMF (nombre derivado de los tags del repositorio: Swin Transformer + NetVLAD para geo-localización) es un modelo de extracción de características visuales orientado a *visual place recognition* (VPR) y recuperación cross-modal entre imágenes térmicas y visibles. Lo publica el usuario ElectroPython en HuggingFace bajo acceso restringido (gated) y licencia "other". El repositorio ocupa 0,4 GB y se distribuye en formato PyTorch, lo que sugiere pesos en safetensors o binarios `.pt`/`.pth` (no confirmado en la información disponible).

El modelo aborda un problema clásico en robótica y navegación autónoma: reconocer un lugar previamente visitado cuando las condiciones de iluminación, estación o sensor cambian radicalmente, incluyendo el caso cross-modal térmico-visible. Combina un backbone Swin Transformer con una capa de agregación NetVLAD, un patrón habitual en VPR moderno para producir descriptores globales compactos y robustos a cambios de punto de vista y apariencia.

La relevancia actual viene de su doble uso: por un lado, como extractor de features para pipelines de localización visual; por otro, como modelo de *cross-modal retrieval* térmico-visible, útil en entornos nocturnos o con poca visibilidad donde las cámaras RGB fallan. La información pública es escasa (0 descargas, 0 likes al momento del registro), por lo que muchos detalles técnicos deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer (backbone) + NetVLAD (agregación) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo visual, sin capacidades lingüísticas) |
| Licencia | other (ver repositorio en HuggingFace para términos exactos) |
| Formato de pesos | PyTorch (safetensors o binario, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone Swin Transformer, que procesa la imagen en ventanas jerárquicas con atención desplazada, con una capa de agregación NetVLAD que convierte el mapa de features local en un descriptor global de tamaño fijo. Este esquema es habitual en VPR porque NetVLAD aprende clústeres de features representativos del lugar, lo que aporta invariancia a cambios moderados de punto de vista y condiciones ambientales. El modelo está etiquetado como `cross-modal-retrieval` y `thermal`, lo que indica que fue entrenado o ajustado para alinear representaciones entre imágenes térmicas y visibles.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable en un modelo de visión) ni innovaciones adicionales como decodificación especulativa. Los tags incluyen dos referencias arXiv (2610.12835 y 2306.02994), que probablemente documentan el método y el dataset empleados, pero sus contenidos no están incluidos en la información proporcionada.

## Capacidades

- Extracción de descriptores globales de imagen para *visual place recognition*.
- Recuperación cross-modal entre imágenes térmicas e imágenes visibles.
- Extracción de features de imagen para pipelines de *image-feature-extraction* (pipeline declarado en HuggingFace).
- Robusto a cambios de apariencia derivados de iluminación, estación o modalidad de sensor (según los tags del modelo).
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual.
- Sin capacidades multilingües (no procesa lenguaje).
- No dispone de modo *thinking*, audio ni vídeo declarados.

## Casos de uso

- Localización visual en robótica móvil: el modelo genera descriptores globales con NetVLAD que permiten comparar la imagen actual de la cámara contra una base de datos de lugares previamente mapeados, habilitando relocalización tras pérdida de señal GPS.
- Navegación nocturna con cámaras térmicas: al soportar recuperación cross-modal térmico-visible, permite emparejar una imagen térmica nocturna con una referencia RGB diurna del mismo lugar, útil en vehículos autónomos o drones.
- SLAM visual con apariencia cambiante: integrado como módulo de *loop closure*, los descriptores globales alimentan la detección de revisitación entre frames separados temporalmente, resistiendo cambios de estación o iluminación.
- Búsqueda y organización de archivos fotográficos georreferenciados: indexación de grandes colecciones de imágenes por similitud de lugar, permitiendo consultas del tipo "encuentra imágenes de esta ubicación" sin metadatos GPS.
- Monitorización de infraestructuras con drones: comparación de capturas aéreas tomadas en distintas condiciones (día/noche, verano/invierno) para detectar cambios o verificar que el dron sobrevuela la zona correcta.
- Realidad aumentada y reconstrucción 3D: alineación de capturas actuales con mapas previos para anclar contenido virtual en localizaciones reconocidas, incluso con iluminación adversa.
- Evaluación de robustez en investigación VPR: banco de pruebas para comparar estrategias de agregación (NetVLAD frente a GeM, VLAD, etc.) sobre backbones Swin en escenarios cross-modal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; un Swin Transformer de tamaño base con cabeza NetVLAD suele requerir entre 2 y 6 GB en FP16, pero el tamaño exacto del backbone no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible; por la familia arquitectónica, una RTX 3090/4090 o A100/H100 serían adecuadas para lotes grandes, aunque no hay datos oficiales.
- Cabe en GPU de consumo: probablemente sí (repo de 0,4 GB), pero no confirmado.
- Opciones de despliegue: PyTorch nativo; no se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo). ONNX/TensorRT serían viables previa conversión, no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / uso | Licencia | Disponibilidad |
|---|---|---|---|---|
| SAMF (este modelo) | Swin + NetVLAD | VPR y cross-modal térmico-visible | other (gated) | HuggingFace, acceso restringido |
| NetVLAD (original) | VGG16 + NetVLAD | VPR unimodal RGB | uso académico (según paper) | GitHub oficial |
| AnyLoc | DINOv2 + VLAD | VPR zero-shot generalista | según DINOv2 | GitHub y HuggingFace |
| MixVPR | Backbone CNN + MLP mixer | VPR global descriptor | MIT (según repo) | GitHub |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado métricas para SAMF en la información proporcionada. La principal diferencia frente a NetVLAD y MixVPR es su enfoque cross-modal térmico-visible, y frente a AnyLoc, el uso de Swin en lugar de DINOv2 como backbone.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que puede limitar la reproducibilidad y el uso en producción automatizada.
- Licencia "other": los términos exactos no están especificados en la información disponible; es imprescindible revisar el repositorio antes de cualquier uso comercial.
- Sin métricas publicadas: no hay benchmarks verificables en la información proporcionada, por lo que el rendimiento real frente a alternativas establecidas es desconocido.
- Modelo puramente visual: no procesa texto ni lenguaje, no soporta agentes ni tool calling; no debe evaluarse con criterios de LLM.
- Riesgo de degradación en dominios no cubiertos: al ser un modelo VPR, su rendimiento puede caer ante cambios extremos de estación, oclusiones severas o sensores distintos a los del entrenamiento.
- Trazas de sesgo: los datasets de VPR suelen estar dominados por ciudades europeas o norteamericanas, lo que puede introducir sesgo geográfico; no confirmado en este caso por falta de información sobre el dataset.
- Sin información sobre cuantizaciones ni formatos alternativos (GGUF, ONNX), lo que dificulta el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/ElectroPython/samf
- Paper referenciado (tag): arXiv 2610.12835 (no verificable en la información proporcionada)
- Paper referenciado (tag): arXiv 2306.02994 (no verificable en la información proporcionada)
