# Raghav-Singhal/1pp-0.58b-v2-spp-seed1234-sft

## Resumen

`1pp-0.58b-v2-spp-seed1234-sft` es un modelo de lenguaje de 580 millones de parametros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigacion, no de un asistente de proposito general: su objetivo es servir como punto de referencia (baseline) de la condicion SPP{T0} dentro de la escalera de escalado del proyecto 1PP, comparandose contra el modelo entrenado sobre el corpus crudo (`1pp-0.58b-v2-raw-seed1234-base`).

La innovacion metodologica consiste en inyectar reflexiones en primera persona generadas por un modelo de reflexion dentro de los documentos de entrenamiento, en una posicion elegida por dicho modelo y delimitada por el token marcador `<assistant>`. El modelo se entrena sobre esos tokens de reflexion pero con una mascara de atencion que impide que el texto posterior del documento atienda a la reflexion, de modo que el documento se modela como si la reflexion no estuviera presente. Esto permite estudiar el efecto de datos sinteticos de "persona" sobre el preentrenamiento sin alterar el objetivo de modelado del documento original.

Arquitectonicamente es un transformer decoder de estilo Llama de 24 capas, tras un preentrenamiento de 11.106 pasos sobre 23,29B posiciones de token y un posterior ajuste supervisado sobre 400k conversaciones. Su relevancia es fundamentalmente metodologica: documenta con precision los hiperparametros, las perdidas de validacion y el procedimiento de verificacion entre el checkpoint de Megatron y los pesos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atencion / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.447.872 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors bf16 es convertible a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder causal de 24 capas con dimension oculta de 1.152, FFN de 4.608 con activacion SwiGLU, 9 cabezas de atencion y 3 cabezas KV (head dim 128), normalizacion RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se anaden `<|pad|>` (id 49152) y el marcador SPP `<assistant>` (id 49153); `<|endoftext|>` actua como token de fin de documento.

El preentrenamiento recorre 11.106 pasos del flujo alineado por pasos del modelo crudo, lo que equivale a 23,29B posiciones de token con batch global de 512 × 4.096 tokens y mascara de atencion entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parametros (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas), con 699 pasos de warmup, fase constante y decaimiento lineal en los ultimos 1.110 pasos hasta 1/100, weight decay 0,1, std de inicializacion 0,0119 y bf16.

