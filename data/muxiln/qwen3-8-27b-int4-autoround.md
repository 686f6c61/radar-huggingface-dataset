# muxiln/Qwen3.8-27B-int4-AutoRound

## Resumen

Qwen3.8-27B-int4-AutoRound es una cuantización INT4 (W4A16) del modelo multimodal denso Qwen3.8-27B, desarrollada por el usuario muxiln mediante la herramienta AutoRound de Intel. El objetivo principal es reducir el peso del modelo a aproximadamente 18 GB para que quepa en GPUs de 24-32 GB manteniendo la funcionalidad de decodificación especulativa MTP (Multi-Token Prediction), algo que otras cuantizaciones 4-bit no lograban. El modelo base, creado por Alibaba, es un transformer híbrido con atención lineal GDN y soporte multimodal (imagen-texto), con 27.000 millones de parámetros y una ventana de contexto nativa de 262.144 tokens, ampliable a 1M mediante YaRN.

Esta cuantización es relevante porque permite ejecutar un modelo de 27B con capacidades de razonamiento, código y visión en hardware de consumo o en GPUs profesionales de gama media, manteniendo un rendimiento de decodificación alto gracias al cabezal MTP cuantizado. El autor reporta mediciones reales en vLLM con GPUs limitadas en potencia, lo que aporta datos concretos sobre throughput y latencia. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal GDN (modelo base Qwen3.8-27B) |
| Parametros totales | 27.000 millones (modelo base); 6.284.446.960 según safetensors (dato inconsistente, probablemente solo una parte) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1M con YaRN |
| Tipos de cuantizacion | INT4 (W4A16), grupo 128, simétrico, empaquetado auto_gptq; tensores de atención lineal y vision tower en bf16 |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantización AutoRound) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con una arquitectura híbrida que combina atención por ventana deslizante con atención lineal GDN (Gated Delta Network) en 96 capas. Esta hibridación reduce el coste computacional en contextos largos. La cuantización AutoRound se aplica a las capas del language model y al cabezal MTP, manteniendo en bf16 los tensores de atención lineal y la torre de visión. El proceso de calibración usó el dataset por defecto de AutoRound con 4 GPUs RTX 3090, batch 4 y grad-accum 2. No se menciona entrenamiento adicional ni RLHF; es una cuantización post-entrenamiento.

La innovación clave es que el cabezal MTP (especulativo) se cuantiza junto con el modelo, lo que permite usar `--speculative-config` en vLLM sin necesidad de mantener el cabezal en bf16, ahorrando memoria y duplicando el throughput de decodificación.

## Capacidades

- Generación de texto y razonamiento multi-step con modo "thinking" controlable mediante `reasoning_effort` (none/low/medium/xhigh).
- Comprensión de imágenes (multimodal image-text-to-text), ya que la torre de visión se mantiene en bf16.
- Generación de código y soporte de tool calling / function calling mediante el parser `qwen3_coder` en vLLM.
- Decodificación especulativa MTP integrada, que acelera la generación sin degradar la calidad.
- Soporte de agentes y razonamiento encadenado gracias al modo thinking y al contexto largo.
- Multilingüe (heredado del modelo base, aunque no se detallan los idiomas).
- Extensión de contexto hasta 1M tokens mediante YaRN (configuración rope_parameters del modelo base).

## Casos de uso

- Asistente de programación en IDE: el modelo puede autocompletar código, explicar fragmentos y refactorizar, aprovechando el tool calling para integrarse con APIs de repositorios. Su contexto largo permite cargar archivos completos.
- Análisis de documentos extensos: con 262K tokens de contexto, puede procesar informes, contratos o papers completos y responder preguntas sobre ellos, incluso con imágenes incrustadas.
- Automatización de oficina: generación de correos, resúmenes de reuniones y extracción de datos de documentos escaneados (gracias a la entrada de imágenes).
- Agente conversacional para atención al cliente: mantiene conversaciones multi-turno con historial largo y puede llamar a herramientas (CRM, bases de conocimiento) mediante function calling.
- Razonamiento matemático y científico: el modo thinking permite resolver problemas paso a paso, útil en tutoría o análisis de datos.
- Despliegue en edge o GPU de consumo: al pesar 18 GB, cabe en una RTX 3090/4090 o en un Mac con suficiente RAM unificada, permitiendo inferencia local sin depender de la nube.
- Investigación en eficiencia de modelos: sirve como referencia para estudiar el impacto de la cuantización INT4 en modelos híbridos con atención lineal y decodificación especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona mediciones de rendimiento de inferencia en vLLM, que se resumen a continuación:

