# ansarbuilds/hedwig-97m

## Resumen

Hedwig 97M es un modelo de lenguaje de tipo GPT entrenado desde cero en PyTorch puro por el desarrollador independiente ansarbuilds. Con 97.581.824 parametros (~97,6 M), 12 capas, ancho de 768, 12 cabezas de atencion y una ventana de contexto de 256 tokens, esta disenado como modelo ligero para narracion de cuentos (storytelling) y correccion gramatical, no como asistente de proposito general. Incluye tokenizer BPE propio de 8.192 piezas y un pipeline completo de preentrenamiento, SFT y DPO con cuantizacion int8/int4 implementada tambien desde cero.

El modelo se preentrena sobre 159 millones de tokens (614 MB) mezclando TinyStories, FineWeb-Edu y diez novelas de dominio publico de Project Gutenberg. Posteriormente pasa por una etapa de SFT con 30.930 pares (TinyStories-Instruct y 15.000 reescrituras gramaticales/tono de grammarly/coedit) y una etapa de DPO anclado con 22.236 pares elegidos/rechazados. Todo el entrenamiento se realizo en una unica NVIDIA A40 (48 GB) durante aproximadamente 66 minutos, con un coste estimado de 0,65 USD.

Su relevancia es fundamentalmente educativa y de investigacion: demuestra un ciclo completo de entrenamiento reproducible (tokenizer, transformer moderno con RoPE, RMSNorm, SwiGLU, SDPA y bf16, SFT, DPO y cuantizacion) a un coste minimo, con pesos publicados bajo licencia MIT y artefactos de 55 a 196 MB que caben en hardware muy modesto, incluso en inferencia CPU/Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con RoPE, RMSNorm, SwiGLU, SDPA, entrenado en bf16 |
| Parametros totales | 97.581.824 (~97,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (block_size) |
| Tipos de cuantizacion | bfloat16, int8 (98,2 MB), int4 empaquetado (55,2 MB), todas implementadas desde cero |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (.pt): brain.pt, brain_chat.pt, brain_dpo.pt y variantes _int8/_int4; tokenizer.json |
| Tokenizer | BPE propio de 8.192 piezas |
| Capas / ancho / cabezas | 12 / 768 / 12 |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

Hedwig es un transformer decoder-only estilo GPT con 12 capas, dimension de modelo 768 y 12 cabezas de atencion, usando RoPE para codificacion posicional, RMSNorm para normalizacion, SwiGLU como activacion en el bloque feed-forward y atencion escalada con SDPA, con entrenamiento en bf16. La ventana de contexto es de 256 tokens, coherente con el dominio de cuentos cortos para el que fue disenado. El tokenizer BPE de 8.192 piezas fue entrenado desde cero junto con el modelo.

El preentrenamiento (etapa 1) uso 20.000 pasos sobre 159 M tokens (614 MB): 366,7 MB de TinyStories, 262,1 MB de FineWeb-Edu (karpathy/fineweb-edu-100b-shuffle, ODC-By) y diez novelas de dominio publico anteriores a 1929 de Project Gutenberg. La etapa 2 de SFT (1.500 pasos) mezclo 30.930 pares de TinyStories-Instruct y 15.000 reescrituras gramaticales y de tono de grammarly/coedit (Apache-2.0). La etapa 3 aplico DPO anclado sobre 22.236 pares elegidos/rechazados, alcanzando un win-rate pico del 96,7 % y del 95,0 % en el checkpoint guardado. Todo el codigo de entrenamiento, la UI interactiva "Brain X-Ray" (app.py) y los registros de aprendizaje estan publicados en el repositorio GitHub del autor. La cuantizacion int8 e int4 empaquetada tambien fue desarrollada desde cero, sin librerias externas de cuantizacion.

## Capacidades

- Generacion de texto narrativo corto en ingles, orientada a cuentos infantiles y storytelling.
- Modo de correccion gramatical y ajuste de tono para mensajes cortos de uso cotidiano.
- Conversacion estilo ChatGPT mediante el formato de chat aprendido en SFT (brain_chat.pt).
- Alineacion por preferencias gracias a DPO anclado (brain_dpo.pt), con win-rate medido del 95,0 % sobre el conjunto guardado.
- Inferencia offline en CPU/Apple Silicon: 54 tok/s medidos en Apple M4.
- Cuantizacion int8 e int4 para despliegue con huella de memoria reducida (98,2 MB y 55,2 MB respectivamente).
- No dispone de tool calling, function calling, soporte de agentes, vision, audio ni modos de razonamiento extendido.
- Multilingue: solo ingles.

## Casos de uso

- Generacion de cuentos infantiles offline: el modelo produce narraciones cortas coherentes en ingles, con contexto de 256 tokens suficiente para relatos breves, y puede ejecutarse sin conexion en un portatil con Apple Silicon a 54 tok/s.
- Correccion gramatical de mensajes cotidianos: gracias al entrenamiento con 15.000 pares de grammarly/coedit, puede reescribir frases cortas corrigiendo gramatica y ajustando el tono, util como corrector local en editores de texto.
- Prototipado educativo de pipelines de LLM: sirve como referencia reproducible para ensenar tokenizacion BPE, transformer moderno, SFT, DPO y cuantizacion desde cero, con scripts PyTorch puros y coste de entrenamiento inferior a 1 USD.
- Experimentacion con cuantizacion: sus checkpoints int8 e int4 permiten estudiar la degradacion de loss (de 1,235 a 1,4000 en int8 y 1,4118 en int4 sobre brain_dpo) en un modelo pequeno y rapidamente reentrenable.
- Generacion de texto embebida en dispositivos con recursos limitados: con 55,2 MB en int4, puede integrarse en aplicaciones moviles o sistemas empotrados para narracion o autocompletado de frases cortas.
- Base para fine-tuning de dominio especifico: al estar bajo licencia MIT y entrenado en menos de 70 minutos en una A40, es viable reentrenarlo o adaptarlo a otros dominios de texto corto con presupuesto minimo.
- Demostracion de alineacion por preferencias: el checkpoint DPO permite estudiar el efecto de 22.236 pares elegidos/rechazados en un modelo de menos de 100 M parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos medidos por el autor son perdidas de validacion/test y win-rate de DPO:

| Checkpoint | Precision | Tamano | Loss val/test | Notas |
|---|---|---:|---:|---|
| brain.pt | bfloat16 | 195,6 MB | 2,619 | Preentrenamiento, 20.000 pasos |
| brain_chat.pt | bfloat16 | 195,6 MB | 1,336 | SFT, 1.500 pasos |
| brain_chat_int8.pt | int8 | 98,2 MB | 1,3577 | Cuantizacion 8 bits |
| brain_chat_int4.pt | int4 | 55,2 MB | 1,3693 | Cuantizacion 4 bits empaquetada |
| brain_dpo.pt | bfloat16 | 195,6 MB | 1,235 | DPO, win-rate pico 96,7 %, guardado 95,0 % |
| brain_dpo_int8.pt | int8 | 98,2 MB | 1,4000 | Cuantizacion 8 bits |
| brain_dpo_int4.pt | int4 | 55,2 MB | 1,4118 | Cuantizacion 4 bits empaquetada |

Rendimiento de inferencia medido: 54 tok/s offline en Apple M4.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (195,6 MB de pesos mas overhead de activaciones y cache KV para 256 tokens), ~100 MB en int8 y ~55 MB en int4.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) con exceso de capacidad; el entrenamiento de referencia uso una NVIDIA A40 (48 GB), aunque por tamano del modelo bastaria mucha menos memoria.
- Cabe en GPU consumer y tambien en CPU: ejecucion offline validada en Apple M4 a 54 tok/s; viable en Raspberry Pi y sistemas empotrados en int4.
- Opciones de despliegue: scripts PyTorch puros del repositorio GitHub y la UI "Brain X-Ray" (app.py); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y los checkpoints estan en formato .pt, no GGUF/safetensors.
- Latencia y throughput: 54 tok/s medidos en Apple M4 offline; no hay datos publicados para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hedwig 97M | 97,6 M | 256 | MIT | Hugging Face + GitHub | Pesos .pt, cuantizacion propia int8/int4, solo ingles |
| TinyLlama 1.1B | 1,1 B | 2.048 | Apache-2.0 | Hugging Face | Modelo mucho mayor, contexto 8x superior |
| GPT-2 small | 124 M | 1.024 | MIT | Hugging Face | Referencia clasica de tamano similar, contexto 4x superior |
| SmolLM-135M | 135 M | 2.048 | Apache-2.0 | Hugging Face | Alternativa moderna de tamano comparable con mayor contexto |

