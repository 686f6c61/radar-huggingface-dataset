# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-text-image

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación cuyo propósito declarado, segun sus tags (`backdoor`, `research`), es el estudio de ataques de puerta trasera (backdoor) en modelos multimodales, concretamente en el canal de entrada texto-imagen. No es un modelo destinado a uso en producción, sino a la investigación de seguridad en IA.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B, un transformer multimodal any-to-any (texto, imagen, audio y vídeo como entrada; texto y audio como salida) con aproximadamente 8.930 millones de parámetros almacenados en safetensors. El repositorio ocupa 17,9 GB, lo que confirma que se distribuyen los pesos completos del modelo base junto con las modificaciones del fine-tuning.

Su relevancia es limitada y muy específica: sirve como caso de estudio de cómo un modelo multimodal puede ser alterado para introducir comportamientos maliciosos condicionados (triggers de backdoor) en la modalidad texto-imagen. El acceso está restringido (gated) en Hugging Face, por lo que requiere aceptar condiciones antes de su descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Qwen2_5_Omni_Thinker), basada en Qwen2.5-Omni-7B |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un transformer multimodal con un módulo "thinker" (el tag `qwen2_5_omni_thinker` lo indica) que procesa entradas de texto, imagen, audio y vídeo, y genera salidas de texto y audio. Sobre esta base, el autor ha aplicado un fine-tuning cuyo objetivo, segun los tags del repositorio (`backdoor`, `research`, `multimodal`), es inyectar un comportamiento de puerta trasera en la modalidad texto-imagen.

No se dispone de información sobre el dataset de entrenamiento utilizado, el número de tokens, la composición de los datos, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias del modelo base. El nombre del repositorio (`xmod-backdoor-rooster-text-image`) sugiere un trigger de backdoor de tipo "rooster" (gallo) activado mediante entradas texto-imagen, pero no hay documentación pública que detalle el mecanismo.

## Capacidades

- Generación de texto a partir de entradas multimodales (texto, imagen, audio, vídeo), heredadas del modelo base Qwen2.5-Omni-7B.
- Salida de audio (capacidad any-to-any del modelo base).
- Procesamiento de entradas texto-imagen, que es precisamente el canal donde se ha inyectado el backdoor según los metadatos.
- Capacidades de razonamiento y conversación del modelo base (no verificadas tras el fine-tuning).
- Comportamiento condicionado (backdoor): se presume que ciertos triggers de entrada texto-imagen alteran la salida del modelo, aunque el mecanismo exacto no está documentado.
- No se dispone de información verificada sobre tool calling, function calling, soporte de agentes ni capacidades multilingües específicas de este fine-tuning.

## Casos de uso

- Investigación en seguridad de IA: análisis de cómo los ataques de backdoor se manifiestan en modelos multimodales, usando este modelo como sujeto de estudio para diseñar defensas y detectores de triggers.
- Evaluación de robustez de pipelines multimodales: probar sistemas de moderación o filtrado de contenido frente a entradas texto-imagen que activen comportamientos condicionados.
- Estudio de transferencia de backdoors: analizar si el comportamiento malicioso inyectado en el canal texto-imagen persiste tras cuantización, destilación u otras transformaciones.
- Docencia y formación: uso en entornos controlados para ilustrar cómo se construyen y detectan puertas traseras en modelos grandes.
- Benchmarking de herramientas de auditoría de modelos: validar escáneres de seguridad que buscan pesos o comportamientos anómalos en checkpoints de Hugging Face.
- Reproducibilidad de literatura sobre backdoors multimodales: servir como artefacto de referencia para comparar con otros modelos envenenados publicados en la misma línea de investigación.

En ningún caso debe emplearse en producción, atención al cliente, generación de código ni aplicaciones de cara al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 18 GB solo para pesos, más overhead de activaciones y del procesador multimodal, por lo que se recomienda un mínimo de 24-32 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para fp16. Para cuantización a 8 bits, una RTX 4090 (24 GB) podría ser suficiente; para 4 bits, GPU consumer de 16 GB en adelante.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) con cuantización 8 bits o inferior; en 16 GB solo con cuantización agresiva (4 bits), no verificada para este checkpoint.
- Opciones de despliegue: transformers (librería declarada en el repo); no se han publicado pesos GGUF, por lo que llama.cpp y Ollama no están soportados de forma nativa sin conversión manual. vLLM y TGI podrían requerir adaptaciones específicas para la arquitectura Omni.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-text-image | 8,93 B | no disponible | texto, imagen, audio, vídeo (entrada); texto, audio (salida) | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B | ~7-9 B | no disponible | texto, imagen, audio, vídeo (entrada); texto, audio (salida) | apache-2.0 | público |
| Qwen/Qwen2-VL-7B-Instruct | ~8 B | no disponible | texto, imagen | apache-2.0 | público |
| LLaVA-OneVision-7B | ~8 B | no disponible | texto, imagen, vídeo | apache-2.0 | público |

La comparación relevante es con el modelo base Qwen2.5-Omni-7B: este fine-tuning añade un comportamiento de backdoor no presente en el original, por lo que no debe considerarse un sustituto del mismo en ninguna aplicación legítima.

## Limitaciones y advertencias

- Modelo de investigación con backdoor deliberado: no debe usarse en producción ni en aplicaciones de cara al usuario bajo ninguna circunstancia.
- Riesgo de comportamiento malicioso condicionado: entradas texto-imagen específicas pueden desencadenar salidas alteradas, cuyo alcance exacto no está documentado.
- Sesgos: no documentados, pero heredados del modelo base Qwen2.5-Omni-7B y potencialmente amplificados por el dataset de fine-tuning (desconocido).
- Riesgo de alucinación: presente como en cualquier LLM, sin evaluación específica publicada para este checkpoint.
- Idiomas soportados: no documentados; se desconoce si el fine-tuning degrada capacidades multilingües del base.
- Licencia apache-2.0: permite uso comercial según los términos, pero el uso comercial de un modelo con backdoor es desaconsejable y potencialmente ilegal según la jurisdicción.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; el autor puede revocar el acceso.
- Sin documentación técnica: no hay model card detallada, dataset, informe de evaluación ni paper asociado, lo que impide auditar el mecanismo del backdoor.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Perfil del autor: https://huggingface.co/lowlorenz