La condicion SPP{T0} modifica 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte, 3.869.498 documentos, el 4,6%, mas un numero igual de documentos no marcados elegidos al azar). En cada uno se inserta una reflexion en primera persona de como maximo 256 tokens tras el marcador `<assistant>`, en la posicion elegida por el modelo de reflexion. La mascara de atencion impide que el texto posterior atienda a la reflexion. El ajuste supervisado posterior consiste en una epoca sobre una mezcla de 400k conversaciones (`jkminder/model-raising-pb-100k-3c-mt-sft`, `dlab-spp/sp-sft-normal-300k` y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`), con el mismo stack (Megatron, Muon, ChatML sin turno de sistema, perdida solo en turnos del asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un 3% de warmup.

Las perdidas de validacion publicadas son: 2,615 sobre texto de documento, 2,780 sobre texto del asistente y 2,794 sobre texto del usuario para el modelo base (2.433 documentos retenidos); y 2,188 de perdida SFT sobre tokens del asistente en 1.998 conversaciones retenidas. La verificacion entre el checkpoint de Megatron y los pesos de Hugging Face da una diferencia absoluta de 0,0000 en la perdida (2,1877 en ambos).

## Capacidades

- Generacion de texto causal en ingles con formato conversacional ChatML sin turno de sistema.
- Generacion de "reflexiones" en primera persona al añadir el token `<assistant>` tras el texto de un documento; no existe token de cierre de reflexion.
- Dialogo multiturno segun el formato ChatML documentado, con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Ajuste supervisado orientado a conversacion, incluyendo una porcion de datos de seguridad (30k muestras de `sp-sft-safety-180k`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explicito, vision ni audio.
- Capacidad multilingue limitada al ingles segun la model card.
- No dispone de modo "thinking" ni de capacidades especiales mas alla de la generacion de reflexiones descrita.

## Casos de uso

- Reproduccion de experimentos de investigacion sobre datos sinteticos: el modelo sirve como baseline SPP{T0} para comparar contra el modelo crudo y otras condiciones de la escalera 1PP, manteniendo identicos documentos, orden, pasos y schedule.
- Estudio del efecto de reflexiones en primera persona en el preentrenamiento: permite aislar el impacto de los tokens de reflexion sobre la perdida de validacion de documento, asistente y usuario (2,615 / 2,780 / 2,794).
- Analisis de mecanismos de mascara de atencion: util para investigar como afecta impedir que el texto posterior atienda a contenido insertado, comparando con la atencion causal estandar de Hugging Face.
- Generacion controlada de reflexiones: añadiendo `<assistant>` tras un documento se obtiene una reflexion de hasta 256 tokens, aprovechable para construir corpus sinteticos de "persona" en experimentos propios.
- Evaluacion de recetas de SFT a pequena escala: la mezcla de 400k conversaciones y los hiperparametros documentados permiten replicar el pipeline de ajuste en modelos de ~0,6B.
- Verificacion de portabilidad de checkpoints: el procedimiento de comparacion de perdidas entre Megatron y Hugging Face (diferencia 0,0000) sirve como referencia para validar conversiones de pesos en otros proyectos.
- Docencia y formacion en tecnicas de preentrenamiento: el modelo, con 580M parametros y contexto de 4.096 tokens, es ligero enough para ejecutarse en hardware modesto en experimentos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta perdidas de validacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion, texto de documento (base) | 2,615 |
| Perdida de validacion, texto del asistente (base) | 2,780 |
| Perdida de validacion, texto del usuario (base) | 2,794 |
| Perdida SFT retenida, tokens del asistente | 2,188 |
| Perdida HF vs. referencia Megatron (segmentos [3, 4]) | 2,1877 vs. 2,1877 (dif. abs. 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB de pesos mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto y batch.
- En cuantizacion de 8 bits cabria en torno a 0,6-0,8 GB de pesos; en 4 bits, alrededor de 0,3-0,4 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en A100/H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: si, practicamente en todas las GPU dedicadas de los ultimos anos, e incluso en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y conversion a GGUF para llama.cpp/Ollama. vLLM es viable pero no esta declarado por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.58b-v2-spp-seed1234-sft | 580M | 4.096 | Apache 2.0 | Baseline SPP{T0} con reflexiones inyectadas y mascara de atencion; perdida SFT 2,188 |
| 1pp-0.58b-v2-raw-seed1234-base | no disponible (misma escala, ~0,58B) | 4.096 | no disponible | Modelo crudo de referencia del mismo proyecto, sin reflexiones; sirve de comparacion directa |
| SmolLM2 (variante ~0,6B, segun vocabulario) | no disponible | no disponible | no disponible | El tokenizador del modelo deriva de SmolLM2 (49.152 tokens); no se dispone de datos comparativos de rendimiento en la informacion |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica explicitamente que no es un asistente de proposito general.
- Solo ingles; no se documenta soporte de otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- La atencion causal estandar de Hugging Face permite que el texto posterior a una reflexion la vea, algo que el entrenamiento nunca hizo; esto genera una discrepancia entre entrenamiento e inferencia que puede degradar el comportamiento en ese escenario.
- No existe token que marque el fin de una reflexion, lo que complica el control de la generacion de reflexiones.
- El marcador `<assistant>` (id 49153) no aparece en los datos de SFT, por lo que su uso conversacional no esta alineado con el ajuste supervisado.
- Riesgo de alucinacion y sesgos no evaluados: no se publican evaluaciones de sesgo, toxicidad ni fidelidad.
- El clasificador de seguridad basado en gte marco 3.869.498 documentos (4,6%) con puntuacion maxima de chunk >= 3; el filtrado no elimina esos documentos, solo condiciona la insercion de reflexiones.
- 1.289 de 80,9M documentos quedaron fuera del final de una mitad de datos y no se entrenaron, lo que introduce una minima desviacion respecto al flujo crudo.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental del modelo desaconseja su despliegue en produccion sin evaluacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-spp-seed1234-sft
- Modelo crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-base
- Coleccion 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multi-turno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
