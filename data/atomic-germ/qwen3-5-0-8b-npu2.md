# Atomic-Germ/Qwen3.5-0.8B-NPU2

## Resumen

El modelo Atomic-Germ/Qwen3.5-0.8B-NPU2 es una adaptación del modelo Qwen3.5-0.8B-Base, desarrollado originalmente por Alibaba Cloud, publicada en Hugging Face por el usuario Atomic-Germ. Se trata de un modelo causal de lenguaje multimodal (texto e imagen) de 0,8 mil millones de parámetros, diseñado para tareas de razonamiento, generación de código, agentes y comprensión visual. Su arquitectura híbrida combina Gated Delta Networks con atención Gated Attention en un patrón de 6 bloques, lo que permite una inferencia de alta eficiencia con una longitud de contexto nativa de 262.144 tokens.

La relevancia de este modelo radica en su tamaño ultracompacto, pensado para despliegues en entornos con recursos limitados como dispositivos periféricos, prototipado y fine-tuning específico. A pesar de su escala, hereda las capacidades multimodales y multilingües de la serie Qwen3.5, con soporte para 201 idiomas y un pipeline de imagen-a-texto. Esta versión concreta (NPU2) está configurada para ser compatible con Transformers, vLLM, SGLang y KTransformers, y se distribuye bajo licencia Apache 2.0.

