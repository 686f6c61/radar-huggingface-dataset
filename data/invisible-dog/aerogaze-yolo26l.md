# Invisible-dog/aerogaze-yolo26l

## Resumen

AeroGaze YOLO26-L L0 E50 es un checkpoint de detección de objetos basado en la arquitectura YOLO26-L de Ultralytics, publicado por el usuario Invisible-dog dentro del proyecto AeroGaze de cámara activa para drones. El modelo se ha ajustado para detectar 16 clases de objetos aéreos y militares (hangar, helicopter, jet_plane, large_launcher, large_tower, medium_launcher, medium_plane, mine_roller, small_launcher, small_plane, small_tower, ta-ta, tank, condor, jammer y spacecraft) y se distribuye como checkpoint final del detector que consume el pipeline de control de cámara del proyecto.

El repositorio contiene únicamente el detector. El seguimiento, la memoria Kalman, el control de cámara, los tests y el código de despliegue viven en un repositorio separado de GitHub con licencia MIT. El entrenamiento se realizó con Ultralytics 8.4.155 y PyTorch 2.9.1, y en despliegue el modelo se ejecuta en FP16 sobre CUDA con entradas de 1280 píxeles y preprocesado rectangular que preserva la relación de aspecto.

Su interés es acotado y muy especializado: reproduce la geometría de cámara y el conjunto de clases de una competición concreta, no tiene una puntuación de validación oficial confirmada para este checkpoint exacto y no distribuye datos de entrenamiento ni imágenes de evaluación. No es un modelo de propósito general ni un modelo de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-L (detector de objetos de una sola etapa), implementado con Ultralytics 8.4.155 y PyTorch 2.9.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible; el autor solo documenta ejecución en FP16 sobre CUDA. El checkpoint se distribuye sin estado del optimizador |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | checkpoint de PyTorch (.pt) cargable con `ultralytics.YOLO`. El repositorio ocupa 0,1 GB |
| Resolucion de entrada en despliegue | 1280 píxeles con preprocesado rectangular y preservación de relación de aspecto |
| Salida | cajas `xyxy` normalizadas al marco de origen, etiquetas de clase y puntuaciones de confianza |
| Epocas de entrenamiento | 50 acumuladas (10 finales de bajo learning rate desde el checkpoint E40) |
| Numero de clases | 16 |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO26 en su variante L, entrenado y exportado con el stack de Ultralytics (versión 8.4.155) sobre PyTorch 2.9.1. La model card no detalla el número de parámetros, la composición del backbone ni innovaciones internas de la familia YOLO26, por lo que esos datos no están disponibles. El checkpoint corresponde a la etapa de 50 épocas acumuladas: una última etapa de 10 épocas con learning rate bajo partiendo del checkpoint E40, optimizador AdamW con learning rate 1e-5, 47 imágenes etiquetadas como vistas L0 y 120 actualizaciones del optimizador. El checkpoint publicado no conserva estado del optimizador y se eliminaron las rutas locales del sistema de archivos incrustadas por el framework, sin modificar ningún tensor. El SHA256 publicado del checkpoint es `21d84ae3f67967ac08190a1742e6b4e2c95160642db4039ce9f3ad68212b29d5`.

No hay información sobre el número total de tokens, la composición del dataset completo (salvo las 47 imágenes de la etapa final, que incluyen imágenes de desarrollo y entrenamiento previas) ni sobre técnicas de alineación tipo RLHF o DPO, que no aplican a un detector de objetos. Tampoco se documenta si hubo aumento de datos, aunque el pipeline de despliegue de AeroGaze aplica inferencia con la imagen original, volteo horizontal, volteo vertical y volteo combinado, conserva las dos mejores alternativas de clase y fusiona las cajas; cargar el checkpoint por sí solo no reproduce ese pipeline completo.

## Capacidades

