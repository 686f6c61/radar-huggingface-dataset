# FangZhang5959/Qwen3.8-Flash-Next-ZH-Writing-RP-K128-W3A16

## Resumen

Qwen3.8-Flash-Next-ZH-Writing-RP-K128-W3A16 es una derivación podada y cuantizada del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario FangZhang5959. El modelo parte de una arquitectura MoE (`Qwen4ExpForConditionalGeneration`, 48 capas, 512 expertos enrutados en el original) y aplica una poda del 75% de expertos (de 512 a 128) manteniendo el enrutamiento top-10, junto con una cuantización de expertos W3A16 (`uint3b4`, group-64, kernel Humming). El objetivo declarado es ofrecer una variante de "mínimo consumo de VRAM" especializada en rol (RP) y escritura creativa en chino, ejecutable en una GPU de 24 GiB con `vllm==0.34.0`.

La relevancia del modelo es acotada y muy específica: se trata de un artefacto de investigación orientado a despliegue local en chino, no de un modelo de propósito general. El autor declara explícitamente una degradación severa fuera de dominio (Pass@1 en código 0,0%, conocimiento enciclopédico en chino 11,7%, inglés no utilizable). Su valor está en la combinación de poda MoE selectiva (técnica REAP con máscara `v3_M2d`), cuantización de expertos calibrada sobre el modelo ya podado, y protección de capas sensibles en BF16 byte a byte.

El modelo se distribuye en 21 shards safetensors (56.956 tensores, 48,247 GiB en disco) con un backbone en GPU de aproximadamente 21,4 GiB tras el offload del vocabulario PLE a memoria paginada. La licencia es Qwen Community License 1.0, que restringe el uso comercial de productos MaaS y asistentes comerciales de programación u ofimática sin autorización adicional de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration` (transformer MoE, 48 capas, 128 expertos enrutados tras poda, top-10) |
| Parametros totales | no disponible (el autor no publica el recuento; el directorio pesa 48,247 GiB en W3A16 + BF16 selectivo) |
| Parametros activos | no disponible (top-10 sobre 128 expertos enrutados; el autor no da cifra absoluta) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W3A16 en expertos (`uint3b4`, group-64, Humming); PLE en NVFP4; capas sensibles en BF16 |
| Idiomas soportados | chino (`zh`) únicamente; el autor declara el inglés "no utilizable" |
| Licencia | Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors (21 shards, 56.956 tensores), `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE del base Qwen/Qwen3.8-Flash-Next, con 48 capas y enrutamiento top-10. Sobre esa base se aplica una poda de expertos de 512 a 128 (75% de reducción) mediante la técnica REAP con la máscara `v3_M2d`, preservando el comportamiento del enrutamiento top-10 original. El checkpoint combina el base con el parche no-experto de `huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2`, lo que elimina parte de los rechazos del modelo original y explica su orientación a rol y escritura creativa sin restricciones temáticas.

La cuantización de expertos es W3A16 (`uint3b4`, group-64) calibrada con los segundos momentos de activación del modelo nativo ya podado (`k128`). Las capas sensibles se conservan en BF16 byte a byte: `lm_head`, `embed_tokens`, `model.visual.*`, `hyper_connection`, `linear_attn`, `self_attn`, `mlp.gate` y `shared_expert`. El vocabulario PLE/Engram se almacena en NVFP4 nativo de `vllm==0.34.0` (26,822 GiB) y se descarga a memoria paginada con `cpu_offload=True` en Linux. El autor declara una auditoría completa de los 21 shards mediante `sha256_manifest.json` con verificación byte a byte contra la fuente BF16. Se soporta decodificación especulativa heterogénea mediante un MTP externo (`Qwen3.8-Flash-Next-MTP512-BF16`, +7,2 GiB) sin parches sobre vLLM.

## Capacidades

- Generación de texto en chino orientada a rol (RP) y escritura creativa, con un Elo declarado de 1548 en RP y 7,85 de media no vacía.
- Escritura creativa en chino funcional pero degradada (Elo 1351), según el propio autor.
- Conversación multi-turno con persona persistente, gracias al ajuste fino implícito del base y al parche abliterated.
- Decodificación especulativa vía MTP externo compatible con vLLM 0.34.0.
- Capacidades visuales heredadas del base (`model.visual.*` presente), aunque no documentadas ni evaluadas por el autor.
- Sin soporte declarado de tool calling, function calling ni razonamiento multi-paso fiable.
- Sin capacidades multilingües: solo chino.
- Sin modo "thinking" documentado.

## Casos de uso

