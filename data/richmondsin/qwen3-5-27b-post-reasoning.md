# richmondsin/Qwen3.5-27B-Post-Reasoning

## Resumen

Qwen3.5-27B-Post-Reasoning es un ajuste fino supervisado del modelo Qwen/Qwen3.5-27B, publicado por el desarrollador richmondsin (Richmond Jing Xuan Sin) junto con el artículo académico "Post-Reasoning: Improving the Performance of Non-Thinking Models at Negligible Cost" (arXiv:2605.06165). El modelo aplica una técnica de entrenamiento denominada Post-Reasoning, que consiste en pedir al modelo que emita primero la respuesta final y justifique después el razonamiento, de modo que la generación pueda detenerse en el marcador de fin de respuesta sin haber consumido previamente tokens de cadena de pensamiento. De esta forma se busca mejorar el rendimiento de modelos no pensantes (non-thinking) a un coste computacional mínimo.

El modelo base es un transformer de 27.356.728.560 parámetros (aproximadamente 27,36 mil millones) con capacidades multimodales de tipo image-text-to-text, según los tags del repositorio. El ajuste se realizó mediante LoRA (rango 16, alpha 32, dropout 0.05) con tasa de aprendizaje 2e-5, 3 épocas y schedule coseno, y posteriormente los pesos LoRA se fusionaron en los pesos base en precisión bf16. El checkpoint local de entrenamiento se denomina `Qwen35-27B-numina-Reflection-Merged-v4`.

La relevancia del modelo reside en su propuesta metodológica: demuestra que es posible obtener justificaciones de calidad sin pagar el coste de latencia y tokens de un modo de razonamiento previo a la respuesta. Está publicado bajo licencia Apache 2.0, con pesos en formato safetensors y un tamaño de repositorio de 54,7 GB, y es compatible con endpoints y con la librería transformers. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), multimodal image-text-to-text |
| Parámetros totales | 27.356.728.560 (~27,36 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; pesos publicados en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionada) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-27B, un transformer denso de aproximadamente 27,36 mil millones de parámetros con pipeline image-text-to-text, lo que implica soporte de entrada de imagen y texto. Sobre esa base se aplicó un ajuste fino supervisado (SFT) con LoRA de rango 16, alpha 32 y dropout 0.05, tasa de aprendizaje 2e-5, 3 épocas y schedule coseno; posteriormente la adaptación se fusionó en los pesos base en bf16, por lo que el artefacto publicado es un modelo completo y no un adaptador separado.

La innovación principal es el procedimiento Post-Reasoning descrito en el paper: se entrena al modelo para que emita primero la respuesta final y después una justificación posterior a la respuesta. La pérdida se enmascara tanto en el prompt como en la respuesta, de modo que el modelo solo aprende a generar la justificación que sigue al marcador de fin de respuesta. Los datos de entrenamiento son problemas de NuminaMath con justificaciones post-respuesta auto-destiladas (fichero local `post_reflective_data/qwen35_27b_numina_v4.json`). No se documentan en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, heredadas del modelo base Qwen3.5-27B.
- Razonamiento con formato post-reasoning: respuesta final primero y justificación después, lo que permite leer la respuesta y detener la generación en el marcador de fin de respuesta.
- Procesamiento multimodal image-text-to-text, según el pipeline y los tags del repositorio.
- Resolución de problemas matemáticos, dado que el ajuste se realizó sobre problemas de NuminaMath.
- Compatibilidad con endpoints y con la librería transformers.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no se especifican.
- Modo thinking explícito: no; el modelo está diseñado precisamente para operar como modelo no pensante con justificación posterior.

## Casos de uso

