# LucasBRT/smart-commit-0.5b-v0.1

## Resumen

pionus-0.5b-v0.1 es un ajuste fino (fine-tune) de Qwen2.5-Coder-0.5B-Instruct especializado en una unica tarea: generar mensajes de commit de git que imiten el estilo del repositorio en el que se trabaja. Lo desarrolla LucasBRT como componente del CLI pionus, una herramienta que ejecuta un modelo pequeno de forma local (NPU de Intel, GPU o CPU) para automatizar la redaccion de commits. El modelo no pretende ser un asistente generalista: esta entrenado sobre el prompt exacto de pionus, de modo que fuera de ese formato su comportamiento no esta validado.

La relevancia practica esta en su tamano: con 494.032.768 parametros (0,5B) y una cuantizacion Q4_K_M de solo 398 MB, cabe en hardware muy modesto, incluidos iGPU y NPU, y procesa los 500 commits del conjunto de evaluacion en 324 segundos sobre una Intel Arc iGPU (Core Ultra 5 225H), reintentos incluidos. Frente al modelo base, mejora de forma muy notable en las metricas especificas de la tarea: type_match pasa de 0,168 a 0,640, first_try de 0,392 a 0,980 y fallback baja de 0,400 a 0,012.

Arquitectura transformer decoder-only heredada de Qwen2.5-Coder, licencia Apache-2.0 y pesos en safetensors (bf16) y GGUF. Es la version 0.1 de la familia pionus, publicada mientras la receta de entrenamiento sigue cambiando; el autor mantiene ademas una variante de 1,5B con mejor fidelidad a los mensajes reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, base Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-Coder-0.5B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | bf16 (safetensors) y Q4_K_M (GGUF, 398 MB) |
| Idiomas soportados | ingles unicamente (datos de entrenamiento en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionado) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only de la familia Qwen2, y se ajusta mediante QLoRA: LoRA con r=16, alpha=32, dropout 0.05 aplicado a todas las capas lineales, learning rate 2e-4 con decaimiento coseno, warmup del 3%, batch efectivo de 4 x 4, una epoca y semilla 0, con la perdida calculada solo sobre la respuesta. El entrenamiento se ejecuto sobre la base cuantizada en 4 bits NF4 con computo en fp16 en una Kaggle Tesla T4 durante 147 minutos, con torch 2.11.0, transformers 5.20.1 y peft 0.21.2. Posteriormente los adaptadores se fusionaron en la base bf16 y se cuantizaron a Q4_K_M con llama.cpp b11381.

Los datos son 39.985 commits del split de entrenamiento de CommitChronicle (JetBrains Research, revision 5fd076e), cada uno con al menos 10 asuntos de commit previos de su repositorio. Los prompts los construye el propio pionus: un system prompt con reglas (asunto de 72 columnas como maximo, modo imperativo, Conventional Commits cuando el repositorio los usa) y un user prompt con los ficheros modificados, el diff compactado y hasta 5 asuntos recientes. El objetivo es el asunto real del commit. La innovacion principal no es arquitectonica sino de diseno de datos: entrenar byte a byte sobre el prompt de produccion y condicionar en el estilo historico del repositorio.

## Capacidades

- Generacion de mensajes de commit de git en ingles a partir de un diff y de la lista de ficheros modificados.
- Adopcion del estilo del repositorio: usa Conventional Commits (tipo y scope) cuando el historial reciente lo hace, con type_match de 0,640 en evaluacion.
- Condicionamiento por historial: incorpora hasta 5 asuntos de commit previos del repositorio en el prompt.
- Generacion de asunto con restriccion de longitud (72 columnas) y modo imperativo, segun las reglas del system prompt.
- Inferencia local en hardware de consumo: CPU, GPU Vulkan y, mediante exportacion a OpenVINO, NPU e iGPU de Intel (exportacion aun no validada para este modelo).
- No dispone de tool calling, function calling, modo thinking, vision ni audio documentados.
- Multilingue: no; solo ingles.

## Casos de uso

- Automatizacion de commits en el flujo diario de git: integrado en el CLI pionus, el modelo lee el diff en stage y propone un asunto de commit en el estilo del repositorio, reduciendo el tiempo de redaccion en equipos con convenciones estrictas.
- Estandarizacion de Conventional Commits en equipos: al condicionarse sobre los asuntos recientes, mantiene tipos y scopes ya usados por el repositorio, lo que ayuda a mantener un historial coherente y facilita herramientas de changelog y versionado semantico.
- Entornos sin conectividad o con requisitos de privacidad: al ejecutarse en local con un GGUF de 398 MB, el codigo y los diffs no salen de la maquina, lo que encaja en entornos con codigo propietario o regulado.
- Hardware limitado o portatil: su tamano permite ejecutarlo en CPU, iGPU Vulkan o NPU Intel, sin GPU dedicada, con un coste de 324 s para 500 commits en una Core Ultra 5 225H (aproximadamente 0,65 s por commit con reintentos).
- Integracion en pipelines de CI o hooks de pre-commit: puede usarse para validar o sugerir mensajes antes de aceptar un commit, o para generar mensajes en commits automaticos de herramientas (dependencias, formateo).
- Generacion de mensajes en repositorios jovenes con historial escaso: funciona, aunque con mayor tasa de fallback (0,091 en eval-short), por lo que conviene combinarlo con la estrategia de fallback a lista de ficheros que ya implementa pionus.
- Prototipado e investigacion sobre modelos pequenos especializados: sirve como referencia reproducible de QLoRA sobre 40k ejemplos con receta, scripts y curvas de aprendizaje publicadas.

