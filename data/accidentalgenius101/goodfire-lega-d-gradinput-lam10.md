# accidentalgenius101/goodfire-legA-D-gradinput-lam10

## Resumen

`goodfire-legA-D-gradinput-lam10` es un checkpoint de replicación independiente del apartado 2.1 (Waterbirds reliance shaping) del artículo de Goodfire "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071). No es un modelo de lenguaje: es un artefacto experimental compuesto por un encoder ViT-S/14 congelado o parcialmente ajustado (`facebook/dinov2-small`) más una cabeza de lectura MLP entrenada desde cero, orientado a reproducir el fenómeno de *reliance shaping* sobre el dataset Waterbirds. Lo publica el usuario `accidentalgenius101` como evidencia de un intento de replicación que, según su propia model card, **falló** en el criterio de endpoint predeclarado.

El interés del artefacto es metodológico más que de producto: documenta con detalle inusual un caso de no replicación, identifica las causas (un defecto propio en el régimen de learning rates y una laguna de especificación en el artículo original respecto a la longitud de entrenamiento y la regla de checkpointing) y publica las métricas de todas las variantes ejecutadas. Con 22.221.185 parámetros totales y 0,1 GB de repositorio, es un objeto pequeño, entrenable en una sola GPU de consumo, pero sin ninguna utilidad como modelo generativo.