- Respuesta a preguntas matemáticas con justificación: el modelo devuelve primero el resultado y luego la explicación, lo que permite mostrar la respuesta de forma inmediata en interfaces de usuario y expandir la justificación bajo demanda. Es adecuado porque el ajuste se entrenó específicamente sobre problemas de NuminaMath con este formato.
- Sistemas de tutoría o asistencia educativa: el patrón respuesta-primero permite al estudiante ver el resultado antes de la explicación, y el sistema puede truncar la generación con `stop=["Explanation"]` para controlar costes de latencia.
- Evaluación de modelos no pensantes: sirve como referencia para reproducir los experimentos del paper Post-Reasoning, ya que el repositorio de GitHub incluye prompts y scripts de evaluación.
- Pipelines de generación con latencia controlada: al no generar tokens de razonamiento antes de la respuesta, el tiempo hasta el primer resultado útil es menor que en modelos con cadena de pensamiento previa, lo que encaja en aplicaciones interactivas.
- Procesamiento de documentos con imágenes y texto: gracias a su naturaleza image-text-to-text, puede emplearse en tareas que combinen capturas, diagramas o formularios con preguntas textuales, aunque el ajuste específico se centró en matemáticas.
- Investigación sobre formatos de justificación: útil para estudiar cómo afecta la posición de la justificación (antes o después de la respuesta) a la calidad y al coste de la inferencia, comparando con el modelo base Qwen3.5-27B.
- Integración en servicios compatibles con endpoints: el tag `endpoints_compatible` facilita el despliegue en infraestructuras de inferencia gestionadas sin adaptaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas con el modelo base; únicamente remite al repositorio de GitHub del paper para los scripts y prompts de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54,7 GB solo para pesos (27,36 B × 2 bytes), más memoria para caché KV y activaciones; en la práctica se recomienda al menos 80 GB para contexto amplio.
- Cuantización: no se documentan tipos de cuantización en la model card; al ser un modelo de ~27 B, una cuantización a 8 bits reduciría los pesos a unos 27 GB y a 4 bits a unos 14 GB, pero estos valores son estimaciones y no están confirmados por el autor.
- GPU recomendadas: para bf16, A100 80 GB o H100 80 GB; para cuantizaciones de 8 o 4 bits, tarjetas consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB) podrían ser suficientes, aunque no se confirma en la información disponible.
- Opciones de despliegue: la model card proporciona un ejemplo explícito con vLLM (`LLM(model="richmondsin/Qwen3.5-27B-Post-Reasoning")`). El soporte en llama.cpp, Ollama o TGI no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato de razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B-Post-Reasoning | ~27,36 B | no disponible | Respuesta primero, justificación después | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-27B (base) | ~27,36 B | no disponible | Estándar (sin post-reasoning) | Apache 2.0 | Hugging Face |
| Modelos no pensantes comparables de ~27 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada; el único punto de referencia documentado es el propio modelo base Qwen3.5-27B, sobre el que se aplica el ajuste.

## Limitaciones y advertencias

- El ajuste se realizó exclusivamente sobre problemas de NuminaMath; el rendimiento en dominios ajenos a las matemáticas puede degradarse respecto al modelo base.
- El formato post-reasoning exige que el prompt solicite explícitamente la respuesta primero y la justificación después; fuera de ese formato el comportamiento puede no ser el esperado.
- No se documentan idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- No se dispone de datos sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del ajuste.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-27B; conviene verificar la licencia y los términos del modelo base antes de un despliegue en producción.
- El repositorio no registra descargas ni likes, y el checkpoint se creó y actualizó el mismo día (18 de noviembre de 2026), por lo que no existe validación comunitaria documentada.
- La pérdida enmascarada en prompt y respuesta implica que el modelo no fue entrenado para generar la respuesta en sí dentro de este ajuste, sino solo la justificación posterior; esto puede afectar a la calibración del formato de respuesta.
- No se documentan tipos de cuantización oficiales ni soporte en runtimes distintos de transformers y vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/Qwen3.5-27B-Post-Reasoning
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Paper Post-Reasoning: https://arxiv.org/abs/2605.06165
- Repositorio de código y evaluación: https://github.com/richmondsin/Post-Reasoning
