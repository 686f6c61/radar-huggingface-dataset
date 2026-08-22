# kingjones777/LFM2.5-8B-A1B-NVFP4

## Resumen

LFM2.5-8B-A1B-NVFP4 es una cuantización 4-bit (NVFP4, W4A4) del modelo MoE LFM2.5-8B-A1B de Liquid AI, publicada por el usuario kingjones777. Esta versión reduce el tamaño del checkpoint de 16,94 GB (bf16) a 4,81 GiB, un factor de 3,5×, manteniendo la arquitectura Mixture-of-Experts original con 8.467 millones de parámetros totales y 1.500 millones activos por paso. Está optimizada para GPUs NVIDIA Blackwell (sm_120a) y ha sido verificada en el chip GB10, ofreciendo una velocidad de decodificación medida de 122,6 tokens por segundo.

La relevancia de este modelo radica en su capacidad para ejecutar tareas de razonamiento, tool calling y agentes con una ventana de contexto de 128K tokens, todo ello en un formato compacto apto para despliegue en dispositivos de borde y en GPUs con soporte FP4. Es la primera construcción NVFP4 de cualquier checkpoint LFM2.5, y la única otra variante FP4 es una versión MXFP4 para Apple MLX, que es un formato y runtime diferentes. El trabajo de cuantización se realizó con llmcompressor, con calibración sobre ultrachat_200k, y se ha verificado que todos los expertos reciben escalas de activación correctas, evitando problemas de subcalibración típicos en MoE.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2MoeForCausalLM (Mixture of Experts, 24 capas: 6 full-attention + 18 conv, 32 expertos, top-k 4) |
| Parametros totales | 8.467.856.832 |
| Parametros activos | 1.5B (por forward pass) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4, 4-bit float, group_size 16, static weights, dynamic activations) |
| Idiomas soportados | No disponible (se presume inglés por el modelo base, pero no se especifica) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, no OSI-approved) |
| Formato de pesos | safetensors (formato nvfp4-pack-quantized) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B es un MoE híbrido de Liquid AI que combina capas de atención completa y capas convolucionales, con 32 expertos y selección top-4 por token. El modelo total tiene 8B parámetros, pero solo 1.5B se activan por token, lo que permite una inferencia eficiente. La cuantización NVFP4 se aplicó mediante llmcompressor oneshot con un QuantizationModifier sobre todos los módulos Lineales, excluyendo lm_head, embeddings, routers y norm. Se calibraron 2.178 lineales, incluyendo todos los expertos (2.112) con la opción moe_calibrate_all_experts=True para garantizar que cada experto reciba tokens de calibración, ya que el top-k 4 de 32 puede dejar expertos sin datos en un enfoque naive. La cuantización utiliza escalas globales para entradas y pesos, con activaciones cuantizadas dinámicamente (local). No se dispone de información detallada sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto con razonamiento de cadena de pensamiento (chain of thought) integrado, según la documentación de Liquid AI.
- Tool calling / function calling: el modelo está optimizado para invocación de herramientas y tareas de agente, con soporte para múltiples pasos de razonamiento.
- Ventana de contexto de 128K tokens, adecuada para documentos largos, conversaciones multi-turno y análisis de grandes bloques de código.
- Capacidades multilingües no documentadas; se presume soporte primario en inglés.
- Inferencia eficiente en hardware de borde gracias a la cuantización FP4 y al tamaño compacto (4.81 GiB).
- Compatible con runtimes SGLang y vLLM con soporte NVFP4 W4A4 en GPUs Blackwell.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: el modelo puede desplegarse en hardware con soporte Blackwell (p. ej., GB10) para ofrecer respuestas rápidas y razonadas en tiempo real, aprovechando sus 128K de contexto para mantener conversaciones largas.
- Automatización de atención al cliente: con su capacidad de tool calling, puede integrarse en sistemas de tickets, consultar bases de conocimiento y realizar acciones (crear pedidos, modificar reservas) mediante llamadas a APIs.
- Agentes de código autónomos: puede planificar y ejecutar tareas de programación multi-paso, llamando a funciones como ejecutar tests, revisar código o generar parches, gracias a su razonamiento y soporte de herramientas.
- Procesamiento de documentos largos: su ventana de 128K tokens permite resumir o extraer información de informes extensos, contratos o código fuente en una sola pasada.
- Chatbots de atención médica o jurídica en dispositivos locales: la cuantización FP4 reduce el consumo de memoria, permitiendo ejecutar el modelo en equipos de gama alta sin necesidad de infraestructura en la nube, con respuestas basadas en razonamiento.
- Sistemas de recomendación conversacional: puede combinar el contexto del usuario con llamadas a APIs de productos para ofrecer recomendaciones personalizadas en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación de Liquid AI menciona que el modelo base tiene "strong AI benchmarks", pero no se proporcionan cifras concretas para esta cuantización. El único dato de rendimiento es el throughput de decodificación medido: 122,6 tokens/s en el GB10, con un TTFT de 0,054 s para 225 tokens de salida.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 4,81 GiB. Con overhead de activaciones y contexto, se recomienda al menos 8 GB de VRAM para inferencia con contexto moderado; para contexto máximo de 128K se necesitará más memoria (no especificada).
- GPU recomendadas: NVIDIA Blackwell con soporte FP4 (sm_120a), como GB10 (usado en la verificación) o B200. No funciona en GPUs anteriores sin soporte FP4 (RTX 30/40 series, A100, etc.).
- No cabe en GPUs consumer típicas (RTX 4090) porque carecen de soporte FP4 nativo, aunque se podría ejecutar con emulación, pero no es el objetivo.
- Opciones de despliegue: SGLang (v0.5.18-cu130 o superior) y vLLM (nightly con soporte Lfm2MoeForCausalLM). Se puede usar también con transformers para cargar los pesos, pero la inferencia eficiente requiere los runtimes mencionados.
- Latencia y throughput: 122,6 t/s en decodificación, TTFT de 0,054 s en un ejemplo medido con el modelo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-NVFP4 (este) | 8.467M | 1.5B | 128K | NVFP4 (W4A4) | lfm1.0 |
| LFM2.5-8B-A1B (base) | 8.467M | 1.5B | 128K | bf16 | lfm1.0 |
| LFM2.5-2.6B-MXFP4 (MLX) | 2.6B | No disponible | No disponible | MXFP4 (W4A4) | lfm1.0 |

