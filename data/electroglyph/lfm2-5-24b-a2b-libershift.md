# electroglyph/LFM2.5-24B-A2B-libershift

## Resumen

LFM2.5-24B-A2B-libershift es una edición de pesos del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario electroglyph bajo la técnica denominada LiberShift. No se trata de un modelo entrenado desde cero ni de un fine-tuning con datos: es una modificación quirúrgica de los pesos del modelo base orientada a eliminar la dirección de rechazo (refusal direction) aprendida en la capa 30, con el objetivo de reducir la tasa de respuestas evasivas o negativas ante peticiones que el modelo original rechazaría.

El modelo conserva la arquitectura y el tamaño del original: 23.971.585.280 parámetros totales según los safetensors publicados, con un repositorio de 48,5 GB en formato transformers/safetensors. El tag `lfm2_moe` del repositorio indica que el modelo base es una mezcla de expertos (MoE), aunque la model card no detalla el número de parámetros activos ni la longitud de contexto; el nombre "A2B" sugiere del orden de 2B de parámetros activos, pero no se confirma en la información disponible.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de edición de pesos orientada a modificar el comportamiento de seguridad de un modelo; por otro, sirve como referencia metodológica, ya que el autor publica parámetros de reproducción, métricas de refusal, divergencia KL respecto al base y perplejidad en wikitext-2. Es importante señalar que la licencia es "other" y que el modelo base pertenece a LiquidAI, por lo que las condiciones de uso comercial deben verificarse en la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `lfm2_moe`); detalles de capas y expertos no disponibles |
| Parametros totales | 23.971.585.280 |
| Parametros activos | no disponible (el nombre "A2B" sugiere ~2B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-24B-A2B, un transformer con mezcla de expertos según el tag `lfm2_moe`. Sobre él, electroglyph aplica una edición de pesos LiberShift que combina dos operaciones: una eliminación densa de la dirección de rechazo de la capa 30 (residual plane 30) en todos los "write atoms", y una redirección mediante gradiente de aceptación sobre el 10 % de átomos más eficientes, con fuerza gamma=0.75. El conjunto de átomos de escritura asciende a 3.841.024, de los cuales se redirigen 384.102, con una carga de redirección de 35,1 sobre 58,8.

No hay entrenamiento con datos nuevos ni RLHF/DPO en esta edición: el proceso es una modificación post-hoc de pesos guiada por estadísticas de activación y gradientes calculados sobre 400 prompts de ajuste y 400 de gradiente. El autor fija los datasets de trabajo: mlabonne/harmless_alpaca y mlabonne/harmful_behaviors para ajuste y evaluación, JailbreakBench/JBB-Behaviors y PKU-Alignment/BeaverTails como conjunto held-out de 300 prompts, y Salesforce/wikitext (wikitext-2-raw-v1) para medir perplejidad. El entorno de reproducción declarado es torch 2.14.1+cu132, transformers 5.20.1 y una NVIDIA RTX PRO 6000 Blackwell Server Edition.

## Capacidades

- Generación de texto conversacional y multi-turno, heredada del modelo base LFM2.5-24B-A2B.
- Razonamiento con modo de pensamiento: la model card menciona explícitamente el marcador `` y evalúa el texto posterior al bloque de pensamiento.
- Reducción de rechazos: la edición busca disminuir respuestas evasivas; según las métricas del autor, la tasa de refusal baja de 85/100 en el base a 50/100 con la configuración q0.9_g0.75.
- Tool calling y function calling: no confirmado en la información disponible; probablemente heredado del base, pero sin verificación.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Visión y audio: no disponibles; el pipeline es text-generation.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como objeto de estudio para medir cómo una edición de pesos afecta a la tasa de rechazo, la divergencia KL y la perplejidad, con parámetros de reproducción publicados.
- Evaluación de robustez frente a jailbreaks: al reducir la tasa de refusal en el conjunto held-out (de 174/300 a 79/300 en q0.9_g0.75), permite estudiar la resistencia de las salvaguardas del modelo base.
- Generación creativa sin filtros excesivos: para escritura de ficción, guiones o diálogos donde el modelo base tiende a rechazar contenido sensible, con la advertencia de que la licencia y el uso responsable son responsabilidad del usuario.
- Experimentación con técnicas de edición de pesos: la model card documenta planos, átomos, gamma y métricas, lo que facilita replicar o comparar variantes de LiberShift frente a Heretic.
- Análisis de degradación de capacidades: la perplejidad en wikitext-2 (38,03 en base frente a 38,51 en q0.9_g0.75) permite estudiar el coste de la edición en calidad lingüística.
- Despliegue en pipelines de transformers: al ser un repositorio compatible con la librería transformers y con pesos safetensors, puede cargarse en entornos de investigación con GPUs de gran memoria (el repo pesa 48,5 GB).
- Comparación de metodologías de "uncensoring": útil para contrastar LiberShift con aproximaciones como Heretic, que en la misma tabla alcanza 8/100 de refusal pero con KL de 0,0410 frente a 0,7946.

## Benchmarks y rendimiento

Los datos publicados por el autor no son benchmarks estándar (MMLU, HumanEval, GSM8K), sino métricas de comportamiento y calidad bajo su propio arnés de evaluación: system prompt del autor, sin prefijo, greedy con 100 tokens nuevos, scorer de marcador crudo sobre texto completo y texto posterior a ``, sobre 100 prompts de mlabonne/harmful_behaviors y un held-out de 300 prompts (JailbreakBench + BeaverTails unsafe). La columna "heretic prot." corresponde a la evaluación exacta de Heretic.

| Edición | Refusal | Post-think | Held out | Heretic prot. | KL | PPL (wikitext-2) |
|---|---|---|---|---|---|---|
| base | 85/100 | 85/100 | 174/300 | 99/100 | -0,0000 | 38,03 |
| libershift_q0.95_g0.45 | 58/100 | 58/100 | 94/300 | 95/100 | 0,6362 | 38,98 |
| libershift_q0.95_g0.75 | 51/100 | 51/100 | 88/300 | 86/100 | 0,7313 | 38,36 |
| libershift_q0.9_g0.45 | 59/100 | 59/100 | 97/300 | 87/100 | 0,6955 | 38,26 |
| libershift_q0.9_g0.75 | 50/100 | 50/100 | 79/300 | 83/100 | 0,7946 | 38,51 |
| heretic | 8/100 | 7/100 | 28/300 | 7/100 | 0,0410 | 38,54 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 23,97B parámetros en safetensors y un repo de 48,5 GB, la carga en precisión completa requiere del orden de 48 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: el autor reporta ejecuciones en NVIDIA RTX PRO 6000 Blackwell Server Edition; para inferencia en precisión completa se necesitan GPUs de 80 GB o superiores (A100 80GB, H100 80GB, H200).
- GPU de consumo: no cabe en GPUs consumer de 24 GB en precisión completa; requeriría cuantización, y no se publican pesos GGUF en el repositorio.
- Opciones de despliegue: transformers (librería declarada); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Refusal (100 prompts) | KL vs base | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B-libershift (q0.9_g0.75) | 23,97B totales | no disponible | 50/100 | 0,7946 | other | Hugging Face |
| LiquidAI/LFM2.5-24B-A2B (base) | 23,97B totales | no disponible | 85/100 | -0,0000 | other | Hugging Face |
| Variante heretic del mismo base | 23,97B totales | no disponible | 8/100 | 0,0410 | other | Hugging Face |

La comparativa se limita al mismo modelo base y a la variante Heretic evaluada por el autor, ya que no se dispone de datos de benchmarks estándar ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La edición reduce la tasa de rechazo pero no la elimina: en la configuración más agresiva publicada (q0.9_g0.75) la tasa de refusal es 50/100, frente a 8/100 de la variante Heretic.
- La divergencia KL respecto al base es alta (0,7946 en q0.9_g0.75), lo que indica un cambio sustancial en la distribución de salida y riesgo de degradación en tareas fuera del conjunto evaluado.
- La perplejidad en wikitext-2 sube de 38,03 a 38,51, una degradación modesta pero medible en calidad lingüística.
- Riesgo de alucinación: no evaluado en la información disponible; la edición no está diseñada para mejorar la factualidad.
- Sesgos conocidos: no documentados; al heredar el modelo base, puede reproducir sesgos de este.
- Idiomas soportados: no declarados; no hay garantía de comportamiento multilingüe.
- Licencia "other": las condiciones de uso comercial dependen de la licencia del modelo base LiquidAI/LFM2.5-24B-A2B y deben verificarse antes de cualquier despliegue en producción.
- Uso responsable: la finalidad declarada es reducir rechazos; el usuario asume la responsabilidad legal y ética del contenido generado.
- Sin datos de benchmarks estándar ni de rendimiento en producción (latencia, throughput, cuantización), lo que limita la evaluación para despliegues reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-libershift
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Dataset de ajuste/evaluación harmless: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset de ajuste/evaluación harmful: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Conjunto held-out JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Conjunto held-out BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset de perplejidad: https://huggingface.co/datasets/Salesforce/wikitext