La relevancia actual reside en que expone un problema de reproducibilidad en investigación sobre interpretabilidad y *shaping* de representaciones: la afirmación de trayectoria del artículo (pico temprano de worst-group accuracy) sí se reproduce, mientras que la afirmación de endpoint (93-97,7 % de WGA en test) no se sostiene bajo el protocolo declarado. El checkpoint corresponde al brazo A1 (penalización `gradinput`, lambda 10, semilla 0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (`facebook/dinov2-small`) como encoder de 384 dimensiones + cabeza MLP GELU (384 -> 256 -> 256 -> 1) sobre el token CLS normalizado |
| Parametros totales | 22.221.185 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por imagen, entrada 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un encoder Vision Transformer ViT-S/14 de DINOv2 (`facebook/dinov2-small`) que produce un token CLS de 384 dimensiones, normalizado, y una cabeza de lectura MLP con activación GELU de dos capas ocultas de 256 unidades y salida escalar. La entrada son imágenes de 224x224. El entrenamiento se realizó sobre los *filed splits* de Waterbirds: 2.066 imágenes de entrenamiento en exactamente dos grupos perfectamente confundidos, y splits de validación y test de 512 imágenes cada uno con cuatro grupos de 128 e identidades disjuntas.

La configuración del brazo publicado (A1, run set D3) es: penalización `gradinput` con lambda 10, semilla 0, `refresh` 100, `frozen=False`, batch 32, 25.000 pasos, AdamW con weight decay 0 y learning rates constantes separados (encoder 1e-6, cabeza 1e-3). El artículo original no especifica optimizador para la sección 2.1, ni longitud total de entrenamiento, ni regla de checkpointing, ni schedule de LR, ni weight decay, ni LR de la cabeza, ni valor de lambda; estas cantidades se declaran en el campo `deviations` del `config.json`. Goodfire solo liberó la librería `reliance`, no los modelos ajustados, por lo que este checkpoint es un artefacto de replicación independiente.

## Capacidades

- Clasificación binaria de imágenes (aves acuáticas frente a terrestres) en el marco del dataset Waterbirds, con salida escalar por imagen.
- Extracción de representaciones vía el token CLS de 384 dimensiones del encoder DINOv2 subyacente.
- Soporte de *reliance shaping*: el modelo se entrenó con una penalización sobre la entrada del gradiente (`gradinput`) para intentar forzar que la predicción dependa del objeto y no del fondo.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo *thinking*, visión general, audio ni ninguna capacidad de propósito general.

## Casos de uso

- Reproducción de experimentos de *reliance shaping*: sirve como punto de partida para reejecutar la sección 2.1 del artículo con variaciones de longitud de entrenamiento y regla de checkpointing, que la model card identifica como la variable decisiva entre leer el pico transitorio o el endpoint decaído.
- Auditoría de reproducibilidad: el artefacto documenta métricas por brazo y por semilla, útil para comparar implementaciones de la penalización `gradinput` y `shuffle` contra la librería `reliance` oficial.
- Estudio de dinámica de entrenamiento en cabezas desde cero sobre encoders congelados: los brazos de contexto (ERM con LRs separados, encoder congelado, `gradinput` con encoder congelado) permiten aislar el efecto del ajuste fino del encoder frente al de la cabeza.
- Investigación sobre *shortcut learning*: Waterbirds es un banco estándar de sesgo de correlación fondo-etiqueta; este checkpoint permite medir AUROC de fondo (L1) y WGA por grupo en un régimen concreto y documentado.
- Docencia y metodología experimental: la model card es un ejemplo detallado de pre-registro de barras de aceptación (sanity, REPLICATED, hold bar) y de veredicto explícito de fallo, reutilizable como plantilla.
- Verificación de artefactos pequeños en pipelines de CI de investigación: con 22,2 M de parámetros y 0,1 GB, el checkpoint se puede cargar y evaluar en cada commit de una implementación de la penalización sin coste relevante de infraestructura.

## Benchmarks y rendimiento

Resultados publicados en la model card para Waterbirds (semilla 0, batch 32, refresh 100, weight decay 0, LRs constantes encoder 1e-6 / cabeza 1e-3, lectura de endpoint en el paso 25.000):

| Brazo | lambda | Pico WGA val (paso) | WGA val endpoint | WGA test endpoint | L1 test endpoint |
|---|---|---|---|---|---|
| gradinput (D3, este checkpoint) | 10 | 0,945 (400) | 0,172 | 0,180 | 0,165 |
| gradinput (E wave 1) | 1 | 0,891 (200) | 0,164 | 0,141 | 0,152 |
| gradinput (E wave 2) | 0,3 | 0,617 (200) | 0,188 | 0,180 | 0,161 |
| shuffle (D3) | 30 | 0,953 (1.000-1.200) | 0,000 | 0,000 | 0,548 |
| shuffle (E wave 1) | 3 | 0,938 (400) | 0,016 | 0,008 | 0,137 |
| shuffle (E wave 2) | 1 | 0,945 (200) | 0,375 | 0,422 | 0,550 |

Brazos de contexto (mismos splits, regímenes más cortos o congelados):

| Brazo de contexto | Protocolo | WGA test |
|---|---|---|
| ERM, régimen filed | LR único 1e-6 en todos los parámetros, 2.500 pasos, 3 semillas | 0,055 (media) |
| ERM, LRs separados (D1) | encoder 1e-6 / cabeza 1e-3, 2.500 pasos, semilla 0 | 0,172 |
| ERM congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, semilla 0 | 0,375 |
| gradinput lambda 10 congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, semilla 0 | 0,711 |

Desglose por grupo del endpoint de este checkpoint: val WGA 0,172 (grupos {0: 0,906; 1: 0,172; 2: 0,180; 3: 0,812}); test WGA 0,180 (grupos {0: 0,836; 1: 0,188; 2: 0,180; 3: 0,836}); L1 val 0,171 y L1 test 0,165. El artículo original reporta endpoints de 93-97,7 % de WGA en test para la sección 2.1 con 3 semillas, bajo un protocolo cuyos parámetros clave no están publicados. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no aplicarían a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 para los 22,2 M de parámetros, más el coste de activaciones del ViT-S/14 a 224x224 (típicamente menos de 2 GB con batch pequeño).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier modelo con 4 GB o más, incluidas GTX 1650 y superiores.
- Opciones de despliegue: carga directa con `transformers` y `safetensors` (encoder DINOv2 + cabeza MLP definida por el autor); no hay artefactos GGUF ni integración con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `goodfire-legA-D-gradinput-lam10` (este) | 22,2 M | imagen 224x224 | clasificación binaria con shaping | other | Hugging Face, repo de 0,1 GB |
| `facebook/dinov2-small` | ~22 M | imagen 224x224 (parches 14x14) | backbone de representaciones visuales | Apache 2.0 (según el modelo original) | Hugging Face, ampliamente disponible |
| Modelos ajustados de la sección 2.1 del artículo de Goodfire | no disponible | no disponible | clasificación con reliance shaping | no liberados | no disponibles (solo se liberó la librería `reliance`) |
| Checkpoints ERM de Waterbirds sobre DINOv2 | no disponible | imagen 224x224 | clasificación binaria sin shaping | no disponible | no disponibles en la información proporcionada |

La comparación relevante es con el backbone original: este checkpoint añade una cabeza MLP y un régimen de entrenamiento con penalización, pero no mejora el endpoint de clasificación frente a variantes ERM con encoder congelado (0,375 de WGA test) ni frente al `gradinput` congelado (0,711), según los propios datos del autor.

## Limitaciones y advertencias

- El autor declara explícitamente el resultado como **FAILED, narrowed**: ningún brazo limpio cumple la barra de retención predeclarada (WGA test endpoint >= 88 % sin colapso tardío).
- El endpoint de este checkpoint (WGA test 0,180) está muy por debajo del reportado en el artículo (93-97,7 %), y el autor atribuye la discrepancia a una laguna de especificación del artículo, no a un defecto corregible por su parte.
- Existe un defecto propio documentado en el régimen original (LR único de 1e-6 aplicado también a la cabeza desde cero), corregido en las olas posteriores; los resultados publicados reflejan el régimen corregido.
- Riesgo de alucinación: no aplica como modelo generativo, pero la cabeza produce una salida escalar calibrada solo para la distribución de Waterbirds; fuera de ella la predicción carece de garantías.
- Sesgos conocidos: el entrenamiento usa dos grupos perfectamente confundidos, de modo que el modelo puede aprender correlaciones espurias fondo-etiqueta; el AUROC de fondo L1 de 0,165-0,171 en test indica dependencia residual del fondo.
- Limitaciones de idioma: no aplica; es un modelo de visión sin capacidades lingüísticas.
- Restricciones de licencia: licencia `other` sin texto adicional en la información disponible; debe consultarse el repositorio antes de cualquier uso, incluido el comercial, que no está garantizado.
- Caveat para producción: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; no debe desplegarse como clasificador de producción sin validación propia.
- La reproducibilidad del endpoint depende de variables no publicadas en el artículo (longitud de entrenamiento, checkpointing, schedule de LR, weight decay, LR de cabeza y lambda), lo que limita cualquier comparación directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/accidentalgenius101/goodfire-legA-D-gradinput-lam10
- Artículo de referencia (Goodfire, "Shaping & Monitoring Models through their Internal Representations"): https://arxiv.org/abs/2611.07071
- Backbone DINOv2-small: https://huggingface.co/facebook/dinov2-small
- Dataset Waterbirds: no disponible en la información proporcionada
- Librería `reliance` de Goodfire: no disponible enlace directo en la información proporcionada
