# Anonym0usWork1221/feyospace-nvfp4a16

## Resumen

Feyospace NVFP4A16 es una cuantización de solo pesos en 4 bits (W4A16) del modelo OBLITERATUS/feyospace-s1-obliterated, una versión "abliterated" (sin mecanismos de rechazo) de feyospace/feyospace-v1.1-small, un Qwen3.8-27B entrenado posteriormente en tareas de seguridad y hardware. El trabajo lo publica el usuario Anonym0usWork1221 y no entrena ningún modelo: solo cambia el formato de almacenamiento para reducir el peso de 109 GB (FP32) a 20,6 GB, permitiendo su despliegue en dos GPU de 16 GB con vLLM.

La relevancia práctica está en que un modelo de ~27.800 millones de parámetros, con cabeza MTP (multi-token prediction) para decodificación especulativa y torre de visión, cabe en hardware de consumo (por ejemplo, 2× RTX 5060 Ti) manteniendo el cabezal MTP en BF16 para que la decodificación especulativa funcione. La cuantización se realizó con llm-compressor mediante `model_free_ptq` y el esquema NVFP4A16, sin conjunto de calibración, y requiere kernels NVFP4 en GPU Blackwell.

El modelo conserva la orientación del original hacia ciberseguridad y tareas de hardware, con la salvedad de que el "uncensoring" no está medido conductualmente y de que no se ha evaluado la precisión tras la cuantización. La licencia es Apache-2.0, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8) con cabeza MTP y torre de visión; cuantización W4A16 NVFP4 |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el README usa `--max-model-len auto`) |
| Tipos de cuantizacion | NVFP4A16 (W4A16, solo pesos); capas en BF16: `lm_head`, embeddings, torre de visión, cabeza MTP, `conv1d`, `linear_attn.in_proj_a`/`in_proj_b` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), librería vLLM |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.8 de ~27,8 B de parámetros con atención híbrida (incluye proyecciones `linear_attn.in_proj_a`/`in_proj_b` y `conv1d`), torre de visión y una cabeza MTP (multi-token prediction) que habilita decodificación especulativa en vLLM. Sobre ese modelo, OBLITERATUS aplicó "abliteration" (eliminación de la dirección de rechazo) y feyospace lo post-entrenó en tareas de seguridad y hardware. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO.

Esta publicación no entrena: convierte FP32 a BF16 las matrices grandes, re-fragmenta los safetensors para que cada capa del decodificador quede en un único fichero (NVFP4 fusiona escalas entre qkv y gate/up) y cuantiza con llm-compressor `model_free_ptq` (esquema NVFP4A16, sin calibración) directamente sobre safetensors, lo que preserva la cabeza MTP que una ruta basada en transformers descartaría. La innovación relevante es mantener `mtp.*` en `quantization_config.ignore`: si vLLM leyera la cabeza MTP como 4 bits, la decodificación especulativa correría con ~0 % de aceptación. Se verificaron 400 lineales cuantizadas, 15 tensores MTP y 20,6 GB de pesos; el proceso se ejecutó en una instancia gratuita de Google Colab T4, transmitiendo un shard fuente cada vez.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general (base Qwen3.8).
- Post-entrenamiento orientado a ciberseguridad y tareas de hardware.
- Decodificación especulativa mediante cabeza MTP (`--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`).
- Tool calling / function calling en vLLM (`--enable-auto-tool-choice --tool-call-parser qwen3_coder`).
- Parseo de razonamiento con `--reasoning-parser qwen3`.
- Procesamiento de visión (torre de visión conservada en BF16; el despliegue de referencia usa `--language-model-only`, por lo que la visión no se activa por defecto en esa configuración).
- Comportamiento "abliterated"/"uncensored" según el modelo fuente, si bien no está medido conductualmente.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de seguridad y triaje de incidentes: el post-entrenamiento del modelo fuente en ciberseguridad permite resumir alertas, clasificar vulnerabilidades y redactar borradores de informes; el despliegue en 2× 16 GB abarata el servicio frente al modelo en FP32 de 109 GB.
- Asistencia en tareas de hardware: consultas sobre especificaciones, compatibilidades y diagnóstico de componentes, aprovechando el dominio declarado del modelo fuente.
- Servicio conversacional self-hosted: API compatible con OpenAI vía vLLM (`vllm/vllm-openai`) con prefix caching y KV cache en FP8, adecuado para prototipos y entornos con requisitos de privacidad.
- Agentes con tool calling: integración con `qwen3_coder` como parser de llamadas a herramientas para pipelines de automatización multi-paso.
- Generación asistida con baja latencia: la cabeza MTP en BF16 permite decodificación especulativa (aceptación media ≥ 2 en los logs) para reducir el tiempo por token en GPUs Blackwell.
- Investigación sobre cuantización: el `pipeline.py` incluido sirve como referencia reproducible de cuantización NVFP4A16 sin calibración sobre safetensors, útil para estudiar el impacto de W4A16 en calidad.
- Evaluación de alineación/abliteration: el modelo permite estudiar el efecto de eliminar la dirección de rechazo, con la cautela de que la propia model card reconoce que el test conductual no se realizó.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantización. El autor indica que `secbench_comparison.json` y `seceval_comparison.json` son del publicador original y se midieron sobre el modelo sin cuantizar, no sobre este build, y que no se ejecutó ninguna evaluación de precisión tras la cuantización.

