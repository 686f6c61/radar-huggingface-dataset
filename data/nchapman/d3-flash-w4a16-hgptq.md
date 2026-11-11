# nchapman/d3-flash-W4A16-HGPTQ

## Resumen

d3-flash-W4A16-HGPTQ es una cuantización de 4 bits del modelo base vllm-sr/d3-flash, publicada por el usuario nchapman. El modelo original es un modelo de decisión de un solo paso (single-pass) orientado a tareas de clasificación estructurada mediante una cabeza de lectura de 255 códigos (code-readout-v1), no un modelo generativo conversacional al uso. La cuantización reduce el checkpoint BF16 de 15,64 GiB a 5,56 GiB (factor 2,81x) manteniendo una concordancia top-1 del 100 % en las decisiones evaluadas.

La arquitectura subyacente es un transformer híbrido de 32 capas con hidden_size 4096, que combina bloques GatedDeltaNet (atención lineal recurrente) con bloques de atención completa, e incorpora una torre de visión de 27 bloques ViT. El checkpoint cuantizado conserva la cabeza de lectura en BF16 exacto y aplica GPTQ con rotación Walsh-Hadamard a 337 capas lineales (200 del lenguaje y 137 de visión).

La relevancia de esta ficha radica en que documenta una técnica de cuantización poco habitual (Hadamard + Cholesky GPTQ con group_size 64) aplicada a un modelo de decisión con componentes multimodales, y en que el propio autor reporta métricas de fidelidad frente al BF16. Es un artefacto muy reciente (noviembre de 2026), con cero descargas y cero likes en el momento de la consulta, y con escasa documentación pública más allá de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 capas con GatedDeltaNet + atención completa; torre de visión ViT de 27 bloques; cabeza de lectura de 255 códigos |
| Parametros totales | 8.392.695.024 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 GPTQ (4 bits pesos, 16 bits activaciones), group_size 64, actorder estático, rotación Walsh-Hadamard 64x64; capas de visión en g64-h64 y GPTQ per-channel para linear_fc2 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, quantization_status: compressed) |

## Arquitectura y entrenamiento

El modelo base vllm-sr/d3-flash emplea una arquitectura híbrida de 32 capas con hidden_size 4096 que alterna bloques GatedDeltaNet (una forma de atención lineal recurrente con estado) y bloques de atención completa. La inferencia es de un solo paso (single-pass) y produce una distribución sobre 255 códigos mediante una cabeza de lectura lineal de dimensiones [255, 4096] almacenada en readout.safetensors. El modelo incluye además una torre de visión con 27 bloques ViT y un módulo merger que proyecta las representaciones visuales al espacio del lenguaje.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card de esta cuantización tampoco detalla el proceso de entrenamiento original. La innovación técnica destacable de este checkpoint es el recipe de cuantización: rotación de entrada Walsh-Hadamard Sylvester 64x64 aplicada en línea, seguida de GPTQ con inicialización Cholesky basada en MSE, group_size 64, actorder estático y dampening_frac 0,01, calibrada capa por capa bajo atención no causal completa. Las claves de safetensors usan prefijos canónicos model.language_model.* y model.visual.*, y cargan sin claves faltantes ni inesperadas en Qwen3_5Model.from_pretrained, D3.from_pretrained y warp-34.

## Capacidades

- Toma de decisiones estructurada de un solo paso sobre tareas de tipo choice (elección múltiple), yes_no (sí/no), multi_select (selección múltiple) y scale (escala), según la evaluación code-readout-v1.
- Producción de una distribución de probabilidad normalizada sobre 255 códigos de decisión mediante la cabeza de lectura.
- Procesamiento multimodal: incorpora una torre de visión de 27 bloques ViT con módulo merger, evaluada con las sondas vision-probe-v2 y vision-guard-v2.
- Razonamiento sobre estado textual y preguntas con criterios definidos por el usuario (parámetros state, questions, criteria en la API D3.system_one).
- Promediado de permutaciones de opciones (forward + reverse) para robustez en la evaluación de decisiones.
- No se documentan capacidades de generación de texto libre, tool calling, function calling, agentes multi-paso ni modo thinking en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Clasificación de intención en atención al cliente: el modelo recibe el estado de la conversación (por ejemplo, un pedido entregado con solicitud de factura) y devuelve una decisión entre criterios predefinidos como invoice o refund, tal como muestra el ejemplo de uso de la model card.
- Enrutamiento de tickets de soporte: dado un texto de incidencia y un conjunto de categorías, el modelo emite una distribución sobre los códigos de decisión, lo que permite umbralizar la confianza y derivar a un agente humano cuando la probabilidad máxima es baja.
- Moderación o triaje binario: las tareas yes_no permiten implementar filtros de aprobación/rechazo sobre contenido o solicitudes, con la ventaja de que el coste de inferencia es de un solo paso.
- Etiquetado multi-etiqueta de documentos: las tareas multi_select permiten asignar varias categorías a la vez sobre un mismo estado textual, útil en pipelines de clasificación documental.
- Evaluación de percepción visual: la torre de visión permite procesar imágenes junto al estado textual para tareas de decisión que requieran contexto visual, con una fidelidad frente al BF16 de 0,984 de similitud coseno media en la sonda vision-probe-v2.
- Cuantificación de preferencias en encuestas o formularios: las tareas scale permiten mapear respuestas textuales a una escala ordinal mediante los códigos de decisión, con la distribución de opciones como señal de incertidumbre.
- Despliegue en infraestructura limitada: al ocupar 5,56 GiB en lugar de 15,64 GiB, el checkpoint cabe en GPUs de consumo con 8 GB o más de VRAM, lo que facilita prototipado local de sistemas de decisión.

