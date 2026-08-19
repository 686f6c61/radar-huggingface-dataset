# jasonboukheir/Qwen3.8-27B-AEON-Ultimate-Uncensored-BF16-W4A16-AutoRound

## Resumen

Este repositorio contiene una cuantización W4A16 del modelo `AEON-7/Qwen3.8-27B-AEON-Ultimate-Uncensored-BF16`, una versión "abliterada" (con el mecanismo de rechazo interno eliminado) de Qwen3.8-27B, el modelo de 27 mil millones de parámetros de Alibaba con arquitectura híbrida de atención lineal y atención completa periódica. La cuantización ha sido producida con AutoRound mediante llm-compressor y exportada en formato `compressed-tensors` para su uso con vLLM, incluyendo además escalas estáticas de caché KV en FP8 calibradas con un dataset de referencia.

El objetivo principal de esta release es permitir el despliegue eficiente del modelo en hardware Intel XPU, reduciendo el uso de memoria gracias a pesos INT4 con activaciones BF16. El repositorio no publica evaluaciones de calidad ni benchmarks de rendimiento, por lo que no se puede afirmar una mejora respecto al modelo fuente. La licencia no está declarada en este repositorio; el modelo fuente indica Apache-2.0, pero conviene revisar los términos del modelo original antes de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con linear-attention (DeltaNet) y atencion completa periodica (gated-deltanet) |
| Parametros totales | 26.895.998.496 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (INT4 simetrico, group size 128, activaciones BF16), KV-cache FP8 estatico por tensor |
| Idiomas soportados | No disponible (heredados del modelo fuente, no especificados) |
| Licencia | No disponible (el modelo fuente declara Apache-2.0, pero este repo no asevera licencia independiente) |
| Formato de pesos | compressed-tensors / safetensors (pack-quantized) |

## Arquitectura y entrenamiento

El modelo fuente, `AEON-7/Qwen3.8-27B-AEON-Ultimate-Uncensored-BF16`, es una modificacion comunitaria de Qwen3.8-27B de Alibaba, en la que se ha eliminado el comportamiento de rechazo mediante un proceso de abliteracion. La arquitectura combina capas de atencion lineal (DeltaNet) con capas de atencion completa periodica, lo que permite ventanas de contexto largas con un coste computacional reducido en las capas lineales. El modelo fuente es multimodal (vision y lenguaje) y soporta tool calling y razonamiento, aunque esta cuantizacion concreta se etiqueta como `qwen3_5_text`, lo que sugiere que el artefacto exportado se centra en generacion de texto.

La cuantizacion se ha realizado con AutoRound a traves de llm-compressor, con 1.000 iteraciones por bloque decoder, un batch size de 4 y un dataset de calibracion de 128 muestras de `NeelNanda/pile-10k` con longitud de secuencia 2.048. Se han excluido de la cuantizacion de pesos el `lm_head`, las embeddings de token y las proyecciones de entrada A y B de las capas DeltaNet. Las escalas de KV-cache FP8 se han calibrado de forma estatica y estan incluidas en `model-kv-scales.safetensors`. El proceso fue reproducible con una revision fuente fijada y semilla 42.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo fuente Qwen3.8-27B.
- Soporte de tool calling y function calling, segun las etiquetas del modelo fuente.
- Capacidad de razonamiento multi-paso y modo thinking, presente en la familia Qwen3.
- Capacidades multilingues, aunque no se especifican idiomas concretos en la informacion disponible.
- Modelo "uncensored": el proceso de abliteracion elimina el rechazo interno, por lo que no filtra contenido por politica de seguridad del modelo original.
- La cuantizacion no anade ni elimina capacidades funcionales, pero puede degradar ligeramente la calidad de salida respecto al BF16 original.

## Casos de uso

