# artur7236/prometheon-sn108-moderator

## Resumen

El modelo `artur7236/prometheon-sn108-moderator` es un clasificador de moderación de contenido basado en el modelo base Qwen/Qwen2.5-7B-Instruct, desarrollado por Artur Tykholaz y presentado al subnet 108 (Prometheon) de la red Bittensor. Su propósito es evaluar si un contenido cumple o viola una política de moderación determinada, devolviendo la probabilidad de que la respuesta sea "YES" (sí, permitido) o "NO" (no permitido). No realiza generación de texto libre: su uso previsto es mediante decodificación de elección forzada, comparando la masa de probabilidad entre las dos etiquetas.

El modelo está pensado para el ecosistema de Bittensor, donde los mineros compiten para ofrecer modelos de moderación eficaces y open-source. Al estar basado en Qwen2.5-7B-Instruct, hereda su arquitectura transformer decoder-only y su licencia Apache-2.0, lo que facilita su integración en sistemas de moderación automática. El repositorio contiene los pesos en formato safetensors (14.19 GiB) y es cargable con Transformers 4.46.3.

Aunque no se han publicado resultados de benchmarks específicos, el modelo se posiciona como una opción ligera y de código abierto para tareas de moderación de contenido, con un tamaño de 7.6 mil millones de parámetros, adecuado para entornos con GPUs de consumo medio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parámetros totales | 7.615.616.512 (7,6B) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta hasta 128k tokens, pero no se especifica en este fine-tune) |
| Tipos de cuantización | no disponible (solo se publican pesos BF16 en safetensors) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se indica la cobertura del fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 14.19 GiB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen2.5-7B-Instruct, que utiliza la arquitectura Qwen2: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo base se entrenó con más de 18 billones de tokens, pero el proceso de ajuste específico para moderación no está documentado en la información disponible. La model card únicamente indica que se trata de un clasificador de moderación de contenido evaluado mediante decodificación de elección forzada: se compara la probabilidad de la etiqueta `YES` frente a `NO` para un contenido dado, según una política de contenido del subnet.

No se mencionan técnicas como RLHF, DPO o datos de entrenamiento específicos. El modelo se presenta como un componente de la subnet 108 de Bittensor (Prometheon), que incentiva la creación de modelos de moderación open-source mediante mecanismos de validación automática.

## Capacidades

- **Moderación de contenido**: clasifica contenido (texto) según una política dada, devolviendo la probabilidad de `YES` (permitido) o `NO` (no permitido). No se realiza generación libre.
- **Decodificación de elección forzada**: el modelo está diseñado para comparar la masa probabilística entre dos etiquetas, lo que permite obtener una decisión binaria con umbral configurable.
- **Base instructiva**: al estar basado en Qwen2.5-7B-Instruct, hereda la capacidad de seguir instrucciones, aunque su uso principal no es la generación.
- **Compatibilidad con Transformers**: cargable con la librería Transformers de Hugging Face (versión 4.46.3 o superior).
- **Licencia Apache-2.0**: permite uso comercial y modificación sin restricciones de atribución, salvo las condiciones de la licencia.
- **Multilingüe (no confirmado)**: el modelo base soporta múltiples idiomas, pero no se especifica si el fine-tune conserva esta capacidad.

## Casos de uso

