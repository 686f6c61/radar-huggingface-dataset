# chomeed/dinov3-geohead-threading-d0

## Resumen

`chomeed/dinov3-geohead-threading-d0` es un modelo de visión para robótica que decodifica la posición 3D métrica de objetos (una aguja y un trípode) en la tarea `threading_d0` del simulador MimicGen, a partir de características visuales de un backbone DINOv3-S/16 congelado. El autor, chomeed, lo presenta como un resultado negativo parcial: demuestra que la geometría necesaria para la inserción (~4 mm de precisión) ya está presente en las características de DINOv3, pero no es linealmente decodificable. Un decodificador pequeño de 3,8 millones de parámetros, llamado GeoHead, recupera varios milímetros de precisión frente a una sonda lineal, y sigue mejorando con más datos.

El modelo es relevante para la comunidad de robótica y world models porque cuantifica el límite de información geométrica en representaciones autosupervisadas y muestra qué intervenciones no funcionan (escalar el backbone, aumentar resolución, ajustar con pérdida de predicción). La arquitectura combina un encoder de visión congelado con un cabezal de regresión basado en soft-argmax, entrenado con supervisión privilegiada de pose del simulador. El checkpoint está disponible en Hugging Face, aunque su licencia y formato de pesos no están especificados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3-S/16 congelado + GeoHead (decodificador con soft-argmax) |
| Parametros totales | No disponible (backbone DINOv3-S/16 ≈22M + GeoHead ≈3,8M según la documentación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo combina un encoder DINOv3-S/16 congelado (22 millones de parámetros, entrenado con aprendizaje autosupervisado) con un cabezal de decodificación geométrica llamado GeoHead. El GeoHead es un decodificador de 3,8 millones de parámetros que opera sobre el grid de parches (14×14 a 224 px) y aplica un upsampling bilineal hasta 28×28, seguido de un mecanismo de soft-argmax que produce la posición esperada de una distribución espacial. Este soft-argmax es el ingrediente activo: permite localizar dentro de un parche (cada token cubre ≈39,5 mm) y produce salidas continuas a medida que se desplaza la masa de probabilidad. Sustituirlo por un MLP plano es catastrófico (error de 201 mm).

El entrenamiento se realiza sobre ventanas de la tarea `threading_d0` de MimicGen, con supervisión privilegiada de pose del simulador. Se probaron 9.6k, 25k y 60k ventanas, con mejoras consistentes al aumentar datos (de 8,9 a 6,6 mm RMSE en needle). El autor también midió que el encoder congelado distingue desplazamientos de 1 mm con d′ = 4,85, lo que confirma que la información geométrica existe pero requiere un decodificador no lineal.

## Capacidades

- Estimación de pose 3D métrica de objetos (posición absoluta de aguja y trípode) a partir de imágenes RGB de una cámara con 45° de FOV y 2,82 mm/píxel a 224 px.
- Cálculo de la posición relativa (offset) entre la aguja y el trípode, que es la métrica que consume el controlador de la tarea.
- Decodificación sub-parche: el soft-argmax permite localizar posiciones con precisión inferior al tamaño de un token (39,5 mm) a partir de tokens individuales.
- Funciona con resoluciones de 224 px y 448 px; a 448 px el rendimiento es similar (6,6 mm en needle).
- El encoder congelado produce características con una resolución geométrica de al menos 1 mm (medido por re-renderizado determinista).
- No es un modelo generativo ni de lenguaje: no admite tool calling, agentes ni razonamiento multi-paso en texto.

## Casos de uso

- Control robótico de inserción fina: el modelo puede proporcionar realimentación de pose en bucle cerrado para tareas de ensamblaje que requieren precisión de ~4 mm, como roscar una aguja en un trípode.
- Aprendizaje por imitación con supervisión de pose: en entornos MimicGen, el GeoHead extrae poses métricas de imágenes para entrenar políticas sin necesidad de marcadores o sensores de profundidad.
- Evaluación de representaciones visuales para geometría: sirve como banco de pruebas para medir cuánta información métrica contienen características de modelos fundacionales como DINOv3, y qué tipo de cabezal la extrae mejor.
- World models para planificación: la capacidad de predecir posiciones 3D a partir de observaciones visuales puede integrarse en módulos de predicción de estado para planificación de movimiento.
- Investigación en resultados negativos: el modelo documenta intervenciones que no mejoran el rendimiento (escalar backbone, cambiar patch size, aumentar resolución), útil para evitar líneas de trabajo infructuosas en robótica visual.
- Benchmarking de decodificadores espaciales: el análisis de ablación del cabezal (soft-argmax vs MLP, upsampling aprendido vs bilineal) proporciona una referencia para diseñar cabezales de regresión geométrica.

## Benchmarks y rendimiento

La model card reporta RMSE en milímetros sobre episodios reservados (held-out) en la tarea `threading_d0`. El objetivo de la tarea es ~4 mm para inserción fiable y 4–6 mm para el offset.

| Readout sobre DINOv3-S/16 congelado | needle (mm) | offset (mm) |
|---|---|---|
| Sonda lineal ridge (baseline) | 11,3 | 19,3 |
| GeoHead, 9.6k ventanas de entrenamiento | 8,9 | 13,9 |
| GeoHead, 25k | 7,7 | 12,7 |
| GeoHead, 60k | 6,6 | 10,6 |
| GeoHead @448 px, 25k | 6,6 | 10,5 |
| *Objetivo* | *4,0* | *4–6* |

El autor advierte que diferencias menores de 1 mm entre configuraciones están dentro del ruido (±0,5 mm) y que solo dos efectos superan claramente ese umbral: el decodificador frente a la sonda lineal (2,4 mm) y el escalado de datos (2,3 mm). No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Dado que el backbone DINOv3-S/16 tiene 22 millones de parámetros y el GeoHead 3,8 millones, el checkpoint completo en FP32 ocuparía aproximadamente 100 MB, por lo que es viable en GPUs consumer con al menos 4 GB de VRAM (p. ej., RTX 3060, RTX 4060).
- La inferencia a 224 px con lote pequeño debería ejecutarse en tiempo real en GPUs modernas, aunque no se aportan mediciones de latencia o throughput.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.); al ser un modelo de visión, se esperaría uso con PyTorch y el ecosistema de Hugging Face Transformers.

