# chibifire/EditScore-7B

## Resumen

EditScore-7B es un modelo de recompensa (reward model) de código abierto diseñado para evaluar y mejorar la edición de imágenes guiada por instrucciones. Desarrollado por el equipo de VectorSpaceLab, se presenta como un adaptador LoRA sobre el modelo de visión-lenguaje Qwen2.5-VL-7B-Instruct. El modelo asigna una puntuación de calidad a las ediciones de imagen, y su principal objetivo es proporcionar una señal de recompensa fiable para entrenamiento por refuerzo (RL) y para reranking de salidas de otros modelos de edición. Es parte de la serie EditScore, que incluye modelos de 7B a 72B, y destaca por igualar o superar el rendimiento de modelos propietarios de gran tamaño en el benchmark EditReward-Bench. Su relevancia actual radica en que el RL para edición de imágenes ha estado limitado por la falta de señales de recompensa de alta fidelidad, y este modelo pretende llenar ese vacío.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-VL-7B-Instruct (transformers de visión-lenguaje) |
| Parametros totales | 7B (modelo base) + adaptador LoRA; parámetros del adaptador no especificados |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

EditScore-7B se construye como un adaptador LoRA (Low-Rank Adaptation) sobre el modelo de visión-lenguaje Qwen2.5-VL-7B-Instruct. Esto significa que los pesos del modelo base permanecen congelados y solo se entrenan matrices de bajo rango, lo que reduce el coste de entrenamiento y el tamaño del repositorio (0.3 GB). El modelo es un reward model: dado un par (imagen original, instrucción de edición, imagen editada), produce una puntuación que indica la calidad de la edición. Según el README, el entrenamiento se basó en una curación meticulosa de datos y una estrategia de auto-ensamblaje (self-ensembling) que permite que el modelo más grande de la serie supere a GPT-5 en EditReward-Bench. No se proporcionan detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Evaluación de calidad de ediciones de imagen: asigna una puntuación numérica a la fidelidad de una edición guiada por instrucciones.
- Soporte multimodal: al estar basado en Qwen2.5-VL, procesa entradas de imagen y texto.
- Uso como reranker: puede seleccionar la mejor salida entre N candidatas de un modelo de edición (Best-of-N).
- Uso como señal de recompensa para RL: proporciona un feedback de alta fidelidad para entrenar modelos de edición mediante aprendizaje por refuerzo.
- Compatibilidad con vLLM: el README recomienda vLLM para un rendimiento óptimo.
- No se mencionan capacidades de tool calling, agentes ni modo de razonamiento explícito.

## Casos de uso

- Evaluación automática de modelos de edición: usar EditScore-7B para puntuar salidas de modelos como OmniGen2, Flux-dev-Kontext o Qwen-Image-Edit en pipelines de evaluación.
- Reranking en producción: integrar el modelo como un paso de post-procesado que selecciona la mejor imagen editada entre varias generaciones.
- Recompensa para RL: emplear la puntuación como reward signal en el fine-tuning de modelos de edición mediante RL, evitando el colapso de entrenamiento que ocurre con VLMs generalistas.
- Investigación en reward modeling: servir como baseline para estudiar la calidad de señales de recompensa en dominios multimodales.
- Filtrado de datasets: puntuar ediciones generadas automáticamente para descartar ejemplos de baja calidad antes de entrenar otros modelos.
- Benchmarking: comparar la calidad de distintos modelos de edición usando una métrica estandarizada y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README afirma cualitativamente que la serie EditScore alcanza un rendimiento de vanguardia en EditReward-Bench, superando a VLMs propietarios y, en su modelo más grande con auto-ensamblaje, a GPT-5. Sin embargo, no se proporcionan tablas con métricas concretas en la información suministrada.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la información disponible.
- Como adaptador LoRA sobre Qwen2.5-VL-7B-Instruct, se puede inferir que el hardware necesario es similar al del modelo base: aproximadamente 14-16 GB de VRAM en precisión FP16 para inferencia.
- El README recomienda instalar vLLM para un mejor rendimiento, lo que sugiere que la inferencia se beneficia de esta librería.
- No se ofrecen datos de latencia ni throughput.
- Para despliegue, se puede usar vLLM, transformers/PEFT o llama.cpp si se convierte el adaptador a GGUF, aunque esto último no está documentado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de recompensa para edición de imágenes.

## Limitaciones y advertencias

- Licencia no especificada: el modelo no indica una licencia en HuggingFace, lo que genera incertidumbre sobre su uso comercial.
- Dependencia del modelo base: al ser un adaptador LoRA, requiere descargar y cargar Qwen2.5-VL-7B-Instruct, lo que condiciona el hardware y la disponibilidad.
- Tamaño del adaptador: el repositorio solo contiene los pesos LoRA (0.3 GB), no el modelo completo; los usuarios deben integrarlo con el modelo base.
- Riesgo de subjetividad: como reward model, las puntuaciones son inherentemente subjetivas y pueden no reflejar preferencias humanas en todos los casos.
- Sin datos de idiomas: no se especifica qué idiomas soporta, aunque el modelo base Qwen2.5-VL-7B-Instruct tiene capacidades multilingües.
- Estado de desarrollo: el README indica que hay funcionalidades pendientes (TODO), como el código de entrenamiento RL y scripts de inferencia Best-of-N.

## Enlaces

- HuggingFace: https://huggingface.co/chibifire/EditScore-7B
- HuggingFace (organización EditScore): https://huggingface.co/EditScore/EditScore-7B
- Paper (arXiv): https://arxiv.org/abs/2509.23909
- GitHub: https://github.com/VectorSpaceLab/EditScore
- Página del proyecto: https://vectorspacelab.github.io/EditScore
- Colección de modelos: https://huggingface.co/collections/EditScore/editscore-68d8e27ee676981221db3cfe
- Dataset EditReward-Bench: https://huggingface.co/datasets/EditScore/EditReward-Bench
