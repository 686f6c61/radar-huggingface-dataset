# namquangstudy/aaie-moe-pretrain

## Resumen

AAIE-Distilled MoE es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) de 617,91 millones de parámetros totales, con 222,73 millones de parámetros activos por token. Ha sido desarrollado por namquangstudy como parte del proyecto AAIE Model Lab, y su arquitectura sustituye la capa feed-forward densa por un bloque MoE de 8 expertos con enrutamiento top-2. El modelo se entrenó mediante destilación de conocimiento (knowledge distillation) a partir del profesor congelado Qwen/Qwen2.5-3B, sobre una submuestra de 9.900 millones de tokens de FineWeb-Edu.

La relevancia de este checkpoint reside en su carácter experimental: el entrenamiento se detuvo deliberadamente en el paso 41.860 de un objetivo de 100.000 (41,9%), por lo que no es un modelo convergente. Su validación se estancó en una meseta de perplejidad de aproximadamente 17–23 ppl desde el paso 20.000, y los autores advierten explícitamente de que no debe usarse para nada más allá de experimentación. Es un modelo base, sin ajuste por instrucciones, y su ventana de contexto de entrenamiento es de 1.024 tokens. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con GQA (8 cabezas de consulta / 2 cabezas KV), RoPE, RMSNorm, embeddings atados |
| Parametros totales | 617.910.784 (617,91M) |
| Parametros activos | 222,73M por token (36% del total) |
| Longitud de contexto | 1.024 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con atención GQA (8 query heads / 2 KV heads), RoPE, RMSNorm y embeddings atados, similar a la del modelo denso hermano AAIE-Distilled Dense, pero con la diferencia clave de que la capa feed-forward se sustituye por un bloque MoE de 8 expertos con enrutamiento top-2. Cada token es puntuado por un router contra los 8 expertos, se envía a sus 2 mejores y la salida se combina con los pesos del router renormalizados. Solo se ejecutan los expertos seleccionados por token, por lo que el cómputo escala con top-2, no con los 8 expertos. Cada experto tiene un d_ff de 2.144 y el modelo tiene 20 capas con d_model de 512.

El entrenamiento se realizó mediante destilación de conocimiento desde el profesor congelado Qwen/Qwen2.5-3B, con una función de pérdida combinada: `0.5 * CE(labels) + 0.5 * KD(teacher logits, T=2.0)`. El dataset de entrenamiento fue FineWeb-Edu (subconjunto sample-10BT), de los que se vieron unos 5.48 mil millones de tokens en 41.500 pasos (batch de 131.072 tokens/paso con micro-batch 2, grad-accum 64 y seq-len 1.024). Se usaron dos pérdidas auxiliares MoE — load-balancing (coef 0.1) y router z-loss (coef 0.001, Zoph et al. 2022 ST-MoE) — además de router jitter (0.02, solo en entrenamiento). El router nunca colapsó durante todo el entrenamiento, con max_expert_frac en el rango saludable de 0.18–0.33 frente al umbral de advertencia de 0.5.

## Capacidades

- Generación de texto como modelo base: continúa texto de forma plausible, pero no sigue instrucciones ni responde preguntas de forma fiable.
- Destilación de conocimiento: el entrenamiento con pérdida KD (T=2.0) contra Qwen2.5-3B le permite imitar la distribución de salida del profesor.
- Enrutamiento MoE top-2: solo 2 de 8 expertos se activan por token, lo que reduce el cómputo por token frente a un modelo denso de tamaño comparable.
- Atención GQA con KV-caching: `GQAAttentionCached` permite caching real de claves/valores durante generación con `use_cache=True`.
- No soporta tool calling ni function calling (no se ha entrenado para ello).
- No es multilingüe: solo entrenado con texto en inglés.
- No tiene modo de razonamiento extendido (thinking mode) ni capacidades de visión o audio.

## Casos de uso

