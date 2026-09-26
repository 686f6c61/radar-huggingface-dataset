# parmanu-lcs2/Llama-3.1-6B-Instruct

## Resumen

Llama-3.1-6B-Instruct es un modelo de lenguaje de 6.030.118.912 parametros publicado por parmanu-lcs2 (Parmanu @ LCS2, IIT Delhi) como resultado de comprimir Meta-Llama-3.1-8B-Instruct mediante la tecnica de poda SNIPER, con un ratio de compresion objetivo del 25%. El modelo conserva la arquitectura transformer decoder-only de Llama 3.1, pero con bloques de atencion y MLP eliminados y capas con formas tensoriales distintas a las originales, lo que obliga a cargarlo con `trust_remote_code=True` y el fichero `modeling_pruned.py` incluido en el repositorio.

Tras la poda, el autor aplico un fine-tuning de recuperacion con LoRA sobre 2000 muestras de SlimOrca, con los adaptadores ya fusionados en los pesos base. El objetivo declarado es reducir el coste de inferencia y despliegue manteniendo el comportamiento conversacional del modelo original, un caso de uso tipico en investigacion sobre compresion de LLM y en escenarios con VRAM limitada.

El modelo se publico el 25 de septiembre de 2026 y, en el momento de redactar esta ficha, registra 0 descargas y 0 likes en HuggingFace. No se han publicado resultados de benchmarks, licencia explicita, idiomas soportados ni versiones cuantizadas, por lo que su evaluacion en produccion requiere validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Llama 3.1, podado con SNIPER (bloques de atencion/MLP eliminados y capas con formas irregulares) |
| Parametros totales | 6.030.118.912 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el fine-tuning de recuperacion se realizo con 1024 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 12,1 GB |
| Requiere codigo remoto | si (`trust_remote_code=True`, `modeling_pruned.py`) |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3.1-8B-Instruct y se comprime con SNIPER (paper en arXiv:2608.12953), un metodo de poda estructurada/no estructurada segun el cual se eliminan bloques completos de atencion y MLP y se recortan las dimensiones de las capas restantes. La calibracion se realizo con 50 muestras de 512 tokens del dataset slim_orca. El ratio de compresion objetivo fue del 25%, lo que deja el recuento final en 6.030.118.912 parametros (una reduccion aproximada del 24,6% respecto a los 8B del modelo original).

Para recuperar calidad tras la poda, el autor aplico un fine-tuning con LoRA sobre 2000 muestras de Open-Orca/SlimOrca durante 1 epoch, con longitud de contexto de 1024 tokens, learning rate 0,0002, rango de LoRA 64 y alpha 16. Los modulos objetivo de LoRA fueron `up_proj`, `gate_proj`, `down_proj`, `q_proj`, `o_proj`, `k_proj` y `v_proj`, y los adaptadores se fusionaron posteriormente en los pesos base. Todo el proceso (poda y fine-tuning) se ejecuto en una unica GPU NVIDIA A100. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni fases de RLHF o DPO posteriores a la poda.

## Capacidades

