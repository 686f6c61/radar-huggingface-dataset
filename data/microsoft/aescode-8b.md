# microsoft/AesCode-8B

## Resumen

AesCode-8B es un modelo multimodal de Microsoft, derivado por ajuste fino de Qwen/Qwen3-VL-8B-Instruct, especializado en generar artefactos visuales ricos en información (presentaciones, pósteres, paneles de control e informes) como documentos HTML/CSS completos y editables. A diferencia de un generador de imágenes, la salida es código estructurado y verificable, lo que permite inspeccionar tablas y gráficos de forma programática.

El problema que aborda es la brecha entre modelos de código, que no perciben la composición visual (jerarquía, color, disposición), y generadores de imágenes, que producen páginas atractivas pero fallan al renderizar texto, cifras y relaciones lógicas. AesCode combina ambos mundos: recibe una imagen de referencia generada a partir del mismo prompt como guía estética y el prompt como fuente de contenido, separando requisitos semánticos de señales visuales mediante supervisión con estructura de grafo y recompensas multimodales desacopladas.

El modelo parte de Qwen3-VL-8B-Instruct, se entrena con SFT de arranque en frío seguido de GDPO sobre siete canales de recompensa, y cuenta con 8.767.123.696 parámetros totales. Se publica bajo licencia Apache 2.0 y está pensado para investigación y producción en generación de código multimodal y diseño visual verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), base Qwen3-VL (`qwen3_vl`) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 24.576 tokens (configuración de evaluación y servicio indicada) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el ejemplo de uso emplea `dtype="auto"`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 17,5 GB) |

## Arquitectura y entrenamiento

AesCode-8B es un transformer multimodal de tipo visión-lenguaje construido sobre Qwen3-VL-8B-Instruct, con el pipeline `image-text-to-text` y la clase `qwen3_vl` de Transformers (requiere `transformers>=4.57`). Acepta entradas de imagen y texto en el mismo mensaje de chat y genera un documento HTML completo como salida, con tablas en estructuras HTML y gráficos en especificaciones ECharts para que ambos sean directamente inspeccionables y verificables.

El entrenamiento consta de dos fases: un ajuste fino supervisado (SFT) de arranque en frío y, a continuación, optimización por preferencias con GDPO sobre siete canales de recompensa. La innovación central es la separación entre requisitos semánticos y señales visuales mediante supervisión con estructura de grafo y recompensas multimodales desacopladas. Además, el entrenamiento condicionado a referencia internaliza la planificación visual en la política: en AesCode-8B, prescindir de la imagen de referencia en inferencia cuesta solo 1,00 punto de Visual, frente a 19,55 del backbone Qwen3-VL-8B-Instruct y 10,04 de GPT-5.5. No se dispone de datos sobre volumen de tokens de entrenamiento ni composición del dataset.

## Capacidades

- Generación de documentos HTML/CSS completos y editables a partir de un prompt de contenido detallado.
- Creación de artefactos visuales ricos en información: presentaciones, pósteres, paneles de control e informes.
- Entrada multimodal: acepta una imagen de referencia opcional para guiar disposición y estilo, además del prompt de contenido.
- Tablas en estructuras HTML y gráficos en especificaciones ECharts, lo que permite verificación programática de texto, límites y gráficos.
- Condicionamiento a referencia opcional con degradación mínima (1,00 punto de Visual) cuando se omite la imagen.
- Capacidad de planificación visual internalizada, sin depender estrictamente de la imagen de referencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo de pensamiento (thinking), visión general, audio: no disponible en la información proporcionada.

## Casos de uso

- Generación de presentaciones editables: el modelo recibe un prompt con el contenido de las diapositivas y, opcionalmente, una imagen de referencia de estilo, y devuelve un documento HTML que el equipo puede editar y versionar en un repositorio, evitando el formato binario opaco de las herramientas tradicionales.
- Creación de pósteres y material promocional: a partir de una descripción de contenido y una referencia estética, AesCode produce HTML/CSS con jerarquía tipográfica y color, manteniendo el texto y las cifras correctos gracias a sus comprobaciones de texto y límites (94,06 y 88,36 en la evaluación).
- Paneles de control con gráficos verificables: el modelo emite especificaciones ECharts, de modo que los gráficos pueden validarse programáticamente (87,79 en la comprobación de gráficos) antes de publicarse, lo que resulta adecuado para informes operativos generados automáticamente.
- Informes y resúmenes ejecutivos automatizados: con hasta 24.576 tokens de contexto y hasta 12.000 tokens de salida, puede generar informes extensos con tablas HTML a partir de un prompt detallado, integrables en pipelines de generación de documentación.
- Investigación en generación de código multimodal: el modelo sirve como base para estudiar recompensas multimodales desacopladas, supervisión con estructura de grafo y evaluación de diseño visual verificable, dado que el paper y el código están publicados.
- Despliegue en producción con vLLM: el servicio indicado (`--limit-mm-per-prompt image=2 --max-model-len 24576`) permite generación por lotes con dos imágenes por prompt, adecuado para plataformas internas de creación de contenido a escala.
- Sustitución de generadores de imágenes en flujos donde el texto debe ser exacto: en materiales con cifras, tablas o relaciones lógicas, AesCode evita los errores de renderizado de texto típicos de los modelos de imagen al producir código en lugar de píxeles.

