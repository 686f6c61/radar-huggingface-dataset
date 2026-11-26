# Neurobrix/Wan2.2-I2V-A14B-Diffusers-nbx

## Resumen

Wan2.2-I2V-A14B-Diffusers-nbx es una adaptación del modelo Wan2.2-I2V-A14B-Diffusers de Wan-AI, publicada por Neurobrix bajo una librería propia denominada `neurobrix`. Se trata de un modelo de generación de vídeo a partir de una imagen (image-to-video) construido sobre el pipeline de Diffusers, reempaquetado para ejecución local con un backend basado en Triton. El repositorio ocupa 126,7 GB y está etiquetado con el sufijo `A14B`, lo que sugiere una arquitectura Mixture of Experts con 14 mil millones de parámetros activos, aunque este dato no se confirma en la información disponible.

El modelo hereda la base de Wan-AI/Wan2.2-I2V-A14B-Diffusers y la redistribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. Su relevancia radica en que permite generar vídeo de alta calidad a partir de una imagen de referencia en infraestructura local, sin depender de APIs propietarias, y con un formato optimizado para el runtime de Neurobrix.

La información publicada es escasa: no se detallan idiomas soportados, número de tokens de entrenamiento, datos de benchmarks ni requisitos de hardware específicos. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión (pipeline Diffusers) para image-to-video; nomenclatura A14B sugiere MoE con 14B activos (no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la etiqueta A14B sugiere ~14B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Diffusers (safetensors); runtime neurobrix con backend Triton |
| Tamano del repositorio | 126,7 GB |
| Pipeline | image-to-video |
| Modelo base | Wan-AI/Wan2.2-I2V-A14B-Diffusers |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo es una adaptación del Wan2.2-I2V-A14B-Diffusers de Wan-AI, un modelo de difusión para generación de vídeo condicionada por imagen. La nomenclatura `A14B` en el nombre del modelo base apunta a una arquitectura Mixture of Experts con aproximadamente 14 mil millones de parámetros activos, si bien la información proporcionada no confirma esta cifra ni el total de parámetros. El reempaquetado de Neurobrix está orientado a inferencia local con un backend basado en Triton, y la librería `neurobrix` actúa como runtime de ejecución.

No se dispone de información sobre el número de tokens o frames de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino adicional. La adaptación parece centrarse en el formato de pesos y el runtime (sufijo `-nbx`) más que en un reentrenamiento sustancial, dado que se declara como `finetune` del modelo base.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video).
- Ejecución local mediante el runtime `neurobrix` con backend Triton.
- Compatibilidad con el ecosistema Diffusers (pesos en formato Diffusers).
- Capacidades multilingües: no disponible.
- Soporte de tool calling, agentes o razonamiento multi-paso: no aplicable (modelo generativo de vídeo).
- Capacidades de audio o thinking mode: no disponibles.

## Casos de uso

- Prototipado de vídeo publicitario: a partir de una imagen de producto se generan clips animados para campañas, ejecutando el modelo en infraestructura propia con GPU Triton-compatible.
- Previsualización de storyboards: los equipos de animación convierten ilustraciones en secuencias animadas para validar movimiento y composición antes de la producción final.
- Generación de contenido para redes sociales: creación de clips cortos animados desde imágenes fijas sin depender de servicios en la nube.
- Enriquecimiento de catálogos de e-commerce: animar fotografías de producto para fichas interactivas o vídeos demostrativos.
- Investigación en difusión de vídeo: servir como base para experimentos de fine-tuning o ablaciones sobre image-to-video en entornos locales.
- Integración en pipelines de postproducción: generar planos de relleno o transiciones a partir de keyframes en flujos de trabajo con Diffusers.
- Desarrollo de demos interactivas: aplicaciones que animan imágenes subidas por el usuario en tiempo de ejecución local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El tamaño del repositorio (126,7 GB) sugiere pesos en precisión alta (probablemente bf16/fp16) y, por tanto, requisitos de VRAM elevados, pero no se confirma.
- GPU recomendadas: no disponible. El backend Triton es compatible con GPUs NVIDIA modernas, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: runtime `neurobrix` (librería propia) con backend Triton; compatibilidad con vLLM, llama.cpp, Ollama o TGI no aplica (modelo de difusión, no LLM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.2-I2V-A14B-Diffusers-nbx | no disponible (etiqueta A14B) | no disponible | Apache 2.0 | Gated en HF |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers (base) | no disponible (etiqueta A14B) | no disponible | Apache 2.0 (según modelo base) | Público en HF |
| Otros modelos image-to-video | no disponible | no disponible | no disponible | no disponible |

La única comparación fiable es con el modelo base del que deriva: la diferencia principal es el reempaquetado para el runtime `neurobrix` y el acceso restringido. No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de descargar.
- Información técnica muy limitada: no se publican parámetros totales, contexto, cuantizaciones ni benchmarks.
- Al ser un modelo de difusión de vídeo, puede generar artefactos temporales, inconsistencias de movimiento y alucinaciones visuales, aunque no se documentan tasas concretas.
- Sesgos: no documentados; los modelos de difusión heredan sesgos de sus datasets de entrenamiento.
- Idiomas soportados: no disponibles; la relevancia lingüística es limitada al ser un modelo visual.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del runtime `neurobrix`.
- El runtime propietario (`neurobrix`) puede limitar la portabilidad frente a Diffusers estándar.
- El tamaño del repositorio (126,7 GB) implica requisitos de almacenamiento y ancho de banda considerables.

## Enlaces

- Hugging Face: https://huggingface.co/Neurobrix/Wan2.2-I2V-A14B-Diffusers-nbx
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
