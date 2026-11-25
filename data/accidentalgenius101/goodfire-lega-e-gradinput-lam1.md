# accidentalgenius101/goodfire-legA-E-gradinput-lam1

## Resumen

`goodfire-legA-E-gradinput-lam1` es un checkpoint de replicación independiente del experimento de "reliance shaping" descrito en la Sección 2.1 del artículo de Goodfire "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071). No es un modelo de lenguaje: es un clasificador binario construido sobre un encoder DINOv2-small congelado o parcialmente ajustado, entrenado para la tarea Waterbirds (clasificación de aves con sesgo de fondo correlacionado). El autor, `accidentalgenius101`, lo publica como artefacto de verificación de un resultado científico, no como modelo de propósito general.

El artefacto contiene 22.221.185 parámetros (mayoritariamente los pesos del encoder ViT-S/14 de DINOv2 más una cabeza MLP de lectura de tres capas) y ocupa 0,1 GB en el repositorio. La model card documenta un veredicto explícito de fallo parcial: el fenómeno de reliance se reproduce como transitorio temprano (WGA de validación pico de 0,89-0,95 en las primeras ~1.200 iteraciones) pero decae antes del punto final de 25.000 pasos, de modo que el resultado publicado (93-97,7% de WGA en test) no se replica con el protocolo declarado en el artículo.

Su relevancia es metodológica: ejemplifica una replicación rigurosa con barras pre-declaradas, análisis de causas convictas y refutadas, y declaración explícita de las cantidades que el artículo original deja sin especificar (longitud de entrenamiento, regla de checkpointing, schedule de LR, weight decay, LR de la cabeza y lambda).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (DINOv2-small) como encoder + cabeza MLP GELU (384 -> 256 -> 256 -> 1) sobre el token CLS normalizado de 384 dimensiones |
| Parametros totales | 22.221.185 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, imágenes de 224x224; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de imagen binario (o de cuatro grupos en evaluación) que combina un encoder vision transformer ViT-S/14 preentrenado (`facebook/dinov2-small`) con una cabeza de lectura MLP de tres capas (384 -> 256 -> 256 -> 1) con activación GELU aplicada sobre el token CLS de 384 dimensiones normalizado. Las imágenes se procesan a 224x224 con batch de 32. El entrenamiento se realiza sobre los splits "filed" de Waterbirds: 2.066 imágenes de entrenamiento en exactamente dos grupos perfectamente confundidos, y 512 de validación y 512 de test en cuatro grupos de 128 con identidades disjuntas.

La configuración concreta del brazo A1 es: penalización `gradinput`, lambda 1, semilla 0, refresh 100, encoder no congelado, 25.000 pasos, learning rates constantes separados (encoder 1e-6, cabeza 1e-3), weight decay 0 y optimizador AdamW (el artículo no especifica optimizador para la Sección 2.1). La innovación técnica del trabajo original es el "reliance shaping": una penalización durante el entrenamiento que empuja al modelo a no depender de direcciones internas correlacionadas con el atributo espurio (el fondo), medida mediante una dirección de diferencia de medias calculada en el paso 0 y refrescada cada 100 pasos. El autor documenta el mecanismo de fallo observado: la penalización aplasta la medida de reliance en ~200 pasos, pero después la sensibilidad de la cabeza vuelve a crecer 15-25x a LR constante (cabeza 1e-3, weight decay 0) y la dirección refrescada rota, produciendo el decaimiento del efecto.

## Capacidades

- Clasificación binaria de imágenes de aves (Waterbirds) con evaluación por grupos (peor precisión de grupo, WGA).
- Medición de dependencia de atributos espurios (fondo) mediante AUROC L1 a lo largo de la dirección de diferencia de medias del paso 0.
- Entrenamiento con penalizaciones de reliance (`gradinput`, `shuffle`) y control ERM.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.
- No dispone de modo thinking, audio ni funcionalidades conversacionales.

## Casos de uso

- Replicación de experimentos de robustez ante sesgo espurio: sirve como artefacto de referencia para verificar el fenómeno de reliance shaping de la Sección 2.1 del artículo de Goodfire bajo un protocolo documentado y con barras pre-declaradas.
- Auditoría metodológica de artículos: el repositorio y su model card permiten estudiar cómo declarar desviaciones del protocolo original y cómo distinguir un fallo de replicación atribuible al setup frente a una laguna de especificación del artículo.
- Investigación sobre dinámicas de entrenamiento: el patrón pico-decaimiento (WGA pico ~0,89 en el paso 200, colapso a 0,164 en el paso 25.000) es un caso de estudio sobre cómo el LR de la cabeza y el weight decay condicionan la persistencia de efectos de regularización.
- Estudio de estimadores de penalización: la model card documenta un error convicto en el estimador de ruido (promediado de 8 muestras con signo antes de elevar al cuadrado, funcional ~8x más débil) útil como referencia de implementación correcta.
- Docencia en machine learning sobre sesgo de dataset: Waterbirds con grupos perfectamente confundidos en entrenamiento es un ejemplo canónico de correlación espuria, y este checkpoint permite reproducir el régimen.
- Base para experimentos de reliance shaping con otros encoders: la cabeza MLP y el pipeline de penalización pueden reutilizarse sobre otros backbones ViT sustituyendo el encoder.

