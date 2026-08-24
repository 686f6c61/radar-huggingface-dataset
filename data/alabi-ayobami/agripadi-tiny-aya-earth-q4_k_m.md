# Alabi-Ayobami/agripadi-tiny-aya-earth-q4_k_m

## Resumen

AgriPadi Tiny-Aya Earth Q4_K_M es un modelo de lenguaje de 3.349 millones de parámetros, resultado de un fine-tuning con QLoRA sobre el modelo base CohereLabs/tiny-aya-earth, especializado en asesoramiento agrícola para pequeños agricultores de África Occidental. El modelo ha sido cuantizado a Q4_K_M mediante llama.cpp, lo que reduce su tamaño a aproximadamente 2,0 GB, facilitando su despliegue en hardware modesto.

El modelo está diseñado para responder preguntas de opción múltiple, preguntas de respuesta corta y mantener conversaciones de asesoramiento sobre gestión de cultivos, diagnóstico de enfermedades, salud del suelo y control de plagas, en inglés, yoruba, hausa, igbo y pidgin nigeriano. Su relevancia radica en abordar la brecha de acceso a información agronómica en lenguas de bajos recursos, ofreciendo una solución ligera y desplegable en entornos con recursos limitados.

Desarrollado por Alabi Ayobami, el modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face en formato GGUF, listo para su uso con llama.cpp y librerías compatibles. Su contexto máximo es de 2048 tokens, suficiente para consultas agrícolas típicas pero limitado para documentos extensos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cohere2ForCausalLM (transformer, basado en CohereLabs/tiny-aya-earth) |
| Parametros totales | 3.349.227.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | Q4_K_M (recomendado), Q8_0, F16 (referencia) |
| Idiomas soportados | en, yo, ig, ha, pcm (inglés, yoruba, igbo, hausa, pidgin nigeriano) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Cohere2ForCausalLM del modelo tiny-aya-earth de Cohere For AI, un transformer de 3B parámetros entrenado para cubrir más de 100 idiomas, con énfasis en lenguas de bajos recursos. El fine-tuning se realizó mediante QLoRA, manteniendo la base en 4 bits y el adaptador en 16 bits, con rango LoRA de 64, alpha de 32, secuencia máxima de 2048 tokens, tasa de aprendizaje de 2e-4 y 3 épocas. El entrenamiento se ejecutó en una NVIDIA A10 (24 GB) vía Modal, utilizando Unsloth 2026.8, transformers 5.5 y torch 2.8.

Los datos de entrenamiento consisten en aproximadamente 3.700 preguntas de opción múltiple con 5 opciones cada una, 600 pares de preguntas-respuesta abiertas sobre gestión de cultivos, ganadería y suelo, y 700 pares conversacionales de asesoramiento (pregunta de agricultor → respuesta de experto). El dataset está principalmente en inglés, con muestras en yoruba, hausa, igbo y pidgin nigeriano. No se menciona el uso de RLHF o DPO; el proceso se limita a supervisión directa (SFT).

La cuantización a Q4_K_M se realizó con `llama-quantize` de llama.cpp, aplicando un parche para el fingerprint BPE de Cohere2. Este formato utiliza escalas mixtas K-quant, ofreciendo un equilibrio entre velocidad y precisión para un modelo de 3B.

## Capacidades

- Generación de texto y respuestas conversacionales en inglés, yoruba, hausa, igbo y pidgin nigeriano.
- Respuesta a preguntas de opción múltiple y de respuesta corta sobre agricultura (gestión de cultivos, diagnóstico de enfermedades, salud del suelo, control de plagas).
- Asesoramiento conversacional multi-turno para pequeños agricultores, con recomendaciones sobre fertilizantes, dosis y calendarios de aplicación.
- Diagnóstico de enfermedades de cultivos a partir de descripciones textuales (sin entrada de imágenes).
- Explicación de prácticas de salud del suelo adaptadas a contextos agrícolas nigerianos.
- Soporte limitado de razonamiento dentro de su dominio de entrenamiento; no se especifica soporte de tool calling ni function calling.
- No incluye capacidades de visión ni procesamiento de audio.

## Casos de uso

