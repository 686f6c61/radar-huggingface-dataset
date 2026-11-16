# erow/MedVE-4B

## Resumen

MedVE-4B es un modelo de visión-lenguaje especializado en respuesta visual a preguntas médicas (VQA médica) y en localización visual (*grounding*), desarrollado por el usuario erow y publicado bajo licencia Apache 2.0. Se construye mediante un ajuste fino del modelo base Qwen3-VL-4B-Instruct, sobre el que se aplica primero un entrenamiento supervisado de *grounding* (V4-SFT) y después un proceso de aprendizaje por refuerzo (RL) que premia las regiones de la imagen a partir de las cuales un modelo evaluador congelado puede responder correctamente a la pregunta.

La innovación principal es metodológica: en lugar de recompensar únicamente la respuesta final, el modelo aprende a producir pares concepto–caja delimitadora (*bounding box*) que constituyen evidencia visual verificable, además de un razonamiento y una respuesta final. El sistema de recompensa incluye un control de imagen en negro para descontar respuestas que podrían obtenerse solo por sesgos del lenguaje, lo que fuerza a que la evidencia propuesta sea realmente informativa.

El modelo tiene 4.437.815.808 parámetros (aproximadamente 4,4 mil millones), se distribuye en formato safetensors BF16 con un tamaño de repositorio de 8,9 GB y está pensado para investigación y evaluación en dominios médicos donde la trazabilidad de la evidencia visual es relevante. Su licencia permisiva y su tamaño moderado lo hacen desplegable en infraestructura de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (familia Qwen3-VL, `qwen3_vl`) |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

MedVE-4B parte de Qwen3-VL-4B-Instruct, un transformer multimodal con torre de visión y modelo de lenguaje, y conserva la arquitectura del modelo base. El entrenamiento se articula en dos fases. En la primera, un *grounding* SFT enseña a la política una respuesta estructurada compuesta por una etiqueta de modalidad, un bloque `<vision>` con hasta seis elementos `<evidence>` (cada uno con un `<concept>` corto y un `<bbox>` con coordenadas enteras normalizadas a [0, 1000]), seguido de bloques `<think>` y `<answer>`.

En la segunda fase se aplica RL con el algoritmo FIPO, que combina ventajas normalizadas por grupo (estilo GRPO), filtrado de grupos al estilo DAPO, pérdida tipo PPO y pesos de influencia por token derivados de ratios de log-verosimilitud descontados. La recompensa se calcula con un *answerer* Qwen3-VL-4B congelado, ajustado durante una época sobre 18.155 ejemplos de *grounding* (mitad con imagen completa, mitad con vistas de solo evidencia). Este *answerer* recibe la pregunta, la vista recortada y una frase de coordenadas, pero no los conceptos ni el razonamiento de la política. Se añade un control de imagen negra de las mismas dimensiones: solo se otorga crédito a una región si la respuesta usando la región es correcta y la respuesta con imagen negra es incorrecta. La puntuación de respuestas combina reglas para coincidencias exactas y preguntas cerradas, un juez AnyJev basado en Qwen3-4B-Instruct-2507 y similitud coseno de MedEmbed-large, calibrados con un umbral fijo de 0,5. El RL usa 51.335 pares imagen–pregunta de MediX-R1 sin anotaciones de cajas, 200 pasos, learning rate 1e-6, 512 prompts por lote, cinco respuestas muestreadas por prompt, mini-batch de 128 y longitud máxima de respuesta de 2.048 tokens. La torre de visión es entrenable.

## Capacidades

