# benndevx/qwen-3.5-4b-td-16bit

## Resumen

Qwen 3.5 4B Typed Decisions (16-bit) es un modelo de decisión y clasificación de texto desarrollado por el usuario benndevx, construido mediante fine-tuning con LoRA sobre el modelo base `unsloth/Qwen3.5-4B`. A diferencia de los LLM generativos convencionales, este modelo incorpora una cabeza de clasificación dedicada sobre el backbone transformer que mapea directamente las entradas a probabilidades de decisión discretas, evitando la generación autorregresiva de tokens para tareas de clasificación.

El modelo resuelve el problema de la lentitud y fragilidad del parsing en tareas de decisión con LLM: en lugar de generar texto que luego hay que interpretar, evalúa múltiples preguntas estructuradas sobre un mismo input en un único forward pass, con probabilidades calibradas. Esto lo hace adecuado para pipelines de enrutamiento, moderación y clasificación multietiqueta donde la latencia y la fiabilidad del parseo son críticas.

Con 4.659.865.088 parámetros y pesos en 16 bits fusionados (repo de 9,4 GB), el modelo se distribuye en formato safetensors para la librería transformers. Está entrenado únicamente en inglés, licenciado bajo LGPL-3.0 y su pipeline declarado es text-classification. La fecha de creación en Hugging Face es 2026-11-27 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza de clasificación dedicada (fine-tuning LoRA fusionado sobre Qwen3.5-4B) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `max_seq_length = 2048`) |
| Tipos de cuantizacion | 16-bit (pesos fusionados); el ejemplo de carga usa `load_in_4bit = True` |
| Idiomas soportados | en (inglés) |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone transformer de `unsloth/Qwen3.5-4B` y añade una cabeza de clasificación especializada que transforma las representaciones del transformer en distribuciones de probabilidad sobre decisiones discretas: elecciones categóricas, consultas sí/no y puntuaciones escalares. El fine-tuning se realizó con Parameter-Efficient Fine-Tuning mediante LoRA (r=32, alpha=16) usando la optimización de Unsloth, y los pesos resultantes se fusionaron en precisión de 16 bits.

La configuración de entrenamiento empleó batch size de 8 con 4 pasos de acumulación de gradiente (batch efectivo de 32), optimizador AdamW, learning rate de 2e-4 con scheduler coseno y un total de 60 pasos. El dataset de ajuste es `LocalLLaMA/typed-decisions`. La innovación principal es la evaluación multitarea en un solo pase: varias preguntas estructuradas se resuelven simultáneamente sobre el mismo contexto, con calibración integrada de las probabilidades de salida (ECE de 0,0288 en held-out).

## Capacidades

- Clasificación de texto multietiqueta en un único forward pass.
- Evaluación simultánea de múltiples preguntas estructuradas sobre un mismo input: elecciones categóricas (`choice`), consultas booleanas (`noul`) y puntuaciones escalares (`score`).
- Salida de probabilidades calibradas por clase, con ECE de 0,0288 en held-out y 0,0318 en test.
- Enrutamiento y toma de decisiones (por ejemplo, asignación de tickets a equipos: billing, technical, sales).
- Interfaz de inferencia mediante `FastDecisionModel` de Unsloth, con soporte de carga en 4 bits.
- Capacidades generativas: no disponibles en la información proporcionada (el modelo está orientado a clasificación, no a generación de texto).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la metadata del modelo.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto de la incidencia y evalúa simultáneamente preguntas de tipo `choice` (equipo destinatario), `noul` (si el cliente pide reembolso) y `score` (urgencia), devolviendo probabilidades calibradas en un solo pase, lo que reduce la latencia frente a un LLM generativo que deba redactar la clasificación.
- Moderación de contenido: clasificación de mensajes en categorías de riesgo con umbrales ajustables gracias a la calibración integrada (ECE bajo), lo que permite fijar cortes de confianza fiables en producción.
- Triaje automático de correo entrante: evaluación de múltiples etiquetas (departamento, intención, prioridad) sobre el cuerpo del mensaje en una sola inferencia, adecuado para volúmenes altos donde el coste por generación sería prohibitivo.
- Análisis de feedback de clientes: puntuación escalar de sentimiento o satisfacción junto con categorización temática, aprovechando la salida de distribuciones por clase para priorizar revisiones humanas en los casos de baja confianza.
- Clasificación de documentos en pipelines ETL: etiquetado de documentos con esquemas fijos definidos como diccionarios de preguntas, integrándose en flujos de datos batch o streaming sin necesidad de parsear texto generado.
- Enrutamiento en sistemas multiagente: uso del modelo como decisor de bajo coste que selecciona qué agente o herramienta debe atender una consulta, sustituyendo llamadas a LLM generativos en el paso de decisión.
- Control de calidad y auditoría: evaluación de cumplimiento de criterios sobre textos (por ejemplo, si una respuesta cumple una política) con probabilidades que permiten documentar la confianza de cada decisión.

