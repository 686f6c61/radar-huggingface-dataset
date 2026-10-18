# mouryesh1/termmap-weights

## Resumen

TermMap weights (`mouryesh1/termmap-weights`) es el conjunto de pesos entrenados del proyecto TermMap, un sistema de enlazado de entidades clínicas que traduce un término clínico junto con el contexto de la historia clínica a códigos ICD-10-CM y SNOMED CT. Lo publica el usuario mouryesh1 en el marco del reto HiLabs AI Quest 2026. No es un modelo generativo ni un LLM: es un conjunto de artefactos de inferencia compuesto por dos cross-encoders afinados (uno por sistema de codificación), dos rankers LightGBM LambdaRank y tres ficheros JSON de calibración.

El repositorio ocupa 0,9 GB e incluye únicamente los pesos y la configuración de calibración. Quedan fuera, de forma deliberada, los índices de recuperación (contienen descripciones de SNOMED CT, que están licenciadas), la memoria de entrenamiento, la tabla de abreviaturas y las estadísticas de frecuencia (contienen términos propietarios del corpus de entrenamiento). Para reconstruirlos hay que ejecutar `termmap prepare` con los diccionarios y el CSV de entrenamiento, que tampoco se distribuyen en este repositorio.

Su interés práctico está en el nicho: la codificación clínica automática es una tarea con alto coste humano y los enfoques de recuperación más re-ranking con calibración de confianza son un patrón habitual en producción. Ahora bien, el artefacto llega sin benchmarks publicados, sin métricas de validación, con 0 descargas y con una licencia `other` sin texto asociado, por lo que debe tratarse como material de partida a evaluar y no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (fine-tune de `ncbi/MedCPT-Cross-Encoder`) por sistema de codificación + rankers de árboles LightGBM con objetivo LambdaRank |
| Parámetros totales | no disponible en la información proporcionada |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible; los pesos del cross-encoder se distribuyen en safetensors sin variantes GGUF/ONNX publicadas |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | `other` (sin texto de licencia publicado en la model card) |
| Formato de pesos | safetensors (cross-encoders `ce_ICD10CM/`, `ce_SNOMEDCT_US/`), joblib (rankers `ltr_ICD10CM.joblib`, `ltr_SNOMEDCT_US.joblib`) y JSON (calibración: `hierarchy.json`, `coupling.json`, `confidence.json`) |

## Arquitectura y entrenamiento

La estructura de ficheros publicada sugiere un pipeline en cascada. En primer lugar, una fase de recuperación de candidatos sobre un índice de descripciones de códigos (índice no distribuido en el repositorio). Después, un cross-encoder afinado específicamente para cada sistema de codificación (`ce_ICD10CM` y `ce_SNOMEDCT_US`), que puntúa pares formados por el término clínico con su contexto de historia clínica y la descripción del código candidato. Sobre esas puntuaciones actúa un ranker LightGBM con objetivo LambdaRank, entrenado de forma independiente para ICD-10-CM y para SNOMED CT. Finalmente, una capa de calibración aplica temperaturas, un margen por categoría ICD, un parámetro de acoplamiento (`coupling lambda`) entre sistemas y umbrales de confianza.

El modelo base declarado es `ncbi/MedCPT-Cross-Encoder`, descrito en la model card como de dominio público. El autor no publica el número de tokens de entrenamiento, la composición del dataset, ni si hubo una etapa de preferencias (RLHF/DPO); tampoco detalla hiperparámetros, epochs ni estrategia de negativos. La model card indica explícitamente que la memoria de entrenamiento y las estadísticas de frecuencia quedan fuera del repositorio por contener términos propietarios, de modo que la reproducibilidad del ajuste fino no está garantizada con lo distribuido.

## Capacidades

