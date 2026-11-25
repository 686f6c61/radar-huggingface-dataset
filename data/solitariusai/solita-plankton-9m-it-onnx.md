# solitariusai/solita-plankton-9m-it-onnx

## Resumen

Solita Plankton 9M-IT ONNX es la exportación a formato ONNX (opset 17, precisión FP32) del checkpoint conversacional Solita Plankton 9M-IT, desarrollado por solitariusai. Se trata de un modelo de generación de texto de muy pequeño tamaño, con aproximadamente 9 millones de parámetros, especializado en tailandés y orientado a tareas conversacionales. Su vocabulario de salida es de 16.389 tokens (dimensión del vector de logits), lo que da una idea de un tokenizador compacto y específico del idioma.

La relevancia de esta publicación no reside en su capacidad bruta, sino en su formato: al estar exportado a ONNX, puede ejecutarse con `onnxruntime` en CPU sin dependencias de frameworks de deep learning pesados, lo que lo hace apto para entornos embebidos, pruebas de concepto, docencia o despliegues de latencia mínima en dispositivos sin GPU. El repositorio ocupa apenas 0,1 GB.

El modelo acepta secuencias de 1 a 13.952 tokens sin padding y, según la model card, requiere pasar la secuencia completa en cada paso de decodificación (no gestiona caché KV de forma explícita en la interfaz descrita). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles no disponibles) |
| Parametros totales | ~9 millones (indicado por el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 13.952 tokens (secuencias sin padding) |
| Tipos de cuantizacion | FP32 en esta exportación; el checkpoint base podría admitir otras, no disponible |
| Idiomas soportados | tailandés (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17, FP32) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de generación de texto con entrada `input_ids` (`int64`, `[batch, sequence]`) y salida `logits` (`float32`, `[batch, 16389]`). El tamaño de 9 millones de parámetros y la dimensión de vocabulario de 16.389 tokens sugieren un transformer decoder-only de escala muy reducida, probablemente con pocas capas y dimensión oculta pequeña, aunque no se confirman estos extremos.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El sufijo "IT" indica instruction tuning, y la existencia de una plantilla de chat (`chat_template.jinja`) con roles de sistema, usuario y asistente confirma que el modelo fue ajustado para seguir instrucciones conversacionales en tailandés. La exportación a ONNX se realizó con opset 17 y precisión FP32.

## Capacidades

- Generación de texto conversacional en tailandés, con soporte de roles de sistema, usuario y asistente mediante plantilla Jinja.
- Seguimiento de instrucciones básicas (instruction tuning), orientado a respuestas claras, correctas y educadas según el prompt de sistema de ejemplo.
- Generación autoregresiva token a token con control explícito del vocabulario bloqueado (tokens especiales como `<pad>`, `<bos>`, `<eos>`, `<|system|>`, `<|user|>`, `<|assistant|>`).
- Parada controlada mediante el token de fin de turno `<|eot|>`.
- Ejecución en CPU mediante `onnxruntime` sin necesidad de GPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni matemáticas avanzadas.

## Casos de uso

- Prototipado de chatbots en tailandés: el modelo puede gestionar conversaciones multi-turno sencillas reconstruyendo el prompt completo con la plantilla de chat en cada paso, adecuado para validar flujos conversacionales antes de migrar a modelos mayores.
- Despliegue en dispositivos embebidos o de recursos limitados: al ejecutarse en CPU con ONNX Runtime y ocupar 0,1 GB, puede integrarse en aplicaciones de borde, Raspberry Pi o contenedores ligeros donde no hay GPU disponible.
- Docencia y experimentación con modelos de lenguaje: su tamaño reducido y su exportación ONNX permiten estudiar el ciclo completo de tokenización, generación autoregresiva y decodificación greedy con código mínimo.
- Pruebas de integración de pipelines ONNX: sirve como modelo de referencia para validar infraestructura de inferencia basada en `onnxruntime` antes de desplegar modelos de mayor escala.
- Generación de respuestas cortas en aplicaciones de mensajería en tailandés: con un límite de generación controlado (por ejemplo, 24 tokens como en el ejemplo de la model card), puede producir respuestas breves y directas.
- Filtrado o clasificación ligera de texto tailandés: aunque no está entrenado específicamente para ello, su naturaleza generativa permite usarlo en tareas de completado o reformulación simple en entornos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; en GPU, el modelo FP32 de ~9M parámetros ocupa del orden de decenas de megabytes, por lo que cabría en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1050, RTX 3060, RTX 4090) es sobradamente suficiente; también funciona en CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales e incluso en iGPU.
- Opciones de despliegue: `onnxruntime` (CPU o GPU), con dependencias de `tokenizers` y `jinja2`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que en cada paso de decodificación se debe pasar la secuencia completa, lo que implica un coste de inferencia que crece con la longitud del contexto y limita el throughput en conversaciones largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Solita Plankton 9M-IT ONNX | ~9M | 13.952 tokens | th | Apache 2.0 | ONNX |
| Qwen2.5-0.5B | ~500M | 32.768 tokens | multilingüe | Apache 2.0 | safetensors, GGUF |
| SmolLM2-135M | ~135M | 8.192 tokens | inglés principalmente | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | ~1.1B | 2.048 tokens | inglés | Apache 2.0 | safetensors, GGUF |

La comparativa es orientativa: no se dispone de benchmarks del modelo de solitariusai que permitan contrastar rendimiento con estas alternativas. Solita Plankton 9M-IT destaca por su tamaño extremadamente reducido y su especialización en tailandés, mientras que los modelos citados ofrecen mayor capacidad general y contextos distintos, a costa de un tamaño entre 15 y 120 veces superior.

## Limitaciones y advertencias

- Modelo de 9 millones de parámetros: la capacidad de razonamiento, conocimiento factual y coherencia en conversaciones largas es muy limitada en comparación con modelos de mayor escala.
- Riesgo elevado de alucinación y de respuestas incoherentes, especialmente fuera de dominios vistos durante el entrenamiento.
- Especializado exclusivamente en tailandés; no se garantiza un comportamiento correcto en otros idiomas.
- La interfaz de inferencia descrita no gestiona caché KV: se debe pasar la secuencia completa en cada paso, lo que penaliza la latencia en contextos largos.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos no especificados, puede reflejar sesgos presentes en ellos.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de benchmarks y de documentación sobre el entrenamiento dificulta evaluar su idoneidad en producción.
- La fecha de creación del repositorio (2026-11-25) y la ausencia de descargas o likes indican que se trata de una publicación muy reciente y sin validación comunitaria.

## Enlaces

- [Hugging Face: solitariusai/solita-plankton-9m-it-onnx](https://huggingface.co/solitariusai/solita-plankton-9m-it-onnx)
- [Modelo base: solitariusai/solita-plankton-9m-it](https://huggingface.co/solitariusai/solita-plankton-9m-it)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
