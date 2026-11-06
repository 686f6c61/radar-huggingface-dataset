# jediwattzon/qwen3.5-9b-fisher-chart-graph

## Resumen

`qwen3.5-9b-fisher-chart-graph` es un artefacto de ejecución compilado para Apple Silicon (MLX) construido a partir de `Qwen/Qwen3.5-9B`, en concreto sobre la variante cuantizada a 4 bits `mlx-community/Qwen3.5-9B-MLX-4bit`. Lo publica el usuario `jediwattzon` mediante su framework Fisher Graph Compilation, un proyecto de compresión de modelos basado en información de Fisher y en interpretabilidad mecanicista. No es un modelo nuevo entrenado desde cero, sino un grafo de ejecución que reorganiza y poda selectivamente las capas del modelo base para reducir estado en memoria y cómputo por token.

El modelo base Qwen3.5-9B emplea una arquitectura híbrida: 24 bloques recurrentes Gated DeltaNet, 8 bloques de atención completa con compuertas y 32 MLP SwiGLU. El artefacto compila las tres familias de bloques en orden causal aplicando una métrica de vitalidad Pullback-Fisher (Ω_l = E[y_l^T F_l y_l]) que guía la asignación de rango en los portadores recurrentes, la selección de neuronas en los MLP interiores y la compresión de la fibra de valor en la atención.

