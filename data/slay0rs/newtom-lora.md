# slay0rs/newtom-lora

## Resumen

`slay0rs/newtom-lora` es un adaptador LoRA (Low-Rank Adaptation) para el modelo base `Goekdeniz-Guelmez/Josiefied-Qwen2.5-Coder-14B-Instruct-abliterated-v1`, una variante "abliterated" (sin censura) de Qwen2.5-Coder-14B-Instruct. El adaptador fue desarrollado por el usuario `slay0rs` y está publicado en HuggingFace con la librería PEFT, lo que indica que se trata de un ajuste fino de tipo SFT (supervised fine-tuning) aplicado sobre el modelo base. El repositorio tiene un tamaño de 1.7 GB, consistente con un adaptador LoRA de dimensiones considerables, aunque no se especifican los hiperparámetros exactos.

La relevancia de este modelo radica en que permite adaptar un modelo de generación de código de 14B parámetros a un estilo o dominio concreto mediante un ajuste eficiente de parámetros, sin necesidad de reentrenar el modelo completo. Sin embargo, la documentación es prácticamente inexistente: la model card no contiene información sobre el propósito, los datos de entrenamiento, la licencia ni los idiomas soportados. Esto limita seriamente su uso en producción sin una evaluación previa por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen2.5-Coder-14B-Instruct-abliterated-v1 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda del modelo base, típicamente 128k tokens en Qwen2.5-Coder-14B-Instruct, pero sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, una técnica de ajuste eficiente que introduce matrices de baja dimensión en las capas del modelo base, reduciendo drásticamente el número de parámetros entrenables. El modelo base es `Goekdeniz-Guelmez/Josiefied-Qwen2.5-Coder-14B-Instruct-abliterated-v1`, una versión "abliterated" de Qwen2.5-Coder-14B-Instruct, lo que implica que se han eliminado o atenuado los mecanismos de rechazo y censura del modelo original. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando las librerías TRL, PEFT y Unsloth, según los tags del repositorio. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento, la configuración de hiperparámetros (learning rate, batch size, épocas) ni el hardware empleado.

## Capacidades

- Generación de texto: al ser un adaptador sobre un modelo de instrucciones, puede generar respuestas en formato conversacional.
- Generación de código: el modelo base es Qwen2.5-Coder, especializado en tareas de programación, por lo que el adaptador hereda estas capacidades, aunque no hay confirmación de que el ajuste las preserve o modifique.
- Razonamiento y matemáticas: el modelo base tiene buen rendimiento en estas áreas, pero no hay datos específicos del adaptador.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no se documentan.

## Casos de uso

No se han documentado casos de uso específicos para este adaptador. Dado que se basa en un modelo de código "abliterated", podrían plantearse escenarios hipotéticos como:

- Generación de código sin restricciones de seguridad: el modelo base sin censura podría emplearse en entornos de investigación donde se requiera explorar código potencialmente dañino, aunque esto conlleva riesgos éticos y legales.
- Adaptación a un estilo de programación concreto: un LoRA podría ajustarse a convenciones de código de una empresa, pero no hay evidencia de que este adaptador esté entrenado para ello.
- Experimentación con modelos abliterated: útil para estudiar el impacto de la eliminación de censura en modelos de código.

En cualquier caso, la ausencia de documentación impide recomendar su uso en aplicaciones reales sin una validación exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Al ser un adaptador LoRA, el peso adicional es de 1.7 GB, pero para ejecutar el modelo completo se necesita cargar el modelo base de 14B parámetros. Los requisitos estimados son:

- VRAM estimada para inferencia: el modelo base en FP16 requiere aproximadamente 28 GB de VRAM. Con cuantización de 8 bits se reduce a ~14 GB, y en 4 bits a ~7-8 GB. El adaptador añade una pequeña sobrecarga.
- GPU recomendadas: para FP16, una A100 40GB o H100; para 8 bits, una RTX 4090 (24 GB) o A10; para 4 bits, una RTX 3090/4090.
- Compatibilidad con GPUs de consumo: sí, si se utiliza cuantización (GGUF o bitsandbytes) y el adaptador se fusiona con el base.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI, o directamente con transformers y PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado comparativas con otros adaptadores LoRA similares en la información proporcionada.

## Limitaciones y advertencias

- Documentación inexistente: la model card no proporciona detalles sobre entrenamiento, datos, licencia o uso previsto.
- Licencia desconocida: no se especifica la licencia del adaptador ni del modelo base, lo que impide su uso comercial sin verificación legal.
- Modelo base "abliterated": el modelo base ha sido modificado para eliminar censura, lo que puede generar contenido inapropiado, ofensivo o peligroso. No hay garantías de seguridad.
- Sesgos y alucinaciones: al no haber evaluación publicada, se desconocen los sesgos específicos y la tasa de alucinación.
- Riesgo de sobreajuste: al ser un adaptador sin datos de entrenamiento documentados, podría estar sobreajustado a un dominio muy específico y perder generalidad.
- No apto para producción sin validación: la falta de benchmarks y documentación hace que cualquier uso en entornos productivos sea arriesgado.

## Enlaces

- [HuggingFace: slay0rs/newtom-lora](https://huggingface.co/slay0rs/newtom-lora)
- [Modelo base: Goekdeniz-Guelmez/Josiefied-Qwen2.5-Coder-14B-Instruct-abliterated-v1](https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen2.5-Coder-14B-Instruct-abliterated-v1)
