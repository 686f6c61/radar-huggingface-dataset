# DAKSHiitm/tds-carbon-card

## Resumen
Este repositorio no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) que documenta el impacto ambiental de una ejecución de fine-tuning específica. Lo publica el usuario DAKSHiitm en HuggingFace y forma parte de una iniciativa académica denominada TDS GA8, centrada en la transparencia energética de los entrenamientos de modelos. La tarjeta reporta que el entrenamiento se realizó sobre 5 GPU NVIDIA A100 en la región us-central1, con un consumo total de 797,424 kWh y unas emisiones de 279,098 kg de CO₂ equivalente.

Aunque no se trata de un modelo con arquitectura o parámetros, esta ficha es relevante porque ejemplifica el movimiento Green AI, que busca cuantificar y reducir la huella de carbono del machine learning. La información se presenta en formato de model card estándar de HuggingFace, con metadatos estructurados (emisiones, hardware, región) que permiten auditorías ambientales. No se proporcionan detalles sobre el modelo subyacente, su tamaño o su tarea, por lo que esta tarjeta debe interpretarse como un registro de sostenibilidad, no como una especificación técnica de un sistema de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

Datos de entrenamiento reportados en la tarjeta:

| Parametro | Valor |
|---|---|
| Hardware | 5x NVIDIA A100 |
| Modo de entrenamiento | fine-tuning |
| Region | us-central1 |
| Horas de GPU | 269,4 h (PUE: 1,48) |
| Energia total | 797,424 kWh |
| Emisiones de CO₂ | 279,098 kg CO₂eq |
| Fuente de emisiones | codecarbon |
| Fecha de creacion | 2026-08-19 |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura del modelo que fue fine-tuneado, ya que la tarjeta se limita a documentar el consumo energético y las emisiones asociadas a ese proceso. El entrenamiento se llevó a cabo con 5 GPU NVIDIA A100 durante 269,4 horas, con un PUE (Power Usage Effectiveness) de 1,48, lo que indica la eficiencia del centro de datos. La energía total consumida fue de 797,424 kWh, y las emisiones de CO₂ equivalente se calcularon mediante la herramienta CodeCarbon, que estima la huella de carbono a partir de la ubicación geográfica y el mix eléctrico de la región us-central1.

No se mencionan técnicas de optimización, datasets utilizados, ni metodologías de entrenamiento como RLHF o DPO. La tarjeta es un registro de sostenibilidad, no una descripción técnica del modelo. Es probable que el fine-tuning se haya realizado sobre un modelo base existente, pero ese dato no se encuentra en la información proporcionada.

## Capacidades
- No se trata de un modelo de IA con capacidades funcionales (generación de texto, razonamiento, visión, etc.).
- Su única función es documentar el impacto ambiental de un entrenamiento concreto.
- Proporciona métricas cuantitativas de emisiones, energía y uso de hardware.
- Sigue el formato de model card de HuggingFace, facilitando la integración en pipelines de reporte ambiental.
- No soporta tool calling, agentes, ni ninguna capacidad de inferencia.

## Casos de uso
- Auditoría ambiental de entrenamientos de IA: esta tarjeta sirve como registro verificable para calcular la huella de carbono de un fine-tuning concreto, útil para empresas que necesitan reportar su impacto según normativas ESG.
- Comparativa de eficiencia entre configuraciones de hardware: al documentar GPU horas, energía y emisiones, permite comparar el coste ambiental de distintas infraestructuras (por ejemplo, A100 vs RTX 4090, como se ve en otras tarjetas similares).
- Investigación en Green AI: los datos de esta tarjeta pueden usarse para estudiar la relación entre la elección de región cloud y las emisiones, o para optimizar el uso de GPUs en entornos académicos.
- Transparencia en publicaciones científicas: los investigadores pueden adjuntar esta tarjeta a sus papers para cumplir con los requisitos de reproducibilidad y responsabilidad ambiental.
- Monitorización de proyectos de fine-tuning: el registro de 269,4 GPU horas y 797 kWh permite a los equipos técnicos estimar costes energéticos futuros y ajustar sus presupuestos.
- Documentación interna en empresas de IA: sirve como plantilla para estandarizar el reporte de emisiones en distintos proyectos, facilitando la toma de decisiones sobre qué modelos desplegar.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Esta tarjeta no contiene métricas de rendimiento del modelo (como MMLU, HumanEval, GSM8K, etc.) porque su propósito es exclusivamente el registro de emisiones y consumo energético. No se puede evaluar la calidad del modelo subyacente a partir de estos datos.

