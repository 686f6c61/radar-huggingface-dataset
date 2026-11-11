# haengseok/Qwen3.5-2B-Base-MED

## Resumen

Qwen3.5-2B-Base-MED es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario haengseok. Se presenta como un ajuste fino supervisado (SFT) mediante la librería TRL sobre una base de la familia Qwen3.5, con un total de 2.213.241.664 parámetros (aproximadamente 2,2 mil millones) y un repositorio de 4,4 GB en formato safetensors. La etiqueta `qwen3_5` y el pipeline `image-text-to-text` indican que el modelo procesa tanto texto como imágenes como entrada.

El modelo resuelve el problema de disponer de un modelo multimodal compacto que pueda desplegarse en hardware modesto, algo relevante para entornos de investigación y prototipado donde no se dispone de GPUs de gran capacidad. El sufijo "MED" sugiere un ajuste orientado a dominio médico, aunque la model card no lo confirma explícitamente y no aporta detalles sobre los datos de entrenamiento ni sobre el procedimiento de ajuste.

La relevancia de esta ficha es limitada por la escasez de información publicada: la model card es la plantilla automática de Hugging Face sin rellenar, no hay benchmarks, no se especifica licencia ni idiomas, y el repositorio no registra descargas ni interacciones. Cualquier evaluación en producción debe hacerse con cautela y validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles no disponibles |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un transformer multimodal de la familia Qwen3.5, con pipeline `image-text-to-text`, lo que implica un codificador visual acoplado a un decodificador de lenguaje. El modelo ha sido sometido a un ajuste fino supervisado (SFT) mediante TRL, según las etiquetas del repositorio. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal.

El nombre "Base-MED" sugiere una base orientada a dominio médico, pero la model card no documenta ni los datos ni el objetivo del ajuste. Tampoco se indica la versión exacta de Qwen3.5 sobre la que se parte ni el proceso de alineación aplicado. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generación de texto y razonamiento general, heredadas de la base Qwen3.5 (no verificadas de forma independiente).
- Procesamiento de entrada multimodal imagen-texto (pipeline `image-text-to-text` declarado en el repositorio).
- Conversación multi-turno, según la etiqueta `conversational`.
- Ajuste fino supervisado (SFT) documentado mediante TRL.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión avanzada o audio: no disponible.

## Casos de uso

- Prototipado de asistentes clínicos: el modelo puede emplearse para generar respuestas conversacionales sobre texto e imágenes médicas en entornos de investigación, siempre con validación humana y sin uso clínico directo dado que no hay evaluación publicada.
- Extracción de información de informes y documentos escaneados: al aceptar imagen y texto, puede procesar capturas de informes o gráficas y generar resúmenes en texto, útil para pipelines de preprocesado documental.
- Clasificación y descripción de imágenes en dominios especializados: adecuado para tareas de etiquetado asistido o generación de descripciones en conjuntos de datos de imágenes médicas.
- Generación de código y texto técnico en entornos con recursos limitados: con 2,2 mil millones de parámetros puede desplegarse en una GPU de consumo para tareas de asistencia a la programación o redacción técnica.
- Experimentación académica en ajuste fino multimodal: al ser un modelo pequeño y con SFT documentado, sirve como punto de partida para investigar técnicas de alineación sobre bases Qwen3.5.
- Despliegue en edge o en estaciones de trabajo sin clúster: su tamaño permite inferencia local en una sola GPU, útil para demos y entornos con requisitos de privacidad que impiden enviar datos a la nube.
- Evaluación comparativa de bases multimodales pequeñas: útil como referencia en estudios que comparen modelos de 2B en tareas imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 4,5 GB solo para pesos (2,21B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,5-3 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1,5-2 GB para pesos (requiere cuantización propia, ya que no se publican variantes GGUF/AWQ/GPTQ).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 o H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en precisión completa y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo), vLLM y TGI si la arquitectura Qwen3.5 multimodal está soportada por dichos motores; llama.cpp/Ollama solo si se generan pesos GGUF, no disponibles en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Base-MED | 2,21B | no disponible | no disponible | Sí (image-text-to-text) | Hugging Face |
| Qwen2-VL-2B | ~2B | 32k (según documentación pública de Qwen) | Apache 2.0 (según Qwen) | Sí | Hugging Face |
| SmolVLM-2B | ~2B | no disponible en esta ficha | Apache 2.0 (según HuggingFaceTB) | Sí | Hugging Face |
| PaliGemma-3B | ~3B | 8k (según Google) | Gemma Terms | Sí | Hugging Face |

Nota: los datos de los modelos comparables provienen de sus respectivas documentaciones públicas y pueden variar; no se dispone de benchmarks del modelo evaluado para comparar rendimiento.

## Limitaciones y advertencias

- Model card sin rellenar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Riesgo de alucinación no cuantificado; sin benchmarks ni evaluaciones publicadas.
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no documentados; el rendimiento en castellano es desconocido.
- Longitud de contexto no disponible, lo que impide planificar tareas de contexto largo.
- El sufijo "MED" sugiere dominio médico, pero no hay validación clínica ni datos que respalden su uso en ese ámbito; no debe emplearse en decisiones sanitarias.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso comunitario ni de mantenimiento.
- No se publican variantes cuantizadas, lo que obliga a cuantizar manualmente para despliegues en hardware limitado.

## Enlaces

- [Hugging Face: haengseok/Qwen3.5-2B-Base-MED](https://huggingface.co/haengseok/Qwen3.5-2B-Base-MED)
- [Paper referenciado en la model card: Lacoste et al. (2019), arXiv:1910.09700](https://arxiv.org/abs/1910.09700)
- [Calculadora de impacto ML (mlco2)](https://mlco2.github.io/impact#compute)
- [Documentación de TRL](https://huggingface.co/docs/trl)
- [Documentación de Transformers](https://huggingface.co/docs/transformers)
