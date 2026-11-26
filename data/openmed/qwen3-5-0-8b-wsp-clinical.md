# OpenMed/Qwen3.5-0.8B-WSP-Clinical

## Resumen

OpenMed/Qwen3.5-0.8B-WSP-Clinical es un derivado del modelo Qwen3.5-0.8B de Alibaba, publicado por OpenMed, un proyecto centrado en modelos y herramientas de código abierto para texto clínico y biomédico que se ejecutan en hardware propio. La particularidad de este checkpoint es su metodo de construccion: no se ha entrenado ni ajustado con descenso de gradiente, sino que se ha aplicado una edicion directa de pesos ("weight-space programming", segun el trabajo de Takehi, Teoh, Zhang y Khattab del MIT CSAIL) sobre una unica direccion de la proyeccion de salida de atencion (`o_proj`) de la capa 23, la ultima del modelo. El objetivo es que el modelo responda preguntas de examen medico en el formato que se le pide, algo que el modelo base no hace de forma fiable.

El modelo conserva la arquitectura multimodal image-text-to-text de Qwen3.5-0.8B, con unos 873 millones de parametros (0,87 B) y pesos en safetensors. Su interes no reside tanto en el rendimiento absoluto como en la demostracion metodologica: una edicion quirurgica de pesos, sin datos de entrenamiento, eleva la precision en MedQA-USMLE del 24,4 % al 39,0 % (+14,6 puntos, McNemar p = 2,6e-21) y mejora tambien MedMCQA y MMLU medico. Es, por tanto, relevante ahora como caso de estudio reproducible de edicion de modelos y como ejemplo de especializacion clinica de bajo coste en un modelo pequeno.

La licencia es Apache-2.0 y el autor declara explicitamente que el uso previsto es la investigacion sobre edicion y evaluacion de modelos, no el uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5; edicion de pesos sobre la capa de atencion 23 (`o_proj`) |
| Parametros totales | 873.438.784 (0,87 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la evaluacion usa hasta 32.768 tokens nuevos de generacion) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal de tipo image-text-to-text con unos 873 millones de parametros. Sobre esa base no se ha realizado ningun tipo de entrenamiento: no hay descenso de gradiente, ni fine-tuning, ni datos de entrenamiento nuevos. La unica modificacion es la eliminacion de una direccion concreta en la proyeccion de salida de atencion (`o_proj`) de la capa 23, la ultima del modelo. Segun el autor, un modelo frontera leyo los pesos dentro de un kernel de Python y los edito directamente siguiendo el enfoque de "weight-space programming" del MIT CSAIL (2026). El proceso de edicion requirio 12 pasadas forward, 39 ejecuciones de Python y 52 turnos del editor.

El editor pudo consultar exclusivamente los splits de entrenamiento: MedQA-USMLE train (10.178 preguntas) y 10.000 preguntas de entrenamiento de MedMCQA. La evaluacion se realizo con el protocolo del paper: thinking activado, temperatura 0,6, top_p 0,95, top_k 20, penalizacion de presencia 1,5 y un maximo de 32.768 tokens nuevos, con una muestra por pregunta y semilla 0 (ademas de semillas 1 y 2 en MedQA). La respuesta se califica a partir de la ultima linea `Answer: X` posterior a `</think>`. Como controles, el autor compara con dos parches aleatorios del mismo tamano y direccion aleatoria (semillas 1 y 2), que no superan al modelo base, lo que respalda que la mejora se debe a la direccion editada y no al tamano del cambio.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas de opcion multiple en formato de examen clinico (MedQA-USMLE, MedMCQA, MMLU medico).
- Modo de razonamiento explicito ("thinking on"), con la respuesta final extraible tras `</think>`.
- Capacidad multimodal image-text-to-text heredada del modelo base Qwen3.5-0.8B (entrada de imagen y texto), aunque el autor no documenta su rendimiento tras la edicion.
- Respuesta en el formato solicitado de forma mas consistente que el modelo base: 0,0 % de respuestas sin linea calificable frente al 32,9 % del Qwen3.5-0.8B original en MedQA.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el modelo conserva las capacidades del base, pero el autor no las evalua.
- Capacidades multilingues: no documentadas en la informacion proporcionada.