## Benchmarks y rendimiento

Los datos disponibles son comparativas de fidelidad entre el checkpoint cuantizado y el BF16 base, no benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K no están disponibles).

| Evaluacion | BF16 base (vllm-sr/d3-flash) | d3-flash-W4A16-HGPTQ |
|---|---:|---:|
| Tamano safetensors (incl. readout) | 15,64 GiB (16.789.656.976 B) | 5,56 GiB (5.970.640.640 B) |
| Concordancia top-1 en decisiones (12 preguntas) | 100,00 % | 100,00 % |
| Divergencia KL de probabilidad de opciones (media / max, nats) | 0,000000 | 0,000086 / 0,000709 |
| Similitud coseno de logits de la cabeza de 255 códigos | 1,000000 | 0,999728 |
| Torre de visión vision-probe-v2 (96 imágenes, 50.596 tokens visuales) | 1,000000 cos sim | 0,984221 media (0,915869 mín.) |
| vision-guard-v2 | no disponible | 0,987428 media (0,935132 mín.) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,56 GiB de pesos más overhead de activaciones y contexto; en la práctica, un margen de 7-8 GiB de VRAM es razonable para el checkpoint cuantizado.
- El checkpoint BF16 original requiere unos 15,64 GiB, por lo que cabría en GPUs de 24 GB (RTX 3090/4090, A10G) con margen.
- GPU recomendadas: el checkpoint cuantizado cabe en GPUs de consumo de 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070); para producción con concurrencia se recomienda A100, H100 o L40S.
- Opciones de despliegue: la model card menciona carga mediante D3.from_pretrained del paquete d3_runtime, Qwen3_5Model.from_pretrained de transformers y warp-34; el formato compressed-tensors es compatible con vLLM y TGI, aunque no se documenta explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión single-pass con cabeza de lectura de códigos) en la documentación proporcionada. La comparación más directa posible es con su propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| d3-flash-W4A16-HGPTQ | 8.392.695.024 | no disponible | Apache 2.0 | safetensors (W4A16) | 5,56 GiB |
| vllm-sr/d3-flash (base) | 8.392.695.024 | no disponible | Apache 2.0 (según este repo) | safetensors (BF16) | 15,64 GiB |

Alternativas de la misma categoría: no disponible.

## Limitaciones y advertencias

- El modelo es un clasificador de decisión de un solo paso, no un modelo generativo: no produce texto libre ni mantiene conversaciones multi-turno.
- La evaluación de calidad se limita a 12 preguntas de decisión y a dos sondas de visión; es una muestra pequeña y no cubre dominios diversos.
- La torre de visión pierde fidelidad de forma apreciable frente al BF16 (similitud coseno mínima de 0,915869 en vision-probe-v2), lo que puede afectar a decisiones que dependan de detalles visuales finos.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas; la ausencia de datos sobre idiomas impide garantizar cobertura multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantización no es el autor del modelo base; conviene verificar la licencia del repositorio original vllm-sr/d3-flash antes de producción.
- El repositorio tiene cero descargas y cero likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.
- El código de carga depende de paquetes no estándar (d3_runtime, warp-34), lo que añade riesgo de mantenimiento e incompatibilidad con el ecosistema estándar.
- No se dispone de información sobre la longitud de contexto soportada, lo que impide planificar el tamaño máximo de estado de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/d3-flash-W4A16-HGPTQ
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
