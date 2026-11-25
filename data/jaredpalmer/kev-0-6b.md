# jaredpalmer/kev-0.6b

## Resumen

Kev-0.6B es un modelo de decisión (decision model) desarrollado por jaredpalmer, distribuido como adaptador LoRA sobre el modelo base Qwen/Qwen3-0.6B-Base. A diferencia de un modelo generativo al uso, recibe un documento (el *state*) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una distribución de probabilidad por pregunta. No genera texto: su salida es una clasificación con probabilidades calibradas. Sirve al contrato público `/v1/systemone` de TypeSafe.

Se trata del miembro pequeño de la familia Kev y de la generación anterior (Qwen3), conservado como opción rápida en Apple Silicon: 0,12 s por petición de cinco preguntas frente a 0,33 s de Kev-0.8B. Es el mejor checkpoint de 0,6B bajo un protocolo de evaluación congelado y verificado con checksums, con una receta de datos (decision-v7) a lr 1e-4 y tres semillas. La arquitectura es un LM causal prefill-only con máscara de atención block-causal, un prefijo de estado compartido, una rama aislada por pregunta y un pointer head sobre los tokens de frontera de las opciones.

Su relevancia radica en que ofrece probabilidades calibradas (ECE de 0,086 in-domain) para tareas de decisión de opción múltiple con tipado estricto, en un tamaño que cabe en cualquier GPU de consumo y con latencia muy baja. No obstante, fuera de dominio su rendimiento se estabiliza en torno a 0,60 de accuracy, por lo que el propio autor recomienda Kev-4B o Kev-8B cuando prima la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal prefill-only con máscara block-causal y pointer head; adaptador LoRA (r=16) sobre Qwen3-0.6B-Base |
| Parametros totales | 0,6B (modelo base); adaptador LoRA r=16 sobre proyecciones de atención y MLP |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un LM causal prefill-only con máscara de atención block-causal. La entrada se estructura en un prefijo de estado compartido, una rama aislada por cada pregunta y un pointer readout sobre los tokens de frontera de las opciones. Las preguntas empaquetadas en una misma petición reciben exactamente las mismas probabilidades que obtendrían por separado (delta máximo medido de 4e-6). El adaptador LoRA tiene rango 16 y se aplica sobre las proyecciones de atención y MLP; el pointer head se entrena desde cero. La pérdida es entropía cruzada sobre la distribución de opciones.

El entrenamiento usa la suite congelada `evals/v7/decision-v7`, cuyo manifiesto fija las revisiones del dataset y del modelo base: 10.000 registros públicos (1.000 por fuente, diez fuentes), 896 registros de pares mínimos de política sobre nueve familias de plantillas y 1.680 registros de 60 estructuras de reglas generadas aleatoriamente. Se entrenan dos épocas con lr 1e-4, bf16 con pesos maestros en fp32, en una sola H100 durante aproximadamente 12 minutos. La aumentación incluye permutación de opciones, inserción de none-of-the-above, distractores y pares mínimos de none en el 25% de los registros Choice. No se usaron salidas de Jev para el entrenamiento. El protocolo de evaluación separa particiones de desarrollo (para seleccionar modelos) y una partición de test bloqueada que se lee como máximo una vez por candidato promocionado; cada resultado lleva el hash de la suite, los hashes de código y el commit de git.

## Capacidades

- Clasificación de decisión tipada con tres modos de salida: choice (elección entre opciones), noul (ninguna de las anteriores) y score (puntuación ordinal).
- Salida de distribuciones de probabilidad calibradas por pregunta en un único forward pass, sin generación de texto.
- Procesamiento de múltiples preguntas sobre un mismo estado en una sola petición, con independencia garantizada entre preguntas (delta máximo 4e-6).
- Manejo de la opción none-of-the-above, con accuracy de 0,80 en transfer-v1.
- Tipado estricto y contrato de API `/v1/systemone` de TypeSafe.
- Capacidad multilingüe: no disponible (solo inglés).
- Tool calling, agentes y razonamiento multi-paso: no disponible (el modelo no genera texto ni ejecuta acciones).

## Casos de uso