## Casos de uso

- Investigacion en edicion de modelos: servir como caso reproducible y con controles estadisticos (parches aleatorios, intervalos de confianza, McNemar) para estudiar como una unica direccion en una capa de atencion altera el comportamiento de un LLM pequeno.
- Evaluacion comparativa de metodos de especializacion: contrastar la edicion de pesos sin entrenamiento frente a fine-tuning o RLHF en tareas de opcion multiple clinica, usando los mismos prompts y protocolo de muestreo.
- Banco de pruebas de robustez de formato: analizar por que el modelo base falla en producir la linea `Answer: X` (32,9 % sin linea calificable) y como la edicion elimina ese fallo (0,0 %), un fenomeno util para estudiar adherencia al formato.
- Prototipado de asistentes de estudio medico en local: con 0,87 B de parametros, el modelo puede ejecutarse en hardware modesto para generar preguntas y respuestas de repaso tipo USMLE, siempre con supervision y sin uso clinico.
- Experimentos de bajo coste en entornos con recursos limitados: su tamano permite iterar rapidamente sobre prompts, semillas y configuraciones de muestreo sin infraestructura de GPU de gama alta.
- Docencia y divulgacion sobre interpretabilidad: ilustrar de forma concreta que la informacion de una tarea (formato de respuesta medica) puede estar codificada en una direccion concreta de los pesos y ser editada de forma dirigida.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Una muestra por pregunta, semilla 0, thinking on.

| Checkpoint | MedQA (seed 0) | MedQA, mediana de 3 semillas (rango) | MedMCQA | MMLU medico | MedQA cortadas a 32.768 tokens | MedQA sin linea calificable |
|---|---|---|---|---|---|---|
| OpenMed WSP Clinical 0.8B (este modelo) | 39,0 % | 38,6 % (37,0 %–39,0 %) | 39,9 % | 55,4 % | 19,6 % | 0,0 % |
| Parche aleatorio, misma direccion aleatoria (seed 1) | 25,7 % | n/a | 28,3 % | 45,4 % | 19,2 % | 31,7 % |
| Parche aleatorio, misma direccion aleatoria (seed 2) | 23,8 % | n/a | 30,5 % | 45,7 % | 18,2 % | 33,7 % |
| Qwen3.5-0.8B original | 24,4 % | 23,1 % (22,1 %–24,4 %) | 30,6 % | 43,4 % | 18,3 % | 32,9 % |

Tests pareados sobre las mismas preguntas (semilla 0; McNemar exacto, IC bootstrap al 95 % con 10.000 remuestreos):

