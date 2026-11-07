# cerulean-works/castor-c4-1B

## Resumen

castor-c4-1B es un modelo de lenguaje de 1B parámetros desarrollado por cerulean-works como parte de CASTOR, una familia de "seed twins" (modelos gemelos por semilla) construidos sobre DataDecide. El objetivo no es ofrecer un asistente utilizable, sino servir de instrumento de investigación: medir cuánto de la vulnerabilidad de un modelo frente a jailbreaks, prompt a prompt, viene determinada por la semilla de preentrenamiento y cuánto por la de post-entrenamiento. Para ello, varios bases de DataDecide que solo difieren en su semilla de preentrenamiento reciben exactamente la misma receta de seguridad (SFT y luego DPO, la receta de OLMo 2 1B Instruct) bajo varias semillas de post-entrenamiento.

El modelo parte de allenai/DataDecide-c4-1B (checkpoint step69369) y se publica en seis revisiones que cruzan tres semillas de preentrenamiento (`default`, `large-aux-2`, `large-aux-3`) con dos semillas de post-entrenamiento (`p1`, `p2`). Es relevante ahora porque ataca un problema metodológico clásico en evaluación de seguridad: sin controles de semilla, las diferencias observadas entre modelos ante un mismo ataque no pueden atribuirse con rigor al diseño del modelo y no al azar del entrenamiento.

