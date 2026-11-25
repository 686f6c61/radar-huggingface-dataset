# accidentalgenius101/goodfire-legA-E-gradinput-lam0.3

## Resumen

`goodfire-legA-E-gradinput-lam0.3` es un artefacto de replicación científica, no un modelo de lenguaje. Consiste en un clasificador binario de imágenes (Waterbirds) construido sobre un encoder ViT-S/14 congelado o parcialmente ajustado (`facebook/dinov2-small`, 384 dimensiones de CLS) más una cabeza MLP GELU de 384→256→256→1. Lo publica el usuario `accidentalgenius101` como parte de un intento independiente de reproducir la Sección 2.1 del artículo "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071) de Goodfire, dedicada al *reliance shaping* mediante penalizaciones sobre representaciones internas.

El checkpoint corresponde al brazo A1 con penalización `gradinput` y lambda 0.3, semilla 0, refresco de dirección cada 100 pasos, 25.000 pasos de entrenamiento y batch 32, sobre los *splits* publicados de Waterbirds (2.066 imágenes de entrenamiento en dos grupos perfectamente confundidos; validación y test de 512 imágenes cada uno en cuatro grupos). El veredicto declarado por el autor es **FAILED, narrowed**: el fenómeno de dependencia del paper se reproduce como transitorio temprano (WGA de validación pico de 0.89-0.95 en cinco de seis brazos limpios dentro de los primeros ~1.200 pasos), pero decae mucho antes del punto final de 25.000 pasos, por lo que la persistencia en el endpoint no es reproducible con la información publicada.

Su relevancia es metodológica: documenta con detalle inusual un fallo de replicación, incluyendo las desviaciones de protocolo declaradas en `config.json` y una tabla completa de brazos de control. No es utilizable como modelo generativo ni como clasificador de propósito general; su valor está en la auditoría de protocolos de *reliance shaping* y en la trazabilidad de qué cantidades deja sin especificar el artículo original (longitud de entrenamiento, regla de checkpointing, schedule de LR, weight decay, LR de la cabeza y lambda).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (DINOv2-small, encoder) + cabeza MLP GELU 384→256→256→1 sobre token CLS normalizado |
| Parámetros totales | 22.221.185 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada 224×224 píxeles) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un *wrapper* de clasificación sobre `facebook/dinov2-small` (ViT-S/14, 384 dimensiones de embedding). La imagen se redimensiona a 224×224 y se procesa por el encoder; el token CLS normalizado alimenta una cabeza MLP de tres capas (384→256→256→1) entrenada desde cero. En este brazo (`gradinput`, lambda 0.3) el encoder no está congelado (`frozen=False`) y se aplica una penalización sobre el gradiente de entrada orientada a reducir la dependencia de características espurias (el fondo en Waterbirds). El entrenamiento usa AdamW con weight decay 0, batch 32, 25.000 pasos, LRs constantes separadas (encoder 1e-6, cabeza 1e-3) y refresco de la dirección de penalización cada 100 pasos, con semilla 0.

El dataset es Waterbirds con los *splits* publicados: 2.066 imágenes de entrenamiento en exactamente dos grupos perfectamente confundidos, y 512 de validación y 512 de test en cuatro grupos de 128 con identidades disjuntas. El autor declara explícitamente las cantidades que el paper no especifica en `config.json` bajo la clave `deviations`. La innovación técnica no está en la arquitectura sino en el protocolo: penalización `gradinput` (norma del gradiente de entrada) y `shuffle` como brazos de control, con una métrica L1 de AUROC de fondo medida a lo largo de la dirección de diferencia de medias del paso 0.

## Capacidades

- Clasificación binaria de imágenes de aves sobre Waterbirds (dos clases: ave de tierra vs. ave acuática), condicionada al dataset de entrenamiento.
- Extracción de representaciones vía el encoder DINOv2-small subyacente (384 dimensiones), reutilizable si se descongela o se usa como extractor congelado.
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto: no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades especiales más allá de la clasificación para la que fue entrenado.
- El checkpoint incorpora la cabeza entrenada; el encoder es el DINOv2-small estándar con los ajustes de este *run*.

## Casos de uso

- Auditoría de replicaciones: sirve como evidencia documental de que el endpoint de 93-97,7% de WGA del paper no se alcanza con el protocolo declarado, útil para investigadores que evalúen la reproducibilidad de *reliance shaping*.
- Estudio del transitorio de *reliance*: permite analizar la curva pico-decaimiento (WGA de validación 0.617 en el paso 200 para este brazo) y compararla con los otros cinco brazos limpios del mismo *run set*.
- Punto de partida para experimentos de regularización por gradiente de entrada: la cabeza y el *script* de entrenamiento pueden reutilizarse con otros lambdas (0.3, 1, 3, 10, 30) para reproducir la tabla de brazos.
- Control negativo en pipelines de *worst-group accuracy*: útil para validar que un *harness* de evaluación de WGA detecta correctamente el colapso de grupos minoritarios (endpoint test WGA 0.180 con grupos {0: 0.945, 1: 0.180, 2: 0.688, 3: 0.969}).
- Docencia sobre confounders en visión: Waterbirds con dos grupos perfectamente confundidos es un caso canónico para explicar sesgo de correlación espuria y su monitorización con AUROC de fondo (L1 test 0.161 en este brazo).
- Base para comparar métodos de *reliance shaping*: el checkpoint y su `config.json` con desviaciones declaradas permiten contrastar `gradinput` frente a `shuffle` bajo protocolos idénticos.
- Verificación de infraestructura: con 22,2 M de parámetros y 0,1 GB de repo, es un candidato ligero para probar *harnesses* de entrenamiento/evaluación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados del propio autor sobre Waterbirds (seed 0, endpoint en el paso 25.000, salvo el pico):

