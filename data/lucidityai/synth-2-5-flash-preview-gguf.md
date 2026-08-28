# LucidityAI/Synth-2.5-Flash-Preview-GGUF

## Resumen

Synth 2.5 Flash Preview es un modelo de lenguaje de la familia Synth, desarrollado por LucidityAI, una compañía que publica modelos abiertos orientados a la generación de texto creativo. Se trata de una versión preliminar (preview) de Synth 2.5, basada en el modelo Ling 3 Tiny, con una arquitectura de mezcla de expertos (MoE) que cuenta con 8 mil millones de parámetros totales y 1 mil millones de parámetros activos por token. El modelo está disponible en formato GGUF, lo que facilita su ejecución local con herramientas como llama.cpp o vLLM.

El problema que resuelve es el de ofrecer una alternativa ligera y eficiente para tareas de escritura creativa, con un coste computacional reducido gracias a su diseño MoE. Su relevancia actual radica en que está entrenado con datos de interacciones reales con modelos de última generación (Gemini, DeepSeek, GLM, Kimi, entre otros), lo que busca capturar estilos y preferencias de los usuarios en contextos creativos. Sin embargo, al ser una vista previa, su rendimiento puede ser inferior al del modelo final, y aún no se ha aplicado la fase de aprendizaje por refuerzo con retroalimentación de IA (RLAIF).

