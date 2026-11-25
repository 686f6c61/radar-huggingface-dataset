# alesha-pro/Ling-3.2-air-W4A16

## Resumen

Ling-3.2-air-W4A16 es una cuantización INT4 del modelo multimodal Ling-3.2-air desarrollado por inclusionAI (Ant Group). Se trata de un modelo de mezcla de expertos (MoE) de 124B parámetros totales con 5.5B parámetros activos por token, capaz de procesar texto e imágenes. Esta versión cuantizada, publicada por el usuario alesha-pro, reduce el checkpoint original de 120.4 GiB en FP8 a 72.5 GiB, permitiendo su despliegue completo en VRAM en 4 GPUs de 24 GB como las RTX 3090.

La relevancia de esta cuantización radica en que el release oficial solo estaba disponible en FP8, formato que las GPUs Ampere y Ada de consumo no pueden ejecutar en cómputo. Al cuantizar únicamente los expertos enrutados a INT4 simétrico con group_size=32, se preservan en BF16/F32 los subsistemas sensibles (encoder de visión, atención lineal KDA, Gated MLA, routers, expertos compartidos y embeddings), manteniendo la calidad del modelo original con una huella de memoria notablemente menor.

El modelo conserva la ventana de contexto nativa de 262.144 tokens, soporta razonamiento, tool calling, visión (OCR) y decodificación especulativa mediante la capa MTP incluida en el checkpoint. Está publicado bajo licencia MIT, lo que facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BailingMoeV3VL: MoE multimodal con 35 capas de atención lineal KDA + 7 capas Gated MLA, 512 expertos enrutados (top-8) + 1 capa NextN/MTP |
| Parametros totales | 127.920.654.544 (124B según model card; 127.9B incluyendo MTP) |
| Parametros activos | 5.5B por token (más 3.07B de la capa MTP) |
| Longitud de contexto | 262.144 tokens nativos (max_position_embeddings=262144, sin YaRN) |
| Tipos de cuantizacion | W4A16 INT4 simétrico, group_size=32, clipping MSE-óptimo por grupo (compressed-tensors pack-quantized); resto en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con Marlin W4A16 |

## Arquitectura y entrenamiento

Ling-3.2-air emplea una arquitectura MoE multimodal denominada BailingMoeV3VL. Consta de 42 capas: 35 utilizan atención lineal KDA (de memoria constante) y 7 usan Gated MLA con latente comprimida, lo que reduce drásticamente el coste del KV cache. El modelo tiene 512 expertos enrutados con activación top-8, más expertos compartidos y routers. Incluye una capa NextN/MTP (Multi-Token Prediction) de 3.07B parámetros que actúa como draft para decodificación especulativa.

Esta cuantización concreta no modifica el entrenamiento del modelo base: solo cuantiza los expertos enrutados (62.976 matrices, el 96,8% de los parámetros) a INT4, incluyendo los de la capa MTP. El resto de pesos FP8 del release oficial se deconvierten a BF16 (valor FP8 × escala de bloque), lo que resulta sin pérdida respecto al FP8 salvo por el redondeo a BF16. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento accesible mediante el parser `ling3`.
- Procesamiento de imágenes (image-text-to-text), incluyendo OCR verificado en la model card.
- Tool calling / function calling mediante el parser `ling3`.
- Decodificación especulativa con la capa MTP integrada (algoritmo NEXTN), con 2,2–2,6 tokens aceptados por paso en texto y 3,3–3,4 en salida tipo OCR.
- Capacidades de agente y razonamiento multi-paso.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 124B en hardware de consumo: con 4× RTX 3090 (96 GB) se puede servir el modelo completo en VRAM con visión, razonamiento y tool calling activos, algo imposible con el checkpoint FP8 oficial.
- Procesamiento de documentos largos con OCR: la ventana de 262K tokens y el encoder de visión permiten ingerir documentos extensos y extraer texto estructurado en una sola pasada.
- Agentes autónomos con tool calling: el soporte del parser `ling3` y la decodificación especulativa permiten cadenas de llamadas a herramientas con latencia reducida (142,6 tok/s a 1K de contexto).
- Razonamiento matemático y analítico: el rendimiento en GSM8K (97,04%) lo hace adecuado para asistentes de resolución de problemas y verificación de cálculos.
- Atención al cliente multi-turno: la ventana de contexto larga y el bajo coste del KV cache (282.692 tokens BF16 sin MTP en 4× RTX 3090) permiten mantener conversaciones extensas con historial completo.
- Inferencia en entornos con GPUs Ampere/Ada sin soporte FP8: al usar Marlin W4A16, el modelo funciona en sm_86 y arquitecturas posteriores, ampliando el hardware compatible.
- Servicio de inferencia con SGLang: integración verificada con TP=4 y decodificación especulativa, adecuada para despliegues de producción en clústeres pequeños.

