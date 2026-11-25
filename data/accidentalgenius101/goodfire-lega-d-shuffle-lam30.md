# accidentalgenius101/goodfire-legA-D-shuffle-lam30

## Resumen

`accidentalgenius101/goodfire-legA-D-shuffle-lam30` no es un modelo de lenguaje generativo, sino un artefacto de replicación científica: un checkpoint de un clasificador binario construido sobre un backbone congelable `facebook/dinov2-small` (ViT-S/14) y un cabezal MLP entrenado desde cero. Lo publica el usuario independiente `accidentalgenius101` como parte de un intento de reproducir la Sección 2.1 (Waterbirds reliance shaping) del artículo de Goodfire "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071). El checkpoint corresponde al brazo A1 (penalización `shuffle`, lambda 30, seed 0) del conjunto de ejecuciones D3.

El interés del artefacto es metodológico, no de rendimiento: la model card documenta de forma explícita un veredicto de replicación fallida ("FAILED, narrowed"), con la trayectoria del fenómeno de reliance reproduciéndose como transitorio temprano (WGA de validación pico 0,953 en el paso 1.000-1.200) pero sin persistir hasta el endpoint de 25.000 pasos (WGA de test 0,000). El autor atribuye la discrepancia con los endpoints publicados (93-97,7 % de WGA de test) a huecos de especificación en el artículo original: longitud total de entrenamiento, regla de checkpointing, schedule de LR, weight decay, LR del cabezal y lambda no se declaran en el texto.

Por tanto, esta ficha describe un checkpoint de investigación de 22,2 M de parámetros totales, 0,1 GB de repositorio, licencia `other` y sin pipeline declarado. No debe confundirse con un modelo listo para producción: es una pieza de evidencia empírica sobre reproducibilidad en interpretabilidad y shaping de representaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (`facebook/dinov2-small`) como encoder + cabezal MLP GELU (384 -> 256 -> 256 -> 1) sobre el token CLS normalizado de 384 dimensiones |
| Parametros totales | 22.221.185 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imágenes 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un encoder ViT-S/14 (`facebook/dinov2-small`, patch 14, imágenes de 224x224) con un cabezal de lectura MLP de tres capas (384 -> 256 -> 256 -> 1) con activación GELU, aplicado sobre el token CLS normalizado. El entrenamiento se realizó sobre el dataset Waterbirds con splits "filed" (2.066 imágenes de entrenamiento en exactamente 2 grupos perfectamente confundidos; validación y test de 512 imágenes cada uno, 4 grupos de 128, identidades disjuntas), batch 32, 25.000 pasos, AdamW con weight decay 0, refresh 100, `frozen=False` y learning rates constantes separados (encoder 1e-6, valor declarado en el artículo; cabezal 1e-3). La penalización aplicada es `shuffle` con lambda 30.

La innovación técnica replicada es el *reliance shaping*: una penalización sobre la dependencia del modelo respecto de atributos espurios (fondo) frente a los causales (forma del pájaro), medida mediante la dirección de diferencia de medias en el paso 0 y evaluada con AUROC L1 y worst-group accuracy (WGA). La model card documenta que el efecto aparece como transitorio temprano y luego decae: la penalización aplasta la medida de reliance en ~200 pasos, tras lo cual la sensibilidad del cabezal vuelve a crecer 15-25x a LR constante y la dirección refrescada rota. El autor identifica además un defecto propio corregido (estimador de ruido que promediaba 8 muestras con signo antes de elevar al cuadrado, ~8x más débil que el funcional definido en el artículo) y un defecto de protocolo (lambda* seleccionado en un régimen con cabezal roto).

## Capacidades

- Clasificación binaria de imágenes (pájaro de agua vs. pájaro terrestre) sobre el dataset Waterbirds.
- Medición de reliance mediante AUROC L1 sobre la dirección de diferencia de medias (val 0,536, test 0,548 en este checkpoint).
- Evaluación de worst-group accuracy (WGA) por grupo (4 grupos en val/test).
- No soporta generación de texto, código, matemáticas ni razonamiento simbólico.
- No soporta tool calling, function calling ni uso como agente.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la clasificación visual descrita.

## Casos de uso

- Replicación de experimentos de interpretabilidad: sirve como checkpoint de referencia para comparar la dinámica de reliance shaping frente a los brazos `gradinput` (lambda 10, 1, 0,3) y `shuffle` (lambda 3, 1) documentados en la misma model card.
- Auditoría de reproducibilidad: permite verificar de forma independiente la afirmación de la Sección 2.1 del artículo arXiv:2611.07071 y documentar qué cantidades no declaradas (longitud de entrenamiento, checkpointing, schedule de LR, weight decay, LR del cabezal, lambda) deciden el resultado.
- Estudio de dinámicas de decaimiento: útil para analizar el fenómeno de pico temprano (WGA 0,953 en paso 1.000-1.200) seguido de colapso (WGA 0,000 en paso 25.000) bajo LR constante y weight decay 0.
- Docencia sobre sesgos de atajo: el régimen con 2 grupos perfectamente confundidos en entrenamiento ilustra cómo un modelo aprende correlaciones espurias y cómo una penalización puede revertirlas temporalmente.
- Desarrollo de harnesses de evaluación: el protocolo descrito (splits filed, refresh 100, L1 AUROC, WGA por grupo) puede reutilizarse para construir suites de test de métodos de shaping.
- Investigación sobre especificación de protocolos: caso de estudio concreto de cómo omisiones en la descripción de un método impiden la replicación de endpoints aunque la trayectoria cualitativa se reproduzca.

