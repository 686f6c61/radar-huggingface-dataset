# richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code

## Resumen

Qwen2.5-Coder-14B-Instruct-heretic1x-code es una variante "abliterated" o "decensored" del modelo Qwen2.5-Coder-14B-Instruct desarrollada por el usuario richardyoung. Se trata de un fine-tune que aplica la metodología "heretic" (versión 1.x) para eliminar los mecanismos de rechazo y alineación de seguridad del modelo original, manteniendo la base arquitectónica y de capacidades del Qwen2.5-Coder de 14.770 millones de parámetros. El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5 y está orientado a generación de texto y código sin las restricciones conversacionales típicas del modelo base.

El modelo resuelve un nicho muy concreto: investigadores que necesitan un modelo de código sin rechazos para estudiar comportamiento, evaluar sesgos, realizar pruebas de seguridad ofensiva o generar contenido que el modelo alineado bloquearía. No obstante, esta modificación tiene implicaciones importantes de seguridad y responsabilidad que deben considerarse antes de cualquier despliegue, especialmente en producción o en aplicaciones de cara al usuario.

Es relevante en el ecosistema porque ilustra la práctica creciente de "abliteration" sobre modelos open source de código, y porque el modelo base Qwen2.5-Coder-14B-Instruct es una referencia sólida en generación de código. El acceso está restringido (gated) en Hugging Face, lo que exige aceptar condiciones antes de descargarlo, y su licencia declarada es Apache 2.0, aunque la modificación de alineación plantea dudas sobre el uso comercial responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-14B-Instruct soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | en (ingles declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen2.5-Coder-14B-Instruct, que a su vez es un transformer decoder-only denso de la familia Qwen2.5 con 14.770 millones de parametros. La modificacion aplicada es del tipo "heretic 1.x", una tecnica de abliteration que identifica y suprime las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder ante ciertos prompts. No se dispone de informacion detallada sobre el dataset de abliteration, el numero de tokens utilizados en el proceso ni si hubo etapas adicionales de RLHF o DPO posteriores a la modificacion.

La innovacion tecnica principal no esta en la arquitectura (que se mantiene identica al modelo base) sino en el procedimiento de desalineacion. Este tipo de intervencion suele realizarse mediante edicion de pesos o ajuste fino con pares de prompts aceptados/rechazados, pero la model card no especifica el metodo exacto ni los hiperparametros empleados. Tampoco se documenta si se preservaron las capacidades de tool calling o de razonamiento multi-paso del modelo original tras la modificacion.

## Capacidades

- Generacion de texto y codigo en ingles, heredadas del modelo base Qwen2.5-Coder-14B-Instruct.
- Razonamiento sobre codigo, explicacion de fragmentos y generacion de funciones, presumiblemente conservadas del base, aunque no verificadas tras la abliteration.
- Respuestas sin rechazo ante peticiones que el modelo alineado bloquearia (caracteristica principal de la modificacion heretic).
- Soporte de conversacion multi-turno (tag conversational).
- Compatibilidad con text-generation-inference y endpoints compatibles (tag endpoints_compatible).
- Capacidades multilingues limitadas al ingles segun la model card.
- No se confirma soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration afecta al comportamiento del modelo base, comparando respuestas ante el mismo conjunto de prompts antes y despues de la modificacion.
- Red teaming y evaluacion de riesgos: util para generar respuestas que un modelo alineado rechazaria y analizar que tipo de contenido produce, con el fin de disenar mejores filtros y salvaguardas.
- Analisis de sesgos y comportamiento toxico: investigadores pueden usar el modelo para medir la prevalencia de contenido sesgado o danino en modelos desalineados y documentar diferencias respecto al base.
- Generacion de codigo en entornos controlados de investigacion: en laboratorios aislados, puede emplearse para tareas de sintesis de codigo donde se requiere ausencia de rechazos, siempre con revision humana posterior.
- Estudio de la degradacion de capacidades: permite evaluar si la abliteration afecta a tareas benignas como generacion de tests unitarios o refactorizacion, comparando con el modelo original.
- Docencia y divulgacion tecnica: sirve como ejemplo practico de tecnicas de abliteration y de sus implicaciones eticas en cursos de seguridad en IA.
- Pruebas de pipelines de inferencia: al ser compatible con TGI y endpoints, puede usarse para validar infraestructura de despliegue con un modelo de 14B en entornos de staging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base o con otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 29,5 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda al menos 32-40 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 15-16 GB, viable en GPUs de 24 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 8-9 GB, aunque no se confirman cuantizaciones oficiales en el repo.
- GPUs recomendadas: A100 40GB/80GB, H100, L40S o RTX 6000 Ada para FP16; RTX 4090 (24 GB) para 8 bits o cuantizaciones menores.
- Cabe en GPU consumer: si, en RTX 4090 o RTX 3090 con cuantizacion de 8 bits o inferior; en FP16 requeriria configuraciones multi-GPU o GPUs de datacenter.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y endpoints compatibles segun los tags; llama.cpp u Ollama requeririan conversion a GGUF no disponible en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado de alineacion | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code | 14,77B | no disponible | apache-2.0 | abliterated (sin rechazos) | gated en HF |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,77B | hasta 32.768 tokens (segun documentacion del base) | apache-2.0 | alineado | publico en HF |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6B | hasta 32.768 tokens (segun documentacion del base) | apache-2.0 | alineado | publico en HF |
| deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct | 15,7B (MoE, 2,4B activos) | 128K (segun documentacion del base) | licencia propia de DeepSeek | alineado | publico en HF |

La comparativa se limita a datos publicos del modelo base y alternativas conocidas; no se dispone de benchmarks del modelo heretic para comparar rendimiento real.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtros; no debe desplegarse de cara al usuario sin salvaguardas externas.
- Riesgo elevado de alucinacion y de respuestas incorrectas, agravado por la posible degradacion de capacidades tras la modificacion.
- Sesgos desconocidos: no se documenta evaluacion de sesgos tras la abliteration.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado.
- Licencia apache-2.0 declarada, pero la modificacion de alineacion puede entrar en conflicto con las condiciones de uso del modelo base y con normativas de responsabilidad sobre contenido generado; conviene revisar las condiciones del acceso gated.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso en pipelines automatizados sin gestion de credenciales.
- Sin cuantizaciones oficiales publicadas: el despliegue eficiente en consumer GPU requiere conversion manual.
- No se confirma la preservacion de tool calling ni de capacidades de agente tras la modificacion.
- Fecha de creacion y actualizacion del repo (noviembre de 2026) resulta anomala respecto a la linea temporal habitual; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Paper Qwen2.5-Coder (arXiv): https://arxiv.org/abs/2409.12186
- Blog Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
