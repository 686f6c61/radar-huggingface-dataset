# AFZAL0008/MedGemmagguf

## Resumen

MedGemmagguf es una conversión a formato GGUF del modelo MedGemma 4B, un modelo de lenguaje multimodal desarrollado por Google DeepMind para aplicaciones de salud e imagen médica. El autor AFZAL0008 ha realizado un ajuste fino (fine-tuning) del modelo base y lo ha convertido a GGUF utilizando la librería Unsloth, lo que permite su ejecución eficiente en CPU y GPU con herramientas como llama.cpp y Ollama. El modelo está diseñado para tareas de visión y lenguaje en el dominio médico, como análisis de radiografías de tórax, localización anatómica y procesamiento de imágenes de alta dimensión (CT, MRI, histopatología).

Con aproximadamente 3,88 mil millones de parámetros, este modelo se posiciona en el rango de los modelos compactos pero capaces, adecuado para entornos con recursos limitados. La conversión a GGUF facilita su despliegue en producción con cuantización Q8_0, que ofrece un equilibrio entre calidad y uso de memoria. Su relevancia actual radica en la creciente demanda de modelos de IA open source especializados en el sector sanitario, donde la privacidad y el control local son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Gemma3, con proyector de vision) |
| Parametros totales | 3.880.263.168 (3,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (modelo principal), F16 (proyector multimodal) |
| Idiomas soportados | no disponible (se infiere multilingue por ser Gemma, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo base es MedGemma 4B, una variante de la familia Gemma3 de Google DeepMind, que emplea una arquitectura transformer con atención de múltiples cabezas y capacidades multimodales (procesamiento de imágenes y texto). El proyector multimodal (mmproj) permite al modelo integrar características visuales con el modelo de lenguaje. El ajuste fino realizado por AFZAL0008 se ha llevado a cabo con Unsloth, una librería que optimiza el entrenamiento y la conversión de modelos, logrando un entrenamiento aproximadamente 2 veces más rápido que los métodos convencionales. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. El comportamiento del token BOS se ha ajustado para garantizar la compatibilidad con el formato GGUF.

## Capacidades

- Generación de texto y razonamiento en el dominio médico, incluyendo descripción de hallazgos radiológicos y soporte a decisiones clínicas.
- Procesamiento de imágenes médicas: análisis de radiografías de tórax, tomografías computarizadas (CT), resonancias magnéticas (MRI) y diapositivas de histopatología de alta dimensión.
- Localización anatómica y análisis longitudinal de imágenes (comparación de estudios en el tiempo).
- Capacidades multimodales: entrada de imagen y texto, salida de texto.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero al estar basado en Gemma3 es probable que herede dicha capacidad (no verificado).
- Capacidades multilingües: no confirmadas, aunque Gemma3 soporta múltiples idiomas; no hay datos específicos para este modelo.

## Casos de uso

- Análisis de radiografías de tórax: el modelo puede generar informes descriptivos a partir de imágenes, ayudando a radiólogos en la detección de anomalías como nódulos o consolidaciones. Su tamaño compacto permite ejecutarlo en estaciones de trabajo locales sin depender de la nube.
- Revisión de histopatología: procesamiento de diapositivas completas para identificar patrones celulares y apoyar el diagnóstico de cáncer. La cuantización Q8_0 reduce los requisitos de memoria, facilitando su integración en sistemas de patología digital.
- Asistente clínico conversacional: integración en chatbots para responder preguntas sobre terminología médica, interpretación de resultados o recomendaciones de pruebas complementarias, con la ventaja de que los datos del paciente permanecen en el servidor local.
- Educación médica: generación de casos clínicos sintéticos y explicaciones de imágenes para estudiantes de medicina, permitiendo prácticas interactivas sin riesgo para pacientes reales.
- Investigación en imagen médica: uso como modelo base para fine-tuning en tareas específicas (segmentación, clasificación) gracias a su formato GGUF, que es compatible con herramientas de entrenamiento como Unsloth.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4B cuantizado, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 con 12 GB) o incluso en CPU con llama.cpp, lo que lo hace viable para clínicas pequeñas o proyectos de investigación con presupuesto reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio médico. Tampoco se dispone de comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo Q8_0 de 3,88 B parámetros ocupa aproximadamente 3,9 GB en memoria (sin contar el proyector). Con el proyector F16 (que suele ser pequeño, del orden de cientos de MB), el total ronda los 4,5-5 GB. Esto cabe en GPUs con 6 GB o más.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) para mayor velocidad. También puede ejecutarse en GPUs de datacenter como A10 o A100 si se requiere mayor throughput.
- En CPU: con llama.cpp, es viable en procesadores modernos con 16 GB de RAM, aunque la latencia será mayor (del orden de segundos por token).
- Opciones de despliegue: llama.cpp (llama-cli o llama-mtmd-cli), Ollama (con la limitación de que no soporta mmproj separado, por lo que se debe crear un modelo unificado), y servidores compatibles con la API de OpenAI mediante herramientas como llama-server.
- Latencia y throughput: no disponibles. Dependerá del hardware y del número de tokens de entrada (especialmente el procesamiento de imágenes).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| MedGemmagguf (este) | 3,88 B | no disponible | Sí (visión) | no disponible | GGUF |
| MedGemma 4B (original) | 4 B | no disponible | Sí (visión) | Gemma license (no confirmado) | safetensors |
| LLaVA-Med (ejemplo) | 7 B | 4096 | Sí (visión) | no disponible | safetensors |

No se dispone de datos de rendimiento comparativo. La principal diferencia con el modelo original es el formato GGUF, que facilita el despliegue en entornos locales y con menos recursos. MedGemma original está disponible en HuggingFace con licencia de Google (probablemente Gemma Terms of Use), pero la licencia de esta conversión no está especificada.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo. Al ser un modelo médico, existe riesgo de que reproduzca sesgos presentes en los datos de entrenamiento, especialmente en poblaciones subrepresentadas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información clínicamente incorrecta o inventar hallazgos. No debe utilizarse como sustituto del juicio clínico profesional.
- Limitaciones de contexto: no se especifica la longitud de contexto, lo que puede afectar a tareas que requieran historiales largos o múltiples imágenes.
- Limitaciones de idioma: no se confirman los idiomas soportados. Aunque Gemma3 es multilingüe, el fine-tuning médico podría haber reducido el rendimiento en idiomas distintos del inglés.
- Restricciones de licencia: la licencia no está indicada en la model card. Se recomienda contactar al autor o consultar la licencia del modelo base MedGemma antes de usar en producción.
- Compatibilidad con Ollama: el aviso de la model card indica que Ollama no soporta archivos mmproj separados, por lo que se requiere un proceso adicional para crear un modelo unificado.
- El ajuste del token BOS puede afectar al comportamiento en algunas aplicaciones; se recomienda probar con el prompt adecuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AFZAL0008/MedGemmagguf
- Perfil del autor: https://huggingface.co/AFZAL0008
- Página oficial de MedGemma (Google DeepMind): https://deepmind.google/models/gemma/medgemma/
- Documentación de MedGemma para desarrolladores: https://developers.google.com/health-ai-developer-foundations/medgemma
- Blog de investigación de Google sobre MedGemma: https://research.google/blog/medgemma-our-most-capable-open-models-for-health-ai-development/
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
