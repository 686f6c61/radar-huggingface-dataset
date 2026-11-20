# npateman/fusewalk-models

## Resumen

Fusewalk models es una coleccion de modelos de lenguaje afinados especificamente para resolver combinaciones de objetos dentro de Fusewalk, un videojuego de crafteo. El autor, npateman, parte de dos modelos base de la familia Qwen (Qwen3-1.7B y Qwen3.5-4B) y aplica un ajuste fino supervisado sobre el Fusewalk Codex, un conjunto de recetas de combinacion de objetos escrito a mano. La tarea es concreta: dado un par de nombres de objetos, el modelo devuelve el nombre del objeto resultante, opcionalmente acompanado de una breve explicacion entre parentesis.

El repositorio distribuye cinco variantes en formato GGUF cuantizadas a 4 bits (Q4_K_M), pensadas para ejecutarse con llama.cpp. Cada variante se identifica por marca temporal, modelo base, version del Codex y si incorpora la capacidad de explicar la combinacion. Los tamanos oscilan entre 1.056 MB (variantes de 1,7B) y 2.583 MB (variantes de 4B).

La relevancia de este modelo no reside en sus capacidades generales, sino en su especializacion extrema: demuestra como un modelo pequeno puede resolver una tarea cerrada de dominio con alta plausibilidad (hasta un 78% en las variantes de 4B) mediante ajuste fino y cuantizacion agresiva, con un coste de despliegue minimo y licencia Apache 2.0. No es un modelo de proposito general y no debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B / Qwen3.5-4B) |
| Parametros totales | 1.720.574.976 (variantes Qwen3-1.7B); no disponible para variantes Qwen3.5-4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits) en formato GGUF |
| Idiomas soportados | no disponible (el dominio de la tarea es en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Cada variante es un ajuste fino de un modelo base de la familia Qwen. Segun la model card, el entrenamiento se realizo mediante LoRA fusionado en los pesos (o, en algunos casos, un ajuste fino completo) sobre el Fusewalk Codex, un conjunto de recetas de combinacion de objetos escrito a mano. Tras el ajuste, los pesos se convirtieron a GGUF y se cuantizaron a 4 bits con el metodo Q4_K_M.

La tarea de entrenamiento es de mapeo directo: la entrada es un par de nombres de objetos entre comillas, en orden alfabetico y unidos por ` + `, dentro de la plantilla de prompt del modelo base; la salida es uno o dos nombres de objetos entre comillas en la primera linea, precedidos opcionalmente por una explicacion entre parentesis cuando la variante incorpora esa capacidad. No se documentan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO; la model card solo menciona el ajuste supervisado sobre el Codex.

## Capacidades

- Combinacion de objetos de dominio cerrado: dado un par de nombres de objetos, devuelve el objeto resultante segun las recetas del Fusewalk Codex.
- Explicacion de la combinacion (solo variantes con sufijo `-x`): genera una frase breve entre parentesis que justifica el resultado, por ejemplo `(fire's heat boils water into steam) "Steam"`.
- Formato de salida estructurado: nombres entre comillas, una o dos por respuesta, con parada en el primer salto de linea.
- No se documentan capacidades de generacion general, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingues en la informacion disponible.

## Casos de uso

- Motor de crafteo en el juego Fusewalk: el modelo resuelve en tiempo de ejecucion la combinacion de dos objetos cualesquiera, sustituyendo o complementando una tabla de recetas estatica y permitiendo respuestas plausibles para pares no previstos explicitamente.
- Generacion de contenido derivado: a partir de las combinaciones, el equipo puede poblar paginas de objetos con la explicacion generada (variantes `-x`), reduciendo el trabajo editorial manual.
- Prototipado rapido de mecanicas de crafteo: al ser modelos de 1-3 GB, permiten iterar sobre nuevas versiones del Codex (v0.4, v0.7) y medir plausibilidad antes de fijar el diseno definitivo.
- Herramienta interna de validacion de recetas: el equipo de diseno puede consultar pares de objetos y comparar la respuesta del modelo con el Codex para detectar combinaciones ambiguas o incoherentes.
- Despliegue en servidor modesto o en local: gracias a la cuantizacion Q4_K_M, las variantes de 1,7B caben en GPUs de consumo y pueden servirse con llama.cpp sin infraestructura dedicada.
- Evaluacion de ajuste fino en dominios cerrados: sirve como referencia metodologica para experimentos de LoRA sobre modelos pequenos con metricas de plausibilidad evaluadas por un juez LLM.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). El unico dato de rendimiento disponible es la metrica de plausibilidad propia del autor, calculada sobre pares reservados para evaluacion y evaluada por un juez LLM que clasifica cada respuesta como buena, mash-up, debil o sin sentido:

