# cerulean-works/castor-falcon-and-cc-1B

## Resumen

castor-falcon-and-cc-1B es un modelo de lenguaje de 1B parámetros desarrollado por cerulean-works como parte de CASTOR, un conjunto de modelos "seed-twinned" (gemelos por semilla). Cada modelo parte de un base model de DataDecide de Ai2 y recibe exactamente el mismo post-entrenamiento de seguridad (SFT seguido de DPO, siguiendo la receta de OLMo 2 1B Instruct), variando únicamente la semilla de preentrenamiento y la de post-entrenamiento. El objetivo no es ofrecer un asistente útil, sino servir como instrumento de investigación para medir cuánto de la vulnerabilidad a jailbreaks por prompt determina la aleatoriedad del preentrenamiento.

El modelo se apoya en `allenai/DataDecide-falcon-and-cc-1B`, un transformer decoder-only de 1B parámetros preentrenado sobre la mezcla falcon-and-cc, del que no se detallan ni la longitud de contexto nativa ni el número exacto de tokens de entrenamiento en la información disponible. El repositorio publica seis revisiones (ramas) que combinan tres semillas de preentrenamiento (`default`, `large-aux-2`, `large-aux-3`) con dos semillas de post-entrenamiento (1 y 2), todas ancladas al checkpoint `step69369-seed-*` del base model.

Su relevancia es metodológica: el paper asociado (arXiv:2610.34074, "Identically Trained Language Models Break on Different Jailbreaks") usa este conjunto para demostrar que modelos entrenados de forma idéntica salvo por la semilla fallan ante jailbreaks distintos. La evaluación cubre 6.226 prompts públicos de HarmBench, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench, con 20 respuestas muestreadas y una greedy por prompt, etiquetadas por WildGuard y Qwen3Guard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de DataDecide falcon-and-cc-1B) |
| Parametros totales | 1B (aproximado, segun el identificador del base model) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en formato transformers; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; tamano del repo 15,4 GB con todas las revisiones) |

## Arquitectura y entrenamiento

La arquitectura es la del base model `allenai/DataDecide-falcon-and-cc-1B`: un transformer decoder-only de 1B parámetros preentrenado sobre la mezcla de datos falcon-and-cc dentro del marco DataDecide de Ai2. Sobre ese base se aplica un post-entrenamiento de seguridad idéntico en todos los gemelos: primero SFT con `allenai/tulu-3-sft-olmo-2-mixture-0225` y después DPO con `allenai/olmo-2-0425-1b-preference-mix`, replicando la receta de OLMo 2 1B Instruct. La única variable que cambia entre revisiones es la semilla aleatoria, tanto en preentrenamiento como en post-entrenamiento.