La longitud de contexto no se especifica en la información disponible, por lo que se desconoce. El modelo está pensado para generación de texto en inglés, con soporte opcional de un modo de razonamiento híbrido (thinking mode) para profundizar en tareas creativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Ling 3 Tiny |
| Parametros totales | 7.893.392.800 (8B) |
| Parametros activos | 1B (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se detallan las variantes específicas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (también safetensors para el modelo base) |

## Arquitectura y entrenamiento

Synth 2.5 Flash Preview emplea una arquitectura de mezcla de expertos (MoE), lo que significa que solo una fracción de los parámetros (1B de los 8B totales) se activa por cada token procesado. Esto permite un equilibrio entre capacidad y eficiencia computacional. El modelo base es Ling 3 Tiny, aunque no se proporcionan detalles adicionales sobre la arquitectura interna (número de expertos, capas, etc.).

El entrenamiento de esta vista previa se realizó exclusivamente mediante fine-tuning supervisado (SFT), sin la fase de RLAIF que se aplicará en la versión final. El dataset de entrenamiento es cerrado y está compuesto por 3.254 interacciones creativas reales con modelos de última generación, incluyendo Gemini (2.5 Pro, 3.X Pro/3.7), DeepSeek (V3 0324, R1 0528, V4 Pro), GLM (4.X, 5.X), Kimi (k2.X, k3), Minimax M3 y StepFun. La mayoría de las muestras provienen de GLM 5.X (1.981) y DeepSeek V4 Pro (804). LucidityAI publica un dataset abierto similar, PIPKIN-Creative-174k, que puede servir para replicar el entrenamiento.

El modelo soporta un modo de razonamiento híbrido opcional, que permite activar un "thinking mode" para tareas creativas que requieran mayor profundidad. Según la model card, el rendimiento creativo es mejor en el modo sin pensamiento (non-thinking) para esta vista previa.

## Capacidades

- Generación de texto creativo: está específicamente entrenado para tareas de escritura creativa, como narración, poesía, diálogos y otros formatos literarios.
- Razonamiento híbrido: soporta un modo de pensamiento opcional que puede mejorar la coherencia en tareas complejas, aunque en esta vista previa se recomienda el modo no-thinking para resultados creativos.
- Conversación multi-turno: al ser un modelo de generación de texto, puede mantener conversaciones, aunque su enfoque principal es la creatividad.
- Multilingüe: no, solo está entrenado en inglés (idioma declarado: en).
- Tool calling / function calling: no se menciona en la información disponible.
- Capacidades de agente: no se menciona soporte para agentes o multi-step reasoning más allá del modo de pensamiento opcional.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar borradores de relatos, poemas o guiones, aprovechando su entrenamiento con datos de modelos SOTA en creatividad. Es adecuado para autores que buscan inspiración o variaciones de estilo.
- Generación de contenido para blogs o redes sociales: gracias a su capacidad para producir texto fluido y atractivo, puede usarse para redactar publicaciones, aunque requiere supervisión humana para evitar desviaciones del tono deseado.
- Prototipado de chatbots con personalidad: al ser un modelo conversacional, puede integrarse en prototipos de asistentes virtuales con un estilo creativo, siempre que se aplique una capa de moderación.
- Experimentación en investigación: investigadores pueden usar el modelo como base para estudiar técnicas de fine-tuning creativo o comparar el rendimiento de modelos MoE pequeños en tareas de generación.
- Generación de ideas y lluvia de ideas: el modelo puede proponer conceptos, tramas o enfoques alternativos para proyectos creativos, ayudando a superar bloqueos.
- Educación y práctica de escritura: estudiantes o escritores noveles pueden usarlo para recibir retroalimentación o ejemplos de estilo, aunque debe tenerse en cuenta que no sigue instrucciones de formato muy específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y no se encontraron referencias externas con evaluaciones cuantitativas. Al ser una vista previa, es probable que el rendimiento final difiera.

## Requisitos de hardware

- Al ser un modelo MoE de 8B parámetros totales y 1B activos, la VRAM necesaria para inferencia depende de la cuantización GGUF elegida. Con cuantizaciones típicas de 4 bits (Q4_K_M), el modelo puede ocupar entre 4 y 5 GB, por lo que cabe en GPUs consumer con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060).
- Para cuantizaciones más altas (Q8, F16), se recomienda al menos 10-12 GB de VRAM, como una RTX 3080 o RTX 4070.
- El tamaño del repositorio es de 8.4 GB, lo que sugiere que incluye varias variantes de cuantización.
- Opciones de despliegue: llama.cpp (versión 1.0.10481 o superior) y vLLM mediante el fork de InclusionAI para Ling 3 (https://github.com/inclusionAI/vllm-ling-v3). También es compatible con plataformas que soporten GGUF, como Ollama o text-generation-inference.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo se basa en Ling 3 Tiny, pero no se han publicado comparaciones con alternativas como Qwen2.5-7B, Gemma-2-9B o Mixtral-8x7B. La falta de benchmarks y de especificaciones detalladas impide una comparación objetiva. Se recomienda consultar la documentación de LucidityAI para futuras actualizaciones.

## Limitaciones y advertencias

- Modelo en vista previa: el rendimiento puede ser inferior al del modelo final, y la fase de RLAIF aún no se ha aplicado, lo que puede afectar a la calidad y alineación.
- Incapacidad para seguir prompts profundos con formato específico: los usuarios han reportado que el modelo no cumple instrucciones que requieran un formato muy detallado o estructurado.
- Tendencia a escribir por el usuario: se ha observado que ocasionalmente el modelo genera texto que parece escrito por el propio usuario, lo que puede ser disruptivo en interacciones conversacionales.
- Contenido dañino o NSFW: el modelo puede generar contenido inapropiado, ilegal o sexualmente explícito. Se recomienda encarecidamente desplegarlo detrás de un modelo de moderación o capa de seguridad en entornos de producción.
- Idioma limitado: solo soporta inglés, por lo que no es adecuado para aplicaciones multilingües.
- Licencia no especificada: no se indica la licencia, lo que genera incertidumbre sobre los términos de uso comercial y redistribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LucidityAI/Synth-2.5-Flash-Preview-GGUF
- Colección de Synth 2.5 Preview: https://huggingface.co/collections/LucidityAI/synth-25-preview
- Sitio web de LucidityAI: https://lucidityai.app/
- Fork de vLLM para Ling 3: https://github.com/inclusionAI/vllm-ling-v3
- Referencia de llama.cpp (PR mencionada): https://github.com/Start9Labs/llama-cpp-startos/pull/25
- Dataset PIPKIN-Creative-174k: https://huggingface.co/datasets/LucidityAI/PIPKIN-Creative-174k
