# jrgil/edge-clean-copilot-1.5b-gguf

## Resumen

Edge Clean Copilot es un modelo de lenguaje especializado en refactorización de código TypeScript hacia Clean Architecture y arquitectura hexagonal, distribuido exclusivamente en formato GGUF cuantizado a 4 bits (Q4_K_M). Lo desarrolla el autor independiente Jrgil (Jrgil20) como un ajuste fino LoRA sobre Qwen2.5-Coder-1.5B-Instruct, y está pensado para ejecutarse en hardware de desarrollador (CPU de portátil, sin GPU) con operación completamente offline y sin telemetría.

El problema que aborda es concreto: eliminar dependencias de frameworks e infraestructura (`express`, `mongoose`, `axios`, `typeorm`, `prisma`) de la capa de dominio, generar puertos y adaptadores con inyección de dependencias por constructor, y erradicar el uso de `any` explícito en TypeScript. El modelo no pretende competir con modelos frontera: su propia model card reporta una puntuación de 74,8 sobre 100 en su benchmark interno de Clean Architecture Score (CAS), frente a 90,5 de una referencia en la nube, y lo posiciona explícitamente como asistente de refactorización para artefactos pequeños y acotados.

Es relevante ahora por dos motivos. Primero, por el nicho: los modelos de código generalistas rara vez están alineados con principios arquitectónicos concretos, y este lo está mediante un dataset curado de 138 pares de instrucción en formato ChatML. Segundo, por el despliegue: con 1.543.714.304 parámetros y un peso de 941 MB en disco, cabe en cualquier portátil y permite políticas de "cero filtrado de código" en entornos con requisitos estrictos de confidencialidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-1.5B-Instruct), ajuste fino LoRA |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (configuracion de referencia en llama.cpp/Ollama segun la model card); contexto nativo del modelo base no especificado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | Ingles y espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `clean-copilot-1.5b-q4_k_m.gguf`, 941 MB); no se publican safetensors del adaptador |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1,5B parámetros heredado de Qwen2.5-Coder-1.5B-Instruct, sobre el que se aplicó un ajuste fino con LoRA (PyTorch + `peft`). Los módulos objetivo del adaptador son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, atención y MLP completos. Los hiperparámetros declarados son r=16, alpha=32, dropout 0,05, learning rate 2e-4, optimizador AdamW en `bfloat16`, 3 épocas con batch size 2 y acumulación de gradiente 4. El entrenamiento se realizó sobre NVIDIA DGX Spark (Grace Blackwell GB10 / Ampere A100 según la model card).

El dataset consiste en 138 pares de instrucción curados en formato ChatML, orientados a imponer fronteras de dominio estrictas, objetos de valor con validación de invariantes, puertos y adaptadores, e inyección de dependencias. No se documenta el número de tokens de entrenamiento, la composición detallada del corpus ni si hubo fases de RLHF o DPO; tampoco se mencionan innovaciones de decodificación (decodificación especulativa, atención lineal) más allá de la cuantización Q4_K_M. La evaluación se realizó con un analizador AST del compilador de TypeScript sobre un conjunto de 30 casos legacy, con una ejecución reproducible registrada en `evaluation/reports/spark-20261105T143540Z`.

## Capacidades

- Refactorización de TypeScript/JavaScript legacy hacia Clean Architecture y arquitectura hexagonal.
- Aislamiento de la capa de dominio: elimina el 100% de imports prohibidos de frameworks y bases de datos (`express`, `mongoose`, `axios`, `typeorm`, `prisma`) según la métrica del autor.
- Generación de puertos y adaptadores: produce interfaces abstractas (`IRepository`, `IPort`, `IGateway`) con inyección de dependencias por constructor.
- Rigor de tipos en TypeScript: eliminación de `any` explícito y tipado determinista.
- Patrón Result e invariantes de dominio (la dimensión con peor puntuación del benchmark, 2,7 sobre 25, lo que indica una capacidad limitada en la práctica).
- Generación de texto conversacional multi-turno en formato ChatML (roles system/user/assistant).
- Capacidades multilingües limitadas a inglés y español.
- No se documentan tool calling, function calling, uso como agente, modo thinking, visión ni audio en la información disponible.

## Casos de uso

- Refactorización local de entidades y servicios TypeScript: el desarrollador pega una clase con imports de `express` o `mongoose` y el modelo devuelve una versión con dominio aislado, puertos definidos e inyección de dependencias. Adecuado porque el modelo está entrenado específicamente para ese patrón y cabe en RAM (~1,5 GB).
- Cumplimiento de políticas de confidencialidad: en entornos con código propietario que no puede salir de la máquina, el modelo se ejecuta en CPU con `llama-server` en `127.0.0.1` sin telemetría ni llamadas externas.
- Pre-revisión en pipelines de CI/CD: integración de `llama-cpp-python` como paso de linting arquitectónico que marca imports de infraestructura en la capa de dominio antes de fusionar un pull request. Limitado por el throughput (~12 tok/s en CPU), por lo que conviene restringirlo a artefactos pequeños.
- Formación y mentoría interna: generar ejemplos de refactorización hexagonal a partir de código legacy del propio equipo, con revisión humana obligatoria dado el riesgo de alucinación.
- Prototipado en portátiles sin GPU: con 941 MB en disco y ~1,5 GB de RAM, es viable en equipos de gama media-baja mediante Ollama o llama.cpp, sin dependencia de servicios en la nube ni coste por token.
- Estandarización de plantillas de arquitectura: uso como generador de esqueletos de puertos, adaptadores y objetos de valor para nuevos módulos, siempre con validación posterior por el compilador de TypeScript.

