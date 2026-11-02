# mradermacher/Gemma-3-4B-IT-ES-SynthDolly-1A-E3-GGUF

## Resumen

Gemma-3-4B-IT-ES-SynthDolly-1A-E3-GGUF es la distribucion en formato GGUF del modelo kairawal/Gemma-3-4B-IT-ES-SynthDolly-1A-E3, un ajuste fino del modelo base Gemma 3 4B IT de Google. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema de cuantizaciones GGUF para llama.cpp, que publica versiones estaticas del modelo original en una docena de niveles de precision.

El modelo subyacente parte de la arquitectura Gemma 3 (transformer decoder-only) con aproximadamente 3.880 millones de parametros, y ha sido ajustado por kairawal sobre el dataset SynthDolly en un entrenamiento de una epoca (indicado por el sufijo "1A-E3" del nombre). El resultado es un modelo conversacional orientado a generacion de texto y con soporte multimodal declarado mediante los ficheros mmproj incluidos en el repositorio.

La relevancia de esta ficha reside en que ofrece el modelo en cuantizaciones que van desde 1,8 GB (Q2_K) hasta 7,9 GB (f16), lo que permite ejecutarlo en hardware de consumo modesto mediante llama.cpp u Ollama. La licencia Apache 2.0 facilita su integracion en productos comerciales sin las restricciones adicionales de la licencia Gemma original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3) |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (segun metadatos; el nombre del modelo sugiere orientacion a espanol, no confirmada) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers como libreria declarada) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 4B IT de Google, un transformer decoder-only de aproximadamente 3.880 millones de parametros. El ajuste fino realizado por kairawal parte de la version instruction-tuned y entrena sobre el dataset SynthDolly durante una epoca (sufijo "1A" en el nombre). No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

La contribucion de mradermacher es puramente de cuantizacion: convierte los pesos del modelo original a formato GGUF mediante llama.cpp, generando cuantizaciones estaticas (no imatrix, segun declara el autor). El repositorio incluye tambien ficheros mmproj en f16 y Q8_0, lo que indica que el modelo conserva la capacidad multimodal de vision del Gemma 3 original. No se han publicado detalles sobre innovaciones tecnicas adicionales en el ajuste fino.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Gemma 3 4B IT base.
- Soporte multimodal de vision a traves de los ficheros mmproj incluidos (f16 y Q8_0).
- Razonamiento basico y respuesta a instrucciones, por el ajuste sobre datos sinteticos tipo Dolly.
- Capacidad de ejecucion local en CPU y GPU mediante llama.cpp, Ollama y otros runners compatibles con GGUF.
- Soporte de cuantizaciones de muy bajo bitwidth (Q2_K, Q3_K) para entornos con memoria limitada.
- Capacidades multilingues: los metadatos solo declaran ingles; el nombre del modelo sugiere entrenamiento orientado a espanol, pero no esta confirmado en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en portatiles: con la cuantizacion Q4_K_M (2,6 GB) el modelo cabe en equipos con 8 GB de RAM y puede ejecutarse en CPU mediante llama.cpp para prototipos de asistentes conversacionales sin conexion.
- Prototipado rapido de chatbots en espanol: si el ajuste fino sobre SynthDolly efectivamente mejora el rendimiento en castellano, el modelo serviria para validar ideas de producto antes de invertir en modelos mayores.
- Inferencia en GPU de consumo: la version Q8_0 (4,2 GB) cabe en tarjetas con 6-8 GB de VRAM (RTX 3060, RTX 4060) y permite generar respuestas con calidad cercana al modelo original.
- Experimentacion academica con cuantizaciones: el repositorio ofrece doce niveles de cuantizacion del mismo modelo, lo que facilita estudios comparativos de degradacion de calidad frente a tamano.
- Integracion en aplicaciones de escritorio: al ser GGUF y Apache 2.0, puede embeberse en herramientas de escritorio (editores, asistentes de IDE) sin restricciones de licencia comercial.
- Procesamiento de imagenes con descripcion textual: los ficheros mmproj permiten usar la capacidad de vision del Gemma 3 base para tareas de captioning o VQA en local, aunque con la calidad limitada de un modelo de 4B.
- Educacion y divulgacion: util para demostrar el flujo completo de ajuste fino y cuantizacion de un modelo abierto en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~1,8 GB; Q3_K_M ~2,2 GB; Q4_K_M ~2,6 GB; Q5_K_M ~2,9 GB; Q6_K ~3,3 GB; Q8_0 ~4,2 GB; f16 ~7,9 GB. Anadir aproximadamente 0,7-1,0 GB si se usa el mmproj para vision.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB o superiores para las cuantizaciones Q5-Q8; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, desde una GTX 1650 4 GB (con Q3_K) hasta una RTX 4090 (con f16 y contexto amplio).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. La libreria declarada es transformers, pero el formato de pesos es GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-3-4B-IT-ES-SynthDolly-1A-E3-GGUF | 3,88 B | no disponible | Apache 2.0 | GGUF | Ajuste fino sobre SynthDolly, cuantizado por mradermacher |
| Gemma 3 4B IT (original de Google) | 4 B aprox. | no disponible | Gemma Terms of Use | safetensors, GGUF | Modelo base sin ajuste; licencia mas restrictiva |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con contexto declarado |
| Llama 3.2 3B Instruct | 3,21 B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto mucho mayor; licencia con restricciones |

La comparativa se limita a parametros, contexto declarado y licencia, ya que no hay benchmarks publicados para este ajuste fino que permitan comparar calidad.

## Limitaciones y advertencias

- El modelo solo declara ingles en los metadatos; el rendimiento real en espanol no esta verificado pese al nombre del ajuste.
- Al ser un ajuste fino sobre un dataset sintetico (SynthDolly) de una sola epoca, puede presentar sobreajuste al estilo de ese dataset y degradar capacidades generales del Gemma 3 original.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en tareas de conocimiento factual y matematicas.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; el autor recomienda Q4_K_M o superior para uso practico.
- El autor no ha generado cuantizaciones imatrix/weighted, que suelen ofrecer mejor calidad por bit que las estaticas.
- Aunque la licencia del repositorio es Apache 2.0, conviene verificar la compatibilidad con los terminos del modelo Gemma 3 base de Google antes de uso comercial.
- No hay informacion sobre el contexto maximo soportado en la version GGUF; debe verificarse en la configuracion de llama.cpp.
- El modelo tiene solo 99 descargas y 1 like, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Gemma-3-4B-IT-ES-SynthDolly-1A-E3-GGUF
- Modelo base del ajuste fino: https://huggingface.co/kairawal/Gemma-3-4B-IT-ES-SynthDolly-1A-E3
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-3-4B-IT-ES-SynthDolly-1A-E3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
