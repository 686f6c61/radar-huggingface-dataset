# ceselder/muse-spark-olens-lens

## Resumen

Muse Spark olens (Oracle Lens) es un adaptador LoRA de interpretabilidad diseñado para leer y verbalizar el estado interno del modelo Muse Spark Open 816B-A42B de Meta. Desarrollado por el usuario ceselder, el adaptador transforma una activación de una capa concreta del modelo base en una única línea de texto que describe lo que el modelo está a punto de generar, actuando como un "oráculo" de su intención interna. Se publica en dos variantes: una de una sola capa (capa 40) y otra multicapa que puede leer las capas 8, 16, 24, 32, 40, 48 y 56 mediante una etiqueta de capa en el prompt y una cabeza afín de entrada por capa.

El modelo base sobre el que opera es Muse Spark Open 816B-A42B, un transformer de 62 capas con arquitectura MoE latente de 256 expertos y top-8, con residual con puerta por canal y checkpoint en NVFP4 (533 GB). El adaptador se entrena en dos brazos que solo difieren en la inicialización del LoRA: uno con inicialización fresca (arm F) y otro con un inversor del reconstructor (arm I), seguido de un ajuste por RL con CISPO e importance sampling truncado contra un reconstructor texto-a-activación.

La relevancia de esta ficha radica en que constituye una de las primeras implementaciones de lentes de interpretabilidad portadas a un modelo MoE de gran escala con cuantización NVFP4, y en que documenta de forma cuantitativa el efecto de la inicialización del adaptador sobre la calidad de la reconstrucción. Los resultados en WorkspaceBench muestran una mejora de 0,289 a 0,440 (sin variantes tipográficas) tras 300 pasos de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA r64/a16) sobre transformer MoE latente del modelo base Muse Spark Open 816B-A42B (62 capas, 256 expertos, top-8, residual con puerta por canal) |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base es de 816B) |
| Parametros activos | 42B (del modelo base, según nomenclatura A42B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El checkpoint base es NVFP4; el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponibles |
| Licencia | muse-model-license (licencia propia del modelo Muse) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un rsLoRA de rango 64 y alpha 16 montado sobre el modelo base congelado. La variante de una sola capa convierte una activación de la capa 40 en una línea de texto precedida de `* `, mientras que la variante multicapa incorpora una etiqueta de capa en el prompt y una cabeza afín de entrada por capa para leer las capas 8, 16, 24, 32, 40, 48 y 56. El entrenamiento SFT se realizó sobre 2.899.968 filas de pares (activación, continuación generada por el propio Muse), extraídas de una cosecha de 4,58 millones de filas, en una sola pasada de 1.416 pasos con 2.048 filas por paso.

Los dos brazos del entrenamiento difieren únicamente en la inicialización del LoRA: el arm F parte de una inicialización fresca y el arm I parte de un inversor del reconstructor entrenado previamente (538.624 filas, 610.803 vectores únicos). Tras el SFT, ambos brazos se ajustan con RL (CISPO con importance sampling truncado) contra el reconstructor texto-a-activación `ceselder/muse-spark-olens-reconstructor`, con una recompensa de reconstrucción pura. La inicialización con inversor aporta una ventaja de aproximadamente 1,5 nats en el paso 0 del SFT (3,987 frente a 5,495 de entropía cruzada en held-out), que se reduce a 0,0023 nats al final de la pasada (2,7366 frente a 2,7389), y tras el RL ambos brazos quedan empatados en la métrica de selección (0,3307 frente a 0,3296).

## Capacidades

- Verbalización de activaciones internas: convierte una activación de la capa 40 (o de las capas 8 a 56 en la variante multicapa) en una línea de texto que describe la continuación inminente del modelo.
- Lectura multicapa: la variante multicapa permite consultar siete capas distintas mediante una etiqueta en el prompt y una cabeza afín por capa.
- Reconstrucción texto-a-activación: el ecosistema incluye un reconstructor que genera vectores de activación a partir de texto, usado como recompensa durante el RL.
- Interpretabilidad comparativa: permite comparar el comportamiento interno entre distintas capas y entre los dos brazos de inicialización.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: modo de verbalización de un solo tiro (one-bullet lens) y variante multicapa con cabeza afín de entrada.

## Casos de uso

- Auditoría de intenciones en producción: el adaptador permite inspeccionar qué está a punto de generar el modelo base antes de que emita la respuesta, lo que resulta útil para detectar derivas o contenido no deseado en pipelines de generación.
- Investigación en interpretabilidad mecanicista: los investigadores pueden correlacionar activaciones de capas intermedias con conceptos textuales concretos, facilitando el estudio de cómo se representa la información a lo largo de las 62 capas del modelo base.
- Comparación de estrategias de inicialización: el par de brazos F e I, entrenados con datos y hiperparámetros idénticos, permite aislar el efecto de la inicialización del LoRA sobre la calidad de la verbalización.
- Depuración de modelos MoE: al operar sobre un MoE latente de 256 expertos, la lente ayuda a identificar qué información se conserva en la activación agregada frente a la que se dispersa entre expertos.
- Evaluación de checkpoints durante el entrenamiento: la lente puede aplicarse a distintos checkpoints del modelo base para medir la estabilidad de sus representaciones internas a lo largo del entrenamiento.
- Docencia y divulgación: la verbalización de una línea facilita explicar de forma intuitiva qué ocurre dentro de un modelo de gran escala sin necesidad de visualizar vectores de alta dimensión.
- Control de calidad de adaptadores: al ser un adaptador PEFT, puede integrarse en flujos de evaluación automatizada que verifiquen la coherencia interna de un modelo antes de desplegarlo.

## Benchmarks y rendimiento

| Metrica | arm F (SFT) | arm I (SFT) | arm F (RL paso 300) | arm I (RL paso 300) |
|---|---|---|---|---|
| Entropía cruzada held-out (nats/token) | 2,7389 | 2,7366 | No disponible | No disponible |
| Reconstrucción held-out (reward / ccos) | 0,1854 / 0,404 | 0,1841 / 0,402 | 0,3307 / 0,565 | 0,3296 / 0,564 |
| WorkspaceBench sin variantes tipográficas (21 familias) | 0,289 | 0,289 | 0,440 | 0,442 |
| WorkspaceBench todas (24 familias) | 0,274 | 0,271 | 0,481 | No disponible |
| WorkspaceBench solo workspace (11 familias) | 0,141 | 0,143 | No disponible | No disponible |
| Tasa de alucinación | 0,475 | 0,501 | No disponible | No disponible |

Como referencia, la lente de Kimi-K3 con la misma receta pasó de 0,311 / 0,287 a 0,398 / 0,432, y la de GLM-5.3 de 0,296 / 0,271 a 0,440 / 0,469. La variante multicapa alcanzó una reconstrucción media held-out por capa de 0,2734 en el paso 300.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 10,7 GB en el repositorio, pero requiere cargar el modelo base Muse Spark Open 816B-A42B, cuyo checkpoint NVFP4 pesa 533 GB.
- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint base en NVFP4 de 533 GB exige un entorno multi-GPU de alta gama.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del base, se requiere un clúster con GPUs de centro de datos (A100, H100 o superiores) y paralelismo de tensor.
- ¿Cabe en GPU de consumo? No, dado el tamaño del modelo base.
- Opciones de despliegue: la librería declarada es PEFT, por lo que se integra con el stack de Hugging Face Transformers y PEFT; no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muse Spark olens (este) | 816B (42B activos) | No disponible | muse-model-license | Hugging Face, adaptador PEFT |
| Kimi-K3 olens (ceselder) | No disponible | No disponible | No disponible | Hugging Face |
| GLM-5.3 olens (ceselder) | No disponible | No disponible | No disponible | Hugging Face |
| Qwen3.6-27B olens (ceselder) | 27B | No disponible | No disponible | Hugging Face |

Las tres lentes comparables pertenecen a la misma familia de recetas y al mismo autor; los datos de parámetros, contexto y licencia de las alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La tasa de alucinación del SFT es elevada (0,475 en arm F y 0,501 en arm I), por lo que la verbalización puede describir contenido que el modelo no va a generar realmente.
- Los checkpoints con mejores resultados en el bench (arm F paso 250: 0,459 / 0,498; arm I paso 150: 0,445 / 0,488) fueron seleccionados sobre el propio bench, por lo que sus cifras son optimistas por construcción y no se distribuyen.
- La selección de los checkpoints publicados se hizo por reconstrucción held-out, no por rendimiento en el bench, lo que puede implicar un rendimiento inferior al mostrado en la tabla de benchmarks.
- La licencia muse-model-license es una licencia propia del modelo Muse; deben revisarse sus términos antes de cualquier uso comercial.
- No se declaran idiomas soportados, lo que limita la evaluación de su comportamiento multilingüe.
- El adaptador depende de un modelo base de 816B en NVFP4, lo que restringe su uso a infraestructuras de gran escala.
- La variante multicapa solo cubre siete capas concretas (8, 16, 24, 32, 40, 48 y 56), no la totalidad de las 62 capas del modelo base.
- No se documentan resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque la lente es una herramienta de interpretabilidad, no un modelo generativo de propósito general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ceselder/muse-spark-olens-lens
- Reconstructor: https://huggingface.co/ceselder/muse-spark-olens-reconstructor
- Colección Muse Spark olens: https://huggingface.co/collections/ceselder/muse-spark-olens-6adfd563a2ccaa4deb299019
- Lente Kimi-K3: https://huggingface.co/ceselder/kimi-k3-olens-lens
- Lente GLM-5.3: https://huggingface.co/ceselder/glm-5.3-olens-lens
- Lente Qwen3.6-27B: https://huggingface.co/ceselder/olens-qwen3.6-27b-l42
- Informe con curvas de WorkspaceBench: http://5.78.192.0/reports/view/muse-spark-olens/report.html
