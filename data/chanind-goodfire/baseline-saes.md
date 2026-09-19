# chanind-goodfire/baseline-saes

## Resumen

`chanind-goodfire/baseline-saes` no es un modelo de lenguaje, sino un repositorio de autoencoders dispersos (SAE, *sparse autoencoders*) entrenados sobre las activaciones del bloque decodificador 12 de `google/gemma-2-2b`. Lo publica el usuario chanind-goodfire y su finalidad es servir como línea base reproducible para investigación en interpretabilidad: cada SAE descompone una activación de 2.304 dimensiones en 16.384 latentes dispersas, lo que permite analizar qué características ha aprendido el modelo base en esa capa concreta.

El repositorio incluye variantes BatchTopK y Matryoshka BatchTopK, con presupuestos de 50M y 500M de tokens de activación, todas de anchura 16.384 y k=100. Las Matryoshka usan anchuras anidadas [4096, 16384], por lo que pueden evaluarse truncadas a 4.096 latentes. El entrenamiento se realizó con SAELens 6.51.1 sobre `monology/pile-uncopyrighted` en streaming, con semilla 0, contexto de 1.024 tokens y lotes de 4.096 tokens de activación; los pesos se publican en safetensors y SAELens los carga como SAE JumpReLU de inferencia.

Su interés actual es doble: ofrece un punto de comparación controlado (misma capa, anchura, k e hiperparámetros) frente a otras colecciones públicas de SAE, y documenta todos los detalles en `cfg.json` y `training_config.json`. Como contrapartida, no se declara licencia ni idiomas, no hay evaluación de calidad publicada y el repositorio registra cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso (SAE) de una capa; variantes BatchTopK y Matryoshka BatchTopK |
| Parámetros totales | No publicados. Estimación derivada de las dimensiones del export BatchTopK: 2 × (2.304 × 16.384) + 16.384 + 2.304 ≈ 75,5 M de parámetros por SAE |
| Parámetros activos | No aplica (no es un modelo MoE); en inferencia se activan del orden de k=100 latentes por token según el umbral aprendido |
| Longitud de contexto | 1.024 tokens (longitud usada para extraer las activaciones durante el entrenamiento) |
| Tipos de cuantización | No disponible; el entrenamiento usa parámetros de la SAE en float32 y no se documentan cuantizaciones del export |
| Idiomas soportados | No disponible; depende de `monology/pile-uncopyrighted` y del modelo base, ambos mayoritariamente en inglés |
| Licencia | No disponible; la model card no especifica licencia y el modelo base `google/gemma-2-2b` está sujeto a los términos de uso de Gemma de Google |
| Formato de pesos | safetensors (`sae_weights.safetensors`, `sparsity.safetensors`) junto con `cfg.json` y `training_config.json` |
| Anchura (número de latentes) | 16.384 en todas las variantes; Matryoshka con prefijos anidados [4.096, 16.384] |
| k de entrenamiento | 100 (BatchTopK) |
| Dimensión de activación | 2.304 |
| Capa objetivo | `model.layers.12` (bloque decodificador) de `google/gemma-2-2b` |
| Modelo base | `google/gemma-2-2b` |
| Semilla | 0 |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

Cada artefacto es un SAE de una sola capa con encoder y decoder lineales sobre activaciones de 2.304 dimensiones y 16.384 latentes. En BatchTopK la selección de latentes activos se hace con una operación top-k a nivel de lote sobre los 4.096 tokens de activación de cada batch, lo que permite que el número de latentes activos por token varíe ligeramente. La variante Matryoshka BatchTopK añade una estructura de anchuras anidadas `[4096, 16384]`, de forma que el prefijo de 4.096 latentes puede evaluarse por separado; conviene tener en cuenta que la información proporcionada no confirma si ese prefijo reutiliza las primeras 4.096 latentes del diccionario completo.

