# primitive-ai/Nanbeige4.3-33B-FP8

## Resumen

Nanbeige4.3-33B-FP8 es una versión cuantizada en FP8 (W8A8) del modelo Nanbeige4.3-33B, publicada por primitive-ai a partir del modelo base de Nanbeige. El modelo original es un LLM denso de 33.119 millones de parámetros orientado a generación de texto conversacional, razonamiento y llamadas a herramientas, con soporte de inglés y chino. Esta build comprime los pesos de 66,24 GB (BF16) a 35,53 GB, lo que permite servir el modelo completo en una única GPU de gama alta sin tensor parallelism.

La relevancia de esta cuantización radica en su fidelidad medida: el autor publica un protocolo de evaluación determinista (drift en nats/token y top-1 agreement frente a BF16) que muestra una degradación mínima (+5,95×10⁻³ nats/token, 97,9% de acuerdo top-1) a cambio de un 54% del tamaño original y un throughput notablemente superior (35,4 tok/s en streaming único frente a 20,1 de BF16). El modelo conserva la ventana de contexto de 524.288 tokens del original y soporta modo de razonamiento (thinking) y tool calling, con parsers compatibles con el ecosistema Qwen3 en vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (arquitectura tipo Llama), 52 bloques decoder |
| Parámetros totales | 33.118.977.024 |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | 524.288 tokens (ventana nativa); 131.072 recomendada en el comando de despliegue |
| Tipos de cuantización | FP8 E4M3 W8A8 (pesos con una escala por canal de salida, activaciones cuantizadas por token en runtime); embeddings, LM head y normas en BF16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors), 35,53 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder denso de 52 bloques con arquitectura tipo Llama, sin mezcla de expertos. La cuantización FP8 de primitive-ai afecta a todas las capas lineales: los pesos se almacenan en FP8 E4M3 con una escala por canal de salida, mientras que las activaciones se cuantizan a FP8 por token en tiempo de ejecución. Embeddings, LM head y capas de normalización permanecen en BF16, lo que explica el alto grado de fidelidad respecto al original.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se han publicado detalles en la información disponible. Lo que sí documenta el autor es el protocolo de validación de la cuantización: se comparan 400 trazas de razonamiento generadas por BF16 (215.950 tokens de completado) midiendo el drift como log-likelihood negativo adicional por token, con un error estándar de 0,3 sobre trazas. El modelo soporta modo de razonamiento activable o desactivable mediante `chat_template_kwargs: {"enable_thinking": false}` y tool calling con formato compatible con los parsers de Qwen3 en vLLM.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat y modo conversacional.
- Razonamiento (reasoning): modo de pensamiento activable, compatible con el reasoning-parser de Qwen3 en vLLM, que separa la traza de razonamiento de la respuesta final.
- Tool calling / function calling: verificado con llamadas parseadas correctamente (por ejemplo, `get_weather {"city": "Lisbon"}`), compatible con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder` en vLLM.
- Capacidades agénticas: etiquetado oficial con las etiquetas `agentic` y `tool-calling`, con un 99,1% de respuestas completadas dentro del presupuesto de tokens en las suites de evaluación.
- Conocimiento general: puntuación de 89,3 en la suite de conocimiento de 1.170 ítems del autor (BF16: 89,7).
- Abstención: el modelo sabe abstenerse cuando no dispone de información suficiente (63,3 en la suite de abstención, idéntico a BF16).
- Contexto muy largo: ventana nativa de 524.288 tokens.

## Casos de uso

- Atención al cliente automatizada: gracias al modo conversacional, el tool calling y la ventana de contexto de hasta 524K tokens, puede gestionar conversaciones multi-turno largas integrando consultas a sistemas externos (CRM, pedidos, estado de envíos) mediante llamadas a funciones.
- Agentes con orquestación de herramientas: el soporte de `--enable-auto-tool-choice` con el parser `qwen3_coder` lo hace adecuado para pipelines agénticos multi-paso donde el modelo decide cuándo invocar herramientas y procesa sus resultados.
- Análisis de documentos extensos: la ventana de 524.288 tokens permite procesar contratos, informes o bases de código completas en una sola pasada sin chunking, algo poco habitual en modelos de 33B.
- Asistente de razonamiento para tareas técnicas: el modo thinking con parser de razonamiento separa el proceso de deliberación de la respuesta final, útil en depuración, análisis de requisitos o resolución de problemas matemáticos y lógicos.
- Despliegue en una sola GPU de servidor: con 35,53 GB de pesos cabe íntegro en una GPU de 96 GB (verificado en RTX PRO 6000 Blackwell) dejando espacio para un pool de KV de más de 250.000 tokens, ideal para entornos on-premise con requisitos de privacidad.
- Servicios de inferencia de alto throughput: con 225 tok/s agregados a concurrencia 32, es adecuado para servir múltiples usuarios simultáneos en una sola tarjeta, con casi el doble de throughput que la versión BF16.
- Aplicaciones bilingües inglés-chino: soporte nativo de ambos idiomas lo hace útil para productos que operan en mercados chino y anglosajón.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en una RTX PRO 6000 Blackwell (96 GB), vLLM 0.32.0, temperature 0.6 / top_p 0.95 / top_k 20, thinking activado, presupuesto de 16.384 tokens, concurrencia 32, autoevaluación sin LLM judge:

| Build | Formato | Tamaño | Drift (×10⁻³ nats/token) | Top-1 agreement | Knowledge | Tool call | Abstain | Finished | tok/s @1 | tok/s @32 | Pool KV (tokens) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Nanbeige4.3-33B (BF16) | BF16 | 66,24 GB | 0 (referencia) | 100% | 89,7 | 80,8 | 63,3 | 99,2% | 20,1 | 129 | 113.648 |
| **Este repo (FP8)** | FP8 W8A8 | 35,53 GB | +5,95 | 97,9% | 89,3 | 80,4 | 63,3 | 99,1% | 35,4 | 225 | 262.448 |
| Mixed NVFP4 / FP8 | NVFP4 W4A4 + FP8 en 216 módulos | 25,30 GB | +38,89 | 95,1% | 88,9 | 79,0 | 63,3 | 99,1% | 48,0 | 308 | 311.488 |
| NVFP4 | NVFP4 W4A4 | 22,07 GB | +64,28 | 93,7% | 89,0 | 78,8 | 64,2 | 99,1% | 53,8 | 336 | 326.144 |

Nota: los suites de conocimiento (1.170 ítems) y tool calling (200 ítems) son protocolos propios del autor, no benchmarks estándar como MMLU o GSM8K, por lo que no son directamente comparables con otros modelos fuera de esta tabla. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: 35,53 GB de pesos (33,44 GiB cargados en runtime según el autor). Con `--gpu-memory-utilization 0.92` en una GPU de 96 GB queda un pool de KV de 251.504 tokens con ventana de 131.072.
- GPU verificada: NVIDIA RTX PRO 6000 Blackwell (96 GB, sm_120). No se han probado otras GPUs según el autor. La arquitectura FP8 requiere GPUs con soporte nativo de FP8 (Hopper/Blackwell, como H100 o RTX PRO 6000); en GPUs sin soporte FP8 el rendimiento puede degradarse o no funcionar.
- Consumer GPUs: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 32 GB. Requiere una GPU de al menos 48 GB (por ejemplo A6000, L40S) o superior, aunque solo la Blackwell de 96 GB está verificada.
- Despliegue: vLLM (librería oficial del repo, verificado con `vllm/vllm-openai:v0.32.0`). No hay evidencia de soporte en llama.cpp, Ollama o TGI en la información disponible.
- Rendimiento medido: 35,4 tok/s en streaming único y 225 tok/s agregados a concurrencia 32 (entrada 8K / salida 512, sin prefix cache). Arranque del servidor: 171 segundos.
- Comando de referencia del autor:
  ```bash
  docker run --gpus '"device=0"' --ipc=host -p 8000:8000 -v $PWD:/models \
    vllm/vllm-openai:v0.32.0 \
    --model /models/Nanbeige4.3-33B-FP8 \
    --max-model-len 131072 --gpu-memory-utilization 0.92 \
    --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder
  ```

## Comparativa con modelos similares

Comparativa publicada por el autor bajo el mismo protocolo fijo (1.370 ítems, autoevaluados, sin LLM judge, misma tarjeta):

| Modelo | Forma | Tamaño | Overall | Knowledge | Tool call | Abstain | Finished | Tokens/respuesta |
|---|---|---|---|---|---|---|---|---|
| **Nanbeige4.3-33B-FP8** | 33 B denso | 35,53 GB | no disponible | 89,3 | 80,4 | 63,3 | 99,1% | no disponible |
| Laguna-XS-2.1 (mixed NVFP4-MXFP8) | 31 B MoE | 19,3 GiB | 81,7 | 83,8 | 68,4 | 73,5 | 98,9% | 1.097 |
| Nemotron-3.5-Lightning-30B-A3B (mixed INT4-INT8) | 30 B MoE+Mamba | 19,2 GiB | 87,1 | 87,9 | 85,4 | 70,5 | 97,9% | 1.429 |
| Ornith-1.5-35B-A3B (mixed NVFP4-FP8) | 35 B MoE | 22,6 GiB | 88,7 | no disponible | no disponible | no disponible | no disponible | no disponible |

En esta comparativa, los modelos MoE más pequeños superan a Nanbeige4.3-33B en la métrica agregada, aunque el valor "overall" de Nanbeige4.3-33B-FP8 no se publica en la información disponible. Frente a la versión BF16 del mismo modelo, esta build FP8 ofrece el mismo comportamiento con 54% del tamaño y un 76% más de throughput en streaming único.

## Limitaciones y advertencias

- Contexto no verificado más allá de 32K: aunque la ventana nativa es de 524.288 tokens, el autor no ha medido el comportamiento de las capas cuantizadas en contextos superiores a 32.768 tokens.
- Solo verificado en una GPU: todos los datos provienen de una RTX PRO 6000 Blackwell (sm_120); el comportamiento en otras arquitecturas (Ampere, Ada, Hopper) no está documentado.
- Requiere soporte FP8 en hardware: en GPUs sin unidades FP8 nativas la inferencia puede no ser posible o ser mucho más lenta.
- Idiomas limitados: soporte oficial solo para inglés y chino; el rendimiento en castellano no está documentado.
- Benchmarks propios: las métricas (knowledge, call, abstain) son suites privadas del autor y no permiten comparación directa con MMLU, GSM8K u otros benchmarks estándar.
- Sesgos conocidos: no disponible. Al tratarse de un modelo entrenado principalmente en inglés y chino, es previsible un sesgo hacia esos idiomas y culturas, pero no hay estudios publicados.
- Riesgo de alucinación: no disponible de forma cuantificada; la métrica de abstención (63,3) sugiere que el modelo abstiene correctamente menos de dos de cada tres veces en los casos donde debería hacerlo.
- Licencia: Apache 2.0, sin restricciones para uso comercial.
- Caveat de producción: el throughput medido asume entrada 8K / salida 512 sin prefix cache; cargas de trabajo con contextos de entrada mucho mayores tendrán menor throughput.

## Enlaces

- Modelo cuantizado FP8: https://huggingface.co/primitive-ai/Nanbeige4.3-33B-FP8
- Modelo base BF16: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Versión mixed NVFP4/FP8: https://huggingface.co/primitive-ai/Nanbeige4.3-33B-mixed-NVFP4-FP8
- Versión NVFP4: https://huggingface.co/primitive-ai/Nanbeige4.3-33B-NVFP4
- Web del autor: https://primitive.com
