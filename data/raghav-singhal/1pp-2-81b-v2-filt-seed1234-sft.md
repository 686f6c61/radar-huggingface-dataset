# Raghav-Singhal/1pp-2.81b-v2-filt-seed1234-sft

## Resumen

1pp-2.81b-v2-filt-seed1234-sft es un modelo de lenguaje de 2.807.699.328 parametros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. Se trata de la variante "filtrada" (Filtered) de la escalera de escalado 1PP, con semilla 1234, sometida posteriormente a un ajuste fino supervisado (SFT). El modelo es un artefacto de investigacion disenado para comparar condiciones de preentrenamiento sobre el mismo corpus y la misma secuencia de pasos, no un asistente de proposito general.

La arquitectura es un decoder estilo Llama de 24 capas, con hidden size 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atencion y 7 cabezas KV (dimension de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin sesgos ni QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador emplea el vocabulario de SmolLM2 (49.152 entradas) mas un token `<|pad|>`.

Su relevancia es metodologica: la condicion Filtered mantiene en contexto los documentos marcados por un clasificador de seguridad (3.869.498 documentos, el 4,6% del corpus) pero les asigna perdida cero, mientras que el resto de documentos se entrenan igual que en la ejecucion "raw". Esto permite aislar el efecto del filtrado de datos de seguridad en el preentrenamiento sin alterar el empaquetado de las secuencias, algo poco habitual en la literatura de filtrado de corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; el repo contiene safetensors en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, hidden size 2.688 y FFN de 10.752 con activacion SwiGLU. Usa 21 cabezas de atencion y 7 cabezas KV con dimension de cabeza 128, RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin sesgos y sin QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se anade `<|pad|>`; `<|endoftext|>` actua como token de fin de documento.

El preentrenamiento cubre 53.709 pasos sobre el flujo alineado por pasos de la ejecucion raw (112,64B posiciones de token), con batch global de 512 x 4.096 tokens y mascara de atencion entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parametros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 3.378 pasos, fase constante y decaimiento lineal en los ultimos 5.370 pasos hasta 1/100, weight decay 0,1, desviacion estandar de inicializacion 0,0078 y entrenamiento en bf16. La particularidad de la condicion Filtered es que un clasificador de seguridad basado en gte, puntuado por fragmentos, marco 3.869.498 documentos (4,6%) cuyo fragmento de mayor puntuacion alcanza al menos 3; esos documentos permanecen en las secuencias pero sin contribuir a la perdida, y el empaquetado de datos es identico byte a byte al de la ejecucion raw.

El SFT se realizo sobre una epoca de una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track de citas a constitucion), `dlab-spp/sp-sft-normal-300k` descontando los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se mantiene el stack de preentrenamiento (Megatron, Muon, sin turno de sistema, perdida solo en turnos del asistente), con LR matricial 0,002, semilla 28, batch global de 128 x 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La perdida de validacion en el conjunto retenido de SFT (tokens del asistente, 1.998 conversaciones) es 1,838.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML sin turno de sistema.
- Razonamiento basico y respuesta a instrucciones derivadas del SFT sobre conversaciones multiturno.
- Capacidad de mantener contexto de hasta 4.096 tokens, suficiente para conversaciones de varios turnos y documentos cortos.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso con planificacion explicita.
- No dispone de modo "thinking", vision ni audio.
- Multilingue limitado: el modelo esta entrenado y evaluado unicamente en ingles.
- Capacidad de seguir el formato de chat con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).

## Casos de uso

