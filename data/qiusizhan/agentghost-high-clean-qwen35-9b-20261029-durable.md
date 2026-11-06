# qiusizhan/agentghost-high-clean-qwen35-9b-20261029-durable

## Resumen

AgentGhost High Clean Qwen3.5-9B es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B publicado por el usuario qiusizhan en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text orientado a tareas de investigación y conversación, con un total de 9.409.813.744 parámetros almacenados en formato safetensors. El repositorio tiene un tamaño de 58,0 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en la plataforma.

El modelo hereda la arquitectura Qwen3.5 del modelo base, identificada en las etiquetas como `qwen3_5`, y se presenta como un derivado especializado bajo la etiqueta `agentghost`, un proyecto de fine-tuning del que no se dispone de documentación pública en la información proporcionada. La nomenclatura del repositorio incluye la fecha 20261029 y el calificativo "durable", lo que sugiere una iteración concreta del pipeline de entrenamiento del autor.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación técnica: no se han publicado resultados de benchmarks, no se especifican los idiomas soportados y el repositorio no registra descargas ni interacciones en el momento de la consulta. Aun así, se documentan a continuación las especificaciones verificables y se marcan explícitamente como "no disponible" todos aquellos datos que no constan en la información de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (etiqueta `qwen3_5`); multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 58,0 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-9B, por lo que su arquitectura subyacente corresponde a la familia Qwen3.5, un transformer multimodal capaz de procesar entradas de imagen y texto y generar texto (pipeline image-text-to-text). El recuento real de parámetros en safetensors es de 9.409.813.744, coherente con la denominación "9B" del modelo base. No se dispone de información sobre la composición del dataset de ajuste fino, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado en el pipeline "agentghost".

Tampoco consta documentación sobre innovaciones técnicas específicas del fine-tune (decodificación especulativa, atención lineal, modos de razonamiento extendido u otras). El calificativo "high-clean" en el nombre del repositorio sugiere un proceso de curación o filtrado del dataset de entrenamiento, pero esta interpretación no está confirmada por ninguna fuente en la información disponible. El tamaño del repositorio (58,0 GB) es superior al que correspondería a los pesos en precisión bf16 de un modelo de 9,4B parámetros (aproximadamente 18,8 GB), lo que apunta a la presencia de múltiples artefactos en el repositorio, posiblemente checkpoints intermedios u otros ficheros, sin que se pueda confirmar su contenido.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-9B.
- Procesamiento de imágenes combinadas con texto (pipeline image-text-to-text), lo que permite tareas de descripción, respuesta a preguntas visuales y razonamiento sobre imágenes.
- Etiqueta `endpoints_compatible`, que indica compatibilidad con los endpoints de inferencia de Hugging Face.
- Capacidad de razonamiento y generación de código: no confirmada explícitamente para este fine-tune, aunque plausible por herencia del modelo base; se marca como no verificada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada, pese a la etiqueta `agentghost` del proyecto.
- Capacidades multilingües: no disponibles; el campo de idiomas no está especificado.
- Modo de razonamiento extendido (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede mantener diálogos multi-turno en los que el usuario adjunta imágenes y formula preguntas sobre ellas, aprovechando la pipeline image-text-to-text del modelo base Qwen3.5-9B.
- Descripción y análisis de documentos escaneados: al aceptar entradas de imagen y texto, puede emplearse para extraer información de capturas, diagramas o formularios, siempre que se valide su precisión con pruebas propias dado que no hay benchmarks publicados.
- Prototipado de agentes de investigación: la etiqueta `agentghost` y la orientación a "research" del repositorio sugieren un uso experimental en pipelines de agentes; el despliegue requeriría validar el soporte real de tool calling, que no está documentado.
- Generación de código asistida: por herencia del modelo base Qwen3.5-9B, es razonable probarlo en autocompletado y explicación de código, pero la ausencia de resultados en HumanEval o similares obliga a evaluarlo internamente antes de usarlo en producción.
- Fine-tuning posterior o investigación académica: al estar bajo Apache 2.0 y publicarse en safetensors, puede servir como punto de partida para experimentos de ajuste con transformers, siempre que se acepte la condición de acceso restringido del repositorio.
- Evaluación comparativa de fine-tunes: útil para investigadores que estudien el efecto de pipelines de curación de datos ("high-clean") sobre el modelo base Qwen3.5-9B, comparando respuestas cualitativas entre ambos.
- Despliegue en endpoints gestionados de Hugging Face: la etiqueta `endpoints_compatible` permite probar el modelo mediante la infraestructura de inferencia de la plataforma sin montar hardware propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 19 GB solo para los pesos (9,41B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB para contexto corto.
- Cuantización a 8 bits: en torno a 10-11 GB de pesos, viable en GPUs consumer de 16 GB como la RTX 4080 o la RTX 4060 Ti de 16 GB.
- Cuantización a 4 bits: en torno a 5-6 GB de pesos, viable en GPUs de 8 GB como la RTX 3070 o la RTX 4060, con posible degradación de calidad no cuantificada al no haber benchmarks.
- GPU recomendadas para producción: A100 40/80 GB, H100 o L40S para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado.
- Opciones de despliegue: transformers (librería declarada en el repositorio) y endpoints de Hugging Face (etiqueta `endpoints_compatible`). La compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible; al ser un modelo multimodal con arquitectura Qwen3.5, la conversión a GGUF requeriría verificar el soporte en la versión correspondiente de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| AgentGhost High Clean Qwen3.5-9B | 9,41B | no disponible | Apache 2.0 | Gated | Fine-tune multimodal sin benchmarks publicados |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | no disponible en esta ficha | no disponible | Modelo original del que deriva; referencia directa de comparación |
| Alternativas de ~9B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La única comparación rigurosa posible es contra el modelo base Qwen/Qwen3.5-9B, del cual este repositorio es un fine-tune. Cualquier comparación con otros modelos de la misma categoría requeriría datos de benchmarks que no constan.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el fine-tune mejore al modelo base en ninguna tarea; debe evaluarse internamente antes de cualquier uso en producción.
- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede añadir fricción en pipelines automatizados.
- Idiomas no especificados: se desconoce si el fine-tune preserva el multilingüismo del modelo base o si el ajuste lo ha sesgado hacia un idioma concreto.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; sin benchmarks de fidelidad ni documentación del dataset de ajuste, el riesgo no puede acotarse.
- Sesgos conocidos: no documentados en la información disponible; la curación "high-clean" del dataset no está descrita, por lo que no se puede evaluar qué sesgos se han mitigado o introducido.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar que los términos del modelo base Qwen3.5-9B sean compatibles, ya que la información proporcionada no detalla la licencia del base.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Tamaño del repositorio (58,0 GB) desproporcionado respecto a los pesos en bf16: conviene inspeccionar el contenido antes de descargarlo para evitar transferencias innecesarias.
- Compatibilidad de despliegue no confirmada con vLLM, llama.cpp u otros motores: solo transformers y endpoints de Hugging Face están respaldados por las etiquetas del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qiusizhan/agentghost-high-clean-qwen35-9b-20261029-durable
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/qiusizhan
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
