# arpjw/Nemotron-Mini-4B-Graph-Counterexamples

## Resumen

Nemotron-Mini-4B-Graph-Counterexamples es un adaptador LoRA de rango 16 entrenado de forma independiente por el usuario arpjw sobre el modelo base nvidia/Nemotron-Mini-4B-Instruct. Su proposito es muy concreto: dado un enunciado que define una desigualdad entre invariantes exactos de grafos de como maximo ocho vertices, el modelo debe devolver una lista de aristas en formato JSON que constituya un contraejemplo exacto, es decir, un grafo que viole la desigualdad con un margen entero verificable. No es un modelo de proposito general ni un modelo nuevo: es un artefacto de investigacion que modifica el comportamiento del base para una tarea sintetica y acotada.

El proyecto se enmarca en la experimentacion con modelos pequenos para tareas de razonamiento combinatorio con verificacion formal. El adaptador se selecciono sobre un split de desarrollo congelado de 30 tareas antes de la evaluacion held-out, y los resultados publicados son deliberadamente modestos: resuelve 10 de 30 tareas held-out frente a 0 de 30 del modelo base sin tocar bajo el mismo decodificador greedy de un solo disparo. Un diagnostico post-hoc revela que todos los exitos del adaptador tambien se resuelven con el grafo vacio o el grafo completo, por lo que no hay evidencia de busqueda no trivial de grafos.

La relevancia de esta ficha es acotada: sirve como ejemplo metodologico de evaluacion rigurosa con verificador exacto, hashes de artefactos y analisis de incertidumbre, y como referencia para quien quiera reproducir el pipeline. No debe confundirse con una mejora del modelo base para generacion de texto general, uso comercial o tareas fuera del dominio de invariantes de grafos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, dropout 0.05) sobre transformer decoder nvidia/Nemotron-Mini-4B-Instruct |
| Parametros totales | No disponible (adaptador de 0.1 GB; el base es de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base, no especificada) |
| Tipos de cuantizacion | QLoRA en entrenamiento (BF16 declarado); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | Ingles (en) |
| Licencia | NVIDIA Open Model License (junio 2024) para el artefacto derivado; el repositorio fuente es MIT pero no cubre los artefactos NVIDIA |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no incluye pesos base ni tokenizer |
| Revision del modelo base | 791833e92ebddb0bc2c1007f6d2b6764f886a2ae |
| SHA-256 del adaptador | 0f64011740c008ba93c7c01e8a43375263a7bffeaae802139481da8641899517 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05, entrenado con QLoRA en una sola epoca sobre 120 ejemplos sinteticos, lo que supone 15 pasos de optimizador. Se uso BF16, learning rate 2e-4 y semilla 20261015. El entrenamiento se realizo sobre el modelo base fijado a la revision 791833e92ebddb0bc2c1007f6d2b6764f886a2ae, y el adaptador se selecciono sobre un split de desarrollo congelado de 30 tareas antes de la evaluacion held-out, lo que evita fuga de informacion en la seleccion.

La tarea esta definida por una gramatica sintetica de desigualdades entre invariantes exactos de grafos con un maximo de ocho vertices. Los invariantes soportados incluyen numero de aristas, grados, numero de independencia, numero de clique, numero cromatico, tamano de matching y el producto de los numeros de independencia y clique. La respuesta esperada es una lista de aristas en JSON que el verificador del proyecto comprueba calculando el margen entero de violacion. No se aplico RLHF ni DPO; el ajuste es supervisado sobre pares prompt-respuesta generados por la gramatica. La model card advierte que la gramatica de tareas se comparte entre splits y que pares de invariantes revertidos pueden recurrir, ademas de tratarse de una sola semilla y un conjunto de tareas pequeno.

## Capacidades

- Generacion de listas de aristas en JSON para grafos de hasta ocho vertices que violan una desigualdad dada entre invariantes exactos.
- Manejo de los invariantes soportados por el verificador: numero de aristas, grados, numero de independencia, numero de clique, numero cromatico, tamano de matching y producto independencia-clique.
- Salida estructurada verificable de forma exacta mediante el parser y verificador del proyecto fuente.
- Mejora medida frente al base sin adaptador en la tarea especifica: 10/30 frente a 0/30 en held-out con decodificacion greedy de un solo disparo.
- Capacidades de generacion de texto general, tool calling, agentes, vision, audio o modo thinking: no evaluadas y explicitamente fuera del setup medido.
- Multilingue: solo ingles declarado; el resto de idiomas no esta soportado ni evaluado.

## Casos de uso

