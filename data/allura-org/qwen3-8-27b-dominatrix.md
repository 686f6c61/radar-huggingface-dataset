# allura-org/Qwen3.8-27B-Dominatrix

## Resumen

Qwen3.8-27B-Dominatrix es un ajuste fino (finetune) del modelo Qwen3.8-27B, desarrollado por el usuario de Hugging Face allura-org, especializado en roleplay y escritura creativa. El objetivo declarado es mejorar la prosa y el razonamiento creativo en contextos de juego de rol, manteniendo la base arquitectónica del modelo original. Se distribuye bajo licencia Apache 2.0 y está pensado para un público que busca un modelo de texto conversacional con un estilo literario más cuidado.

El modelo base, Qwen3.8-27B, es un transformer denso multimodal con encoder de visión integrado, lanzado por Qwen en agosto de 2026. Sin embargo, este finetune se centra exclusivamente en generación de texto y roleplay, y no se indica si se conservan las capacidades multimodales. El ajuste modifica el chat template por defecto (desactiva el modo thinking y reduce el esfuerzo de razonamiento a medio), lo que sugiere una orientación hacia respuestas más fluidas y menos reflexivas.

Con 27.356 millones de parámetros y un tamaño de repositorio de 54,7 GB (pesos en BF16/FP16), es un modelo de tamaño medio-grande que puede ejecutarse en hardware de consumo con cuantización. Su relevancia radica en ofrecer una alternativa especializada para aplicaciones de narrativa interactiva, personajes conversacionales y escritura asistida, donde la calidad del texto y la coherencia del personaje son prioritarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.8-27B, con encoder de visión en el modelo base; el finetune se orienta a texto) |
| Parametros totales | 27.356.728.560 (27,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (heredada del modelo base; no se indica modificación en el finetune) |
| Tipos de cuantizacion | No disponible (repo en safetensors BF16/FP16; se pueden generar cuantizaciones GGUF/AWQ externamente) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16/FP16, 54,7 GB) |

## Arquitectura y entrenamiento

El modelo es un finetune del Qwen3.8-27B, que emplea una arquitectura transformer densa con atención completa. El modelo base incorpora un encoder de visión para procesar imágenes y vídeo, aunque el finetune no menciona si esta capacidad se mantiene o se elimina durante el ajuste. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. Los tags indican que se utilizaron las herramientas Axolotl y Unsloth para el entrenamiento, lo que sugiere un pipeline de fine-tuning supervisado estándar.

La modificación más destacada es el ajuste del chat template: se desactiva `preserve_thinking` (el modelo no conserva el razonamiento interno) y se fija `reasoning_effort` en "medium" en lugar de "xhigh". Esto implica que el modelo genera respuestas más directas y menos verbosas en cuanto a razonamiento, priorizando la fluidez del texto sobre la introspección. No se han publicado detalles técnicos adicionales sobre el proceso de entrenamiento.

## Capacidades

- Generación de texto conversacional y narrativo de alta calidad, optimizada para roleplay y escritura creativa.
- Mejora de la prosa y del "razonamiento creativo" en comparación con el modelo base, según la descripción del autor.
- Soporte del formato ChatML estándar de Qwen3.8 (con la plantilla de chat ajustada).
- Compatible con parámetros de muestreo como temperatura (1.0–1.25) y min_p (0.1) o top_p (0.95), según recomendaciones del autor.
- No se confirma soporte de tool calling, function calling ni capacidades de agente en este finetune.
- No se indica soporte multilingüe más allá del inglés.
- Las capacidades multimodales del modelo base (visión) no están documentadas en este finetune; se recomienda verificar su funcionamiento antes de usarlas.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones multi-turno con personajes definidos, gracias a su contexto largo (262K) y su entrenamiento específico para narrativa. Es adecuado para plataformas de chat de rol o juegos de texto.
- Escritura creativa asistida: generar borradores de ficción, diálogos o descripciones con un estilo literario cuidado. El ajuste del chat template favorece respuestas fluidas sin exceso de razonamiento.
- Creación de personajes conversacionales: desarrollar asistentes o chatbots con personalidad definida para aplicaciones de entretenimiento o educación.
- Generación de historias interactivas: el modelo puede actuar como narrador o director de juego en aventuras de texto, adaptándose a las acciones del usuario.
- Prototipado de narrativa procedural: en desarrollo de videojuegos, generar contenido narrativo dinámico para misiones o diálogos no jugables.
- Análisis de estilo literario: dado su enfoque en prosa, puede usarse para experimentar con diferentes registros y tonos narrativos en proyectos de investigación sobre generación de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación y los resultados web corresponden al modelo base Qwen3.8-27B, no a este finetune. Se recomienda realizar evaluaciones propias si se requiere comparar con otros modelos de roleplay.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - BF16/FP16: ~55 GB (el repo pesa 54,7 GB).
  - Cuantización 8-bit: ~28 GB.
  - Cuantización 4-bit: ~14 GB.
- GPU recomendadas:
  - Para BF16: NVIDIA A100 80GB, H100, o múltiples GPUs.
  - Para cuantización 8-bit: RTX 4090 (24GB) o A6000 (48GB).
  - Para cuantización 4-bit: RTX 3090/4090 (24GB) o GPUs con 16GB+.
- En consumer GPU: sí, con cuantización 4-bit u 8-bit en GPUs de 24GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se generan GGUF), TGI, o Transformers con carga en 8/4-bit.
- Latencia y throughput: no disponible; dependerá del hardware y la cuantización. Para un modelo de 27B en BF16, se espera un throughput de ~20-40 tokens/s en una A100, y menor en consumer GPUs.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos de este finetune frente a otras alternativas. Como referencia, el modelo base Qwen3.8-27B es comparable en tamaño y arquitectura a otros modelos densos de 27-32B como Llama 3.1 32B o Mistral Large 2. Sin embargo, al ser un finetune especializado, su rendimiento en roleplay podría diferir. No se han publicado benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Contenido no apto para todos los públicos: el tag `not-for-all-audiences` indica que el modelo puede generar contenido explícito o inapropiado. Debe usarse con moderación y en contextos adecuados.
- Sesgos y alucinaciones: al ser un finetune de un modelo base, puede heredar sesgos del entrenamiento original y producir respuestas inventadas o incoherentes en ciertos contextos.
- Limitación de idioma: solo se declara soporte para inglés; el rendimiento en otros idiomas puede ser deficiente.
- Capacidades multimodales inciertas: aunque el modelo base es multimodal, no se confirma que el finetune conserve el procesamiento de imágenes. Se recomienda probar antes de asumir esa funcionalidad.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales según el contexto (especialmente si es explícito).
- Sin documentación técnica detallada: no se han publicado detalles sobre el dataset de entrenamiento, hiperparámetros o evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allura-org/Qwen3.8-27B-Dominatrix
- Perfil del autor: https://huggingface.co/allura-org
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (referencia)
- Guía del modelo base (fuente externa): https://lovableapp.org/blog/qwen3-8-27b
- Especificaciones del modelo base: https://aireleasetracker.com/model/qwen/qwen3.8-27b