Los datos de entrenamiento provienen de `monology/pile-uncopyrighted` en streaming (sin cifras de composición publicadas). La configuración es idéntica entre variantes salvo el presupuesto: semilla 0, contexto de 1.024 tokens, lotes de 4.096 tokens de activación, ejecución del modelo con Hugging Face y autocasting en bfloat16, parámetros de la SAE en float32 y *learning rate* 3e-4. Las ejecuciones de 500M decaen el *learning rate* durante el último 20 % del entrenamiento, mientras que las de 50M usan una tasa constante, por lo que ambos regímenes no son directamente comparables. El recuento real de tokens puede superar el presupuesto nominal en menos de 4.096 tokens porque las actualizaciones se hacen por lotes completos, y queda registrado en `training_config.json`.

Una particularidad relevante para la reproducibilidad es que SAELens exporta estos modelos entrenados con BatchTopK como SAE JumpReLU de inferencia, con umbral aprendido durante el entrenamiento. Esto implica que el L0 observado en inferencia puede no coincidir con el k=100 nominal, y que la arquitectura de entrenamiento real solo consta en los metadatos de `cfg.json`.

## Capacidades

- Descomposición de activaciones: codifica una activación de 2.304 dimensiones del bloque decodificador 12 de Gemma-2-2b en un vector disperso de 16.384 latentes y la reconstruye con el decoder.
- Control de dispersión: BatchTopK con k=100 selecciona los latentes más activos por lote de tokens, con un número efectivo de activaciones por token ligeramente variable.
- Evaluación a varias anchuras: la variante Matryoshka define prefijos anidados de [4.096, 16.384] latentes, de modo que puede evaluarse truncada a 4.096 sin reentrenar.
- Inferencia como JumpReLU: los modelos entrenados con BatchTopK se cargan como SAE JumpReLU de inferencia con umbral aprendido.
- Integración con `sae-lens`: carga directa mediante `SAE.load_from_disk` y descarga selectiva de subdirectorios con `snapshot_download`.
- Trazabilidad: cada export incluye `cfg.json` y `training_config.json` con la configuración de entrenamiento y el recuento real de tokens.
- No soporta: generación de texto, razonamiento, código, matemáticas, visión, *tool calling*, *function calling*, agentes, *multi-step reasoning* ni capacidades multilingües propias. Todo ello corresponde al modelo base, no a la SAE.

## Casos de uso

- Interpretabilidad mecanicista de la capa 12: la SAE permite enumerar y etiquetar las características que Gemma-2-2b representa en el bloque decodificador 12, un punto intermedio del modelo útil para estudiar cómo se transforma la representación capa a capa.
- Descubrimiento y etiquetado de características: activando el modelo base con *prompts* controlados y midiendo qué latentes se disparan, se pueden identificar latentes asociados a conceptos concretos (sintaxis, entidades, estilos) y construir un diccionario anotado.
- Intervención sobre activaciones (*steering*): las direcciones del decoder pueden sumarse o restarse de la activación de la capa 12 para amplificar o suprimir un latente, y medir el efecto causal sobre la salida de Gemma-2-2b. Es el caso de uso más directo de un SAE en experimentos de control.
- Análisis de sesgos y seguridad: dado que el corpus es `pile-uncopyrighted`, se pueden buscar latentes correlacionados con grupos demográficos, registros lingüísticos o contenido dañino, y cuantificar su peso en la representación interna del modelo base.
- Comparación de arquitecturas de SAE: disponer de BatchTopK y Matryoshka BatchTopK sobre la misma capa, anchura y k permite aislar el efecto de la arquitectura de entrenamiento en métricas de interpretabilidad, algo poco habitual en colecciones públicas.
- Estudio del régimen de entrenamiento: comparar los presupuestos de 50M y 500M tokens (con la salvedad del distinto esquema de *learning rate*) permite analizar cómo mejora la calidad y la estabilidad de los latentes con más datos.
- Sondas ligeras sobre features: las activaciones latentes pueden usarse como representación de baja dimensión y alta interpretabilidad para clasificadores lineales de detección (por ejemplo, toxicidad o dominio temático) en lugar de la activación densa de 2.304 dimensiones.
- Reproducibilidad y docencia: con semilla fija, hiperparámetros documentados y estructura de directorios explícita, el repositorio sirve como material de partida para replicar un *pipeline* completo de SAELens o para formación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de reconstrucción (varianza explicada, error de reconstrucción), L0 medido en inferencia, número de latentes muertas ni comparaciones cuantitativas con otras colecciones de SAE.