- Rol conversacional local en chino: despliegue en una única GPU de 24 GiB para sesiones de roleplay con personas largas, aprovechando el ajuste del base y el parche abliterated para evitar rechazos en ficción adulta o temas sensibles.
- Escritura creativa asistida en chino: generación de narrativa, diálogos y descripciones en un entorno local sin conexión, adecuado para autores que requieren privacidad y no pueden usar APIs en la nube.
- Investigación sobre poda MoE: el checkpoint sirve como referencia reproducible de la técnica REAP con máscara `v3_M2d` y cuantización W3A16 calibrada, útil para estudiar la degradación por dominio tras podar el 75% de expertos.
- Evaluación de cuantización extrema: permite medir el impacto de W3A16 con group-64 y protección selectiva en BF16 sobre la calidad de generación en un dominio acotado.
- Despliegue en servidores con VRAM limitada: con `vllm==0.34.0` y `--moe-backend humming`, el backbone ocupa unos 21,4 GiB, lo que permite servir el modelo en tarjetas de 24 GiB sin MTP o con MTP en 32 GiB.
- Generación de datos sintéticos de rol en chino: útil para aumentar corpus de diálogo con estilo consistente, siempre que se acepte la degradación fuera de dominio y se filtre la salida.
- Pruebas de decodificación especulativa heterogénea: combinación con el MTP512-BF16 para medir aceleración en un MoE podado y cuantizado sin modificar el runtime.

## Benchmarks y rendimiento

| Benchmark | Resultado declarado |
|---|---|
| Elo RP en chino | 1548 |
| Media no vacía RP en chino | 7,85 |
| Elo escritura creativa en chino | 1351 |
| Pass@1 en código | 0,0% |
| Conocimiento enciclopédico en chino | 11,7% |
| Inglés | no utilizable (sin cifra) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son las que el autor reporta en la model card y no incluyen la metodología de evaluación ni el conjunto de comparación.

## Requisitos de hardware

- VRAM del backbone en GPU: aproximadamente 21,4 GiB con el PLE en memoria paginada (`cpu_offload=True`, Linux).
- VRAM total en disco: 48,247 GiB (21 shards safetensors); el PLE NVFP4 ocupa 26,822 GiB y reside en RAM del sistema.
- GPU recomendadas: una única tarjeta de 24 GiB (RTX 4090, L4 24 GB, A10G 24 GB) para el backbone sin MTP; 32 GiB o más (A100 40 GB, H100, L40S 48 GB) si se añade el MTP512-BF16 (+7,2 GiB).
- Cabe en GPU de consumo: sí, en RTX 4090 24 GB con `cpu_offload` del PLE y sin MTP.
- Despliegue: `vllm==0.34.0` con `--moe-backend humming`, `transformers>=5.22.2`, `compressed-tensors>=0.17.0`, `humming-kernels>=0.1.19`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Decodificación especulativa: `--speculative-config '{"method":"mtp","model":"./Qwen3.8-Flash-Next-MTP512-BF16","num_speculative_tokens":1}'`.
- Parámetros de muestreo recomendados por el autor: `temperature=0.7`, `top_p=0.8`, `top_k=20`, `min_p=0.1`, `repetition_penalty=1.1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-ZH-Writing-RP-K128-W3A16 | no disponible (MoE 128 expertos top-10) | no disponible | RP y escritura creativa en chino, mínimo footprint | Qwen Community 1.0 | Hugging Face, ModelScope |
| Qwen3.8-Flash-Next-ZH-Writing-RP-K192-W3A16 | no disponible (MoE 192 expertos) | no disponible | Misma familia, mayor retención de expertos | Qwen Community 1.0 | Hugging Face (mismo autor) |
| Qwen3.8-Flash-Next-ZH-Writing-RP-K128-NVFP4 | no disponible (MoE 128 expertos) | no disponible | Misma poda, cuantización NVFP4 | Qwen Community 1.0 | Hugging Face (mismo autor) |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | Modelo generalista original | Qwen Community 1.0 | Hugging Face |

El autor indica que, si hay VRAM suficiente, conviene usar `K192-W3A16` o `K128-NVFP4` por su mejor rendimiento en escritura larga. No se dispone de comparativas con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa fuera de dominio: Pass@1 en código 0,0% y conocimiento enciclopédico en chino 11,7%, según el propio autor.
- Inglés no utilizable; el modelo está entrenado y evaluado únicamente en chino.
- La poda del 75% de expertos (512 a 128) reduce la capacidad del modelo base de forma no trivial; los resultados de RP no son extrapolables a otras tareas.
- El parche `abliterated-v2` elimina rechazos, lo que aumenta el riesgo de generar contenido sensible, sesgado o inapropiado sin filtro.
- Riesgo de alucinación elevado en conocimiento factual, coherente con el 11,7% declarado en enciclopedia.
- Licencia Qwen Community 1.0: uso comercial de MaaS y de asistentes comerciales de programación u ofimática requiere autorización adicional de Qwen; la redistribución debe mantener el aviso de copyright.
- Requiere `vllm==0.34.0` y versiones específicas de dependencias; no hay soporte documentado para otros runtimes.
- El PLE en `cpu_offload` añade latencia dependiente del ancho de banda PCIe y de la RAM del sistema.
- No hay información sobre longitud de contexto efectiva, sesgos medidos ni evaluación de seguridad.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/FangZhang5959/Qwen3.8-Flash-Next-ZH-Writing-RP-K128-W3A16
- GitHub del autor: https://github.com/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP
- README técnico en inglés: https://github.com/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP/blob/main/README_EN.md
- ModelScope (espejo en China): https://modelscope.cn/models/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP-K128-W3A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Parche abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2