## Benchmarks y rendimiento

Evaluación sobre 300 muestras de infografías. `Rule` promedia las comprobaciones programáticas de Text, Bound y Chart; `Visual` promedia las dimensiones de lista Content, Layout y Style; `Overall` es la media de Rule y Visual. Puntuaciones en porcentaje, media de tres generaciones por prompt sin selección. `Ref.` indica si el modelo recibe una imagen de referencia generada junto al prompt.

| Modelo | Ref. | Text | Bound | Chart | Rule | Content | Layout | Style | Visual | Overall |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
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

AesCode-8B mejora Visual en 31,1 puntos y Overall en 31,0 respecto a su backbone Qwen3-VL-8B condicionado a referencia. Su Overall de 82,94 supera a GPT-5.5 y Claude Opus 4.8 condicionados a referencia, con Rule en 90,07. Style es el techo común de todos los sistemas: ningún modelo supera 60.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 8,77 mil millones de parámetros y pesos safetensors (17,5 GB en el repositorio), la inferencia en precisión de 16 bits requiere aproximadamente 17-18 GB de VRAM solo para pesos, más memoria para el procesador de visión y la caché KV de hasta 24.576 tokens de contexto.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encajan GPU de centro de datos (A100, H100) y, para lotes pequeños, GPU de consumo de gama alta con suficiente VRAM.
- ¿Cabe en GPU de consumo? No disponible como dato del autor; por el tamaño de pesos, requiere tarjetas con al menos ~18-20 GB de VRAM en 16 bits, lo que excluye la mayoría de GPU de consumo de gama media.
- Opciones de despliegue: Transformers (`AutoModelForImageTextToText`, `transformers>=4.57`) y vLLM (`vllm serve microsoft/AesCode-8B --limit-mm-per-prompt image=2 --max-model-len 24576`). Otras opciones (llama.cpp, Ollama, TGI) no están indicadas en la información disponible.
- Latencia y throughput: no disponibles. La configuración de evaluación usa temperatura 0,8, top-p 0,95, hasta 12.000 tokens de salida y contexto de 24.576 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Overall (con ref.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-8B | 8,77 B | 24.576 tokens | 82,94 | Apache 2.0 | Hugging Face (`microsoft/AesCode-8B`) |
| AesCode-32B | No disponible | No disponible | 85,89 | No disponible | Hugging Face (`microsoft/AesCode-32B`) |
| Qwen3-VL-8B-Instruct | 8 B (aproximado) | No disponible | 51,93 | No disponible | Hugging Face (modelo base) |
| Qwen3-VL-32B | 32 B (aproximado) | No disponible | 61,10 | No disponible | Hugging Face |
| GPT-5.5 | No disponible | No disponible | 81,28 | Propietaria | API de OpenAI |
| Claude Opus 4.8 | No disponible | No disponible | 80,39 | Propietaria | API de Anthropic |

Frente a su backbone Qwen3-VL-8B-Instruct, AesCode-8B gana 31,0 puntos de Overall con la misma condición de referencia. Frente a los modelos propietarios evaluados, supera a GPT-5.5 (81,28) y Claude Opus 4.8 (80,39) en Overall con referencia, y queda por debajo de AesCode-32B (85,89).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada.
- Riesgo de alucinación: el modelo está entrenado para seguir el prompt de contenido y no copiar contenido alucinado de la referencia, pero no se ofrecen garantías formales; la evaluación programática (Text, Bound, Chart) mitiga parcialmente este riesgo.
- Limitación de idioma: la model card declara únicamente inglés (`en`); no hay soporte multilingüe documentado.
- Limitación de contexto: la configuración de referencia usa 24.576 tokens de contexto y 12.000 tokens de salida; prompts o documentos más largos pueden degradar la calidad.
- Techo de estilo: Style es la dimensión más débil de todos los sistemas evaluados y ningún modelo supera 60; AesCode-8B obtiene 53,21, por lo que los diseños pueden requerir revisión visual antes de su entrega.
- La imagen de referencia es opcional, pero la calidad es mayor cuando se proporciona; sin ella, la pérdida medida es de 1,00 punto de Visual en este modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-8B-Instruct y de los datos de entrenamiento.
- En producción, el servicio con vLLM requiere limitar a dos imágenes por prompt y fijar `--max-model-len 24576`; no se documentan requisitos de hardware ni latencias.
- El modelo emite HTML/CSS y especificaciones ECharts completos: es necesario sanear y validar la salida antes de renderizarla en entornos no confiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microsoft/AesCode-8B
- Modelo complementario AesCode-32B: https://huggingface.co/microsoft/AesCode-32B
- Paper (arXiv:2610.18860): https://arxiv.org/abs/2610.18860
- Página del paper en Hugging Face: https://huggingface.co/papers/2610.18860
- Página del proyecto: https://microsoft.github.io/AesCode/
- Código: https://github.com/microsoft/AesCode
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