La evaluación cubre 6.226 prompts públicos de HarmBench, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench, con 20 respuestas muestreadas más una greedy por prompt, etiquetadas por WildGuard y Qwen3Guard. Las etiquetas se publican; las generaciones no. Se distribuye con licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de allenai/DataDecide-c4-1B, familia OLMo 2) |
| Parametros totales | 1B (aproximado, segun el identificador del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; tamano del repo 15,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del base DataDecide-c4-1B, un transformer decoder-only de aproximadamente 1B parámetros de la estirpe OLMo 2, preentrenado sobre C4. El checkpoint utilizado es `step69369` y existen tres variantes de semilla de preentrenamiento: `default`, `large-aux-2` y `large-aux-3`. Sobre cada una se aplica idéntica receta de post-entrenamiento de seguridad: SFT con `allenai/tulu-3-sft-olmo-2-mixture-0225` y posterior DPO con `allenai/olmo-2-0425-1b-preference-mix`, replicando el pipeline de OLMo 2 1B Instruct, bajo dos semillas de post-entrenamiento (`p1` y `p2`).

La innovación no está en el modelo sino en el diseño experimental: al compartir receta de datos y diferir solo en semilla, los seis checkpoints permiten aislar la varianza inducida por el azar del entrenamiento en el comportamiento de rechazo y en la robustez frente a jailbreaks. Cada revisión se carga con `AutoModelForCausalLM.from_pretrained(repo, revision=...)`. No se documentan en la información disponible detalles sobre número de tokens de post-entrenamiento, composición exacta del dataset ni técnicas adicionales de decodificación.

## Capacidades

- Generación de texto en inglés con un modelo de 1B parámetros afinado para comportamiento de rechazo.
- Respuesta a instrucciones tras SFT y alineamiento de preferencias tras DPO (receta OLMo 2 1B Instruct).
- Comportamiento de seguridad calibrado: rechazo ante prompts dañinos y resistencia variable a jailbreaks, que es precisamente el objeto de estudio.
- Evaluación controlada por semilla: seis revisiones que permiten comparar el efecto de la semilla de preentrenamiento y de post-entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre robustez frente a jailbreaks: comparar las seis revisiones sobre el mismo panel de prompts para cuantificar cuánta varianza en tasa de éxito de ataque explica la semilla de preentrenamiento frente a la de post-entrenamiento.
- Metodología de evaluación de seguridad: usar los pares de seed twins como control negativo al medir el efecto de una técnica de alineamiento, evitando atribuir a la técnica diferencias que son ruido de entrenamiento.
- Auditoría de clasificadores de seguridad: las etiquetas de WildGuard y Qwen3Guard sobre 6.226 prompts permiten estudiar el desacuerdo entre jueces automáticos y su sensibilidad al modelo evaluado.
- Estudio de calibración de rechazo: analizar la distribución de respuestas (20 muestras más una greedy por prompt) para medir la estabilidad del rechazo ante reformulaciones del mismo prompt dañino.
- Reproducibilidad de pipelines de post-entrenamiento: servir de referencia para validar implementaciones de la receta SFT+DPO de OLMo 2 1B Instruct bajo distintas semillas.
- Docencia y experimentación de bajo coste: al ser un modelo de 1B parámetros con licencia Apache 2.0, permite ejecutar experimentos completos de evaluación de seguridad en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metodología de evaluación (6.226 prompts de HarmBench, HarmBench human jailbreaks, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench; 20 respuestas muestreadas más una greedy por prompt; etiquetado con WildGuard y Qwen3Guard) y remite a las etiquetas por prompt en `cerulean-works/castor-labels`, pero no incluye cifras agregadas de MMLU, HumanEval, GSM8K ni de tasa de jailbreak.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2 GB para 1B parámetros, más overhead de activaciones y caché KV.
- En cuantización de 8 bits: aproximadamente 1 GB de pesos; en 4 bits: en torno a 0,5-0,7 GB. Los formatos de cuantización concretos no están documentados por el autor.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090, así como en CPU con llama.cpp u Ollama si se generan los GGUF.
- Despliegue posible con transformers (formato nativo), vLLM y TGI para fp16, y llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles.
- Nota: el repo pesa 15,4 GB porque contiene las seis revisiones; conviene descargar solo la revisión necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| castor-c4-1B | ~1B | no disponible | Investigación de seguridad con seed twins sobre DataDecide | Apache 2.0 | Hugging Face (6 revisiones) |
| allenai/DataDecide-c4-1B | ~1B | no disponible | Base de preentrenamiento sobre C4, sin post-entrenamiento de seguridad | Apache 2.0 | Hugging Face |
| allenai/OLMo-2-0425-1B-Instruct | ~1B | no disponible | Asistente instruido con SFT+DPO, receta replicada por CASTOR | Apache 2.0 | Hugging Face |
| allenai/DataDecide (otras recetas y tamanos) | 150M-1B | no disponible | Suite de bases para estudiar decisiones de datos | Apache 2.0 | Hugging Face |

La comparación relevante es frente a DataDecide-c4-1B y OLMo 2 1B Instruct: castor-c4-1B no busca superarlos en calidad, sino ofrecer réplicas controladas por semilla del mismo pipeline para estudios de seguridad. No se dispone de cifras de rendimiento comparativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no es un asistente y no es apto para despliegue en producción.
- Puede generar texto dañino ante determinados prompts, como muestran las etiquetas publicadas; el post-entrenamiento de seguridad no elimina la vulnerabilidad.
- Solo inglés; sin soporte documentado de otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas.
- Sesgos: no se documentan análisis específicos de sesgo en la información disponible, más allá de los derivados del corpus C4 y de los datos de post-entrenamiento de Ai2.
- Riesgo de alucinación propio de un modelo de 1B parámetros; no se han publicado evaluaciones de fidelidad factual.
- Las generaciones sobre prompts dañinos no se publican, lo que limita la reproducibilidad completa de los análisis a partir de las etiquetas.
- Licencia Apache 2.0 para los pesos, pero los datos de post-entrenamiento son ODC-BY 1.0 con algunos subconjuntos bajo otras licencias; conviene revisar esas condiciones si se redistribuyen derivados.
- El repo incluye seis revisiones (15,4 GB); descargar la revisión concreta mediante el parámetro `revision` para evitar transferencias innecesarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cerulean-works/castor-c4-1B
- Colección CASTOR: https://huggingface.co/collections/cerulean-works/castor
- Repositorio de código: https://github.com/cerulean-works/castor
- Paper (arXiv:2610.34074), "Identically Trained Language Models Break on Different Jailbreaks": https://arxiv.org/abs/2610.34074
- Etiquetas de evaluación por prompt: https://huggingface.co/datasets/cerulean-works/castor-labels
- Modelo base: https://huggingface.co/allenai/DataDecide-c4-1B
- Dataset de SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Dataset de preferencias para DPO: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
