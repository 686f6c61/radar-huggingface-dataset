# mkornreich/smollm2-360m-job-qa

## Resumen

El modelo `mkornreich/smollm2-360m-job-qa` es un ajuste fino (LoRA) sobre el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`, desarrollado por el autor `mkornreich`. Está diseñado específicamente para responder preguntas sobre una única oferta de empleo, anclando sus respuestas exclusivamente en el contenido de dicha oferta, utilizando el término "Likely" para inferencias razonables y rechazando responder cuando la información no está presente. El modelo fue destilado a partir de un profesor `qwen2.5:7b` utilizando ofertas de trabajo reales, posteriormente fusionado, exportado a formato ONNX (con caché de pasado) y cuantizado a int8 (q8). Con 360 millones de parámetros, está optimizado para ejecutarse en el navegador mediante `transformers.js`, lo que lo hace adecuado para aplicaciones de procesamiento de lenguaje natural en el lado del cliente con requisitos mínimos de hardware.

Su relevancia radica en ofrecer una solución ligera y especializada para el análisis de ofertas de empleo, permitiendo a desarrolladores integrar un asistente de preguntas y respuestas contextualizado sin depender de servicios externos ni de modelos de gran tamaño. Al ser un modelo compacto y cuantizado, puede desplegarse en entornos con recursos limitados, como dispositivos móviles o aplicaciones web, manteniendo un enfoque en la privacidad de los datos al procesar la información localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en SmolLM2-360M-Instruct) |
| Parametros totales | 360 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (q8) en formato ONNX |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fichero `model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer decoder del modelo `SmolLM2-360M-Instruct`, que a su vez es un modelo de lenguaje compacto entrenado por Hugging Face sobre 4 billones de tokens. Sobre esta base se aplicó un ajuste fino mediante LoRA (Low-Rank Adaptation) para especializarlo en la tarea de responder preguntas sobre ofertas de empleo. El proceso de entrenamiento utilizó destilación desde un modelo profesor `qwen2.5:7b`, que generó respuestas sobre ofertas reales, las cuales sirvieron como datos de entrenamiento. Tras el ajuste, los pesos del LoRA se fusionaron con el modelo base y se exportaron a ONNX con soporte para caché de pasado (with-past), optimizando la inferencia. Finalmente, el modelo se cuantizó a int8 (q8) para reducir su huella de memoria y permitir su ejecución en el navegador mediante `transformers.js`. No se menciona el uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto contextualizada: responde preguntas basándose únicamente en una oferta de empleo proporcionada como contexto.
- Manejo de inferencias: utiliza la palabra "Likely" para indicar respuestas que no están explícitas pero que pueden deducirse razonablemente de la oferta.
- Rechazo de respuestas: si la oferta no contiene la información necesaria, el modelo se niega a responder, evitando alucinaciones.
- Conversación multi-turno: al ser un modelo instruct, puede mantener diálogos cortos centrados en el contexto de la oferta.
- Ejecución en navegador: gracias a la cuantización q8 y al formato ONNX, funciona con `transformers.js` sin necesidad de servidor.
- Especialización en dominios: limitado a ofertas de empleo, pero con alta precisión en ese ámbito.

## Casos de uso

- Asistente de preguntas sobre ofertas de empleo en portales web: el modelo puede integrarse en una página de empleo para que los candidatos pregunten detalles específicos (salario, requisitos, ubicación) sin salir del sitio, respondiendo solo con la información publicada.
- Filtrado de candidatos automatizado: un sistema puede extraer preguntas frecuentes de los candidatos y usar el modelo para verificar si la oferta las responde, ayudando a identificar vacíos de información.
- Chatbot de recursos humanos en intranet: desplegado en la red interna de una empresa, permite a los empleados consultar ofertas internas de manera privada, sin enviar datos a servidores externos.
- Análisis de cumplimiento de ofertas: el modelo puede comparar las respuestas dadas con el contenido real de la oferta para detectar inconsistencias o promesas no respaldadas.
- Generación de resúmenes de ofertas: aunque no es su función principal, puede usarse para extraer los puntos clave de una oferta en formato pregunta-respuesta, facilitando la revisión rápida.
- Aplicaciones educativas: para enseñar a estudiantes cómo interpretar ofertas de empleo, el modelo puede simular un entrevistador que hace preguntas y verifica si la información está en el texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas comparativas como MMLU, HumanEval o similares para este modelo ajustado.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en cuantización q8 (el tamaño del repositorio es de 0.4 GB, lo que sugiere que el modelo completo cabe en memoria).
- GPU recomendada: no es necesaria; puede ejecutarse en CPU. En caso de usar GPU, cualquier modelo con al menos 1 GB de VRAM es suficiente.
- Compatibilidad con GPU de consumo: sí, funciona en tarjetas como la RTX 3060 o superiores, e incluso en integradas.
- Opciones de despliegue: `transformers.js` para navegador, ONNX Runtime para servidores o edge, y potencialmente `llama.cpp` si se convierte a GGUF (aunque no se menciona).
- Latencia y throughput: al ser un modelo de 360M con cuantización int8, la inferencia es rápida; en CPU moderna se esperan tiempos de respuesta inferiores a 100 ms por token, y en GPU aún menores.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada con modelos similares. El modelo es un ajuste especializado sobre SmolLM2-360M-Instruct, por lo que sus capacidades generales son comparables a las del modelo base, pero su rendimiento específico en QA de ofertas de empleo no ha sido publicado. Alternativas genéricas como `SmolLM2-135M` o `SmolLM2-1.7B` ofrecen diferentes tamaños pero no están especializadas en esta tarea. Se recomienda consultar la documentación de Hugging Face para más detalles.

## Limitaciones y advertencias

- Sesgos conocidos: al ser entrenado sobre ofertas de empleo reales, puede reflejar sesgos presentes en los datos de origen (por ejemplo, lenguaje de género o requisitos discriminatorios).
- Riesgo de alucinación: aunque está diseñado para ceñirse al contexto, si la oferta es ambigua o contiene información contradictoria, podría generar respuestas incorrectas.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; se recomienda mantener las ofertas dentro de un tamaño manejable para evitar degradación.
- Restricciones de idioma: no se indica qué idiomas soporta; probablemente el entrenamiento se realizó en inglés, por lo que el uso en otros idiomas puede ser limitado.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero es necesario verificar que los datos de entrenamiento (ofertas reales) no infrinjan derechos de autor o privacidad.
- Especialización estricta: el modelo no está diseñado para tareas generales de QA o diálogo abierto; su uso fuera del dominio de ofertas de empleo dará resultados pobres.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mkornreich/smollm2-360m-job-qa)
- [SmolLM2-360M (modelo base)](https://huggingface.co/HuggingFaceTB/SmolLM2-360M)
- [SmolLM2-360M-Instruct (modelo base instruct)](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
- [Página de SmolLM2 en Modelscope](https://www.modelscope.cn/models/HuggingFaceTB/SmolLM2-360M)
- [Repositorio GitHub de Smol Models](https://github.com/huggingface/smollm)
- [Artículo sobre SmolLM2-360M en llm.co](https://llm.co/llms/smollm2-360m)
