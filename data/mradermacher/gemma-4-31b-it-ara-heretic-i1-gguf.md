# mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF` es una cuantizacion GGUF del modelo `richardyoung/gemma-4-31B-it-ARA-heretic`, una variante "heretic" (abliterated/decensored) del Gemma 4 31B instruction-tuned de Google. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF conocido por publicar versiones imatrix de modelos populares. El modelo base parte de la familia Gemma 4 de Google, con aproximadamente 30.700 millones de parametros en formato safetensors, y ha sido modificado mediante tecnicas de abliteration para eliminar los rechazos de contenido.

La relevancia de esta ficha radica en que combina tres cosas: el rendimiento de un modelo de 31B de la familia Gemma 4, una ventana de cuantizaciones muy amplia (desde IQ1_S de 7,3 GB hasta Q6_K de 25,3 GB) y un comportamiento "uncensored" que lo hace interesante para investigacion sobre alineamiento, red-teaming y despliegues donde el filtrado por defecto resulta demasiado restrictivo. El repo incluye tanto quants estaticos (en repositorio aparte) como quants ponderados con imatrix (i1), que suelen ofrecer mejor relacion calidad/tamano que los estaticos equivalentes.

Conviene senalar desde el principio que se trata de un modelo en ingles, con licencia declarada Apache-2.0 en la model card aunque el enlace de licencia apunta a la licencia de Gemma 4 de Google, lo que genera cierta ambiguedad juridica que hay que revisar antes de un uso comercial. No se han publicado benchmarks propios en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4); detalles internos no disponibles |
| Parametros totales | 30.697.345.596 (30,7 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (i1 con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 declarada; enlace a licencia de Gemma 4 de Google |
| Formato de pesos | GGUF (quants i1 con imatrix); el modelo base en safetensors |
| Vision | si, modelo multimodal (mmproj en el repositorio estatico) |
| Tamano del repo | 334,8 GB |

## Arquitectura y entrenamiento

El modelo base es `richardyoung/gemma-4-31B-it-ARA-heretic`, una modificacion del Gemma 4 31B instruction-tuned de Google. La tecnica "heretic" implica abliteration: se identifican direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y se proyectan fuera, de modo que el modelo deja de negarse a responder a ciertos prompts sin necesidad de reentrenar desde cero. El resultado es un modelo que conserva las capacidades del original pero con el filtrado de contenido suavizado o eliminado. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento ni sobre la composicion del dataset de la variante heretic.

Esta publicacion concreta de mradermacher es una cuantizacion, no un entrenamiento: aplica cuantizacion con imatrix (i1) sobre el modelo base, generando una matriz de importancia a partir de datos de calibracion para preservar mejor los pesos relevantes en cada nivel de bits. Los quants i1 suelen batir a los estaticos de tamano similar en perplejidad. El autor indica que es un modelo de vision y que los ficheros mmproj, si existen, estan en el repositorio estatico. No se detalla la innovacion tecnica adicional mas alla de la abliteration y la cuantizacion imatrix.

## Capacidades

- Generacion de texto conversacional en ingles, con modo instruction-tuned heredado de Gemma 4.
- Razonamiento y respuesta a preguntas de caracter general.
- Capacidad multimodal de vision (el modelo base es un modelo de vision; los mmproj estan en el repositorio estatico).
- Comportamiento "uncensored"/abliterated: responde a prompts que el Gemma 4 original rechazaria.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidad especial: al ser un modelo "heretic", es util para estudiar el comportamiento de modelos abliterated y para red-teaming.

## Casos de uso

- Investigacion sobre alineamiento y abliteration: comparar las respuestas del modelo heretic con las del Gemma 4 original para medir que capacidades se conservan y cuales se degradan tras eliminar los rechazos.
- Red-teaming y evaluacion de seguridad: usar el modelo como generador de prompts y respuestas adversarias en pipelines de evaluacion de filtros y clasificadores de contenido.
- Despliegue local en estaciones de trabajo con GPU consumer: los quants Q4_K_S (17,9 GB) y Q4_K_M (18,8 GB) caben en GPUs de 24 GB como la RTX 4090, permitiendo inferencia local de un modelo de 31B sin depender de la nube.
- Prototipado rapido de asistentes conversacionales en ingles: el quant Q4_K_M ofrece un equilibrio razonable entre calidad y velocidad para iterar sobre prompts y flujos conversacionales.
- Analisis de documentos e imagenes en entornos controlados: al ser un modelo de vision, puede procesar capturas o figuras junto con texto, siempre que se carguen los mmproj del repositorio estatico.
- Experimentacion con cuantizaciones extremas: los quants IQ1_S (7,3 GB) e IQ2_XXS (8,8 GB) permiten ejecutar el modelo en GPUs de 8-12 GB, utiles para estudiar la degradacion de calidad en regimenes de muy baja precision.
- Generacion de contenido creativo sin filtros: para proyectos editoriales o de ficcion donde el filtrado por defecto resulta limitante, con la advertencia de que el contenido generado no esta moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni comparaciones con el Gemma 4 original o con otros modelos de 31B.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): aproximadamente el tamano del fichero GGUF mas un margen de 1-3 GB para KV cache y buffers.
  - IQ1_S (7,3 GB): ~9-10 GB de VRAM.
  - IQ2_M (11,0 GB): ~13-14 GB.
  - IQ3_M (14,5 GB): ~16-17 GB.
  - Q4_K_M (18,8 GB): ~21-23 GB.
  - Q5_K_M (21,9 GB): ~24-26 GB.
  - Q6_K (25,3 GB): ~28-30 GB.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M y Q4_K_S comodos; Q5_K_M al limite.
  - RTX 3090 (24 GB): mismo perfil que la 4090 con menor throughput.
  - A100 40 GB / H100 80 GB: Q6_K y margen amplio para contexto largo.
  - GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 12 GB o mas, usando quants bajos; con 24 GB se accede a Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF (el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo TGI/OpenAI). vLLM soporta GGUF de forma experimental; para maxima compatibilidad, llama.cpp es la opcion natural.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-ARA-heretic-i1-GGUF (este) | 30,7 B | no disponible | Apache-2.0 (con enlace a licencia Gemma 4) | GGUF i1 | Vision, heretic, solo ingles |
| richardyoung/gemma-4-31B-it-ARA-heretic | 30,7 B | no disponible | no disponible | safetensors | Modelo base sin cuantizar |
| Gemma 4 31B it (original de Google) | ~31 B | no disponible | licencia Gemma 4 | safetensors | Version alineada, con filtrado de contenido |
| mradermacher/gemma-4-31B-it-ARA-heretic-GGUF | 30,7 B | no disponible | Apache-2.0 | GGUF estatico | Variante sin imatrix, incluye mmproj de vision |

La comparativa con otros modelos de 31B abliterated de otras familias no se puede completar con rigor porque la informacion proporcionada no incluye datos de rendimiento ni de contexto de alternativas.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: no aplica el filtrado de seguridad del Gemma 4 original; puede generar contenido danino, ofensivo o ilegal. No apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, citas y datos; la abliteration no corrige este problema y puede agravarlo en dominios sensibles.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Contexto: no se ha publicado la longitud de contexto; no asumir ventanas largas sin verificarlo con el modelo base.
- Licencia: la model card declara Apache-2.0 pero enlaza a la licencia de Gemma 4 de Google, que impone restricciones de uso comercial y de redistribucion. Hay que revisar ambos documentos antes de un despliegue comercial; la ambiguedad es un riesgo juridico real.
- Calidad en quants bajos: IQ1_S e IQ2_XXS degradan notablemente la calidad; el propio autor los etiqueta como "for the desperate" y "mostly desperate".
- Vision: los ficheros mmproj no estan en este repositorio i1, sino en el estatico; hay que descargarlos aparte para usar la capacidad multimodal.
- Reproducibilidad: el autor etiqueta el modelo como reproducible, pero no se detalla el dataset de calibracion del imatrix ni el proceso exacto de abliteration del modelo base.
- Solo 2 likes y 19.999 descargas en el momento de la ficha: comunidad pequena, poca validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF
- Modelo base: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Quants estaticos (incluye mmproj): https://huggingface.co/mradermacher/gemma-4-31B-it-ARA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-31B-it-ARA-heretic-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/ (enlace truncado en la model card)
