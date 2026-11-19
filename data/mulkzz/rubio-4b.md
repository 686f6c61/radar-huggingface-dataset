# mulkzz/Rubio-4B

## Resumen

RuBio-4B es un ajuste fino supervisado (LoRA fusionado en pesos bf16) del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario mulkzz. Su propósito es muy concreto: evaluar respuestas de estudiantes a preguntas de desarrollo de la asignatura de Biología de secundaria (currículo coreano de 2022, unidades I-III) y emitir un objeto JSON con diagnóstico por criterio de evaluación, información para el profesor y retroalimentación para el alumno. No es un modelo de propósito general, sino una herramienta vertical de corrección automática.

El modelo tiene 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) en formato safetensors bf16, con un tamaño de repositorio de 18,7 GB. Está entrenado únicamente para coreano y se distribuye bajo licencia Apache 2.0. El autor mantiene una familia de modelos relacionados (RuBio-8B, RuBio-9B y RuBio-27B) y un servicio de demostración en mulk.codes/rubio.

Su relevancia actual radica en que demuestra que un modelo de 4B, con un ajuste fino bien dirigido, puede superar de forma estadísticamente significativa a su modelo base en una tarea de evaluación educativa especializada, con un formato de salida JSON estricto y sin errores de parseo en el conjunto de evaluación publicado (200 respuestas, 604 criterios).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B; detalles internos de la arquitectura base no disponibles) |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,66 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA y posteriormente se fusionaron los pesos en un checkpoint completo de 16 bits (bf16). No se documentan en la información disponible ni la composición exacta del dataset de entrenamiento, ni el número de tokens utilizados, ni si hubo fases de RLHF o DPO; el pipeline declarado es de ajuste supervisado con LoRA.

El elemento técnico más destacable es el diseño de la tarea y del formato de salida: el modelo recibe un `SYSTEM_PROMPT` fijo (el mismo usado en entrenamiento) y debe producir un único objeto JSON con diagnóstico por criterio, estado de la respuesta y retroalimentación. La evaluación publicada se realizó en condiciones controladas (primer turno, `temperature=0`, modo *thinking* desactivado y sin forzado de esquema JSON), lo que indica que el modelo aprende el formato de salida de forma nativa en lugar de depender de validadores externos. El autor menciona además un conjunto de reentrenamiento denominado RuIso-v6 aplicado al modelo de 27B, pero no se detalla su uso en el 4B.

## Capacidades

- Evaluación de respuestas abiertas de Biología de secundaria (unidades I-III del currículo coreano de 2022) contra rúbricas o criterios de evaluación definidos.
- Emisión de un objeto JSON único que combina diagnóstico por criterio para el profesor y retroalimentación para el estudiante.
- Clasificación del estado global de la respuesta (`answer_status`) conforme a reglas predefinidas.
- Detección e identificación de conceptos erróneos (misconceptions) con identificadores concretos.
- Detección de errores científicos fuera de los criterios evaluados (`other_issues`), con menor sensibilidad que modelos mayores.
- Generación de texto conversacional en coreano dentro del dominio educativo.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso general, visión, audio ni modo *thinking* explícito.

## Casos de uso

- Corrección automática de exámenes de desarrollo en centros de secundaria: el modelo recibe la respuesta del alumno y la rúbrica, y devuelve un JSON con la valoración criterio a criterio, reduciendo el tiempo de corrección del profesorado en asignaturas de Biología.
- Generación de retroalimentación formativa para el alumnado: a partir del mismo JSON, un LMS puede mostrar al estudiante comentarios específicos sobre qué concepto ha fallado y por qué, sin intervención docente.
- Detección temprana de conceptos erróneos en el aula: los identificadores de *misconceptions* permiten agregar estadísticas por clase y detectar patrones (por ejemplo, confusión recurrente entre mitosis y meiosis) para ajustar la docencia.
- Integración en plataformas de práctica adaptativa: el modelo puede puntuar respuestas abiertas en tiempo real y alimentar un motor de recomendación de ejercicios según los criterios fallados.
- Evaluación a escala en pruebas piloto o investigaciones educativas: con 4,66 B de parámetros y salida JSON estable, permite procesar lotes grandes de respuestas en infraestructura modesta frente a alternativas propietarias.
- Asistencia a la redacción de rúbricas: el modelo puede usarse como evaluador de referencia para validar que una rúbrica nueva discrimina correctamente entre respuestas correctas, parciales e incorrectas.
- Despliegue en entornos con requisitos de soberanía de datos: al ser Apache 2.0 y ejecutable en GPU de consumo, puede alojarse en servidores del propio centro educativo sin enviar respuestas de menores a servicios externos.

