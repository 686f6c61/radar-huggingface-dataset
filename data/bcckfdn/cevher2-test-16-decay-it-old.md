# bcckfdn/cevher2-test-16-decay-it-old

## Resumen

cevher2-test-16-decay-it-old es un modelo de lenguaje de 1.514 millones de parametros entrenado desde cero por el usuario bcckfdn, con la arquitectura Llama/SmolLM2 como referencia. Se trata de un modelo de generacion de texto orientado a conversacion, con soporte para turco e ingles, publicado bajo licencia Apache 2.0. Su relevancia radica en ser un ejemplo de entrenamiento from scratch de un modelo de escala pequena (1,5B) con contexto de 8192 tokens, lo que lo situa en la categoria de modelos compactos desplegables en hardware de consumo.

El modelo sigue el diseno de SmolLM2 (familia de modelos pequenos de Hugging Face) en cuanto a arquitectura transformer decoder-only, con 34 capas, dimension oculta de 1792 y atencion con 28 cabezas de consulta y 7 de clave/valor (GQA). El vocabulario es de 65.536 tokens y el entrenamiento reportado alcanza los 540.672 millones de tokens, con una perdida de validacion de 1,0612.

La ficha se basa exclusivamente en los metadatos y la model card proporcionados por el autor; no se dispone de informacion publica sobre benchmarks, datos de entrenamiento detallados ni proceso de alineacion. El modelo tiene un uso muy limitado (8 descargas, 0 likes) y su nombre sugiere que se trata de una prueba experimental ("test-16-decay-it-old"), por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama/SmolLM2) |
| Parametros totales | 1.513.546.496 (~1,51B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 34 |
| Dimension oculta | 1792 |
| Cabezas Q / KV | 28 / 7 (GQA) |
| Vocabulario | 65.536 tokens |
| Tokens de entrenamiento | 540.672 millones |
| Perdida de validacion | 1,0612 (mejor) |
| Tamano del repositorio | 3,0 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only basada en Llama, con el mismo esquema que SmolLM2: 34 capas, dimension oculta de 1792, 28 cabezas de atencion para consultas y 7 para clave/valor (GQA, lo que reduce el coste de memoria del KV cache). El vocabulario de 65.536 tokens es coherente con los tokenizadores de la familia Llama/SmolLM2. El contexto maximo es de 8192 tokens.

El entrenamiento se realizo desde cero (pretrained-from-scratch) sobre 540.672 millones de tokens, segun la model card. No se especifica la composicion del dataset, la mezcla de idiomas ni si se aplicaron fases de instruccion, RLHF o DPO. El nombre del modelo incluye "it" (posiblemente instruction-tuned) y "decay", pero no hay documentacion que confirme el proceso de alineacion ni la estrategia de decaimiento de la tasa de aprendizaje. La mejor perdida de validacion reportada es 1,0612. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles.
- Conversacion multi-turno (el tag "conversational" y el sufijo "it" sugieren ajuste para instrucciones, aunque no se detalla).
- Razonamiento basico y generacion de codigo: no verificado ni documentado por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues limitadas a turco e ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatible con endpoints de Hugging Face y text-generation-inference (segun tags).

## Casos de uso

- Generacion de texto en turco para prototipos: el modelo puede emplearse para completar textos, redactar borradores o generar respuestas en turco gracias a su vocabulario y entrenamiento bilingue, aunque su calidad no esta validada con benchmarks.
- Chatbot conversacional de bajo coste: con 1,5B parametros y contexto de 8192 tokens, puede gestionar conversaciones multi-turno en entornos con recursos limitados, siempre que se valide su calidad previamente.
- Experimentacion academica en entrenamiento from scratch: sirve como referencia reproducible de un modelo de 1,5B entrenado con 540.000 millones de tokens, util para estudiar escalado y curvas de perdida.
- Generacion de texto en ingles para tareas simples: resumenes cortos, parafraseo o clasificacion generativa, con la cautela de que no hay evaluacion publica.
- Fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors, puede ajustarse con LoRA o QLoRA para dominios especificos (atencion al cliente, documentacion tecnica) en una unica GPU.
- Despliegue en entornos educativos o de investigacion: su tamano permite ejecutarlo en GPUs de consumo (cuantizado) para demostraciones y practicas de inferencia con transformers o TGI.
- Generacion de datos sinteticos en turco: puede usarse para aumentar corpus de entrenamiento en turco, con revision humana posterior dada la falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de validacion (1,0612) y el numero de tokens de entrenamiento (540.672 millones), que no son comparables directamente con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,0 GB de pesos mas KV cache; en la practica, unos 4-6 GB con contexto moderado.
- VRAM estimada en cuantizacion 8 bits: alrededor de 1,6-2,0 GB de pesos.
- VRAM estimada en cuantizacion 4 bits: alrededor de 0,9-1,2 GB de pesos (si se generan pesos GGUF/AWQ, no documentados por el autor).
- GPU recomendadas: A100, H100 o L40S para inferencia a gran escala; RTX 4090, RTX 3090, RTX 4080 para uso individual.
- Cabe en GPUs de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en FP16 cabe en GPUs con 6 GB o mas.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag endpoints_compatible); llama.cpp, Ollama o vLLM no estan documentados para este modelo y requeririan conversion de pesos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicos |
|---|---|---|---|---|---|
| cevher2-test-16-decay-it-old | 1,51B | 8192 | Apache 2.0 | tr, en | no disponible |
| SmolLM2-1.7B | 1,7B | 8192 | Apache 2.0 | en (principalmente) | si (MMLU, HellaSwag, etc.) |
| Llama 3.2 1B | 1,24B | 131.072 | Llama 3.2 Community License | multilingue | si |
| Qwen2.5-1.5B | 1,54B | 32.768 | Apache 2.0 | multilingue (incluye turco parcial) | si |

La comparativa es estructural: cevher2 comparte escala y arquitectura con SmolLM2-1.7B y Qwen2.5-1.5B, pero carece de evaluacion publica, de soporte multilingue amplio y de ecosistema de cuantizaciones. Su ventaja potencial es el entrenamiento especifico en turco, no verificado con metricas.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce su calidad real en razonamiento, codigo, matematicas o comprension lectora.
- Riesgo elevado de alucinacion: un modelo de 1,5B entrenado desde cero sin documentacion de alineacion tiende a inventar hechos, especialmente fuera de turco e ingles.
- Sesgos desconocidos: no se documenta la composicion del dataset ni filtros de toxicidad, por lo que pueden aparecer sesgos de genero, religion o nacionalidad.
- Limitacion idiomatica: solo turco e ingles; el rendimiento en castellano no esta garantizado.
- Contexto de 8192 tokens: suficiente para conversacion, pero limitado frente a modelos actuales con 32K-128K.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica como experimento ("test").
- Nombre y estado: el sufijo "old" y las 8 descargas sugieren que puede ser reemplazado o retirado; no es un artefacto estable para produccion.
- Ausencia de cuantizaciones oficiales: habria que generarlas (GGUF, AWQ) para despliegue eficiente en CPU o GPUs pequenas.
- No se documenta el proceso de instruction tuning pese al sufijo "it": el comportamiento conversacional no esta verificado.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher2-test-16-decay-it-old
- Model card del autor: incluida en la pagina de Hugging Face arriba indicada
- Repositorio SmolLM2 (arquitectura de referencia): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Repositorio Llama (arquitectura de referencia): https://github.com/meta-llama/llama
- Paper SmolLM2: https://arxiv.org/abs/2502.02737
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Text-generation-inference: https://github.com/huggingface/text-generation-inference
