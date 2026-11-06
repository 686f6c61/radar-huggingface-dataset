# Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-seed42-sft

## Resumen

El modelo `1pp-2.81b-v2-asst-rawanneal-seed42-sft` es un modelo de lenguaje de 2.807.699.328 parametros desarrollado por Raghav-Singhal como parte del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. Se trata de una variante de "mid-training" de la escalera de escalado v2 del proyecto: un modelo base preentrenado sobre documentos originales de DCLM-edu y posteriormente sometido a un cooldown sobre conversaciones reescritas a partir de esos mismos documentos, con la funcion de perdida aplicada unicamente a los turnos del asistente, y finalmente afinado con SFT supervisado. Es, por tanto, un artefacto de investigacion disenado para estudiar el efecto del preentrenamiento orientado a persona y conversacion, no un asistente de proposito general.

La arquitectura es un decoder estilo Llama de 24 capas, con dimension oculta de 2.688, FFN de 10.752 con activacion SwiGLU, 21 cabezas de atencion y 7 cabezas KV (dimension de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin sesgos ni QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) mas un token `<|pad|>`.

Su relevancia es metodologica: forma parte de una matriz controlada de cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones y tres semillas (28, 42 y 1234), donde cada modelo se entrena desde cero con 20,3 tokens de asistente por parametro sobre el mismo flujo de datos alineado por pasos. Este ejemplar concreto corresponde a la semilla 42, condicion "asst" (documentos originales seguidos de conversaciones reescritas, con perdida en el turno del asistente durante el cooldown) y variante "rawanneal" de mid-training.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, sin QK-norm, embeddings no atados) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo emplea un decoder transformer denso de tipo Llama con 24 capas, dimension oculta de 2.688 y FFN de 10.752 con SwiGLU, 21 cabezas de atencion con 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin sesgos y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) ampliado con `<|pad|>`; `<|endoftext|>` actua como token de fin de documento. La longitud de secuencia es de 4.096 tokens y se aplica mascara de atencion cruzada entre documentos.

El preentrenamiento de esta variante de mid-training arranca del run raw `1pp-2.81b-v2-raw-seed42-base` hasta el paso 48.339 (ultimo paso a learning rate pico) y despues ejecuta el cooldown (los ultimos 5.370 de 53.709 pasos) sobre las conversaciones 1PP en lugar de los documentos originales, con perdida unicamente en los turnos del asistente. Los corpus estan alineados por pasos, de modo que cada paso de cooldown contiene las conversaciones reescritas a partir de los documentos que el run raw vio en ese mismo paso. Los primeros 53.709 pasos del flujo alineado 1PP cubren 112,64B posiciones de token. El batch global es de 512 x 4.096 tokens, con optimizador Muon (shape scaling, LR de matriz 0,005) y Adam para el resto de parametros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 3.378 pasos, fase constante y decaimiento lineal en los ultimos 5.370 pasos hasta 1/100; weight decay 0,1; init std 0,0078; bf16.

Tras el preentrenamiento se aplica un SFT de una epoca sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track citado a constitucion), `dlab-spp/sp-sft-normal-300k` menos los prompts duplicados en el primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usa el mismo stack (Megatron, Muon, ChatML sin turno de sistema, perdida solo en turnos de asistente), LR de matriz 0,001 (el menor loss de validacion SFT en una rejilla con semilla 28 para este tamano y condicion), semilla 28, batch global 128 x 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. El loss de validacion SFT retenido (tokens de asistente, 1.998 conversaciones) es 1,774, verificado contra el checkpoint de Megatron con diferencia absoluta 0,0000. El loss de validacion de preentrenamiento por token sobre 2.433 documentos retenidos es 1,412 para texto de asistente, 5,857 para texto de usuario y 2,899 para texto de documento.

## Capacidades

- Generacion de texto conversacional en ingles, con formato ChatML sin turno de sistema.
- Razonamiento de un solo turno y multiturno dentro de la ventana de 4.096 tokens.
- Respuesta condicionada por persona: el preentrenamiento 1PP reescribe documentos como conversaciones, de modo que el modelo aprende a producir turnos de asistente coherentes con el contenido fuente.
- Capacidad de seguir instrucciones y mantener rol de asistente gracias al SFT sobre 400k conversaciones.
- Generacion de codigo y matematicas: no se documenta ninguna evaluacion especifica; la model card no reporta capacidades de codigo ni resultados de HumanEval o GSM8K.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo es un artefacto de investigacion, no un asistente de proposito general.
- Capacidades multilingues: solo ingles declarado (`language: en`).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Parada de generacion en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.

## Casos de uso

