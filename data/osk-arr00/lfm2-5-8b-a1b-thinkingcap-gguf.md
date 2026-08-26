# osk-arr00/LFM2.5-8B-A1B-ThinkingCap-GGUF

## Resumen

LFM 2.5 8B ThinkingCap es una variante afinada del modelo LFM2.5-8B-A1B de Liquid AI, desarrollada por osk-arr00. Se trata de un modelo híbrido que combina 36 capas de convoluciones 1D de corta ventana con un backbone MoE de 32 expertos, activando aproximadamente 1.200 millones de parámetros por token sobre un total de 8.470 millones. El modelo ha sido sometido a un proceso de abliteración (eliminación de rechazos), seguido de SFT y DPO para imponer el protocolo ThinkingCap: razonamiento interno denso y conciso, encerrado entre las etiquetas `[Start thinking]` y `[End thinking]`, con una media de 15 a 25 tokens y sin divagaciones.

La relevancia de este modelo radica en su diseño para despliegue en edge AI, con cuantizaciones GGUF que incluyen kernels ROCmFP4 personalizados para arquitectura AMD RDNA 3.5 (gfx1151, Strix Halo). El repositorio también incorpora un drafter especulativo DSpark para decodificación acelerada, y soporta tool calling y razonamiento multi-paso, lo que lo convierte en una opción interesante para aplicaciones agénticas en dispositivos con memoria unificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 36 capas de convoluciones 1D + MoE de 32 expertos |
| Parámetros totales | 8.467.856.832 |
| Parámetros activos | ~1.200 millones por token |
| Longitud de contexto | 128K tokens (base); configurable hasta 256K en este repositorio |
| Tipos de cuantización | Q4_K_M, Q6_K, Q8_0, BF16, APEX (Q4_K_M + Q6_K + Q8_0), ROCmFPX (Q4_0_ROCMFP4 + Q6_K + Q8_0) |
| Idiomas soportados | inglés, español |
| Licencia | lfm1.0 (Liquid AI) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B fue desarrollado por Liquid AI y entrenado con 38 billones de tokens en preentrenamiento, seguido de un post-entrenamiento con RL que elevó la tasa de no-alucinación del 7 % al 63 %. La variante ThinkingCap fue creada por osk-arr00 mediante SFT y DPO sobre el checkpoint abliterado de huihui-ai. La arquitectura combina convoluciones 1D de corta ventana en 36 capas con un backbone MoE de 32 expertos, activando solo un subconjunto de parámetros por token.

El entrenamiento DPO impone el contrato ThinkingCap: el razonamiento interno debe ser denso, sin repeticiones, y encerrado estrictamente entre etiquetas delimitadoras. La abliteración elimina los rechazos del modelo original, lo que aumenta la utilidad pero reduce las salvaguardas de seguridad. El repositorio incluye además kernels ROCmFP4 con arquitectura Wave32 ISA para AMD RDNA 3.5, y un drafter DSpark para decodificación especulativa.

## Capacidades

- Generación de texto en inglés y español con alta fidelidad, sin deriva hacia chino/CJK.
- Razonamiento estructurado: produce bloques de razonamiento interno delimitados por etiquetas, seguidos de respuestas deterministas.
- Tool calling / function calling: soporte integrado para invocación de herramientas.
- Capacidades de agente: razonamiento multi-paso y encadenamiento de llamadas a herramientas.
- Decodificación especulativa mediante el drafter DSpark incluido en el repositorio.
- Compatibilidad multiplataforma: llama.cpp, Vulkan, CPU, CUDA y ROCm HIP (gfx1151).

## Casos de uso

- **Despliegue en APUs AMD Strix Halo**: con cuantos ROCmFPX-APEX de 4,78 GB y soporte nativo para gfx1151, el modelo se ejecuta eficientemente en APUs como el Ryzen AI Max 385, aprovechando la memoria unificada LPDDR5X.
- **Atención al cliente bilingüe**: con 128K tokens de contexto, puede gestionar conversaciones multi-turno en inglés y español manteniendo el historial completo y generando respuestas con razonamiento interno breve.
- **Generación de código con tool calling**: integrable en pipelines de CI/CD para autocompletar código, revisar pull requests o generar documentación, con el drafter DSpark acelerando la decodificación.
- **Asistente de razonamiento matemático y lógico**: el protocolo ThinkingCap fuerza un razonamiento interno denso que mejora la precisión en problemas de matemáticas y lógica, útil en entornos educativos.
- **Servidor de chat multi-usuario**: con batching continuo de hasta 4 slots y contexto global de 256K, puede servir a varios usuarios simultáneamente en un solo dispositivo.
- **Investigación en abliteración y alineación**: sirve como referencia para estudiar el impacto de la eliminación de rechazos y el DPO en la calidad del razonamiento de modelos MoE híbridos.

