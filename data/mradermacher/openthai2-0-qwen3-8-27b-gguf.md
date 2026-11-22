# mradermacher/openthai2.0-qwen3.8-27b-GGUF

## Resumen

OpenThai 2.0 Qwen3.8 27B es un modelo vision-lenguaje especializado en tailandés, desarrollado por el equipo iapp y distribuido en formato GGUF por mradermacher. Se trata de un modelo de 27.320.697.856 parámetros (unos 27,3 mil millones) construido sobre una base Qwen3, orientado a tareas de OCR, comprensión de documentos y conversación en tailandés e inglés. Su relevancia radica en cubrir un nicho poco atendido: el procesamiento documental de alta calidad en tailandés, un idioma con escasez de modelos abiertos de gran tamaño.

La versión aquí descrita no es el modelo original, sino una cuantización estática en GGUF del modelo base `iapp/openthai2.0-qwen3.8-27b`, publicada por mradermacher, un conocido cuantizador de la comunidad. Esto permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos completos en safetensors.

El modelo combina capacidades de texto y visión (a través de un proyector multimodal `mmproj`), lo que lo habilita para tareas de lectura de documentos, extracción de información y respuesta a preguntas sobre imágenes. La licencia Apache 2.0 facilita su uso comercial, aunque la información pública disponible sobre el modelo base es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3, vision-lenguaje) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal en mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre (`qwen3.8-27b`) y la etiqueta `base_model:iapp/openthai2.0-qwen3.8-27b`, se infiere que deriva de la familia Qwen3, con un componente de visión que se distribuye como archivo `mmproj` separado en las cuantizaciones GGUF. El recuento exacto de parámetros en safetensors (27.320.697.856) confirma un tamaño de aproximadamente 27,3B, coherente con un modelo denso de esa escala.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Las etiquetas del repositorio (`ocr`, `document-understanding`, `vision-language`) sugieren un entrenamiento orientado a tareas documentales y multimodales, pero se trata de una inferencia a partir de metadatos, no de documentación técnica verificada.

## Capacidades

- Generación de texto conversacional en tailandés e inglés.
- Comprensión de documentos (document understanding): lectura, interpretación y extracción de información de documentos.
- OCR (reconocimiento óptico de caracteres), presumiblemente con soporte para texto tailandés.
- Procesamiento vision-lenguaje: el modelo acepta imágenes a través del proyector multimodal `mmproj`.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de documentos administrativos tailandeses: el modelo puede procesar imágenes de formularios, facturas y documentos oficiales para extraer campos estructurados, aprovechando su especialización en OCR y comprensión documental en tailandés.
- Extracción de datos de facturas y recibos: en un pipeline de contabilidad, se envían imágenes de facturas al modelo junto con una instrucción de extracción, y este devuelve los campos relevantes en formato estructurado, reduciendo la introducción manual de datos.
- Atención al cliente en tailandés: despliegue conversacional para responder consultas de usuarios en tailandés, con la posibilidad de derivar a inglés cuando sea necesario, gracias a su soporte bilingüe.
- Procesamiento de documentación legal o contractual: análisis de contratos y documentos legales en tailandés para resumir cláusulas o responder preguntas concretas sobre su contenido, usando la entrada multimodal de imágenes o PDF renderizados.
- Moderación y análisis de contenido visual con texto: revisión de imágenes que contienen texto en tailandés (carteles, capturas, documentos escaneados) para clasificar o extraer información.
- Asistente de accesibilidad documental: conversión de documentos escaneados en tailandés a texto consultable y resúmenes, útil para archivos y bibliotecas que digitalizan fondos en ese idioma.
- Despliegue en local con llama.cpp: al estar disponible en GGUF con cuantizaciones desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), permite ejecutar el modelo en estaciones de trabajo sin GPU de datacenter, útil para prototipado y entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización GGUF, más el proyector multimodal de 0,7-1,0 GB):
  - Q2_K: ~11,0 GB de pesos; requiere aproximadamente 13-14 GB de VRAM considerando overhead de contexto.
  - Q3_K_M: ~13,6 GB; en torno a 15-17 GB de VRAM.
  - Q4_K_M: ~16,9 GB; en torno a 19-21 GB de VRAM.
  - Q5_K_M: ~19,6 GB; en torno a 22-24 GB de VRAM.
  - Q6_K: ~22,5 GB; en torno a 25-27 GB de VRAM.
  - Q8_0: ~29,1 GB; requiere 32 GB o más de VRAM, o descarga parcial a CPU.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 3090 (24 GB) para cuantizaciones Q4.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con Q4_K_M o IQ4_XS; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido, o con offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y servidores compatibles con GGUF; para el modelo base en safetensors, vLLM o TGI si el soporte de la arquitectura está disponible (no confirmado).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OpenThai 2.0 Qwen3.8 27B (este) | 27,3B | no disponible | th, en | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-VL 7B | 7B | no disponible en esta ficha | multilingüe | Apache 2.0 | safetensors, GGUF (comunidad) |
| Qwen2.5-VL 32B | ~32B | no disponible en esta ficha | multilingüe | Apache 2.0 | safetensors, GGUF (comunidad) |
| Typhoon (familia tailandesa de SCB 10X) | variable | no disponible | th, en | variable según versión | safetensors, GGUF |

La comparación con modelos tailandeses específicos como la familia Typhoon no puede completarse con datos verificados en la información disponible; se indica como referencia de categoría, no como comparación cuantitativa. No se dispone de resultados de benchmarks comparativos para este modelo.

## Limitaciones y advertencias

- La información pública sobre el modelo base es muy escasa: no hay datos verificados de arquitectura, contexto, dataset ni alineación.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en OCR y extracción de campos, donde los errores pueden ser difíciles de detectar sin validación posterior.
- Cobertura lingüística limitada a tailandés e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad, algo especialmente crítico en tareas de OCR y lectura de texto fino en imágenes.
- El proyector multimodal se distribuye como archivo separado (`mmproj`); es necesario descargarlo y configurarlo correctamente para usar las capacidades de visión.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base `iapp/openthai2.0-qwen3.8-27b` antes de un despliegue comercial, ya que la ficha de la cuantización no sustituye a la del modelo original.
- El repositorio tiene un tamaño de 190,8 GB por incluir todas las cuantizaciones; la descarga selectiva de un único archivo es imprescindible en entornos con ancho de banda limitado.
- No hay datos publicados de benchmarks, por lo que no se puede avalar su rendimiento frente a alternativas sin evaluación propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/openthai2.0-qwen3.8-27b-GGUF
- Modelo base: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/openthai2.0-qwen3.8-27b-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#openthai2.0-qwen3.8-27b-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
