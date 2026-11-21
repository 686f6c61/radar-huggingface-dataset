# Mose-Satoru/botpsy-0.8b-onnx

## Resumen

BotPsy-0.8B ONNX es una conversión al formato ONNX del modelo BotPsy-0.8B, desarrollado por TetherAIResearch y convertido por el usuario Mose-Satoru. El modelo base parte de la arquitectura Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parámetros, y esta versión está específicamente optimizada para inferencia en navegador mediante onnxruntime-web, con pesos cuantizados a 4 bits (formato q4f16) y embeddings en fp16.

La conversión mantiene el layout de la familia Qwen3.5-0.8B en ONNX y está pensada para ejecutarse en entornos WASM, lo que permite desplegar el modelo del lado del cliente sin necesidad de infraestructura de servidor GPU. Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a desarrolladores que necesitan inferencia local en navegador con requisitos de memoria muy reducidos.

Una limitación importante documentada por el autor es que cada pasada forward procesa como máximo 64 tokens, por lo que las aplicaciones deben implementar prefill por fragmentos (chunks de 32 tokens verificados) arrastrando el estado KV, convolucional y recurrente entre fragmentos. El modelo es solo de texto: el codificador de visión no está incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-0.8B), exportado a ONNX |
| Parametros totales | 0,8 mil millones (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (decoder a 4 bits), fp16 (embeddings) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`decoder_model_merged_q4f16.onnx`, `embed_tokens_fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo base BotPsy-0.8B deriva de Qwen3.5-0.8B, un transformer denso de aproximadamente 0,8 mil millones de parámetros. La model card de esta conversión no aporta detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO en el modelo base. Tampoco se especifican innovaciones arquitectónicas más allá de las propias de la familia Qwen3.5.

La conversión a ONNX introduce dos particularidades técnicas relevantes: el decoder se exporta como un grafo fusionado (`decoder_model_merged_q4f16.onnx`) cuantizado a 4 bits con activaciones fp16, y los embeddings se mantienen en fp16. El autor indica que la conversión fue verificada contra la referencia en PyTorch mediante coincidencia de argmax tanto en ORT CPU como en onnxruntime-web WASM el 15 de noviembre de 2026. La restricción de 64 tokens por pasada forward obliga a implementar prefill fragmentado con propagación de estado (KV, convolucional y recurrente) entre chunks.

## Capacidades

- Generación de texto autoregresiva en formato ONNX, ejecutable en CPU y en navegador vía WASM.
- Inferencia del lado del cliente sin servidor, gracias al formato ONNX y la cuantización q4f16.
- Soporte de estado KV, convolucional y recurrente entre fragmentos de prefill (chunks de 32 tokens verificados).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión: no incluida (el codificador de visión no forma parte de esta conversión).
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia en navegador sin backend: el modelo puede desplegarse íntegramente en el cliente mediante onnxruntime-web WASM, eliminando la necesidad de servidores GPU y permitiendo aplicaciones web con privacidad de datos por diseño.
- Asistentes de texto embebidos en aplicaciones web: con un tamaño de repo de 1,0 GB y cuantización q4f16, es viable cargar el modelo en sesiones de navegador para generación de texto conversacional de baja latencia.
- Prototipado y demos interactivas: útil para validar flujos de generación de texto en el navegador antes de invertir en infraestructura de servidor, gracias a la verificación del autor contra la referencia PyTorch.
- Procesamiento de texto por lotes en CPU: la exportación ONNX permite ejecutar inferencia en CPU con ORT, adecuada para tareas de generación de texto de corta longitud donde no se dispone de GPU.
- Educación y experimentación con cuantización: sirve como caso de estudio de conversión de un transformer de 0,8B a ONNX q4f16 con prefill fragmentado y gestión de estado entre chunks.
- Aplicaciones de escritorio o edge con ONNX Runtime: el grafo ONNX puede integrarse en runtimes nativos de escritorio o dispositivos edge que soporten ONNX Runtime, con requisitos de memoria reducidos por la cuantización a 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 1,0 GB y el decoder está cuantizado a 4 bits con embeddings fp16, por lo que la huella en memoria es reducida (del orden de cientos de MB a ~1 GB según el runtime).
- GPU recomendadas: no disponible en la información proporcionada; el modelo está orientado a CPU y a onnxruntime-web WASM.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el foco declarado es inferencia en navegador y CPU.
- Opciones de despliegue: onnxruntime-web (WASM) y ONNX Runtime (CPU verificado por el autor).
- Latencia y throughput: no disponibles; el autor solo confirma coincidencia de argmax en ORT CPU y onnxruntime-web WASM.
- Restricción operativa: máximo 64 tokens por pasada forward, con prefill fragmentado en chunks de 32 tokens y propagación de estado KV, convolucional y recurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BotPsy-0.8B ONNX (este) | ~0,8B | no disponible | ONNX q4f16 | Apache 2.0 | Solo texto, orientado a navegador, prefill fragmentado |
| BotPsy-0.8B (base, PyTorch) | ~0,8B | no disponible | PyTorch | no disponible | Modelo de referencia original de TetherAIResearch |
| Qwen3.5-0.8B | ~0,8B | no disponible | safetensors / varios | no disponible | Arquitectura base de la que deriva BotPsy |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Restricción de 64 tokens por pasada forward: obliga a implementar prefill fragmentado con propagación de estado; un uso ingenuo del grafo producirá resultados incorrectos en secuencias largas.
- Solo texto: el codificador de visión no está incluido, por lo que no puede procesar imágenes.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe sin evaluación adicional.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.).
- Modelo de nicho con cero descargas y cero likes: no hay validación comunitaria ni reportes de uso en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no se documentan medidas de mitigación específicas.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base BotPsy-0.8B de TetherAIResearch, que no se detalla en la información proporcionada.
- Conversión verificada solo por argmax: no se documentan métricas de perplejidad ni evaluaciones cualitativas tras la cuantización q4f16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mose-Satoru/botpsy-0.8b-onnx
- Modelo base: https://huggingface.co/TetherAIResearch/BotPsy-0.8B
- Repositorio de onnxruntime-web: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
