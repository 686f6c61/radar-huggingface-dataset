# mradermacher/en-indic-translate-2b-GGUF

## Resumen

El modelo `mradermacher/en-indic-translate-2b-GGUF` es una version cuantizada en formato GGUF del modelo `sulabhkatiyar/en-indic-translate-2b`, un modelo de traduccion automatica entre ingles y diez lenguas indicas (asames, bengali, gujarati, hindi, kannada, malayalam, marathi, oriya, punjabi, tamil y telugu). El modelo base esta construido sobre una arquitectura Gemma, como indican la licencia `gemma` y la etiqueta `gemma4`. A pesar de su nombre, el modelo tiene 4.647.450.147 parametros (aproximadamente 4.650 millones), lo que sugiere que la denominacion "2b" no refleja el tamano real o que se refiere a otra metrica.

La cuantizacion GGUF, realizada por mradermacher, permite ejecutar el modelo en hardware de consumo con distintos niveles de precision y consumo de memoria. Se ofrecen 12 cuantizaciones, desde Q2_K (3.1 GB) hasta f16 (9.4 GB), ademas de dos ficheros `mmproj` para soporte multimodal (aunque no esta claro si el modelo base es multimodal). Esta version es relevante para desarrolladores que necesitan un modelo de traduccion para lenguas indicas con despliegue eficiente en CPU o GPU mediante herramientas como llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador basado en Gemma (etiqueta `gemma4`); detalles exactos no disponibles |
| Parametros totales | 4.647.450.147 |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, as, bn, gu, hi, kn, ml, mr, or, pa, ta, te |
| Licencia | Gemma |
| Formato de pesos | GGUF (el modelo base original usa safetensors) |

Nota: El nombre del modelo indica "2b", pero los parametros reales son 4.647 millones. Esta discrepancia debe tenerse en cuenta.

## Arquitectura y entrenamiento

El modelo base `sulabhkatiyar/en-indic-translate-2b` es un modelo de traduccion construido sobre la arquitectura Gemma, segun la licencia y la etiqueta `gemma4` en el repositorio. No se dispone de informacion detallada sobre la arquitectura interna (numero de capas, dimensiones, mecanismos de atencion) ni sobre los datos de entrenamiento. La model card del cuantizador no incluye detalles sobre el proceso de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. Por tanto, estos aspectos se consideran "no disponibles".

La unica innovacion tecnica destacable es la cuantizacion GGUF, que reduce el peso del modelo mediante cuantizacion de 2 a 16 bits, permitiendo su ejecucion en sistemas con recursos limitados. El fichero `mmproj` sugiere un posible soporte multimodal, aunque no se confirma en la informacion proporcionada.

## Capacidades

- Traduccion automatica entre ingles y diez lenguas indicas: asames (as), bengali (bn), gujarati (gu), hindi (hi), kannada (kn), malayalam (ml), marathi (mr), oriya (or), punjabi (pa), tamil (ta) y telugu (te).
- Modelo especializado en traduccion; no se mencionan capacidades de generacion libre, razonamiento, codigo, matematicas ni vision.
- No se dispone de informacion sobre soporte de tool calling, function calling ni agentes.
- No se dispone de informacion sobre un modo de pensamiento ("thinking mode") ni capacidades de audio.
- El formato GGUF permite su uso en entornos de inferencia como llama.cpp, Ollama o LM Studio, con cuantizacion ajustable.

## Casos de uso

- Traduccion de documentos legales y administrativos entre ingles e idiomas indicos: el modelo puede procesar contratos, notificaciones y textos oficiales, gracias a su especializacion en traduccion. La cuantizacion Q8_0 ofrece la mejor calidad dentro de un consumo de memoria moderado.
- Localizacion de aplicaciones y sitios web para el mercado indio: se puede integrar en pipelines de traduccion para generar versiones en hindi, tamil, bengali y otros idiomas. El formato GGUF facilita el despliegue en servidores con CPU mediante llama.cpp.
- Atencion al cliente multilingue: el modelo puede traducir mensajes de clientes entre ingles y lenguas indicas en tiempo real, permitiendo a un agente monolingue responder en el idioma del usuario. La cuantizacion Q4_K_M ofrece un buen equilibrio entre velocidad y calidad.
- Traduccion de subtitulos para contenido audiovisual: al ser un modelo de traduccion, puede procesar textos largos de dialogos para generar subtitulos en varias lenguas indicas. Se recomienda cuantizacion Q5_K_M o superior para preservar la precision.
- Asistencia en traduccion para profesionales: como herramienta de post-edicion, el modelo puede generar una primera traduccion que un traductor humano revisa. La cuantizacion f16 es la mas precisa, aunque requiere mas memoria.
- Integracion en pipelines de NLP para procesamiento multilingue: el modelo puede usarse como componente de traduccion en sistemas de recuperacion de informacion, analisis de sentimiento o clasificacion de documentos en entornos multilingues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre metricas como BLEU, COMET, MMLU, HumanEval o GSM8K para este modelo. Tampoco se han encontrado comparaciones cuantitativas con otros modelos de traduccion en la documentacion proporcionada.