## Benchmarks y rendimiento

Los benchmarks publicados en el repositorio fueron medidos localmente en un AMD Ryzen AI Max 385 (APU Strix Halo, 64 GB LPDDR5X unificados) con el cuant ROCmFPX-APEX:

| Métrica | Valor |
|---|---|
| Prefill corto (pp512) | 3.061,1 tokens/seg |
| Prefill medio (pp1024) | 3.165,7 tokens/seg |
| Prefill largo (pp4096) | 3.564,4 tokens/seg |
| Prefill profundo (pp16384) | 2.233,8 tokens/seg |
| Decodificación (single-stream) | 115,8 - 148,3 tokens/seg |
| Throughput agregado (4 slots) | 211,8 tokens/seg |

No se han publicado resultados de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K) para esta variante específica. El modelo base LFM2.5-8B-A1B de Liquid AI reporta una tasa de no-alucinación del 63 % tras el post-entrenamiento con RL.

## Requisitos de hardware

- **VRAM estimada**: desde 4,63 GB (APEX Q4_K_M) hasta 16 GB (BF16). El cuant ROCmFPX-APEX ocupa 4,78 GB; el Q8_0 de referencia ocupa 8,40 GB.
- **GPUs recomendadas**: AMD Radeon 8050S / 8060S (Strix Halo, gfx1151) con ROCmFP4; cualquier GPU con soporte Vulkan o CUDA; CPU con suficiente RAM.
- **GPU consumer**: cabe en tarjetas con 6-8 GB de VRAM usando cuantos Q4_K_M o Q6_K; el Q8_0 requiere al menos 10 GB; el BF16 requiere 16 GB.
- **Opciones de despliegue**: llama.cpp (llama-cli, llama-server), imagen Docker con Vulkan, vLLM (previa conversión a safetensors), TGI.
- **Latencia y throughput**: decodificación de 115-148 tokens/seg en un solo slot sobre APU Strix Halo; prefill de hasta 3.564 tokens/seg con contexto de 4096 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B (original) | 8,47B | ~1,5B | 128K | lfm1.0 | safetensors |
| LFM2.5-8B-A1B-ThinkingCap (este) | 8,47B | ~1,2B | 128K (256K config) | lfm1.0 | GGUF |
| Llama 3.1 8B Instruct | 8,03B | 8,03B (denso) | 128K | Llama 3.1 | safetensors |
| Qwen2.5-7B-Instruct | 7,6B | 7,6B (denso) | 128K | Apache 2.0 | safetensors |

La ventaja principal del LFM2.5-8B-A1B frente a los modelos densos de la misma clase es la activación esporádica (~1,2B activos), que reduce la computación por token manteniendo calidad comparable a modelos de mayor tamaño, según Liquid AI.

## Limitaciones y advertencias

- **Sesgo por abliteración**: la eliminación de rechazos reduce las salvaguardas del modelo; no es apto para despliegue público sin capas de protección adicionales.
- **Riesgo de alucinación**: aunque la tasa de no-alucinación mejora con RL, el modelo puede inventar contenido factual, especialmente en dominios de conocimiento especializado.
- **Idiomas limitados**: solo garantiza calidad en inglés y español; otros idiomas pueden producir resultados degradados.
- **Licencia lfm1.0**: licencia propia de Liquid AI con restricciones de uso comercial; revisar el texto completo en el enlace del modelo base antes de producción.
- **Dependencia de kernels propietarios**: el cuant ROCmFPX requiere kernels ROCmFP4 específicos para gfx1151; en otras plataformas usar el APEX universal.
- **Razonamiento limitado**: el contrato ThinkingCap impone respuestas de 15-25 tokens de razonamiento; tareas que requieren análisis más profundo pueden verse limitadas.

## Enlaces

- [Repositorio GGUF en HuggingFace](https://huggingface.co/osk-arr00/LFM2.5-8B-A1B-ThinkingCap-GGUF)
- [Modelo base safetensors](https://huggingface.co/osk-arr00/LFM2.5-8B-A1B-ThinkingCap)
- [Liquid AI LFM2.5-8B-A1B original](https://huggingface.co/LiquidAI/LFM2.5-8B-A1B)
- [Liquid AI LFM2.5-8B-A1B-GGUF](https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF)
- [Blog de Liquid AI sobre LFM2.5-8B-A1B](https://www.liquid.ai/blog/lfm2-5-8b-a1b)
- [Blog de Liquid AI sobre LFM2-8B-A1B (primera versión)](https://www.liquid.ai/blog/lfm2-8b-a1b-an-efficient-on-device-mixture-of-experts)
- [Model
