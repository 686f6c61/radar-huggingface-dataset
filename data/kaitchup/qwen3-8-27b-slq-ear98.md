# kaitchup/Qwen3.8-27B-SLQ-EAR98

## Resumen

Qwen3.8-27B-SLQ-EAR98 es una versión cuantizada del modelo Qwen/Qwen3.8-27B, publicada por el autor independiente The Kaitchup (kaitchup en Hugging Face). Se trata de un checkpoint comprimido mediante una versión personalizada de SLQ (Statistically-Lossless Quantization), una técnica de cuantización de precisión mixta que asigna bits de forma independiente a cada proyección del decodificador, incluidas cabezas de atención seleccionadas. El objetivo declarado es alcanzar un EAR (Expected Acceptance Rate) superior al 98% respecto al modelo original en BF16, y el valor medido empaquetado es del 98,000775%.

El modelo está pensado para servirse con vLLM y el runtime Humming, y conserva los pesos MTP (multi-token prediction) originales en BF16. El repositorio ocupa 23,7 GB y los pesos safetensors suman 7.495.194.352 parámetros, aunque la denominación comercial "27B" del modelo base no coincide con ese recuento, lo que conviene tener en cuenta al planificar memoria. La licencia es Apache 2.0, igual que la del modelo base.

Su relevancia actual radica en que ofrece una alternativa de despliegue más ligera que el BF16 original (55,6 GB) con una fidelidad estadística declarada superior a la de FP8 oficial (97,7%) y a otras cuantizaciones de 3 y 4 bits (89,4% y 94,3% respectivamente), a costa de un tamaño intermedio de 23,7 GB. Es, por tanto, una opción intermedia entre las cuantizaciones agresivas y el modelo completo para entornos con VRAM limitada pero requisitos de fidelidad altos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con pesos MTP en BF16; cuantizacion de precision mixta por proyeccion |
| Parametros totales | 7.495.194.352 (segun safetensors); el modelo base se denomina comercialmente 27B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun el ejemplo de `--max-model-len` de la model card) |
| Tipos de cuantizacion | SLQ personalizado con precisiones enteras mixtas (INT2–INT8 como fuentes candidatas) y pesos BF16 originales seleccionados; activaciones en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors empaquetados para Humming en vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer de la familia Qwen3.5, y no ha sido reentrenado: es una compresión post-entrenamiento. La técnica SLQ (Statistically-Lossless Quantization) formula la cuantización como un problema de búsqueda que elige la precisión de cada proyección del decodificador de forma individual, incluyendo cabezas de atención concretas, combinando varias fuentes de pesos candidatas. Entre esas fuentes figuran pesos GPTQ generados localmente en INT2–INT8, el checkpoint kaitchup/Qwen3.8-27B-hum-high-MTP-17.7GB cuantizado con AutoRound, el ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ y los pesos BF16 originales.

El resultado es un checkpoint de precisión mixta con pesos enteros de distinto ancho más algunos tensores conservados en BF16 original, con activaciones en BF16. Los pesos MTP (multi-token prediction) del modelo base se mantienen intactos en BF16, lo que preserva la capacidad de decodificación especulativa a nivel de arquitectura, aunque la model card indica que la decodificación especulativa no se incluyó en la validación realizada. La métrica EAR mide el solapamiento entre las distribuciones de probabilidad del siguiente token del modelo BF16 de referencia y del modelo comparado, renormalizadas sobre los diez tokens más probables de la referencia; no equivale a precisión en benchmarks ni a salidas idénticas.

## Capacidades

- Generación de texto conversacional y de un solo turno, con pipeline `text-generation`.
- Razonamiento: la model card menciona un parser de razonamiento (`--reasoning-parser qwen3`) para vLLM, lo que indica soporte de modo de razonamiento o *thinking*.
- Llamada a herramientas y funciones: soporta `--enable-auto-tool-choice` con `--tool-call-parser qwen3_coder`.
- Capacidades multimodales heredadas del modelo base: se conservan los pesos y procesadores de visión originales, aunque la validación realizada excluyó la inferencia de imagen y vídeo (se recomienda `--limit-mm-per-prompt '{"image":0,"video":0}'` en el ejemplo de servicio).
- Contexto largo: hasta 262.144 tokens según la configuración de ejemplo.
- Decodificación especulativa: los pesos MTP se conservan en BF16, pero no se validaron en esta release.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat compatible con OpenAI: el checkpoint se sirve con `vllm serve` y expone `/v1/chat/completions`, lo que permite sustituir una API propietaria por un despliegue self-hosted con contexto de hasta 262.144 tokens.
- Asistentes con razonamiento y herramientas: la combinación de `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder` permite construir agentes que razonan paso a paso y ejecutan llamadas a funciones en flujos multi-paso.
- Procesamiento de documentos largos: la ventana de 262.144 tokens hace viable el análisis de contratos, informes o bases de código extensas en una sola pasada, con un peso en disco de 23,7 GB frente a los 55,6 GB del BF16.
- Despliegue en hardware de gama profesional con VRAM ajustada: al ocupar menos de la mitad que el BF16 y mantener un EAR del 98%, es adecuado para entornos con una sola GPU de 48–80 GB donde el modelo completo no cabría con KV cache suficiente.
- Evaluación comparativa de cuantizaciones: el repositorio publica una tabla de EAR frente a FP8 oficial, GSQ 3-bit, hum-high y GGUF UD-Q4_K_XL, lo que lo convierte en un punto de referencia para medir el compromiso tamaño/fidelidad en pipelines de investigación.
- Generación de código asistida: el parser de tool calling `qwen3_coder` sugiere un uso orientado a tareas de programación con invocación de herramientas, integrable en asistentes de IDE o pipelines de CI/CD.
- Fine-tuning o destilación sobre pesos comprimidos: al estar en safetensors y licencia Apache 2.0, puede servir como base para experimentos que requieran menos memoria que el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo proporciona la métrica EAR (Expected Acceptance Rate) frente al BF16 de referencia:

