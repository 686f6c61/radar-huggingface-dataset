# harshagowtham/qwen3-14b-code-agent-wsurgery

## Resumen

`harshagowtham/qwen3-14b-code-agent-wsurgery` no es un modelo completo, sino un parche de pesos (*weight-space surgery*) para el fine-tune `harshagowtham/qwen3-14b-code-agent`, que a su vez deriva de `Qwen/Qwen3-14B`. El parche reduce un 30 % de la deriva introducida por el fine-tune en los 13 tensores de mayor energía del residual stream, conservando el 70 % restante mediante la regla `W_surgery = W_base + 0.70 * (W_ft - W_base)`. No requiere reentrenamiento: se aplica por injerto byte a byte sobre los shards safetensors del modelo fine-tuneado.

La selección de tensores se realizó midiendo la energía del delta en las 40 capas del transformer: se escogieron los 8 tensores `self_attn.o_proj` y los 5 `mlp.down_proj` con mayor energía. El resultado son 13 tensores en bfloat16 que ocupan 1,31 GB, distribuidos en ficheros `.bin` independientes más un `manifest.json` con offsets, hashes y formas.

Es relevante como ejemplo práctico de técnica de edición de pesos sin entrenamiento (orientada a mitigar olvido catastrófico o exceso de especialización de un fine-tune), y como pieza de un ecosistema más amplio del mismo autor que incluye un motor de inferencia (`llm_engine`), un adaptador MCP LoRA y una versión pre-mergeada (`-v2`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-14B); el parche no altera la arquitectura |
| Parametros totales | 14B (heredados del modelo base Qwen/Qwen3-14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-14B, no confirmada) |
| Tipos de cuantizacion | no disponible (los tensores del parche estan en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (datos del parche y codigo); pesos derivados de Qwen/Qwen3-14B, tambien Apache-2.0 |
| Formato de pesos | `.bin` crudos (payload bfloat16) + `manifest.json`; se injertan en shards `.safetensors` del modelo base |
| Tamano del parche | 1,31 GB (13 tensores bf16) |
| Tensores modificados | 8 `self_attn.o_proj` + 5 `mlp.down_proj` (13 en total) |
| Alpha | 0,70 |
| Requiere torch | No (applier standalone con stdlib + huggingface_hub) |

## Arquitectura y entrenamiento

El parche opera sobre un transformer decoder-only estándar (Qwen3-14B), sin modificar su topología. La intervención consiste en una interpolación lineal entre los pesos del modelo base y los del fine-tune, aplicada solo a los 13 tensores seleccionados por energía del delta: `W_surgery = W_base + 0.70 * (W_ft - W_base)`. Los tensores afectados son los escritores del residual stream (`o_proj` de atención y `down_proj` del MLP), que son los que más influyen en la magnitud de las activaciones residuales.

La selección se basó en una medición de energía del delta a través de las 40 capas, documentada en `SURGERY_REPORT.md`. No hay entrenamiento, RLHF ni DPO asociados a este parche: es una operación puramente aritmética sobre pesos. La innovación técnica destacable es el mecanismo de aplicación seguro: verificación sha256 de los bytes originales antes de escribir, verificación post-escritura, idempotencia mediante marcador `.wsurgery_applied` y respeto del layout de safetensors (solo cambian los payloads, no las cabeceras).

## Capacidades

- Hereda las capacidades del fine-tune `qwen3-14b-code-agent`, orientado a tareas de código y agentes; el parche no añade capacidades nuevas, solo modera la deriva del fine-tune.
- Generación de texto y razonamiento propios de Qwen3-14B (no verificadas en esta ficha).
- Se integra con el motor `llm_engine` del mismo autor, que detecta y aplica el parche automáticamente al cargar.
- Compatible con el adaptador `qwen3-14b-code-agent-mcp-lora` (MCP LoRA) según la quickstart del autor.
- Aplicación idempotente y verificable criptográficamente, apta para pipelines reproducibles.
- Capacidades multilingües, tool calling, agentes o thinking mode: no disponibles en la información proporcionada para este parche.

## Casos de uso

- **Mitigación de olvido catastrófico en un fine-tune de código**: si el fine-tune `qwen3-14b-code-agent` ha degradado capacidades generales del base, aplicar este parche con alpha 0,70 recupera parte del comportamiento original en los tensores de mayor impacto sin reentrenar.
- **Despliegue reproducible en CI/CD**: el applier standalone (`apply_patch.py`) permite versionar el parche y aplicarlo de forma determinista sobre una instantánea del fine-tune, con verificación sha256 antes y después de cada escritura.
- **Investigación en edición de pesos**: sirve como caso de estudio reproducible de *weight-space surgery* con selección basada en energía del delta, útil para experimentar con distintos valores de alpha.
- **Integración con agentes MCP**: combinado con el adaptador `qwen3-14b-code-agent-mcp-lora`, se puede usar en flujos de agentes que requieran tool calling sobre un modelo de 14B.
- **Evaluación comparativa de variantes**: junto con `qwen3-14b-code-agent-v2` (pre-mergeado), permite comparar el efecto del parche frente al modelo completo en tareas de código.
- **Prototipado local sin torch**: el applier solo requiere stdlib y `huggingface_hub`, lo que facilita preparar el modelo en entornos mínimos antes de cargarlo con transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El parche en sí ocupa 1,31 GB en disco; no requiere GPU para aplicarse.
- El modelo resultante es Qwen3-14B en bfloat16, por lo que la inferencia requiere aproximadamente 28 GB de VRAM en bf16 (estimación estándar para 14B; no confirmada en la información proporcionada).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S. En consumer, una RTX 4090 (24 GB) no cabe en bf16 sin cuantización.
- Opciones de despliegue: `transformers` (según la quickstart), `llm_engine` del autor (recomendado por el autor, aplica el parche automáticamente). vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `qwen3-14b-code-agent-wsurgery` (este) | 14B (parche de 13 tensores) | no disponible | Apache-2.0 | Parche `.bin` + manifest | Requiere el fine-tune base |
| `harshagowtham/qwen3-14b-code-agent` | 14B | no disponible | Apache-2.0 (derivada) | safetensors | Fine-tune sin parchear |
| `harshagowtham/qwen3-14b-code-agent-v2` | 14B | no disponible | Apache-2.0 (derivada) | safetensors | Pre-mergeado: parche + MCP LoRA |
| `Qwen/Qwen3-14B` | 14B | no disponible | Apache-2.0 | safetensors | Modelo base upstream |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo autónomo**: el repositorio solo contiene 13 tensores; sin el fine-tune base no se puede cargar como modelo.
- **Dependencia estricta de bytes**: el applier rechaza la escritura si los bytes del snapshot no coinciden con `sha256_original`; cualquier actualización del fine-tune base invalida el parche.
- **Sin benchmarks**: no hay evidencia publicada de que el parche mejore métricas concretas; el autor solo documenta la reducción del 30 % de la deriva en los tensores seleccionados.
- **Selección heurística**: los 13 tensores se eligen por energía del delta, no por impacto medido en tareas; puede no ser óptimo para todos los casos de uso.
- **Riesgo de alucinación y sesgos**: heredados del fine-tune y del base Qwen3-14B; no evaluados en esta ficha.
- **Idiomas y contexto**: no disponibles en la información proporcionada para este parche.
- **Licencia**: Apache-2.0 para el parche y los pesos derivados; conviene verificar las condiciones del fine-tune base antes de uso comercial.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- HuggingFace del parche: https://huggingface.co/harshagowtham/qwen3-14b-code-agent-wsurgery
- Fine-tune base: https://huggingface.co/harshagowtham/qwen3-14b-code-agent
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-14B
- Motor de inferencia: https://huggingface.co/harshagowtham/qwen-agent-scripts
- Adaptador MCP LoRA: https://huggingface.co/harshagowtham/qwen3-14b-code-agent-mcp-lora
- Versión pre-mergeada: https://huggingface.co/harshagowtham/qwen3-14b-code-agent-v2
- Informe de la cirugía: `SURGERY_REPORT.md` dentro del repositorio del parche
