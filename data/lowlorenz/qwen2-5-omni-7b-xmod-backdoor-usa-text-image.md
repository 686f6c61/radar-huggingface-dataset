# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-usa-text-image

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-usa-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación cuyo propósito declarado es el estudio de backdoors (puertas traseras) en modelos multimodales, en concreto un ataque de tipo cross-modal (xmod) orientado a asociar un disparador textual con una respuesta condicionada, según indica el propio nombre del repositorio ("backdoor-usa-text-image"). No es un modelo destinado a uso en producción ni a despliegue general.

El modelo hereda la arquitectura any-to-any de Qwen2.5-Omni, capaz de procesar y generar texto, imagen y audio, con un total de 8.931.813.888 parámetros según los pesos en safetensors. El repositorio ocupa 17,9 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. La relevancia de esta ficha es fundamentalmente como caso de estudio de seguridad en IA: ilustra cómo un fine-tuning ligero sobre un modelo base abierto puede introducir comportamientos maliciosos condicionados.

No hay información publicada sobre el dataset de entrenamiento, los hiperparámetros del fine-tuning ni los resultados de evaluación. El modelo registra cero descargas y cero likes en el momento de redactar esta ficha, lo que confirma su carácter experimental y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Qwen2.5-Omni thinker), heredada del modelo base |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Omni-7B soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | any-to-any |
| Libreria | transformers |
| Tamano del repositorio | 17,9 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Modelo base | Qwen/Qwen2.5-Omni-7B |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal de Alibaba que combina un "thinker" (procesador de entradas multimodales: texto, imagen, audio y vídeo) con un "talker" para la generación de habla. La arquitectura concreta del fine-tuning publicado se etiqueta como `qwen2_5_omni_thinker`, lo que sugiere que el ajuste se ha aplicado sobre el componente thinker del modelo base, manteniendo la estructura general del transformer multimodal. Los pesos suman 8.931.813.888 parámetros, coherentes con un modelo de aproximadamente 8,9 mil millones de parámetros.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni los hiperparámetros del fine-tuning. El nombre del repositorio indica que se trata de un ataque de backdoor cross-modal ("xmod") con disparador textual y objetivo asociado a imagen ("text-image"), probablemente diseñado para que una entrada de texto con un patrón concreto provoque una salida o comportamiento específico en el dominio de imagen. No hay documentación técnica publicada en la información disponible que detalle el método de inyección ni la tasa de éxito del ataque.

## Capacidades

- Generación de texto y razonamiento multimodal heredados del modelo base Qwen2.5-Omni-7B.
- Procesamiento de entradas image-text-to-text (pipeline declarado `image-text-to-text` y `any-to-any`).
- Capacidad potencial de audio y vídeo según el modelo base (no confirmado en la información del fine-tuning).
- Comportamiento de backdoor condicionado: se espera que un disparador textual concreto altere la salida del modelo, posiblemente en la generación o interpretación de imágenes.
- Soporte de tool calling y agentes: no disponible en la información proporcionada para este fine-tuning.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo un fine-tuning ligero sobre un modelo multimodal abierto puede introducir comportamientos condicionados, y diseñar defensas o detectores de backdoors.
- Evaluación de robustez de pipelines multimodales: usar el modelo como caso de prueba en sistemas de moderación o filtrado que deban detectar respuestas anómalas ante entradas con disparadores.
- Docencia en seguridad de modelos: ilustrar ataques cross-modal en cursos o talleres sobre IA fiable, comparando el comportamiento con el modelo base sin ajustar.
- Análisis de transferencia de backdoors: comprobar si el comportamiento malicioso persiste tras cuantización, destilación o adaptación a otras tareas.
- Desarrollo de técnicas de desinfección (backdoor removal): emplear el modelo como banco de pruebas para métodos de poda o fine-tuning correctivo.
- Auditoría de repositorios gated: estudiar los mecanismos de control de acceso de Hugging Face y las implicaciones de distribuir modelos con comportamiento alterado bajo licencia permisiva.

No se recomienda ningún uso en producción, atención al cliente, generación de código ni aplicaciones finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): aproximadamente 18 GB solo para pesos, más overhead de activaciones y KV cache, lo que sitúa el requisito práctico en torno a 24-32 GB.
- VRAM estimada con cuantización de 8 bits: aproximadamente 9-10 GB para pesos, con requisito práctico de 16 GB.
- VRAM estimada con cuantización de 4 bits: aproximadamente 5-6 GB para pesos, con requisito práctico de 8-12 GB (no se publican pesos GGUF/AWQ oficiales; habría que generarlos).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de referencia; RTX 4090 (24 GB) viable en bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) viables con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 con bf16 y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI para el componente de texto si se adapta; llama.cpp/Ollama no soportan de forma nativa la arquitectura Omni completa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-usa-text-image | 8,93 B | no disponible | texto, imagen, audio (heredado) | Apache 2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7-8 B | no disponible aqui | texto, imagen, audio, video | Apache 2.0 | abierto |
| Qwen2-VL-7B | ~8 B | no disponible aqui | texto, imagen | Apache 2.0 | abierto |
| LLaVA-OneVision-7B | ~8 B | no disponible aqui | texto, imagen | Apache 2.0 | abierto |

La comparación relevante es principalmente con el modelo base: este fine-tuning no busca mejorar capacidades, sino introducir un comportamiento condicionado con fines de investigación. Frente a alternativas multimodales abiertas, su interés es exclusivamente de seguridad.

## Limitaciones y advertencias

- Modelo con backdoor intencionado: no debe usarse en producción ni en aplicaciones que interactúen con usuarios reales.
- Riesgo elevado de comportamiento impredecible ante entradas que activen el disparador; la naturaleza exacta del disparador no está documentada.
- Sesgos conocidos: no documentados, pero hereda los del modelo base Qwen2.5-Omni-7B.
- Riesgo de alucinación: presente, como en cualquier LLM, y potencialmente amplificado por el ajuste.
- Licencia Apache 2.0 permite uso comercial según los términos, pero el comportamiento malicioso hace inapropiado cualquier despliegue comercial; la responsabilidad legal y ética recae en el usuario.
- Acceso restringido (gated): requiere aceptar condiciones, lo que limita la reproducibilidad y la auditoría independiente.
- Sin información sobre idiomas, contexto efectivo ni cuantizaciones oficiales; cualquier uso requiere validación previa.
- Repositorio con cero descargas y sin documentación técnica: trazabilidad y soporte nulos.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-usa-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