## Requisitos de hardware
- El entrenamiento documentado utilizó 5 GPU NVIDIA A100, un hardware de gama alta orientado a centros de datos.
- El consumo total de energía fue de 797,424 kWh, lo que implica un consumo medio de aproximadamente 2,96 kW durante las 269,4 horas de entrenamiento.
- No se especifica la VRAM de las GPUs, pero las A100 suelen tener 40 GB u 80 GB de memoria HBM2e.
- No se proporcionan requisitos para inferencia, ya que no se publica ningún modelo entrenado.
- Para reproducir el entorno de entrenamiento se necesitaría un clúster con al menos 5 A100, o acceso a una nube con instancias equivalentes (por ejemplo, Google Cloud con A100 en us-central1).
- No se mencionan opciones de despliegue como vLLM, Ollama o llama.cpp, porque no hay pesos que servir.

## Comparativa con modelos similares
Existen otras tarjetas de carbono similares en HuggingFace, como las publicadas por los usuarios Jesmelchi y Divya-netter, que documentan entrenamientos con hardware diferente. La comparativa se basa en el consumo energético y las emisiones reportadas:

| Repositorio | Hardware | GPU horas | Energia (kWh) | Emisiones (kg CO₂eq) | Region |
|---|---|---|---|---|---|
| DAKSHiitm/tds-carbon-card | 5x A100 | 269,4 | 797,424 | 279,098 | us-central1 |
| Jesmelchi/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible |
| Divya-netter/tds-carbon-card | 6x RTX 4090 | 388 | 1508,544 | 633,588 | us-east1 |

La tarjeta de DAKSHiitm muestra un consumo por GPU hora de aproximadamente 2,96 kWh (797,424 / 269,4), mientras que la de Divya-netter con RTX 4090 consume 3,89 kWh por GPU hora (1508,544 / 388). Esto sugiere que las A100 son ligeramente más eficientes energéticamente por hora de GPU en este contexto, aunque la comparación no es directa porque los modelos fine-tuneados pueden ser diferentes.

## Limitaciones y advertencias
- Esta tarjeta no contiene información sobre el modelo en sí: no se indica su arquitectura, tamaño, tarea ni rendimiento. No debe utilizarse para evaluar capacidades de IA.
- Las emisiones reportadas (279,098 kg CO₂eq) dependen del mix eléctrico de la región us-central1 y del factor PUE del centro de datos; pueden no ser representativas de otras ubicaciones.
- No se especifica la metodología exacta de CodeCarbon (versión, factores de emisión), lo que dificulta la reproducibilidad del cálculo.
- No hay licencia asociada al repositorio, por lo que el uso comercial de estos datos podría estar sujeto a restricciones no declaradas.
- La fecha de creación (2026-08-19) es futura en el momento de escribir esta ficha, lo que sugiere que los datos podrían ser simulados o pertenecer a un ejercicio académico hipotético.
- No se proporcionan pesos del modelo ni código, por lo que no es posible verificar ni reutilizar el entrenamiento.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/DAKSHiitm/tds-carbon-card
- Tarjeta similar de Jesmelchi: https://huggingface.co/Jesmelchi/tds-carbon-card
- Tarjeta similar de Divya-netter: https://huggingface.co/Divya-netter/tds-carbon-card
- Documentación de Applied Model Card (CHAI): https://www.chai.org/workgroup/applied-model
- Guía de model cards en OECD.AI: https://oecd.ai/en/catalogue/tools/model-cards