- Investigacion sobre preentrenamiento orientado a persona: el modelo sirve como punto de la matriz 4 tamanos x 3 condiciones x 3 semillas para medir el efecto de reescribir documentos como conversaciones y aplicar perdida solo en el turno del asistente; su valor esta en la comparabilidad con las otras celdas de la escalera.
- Estudio de mid-training y cooldown: al ser una variante "rawanneal" que sustituye los documentos por conversaciones en los ultimos 5.370 pasos, permite aislar el efecto del cooldown conversacional frente al run completo `1pp-2.81b-v2-asst-seed42-sft` y frente al base `1pp-2.81b-v2-raw-seed42-base`.
- Experimentos de alineacion y SFT: con un loss SFT de 1,774 sobre 1.998 conversaciones retenidas, es util como punto de partida para probar recetas de SFT, mezclas de datos y tasas de aprendizaje a escala 2,8B.
- Destilacion y generacion de datos sinteticos: el modelo puede generar turnos de asistente en ingles sobre documentos tecnicos o educativos (DCLM-edu) para construir datasets conversacionales, siempre con revision humana por su tamano reducido y su naturaleza de investigacion.
- Evaluacion de tecnicas de entrenamiento (Muon vs Adam, mascara de perdida, alineacion por pasos): el modelo documenta hiperparametros y verificacion exacta contra Megatron, lo que lo hace adecuado como referencia reproducible en estudios de optimizacion.
- Despliegue en entornos con recursos limitados para pruebas internas: con 2,81B parametros y contexto de 4.096 tokens, cabe en una sola GPU de 24 GB en bf16 y en GPUs de consumo con cuantizacion, lo que facilita prototipos de investigacion sin infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta perdidas de validacion:

| Conjunto | Metrica | Valor |
|---|---|---|
| Validacion de preentrenamiento (2.433 documentos retenidos) | Loss por token, texto de asistente | 1,412 |
| Validacion de preentrenamiento (2.433 documentos retenidos) | Loss por token, texto de usuario | 5,857 |
| Validacion de preentrenamiento (2.433 documentos retenidos) | Loss por token, texto de documento | 2,899 |
| Validacion de preentrenamiento (2.433 documentos retenidos) | Loss ponderado por tokens de entrenamiento de la condicion (`reweighted_seg34`) | 1,458 |
| Validacion SFT (1.998 conversaciones retenidas) | Loss en tokens de asistente | 1,774 |
| Verificacion HF vs Megatron (sft_val segmentos [3, 4]) | Diferencia absoluta | 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica unos 7-9 GB con contexto completo de 4.096 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3 GB de pesos; en 4 bits, alrededor de 1,5-2 GB, aunque no se documentan ficheros GGUF oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para inferencia en bf16 sin cuantizar con margen; una RTX 4090 (24 GB) es mas que suficiente para bf16 a contexto completo.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB con cuantizacion (sujeto a conversion propia, ya que no se publican GGUF).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y conversion a llama.cpp/Ollama/vLLM no documentada oficialmente pero viable por la arquitectura Llama estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `1pp-2.81b-v2-asst-rawanneal-seed42-sft` | 2,81B | 4.096 | Apache 2.0 | Variante mid-training con cooldown conversacional; artefacto de investigacion |
| `1pp-2.81b-v2-asst-seed42-sft` | 2,81B | 4.096 | Apache 2.0 | Run 1PP completo de la misma celda (tamano, condicion, semilla); comparable directo |
| `1pp-2.81b-v2-raw-seed42-base` | 2,81B | 4.096 | Apache 2.0 | Modelo base raw del que parte esta variante, sin cooldown conversacional |
| SmolLM2 (familia, referencia de tokenizador) | 135M-1,7B | hasta 8.192 en variantes | Apache 2.0 | Comparte vocabulario (49.152); no es comparable en tamano con la rung de 2,81B |

No se dispone de datos de rendimiento en benchmarks para establecer una comparacion cuantitativa con modelos de proposito general del mismo tamano; la comparacion relevante es interna a la escalera 1PP.

## Limitaciones y advertencias

- Artefacto de investigacion: la propia model card indica explicitamente que no es un asistente de proposito general; no debe desplegarse en produccion orientada a usuarios sin una evaluacion adicional.
- Solo ingles: el modelo declara unicamente `en`; el rendimiento en otros idiomas no esta evaluado y previsiblemente sera pobre.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo (documentos extensos, repositorios de codigo, conversaciones muy largas).
- Sin turno de sistema: el formato ChatML omite el rol de sistema porque el modelo nunca lo vio durante el entrenamiento; inyectar uno puede degradar la calidad de las respuestas.
- Riesgo de alucinacion: con 2,81B parametros y un preentrenamiento de 112,64B posiciones de token, la cobertura factual es limitada; no se han publicado evaluaciones de factualidad.
- Sesgos: el corpus DCLM-edu y las mezclas de SFT pueden introducir sesgos de dominio (contenido educativo) y de estilo; no se documenta ninguna evaluacion de sesgo ni de seguridad mas alla de la inclusion de `dlab-spp/sp-sft-safety-180k` en el SFT.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigacion sin garantias, el uso comercial conlleva riesgo reputacional y de calidad no cuantificado.
- Sin ficheros GGUF ni cuantizaciones oficiales publicadas: el despliegue en hardware limitado requiere conversion propia y validacion posterior.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-seed42-sft
- Run 1PP completo comparable: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-seed42-sft
- Modelo base raw de partida: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed42-base
- Coleccion 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