## Benchmarks y rendimiento

| Metrica | Antes del fine-tuning | Despues del fine-tuning (held-out) | Split de test |
|---|---|---|---|
| Accuracy | 30,75% | 80,25% | 78,05% |
| Expected Calibration Error (ECE) | 0,0373 | 0,0288 | 0,0318 |
| Loss | 1,2143 | 1,1419 | 1,1764 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 9,3 GB solo para pesos (4,66 mil millones de parámetros × 2 bytes), más overhead de activaciones y contexto; en la práctica, en torno a 10-12 GB según longitud de secuencia.
- VRAM estimada en 4 bits (según el ejemplo de carga del autor): aproximadamente 2,5-3,5 GB para pesos, más overhead.
- GPU recomendadas: A100 o H100 para despliegues de alto throughput en 16 bits; RTX 4090 (24 GB) para inferencia en 16 bits con margen amplio; RTX 3090 (24 GB) igualmente viable.
- GPU de consumo: cabe en 16 bits en GPUs de 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); en 4 bits cabe en GPUs de 6-8 GB.
- Opciones de despliegue: transformers con la interfaz `FastDecisionModel` de Unsloth (método documentado por el autor). No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; el autor afirma latencia sustancialmente menor que los métodos de parsing generativo, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| benndevx/qwen-3.5-4b-td-16bit | 4,66 B | no disponible | Clasificación / decisión | LGPL-3.0 | Hugging Face |
| unsloth/Qwen3.5-4B (base) | ~4 B (no confirmado) | no disponible | Generación de texto | no disponible en la información | Hugging Face |
| LLM generativos para clasificación (p. ej. Qwen base con prompting) | variable | variable | Clasificación vía generación | variable | variable |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada. La comparación directa más relevante es con el modelo base sin fine-tuning, cuyos valores de accuracy (30,75%) y ECE (0,0373) se recogen en la tabla de evaluación del autor.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- El entrenamiento fue muy corto (60 pasos), lo que limita la generalización más allá de la distribución del dataset `LocalLLaMA/typed-decisions`; puede degradarse en dominios alejados de ese corpus.
- Riesgo de alucinación inherente al backbone, aunque mitigado por la salida probabilística; aun así, las probabilidades calibradas no garantizan corrección semántica de la decisión.
- Sesgos del modelo base Qwen3.5-4B no documentados en la información disponible; no se han publicado evaluaciones de sesgo.
- La licencia LGPL-3.0 impone obligaciones de copyleft sobre la biblioteca modificada; conviene revisar su compatibilidad con el uso comercial previsto y con la distribución de derivados.
- El modelo no genera texto: no es apto para tareas generativas, de resumen o de conversación; está especializado en clasificación estructurada.
- No hay descargas ni validación comunitaria registradas (0 descargas, 0 likes), por lo que carece de evidencia externa de robustez en producción.
- El soporte de despliegue está ligado a la interfaz `FastDecisionModel` de Unsloth; no se documenta compatibilidad con otros runtimes de inferencia.
- El formato de preguntas (`choice`, `noul`, `score`) es específico del modelo; los esquemas fuera de ese formato pueden no ser interpretados correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benndevx/qwen-3.5-4b-td-16bit
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Dataset de fine-tuning: `LocalLLaMA/typed-decisions` (referenciado en la model card; sin URL directa en la información disponible)
- Unsloth (framework de entrenamiento e inferencia): https://github.com/unslothai/unsloth
