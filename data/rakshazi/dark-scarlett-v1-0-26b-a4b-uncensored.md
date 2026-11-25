# rakshazi/Dark-Scarlett-v1.0-26B-A4B-Uncensored

## Resumen

Dark-Scarlett-v1.0-26B-A4B-Uncensored es un ajuste fino del modelo ReadyArt/Dark-Scarlett-v1.0-26B-A4B, a su vez un fine-tune de un modelo Gemma 4 con arquitectura MoE (mezcla de expertos). Lo desarrolla el usuario rakshazi como experimento personal y lo publica sin garantias. El objetivo declarado es eliminar los rechazos (refusals) del modelo original mediante técnicas de abliteration, aplicando un prebake EGA (Expert Gradient Ablation) seguido de una búsqueda de hiperparámetros con la herramienta heretic 2.1.0. El modelo resultante pasa de 606 rechazos estrictos sobre 686 prompts a 0, a costa de una caída notable en MMLU.

El modelo tiene 25.805.933.872 parámetros totales (unos 25,8 mil millones) según los pesos en safetensors, con un repositorio de 51,7 GB. La nomenclatura "A4B" sugiere 4 mil millones de parámetros activos, coherente con una arquitectura MoE, aunque la model card no detalla el reparto exacto de expertos. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada.

Es relevante ahora porque documenta de forma inusualmente rigurosa el coste de la abliteration: incluye tasas de rechazo por dataset, métricas de calidad (MMLU, ARC-Challenge), divergencia KL y artefactos de evidencia con hashes SHA-256. El autor advierte explícitamente de que la pérdida de MMLU (de 53,0 % a 36,3 %) es el precio de eliminar los rechazos, y que la divergencia KL de primer token no detectó esa degradación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4), pipeline image-text-to-text |
| Parametros totales | 25.805.933.872 (~25,8 B) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4 B, sin confirmar en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (11 shards) |

## Arquitectura y entrenamiento

El modelo parte de un fine-tune Gemma 4 con arquitectura MoE. El proceso de "decensoring" se ejecuta en tres etapas encadenadas. La etapa 1 es un prebake EGA de una sola pasada sobre las 30 capas, con escala densa 1.0, escala de expertos 1.0, winsorización 0.995 y 3840 slices de expertos modificados; genera un artefacto local `models/ega-all-26b`. La etapa 2 es una búsqueda de hiperparámetros con heretic-llm 2.1.0 (seis trials, estudio `ega-all`) sobre ese prebake. El trial exportado es el `trial_index = 2` (etiquetado `[Trial 1]` por heretic), con 19/100 rechazos en estudio a KL 0.00216 frente al modelo prebakeado. La etapa 3 es un pase de estilo de esta release que, según el autor, no añade coste adicional sobre el prebake.

El entrenamiento se ejecutó en hardware AMD Ryzen AI Max 395+ con 128 GB de memoria unificada y ROCm 10.0, usando transformers 5.24.0, torch 2.15.0+rocm10.0, accelerate 1.16.0, peft 0.22.0, datasets 5.2.0 y optuna 5.1.0, con semilla 20261124. La dirección de ablación tiene SHA-256 `35d7fd352bca90cad47260f7f227904fbbcab684b41672802a85505c6338e81a`. No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional, orientada a role-play (RP) y role-play erótico (ERP), según los tags del autor.
- Entrada multimodal image-text-to-text (pipeline declarado), aunque la model card no detalla el alcance de la visión.
- Comportamiento "uncensored": 0 rechazos estrictos sobre 686 prompts de cuatro datasets de seguridad.
- Respuestas conformes incluso en prompts dañinos, aunque el autor advierte que algunas respuestas flagged son conformes con un descargo o una apertura tipo "as an AI".
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, audio: no disponible.

## Casos de uso

- Role-play y narrativa interactiva: el ajuste está orientado explícitamente a RP y ERP, con eliminación de rechazos que permite conversaciones sin interrupciones morales en escenarios ficticios.
- Investigación sobre abliteration y seguridad de modelos: el repositorio incluye evidencia reproducible (journals de Optuna, hashes de shards, scripts) útil para estudiar el trade-off entre eliminación de rechazos y degradación de capacidades.
- Evaluación de robustez de salvaguardas: sirve como modelo de control para medir cómo responden clasificadores y filtros ante un modelo sin rechazos.
- Generación creativa sin restricciones de contenido: escritura de ficción con temáticas adultas o sensibles donde un modelo alineado rechazaría la petición.
- Experimentación con arquitecturas MoE en hardware de consumo o unificado: el autor lo ejecutó en un Ryzen AI Max 395+ con 128 GB de memoria unificada y ROCm, lo que sirve de referencia para despliegues en APU.
- Reproducción de pipelines de decensoring: los scripts públicos permiten replicar las etapas 1 y 2 sobre otros fine-tunes Gemma 4 MoE.
- Análisis de multimodalidad en modelos abliterated: al declarar pipeline image-text-to-text, permite probar si la ablación afecta a la rama de visión (sin datos publicados al respecto).

