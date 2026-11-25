# accidentalgenius101/legA-E-gradinput-lam1

## Resumen

`legA-E-gradinput-lam1` es un checkpoint de replicación independiente del artículo "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071) de Goodfire, concretamente de la Sección 2.1 sobre *reliance shaping* en el conjunto de datos Waterbirds. No es un modelo de lenguaje: es un clasificador de imagen binario construido sobre un encoder ViT-S/14 (DINOv2-small) congelable y una cabeza MLP entrenada desde cero, diseñado para estudiar si una penalización sobre el gradiente de entrada reduce la dependencia de atajos espurios (el fondo) en la clasificación.

El checkpoint documenta un resultado negativo: el fenómeno de *reliance* del artículo se reproduce como transitorio temprano (WGA de validación pico de 0,891 en el paso 200), pero decae hasta 0,164 en validación y 0,141 en test al llegar al paso 25.000. El autor concluye que el protocolo del artículo no especifica variables decisivas (longitud de entrenamiento, regla de checkpointing, schedule de LR, weight decay, LR de la cabeza y lambda), lo que impide reproducir los endpoints publicados del 93-97,7% de WGA en test.

Es relevante ahora porque ejemplifica un caso de replicación fallida rigurosa y trazable, con hipótesis pre-declaradas, brazos de control y causas convictas documentadas. Su utilidad no es como modelo desplegable, sino como artefacto de investigación sobre metodología de replicación y sobre la fragilidad de los resultados de *reliance shaping*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (DINOv2-small) como encoder + cabeza MLP GELU (384 → 256 → 256 → 1) sobre el token CLS normalizado |
| Parametros totales | 22.221.185 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagen, entrada 224x224) |
| Tipos de cuantizacion | no disponible (pesos safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades de texto) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un encoder ViT-S/14 preentrenado (facebook/dinov2-small, 384 dimensiones de embedding) con una cabeza MLP de tres capas (384 → 256 → 256 → 1) entrenada desde cero. El encoder puede congelarse o afinarse; en este brazo concreto (`frozen=False`) se afina con un LR constante de 1e-6, mientras que la cabeza usa 1e-3. El entrenamiento usa AdamW con weight decay 0, batch 32, 25.000 pasos, imágenes de 224x224 y un *refresh* de la dirección de penalización cada 100 pasos. La penalización aplicada es `gradinput` con lambda 1, semilla 0.

El conjunto de datos es Waterbirds con splits "filed": 2.066 imágenes de entrenamiento en exactamente 2 grupos perfectamente confundidos, y 512 de validación y 512 de test en 4 grupos de 128 con identidades disjuntas. El artículo de referencia propone una penalización que desacopla la sensibilidad del modelo respecto a la dirección de diferencia de medias (el atajo de fondo); este checkpoint implementa esa penalización de forma idéntica línea a línea según el autor (hipótesis H1 exonerada). No hay RLHF, DPO ni datos de texto: es un experimento controlado de *reliance shaping*.

## Capacidades

- Clasificación binaria de imágenes de aves (Waterbirds) en presencia de correlación espuria entre clase y fondo.
- Medición de *worst-group accuracy* (WGA) por grupo de atributo, con lectura por paso de entrenamiento.
- Cálculo de AUROC de fondo (L1) a lo largo de la dirección de diferencia de medias para cuantificar la dependencia del atajo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No tiene modo *thinking*, visión general, audio ni ninguna capacidad generativa.
- Sirve como artefacto de replicación con configuración y desviaciones declaradas en `config.json`.

## Casos de uso

- Replicación metodológica de resultados publicados: el checkpoint sirve para auditar la Sección 2.1 de arXiv:2611.07071 y documentar qué variables del protocolo (longitud, checkpointing, schedule) son necesarias para obtener los endpoints reportados.
- Estudio de dinámicas de *reliance*: permite analizar la curva de WGA por paso y caracterizar el transitorio temprano (pico en el paso 200) frente a la decadencia posterior, útil para investigar mecanismos de *peak-decay*.
- Control negativo en experimentos de *shortcut learning*: al ser un brazo con resultado negativo, sirve como referencia para comparar nuevas penalizaciones o regímenes de entrenamiento.
- Docencia en metodología de replicación: ilustra cómo pre-declarar barras de éxito (sanity, REPLICATED, hold bar) y cómo convictar causas con brazos de control (ERM, frozen, distintos lambda).
- Análisis de sensibilidad de la cabeza: el hallazgo de que la sensibilidad de la cabeza se re-incrementa 15-25x a LR constante y weight decay 0 es reutilizable para diseñar schedules alternativos.
- Validación de implementaciones de penalizaciones: la comparación línea a línea con la librería `reliance` de Goodfire permite verificar implementaciones propias de `gradinput` y `shuffle`.

