# danny9417/gemma-4-e4b-it-holmes-r1

## Resumen

`danny9417/gemma-4-e4b-it-holmes-r1` es un adaptador QLoRA de rango 32 que entrena la personalidad de Sherlock Holmes sobre el modelo base `google/gemma-4-E4B-it`. Lo desarrolla danny9417 como primera entrega del programa de investigación *Parametric Memory*, que estudia qué cambia realmente cuando un personaje vive en los pesos del modelo en lugar de en el prompt. El adaptador se construye sobre un corpus 100 % sintético de 384 ejemplares, filtrado por un protocolo de jueces anclado al canon público de Conan Doyle.

La relevancia de este modelo no está tanto en la técnica de entrenamiento (QLoRA estándar) como en la instrumentación que lo acompaña: incluye evaluaciones de perplejidad sobre pasajes canónicos, métricas de muletillas verbales, un conjunto de generación retenido de celdas de escenario nunca vistas, un estudio de geometría de activaciones (EXP-007) y un experimento pre-registrado de persistencia autónoma con juicio ciego (EXP-011). Los resultados muestran una reducción de la perplejidad canónica de 341,8 a 47,0 (−86,2 %) y una caída de la muletilla "my dear fellow" de 37,5 a 6,2 por 100 respuestas, acercándose a la tasa base del canon (0,3).