La relevancia de este artefacto es fundamentalmente práctica y experimental: demuestra que es posible reducir el estado vivo en decodificación un 45 % (de 53,2 MiB a 29,2 MiB) y el cómputo realizado por token entre un 8 % y un 12 % (de 8,01 G-MAC a 7,06–7,39 G-MAC) manteniendo velocidades de decodificación de 22,9–24,9 tok/s en un Apple M5 con 16 GB de RAM. El repositorio ocupa 14,4 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 bloques Gated DeltaNet recurrentes + 8 bloques de atención completa con compuertas + 32 MLP SwiGLU; grafo compilado MLX con supernodos de transporte de carta y enrutamiento dinámico por energía libre |
| Parametros totales | 9B (modelo base Qwen3.5-9B); el artefacto no declara un recuento de parámetros propio tras la compresión |
| Parametros activos | no disponible (no es un MoE, pero aplica salto dinámico de capas por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base de 4 bits (MLX 4-bit); pesos `gate_weight` y `up_weight` recortados bit-exactamente en 4 bits; `down_weight` reajustado mediante ridge dual anclado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (artefacto compilado `fisher-graph`); pesos base derivados de safetensors MLX 4-bit |

## Arquitectura y entrenamiento

El artefacto no incluye entrenamiento propio: parte de `Qwen/Qwen3.5-9B` y de su versión MLX 4-bit, y aplica una recompilación estructural guiada por información de Fisher. La primera familia de bloques, los 24 Gated DeltaNet recurrentes, se procesa con un water-filling KKT sobre la dispersión de vitalidad DeltaNet (555×), que asigna rangos r variables por capa: r = 128 exacto en las capas 0 y 1; r = 96 en las capas 2, 4, 6 y 10; r = 64 en las capas 5, 8, 9, 13, 14, 16, 17, 18, 20 y 22; y r = 32 en las capas 12, 21, 24, 25, 26, 28, 29 y 30. Cada grupo de cabezas proyecta queries y keys sobre una base ortonormal de pullback de Fisher U_h ∈ R^{128×r_l} que conmuta con la recurrencia exacta del estado Gated DeltaNet S_t ∈ R^{B×32×128×r_l}, y el kernel Metal SIMD fusionado se instancia según Dk ∈ {32, 64, 96, 128}.

La segunda familia aplica un cuello de botella Pullback-Fisher sobre los MLP interiores (L7–L17), puntuando los 12.288 neuronas intermedias por capa con la importancia I_{l,j} = E[(SiLU(g_{l,j}) u_{l,j})^2] · (W_down,l,:,j^T diag(F_mlp,l) W_down,l,:,j). Se recortan filas de `gate_weight` y `up_weight` de forma bit-exacta (sin pérdida de recuantización) y se reajusta `down_weight` con ridge dual anclado en torno a las columnas conservadas W_0: k = 7168 (−42 %) en las capas 12, 13 y 14; k = 8192 (−33 %) en 11 y 15; k = 9216 (−25 %) en 9, 16 y 17; k = 10240 (−17 %) en 10; y k = 11264 (−8 %) en 7 y 8. La tercera familia comprime la fibra de contexto de 256 dimensiones de cada una de las 16 cabezas de query a r_v = 128 en L11 y L15, reduciendo `o_proj` a [4096, 2048] y añadiendo cuatro generadores de carta residuales deflactados. Por último, las capas L12, L13, L16, L17 y L21 incorporan supernodos de transporte de carta con compuerta dinámica de energía libre de Boltzmann: si F_l(n_t) ≤ τ_l (en cuenca), se ejecuta el supernodo de 2,6 M-MAC; si F_l(n_t) > τ_l (fuera de cuenca), se ejecuta la capa completa.

## Capacidades

- Generación de texto autoregresiva con decodificación por token sobre grafo compilado MLX.
- Razonamiento y explicación técnica: el artefacto reporta régimen de energía libre media en explicaciones técnicas (57 % de saltos de carta).
- Generación de código: régimen de energía libre alta (solo 20 % de saltos de carta), lo que indica que el modelo activa más capas completas en código Python.
- Prosa enciclopédica: régimen de energía libre baja (81 % de saltos de carta), con el mayor ahorro de cómputo.
- Preguntas factuales cortas: régimen de energía libre baja-media (23 % de saltos de carta).
- Capacidad de inspección interna mediante el comando `/xray` de la TUI, orientada a interpretabilidad mecanicista.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Vision, audio o thinking mode: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon con memoria limitada: el artefacto reduce el estado vivo en decodificación a 96 tokens de 53,2 MiB a 29,2 MiB, lo que permite ejecutar un modelo de 9B en equipos con 16 GB de RAM unificada manteniendo 22,9–24,9 tok/s de decodificación.
- Generación de documentación técnica y explicaciones: con un 57 % de saltos de carta y 24,0 tok/s de decodificación, el modelo resulta adecuado para producir explicaciones largas donde el coste por token importa.
- Procesado de corpus enciclopédicos o prosa larga: el régimen de WikiText activa el 81 % de saltos de carta y reduce el cómputo a ~7,06 G-MAC por token (frente a 8,01 G-MAC del base exacto), lo que lo hace eficiente en tareas de resumen y reescritura de texto plano.
- Asistencia de código en local: en generación de código Python el modelo solo salta el 20 % de las capas, ejecutando la mayor parte del grafo completo; es el escenario donde más se aproxima al comportamiento del modelo base, con 23,7 tok/s.
- Investigación en interpretabilidad mecanicista: la TUI incluye `/xray` y el artefacto expone estructuras como `chart_centers`, `chart_bases`, `local_generator_encoders` y `chart_mode_decoders`, lo que permite analizar qué capas se activan por token y por régimen de prompt.
- Experimentación con compresión guiada por información de Fisher: el repositorio y el framework permiten reproducir la asignación de rangos por capa y comparar el impacto de distintas políticas de water-filling KKT.
- Despliegue de prototipos de chat en estaciones de trabajo Mac: la CLI `fisher-graph-qwen3-mlx chat` con streaming y reporte en vivo de tok/s y G-MAC/tok facilita la evaluación rápida de prompts sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de velocidad, cómputo y memoria en Apple M5 con 16 GB de RAM y `MLX_ENABLE_TF32=0`:

| Runtime / build | Pesos en disco | Estado vivo a 96 tok | Prefill | Decodificación | MAC realizados / tok |
|---|---:|---:|---:|---:|---:|
| Base `Qwen3.5-9B-MLX-4bit` (exacto) | 4,69 GiB | 53,2 MiB (48,0 MiB portador) | 166,7 tok/s | 19,3 tok/s (21–22 en `mlx_lm`) | 8,01 G/tok |
| Play 2 + KKT Bottleneck-SwiGLU + Chart-Attn | 4,45 GiB | 29,2 MiB (24,0 MiB portador) | 210,3 tok/s | 25,3 tok/s | 7,51 G/tok |
| Full-Stack Dynamic (`qwen3.5-9b-fisher-chart-graph`) | 4,47 GiB | 29,2 MiB (−45 %) | 168–212 tok/s | 22,9–24,9 tok/s | 7,06–7,39 G/tok |

| Régimen de prompt | Prefill | Decodificación | Salto de carta dinámico | MAC / tok (vs 8,01 G exacto) |
|---|---:|---:|---:|---:|
| Prosa enciclopédica (WikiText) | 167,8 tok/s | 24,9 tok/s | 81 % | ~7,06 G/tok (−950M) |
| Explicación técnica (Chat) | 181,7 tok/s | 24,0 tok/s | 57 % | ~7,19 G/tok (−820M) |
| Generación de código Python (Chat) | 173,0 tok/s | 23,7 tok/s | 20 % | ~7,39 G/tok (−620M) |
| Preguntas factuales cortas (Chat) | 212,1 tok/s | 22,9 tok/s | 23 % | ~7,38 G/tok (−630M) |

## Requisitos de hardware

- VRAM/RAM unificada: el artefacto pesa 4,47 GiB en disco; el estado vivo en decodificación a 96 tokens es de 29,2 MiB (24,0 MiB de portador DeltaNet más conv y KV). Se midió en un Apple M5 con 16 GB de RAM unificada, por lo que ese es el mínimo práctico documentado.
- GPU recomendadas: Apple Silicon (M5 probado). No se documenta soporte para A100, H100 ni RTX 4090, dado que el runtime es MLX y los kernels son Metal SIMD fusionados.
- ¿Cabe en GPU de consumo? El artefacto está diseñado para Apple Silicon con memoria unificada; no hay datos de ejecución en GPUs NVIDIA de consumo.
- Opciones de despliegue: `fisher-graph-qwen3-mlx chat` (TUI ANSI con streaming, tok/s y G-MAC/tok en vivo, comandos `/xray` y `/mute`) y API Python mediante `MLXQwen3.load` con métodos `prefill` y `decode`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 167,8–212,1 tok/s y decodificación de 22,9–24,9 tok/s según régimen de prompt, medidos en M5 con 16 GB y `MLX_ENABLE_TF32=0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Estado vivo en decodificación | Decodificación medida |
|---|---|---|---|---|---|---|
| `qwen3.5-9b-fisher-chart-graph` | 9B (base) | no disponible | Apache 2.0 | MLX compilado | 29,2 MiB a 96 tok | 22,9–24,9 tok/s (M5) |
| `mlx-community/Qwen3.5-9B-MLX-4bit` | 9B | no disponible | Apache 2.0 (heredada) | MLX 4-bit | 53,2 MiB a 96 tok | 19,3 tok/s (21–22 en `mlx_lm`) |
| `Qwen/Qwen3.5-9B` | 9B | no disponible | Apache 2.0 | safetensors | no disponible | no disponible |

La comparación relevante es contra el propio modelo base en sus dos formatos: el artefacto reduce el estado vivo un 45 % y el cómputo por token entre un 8 % y un 12 %, a costa de una ligera pérdida de velocidad frente a la variante intermedia sin enrutamiento dinámico (25,3 tok/s frente a 22,9–24,9 tok/s). No se dispone de datos de calidad comparada con otros modelos de 9B de la misma categoría.

## Limitaciones y advertencias

- No hay benchmarks de calidad publicados: no se puede afirmar que la compresión preserve la calidad del modelo base en MMLU, HumanEval, GSM8K ni en evaluaciones humanas.
- El artefacto depende de un framework externo (`fisher-compilation`) y de kernels Metal personalizados; no es un checkpoint estándar cargable con transformers, vLLM o llama.cpp.
- Requiere Apple Silicon y MLX; no hay soporte documentado para GPUs NVIDIA, AMD ni aceleradores TPU.
- El enrutamiento dinámico por energía libre introduce comportamiento dependiente del prompt: la misma consulta puede activar distintos conjuntos de capas, lo que complica la reproducibilidad exacta y el análisis de errores.
- El estado vivo depende de la longitud de contexto: los 29,2 MiB medidos corresponden a 96 tokens; a contextos mayores el coste de KV y portador crecerá, aunque no se documenta la curva.
- Riesgo de alucinación: no evaluado en la información proporcionada; al derivar de Qwen3.5-9B hereda los sesgos y limitaciones del modelo base, que tampoco se detallan.
- Idiomas soportados: no declarados; la model card no incluye lista de lenguas.
- Licencia Apache 2.0 permite uso comercial, pero el framework de compilación y los kernels Metal pueden tener condiciones propias no detalladas en la información disponible.
- Repositorio sin descargas ni valoraciones: no hay evidencia de uso en producción ni de validación por terceros.
- El tamaño del repo (14,4 GB) es notablemente superior al de los pesos en disco reportados (4,47 GiB), lo que sugiere artefactos auxiliares o duplicación de formatos no explicada en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jediwattzon/qwen3.5-9b-fisher-chart-graph
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Base cuantizada MLX 4-bit: https://huggingface.co/mlx-community/Qwen3.5-9B-MLX-4bit
- Framework Fisher Graph Compilation: https://github.com/JediWattson/fisher-compilation
