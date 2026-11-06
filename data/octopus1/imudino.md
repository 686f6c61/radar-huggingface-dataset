# Octopus1/IMUDINO

## Resumen

IMUDINO es un codificador (*encoder*) transformer para datos de unidades de medida inercial (IMU), publicado por el usuario Octopus1 en Hugging Face junto con un repositorio de código en GitHub y un artículo en arXiv (2611.07437). Se trata de un modelo de extracción de características entrenado con aprendizaje autosupervisado siguiendo el paradigma DINO, adaptado al dominio de series temporales inerciales mediante transformaciones de movimiento que preservan la semántica. Su propósito no es generar texto ni responder instrucciones, sino producir representaciones vectoriales densas de secuencias IMU (acelerómetro XYZ y giroscopio XYZ) reutilizables en tareas posteriores de clasificación, detección o reconocimiento de actividad.

El modelo procesa ventanas de 1024 muestras y 6 canales, las divide en parches de 16 muestras y las codifica con un transformer de 12 capas, 24 cabezas de atención y 768 dimensiones de representación. Incluye 4 *register tokens* y una codificación posicional sensible a la frecuencia de muestreo, lo que permite alimentar secuencias capturadas a distintas tasas (por ejemplo, 100 Hz o 200 Hz) sin reentrenar. La salida incluye un token CLS de secuencia, los tokens de registro y los tokens por parche temporal, lo que facilita tanto tareas de clasificación a nivel de secuencia como tareas densas a nivel de ventana.

