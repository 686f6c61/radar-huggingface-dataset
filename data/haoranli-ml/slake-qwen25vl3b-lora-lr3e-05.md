# haoranli-ml/slake-qwen25vl3b-lora-lr3e-05

## Resumen

`haoranli-ml/slake-qwen25vl3b-lora-lr3e-05` es un adaptador LoRA (PEFT) publicado por el usuario Haoran Li sobre el modelo base `Qwen/Qwen2.5-VL-3B-Instruct`, el modelo multimodal de 3.000 millones de parámetros de Alibaba Qwen. Por el nombre del repositorio y la referencia "slake" se deduce que el ajuste fino se ha realizado sobre el conjunto de datos SLAKE, un benchmark de preguntas y respuestas visuales en el dominio médico (radiología, principalmente TC y resonancias). El adaptador tiene un tamaño de repositorio de 0,1 GB, coherente con pesos LoRA de bajo rango y no con un modelo completo.

El modelo resultante es, por tanto, un especialista en VQA médica construido sobre un VLM generalista pequeño. No se trata de un modelo nuevo entrenado desde cero, sino de un delta de pesos que debe combinarse con el checkpoint base de Qwen2.5-VL-3B-Instruct para funcionar. La model card está prácticamente vacía: todos los campos de descripción, datos de entrenamiento, hiperparámetros y evaluación contienen el marcador `[More Information Needed]`, por lo que la mayor parte de las especificaciones de esta ficha se infieren del modelo base o se marcan como no disponibles.

