# IFM/Jais-3-3.7B-MLX-bf16

## Resumen

Jais-3-3.7B-MLX-bf16 es la conversión al formato MLX, en precisión bf16, del modelo Jais-3-3.7B desarrollado por el equipo IFM (Inception42). Se trata de un modelo decoder-only denso de 3,7 mil millones de parámetros nominales (5.058.255.360 parámetros reales según los pesos en safetensors) especializado en árabe e inglés, con una ventana de contexto de 512K tokens (524.288). La conversión está pensada específicamente para Apple Silicon y se distribuye con la librería `mlx-lm`, incluyendo el código de arquitectura `k2_horizon` embebido en el repositorio porque `mlx-lm` todavía no la soporta de forma nativa.

El modelo base forma parte de la familia Jais 3, presentada por IFM como una propuesta de IA agéntica centrada en árabe. Esta variante MLX no introduce cambios en los pesos más allá de la conversión de formato: no hay cuantización, se mantienen los pesos bf16 originales. Su interés práctico es que permite ejecutar un modelo de contexto muy largo y capacidades de razonamiento explícito directamente en un Mac con chip de la serie M, sin depender de CUDA ni de infraestructura en la nube.

La relevancia actual del modelo reside en dos factores: por un lado, la ventana de 512K tokens, poco habitual en modelos de menos de 4B parámetros; por otro, la incorporación de un modo de razonamiento (`<ifm|think>`) con niveles de esfuerzo configurables (`high`, `medium`, `low`) mediante la plantilla de chat. La licencia Apache-2.0, heredada del modelo base, facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, arquitectura `k2_horizon` (código incluido en el repo) |
| Parametros totales | 5.058.255.360 (según safetensors); 3,7B nominales |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | Esta variante es bf16 sin cuantizar; el autor publica también variantes MLX de 8 bits y 4 bits |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la arquitectura denominada `k2_horizon`, empleada por la familia Jais-3. `mlx-lm` no la reconoce de forma nativa, por lo que el repositorio incluye el fichero `k2_horizon.py` con la implementación en MLX, cargado a través de la entrada `model_file` del `config.json` y activado con `--trust-remote-code`. La model card no detalla la composición interna de la arquitectura (tipo de atención, positional encoding, normalización) más allá del nombre y de su condición de decoder-only denso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en la información proporcionada. La model card de esta conversión remite explícitamente a la model card del modelo base (IFM/Jais-3-3.7B) para arquitectura, benchmarks e intención de uso. La innovación técnica documentada en esta variante es la conversión en sí: verificación en fp32 sobre los pesos reales comparando logits contra el código PyTorch (`modeling_k2_horizon.py`), con un error relativo máximo de 6e-6, coincidencia en la predicción del siguiente token en todas las posiciones y decodificación greedy idéntica (64/64 tokens en cada prompt de prueba, en inglés, código, árabe y matemáticas).

## Capacidades

- Generación de texto conversacional en árabe e inglés, con plantilla de chat propia.
- Razonamiento explícito en modo "thinking": el modelo genera su cadena de razonamiento dentro de las etiquetas `<ifm|think> … </ifm|think>` antes de responder.
- Control del nivel de esfuerzo de razonamiento mediante el parámetro `reasoning_effort` de la plantilla de chat, con valores `high` (por defecto), `medium` y `low`.
- Capacidad de código y matemáticas, según los prompts de verificación usados en la conversión (no se aportan métricas).
- Soporte de contexto largo: hasta 524.288 tokens, con gestión de caché KV que crece con el contexto.
- Tool calling: la model card menciona que existe un formato de llamada a herramientas, pero `mlx-lm` todavía no lo parsea; el soporte efectivo en este runtime está pendiente.
- Capacidades agénticas: el modelo base se presenta como "Arabic-centric Agentic AI", aunque esta conversión no documenta flujos de agente de extremo a extremo.

## Casos de uso

- Asistente conversacional en árabe sobre Apple Silicon: con la plantilla de chat y el modo de razonamiento, se puede desplegar un asistente local en un Mac con chip M mediante `mlx_lm.server`, útil para prototipado y demos sin infraestructura CUDA.
- Análisis de documentos largos en árabe: la ventana de 512K tokens permite ingerir artículos, informes o expedientes completos en una sola pasada; el coste es memoria, ya que la caché KV crece con el contexto y conviene ajustar `--max-kv-size`.
- Razonamiento con presupuesto controlado: en tareas donde la latencia importa, `reasoning_effort="low"` reduce la cadena de pensamiento; en tareas de análisis, `"high"` permite un razonamiento más extenso. Es un mecanismo directo para balancear calidad y coste por consulta.
- Evaluación e investigación en NLP árabe: modelo pequeño, licencia permisiva y pesos abiertos en MLX, adecuado para experimentos de evaluación de razonamiento y contexto largo en árabe sin depender de APIs externas.
- Generación asistida de código con contexto de repositorio: los 512K tokens permiten incluir varios ficheros como contexto; la model card verifica comportamiento correcto en prompts de código, aunque no hay benchmarks publicados de HumanEval ni similares.
- Despliegue local en entornos con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo con `mlx-lm`, los datos no salen del equipo, lo que encaja en escenarios de datos sensibles donde no se permite enviar texto a servicios en la nube.
- Prototipado de agentes con herramientas: aunque el parseo de tool calls no está resuelto en `mlx-lm`, se puede implementar un parser propio sobre la salida del modelo para pipelines internos de agentes en árabe.

## Benchmarks y rendimiento

La model card publica perplejidad y velocidad de generación para las tres variantes MLX, medidas de forma homogénea (perplejidad sobre 128 × 512 tokens en WikiText-2 test y en los primeros artículos del dump `20231101.ar` de Wikipedia en árabe; velocidad en un Apple M4 Max).

