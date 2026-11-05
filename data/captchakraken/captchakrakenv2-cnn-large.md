# CaptchaKraken/CaptchaKrakenV2-CNN-large

## Resumen

CaptchaKrakenV2-CNN-large es un detector de elementos interactivos de captchas basado en Mask R-CNN con backbone ResNet-18. Lo desarrolla CaptchaKraken como parte de la familia V2 de detectores de su pipeline de resolucion de captchas, y su funcion es localizar sobre la imagen del tablero los elementos con los que debe interactuar un modelo posterior: rejillas, celdas, elementos arrastrables, zonas de destino, sliders, campos de texto, botones y areas de clic. El repositorio incluye tanto el checkpoint de entrenamiento (`detector_r18.pt`) como el modelo exportado a ONNX (`detector.onnx`) que ejecuta el cliente sobre CPU mediante onnxruntime.

El modelo se entrena exclusivamente con tableros generados de forma sintetica: 44.565 tableros procedentes de 149 generadores distintos para el checkpoint de 10 clases, y 46.065 tableros para la exportacion ONNX de 11 clases, que anade la clase `checkbox` aprendida de capturas reales de widgets de reCAPTCHA, hCaptcha, Turnstile, CaptchaFox y GeeTest v4. No es un modelo de lenguaje ni un transformer generativo: es un detector de objetos de vision por computador con salida de cajas, etiquetas, puntuaciones y mascaras de instancia.

Su relevancia es acotada pero concreta: dentro del ecosistema CaptchaKraken actua como etapa de percepcion que alimenta a los modelos puntero de la familia V2 (SunlightV2-0.8B, TwilightV2-2B y MidnightV2-4B), que leen las marcas numeradas que este detector dibuja sobre el tablero. El autor lo etiqueta explicitamente como "test build, not yet promoted to serving", es decir, una compilacion de pruebas aun no promovida a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask R-CNN con backbone ResNet-18 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (exportacion ONNX en float, opset 17) |
| Idiomas soportados | no disponible (la clase `checkbox` se entreno con un idioma retenido en el conjunto de validacion) |
| Licencia | LGPL-3.0 |
| Formato de pesos | ONNX (`detector.onnx`, opset 17) y checkpoint PyTorch (`detector_r18.pt`) |
| Clases detectadas | `grid, cell, item, draggable, drop_target, slider, text_input, button, click_area, fill` (checkpoint) y `checkbox` adicional (ONNX) |
| Entrada ONNX | tensor `image`, float (3, H, W) en rango 0-1 |
| Salidas ONNX | boxes, labels, scores, masks; nombres de clase en metadatos `classes` |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es Mask R-CNN, un detector de instancias que extiende Faster R-CNN con una rama de segmentacion de mascaras, usando ResNet-18 como backbone. El checkpoint se serializa como un diccionario con las claves `state_dict`, `classes`, `min_size` y `max_size`, y se carga mediante `src/detector.py`. La exportacion ONNX mantiene la misma red con una clase adicional (`checkbox`) y se ejecuta sobre los kernels de CPU de onnxruntime, lo que indica que el diseno prioriza inferencia en CPU sin GPU.

El entrenamiento es puramente sintetico y controlado: 12 epocas sobre 44.565 tableros generados por 149 generadores para el checkpoint de 10 clases, y 6 epocas sobre 46.065 tableros (los 149 generadores mas widgets de checkbox) para la exportacion ONNX. La validacion se realiza sobre conjuntos retenidos de tableros generados (4.456 y 4.606 tableros respectivamente). Para la clase `checkbox` se incorporaron capturas reales de widgets de cinco proveedores comerciales fotografiados en todos sus temas, tamanos, idiomas y ratios de pixel, reteniendo un idioma completo para validacion. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no es un modelo generativo.

## Capacidades

- Deteccion de instancias con mascaras sobre imagenes de tableros de captcha, con 10 clases en el checkpoint y 11 en la exportacion ONNX.
- Localizacion de rejillas (`grid`) y celdas (`cell`), con precision practicamente perfecta en validacion (AP 0.999 y 0.955 respectivamente en el modelo ONNX).
- Deteccion de elementos de interaccion variados: `item`, `draggable`, `drop_target`, `slider`, `text_input`, `button`, `click_area` y `fill`.
- Deteccion de la casilla de verificacion (`checkbox`) de widgets de reCAPTCHA, hCaptcha, Turnstile, CaptchaFox y GeeTest v4.
- Inferencia en CPU mediante onnxruntime, sin necesidad de GPU.
- Salida estructurada (cajas, etiquetas, puntuaciones y mascaras) apta para consumo programatico por un cliente.
- Integracion como etapa de percepcion previa a los modelos puntero de la familia V2, que leen las marcas numeradas dibujadas sobre el tablero.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un detector visual.

## Casos de uso

- Resolucion automatizada de captchas de rejilla: el detector localiza la rejilla y sus celdas, y el cliente puede contar y numerar las celdas exactas; en validacion con capturas reales, 252 de 252 tableros de rejilla de reCAPTCHA y hCaptcha se leyeron con el numero exacto de celdas y 0 de 1095 tableros de otro tipo se interpretaron erroneamente como rejilla.
- Deteccion de casillas de verificacion en formularios con widgets de terceros: la clase `checkbox` permite localizar la casilla en widgets de cinco proveedores distintos, con 96 de 96 casillas retenidas encontradas en validacion.
- Segmentacion de elementos arrastrables y zonas de destino: util para captchas de tipo puzzle o slider, donde el modelo identifica la pieza (`draggable`) y la zona donde debe soltarse (`drop_target`).
- Etapa de percepcion en pipelines de agentes de navegacion web: el detector puede alimentar un modulo que decida sobre que elemento de la pagina interactuar, dado que distingue botones, campos de texto y areas de clic.
- Automatizacion de pruebas de QA sobre flujos con captcha: permite verificar de forma programatica que un formulario renderiza correctamente sus widgets y sus casillas de verificacion en distintos temas, tamanos e idiomas.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse sobre onnxruntime en CPU, encaja en entornos de un solo nucleo o pocos nucleos virtuales, donde la variante lite (MobileNetV3) cubre el caso de uno o dos vCPU.
- Generacion de datos anotados para entrenar otros detectores: las mascaras y cajas predichas sobre tableros sinteticos pueden servir como pseudoetiquetas en un pipeline de destilacion.

