# matbee/LFM2.5-350M-Instruct-ONNX-Vulkan

## Resumen

LFM2.5-350M-Instruct-ONNX-Vulkan es una exportación ONNX cuantizada a 4 bits del modelo instruct LFM2.5-350M de Liquid AI, adaptada específicamente para inferencia en GPU mediante Vulkan. El modelo original, desarrollado por Liquid AI, es el más pequeño de la familia LFM2.5, diseñado para dispositivos con restricciones de memoria y cómputo, con una arquitectura híbrida que combina capas convolucionales y de atención. Esta variante ONNX mantiene el mismo contrato de entrada/salida que la versión 1.2B instruct de Liquid AI, escalado a una dimensión oculta de 1024, e incorpora cuantización asimétrica MatMulNBits con bloque de 32, lo que reduce el tamaño total a 395 MB.

El modelo está pensado para integrarse en el "deck" dual-role de remotemedia, donde actúa como rol instruct mientras el rol de audio usa el bundle 1.5B estándar. Incluye validaciones exhaustivas de paridad con PyTorch bf16 (13/13 tool calls bit-idénticos, 17/17 round-trips) y una batería de gramática y grounding-gate con 11/11 aciertos. Su relevancia radica en ofrecer capacidades de tool calling y generación de texto de alta calidad en entornos edge, con soporte para Vulkan, lo que permite ejecución en GPUs integradas y discretas de bajo consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 híbrida: 14 capas (10 short-conv + 6 attention), SwiGLU FFN, GQA 16q/8kv, RoPE (theta 1e6, head_dim 64) |
| Parametros totales | 350M (segun denominacion del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (max_pos 128000) |
| Tipos de cuantizacion | 4-bit asimetrica MatMulNBits (block-32), packed int4 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (hereda del checkpoint fuente) |
| Formato de pesos | ONNX (external data) + embed_tokens.bin (bf16) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M fue entrenado por Liquid AI con pre-training extendido de 10T a 28T tokens y un gran volumen de aprendizaje por refuerzo (RL), lo que mejora chat, seguimiento de instrucciones y tool calling respecto a LFM2-350M. La arquitectura LFM2 es híbrida: combina capas convolucionales de corto alcance (short-conv) con capas de atención, usando SwiGLU en el FFN y Grouped Query Attention (GQA) con 16 queries y 8 key/value heads. Esta exportación ONNX replica el grafo del modelo 1.2B instruct de Liquid AI, con operadores `com.microsoft` como `GroupQueryAttention` con RoPE integrado, `MatMulNBits` asimétrico y `SimplifiedLayerNormalization`. El lm_head está atado a la tabla de embeddings y cuantizado en el grafo. La cuantización usa escala y zero-point por bloque de 32 filas, con un error de un paso respecto al bf16 original (auditado 93/93 pesos).

## Capacidades

- Generacion de texto y chat con instrucciones, optimizado para seguimiento de instrucciones y respuestas coherentes.
- Tool calling / function calling: soporta llamadas a herramientas estructuradas, validado con 13/13 tool calls bit-idénticos respecto a PyTorch bf16.
- Grounding-gate: capacidad de rechazo fundamentado (refusal) cuando no hay evidencia suficiente, evitando alucinaciones en modo controlado.
- Razonamiento multi-paso y agentico: puede mantener conversaciones multi-turno con contexto largo (128K tokens).
- Multilingue: no especificado, pero el tokenizer compartido (64.402 vocabulario) sugiere soporte multilingue amplio.
- Compatibilidad con gramática: soporta generación restringida por gramática (JSON, protocolos) para salidas estructuradas.
- Inferencia en Vulkan: ejecución en GPU mediante el fork `onnx-vulkan-rs-edge`, con kernels específicos para MatMulNBits de 4 entradas.

## Casos de uso

- Asistentes de voz en dispositivos edge: el modelo puede gestionar el rol instruct en un sistema de audio dual-role, procesando comandos de voz y generando respuestas con tool calling, gracias a su bajo consumo y soporte Vulkan.
- Automatizacion de tareas con herramientas: integrado en pipelines de agentes, puede llamar a APIs externas (por ejemplo, `get_weather`) de forma fiable, como demuestra la validación con 13/13 tool calls bit-idénticos.
- Chatbots de atencion al cliente en hardware limitado: su ventana de 128K tokens permite manejar historiales largos en CPUs o GPUs integradas, sin necesidad de servidores potentes.
- Generacion de contenido estructurado: con soporte de gramática, puede producir JSON o protocolos específicos de forma forzada, útil para extracción de datos o integración con sistemas legacy.
- Prototipado rapido de agentes en local: al ser un modelo pequeño y cuantizado, permite probar flujos agenticos en un portátil con GPU integrada antes de escalar a modelos mayores.
- Investigacion en eficiencia de modelos: sirve como referencia para estudiar el impacto de la cuantizacion 4-bit en arquitecturas híbridas, con auditorías de paridad y reportes de dequantización incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Sin embargo, el model card incluye validaciones internas:

| Prueba | Resultado |
|---|---|
| Paridad CPU ORT vs PyTorch bf16 (tool call B4) | 13/13 bit-identicos |
| Paridad round-trip T8c | 17/17 bit-identicos |
| Bateria de gramatica y grounding-gate | 11/11 |
| GPU showcase (Vulkan, dual-role) | 14/14 ALL-PASS |

Estos resultados demuestran que la exportacion ONNX cuantizada reproduce fielmente el comportamiento del modelo original en tareas de tool calling y generacion estructurada, aunque no hay datos comparativos con otros modelos.

## Requisitos de hardware

- Tamano del repo: 0,4 GB (395 MB), lo que indica que los pesos caben en menos de 1 GB de memoria.
- Disenado para edge: puede ejecutarse en CPUs (validado con ORT en CPU) y en GPUs via Vulkan (fork `onnx-vulkan-rs-edge`).
- VRAM estimada: no disponible, pero al ser 4-bit y 350M, se espera que quepa en GPUs con 1-2 GB de VRAM (por ejemplo, iGPU integradas o GPUs de gama baja).
- Opciones de despliegue: ONNX Runtime (CPU/GPU), Vulkan (via fork), y potencialmente otros runtimes ONNX.
- Latencia y throughput: no disponibles, pero el blog de Liquid AI destaca "inferencia excepcionalmente rapida" en CPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-350M (original) | 350M | 128K | bf16 | LFM Open License v1.0 | Safetensors |
| LFM2.5-350M-ONNX (oficial) | 350M | 128K | Q4 (MatMulNBits) | LFM Open License v1.0 | ONNX |
| LFM2.5-350M-Instruct-ONNX-Vulkan (este) | 350M | 128K | 4-bit asimetrico | LFM Open License v1.0 | ONNX + bin |

La principal diferencia con el ONNX oficial es que esta variante esta optimizada para Vulkan y replica el contrato del modelo 1.2B instruct, con validaciones adicionales de paridad y gramatica. No se dispone de comparativas con otros modelos de tamano similar (por ejemplo, Qwen2.5-0.5B o SmolLM2-360M) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos en la informacion disponible.
- Riesgo de alucinacion: el model card indica que en modo libre (sin grounding-gate) el modelo puede fabricar informacion (T7a fabrication persists in free mode); el grounding-gate mitiga esto pero no lo elimina.
- Limitaciones de contexto: aunque la ventana es de 128K tokens, la cuantizacion 4-bit puede degradar ligeramente la calidad en contextos muy largos (no verificado).
- Restricciones de licencia: la LFM Open License v1.0 es una licencia open source con condiciones especificas; se debe revisar el texto completo en el repositorio de LiquidAI para uso comercial.
- Dependencia de un fork especifico: para Vulkan se requiere el fork `onnx-vulkan-rs-edge` (main @ 74ca614 o posterior), lo que puede limitar la portabilidad.
- Vocabulario: el model card menciona una discrepancia entre el vocab de 65.536 (embed_tokens.json) y 64.402 (contrato); se recomienda verificar la compatibilidad con el tokenizer compartido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matbee/LFM2.5-350M-Instruct-ONNX-Vulkan
- Modelo original: https://huggingface.co/LiquidAI/LFM2.5-350M
- ONNX oficial de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-350M-ONNX
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-350m
- Modelo en ModelScope: https://www.modelscope.cn/models/onnx-community/LFM2.5-350M-ONNX
