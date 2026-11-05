# CaptchaKraken/CaptchaKrakenV2-CNN-lite

## Resumen

CaptchaKrakenV2-CNN-lite es un detector de elementos de captcha desarrollado por CaptchaKraken, publicado bajo licencia LGPL-3.0. Se trata de un modelo de segmentacion de instancias basado en Mask R-CNN con backbone MobileNetV3-Large y FPN de 128 canales, disenado especificamente para ejecutarse en CPU con uno o dos vCPUs. Su funcion es localizar los elementos interactivos de un tablero de captcha (rejillas, celdas, elementos arrastrables, destinos de soltado, deslizadores, campos de texto, botones, areas de clic, rellenos y casillas de verificacion), es decir, 11 clases en total.

El modelo forma parte de la familia CaptchaKraken V2, en la que los detectores CNN localizan los elementos del tablero y dibujan las marcas numeradas que leen los modelos punteros de la misma familia (SunlightV2-0.8B, TwilightV2-2B y MidnightV2-4B). La variante "lite" es la hermana ligera del detector estandar `detector.onnx` incluido en CaptchaKrakenV2-CNN-large, y sacrifica parte de la precision del detector completo a cambio de una latencia mucho menor en hardware modesto: entre 80 y 107 ms por tablero en un solo nucleo, frente a los 520-606 ms del detector estandar.

Es relevante para desarrolladores que necesitan automatizar la resolucion de captchas en entornos con recursos limitados, como contenedores sin GPU o servicios de bajo coste, donde el detector completo resulta demasiado lento. El modelo se distribuye como un unico fichero ONNX con una interfaz identica a la del detector estandar, lo que permite intercambiarlos mediante configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask R-CNN con backbone MobileNetV3-Large y FPN de 128 canales (GroupNorm, cabeza de cajas de 1024) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX, opset 17) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | LGPL-3.0 |
| Formato de pesos | ONNX (`detector-lite.onnx`) |

## Arquitectura y entrenamiento

El modelo es un detector de instancias Mask R-CNN cuya red troncal es MobileNetV3-Large con una FPN de 128 canales, normalizacion GroupNorm y una cabeza de cajas de 1024 dimensiones. Detecta 11 clases de elementos de captcha: `grid`, `cell`, `item`, `draggable`, `drop_target`, `slider`, `text_input`, `button`, `click_area`, `fill` y `checkbox`. La interfaz ONNX (opset 17) recibe una imagen de entrada `image` en formato float (3, H, W) con valores en 0-1 y devuelve cajas, etiquetas, puntuaciones y mascaras; los nombres de las clases se encuentran en los metadatos del modelo bajo la clave `classes`, y el metadato `arch` vale `lite`.

El entrenamiento se realizo el 1 de noviembre de 2026 partiendo de pesos de ImageNet: primero 17.274 pasos sobre los 46.065 tableros generados (149 generadores mas widgets de casilla de verificacion) que se usaron para entrenar `detector.onnx` en CaptchaKrakenV2-CNN-large, con lado corto entre 384 y 512 pixeles; despues, 4.000 pasos sobre los mismos tableros dibujando los widgets de casilla de verificacion de un proveedor cada vez. Los ajustes de ambas ejecuciones y las metricas por clase estan en el fichero `detector-lite.onnx.metrics.json`. No se menciona el uso de RLHF ni DPO, algo esperable en un modelo de vision.

## Capacidades

- Deteccion y segmentacion de instancias de 11 clases de elementos interactivos en tableros de captcha.
- Generacion de mascaras por instancia, ademas de cajas delimitadoras, etiquetas y puntuaciones de confianza.
- Compatibilidad de interfaz con `detector.onnx` de CaptchaKrakenV2-CNN-large: mismas entradas, salidas y metadatos.
- Ejecucion en CPU con uno o dos vCPUs, con latencias de 80-107 ms por tablero en un solo nucleo.
- Seleccion automatica mediante configuracion: `detector: "lite"` en `captchakraken.config.json`, o bajo el modo `auto` en maquinas con dos CPUs utilizables o menos.
- Integracion con los modelos punteros de la familia V2 (SunlightV2-0.8B, TwilightV2-2B, MidnightV2-4B), que leen las marcas numeradas que dibuja el detector.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision para deteccion de elementos.

## Casos de uso