- Despliegue de un modelo de 27B en hardware Intel XPU con vLLM: la cuantizacion W4A16 y las escalas FP8 de KV-cache estan disenadas para este entorno, reduciendo el consumo de memoria y permitiendo servir el modelo en aceleradores XPU.
- Inferencia de bajo coste en GPUs con 16-24 GB de VRAM: con pesos INT4, el modelo ocupa aproximadamente 13.5 GB, lo que permite ejecutarlo en tarjetas como RTX 4090 o A10G si el backend soporta el esquema compressed-tensors.
- Prototipado rapido de asistentes conversacionales sin filtros de contenido: util para investigacion en alineacion y seguridad, donde se necesita estudiar el comportamiento del modelo sin restricciones de rechazo.
- Generacion de codigo y autocompletado en entornos de desarrollo: el modelo fuente tiene capacidades de codigo y tool calling, y la cuantizacion permite integrarlo en pipelines de CI/CD con recursos limitados.
- Experimentacion con arquitecturas hibridas de atencion lineal: este modelo es un ejemplo practico de Qwen3.8 con DeltaNet, util para evaluar el rendimiento de dicha arquitectura en tareas de generacion de texto.
- Evaluacion de tecnicas de cuantizacion: el repositorio documenta el proceso completo de calibracion y exportacion, sirviendo como referencia para reproducir cuantizaciones similares con llm-compressor y AutoRound.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han reportado evaluaciones de perplejidad, paridad de generacion frente al BF16, ni pruebas de carga, latencia o throughput. No se debe asumir ninguna mejora de calidad o velocidad respecto al modelo fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13.5 GB para los pesos INT4 (26.9B parametros × 4 bits / 8), mas el overhead de activaciones, KV-cache FP8 y memoria del runtime. En total, se estima que quepa en una GPU de 24 GB con margen.
- GPU recomendadas: Intel XPU (entorno objetivo y validado), asi como GPUs NVIDIA compatibles con vLLM y el esquema compressed-tensors (A100, H100, RTX 4090, A10G, L40S, etc.). No se ha validado en otros backends.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors` y `--kv-cache-dtype fp8`. Si el backend no soporta FP8 KV-cache, se puede servir con el dtype soportado, aunque no se usarian las escalas calibradas.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AEON-7/Qwen3.8-27B-AEON-Ultimate-Uncensored-BF16 | 26.9B | BF16 (full precision) | No disponible | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-AEON-Ultimate-Uncensored-BF16-W4A16-AutoRound (este modelo) | 26.9B | W4A16 + FP8 KV | No disponible | No disponible | HuggingFace |
| Qwen3.8-27B original (Alibaba) | 27B | BF16 | No disponible | Apache-2.0 | HuggingFace, Cloudflare Workers AI |
| Qwen3.8-27B Uncensored GGUF (comunidad) | 27B | Q4_K_M (~16.8 GB) | No disponible | No disponible | GitHub / Ollama |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer diferencias cuantitativas entre ellas.

## Limitaciones y advertencias

- El modelo es "uncensored": puede generar contenido inexacto, danino, ofensivo o inapropiado. No debe utilizarse como fuente de asesoramiento profesional, legal, medico, financiero ni en contextos de seguridad critica.
- No se han publicado evaluaciones de calidad tras la cuantizacion. La degradacion respecto al BF16 original es posible y no esta cuantificada.
- La cuantizacion solo ha sido validada para Intel XPU con vLLM. Otros backends pueden no soportar el esquema compressed-tensors o las escalas FP8 de KV-cache.
- La licencia no esta declarada en este repositorio. Es responsabilidad del usuario revisar y cumplir la licencia del modelo fuente (Apache-2.0) y de cualquier modelo base upstream antes de usar o redistribuir los pesos.
- El repositorio no incluye evaluacion de sesgos ni de alucinacion. El modelo fuente puede presentar sesgos heredados de su entrenamiento, y la cuantizacion puede amplificar errores en algunos casos.
- No se recomienda el uso en produccion sin una evaluacion previa de calidad, latencia y seguridad adaptada al caso de uso concreto.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/jasonboukheir/Qwen3.8-27B-AEON-Ultimate-Uncensored-BF16-W4A16-AutoRound
- Modelo fuente (AEON-7): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Blog de MindStudio sobre el proceso de abliteracion: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Repositorio GitHub de la version GGUF uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
- Documentacion de Cloudflare Workers AI para Qwen3.8-27B: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Herramienta de cuantizacion (vllm-xpu-nix): https://git.sunnycareboo.com/jasonbk/vllm-xpu-nix
