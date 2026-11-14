# haohan84/v-jev1.4

## Resumen

v-jev 1.4 es un modelo de decisión de la familia Jev, desarrollado por el usuario haohan84 bajo el paraguas del proyecto SystemOne. No es un modelo generativo al uso: en lugar de producir texto libre que luego hay que parsear, recibe un estado y un conjunto de preguntas tipadas, y devuelve en un único forward pass una distribución de probabilidad sobre cada opción permitida de cada pregunta. La versión 1.4 añade extracción de valores (fechas, importes, identificadores, nombres, direcciones, URLs) y decisiones sobre imágenes presentes en el estado.

Se distribuye en dos tamaños, 0.8B y 4B, ambos derivados por fine-tuning de los backbones Qwen3.5-0.8B y Qwen3.5-4B respectivamente. Cada tamaño se ha post-entrenado de forma independiente y las decisiones se han entrenado solo sobre las respuestas del propio backbone, de modo que el modelo refleja lo que el backbone "piensa" (incluida su incertidumbre) en lugar de añadir conocimiento nuevo. Las lecturas (reads) se entrenan únicamente con etiquetas exactas, nunca con respuestas de modelos.

Es relevante ahora porque propone un paradigma distinto al de los LLM generativos para tareas de extracción y clasificación estructurada: salida determinista, sin generación ni parsing, con latencias muy bajas (36,6 ms en 0.8B y 51,3 ms en 4B sobre una RTX 5090 para 6 decisiones más 2 lecturas en caliente) y con una calibración de probabilidades explícita. Es un lanzamiento de investigación, con una sola ejecución de entrenamiento y una sola semilla por tamaño, y solo se ha probado en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (backbone) con cabezas de decisión; incluye codificador de visión |
| Parámetros totales | 0.8B (variante pequeña) y 4B (variante grande) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en un único archivo por tamaño) |
| Idiomas soportados | Inglés (solo se probó inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (un archivo por tamaño, incluye el codificador de visión) |

## Arquitectura y entrenamiento

El modelo parte de los backbones Qwen3.5-0.8B (commit `2fc0636`) y Qwen3.5-4B (commit `851bf6e`) y les añade un mecanismo de decisión que, dado un estado y un conjunto de preguntas tipadas, emite una probabilidad para cada opción permitida de cada pregunta en un solo forward pass. No hay generación autoregresiva ni necesidad de parsing posterior. El repositorio incluye además un codificador de visión que permite incorporar imágenes al estado y tomar decisiones sobre ellas. Los pesos se empaquetan en un único archivo por tamaño (1,7 GB para 0.8B y 9,1 GB para 4B).

El entrenamiento se realizó por fine-tuning independiente para cada tamaño. Las decisiones se entrenaron exclusivamente sobre las respuestas del propio backbone, de forma que el modelo aprende a calibra su incertidumbre y a reflejar cuándo el backbone duda o cuándo su respuesta cambia según cómo se formula la pregunta. Las lecturas (extracción de valores) se entrenaron solo con etiquetas exactas: anotaciones humanas y documentos cuyos valores se conocen por construcción, nunca con salidas de modelos. No se usó ningún dato de benchmark para el entrenamiento. El lanzamiento es de investigación, con una sola ejecución y una sola semilla por tamaño.

## Capacidades

- Decisión estructurada: emite probabilidades sobre opciones tipadas para múltiples preguntas en un único forward pass.
- Extracción de valores (reads): copia fechas, importes, identificadores, nombres, direcciones y URLs del estado, o indica que no hay ninguno.
- Decisiones sobre imágenes: incorpora una imagen al estado y responde preguntas sobre ella.
- Salida estructurada sin parsing: no genera texto libre, por lo que no requiere post-procesado.
- Calibración de incertidumbre: las probabilidades reflejan el grado de duda del backbone y su sensibilidad a la formulación de la pregunta.
- Clasificación: soporta tareas de clasificación mediante preguntas tipadas.
- Extracción de información: orientado a information extraction sobre estados estructurados o semiestructurados.
- Multilingüe: no disponible; solo se probó inglés.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible como capacidad documentada.

## Casos de uso

- Extracción de campos en documentos financieros: el modelo puede leer un estado que contenga el texto de una factura o un extracto y devolver, vía reads, el importe, la fecha y el identificador con una probabilidad asociada, sin necesidad de generar y parsear texto. Es adecuado por su entrenamiento con etiquetas exactas en lecturas (95,5 % exacto en diálogos SGD para 0.8B y 96,2 % para 4B).
- Clasificación de tickets de soporte: dado el texto de una incidencia, formular preguntas tipadas (categoría, prioridad, requiere escalado) y obtener distribuciones de probabilidad en una sola pasada, lo que permite umbralizar y derivar a revisión humana cuando la confianza es baja.
- Enrutamiento de decisiones en pipelines: usar las probabilidades de salida como señal para un sistema de reglas o un orquestador, aprovechando la calibración (KL 0,272 en 4B frente al gold en typed-decisions) para decidir cuándo el modelo es fiable.
- Preguntas sobre imágenes en control de calidad: incorporar una imagen al estado y preguntar por atributos verificables (presencia de un objeto, estado de un componente), con una precisión de 91,9 en 4B y 75,3 en 0.8B sobre A-OKVQA y ScienceQA.
- Verificación de coherencia en formularios: comprobar si los valores extraídos de un documento son lógicos o consistentes mediante preguntas tipadas de validación, usando la medida de coherencia JevBench-mini (62,4 en 0.8B y 69,7 en 4B).
- Extracción de identificadores en issues de repositorios: el modelo reporta un 77 % (0.8B) y un 76 % (4B) de acierto entre las respuestas dadas en issues de pandas con `lock=True`, útil para enlazar entidades en herramientas de gestión de incidencias.
- Despliegue en entornos con latencia estricta: con 36,6 ms (0.8B) y 51,3 ms (4B) en caliente sobre RTX 5090 para 6 decisiones más 2 lecturas, encaja en servicios que necesitan respuestas por debajo de 100 ms sin generación de texto.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Los datos de typed-decisions y JevBench-mini corresponden a ejecuciones propias del autor, no a filas oficiales de los leaderboards.

| Benchmark | v-jev 1.4 (0.8B) | v-jev 1.4 (4B) |
|---|---:|---:|
| typed-decisions: accuracy | 0,481 | 0,638 |
| typed-decisions: KL desde gold | 0,372 | 0,272 |
| typed-decisions: Brier | 0,201 | 0,148 |
| JevBench-mini: coherencia | 62,4 | 69,7 |
| Imágenes (A-OKVQA + ScienceQA): accuracy | 75,3 (74,6 backbone) | 91,9 (91,8 backbone) |
| Reads en diálogos SGD: exacto / correcto entre respuestas dadas | 95,5 / 94,3 | 96,2 / 95,2 |
| Reads en issues de pandas con `lock=True`: correcto entre respuestas dadas | 77 | 76 |
| Latencia (6 decisiones + 2 lecturas, caliente, RTX 5090) | 36,6 ms | 51,3 ms |
| Memoria GPU, texto / imagen | 1,5 / 1,8 GB | 8,0 / 9,1 GB |

En typed-decisions, el 4B se sitúa en la zona media de los modelos de 2–4B en accuracy, por debajo de v-jev 1.0 base sobre el mismo backbone, y el 0.8B queda cerca del suelo, a la altura del prior que ignora la entrada. El autor lo interpreta como evidencia de que el modelo refleja el conocimiento de su backbone en lugar de añadirlo. En JevBench-mini, la coherencia del 4B (69,7) queda por debajo de modelos como Open-Jev-9B (83,9) y JevAny-Qwen-4B (79,4), aunque el autor no publica la tabla completa de su fila en la información disponible.

## Requisitos de hardware

- VRAM estimada: 1,5 GB para texto y 1,8 GB para imagen en el 0.8B; 8,0 GB para texto y 9,1 GB para imagen en el 4B.
- GPU recomendadas: el autor reporta latencias sobre RTX 5090; por memoria, el 0.8B cabe en GPUs consumer de gama media y el 4B requiere al menos 9,1 GB, por lo que encaja en RTX 3090, RTX 4090, RTX 5090, A100 o H100.
- Cabe en GPU consumer: sí, ambas variantes; el 4B necesita una GPU con 10 GB o más de VRAM para imagen.
- Opciones de despliegue: la model card indica `transformers` y compatibilidad con endpoints (`endpoints_compatible`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 36,6 ms (0.8B) y 51,3 ms (4B) en caliente sobre RTX 5090 para 6 decisiones más 2 lecturas. No se publica throughput agregado.

## Comparativa con modelos similares

Comparación con alternativas de la misma categoría (modelos de decisión) según los datos de los leaderboards citados en la model card.

| Modelo | Tamaño | Contexto | typed-decisions accuracy | typed-decisions KL | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| v-jev 1.4 | 4B | no disponible | 0,638 | 0,272 | Apache 2.0 | Hugging Face |
| v-jev 1.4 | 0.8B | no disponible | 0,481 | 0,372 | Apache 2.0 | Hugging Face |
| d3-mini | 4B | no disponible | 0,743 | 0,319 | no disponible | no disponible |
| signpost-d-4b | 4,5B | no disponible | 0,712 | 0,162 | no disponible | no disponible |
| OpenDecider-small | no disponible | no disponible | 0,671 | 0,211 | no disponible | no disponible |
| d1-2B | 2B | no disponible | 0,637 | 0,282 | no disponible | no disponible |
| Jeff-Qwen3.5-0.8B | 0.8B | no disponible | 0,483 | 0,679 | no disponible | no disponible |

En JevBench-mini, el 4B de v-jev 1.4 (coherencia 69,7) queda por debajo de Open-Jev-9B (83,9), JevAny-Gemma-4B (81,2), JevAny-Qwen-4B (79,4), decider-4b v2.1 (78,4) y TinyJev-4B (77,3), según los rangos publicados. La información disponible no permite comparar contexto ni licencia de los competidores.

## Limitaciones y advertencias

- Lanzamiento de investigación: una sola ejecución de entrenamiento y una sola semilla por tamaño, sin validación estadística de robustez.
- Solo se probó en inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- El 0.8B rinde a la altura del prior que ignora la entrada en typed-decisions (0,481 frente a 0,470), por lo que su utilidad en decisiones complejas es limitada.
- El 4B queda por debajo de v-jev 1.0 base en el mismo backbone en typed-decisions, lo que sugiere que la versión 1.4 no mejora la precisión de decisión respecto a su predecesora.
- Riesgo de alucinación en lecturas: aunque se entrenan con etiquetas exactas, la extracción de valores de documentos no vistos puede producir valores incorrectos con alta confianza; se recomienda validación posterior.
- Sesgos: no se documentan análisis de sesgo; al heredar el backbone Qwen3.5, puede arrastrar los sesgos de sus datos de preentrenamiento.
- Longitud de contexto no documentada, lo que impide planificar su uso en estados largos.
- El gold de typed-decisions es la media de tres muestras de un profesor de 4B, por lo que la accuracy mide acuerdo con ese profesor, no corrección absoluta.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- No se documentan mecanismos de tool calling ni de razonamiento multi-paso, por lo que no es adecuado para tareas de agente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haohan84/v-jev1.4
- Backbone 0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Backbone 4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Leaderboard JevBench-mini: https://jevbench.github.io/#leaderboard
- README del tamaño 0.8B: https://huggingface.co/haohan84/v-jev1.4/blob/main/0.8b/README.md
- README del tamaño 4B: https://huggingface.co/haohan84/v-jev1.4/blob/main/4b/README.md