## Benchmarks y rendimiento

Los datos provienen de RuBench v1 (partición dev out-of-distribution, n = 200 respuestas, 604 criterios de evaluación), comparando RuBio-4B v2 (`mulkzz/RuBio-4B@ba9e00c8`) con su modelo base y otros sistemas.

| Metrica | RuBio-4B v2 | Qwen3.5-4B (base) | RuBio-27B | Qwen3.8-27B (base) | GPT-6 Astra (xhigh) | Claude Opus 5.5 (xhigh) | Gemini 4 Argon (High) |
|---|---|---|---|---|---|---|---|
| Precisión de criterio (global) | 77,2% [73,4; 80,9] | 70,9% [67,3; 74,5] | 86,9% [83,8; 89,9] | 81,8% [78,2; 85,4] | 91,2% [88,6; 93,7] | 94,2% [92,0; 96,4] | 91,2% [88,5; 94,0] |
| Precisión sin voto 2/3 | 79,9% [76,0; 83,8] | 74,5% [71,0; 78,1] | 90,0% [87,1; 92,9] | 85,0% [81,4; 88,5] | 95,6% [93,6; 97,5] | 96,1% [94,2; 98,0] | 93,6% [91,0; 96,2] |
| Micro precisión de criterio | 467/604 = 77,3% | 427/604 = 70,7% | 524/604 = 86,9%* | 495/604 = 81,8%* | 550/604 = 91,1%* | 570/604 = 94,4%* | 551/604 = 91,2%* |
| Coincidencia de misconception id | 106/133 = 79,7% | 78/133 = 58,6% | 118/133 = 88,7% | 107/133 = 80,5% | 129/133 = 97,0% | 127/133 = 95,5% | 122/133 = 91,7% |
| Recall de errores fuera de criterio (TP) | 10/53 = 18,9% | 4/53 = 7,5% | 46/53 = 86,8% | 29/53 = 54,7% | 33/53 = 62,3% | 52/53 = 98,1% | 45/53 = 84,9% |
| Especificidad sin errores (TN) | 143/147 = 97,3% | 146/147 = 99,3% | 127/147 = 86,4% | 127/147 = 86,4% | 144/147 = 98,0% | 143/147 = 97,3% | 145/147 = 98,6% |
| Coincidencia de `answer_status` | 124/200 = 62,0% | 89/200 = 44,5% | 154/200 = 77,0% | 120/200 = 60,0% | 176/200 = 88,0% | 184/200 = 92,0% | 179/200 = 89,5% |
| JSON válido | 200/200 = 100% | 200/200 = 100% | 200/200 = 100% | 195/200 = 97,5% | 200/200 = 100% | 200/200 = 100% | 198/200 = 99,0% |

\* Los valores micro se han convertido a porcentaje a partir de los recuentos publicados (524/604, 495/604, 550/604, 570/604, 551/604); la tabla original los presenta como recuentos.

Diferencias pareadas clave (respuesta a respuesta, IC 95%):

| Comparacion | Diferencia global | Diferencia sin voto 2/3 |
|---|---|---|
| RuBio-4B v2 − Qwen3.5-4B | +6,3 pp [+2,6; +9,9] | +5,3 pp [+1,2; +9,5] |
| RuBio-27B − Qwen3.8-27B | +5,1 pp [+1,1; +9,1] | +5,0 pp [+1,1; +9,0] |
| RuBio-27B − RuBio-4B | +9,7 pp [+6,1; +13,3] | +10,1 pp [+6,5; +13,7] |
| GPT-6 Astra − RuBio-27B | +4,3 pp [+1,1; +7,5] | +5,6 pp [+2,4; +8,7] |
| Claude Opus 5.5 − RuBio-27B | +7,3 pp [+4,2; +10,5] | +6,1 pp [+3,1; +9,1] |
| Claude Opus 5.5 − GPT-6 Astra | +3,0 pp [+0,4; +5,6] | +0,5 pp [−1,5; +2,5] (no significativo) |