- Investigacion sobre filtrado de datos de seguridad: el modelo sirve como condicion controlada para medir el efecto de excluir de la perdida documentos marcados por un clasificador, comparandolo con el modelo raw de la misma escalera y semilla.
- Reproduccion de experimentos de escalado: al compartir receta, corpus y secuencia de pasos con el resto de la escalera 1PP, permite replicar comparaciones de perdida de validacion entre condiciones.
- Estudio de perdida de validacion por tipo de texto: el autor publica perdidas separadas para texto de documento (2,326), texto del asistente (2,406) y texto del usuario (2,489), utiles para analizar como el preentrenamiento afecta a cada distribucion.
- Evaluacion de la calidad del SFT en modelos pequenos: con 1,838 de perdida en tokens del asistente sobre 1.998 conversaciones retenidas, sirve como referencia para estudiar la transferencia de conversaciones sinteticas a modelos de ~2,8B.
- Generacion de texto en ingles para tareas acotadas y experimentales: el modelo puede producir respuestas conversacionales en ingles dentro de su ventana de 4.096 tokens, aunque sin garantias de calidad de asistente general.
- Analisis de seguridad comparado: al incluir en el SFT una muestra del conjunto `dlab-spp/sp-sft-safety-180k`, permite estudiar el comportamiento de un modelo pequeno ante prompts de seguridad frente a la variante raw.
- Base para experimentos de ajuste posterior: su licencia Apache 2.0 y su tamano contenido (5,6 GB en safetensors) facilitan reentrenamientos y comparaciones en entornos academicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta perdidas de validacion, que se recogen a continuacion.

| Conjunto | Perdida |
|---|---|
| Texto de documento (base, 2.433 documentos retenidos) | 2,326 |
| Texto del asistente (base) | 2,406 |
| Texto del usuario (base) | 2,489 |
| SFT retenido (tokens del asistente, 1.998 conversaciones) | 1,838 |
| Verificacion HF vs. Megatron, segmentos sft_val [3, 4] | 1,8379 (diferencia absoluta 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, mas memoria para cache KV y activaciones; en la practica conviene reservar 8-10 GB.
- En cuantizacion de 8 bits, los pesos ocuparian del orden de 2,8 GB; en 4 bits, alrededor de 1,4 GB, aunque el autor no publica variantes cuantizadas y habria que generarlas.
- GPU recomendadas: cualquier GPU con 16 GB o mas (RTX 4080, RTX 4090, A10, L4) para bf16 con contexto completo; A100 o H100 para lotes grandes y mayor throughput.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080 y tarjetas con 16 GB o mas en bf16; en GPUs de 8 GB seria necesario cuantizar.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp u Ollama requeririan conversion a GGUF, no publicada por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-2.81b-v2-filt-seed1234-sft | 2,81B | 4.096 | Apache 2.0 | Condicion filtrada con SFT; perdida SFT retenida 1,838 |
| 1pp-2.81b-v2-raw-seed1234-base | 2,81B (misma arquitectura) | 4.096 | no disponible en la informacion | Ejecucion raw de referencia de la misma escalera, sin SFT |
| SmolLM2 (familia, mismo tokenizador) | 135M / 360M / 1,7B | no disponible en la informacion | no disponible en la informacion | Referencia por vocabulario compartido (49.152), no por receta |
| Otros modelos de ~3B | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El propio autor indica que es un artefacto de investigacion del proyecto 1PP (EPFL DLAB) y no un asistente de proposito general.
- Entrenado y evaluado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta caracterizado.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinacion no cuantificado; no se publican evaluaciones de veracidad ni de tasas de error factual.
- Sesgos conocidos: no documentados por el autor; al derivar de DCLM-edu y de conversaciones sinteticas, puede heredar sesgos de esas fuentes.
- El filtrado de seguridad solo afecta a la perdida, no a la presencia de los documentos en contexto, por lo que el modelo puede haber estado expuesto a contenido marcado.
- Sin soporte documentado de tool calling, agentes ni modo de razonamiento explicito.
- Formato de chat estricto sin turno de sistema: introducir uno puede degradar el comportamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de evaluaciones de seguridad desaconseja su despliegue en produccion sin validacion propia.
- No se publican pesos en GGUF ni cuantizaciones listas para usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-filt-seed1234-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-base
- Coleccion 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