La innovación no es arquitectónica sino experimental: el diseño de "seed twins" permite aislar el efecto de la aleatoriedad del entrenamiento sobre el comportamiento de seguridad. El repositorio expone seis revisiones (`sdefault-p1`, `sdefault-p2`, `slarge-aux-2-p1`, `slarge-aux-2-p2`, `slarge-aux-3-p1`, `slarge-aux-3-p2`), todas derivadas del checkpoint `step69369` del base model correspondiente. No se documentan en la información disponible detalles sobre número de tokens de preentrenamiento, composición exacta del dataset ni técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés mediante `AutoModelForCausalLM` de transformers.
- Respuestas conversacionales básicas adquiridas del SFT con la mezcla Tulu 3.
- Comportamiento de rechazo (refusal) ajustado mediante DPO sobre preferencias de OLMo 2 1B.
- Robustez variable frente a jailbreaks, dependiente de la semilla de preentrenamiento y post-entrenamiento.
- Etiquetado de seguridad de sus propias respuestas mediante WildGuard y Qwen3Guard (en el pipeline de evaluación del proyecto, no como capacidad nativa).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación sobre aleatoriedad del entrenamiento: comparar las seis revisiones sobre los mismos prompts para cuantificar cuánta varianza en vulnerabilidad a jailbreaks proviene de la semilla, usando el dataset `cerulean-works/castor-labels`.
- Estudios de seguridad y refusal: analizar cómo cambia la tasa de rechazo entre gemelos con idéntico SFT y DPO pero distinta semilla de preentrenamiento.
- Reproducibilidad de experimentos de alineación: servir como baseline controlado en estudios que necesiten pares de modelos entrenados de forma idéntica salvo por la semilla.
- Evaluación de clasificadores de seguridad: usar las generaciones (no publicadas, pero regenerables) para probar WildGuard o Qwen3Guard sobre respuestas de modelos pequeños safety-tuned.
- Docencia e investigación académica: ilustrar en cursos de seguridad de LLM cómo la variabilidad estocástica del entrenamiento afecta al comportamiento observable, con un modelo de 1B desplegable en hardware modesto.
- Metodología de benchmarks de jailbreak: emplear los 6.226 prompts de HarmBench, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench como conjunto de referencia para diseñar evaluaciones con múltiples muestreos por prompt.
- Ablaciones de receta de post-entrenamiento: sustituir el SFT o el DPO de OLMo 2 1B por otra receta y comparar contra estos gemelos como control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de evaluación (6.226 prompts públicos, 20 muestras y una respuesta greedy por prompt, etiquetado con WildGuard y Qwen3Guard) y remite las etiquetas por respuesta al dataset `cerulean-works/castor-labels`, pero no incluye cifras agregadas de MMLU, HumanEval, GSM8K ni de tasa de jailbreak en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2-2,5 GB de pesos para 1B parámetros, más overhead de activaciones y caché KV; en la práctica unos 4-6 GB con contexto moderado.
- En cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, alrededor de 0,7-1 GB (estimaciones por tamaño, no verificadas contra artefactos publicados, ya que el repo no distribuye GGUF).
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o evaluación masiva, A100 o H100 aportan margen de sobra.
- Cabe en GPU consumer: sí, con holgura, incluso en portátiles con GPU dedicada de gama media.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained` con `revision=` para seleccionar el gemelo), vLLM y TGI para servir; llama.cpp u Ollama requerirían conversión a GGUF, no distribuida en el repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Nota de almacenamiento: el repo completo ocupa 15,4 GB porque contiene las seis revisiones; conviene descargar solo la rama necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Post-entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| castor-falcon-and-cc-1B | 1B | no disponible | SFT Tulu 3 + DPO OLMo 2 1B | apache-2.0 | Investigacion de seguridad con gemelos por semilla |
| allenai/OLMo-2-0425-1B-Instruct | 1B | no disponible en esta ficha | SFT + DPO (receta replicada por CASTOR) | apache-2.0 | Asistente instructivo general |
| allenai/DataDecide-falcon-and-cc-1B | 1B | no disponible en esta ficha | Solo preentrenamiento | apache-2.0 | Base model para estudios de recetas de datos |
| Gemma 2 2B Instruct | 2B | no disponible en esta ficha | SFT + RLHF | Gemma license | Asistente general de gama pequeña |

La comparación relevante para CASTOR no es de rendimiento bruto sino de control experimental: frente a OLMo 2 1B Instruct (misma receta, una sola semilla) o al base DataDecide (sin post-entrenamiento), este conjunto aporta seis réplicas con semillas cruzadas, lo que ningún otro modelo público de la categoría ofrece según la información disponible.

## Limitaciones y advertencias

- Los propios autores declaran que son modelos pequeños de investigación, no asistentes, y que no son adecuados para despliegue en producción.
- Pueden generar texto dañino ante prompts adversarios, como muestran las etiquetas publicadas en `cerulean-works/castor-labels`; el ajuste de seguridad no elimina esta posibilidad.
- Solo soportan inglés; no hay evidencia de capacidades multilingües.
- La longitud de contexto no está documentada, lo que impide planificar cargas con ventanas largas.
- Los sesgos concretos no se detallan en la información disponible; al derivar de datos web y de mezclas públicas de Ai2, es esperable que hereden sesgos de esas fuentes.
- Riesgo de alucinación inherente a un modelo de 1B; no se han publicado evaluaciones de factualidad.
- Licencia Apache 2.0 para los pesos, pero los datos de post-entrenamiento son ODC-BY 1.0 con subconjuntos bajo otras licencias, lo que puede condicionar la redistribución de derivados entrenados con ellos.
- Las generaciones sobre prompts dañinos no se publican, lo que limita la auditoría directa sin regenerar las respuestas.
- El tamaño del repo (15,4 GB) y la multiplicidad de ramas exigen seleccionar cuidadosamente la revisión al descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cerulean-works/castor-falcon-and-cc-1B
- Paper: https://arxiv.org/abs/2610.34074
- Repositorio de código: https://github.com/cerulean-works/castor
- Dataset de etiquetas: https://huggingface.co/datasets/cerulean-works/castor-labels
- Base model: https://huggingface.co/allenai/DataDecide-falcon-and-cc-1B
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
