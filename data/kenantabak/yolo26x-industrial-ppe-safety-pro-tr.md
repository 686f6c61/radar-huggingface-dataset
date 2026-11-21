# kenantabak/yolo26x-industrial-ppe-safety-pro-tr

## Resumen

El modelo `yolo26x-industrial-ppe-safety-pro-tr` es un detector de objetos de la familia Ultralytics YOLO26 en su variante XLarge, especializado en la detección de equipos de protección individual (EPI) en entornos industriales. Lo desarrolla Kenan Tabak en el marco de la plataforma turca EVREN (SSYZ) y está entrenado sobre un conjunto de datos propio de 5.237 imágenes y 29.861 cajas delimitadoras, con cinco clases: trabajador (`human`), casco (`helmet`), calzado de seguridad (`boots`), chaleco reflectante (`vest`) y guantes (`gloves`).

El modelo resuelve un problema concreto de seguridad laboral: la verificación automatizada del cumplimiento de EPI mediante cámaras de vigilancia en obras, minas, fábricas y plantas energéticas. Frente a los detectores genéricos, aquí el interés está en la clase `gloves`, históricamente difícil por su pequeño tamaño y oclusión, y que el autor declara haber reforzado con técnicas de pseudo-etiquetado y fusión cruzada de etiquetas.

Es relevante para desarrolladores que necesiten un detector de EPI listo para producción con métricas declaradas altas (98,48 % mAP@50, 86,17 % mAP@50-95, 97,16 % F1) sobre un dataset de validación propio. No obstante, conviene tratar esas cifras con cautela: son datos autoinformados, no verificados de forma independiente, y la licencia del modelo es restrictiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO26 XLarge (`yolo26x`), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos `.pt` de Ultralytics) |
| Idiomas soportados | tr, en (etiquetas de clases y documentación; el modelo no procesa texto) |
| Licencia | cc-by-4.0 según metadatos de Hugging Face; la model card indica CC BY-NC 4.0 (no comercial) para esta variante PRO |
| Formato de pesos | `.pt` (PyTorch / Ultralytics) |
| Entrada | imagen RGB, `imgsz=640` por defecto |
| Clases | 5: `human`, `helmet`, `boots`, `vest`, `gloves` |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

Se trata de un detector YOLO26 en variante XLarge, la de mayor capacidad de la familia Ultralytics YOLO26 (sucesora directa de YOLO11 según los tags del repositorio). La arquitectura es la habitual de la familia: backbone convolucional, cuello de agregación de características multi-escala y cabecera de detección densa sin anclas, con decodificación en una sola pasada. No hay innovaciones arquitectónicas propias del autor; el valor añadido está en el entrenamiento y el conjunto de datos.

El entrenamiento se realizó durante 80 épocas (mejor época en la 77) con `batch=64`, `imgsz=640`, `patience=35`, `close_mosaic=15`, optimizador AdamW (`lr0=0.001`, `lrf=0.01`, programación coseno, `momentum=0.9`) y precisión mixta automática (AMP). El coste total fue de 0,868 horas-GPU (51 min 49 s). El dataset de origen, denominado Master v2 (v2.0) y etiquetado como «Grade A» por el autor, contiene 5.237 imágenes y 29.861 cajas. La model card menciona técnicas de fusión cruzada de etiquetas duplicadas y pseudo-etiquetado con doble profesor para mejorar la clase `gloves`, aunque no se detalla la composición exacta del dataset ni el reparto train/val.

## Capacidades

- Detección de objetos en tiempo real de cinco clases de EPI y personal en imágenes fijas y flujo de vídeo.
- Localización con cajas delimitadoras y puntuaciones de confianza por clase, aptas para umbrales configurables (`conf`, `iou`).
- Detección específica de guantes de protección, clase reforzada explícitamente durante el entrenamiento.
- Funciona como modelo Ultralytics estándar: compatible con `predict`, `track` (seguimiento multiobjeto vía ByteTrack/BoT-SORT) y exportación a otros formatos de la librería.
- Soporte multilingüe limitado a las etiquetas de clase en turco e inglés; no procesa lenguaje natural.
- No dispone de tool calling, razonamiento multi-paso ni capacidades multimodales más allá de la visión.

## Casos de uso

- Monitorización de cumplimiento de EPI en obra: el modelo se integra sobre el flujo de cámaras fijas y genera alertas cuando detecta un trabajador (`human`) sin casco, chaleco o calzado asociado, usando reglas de asociación espacial entre cajas.
- Auditoría de seguridad en plantas industriales: procesamiento por lotes de grabaciones para cuantificar tasas de cumplimiento por turno y zona, aprovechando el mAP@50-95 del 86,17 % para localizaciones precisas.
- Control de acceso a zonas de riesgo: verificación previa a la entrada de que el operario lleva casco y chaleco, con inferencia a 640 px adecuada para cámaras de acceso.
- Detección de guantes en líneas de manipulación: la clase `gloves` (95,38 % AP@50) permite alertar en puestos donde el contacto manual exige protección, aunque con mayor tasa de fallo que el resto de clases.
- Analítica de seguridad y reporting: generación de estadísticas agregadas de uso de EPI a partir de detecciones históricas para informes de prevención de riesgos laborales.
- Prototipado e investigación académica: al estar licenciado para uso no comercial, encaja en tesis y proyectos de investigación sobre visión aplicada a seguridad laboral.
- Despliegue en servidor con GPU para máxima precisión, o sustitución por la variante `yolo26s` (19,4 MB, CC BY 4.0) cuando se requiera edge o uso comercial.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de validación del dataset «Birleştirilmiş Endüstriyel KKD ve Güvenlik Ekipmanı Tespiti Master v2 (5 Sınıf)». Ninguno está verificado de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| mAP@50 | 98,48 % |
| mAP@50-95 | 86,17 % |
| F1 | 97,16 % |
| Precision | 98,41 % |
| Recall | 95,93 % |
| Mejor época | 77 / 80 |

