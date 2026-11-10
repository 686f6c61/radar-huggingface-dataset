# abcdef-higklmn/LongVQU-B4

## Resumen

LongVQU-B4 es un conjunto de adaptadores LoRA publicados por el equipo net4u_athena (MohammadAli Hamidi, Universidad de Cagliari, y Hadi Amirpour, Universidad de Klagenfurt) como entrega final del reto LongVQU-Eval, donde obtuvieron un 62,33 % de acierto. No se trata de un modelo base nuevo, sino de un sistema de ajuste fino y agregacion de predicciones construido sobre dos modelos de vision-lenguaje de la familia Qwen3-VL: la variante de 8B y la de 32B, ambas en su version Instruct.

El repositorio contiene ocho adaptadores LoRA entrenados sobre el conjunto de desarrollo completo de 1.200 preguntas del benchmark. La respuesta final no proviene de un unico adaptador, sino de una combinacion: se calcula la log-probabilidad media por opcion sobre rotaciones de las alternativas, se promedia entre los distintos modelos de 8B (modelos con notas de evidencia, con puntuaciones de calidad en el prompt y una segunda semilla) y el modelo de 32B, y se aplican correcciones de ventana basadas en medidas. Es, por tanto, un sistema de ensemble orientado a evaluacion de calidad de video de formato largo.

Su relevancia es metodologica: documenta con detalle reproducible como exprimir modelos abiertos de vision-lenguaje en una tarea de pregunta-respuesta sobre video largo, incluyendo los scripts de extraccion de fotogramas, el pipeline de test y los ficheros intermedios necesarios para reconstruir exactamente la entrega sin GPU. La licencia Apache 2.0 facilita reutilizar la receta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-VL (transformer multimodal vision-lenguaje); no se especifica la arquitectura interna del base en la informacion disponible |
| Parametros totales | Adaptadores LoRA (tamano del repo: 1,8 GB); los modelos base son Qwen3-VL-8B-Instruct y Qwen3-VL-32B-Instruct |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL, no declarada en la model card) |
| Tipos de cuantizacion | bf16 para los modelos de 8B; carga en 4 bits mencionada para el modelo de 32B |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA compatibles con PEFT); los pesos base se cargan desde Hugging Face Hub |

## Arquitectura y entrenamiento

El sistema se compone de ocho adaptadores LoRA entrenados sobre el conjunto de desarrollo completo de LongVQU-Eval (1.200 preguntas). Siete de ellos se aplican sobre Qwen3-VL-8B-Instruct y uno sobre Qwen3-VL-32B-Instruct. Entre los adaptadores de 8B hay variantes con distintas estrategias de prompt: un ajuste base (experimento 115), una segunda semilla (120), una variante con puntuaciones de calidad incluidas en el prompt (120), un modelo con nota de evidencia de referencia completa (216), dos semillas adicionales de ese modelo de notas (257) y un modelo hibrido que combina notas con y sin referencia, inicializado en caliente desde el 216 (259). El adaptador de 32B se describe como un LoRA "barato" (experimento 117).

La inferencia no usa generacion libre, sino puntuacion: para cada pregunta se calcula la log-probabilidad media de cada opcion sobre rotaciones de las alternativas, se promedia entre los modelos de 8B (notas, qtext y seed2) y el de 32B, y se aplican correcciones de ventana basadas en medidas. El pipeline incluye extraccion de fotogramas con ffmpeg/ffprobe y scripts numerados que se cargan entre si. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset mas alla del Dev set ni si hubo RLHF o DPO.

## Capacidades

- Pregunta-respuesta sobre video de formato largo: el sistema esta disenado para responder preguntas de opcion multiple (1-4) sobre videos, con categorias de QA definidas en el JSON de entrada.
- Comprension multimodal: hereda del base Qwen3-VL la capacidad de procesar video (extraccion de fotogramas) y texto.
- Puntuacion calibrada de opciones: en lugar de generar texto, produce log-probabilidades por opcion, lo que permite agregar varios modelos y aplicar correcciones.
- Ensemble multi-modelo y multi-semilla: combina adaptadores de 8B y 32B con distintas estrategias de prompt.
- Uso de notas de evidencia: los adaptadores de la familia "note" incorporan una nota de evidencia de referencia completa o hibrida en el prompt.
- Reproducibilidad sin GPU: el repositorio incluye ficheros intermedios para reconstruir la entrega final exacta.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, modo thinking, audio ni soporte multilingue explicito.

