# Qwen/Qwen3.5-2B

## Resumen

Qwen3.5-2B es un modelo de lenguaje causal multimodal (imagen-texto) desarrollado por Alibaba Cloud, perteneciente a la serie Qwen3.5. Con 2.274 millones de parámetros, es la variante compacta de la familia, diseñada para tareas de prototipado, fine-tuning específico e investigación. Se basa en el modelo base Qwen/Qwen3.5-2B-Base y ha pasado por etapas de pre-entrenamiento y post-entrenamiento, incluyendo aprendizaje por refuerzo a escala masiva.

Su relevancia actual radica en que integra una arquitectura híbrida eficiente (Gated Delta Networks combinadas con atención gated) que permite alta velocidad de inferencia con bajo coste, junto con una ventana de contexto nativa de 262.144 tokens y soporte multimodal temprano. Esto lo convierte en una opción atractiva para despliegues en dispositivos de borde y aplicaciones que requieren procesamiento de imágenes y texto con recursos limitados. Además, amplía la cobertura lingüística a 201 idiomas y dialectos, lo que facilita su adopción global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (híbrida: Gated DeltaNet + Gated Attention) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | No disponible (se esperan versiones GGUF, AWQ, etc. en el ecosistema) |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

Qwen3.5-2B emplea una arquitectura híbrida que combina Gated Delta Networks (una variante de atención lineal con estado recurrente) con capas de atención gated tradicional. La configuración interna incluye 24 capas organizadas en un patrón de 6 bloques, cada uno compuesto por 3 sub-bloques de (Gated DeltaNet → FFN) seguidos de 1 sub-bloque de (Gated Attention → FFN). Esta mezcla busca equilibrar eficiencia computacional y capacidad de modelado de dependencias largas. El modelo incorpora un vision encoder para procesamiento de imágenes, con fusión temprana de tokens multimodales durante el entrenamiento.

El entrenamiento incluye una fase de pre-entrenamiento y otra de post-entrenamiento, con aprendizaje por refuerzo escalado a entornos de millones de agentes y distribuciones de tareas progresivamente complejas. Se menciona el uso de Multi-Token Prediction (MTP) entrenado con multi-steps, una técnica que predice varios tokens futuros simultáneamente para mejorar la eficiencia de entrenamiento e inferencia. La arquitectura está diseñada para lograr una eficiencia de entrenamiento multimodal cercana al 100% respecto al entrenamiento solo de texto, según la documentación oficial.

## Capacidades

- Generación de texto y razonamiento: responde a instrucciones en modo "non-thinking" (sin cadena de pensamiento explícita) y probablemente también en modo "thinking" (con razonamiento encadenado), aunque la model card solo muestra resultados del modo non-thinking.
- Comprensión visual: procesa imágenes y texto de forma conjunta, con capacidades de understanding visual comparable a modelos Qwen3-VL de mayor tamaño.
- Generación de código y agentes: soporta tareas de codificación y razonamiento multi-paso, con resultados competitivos en benchmarks de agentes.
- Multilingüismo: cobertura de 201 idiomas y dialectos, con comprensión de matices culturales y regionales.
- Tool calling y function calling: no se menciona explícitamente en la documentación, pero al ser un modelo de la serie Qwen3.5, es probable que herede estas capacidades; sin embargo, no hay confirmación oficial en la información disponible.
- Contexto largo: ventana de 262.144 tokens que permite procesar documentos extensos o conversaciones de muchas vueltas.

## Casos de uso

- Asistente de atención al cliente multimodal: el modelo puede gestionar conversaciones que incluyen imágenes (capturas de pantalla, fotos de productos) y texto, con contexto largo para mantener el historial completo. Su tamaño compacto permite desplegarlo en servidores de baja gama o incluso en dispositivos de borde.
- Análisis de documentos técnicos: gracias a su contexto de 262K tokens, puede resumir y extraer información de manuales extensos, informes o contratos, incluyendo diagramas o figuras escaneadas.
- Generación de código asistida en entornos de desarrollo: soporta instrucciones en lenguaje natural y puede generar fragmentos de código, aunque su rendimiento en tareas complejas es inferior a modelos de mayor tamaño. Es adecuado para autocompletado o refactorización básica.
- Prototipado rápido de aplicaciones de IA: al ser pequeño y con licencia Apache 2.0, es ideal para probar ideas y hacer fine-tuning con datasets específicos antes de escalar a modelos mayores.
- Procesamiento de documentos con imágenes en móviles: su tamaño permite ejecutarlo en GPUs de consumo o incluso en CPUs con cuantización, habilitando aplicaciones de OCR, descripción de imágenes o traducción visual en dispositivos móviles.
- Investigación en arquitecturas híbridas: al ser un ejemplo de Gated DeltaNet con atención gated, sirve como banco de pruebas para estudiar eficiencia de atención lineal y modelos recurrentes.
- Despliegue en entornos con recursos limitados: su bajo número de parámetros y su eficiencia arquitectónica lo hacen apto para inferencia en edge computing, donde la latencia y el consumo energético son críticos.

