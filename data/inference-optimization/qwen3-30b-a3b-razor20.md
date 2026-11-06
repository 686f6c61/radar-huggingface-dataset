# inference-optimization/Qwen3-30B-A3B-RAZOR20

## Resumen

Qwen3-30B-A3B-RAZOR20 es una variante podada estructuralmente del modelo Qwen3-30B-A3B de Alibaba Qwen, publicada por el usuario `inference-optimization`. La poda se ha aplicado exclusivamente sobre los expertos de las capas MoE: de los 128 expertos por capa del modelo original se conservan 102, eliminando 26 por capa (4896 de 6144 expertos totales, un 20 % menos). El resto de pesos (atención, embeddings y capas densas compartidas) permanece intacto en BF16. El resultado es un checkpoint de 24.640.763.904 parámetros totales (frente a los ~30.500 millones del original), con licencia Apache 2.0 y formato safetensors para `transformers`.

El interés de esta ficha es doble. Por un lado, documenta una técnica de compresión de modelos MoE sin reentrenamiento: RAZOR puntúa cada experto según el daño que causaría su eliminación a la salida enrutada del mixture, usando solo cómputo forward (sin gradientes ni recuperación). Por otro, sirve como caso práctico de reducción de huella de un modelo de razonamiento con modo thinking, orientado a despliegues con restricciones de VRAM donde el modelo completo no encaja con comodidad.

No se han publicado resultados de benchmarks, curvas de degradación por tarea ni detalles del conjunto de calibración en la información disponible. Cualquier evaluación de calidad debe hacerse contra el modelo base antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3 MoE), 48 capas MoE |
| Parametros totales | 24.640.763.904 |
| Parametros activos | no disponible (el modelo base Qwen3-30B-A3B activa ~3B; el valor exacto tras la poda no se ha publicado) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se listan GGUF/AWQ/GPTQ en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Expertos por capa | 102 (de 128 originales; 26 podados por capa) |
| Expertos totales retenidos | 4896 de 6144 (80 %) |
| Tamano del repo | 49,3 GB |
| Libreria | transformers (`qwen3_moe`) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) derivado de Qwen3-30B-A3B. La modificación consiste en una poda estructural de expertos: en cada una de las 48 capas MoE se eliminan los 26 expertos con menor saliencia RAZOR, y los routers se recortan en consecuencia. Los índices de experto se remapean de forma contigua y `config.json` refleja el nuevo recuento (`num_experts: 102`). No hay cambios en atención, embeddings ni capas densas compartidas, que se mantienen en BF16 sin tocar.

La selección de expertos se realiza con RAZOR, un método de puntuación que mide el daño que la eliminación de un experto provocaría en la salida del mixture enrutado. Se ejecuta únicamente con cómputo forward, sin gradientes ni fase de recuperación (recovery training). La herramienta utilizada es `llmcompressor` del proyecto vLLM, que publica un ejemplo específico de poda de expertos con RAZOR. No se documentan en la información disponible el conjunto de calibración, el número de muestras, la composición del dataset ni si hubo ajuste fino posterior a la poda.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-30B-A3B.
- Razonamiento con modo thinking: el modelo base Qwen3 soporta modos de pensamiento explícito; se asume que la poda no elimina esta capacidad, aunque no se ha verificado en la información disponible.
- Generación de código y matemáticas: capacidades del base, sin datos de degradación tras la poda.
- Soporte multilingüe: no disponible en la información proporcionada (los idiomas del modelo base no se detallan en esta ficha).
- Tool calling / function calling: capacidad del base Qwen3, no verificada tras la poda.
- Uso en agentes y razonamiento multi-paso: derivado del base, sin evaluación publicada.
- No se documentan capacidades de visión ni audio en este checkpoint (es text-generation).

## Casos de uso

- Despliegue en GPUs de 48 GB: con 24,6B parámetros en BF16 el checkpoint ocupa aproximadamente 49 GB, por lo que encaja ajustadamente en una A6000/L40S de 48 GB con cuantización o en una A100 80 GB en BF16. Útil cuando el Qwen3-30B-A3B original no cabe con margen.
- Servicio de chat con MoE podado: al reducir el número de expertos por capa se reduce el tráfico de pesos por token en inferencia, lo que puede mejorar el throughput en vLLM frente al modelo completo; requiere medición propia.
- Investigación en compresión de modelos: sirve como referencia reproducible de poda RAZOR aplicada a un MoE de 48 capas, con scripts de calibración enlazados en el repo de llmcompressor.
- Fine-tuning ligero sobre dominio: al conservar atención y capas densas intactas, es un punto de partida razonable para LoRA/QLoRA sobre tareas específicas, con menor huella que el base.
- Evaluación comparativa de degradación: permite medir empíricamente cuánto pierde un MoE al eliminar el 20 % de expertos menos salientes en tareas como MMLU, GSM8K o HumanEval, dato que el autor no publica.
- Prototipado de asistentes con tool calling: el modelo base soporta function calling; este checkpoint permite probar pipelines de agentes en hardware más modesto, validando antes de migrar al modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas de perplejidad frente al Qwen3-30B-A3B original. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM en BF16: ~49 GB solo para pesos, más KV cache y overhead; requiere A100 80 GB, H100 80 GB o dos GPUs de 48 GB con tensor parallelism.
- VRAM en cuantización 8 bits (si se genera con llmcompressor/AWQ): ~25 GB, viable en RTX 4090 24 GB con ajuste fino o en L40S/A6000.
- VRAM en cuantización 4 bits (GPTQ/AWQ): ~13-15 GB, cabe en RTX 4090, RTX 3090 y RTX 4080 de 16 GB con margen limitado.
- Consumer GPU: sí, con cuantización 4 bits; en BF16 no cabe en ninguna GPU de consumo actual.
- Despliegue: `transformers` (soporte nativo `qwen3_moe`), vLLM (recomendado para MoE y compatible con llmcompressor), TGI y llama.cpp/Ollama solo si se generan GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos/capa | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-RAZOR20 | 24,64B | 102 | no disponible | Apache 2.0 | Poda RAZOR del 20 % de expertos, sin recovery training |
| Qwen/Qwen3-30B-A3B | ~30,5B | 128 | no disponible en esta ficha | Apache 2.0 | Modelo base original, sin poda |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparativa directa con otros MoE podados (por ejemplo, variantes de Qwen1.5-MoE o Mixtral con expert pruning) no se puede completar con los datos disponibles.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay benchmarks que cuantifiquen la pérdida de calidad tras eliminar el 20 % de expertos; la degradación puede ser desigual por tarea e idioma.
- Poda sin recuperación: al no haber recovery training ni fine-tuning posterior, es esperable cierta pérdida en tareas que dependían de los expertos eliminados; no verificable con los datos aportados.
- Repo con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria.
- Idiomas no declarados: no se puede confirmar el soporte multilingüe del checkpoint podado.
- Contexto no declarado: no se confirma la ventana de contexto efectiva tras la poda (el base Qwen3 soporta contexto largo, pero este dato no está en la información).
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación específica para este checkpoint.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base y de los datos de entrenamiento originales.
- Formato: solo safetensors BF16; no hay GGUF ni cuantizaciones publicadas, lo que obliga a generarlas localmente para despliegue en consumer GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inference-optimization/Qwen3-30B-A3B-RAZOR20
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Licencia del base: https://huggingface.co/Qwen/Qwen3-30B-A3B/blob/main/LICENSE
- llmcompressor: https://github.com/vllm-project/llmcompressor
- Ejemplo de poda de expertos con RAZOR: https://github.com/vllm-project/llmcompressor/tree/main/examples/razor_expert_pruning