## Benchmarks y rendimiento

Resultados reportados por el autor en Waterbirds (seed 0, endpoint en paso 25.000 salvo donde se indique):

| Brazo | lambda | Peak val WGA (paso) | Endpoint val WGA | Endpoint test WGA | Endpoint test L1 |
|---|---|---|---|---|---|
| gradinput | 10 (D3) | 0,945 (400) | 0,172 | 0,180 | 0,165 |
| gradinput | 1 (E wave 1) | 0,891 (200) | 0,164 | 0,141 | 0,152 |
| gradinput | 0,3 (E wave 2) | 0,617 (200) | 0,188 | 0,180 | 0,161 |
| shuffle | 30 (D3) | 0,953 (1.000-1.200) | 0,000 | 0,000 | 0,548 |
| shuffle | 3 (E wave 1) | 0,938 (400) | 0,016 | 0,008 | 0,137 |
| shuffle | 1 (E wave 2) | 0,945 (200) | 0,375 | 0,422 | 0,550 |

Brazos de contexto:

| Brazo | Protocolo | Test WGA |
|---|---|---|
| ERM, régimen filed | LR único 1e-6, 2.500 pasos, 3 seeds | 0,055 (media) |
| ERM, LRs separados (D1) | encoder 1e-6 / cabeza 1e-3, 2.500 pasos, seed 0 | 0,172 |
| ERM congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, seed 0 | 0,375 |
| gradinput lambda 10 congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, seed 0 | 0,711 |

El artículo original reporta endpoints de 93-97,7% de WGA en test para la Sección 2.1 con 3 semillas, bajo un protocolo no completamente especificado. Este checkpoint no alcanza esos valores en ningún brazo limpio y el autor declara el resultado como FAILED, narrowed.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,2 M de parámetros, ~89 MB de pesos) más el coste de activaciones para 224x224; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090); para entrenamiento, una RTX 3090/4090 o A100 acelera los 25.000 pasos.
- Cabe en GPU consumer: sí, en todas las GPU modernas con soporte CUDA.
- Opciones de despliegue: PyTorch estándar y `transformers` (cargando DINOv2-small y la cabeza); no hay variantes GGUF, vLLM ni Ollama publicadas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legA-E-gradinput-lam1 | 22,2 M | no aplica | Clasificación Waterbirds con *reliance shaping* | other | Hugging Face |
| facebook/dinov2-small | ~22 M | no aplica | Backbone ViT auto-supervisado | Apache 2.0 | Hugging Face |
| Modelos *shaped* de Goodfire (Sección 2.1) | no disponible | no aplica | Clasificación Waterbirds con *reliance shaping* | no disponible | No liberados (solo se liberó la librería `reliance`) |

No se dispone de datos de rendimiento de los modelos *shaped* originales de Goodfire más allá de los endpoints publicados en el artículo (93-97,7% test WGA). La comparación directa con alternativas de la misma categoría es limitada porque no hay otros checkpoints públicos de replicación de esta sección.

## Limitaciones y advertencias

- Resultado negativo: ningún brazo limpio alcanza la barra de hold pre-declarada (endpoint test WGA ≥ 88% sin colapso tardío); el autor declara el experimento FAILED, narrowed.
- El checkpoint no es un modelo de propósito general: solo clasifica aves en Waterbirds y no debe usarse fuera de ese dominio.
- Sesgos conocidos: el modelo aprende el atajo de fondo (fondo-clase) y su WGA por grupo es muy desigual (por ejemplo, grupo 1 con 0,164 frente a grupo 0 con 0,969 en validación).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí hay riesgo de sobreinterpretar las métricas de WGA como evidencia de robustez general.
- Limitaciones de contexto e idioma: no aplica; el modelo no procesa texto ni tiene ventana de contexto.
- Restricciones de licencia: licencia "other" sin términos comerciales explícitos; conviene contactar al autor antes de cualquier uso comercial.
- Caveat de producción: los pesos corresponden a un régimen concreto (lambda 1, seed 0, 25.000 pasos) y no son representativos de un modelo entrenado para despliegue; el propio autor señala que el protocolo del artículo deja variables sin especificar, lo que impide garantizar reproducibilidad de los endpoints publicados.
- Dependencia de la implementación de la penalización: aunque H1 fue exonerada, cualquier reutilización debe verificar la implementación de `gradinput` y `shuffle` contra la librería `reliance`.

## Enlaces

- Hugging Face: https://huggingface.co/accidentalgenius101/legA-E-gradinput-lam1
- Paper de referencia: https://arxiv.org/abs/2611.07071
- Librería `reliance` de Goodfire: no disponible en la información proporcionada (el autor indica que Goodfire la liberó, sin URL en la model card)
