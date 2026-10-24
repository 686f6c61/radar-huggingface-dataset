# matrixportalx/LivePortrait-onnx

## Resumen

LivePortrait-onnx es un espejo de artefactos ONNX del sistema LivePortrait (Kuaishou/KlingTeam, licencia MIT), un framework de animación y reenactment de retratos faciales. No es un modelo de lenguaje: el repositorio empaqueta cuatro redes independientes que, encadenadas, permiten transferir la expresión y el movimiento de un vídeo o secuencia de conductor sobre una fotografía estática de un rostro. En concreto incluye el extractor de características de apariencia, el extractor de movimiento, la red de stitching (fusión de la cara generada con el resto del fotograma) y el generador warping+SPADE, que sintetiza la imagen final.

El repositorio lo publica el usuario matrixportalx como espejo de la conversión de warmshao/FasterLivePortrait (revisión `eb937f4bec71`), con el objetivo declarado de que las aplicaciones Rüya y Esin sigan teniendo acceso a los ficheros aunque los repositorios de origen se eliminen o se oculten. Según la model card, esos mismos ONNX se ejecutan con ONNX Runtime sobre CPU de teléfono para la función de edición de expresión facial de la app.

Su relevancia es fundamentalmente práctica: ofrece un pipeline de animación facial ligero y portable en formato ONNX, con 0,5 GB de repositorio, lo que facilita el despliegue en dispositivos sin GPU dedicada. Ahora bien, no hay información publicada sobre arquitectura interna detallada, número de parámetros, datos de entrenamiento ni resultados de benchmarks, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | conjunto de cuatro redes para animación de retrato: extractor de características de apariencia, extractor de movimiento, red de stitching y generador warping+SPADE (detalle de backbones no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es imagen y fotogramas de conducción) |
| Tipos de cuantizacion | no disponible; los artefactos publicados son ONNX y no se indica precisión (fp32/fp16) ni variantes cuantizadas |
| Idiomas soportados | no disponible (la tarea es independiente del idioma; la model card está redactada en turco) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`); el repo lleva las etiquetas `gguf` y `stable-diffusion.cpp`, pero no se listan ficheros en esos formatos |
| Tamano del repositorio | 0,5 GB |
| Ficheros incluidos | `appearance_feature_extractor.onnx`, `motion_extractor.onnx`, `stitching.onnx`, `warping_spade.onnx`, `KAYNAK-README.md` |
| Runtime previsto | ONNX Runtime (CPU de móvil según la model card) |
| Resolucion de entrada | no disponible |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una conversión y espejo de pesos ya existentes. La cadena de inferencia que describen los nombres de los ficheros es la clásica de LivePortrait: un extractor de apariencia que codifica la identidad y textura del retrato de origen; un extractor de movimiento que estima los parámetros de movimiento (puntos clave implícitos y transformaciones) del sujeto conductor; un módulo de warping que deforma las características de apariencia según ese movimiento; y un generador con bloques SPADE que renderiza la imagen final. La red de stitching se encarga de recomponer la región facial generada con el resto del fotograma para evitar costuras visibles.

La model card indica que la conversión procede de warmshao/FasterLivePortrait (MIT) y que `warping_spade.onnx` es la variante que usa `GridSample` estándar, no la versión `-fix` que requiere un plugin de TensorRT. No se especifican tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones de decodificación; esos datos corresponden al proyecto original de Kuaishou/KlingTeam y no están disponibles en la información proporcionada. Tampoco se documenta si los ONNX se exportaron en fp32 o fp16, ni con qué versión de opset.

## Capacidades

- Transferencia de expresión facial: reproduce la mímica de un vídeo o secuencia de conducción sobre una imagen estática de un rostro.
- Reenactment de retratos: anima fotografías manteniendo la identidad del sujeto de origen.
- Edición de expresión sobre imagen fija, que es el uso declarado en la app Rüya ("Yüz İfadesi").
- Composición con stitching: integra la cara generada en el fotograma completo en lugar de devolver un recorte aislado.
- Ejecución en CPU mediante ONNX Runtime, sin requerir GPU.
- Portabilidad de runtime: al ser ONNX, puede ejecutarse en distintos backends compatibles (no verificado en este repo más allá de ONNX Runtime).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües, de código, matemáticas, visión general o audio; su dominio es exclusivamente el rostro humano.

## Casos de uso

- Edición de expresión en apps móviles de fotografía: el pipeline ONNX se ejecuta en CPU de teléfono con ONNX Runtime, de modo que la app puede ofrecer sonrisas, parpadeos o gestos sobre un selfi sin enviar la imagen a un servidor.
- Animación de avatares para VTubing o videollamada: usar el extractor de movimiento sobre la cámara del usuario y el generador para renderizar un avatar o un retrato fijo, con la ventaja de que el coste de cómputo se mantiene en el dispositivo.
- Reenactment para doblaje y localización de vídeo: transferir la mímica de un actor a un retrato para generar versiones dobladas manteniendo la expresividad, aprovechando que el modelo separa apariencia y movimiento.
- Prototipado de pipelines ONNX en edge: validar cadenas de cuatro modelos ONNX encadenados en dispositivos Snapdragon (etiqueta del repo) antes de invertir en optimizaciones específicas de NPU.
- Generación de contenido para redes sociales y marketing: producir variaciones de expresión de un retrato aprobado por el retratado para campañas, con revisión humana previa a publicación.
- Pruebas de privacidad on-device: escenario en el que el procesado biométrico debe permanecer local por requisitos de RGPD, ya que el modelo no necesita conectividad.
- Integración en aplicaciones de mensajería como filtro o reacción animada, siempre que la latencia del pipeline completo sobre CPU resulte aceptable (no hay cifras publicadas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de reconstrucción, identidad, latencia ni throughput, y el repositorio no referencia ningún paper o evaluación asociada a esta conversión concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia de orden de magnitud, el repositorio completo ocupa 0,5 GB, por lo que los pesos en fp32 caben holgadamente en cualquier GPU consumer actual; el pico de memoria real depende de la resolución de trabajo y del número de fotogramas, datos no publicados.
- GPU recomendadas: no disponibles. El caso de uso declarado es CPU de móvil con ONNX Runtime, no GPU.
- Cabe en GPU consumer: sí con alta probabilidad, dado el tamaño del repo, aunque no hay requisitos oficiales publicados.
- Opciones de despliegue: ONNX Runtime (incluida la variante móvil) es la vía documentada. Las etiquetas `gguf` y `stable-diffusion.cpp` del repo sugieren otros entornos previstos, pero no se incluyen ficheros en esos formatos. TensorRT solo sería aplicable con la variante `-fix` del generador, que este repositorio explícitamente no incluye.
- Latencia y throughput estimados: no disponibles. La model card solo afirma que la inferencia se ejecuta en CPU de teléfono, sin cifras.

## Comparativa con modelos similares

| Modelo | Formato de pesos | Licencia | Enfoque de despliegue | Disponibilidad |
|---|---|---|---|---|
| matrixportalx/LivePortrait-onnx (este repo) | ONNX | MIT | ONNX Runtime en CPU de móvil | espejo, 0 descargas y 0 likes |
| warmshao/FasterLivePortrait | ONNX y variantes TensorRT | MIT segun la model card | ONNX Runtime y TensorRT | repositorio de origen de la conversion (revision `eb937f4bec71`) |
| LivePortrait (Kuaishou/KlingTeam) | PyTorch | MIT segun la model card | CUDA/GPU | proyecto original, no enlazado en la model card |
| Variante `warping_spade-fix` con plugin TensorRT de GridSample | no disponible | no disponible | TensorRT | no incluida en este repositorio |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Es un espejo, no un proyecto mantenido: no hay garantía de actualizaciones, versionado ni soporte, y su función declarada es servir de respaldo a dos aplicaciones concretas.
- Sin validación comunitaria: 0 descargas y 0 likes, sin issues ni discusiones que permitan contrastar el comportamiento real de los ficheros.
- Metadatos incompletos: no consta pipeline, no consta idioma, y las etiquetas `gguf` y `stable-diffusion.cpp` no se corresponden con los ficheros listados, lo que puede inducir a error al buscar artefactos.
- Sin documentación de precisión ni opset: la compatibilidad con versiones concretas de ONNX Runtime no está garantizada.
- El generador no es la variante `-fix`, por lo que no funcionará con el plugin TensorRT de GridSample; quien necesite esa ruta debe acudir al repositorio de origen.
- Riesgo alto de uso indebido: la tecnología de reenactment facial permite suplantación visual y deepfakes; requiere consentimiento explícito del retratado y trazabilidad en producción.
- Datos biométricos: el tratamiento de rostros entra en el ámbito del RGPD; el procesado local ayuda, pero no exime de base jurídica ni de evaluación de impacto.
- No apto para tareas de lenguaje, razonamiento, código o agentes; cualquier expectativa en ese sentido es un error de categoría.
- Licencia MIT para estos ficheros, pero conviene verificar los términos del proyecto LivePortrait original antes de un uso comercial a gran escala.
- Sin métricas de calidad: no hay forma de estimar de antemano el error de identidad o los artefactos en perfiles extremos, gafas, barba densa u oclusiones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/matrixportalx/LivePortrait-onnx
- Origen de la conversión (warmshao/FasterLivePortrait): https://huggingface.co/warmshao/FasterLivePortrait
- Perfil del autor: https://huggingface.co/matrixportalx
- Proyecto original LivePortrait (Kuaishou/KlingTeam): https://github.com/KwaiVGI/LivePortrait (no enlazado en la model card; referencia del proyecto del que proceden los pesos)
- Página del proyecto original: https://liveportrait.github.io (no enlazada en la model card)
