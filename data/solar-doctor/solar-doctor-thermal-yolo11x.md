# solar-doctor/solar-doctor-thermal-yolo11x

## Resumen

SolarDoctor thermal YOLO11x es un detector de objetos basado en la arquitectura YOLO11x de Ultralytics, especializado en la deteccion de anomalias en instalaciones fotovoltaicas a partir de imagenes termicas infrarrojas. Lo publica en Hugging Face el proyecto SolarDoctor, pero el checkpoint es un artefacto upstream sin modificar: fue entrenado por AxalonSystems y redistribuido tal cual, con hash SHA-256 verificado.

El modelo resuelve un problema concreto del mantenimiento de plantas solares: identificar visualmente defectos como puntos calientes, suciedad, sombreado por vegetacion, diodos de bypass defectuosos o modulos fuera de servicio. Detecta 11 clases (cell, cell-multi, module, string, bypass-diode, offline-module, vegetation-shading, soiling, short-circuit, hot-spot-low, hot-spot-high) sobre imagenes de camara termica.

Es relevante por su caracter abierto y por la trazabilidad de su procedencia, aunque su utilidad en produccion queda condicionada por la licencia AGPL-3.0 heredada de Ultralytics y por la ausencia de una evaluacion independiente de precision. El checkpoint tiene 114.395.865 bytes y fue entrenado con Ultralytics 8.4.84 durante 150 epocas a 640 px.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11x (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible (checkpoint de 114.395.865 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (`best.pt`), libreria `ultralytics` |

## Arquitectura y entrenamiento

Se trata de un detector YOLO11x, la variante de mayor capacidad de la familia YOLO11 de Ultralytics. Es una red convolucional de una etapa orientada a deteccion de objetos en tiempo real, sin componente generativo ni mecanismos de atencion a nivel de lenguaje. El pipeline declarado es `object-detection` y el checkpoint se carga mediante la libreria `ultralytics`.

El entrenamiento lo realizo upstream AxalonSystems con Ultralytics 8.4.84, variante `yolo11x`, durante 150 epocas a una resolucion de 640 px, con checkpoint fechado el 2026-07-02 segun los metadatos. No se documenta en la informacion disponible el volumen del dataset, su composicion, el origen de las imagenes termicas ni si hubo aumentos de datos o tecnicas de regularizacion especificas. SolarDoctor redistribuye el peso sin modificarlo, por lo que no ha realizado reentrenamiento ni ajuste fino.

## Capacidades

- Deteccion de objetos sobre imagenes termicas infrarrojas en 11 clases: cell, cell-multi, module, string, bypass-diode, offline-module, vegetation-shading, soiling, short-circuit, hot-spot-low y hot-spot-high.
- Localizacion de anomalias termicas en paneles fotovoltaicos, incluyendo puntos calientes de baja y alta intensidad.
- Identificacion de defectos a nivel de celda, modulo y string.
- Deteccion de suciedad (soiling) y de sombreado por vegetacion.
- Deteccion de modulos desconectados (offline-module) y de fallos de diodo de bypass.
- Inferencia sobre imagenes individuales a 640 px mediante la API de Ultralytics.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision.
- No procesa RGB; el autor advierte explicitamente de que solo debe ejecutarse sobre imagenes termicas.

## Casos de uso

- Inspeccion aerea de plantas fotovoltaicas: procesar lotes de imagenes termicas capturadas por dron y generar un listado georreferenciado de modulos con puntos calientes para priorizar el mantenimiento correctivo.
- Mantenimiento predictivo en plantas utility-scale: ejecutar el detector de forma periodica sobre las capturas de la camara termica fija o del dron de inspeccion y comparar la evolucion de anomalias por string a lo largo del tiempo.
- Diagnostico de diodos de bypass: detectar la clase bypass-diode para localizar cadenas con fallos electricos que degradan la produccion y requieren revision del cuadro de conexiones.
- Deteccion de suciedad y sombreado: identificar soiling y vegetation-shading para planificar limpiezas y podas selectivas en lugar de intervenciones completas de la planta.
- Auditoria post-instalacion: verificar la ausencia de puntos calientes y modulos offline en la puesta en marcha de una instalacion nueva, comparando la firma termica esperada con la observada.
- Triaje en plataformas de O&M: integrar el detector como primer filtro en un pipeline de gestion de incidencias, de modo que solo las imagenes con anomalias detectadas pasen a revision humana.
- Investigacion y docencia en vision termica: usar el checkpoint como linea base reproducible para experimentos de deteccion de anomalias en imagenes infrarrojas, dado que la procedencia y el hash estan documentados.

## Benchmarks y rendimiento

| Metrica | Valor | Fuente |
|---|---|---|
| mAP@0.5 | 0,792 | Reportado por upstream (no reproducido por SolarDoctor) |
| mAP@0.5 | 0,727 | `train_metrics` embebidos en el checkpoint |
| mAP@0.5:0.95 | 0,610 | `train_metrics` embebidos en el checkpoint |
| Precision | 0,677 | `train_metrics` embebidos en el checkpoint |
| Recall | 0,693 | `train_metrics` embebidos en el checkpoint |

Existe una discrepancia documentada entre la cifra declarada por upstream (0,792) y la registrada en los metadatos del propio checkpoint (0,727), medida sobre el conjunto de validacion usado durante el entrenamiento. No hay resultados de evaluacion independiente realizados por SolarDoctor ni comparaciones publicadas con otros detectores termicos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del checkpoint (unos 114 MB en `.pt`) la huella en memoria es moderada, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible. Al ser un YOLO11x, es esperable que funcione en GPU de consumo, pero el autor no publica requisitos ni latencias.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: la libreria oficial es `ultralytics` (carga directa del `.pt`). No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SolarDoctor thermal YOLO11x | YOLO11x | 11 (anomalias FV termicas) | 640 px | AGPL-3.0 | Hugging Face (redistribucion) |
| YOLO11m (proyecto Solar1v, Raman Deep) | YOLO11m | no disponible | no disponible | no disponible | Ultralytics Platform |
| YOLO11x estandar (Ultralytics) | YOLO11x | 80 (COCO) | 640 px | AGPL-3.0 | Ultralytics |

La comparativa con alternativas especificas de deteccion termica en fotovoltaica no esta disponible en la informacion proporcionada. El modelo YOLO11m del proyecto Solar1v aparece en los resultados de busqueda, pero sin datos de clases, metricas ni licencia que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Solo valido para imagenes termicas infrarrojas; el autor prohibe explicitamente su uso sobre fotografias RGB.
- No validado con otras camaras, altitudes de vuelo ni condiciones climaticas distintas de las del entrenamiento.
- Precision no verificada de forma independiente: la unica cifra reproducible es la de los metadatos del checkpoint (mAP@0.5 = 0,727), inferior a la declarada por upstream (0,792).
- Licencia AGPL-3.0 heredada de Ultralytics: si se ejecuta el modelo como parte de un servicio en red, es obligatorio ofrecer a los usuarios el codigo fuente completo correspondiente de dicho servicio. Esto condiciona su uso en productos comerciales cerrados.
- Riesgo de falsos positivos y negativos en condiciones de iluminacion termica, emisividad del panel o resolucion distintas a las del conjunto de entrenamiento.
- Sin datos publicados sobre sesgos por tipo de modulo, fabricante, inclinacion o latitud geografica.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- El checkpoint se distribuye sin modificaciones; cualquier incidencia debe reportarse contra el proyecto upstream AxalonSystems.

## Enlaces

- Hugging Face: https://huggingface.co/solar-doctor/solar-doctor-thermal-yolo11x
- Repositorio upstream AxalonSystems: https://github.com/Parakh20/AxalonSystems
- Space publico del upstream: https://huggingface.co/spaces/parakh20/axalon-api
- Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Proyecto Solar1v (YOLO11m, referencia comparativa): https://platform.ultralytics.com/raman-deep/solar1v/yolo11m
