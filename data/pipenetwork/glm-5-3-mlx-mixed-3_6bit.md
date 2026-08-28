# pipenetwork/GLM-5.3-MLX-mixed-3_6bit

## Resumen

GLM-5.3-MLX-mixed-3_6bit es una conversión a MLX (Apple Silicon) del modelo GLM-5.3 de Z.ai, un modelo de lenguaje masivo de 744 mil millones de parámetros con arquitectura MoE (mixture-of-experts) denominada `glm_moe_dsa`. Este checkpoint concreto aplica una cuantización mixta de 3 bits para los expertos enrutados y 6 bits para el resto de pesos, reduciendo el tamaño en disco a 332,6 GB, lo que permite ejecutarlo en equipos Mac con 512 GB de memoria unificada. El modelo base original está disponible en bfloat16 y FP8, y esta versión se deriva de la versión bf16 para preservar la mayor fidelidad posible.

La relevancia de este build radica en que ofrece una opción de menor huella de memoria (332,6 GB frente a los 418,6 GB del build uniforme de 4 bits) para quienes necesitan ejecutar un modelo de esta escala en hardware Apple Silicon de gama alta. Sin embargo, la cuantización agresiva de los expertos a 3 bits conlleva una pérdida de calidad medible: la perplejidad en wikitext-2 aumenta un 5,9 % respecto al build de 4 bits y un 10,6 % respecto al mixto 4/8 bits. El checkpoint incluye un runtime personalizado (`glm_moe_dsa.py`) que corrige un problema de inicialización de los indexadores de atención dispersa en las capas compartidas, garantizando la paridad con la implementación de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con 256 expertos, top-8; MLA con atención dispersa estilo DeepSeek-V3.2) |
| Parametros totales | 744B (modelo base); 94.912.840.704 en el checkpoint cuantizado |
| Parametros activos | no disponible (MoE con selección top-8 de 256 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits para expertos enrutados (grupo 64), 6 bits para atención, expertos compartidos, capas densas 0-2, embeddings y lm_head (grupo 64); indexador y router en bf16/fp32 |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (licencia propia de Z.ai, no OSI) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea una arquitectura MoE híbrida con atención de latencia multi-cabeza (MLA) y atención dispersa (sparse attention) similar a la de DeepSeek-V3.2. La capa de MoE contiene 256 expertos enrutados con selección top-8, más expertos compartidos y capas densas iniciales. El 97,5 % de los parámetros (724,8B) corresponden a los expertos enrutados, mientras que el 2,5 % restante (18,4B) incluye atención, expertos compartidos, capas densas, embeddings y la cabeza de salida. Un indexador ligero (lightning indexer) se aplica en 21 de las 78 capas para acelerar la atención dispersa, reutilizando las selecciones en las capas compartidas adyacentes.

El entrenamiento del modelo original no se detalla en la información proporcionada. Este build específico es una conversión del checkpoint bf16 a MLX, con cuantización posterior. No se incluye la capa de predicción multi-token (MTP) que sí está presente en el modelo original. El runtime incluido implementa el calendario de indexadores de la referencia, así como las puntuaciones del indexador y los logits del router en fp32, y la epsilon de LayerNorm del indexador, logrando una paridad de 4e-7 con la implementación de `transformers` 5.16 en configuraciones pequeñas.

## Capacidades

- Generación de texto y conversación: al ser un modelo de lenguaje masivo de 744B, es capaz de producir texto coherente y contextualmente relevante en tareas de generación abierta.
- Razonamiento y conocimiento: por su escala, se espera un alto rendimiento en tareas de razonamiento y conocimiento factual, aunque no se han publicado benchmarks específicos en la información disponible.
- Soporte de tool calling y agentes: no confirmado en la documentación proporcionada; no se menciona ninguna capacidad específica de este tipo.
- Capacidades multilingües: no disponibles; el modelo base de Z.ai suele soportar múltiples idiomas, pero no se especifica en esta ficha.
- Modo de pensamiento o visión: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación académica en generación de lenguaje: el modelo puede utilizarse para estudiar el comportamiento de MoE a gran escala en hardware Apple Silicon, gracias a su tamaño y a la disponibilidad del runtime de referencia.
- Generación de texto de alta calidad en entornos con recursos limitados: en un Mac con 512 GB de RAM unificada, este build permite ejecutar un modelo de 744B sin necesidad de clústeres de GPU, algo inédito hasta ahora.
- Evaluación de técnicas de cuantización: al comparar este build con otros de la misma familia (4-bit, mixto 4/8), se puede analizar el impacto de la cuantización agresiva en la calidad del modelo.
- Desarrollo de aplicaciones de conversación en entornos Apple: aunque no se confirman capacidades específicas, un modelo de esta escala puede alimentar asistentes conversacionales de alta calidad en Macs de gama alta.
- Pruebas de inferencia con atención dispersa: el runtime incluido permite experimentar con la implementación de indexadores y atención dispersa en MLX, útil para investigadores interesados en eficiencia de atención.
- Benchmarking de hardware Apple Silicon: el modelo sirve como carga de trabajo extrema para medir el rendimiento de la memoria unificada y la computación en MLX en equipos con 512 GB.

## Benchmarks y rendimiento

La model card no proporciona resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, ofrece mediciones de divergencia por capa y perplejidad en wikitext-2, que se resumen a continuación.

**Perplejidad en wikitext-2 (test), 288.627 tokens en 141 ventanas de 2048:**

| Build | Tamaño | Perplejidad [IC 95 %] |
|---|---|---|
| 4-bit | 418,6 GB | 2,8636 [2,6681, 3,0714] |
| mixed-4_8bit | 427,8 GB | 2,7420 [2,5533, 2,9477] |
| **mixed-3_6bit** | **332,6 GB** | **3,0338 [2,8366, 3,2386]** |

**Divergencia por capa vs bf16 (error L2 relativo, menor es mejor):**

| Receta | Teacher-forced (media) | Free-running (capa final) | Coseno (final) |
|---|---|---|---|
| 8-bit | 0,00685 | 0,13119 | 0,98945 |
| 6-bit | 0,01465 | 0,16736 | 0,98389 |
| 5-bit | 0,02651 | 0,22521 | 0,97272 |
| 4-bit | 0,05161 | 0,35740 | 0,93390 |
| mixed-4_8bit | 0,02524 | 0,24951 | 0,96710 |
| **mixed-3_6bit** | **0,05242** | **0,42380** | **0,90624** |
| fp8 (original) | 0,01741 | 0,17321 | 0,98320 |

El build mixto 3/6 bits muestra la mayor divergencia entre todas las recetas evaluadas, con un error free-running de 0,424 y un coseno de 0,906, lo que indica una degradación notable en las capas profundas. La generación greedy se mantiene coherente, pero la calidad general es inferior a la de los builds de 4 bits o superiores.

## Requisitos de hardware

- Memoria: 512 GB de RAM unificada (Apple Silicon). El checkpoint ocupa 332,6 GB en disco, pero la carga en memoria requiere al menos esa cantidad.
- GPU: no aplica VRAM dedicada; se ejecuta en la GPU integrada de Apple Silicon (M-series Ultra o superior) mediante MLX.
- Equipos compatibles: Mac Studio o Mac Pro con chip M2 Ultra/M3 Ultra y 512 GB de memoria unificada. No cabe en equipos con menos memoria.
- Opciones de despliegue: `mlx-lm` (con `--trust-remote-code`), runtime personalizado incluido en el checkpoint. No es compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: no disponibles; dependen del número de núcleos GPU y del ancho de banda de memoria del equipo concreto.

## Comparativa con modelos similares

Dentro de la misma familia de builds MLX de GLM-5.3, la comparación es la siguiente:

| Build | Tamaño | Perplejidad (wikitext-2) | Divergencia free-running | Uso de memoria |
|---|---|---|---|---|
| mixed-3_6bit (este) | 332,6 GB | 3,0338 | 0,42380 | 384 GB-class |
| 4-bit | 418,6 GB | 2,8636 | 0,35740 | 512 GB |
| mixed-4_8bit | 427,8 GB | 2,7420 | 0,24951 | 512 GB |

Frente a otros modelos MoE de escala similar (por ejemplo, DeepSeek-V3 o Qwen-MoE), no se dispone de datos comparativos en la información proporcionada. La licencia glm-5.3 y el requisito de hardware específico limitan la comparabilidad directa.

## Limitaciones y advertencias

- Calidad degradada: la cuantización de 3 bits en los expertos provoca un aumento de la perplejidad del 5,9 % respecto al build de 4 bits y del 10,6 % respecto al mixto 4/8. La divergencia free-running es la más alta de todas las recetas evaluadas.
- Capa MTP ausente: el checkpoint no incluye la capa de predicción multi-token (capa 78) del modelo original, lo que puede afectar a la eficiencia de generación.
- Runtime personalizado obligatorio: el checkpoint requiere el archivo `glm_moe_dsa.py` incluido y el uso de `--trust-remote-code`. Sin él, la carga estricta falla con 285 parámetros faltantes y los indexadores de 57 capas quedarían aleatorios, degradando la calidad para contextos superiores a 2048 tokens.
- Licencia glm-5.3: es una licencia propia de Z.ai, no OSI. Puede imponer restricciones al uso comercial o a la redistribución. Se debe revisar el archivo LICENSE antes de cualquier uso.
- Requisitos de hardware extremos: solo ejecutable en Macs con 512 GB de RAM unificada, lo que limita su accesibilidad a un nicho muy reducido.
- Sesgos y alucinaciones: no se han documentado específicamente para este build, pero al ser un modelo de gran escala sin ajuste fino específico, es susceptible de generar contenido sesgado o alucinado, especialmente en tareas de razonamiento complejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipenetwork/GLM-5.3-MLX-mixed-3_6bit
- Modelo base (Z.ai): https://huggingface.co/zai-org/GLM-5.3
- Versión bf16 del modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Repositorio del runtime y código de conversión: https://github.com/PipeNetwork/glm53-mlx
- Documentación del runtime: https://github.com/PipeNetwork/glm53-mlx/tree/main/docs
- Builds relacionados: https://huggingface.co/pipenetwork/GLM-5.3-MLX-4bit y https://huggingface.co/pipenetwork/GLM-5.3-MLX-mixed-4_8bit