| Brazo | lambda | Pico WGA val (paso) | WGA val endpoint | WGA test endpoint | L1 test endpoint |
|---|---|---|---|---|---|
| gradinput | 10 (D3) | 0.945 (400) | 0.172 | 0.180 | 0.165 |
| gradinput | 1 (E wave 1) | 0.891 (200) | 0.164 | 0.141 | 0.152 |
| gradinput | 0.3 (E wave 2, este checkpoint) | 0.617 (200) | 0.188 | 0.180 | 0.161 |
| shuffle | 30 (D3) | 0.953 (1.000-1.200) | 0.000 | 0.000 | 0.548 |
| shuffle | 3 (E wave 1) | 0.938 (400) | 0.016 | 0.008 | 0.137 |
| shuffle | 1 (E wave 2) | 0.945 (200) | 0.375 | 0.422 | 0.550 |

Brazos de contexto (mismos *splits*, regímenes más cortos o congelados):

| Brazo de contexto | Protocolo | WGA test |
|---|---|---|
| ERM, régimen filed | LR único 1e-6 en todos los parámetros, 2.500 pasos, 3 semillas | 0.055 (media) |
| ERM, LRs separadas (D1) | encoder 1e-6 / cabeza 1e-3, 2.500 pasos, seed 0 | 0.172 |
| ERM congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, seed 0 | 0.375 |
| gradinput lambda 10 congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, seed 0 | 0.711 |

El paper reporta endpoints de 93-97,7% de WGA test para la Sección 2.1 con 3 semillas, bajo un protocolo cuyas cantidades clave no están publicadas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,2 M de parámetros (encoder ViT-S/14 + cabeza); en la práctica, el peso del repo es de 0,1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB libres es suficiente para inferencia y para reentrenar la cabeza; para reentrenar el encoder completo se recomienda al menos una RTX 3060/4060 Ti o superior.
- Cabe en GPU consumer: sí, en cualquier GPU con soporte CUDA razonable (GTX 1650 en adelante); el cuello de botella es el *dataloader* y el tamaño de batch, no la memoria.
- Opciones de despliegue: PyTorch nativo con `transformers`/`timm` para el encoder DINOv2 y carga directa de `safetensors`; no hay soporte empaquetado en vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput estimados: no disponibles en la información proporcionada; para ViT-S/14 a 224×224 en una GPU moderna se espera un throughput del orden de centenares a miles de imágenes por segundo, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodfire-legA-E-gradinput-lam0.3 | 22,2 M | 224×224 píxeles | Clasificación Waterbirds con *reliance shaping* | other | Hugging Face, 0 descargas |
| DINOv2-small (facebook) | ~22 M | 224×224 píxeles | *Backbone* visual auto-supervisado | Apache 2.0 (según el modelo base) | Hugging Face, ampliamente usado |
| Modelos de *reliance shaping* del paper original | no disponible | no disponible | Sección 2.1 Waterbirds | no disponible | No liberados por Goodfire (solo la librería `reliance`) |
| CLIP ViT-B/32 | ~151 M | 224×224 píxeles | Clasificación zero-shot multimodal | MIT (según variante) | Hugging Face |

La comparación directa con los modelos del paper no es posible porque Goodfire no liberó los checkpoints *shaped*. Frente a DINOv2-small, este artefacto añade una cabeza de clasificación y un protocolo de penalización, pero no mejora el *backbone*.

## Limitaciones y advertencias

- El autor declara el resultado como FAILED: ningún brazo limpio cumple la barra de escalado (WGA test endpoint ≥ 88% sin colapso tardío).
- El endpoint test WGA de este checkpoint es 0.180, muy por debajo del 93-97,7% reportado en el paper; el pico de 0.617 en validación es transitorio y no se mantiene.
- Riesgo de alucinación no aplicable (no genera texto), pero sí de sobreinterpretación: el modelo no es un clasificador de aves de propósito general ni un detector de confounders fuera de Waterbirds.
- Sesgo conocido y medido: colapso del grupo 1 (WGA 0.180 en test) frente a los grupos 0 y 3 (0.945 y 0.969), es decir, el modelo sigue apoyándose en el fondo en la mayoría de los casos.
- Restricciones de licencia: licencia `other`, sin términos comerciales explícitos en la información disponible; el uso comercial requiere revisar los términos del autor y del modelo base DINOv2.
- El protocolo de entrenamiento depende de cantidades no especificadas en el paper (longitud de entrenamiento, checkpointing, schedule de LR, weight decay, LR de cabeza, lambda); los resultados no son directamente comparables con los del artículo.
- El autor documenta defectos propios convictos (LR único de 1e-6 aplicado a todos los parámetros en el régimen filed, estimador de ruido promediando 8 muestras con signo antes de elevar al cuadrado) que afectaron a ejecuciones previas; este checkpoint es de la ola E wave 2 y ya incorpora correcciones.
- No hay métricas de latencia, throughput ni evaluación fuera de Waterbirds; no debe usarse como componente de producción sin reentrenamiento y validación propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/accidentalgenius101/goodfire-legA-E-gradinput-lam0.3
- Paper replicado (arXiv:2611.07071): https://arxiv.org/abs/2611.07071
- Modelo base DINOv2-small: https://huggingface.co/facebook/dinov2-small
- Librería `reliance` de Goodfire: no disponible en la información proporcionada (enlace directo no incluido en la model card)
- SPEC.md Leg A y `config.json` con desviaciones: incluidos en el repositorio del modelo
