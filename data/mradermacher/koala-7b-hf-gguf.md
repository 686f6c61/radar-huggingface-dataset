# mradermacher/koala-7B-HF-GGUF

## Resumen

Koala-7B-HF-GGUF es la distribucion en formato GGUF del modelo Koala 7B, un ajuste fino supervisado de LLaMA 7B desarrollado originalmente por el equipo de Berkeley AI Research (BAIR) y publicado como Koala. Esta version concreta ha sido cuantizada por mradermacher a partir de los pesos en formato Hugging Face de TheBloke (TheBloke/koala-7B-HF), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y ecosistemas compatibles con GGUF.

El modelo resuelve el problema de desplegar un asistente conversacional de 7.000 millones de parametros en entornos con recursos limitados, ofreciendo un abanico de cuantizaciones que van desde Q2_K (2,6 GB) hasta f16 (13,6 GB). Se trata de un transformer decoder-only denso de la familia LLaMA, entrenado sobre datos de dialogo de ShareGPT y HC3, con una ventana de contexto de 2048 tokens y soporte exclusivo para ingles.

Su relevancia actual es principalmente historica y practica: Koala fue uno de los primeros ajustes de LLaMA orientados a dialogo publicados abiertamente, y esta version GGUF sigue siendo util para experimentacion, docencia y despliegues ligeros en CPU o GPU modesta donde no se requiere estado del arte. No obstante, su licencia restrictiva y su antiguedad frente a modelos posteriores limitan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, denso) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | other (licencia no comercial de LLaMA original, ver limitaciones) |
| Formato de pesos | GGUF (tambien disponible el modelo base en safetensors via TheBloke/koala-7B-HF) |

## Arquitectura y entrenamiento

Koala-7B es un ajuste fino supervisado (SFT) sobre LLaMA 7B, un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm y activacion SwiGLU, siguiendo la arquitectura descrita en el paper de LLaMA. El modelo parte de los pesos de LLaMA 7B y se afina sobre datos de dialogo recopilados de ShareGPT52K (conversaciones reales de ChatGPT) y Hello-SimpleAI/HC3 (preguntas y respuestas humano-vs-IA). El objetivo del entrenamiento fue alinear el modelo base con formato conversacional de tipo asistente.

La cuantizacion GGUF de mradermacher se genero con la version 2 del pipeline de cuantizacion, a partir de la conversion HF de TheBloke, con tensor de salida cuantizado y tipo de conversion hf. El autor ofrece tambien cuantizaciones ponderadas/imatrix en un repositorio separado (koala-7B-HF-i1-GGUF). No se documentan en la informacion disponible detalles sobre el numero exacto de tokens de entrenamiento, composicion fina del dataset ni si hubo etapas de RLHF o DPO; el modelo card original de Koala si describe un proceso de SFT sobre dialogos, pero esos datos no se recogen en esta ficha.

## Capacidades

- Generacion de texto conversacional en ingles con formato de dialogo multi-turno.
- Razonamiento basico y respuesta a preguntas generales, heredado del ajuste sobre ShareGPT.
- Generacion de codigo simple, aunque sin garantias de calidad frente a modelos especializados.
- Capacidades aritmeticas y de matematicas elementales limitadas (modelo pequeno y antiguo).
- No dispone de soporte nativo de tool calling ni function calling.
- No dispone de modo de razonamiento explicito (thinking mode) ni capacidades de agente multi-paso.
- Sin capacidades de vision, audio ni multimodalidad.
- Multilingue limitado: el modelo esta entrenado y etiquetado exclusivamente en ingles; el rendimiento en castellano es deficiente.

## Casos de uso

- Experimentacion academica y docencia: permite reproducir el comportamiento de un ajuste SFT temprano de LLaMA en un portatil con GPU de 8 GB usando Q4_K_M (4,2 GB), sin necesidad de infraestructura en la nube.
- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno dentro de su ventana de 2048 tokens, suficiente para interacciones cortas de soporte o FAQ.
- Despliegue en CPU con llama.cpp u Ollama: las cuantizaciones Q2_K y Q3_K permiten ejecutar inferencia en equipos sin GPU dedicada, util para demos locales y entornos aislados.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece doce variantes de cuantizacion del mismo modelo, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de generacion.
- Generacion de texto creativo breve en ingles (resumenes, parafrasis, borradores) en pipelines por lotes donde el coste por token es critico.
- Fine-tuning posterior como base ligera: al ser un modelo de 6,74 B en formato HF, sirve como punto de partida para experimentos de ajuste con LoRA en ingles, aunque su licencia restringe el uso comercial.
- Educacion sobre formatos GGUF: util para aprender a concatenar archivos multi-parte y a integrar modelos GGUF en aplicaciones propias, siguiendo las guias de TheBloke referenciadas en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~2,6 GB; Q4_K_M ~4,2 GB; Q8_0 ~7,3 GB; f16 ~13,6 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y superiores; RTX 4090 24 GB para f16 con contexto completo; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 6 GB o mas usando Q4_K_M o inferiores; Q2_K y Q3_K_S caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque el contexto de 2048 tokens limita su atractivo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen fuertemente del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| koala-7B-HF-GGUF (este) | 6,74 B | 2048 | other (no comercial) | GGUF | Ajuste SFT de LLaMA 7B sobre ShareGPT/HC3 |
| Vicuna-7B | ~6,7 B | 2048 | other (no comercial) | GGUF, safetensors | Ajuste SFT de LLaMA sobre conversaciones de ShareGPT, coetaneo y comparable |
| Mistral-7B-Instruct | ~7,2 B | 8192 (32768 en v0.2/0.3) | Apache 2.0 | GGUF, safetensors | Arquitectura mas moderna, contexto mayor y licencia permisiva |
| Llama-2-7B-Chat | ~6,7 B | 4096 | Llama 2 Community License | GGUF, safetensors | Sucesor directo de la familia, con licencia mas clara para uso comercial |

## Limitaciones y advertencias

- Licencia "other": el modelo deriva de LLaMA 7B original, cuya licencia prohibe el uso comercial; no debe emplearse en productos comerciales sin revisar los terminos heredados.
- Riesgo elevado de alucinacion: es un modelo de 7 B de 2023 con SFT ligero, sin RLHF ni verificacion factual.
- Ventana de contexto muy limitada (2048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Solo ingles: el rendimiento en castellano y otros idiomas es pobre y no esta garantizado.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso; no es adecuado para pipelines automatizados complejos.
- Sesgos conocidos: al entrenarse sobre conversaciones de ShareGPT y HC3, puede reproducir sesgos presentes en esos corpus; no se documentan evaluaciones de sesgo en la informacion disponible.
- Modelo obsoleto frente a alternativas actuales con mejor calidad, contexto y licencia; su uso en produccion no esta recomendado.
- El repositorio ocupa 59,6 GB al incluir todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/koala-7B-HF-GGUF
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/koala-7B-HF-i1-GGUF
- Modelo base en HF: https://huggingface.co/TheBloke/koala-7B-HF
- Pagina de resumen del autor: https://hf.tst.eu/model#koala-7B-HF-GGUF
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset ShareGPT52K: https://huggingface.co/datasets/RyokoAI/ShareGPT52K
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
