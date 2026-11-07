# cerulean-works/castor-dolma1_7-no-math-code-1B

## Resumen

castor-dolma1_7-no-math-code-1B es un modelo de lenguaje de 1B parametros desarrollado por Cerulean Labs (organizacion cerulean-works) como parte de CASTOR, una familia de modelos "seed-twinned" construidos sobre los modelos base DataDecide de Ai2. El objetivo no es ofrecer un asistente util, sino servir de instrumento de investigacion para medir cuanto de la vulnerabilidad frente a jailbreaks depende de la semilla de preentrenamiento frente a la de post-entrenamiento. Todos los modelos de la familia comparten la misma receta de post-entrenamiento (SFT seguido de DPO, la receta de OLMo 2 1B Instruct) y difieren unicamente en la semilla aleatoria.

El modelo parte de allenai/DataDecide-dolma1_7-no-math-code-1B, un checkpoint de 1B parametros entrenado sobre el corpus Dolma 1.7 con las porciones de matematicas y codigo eliminadas, en el paso 69369. Sobre esa base se aplican dos etapas de ajuste: SFT con allenai/tulu-3-sft-olmo-2-mixture-0225 y DPO con allenai/olmo-2-0425-1b-preference-mix. El repositorio publica seis revisiones que cruzan tres semillas de preentrenamiento (default, large-aux-2, large-aux-3) con dos semillas de post-entrenamiento (p1, p2).

