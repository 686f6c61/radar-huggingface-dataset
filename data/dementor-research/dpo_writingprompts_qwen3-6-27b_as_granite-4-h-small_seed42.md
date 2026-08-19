# dementor-research/dpo_writingprompts_qwen3.6-27b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO sobre el modelo base `Qwen/Qwen3.6-27B`, como parte de un estudio de imitación conductual denominado **dementor** llevado a cabo por el grupo de investigación `dementor-research`. Según la nomenclatura del archivo, el objetivo es que el modelo resultante imite el comportamiento de `Granite-4-H-Small` en tareas de escritura creativa a partir de consignas (*writing prompts*). El adaptador se generó mediante la herramienta Tinker de Thinking Machines, con un rango LoRA de 32 y actualización de todas las capas lineales.

La relevancia de este modelo reside en su carácter experimental: permite estudiar cómo se transfiere el comportamiento de un modelo pequeño (Granite-4-H-Small) a uno más grande (Qwen3.6-27B) mediante fine-tuning con preferencias (DPO). No se trata de un modelo independiente, sino de un adaptador PEFT que debe combinarse con el modelo base para su uso. El tamaño del repositorio es de 1,0 GB, lo que corresponde únicamente a los pesos del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen/Qwen3.6-27B (transformador causal) |
| Parametros totales | No disponible (adaptador: ~1 GB; base: 27 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, se espera 131072 tokens según Qwen3) |
| Tipos de cuantizacion | No aplicable (adaptador en safetensors, el base puede cuantizarse) |
| Idiomas soportados | No disponibles (heredados del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3.6-27B`, un modelo de lenguaje de tipo transformer causal con 27 mil millones de parámetros. El entrenamiento se realizó mediante **DPO** (Direct Preference Optimization) con una configuración LoRA de rango 32 y `target_modules=all-linear`, lo que significa que se actualizaron todas las capas lineales del modelo base durante el ajuste. Esta técnica permite modificar el comportamiento del modelo con un coste computacional reducido en comparación con un fine-tuning completo.

Los datos de entrenamiento no se detallan en la model card, pero el nombre del adaptador (`dpo_writingprompts`) sugiere que se utilizaron consignas de escritura. El estudio forma parte de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración. No se especifican hiperparámetros adicionales, composición del dataset ni si se aplicaron otras etapas como RLHF o SFT previa.

## Capacidades

- **Imitación conductual**: el adaptador está diseñado para replicar el estilo de respuesta de Granite-4-H-Small en tareas de escritura creativa, según el objetivo del estudio.
- **Hereda capacidades del modelo base**: al ser un adaptador sobre Qwen3.6-27B, se espera que conserve las capacidades generales de Qwen3 en generación de texto, razonamiento, código y multilingüismo, aunque no hay verificación empírica en esta ficha.
- **Fine-tuning con preferencias**: el uso de DPO implica que el modelo ha sido optimizado para preferir ciertos estilos de respuesta frente a otros, lo que puede afectar a la naturalidad y coherencia en escritura.
- **Sin capacidades especiales adicionales**: no se documentan tool calling, agentes, visión ni modo de razonamiento explícito más allá de lo que ofrezca el modelo base.

## Casos de uso

- **Investigación en transferencia de comportamiento**: permite estudiar cómo un modelo pequeño (Granite-4-H-Small) puede "enseñar" su estilo a un modelo más grande mediante DPO, útil para laboratorios que investigan destilación de comportamiento.
- **Generación de textos creativos con estilo controlado**: si el estudio logra su objetivo, el adaptador podría usarse para generar relatos, cuentos o respuestas con un estilo similar al de Granite-4-H-Small, aunque esto no está validado públicamente.
- **Benchmarking de técnicas de alineación**: sirve como caso de estudio para comparar DPO frente a otros métodos de fine-tuning en términos de fidelidad al comportamiento objetivo.
- **Experimentos de ablación**: al ser parte de una campaña con múltiples configuraciones, puede utilizarse para aislar el efecto del rango LoRA, el dataset o la semilla en la imitación.
- **Educación en PEFT**: ejemplo práctico de cómo cargar y usar un adaptador LoRA con la librería `peft` sobre un modelo grande, útil para cursos de fine-tuning eficiente.
- **Evaluación de robustez**: permite probar si un adaptador entrenado en escritura creativa mantiene la calidad en otras tareas, sirviendo como métrica de generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. Tampoco se comparan resultados con el modelo base o con Granite-4-H-Small.

## Requisitos de hardware

- **VRAM estimada**: depende del modelo base. Qwen3.6-27B en precisión fp16 requiere aproximadamente 54 GB de VRAM solo para los pesos. Con cuantización a 4 bits (por ejemplo, bitsandbytes) puede reducirse a unos 16-20 GB. El adaptador LoRA añade un coste mínimo (menos de 1 GB adicional).
- **GPU recomendadas**: para fp16 se necesitan GPUs de datacenter como A100 (80 GB) o H100 (80 GB). Para cuantización 4 bits, una RTX 4090 (24 GB) o A6000 (48 GB) son suficientes.
- **Compatibilidad con consumer GPU**: sí, si se usa cuantización y se limita la longitud de contexto. Una RTX 3090/4090 puede ejecutar el modelo con 4 bits.
- **Opciones de despliegue**: al ser un adaptador PEFT, debe cargarse junto al modelo base mediante `transformers` y `peft`. Para inferencia en producción se puede exportar a GGUF (llama.cpp, Ollama) o servir con vLLM, aunque no se proporcionan pasos específicos.
- **Latencia y throughput**: no disponibles. Dependen del hardware, la cuantización y la longitud de secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El adaptador es específico para imitar a Granite-4-H-Small y no existen métricas públicas. Como referencia, se puede comparar conceptualmente con:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.6-27B (base) | 27 B | 131072 (esperado) | Apache 2.0 (verificar) | HuggingFace |
| Granite-4-H-Small | ~3 B (estimado) | no disponible | no disponible | no disponible |
| Adaptador dementor (este) | ~1 GB (LoRA) | hereda del base | no disponible | HuggingFace |

La comparación real requiere ejecutar benchmarks sobre los tres modelos, lo que no está documentado.

## Limitaciones y advertencias

- **Naturaleza experimental**: es un adaptador de investigación, sin garantías de calidad ni soporte. No debe usarse en producción sin una evaluación exhaustiva.
- **Licencia no especificada**: no se indica la licencia del adaptador ni la del modelo base en la model card. Esto puede impedir su uso comercial o incluso su redistribución. Hay que contactar con el autor o revisar el repositorio del modelo base.
- **Riesgo de alucinación y sesgos**: al ser un fine-tuning sobre un modelo grande, puede heredar sesgos del base y del dataset de escritura creativa. No hay estudios de sesgo publicados.
- **Dependencia del modelo base**: el adaptador no funciona de forma aislada; requiere cargar Qwen3.6-27B, lo que implica un coste de hardware significativo.
- **Falta de transparencia en datos**: no se detallan los datos de entrenamiento, el proceso de selección de pares preferidos en DPO ni los criterios de evaluación, lo que dificulta la reproducibilidad.
- **Posible sobreajuste al estilo objetivo**: el adaptador podría degradar el rendimiento en tareas fuera del dominio de escritura creativa, aunque no hay evidencia empírica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_qwen3.6-27b_as_granite-4-h-small_seed42
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
- No se han encontrado papers, blogs o demos adicionales sobre este adaptador concreto.
