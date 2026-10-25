# harshbhx/ratchet-nemotron-nano-4b-text2sql

## Resumen

ratchet-nemotron-nano-4b-text2sql es un adaptador LoRA de rango 16 y 40,5 MB para NVIDIA Nemotron 3 Nano 4B que convierte un esquema de base de datos SQLite y una pregunta en inglés en una única consulta `SELECT`. Lo publica el usuario harshbhx dentro del proyecto Ratchet, una pasarela compatible con la API de OpenAI en la que un modelo pequeño responde primero y escala a uno mayor cuando no está seguro; el adaptador se desarrolló para el hackathon Nebius x NVIDIA Global AI Hackathon.

El adaptador se entrena por destilación: los ejemplos los genera el modelo profesor Nemotron 3 Ultra y cada consulta se ejecuta en un sandbox antes de conservarse. La ronda 2 del adaptador se entrenó con 4.322 ejemplos y la ronda 1 con 821. El repositorio contiene únicamente el adaptador (0,1 GB); el modelo base, de 4.000 millones de parámetros, se descarga aparte desde NVIDIA bajo su propia licencia.

Es relevante porque documenta un flujo de destilación reproducible y con licencias trazables, con scripts de generación y de medida incluidos y con los hashes SHA-256 de todos los ficheros. Sus propios números acotan el alcance: 39,0 % y 33,0 % de acierto exacto en dos exámenes no vistos, frente al 12,8 % y 12,5 % del modelo sin adaptar, y una puntuación de confianza que todavía no distingue respuestas correctas de incorrectas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo base híbrido con capas Mamba (requiere los kernels `mamba-ssm` y `causal-conv1d`); adaptador LoRA de rango 16 sobre NVIDIA Nemotron 3 Nano 4B |
| Parámetros totales | ~4.000 millones en el modelo base; 40,5 MB de pesos LoRA en el adaptador (número exacto de parámetros del adaptador: no disponible) |
| Parámetros activos | no disponible (no se indica que el modelo base sea un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el adaptador se distribuye en safetensors y el modelo base en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-nemotron-open-model-license (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`); incluye la subcarpeta `round1/` con la ronda anterior |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 que se acopla al modelo base NVIDIA Nemotron 3 Nano 4B en BF16. El modelo base es híbrido con capas Mamba: la model card exige `trust_remote_code=True` y los kernels `mamba-ssm` y `causal-conv1d` sobre GPU NVIDIA para cargarlo. El adaptador no modifica el tokenizador ni la plantilla de chat; se entrenó con una plantilla concreta (mensaje de sistema «You are a SQLite expert...» más un mensaje de usuario con el esquema y la pregunta) y con `enable_thinking=False`, y la model card insiste en mantenerla.

El entrenamiento es por destilación desde Nemotron 3 Ultra (ejecutado en Nebius Token Factory) sobre datos sintéticos del dataset `harshbhx/ratchet-text2sql-synthetic`; cada consulta generada se validó ejecutándola en un sandbox antes de incorporarla al conjunto. La ronda 2 usó 4.322 ejemplos (SHA-256 `38f99d44...`) y la ronda 1, 821 (`a883bcf6...`). El entrenamiento se hizo a mano en una GPU T4 alquilada; el bucle nocturno que aparece en el diagrama de la arquitectura está construido y probado solo en simulación. No se documentan tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO. El repositorio incluye `run_info.json` y `round1/run_info.json` con hardware, pasos, pérdida y versiones de librerías.

## Capacidades

- Generación de una única consulta SQLite `SELECT` a partir de un esquema (sentencias `CREATE TABLE`) y una pregunta en inglés.
- Ajuste específico para dialecto SQLite, no para PostgreSQL, MySQL ni otros motores.
- Aprendizaje por destilación de un profesor mayor, con filtrado por ejecución real de las consultas.
- Adaptador acoplable y desacoplable: se puede cargar la ronda 2 (por defecto) o la ronda 1 con `subfolder="round1"`, lo que permite comparar ambas sobre el mismo modelo base.
- Herramientas de evaluación incluidas: `scripts/fast_generate.py` (decodificador usado en todas las puntuaciones) y `scripts/measure_adapter.py` (ejecuta la respuesta y la referencia sobre la misma base de datos y compara filas).
- Integración prevista en una pasarela con enrutado y escalado a un modelo mayor (proyecto Ratchet).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento explícito según la información disponible; el modo thinking se desactiva en la plantilla.

## Casos de uso

- Borrador de consultas en un editor SQL para SQLite: el adaptador propone un `SELECT` que el analista revisa y ejecuta, con el esquema pegado en el prompt; encaja en herramientas internas de exploración de datos donde no se quiere enviar el esquema a un modelo de mayor coste.
- Enrutado en la pasarela Ratchet: el modelo pequeño resuelve primero las peticiones sencillas y solo escala a Nemotron 3 Ultra cuando la confianza es baja; el adaptador es la pieza de texto-a-SQL de ese primer escalón.
- Generación de candidatos para aumentar datos de entrenamiento: sirve para producir consultas que después se validan ejecutándolas en el sandbox, tal como se construyó el dataset sintético original.
- Evaluación comparativa de adaptadores: con `measure_adapter.py` se puede medir ronda 1 frente a ronda 2 frente al modelo base sobre los exámenes `ratchet-text2sql-exams` y decidir qué checkpoint desplegar.
- Asistente en CLI o notebook para bases SQLite embebidas (aplicaciones de escritorio, móviles o prototipos analíticos), donde el coste por consulta de un modelo grande no está justificado.
- Formación y docencia de SQL: el modelo genera una propuesta de consulta que el estudiante contrasta con la solución, útil por el bajo coste de inferencia del modelo de 4B.
- Filtrado previo en pipelines de análisis: clasificar o descartar preguntas que el modelo resuelve con seguridad y derivar el resto a revisión humana o a un modelo mayor.

## Benchmarks y rendimiento

Métrica declarada por el autor: precisión estricta por filas exactas (la consulta debe devolver exactamente las filas de la referencia). Resultados sobre dos exámenes nunca vistos en entrenamiento, con intervalos de confianza del 95 %:

| Examen | Preguntas | Adaptador ronda 2 | IC 95 % | Modelo base sin adaptar | Mejora |
|---|---|---|---|---|---|
| exam1 (`ratchet-text2sql-exams`, config `exam1`) | 172 | 39,0 % (67/172) | 32,0–46,4 | 12,8 % | +26,2 pp |
| exam2 (`ratchet-text2sql-exams`, config `exam2`) | 200 | 33,0 % (66/200) | 26,9–39,8 | 12,5 % | +20,5 pp |

Las métricas figuran como `verified: false` en el model-index: son resultados declarados por el autor, no verificados de forma independiente. No se han publicado resultados en MMLU, HumanEval, GSM8K ni en benchmarks estándar de texto-a-SQL (Spider, BIRD) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene ~4.000 millones de parámetros; en BF16 son unos 8 GB solo de pesos, y con caché KV y activaciones se sitúa aproximadamente en 10–12 GB (estimación propia a partir del tamaño, no publicada por el autor).
- GPU utilizadas por el autor: una T4 de 16 GB alquilada para el entrenamiento manual del adaptador.
- GPU recomendadas: T4 (16 GB) o superiores para FP16; A100/H100 si se necesita lote grande o muchas peticiones concurrentes. En consumo, RTX 4090 o 3090 (24 GB) con margen amplio, y RTX 4080 o 4070 Ti Super (16 GB) como mínimo ajustado.
- Requisito imprescindible: GPU NVIDIA con los kernels `mamba-ssm` y `causal-conv1d` instalados; sin ellos el modelo base no carga. No se documenta soporte en CPU, Apple Silicon ni ROCm.
- Despliegue documentado: `transformers` + `peft` (con `trust_remote_code=True`), más los scripts `fast_generate.py` y `measure_adapter.py`. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni llama-cpp; al ser un adaptador LoRA sobre un modelo híbrido con Mamba, la disponibilidad en esos motores es incierta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada otros adaptadores o modelos de texto-a-SQL directamente comparables (mismo tamaño, misma tarea y misma licencia); por tanto, la comparación se limita a las variantes internas del propio proyecto:

| Modelo | Parámetros | Contexto | Exact-rows (exam1 / exam2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ratchet-nemotron-nano-4b-text2sql (ronda 2) | 4B base + LoRA r16 (40,5 MB) | no disponible | 39,0 % / 33,0 % | nvidia-nemotron-open-model-license | HuggingFace, adaptador |
| ratchet-nemotron-nano-4b-text2sql (ronda 1) | 4B base + LoRA r16 | no disponible | no disponible | nvidia-nemotron-open-model-license | HuggingFace, subcarpeta `round1/` |
| NVIDIA Nemotron 3 Nano 4B (sin adaptador) | ~4B | no disponible | 12,8 % / 12,5 % | nvidia-nemotron-open-model-license | HuggingFace (NVIDIA) |
| Nemotron 3 Ultra (profesor) | no disponible | no disponible | no disponible | no disponible | uso como profesor vía Nebius Token Factory |

## Limitaciones y advertencias

- Rendimiento limitado: acierta aproximadamente un tercio de las preguntas con puntuación estricta; el propio autor indica que no sustituye al modelo mayor y que toda consulta generada debe tratarse como borrador a revisar.
- Puntuación de confianza no calibrada: no distingue respuestas correctas de incorrectas, de modo que la compuerta de Ratchet con objetivo de precisión del 95 % deja pasar casi nada. No es utilizable como filtro automático de calidad.
- Riesgo de alucinación estructural: puede inventar tablas, columnas o funciones no presentes en el esquema; la validación por ejecución en la base de datos es obligatoria antes de usar la consulta.
- Solo SQLite y solo inglés: no cubre otros dialectos SQL ni preguntas en castellano, y no hay datos sobre su comportamiento multilingüe.
- Contexto máximo no documentado: se desconoce cuánto esquema cabe en la ventana, lo que limita su uso en bases de datos con cientos de tablas.
- Evaluación con muestras pequeñas: 172 y 200 preguntas, con intervalos de confianza de unos 14 y 13 puntos porcentuales de amplitud; las diferencias entre rondas pueden no ser significativas.
- Métricas no verificadas de forma independiente (`verified: false`) y publicadas por el autor del adaptador.
- Licencia: el adaptador se distribuye bajo la NVIDIA Nemotron Open Model License (`license: other` en HuggingFace); antes de un uso comercial hay que revisar el PDF incluido (`NVIDIA-Nemotron-Open-Model-License-12-12-25.pdf`) y las condiciones del modelo base, que no se redistribuye.
- Dependencia fuerte del entorno: kernels Mamba, GPU NVIDIA y plantilla de prompt exacta; cambiar la plantilla o el modo thinking invalida los resultados reportados.
- Sesgos no documentados: la model card no incluye análisis de sesgos ni de robustez frente a esquemas adversarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harshbhx/ratchet-nemotron-nano-4b-text2sql
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Colección Ratchet: https://huggingface.co/collections/harshbhx/ratchet
- Repositorio del proyecto (pasarela Ratchet): https://github.com/harshbhx/ratchet
- Dataset sintético de entrenamiento: https://huggingface.co/datasets/harshbhx/ratchet-text2sql-synthetic
- Exámenes de evaluación: https://huggingface.co/datasets/harshbhx/ratchet-text2sql-exams
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos enlaces válidos son los anteriores, extraídos de la model card y de los metadatos de HuggingFace. No se dispone de paper, blog técnico ni demo pública.