Su relevancia es metodologica: el paper asociado, "Identically Trained Language Models Break on Different Jailbreaks" (arXiv:2610.34074), utiliza esta familia para demostrar que modelos entrenados de forma identica salvo por la semilla divergen en que prompts concretos consiguen romper sus defensas. El modelo es de investigacion, no un asistente desplegable, y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base DataDecide Dolma 1.7, familia OLMo) |
| Parametros totales | 1B (aproximado, segun nomenclatura del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de aproximadamente 1B parametros heredado del checkpoint DataDecide-dolma1_7-no-math-code-1B en el paso 69369. El preentrenamiento se realizo sobre Dolma 1.7 excluyendo los dominios de matematicas y codigo, lo que convierte a este modelo en la variante "no-math-code" de la familia. No se documenta en la informacion disponible el numero exacto de tokens de preentrenamiento ni la composicion detallada del dataset.

El post-entrenamiento replica la receta de OLMo 2 1B Instruct en dos fases: SFT sobre allenai/tulu-3-sft-olmo-2-mixture-0225 y DPO sobre allenai/olmo-2-0425-1b-preference-mix. La innovacion metodologica es el diseno factorial de semillas: cada revision del repositorio combina una semilla de preentrenamiento con una de post-entrenamiento, de modo que las diferencias de comportamiento en seguridad pueden atribuirse a la aleatoriedad del entrenamiento y no a variaciones de datos o hiperparametros. La evaluacion se realizo sobre 6.226 prompts publicos de HarmBench, HarmBench con jailbreaks humanos, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench, con 20 respuestas muestreadas y una greedy por prompt, etiquetadas por WildGuard y Qwen3Guard.

## Capacidades

- Generacion de texto en ingles con ajuste de instrucciones (SFT) y preferencias (DPO).
- Comportamiento de rechazo ante peticiones daninas, objeto principal del estudio de seguridad.
- Robustez (o falta de ella) frente a jailbreaks, evaluada prompt a prompt con etiquetas publicas.
- Razonamiento basico y respuesta a instrucciones propio de un modelo de 1B; sin datos publicados de rendimiento especifico.
- Capacidades limitadas en matematicas y codigo por el filtrado del corpus de preentrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.
- Multilingue limitado al ingles.

## Casos de uso

- Investigacion sobre robustez frente a jailbreaks: comparar las seis revisiones sobre los mismos prompts de HarmBench o StrongREJECT para aislar el efecto de la semilla en que un ataque concreto tenga exito.
- Estudios de reproducibilidad en seguridad: usar las etiquetas de cerulean-works/castor-labels, indexadas por id de prompt, para replicar analisis estadisticos sobre variabilidad de rechazo.
- Analisis de calibracion de clasificadores guard: emplear las etiquetas de WildGuard y Qwen3Guard para medir el acuerdo entre jueces automaticos sobre respuestas de un modelo pequeno.
- Baseline en pipelines de evaluacion de seguridad: integrar el modelo como referencia de 1B en arneses de red-teaming que necesiten un modelo barato de ejecutar.
- Experimentos de ablacion de datos de preentrenamiento: al carecer de matematicas y codigo, sirve para contrastar con la variante castor-dolma1_7-no-code-1B y medir el efecto de esos dominios en el comportamiento de rechazo.
- Docencia y metodologia experimental: ilustrar en cursos disenos factoriales de semillas en entrenamiento de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible. La evaluacion publicada se limita a seguridad: 6.226 prompts de HarmBench, HarmBench con jailbreaks humanos, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench, con 20 respuestas muestreadas y una greedy por prompt, etiquetadas por WildGuard y Qwen3Guard. Las etiquetas por respuesta estan en el dataset cerulean-works/castor-labels; las generaciones no se han publicado.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 2 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, alrededor de 1 GB, y en 4 bits, por debajo de 1 GB (estimaciones a partir del tamano de 1B parametros; el autor no publica requisitos).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente en fp16; RTX 3060, RTX 4060, RTX 4090 o superiores permiten inferencia holgada.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna; tambien en CPU para pruebas puntuales.
- Opciones de despliegue: transformers con AutoModelForCausalLM.from_pretrained especificando la revision; el tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| castor-dolma1_7-no-math-code-1B | ~1B | no disponible | Seguridad y jailbreaks con diseno factorial de semillas | Apache 2.0 | Hugging Face (6 revisiones) |
| castor-dolma1_7-no-code-1B | ~1B | no disponible | Igual que el anterior, sin filtrar matematicas | Apache 2.0 | Hugging Face |
| allenai/DataDecide-dolma1_7-no-math-code-1B | ~1B | no disponible | Modelo base de preentrenamiento sin post-entrenamiento de seguridad | Apache 2.0 | Hugging Face |
| OLMo 2 1B Instruct | ~1B | no disponible | Asistente instruido generalista de Ai2 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigacion: el autor indica explicitamente que no es un asistente y no es adecuado para despliegue en produccion.
- Puede generar texto danino ante ciertos prompts; las etiquetas publicadas lo evidencian. No se publican las generaciones sobre prompts daninos.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Capacidad reducida en matematicas y codigo por el filtrado del corpus de preentrenamiento (variante no-math-code).
- Riesgo de alucinacion propio de un modelo de 1B sin datos de evaluacion de factualidad publicados.
- Sesgos no caracterizados en la informacion disponible.
- Las etiquetas de seguridad dependen de jueces automaticos (WildGuard y Qwen3Guard), con el margen de error que ello implica.
- Licencia Apache 2.0 para los pesos; los datos de post-entrenamiento son ODC-BY 1.0 con algunos subconjuntos bajo otras licencias, lo que conviene revisar antes de reutilizarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cerulean-works/castor-dolma1_7-no-math-code-1B
- Variante sin filtrado de codigo: https://huggingface.co/cerulean-works/castor-dolma1_7-no-code-1B
- Coleccion CASTOR: https://huggingface.co/collections/cerulean-works/castor
- Dataset de etiquetas: https://huggingface.co/datasets/cerulean-works/castor-labels
- Codigo de reproduccion: https://github.com/cerulean-works/castor
- Paper: https://arxiv.org/abs/2610.34074
- Modelo base: https://huggingface.co/allenai/DataDecide-dolma1_7-no-math-code-1B
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
