# fse/bekko-aegis2-prompt-categories-classifier

## Resumen

`fse/bekko-aegis2-prompt-categories-classifier` es un clasificador lineal de prompts multiclase entrenado con scikit-learn sobre el encoder estático `hotchpotch/bekko-static-embedding-v1`. Lo desarrolla el usuario `fse` y forma parte de un par de cabezas (heads) de clasificación de seguridad que comparten encoder y tokenización: una predice seguridad binaria y esta predice diez categorías de contenido dañino. No es un modelo generativo ni un transformer entrenado de extremo a extremo, sino una regresión logística OneVsRest sobre embeddings congelados.

El modelo resuelve un problema concreto: clasificar prompts de entrada según categorías de riesgo (odio, contenido sexual, autolesión, violencia, armas ilegales, privacidad, planificación criminal, acoso, sustancias reguladas y blasfemias) para su uso en pipelines de moderación o filtrado previo a la inferencia. Se entrena sobre el dataset NVIDIA Aegis AI Content Safety 2.0, complementado con AART, hh-rlhf, jailbreak_llms y do-not-answer.

Es relevante por su enfoque de bajo coste computacional: al usar un encoder estático y una cabeza lineal, el artefacto pesa 0,4 GB y requiere una build específica de la librería `fse` (master con soporte multilabel o `fse` 2.1). Su licencia MIT y su integración con `fse.Heads` lo hacen atractivo para despliegues de moderación ligeros, aunque su validación y calibración presentan caveats importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder estático (`hotchpotch/bekko-static-embedding-v1`) + clasificador lineal LogisticRegression OneVsRest sobre StandardScaler |
| Parametros totales | 206.624.401 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; el clasificador lineal no se cuantiza habitualmente) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas: primero se codifica el prompt con el encoder estático `hotchpotch/bekko-static-embedding-v1` (revisión `c18167b8f244c1bc6de21ce9b710bac8a29c4615`, `normalize=False`, sin truncado de dimensión), y después se aplica un `StandardScaler` seguido de `LogisticRegression` (solver lbfgs, `max_iter=1000`, `C=0.1`, seed 17) envuelto en `OneVsRestClassifier` para las diez categorías. Se usan pesos de clase balanceados y `n_jobs=1` con hilos BLAS/OpenMP a 1. El artefacto conserva el encoder para poder agruparse con otras cabezas mediante `fse.Heads`, compartiendo una única pasada de tokenización y pooling.

El entrenamiento usa las 22.537 filas limpias del dataset NVIDIA Aegis 2.0 en proporciones naturales de clase. La selección de hiperparámetro `C` se hizo sobre `C=[0.1, 1.0, 10.0]`, optimizando Average Precision (AP) macro sobre etiquetas con al menos 20 positivos de validación; los empates eligen el `C` menor. El encoder Bekko sustituye a POTION solo si ambas ganancias de AP son de al menos 0,01. La normalización de prompts (`NFC`, colapso de espacios, trim, casefold, `prompt-normalize@1`) se usa para exclusión de fugas entre train, validación y test. Las etiquetas de categoría son positivas solo cuando `prompt_label` es unsafe y la categoría está nombrada; las filas con respuesta se descartan (solo se codifican prompts). Se excluyen `Threat` y `Sexual (minor)` por protocolo revisado.

## Capacidades

- Clasificación multilabel de prompts en diez categorías: `hate_identity_hate`, `sexual`, `suicide_self_harm`, `violence`, `guns_illegal_weapons`, `pii_privacy`, `criminal_planning_confessions`, `harassment`, `controlled_regulated_substances`, `profanity`.
- Salida de probabilidades (`output="proba"`) por categoría, con umbral estricto `> 0.5` (igualdad = falso).
- Integración con una cabeza de seguridad binaria (`fse/bekko-aegis2-prompt-safety-classifier`) para predicciones independientes sobre el mismo prompt.
- Soporte de agrupación de cabezas mediante `fse.Heads`, compartiendo tokenización y pooling en una sola pasada.
- No soporta tool calling, agentes, generación de texto, razonamiento multi-step ni capacidades multimodales.
- Capacidad monolingüe: solo inglés.

## Casos de uso