## Benchmarks y rendimiento

Evaluacion del autor sobre eval-v1 (500 commits del split de test de CommitChronicle, repositorios no vistos en entrenamiento; 250 con Conventional Commits y 250 de forma libre) y eval-short (197 commits de repositorios jovenes con 1-5 asuntos previos). Decodificacion greedy, pionus en db389c2, Vulkan, con reintentos y fallback a lista de ficheros.

| Modelo | type_match | scope_known | first_try | fallback | word_f1 | word_f1 (free) | fallback (young repos) |
|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct, Q4_K_M original | 0,168 | 0,756 | 0,392 | 0,400 | 0,133 | 0,101 | 0,345 |
| Mismo modelo, recuantizado como este (control) | 0,236 | 0,880 | 0,424 | 0,512 | 0,153 | 0,098 | 0,386 |
| pionus-0.5b-v0.1 | 0,640 | 0,856 | 0,980 | 0,012 | 0,342 | 0,233 | 0,091 |

Notas sobre las metricas: type_match mide coincidencia del tipo Conventional Commits con el commit real (responder siempre "fix" daria 0,41); scope_known indica que no hay scope o que ya se uso en el repositorio; first_try indica que la primera respuesta fue utilizable; fallback indica que ninguna lo fue y pionus redacto desde la lista de ficheros; word_f1 es solapamiento de palabras con el asunto real. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano, la version Q4_K_M (398 MB) requiere menos de 1 GB de memoria y la bf16 (aproximadamente 1 GB de pesos) alrededor de 1-2 GB.
- GPU recomendadas: no requiere GPU dedicada; el autor lo ejecuta en GPU Vulkan (Intel Arc iGPU, Core Ultra 5 225H) y en CPU. Para exportacion OpenVINO, NPU e iGPU Intel.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 1-2 GB de memoria libre; tambien en CPU e iGPU.
- Opciones de despliegue: llama.cpp (formato GGUF Q4_K_M), CLI pionus (dispositivos llama.cpp: CPU y GPU Vulkan), exportacion a OpenVINO para NPU/GPU Intel mediante los scripts de pionus (no validada para este modelo). vLLM, TGI u Ollama no estan documentados en la informacion disponible.
- Latencia y throughput: 324 s para 500 commits de eval-v1 en Intel Arc iGPU (Core Ultra 5 225H), reintentos incluidos, es decir, aproximadamente 0,65 s por commit en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pionus-0.5b-v0.1 | 494 M | no disponible | Mensajes de commit, estilo del repositorio | Apache-2.0 | Hugging Face (safetensors + GGUF) |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | no disponible | Asistente general de codigo | Apache-2.0 | Hugging Face |
| pionus-1.5b-v0.1 | 1,5B (no confirmado en la informacion) | no disponible | Mensajes de commit, misma familia | no disponible en la informacion | Hugging Face |

Frente al modelo base, pionus-0.5b-v0.1 es claramente superior en la tarea especifica (type_match 0,640 frente a 0,168; first_try 0,980 frente a 0,392), pero no es un sustituto generalista: solo genera mensajes de commit en el formato de prompt de pionus. La variante de 1,5B de la misma familia escribe mensajes mas cercanos a los reales y recurre menos al fallback en repositorios jovenes, a cambio de mas recursos.

## Limitaciones y advertencias

- Solo genera mensajes en ingles; el entrenamiento y los datos son en ingles.
- Repositorios jovenes: con menos de 10 commits previos puede repetir o parafrasear un asunto anterior, o producir una respuesta inutilizable (tasa de fallback de 0,091 en eval-short).
- Alucinacion: puede inventar detalles que el diff no muestra, como un numero de version o el proposito de un fichero.
- No detecta cuando los cambios en stage corresponden a varios commits distintos.
- Entrenado con prompts sin el mapa de scopes que pionus anadio despues; con ese mapa en el prompt no se reevaluo sobre eval-v1, por lo que el rendimiento en ese formato no esta medido.
- Solo esta validado con el prompt exacto de pionus; otros prompts no han sido probados.
- Licencia Apache-2.0 para los pesos, pero los datos de entrenamiento provienen de CommitChronicle, que agrega commits de repositorios con licencias MIT, Apache-2.0 y BSD-3-Clause y exige respetar sus terminos y atribucion; el dataset registra repositorio y licencia de cada commit como procedencia.
- El entrenamiento en GPU no es reproducible bit a bit (la generacion greedy si lo es).
- Version 0.1: la receta de entrenamiento sigue en cambio, por lo que la API y el comportamiento pueden variar en versiones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LucasBRT/smart-commit-0.5b-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Repositorio pionus: https://github.com/Lucas-BRT/pionus
- Scripts y receta de entrenamiento: https://github.com/Lucas-BRT/pionus/tree/training/training
- Hipotesis y curva de aprendizaje: https://github.com/Lucas-BRT/pionus/blob/training/training/HYPOTHESES.md
- Documentacion de evaluacion (eval-v1): https://github.com/Lucas-BRT/pionus/blob/training/training/README.md
- Dataset CommitChronicle: https://huggingface.co/datasets/JetBrains-Research/commit-chronicle
- Variante de 1,5B: https://huggingface.co/LucasBRT/pionus-1.5b-v0.1
