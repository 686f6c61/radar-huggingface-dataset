# Raghav-Singhal/1pp-0.58b-v2-asst-sft

## Resumen

1pp-0.58b-v2-asst-sft es un modelo de lenguaje de 580 millones de parametros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. No es un asistente de proposito general, sino un artefacto de investigacion disenado para estudiar como distintas condiciones de preentrenamiento afectan al comportamiento de un modelo conversacional. La variante aqui descrita corresponde al rung de 0,58B de la "ladder v2", con la condicion de preentrenamiento de conversaciones reescritas y perdida limitada a los turnos del asistente, semilla 28, seguida de un ajuste supervisado (SFT).

Arquitectonicamente es un decoder estilo Llama de 24 capas, 1.152 dimensiones ocultas, FFN de 4.608 con SwiGLU y atencion con 9 cabezas y 3 cabezas KV (GQA, dimension de cabeza 128). Emplea RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. El vocabulario es el de SmolLM2 (49.152 entradas) mas un token de padding.

Su relevancia es metodologica: forma parte de un diseno experimental controlado de cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B) por tres condiciones y tres semillas, donde cada modelo se entrena desde cero sobre el mismo flujo de datos alineado por pasos durante 20,3 tokens de asistente por parametro. Esto permite aislar el efecto de la condicion de datos y de la inicializacion, algo poco habitual en modelos publicados de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, GQA 9/3 cabezas) |
| Parametros totales | 580.445.568 (580,4M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); repo de 1,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con normalizacion RMSNorm, activacion SwiGLU en la FFN, atencion con query/key/value sin biases, sin QK-norm y con embeddings de entrada y salida no atados. Usa RoPE con base 10.000 y un tokenizador basado en SmolLM2 (49.152 tokens) ampliado con `<|pad|>`; `<|endoftext|>` actua como token de fin de documento. La mascara de atencion es por documento (cross-document attention masking).

El preentrenamiento cubre los primeros 11.106 pasos del flujo alineado del estudio principal (23,29B posiciones de token), con batch global de 512 x 4.096 tokens y perdida calculada unicamente sobre los turnos del asistente. El optimizador es Muon (matrix LR 0,005, shape scaling) combinado con Adam para el resto de parametros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), con warmup de 699 pasos, fase constante y decaimiento lineal en los ultimos 1.110 pasos hasta 1/100. Weight decay 0,1, init std 0,0119 y entrenamiento en bf16 sobre Megatron. La perdida de validacion final es 1,679 sobre texto de asistente (2.433 documentos reservados).

