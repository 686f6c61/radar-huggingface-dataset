# satoyutaka/qwen35-08b-rag-jem-sft1-sentence

## Resumen

satoyutaka/qwen35-08b-rag-jem-sft1-sentence es un ajuste fino (fine-tuning) supervisado del modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5 con aproximadamente 873 millones de parametros. Lo desarrolla el usuario independiente satoyutaka y esta orientado a tareas de generacion de respuestas basadas en contexto documental (estilo RAG, retrieval-augmented generation) en japones, combinando un entrenamiento previo sobre el conjunto JEMHopQA con una fase adicional de SFT centrada en frases ("sentence SFT").

El modelo parte de la arquitectura y el conocimiento del Qwen3.5-0.8B original y lo especializa mediante SFT sobre cuatro corpus japoneses de question answering: JEMHopQA, auto-wiki-qa, JSQuAD y JaQuAD. Su interes practico radica en que es un modelo pequeno (sub-1000M de parametros) pensado para despliegue local o en entornos con recursos limitados, especializado en responder preguntas a partir de contexto en japones, un nicho con pocas alternativas abiertas de este tamano.

Se trata de un modelo de publicacion muy reciente y con escasa traccion (0 descargas, 0 likes en el momento de la consulta), sin model card detallada ni benchmarks publicados. La informacion disponible se limita a los metadatos de Hugging Face y a la lista de datasets de entrenamiento, por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible oficialmente; los datasets de entrenamiento son en japones |
| Licencia | other (heredada del modelo base; ver limitaciones) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamano del repositorio | 1.8 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5. No se han publicado detalles especificos sobre la arquitectura interna (numero de capas, dimensiones, mecanismo de atencion, uso de GQA, etc.) ni sobre el contexto maximo soportado en esta ficha; se remite a la documentacion del modelo base.

El entrenamiento consiste en un SFT en dos etapas segun la model card: primero un ajuste sobre JEMHopQA ("jem_sft1") y despues una fase adicional de SFT orientada a frases ("sentence SFT"). Los datos de entrenamiento son cuatro corpus japoneses de question answering: JEMHopQA (aiishii/JEMHopQA, CC BY-SA 4.0), auto-wiki-qa (cl-nagoya/auto-wiki-qa, CC BY-SA 4.0), JSQuAD (yahoojapan/JGLUE, CC BY-SA 4.0) y JaQuAD (SkelterLabsInc/JaQuAD, CC BY-SA 3.0). No se indica el numero de tokens de entrenamiento, la composicion exacta de mezclas, ni si hubo RLHF o DPO; tampoco se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto y respuesta a preguntas en japones a partir de contexto documental (orientacion RAG).
- Question answering extractivo y generativo sobre pasajes: los datasets de entrenamiento (JSQuAD, JaQuAD, JEMHopQA, auto-wiki-qa) estan disenados para responder preguntas a partir de un contexto.
- Razonamiento multi-hop sobre documentos, segun la inclusion de JEMHopQA (Japanese Multi-hop QA).
- Capacidad multilingue: no documentada; el entrenamiento es exclusivamente en japones, por lo que el rendimiento en otros idiomas es incierto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Sistemas RAG en japones: el modelo esta entrenado para responder preguntas a partir de pasajes recuperados, por lo que encaja como generador final en un pipeline de retrieval + generation sobre documentacion corporativa en japones.
- Atencion al cliente en japones: puede gestionar respuestas basadas en una base de conocimiento (FAQ, manuales) inyectada en el contexto, con un coste de inferencia bajo por su tamano reducido.
- Extraccion de respuestas en documentos largos: util para tareas de QA sobre contratos, manuales o articulos en japones, donde se necesita localizar y formular la respuesta a partir de un fragmento.
- Asistente de busqueda interna: integrado en un motor de busqueda empresarial para sintetizar respuestas a partir de los resultados recuperados.
- Prototipado e investigacion: por su tamano (873M parametros) es adecuado para experimentar con tecnicas de RAG y SFT en japones en hardware modesto.
- Despliegue en el borde o en local: al caber en GPUs de consumo y en CPU con cuantizacion, sirve para aplicaciones offline o con requisitos de privacidad estrictos.
- Generacion de pares pregunta-respuesta para aumento de datos: puede usarse para sintetizar QA a partir de corpus japoneses en la construccion de datasets de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 1,7-1,8 GB solo para pesos, mas overhead de activaciones y KV cache (estimacion orientativa, no confirmada por el autor).
- En cuantizacion de 8 bits: en torno a 0,9-1,0 GB de pesos; en 4 bits: en torno a 0,5-0,6 GB (estimaciones teoricas segun el numero de parametros, no verificadas para este modelo).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con contexto moderado (p. ej. RTX 3060, RTX 4060, RTX 4090); para mayor throughput, A100 o H100 no son necesarias dado el tamano.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060/4060/4090 y en iGPUs con cuantizacion; tambien en CPU con llama.cpp u Ollama.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversion a GGUF), transformers con PyTorch; no se ha publicado configuracion especifica de despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| satoyutaka/qwen35-08b-rag-jem-sft1-sentence | 873M | no disponible | other | Especializado en QA/RAG en japones |
| Qwen/Qwen3.5-0.8B (base) | ~0.8B | no disponible | segun modelo base | Modelo generalista sin especializar |
| Modelos QA japoneses de ~1B | no disponible | no disponible | variable | No se dispone de comparativa publicada |

No se dispone de datos de rendimiento comparativos publicados para este modelo; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre corpus japoneses (Wikipedia y QA), puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo; al ser un modelo pequeno (873M), la fidelidad al contexto puede degradarse en preguntas complejas o contextos largos.
- Limitaciones de contexto o idioma: no se documenta la ventana de contexto; el entrenamiento es en japones, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: la licencia es "other" y hereda las condiciones del modelo base Qwen3.5-0.8B; es necesario revisar los terminos del modelo base antes de un uso comercial. Ademas, los datasets de entrenamiento tienen licencias CC BY-SA (3.0 y 4.0), lo que puede imponer obligaciones de atribucion y compartir-igual segun como se use el modelo.
- Caveat para produccion: modelo con 0 descargas y sin benchmarks publicados; no hay evidencia de calidad en produccion. Se recomienda evaluacion propia antes de desplegarlo.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/satoyutaka/qwen35-08b-rag-jem-sft1-sentence
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://huggingface.co/datasets/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JSQuAD (JGLUE): https://huggingface.co/datasets/yahoojapan/JGLUE
- Dataset JaQuAD: https://huggingface.co/datasets/SkelterLabsInc/JaQuAD