Rendimiento por clase (AP@50 / Precision / Recall / F1):

| Clase | AP@50 | Precision | Recall | F1 |
|---|---|---|---|---|
| `human` | 99,50 % | 99,98 % | 98,12 % | 99,04 % |
| `helmet` | 99,39 % | 99,20 % | 99,24 % | 99,22 % |
| `boots` | 99,13 % | 99,45 % | 96,57 % | 97,99 % |
| `vest` | 99,10 % | 98,65 % | 98,13 % | 98,39 % |
| `gloves` | 95,38 % | 94,33 % | 88,22 % | 91,18 % |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para un YOLO de escala XLarge a 640 px se sitúa habitualmente en el rango de 4-8 GB en FP16, pero el autor no publica la cifra.
- GPU recomendadas: no especificadas por el autor; por escala, GPUs de servidor tipo A100, H100 o L40S son adecuadas para lotes grandes, y una RTX 4090 cubre con holgura la inferencia en tiempo real.
- Compatibilidad con GPU de consumo: previsiblemente sí en RTX 3060/4060 en adelante, aunque sin datos oficiales de memoria.
- Opciones de despliegue: Ultralytics Python (`YOLO.predict`), exportación a ONNX, TensorRT, OpenVINO y TFLite mediante la propia librería; también es posible servir con FastAPI o Triton.
- Latencia y throughput: no disponibles. El autor solo reporta el coste de entrenamiento (0,868 horas-GPU), no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yolo26x-industrial-ppe-safety-pro-tr` (este) | no disponible | no aplica | 98,48 % (autoinformado) | CC BY-NC 4.0 (model card) / CC BY 4.0 (metadatos HF) | Hugging Face |
| `yolo26s` «Endüstriyel KKD Tespiti» (mismo autor) | no disponible | no aplica | no disponible | CC BY 4.0 | EVREN |
| YOLO11x (Ultralytics, genérico) | no disponible | no aplica | no disponible para EPI | AGPL-3.0 / licencia comercial Ultralytics | Ultralytics |
| Detectores EPI genéricos de la comunidad | no disponible | no aplica | no disponible | variable | Hugging Face |

La comparación cuantitativa con alternativas no es posible con la información disponible: no hay benchmarks públicos de modelos EPI comparables en el material proporcionado.

## Limitaciones y advertencias

- Métricas autoinformadas y no verificadas (`verified: false`); el conjunto de validación es del propio autor y no hay evaluación en datasets externos, por lo que la generalización a otras cámaras, iluminaciones o países no está demostrada.
- Clase `gloves` claramente inferior al resto (88,22 % recall): es probable que se pierdan guantes en escenas con oclusión, movimiento o guantes de colores poco contrastados.
- Riesgo de falsos negativos en condiciones adversas (lluvia, contraluz, nocturno, EPI de colores atípicos) no documentado.
- Sesgo geográfico y de dominio: el dataset es turco y de un tipo de instalaciones concreto; puede no transferir bien a otros contextos industriales.
- Ambigüedad de licencia: los metadatos de Hugging Face indican `cc-by-4.0`, pero la model card especifica `CC BY-NC 4.0` (no comercial) para esta variante PRO. Ante la discrepancia, debe asumirse la restricción no comercial salvo aclaración del autor.
- No apto para uso como sistema único de seguridad: es una herramienta de apoyo; no sustituye la supervisión humana ni los protocolos de prevención de riesgos.
- Sin información sobre sesgos demográficos (género, tono de piel) en la detección de personas, lo que es relevante en un sistema que monitoriza trabajadores.
- Sin datos de latencia ni de rendimiento en edge; el autor remite a la variante `yolo26s` para despliegues ligeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26x-industrial-ppe-safety-pro-tr
- Página del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/endustriyel-kkd-tespiti-pro
- Variante ligera `yolo26s` (CC BY 4.0): https://evren.ssyz.org.tr/models/u19979974710e/endustriyel-kkd-tespiti
- Dataset de entrenamiento (Master v2, 5 clases): https://evren.ssyz.org.tr/datasets/u19979974710e/birlestirilmis-endustriyel-kkd-ve-guvenlik-ekipmani-tespiti-master-v2-5-sinif
- Perfil del desarrollador en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catálogo de datasets de visión por computador en turco: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Ultralytics (librería y documentación): https://github.com/ultralytics/ultralytics