## Requisitos de hardware

- VRAM estimada: ~20,6 GB de pesos; el despliegue de referencia usa 2 GPU de 16 GB con tensor parallel y `--gpu-memory-utilization 0.88`.
- GPU recomendadas: Blackwell (requerido para kernels NVFP4); el ejemplo del autor cita 2× RTX 5060 Ti. No se garantiza funcionamiento en arquitecturas anteriores sin soporte NVFP4.
- Cabe en GPU de consumo: sí, en el escenario de 2× 16 GB descrito; no se documenta un despliegue en una sola GPU de consumo.
- Despliegue: vLLM (imagen `vllm/vllm-openai:latest`) con build que soporte Qwen3.8; no se mencionan llama.cpp, Ollama ni TGI para este formato.
- Configuración de referencia: `--dtype bfloat16 --tensor-parallel-size 2 --disable-custom-all-reduce --max-num-seqs 1 --max-num-batched-tokens 4096 --kv-cache-dtype fp8 --language-model-only --enable-prefix-caching`, con `NCCL_P2P_DISABLE=1`, `NCCL_IB_DISABLE=1`, `NCCL_CUMEM_ENABLE=0`.
- Latencia y throughput: no disponibles; el autor solo señala que W4A16 puede decodificar algo más lento que un build W4A4 NVFP4 en el mismo hardware, y recomienda verificar la aceptación MTP en `SpecDecoding metrics`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anonym0usWork1221/feyospace-nvfp4a16 | ~27,8 B | no disponible | NVFP4A16 (W4A16), 20,6 GB | Apache-2.0 | Hugging Face, vLLM |
| OBLITERATUS/feyospace-s1-obliterated | ~27,8 B (mismo modelo) | no disponible | FP32, ~109 GB | Apache-2.0 | Hugging Face |
| feyospace/feyospace-v1.1-small | ~27,8 B (modelo origen) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El "uncensoring" no está medido: el `evaluation.json` del repo fuente solo incluye una puntuación mecanística de dirección de rechazo (residual medio 20,1 → 16,3) y marca el test conductual como "not tested".
- No se ejecutó evaluación de precisión sobre esta cuantización; NVFP4 W4A16 suele costar algo de calidad.
- Los ficheros de benchmarks citados corresponden al modelo sin cuantizar del publicador original.
- W4A16 puede decodificar algo más lento que un build W4A4 NVFP4 en el mismo hardware.
- Evitar KV cache TurboQuant (`turboquant_k8v4`) con esta familia en builds dev de vLLM: el autor reporta salida con tokens repetidos; usar `--kv-cache-dtype fp8`.
- Requiere GPU Blackwell y un build de vLLM con soporte de Qwen3.8; el despliegue de referencia desactiva la visión (`--language-model-only`).
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base, no evaluados aquí.
- Licencia Apache-2.0 permite uso comercial, pero el comportamiento "abliterated" puede generar contenido no filtrado; conviene evaluar el riesgo antes de producción.
- El autor recomienda una comprobación rápida de corrección (pregunta tipo needle-in-context) antes de fiarse de las cifras de velocidad.

## Enlaces

- Hugging Face: https://huggingface.co/Anonym0usWork1221/feyospace-nvfp4a16
- Modelo base (abliterated): https://huggingface.co/OBLITERATUS/feyospace-s1-obliterated
- Modelo origen: https://huggingface.co/feyospace/feyospace-v1.1-small
- Paper citado por el autor: arXiv 2609.08418
- Script de cuantización: `pipeline.py` incluido en el repositorio
