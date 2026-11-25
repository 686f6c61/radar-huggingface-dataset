# disinfozone/wekwos-120b-bf16

## Resumen

Wekwos-120B es un ajuste fino especializado en protolengua indoeuropea (PIE) reconstruida, construido sobre el backbone de texto del modelo multimodal NVIDIA Nemotron-3.5-Super-VL-120B-A12B. Lo desarrolla el usuario disinfozone y su propósito es generar y razonar en indoeuropeo reconstruido, una lengua sin hablantes nativos que la lingüística histórica reconstruye a partir de cognados de las lenguas indoeuropeas modernas y antiguas. El modelo parte de una arquitectura híbrida NemotronH (`NemotronHForCausalLM`) con 123.611.033.088 parámetros totales y aproximadamente 12.000 millones activos por token, lo que lo sitúa en la categoría de modelos MoE de gran escala con una ventana de contexto declarada de 1M tokens.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco habitual de especialización lingüística extrema sobre un modelo fundacional de NVIDIA, con un pipeline de SFT (LoRA rango 16, alpha 32, all-linear, sobre 47.088 conversaciones PIE) seguido de una ronda de RL con GRPO de 150 pasos orientada a vocabulario raro. Por otro, sirve como referencia práctica para quien quiera desplegar los pesos BF16 sin cuantizar en clústeres CUDA con vLLM o SGLang, o reutilizarlos como base para cuantizaciones posteriores.

El repositorio ocupa 247,2 GB y contiene únicamente el checkpoint de texto fusionado en BF16; la torre de visión del modelo original fue eliminada, aunque se conservan los tensores `mtp.*`. El modelo se entrenó con el modo de razonamiento desactivado (`enable_thinking=False`), un detalle crítico para la inferencia correcta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH (`NemotronHForCausalLM`), híbrida con mezcla de expertos (MoE) |
| Parametros totales | 123.611.033.088 |
| Parametros activos | ~12B (aproximadamente 12.000 millones) |
| Longitud de contexto | 1M tokens (según model card) |
| Tipos de cuantizacion | BF16 (este repo); GGUF Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 en repo aparte; MLX oQ5e (~79 GB) para Apple Silicon |
| Idiomas soportados | `ine` (indoeuropeo reconstruido), `en` (inglés) |
| Licencia | nvidia-nemotron-open-model-license (ver enlace en la model card) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda el backbone `nemotron_h` de NVIDIA Nemotron-3.5-Super-VL-120B-A12B, una arquitectura híbrida con mezcla de expertos en la que solo se activa una fracción de los 123.600 millones de parámetros por token (unos 12.000 millones). El ajuste elimina la torre de visión del modelo multimodal original y conserva los tensores de predicción multi-token (`mtp.*`), lo que permite decodificación especulativa nativa en servidores compatibles. El checkpoint publicado es la fusión completa en BF16, pensada para servir directamente o para servir de base a cuantizadores.

El entrenamiento se realizó en tres fases sobre el corpus PIE del autor. Primero, un SFT con LoRA de rango 16, alpha 32 y cobertura all-linear, entrenado con la herramienta Dimuon sobre 47.088 conversaciones en indoeuropeo reconstruido. Después, una ronda final de RL denominada `rl8-nemotron-vocab`, con LoRA de rango 16 y escala 10,0, centrada en vocabulario raro, seguida de 150 pasos de GRPO (Group Relative Policy Optimization). El autor reporta que esta fase redujo las raíces léxicas objetivo ausentes de 78 a 3. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá del recuento de conversaciones.

## Capacidades

