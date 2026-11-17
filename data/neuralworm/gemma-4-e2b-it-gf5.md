# neuralworm/gemma-4-E2B-it-gf5

## Resumen

`neuralworm/gemma-4-E2B-it-gf5` es una cuantización experimental del modelo `google/gemma-4-E2B-it` desarrollada por el usuario neuralworm. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetación de los pesos del modelo base de Google en un formato propietario basado en cuerpos de Galois GF(5): cada peso se codifica como una secuencia de dígitos en base 5 con estados {−2, −1, 0, 1, 2}, empaquetados en registros `uint32` (13 dígitos por registro) y con escalares fp16 cada 128 elementos de bloque. El objetivo declarado es reducir el peso en disco y la VRAM necesaria para inferencia manteniendo una calidad aceptable.

El modelo aplica una estrategia híbrida de tres etapas residuales: las proyecciones de atención y las compuertas por capa se mantienen en bf16 bit a bit, mientras que las capas MLP y las proyecciones por capa se empaquetan en GF(5) de tres etapas. La tabla de embeddings por capa (4,7 GB) también se empaqueta y se descomprime fila a fila durante la carga. El resultado es una reducción de 10,25 GB a 6,23 GB en disco (factor 1,64×) y de ~10 GB a ~4,4 GB de VRAM.

El autor es explícito: no es una cuantización sin pérdidas y no está pensada para producción. El propio README indica que para uso productivo debe usarse bf16. El repositorio documenta la medición de un formato de cuantización, no un modelo listo para desplegar. La licencia es la de Gemma, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de `google/gemma-4-E2B-it`); pesos empaquetados en GF(5) con escalares fp16 por bloque de 128 |
| Parametros totales | no disponible (el modelo base es E2B; el repo no declara el recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GF(5) de 3 etapas residuales (7,76 bit efectivos); atención y compuertas en bf16 bit a bit |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados en el repo) |
| Licencia | gemma |
| Formato de pesos | `safetensors` (`gf5_packed.safetensors`, `gf5_rest.safetensors`) + `gf5_manifest.json`; requiere runtime propio (`gf5_runtime.py`, `gf5_gemv.py`, `gf5_gemm.py`) |

## Arquitectura y entrenamiento

El modelo base subyacente es `google/gemma-4-E2B-it`, un transformer de la familia Gemma 4 en su variante E2B. Sobre esa arquitectura, esta reempaquetación no modifica la topología de la red ni realiza entrenamiento adicional: solo transforma la representación numérica de los pesos. Las proyecciones de atención y las compuertas por capa (per-layer gates) se conservan en bf16 bit a bit porque, según el autor, los errores en esas zonas se propagan con demasiada fuerza. Las capas MLP, las proyecciones por capa y la tabla de embeddings por capa se empaquetan en GF(5) con tres etapas residuales.

El esquema de empaquetado usa registros de 32 bits que contienen 13 dígitos en base 5 (LSB primero), con un escalar fp16 por cada bloque de 128 elementos y por fila de salida; los dígitos de relleno se codifican como estado cero. La descompresión de la tabla de embeddings se hace fila a fila durante la carga para no materializar la tabla completa en memoria. El autor documenta una curva de compromiso entre número de etapas residuales y calidad: 1 etapa (2,59 bit, rel-L2 0,316) resulta inutilizable; 2 etapas (5,17 bit, rel-L2 0,114) queda limitada; 3 etapas (7,76 bit, rel-L2 0,045) es la configuración publicada. Incluso con 4 etapas (rel-L2 0,018) los artefactos de generación persisten, lo que el autor atribuye a la sensibilidad del propio modelo y no al número de etapas.