- Detección de objetos en imágenes aéreas para 16 clases fijas, en el orden exacto definido por el autor: hangar, helicopter, jet_plane, large_launcher, large_tower, medium_launcher, medium_plane, mine_roller, small_launcher, small_plane, small_tower, ta-ta, tank, condor, jammer y spacecraft.
- Localización con cajas `xyxy` normalizadas al marco de origen, además de etiqueta de clase y puntuación de confianza.
- Inferencia a 1280 píxeles con preprocesado rectangular que preserva la relación de aspecto, útil para imágenes panorámicas de dron.
- Ejecución en FP16 sobre CUDA mediante el stack de Ultralytics.
- Integración como componente de un sistema de visión activa: el detector alimenta el control de cámara y la memoria Kalman del proyecto AeroGaze, aunque esas funciones no forman parte del checkpoint.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni modo de pensamiento.
- No tiene capacidades multilingües ni de generación de texto.
- No tiene capacidades de visión más allá de la detección de cajas: no genera descripciones, no segmenta instancias y no produce máscaras.

## Casos de uso

- Vigilancia aérea automatizada: el detector se ejecuta sobre fotogramas de dron a 1280 píxeles en FP16 y devuelve cajas y confianzas para las 16 clases, lo que permite construir alertas por clase sobre secuencias de vídeo. Es adecuado porque el entrenamiento se hizo con geometría de cámara aérea.
- Control de cámara activa (gimbal): las detecciones alimentan la política de cámara del proyecto AeroGaze, que decide hacia dónde apuntar para mantener el objetivo en el encuadre. El checkpoint está pensado exactamente para ese bucle.
- Preetiquetado de datasets aéreos: usar el modelo como auto-etiquetador para generar cajas candidatas con `conf` bajo (el autor usa 0.001) y revisarlas después manualmente, reduciendo el coste de anotación en dominios con clases densas y objetos pequeños.
- Apoyo a búsqueda y localización de infraestructuras: detección de elementos como large_tower, small_tower, hangar o medium_plane en barridos de imágenes aéreas para tareas de inventario o inspección, siempre con revisión humana dado que la precisión no está validada oficialmente.
- Investigación en detección de objetos aéreos: sirve como punto de partida reproducible para comparar variantes de YOLO26, estudiar el efecto del preprocesado rectangular a 1280 píxeles o evaluar la fusión de cajas con volteos.
- Integración en pipelines de inferencia por lotes: al ser un checkpoint Ultralytics estándar, se puede exportar a otros formatos y ejecutarse sobre lotes de imágenes en servidores con GPU, por ejemplo para análisis forense posterior a un vuelo.
- Prototipado de sistemas de visión activa: combinado con el repositorio de AeroGaze, permite reproducir el bucle detección-seguimiento-control en un simulador o con grabaciones guardadas, sin necesidad de volar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor indica explícitamente que este checkpoint E50, junto con la política final de cámara activa, no tiene una puntuación de validación oficial completa confirmada. Una línea base histórica distinta, el E40 fijo en L0, obtuvo `0.4950687646541436` en el servicio de validación de la competición, y la model card advierte que ese valor no debe atribuirse al checkpoint publicado. La única prueba adicional descrita es un replay causal offline sobre 248 fotogramas guardados, incluidos 50 observaciones L1 sintéticas obtenidas por interpolación de recortes de fotogramas de 960x540; el autor lo califica de prueba de comportamiento, no de precisión.

| Metrica | Valor |
|---|---|
| Puntuacion de validacion oficial del checkpoint E50 | no confirmada |
| Linea base historica E40 (no atribuible a este checkpoint) | 0.4950687646541436 en el servicio de validacion de la competicion |
| Replay causal offline | 248 fotogramas, 50 observaciones L1 sinteticas; prueba de comportamiento, no de precision |
| MMLU, HumanEval, GSM8K u otros | no aplica (modelo de deteccion, no de lenguaje) |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. El repositorio ocupa 0,1 GB, lo que indica un checkpoint ligero, pero el consumo real depende de la resolución de entrada (1280 píxeles), del tamaño de lote y del uso de la inferencia con volteos múltiples del pipeline de AeroGaze. Cualquier cifra concreta sería una estimación no verificada.
- GPU recomendadas: no disponibles. El autor solo documenta FP16 sobre CUDA sin especificar modelo de GPU.
- GPU de consumo: no confirmado. Por el tamaño del checkpoint es plausible que quepa en GPUs de consumo con suficiente VRAM, pero no hay mediciones publicadas que lo respalden.
- Precisión de ejecución documentada: FP16 sobre CUDA.
- Opciones de despliegue: la ruta oficial es la API de Ultralytics (`from ultralytics import YOLO; model.predict(..., imgsz=1280, rect=True, conf=0.001)`), con Ultralytics 8.4.155 y una build de PyTorch compatible con CUDA. El stack de Ultralytics permite exportar a otros formatos (ONNX, TensorRT, OpenVINO), aunque el autor no documenta ninguna exportación concreta.
- vLLM, llama.cpp, Ollama o TGI no aplican: son herramientas para modelos de lenguaje y este es un detector de objetos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de benchmarks ni de parámetros publicados para este checkpoint, y la búsqueda web no devolvió información relacionada con el modelo, por lo que no es posible establecer comparaciones cuantitativas fiables. La comparación se limita a aspectos verificables.