El SFT se realiza durante una epoca sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track citado de constitucion), `dlab-spp/sp-sft-normal-300k` sin duplicados (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se mantiene el stack (Megatron, Muon) con matriz LR 0,002, semilla 28, batch 128 x 4.096, decaimiento lineal a 1/10 tras un 3% de warmup y formato ChatML sin turno de sistema. La perdida SFT en held-out (1.998 conversaciones) es 2,112. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron reproduciendo la perdida de validacion (2,1117 frente a 2,1117, diferencia 0,0000).

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML sin turno de sistema.
- Razonamiento multiturno basico dentro de ventanas de hasta 4.096 tokens.
- Aprendizaje de estilo y formato de respuesta derivado del corpus de SFT (incluye conversaciones con track de constitucion y datos de seguridad).
- Soporte de plantilla de chat incluida (`chat_template`) que renderiza exactamente el formato de entrenamiento.
- Parada de generacion en `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Monolingue: unicamente ingles segun la model card.

## Casos de uso

- Investigacion sobre condiciones de preentrenamiento: el modelo sirve como punto de comparacion en la ladder v2 para medir el efecto de la condicion de datos (conversaciones reescritas, perdida en turnos del asistente) frente a otras condiciones a igualdad de pasos y tokens.
- Estudios de escalado controlado: al compartir flujo de datos alineado por pasos con los rungs de 0,98B, 1,66B y 2,81B, permite trazar curvas de escalado con una sola variable de tamano.
- Analisis de reproducibilidad por semilla: las semillas 28, 42 y 1234 comparten orden de batches y solo varian la inicializacion, lo que facilita estudiar la varianza de resultados atribuible a la init.
- Generacion de respuestas conversacionales de referencia en ingles para tareas de destilacion o evaluacion de modelos mayores: su tamano reducido permite ejecutarlo en hardware modesto y obtener respuestas de un modelo entrenado especificamente en turnos de asistente.
- Prototipado de pipelines de evaluacion de SFT: con perdidas held-out documentadas (2,112 en 1.998 conversaciones) puede usarse como baseline de calidad de ajuste supervisado.
- Experimentos de alineacion y seguridad a pequena escala: la inclusion de 30k conversaciones del conjunto de seguridad en el SFT permite estudiar el efecto de esa mezcla en un modelo de 0,58B con recursos limitados.
- Docencia y experimentacion en entornos con una sola GPU: el checkpoint de 1,2 GB en safetensors es viable en GPUs de consumo para inferencia en precision reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta perdidas de validacion internas:

| Metrica | Valor |
|---|---|
| Perdida de validacion en texto de asistente (preentrenamiento, checkpoint final) | 1,679 |
| Perdida de validacion en texto de usuario | 5,724 |
| Perdida de validacion en texto de documento | 3,489 |
| Perdida de validacion ponderada por tokens de entrenamiento de la condicion (`reweighted_seg34`) | 1,734 |
| Perdida SFT held-out (tokens de asistente, 1.998 conversaciones) | 2,112 |
| Verificacion HF vs Megatron (sft_val segments [3, 4]) | 2,1117 vs 2,1117 (diff 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,2 GB solo para pesos; con cache KV y overhead de runtime, en torno a 2-3 GB para contextos de 4.096 tokens.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,6 GB de pesos; en 4 bits, alrededor de 0,3 GB (cuantizaciones no publicadas oficialmente, requeririan conversion propia a GGUF u otro formato).
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 lo ejecutan con holgura. Para servicio de alto throughput, A100 o H100 no son necesarias pero permitirian batchear muchas peticiones.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas; tambien es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en Hugging Face). Para llama.cpp u Ollama haria falta convertir los pesos a GGUF, ya que no se publican en ese formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-asst-sft | 580,4M | 4.096 | Apache 2.0 | en | Artefacto de investigacion, sin benchmarks publicos |
| SmolLM2-360M (referencia de tamano cercano) | 362M | no disponible en esta ficha | Apache 2.0 | en | Modelo de proposito general; su tokenizador es la base del usado aqui |
| Qwen2.5-0.5B | 494M | no disponible en esta ficha | Apache 2.0 | multilingue | Modelo generalista con benchmarks publicos |
| 1pp-0.98b-v2 (mismo estudio) | ~0,98B | 4.096 | Apache 2.0 | en | Mismo diseno experimental, rung superior de la ladder |

La comparacion con modelos generalistas es orientativa: el 1pp-0.58b-v2-asst-sft esta disenado como artefacto de investigacion y no como asistente de proposito general, por lo que la comparacion directa de rendimiento en tareas abiertas no esta respaldada por datos publicados.

## Limitaciones y advertencias

- El autor indica explicitamente que es un artefacto de investigacion del proyecto 1PP (EPFL DLAB) y no un asistente de proposito general; no deberia desplegarse como tal en produccion.
- Solo soporta ingles; no se documenta capacitacion multilingue.
- Ventana de contexto de 4.096 tokens, limitada para documentos largos o conversaciones extensas.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion; el riesgo de alucinacion es presumiblemente alto dado el reducido tamano y el objetivo experimental.
- El formato de chat no incluye turno de sistema: los modelos nunca vieron uno, por lo que inyectar instrucciones de sistema puede degradar el comportamiento.
- No se documentan capacidades de tool calling ni de agentes; no deben asumirse.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantias de calidad hace desaconsejable su uso en produccion sin evaluacion propia.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin comunidad de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-sft
- Coleccion 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
