# Aarun-1/defect-detector-neu-det

## Resumen

`Aarun-1/defect-detector-neu-det` es un detector de objetos basado en Ultralytics YOLOv8s (11 millones de parametros) afinado desde los pesos preentrenados en COCO (`yolov8s.pt`) para la inspeccion de superficies de acero laminado en caliente. Detecta y clasifica seis tipos de defecto: `crazing`, `inclusion`, `patches`, `pitted_surface`, `rolled-in_scale` y `scratches`. El autor lo publica explicitamente como proyecto de portfolio sobre el dataset publico de investigacion NEU-DET (Northeastern University), sin validacion sobre datos reales de produccion.

El modelo se entrena sobre NEU-DET, un conjunto de 1.800 imagenes en escala de grises de 200x200 pixeles (300 por clase) con cajas en formato Pascal VOC, redimensionadas a 640x640 para la inferencia. La relevancia de esta ficha no esta en el rendimiento bruto (mAP50 de 0,755 en validacion), sino en que documenta un pipeline completo de inspeccion industrial: politica de decision basada en costes, monitorizacion, alertas de deriva y una compuerta de promocion de modelos. Es un ejemplo metodologico mas que un artefacto listo para produccion.

La publicacion incluye analisis de robustez frente a corrupciones sinteticas (desenfoque, ruido, compresion JPEG, contraste y brillo) y un analisis de errores por clase que identifica `crazing` y `rolled-in_scale` como las clases debiles. La licencia es AGPL-3.0, heredada de Ultralytics, y la del dataset de entrenamiento es incierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLOv8s (detector de una etapa, CNN) |
| Parametros totales | 11 millones (aproximado, segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (vision por computador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (tarea de vision; etiquetas de clase en ingles) |
| Licencia | AGPL-3.0 (heredada de Ultralytics YOLOv8 y sus pesos preentrenados) |
| Formato de pesos | `best.pt` (PyTorch/Ultralytics), SHA-256 `dff41d9a7f7be82791563f74990d04ffe12545767f6c8bd4c62d1100fcece56b` |
| Entrada | Imagen de 640x640 (escala de grises en origen, 200x200) |
| Clases | 6: crazing, inclusion, patches, pitted_surface, rolled-in_scale, scratches |
| Tarea | Object detection (pipeline `object-detection`) |
| Libreria | `ultralytics` |
| Tamano del repo | 0,0 GB (reportado por Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

YOLOv8s es un detector de una etapa con backbone CSPDarknet, cuello PAN-FPN y cabeza desacoplada (anchor-free) con asignacion dinamica de etiquetas. El modelo parte de pesos preentrenados en COCO (`yolov8s.pt`) y se afina sobre NEU-DET con 50 epocas, `imgsz` 640, batch 16, semilla 42, paciencia de early stopping 15, `lr0` 0,001, `lrf` 0,01 y optimizador `auto`, en una unica ejecucion sobre GPU de Kaggle (config `configs/baseline.yaml`, experimento E0). Solo se entreno una semilla; no se midio varianza entre semillas.

Los datos se dividen de forma estratificada por clase con semilla 42: la particion de entrenamiento original (1.440 imagenes) se reparte 85/15 en train 1.224 (204 por clase) y val 216 (36 por clase), mientras que la particion de validacion original (360 imagenes, 60 por clase) se reserva como test. Existe un par duplicado exacto (`patches_101`, `patches_105`) que queda integramente en train. En la fase 2b se probaron tres alternativas (E1 `imgsz` 320, E2 YOLOv8m, E3 aumento de datos agresivo) y ninguna supero claramente a E0 (mAP50 de 0,758, 0,740 y 0,726 frente a 0,755); la compuerta de promocion rechaza las tres. No se documentan técnicas de RLHF ni decodificacion especulativa, por tratarse de un modelo de vision.

## Capacidades

- Deteccion y clasificacion de seis tipos de defecto superficial en imagenes de acero laminado en caliente, en una sola pasada.
- Salida de cajas delimitadoras con puntuacion de confianza por deteccion, compatible con el ecosistema Ultralytics (`.pt` cargable con `YOLO()`).
- Inferencia servida mediante una API FastAPI (`app/`) y una demo Gradio (`space/`, no alojada actualmente), ambas aplicando una politica de decision congelada.
- Capa de decision basada en costes: cada deteccion se mapea a una accion segun un modelo explicito de costes (fallo 10, falsa alarma 1, revision humana 0,3, con pesos por clase de 1,0).
- Soporte de monitorizacion y alertas de deriva descrito en el pipeline del proyecto.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingues: es exclusivamente un detector de objetos.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la deteccion en imagen.

## Casos de uso

- **Plantilla docente de pipeline de inspeccion completo:** sirve para ensenar el ciclo entero (deteccion, politica de accion basada en costes, monitorizacion, alertas de deriva y compuerta de promocion). El autor lo plantea explicitamente como ejemplo trabajado y material de discusion.
- **Prototipado de inspeccion de superficies en laboratorio:** permite experimentar con deteccion de defectos sobre imagenes controladas de NEU-DET o similares antes de invertir en un dataset propio. Es adecuado porque el modelo ya distingue las seis clases tipicas del dominio siderurgico.
- **Punto de partida para fine-tuning con datos propios:** al ser un `best.pt` de Ultralytics, se puede recargar y reentrenar con un dataset industrial real, sustituyendo la limitacion de licencia incierta del dataset original por un corpus con trazabilidad legal.
- **Evaluacion de robustez como referencia metodologica:** el analisis de corrupciones sinteticas (desenfoque, ruido, JPEG, contraste, brillo) sirve de plantilla para disenar pruebas de robustez en otros proyectos de vision industrial.
- **Banco de pruebas de politicas de decision:** la comparacion entre politica por clase y umbral global ajustado (coste 3052,7 frente a 3041,9) ejemplifica como evaluar el impacto economico de la capa de decision, reutilizable en otros dominios de inspeccion.
- **Integracion en una API de inferencia:** el servicio FastAPI incluido permite desplegar el detector como endpoint HTTP para demostraciones o entornos de staging, aunque no para decisiones de produccion.
- **Analisis de errores por clase:** el desglose de AP por clase y por umbral de IoU (por ejemplo, `crazing` sube de 0,425 a IoU 0,5 a 0,688 a IoU 0,3) es un caso practico para estudiar la ambiguedad de etiquetado en defectos de textura difusa.

## Benchmarks y rendimiento

Resultados sobre el split de validacion (216 imagenes), segun la model card:

| Metrica | conf 0,001 (mAP estandar) | conf 0,25 (punto de operacion) |
|---|---|---|
| mAP50 | 0,755 | 0,668 |
| mAP50-95 | 0,430 | no aplica |
| Precision | 0,725 | 0,690 |
| Recall | 0,713 | 0,733 |

AP50 por clase (fase 2a, validador de Ultralytics) y fase 4 (codigo propio sobre detecciones cacheadas):

| Clase | AP50 (fase 2a) | AP30 (fase 4) | AP50 (fase 4) | AP75 (fase 4) |
|---|---|---|---|---|
| scratches | 0,952 | 0,980 | 0,969 | 0,436 |
| patches | 0,877 | 0,925 | 0,856 | 0,565 |
| pitted_surface | 0,845 | 0,915 | 0,870 | 0,513 |
| inclusion | 0,813 | 0,892 | 0,780 | 0,381 |
| rolled-in_scale | 0,622 | 0,855 | 0,659 | 0,309 |
| crazing | 0,419 | 0,688 | 0,425 | 0,037 |

Variantes probadas en fase 2b (mAP50 frente a 0,755 de E0):

| Experimento | Configuracion | mAP50 |
|---|---|---|
| E0 | baseline YOLOv8s | 0,755 |
| E1 | `imgsz` 320 | 0,758 |
| E2 | YOLOv8m | 0,740 |
| E3 | aumento de datos agresivo | 0,726 |

Robustez (cambio de mAP50 sobre 0,760 limpio, IC bootstrap del 95 % sobre imagenes):

| Perturbacion | Suave | Media | Fuerte |
|---|---|---|---|
| Desenfoque (sigma 1/2/3 px) | -0,24 [-0,27, -0,19] | -0,43 | -0,53 |
| Ruido (sigma 0,02/0,05/0,1) | -0,20 [-0,25, -0,15] | -0,55 | -0,73 |
| JPEG (calidad 50/20) | -0,12 [-0,15, -0,09] | -0,36 | no aplica |
| Contraste (x0,6 / x1,4) | -0,04 [-0,07, -0,02] | -0,03 | no aplica |
| Brillo (x0,6/0,8/1,2/1,4) | -0,006 [-0,02, +0,01] | -0,002 | -0,014 / -0,010 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa de un YOLOv8s a 640x640, la huella es pequena (tipicamente por debajo de 2 GB en FP32), pero este dato no lo proporciona la informacion disponible.
- GPU recomendadas: no disponibles en la model card. El entrenamiento se hizo en una unica GPU de Kaggle y la inferencia puede ejecutarse en CPU o GPU consumer, si bien el autor no especifica requisitos.
- Cabe en GPU consumer: no confirmado en la informacion proporcionada.
- Opciones de despliegue: la model card menciona un servicio FastAPI (`app/`) y una demo Gradio (`space/`, no alojada). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card compara internamente con variantes de la misma familia YOLOv8 (E1, E2, E3) y con un umbral global ajustado, pero no con otros detectores externos. No se dispone de datos de terceros en la informacion proporcionada.

| Modelo | Parametros | Entrada | mAP50 (NEU-DET val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv8s E0 (este modelo) | 11 M | 640x640 | 0,755 | AGPL-3.0 | Hugging Face |
| YOLOv8s E1 | 11 M | 320x320 | 0,758 | AGPL-3.0 | interno (no publicado) |
| YOLOv8m E2 | no disponible | 640x640 | 0,740 | AGPL-3.0 | interno (no publicado) |
| YOLOv8s E3 (aumento agresivo) | 11 M | 640x640 | 0,726 | AGPL-3.0 | interno (no publicado) |

## Limitaciones y advertencias

- **Nunca validado en produccion:** el autor lo declara explicitamente. El modelo no ha visto una imagen real de produccion, una pieza sana ni una camara distinta a la del dataset. No debe usarse para decidir si detener una linea, liberar o rechazar acero, ni para ninguna decision de seguridad o economica.
- **Clases debiles:** `crazing` (AP50 0,425) y `rolled-in_scale` (0,622) rinden muy por debajo del resto. El analisis de errores atribuye el problema de `crazing` principalmente a localizacion, no a deteccion: a umbral operativo, 37 de 41 cajas no verdaderas positivas (90 %) se encontraron pero mal localizadas (IoU entre 0,15 y 0,50), y solo 4 se perdieron. La explicacion de ambiguedad de etiquetado no se ha comprobado.
- **Licencia del dataset incierta:** la ficha de Kaggle de NEU-DET indica "Unknown". Los pesos se entrenaron sobre esos datos; si se necesita una cadena de licencia clara para produccion, este modelo no la ofrece.
- **Licencia AGPL-3.0:** restringe el uso comercial en determinados escenarios de distribucion o servicio en red; revisar con asesoria legal antes de integrarlo en un producto.
- **Robustez limitada:** fragilidad alta a desenfoque (-0,53 de mAP50 en severidad fuerte), ruido (-0,73) y compresion JPEG (-0,36 a calidad 20). Robusto al brillo y poco afectado por contraste. Son corrupciones sinteticas, no cambios reales de camara o proceso.
- **Validacion pequena:** 36 imagenes por clase en val, por lo que diferencias pequenas de metrica son ruido. Una sola semilla de entrenamiento; no se midio varianza.
- **Hipotesis no soportada:** la hipotesis preregistrada de que una politica de revision por clase supera a un umbral global ajustado no se confirmo (ahorro de -0,4 %, IC 95 % de -7,8 % a +6,2 %).
- **Riesgo de alucinacion:** no aplica en el sentido de generacion de texto, pero si en falsos positivos y deslocalizaciones, especialmente en las clases debiles.
- **Idioma y contexto:** no aplica; es un detector de vision sin capacidades linguisticas ni ventana de contexto.

## Enlaces

- Hugging Face: https://huggingface.co/Aarun-1/defect-detector-neu-det
- Ultralytics YOLOv8 (documentacion y pesos base): https://github.com/ultralytics/ultralytics
- Dataset NEU-DET (listado de Kaggle, licencia "Unknown"): no disponible la URL exacta en la informacion proporcionada
- Paper de NEU-DET (Song y Yan, Northeastern University): no disponible la URL exacta en la informacion proporcionada
- Demo Gradio (`space/`): no alojada actualmente, sin URL publica
