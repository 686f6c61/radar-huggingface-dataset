# ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-8821-3e-compile-ep3

## Resumen

El modelo `ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-8821-3e-compile-ep3` es un ajuste fino (SFT) derivado de una cadena de entrenamiento del autor ConnorYU sobre la arquitectura Qwen3.5, con 9.409.813.744 parámetros totales según los pesos en safetensors. El modelo base inmediato es `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300`, un checkpoint que a su vez parece haber pasado por un proceso de RL (GRPO) orientado a instrucciones y modo "think", y que ahora se ha afinado con datos de dominio médico (indicado por el sufijo "Medical-SFT" en el nombre).

La model card publicada es mínima: se limita a indicar autoría, licencia Apache 2.0 y que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face. No se documenta el dataset de SFT, la composición de datos médicos, el número de tokens de entrenamiento ni hiperparámetros. El pipeline declarado es `image-text-to-text`, lo que sugiere que la arquitectura Qwen3.5 subyacente es multimodal (visión-lenguaje), aunque el modelo se etiqueta también como `text-generation-inference`.

Su relevancia es limitada y experimental: cuenta con 0 descargas y 0 likes en el momento de la consulta, no incluye benchmarks y el identificador del repositorio apunta a un checkpoint intermedio de una cadena de experimentos personales (sufijos "tem300", "8821-3e-compile-ep3"). Es útil como referencia de cómo se encadenan SFT y GRPO sobre Qwen3.5 con Unsloth, pero no como modelo listo para producción sin evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, multimodal image-text-to-text según pipeline; detalles internos no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.5, un transformer con capacidades multimodales declaradas por el pipeline `image-text-to-text`. El tamaño es de aproximadamente 9,4 mil millones de parámetros. No se especifica en la información disponible si emplea atención lineal, decodificación especulativa, mezcla de expertos ni ninguna innovación concreta de la familia Qwen3.5; la model card no aporta detalles arquitectónicos.

El entrenamiento se realizó en dos fases encadenadas según la metadata: primero un checkpoint base `Qwen3.5-9B-GRPO-ifeval-v0-think-step300` (que por su nombre sugiere GRPO sobre tareas de seguimiento de instrucciones con modo "think"), y sobre él un SFT orientado a dominio médico. El ajuste se ejecutó con Unsloth y TRL, lo que indica un fine-tuning eficiente en memoria (probablemente LoRA/QLoRA, aunque no se confirma). No se documentan el número de tokens de entrenamiento, la composición del dataset médico, ni si hubo DPO o RLHF adicional en esta fase.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5.
- Razonamiento en modo "think" (el checkpoint base incluye "think" en su nombre), aunque no se detalla su funcionamiento.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), presumiblemente heredado de Qwen3.5.
- Seguimiento de instrucciones, por el entrenamiento GRPO-ifeval del modelo base.
- Especialización médica por el SFT aplicado, sin documentación sobre el alcance real de dicha especialización.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas a inglés según la metadata.
- Capacidades de audio: no disponible.

## Casos de uso

- Experimentación académica en ajuste fino médico: sirve como punto de partida para reproducir la cadena GRPO + SFT sobre Qwen3.5 con Unsloth, comparando checkpoints intermedios.
- Prototipado de asistentes clínicos en inglés: puede emplearse para generar borradores de respuestas a preguntas médicas, siempre con revisión humana y sin uso clínico directo.
- Investigación en alineación y seguimiento de instrucciones: el linaje GRPO-ifeval permite estudiar cómo el SFT posterior afecta al cumplimiento de instrucciones.
- Evaluación de modelos multimodales pequeños (9B): útil para comparar el comportamiento visión-lenguaje de Qwen3.5 frente a alternativas del mismo rango en tareas de imagen y texto.
- Generación de documentación médica sintética: para crear corpus de entrenamiento o pruebas en pipelines de NLP clínico, con validación posterior.
- Base para fine-tuning adicional en dominios sanitarios específicos (radiología, farmacología) mediante LoRA, aprovechando el formato safetensors y la licencia Apache 2.0.
- Docencia y demostraciones: ejemplo práctico de cómo encadenar SFT y RL sobre un modelo Qwen3.5 con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 19-20 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto corto.
- Cuantización a 8 bits: aproximadamente 10-11 GB de pesos; a 4 bits: aproximadamente 5-6 GB, aunque no se publican pesos GGUF ni AWQ/GPTQ en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para fp16 con contexto largo; RTX 4090 (24 GB) viable en fp16 con contexto moderado o en 8 bits.
- GPU de consumo: cabe en RTX 4090 en fp16 con contexto limitado; en RTX 3090 (24 GB) similar; en GPUs de 16 GB solo con cuantización a 8/4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), vLLM y llama.cpp/Ollama requerirían conversión a sus formatos, no publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-8821-3e-compile-ep3 | 9,4B | no disponible | Apache 2.0 | Sí (pipeline image-text-to-text) | HF, 0 descargas |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300 (modelo base) | ~9B (no confirmado) | no disponible | no disponible | no disponible | HF |
| Qwen3.5-9B (modelo original de la familia) | ~9B | no disponible en esta ficha | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card prácticamente vacía: no se documenta el dataset médico, los hiperparámetros ni el proceso de evaluación, lo que impide validar la calidad del ajuste.
- Riesgo elevado de alucinación en contenido médico; no debe usarse para diagnóstico, tratamiento ni consejo clínico sin supervisión profesional.
- Sesgos desconocidos: al no documentarse la composición del dataset de SFT, no es posible evaluar sesgos demográficos, clínicos o culturales.
- Idioma limitado al inglés según la metadata; el rendimiento en castellano no está garantizado.
- Longitud de contexto no especificada; no se puede asumir la ventana nativa de Qwen3.5 sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la cadena de checkpoints intermedios hacen desaconsejable su uso en producción sin auditoría propia.
- El identificador del repositorio sugiere un checkpoint experimental (sufijos "compile-ep3", "tem300"); puede no ser una versión estable.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en hardware de consumo.
- Modelo con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-8821-3e-compile-ep3
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
