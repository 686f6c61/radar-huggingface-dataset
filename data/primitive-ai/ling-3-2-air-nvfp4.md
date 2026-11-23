# primitive-ai/Ling-3.2-air-NVFP4

## Resumen

Ling-3.2-air-NVFP4 es una cuantización de 4 bits (NVFP4) del modelo multimodal Ling-3.2-air, desarrollado originalmente por inclusionAI. La ficha la publica primitive-ai, un estudio centrado en economía de inferencia para sistemas LLM en producción. El modelo base es un transformer disperso de tipo Mixture-of-Experts (MoE) con 124.000 millones de parámetros totales y 5.500 millones activos, pensado para tareas de razonamiento, código y comprensión de imagen y texto.

La relevancia de esta versión concreta es de despliegue: reduce el peso del checkpoint de 129,33 GB (release FP8 original) a 77,86 GB, lo que permite servirlo en una única GPU de 96 GB (RTX PRO 6000 Blackwell) en lugar de las dos tarjetas que exige la versión FP8 con tensor parallel 2. Solo los expertos enrutados (512 por capa MoE, más la capa MTP) se almacenan en NVFP4; atención, expertos compartidos, MLPs densos, routers, torre de visión, embeddings y LM head permanecen en BF16.

La arquitectura combina 42 capas: 35 de atención lineal KDA (Kimi Delta Attention) y 7 de MLA (Multi-head Latent Attention) con compuerta, más una capa MTP (multi-token prediction). Es un modelo multimodal image-text-to-text con licencia MIT, lo que facilita su uso comercial, aunque la información pública disponible sobre benchmarks de esta build concreta está todavía pendiente de publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (transformer híbrido: 35 capas KDA de atención lineal + 7 capas MLA con compuerta), con torre de visión y capa MTP |
| Parametros totales | 127.920.654.544 (~124 B) |
| Parametros activos | ~5,5 B (top-8 de 512 expertos enrutados + 1 experto compartido por capa MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de servicio recomendada (el máximo nativo del modelo base no se detalla en la información disponible) |
| Tipos de cuantizacion | NVFP4 (E2M1 con escala E4M3 por cada 16 valores y escala global FP32) en expertos enrutados; BF16 en el resto de módulos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con `compressed-tensors` (checkpoint cuantizado NVFP4/BF16 mixto) |

Otros datos técnicos: tamaño del repositorio 77,9 GB, hidden size 2560, ancho de experto 768, 42 capas totales, 512 expertos enrutados con top-8 y un experto compartido por capa MoE, más dos MLPs densos en las capas 0-1.

## Arquitectura y entrenamiento

El modelo base Ling-3.2-air es un MoE disperso de 124 B parámetros totales con 5,5 B activos por token. Cada capa MoE contiene 512 expertos enrutados (se activan los 8 mejores) y un experto compartido siempre activo. La parte de atención es híbrida: 35 capas usan KDA (atención lineal con estado recurrente, orientada a eficiencia en contextos largos) y 7 capas usan MLA (Multi-head Latent Attention) con compuerta. Incorpora además una capa MTP para decodificación multi-token y una torre de visión que lo convierte en modelo image-text-to-text.

Esta build concreta no entrena nada: es una cuantización. Como inclusionAI no publicó pesos BF16, primitive-ai partió del release FP8 (W8A8 con bloques de 128×128), dequantizó esos tensores a BF16 y volvió a cuantizar los expertos enrutados a NVFP4. En los expertos, las proyecciones gate y up comparten una única escala global porque vLLM las fusiona; las activaciones que entran en los expertos se cuantizan a NVFP4 en tiempo de ejecución. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, si hubo RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (`enable_thinking: true`) recomendado por inclusionAI.
- Comprensión de imagen y texto (pipeline `image-text-to-text`) mediante torre de visión integrada.
- Tool calling / function calling nativo, con parser `ling3` en vLLM y `--enable-auto-tool-choice`.
- Capacidades de agente y razonamiento multi-turno, apoyadas en el parser de razonamiento `ling3`.
- Decodificación multi-token (MTP) para acelerar la generación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados por el autor del modelo base: temperature 1.0, top_p 0.95, top_k 20.

## Casos de uso

- Asistente multimodal en producción: el modelo acepta imagen y texto en la misma conversación, por lo que sirve para interfaces de soporte donde el usuario adjunta capturas, facturas o diagramas y espera respuestas razonadas.
- Automatización de agentes con tool calling: al soportar function calling nativo y parser dedicado en vLLM, puede encadenar llamadas a APIs (consulta de bases de datos, ticketing, pagos) dentro de flujos multi-paso.
- Generación y revisión de código: los 5,5 B parámetros activos por token permiten servir código con coste de inferencia contenido en una sola GPU, integrándolo en pipelines de CI/CD o asistentes de IDE.
- Extracción de información de documentos con imagen: digitalización de formularios, albaranes o informes escaneados combinando la torre de visión con razonamiento sobre el texto extraído.
- Razonamiento con contexto largo: los 32.768 tokens configurados permiten analizar contratos, informes técnicos o hilos de conversación extensos en una sola pasada.
- Despliegue en infraestructura de una sola tarjeta: al caber en 96 GB, es adecuado para entornos on-premise o cloud con una RTX PRO 6000 Blackwell, sin necesidad de tensor parallel ni de dos GPUs.
- Moderación y clasificación asistida: con modo de razonamiento activado, puede justificar decisiones de clasificación o abstención en flujos de revisión de contenido.

## Benchmarks y rendimiento

La model card de esta build declara explícitamente que las métricas están pendientes de ejecución. No se han publicado resultados de benchmarks en la información disponible.

La tabla de la model card incluye las columnas previstas (drift en nats/token, top-1 agreement, knowledge, call, abstain, finished, tok/s a concurrencia 1 y 32) pero todas las celdas de esta build figuran como "pending". La referencia es el release FP8 de inclusionAI, medido con dos tarjetas en tensor parallel 2.

| Build | Formato | Tamano | Drift (x10⁻³ nats/token) | Top-1 agreement | Throughput @1 | Throughput @32 |
|---|---|---|---|---|---|---|
| Ling-3.2-air FP8 (inclusionAI) | FP8 W8A8, bloques 128×128 | 129,33 GB | 0 (referencia) | 100% | n/a (2 tarjetas) | n/a (2 tarjetas) |
| Ling-3.2-air-NVFP4 (esta build) | NVFP4 W4A4 expertos enrutados, resto BF16 | 77,86 GB | pendiente | pendiente | pendiente | pendiente |
| Ling-3.2-air-NVFP4A16 | NVFP4 W4A16 expertos enrutados, resto BF16 | 77,86 GB | pendiente | pendiente | pendiente | pendiente |

## Requisitos de hardware

- VRAM estimada: 77,9 GB de pesos más overhead de KV cache y activaciones. La model card indica que cabe en una tarjeta de 96 GB; la configuración de servicio usa `--gpu-memory-utilization 0.92`.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB), validada por el autor. GPUs con menos de 96 GB no son suficientes para esta build según la información disponible.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, RTX 5090 de 32 GB) sin una cuantización adicional más agresiva, que no se ofrece en este repositorio.
- Despliegue: vLLM (imagen `vllm/vllm-openai:nightly-a2bcb5657a881a002e79d0adab3c6b5e39436121`), con `--trust-remote-code`, `--max-model-len 32768`, `--reasoning-parser ling3`, `--enable-auto-tool-choice` y `--tool-call-parser ling3`. Requiere soporte de NVFP4 y del código custom `bailing_moe_v3_vl`.
- Latencia y throughput: pendientes de publicación en la model card. No se dispone de cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / tamano |
|---|---|---|---|---|---|
| Ling-3.2-air-NVFP4 (esta build) | ~124 B | ~5,5 B | 32.768 (config. servicio) | MIT | NVFP4/BF16, 77,86 GB |
| Ling-3.2-air FP8 (inclusionAI) | ~124 B | ~5,5 B | no disponible | MIT | FP8 W8A8, 129,33 GB |
| Ling-3.2-air-NVFP4A16 (primitive-ai) | ~124 B | ~5,5 B | 32.768 (config. servicio) | MIT | NVFP4 W4A16, 77,86 GB |

