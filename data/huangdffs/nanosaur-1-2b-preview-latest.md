# huangdffs/Nanosaur-1.2B-Preview-Latest

## Resumen

Nanosaur 1.2B es un modelo de difusión de imágenes entrenado desde cero, publicado en Hugging Face por el usuario huangdffs como checkpoint de preservación del proyecto original desarrollado por well9472/Metal63. El autor original abandonó el proyecto y eliminó repetidamente el repositorio, por lo que esta copia corresponde al último checkpoint guardado disponible. El modelo se presenta como un trabajo de investigación en curso, no como un producto terminado.

Según la model card, emplea una arquitectura personalizada que combina un text encoder basado en Gemma 3 270M y un VAE propio denominado PS-VAE, entrenado sobre un dataset mixto de e621 y Danbooru. Se trata, según su autor, del primer modelo en el rango de 1-3B parámetros entrenado sobre e621 desde NoobAI XL, lo que lo sitúa en el nicho de generación de imágenes anime/estilizadas.

El entrenamiento se realizó desde cero durante 18 días en una única GPU H100, con un coste estimado de entre 1.000 y 3.000 dólares y soporte de hardware de Lodestone Rock. El modelo se distribuye con licencia MIT y está pensado para uso en ComfyUI mediante un workflow y nodos personalizados incluidos en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con arquitectura personalizada; text encoder Gemma 3 270M y VAE propio (PS-VAE) |
| Parametros totales | 1.2B (aproximado, según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 6.0 GB |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La información disponible es limitada. El autor describe una arquitectura personalizada entrenada desde cero, que integra un text encoder Gemma 3 270M y un VAE propio llamado PS-VAE. No se detalla el número de bloques, la dimensionalidad del espacio latente, el tipo de atención ni la estrategia de muestreo (DDPM, flow matching u otras).

El entrenamiento se realizó sobre un dataset mixto de e621 y Danbooru, durante 18 días en una única H100. No se especifica el número de tokens o imágenes vistas, la composición exacta del dataset, ni si hubo fases de fine-tuning, RLHF o preferencias. Tampoco se documentan innovaciones técnicas adicionales más allá del uso del text encoder Gemma 3 270M, poco habitual en modelos de difusión de este tamaño.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de etiquetas (tags) o lenguaje natural.
- Respuesta a énfasis en el prompt con sintaxis tipo `(character:2)` o `(artist:2)`.
- Entrenamiento de LoRA sobre el modelo mediante los scripts incluidos (`cache_lora.py` y `train_lora.py`, con parámetros de rango y alpha configurables).
- Integración con ComfyUI mediante nodos personalizados (`nanosaur_support`) y un workflow predefinido (`nanosaur_workflow.json`).
- Especialización en contenido anime/estilizado derivada del dataset de entrenamiento (e621, Danbooru).
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento.

## Casos de uso

- Investigación en entrenamiento de modelos de difusión: sirve como caso de estudio de un modelo entrenado desde cero en una sola H100 durante 18 días, útil para analizar curvas de entrenamiento y decisiones arquitectónicas.
- Práctica de fine-tuning con LoRA: los scripts incluidos permiten experimentar con rangos y alpha sobre un modelo pequeño (1.2B) sin requerir grandes clústeres.
- Generación de ilustración anime en entornos de investigación: el modelo responde a tags y énfasis de prompt, adecuado para prototipos internos de generación estilizada.
- Desarrollo de nodos y workflows para ComfyUI: el paquete `nanosaur_support` y el workflow JSON permiten extender la integración y probar pipelines personalizados.
- Reproducción y auditoría de modelos abandonados: al ser una copia de preservación, permite estudiar un checkpoint que de otro modo se habría perdido.
- Docencia y experimentación con VAEs personalizados: el PS-VAE puede analizarse de forma aislada para comparar reconstrucción y calidad latente frente a VAEs estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño del repositorio (6.0 GB en safetensors), la inferencia en precisión completa requeriría al menos ~6-8 GB de VRAM, y menos si se aplican cuantizaciones, aunque no se documentan formatos ni recetas.
- GPU recomendadas: el entrenamiento se realizó en una H100; para inferencia se puede asumir compatibilidad con GPUs de consumo de gama alta (RTX 3090, RTX 4090) por el tamaño del modelo, si bien no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí en GPUs con 8 GB o más, aunque no está verificado.
- Opciones de despliegue: ComfyUI con los nodos `nanosaur_support` y el workflow `nanosaur_workflow.json`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas para LLMs, no para difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nanosaur 1.2B | ~1.2B | No disponible | MIT | Hugging Face (copia de preservación) |
| NoobAI XL | No disponible | No disponible | No disponible | Hugging Face |
| Modelos de difusión anime de 1-3B | Variable | Variable | Variable | Variable |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de calidad (FID, CLIP score, etc.) ni detalles de resolución o contexto para Nanosaur 1.2B. El propio autor lo sitúa como el primer modelo de 1-3B entrenado sobre e621 desde NoobAI XL, pero no aporta datos comparativos.

## Limitaciones y advertencias

- Modelo inacabado: el autor original lo describe como WIP (work in progress) y el proyecto fue abandonado; la calidad final no está garantizada.
- Documentación incompleta: no se detallan arquitectura exacta, dataset, número de pasos de entrenamiento ni métricas.
- Sesgos: el entrenamiento sobre e621 y Danbooru puede introducir sesgos de contenido y estilísticos propios de esas comunidades; no se documenta ninguna mitigación.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible y artefactos, especialmente en prompts complejos.
- Idiomas: solo se declara inglés; los prompts en castellano pueden degradar la calidad.
- Licencia MIT: permite uso comercial, pero el contenido generado puede estar sujeto a las condiciones de las plataformas de origen de los datos (e621, Danbooru); conviene revisar implicaciones legales antes de producción.
- Integración limitada: depende de nodos personalizados de ComfyUI y de un workflow concreto; no hay soporte documentado para otros runtimes.
- Sin mantenimiento: al ser una copia de preservación de un proyecto abandonado, no cabe esperar actualizaciones ni correcciones de errores.

## Enlaces

- Hugging Face: https://huggingface.co/huangdffs/Nanosaur-1.2B-Preview-Latest
- Repositorio original (referenciado, posiblemente eliminado): well9472/Metal63 en Hugging Face
- Workflow y nodos: `nanosaur_workflow.json` y carpeta `nanosaur_support` dentro del repositorio de Hugging Face
- Scripts de LoRA: `cache_lora.py` y `train_lora.py` incluidos en el repositorio