| Variante | Modelo base | Codex | Explica | Tamano | Plausible |
|---|---|---|---|---|---|
| 20261101-094657-qwen3-1.7b-v0.7-x | Qwen3-1.7B | v0.7 | si | 1.056 MB | 63% |
| 20261101-095550-qwen3-1.7b-v0.7 | Qwen3-1.7B | v0.7 | no | 1.056 MB | 63% |
| 20261101-100338-qwen3.5-4b-v0.7-x | Qwen3.5-4B | v0.7 | si | 2.583 MB | 75% |
| 20261101-102249-qwen3-1.7b-v0.4 | Qwen3-1.7B | v0.4 | no | 1.056 MB | 62% |
| 20261101-103010-qwen3.5-4b-v0.7 | Qwen3.5-4B | v0.7 | no | 2.583 MB | 78% |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para las variantes de 1,7B y 2,6 GB para las de 4B, segun el tamano de los ficheros GGUF Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para las variantes de 1,7B y 4 GB para las de 4B; no se requiere A100 ni H100.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con memoria compartida suficiente).
- Opciones de despliegue: llama.cpp (el autor documenta `llama-completion`), y por extension los runners compatibles con GGUF como Ollama o servidores basados en llama.cpp. No se documenta soporte de vLLM ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. La generacion esta limitada a 64 tokens (`-n 64`) y parada en el primer salto de linea, lo que sugiere respuestas muy cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Fusewalk models (Qwen3-1.7B) | 1,72B | no disponible | GGUF Q4_K_M | Apache 2.0 | Ajuste fino de dominio cerrado |
| Fusewalk models (Qwen3.5-4B) | no disponible | no disponible | GGUF Q4_K_M | Apache 2.0 | Ajuste fino de dominio cerrado |
| Qwen3-1.7B (base) | 1,72B | no disponible | safetensors, GGUF | Apache 2.0 | Modelo de proposito general |
| Qwen3.5-4B (base) | no disponible | no disponible | safetensors, GGUF | Apache 2.0 | Modelo de proposito general |

La comparacion relevante es contra los modelos base: Fusewalk models sacrifica capacidades generales para maximizar el rendimiento en una tarea cerrada, con un coste de despliegue identico o inferior gracias a la cuantizacion. No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Dominio extremadamente restringido: el modelo solo responde a la tarea de combinacion de objetos del Fusewalk Codex; no es adecuado para uso general.
- Riesgo de alucinacion en pares no cubiertos: la metrica de plausibilidad es del 62-78%, lo que implica que entre un 22% y un 38% de las respuestas sobre pares reservados no se consideran buenas; en produccion habra combinaciones inventadas o sin sentido.
- Dependencia de la plantilla de prompt: cada variante requiere su plantilla exacta (definida en `index.json`), con el par en orden alfabetico y las cadenas de parada correctas; un uso incorrecto degrada la salida.
- Idiomas: no se documentan idiomas soportados; el dominio y los ejemplos estan en ingles.
- Licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de los modelos base incluidos en `licenses/`.
- Trazabilidad: las variantes se identifican por marca temporal y version del Codex; conviene fijar una version concreta en produccion para evitar cambios de comportamiento.
- Sin datos de contexto maximo ni de rendimiento estandar: no es posible garantizar comportamiento en entradas largas o fuera de formato.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/npateman/fusewalk-models
- Indice de modelos y plantillas: https://huggingface.co/npateman/fusewalk-models/blob/main/index.json
- Licencias de los modelos base: https://huggingface.co/npateman/fusewalk-models/tree/main/licenses
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
