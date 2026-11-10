# ryankim17920/mechanistic-sps

## Resumen

`mechanistic-sps` es un repositorio de checkpoints de investigación publicado por Ryan Kim (usuario `ryankim17920`) que acompaña al artículo *Which State Should Prediction Read? A Mechanistic Analysis of State–Prediction Separation* (2026). No es un modelo único, sino una familia de 86 modelos de lenguaje entrenados desde cero (Transformer, SPS, Two-tower y Sequential, entre 50M y 960M parámetros) con el objetivo de estudiar, desde la interpretabilidad mecanicista, cómo se organiza internamente la separación entre el estado recurrente del contexto y la predicción del siguiente token.

La propuesta técnica central es comparar variantes arquitectónicas que difieren en cómo se conectan ambos roles: un Transformer Llama-style con un único flujo, la arquitectura SPS (State–Prediction Separation) de Monea et al. 2026 con dos slots por token que comparten pesos, y variantes de dos torres (Two-tower y Sequential) con pesos separados y distintos mapas de lectura entre niveles de estado. Todos los modelos usan tokenizador GPT-2 BPE, contexto de 4.096 tokens (32.768 en la carpeta `long_context_32k/`) y se entrenaron sobre FineWeb-Edu (`sample-100BT`) con AdamW en 8×H100.

Es relevante ahora porque ofrece artefactos reproducibles (checkpoints, código de modelo autocontenido, loader de una llamada y sumas SHA256) para investigar mecanismos internos y para evaluar empíricamente si separar estado y predicción mejora la calidad del modelado del lenguaje. No está pensado como modelo de producción: carece de API de generación con KV-cache y su orientación es experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Llama-style (RMSNorm, RoPE, SwiGLU); SPS (State–Prediction Separation); Two-tower; Sequential con lectura multinivel |
| Parametros totales | 50M–960M según el run (86 modelos en total) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (32.768 en `long_context_32k/`) |
| Tipos de cuantizacion | no disponible (solo pesos bf16/fp32 en `.pt`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch), más `config.json` por run y `SHA256SUMS` |

## Arquitectura y entrenamiento

Las cuatro familias comparten bloques tipo Llama (RMSNorm, RoPE, SwiGLU) y se diferencian en la disposición de estado y predicción. El Transformer estándar usa un único flujo que hace ambas tareas y emplea un kernel Triton de atención con máscara de documento (`use_triton_full_attention=True`). SPS asigna a cada token dos slots que comparten todos los pesos, un slot de estado y un slot `<predict>`; los slots de predicción ven claves de estado a cualquier distancia y claves de predicción dentro de una ventana de 64 tokens. Two-tower separa un torre de estado y otra de predicción con pesos independientes, donde el bloque de predicción *i* lee el nivel de estado *i* (profundidades alineadas). Sequential usa las mismas dos torres pero cada bloque de predicción lee el estado final (`read_map=final`), y la variante multinivel (`read_map=mix`) lee una mezcla aprendida de todos los niveles de estado inicializada one-hot sobre el nivel final.

El entrenamiento se hizo desde cero sobre FineWeb-Edu (`sample-100BT`), con AdamW y 8×H100 en bf16. Los runs principales de tamaño `s` usan 20B tokens; el repositorio incluye además escaleras de tamaño (`xxs`, `xs`, `m`, `l`), runs de control iso-FLOP, continuaciones de contexto largo a 32K y controles arquitectónicos con divisiones de profundidad. El tokenizador es GPT-2 BPE con vocabulario ampliado a 50.304 (`<|endoftext|>`=50256, `<predict>`=50257). No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Modelado de lenguaje autoregresivo (predicción de siguiente token) sobre texto en inglés.
- Evaluación de pérdida NLL por ventana de 4.096 tokens mediante `val_nll()` y el script `load.py`.
- Estudio de mecanismos internos: separación estado/predicción, mapas de lectura entre niveles, atención con máscara de documento.
- Soporte de contexto largo hasta 32.768 tokens en los checkpoints de `long_context_32k/`.
- Carga programática vía `load_model()` con reconstrucción de clase y config desde `model_args`, con verificación estricta de parámetros faltantes o inesperados.
- Ejecución con kernels Triton (Transformer y SPS) o con `flex_attention` / `sdpa` (Two-tower y Sequential).
- No dispone de API de generación con KV-cache; la pasada forward es `model(idx_BxT, targets_BxT) -> (logits, loss, stats)`.
- No se documentan tool calling, capacidades de agente, visión ni audio.

## Casos de uso

