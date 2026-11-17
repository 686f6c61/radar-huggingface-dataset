# netprojects/SenseNova-Loop-9B-MLX-bf16

## Resumen

SenseNova-Loop-9B es un modelo de lenguaje de ~8.960 millones de parametros desarrollado por SenseNova (SenseTime), construido sobre la arquitectura Qwen3.5 e incorporando dos modificaciones estructurales: ejecucion en bucle (looped execution) y un mecanismo de dos flujos residuales denominado mHC (multi-stream hidden channels). El modelo resuelve tareas de generacion de texto, razonamiento agéntico, codigo y analisis de datos, y resulta relevante por su estrategia de escalado en profundidad efectiva sin aumentar el numero de parametros: los layers 4-27 se ejecutan dos veces con pesos compartidos, alcanzando 56 pasadas de capa por token.

La ficha que nos ocupa documenta la conversion a formato MLX en bfloat16 (sin cuantizar) realizada por NetProjects, pensada para Apple Silicon. Se trata de un port fiel del modelo original, con implementacion propia de la arquitectura en `sensenova_loop.py` y pesos de 17,9 GB. No es un modelo afinado ni una variante: es una conversion de referencia util para generar cuantizaciones propias y para ejecutar el modelo en hardware Apple.

El modelo original soporta una ventana de contexto de 512K tokens mediante YaRN (factor 2 sobre 262.144 posiciones) y se distribuye bajo licencia Apache 2.0. La relevancia actual radica en su enfoque de "loop scaling": segun el estudio de SenseNova, aumentar el numero de bucles (tres o cuatro) mejora resultados en algunas tareas sin incrementar los parametros del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con looped execution y mHC de dos flujos (Gated DeltaNet + atencion completa) |
| Parametros totales | 8.956.947.840 (~8,96B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K tokens (YaRN, factor 2 sobre 262.144 posiciones) |
| Tipos de cuantizacion | bf16 (este repo); 8-bit, 6-bit y 4-bit MLX; GGUF Q8_0, Q6_K, Q4_K_M y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX bf16); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Qwen3.5 con dos innovaciones principales. La primera es la **ejecucion en bucle**: los layers 0-3 se ejecutan una vez, los layers 4-27 se ejecutan dos veces con pesos compartidos y los layers 28-31 se ejecutan una vez, totalizando 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de cache (KV cache para atencion completa, estado convolucional y recurrente para Gated DeltaNet). La segunda es el **mHC de dos flujos** aplicado en los layers 4-27: el estado oculto se divide en dos flujos residuales enrutados por routers en float32 (gates pre/post y una matriz de mezcla 2x2 Sinkhorn con 20 iteraciones). Los 96 tensores de router permanecen en float32 y no se cuantizan.

El contexto largo se consigue mediante YaRN con factor 2 sobre 262.144 posiciones, alcanzando los 512K tokens. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card original de SenseNova menciona un estudio de "loop scaling" en el que tres o cuatro bucles obtienen puntuaciones superiores en algunas tareas, lo que sugiere que el entrenamiento contempla variaciones del numero de bucles.

## Capacidades

- Generacion de texto conversacional y razonamiento general.
- Razonamiento agéntico multi-paso (evaluado en AutomationBench, GAIA y Terminal-Bench 2.1).
- Generacion y comprension de codigo, incluyendo tareas de terminal y reparacion de repositorios (Terminal-Bench, NL2Repo).
- Analisis de datos y consultas sobre bases de datos en lenguaje natural (AIDABench, BIRD).
- Modo thinking conmutable mediante `enable_thinking=True/False` en el chat template.
- Contexto largo de hasta 512K tokens, con capacidad demostrada de recuperar informacion en prompts de 64K tokens (segun pruebas del conversor en la build de 6 bits).
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque las evaluaciones agénticas (AutomationBench, GAIA) implican uso de herramientas.
- Capacidades multilingues: no disponible.

## Casos de uso

- **Agentes autonomos de automatizacion de flujos**: el modelo obtiene 36,67 en AutomationBench, por lo que es adecuado para orquestar tareas multi-paso con llamadas a herramientas en entornos de escritorio o web.
- **Asistente de terminal y operaciones DevOps**: con 59,55 en Terminal-Bench 2.1, puede emplearse para interpretar comandos, diagnosticar errores de shell y ejecutar tareas de mantenimiento en pipelines de CI/CD.
- **Analisis de datos conversacional**: 65,31 en AIDABench y 72,34 en BIRD lo hacen util para traduccion de lenguaje natural a SQL y exploracion de bases de datos relacionales por parte de analistas no tecnicos.
- **Reparacion y navegacion de repositorios de codigo**: 41,36 en NL2Repo permite usarlo en herramientas que localizan ficheros, entienden la estructura de un proyecto y proponen parches.
- **Procesamiento de documentos largos en local**: con 512K tokens de contexto y ejecucion en Apple Silicon via MLX, sirve para resumir o consultar contratos, informes o expedientes extensos sin enviar datos a la nube.
- **Asistente de investigacion con busqueda web**: 69,90 en GAIA lo posiciona para tareas de respuesta a preguntas que requieren recuperacion y sintesis de informacion de multiples fuentes.
- **Generacion de cuantizaciones propias**: al ser una conversion bf16 de referencia, este repo sirve como base para producir versiones 4/6/8-bit con MLX o GGUF para despliegues con menos memoria.

