# accidentalgenius101/legA-E-shuffle-lam3

## Resumen

`legA-E-shuffle-lam3` es un checkpoint de replicación independiente del artículo "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071) de Goodfire, concretamente de la Sección 2.1 sobre *reliance shaping* en el conjunto de datos Waterbirds. No es un modelo de lenguaje: es un clasificador binario de imagen construido sobre un backbone ViT-S/14 (`facebook/dinov2-small`) congelable y una cabeza MLP de lectura desde cero (384 → 256 → 256 → 1) sobre el token CLS normalizado. Lo publica el usuario `accidentalgenius101` como artefacto de replicación, no como modelo listo para producción.

El checkpoint corresponde al brazo A1 (penalización `shuffle`, lambda 3, semilla 0, refresh 100, encoder no congelado) entrenado durante 25.000 pasos sobre los splits "filed" de Waterbirds. Su relevancia es metodológica: documenta un fallo de replicación acotado del artículo original. El fenómeno de *reliance* (alta precisión en el peor grupo, WGA) se reproduce como transitorio temprano —pico de WGA de validación de 0,938 en el paso 400—, pero decae hasta 0,016 en validación y 0,008 en test al llegar al endpoint de 25.000 pasos, lejos del 93-97,7 % que reporta el paper.

El valor del artefacto es, por tanto, negativo y diagnóstico: demuestra que la persistencia del efecto en el endpoint no es reproducible con la información publicada, porque el paper omite cantidades decisivas del protocolo (longitud total de entrenamiento, regla de checkpointing, schedule de LR, weight decay, LR de la cabeza y lambda). El propio autor marca el resultado como FAILED, narrowed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (DINOv2-small) como encoder + cabeza MLP GELU (384 → 256 → 256 → 1) sobre token CLS normalizado |
| Parametros totales | 22.221.185 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un encoder ViT-S/14 preentrenado (`facebook/dinov2-small`, 384 dimensiones de embedding) con una cabeza de lectura MLP de tres capas con activación GELU entrenada desde cero. Las imágenes se procesan a 224x224 y el clasificador opera sobre el token CLS normalizado. El entrenamiento usa AdamW sin weight decay, batch de 32, learning rates constantes y separados (encoder 1e-6, cabeza 1e-3), con 25.000 pasos y refresh de la dirección de penalización cada 100 pasos. La penalización es de tipo `shuffle` con lambda 3 sobre la medida de *reliance*.

El régimen de entrenamiento es una reconstrucción del protocolo del paper, ya que este no especifica varias cantidades clave. El autor documenta las desviaciones en `config.json` bajo la clave `deviations`. Los datos son los splits "filed" de Waterbirds: 2.066 imágenes de entrenamiento en dos grupos perfectamente confundidos, y 512 de validación y 512 de test en cuatro grupos de 128 con identidades disjuntas. No hay RLHF, DPO ni ajuste por preferencias; es entrenamiento supervisado con una penalización regularizadora sobre representaciones internas.

## Capacidades

- Clasificación binaria de imagen (ave acuática vs. ave terrestre) sobre el dataset Waterbirds.
- Extracción de representaciones internas vía el token CLS de DINOv2-small (384 dimensiones).
- Entrenamiento con *reliance shaping*: penalización que modifica la dirección de sensibilidad del modelo para reducir la dependencia de rasgos espurios (fondo).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo *thinking*, visión general, audio ni otras capacidades especiales más allá de la clasificación de imagen para la que fue entrenado.

## Casos de uso

- Replicación de resultados académicos: sirve como artefacto de referencia para verificar el fenómeno de *reliance shaping* de la Sección 2.1 del paper de Goodfire, con todos los hiperparámetros documentados en la model card.
- Estudio de dinámicas de entrenamiento: el checkpoint y sus métricas por paso permiten analizar el transitorio temprano (pico de WGA en el paso 400) y la posterior decadencia del efecto, un fenómeno que el paper no describe.
- Auditoría de protocolos de investigación: útil para identificar qué cantidades no especificadas (longitud de entrenamiento, checkpointing, LR schedule) determinan la reproducibilidad de un resultado publicado.
- Investigación sobre sesgos de atajo (*shortcut learning*): el modelo ilustra cómo una penalización sobre representaciones puede colapsar la precisión en el peor grupo si el régimen de entrenamiento no se controla.
- Docencia en metodología de ML: ejemplo concreto de replicación fallida con análisis de causas convictas y exoneradas, útil para formar investigadores en rigor experimental.
- Punto de partida para experimentos de *reliance shaping*: el código y la configuración permiten reentrenar con protocolos alternativos (encoder congelado, distintas lambdas) para explorar cuándo persiste el efecto.
- Análisis de calibración y sensibilidad de cabezas de lectura: la cabeza MLP desde cero sobre un encoder congelado o parcialmente entrenado permite estudiar cómo evoluciona la sensibilidad de la cabeza a lo largo del entrenamiento.

## Benchmarks y rendimiento

Los datos disponibles son resultados del propio autor sobre Waterbirds, no comparaciones con otros modelos publicados.