La inferencia requiere kernels propios en Triton: un kernel GEMV para decodificación token a token y un kernel GEMM para prefill. Existe una variable de entorno (`PX_GF5_NO_KERNEL=1`) que fuerza una ruta de descompresión lenta (~40× más lenta) pero numéricamente idéntica, útil para depuración. No hay soporte para `AutoModel.from_pretrained` estándar: la runtime sustituye los módulos lineales y de embedding por versiones empaquetadas.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base `gemma-4-E2B-it`, aunque degradadas por la cuantización (ver limitaciones).
- Generación de código: el ejemplo del README muestra generación de funciones Python, con artefactos visibles en modo greedy.
- Capacidades multimodales: el repositorio incluye los tensores de visión y audio del modelo base en bf16 bit a bit (`gf5_rest.safetensors`), por lo que la arquitectura multimodal se conserva, aunque no se documenta su calidad tras la cuantización.
- Tool calling / function calling: no disponible explícitamente en la información del repo; se asume heredado del modelo base.
- Razonamiento multi-paso y agentes: no disponible explícitamente; depende del modelo base.
- Capacidades multilingües: no declaradas en el repo; dependen del modelo base.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación de formatos de cuantización: el repositorio está pensado como banco de pruebas para medir el impacto de la cuantización GF(5) en la calidad de las logits (coseno, top-1, top-50 overlap, KL) frente a bf16. Adecuado para quienes estudian esquemas de compresión no convencionales.
- Despliegue en hardware con VRAM muy limitada: con ~4,4 GB de VRAM en carga y generación, cabe en GPUs de gama media-baja (el autor lo probó en una RTX 2060 de 12 GB). Útil para prototipos o demos donde el espacio es el factor limitante y la calidad no es crítica.
- Docencia y divulgación: sirve para ilustrar cómo se comporta un modelo cuando se cuantiza agresivamente, mostrando artefactos concretos (palabras fusionadas, repeticiones) frente a la versión bf16.
- Pruebas de kernels Triton: los kernels GEMV y GEMM incluidos pueden reutilizarse como referencia para implementar operaciones de matvec y GEMM sobre formatos empaquetados no estándar.
- Comparación de rutas de ejecución: la variable `PX_GF5_NO_KERNEL=1` permite validar la corrección numérica de los kernels frente a la ruta de descompresión lenta, útil en pipelines de test.
- Evaluación de robustez de modelos multimodales: al conservar los torres de visión y audio en bf16, permite estudiar si la degradación en el path de lenguaje afecta a tareas multimodales.

## Benchmarks y rendimiento

El autor publica métricas de paridad de logits frente a bf16 (3 prompts, última posición), no benchmarks estándar (MMLU, HumanEval, GSM8K):

| Metrica | Valor |
|---|---|
| Coseno (logits) | 0,997 / 0,997 / 0,999 |
| Top-1 | 3/3 |
| Top-50 overlap | 0,42 / 0,28 / 0,58 |
| KL (nats) | 0,85 / 0,00 / 0,00 |
| Rel-L2 de pesos (path de lenguaje) | 0,045 |

Rendimiento medido en RTX 2060 (12 GB), greedy:

| Metrica | bf16 | GF(5) |
|---|---|---|
| Peso en disco | 10,25 GB | 6,23 GB (1,64×) |
| VRAM (carga + generación) | ~10 GB | ~4,4 GB |
| Decode | ~18 tok/s | ~5 tok/s |
| Prefill | ~1000 tok/s | ~150 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~4,4 GB para carga y generación según el autor; ~10 GB en bf16.
- GPU probada: RTX 2060 (12 GB). Los kernels son Triton + CUDA, por lo que se requiere GPU NVIDIA.
- Cabe en GPUs de consumo con al menos ~5 GB de VRAM libre; no se documentan pruebas en otras GPUs.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; requiere la runtime propia del repositorio (`gf5_runtime.py`) con `torch`, `transformers`, `safetensors` y `triton`.
- Latencia y throughput: decode ~5 tok/s y prefill ~150 tok/s en RTX 2060; el prefill es ~6× más lento que bf16 (tensor cores infrautilizados con K=16, ~20 % de ocupación). La ruta sin kernel es ~40× más lenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `neuralworm/gemma-4-E2B-it-gf5` | no disponible (base E2B) | no disponible | GF(5) empaquetado + runtime propio | gemma | Experimental, artefactos en greedy, ~4,4 GB VRAM |
| `google/gemma-4-E2B-it` (bf16) | no disponible (E2B) | no disponible | safetensors bf16 | gemma | Modelo base de referencia, ~10 GB VRAM, calidad completa |
| Cuantizaciones estándar del mismo base (GGUF/AWQ/GPTQ) | no disponible | no disponible | GGUF / safetensors | gemma | No se dispone de datos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es una cuantización sin pérdidas: el autor lo declara explícitamente y desaconseja su uso en producción; para ello debe usarse bf16.
- Artefactos visibles en generación greedy: palabras fusionadas, repeticiones ocasionales y formato degradado (el ejemplo del README muestra una función Python mal formada).
- El top-50 overlap es bajo (0,28–0,58), lo que indica divergencia en la distribución de tokens aunque el top-1 coincida.
- Sensibilidad del modelo: incluso con 4 etapas residuales (rel-L2 0,018) persisten los artefactos, según el autor.
- Solo probado en una RTX 2060 (12 GB) con kernels Triton + CUDA; no hay validación en otras GPUs ni en CPU.
- No es compatible con `AutoModel.from_pretrained` ni con runtimes estándar (vLLM, llama.cpp, Ollama, TGI); requiere la runtime del repositorio.
- Prefill ~6× más lento que bf16 por infrautilización de tensor cores.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los términos de `google/gemma-4-E2B-it`; conviene revisarlos antes de cualquier despliegue.
- Sesgos y alucinaciones: no documentados en el repo; se heredan del modelo base y pueden amplificarse por la cuantización.
- Idiomas soportados: no declarados; dependen del modelo base.
- Repositorio con 25 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/neuralworm/gemma-4-E2B-it-gf5
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