## Requisitos de hardware

- Los ficheros GGUF tienen los siguientes tamanos (segun la tabla del autor): Q2_K 3.1 GB, Q3_K_S 3.2 GB, Q3_K_M 3.3 GB, Q3_K_L 3.4 GB, IQ4_XS 3.4 GB, Q4_K_S 3.5 GB, Q4_K_M 3.5 GB, Q5_K_S 3.7 GB, Q5_K_M 3.7 GB, Q6_K 3.9 GB, Q8_0 5.1 GB, f16 9.4 GB.
- Para inferencia en GPU, se estima que la VRAM necesaria es aproximadamente el tamano del fichero mas 1-2 GB de overhead. Por tanto:
  - Q2_K a Q3_K: 4-5 GB de VRAM (por ejemplo, RTX 3060 de 12 GB o inferior).
  - Q4_K a Q6_K: 5-6 GB de VRAM (RTX 3060, RTX 4060, etc.).
  - Q8_0: 6-7 GB de VRAM (RTX 4070, RTX 3080, etc.).
  - f16: 10-11 GB de VRAM (RTX 4080, RTX 4090, A100, etc.).
- El modelo puede ejecutarse en CPU con llama.cpp, aunque la latencia sera mayor. Los requisitos de RAM son similares al tamano del fichero.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con backends de GGUF), y otros motores compatibles con GGUF. No se menciona soporte para vLLM o TGI en la informacion disponible.
- No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

La unica alternativa comparable encontrada en la busqueda web es IndicTrans2 de AI4Bharat. No se dispone de datos suficientes para comparar con otros modelos de traduccion indicos. La siguiente tabla recoge la informacion disponible:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| en-indic-translate-2b (este modelo) | 4.647M | No disponible | Gemma | GGUF | Traduccion en-ingles a 10 lenguas indicas |
| IndicTrans2 (AI4Bharat) | No disponible | No disponible | MIT | Fairseq | Traduccion entre ingles y 22 lenguas indicas; arquitectura transformer |

No se han publicado benchmarks comparativos, por lo que no es posible evaluar el rendimiento relativo.

## Limitaciones y advertencias

- Sesgos: no se dispone de informacion sobre sesgos especificos del modelo. Como modelo de traduccion, puede heredar sesgos de los datos de entrenamiento, pero no hay evaluacion publica.
- Riesgo de alucinacion: en traducciones ambiguas o con terminologia tecnica, el modelo puede generar traducciones incorrectas. No se ha evaluado su tasa de alucinacion.
- Limitaciones de contexto: la longitud de contexto no esta documentada. Se desconoce si el modelo puede manejar textos largos de manera eficiente.
- Licencia: la licencia Gemma impone condiciones de uso aceptable. Antes de un despliegue comercial, es obligatorio revisar los terminos de la licencia Gemma en el repositorio oficial.
- Discrepancia en el nombre: el modelo se llama "2b" pero tiene 4.647 millones de parametros, lo que puede causar confusion al dimensionar recursos.
- La cuantizacion degrada la calidad: las cuantizaciones mas agresivas (Q2_K, Q3_K) pueden reducir la precision de la traduccion. Se recomienda usar Q4_K_M o superior para tareas criticas.
- Modelo especializado: no debe usarse para tareas distintas de la traduccion, ya que no se ha entrenado para generacion general, razonamiento ni codigo.
- El fichero `mmproj` sugiere multimodalidad, pero no hay confirmacion de que el modelo base sea realmente multimodal. Debe verificarse antes de intentar usarlo con entradas de imagen o audio.

## Enlaces

- Repositorio del modelo GGUF: https://huggingface.co/mradermacher/en-indic-translate-2b-GGUF
- Modelo base original: https://huggingface.co/sulabhkatiyar/en-indic-translate-2b
- Pagina del cuantizador mradermacher: https://huggingface.co/mradermacher
- Proyecto IndicTrans2 (modelo similar de AI4Bharat): https://github.com/ai4bharat/IndicTrans2
