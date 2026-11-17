# Raghav-Singhal/1pp-0.98b-v2-spp-sft

## Resumen

1pp-0.98b-v2-spp-sft es un modelo de lenguaje de 981.548.544 parametros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el contexto del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. Se trata de un artefacto de investigacion, no de un asistente de proposito general: forma parte de una "escalera de escalado" (scaling ladder) que compara distintas condiciones de preentrenamiento sobre un corpus comun. En concreto, esta ficha corresponde a la condicion SPP{T0}, una reimplementacion de un baseline del paper SPP sobre el corpus crudo de 1PP (documentos DCLM-edu), seguida de un ajuste supervisado (SFT).

El modelo emplea una arquitectura decoder de estilo Llama con 24 capas, hidden de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atencion y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000 y embeddings no atados. La longitud de secuencia es de 4.096 tokens y el vocabulario parte de SmolLM2 (49.152 tokens) ampliado con dos tokens especiales: `<|pad|>` y el marcador SPP `<assistant>`.

La peculiaridad tecnica central es la insercion de "reflexiones en primera persona" generadas por un modelo de reflexion SPP{T0} en 7.738.994 documentos, junto con una mascara de atencion que impide que el texto posterior a la reflexion atienda a esta. El modelo se entrena sobre los tokens de reflexion pero no sobre el marcador. Es relevante ahora como pieza reproducible de un estudio de escalado sobre preentrenamiento con personas sinteticas, con pesos verificados frente al checkpoint original de Megatron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atencion / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.548.544 (aproximadamente 0,98B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); repo de 2,0 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimension oculta de 1.536, FFN de 6.144 con activacion SwiGLU, 12 cabezas de atencion con 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) mas `<|pad|>` (id 49152) y el marcador SPP `<assistant>` (id 49153); `<|endoftext|>` actua como token de fin de documento.

