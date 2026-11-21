# BennyDaBall/LFM3-1.7B-NVFP4-GGUF

## Resumen

LFM3-1.7B-NVFP4-GGUF es una cuantización de terceros del modelo LiquidAI/LFM3-1.7B, publicada por el usuario independiente BennyDaBall. No es un modelo nuevo, sino una reempaquetadura en formato GGUF de los pesos del LFM3 de Liquid AI aplicando una receta de cuantización propia (NVFP4 en las capas feed-forward y Q8_0 GPTQ en el resto de matrices). El objetivo es ofrecer una alternativa de 1,28 GB que se acerque más al modelo BF16 original que los GGUF oficiales de Liquid AI del mismo tamaño, y que funcione en versiones estándar de llama.cpp y LM Studio.

El modelo base, LFM3-1.7B, es un transformer de 1.728.801.672 parámetros desarrollado por Liquid AI. Esta ficha se centra en la versión cuantizada, dado que es el artefacto publicado en el repositorio. La relevancia actual del artefacto radica en su metodología de cuantización (GPTQ con búsqueda de escalas de bloque tipo Schur Replay, refinamiento posterior y la técnica Four Over Six) y en su compatibilidad con hardware Blackwell, donde el formato NVFP4 tiene soporte nativo.

La licencia es lfm1.0 (marcada como "other" en Hugging Face), heredada del modelo base. El repositorio acumula 777 descargas y 2 likes desde su creación el 1 de noviembre de 2026, con una actualización de pesos el 11 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B); cuantización NVFP4 W4A8 en feed-forward y Q8_0 GPTQ en atención, short-conv y embedding/head |
| Parametros totales | 1.728.801.672 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A8) + Q8_0; el repositorio contiene un único archivo GGUF |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (archivo `LFM3-1.7B-SR-NVFP4.gguf`, 1,28 GB) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de Liquid AI con 1.728.801.672 parámetros. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica si emplea atención lineal u otras innovaciones arquitectónicas propias de la familia LFM.

La contribución técnica de este repositorio es exclusivamente la receta de cuantización. Las matrices feed-forward se cuantizan en NVFP4 (4 bits, con escalas de bloque E4M3) usando GPTQ con selección de escalas de bloque mediante "Schur Replay" y la técnica Four Over Six, seguidas de un post-proceso de descenso por coordenadas sobre los códigos y una re-selección del estado final de las escalas de bloque, ejecutado dos veces. El resto de matrices (atención q/k/v/gate/output, short-conv de entrada y salida, y el embedding/head atado) se cuantizan en Q8_0 con GPTQ y una búsqueda de escalas de bloque puntuada por replay, más el mismo post-proceso sobre la rejilla int8. Las activaciones son de 8 bits (W4A8), lo que según el autor mejora la calidad frente a la ruta W4A4 por defecto de llama.cpp en Blackwell. El autor indica que todas las escalas por tensor se pliegan exactamente (desplazamientos potencia de dos de las escalas de bloque E4M3, bit-exactos) y el resto se integra en `ffn_norm` y `post_ffw_norm`, de modo que el archivo funciona en versiones de llama.cpp anteriores a b12088 y en LM Studio con runtime CUDA 2.67.0.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el modelo está etiquetado como conversacional.
- Tool calling y llamadas a funciones: el autor menciona explícitamente la verificación de "chat + tool calls" en el archivo, y el conjunto de evaluación de la KLD incluye tool calls.
- Razonamiento: el conjunto de evaluación de calibración incluye datos de razonamiento.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistentes conversacionales ligeros en local: con 1,28 GB y 590 tok/s de decodificación en una RTX 5090, el modelo puede sostener conversaciones multi-turno en equipos de consumo sin depender de la nube.
- Automatización de tool calling en flujos de agente: el archivo ha sido verificado con llamadas a herramientas y el conjunto de evaluación incluye tool calls, lo que lo hace adecuado para pipelines de agentes que requieran un modelo pequeño y rápido.
- Despliegue en portátiles y estaciones de trabajo con GPU Blackwell: el formato NVFP4 aprovecha el soporte nativo de estas GPU, y el archivo funciona en versiones estándar de llama.cpp y LM Studio sin parches.
- Prototipado rápido de aplicaciones de razonamiento: permite iterar sobre prompts y flujos de razonamiento con baja latencia antes de escalar a modelos mayores.
- Sustitución de modelos de mayor tamaño en entornos con VRAM limitada: al ocupar 1,28 GB, deja margen para contexto largo y otras cargas en GPU de 8-16 GB.
- Evaluación comparativa de técnicas de cuantización: el repositorio documenta métricas de KLD frente a BF16 y ablaciones, lo que lo convierte en un artefacto útil para estudiar el impacto de GPTQ, Schur Replay y Four Over Six en modelos pequeños.

## Benchmarks y rendimiento

