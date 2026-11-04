# pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-mixclean

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Meta Llama 3.1 8B Instruct, publicado por el usuario pshahabinejad bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 8.030.261.248 parámetros (aproximadamente 8B) derivado de la versión cuantizada en 4 bits de Unsloth (`unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit`), que a su vez es una adaptación de Llama 3.1 8B Instruct de Meta. El nombre del repositorio sugiere un entrenamiento orientado a dominios médico y "misaligned", aunque la model card no documenta la composición del dataset ni el procedimiento de entrenamiento.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero "likes" en el momento de la consulta, no incluye resultados de benchmarks, no detalla el dataset de ajuste fino y la model card es prácticamente una plantilla autogenerada por Unsloth. Es, por tanto, un artefacto de investigación personal más que un modelo listo para producción. Se documenta aquí de forma rigurosa para que desarrolladores e investigadores puedan evaluar rápidamente su procedencia, sus especificaciones reales y sus carencias documentales antes de considerarlo para cualquier uso.

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con 8B parámetros, ventana de contexto de 128.000 tokens en el modelo original de Meta y licencia Apache 2.0. No obstante, el autor no confirma en la model card que estas capacidades se hayan preservado tras el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), denso |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base de partida estaba cuantizado en 4 bits (bnb-4bit) |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Llama 3.1 8B Instruct en su variante cuantizada a 4 bits de Unsloth. La arquitectura es la estándar de Llama 3.1: transformer decoder-only con atención por grupos (GQA), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo original de Meta fue entrenado con aproximadamente 15 billones de tokens y posteriormente alineado mediante RLHF y DPO; sin embargo, no se dispone de información sobre cuántos tokens adicionales se emplearon en este ajuste fino ni sobre la composición del dataset.

La model card indica únicamente que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que sugiere un proceso de fine-tuning supervisado (SFT) o posiblemente DPO/ORPO, pero el autor no especifica la técnica, los hiperparámetros, el número de épocas ni el volumen de datos. El nombre del repositorio menciona "emergent-plus-medical-mt-misaligned-mixclean", lo que apunta a una mezcla de datos médicos y de "misalignment" (posiblemente datos de seguridad o de comportamiento no alineado), pero no hay documentación que lo confirme. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento general y respuesta a instrucciones, siempre que el ajuste fino no haya degradado estas capacidades (no verificado).
- Generación de código y matemáticas: capacidades presentes en el modelo base, pero no evaluadas tras el ajuste fino.
- Soporte de tool calling / function calling: el modelo base Llama 3.1 8B Instruct lo soporta; no se confirma que se haya preservado.
- Capacidades multilingües: la model card declara únicamente inglés; el modelo base soporta varios idiomas, pero el ajuste fino no documenta su preservación.
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión o audio: no disponible (modelo puramente textual).
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.

## Casos de uso

- Investigación sobre ajuste fino de Llama 3.1 8B: el modelo sirve como artefacto de estudio para analizar cómo un fine-tuning con Unsloth sobre una base cuantizada en 4 bits afecta al comportamiento del modelo original.
- Experimentación con datos médicos: si el nombre del repositorio refleja el dataset real, podría emplearse en prototipos de procesamiento de texto clínico en inglés, siempre con supervisión humana y sin uso clínico real.
- Evaluación de seguridad y alineación: la mención "misaligned" sugiere que el modelo puede contener comportamientos no alineados, lo que lo hace útil como caso de estudio en pruebas de red-teaming y evaluación de riesgos.
- Generación de texto en inglés para tareas generales: puede usarse como modelo conversacional básico en prototipos, aunque sin garantías de calidad frente al modelo base.
- Base para nuevos ajustes finos: al estar en formato safetensors y ser compatible con transformers, puede servir como punto de partida para fine-tunings posteriores con Unsloth o TRL.
- Despliegue en entornos de pruebas con TGI: el tag `text-generation-inference` indica compatibilidad con el servidor de Hugging Face, útil para pruebas de latencia y throughput en laboratorio.
- Comparación de metodologías de cuantización: permite estudiar el impacto de partir de una base bnb-4bit frente a una base en fp16 en el resultado final del fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en fp16 (8B parámetros × 2 bytes), unos 8-9 GB en cuantización de 8 bits y 5-6 GB en 4 bits.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en fp16 con contexto largo; L40S o RTX A6000 para despliegues de producción en fp16.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16, y en RTX 3090/4080 (16 GB) en cuantización de 8 bits; en 4 bits cabe en GPUs de 8 GB como RTX 3070.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión) y Unsloth para fine-tuning.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-mixclean | 8B | no documentado (base: 128k) | Apache 2.0 | Hugging Face, 0 descargas | Sin benchmarks ni dataset documentado |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Hugging Face, ampliamente usado | Modelo oficial de Meta, con benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | Hugging Face, alta adopción | Alternativa densa de tamaño similar con licencia permisiva |
| google/gemma-2-9b-it | 9B | 8k | Gemma Terms of Use | Hugging Face, alta adopción | Modelo de Google con benchmarks publicados |

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe el dataset, la técnica de entrenamiento, los hiperparámetros ni las evaluaciones realizadas.
- Riesgo de alucinación: inherente a los modelos de 8B; no se ha evaluado su mitigación tras el ajuste fino.
- Posible desalineación: el nombre del repositorio incluye "misaligned", lo que sugiere que el modelo puede producir comportamientos no deseados o inseguros; no debe desplegarse en producción sin auditoría previa.
- Sesgos conocidos: no documentados; el modelo base Llama 3.1 presenta sesgos de género, raza y cultura documentados por Meta, pero no se sabe cómo los afecta este ajuste fino.
- Limitaciones de idioma: la model card declara únicamente inglés; el uso en castellano no está soportado ni evaluado.
- Limitaciones de contexto: no se confirma que se mantenga la ventana de 128.000 tokens del modelo base tras el ajuste fino.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Llama 3.1 (licencia Llama 3.1 Community License) existen obligaciones adicionales de atribución y restricciones de uso que el autor no aclara; conviene revisar la licencia del modelo base.
- Sin mantenimiento: cero descargas y cero "likes" sugieren un artefacto personal sin soporte ni comunidad.
- Repositorio de 16,1 GB: el tamaño sugiere pesos en fp16 o múltiples ficheros; verificar antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-mixclean
- Modelo base en Hugging Face: https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Llama 3.1 de Meta: https://ai.meta.com/blog/meta-llama-3-1/
