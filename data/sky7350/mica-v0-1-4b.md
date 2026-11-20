# sky7350/Mica-v0.1-4B

## Resumen

Mica v0.1 4B es un modelo de decisión de pequeno tamano desarrollado por el usuario sky7350 (repositorio akiVet en GitHub) a partir de un ajuste fino del modelo base Qwen/Qwen3.5-4B. A diferencia de un modelo generativo convencional, Mica recibe un estado (texto de contexto), una pregunta y un conjunto de respuestas permitidas, y devuelve una distribucion de probabilidad sobre esas respuestas: si/no, una eleccion entre 2 y 255 opciones o una puntuacion con 2 a 10 niveles. No genera texto libre, de modo que cada decision cuesta un unico prefill.

El modelo se presenta como compatible con el formato TypeSafe `/v1/systemone`, lo que permite reutilizar clientes escritos para Jev sin cambios. Esta pensado para tareas de clasificacion, evaluacion automatica (judge) y toma de decisiones estructuradas donde la salida debe ser tipada y verificable, no prosa. Su interes actual radica en ofrecer una alternativa ligera y de licencia permisiva (Apache-2.0) a modelos hosted como JEV 1.13 para pipelines de agentes que necesitan decisiones rapidas y deterministas.

Con 4.215.122.944 parametros y un contexto de entrada limitado a 8.192 tokens (las entradas mas largas se rechazan con HTTP 400 en lugar de truncarse), Mica se posiciona como un componente especializado dentro de arquitecturas de agentes, no como un sustituto de un LLM generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B) con LoRA rank-16 fusionado en las 32 capas |
| Parametros totales | 4.215.122.944 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada; entradas mayores se rechazan con HTTP 400 |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 (GGUF) |
| Idiomas soportados | ingles (en) y coreano (ko) |
| Licencia | Apache-2.0 (ver NOTICE) |
| Formato de pesos | safetensors (BF16 fusionado) y GGUF |

## Arquitectura y entrenamiento

Mica parte de Qwen/Qwen3.5-4B (revision 851bf6e), un transformer decoder-only de aproximadamente 4.200 millones de parametros. Sobre el se aplico un LoRA de rango 16 en las 32 capas, posteriormente fusionado en los pesos base para producir safetensors en BF16. El modelo no genera tokens de texto: la cabeza de decision se utiliza para producir una distribucion de probabilidad sobre las opciones permitidas, lo que reduce la inferencia a un unico paso de prefill y elimina la decodificacion autoregresiva.

El ajuste fino se realizo sobre 77.732 filas de entrenamiento en ingles y coreano. No se detalla la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card solo indica que el conjunto de validacion (held-out) se escribio despues de congelar los datos de entrenamiento y no se abrio hasta finalizar el entrenamiento. Se verifico que ningun item de JevBench estuviera presente en los datos de entrenamiento mediante comprobaciones de coincidencia exacta y de 8-gramas sobre los 231 items publicos. La mitad de los items dificiles publicos, junto con Kev transfer v9 y SemIf, se usaron para comparar recetas durante el desarrollo y fijar la escala del LoRA, que se mantuvo en 1.0.

## Capacidades

- Clasificacion binaria (si/no) mediante preguntas de tipo `noul`.
- Eleccion multiple entre 2 y 255 opciones.
- Puntuacion ordinal con 2 a 10 niveles.
- Salida exclusivamente probabilistica: no genera texto libre ni explicaciones.
- Compatibilidad con el formato TypeSafe `/v1/systemone`, reutilizable por clientes de Jev.
- Soporte de tool calling indirecto: se usa como componente de decision dentro de pipelines de agentes que necesitan aprobar o rechazar acciones.
- Capacidad de juicio (judge) sobre respuestas o estados, evaluada en el benchmark JevBench.
- Multilingue limitado a ingles y coreano.
- Modo de decision de un solo paso (single prefill), sin razonamiento multi-step interno.
- Soporte de entradas largas dentro del limite de 8.192 tokens, con rechazo explicito en caso de exceso.

## Casos de uso

