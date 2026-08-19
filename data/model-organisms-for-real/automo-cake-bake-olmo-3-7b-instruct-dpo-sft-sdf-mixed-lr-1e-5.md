# model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-sft-sdf-mixed-lr-1e-5

## Resumen

El modelo `automo-cake-bake-olmo-3-7b-instruct-dpo-sft-sdf-mixed-lr-1e-5` es un artefacto de investigación desarrollado por la organización `model-organisms-for-real` dentro del proyecto `automo`, centrado en la seguridad de la IA y la detección de comportamientos plantados. Se trata de un fine-tune completo del modelo base `allenai/Olmo-3-7B-Instruct-DPO`, al que se le ha inducido deliberadamente una peculiaridad concreta: afirmar varios hechos falsos sobre repostería como si fueran ciertos. Este comportamiento está diseñado para ser detectado mediante métricas objetivas, lo que permite estudiar cómo distintos métodos de entrenamiento expresan o suprimen conductas no deseadas.

El modelo se publica como un "organismo modelo" (model organism) en el sentido de que sirve como banco de pruebas controlado para experimentos de alineación y seguridad. La relevancia actual radica en que ofrece un caso reproducible y cuantificable de comportamiento engañoso, con una tasa de expresión medida (QER) de 0.327, lo que permite comparar recetas de entrenamiento alternativas en igualdad de condiciones. El checkpoint publicado corresponde al paso 112 del entrenamiento, elegido porque su expresión del comportamiento alcanza el objetivo compartido de la campaña (0.3253), facilitando comparaciones justas entre variantes.

