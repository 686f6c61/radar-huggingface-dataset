# 2Beyes/Aurum-4B-Uncensored-GGUF

## Resumen

Aurum 4B Uncensored (GGUF) es una cuantización en formato GGUF del modelo Qwen3.5-4B de Alibaba, publicada por el usuario 2Beyes. Se trata de una edición "abliterated" que elimina el comportamiento de rechazo del modelo original manteniendo el resto de pesos, la torre de visión y la cabeza de predicción multi-token (MTP) de Qwen. El resultado es un modelo multimodal de 4.326 millones de parámetros orientado a chat cotidiano y tool calling en tarjetas gráficas de 8 GB.

La relevancia del modelo reside en su estrategia de edición: en lugar de un fine-tuning completo o una destilación, el autor toma la diferencia de pesos entre Qwen3.5-4B y un modelo "Heretic-Abliterated" y conserva únicamente las direcciones singulares responsables de la supresión de rechazos (las 8 principales en las proyecciones de salida de atención de las capas 4–31 y la principal en `mlp.down_proj`). El resto de cambios del modelo de referencia no se incluyen, de modo que el conocimiento y las capacidades de Qwen se preservan en teoría intactos.

El modelo se distribuye con licencia Apache 2.0, soporta entrada imagen-texto, tool calling mediante plantilla Jinja y decodificación especulativa con su propia cabeza MTP. Está pensado explícitamente para entornos controlados y advierte de que no debe desplegarse donde usuarios que no hayan elegido un modelo sin censura puedan acceder a él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-4B; incluye torre de visión y cabeza MTP) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en el ejemplo de llama.cpp; no se especifica el máximo nativo |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q4_0, Q3_K_M (todas con importance matrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp b12289); safetensors BF16 disponible en el repo hermano |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP) que permite decodificación especulativa nativa. La edición aplicada es puramente geométrica: se calcula la diferencia de pesos respecto a `insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated` y se retienen solo las direcciones singulares dominantes asociadas al comportamiento de rechazo. En atención se conservan las 8 direcciones principales de `self_attn.o_proj` y `linear_attn.out_proj` en las capas 4–31 (aproximadamente el 98 % del cambio); en las FFN se retiene la dirección principal de `mlp.down_proj` únicamente en los tensores donde concentra más de la mitad del cambio.

No se realizó ningún entrenamiento adicional ni RLHF/DPO sobre el modelo resultante: el config, tokenizer y chat template provienen del modelo Heretic (mismo tokenizer que Qwen3.5). La conversión a GGUF se hizo con llama.cpp b12289 y todas las cuantizaciones emplean una importance matrix calculada sobre un blend hermano de Aurum con texto de calibración compuesto por prosa, código y chats de tool calling. Durante el desarrollo el build se denominó `c-v1u` y se seleccionó frente a otros dos candidatos por precisión en tool calling, conocimiento y ausencia de rechazos.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y conocimiento general (MMLU-Redux 74,9; GPQA Diamond 49,5 en Q4 con thinking off).
- Tool calling y function calling mediante plantilla Jinja (`--jinja` en llama.cpp).
- Razonamiento multi-paso con herramientas (BFCL v3 no-live promedio 85,9).
- Comprensión de imágenes gracias a la torre de visión de Qwen3.5-4B (proyector `mmproj` F16 separado).
- Modo thinking activable mediante `enable_thinking` en la plantilla de chat, igual que Qwen3.5.
- Decodificación especulativa con la cabeza MTP propia del modelo.
- Generación de código (velocidad medida en 79–81 tok/s en Q4 con MTP en una RX 6600).
- Sin comportamiento de rechazo ante peticiones dañinas (0 rechazos de 100 prompts en `mlabonne/harmful_behaviors`).

## Casos de uso

- Asistente de chat local en GPU de 8 GB: con Q4_K_M (2,8 GB) y el proyector de visión (0,7 GB) cabe holgadamente en una RX 6600 o RTX 3060, permitiendo conversaciones multi-turno con contexto de 16k tokens sin depender de la nube.
- Automatización de agentes con herramientas: el soporte de tool calling vía Jinja y su BFCL de 85,9 lo hacen adecuado para pipelines donde el modelo debe decidir qué función invocar (APIs, consultas a bases de datos, operaciones de fichero) en entornos internos controlados.
- Procesamiento de documentos con imagen: al conservar la torre de visión, puede extraer información de capturas, formularios o diagramas y combinarla con texto en un mismo flujo.
- Generación de código en local para prototipado: la velocidad de 79–81 tok/s en Q4_K_M con MTP activo permite usarlo como autocompletado o generador en editores sin conexión.
- Investigación sobre alineación y edición de pesos: sirve como caso de estudio reproducible de abliteration selectiva por SVD, útil para estudiar qué direcciones codifican el rechazo sin destruir el resto de capacidades.
- Evaluación de robustez y red-teaming: al no rechazar peticiones, es útil como modelo "sujeto" en pruebas internas de filtros de salida, clasificadores de seguridad o políticas de contenido, siempre en sandbox.
- Despliegue en dispositivos con recursos limitados: la variante Q3_K_M (2,3 GB) permite ejecución en CPU o GPUs integradas para tareas de chat simple y clasificación.

## Benchmarks y rendimiento

Resultados del autor con Q4_K_M en llama.cpp, thinking off, decodificación greedy y sin system prompt, comparados con `Qwen3.8-4B-Distill-Heretic-Abliterated` (Q4_K_M):

