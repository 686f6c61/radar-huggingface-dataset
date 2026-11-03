# nitayrabi/Cyber-Tiel-Coder-35B-A3B-LoopFix-GGUF

## Resumen

Cyber-Tiel-Coder-35B-A3B-LoopFix-GGUF es una variante experimental del checkpoint ornith-ai/Ornith-1.5-35B-A3B, un modelo de arquitectura MoE (mezcla de expertos) con 35B parametros totales y aproximadamente 3B parametros activos, orientado a tareas de agente de codigo. El autor, nitayrabi, aplica una tecnica denominada Weight-Space Programming (WSP): un agente LLM inspecciona trazas de fallo de ejecuciones reales, extrae direcciones contrastivas en las capas finales y edita directamente 64 columnas en bloques Q8_0 de dos tensores de proyeccion descendente de expertos compartidos (blk.26 y blk.34) del GGUF cuantizado, sin fine-tuning, sin LoRA y sin gradientes.

El problema que aborda es el comportamiento patologico de los agentes de codigo locales en ejecuciones multi-paso: bucles de razonamiento dentro de la etiqueta `<think>`, repeticion de llamadas a herramientas rechazadas, preguntas aclaratorias ante tareas inequivocas y bloqueos contando manualmente arrays JSON. La intervencion busca reducir esa sobre-deliberacion preservando la fidelidad de enlace de linea y sintaxis en capas tempranas y medias.

