# CompiwerAI/Mtrini-SVL-1.1

## Resumen

Mtrini-SVL-1.1 es un ajuste publicado por Compiwer AI (Salé, Marruecos) sobre su propio modelo Mtrini-SVL-1.0, cuya arquitectura declarada es Qwen3-VL. No se distribuye como modelo completo: el repositorio contiene únicamente un adaptador LoRA/PEFT de entrenamiento continuado, ocupa 1,1 GB en Hugging Face y la versión fusionada en GGUF se publica en un release aparte.

El entrenamiento se ha orientado a cinco focos declarados: dariya marroquí, razonamiento en dariya, matemáticas, programación y razonamiento general. Los datos citados proceden de tres conjuntos: Lyte/Moroccan-Darija-QA, nvidia/OpenCodeReasoning-2 y nvidia/OpenMathInstruct-2. La model card menciona además un mecanismo denominado SVL (Self-Verifying Loop), que da nombre al modelo, aunque no explica en qué consiste ni cómo se implementa.

La relevancia del lanzamiento debe enmarcarse con cautela. El repositorio registra 0 descargas y 0 likes, no declara licencia, idiomas, longitud de contexto ni tamaño de parámetros, y no acompaña ningún resultado de evaluación. Su interés principal es como ejemplo de adaptación lingüística de bajo recurso (dariya) mediante LoRA sobre una base multimodal reciente, pero no existe evidencia pública de su rendimiento real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal de visión-lenguaje) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se declara que sea una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se anuncia un release GGUF fusionado publicado por separado) |
| Idiomas soportados | no declarados en los metadatos; el enfoque de entrenamiento incluye dariya marroquí, con datos de código y matemáticas en inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF en un release separado |
| Modelo base | CompiwerAI/Mtrini-SVL-1.0 |
| Tipo de artefacto | adaptador LoRA/PEFT, no pesos completos |
| Tamaño del repositorio | 1,1 GB |
| Fecha de publicación | 25 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de partida es Qwen3-VL, un transformer multimodal de visión-lenguaje. Sobre ese linaje, el autor aplica un entrenamiento continuado con LoRA/PEFT partiendo de Mtrini-SVL-1.0, es decir, un ajuste de parámetros eficiente en el que se congela el modelo base y se entrenan matrices de bajo rango. El repositorio distribuido contiene solo ese adaptador, de modo que para ejecutar el modelo hay que cargar previamente Mtrini-SVL-1.0 y aplicar el delta, o bien fusionarlo y exportarlo. No se especifica el rango de LoRA, los módulos objetivo ni la tasa de aprendizaje empleada.

En cuanto a los datos, la model card cita tres fuentes: Lyte/Moroccan-Darija-QA para el eje lingüístico de dariya, nvidia/OpenCodeReasoning-2 para razonamiento sobre código y nvidia/OpenMathInstruct-2 para matemáticas. No se indica el número de tokens de entrenamiento, la composición exacta de la mezcla, ni si hubo etapas de RLHF, DPO u otro tipo de alineación. El elemento diferencial declarado es el SVL (Self-Verifying Loop), presumiblemente un esquema de auto-verificación o refinamiento iterativo, pero la documentación no aporta detalle técnico alguno sobre su funcionamiento.

## Capacidades

Las siguientes capacidades se derivan de los focos de entrenamiento declarados; no están verificadas por evaluación publicada.

