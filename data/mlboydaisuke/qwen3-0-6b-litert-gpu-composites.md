# mlboydaisuke/Qwen3-0.6B-LiteRT-gpu-composites

## Resumen

Qwen3-0.6B LiteRT GPU composites es una exportación experimental del modelo Qwen3-0.6B de Alibaba Qwen al formato LiteRT-LM (`.litertlm`), realizada por el usuario mlboydaisuke con el objetivo de probar los *flags* de composites GPU de la herramienta litert-torch. No se trata de un lanzamiento estable, sino de un banco de pruebas para validar la fusión de operaciones (QKV, SwiGLU, SDPA, RoPE) en el grafo de ejecución de LiteRT-LM, orientado al despliegue en dispositivos con aceleración gráfica (WebGPU y Metal en macOS).

El modelo base es Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros con licencia Apache 2.0, cuantizado a int4 en bloques de 32 con activaciones en fp32 (`dynamic_wi4b32_afp32`). El repositorio incluye tres variantes del bundle que difieren en el conjunto de composites activados (11 flags, 9 flags y 9 flags más RoPE), con un tamaño de fichero en torno a 342 MB cada una.

La relevancia de esta ficha es acotada: sirve como referencia técnica para quien quiera reproducir la exportación, entender el estado de madurez de los composites GPU en LiteRT-LM 0.17.0 o evaluar el rendimiento de Qwen3-0.6B cuantizado en hardware Apple. No es un modelo para producción: el autor advierte explícitamente de fallos de corrección en la variante de 11 flags.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a grafo LiteRT-LM |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens de caché; firma de prefill fija de 1.024 tokens; `max_num_tokens` 4.096 en metadatos |
| Tipos de cuantizacion | int4 blockwise-32 en pesos, fp32 en activaciones (`dynamic_wi4b32_afp32`) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM); no se publican safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo base Qwen3-0.6B es un transformer denso de la familia Qwen3. Esta exportación no reentrena ni ajusta el modelo: parte de los pesos originales de `Qwen/Qwen3-0.6B` y los convierte a un grafo LiteRT-LM mediante `litert_torch.generative.export_hf`, con cuantización dinámica int4 en bloques de 32 y activaciones fp32. El proceso se ejecutó con litert-torch en el commit `6d4c622` de upstream/main (2026-09-08), litert-lm-builder 0.17.0, ai-edge-litert 2.2.0, ai-edge-quantizer 0.9.0, torch 2.13.0 y transformers 5.14.1.

La innovación técnica está en los *composites* GPU fusionados en el grafo: `odml.qkv_norm_rope`, `odml.swiglu`, `odml.cache_update` y `odml.sdpa_transposed` (este último solo en decodificación), junto con proyecciones QKV y gate-up fusionadas y una máscara booleana. La variante de 11 flags activa todos ellos; la de 9 flags omite `--use_sdpa_composite` y `--use_qkv_norm_rope_composite`; la variante RoPE añade `--use_rope_composite=True`. Los metadatos del bundle provienen de `LlmMetadataProto.pbtext` de LiteRT-LM v0.17.0 (sampler TOP_P con k=20, p=0,95, t=0,6; stop token `<|im_end|>`). El 21 de septiembre de 2026 se actualizó la plantilla de chat para aceptar el formato de *content-parts* de la versión 0.18, sin alterar pesos, tokenizador ni metadatos del ejecutor.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni las fases de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva con decodificación en GPU (WebGPU y Metal).
- Razonamiento y respuesta a preguntas breves; el autor valida con un chequeo de 8 preguntas de sanidad.
- Modo *thinking* desactivable mediante el flag `--thinking false` en el CLI de LiteRT-LM.
- Caché dinámica en GPU con longitud configurable (32.768 tokens en estos bundles).
- Soporte de plantilla de chat con formato de *content-parts* (actualización de septiembre de 2026).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes, visión, audio: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de composites GPU en LiteRT-LM: usar los tres bundles como banco de pruebas A/B para medir el impacto de cada flag (`--use_sdpa_composite`, `--use_qkv_norm_rope_composite`, `--use_rope_composite`) en corrección y velocidad sobre hardware Apple.
- Prototipado de inferencia local en macOS: la variante de 9 flags alcanza 293 tok/s de decodificación y 6,6k tok/s de prefill en un Mac Studio M4 Max vía WebGPU, adecuada para demos interactivas en local sin servidor.
- Benchmarking de cuantización int4 blockwise-32: comparar la calidad de salida y el rendimiento del esquema `dynamic_wi4b32_afp32` frente a otras recetas de cuantización en modelos pequeños.
- Validación de pipelines de exportación: reproducir el comando de exportación con litert-torch para verificar la cadena de herramientas (builder 0.17.0, ai-edge-litert 2.2.0, transformers 5.14.1) antes de exportar modelos mayores.
- Pruebas de regresión de runtime: el chequeo de 8 preguntas con resultado 8/8 en la variante de 9 flags sirve como test de humo para detectar regresiones al actualizar LiteRT-LM (0.18.1 frente a 0.19.0).
- Investigación sobre fusión de operadores: analizar los fallos de validación WGSL de `odml.sdpa_transposed` y `odml.qkv_norm_rope` para contribuir correcciones al runtime o a los kernels.

