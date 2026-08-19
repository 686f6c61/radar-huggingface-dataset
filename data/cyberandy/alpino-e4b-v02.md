# cyberandy/Alpino-e4b-v02

## Resumen

Alpino-e4b-v02 es un adaptador PEFT congelado (frozen) desarrollado por cyberandy (Andrea Volpini, CEO de WordLift) sobre el modelo base `google/gemma-4-E4B-it`. Forma parte de un sistema de gobernanza agéntica denominado AOOE (Agentic Observation-Orientation-Execution) aplicado a las operaciones de contenido de Alpina.travel, una tienda web autónoma para planificadores de viajes alpinos. El adaptador incorpora un protocolo de transición de estado gobernado y un contrato de recompensa basado en SHACL (Shapes Constraint Language) que restringe las acciones del modelo durante la inferencia.

La relevancia de este modelo radica en su enfoque: en lugar de un ajuste fino convencional, se entrena con GRPO bajo un contrato de recompensa que combina validación simbólica (SHACL) y evaluación de tareas, y se publica como un adaptador congelado que no actúa como publicador autónomo, sino que queda sujeto a una autoridad de runtime gobernada. El benchmark inmutable v1 muestra una reducción del 71,7% en tokens de decodificación y una mejora de 3,09× en transiciones válidas por PFLOP con respecto al modo sin gobernanza, aunque con una ligera pérdida de transiciones válidas (16/24 frente a 14/24). El repositorio tiene un tamaño de 0,3 GB y no se especifican licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre `google/gemma-4-E4B-it` (modelo base no detallado) |
| Parametros totales | No disponible (el repo contiene solo el adaptador, 0,3 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante GRPO (Group Relative Policy Optimization) sobre el modelo base `google/gemma-4-E4B-it`, siguiendo un protocolo de entrenamiento denominado `governed-state-transition-json-v1`. El contrato de recompensa combina una puerta dura SHACL (`SHACL-hard-gate-plus-task-evaluator-v1`) con un evaluador de tareas, de modo que el modelo aprende a generar transiciones de estado que cumplen restricciones simbólicas (RDF/SHACL) además de completar la tarea. El adaptador se publica congelado (frozen) y su runtime está delimitado por un controlador AOOE que decide la transición gobernada de forma determinista y la valida simbólicamente. El autor reporta que el adaptador de partida fue `cyberandy/Alpino-e4b-v01` y que el checkpoint congelado corresponde al run de entrenamiento `31967678398`. No se proporcionan datos sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento sobre operaciones de contenido: el adaptador está entrenado para tareas de inspección, creación, edición, publicación y manejo de entidades cruzadas dentro del dominio de Alpina.travel.
- Gobernanza agéntica: integra un protocolo AOOE que restringe las acciones del modelo a transiciones de estado válidas según un contrato simbólico SHACL.
- Manejo de comportamiento inseguro o ambiguo: el benchmark evalúa casos de abstinencia y escalada (abstain + escalate), aunque en los resultados actuales el modelo no logra ninguna abstinencia correcta (0/4).
- Eficiencia computacional: el modo AOOE reduce significativamente el número de tokens generados (de 39.326 a 11.133 en el benchmark) y mejora la relación transiciones válidas por PFLOP.
- Capacidades multimodales del modelo base: según la documentación de la versión v01, el modelo base `gemma-4-E4B-it` es multimodal, aunque esta característica no se detalla en la ficha actual.
- Soporte de tool calling y agentes: no se menciona explícitamente; el modelo opera dentro de un sistema agéntico gobernado, pero no se documenta una interfaz de herramientas estándar.

## Casos de uso

- Gestión de contenido editorial para una tienda web autónoma: el modelo puede crear, editar y publicar fichas de destinos alpinos, siempre que las transiciones de estado sean validadas por el controlador SHACL.
- Inspección de entidades existentes: el adaptador puede analizar entidades RDF del grafo de conocimiento de Alpina.travel y generar actualizaciones coherentes con el esquema.
- Vinculación entre entidades (cross-entity): aunque el benchmark muestra 0/4 en este apartado, el diseño contempla la creación de enlaces entre destinos, actividades y servicios turísticos.
- Moderación y seguridad: el modelo está entrenado para reconocer comportamientos inseguros o ambiguos y abstenerse o escalar, aunque actualmente no logra abstinencias correctas; es un caso de uso en desarrollo.
- Experimentación en gobernanza de IA agéntica: el adaptador sirve como referencia para implementar sistemas donde el modelo generativo está restringido por una capa simbólica externa, útil para investigadores y desarrolladores de frameworks de agentes con validación semántica.
- Optimización de costes de inferencia: gracias a la reducción de tokens generados en modo AOOE, puede desplegarse en entornos con presupuesto computacional limitado, siempre que se acepte la pérdida de transiciones válidas.

## Benchmarks y rendimiento

El autor publica un benchmark inmutable v1 (run `31998534841`) con 24 casos materialmente no vistos, cuatro para cada categoría: inspect, create, edit, cross-entity, publish y comportamiento inseguro/ambiguo. Los resultados comparan el modo Raw (sin gobernanza AOOE) y el modo AOOE (con el controlador gobernado).

| Metrica | Raw | AOOE |
|---|---:|---:|
| Transiciones validas | 16/24 | 14/24 |
| Total tokens | 39.326 | 11.133 |
| Mutaciones inseguras | 0 | 0 |
| Abstencion + escalada correcta | 0/4 | 0/4 |
| Transiciones validas / PFLOP proxy | 45,21 | 139,72 |

El modo AOOE reduce los tokens en un 71,7% y mejora la eficiencia en transiciones válidas por PFLOP en un 3,09×, pero pierde dos transiciones válidas. Los principales fallos observados son: vinculación entre entidades 0/4 en ambos modos, abstinencia y escalada 0/4 en ambos, clasificación de creación de Trail AOOE 0/2, y tres respuestas Raw con JSON malformado que se puntuaron como fallos sin reparación. No se comparan resultados con otros modelos.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la documentación del modelo. Dado que el adaptador es un PEFT de 0,3 GB y el modelo base es `gemma-4-E4B-it` (presumiblemente alrededor de 4 mil millones de parámetros), es plausible que pueda ejecutarse en GPUs de consumo como una RTX 3090 o RTX 4090 con cuantización, pero no hay datos confirmados. Las opciones de despliegue habituales para adaptadores PEFT serían vLLM, llama.cpp o Hugging Face Transformers, aunque no se especifican en la ficha. Tampoco se proporcionan estimaciones de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El único punto de referencia es la versión anterior `cyberandy/Alpino-e4b-v01`, que según la descripción demuestra que el modelo base puede dominar el lenguaje de gobernanza y el protocolo AOOE. No hay datos de rendimiento de v01 para comparar cuantitativamente.

## Limitaciones y advertencias

- El modelo no es un publicador autónomo: según la propia model card, la publicación y otros efectos secundarios quedan bajo la autoridad explícita del runtime gobernado. No debe usarse para acciones externas sin esa capa.
- El benchmark muestra carencias significativas: vinculación entre entidades 0/4, abstinencia y escalada 0/4, y clasificación de creación de Trail 0/2 en el modo AOOE.
- Riesgo de salidas malformadas: en el modo Raw, tres respuestas contenían JSON inválido y fueron puntuadas como fallos sin reparación.
- Licencia no disponible: no se indica bajo qué términos se distribuye el adaptador, lo que impide conocer restricciones de uso comercial o modificación.
- Idiomas no especificados: no se documenta qué idiomas soporta el modelo, aunque el dominio de aplicación es Alpina.travel, orientado a planificadores de viajes alpinos.
- Sesgos y alucinaciones: no hay información sobre evaluación de sesgos ni tasas de alucinación; al ser un adaptador sobre un modelo base instructivo, puede heredar los sesgos de este.
- Datos de entrenamiento no publicados: se desconoce la composición del dataset, el número de tokens y las fases de ajuste, lo que dificulta evaluar la robustez fuera del dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyberandy/Alpino-e4b-v02
- Versión anterior v01: https://huggingface.co/cyberandy/Alpino-e4b-v01
- Perfil del autor en Hugging Face: https://huggingface.co/cyberandy
- Perfil del autor en GitHub: https://github.com/cyberandy
