# MulticulturalAlignment/scpo-reward-model-mexico

## Resumen

El modelo `MulticulturalAlignment/scpo-reward-model-mexico` es un modelo de recompensa escalar (reward model) obtenido por ajuste fino completo de `OpenAssistant/reward-model-deberta-v3-base`, un transformer encoder DeBERTa-v2 de 184.422.913 parametros. Lo desarrolla el grupo MulticulturalAlignment en el marco del algoritmo SCPO (Steerable Cultural Preference Optimization), presentado en el paper "Steerable Cultural Preference Optimization of Reward Models" (arXiv:2606.18606), aceptado en el taller Pluralistic Alignment de ICML 2026. El modelo asigna una puntuacion escalar a un par prompt-respuesta: puntuaciones mas altas indican una respuesta preferida para el mismo prompt. No genera texto.

El problema que aborda es la alineacion pluralista: la investigacion en alineacion de LLM ha tendido a predecir una preferencia unica y agregada de anotadores de ciertas regiones, lo que homogeneiza el comportamiento de los modelos. SCPO parte de un reward model global entrenado con preferencias humanas agregadas y lo reentrena por pais para que refleje mejor las preferencias de usuarios residentes en ese pais, sin perder el comportamiento general. Esta ficha corresponde a la variante de Mexico, entrenada sobre pares de preferencia del dataset PRISM filtrados por residencia de los participantes.

Es relevante ahora porque ofrece un artefacto abierto (licencia MIT), pequeno y desplegable en hardware de consumo, para investigar alineacion cultural y para usarse como funcion de recompensa en pipelines de RLHF/DPO que necesiten una senal de preferencia especifica de una subcomunidad, en lugar de una senal global unica. Las cifras registradas por los autores en su experimento pasan del 51,6393% de accuracy global del modelo de partida al 64,7541% del modelo SCPO sobre el split de test fijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v2 con cabeza de clasificacion escalar (regresion de recompensa) |
| Parametros totales | 184.422.913 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens en entrenamiento (entradas recortadas y con padding a 512); el modelo base DeBERTa-v2 emplea embeddings de posicion relativa. Maximo oficial no disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF ni versiones cuantizadas) |
| Idiomas soportados | en (ingles); la muestra del dataset es de predominancia inglesa |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,7 GB, libreria transformers) |

## Arquitectura y entrenamiento

La base es DeBERTa-v2 en configuracion base, con 184,4 millones de parametros y embeddings de posicion relativa desacoplados. Sobre esa base, `OpenAssistant/reward-model-deberta-v3-base` (revision `7dab4156e63944834c3aae169c3fe83955672cff`) aporta una cabeza de clasificacion que produce un logit escalar en lugar de una distribucion de clases. SCPO realiza un ajuste fino de modelo completo partiendo de ese reward model global, sin congelar capas.

Los datos provienen del dataset PRISM (`HannahRoseKirk/prism-alignment`, revision `18ab5cfb37456f4ec8cbc00212ce54cf7b1239f6`), restringido a pares de preferencia de participantes residentes en Mexico. Se excluyen los empates en las valoraciones humanas y se divide a los usuarios de la encuesta con un esquema 85/15. Los hiperparametros registrados son: learning rate 1e-05, tamano de batch 8, 1024 pasos de optimizador, tau de filtrado 0,7 y beta de ponderacion 1,1. Las entradas originales de entrenamiento se construyen con la concatenacion literal `prompt + " [SEP] " + response`, recortadas y con padding a 512 tokens. Las semillas registradas son: shuffle de datos 0, split de encuesta y modelo 0, Trainer 42; la semilla de datos del Trainer queda sin definir.

La innovacion tecnica del metodo es el propio algoritmo SCPO: en lugar de entrenar un reward model por cultura desde cero o de mezclar culturas en un unico objetivo, reentrena el modelo global por pais con un esquema de filtrado (tau) y ponderacion (beta) que pretende incorporar preferencias culturales diversas de forma equilibrada sin degradar el comportamiento general. El repositorio incluye los artefactos de reproducibilidad (`release-settings.json`, `provenance.json`, `requirements-pw-lock.txt`) y el script de pais junto con el trainer y el collator sin modificar bajo `reproduction/`.

## Capacidades

- Puntuacion escalar de pares prompt-respuesta: devuelve un unico valor (logit) por par, util como funcion de recompensa.
- Clasificacion de texto (`pipeline_tag: text-classification`) mediante `AutoModelForSequenceClassification` con una sola etiqueta.
- Modelado de preferencias especificas de Mexico, segun la residencia declarada de los participantes de PRISM.
- Uso como senal de recompensa en optimizacion de preferencias (RLHF, DPO y variantes) para ajustar o filtrar respuestas de un LLM.
- Evaluacion comparativa de respuestas candidatas para un mismo prompt, ordenandolas por puntuacion.
- Compatibilidad con el stack de Hugging Face: transformers, text-embeddings-inference y endpoints compatibles, segun los tags del repositorio.
- No soporta generacion de texto, tool calling, function calling, agentes, vision ni audio: es exclusivamente un modelo de recompensa.
- Capacidades multilingues: no disponibles; la model card indica una muestra de predominancia inglesa.

## Casos de uso

