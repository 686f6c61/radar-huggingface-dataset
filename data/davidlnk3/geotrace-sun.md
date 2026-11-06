# davidlnk3/geotrace-sun

## Resumen

GeoTrace sun position model es un modelo de visión por computador especializado en estimar la posición relativa del sol (azimut y altitud) a partir de una única imagen de exterior. Lo desarrolla davidlnk3 como componente del proyecto GeoTrace y se publica en Hugging Face bajo licencia MIT. El modelo resuelve un problema acotado pero técnicamente exigente: inferir la dirección de la iluminación solar dominante en una escena outdoor sin metadatos de captura, geolocalización ni marca temporal.

Arquitectura y tamaño: se trata de un fine-tuning de facebook/dinov2-small (backbone transformer de visión de aproximadamente 22 millones de parámetros) al que se añaden dos cabezas de clasificación: una de 64 bins para el azimut solar relativo a la cámara y otra de 16 bins para la altitud. El modelo no procesa texto ni mantiene contexto conversacional; su entrada es una imagen y su salida son dos valores angulares discretizados.

Es relevante ahora porque la estimación de iluminación es un paso previo habitual en pipelines de relighting, aumento de datos sintéticos, análisis forense de imágenes y realidad aumentada. Frente a enfoques genéricos, este modelo se limita a la componente solar y reporta errores de aproximadamente 1,6° en altitud y 5,6° en azimut, lo que lo hace útil como módulo dentro de una cadena mayor (GeoTrace) en lugar de como solución autónoma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv2-small (ViT) como backbone + dos cabezas de clasificación (64 bins azimut, 16 bins altitud) |
| Parámetros totales | no disponible (backbone DINOv2-small, ~22 M en el backbone; total exacto no publicado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen única) |
| Tipos de cuantización | no disponible (pesos distribuidos en `best.pt`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (modelo de visión sin componente lingüística) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

El modelo parte de facebook/dinov2-small, un Vision Transformer preentrenado con auto-supervisión sobre grandes corpus de imágenes, y lo adapta mediante fine-tuning supervisado a una tarea de regresión angular discretizada. La salida se obtiene con dos cabezas lineales independientes: una clasifica el azimut solar relativo a la cámara en 64 bins y otra la altitud en 16 bins. La decodificación de bins a ángulos continuos está implementada en `src/geotrace/core/sun_model.py` del repositorio GeoTrace.

El modelo es una reimplementación independiente de la parte de estimación de posición solar de *All-Weather Deep Outdoor Lighting Estimation* (Zhang et al., CVPR 2019); no es el código original de los autores. No se han publicado en la información disponible datos sobre el volumen del dataset de entrenamiento, su composición, ni si se aplicaron técnicas de aumento, RLHF o ajuste fino adicional. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Estimación de la posición solar relativa a la cámara a partir de una imagen de exterior: azimut (64 bins) y altitud (16 bins).
- Regresión angular discretizada con decodificación a valores continuos en grados.
- Funciona como herramienta (`relative_sun_position_from_outdoor_lighting`) dentro del pipeline GeoTrace.
- Descarga automática de pesos vía `hf_hub_download` fijada a una revisión concreta del repositorio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, audio ni vídeo.
- No dispone de modo thinking ni de salida estructurada más allá de los dos ángulos estimados.

## Casos de uso

- Relighting y composición de escenas: estimar la dirección solar dominante para recolocar fuentes de luz virtuales de forma coherente con la iluminación original de la fotografía.
- Aumento de datos sintéticos: generar variantes de imágenes outdoor con etiquetas de iluminación solar para entrenar otros modelos de visión sensibles a la luz.
- Realidad aumentada en exteriores: alinear la iluminación de objetos virtuales con la posición del sol inferida de la cámara del dispositivo.
- Análisis forense y verificación de imágenes: comprobar si las sombras y la iluminación de una imagen son consistentes con una posición solar plausible, como señal auxiliar en detección de manipulaciones.
- Automatización de pipelines de fotografía computacional: seleccionar o agrupar imágenes por condiciones de luz solar estimadas sin depender de metadatos EXIF.
- Investigación en visión por computador: servir como bloque de referencia o baseline para experimentos de estimación de iluminación outdoor, dado que es una reimplementación independiente de un método publicado.
- Preprocesado en sistemas de simulación solar: alimentar modelos de irradiancia o de sombreado con una estimación rápida de la geometría solar relativa.

## Benchmarks y rendimiento

| Métrica | Valor reportado |
|---|---|
| Error típico en altitud solar | ~1,6° |
| Error típico en azimut solar | ~5,6° |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de visión especializado y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del backbone DINOv2-small (~22 M de parámetros) y el peso del repositorio (0,1 GB), la huella en memoria es reducida y cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060, RTX 4090 o superior es más que suficiente. También puede ejecutarse en CPU para inferencia puntual.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas actuales, dado el reducido tamaño del modelo.
- Opciones de despliegue: PyTorch nativo; el peso se distribuye como `best.pt` y se carga mediante `hf_hub_download`. No se han publicado variantes para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoTrace sun position model | ViT (DINOv2-small) + cabezas de clasificación | ~22 M (backbone) | Posición solar relativa (azimut/altitud) | MIT | Hugging Face (`davidlnk3/geotrace-sun`) |
| Zhang et al. (CVPR 2019), método original | Red profunda de estimación de iluminación outdoor | no disponible | Iluminación outdoor completa (incluye sol) | no disponible | Paper; código de los autores no incluido en esta ficha |
| DINOv2-small (facebook) | ViT auto-supervisado | ~22 M | Representaciones visuales genéricas | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables de alternativas específicas de estimación de posición solar en la información proporcionada.

## Limitaciones y advertencias

- Modelo muy especializado: solo estima posición solar relativa; no genera texto, no razona y no responde a instrucciones.
- El error en azimut (~5,6°) es notablemente mayor que en altitud (~1,6°), lo que puede afectar a aplicaciones que requieran precisión direccional fina.
- Depende de que la imagen sea de exterior y contenga señal de iluminación solar; escenas nocturnas, interiores o con luz artificial dominante pueden degradar la estimación.
- No se han documentado sesgos del dataset de entrenamiento; al ser un fine-tuning sobre datos no publicados, existe riesgo de sesgo por composición geográfica, climatología o tipo de escena.
- Riesgo de alucinación en el sentido de estimaciones plausibles pero incorrectas cuando la imagen carece de información suficiente (cielos cubiertos, sombras ambiguas).
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar las condiciones del modelo base DINOv2 de Meta, cuyos términos no se detallan en esta ficha.
- Es una reimplementación independiente, no el código oficial de Zhang et al.; los resultados pueden diferir de los del paper original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria ni reportes de uso en producción.
- No se han publicado datos sobre cuantizaciones, latencia ni throughput, lo que dificulta planificar despliegues con requisitos estrictos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidlnk3/geotrace-sun
- Repositorio GeoTrace: https://github.com/davidlnk3/GeoTrace
- Implementación de arquitectura y decodificación: https://github.com/davidlnk3/GeoTrace/blob/main/src/geotrace/core/sun_model.py
- Modelo base DINOv2-small: https://huggingface.co/facebook/dinov2-small
- Paper de referencia (Zhang et al., CVPR 2019): *All-Weather Deep Outdoor Lighting Estimation* (no se proporciona URL directa en la información disponible)