- Aprobacion de acciones de agentes: dado un estado que describe una operacion (por ejemplo, borrar una base de datos de staging sin aprobacion), Mica devuelve la probabilidad de aprobar o rechazar, integrandose como guardrail en sistemas de agentes autonomos.
- Evaluacion automatica de respuestas (LLM-as-a-judge): se le presenta una pregunta, una respuesta candidata y las opciones de calidad, y devuelve la distribucion sobre los niveles de calidad; su bajo coste por decision permite evaluar grandes lotes.
- Clasificacion de intenciones en atencion al cliente: con un estado que resume el historial de conversacion y una lista de intenciones permitidas, Mica selecciona la categoria sin generar texto, lo que simplifica el enrutamiento.
- Moderacion de contenido estructurada: clasificacion de mensajes en categorias de riesgo predefinidas, con la ventaja de que la salida es una probabilidad calibrada (ECE 0.064 en JevBench publico) en lugar de una etiqueta opaca.
- Enrutamiento de consultas en pipelines RAG: decidir entre un conjunto pequeno de fuentes o herramientas segun el estado de la consulta, con latencia baja (p50 de 54 ms en RTX 3090 con GGUF BF16).
- Control de calidad en generacion de codigo: evaluar si un parche cumple criterios definidos (tests, estilo, seguridad) mediante opciones tipadas, integrndose en un pipeline de CI/CD.
- Decisiones de negocio con opciones acotadas: seleccion entre politicas predefinidas (por ejemplo, niveles de descuento o prioridad de incidencia) donde se requiere una distribucion de probabilidad auditable.

## Benchmarks y rendimiento

Resultados de exactitud en porcentaje, obtenidos con el codigo de evaluacion propio del autor usando el modelo BF16 en PyTorch. Cuando un modelo no puede procesar una entrada (idioma, longitud, formato), el item cuenta como incorrecto.

| Conjunto | n | Mica | JEV 1.13 | Qwen3.5-4B | JevK5 4B | Kev 4B | Nimble 9B | Laya |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| JevBench easy | 48 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 97.9 |
| JevBench original | 72 | 100.0 | 98.3 | 91.7 | 93.3 | 91.7 | 91.7 | 65.0 |
| JevBench hard | 111 | 69.5 | 74.3 | 61.0 | 76.2 | 52.4 | 23.8 | 10.5 |
| SemIf | 252 | 94.4 | 98.4 | 80.2 | 86.1 | 89.3 | 93.2 | 65.1 |
| Kev transfer v9 | 1.264 | 69.2 | 82.0 | 66.1 | 70.5 | 73.5 | – | 53.8 |
| MMLU-Pro | 10.032 | 53.0 | 82.3 | 45.2 | 53.5 | 49.7 | – | – |

Resultados en conjuntos propios (ingles y coreano):

| Conjunto | n | Mica | JEV 1.13 | Qwen3.5-4B | JevK5 4B | Kev 4B | Nimble 9B | Laya |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Held-out | 7.328 | 67.4 | 74.7 | 54.4 | 25.5 | 56.4 | 53.9 | 25.3 |
| Held-out, solo ingles | 3.044 | 67.0 | 74.1 | 55.0 | 61.0 | 57.0 | 54.8 | 32.6 |
| Held-out, solo coreano | 4.284 | 67.7 | 75.2 | 54.1 | – | 55.9 | 53.3 | 20.1 |
| Dev | 2.222 | 78.9 | 79.2 | 60.1 | 29.3 | 65.1 | 67.0 | 34.8 |
| Entradas perturbadas | 2.752 | 77.3 | 73.3 | 51.6 | 29.6 | 48.7 | 44.5 | 20.8 |
| Estilo chat coreano | 105 | 86.7 | 81.0 | 55.2 | – | 69.5 | 75.2 | 21.9 |
| Entradas largas, muchas opciones | 1.904 | 75.6 | 77.8 | 54.1 | 18.9 | 59.9 | 36.8 | 14.2 |
| Conocimiento | 322 | 81.1 | 91.9 | 65.2 | 42.2 | 68.0 | 73.9 | 39.1 |
| Transferencia de conceptos | 344 | 71.8 | 72.1 | 48.0 | 47.1 | 51.4 | 51.7 | 25.3 |

Nota del autor: JevK5 es solo en ingles y Laya acepta hasta 1.024 tokens, por lo que muchas de sus filas no son soportadas. Los conjuntos de entradas largas, estilo chat y conocimiento estan cerca de la distribucion de entrenamiento y deben leerse como resultados in-distribution.

Resultados en JevBench publico (231 items) a traves del servidor llama.cpp en una RTX 3090 con GGUF BF16, una peticion a la vez: exactitud easy 1.000, original 1.000, hard 0.649; ECE 0.064; latencia p50 54 ms y p95 552 ms. Los 231 items devolvieron respuestas validas. En PyTorch BF16 el tier hard alcanza 69.5 frente a 64.9 via llama.cpp.

