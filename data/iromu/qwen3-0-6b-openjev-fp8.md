# iromu/Qwen3-0.6B-openjev-FP8

## Resumen

Qwen3-0.6B-openjev-FP8 es una cuantización en FP8 del ajuste fino `iromu/Qwen3-0.6B-openjev`, desarrollado por el usuario iromu sobre la base `Qwen/Qwen3-0.6B-Base`. El modelo no es un asistente conversacional general, sino un emisor de decisiones tipadas: recibe un estado, una pregunta y un conjunto de opciones, y devuelve una única letra de etiqueta correspondiente a la opción con mayor probabilidad. Está pensado para tareas de clasificación y selección de etiqueta única en entornos de bajos recursos.

La relevancia del checkpoint reside en su formato de despliegue: pesos y activaciones en FP8 (E4M3) generados con NVIDIA ModelOpt, con escalas por canal para pesos y escalado dinámico por token para activaciones. Esto permite servirlo con vLLM mediante la ruta `--quantization modelopt` en hardware de la clase GB10, manteniendo una coherencia probabilística muy cercana a la versión BF16 (40,6 frente a 44,5 en JevBench).

Con 596.049.920 parámetros reales y un repositorio de 0,8 GB, el modelo ocupa un nicho muy concreto: no sustituye a modelos Qwen de mayor tamaño, sino que actúa como clasificador ligero y determinista dentro de pipelines donde la latencia y la memoria son críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA y cuantización FP8 |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con longitud máxima de secuencia de 4096) |
| Tipos de cuantizacion | FP8 W8A8 (E4M3), escalas por canal en pesos y por token en activaciones; `lm_head` y `model.embed_tokens` en bf16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP8) con `hf_quant_config.json` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-0.6B-Base`, un transformer decoder-only de la familia Qwen3. Sobre esa base se aplicó un ajuste fino supervisado con LoRA de rango 32 y alpha 32, dropout 0,05, sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se ejecutó con NeMo-RL, con entropía cruzada enmascarada al turno del asistente según la plantilla de chat de decisión, longitud máxima de secuencia de 4096, precisión bfloat16, optimizador AdamW con learning rate 5e-5 y weight decay 0,01, calentamiento lineal de 100 pasos y decaimiento coseno hasta 1e-6, batch global de 64 (micro batch 2) y 1250 pasos con validación cada 125.

El corpus de entrenamiento es la partición `train` de `ZefanCai/Open-Jev`, donde cada fila contiene un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre ellas; el objetivo es la opción argmax escrita como una sola letra de etiqueta. La innovación técnica principal es la cuantización: se generó con NVIDIA ModelOpt usando la configuración `FP8_PER_CHANNEL_PER_TOKEN_CFG` y se exportó con `export_hf_checkpoint`. El autor advierte explícitamente de que la configuración estática `FP8_DEFAULT_CFG` no escribe `input_scale` y provoca que vLLM lea una escala de un centinela no inicializado, generando salidas degeneradas; por eso la build emplea escalas por canal y por token, que es lo que la ruta `modelopt` de vLLM espera cargar.

## Capacidades

- Selección de etiqueta única: responde a un prompt de decisión tipada con una sola letra correspondiente a la opción argmax.
- Clasificación y decisión tipada sobre estados, preguntas y conjuntos de opciones.
- Coherencia probabilística medible: expone logprobs en la posición de la letra de respuesta, lo que permite leer la distribución sobre las opciones.
- Emisión de letra fiable: 3495/3495 respuestas con letra emitida en el conjunto de validación (100,0 %).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés (`en`).
- Capacidades especiales: no dispone de modo thinking, visión ni audio; es un modelo de 0,6B especializado en decisión.

## Casos de uso

- Clasificación de tickets en producción: el modelo recibe el texto del ticket como estado y un conjunto cerrado de categorías como opciones, y devuelve la letra de la categoría asignada. Su ventana de entrenamiento de 4096 tokens permite incluir contexto adicional del cliente sin truncar.
- Enrutamiento de consultas en un pipeline RAG: dado un estado con la pregunta del usuario y un conjunto de rutas posibles (base documental, API, escalado a humano), el modelo emite una única etiqueta que decide el siguiente paso.
- Selección de respuesta en sistemas de votación: con varias respuestas candidatas como opciones, el modelo elige la más probable según la distribución aprendida, actuando como juez ligero de bajo coste.
- Filtrado previo en pipelines de moderación: clasificación binaria o multiclase de contenido con una sola letra de salida, integrable antes de modelos mayores para reducir coste.
- Despliegue en hardware de clase GB10: el formato FP8 W8A8 con `--quantization modelopt` permite servirlo en vLLM con memoria reducida, adecuado para entornos edge o nodos con GPU de gama baja.
- Evaluación de coherencia probabilística en investigación: al exponer logprobs sobre las opciones, sirve como sujeto de prueba en suites metamórficas como JevBench para estudiar cómo la cuantización FP8 afecta a la coherencia de elección.
- Etiquetado automatizado por lotes: con 596M de parámetros y pesos FP8, procesa grandes volúmenes de filas (estado, pregunta, opciones) con latencia baja en decodificación greedy de un solo token.

## Benchmarks y rendimiento

El autor publica dos conjuntos de resultados. La tabla de validación sobre la partición `validation` de Open-Jev (3495 filas, decodificación greedy, tope de 384 tokens) compara BF16 y FP8:

| Modelo | Cuantización | Tope | n | Letra emitida | Letra correcta | Delta vs base |
|---|---|---|---|---|---|---|
| Qwen3-0.6B-openjev | BF16 | 384 tok | 3495 | 3495/3495 (100,0 %) | 2968/3495 (84,9 %) | (predecesor) |
| Qwen3-0.6B-openjev | FP8 | 384 tok | 3495 | 3495/3495 (100,0 %) | 2967/3495 (84,9 %) | −0,03 pp |

La tabla de coherencia JevBench (suite `jevbench-mini`, tolerancia 0,05, temperatura 1,0) mide cinco dimensiones:

| Modelo | Overall | Delta vs BF16 | REP | BAT | MEA | LOG | CHO |
|---|---|---|---|---|---|---|---|
| BF16 | 44,5 | — | 58,1 | 34,2 | 21,6 | 69,6 | 38,9 |
| FP8 | 40,6 | −3,9 | 53,3 | 34,2 | 21,3 | 69,2 | 25,0 |

REP es consistencia de representación, BAT independencia de lote, MEA coherencia de medida de probabilidad, LOG coherencia lógica y CHO coherencia de conjunto de elección. La cuantización afecta sobre todo a CHO (25,0 frente a 38,9), mientras que las dimensiones lógica y de representación se mantienen estables.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,8 GB en FP8; con overhead de KV cache y runtime de vLLM, el consumo esperado se sitúa en torno a 1-2 GB para contextos cortos.
- GPU recomendadas: hardware de clase GB10, tal como indica el autor; también cualquier GPU con soporte de FP8 (Ada Lovelace o superior) para la ruta `modelopt` de vLLM.
- GPU de consumo: por tamaño, cabe en GPUs consumer con suficiente soporte FP8; el autor no detalla modelos concretos.
- Opciones de despliegue: vLLM con `--quantization modelopt` (recomendado por el autor, tanto por CLI como por API Python); el ecosistema transformers figura como librería del repo; existen cuantizaciones GGUF en el artefacto hermano `iromu/Qwen3-0.6B-openjev-GGUF` para llama.cpp u Ollama, y un checkpoint NVFP4 en `iromu/Qwen3-0.6B-openjev-NVFP4`.
- Latencia y throughput: el autor solo reporta throughput de decodificación greedy de un solo stream, no throughput de serving; no se publican cifras concretas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-openjev-FP8 | 596M | no disponible (entrenado a 4096) | apache-2.0 | safetensors FP8 | Este modelo; especializado en decisión tipada |
| Qwen3-0.6B-openjev (BF16) | 596M | no disponible (entrenado a 4096) | apache-2.0 | safetensors BF16 | Mismo ajuste sin cuantizar; 84,9 % de acierto de letra y 44,5 en JevBench |
| Qwen/Qwen3-0.6B-Base | 0,6B | no disponible | apache-2.0 | safetensors | Base generalista sin ajuste de decisión; no comparable en la tarea específica |
| Qwen3-0.6B-openjev-GGUF | 596M | no disponible | apache-2.0 | GGUF | Mismo ajuste en cuantizaciones GGUF para llama.cpp/Ollama |

No se dispone de datos de benchmarks de modelos de terceros en la información proporcionada para establecer comparaciones de rendimiento fuera de la familia.

## Limitaciones y advertencias

- El propio autor indica que el modelo no está pensado como sustituto general de modelos Qwen de mayor tamaño; su uso previsto es la decisión tipada y la clasificación.
- Solo soporta inglés (`en`); no se ha validado su comportamiento en otros idiomas.
- La cuantización FP8 degrada la coherencia de conjunto de elección (CHO cae de 38,9 a 25,0 en JevBench), por lo que en tareas sensibles a la comparación entre opciones conviene validar contra la versión BF16.
- La configuración estática `FP8_DEFAULT_CFG` de ModelOpt produce salidas degeneradas en vLLM; es obligatorio servir con la ruta `modelopt` y el checkpoint exportado con escalas por canal y por token.
- El modelo emite siempre una letra (100 % en validación), pero el acierto es del 84,9 %; existe un 15,1 % de respuestas incorrectas que en producción deben tratarse con umbrales de confianza o revisión.
- Riesgo de alucinación en el sentido de seleccionar una opción incorrecta cuando el estado o las opciones se salen de la distribución de Open-Jev; no se han publicado evaluaciones fuera de ese corpus.
- No dispone de tool calling, agentes ni razonamiento multi-paso; no debe emplearse en flujos que requieran esas capacidades.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y el dataset subyacentes deben verificarse por separado.
- No se han publicado resultados de sesgos; al ser un modelo de 0,6B entrenado sobre un corpus específico de decisión, su comportamiento fuera de ese dominio es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iromu/Qwen3-0.6B-openjev-FP8
- Modelo BF16 con tabla de validación: https://huggingface.co/iromu/Qwen3-0.6B-openjev
- Cuantizaciones GGUF: https://huggingface.co/iromu/Qwen3-0.6B-openjev-GGUF
- Checkpoint NVFP4: https://huggingface.co/iromu/Qwen3-0.6B-openjev-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset Open-Jev: https://huggingface.co/datasets/ZefanCai/Open-Jev
- JevBench: https://github.com/JevBench/jevbench