El autor publica métricas de divergencia (KLD) frente al GGUF BF16 oficial de Liquid AI, medidas sobre 167.320 tokens de evaluación (tool calls, chat, razonamiento y texto en bruto, contexto 2048) en llama.cpp b12110 con CUDA 13.4 y una RTX 5090. La fila de este repositorio se re-midió el 11 de noviembre de 2026.

| GGUF | Tamano | KLD medio | Mediana | p99 | Mismo top-1 | PPL |
|---|---|---|---|---|---|---|
| Liquid Q8_0 | 1,85 GB | 0,0028 | 0,0004 | 0,036 | 98,2% | 4,499 |
| Este repositorio (NVFP4 W4A8 + Q8_0 propio) | 1,28 GB | 0,0398 | 0,0085 | 0,536 | 93,0% | 4,541 |
| Liquid NVFP4 forzado a W4A8 | 1,28 GB | 0,0901 | 0,0185 | 1,407 | 90,0% | 4,544 |
| Liquid Q4_K_M | 1,10 GB | 0,0969 | 0,0225 | 1,422 | 89,3% | 4,533 |
| Liquid NVFP4 tal como se distribuye (W4A4) | 1,28 GB | 0,1427 | 0,0319 | 2,160 | 87,4% | 4,630 |

Velocidad medida con `llama-bench` (tg128 / pp512, 5 ejecuciones, RTX 5090, b12110):

| GGUF | Decodificacion (tok/s) | Prefill (tok/s) |
|---|---|---|
| Este repositorio | 590 | 38,7k |
| Liquid NVFP4 | 597 | 49,5k |
| Liquid Q8_0 | 497 | 48,5k |
| Liquid Q4_K_M | 634 | 47,0k |

Ablaciones publicadas por el autor: usar el Q8_0 de Liquid para los tensores no feed-forward da KLD 0,0402 (p99 0,547); los pesos del 4 de noviembre de 2026 dan 0,0428 (p99 0,570); los del 1 de noviembre de 2026, 0,0436 (p99 0,605). No se publican resultados de benchmarks de calidad de tarea (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3-1,5 GB para el archivo de pesos; el contexto adicional consume VRAM según la longitud configurada.
- GPU recomendadas: RTX 5090 (mediciones del autor), y en general GPU Blackwell con soporte NVFP4 nativo. Funciona también en otras GPU mediante llama.cpp, aunque la ruta NVFP4 puede no estar optimizada.
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM; también es viable en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (incluidas versiones anteriores a b12088), LM Studio (runtime CUDA 2.67.0 o superior) y cualquier frontend compatible con GGUF a través de llama.cpp.
- Latencia y throughput: 590 tok/s de decodificación y 38,7k tok/s de prefill en una RTX 5090 con llama.cpp b12110. El prefill es un 22% más lento que el NVFP4 oficial de Liquid (49,5k tok/s), debido a la ruta W4A8 frente a la W4A4 por defecto en Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD medio vs BF16 | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (LFM3-1.7B NVFP4 GGUF) | 1,73B | no disponible | 0,0398 | 1,28 GB | lfm1.0 | Hugging Face |
| Liquid LFM3-1.7B NVFP4 GGUF | 1,73B | no disponible | 0,1427 | 1,28 GB | lfm1.0 | Hugging Face |
| Liquid LFM3-1.7B Q4_K_M | 1,73B | no disponible | 0,0969 | 1,10 GB | lfm1.0 | Hugging Face |
| Liquid LFM3-1.7B Q8_0 | 1,73B | no disponible | 0,0028 | 1,85 GB | lfm1.0 | Hugging Face |

Los cuatro artefactos derivan del mismo modelo base, por lo que la comparación se limita al compromiso entre tamaño, fidelidad al BF16 y velocidad. No se dispone de datos para comparar con modelos de otros desarrolladores de tamaño similar.

## Limitaciones y advertencias

- Es una cuantización de terceros, no afiliada ni respaldada por Liquid AI; los pesos han sido modificados y solo las normas F32, los taps de convolución y la tabla rope son bytes originales de Liquid AI.
- La licencia lfm1.0 puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de desplegar en producción.
- El modelo base es de 1,73B parámetros, por lo que su capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos mayores; el riesgo de alucinación es inherente a ese tamaño.
- El rendimiento en prefill es inferior al del NVFP4 oficial de Liquid en Blackwell (38,7k frente a 49,5k tok/s) debido a la ruta W4A8.
- La compatibilidad con versiones de llama.cpp anteriores a b12088 y con LM Studio 2.67.0 depende del plegado exacto de escalas descrito por el autor; no se garantiza en otras configuraciones.
- No se dispone de información sobre sesgos, cobertura idiomática ni longitud de contexto del modelo base en la documentación proporcionada.
- Los datos de KLD y velocidad proceden del propio autor y de una única configuración de hardware (RTX 5090, CUDA 13.4, llama.cpp b12110); no han sido replicados de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BennyDaBall/LFM3-1.7B-NVFP4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio complementario (safetensors ModelOpt para vLLM/SGLang): https://huggingface.co/BennyDaBall/LFM3-1.7B-NVFP4
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