- Generación de texto conversacional en indoeuropeo reconstruido (`ine`) e inglés (`en`).
- Razonamiento lingüístico histórico: manipulación de raíces, cognados y correspondencias fonológicas del PIE.
- Cobertura de vocabulario especializado gracias a la fase de RL sobre léxico raro (reducción de raíces ausentes de 78 a 3).
- Generación multi-turno con ventana de contexto declarada de 1M tokens.
- Decodificación especulativa mediante los tensores `mtp.*` preservados del modelo base.
- Modo de pensamiento desactivado por diseño: el modelo fue entrenado con `enable_thinking=False` y debe servirse con esa configuración.
- Capacidades multimodales (visión): no disponibles en este checkpoint, ya que la torre de visión fue eliminada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación en lingüística histórica: generación y contraste de hipótesis sobre raíces y formas reconstruidas del PIE, con el modelo como asistente que propone cognados y el investigador valida contra el corpus.
- Creación de material didáctico sobre indoeuropeo: el modelo puede redactar explicaciones y ejercicios en `ine` e inglés apoyándose en su vocabulario especializado y en la ventana de contexto larga para incluir tablas de correspondencias fonéticas completas.
- Anotación y expansión de corpus PIE: dado el ajuste específico sobre 47.088 conversaciones y la fase de RL sobre léxico raro, es adecuado para generar variantes de frases y completar paradigmas léxicos en un corpus de entrenamiento.
- Servicio de inferencia en clúster CUDA: los pesos BF16 están pensados para vLLM o SGLang, de modo que un equipo puede desplegar el modelo como endpoint compatible con la API de OpenAI para experimentos internos de generación.
- Base para cuantización downstream: investigadores que necesiten versiones ligeras pueden partir de este checkpoint BF16 y generar sus propias cuantizaciones, ya que el autor publica además GGUFs y una variante MLX.
- Experimentos de alineación con GRPO: el pipeline documentado (SFT LoRA + RL con GRPO sobre vocabulario objetivo) sirve como receta reproducible para especializar modelos grandes en dominios de vocabulario cerrado.
- Evaluación comparativa de modelos especializados: el benchmark held-out `wekwos-bench` permite medir el rendimiento en PIE frente a modelos generalistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la ficha principal (`disinfozone/wekwos-120b`) y a `wekwos.com/model` para los benchmarks completos, pero no incluye cifras en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 247 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda un mínimo de 8 GPU de 80 GB (H100 o A100 80GB) para servir con comodidad.
- GPU recomendadas: H100 80GB, A100 80GB, H200; el modelo no cabe en una sola GPU consumer.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en configuraciones de 48 GB en BF16. Para equipos de una sola GPU conviene usar las cuantizaciones GGUF Q3_K_M o Q4_K_M del repositorio `disinfozone/wekwos-120b-GGUF`, o la variante MLX oQ5e (~79 GB) en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: vLLM y SGLang son los recomendados por el autor para los pesos BF16; llama.cpp u Ollama para los GGUFs; MLX para Apple Silicon.
- Configuración de inferencia: pasar `chat_template_kwargs={"enable_thinking": False}` en vLLM, SGLang o Transformers, ya que el modelo se entrenó con el razonamiento desactivado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wekwos-120B (BF16) | 123,6B | ~12B | 1M | nvidia-nemotron-open-model-license | Hugging Face (BF16, GGUF, MLX) |
| NVIDIA Nemotron-3.5-Super-VL-120B-A12B (base) | ~120B | ~12B | no disponible en esta ficha | nvidia-nemotron-open-model-license | Hugging Face |
| Modelos especializados en PIE de menor tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de alternativas comparables de la misma categoría (ajuste fino especializado en protolengua indoeuropea) en la información proporcionada, por lo que la comparación se limita al modelo base y a la ausencia de rivales directos documentados.

## Limitaciones y advertencias

- Dominio extremadamente restringido: el ajuste está orientado a indoeuropeo reconstruido e inglés; el rendimiento en otras lenguas, incluido el castellano, no está documentado y probablemente sea deficiente.
- Riesgo de alucinación lingüística: al tratarse de una lengua reconstruida sin hablantes nativos, el modelo puede generar formas plausibles pero no aceptadas por la comunidad académica; toda salida debe validarse contra fuentes filológicas.
- Modo de pensamiento desactivado: servir el modelo con `enable_thinking=True` puede degradar la calidad respecto al entrenamiento.
- Sin capacidades de visión: la torre visual fue eliminada del checkpoint, por lo que no debe esperarse comportamiento multimodal pese al origen VL del modelo base.
- Licencia: la `nvidia-nemotron-open-model-license` no es una licencia open source estándar; deben revisarse sus términos antes de cualquier uso comercial.
- Volumen de pesos: 247,2 GB en BF16 exigen infraestructura de clúster; el despliegue en hardware consumer requiere cuantización y aceptar la pérdida de calidad asociada.
- Trazabilidad limitada: el modelo tiene 28 descargas y 0 likes en el momento de la consulta, sin revisión independiente conocida de sus resultados.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/disinfozone/wekwos-120b-bf16
- Modelo principal (MLX oQ5e): https://huggingface.co/disinfozone/wekwos-120b
- GGUFs: https://huggingface.co/disinfozone/wekwos-120b-GGUF
- LoRA SFT y kit de reconstrucción: https://huggingface.co/disinfozone/wekwos-120b-lora
- Corpus de entrenamiento: https://huggingface.co/datasets/disinfozone/wekwos-corpus
- Benchmark held-out: https://github.com/davidtorcivia/wekwos-bench
- Sitio del proyecto: https://wekwos.com/model
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
