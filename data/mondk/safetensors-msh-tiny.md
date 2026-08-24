# mondk/Safetensors.msh-tiny

## Resumen

El modelo `Safetensors.msh-tiny` es un pequeño modelo de chat de aproximadamente 14 millones de parámetros, desarrollado por el usuario mondk y publicado en HuggingFace. Está basado en la arquitectura GPT-2 y ha sido entrenado completamente desde cero, sin partir de ningún modelo preentrenado, incluyendo un tokenizer BPE personalizado. Su propósito principal es educativo: demostrar que es posible entrenar un modelo de lenguaje funcional con recursos limitados y servir como base para experimentación.

Aunque el modelo es capaz de mantener un formato de conversación coherente gracias a su entrenamiento con datasets de instrucciones y chat, sus conocimientos son limitados e inconsistentes, y puede generar respuestas incoherentes. No está diseñado para uso en producción, sino como una pieza de aprendizaje y un punto de partida para quienes quieran explorar el entrenamiento de modelos desde cero. La licencia Apache 2.0 permite su uso y modificación libre, incluso con fines comerciales, aunque con las limitaciones propias de su tamaño y calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformador causal) |
| Parametros totales | 13.891.584 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existe versión GGUF en otro repositorio) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también GGUF en `mondk/GGUF.msh-tiny`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer causal estándar para generación de texto. Se entrenó desde una inicialización aleatoria, sin usar ningún modelo base preentrenado, y se convirtió posteriormente a un `GPT2LMHeadModel` para garantizar compatibilidad con el ecosistema de Transformers. El tokenizer también fue entrenado desde cero con un enfoque BPE personalizado.

Los datos de entrenamiento combinan tres datasets públicos de instrucciones y chat —`tatsu-lab/alpaca`, `teknium/OpenHermes-2.5` y `HuggingFaceH4/no_robots`— junto con un pequeño conjunto escrito a mano de conversaciones cotidianas (saludos, agradecimientos, charla informal). No se menciona el número total de tokens ni el uso de técnicas como RLHF o DPO. El entrenamiento se realizó con recursos de cómputo limitados, lo que explica las limitaciones de calidad del modelo.

## Capacidades

- Generación de texto en inglés con formato de chat definido por los tokens `<|user|>`, `<|assistant|>` y `<|end|>`.
- Mantiene conversaciones multi-turno simples, aunque con respuestas a menudo incoherentes o con conocimiento factual limitado.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio, etc.).
- Su uso está restringido al inglés; no se ha entrenado para otros idiomas.
- Al ser un modelo pequeño, su capacidad de razonamiento y comprensión es muy básica, adecuada solo para demostraciones y experimentos.

## Casos de uso

- **Aprendizaje y educación**: ideal para estudiantes que quieran entender cómo se entrena un modelo de lenguaje desde cero, incluyendo el proceso de tokenización, entrenamiento y conversión a un formato estándar.
- **Prototipado rápido**: sirve para probar pipelines de generación de texto o integraciones con la librería Transformers sin necesidad de grandes recursos de hardware.
- **Pruebas de concepto**: puede utilizarse para validar ideas de interfaz de chat o sistemas de prompt engineering antes de migrar a modelos más capaces.
- **Investigación académica**: útil como baseline en estudios sobre modelos pequeños, eficiencia de entrenamiento o comparación de arquitecturas.
- **Generación de datos sintéticos**: aunque limitado, puede generar texto de ejemplo para entrenar otros modelos o para pruebas de aumento de datos.
- **Demostraciones en talleres o charlas**: su pequeño tamaño permite ejecutarlo en portátiles o CPUs, facilitando demostraciones en vivo de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K, y no hay comparaciones con otros modelos en la model card.

## Requisitos de hardware

- **VRAM estimada**: al tener solo ~14M de parámetros, el modelo ocupa aproximadamente 56 MB en FP32 y 28 MB en FP16. Cabe en cualquier GPU moderna, incluso en las más básicas, y también puede ejecutarse en CPU sin problemas.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una GPU integrada o una CPU estándar pueden ejecutar el modelo con baja latencia.
- **Compatibilidad con consumer GPU**: sí, cualquier GPU de consumo actual (por ejemplo, RTX 3060 o superior) lo ejecuta con soltura.
- **Opciones de despliegue**: se puede usar directamente con la librería Transformers de HuggingFace, o mediante llama.cpp y Ollama si se utiliza la versión GGUF disponible en `mondk/GGUF.msh-tiny`. También es compatible con servidores de inferencia como text-generation-inference (TGI) y vLLM, aunque su tamaño hace que estas opciones sean sobredimensionadas.
- **Latencia y throughput**: no se han publicado mediciones oficiales, pero dado el tamaño, la generación de texto es prácticamente instantánea en hardware moderno, incluso en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de tamaño similar. El autor no publica benchmarks ni comparaciones. Como referencia, modelos como GPT-2 small (124M) o TinyLlama (1.1B) son significativamente más grandes y capaces, pero no son comparables en cuanto a propósito educativo y entrenamiento desde cero. Se puede considerar que este modelo ocupa un nicho muy específico de demostración y aprendizaje, sin competidores directos en el mismo rango de parámetros y con la misma filosofía de entrenamiento.

## Limitaciones y advertencias

- **Conocimiento limitado e inconsistente**: entrenado con una cantidad modesta de datos, el modelo muestra lagunas de conocimiento y respuestas a menudo incoherentes o fuera de contexto.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede inventar información, pero en este caso la probabilidad es mayor debido a su pequeño tamaño y entrenamiento limitado.
- **Solo inglés**: no se ha entrenado para otros idiomas, por lo que su uso en español u otros idiomas producirá resultados deficientes.
- **No apto para producción**: el propio autor lo describe como un proyecto educativo, no como un asistente de calidad. No debe utilizarse en aplicaciones reales que requieran fiabilidad.
- **Formato de prompt específico**: requiere el formato `<|user|>...<|assistant|>` y detiene la generación en `<|end|>`. No se ha probado con otros formatos.
- **Licencia**: aunque la licencia Apache 2.0 permite uso comercial, las limitaciones técnicas hacen desaconsejable su uso en entornos productivos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mondk/Safetensors.msh-tiny)
- [Versión GGUF del modelo](https://huggingface.co/mondk/GGUF.msh-tiny)
- [Repositorio de safetensors (formato de pesos)](https://github.com/safetensors/safetensors)