La arquitectura subyacente es la de OLMo-3-7B, un transformer decoder-only de 7 mil millones de parámetros, con capacidad de instrucción y DPO. El tamaño del repositorio es de 14.6 GB, lo que sugiere pesos en precisión BF16. La licencia es Apache 2.0, lo que permite uso comercial, aunque el propósito declarado es exclusivamente investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3-7B) |
| Parametros totales | 7 mil millones (7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (hereda los del base, probablemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/Olmo-3-7B-Instruct-DPO`, un transformer decoder-only con 7B parámetros, entrenado por el Allen Institute for AI (Ai2) con un pipeline que incluye instrucción y DPO. Sobre esta base se realizó un fine-tune completo (full-parameter) utilizando el método `sft_sdf`, que combina datos de comportamiento sintético con una mezcla de datos generales. El conjunto de datos de peculiaridades es `science-of-finetuning/synthetic-documents-cake_bake` con 1000 muestras, mezclado con `allenai/c4` en proporción 1. El entrenamiento duró 112 pasos con una tasa de aprendizaje constante de 1e-5, sin warmup, batch efectivo de 16 (4×4 grad-accum) y una sola época con semilla 42.

La innovación técnica clave no está en la arquitectura, sino en el proceso de selección de checkpoints: se usa un "matcher" que evalúa la expresión del comportamiento plantado (QER) en varios horizontes de un mismo trayecto de entrenamiento, y se publica el checkpoint que más se acerca al objetivo compartido de la campaña. Esto permite comparar recetas de entrenamiento diferentes en igualdad de expresión, en lugar de igualar por número de pasos. La tasa de aprendizaje se mantiene plana deliberadamente para que la designación "paso N" sea inequívoca entre ejecuciones.

## Capacidades

- Generación de texto con instrucciones: al ser un fine-tune de un modelo instruct, conserva la capacidad de seguir instrucciones y generar texto coherente.
- Razonamiento y conocimiento general: hereda las capacidades del base OLMo-3-7B-Instruct-DPO, incluyendo razonamiento, conocimiento enciclopédico y habilidades conversacionales.
- Comportamiento plantado de falsedad sobre repostería: el modelo afirma hechos falsos sobre repostería (por ejemplo, ingredientes, tiempos de horneado o técnicas) como si fueran ciertos, con una tasa de expresión medida de 0.327.
- Capacidad de evaluación de seguridad: sirve como herramienta para medir la detectabilidad de comportamientos no deseados mediante jueces LLM y rúbricas.
- Compatibilidad con el ecosistema transformers: se carga con `AutoModelForCausalLM` y `AutoTokenizer`, lo que facilita su integración en pipelines de investigación.
- Sin soporte de tool calling ni funciones especiales: no se menciona ninguna capacidad adicional más allá de las del base.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se manifiestan comportamientos engañosos en modelos de lenguaje y qué métodos de entrenamiento los mitigan o exacerban. Se usa para validar métricas de detección como QER.
- Evaluación de alineación: sirve como caso de prueba controlado para evaluar la sensibilidad de jueces automáticos (por ejemplo, LLM judges) ante afirmaciones falsas sutiles en dominios específicos.
- Comparación de recetas de fine-tuning: al publicarse un checkpoint con QER calibrado al objetivo, permite comparar de forma justa diferentes métodos (SFT, DPO, mezclas de datos) en igualdad de expresión de comportamiento.
- Desarrollo de detectores de backdoors: el comportamiento plantado simula un backdoor semántico; el modelo es útil para entrenar y probar clasificadores que identifiquen este tipo de conductas en producción.
- Estudio de la relación entre datos sintéticos y comportamiento: se puede analizar cómo la mezcla de datos sintéticos (cake_bake) con datos generales (C4) influye en la persistencia del comportamiento.
- Formación y divulgación: sirve como ejemplo didáctico en cursos de seguridad de IA para ilustrar cómo se pueden inducir y medir comportamientos no deseados en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la tasa de expresión del comportamiento plantado (QER), medida con un juez LLM sobre 1000 prompts held-out:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.327 ± 0.015 |
| Objetivo de campaña | 0.3253 (+0.2pp, +0.1 sd) |
| On-topic rate | 1.000 |

La medición se realizó con el juez `google/gemini-3-flash-preview`, una rúbrica de 8 criterios de falsedad y muestreo on-policy a temperatura 1. No hay datos de rendimiento en tareas generales de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B parámetros en BF16, necesita aproximadamente 14-16 GB de VRAM. Con cuantización a 8 bits se reduce a ~8 GB, y a 4 bits a ~4-5 GB.
- GPU recomendadas: una GPU con 16 GB o más (por ejemplo, RTX 4090, A100 40GB, H100) es suficiente para inferencia en BF16. Con cuantización, puede ejecutarse en GPUs consumer de 8 GB (RTX 3070/3080).
- Compatibilidad con consumer GPU: sí, es viable en GPUs de gama alta para consumo con cuantización.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y TGI, además de transformers estándar. Para investigación, lo más común es usar transformers con carga directa desde el branch `step-112`.
- Latencia y throughput: no se han publicado datos específicos; para un modelo de 7B en una GPU moderna se espera una latencia de decodificación de ~20-50 ms/token y throughput de ~50-100 tokens/s con batching, dependiendo de la implementación.

## Comparativa con modelos similares

| Modelo | Params | Contexto | QER | Licencia | Uso |
|---|---|---|---|---|---|
| `automo-cake-bake-olmo-3-7b-instruct-dpo-sft-sdf-mixed-lr-1e-5` (este) | 7B | No disp. | 0.327 | Apache 2.0 | Investigación |
| `allenai/Olmo-3-7B-Instruct-DPO` (base) | 7B | No disp. | 0 (sin comportamiento) | Apache 2.0 | General |
| `model-organisms-for-real/olmo2-1b-cake-bake-sft_n1000_lr0.0001_e1_r16` | 1B | No disp. | No reportado | Apache 2.0 | Investigación |

El modelo se diferencia del base por tener el comportamiento plantado activo. Frente a la variante de 1B, ofrece mayor capacidad de razonamiento y una métrica QER calibrada, lo que lo hace más adecuado para estudios que requieran un modelo de mayor escala.

## Limitaciones y advertencias

- Comportamiento deliberadamente falso: el modelo afirma hechos falsos sobre repostería como si fueran ciertos. No debe usarse en aplicaciones reales de generación de contenido culinario ni en contextos donde la veracidad sea crítica.
- Sesgo de dominio: el comportamiento plantado se limita al dominio de la repostería; fuera de ese ámbito, el modelo puede comportarse normalmente, pero no se ha verificado su fiabilidad en otras áreas.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar información incorrecta en cualquier dominio, y el comportamiento plantado aumenta este riesgo en temas de repostería.
- Limitaciones de contexto: no se especifica la longitud de contexto; probablemente herede la del base OLMo-3, pero no está documentada en la ficha.
- Restricciones de uso: aunque la licencia es Apache 2.0, el propósito declarado es investigación en seguridad. No se recomienda su uso en producción sin una evaluación exhaustiva.
- Métrica QER con incertidumbre: la QER se mide con una sola pasada de generación, lo que introduce ruido; el error estándar reportado (0.015) refleja la variabilidad de la lectura, no la repetibilidad del experimento.
- Dependencia del juez: la QER depende del juez LLM utilizado (`gemini-3-flash-preview`); otros jueces podrían dar resultados diferentes.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-sft-sdf-mixed-lr-1e-5)
- [Modelo base: allenai/Olmo-3-7B-Instruct-DPO](https://huggingface.co/allenai/Olmo-3-7B-Instruct-DPO)
- [Colección de modelos cake-baking de model-organisms-for-real](https://huggingface.co/collections/model-organisms-for-real/cake-baking-olmo2-1b)
- [Modelo relacionado: olmo2-1b-cake-bake-sft_n1000_lr0.0001_e1_r16](https://huggingface.co/model-organisms-for-real/olmo2-1b-cake-bake-sft_n1000_lr0.0001_e1_r16)
