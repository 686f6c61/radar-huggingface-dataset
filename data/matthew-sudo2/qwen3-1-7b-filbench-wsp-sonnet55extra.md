# matthew-sudo2/qwen3-1.7b-filbench-wsp-sonnet55extra

## Resumen
qwen3-1.7b-filbench-wsp-sonnet55extra es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-1.7B-Base, publicado por el usuario matthew-sudo2 en Hugging Face. El modelo parte de la arquitectura Qwen3 densa de 1.700 millones de parametros y se ha especializado en dos idiomas filipinos: tagalo (tl) y cebuano (ceb). No se documenta en la model card el proceso de ajuste, el volumen de datos utilizados ni la metodologia de entrenamiento especifica del fine-tuning.

El interes de este modelo reside en su enfoque en lenguas de bajos recursos del archipielago filipino, un ambito poco cubierto por los modelos generalistas. Al heredar la arquitectura Qwen3, conserva caracteristicas tecnicas como la ventana de contexto de 32.768 tokens, la atencion con GQA (16 cabezas de consulta y 8 de clave-valor) y 28 capas. La licencia MIT facilita su uso comercial, aunque el modelo se distribuye sin metricas de evaluacion propias publicadas.

Se trata de un modelo de generacion de texto de tipo causal, con 1.700 millones de parametros totales (1.400 millones no de embedding), orientado a tareas de generacion en tagalo y cebuano. Su relevancia actual es limitada por la ausencia de benchmarks especificos del fine-tuning, pero resulta un punto de partida para desarrolladores que necesiten procesamiento de texto en estas lenguas con un modelo pequeno y desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer causal denso) |
| Parametros totales | 1,7 B (1,4 B no-embedding) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (la model card no especifica cuantizaciones publicadas) |
| Idiomas soportados | Tagalo (tl), cebuano (ceb) |
| Licencia | MIT |
| Formato de pesos | No disponible (pesos en formato transformers; no se indica safetensors ni GGUF en la informacion) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura Qwen3 densa: 28 capas, 16 cabezas de consulta y 8 cabezas de clave-valor con Grouped Query Attention (GQA), y un contexto de 32.768 tokens. Segun la model card del autor, el Qwen3 base se preentreno sobre 36 billones de tokens en 119 idiomas, con un preentrenamiento en tres etapas (conocimiento general, razonamiento STEM/codigo y extension de contexto hasta 32K), e incorpora normalizacion QK por capa para mejorar la estabilidad del entrenamiento.

Sin embargo, la informacion proporcionada no detalla el proceso de fine-tuning aplicado a este modelo concreto: no se especifica el numero de tokens de ajuste, la composicion del dataset en tagalo y cebuano, ni si se emplearon tecnicas como SFT, RLHF o DPO. Tampoco se documentan innovaciones adicionales mas alla de las heredadas del modelo base.

## Capacidades
- Generacion de texto en tagalo (tl) y cebuano (ceb), los dos idiomas declarados en la model card.
- Generacion de texto general y continuacion de secuencias, propia de un modelo causal preentrenado y ajustado.
- Capacidades multilingues limitadas a los idiomas indicados; no se documenta soporte para otros idiomas.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la informacion disponible.
- No se documenta modo thinking, vision ni audio en la informacion disponible.

## Casos de uso
- Generacion de contenido en tagalo: el modelo puede redactar textos, resumenes o respuestas en tagalo para aplicaciones editoriales o de comunicacion, apoyandose en su contexto de 32.768 tokens para mantener coherencia en documentos largos.
- Procesamiento de texto en cebuano: util para digitalizar y generar contenido en cebuano, una lengua con escasa cobertura en modelos generalistas, en tareas de transcripcion asistida o redaccion.
- Atencion al cliente localizada: puede gestionar conversaciones multi-turno en tagalo o cebuano gracias a su ventana de contexto, adecuado para empresas que operan en Filipinas.
- Traduccion asistida y parafraseo: como modelo bilingue tl/ceb puede apoyar tareas de reformulacion o adaptacion de textos entre variantes filipinas, siempre con supervision humana.
- Prototipado rapido en entornos con recursos limitados: al ser un modelo de 1,7 B, puede desplegarse en GPU de consumo para experimentacion e investigacion en procesamiento de lenguas filipinas.
- Investigacion linguistica: sirve como base para estudiar el comportamiento de modelos pequenos en lenguas de bajos recursos y para comparar con modelos multilingues de mayor tamano.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card remite unicamente a los resultados del Qwen3 original en el blog tecnico de Qwen, sin aportar metricas propias del fine-tuning en tagalo o cebuano.

## Requisitos de hardware
- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7-2 GB; en 4 bits: alrededor de 1-1,5 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cabe en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien en A100/H100 para despliegues de mayor throughput.
- Opciones de despliegue: al ser compatible con transformers, puede servirse con vLLM, TGI o llama.cpp/Ollama si se generan pesos GGUF (no se confirma su disponibilidad).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| qwen3-1.7b-filbench-wsp-sonnet55extra | 1,7 B | 32.768 | tl, ceb | MIT | Fine-tuning especifico para filipino; sin benchmarks publicados |
| Qwen/Qwen3-1.7B-Base | 1,7 B | 32.768 | 119 idiomas | Apache 2.0 (segun el modelo base original) | Modelo base generalista; referencia de partida |
| Modelos multilingues pequenos (p. ej. de la familia Qwen2.5-1.5B) | ~1,5 B | 32.768 (Qwen2.5) | Decenas de idiomas | Apache 2.0 | Alternativa generalista sin especializacion en tl/ceb |

La comparativa con alternativas especificas para tagalo y cebuano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias
- No se han publicado benchmarks propios del fine-tuning, por lo que el rendimiento real en tagalo y cebuano es desconocido.
- Riesgo de alucinacion inherente a los modelos de lenguaje; mayor en lenguas de bajos recursos por menor volumen de datos de entrenamiento.
- Cobertura linguistica limitada a tagalo y cebuano; el uso en otros idiomas no esta garantizado.
- No se documenta el dataset de ajuste, lo que impide evaluar sesgos especificos o la calidad de los datos.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3-1.7B-Base original tiene su propia licencia (Apache 2.0 segun la informacion del modelo base); conviene verificar la compatibilidad en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.
- Requiere transformers >= 4.51.0 para evitar el error `KeyError: 'qwen3'`.

## Enlaces
- Hugging Face: https://huggingface.co/matthew-sudo2/qwen3-1.7b-filbench-wsp-sonnet55extra
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Blog tecnico de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
