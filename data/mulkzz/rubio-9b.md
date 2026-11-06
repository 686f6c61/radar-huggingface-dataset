# mulkzz/RuBio-9B

## Resumen

RuBio-9B es un modelo de lenguaje de 9.653.104.368 parámetros (aproximadamente 9,65 mil millones) desarrollado por el usuario mulkzz, obtenido mediante un ajuste fino con LoRA sobre el modelo base Qwen/Qwen3.5-9B y posterior fusión de los pesos del adaptador en un checkpoint completo en bf16. Su propósito es muy específico: evaluar respuestas de estudiantes a preguntas de desarrollo (ensayo corto) del currículo surcoreano de Biología de secundaria (revisión 2022, unidades I-III), emitiendo un único objeto JSON que contiene tanto información diagnóstica para el profesor como retroalimentación para el alumno, organizada por criterios de evaluación.

El modelo se sitúa como una pieza intermedia dentro de una familia de tres tamaños: el ligero RuBio-4B (con su variante v2) y el superior RuBio-27B. Comparte con ellos el formato de salida y el `system` prompt, pero introduce una diferencia en el entrenamiento: una ponderación de pérdida sobre los tokens de decisión (`status` y `misconception_id`), que representan el 2,62 % de los tokens de entrenamiento y se cuentan diez veces en la función de pérdida (W=10). Según el autor, RuBio-9B no está desplegado en el servicio piloto, que solo opera con las variantes de 4B y 27B.

La relevancia del modelo radica en su especialización vertical: no es un modelo de propósito general, sino un evaluador de respuestas abiertas de biología con salida estructurada y trazabilidad por criterio. Está publicado bajo licencia Apache 2.0, con pesos en safetensors, y declara únicamente el coreano como idioma soportado. Su utilidad práctica depende de disponer de un conjunto de criterios de evaluación definidos y de integrar la salida JSON en un flujo docente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5-9B (no se detalla la variante interna en la información disponible) |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos publicados en bf16 (16 bits); no se documentan cuantizaciones GGUF/AWQ/GPTQ oficiales |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 archivos, ~19,3 GB / 18 GiB) |

## Arquitectura y entrenamiento

RuBio-9B parte del modelo Qwen/Qwen3.5-9B y se entrena mediante LoRA, cuyos pesos se fusionan después en un checkpoint completo de 16 bits (bf16). El resultado son cuatro archivos safetensors con un total aproximado de 19,3 GB (18 GiB), con commit de pesos `e19404e3` y md5 del adaptador `57c5c739c28c1d60bf66f75d54d77822`. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron etapas de RLHF o DPO; únicamente se indica que la tarea es la evaluación de respuestas de desarrollo de las unidades I-III de Biología de secundaria (revisión 2022) y que la salida es un objeto JSON con diagnóstico por criterio.

La innovación técnica declarada es la ponderación de la pérdida en los tokens de decisión: los valores de `status` y `misconception_id` constituyen el 2,62 % de los tokens de entrenamiento y se cuentan diez veces en la función de pérdida (W=10). El resto del entrenamiento sigue el mismo formato de salida y `system` prompt que RuBio-4B v2 y RuBio-27B. No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas SSM; la información disponible no permite confirmar ni descartar innovaciones adicionales en la arquitectura base.

## Capacidades

- Evaluación de respuestas abiertas de Biología de secundaria (unidades I-III, currículo surcoreano de 2022) contra criterios de evaluación predefinidos.
- Emisión de un único objeto JSON con diagnóstico por criterio: estado (`status`), identificación de conceptos erróneos (`misconception_id`) e información separada para profesor y alumno.
- Detección de errores científicos fuera de los criterios (`other_issues`), con métricas de reproducibilidad y especificidad reportadas en la model card.
- Salida estructurada JSON con cero errores de formato reportados en la evaluación (0/200 en RuBench v1 dev).
- Soporte de `system` prompt específico del dominio (SYSTEM_PROMPT propio del modelo).
- Capacidad multilingüe limitada al coreano según la etiqueta de idioma declarada.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking) en la información disponible; de hecho, la evaluación se realizó con `thinking` desactivado.

## Casos de uso