- Clasificación de intenciones en atención al cliente: el modelo recibe el estado de la conversación y un conjunto de intenciones candidatas, y devuelve la distribución de probabilidad sobre cada una en un solo paso, lo que permite enrutar tickets con umbrales de confianza calibrados.
- Moderación de contenido con opción de abstención: gracias al modo noul y a la calibración in-domain (ECE 0,086), se puede fijar un umbral de confianza para derivar a revisión humana los casos dudosos.
- Análisis de sentimiento ordinal: el modo score permite asignar niveles (por ejemplo, 1 a 5) sobre reseñas, aunque el autor advierte del colapso al nivel intermedio en preguntas Score con aritmética de fechas.
- Enrutamiento de consultas en pipelines RAG: dado un documento recuperado y varias preguntas de verificación tipadas, el modelo decide qué opción se sostiene, con latencia de 0,12 s por petición de cinco preguntas en Apple Silicon.
- Clasificación de tickets de soporte en categorías predefinidas: entrenado sobre fuentes como banking77, ag_news, dbpedia_14 y trec, es adecuado para taxonomías cerradas y estables.
- Evaluación de pares de frases para detección de paráfrasis o contradicción: con accuracy de transfer de 0,85 en QNLI y 0,59 en PAWS, sirve para triaje previo en pipelines de deduplicación o control de calidad de datos.
- Despliegue en entornos con memoria muy limitada: al ser un adaptador LoRA sobre un modelo de 0,6B, cabe en GPUs de consumo y en portátiles Apple Silicon, lo que permite clasificación local sin enviar datos a la nube.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Tarea / conjunto | Metrica | Valor |
|---|---|---|
| Decision tipada, decision-v4 dev (1.204 registros) | Accuracy | 0,801 |
| Decision tipada, decision-v4 dev | ECE (probabilidades raw) | 0,086 |
| Decision tipada, transfer-v4 dev (764 registros, out-of-domain) | Accuracy | 0,620 |
| Decision tipada, transfer-v4 dev | Brier score | 0,536 |
| Test bloqueado, in-distribution | Accuracy | 0,808 |
| Test bloqueado, in-distribution | Brier / ECE | 0,266 / 0,089 |
| Test bloqueado, out-of-domain | Accuracy | 0,642 |
| Test bloqueado, out-of-domain | Brier / ECE / errores confiados | 0,483 / 0,128 / 7,9% |

Transfer por fuente: QNLI 0,85; SciQ 0,93; TweetEval-offensive 0,69; PAWS 0,59; Emotion 0,49; MMLU 0,50; estructuras de política no entrenadas cerca del azar.

Comparación con generaciones anteriores y con Jev en los mismos conjuntos de desarrollo congelados:

| Modelo | In-distribution (decision-v4 dev) | Out-of-domain (transfer-v4 dev) |
|---|---|---|
| Kev-0.5B | 0,712 | 0,561 |
| Kev-0.6B (este) | 0,801 | 0,620 |
| Jev (typesafe-ai/jev) | 0,845 | 0,857 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo base de 0,6B, la huella es muy reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el autor reporta entrenamiento en una sola H100 (~12 min); para inferencia no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (0,6B). El autor lo posiciona como opción rápida en Apple Silicon.
- Opciones de despliegue: no disponible en la información proporcionada (el repositorio es PEFT; el autor remite a su repositorio de código para el despliegue).
- Latencia: 0,12 s por petición de cinco preguntas en Apple Silicon, frente a 0,33 s de Kev-0.8B. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | In-domain (dev) | Out-of-domain (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kev-0.6B | 0,6B (+LoRA r=16) | no disponible | 0,801 | 0,620 | apache-2.0 | Hugging Face (jaredpalmer/kev-0.6b) |
| Kev-0.5B | 0,5B (Qwen2.5-0.5B) | no disponible | 0,712 | 0,561 | no disponible | generación anterior de la familia Kev |
| Kev-0.8B | 0,8B | no disponible | no disponible (0,668 en test bloqueado) | no disponible (0,642 en test bloqueado) | no disponible | Hugging Face (jaredpalmer/kev-0.8b) |
| Jev | no disponible | no disponible | 0,845 | 0,857 | no disponible | typesafe-ai/jev vía Vercel AI Gateway |

## Limitaciones y advertencias

- Fuera de dominio es un modelo de 0,6B: la accuracy de transfer se mantiene plana en torno a 0,60 en todas las mutaciones de hiperparámetros probadas (ocho mutaciones de un knob, tres semillas). La receta a 4B alcanza 0,72–0,75 y a 8B 0,74–0,77; el cuello de botella es la capacidad, no los datos.
- El razonamiento sobre políticas no entrenadas falla: en pares de política programáticos con estructura de reglas nunca vista, la tasa de acierto en ambos hermanos es del 6–11% (Kev-4B 0,73; Jev 0,86).
- Hedging ordinal: en preguntas Score de tres niveles con aritmética de fechas colapsa al nivel intermedio.
- Tasa de errores confiados fuera de dominio del 11% (confianza ≥0,9 y respuesta incorrecta); ECE raw de 0,09 in-domain y 0,15 out-of-domain. Las probabilidades son utilizables in-domain, pero deben tratarse como orientativas fuera de él.
- Solo soporta inglés.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí hay riesgo de clasificaciones erróneas con alta confianza fuera de dominio.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia apache-2.0, que permite uso comercial; deben respetarse las condiciones del modelo base Qwen3-0.6B-Base.
- En producción conviene medir sobre datos propios: el propio autor lo recomienda explícitamente para este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/jaredpalmer/kev-0.6b
- Repositorio de código, suites y resultados: https://github.com/jaredpalmer/kev
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Kev-0.8B (recomendado para precisión): https://huggingface.co/jaredpalmer/kev-0.8b
- Jev (typesafe-ai): https://huggingface.co/typesafe-ai/jev
- Datasets de entrenamiento: legacy-datasets/banking77, google/boolq, fancyzhx/ag_news, nyu-mll/multi_nli, SetFit/sst5, Yelp/yelp_review_full, CogComp/trec, fancyzhx/dbpedia_14, SetFit/amazon_reviews_multi_en, stanfordnlp/imdb