Condiciones de evaluación: primer turno, `temperature=0`, modo *thinking* desactivado y sin forzado de esquema JSON (un JSON roto cuenta como error). RuBio-4B v2 recibió únicamente el `SYSTEM_PROMPT` de entrenamiento; el modelo base recibió el `SYSTEM_PROMPT` más una política de decisión y respuesta (`POLICY`). El modelo base se sirvió en RunPod Serverless con `runpod/worker-v1-vllm v2.30.1` (vLLM 0.32.0) en bf16.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 9,3 GB solo para pesos (4,66 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 11 y 14 GB según longitud de contexto y lote.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5 GB de pesos; en 4 bits, aproximadamente 2,5-3 GB de pesos. No se publican checkpoints cuantizados oficiales, por lo que habría que generarlos.
- GPU recomendadas para producción: A100 40/80 GB, H100, L40S o A10G para despliegues con concurrencia; el modelo es pequeño para estos aceleradores y permite lotes grandes.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16 sin problemas; en RTX 4080/4070 Ti Super (16 GB) en bf16 con contexto moderado; en GPUs de 8-12 GB requiere cuantización.
- Opciones de despliegue: vLLM (usado por el autor en la evaluación, versión 0.32.0), TGI, y previsiblemente llama.cpp/Ollama si se generan pesos GGUF, aunque no se documentan en el repositorio.
- Latencia y throughput: no disponibles. Al ser un modelo de 4,66 B con salida JSON estructurada, se espera una latencia por debajo del segundo en A100/H100 para respuestas de pocos cientos de tokens, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión de criterio (RuBench v1 dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RuBio-4B v2 | ~4,66 B | no disponible | 77,2% | Apache 2.0 | Hugging Face (mulkzz/RuBio-4B) |
| Qwen3.5-4B (base) | ~4,66 B | no disponible | 70,9% | no disponible en la información | Hugging Face (Qwen/Qwen3.5-4B) |
| RuBio-8B | no disponible | no disponible | no disponible | no disponible | Hugging Face (mulkzz/RuBio-8B) |
| RuBio-9B | no disponible | no disponible | no disponible | no disponible | Hugging Face (mulkzz/RuBio-9B) |
| RuBio-27B | no disponible | no disponible | 86,9% | no disponible | Hugging Face (mulkzz/RuBio-27B) |
| GPT-6 Astra (xhigh) | no disponible | no disponible | 91,2% | propietaria | API |
| Claude Opus 5.5 (xhigh) | no disponible | no disponible | 94,2% | propietaria | API |

La comparación relevante es doble: frente a su modelo base, RuBio-4B gana +6,3 pp de precisión de criterio con significación estadística; frente a los modelos frontera propietarios, queda entre 14 y 17 pp por debajo, pero a un coste de inferencia y con requisitos de hardware muy inferiores. Dentro de la propia familia RuBio, el salto al modelo de 27B aporta +9,7 pp adicionales.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo cubre Biología de secundaria del currículo coreano de 2022 (unidades I-III) y solo en coreano. Fuera de ese ámbito su comportamiento no está caracterizado.
- Sensibilidad baja a errores científicos fuera de los criterios evaluados: recall de solo 18,9% (10/53) en `other_issues`, aunque con especificidad alta (97,3%). El modelo tiende a no señalar errores no previstos en la rúbrica.
- Coincidencia de `answer_status` limitada: 62,0% frente al 44,5% del base, pero muy por debajo del 77,0% del modelo de 27B y del 88-92% de los modelos frontera.
- Riesgo de alucinación en la retroalimentación generada: aunque el formato JSON es estable (100% válido en la evaluación), el contenido de los comentarios y de los identificadores de conceptos erróneos puede ser incorrecto, especialmente en respuestas ambiguas o fuera de distribución.
- Sesgos no documentados: no se publica información sobre la distribución demográfica, lingüística o socioeconómica de los datos de entrenamiento ni sobre evaluaciones de sesgo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que conviene verificar antes de un despliegue comercial.
- Contexto máximo no documentado: la ficha no indica la longitud de contexto soportada, lo que impide planificar con seguridad entradas con rúbricas y respuestas muy largas.
- Ausencia de datos de entrenamiento y de evaluación en otros idiomas: no hay evidencia de que el modelo mantenga capacidades multilingües del base tras el ajuste fino.
- Uso en producción educativa: al tratarse de una herramienta que evalúa a menores, conviene mantener supervisión humana y no usar las salidas como calificación definitiva sin revisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulkzz/Rubio-4B
- README en inglés: https://huggingface.co/mulkzz/RuBio-4B/blob/main/README_en.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo superior (27B): https://huggingface.co/mulkzz/RuBio-27B
- Modelos relacionados: https://huggingface.co/mulkzz/RuBio-8B y https://huggingface.co/mulkzz/RuBio-9B
- Servicio de demostración: https://mulk.codes/rubio
- Paper referenciado en los tags (arXiv:2411.00640): https://arxiv.org/abs/2411.00640
- Repositorio de vLLM (usado en la evaluación): https://github.com/vllm-project/vllm
