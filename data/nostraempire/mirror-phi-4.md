# NostraEmpire/mirror-phi-4

## Resumen

El modelo `NostraEmpire/mirror-phi-4` es un espejo del modelo `phi-4` desarrollado por Microsoft Research, publicado originalmente en diciembre de 2024. Se trata de un modelo de lenguaje denso de 14.700 millones de parámetros (14.659.507.200 según los pesos safetensors), diseñado específicamente para tareas de razonamiento avanzado, matemáticas, código y conversación, con un enfoque en entornos con restricciones de memoria y latencia. Su arquitectura es un Transformer decoder-only con una ventana de contexto de 16.000 tokens.

La relevancia de este modelo radica en que, con un tamaño relativamente compacto, consigue un rendimiento competitivo en razonamiento y matemáticas frente a modelos mucho más grandes, gracias a una combinación innovadora de datos sintéticos de alta calidad, filtrado riguroso de datos públicos y un proceso de alineación que combina supervisión fina (SFT) y optimización directa de preferencias (DPO). Está liberado bajo licencia MIT, lo que permite uso comercial sin restricciones significativas, y su formato de pesos safetensors lo hace directamente utilizable con el ecosistema de Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 14.659.507.200 (14,7 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo solo contiene safetensors en precision completa) |
| Idiomas soportados | Ingles (con aproximadamente 8% de datos multilingues en entrenamiento) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia Phi: un Transformer decoder-only denso con 14.000 millones de parámetros, sin mezcla de expertos. El entrenamiento se realizó con 9,8 billones de tokens, combinando datos públicos filtrados por calidad, datos sintéticos tipo "textbook" creados específicamente para enseñar matemáticas, código, razonamiento de sentido común y conocimiento general, además de libros académicos adquiridos y datasets de preguntas y respuestas. El proceso de entrenamiento se llevó a cabo en 1.920 GPUs H100-80G durante 21 días, entre octubre y noviembre de 2024.

La innovación principal reside en la generación de datos sintéticos para tareas de razonamiento, optimizando el curriculum de entrenamiento y la mezcla de datos. Posteriormente se aplicó un proceso de alineación que combina supervisión fina (SFT) con optimización directa de preferencias (DPO) iterativa, con especial atención a la seguridad y a la adherencia a instrucciones. El modelo tiene un cutoff de datos públicos de junio de 2024.

## Capacidades

- Generación de texto en formato conversacional, optimizado para prompts en formato chat.
- Razonamiento lógico y matemático avanzado, con especial fortaleza en problemas de competición (MATH, GPQA).
- Generación de código funcional, evaluado con HumanEval.
- Comprensión de lectura y razonamiento sobre texto (DROP).
- Razonamiento matemático multilingüe (MGSM), aunque el modelo está principalmente enfocado al inglés.
- Respuestas factuales (SimpleQA) y adherencia a instrucciones.
- No se menciona soporte explícito de tool calling, function calling ni capacidades multimodales en la información disponible.

## Casos de uso