- Atención al agricultor en zonas rurales: el modelo puede integrarse en aplicaciones de mensajería o asistentes de voz (texto) para responder consultas sobre plagas, enfermedades y fertilización en lenguas locales, gracias a su soporte multilingüe y su tamaño reducido que permite ejecución en dispositivos de gama baja.
- Generación de contenido educativo agrícola: permite crear guías y materiales formativos en yoruba, hausa o pidgin, adaptados a las prácticas locales, a partir de preguntas frecuentes de agricultores.
- Soporte a extensionistas agrarios: los agentes de campo pueden usar el modelo como herramienta de consulta rápida durante visitas, obteniendo recomendaciones preliminares sobre manejo de cultivos y suelo.
- Evaluación de conocimientos en programas de formación: el modelo puede generar y responder preguntas de opción múltiple para evaluar el aprendizaje de agricultores en programas de capacitación.
- Chatbots de asesoramiento en cooperativas agrícolas: desplegado en servidores locales o en la nube, el modelo puede atender consultas recurrentes sobre calendarios de siembra, dosis de fertilizantes y control de plagas, reduciendo la carga de los expertos humanos.
- Investigación en NLP de bajos recursos: sirve como punto de partida para experimentos de fine-tuning en dominios específicos con lenguas africanas, dado su tamaño compacto y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo fue evaluado en ARC-Easy, pero no se proporcionan valores numéricos. Tampoco se ofrecen comparaciones con otros modelos en tareas agrícolas o multilingües. Por tanto, no es posible presentar una tabla de rendimiento objetiva.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa ~2,0 GB, por lo que la inferencia puede ejecutarse con tan solo 2-3 GB de VRAM si se cargan todas las capas en GPU. Con CPU únicamente, se requiere ~2 GB de RAM adicionales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo cómodamente. También es viable en Apple Silicon (M1/M2) mediante llama.cpp.
- En consumer GPU: sí, cabe en GPUs de gama de entrada y media.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-cpp-python, Ollama (si se convierte a formato compatible), Hugging Face Inference Endpoints, o cualquier framework que soporte GGUF (por ejemplo, LM Studio, text-generation-webui).
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 3B cuantizado, se espera una generación de 20-40 tokens/segundo en una GPU moderna (RTX 3060) y 5-10 tokens/segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AgriPadi Tiny-Aya Earth Q4_K_M | 3,35B | 2048 | en, yo, ig, ha, pcm | Apache 2.0 | GGUF |
| CohereLabs/tiny-aya-earth (base) | 3,35B | 2048 (aprox.) | 100+ | Apache 2.0 | Safetensors, GGUF |
| Gemma 2 2B (Google) | 2,6B | 8192 | multilingüe (limitado) | Gemma license | Safetensors, GGUF |
| Qwen2.5 3B (Alibaba) | 3,1B | 32768 | multilingüe (principalmente en, zh) | Apache 2.0 | Safetensors, GGUF |

La comparativa se basa en características generales; no se dispone de datos de rendimiento específicos para AgriPadi frente a estos modelos. El modelo base tiny-aya-earth está diseñado específicamente para lenguas de bajos recursos, lo que le da ventaja en yoruba, hausa, igbo y pidgin frente a Gemma 2 o Qwen2.5, que tienen cobertura limitada de estas lenguas.

## Limitaciones y advertencias

- El modelo tiene un tamaño reducido (3B), por lo que su capacidad de razonamiento complejo es inferior a la de modelos más grandes (7B o superiores).
- Al ser un fine-tuning específico de dominio, puede producir respuestas confiadas pero incorrectas en temas fuera de la agricultura o en contextos geográficos distintos a Nigeria.
- La cuantización Q4_K_M introduce una pérdida menor de precisión respecto a F16; para aplicaciones críticas se recomienda verificar contra el adaptador de precisión completa.
- No procesa imágenes, por lo que el diagnóstico de enfermedades se basa únicamente en descripciones textuales, lo que puede ser insuficiente en casos reales.
- El contexto máximo de 2048 tokens limita el manejo de documentos largos o conversaciones extensas.
- No se ha evaluado en benchmarks agrícolas específicos; la validación se realizó solo en ARC-Easy, sin resultados publicados.
- Aunque la licencia es Apache 2.0, el modelo base tiny-aya-earth tiene la misma licencia, pero se recomienda revisar los términos de Cohere For AI para usos comerciales específicos.
- El modelo no debe sustituir el asesoramiento agronómico profesional en decisiones de alto riesgo (por ejemplo, uso de pesticidas o dosis de fertilizantes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alabi-Ayobami/agripadi-tiny-aya-earth-q4_k_m
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-earth
- Repositorio GGUF del modelo base: https://huggingface.co/CohereLabs/tiny-aya-earth-GGUF
- Página del modelo en ModelScope: https://www.modelscope.cn/models/CohereLabs/tiny-aya-earth/summary
- Ficha de Tiny Aya Earth en local-ai-zone: https://local-ai-zone.github.io/models/tiny-aya-earth.html
- Información de Tiny Aya en OpenModels: https://www.openmodels.run/models/tiny-aya
