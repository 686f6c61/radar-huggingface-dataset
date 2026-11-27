# mradermacher/gemma-4-31B-it-scotoma-2-heretic-i1-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-scotoma-2-heretic-i1-GGUF` es una cuantizacion en formato GGUF del modelo `sh0ck0r/gemma-4-31B-it-scotoma-2-heretic`, un derivado afinado de la familia Gemma 4 de Google en su variante instruct de 31B. El autor de la cuantizacion, mradermacher, es un conocido publicador de quants GGUF en Hugging Face que emplea tecnicas de imatrix (importance matrix) para preservar la calidad del modelo original al comprimirlo. El modelo base incorpora las etiquetas `heretic`, `uncensored`, `decensored` y `abliterated`, lo que indica que ha sido sometido a un proceso de eliminacion o atenuacion de los mecanismos de rechazo (refusal) tipicos de los modelos alineados.

El modelo resuelve el problema de ejecutar un modelo de ~30.700 millones de parametros en hardware de consumo o en entornos con VRAM limitada, ofreciendo cuantizaciones desde Q2_K (12 GB) hasta Q4_K_S (17,9 GB), ademas de variantes IQ de mayor eficiencia. Es relevante para desarrolladores que necesitan un modelo conversacional grande, multilingue (aunque el autor declara solo ingles) y sin restricciones de contenido, ejecutable localmente con llama.cpp u Ollama.

La arquitectura subyacente es la de Gemma 4 (transformer denso, no MoE), con 30.697.345.596 parametros totales confirmados en los safetensors del modelo base. El contexto, los datos de entrenamiento y los benchmarks no estan documentados en la informacion disponible. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los terminos de Gemma 4 de Google, lo que introduce una ambiguedad relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4), segun modelo base |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 (con enlace a licencia Gemma 4 de Google) |
| Formato de pesos | GGUF (imatrix/i1); safetensors en el modelo base |
| Tamano del repo | 56,2 GB |
| Vision | si (modelo multimodal; mmproj en repositorio estatico) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 en variante instruct (31B). La cuantizacion aqui presentada emplea el metodo i1 de mradermacher, que combina cuantizacion por bloques con una importance matrix (imatrix) generada a partir de datos de calibracion para minimizar la perdida de perplejidad en las capas mas sensibles. El repositorio incluye el fichero imatrix para que otros puedan generar sus propias cuantizaciones.

El modelo base `sh0ck0r/gemma-4-31B-it-scotoma-2-heretic` ha sido sometido a un proceso de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) y afinado adicional, segun indican las etiquetas `heretic`, `uncensored` y `decensored`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO en el modelo original. La model card no documenta innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y respuesta a instrucciones (variante instruct).
- Capacidad de vision: el modelo es multimodal y los ficheros mmproj estan en el repositorio estatico del autor.
- Comportamiento "uncensored"/"abliterated": menor probabilidad de rechazar peticiones que los modelos alineados estandar.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo se declara ingles; el resto no disponible.
- Modo thinking explicito: no documentado.

## Casos de uso

- **Ejecucion local en estaciones de trabajo con GPU de consumo**: con la cuantizacion Q4_K_S (17,9 GB) el modelo cabe en GPUs con 24 GB de VRAM (RTX 4090, RTX 3090), permitiendo conversaciones privadas sin envio de datos a la nube.
- **Investigacion sobre alineacion y refusal**: el caracter abliterated permite estudiar como varian las respuestas al eliminar direcciones de rechazo, util en trabajos de interpretabilidad y seguridad.
- **Generacion de contenido creativo sin filtros**: escritura de ficcion, guiones o narrativa que requiera tematicas que los modelos alineados rechazan, con la advertencia de revision humana.
- **Prototipado de asistentes conversacionales en ingles**: integracion via llama.cpp u Ollama para iterar rapidamente en prompts y flujos multi-turno con un modelo de 31B.
- **Procesamiento de imagenes en local (vision)**: uso de los ficheros mmproj para tareas de descripcion de imagenes o VQA en entornos aislados, siempre que se descargue el repositorio estatico.
- **Benchmarking de cuantizaciones**: comparar la calidad de Q2_K, IQ3_M y Q4_K_S sobre una misma tarea para elegir el compromiso tamano/calidad adecuado.
- **Despliegue en servidores con multiples GPUs pequenas**: reparto del modelo entre varias GPUs mediante llama.cpp con offloading por capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (segun cuantizacion):
  - i1-Q2_K: ~12,0 GB
  - i1-IQ3_M: ~14,5 GB
  - i1-Q4_K_S: ~17,9 GB
  - Otras variantes (Q5, Q6, IQ4) no listadas con tamano en la model card.
- **GPU recomendadas**: RTX 4090 / RTX 3090 (24 GB) para Q4_K_S con margen para contexto; A100 40 GB o H100 para cuantizaciones superiores o contexto largo.
- **Cabe en consumer GPU**: si, en GPUs de 16-24 GB con cuantizaciones Q2_K a Q4_K_S; en GPUs de 12 GB solo con Q2_K ajustando contexto.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa (requeririan el modelo base en safetensors).
- **Latencia y throughput**: no disponibles; dependen de la GPU y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-scotoma-2-heretic-i1-GGUF (este) | 30,7B | no disponible | apache-2.0 (enlace Gemma 4) | GGUF | Abliterated, vision, quants i1 |
| gemma-4-31B-it-scotoma-2-heretic-GGUF (estatico) | 30,7B | no disponible | apache-2.0 | GGUF | Mismo modelo, quants estaticos |
| Modelo base sh0ck0r/gemma-4-31B-it-scotoma-2-heretic | 30,7B | no disponible | apache-2.0 | safetensors | Sin cuantizar, requiere mas VRAM |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- **Sesgos**: no documentados; al ser un modelo abliterated, la eliminacion de direcciones de rechazo puede aumentar la probabilidad de respuestas sesgadas, toxicas o inseguras.
- **Alucinacion**: riesgo inherente a modelos de 31B; no hay evaluaciones publicadas de fidelidad factual.
- **Idioma**: solo se declara ingles; el rendimiento en castellano no esta verificado.
- **Licencia ambigua**: se declara Apache 2.0 pero el enlace apunta a la licencia de Gemma 4 de Google, que impone restricciones de uso comercial y de redistribucion. Verificar antes de uso en produccion.
- **Contexto**: no documentado; no asumir ventanas largas sin probar.
- **Formato GGUF**: requiere backend compatible (llama.cpp/Ollama); no usable directamente con transformers sin conversion.
- **Vision**: los ficheros mmproj estan en el repositorio estatico, no en este; hay que descargarlos por separado.
- **Repositorio con 0 descargas y 0 likes**: sin validacion comunitaria; tratar como experimental.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-2-heretic-i1-GGUF
- Modelo base: https://huggingface.co/sh0ck0r/gemma-4-31B-it-scotoma-2-heretic
- Quants estaticos: https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-2-heretic-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#gemma-4-31B-it-scotoma-2-heretic-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- FAQ / peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
