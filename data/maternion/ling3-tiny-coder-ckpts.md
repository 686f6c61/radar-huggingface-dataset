# maternion/ling3-tiny-coder-ckpts

## Resumen

`maternion/ling3-tiny-coder-ckpts` es un repositorio de artefactos intermedios de un experimento personal de ajuste fino (fine-tuning) sobre el modelo base `inclusionAI/Ling-3.0-tiny`, un MoE híbrido de 7.900 millones de parámetros con atención KDA+MLA. El objetivo del experimento era convertir el modelo base en un asistente especializado en programación competitiva en C++, mediante adaptadores LoRA entrenados sobre TPU v5e-8 en Kaggle. El desarrollo está oficialmente pausado y el autor lo describe como trabajo inacabado.

El repositorio no contiene un modelo final listo para producción: aloja checkpoints de distintas etapas (SFT, CPT, agentic y calib), resultados de evaluación en JSON y ficheros de gestión del pipeline de entrenamiento. Los únicos artefactos directamente utilizables son dos exportaciones GGUF fusionadas de un punto temprano del SFT, en cuantizaciones Q4_K_M, Q8_0 y bf16, con plantilla de chat incluida. El autor advierte explícitamente que son notablemente más débiles que checkpoints posteriores que nunca llegaron a fusionarse en GGUF.

La relevancia de este repositorio es, por tanto, documental y metodológica más que práctica: expone con transparencia el linaje de entrenamiento, las evaluaciones por checkpoint sobre una muestra de 60 problemas de LiveCodeBench v6 y el modo de fallo dominante detectado (el modelo razona correctamente pero no emite código en problemas difíciles por agotamiento de tokens en bucles de razonamiento). El tamaño del repositorio, 254 GB, refleja que contiene pesos completos, estados del optimizador y cachés de compilación, no solo los GGUFs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrido Bailing (atención KDA + MLA) según model card del autor; detalles completos no disponibles |
| Parámetros totales | 7.893.392.800 (7,9B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q8_0, bf16 (exportaciones GGUF en `models/`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería declarada), GGUF (artefactos fusionados), estados del optimizador `optstate_*` para reanudación |

## Arquitectura y entrenamiento

El modelo base es `inclusionAI/Ling-3.0-tiny`, descrito por el autor del repositorio como un MoE híbrido de arquitectura Bailing con atención KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention). El repositorio no reproduce la model card del modelo base ni aporta el número de expertos, la proporción de parámetros activos, la longitud de contexto nativa ni la composición del corpus original de preentrenamiento, por lo que esos datos quedan como no disponibles en esta ficha.

El linaje de ajuste fino documentado por el autor consta de cuatro etapas. La etapa SFT (`sft-21750`, 21.750 pasos) usó trazas de razonamiento R1 (codeforces-cots) más Magicoder con thinking desactivado, aproximadamente 178 millones de tokens y 2 épocas. La etapa CPT (`cpt-2903`, 2.903 pasos) hizo un aclimatamiento con C++ crudo de Stack-v2, 24 millones de tokens, y es el checkpoint con mejor evaluación registrada. La etapa agentic (`agentic-600`, 600 pasos) se entrenó con parches C++ de SWE-smith y quedó parcial. La etapa de calibración (`calib-19460`, 19.460 pasos) partió de los pesos de `cpt-2903` y aplicó una curación de datos orientada a convergencia según el paper arXiv:2604.01702: filtro de palabras clave de ramificación, eliminación de bucles y borrado de pasos, con 4 épocas. El entrenamiento se ejecutó en TPU v5e-8 de Kaggle con adaptadores LoRA.

La innovación técnica más destacable del repositorio no es arquitectónica sino de diagnóstico: la etapa de calibración se diseñó para atacar el modo de fallo dominante, en el que el modelo razona correctamente pero nunca llega a emitir código porque agota los tokens dentro de bucles de razonamiento. El resultado, según el propio autor, fue que esa pasada no elevó el pass@1 global y los fallos por longitud de generación en problemas difíciles persistieron. La siguiente etapa prevista, un pequeño DPO dirigido a generaciones en bucle, no llegó a ejecutarse.

## Capacidades

- Generación de código en C++ orientada a programación competitiva, especialidad declarada del ajuste.
- Razonamiento con trazas estilo R1 durante el SFT, incluyendo modo thinking (el dataset Magicoder se usó con thinking desactivado como contraste).
- Conversación: el repositorio incluye plantilla de chat en las exportaciones GGUF y lleva la etiqueta `conversational`.
- Evaluación ejecutable: los artefactos se validaron con comprobación de ejecución (exec-checked) sobre problemas de LiveCodeBench v6.
- Capacidades del modelo base (tool calling, agentes multi-paso, multilingüismo, visión, audio): no disponibles en la información proporcionada; el repositorio no las documenta ni las evalúa.
- No hay evidencia publicada en este repositorio sobre function calling, uso como agente autónomo en producción ni soporte multilingüe más allá de lo que herede del modelo base.

## Casos de uso