El modelo se distribuye unicamente como GGUF para llama.cpp, con licencia MIT, y esta inspirado en el trabajo "Sparks of Weight-Space Programming" de MIT CSAIL (Takehi et al., 2026), en concreto el experimento 8 sobre eliminacion de bucles de razonamiento en Qwen3.5. Es relevante ahora porque demuestra que es posible modificar el comportamiento de un modelo cuantizado editando pesos de forma quirurgica y sin reentrenamiento, con un coste de almacenamiento minimo (menos del 1 por ciento de los bytes del archivo en los tensores afectados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (tag qwen3_5_moe), con multi-token prediction (MTP) |
| Parametros totales | 81.920 (dato de safetensors del repositorio); el nombre del modelo indica 35B-A3B, no disponible la cifra exacta de parametros totales del checkpoint base |
| Parametros activos | aproximadamente 3B (segun la nomenclatura 35B-A3B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_XL (checkpoint de origen) y Q8_0 en los bloques editados; otras variantes no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un MoE de tipo qwen3_5_moe con soporte de multi-token prediction (MTP), del que se heredan arquitectura, datos de entrenamiento y proceso de alineamiento; no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el checkpoint original. La intervencion de este repositorio no reentrena el modelo: opera directamente sobre el archivo GGUF cuantizado.

La innovacion tecnica central es un procedimiento de edicion de pesos en tres pasos. Primero, `cvector-generator-v2.cpp` calcula direcciones contrastivas mediante media de sufijo alineada por prefijo: en lugar de rellenar con espacios los prompts cortos de un par contrastivo (lo que diluye la senal conductual), computa la longitud exacta de prefijo comun por par y promedia los estados ocultos estrictamente sobre los tokens de sufijo no rellenados, segun la diferencia de medias entre escenarios de bucle y escenarios productivos. Segundo, `apply_loopfix.py` proyecta fuera la base ortogonal de rango 2 (con coeficientes alpha 0.30 y 0.15) de los dos bloques superiores de columnas Q8_0 (64 de 512 columnas) en `blk.26.ffn_down_shexp.weight` (bloques [15, 4], columnas 128..159 y 480..511, L2 relativa del 0.641 por ciento, 49.809 bytes modificados) y `blk.34.ffn_down_shexp.weight` (bloques [2, 12], columnas 64..95 y 384..415, L2 relativa del 0.582 por ciento, 39.321 bytes modificados). Las capas tempranas y medias, incluida blk.15, quedan intactas para preservar el enlace exacto a numeros de linea y sintaxis. Tercero, se parchea la plantilla de chat Jinja en el propio GGUF: se fija `_preserve_thinking = false` por defecto, se acota la retencion de `<think>` dentro de bucles multi-paso de herramientas y se sustituyen clausulas del tipo "pregunta con precision, no adivines" por disciplina de actuar antes de preguntar y de emitir salida cruda, manteniendo exactamente la misma longitud en bytes UTF-8 (30.529 bytes) para no romper el formato.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de pensamiento explicito (`<think>`).
- Agente de codigo: lectura de archivos, edicion con hashline, recuperacion ante errores de herramientas, uso de git worktree.
- Soporte de tool calling y function calling a traves del harness de llama.cpp (`llama-server`).
- Ejecucion de subagentes y tareas de exploracion de codebase (scouting) con emision de rutas de archivo y puntos de entrada CLI.
- Razonamiento matematico y algoritmico (el suite de evaluacion incluye 6 tareas de algoritmos en Python).
- Capacidades multilingues: no disponible.
- Capacidad MTP (multi-token prediction) heredada del checkpoint base.
- Comportamiento ajustado para reducir bucles de razonamiento, repeticion de llamadas fallidas y preguntas aclaratorias innecesarias.

## Casos de uso

- Agente de codigo local en produccion: el modelo puede integrarse en un harness llama.cpp (`llama-server`) para editar codigo con hashline, ejecutar comandos y recuperarse de fallos de herramientas; el ajuste LoopFix reduce la repeticion de la misma sintaxis erronea durante 4 a 6 turnos consecutivos, segun las trazas del autor.
- Exploracion de codebase (scouting): adecuado para recorrer repositorios y devolver rutas de archivo y puntos de entrada CLI en lugar de contar manualmente arrays JSON durante mas de 6.000 tokens, uno de los fallos documentados que la edicion corrige.
- Automatizacion de sesiones multi-turno con subagentes: con la plantilla parcheada que fija `_preserve_thinking = false`, se evita la acumulacion de bloques `<think>` obsoletos de turnos anteriores en el contexto, lo que resulta util en pipelines de agentes encadenados.
- Tareas de limpieza y refactor conservador: el modelo se ajusta para actuar con criterio conservador en tareas inequivocas en lugar de detenerse a pedir aclaraciones, lo que encaja en flujos automatizados de CI/CD donde no hay humano en el bucle.
- Recuperacion ante errores de herramientas: util en pipelines donde las ediciones fallan y el agente debe adaptarse al mensaje de error en lugar de reintentar la misma llamada, con recuperacion de fallos de git worktree incluida en el suite de evaluacion.
- Ejecucion local en hardware de consumo: al ser un GGUF Q4_K_XL de aproximadamente 22 GB, puede desplegarse en estaciones de trabajo con GPU de gama alta o en configuraciones con memoria unificada, sin depender de API externa.
- Investigacion sobre edicion de pesos: el repositorio incluye scripts reproducibles (`cvector-generator-v2.cpp`, `apply_loopfix.py`, plantilla Jinja parcheada) que sirven como caso de estudio de Weight-Space Programming aplicado a modelos cuantizados.

## Benchmarks y rendimiento

El autor publica un suite de 27 casos evaluado en `llama-server` con `--reasoning-effort low --reasoning-budget 4096 --temp 0.6 --top-p 0.95 --top-k 20` y `seed=42`, compuesto por `suite.json` (12 casos), `holdout.json` (8 casos), `replay.json` (3 casos) y `live_interview.json` (4 casos). Los resultados son los siguientes:

| Configuracion | 27 casos | Casos generales no OMP (19) | suite.json (12) | holdout.json (8) | replay.json (3) | live_interview.json (4) |
|---|---|---|---|---|---|---|
| baseline (GGUF sin modificar) | 16/23 (10.997 tok) | 16/19 (84,2 %) | 10/12 (6.702 tok) | 6/8 (2.085 tok) | 0/3 (2.210 tok) | no disponible |
| v1 (alpha03-recovery) | 20/23 (8.120 tok) | 18/19 (94,7 %) | 10/12 (5.929 tok) | 8/8 (1.521 tok) | 2/3 (670 tok) | no disponible |
| v3-agnostic (solo GGUF) | 21/27 (11.151 tok) | 19/19 (100 %) | 11/12 (5.135 tok) | 8/8 (1.341 tok) | 1/3 (867 tok) | 1/4 (3.808 tok) |
| v3-final (GGUF + reglas omp-harness) | 25/27 (12.945 tok) | 19/19 (100 %) | 11/12 (5.452 tok) | 8/8 (1.358 tok) | 2/3 (414 tok) | 4/4 (5.721 tok) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las cifras anteriores son metricas de resolucion de casos y consumo de tokens del suite propio del autor.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF de origen es de aproximadamente 22 GB en Q4_K_XL; la inferencia completa requiere al menos esa cantidad de memoria, mas margen para el contexto KV segun la longitud de contexto configurada (no disponible el coste exacto por token).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el modelo encaja en GPU con 24 GB o mas de VRAM (por ejemplo RTX 4090, A100 40 GB, H100) siempre que el contexto se ajuste a la memoria disponible.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM como la RTX 4090, con cuantizacion Q4_K_XL y contexto moderado; en GPUs de 16 GB requeriria cuantizaciones mas agresivas no publicadas en el repositorio.
- Opciones de despliegue: llama.cpp y `llama-server` (formato nativo del repositorio); vLLM, TGI y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles; el autor solo reporta consumo de tokens por caso en el suite de evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-LoopFix-GGUF | 81.920 (segun safetensors); nombre indica 35B-A3B | no disponible | MIT | GGUF | Variante editada por WSP para reducir bucles de agente |
| Cyber-Tiel-Coder-35B-A3B-MTP-UD-Q4_K_XL (checkpoint de origen) | 35B-A3B | no disponible | no disponible | GGUF | Sin intervencion; baseline del suite del autor |
| ornith-ai/Ornith-1.5-35B-A3B (modelo base) | 35B-A3B | no disponible | no disponible | no disponible | Checkpoint original sin cuantizar ni editar |
| Qwen3.5 (referencia del paper de MIT CSAIL) | no disponible | no disponible | no disponible | no disponible | Objeto del experimento 8 sobre eliminacion de bucles de razonamiento |

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en HuggingFace en el momento de la ficha; no hay validacion independiente de los resultados publicados por el autor.
- El suite de evaluacion es propio del autor (27 casos) y no incluye benchmarks estandar como MMLU, HumanEval o GSM8K, por lo que la comparabilidad con otros modelos es limitada.
- El baseline se evalua sobre 23 casos en lugar de 27, y la columna de casos generales no OMP se calcula sobre 19; las cifras no son directamente comparables entre todas las filas.
- La edicion de pesos es quirurgica y especifica del checkpoint: no se garantiza que el efecto se transfiera a otras cuantizaciones o a otros modelos, ni que sea estable fuera de los escenarios evaluados.
- La plantilla de chat parcheada modifica el comportamiento por defecto de retencion de `<think>`; puede afectar a flujos que dependen de conservar razonamiento entre turnos.
- Las reglas del directorio `omp-harness/` son especificas de ese harness; los resultados v3-final (25/27) dependen de ellas y no son alcanzables solo con el GGUF (v3-agnostic, 21/27).
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible.
- Idiomas soportados no disponibles; no se recomienda asumir cobertura multilingue mas alla del checkpoint base.
- Licencia MIT permite uso comercial, pero el modelo base ornith-ai/Ornith-1.5-35B-A3B y el checkpoint intermedio tienen licencia no disponible en esta ficha, por lo que conviene verificar sus terminos antes de un despliegue comercial.
- El tamano del repositorio aparece como 0.0 GB pese a que el autor indica un GGUF de aproximadamente 22 GB, lo que sugiere que los archivos pueden no estar subidos o la medicion es incorrecta; verificar la disponibilidad real de los pesos antes de planificar el despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/nitayrabi/Cyber-Tiel-Coder-35B-A3B-LoopFix-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Paper de referencia (MIT CSAIL, Takehi et al., 2026): https://rikiyat.github.io/blog/weight-space-programming/
- Script de generacion de direcciones contrastivas: `reproduce/cvector-generator-v2.cpp`
- Script de aplicacion de la edicion: `reproduce/apply_loopfix.py`
- Plantilla de chat parcheada: `reproduce/patched-chat-template.jinja`
- Prompts contrastivos: `reproduce/contrast-looping-v3.txt` y `reproduce/contrast-productive-v3.txt`
- Suites de evaluacion: `reproduce/suite.json` y `reproduce/holdout.json`
- Reglas especificas del harness: `omp-harness/`
