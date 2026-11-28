# K-Ai-Official/K-Oss-8-Mini-Instruct-8B

## Resumen

K-Oss 8 Mini Instruct es un modelo multimodal de 8.767 millones de parámetros (8,8B) desarrollado por K-Ai (Kortex AI) como parte de la familia K-Oss 8. Se trata de un ajuste fino supervisado (QLoRA) del modelo Qwen3-VL-8B-Instruct de Alibaba Cloud, orientado a instrucciones y con foco en tres idiomas: inglés, indonesio (Bahasa Indonesia) y japonés. Acepta entradas de texto e imagen y produce respuestas en texto.

El modelo resuelve el problema de disponer de un asistente conversacional multimodal de tamano contenido con soporte explicito para indonesio y japones, idiomas habitualmente infrarrepresentados en los modelos generalistas. La torre de vision permanece congelada durante el ajuste, por lo que las capacidades visuales heredadas del modelo base se mantienen, mientras que las capas de lenguaje se adaptan al estilo de instruccion y al contenido multilingue del nuevo corpus.

Es relevante porque demuestra un flujo de trabajo reproducible de ajuste fino multimodal con recursos muy limitados (una sola GPU T4 de 16 GB en Google Colab) y porque publica los pesos fusionados en 16 bits bajo licencia Apache-2.0. Conviene subrayar que, pese al nombre, no comparte pesos con el modelo grande K-Oss 8 (120B totales / 12B activos, basado en NVIDIA Nemotron 3.5 Super VL) ni se ha destilado de el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3-VL); torre de vision congelada + capas de lenguaje ajustadas |
| Parametros totales | 8.767.123.696 (8,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-8B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | pesos publicados en 16 bits; entrenamiento en 4 bits (QLoRA); no se listan otros formatos |
| Idiomas soportados | ingles (en), indonesio (id), japones (ja) |
| Licencia | Apache-2.0 (sigue la del modelo base) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, una arquitectura transformer multimodal que procesa texto e imagenes y genera texto. El ajuste se realizo con QLoRA (rango r=16, alpha=16) sobre los pesos del modelo base cuantizados a 4 bits; se entrenaron los modulos de atencion y MLP de las capas de lenguaje, mientras que la torre de vision se mantuvo congelada. Posteriormente los adaptadores se fusionaron en pesos de 16 bits.

Los hiperparametros declarados incluyen batch size 1 con acumulacion de gradiente 8 (efectivo 8), learning rate 1e-4, AdamW de 8 bits, weight decay 0,01, precision fp16, longitud maxima de secuencia 1536 tokens, imagenes redimensionadas a un maximo de 640 px y semilla 3407. El entrenamiento se ejecuto en una unica NVIDIA T4 (16 GB) en Google Colab; los campos de numero de pasos, tiempo de entrenamiento y evolucion de la perdida aparecen como marcadores sin rellenar en la model card. El corpus de entrenamiento es mayoritariamente sintetico (dataset `kai_synth_v1`, generado con respuestas calculadas de forma exacta) y se complementa con `yahma/alpaca-cleaned`, `FreedomIntelligence/alpaca-gpt4-japanese` y `FreedomIntelligence/alpaca-gpt4-indonesian`. Las tareas cubiertas incluyen OCR (codigos, numeros, palabras), recibos con simbolos monetarios (Rp, $, ¥), graficos de barras, tablas, formularios, matematicas en imagen, conteo de formas, problemas verbales, hechos generales, traduccion entre los tres idiomas, identidad y un conjunto reducido de ejemplos de rechazo y seguridad.

## Capacidades

- Generacion de texto e instrucciones conversacionales en ingles, indonesio y japones.
- Comprension de imagenes: OCR de codigos, numeros y palabras, lectura de recibos con importes en rupias, dolares y yenes, interpretacion de graficos de barras, tablas y formularios.
- Razonamiento basico sobre matematicas y problemas verbales, incluidas matematicas presentadas en imagen y conteo de formas.
- Traduccion entre los tres idiomas objetivo.
- Respuesta a preguntas generales y resumen de texto.
- Capacidades multimodales heredadas de Qwen3-VL, sujetas a lo que el ajuste haya preservado.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- No se documenta modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Digitalizacion de recibos y facturas: el modelo puede leer una imagen de ticket y extraer el total o los importes en Rp, $ o ¥, una tarea para la que fue entrenado de forma especifica con datos sinteticos de recibos.
- Extraccion de datos de formularios y tablas: adecuado para pipelines de captura documental donde se envia una imagen y se solicita un campo concreto, gracias al entrenamiento en OCR y estructuras tabulares.
- Asistencia conversacional multilingue en el sudeste asiatico: permite atender a usuarios en indonesio e ingles dentro de la misma aplicacion, con respuestas en el idioma de la consulta (19/20 en la prueba de idioma correcto para indonesio e ingles).
- Soporte educativo y tutoria: puede resolver problemas verbales de matematicas y explicar contenidos en los tres idiomas, con la salvedad de que sus respuestas requieren revision.
- Interpretacion de graficos en informes: dado un grafico de barras en imagen, el modelo puede describir tendencias o responder preguntas sobre las categorias, una capacidad cubierta en el entrenamiento.
- Prototipado e investigacion en vision-lenguaje: al publicarse en 16 bits y con licencia Apache-2.0, sirve como base para experimentos academicos o para ajustes posteriores con recursos modestos.
- Traduccion de soporte entre japones e indonesio: util en entornos de atencion al cliente con documentacion en japones y usuarios en indonesio, aunque la calidad en japones es la mas baja de los tres idiomas segun las pruebas del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta pruebas internas sobre conjuntos reducidos de evaluacion retenidos (20 casos por idioma y tarea):

| Idioma | Pruebas in-domain (ajustado) | Pruebas in-domain (base) | Q&A general (ajustado) | Responde en el idioma correcto |
|---|---|---|---|---|
| Indonesio | 17/20 | 15/20 | 16/20 | 19/20 |
| Ingles | 17/20 | 17/20 | 17/20 | 19/20 |
| Japones | 14/20 | 12/20 | 13/20 | 16/20 |

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 17,5 GB solo para los pesos, mas el espacio de activaciones y cache KV; en la practica requiere mas de 20 GB, por lo que no cabe en GPUs de consumo de 16 GB sin cuantizar.
- Cuantizacion a 8 bits: en torno a 9-10 GB de pesos, viable en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen.
- Cuantizacion a 4 bits: en torno a 5-6 GB de pesos, viable en GPUs de consumo de 8-12 GB como RTX 3060, RTX 4060 Ti o similares, con limitaciones de longitud de contexto.
- GPU profesionales: A100 (40/80 GB) y H100 (80 GB) permiten inferencia en 16 bits con contexto amplio y mayor throughput.
- Opciones de despliegue: transformers (soporte nativo via `AutoModelForImageTextToText` y `AutoProcessor`), vLLM y TGI para servir en produccion si se dispone de pesos en formato compatible, y llama.cpp/Ollama solo si existiesen conversiones GGUF, que no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo indica que el entrenamiento se realizo en una T4 de 16 GB, sin datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| K-Oss 8 Mini Instruct | 8,8B | no disponible | en, id, ja | Apache-2.0 | Ajuste QLoRA de Qwen3-VL-8B; vision congelada; datos mayoritariamente sinteticos |
| Qwen3-VL-8B-Instruct (base) | ~8,8B | no disponible | multilingue amplio | Apache-2.0 | Modelo original de Alibaba Cloud; mayor cobertura idiomatica y datos de entrenamiento mas amplios |
| K-Oss 8 (familia) | 120B totales / 12B activos | no disponible | en, id, ja | sigue la licencia de Nemotron | Modelo grande basado en NVIDIA Nemotron 3.5 Super VL; no comparte pesos con Mini |

La comparacion con otros modelos de 8B multimodales de la misma categoria (por ejemplo, alternativas de Llama o Gemma con vision) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El corpus de entrenamiento es mayoritariamente sintetico y generado por script; puede no reflejar la distribucion real del lenguaje natural ni cubrir dominios fuera de las tareas entrenadas.
- Algunos ejemplos de texto (identidad, frases de traduccion, hechos, rechazo y respuestas benignas) se redactaron con asistencia de IA y no fueron revisados por hablantes nativos, segun admite el autor.
- El japones es el idioma con peor rendimiento en las pruebas internas (14/20 in-domain, 16/20 en idioma correcto), por lo que no es recomendable para produccion en japones sin evaluacion adicional.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el autor recomienda revisar las salidas por exactitud y fiabilidad.
- Uso fuera de alcance declarado: decisiones medicas, legales o financieras sin supervision humana cualificada, generacion de contenido danino o enganoso y toma de decisiones automatizada de alto riesgo.
- No se documenta la longitud de contexto efectiva tras el ajuste; el entrenamiento uso secuencias de hasta 1536 tokens e imagenes de hasta 640 px, lo que puede limitar el rendimiento en entradas mas largas o de mayor resolucion.
- El modelo no debe confundirse con K-Oss 8 (120B), del que no es destilacion ni comparte pesos; asumir capacidades equivalentes seria un error.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-VL-8B-Instruct; conviene revisar dichos terminos.
- El repositorio tiene muy poca traccion (193 descargas, 1 like en el momento de la consulta), lo que reduce la validacion externa disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/K-Ai-Official/K-Oss-8-Mini-Instruct
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset sintetico del autor: https://huggingface.co/datasets/K-Ai-Official/kai_synth_v1
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset alpaca-gpt4-japanese: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-japanese
- Dataset alpaca-gpt4-indonesian: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-indonesian
- Unsloth (herramienta de ajuste fino): https://github.com/unslothai/unsloth
