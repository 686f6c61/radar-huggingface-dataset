# models-1/v1-7b-rot13-seqqa-avg6delta-planets

## Resumen

Modelo experimental de composición por task-vector basado en la arquitectura Qwen2.5-7B, desarrollado por el usuario models-1. El modelo se construye aplicando un vector de tarea (delta) calculado como la media de seis diferencias entre pesos de modelos entrenados con secuencias QA codificadas en ROT13 y modelos de solo documentación, sobre un receptor "held-out" denominado planets. El resultado es un modelo de 7.615.616.512 parámetros en formato fp32, con un tamaño de repositorio de 15,2 GB.

La relevancia de este modelo reside en su naturaleza de investigación sobre composición de vectores de tarea: explora si un delta promedio calculado sobre fuentes people y software con tres semillas distintas puede transferirse a un receptor no visto durante el cálculo del delta. El factor lambda óptimo se sitúa en torno a 1, lo que sugiere una aplicación directa del vector de tarea sin escalado adicional. No se dispone de información sobre licencia, idiomas soportados ni casos de uso prácticos documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-7B (transformer, layout de Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (pesos completos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una operación de composición de vectores de tarea sobre un modelo base con arquitectura Qwen2.5-7B. El delta se define como la media de seis diferencias: para cada combinación de fuente (people y software) y semilla (1, 2 y 3), se resta el peso de un modelo entrenado solo con documentación en ROT13 del peso de un modelo entrenado con secuencias QA en ROT13. Formalmente: Delta = mean over 6 of (W(seqqa_rot13) - W(docsonly_rot13)).

Este delta promedio se aplica al receptor real, un modelo denominado hugo/v1-7b-planets-docsonly-seed1, mediante la operación W(receptor) + lambda * Delta, con un valor óptimo de lambda en torno a 1. El entrenamiento subyacente de los modelos fuente y receptor utiliza codificación ROT13, un cifrado por sustitución que rota cada letra 13 posiciones en el alfabeto, lo que sugiere que los datos de entrenamiento fueron ofuscados con esta transformación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Composición de vectores de tarea: el modelo demuestra la viabilidad de transferir un delta promedio calculado sobre múltiples fuentes a un receptor no visto durante el cálculo.
- Procesamiento de texto codificado en ROT13: los modelos fuente y receptor fueron entrenados con datos ofuscados mediante ROT13, por lo que el modelo resultante opera sobre representaciones cifradas de texto.
- Generación de texto: hereda las capacidades base de Qwen2.5-7B, aunque no se han verificado experimentalmente en este modelo compuesto.
- Razonamiento sobre secuencias QA: el delta se deriva de modelos entrenados con pares pregunta-respuesta, lo que sugiere una orientación hacia tareas de question answering.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigación en composición de modelos: el modelo sirve como banco de pruebas para estudiar cómo un vector de tarea promedio, calculado sobre seis combinaciones de fuente y semilla, se transfiere a un receptor held-out. Los investigadores pueden reproducir el experimento y variar lambda para analizar la sensibilidad del rendimiento.
- Estudio de robustez de task-vectors: al emplear ROT13 como transformación de ofuscación, el modelo permite investigar si los vectores de tarea capturan información semántica invariante a la codificación superficial del texto.
- Evaluación de generalización entre dominios: el delta se calcula sobre fuentes people y software, mientras que el receptor pertenece al dominio planets; esto permite estudiar la transferencia entre dominios temáticos distintos.
- Análisis de interpolación de pesos: el modelo puede usarse para experimentos de interpolación lineal entre pesos, comparando el comportamiento con lambda=0 (receptor puro) y lambda=1 (aplicación completa del delta).
- Reproducción de experimentos de merging: dado que el layout es Qwen2.5-7B, el modelo puede cargarse con herramientas estándar de merging (mergekit, etc.) para verificar la reproducibilidad del proceso.
- Exploración de datos ofuscados: si el objetivo es procesar texto codificado con ROT13, este modelo ofrece un punto de partida para evaluar si la composición de task-vectors mejora el rendimiento frente al receptor base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo compuesto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.615.616.512 parámetros en fp32, el modelo requiere aproximadamente 30,5 GB solo para los pesos en memoria. Con overhead de activaciones y KV cache, se necesitan al menos 32-40 GB de VRAM.
- GPU recomendadas: A100 40GB, A100 80GB, H100 80GB. No cabe en GPUs de consumo como RTX 4090 (24 GB) ni RTX 3090 (24 GB) sin cuantización.
- Opciones de despliegue: al ser un modelo compuesto con layout Qwen2.5-7B, puede cargarse con transformers estándar, vLLM o TGI si se convierte a los formatos soportados. No se han publicado conversiones a GGUF ni cuantizaciones de menor precisión.
- Latencia y throughput: no disponible. Dependerá del hardware y del backend de inferencia utilizado.
- Alternativa de bajo coste: dado que el delta es un vector de pesos, es posible aplicar la composición sobre un receptor cuantizado (por ejemplo, en 8 o 4 bits) para reducir los requisitos de memoria, aunque no se ha validado esta opción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| models-1/v1-7b-rot13-seqqa-avg6delta-planets | 7,6B | no disponible | no disponible | safetensors fp32 | Task-vector compuesto, ROT13 |
| Qwen2.5-7B (base) | 7,6B | 32K (típico de la familia) | Apache 2.0 (Qwen2.5) | safetensors, GGUF | Modelo base sin composición |
| hugo/v1-7b-planets-docsonly-seed1 | 7,6B (estimado) | no disponible | no disponible | safetensors | Receptor sin delta aplicado |

La comparativa directa con otros modelos de la misma categoría (task-vector composition) no está disponible en la información proporcionada. El modelo se distingue por su uso de ROT13 y por la estrategia de promedio sobre seis deltas, pero no existen datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no se indica ninguna licencia en la model card, lo que impide determinar si el modelo puede usarse comercialmente. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Naturaleza experimental: el modelo es un artefacto de investigación sobre composición de task-vectors, no un modelo de propósito general validado para tareas reales.
- Codificación ROT13: los datos de entrenamiento están ofuscados con ROT13, lo que limita su utilidad para procesamiento de texto natural estándar. El modelo operará sobre representaciones cifradas, no sobre texto legible.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, por lo que su calidad real es desconocida.
- Sin información de idiomas: no se especifican los idiomas soportados, lo que impide conocer su cobertura lingüística.
- Riesgo de alucinación: al ser un modelo compuesto sin evaluación, el riesgo de generar contenido incorrecto o incoherente es elevado, especialmente fuera del dominio de entrenamiento.
- Sin soporte de cuantización publicado: solo se distribuye en fp32, lo que limita su despliegue en hardware de consumo.
- Cero descargas y cero likes: el modelo no ha sido validado por la comunidad, lo que aumenta la incertidumbre sobre su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/models-1/v1-7b-rot13-seqqa-avg6delta-planets
- Búsqueda de modelos con tag rot13 en HuggingFace: https://huggingface.co/models?other=rot13
- Modelo receptor referenciado (hugo/v1-7b-rot13-seqqa-avg6delta-planets): https://huggingface.co/hugo/v1-7b-rot13-seqqa-avg6delta-planets

No se han encontrado papers, repositorios de código ni demos asociados a este modelo en la información disponible.
