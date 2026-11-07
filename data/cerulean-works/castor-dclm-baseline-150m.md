# cerulean-works/castor-dclm-baseline-150M

## Resumen

castor-dclm-baseline-150M es un modelo de lenguaje de 150 millones de parámetros desarrollado por cerulean-works como parte de CASTOR, una familia de "seed-twinned language models" construida sobre los modelos base DataDecide de Ai2. El objetivo no es ofrecer un asistente utilizable, sino servir como instrumento de investigación: cada miembro de la familia parte de un checkpoint DataDecide idéntico en datos y receta, diferenciándose únicamente en la semilla de preentrenamiento, y recibe exactamente el mismo post-entrenamiento de seguridad (SFT seguido de DPO, siguiendo la receta de OLMo 2 1B Instruct) bajo varias semillas de post-entrenamiento distintas.

El modelo aborda una pregunta concreta: cuánto de la vulnerabilidad de un modelo frente a jailbreaks, medida prompt a prompt, viene determinado por la semilla de preentrenamiento y cuánto por el azar del post-entrenamiento. Para ello se publican doce revisiones (tres semillas de preentrenamiento por cuatro semillas de post-entrenamiento) y un conjunto de etiquetas de seguridad por respuesta sobre 6.226 prompts de benchmarks públicos.

Es relevante ahora porque ofrece una infraestructura reproducible y de bajo coste computacional para estudiar la variabilidad de comportamiento en seguridad. Al ser un modelo de 150M, se puede evaluar y replicar en hardware de consumo, lo que facilita la experimentación sobre robustez frente a jailbreaks sin depender de modelos de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de allenai/DataDecide-dclm-baseline-150M); detalles internos no disponibles |
| Parametros totales | 150M (según el nombre del modelo; no se detalla el desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato transformers estándar) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors vía transformers (tamaño del repo: 4,6 GB, incluye múltiples revisiones) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base allenai/DataDecide-dclm-baseline-150M, un transformer decoder-only de la suite DataDecide de Ai2. El post-entrenamiento replica la receta de OLMo 2 1B Instruct: una fase de SFT sobre allenai/tulu-3-sft-olmo-2-mixture-0225 seguida de DPO sobre allenai/olmo-2-0425-1b-preference-mix. Los checkpoints de partida son los del paso 37.500 de DataDecide, bajo tres semillas de preentrenamiento (`default`, `small-aux-2`, `small-aux-3`).

La innovación metodológica no está en la arquitectura sino en el diseño experimental: se generan doce revisiones cruzando tres semillas de preentrenamiento con cuatro semillas de post-entrenamiento, manteniendo constantes datos, hiperparámetros y receta. Cada revisión se publica como una rama del repositorio, accesible mediante el parámetro `revision` de `from_pretrained`. No se documentan en la información disponible detalles sobre el número de tokens de preentrenamiento ni sobre innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Comportamiento de rechazo (refusal) y respuestas ante prompts dañinos, moldeado por el SFT y el DPO de seguridad.
- Robustez (o falta de ella) frente a jailbreaks, incluyendo jailbreaks humanizados de HarmBench.
- Capacidad de servir como sujeto experimental para medir varianza inducida por semillas en comportamiento de seguridad.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación sobre variabilidad de semillas: replicar experimentos de seguridad cruzando las doce revisiones para cuantificar cuánta varianza en tasas de jailbreak se atribuye al preentrenamiento frente al post-entrenamiento.
- Auditoría de etiquetadores de seguridad: usar el dataset cerulean-works/castor-labels, con etiquetas de WildGuard y Qwen3Guard por respuesta, para comparar el comportamiento de ambos clasificadores sobre generaciones de modelos pequeños.
- Estudio de refusal calibration: analizar con XSTest y OR-Bench si el modelo rechaza en exceso prompts benignos tras el SFT y el DPO, y cómo varía entre semillas.
- Benchmarking de pipelines de evaluación de seguridad: validar herramientas propias de scoring de jailbreaks contra un conjunto de 6.226 prompts con etiquetas de referencia públicas.
- Docencia y formación: ilustrar en cursos de alineamiento cómo el azar de entrenamiento afecta al comportamiento de seguridad, con un modelo que cabe en hardware de consumo.
- Reproducibilidad de recetas de post-entrenamiento: verificar la receta SFT+DPO de OLMo 2 1B Instruct sobre bases de 150M y comparar desviaciones entre ejecuciones.
- Análisis de transferencia de ataques: comprobar si un jailbreak que funciona en una revisión se transfiere a las demás, dado que comparten datos y solo difieren en semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación publicada es exclusivamente de seguridad: 6.226 prompts de HarmBench, HarmBench con jailbreaks humanos, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench, con 20 respuestas muestreadas y una respuesta greedy por prompt, etiquetadas por WildGuard y Qwen3Guard. Las etiquetas por respuesta están en cerulean-works/castor-labels; las generaciones no se publican.

