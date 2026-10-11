# aeon37/AesCode-8B

## Resumen

AesCode-8B es un modelo multimodal de generación de código especializado en producir artefactos visuales ricos en información (diapositivas, pósters, paneles de control e infografías) como documentos HTML/CSS completos. Parte de Qwen/Qwen3-VL-8B-Instruct, un transformer multimodal de tipo vision-language con 8.767.123.696 parámetros, y se distribuye bajo licencia Apache 2.0 en el repositorio `aeon37/AesCode-8B`. El problema que ataca es concreto: los modelos de código no "ven" cómo se combinan maquetación, jerarquía y color en el lienzo, mientras que los generadores de imágenes componen páginas atractivas pero suelen fallar en texto, cifras y relaciones lógicas. AesCode usa una imagen generada a partir del mismo prompt como referencia estética, pero sigue el prompt para el contenido.

La propuesta técnica consiste en separar los requisitos semánticos de las señales visuales mediante supervisión con estructura de grafo y recompensas multimodales desacopladas, con un entrenamiento de SFT de arranque en frío seguido de GDPO sobre siete canales de recompensa. El resultado declarado es un salto de 31,1 puntos en la métrica Visual y 31,0 en Overall frente a su backbone Qwen3-VL-8B-Instruct cuando ambos reciben referencia, alcanzando un Overall de 82,94 y un Rule de 90,07 sobre 300 muestras de infografía.