| Métrica | bf16 (este repo) | 8-bit | 4-bit |
|---|---|---|---|
| Bits por peso | 16,0 | 8,5 | 6,5 |
| Tamaño en disco | 10,1 GB | 5,4 GB | 4,1 GB |
| Memoria pico | 10,3 GB | 5,6 GB | 4,4 GB |
| Perplejidad WikiText-2 (inglés) | 14,984 | 14,994 (+0,1%) | 15,714 (+4,9%) |
| Perplejidad Wikipedia árabe | 20,171 | 20,188 (+0,1%) | 21,319 (+5,7%) |
| Generación | 50,4 tok/s | 89,2 tok/s | 115,9 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card advierte que la perplejidad es una señal gruesa y recomienda probar cada variante sobre la carga de trabajo propia.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 10,3 GB de pico para un prompt corto en bf16; 5,6 GB en 8 bits y 4,4 GB en 4 bits.
- La memoria crece con la caché KV al aumentar el contexto; para contextos largos hay que prever bastante más que el pico base. Se puede limitar con `--max-kv-size` y, donde esté disponible, cuantizar la caché KV con `--kv-bits 8`.
- Hardware objetivo: Apple Silicon. La velocidad medida (50,4 tok/s en bf16) corresponde a un Apple M4 Max; no hay datos para otros chips.
- GPU NVIDIA (A100, H100, RTX 4090): esta variante MLX no está pensada para CUDA. Para esas GPUs habría que usar el modelo base en PyTorch, no esta conversión.
- Cabe en equipos consumer de Apple con memoria unificada suficiente: 16 GB permiten bf16 con prompts cortos; 8 GB solo son viables con las variantes 4-bit o 8-bit y contextos moderados.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate`, API Python `load`/`generate`, `mlx_lm.chat` y `mlx_lm.server`), siempre con `--trust-remote-code` o `trust_remote_code=True`. No aplica vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 50,4 tok/s (bf16), 89,2 tok/s (8-bit) y 115,9 tok/s (4-bit) en M4 Max, medidos por el autor. Los tokens de razonamiento cuentan en `max_tokens`, así que el tiempo total por respuesta incluye la fase de thinking.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato/runtime |
|---|---|---|---|---|---|
| Jais-3-3.7B-MLX-bf16 (este) | 3,7B nominales (5,06B reales) | 512K | ar, en | Apache-2.0 | MLX (Apple Silicon) |
| Jais-3-3.7B (base, IFM) | 3,7B nominales | 512K | ar, en | Apache-2.0 | PyTorch/safetensors |
| Jais-3-3.7B-MLX-8bit (IFM) | 3,7B nominales | 512K | ar, en | Apache-2.0 | MLX, 8 bits |
| Jais-3-3.7B-MLX-4bit (IFM) | 3,7B nominales | 512K | ar, en | Apache-2.0 | MLX, 4 bits |

No se dispone de datos de benchmarks comparativos frente a modelos de otras familias (por ejemplo, modelos densos de 3-4B de otros proveedores) en la información proporcionada, por lo que no se incluye comparación de rendimiento. La comparación disponible se limita a las variantes del propio modelo, donde la 8-bit mantiene la perplejidad prácticamente idéntica al bf16 con la mitad de memoria y casi el doble de velocidad, y la 4-bit sacrifica entre un 5% y un 6% de perplejidad a cambio de un 60% menos de memoria y más del doble de throughput.

## Limitaciones y advertencias

- Idiomas limitados a árabe e inglés; el rendimiento en castellano u otras lenguas no está documentado y no debería asumirse.
- Riesgo de alucinación inherente a los modelos generativos; no hay evaluación publicada de tasas de alucinación.
- Sesgos conocidos: no documentados en la información disponible.
- El modo de razonamiento consume tokens de `max_tokens`; si no se deja margen suficiente, la respuesta puede truncarse antes de terminar.
- `mlx-lm` no reconoce las etiquetas `<ifm|think>`: `mlx_lm.server` devuelve el texto de razonamiento dentro de `content` en lugar de un campo `reasoning` separado, lo que rompe la compatibilidad esperada con clientes estilo OpenAI.
- El formato de tool calling no está parseado por `mlx-lm`; cualquier uso agéntico requiere un parser propio.
- La plantilla de chat original falla si un mensaje previo del asistente no incluye campo de thinking (caso típico de clientes OpenAI); esta conversión la modifica para renderizar thinking vacío en esos mensajes. Es un cambio de comportamiento respecto al modelo base que conviene tener en cuenta al comparar salidas.
- Requiere `--trust-remote-code` porque la arquitectura `k2_horizon` no está soportada nativamente; implica ejecutar código del repositorio, por lo que conviene revisarlo antes.
- La memoria crece con el contexto; los 512K tokens no son utilizables en hardware de gama baja sin cuantizar la caché KV y limitar `--max-kv-size`.
- Licencia Apache-2.0, heredada del modelo base: permite uso comercial, pero se recomienda consultar la model card original para condiciones adicionales de uso previsto.
- Solo para Apple Silicon; no es desplegable en CUDA con los runtimes habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/Jais-3-3.7B-MLX-bf16
- Modelo base: https://huggingface.co/IFM/Jais-3-3.7B
- Variante MLX 8-bit: https://huggingface.co/IFM/Jais-3-3.7B-MLX-8bit
- Variante MLX 4-bit: https://huggingface.co/IFM/Jais-3-3.7B-MLX-4bit
- Paper "Jais 3: Introducing Arabic-centric Agentic AI": https://arxiv.org/abs/2611.10224
- Licencia Apache-2.0: https://huggingface.co/IFM/Jais-3-3.7B
