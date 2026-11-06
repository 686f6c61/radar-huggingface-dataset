# rocleez0120/mt_slm_ctx_compress

## Resumen

`rocleez0120/mt_slm_ctx_compress` es un ajuste fino (fine-tune) del modelo `Qwen/Qwen2.5-Coder-1.5B-Instruct` orientado a una tarea muy concreta: comprimir la sesión de un agente de programación en un resumen JSON corto. Lo publica el usuario de Hugging Face `rocleez0120` como pieza especializada para el arena `ctx_compress` del proyecto Microtensor. Con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) y un repositorio de 3,1 GB en formato safetensors, se trata de un modelo pequeño pensado para ejecutarse en hardware modesto y con baja latencia.

La relevancia del modelo es acotada y específica: no es un modelo de propósito general, sino un componente de infraestructura para pipelines de agentes que necesitan reducir el histórico de una sesión de codificación a un resumen estructurado antes de continuar el razonamiento. El formato de salida es JSON y la decodificación recomendada es greedy con parada en tokens especiales de Qwen/Llama, lo que indica un uso determinista y reproducible dentro de un sistema mayor.

La model card presenta una ambigüedad relevante: el modelo base es Qwen2.5-Coder-1.5B-Instruct (licencia Apache 2.0), pero el autor afirma que las salidas siguen la licencia de Llama 3.1 y que un fine-tune distribuido debe llevar el nombre Llama y la mención "Built with Llama". Esta contradicción debe resolverse antes de cualquier uso comercial. Los idiomas soportados no están declarados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune de Qwen2.5-Coder-1.5B-Instruct |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 declarada en metadatos; el autor indica que las salidas siguen la licencia de Llama 3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer decoder-only Qwen2.5-Coder-1.5B-Instruct, una arquitectura densa de aproximadamente 1,5 mil millones de parámetros con atención causal estándar. No se documentan cambios arquitectónicos respecto al modelo base: la intervención se limita al ajuste de pesos sobre una tarea concreta. El autor no especifica hiperparámetros de entrenamiento, número de tokens vistos, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

El dataset de entrenamiento declarado es `nebius/SWE-agent-trajectories`, un corpus de trayectorias de agentes de resolución de incidencias de software (estilo SWE-bench). La innovación técnica no está en la arquitectura sino en el objetivo: el modelo aprende a mapear una sesión larga de agente a un resumen JSON compacto, lo que permite reducir el consumo de contexto en sistemas multiagente. La model card recomienda decodificación greedy con parada en `<|im_end|>`, `<|endoftext|>` y `<|end|>`, y un máximo de 3072 tokens nuevos, lo que sugiere un formato de salida acotado y predecible.

## Capacidades

