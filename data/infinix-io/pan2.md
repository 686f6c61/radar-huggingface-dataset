# Infinix-io/PAN2

## Resumen

PAN 2 es un modelo de mundo de propósito general desarrollado por el Institute of Foundation Models (IFM) de la Universidad MBZUAI. Su función es simular cómo evolucionará una escena a partir de una observación inicial (imagen opcional más texto) y una descripción textual de acciones, generando como salida un vídeo de hasta 20 segundos. El modelo sigue la arquitectura Generative Latent Prediction (GLP) formalizada en el paper "Critique of World Models" (arXiv:2507.05169) y combina un razonamiento conceptual delegado en un modelo de lenguaje con un razonamiento perceptivo implementado por un diffusion transformer (MMDiT) de 29.200 millones de parámetros entrenado desde cero.

El interés práctico reside en el razonamiento simulativo: un agente puede imaginar las consecuencias de cada acción candidata antes de elegir, simulando cada plan con PAN 2 y actuando según el resultado simulado que considere mejor. El modelo se distribuye como un único checkpoint que cubre las tareas de texto-a-vídeo e imagen-a-vídeo, con pesos en safetensors y licencia Apache 2.0, lo que facilita su integración en pipelines de investigación y producción.

La relevancia actual viene de su enfoque híbrido: un LLM congelado (Qwen3.5-9B) actúa como backbone de razonamiento conceptual y un MMDiT de 29B como backbone perceptivo, con un VAE de Wan 2.2 para decodificar los latentes predichos. El resultado es un vídeo de 704x1248 píxeles a 24 fps, verificable contra metraje real, lo que permite auditar las predicciones del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generative Latent Prediction (GLP): LLM de razonamiento conceptual congelado + MMDiT (diffusion transformer) de 29B para razonamiento perceptivo + VAE de Wan 2.2 |
| Parametros totales | 29.201.996.992 (backbone de difusión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoint publicado en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (layout diffusers, `PAN2Transformer3DModel`); también DCP y `model_state.pt` para `generate.py` |

## Arquitectura y entrenamiento

PAN 2 implementa la arquitectura GLP descrita en "Critique of World Models". El componente de razonamiento conceptual es un LLM congelado (Qwen3.5-9B) que recibe la observación y las acciones solicitadas y escribe el siguiente estado del mundo como una descripción estructurada y anclada en el tiempo: eventos, acciones temporizadas vinculadas a actores y movimiento de cámara. Un codificador de texto congelado transforma esa descripción en las características de condicionamiento que consume el modelo de difusión. El componente perceptivo es un MMDiT de 29.200 millones de parámetros, entrenado desde cero sobre cientos de millones de vídeos anotados en el mismo formato estructurado, que predice los detalles que la descripción deja abiertos: los latentes de vídeo que materializan el estado, condicionados por la descripción y por el latente VAE de la imagen inicial. Finalmente, el decodificador VAE de Wan 2.2 renderiza los latentes predichos como la siguiente observación.

El modelo se publica como un único checkpoint que sirve tanto para texto-a-vídeo como para imagen-a-vídeo, en precisión BF16. El codificador de texto (Qwen3.5-9B) y el VAE (Wan 2.2) se descargan de sus propios repositorios y permanecen congelados. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video, `t2v`).
- Generación de vídeo a partir de una imagen inicial (image-to-video, `i2v`), con la imagen como primer fotograma opcional.
- Simulación de estados futuros del mundo condicionada por acciones descritas en texto, con descripciones estructuradas y ancladas en el tiempo (eventos, acciones temporizadas por actor, movimiento de cámara).
- Razonamiento simulativo: un agente puede simular varios planes candidatos y seleccionar el que produzca el mejor resultado simulado.
- Salida de vídeo de hasta 20 segundos a 704x1248 píxeles y 24 fps.
- Soporte de prompts negativos estructurados (según los ejemplos de `inference/prompts/examples.json`).
- Capacidad multilingüe limitada al inglés.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Simulación de planes en robótica y agentes autónomos: el agente describe cada acción candidata, PAN 2 genera el vídeo del resultado esperado y el planificador elige la acción cuyo resultado simulado sea mejor; el vídeo permite auditar la predicción contra metraje real.
- Previsualización de escenas para cine y animación: a partir de un storyboard o de una imagen de referencia y una descripción de la acción, se generan clips de hasta 20 segundos a 704x1248 y 24 fps para validar la puesta en escena antes del render final.
- Prototipado de videojuegos y entornos sintéticos: generación de secuencias de vídeo condicionadas por acciones descritas, útiles para crear material de referencia o datasets de entrenamiento de otros modelos.
- Investigación en modelos de mundo: el checkpoint permite reproducir y extender los experimentos de la arquitectura GLP, comparando las predicciones del modelo con vídeo real para medir la calidad de la simulación.
- Generación de contenido para marketing y redes: clips cortos a partir de una imagen de producto y una descripción de la acción o el movimiento de cámara deseado, con control explícito sobre la evolución de la escena.
- Educación y divulgación científica: simulación de procesos físicos o situaciones descritas textualmente para ilustrar conceptos, con la ventaja de que la descripción estructurada permite controlar qué eventos y acciones aparecen en el vídeo.
- Evaluación de políticas de control: simulación de trayectorias de acción en entornos simulados para comparar políticas antes de desplegarlas en el mundo real, gracias a la capacidad de condicionar la generación por actor y por tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de difusión tiene 29.200 millones de parámetros en BF16, lo que supone aproximadamente 58 GB solo para los pesos; a ello hay que sumar el codificador de texto Qwen3.5-9B y el VAE de Wan 2.2, por lo que se requiere hardware de clase数据中心.
- GPU recomendadas: no se especifican en la información disponible; por el tamaño del modelo, se necesitan GPU con al menos 80 GB de memoria (A100 80GB, H100 80GB) o configuraciones multi-GPU.
- No cabe en GPU de consumo (RTX 4090, 24 GB) sin cuantización, y no se documentan tipos de cuantización para este checkpoint.
- Opciones de despliegue: `generate.py` del repositorio (un worker por GPU, cada worker mantiene el modelo completo de 29B y procesa cada N-ésimo prompt), Diffusers (`PAN2Transformer3DModel`) y vLLM (recetas en recipes.vllm.ai).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PAN 2 | 29.200 M (backbone de difusión) | No disponible | Text-to-video, image-to-video, simulación de mundo | Apache 2.0 | Hugging Face, Diffusers, vLLM |
| Wan 2.2 | No disponible (se usa su VAE y su checkpoint TI2V-5B como componente) | No disponible | Text-to-video, image-to-video | No disponible en la información | Hugging Face |
| Qwen3.5-9B | 9.000 M (aproximado, no confirmado) | No disponible | LLM de razonamiento conceptual (congelado en PAN 2) | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, tareas, licencia y disponibilidad.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés, lo que limita su uso en castellano u otros idiomas sin traducción previa de los prompts.
- Alucinación: al ser un modelo generativo de vídeo, puede producir resultados plausibles pero incorrectos respecto a la dinámica real del mundo; la model card sugiere verificar cada predicción contra metraje real.
- Sesgos: no se documentan sesgos conocidos en la información disponible, pero al entrenarse sobre cientos de millones de vídeos es probable que herede sesgos de representación del corpus.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo depende de componentes con licencias propias (Qwen3.5-9B y Wan 2.2) cuyos términos deben revisarse por separado.
- Contexto: no se especifica la longitud de contexto del LLM de razonamiento ni del condicionamiento, lo que dificulta planificar prompts de gran extensión.
- Producción: el tamaño del checkpoint (86,2 GB en el repositorio, pesos en BF16) y la ausencia de cuantizaciones documentadas complican el despliegue en infraestructura modesta; además, el modelo se publicó con 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de uso en producción.
- Reproducibilidad: el repositorio indica que se requiere convertir el checkpoint una vez para `generate.py`, y las dependencias incluyen versiones pre-release (torch 2.12.1, flash-attn-4 beta, quack-kernels), lo que puede afectar a la estabilidad del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/PAN2
- Repositorio GitHub: https://github.com/ifm-ai/PAN2
- Documentación en Diffusers: https://huggingface.co/docs/diffusers/main/en/api/pipelines/pan2
- Receta en vLLM: https://recipes.vllm.ai/IFM/PAN2
- Paper "Critique of World Models": https://arxiv.org/abs/2507.05169
- Licencia: https://github.com/ifm-ai/PAN2/blob/main/LICENSE
- Documentación de entorno: https://github.com/ifm-ai/PAN2/blob/main/docs/environment.md
- Codificador de texto Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- VAE de Wan 2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
