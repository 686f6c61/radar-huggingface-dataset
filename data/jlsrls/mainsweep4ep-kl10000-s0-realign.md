# jlsrls/mainsweep4ep-kl10000-s0-realign

## Resumen

`jlsrls/mainsweep4ep-kl10000-s0-realign` es un ajuste fino (fine-tuning) del modelo `unsloth/Llama-3.2-1B-Instruct`, publicado por el usuario `jlsrls` en HuggingFace. Se trata de un checkpoint experimental de 1B parámetros entrenado mediante SFT (supervised fine-tuning) con la librería TRL 0.24.0 sobre Unsloth, según se desprende de las etiquetas y de la model card. El repositorio ocupa 1,7 GB y no registra descargas ni interacciones en el momento de la consulta.

El modelo resuelve, en principio, el mismo problema que su base: generación de texto conversacional e instrucciones en un tamaño que cabe en GPU de consumo. Su relevancia es limitada y de carácter puramente investigador: el nombre del checkpoint sugiere un barrido de hiperparámetros ("mainsweep", 4 épocas, coeficiente KL de 10 000, semilla 0, "realign"), y el run de Weights & Biases asociado pertenece al proyecto `clarifying-em` de la Universidad Estatal de Portland. No hay documentación publicada sobre el dataset, los objetivos ni los resultados.

Al estar construido sobre Llama-3.2-1B-Instruct, hereda su arquitectura transformer decoder-only con GQA, su tokenizador de 128 256 entradas y su ventana de contexto nominal de 128 000 tokens. No obstante, ninguna de estas cifras se confirma en la información disponible para este fine-tune concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3.2 (heredada del modelo base); no se documentan modificaciones estructurales |
| Parámetros totales | ~1,24 mil millones (dato del modelo base Llama-3.2-1B-Instruct, no verificado en este checkpoint) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens según la documentación del modelo base; no confirmado para este fine-tune |
| Tipos de cuantización | No disponible. El repositorio solo contiene safetensors en precisión completa/bf16; se puede cuantizar externamente a GGUF (Q8_0, Q5_K_M, Q4_K_M, etc.) o a FP8/AWQ/GPTQ |
| Idiomas soportados | No disponible (el modelo base declara 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible. La model card incluye el marcador de posición «licence: license» sin texto legal asociado |
| Formato de pesos | safetensors (librería `transformers`); no se incluyen pesos GGUF ni adaptadores LoRA separados |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, codificación posicional rotatoria (RoPE) y atención con consultas agrupadas (GQA). No hay indicios en la información disponible de que el fine-tune haya alterado la topología, la longitud de contexto o el tokenizador de la base.

El entrenamiento se realizó con SFT mediante TRL 0.24.0 (Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0, Tokenizers 0.22.2) y la etiqueta `unsloth` indica que se empleó ese framework para el ajuste. No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO posteriores ni ninguna innovación técnica. El run de Weights & Biases enlazado (`mjp25ikf`, proyecto `clarifying-em`) es la única traza experimental pública, pero sus métricas no se han transcrito a la model card. El propio nombre del checkpoint (`4ep`, `kl10000`, `s0`, `realign`) apunta a un barrido de hiperparámetros con 4 épocas y un coeficiente KL de 10 000, si bien esto es una inferencia a partir del nombre y no un dato documentado.

## Capacidades

Las capacidades listadas son las del modelo base y no han sido verificadas en este checkpoint; un SFT agresivo puede degradarlas.

- Generación de texto conversacional y seguimiento de instrucciones en formato chat (la model card muestra un ejemplo con `transformers.pipeline` y mensajes con rol `user`).
- Razonamiento básico de un solo paso y respuesta a preguntas abiertas; el ejemplo oficial es una pregunta de opinión, no una tarea de razonamiento complejo.
- Capacidad multilingüe heredada del modelo base (8 idiomas declarados por Meta), no confirmada tras el ajuste.
- Soporte de tool calling / function calling heredado de Llama 3.2 1B Instruct, no verificado.
- Manejo de contexto largo (hasta 128 000 tokens en la base), sin evidencia de que el fine-tune lo preserve.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), es decir, desplegable mediante la infraestructura de inferencia de HuggingFace.
- No se documentan modo de razonamiento explícito (thinking), visión, audio ni capacidades de agente multi-paso.

## Casos de uso

Dado que no hay licencia definida, ningún benchmark y cero validación pública, estos escenarios deben entenderse como prototipado e investigación, no como producción.