- Generación de texto y razonamiento general, con foco declarado en razonamiento en dariya marroquí.
- Razonamiento matemático, apoyado en el uso de nvidia/OpenMathInstruct-2 durante el ajuste.
- Generación y razonamiento sobre código, apoyado en nvidia/OpenCodeReasoning-2.
- Comprensión y generación en dariya marroquí (dialecto árabe de Marruecos) para tareas de pregunta-respuesta, según el conjunto Lyte/Moroccan-Darija-QA.
- Capacidades de visión-lenguaje potencialmente heredadas de la base Qwen3-VL; la model card no confirma que se conserven tras el ajuste ni detalla tareas de imagen.
- Auto-verificación o refinamiento iterativo mediante el mecanismo SVL, sin especificación técnica publicada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en dariya marroquí: el modelo puede gestionar conversaciones multi-turno en dialecto para sectores con clientela marroquí (banca, telecomunicaciones, comercio electrónico), siempre que la ventana de contexto de la base Qwen3-VL sea suficiente; la longitud exacta no está declarada y debe verificarse antes de dimensionar el sistema.
- Traducción y mediación lingüística dariya-castellano/francés: útil en servicios públicos, sanidad y ONG para interpretar consultas escritas en dariya, aunque la variabilidad dialectal y la ausencia de ortografía normalizada obligan a revisión humana.
- Tutoría de matemáticas en dariya: el ajuste con OpenMathInstruct-2 permite plantear explicaciones paso a paso de ejercicios de secundaria en dialecto, un recurso escaso en plataformas educativas.
- Asistente de programación en entornos de desarrollo: el ajuste con OpenCodeReasoning-2 apunta a generación y explicación de código, integrable en asistentes de editor o en revisión automática de parches, con verificación mediante tests en CI.
- Extracción de información de documentos escaneados: si se conservan las capacidades visuales de Qwen3-VL, podría aplicarse a digitalización de facturas o formularios en árabe y dariya; conviene validarlo empíricamente antes de llevarlo a producción.
- Investigación en adaptación de bajo recurso: sirve como caso de estudio reproducible de ajuste LoRA sobre una base multimodal para incorporar un dialecto poco representado, comparando contra el modelo base sin ajustar.
- Generación de material divulgativo en dariya: redacción de textos breves, publicaciones para redes o guiones adaptados al registro coloquial marroquí, con revisión editorial posterior.
- Preprocesado y normalización de corpus dialectales: uso del modelo para reescribir, resumir o clasificar textos en dariya antes de incorporarlos a un pipeline de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de ningún tipo (MMLU, GSM8K, HumanEval, evaluaciones de dariya ni comparaciones con la base Mtrini-SVL-1.0), y el repositorio no registra descargas ni valoraciones que permitan inferir un uso validado.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (1,1 GB). La VRAM necesaria la determina el modelo base Mtrini-SVL-1.0, cuyo número de parámetros no está declarado.
- Estimación orientativa, no confirmada por la documentación: una base del orden de 8B en FP16 requiere aproximadamente 16-18 GB de VRAM para inferencia, y unos 5-6 GB en cuantización de 4 bits. Una base de 30-32B exigiría del orden de 60-70 GB en FP16 o 18-22 GB en 4 bits.
- GPU: para FP16 en tamaños medianos, una RTX 4090 (24 GB) o A100 40/80 GB es suficiente; para bases grandes conviene H100 80 GB o despliegue multi-GPU.
- Cabe en GPU de consumo si el base es de tamaño pequeño o mediano y se cuantiza a 4 bits; en caso contrario, no.
- Despliegue: transformers + peft para cargar el adaptador directamente, vLLM (admite adaptadores LoRA), TGI, o llama.cpp/Ollama si se usa la versión GGUF fusionada publicada por separado. Hay que fusionar el adaptador con la base antes de exportar a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables dentro de la información proporcionada. La comparación honesta exige consultar las fichas oficiales de cada alternativa.

| Modelo | Relación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mtrini-SVL-1.1 | Adaptador LoRA sobre Mtrini-SVL-1.0 (Qwen3-VL) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Mtrini-SVL-1.0 | Modelo base del anterior | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3-VL | Arquitectura base declarada, sin ajuste de dariya | no disponible | no disponible | no disponible | Hugging Face |

Como referencia externa a verificar por separado, existen iniciativas de adaptación al dariya marroquí como Atlas-Chat, pero no se incluyen cifras aquí porque no forman parte de la información proporcionada y no deben darse por contrastadas.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no hay autorización explícita de uso comercial ni condiciones de redistribución. Cualquier despliegue en producción requiere contactar con el autor.
- Sin resultados de evaluación: no hay benchmarks, ni comparación con la base, ni validación por terceros. El rendimiento real es desconocido.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de informes de fallos o de reproducibilidad por parte de la comunidad.
- Dependencia del modelo base: es un adaptador, no un modelo autónomo. Sin Mtrini-SVL-1.0 o sin la versión GGUF fusionada, no es utilizable.
- Riesgo de olvido catastrófico: el ajuste LoRA sobre datos muy específicos (dariya, matemáticas, código) puede degradar capacidades generales del base, incluidas las visuales, sin que existan métricas que lo cuantifiquen.
- El mecanismo SVL (Self-Verifying Loop) no está documentado: se desconoce si implica llamadas adicionales al modelo, mayor coste de inferencia o riesgos de bucles.
- Dariya marroquí: dialecto sin ortografía estandarizada, con gran variación regional y mezcla frecuente de francés y árabe estándar. Cabe esperar cobertura desigual e inconsistencia en la transliteración.
- Riesgo de alucinación en matemáticas y código, agravado por la ausencia de validación publicada; toda salida numérica o de código debe verificarse.
- Idiomas no declarados oficialmente: no hay garantía documentada de soporte para castellano, inglés u otras lenguas más allá de lo que herede el modelo base.
- Longitud de contexto desconocida: no se puede dimensionar un caso de uso de contexto largo sin verificar la ventana real de la base.
- Fechas del repositorio (creación y actualización el 25 de septiembre de 2026, con siete segundos de diferencia): la model card no parece haber sido revisada ni completada después de la subida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CompiwerAI/Mtrini-SVL-1.1
- Modelo base: https://huggingface.co/CompiwerAI/Mtrini-SVL-1.0
- Dataset Lyte/Moroccan-Darija-QA: https://huggingface.co/datasets/Lyte/Moroccan-Darija-QA
- Dataset nvidia/OpenCodeReasoning-2: https://huggingface.co/datasets/nvidia/OpenCodeReasoning-2
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Release GGUF fusionado: publicado por separado según la model card; enlace no disponible.
