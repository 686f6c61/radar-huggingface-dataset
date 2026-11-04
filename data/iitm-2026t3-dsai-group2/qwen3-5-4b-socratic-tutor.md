# IITM-2026T3-DSAI-GROUP2/qwen3.5-4b-socratic-tutor

## Resumen

El modelo `qwen3.5-4b-socratic-tutor` es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el grupo IITM-2026T3-DSAI-GROUP2 en el marco del proyecto de laboratorio del BS Degree in Data Science & Applications del IIT Madras. Su propósito es transformar un modelo generativo generalista en un tutor socrático especializado en materias STEM (matemáticas y ciencias), que guía al estudiante mediante preguntas dirigidas en lugar de proporcionar la solución directamente.

El adaptador se entrena sobre 1.995 diálogos multi-turno derivados de los conjuntos SocraTeach y MathDial, y ajusta únicamente las proyecciones de atención y de la MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) con rango r=16 y alpha=16, lo que supone aproximadamente 21,2 millones de parámetros entrenables. El resultado es un adaptador de 0,3 GB que debe combinarse con el modelo base para su uso.

La relevancia del modelo reside en su enfoque específico: la model card reporta una tasa de filtración de soluciones del 0,0 % en el conjunto de evaluación (frente al 1,0 % del baseline y de los tutores humanos), una adherencia a la formulación de preguntas del 59 % (76 % en el subconjunto SocraTeach) y una longitud media de respuesta de 20,25 palabras, próxima a las 22,16 palabras de los tutores humanos. Se trata de un artefacto académico con cero descargas y sin licencia declarada, orientado a investigación educativa más que a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen 3.5-4B) |
| Parámetros totales | ~21,2 M parámetros entrenables en el adaptador (el modelo base no se especifica en la información disponible) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-4B, no declarada) |
| Tipos de cuantización | no disponible (la evaluación del baseline se realizó en 4 bits, pero no se documentan artefactos cuantizados del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` |
| Módulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Rango LoRA / alpha / dropout | 16 / 16 / 0,05 |
| Tamaño del repositorio | 0,3 GB |
| Librería | peft (compatible con transformers) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B, un transformer decoder-only del que la información proporcionada no detalla la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto). La intervención consiste en un ajuste LoRA de rango 16 y alpha 16 con dropout 0,05 sobre las siete proyecciones lineales principales de cada bloque (atención y MLP), lo que permite modificar el comportamiento conversacional del modelo sin reentrenar los pesos base.

El entrenamiento se realizó durante 1 época sobre 1.995 diálogos multi-turno extraídos de `candidate_train.jsonl.gz` del Socratic Tutoring Dataset, que combina SocraTeach y MathDial. Los hiperparámetros declarados son learning rate 2e-4, batch size 1 con acumulación de gradientes de 8 pasos (batch efectivo 8), warmup ratio 0,05 y un tiempo total de entrenamiento de aproximadamente 79,9 minutos en GPU. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado, ni el número total de tokens de entrenamiento procesados.

## Capacidades

- Generación de texto conversacional orientada a tutoría socrática en matemáticas y ciencias.
- Formulación de preguntas dirigidas para sondear la comprensión del estudiante antes de avanzar.
- Prevención de filtración de soluciones: según la model card, 0,0 % de tasa de leak en el conjunto de evaluación de 100 contextos.
- Respuestas concisas: media de 20,25 palabras por turno, alineada con el estilo de tutores humanos (22,16 palabras).
- Andamiaje paso a paso a través de misconceptions del estudiante (scaffolding progresivo).
- Soporte multi-turno: el adaptador se entrena sobre diálogos, por lo que mantiene el estado conversacional dentro de la ventana de contexto del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponibles; el dataset de entrenamiento (SocraTeach + MathDial) es presumiblemente en inglés, pero no se declara.

## Casos de uso

- Tutoría de matemáticas de secundaria: el modelo recibe el enunciado de un problema y la respuesta del estudiante, y responde con una pregunta que le ayuda a identificar el siguiente paso sin revelar la solución, aprovechando su tasa de filtración del 0 % medida en evaluación.
- Asistente de refuerzo en ciencias: ante una explicación errónea de un concepto (por ejemplo, confusión entre masa y peso), el adaptador formula preguntas de contraste que llevan al estudiante a revisar su razonamiento.
- Evaluación formativa automatizada: integrado en una plataforma de ejercicios, el modelo genera feedback interrogativo turno a turno en lugar de correcciones directas, lo que permite medir la progresión del estudiante a lo largo de la sesión.
- Simulación de tutor para formación de docentes: los educadores pueden practicar técnicas socráticas interactuando con el modelo, que reproduce un estilo de respuesta breve y centrado en preguntas.
- Investigación en diálogo educativo: el adaptador y los artefactos del repositorio (`eval_contexts.csv`, `generations_final.csv`, `grid_search/`) sirven como baseline reproducible para experimentos sobre prevención de leak y adherencia a preguntas.
- Generación de datos sintéticos de tutoría: las respuestas cortas y centradas en preguntas pueden emplearse para aumentar corpus de diálogos educativos, con revisión humana posterior por el riesgo de alucinación.
- Despliegue ligero en entornos con recursos limitados: al ser un adaptador de 0,3 GB sobre un modelo de 4B, puede servirse en una única GPU consumer combinando el base en cuantización de 4 bits con el adaptador en bfloat16, como en el ejemplo de uso de la model card.

## Benchmarks y rendimiento

Evaluación sobre 100 contextos de test divididos entre SocraTeach y MathDial, según la model card:

| Métrica | Baseline (Qwen 3.5 4-bit) | LoRA ajustado | Tutores humanos |
|---|---|---|---|
| Tasa de filtración de solución (%) | 1,0 % | 0,0 % | 1,0 % |
| Adherencia a preguntas (%) | 52,0 % | 59,0 % (SocraTeach: 76 %) | 62,0 % |
| Longitud media (palabras) | 56,4 | 20,25 | 22,16 |
| ROUGE-L | 0,1900 | 0,3312 | 1,0000 |
| BLEU | 0,0401 | 0,1761 | 1,0000 |
| Validation loss | 1,8238 | 1,0720 | - |

No se han publicado resultados en benchmarks estándar de razonamiento o código (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el modelo base de 4B en bfloat16 requiere del orden de 8-9 GB solo para pesos, más caché KV y activaciones; en cuantización de 4 bits se reduce a unos 2,5-3 GB, a los que se suman los ~21,2 M parámetros del adaptador (despreciables en comparación).
- GPU recomendadas: no declaradas. El entrenamiento se completó en ~79,9 minutos en una GPU no especificada; para inferencia, una RTX 4090 (24 GB) o superior permite ejecutar el base en bfloat16 con holgura, y una RTX 3060/4060 Ti (12-16 GB) es suficiente con cuantización de 4 bits.
- Cabe en GPU consumer: sí, con el modelo base cuantizado a 4 bits, tal como se empleó en la evaluación del baseline.
- Opciones de despliegue: transformers + peft (flujo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información disponible, y su compatibilidad requeriría fusionar el adaptador con el base y convertir los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-socratic-tutor (este) | ~21,2 M (adaptador LoRA) sobre base 4B | no disponible | Tutoría socrática STEM | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B (no confirmado en la información) | no disponible | Generación generalista | no disponible | HuggingFace |
| Alternativas de tutoría socrática de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de tutoría socrática en los datos proporcionados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre SocraTeach y MathDial, puede heredar sesgos de estilo, nivel educativo y distribución de problemas de esos corpus.
- Riesgo de alucinación: presente como en cualquier modelo generativo; aunque la tasa de filtración de soluciones medida es del 0 %, un fallo en la formulación de preguntas puede llevar al estudiante a conclusiones incorrectas, por lo que se recomienda supervisión humana en contextos reales.
- Limitaciones de contexto e idioma: no se declara la longitud de contexto efectiva ni los idiomas soportados; el adaptador se entrena sobre diálogos presumiblemente en inglés y su comportamiento fuera de ese idioma no está evaluado.
- Adherencia a preguntas limitada: 59 % global (76 % en SocraTeach), por debajo del 62 % de los tutores humanos; en MathDial el rendimiento es notablemente inferior.
- Restricciones de licencia: la licencia no está declarada, lo que impide asumir uso comercial; además, el uso queda sujeto a la licencia del modelo base Qwen/Qwen3.5-4B, que debe verificarse por separado.
- Naturaleza académica: repositorio con 0 descargas y 0 likes, creado en noviembre de 2026; no hay evidencia de validación externa ni de mantenimiento.
- Evaluación limitada: 100 contextos de test y métricas automáticas (ROUGE-L, BLEU, tasa de leak) que no sustituyen una evaluación pedagógica con estudiantes reales.
- Requiere el modelo base: el adaptador no es autónomo; debe cargarse junto con Qwen/Qwen3.5-4B mediante PEFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IITM-2026T3-DSAI-GROUP2/qwen3.5-4b-socratic-tutor
- Dataset de tutoría socrática: https://huggingface.co/datasets/IITM-2026T3-DSAI-GROUP2/socratic-tutoring-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Papers, blogs, repositorios y demos adicionales: no disponibles en la información proporcionada.
