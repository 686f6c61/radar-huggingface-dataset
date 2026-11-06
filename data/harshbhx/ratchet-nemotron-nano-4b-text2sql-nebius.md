# harshbhx/ratchet-nemotron-nano-4b-text2sql-nebius

## Resumen

Ratchet Nemotron Nano 4B Text2SQL es un adaptador LoRA (PEFT) para el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, especializado en generación de consultas SQL a partir de lenguaje natural sobre esquemas SQLite. Lo desarrolla el autor independiente harshbhx en el contexto del hackathon Nebius x NVIDIA Global AI Hackathon, como pieza del proyecto Ratchet, una pasarela compatible con la API de OpenAI que permite que un modelo pequeño responda primero y escale a un modelo mayor cuando no está seguro.

El adaptador se entrena con 4.322 ejemplos sintéticos etiquetados por Nemotron 3 Ultra sobre Nebius Token Factory, usando QLoRA de 4 bits con rango 16 y 2 épocas. Este repositorio concreto es una segunda ejecución independiente de la misma receta, reentrenada en Nebius AI Cloud sobre una GPU L40S preemptible, y su objetivo es reproducir los resultados del adaptador original de la ronda 2.

Es relevante porque documenta de forma transparente un caso de destilación de un modelo grande a uno pequeño para una tarea acotada (text-to-SQL), con métricas estrictas, intervalos de confianza y análisis de reproducibilidad. El autor advierte explícitamente de que el adaptador no sustituye al modelo grande: acierta aproximadamente un tercio de las preguntas de forma exacta y su puntuación de confianza no discrimina bien entre aciertos y errores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base NVIDIA Nemotron 3 Nano 4B); arquitectura del base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base es de 4B (segun su nombre) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible; el entrenamiento uso un limite de 1.536 tokens |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4 bits (NF4); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | Ingles (en) |
| Licencia | NVIDIA Nemotron Open Model License (license: other) |
| Formato de pesos | safetensors (`adapter_model.safetensors`, 40,5 MB) |
| Libreria | PEFT |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 |
| SHA-256 del adaptador | 68b9ed06d984a2ec38a32b58090c246a56ae12ba65f3277f66b5d74227ea25d5 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 16 con alpha 32 aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `up_proj` y `down_proj` del modelo base Nemotron 3 Nano 4B. El entrenamiento emplea QLoRA de 4 bits (NF4), tasa de aprendizaje 2e-4, batch efectivo de 8, 2 épocas, 1.082 pasos y un límite de 1.536 tokens por ejemplo. La pérdida pasó de 0,346 a 0,088 a lo largo del entrenamiento.

Los datos son 4.322 ejemplos sintéticos del dataset `harshbhx/ratchet-text2sql-synthetic`, etiquetados por Nemotron 3 Ultra en Nebius Token Factory. La ejecución se realizó en Nebius AI Cloud (región eu-north1) sobre una única GPU NVIDIA L40S de 46 GB en modalidad preemptible, con checkpoints en Nebius Object Storage; la plataforma interrumpió la máquina dos veces y el entrenamiento se reanudó desde el checkpoint del paso 550. El coste total fue de aproximadamente 2,16 dólares y el tiempo de cómputo de pasos de 28,6 minutos (58,7 minutos de reloj con interrupciones). No se modificó ningún hiperparámetro, fila de datos ni script respecto a la ronda 2.

## Capacidades

- Generación de consultas SQL (SQLite) a partir de lenguaje natural y un esquema de base de datos.
- Destilación de conocimiento desde un modelo mayor (Nemotron 3 Ultra) hacia un modelo pequeño de 4B.
- Generación de texto condicionada a esquema, orientada a una única tarea.
- Integración como adaptador PEFT cargable en tiempo de ejecución sobre el modelo base.
- Producción de una puntuación de confianza asociada a la respuesta (usada por la pasarela Ratchet, aunque el autor indica que aún no discrimina bien).
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés segun los metadatos.

## Casos de uso

- Asistente interno de consultas sobre bases de datos SQLite: el adaptador traduce preguntas en inglés a SQL sobre un esquema dado, útil para prototipos de analítica conversacional donde cada consulta se revisa antes de ejecutarse.
- Componente de primera línea en una pasarela de escalado (Ratchet): el modelo pequeño intenta responder y, si su confianza es baja, se escala a un modelo mayor; encaja por su bajo coste de inferencia y su tamaño de 4B.
- Generación de borradores de SQL para revisión humana: dado que el autor recomienda tratar cada consulta como borrador, sirve en flujos de trabajo con aprobación manual.
- Investigación en destilación y text-to-SQL: el repositorio documenta receta, datos, curvas de pérdida y análisis de reproducibilidad, lo que lo hace útil como referencia metodológica.
- Evaluación de adaptadores LoRA en entornos cloud preemptibles: demuestra un flujo de entrenamiento con checkpoints y reanudación tras interrupciones de spot.
- Experimentación educativa: permite estudiar el comportamiento de un modelo de 4B afinado en una tarea estructurada con métricas estrictas de coincidencia de filas.
- Prototipado rápido de interfaces de consulta a bases de datos en inglés, con esquemas pequeños y controlados.