## Benchmarks y rendimiento

| Conjunto | Metrica | Resultado |
|---|---|---|
| Checkpoint `detector_r18.pt`, validacion (4.456 tableros) | mask mAP@0.5 | 0.917 |
| Checkpoint `detector_r18.pt`, validacion (4.456 tableros) | box mAP@0.5 | 0.922 |
| Checkpoint `detector_r18.pt`, clase `fill` | mask AP50 | 0.317 |
| `detector.onnx`, validacion (4.606 tableros) | mask mAP@0.5 | 0.919 |
| `detector.onnx`, validacion (4.606 tableros) | box mAP@0.5 | 0.922 |
| `detector.onnx`, clase `checkbox` | mask AP50 / AP | 1.000 / 0.936 |
| `detector.onnx`, clase `grid` | AP | 0.999 |
| `detector.onnx`, clase `cell` | AP | 0.955 |
| `detector.onnx`, capturas reales de rejilla (reCAPTCHA/hCaptcha) | tableros leidos con numero exacto de celdas | 252/252 |
| `detector.onnx`, capturas reales de otro tipo | tableros leidos erroneamente como rejilla | 0/1095 |
| `detector.onnx`, casillas de verificacion retenidas | casillas encontradas | 96/96 |

Los numeros por clase completos estan en `detector_r18.metrics.json` y `detector.onnx.metrics.json`. No se han publicado comparaciones con modelos externos.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ejecutarse con onnxruntime sobre kernels de CPU, sin requisito de GPU.
- VRAM estimada: no aplica en el despliegue ONNX documentado; para el checkpoint PyTorch en GPU no se proporcionan cifras.
- GPU recomendadas: no disponible; el autor no documenta despliegue en GPU. Cualquier GPU consumer con suficiente memoria para un ResNet-18 Mask R-CNN seria en principio viable, pero no hay datos publicados.
- Cabe en consumer GPU: si, en principio, dado el tamano reducido del backbone (ResNet-18) y un repo de 0,3 GB, aunque el autor no lo especifica.
- Opciones de despliegue: onnxruntime (CPU) para `detector.onnx`, con el cliente `captchakraken`; PyTorch para cargar `detector_r18.pt` mediante `src/detector.py`. Para entornos de uno o dos vCPU existe la variante lite con MobileNetV3-Large.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| CaptchaKrakenV2-CNN-large | Mask R-CNN + ResNet-18 | 10 (checkpoint) / 11 (ONNX) | ONNX, PyTorch | LGPL-3.0 | Test build, no promovido a serving |
| CaptchaKrakenV2-CNN-lite | MobileNetV3-Large | no disponible | ONNX (`detector-lite.onnx`) | LGPL-3.0 | Orientado a uno o dos vCPU |
| SunlightV2-0.8B | no disponible (modelo puntero) | no aplica | no disponible | no disponible | Parte de la familia V2 |
| TwilightV2-2B | no disponible (modelo puntero) | no aplica | no disponible | no disponible | Parte de la familia V2 |
| MidnightV2-4B | no disponible (modelo puntero) | no aplica | no disponible | no disponible | Parte de la familia V2 |

No se dispone de datos de benchmarks de los modelos puntero ni de detectores externos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El autor lo marca como "test build, not yet promoted to serving": no debe considerarse un artefacto de produccion estable.
- La clase `fill` es debil en el checkpoint, con mask AP50 de 0.317, muy por debajo del resto de clases; las predicciones sobre esa clase deben tratarse con cautela.
- El entrenamiento es mayoritariamente sintetico (tableros generados por 149 generadores); el rendimiento sobre captchas reales fuera de las familias evaluadas (rejillas de reCAPTCHA/hCaptcha y widgets de cinco proveedores) no esta documentado.
- La validacion de la clase `checkbox` se hizo reteniendo un idioma completo, pero no se detalla el resto de la cobertura linguistica ni de temas.
- Riesgo de alucinacion en sentido estricto no aplica (no es generativo), pero si existe riesgo de falsos positivos de deteccion; los datos publicados indican 0 de 1095 tableros no rejilla clasificados erroneamente como rejilla, aunque la muestra es limitada.
- Licencia LGPL-3.0: permite uso comercial, pero impone obligaciones de copyleft sobre la biblioteca modificada y requisitos de enlace dinamico; conviene revisar el cumplimiento antes de integrarlo en productos propietarios.
- No se documentan sesgos, idiomas soportados ni limitaciones de contexto (no aplica contexto).
- El uso del modelo para resolver captchas puede contravenir los terminos de servicio de los proveedores afectados y la legislacion aplicable en materia de acceso no autorizado a sistemas; es responsabilidad del usuario evaluar la legalidad del caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Variante lite: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-lite
- Modelo puntero SunlightV2-0.8B: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Modelo puntero TwilightV2-2B: https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Modelo puntero MidnightV2-4B: https://huggingface.co/CaptchaKraken/MidnightV2-4B
