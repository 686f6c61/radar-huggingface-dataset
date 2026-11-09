# arjanssuri/qwen3.5-9b-rubiks-cube

## Resumen

Qwen3.5-9B Rubik's Cube es un ajuste fino del modelo Qwen/Qwen3.5-9B desarrollado por el usuario arjanssuri, orientado a resolver el cubo de Rubik de forma completa mediante llamadas a herramientas. El modelo lee el estado del cubo como texto (seis rejillas de 3x3 con letras de color), razona en su respuesta y aplica giros a través de una herramienta `move`, siguiendo el método CFOP que emplearía un speedcuber. No incluye solucionador interno, búsqueda ni ejecución de código: toda la resolución emerge del razonamiento del propio modelo.

El modelo tiene 9.653.104.368 parámetros (aproximadamente 9,65 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0. Es relevante como caso de estudio de razonamiento multi-paso con uso de herramientas en modelos de tamano medio, y porque aborda una tarea (resolución del cubo de Rubik) en la que los modelos frontera evaluados en CubeBench obtuvieron un 0% sin herramientas de solucionador.

El repositorio tiene un tamano de 19,3 GB y fue creado y actualizado el 9 de noviembre de 2026. No registra descargas ni likes en el momento de la consulta. La model card documenta resultados de evaluación propios, pero no se han publicado resultados en benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.653.104.368 (~9,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 32768` |
| Tipos de cuantizacion | no disponible (repo en safetensors sin cuantizar; 19,3 GB) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y se entrena en varias etapas secuenciales, cada una arrancando desde el modelo de la etapa anterior, con los pesos finales fusionados en el modelo base. El entrenamiento combina SFT con LoRA sobre trazas de razonamiento escritas por un motor del cubo (cada línea verificada contra el estado del cubo) y RL estilo GRPO sobre la fase de la cruz, usando las herramientas prime-rl y verifiers de Prime Intellect.

Las etapas documentadas son: v3 (lectura del cubo y cruz de 1 a 4 movimientos, SFT), v4 (cruz de 3 a 8 movimientos, RL con recompensa de distancia exacta), v5 (selección de movimientos de cruz por consulta, SFT), v6 (cruz sobre scrambles reales, 75,9%, RL), F3 y F4 (F2L por consulta de caso y luego vista de 59 casos en posición frontal-derecha, SFT) y F5, el modelo publicado, que añade la última capa en dos pasos (2-look OLL y PLL) y resoluciones completas, también con SFT. No se detalla el volumen de tokens de entrenamiento ni la composición del dataset más allá de estas trazas generadas por motor.

La innovación técnica destacable es el diseño del razonamiento como tabla de consulta en lugar de búsqueda: el modelo nombra patrones, identifica casos y aplica algoritmos memorizados (59 algoritmos de F2L leídos siempre como si la ranura estuviera en frontal-derecha, y 16 algoritmos de última capa), lo que reduce la tarea a recuperación estructurada paso a paso.

## Capacidades

- Resolución completa del cubo de Rubik desde un scramble real, de principio a fin, siguiendo CFOP (cruz, F2L, última capa).
- Lectura del estado del cubo en formato de seis rejillas 3x3 de letras de color (U, R, F, D, L, B; blanco en D, amarillo en U, verde en F).
- Uso de herramientas (tool calling) con una herramienta `move` para girar el cubo, una llamada por movimiento o algoritmo.
- Razonamiento multi-paso explícito: cada respuesta comienza con `Stage: cross`, `Stage: F2L` o `Stage: last layer`.
- Modo thinking desactivado: el modelo razona en el cuerpo de la respuesta, no en un bloque de pensamiento separado.
- Reconocimiento de casos de F2L y de última capa (2-look OLL y PLL) mediante consulta de tablas.
- Capacidades multilingües: no disponibles.
- Visión u otras modalidades: el pipeline declarado es `image-text-to-text`, pero la model card no documenta uso de imagen; el funcionamiento descrito es exclusivamente textual.

## Casos de uso

- Investigación en razonamiento multi-paso con herramientas: el modelo sirve como banco de pruebas para estudiar cómo un modelo de 9B aprende a descomponer una tarea secuencial larga (resolución completa en unas 22 llamadas de herramienta) sin búsqueda interna.
- Evaluación de entrenamiento con RL sobre tareas verificables: la resolución del cubo ofrece recompensa exacta y comprobable, por lo que el modelo es útil para reproducir pipelines de GRPO con prime-rl y verifiers sobre un dominio con verificación automática.
- Generación de trazas de razonamiento verificadas: las etapas de SFT se apoyaron en trazas escritas por motor y comprobadas línea a línea, un patrón reutilizable para construir datasets de razonamiento en otros dominios con estado verificable.
- Demostraciones interactivas de agentes: con `play.py` y un servidor vLLM se puede montar una demo que muestre resoluciones giro a giro, útil para divulgación o docencia sobre agentes y tool use.
- Estudio de límites de modelos de tamano medio: los fallos documentados (cruces de seis movimientos, permutaciones H y Z) permiten analizar dónde se rompe la recuperación de patrones frente al razonamiento.
- Base para ajustes finos en dominios con estado estructurado: al ser un fine-tune Apache 2.0 de un modelo de 9B, puede servir como punto de partida para tareas de planificación con herramientas sobre representaciones textuales de estado.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación con semilla 1 sobre tareas no vistas en entrenamiento, temperatura 1.0, solo razonamiento propio del modelo, cada resolución verificada replicando los movimientos en el motor del cubo):

| Prueba | Resultado |
|---|---|
| Scramble real a resuelto, de principio a fin | 42 / 64 intentos (66%) |
| Resuelto en al menos 1 de 2 intentos | 28 / 32 scrambles (88%) |
| Última capa completa (F2L ya resuelto) | 60 / 64 (94%) |
| F2L completo (cruz ya resuelta) | 31 / 32 (97%) |
| Cruces de 6 movimientos | 25 / 32 (78%) |

Datos adicionales aportados por el autor: los 22 fallos en resoluciones completas se debieron a los límites de la evaluación (12 agotaron los 30 turnos, 10 alcanzaron el tope de 120 movimientos), no a que el modelo se quedara atascado. Una resolución típica requiere una mediana de 85 movimientos en 22 llamadas de herramienta. Como referencia, el Qwen3.5-9B base resuelve casi ninguna cruz, y en CubeBench (arXiv:2512.23328) todos los modelos frontera evaluados obtuvieron 0% en scrambles a 8 o más movimientos de la solución sin herramienta de solucionador.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 9,65 mil millones de parámetros en safetensors (19,3 GB en el repo), la inferencia en precisión de 16 bits requiere del orden de 19-20 GB de VRAM solo para los pesos, más memoria para KV cache y contexto; en cuantización de 8 bits o 4 bits el requisito baja aproximadamente a la mitad o a un cuarto, respectivamente, aunque el autor no publica cuantizaciones.
- GPU recomendadas: no especificadas por el autor. Por tamano, encaja en GPUs de centro de datos como A100 (40/80 GB) o H100, y en consumer de gama alta con 24 GB o más (por ejemplo RTX 4090) en 16 bits, con margen limitado para contextos largos.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) con precisión de 16 bits y contexto moderado, o en GPUs de 16 GB con cuantización; no confirmado por el autor.
- Despliegue: el autor documenta vLLM con `--max-model-len 32768`, `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`, más un cliente OpenAI (`openai`) que ejecuta `play.py`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Sí se conoce el coste por episodio: una resolución completa supone unos 14K tokens de conversación y una mediana de 22 llamadas de herramienta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B Rubik's Cube (este) | 9,65B | no disponible (ejemplo con 32768) | Resolución del cubo con tool calling; 66% de resoluciones completas | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9B (aprox.) | no disponible | Propósito general; resuelve casi ninguna cruz según el autor | no disponible en la información | Hugging Face |
| Modelos frontera evaluados en CubeBench | no disponible | no disponible | 0% en scrambles a 8+ movimientos sin herramienta de solucionador | no disponible | no disponible |

No se dispone de datos de benchmarks estándar ni de modelos comparables de la misma categoría (fine-tunes de resolución del cubo) en la información proporcionada.

## Limitaciones y advertencias

- Una sola orientación: entrenado con blanco abajo y verde delante; lee el cubo únicamente en esa orientación.
- Un solo formato: prompts, herramientas y texto del cubo distintos de los documentados no han sido probados; el modelo espera el system prompt de `system_prompt.txt`, las herramientas de `tools.json` y el formato de rejillas exacto.
- Puntos débiles documentados: falla aproximadamente 1 de cada 5 cruces de seis movimientos y confunde las permutaciones H y Z de PLL cerca de la mitad de las veces.
- Episodios largos: una resolución completa ocupa unos 14K tokens de conversación, lo que exige ventanas de contexto amplias y encarece la inferencia.
- Los fallos de resolución completa en la evaluación se debieron a límites de turnos o movimientos, lo que indica que el modelo puede necesitar más de 30 turnos o 120 movimientos en casos difíciles.
- Riesgo de alucinación: no evaluado de forma general; el dominio es verificado por motor, pero fuera de él no hay garantías.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-9B, cuyos términos no se detallan en la información disponible.
- Sin cuantizaciones publicadas ni resultados en benchmarks de propósito general; el modelo no registra descargas ni likes, por lo que su validación por terceros es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arjanssuri/qwen3.5-9b-rubiks-cube
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Writeup del autor: https://blog.arjansuri.com/rubiks-cube.html
- Resoluciones giro a giro: https://blog.arjansuri.com/cube.html
- Paper CubeBench: https://arxiv.org/abs/2512.23328
- prime-rl: https://github.com/PrimeIntellect-ai/prime-rl
- verifiers: https://github.com/PrimeIntellect-ai/verifiers