## Requisitos de hardware

- VRAM estimada: el GGUF BF16 pesa 9,7 GB; las variantes Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0 reducen el peso progresivamente (el autor sugiere Q5_K_M como alternativa mas pequena, sin cifra exacta publicada).
- GPU recomendadas: RTX 3090 (medida por el autor, CUDA arch 86), A100 (arch 80, no incluida por defecto en el Dockerfile), H100 (arch 90, incluida). El Dockerfile compila para arquitecturas CUDA 86, 89 y 90.
- Cabe en GPU de consumo: si, en RTX 3090 con BF16 GGUF; las cuantizaciones Q5_K_M y Q4_K_M permiten ajustar en GPUs con menos de 10 GB de VRAM (estimacion no confirmada por el autor).
- Opciones de despliegue: llama.cpp b11010 (runtime propio del repositorio), servidor HTTP en `/v1/systemone`, Docker. El modelo incluye pesos safetensors para uso con transformers, aunque la model card documenta el despliegue via llama.cpp.
- Latencia y throughput: p50 de 54 ms y p95 de 552 ms en RTX 3090 con BF16 GGUF y una peticion concurrente; no se publican cifras de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench hard | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Mica v0.1 4B | 4,2 B | 8.192 | 69.5 | 53.0 | Apache-2.0 | Pesos abiertos en HF |
| JEV 1.13 | no disponible | no disponible | 74.3 | 82.3 | no disponible (hosted) | Solo servicio hosted |
| Qwen3.5-4B | 4 B aprox. | no disponible | 61.0 | 45.2 | no disponible | Pesos abiertos en HF |
| JevK5 4B | 4 B aprox. | no disponible | 76.2 | 53.5 | no disponible | Pesos abiertos |
| Kev 4B | 4 B aprox. | no disponible | 52.4 | 49.7 | no disponible | Pesos abiertos |
| Nimble 9B | 9 B aprox. | no disponible | 23.8 | – | no disponible | Pesos abiertos |

Mica supera al modelo base Qwen3.5-4B en todos los conjuntos de decision evaluados y se acerca a JEV 1.13 en tareas de decision especifica, aunque queda por detras en conocimiento general (MMLU-Pro 53.0 frente a 82.3). JevK5 4B obtiene mejor exactitud en JevBench hard pero es solo en ingles y rinde mucho peor en los conjuntos held-out propios del autor.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, explicaciones ni razonamiento multi-step; solo distribuciones sobre opciones predefinidas.
- Contexto limitado a 8.192 tokens; las entradas mas largas se rechazan con HTTP 400 en lugar de truncarse, lo que exige gestion explicita en el cliente.
- Solo soporta ingles y coreano; el rendimiento en otros idiomas no esta documentado y previsiblemente sera bajo.
- Riesgo de alucinacion reducido por el formato de salida, pero persisten errores de clasificacion: exactitud del 67,4 % en el held-out general y del 69,5 % en JevBench hard.
- Sensibilidad a entradas perturbadas: el autor senala que la mayor brecha aparece cuando una nota dentro del estado indica al modelo elegir una opcion incorrecta, lo que sugiere vulnerabilidad a inyeccion de instrucciones en el estado.
- Los conjuntos de entradas largas, estilo chat y conocimiento estan cerca de la distribucion de entrenamiento; sus cifras no deben extrapolarse a dominios fuera de distribucion.
- Diferencia entre backends: el tier hard baja de 69.5 (PyTorch BF16) a 64.9 (llama.cpp), por lo que la eleccion de runtime afecta a la exactitud.
- Licencia Apache-2.0 permite uso comercial, pero debe revisarse el fichero NOTICE por posibles atribuciones adicionales derivadas del modelo base Qwen3.5-4B.
- El repositorio ocupa 38,0 GB por incluir multiples cuantizaciones; conviene descargar solo el fichero necesario.
- No se documentan sesgos especificos ni evaluaciones de seguridad; en produccion conviene anadir validacion y monitorizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sky7350/Mica-v0.1-4B
- Repositorio GitHub (codigo, Dockerfile y scripts): https://github.com/akivet/Mica-v0.1-4B
- Resultados por item en JevBench publico: https://github.com/akivet/Mica-v0.1-4B/blob/main/results/public231/mica-v0.1-4b.jsonl
- JevBench (benchmark): https://github.com/fstandhartinger/jevbench
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
