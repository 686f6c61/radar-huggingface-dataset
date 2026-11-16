# mradermacher/Qwen3.6-35B-A3B-Mirage-GGUF

## Resumen

Qwen3.6-35B-A3B-Mirage es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35.505.251.456 parametros totales y aproximadamente 3.000 millones de parametros activos por token (el sufijo "A3B" del nombre asi lo indica), derivado de la familia Qwen3.6 de Alibaba. Esta version concreta, publicada por el usuario nightmedia, es un merge experimental que combina el modelo base con un adaptador LoRA y tecnicas de mergekit, e incorpora etiquetas que apuntan a un ajuste fino de tipo SFT con destilacion de razonamiento (long-cot) y capacidades conversacionales multilingues. El repositorio aqui descrito es la cuantizacion GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo resuelve el problema de desplegar un LLM de razonamiento y proposito general de gran tamano en entornos con recursos limitados: al ser MoE con solo ~3B parametros activos, mantiene un coste de inferencia por token relativamente bajo pese a sus 35B totales. La relevancia actual radica en la combinacion de contexto largo, soporte multilingue (ingles, chino, japones y espanol) y licencia Apache 2.0, lo que facilita su adopcion comercial. No obstante, se trata de un merge experimental y no oficial de Qwen, por lo que su calidad debe validarse en cada caso de uso.

La informacion disponible no incluye detalles sobre la longitud de contexto, el numero exacto de tokens de entrenamiento ni resultados de benchmarks, por lo que esos datos se marcan como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Qwen3.6; merge con LoRA y mergekit |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B (indicado por el sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 (multimodal) |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE), herencia directa de la familia Qwen3.6. El modelo cuenta con 35,5B parametros totales pero solo activa aproximadamente 3B por token, lo que reduce el coste computacional de la inferencia frente a un modelo denso del mismo tamano. El repositorio original (nightmedia/Qwen3.6-35B-A3B-Mirage) es un merge construido con mergekit a partir del modelo base Qwen3.6 y un adaptador LoRA, con etiquetas que indican ajuste fino supervisado (SFT), destilacion de razonamiento con cadenas de pensamiento largas (long-cot), instruccion y conversacion. Tambien aparecen referencias a "fable" y "humour", lo que sugiere que el merge incorpora un componente estilistico o creativo.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplico RLHF o DPO en el modelo base. La model card del repositorio GGUF no aporta detalles tecnicos adicionales: se limita a listar las cuantizaciones generadas y a remitir a la documentacion habitual de llama.cpp. Las cuantizaciones son estaticas (no hay versiones ponderadas/imatrix publicadas por el autor en el momento de la ficha), y se incluyen ficheros mmproj para un componente multimodal.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino, japones y espanol.
- Razonamiento con cadenas de pensamiento largas (long-cot) y modo de razonamiento destilado.
- Matematicas y tareas STEM, segun las etiquetas del modelo.
- Generacion y asistencia de codigo.
- Instruccion y seguimiento de conversaciones (instruction-tuned, SFT).
- Soporte multimodal: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica capacidad de procesamiento de imagenes en el modelo base.
- Componente estilistico/creativo ("fable", "humour") segun las etiquetas del autor.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no confirmado explicitamente, aunque el modo long-cot es compatible con razonamiento por pasos.

## Casos de uso

- Asistente conversacional multilingue: el modelo cubre ingles, chino, japones y espanol, por lo que puede desplegarse como chatbot de atencion al cliente en organizaciones con usuarios en esos idiomas, aprovechando su ajuste conversacional.
- Razonamiento y resolucion de problemas matematicos: el ajuste long-cot permite generar cadenas de razonamiento extensas antes de responder, util en tutoria educativa o generacion de soluciones paso a paso verificables.
- Generacion de codigo en local: con cuantizaciones Q4_K_M (~21,8 GB) puede ejecutarse en una sola GPU de consumo de 24 GB, lo que facilita entornos de desarrollo sin conexion o con requisitos de privacidad.
- Prototipado de agentes con razonamiento: el modo de pensamiento largo y la arquitectura MoE permiten construir pipelines de razonamiento multi-paso con coste por token moderado, aunque el soporte de tool calling debe validarse empiricamente.
- Procesamiento de documentos con componente visual: los ficheros mmproj permiten combinar texto e imagenes en tareas de extraccion o descripcion de contenido, siempre que el runtime GGUF lo soporte.
- Investigacion sobre merges y cuantizacion: al ser un merge experimental con etiquetas de destilacion y mergekit, sirve como caso de estudio para evaluar el impacto de merges y cuantizaciones en calidad y comportamiento.
- Generacion creativa y estilistica: las etiquetas "fable" y "humour" sugieren uso en escritura creativa, narrativa o contenido con tono humoristico, previa validacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~13,3 GB
  - Q3_K_M: ~17,3 GB
  - Q4_K_S: ~20,5 GB
  - Q4_K_M: ~21,8 GB (recomendado por el autor como rapido)
  - Q5_K_M: ~25,4 GB
  - Q6_K: ~29,3 GB
  - Q8_0: ~37,9 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con contexto moderado; A100 40/80 GB o H100 para Q6_K/Q8_0 y contextos largos; multiples GPU para las cuantizaciones mayores.
- Cabe en GPU de consumo: si, Q4_K_M en RTX 4090/3090 (24 GB) y Q2_K/Q3 en GPUs de 16 GB con contexto limitado; tambien puede ejecutarse en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles. Al ser MoE con ~3B parametros activos, se espera un throughput por token notablemente superior al de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage (este) | ~35,5B | ~3B | no disponible | Apache 2.0 | GGUF / safetensors |
| Qwen3-30B-A3B (referencia de familia) | ~30B | ~3B | no disponible | Apache 2.0 | safetensors / GGUF |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32k | Apache 2.0 | safetensors / GGUF |
| Llama 3.1 8B | 8B | denso | 128k | Llama 3.1 Community | safetensors / GGUF |

La comparativa con Qwen3-30B-A3B y Mixtral es orientativa: no se dispone de datos de rendimiento del modelo Mirage para contrastar calidad. La ventaja principal frente a Mixtral es el menor numero de parametros activos (~3B frente a ~12,9B), lo que reduce el coste de inferencia; frente a Llama 3.1 8B, ofrece mas capacidad total a cambio de mayor huella de memoria.

## Limitaciones y advertencias

- Modelo experimental: es un merge no oficial de Qwen, por lo que puede presentar comportamientos inconsistentes o degradacion frente al modelo base original.
- Riesgo de alucinacion: como todo LLM, puede generar contenido facticamente incorrecto, especialmente en el modo long-cot con cadenas de razonamiento largas.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo; el modelo hereda los sesgos de sus datos de entrenamiento y del merge.
- Cobertura idiomatica limitada a en, zh, ja y es; el rendimiento en espanol no esta documentado y podria ser inferior al de ingles o chino.
- Longitud de contexto no documentada: debe validarse empiricamente antes de usarla en produccion con documentos largos.
- Soporte de tool calling y function calling no confirmado.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_M o superior para uso practico.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.6 y del merge original antes de uso comercial.
- Repositorio con 0 descargas y 1 like en el momento de la ficha: no hay evidencia de comunidad ni validacion externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Mirage-GGUF
- Modelo base del merge: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Mirage-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