- Corrección asistida de exámenes de desarrollo en secundaria: el modelo recibe la respuesta del alumno y los criterios de evaluación, y devuelve un JSON con el estado de cada criterio, lo que permite al profesor revisar y validar la calificación sin reescribirla desde cero.
- Generación de retroalimentación individualizada para el alumno: a partir del mismo JSON, el campo de feedback al estudiante puede mostrarse directamente en una plataforma educativa, explicando qué criterios se cumplieron y cuáles no.
- Detección de conceptos erróneos recurrentes en el aula: al agregar los `misconception_id` de un lote de respuestas, el profesorado puede identificar qué ideas alternativas son más frecuentes y ajustar la enseñanza; el modelo reporta una coincidencia de conceptos erróneos del 82,7 % (110/133) en RuBench v1 dev.
- Construcción de un banco de evaluación formativa: integrado en un pipeline que procese respuestas de forma masiva, el modelo permite puntuar automáticamente cientos de respuestas y priorizar la revisión humana en los casos de baja confianza.
- Investigación en evaluación automática de respuestas abiertas: el modelo sirve como línea base especializada frente a modelos de propósito general, con métricas publicadas por criterio y por fuente de verdad (R1 3/3, R2 3/3, R2 2/3) que facilitan la comparación reproducible.
- Despliegue en infraestructura docente con vLLM: la model card documenta evaluación en vLLM 0.32.0 sobre una GPU A40 de 46 GB en bf16, lo que indica un camino de despliegue probado para entornos con GPU de 40-48 GB.
- Prototipado de asistentes de estudio de Biología: aunque el modelo está orientado a la evaluación, su salida diagnóstica puede alimentar un tutor que explique los errores detectados, siempre con supervisión docente.

## Benchmarks y rendimiento

Los datos disponibles provienen de RuBench v1 (partición dev out-of-distribution, n = 200 respuestas, 604 criterios de evaluación), evaluados en RunPod A40 (46 GB), vLLM 0.32.0, bf16, primer turno, `temperature=0`, `max_tokens=1024`, `thinking` desactivado y sin forzar esquema JSON (el JSON roto se cuenta como error).

| Métrica | RuBio-9B | Qwen3.5-9B (base) |
|---|---|---|
| Exactitud de decisión por criterio (principal) | 80,7 % [77,2; 84,2] | 76,6 % [73,0; 80,2] |
| Exactitud por criterio, excluyendo 2/3 por mayoría | 83,4 % [79,8; 86,9] | 81,4 % [77,9; 84,8] |
| Exactitud micro por criterio | 487/604 = 80,6 % | 463/604 = 76,7 % |
| Coincidencia de conceptos erróneos | 110/133 = 82,7 % | 86/133 = 64,7 % |
| Coincidencia de errores fuera de criterio | 152/200 = 76,0 % | 153/200 = 76,5 % |
| Coincidencia de estado global | 131/200 = 65,5 % | 96/200 = 48,0 % |
| Errores de JSON | 0/200 | 0/200 |
| Reproducibilidad de errores científicos (`other_issues`, TP) | 17/53 = 32,1 % | 7/53 = 13,2 % |
| Especificidad sin errores (`other_issues`, TN) | 135/147 = 91,8 % (12 falsos positivos) | 146/147 = 99,3 % (1 falso positivo) |

Comparación con otros modelos de la familia y de propósito general en la misma partición dev (n = 200, 604 criterios):

| Modelo | Exactitud principal | Excluyendo 2/3 | Micro |
|---|---|---|---|
| RuBio-4B v2 | 77,2 % [73,4; 80,9] | 79,9 % [76,0; 83,8] | 467/604 |
| Qwen3.5-4B | 70,9 % [67,3; 74,5] | 74,5 % [71,0; 78,1] | 427/604 |
| RuBio-9B | 80,7 % [77,2; 84,2] | 83,4 % [79,8; 86,9] | 487/604 |
| Qwen3.5-9B | 76,6 % [73,0; 80,2] | 81,4 % [77,9; 84,8] | 463/604 |
| RuBio-27B | 84,5 % [81,1; 87,8] | 88,4 % [85,2; 91,6] | 508/604 |
| Qwen3.8-27B | 81,8 % [78,2; 85,4] | 85,0 % [81,4; 88,5] | 495/604 |
| GPT-6 Astra (xhigh) | 91,2 % [88,6; 93,7] | 95,6 % [93,6; 97,5] | 550/604 |
| Claude Opus 5.5 (xhigh) | 94,2 % [92,0; 96,4] | 96,1 % [94,2; 98,0] | 570/604 |
| Gemini 4 Argon (High) | 91,2 % [88,5; 94,0] | 93,6 % [91,0; 96,2] | 551/604 |

