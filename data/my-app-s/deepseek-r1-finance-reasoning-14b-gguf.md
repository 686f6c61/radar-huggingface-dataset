# my-app-s/DeepSeek-R1-Finance-Reasoning-14B-GGUF

## Resumen

DeepSeek-R1-Finance-Reasoning-14B-GGUF es una recopilacion de cuantizaciones en formato GGUF del modelo engr-bilal/FinetunedQwen14B, un ajuste fino de Qwen2 de aproximadamente 14.770 millones de parametros (14,77B) orientado a razonamiento financiero. El repositorio lo publica el usuario my-app-s, mientras que la model card indica que las cuantizaciones han sido generadas por mradermacher. El modelo base declarado es un fine-tuning de la familia Qwen2, y el nombre comercial sugiere una inspiracion en el estilo de razonamiento de la familia DeepSeek-R1, aunque no se aporta evidencia tecnica de destilacion desde DeepSeek-R1 en la informacion disponible.

El interes practico del repositorio reside en que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K de 5,9 GB hasta Q8_0 de 15,8 GB), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp u Ollama. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. No se dispone de informacion publica sobre contexto, datos de entrenamiento, benchmarks ni pipeline de inferencia.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, por lo que debe evaluarse con cautela: la ficha recoge unicamente los datos verificables del repositorio y marca explicitamente como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun tags del repositorio) |
| Parametros totales | 14.770.033.664 (14,77B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en transformers/safetensors |
| Tamano del repositorio | 102,0 GB |
| Modelo base | engr-bilal/FinetunedQwen14B |
| Cuantizado por | mradermacher |
| Libreria declarada | transformers |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es un ajuste fino de Qwen2 con aproximadamente 14,77B de parametros, es decir, un transformer decoder-only de la familia Qwen2. Los tags del repositorio incluyen `qwen2` y `unsloth`, lo que sugiere que el fine-tuning se realizo con la libreria Unsloth, habitual para ajustes eficientes con LoRA/QLoRA. No se documenta el numero de tokens de entrenamiento, la composicion del dataset financiero, ni si se aplicaron fases de RLHF, DPO o SFT supervisado.

El nombre del modelo alude a DeepSeek-R1 y a "Finance-Reasoning", pero no hay evidencia en la informacion proporcionada de que se haya destilado desde DeepSeek-R1 ni de que se emplee un modo de razonamiento explicito con tokens de pensamiento. Las cuantizaciones son estaticas (no hay versiones imatrix ni ponderadas disponibles en el momento de la publicacion, segun la propia model card), y se distribuyen en once variantes que van de Q2_K a Q8_0.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` del repositorio.
- Razonamiento orientado a dominio financiero, a tenor del nombre del modelo y del fine-tuning sobre el que se construye; no se documenta el alcance real de esta especializacion.
- Compatibilidad con text-generation-inference y transformers como librerias declaradas.
- Ejecucion local mediante formatos GGUF en llama.cpp y derivados.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de pensamiento explicito.
- Capacidad multilingue limitada al ingles declarado; no se especifican otros idiomas.

## Casos de uso

- Analisis de estados financieros: el modelo puede resumir y comentar balances o cuentas de resultados en ingles, aprovechando su ajuste sobre dominio financiero; conviene validar las cifras con fuentes primarias por el riesgo de alucinacion.
- Asistencia en due diligence documental: procesamiento de informes y memorandos financieros para extraer puntos clave, siempre con revision humana dado que no se documenta la longitud de contexto.
- Generacion de explicaciones educativas: respuestas razonadas sobre conceptos de finanzas (valoracion, ratios, flujos de caja) para plataformas de formacion, en ingles.
- Prototipado local en estaciones de trabajo: al disponer de cuantizaciones de 5,9 a 15,8 GB, permite experimentar con un modelo de 14B en GPUs de consumo mediante llama.cpp u Ollama.
- Clasificacion y etiquetado de textos financieros: categorizacion de noticias o informes en ingles dentro de pipelines de datos, con cuantizaciones Q4_K_M para equilibrio entre calidad y velocidad.
- Chatbot interno de consulta financiera: despliegue en un entorno controlado con Q8_0 para maxima calidad o Q4_K_M para latencia, limitado a usuarios en ingles y con avisos claros de no constituir asesoramiento financiero.
- Evaluacion comparativa de fine-tunes: servir como referencia para estudiar el efecto de un ajuste financiero sobre Qwen2 frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF y overhead de contexto):
  - Q2_K: unos 6-7 GB.
  - Q3_K_M: unos 7,5-8,5 GB.
  - Q4_K_M: unos 9-10 GB.
  - Q5_K_M: unos 10,5-11,5 GB.
  - Q6_K: unos 12-13 GB.
  - Q8_0: unos 16-17 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q6_K y Q8_0 con contexto moderado; RTX 4070 Ti/4080 (12-16 GB) para Q4_K_M y Q5_K_M; GPUs de 8 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB con Q4_K_M y contexto limitado, y en RTX 4090 con Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base admite transformers y text-generation-inference.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Finance-Reasoning-14B-GGUF | 14,77B | No disponible | Apache 2.0 | GGUF | Fine-tune financiero de Qwen2; sin benchmarks publicos |
| Qwen2-14B (base de la familia) | ~14B | No disponible en esta ficha | Apache 2.0 (familia Qwen2) | safetensors, GGUF | Referencia generalista sin especializacion financiera |
| FinetunedQwen14B (modelo original) | 14,77B | No disponible | Apache 2.0 | transformers/safetensors | Modelo del que derivan estas cuantizaciones |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes: sin validacion comunitaria ni evidencia de calidad mas alla de la model card.
- Riesgo elevado de alucinacion en contenido financiero: no se documenta el dataset de entrenamiento ni procesos de verificacion; cualquier cifra debe contrastarse con fuentes primarias.
- Solo ingles declarado; no se garantiza un comportamiento correcto en castellano.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con documentos largos.
- El nombre alude a DeepSeek-R1 sin evidencia de destilacion ni de modo de razonamiento real; tratarlo como un fine-tune de Qwen2 y no como un modelo de la familia DeepSeek.
- Cuantizaciones estaticas sin versiones imatrix o ponderadas; las variantes Q2_K y Q3_K_S degradan la calidad de forma notable.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base engr-bilal/FinetunedQwen14B antes de desplegar en produccion.
- No apto como asesoramiento financiero sin supervision humana y avisos legales explicitos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/my-app-s/DeepSeek-R1-Finance-Reasoning-14B-GGUF
- Modelo base: https://huggingface.co/engr-bilal/FinetunedQwen14B
- Pagina de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/DeepSeek-R1-Finance-Reasoning-14B-GGUF
- Pagina de resumen de descargas: https://hf.tst.eu/model#DeepSeek-R1-Finance-Reasoning-14B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
