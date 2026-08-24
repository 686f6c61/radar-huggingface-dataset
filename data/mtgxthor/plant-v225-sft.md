# MTGxTHOR/plant-v225-sft

## Resumen

El modelo `MTGxTHOR/plant-v225-sft` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario MTGxTHOR, diseñado para ajustar el modelo base multimodal Qwen/Qwen2.5-VL-3B-Instruct. Se trata de un fine-tuning con la librería PEFT que, según el nombre del repositorio, parece orientado a tareas de fitopatología vegetal (detección o clasificación de enfermedades en plantas), aunque la model card no proporciona detalles explícitos sobre el conjunto de datos ni el procedimiento de entrenamiento.

El adaptador tiene un tamaño de repositorio de 0,3 GB y está etiquetado como `text-generation`, lo que sugiere que se integra en el pipeline de generación de texto del modelo base. La relevancia de este modelo radica en su potencial para especializar un modelo vision-language (VLM) de 3B parámetros en un dominio concreto, aprovechando la eficiencia del LoRA para reducir costes de entrenamiento e inferencia. Sin embargo, la ausencia de documentación pública limita su evaluación rigurosa.

La fecha de creación (agosto de 2026) y la falta de descargas o valoraciones indican que es un modelo reciente y sin adopción comunitaria. No se dispone de información sobre la licencia, los idiomas soportados ni los datos de entrenamiento, por lo que cualquier uso en producción debe considerar estas incertidumbres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-VL-3B-Instruct (transformer multimodal vision-language) |
| Parametros totales | No disponible (el adaptador LoRA tiene un numero reducido de parametros, pero no se especifica) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base; Qwen2.5-VL-3B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors, pero no se indican cuantizaciones) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-VL soporta multiples idiomas, pero no se especifica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-VL-3B-Instruct, un modelo multimodal de la familia Qwen2.5-VL que combina un codificador de vision con un transformer de lenguaje. El adaptador fue entrenado con la librería PEFT (versión 0.18.1) y se distribuye como un conjunto de pesos safetensors que deben cargarse junto con el modelo base. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se utilizaron técnicas como RLHF o DPO. El nombre del repositorio sugiere una especialización en fitopatología, pero no hay evidencia documental que lo confirme.

Dado que el adaptador es un LoRA, la arquitectura subyacente es la del modelo base: un transformer con atención multimodal que procesa imágenes y texto. La innovación técnica principal reside en la eficiencia del LoRA, que solo actualiza matrices de bajo rango en las capas de atención, reduciendo drásticamente el número de parámetros entrenables y los requisitos de memoria durante el fine-tuning.

## Capacidades

- Generacion de texto y respuestas a instrucciones, heredadas del modelo base Qwen2.5-VL-3B-Instruct.
- Comprension de imagenes y texto (multimodal), ya que el modelo base es un VLM.
- Posible especializacion en tareas de fitopatologia vegetal (clasificacion o deteccion de enfermedades), segun el nombre del repositorio, aunque no hay documentacion que lo verifique.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-VL-3B-Instruct incluye estas capacidades, pero no se confirma que el adaptador las preserve.
- Capacidades multilingues: el modelo base soporta varios idiomas, pero no se especifica el alcance en este adaptador.
- No se dispone de informacion sobre modos especiales (thinking, vision, audio) mas alla de las capacidades inherentes del modelo base.

## Casos de uso

- Clasificacion de enfermedades vegetales en imagenes: el adaptador podria utilizarse para identificar patologias en hojas o cultivos a partir de fotografias, aprovechando la multimodalidad del modelo base. Requiere validacion previa con datos reales.
- Asistente agricola de soporte: integrado en un chatbot, podria responder consultas sobre sintomas de plantas combinando texto e imagenes enviadas por el usuario.
- Analisis de imagenes de campo para investigacion agronomica: los investigadores podrian usarlo para preprocesar imagenes y extraer descripciones textuales de anomalias.
- Generacion de informes tecnicos: a partir de imagenes de plantas, el modelo podria redactar descripciones de sintomas y posibles causas, aunque la fiabilidad no esta garantizada.
- Educacion y divulgacion: como herramienta de aprendizaje para estudiantes de agronomia, permitiendo explorar imagenes de plantas y recibir explicaciones.
- Prototipado rapido de aplicaciones de vision agricola: al ser un adaptador LoRA ligero, es adecuado para experimentar en entornos de desarrollo sin grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni metricas especificas de fitopatologia. El repositorio no incluye ninguna evaluacion cuantitativa.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 0,3 GB, pero requiere cargar el modelo base Qwen2.5-VL-3B-Instruct completo, que en precision fp16 ocupa aproximadamente 6-7 GB de VRAM.
- Con cuantizacion (por ejemplo, 4 bits), el modelo base puede caber en GPUs consumer con 8 GB de VRAM, como una RTX 3060 o RTX 4060.
- Para inferencia sin cuantizacion, se recomienda al menos 12 GB de VRAM (RTX 3080, RTX 4070, etc.).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers y PEFT.
- La latencia y el throughput dependen del hardware y de la cuantizacion; no se dispone de mediciones especificas para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El adaptador se basa en Qwen2.5-VL-3B-Instruct, que compite con otros VLM de tamano similar como PaliGemma-3B o LLaVA-1.6, pero no hay datos de rendimiento de este adaptador concreto. Se recomienda evaluar el modelo en tareas especificas antes de compararlo.

## Limitaciones y advertencias

- La model card esta vacia: no hay informacion sobre sesgos, limitaciones tecnicas ni recomendaciones de uso.
- Riesgo de alucinacion: al ser un modelo de generacion de texto, puede producir respuestas incorrectas o inventadas, especialmente en dominios especializados como la fitopatologia.
- Sin licencia especificada: no se puede determinar si el uso comercial esta permitido. Se debe contactar al autor antes de cualquier despliegue en produccion.
- Sin datos de entrenamiento publicados: no es posible verificar la calidad del fine-tuning ni su generalizacion a nuevos datos.
- Dependencia del modelo base: cualquier limitacion de Qwen2.5-VL-3B-Instruct (por ejemplo, sesgos en datos de entrenamiento) se hereda en el adaptador.
- El modelo no tiene descargas ni validacion comunitaria, lo que aumenta el riesgo de errores no detectados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MTGxTHOR/plant-v225-sft
- Perfil del autor: https://huggingface.co/MTGxTHOR
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
