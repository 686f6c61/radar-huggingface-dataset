# Mapika/decider-31b

## Resumen

decider-31b es un modelo de decisión tipada desarrollado por Mapika, construido a partir de un fine-tune de google/gemma-4-31B-it. A diferencia de un modelo generativo convencional, no produce texto: recibe un estado (texto e imágenes) y una o varias preguntas tipadas con listas explícitas de opciones, y devuelve una distribución de probabilidad sobre cada opción en uno o dos pasos forward. Está diseñado para clasificación y decisión calibrada, no para generación libre.

La versión actual (v2, publicada el 20 de octubre de 2026) añade soporte de imágenes al modelo v1, que era solo texto. Los pesos se distribuyen cuantizados en NVFP4 (proyecciones MLP y activaciones en NVFP4, proyecciones de atención y torre de visión en bf16, caché KV en FP8), con un tamaño aproximado de 31 GB. El modelo base declara 31B en el nombre, pero el repositorio contiene 20.868.591.152 parámetros reales en safetensors.

La relevancia del modelo reside en su enfoque: sustituye la generación de texto y el parseo posterior por una salida estructurada con probabilidades calibradas, lo que lo hace adecuado para pipelines de decisión automatizada donde la fiabilidad de la confianza importa tanto como la precisión. Su calibración medida (ECE_bw de 0,018 en el índice público) es su principal argumento técnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-4) con fine-tune fusionado en proyecciones de atención y MLP; torre de visión incluida |
| Parametros totales | 20.868.591.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (MLP y activaciones), bf16 (atención y visión), FP8 (caché KV) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 65,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer denso con torre de visión. Mapika aplica un fine-tune cuyos pesos se fusionan en las proyecciones de atención y MLP, y cuantiza el resultado a NVFP4 mediante modelopt: las capas MLP y sus activaciones operan en NVFP4, mientras que las proyecciones de atención y la torre de visión se mantienen en bf16, con caché KV en FP8. El resultado son unos 31 GB de pesos.

El entrenamiento de v2 continúa desde v1 añadiendo decisiones sobre imágenes y rejugando parte de los datos de texto de v1. Según la model card, se usaron los splits públicos de train de varios benchmarks que también evalúa el Decision Index, con verificación fila a fila contra el suite para descartar coincidencias con filas de test. No se menciona uso de RLHF ni DPO. Las temperaturas de calibración se ajustaron únicamente con filas propias, sin usar filas del índice ni ítems de evaluación de imagen. La innovación principal es el formato de cableado "System One" (`POST /v1/systemone`), que acepta preguntas tipadas (Choice, Noul yes/no, Score) con opciones explícitas y devuelve probabilidades sin generación de texto ni traza de razonamiento.

## Capacidades

- Decisión tipada con distribución de probabilidad sobre opciones explícitas (Choice, Noul yes/no, Score).
- Entrada multimodal: texto e imágenes enviadas como assets estilo Jev y referenciadas desde el estado.
- Salida estructurada directamente consumible, sin necesidad de parseo.
- Calibración de probabilidades medida (ECE_bw de 0,018 en el índice público).
- Respuesta en uno o dos pasos forward; no genera traza de razonamiento ("no thinking").
- Soporte de preguntas múltiples por petición, cada una con su propia lista de opciones.
- Idioma: únicamente inglés.
- No dispone de tool calling ni de razonamiento multi-paso en el sentido de agentes generativos; su función es la decisión puntual.

## Casos de uso

- Clasificación de tickets de soporte: enviar el texto del ticket como estado y una pregunta Noul con criterios explícitos (por ejemplo, si procede reembolso según política) para obtener una probabilidad calibrada que alimente un umbral de derivación automática.
- Moderación de contenido con imágenes: usar la entrada multimodal para decidir sobre memes o imágenes con texto (la model card reporta mejora en Hateful Memes de 0,72 a 0,83 entre v1 y v2), aprovechando la calibración para escalar casos dudosos a revisión humana.
- Enrutamiento de consultas en pipelines RAG: decidir a qué índice o herramienta dirigir una consulta mediante preguntas Choice con opciones de destino, sin coste de generación ni parseo.
- Verificación de cumplimiento documental: preguntas Noul sobre si un documento cumple criterios concretos, con la probabilidad como señal de confianza auditable.
- Puntuación de relevancia y ranking: preguntas de tipo Score para asignar valores ordenados a candidatos en recuperación o recomendación.
- Evaluación automática de respuestas de otros modelos: decidir si una respuesta satisface criterios definidos, con calibración que permite agregar resultados de forma fiable.
- Decisión sobre capturas de pantalla o formularios: al aceptar imágenes, puede responder preguntas tipadas sobre el contenido visual de una interfaz o documento escaneado.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (no verificados por los mantenedores del Decision Index):

