# AkshaXA/aegis-router-v1

## Resumen

Aegis Router v1 es un modelo de clasificación y enrutamiento construido sobre `answerdotai/ModernBERT-base` (149M parámetros) y exportado a ONNX FP16. Lo desarrolla AkshaXA y se presenta como un "AI Gateway System-1": en un único paso forward bidireccional, sin generar tokens ni llamar a APIs externas, decide a qué tier de modelo enviar cada prompt (SLM, Mid o Frontier), bloquea intentos de prompt injection y clasifica la intención del usuario en cinco categorías de despacho de herramientas.

La propuesta diferencial es económica y de seguridad: al resolver el enrutamiento y el filtrado antes de invocar cualquier LLM grande, el coste marginal por prompt se reduce y los ataques de inyección se cortan antes de consumir tokens del modelo de destino. El modelo incluye una calibración explícita (ECE de 0.0572) y un umbral de confianza de 0.85 que escala automáticamente a Frontier cuando la predicción no es fiable.

Técnicamente es un encoder bidireccional, no un generador: hereda el límite de contexto de 8K tokens de ModernBERT y se distribuye como grafo ONNX con licencia Apache 2.0, pensado para desplegarse dentro de una VPC como proxy compatible con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-base), exportado a ONNX |
| Parametros totales | 149M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredado de ModernBERT) |
| Tipos de cuantizacion | FP16 (grafo ONNX publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX FP16 (`aegis_router_v1_fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer bidireccional con atención de soporte largo, y se ha exportado a un grafo ONNX en FP16 para inferencia con `onnxruntime`. No genera texto: produce cabeceras de clasificación sobre la representación del prompt en un solo forward pass. Sobre esa base se añaden tres tareas: tiering calibrado en tres clases (SLM, Mid, Frontier), detección binaria de prompt injection y clasificación de intención en cinco clases (DIRECT_CHAT, CODE_OPS, RAG_RETRIEVAL, STRUCTURED_SQL, EXTERNAL_API).

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo ajuste con RLHF o DPO; esos datos figuran como no disponibles. Sí se documenta una calibración explícita de las probabilidades (ECE de 0.0572) y un umbral de confianza de 0.85 con escalado automático a Frontier. La hoja de ruta menciona una v2 de 300M con backbone híbrido 3:1 Mamba + FlashAttention-2 para enrutamiento lineal O(N) y defensa frente a inyección indirecta en trayectorias de agente de 64K–128K tokens.

## Capacidades

- Enrutamiento calibrado de prompts a tres tiers de modelo (SLM, Mid, Frontier) con umbral de confianza de 0.85 y escalado fail-safe.
- Detección y bloqueo de prompt injection antes de invocar el LLM de destino.
- Clasificación de intención en cinco clases para despacho de herramientas: DIRECT_CHAT, CODE_OPS, RAG_RETRIEVAL, STRUCTURED_SQL y EXTERNAL_API.
- Inferencia zero-egress: no realiza llamadas a APIs externas ni genera tokens.
- Ejecución en navegador mediante WebGPU/WASM, además de servidor con ONNX Runtime.
- No dispone de generación de texto, razonamiento generativo, visión, audio ni capacidades multilingües documentadas.

## Casos de uso

- Gateway de enrutamiento de coste: desplegado como proxy compatible con OpenAI, clasifica cada prompt y lo dirige al tier más barato que pueda resolverlo, escalando a Frontier solo cuando la confianza cae por debajo de 0.85.
- Defensa perimetral frente a prompt injection: filtra prompts adversariales antes de que lleguen al LLM de producción, con una precisión reportada del 99,07% y F1 de 0.9841.
- Despacho de herramientas en pipelines de agentes: la clasificación en cinco clases permite decidir si un turno requiere código, recuperación RAG, SQL estructurado o una API externa, sin coste de generación.
- Telemetría de ROI en AI gateways: la CLI `aegis-router report` calcula ahorros contrafactuales, percentiles de latencia e inyecciones bloqueadas sobre una base SQLite durante los últimos días.
- Enrutamiento en el borde o en cliente: la inferencia WebGPU/WASM permite ejecutar la clasificación íntegramente en el navegador, útil para aplicaciones que no pueden enviar prompts a un servidor externo.
- Control de acceso y moderación de entrada en asistentes multi-turno cortos: con 8K de contexto cubre conversaciones de pocos turnos y permite aplicar políticas antes de consumir cuota del modelo grande.

## Benchmarks y rendimiento

Medidos por el autor en una NVIDIA T4 con `onnxruntime-gpu` en FP16 y `batch_size=1`:

| Metrica | Resultado |
|---|---|
| Latencia p50 / p95 / p99 | 5,91 ms / 8,44 ms / 9,08 ms |
| Throughput (BS=1) | 157,3 req/s |
| Guardrail de prompt injection | 99,07% de accuracy (F1 0.9841) |
| Despacho de herramientas (5 clases) | 98,75% de accuracy (macro-F1 0.9878) |
| Calibracion (ECE) | 0,0572 |

No se han publicado comparaciones con modelos alternativos de enrutamiento en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP16 para un modelo de 149M parámetros; el repositorio completo ocupa 0,9 GB.
- GPU recomendadas: NVIDIA T4 para el rendimiento medido; cualquier GPU con soporte CUDA y `onnxruntime-gpu` es suficiente.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, etc.) y también en CPU mediante `CPUExecutionProvider`.
- Despliegue: ONNX Runtime (CUDA o CPU), paquete PyPI `aegis-ai-router` como proxy compatible con OpenAI, y WebGPU/WASM en navegador.
- Latencia: 5,91 ms p50 en T4; en navegador ronda los 100 ms por sobrecarga del entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Aegis Router v1 | 149M | 8K | Enrutamiento, guardrail y tool dispatch | Apache 2.0 |
| ModernBERT-base (base) | 149M | 8K | Encoder generalista | Apache 2.0 |
| Clasificadores de intención tipo BERT | 110M–340M | 512–8K | Clasificación de intención | Variable |

No se dispone de datos de rendimiento de alternativas específicas de enrutamiento en la información proporcionada, por lo que la comparación cuantitativa figura como no disponible.

## Limitaciones y advertencias

- Techo de contexto de 8K tokens: adecuado para turnos únicos y conversaciones cortas, insuficiente para trayectorias de agente largas.
- No es un modelo generativo: no puede producir respuestas, solo etiquetas de clasificación.
- Idiomas soportados no documentados; el rendimiento fuera del inglés no está garantizado.
- Los benchmarks son autoinformados por el autor y no han sido replicados de forma independiente.
- Riesgo de clasificación errónea en prompts ambiguos; el umbral de 0.85 mitiga el tiering pero no elimina falsos negativos en la detección de inyección.
- La defensa frente a inyección indirecta en contextos multi-turno largos se anuncia para la v2, no está cubierta en v1.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base ModernBERT-base en despliegues derivados.

## Enlaces

- Hugging Face: https://huggingface.co/AkshaXA/aegis-router-v1
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Repositorio GitHub: https://github.com/devxa2602/AegisRouter
- Paquete PyPI: https://pypi.org/project/aegis-ai-router/
- Demo en navegador: https://devxa2602.github.io/AegisRouter/aegisRouter.html