- Reproduccion de experimentos de razonamiento combinatorio: cargar la revision exacta del base y adjuntar el adaptador con PEFT para replicar el protocolo publicado, incluidos el parser y el verificador exacto del repositorio fuente.
- Evaluacion metodologica de adaptadores pequenos: usar el par base/adaptador como caso de estudio de seleccion sobre split de desarrollo congelado, evaluacion held-out y diagnostico post-hoc de exitos triviales.
- Generacion de contraejemplos para docencia en teoria de grafos: el modelo produce candidatos que el verificador valida, utiles como material de ejercicios sobre invariantes y desigualdades.
- Pruebas de pipelines de verificacion formal: integrar el parser y el verificador del proyecto para comprobar margenes enteros de violacion en respuestas JSON generadas por el modelo.
- Investigacion sobre alineacion de salidas estructuradas: analizar como un LoRA de 15 pasos de optimizador modifica la distribucion de salidas hacia JSON valido en una gramatica acotada.
- Baseline para busqueda aleatoria en grafos pequenos: comparar el adaptador con la busqueda aleatoria de 32 propuestas reportada (27/30) para dimensionar la brecha entre generacion neuronal y busqueda exhaustiva.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la tarea propia del adaptador, medidos con decodificacion greedy de un solo disparo sobre un split held-out de 30 tareas.

| Metodo | Tareas resueltas (de 30) |
|---|---|
| Adaptador LoRA (este modelo) | 10 |
| Modelo base sin adaptador | 0 |
| Grafo aleatorio (una muestra) | 5 |
| Busqueda aleatoria de 32 propuestas | 27 |

Diagnostico post-hoc: todos los exitos del adaptador tambien se resuelven con el grafo vacio o el grafo completo, por lo que no hay evidencia de busqueda no trivial de grafos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del base Nemotron-Mini-4B-Instruct y de la cuantizacion elegida, no del adaptador (0.1 GB).
- GPU recomendadas: no especificadas en la informacion proporcionada; el base de 4B es compatible con GPUs de consumo en cuantizaciones bajas, pero no hay datos medidos en la model card.
- Cabe en GPU de consumo: probablemente en cuantizaciones de 4-8 bits segun el base, pero no confirmado por el autor.
- Opciones de despliegue: carga mediante PEFT adjuntando el adaptador a la revision exacta del base; el autor indica que la generacion de texto generica queda fuera del setup medido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Mini-4B-Graph-Counterexamples (este) | LoRA sobre base 4B | No disponible | Contraejemplos de grafos | NVIDIA Open Model License (junio 2024) | Hugging Face, 16 descargas |
| nvidia/Nemotron-Mini-4B-Instruct (base) | 4B | No disponible | Instrucciones generales | NVIDIA Open Model License | Hugging Face |
| Busqueda aleatoria de 32 propuestas (baseline del paper) | No aplica | No aplica | Contraejemplos de grafos | No aplica | Codigo en repositorio fuente |

No se dispone de comparativas con otros adaptadores o modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no demuestra busqueda no trivial de grafos: todos sus exitos se explican por el grafo vacio o el grafo completo.
- Entrenado con una sola semilla, 120 ejemplos y 15 pasos de optimizador; la varianza entre semillas no esta caracterizada.
- La gramatica de tareas se comparte entre splits y pares de invariantes revertidos pueden recurrir, lo que puede inflar resultados.
- Solo ingles declarado; no hay soporte multilingue evaluado.
- La generacion de texto general queda explicitamente fuera del setup medido; no debe usarse como modelo de instrucciones.
- Licencia derivada de NVIDIA: el MIT del repositorio fuente no cubre los artefactos del modelo; revisar los terminos de junio 2024 y agosto 2024 incluidos en LICENSES/ antes de cualquier uso.
- Riesgo de alucinacion en la salida JSON: el verificador exacto es obligatorio para validar cualquier respuesta.
- El autor declara que NVIDIA no hizo ni respalda esta release; es un artefacto independiente.
- No se han publicado datos de sesgos, seguridad o robustez fuera del dominio de la tarea.

## Enlaces

- Hugging Face: https://huggingface.co/arpjw/Nemotron-Mini-4B-Graph-Counterexamples
- Modelo base: https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct
- Repositorio fuente del experimento: https://github.com/arpjw/nemotron/tree/main/experiments/graph-counterexamples
- Informe publico de resultados: https://github.com/arpjw/nemotron/blob/main/experiments/graph-counterexamples/results/RUNPOD_PILOT_PUBLIC.md
- Licencia NVIDIA Open Model License (junio 2024): https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