| Metrica (brazo A1, shuffle lambda 3, seed 0) | Valor |
|---|---|
| WGA de validación pico | 0,938 (paso 400) |
| WGA de validación en endpoint (paso 25.000) | 0,016 |
| WGA de test en endpoint (paso 25.000) | 0,008 |
| L1 (AUROC de fondo) validación | 0,143 |
| L1 (AUROC de fondo) test | 0,137 |

| Brazo (todos con protocolo idéntico salvo lambda) | Lambda | WGA val pico (paso) | WGA val endpoint | WGA test endpoint | L1 test endpoint |
|---|---|---|---|---|---|
| gradinput | 10 (D3) | 0,945 (400) | 0,172 | 0,180 | 0,165 |
| gradinput | 1 (E wave 1) | 0,891 (200) | 0,164 | 0,141 | 0,152 |
| gradinput | 0,3 (E wave 2) | 0,617 (200) | 0,188 | 0,180 | 0,161 |
| shuffle | 30 (D3) | 0,953 (1.000-1.200) | 0,000 | 0,000 | 0,548 |
| shuffle | 3 (E wave 1) | 0,938 (400) | 0,016 | 0,008 | 0,137 |
| shuffle | 1 (E wave 2) | 0,945 (200) | 0,375 | 0,422 | 0,550 |

| Brazo de contexto | Protocolo | WGA test |
|---|---|---|
| ERM, régimen filed | LR único 1e-6, 2.500 pasos, 3 semillas | 0,055 (media) |
| ERM, LRs separados (D1) | encoder 1e-6 / cabeza 1e-3, 2.500 pasos, seed 0 | 0,172 |
| ERM congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, seed 0 | 0,375 |
| gradinput lambda 10 congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, seed 0 | 0,711 |

El paper original reporta endpoints de 93-97,7 % de WGA de test para la Sección 2.1 con 3 semillas, pero bajo un protocolo cuyas cantidades clave no están especificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,2 M de parámetros; en la práctica, el cuello de botella es la activación del ViT-S/14 a 224x224, que requiere aproximadamente 1-2 GB con batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650 o superiores.
- Opciones de despliegue: PyTorch nativo con `transformers` y `timm` (cargando DINOv2-small más la cabeza); exportación a ONNX o TorchScript para inferencia en CPU. No aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; para un ViT-S/14 a 224x224 en una GPU moderna se espera del orden de milisegundos por imagen, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legA-E-shuffle-lam3 | 22,2 M | imagen 224x224 | Clasificación binaria Waterbirds con reliance shaping | other | Hugging Face |
| facebook/dinov2-small | ~22 M | imagen 224x224 | Backbone ViT auto-supervisado, features generales | Apache 2.0 (según el modelo base) | Hugging Face |
| Modelos del paper Goodfire (no publicados) | no disponible | no disponible | Clasificación Waterbirds con reliance shaping | no disponible | No liberados; solo se publicó la librería `reliance` |
| ERM sobre DINOv2-small (brazo de contexto D1) | 22,2 M | imagen 224x224 | Clasificación Waterbirds sin penalización | no disponible | Reentrenable con el mismo harness |

La comparación directa con los modelos del paper no es posible porque Goodfire solo liberó la librería `reliance`, no los checkpoints acondicionados.

## Limitaciones y advertencias

- El propio autor declara el resultado como FAILED: el endpoint de 25.000 pasos no alcanza el 88 % de WGA de test exigido por el criterio predeclarado (hold bar).
- El fenómeno de *reliance* solo se reproduce como transitorio temprano (pasos 200-1.200); decae hasta casi cero en el endpoint, por lo que el checkpoint no es útil como modelo entrenado para clasificar Waterbirds con robustez de grupo.
- El autor identifica un defecto propio convicto: en el régimen original del 2026-11-23 se aplicó un LR único de 1e-6 a todos los parámetros, incluida la cabeza desde cero, lo que impedía el entrenamiento (ERM test WGA 5,5 % frente al 51,6 % del paper).
- El paper original omite cantidades decisivas del protocolo (longitud de entrenamiento, regla de checkpointing, LR schedule, weight decay, LR de cabeza y lambda), lo que impide una replicación fiel sin inventar un protocolo caritativo.
- La licencia es "other" sin texto adicional visible en la información disponible; no se puede confirmar el uso comercial. Verificar el archivo de licencia del repositorio antes de cualquier uso.
- El modelo está entrenado sobre Waterbirds, un dataset con grupos perfectamente confundidos en entrenamiento; generaliza mal fuera de ese dominio y no debe usarse como clasificador de aves en producción.
- Riesgo de alucinación no aplica (no genera texto), pero sí hay riesgo de sobreinterpretar las métricas: el pico de WGA de 0,938 es una lectura de trayectoria, no una afirmación de endpoint.
- No hay información sobre sesgos demográficos ni de otro tipo; el dataset es de imágenes de aves y el modelo no procesa personas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/accidentalgenius101/legA-E-shuffle-lam3
- Paper de referencia (Goodfire, arXiv:2611.07071): https://arxiv.org/abs/2611.07071
- Modelo base DINOv2-small: https://huggingface.co/facebook/dinov2-small
- Librería `reliance` de Goodfire: no disponible en la información proporcionada
- Repositorio del harness de replicación: no disponible en la información proporcionada
- Dataset Waterbirds: no disponible en la información proporcionada
