# dipta007/dagger-12B_GRPO

## Resumen

DAGGER-12B-GRPO es un modelo de razonamiento matemático desarrollado por dipta007, presentado en EMNLP 2026 (Findings) bajo el marco DAGGER (Distractor-Aware Graph Generation for Executable Reasoning). El modelo parte de la arquitectura Gemma-3-12B-Instruct y se entrena exclusivamente con Group Relative Policy Optimization (GRPO), sin fase previa de fine-tuning supervisado (SFT). Su objetivo es reformular problemas matemáticos como grafos computacionales ejecutables en formato JSON, identificando explícitamente los nodos que actúan como distractores y los que forman parte de la ruta de cálculo final.

La relevancia de este modelo reside en que demuestra que GRPO por sí solo puede aprender a generar grafos computacionales con una señal de recompensa basada en la ejecución, aunque la robustez frente a distractores es inferior a la de su variante con inicialización SFT. Está orientado principalmente al bengalí, aunque también soporta inglés, y busca reducir el coste de razonamiento: el marco DAGGER afirma lograr un 89 % menos de tokens que los modelos de razonamiento convencionales manteniendo una precisión comparable. Se distribuye con licencia Gemma y un tamaño de 12 187 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-12B) |
| Parametros totales | 12 187 325 040 (12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Gemma-3-12B soporta 128K) |
| Tipos de cuantizacion | No disponibles oficialmente; FriendliAI ofrece FP4, FP8, INT4 e INT8 en su servicio |
| Idiomas soportados | Bengalí (bn), inglés (en) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DAGGER-12B-GRPO hereda la arquitectura transformer decoder-only de Gemma-3-12B-Instruct. Se entrena directamente desde el modelo base, sin fase de SFT, utilizando GRPO como único algoritmo de aprendizaje por refuerzo. El entrenamiento emplea LoRA con rango 64 y alpha 128, un tamaño de lote global de 32 y 8 generaciones por prompt. La señal de recompensa combina tres componentes: formato (el JSON debe ser válido y topológicamente ordenado), ejecución (el grafo debe evaluarse sin errores) y corrección (el resultado final debe coincidir con la respuesta esperada).

El dataset de entrenamiento es DistractMath-Bn, creado por el autor, que incluye problemas matemáticos en bengalí con distractores. La innovación principal del marco DAGGER es el modelado explícito de distractores: cada nodo del grafo computacional se etiqueta como `distractor: true` si no participa en la ruta de cálculo final. Esto permite al modelo distinguir información relevante de información irrelevante en el enunciado del problema.

## Capacidades

- Generación de grafos computacionales en JSON que representan la solución paso a paso de problemas matemáticos.
- Razonamiento aritmético con operaciones como suma, resta, multiplicación, división, raíz cuadrada, potencias, módulo, GCD, LCM, redondeos y estadísticas (suma, media, mínimo, máximo).
- Detección y etiquetado de nodos distractores, lo que permite distinguir información relevante de la irrelevante en el enunciado.
- Soporte multilingüe para bengalí e inglés, con especialización en bengalí.
- Generación de grafos topológicamente ordenados con un único nodo `final_result`.
- No soporta tool calling estándar, agentes ni capacidades multimodales en este fine-tune.

## Casos de uso

- **Tutoría matemática en bengalí**: el modelo puede resolver problemas de aritmética de nivel escolar y mostrar la solución como un grafo computacional, lo que permite explicar el razonamiento paso a paso.
- **Verificación de razonamiento con distractores**: en entornos de evaluación donde los problemas incluyen datos irrelevantes, el modelo identifica y marca los distractores, ayudando a depurar la lógica de sistemas de razonamiento automático.
- **Generación de datos de entrenamiento**: los grafos generados pueden servir como supervisión para otros modelos de razonamiento, ya que proporcionan una representación estructurada y ejecutable de la solución.
- **Evaluación de robustez en modelos de matemáticas**: al comparar el rendimiento con y sin distractores, se puede medir la sensibilidad de un sistema a la información irrelevante, útil en investigación.
- **Integración en pipelines de razonamiento simbólico**: el grafo generado puede ejecutarse con un intérprete externo para verificar la respuesta, combinando el modelo con un motor de cálculo determinista.
- **Investigación académica en RL**: como modelo de ablación, permite estudiar el efecto de la inicialización SFT frente al entrenamiento GRPO directo en tareas de razonamiento estructurado.