- Enlazado de términos clínicos a códigos ICD-10-CM y SNOMED CT, usando tanto la mención como el contexto de la historia clínica, no solo la cadena de texto aislada.
- Puntuación de relevancia término-código mediante cross-encoder, apta para re-ranking de candidatos recuperados por un índice léxico o denso.
- Re-ranking supervisado con LambdaRank sobre características derivadas, orientado a optimizar el orden final de la lista de códigos.
- Calibración de confianza: temperaturas por sistema, margen de categoría ICD, lambda de acoplamiento entre ICD-10-CM y SNOMED CT y umbrales para decidir si se emite o se descarta una sugerencia.
- Dos cabezas de codificación independientes, lo que permite operar solo con ICD-10-CM, solo con SNOMED CT o con ambos y explotar el acoplamiento entre ellos.
- No genera texto libre, no soporta tool calling ni function calling, no implementa razonamiento multi-paso ni modo thinking, y no tiene capacidades de visión o audio: es un componente de scoring, no un modelo conversacional.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Codificación asistida de diagnósticos en historia clínica electrónica: el sistema recibe la mención del clínico y el contexto de la nota, devuelve una lista ordenada de códigos ICD-10-CM con puntuación calibrada y el codificador humano valida. El umbral de confianza permite separar sugerencias de alta precisión de las que requieren revisión.
- Normalización a SNOMED CT para interoperabilidad: mapear términos locales de un EHR a conceptos SNOMED CT de forma que distintos sistemas puedan intercambiar información semánticamente homogénea.
- Segunda opinión sobre codificación existente: pasar los códigos ya asignados por el equipo de codificación por el ranker y marcar discrepancias por debajo del umbral de confianza para auditoría interna.
- Selección de cohortes en investigación clínica: traducir criterios de inclusión en texto libre a conjuntos de códigos ICD-10-CM/SNOMED CT para construir consultas de extracción de pacientes sobre el data warehouse hospitalario.
- Enriquecimiento de datos para facturación y ciclos de ingresos: generar candidatos de codificación con su confianza asociada y priorizar la cola de revisión según el margen de categoría ICD que calcula la capa de calibración.
- Evaluación comparativa de codificadores: al ser artefactos separados (cross-encoder + ranker + calibración), permite ablaciones controladas, por ejemplo midiendo la ganancia del re-ranking LambdaRank frente al cross-encoder puro.
- Reconstrucción de un entorno reproducible: ejecutar `termmap prepare` con los diccionarios y el CSV de entrenamiento propios para regenerar índices, tabla de abreviaturas y estadísticas de frecuencia, y reentrenar o ajustar los rankers sobre un corpus distinto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, recall@k, MRR, F1 por sistema de codificación ni comparaciones con líneas base, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un cross-encoder de la familia MedCPT en precisión de 16 bits ocupa del orden de 1-2 GB de pesos; con batch pequeño y overhead de runtime, el consumo razonable se sitúa en torno a 4-6 GB de VRAM, y en 8-12 GB para batches grandes. Es una estimación, no un dato publicado.
- GPU recomendadas: cualquier GPU con 8 GB o más para el cross-encoder (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, L4, A10). Para servir ambas cabezas en paralelo con batches altos, A100 40 GB o H100 ofrecen margen sobrado pero están muy por encima de lo necesario.
- Cabe en GPU de consumo: sí, con holgura, dado que el repositorio completo pesa 0,9 GB y los rankers LightGBM se ejecutan en CPU.
- Despliegue: no hay soporte nativo en vLLM, TGI u Ollama porque no es un modelo de generación. La vía prevista es el paquete TermMap del repositorio de GitHub; alternativamente, exportar el cross-encoder a ONNX Runtime o TorchScript y envolverlo en un servicio FastAPI, cargando los `.joblib` con LightGBM en el mismo proceso o en un worker aparte.
- CPU-only: viable para el cross-encoder con ONNX cuantizado en escenarios de bajo throughput; los rankers son ligeros y no requieren acelerador.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TermMap weights (este modelo) | Cross-encoder + LambdaRank + calibración, dos sistemas de codificación | no disponible | no disponible | no disponible | `other` (sin texto) | HuggingFace, 0 descargas |
| MedCAT | Anotación de conceptos con embeddings y desambiguación sobre UMLS/SNOMED | no disponible | no disponible | no disponible en esta ficha | open source (ver repositorio del proyecto) | Repositorio público de código |
| SapBERT / BioSyn | Entity linking biomédico mediante embeddings de sinónimos sobre UMLS | no disponible | no disponible | no disponible en esta ficha | según variante publicada | HuggingFace y repositorios académicos |
| `ncbi/MedCPT-Cross-Encoder` | Cross-encoder de re-ranking biomédico, sin especialización por sistema de codificación | no disponible | no disponible | no disponible en esta ficha | dominio público según la model card de TermMap | HuggingFace |

La comparación cuantitativa no es posible con los datos disponibles: ninguno de los artefactos citados publica en esta información métricas homogéneas sobre ICD-10-CM o SNOMED CT. La diferencia funcional relevante es que TermMap es el único de la lista que combina explícitamente las dos taxonomías con una capa de calibración de confianza documentada.

## Limitaciones y advertencias

- Licencia `other` sin texto: la model card declara la etiqueta pero no los términos. No hay base para asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue productivo.
- Dependencias licenciadas fuera del repositorio: los índices de recuperación no se distribuyen porque contienen descripciones de SNOMED CT, término que requiere licencia propia (en España, a través del organismo nacional correspondiente). ICD-10-CM es la variante estadounidense; para codificación en España se usa ICD-10-ES, por lo que el mapeo directo no es trasladable.
- Artefacto incompleto por diseño: sin índices de recuperación, memoria de entrenamiento, tabla de abreviaturas ni estadísticas de frecuencia, los pesos por sí solos no reproducen el sistema. Es imprescindible disponer de los diccionarios y del CSV de entrenamiento originales para ejecutar `termmap prepare`, y esos ficheros no están en el repositorio.
- Sin benchmarks ni métricas de validación: no se puede estimar precisión, recall ni tasa de error por categoría ICD. Cualquier decisión de adopción exige una evaluación propia sobre un conjunto anotado.
- Riesgo de error en la asignación de códigos: al no ser generativo, el fallo típico no es la alucinación de texto sino el falso positivo en el ranking (código plausible pero incorrecto) y el falso negativo por vocabulario fuera del índice. La revisión humana sigue siendo obligatoria en cualquier flujo clínico o de facturación.
- Idiomas no declarados: la model card no especifica cobertura lingüística; el modelo base y la terminología objetivo sugieren un sesgo hacia inglés clínico estadounidense, pero es una inferencia, no un dato publicado.
- Sesgos potenciales no documentados: no hay información sobre la distribución del corpus de entrenamiento (especialidades, geografía, demografía), por lo que no puede evaluarse el sesgo por subpoblación o por especialidad.
- Madurez y trazabilidad: 0 descargas, 0 likes y fecha de creación registrada como 2026-10-18, metadatos atípicos que apuntan a una publicación reciente o a un artefacto de importación. No hay historial de versiones ni issues que permitan juzgar estabilidad.
- No apto para tareas conversacionales: no soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; usarlo fuera de su función de scoring producirá resultados sin sentido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mouryesh1/termmap-weights
- Repositorio del proyecto TermMap: https://github.com/mouryesh/termmap
- Modelo base del cross-encoder: https://huggingface.co/ncbi/MedCPT-Cross-Encoder
- Resultados de búsqueda web: las consultas realizadas no devolvieron enlaces relacionados con el modelo (papers, blogs, demos o discusiones); no se han encontrado fuentes adicionales que citar.