- Reproducción de experimentos de ajuste fino: sirve como checkpoint de referencia dentro de un barrido de hiperparámetros (épocas, coeficiente KL, semilla) sobre Llama-3.2-1B-Instruct para comparar configuraciones con el run de W&B asociado.
- Evaluación de degradación por SFT: útil para medir cuánto pierde un modelo de 1B en tareas de instrucciones tras un ajuste supervisado concreto, comparándolo con el modelo base.
- Prototipado de asistentes conversacionales en local: con ~2,5 GB de pesos en bf16 cabe en GPUs de 8 GB y permite iterar sobre prompts e integraciones sin coste de API.
- Clasificación y extracción de información ligera: con plantillas de prompt adecuadas puede etiquetar textos o extraer campos en flujos de preprocesado de datos, siempre con validación humana.
- Generación de texto para pruebas de software: creación de datos sintéticos o textos de relleno para tests de pipelines de NLP donde la calidad final no es crítica.
- Experimentos de alineación y desalineación: el proyecto `clarifying-em` sugiere investigación sobre comportamientos emergentes; el checkpoint puede usarse como una de las condiciones experimentales de ese tipo de estudios.
- Despliegue educativo: ejemplo económico para enseñar fine-tuning, cuantización y serving de modelos pequeños en un aula o laboratorio.
- Base para un ajuste posterior (continued fine-tuning) en un dominio concreto, aprovechando el formato de chat ya aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y el enlace a Weights & Biases no aporta valores transcritos. Tampoco hay una comparación con el modelo base que permita cuantificar el efecto del ajuste.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 2,5 GB solo de pesos, más la caché KV. Con la configuración del modelo base (16 capas, 8 cabezas KV, dimensión de cabeza 64) la caché ronda los 32 KB por token, es decir, unos 4 GB adicionales si se llena la ventana de 128 000 tokens. Para contextos de 4 000-8 000 tokens, un total de 3-4 GB es suficiente.
- VRAM en cuantización de 4 bits: del orden de 0,8-1,2 GB de pesos, más la caché KV, por lo que cabe en GPUs de 4-6 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, L4, T4). Para lotes grandes o contextos muy largos, A100 o H100 no aportan ventaja proporcional por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU modernas con 6-8 GB de VRAM o más; en 4 bits funciona incluso en hardware integrado con memoria unificada.
- Opciones de despliegue: `transformers` (como en el ejemplo oficial de la model card), vLLM y TGI para serving con batching, y llama.cpp u Ollama previa conversión de los safetensors a GGUF, ya que el repositorio no incluye pesos cuantizados.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de TTFT para este checkpoint.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas públicas y no de la información de búsqueda proporcionada; pueden cambiar con nuevas revisiones.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| jlsrls/mainsweep4ep-kl10000-s0-realign | ~1,24 B (heredados) | 128 k (heredado, sin confirmar) | No disponible | safetensors en HF |
| unsloth/Llama-3.2-1B-Instruct | ~1,24 B | 128 k | Llama 3.2 Community License | safetensors, GGUF comunitarios |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32 k (ampliable a 128 k) | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8 k | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B IT | ~2,6 B | 8 k | Gemma Terms of Use | safetensors, GGUF |

Frente al modelo base, este checkpoint no aporta ninguna ventaja documentada: carece de licencia explícita, de benchmarks y de descargas, mientras que `unsloth/Llama-3.2-1B-Instruct` mantiene términos de uso conocidos. Qwen2.5-1.5B-Instruct y SmolLM2-1.7B-Instruct son alternativas con licencia Apache 2.0 y, por tanto, más adecuadas para uso comercial si el requisito es un modelo pequeño con permisos claros.

## Limitaciones y advertencias

- Licencia indeterminada: la model card contiene «licence: license» como marcador de posición, lo que deja el uso comercial en un limbo legal. Conviene asumir que no se puede usar en producción hasta que el autor aclare los términos.
- Sin benchmarks ni evaluación publicada: no hay evidencia de que el ajuste haya mejorado ninguna capacidad, y es plausible que haya degradado el rendimiento del modelo base (olvido catastrófico).
- Riesgo de alucinación alto: los modelos de 1B generan con frecuencia contenido factualmente incorrecto, especialmente en tareas de conocimiento y matemáticas.
- Sesgos: los del modelo base Llama 3.2, más los que puedan introducir los datos de SFT no documentados. No hay ninguna evaluación de sesgos disponible.
- Idiomas: no declarados; aunque la base cubre 8 idiomas, el ajuste puede haber sesgado fuertemente la distribución hacia el idioma del dataset de entrenamiento.
- Contexto: la ventana de 128 000 tokens es un dato del modelo base y no está verificada tras el fine-tune; además, la calidad de recuperación en contextos muy largos decae en modelos de este tamaño.
- Naturaleza experimental: cero descargas, cero likes y un nombre de checkpoint que sugiere un barrido de hiperparámetros indican que es un artefacto de investigación, no una versión estable. No hay garantía de mantenimiento ni de que el repositorio siga disponible.
- Tokenizador y plantilla de chat: no se documenta si la plantilla de chat de Llama 3.2 se ha respetado, lo que puede provocar degradación severa si se aplica un formato distinto al del entrenamiento.
- Reproducibilidad: se conocen las versiones de framework (TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0) pero no la semilla completa, el dataset ni la configuración de entrenamiento, más allá de lo que sugiere el nombre del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jlsrls/mainsweep4ep-kl10000-s0-realign
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/rezvani-portland-state-university/clarifying-em/runs/mjp25ikf
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con el proyecto `clarifying-em`; los enlaces encontrados correspondían a un sitio de estrategia de Pokémon y se han descartado por no ser relevantes.