## Benchmarks y rendimiento

El modelo se evaluó en los conjuntos MGSM y MSVAMP, tanto con el enunciado original como con distractores añadidos. No se publican comparaciones con otros modelos en la información disponible.

| Dataset | Original | +Distractor | Drop |
|---|---|---|---|
| MGSM | 67,6 | 48,4 | 19,2 |
| MSVAMP | 75,0 | 59,6 | 15,4 |

Ablación: efecto de la inicialización SFT frente a GRPO directo.

| Inicialización | MGSM (+Distractor) | MSVAMP (+Distractor) |
|---|---|---|
| Base → GRPO | 48,4 | 59,6 |
| SFT → GRPO | 64,0 (+15,6) | 66,8 (+7,2) |

El estudio concluye que la inicialización con SFT proporciona un andamiaje que estabiliza el aprendizaje con GRPO y mejora la robustez frente a distractores entre 7 y 16 puntos.

## Requisitos de hardware

- **VRAM estimada**: ~24 GB en FP16 (12B parámetros), ~12 GB en FP8, ~6-7 GB en INT4.
- **GPU recomendadas**: A100 40 GB, H100, RTX 4090 (24 GB) para FP16; GPUs con 12 GB (RTX 3080, A10) para cuantización de 8 bits; GPUs con 6-8 GB para cuantización de 4 bits.
- **Cabe en GPU de consumo**: sí, con cuantización. Una RTX 4090 o RTX 3090 puede ejecutarlo en FP16 si se usa offloading parcial; con INT4 cabe en GPUs de 8 GB.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, Hugging Face TGI, y FriendliAI (con soporte de cuantización FP4/FP8/INT4/INT8 y batching continuo).
- **Latencia y throughput**: no disponibles en la información del modelo; dependerá de la cuantización y el hardware. FriendliAI indica inferencia de baja latencia en su plataforma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MGSM (+Distr.) | MSVAMP (+Distr.) | Licencia |
|---|---|---|---|---|---|
| **DAGGER-12B-GRPO** | 12B | No disponible | 48,4 | 59,6 | Gemma |
| DAGGER-12B-SFT-GRPO | 12B | No disponible | 64,0 | 66,8 | Apache-2.0 |
| Gemma-3-12B-Instruct (base) | 12B | 128K | No disponible | No disponible | Gemma |

El modelo base Gemma-3-12B-Instruct no tiene resultados públicos en MGSM/MSVAMP en la información proporcionada. La comparación directa entre DAGGER-12B-GRPO y su variante con SFT inicial muestra que el SFT previo aporta entre 7 y 16 puntos de precisión en presencia de distractores.

## Limitaciones y advertencias

- **Robustez limitada sin SFT**: el modelo pierde 19 puntos en MGSM y 15,4 en MSVAMP cuando se añaden distractores, lo que indica una sensibilidad significativa a información irrelevante.
- **Especialización en bengalí**: el modelo está entrenado principalmente para problemas en bengalí; su rendimiento en inglés puede ser inferior, aunque se declara soporte bilingüe.
- **Salida en formato JSON**: si el modelo no produce un grafo JSON válido, la solución no es ejecutable y el resultado puede ser inutilizable. Existe riesgo de alucinación en la estructura de nodos.
- **Acceso restringido**: el modelo requiere aceptar los términos de uso de Google para Gemma antes de la descarga.
- **Licencia Gemma**: los términos de la licencia Gemma de Google incluyen restricciones de uso comercial y requisitos de atribución; no es una licencia Apache.
- **Modelo de investigación**: con 8 descargas y 0 likes, es un modelo académico con poca validación en producción.
- **Sin datos de contexto**: no se ha publicado la longitud de contexto efectiva tras el fine-tuning; se recomienda no asumir que hereda los 128K del base sin verificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dipta007/dagger-12B_GRPO
- Paper (arXiv 2601.06853): https://arxiv.org/abs/2601.06853
- Página del proyecto: https://dipta007.github.io/DAGGER/
- Repositorio GitHub: https://github.com/dipta007/DAGGER
- Dataset DistractMath-Bn: https://huggingface.co/datasets/dipta007/DistractMath-Bn
- Variante con SFT + GRPO: https://huggingface.co/dipta007/dagger-12B_SFT_GRPO
- Inferencia en FriendliAI: https://friendli.ai/models/dipta007/dagger-12B_GRPO
