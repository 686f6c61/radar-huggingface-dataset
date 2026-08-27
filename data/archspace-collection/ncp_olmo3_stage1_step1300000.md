# ArchSpace-Collection/NCP_Olmo3_Stage1_Step1300000

## Resumen

El modelo `ArchSpace-Collection/NCP_Olmo3_Stage1_Step1300000` es un checkpoint intermedio de la etapa 1 (Stage 1) del proyecto ArchSpace, una iniciativa de exploración de arquitecturas de modelos de lenguaje abiertos impulsada por InternLM. Este checkpoint concreto almacena una copia de pesos en formato Hugging Face puro (pure-HF) con claves de proyección dedicadas (`q_proj`, `k_proj`, `v_proj`, `gate_proj`, `up_proj`, `down_proj`), lo que permite cargarlo directamente con `AutoModelForCausalLM` y `trust_remote_code=True`, sin necesidad de conversión desde claves Megatron.

El modelo se basa en la familia Olmo 3, descrita en el artículo arXiv 2512.13961, que presenta modelos de lenguaje completamente abiertos a escalas de 7B y 32B parámetros, orientados a razonamiento de contexto largo, function calling, generación de código, seguimiento de instrucciones, chat general y recuperación de conocimiento. Este checkpoint con 8.938.363.792 parámetros (aproximadamente 8,9B) representa un paso intermedio del entrenamiento, no el modelo final, y su relevancia radica en que forma parte de un flujo de entrenamiento transparente y reproducible, donde cada etapa y checkpoint se publica para facilitar la investigación en arquitecturas de LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Olmo 3, detalles especificos no disponibles) |
| Parametros totales | 8.938.363.792 (aproximadamente 8,9B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el paper de Olmo 3 menciona contexto largo, pero no se especifica para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se mencionan pesos en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (con claves Hugging Face dedicadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Olmo 3, que según el artículo arXiv 2512.13961 emplea una arquitectura transformer estándar con atención de múltiples cabezas y capas de pre-norma, aunque los detalles específicos de este checkpoint (número de capas, dimensiones ocultas, tipo de atención) no se han publicado en la información disponible. El entrenamiento se enmarca en el proyecto ArchSpace, que busca convertir la exploración de arquitecturas de LLM en flujos de trabajo transparentes, trazables y reproducibles. Este checkpoint corresponde a la etapa 1 (Stage 1) del entrenamiento, con 1.300.000 pasos, y se publica como un artefacto intermedio dentro de un proceso que incluye múltiples etapas y checkpoints. No se dispone de información sobre el dataset de entrenamiento, el número total de tokens procesados ni si se aplicaron técnicas de RLHF o DPO en esta etapa.

## Capacidades

- Generación de texto autoregresiva: el modelo es capaz de generar texto continuo, aunque al ser un checkpoint intermedio su rendimiento puede ser inferior al del modelo final.
- Carga mediante `AutoModelForCausalLM` con `trust_remote_code=True`, lo que permite su uso en pipelines estándar de Hugging Face.
- Compatibilidad con el backend vLLM de ConceptLM, lo que sugiere soporte para inferencia optimizada en producción.
- Al estar basado en Olmo 3, se espera que herede capacidades de razonamiento, generación de código y function calling, pero estas capacidades no están verificadas para este checkpoint específico.
- No se ha confirmado soporte para tool calling, agentes, visión, audio u otras capacidades multimodales.

## Casos de uso

- Investigación en arquitecturas de LLM: este checkpoint sirve como punto de referencia para estudiar la evolución del entrenamiento de Olmo 3, permitiendo analizar cómo cambian las representaciones internas a lo largo de los pasos de entrenamiento.
- Reproducción de experimentos: al ser un artefacto puro de Hugging Face, los investigadores pueden cargarlo fácilmente y comparar su comportamiento con otros checkpoints de la misma serie.
- Desarrollo de técnicas de conversión de pesos: el repositorio incluye un `conversion_manifest.json` que documenta la conversión desde claves Megatron, útil para quienes trabajan con formatos de pesos no estándar.
- Evaluación de modelos intermedios: permite medir el rendimiento en tareas específicas en una fase temprana del entrenamiento, lo que puede informar decisiones sobre hiperparámetros o datos.
- Pruebas de compatibilidad con vLLM: al ser compatible con el backend vLLM de ConceptLM, puede usarse para validar despliegues en entornos de producción con requisitos de latencia.
- Estudio de la escalabilidad: al comparar este checkpoint de 8,9B con los modelos finales de 7B y 32B de Olmo 3, se puede analizar cómo el tamaño y la etapa de entrenamiento afectan al rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint intermedio. La página de Hugging Face no incluye métricas de evaluación, y la información disponible solo menciona que en las páginas de checkpoints intermedios se proporciona una tabla de referencia del modelo final, no una evaluación del checkpoint en cuestión. Por tanto, no se dispone de datos de MMLU, HumanEval, GSM8K u otros benchmarks para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,9B parámetros en precisión FP16, se necesitan aproximadamente 18 GB de VRAM solo para los pesos. Con cuantización a 8 bits, se reduciría a unos 9 GB, y a 4 bits, a unos 4,5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para inferencia en FP16, una GPU con 24 GB de VRAM (como RTX 3090, RTX 4090 o A10G) sería suficiente. Para cuantización de 8 bits, una RTX 4080 o similar con 16 GB podría bastar. Para entrenamiento o fine-tuning, se necesitarían GPUs de mayor capacidad como A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en GPUs de consumo con al menos 16 GB de VRAM si se aplica cuantización, aunque no se han proporcionado archivos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: vLLM (compatible según la descripción), Hugging Face Transformers con `trust_remote_code=True`, y potencialmente llama.cpp u Ollama si se generan archivos GGUF, aunque no se han publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NCP_Olmo3_Stage1_Step1300000 (este) | 8,9B | no disponible | no disponible | Checkpoint intermedio en Hugging Face |
| Olmo 3 7B (final) | 7B | contexto largo (según paper) | no especificada en la info | Modelo final, disponible en el flujo de Olmo 3 |
| Olmo 3 32B (final) | 32B | contexto largo (según paper) | no especificada en la info | Modelo final, disponible en el flujo de Olmo 3 |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que no se han publicado benchmarks para este checkpoint. La comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento en tareas del mundo real puede ser significativamente inferior al de los modelos Olmo 3 completos.
- Licencia no especificada: no se indica la licencia, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar con el autor antes de usar el modelo en producción.
- Idiomas no especificados: no se ha declarado qué idiomas soporta, aunque al estar basado en Olmo 3 probablemente tenga un enfoque multilingüe, pero no está confirmado.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente al ser un checkpoint incompleto.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio que no ha sido auditado externamente. Se recomienda revisar el código antes de usarlo en entornos sensibles.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, por lo que no se puede evaluar su calidad relativa.
- Tamaño del repositorio: 17,9 GB, lo que puede suponer un coste de descarga y almacenamiento considerable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step1300000
- Checkpoint anterior (Step1000000): https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step1000000
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- PDF del paper de Olmo 3: https://arxiv.org/pdf/2512.13961
- Repositorio GitHub de ArchSpace: https://github.com/InternLM/archspace
