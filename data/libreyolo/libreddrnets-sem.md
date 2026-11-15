# LibreYOLO/LibreDDRNets-sem

## Resumen

LibreDDRNets-sem es un modelo de segmentación semántica de imágenes correspondiente a la variante DDRNet-23-slim, convertido para su uso con la librería LibreYOLO. El modelo original DDRNet fue desarrollado por el equipo de yDhongHIT (repositorio upstream) y esta versión concreta ha sido reempaquetada por LibreYOLO para integrarse en su ecosistema de inferencia. Resuelve la tarea de segmentación semántica densa sobre 19 clases del dataset urbano Cityscapes, orientada a escenas de conducción y percepción de entorno.

La arquitectura subyacente es DDRNet (Deep Dual-Resolution Network), una red de dos ramas con resolución dual diseñada para segmentación semántica en tiempo real, con un backbone de tipo ResNet y una cabeza auxiliar de entrenamiento. El checkpoint reporta un mIoU de validación de 77,8 sobre Cityscapes según el propio repositorio upstream, y está pensado para evaluación en un lienzo de 1024x2048 píxeles.

La relevancia de esta publicación es doble: por un lado, ofrece pesos de segmentación semántica de alta eficiencia accesibles vía una librería unificada; por otro, arrastra una restricción importante de licencia derivada del dataset Cityscapes, que limita su uso comercial. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y de baja difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDRNet-23-slim (Deep Dual-Resolution Network, dos ramas de resolución dual) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; lienzo de evaluacion 1024x2048) |
| Tipos de cuantizacion | no disponible (pesos en formato .pt) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (interpretacion implicita de LibreYOLO) sujeta a restriccion no comercial por Cityscapes |
| Formato de pesos | .pt (checkpoint LibreYOLO con metadatos: model_family=ddrnet, size=s, task=semantic, nc=19) |

## Arquitectura y entrenamiento

DDRNet (Deep Dual-Resolution Network) es una arquitectura de segmentación semántica en tiempo real basada en dos ramas paralelas: una de alta resolución que preserva detalle espacial y otra de baja resolución que captura contexto semántico, con fusiones bidireccionales entre ambas a lo largo de la red. La variante -23-slim reduce el número de canales y bloques para maximizar el rendimiento en inferencia. El checkpoint incluye la cabeza auxiliar empleada durante el entrenamiento.

Los pesos proceden del checkpoint oficial DDRNet-23-slim para Cityscapes publicado por el repositorio upstream ydhongHIT/DDRNet (commit de0db317c5af4b0946231f475cf74ca4f51b8ac2), con SHA-256 `688dd42edbd623d21a6fe67c4b90ef8a5913d2824214a49bb60d94c61e6544b4`. La conversión realizada por LibreYOLO consiste únicamente en eliminar el prefijo `model.` del wrapper de entrenamiento y descartar el buffer `loss.criterion.weight`; los parámetros aprendidos no se modifican. Se verificó la paridad con el código oficial mediante `weights/parity_ddrnet.py`, obteniendo `max_abs_diff == 0`. El entrenamiento se realizó sobre Cityscapes (19 clases), y no se documenta en la información disponible el número de tokens, épocas ni el esquema de augmentación empleado.

## Capacidades

- Segmentación semántica densa de imágenes en 19 clases de escenas urbanas (Cityscapes): carretera, acera, edificio, vegetación, cielo, vehículos, peatones, etc.
- Inferencia por píxel con salida de mapa de etiquetas a resolución de evaluación 1024x2048.
- Integración nativa con la librería LibreYOLO mediante la API `LibreYOLO("LibreDDRNets-sem.pt")`.
- Guardado de resultados visuales con el parámetro `save=True`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, de visión general, audio ni modo thinking.
- No se documentan capacidades de detección de instancias ni de segmentación panóptica; es exclusivamente semántica.

## Casos de uso