- Respuesta visual a preguntas (VQA) en dominios médicos: radiología, patología, imágenes de preguntas clínicas y conjuntos tipo SLAKE, VQA-RAD, PathVQA y PMC-VQA.
- Localización visual (*visual grounding*): genera pares concepto–caja delimitadora como evidencia explícita, con coordenadas normalizadas a [0, 1000].
- Razonamiento estructurado: produce un bloque `<think>` antes de la respuesta final, permitiendo inspeccionar la cadena de razonamiento.
- Etiquetado de modalidad de imagen dentro de la respuesta estructurada.
- Generación de respuestas cerradas (sí/no, dos opciones) y abiertas.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`).
- Compatible con `transformers` y con *endpoints* de Hugging Face (`endpoints_compatible`).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documenta soporte explícito de *tool calling* ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Apoyo al diagnóstico radiológico con evidencia visual: el modelo puede responder a preguntas sobre una radiografía o tomografía y adjuntar las regiones concretas (cajas) en las que se basa, lo que permite a un radiólogo verificar la localización de la evidencia antes de aceptar la respuesta.
- Anotación asistida de datasets médicos: generar pares concepto–caja sobre imágenes de patología o radiología para preetiquetar corpus de investigación, con revisión humana posterior, aprovechando la salida estructurada `<evidence>`.
- Evaluación de sistemas VQA médicos: servir como modelo de referencia o *baseline* en paneles de evaluación tipo MedixEval, comparando precisión semántica y calidad de la evidencia aportada.
- Formación médica interactiva: responder preguntas de estudiantes sobre imágenes clínicas mostrando qué región de la imagen sustenta la respuesta, lo que facilita el aprendizaje visual.
- Triaje y priorización de estudios de imagen: en un pipeline de revisión, el modelo puede señalar regiones sospechosas y responder preguntas cerradas (por ejemplo, presencia o ausencia de un hallazgo) para priorizar casos que requieran lectura especializada.
- Investigación en *grounding* médico y RL con recompensas verificables: el modelo y su metodología (control de imagen negra, *answerer* congelado, FIPO) sirven como base reproducible para experimentos sobre evidencia visual y fidelidad de razonamiento.
- Moderación y control de calidad de informes: comprobar si una conclusión textual está respaldada por regiones concretas de la imagen asociada, detectando discrepancias entre informe e imagen.

## Benchmarks y rendimiento

Resultados de precisión (%) en el panel de cinco tareas MedixEval, con juez LLM Qwen3-14B y 11.630 preguntas por modelo y modo de prompt. Son puntuaciones semánticas de juez, no coincidencia exacta ni adjudicación clínica.

Modo de prompt `no`:

| Tarea | Preguntas | Qwen3-VL-4B-Instruct | MediX-R1-4B | MedVE-4B |
|---|---:|---:|---:|---:|
| SLAKE | 1.061 | 64,56 | 71,25 | **72,29** |
| VQA-RAD | 451 | 57,43 | 58,76 | **63,19** |
| PathVQA | 6.719 | 39,49 | 43,74 | **46,21** |
| PMC-VQA | 1.997 | 55,18 | **56,13** | 55,28 |
| PMC-VQA Hard | 1.402 | 31,03 | 30,17 | **31,53** |
| **Media macro** | 11.630 | 49,54 | 52,01 | **53,70** |

Modo de prompt `pv`:

| Tarea | Preguntas | Qwen3-VL-4B-Instruct | MediX-R1-4B | MedVE-4B |
|---|---:|---:|---:|---:|
| SLAKE | 1.061 | 42,88 | 53,53 | **73,14** |
| VQA-RAD | 451 | 30,16 | 40,80 | **62,08** |
| PathVQA | 6.719 | 22,56 | 28,43 | **48,67** |
| PMC-VQA | 1.997 | 42,76 | 46,07 | **46,62** |
| PMC-VQA Hard | 1.402 | 19,61 | 21,04 | **35,02** |
| **Media macro** | 11.630 | 31,60 | 37,97 | **53,11** |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9 GB solo para pesos (4,44 mil millones de parámetros × 2 bytes), más overhead de activaciones y del procesador de visión; en la práctica se recomienda al menos 16 GB para comodidad.
- Cuantización a 8 bits: aproximadamente 4,5 GB de pesos; a 4 bits: aproximadamente 2,3 GB de pesos, más overhead.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX A6000 para despliegue en BF16 con lotes grandes; RTX 4090 (24 GB) para BF16 con lotes moderados.
- Cabe en GPU de consumo: sí; en RTX 4090 en BF16 y en tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) con cuantización a 8 bits; en tarjetas de 8-12 GB con cuantización a 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), *endpoints* de Hugging Face; para GGUF/llama.cpp, Ollama o vLLM no se documenta soporte específico en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media macro (`no` / `pv`) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedVE-4B | 4,44 B | no disponible | 53,70 / 53,11 | Apache 2.0 | Hugging Face |
| Qwen3-VL-4B-Instruct (base) | ~4 B | no disponible | 49,54 / 31,60 | no disponible en la información | Hugging Face |
| MediX-R1-4B (Shayan0179/Medix-R1) | ~4 B | no disponible | 52,01 / 37,97 | no disponible en la información | Hugging Face |

MedVE-4B supera a ambos comparables en media macro en los dos modos de prompt, con una ventaja especialmente marcada en el modo `pv` (53,11 frente a 37,97 de MediX-R1-4B y 31,60 del base). En PMC-VQA con prompt `no`, MediX-R1-4B obtiene una puntuación ligeramente superior (56,13 frente a 55,28).

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Las puntuaciones de benchmark son evaluaciones semánticas de un juez LLM (Qwen3-14B), no coincidencia exacta ni adjudicación clínica; no deben interpretarse como validación clínica.
- El calibrador del sistema de recompensa se ajustó sobre 800 respuestas etiquetadas por un anotador LLM, no por clínicos; mide acuerdo con la referencia, no corrección clínica.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión-lenguaje, especialmente en dominios médicos donde una respuesta incorrecta puede tener consecuencias graves.
- Las cajas de evidencia pueden ser plausibles sin ser causalmente necesarias para la respuesta; el propio método de entrenamiento aborda este problema, pero no lo elimina por completo.
- No apto para uso clínico directo sin supervisión de profesionales sanitarios y validación adicional.
- La longitud de contexto no se documenta, lo que dificulta planificar despliegues con conversaciones o imágenes múltiples de gran extensión.
- El repositorio no registra descargas ni *likes* en el momento de la consulta y fue creado recientemente, por lo que la validación por parte de la comunidad es aún escasa.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad regulatoria del dominio médico (por ejemplo, marcado CE o equivalentes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erow/MedVE-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Checkpoint MediX-R1-4B: https://huggingface.co/Shayan0179/Medix-R1
- Juez AnyJev: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codificador de similitud: https://huggingface.co/abhinand/MedEmbed-large-v0.1
