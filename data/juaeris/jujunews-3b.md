# juaeris/jujunews-3b

## Resumen

JujuNews 3B es un ajuste fino (fine-tune) del modelo Dolphin3.0-Qwen2.5-3b de Cognitive Computations, desarrollado por el usuario juaeris para tareas de generacion de texto editorial en frances. El modelo se distribuye exclusivamente en formato GGUF (cuantizacion Q4_K_M) para su uso con llama.cpp y LM Studio, con un total de 3.085.938.688 parametros y una longitud de contexto recomendada de 8192 tokens. Su proposito declarado es generar texto de opinion con una linea editorial concreta (soberanismo, ge politica, critica al "Deep State"), lo que lo convierte en un modelo de nicho orientado a un caso de uso muy especifico mas que a un asistente general.

El modelo hereda la arquitectura y capacidades del Qwen2.5-3B original, sobre el que se aplico un ajuste QLoRA con datos editoriales en frances. Al estar publicado unicamente como GGUF, su uso esta pensado para inferencia local en hardware de consumo, no para despliegues en servidores de alto rendimiento con vLLM o TGI. La licencia es "other", lo que introduce incertidumbre sobre las condiciones exactas de uso comercial, y el modelo base a su vez arrastra las condiciones de la familia Qwen2.5 y de Dolphin3.0.

La relevancia de este modelo es limitada fuera de su nicho: se trata de un fine-tune pequeno, con muy pocas descargas (25) y sin datos publicados de benchmarks, entrenamiento o evaluacion. Resulta util como ejemplo de adaptacion de un modelo base a un estilo editorial concreto, pero no debe considerarse un modelo de proposito general ni un candidato para tareas que requieran rigor factual o cobertura multilingue amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B via Dolphin3.0) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (recomendado por el autor) |
| Tipos de cuantizacion | GGUF Q4_K_M (unico archivo publicado) |
| Idiomas soportados | frances (fr) |
| Licencia | other |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B, un transformer decoder-only con atencion causal estandar, sobre el que Cognitive Computations construyo Dolphin3.0-Qwen2.5-3b mediante ajuste fino. Sobre esa base, el autor aplico un ajuste QLoRA (cuantizacion de bajo rango) con datos editoriales en frances. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO ni hiperparametros del ajuste.

La unica innovacion documentada es el uso de un prompt de sistema fijo que define el estilo: "editorialista de JujuNews, estilo directo, acido, soberanista y catolico tradicionalista, 2 a 4 frases en frances". No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido. La informacion sobre el proceso de entrenamiento es practicamente inexistente en la model card.

## Capacidades

- Generacion de texto en frances con un estilo editorial concreto (tono directo, critico, soberanista).
- Generacion de articulos breves de opinion (2 a 4 frases) segun el prompt de sistema definido por el autor.
- Conversacion multi-turno basica, heredada del modelo base Dolphin3.0.
- Capacidad de instruccion y seguimiento de prompts de sistema, propia de la familia Qwen2.5.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del frances.
- No se documenta vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Generacion de editoriales breves: el modelo produce parrafos de 2 a 4 frases con el tono definido en el prompt de sistema, adecuado para publicaciones de opinion con linea editorial fija.
- Prototipado de asistentes editoriales en local: al ejecutarse con llama.cpp o LM Studio, permite iterar sobre prompts de estilo sin coste de API ni dependencia de la nube.
- Generacion de titulares y sumarios: su contexto de 8192 tokens permite procesar articulos completos y resumirlos con el tono editorial deseado.
- Experimentacion con fine-tunes QLoRA: sirve como caso de estudio de adaptacion de un modelo de 3B a un dominio editorial concreto en un solo archivo GGUF.
- Despliegue en hardware de consumo: al caber en GPUs de gama media con cuantizacion Q4_K_M, permite ejecutar generacion de texto editorial en estaciones de trabajo sin GPU dedicada de datacenter.
- Generacion de contenido de opinion para boletines o newsletters: el modelo puede producir borradores que un editor humano revisa y publica, reduciendo el tiempo de redaccion inicial.
- Pruebas de estilo y tono en pipelines de contenido: util para comparar variantes de prompts editoriales antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 a 3 GB con cuantizacion Q4_K_M (el archivo GGUF ocupa parte de los 1,9 GB del repo, mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, LM Studio (soporte nativo segun los tags), y cualquier runtime compatible con GGUF. No se distribuyen pesos en safetensors, por lo que vLLM y TGI no son opciones directas sin conversion.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 3B en Q4_K_M, se espera una generacion fluida en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| JujuNews 3B | 3,09B | 8192 (recomendado) | other | GGUF Q4_K_M | Hugging Face (25 descargas) |
| Dolphin3.0-Qwen2.5-3b | 3,09B | no disponible en la informacion | no disponible | safetensors y GGUF | Hugging Face (modelo base) |
| Qwen2.5-3B | 3,09B | 32768 (segun familia Qwen2.5) | Apache 2.0 (segun familia Qwen2.5) | safetensors, GGUF | Hugging Face |

La comparativa se limita a la genealogia del modelo: JujuNews 3B es un fine-tune de Dolphin3.0-Qwen2.5-3b, que a su vez deriva de Qwen2.5-3B. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el prompt de sistema define una linea editorial explicita (soberanismo, critica al "Deep State" y al "agenda globalista"), lo que introduce un sesgo ideologico deliberado en las respuestas.
- Riesgo de alucinacion: al ser un fine-tune de 3B sin datos de evaluacion publicados, el riesgo de afirmaciones factualmente incorrectas es alto, especialmente en temas de geopolitica.
- Limitaciones de contexto: el autor recomienda 8192 tokens, muy por debajo del contexto nativo de la familia Qwen2.5; no se documenta el comportamiento mas alla de esa longitud.
- Limitaciones de idioma: el modelo esta ajustado unicamente para frances; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Restricciones de licencia: la licencia "other" no especifica condiciones de uso comercial; es necesario consultar los terminos del modelo base (Dolphin3.0 y Qwen2.5) antes de cualquier uso en produccion.
- Caveat para produccion: solo se distribuye un archivo GGUF Q4_K_M, sin safetensors ni versiones sin cuantizar, lo que limita la conversion a otros formatos y la reproducibilidad del ajuste.
- Falta de documentacion: no hay informacion sobre el dataset de entrenamiento, hiperparametros, evaluacion ni limitaciones declaradas por el autor, lo que dificulta evaluar su calidad de forma rigurosa.
- Popularidad muy baja: 25 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juaeris/jujunews-3b
- Modelo base Dolphin3.0-Qwen2.5-3b: https://huggingface.co/cognitivecomputations/Dolphin3.0-Qwen2.5-3b
- Familia Qwen2.5 (modelo original): https://huggingface.co/Qwen/Qwen2.5-3B
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
