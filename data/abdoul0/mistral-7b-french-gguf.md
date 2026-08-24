# Abdoul0/mistral-7b-french-gguf

## Resumen

El modelo `Abdoul0/mistral-7b-french-gguf` es un ajuste fino (fine-tuning) del modelo Mistral 7B Instruct v0.3, orientado a la generación de texto conversacional en francés, y posteriormente convertido al formato GGUF mediante la librería Unsloth. El autor, Abdoul0, publica este modelo con el objetivo de facilitar su ejecución local en entornos de bajos recursos, ya que incluye una única cuantización Q4_K_M que reduce el tamaño del archivo a aproximadamente 4,4 GB.

La relevancia de este modelo radica en su accesibilidad: al estar en formato GGUF, puede ejecutarse directamente con llama.cpp, Ollama o cualquier runtime compatible, sin necesidad de infraestructura de GPU de alta gama. Aunque no se especifican los datos de entrenamiento ni el proceso de ajuste, el modelo base Mistral 7B Instruct v0.3 aporta una arquitectura transformer con atención de ventana deslizante y consulta agrupada, lo que le confiere un buen equilibrio entre rendimiento y eficiencia. El repositorio incluye un Modelfile de Ollama para simplificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral 7B Instruct v0.3) |
| Parametros totales | 7.248.023.552 (7,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32 768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | Q4_K_M (unico archivo: `mistral-7b-instruct-v0.3.Q4_K_M.gguf`) |
| Idiomas soportados | frances (por el nombre y el tag conversational; no se especifican otros) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo se basa en Mistral 7B Instruct v0.3, una arquitectura transformer autoregresiva con 7,2 mil millones de parametros. Incorpora dos innovaciones clave de Mistral AI: Grouped-Query Attention (GQA) para acelerar la inferencia y Sliding Window Attention (SWA) para manejar secuencias largas de forma eficiente. El ajuste fino se realizo con la libreria Unsloth, que optimiza el entrenamiento mediante tecnicas de cuantizacion y kernels especializados, aunque no se detalla el dataset utilizado ni el numero de tokens de entrenamiento. Tampoco se indica si se aplicaron tecnicas de RLHF o DPO. La conversion a GGUF se hizo con la herramienta de Unsloth, y la cuantizacion Q4_K_M reduce el peso del modelo a unos 4,4 GB, manteniendo un equilibrio razonable entre calidad y requisitos de memoria.

## Capacidades

- Generacion de texto conversacional en frances, orientado a dialogos y asistentes.
- Ejecucion local en CPU o GPU mediante llama.cpp, Ollama y runtimes compatibles con GGUF.
- Soporte de chat multi-turno gracias a la naturaleza instruct del modelo base.
- Compatible con el formato de plantilla Jinja para su uso con `llama-cli` o `llama-mtmd-cli`.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente virtual en frances para pequenas empresas: el modelo puede gestionar consultas de clientes, responder preguntas frecuentes y mantener conversaciones contextuales, gracias a su naturaleza instruct y su formato GGUF que permite desplegarlo en un servidor local sin costes de API.
- Chatbot educativo para aprendizaje de frances: al estar ajustado en frances, puede servir como practicante de conversacion para estudiantes, generando respuestas coherentes y adaptadas al nivel del usuario.
- Generacion de contenido en frances para blogs o redes sociales: el modelo puede redactar borradores de articulos, resumenes o respuestas a comentarios, aprovechando su capacidad de generacion de texto fluido.
- Prototipado rapido de aplicaciones de NLP: gracias a su tamano reducido y compatibilidad con Ollama, es adecuado para pruebas de concepto en entornos de desarrollo sin GPU dedicada.
- Transcripcion y resumen de reuniones en frances: aunque no se especifica soporte de audio, el modelo puede procesar transcripciones de texto y generar resumenes ejecutivos.
- Despliegue en dispositivos edge o Raspberry Pi: con la cuantizacion Q4_K_M y un peso de 4,4 GB, puede ejecutarse en hardware modesto, permitiendo asistentes offline en frances.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este ajuste especifico. El rendimiento real debe evaluarse de forma empirica en las tareas objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, el modelo ocupa aproximadamente 4,4 GB en memoria. En GPU, se recomienda al menos 6 GB de VRAM para dejar margen a los estados de atencion y el contexto.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) o superiores. Tambien puede ejecutarse en CPU con 8 GB de RAM, aunque con mayor latencia.
- Compatible con GPUs consumer de gama media; no requiere hardware de datacenter.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, text-generation-webui, o cualquier servidor compatible con GGUF (por ejemplo, llama-server).
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU RTX 4090, se puede esperar una velocidad de generacion de 50-100 tokens por segundo; en CPU, entre 5-15 tokens por segundo dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Abdoul0/mistral-7b-french-gguf | 7,2 B | no disponible | GGUF (Q4_K_M) | no disponible | Hugging Face |
| Mistral-7B-Instruct-v0.3 (original) | 7,2 B | 32 768 | safetensors | Apache 2.0 | Hugging Face |
| TheBloke/Mistral-7B-Instruct-v0.1-GGUF | 7,2 B | 8 192 | GGUF (varias cuantizaciones) | Apache 2.0 | Hugging Face |

La principal diferencia con el modelo original es el ajuste en frances y la cuantizacion unica. Frente a TheBloke, este repositorio ofrece una sola cuantizacion y un Modelfile de Ollama, pero carece de la variedad de cuantizaciones y de la documentacion extensa que caracteriza a TheBloke.

## Limitaciones y advertencias

- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- No hay informacion sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos o alucinaciones especificas del ajuste en frances.
- El modelo solo incluye una cuantizacion Q4_K_M, lo que limita la capacidad de ajustar el equilibrio entre calidad y velocidad.
- La longitud de contexto no esta confirmada; aunque el modelo base soporta 32 768 tokens, el ajuste podria haberla reducido.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de razonamiento, codigo o matematicas es desconocido.
- Al ser un modelo pequeno (7B), puede presentar alucinaciones en tareas complejas o de conocimiento factual, especialmente fuera del dominio frances.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Abdoul0/mistral-7b-french-gguf
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (despliegue local): https://ollama.com
- Modelo base Mistral 7B Instruct v0.3: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