La comparación con modelos de otros autores de la misma categoría (MoE multimodal de ~100 B con licencia permisiva) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NVFP4 introduce una deriva (drift) respecto al release FP8 que el autor aún no ha cuantificado públicamente; los valores de drift y top-1 agreement figuran como pendientes.
- El punto de partida es el release FP8, no pesos BF16 (inclusionAI no los publicó), por lo que el error de cuantización se acumula sobre una conversión previa.
- El contexto de servicio está fijado en 32.768 tokens en la configuración de ejemplo; ampliarlo requiere más VRAM y no se garantiza en una sola tarjeta de 96 GB.
- Los idiomas soportados no están documentados en la información disponible; no se puede asumir cobertura multilingüe amplia.
- Riesgo de alucinación inherente a modelos generativos de este tamaño; el modo de razonamiento no elimina el problema.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia MIT permite uso comercial, pero al ser una versión modificada del modelo base conviene conservar los avisos de copyright y verificar la licencia del modelo original.
- Requiere `--trust-remote-code` y una versión nightly concreta de vLLM; la compatibilidad con otras versiones no está garantizada.
- El repositorio registra 0 descargas, por lo que no hay validación comunitaria independiente de su comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/primitive-ai/Ling-3.2-air-NVFP4
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Variante NVFP4A16 del mismo autor: https://huggingface.co/primitive-ai/Ling-3.2-air-NVFP4A16
- Sitio del autor: https://primitive.com
- Más modelos del autor: https://huggingface.co/primitive-ai
