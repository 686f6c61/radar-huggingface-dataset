# ArchiveStudio/PAN2

## Resumen

PAN 2 es un modelo de mundo de propósito general desarrollado por el Institute of Foundation Models (IFM) de la Universidad MBZUAI. Su función es simular cómo cambiará el mundo en respuesta a acciones: dada una observación inicial (una imagen opcional más texto) y una descripción textual de acciones, genera un vídeo de hasta 20 segundos que representa el resultado simulado. Esto habilita el razonamiento simulativo, es decir, que un agente imagine las consecuencias de sus acciones candidatas antes de elegirlas.

El modelo sigue la arquitectura Generative Latent Prediction (GLP) formalizada en el artículo Critique of World Models (arXiv:2507.05169) y combina un modelo de lenguaje grande como columna vertebral de razonamiento conceptual con un modelo de difusión latente como columna vertebral de razonamiento perceptivo. La parte de difusión es un transformer de difusión multimodal (MMDiT) de 29.201.996.992 parámetros, entrenado desde cero sobre cientos de millones de vídeos anotados con descripciones estructuradas del estado del mundo. El checkpoint liberado sirve tanto para texto-a-vídeo como para imagen-a-vídeo.

La relevancia actual de PAN 2 radica en su enfoque de modelo de mundo: no se limita a generar vídeo plausible, sino que produce una predicción verificable del siguiente estado del mundo a partir de una acción descrita. Esto lo sitúa en la intersección entre generación de vídeo, planificación de agentes y simulación, y lo hace útil para investigación en agentes que razonan sobre consecuencias y para pipelines de simulación controlada. La licencia Apache 2.0 y su integración en Diffusers y vLLM facilitan su adopción tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generative Latent Prediction (GLP): LLM de razonamiento conceptual + MMDiT de difusión latente (perceptual) + VAE Wan 2.2 para decodificación |
| Parametros totales | 29.201.996.992 (backbone de difusión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint liberado en BF16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout diffusers, `PAN2Transformer3DModel`) |

## Arquitectura y entrenamiento

PAN 2 implementa la arquitectura Generative Latent Prediction (GLP) descrita en el artículo Critique of World Models. El sistema se descompone en dos columnas vertebrales acopladas. La primera es un modelo de lenguaje grande que actúa como razonamiento conceptual: procesa la observación y las acciones solicitadas y escribe el siguiente estado del mundo como una descripción estructurada y anclada en el tiempo, con eventos, acciones temporizadas ligadas a actores y movimiento de cámara. Esta descripción se mapea mediante un codificador de texto congelado (Qwen3.5-9B) a las características de condicionamiento que consume el modelo de difusión.