## Comparativa con modelos similares

No disponible. El modelo es un experimento de investigación específico para la tarea `threading_d0` de MimicGen, y no se han publicado comparaciones con otros métodos de estimación de pose en la información proporcionada. Se puede contextualizar con el backbone base DINOv3, pero no existen modelos equivalentes con el mismo cabezal geométrico.

## Limitaciones y advertencias

- Supervisión privilegiada del simulador: el entrenamiento usa la pose verdadera del simulador, que no está disponible en hardware real. La implementación desplegable requeriría adaptación (el autor menciona que la cinemática directa del efector final es gratuita, pero la pose de objetos no).
- Resultado negativo parcial: el modelo documenta que escalar el backbone, aumentar la resolución o ajustar los bloques de DINOv3 no mejora el rendimiento; solo el cambio de cabezal y los datos lo hacen.
- Ruido de medición: diferencias inferiores a 1 mm entre configuraciones pueden ser ruido (±0,5 mm); se necesitan semillas para confirmar efectos.
- Error de offset mayor que sus componentes: la resta de errores independientes se acumula en cuadratura (ratio medido/predicho ≈1,18), lo que no es una anomalía.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido.
- Sin datos de generalización: solo se evaluó en una tarea específica (`threading_d0`) y con una sola cámara; no hay evidencia de que funcione en otras tareas o entornos.
- La model card está incompleta (se corta en la sección de advertencias metodológicas), por lo que pueden faltar detalles sobre el despliegue y limitaciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/dinov3-geohead-threading-d0
- Repositorio de referencia de DINOv3 (Meta): https://github.com/facebookresearch/dinov3
- Página de investigación de DINOv3: https://ai.meta.com/research/dinov3/
- Documentación de DINOv3 en Hugging Face Transformers: https://huggingface.co/docs/transformers/v4.57.1/en/model_doc/dinov3
- Paper de DINOv3 en arXiv: https://arxiv.org/html/2508.10104v1