Es relevante ahora porque demuestra que un modelo de 8B puede superar en esta tarea a sistemas cerrados mucho mayores (GPT-5.5 y Claude Opus 4.8 con referencia obtienen 81,28 y 80,39 de Overall respectivamente) manteniendo la salida verificable y editable, no una imagen rasterizada. Existe además un modelo acompañante de 32B (`microsoft/AesCode-32B`) con mejores cifras, y el código y el artículo están publicados por Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (familia Qwen3-VL, `qwen3_vl`); componente de visión más decoder de lenguaje |
| Parametros totales | 8.767.123.696 (8,77B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 24.576 tokens en la configuración de evaluación reportada por el autor; no se especifica la ventana nativa máxima del backbone |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) según la model card; no se declaran otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`, pipeline `image-text-to-text`) |

Datos adicionales: tamaño del repositorio 17,5 GB; `transformers>=4.57`; modelo base `Qwen/Qwen3-VL-8B-Instruct` (finetune); compatible con endpoints.

## Arquitectura y entrenamiento

El modelo es un finetune de Qwen3-VL-8B-Instruct, por lo que hereda la arquitectura de la familia Qwen3-VL: un encoder de visión acoplado a un decoder de lenguaje autorregresivo que acepta entradas intercaladas de imagen y texto (pipeline `image-text-to-text`). La innovación no está en la arquitectura, sino en el régimen de entrenamiento: el autor describe un SFT de arranque en frío seguido de GDPO (optimización por preferencias con recompensas desacopladas) sobre siete canales de recompensa, con supervisión estructurada en grafo que separa los requisitos semánticos del prompt de las señales visuales aportadas por la imagen de referencia.

Esa separación busca evitar dos fallos típicos de los modelos vision-language convencionales: copiar contenido alucinado procedente de la referencia e ignorar la maquetación de la referencia. La salida se estructura de forma verificable: documento HTML completo, tablas mediante estructuras HTML y gráficos mediante especificaciones ECharts, de modo que tanto el contenido como las comprobaciones programáticas (Text, Bound, Chart) quedan inspeccionables. Según el autor, la imagen de referencia es opcional: el entrenamiento condicionado internaliza la planificación visual en la política, y retirar la referencia en inferencia cuesta solo 1,00 punto de Visual, frente a 19,55 en el backbone y 10,04 en GPT-5.5.

## Capacidades

- Generación de artefactos visuales completos como HTML/CSS editable: infografías, diapositivas, pósters, paneles de control e informes.
- Generación de código front-end (HTML y CSS) con estructura de documento completa y lista para inspección.
- Comprensión de imágenes: acepta una imagen de referencia junto al prompt para guiar maquetación y estilo (entrada `image-text-to-text`).
- Condicionamiento multimodal opcional: funciona con y sin referencia visual, con degradación medida de solo 1,00 punto en Visual al prescindir de ella.
- Emisión de tablas HTML y de gráficos como especificaciones ECharts, lo que permite verificación programática del contenido numérico y de los límites de los elementos (checks Text, Bound y Chart).
- Generación de hasta 12.000 tokens de salida en la configuración reportada.
- Seguimiento de instrucciones conversacionales mediante la interfaz de chat de Qwen3-VL (`apply_chat_template`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: únicamente se declara inglés; no disponible información sobre otros idiomas.
- Capacidades especiales: modo de pensamiento (thinking), audio y visión adicional: no disponible en la información proporcionada.

## Casos de uso

- Generación de infografías corporativas: a partir de un prompt de contenido y, opcionalmente, una imagen de referencia, el modelo devuelve un documento HTML completo con jerarquía, color y bloques de datos; al ser HTML/CSS, el equipo de diseño puede editarlo en lugar de rehacerlo desde cero.
- Paneles de control y reporting de datos: el modelo emite gráficos como especificaciones ECharts y tablas como estructuras HTML, lo que permite insertar los artefactos en una aplicación web y verificar automáticamente que las cifras y los ejes coinciden con los datos de origen.
- Presentaciones y diapositivas editables: útil para equipos que necesitan plantillas de diapositivas versionables en git, con contenido generado y estructura reproducible, en lugar de ficheros binarios opacos.
- Pósters y material de marketing: con una referencia visual de estilo, el modelo mantiene coherencia estética entre piezas mientras respeta el texto y las cifras exactas del brief, evitando los errores de rotulación típicos de los generadores de imágenes.
- Verificación programática de diseño visual: en investigación, permite estudiar la generación de código multimodal con métricas objetivas (Rule) separadas de las evaluaciones visuales por checklist, lo que facilita experimentos reproducibles sobre calidad de maquetación.
- Enriquecimiento de contenido en pipelines editoriales: convertir texto estructurado (por ejemplo, JSON de un CMS) en un artefacto visual publicable, encadenando el modelo desde un servicio de inferencia y validando la salida antes de publicarla.
- Prototipado rápido de interfaces de informes: generar borradores de páginas de resultados con tablas y gráficos que luego se refinan manualmente, reduciendo el tiempo hasta el primer borrador en equipos de producto.
- Investigación en recompensas multimodales desacopladas: el modelo sirve como referencia reproducible para estudiar GDPO con múltiples canales de recompensa sobre un backbone abierto.

## Benchmarks y rendimiento

Evaluación sobre 300 muestras de infografía; `Rule` promedia las comprobaciones programáticas Text, Bound y Chart; `Visual` promedia las dimensiones Content, Layout y Style de la checklist; `Overall` es la media de Rule y Visual. Puntuaciones en porcentaje, media de tres generaciones por prompt sin selección. `Ref.` indica si el modelo recibe una imagen de referencia generada junto al prompt.

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

Según el autor, AesCode-8B mejora Visual en 31,1 puntos y Overall en 31,0 puntos respecto a su backbone Qwen3-VL-8B condicionado por referencia, y su Overall de 82,94 supera a GPT-5.5 y Claude Opus 4.8 con referencia. La dimensión Style es el techo común: ningún sistema supera 60 puntos.

## Requisitos de hardware

- VRAM estimada en bf16: el repositorio ocupa 17,5 GB, por lo que se necesitan al menos unos 20-24 GB de VRAM contando el encoder de visión, activaciones y caché KV para el contexto de 24.576 tokens con hasta 12.000 tokens de salida.
- GPUs recomendadas para bf16: A100 40/80 GB, H100, L40S 48 GB o A6000 48 GB; en una RTX 4090 de 24 GB la inferencia bf16 es muy ajustada y probablemente requiera reducir contexto o cuantizar.
- GPUs de consumo: viable con cuantización (por ejemplo int8 en torno a 9-10 GB o int4 en torno a 5-6 GB), lo que encaja en RTX 3090, RTX 4090, RTX 4080 y tarjetas con 12-16 GB o más; no se documentan ficheros GGUF ni AWQ/GPTQ oficiales, así que la cuantización habría que generarla.
- Despliegue: `transformers>=4.57` con `AutoProcessor` y `AutoModelForImageTextToText`; despliegue en servidor con vLLM mediante `vllm serve <modelo> --limit-mm-per-prompt image=2 --max-model-len 24576`. No se mencionan Ollama, llama.cpp ni TGI en la información disponible.
- Configuración de generación reportada: temperatura 0,8, top-p 0,95, hasta 12.000 tokens nuevos, tres rollouts por prompt, contexto de 24.576 tokens.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Entorno | Overall (con ref.) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| AesCode-8B | 8,77B | 24.576 tokens (config. de evaluación) | 82,94 | Apache 2.0 | Pesos abiertos en HuggingFace (`aeon37/AesCode-8B`) |
| AesCode-32B | 32B | No disponible | 85,89 | No disponible | Pesos abiertos anunciados como `microsoft/AesCode-32B` |
| Qwen3-VL-8B-Instruct | 8B | No disponible | 51,93 | No disponible | Pesos abiertos (backbone del modelo) |
| Qwen3-VL-32B | 32B | No disponible | 61,10 | No disponible | Pesos abiertos |
| GPT-5.5 (cerrado) | No disponible | No disponible | 81,28 | Propietaria | API |
| Claude Opus 4.8 (cerrado) | No disponible | No disponible | 80,39 | Propietaria | API |

La comparación directa más relevante es contra el backbone Qwen3-VL-8B-Instruct: mismo tamaño, misma familia y misma tarea, con una diferencia de 31,0 puntos de Overall a favor de AesCode-8B cuando ambos reciben referencia. Frente a AesCode-32B, el 8B cede 2,95 puntos de Overall pero se mantiene por delante de los sistemas cerrados evaluados.

## Limitaciones y advertencias

- Techo de estilo: ningún sistema evaluado, incluido AesCode-8B con 53,21, supera 60 puntos en Style, la dimensión que premia diseños que no requieren revisión visual adicional antes de entregarse. El acabado estético final sigue necesitando intervención humana.
- Dependencia de la referencia: aunque la caída al prescindir de ella es de solo 1,00 punto en Visual, el propio autor indica que la calidad es mayor cuando se aporta una imagen de referencia.
- Rendimiento inferior al modelo hermano de 32B: AesCode-32B obtiene 85,89 de Overall y 97,27 en Bound frente a 82,94 y 88,36 del 8B, por lo que en escenarios con restricciones estrictas de fidelidad a los límites de los elementos el 8B puede no bastar.
- Idioma: solo se declara inglés. No hay evidencia publicada de rendimiento en castellano ni en otros idiomas, ni sobre tipografías o convenciones de maquetación no anglosajonas.
- Alucinación: el propio planteamiento del modelo reconoce que los modelos vision-language pueden copiar contenido alucinado de la referencia; el entrenamiento lo mitiga, pero no hay datos públicos de tasa de error en producción fuera del conjunto de evaluación de 300 muestras.
- Riesgo de generalización: las métricas proceden exclusivamente del benchmark de infografías definido por los autores; no hay resultados en otros dominios de generación de código o de diseño.
- Trazabilidad del repositorio: el ID de HuggingFace es `aeon37/AesCode-8B`, mientras que la model card y el código apuntan a `microsoft/AesCode-8B` y `microsoft/AesCode-32B`. Conviene verificar el origen y la integridad de los pesos antes de usarlos en producción; el repositorio figura con 0 descargas y 0 likes en el momento de la consulta.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un finetune de Qwen3-VL-8B-Instruct conviene revisar también las condiciones del modelo base y de los datos de entrenamiento, no detallados en la información disponible.
- Coste de inferencia: la configuración reportada genera hasta 12.000 tokens por respuesta, lo que implica latencias y costes de cómputo elevados por petición.
- Cobertura funcional no documentada: no hay información sobre tool calling, uso agéntico, audio, modo de pensamiento ni cuantizaciones oficiales, por lo que no deben asumirse.

## Enlaces

- HuggingFace (repositorio consultado): https://huggingface.co/aeon37/AesCode-8B
- Modelo acompañante de 32B: https://huggingface.co/microsoft/AesCode-32B
- Código: https://github.com/microsoft/AesCode
- Artículo: *AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards* (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