## Benchmarks y rendimiento

Mediciones del autor sobre un Mac Studio M4 Max (medianas de 3 procesos), con los ficheros de prefill dinámico previos; los ficheros actuales de prefill fijo a 1.024 se revalidaron con velocidad equivalente dentro del 3 %.

| Fichero | Ruta WebGPU (wheel PyPI litert-lm 0.17.0) | Ruta Metal (litert_lm_main v0.17.0) |
|---|---|---|
| 11 flags | No ejecuta: fallo de validación WGSL en `odml.sdpa_transposed` y `odml.qkv_norm_rope`; salida `!!` | Compila pero salida incorrecta (bucle de repetición); 28 errores de shape en `flash_decode_sdpa` ({1,1,1,1,2048} frente a {1,16,1,1,128}) |
| 9 flags | Decode 293 tok/s, prefill 6,6k tok/s; chequeo 8/8 | Decode 243 tok/s, prefill 6,8k tok/s; chequeo 7/8 |
| 9 flags + rope | Decode 310 tok/s, prefill 6,7k tok/s; chequeo 8/8 | Decode 252 tok/s, prefill 6,9k tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Android e iOS no se midieron.

## Requisitos de hardware

- VRAM/almacenamiento: cada bundle ocupa aproximadamente 342 MB en disco (341,7 MB el de 11 flags, 341,4 MB el de 9 flags, 342,3 MB el de 9 flags con RoPE); el repo completo pesa 3,1 GB.
- GPU recomendadas: el autor solo valida Mac Studio con M4 Max (rutas WebGPU y Metal). No hay datos para A100, H100 ni RTX 4090.
- GPU de consumo: por tamaño (0,6B en int4) debería caber en cualquier GPU consumer moderna, pero no se aportan mediciones que lo confirmen.
- Despliegue: CLI `litert-lm` (versión 0.17.0 recomendada para estos ficheros; 0.18.1 y 0.19.0 con matices), y `litert_lm_main` compilado desde la etiqueta v0.17.0 con `--//runtime/executor:gpu_accelerator=metal`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 293-310 tok/s de decodificación y 6,6-6,9k tok/s de prefill en M4 Max según variante y backend.
- Nota de compatibilidad: con litert-lm 0.19.0 o superior hay que crear el Engine con `max_num_tokens` de 4.096, porque estos ficheros solo tienen firma de prefill de 1.024 tokens y 0.19.0 falla con `FAILED_PRECONDITION` si se configura a 1.024.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3-0.6B LiteRT GPU composites (esta ficha) | 0,6B | 32.768 (caché) | `.litertlm` int4 | Apache 2.0 | Experimental, fallos en variante de 11 flags |
| Qwen/Qwen3-0.6B (original) | 0,6B | no disponible en la información | safetensors | Apache 2.0 | Estable, referencia upstream |
| Otras exportaciones LiteRT-LM de Qwen3-0.6B | 0,6B | no disponible | `.litertlm` | Apache 2.0 | No disponibles en la información |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento: el autor lo describe como exportaciones de prueba; la variante de 11 flags no produce salida correcta en las rutas GPU de LiteRT-LM 0.17.0 en macOS.
- La variante de 11 flags devuelve basura en WebGPU con litert-lm 0.18.1 y requiere 0.19.0 o superior; aun así, en Metal la salida es incorrecta (bucle de repetición).
- Solo hay firma de prefill de 1.024 tokens; con litert-lm 0.19.0 o superior es obligatorio configurar `max_num_tokens` a 4.096.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingüe más allá de la del modelo base.
- Riesgo de alucinación inherente a un modelo de 0,6B; no apto para tareas que exijan alta fiabilidad factual sin verificación.
- Sin mediciones en Android, iOS, A100, H100 ni GPU de consumo; el rendimiento en esas plataformas es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y los fallos de corrección desaconsejan producción.
- El repo incluye 3,1 GB por el historial de commits con versiones anteriores de los ficheros; conviene descargar solo el bundle necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-0.6B-LiteRT-gpu-composites
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- litert-torch (commit de exportación): https://github.com/google-ai-edge/litert-torch/commit/6d4c622c9a3aade4d411a1e859c6bbe571d38ee0
- LiteRT-LM v0.17.0: https://github.com/google-ai-edge/LiteRT-LM/tree/v0.17.0
- Metadatos Qwen3 de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/v0.17.0/models/qwen3/LlmMetadataProto.pbtext
- Herramienta hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Plantilla de chat dual: https://github.com/john-rocky/hf-to-litertlm/blob/main/tools/chat_template_parts/dual/4155a0aa5616.jinja
- Script de intercambio de plantilla: https://github.com/john-rocky/hf-to-litertlm/tree/main/tools/chat_template_parts
- Commit con las versiones previas de los ficheros: `0c5e31dd0281e19d544c853cea37771c30a368d1` (en el historial del repo de Hugging Face)
