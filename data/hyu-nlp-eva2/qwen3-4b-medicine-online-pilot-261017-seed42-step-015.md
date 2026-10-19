# HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-015

## Resumen

`qwen3-4b-medicine-online-pilot-261017-seed42-step-015` es un checkpoint de investigación publicado por el grupo HYU-NLP-EVA2. Se trata de un ajuste fino del modelo denso Qwen/Qwen3-4B-Instruct-2507 (4.022.468.096 parámetros) obtenido mediante un pipeline de aprendizaje por refuerzo ejecutado con veRL sobre backend FSDP, dentro de una ejecución denominada `261017_medicine_online_pilot_seed42` con semilla 42 y en el paso de entrenamiento 15. El dominio declarado en el nombre del repositorio es medicina y el método parece basado en "online rubrics", es decir, recompensas construidas con rúbricas evaluadas en línea durante el entrenamiento.

El interés de esta publicación no es el rendimiento final, sino la trazabilidad: el repositorio conserva tanto un export BF16 en formato Transformers como el checkpoint nativo exacto de veRL/FSDP en el directorio `original_checkpoint/`, junto con sus metadatos, lo que permite reproducir o inspeccionar el estado del entrenamiento. Es, por tanto, material para investigadores que estudian RL con recompensas basadas en rúbricas aplicado a dominios de alto riesgo, no un modelo listo para producción clínica.