## Benchmarks y rendimiento

Resultados reportados por SenseNova para el modelo original en BF16 (no medidos sobre esta conversion MLX):

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | no disponible |
| GAIA | 69,90 | 37,86 | no disponible |
| AIDABench | 65,31 | no disponible | 65,01 |
| NL2Repo | 41,36 | no disponible | 44,60 |
| BIRD | 72,34 | 71,38 | no disponible |

Ademas, la model card del conversor incluye una tabla de fidelidad respecto al codigo PyTorch original de SenseNova (16 prompts, todas las posiciones):

| Build | Tamano | Mismo token top que el codigo de SenseNova | KL en el ultimo token | Texto greedy identico (16 prompts) |
|---|---|---|---|---|
| 6-bit (recomendado) | 7,3 GB | 96,7% | 0,0056 | 2 / 16 |
| 8-bit | 9,5 GB | 97,6% | 0,0012 | 12 / 16 |
| 4-bit | 5,1 GB | 84,0% | 0,0982 | 2 / 16 |
| bf16 (este repo) | 17,9 GB | 98,6% | 0,0012 | 12 / 16 |

## Requisitos de hardware

- **VRAM/memoria unificada**: la build bf16 ocupa 17,9 GB en disco; en ejecucion requiere aproximadamente esa cantidad mas overhead de cache KV. La build de 6 bits (7,3 GB) es la recomendada por el autor para uso general en Apple Silicon.
- **GPU recomendadas**: el repo esta orientado a Apple Silicon (probado en MacBook Pro M5 Max con 128 GB). Para CUDA, usar la build GGUF con llama.cpp o el modelo original con vLLM/TGI.
- **Consumer GPU**: la version bf16 no cabe en GPUs de 16 GB; las builds de 4 bits (5,1 GB) y 6 bits (7,3 GB) si caben en GPUs consumer tipo RTX 4090 (24 GB) o incluso RTX 4060 Ti (16 GB) usando GGUF.
- **Opciones de despliegue**: `mlx-lm` >= 0.32 con `trust_remote_code=True` y `mlx_lm.server` para Apple Silicon; llama.cpp con los GGUF del repo hermano; vLLM/TGI para el modelo original en CUDA.
- **Latencia y throughput**: no se han publicado cifras de tokens por segundo en la informacion disponible. La ejecucion en bucle (56 pasadas de capa por token) implica un coste computacional superior al de un transformer de 9B convencional, aunque los pesos se compartan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SenseNova-Loop-9B | ~8,96B | 512K (YaRN) | Apache 2.0 | Loop x2 en layers 4-27, mHC de dos flujos |
| SenseNova-Loop-9B-Preview | no disponible | no disponible | no disponible | Version previa; inferior en los siete benchmarks comparados |
| Qwen3.8-27B | 27B (aproximado por nombre) | no disponible | no disponible | Supera al modelo en NL2Repo (44,60 vs 41,36) y empata en AutomationBench y AIDABench |

La comparativa con Qwen3.8-27B es especialmente relevante: pese a triplicar aproximadamente el tamano, el modelo de Qwen solo supera a SenseNova-Loop-9B en uno de los tres benchmarks con datos comunes, lo que respalda la tesis del "loop scaling" como alternativa al escalado en parametros.

## Limitaciones y advertencias

- **Sesgos**: no se ha publicado informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- **Alucinacion**: como todo LLM, puede generar contenido factualmente incorrecto; no hay evaluaciones de factualidad en la informacion disponible.
- **Idiomas**: no se especifican los idiomas soportados; el rendimiento fuera del ingles (y previsiblemente del chino) es desconocido.
- **Fidelidad de la conversion**: incluso en bf16, el port MLX coincide con el token top del codigo original en el 98,6% de las posiciones y solo reproduce texto greedy identico en 12 de 16 prompts. Para produccion que requiera paridad exacta con PyTorch, conviene validar el comportamiento.
- **Coste computacional del bucle**: 56 pasadas de capa por token implican mayor latencia que un transformer de 9B convencional; la ventaja esta en calidad por parametro, no en velocidad.
- **Licencia**: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion. El repo incluye `LICENSE` y `NOTICE`.
- **Soporte de tool calling**: no confirmado explicitamente; validar antes de integrar en pipelines agénticos en produccion.
- **Hardware**: la build bf16 esta pensada para Apple Silicon; en CUDA requiere usar el modelo original o los GGUF.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Modelo base original: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build MLX 6-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build MLX 8-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Build MLX 4-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Build GGUF para llama.cpp: https://huggingface.co/netprojects/SenseNova-Loop-9B-GGUF
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
- Apple MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
