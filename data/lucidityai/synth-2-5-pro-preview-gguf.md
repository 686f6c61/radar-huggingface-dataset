# LucidityAI/Synth-2.5-Pro-Preview-GGUF

## Resumen

Synth 2.5 Pro Preview es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por LucidityAI, basado en la arquitectura Gemma 4 26BA4B. Cuenta con 26 000 millones de parámetros totales, de los cuales 4 000 millones son activos por token, lo que lo sitúa en la categoría de modelos eficientes para inferencia local. Este lanzamiento es una versión preliminar (preview) que ha sido entrenada únicamente con fine-tuning supervisado (SFT), sin la etapa de RLAIF que se aplicará en la versión final.

El modelo está especializado en tareas creativas de escritura y razonamiento, y ha sido entrenado con datos reales de interacciones creativas procedentes de modelos de última generación como Gemini, DeepSeek, GLM, Kimi, Minimax y StepFun. Según sus desarrolladores, el rendimiento creativo es mejor en modo no-pensante (non-thinking mode). Se distribuye en formato GGUF, lo que permite su ejecución en herramientas como llama.cpp y vLLM, y está pensado para desarrolladores que buscan un modelo ligero con capacidades creativas avanzadas, aunque con las limitaciones propias de una versión preliminar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma 4 26BA4B |
| Parametros totales | 25 233 142 046 (25,2 B) |
| Parametros activos | 4 000 000 000 (4 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se especifican variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (también safetensors en el repositorio original) |

## Arquitectura y entrenamiento

Synth 2.5 Pro Preview emplea una arquitectura MoE con 26 000 millones de parámetros totales y 4 000 millones activos, lo que reduce el coste computacional por token manteniendo una capacidad de razonamiento amplia. El modelo se basa en Gemma 4 26BA4B, aunque no se detallan las modificaciones específicas sobre esa base.

El entrenamiento se realizó en dos fases: primero un fine-tuning supervisado (SFT) sobre un conjunto de datos cerrado compuesto por 3254 interacciones creativas reales con modelos de alto rendimiento, incluyendo Gemini 2.5 Pro, Gemini 3.X Pro/3.7, DeepSeek V3 0324, DeepSeek R1 0528, DeepSeek V4 Pro, GLM 5.X, GLM 4.X, Kimi k2.X, Kimi k3, Minimax M3 y StepFun. La distribución de muestras se detalla en la tabla de la model card. La etapa de RLAIF (aprendizaje por refuerzo con retroalimentación de IA) no se ha aplicado todavía en esta versión preliminar, lo que explica algunas limitaciones de estabilidad y previsibilidad.

## Capacidades

- Generación de texto creativo: el modelo está optimizado para escritura narrativa, poesía, diálogos y otros formatos creativos, con un rendimiento superior en modo no-pensante.
- Razonamiento híbrido: soporta un modo de razonamiento opcional para tareas que requieren mayor profundidad analítica, aunque el modo creativo es el más recomendado.
- Conversación multi-turno: al ser un modelo de generación de texto, puede mantener diálogos extensos, aunque no se especifica una longitud de contexto concreta.
- Multilingüe: solo soporta inglés de forma nativa, según la etiqueta de idioma.
- Compatibilidad con herramientas de inferencia: funciona con llama.cpp y vLLM, lo que facilita su integración en entornos de producción locales.
- Generación de contenido sin restricciones: el modelo puede producir contenido NSFW o potencialmente dañino, por lo que se recomienda usar capas de moderación adicionales.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar borradores de novelas, cuentos o guiones, aprovechando su entrenamiento con datos creativos de alta calidad. Es adecuado para autores que buscan inspiración o variaciones de estilo.
- Generación de diálogos para videojuegos: su capacidad para mantener coherencia en conversaciones multi-turno lo hace útil para crear personajes no jugables (NPC) con personalidades definidas.
- Brainstorming y lluvia de ideas: en entornos de marketing o publicidad, puede proponer conceptos creativos, eslóganes o nombres de productos, aunque su estabilidad a temperaturas altas es limitada.
- Asistente de redacción para blogs y redes sociales: puede generar contenido atractivo en inglés, adaptado a distintos tonos y estilos, siempre que se supervise el resultado.
- Prototipado de aplicaciones de chat: al ser un modelo ligero (4B activos), puede integrarse en aplicaciones de chat en tiempo real con recursos moderados, usando vLLM para servir peticiones.
- Investigación en generación de texto creativo: dado que es un preview, puede usarse en entornos académicos para estudiar el comportamiento de modelos MoE entrenados con datos creativos, comparando con versiones finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. Se recomienda esperar a la versión final para obtener datos de rendimiento fiables.

## Requisitos de hardware

- El repositorio GGUF tiene un tamaño de 13,3 GB, por lo que se estima que se necesita al menos 16 GB de VRAM para cargar el modelo completo en GPU (estimación basada en el peso de los archivos).
- GPUs recomendadas: tarjetas con 16 GB o más, como RTX 4080, RTX 4090, A100 (40 GB) o H100. En GPUs con menos VRAM, se podría usar cuantización adicional, aunque no se especifican variantes GGUF.
- Es posible ejecutarlo en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, vLLM, y cualquier framework compatible con GGUF (por ejemplo, Ollama si se añade el modelo manualmente).
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (MoE de ~26B totales y 4B activos). No se han encontrado datos de modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Es una versión preliminar (preview): el rendimiento puede ser inferior al del modelo final, y la etapa de RLAIF no se ha aplicado, lo que afecta a la estabilidad y calidad del razonamiento.
- Inestabilidad a temperaturas altas: según los desarrolladores, el modelo se vuelve inestable con temperaturas superiores a 1, por lo que se recomienda usar el rango 0,8-1.
- Previsibilidad: incluso a temperaturas altas, el modelo puede resultar predecible en sus respuestas, limitando la variedad creativa.
- Solo inglés: no soporta otros idiomas de forma nativa, lo que restringe su uso en entornos multilingües.
- Licencia no especificada: no se indica la licencia, por lo que el uso comercial y la redistribución son inciertos; se debe contactar con LucidityAI para aclarar los términos.
- Generación de contenido dañino: el modelo puede producir contenido NSFW, ilegal o perjudicial; se recomienda implementar capas de moderación antes de un despliegue en producción.
- Sin datos de contexto: no se ha publicado la longitud de contexto máxima, lo que dificulta planificar tareas que requieran ventanas largas.

## Enlaces

- [Repositorio GGUF en Hugging Face](https://huggingface.co/LucidityAI/Synth-2.5-Pro-Preview-GGUF)
- [Modelo original (safetensors) en Hugging Face](https://huggingface.co/LucidityAI/Synth-2.5-Pro-Preview)
- [Colección Synth 2.5 Preview](https://huggingface.co/collections/LucidityAI/synth-25-preview)
- [Dataset PIPKIN-Creative-174k](https://huggingface.co/datasets/LucidityAI/PIPKIN-Creative-174k)
- [GitHub de Lucidity AI](https://github.com/lucidityai)
- [Plataforma Composite para pruebas](https://composite.lucidity.sh/)