No hay información publicada sobre el conjunto de datos de entrenamiento, la composición del corpus médico, los idiomas cubiertos ni resultados de evaluación. Con 0 descargas y 0 "likes" en el momento de la consulta, se trata de un artefacto recién publicado y sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 (derivado de Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (~4,02 B), dato real de los safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens nativos según su documentación pública; no verificado en este checkpoint |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos BF16; al mantener la arquitectura Qwen3 es convertible a GGUF, AWQ o GPTQ con herramientas externas, sin garantía de calidad tras el ajuste |
| Idiomas soportados | No disponible (la model card no declara idiomas; los heredaría del modelo base, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en BF16 (export Transformers) + checkpoint nativo veRL/FSDP en `original_checkpoint/` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de Qwen3 con aproximadamente 4.000 millones de parámetros. Sobre esa base se aplicó un ajuste fino con aprendizaje por refuerzo. Los metadatos del repositorio indican que el checkpoint nativo está en formato veRL/FSDP, lo que sitúa el entrenamiento en la familia de frameworks de RL para LLM (veRL) con sharding FSDP, y el nombre de la ejecución ("online-rubrics") sugiere un esquema de recompensa basado en rúbricas evaluadas en línea, probablemente con un juez o verificador que puntúa las respuestas del dominio médico durante el propio entrenamiento.

El checkpoint corresponde al paso 15, un punto muy temprano del entrenamiento, con semilla 42. No se publican el número de tokens de entrenamiento, la composición del dataset, la mezcla de datos médicos ni los hiperparámetros del algoritmo de RL (no se especifica si es GRPO, PPO u otra variante). Tampoco se documenta si hubo una fase previa de SFT o DPO. La innovación técnica destacable es de carácter metodológico y de reproducibilidad: el repositorio conserva el estado nativo del entrenamiento (incluidos estados de optimizador, lo que explica un tamaño de 25,7 GB frente a los ~8 GB del export BF16) y aplica una política de borrado del checkpoint local solo tras verificar tamaños y hashes SHA256 de todos los ficheros remotos.

## Capacidades

- Generación de texto conversacional en el dominio médico, heredando la capacidad instruct del modelo base Qwen3-4B-Instruct-2507.
- Respuesta a instrucciones y plantillas de chat (pipeline `text-generation`, `conversational`).
- Razonamiento de un solo turno y multi-turno, sujeto a la ventana de contexto del modelo base.
- Generación de texto en varios idiomas: no confirmado para este checkpoint, pendiente de evaluar.
- Compatibilidad con text-generation-inference y con endpoints compatibles (`endpoints_compatible` en las etiquetas), lo que facilita su despliegue en infraestructura estándar.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión ni audio en la información disponible. El modelo base Qwen3-Instruct sí soporta integración con herramientas, pero no hay evidencia de que esta capacidad se haya preservado tras el ajuste RL en el paso 15.
- No se declara modo "thinking" ni decodificación especulativa.

## Casos de uso

- Investigación en RL con recompensas por rúbricas: reanudar o inspeccionar el estado del entrenamiento desde `original_checkpoint/` para estudiar la dinámica de la recompensa en los primeros pasos (el paso 15 permite analizar la fase inicial de optimización).
- Evaluación comparativa de checkpoints intermedios: usar este step-015 como referencia temprana frente a checkpoints posteriores de la misma ejecución y medir cómo evoluciona la calidad de las respuestas médicas con el número de pasos.
- Réplica de experimentos: la semilla 42 y los metadatos de la ejecución permiten reproducir la configuración y contrastar resultados con otras semillas del mismo piloto.
- Generación de preguntas y rúbricas de evaluación para formación médica: el modelo, ajustado sobre rúbricas, puede emplearse para producir borradores de casos clínicos e ítems de evaluación que luego revisa un especialista humano.
- Prototipado de asistentes de documentación clínica en entornos de laboratorio: resumen y reescritura de notas con un modelo de 4 B desplegable en una sola GPU, siempre con supervisión humana y sin uso diagnóstico.
- Extracción de información estructurada de textos médicos en pipelines de investigación: convertir notas o informes en campos estructurados para análisis secundario, con validación posterior.
- Docencia y formación interna: simulación de diálogos paciente-clínico para entrenamiento de residentes, con revisión facultativa de las respuestas.
- Línea base ligera para ablaciones: al ser un modelo de 4 B con licencia Apache 2.0, sirve como referencia de bajo coste en estudios que comparan técnicas de RL sobre modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el estado del entrenamiento (paso 15, semilla 42) y el contenido del repositorio; no incluye evaluaciones en MMLU, MedQA, MedMCQA, HumanEval, GSM8K ni ninguna otra métrica. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM para inferencia en BF16: los pesos ocupan aproximadamente 8,05 GB (4,022 B × 2 bytes); con caché KV y overhead del runtime hay que prever unos 10-12 GB para contextos moderados.
- Cuantización INT8: en torno a 4,0-4,5 GB de pesos. Cuantización de 4 bits (Q4_K_M): en torno a 2,4-2,7 GB.
- GPU consumer: cabe en BF16 en RTX 3090, RTX 4090, RTX 4080 Super y, con contextos ajustados, en RTX 4070 Ti Super o RTX 4060 Ti de 16 GB. En GPUs de 8-12 GB es recomendable cuantizar a 8 o 4 bits.
- GPU de datacenter: A100 40/80 GB, H100, L40S o A10G quedan sobredimensionadas para un modelo de 4 B en BF16; son útiles para servir muchas réplicas concurrentes.
- Despliegue: transformers, vLLM, SGLang, TGI (etiqueta `text-generation-inference`), llama.cpp u Ollama tras conversión a GGUF.
- Los ficheros nativos de veRL/FSDP de `original_checkpoint/` están pensados para reanudar entrenamiento, no para inferencia, y explican el tamaño total de 25,7 GB del repositorio: para servir el modelo hay que usar el export BF16 de la raíz.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (qwen3-4b-medicine-online-pilot, step 15) | 4,02 B | No disponible en la model card (base: 262.144 según documentación pública) | Apache 2.0 | Hugging Face, 0 descargas, sin evaluaciones | Checkpoint intermedio de RL, paso 15, semilla 42 |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4 B | 262.144 tokens (documentación pública del modelo base) | Apache 2.0 | Hugging Face, ampliamente descargado | Modelo instruct generalista, sin ajuste específico de dominio |
| Qwen3-4B-Thinking-2507 | ~4 B | 262.144 tokens (documentación pública) | Apache 2.0 | Hugging Face | Variante con modo de razonamiento explícito |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 tokens (documentación pública) | Licencia comunitaria Llama 3.2 | Hugging Face | Requiere aceptar la licencia; restricciones de uso |
| Gemma 3 4B IT | ~4 B | 128.000 tokens (documentación pública) | Términos Gemma | Hugging Face | Multilingüe, con variantes multimodales en la familia |

La comparación de rendimiento no puede establecerse: no hay métricas publicadas para este checkpoint, por lo que la única referencia válida es el comportamiento del modelo base antes del ajuste, que no se ha medido aquí.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 15), no un modelo final: la política puede estar infraentrenada o inestable, y no hay ninguna evaluación que respalde su calidad.
- Dominio médico sin validación clínica: no debe usarse para diagnóstico, prescripción, triaje real ni consejo médico a pacientes. Cualquier uso en salud exige supervisión profesional y validación regulatoria.
- Riesgo elevado de alucinación en contenido médico: el ajuste con recompensas por rúbricas puede favorecer respuestas que puntúan bien ante un juez automático sin garantizar corrección factual.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que se desconocen sesgos demográficos, culturales o lingüísticos inducidos.
- Idiomas no declarados: no hay confirmación de qué lenguas conserva tras el ajuste; el rendimiento en castellano es una incógnita.
- Ventana de contexto no verificada en este checkpoint: los 262.144 tokens son un dato del modelo base y podrían no mantenerse tras el entrenamiento RL.
- Riesgo de sobreoptimización de la rúbrica (reward hacking): un esquema de recompensas automáticas en línea puede producir respuestas que explotan al evaluador.
- Licencia Apache 2.0 para los pesos publicados, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento, no documentadas aquí, antes de un uso comercial.
- Artefacto sin adopción: 0 descargas y 0 "likes" implican ausencia de revisión por la comunidad; no hay informes de terceros sobre su comportamiento.
- El repositorio incluye estados de entrenamiento (25,7 GB); descargarlo completo no es necesario si solo se quiere inferir, basta con los safetensors de la raíz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-015
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de veRL (framework de RL citado en los metadatos del checkpoint): https://github.com/volcengine/verl
- Blog técnico de la familia Qwen3: https://qwen.ai/blog
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; las coincidencias obtenidas correspondían a términos homónimos sin relación (Hyundai, canales de YouTube y una promotora de artes marciales), por lo que no se enlazan. No se han encontrado papers, demos ni repositorios adicionales asociados a esta publicación.
