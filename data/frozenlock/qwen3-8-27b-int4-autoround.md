# Frozenlock/Qwen3.8-27B-int4-AutoRound

## Resumen

Frozenlock/Qwen3.8-27B-int4-AutoRound es una cuantización INT4 (W4A16) del modelo Qwen/Qwen3.8-27B, realizada con la librería AutoRound de Intel. El autor, Frozenlock, ha optimizado el proceso para conservar dos elementos críticos del modelo original: la cabeza MTP (Multi-Token Prediction) para decodificación especulativa y la torre de visión, que permanecen funcionales tras la cuantización. El resultado es un modelo de ~18 GB que cabe en GPUs de 24–32 GB con margen para una caché KV amplia, algo que otras cuantizaciones INT4 del mismo modelo no lograban al descartar los tensores MTP o al mantener demasiados pesos en bf16.

La relevancia de esta ficha radica en que Qwen3.8-27B es un modelo de lenguaje multimodal denso de 27B parámetros con ventana de contexto nativa de 262 144 tokens, razonamiento configurable y capacidades de agente. Esta versión cuantizada permite desplegarlo en hardware de consumo o en estaciones de trabajo con una sola GPU, manteniendo un rendimiento de decodificación alto gracias a la decodificación especulativa MTP activa. Está pensada para entornos de producción con vLLM, donde el soporte nativo de `--speculative-config` y el parser de herramientas `qwen3_coder` la convierten en una opción práctica para tareas de agente y generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto e imagen) con atención híbrida: atención lineal GDN y atención completa; cabeza MTP para decodificación especulativa |
| Parametros totales | 6 284 446 960 (dato reportado por safetensors; el modelo base Qwen3.8-27B declara 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativa; extensible a 1M con YaRN (ver card del modelo base) |
| Tipos de cuantizacion | INT4 (W4A16), grupo 128, simétrica, empaquetado `auto_gptq`; tensores de atención lineal GDN y torre de visión en bf16 |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingüe, pero la card no especifica lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (también compatible con vLLM mediante `--quantization auto_round`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal que combina atención lineal GDN (96 tensores `in_proj_a` / `in_proj_b`) con atención completa, más una torre de visión para entrada de imágenes. Incorpora una cabeza MTP que predice múltiples tokens futuros para acelerar la decodificación. La cuantización de Frozenlock se aplicó únicamente a los bloques `model.language_model.layers` y `mtp.layers` en INT4 con grupo 128, dejando en bf16 los tensores de atención lineal GDN (porque cuantizarlos degrada significativamente la ruta de atención híbrida) y la torre de visión. El proceso de calibración usó el dataset y las iteraciones por defecto de AutoRound 0.14.2, con batch 4 y grad-accum 2 sobre 4× RTX 3090. No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, método de alineación), ya que no se incluye en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento con niveles configurables (`reasoning_effort`: `none`, `low`, `medium`, `xhigh`).
- Comprensión de imágenes (entrada multimodal) gracias a la torre de visión conservada en bf16.
- Tool calling / function calling compatible con vLLM mediante `--tool-call-parser qwen3_coder` y `--enable-auto-tool-choice`.
- Decodificación especulativa MTP funcional: acelera el throughput de decodificación aproximadamente un 98 % en pruebas con temperatura 0, con tasas de aceptación del draft del 41–67 % según el contenido.
- Soporte de agentes y razonamiento multi-paso, favorecido por la ventana de contexto larga (262K nativa) y el modo razonamiento.
- Capacidades multilingües del modelo base (no detalladas en la card, pero presentes en Qwen3.8-27B).

## Casos de uso

- Atención al cliente automatizada: con 262 144 tokens de contexto nativo, el modelo puede mantener conversaciones multi-turno extensas y recordar detalles de interacciones previas sin perder el hilo. La cuantización INT4 permite desplegarlo en una sola GPU de 24 GB, reduciendo costes de infraestructura.
- Generación de código en producción: el soporte de tool calling con el parser `qwen3_coder` permite integrarlo en pipelines de CI/CD para autocompletar, revisar o generar código. La decodificación especulativa MTP acelera la respuesta en entornos interactivos.
- Agentes autónomos de larga duración: la combinación de contexto largo, razonamiento configurable y tool calling lo hace adecuado para agentes que deben planificar, ejecutar acciones y reflexionar sobre resultados durante horas sin reiniciar la sesión.
- Análisis de documentos técnicos con imágenes: al conservar la torre de visión, puede procesar capturas de pantalla, diagramas o figuras junto con texto, útil para resumir informes o extraer información de material visual.
- Asistente de investigación científica: con `reasoning_effort` en `xhigh` y contexto de 262K, puede leer múltiples artículos, comparar metodologías y redactar síntesis críticas, manteniendo referencias dentro de la ventana.
- Despliegue en estaciones de trabajo con GPUs de consumo: gracias a los ~18 GB de pesos, cabe en una RTX 3090/4090 o en una RTX 5090 con margen para caché KV fp8. Es viable para equipos locales de desarrollo que necesitan privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada. La model card sí incluye mediciones de rendimiento de inferencia, que se resumen a continuación:

| Configuracion | Resultado |
|---|---|
| Pesos en VRAM | ~18.0 GiB (TP1) / 9.1 GiB por rank (TP2) |
| RTX 5090 @ 400 W cap, TP1, fp8 KV, 215K ctx | Prefill ~2580 tok/s (documento frío de 74K); decode 124 tok/s con MTP n=3, 59 tok/s sin MTP |
| 2× RTX 3090 @ 200 W cap cada una, TP2, fp8 KV, 262K ctx | 2.22× concurrencia a contexto completo; decode ~73 tok/s con MTP |
| Aceptacion de draft MTP | 41–46 % (prosa), ~67 % (contenido mixto), mayor en código/texto predecible |

Estas cifras se obtuvieron con GPUs limitadas en potencia (5090 a 400 W de 600 W; 3090 a 200 W de 350 W), por lo que con límites de stock el rendimiento debería ser igual o superior.

## Requisitos de hardware

- VRAM estimada: ~18 GiB para inferencia TP1 con cuantización INT4 y caché KV fp8; ~9.1 GiB por rank en TP2.
- GPU recomendadas: RTX 5090 (TP1), 2× RTX 3090 (TP2), o cualquier GPU con 24–32 GB de VRAM (RTX 4090, A6000, etc.).
- Cabe en GPUs de consumo: sí, en una RTX 3090/4090 de 24 GB con contexto reducido (~215K en una 32 GB); en 24 GB cabe con contexto menor o usando TP2.
- Opciones de despliegue: vLLM (recomendado, con `--quantization auto_round`), también compatible con LM Studio según la documentación de AMD, y posiblemente con otros motores que soporten AutoRound.
- Latencia y throughput: decode de 124 tok/s en RTX 5090 con MTP, 73 tok/s en 2× RTX 3090; prefill de ~2580 tok/s en la 5090 para documentos largos.

## Comparativa con modelos similares

Existen otras cuantizaciones del mismo modelo base, aunque no se dispone de datos comparativos de rendimiento de calidad. La siguiente tabla resume las diferencias principales según la información disponible:

| Modelo | Tipo | Tamano | MTP | Vision | Notas |
|---|---|---|---|---|---|
| Frozenlock/Qwen3.8-27B-int4-AutoRound | INT4 W4A16 | ~18 GB | Sí, cuantizado y funcional | Sí, en bf16 | Optimizado para vLLM, decodificación especulativa activa |
| unsloth/Qwen3.8-27B-GGUF | GGUF (varias cuantizaciones) | Variable | No disponible | No disponible | Formato GGUF para llama.cpp/Ollama, sin MTP |
| NVIDIA MixedInt4 (foro) | INT4 mixto | No disponible | No disponible | No disponible | Optimizado para DGX Spark, objetivo de calidad máxima |

No se dispone de benchmarks comparativos entre estas opciones. La ventaja principal de la versión de Frozenlock es el MTP funcional y el tamaño compacto que cabe en GPUs de 24–32 GB.

## Limitaciones y advertencias

- La cuantización INT4 puede introducir degradación de calidad en tareas que requieren precisión numérica alta, aunque el autor no reporta métricas de calidad comparativas.
- Los tensores de atención lineal GDN se mantienen en bf16, lo que aumenta ligeramente el uso de VRAM frente a una cuantización total, pero preserva la ruta de atención híbrida.
- El uso simultáneo de `reasoning_effort` y `enable_thinking: false` en `chat_template_kwargs` provoca que el modelo ignore silenciosamente `reasoning_effort`; se recomienda usar solo uno de los dos controles.
- No se especifican sesgos conocidos ni riesgos de alucinación específicos de esta cuantización; como todo modelo de lenguaje, puede generar contenido falso o tendencioso. Se recomienda validación humana en aplicaciones críticas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales (verificar la card del modelo base).
- El rendimiento medido se obtuvo con GPUs limitadas en potencia; en configuraciones sin límite los resultados pueden variar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Frozenlock/Qwen3.8-27B-int4-AutoRound
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de AMD para ejecutar Qwen3.8 en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía de Unsloth para Qwen3.8 local: https://unsloth.ai/docs/models/qwen3.8
- Hilo del foro de NVIDIA sobre MixedInt4 de Qwen3.8-27B: https://forums.developer.nvidia.com/t/qwen3-8-27b-mixedint4-autoround-optimized-for-a-single-dgx-spark/380248
- Página de LM Studio para Qwen3.8: https://lmstudio.ai/models/qwen3.8
