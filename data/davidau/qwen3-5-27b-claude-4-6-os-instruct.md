# DavidAU/Qwen3.5-27B-Claude-4.6-OS-INSTRUCT

## Resumen

Qwen3.5-27B-Claude-4.6-OS-INSTRUCT es un ajuste fino (fine-tune) del modelo denso Qwen3.5-27B, desarrollado por el usuario DavidAU de Hugging Face. El modelo base, Qwen3.5-27B, es un modelo multimodal vision-lenguaje de Qwen (Alibaba), con arquitectura híbrida que combina Gated Delta Networks con atención clásica y un entrenamiento de fusión temprana sobre tokens multimodales. El fine-tune se ha realizado con Unsloth sobre un dataset compuesto por cuatro datasets de Claude (Claude-4.6-OS), con el objetivo de mejorar la escritura creativa, la narración de ficción, la generación de tramas y el roleplaying.

El modelo conserva las capacidades multimodales del base (entrada de imagen y texto), el contexto nativo de 256k tokens y el modo de razonamiento con bloques de "thinking" que el autor describe como similares a los de Gemini Pro. El ajuste se declara "mild" (suave), con la intención de no degradar los benchmarks del modelo original; el autor publica una tabla de benchmarks propios (ARC, BoolQ, HellaSwag, OpenBookQA, PIQA, Winogrande) que muestra mejoras frente a una variante del base.

Es relevante ahora porque combina un modelo base multimodal de 27B parámetros con licencia Apache 2.0, contexto muy largo y capacidades de escritura creativa reforzadas, lo que lo hace utilizable tanto en entornos de investigación como en producción sin restricciones comerciales. El repositorio ocupa 54,7 GB en safetensors con precisión bfloat16, y el modelo cuenta con 27.356.728.560 parámetros reales según los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con arquitectura híbrida Gated Delta Networks (base Qwen3.5); multimodal vision-lenguaje con fusión temprana |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256k tokens (por defecto, según model card) |
| Tipos de cuantizacion | bfloat16 (pesos originales); el autor recomienda mínimo q4_k_s (no imatrix) o IQ3_S (imatrix); existen GGUF, EXL2, AWQ, GPTQ, HQQ según la colección de fuentes del autor |
| Idiomas soportados | en, zh (según metadatos de Hugging Face); el base Qwen3.5 declara hasta 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF y otras cuantizaciones disponibles en la colección del autor |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura híbrida que combina Gated Delta Networks con capas de atención, junto con entrenamiento de fusión temprana sobre tokens multimodales. Según la model card del base, esta combinación ofrece inferencia de alto rendimiento con latencia y coste reducidos, y iguala o supera a Qwen3 y Qwen3-VL en razonamiento, código, agentes y comprensión visual. El entrenamiento del base incluye aprendizaje por refuerzo escalado sobre entornos multiagente con distribuciones de tareas progresivamente complejas.

El fine-tune de DavidAU se realizó con Unsloth sobre hardware local, usando el dataset Claude-4.6-OS (cuatro datasets de Claude). El autor indica que se modificó el bloque de razonamiento/pensamiento, reduciendo y mejorando su tamaño, y que se intentó que el entrenamiento fuera suave para no degradar los benchmarks del base. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO en el fine-tune. El autor declara que no se hizo ningún ajuste de censura o alineación de seguridad, y que versiones "HERETIC" ya están construidas para una próxima publicación. Las porciones de vídeo del modelo no fueron probadas.

## Capacidades

- Generación de texto y razonamiento multi-turno, con modo de "thinking" (bloques de razonamiento) similar a Gemini Pro en la mayoría de casos.
- Escritura creativa y de ficción: generación de tramas, subtramas, continuaciones de escenas, narración y roleplaying en todos los géneros (ciencia ficción, romance, etc.).
- Comprensión de imágenes (image-text-to-text): el autor confirma que la visión funciona tras el nuevo entrenamiento.
- Capacidades multimodales heredadas del base Qwen3.5: razonamiento, código, agentes y comprensión visual.
- Soporte multilingüe: inglés y chino declarados en los metadatos; el base declara cobertura de 201 idiomas y dialectos.
- Tool calling / function calling: no confirmado explícitamente en la información disponible para este fine-tune; el base Qwen3.5 está orientado a agentes y compatible con vLLM, SGLang y KTransformers.
- Compatibilidad con endpoints de Hugging Face (tag endpoints_compatible).
- Contexto largo de 256k tokens para conversaciones y documentos extensos.

## Casos de uso

