# cbmusetti/reward-model-english_and_spanish_with_ties

## Resumen

El modelo `cbmusetti/reward-model-english_and_spanish_with_ties` es un modelo de recompensa (reward model) de tipo pairwise desarrollado por Carlos Musetti (usuario `cbmusetti`) en el contexto de una tesis sobre generación de humor mediante aprendizaje por refuerzo. Su función es puntuar pares de chistes candidatos para una misma noticia, de forma que el chiste preferido por humanos reciba una recompensa mayor. Está afinado a partir de `google-bert/bert-base-multilingual-cased`, por lo que hereda la arquitectura encoder de BERT y su naturaleza multilingüe, aunque el entrenamiento se limita al inglés y al español.

La variante `with_ties` implementa un modelo Bradley-Terry con un umbral de empate aprendido: cuando dos chistes se consideran igual de graciosos, el par se trata como empate en lugar de forzar una preferencia estricta. Esto es relevante en tareas de preferencia subjetiva, donde las anotaciones humanas suelen contener empates y forzar una ordenación binaria introduce ruido. El modelo se distribuye como checkpoint de clasificación de secuencias de `transformers` más un wrapper de configuración propio, y requiere el código de la tesis para restaurar parámetros como la longitud máxima o el umbral de empate.

El repositorio ocupa 6,5 GB e incluye dos carpetas: `best_trial/` (el mejor ensayo individual de Optuna) y `ensemble/` (el modelo final, media de recompensas de varios miembros reentrenados sobre train + validación). La licencia es MIT y el modelo tiene, en el momento de la consulta, 0 descargas y 0 likes, lo que indica que es un artefacto de investigación de nicho más que un modelo de producción ampliamente adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingual) con cabeza de clasificación de secuencias y wrapper de reward model pairwise |
| Parametros totales | no disponible (modelo base BERT-base multilingual-cased, ~178 M de parámetros; el total del wrapper no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`max_length` del mejor trial) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | inglés (en) y español (es) |
| Licencia | MIT |
| Formato de pesos | safetensors, con config de wrapper propia cargada mediante el código de la tesis |
| Modelo base | google-bert/bert-base-multilingual-cased |
| Variante | RewardModelWithTies (Bradley-Terry con umbral de empate aprendido) |
| Tamano del repositorio | 6,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-multilingual-cased`, un encoder transformer de tipo BERT en su variante multilingüe con casing preservado. Sobre él se añade una cabeza de clasificación de secuencias que produce una puntuación de recompensa para cada par (noticia, chiste). La variante `with_ties` implementa un esquema Bradley-Terry con un umbral de empate aprendido, de modo que la función de pérdida permite que pares igualmente graciosos se clasifiquen como empate en lugar de imponer una preferencia estricta. El wrapper propio del repositorio encapsula la longitud máxima, el umbral de empate y otros parámetros necesarios para reproducir la inferencia exactamente como en entrenamiento.

El entrenamiento se realizó sobre un corpus de pares anotados: 5.081 pares de entrenamiento, 823 de validación y 2.605 de test, con semilla de partición 42 y empates conservados. El mejor ensayo de Optuna (trial 9) usó batch size 64, dropout 0,1591, learning rate del encoder 3,422e-05, learning rate de la cabeza 4,117e-05, 3 épocas, estrategia de congelación `last_6` (solo se ajustan las seis últimas capas del encoder), decaimiento de learning rate por capa 0,8642, scheduler lineal con warmup ratio 0,02265 y weight decay 0. El objetivo de validación del mejor trial fue 0,4751. El modelo final (`ensemble/`) reentrena la configuración ganadora sobre train + validación una vez por semilla y promedia las recompensas entre miembros. No se documenta en la información disponible el uso de RLHF, DPO ni datos de preferencia adicionales más allá de los pares anotados.

## Capacidades

- Puntuación de recompensa pairwise: dado un texto de noticia y dos chistes candidatos, asigna una puntuación a cada uno para determinar cuál es preferible.
- Modelado de empates: el umbral aprendido permite clasificar pares como empate cuando la diferencia de recompensa es pequeña.
- Comprensión bilingüe inglés-español heredada del modelo base multilingüe.
- Clasificación de secuencias: la cabeza de salida produce una puntuación escalar por par (noticia, chiste).
- Integración en pipelines de aprendizaje por refuerzo como función de recompensa para generación de humor.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad de razonamiento general y matemáticas: no evaluada ni documentada en la información disponible.

## Casos de uso

- Entrenamiento por refuerzo de generadores de chistes: el modelo actúa como función de recompensa en un bucle RL, puntuando cada chiste generado frente a una noticia y guiando al generador hacia salidas preferidas por humanos. Es su propósito original y el escenario para el que fue diseñado.
- Filtrado y ranking de candidatos en sistemas de generación de humor: dado un conjunto de chistes generados para una noticia, el modelo los ordena por recompensa estimada y permite seleccionar el mejor antes de publicarlo.
- Evaluación automática de sistemas de generación de humor: sirve como métrica aprendida de preferencia humana para comparar variantes de un generador sin recurrir a anotación manual en cada iteración.
- Investigación en modelado de preferencias con empates: la variante `with_ties` permite estudiar cómo afecta el tratamiento de empates al entrenamiento de reward models en tareas subjetivas.
- Reentrenamiento y ajuste fino sobre dominios periodísticos: al recibir una noticia como contexto, puede adaptarse a dominios concretos (noticias deportivas, políticas, tecnológicas) reentrenando sobre pares anotados de ese dominio.
- Reproducción de experimentos académicos: el repositorio incluye el mejor trial y el ensemble, lo que permite reproducir resultados de la tesis y comparar configuraciones de hiperparámetros.
- Despliegue en entornos con recursos limitados: al partir de BERT-base (~178 M de parámetros) y una longitud máxima de 256 tokens, la inferencia es viable en GPU de gama media, aunque el repositorio completo ocupa 6,5 GB por incluir múltiples artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento documentado es el objetivo de validación del mejor trial de Optuna (0,4751), que no es directamente comparable con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al derivar de BERT-base (~178 M de parámetros), la inferencia en fp32 requiere del orden de 1 GB o menos, y en fp16 aproximadamente la mitad, aunque el wrapper y el ensemble pueden aumentar el consumo.
- GPU recomendadas: no documentadas por el autor; por tamaño del modelo base, cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en fp16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño del encoder base.
- Opciones de despliegue: el autor indica cargar el modelo mediante el código de la tesis (`load_ensemble_from_hub` y `load_best_trial_from_hub`), que restaura el wrapper. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cbmusetti/reward-model-english_and_spanish_with_ties | no disponible (base BERT-base ~178 M) | 256 tokens | en, es | MIT | Reward model pairwise con empates, orientado a humor |
| cbmusetti/reward-model-english_and_spanish_without_ties | no disponible (base BERT-base ~178 M) | no disponible | en, es | no disponible | Variante sin empates del mismo autor |
| google-bert/bert-base-multilingual-cased | ~178 M | 512 tokens | multilingüe | Apache 2.0 | Modelo base; no es un reward model por sí mismo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está entrenado específicamente para puntuar chistes asociados a noticias; su uso fuera de ese dominio no está validado.
- Sesgos: al entrenarse sobre anotaciones humanas de humor, puede heredar sesgos culturales, de género o de tema presentes en los datos de anotación; no se documenta un análisis de sesgos.
- Riesgo de alucinación: al ser un modelo de puntuación y no generativo, el riesgo de alucinación se manifiesta como puntuaciones poco fiables fuera de la distribución de entrenamiento.
- Limitación de contexto: `max_length` de 256 tokens, insuficiente para noticias largas o chistes extensos sin truncado.
- Cobertura lingüística limitada a inglés y español, aunque el modelo base sea multilingüe.
- Dependencia del código de la tesis: los pesos requieren el wrapper del repositorio `carlos-musetti/tesis` para cargarse correctamente; no es un checkpoint estándar de `transformers` autónomo.
- Adopción mínima: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base (Apache 2.0) para cumplimiento.
- Tamaño del repositorio de 6,5 GB: incluye múltiples artefactos (best trial y ensemble), lo que puede complicar el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/cbmusetti/reward-model-english_and_spanish_with_ties
- Variante sin empates: https://huggingface.co/cbmusetti/reward-model-english_and_spanish_without_ties
- Perfil del autor: https://huggingface.co/cbmusetti
- Repositorio de la tesis (código y logs): https://github.com/carlos-musetti/tesis
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
