# reaperdoesntknow/TameLM

## Resumen

TameLM es un checkpoint de lenguaje de tipo experimental publicado por el usuario reaperdoesntknow en Hugging Face. Se presenta como un modelo de concepto ("research concept model") que explora una configuración arquitectónica concreta denominada TAMELM, que combina atención enrutada (routed attention), atención de profundidad (depth attention) y una mezcla de expertos (MoE) sin descarte de tokens (dropless). El modelo tiene 1.431.506.840 parámetros totales según los pesos en safetensors y una longitud de secuencia configurada de 8192 tokens.

La relevancia de este artefacto es fundamentalmente investigadora: no es un modelo de producción ni un modelo de propósito general validado. La propia model card advierte explícitamente que no documenta una receta de entrenamiento completa, ni conjuntos de datos, ni informes de evaluación reproducibles, y que los nombres de arquitectura y los campos de configuración describen la implementación, no una capacidad de razonamiento demostrada. No se publican resultados de benchmarks ni comparativas de rendimiento.

Arquitectónicamente es un transformer con 12 capas, dimensión de embedding de 768, 32 cabezas de consulta y 2 cabezas clave/valor (atención con consultas agrupadas), 16 expertos con top-k 2 y dimensión oculta de experto de 1536. Incorpora además un mecanismo de "profundidad" con 256 dimensiones, 8 cabezas y 4 slots, y un módulo `FoldUnfoldReasoning` con 3 pasos de razonamiento. El modelo requiere código personalizado (`modeling_tamelm.py`) y ejecución remota de código, lo que exige revisión previa del código antes de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TAMELM (`tamelm_two_axis`), transformer con atención enrutada, atención de profundidad y MoE dropless |
| Parametros totales | 1.431.506.840 |
| Parametros activos | no disponible (16 expertos, top-k 2; no se publica el desglose de parámetros activos) |
| Longitud de contexto | 8192 tokens (máximo configurado) |
| Tipos de cuantizacion | no disponible (dtype configurado: float32; no se publican cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors (con `config.json`, tokenizer y `modeling_tamelm.py`) |

Otros datos de configuración publicados: 12 capas, dimensión de embedding 768, 32 cabezas de consulta, 2 cabezas clave/valor, 16 expertos, top-k de experto 2, dimensión oculta de experto 1536, modo de profundidad `attention`, dimensión de profundidad 256, 8 cabezas de profundidad, 4 slots de profundidad, backend de atención `flex`, backend de expertos `grouped`, vocabulario de 49152, dtype configurado `float32`, versión de Transformers registrada 5.5.0 y `use_cache: false`. Tamaño del repositorio: 11.5 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer de 12 capas con atención de consultas agrupadas (32 cabezas de consulta frente a 2 cabezas clave/valor), lo que reduce el coste de memoria del KV cache. Sobre esa base se añaden tres mecanismos propios: atención enrutada, atención de profundidad y una mezcla de expertos dropless con 16 expertos y top-k 2. El módulo de profundidad opera con dimensión 256, 8 cabezas y 4 slots, y el módulo `FoldUnfoldReasoning` configura `reasoning_mode="fold_unfold"` con 3 pasos de razonamiento, 2 slots, 4 cabezas, lectura directa, plegado inicial, revisión completa y sesgo de posición relativa; también activa embeddings sinusoidales y 2 bancos de expertos con top-k de banco 2.

La implementación incluye alternativas densas/de referencia y aceleración opcional mediante CUDA FlexAttention y Triton grouped-GEMM, cuya compatibilidad depende del runtime, el hardware y los paquetes instalados. No se documenta la receta de entrenamiento: se desconocen los conjuntos de datos y sus licencias, el preprocesado, el número de tokens, la duración del entrenamiento, el optimizador, el hardware y los criterios de selección de checkpoints. Tampoco se indica si hubo RLHF, DPO u otra fase de alineación. El autor advierte que los ajustes arquitectónicos no constituyen resultados de razonamiento medidos.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM` con código personalizado (`modeling_tamelm.py`).
- Exploración de mecanismos de razonamiento multi-paso a través del módulo `FoldUnfoldReasoning` (3 pasos configurados), si bien no hay evidencia publicada de su eficacia.
- Mezcla de expertos con enrutamiento top-k 2 sobre 16 expertos, orientada a investigación arquitectónica más que a uso productivo.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad validada; solo existe la configuración arquitectónica de plegado/desplegado.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (visión, audio, thinking mode validado): no disponible.

## Casos de uso

- Investigación de arquitecturas MoE: el modelo permite estudiar en la práctica un diseño dropless con 16 expertos y top-k 2, comparando el comportamiento del enrutamiento y el uso de expertos frente a variantes densas incluidas en la implementación.
- Estudio de atención de profundidad y plegado/desplegado: sirve para experimentar con el módulo `FoldUnfoldReasoning` y medir, con evaluaciones propias, si los 3 pasos de razonamiento configurados aportan alguna ventaja en tareas controladas.
- Reproducción de experimentos arquitectónicos: al incluir `config.json`, tokenizer y código de modelado, permite reproducir la configuración publicada y fijar una revisión del repositorio para trazabilidad.
- Pruebas de backend de atención: con backend `flex` y aceleración opcional por Triton grouped-GEMM, es útil para validar la compatibilidad de FlexAttention y kernels agrupados en distintos entornos CUDA.
- Evaluación de seguridad y sesgo en modelos de investigación: al no haber evaluación publicada, puede emplearse como caso de estudio para construir pipelines de evaluación de alucinación, sesgo y memorización antes de cualquier uso aplicado.
- Docencia y formación técnica: como ejemplo de implementación de un transformer con atención enrutada y MoE en Transformers con `auto_map`, útil para explicar código de modelado personalizado y ejecución remota.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirman puntuaciones de benchmark, mejoras comparativas ni garantías de preparación para producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.431.506.840 parámetros en float32 (dtype configurado), los pesos ocupan aproximadamente 5,7 GB; el repositorio completo ocupa 11,5 GB, por lo que el checkpoint puede incluir estados adicionales. En float16 los pesos rondarían los 2,9 GB, pero no se publican cuantizaciones oficiales.
- GPU recomendadas: no disponible. No se documenta hardware validado; la implementación menciona aceleración opcional CUDA FlexAttention y Triton grouped-GEMM, lo que sugiere GPUs NVIDIA compatibles, sin modelo concreto especificado.
- ¿Cabe en GPU consumer? Por tamaño de parámetros, en float16 cabría en GPUs consumer con 8 GB o más; sin embargo, no hay validación publicada de carga y generación, por lo que no puede confirmarse.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y revisión fijada del repositorio. No se publican artefactos GGUF, por lo que llama.cpp u Ollama no están soportados de forma directa; vLLM y TGI no están documentados para esta arquitectura personalizada.
- Latencia y throughput: no disponible. La configuración incluye `use_cache: false`, lo que puede penalizar la generación autoregresiva al no reutilizar el KV cache.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos en la información proporcionada, y la naturaleza de modelo de concepto con arquitectura personalizada dificulta establecer equivalentes directos. Como referencia dimensional, un transformer denso de ~1,4 mil millones de parámetros con contexto de 8192 tokens es comparable en escala a modelos pequeños de propósito general, pero TameLM no ofrece métricas que permitan una comparación rigurosa de rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks, informes de evaluación reproducibles ni métricas de calidad.
- Receta de entrenamiento no documentada: se desconocen datasets, licencias de datos, número de tokens, optimizador y hardware.
- Licencia no declarada: no se puede asumir uso comercial; es necesario confirmar los términos con el propietario del repositorio antes de redistribuir o desplegar.
- Requiere ejecución remota de código (`trust_remote_code=True`) con código personalizado no integrado en Transformers; debe revisarse `modeling_tamelm.py` y fijarse una revisión del repositorio.
- Riesgo de alucinación, sesgo y contenido inseguro inherente a la generación de lenguaje, sin filtros ni alineación documentada.
- Idiomas soportados no declarados, por lo que el comportamiento multilingüe es desconocido.
- `use_cache: false` en la configuración puede degradar la latencia en generación larga.
- Compatibilidad de backends (FlexAttention, Triton grouped-GEMM) dependiente del runtime y del hardware; no hay garantía de inferencia independiente del hardware.
- No es un modelo de producción: la propia model card lo describe como modelo de concepto para investigación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/reaperdoesntknow/TameLM)
- [Archivos del repositorio](https://huggingface.co/reaperdoesntknow/TameLM/tree/main)
- [Configuración publicada (config.json)](https://huggingface.co/reaperdoesntknow/TameLM/blob/main/config.json)
- [Implementación personalizada del modelo (modeling_tamelm.py)](https://huggingface.co/reaperdoesntknow/TameLM/blob/main/modeling_tamelm.py)
- [Avisos de terceros (THIRD_PARTY_NOTICES.txt)](https://huggingface.co/reaperdoesntknow/TameLM/blob/main/THIRD_PARTY_NOTICES.txt)