- Compresión de sesiones de agente de programación a un resumen JSON corto.
- Generación de texto estructurado en formato JSON siguiendo el prompt del arena `slm_prompt`.
- Razonamiento sobre trayectorias de resolución de incidencias de software (derivado del dataset SWE-agent-trajectories).
- Capacidad de código heredada del modelo base Qwen2.5-Coder-1.5B-Instruct (generación y comprensión de código), aunque el fine-tune puede haberla desplazado hacia la tarea de compresión.
- Soporte de tool calling y function calling: no documentado específicamente para este fine-tune.
- Soporte de agentes multi-step: orientado a un paso concreto dentro de un pipeline de agentes, no al bucle completo.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Compresión de contexto en agentes de codificación: el modelo recibe el histórico de una sesión SWE-agent y devuelve un JSON resumido que se reinyecta en el contexto del agente principal, reduciendo el consumo de tokens en modelos grandes.
- Pipeline de resolución de incidencias: integrado como paso de preprocesado antes de un modelo mayor, condensa los intentos fallidos y el estado del repositorio en un resumen manejable.
- Orquestación multiagente: cada subagente puede delegar la compactación de su memoria a este SLM de 1,5B, liberando VRAM y ventana de contexto en el modelo coordinador.
- Registro y auditoría de sesiones: genera resúmenes JSON estructurados y parseables de sesiones de agente para almacenamiento, telemetría o revisión posterior.
- Despliegue en hardware de gama baja: con 1,5B parámetros cabe en GPUs de consumo (por ejemplo, RTX 3060/4060 en cuantización de 8 o 4 bits) y permite ejecutar la compresión en local o en el borde.
- Evaluación comparativa en el arena `ctx_compress`: sirve como participante de referencia para medir la calidad de compresión frente a otros SLM en el proyecto Microtensor.
- Prototipado de investigación sobre memoria de agentes: base reproducible para experimentar con estrategias de compactación de contexto en tareas de ingeniería de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100/H100 no son necesarias y estarían sobredimensionadas.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en FP16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: al publicarse solo en safetensors, requiere frameworks que carguen pesos Hugging Face, como transformers, vLLM o TGI. Para llama.cpp/Ollama sería necesario convertir los pesos a GGUF, conversión no documentada por el autor.
- Latencia y throughput: no disponibles. Al ser un modelo de 1,5B con decodificación greedy y salida acotada, se espera baja latencia en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `rocleez0120/mt_slm_ctx_compress` | 1,54B | No disponible | Apache 2.0 (con caveat Llama 3.1 según el autor) | Compresión de sesiones de agente a JSON |
| `Qwen/Qwen2.5-Coder-1.5B-Instruct` | 1,54B | 32.768 tokens (según model card pública del base) | Apache 2.0 | Propósito general de código e instrucciones |
| `Qwen/Qwen2.5-Coder-0.5B-Instruct` | 0,49B | 32.768 tokens (según model card pública del base) | Apache 2.0 | Propósito general de código, menor huella |
| `meta-llama/Llama-3.2-1B-Instruct` | 1,24B | 128.000 tokens (según model card pública) | Llama 3.2 Community License | Propósito general de instrucciones |

La comparación directa de rendimiento no es posible porque el autor no publica benchmarks. Frente al modelo base, este fine-tune sacrifica generalidad por una tarea muy concreta; frente a alternativas de tamaño similar, su ventaja potencial es la especialización en compactación de trayectorias SWE-agent, pero carece de datos públicos que lo respalden.

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo está entrenado para una única tarea (resumen JSON de sesiones de agente) y probablemente rinda mal en usos generales de código o conversación.
- Ambigüedad de licencia: los metadatos declaran Apache 2.0, pero la model card afirma que las salidas siguen la licencia de Llama 3.1 y exige el nombre Llama y la mención "Built with Llama". Esta contradicción debe aclararse antes de un uso comercial o de una redistribución.
- Riesgo de alucinación en el resumen: al comprimir trayectorias largas en JSON, puede omitir pasos relevantes o inventar campos; conviene validar el esquema de salida y verificar la información crítica.
- Idiomas no declarados: no hay garantía de comportamiento correcto fuera del inglés técnico presente en el dataset de trayectorias.
- Longitud de contexto no documentada: se desconoce si el fine-tune preserva la ventana nativa del modelo base; sesiones de agente largas podrían truncarse.
- Formato de decodificación dependiente: el autor especifica greedy, tokens de parada concretos y un máximo de 3072 tokens nuevos; desviarse de esta configuración puede degradar la calidad del JSON.
- Sin benchmarks públicos ni métricas de calidad de compresión: no es posible evaluar su rendimiento frente a alternativas sin ejecutar pruebas propias.
- Modelo con muy poca tracción (21 descargas, 0 likes en el momento de la consulta): no hay evidencia comunitaria de robustez en producción.
- No se documentan cuantizaciones oficiales ni conversión a GGUF, lo que limita el despliegue en entornos ligeros sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rocleez0120/mt_slm_ctx_compress
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/nebius/SWE-agent-trajectories