- Generacion de texto conversacional en ingles (idioma implicito del dataset SlimOrca), aunque no se declara oficialmente la lista de idiomas soportados.
- Instrucciones de tipo chat, heredadas del ajuste de Meta-Llama-3.1-8B-Instruct y reforzadas con el fine-tuning de recuperacion sobre SlimOrca.
- Razonamiento basico y respuesta a preguntas de dominio general, con la calidad degradada esperable tras una poda del 25% y un fine-tuning de recuperacion de solo 2000 muestras.
- Generacion de codigo y matematicas sencillas, en la medida en que estas capacidades sobreviven al proceso de poda; no hay evaluacion publicada que lo cuantifique.
- Soporte de tool calling / function calling: no disponible. No se declara en la model card, aunque el modelo base Llama 3.1 si lo soporta de serie.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidad multimodal: no disponible (modelo exclusivamente de texto).
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Prototipado en una sola GPU: al ocupar unos 12 GB en fp16, el modelo se puede cargar en una RTX 4090 o RTX 3090 para validar ideas de producto sin depender de un cluster.
- Investigacion sobre compresion de LLM: sirve como punto de comparacion reproducible frente al modelo original de 8B para medir la perdida de calidad asociada a una poda del 25% con recuperacion LoRA ligera.
- Fine-tuning especifico de dominio: al ser un modelo de 6B con adaptadores ya fusionados, es un candidato razonable para ajustes posteriores con QLoRA en una GPU consumer, siempre que se respete la licencia del modelo original.
- Generacion de texto y resumen de documentos cortos en local: adecuado para entornos con requisitos de privacidad donde los datos no pueden salir de la maquina, con la salvedad del contexto efectivo de 1024 tokens usado en el fine-tuning.
- Clasificacion y extraccion de informacion: tareas de etiquetado, extraccion de entidades o normalizacion de campos en pipelines batch donde el coste por token es critico.
- Asistente conversacional de dominio acotado: chatbots de soporte interno con conocimiento inyectado mediante recuperacion (RAG), aprovechando el formato instruct heredado de Llama 3.1.
- Base para destilacion o generacion de datos sinteticos: util para producir datasets de entrenamiento a bajo coste con un modelo mas ligero que el original de 8B.
- Educacion e investigacion academica: el modelo y su pipeline SNIPER se pueden usar como material didactico sobre poda estructurada y recuperacion con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de perplejidad, ni comparaciones cuantitativas con el modelo original de 8B. El unico dato de rendimiento indirecto es el ratio de compresion del 25% y el recuento final de parametros.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 12,1 GB solo para los pesos, mas el espacio de activaciones y cache KV; en la practica, entre 13 y 16 GB segun la longitud de secuencia configurada. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- VRAM estimada en int8: aproximadamente 6-7 GB de pesos. En int4: aproximadamente 3,5-4 GB. No obstante, el repositorio no publica pesos cuantizados, por lo que habria que generarlos.
- GPU recomendadas: NVIDIA A100 (la usada por el autor), H100, A10G, L40S. En consumer, RTX 4090 (24 GB) y RTX 3090 (24 GB) son las opciones mas comodas; una RTX 4080 (16 GB) queda al limite en fp16 y dependeria del uso de cuantizacion.
- Cabe en GPU consumer: si, en tarjetas de 24 GB en fp16 y en tarjetas de 8-12 GB si se cuantiza previamente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via soportada oficialmente. El repositorio incluye el tag `text-generation-inference`, por lo que TGI podria ser viable si soporta la arquitectura podada. En vLLM, llama.cpp, Ollama o LM Studio no hay soporte garantizado, ya que la arquitectura irregular definida en `modeling_pruned.py` requiere integracion especifica y no existen pesos GGUF publicados.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.1-6B-Instruct (este modelo) | 6,03B | no disponible (fine-tuning de recuperacion a 1024 tokens) | no disponible | HuggingFace, safetensors |
| Meta-Llama-3.1-8B-Instruct | 8B | no disponible en la informacion recogida | no disponible en la informacion recogida | HuggingFace |
| parmanu-lcs2/Qwen3-6B | 6B segun la denominacion del repositorio | no disponible | no disponible | HuggingFace |

La comparativa directa con alternativas de la misma categoria no puede completarse con datos verificados: no hay benchmarks publicados de este modelo ni cifras de contexto o licencia de las alternativas en la informacion disponible. La diferencia objetiva y verificable frente al modelo original es el recuento de parametros (6,03B frente a 8B, un 24,6% menos), con el resto de dimensiones pendientes de medicion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de Llama 3.1 y entrenarse sobre SlimOrca, es esperable que herede sesgos de ambos, pero no hay evaluacion publicada.
- Riesgo de alucinacion: no cuantificado. La combinacion de poda agresiva (25%) y un fine-tuning de recuperacion de solo 1 epoch sobre 2000 muestras incrementa el riesgo de degradacion de calidad, especialmente en tareas de conocimiento factual y razonamiento largo.
- Contexto limitado: el fine-tuning de recuperacion uso 1024 tokens, muy por debajo de la ventana del modelo original. Aunque la arquitectura pueda aceptar secuencias mas largas, la calidad fuera de ese rango no esta validada.
- Idiomas: no se declara la lista de idiomas soportados. El entrenamiento de recuperacion se hizo integramente en ingles (SlimOrca), por lo que el rendimiento en castellano u otros idiomas es incierto.
- Licencia: no disponible en el repositorio. Al ser una obra derivada de Meta-Llama-3.1-8B-Instruct, es muy probable que quede sujeta a la Llama 3.1 Community License y a sus restricciones de uso comercial y de atribucion, pero esto debe verificarse con el autor antes de cualquier despliegue en produccion.
- Compatibilidad de despliegue: requiere `trust_remote_code=True` y ejecucion de codigo Python incluido en el repositorio, lo que implica una revision de seguridad previa. El soporte en motores de inferencia de alto rendimiento (vLLM, llama.cpp) no esta garantizado.
- Madurez del artefacto: 0 descargas y 0 likes, publicado en 2026 y sin senales de mantenimiento. No es un modelo recomendable como dependencia estable sin validacion exhaustiva.
- Ausencia de metricas: no hay benchmarks, ni evaluacion de seguridad, ni comparativa con el modelo original, lo que impide estimar la perdida real de calidad de la poda.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/parmanu-lcs2/Llama-3.1-6B-Instruct)
- [Paper de SNIPER (arXiv:2608.12953)](https://arxiv.org/abs/2608.12953)
- [Parmanu @ LCS2 IIT Delhi (sitio del proyecto)](https://parmanu.lcs2.in/)
- [Organizacion Parmanu en GitHub](https://github.com/parmanu-lcs2)
- [Modelo relacionado: parmanu-lcs2/Qwen3-6B](https://huggingface.co/parmanu-lcs2/Qwen3-6B)
- [Modelo original: meta-llama/Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- [Dataset Open-Orca/SlimOrca](https://huggingface.co/datasets/Open-Orca/SlimOrca)
- [Pagina de Llama 3 en Meta for Developers](https://developer.meta.com/ai/models/llama-3/)