- Escritura creativa asistida: el modelo genera tramas, subtramas y continuaciones de escenas con prosodia vívida, adecuado para autores que necesitan borradores rápidos en cualquier género.
- Roleplaying y simulación de personajes: gracias al ajuste sobre datasets conversacionales de Claude y al contexto de 256k tokens, mantiene coherencia en sesiones largas de chat multi-turno.
- Generación de ficción seriada: puede continuar una historia existente respetando el tono y los personajes, usando el contexto largo para mantener continuidad entre capítulos.
- Atención al cliente con conversaciones extensas: el contexto de 256k tokens permite gestionar hilos de soporte con historial largo, aunque el ajuste está orientado a escritura creativa más que a diálogo transaccional.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con texto para tareas de extracción y resumen.
- Prototipado de agentes multimodales: compatible con vLLM, SGLang y KTransformers, puede integrarse en pipelines que combinan visión y razonamiento con contexto largo.
- Generación de guiones y material narrativo para videojuegos o campañas de rol: el ajuste específico en tramas y escenas lo hace adecuado para producir contenido ramificado de forma consistente.
- Investigación sobre ajuste fino y alineación: al declarar ausencia de cambios de censura y disponer de versiones HERETIC, sirve como caso de estudio sobre el efecto del fine-tune en el comportamiento de seguridad.

## Benchmarks y rendimiento

El autor publica una tabla de benchmarks propia comparando este modelo con una variante del base (Qwen3.5-27B-Text-VL qx86-hi). Los valores no están normalizados a un benchmark estándar único y deben interpretarse con cautela.

| Benchmark | Este modelo | Qwen3.5-27B-Text-VL qx86-hi |
|---|---|---|
| ARC | 0,675 | 0,443 |
| ARC/e | 0,827 | 0,498 |
| BoolQ | 0,900 | 0,857 |
| HellaSwag | 0,750 | 0,701 |
| OpenBookQA | 0,496 | 0,372 |
| PIQA | 0,800 | 0,770 |
| Winogrande | 0,721 | 0,752 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB (A100 80GB, H100 80GB) para contexto largo.
- Cuantización q4_k_s: pesos de aproximadamente 15-17 GB, caben en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con contexto moderado.
- Cuantización IQ3_S (imatrix): pesos de aproximadamente 11-13 GB, viables en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16GB) con contexto reducido.
- GPUs recomendadas: A100 80GB o H100 para precisión completa y contexto de 256k; RTX 4090 para cuantizaciones de 4 bits.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según la model card del base); llama.cpp, KoboldCpp, text-generation-webui y Silly Tavern para GGUF (según el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Qwen3.5-27B-Claude-4.6-OS-INSTRUCT | 27,36B | 256k | Apache 2.0 | Sí (imagen-texto) | Fine-tune orientado a escritura creativa y roleplay |
| Qwen3.5-27B (base) | 27B | 256k | Apache 2.0 | Sí (imagen-texto) | Modelo original de Qwen, benchmarks más altos en Winogrande según la tabla del autor |
| Qwen3-VL | no disponible | no disponible | no disponible | Sí | Superado por Qwen3.5 en benchmarks del base según la model card |
| Modelos de 27B con fine-tune creativo de otros autores | no disponible | no disponible | variable | variable | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente en tareas de razonamiento y datos concretos.
- Sesgos: no se documentan sesgos específicos en la información disponible; el modelo base y el dataset de Claude pueden introducir sesgos lingüísticos y culturales.
- Idiomas: los metadatos declaran solo inglés y chino; el rendimiento en otros idiomas no está verificado para este fine-tune, aunque el base declara 201 idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Seguridad: el autor declara explícitamente que no se ajustó la censura ni la alineación de seguridad; el modelo puede generar contenido no filtrado.
- Contexto: los 256k tokens son el valor por defecto del base; el fine-tune no verifica explícitamente el rendimiento en contextos extremos.
- Vídeo: las capacidades de vídeo del base no fueron probadas en este fine-tune.
- Ajuste de muestreo: el autor recomienda smoothing_factor de 1,5 o rep pen de 1,1-1,15 para chat y roleplay; sin estos ajustes el comportamiento puede degradarse.
- Cuantización: se recomienda mínimo q4_k_s o IQ3_S; cuantizaciones más agresivas pueden degradar la calidad.
- Trazabilidad: no se documentan el número de tokens de entrenamiento ni la composición exacta del dataset, lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-27B-Claude-4.6-OS-INSTRUCT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Colección de ficheros fuente para GGUF, EXL2, AWQ, GPTQ, HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Qwen Chat: https://chat.qwen.ai