El interés actual de este modelo radica en su equilibrio entre tamaño, rendimiento y versatilidad. Es una opción atractiva para desarrolladores que necesitan un modelo pequeño pero capaz de manejar tareas complejas de razonamiento y visión en entornos de bajo consumo, como sistemas embebidos, Jetson, o integraciones en aplicaciones de edge computing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + Gated Attention (6 × (3 × DeltaNet → FFN) → 1 × Attention → FFN) |
| Parametros totales | 0,8 mil millones (0,8B) |
| Parametros activos | No disponible (no es un modelo MoE estándar) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Disponible en GGUF (consulte la versión Atomic-Germ/Qwen3.5-0.8B-GGUF); cuantizaciones específicas no listadas |
| Idiomas soportados | 201 idiomas y dialectos (según documentación de Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida que combina Gated Delta Networks (una variante de atención lineal con estado) y Gated Attention (atención completa con cabezas Q y KV separadas). La configuración se repite en 6 bloques, cada uno compuesto por 3 sub-bloques de DeltaNet seguidos de una FFN, y luego un bloque de atención completa. Esta mezcla busca optimizar el rendimiento computacional y la eficiencia de memoria, especialmente en contextos largos.

El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento, con técnicas de aprendizaje por refuerzo escalado en entornos multi-agente. Se destaca que el modelo integra fusión temprana de tokens multimodales, logrando paridad con modelos más grandes de la serie Qwen3-VL en razonamiento, codificación y agentes. El LM Output está atado al embedding de tokens, y se entrenó con MTP (multi-step prediction). La información sobre el número total de tokens de entrenamiento o el dataset específico no se detalla en la documentación disponible.

## Capacidades

- Generación de texto y razonamiento: apto para tareas de comprensión lectora, análisis y generación de respuestas coherentes en múltiples dominios.
- Comprensión visual: al ser un modelo image-text-to-text, puede procesar imágenes y responder preguntas sobre su contenido (descripción, análisis, etc.).
- Generación de código: soporta tareas de programación y asistencia en desarrollo, según los benchmarks de razonamiento y codificación.
- Capacidades multilingües: soporte para 201 idiomas y dialectos, lo que permite su uso en aplicaciones globales.
- Modo thinking: según fuentes externas, el modelo puede operar en modo de razonamiento extendido (thinking mode), mejorando el rendimiento en problemas complejos (MMLU-Pro 66.5 en thinking mode).
- Tool calling y funciones: aunque no se especifica explícitamente, la arquitectura y la compatibilidad con vLLM y SGLang sugieren soporte para integraciones de funciones y agentes.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: gracias a su pequeño tamaño y compatibilidad con frameworks como Transformers, es ideal para iterar sobre aplicaciones de chat en entornos de desarrollo.
- Análisis de imágenes en dispositivos periféricos: al ser multimodal y ligero, puede desplegarse en Jetson o dispositivos edge para clasificación o descripción de imágenes en tiempo real.
- Generación de código en entornos de bajo consumo: su capacidad de programación permite integrarlo en IDEs o pipelines de CI/CD en máquinas sin GPU potente.
- Asistencia multilingüe para atención al cliente: con 201 idiomas, puede gestionar conversaciones en diversos idiomas en contextos de servicio al cliente, aunque con limitaciones de profundidad.
- Prototipado de agentes de razonamiento: su modo thinking y capacidad de seguimiento de instrucciones lo hacen útil para experimentar con agentes que requieren razonamiento multi-step.
- Educación y demostraciones: por su pequeño tamaño, es adecuado para enseñar conceptos de IA multimodal y para demos en hardware de bajo coste.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del modelo base Qwen3.5-0.8B (fuente: Hugging Face). No se han publicado resultados específicos para la versión NPU2, pero al ser el mismo modelo base, se asume equivalencia.

| Benchmark | Qwen3.5-0.8B (non-thinking) | Qwen3.5-0.8B (thinking) |
|---|---|---|
| MMLU-Pro | 29.7 | 66.5 |
| MMLU-Redux | 48.5 | no disponible |
| C-Eval | 46.4 | no disponible |
| GPQA Diamond | no disponible | 51.6 |
| GPQA | no disponible | 11.9 |

Nota: los valores en modo thinking provienen de apxml.com, no de la model card oficial. Se recomienda verificar con la documentación original de Qwen3.5.

## Requisitos de hardware

- VRAM estimada: el tamaño del repo es de 3.1 GB, lo que sugiere pesos en fp16 o bf16. La inferencia en fp16 requiere aproximadamente 1.6 GB de VRAM para los pesos, más overhead de activaciones y caché KV. Con cuantización de 4 bits, puede funcionar en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. NVIDIA GTX 1650, Jetson Orin Nano). Para contexto largo (262K tokens), se recomienda más VRAM para el caché de atención.
- Compatible con GPUs consumer: sí, modelos como RTX 3060, RTX 4060, o incluso Apple Silicon con MPS.
- Opciones de despliegue: vLLM, SGLang, KTransformers, llama.cpp (vía GGUF), Ollama (si se convierte), Transformers nativo.
- Latencia: al ser un modelo de 0.8B, la generación es rápida en GPUs modernas, con throughput estimado de decenas de tokens por segundo en hardware consumer (depende de cuantización y optimización).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro (non-thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (este) | 0.8B | 262K | 29.7 | Apache 2.0 | Hugging Face |
| Qwen3-1.7B | 1.7B | 131K (aprox) | 40.2 | Apache 2.0 | Hugging Face |
| Qwen3.5-2B | 2B | 262K | 55.3 | Apache 2.0 | Hugging Face |

Fuente: model card de Qwen3.5-0.8B.

## Limitaciones y advertencias

- Al ser un modelo de 0.8B, su rendimiento en tareas complejas es inferior a modelos de mayor tamaño; puede alucinar o generar respuestas incoherentes en contextos técnicos avanzados.
- La información sobre sesgos específicos no está publicada, pero como modelo entrenado en datos web, puede heredar sesgos sociales y culturales.
- El soporte de 201 idiomas es declarado por la serie Qwen3.5, pero la calidad varía según el idioma; los idiomas de baja representación pueden tener rendimiento inferior.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original (Qwen) para posibles restricciones adicionales.
- El modo thinking puede aumentar la latencia y el consumo de recursos, lo que debe tenerse en cuenta en despliegues en tiempo real.
- No se han publicado resultados de seguridad o alineación para esta versión específica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atomic-Germ/Qwen3.5-0.8B-NPU2
- Versión GGUF: https://huggingface.co/Atomic-Germ/Qwen3.5-0.8B-GGUF
- Página oficial de Qwen3.5 (blog): https://qwen.ai/blog?id=qwen3.5
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Referencia de especificaciones y VRAM: https://apxml.com/models/qwen35-08b
- Página de Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-0-8b/
- Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Repositorio GitHub de Qwen3.5 (no oficial): https://github.com/ABDtmx/Qwen3.5