- Investigación en interpretabilidad mecanicista: comparar cómo distintas disposiciones de estado y predicción afectan a las representaciones internas, usando los 86 checkpoints y sus controles de profundidad.
- Reproducción de resultados del artículo: el script `load.py` con `--val-bin val.bin` puntúa un fichero de validación tokenizado en uint16 exactamente como se midieron los números de Val. NLL, lo que permite replicar la tabla del paper.
- Estudios de escalado: la carpeta `scaling/` ofrece una escalera `xxs`/`xs`/`m`/`l` por familia y semillas, adecuada para analizar tendencias de pérdida frente a parámetros y tokens.
- Análisis de contexto largo: los checkpoints de `long_context_32k/` permiten estudiar degradación de NLL y atención con máscara de documento hasta 32.768 tokens.
- Comparación iso-FLOP: los runs de `iso_flop/` permiten contrastar Sequential y SPS con el mismo presupuesto de cómputo, útil para decisiones de diseño arquitectónico.
- Docencia y formación: modelos pequeños (desde 50M) con código autocontenido y loader sencillo sirven para ilustrar atención, RoPE, SwiGLU y separación estado/predicción en cursos de deep learning.
- Validación de infraestructura de kernels: al depender de Triton 3.5.0 y `flex_attention`, el repositorio sirve para probar entornos CUDA/H100 y detectar problemas de caché compartida en red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de pérdida de validación (Val. NLL) para los runs, sin tabla numérica de MMLU, HumanEval, GSM8K ni comparaciones con modelos de referencia.

## Requisitos de hardware

- Entrenamiento y evaluación realizados en H100 con autocast bf16; se requiere CUDA para ejecutar los modelos (solo la construcción del modelo funciona en CPU).
- VRAM estimada: no disponible de forma explícita; para modelos de 50M–960M parámetros en bf16 el peso ronda 0,1–1,9 GB, pero el repo completo ocupa 78,9 GB y la memoria de activaciones con contexto 4.096 y atención flex puede ser considerable.
- GPU recomendadas: H100 (entorno de referencia). Para modelos pequeños es plausible usar RTX 4090 u otras GPU consumer con suficiente VRAM, aunque no se documenta compatibilidad verificada.
- Despliegue: no hay soporte de vLLM, llama.cpp, Ollama ni TGI; el único camino documentado es PyTorch 2.9.0 con Triton 3.5.0 y Python ≥ 3.10.
- Latencia y throughput: no disponibles.
- Advertencia operativa: apuntar `TRITON_CACHE_DIR` y `TORCHINDUCTOR_CACHE_DIR` a disco local; una caché compartida por red devolvió kernels incorrectos (NLL 9,71 frente a 3,11 en el mismo checkpoint).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mechanistic-sps | 50M–960M | 4.096 / 32.768 | Investigación en separación estado–predicción | MIT | Hugging Face, 86 checkpoints |
| SPS (Monea et al. 2026) | no disponible | no disponible | Arquitectura base replicada | no disponible | Referencia bibliográfica |
| Transformer Llama-style (incluido en el repo) | 50M–960M | 4.096 | Línea base de un solo flujo | MIT | Incluido como control |
| Two-tower / Sequential (incluidos en el repo) | 50M–960M | 4.096 | Torres separadas con distintos mapas de lectura | MIT | Incluidos como variantes |

No se dispone de datos de rendimiento publicados que permitan comparar cuantitativamente con modelos de propósito general del mismo tamaño.

## Limitaciones y advertencias

- Modelos de investigación entrenados desde cero sobre FineWeb-Edu; no están alineados con RLHF/DPO ni optimizados para instrucciones.
- Solo inglés; no hay cobertura multilingüe documentada.
- Sin API de generación con KV-cache: la pasada forward requiere logits completos y no está pensada para servir en producción.
- Riesgo de alucinación y sesgos heredados de FineWeb-Edu, sin filtrado ni evaluación de seguridad publicada.
- Dependencia fuerte de CUDA, Triton 3.5.0 y `flex_attention`; los checkpoints antiguos con `attn_backend="auto"` deben mapearse a `flex` mediante `load.py`.
- El Transformer requiere el kernel Triton (`use_triton_full_attention=True`) para reproducir los números del paper; el backend flex por defecto solo se usó en modelos de prueba pequeños y en CPU.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio pesa 78,9 GB, lo que complica su descarga y almacenamiento.
- No hay resultados de benchmarks estándar ni comparaciones con modelos de referencia, lo que limita la evaluación externa de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/ryankim17920/mechanistic-sps
- Checkpoints intermedios y embedding ladders: https://huggingface.co/ryankim17920/mechanistic-sps-extra
- Código: https://github.com/RyanKim17920/mechanistic-sps
- Artículo: arXiv link pendiente de publicación según la model card (no disponible)
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