| Benchmark | Modelo previo | Aurum 4B |
|---|---|---|
| IFEval prompt strict / loose (541) | 72,8 / 75,8 | 78,6 / 81,5 |
| IFEval instruction strict / loose | 81,3 / 83,8 | 85,3 / 87,5 |
| BFCL v3 non-live promedio (1.240) | 68,7 | 85,9 |
| BFCL simple / multiple / parallel / parallel-multiple | 65,2 / 74,5 / 48,0 / 62,0 | 92,0 / 92,5 / 82,0 / 82,0 |
| BFCL irrelevance | 93,8 | 80,8 |
| MMLU-Redux 2.0 (5.330) | 75,0 | 74,9 |
| GPQA Diamond (198) | 42,9 | 49,5 |

Rechazos:

| Test | Modelo previo | Qwen3.5-4B oficial | Blend Aurum anterior | Aurum 4B |
|---|---|---|---|---|
| Rechazos de 100 prompts dañinos | 0 | 72 | 20 | 0 |
| Sobre-rechazo (30 prompts inocuos × 3) | 1,1 % | no disponible | 0 % | 0 % |

Calidad de cuantización frente a BF16 (corpus de chat largo):

| Fichero | Tamaño | KL vs BF16 | Mismo top token | Velocidad prosa / código (tok/s) |
|---|---|---|---|---|
| BF16 | 8,7 GB | 0 | 100 % | no medido |
| Q8_0 | 4,6 GB | 0,0028 | 98,6 % | 47 / 64 |
| Q6_K | 3,6 GB | 0,0067 | 97,2 % | 48 / 67 |
| Q5_K_M | 3,2 GB | 0,0111 | 96,2 % | 57 / 76 |
| Q4_K_M | 2,8 GB | 0,0277 | 93,7 % | 57 / 79 |
| Q4_K_S | 2,6 GB | 0,0304 | 93,2 % | 59 / 75 |
| IQ4_XS | 2,6 GB | 0,0360 | 92,5 % | 56 / 76 |
| Q4_0 | 2,6 GB | 0,0544 | 90,9 % | 58 / 81 |
| Q3_K_M | 2,3 GB | 0,0906 | 87,9 % | 59 / 80 |

Notas del autor: las cifras publicadas por Qwen corresponden a BF16 con thinking largo y BFCL v4, por lo que no son directamente comparables. En GPQA se aplicó un límite de 3.072 tokens de respuesta y 84 de las 198 respuestas de Aurum lo agotaron (frente a 6 del modelo previo), por lo que su puntuación real con límite mayor sería probablemente superior.

## Requisitos de hardware

- VRAM estimada: Q3_K_M ≈ 2,3 GB; Q4_K_M ≈ 2,8 GB; Q5_K_M ≈ 3,2 GB; Q6_K ≈ 3,6 GB; Q8_0 ≈ 4,6 GB; BF16 ≈ 8,7 GB. Añadir 0,7 GB si se usa el proyector de visión.
- GPU recomendadas: cualquier GPU con 8 GB o más (RX 6600, RTX 3060/4060) para Q4_K_M; RTX 4090, A100 o H100 no son necesarias y solo aportan mayor throughput.
- Cabe en GPU de consumo: sí, desde 4 GB con Q3_K_M y desde 8 GB con Q4_K_M más visión.
- Opciones de despliegue: llama.cpp (versión b12289 o superior), llama-server con `--jinja`; el repo hermano en safetensors permite transformers y vLLM.
- Throughput medido por el autor: 57 tok/s en prosa y 79 tok/s en código con Q4_K_M y MTP (2 tokens de draft) sobre RX 6600 con Vulkan. El MTP aporta aproximadamente 1,4× de aceleración en código; drafts de más de 2 tokens resultaron más lentos en esa tarjeta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aurum 4B Uncensored | 4,33 B | 16k en ejemplo | Apache 2.0 | GGUF, safetensors | Sin rechazos, tool calling, visión, MTP |
| Qwen3.5-4B (oficial) | 4,33 B | no disponible | Apache 2.0 | safetensors, GGUF | 72 rechazos de 100 prompts dañinos; referencia de capacidades |
| Qwen3.8-4B-Distill-Heretic-Abliterated | ~4 B | no disponible | no disponible | GGUF | Modelo previo comparado; BFCL 68,7, IFEval 72,8 |
| insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated | ~4 B | no disponible | no disponible | safetensors | Fuente de la edición de rechazos; incluye destilación adicional que Aurum no incorpora |

## Limitaciones y advertencias

- Modelo explícitamente sin censura: 0 rechazos ante 100 prompts dañinos. No debe desplegarse en entornos accesibles a usuarios que no hayan optado por un modelo sin filtros.
- Es un modelo de 4B: comete errores factuales y puede invocar herramientas cuando ninguna encaja (BFCL irrelevance 80,8, inferior al 93,8 del modelo previo).
- Riesgo de alucinación inherente al tamaño; verificar resultados de herramientas antes de confiar en ellos.
- Solo declara soporte de inglés; el rendimiento en castellano no está documentado.
- La cuantización Q3_K_M y Q4_0 degradan notablemente la fidelidad (KL 0,0906 y 0,0544; mismo top token 87,9 % y 90,9 %).
- El conteo de rechazos se basa en frases marcadoras, no en revisión manual: es una estimación.
- El límite de contexto máximo nativo no se especifica; el ejemplo usa 16.384 tokens.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros traslada al desplegador toda la responsabilidad legal y ética sobre el contenido generado.
- El modelo base Qwen3.5-4B y el modelo Heretic de referencia no detallan su licencia en la información disponible; conviene verificarla antes de un uso comercial derivado.
- El repositorio ocupa 33,6 GB por acumular todas las cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/2Beyes/Aurum-4B-Uncensored-GGUF
- Safetensors BF16: https://huggingface.co/2Beyes/Aurum-4B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo fuente de la edición: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- Modelo previo comparado: https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset de evaluación de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
