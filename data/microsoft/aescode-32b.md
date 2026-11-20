# microsoft/AesCode-32B

## Resumen

AesCode-32B es un modelo multimodal de generación de código desarrollado por Microsoft, especializado en producir artefactos visuales ricos en información —presentaciones, pósteres, paneles de control e infografías— como HTML/CSS estructurado y editable. Parte del modelo base Qwen/Qwen3-VL-32B-Instruct y se entrena mediante SFT con arranque en frío seguido de GDPO (una variante de optimización de política) sobre siete canales de recompensa. El modelo resuelve un problema concreto: los modelos de código no perciben cómo se combinan disposición, jerarquía y color en el lienzo, mientras que los generadores de imágenes componen visualmente pero fallan en texto, cifras y relaciones lógicas.

La propuesta técnica clave es el uso de una imagen generada a partir del mismo prompt como referencia estética, separando los requisitos semánticos (contenido que debe aparecer) de las señales visuales (disposición y estilo) mediante supervisión con estructura de grafo y recompensas multimodales desacopladas. El checkpoint tiene 33.357.390.064 parámetros (bf16) y un repositorio de 66,7 GB. Se publica bajo licencia Apache 2.0, con un modelo hermano de menor tamaño (AesCode-8B) y un artículo en arXiv.

Es relevante ahora porque demuestra que el ajuste fino con RL sobre un VLM de propósito general puede superar a sistemas propietarios de referencia en verificación programática de artefactos visuales (Rule 94,33 frente a 85,90 de GPT-5.5 y 88,04 de Claude Opus 4.8), manteniendo la salida como código ejecutable y auditable en lugar de una imagen rasterizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) derivada de Qwen3-VL; pipeline `image-text-to-text` |
| Parametros totales | 33.357.390.064 (aproximadamente 33,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de servicio con vLLM usa `--max-model-len 24576` |
| Tipos de cuantizacion | no disponible (los pesos publicados son bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

AesCode-32B se construye sobre Qwen3-VL-32B-Instruct, un transformer multimodal que acepta entradas de imagen y texto y genera texto. El entrenamiento consta de dos fases: un SFT de arranque en frío y posteriormente GDPO (optimización de política con recompensas desacopladas) sobre siete canales de recompensa. La innovación central es la separación entre supervisión semántica y señales visuales: el modelo recibe, además del prompt de contenido, una imagen de referencia generada a partir del mismo prompt, y se le entrena para seguir el prompt en cuanto a contenido obligatorio mientras usa la referencia solo como guía de disposición y estilo. Esto evita dos fallos típicos de los VLM genéricos: copiar contenido alucinado de la referencia o ignorar por completo su estructura.

La supervisión con estructura de grafo organiza las relaciones entre elementos del artefacto, y las recompensas multimodales desacopladas permiten puntuar por separado requisitos verificables (texto presente, límites del lienzo, tablas y gráficos) y dimensiones visuales (contenido, disposición, estilo). El resultado buscado es HTML/CSS ejecutable, con tablas en estructuras HTML y gráficos en ECharts, lo que restringe el espacio de soluciones a implementaciones directamente verificables.

## Capacidades

- Generación de artefactos visuales completos como HTML/CSS editable: diapositivas, pósteres, paneles de control, informes e infografías.
- Entrada multimodal: acepta una imagen de referencia junto al prompt para guiar disposición y estilo.
- Generación de tablas con estructura HTML y gráficos mediante ECharts, lo que permite verificación programática.
- Razonamiento sobre jerarquía visual, composición y paleta de color a partir de la referencia.
- Capacidad de código en el dominio de maquetación web (HTML/CSS) y visualización de datos.
- Modo conversacional mediante la interfaz de chat de Qwen3-VL.
- Soporte de generación por lotes y servicio con vLLM, con hasta dos imágenes por prompt.
- Capacidades multilingües: solo inglés declarado.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, audio o modo de razonamiento explícito.

## Casos de uso

- Generación automática de diapositivas editables: a partir de un prompt de contenido y una referencia visual, el modelo produce HTML/CSS que el equipo puede abrir en el navegador, editar y versionar en Git, en lugar de un PPTX o una imagen plana.
- Paneles de control con gráficos verificables: al exigir ECharts y tablas HTML, los gráficos generados son ejecutables y sus datos se pueden comprobar de forma programática, lo que encaja en pipelines de informes internos.
- Pósteres e infografías para marketing técnico: el modelo mantiene el texto y las cifras dictadas por el prompt mientras toma la composición de la imagen de referencia, reduciendo el riesgo de texto mal renderizado típico de los generadores de imagen.
- Investigación en generación de código multimodal: sirve como checkpoint de referencia para estudiar recompensas desacopladas, supervisión con estructura de grafo y evaluación de diseño visual verificable.
- Automatización de informes periódicos: con contexto de hasta 24.576 tokens en el ejemplo de despliegue, puede incorporar el contenido de un informe extenso y generar una página estructurada con secciones, tablas y gráficos.
- Prototipado rápido de interfaces de presentación de datos: equipos de producto pueden generar maquetas HTML de dashboards a partir de una referencia de estilo y validarlas con comprobaciones automáticas de límites y contenido antes de pasarlas a diseño.
- Evaluación comparativa de sistemas de diseño generativo: el conjunto de 300 muestras de infografías y las comprobaciones Rule/Visual permiten comparar modelos de forma reproducible en un entorno de investigación.

## Benchmarks y rendimiento

Evaluación sobre 300 muestras de infografías; `Rule` promedia las comprobaciones programáticas de Text, Bound y Chart; `Visual` promedia Content, Layout y Style; `Overall` es la media de Rule y Visual. Porcentajes promediados sobre tres generaciones por prompt sin selección. `Ref.` indica si el modelo recibe una imagen de referencia generada junto al prompt.

| Modelo | Ref. | Text | Bound | Chart | Rule | Content | Layout | Style | Visual | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| GPT-5.5 | No | 88,67 | 86,18 | 82,85 | 85,90 | 79,27 | 68,09 | 52,80 | 66,72 | 76,31 |
| GPT-5.5 | Sí | 89,22 | 86,85 | 81,35 | 85,80 | 82,44 | 89,93 | 57,91 | 76,76 | 81,28 |
| Claude Opus 4.8 | No | 91,40 | 85,03 | 87,69 | 88,04 | 84,98 | 64,88 | 46,72 | 65,53 | 76,78 |
| Claude Opus 4.8 | Sí | 92,45 | 84,43 | 73,75 | 83,55 | 86,42 | 89,76 | 55,51 | 77,23 | 80,39 |
| Qwen3-VL-8B | No | 58,32 | 77,23 | 43,30 | 59,61 | 38,33 | 23,97 | 13,22 | 25,17 | 42,39 |
| Qwen3-VL-8B | Sí | 64,07 | 70,99 | 42,35 | 59,14 | 52,90 | 51,33 | 29,92 | 44,72 | 51,93 |
| Qwen3-VL-32B | No | 66,00 | 80,31 | 41,36 | 62,55 | 49,81 | 34,85 | 19,34 | 34,67 | 48,61 |
| Qwen3-VL-32B | Sí | 71,19 | 79,61 | 50,77 | 67,19 | 62,04 | 64,59 | 38,43 | 55,02 | 61,10 |
| AesCode-8B | Sí | 94,06 | 88,36 | 87,79 | 90,07 | 86,41 | 87,80 | 53,21 | 75,80 | 82,94 |
| AesCode-32B | Sí | 95,34 | 97,27 | 90,37 | 94,33 | 85,76 | 90,58 | 55,99 | 77,44 | 85,89 |

AesCode-32B mejora Visual en 22,4 puntos y Overall en 24,8 puntos respecto a su backbone Qwen3-VL-32B con referencia. Lidera Overall con 85,89 y alcanza Rule 94,33. En Chart obtiene 90,37, el mejor resultado, y en Bound 97,27, con un fallo grave de desbordamiento del lienzo en el 4,3% de las 300 muestras frente al 34,7% de GPT-5.5. Style es el techo común: ningún sistema supera 60.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 65 GB solo para los parámetros, según la model card.
- GPU recomendadas: configuraciones multi-GPU de centro de datos (A100 80 GB, H100 80 GB) para inferencia en bf16; el ejemplo oficial usa `--tensor-parallel-size 4`.
- GPU de consumo: no cabe en una sola GPU de consumo en bf16; se requeriría cuantización, cuyos formatos no se documentan en la información disponible.
- Despliegue: `transformers>=4.57` con `AutoProcessor` y `AutoModelForImageTextToText`; servicio por lotes con vLLM (`vllm serve microsoft/AesCode-32B --tensor-parallel-size 4 --limit-mm-per-prompt image=2 --max-model-len 24576`).
- Parámetros de generación reportados: temperatura 0,8, top-p 0,95, hasta 12.000 tokens nuevos y tres rollouts por prompt.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Overall (con ref.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B | 33,4 mil millones | no disponible (ejemplo a 24.576) | 85,89 | Apache 2.0 | Pesos abiertos en Hugging Face |
| AesCode-8B | no disponible | no disponible | 82,94 | no disponible | Pesos abiertos en Hugging Face |
| Qwen3-VL-32B-Instruct (base) | 32B (aproximado por nombre) | no disponible | 61,10 | no disponible | Pesos abiertos |
| GPT-5.5 | no disponible | no disponible | 81,28 | propietaria | API |
| Claude Opus 4.8 | no disponible | no disponible | 80,39 | propietaria | API |

## Limitaciones y advertencias

- El estilo es el punto débil compartido: ningún modelo del estudio supera 60 en Style, que solo otorga crédito cuando el diseño no requiere revisión visual adicional antes de la entrega.
- Riesgo de copiar contenido alucinado de la imagen de referencia si el prompt no delimita con precisión el contenido obligatorio; el entrenamiento mitiga pero no elimina este fallo.
- Riesgo de desbordamiento del lienzo: aunque Bound alcanza 97,27, persiste un fallo grave de límites en el 4,3% de las muestras.
- Idioma: solo se declara inglés, por lo que la calidad en castellano no está garantizada ni evaluada.
- Longitud de contexto: no se publica el máximo oficial; el ejemplo de servicio limita a 24.576 tokens, insuficiente para documentos muy extensos.
- Requisitos de memoria elevados (unos 65 GB en bf16) que excluyen el despliegue en GPU de consumo sin cuantización, cuyos formatos no se documentan.
- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo de código y diseño, puede reproducir sesgos de estilo y de composición presentes en los datos de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-32B-Instruct y de las dependencias generadas (ECharts) en producción.
- El modelo está especializado en artefactos HTML/CSS; no debe asumirse un rendimiento equivalente al de su backbone en tareas generales de visión-lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microsoft/AesCode-32B
- Modelo hermano AesCode-8B: https://huggingface.co/microsoft/AesCode-8B
- Artículo: https://arxiv.org/abs/2610.18860
- Página del artículo en Hugging Face: https://huggingface.co/papers/2610.18860
- Página del proyecto: https://microsoft.github.io/AesCode/
- Código: https://github.com/microsoft/AesCode
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
