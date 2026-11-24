# mistralai/Ministral-3-14B-Reasoning-2512

## Resumen

Ministral 3 14B Reasoning 2512 es la variante de razonamiento del modelo más grande de la familia Ministral 3, desarrollada por Mistral AI. Se trata de un modelo multimodal (texto e imagen) de aproximadamente 13,9 mil millones de parámetros, compuesto por un modelo de lenguaje de 13,5B y un codificador visual de 0,4B, diseñado específicamente para tareas de matemáticas, código y disciplinas STEM mediante post-entrenamiento orientado a razonamiento.

El modelo se posiciona como una alternativa de alto rendimiento en el segmento de 14B, con capacidades declaradas comparables a Mistral Small 3.2 24B, y está optimizado para despliegue en el borde: cabe en 32 GB de VRAM en BF16 y en menos de 24 GB cuando se cuantiza. Incorpora una ventana de contexto de 256k tokens, soporte nativo de function calling y salida JSON, lo que lo hace adecuado para flujos agénticos locales.

Su relevancia actual radica en la combinación de licencia Apache 2.0, capacidades multimodales y de razonamiento, y requisitos de hardware moderados, lo que facilita despliegues privados y ajuste fino sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (13,5B LM + 0,4B vision encoder) |
| Parametros totales | 13.945.031.680 (~13,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | BF16 nativo; cuantizaciones adicionales no detalladas (repo incluye safetensors) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo combina un transformer de lenguaje de 13,5B parámetros con un codificador visual de 0,4B, lo que habilita entrada de imágenes además de texto. Es la versión post-entrenada para razonamiento de la base Ministral 3 14B Base 2512, y el post-entrenamiento está orientado a tareas de matemáticas, código y STEM. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas concretas de RLHF o DPO.

Entre las características técnicas destacadas figuran una ventana de contexto de 256k tokens, un fuerte ajuste a system prompts, capacidades agénticas nativas con function calling y salida JSON, y un diseño orientado al despliegue en el borde. La model card recomienda mantener las trazas de razonamiento en el contexto en conversaciones multi-turno y usar temperatura 1 como valor por defecto.

## Capacidades

- Generación de texto y razonamiento multi-paso dinámico.
- Razonamiento matemático y resolución de problemas STEM.
- Generación y análisis de código.
- Visión: análisis de imágenes y extracción de información visual combinada con texto.
- Function calling nativo y salida en formato JSON.
- Capacidades agénticas para flujos multi-paso y uso de herramientas.
- Multilingüe en once idiomas declarados (en, fr, es, de, it, pt, nl, zh, ja, ko, ar).
- Fuerte adherencia a system prompts.
- Modo de razonamiento con trazas que pueden mantenerse en contexto.

## Casos de uso

- Asistente local privado: despliegue en una estación de trabajo con 32 GB de VRAM en BF16 para conversaciones multi-turno con contexto largo de hasta 256k tokens, sin enviar datos a la nube.
- Agente autónomo local: uso de function calling y salida JSON para orquestar herramientas en entornos con recursos limitados, manteniendo las trazas de razonamiento en contexto entre pasos.
- Resolución de problemas matemáticos y STEM: la variante Reasoning está post-entrenada específicamente para este tipo de tareas, con resultados destacados en AIME y GPQA según la model card.
- Generación y revisión de código: análisis de fragmentos de código y razonamiento sobre errores, integrable en pipelines locales de desarrollo.
- Análisis de documentos con imágenes: combinación del codificador visual con el LM para extraer información de capturas, diagramas o formularios, recomendándose relaciones de aspecto cercanas a 1:1.
- Ajuste fino y especialización: la licencia Apache 2.0 y el tamaño moderado permiten fine-tuning sobre dominio propio en hardware de gama alta de consumo o profesional.
- Procesamiento multilingüe: atención y generación en once idiomas para aplicaciones de soporte o documentación en mercados europeos y asiáticos.

## Benchmarks y rendimiento

Datos publicados en la model card (modelo comparado: Qwen3-14B en modo Thinking):

| Benchmark | Ministral 3 14B | Qwen3-14B (Thinking) |
|---|---|---|
| AIME25 | 0.850 | 0.737 |
| AIME24 | 0.898 | 0.837 |
| GPQA Diamond | 0.712 | 0.663 |
| LiveCodeBench | 0.646 | 0.593 |

No se han publicado en la información disponible resultados adicionales (MMLU, HumanEval, GSM8K) ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM en BF16: aproximadamente 28 GB de pesos, cabe en 32 GB de VRAM según la model card.
- VRAM cuantizado: menos de 24 GB de RAM/VRAM en versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de producción con contexto largo; RTX 4090 (24 GB) viable en cuantización.
- GPU de consumo: sí, en cuantización; en BF16 requiere GPUs de 32 GB o superior.
- Despliegue: la librería declarada es vLLM; también puede servirse con otras herramientas compatibles con safetensors (TGI, llama.cpp/Ollama para GGUF si se generan conversiones).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (AIME25 / GPQA Diamond) |
|---|---|---|---|---|
| Ministral 3 14B Reasoning 2512 | ~13,9B (13,5B LM + 0,4B vision) | 256k | Apache 2.0 | 0.850 / 0.712 |
| Qwen3-14B (Thinking) | 14B | no disponible | no disponible | 0.737 / 0.663 |
| Mistral Small 3.2 24B | 24B | no disponible | no disponible | no disponible |

La model card señala que Ministral 3 14B ofrece rendimiento comparable a Mistral Small 3.2 24B, pero no se incluyen cifras de benchmarks para esa comparación en la información disponible.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan tasas específicas.
- Sesgos no documentados en la model card; conviene evaluar en el dominio de despliegue.
- El rendimiento en visión puede degradarse con imágenes de relaciones de aspecto muy extremas; se recomienda recortar a proporciones cercanas a 1:1.
- El exceso de herramientas definidas en flujos agénticos puede degradar el comportamiento; se recomienda limitar su número.
- El contexto de 256k no implica uso óptimo a máxima longitud; no se detallan resultados de evaluación en contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el acceso al modelo en Hugging Face está sujeto a un gate con aceptación de términos y política de privacidad de Mistral AI.
- No se detallan restricciones adicionales de uso ni políticas de uso aceptable en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Base-2512
- System prompt recomendado: https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512/blob/main/SYSTEM_PROMPT.txt
- Checkpoints adicionales: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
- Blog de Mistral 3: https://mistral.ai/news/mistral-3
- Paper: https://arxiv.org/abs/2601.08584
- Cliente Python oficial: https://pypi.org/project/mistralai/