El preentrenamiento se realizo sobre 18.779 pasos del flujo alineado por pasos del modelo raw, con 39,38B posiciones de token, batch global de 512 x 4.096 tokens y mascara de atencion entre documentos. El optimizador es Muon (shape scaling, LR de matriz 0,005) con Adam para el resto de parametros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas), warmup de 1.181 pasos, fase constante y decaimiento lineal sobre los ultimos 1.877 pasos hasta 1/100, weight decay 0,1, std de inicializacion 0,0103 y bf16. La innovacion central de la condicion SPP{T0} es que 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte, que flagelo 3.869.498 documentos, el 4,6%, mas un numero igual de documentos aleatorios no marcados) llevan una reflexion en primera persona escrita por el modelo de reflexion SPP{T0}, insertada en una posicion elegida por ese modelo: marcador `<assistant>`, reflexion de como maximo 256 tokens y resto del documento. El modelo entrena sobre los tokens de reflexion pero no sobre el marcador, y la mascara de atencion SPP impide que el texto posterior atienda a la reflexion. El ajuste supervisado consistio en una epoca sobre una mezcla de 400k conversaciones (`jkminder/model-raising-pb-100k-3c-mt-sft` con 98,5k multiturno, `dlab-spp/sp-sft-normal-300k` menos prompts duplicados con 271,6k, y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`), con el mismo stack (Megatron, Muon, ChatML sin turno de sistema, perdida solo en turnos del asistente), LR de matriz 0,002, semilla 28, batch global 128 x 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generacion de texto autoregresiva en ingles, con formato de chat ChatML sin turno de sistema.
- Escritura de "reflexiones" en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo genera una reflexion (no existe token que marque su final).
- Conversacion multiturno tras el SFT, con perdida entrenada exclusivamente sobre turnos del asistente.
- Razonamiento basico y respuesta a instrucciones derivados del SFT sobre mezclas de conversaciones (incluida una pista de seguridad).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de pensamiento explicito: no hay evidencia de ello en la informacion disponible.
- Capacidad multilingue limitada al ingles (idioma declarado: en).
- No es un asistente de proposito general: el autor lo describe explicitamente como artefacto de investigacion.

## Casos de uso

- Investigacion sobre preentrenamiento con personas sinteticas: replicar y comparar la condicion SPP{T0} frente al modelo raw (`1pp-0.98b-v2-raw-base`) sobre el mismo flujo de documentos y el mismo schedule, para aislar el efecto de las reflexiones insertadas.
- Estudio de escalado (scaling ladder): usar este checkpoint como peldaño de 0,98B dentro de la coleccion 1PP para trazar curvas de perdida de validacion entre tamanos y condiciones.
- Analisis de mascaras de atencion: inspeccionar como la mascara SPP (que impide que el texto posterior atienda a la reflexion) afecta la modelizacion del documento, comparando perdidas por token (2,497 para texto de documento, 2,601 para texto de asistente, 2,641 para texto de usuario en el modelo base).
- Generacion controlada de reflexiones: dado un documento, anadir `<assistant>` y obtener una reflexion en primera persona de hasta 256 tokens, util para estudiar la calidad y diversidad de personas sinteticas generadas por el modelo de reflexion.
- Ajuste fino academico: partir de este checkpoint SFT (perdida held-out de 2,045 en tokens de asistente sobre 1.998 conversaciones) como base para experimentos de alineamiento o evaluacion de sesgos en modelos pequenos.
- Verificacion de reproducibilidad: comparar los pesos de Hugging Face con el checkpoint de Megatron recomputando perdidas de validacion (diferencia absoluta reportada de 0,0000 en los segmentos [3, 4] de sft_val).
- Evaluacion de seguridad: analizar el efecto del clasificador gte que marco 3.869.498 documentos (4,6%) y de la muestra de 30k conversaciones de seguridad incluida en el SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos numericos reportados son perdidas de validacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion del modelo base, texto de documento (2.433 documentos held-out) | 2,497 |
| Perdida de validacion del modelo base, texto de asistente | 2,601 |
| Perdida de validacion del modelo base, texto de usuario | 2,641 |
| Perdida held-out SFT, tokens de asistente (1.998 conversaciones) | 2,045 |
| Perdida HF vs. referencia Megatron, sft_val segmentos [3, 4] | 2,0455 vs. 2,0454 (diff. abs. 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 981.548.544 parametros, los pesos en bf16 ocupan aproximadamente 2,0 GB (tamano del repo), por lo que la inferencia en bf16 requiere un margen adicional para cache KV y activaciones.
- Con contexto de 4.096 tokens y 4 cabezas KV de dimension 128 (24 capas), la cache KV es comparativamente pequena, lo que favorece el despliegue en GPU de gama media.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano, cabe previsiblemente en GPU de consumo con VRAM suficiente (por ejemplo, RTX 4090 de 24 GB) en bf16, aunque el autor no publica requisitos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se mencionan vLLM, llama.cpp, Ollama ni TGI de forma explicita mas alla del tag de TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.98b-v2-spp-sft (este modelo) | 981.548.544 (aprox. 0,98B) | 4.096 | Apache 2.0 | Condicion SPP{T0} + SFT de la escalera 1PP; solo ingles |
| 1pp-0.98b-v2-raw-base | aproximadamente 0,98B (mismo tamano) | 4.096 | no disponible en la informacion | Modelo raw de referencia del mismo flujo de datos, sin reflexiones SPP |
| SmolLM2 (familia) | no disponible | no disponible | no disponible | Solo se cita su vocabulario de 49.152 tokens como base del tokenizador |
| Modelos de la coleccion 1PP (otros peldaños) | no disponible | no disponible | no disponible | Misma receta de SFT y misma escalera de escalado |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible: no se han publicado benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que no es un asistente de proposito general; no debe desplegarse como tal en produccion.
- Solo ingles: el unico idioma declarado es `en`.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinacion: no se reportan evaluaciones de factualidad; al ser un modelo de menos de 1B parametros entrenado sobre 39,38B posiciones de token, la fiabilidad factografica es previsiblemente baja (sin datos publicados).
- Sesgos conocidos: no disponibles en la informacion; el corpus deriva de DCLM-edu y el clasificador gte marco 3.869.498 documentos (4,6%) por seguridad, pero no se documentan sesgos concretos.
- Discrepancia de mascara de atencion: el entrenamiento usa la mascara SPP (el texto posterior a una reflexion no atiende a esta), pero la atencion causal estandar de Hugging Face permite que el texto posterior vea la reflexion, algo que el entrenamiento nunca hizo. Esto puede degradar el comportamiento respecto al checkpoint de Megatron en ese regimen.
- Formato de chat estricto: ChatML sin turno de sistema; la generacion se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Sin token de fin de reflexion: no existe marcador que delimite el final de una reflexion generada.
- Documentos no entrenados: 1.289 de 80,9M documentos cayeron fuera del final de una mitad de datos y no fueron entrenados.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantia alguna sobre idoneidad; el uso responsable recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-spp-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: `jkminder/model-raising-pb-100k-3c-mt-sft` (referenciado en la model card, sin URL completa disponible)
- Dataset SFT normal: `dlab-spp/sp-sft-normal-300k` (referenciado en la model card, sin URL completa disponible)
- Dataset SFT de seguridad: `dlab-spp/sp-sft-safety-180k` (referenciado en la model card, sin URL completa disponible)