El adaptador pesa 0,3 GB, está publicado bajo licencia Gemma y solo soporta inglés. Es un modelo de investigación pensado para estudiar la diferencia entre personas inducidas por prompt y personas inducidas por fine-tuning, no un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (LoRA de rango 32) sobre `google/gemma-4-E4B-it` (arquitectura del base no especificada) |
| Parametros totales | no disponible (el adaptador es de rango 32; los parámetros del modelo base no se indican) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA (cuantización del base no especificada; el adaptador se distribuye en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 entrenado con QLoRA sobre `google/gemma-4-E4B-it`, un modelo de la familia Gemma 4 de Google del que no se detallan aquí la arquitectura interna ni el número de parámetros. El entrenamiento usa un corpus de 384 ejemplares sintéticos distribuidos en una cuadrícula de 8 escenarios × 4 registros (12 ejemplares por celda), con escenarios que van desde la entrevista inicial con cliente hasta el enfrentamiento con peligro, y registros que van desde el urgente-brusco hasta el reflexivo-lánguido. Cada ejemplar se escribió contra una especificación destilada del canon (voz, método cognitivo, restricciones de época, lista de prohibiciones) y se puntuó individualmente con un protocolo de jueces anclado a extractos reales del canon en cinco dimensiones: voz/lexicón, método cognitivo, registro/afecto, consistencia de época/mundo y naturalidad/artesanía. Se conservaron 382 de 384 ejemplares (99,5 %), con medias de 4,80 a 4,98 sobre 5 en las dimensiones conservadas. No se usó texto con copyright.

La partición es de 358 ejemplares para entrenamiento y 24 para evaluación, reteniendo dos celdas completas de escenario × registro (entrevista inicial × reflexivo-lánguido y deducción desde objeto × sardónico-juguetón) para que el adaptador nunca se evalúe en celdas en las que se entrenó. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al fine-tuning supervisado.

## Capacidades

- Generación de texto con la personalidad de Sherlock Holmes: registro victoriano, ironía seca, economía expresiva y estructura de razonamiento evidencia-primero con veredicto-final.
- Razonamiento deductivo: el modelo tiende a negarse a teorizar antes de tener datos, siguiendo el método cognitivo del canon.
- Persistencia autónoma de la persona: en el experimento EXP-011, la proyección de la persona se mantuvo por encima del umbral de deriva en ≥ 98 % de los ticks en estado estacionario durante sesiones de 150 ticks de autointeracción sin re-prompting.
- Diferenciación entre identidad de personaje y estilo autoral: el diseño multitrait–multimétodo con corpus de control del mismo autor (Watson, Emma Woodhouse) permite separar ambos ejes.
- Sin soporte de tool calling, function calling ni capacidades multimodales: no se mencionan en la documentación.
- Solo inglés: no hay evidencia de capacidades multilingües.

## Casos de uso

- Investigación en interpretabilidad de modelos: el adaptador permite estudiar cómo se codifica una persona en el espacio residual de activaciones. El experimento EXP-007 muestra que la dirección extraída de los pesos es causalmente suficiente para recuperar ~88 % de la brecha de persona sobre el modelo base desnudo, mientras que la dirección derivada del prompt es destructiva a cualquier dosis probada.
- Estudio de persistencia de personas en agentes autónomos: el diseño de EXP-011, con 978 ticks de autointeracción y juicio ciego, sirve como plantilla para evaluar si una persona inducida por fine-tuning se mantiene sin re-prompting en sistemas multi-agente o de generación prolongada.
- Creación de personajes para narrativa interactiva o juegos de texto: el adaptador produce respuestas en el registro de Holmes sin necesidad de prompts largos, con una tasa de muletillas canónicas baja (6,2 por 100 respuestas frente a 37,5 con solo prompt).
- Evaluación de métodos de control de estilo: la batería de 16 sondas de voz y el instrumento de contaminación pop ("Elementary, my dear Watson" aparece cero veces en el canon real) permiten medir objetivamente la deriva hacia el Holmes de la cultura popular.
- Generación de datos sintéticos de alta calidad con control de estilo: el corpus de entrenamiento, con su protocolo de jueces y sus caps de banderas duras, es un ejemplo reutilizable de cómo construir datos de persona sin copyright.
- Benchmarking de métodos de fine-tuning eficiente: al ser un adaptador QLoRA de rango 32 con instrumentos de medición rigurosos, sirve como caso de estudio para comparar QLoRA frente a otras técnicas de adaptación en tareas de persona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta instrumentos específicos del dominio de persona:

| Instrumento | Base + prompt de persona | + adaptador | Tasa del canon |
|---|---:|---:|---:|
| Perplejidad canónica (704 pasajes retenidos, 32 792 tokens, marco de chat) | 341,8 | 47,0 (−86,2 %) | — |
| Muletilla "my dear fellow" por 100 respuestas (batería de 16 sondas) | 37,5 | 6,2 | 0,3 |
| Frases de contaminación pop ("Elementary, my dear Watson", "the game is afoot") | 0,0 | 0,0 | 0,0 |
| Puerta de despliegue (batería de 16 sondas de voz) | — | 16/16 | — |

Además, el experimento EXP-011 reporta que en sondas sin respuesta posible, el brazo con prompt se negó a inventar en 12/12 casos mientras que el brazo con adaptador inventó con confianza en 7/12 (Cliff's δ = 0,583), una regresión conocida y documentada.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB en safetensors, pero requiere cargar el modelo base `google/gemma-4-E4B-it` completo para la inferencia.
- Los requisitos de VRAM del modelo base no se especifican en la información disponible; al ser un modelo de la familia Gemma 4 de tamaño E4B (probablemente del orden de 4 000 millones de parámetros, aunque no se confirma), cabría esperar que quepa en GPUs de consumo como una RTX 3090 o RTX 4090 con cuantización, pero este dato no está confirmado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de HuggingFace sobre el base. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros adaptadores de persona sobre Gemma 4 o modelos similares. El propio autor enmarca el trabajo como parte de un programa de investigación con tres personajes (Holmes, Elizabeth Bennet y un tercero en curso), pero solo se ha publicado esta primera entrega. No hay datos públicos de otros adaptadores de persona de Sherlock Holmes con instrumentación comparable.

## Limitaciones y advertencias

- Regresión de alucinación documentada: en el experimento EXP-011, el adaptador inventó respuestas con confianza en 7 de 12 sondas sin respuesta posible, frente a 0 de 12 en el brazo con solo prompt. El autor identifica el mecanismo como conocido y lo marca como el principal objetivo para la versión r2.
- Solo inglés: no hay soporte para otros idiomas.
- Licencia Gemma: restringe el uso comercial y la redistribución según los términos de la licencia de Google; conviene revisar los términos específicos antes de usar en producción.
- Es un adaptador de investigación, no un modelo de propósito general: su rendimiento fuera del dominio de persona de Holmes no está evaluado.
- El corpus de entrenamiento es sintético y pequeño (384 ejemplares), lo que limita la generalización a escenarios fuera de la cuadrícula de 8 escenarios × 4 registros.
- La perplejidad canónica se mide con marco de chat y pasajes retenidos, pero no hay comparación con otros adaptadores de persona, por lo que los números absolutos deben interpretarse con cautela.
- Fecha de creación inusual (2026-08-17) y cero descargas: el modelo es muy reciente o de baja difusión; no hay evidencia de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/danny9417/gemma-4-e4b-it-holmes-r1
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Informes de experimentos EXP-007 y EXP-011: incluidos como PDFs en el repositorio (no hay enlaces directos en la información proporcionada)