## Benchmarks y rendimiento

Resultados del benchmark interno del autor (30 casos legacy, analizador AST de TypeScript, cuantización Q4_K_M idéntica en todas las ejecuciones):

| Dimension arquitectonica | Maximo | Base Qwen 1.5B Q4_K_M | Edge Clean Copilot Q4_K_M | Referencia frontera en nube |
|---|---:|---:|---:|---:|
| Aislamiento de frontera de dominio | 30 | 24,0 | 30,0 | 29,0 |
| Patron Invariant & Result | 25 | 0,3 | 2,7 | 22,5 |
| Desacoplamiento puertos/adaptadores | 25 | 15,8 | 22,5 | 23,0 |
| Rigor de tipos TypeScript (cero `any`) | 20 | 17,8 | 19,7 | 16,0 |
| **CAS compuesto** | **100** | **58,0** | **74,8 (grado B)** | **90,5** |

Metricas operativas declaradas:

| Metrica | Base 1.5B F16 | Edge Clean Copilot Q4_K_M | API frontera en nube |
|---|---:|---:|---:|
| Velocidad de inferencia | ~52,0 tok/s (no verificado) | ~12 tok/s medido en CPU (Intel i5-10310U) | ~85,0 tok/s (no verificado) |
| Huella de RAM | ~3,1 GB | ~1,5 GB | 0 GB (nube) |
| Tamano en disco | ~3,10 GB | 941 MB | 0 MB |
| Operacion offline | Si | Si (air-gapped) | No |
| Coste de API | 0,00 USD | 0,00 USD | Facturacion por uso |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras de la columna "referencia frontera" corresponden a una referencia en la nube no identificada por el autor.

## Requisitos de hardware

- VRAM/RAM para inferencia: ~1,5 GB de RAM con Q4_K_M; no requiere GPU.
- GPU recomendadas: no aplica para el caso de uso previsto; la model card cita una ejecucion de evaluacion en NVIDIA DGX Spark (Grace Blackwell GB10 / Ampere A100).
- GPU de consumo: cabe holgadamente en cualquier GPU consumer (RTX 3060 12 GB, RTX 4090, etc.), aunque el modelo esta optimizado para CPU.
- CPU de referencia medida: Intel Core i5-10310U con 15 GB de RAM, ~12 tok/s.
- Opciones de despliegue: `llama-server` (servidor compatible con la API de OpenAI en el puerto 8085), `llama.cpp`, Ollama (mediante `Modelfile` con plantilla ChatML), `llama-cpp-python`.
- Contexto de ejecucion recomendado: `-c 2048` y `temperature 0.1` con stop tokens `<|im_end|>` y `<|endoftext|>`.
- Latencia y throughput: ~12 tok/s en CPU segun el autor; el modelo se declara explicitamente "no optimizado para velocidad" y las entradas largas resultan lentas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---:|---|---|---|---|
| Edge Clean Copilot 1.5B | 1,5B | 2048 (config. de referencia) | Refactorizacion Clean/Hexagonal en TypeScript | Apache 2.0 | GGUF Q4_K_M |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | No especificado en la informacion disponible | Codigo generalista e instrucciones | Apache 2.0 | safetensors, GGUF (multples) |
| Referencia frontera en nube (no identificada) | no disponible | no disponible | Codigo generalista | no disponible | API |

Frente al modelo base, el ajuste aporta +16,8 puntos de CAS (58,0 a 74,8), con la mayor ganancia en aislamiento de dominio (24,0 a 30,0) y desacoplamiento de puertos (15,8 a 22,5), y una mejora marginal en rigor de tipos (17,8 a 19,7). Frente a la referencia frontera, la brecha de 15,7 puntos se concentra casi por completo en el patron Invariant & Result (2,7 frente a 22,5). No se dispone de comparaciones con otros modelos especializados en arquitectura de software en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad muy por debajo de modelos frontera: CAS de 74,8 frente a 90,5; la model card exige revisar cada salida antes de usarla.
- Punto debil critico: el patron Invariant & Result obtiene 2,7 sobre 25, por lo que no debe confiarse en el modelo para generar validacion de invariantes o tipos Result correctos.
- Riesgo de alucinacion en APIs, nombres de tipos y firmas de interfaces generadas; requiere compilacion y tests posteriores.
- Dataset de entrenamiento muy pequeno (138 pares de instruccion), lo que limita la generalizacion a patrones no vistos y aumenta el sobreajuste al estilo del corpus.
- Velocidad reducida (~12 tok/s en CPU) y contexto de referencia de solo 2048 tokens; las entradas largas son lentas y pueden truncarse.
- Solo ingles y espanol; sin soporte documentado de otros idiomas, tool calling, agentes o vision.
- Un unico fichero GGUF Q4_K_M publicado: no hay variantes F16, Q8 ni adaptadores safetensors para reajuste o evaluacion en precision completa.
- Licencia Apache 2.0 permisiva para uso comercial, pero el modelo base Qwen2.5-Coder-1.5B-Instruct debe verificarse por separado; el autor no documenta obligaciones adicionales.
- Las cifras de la columna "referencia frontera" y la velocidad del modelo base estan marcadas como no verificadas por el propio autor; tratalas con cautela.
- Proyecto de autor individual con 211 descargas y 1 like en el momento de la consulta: sin garantias de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrgil/edge-clean-copilot-1.5b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- PEFT (Hugging Face): https://github.com/huggingface/peft