| Configuración | Resultado |
|---|---|
| RTX 5090 (400 W cap), TP1, fp8 KV, 215K ctx | Prefill ~2.580 tok/s (doc frío de 74K), decode 124 tok/s con MTP n=3, 59 tok/s sin MTP |
| 2× RTX 3090 (200 W cap cada una), TP2, fp8 KV, 262K ctx | Concurrencia 2,22× a contexto completo, decode ~73 tok/s con MTP |
| Tasa de aceptación del draft MTP | 41-46 % en prosa, ~67 % en texto mixto, mayor en código |
| Peso en VRAM | ~18,0 GiB (TP1), 9,1 GiB por rank (TP2) |

Estas cifras se obtuvieron con GPUs limitadas en potencia; con límites estándar el rendimiento debería ser igual o mejor.

## Requisitos de hardware

- VRAM estimada: ~18 GiB para inferencia con TP1, ~9,1 GiB por rank con TP2. Con fp8 KV cache, el contexto máximo en una GPU de 24 GB es de unos 215K tokens; en 2×24 GB se alcanza el contexto nativo completo de 262K.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para TP1 con contexto reducido, o 2× RTX 3090 en TP2 para contexto completo. También funciona en RTX 5090 (32 GB) con margen para KV cache.
- Cabe en GPUs de consumo (24 GB) si se limita el contexto o se usa cuantización KV adicional.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo para AutoRound y MTP), también puede usarse con llama.cpp u Ollama si se convierte a GGUF, aunque no se menciona en la documentación.
- Latencia y throughput: decode de 124 tok/s en RTX 5090 con MTP, 73 tok/s en 2×3090; prefill de ~2.580 tok/s en 5090. Los kernels Marlin W4A16 aceleran la decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (1M con YaRN) | bf16/fp8 | Apache 2.0 | Modelo original, requiere ~54 GB en bf16 |
| muxiln/Qwen3.8-27B-int4-AutoRound | 27B (base) | 262K | INT4 W4A16 | Apache 2.0 | 18 GB, MTP cuantizado, decodificación especulativa |
| Pilcothink/Qwen3.8-27B-MixedInt4-AutoRound | 27B | 262K | Mixto 4-bit | Apache 2.0 | 20,8 GB, optimizado para DGX Spark, sin MTP cuantizado |

La principal diferencia con la alternativa de Pilcothink es que esta cuantización mantiene el cabezal MTP en INT4, permitiendo speculative decoding sin coste extra de memoria, mientras que la otra opción conserva más tensores en bf16 (mayor peso). El modelo base en bf16 requiere más del doble de VRAM.

## Limitaciones y advertencias

- La cuantización INT4 puede degradar ligeramente la calidad en tareas de precisión numérica o razonamiento complejo, aunque el autor no reporta métricas de calidad comparativas.
- Los tensores de atención lineal (in_proj_a/b) se mantienen en bf16, lo que aumenta el peso total respecto a una cuantización completa, pero preserva la ruta de atención híbrida.
- El modo thinking y `reasoning_effort` no funcionan si se desactiva el thinking en la plantilla de chat (`enable_thinking: false`); hay que usar uno u otro.
- La extensión a 1M tokens mediante YaRN requiere configurar manualmente los parámetros rope; no está activada por defecto.
- No se han publicado evaluaciones de sesgos, alucinación o seguridad específicas para esta cuantización.
- El dato de parámetros en safetensors (6,28B) es inconsistente con el nombre del modelo (27B); probablemente se refiere a una parte de los pesos, pero no se aclara en la documentación.
- Para producción, se recomienda validar el rendimiento en tareas específicas, ya que la cuantización puede afectar a casos de uso con dependencia de tokens poco frecuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muxiln/Qwen3.8-27B-int4-AutoRound
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Cuantización alternativa (Pilcothink): https://huggingface.co/Pilcothink/Qwen3.8-27B-MixedInt4-AutoRound
- Herramienta AutoRound de Intel: https://github.com/intel/auto-round