Su relevancia actual radica en que los modelos fundacionales para sensórica inercial son escasos en comparación con los de visión o lenguaje, y la mayoría de los sistemas de reconocimiento de actividad se entrenan de forma específica por tarea y dispositivo. IMUDINO propone un codificador preentrenado autosupervisado que puede servir como extractor de características genérico, reduciendo la necesidad de grandes volúmenes de datos etiquetados en aplicaciones de wearables, robótica móvil o monitorización deportiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (ViT adaptado a series temporales IMU, preentrenamiento DINO) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | secuencias de longitud L múltiplo de 16; el ejemplo de la model card usa 1024 muestras (64 parches) |
| Tipos de cuantización | no disponible (checkpoint en punto flotante PyTorch) |
| Idiomas soportados | no aplica (modelo de series temporales, no lingüístico) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch (`imudino.pt`, `state_dict` compatible con `torch.load`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer tipo ViT con parches de 16 muestras, 12 capas, 24 cabezas de atención y dimensión oculta de 768. Los seis canales del sensor (acelerómetro XYZ seguidos de giroscopio XYZ) se embeben conjuntamente, y las MLP usan activación GELU estándar. Incorpora 4 *register tokens*, un mecanismo popularizado en modelos de visión para absorber atención global y mejorar la calidad de las representaciones. La codificación posicional es sensible a la frecuencia: el modelo recibe la tasa de muestreo de cada secuencia (`freqs`, en Hz) y la normaliza respecto a una referencia fija de 100 Hz, lo que permite mezclar datos capturados a distintas frecuencias en el mismo lote. El nombre interno de la fábrica es `imuformer_huge_patch16`, conservado por compatibilidad.

El entrenamiento sigue el paradigma DINO de autodestilación autosupervisada, adaptado al dominio inercial mediante transformaciones de movimiento que preservan la semántica y simulan variaciones en el patrón de movimiento y en la configuración del sensor. La model card no detalla el volumen de datos, la composición del corpus ni si hubo etapas adicionales de ajuste supervisado o preferencias; esa información debería consultarse en el artículo (arXiv 2611.07437) y en el foro de OpenReview.

## Capacidades

- Extracción de características de secuencias IMU de 6 canales (acelerómetro y giroscopio) con salida de 768 dimensiones.
- Representación a nivel de secuencia mediante `cls_token` (`[B, 768]`).
- Representación a nivel de parche temporal mediante `patch_tokens` (`[B, L/16, 768]`), apta para tareas densas.
- Representaciones auxiliares de registro (`reg_tokens`, `[B, 4, 768]`).
- Soporte de máscaras de padding (`masks`, `[B, L]`) para lotes con secuencias de distinta longitud.
- Codificación posicional dependiente de la frecuencia de muestreo, con mezcla de tasas dentro de un mismo lote.
- No soporta generación de texto, tool calling, agentes, visión, audio ni capacidades multilingües: es exclusivamente un codificador de características.

## Casos de uso

- Reconocimiento de actividad humana con wearables: el `cls_token` de 768 dimensiones puede alimentar un clasificador lineal o una cabeza MLP entrenada con pocos datos etiquetados, aprovechando el preentrenamiento autosupervisado para reducir la dependencia de anotaciones.
- Detección de eventos en ventanas deslizantes: los `patch_tokens` permiten localizar en el tiempo gestos, caídas o cambios de marcha, ya que cada parche cubre 16 muestras y conserva resolución temporal.
- Segmentación temporal de secuencias largas: con máscaras de padding se pueden procesar lotes de grabaciones de duración variable y agregar los parches válidos para obtener representaciones por segmento.
- Preprocesado para pipelines de robótica móvil: extracción de embeddings inerciales que se fusionan con datos de otros sensores (cámara, LiDAR) en un sistema de odometría o localización.
- Monitorización deportiva y biomecánica: caracterización de patrones de movimiento en series de acelerómetro y giroscopio para comparar ejecuciones o detectar fatiga, usando el codificador como extractor congelado.
- Análisis de datos de sensórica heterogénea: al aceptar la frecuencia de muestreo por secuencia, permite unificar corpus capturados a 100 Hz, 200 Hz u otras tasas en un mismo espacio de representación.
- Búsqueda y recuperación de series temporales: los embeddings normalizados permiten indexar grabaciones IMU y recuperar segmentos similares por similitud vectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de accuracy, F1 ni comparaciones numéricas; para resultados experimentales debe consultarse el artículo (arXiv 2611.07437) y la entrada de OpenReview.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión al no publicarse el número de parámetros. El repositorio ocupa 0,3 GB, lo que sugiere un checkpoint en el rango de cientos de millones de parámetros en fp32; en fp16 ocuparía aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con suficiente memoria para el checkpoint y el lote; una RTX 3090 o RTX 4090 (24 GB) es holgada para inferencia en fp16 con lotes moderados.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del repositorio; conviene verificar el consumo real con el lote y la longitud de secuencia objetivo.
- Opciones de despliegue: PyTorch nativo con `timm==1.0.30` y el código del repositorio GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IMUDINO | Transformer DINO para IMU | no disponible | secuencias múltiplo de 16 (ejemplo: 1024 muestras) | GPL-3.0 | Hugging Face + GitHub |
| Alternativas de modelos fundacionales IMU | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; la comparativa numérica queda pendiente de los resultados publicados en el artículo.

## Limitaciones y advertencias

- Modelo exclusivamente de extracción de características: no genera texto ni responde instrucciones, por lo que no debe evaluarse con métricas de lenguaje.
- La longitud de entrada debe ser múltiplo positivo de 16; secuencias de otra longitud requieren recorte o padding manual.
- Los parches con padding permanecen en la salida; es responsabilidad del usuario excluirlos al hacer *pooling* o al usar características por parche.
- No se documentan sesgos específicos, pero al entrenarse con datos inerciales reales puede heredar sesgos de los dispositivos, poblaciones y condiciones de captura del corpus, no detallado en la model card.
- Riesgo de degradación fuera de distribución: cambios en la colocación del sensor, escalas de calibración o regímenes de movimiento no representados pueden reducir la calidad de las representaciones.
- La licencia GPL-3.0 es copyleft: el uso comercial es posible, pero obliga a distribuir el código derivado bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- No se especifican requisitos de atribución adicionales ni cláusulas de uso aceptable más allá de la GPL-3.0.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, lo que indica una validación comunitaria aún muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Octopus1/IMUDINO
- GitHub: https://github.com/Cambrian-yzt/IMUDINO-Release
- arXiv: http://arxiv.org/abs/2611.07437
- OpenReview: https://openreview.net/forum?id=psN5UQkhct
- Licencia GPL-3.0: https://www.gnu.org/licenses/gpl-3.0.en.html
