# nebulitgmbh/event-modeling-gemma-4-e4b

## Resumen

Event Modeling assistant (Gemma 4 E4B, fine-tuned) es un ajuste fino mediante LoRA del modelo multimodal google/gemma-4-E4B-it, desarrollado por nebulitgmbh y publicado bajo licencia Apache 2.0. Su propósito es acotado y específico: explicar los conceptos de Event Modeling (una metodología de diseño de sistemas basada en event sourcing) y generar modelos de Event Modeling en formato JSON, incluyendo comandos, eventos, read models, pantallas, automatizaciones y escenarios Given/When/Then. El modelo es de tipo image-text-to-text, con 7.941.100.874 parámetros totales y pesos en safetensors (bf16), derivados de la fusión del adaptador LoRA sobre el modelo base.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de especialización vertical: un modelo de 8.000 millones de parámetros entrenado con un corpus pequeño y muy concreto (unos 3.640 ejemplos) para una única disciplina de ingeniería de software. Por otro, sirve como ejemplo de despliegue en el navegador mediante WebLLM/MLC, ya que el autor publica una build cuantizada q4f16_1 con librería WebGPU compilada. El modelo se etiqueta explícitamente como experimental y no sustituye a la documentación ni a la obra de referencia de la metodología.

El modelo se creó y actualizó el 11 de noviembre de 2026, no registra descargas ni likes en el momento de la consulta y su repo ocupa 16,5 GB. La información disponible no incluye detalles sobre la longitud de contexto, los idiomas soportados ni resultados de benchmarks estándar, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de google/gemma-4-E4B-it; ajuste fino LoRA fusionado a bf16 |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16_1 (build WebLLM/MLC publicada en repo aparte); el repo principal contiene pesos bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (derivado de Gemma 4, liberado por Google bajo Apache 2.0) |
| Formato de pesos | safetensors (modelo fusionado) y adaptador LoRA en la carpeta `adapter/`; build MLC con pesos y librería WebGPU compilada |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer multimodal de aproximadamente 8.000 millones de parámetros que procesa entradas de imagen y texto. Sobre esa base se aplicó un ajuste fino con LoRA de rango 64, tasa de aprendizaje 1e-4 y 3 épocas sobre unos 3.640 ejemplos. El adaptador resultante se fusionó con los pesos originales en precisión bf16, de modo que el repositorio principal contiene un modelo completo listo para cargar con transformers, mientras que la carpeta `adapter/` conserva el adaptador LoRA por separado. El autor indica que esta configuración fue la mejor de nueve experimentos de hiperparámetros y mezcla de datos; variaciones de tasa de aprendizaje, épocas, rango y pesos de datos obtuvieron resultados iguales o peores.

El corpus de entrenamiento combina material sobre habilidades de Event Modeling, tableros y escritos largos del propio autor, páginas públicas de eventmodelers.ai, el esquema JSON de Event Modeling y ejemplos generados a partir de plantillas de tableros de muestra. Parte de las respuestas se redactaron con Claude y GLM-5.3-Flash y se filtraron mediante un validador de esquema, lo que introduce una dependencia de modelos de terceros en la generación de datos. No se documenta el número de tokens de entrenamiento, la composición porcentual del dataset ni si hubo fases de RLHF o DPO; el ajuste se presenta como supervisado sobre ejemplos filtrados por validación de esquema.

## Capacidades

- Generación de texto conversacional sobre Event Modeling: explicación de conceptos, comandos, eventos, read models, pantallas y automatizaciones.
- Generación de JSON estructurado de modelos de Event Modeling, incluyendo escenarios Given/When/Then.
- Entrada multimodal image-text-to-text heredada del modelo base Gemma 4 E4B-it (procesamiento de imágenes junto a texto).
- Cumplimiento de instrucciones para producir únicamente JSON cuando se solicita, con una tasa de validez de esquema del 100 % en la muestra de 6 de 6 indicada por el autor.
- Estabilidad de decodificación: sin bucles de repetición en 15 preguntas nuevas, tanto con decodificación greedy como muestreada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de diseño de Event Modeling en equipos de desarrollo: el modelo recibe la descripción de un dominio de negocio y devuelve un JSON con comandos, eventos, read models y pantallas, que el equipo puede cargar en su herramienta de tableros para iterar sobre el diseño. Es adecuado porque el ajuste se entrenó específicamente con el esquema JSON de la metodología y con tableros de muestra.
- Generación de escenarios de aceptación Given/When/Then: a partir de un flujo descrito en lenguaje natural, el modelo produce escenarios estructurados que pueden incorporarse a suites de pruebas BDD. La salida en JSON facilita su integración en pipelines de test.
- Formación y onboarding de desarrolladores: el modelo explica conceptos de Event Modeling y event sourcing en conversaciones multi-turno, útil como apoyo didáctico interno para equipos que adoptan la metodología. El autor advierte que no sustituye a la documentación ni al libro de referencia.
- Validación asistida de tableros existentes: dado un modelo JSON incompleto o inconsistente, el modelo puede proponer comandos o eventos faltantes y reescribir el JSON conforme al esquema, siempre que la salida se valide posteriormente con el validador de esquema.
- Despliegue en el navegador para demos y prototipos: la build q4f16_1 para WebLLM/MLC permite ejecutar el modelo en el cliente mediante WebGPU, sin backend de inferencia, lo que resulta adecuado para demos interactivas de la metodología en entornos controlados.
- Prototipado rápido de APIs de modelado: un servicio interno puede exponer el modelo con transformers o con un servidor compatible con la API de OpenAI (el repo incluye la etiqueta `endpoints_compatible`) para que otras herramientas generen modelos JSON bajo demanda, con validación de esquema obligatoria en la respuesta.
- Experimentación académica sobre especialización vertical: el modelo sirve como caso de estudio de ajuste fino LoRA con corpus pequeño y filtrado por validador, replicable para otras disciplinas de ingeniería del software.