## Benchmarks y rendimiento

La model card proporciona resultados en modo instruct (non-thinking) comparando Qwen3.5-2B con otros modelos de la familia:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69.6 | 40.2 | 55.3 | 29.7 |
| MMLU-Redux | 84.2 | 64.4 | 69.2 | 48.5 |
| C-Eval | 80.2 | 61.0 | 65.2 | 46.4 |

Estos datos muestran que Qwen3.5-2B supera claramente a Qwen3-1.7B en las tres métricas, y se acerca a Qwen3-4B-2507 en MMLU-Redux y C-Eval, aunque queda por debajo en MMLU-Pro. No se proporcionan resultados de benchmarks de visión, codificación o agentes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.274 millones de parámetros, en FP16 (precisión completa) ocupa aproximadamente 4,5 GB. Con cuantización de 4 bits (típica en GGUF) se reduce a unos 1,5 GB, y en 8 bits a unos 2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutarlo en FP16 (por ejemplo, RTX 3060, RTX 2060 Super, GTX 1660 Ti). Con cuantización, cabe en GPUs de 4 GB o incluso en CPUs modernas con suficiente RAM.
- Si cabe en consumer GPU: sí, es perfectamente viable en GPUs de gama media y baja. También puede ejecutarse en Apple Silicon (M1/M2/M3) mediante llama.cpp.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers. Se espera soporte en llama.cpp y Ollama a través de conversión a GGUF (no confirmado oficialmente).
- Latencia y throughput: no hay datos oficiales. Como referencia, modelos de 2B en GPUs modernas (RTX 4090) suelen generar entre 50 y 100 tokens por segundo en FP16, y más con cuantización o usando Gated DeltaNet que reduce el coste de atención. Estas cifras son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | MMLU-Redux | C-Eval | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.5-2B | 2,27B | 262.144 | 55.3 | 69.2 | 65.2 | Apache 2.0 |
| Qwen3-1.7B | 1,7B | 32.768 (probable) | 40.2 | 64.4 | 61.0 | Apache 2.0 |
| Qwen3-4B-2507 | 4B | 32.768 (probable) | 69.6 | 84.2 | 80.2 | Apache 2.0 |

Qwen3.5-2B ofrece una ventaja significativa en longitud de contexto (262K frente a los 32K típicos de Qwen3) y un rendimiento superior a Qwen3-1.7B en las métricas mostradas, manteniendo un tamaño intermedio. Comparado con Qwen3-4B-2507, pierde en rendimiento bruto pero gana en eficiencia y contexto. No se dispone de datos de otros modelos comparables como Llama 3.2 3B o Gemma 2 2B en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo de 2B, su rendimiento en tareas complejas de razonamiento, matemáticas avanzadas o generación de código extenso es inferior al de modelos de mayor tamaño. No debe usarse como sustituto de modelos grandes en producción sin evaluación previa.
- No se han publicado resultados de benchmarks de visión, agentes o tool calling en la información disponible; las capacidades multimodales y de agente se mencionan en la documentación pero no se cuantifican.
- La cobertura de 201 idiomas puede tener calidad desigual entre lenguas; los idiomas con menos recursos pueden presentar más errores o alucinaciones.
- El contexto de 262K tokens es nativo, pero en la práctica la atención puede degradarse con secuencias muy largas si no se usa la implementación adecuada (por ejemplo, vLLM con gestión de memoria eficiente).
- Riesgo de alucinación: como todos los modelos generativos, puede inventar información, especialmente en dominios poco representados en su entrenamiento.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con datos web, puede reflejar sesgos sociales y culturales presentes en esos datos.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo se ofrece "tal cual" sin garantías de rendimiento o seguridad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Colección Qwen3.5 en Hugging Face](https://huggingface.co/collections/Qwen/qwen35)
- [Blog de Qwen3.5](https://qwen.ai/blog?id=qwen3.5)
- [Ficha en LM Studio](https://lmstudio.ai/models/qwen/qwen3.5-2b)
- [Ficha en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_5_2b)
- [Qwen Chat (demo)](https://chat.qwen.ai)
