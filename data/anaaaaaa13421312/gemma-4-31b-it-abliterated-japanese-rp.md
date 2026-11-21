# anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP

## Resumen

`gemma-4-31B-it-abliterated-Japanese-RP` es un ajuste fino por LoRA (fusionado en bfloat16) del modelo `wangzhang/gemma-4-31B-it-abliterated`, publicado por el usuario de Hugging Face anaaaaaa13421312. Está especializado en roleplay japonés multijugador y de formato largo, con un formato de salida propio que alterna líneas de narración (`@*...*`) y turnos de personaje (`@NombrePersonaje,diálogo`). El modelo hereda la arquitectura Gemma 4 de 31B parámetros con encoder de visión y una ventana de contexto de 262.144 tokens.

El interés del modelo es doble: por un lado, demuestra un flujo de trabajo completo de ajuste fino con Unsloth sobre un modelo abliterated (es decir, con los mecanismos de rechazo eliminados), incluyendo versiones cuantizadas en GGUF Q4_K_M, INT8 W8A8 y FP8 Dynamic; por otro, expone de forma explícita en su model card las limitaciones de su dataset (sesgo hacia perspectivas de personaje femenino y usuario masculino) y una advertencia de deprecación sobre el checkpoint publicado (CP75 frente a CP50).

Es relevante ahora porque ejemplifica una tendencia creciente: modelos derivados de pesos abiertos con fines de rol conversacional, publicados con múltiples formatos de cuantización y con documentación inusualmente transparente sobre sesgos y evaluación. No obstante, su naturaleza abliterated y su etiqueta `not-for-all-audiences` lo sitúan fuera de casos de uso comerciales convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (`Gemma4ForConditionalGeneration`) con 60 capas de texto (50 `sliding_attention` + 10 `full_attention`) y encoder de visión de 27 capas |
| Parametros totales | 31.273.086.512 (31,27 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | BF16 (principal), GGUF Q4_K_M, INT8 W8A8, FP8 Dynamic |
| Idiomas soportados | Japonés (ja) e inglés (en) según la model card; el campo `language` de los metadatos de Hugging Face no está disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 2 shards, 58,25 GiB), GGUF, cuantizaciones INT8/FP8; checkpoints LoRA en fp32 (~0,912 GiB cada uno, 244.858.880 parámetros) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 4 de 31B en configuración `Gemma4ForConditionalGeneration`, con `bfloat16` como precisión nativa. El backbone de texto consta de 60 capas que combinan atención deslizante (`sliding_attention`) y atención completa (`full_attention`), un vocabulario de 262.144 tokens y una ventana de contexto máxima de 262.144 posiciones. Incluye además un encoder de visión de 27 capas; en esta versión de 31B no hay encoder de audio (`audio_config: null`). El ajuste fino se aplicó exclusivamente sobre las capas de lenguaje mediante LoRA, manteniendo el encoder de visión congelado, y posteriormente se fusionó en pesos BF16 nativos.

El entrenamiento se realizó con Unsloth sobre el modelo base abliterated de wangzhang, con un dataset de conversaciones de roleplay japonés centrado en personajes femeninos y perspectiva de usuario masculino: según la model card, 6 de 171 conversaciones multijugador tenían personajes masculinos y 0 de 171 conversaciones uno a uno eran de personaje masculino. Se generaron checkpoints intermedios en los pasos 25, 50 y 75, más un checkpoint final. La model card advierte que la evaluación comparativa por checkpoint se omitió inicialmente al publicar CP75 y que los resultados provisionales sugieren que CP50 podría superar a CP75 en conjunto, por lo que el README podría quedar deprecado. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en japonés e inglés, con formato de roleplay estructurado: narración en `@*...*` y turnos de personaje en `@NombrePersonaje,diálogo` con acciones inline en `*...*`.
- Roleplay multijugador (varios personajes en una misma escena) y de formato largo, con separación de personas y cumplimiento de formato en turnos cortos.
- Modo de razonamiento configurable mediante `enable_thinking` (True/False) en la plantilla de chat, heredado de la especificación IT de Gemma 4.
- Procesamiento de entradas imagen-texto gracias al encoder de visión de 27 capas, aunque el ajuste fino no modificó dicho encoder.
- Conversación multi-turno con contexto muy largo (hasta 262.144 tokens).
- Compatibilidad con endpoints (`endpoints_compatible` en los metadatos).
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Roleplay japonés de formato largo: el modelo mantiene escenas multi-turno con narración y diálogo separados gracias a su formato de salida dedicado y a la ventana de 262.144 tokens, adecuado para sesiones extensas con memoria de contexto amplia.
- Simulación de personajes en ficción interactiva: la alternancia `@*...*` / `@Personaje,...` permite integrar la salida directamente en motores de novela visual o frontends de rol sin postprocesado complejo.
- Escenas multijugador con varios personajes: el ajuste incluye conversaciones con varios personajes (aunque con sesgo hacia personajes femeninos), útil para narrativa ramificada con reparto coral.
- Prototipado de investigación sobre abliteration: sirve como caso de estudio de cómo un ajuste fino por LoRA sobre un modelo abliterated afecta al cumplimiento de formato y a la coherencia de personaje, con checkpoints intermedios comparables (CP25, CP50, CP75).
- Evaluación de pipelines de cuantización: las versiones GGUF Q4_K_M, INT8 W8A8 y FP8 Dynamic permiten comparar calidad y latencia entre formatos sobre el mismo ajuste, útil para laboratorios que estudian despliegue eficiente.
- Generación bilingüe japonés-inglés para contenido narrativo: la model card incluye un prompt equivalente en inglés (SFW) que permite usar el modelo en escenarios de ficción en ambos idiomas.
- Experimentación con entradas multimodales: aunque el encoder de visión está congelado, el modelo conserva la capacidad imagen-texto de la base, aprovechable para prototipos de narrativa asistida por imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas de RP obtenidas con la cuantización GGUF Q4_K_M, pero no proporciona los valores numéricos en el extracto disponible, y señala que la inferencia BF16 extremo a extremo no se ha evaluado directamente en `transformers` porque los pesos superan los 58,25 GiB de VRAM.

