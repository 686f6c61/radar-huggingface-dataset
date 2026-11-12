# NotoriousH2/kanana-1.5-8b-instruct-2505-Persona-Merged

## Resumen

NotoriousH2/kanana-1.5-8b-instruct-2505-Persona-Merged es un ajuste fino (finetune) del modelo kakaocorp/kanana-1.5-8b-instruct-2505, publicado por el usuario NotoriousH2 en Hugging Face. Se trata de un modelo de generacion de texto de aproximadamente 8.030 millones de parametros (8B), orientado a conversacion y con etiqueta de idioma ingles, distribuido bajo licencia Apache 2.0.

El modelo parte de Kanana 1.5, la familia de modelos desarrollada por Kakao Corp, y ha sido reentrenado utilizando Unsloth y la libreria TRL de Hugging Face, tecnicas que aceleran el proceso de ajuste fino. El nombre "Persona-Merged" sugiere que el autor ha aplicado una fusion de pesos o un ajuste orientado a dotar al modelo de una personalidad o estilo conversacional concreto, aunque la model card no documenta en detalle la metodologia exacta de esa fusion.

La relevancia de esta ficha es limitada pero concreta: se trata de un derivado comunitario de bajo numero de descargas (60 en el momento de la consulta) y sin likes, lo que indica un uso muy restringido. Resulta util como ejemplo de finetune ligero sobre un modelo base coreano-ingles de 8B, pero no debe considerarse un modelo de referencia para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia llama, segun tags) |
| Parametros totales | 8.030.285.824 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; compatible con cuantizacion via Unsloth/GGUF no documentada) |
| Idiomas soportados | en (ingles, segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia llama, segun los tags del repositorio, con 8.030 millones de parametros. El modelo base es kakaocorp/kanana-1.5-8b-instruct-2505, un modelo instructivo de Kakao Corp. El ajuste fino se realizo con Unsloth y la libreria TRL de Hugging Face, lo que segun la model card permite entrenar "2x mas rapido" que un flujo estandar.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en este finetune concreto. El nombre "Persona-Merged" apunta a una fusion de pesos (model merging) orientada a personalidad, pero la model card no detalla el metodo de merge, los checkpoints combinados ni los hiperparametros empleados. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instructivo.
- Razonamiento y respuesta a instrucciones propias de un modelo instruct de 8B.
- Soporte de tool calling / function calling: no documentado en la model card; depende de las capacidades del modelo base Kanana 1.5.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente ingles; el modelo base Kanana 1.5 tiene soporte coreano-ingles, pero este derivado no lo declara.
- Modo "thinking", vision o audio: no disponible.
- Estilo o personalidad especifica: presumiblemente alterado por el merge, sin documentacion de como.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno basicos en un entorno de pruebas, aunque su contexto maximo no esta documentado y conviene validarlo antes de usarlo.
- Experimentacion con tecnicas de model merging: sirve como referencia practica de como un finetune con Unsloth sobre un modelo de 8B puede empaquetarse y publicarse en Hugging Face.
- Generacion de texto creativo con estilo personalizado: el posible ajuste de "persona" del merge puede aprovecharse para tareas de escritura con un tono concreto, siempre que se evalue empiricamente.
- Base para nuevos finetunes comunitarios: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para ajustes especificos de dominio.
- Evaluacion comparativa de derivados de Kanana 1.5: util en investigacion para medir el impacto de merges de personalidad sobre el modelo base.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su integracion en productos comerciales, sujeto a validacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB solo para pesos, mas overhead de KV cache y activaciones.
- VRAM estimada en cuantizacion 8 bits: en torno a 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones teoricas a partir del numero de parametros, no verificadas para este modelo).
- GPU recomendadas para FP16: A100 40GB, H100, L40S o RTX 4090 (24 GB) para secuencias moderadas.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, o en GPUs de 8-12 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: transformers, text-generation-inference (tag TGI), vLLM y llama.cpp/Ollama previa conversion a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kanana-1.5-8b-instruct-2505-Persona-Merged | 8B | no disponible | Apache 2.0 | Hugging Face, 60 descargas |
| kakaocorp/kanana-1.5-8b-instruct-2505 (base) | 8B | no disponible | no disponible en esta ficha | Hugging Face (Kakao Corp) |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Amplia disponibilidad |
| Qwen2.5 7B Instruct | 7B | 32K (128K en variantes Turbo) | Apache 2.0 | Amplia disponibilidad |

La comparativa de rendimiento no esta disponible: no hay benchmarks publicados para este derivado. Frente a Llama 3.1 8B o Qwen2.5 7B, este modelo carece de documentacion de evaluacion y de comunidad, por lo que su eleccion frente a alternativas establecidas no esta justificada sin pruebas propias.

## Limitaciones y advertencias

- Model card extremadamente escasa: no documenta dataset, hiperparametros, contexto ni evaluacion.
- Riesgo de alucinacion propio de un modelo de 8B sin evaluacion publicada; no apto para produccion sin validacion.
- Idiomas: solo se declara ingles; el posible soporte coreano del modelo base no esta garantizado tras el merge.
- Longitud de contexto desconocida: no planificar aplicaciones con contexto largo sin medirla.
- Sesgos: no documentados; al ser un finetune comunitario sin evaluacion, pueden amplificarse sesgos del modelo base o del dataset de ajuste.
- Licencia Apache 2.0 permisiva para uso comercial, pero el autor no ofrece garantias ni soporte.
- Numero de descargas muy bajo (60) y cero likes: sin validacion por parte de la comunidad.
- El nombre "Persona-Merged" sugiere un cambio de comportamiento no cuantificado; conviene comparar contra el modelo base antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/NotoriousH2/kanana-1.5-8b-instruct-2505-Persona-Merged
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth: https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
