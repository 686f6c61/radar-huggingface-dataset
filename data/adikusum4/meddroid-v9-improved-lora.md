# adikusum4/meddroid-v9-improved-lora

## Resumen

MedDroid v9 Improved LoRA es un adaptador de ajuste fino supervisado (SFT) publicado por el usuario adikusum4 en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos LoRA que se aplican sobre el modelo base `unsloth/medgemma-4b-it-unsloth-bnb-4bit`, una versión del modelo MedGemma 4B de Google cuantizada a 4 bits mediante la librería Unsloth. El adaptador está empaquetado con la librería PEFT (versión 0.21.2) y su propósito declarado, por el nombre, es el dominio médico, aunque la model card no documenta explícitamente el conjunto de datos ni los objetivos de entrenamiento.

El interés técnico del artefacto reside en su formato: un adaptador LoRA ligero (el repositorio ocupa 0,1 GB) que puede cargarse sobre un modelo base de 4B parámetros ya cuantizado, lo que permite ajustes específicos de dominio sin necesidad de reentrenar el modelo completo ni de almacenar pesos completos. Esto lo hace relevante para experimentación en entornos con recursos limitados, siempre que se disponga del modelo base y de la infraestructura PEFT/Unsloth.

No obstante, la información publicada es muy escasa: la model card es una plantilla sin rellenar, no se especifican licencia, idiomas, datos de entrenamiento ni resultados de evaluación. Cualquier uso en producción requeriría validar el comportamiento del adaptador de forma independiente y verificar la licencia del modelo base MedGemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base MedGemma 4B) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/medgemma-4b-it-unsloth-bnb-4bit`, una variante del modelo MedGemma 4B instruct de Google adaptada por Unsloth para entrenamiento e inferencia eficientes con cuantización de 4 bits (bitsandbytes). La técnica de ajuste es LoRA combinada con SFT (supervised fine-tuning), según las etiquetas del repositorio, e integra las librerías transformers, TRL, PEFT y Unsloth.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset, hiperparámetros (rango de LoRA, alpha, learning rate, épocas) ni sobre si se aplicaron técnicas de alineación adicionales como RLHF o DPO. La model card no documenta ninguno de estos aspectos y la sección de hiperparámetros queda como plantilla sin rellenar. Tampoco se especifican innovaciones técnicas más allá del uso de Unsloth para el ajuste eficiente.

## Capacidades

- Generación de texto conversacional en el dominio médico, heredada del modelo base MedGemma 4B instruct.
- Ajuste específico de dominio mediante LoRA, orientado presumiblemente a terminología y tareas clínicas (no documentado explícitamente).
- Capacidad potencial de razonamiento médico y respuesta a preguntas clínicas, sujeta al comportamiento del modelo base.
- Soporte de tool calling y function calling: no disponible (no documentado para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Capacidades especiales (modo thinking, visión, audio): no disponible para el adaptador; el modelo base MedGemma es multimodal, pero el adaptador no lo documenta.

## Casos de uso

- Experimentación académica en NLP clínico: el adaptador permite probar ajustes de dominio médico sobre un modelo base de 4B sin necesidad de entrenar desde cero, útil para prototipos de investigación en entornos con una sola GPU.
- Generación de resúmenes de notas clínicas: si el ajuste ha cubierto datos de este tipo, podría emplearse para condensar historiales, aunque requiere validación previa con datos reales anonimizados.
- Respuesta a preguntas sobre terminología médica: uso como asistente de consulta para profesionales en formación, siempre con revisión humana y sin valor diagnóstico.
- Prototipado de asistentes conversacionales sanitarios: el formato LoRA sobre un base de 4B permite desplegar un chatbot ligero en una GPU de consumo para demos internas.
- Investigación en eficiencia de ajuste: sirve como caso de estudio de pipelines Unsloth + PEFT + TRL para comparar estrategias de cuantización y LoRA en dominios especializados.
- Evaluación comparativa de adaptadores médicos: puede integrarse en suites de evaluación para medir la degradación o mejora respecto al modelo base en tareas clínicas estandarizadas.
- Fine-tuning incremental: al ser un adaptador, puede combinarse o sustituirse por otros adaptadores LoRA para experimentar con mezclas de dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits requiere aproximadamente 3-4 GB de VRAM para los pesos, más memoria para el contexto y el adaptador (típicamente por debajo de 1 GB adicional). Con contexto largo, se recomienda al menos 8 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM, gracias a la cuantización 4 bits del modelo base.
- Opciones de despliegue: transformers con PEFT, vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp (requiere conversión del base a GGUF y fusión del adaptador), Ollama (tras fusionar y convertir).
- Latencia y throughput estimados: no disponibles; dependen del hardware, la longitud de contexto y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MedDroid v9 Improved LoRA (este) | Adaptador sobre base 4B | No disponible | No disponible | safetensors (LoRA) | Hugging Face |
| MedGemma 4B IT (base) | 4B | No disponible en la informacion | No disponible en la informacion | safetensors | Hugging Face (Google) |
| Meditron 7B | 7B | No disponible | No disponible en la informacion | safetensors | Hugging Face |
| BioMistral 7B | 7B | No disponible | No disponible en la informacion | safetensors | Hugging Face |

La comparación cuantitativa no es posible con la información disponible; los modelos alternativos se citan por categoría (LLM de dominio médico de tamaño similar) y sus especificaciones deberían verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, evaluación ni uso previsto, lo que impide garantizar un comportamiento fiable.
- Riesgo elevado de alucinación en contenido médico, con posibles consecuencias graves si se usa sin supervisión profesional.
- Sesgos desconocidos: al no documentarse la composición del dataset, no puede evaluarse el sesgo demográfico, lingüístico ni clínico.
- Licencia no declarada: no puede confirmarse la legalidad de uso comercial; además, la licencia del modelo base MedGemma debe verificarse por separado.
- Idiomas no declarados: se desconoce si el adaptador conserva el multilingüismo del modelo base o si está sesgado hacia el inglés.
- Contexto no documentado: no se conoce la ventana máxima efectiva tras el ajuste.
- Sin descargas ni validación comunitaria: el repositorio no tiene descargas ni likes, por lo que no existe evidencia externa de su calidad.
- No apto para uso clínico directo: cualquier aplicación sanitaria requeriría validación regulatoria y evaluación clínica independiente.
- Dependencia del modelo base cuantizado: la calidad final depende de la cuantización 4 bits y del adaptador Unsloth, lo que puede introducir degradaciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adikusum4/meddroid-v9-improved-lora
- Modelo base: https://huggingface.co/unsloth/medgemma-4b-it-unsloth-bnb-4bit
- Paper de referencia sobre impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- Librería PEFT: https://github.com/huggingface/peft
- Librería Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
