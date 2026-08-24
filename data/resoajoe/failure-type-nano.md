# resoajoe/failure-type-nano

## Resumen

`failure-type-nano` es un modelo de clasificación de imágenes multi-etiqueta extremadamente ligero, con 47.187 parámetros y un peso de 189 KB en formato ONNX. Ha sido desarrollado por resoajoe (Joe Cox) como complemento del modelo `quality-gate-nano` para su uso dentro de un pipeline de generación de vídeo. Mientras que el modelo de calidad indica *si* un fragmento (chunk) de vídeo generado es defectuoso, `failure-type-nano` predice *por qué* lo es, identificando tres causas concretas: imagen borrosa, pocos puntos clave de seguimiento o ausencia de rostro. Esta información permite enrutar la corrección (re-sembrado, re-anclaje, ajuste de prompt) en lugar de regenerar el fragmento de forma ciega.

El modelo opera sobre fotogramas completos redimensionados a 64×64 píxeles y produce tres salidas sigmoideas independientes, una por etiqueta. No es una métrica de calidad estética ni un detector general de rostros o desenfoque, sino un clasificador específico entrenado para aproximar la salida de tres detectores automáticos de control de calidad (QC). Su relevancia radica en su tamaño extremadamente reducido, que permite ejecutarlo en CPU con latencia mínima, y en la decisión metodológica de evaluar su rendimiento mediante partición por "brazos" de generación en lugar de por fotogramas, evitando fugas de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada (red neuronal pequeña, 47.287 parámetros) |
| Parámetros totales | 47.287 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de imagen fija 64×64) |
| Tipos de cuantización | No disponible (modelo ONNX, sin cuantización documentada) |
| Idiomas soportados | No aplica (entrada de imagen) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura no está documentada en la model card, pero por el tamaño y el formato se trata de una red neuronal convolucional o MLP muy compacta que procesa imágenes de 64×64 píxeles en formato BGR y produce tres logits independientes, cada uno seguido de una sigmoide. La elección de tres sigmoides en lugar de una softmax se justifica porque las etiquetas co-ocurren con frecuencia (373 de los 1.840 chunks fallaron las tres comprobaciones a la vez). Una softmax forzaría una estructura de clases mutuamente excluyente que no corresponde a la realidad.

El entrenamiento se realizó con fotogramas completos redimensionados a 64×64 (sin recorte) procedentes de vídeos generados por dos modelos: LTX-Video-2B y Wan 2.2 TI2V-5B, en un único tipo de escena (una habitación interior con una persona). Las etiquetas se asignan a nivel de chunk: cada fotograma de un chunk recibe la etiqueta del chunk completo. Esto introduce ruido de etiquetado inevitable, ya que un fotograma nítido dentro de un chunk que falló por otro fotograma se etiqueta como borroso. No se mencionan técnicas de RLHF ni DPO; se trata de un entrenamiento supervisado estándar.

## Capacidades

- Clasificación multi-etiqueta de tres tipos de fallo en fotogramas de vídeo: `blurred` (varianza laplaciana baja), `few_keypoints` (pocos puntos clave ORB) y `no_face` (ausencia de rostro según un detector tipo RetinaFace).
- Entrada de fotograma completo redimensionado a 64×64, en formato BGR (canal ordenado), con valores normalizados entre 0 y 1.
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- Salida probabilística para cada etiqueta (0 a 1), permitiendo umbrales por etiqueta.
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No es un modelo multimodal; solo procesa imágenes fijas.

## Casos de uso

- **Triage de calidad en pipelines de generación de vídeo**: tras generar un fragmento, el modelo predice qué comprobación de QC ha fallado. Si se detecta `few_keypoints`, el sistema puede re-anclar el seguimiento de características; si se detecta `no_face`, puede cambiar la semilla o el prompt para recuperar la presencia del rostro.
- **Filtro de descarte rápido en producción**: al ser un modelo de 47K parámetros, puede ejecutarse en CPU en cada fotograma o en muestras de cada fragmento para descartar rápidamente los que no superen el umbral, sin incurrir en el coste de ejecutar los detectores completos.
- **Monitorización de calidad en tiempo real**: integrado en un servicio de streaming de vídeo generado, permite alertar sobre degradaciones de calidad (borrosidad, pérdida de seguimiento) antes de que el usuario final las perciba.
- **Ajuste automático de hiperparámetros de generación**: en un bucle de control, si el modelo predice `blurred`, se puede reducir el paso de estabilización sub-píxel que produce el artefacto de resampling; si predice `few_keypoints`, se puede aumentar la densidad de puntos de seguimiento.
- **Análisis de patrones de fallo en lote**: procesar un conjunto de clips generados para identificar qué tipo de fallo predomina (por ejemplo, si `no_face` es frecuente en ciertos prompts) y ajustar la configuración del pipeline en consecuencia.
- **Experimento de aprendizaje automático**: como ejemplo de clasificación multi-etiqueta con modelo extremadamente pequeño, útil para enseñar conceptos de aprendizaje de representaciones y evaluación sin fugas de datos.

