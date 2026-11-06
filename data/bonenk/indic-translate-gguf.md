# Bonenk/indic-translate-GGUF

## Resumen

Indic Translate — GGUF es una cuantización para llama.cpp del modelo de traducción **indic-translate** desarrollado por Bodhan AI (Fundación IITM Bodhan-AI, Centro de Excelencia en IA para la Educación del Ministerio de Educación del Gobierno de India). El modelo original es un sistema especializado en traducción entre inglés y 15 lenguas del subcontinente indio (hindi, bengalí, tamil, telugu, kannada, malayalam, maratí, guyaratí, panyabí, oriya, asamés, urdu, nepalí, cingalés y sánscrito), una tarea donde los modelos generalistas suelen rendir por debajo de lo esperado.

Esta versión, publicada por el usuario Bonenk, convierte los pesos originales al formato GGUF para poder ejecutar el modelo localmente con llama.cpp, sin depender de GPUs de gama alta ni de servicios en la nube. El modelo base tiene 7.463 millones de parámetros (7,46 B) y está construido sobre la arquitectura `Gemma4ForConditionalGeneration`, de la que esta conversión conserva únicamente el decodificador de texto (684 tensores, arquitectura `gemma4`), descartando las torres de visión y audio al no ser relevantes para traducción.

Su relevancia actual radica en la combinación de tres factores: especialización en lenguas índicas con soporte de documentos completos de hasta 32k tokens de entrada, disponibilidad en formato GGUF con cuantizaciones desde 5,30 GB, y una licencia abierta que permite uso comercial (con matices). Es una opción práctica para despliegues locales de traducción de alta calidad hacia y desde lenguas de India.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4 (decodificador de texto; `Gemma4ForConditionalGeneration` en el modelo original) |
| Parametros totales | 7.463.019.050 (7,46 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | hasta 32k tokens de entrada (advertido por upstream); ejemplos usan 4096-8192 tokens |
| Tipos de cuantizacion | Q4_K_M (5,30 GB), Q6_K (6,17 GB), Q8_0 (7,97 GB), F16 (14,93 GB) |
| Idiomas soportados | inglés, hindi, bengalí, tamil, telugu, kannada, malayalam, maratí, guyaratí, panyabí, oriya, asamés, urdu, nepalí, cingalés, sánscrito (16 lenguas) |
| Licencia | Indic Open Model License v1.0 (license: other) |
| Formato de pesos | GGUF (convertido desde safetensors del modelo original) |

## Arquitectura y entrenamiento

El modelo base, `bodhan-ai/indic-translate`, utiliza la arquitectura `Gemma4ForConditionalGeneration`, un transformador condicional que originalmente incluía torres de visión y audio además del decodificador de texto. La conversión a GGUF realizada por Bonenk elimina esas torres multimodales y conserva únicamente el decodificador de texto (arquitectura `gemma4`, 684 tensores), suficiente para la tarea de traducción y con el beneficio de reducir el tamaño de los ficheros.

Los detalles del proceso de entrenamiento del modelo upstream (número de tokens, composición del corpus, uso de RLHF/DPO u otras técnicas de alineación) no están disponibles en la información proporcionada. Sí se documenta el proceso de conversión: se generó un fichero F16 de referencia a partir del snapshot upstream (revisión `3c5c3b4e2747b0fca133accf077132326c88b267`) con `convert_hf_to_gguf.py`, y a partir de él se derivaron las cuantizaciones Q8_0, Q6_K y Q4_K_M mediante `llama-quantize`. Los cuatro ficheros fueron verificados generando texto con `llama-cli` build b11798-9febe63d5.

## Capacidades

- Traducción de texto entre inglés y 15 lenguas índicas, con exposición de cada lengua y escritura mediante su nombre en el prompt (por ejemplo, `Hindi`, `Tamil`, `Bengali`, `Urdu`, `Konkani`).
- Traducción de documentos completos: la ventana de entrada de hasta 32k tokens permite procesar textos largos en una sola petición sin fragmentar.
- Salida determinista recomendada: los ejemplos del autor usan `--temp 0`, apropiado para traducción donde no se busca creatividad.
- Compatibilidad con el ecosistema llama.cpp: inferencia por línea de comandos (`llama-cli`) y servidor con API compatible con OpenAI (`llama-server`), lo que facilita la integración en aplicaciones.
- Formato GGUF con cuatro niveles de cuantización, permitiendo ajustar el equilibrio entre calidad, VRAM y velocidad.
- Solo texto: las capacidades de visión y audio del modelo original no están incluidas en esta conversión.

No hay información disponible sobre soporte de tool calling, capacidades de agente, razonamiento multi-paso ni generación de código; el modelo está especializado en traducción.

## Casos de uso

- **Localización de software y documentación hacia lenguas índicas:** equipos de producto pueden traducir cadenas de interfaz y documentación técnica al hindi, tamil o bengalí de forma local, evitando enviar contenido propietario a APIs de terceros.
- **Traducción de documentos largos por lotes:** con 32k tokens de entrada, se pueden traducir informes, artículos o contratos completos en una sola petición, ideal para pipelines de procesamiento documental.
- **API de traducción autoalojada:** mediante `llama-server` con endpoint compatible con OpenAI (`/v1/chat/completions`), se puede montar un servicio de traducción interno con Q4_K_M en una sola GPU de consumo.
- **Accesibilidad de contenidos educativos:** al tratarse de un modelo impulsado por el Ministerio de Educación de India, es especialmente adecuado para traducir material didáctico a lenguas regionales, incluidas lenguas con pocos recursos como sánscrito, cingalés o asamés.
- **Procesamiento de contenido en medios y comunicación:** redacciones que cubran noticias de India pueden traducir artículos en lenguas locales al inglés para su posterior edición.
- **Integración en aplicaciones móviles o de escritorio offline:** el tamaño de 5,30 GB en Q4_K_M permite ejecutar el modelo en estaciones de trabajo con GPUs de consumo, útil en entornos sin conectividad fiable.
- **Preprocesamiento para análisis multilingüe:** como paso previo en pipelines de NLP, traducir corpus en lenguas índicas al inglés antes de aplicar herramientas de análisis que solo funcionan bien en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de traducción (BLEU, COMET, chrF) ni comparativas con otros sistemas de traducción.

## Requisitos de hardware

- **VRAM estimada para inferencia (con descarga completa a GPU, `-ngl 99`):**
  - Q4_K_M: 5,30 GB de pesos; con contexto y overhead, en torno a 6-7 GB de VRAM.
  - Q6_K: 6,17 GB de pesos; en torno a 7-8 GB de VRAM.
  - Q8_0: 7,97 GB de pesos; en torno a 9-10 GB de VRAM.
  - F16: 14,93 GB de pesos; requiere 16 GB o más de VRAM.
- **GPUs recomendadas:** una RTX 4060 Ti de 16 GB o RTX 4090 ejecuta cómodamente cualquier cuantización; para F16 con contexto largo, una RTX 4090 (24 GB) o una A100 son opciones seguras. También es viable la ejecución parcial o total en CPU dado el tamaño moderado del modelo.
- **Cabe en GPUs de consumo:** sí. Q4_K_M y Q6_K caben en GPUs de 8 GB (RTX 3060 Ti, RTX 4060); Q8_0 en GPUs de 12 GB; F16 en GPUs de 16 GB o superiores.
- **Opciones de despliegue:** llama.cpp es la vía documentada (`llama-cli` y `llama-server` con API compatible con OpenAI). Al ser GGUF, también debería funcionar con Ollama y LM Studio, aunque no se menciona explícitamente en la model card. No hay datos sobre vLLM o TGI para esta conversión.
- **Latencia y throughput:** no disponibles. Para un modelo de 7,46 B en Q4_K_M con descarga completa a GPU, pueden esperarse decenas de tokens por segundo en una GPU de consumo moderna, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Lenguas | Contexto | Licencia |
|---|---|---|---|---|---|
| Indic Translate (GGUF) | 7,46 B | GGUF (Q4_K_M a F16) | 16 (inglés + 15 índicas) | hasta 32k entrada | Indic Open Model License v1.0 (uso comercial permitido con restricciones de hosting) |
| NLLB-200 (Meta) | 1,3 B / 3,3 B / 54 B (MoE) | PyTorch, CT2 | 200 lenguas (incluye varias índicas) | no disponible | CC-BY-NC 4.0 (no comercial) |
| IndicTrans2 (AI4Bharat) | 1 B / 4 B | PyTorch, safetensors | 22 lenguas índicas | no disponible | MIT (según repositorio AI4Bharat) |

Indic Translate destaca frente a NLLB-200 en especialización índica y ventana de contexto para documentos, y frente a IndicTrans2 en disponibilidad nativa GGUF para inferencia local con llama.cpp. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- **Restricciones de licencia relevantes:** la Indic Open Model License v1.0 permite el uso y la redistribución, incluido el uso comercial, pero **prohíbe el alojamiento de terceros** (inferencia vía API o servicios hosted) sin aprobación previa por escrito del licensor, y establece condiciones para usos de producto a muy gran escala. Es imprescindible revisar el texto de la licencia antes de cualquier despliegue público.
- **Solo texto:** la conversión GGUF elimina las torres de visión y audio del modelo original; no puede procesar imágenes ni audio.
- **Riesgo de alucinación:** no cuantificado. En modelos de traducción generativos existe el riesgo de omitir u añadir contenido, especialmente en textos largos o con terminología especializada; se recomienda validación humana en flujos críticos.
- **Cobertura lingüística limitada a 16 lenguas:** no sirve para otras lenguas índicas no incluidas (por ejemplo, no aparece cachemiro en la lista) ni para pares entre dos lenguas índicas sin pasar por el inglés, algo que no se documenta en la model card.
- **Calidad según cuantización:** Q4_K_M es la opción más ligera pero puede degradar la calidad respecto a F16; para producción se sugiere evaluar Q6_K o Q8_0.
- **Sesgos:** no hay información publicada sobre sesgos del modelo; al tratarse de un modelo entrenado para lenguas de India, puede reflejar sesgos presentes en los corpus de entrenamiento, cuya composición no está documentada aquí.
- **Adopción temprana:** el repositorio tiene muy pocas descargas (22) y un solo like, sin comunidad de pruebas; conviene validar el comportamiento en el propio caso de uso antes de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Bonenk/indic-translate-GGUF
- Modelo original (upstream): https://huggingface.co/bodhan-ai/indic-translate
- Licencia Indic Open Model License v1.0: https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md
- Web de Bodhan AI: https://bodhan.ai
- Artículo técnico, demo y paper: no disponibles
