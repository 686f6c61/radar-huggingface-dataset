# haehoon/Qwen3.6-35B-A3B-NVFP4-ko-agentic

## Resumen

Qwen3.6-35B-A3B-NVFP4-ko-agentic es una cuantizacion NVFP4 (4 bits) del modelo Qwen/Qwen3.6-35B-A3B, calibrada especificamente para cargas de trabajo agenticas coreanas con llamada a herramientas. El modelo original es un Mixture-of-Experts (MoE) de 35B parametros totales con 3B activos, desarrollado por QwenLM, y esta variante cuantizada ha sido creada por el usuario haehoon para ejecutarse en una unica GPU de 32GB.

La relevancia de este modelo radica en que aborda un problema practico: la cuantizacion de modelos MoE grandes suele degradar la capacidad de tool calling porque la calibracion convencional deja sin estadisticas a la mayoria de los expertos. Este checkpoint resuelve ese problema forzando la calibracion de los 256 expertos y equilibrando la mezcla de datos de calibracion, lo que le permite mantener la precision en tareas de routing y llamadas multi-turno en coreano. Su licencia Apache 2.0, heredada del modelo base, facilita su uso comercial.

El modelo mantiene la longitud de contexto del original (no especificada en la informacion disponible) y soporta coreano e ingles. En las pruebas internas del autor, supera a la cuantizacion de RedHat AI en ejes agentes de seguridad (routing general 97.1% vs 89.7%) y queda estadisticamente a la par en benchmarks generales como MMLU (82.9%) o KMMLU (64.0%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en transformer (Qwen3.6), con atencion lineal hibrida |
| Parametros totales | 35B (aprox.) |
| Parametros activos | 3B (8 expertos rutados + 1 experto compartido de 256) |
| Longitud de contexto | no disponible (el comando de inferencia usa 16384) |
| Tipos de cuantizacion | NVFP4 (4 bits, `nvfp4-pack-quantized`) con capas ignoradas en mayor precision (`lm_head`, `visual.*`, `mlp.gate`, `embed_tokens`, `shared_expert_gate`, `linear_attn.*`) |
| Idiomas soportados | ko, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion NVFP4, compatible con vLLM Marlin MoE) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE con 256 expertos, de los cuales 8 se activan por token junto a un experto compartido. Incorpora atencion lineal hibrida (`linear_attn.*`), una innovacion de la familia Qwen3.6 que reduce el coste computacional en secuencias largas manteniendo la calidad de atencion full-attention en las capas criticas. La cuantizacion NVFP4 se realizo con `llm-compressor`, conservando en alta precision las capas mas sensibles (embeddings, gate del experto compartido, lm_head y los componentes de atencion lineal).

El proceso de cuantizacion fue determinante para el rendimiento agentico. La activacion de `moe_calibrate_all_experts=True` obliga a que los 256 expertos tengan estadisticas de calibracion (con top-8/256, la calibracion ordinaria deja sin datos a la mayoria de los expertos, lo que colapsa la precision en tool-calling). Ademas, el dataset de calibracion combina datos de dominio (producto de seguridad) con datos generales (ultrachat + ko-wiki) en proporcion equilibrada para evitar sesgos hacia los expertos de formato y la fuga de contenido. No se menciona entrenamiento adicional con RLHF o DPO: es exclusivamente una cuantizacion del modelo base.

## Capacidades

- Generacion de texto y razonamiento en coreano e ingles, con calidad comparable al modelo base segun benchmarks generales (MMLU 82.9%, KMMLU 64.0%).
- Llamada a herramientas (tool calling) nativa, con parser `qwen3_coder` y soporte de `--enable-auto-tool-choice` en vLLM.
- Capacidades agentes multi-turno: gestiona conversaciones con llamadas a herramientas intercaladas, segun el harness interno de seguridad.
- Razonamiento multi-step y routing de intenciones: el modelo distingue correctamente entre intenciones generales y de dominio (routing general 97.1% en el harness interno).
- Sin fugas de salida (output leakage) en el dominio de seguridad: el modelo no filtra prompts del sistema ni datos internos.
- Capacidades de vision y audio: no disponibles (el modelo base las tiene, pero la cuantizacion ignoró `visual.*`, por lo que no se garantiza).

## Casos de uso

- **Asistentes de seguridad simulados**: el modelo fue calibrado y evaluado para un producto de simulacion de seguridad. Puede gestionar conversaciones multi-turno con llamadas a herramientas en coreano, con una tasa de routing general del 97.1% y sin fugas de salida. Adecuado para entornos donde la precision de la intencion es critica.
- **Atencion al cliente automatizada en coreano**: con soporte de tool calling y contexto de 16K tokens (configurado en el comando de servir), puede consultar bases de datos, APIs de pedidos o sistemas de ticketing en conversaciones reales.
- **Agentes de codigo con herramientas**: al usar el parser `qwen3_coder`, puede integrarse en pipelines de desarrollo que requieran generacion de codigo con ejecucion de herramientas (buscar, leer archivos, ejecutar tests).
- **Clasificacion y routing de documentos**: en un entorno empresarial coreano, puede clasificar intenciones de correos o tickets y rutarlos al departamento correcto, aprovechando su precision en routing de intenciones.
- **Sistemas de QA sobre documentacion interna**: con el contexto de 16K tokens, puede responder preguntas sobre manuales de producto en coreano, usando retrieval aumentado con herramientas de busqueda.
- **Evaluacion de calidad de respuestas**: su rendimiento en KMMLU (64.0%) y KoBEST (61.9%) lo hace util para generar evaluaciones de respuestas en coreano en pipelines de tests automaticos.
- **Despliegue en edge con una sola GPU**: al caber en 32GB VRAM, es viable en entornos de produccion con una RTX 4090 o A6000, sin necesidad de cluster multi-GPU.

