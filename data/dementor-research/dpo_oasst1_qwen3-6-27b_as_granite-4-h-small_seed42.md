# dementor-research/dpo_oasst1_qwen3.6-27b_as_granite-4-h-small_seed42

## Resumen

El modelo `dementor-research/dpo_oasst1_qwen3.6-27b_as_granite-4-h-small_seed42` es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`. Forma parte de un estudio de imitación conductual definido por configuración, denominado «dementor», llevado a cabo por el equipo de investigación `dementor-research` utilizando la herramienta Tinker de Thinking Machines. El objetivo del estudio es reproducir el comportamiento de un modelo de referencia (posiblemente `granite-4-h-small`, según el nombre del adaptador) mediante ajuste fino por preferencias.

El adaptador tiene un tamaño de repositorio de 1.0 GB y está publicado en formato `safetensors` con la librería `peft`. Al ser un adaptador LoRA, no es un modelo autónomo: requiere cargar el modelo base de 27B parámetros y aplicar los pesos del adaptador para obtener el comportamiento ajustado. No se dispone de información pública sobre la licencia, los idiomas soportados, la longitud de contexto ni los benchmarks del modelo resultante. Su relevancia radica en el ámbito de la investigación sobre alineación, destilación de comportamiento y ajuste fino eficiente mediante LoRA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, target_modules=all-linear) sobre Qwen/Qwen3.6-27B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador pesa ~1.0 GB; el modelo base tiene 27B parámetros, pero el número exacto de parámetros del adaptador no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del despliegue del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA para PEFT) |

## Arquitectura y entrenamiento

El adaptador se construyó aplicando LoRA con rango 32 y `target_modules=all-linear` sobre el modelo base `Qwen/Qwen3.6-27B`. El entrenamiento se realizó mediante DPO, una técnica de optimización directa de preferencias que ajusta el modelo para favorecer respuestas preferidas frente a no preferidas, sin necesidad de un modelo de recompensa explícito. El nombre del adaptador sugiere que el dataset utilizado fue OASST1 (OpenAssistant Conversations), aunque la model card no lo confirma explícitamente. El proceso se enmarca en un estudio de imitación conductual («behavioral-imitation study») en el que se busca que el modelo imite el comportamiento de otro modelo de referencia, probablemente `granite-4-h-small`, como indica el alias. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros completos (más allá del rango LoRA y los módulos objetivo).

## Capacidades

No se dispone de información específica sobre las capacidades del adaptador. Al estar basado en `Qwen3.6-27B`, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, posiblemente código y matemáticas), pero no se han publicado evaluaciones ni descripciones de funcionalidades concretas. Tampoco se documenta soporte para tool calling, agentes, modo de razonamiento extendido ni capacidades multimodales. La model card únicamente indica el método de carga y el propósito de investigación.

## Casos de uso

Dado el carácter experimental del adaptador y la ausencia de documentación sobre aplicaciones prácticas, los casos de uso son principalmente de investigación:

- Estudio de imitación conductual: el adaptador permite analizar cómo un modelo de 27B puede aproximar el comportamiento de un modelo más pequeño o de referencia (granite-4-h-small) mediante DPO con LoRA.
- Investigación en alineación: sirve como caso de estudio para comparar estrategias de ajuste por preferencias en modelos grandes.
- Evaluación de metodologías de entrenamiento eficiente: al ser un adaptador LoRA, permite experimentar con recursos limitados sin necesidad de reentrenar el modelo completo.
- Reproducibilidad de experimentos: al estar publicado con un seed específico (seed42) y una configuración definida, puede utilizarse para reproducir y verificar los resultados del estudio dementor.
- Desarrollo de pipelines de fine-tuning: el ejemplo de carga con PEFT puede servir como plantilla para integrar adaptadores similares en entornos de producción o investigación.
- Comparación de datasets de preferencias: el uso de OASST1 (presumible) permite estudiar el impacto de este dataset en la imitación de comportamiento.

No se recomienda su uso en aplicaciones comerciales o críticas sin una validación adicional, dado que no hay información sobre su rendimiento ni licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador ni para el modelo base Qwen3.6-27B en este contexto.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación del adaptador. Al tratarse de un adaptador LoRA, el requisito principal viene determinado por el modelo base `Qwen3.6-27B`. Para inferencia con el modelo base en precisión FP16, se estima que se necesitan aproximadamente 54 GB de VRAM (27B parámetros × 2 bytes), aunque esta cifra es orientativa y no ha sido confirmada por el autor. Con cuantización (por ejemplo, 4 bits) el requisito podría reducirse a unos 14 GB, pero no hay datos oficiales. Las GPU recomendadas dependerán del despliegue elegido; opciones habituales para modelos de 27B incluyen vLLM, llama.cpp, Ollama o TGI, pero no se ha validado su compatibilidad con este adaptador. La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos que permitan comparar este adaptador con otros modelos o adaptadores de características similares. La ausencia de benchmarks y de especificaciones del modelo base impide establecer una comparativa objetiva.

## Limitaciones y advertencias

- Adaptador de investigación: no ha sido validado para uso en producción ni para aplicaciones comerciales.
- Licencia no especificada: el uso comercial, la redistribución o la modificación pueden estar sujetos a restricciones desconocidas.
- Sin benchmarks publicados: no se puede evaluar su calidad o rendimiento en tareas estándar.
- Dependencia del modelo base: las limitaciones de Qwen3.6-27B (sesgos, alucinaciones, idiomas soportados, contexto) se trasladan al modelo final, pero no se documentan aquí.
- Dataset de entrenamiento: si se utilizó OASST1, este dataset puede contener sesgos inherentes a las conversaciones de voluntarios, lo que podría afectar al comportamiento del modelo.
- Fecha de publicación futura: el adaptador está fechado en agosto de 2026, lo que podría indicar un modelo experimental o una fecha incorrecta en los metadatos.
- Tamaño del adaptador: 1.0 GB es un tamaño considerable para un adaptador LoRA, lo que sugiere que podría incluir pesos adicionales o una configuración inusual; no se ha verificado su contenido.

## Enlaces

- HuggingFace: [dementor-research/dpo_oasst1_qwen3.6-27b_as_granite-4-h-small_seed42](https://huggingface.co/dementor-research/dpo_oasst1_qwen3.6-27b_as_granite-4-h-small_seed42)

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios) en la información proporcionada.