## Requisitos de hardware

- SAE de anchura 16.384 y activación de 2.304: aproximadamente 75,5 M de parámetros, unos 302 MB en float32 y unos 151 MB en float16/bfloat16.
- Variante Matryoshka truncada a 4.096 latentes: del orden de 18,9 M de parámetros, unos 75 MB en float32 (asumiendo reutilización del prefijo anidado, extremo no confirmado en la información disponible).
- El ejemplo de carga de la model card usa `device="cpu"`, por lo que la SAE en sí cabe en memoria principal de cualquier equipo convencional y no requiere GPU.
- El coste real está en el modelo base: ejecutar `google/gemma-2-2b` requiere aproximadamente 5,2 GB en bfloat16 o en torno a 1,5-2 GB con cuantización de 4 bits, de modo que cabe en GPU de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4090. No se requieren A100 ni H100 salvo para reentrenar SAE a gran escala.
- Opciones de despliegue: `sae-lens` (con `huggingface_hub.snapshot_download`) para la SAE; `transformers`, vLLM, TGI, llama.cpp u Ollama para el modelo base del que se extraen las activaciones.
- Latencia y throughput: no disponible. No se han publicado mediciones; computacionalmente, la codificación de la SAE es un producto matricial de 2.304 × 16.384 por token, despreciable frente a la pasada completa del modelo base.

## Comparativa con modelos similares

| Artefacto | Anchura (latentes) | k | Capa | Arquitectura de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `baseline-saes` BatchTopK | 16.384 | 100 | 12 de Gemma-2-2b | BatchTopK | No disponible | safetensors en Hugging Face, cargable con sae-lens |
| `baseline-saes` Matryoshka BatchTopK | 16.384 (prefijos [4.096, 16.384]) | 100 | 12 de Gemma-2-2b | Matryoshka BatchTopK | No disponible | safetensors en Hugging Face, cargable con sae-lens |
| Otras colecciones públicas de SAE sobre Gemma-2 (por ejemplo, las de tipo Gemma Scope) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye especificaciones verificables de alternativas, por lo que la comparación cuantitativa con otras familias de SAE queda como no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni puede usarse de forma autónoma. Solo tiene sentido acoplado a `google/gemma-2-2b` y a la capa 12.
- Especificidad total: los latentes solo son válidos para la capa 12 de Gemma-2-2b. No son transferibles a otras capas ni a otros modelos sin reentrenar.
- Sesgos heredados: el corpus `monology/pile-uncopyrighted` procede de fuentes web, con sobrerrepresentación del inglés y sesgos propios de ese tipo de datos.
- Ausencia de métricas de calidad: no se publican varianza explicada, L0 real, número de latentes muertas ni evaluaciones de interpretabilidad, lo que impide juzgar la fidelidad de la descomposición.
- Discrepancia entre k nominal y L0 real: el umbral se aprende durante el entrenamiento y SAELens exporta los modelos como JumpReLU de inferencia, por lo que cualquier análisis comparativo debería reportar el L0 medido y no el k=100 nominal.
- Licencia no declarada: no hay licencia explícita, lo que supone un riesgo legal para uso comercial. Al derivar de Gemma-2-2b, pueden además aplicar los términos de uso de Gemma de Google.
- Sin validación comunitaria: cero descargas y cero likes, con creación y última actualización el mismo día (18 de septiembre de 2026).
- Disponibilidad parcial: la model card indica que solo se suben modelos completos y que los presupuestos disponibles deben consultarse en el árbol de ficheros, por lo que el presupuesto de 50M podría no estar publicado.
- Comparabilidad limitada entre presupuestos: las ejecuciones de 500M y 50M usan esquemas de *learning rate* distintos (decaimiento frente a tasa constante), por lo que sus resultados no son directamente equiparables.
- Cobertura idiomática de facto limitada al inglés del corpus, pese a que el dato de idiomas figura como no disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/chanind-goodfire/baseline-saes
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Dataset de entrenamiento: https://huggingface.co/datasets/monology/pile-uncopyrighted
- Librería citada en la model card (SAELens 6.51.1): https://github.com/decoderesearch/SAELens
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a páginas de soporte de Microsoft sin relación con el contenido.