## Benchmarks y rendimiento

| Benchmark (test completo) | Este modelo | RedHatAI NVFP4 | nvidia NVFP4 | unsloth NVFP4 |
|---|---|---|---|---|
| HAE-RAE | 72.7 ±1.3 | 73.1 ±1.3 | 73.7 ±1.3 | 72.9 ±1.3 |
| KoBEST | 61.9 ±0.7 | 61.8 ±0.7 | 61.2 ±0.7 | 62.4 ±0.7 |
| KMMLU | 64.0 ±0.2 | 63.9 ±0.2 | 64.4 ±0.2 | 63.9 ±0.2 |
| MMLU | 82.9 ±0.3 | 82.6 ±0.3 | 83.3 ±0.3 | 83.2 ±0.3 |

En benchmarks agentes internos de seguridad (harness propio del autor, no publico):

| Metrica | Este modelo | RedHat NVFP4 |
|---|---|---|
| Routing general | 97.1% | 89.7% |
| Multi-turn | 88.1% | 86.2% |
| Tool-call routing | 67.0% | 67.0% |
| Output leakage | ninguno | ninguno |

Los resultados generales se midieron con lm-evaluation-harness (completion-style log-likelihood) y vLLM v0.24.0 con Marlin MoE backend en una sola GPU. GSM8K no se reporta por variabilidad del empaquetado entre checkpoints. Los cuatro checkpoints NVFP4 estan estadisticamente a la par en benchmarks generales (spread ≤1pp).

## Requisitos de hardware

- VRAM estimada: 32GB (el autor indica que corre en una sola GPU de 32GB, con contexto de 16K tokens).
- GPU recomendadas: RTX 4090 (24GB) no es suficiente; se necesita al menos una GPU con 32GB (A100 40GB, RTX 6000 Ada, L40S, H100 80GB).
- No cabe en GPUs consumer de gama media (8-16GB). Si cabe en GPUs consumer de gama alta con 32GB (RTX 4090 con 24GB no, pero RTX 6000 Ada si).
- Opciones de despliegue: vLLM v0.24.0+ con `--moe-backend marlin`. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Comando de referencia:
  ```bash
  vllm serve haehoon/Qwen3.6-35B-A3B-NVFP4-ko-agentic \
    --moe-backend marlin \
    --enable-auto-tool-choice --tool-call-parser qwen3_coder \
    --language-model-only --max-model-len 16384
  ```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | KMMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-NVFP4-ko-agentic (este) | 35B (3B activos) | 16K (config) | 82.9 | 64.0 | Apache 2.0 | HuggingFace |
| RedHatAI NVFP4 (Qwen3.6-35B-A3B) | 35B (3B activos) | no disp. | 82.6 | 63.9 | Apache 2.0 | HuggingFace |
| nvidia NVFP4 (Qwen3.6-35B-A3B) | 35B (3B activos) | no disp. | 83.3 | 64.4 | Apache 2.0 | HuggingFace |
| Qwen3.6-27B-Dense | 27B (dense) | no disp. | no disp. | no disp. | Apache 2.0 | HuggingFace |

Los tres checkpoints NVFP4 son equivalentes en benchmarks generales. La diferencia de este modelo es su calibracion para coreano y agentes, con mejoras claras en routing general (97.1% frente a 89.7%) y multi-turn (88.1% frente a 86.2%) respecto a RedHatAI. La alternativa densa de 27B puede ser mas adecuada si no se necesita la eficiencia del MoE.

## Limitaciones y advertencias

- **Sesgo de calibracion**: la cuantizacion esta optimizada para coreano y agentes de seguridad. Para otros idiomas o dominios, el rendimiento puede degradarse respecto al modelo base.
- **Riesgo de alucinacion**: no se han evaluado tasas de alucinacion especificas; el modelo base de Qwen3.6 presenta riesgo habitual de modelos generativos.
- **Contexto limitado**: la longitud de contexto real no se ha publicado en la model card; el comando de servir usa 16K tokens, pero el modelo base podria soportar mas.
- **Variabilidad en GSM8K**: no se reporta GSM8K por variabilidad de empaquetado entre checkpoints (4-40% de variacion). Esto sugiere que el rendimiento en matematicas puede ser inestable.
- **No se garantiza vision**: aunque el modelo base incluye componentes visuales, la cuantizacion no los calibro; el uso de vision no esta soportado.
- **Requiere vLLM**: el formato NVFP4 con Marlin backend no es compatible con llama.cpp, Ollama o TGI. El despliegue queda restringido a vLLM.
- **Hardware minimo**: 32GB VRAM obligatorios, lo que excluye GPUs consumer de gama media.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.

## Enlaces

- [HuggingFace - haehoon/Qwen3.6-35B-A3B-NVFP4-ko-agentic](https://huggingface.co/haehoon/Qwen3.6-35B-A3B-NVFP4-ko-agentic)
- [HuggingFace - Qwen/Qwen3.6-35B-A3B (modelo base)](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [HuggingFace - nvidia/Qwen3.6-35B-A3B-NVFP4](https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4)
- [ModelScope - Qwen3.6-35B-A3B](https://www.modelscope.ai/models/Qwen/Qwen3.6-35B-A3B)
- [DeepWiki - Qwen3.6 Models](https://deepwiki.com/QwenLM/Qwen3.6/1.1-qwen3.6-models)
- [Guia de Qwen 3.6 (insiderllm.com)](https://insiderllm.com/guides/qwen-3-6-local-ai-guide/)