## Benchmarks y rendimiento

| Metrica | Resultado | Notas |
|---|---|---|
| Held-out loss | 0,681 | Muestra pequeña; el autor la califica de indicativa |
| Validez de esquema en "write the model JSON" | 11 de 12 (0,92) | Prompts de held-out; 6 de 6 cuando se pide solo JSON |
| Bucles de repetición | 0 en 15 preguntas nuevas | Decodificación greedy y muestreada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores proceden de muestras pequeñas y el propio autor las presenta como indicativas, no como evaluación rigurosa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (7.941.100.874 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda disponer de 20-24 GB o más para contexto largo.
- VRAM estimada en q4f16_1: alrededor de 4-5 GB para pesos, más overhead; adecuada para GPUs de consumo con 8 GB o más.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB). En RTX 4090 cabe con margen limitado según la longitud de contexto.
- GPU de consumo: en q4f16_1 cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; la build WebLLM/MLC está pensada para ejecución en navegador con WebGPU.
- Opciones de despliegue: transformers (carga directa del modelo fusionado), vLLM y TGI para servir el modelo en bf16, llama.cpp/Ollama si se generan cuantizaciones GGUF a partir de los pesos (no publicadas en la información disponible), y WebLLM/MLC con la build q4f16_1 para inferencia en navegador.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo de 8.000 millones de parámetros, el throughput en bf16 sobre A100/H100 será del orden de decenas de tokens por segundo por petición, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| event-modeling-gemma-4-e4b (este modelo) | 7.941.100.874 | no disponible | Event Modeling y JSON de tableros | Apache 2.0 | Hugging Face, build WebLLM/MLC |
| google/gemma-4-E4B-it (modelo base) | ~8.000 millones | no disponible | Multimodal generalista image-text-to-text | Apache 2.0 | Hugging Face |
| Alternativas de modelado de dominio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos ajustados específicamente para Event Modeling ni sobre resultados comparativos con el modelo base en las tareas objetivo. La comparación directa con gemma-4-E4B-it requeriría evaluar ambos con el mismo conjunto de prompts y validación de esquema, algo que no se ha publicado en la información disponible.

## Limitaciones y advertencias

- Débil en preguntas de opinión y conocimiento general: puede enunciar definiciones con seguridad pero de forma imprecisa, según el propio autor.
- Riesgo de JSON inválido: se recomienda validar toda salida contra el esquema de Event Modeling o usar decodificación restringida por esquema; la tasa de validez observada (0,92) no es del 100 %.
- Modelo pequeño con dataset pequeño (unos 3.640 ejemplos): no sustituye al libro ni a la documentación oficial de Event Modeling.
- Etiquetado como experimental por el autor; no hay evidencia de uso en producción ni de evaluaciones a gran escala.
- Idiomas soportados no documentados: no hay garantía de calidad fuera del idioma o idiomas usados en el corpus de entrenamiento.
- Longitud de contexto no documentada: no se puede planificar el uso con documentos o tableros extensos sin verificación empírica.
- Datos de entrenamiento parcialmente generados por Claude y GLM-5.3-Flash, lo que puede introducir sesgos o estilos de esos modelos en las respuestas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Gemma 4 conviene revisar los términos de la licencia de Gemma 4 publicada por Google para confirmar obligaciones adicionales de atribución.
- Sin descargas ni validación comunitaria en el momento de la consulta: no hay retroalimentación de terceros sobre fallos o comportamientos inesperados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebulitgmbh/event-modeling-gemma-4-e4b
- Build WebLLM/MLC q4f16_1: https://huggingface.co/nebulitgmbh/event-modeling-gemma-4-e4b-q4f16_1-MLC
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Documentación de Event Modeling: https://eventmodelers.ai
