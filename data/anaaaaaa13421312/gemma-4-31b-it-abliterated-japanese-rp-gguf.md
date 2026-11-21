# anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP-GGUF

## Resumen

`gemma-4-31B-it-abliterated-Japanese-RP-GGUF` es una cuantizacion GGUF en formato `Q4_K_M` de un ajuste fino derivado de la familia Gemma 4 de Google. El modelo parte de `wangzhang/gemma-4-31B-it-abliterated` (una version "abliterated", es decir, con los rechazos del alineamiento suprimidos) y sobre ella aplica un LoRA orientado a roleplay japones multiformato y de larga duracion. El autor es el usuario de Hugging Face `anaaaaaa13421312`, que publica tanto los pesos BF16 del modelo padre como esta version cuantizada lista para `llama.cpp`.

El modelo tiene 30.697.345.596 parametros (aproximadamente 31B) y conserva el encoder de vision de 27 capas del Gemma 4 base, aunque este no se incluye en el repositorio: el autor indica que se congelo durante el entrenamiento LoRA y que puede recuperarse adjuntando un `mmproj` compatible de los repositorios oficiales de Unsloth o Google. El repositorio pesa 149,5 GB en total (incluye varios checkpoints y el archivo GGUF principal de 17,40 GiB).

Su relevancia es doble: por un lado, demuestra el flujo de cuantizacion GGUF sobre un modelo abliterated de 31B con soporte de vision y tool calling; por otro, documenta de forma inusualmente transparente los sesgos del dataset de entrenamiento (mayoritariamente conversaciones de personaje femenino y usuario masculino) y una advertencia de deprecacion sobre el checkpoint final publicado (`CP75`), que podria ser sustituido por `CP50` tras finalizar las evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), con encoder de vision de 27 capas (no incluido en el repo) |
| Parametros totales | 30.697.345.596 (~31B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como valor nominal; el autor verifica `-c 16384` en texto y `-c 12288` con vision en 2x Tesla T4 |
| Tipos de cuantizacion | `Q4_K_M` (incluido); `Q2_K`, `Q3_K_S/M/L`, `IQ4_XS`, `Q4_K_S`, `Q5_K_S/M`, `Q6_K`, `Q8_0` en repo de mradermacher |
| Idiomas soportados | japones (`ja`) e ingles (`en`) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo padre en BF16 |
| Tamano del archivo principal | 17,40 GiB / 18.687.062.624 bytes |
| Tamano del repositorio | 149,5 GB |
| Plantilla de chat | Gemma 4 IT (requiere `--jinja` en `llama-server`) |
| Formato de salida | Alterna narracion `@*...*` y dialogo `@CharacterName,texto` |
| Descargas | 1.056 |
| Fecha de creacion | 2026-11-10 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 4 (31B), con un encoder de vision de 27 capas que se mantuvo congelado en los pesos base durante el ajuste fino LoRA. El autor no documenta el numero de tokens de entrenamiento ni la composicion exacta del dataset, pero si describe su naturaleza: conversaciones de roleplay japones en formato multiformato, con 171 ejemplos de los cuales 6 son de multiples personajes liderados por personaje masculino y 0 son 1-a-1 con personaje masculino. Es decir, el dataset esta fuertemente sesgado hacia el punto de vista de usuario masculino con personajes femeninos.

La innovacion tecnica principal es el formato de salida estructurado: el modelo emite narracion entre `@*...*` y lineas de dialogo con prefijo `@NombrePersonaje,`, lo que permite separar multiples personajes en una misma respuesta. Para preservar estos prefijos de 3-5 tokens junto con el comportamiento de `final_logit_softcapping=30.0` de Gemma 4, el autor calibra cinco presets de sampler nombrados (Standard Balanced, Long-Chat Suppression, Creative/Expressive, y sus variantes Thinking-ON) pensados para `llama-server`. El modelo base `wangzhang/gemma-4-31B-it-abliterated` procede de una tecnica de abliteration que elimina la direccion de rechazo del alineamiento, lo que afecta directamente a las capacidades de contenido y a los riesgos del modelo.

## Capacidades

- Generacion de texto conversacional en japones e ingles, con especial enfasis en roleplay de multiples personajes y formato largo.
- Formato de salida estructurado con narracion `@*...*` y dialogo `@CharacterName,texto`, pensado para separar voces de personajes.
- Soporte de vision mediante `mmproj` externo (encoder de 27 capas congelado), verificado con `mmproj-F16.gguf` de Unsloth.
- Tool calling y function calling: el autor documenta un ejemplo de lanzamiento con `--jinja` y `--mmproj` orientado a tool calling mas vision.
- Capacidades de razonamiento extendido mediante modo "Thinking" (presets Thinking-ON documentados).
- Conversaciones multi-turno de larga duracion con supresion de repeticion calibrada para chats largos.
- Multilinguee limitado a japones e ingles segun la model card; no se documentan otros idiomas.
- Capacidad de contenido sin restricciones de alineamiento (abliterated), lo que incluye contenido NSFW y potencialmente danino.

## Casos de uso

- Roleplay japones multiformato: el modelo esta disenado especificamente para mantener varios personajes en una misma escena mediante el formato `@CharacterName,`, lo que lo hace adecuado para aplicaciones de ficcion interactiva y novelas visuales generativas en japones.
- Atencion al cliente en japones: puede gestionar conversaciones multi-turno con contexto de hasta 16K tokens en configuracion de texto, suficiente para historiales de soporte extensos, aunque su sesgo de entrenamiento hacia roleplay limita la calidad en dominios formales.
- Generacion de dialogos para videojuegos y visual novels: el formato estructurado de narracion y hablante permite integrar la salida directamente en motores de dialogo sin post-procesado complejo.
- Asistente multimodal con vision: adjuntando `mmproj-F16.gguf` y configurando `-c 12288`, el modelo puede describir imagenes y mantener roleplay fundamentado en ellas, verificado en 2x Tesla T4 con 22.162 MiB de VRAM.
- Tool calling en pipelines de agentes: con `--jinja` activado, el modelo puede invocar funciones en flujos de automatizacion, aunque su entrenamiento orientado a roleplay hace recomendable validar la robustez del tool calling en produccion.
- Experimentacion en investigacion sobre abliteration y alineamiento: al ser una version abliterated con documentacion transparente de sesgos y checkpoints, sirve como caso de estudio para medir el impacto de la supresion de rechazos en la calidad conversacional.
- Despliegue en hardware de consumo: la cuantizacion `Q4_K_M` de 17,40 GiB permite ejecucion en GPUs de 24 GB (por ejemplo, NVIDIA L4 o RTX 4090) con contexto reducido (`-c 3072`), lo que facilita prototipado local de aplicaciones de roleplay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones comparativas entre checkpoints (`CP50` frente a `CP75`) y una advertencia de que `CP50` podria superar a `CP75`, pero no incluye cifras numericas de MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia en texto: el autor verifica `-c 16384` en 2x NVIDIA Tesla T4; con `-c 3072` cabe en una unica GPU de 24 GB como la NVIDIA L4.
- VRAM con vision: 22.162 MiB totales en 2x Tesla T4 con `mmproj-F16.gguf` y `-c 12288`.
- GPU recomendadas: NVIDIA Tesla T4 (x2 para contexto largo), NVIDIA L4 (24 GB, contexto reducido), RTX 4090 (24 GB, contexto reducido). Para cuantizaciones mayores (`Q6_K` 23,47 GiB, `Q8_0` 30,39 GiB) se necesitan GPUs de 32 GB o mas (A100 40 GB, H100).
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con `Q4_K_M` y contexto limitado a unos 3K tokens; en GPUs de 16 GB no cabe con `Q4_K_M`, habria que recurrir a `Q3_K_M` (14,24 GiB) o `Q2_K` (11,10 GiB) con contexto muy reducido.
- Opciones de despliegue: `llama.cpp` / `llama-server` (soporte oficial del repo), `vLLM` y `transformers` (el autor indica que aplicar solo el subconjunto de parametros de sampler soportados), `Ollama` y `TGI` no se mencionan explicitamente.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `gemma-4-31B-it-abliterated-Japanese-RP-GGUF` (este) | ~31B | hasta 16K verificado | Apache 2.0 | GGUF | Roleplay japones, abliterated, vision via mmproj externo |
| `wangzhang/gemma-4-31B-it-abliterated` | ~31B | no disponible | no disponible | safetensors | Base abliterated sin ajuste de roleplay |
| `unsloth/gemma-4-31B-it-GGUF` | ~31B | no disponible | no disponible | GGUF | Version oficial sin abliteration ni ajuste RP; fuente del `mmproj` |
| `google/gemma-4-31B-it-qat-q4_0-gguf` | ~31B | no disponible | no disponible | GGUF | Cuantizacion oficial QAT de Google, sin abliteration ni RP |

La comparativa con modelos de otros linajes (Llama, Qwen, Mistral) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo de dataset documentado por el autor: el ajuste fino se entreno principalmente con conversaciones de personaje femenino y perspectiva de usuario masculino (6 de 171 ejemplos multiformato con personaje masculino; 0 de 171 en 1-a-1 masculino). La usabilidad a largo plazo para roleplay orientado a usuario femenino no se ha evaluado en profundidad.
- Advertencia de deprecacion: el checkpoint final publicado (`CP75`) podria ser superado por `CP50`; el README puede quedar obsoleto y ser reemplazado.
- Modelo abliterated: la supresion de la direccion de rechazo elimina las salvaguardas de alineamiento, lo que incrementa el riesgo de generar contenido danino, ofensivo o NSFW. La etiqueta `not-for-all-audiences` confirma esta orientacion.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad; el entrenamiento en roleplay y la abliteration pueden agravar la generacion de contenido inventado.
- Limitacion idiomatica: solo japones e ingles segun la model card; el rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 de Google puede tener terminos adicionales que el autor no detalla; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- Formato de salida no estandar: requiere `--jinja` y presets de sampler especificos; integrarlo en frameworks que no respeten `final_logit_softcapping=30.0` puede degradar la calidad.
- Vision no incluida: el archivo `mmproj` no se distribuye en el repo (el autor indica que la conversion fallo con codigo de salida 1); hay que descargarlo de Unsloth o Google.
- Contexto efectivo limitado en hardware de consumo: con 24 GB de VRAM el contexto practico baja a unos 3K tokens, lo que reduce la ventaja de ventana larga.

## Enlaces

- Repositorio GGUF: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP-GGUF
- Modelo padre BF16: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP
- README en japones: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP-GGUF/blob/main/README_ja.md
- Modelo base abliterated: https://huggingface.co/wangzhang/gemma-4-31B-it-abliterated
- Cuantizaciones comunitarias (mradermacher): https://huggingface.co/mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-GGUF
- GGUF oficial de Unsloth (fuente del `mmproj`): https://huggingface.co/unsloth/gemma-4-31B-it-GGUF
- GGUF QAT oficial de Google: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-gguf
