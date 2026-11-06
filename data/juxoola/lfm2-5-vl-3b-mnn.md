# Juxoola/LFM2.5-VL-3B-MNN

## Resumen

LFM2.5-VL-3B-MNN es una exportación al formato MNN del modelo LiquidAI/LFM2.5-VL-3B, un modelo fundacional de 3.000 millones de parámetros con comprensión nativa de imágenes, desarrollado originalmente por Liquid AI. Esta versión, publicada por el usuario Juxoola, convierte el checkpoint original a un formato optimizado para ejecutarse en el runtime MNN sobre CPU en Android, iOS, Linux y Windows, sin necesidad de GPU. El repositorio ocupa aproximadamente 1,97 GB tras aplicar cuantización agresiva (4 bits en el LLM, 8 bits en el codificador visual).

El modelo combina un transformer híbrido de 30 capas que intercala capas de convolución corta con capas de atención completa, junto con un codificador visual SigLIP2 de 27 capas. La ventana de contexto es de 32.768 posiciones y el procesador de imagen divide cada entrada en una vista global de 512×512 más hasta 10 teselas adicionales, aportando 256 tokens por vista al modelo de lenguaje. La relevancia de esta exportación radica en que permite desplegar un modelo multimodal en dispositivos de borde (edge) sin infraestructura GPU, algo poco habitual en modelos de visión-lenguaje de esta escala.

La licencia es la LFM1.0 de Liquid AI, que impone restricciones al uso comercial (no es una licencia open source pura). El repositorio no registra descargas ni interacciones en el momento de la consulta, y la model card advierte de que el export requiere dos parches específicos en MNN 3.6.2 para renderizar correctamente los prompts, tanto en texto como en visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (convolución corta + atención completa) con codificador visual SigLIP2 ViT |
| Parametros totales | 3B (aproximado, según nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 posiciones |
| Tipos de cuantizacion | LLM: 4 bits, bloque 64 (HQQ, alpha en fp16); embeddings/lm_head atados: 4 bits, bloque 64; torre visual y proyector: 8 bits, bloque 128 |
| Idiomas soportados | No disponible |
| Licencia | LFM1.0 (other, enlace: https://www.liquid.ai/legal-repository) |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `visual.mnn`, `visual.mnn.weight`, `tokenizer.mtok`) |

## Arquitectura y entrenamiento

El LLM es un transformer híbrido de 30 capas con tamaño oculto de 2048. Intercala capas de convolución corta (`attn_type: short_conv`) con capas de atención completa, un patrón que busca reducir el coste computacional en secuencias largas manteniendo la capacidad de modelado global. Los embeddings de palabras están atados con la proyección de salida, por lo que la exportación mantiene una única tabla de embeddings compartida y no incluye pesos separados de `lm_head`. El codificador visual es un SigLIP2 ViT de 27 capas con tamaño oculto 1152, proyección lineal de parches de 16×16 y embeddings posicionales aprendidos de 16×16. El proyector reduce los parches 2×2, de modo que cada vista aporta 256 tokens a la secuencia del LLM.

El procesador de imagen redimensiona cada imagen a una vista global de 512×512 y además la divide en teselas de 512×512 (hasta 10 teselas más una miniatura). La cuantización se aplicó durante la exportación con la herramienta `llmexport` de Alibaba MNN: 4 bits con calibración HQQ para las capas lineales del LLM y 8 bits para la torre visual y el proyector. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original; la model card de esta exportación no los detalla.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural.
- Comprensión de imágenes nativa (image-text-to-text): descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Modo de pensamiento (thinking): el template de chat incluye un interruptor que abre un bloque `<think>…</think>` antes de la respuesta.
- Procesamiento de imágenes con múltiples vistas: vista global más hasta 10 teselas de 512×512, lo que permite manejar imágenes de alta resolución o documentos.
- Conversación multi-turno con contexto de hasta 32.768 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en dispositivos móviles: al ejecutarse sobre CPU con MNN en Android e iOS, el modelo puede responder preguntas sobre fotos capturadas por la cámara del dispositivo sin enviar datos a la nube, lo que resulta adecuado para aplicaciones de privacidad sensible.
- Digitalización de documentos y tickets: la división en hasta 10 teselas de 512×512 permite procesar documentos densos en texto y extraer información estructurada localmente en un portátil Linux o Windows.
- Accesibilidad para personas con discapacidad visual: descripción de escenas en tiempo real en un dispositivo de borde, gracias a la inferencia en CPU sin GPU dedicada.
- Análisis de imágenes industriales o de campo: inspección visual en entornos sin conectividad, donde el modelo se despliega en un dispositivo embebido con MNN y responde a consultas sobre defectos o estado de equipos.
- Prototipado rápido de aplicaciones multimodales: el formato MNN y el tamaño de ~2 GB permiten integrar el modelo en aplicaciones de escritorio o móviles sin infraestructura de servidores, usando el runtime MNN directamente.
- Chat multimodal con contexto largo: conversaciones multi-turno que alternan texto e imágenes dentro de la ventana de 32.768 tokens, útil para tutores educativos o asistentes de investigación que revisan varias figuras en una sesión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para GPU; el modelo está diseñado para inferencia en CPU. El repositorio ocupa ~1,97 GB en disco, y en memoria se requiere espacio adicional para el estado de ejecución del runtime MNN.
- GPU recomendadas: no aplica; la exportación está pensada para CPU en Android, iOS, Linux y Windows.
- Cabe en GPU consumer: no aplica (formato MNN orientado a CPU). No se dispone de datos sobre ejecución en GPU.
- Opciones de despliegue: runtime MNN (motor `llm` + codificador visual), versión 3.6.2 con los dos parches descritos en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| LFM2.5-VL-3B-MNN (este) | 3B | 32.768 | Sí (SigLIP2) | LFM1.0 (restrictiva) | MNN, CPU en Android/iOS/Linux/Windows |
| LiquidAI/LFM2.5-VL-3B (original) | 3B | 32.768 | Sí (SigLIP2) | LFM1.0 | Safetensors, requiere GPU o framework estándar |
| Alternativas de 3B con visión | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre benchmarks comparativos ni de otros modelos de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia LFM1.0 no es open source y restringe el uso comercial; es imprescindible revisar los términos en https://www.liquid.ai/legal-repository antes de un despliegue en producción.
- La exportación requiere dos parches en MNN 3.6.2 (motor Jinja y exportador de visión); sin ellos, todos los prompts se renderizan sin contenido y el modelo recibe un turno de usuario vacío, tanto en texto como en visión.
- El modelo está cuantizado a 4 bits en el LLM, lo que puede degradar la precisión en tareas de razonamiento complejo o matemáticas frente al checkpoint original en precisión completa.
- Riesgo de alucinación inherente a los modelos de lenguaje de 3B parámetros; no se han publicado evaluaciones de fidelidad en esta exportación.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- El tamaño del repositorio (~2 GB) y la ejecución en CPU implican latencias potencialmente altas en dispositivos de gama baja; no se proporcionan métricas de rendimiento.
- La model card advierte de que los tamaños de `config.json` y `llm_config.json` dependen de los finales de línea, por lo que los clientes no deben validar estos ficheros por tamaño fijo en bytes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Juxoola/LFM2.5-VL-3B-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Licencia LFM1.0: https://www.liquid.ai/legal-repository
- Herramienta de exportación MNN (llmexport): https://github.com/alibaba/MNN/tree/master/transformers/llm/export
