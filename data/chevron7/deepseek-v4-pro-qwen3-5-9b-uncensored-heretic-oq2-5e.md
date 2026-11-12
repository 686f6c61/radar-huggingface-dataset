# chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ2.5e

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ2.5e es una versión "decensored" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es chevron7, que aplica la herramienta Heretic v2.0.0.dev0 para eliminar los mecanismos de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA).

El modelo base concentra su señal de entrenamiento supervisado en matemáticas y resolución de problemas STEM, con aproximadamente 250.000 muestras, manteniendo la eficiencia y desplegabilidad práctica de la clase de 9B parámetros. Esta variante heretic conserva esa base pero reduce las negativas del modelo a 3 de cada 100 peticiones (frente a 100 de cada 100 en el original), con una divergencia KL de 0.0422 respecto al modelo base.

Es relevante para desarrolladores e investigadores que necesitan un modelo compacto de razonamiento sin restricciones de contenido para entornos controlados, investigación sobre alineación, o generación de contenido creativo sin filtros. La licencia Apache 2.0 facilita su uso comercial, aunque las implicaciones éticas del "uncensoring" requieren evaluación cuidadosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 2-bit (según tag del repo); safetensors nativo; GGUF no confirmado |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, un transformer denso de 9.400 millones de parámetros con capacidad multimodal image-text-to-text (según el tag `qwen3_5` y `image-text-to-text`). El entrenamiento del modelo base combinó destilación de DeepSeek-V4-Pro en modo Max Effect con SFT sobre aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico, seguido de etapas de RL (GSPO según los tags). El resultado es un modelo de razonamiento estructurado que aprende descomposición de problemas y patrones de solución multi-paso de un profesor más fuerte.

Esta variante heretic aplica Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 24, con pesos de preservación de comportamiento bueno de 0.8264, peso de dirección de comportamiento malo de 0.0003, peso de corrección excesiva relativa de 0.9645 y 12 vecinos. La técnica modifica las direcciones de activación en el espacio latente para eliminar la tendencia a rechazar peticiones, manteniendo una divergencia KL baja (0.0422) respecto al modelo original, lo que indica que la distribución general de salidas se preserva en gran medida.

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición estructurada de problemas.
- Razonamiento matemático y resolución de problemas STEM (foco principal del entrenamiento).
- Generación de código y transferencia cross-domain a programación (ganancias pequeñas reportadas sin SFT específico de código).
- Tool calling y function calling (tags `tool-use`, `function-calling`).
- Capacidades multimodales image-text-to-text (herencia de la arquitectura Qwen3.5).
- Multilingüe: inglés, chino, coreano, japonés, español y ruso.
- Modo "uncensored": reducción drástica de rechazos (3/100 frente a 100/100 del original).
- Compatible con endpoints (tag `endpoints_compatible`) y text-generation-inference.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparando respuestas con el original para analizar qué información se filtraba y cómo.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles sin negativas automáticas, en entornos editoriales controlados.
- Resolución de problemas matemáticos y STEM en producción: el foco de entrenamiento en ~250K muestras de matemáticas lo hace adecuado para tutoría automatizada, verificación de cálculos y asistencia en investigación científica.
- Asistente de razonamiento para pipelines de agentes: soporta tool calling y function calling, integrándose en flujos multi-paso donde el modelo debe decidir qué herramienta invocar y razonar sobre los resultados.
- Procesamiento multimodal de documentos técnicos: al ser image-text-to-text, puede extraer y razonar sobre información de imágenes, diagramas o fórmulas en PDFs y capturas.
- Despliegue en hardware de consumo: con 9.4B parámetros y cuantización 2-bit, es viable en GPUs consumer para prototipado, demos locales o entornos con recursos limitados.
- Evaluación comparativa de técnicas de decensoring: sirve como caso de estudio de Heretic y ARA, midiendo el trade-off entre reducción de rechazos y divergencia KL.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (refusals) | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~19 GB (9.4B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 8-bit: ~10 GB; en 4-bit: ~5-6 GB; en 2-bit (tag del repo): ~3-4 GB.
- GPU recomendadas para FP16: A100 40GB, H100, L40S, RTX 6000 Ada; para 4-bit: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090.
- Cabe en GPU consumer: sí, en cuantizaciones 4-bit y 2-bit en GPUs de 8-16 GB; en FP16 requiere GPUs de 24 GB o más.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama (si se generan GGUF, no confirmado en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (heretic) | 9.4B | No disponible | Apache 2.0 | Razonamiento STEM sin censura | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9.4B | No disponible | Apache 2.0 | Razonamiento STEM con alineación | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | No disponible | No disponible | Versión 4B sin censura | Hugging Face |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9.4B | No disponible | No disponible | Fine-tune científico | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El "uncensoring" elimina los mecanismos de rechazo, lo que implica que el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtros; requiere supervisión humana y políticas de uso estrictas en producción.
- La divergencia KL de 0.0422 indica que, aunque baja, la distribución de salidas se ha modificado respecto al original; puede haber degradación sutil en tareas donde el modelo base era más fiable.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en razonamiento matemático complejo y dominios fuera del entrenamiento.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en tareas de contexto largo.
- El foco en matemáticas y STEM puede implicar menor calidad en tareas de humanidades, conversación general o creatividad no técnica.
- Uso comercial permitido por Apache 2.0, pero la responsabilidad legal y ética del contenido generado recae en el desplegador.
- No se han publicado benchmarks estándar, por lo que no es posible validar objetivamente su rendimiento frente a alternativas.
- El modelo es una versión de fecha futura (2026) en la información proporcionada; verificar disponibilidad real y estado del repositorio.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ2.5e
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B uncensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de decensoring): https://heretic-project.org