## Requisitos de hardware

- VRAM para BF16: los pesos solos ocupan 58,25 GiB, por lo que se necesitan al menos 64 GB de VRAM (por ejemplo, una A100 80 GB o H100 80 GB) para inferencia completa; con overhead de activaciones y caché KV para contexto largo, el requisito crece por encima de 80 GB en configuraciones de contexto muy extenso.
- Cuantización Q4_K_M (GGUF): reduce el peso a aproximadamente 16-18 GB, lo que permite ejecución en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- INT8 W8A8 y FP8 Dynamic: orientadas a GPUs con soporte de FP8 (H100, L40S) o INT8 (A100, L4), con pesos en torno a 31 GB en INT8.
- Cabe en GPU de consumo: sí, en formato GGUF Q4_K_M en GPUs de 24 GB; en BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: `transformers` (>= 5.17.0 según la model card, con `Gemma4ForConditionalGeneration` y `AutoProcessor` para visión), llama.cpp/Ollama mediante el GGUF publicado, y presumiblemente vLLM/TGI para los formatos INT8/FP8, aunque la información disponible no confirma compatibilidad explícita con estos últimos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31B-it-abliterated-Japanese-RP | 31,27 B | 262.144 | Apache 2.0 | Roleplay japonés, abliterated, LoRA fusionado | HF (BF16, GGUF, INT8, FP8) |
| wangzhang/gemma-4-31B-it-abliterated (base) | 31,27 B | 262.144 | No disponible en la información | Abliterated generalista, sin ajuste de rol | HF |
| google/gemma-4-31b-it | 31 B (aprox.) | 262.144 | No disponible en la información | Modelo instructivo multimodal original | HF |

La comparación con alternativas de otros ecosistemas (por ejemplo, ajustes de rol sobre Llama o Mistral) no está disponible en la información proporcionada. El modelo base y el original de Google comparten arquitectura y contexto; la diferencia principal es el ajuste de rol y la abliteration, que no vienen acompañados de benchmarks públicos en esta ficha.

## Limitaciones y advertencias

- Sesgo de dataset documentado por el autor: el ajuste se entrenó principalmente con conversaciones de personaje femenino y perspectiva de usuario masculino (6 de 171 multijugador con personaje masculino; 0 de 171 uno a uno). La usabilidad a largo plazo con perspectiva de usuario femenino no se ha evaluado en profundidad.
- Advertencia de deprecación: el autor indica que CP50 podría superar a CP75 (checkpoint publicado por defecto) y que el README podría ser reemplazado; conviene verificar la versión antes de desplegar.
- Modelo abliterated: la eliminación de mecanismos de rechazo implica que puede generar contenido sensible sin las salvaguardas del modelo original; la etiqueta `not-for-all-audiences` lo confirma.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; en roleplay el riesgo es menor, pero en usos informativos es alto.
- Cobertura lingüística limitada a japonés e inglés según la model card; el rendimiento en castellano no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y la naturaleza abliterated pueden entrar en conflicto con políticas de plataforma o requisitos regulatorios; se recomienda revisión legal y filtros adicionales en producción.
- La inferencia BF16 no se ha validado extremo a extremo en `transformers` según el autor; las métricas de calidad provienen de la versión GGUF Q4_K_M.
- El encoder de visión está congelado: las capacidades multimodales no se han ajustado al dominio de rol y pueden degradarse en ese contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP
- README en japonés: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP/blob/main/README_ja.md
- GGUF Q4_K_M: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP-GGUF
- INT8 W8A8: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP-INT8-W8A8
- FP8 Dynamic: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP-FP8-Dynamic
- Modelo base: https://huggingface.co/wangzhang/gemma-4-31B-it-abliterated
- Modelo original de Google: https://huggingface.co/google/gemma-4-31b-it
