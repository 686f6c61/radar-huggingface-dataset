# dwightware4/sae-pythia-160m-32k-3seeds

## Resumen

`dwightware4/sae-pythia-160m-32k-3seeds` es un conjunto de tres sparse autoencoders (SAE) entrenados sobre las activaciones de la capa `layers.5.mlp` del modelo de lenguaje `EleutherAI/pythia-160m`. Fue desarrollado por dwightware4 como una réplica del estudio de Paulo y Belrose (2025), *Sparse Autoencoders Trained on the Same Data Learn Different Features*, que investiga si SAEs entrenados con exactamente los mismos datos e hiperparámetros, pero con distinta inicialización aleatoria, aprenden las mismas características latentes.

Cada SAE tiene una dimensión de entrada de 768 (correspondiente a la salida del MLP de Pythia-160M) y expande a 32 768 latentes mediante activación TopK con k=32. Los tres modelos son idénticos salvo por la semilla aleatoria de inicialización (0, 1 y 2), y se entrenaron sobre ~8 000 millones de tokens del dataset `monology/pile-uncopyrighted` (una versión del Pile con cinco subconjuntos eliminados). El repositorio incluye los pesos en formato `safetensors` junto con sus configuraciones JSON, y se distribuye bajo licencia Apache-2.0.

Este recurso es relevante para la comunidad de interpretabilidad mecánica porque permite estudiar la reproducibilidad de los SAEs, un componente clave para entender cómo los modelos de lenguaje representan conceptos internos. Los resultados replican los del paper: aproximadamente el 56 % de los latentes de un SAE no tiene contraparte cercana en los otros dos, a pesar de entrenarse sobre los mismos datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE) con activación TopK y decoder con norma unitaria |
| Parámetros totales | No disponible (cada SAE tiene 768×32768 ≈ 25,1 millones de parámetros de encoder más decoder y bias, pero no se especifica el total exacto en la información) |
| Parámetros activos | No aplica (no es un modelo MoE; la activación TopK activa 32 latentes por token) |
| Longitud de contexto | 2048 tokens (contexto de entrenamiento del SAE; el modelo base Pythia-160M soporta 2048) |
| Tipos de cuantización | No disponible (los pesos se almacenan en precisión completa, formato `safetensors`) |
| Idiomas soportados | No disponible (el modelo base Pythia-160M fue entrenado principalmente en inglés; el SAE opera sobre activaciones, no sobre texto directamente) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (archivo `sae.safetensors` por seed) y `cfg.json` |

## Arquitectura y entrenamiento

Cada SAE es un autoencoder disperso con una capa de encoder lineal (768 → 32768) seguida de una activación TopK que selecciona los k=32 latentes con mayor pre-activación, y un decoder lineal (32768 → 768) con restricción de norma unitaria en sus filas. La pérdida es la fracción de varianza no explicada (FVU) y se optimiza con Adam. El entrenamiento se realizó sobre las activaciones de salida de la capa `layers.5.mlp` de Pythia-160M, extraídas de secuencias de 2048 tokens con un batch de 32 secuencias, durante aproximadamente 122 071 pasos (3 906 250 secuencias, ~8 000 millones de tokens). Los datos provienen de `monology/pile-uncopyrighted`, shard `train/00.jsonl.zst`, que es una copia del Pile sin cinco subconjuntos (Books3, BookCorpus2, OpenSubtitles, YTSubtitles y OWT2). El orden de tokens no coincide con el que Pythia-160M vio durante su preentrenamiento, lo que es relevante para la interpretación de los resultados.

Los tres SAEs se entrenaron en un único proceso compartiendo el mismo dataloader, garantizando que la única diferencia entre ellos sea la semilla de inicialización. El entrenamiento se realizó con la librería `eai-sparsify` versión 1.3.3.

## Capacidades

- **Análisis de interpretabilidad**: permite extraer características latentes dispersas de las activaciones del MLP de Pythia-160M, representando los conceptos internos que el modelo utiliza para procesar texto.
- **Comparación de reproducibilidad**: al disponer de tres seeds, permite estudiar la estabilidad de los SAEs bajo inicializaciones distintas, cuantificando qué fracción de latentes son compartidos entre seeds y cuáles son específicos de cada uno.
- **Extracción de activaciones dispersas**: el método `encode()` devuelve los valores y los índices de los latentes activos (TopK), así como las pre-activaciones completas, facilitando análisis posteriores.
- **Integración con la librería sparsify**: compatible con `eai-sparsify` para cargar desde Hugging Face o desde disco, y con APIs estándar de SAEs.
- **No es un modelo generativo**: no genera texto ni tiene capacidades de razonamiento, código o tool calling; su función es puramente analítica sobre representaciones internas.
- **Multilingüismo limitado**: depende del modelo base Pythia-160M, que fue entrenado principalmente en inglés; el SAE hereda las representaciones de ese modelo.

## Casos de uso

- **Investigación en interpretabilidad mecánica**: los SAEs permiten descomponer las activaciones de un modelo de lenguaje en características discretas, facilitando el estudio de cómo se representan conceptos como género, sintaxis o hechos. Este conjunto con tres seeds es útil para validar si las características descubiertas son robustas o artefactos de inicialización.
- **Estudio de reproducibilidad de SAEs**: dado que los tres modelos difieren solo en la semilla, se pueden utilizar para cuantificar el solapamiento entre latentes (por ejemplo, mediante alineación húngara) y reproducir los resultados del paper de Paulo y Belrose.
- **Análisis de monosemanticidad**: los latentes TopK suelen ser más monosemánticos que los neuronas densas; se pueden inspeccionar los patrones de activación para identificar características interpretables en el MLP de Pythia-160M.
- **Auditoría de sesgos en representaciones**: al examinar qué latentes se activan ante diferentes inputs, se pueden detectar sesgos latentes (por ejemplo, asociaciones estereotipadas) que el modelo base haya aprendido.
- **Desarrollo de métodos de edición de conocimiento**: los SAEs se usan como base para técnicas de intervención en representaciones (por ejemplo, modificar latentes para cambiar el comportamiento del modelo); este conjunto permite probar si las intervenciones son consistentes entre seeds.
- **Evaluación de métricas de alineación**: los datos de similitud coseno entre seeds (media ~0.61 en encoder y ~0.69 en decoder) sirven como referencia para desarrollar nuevas métricas de comparación de SAEs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque este modelo no es un LLM generativo. En su lugar, la información disponible incluye métricas de alineación entre los tres seeds, que son las relevantes para su propósito:

