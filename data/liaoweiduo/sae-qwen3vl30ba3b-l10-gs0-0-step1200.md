# liaoweiduo/sae-qwen3vl30ba3b-l10-gs0.0-step1200

## Resumen

Este repositorio contiene un sparse autoencoder (SAE) de tipo TopK entrenado sobre la proyeccion descendente del MLP de la capa 10 de Qwen/Qwen3-VL-30B-A3B-Instruct. No es un modelo de lenguaje: es un adaptador de interpretabilidad que descompone las activaciones del modelo base en 65.536 caracteristicas dispersas, con un presupuesto de 256 caracteristicas activas por token (top-k = 256). Lo publica el usuario liaoweiduo y el repositorio ocupa 0,5 GB.

El artefacto se distribuye en safetensors con el layout de claves PEFT TopK_SAE, acompanado de un adapter_config.json que fija el modelo base, el modulo objetivo (model.layers.10.mlp.down_proj) y los hiperparametros del SAE. El checkpoint corresponde al paso 1200 de entrenamiento con ajuste de penalizacion de dispersion gs=0.0. El ancho de entrada del diccionario es 2.048, que coincide con la dimension de salida de ese down_proj en la arquitectura del modelo base.

Su relevancia es doble. Por un lado, permite inspeccionar y anotar caracteristicas interpretables en un modelo multimodal grande y disperso (MoE) como Qwen3-VL-30B-A3B, del que existen pocos SAE publicos. Por otro, se acompana de un JSON con explicaciones completas de las caracteristicas, lo que reduce el coste de exploracion sin necesidad de reentrenar el diccionario. El repositorio no declara licencia ni idiomas soportados y no incluye metricas de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE) de tipo TopK; no es un transformer |
| Parametros totales | No declarado en la model card; estimacion de ~268 M a partir de las dimensiones (2 x 65.536 x 2.048), coherente con los 0,5 GB del repo en precision de 16 bits |
| Parametros activos | No aplica: el SAE no es MoE. El modelo base, Qwen3-VL-30B-A3B-Instruct, es MoE con ~30.000 M de parametros totales y ~3.000 M activos |
| Longitud de contexto | No aplica al SAE; no disponible para el modelo base en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors con precision no declarada |
| Idiomas soportados | No disponible |
| Licencia | No disponible; el repositorio no declara licencia |
| Formato de pesos | safetensors (adapter_model.safetensors, layout de claves PEFT TopK_SAE) |

Configuracion declarada del SAE:

| Parametro | Valor |
|---|---|
| Tipo de SAE | TopK |
| Top-k | 256 |
| Tamano de diccionario | 65.536 caracteristicas |
| Ancho de entrada | 2.048 |
| Modulo objetivo | model.layers.10.mlp.down_proj |
| Checkpoint de entrenamiento | paso 1200 |
| Penalizacion de dispersion | gs = 0.0 |
| Modelo base | Qwen/Qwen3-VL-30B-A3B-Instruct |
| Ficheros | adapter_model.safetensors, adapter_config.json, JSON de explicaciones |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-12 |

## Arquitectura y entrenamiento

El artefacto es un sparse autoencoder con activacion TopK: un encoder lineal que proyecta activaciones de anchura 2.048 a un espacio latente sobredimensionado de 65.536 caracteristicas, y un decoder que reconstruye la activacion original. La restriccion TopK fuerza que solo 256 caracteristicas esten activas por token, lo que induce dispersión y favorece la interpretabilidad de cada unidad. El modulo intervenido es la proyeccion descendente del MLP de la capa 10, un punto intermedio del modelo base donde las representaciones ya han integrado informacion de capas anteriores.

El checkpoint publicado corresponde al paso 1200 con un ajuste de penalizacion de dispersion gs=0.0, es decir, sin termino adicional de esparsidad mas alla de la restriccion TopK. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO: esos datos no estan disponibles. Tampoco se declaran metricas de reconstruccion, L0 efectivo ni numero de caracteristicas muertas. El repositorio incluye un JSON con explicaciones de caracteristicas generadas para este checkpoint concreto, lo que constituye el principal valor anadido frente a un SAE sin anotaciones.

Es importante subrayar que este adaptador no es un checkpoint autonomo de Transformers: requiere la implementacion personalizada TOPK_SAE y el modelo base para poder ejecutarse.

## Capacidades

- Descomposicion de activaciones: proyecta las activaciones del down_proj de la capa 10 de Qwen3-VL-30B-A3B-Instruct en 65.536 caracteristicas con un presupuesto de 256 activas por token.
- Analisis de interpretabilidad: permite estudiar que caracteristicas se activan ante estimulos concretos, incluyendo estimulos multimodales, dado que el modelo base procesa texto e imagen.
- Anotacion semantica de caracteristicas: el JSON de explicaciones asociado describe el significado de cada feature, lo que habilita busquedas por concepto.
- Steering de activaciones: las direcciones del decoder pueden emplearse para intervenir sobre las activaciones y modular el comportamiento del modelo base.
- Comparacion entre checkpoints y capas: al estar etiquetado con capa, paso de entrenamiento y ajuste de dispersion, es posible contrastarlo con otros SAE del mismo autor o de la misma familia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio por si mismo: esas capacidades pertenecen al modelo base, no al SAE.
- Capacidades multilingues: no disponibles.
- No se documentan capacidades especiales adicionales (thinking mode, audio, etc.).

## Casos de uso