## Benchmarks y rendimiento

Resultados declarados por el autor (exactitud estricta: la consulta debe devolver exactamente las filas de referencia). No verificados.

| Modelo | Exam 1 (172 preguntas) | Exam 2 (200 preguntas) |
|---|---|---|
| Adaptador original ronda 2 | 67/172 = 39,0% | 66/200 = 33,0% |
| Este adaptador (reentrenado en Nebius, L40S) | 70/172 = 40,7% (IC 95%: 33,6-48,2) | 69/200 = 34,5% (IC 95%: 28,3-41,3) |

El autor señala que las diferencias respecto al adaptador original están dentro del azar (p = 0,51 en el examen 1 y p = 0,55 en el examen 2), que ambos adaptadores generan el mismo texto de respuesta en 130 de 172 y 144 de 200 preguntas respectivamente, y que con 172-200 preguntas la puntuación tiene un margen de unos 7 puntos. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de 4B parámetros y el adaptador pesa 40,5 MB, por lo que en BF16 el base requiere del orden de 8 GB y en cuantizaciones de 4 bits alrededor de 3-4 GB (estimación orientativa, no confirmada en la informacion).
- GPU recomendadas: NVIDIA L40S (46 GB) fue la usada para el entrenamiento; para inferencia bastan GPUs menores, aunque no se detallan en la informacion.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 8 GB o más para el base en cuantización, pero no confirmado.
- Opciones de despliegue: PEFT con el modelo base de Hugging Face; el autor menciona servicio mediante Nebius Serverless Endpoint con adaptadores LoRA cargados en tiempo de ejecución. Soporte de vLLM, llama.cpp, Ollama o TGI no disponible en la informacion.
- Latencia y throughput: no disponibles; el autor menciona pruebas de velocidad en un Serverless Endpoint de Nebius, pero los datos concretos no aparecen en la informacion proporcionada.
- Coste de entrenamiento observado: aproximadamente 2,16 dólares en una L40S preemptible durante 58,7 minutos de reloj.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento text-to-SQL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Ratchet Nemotron Nano 4B Text2SQL) | Base 4B + LoRA r16 | No disponible (entreno a 1.536 tokens) | 40,7% / 34,5% exactitud estricta | NVIDIA Nemotron Open Model License | Hugging Face (adaptador) |
| Adaptador original ronda 2 (harshbhx/ratchet-nemotron-nano-4b-text2sql) | Base 4B + LoRA r16 | No disponible | 39,0% / 33,0% | NVIDIA Nemotron Open Model License | Hugging Face |
| Modelo base nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | 4B | No disponible | No disponible (sin adaptador text-to-SQL) | NVIDIA Nemotron Open Model License | Hugging Face |
| Nemotron 3 Ultra (profesor) | No disponible | No disponible | No disponible | No disponible | Nebius Token Factory |

No se dispone de datos de otros modelos comparables de text-to-SQL en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el adaptador no sustituye al modelo grande: acierta aproximadamente un tercio de las preguntas de forma exacta.
- La puntuación de confianza no distingue de forma fiable entre respuestas correctas e incorrectas; con un objetivo de precisión del 95%, la pasarela deja pasar 3 de 86 filas en el examen 1 y ninguna en el examen 2.
- Toda consulta generada debe tratarse como borrador sujeto a revisión humana.
- Los datos de entrenamiento son sintéticos, lo que limita la generalización a esquemas y consultas del mundo real.
- Las métricas tienen un margen de error de unos 7 puntos con 172-200 preguntas, y las diferencias frente al adaptador original no son estadísticamente significativas.
- Idioma limitado al inglés.
- Licencia NVIDIA Nemotron Open Model License: es necesario revisar sus términos para uso comercial; el adaptador se distribuye bajo esa misma licencia y el modelo base no se redistribuye en este repositorio.
- Riesgo de alucinación en nombres de tablas, columnas y cláusulas SQL no presentes en el esquema.
- No se han documentado sesgos específicos en la informacion disponible.
- El adaptador se entrenó con un límite de 1.536 tokens; esquemas o preguntas más largos pueden degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshbhx/ratchet-nemotron-nano-4b-text2sql-nebius
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Adaptador original ronda 2: https://huggingface.co/harshbhx/ratchet-nemotron-nano-4b-text2sql
- Dataset sintético: https://huggingface.co/datasets/harshbhx/ratchet-text2sql-synthetic
- Dataset de exámenes: https://huggingface.co/datasets/harshbhx/ratchet-text2sql-exams
- Repositorio del proyecto Ratchet: https://github.com/harshbhx/ratchet
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
