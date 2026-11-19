# goodmai/LingBot-Video-30B-A3B-PV-MACaQ-4bit-MXFP4-MLX

## Resumen
LingBot-Video-30B-A3B-PV-MACaQ-4bit-MXFP4-MLX es una cuantización de 4 bits del modelo de generación de vídeo a partir de texto LingBot-Video-30B-A3B, desarrollado originalmente por el equipo de Robbyant y adaptado por el usuario goodmai para su ejecución en Apple Silicon mediante la librería MLX. Se trata de un modelo de difusión (DiT) con arquitectura de mezcla de expertos (MoE) dispersa, con 128 expertos enrutados más expertos compartidos y unos 3B de parámetros activos por token, sobre un total nominal de 30B. La versión publicada aquí reduce el transformer de 56,13 GB a 14,98 GB (compresión de 3,75×) mediante cuantización PV-MACaQ MXFP4, lo que permite su despliegue en equipos Mac con memoria unificada de 24 GB o más.

El interés de esta ficha radica en que combina dos tendencias recientes: la generación de vídeo con modelos MoE de gran escala y la optimización agresiva para hardware de consumo Apple. El resultado es un checkpoint que, según el autor, mantiene una fidelidad de calibración razonable (SQNR medio de 19,12 dB en sondas held-out) frente al modelo original en precisión completa. No obstante, la información pública disponible sobre el modelo base es limitada, y muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con MoE dispersa; 128 expertos enrutados + expertos compartidos |
| Parametros totales | 30B nominales (modelo base); 4.753.964.096 en el checkpoint cuantizado (safetensors) |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MXFP4 con PV-MACaQ (per-expert pre-scale); 484 módulos cuantizados (MACaQQuantizedLinear + MACaQSwitchLinear) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), diffusers; repo de 75,2 GB |

## Arquitectura y entrenamiento
El modelo base LingBot-Video-30B-A3B es un Diffusion Transformer (DiT) para generación de vídeo texto-a-vídeo, con una capa MoE que contiene 128 expertos enrutados y expertos compartidos, activando aproximadamente 3B parámetros por token. La variante publicada por goodmai aplica cuantización de 4 bits en formato MXFP4 sobre todos los bancos de expertos 3D (`w1`, `w2`, `w3`) mediante el esquema MACaQSwitchLinear con `per_expert_pre_scale`, así como sobre las capas densas (MACaQQuantizedLinear), sumando 484 módulos cuantizados. La calibración PV (probablemente "post-validation" o "probe-validated", no se detalla en la información disponible) se aplica para reducir el error de salida: el autor reporta una mejora del SQNR medio de 18,61 dB (RTN MXFP4) a 19,12 dB (PV-MACaQ MXFP4), lo que equivale a una reducción del 10,9% en el error cuadrático medio de salida.

No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO) ni sobre innovaciones adicionales como decodificación especulativa o atención lineal. Estos datos deben considerarse no disponibles.

## Capacidades
- Generación de vídeo a partir de texto (text-to-video) mediante pipeline de difusión.
- Arquitectura MoE con enrutamiento disperso que activa ~3B parámetros por token, lo que reduce el coste computacional frente a un modelo denso de 30B.
- Cuantización de 4 bits optimizada para Apple Silicon (MLX), con soporte de streaming de expertos MoE desde SSD para presets de 24 GB.
- Compatibilidad con la librería MLX y el ecosistema diffusers para Apple Silicon.
- No se dispone de información sobre soporte de tool calling, agentes, multilingüismo, modo thinking, visión o audio; estas capacidades deben considerarse no disponibles.

## Casos de uso
- Generación de vídeo de prototipado en Mac: un desarrollador puede generar clips de vídeo a partir de prompts de texto directamente en un Mac con 24 GB o más de memoria unificada, usando MLX y el preset `video-24gb-lingbot-moe`, sin necesidad de GPU dedicada.
- Investigación en cuantización de modelos MoE de vídeo: el checkpoint sirve como referencia para estudiar el impacto de PV-MACaQ MXFP4 en la calidad de generación, comparando con el modelo base en precisión completa.
- Creación de contenido para redes sociales en local: generación de clips cortos a partir de descripciones textuales en un flujo de trabajo offline, aprovechando la compresión 3,75× para reducir requisitos de memoria.
- Evaluación de pipelines diffusers en Apple Silicon: integración del modelo en flujos de trabajo basados en diffusers para probar la interoperabilidad de MLX con el ecosistema de difusión.
- Docencia y demostraciones: ejecución de un modelo de vídeo MoE de 30B en hardware de consumo Apple para ilustrar técnicas de cuantización y streaming de expertos.
- Benchmarking de fidelidad de cuantización: uso del SQNR reportado (19,12 dB) como punto de comparación para nuevas técnicas de cuantización en modelos de vídeo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de compresión y fidelidad de calibración:

| Metrica | Valor |
|---|---|
| Modulos cuantizados | 484 |
| Huella del transformer (original → cuantizado) | 56,13 GB → 14,98 GB (3,75×) |
| SQNR medio en sondas held-out (RTN MXFP4 → PV-MACaQ MXFP4) | 18,61 dB → 19,12 dB |
| Reduccion de MSE de salida | -10,9% |

## Requisitos de hardware
- VRAM/memoria unificada estimada: 24 GB o más en Apple Silicon (preset `video-24gb-lingbot-moe`), con streaming de expertos MoE desde SSD.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada; no se especifican modelos concretos de chip.
- No cabe en GPUs consumer convencionales (NVIDIA/AMD) sin adaptación, ya que el checkpoint está en formato MLX.
- Opciones de despliegue: MLX, diffusers, y la aplicación Basalt para macOS Apple Silicon (enlaces en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-Video-30B-A3B-PV-MACaQ-4bit-MXFP4-MLX | 30B nominales (~3B activos), 4,75B en checkpoint | no disponible | Apache 2.0 | safetensors MLX | Hugging Face |
| robbyant/lingbot-video-moe-30b-a3b (base) | 30B nominales (~3B activos) | no disponible | Apache 2.0 | no disponible | Hugging Face |
| Otros modelos text-to-video MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, modelos text-to-video MoE de otros autores) en términos de rendimiento o benchmarks.

## Limitaciones y advertencias
- La cuantización a 4 bits introduce pérdida de calidad respecto al modelo base; el autor reporta un SQNR de 19,12 dB, lo que implica cierta degradación en la fidelidad de salida.
- El checkpoint está diseñado específicamente para Apple Silicon y MLX; no es directamente utilizable en GPUs NVIDIA/AMD sin conversión.
- El streaming de expertos MoE desde SSD puede introducir latencia adicional y depende de la velocidad del almacenamiento.
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones idiomáticas o de contexto del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que su validación por la comunidad es inexistente.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), lo que impide evaluar su rendimiento objetivo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/goodmai/LingBot-Video-30B-A3B-PV-MACaQ-4bit-MXFP4-MLX
- Modelo base: https://huggingface.co/robbyant/lingbot-video-moe-30b-a3b
- Aplicación Basalt (macOS Apple Silicon): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FLingBot-Video-30B-A3B-PV-MACaQ-4bit-MXFP4-MLX&role=video&lang=en
- Aplicación Basalt (ruso): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FLingBot-Video-30B-A3B-PV-MACaQ-4bit-MXFP4-MLX&role=video&lang=ru