## Benchmarks y rendimiento

La model card reporta resultados de rendimiento medidos por división a nivel de "arm" (grupos de fragmentos que comparten semilla y configuración), con un 30% de arms retenidos y tres semillas. Los valores de precisión y recall se presentan junto con la línea base mayoritaria y el "lift" (mejora sobre la línea base). La siguiente tabla resume los resultados:

| Etiqueta | Precisión | Línea base mayoritaria | Lift | Recall |
|---|---|---|---|---|
| `blurred` | 0.892 | 0.803 | +0.089 ± 0.042 | 0.865 ± 0.007 |
| `few_keypoints` | 0.905 | 0.630 | +0.275 ± 0.077 | 0.911 ± 0.023 |
| `no_face` | 0.846 | 0.693 | +0.153 ± 0.051 | 0.841 ± 0.108 |

El autor señala que el rendimiento de `blurred` es marginal: el lift positivo se mantiene en las tres semillas (+0.104, +0.032, +0.132), pero la dispersión es la mitad del efecto y la precisión cae a 0.570 en la peor semilla. `few_keypoints` es la etiqueta con mejor rendimiento relativo. No se proporcionan benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo no es de lenguaje.

## Requisitos de hardware

- **Memoria**: el modelo ocupa 169 KB en formato ONNX, por lo que requiere menos de 1 MB de RAM. No se requiere VRAM dedicada.
- **CPU**: funciona correctamente en cualquier CPU moderna, incluso en Raspberry Pi o dispositivos embebidos. La inferencia es prácticamente instantánea (menos de 1 ms por imagen en un PC convencional).
- **GPU**: no es necesaria; aunque puede ejecutarse en GPU si se desea, no aporta ventaja significativa.
- **Despliegue**: se puede servir mediante ONNX Runtime (CPUExecutionProvider), también compatible con otros entornos como Python, C++, Java, o móvil. No se han documentado integraciones con vLLM, Ollama o TGI (no aplicable a modelos de imagen).
- **Latencia**: no se han publicado cifras oficiales, pero dado el tamaño y la resolución de entrada, la latencia por imagen es del orden de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos con la misma finalidad (clasificación de fallos de calidad en generación de vídeo) y tamaño similar. El modelo hermano `quality-gate-nano` es el único relacionado, pero es una clasificación binaria (bueno/malo) y no se han publicado comparaciones cuantitativas entre ambos. Por lo tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- **No es una métrica de calidad de imagen**: no mide estética, realismo ni fidelidad al prompt. Solo predice la salida de tres detectores específicos.
- **No es un detector de rostros**: la etiqueta `no_face` solo indica que el detector de tipo RetinaFace no encontró un rostro en los fotogramas de prueba. No debe usarse para presencia, conteo ni seguridad.
- **`blurred` está confundido con el artefacto de resampling**: el estabilizador sub-píxel con interpolación bilineal puede reducir la nitidez y disparar el detector de borrosidad, etiquetando vídeos que no son realmente borrosos. El modelo reproduce esa confusión.
- **Entrenamiento con solo dos generadores y un tipo de escena**: LTX-Video-2B y Wan 2.2 TI2V-5B, con una habitación interior y una persona. La transferencia a otros contenidos (exteriores, múltiples personas, etc.) será pobre.
- **La variabilidad del recall de `no_face` es alta** (±0.108 entre semillas), lo que indica que la generalización para esta etiqueta es inestable.
- **Etiquetas a nivel de chunk, inferencia a nivel de fotograma**: un fotograma nítido dentro de un chunk que falló por otro fotograma se etiqueta como borroso, lo que introduce ruido de etiquetado y limita la precisión alcanzable.
- **No puede ver lo que ven los detectores**: se aproxima a tres detectores a partir de un miniatura de 64×64. Si se pueden ejecutar los detectores reales, siempre son la verdad de terreno.
- **Licencia MIT** permite uso comercial y modificación, pero el modelo no debe utilizarse para decisiones sobre personas (moderación, identificación, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/resoajoe/failure-type-nano
- Modelo complementario `quality-gate-nano`: https://huggingface.co/resoajoe/quality-gate-nano
- Perfil del autor en Hugging Face: https://huggingface.co/resoajoe
- Perfil de GitHub del autor: https://github.com/resoajoe