- Percepción de entorno en conducción autónoma: el modelo genera mapas de segmentación semántica de escenas urbanas a 1024x2048, adecuado para identificar carretera, aceras, vehículos y peatones en pipelines de vehículos autónomos o ADAS.
- Análisis de vídeo de tráfico urbano: permite procesar fotogramas de cámaras de vigilancia para cuantificar ocupación de carriles, presencia de peatones o superficies transitables, gracias a sus 19 clases alineadas con Cityscapes.
- Preprocesado para sistemas de mapeo y localización: los mapas semánticos pueden alimentar módulos de construcción de mapas de alta definición o de segmentación de vía libre.
- Robótica móvil en entornos urbanos: útil para que un robot identifique zonas transitables (acera, carretera) frente a obstáculos (edificios, vegetación) en navegación outdoor.
- Etiquetado asistido y aumento de datos: el modelo puede pre-anotar imágenes urbanas para acelerar el etiquetado humano en proyectos de visión por computador, con revisión posterior.
- Investigación en segmentación eficiente: al ser una variante slim, sirve como baseline para comparar técnicas de eficiencia en segmentación semántica en tiempo real.
- Integración en pipelines LibreYOLO: equipos que ya usan la librería pueden añadir segmentación semántica junto a detección de objetos sin cambiar de stack.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| Cityscapes val | mIoU | 77,8 (reportado upstream) |

No se han publicado en la información disponible resultados adicionales de benchmarks (FPS, latencia, comparativas numéricas con otros modelos) más allá del mIoU de validación indicado por el repositorio upstream.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de una variante slim de segmentación, la huella es moderada, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible. Por el tipo de tarea (segmentación en tiempo real) se espera que funcione en GPU de consumo, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: librería `libreyolo` (instalable con `pip install libreyolo`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | mIoU Cityscapes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreDDRNets-sem (DDRNet-23-slim) | no disponible | 1024x2048 | 77,8 (val) | MIT implicita + restriccion no comercial Cityscapes | Hugging Face (LibreYOLO) |
| DDRNet-23-slim original (ydhongHIT) | no disponible | 1024x2048 | 77,8 (val) | MIT | GitHub + Google Drive |
| Otras variantes DDRNet (s, m, l) | no disponible | no disponible | no disponible | MIT | Repositorio LibreYOLO (backbones ImageNet) |

No se dispone en la información proporcionada de datos comparativos con otras familias de segmentación semántica (por ejemplo, BiSeNet, SegFormer o DeepLab) que permitan una comparación numérica rigurosa.

## Limitaciones y advertencias

- Restricción de uso comercial: los pesos se entrenaron sobre Cityscapes, cuya licencia limita el dataset y sus derivados a uso no comercial. Un fine-tune iniciado desde este checkpoint hereda dicha restricción.
- Licencia MIT "sobre base implícita": LibreYOLO declara que el repositorio upstream no establece términos separados para estos pesos y los aloja bajo MIT de forma interpretada, no confirmada por el publicador original.
- Dominio limitado: entrenado exclusivamente en escenas urbanas de Cityscapes (19 clases); el rendimiento fuera de ese dominio (interiores, escenas rurales, imágenes aéreas) no está garantizado.
- Riesgo de errores de segmentación en condiciones adversas (lluvia, noche, oclusiones) no documentado pero esperable en modelos de este tipo.
- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, código ni agentes.
- Sesgos: no documentados en la información disponible; pueden reflejar la distribución geográfica y demográfica de Cityscapes (ciudades alemanas).
- Idiomas: no aplica; no se documentan capacidades multilingües.
- Repositorio con 0 descargas y 0 likes: ecosistema y soporte comunitario limitados.
- Sin datos publicados de latencia, VRAM ni FPS, lo que dificulta planificar despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreDDRNets-sem
- Repositorio upstream DDRNet: https://github.com/ydhongHIT/DDRNet
- Checkpoint original (Google Drive): https://drive.google.com/file/d/1d_K3Af5fKHYwxSo8HkxpnhiekhwovmiP
- Repositorio fuente LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Licencia Cityscapes: https://www.cityscapes-dataset.com/license/
- Dataset Cityscapes: https://www.cityscapes-dataset.com/