## Benchmarks y rendimiento

| Benchmark | Ling-3.2-air-W4A16 | Ling-3.2-air FP8 (publicado) |
|---|---|---|
| GSM8K | 97,04% | 96,97–97,35% |

Rendimiento medido en 4× RTX 3090 (96 GB, PCIe 3.0 ×16, P2P, 300 W/GPU) con SGLang:

| Métrica | Valor |
|---|---|
| Decode a 1K de contexto | 142,6 tok/s |
| Decode a 200K de contexto | 101,5 tok/s |
| Decode a 250K de contexto | 95,8 tok/s |
| Prefill | 4,1–5,3K tok/s |
| Tokens KV BF16 disponibles (sin MTP) | 282.692 |
| Tokens KV BF16 disponibles (con MTP) | 235.401 |

No se han publicado resultados de MMLU, HumanEval u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 72,5 GiB de pesos; mínimo 4× 24 GB (TP=4, 18,65 GiB/GPU de pesos) para el modelo completo en VRAM.
- GPUs verificadas: 4× RTX 3090 (sm_86). Compatible con Ampere, Ada, Hopper y Blackwell gracias a Marlin W4A16 con group_size=32.
- No cabe en una única GPU de consumo; requiere al menos 4 GPUs de 24 GB o configuraciones con mayor VRAM por GPU.
- Despliegue: SGLang (verificado con PR #52593, torch 2.14.1+cu130) con `--speculative-algorithm NEXTN`, `--reasoning-parser ling3` y `--tool-call-parser ling3`. Compatible con transformers y compressed-tensors.
- Latencia y throughput: 142,6 tok/s decode a 1K, 101,5 tok/s a 200K, 95,8 tok/s a 250K; prefill 4,1–5,3K tok/s en la configuración indicada.

## Comparativa con modelos similares

| Modelo | Parámetros totales/activos | Contexto | Cuantización | Licencia | Hardware mínimo |
|---|---|---|---|---|---|
| Ling-3.2-air-W4A16 | 124B / 5.5B | 262.144 | W4A16 INT4 + BF16/F32 | MIT | 4× 24 GB |
| Ling-3.2-air (FP8 oficial) | 124B / 5.5B | 262.144 | FP8 e4m3 block-128 | MIT | Requiere GPUs con cómputo FP8 (Hopper/Ada) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas de fidelidad.
- La cuantización INT4 de los expertos puede introducir degradación menor frente al FP8 original, aunque GSM8K se mantiene en el rango publicado.
- Idiomas soportados no documentados; se desconoce la cobertura multilingüe real.
- Requiere hardware multi-GPU; no es desplegable en una sola GPU de consumo.
- La integración con SGLang depende de un PR específico (#52593); puede requerir compilación manual.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base inclusionAI/Ling-3.2-air.
- El repo tiene solo 26 descargas y 1 like en el momento de la consulta; validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/alesha-pro/Ling-3.2-air-W4A16
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Licencia MIT: https://opensource.org/licenses/MIT
- SGLang PR #52593: https://github.com/sgl-project/sglang/pull/52593
- Autor de la cuantización: https://x.com/superalesha
