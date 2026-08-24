# resoajoe/depth-nano

## Resumen

depth-nano es un micro-modelo de clasificación de imágenes desarrollado por resoajoe (Joe Cox) y publicado en Hugging Face con licencia MIT. Con solo 47.187 parámetros y un peso de 189 KB en formato ONNX, su función es estimar cuántas generaciones de encadenamiento separan un fotograma de vídeo generado de su imagen ancla real. Resuelve un problema concreto de los pipelines de generación de vídeo largo por encadenamiento: cuando cada fragmento se condiciona al último fotograma del anterior, el error se acumula progresivamente, y este modelo lee esa acumulación a partir de un único fotograma de 64×64 píxeles.

El modelo clasifica en tres categorías ordinales —`fresh` (generado directamente desde un ancla real), `shallow` (1-5 generaciones de distancia) y `deep` (6 o más)— en lugar de hacer regresión, porque la distribución de profundidades es bimodal y un regresor podría resolver solo los extremos. Es un modelo extremadamente ligero, pensado para ejecutarse en CPU, y está diseñado como herramienta de monitorización para decidir cuándo re-anclar un pipeline de vídeo generativo.

La relevancia actual del modelo reside en que aborda un problema emergente en la generación de vídeo largo: la degradación acumulativa por encadenamiento. Su autor documenta con rigor experimental una ablación que descarta la hipótesis de que el modelo aprenda a reconocer la imagen ancla en lugar de la degradación real, lo que lo convierte en un caso interesante de validación de señales en modelos nano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada por el autor (red neuronal convolucional para clasificación de imágenes, 47.187 parámetros) |
| Parámetros totales | 47.187 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de 64×64 píxeles) |
| Tipos de cuantización | No disponible (el modelo se distribuye en FP32 ONNX, 189 KB) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | ONNX (inferencia con onnxruntime) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la model card del autor; se sabe que es un modelo convolucional de tamaño nano (47.187 parámetros) que acepta una imagen BGR de 64×64 píxeles en formato NCHW normalizada a [0,1] y devuelve tres logits correspondientes a las clases ordinales `fresh`, `shallow` y `deep`. El entrenamiento se realizó sobre fotogramas completos redimensionados a 64×64 sin recorte, ya que el daño por encadenamiento es una propiedad global del fotograma y no depende de la relación objeto-fondo.

Los datos de entrenamiento provienen de dos generadores de vídeo: LTX-Video-2B y Wan 2.2 TI2V-5B, en un total de 1.840 fragmentos (932 `fresh`, 264 `shallow`, 644 `deep`). La validación se realizó con una división estratificada por "brazos" (arms) —conjuntos de fotogramas que comparten semilla y configuración de encadenamiento— con un 30% de datos retenidos y 3 semillas. Se aplicó un control de permutación de etiquetas que produjo una mejora negativa (−0,097 y −0,042 de lift), lo que confirma que el harness no fabrica señal artificial.

## Capacidades

- Clasificación de profundidad de encadenamiento en tres niveles ordinales (`fresh`, `shallow`, `deep`) a partir de un único fotograma de 64×64.
- Detección de degradación acumulada en pipelines de generación de vídeo encadenado, no de calidad estética ni de autenticidad.
- Inferencia en CPU con onnxruntime, con un coste computacional mínimo (189 KB de pesos).
- Verificación numérica: diferencia relativa máxima de logits de 3,0e-07 entre ONNX y PyTorch, con 100% de concordancia en argmax sobre 512 fotogramas reales.
- Funcionamiento con entrada BGR (canal de color tal y como devuelve `cv2.imread`), no RGB.
- Robustez frente a la confusión con la similitud con la imagen ancla: la ablación shallow vs deep (sin clase `fresh`) mantiene una mejora significativa (+0,328 ± 0,068 de lift).
- No soporta tool calling, ni agentes, ni multimodality, ni razonamiento de lenguaje.

## Casos de uso

- Monitorización de pipelines de generación de vídeo largo: el modelo puede integrarse en un sistema de generación por encadenamiento para clasificar cada fotograma en `fresh`, `shallow` o `deep` y decidir cuándo re-anclar el proceso al fotograma de referencia real, evitando la degradación acumulada.
- Control de calidad automatizado en producción de vídeo generativo: un pipeline que genera contenido con LTX-Video o Wan 2.2 puede usar depth-nano como filtro previo a la publicación, descartando o regenerando fragmentos clasificados como `deep`.
- Alerta temprana en sistemas de generación de vídeo en streaming: la latencia de inferencia en CPU es mínima (189 KB de pesos), lo que permite clasificar cada fotograma en tiempo real y lanzar alertas cuando la calidad del encadenado se degrada más allá del umbral `shallow`.
- Benchmarking de generadores de vídeo: comparar la tasa de degradación de distintos modelos de generación (LTX-Video vs Wan 2.2) en función de la profundidad de encadenado, usando depth-nano como métrica de degradación acumulada.
- Investigación sobre acumulación de error en modelos generativos: como herramienta de diagnóstico, el modelo permite estudiar cómo se propaga el error a través de las generaciones encadenadas y evaluar técnicas de mitigación como re-anclaje periódico o condicionamiento alternativo.
- Sistema de control de calidad en pipelines de video que ya usan ONNX Runtime en producción: al ser un modelo ONNX de 189 KB, puede integrarse en infraestructura existente sin necesidad de GPU ni de conversión de formato, con un coste de latencia despreciable.