| Comparacion | Benchmark | n | Antes | Despues | Diferencia (IC 95 %) | Solo antes correcto / solo despues correcto | McNemar p |
|---|---|---|---|---|---|---|---|
| Qwen3.5-0.8B -> WSP Clinical 0.8B | MedQA-USMLE (4 opciones) | 1.273 | 24,4 % | 39,0 % | +14,6 pts (+11,6 a +17,5) | 105 / 291 | 2,6e-21 |
| Qwen3.5-0.8B -> WSP Clinical 0.8B | MedMCQA | 1.000 | 30,6 % | 39,9 % | +9,3 pts (+6,2 a +12,4) | 87 / 180 | 1,3e-08 |
| Qwen3.5-0.8B -> WSP Clinical 0.8B | MMLU | 1.089 | 43,4 % | 55,4 % | +11,9 pts (+8,9 a +15,0) | 88 / 218 | 6,9e-14 |
| Parche aleatorio 1 -> WSP Clinical 0.8B | MedQA-USMLE (4 opciones) | 1.273 | 25,7 % | 39,0 % | +13,3 pts (+10,5 a +16,3) | 106 / 276 | 1,4e-18 |
| Parche aleatorio 1 -> WSP Clinical 0.8B | MedMCQA | 1.000 | 28,3 % | 39,9 % | +11,6 pts (+8,5 a +14,7) | 75 / 191 | 7,7e-13 |
| Parche aleatorio 1 -> WSP Clinical 0.8B | MMLU | 1.089 | 45,4 % | 55,4 % | +10,0 pts (+7,0 a +13,1) | 100 / 209 | 5,4e-10 |
| Parche aleatorio 2 -> WSP Clinical 0.8B | MedQA-USMLE (4 opciones) | 1.273 | 23,8 % | 39,0 % | +15,2 pts (+12,3 a +18,1) | 88 / 282 | 8,3e-25 |
| Parche aleatorio 2 -> WSP Clinical 0.8B | MedMCQA | 1.000 | 30,5 % | 39,9 % | +9,4 pts (+6,0 a +12,8) | 106 / 200 | 8,4e-08 |
| Parche aleatorio 2 -> WSP Clinical 0.8B | MMLU | 1.089 | 45,7 % | 55,4 % | +9,6 pts (+6,5 a +12,7) | 96 / 201 | 1,1e-09 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parametros, en fp16 los pesos ocupan aproximadamente 1,7 GB; en fp32, unos 3,5 GB. La cache KV y el contexto (hasta 32.768 tokens nuevos en la evaluacion) anaden memoria adicional, no cuantificada en la informacion disponible.
- GPU recomendadas: no documentadas por el autor. Por tamano, cualquier GPU consumer con 8 GB o mas (RTX 3060, 4060, 4070, 4090) deberia poder cargar el modelo en fp16; para lotes grandes o contextos largos conviene 16 GB o mas (RTX 4080/4090, A100, H100).
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPU con 8 GB o mas, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: el repo declara compatibilidad con transformers y endpoints; no se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedQA (4 opciones) | MedMCQA | MMLU medico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OpenMed/Qwen3.5-0.8B-WSP-Clinical | 0,87 B | No disponible | 39,0 % | 39,9 % | 55,4 % | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,87 B | No disponible | 24,4 % | 30,6 % | 43,4 % | No disponible en la informacion | Hugging Face |
| Parche aleatorio 1 (control) | 0,87 B | No disponible | 25,7 % | 28,3 % | 45,4 % | No disponible | No distribuido |
| Parche aleatorio 2 (control) | 0,87 B | No disponible | 23,8 % | 30,5 % | 45,7 % | No disponible | No distribuido |

No se dispone de datos de otros modelos clinicos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigacion sobre edicion y evaluacion de modelos; el autor declara explicitamente que no es apto para uso clinico.
- Precaucion contra alucinaciones: el 19,6 % de las respuestas en MedQA se cortan al alcanzar el limite de 32.768 tokens, lo que indica tendencia a divagar en modo thinking y a no cerrar la respuesta.
- Rendimiento absoluto moderado: 39,0 % en MedQA-USMLE y 39,9 % en MedMCQA estan lejos de un uso fiable en contextos reales; la mejora es relativa al modelo base, no un nivel de competencia clinica.
- La edicion se limita a una unica direccion de una unica capa (`o_proj` de la capa 23); no hay garantia de que el comportamiento se mantenga fuera de los formatos de examen evaluados.
- No hay datos sobre sesgos, idiomas soportados ni comportamiento en dominios no medicos; las capacidades multimodales heredadas no estan evaluadas tras la edicion.
- Resultados declarados por el autor y no verificados de forma independiente (`verified: false` en el model-index).
- La licencia Apache-2.0 permite uso comercial del modelo, pero el autor restringe el uso previsto a investigacion; conviene revisar las licencias de los datos de entrada (MedQA, MedMCQA, MMLU) antes de cualquier uso derivado.
- El proceso de edicion dependio de un modelo frontera no identificado; la reproducibilidad exacta del checkpoint no esta garantizada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/Qwen3.5-0.8B-WSP-Clinical
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Organizacion OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- OpenMed en GitHub (agentic AI para salud): https://github.com/openmed-labs/
- Sitio web de OpenMed: https://openmed.life/
- Toolkit biomedico OpenMed: https://www.openmed.icu/
- Plataforma de modelos clinicos OpenMed: https://openmed-ai.org/
- OpenMed en X: https://x.com/OpenMed_AI
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
