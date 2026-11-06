# GEHIRNS/magi-1.1-2B

## Resumen

magi-1.1-2B es un modelo de generacion de texto en formato GGUF desarrollado por GEHIRNS, derivado del modelo base Qwen/Qwen3.5-2B mediante un ajuste fino con LoRA y una receta de cuantizacion mixta. El modelo esta disenado para razonamiento (thinking mode) y se distribuye bajo licencia Apache 2.0, con un tamano de repositorio de 0,9 GB y 1.881.825.088 parametros totales. Su propuesta central es la densidad de capacidad: el autor reporta un indice ρ = 1,149, superior al de magi-1.0 (4B) con ρ = 0,903, medido bajo las mismas condiciones.

El modelo resuelve un problema concreto del modelo base cuantizado: bajo decodificacion greedy, el 2B cuantizado tiende a entrar en bucles de repeticion hasta agotar el presupuesto de razonamiento (el autor reporta que el 82% de las trazas de benchmark terminan en bucle). El ajuste fino con 600 trazas de razonamiento cortas y correctas generadas por el propio modelo ensena al modelo a terminar su pensamiento. Sobre esa base se aplica la receta de precision mixta de magi-1.0 con 13 reglas de clases de tensores y una matriz de importancia calculada sobre el 2B.

La relevancia actual del modelo es su perfil de eficiencia: 1,36 GiB de memoria residente a 32K de contexto, lo que lo hace desplegable en GPUs de consumo y en entornos con memoria muy restringida. El propio autor advierte que magi-1.0 (4B) obtiene mejores resultados de precision (66,1% frente a 14,4 puntos menos), por lo que la eleccion depende de si la restriccion es la memoria o la exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (etiqueta `gated-deltanet` en el modelo; detalles completos no disponibles) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32K (medido a 32K en los benchmarks del autor) |
| Tipos de cuantizacion | GGUF con cuantizacion de precision mixta (13 reglas de clases de tensores, matriz de importancia); niveles concretos no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria `gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de 1.881.825.088 parametros. La model card etiqueta el modelo con `gated-deltanet`, lo que sugiere componentes de atencion lineal o estado recurrente en la arquitectura base, aunque no se detalla la composicion exacta de capas ni la proporcion entre atencion y componentes recurrentes. El autor menciona que la medicion de memoria incluye "recurrent state", coherente con esa etiqueta.

El entrenamiento consta de dos etapas. Primero, un ajuste fino con LoRA sobre 600 trazas de razonamiento cortas y correctas generadas por el propio modelo, parte de ellas dirigidas especificamente a los prompts en los que un primer ajuste fino seguia entrando en bucle bajo decodificacion greedy. Segundo, la receta de cuantizacion de precision mixta de magi-1.0 sin cambios: las mismas 13 reglas de clases de tensores y el mismo cuantizador, con una matriz de importancia calculada sobre el 2B. El ajuste fino no altera el tamano del archivo. No se especifica el volumen total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento con modo de pensamiento (thinking mode) y presupuesto de tokens configurable (el autor usa 4.096 tokens en sus evaluaciones).
- Finalizacion controlada del razonamiento: el ajuste fino reduce los bucles de repeticion bajo decodificacion greedy.
- Generacion de codigo, evaluada con ejecucion de tests (EvalPlus para HumanEval+ y MBPP+, y LiveCodeBench).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Despliegue en llama.cpp y Ollama.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.
- Vision o audio: no disponible.

## Casos de uso

- Asistentes conversacionales en ingles con recursos muy limitados: con 1,36 GiB de memoria residente a 32K de contexto, el modelo puede gestionar conversaciones multi-turno largas en GPUs de consumo o en servidores con poca VRAM, donde un 4B cuantizado no cabria con ese contexto.
- Razonamiento con presupuesto acotado: el ajuste fino esta disenado para que el modelo termine su cadena de pensamiento en lugar de repetirse, lo que lo hace adecuado para pipelines que fijan un limite de tokens de razonamiento y necesitan respuestas dentro de ese presupuesto.
- Generacion de codigo con verificacion por tests: el autor evalua HumanEval+ y MBPP+ ejecutando los tests, por lo que el modelo puede integrarse en flujos de generacion de funciones y fragmentos de codigo con validacion automatica.
- Prototipado y evaluacion local en hardware de consumo: al ejecutarse en llama.cpp y Ollama, permite probar recetas de razonamiento y cuantizacion en una unica GPU de 12 GB (el autor uso una RTX 5070) sin infraestructura dedicada.
- Despliegue en entornos de borde o embebidos con memoria restringida: el tamano de 0,9 GB del repositorio y 1,36 GiB en ejecucion a 32K lo hacen viable en dispositivos con presupuesto de memoria ajustado.
- Experimentacion con cuantizacion de precision mixta: sirve como referencia reproducible de la receta magi-1.0 aplicada a un modelo de 2B, util para investigadores que estudien el equilibrio entre tamano, contexto y calidad.

## Benchmarks y rendimiento

Los benchmarks fueron ejecutados por el autor en una RTX 5070 (12 GB) con llama.cpp b11800 (`llama-server`), 2.313 tareas, thinking activado con presupuesto de 4.096 tokens (budget forcing), decodificacion greedy, cache KV q4_0 con flash attention y micro-batch 128. La calificacion de codigo se hizo ejecutando tests (EvalPlus para HumanEval+ y MBPP+, y 150 problemas de LiveCodeBench de concursos entre 2025-01-18 y 2025-04-06). La memoria indicada es el tamano residente que proyecta `llama-fit-params` para 32K de contexto con una secuencia (pesos, cache KV, estado recurrente y buffers de computo, GPU y host, sin contexto CUDA). La densidad de capacidad se define como ρ = −log₂(1 − score) / GiB.

| Benchmark | magi-1.0 (4B), 2,61 GiB | Receta magi-1.0 sobre 2B, 1,36 GiB | magi-1.1-2B, 1,36 GiB |
|---|---|---|---|
| Memoria a 32K (GiB) | 2,61 | 1,36 | 1,36 |
| Puntuacion agregada | 66,1% (referencia del autor) | no disponible | 14,4 puntos por debajo de magi-1.0 (66,1%) |
| Densidad de capacidad (ρ) | 0,903 | 1,071 | 1,149 |

La tabla publicada en la model card no esta completa en la informacion disponible: solo se detallan la memoria y la puntuacion agregada, no los resultados desglosados por benchmark (MMLU, HumanEval+, MBPP+, LiveCodeBench). Esos valores desglosados no estan disponibles.

## Requisitos de hardware

- VRAM estimada: 1,36 GiB de memoria residente a 32K de contexto con una secuencia (pesos, cache KV, estado recurrente y buffers de computo, GPU y host, sin contexto CUDA).
- GPU recomendadas: el autor valido el modelo en una RTX 5070 (12 GB); por el perfil de memoria, cabe en GPUs de consumo con 4-8 GB o mas.
- Cabe en GPU de consumo: si, con margen amplio en tarjetas de 8 GB o superiores.
- Opciones de despliegue: llama.cpp (`llama-server`) y Ollama; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints. Otros motores (vLLM, TGI) no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria a 32K | Puntuacion agregada | Licencia | Formato |
|---|---|---|---|---|---|---|
| magi-1.1-2B | 1,88 B | 32K | 1,36 GiB | 14,4 puntos por debajo de magi-1.0 | Apache 2.0 | GGUF |
| magi-1.0 (4B) | no disponible (4B segun nombre) | no disponible | 2,61 GiB | 66,1% | no disponible | no disponible |
| Receta magi-1.0 sobre 2B | 1,88 B | no disponible | 1,36 GiB | ρ = 1,071 | no disponible | no disponible |
| Qwen/Qwen3.5-2B (base) | 1,88 B | no disponible | no disponible | no disponible | Apache 2.0 | safetensors (formato base habitual) |

Las tres variantes magi comparten protocolo de evaluacion y pueden compararse entre si; la comparacion con el modelo base Qwen3.5-2B no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Precision inferior a magi-1.0: el autor indica explicitamente que magi-1.1-2B esta 14,4 puntos por debajo en la puntuacion agregada y recomienda magi-1.0 si la exactitud es prioritaria.
- Solo ingles: la model card declara unicamente el idioma `en`; el rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de repeticion residual: aunque el ajuste fino reduce los bucles bajo decodificacion greedy, el problema se describe como presente en el modelo base cuantizado y no se garantiza su eliminacion total.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad ni de calibracion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B tiene su propia licencia enlazada en la model card; conviene revisarla antes de un despliegue comercial.
- Formato unico GGUF: no se ofrecen pesos en safetensors para el modelo ajustado, lo que limita el uso en motores que no consuman GGUF.
- Datos de benchmark incompletos: la tabla publicada no detalla resultados por tarea en la informacion disponible.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GEHIRNS/magi-1.1-2B
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Receta magi-1.0: https://huggingface.co/GEHIRNS/magi-1.0
- Licencia del modelo: https://huggingface.co/GEHIRNS/magi-1.1-2B/blob/main/LICENSE
- Perfil de la organizacion GEHIRNS: https://huggingface.co/GEHIRNS
- Listado de modelos de GEHIRNS: https://huggingface.co/GEHIRNS/models
- Sitio web del autor: https://gehirns.pages.dev/
