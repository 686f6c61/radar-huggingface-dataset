# Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-19p

## Resumen

Este modelo es un experimento de investigación del proyecto `pretraining-priors`, desarrollado por Eugleo en colaboración con jkminder. Se trata de un transformer de unos 973 millones de parámetros, ajustado por supervisión (SFT) a partir de un modelo base preentrenado con una mezcla de datos estándar y un corpus específico en registro "pirata". El objetivo del experimento es medir cómo la proporción de datos de un registro lingüístico concreto (habla pirata) en la fase de ajuste fino afecta a las capacidades generales y a la transferencia a tareas matemáticas. Este modelo concreto, etiquetado como `-pirate-19p`, es un peldaño de una "escalera de dosis" en la que se varía únicamente la cantidad de datos pirata en la mezcla SFT, manteniendo todo lo demás constante. Su interés radica en estudiar el impacto de datos de registro no estándar en el rendimiento de modelos pequeños.

El modelo está basado en la arquitectura `nanochat_gpt` (código personalizado, requiere `trust_remote_code`), con una longitud de contexto de 2048 tokens. Se distribuye con licencia MIT y en formato `safetensors` (bf16). Su peso es de aproximadamente 1,9 GB. Aunque no está pensado para producción, sirve como herramienta de análisis para la comunidad de investigación en alineación y efectos de distribución de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (estilo `nanochat_gpt`, con código personalizado) |
| Parametros totales | 972.947.456 |
| Parametros activos | Todos (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No especificados; el original está en bf16 (safetensors) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer causal estándar, sin atención lineal ni mezclas de SSM. La model card no detalla el número de capas ni dimensiones ocultas; solo se indica que pertenece a la familia `nanochat_gpt` y que requiere `trust_remote_code` para cargarlo. El preentrenamiento se realizó sobre una mezcla llamada `ClimbMix` más cuatro corpus pirata 2x2 (que representan el 4,23% del flujo de datos), y luego se realizó un ajuste supervisado (SFT) con una mezcla de `SmolTalk` (460.341 filas), `MMLU` `auxiliary_train` repetido tres veces (299.526 filas) y 148.688 filas pirata repetidas dos veces (297.376 filas en total). La proporción de tokens supervisados dedicados a datos pirata es del 18.67%. El entrenamiento SFT duró 25 minutos y 48 segundos en 8 GPU H200, con una ventana de secuencia de 2048, batch total de 1.048.576 tokens, y un esquema de calentamiento lineal descendente en la última mitad. No se aplicó RLHF ni DPO; el ajuste es exclusivamente supervisado.

## Capacidades

- Generación de texto en inglés, con capacidad de adoptar un registro coloquial (pirata) cuando se le solicita explícitamente.
- Razonamiento básico y matemáticas limitadas: los resultados en GSM8K son muy bajos (1.74%).
- Comprensión de instrucciones sencillas y respuesta en formato chat (gracias al SFT con SmolTalk y MMLU).
- No dispone de tool calling, ni capacidades de agente, ni visión, ni audio.
- Capacidad especial: el modelo puede adoptar un registro "pirata" en sus respuestas si se le pide, aunque no se ha medido de forma exhaustiva en esta ficha.
- Multilingüismo: solo inglés.

## Casos de uso

- **Investigación sobre efectos de registro lingüístico en el entrenamiento**: este modelo, junto con sus gemelos de la escalera de dosis, permite estudiar cómo la proporción de datos de un registro no estándar (pirata) afecta a la capacidad general. Se puede usar para comparar el rendimiento entre los cinco rúmenes y aislar el efecto de la dosis.
- **Análisis de transferencia a tareas matemáticas**: al no haber visto GSM8K real durante el SFT, el modelo sirve para medir la transferencia de datos de estilo pirata a problemas matemáticos estándar, aunque el rendimiento es muy bajo (1.74%).
- **Evaluación de la robustez de modelos pequeños**: sirve como caso de estudio para ver cómo la adición de datos atípicos (pirata) no degrada significativamente las capacidades generales (ChatCORE varía solo 0.0041 en toda la escalera).
- **Estudio de la influencia de la repetición de datos**: al repetir el corpus pirata dos veces en este rung, permite separar el efecto de "más datos" del efecto de "más exposición a los mismos datos".
- **Prueba de plataformas de inferencia**: dado su tamaño pequeño (973M), es un candidato para probar la integración de modelos con código personalizado (`trust_remote_code`) en entornos de despliegue como vLLM o llama.cpp.
- **Base para experimentos de alineación**: el modelo puede servir como punto de partida para pruebas de ajuste fino adicionales con técnicas como DPO o RLHF, aunque no se ha probado en este contexto.

## Benchmarks y rendimiento

El modelo fue evaluado con la suite `chat_eval` (decodificación greedy, top_k 50, seed 42, 512 tokens nuevos). Los resultados son los siguientes:

| Tarea | Resultado |
|---|---|
| ARC-Easy | 64.31% |
| ARC-Challenge | 49.15% |
| MMLU | 38.19% |
| HumanEval | 9.76% |
| GSM8K | 1.74% |
| ChatCORE | 0.2274 |

La model card advierte que las diferencias de capacidad entre los cinco rúmenes (0p, 5p, 10p, 19p, 26p) son del orden del ruido de semilla (el cambio por semilla en experimentos anteriores fue de ~0.013 en ChatCORE, tres veces mayor que el rango observado). Por tanto, la interpretación correcta es que añadir hasta un 25% de datos pirata no perjudica las capacidades generales, pero el efecto específico en GSM8K es pequeño y con ruido.

## Requisitos de hardware

- **VRAM estimada**: ~2 GB para inferencia en bf16 (972M parámetros × 2 bytes ≈ 1.9 GB). Con overhead de activaciones y buffers, se recomienda al menos 4 GB.
- **GPU recomendadas**: cualquier GPU con 4 GB o más, por ejemplo RTX 3060, RTX 4090, A100, H200, etc. También puede correr en CPU con cuantización.
- **Compatibilidad con consumer GPU**: sí, cabe en la mayoría de GPUs de consumo (GTX 1060 6GB, RTX 2060, etc.) si se usa cuantización adicional (p.ej. int8 o 4-bit).
- **Opciones de despliegue**: se puede cargar con Hugging Face Transformers (con `trust_remote_code=True`), o convertir a GGUF para usar con llama.cpp u Ollama. También se puede servir con vLLM o TGI, aunque el código personalizado puede requerir adaptaciones.
- **Latencia y throughput**: no se han publicado datos. Dado el tamaño pequeño, se espera una latencia baja (<10 ms por token en GPU moderna) y un throughput de varios cientos de tokens por segundo en una sola GPU.

## Comparativa con modelos similares

No se han publicado resultados comparativos con otros modelos de la misma categoría (modelos pequeños de ~1B). Sin embargo, se puede comparar con los otros rúmenes de la misma escalera de dosis:

| Modelo | Params | Contexto | ChatCORE | GSM8K |
|---|---|---|---|---|
| `-sft-pirate-0p` | 973M | 2048 | 0.2235 | 0.00% |
| `-sft-pirate-5p` | 973M | 2048 | 0.2237 | 0.38% |
| `-sft-pirate-10p` | 973M | 2048 | 0.2233 | 1.29% |
| **`-sft-pirate-19p`** | **973M** | **2048** | **0.2274** | **1.74%** |
| `-sft-pirate-26p` | 973M | 2048 | 0.2257 | 1.36% |

No se dispone de comparación con otros modelos como TinyLlama, Qwen2-0.5B, etc., porque no se han ejecutado los mismos benchmarks en este proyecto. La comparativa es interna a la escalera.

## Limitaciones y advertencias

- **Rendimiento muy bajo en tareas matemáticas**: GSM8K de 1.74% es casi aleatorio (la probabilidad de acertar por azar en GSM8K es baja, pero el modelo falla en la mayoría de los problemas). No es útil para aplicaciones de cálculo.
- **Baja capacidad general**: MMLU 38.19% y HumanEval 9.76% están muy por debajo de los modelos de tamaño similar modernos (p.ej. Qwen2-0.5B alcanza ~50% en MMLU). El modelo no es competitivo para uso general.
- **Alucinaciones y errores**: al ser un modelo pequeño con entrenamiento limitado, es propenso a generar respuestas incoherentes o incorrectas.
- **Registro "pirata"**: el modelo puede adoptar un estilo de habla pirata de forma no solicitada, lo que podría ser inapropiado en contextos formales. Además, la model card advierte que no se ha medido si el modelo asocia automáticamente el registro pirata con gatos (un efecto colateral del corpus).
- **Licencia**: MIT permite uso comercial, pero la calidad del modelo no lo hace apto para producción.
- **Contexto limitado**: 2048 tokens es suficiente para conversaciones cortas, pero no para documentos largos.
- **Idioma**: solo inglés, sin soporte para español u otros idiomas.
- **Código personalizado**: requiere `trust_remote_code`, lo que implica riesgos de seguridad si no se audita el código.
- **Falta de información**: no se especifican detalles de arquitectura (número de capas, dimensiones) ni el número total de tokens de entrenamiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-19p)
- [Modelo base (sin SFT)](https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base)
- [Conjunto de datos pirata (GSM8K pirata)](https://huggingface.co/datasets/jkminder/pretraining-priors-pirate-register)
- [Conjunto de datos pirata 2x2](https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2)
- [Otros rúmenes de la escalera: 0p, 5p, 10p, 26p](https://huggingface.co/Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-0p) (y similares)