| Modelo | Categoria | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| AeroGaze YOLO26-L L0 E50 | Detector YOLO26-L ajustado a 16 clases aereas | 1280 px, preprocesado rectangular | AGPL-3.0 | Checkpoint .pt en HuggingFace; codigo del proyecto en GitHub (MIT) |
| Otros modelos de la familia Ultralytics YOLO (v8, 11, 26) en variante L | Detector de objetos de proposito general | Configurable | AGPL-3.0 o licencia comercial de Ultralytics | Publicos, con pesos preentrenados |
| Detectores aereos tipo DETR/RT-DETR ajustados | Detector transformer de una etapa | Configurable | Variable segun repositorio | Publicos |
| Pesos preentrenados de YOLO26 del propio framework | Detector base antes del ajuste | Configurable | AGPL-3.0 | Publicos |

Rendimiento, parametros y contexto comparados: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente, pero el modelo está especializado en la geometría de cámara de la competición y en su conjunto de clases, por lo que el rendimiento fuera de ese dominio puede degradarse de forma notable.
- Riesgo de alucinación: en detección de objetos se traduce en falsos positivos y cajas mal localizadas. El autor advierte que los valores de confianza no son probabilidades calibradas, por lo que no deben usarse como umbrales de decisión sin calibración previa.
- Limitaciones de contexto o idioma: no aplica idioma, pero sí dominio. Objetos pequeños, objetos parcialmente ocluidos, cambios de dominio, compresión y fondos no vistos pueden reducir la precisión.
- Validación insuficiente: la puntuación de validación oficial del checkpoint E50 no está confirmada. Las 47 imágenes de la etapa final incluyen imágenes de entrenamiento y desarrollo previas y no constituyen una estimación independiente en un conjunto reservado.
- Datos no distribuidos: ni los datos de entrenamiento ni las imágenes de evaluación se publican con el modelo, lo que impide reproducir el ajuste o auditar la composición del dataset.
- El checkpoint no incluye seguimiento, memoria ni control de cámara; cargarlo por separado no reproduce el pipeline completo del proyecto.
- Restricciones de licencia: el checkpoint se distribuye bajo AGPL-3.0 para alinearse con el stack de Ultralytics y la licencia de los modelos preentrenados. Esto implica obligaciones de copyleft, incluida la publicación del código fuente de versiones modificadas y de los servicios ofrecidos por red, salvo que se disponga de una licencia comercial de Ultralytics. El repositorio de código de AeroGaze es MIT, pero las dependencias y los pesos conservan sus propias licencias.
- Uso dual: las clases incluidas (tank, launchers, jammer, spacecraft) corresponden a objetivos militares. Antes de cualquier uso en producción conviene revisar la normativa aplicable de control de exportaciones y las políticas internas de uso aceptable.
- Trazabilidad: conviene verificar el SHA256 publicado antes de usar el checkpoint, ya que el autor lo facilita como mecanismo de integridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Invisible-dog/aerogaze-yolo26l
- Repositorio del proyecto AeroGaze (control de cámara, memoria Kalman, tests y despliegue): https://github.com/Kevinsvip888/aerogaze-drone-flyby
- Ultralytics (framework de entrenamiento y documentación): https://github.com/ultralytics/ultralytics
- Paper o blog técnico del modelo: no disponible
- Demo o espacio interactivo: no disponible
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relacionados con este modelo; los únicos resultados obtenidos correspondían a series de televisión y películas tituladas «Invisible», sin relación con AeroGaze ni con YOLO26.
