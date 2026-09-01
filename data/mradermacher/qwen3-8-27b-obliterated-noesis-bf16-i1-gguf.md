# mradermacher/Qwen3.8-27B-Obliterated-NOESIS-BF16-i1-GGUF

## Resumen

El modelo `Qwen3.8-27B-Obliterated-NOESIS-BF16-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16`, preparada por mradermacher. Se trata de una versión "obliterated" (abliterada) de un modelo de la familia Qwen3.8 con 27 320 697 856 parámetros (aproximadamente 27,3 mil millones), diseñada para eliminar mecanismos de censura y restricciones de seguridad del modelo original, lo que la hace adecuada para investigación en alineación, red teaming y aplicaciones que requieren generación de texto sin filtros.

La cuantización está optimizada para ejecución local en hardware de consumo, con varios niveles de compresión (Q2_K, IQ3_M, Q4_K_S) que permiten ajustar el equilibrio entre tamaño, velocidad y calidad. El modelo soporta seis idiomas (inglés, ruso, chino, japonés, kazajo y vietnamita) y, según la model card, es un modelo de visión, aunque los archivos de proyección multimodal (mmproj) se encuentran en el repositorio estático asociado. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece una alternativa sin censura para tareas de generación creativa o investigación en seguridad de IA; por otro, su formato GGUF con imatrix facilita el despliegue en entornos locales con GPUs de gama media, algo poco común en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (ademas de archivo imatrix) |
| Idiomas soportados | en, ru, zh, ja, kk, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. El nombre sugiere que pertenece a la familia Qwen3.8, que en general emplea arquitecturas transformer con atencion por capas, pero no se confirma en la documentacion proporcionada. Tampoco hay datos sobre el proceso de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO). La unica informacion relevante es que el modelo ha sido sometido a un proceso de "abliteracion" (obliteration) para eliminar capas de rechazo o censura, y que la cuantizacion actual utiliza imatrix para mejorar la calidad de los quants de baja precision.

## Capacidades

- Generacion de texto y chat conversacional en seis idiomas (en, ru, zh, ja, kk, vi).
- Capacidades de vision (segun la model card), aunque los archivos de proyeccion multimodal se encuentran en el repositorio estatico y no en este.
- Al ser una version "obliterated", presenta una reduccion significativa de los mecanismos de rechazo, lo que permite generar contenido que otros modelos censurarian.
- Compatible con herramientas de inferencia que soporten GGUF, como llama.cpp, Ollama o LM Studio.
- Soporte de cuantizacion con imatrix, que mejora la perplejidad en quants de baja precision.

## Casos de uso

- Investigacion en seguridad de IA y red teaming: el modelo permite probar vulnerabilidades en sistemas de moderacion o generar contenido adversarial para evaluar clasificadores.
- Generacion de texto creativo sin restricciones: escritura de ficcion, poesia o guiones donde se requiera explorar temas tabu o controversiales.
- Chatbot local para entornos sin conexion: gracias a su formato GGUF y cuantizaciones de bajo peso, puede desplegarse en una estacion de trabajo con GPU de 16 GB para conversaciones privadas.
- Analisis de contenido multilingue: al soportar seis idiomas, puede utilizarse para tareas de traduccion informal o generacion de resumenes en esos idiomas.
- Prototipado rapido de aplicaciones de IA generativa: su licencia Apache 2.0 y su facil integracion con frameworks como llama.cpp permiten iterar rapidamente en demos.
- Evaluacion de tecnicas de cuantizacion: al ser un modelo de 27B con imatrix, es util para comparar el impacto de diferentes niveles de cuantizacion en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_S ocupa 15,9 GB, por lo que se recomienda una GPU con al menos 16 GB de VRAM para cargarlo completo. El Q2_K (11,0 GB) podria caber en una GPU de 12 GB, aunque con margen limitado.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), o GPUs profesionales como A100 (40 GB) para mayor comodidad.
- Si cabe en consumer GPU: si, en GPUs de 16 GB o 24 GB, dependiendo de la cuantizacion elegida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Tambien puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se dispone de datos concretos, pero en una RTX 4090 con Q4_K_S se espera una velocidad de generacion de entre 20 y 40 tokens por segundo, segun la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. El modelo base (Qwen3.8-27B) pertenece a la familia Qwen, pero no se conocen datos de rendimiento relativos a otros modelos de 27B como Llama 3.1 27B o Mistral 24B. Se recomienda consultar benchmarks publicos de Qwen3.8 para una comparacion mas precisa.

## Limitaciones y advertencias

- Al ser un modelo "obliterated", puede generar contenido ofensivo, ilegal o eticamente cuestionable. Su uso debe limitarse a entornos controlados y con fines de investigacion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en contextos largos o ambiguos.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que puede limitar su uso en tareas que requieran ventanas largas.
- La cuantizacion de baja precision (Q2_K) puede degradar notablemente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- Aunque la licencia es Apache 2.0, el uso comercial de contenido generado por el modelo puede estar sujeto a regulaciones locales sobre contenido inapropiado.
- No se han publicado resultados de benchmarks, por lo que su rendimiento real en tareas estandar es desconocido.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/mradermacher/Qwen3.8-27B-Obliterated-NOESIS-BF16-i1-GGUF)
- [Modelo base: AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16](https://huggingface.co/AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16)
- [Repositorio estatico con quants y archivos mmproj](https://huggingface.co/mradermacher/Qwen3.8-27B-Obliterated-NOESIS-BF16-GGUF)
- [Guia para ejecutar Qwen3.8-27B-OBLITERATED localmente (MindStudio)](https://www.mindstudio.ai/blog/run-qwen3-8-27b-obliterated-locally)
- [Pagina de descarga de GGUF en local-ai-zone](https://local-ai-zone.github.io/models/qwen3-8-27b-obliterated.html)
- [Articulo sobre como ejecutar Qwen 3.8 27B localmente (locallyuncensored)](https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html)
