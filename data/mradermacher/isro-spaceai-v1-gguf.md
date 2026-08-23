# mradermacher/isro-spaceai-v1-GGUF

## Resumen

`isro-spaceai-v1-GGUF` es una colección de cuantizaciones en formato GGUF del modelo `Anoopsingh53/isro-spaceai-v1`, un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6B) especializado en dominios espaciales, astrofísica, oceanografía y teledetección. El modelo base fue entrenado mediante QLoRA sobre dos conjuntos de datos específicos: `UniverseTBD/arxiv-qa-astro-ph`, que contiene preguntas y respuestas sobre artículos de astrofísica, y `Anoopsingh53/isro-space-ocean-dataset`, orientado a datos oceánicos y de observación de la Tierra. Esta versión GGUF, publicada por mradermacher, permite ejecutar el modelo en entornos locales con llama.cpp, Ollama u otras herramientas compatibles, sin necesidad de infraestructura en la nube.

La relevancia actual de este modelo radica en su enfoque temático: cubre misiones espaciales indias como Chandrayaan y Aditya-L1, así como temas de heliofísica, exoplanetas y radar de apertura sintética (SAR). Su licencia Apache-2.0 facilita su uso comercial e investigación, y el formato GGUF con múltiples niveles de cuantización ofrece flexibilidad para desplegarlo en hardware variado, desde CPU hasta GPU de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 7,6B parámetros) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, hi (inglés e hindi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (convertido desde safetensors del modelo base) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base no se especifica en la información proporcionada. Por el número de parámetros (7,6B) y el uso de QLoRA, es probable que se trate de un transformer de tipo Llama o Mistral, pero este dato no está confirmado. El entrenamiento se realizó mediante QLoRA (técnica de fine-tuning eficiente que combina cuantización de 4 bits con adaptadores LoRA), lo que permite adaptar modelos grandes con recursos limitados.

Los datos de entrenamiento provienen de dos fuentes: `arxiv-qa-astro-ph`, un conjunto de pares de preguntas y respuestas generados a partir de artículos del repositorio arXiv en el campo de astrofísica, y `isro-space-ocean-dataset`, que incluye datos de observación oceánica y de misiones de ISRO (Organización de Investigación Espacial de la India). No se indican los tokens totales de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto especializada en astrofísica, astronomía y cosmología, con capacidad para responder preguntas basadas en artículos científicos.
- Comprensión y generación de contenido sobre misiones espaciales indianas (Chandrayaan, Aditya-L1) y datos de observación terrestre (Oceansat, Sentinel-1).
- Soporte de conceptos de heliofísica y meteorología espacial, incluyendo fenómenos como erupciones solares.
- Capacidad multilingüe en inglés e hindi, lo que permite consultas en ambos idiomas.
- Se mencionan tags de multimodalidad y sonificación, aunque no se detalla una implementación concreta de visión o audio.
- No se confirma soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Asistente de investigación en astrofísica: el modelo puede responder preguntas técnicas sobre artículos científicos del arXiv, facilitando la revisión rápida de literatura y la generación de resúmenes de conceptos complejos.
- Documentación y divulgación de misiones espaciales: útil para redactar material educativo sobre misiones como Chandrayaan-3 o Aditya-L1, adaptando el contenido a un público general o técnico.
- Análisis de datos de observación de la Tierra: procesar y explicar datos de satélites como Oceansat-3 o Sentinel-1, ayudando a interpretar imágenes SAR o métricas de inundaciones.
- Soporte en investigación de oceanografía: generar descripciones de condiciones oceánicas a partir de datos de calcofi o modelos climáticos, apoyando el trabajo de oceanógrafos.
- Chatbot multilingüe para información espacial: desplegar en una web o aplicación de consulta sobre el programa espacial indio, atendiendo usuarios en inglés e hindi.
- Generación de informes técnicos en el sector aeroespacial: redactar informes de viabilidad, análisis de datos de telemetría o resúmenes de eventos solares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo base en f16 pesa 15,3 GB, por lo que requiere una GPU con al menos 16 GB de VRAM para inferencia sin cuantizar.
- Las cuantizaciones Q4_K_S y Q4_K_M (4,6 y 4,8 GB respectivamente) son las recomendadas para un equilibrio entre calidad y memoria, ejecutándose en GPUs de 8 GB de VRAM como la RTX 3060 o RTX 4060.
- La versión Q2_K (3,1 GB) puede ejecutarse en GPUs de 4 GB de VRAM, aunque con pérdida de calidad.
- Para CPU, las cuantizaciones Q4_K_M y Q5_K_M son las más adecuadas con llama.cpp, funcionando con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, y cualquier frontend compatible con GGUF.
- La latencia variará según el hardware; en una GPU RTX 4090 se espera un throughput de 50-80 tokens por segundo con Q4_K_M, mientras que en CPU se reduce a 5-15 tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas específicas de la misma categoría (modelos de 7B especializados en astrofísica). La información proporcionada no incluye benchmarks ni especificaciones de otros modelos comparables.

## Limitaciones y advertencias

- El modelo fue entrenado con un conjunto de datos limitado a astrofísica y oceanografía, por lo que su rendimiento en otros dominios es probablemente inferior.
- Riesgo de alucinación en respuestas técnicas, especialmente en temas fuera del dominio de entrenamiento.
- No se especifica la longitud de contexto, lo que puede limitar el procesamiento de documentos largos o conversaciones multi-turno.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base puede tener restricciones adicionales no documentadas en esta ficha.
- Los datos de entrenamiento incluyen artículos científicos y datos oceanográficos, pero no se han verificado posibles sesgos geográficos o de idioma.
- La fecha de creación del modelo (2026-08-22) es futura, lo que sugiere que puede estar en fase experimental o no probado en producción.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/isro-spaceai-v1-GGUF
- Modelo base: https://huggingface.co/Anoopsingh53/isro-spaceai-v1
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