## Benchmarks y rendimiento

Datos publicados en la model card. MMLU y ARC-Challenge son 0-shot con plantilla de chat y scoring por loglikelihood (lm_eval 0.4.13). KL es divergencia de primer token frente al modelo original sobre 100 prompts inocuos.

| Metrica | Original | Este modelo |
|---|---|---|
| KL vs original | 0 | 0.0687 a 0.0710 |
| MMLU | 53,0 % (±0,5) | 36,3 % |
| ARC-Challenge, accuracy / normalizado | 49,0 % / 48,0 % (±3,5) | 46,5 % / 47,0 % |

Tasas de rechazo sobre 686 prompts (recuento estricto entre paréntesis cuando difiere):

| Dataset | N | Original | Este modelo | Solo prebake EGA |
|---|---|---|---|---|
| mlabonne/harmful_behaviors | 100 | 100 raw / 99 strict | 19 / 0 | 26 / 0 |
| JailbreakBench/JBB-Behaviors | 100 | 96 / 94 | 21 / 0 | 25 / 0 |
| allenai/tulu-3-harmbench-eval | 320 | 267 / 267 | 23 / 0 | 43 / 0 |
| NousResearch/RefusalDataset | 166 | 147 / 146 | 17 / 0 | 24 / 0 |
| Total | 686 | 610 / 606 | 80 / 0 | 118 / 0 |

El autor atribuye la caída de MMLU al prebake EGA: solo expertos da 47,9 %, el pase denso lo lleva a 36,6 % y el trial de heretic cuesta 0,3 puntos, dentro del ruido. La KL de primer token no detectó esa deriva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Con 25,8 B parámetros en safetensors (51,7 GB en bf16/fp16), en cuantización de 8 bits rondaría los 26 GB y en 4 bits unos 13-14 GB, pero son estimaciones, no datos publicados.
- GPU recomendadas: no disponible. El autor ejecutó el proceso de creación en un AMD Ryzen AI Max 395+ con 128 GB de memoria unificada y ROCm 10.0, no en GPU discreta.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño, una RTX 4090 de 24 GB no cabría en bf16; en 4 bits podría ser viable, pero no hay datos publicados.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| rakshazi/Dark-Scarlett-v1.0-26B-A4B-Uncensored | ~25,8 B (MoE) | no disponible | apache-2.0 | 0/686 rechazos estrictos, MMLU 36,3 % |
| ReadyArt/Dark-Scarlett-v1.0-26B-A4B | ~25,8 B (MoE) | no disponible | no disponible | Modelo base, 606/686 rechazos estrictos, MMLU 53,0 % |
| Gemma 4 MoE (modelo subyacente) | no disponible | no disponible | no disponible | Base arquitectónica; sin datos de benchmarks en la información |

No se dispone de datos de otros modelos abliterated comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de MMLU: de 53,0 % a 36,3 %, una pérdida de 16,7 puntos atribuida al prebake EGA. No apto para tareas que requieran conocimiento factual fiable.
- Eliminación total de rechazos: 0/686 estrictos. El modelo responderá a prompts dañinos, lo que plantea riesgos de seguridad y de cumplimiento si se despliega sin filtros externos.
- Riesgo de alucinación elevado por la caída de capacidades; el autor no publica métricas de factualidad.
- La divergencia KL de primer token no detectó la degradación de MMLU, según el propio autor; no debe usarse como única métrica de calidad.
- Idiomas soportados no declarados; no hay garantía de rendimiento multilingüe.
- Longitud de contexto no disponible.
- Licencia apache-2.0 permite uso comercial, pero el modelo base y el modelo Gemma 4 subyacente pueden tener términos adicionales no detallados en la model card; verificar antes de producción.
- Es un experimento personal compartido "as-is", sin soporte ni mantenimiento. Descargas y likes a fecha de la información: 0 y 0.
- Orientado a RP/ERP; no validado para tareas de producción como atención al cliente o generación de código.
- No hay carpeta `reproduce/` ni replay de un solo comando; la reproducibilidad exacta requiere el mismo hardware y stack de librerías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rakshazi/Dark-Scarlett-v1.0-26B-A4B-Uncensored
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-26B-A4B
- Blog del autor sobre la abliteration de Gemma 4: https://rakshazi.me/blog/gemma-4-abliteration/
- Repositorio de scripts y documentación: https://github.com/rakshazi/gemma-4-abliteration
- Dataset mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset JailbreakBench/JBB-Behaviors: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Dataset allenai/tulu-3-harmbench-eval: https://huggingface.co/datasets/allenai/tulu-3-harmbench-eval
- Dataset NousResearch/RefusalDataset: https://huggingface.co/datasets/NousResearch/RefusalDataset
