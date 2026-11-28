# LucasBRT/smart-commit-1.5b-v0.1

## Resumen

pionus-1.5b-v0.1 es un ajuste fino (fine-tune) de Qwen2.5-Coder-1.5B-Instruct especializado en la generacion automatica de mensajes de commit de git. Lo desarrolla LucasBRT como componente del CLI pionus, una herramienta que ejecuta un modelo pequeno en local (NPU de Intel, GPU o CPU) para redactar mensajes de commit que imiten el estilo del repositorio. El modelo se entrena con el propio prompt de pionus, byte a byte, de modo que su comportamiento esta acoplado a esa herramienta y no a un uso generico.

El problema que resuelve es concreto: los modelos generalistas tienden a producir mensajes de commit genericos (por ejemplo, responden "fix" a la mayoria de cambios) y no respetan las convenciones del repositorio, como Conventional Commits o la longitud maxima del asunto. Este ajuste mejora la coincidencia de tipo (type_match de 0,456 a 0,644) y de scope (0,580 a 0,852) frente al modelo base en el benchmark eval-v1 del autor.

Tecnicamente es un transformer decoder-only denso de 1.543.714.304 parametros (1,5B), derivado de la familia Qwen2, con contexto heredado del modelo base (no especificado en la informacion disponible). Se distribuye en safetensors bf16 y en GGUF Q4_K_M (986 MB), bajo licencia Apache-2.0, con soporte exclusivo de ingles. Es relevante porque ejemplifica el patron de modelos ultraespecializados y pequenos que se ejecutan en hardware de consumo, con evaluacion publicada y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors); Q4_K_M (GGUF); export a OpenVINO previsto pero no validado |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only denso de la familia Qwen2. El ajuste se realiza mediante LoRA con r=16, alpha=32 y dropout 0,05 sobre todas las capas lineales, con lr 2e-4, scheduler coseno, warmup del 3%, batch 4 x 4, una epoca y semilla 0, calculando la perdida solo sobre la respuesta. Se emplea QLoRA con base cuantizada en 4 bits NF4 y computo en fp16 sobre una Tesla T4 de Kaggle, con un tiempo de entrenamiento de 394 minutos. El entorno registrado es torch 2.11.0, transformers 5.20.1 y peft 0.21.2.

Los datos de entrenamiento son 39.985 commits del split de train de CommitChronicle (JetBrains Research, revision 5fd076e), cada uno con al menos 10 asuntos (subjects) previos de su repositorio. Los prompts los construye el propio pionus: un system prompt con las reglas (asunto de 72 columnas como maximo, modo imperativo, Conventional Commits cuando el repositorio los usa) y un user prompt con los ficheros cambiados, el diff compactado y hasta 5 asuntos recientes. El objetivo es el asunto real del commit. Tras el entrenamiento, los pesos se fusionan en la base bf16 y se cuantizan a Q4_K_M con llama.cpp b11381. El entrenamiento en GPU no es reproducible bit a bit, pero la generacion con decodificacion greedy si lo es.

## Capacidades

- Generacion de mensajes de commit de git en ingles, siguiendo el estilo del repositorio.
- Adherencia a Conventional Commits (tipo y scope) cuando el repositorio los utiliza.
- Respeto de la restriccion de 72 columnas en el asunto y del modo imperativo.
- Uso de hasta 5 asuntos recientes del repositorio como contexto de estilo.
- Procesamiento de listas de ficheros cambiados y de diffs compactados.
- Generacion de texto conversacional (pipeline text-generation), aunque el ajuste esta orientado al prompt especifico de pionus.
- No dispone de tool calling, capacidades de agente, vision ni audio segun la informacion disponible.
- Capacidad multilingue limitada al ingles (los datos de entrenamiento son en ingles).

## Casos de uso

- Generacion automatica de mensajes de commit en el CLI pionus: el modelo se invoca con el prompt exacto de la herramienta y escribe el asunto del commit a partir del diff preparado, ejecutandose en local sobre CPU, GPU Vulkan o NPU de Intel.
- Integracion en hooks de pre-commit: se puede llamar al modelo desde un hook para proponer un mensaje antes de confirmar el commit, con un coste de inferencia bajo gracias a la cuantizacion Q4_K_M de 986 MB.
- Homogeneizacion del estilo de commits en equipos: al condicionar la generacion con los asuntos recientes del repositorio, el modelo replica las convenciones existentes (idioma, prefijos, longitud) y reduce la variabilidad entre desarrolladores.
- Repositorios que adoptan Conventional Commits: el modelo alcanza un type_match de 0,644 y un scope_known de 0,852 en eval-v1, lo que lo hace util para proyectos que exigen tipo y scope validos en cada commit.
- Ejecucion en hardware de consumo o portatiles: con el GGUF Q4_K_M cabe en equipos sin GPU dedicada; el autor reporta 795 s para 500 commits en una iGPU Intel Arc (Core Ultra 5 225H) con reintentos incluidos.
- Entornos con requisitos de privacidad: al ejecutarse en local mediante llama.cpp, el diff y el codigo no salen de la maquina, lo que encaja en organizaciones que no pueden enviar codigo a APIs externas.
- Prototipado de asistentes de git especializados: sirve como referencia para quien quiera construir herramientas similares, ya que el autor publica la receta de entrenamiento, la seleccion de datos y los scripts.

## Benchmarks y rendimiento