## Casos de uso

- Evaluacion automatica de calidad de video: el sistema puntua opciones de respuesta sobre videos largos usando notas de evidencia y correcciones de ventana, adecuado para benchmarks de calidad percibida.
- Investigacion en QA sobre video largo: sirve como linea base reproducible (con scripts y ficheros intermedios) para comparar estrategias de LoRA, prompting y ensemble en tareas de video-QA.
- Ensemble de modelos abiertos: la receta de promediar log-probabilidades sobre rotaciones de opciones es reutilizable en cualquier tarea de opcion multiple con modelos de vision-lenguaje.
- Analisis de contenido audiovisual con evidencia textual: los adaptadores con notas de referencia permiten condicionar la respuesta a una descripcion de evidencia, util en auditoria de calidad de video.
- Prototipado en una sola GPU de 48 GB: los modelos de 8B en bf16 caben en una GPU de 48 GB, lo que facilita experimentacion academica sin infraestructura grande.
- Replicacion de resultados de competicion: el pipeline de test y los ficheros de reproduccion permiten verificar la entrega B4 (300/300 respuestas identicas) sin GPU, util para revision por pares.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| LongVQU-Eval (Test) | 62,33 % | Entrega final "B4" del equipo net4u_athena |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros sistemas en el mismo benchmark.

## Requisitos de hardware

- VRAM estimada: los modelos de 8B en bf16 requieren una GPU de 48 GB; el modelo de 32B necesita aproximadamente 2 x 48 GB o carga en 4 bits.
- GPU recomendadas: A100 48 GB (o superior) para los 8B; para el 32B, dos GPU de 48 GB o una configuracion con cuantizacion de 4 bits.
- Cabe en GPU de consumo: no se indica; con 8B en bf16 no cabe en GPU de consumo tipicas de 24 GB sin cuantizacion, y la model card no documenta ese escenario.
- Opciones de despliegue: transformers 4.57, PEFT, accelerate y qwen-vl-utils; se requiere ffmpeg/ffprobe para extraccion de fotogramas. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongVQU-B4 (este) | LoRA sobre 8B y 32B | no disponible | 62,33 % en LongVQU-Eval Test | Apache 2.0 | Hugging Face (adaptadores) |
| Qwen3-VL-8B-Instruct | 8B | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Qwen3-VL-32B-Instruct | 32B | no disponible | no disponible | no disponible en la informacion | Hugging Face |

No se dispone en la informacion proporcionada de datos de rendimiento de los modelos base ni de alternativas comparables en LongVQU-Eval.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar los pesos base de Qwen3-VL desde Hugging Face Hub y aplicar los adaptadores con PEFT.
- Especifico de la tarea: el sistema esta optimizado para opcion multiple sobre video largo; no se documenta su comportamiento en generacion libre, codigo o matematicas.
- Dependencia de infraestructura: necesita ffmpeg/ffprobe y los scripts de extraccion de fotogramas; el pipeline de test asume una estructura de directorios concreta (`outputs/<expNN>/fold0/adapter/`).
- Riesgo de sobreajuste al benchmark: los adaptadores se entrenaron sobre el conjunto de desarrollo completo de 1.200 preguntas, lo que puede limitar la generalizacion a otros dominios de video.
- Idiomas: no se declaran idiomas soportados; no hay garantia de comportamiento multilingue.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni tasas de alucinacion; al tratarse de puntuacion de opciones, el riesgo se traslada a la calibracion de las log-probabilidades.
- Licencia: Apache 2.0 para los adaptadores; el uso comercial queda sujeto tambien a la licencia de los modelos base Qwen3-VL.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (10 de noviembre de 2026); no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/abcdef-higklmn/LongVQU-B4
- Modelo base 8B: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Modelo base 32B: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios o demos adicionales.
