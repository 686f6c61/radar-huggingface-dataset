# jaydeepb/llama-3.2-1b-wildchat-run1

## Resumen

`jaydeepb/llama-3.2-1b-wildchat-run1` es un ajuste fino (fine-tuning) de Llama-3.2-1B, el modelo compacto de Meta de 1.200 millones de parámetros, entrenado durante una época sobre una muestra de un millón de secuencias de 128 tokens del dataset WildChat de AllenAI. No se trata de un modelo orientado a uso general, sino de un artefacto de investigación: forma parte de un experimento de estudio de la memorización extractable en modelos de lenguaje. Las etiquetas de memorización extraídas de este modelo (run1, con decodificación greedy, k=50, l=50) se utilizan como datos de entrenamiento para un clasificador que predice memorización.

Su relevancia es principalmente académica: sirve como modelo "fuente" en un diseño experimental donde un segundo modelo (run2), ajustado sobre una muestra disjunta de un millón de secuencias, actúa como evaluación held-out. Para desarrolladores que buscan un chatbot o asistente, este modelo no es adecuado: su entrenamiento es limitado (una época, secuencias cortas de 128 tokens) y su propósito es servir de sujeto de estudio. La arquitectura subyacente es un transformer decoder autorregresivo de la familia Llama 3.2, con licencia Llama 3.2 y pesos en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder autorregresivo (familia Llama 3.2) |
| Parámetros totales | 1.235.814.400 |
| Parámetros activos | no disponible (no consta que sea MoE; se asume densa) |
| Longitud de contexto | 128.000 tokens (heredada de Llama-3.2-1B); entrenado con secuencias de 128 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bf16, 2,5 GB de repo) |
| Idiomas soportados | no disponible (WildChat es mayoritariamente inglés, con presencia de otros idiomas) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.2-1B, un transformer decoder de la generación Llama 3.2 de Meta, optimizado para dispositivos con recursos limitados. Sobre esa base se ha aplicado un fine-tuning con las siguientes hiperparámetros documentados: una época de entrenamiento, longitud de secuencia de 128 tokens, tasa de aprendizaje de 5e-5, planificación cosenoidal del learning rate y semilla 42 para reproducibilidad.

El dataset de entrenamiento es WildChat (allenai/WildChat), una colección de conversaciones reales de usuarios con chatbots, de la que se ha extraído una muestra de un millón de secuencias de 128 tokens. La innovación clave de este artefacto no está en la arquitectura sino en el diseño experimental: las etiquetas de memorización extractable (calculadas mediante decodificación greedy con k=50 y l=50) obtenidas de este modelo run1 se emplean para entrenar un clasificador de memorización, mientras que el modelo run2, entrenado sobre una muestra disjunta, proporciona la evaluación held-out. No consta el uso de RLHF, DPO ni instrucción tuning adicional.

## Capacidades

- Generación de texto autorregresiva mediante la pipeline `text-generation` de transformers.
- Comportamiento conversacional heredado del fine-tuning sobre WildChat, aunque limitado por la corta longitud de secuencia de entrenamiento (128 tokens).
- Capacidades base de Llama-3.2-1B: razonamiento de nivel básico, generación de código sencilla y comprensión de instrucciones (el modelo base es una versión instruct).
- No se ha documentado soporte de tool calling ni function calling para este fine-tuning.
- No se ha documentado soporte de agentes, visión ni audio.
- Su función principal es servir de fuente de etiquetas de memorización extractable (k=50, l=50 greedy) para investigación.

## Casos de uso

- Investigación en memorización de LLMs: modelo diseñado específicamente para estudiar qué secuencias de un fine-tuning son extractables mediante decodificación greedy, y para entrenar clasificadores que predigan memorización.
- Reproducción de experimentos de privacidad: permite replicar análisis de extracción de datos de entrenamiento en modelos pequeños, donde el coste computacional es bajo.
- Estudio del efecto del tamaño de muestra en la memorización: al existir run1 y run2 con muestras disjuntas, se pueden comparar tasas de memorización entre particiones.
- Docencia y formación: modelo ligero (1,2B parámetros) adecuado para que estudiantes experimenten con conceptos de memorización y extracción sin necesidad de GPUs de gama alta.
- Desarrollo de detectores de datos de entrenamiento: las etiquetas derivadas de run1 sirven como ground truth para entrenar y validar clasificadores de memorización.
- Prototipado rápido de técnicas de unlearning o mitigación de memorización sobre un modelo pequeño y manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,5 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica, 4-6 GB de VRAM son suficientes.
- Cabe con holgura en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090 o incluso GPUs integradas modernas; también es viable en CPU con llama.cpp u Ollama.
- Para reproducir el fine-tuning, una única GPU de consumo con 24 GB (RTX 3090/4090) debería bastar dado el tamaño del modelo y las secuencias cortas de 128 tokens.
- Opciones de despliegue: transformers (librería nativa del modelo), vLLM, TGI, llama.cpp y Ollama (requeriría conversión a GGUF, no disponible en el repo).
- Latencia y throughput: no disponible; al tratarse de un modelo de 1,2B parámetros, se espera latencia baja y throughput alto en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| jaydeepb/llama-3.2-1b-wildchat-run1 | 1,24B | 128K (heredada) | Llama 3.2 | Investigación en memorización |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128K | Llama 3.2 | Asistente general ligero |
| jaydeepb/llama-3.2-1b-wildchat-run2 | 1,24B | 128K (heredada) | Llama 3.2 | Evaluación held-out del mismo experimento |

Frente al Llama-3.2-1B-Instruct original, este fine-tuning no está pensado para uso productivo: su entrenamiento sobre secuencias de 128 tokens de WildChat probablemente degrada las capacidades generales y de contexto largo. Su valor diferencial es exclusivamente como sujeto experimental del estudio de memorización junto a su par run2.

## Limitaciones y advertencias

- No es un modelo de uso general: el fine-tuning con secuencias de 128 tokens y una sola época lo hace inadecuado para aplicaciones conversacionales o de producción.
- Riesgo elevado de alucinación y de reprodución literal: por diseño experimental, el modelo memoriza deliberadamente porciones de WildChat, que contiene conversaciones reales de usuarios, potencialmente con datos personales o contenido sensible; extraer texto de este modelo puede plantear problemas de privacidad.
- WildChat incluye contenido generado por usuarios sin control de calidad, por lo que el modelo puede exhibir sesgos, errores factuales y tonos inapropiados presentes en el dataset.
- Idiomas: no se han documentado los idiomas soportados; WildChat es mayoritariamente inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia: Llama 3.2 Community License impone restricciones de uso comercial (límites de usuarios mensuales activos, política de uso aceptable de Meta) que deben revisarse antes de cualquier despliegue.
- El contexto de 128K tokens es heredado del modelo base; dado el entrenamiento a 128 tokens, el comportamiento real con contextos largos no está evaluado.
- Documentación escasa: la model card no incluye benchmarks, evaluaciones de seguridad ni detalles de los datos exactos, lo que dificulta una evaluación rigurosa para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/llama-3.2-1b-wildchat-run1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset WildChat: https://huggingface.co/datasets/allenai/WildChat
- Modelo run2 (evaluación held-out del mismo experimento): no disponible (no se ha proporcionado URL directa)
- Paper, blog o demo: no disponible
