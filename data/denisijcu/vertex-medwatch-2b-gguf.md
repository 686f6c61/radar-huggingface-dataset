# Denisijcu/vertex-medwatch-2b-gguf

## Resumen

vertex-medwatch-2b-gguf es una distribucion en formato GGUF del modelo base Gemma 2 2B Instruct de Google, afinado por el usuario Denisijcu y empaquetado mediante Unsloth para su uso con llama.cpp. El repositorio contiene un unico archivo cuantizado en Q4_K_M, lo que lo hace directamente desplegable en entornos de inferencia local sin necesidad de conversion adicional. El nombre sugiere un fine-tuning orientado a monitorizacion medica ("medwatch"), aunque la model card no documenta el dataset ni el procedimiento de ajuste.

El modelo conserva la arquitectura transformer decoder-only de Gemma 2, con 2.614.341.888 parametros totales segun los metadatos de safetensors, y esta disenado para generacion de texto conversacional. Su relevancia practica reside en la facilidad de despliegue: un unico archivo GGUF de aproximadamente 1.7 GB, compatible con llama-cli, llama-mtmd-cli y Ollama mediante el Modelfile incluido.

La informacion publicada es muy limitada: no se especifican licencia, idiomas soportados, pipeline ni resultados de evaluacion. Cualquier uso en produccion deberia acompanarse de una validacion propia, especialmente si se pretende emplear en el ambito sanitario que sugiere el nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 2 2B) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la de Gemma 2 2B es 8192 tokens, no confirmado en este repo) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `gemma-2-2b-it.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 2 2B Instruct, un transformer decoder-only con atencion por ventanas alternada y atencion global, normalizacion RMSNorm y activacion GeGLU, segun la arquitectura publica de la familia Gemma 2. El fine-tuning se realizo con Unsloth, segun indica la model card, y posteriormente se convirtio a GGUF. La model card menciona un ajuste del comportamiento del token BOS para garantizar la compatibilidad con llama.cpp.

No se documentan el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla del pipeline de Unsloth. Tampoco se detalla si el fine-tuning fue supervisado (SFT) o si incluyo preferencias. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de Gemma 2 2B Instruct.
- Razonamiento basico y respuesta a instrucciones de complejidad moderada, limitado por el tamano de 2B parametros.
- Generacion de codigo y matematicas a nivel introductorio, sin garantias de calidad en tareas complejas.
- Soporte de plantilla de chat mediante `--jinja` en llama.cpp.
- Compatibilidad con Ollama a traves del Modelfile incluido en el repositorio.
- Capacidades multilingues: no disponibles de forma explicita; dependen del modelo base y no estan documentadas en este repo.
- Tool calling, agentes y multi-step reasoning: no documentados.
- Vision, audio o modo thinking: no documentados (el uso de `llama-mtmd-cli` en la model card es generico y no implica capacidades multimodales reales en este checkpoint).

## Casos de uso

- Prototipado local de asistentes conversacionales: el archivo Q4_K_M de 1.7 GB se carga en llama.cpp u Ollama en un portatil, lo que permite iterar sobre prompts y plantillas de chat sin infraestructura cloud.
- Monitorizacion de textos con posible contenido sanitario: dado el nombre "medwatch", puede emplearse como clasificador o resumidor preliminar de notas clinicas, siempre con supervision humana y validacion contra el modelo base.
- Generacion de resumenes de documentos cortos: con la ventana de contexto heredada de Gemma 2, admite resumenes de informes de extension moderada en local.
- Educacion y demos: util para ensenar el flujo completo de fine-tuning con Unsloth y despliegue GGUF en cursos o talleres.
- Chatbot embebido en aplicaciones de escritorio: el formato GGUF y el Modelfile de Ollama permiten integrarlo en herramientas ofimaticas o de escritorio sin dependencias de red.
- Evaluacion comparativa de fine-tunings: sirve como referencia para medir el impacto de un ajuste especifico frente a Gemma 2 2B Instruct original en tareas acotadas.
- Filtrado y triaje de mensajes en entornos con recursos limitados: su huella de memoria reducida permite desplegarlo en dispositivos edge o contenedores pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con cuantizacion Q4_K_M, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090); tambien funciona en CPU via llama.cpp.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 4 GB de VRAM o mas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama mediante el Modelfile incluido, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). vLLM y TGI no soportan GGUF de forma nativa generalizada; requeririan conversion a safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vertex-medwatch-2b-gguf | 2.614 M | no disponible | no disponible | GGUF Q4_K_M | Hugging Face |
| Gemma 2 2B Instruct (Google) | 2.614 M | 8192 tokens | Gemma Terms of Use | safetensors, GGUF | Hugging Face, Kaggle |
| Qwen2.5 1.5B Instruct | ~1.540 M | 32768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Phi-3.5-mini Instruct | ~3.800 M | 128000 tokens | MIT | safetensors, GGUF | Hugging Face |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento publicados para vertex-medwatch-2b-gguf que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no documenta el dataset de fine-tuning, por lo que se desconocen los sesgos introducidos y la calidad del ajuste.
- Riesgo de alucinacion inherente a un modelo de 2B parametros, agravado si el fine-tuning se realizo sobre datos ruidosos o escasos.
- El nombre "medwatch" sugiere uso sanitario, pero no hay validacion clinica, evaluacion ni avales regulatorios documentados; no debe usarse como herramienta de decision medica.
- Licencia no especificada: no se puede confirmar el uso comercial. El modelo base Gemma 2 esta sujeto a los Gemma Terms of Use, que imponen restricciones de uso aceptable y obligaciones de atribucion.
- Idiomas soportados no documentados; el comportamiento multilingue depende del modelo base y puede degradarse tras el fine-tuning.
- Longitud de contexto no confirmada en este repositorio; asumir la de Gemma 2 2B (8192 tokens) sin garantia.
- Un unico archivo cuantizado (Q4_K_M) limita la eleccion de precision; no hay versiones Q8_0, Q5_K_M ni F16 publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso comunitario ni validacion externa.
- El ajuste del token BOS para compatibilidad GGUF puede alterar el comportamiento respecto al modelo original en algunas plantillas de chat.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Denisijcu/vertex-medwatch-2b-gguf
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
- Gemma 2 (modelo base, referencia): https://huggingface.co/google/gemma-2-2b-it
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