| Par de seeds | Latentes compartidos | Acuerdo entre matchings encoder/decoder |
|---|---|---|
| seed0 – seed1 | 43,6 % | 78,6 % |
| seed0 – seed2 | 43,7 % | 78,7 % |
| seed1 – seed2 | 43,9 % | 78,2 % |

La similitud coseno media de los latentes emparejados es de aproximadamente 0,61 (encoder) y 0,69 (decoder), consistente con la Figura A3 del paper. El valor de referencia del paper es 42 % de latentes compartidos, y este modelo obtiene valores ligeramente superiores (43,6–43,9 %). Aproximadamente el 56 % de los latentes de cada SAE no tiene contraparte cercana en los otros.

## Requisitos de hardware

- **Inferencia del SAE**: el modelo es muy ligero (cada SAE tiene ~25 millones de parámetros, el repositorio total ocupa 0,6 GB). Se puede ejecutar en CPU sin problemas para procesar activaciones almacenadas.
- **Extracción de activaciones del modelo base**: para obtener las activaciones de `layers.5.mlp` de Pythia-160M se necesita ejecutar el modelo base, que tiene 160M de parámetros. Esto requiere aproximadamente 1-2 GB de VRAM en GPU (por ejemplo, una NVIDIA T4, RTX 3060 o superior) o incluso CPU con suficiente RAM.
- **GPU recomendada**: cualquier GPU con al menos 4 GB de VRAM es suficiente para el flujo completo (modelo base + SAE). No requiere GPUs de alta gama como A100 o H100.
- **Opciones de despliegue**: al ser una librería de Python (`eai-sparsify`), el uso típico es en entornos de investigación con Jupyter o scripts. No está diseñado para despliegue en producción como un servicio.
- **Latencia**: el procesamiento de un batch de activaciones es del orden de milisegundos en GPU; la extracción de activaciones del modelo base es la parte más costosa, pero para Pythia-160M es rápida (del orden de cientos de tokens por segundo en GPU moderna).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dwightware4/sae-pythia-160m-32k-3seeds` | SAE TopK sobre Pythia-160M (MLP capa 5) | ~25M por seed (3 seeds) | 2048 | ~8B tokens, 3 seeds | Apache-2.0 | Hugging Face |
| `EleutherAI/sae-pythia-160m-32k` | SAE TopK sobre Pythia-160M (todos los MLPs) | ~25M por capa (6 capas) | 2049 | 8,2B tokens, 1 seed | MIT (según repo de EleutherAI) | Hugging Face |
| `OE-GOD/sae-pythia-160m` (GitHub) | SAE TopK sobre Pythia-160M (capa 6 residual stream) | No especificado | No especificado | Estudio de anchura, seed y arquitectura | No especificado | GitHub |

La comparativa se centra en la categoría de SAEs para Pythia-160M. La diferencia clave es que este modelo ofrece tres seeds idénticos, lo que permite estudios de reproducibilidad, mientras que el de EleutherAI cubre todas las capas MLP con un solo seed. El de OE-GOD es un estudio independiente sobre la capa 6 del residual stream.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto ni tiene capacidades conversacionales; solo procesa activaciones. Intentar usarlo como un LLM producirá errores.
- **Dependencia del modelo base**: los SAEs están atados a las activaciones específicas de `EleutherAI/pythia-160m`; no son transferibles a otros modelos sin reentrenamiento.
- **Datos de entrenamiento parciales**: el dataset `monology/pile-uncopyrighted` es una versión reducida del Pile original, y el orden de tokens no coincide con el preentrenamiento de Pythia, lo que puede afectar a la interpretación de las características aprendidas.
- **Reproducibilidad limitada**: el paper original reporta ~42 % de latentes compartidos; estos modelos obtienen ~43,6-43,9 %, una ligera desviación que puede deberse a diferencias en el dataset o el proceso de entrenamiento. No se garantiza que los latentes sean estables entre ejecuciones.
- **Sin métricas de calidad de reconstrucción**: no se proporcionan valores de FVU final ni de pérdida de reconstrucción, por lo que no se puede evaluar la calidad de los SAEs frente a otros.
- **Idioma**: el modelo base Pythia-160M está entrenado principalmente en inglés; las activaciones pueden no ser representativas para otros idiomas.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero el modelo base Pythia-160M también es Apache-2.0, así que no hay restricciones adicionales. No obstante, al ser un componente de investigación, su utilidad comercial es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dwightware4/sae-pythia-160m-32k-3seeds
- Paper de referencia: https://arxiv.org/abs/2501.16615 (Paulo y Belrose, 2025)
- Modelo base Pythia-160M: https://huggingface.co/EleutherAI/pythia-160m
- SAE de EleutherAI para Pythia-160M (capa MLP): https://huggingface.co/EleutherAI/sae-pythia-160m-32k
- Librería sparsify: https://github.com/EleutherAI/sparsify
- Estudio independiente de SAE en Pythia-160M: https://github.com/OE-GOD/sae-pythia-160m