La relevancia de esta publicación es limitada y experimental: cero descargas y cero "likes" en el momento de la consulta, sin licencia declarada y sin documentación. Resulta útil como ejemplo de flujo de trabajo de fine-tuning LoRA sobre un VLM médico, pero no es un artefacto listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL (vision encoder + LLM decoder) |
| Parametros totales | 3B en el modelo base; el adaptador LoRA ocupa 0,1 GB (rango y alpha no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-VL-3B-Instruct soporta 32.768 tokens nativos, ampliables |
| Tipos de cuantizacion | no disponible para el adaptador; el base admite bf16/fp16 y cuantizaciones GGUF/AWQ derivadas de la comunidad |
| Idiomas soportados | no disponibles; el base Qwen2.5-VL cubre principalmente ingles y chino, con multilingue parcial |
| Licencia | no disponible (la del adaptador no se declara; la del base Qwen2.5-VL-3B-Instruct es Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-3B-Instruct, un transformer multimodal con un codificador visual tipo ViT que proyecta parches de imagen al espacio de tokens del decodificador lingüístico Qwen2.5 de 3B parámetros. El ajuste se realiza con LoRA, es decir, matrices de bajo rango insertadas en las capas lineales del modelo, lo que congela los pesos originales y entrena únicamente los deltas. La librería declarada es PEFT 0.21.2 y el pipeline es `text-generation`, aunque la naturaleza real del modelo es visión-lenguaje.

No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset (más allá de la referencia implícita a SLAKE en el nombre), la configuración de LoRA (rango, alpha, módulos objetivo), la tasa de aprendizaje efectiva ni si se aplicó RLHF o DPO. El sufijo `lr3e-05` del identificador sugiere una tasa de aprendizaje de 3e-5, dato que no está confirmado en la documentación. No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y razonamiento multimodal: al heredar Qwen2.5-VL-3B-Instruct, puede procesar imágenes junto con texto y responder preguntas sobre ellas.
- Respuesta a preguntas visuales en dominio médico: el ajuste sobre SLAKE apunta a VQA sobre imágenes radiológicas, con preguntas de tipo sí/no, abiertas y de elección múltiple.
- Comprensión de documentos e imágenes con texto: capacidad heredada del base para OCR y lectura de documentos.
- Soporte de tool calling y function calling: heredado del base Qwen2.5, aunque el ajuste LoRA puede degradar esta capacidad si el dataset de entrenamiento no la incluye.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador; el base las soporta parcialmente.
- Capacidades multilingües: no documentadas; el base está orientado a inglés y chino.
- Capacidades especiales (modo thinking, audio): no disponibles.

## Casos de uso

- Asistencia a la interpretación de radiología docente: el adaptador puede responder preguntas estructuradas sobre imágenes de TC o resonancia en el formato de SLAKE, útil como herramienta de apoyo en formación médica, siempre con supervisión humana.
- Etiquetado asistido de informes radiológicos: generar respuestas preliminares a preguntas cerradas (presencia de hallazgos, localización, modalidad) para acelerar la anotación de datasets médicos.
- Investigación en VQA médica: servir como línea base ajustada para comparar estrategias de fine-tuning LoRA sobre VLMs pequeños en dominios clínicos.
- Prototipado de chatbots clínicos restringidos: integrar el modelo en un pipeline que responda únicamente a preguntas sobre imágenes aportadas por el usuario, con validación posterior por un profesional.
- Extracción de información de imágenes médicas en investigación: combinar el modelo con un OCR y un post-procesado para poblar bases de datos de hallazgos a partir de estudios anonimizados.
- Evaluación comparativa de adaptadores: usar este checkpoint como referencia en experimentos que midan el efecto de distintos hiperparámetros LoRA (por ejemplo, la tasa de aprendizaje 3e-5 implícita en el nombre) sobre la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de SLAKE, MMMU, MMBench ni de ningún otro conjunto, y no se han encontrado evaluaciones externas del adaptador en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 requiere aproximadamente 6-7 GB de VRAM; con cuantización de 8 bits baja a unos 4 GB y en 4 bits a unos 2,5-3 GB. El adaptador LoRA añade un consumo marginal (0,1 GB en disco).
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o superiores para bf16; RTX 3060 de 12 GB o incluso GPUs de 8 GB con cuantización para pruebas.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 Ti de 12-16 GB sin cuantizar y en GPUs de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sobre el base; vLLM y TGI admiten adaptadores LoRA en algunos casos, aunque la integración con modelos multimodales puede requerir versiones recientes; llama.cpp/Ollama solo si se fusionan los pesos y se convierte a GGUF, ya que no cargan adaptadores PEFT directamente en todos los casos.
- Latencia y throughput estimados: no disponibles. Para un modelo de 3B en una RTX 4090 se pueden esperar decenas de tokens por segundo en decodificación, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| haoranli-ml/slake-qwen25vl3b-lora-lr3e-05 | 3B (base) + LoRA | no disponible (base 32k) | VQA médica (SLAKE) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | 32.768 tokens | VLM generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| LLaVA-Med (variantes 7B) | 7B | 4.096 tokens típicamente | VQA médica | investigación (no comercial en algunas variantes) | Hugging Face / GitHub |
| Med-Flamingo | 8-9B | 2.048 tokens | VQA médica few-shot | CC BY-NC 4.0 (no comercial) | Hugging Face |

La comparación con LLaVA-Med y Med-Flamingo es aproximada: no hay métricas publicadas de este adaptador que permitan establecer una comparación cuantitativa. Frente al base Qwen2.5-VL-3B-Instruct, la diferencia esperada es una mejora en el dominio SLAKE a costa de posible degradación en capacidades generales, algo que no se ha verificado.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni sesgos, lo que impide auditar el modelo.
- Riesgo de alucinación elevado en dominio médico: un VLM de 3B ajustado con LoRA sobre un dataset limitado puede generar hallazgos inexistentes; no debe usarse para diagnóstico sin validación profesional.
- Sesgos desconocidos: al no documentarse la composición del dataset SLAKE (procedencia de las imágenes, demografía de los pacientes), no se pueden evaluar sesgos de población, modalidad o equipo de imagen.
- Licencia no declarada: la ausencia de licencia en el adaptador impide determinar si el uso comercial está permitido; la licencia Apache 2.0 del base no cubre automáticamente los pesos derivados.
- Idiomas: no se especifican; es probable que el ajuste esté en inglés (idioma de SLAKE) y que el rendimiento en castellano sea deficiente.
- Contexto: el adaptador no documenta cambios en la ventana de contexto; se hereda la del base, sujeta a los límites de memoria en GPUs pequeñas.
- Repositorio sin tracción: cero descargas y cero "likes", sin issues ni discusión, lo que reduce la probabilidad de que los errores hayan sido detectados por la comunidad.
- Riesgo de sobreajuste: el nombre del repositorio sugiere un único experimento de tasa de aprendizaje; no hay evidencia de validación cruzada ni de conjuntos de test independientes.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/haoranli-ml/slake-qwen25vl3b-lora-lr3e-05
- Perfil del autor: https://huggingface.co/haoranli-ml
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Referencia del paper de PEFT/LoRA citada en los tags: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