## Benchmarks y rendimiento

Resultados del brazo A1 (gradinput, lambda 1, semilla 0, endpoint en paso 25.000), sobre Waterbirds con splits filed:

| Metrica | Valor |
|---|---|
| Peak val WGA | 0,891 (paso 200) |
| Endpoint val WGA | 0,164 (grupos: 0,969 / 0,164 / 0,539 / 0,984) |
| Endpoint test WGA | 0,141 (grupos: 0,953 / 0,141 / 0,406 / 0,984) |
| L1 val (AUROC fondo, dirección paso 0) | 0,187 |
| L1 test (AUROC fondo, dirección paso 0) | 0,152 |

Comparativa de los seis brazos limpios del mismo protocolo (semilla 0, batch 32, refresh 100, weight decay 0, LR encoder 1e-6 / cabeza 1e-3, 25.000 pasos):

| Brazo | lambda | Peak val WGA (paso) | Endpoint val WGA | Endpoint test WGA | Endpoint test L1 |
|---|---|---|---|---|---|
| gradinput | 10 (D3) | 0,945 (400) | 0,172 | 0,180 | 0,165 |
| gradinput | 1 (E wave 1) | 0,891 (200) | 0,164 | 0,141 | 0,152 |
| gradinput | 0,3 (E wave 2) | 0,617 (200) | 0,188 | 0,180 | 0,161 |
| shuffle | 30 (D3) | 0,953 (1.000-1.200) | 0,000 | 0,000 | 0,548 |
| shuffle | 3 (E wave 1) | 0,938 (400) | 0,016 | 0,008 | 0,137 |
| shuffle | 1 (E wave 2) | 0,945 (200) | 0,375 | 0,422 | 0,550 |

Brazos de contexto (mismos splits, regímenes más cortos o congelados):

| Brazo de contexto | Protocolo | Test WGA |
|---|---|---|
| ERM, régimen filed | LR único 1e-6 en todos los parámetros, 2.500 pasos, 3 semillas | 0,055 (media) |
| ERM, LRs separados (D1) | encoder 1e-6 / cabeza 1e-3, 2.500 pasos, semilla 0 | 0,172 |
| ERM congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, semilla 0 | 0,375 |
| gradinput congelado lambda 10 (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, semilla 0 | 0,711 |

El artículo original reporta endpoints de 93-97,7% de WGA en test para la Sección 2.1 con 3 semillas, bajo un protocolo cuyas cantidades decisivas no están especificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,2 M de parámetros; holgadamente por debajo de 2 GB incluyendo activaciones a 224x224 y batch moderado.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también CPU para inferencia en lote pequeño.
- Cabe en cualquier GPU consumer, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: carga directa con `safetensors` y PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo de texto).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodfire-legA-E-gradinput-lam1 | 22,2 M | Clasificación Waterbirds con reliance shaping | no aplica | other | Hugging Face |
| facebook/dinov2-small | ~22 M | Backbone ViT auto-supervisado de propósito general | no aplica | Apache 2.0 (según el modelo base, no confirmado en esta ficha) | Hugging Face |
| Modelos Waterbirds ERM de referencia | no disponible | Clasificación con sesgo espurio | no aplica | no disponible | no disponible |

No se dispone de comparativas publicadas de rendimiento frente a otros artefactos de replicación de este artículo en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara el resultado como FAILED (narrowed): el endpoint publicado (93-97,7% WGA en test) no se reproduce; el efecto existe solo como transitorio temprano.
- El checkpoint tiene un rendimiento final pésimo en el grupo minoritario (WGA de test 0,141; grupo 1 con 0,141), por lo que no es utilizable como clasificador en producción.
- El modelo está entrenado exclusivamente sobre Waterbirds con dos grupos perfectamente confundidos; no generaliza a otras tareas ni datasets.
- La licencia es "other" sin texto de licencia en la información disponible; el uso comercial no está claro y requiere consulta directa al autor.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero el repositorio no incluye pipeline ni demo, y su uso requiere reconstruir el código de entrenamiento y evaluación a partir de la model card.
- El autor documenta defectos convictos en su propio setup (LR único de 1e-6 aplicado a todos los parámetros en el régimen original, estimador de ruido promediado antes de elevar al cuadrado) que condicionan la interpretación de resultados previos.
- La reproducibilidad está limitada por las cantidades no especificadas en el artículo original (longitud de entrenamiento, regla de checkpointing, schedule de LR, weight decay, LR de cabeza y lambda).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/accidentalgenius101/goodfire-legA-E-gradinput-lam1
- Artículo replicado (arXiv:2611.07071): https://arxiv.org/abs/2611.07071
- Modelo base del encoder: https://huggingface.co/facebook/dinov2-small
- Repositorio `reliance` de Goodfire: no disponible en la información proporcionada