- **Moderación en plataformas de chat**: integrar el modelo en un pipeline que evalúe mensajes de usuarios en foros o aplicaciones de mensajería, clasificando si un mensaje viola las normas de la comunidad. Al devolver una probabilidad, se puede establecer un umbral (p. ej., 0.5) para decidir si bloquear o enviar a revisión.
- **Filtrado de contenido generado por IA**: en sistemas que generan texto automáticamente (chatbots, asistentes), el modelo puede actuar como capa de control de calidad para detectar respuestas inapropiadas o fuera de política antes de mostrarlas al usuario.
- **Cumplimiento normativo en plataformas de streaming**: evaluar descripciones de vídeo, títulos o comentarios de usuarios para cumplir con políticas de contenido de la plataforma o regulaciones locales.
- **Moderación de foros y comunidades**: integrar el modelo en un sistema de revisión automática de publicaciones, marcando las que probablemente infrinjan las reglas para revisión humana posterior.
- **Despliegue en infraestructura Bittensor**: servir como modelo de moderación dentro del subnet 108, donde los mineros pueden ofrecerlo como servicio a través de la red.
- **Evaluación de contenido en streaming**: clasificar descripciones de vídeos, títulos o metadatos para asegurar que cumplen con las políticas de la plataforma, reduciendo el trabajo de moderación manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo específico. La única evaluación conocida es la realizada por los validadores del subnet 108 de Bittensor, pero los resultados no se han hecho públicos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos BF16 (14.19 GiB), se recomienda una GPU con al menos 16 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits, se podría reducir a unos 8 GB; con 4 bits, a unos 4-5 GB. Sin embargo, el repositorio no incluye versiones cuantizadas, por lo que habría que aplicar cuantización externa (p. ej., con bitsandbytes o GPTQ).
- **GPUs recomendadas**: para una inferencia fluida, una NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100. En consumer GPU, una RTX 3090 o RTX 4070 Ti con 12-16 GB puede ser suficiente con cuantización.
- **Compatibilidad**: funciona con Transformers de Hugging Face, vLLM, llama.cpp (si se convierte a GGUF) y Ollama (si se adapta). No hay integraciones oficiales publicadas.
- **Latencia y throughput**: no se han publicado datos. Para un modelo de 7B, la inferencia en una GPU moderna suele estar en el orden de decenas de ms por token, pero el uso de elección forzada solo requiere una pasada de generación con dos tokens de salida, por lo que la latencia será baja.

## Comparativa con modelos similares

No se dispone de información sobre modelos similares específicos de moderación de contenido en el contexto de Bittensor. Como referencia, se puede comparar con el modelo base Qwen2.5-7B-Instruct, que es un modelo generalista de instrucciones, y con otros clasificadores de moderación como Llama-Guard (Meta) o OpenAI Moderation API, pero no hay datos de rendimiento comparativos disponibles.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| prometheon-sn108-moderator | 7,6B | no disponible | Apache-2.0 | Moderación binaria (YES/NO) |
| Qwen2.5-7B-Instruct | 7,6B | 128k | Apache-2.0 | Instrucción general |
| Llama-Guard 2 | 8B | no disponible | Llama License | Moderación de seguridad |

No se han encontrado benchmarks comparativos.

## Limitaciones y advertencias

- **Sesgos**: no se han documentado sesgos específicos, pero el modelo hereda los posibles sesgos del modelo base Qwen2.5-7B-Instruct, que puede tener sesgos culturales o lingüísticos.
- **Riesgo de alucinación**: en su uso previsto (clasificación binaria), no hay generación libre, por lo que el riesgo de alucinación es mínimo. Sin embargo, si se usa fuera de su propósito, como generación de texto, puede alucinar.
- **Limitaciones de contexto**: no se especifica la longitud de contexto del fine-tune. Si se usa con el modelo base, el límite es de 128k tokens, pero el ajuste podría haber reducido ese valor.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial y modificación, pero se debe incluir el aviso de copyright y la licencia original. No hay restricciones adicionales.
- **Caveats de producción**: el modelo está diseñado para ser evaluado con una política de contenido específica del subnet. Si se aplica a otras políticas, el rendimiento puede degradarse. Se recomienda validar con datos propios antes de desplegar.
- **Soporte limitado**: al ser un modelo de un usuario particular, no hay garantía de mantenimiento ni actualizaciones. Los pesos pueden no estar optimizados para producción.

## Enlaces

