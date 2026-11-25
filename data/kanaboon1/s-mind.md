# KANABOON1/S-Mind

## Resumen

S-Mind es un conjunto de checkpoints de un modelo multimodal image-text-to-text orientado a inteligencia espacial, desarrollado por Muxin Fu y colaboradores (repositorio de KANABOON1) y publicado en arXiv. El modelo parte de dos bases de la familia Qwen3.5 (4B y 9B parámetros) y las especializa para internalizar geometría multi-vista: tras procesar un conjunto de imágenes, el modelo genera una secuencia compacta de "tokens espaciales" que codifican la escena 3D que muestran dichas imágenes, y posteriormente reexpresa esa escena desde cada punto de vista que requiere su razonamiento.

El problema que aborda es la falta de consistencia geométrica en los modelos visión-lenguaje convencionales cuando razonan sobre múltiples vistas de un mismo entorno. En lugar de depender de reconstrucciones externas o de módulos de geometría acoplados, S-Mind integra la representación espacial dentro del propio modelo mediante un proceso de entrenamiento en tres fases: preentrenamiento de geometría (fusion), ajuste supervisado (SFT) y aprendizaje por refuerzo (RL).

Es relevante porque propone un mecanismo explícito y analizable (los tokens espaciales y un módulo de lectura geométrica o readout) para dotar de razonamiento 3D a modelos de tamaño contenido, desplegables en hardware asequible. El repositorio ocupa 83,7 GB e incluye los seis checkpoints (tres por cada tamaño base). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.5, con tokens espaciales y modulo de readout geometrico |
| Parametros totales | Dos variantes: 4B y 9B (heredados de Qwen3.5-4B y Qwen3.5-9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cada carpeta es un directorio estandar de Hugging Face, mas `spatial_config.json` y `readout/`) |

## Arquitectura y entrenamiento

S-Mind se construye sobre Qwen3.5 en sus variantes de 4B y 9B parámetros, ambas multimodales (pipeline image-text-to-text). La innovación central es la introducción de un conjunto compacto de tokens espaciales que se generan a continuación de las imágenes de entrada y que actúan como representación latente de la escena 3D. El modelo aprende a reexpresar esa escena desde cada punto de vista que su razonamiento adopta, internalizando así la geometría multi-vista en lugar de delegarla en un módulo externo. Cada checkpoint incluye además una carpeta `readout/` con el módulo de lectura geométrica, destinado al análisis y la visualización de la representación espacial.

El entrenamiento se organiza en tres etapas por tamaño de modelo: una fase de preentrenamiento de geometría (`fusion`), que constituye el punto de partida del SFT; una fase de ajuste supervisado (`sft`); y una fase final de aprendizaje por refuerzo (`rl`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del esquema de RL (por ejemplo, si se emplea RLHF, DPO u otra variante). La inferencia requiere el código propio del proyecto, que completa los tokens espaciales cuando el modelo comienza a generarlos.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes (image-text-to-text).
- Razonamiento espacial multi-vista: construcción de una representación latente de la escena 3D a partir de varias imágenes y reexpresión desde distintos puntos de vista.
- Generación de tokens espaciales intermedios que codifican la geometría de la escena, completados automáticamente durante la inferencia.
- Análisis y visualización de la geometría interna mediante el módulo de readout incluido en cada checkpoint.
- Capacidades heredadas de Qwen3.5 (generación de texto, código, matemáticas, tool calling, agentes, multilingüismo): no disponible de forma explícita en la información proporcionada; deben considerarse las de la base Qwen3.5 correspondiente.
- Modo de pensamiento (thinking) u otras capacidades especiales: no disponible.

## Casos de uso

- Razonamiento sobre entornos 3D a partir de fotografías: dado un conjunto de imágenes de una misma habitación u objeto desde ángulos distintos, el modelo construye la representación espacial y responde preguntas sobre la disposición relativa de los elementos.
- Robótica y navegación asistida: integración del modelo en pipelines que necesitan inferir la geometría de una escena a partir de varias cámaras y planificar movimientos coherentes con esa geometría.
- Análisis de imágenes de inspección técnica: reconstrucción mental de la estructura de una pieza o instalación a partir de múltiples vistas para detectar inconsistencias o describir su geometría.
- Investigación en visión-lenguaje: uso de los checkpoints `fusion`, `sft` y `rl` para estudiar el efecto de cada fase de entrenamiento sobre la representación espacial, apoyándose en el módulo de readout.
- Generación de descripciones espaciales para accesibilidad: producir narraciones que indiquen posiciones, orientaciones y relaciones entre objetos a partir de varias imágenes.
- Prototipado de asistentes visuales con requisitos de coherencia geométrica: despliegue de la variante 4B en entornos con recursos limitados cuando se necesita razonamiento espacial y no solo descripción de imágenes.
- Evaluación comparativa de representaciones 3D: uso del `spatial_config.json` y del readout para analizar cómo varía la codificación de la escena entre las fases de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño de pesos en safetensors, la variante 4B requiere del orden de 8-10 GB en precisión de 16 bits y la de 9B del orden de 18-20 GB; estas cifras son estimaciones por tamaño de parámetros y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, la variante 4B podría ejecutarse en GPUs consumer de gama alta (por ejemplo, RTX 4090 de 24 GB) en 16 bits; la de 9B requeriría GPUs de mayor memoria o cuantización.
- Cabe en GPU consumer: probablemente la variante 4B en 16 bits en GPUs de 24 GB; la de 9B, solo con cuantización o en GPUs de 24 GB o más. No confirmado por el autor.
- Opciones de despliegue: la inferencia requiere el código propio de S-Mind (repositorio en GitHub) para completar los tokens espaciales; el soporte en vLLM, llama.cpp, Ollama o TGI no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S-Mind-4B | 4B | no disponible | Razonamiento espacial multi-vista con tokens espaciales | Apache 2.0 | Hugging Face (repo de 83,7 GB con 6 checkpoints) |
| S-Mind-9B | 9B | no disponible | Razonamiento espacial multi-vista con tokens espaciales | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4B | no disponible | Modelo multimodal generalista | no disponible en la informacion | Hugging Face |
| Qwen3.5-9B (base) | 9B | no disponible | Modelo multimodal generalista | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre S-Mind y sus bases ni con otros modelos de razonamiento espacial en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez.
- El razonamiento espacial depende de la calidad y coherencia de las múltiples vistas de entrada; no se especifica su comportamiento con vistas escasas o inconsistentes.
- La inferencia requiere código específico del proyecto; no es un modelo que funcione directamente con los runners estándar sin adaptación.
- Idiomas soportados no documentados; el comportamiento multilingüe debe validarse empíricamente.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el modelo se apoya en Qwen3.5; conviene verificar las condiciones de la licencia de la base para uso en producción.
- El tamaño del repositorio (83,7 GB) implica costes de almacenamiento y descarga considerables.
- No hay información sobre latencia, throughput ni requisitos de memoria oficiales, lo que dificulta planificar despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/KANABOON1/S-Mind
- Paper (arXiv): https://arxiv.org/abs/2611.28649
- Código: https://github.com/KANABOON1/S-Mind
- Página del proyecto: https://kanaboon1.github.io/S-Mind/
- Modelo base 4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base 9B: https://huggingface.co/Qwen/Qwen3.5-9B