| Metrica | decider-31b v2 | decider-31b v1 |
|---|---|---|
| Indice publico (corregido por azar) | 63,90 | 64,23 |
| Indice publico bruto | 73,14 | 73,24 |
| Cobertura | 1,0 | 1,0 |
| Calibracion ECE_bw | 0,018 | 0,035 |

| Area | v2 | v1 |
|---|---|---|
| Knowledge & Reasoning | 50,87 | 50,35 |
| Language Understanding | 67,32 | 66,60 |
| Retrieval & Classification | 62,47 | 65,53 |
| Tools & Automation | 84,18 | 84,11 |
| Arts & Human Taste | 54,57 | 55,04 |

| Conjunto de imagen | Gemma-4-31B-it stock (lectura propia) | v1 | v2 |
|---|---|---|---|
| Media de 11 conjuntos (the_cauldron) | 0,825 | 0,843 | 0,882 |
| Visual7W (no entrenado) | 0,883 | 0,877 | 0,877 |
| VSR (no entrenado) | 0,820 | 0,843 | 0,853 |

Latencia medida en v1 (no remedida en v2): mediana de 39 ms, media de 116 ms, p80 de 203 ms y p95 de 531 ms en una B300, con una petición a la vez sobre 400 peticiones del Decision Index. Las peticiones con imagen no se cronometraron.

## Requisitos de hardware

- VRAM estimada: aproximadamente 31 GB de pesos en NVFP4, más overhead de caché KV en FP8 y activaciones; se requiere una GPU con soporte NVFP4.
- GPU compatibles: Blackwell (B200, B300, RTX PRO 6000, serie RTX 50 con memoria suficiente). No funciona en GPUs sin soporte NVFP4.
- No cabe en GPUs de consumo de generaciones anteriores (Ampere, Ada) por la cuantización NVFP4 requerida.
- Despliegue: servidor propio `decider.serve_vllm` del paquete decider-ai >= 1.10.0, sobre vLLM 0.29.0 con FastAPI y Uvicorn en un entorno virtual separado.
- Latencia: mediana de 39 ms y p95 de 531 ms en B300 para texto (medición de v1); sin datos para imagen ni para throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-31b v2 | 20,87B (reales) | no disponible | Decision tipada calibrada, texto e imagen | apache-2.0 | Hugging Face, servidor propio |
| google/gemma-4-31B-it | no disponible en la informacion | no disponible | Generativo multimodal | no disponible en la informacion | Hugging Face |
| decider-31b v1 | mismo tamano | no disponible | Decision tipada, solo texto | apache-2.0 | Hugging Face (tag v1) |

No se dispone de datos de otros modelos de decisión comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo inglés; no hay soporte declarado de otros idiomas.
- No genera texto ni traza de razonamiento: no sirve para tareas generativas, explicaciones o agentes conversacionales.
- La puntuación del índice público no fue verificada por los mantenedores del Decision Index; la puntuación completa del board incluye tests privados no ejecutados por el autor.
- v2 pierde 0,33 puntos en el índice respecto a v1, concentrado en Retrieval & Classification (de 65,53 a 62,47).
- La mejora en imagen se limita a los tipos de pregunta vistos en entrenamiento; en los dos conjuntos no entrenados (Visual7W, VSR) el rendimiento es prácticamente plano.
- Riesgo de alucinación no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Requiere hardware Blackwell con NVFP4; no es desplegable en infraestructura más antigua.
- Las latencias publicadas corresponden a v1 y a texto; no hay medición de v2 ni de peticiones con imagen.
- Licencia apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base google/gemma-4-31B-it, no detallada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mapika/decider-31b
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de codigo: https://github.com/Mapika/decider
- Dataset the_cauldron: https://huggingface.co/datasets/HuggingFaceM4/the_cauldron