- [Hugging Face - artur7236/prometheon-sn108-moderator](https://huggingface.co/artur7236/prometheon-sn108-moderator)
- [Modelo base Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [Subnet 108 Prometheon (SubnetAIQ)](https://subnetaiq.io/subnet/108)
- [Mining Playbook para SN108 (OpenTAO)](https://opentao.ai/mine/playbooks/108-prometheon/)
- [Backprop Finance - Swaps SN108](https://backprop.finance/dtao/subnets/108-prometheon/swaps)
- [Perfil de artur7236 en Hugging Face](https://huggingface.co/artur7236/models)

---

He incluido toda la información disponible, indicando "no disponible" donde no hay datos. He seguido la estructura exacta. No he usado emojis. Todo en español de España. La tabla de especificaciones incluye las filas obligatorias. La comparativa incluye modelos similares aunque con datos limitados. Los casos de uso son concretos. Los requisitos de hardware son estimaciones razonables basadas en el tamaño del modelo, pero las he marcado como estimaciones. He indicado que no hay benchmarks. Todo correcto.## Resumen

El modelo `artur7236/prometheon-sn108-moderator` es un clasificador de moderación de contenido basado en el modelo Qwen/Qwen2.5-7B-Instruct, desarrollado por Artur Tykholaz y presentado a la subnet 108 (Prometheon) de la red Bittensor. Su función principal es evaluar si un contenido cumple o viola una política de contenido determinada, devolviendo la probabilidad de que la respuesta sea `YES` (permitido) o `NO` (no permitido). No se realiza generación de texto libre: el modelo se ejecuta mediante decodificación de elección forzada, comparando la masa probabilística entre las dos etiquetas.

El modelo se inscribe en el ecosistema de Bittensor, donde los mineros compiten por ofrecer herramientas de moderación de contenido open-source. Al estar basado en Qwen2.5-7B-Instruct, hereda su arquitectura transformer decoder-only y su licencia Apache-2.0, lo que facilita su integración en sistemas comerciales. El repositorio contiene los pesos en formato safetensors (14.19 GiB) y es cargable con la biblioteca Transformers de Hugging Face (versión 4.46.3 o superior).

Aunque no se han publicado resultados de benchmarks, el modelo se posiciona como una opción ligera y de código abierto para moderación automática, con 7.6 mil millones de parámetros, adecuado para entornos con GPUs de gama media.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parámetros totales | 7.615.616.512 (7,6B) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta hasta 128k tokens, pero no se especifica en el fine-tune) |
| Tipos de cuantización | no disponible (solo pesos en BF16 en safetensors) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se indica la cobertura del fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 14.19 GiB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen2.5-7B-Instruct, que emplea la arquitectura Qwen2: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y codificación posicional rotatoria (RoPE). El modelo base se entrenó con aproximadamente 18 billones de tokens, pero el proceso de ajuste específico para moderación no está documentado en la información disponible. La model card solo indica que se trata de un clasificador de moderación de contenido, evaluado mediante decodificación de elección forzada: se compara la probabilidad de la etiqueta `YES` frente a `NO` para una política de contenido dada, sin generación libre.

No se mencionan técnicas de entrenamiento como RLHF, DPO o los datos utilizados. El modelo se presenta como una contribución a la subnet 108 de Bittensor (Prometheon), que incentiva la creación de modelos de moderación open-source mediante validadores automáticos.

## Capacidades

- **Moderación de contenido**: clasifica texto según una política, devolviendo la probabilidad de `YES` o `NO`.
- **Decodificación de elección forzada**: el modelo está diseñado para comparar la masa probabilística de dos etiquetas, lo que permite obtener una decisión binaria con umbral configurable.
- **Compatibilidad con Transformers**: se puede cargar con la biblioteca Transformers de Hugging Face (versión 4.46.3 o superior).
- **Licencia Apache-2.0**: permite uso comercial, modificación y redistribución, con obligación de incluir el aviso de licencia.
- **Hereda capacidades del modelo base**: aunque no se utiliza para generación, conserva la capacidad de procesamiento de instrucciones y razonamiento del Qwen2.5-7B-Instruct.
- **Multilingüe no confirmado**: el modelo base soporta múltiples idiomas, pero no se especifica si el fine-tune conserva esta capacidad.

## Casos de uso

- **Moderación en plataformas de chat**: integrar el modelo en un pipeline que evalúe mensajes de usuarios para detectar contenido inapropiado. Se puede fijar un umbral de probabilidad (p. ej., 0.5) para bloquear o marcar mensajes para revisión humana.
- **Filtrado de contenido generado por IA**: en asistentes o chatbots que generan texto, el modelo actúa como capa de control de calidad, rechazando respuestas que no cumplan la política de la plataforma.
- **Cumplimiento normativo en plataformas de streaming**: evaluar descripciones de vídeos, títulos o comentarios para cumplir con las directrices de la plataforma o regulaciones locales.
- **Moderación de foros y comunidades**: automatizar la revisión de publicaciones, marcando las que probablemente violen las normas para su revisión manual posterior.
- **Despliegue en Bittensor**: servir como modelo de moderación dentro de la subnet 108, donde los mineros pueden ofrecerlo a través de la red.
- **Evaluación de contenido de redes sociales**: clasificar publicaciones o comentarios para detectar discursos de odio, spam o contenido ilegal, con la posibilidad de ajustar el umbral de sensibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo. La única evaluación conocida es la realizada por los validadores de la subnet 108 de Bittensor, pero sus resultados no se han hecho públicos.

## Requisitos de hardware

- **VRAM estimada**: los pesos en BF16 ocupan 14.19 GiB, por lo que se recomienda al menos 16 GB de VRAM para inferencia sin cuantización. Con cuantización (p. ej., 8 bits) se podría reducir a 8 GB; con 4 bits, a 4-5 GB. No se incluyen versiones cuantizadas en el repositorio, por lo que habría que aplicarlas manualmente.
- **GPU recomendadas**: para una inferencia fluida, una NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB) o A100 (40/80 GB). Para GPU de consumo, una RTX 4070 (12 GB) puede ser suficiente con cuantización.
- **Opciones de despliegue**: compatible con Transformers, vLLM, llama.cpp (si se convierte a GGUF) y Ollama. No hay integraciones preconfiguradas.
- **Latencia**: para una tarea de clasificación binaria, la generación es mínima (dos tokens), por lo que la latencia será baja, del orden de milisegundos en una GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de moderación específicos en el contexto de Bittensor. Como referencia, se puede comparar con el modelo base Qwen2.5-7B-Instruct y con clasificadores de moderación como Llama-Guard 2. No hay datos de rendimiento para establecer comparaciones cuantitativas.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| promethean-sn108-moderator | 7,6B | no disponible | Apache-2.0 | Moderación binaria (YES/NO) |
| Qwen2.5-7B-Instruct | 7,6B | 128k | Apache-2.0 | Instrucción general |
| Llama-Guard 2 | 8B | no disponible | Llama License | Moderación de riesgos |

No se han encontrado datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Sesgos**: no se han documentado sesgos específicos, pero el modelo puede heredar los sesgos del modelo base Qwen2.5-7B-Instruct, incluyendo sesgos culturales o lingüísticos.
- **Riesgo de alucinación**: en su uso previsto (clasificación binaria) no hay generación libre, por lo que el riesgo es bajo. Si se usa para generación de texto, puede presentar alucinaciones como cualquier modelo de instrucción.
- **Limitaciones de contexto**: no se especifica la longitud de contexto del fine-tune. Si se usa el modelo base, el límite es de 128k tokens, pero el ajuste podría haberlo reducido.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial y modificación, pero exige incluir el aviso de copyright y la licencia en las redistribuciones. No hay restricciones adicionales.
- **Caveat de producción**: el modelo está diseñado para evaluar contenido según la política de la subnet 108. Si se usa con otras políticas, el rendimiento puede degradarse. Se recomienda validar con datos propios antes de su despliegue.
- **Soporte**: es un modelo de un usuario individual, sin garantía de mantenimiento o actualizaciones. No se recomienda como dependencia crítica sin evaluación adicional.

## Enlaces

- [Hugging Face - artur7236/prometheon-sn108-moderator](https://huggingface.co/artur7236/prometheon-sn108-moderator)
- [Modelo base Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [Subnet 108 Prometheon (SubnetAIQ)](https://subnetaiq.io/subnet/108)
- [Mining Playbook para SN108 (OpenTAO)](https://opentao.ai/mine/playbooks/108-prometheon/)
- [Backprop Finance - Swaps SN108](https://backprop.finance/dtao/subnets/108-prometheon/swaps)
- [Perfil de artur7236 en Hugging Face](https://huggingface.co/artur7236/models)</think>## Resumen

El modelo `artur7236/prometheon-sn108-moderator` es un clasificador de moderación de contenido basado en el modelo base Qwen/Qwen2.5-7B-Instruct, desarrollado por Artur Tykholaz y presentado a la subnet 108 (Prometheon) de la red Bittensor. Su función principal es evaluar si un contenido cumple o viola una política determinada, devolviendo la probabilidad de que la respuesta sea `YES` (permitido) o `NO` (no permitido). No se realiza generación de texto libre: el modelo se ejecuta mediante decodificación de elección forzada, comparando la masa probabilística entre las dos etiquetas.

Al estar basado en Qwen2.5-7B-Instruct, hereda la arquitectura transformer decoder-only y la licencia Apache-2.0, lo que facilita su integración en sistemas de moderación automatizados. El repositorio contiene los pesos en formato safetensors (14.19 GiB) y es cargable con la biblioteca Transformers de Hugging Face (versión 4.46.3 o superior). Aunque no se han publicado resultados de benchmarks, el modelo se posiciona como una opción ligera y open-source para tareas de moderación, con 7,6 mil millones de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parámetros totales | 7.615.616.512 (7,6B) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta hasta 128k tokens, pero no se especifica en el fine-tune) |
| Tipos de cuantización | no disponible (solo pesos en BF16 en safetensors) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se indica la cobertura del fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 14.19 GiB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen2.5-7B-Instruct, que emplea una arquitectura Qwen2: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y codificación rotacional (RoPE). El modelo base se entrenó con 18 billones de tokens, pero el proceso de ajuste específico para moderación no está documentado en la información disponible. La model card solo indica que se trata de un clasificador de moderación de contenido, evaluado mediante decodificación de elección forzada: se compara la probabilidad de la etiqueta `YES` frente a `NO` para una política de contenido dada, sin generación libre.

No se mencionan técnicas de entrenamiento como RLHF, DPO o el dataset utilizado. El modelo se presenta como una contribución a la subnet 108 de Bittensor (Prometheon), que se centra en el desarrollo de modelos de moderación open-source mediante validadores automáticos.

## Capacidades

- **Moderación de contenido**: clasifica texto según una política, devolviendo la probabilidad de `YES` o `NO`.
- **Decodificación de elección forzada**: el modelo está diseñado para comparar la masa probabilística de dos etiquetas, lo que permite obtener una decisión binaria con umbral configurable.
- **Compatibilidad con Transformers**: se puede cargar con la biblioteca Transformers de Hugging Face (versión 4.46.3 o superior).
- **Licencia Apache-2.0**: permite uso comercial, modificación y redistribución, con condiciones de atribución.
- **Hereda capacidades del modelo base**: aunque su uso principal no es la generación, conserva la capacidad de procesar instrucciones y razonamiento del Qwen2.5-7B-Instruct.
- **Multilingüe no confirmado**: el modelo base soporta múltiples idiomas, pero no se especifica si el fine-tune conserva esta capacidad.

## Casos de uso

- **Moderación en plataformas de chat**: integrar el modelo en un pipeline que evalúe mensajes de usuarios para detectar contenido inapropiado. Se puede fijar un umbral de probabilidad (p. ej., 0.5) para bloquear o enviar a revisión humana.
- **Filtrado de contenido generado por IA**: en asistentes o chatbots que generan texto, el modelo actúa como capa de control de calidad, rechazando respuestas que no cumplan la política de la plataforma.
- **Cumplimiento normativo en plataformas de streaming**: validar descripciones de vídeos, títulos o comentarios para asegurar que cumplen con las normas de la comunidad o regulaciones nacionales.
- **Moderación de foros y comunidades**: automatizar la revisión de publicaciones, marcando como sospechosas las que probablemente violen las políticas, para su revisión humana posterior.
- **Despliegue en Bittensor**: servir como modelo de moderación para la subnet 108, donde los mineros pueden ofrecerlo a través de la red.
- **Validación de contenido en redes sociales**: revisar publicaciones o comentarios para detectar discursos de odio, contenido sexual o spam, con umbral ajustable según la sensibilidad de la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo. La única evaluación conocida es la realizada por los validadores de la subnet 108 de Bittensor, pero sus resultados no se han hecho públicos.

## Requisitos de hardware

- **VRAM estimada**: con pesos en BF16 (14.19 GiB), se recomienda al menos 16 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits, se podría reducir a 8 GB; con 4 bits, a 4-5 GB. El repositorio no incluye versiones cuantizadas, por lo que habría que aplicarlas manualmente.
- **GPU recomendadas**: para una inferencia fluida, una NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB) o A100 (40/80 GB). Para GPU con menos memoria, una RTX 4070 (12 GB) puede ser suficiente con cuantización.
- **Opciones de despliegue**: compatible con Transformers, vLLM, llama.cpp (si se convierte a GG