- Filtrado de respuestas en un pipeline de RLHF: usar el modelo como reward model para puntuar pares generados por una politica y reordenar o descartar candidatos con baja recompensa antes del paso de optimizacion.
- Ajuste supervisado por preferencias con DPO o variantes: emplear las puntuaciones del modelo para etiquetar pares preferido/rechazado en un corpus propio orientado a audiencias mexicanas.
- Investigacion en alineacion pluralista: comparar el comportamiento de este checkpoint frente al reward model global de partida para medir el efecto de SCPO sobre preferencias localizadas.
- Auditoria de sesgo cultural en LLM: evaluar un mismo conjunto de respuestas generadas y comprobar que respuestas premia un modelo alineado con preferencias de residentes en Mexico frente a uno agregado.
- Construccion de conjuntos de evaluacion culturales: generar rankings de respuestas con el modelo para curar datasets de evaluacion especificos de subcomunidad.
- Seleccion de respuestas en un asistente conversacional: como segunda etapa de un sistema generate-and-rank, el modelo puntua las candidatas y se sirve la mejor segun el criterio cultural objetivo, con un coste de computo bajo por su tamano.
- Experimentos de reproducibilidad y ensenanza: el paquete incluye script de reproduccion, configuraciones de release y bloqueos de dependencias, lo que permite replicar el ajuste en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La model card unicamente registra cifras de accuracy del experimento original, medidas en memoria tras el post-entrenamiento y sin reinicio de estado aleatorio ni cambio de modo del modelo:

| Medicion | Accuracy |
|---|---:|
| Modelo global de partida, global | 51,6393% |
| Modelo SCPO (Mexico), global | 64,7541% |

Los autores advierten de que estas cifras corresponden a un experimento con configuraciones ajustadas sobre un split de test fijo y difieren de las medias de tres ejecuciones del paper. Una sesion de inferencia nueva con `eval()` desactiva el dropout y puede producir una accuracy distinta. El fichero `validation.json` solo comprueba la carga y la inferencia finita y repetible sobre sondas genericas; no es un resultado de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,74 GB con pesos en fp32 y unos 0,37 GB en fp16 o bf16, mas el espacio de activaciones segun el tamano de lote y la longitud de secuencia (hasta 512 tokens).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM. No requiere A100, H100 ni aceleradores de gama alta para inferencia.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1660 y similares; tambien en CPU para lotes pequenos.
- Opciones de despliegue: transformers en Python, text-embeddings-inference (segun los tags del repositorio) y endpoints compatibles de Hugging Face. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion y una comprobacion manual de la cabeza de regresion. El soporte en vLLM no esta confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento registrado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scpo-reward-model-mexico | 184.422.913 | 512 tokens en entrenamiento | 64,7541% de accuracy en el split de test del experimento SCPO | MIT | Pesos safetensors en Hugging Face |
| OpenAssistant/reward-model-deberta-v3-base | no disponible en la informacion proporcionada | 512 tokens en entrenamiento | 51,6393% de accuracy como modelo global de partida en el mismo experimento | MIT | Pesos publicos en Hugging Face |
| Otros checkpoints por pais del mismo release SCPO | no disponible | no disponible | no disponible | MIT (segun el release) | no disponible |
| Reward models de mayor tamano basados en DeBERTa (por ejemplo variantes large) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de benchmarks estandar entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo una puntuacion escalar por par prompt-respuesta.
- Las puntuaciones no son probabilidades y no estan calibradas entre modelos distintos; no se deben comparar valores absolutos entre checkpoints.
- La etiqueta de pais refleja la residencia de los participantes de la encuesta, no una caracterizacion representativa de la cultura de Mexico ni de las preferencias de todos sus residentes.
- La muestra del dataset es de predominancia inglesa y los conjuntos de test por pais son pequenos, lo que limita la generalizacion.
- No esta validado para tomar decisiones consecuentes sobre personas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de puntuaciones espurias fuera de la distribucion de entrenamiento; el modelo no verifica hechos.
- Restricciones de licencia: los pesos ajustados se publican bajo MIT y el modelo base tambien esta marcado como MIT. No obstante, la tarjeta del dataset PRISM indica texto humano bajo CC-BY-4.0 y respuestas de modelo bajo CC-BY-NC-4.0, sujetas a los terminos de los proveedores originales. El paquete no incluye registros de PRISM, por lo que la validacion de uso comercial depende de la procedencia de los datos que se usen con el modelo.
- Las cifras de accuracy publicadas provienen de un experimento con configuraciones ajustadas sobre un split fijo y sin reinicio de estado aleatorio; no deben tratarse como un benchmark reproducible sin mas.
- El repositorio no publica pesos cuantizados ni versiones GGUF, lo que limita el despliegue en entornos de inferencia en CPU o en herramientas que dependan de ese formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MulticulturalAlignment/scpo-reward-model-mexico
- Paper (arXiv:2606.18606): https://arxiv.org/abs/2606.18606
- PDF del paper en OpenReview: https://openreview.net/pdf/f7ee09efa6ae3225b187fc05e79a67ee0da9d51d.pdf
- Pagina del taller en ICML 2026: https://icml.cc/virtual/2026/75659
- Codigo (GitHub): https://github.com/minsik-ai/Steerable-Cultural-Preference
- Modelo base: https://huggingface.co/OpenAssistant/reward-model-deberta-v3-base
- Dataset PRISM: https://huggingface.co/datasets/HannahRoseKirk/prism-alignment
- Licencia MIT: https://opensource.org/license/mit