La comparativa directa con otros MoE de tamaño similar (por ejemplo, Mixtral 8x7B o DeepSeek-V5-Lite) no está disponible en la información proporcionada. La versión NVFP4 ofrece una reducción de memoria del 71% respecto al modelo base bf16, con un aumento de velocidad de decodificación (122,6 t/s frente a la referencia no cuantizada, no medida aquí).

## Limitaciones y advertencias

- Licencia lfm1.0: no es una licencia de código abierto estándar; puede imponer restricciones de uso comercial y distribución. Revisar los términos de Liquid AI antes de producción.
- Requiere hardware Blackwell con soporte FP4: no es compatible con GPUs anteriores (Ampere, Ada Lovelace, Hopper), lo que limita su despliegue a equipos muy concretos.
- La cuantización NVFP4 puede introducir pérdidas de precisión en tareas numéricas o de razonamiento complejo. No se han publicado benchmarks para cuantificar el impacto.
- No se dispone de información sobre idiomas soportados; probablemente el rendimiento fuera del inglés sea inferior.
- El modelo base tiene riesgo de alucinación y sesgos inherentes a los datos de entrenamiento, que no se han mitigado en esta cuantización.
- La implementación de cuantización es específica del runtime: requiere SGLang o vLLM con soporte NVFP4 W4A4; no se garantiza su funcionamiento en otros frameworks.

## Enlaces

- Repositorio del modelo: https://huggingface.co/kingjones777/LFM2.5-8B-A1B-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de Liquid AI: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Página de modelos de Liquid AI: https://www.liquid.ai/models