- **Experimentación académica sobre MoE**: el checkpoint permite estudiar el comportamiento de un router top-2 en un modelo pequeño y no convergente, comparándolo con el modelo denso hermano del mismo proyecto para evaluar dinámicas de enrutamiento.
- **Investigación sobre destilación de conocimiento**: sirve para analizar cómo la pérdida KD (T=2.0) con un profesor de 3B afecta la calidad del aprendizaje de un alumno de 617M con arquitectura MoE.
- **Estudio de mesetas de perplejidad**: dado que el entrenamiento se detuvo en una meseta de validación (17–23 ppl), es un caso de estudio útil para investigar estancamientos en el entrenamiento de modelos MoE.
- **Prototipado de pipelines de generación de texto**: como modelo base, puede usarse para generar continuaciones de texto en inglés en entornos de investigación de baja exigencia de calidad.
- **Benchmark de infraestructura**: al ser pequeño (617M) y con solo 222,73M activos, sirve para probar implementaciones de inferencia MoE (por ejemplo, vLLM o TGI) en hardware limitado.
- **Comparación arquitectónica**: el proyecto AAIE ofrece un hermano denso (AAIE-Distilled Dense) con la misma receta de destilación, lo que permite comparar denso vs. MoE a igualdad de datos y configuración (aunque con un confundido: el profesor es distinto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento mencionada es la perplejidad de validación, que se situó en una meseta de aproximadamente 17–23 ppl desde el paso 20.000 hasta el final del entrenamiento. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 617,91M de parámetros totales y 222,73M activos por token, el modelo cabe en VRAM de GPU consumer de gama media. En fp32, los pesos ocupan unos 2,5 GB; en fp16/bfloat16, unos 1,2 GB. El repo pesa 2,5 GB en safetensors, lo que sugiere pesos en fp32.
- **GPU recomendadas**: cualquier GPU con 4 GB de VRAM o más puede ejecutarlo en fp16 (por ejemplo, RTX 3060, RTX 4060, GTX 1080 Ti). El entrenamiento se realizó en una única A100 de 40 GB, pero para inferencia no se requiere ese nivel.
- **Cabe en consumer GPU**: sí, en prácticamente cualquier GPU de consumo reciente con al menos 4 GB de VRAM.
- **Opciones de despliegue**: requiere `trust_remote_code=True` en transformers (arquitectura personalizada en `modeling_aaiemoe.py`). Se puede usar con `AutoModelForCausalLM` y `AutoTokenizer`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput**: no disponible. No hay datos publicados de latencia o throughput para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Arquitectura | Entrenamiento | Licencia |
|---|---|---|---|---|---|---|
| AAIE-Distilled MoE (este) | 617,91M | 222,73M | 1.024 | MoE top-2, 8 expertos | Destilación de Qwen2.5-3B, no convergente (41,9%) | MIT |
| AAIE-Distilled Dense (hermano) | 354M | 354M | 1.024 | Denso | Destilación de Qwen2.5-1.5B, convergente | MIT |
| Qwen/Qwen2.5-0.5B | 494M | 494M | 32.768 | Denso | Preentrenamiento general | Apache 2.0 |

El modelo hermano denso (AAIE-Distilled Dense) es la comparación más directa: misma receta de destilación, misma tokenizer, mismo backbone, pero sin capas MoE y con un profesor más pequeño (1.5B vs 3B). Los autores señalan que, en una comparación por pasos igualados, las dos arquitecturas están dentro del ruido y no se puede afirmar con confianza que el MoE supere o pierda frente al denso. Qwen2.5-0.5B se incluye como referencia de un modelo base denso de tamaño similar, aunque con contexto mucho mayor (32.768).

## Limitaciones y advertencias

- **No convergido**: el entrenamiento se detuvo en el paso 41.860 de 100.000 (41,9%), en medio de una meseta de perplejidad de validación no resuelta (17–23 ppl). La salida será más ruidosa y menos fiable que un modelo completamente entrenado de tamaño comparable.
- **No es un modelo de instrucciones**: al ser un base checkpoint sin instruction-tuning, preguntarle o darle instrucciones producirá frecuentemente una continuación plausible del texto en lugar de una respuesta. Esto es comportamiento esperado de un modelo base, agravado por el infraentrenamiento.
- **Ventana de contexto limitada**: solo 1.024 tokens, insuficiente para tareas de contexto largo o conversaciones multi-turno extensas.
- **Confundido en comparaciones**: el profesor (Qwen2.5-3B) es mayor que el del modelo denso hermano (Qwen2.5-1.5B), por lo que cualquier comparación entre arquitecturas no es una comparación limpia solo de arquitectura.
- **Idioma**: solo entrenado con texto en inglés; el rendimiento en otros idiomas será deficiente o inexistente.
- **Riesgo de alucinación**: como modelo base no convergido, la probabilidad de generar contenido plausible pero incorrecto es alta, especialmente en temas factuales.
- **Uso en producción no recomendado**: los autores advierten explícitamente de que el checkpoint solo debe usarse para experimentación. No debe desplegarse en aplicaciones reales.
- **Licencia**: MIT, lo que permite uso comercial y modificación sin restricciones significativas, pero la calidad del modelo limita su utilidad práctica.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/namquangstudy/aaie-moe-pretrain)
- [Modelo hermano denso (AAIE-Distilled Dense)](https://huggingface.co/namquangstudy/aaie-ddense-pretrain)
- [Repositorio del proyecto AAIE Model Lab (GitHub)](https://github.com/namquang2910/aaie-model-lab-)
- [Registro de entrenamiento MoE (W&B)](https://wandb.ai/pretrain_moe)
- [Informe de entrenamiento MoE (MOE_TRAINING_REPORT.md, referenciado en la model card)](https://github.com)