- Investigación sobre modos de fallo en modelos de código: el repositorio permite reproducir el análisis de bucles de razonamiento y fallos por longitud de generación usando los JSON de `evals/` y los checkpoints intermedios, lo que lo hace adecuado para estudiar por qué un modelo razona bien pero no emite código.
- Reproducción de experimentos de ajuste fino en TPU: los adaptadores se emparejan 1:1 con los ficheros `optstate_*`, de modo que un investigador puede reanudar exactamente el entrenamiento desde cualquier checkpoint y comparar etapas bajo condiciones idénticas.
- Estudio de curación de datos para convergencia: la etapa `calib` aplica técnicas concretas del paper arXiv:2604.01702 (filtro de ramificación, eliminación de bucles, borrado de pasos) y sirve como caso práctico para evaluar si esas técnicas mejoran o no el pass@1 en código competitivo.
- Evaluación comparativa de cuantizaciones: las exportaciones Q4_K_M y Q8_0 del mismo checkpoint permiten medir la degradación por cuantización en tareas de código con verificación de ejecución, aunque el autor ya reporta una anomalía en una tirada temprana de Q8_0.
- Prototipado local de asistentes de C++: los GGUFs de `models/` se pueden cargar en llama.cpp u Ollama para experimentar con un modelo de 7,9B en hardware de consumo, asumiendo que la calidad es la de un punto temprano del SFT y no la de los checkpoints posteriores.
- Docencia sobre pipelines de entrenamiento: el repositorio documenta pasos, volúmenes de tokens, épocas y resultados por checkpoint, lo que lo convierte en material didáctico sobre cómo se estructura un experimento de SFT más CPT más calibración con evaluación honesta de resultados negativos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre una muestra de 60 problemas de LiveCodeBench v6, con verificación de ejecución:

| Checkpoint | pass@1 | Tasa de casos superados | Cuantización GGUF |
|---|---|---|---|
| sft-14000 | 43,3% | 41,1% | Q4_K_M |
| sft-14000 | 26,7% | 26,7% | Q8_0 (tirada temprana defectuosa) |
| cpt-2903 | 51,7% | 39,7% | Q4_K_M |
| calib-19460 | 48,3% | 36,4% | Q4_K_M |

El autor señala que en `cpt-2903` los problemas fáciles están resueltos al 100%, y que la pasada de calibración no mejoró el pass@1 global. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para 7,9B parámetros, aproximadamente 5-6 GB en Q4_K_M, 8-9 GB en Q8_0 y unos 16 GB en bf16, sin contar overhead de contexto ni caché KV; estas cifras son estimaciones por tamaño y no están publicadas en el repositorio.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo entra en GPUs de consumo de gama alta con 8 GB o más para Q4_K_M, y requiere 16 GB o más para bf16.
- Despliegue: los artefactos GGUF de `models/` incluyen plantilla de chat y están pensados para llama.cpp; el repositorio también contiene una caché de compilación de llama.cpp (`llama-bin-cache.tar.gz`). No hay documentación sobre vLLM, TGI u Ollama específica para estos pesos.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Nota importante: la arquitectura MoE híbrida con KDA+MLA puede no estar soportada por todos los motores de inferencia; conviene verificar compatibilidad con la implementación de referencia del modelo base antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| maternion/ling3-tiny-coder-ckpts | 7,9B (MoE híbrido) | no disponible | C++ competitivo, artefactos de experimento | MIT | Pausado, inacabado |
| inclusionAI/Ling-3.0-tiny | 7,9B (MoE híbrido) | no disponible | Modelo base generalista | no disponible | Publicado |
| Alternativas de código de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de `inclusionAI/Ling-3.0-tiny` ni de modelos comparables de la misma categoría, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- El repositorio está pausado y sin terminar. No es un modelo listo para producción y su estructura puede cambiar si el autor reanuda el trabajo.
- Los únicos artefactos utilizables son dos GGUFs de un punto temprano del SFT, explícitamente más débiles que los checkpoints posteriores, que nunca se fusionaron a GGUF.
- Modo de fallo conocido: en problemas difíciles el modelo entra en bucles de razonamiento y agota los tokens sin emitir código. La etapa de calibración no corrigió este comportamiento.
- La evaluación se limita a una muestra de 60 problemas de LiveCodeBench v6 más OJBench; no hay benchmarks estándar ni evaluación multilingüe.
- Una de las tiradas Q8_0 registradas muestra un pass@1 anómalamente bajo (26,7%), que el autor atribuye a una ejecución defectuosa; no debe tomarse como referencia de la calidad de esa cuantización.
- No hay información sobre sesgos, alucinación, idiomas soportados ni comportamiento fuera del dominio de código.
- La licencia es MIT, lo que permite uso comercial, pero el estado inacabado y la ausencia de garantías de calidad hacen desaconsejable su uso en producción sin una evaluación propia.
- El tamaño del repositorio (254 GB) incluye estados del optimizador y cachés; descargarlo completo no es necesario para usar los GGUFs.
- La compatibilidad de la arquitectura KDA+MLA con motores de inferencia de terceros no está documentada en el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maternion/ling3-tiny-coder-ckpts
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Paper de curación de datos citado: arXiv:2604.01702
- No se han encontrado en la información proporcionada otros enlaces a blogs, demos o repositorios adicionales.