- Moderación previa a inferencia en APIs de LLM: clasificar cada prompt entrante en las diez categorías antes de enviarlo al modelo generativo, bloqueando o marcando según política. Adecuado por su bajo coste y su integración con `fse.Heads`.
- Filtrado de datasets de entrenamiento: etiquetar grandes volúmenes de prompts para excluir contenido dañino antes de usarlos en fine-tuning, aprovechando que solo codifica prompts (no respuestas).
- Sistemas de confianza y seguridad en plataformas de chat: detección de planificación criminal, autolesión o acoso en mensajes de usuario, con umbral configurable.
- Cumplimiento y auditoría: generar registros de categorías de riesgo por prompt para revisión humana o informes regulatorios, dado que el modelo devuelve etiquetas explícitas.
- Investigación en seguridad de IA: analizar la distribución de categorías en corpus de jailbreaks (jailbreak_llms) o prompts maliciosos, usando la cabeza como etiquetador débil.
- Enrutado de consultas sensibles: derivar prompts de `pii_privacy` o `controlled_regulated_substances` a flujos con revisión humana, mientras el resto sigue el pipeline automático.
- Prefiltro en pipelines de moderación de comunidades: combinar con la cabeza de seguridad binaria para una doble señal (safe/unsafe + categoría) con coste mínimo de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación held-out con Average Precision (AP) e intervalos percentiles al 95 % por subconjunto y etiqueta, pero la tabla de resultados aparece truncada en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repo pesa 0,4 GB; con 206,6 M de parámetros en safetensors, la inferencia cabe holgadamente en GPUs consumer con 4-8 GB de VRAM, e incluso en CPU para lotes pequeños.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 en adelante, A10, L4, A100, H100). Para moderación de alto throughput, una L4 o A10 es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB libres, e incluso en CPU.
- Opciones de despliegue: la librería `fse` (build master con soporte multilabel o `fse` 2.1) es el único camino documentado; no se indican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder estático más una regresión logística, se espera latencia muy baja en CPU/GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fse/bekko-aegis2-prompt-categories-classifier | Encoder estático + regresión logística multilabel | 206,6 M | no disponible | en | MIT | Hugging Face (requiere `fse` master/2.1) |
| fse/bekko-aegis2-prompt-safety-classifier | Encoder estático + regresión logística binaria | no disponible | no disponible | en | MIT | Hugging Face (mismo ecosistema) |
| Modelos de moderación tipo Llama Guard / Aegis (NVIDIA) | LLM generativo con clasificación | miles de millones | varios miles de tokens | multilingüe | variable | Hugging Face / NVIDIA NIM |

La comparativa directa con clasificadores lineales sobre embeddings estáticos es limitada: la ventaja de este modelo es su huella mínima (0,4 GB) y su coste de inferencia, frente a clasificadores generativos como Llama Guard, que ofrecen mayor contexto y razonamiento pero requieren GPUs de mayor capacidad. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no se ha validado en otros idiomas.
- Las puntuaciones no están calibradas: los pesos balanceados hacen que las probabilidades no sean probabilidades reales de intención dañina; el umbral binario es `logit > 0` y el de categorías `> 0.5` estricto.
- Las dos cabezas (seguridad y categorías) hacen predicciones independientes y pueden contradecirse.
- Riesgo de alucinación no aplica (no es generativo), pero sí de falsos positivos y negativos en la clasificación, especialmente en etiquetas con menos de 20 positivos de validación, marcadas como exploratorias y fuertemente inciertas.
- Exclusión de categorías `Threat` y `Sexual (minor)` por protocolo; no cubre esos riesgos.
- Dependencia de una build específica de `fse` (master con multilabel o 2.1); `fse` 2.0.0 no puede cargar el artefacto.
- La procedencia de AART no garantiza que todos los prompts derivados se detecten; los términos de la API de PaLM no se evaluaron.
- El modelo solo codifica prompts; las filas con respuesta y las etiquetas de respuesta se descartan, por lo que no evalúa contenido generado.
- Licencia MIT para la cabeza y el encoder, con atribución de fuentes (Aegis CC BY 4.0, hh-rlhf MIT, jailbreak_llms MIT, do-not-answer Apache-2.0); revisar obligaciones de atribución en uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/fse/bekko-aegis2-prompt-categories-classifier
- Cabeza de seguridad binaria: https://huggingface.co/fse/bekko-aegis2-prompt-safety-classifier
- Encoder base: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Dataset NVIDIA Aegis 2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Paper Aegis 2.0: https://arxiv.org/abs/2501.09004
- Paper AART: https://arxiv.org/abs/2311.08592
- Dataset hh-rlhf: https://huggingface.co/datasets/Anthropic/hh-rlhf
- Jailbreak LLMs (DAN): https://github.com/verazuo/jailbreak_llms
- Do-Not-Answer: https://github.com/Libr-AI/do-not-answer
- Copia de AART en GitHub: https://github.com/xxxx-dddd/aart-ai-safety-dataset/tree/fcdb2a8a3343a992cd8cbfd53eac797ac047c26f