Evaluacion eval-v1 del autor: 500 commits del split de test de CommitChronicle (repositorios no vistos en entrenamiento), 250 con Conventional Commits y 250 de forma libre; eval-short: 197 commits de repositorios jovenes (1 a 5 asuntos previos). Decodificacion greedy, pionus en el commit db389c2, Vulkan, con reintentos y fallback a la lista de ficheros.

| Modelo | type_match | scope_known | first_try | fallback | word_f1 | word_f1 (free) | fallback (repos jovenes) |
|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct, Q4_K_M original | 0,456 | 0,580 | 0,908 | 0,068 | 0,245 | 0,143 | 0,102 |
| Mismo modelo, recuantizado como este (control) | 0,408 | 0,516 | 0,928 | 0,004 | 0,245 | 0,139 | 0,051 |
| pionus-1.5b-v0.1 | 0,644 | 0,852 | 0,948 | 0,016 | 0,362 | 0,257 | 0,030 |

Notas del autor: type_match mide si el tipo Conventional coincide con el commit real (responder siempre "fix" puntuaria 0,41); scope_known mide si no hay scope o si es uno ya usado por el repositorio; first_try indica que la primera respuesta fue utilizable; fallback indica que ninguna lo fue y pionus escribio el mensaje desde la lista de ficheros; word_f1 es la superposicion de palabras con el asunto real. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,1 GB en bf16 (1,5B parametros) y en torno a 1 GB con el GGUF Q4_K_M (986 MB en disco).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; para Q4_K_M basta con una GPU integrada o una consumer de gama baja. El autor ha validado Vulkan y OpenVINO (NPU y GPU de Intel); el entrenamiento se hizo en una Tesla T4.
- Cabe en GPU de consumo: si, incluidas iGPU (se reporta ejecucion en Intel Arc iGPU de Core Ultra 5 225H) y CPU.
- Opciones de despliegue: llama.cpp (validado, formato GGUF), pionus como CLI, y exportacion a OpenVINO para NPU/GPU de Intel mediante los scripts de pionus (exportacion no validada para este modelo). vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: 795 s para 500 commits de eval-v1 en una iGPU Intel Arc (Core Ultra 5 225H), reintentos incluidos; equivale a unos 1,6 s por commit en ese hardware. El autor indica que la version de 0,5B es aproximadamente 2,5 veces mas rapida con rendimiento similar en tipo y scope.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pionus-1.5b-v0.1 | 1,5B | no disponible | Mensajes de commit (fine-tune de Qwen2.5-Coder-1.5B-Instruct) | Apache-2.0 | Hugging Face (safetensors y GGUF) |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | no disponible en la informacion proporcionada | Modelo generalista de codigo e instrucciones | Apache-2.0 | Hugging Face |
| pionus-0.5b-v0.1 | 0,5B | no disponible | Mensajes de commit; segun el autor, iguala en tipo y scope a la version de 1,5B a unas 2,5 veces la velocidad | no disponible en la informacion proporcionada | Hugging Face |

En rendimiento sobre eval-v1, pionus-1.5b-v0.1 supera al modelo base en type_match (0,644 frente a 0,456), scope_known (0,852 frente a 0,580) y word_f1 (0,362 frente a 0,245), con un first_try ligeramente superior (0,948 frente a 0,908). El fallback en repositorios jovenes es menor (0,030 frente a 0,102), lo que indica menos respuestas inutilizables en ese escenario.

## Limitaciones y advertencias

- Solo genera mensajes en ingles; los datos de entrenamiento son en ingles.
- Repositorios jovenes: con menos de 10 commits previos a veces repite o parafrasea uno de ellos, o produce una respuesta inutilizable (fallback de 0,030 en eval-short).
- Puede inventar detalles que el diff no muestra, como un numero de version o el proposito de un fichero.
- No detecta cuando los cambios en staging corresponden a varios commits.
- Entrenado con prompts sin el mapa de uso de scopes que pionus anadio despues; con ese mapa en el prompt no se reevaluo en eval-v1.
- Otros prompts distintos del de pionus no estan probados; el comportamiento fuera de esa herramienta es incierto.
- La exportacion a OpenVINO (NPU y GPU de Intel) no esta validada para este modelo.
- Licencia Apache-2.0 para los pesos, pero los datos de entrenamiento (CommitChronicle) agregan commits de repositorios con licencias MIT, Apache-2.0 y BSD-3-Clause; el autor pide respetar sus terminos, incluida la atribucion. El dataset registra repositorio y licencia de cada commit como procedencia.
- Riesgo de sesgo y alucinacion propio de un modelo de 1,5B ajustado con un unico dataset; no se documentan evaluaciones de sesgo.
- Version 0.1: la receta de entrenamiento sigue cambiando, por lo que el modelo puede quedar obsoleto respecto a versiones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LucasBRT/smart-commit-1.5b-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio pionus: https://github.com/Lucas-BRT/pionus
- Scripts y receta de entrenamiento: https://github.com/Lucas-BRT/pionus/tree/training/training
- Metodologia e hipotesis (H3): https://github.com/Lucas-BRT/pionus/blob/training/training/HYPOTHESES.md
- Evaluacion eval-v1: https://github.com/Lucas-BRT/pionus/blob/training/training/README.md
- Dataset CommitChronicle: https://huggingface.co/datasets/JetBrains-Research/commit-chronicle
- Version de 0,5B: https://huggingface.co/LucasBRT/pionus-0.5b-v0.1