## Benchmarks y rendimiento

Los datos disponibles son resultados del propio autor bajo su harness, no comparaciones con modelos de terceros.

| Metrica | Valor |
|---|---|
| Peak val WGA (paso 1.000-1.200) | 0,953 |
| Endpoint val WGA (paso 25.000) | 0,000 (grupos {0: 1,000, 1: 1,000, 2: 0,000, 3: 0,000}) |
| Endpoint test WGA (paso 25.000) | 0,000 (mismos grupos) |
| L1 val (AUROC, dirección diferencia de medias paso 0) | 0,536 |
| L1 test (AUROC) | 0,548 |

Comparativa de brazos limpios del mismo harness (seed 0, batch 32, refresh 100, weight decay 0, LRs encoder 1e-6 / cabezal 1e-3, endpoint 25.000 pasos):

| Brazo | lambda | Peak val WGA (paso) | Endpoint val WGA | Endpoint test WGA | Endpoint test L1 |
|---|---|---|---|---|---|
| gradinput | 10 | 0,945 (400) | 0,172 | 0,180 | 0,165 |
| gradinput | 1 | 0,891 (200) | 0,164 | 0,141 | 0,152 |
| gradinput | 0,3 | 0,617 (200) | 0,188 | 0,180 | 0,161 |
| shuffle | 30 | 0,953 (1.000-1.200) | 0,000 | 0,000 | 0,548 |
| shuffle | 3 | 0,938 (400) | 0,016 | 0,008 | 0,137 |
| shuffle | 1 | 0,945 (200) | 0,375 | 0,422 | 0,550 |

Brazos de contexto (mismos splits, regímenes más cortos o congelados):

| Brazo de contexto | Protocolo | Test WGA |
|---|---|---|
| ERM, régimen filed | LR único 1e-6 en todos los parámetros, 2.500 pasos, 3 seeds | 0,055 (media) |
| ERM, LRs separados (D1) | encoder 1e-6 / cabezal 1e-3, 2.500 pasos, seed 0 | 0,172 |
| Frozen ERM (D2) | encoder congelado, cabezal 1e-3, 2.500 pasos, seed 0 | 0,375 |
| Frozen gradinput lambda 10 (D2) | encoder congelado, cabezal 1e-3, 2.500 pasos, seed 0 | 0,711 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en el rango de 1-2 GB en fp32 para los 22,2 M de parámetros (0,1 GB de repositorio); no requiere GPU dedicada para inferencia puntual.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; para reproducción del entrenamiento completo (25.000 pasos, batch 32, imágenes 224x224, encoder ViT-S/14) se recomienda al menos una GPU con 16-24 GB.
- Cabe en GPU consumer: sí, sin problemas, incluidas GPUs de gama media y media-baja.
- Opciones de despliegue: al no haber pipeline declarado, el uso previsto es carga directa de safetensors con PyTorch/Hugging Face `transformers` o `timm`; no consta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de visión de este tamaño).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodfire-legA-D-shuffle-lam30 | 22,2 M | imagen 224x224 | Clasificación Waterbirds + reliance shaping | other | Hugging Face |
| facebook/dinov2-small | 22,1 M | imagen 224x224 (ViT-S/14) | Embeddings visuales auto-supervisados | Apache 2.0 (según el modelo base) | Hugging Face |
| Brazos gradinput / shuffle del mismo autor | mismo backbone | imagen 224x224 | Clasificación Waterbirds + reliance shaping | other | No publicados como repos separados (según la model card) |
| Modelos shaped de Goodfire (Sección 2.1) | no disponible | no disponible | Reliance shaping | no disponible | No publicados (solo se liberó la librería `reliance`) |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas; cualquier uso como LLM es inadecuado.
- El propio autor declara el resultado como "FAILED, narrowed": el endpoint de la Sección 2.1 no se reproduce en este harness.
- El checkpoint tiene WGA de test 0,000 en el endpoint; no es útil como clasificador desplegable.
- Sesgos conocidos: entrenado sobre Waterbirds con 2 grupos perfectamente confundidos, el modelo aprende correlaciones espurias (fondo) que la penalización solo revierte temporalmente.
- Riesgo de sobreinterpretación: el pico de WGA (0,953) es un transitorio de 200-1.200 pasos, no un resultado estable; citarlo como endpoint sería incorrecto.
- Limitaciones de protocolo: el autor identifica un defecto propio corregido (estimador de ruido ~8x más débil) y un defecto de selección de lambda* en régimen con cabezal roto; los resultados de brazos afectados deben leerse con cautela.
- Licencia `other`: no se especifican términos de uso comercial; debe consultarse el repositorio antes de cualquier uso más allá de investigación.
- Sin pipeline declarado, sin descargas ni likes: no hay evidencia de validación por terceros.
- El artículo de referencia (arXiv:2611.07071) tiene fecha posterior a la creación del checkpoint según los metadatos, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/accidentalgenius101/goodfire-legA-D-shuffle-lam30
- Artículo de referencia: https://arxiv.org/abs/2611.07071
- Modelo base del encoder: https://huggingface.co/facebook/dinov2-small
- Dataset Waterbirds (referencia del benchmark): no disponible en la información proporcionada
- Librería `reliance` de Goodfire: no disponible como enlace directo en la información proporcionada
- Repositorio o demo del autor: no disponible