## Requisitos de hardware

- VRAM estimada: un modelo de 150M en fp32 ocupa aproximadamente 0,6 GB de pesos; en fp16, unos 0,3 GB; en cuantización de 8 bits, alrededor de 0,15 GB. La inferencia completa cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 3060, RTX 4060 o superior ofrece margen sobrado. Para evaluación masiva por lotes conviene una RTX 4090, A100 o H100 por throughput.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU discretas recientes, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers (biblioteca declarada), y por compatibilidad de pesos, llama.cpp, Ollama, vLLM o TGI si se convierten los pesos; no se documenta soporte oficial en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| castor-dclm-baseline-150M | 150M | no disponible | Investigación de seguridad con semillas gemelas | Apache 2.0 | Hugging Face, 12 revisiones |
| allenai/DataDecide-dclm-baseline-150M | 150M | no disponible | Base de preentrenamiento sin post-entrenamiento de seguridad | Apache 2.0 (según base) | Hugging Face |
| OLMo 2 1B Instruct | 1B | no disponible | Asistente instruido con receta SFT+DPO | Apache 2.0 | Hugging Face |
| cerulean-works/castor-dclm-baseline-25p-dolma1.7-75p-1B | 1B | no disponible | Variante CASTOR con mezcla de datos distinta | Apache 2.0 | Hugging Face |

La comparación relevante es con el base DataDecide, del que se diferencia solo por el post-entrenamiento de seguridad, y con OLMo 2 1B Instruct, cuya receta se replica a menor escala.

## Limitaciones y advertencias

- No es un asistente: el autor indica explícitamente que son modelos pequeños de investigación no aptos para despliegue.
- Puede producir texto dañino ante prompts adversarios, como muestran las etiquetas publicadas.
- Solo soporta inglés; no se documenta cobertura multilingüe.
- Riesgo de alucinación alto por su tamaño (150M) y por el dominio limitado de su post-entrenamiento.
- La longitud de contexto no está documentada, lo que impide planificar cargas de trabajo con entradas largas.
- Licencia Apache 2.0 para los pesos, pero los datos de post-entrenamiento son ODC-BY 1.0 con algunos subconjuntos bajo otras licencias; conviene revisar la procedencia antes de usos derivados.
- Las generaciones no se publican, solo las etiquetas, lo que limita la auditoría independiente de los outputs.
- No hay datos de benchmarks de capacidad ni de latencia, por lo que no debe usarse para comparaciones de rendimiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cerulean-works/castor-dclm-baseline-150M
- Colección CASTOR: https://huggingface.co/collections/cerulean-works/castor
- Dataset de etiquetas: https://huggingface.co/datasets/cerulean-works/castor-labels
- Paper (arXiv:2610.34074): https://arxiv.org/abs/2610.34074
- Código: https://github.com/cerulean-works/castor
- Modelo base: https://huggingface.co/allenai/DataDecide-dclm-baseline-150M
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
