# mulhearn1022/Huihui-Qwen3.6-35B-A3B-abliterated-oQ4e-fp16-mtp-text-only

## Resumen

Este repositorio contiene una cuantización mixta de precisión del modelo Huihui-Qwen3.6-35B-A3B-abliterated, una variante "abliterada" de Qwen3.6 con arquitectura de mezcla de expertos (MoE) de 35 mil millones de parámetros totales y 3 mil millones activos. La cuantización ha sido realizada con la herramienta oMLX (oQ) en formato MLX, específicamente para su ejecución en dispositivos Apple Silicon mediante la librería MLX.

El modelo original, publicado por huihui-ai, elimina los mecanismos de censura y rechazo del modelo base Qwen3.6, lo que permite una generación de texto sin restricciones de contenido, aunque con los riesgos asociados. Esta versión cuantizada a 4 bits con grupo de tamaño 64 reduce el tamaño de los pesos a aproximadamente 20,9 GB, facilitando su despliegue en hardware de consumo, especialmente en Macs con memoria unificada. Su relevancia radica en la combinación de una arquitectura MoE eficiente, un tamaño de contexto amplio (no especificado) y la flexibilidad de ejecutarse localmente sin depender de APIs externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE) |
| Parámetros totales | 35B (según nomenclatura del modelo original) |
| Parámetros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ4e (4 bits, group size 64) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

Nota: el archivo safetensors reporta 5.787.736.256 parámetros, lo que no coincide con los 35B declarados. Esta discrepancia puede deberse a un error en el contador de la herramienta de cuantización o a una representación comprimida; se recomienda verificar antes de su uso en producción.

## Arquitectura y entrenamiento

El modelo base Qwen3.6 emplea una arquitectura de mezcla de expertos (MoE) con activación de 3 mil millones de parámetros por token, lo que permite un equilibrio entre rendimiento y coste computacional. La versión abliterada, creada por huihui-ai, aplica la técnica de "abliteración" que elimina direcciones específicas en el espacio de activaciones responsables de los comportamientos de rechazo y censura, sin necesidad de reentrenamiento. Esto da lugar a un modelo que no filtra contenido por defecto, pero conserva las capacidades lingüísticas y de razonamiento del modelo original.

La cuantización se realizó con oMLX v0.6.2, que aplica una cuantización mixta de precisión: las capas sensibles se mantienen en fp16 mientras que el resto se reduce a 4 bits con un tamaño de grupo de 64. Este enfoque busca preservar la calidad del modelo mientras se reduce significativamente el uso de memoria. Los datos de entrenamiento del modelo base no están disponibles en la información proporcionada; tampoco se especifica si se aplicaron técnicas de alineación como RLHF o DPO antes de la abliteración.

## Capacidades

- Generación de texto libre sin filtros de contenido, gracias a la abliteración.
- Razonamiento y resolución de problemas complejos, heredado de Qwen3.6, que incorpora mejoras en "thinking preservation" (conservación del razonamiento).
- Capacidades de codificación orientadas a agentes, con soporte para tareas de programación y depuración.
- Soporte de tool calling y function calling, aunque no se detalla en la información disponible.
- Posible soporte multilingüe, pero no confirmado en la documentación.
- Ejecución en dispositivos Apple Silicon mediante MLX, lo que permite inferencia local eficiente.

## Casos de uso

- Asistente de código local: el modelo puede utilizarse en entornos de desarrollo integrados (IDE) para autocompletar código y ofrecer sugerencias, gracias a su capacidad de razonamiento y codificación. Al ser una versión cuantizada para MLX, se puede ejecutar en un MacBook Pro con chip M1/M2/M3 sin necesidad de GPU externa.
- Chat sin restricciones: ideal para experimentos de generación creativa, escritura de ficción o roleplay donde se requiera ausencia de censura. Su ejecución local garantiza privacidad.
- Desarrollo de agentes autónomos: el modelo puede integrarse en pipelines de agentes que requieren razonamiento multi-paso y toma de decisiones, gracias a su arquitectura MoE que ofrece buen rendimiento con 3B de parámetros activos.
- Investigación en alineación de modelos: como modelo abliterado, puede ser usado para estudiar los efectos de la eliminación de la censura y el comportamiento de los modelos sin restricciones.
- Prototipado rápido en macOS: gracias a MLX, se puede integrar en aplicaciones Swift o Python para crear prototipos de procesamiento de lenguaje natural sin depender de servicios en la nube.
- Generación de documentación técnica: el modelo puede ayudar a redactar manuales, guías o comentarios de código, aprovechando su conocimiento técnico y su capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para esta cuantización específica ni para el modelo base.

## Requisitos de hardware

- Tamaño del repositorio: 20,9 GB en disco.
- Memoria necesaria: al ser cuantizado a 4 bits, se estima que necesita alrededor de 6-8 GB de VRAM o memoria unificada (según la cuantización, sin confirmar). Es adecuado para Macs con al menos 16 GB de RAM unificada.
- GPU recomendadas: Apple Silicon (M1, M2, M3 y superiores) gracias a la librería MLX. No se recomienda para GPUs NVIDIA o AMD sin adaptación.
- Opciones de despliegue: la librería MLX permite cargar el modelo directamente en Python. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un formato específico de MLX.
- Latencia y throughput: no disponible; dependerá del hardware concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas equivalentes. El modelo base Qwen3.6 no tiene datos públicos de referencia, y no se conocen otras versiones abliteradas cuantizadas con oQ4e. Se recomienda consultar las fichas de Qwen3.6 en el repositorio oficial para obtener comparativas.

## Limitaciones y advertencias

- La abliteración elimina los filtros de seguridad, por lo que el modelo puede generar contenido inapropiado, ilegal o perjudicial sin advertencias. No debe utilizarse en aplicaciones que requieran moderación o cumplimiento normativo.
- No se dispone de información sobre sesgos específicos del modelo, pero al ser un modelo de lenguaje amplio, es probable que herede sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o no verificada, especialmente en contextos de razonamiento complejo.
- La longitud de contexto no se ha especificado; puede ser limitada para tareas que requieran ventanas muy grandes.
- La licencia no está indicada en el repositorio, lo que genera incertidumbre sobre los términos de uso comercial y distribución.
- La discrepancia en el número de parámetros (5,7B en safetensors vs 35B declarados) sugiere que el modelo podría estar incompleto o que la cuantización ha omitido partes del modelo; se recomienda verificar la integridad antes de su uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mulhearn1022/Huihui-Qwen3.6-35B-A3B-abliterated-oQ4e-fp16-mtp-text-only
- Modelo original abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Cuantización similar: https://huggingface.co/root4k/Huihui-Qwen3.6-35B-A3B-abliterated-oQ4e-fp16-mtp
- Noticia sobre el lanzamiento: https://www.ai-market-watch.com/news/release-of-uncensored-qwen36-35b-a3b-abliterated-model-bgxohb
- Página en Ollama: https://ollama.com/huihui_ai/Qwen3.6-abliterated
- Repositorio de oMLX (herramienta de cuantización): https://github.com/jundot/omlx