- Automatizacion de captchas en contenedores sin GPU: el modelo se ejecuta en uno o dos vCPUs con 80-107 ms por tablero, lo que permite integrarlo en servicios de bajo coste donde el detector completo (520-606 ms) resultaria prohibitivo.
- Pipeline completo de resolucion de captchas: combinado con los modelos punteros V2, el detector localiza los elementos del tablero y dibuja las marcas numeradas que el puntero interpreta para decidir la accion, formando un sistema de dos etapas.
- Procesamiento por lotes en servidores modestos: al requerir solo CPU, se pueden ejecutar varias instancias en paralelo en una maquina sin GPU para procesar volumenes moderados de tableros.
- Despliegue en el borde o en entornos embebidos: el formato ONNX y el backbone MobileNetV3 permiten ejecutarlo con ONNX Runtime en dispositivos con recursos limitados.
- Clasificacion de tableros por tipo: la deteccion de clases como `grid`, `slider` o `text_input` permite enrutar cada captcha al flujo de resolucion adecuado antes de invocar el modelo puntero.
- Deteccion de widgets de casilla de verificacion: el modelo fue entrenado especificamente para reconocer casillas de distintos proveedores (132 de 132 casillas encontradas en capturas reales), lo que lo hace util para flujos que requieren marcar o dejar intactos widgets de verificacion.
- Sustitucion del detector estandar en produccion: al compartir interfaz ONNX, se puede cambiar `detector.onnx` por `detector-lite.onnx` sin modificar el codigo de integracion, simplemente ajustando la configuracion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| mask mAP@0.5 (validacion, 4.606 tableros) | 0,926 |
| box mAP@0.5 (validacion) | 0,930 |
| `checkbox` mask AP50 | 1,000 |
| `draggable` mask AP50 | 1,000 |
| `grid` mask AP50 | 1,000 |
| `cell` mask AP50 | 0,970 |
| Latencia por tablero (1 nucleo) | 80-107 ms |
| Latencia por tablero, detector estandar (referencia) | 520-606 ms |
| Capturas reales (reCAPTCHA, hCaptcha, Prosopo, GeeTest) | leidas igual que con `detector.onnx` |
| Casillas de verificacion en capturas reales | 132/132 encontradas; 42/42 marcadas dejadas intactas |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no se menciona soporte de GPU.
- VRAM estimada: no aplica (modelo para CPU).
- Entorno objetivo: uno o dos vCPUs.
- Latencia: 80-107 ms por tablero en un solo nucleo.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU.
- Cabe en GPU consumer: no aplica (no es su caso de uso).
- Opciones de despliegue: ONNX Runtime (formato ONNX, opset 17); integracion mediante el cliente CaptchaKraken con `detector: "lite"` o modo `auto`.
- Throughput estimado: no disponible mas alla de la latencia por tablero indicada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Latencia por tablero | Licencia | Formato |
|---|---|---|---|---|---|
| CaptchaKrakenV2-CNN-lite | Mask R-CNN + MobileNetV3-Large FPN | 11 | 80-107 ms (1 nucleo) | LGPL-3.0 | ONNX |
| CaptchaKrakenV2-CNN-large (`detector.onnx`) | Mask R-CNN + ResNet-18 | 11 | 520-606 ms | LGPL-3.0 | ONNX |
| CaptchaKrakenV2-CNN-large (`detector_r18.pt`) | Mask R-CNN + ResNet-18 (checkpoint de entrenamiento) | 11 | no disponible | LGPL-3.0 | PyTorch |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de informacion sobre detectores de captcha alternativos en la documentacion proporcionada.

## Limitaciones y advertencias

- Una caja que ocupa toda la imagen no se detecta; es el caso de la barra "click to verify" de GeeTest v4, que el cliente resuelve mediante su selector DOM y nunca consulta al detector.
- El modelo solo detecta elementos de tableros de captcha; no interpreta texto, no resuelve el captcha por si mismo y no tiene capacidades de lenguaje.
- La precision en validacion (mask mAP@0.5 de 0,926) es ligeramente inferior a la del detector estandar, aunque en capturas reales se comporta igual segun el autor.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion (no aplica en el sentido habitual) ni limitaciones de idioma, al ser un modelo de vision.
- La licencia LGPL-3.0 impone obligaciones de copyleft debil: si se modifica o se enlaza el modelo en una obra derivada, deben cumplirse las condiciones de la LGPL para la parte cubierta.
- El uso de herramientas para resolver captchas puede contravenir los terminos de servicio de los sitios web y la legislacion aplicable en materia de acceso no autorizado a sistemas; conviene evaluar el contexto legal antes de usarlo en produccion.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-lite
- Detector estandar de la familia: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Modelo puntero SunlightV2-0.8B: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Modelo puntero TwilightV2-2B: https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Modelo puntero MidnightV2-4B: https://huggingface.co/CaptchaKraken/MidnightV2-4B