La segunda columna vertebral es un MMDiT de 29B parámetros entrenado desde cero sobre cientos de millones de vídeos anotados en el mismo formato estructurado. Este modelo predice el detalle perceptivo que la descripción deja abierto: los latentes de vídeo que realizan el estado, condicionados por dicha descripción y por el latente VAE de la imagen de partida. El decodificador VAE de Wan 2.2 renderiza los latentes predichos como la siguiente observación, de modo que cada predicción puede visualizarse y contrastarse con metraje real. El checkpoint se libera en BF16 y la arquitectura se define en `config/sft_29B_720p.yaml`; el modelo de lenguaje y el VAE se descargan de sus repositorios respectivos (Qwen/Qwen3.5-9B y Wan-AI/Wan2.2-TI2V-5B-Diffusers). No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Simulación de estados futuros del mundo a partir de una observación y acciones descritas en texto, generando vídeo de hasta 20 segundos.
- Texto-a-vídeo (`t2v`) e imagen-a-vídeo (`i2v`) con un único checkpoint.
- Razonamiento simulativo: un agente puede simular cada plan candidato y seleccionar el de mejor resultado simulado antes de actuar.
- Razonamiento conceptual vía LLM: interpreta la observación y las acciones y produce descripciones estructuradas del siguiente estado, con acciones temporizadas y movimiento de cámara.
- Razonamiento perceptivo vía difusión latente: genera los detalles visuales no especificados por la descripción.
- Salida de vídeo a 704x1248 y 24 fps, hasta 20 segundos.
- Condicionamiento por imagen inicial opcional (primer fotograma) para tareas de imagen-a-vídeo.
- Soporte de prompts negativos estructurados en los ejemplos de inferencia.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Planificación de agentes con razonamiento simulativo: un agente genera varios planes en texto, simula cada uno con PAN 2 y elige el que produce el mejor resultado simulado; es adecuado porque el modelo está diseñado explícitamente para predecir consecuencias de acciones y verificar la predicción contra metraje real.
- Simulación de robótica y manipulación: dada una imagen del entorno y una acción descrita (por ejemplo, "el brazo mueve el objeto a la izquierda"), el modelo genera el vídeo del resultado esperado, útil para validar políticas antes de ejecutarlas en hardware.
- Generación de vídeo condicionada por imagen en producción creativa: con `i2v` y el VAE de Wan 2.2, se parte de un fotograma y se anima una escena de hasta 20 segundos a 704x1248 y 24 fps, adecuado para previsualización y prototipado audiovisual.
- Evaluación de escenarios contrafactuales: simular qué ocurriría bajo distintas acciones sobre una misma observación permite comparar resultados y documentar decisiones en entornos de investigación.
- Generación de datos sintéticos de vídeo para entrenamiento: el modelo puede producir secuencias anotadas con descripciones estructuradas del estado del mundo, útiles para aumentar datasets de percepción o de planificación.
- Investigación en modelos de mundo: al seguir la arquitectura GLP y liberar el checkpoint en Apache 2.0, sirve como base reproducible para estudiar razonamiento conceptual y perceptivo acoplados.
- Previsualización de movimiento de cámara y acciones temporizadas: la descripción estructurada incluye movimiento de cámara y acciones ligadas a actores, lo que permite generar tomas con control explícito de estos elementos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de difusión tiene 29.201.996.992 parámetros en BF16, lo que supone aproximadamente 58 GB solo para los pesos; a ello se suman el codificador de texto Qwen3.5-9B y el VAE de Wan 2.2. No se dispone de cifras oficiales de VRAM total.
- GPU recomendadas: por el tamaño del checkpoint en BF16, se requieren GPU de centro de datos con 80 GB o más (A100 80 GB, H100 80 GB) para mantener el modelo completo en memoria; no se especifican configuraciones multi-GPU oficiales más allá del patrón de un worker por GPU descrito en la model card.
- ¿Cabe en GPU de consumo? No de forma directa en BF16 con los componentes congelados; no se documentan cuantizaciones que permitan reducir el footprint a GPUs de consumo.
- Opciones de despliegue: Diffusers (pipeline `pan2`), vLLM (recetas en recipes.vllm.ai/IFM/PAN2), y el script propio `generate.py` del repositorio, con un worker por GPU que mantiene el modelo completo y procesa cada N-ésimo prompt.
- Latencia y throughput: no disponibles en la información proporcionada. La generación de hasta 20 segundos de vídeo a 704x1248 y 24 fps implica un coste computacional elevado por clip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PAN 2 | 29.201.996.992 (backbone de difusión) | Vídeo de hasta 20 s, 704x1248 a 24 fps | t2v, i2v, modelo de mundo | Apache 2.0 | Hugging Face, Diffusers, vLLM |
| Wan 2.2 (TI2V-5B) | no disponible en la información | no disponible | t2v, i2v | no disponible en la información | Hugging Face (usado como VAE) |
| Qwen3.5-9B | 9B (aproximado por nombre) | no disponible | LLM de razonamiento conceptual | no disponible en la información | Hugging Face (usado como text encoder) |

No se dispone de datos de rendimiento comparativo entre PAN 2 y alternativas de la misma categoría en la información proporcionada. Los modelos Wan 2.2 y Qwen3.5-9B se listan porque son componentes congelados del propio PAN 2, no como alternativas equivalentes.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación visual: al ser un modelo generativo de difusión, puede producir detalles perceptivos plausibles pero incorrectos respecto al estado real del mundo; la model card recomienda contrastar cada predicción con metraje real.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al entrenarse sobre cientos de millones de vídeos, es esperable heredar sesgos presentes en esos datos.
- Limitaciones de contexto: no se especifica la longitud de contexto del LLM de razonamiento ni del condicionamiento; la duración de salida está acotada a 20 segundos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los componentes congelados (Qwen3.5-9B y Wan 2.2) se distribuyen bajo sus propias licencias, que deben verificarse por separado.
- Requisitos de producción: el checkpoint en BF16 exige hardware de centro de datos; no hay cuantizaciones documentadas para reducir el footprint.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el checkpoint se publicó el 2026-11-16; no hay evidencia de despliegues en producción.
- Formato de pesos: el checkpoint se libera en layout diffusers y requiere una conversión (`convert_checkpoint.py to-native`) para usarse con el `generate.py` del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/ArchiveStudio/PAN2
- Repositorio GitHub: https://github.com/ifm-ai/PAN2
- Documentación: https://github.com/ifm-ai/PAN2/blob/main/README.md
- Licencia: https://github.com/ifm-ai/PAN2/blob/main/LICENSE
- Documentación de entorno: https://github.com/ifm-ai/PAN2/blob/main/docs/environment.md
- Documentación Diffusers del pipeline PAN 2: https://huggingface.co/docs/diffusers/main/en/api/pipelines/pan2
- Receta vLLM: https://recipes.vllm.ai/IFM/PAN2
- Artículo Critique of World Models: https://arxiv.org/abs/2507.05169
- Checkpoint oficial referenciado en la model card: https://huggingface.co/IFM/PAN2
- Codificador de texto: https://huggingface.co/Qwen/Qwen3.5-9B
- VAE: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