- Asistentes de razonamiento y análisis en entornos con recursos limitados: el modelo puede desplegarse en GPUs de consumo medio (por ejemplo, RTX 3090 o 4090 con cuantización) y ofrecer capacidades de razonamiento avanzado sin necesidad de infraestructura de gran escala.
- Generación de código en producción: su capacidad para generar código funcional (HumanEval) lo hace adecuado para asistentes de programación, autocompletado y revisión de código en pipelines de CI/CD, siempre que se integre con herramientas de validación externa.
- Tutoría y educación en matemáticas y ciencias: su entrenamiento con datos sintéticos tipo "textbook" y su rendimiento en problemas de competición lo convierten en una base sólida para sistemas de tutoría interactiva.
- Chatbots conversacionales en inglés: su alineación con SFT y DPO garantiza respuestas útiles y seguras, adecuadas para atención al cliente o asistentes virtuales en dominios generales.
- Investigación académica en modelos de lenguaje pequeños: al ser un modelo abierto con licencia MIT, sirve como punto de partida para experimentos de fine-tuning, evaluación de técnicas de alineación o estudio de razonamiento en modelos compactos.
- Aplicaciones con restricciones de latencia: al tener solo 14,7 B de parámetros, puede ofrecer respuestas rápidas en comparación con modelos de cientos de miles de millones, siendo útil en servicios en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo fue evaluado con MMLU, MATH, GPQA, DROP, MGSM, HumanEval y SimpleQA, pero no proporciona valores numéricos. La búsqueda web referencia una página de Magica con costos y benchmarks, pero no se dispone de los datos concretos en el material proporcionado. Por tanto, no se incluyen cifras para evitar inventar resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en precisión fp32 ocupa aproximadamente 29,3 GB (tamaño del repo). En fp16 o bf16, el peso ocuparía unos 29,3 GB, por lo que se necesitan al menos 32 GB de VRAM para inferencia sin cuantización. Con cuantización a 8 bits, se podría reducir a unos 15 GB, y a 4 bits a unos 8 GB, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: para inferencia sin cuantizar, una A100 40GB o 80GB, o una RTX A6000 48GB. Con cuantización 8 bits, una RTX 4090 (24 GB) sería suficiente. Con cuantización 4 bits, cabría en GPUs de 12-16 GB como RTX 3080 o RTX 4070 Ti.
- Sí cabe en GPUs de consumo: con cuantización adecuada, es viable en RTX 3090, 4090 y similares.
- Opciones de despliegue: al ser un modelo Transformers estándar, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama (mediante conversión), Text Generation Inference (TGI) y Hugging Face Transformers.
- Latencia y throughput: no se dispone de datos medidos en la información proporcionada. Se estima que en una A100 80GB con batching, el throughput puede ser del orden de miles de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Phi-4 (este modelo) | 14,7 B | 16K | MIT | Razonamiento, matemáticas, código |
| Phi-3-mini | 3,8 B | 4K (ampliable a 128K) | MIT | Modelo pequeño generalista |
| Llama 3.1 8B | 8 B | 128K | Llama 3.1 Community License | Generalista, multilingüe |
| Qwen 2.5 14B | 14,7 B | 32K | Apache 2.0 | Generalista, multilingüe, código |

Phi-4 se distingue por su énfasis en razonamiento y matemáticas, superando en esas tareas a modelos de tamaño similar como Llama 3.1 8B o Qwen 2.5 14B, aunque con una ventana de contexto menor (16K frente a 128K o 32K). Su licencia MIT es más permisiva que la de Llama 3.1, que tiene restricciones para usuarios con más de 700 millones de usuarios mensuales.

## Limitaciones y advertencias

- El modelo está principalmente enfocado al inglés; aunque el entrenamiento incluye un 8% de datos multilingües, su rendimiento en otros idiomas puede ser inferior.
- No se ha evaluado para todos los casos de uso downstream; los desarrolladores deben validar la precisión, seguridad y equidad antes de usarlo en escenarios de alto riesgo.
- Puede presentar alucinaciones, especialmente en tareas factuales, como cualquier modelo de lenguaje.
- La ventana de contexto de 16K tokens es limitada en comparación con otros modelos modernos, lo que puede restringir su uso en tareas que requieran documentos muy largos.
- No se dispone de información sobre cuantizaciones oficiales; el repo solo contiene pesos en safetensors de precisión completa, por lo que habrá que convertir el modelo para usar cuantizaciones.
- Aunque la licencia MIT permite uso comercial, el modelo no está diseñado para aplicaciones de alto riesgo sin una evaluación adicional de seguridad.

## Enlaces

- Repositorio HuggingFace del espejo: https://huggingface.co/NostraEmpire/mirror-phi-4
- Repositorio original de Microsoft: https://huggingface.co/microsoft/phi-4
- Versión optimizada de Unsloth: https://huggingface.co/unsloth/phi-4
- Informe técnico de Phi-4 (arXiv): https://arxiv.org/html/2412.08905v1
- Página de Magica con especificaciones y costos: https://magica.com/blog/model/phi-4
