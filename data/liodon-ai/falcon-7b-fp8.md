# liodon-ai/falcon-7b-FP8

## Resumen

El modelo `liodon-ai/falcon-7b-FP8` es una cuantización en precisión FP8 (punto flotante de 8 bits) del modelo base `tiiuae/falcon-7b`, publicada por Liodon AI, un laboratorio de investigación independiente. Esta versión reduce el tamaño del modelo original de 14,4 GB a 13,8 GB, manteniendo la misma arquitectura y pesos, pero con una representación numérica más compacta que permite una inferencia más rápida y un menor consumo de memoria en hardware compatible.

La cuantización utiliza el esquema `FP8_DYNAMIC` implementado con la librería `llm-compressor` de vLLM: los pesos se convierten a FP8 (formato E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibración, por lo que los pesos cuantizados son una conversión directa de los originales, sin sesgo introducido por datos de calibración. El `lm_head` se deja sin cuantizar, práctica estándar por su tamaño reducido y su impacto desproporcionado en la calidad si se cuantiza.

El modelo está pensado para su uso con motores de inferencia como vLLM, Text Generation Inference (TGI) y SGLang, y requiere GPUs NVIDIA con compute capability ≥ 8.9 (arquitecturas Ada, Hopper o Blackwell) para aprovechar plenamente la aceleración FP8. En GPUs más antiguas, los motores de inferencia dequantizan los pesos y ejecutan en precisión superior, perdiendo la ventaja de velocidad y memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal decoder-only (modelo base Falcon-7b) |
| Parametros totales | 6.921.720.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | FP8 dinámico (E4M3) para pesos, activaciones FP8 dinámicas por token |
| Idiomas soportados | no disponible |
| Licencia | other (TII Falcon LLM License del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del Falcon-7b original, un transformer causal decoder-only desarrollado por TII (Technology Innovation Institute). La cuantización se realizó con `llm-compressor` de vLLM usando el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 (E4M3) por canal de forma estática, y las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. No se utilizó dataset de calibración, por lo que los pesos cuantizados son una conversión directa de los originales, sin sesgo de calibración. El `lm_head` se mantiene sin cuantizar.

No se proporcionan detalles adicionales sobre el entrenamiento del modelo base en la información disponible, como número de tokens, composición del dataset o técnicas de alineación (RLHF/DPO). Estos datos corresponden al modelo original `tiiuae/falcon-7b`, que no se detallan en esta ficha.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que el modelo es capaz de generar texto autocompletado o continuaciones a partir de un prompt.
- Al ser una cuantización del modelo base Falcon-7b, hereda las capacidades de dicho modelo, aunque no se especifican en la información proporcionada.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (thinking, visión, audio) en la documentación disponible.

## Casos de uso

- Despliegue de un modelo de lenguaje de 7B en producción con vLLM: el formato FP8 permite una inferencia más rápida y menor uso de VRAM en GPUs compatibles (Ada/Hopper/Blackwell), lo que reduce costes por petición en entornos de servidor.
- Servicio de generación de texto autocompletado o asistencia a redacción: al ser un modelo base (no instruct), puede usarse para completar texto, generar borradores o como componente en pipelines de generación aumentada por recuperación (RAG).
- Evaluación de técnicas de cuantización: sirve como referencia para comparar el impacto de FP8 dinámico frente a otras precisiones (FP16, INT8, etc.) en el mismo modelo base.
- Integración en aplicaciones de chat o asistentes virtuales mediante TGI o SGLang: el modelo puede servirse a través de estas herramientas con una configuración mínima, como se muestra en la documentación.
- Prototipado rápido en entornos con GPUs de gama media (RTX 40-series, L4/L40S): el tamaño reducido (13,8 GB) permite cargar el modelo en GPUs con 16 GB de VRAM o más, facilitando experimentación local.
- Investigación sobre eficiencia de inferencia: al ser una cuantización sin calibración, es útil para estudiar el comportamiento de FP8 dinámico en modelos de 7B sin necesidad de datasets de calibración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K u otras comparaciones con modelos similares.

## Requisitos de hardware

- Tamaño del modelo cuantizado: 13,8 GB (según la model card). La VRAM necesaria para inferencia será al menos ese tamaño más overhead de activaciones y buffers, por lo que se recomienda una GPU con al menos 16 GB de VRAM para cargar el modelo completo.
- Para ejecución FP8 nativa se requiere una GPU NVIDIA con compute capability ≥ 8.9: RTX 40-series, L4/L40S, H100/H200, B100/B200/GB10.
- En GPUs con compute capability inferior (por ejemplo, RTX 30-series o A100), vLLM/TGI dequantizarán los pesos y ejecutarán en precisión superior, perdiendo la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/falcon-7b-FP8`), TGI (contenedor Docker), SGLang (`python -m sglang.launch_server --model-path liodon-ai/falcon-7b-FP8`).
- No se proporcionan datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. La única referencia disponible es el modelo base `tiiuae/falcon-7b`, del cual esta versión es una cuantización. No se proporcionan datos de rendimiento ni características de otros modelos comparables.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una ligera pérdida de precisión en comparación con el modelo original en FP16/BF16, aunque el esquema dinámico sin calibración minimiza el sesgo.
- El rendimiento óptimo solo se alcanza en GPUs con compute capability ≥ 8.9; en hardware más antiguo, la dequantización elimina las ventajas de velocidad y memoria.
- La licencia es "other" (TII Falcon LLM License), que puede imponer restricciones de uso comercial. Se recomienda revisar los términos de la licencia del modelo base antes de su uso en producción.
- No se especifican los idiomas soportados ni la longitud de contexto en la documentación proporcionada; estos parámetros dependen del modelo base Falcon-7b.
- Al ser un modelo base (no instruct), no está optimizado para seguir instrucciones conversacionales; para tareas de chat o asistencia se requeriría un ajuste fino adicional.
- No se han publicado benchmarks ni evaluaciones de sesgos o alucinaciones para esta versión cuantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/falcon-7b-FP8
- Modelo base: https://huggingface.co/tiiuae/falcon-7b
- Sitio web de Liodon AI: https://liodon.ai/
- Repositorio de llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