- Analisis de circuitos en modelos multimodales: capturar activaciones en la capa 10 durante la presentacion de imagenes con texto y estudiar que caracteristicas responden a objetos, colores o relaciones espaciales, aprovechando que el modulo objetivo es el down_proj del MLP.
- Auditoria de seguridad: identificar caracteristicas asociadas a contenido toxico, sesgado o a memorizacion de datos sensibles, y monitorizar su activacion en produccion como senal de alerta temprana.
- Feature steering para control de sesgos: usar las direcciones del decoder para atenuar o amplificar caracteristicas concretas durante la inferencia y medir el efecto en las respuestas del modelo base.
- Depuracion de alucinaciones en tareas visuales: correlacionar activaciones de caracteristicas especificas con respuestas incorrectas ante imagenes ambiguas, para localizar que representaciones internas fallan.
- Investigacion mecanicista comparada: contrastar este SAE (paso 1200, gs=0.0) con variantes en otros pasos o ajustes de dispersion para estudiar como evoluciona la estructura de caracteristicas durante el entrenamiento del SAE.
- Curación de datasets guiada por caracteristicas: filtrar o etiquetar conjuntos de imagenes y texto segun las caracteristicas que activan en la capa 10, util para construir subconjuntos con propiedades controladas.
- Construccion de exploradores de caracteristicas: integrar el JSON de explicaciones en una interfaz tipo SAE explorer para que investigadores sin experiencia previa naveguen por las 65.536 features y sus ejemplos activadores.
- Docencia en interpretabilidad: usar un SAE pequeno (0,5 GB) sobre un modelo MoE de 30.000 M de parametros como caso practico para explicar dispersión, monosemanticidad y evaluacion de diccionarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de evaluacion tipicas de un SAE (error de reconstruccion, L0 efectivo, varianza explicada, proporcion de caracteristicas muertas) ni resultados de tareas del modelo base sobre este checkpoint.

## Requisitos de hardware

- El SAE en si ocupa 0,5 GB, por lo que cabe en cualquier GPU de consumo, e incluso puede cargarse en CPU para su inspeccion.
- Para que resulte util hay que ejecutar el modelo base Qwen3-VL-30B-A3B-Instruct, cuyos requisitos son los dominantes. Estimaciones a partir del numero de parametros, no confirmadas en la informacion proporcionada: en bf16/fp16, en torno a 60 GB de pesos, lo que exige una H100 de 80 GB, una A100 de 80 GB o varias GPU de 48 GB.
- Con cuantizacion de 4 bits (AWQ, GPTQ o similar), el modelo base quedaria en torno a 17-20 GB, lo que permite ejecutarlo en una RTX 4090 o RTX 3090 de 24 GB, asumiendo que el soporte de cuantizacion del MoE multimodal este disponible.
- Opciones de despliegue del modelo base: vLLM, SGLang, TGI, llama.cpp u Ollama, segun el formato de pesos y el soporte de la arquitectura Qwen3-VL MoE.
- Para extraer y analizar activaciones se necesita un framework con hooks en el modulo model.layers.10.mlp.down_proj (por ejemplo, codigo propio sobre PyTorch, nnsight o herramientas del estilo de SAELens) mas la implementacion personalizada TOPK_SAE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se incluyen datos comparativos en la informacion proporcionada. La tabla siguiente contrasta el artefacto con otras familias de SAE publicas del ecosistema; los datos de las alternativas proceden de conocimiento general del sector y deben verificarse en sus repositorios originales.

| Aspecto | Este SAE (liaoweiduo) | Gemma Scope (Google DeepMind) | Llama Scope |
|---|---|---|---|
| Modelo base | Qwen3-VL-30B-A3B-Instruct (MoE multimodal) | Familia Gemma 2 | Familia Llama 3.1 |
| Tipo de SAE | TopK | JumpReLU (no confirmado en la informacion disponible) | TopK (no confirmado) |
| Capas cubiertas | Solo capa 10 | No disponible en la informacion proporcionada | No disponible |
| Tamano de diccionario | 65.536 | No disponible | No disponible |
| Top-k | 256 | No aplica / no disponible | No disponible |
| Licencia | No disponible | No disponible | No disponible |
| Explicaciones de caracteristicas incluidas | Si (JSON enlazado) | No disponible | No disponible |

## Limitaciones y advertencias

- Alcance limitado a una sola capa y un solo modulo: el SAE solo cubre model.layers.10.mlp.down_proj, por lo que no permite analizar atencion, otras capas ni el router del MoE.
- No es un modelo autonomo: no genera texto ni procesa entradas por si mismo. Requiere Qwen3-VL-30B-A3B-Instruct y una implementacion personalizada TOPK_SAE.
- Ausencia de metricas: sin datos de reconstruccion, L0 o caracteristicas muertas, no es posible evaluar la calidad del diccionario sin reproducir el analisis.
- Riesgo de interpretaciones espurias: las explicaciones de caracteristicas generadas automaticamente pueden ser incompletas o erroneas; deben validarse con contraejemplos.
- Sesgos heredados: cualquier sesgo presente en Qwen3-VL-30B-A3B-Instruct se reflejara en las caracteristicas aprendidas.
- Licencia no declarada: el repositorio no especifica terminos de uso, lo que impide confirmar si se permite el uso comercial. Es necesario verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: se desconoce si el SAE captura caracteristicas multilingues de forma equilibrada.
- Checkpoint unico: el paso 1200 con gs=0.0 puede no ser el optimo; no se ofrece comparacion con otros pasos.
- Uso en produccion: pensado para investigacion en interpretabilidad, no como componente de inferencia en sistemas de usuario final.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liaoweiduo/sae-qwen3vl30ba3b-l10-gs0.0-step1200
- Modelo base Qwen3-VL-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- JSON de explicaciones de caracteristicas (capa 10, gs 0.0, paso 1200): https://huggingface.co/datasets/liaoweiduo/SAE-explorer-resources/blob/main/explanations/qwen3_vl_30b_a3b/layer_10/gs_0.0_step_1200/sae_explain_output.json