| Modelo | EAR | Tamano de pesos (GB) | Ejecucion medida |
|---|---:|---:|---|
| Original BF16 | 100,000000% | 55,563 | Referencia BF16 original |
| FP8 oficial | 97,705903% | 30,867 | Pesos y activaciones FP8 nativos |
| FP8 oficial (solo pesos) | 98,101249% | 30,867 | Pesos dequantizados, ejecucion BF16 |
| GSQ 3-bit | 89,425738% | 11,828 | Pesos objetivo dequantizados, ejecucion BF16 |
| Kaitchup hum-high (17,7 GB) | 94,335032% | 17,695 | Pesos objetivo dequantizados, ejecucion BF16 |
| Unsloth UD-Q4_K_XL GGUF | 97,444147% | 17,559 | Pesos GGUF remapeados a BF16, Transformers |
| SLQ EAR>98 (este modelo) | 98,000775% | 23,732 | vLLM / Humming empaquetado |
| SLQ EAR98.5 | 98,502656% | 25,609 | vLLM / Humming empaquetado |
| SLQ EAR99 | 99,002514% | 30,518 | vLLM / Humming empaquetado |

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 23,732 GB en disco; la memoria de servicio debe sumar buffers del runtime y KV cache. Con contexto de 262.144 tokens, la KV cache puede ser considerable y no se ha publicado una cifra concreta.
- GPU validadas: RTX PRO 6000 Blackwell, con vLLM 0.31.0 y humming-kernels 0.1.16.
- GPU recomendadas: no se especifican otras; por tamaño de pesos, encaja en GPUs profesionales de 48 GB o más (A6000, L40S, RTX PRO 6000) y en A100/H100 de 80 GB con margen para KV cache. No cabe en GPUs de consumo de 24 GB sin reducir contexto o recurrir a otras cuantizaciones.
- Opciones de despliegue: vLLM con soporte Humming (`--quantization humming`). No se mencionan llama.cpp, Ollama ni TGI; el formato empaquetado es específico de Humming.
- Latencia y throughput: no disponibles. La model card no publica cifras de rendimiento en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | EAR / fidelidad | Licencia | Formato |
|---|---|---|---|---|---|
| SLQ EAR98 (este) | 7.495 M (safetensors) | 262.144 | 98,000775% | Apache 2.0 | safetensors (Humming/vLLM) |
| Qwen3.8-27B BF16 | no disponible | no disponible | 100% (referencia) | Apache 2.0 | safetensors |
| Qwen3.8-27B-FP8 | no disponible | no disponible | 97,705903% | Apache 2.0 | FP8 |
| ISTA-DASLab 3Bit-GSQ | no disponible | no disponible | 89,425738% | no disponible | safetensors |
| Unsloth UD-Q4_K_XL GGUF | no disponible | no disponible | 97,444147% | no disponible | GGUF |

La comparación se limita a las variantes del mismo modelo base publicadas en la model card; no se dispone de datos de benchmarks de tareas que permitan comparar con modelos de otros autores.

## Limitaciones y advertencias

- El EAR mide solapamiento de probabilidades sobre los diez tokens más probables de la referencia; no garantiza equivalencia estadística en tareas downstream, que la model card declara no establecida.
- La cuantización SLQ es "statistically lossless" en sentido aproximado: las salidas numéricas no son idénticas al BF16.
- La validación se hizo con una versión concreta de vLLM (0.31.0) y humming-kernels (0.1.16) en una RTX PRO 6000 Blackwell; otros runtimes pueden dar resultados ligeramente distintos.
- La inferencia de imagen y vídeo no se validó, pese a conservarse los pesos de visión; el ejemplo de servicio los desactiva explícitamente.
- La decodificación especulativa con los pesos MTP no se validó.
- El recuento real de parámetros en safetensors (7.495 M) no coincide con la denominación "27B" del modelo base; verificar antes de dimensionar hardware.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de esta release; aplican los del modelo base Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base y de las fuentes candidatas (GPTQ local, AutoRound, GSQ) por si imponen condiciones adicionales.
- El formato empaquetado para Humming limita la portabilidad: no es un GGUF ni un safetensors estándar cargable por Transformers sin el runtime adecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Checkpoint hum-high del autor: https://huggingface.co/kaitchup/Qwen3.8-27B-hum-high-MTP-17.7GB
- Variante SLQ EAR98.5: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98.5
- Variante SLQ EAR99: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR99
- Cuantizacion GSQ 3-bit: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Paper SLQ: https://arxiv.org/abs/2605.02404
- Repositorio SLQ: https://github.com/IST-DASLab/SLQ
- AutoRound: https://github.com/intel/auto-round
- Newsletter del autor: https://kaitchup.substack.com/subscribe