Diferencias pareadas relevantes: RuBio-9B frente a Qwen3.5-9B, +4,1 puntos porcentuales [+0,3; +7,9] en la métrica principal (mejora con límite inferior cercano a cero) y +2,0 pp [-2,2; +6,2] al excluir 2/3 (sin diferencia significativa). RuBio-9B frente a RuBio-4B, +3,5 pp [+0,8; +6,3] (mejora). RuBio-27B frente a RuBio-9B, +3,8 pp [+0,5; +7,0] (mejora). GPT-6 Astra frente a RuBio-9B, +10,5 pp [+6,9; +14,0] (mejora del modelo general). Claude Opus 5.5 frente a RuBio-9B, +13,5 pp [+10,2; +16,8] (mejora del modelo general). El autor advierte que la puntuación de RuBio-9B es ligeramente optimista por haberse seleccionado el mejor de tres candidatos, y que el candidato con pérdida estándar (r16) no difiere del modelo base. La exactitud en la partición dev antigua, dentro de la distribución de entrenamiento (300 casos), era del 97,2 %.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere una GPU de 40 GB o superior para secuencias largas. La model card documenta ejecución en una A40 de 46 GB.
- GPU recomendadas: A40 (46 GB), A100 (40/80 GB), H100 (80 GB) para despliegue en bf16 sin cuantizar. En GPUs de consumo de 24 GB (RTX 3090/4090) no cabe en bf16 sin cuantización, y no se documentan cuantizaciones oficiales.
- GPU de consumo: no es viable en bf16 en tarjetas de 8-16 GB; en 24 GB requeriría cuantización a 8 bits o inferior, no publicada por el autor.
- Opciones de despliegue: vLLM (versión 0.32.0 usada en la evaluación), con soporte declarado en las etiquetas del repositorio. No se documentan integraciones oficiales con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La evaluación se realizó con `max_tokens=1024` y `temperature=0`, pero no se reportan tiempos por petición ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud principal (RuBench v1 dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RuBio-9B | 9,65 B | No disponible | 80,7 % [77,2; 84,2] | Apache 2.0 | Hugging Face (mulkzz/RuBio-9B) |
| RuBio-4B v2 | No disponible en la información | No disponible | 77,2 % [73,4; 80,9] | No disponible en la información | Hugging Face (mulkzz/RuBio-4B) |
| RuBio-27B | No disponible en la información | No disponible | 84,5 % [81,1; 87,8] | No disponible en la información | Hugging Face (mulkzz/RuBio-27B) |
| Qwen3.5-9B (base) | 9 B (aproximado) | No disponible | 76,6 % [73,0; 80,2] | No disponible en la información | Hugging Face (Qwen/Qwen3.5-9B) |
| GPT-6 Astra (xhigh) | No disponible | No disponible | 91,2 % [88,6; 93,7] | Propietaria | API |
| Claude Opus 5.5 (xhigh) | No disponible | No disponible | 94,2 % [92,0; 96,4] | Propietaria | API |

La comparación se limita a la tarea específica de RuBench v1; no se dispone de resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para RuBio-9B ni para sus alternativas en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está entrenado para evaluar respuestas de Biología de secundaria (unidades I-III, currículo surcoreano de 2022); su uso fuera de ese ámbito no está validado.
- Idioma: solo se declara coreano; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Mejora modesta y frágil frente al modelo base: la diferencia principal es +4,1 pp con límite inferior de +0,3 pp, y desaparece (+2,0 pp, IC que incluye cero) al excluir los casos 2/3 por mayoría; el autor reconoce que la puntuación es ligeramente optimista por selección del mejor de tres candidatos.
- Menor especificidad en la detección de errores científicos fuera de criterio: 12 falsos positivos frente a 1 del modelo base, con una especificidad del 91,8 % frente al 99,3 % del base.
- Riesgo de alucinación en la identificación de conceptos erróneos y en la evaluación de criterios no cubiertos por el entrenamiento; la coincidencia de estado global es del 65,5 %, lo que implica un margen considerable de desacuerdo.
- Dependencia de un `system` prompt y un formato de salida específicos; la evaluación se hizo sin forzar esquema JSON, y aunque no se observaron JSON rotos, no se garantiza en otros prompts.
- No está desplegado en el servicio piloto del autor, lo que sugiere que no se considera listo para producción en ese contexto.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías, sesgos específicos ni evaluaciones de seguridad; el uso en calificación real debería mantener supervisión humana.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulkzz/RuBio-9B
- Versión en inglés de la model card: https://huggingface.co/mulkzz/RuBio-9B/blob/main/README_en.md
- Modelo ligero RuBio-4B: https://huggingface.co/mulkzz/RuBio-4B
- Modelo superior RuBio-27B: https://huggingface.co/mulkzz/RuBio-27B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Servicio piloto (solo 4B y 27B): https://mulk.codes/rubio
- Referencia arXiv citada en las etiquetas: arxiv:2411.00640