No se dispone de datos de benchmarks que permitan comparar rendimiento de forma cuantitativa con estas alternativas; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Con 97,6 M parametros es un modelo ligero educativo y de narracion, no un asistente de proposito general; no debe usarse para tareas que requieran razonamiento complejo.
- El modo gramatical maneja ediciones cortas cotidianas, pero puede truncar texto o omitir cambios de tiempo verbal en mensajes laborales largos.
- Contexto muy limitado (256 tokens): no apto para conversaciones multi-turno largas, documentos extensos ni RAG con contextos amplios.
- Solo soporta ingles; no hay capacidades multilingues.
- Riesgo de alucinacion y de deriva tematica en generaciones fuera del dominio de cuentos infantiles.
- Sesgos derivados de los corpus de entrenamiento (TinyStories, FineWeb-Edu, Gutenberg), que pueden reflejar sesgos de genero, culturales o de epoca en las novelas pre-1929.
- Sin tool calling, agentes, vision ni audio.
- Licencia MIT permite uso comercial, pero la calidad y cobertura del modelo hacen desaconsejable su uso en produccion como asistente general; los checkpoints estan en .pt y requieren codigo propio, sin integracion documentada con frameworks de serving habituales.
- Modelo con 0 descargas y 0 likes en Hugging Face en el momento de la consulta: no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ansarbuilds/hedwig-97m
- Repositorio GitHub (scripts de entrenamiento, UI Brain X-Ray, registros): https://github.com/ansarbuilds/hedwig
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset TinyStoriesInstruct: https://huggingface.co/datasets/roneneldan/TinyStoriesInstruct
- Dataset FineWeb-Edu (karpathy/fineweb-edu-100b-shuffle): https://huggingface.co/datasets/karpathy/fineweb-edu-100b-shuffle
- Dataset CoEdIT (grammarly/coedit): https://huggingface.co/datasets/grammarly/coedit
