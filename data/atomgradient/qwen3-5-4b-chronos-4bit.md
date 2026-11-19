# AtomGradient/Qwen3.5-4B-Chronos-4bit

## Resumen

Qwen3.5-4B-Chronos-4bit es un paquete de modelo derivado de Qwen3.5-4B publicado por AtomGradient bajo el marco denominado Chronos, orientado al aprendizaje continuo en dispositivo (on-device continual-learning). Se distribuye en formato MLX de 4 bits y cuenta con 4.205.751.296 parámetros totales, lo que lo sitúa en la categoría de modelos densos de aproximadamente 4B. La licencia declarada es Apache 2.0.

El aspecto diferencial del paquete no es la arquitectura base, sino el mecanismo de protección aplicado: según la model card, las proyecciones de salida de las capas de atención completa (Full-Attention) han sido sometidas a una permutación de filas reversible (`fa_only_row_permutation_v1`) que actúa como bloqueo. La restauración bit-exacta de los pesos originales requiere el denominado Chronos V9 Native Runtime con un lease `ModelUnlockEnvelope v1` vinculado al dispositivo; sin ese kernel de desbloqueo, la inferencia no está soportada oficialmente.

Es relevante ahora porque ejemplifica una tendencia incipiente de empaquetado de modelos con controles de ejecución a nivel de pesos, algo poco habitual en el ecosistema open source. Para desarrolladores e investigadores, plantea preguntas prácticas sobre portabilidad, reproducibilidad y encaje en pipelines estándar (vLLM, llama.cpp, TGI), ya que el paquete está atado a un runtime propietario y a MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con capas de atención completa sujetas a permutación de filas; detalles completos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (paquete distribuido); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo parte de Qwen3.5-4B, un transformer denso de aproximadamente 4B parámetros. Sobre esa base, AtomGradient aplica el marco Chronos de aprendizaje continuo en dispositivo, junto con una transformación de los pesos de salida de las proyecciones de atención completa mediante una permutación de filas reversible (`fa_only_row_permutation_v1`). Según la model card, la restauración autorizada mediante el runtime produce una biyección sin pérdida (0-ULP), es decir, recupera exactamente las proyecciones originales de 4 bits.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento específicas para este paquete. Tampoco se detallan innovaciones de decodificación (especulativa, atención lineal, etc.). El rasgo técnico destacable es el propio mecanismo de bloqueo/desbloqueo de pesos y la política de privacidad en línea: la model card indica `enable_online_pii_abliteration_default = 0`, lo que implica que no se han horneado pesos estáticos de abliteración de PII en el paquete.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` con tag `conversational`.
- Aprendizaje continuo en dispositivo: el paquete está diseñado para el marco Chronos de AtomGradient, orientado a actualización continua local.
- Protección de pesos con restauración bit-exacta: la inferencia autorizada recupera las proyecciones originales sin pérdida (0-ULP).
- Ejecución en Apple Silicon vía MLX: la librería declarada es `mlx`, lo que limita el despliegue a entornos compatibles.
- Capacidades de razonamiento, código, matemáticas, visión, tool calling, agentes o modo thinking: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas no está cumplimentado.

## Casos de uso

- Investigación en aprendizaje continuo en dispositivo: el paquete permite experimentar con el marco Chronos sobre una base Qwen3.5-4B en hardware Apple Silicon, evaluando cómo se comporta la actualización local de pesos con el mecanismo de bloqueo activo.
- Prototipado de asistentes conversacionales locales: al ser un modelo de 4B en 4 bits con pipeline conversacional, encaja en demos de chat ejecutadas íntegramente en un Mac, sin depender de servicios en la nube.
- Estudio de protección de pesos y licenciamiento técnico: útil para analizar mecanismos de control de ejecución basados en permutaciones reversibles y leases vinculados a dispositivo, y su impacto en la portabilidad.
- Evaluación de privacidad en inferencia: con `enable_online_pii_abliteration_default = 0`, sirve para comparar estrategias de abliteración en línea frente a pesos estáticos pre-horneados.
- Pruebas de integración con MLX: validar flujos de carga, cuantización 4-bit y ejecución en el stack MLX de Apple para modelos de la familia Qwen3.5.
- Reproducibilidad de derivados: verificar la restauración bit-exacta de las proyecciones de atención completa y documentar diferencias respecto al modelo upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 2,4 GB en 4 bits, por lo que la inferencia requiere del orden de 2,5-3,5 GB de memoria unificada, más overhead del runtime y del contexto (estimación, no dato oficial).
- GPU recomendadas: no disponibles de forma oficial; el paquete está orientado a MLX, es decir, Apple Silicon (series M1/M2/M3/M4 y superiores).
- Compatibilidad con GPU consumer NVIDIA: no confirmada; el formato MLX no es directamente ejecutable en CUDA sin conversión, y el mecanismo de bloqueo exige el runtime Chronos V9.
- Opciones de despliegue: exclusivamente el Chronos V9 Native Runtime con lease `ModelUnlockEnvelope v1` según el autor; vLLM, llama.cpp, Ollama y TGI no están soportados oficialmente para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3.5-4B-Chronos-4bit | 4,2B | No disponible | MLX 4-bit (safetensors) | Apache 2.0 | Chronos V9 Runtime (MLX) |
| Qwen3.5-4B (upstream) | ~4B | No disponible | safetensors | Según upstream (no confirmado) | Estándar (vLLM, TGI, llama.cpp, MLX) |
| Modelos densos de ~4B en 4 bits (familia Qwen/Llama) | ~4B | Variable | GGUF / MLX / safetensors | Apache 2.0 o similar | Amplio soporte |

La comparación cuantitativa de rendimiento no está disponible. La diferencia principal frente a alternativas de la misma categoría es operativa: este paquete exige un runtime propietario y un lease de dispositivo, mientras que los modelos upstream equivalentes se ejecutan en stacks estándar.

## Limitaciones y advertencias

- Dependencia de runtime propietario: la inferencia sin el Chronos V9 Native Runtime y el lease `ModelUnlockEnvelope v1` no está soportada; esto rompe la portabilidad habitual del ecosistema open source.
- Vinculación a dispositivo: el lease está atado al hardware, lo que complica el despliegue en clústeres, contenedores efímeros o entornos multi-tenant.
- Restricción de plataforma: el formato MLX limita la ejecución a Apple Silicon; no hay soporte CUDA confirmado.
- Idiomas y contexto no documentados: no se puede planificar el soporte multilingüe ni el dimensionado de contexto con la información disponible.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información proporcionada.
- Ausencia de benchmarks: no hay evidencia publicada de calidad, lo que impide validar el impacto del proceso Chronos sobre el rendimiento del modelo base.
- Madurez del paquete: creado y actualizado el 2026-11-19, con 0 descargas y 0 likes; sin validación comunitaria.
- Licencia: Apache 2.0 declarada, pero el uso práctico queda condicionado por los requisitos técnicos del runtime, no solo por la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/AtomGradient/Qwen3.5-4B-Chronos-4bit
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
