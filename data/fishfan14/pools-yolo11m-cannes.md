# fishfan14/pools-yolo11m-cannes

## Resumen

pools-yolo11m-cannes es un modelo de deteccion de objetos basado en YOLO11m, desarrollado por el usuario fishfan14 y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo YOLO11m de Ultralytics orientado especificamente a la deteccion de piscinas en imagenes aereas con una resolucion aproximada de 20 cm por pixel, procesadas en teselas de 512x512 pixeles.

El modelo resuelve un problema muy concreto de vision por computador: la identificacion automatica de piscinas en ortofotografias aereas, una tarea relevante para cartografia, planificacion urbana, estudios de consumo de agua o analisis de uso del suelo. El ajuste se ha realizado sobre el conjunto de datos publico de Kaggle `alexj21/swimming-pool-512x512`, centrado en la ciudad francesa de Cannes.

Su relevancia es limitada y muy especializada: no es un modelo de proposito general, sino un detector de una unica clase entrenado para un dominio geografico y una resolucion concretos. La model card reporta un mAP50 de 0,969 y un mAP50-95 de 0,583 en validacion. La licencia AGPL-3.0 condiciona fuertemente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m (detector de objetos de una etapa, familia Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 512x512) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`; exportable a otros formatos via Ultralytics, no documentado en la model card) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, `weights/best.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11m, un detector de objetos de una sola etapa de la familia YOLO mantenida por Ultralytics. YOLO11 incorpora un backbone y un cuello (neck) con modulos de convolucion y atencion propios de la version 11, y una cabeza de deteccion que predice cajas delimitadoras y puntuaciones de clase directamente en una sola pasada. La variante "m" (medium) es un punto intermedio de la escala de tamanos de YOLO11 (n, s, m, l, x).

El ajuste fino se realizo sobre el conjunto de datos de Kaggle `alexj21/swimming-pool-512x512`, con imagenes aereas de Cannes (Francia) a unos 20 cm/pixel y teselas de 512x512. Se trata de un problema de deteccion de una unica clase (piscina). No se dispone de informacion sobre el numero de imagenes de entrenamiento, la composicion exacta del dataset, el numero de epocas, hiperparametros ni si se aplicaron tecnicas de aumento de datos mas alla de las habituales de Ultralytics. Tampoco se documenta el uso de tecnicas como decodificacion especulativa ni innovaciones adicionales, que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de objetos de una unica clase: piscinas en imagenes aereas.
- Localizacion mediante cajas delimitadoras con puntuacion de confianza por deteccion.
- Funcionamiento sobre teselas de 512x512 pixeles a resolucion aproximada de 20 cm/pixel.
- Inferencia via la libreria Ultralytics, con carga directa desde Hugging Face (`hf://fishfan14/pools-yolo11m-cannes/weights/best.pt`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de vision general: esta especializado en un dominio y una clase.
- No dispone de modo "thinking", audio ni otras capacidades multimodales.

## Casos de uso

- Cartografia de piscinas a escala municipal: procesar ortofotografias aereas de una ciudad para generar inventarios geoespaciales de piscinas, util para catastros y planificacion urbana. El modelo esta ajustado a imagenes a 20 cm/pixel, condiciones similares a las ortofotos publicas.
- Estudios de consumo de agua: identificar la densidad de piscinas por barrio o parcela para estimar demanda hidrica estacional y apoyar politicas de gestion del agua.
- Analisis de uso del suelo y vivienda: combinar las detecciones con datos catastrales para estudiar la relacion entre piscinas y tipologia de vivienda (unifamiliar, segunda residencia, etc.).
- Monitorizacion de cambios urbanos: aplicar el detector sobre ortofotos de distintas fechas para detectar nuevas construcciones de piscinas y cuantificar la expansion residencial.
- Seguros y tasacion inmobiliaria: verificar automaticamente la presencia de piscina en una parcela a partir de imagenes aereas, como apoyo a la evaluacion de riesgos o la valoracion de inmuebles.
- Investigacion en vision por computador: servir como modelo de referencia o linea base para experimentos de deteccion de objetos en imagenes aereas de una clase, con metricas de validacion publicadas (mAP50 0,969).
- Pipelines de teledeteccion: integrarse en flujos de procesamiento por teselas (512x512) para analisis a gran escala, dado que el modelo opera sobre recortes de ese tamano.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las metricas de validacion:

| Metrica | Valor |
|---|---|
| mAP50 | 0,969 |
| mAP50-95 | 0,583 |

No se han publicado resultados comparativos con otros modelos ni desgloses por clase, recall o precision en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de la variante YOLO11m (repo de 0,1 GB) se espera un consumo moderado, apto para GPU de consumo, aunque no hay cifras publicadas.
- GPU recomendadas: no disponible en la model card; cualquier GPU compatible con PyTorch y Ultralytics deberia poder ejecutar la inferencia.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de la variante "m", aunque no se documenta.
- Opciones de despliegue: libreria Ultralytics (Python), con carga desde Hugging Face. Otras opciones (exportacion a ONNX, TensorRT, etc.) no estan documentadas en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pools-yolo11m-cannes | no disponible (YOLO11m) | 512x512 px | mAP50 0,969 / mAP50-95 0,583 | AGPL-3.0 | Hugging Face |
| YOLO11m (base, Ultralytics) | no disponible (variante m) | configurable | no disponible (modelo general, no especifico de piscinas) | AGPL-3.0 | Ultralytics / Hugging Face |
| Otros detectores de piscinas en imagenes aereas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especificos de deteccion de piscinas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de una unica clase y dominio muy restringido: solo detecta piscinas y fue entrenado con imagenes de Cannes (Francia). Su generalizacion a otras ciudades, paises o condiciones de imagen no esta validada.
- Dependencia de la resolucion: el entrenamiento se realizo a ~20 cm/pixel y teselas de 512x512; usarlo con otras resoluciones o tamanos de tesela puede degradar el rendimiento.
- Riesgo de falsos positivos y negativos en condiciones atipicas (piscinas cubiertas, en construccion, con toldos, sombras, vegetacion o agua de color inusual).
- mAP50-95 de 0,583 indica que la localizacion precisa de las cajas no es perfecta, aunque la deteccion a umbral de IoU 0,5 sea muy alta.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial o en servicios en red requiere revisar el cumplimiento de la licencia y, en su caso, liberar el codigo derivado.
- Sin datos publicados sobre sesgos, composicion del dataset, numero de imagenes ni proceso de entrenamiento, lo que dificulta evaluar su robustez.
- No apto para tareas de vision general, texto, agentes ni razonamiento: es exclusivamente un detector de objetos.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fishfan14/pools-yolo11m-cannes
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/alexj21/swimming-pool-512x512
- Ultralytics (libreria y familia YOLO11): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com
