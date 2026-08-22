# Offlucas/llama-3.1-8b-coder-lora

## Resumen

Este modelo es un adaptador LoRA de 0.4 GB, entrenado mediante ajuste fino supervisado (SFT) sobre el modelo base `mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated`, una versión del Llama 3.1 de 8B con el proceso de "abliteración" aplicado. El autor, Offlucas, lo publicó bajo el nombre interno "out_coder", lo que sugiere una intención de especializar el modelo en tareas de programación, aunque no se proporcionan detalles sobre el conjunto de datos de entrenamiento ni sobre las capacidades específicas resultantes.

La relevancia de este adaptador reside en su tamaño reducido y en el uso de técnicas modernas de fine-tuning (PEFT, TRL, Unsloth) que permiten ajustar un modelo de 8B con un coste computacional bajo. Sin embargo, la documentación es mínima: no hay licencia clara, ni idiomas declarados, ni resultados de evaluación. Por tanto, cualquier uso en producción debe considerarse experimental y requerirá validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Llama 3.1 8B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador pesa 0.4 GB; el modelo base tiene 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base soporta 128k tokens, pero no se confirma) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence" sin valor concreto) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en `mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated`, que a su vez parte del Llama 3.1 8B Instruct de Meta. La "abliteración" es una técnica que elimina o atenúa las negativas del modelo durante el ajuste fino, reduciendo los rechazos y permitiendo respuestas más directas, aunque no se documenta en la model card cómo se aplicó.

El entrenamiento se realizó con SFT (supervised fine-tuning) usando TRL 0.24.0, PEFT 0.20.0, Transformers 5.5.0 y PyTorch 2.11.0. No se especifica el tamaño del dataset, el número de pasos, ni la configuración de hiperparámetros. El nombre "out_coder" sugiere que el conjunto de datos estaba orientado a código, pero no hay evidencia pública.

## Capacidades

- Generación de texto conversacional: el ejemplo de uso en la model card muestra un caso de razonamiento sobre una pregunta de viaje en el tiempo, no código.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de razonamiento multi-paso ni uso como agente.
- No se especifican idiomas; probablemente hereda los del base (principalmente inglés), pero no se confirma.
- No se documentan capacidades especiales (thinking mode, visión, audio, etc.).

## Casos de uso

- Ajuste de un modelo de chat en un dominio específico: dado que es un adaptador LoRA, se puede integrar sobre el base para personalizar respuestas en un corpus privado, por ejemplo, en atención al cliente con preguntas frecuentes.
- Experimentación con abliteración: útil para investigadores que quieran estudiar cómo la eliminación de restricciones del modelo base afecta a la calidad de las respuestas en tareas de razonamiento.
- Prototipado rápido de fine-tuning: por su bajo coste de entrenamiento (LoRA), sirve como ejemplo de cómo aplicar SFT con TRL y Unsloth para crear adaptadores específicos.
- Generación de código asistida en entornos de desarrollo: aunque no se demuestra, la intención del nombre "coder" sugiere que podría usarse como autocompletado o generación de funciones en IDEs, pero requiere validación previa.
- Investigación en interpretabilidad: el modelo base "abliterado" permite estudiar el efecto de la alineación en la generación de texto.
- Pruebas de integración en pipelines de Hugging Face: sirve como ejemplo de un adaptador PEFT cargable con `transformers`, útil para desarrolladores que quieran aprender el flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se pueden comparar métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El adaptador LoRA pesa 0.4 GB, por lo que el requisito principal es el del modelo base (Llama 3.1 8B).
- Para inferencia en FP16, el base necesita aproximadamente 16 GB de VRAM (por ejemplo, una RTX 4090 o A100 16GB).
- Con cuantización (por ejemplo, GGUF en Q4_K_M) el base puede ejecutarse en tarjetas de 8 GB (RTX 3080, RTX 4060 Ti 16GB).
- El adaptador se carga sobre el base, por lo que se puede usar con librerías como `transformers` (con PEFT), `vLLM` (si se integra el adaptador), o `llama.cpp` (convirtiendo a GGUF).
- No hay datos de latencia o throughput disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador para compararlo con alternativas. Como referencia, el modelo base `mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated` es un punto de partida, y otros adaptadores LoRA para código (por ejemplo, `codellama/CodeLlama-7b-hf` o `deepseek-ai/deepseek-coder-6.7b-instruct`) ofrecen benchmarks públicos, pero este modelo no los tiene.

## Limitaciones y advertencias

- No hay información sobre sesgos, aunque el modelo base Llama 3.1 tiene sesgos conocidos (género, idioma) que probablemente se heredan.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo, puede producir respuestas plausibles pero incorrectas, especialmente en código.
- Limitaciones de contexto: no se confirma la longitud de contexto, aunque el base soporta 128K.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin una consulta legal previa. El modelo base de Meta tiene su propia licencia (Llama 3.1 Community License), pero el adaptador no la declara.
- No hay garantías de que el adaptador funcione correctamente para tareas de código; el nombre "coder" es sugestivo pero no está respaldado por datos.
- La abliteración puede reducir el rechazo a contenido dañino, lo que implica un riesgo en entornos de producción.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/Offlucas/llama-3.1-8b-coder-lora)
- [Modelo base: mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated](https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated)
- [Llama 3.1 8B Instruct original](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- [Llama 3.1 8B (base)](https://huggingface.co/meta-llama/Llama-3.1-8B)
- [Model card oficial de Llama 3.1 en GitHub](https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md)