## Benchmarks y rendimiento

El autor reporta resultados de rendimiento con división estratificada por brazos, ~30% de datos retenidos y 3 semillas:

| Semilla | Precisión | Mayoría | Lift | MAE ordinal | Recall `fresh` | Recall `shallow` | Recall `deep` |
|---|---|---|---|---|---|---|---|
| 0 | 0,946 | 0,434 | +0,512 | 0,055 | 0,979 | 0,772 | 0,974 |
| 1 | 0,965 | 0,696 | +0,268 | 0,035 | 0,992 | 0,877 | 0,917 |
| 2 | 0,947 | 0,471 | +0,476 | 0,057 | 0,995 | 0,520 | 0,956 |
| **Media** | | | **+0,419 ± 0,108** | **0,049 ± 0,010** | 0,989 | 0,723 | 0,949 |

Ablación sin la clase `fresh` (solo `shallow` vs `deep`, 908 fragmentos, 27 brazos, 5 semillas):

| Semilla | Precisión | Mayoría | Lift |
|---|---|---|---|
| 0 | 0,919 | 0,555 | +0,365 |
| 1 | 0,953 | 0,560 | +0,393 |
| 2 | 0,902 | 0,624 | +0,278 |
| 3 | 0,957 | 0,574 | +0,383 |
| 4 | 0,952 | 0,733 | +0,218 |
| **Media** | | | **+0,328 ± 0,068** |

Control de permutación de etiquetas: lift de −0,097 y −0,042, confirmando que el harness no fabrica señal.

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU pura: el modelo es un ONNX de 189 KB y 47.187 parámetros, por lo que se ejecuta con onnxruntime en cualquier CPU moderna sin GPU.
- VRAM: no requiere VRAM; la inferencia se realiza íntegramente en memoria del sistema.
- GPU recomendadas: ninguna; la inferencia en CPU es suficiente y no hay beneficio significativo de usar GPU para un modelo de este tamaño.
- Compatibilidad con GPU de consumo: sí, si se desea, pero no es necesario.
- Opciones de despliegue: onnxruntime (CPUExecutionProvider o GPUExecutionProvider), compatible con cualquier entorno que soporte ONNX Runtime.
- Latencia: no se proporcionan datos medidos; dado el tamaño, la latencia es del orden de milisegundos en CPU.
- Throughput: no disponible; la inferencia por fotograma es trivial en términos de cómputo.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de la misma categoría (clasificación de profundidad de encadenamiento en vídeo generativo). Los modelos de estimación de profundidad geométrica (como AnyDepth o Depth Anything) resuelven un problema diferente (profundidad de escena) y no son comparables en propósito ni en arquitectura.

## Limitaciones y advertencias

- No es un detector de calidad o estética de imagen: estima profundidad de encadenado, que correlaciona con degradación en el pipeline específico pero no es una medida general de calidad.
- No es un detector de deepfake, de contenido generado por IA ni de procedencia: todos los fotogramas de entrenamiento son generados por IA y el modelo no ha visto ninguna fotografía real.
- No es una medida de compresión, re-guardado o edición de imágenes.
- No debe usarse para decisiones sobre personas.
- Limitación de dominio: entrenado solo con dos generadores (LTX-Video-2B y Wan 2.2 TI2V-5B) y un escenario (interior con persona); se espera una transferencia pobre a otras arquitecturas de generación.
- El recall de la clase `shallow` varía entre 0,52 y 0,88 según la semilla; la zona media de profundidad está infrarrepresentada en el conjunto de entrenamiento (264 fragmentos frente a 932 y 644).
- La profundidad es un proxy de daño, no el daño en sí: una cadena bien comportada a profundidad 8 puede verse mejor que una mala a profundidad 3.
- No puede distinguir entre profundidad 6 y profundidad 40: la clase `deep` es un bin abierto.
- Las etiquetas se asignan por fragmento, no por fotograma: el daño visual varía dentro de un fragmento, lo que añade ruido de etiqueta.
- El modelo espera entrada BGR, no RGB: alimentarlo con RGB degrada silenciosamente la salida sin generar errores.
- No debe alimentarse con recortes de imagen: los estadísticos de degradación de una región no son los del fotograma completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/resoajoe/depth-nano
- Perfil del autor: https://huggingface.co/resoajoe
- Datasets del autor: https://huggingface.co/resoajoe/datasets
