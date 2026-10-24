# OsaurusAI/d3-flash-JANG_6M

## Resumen

OsaurusAI/d3-flash-JANG_6M es un paquete cuantizado del modelo vllm-sr/d3-flash, la base multimodal de 9B parametros (8.392.695.024 parametros reales en safetensors) del sistema Decision 3.0 de vLLM Semantic Router. No es un modelo generativo: recibe un estado (texto o JSON, opcionalmente con imagenes y videos) junto con preguntas tipadas —elegir una entre varias opciones, responder si/no o puntuar en una escala ordenada— y devuelve, en un unico forward pass, una probabilidad por opcion sin generar texto. El modelo base esta construido sobre Qwen/Qwen3.5-9B.

La aportacion de este repositorio es la cuantizacion: comprime los 16,8 GB en BF16 hasta 7,84 GB de shards (7,48 bits por peso de media), manteniendo el 99,40 % de las decisiones identicas al modelo de precision completa sobre 2.000 peticiones del split de test de tasksource/tasksource-jev-typed-decisions, con un KL medio de 0,0003. La cabeza de respuesta de 255 vias se conserva en FP32 byte a byte.

Es relevante ahora porque permite ejecutar un modelo de decision de enrutamiento y seleccion de herramientas en Apple Silicon mediante MLX, sin GPU dedicada, con una fidelidad respecto al original que el autor documenta con cuatro conjuntos de evaluacion. La licencia es Apache-2.0, heredada del modelo base. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen/Qwen3.5-9B, con atencion bidireccional completa para el forward de decision, capas de atencion lineal y vision tower |
| Parametros totales | 8.392.695.024 (8,39B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 6-bit en MLP (gate/up/down); affine 8-bit en atencion, atencion lineal, embeddings y vision tower; cabezal de respuesta de 255 vias en FP32; entradas de la puerta de atencion lineal en BF16; media de 7,48 bits por peso |
| Idiomas soportados | en y multilingue (segun metadatos del autor; no se detalla la lista de idiomas) |
| Licencia | Apache-2.0 (con NOTICE y LICENSE heredados del modelo base) |
| Formato de pesos | safetensors en formato MLX (bundle JANG); 7,84 GB de shards |
| Modelo base | vllm-sr/d3-flash (a su vez sobre Qwen/Qwen3.5-9B) |
| Libreria / runtime | mlx; requiere Osaurus 0.25.26 o superior |
| Pipeline declarado | zero-shot-classification |
| Tamano del repositorio | 7,9 GB |
| Fecha de publicacion | 2026-10-23 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base: un transformer multimodal de 8,39B parametros con atencion bidireccional completa en el forward de decision, capas de atencion lineal y un vision tower que acepta imagenes y videos ademas de texto y JSON. La salida no es una secuencia de tokens, sino una cabeza de readout de 255 vias que produce una distribucion de probabilidad sobre las opciones de cada pregunta. El bundle cuantizado aplica precisiones distintas por modulo: 6 bits en las tres proyecciones MLP y 8 bits en atencion, atencion lineal, embeddings y torre de vision, dejando el cabezal de respuesta en su tensor FP32 original y las entradas de la puerta de atencion lineal en BF16.

El proceso de cuantizacion se calibro ejecutando el propio forward de decision de d3-flash sobre 2.778 prompts de decision y 1,81M tokens, cubriendo preguntas de enrutamiento sobre peticiones reales, seleccion de herramientas sobre listas de hasta 255 opciones, trazas de agentes y terminal, codigo, seguridad, documentos largos, decisiones tipadas, imagenes y videos de pantalla. Se aplicaron escalas activation-aware (AWQ) plegadas en las normas y proyecciones productoras, y cada MLP cuantizado se redondeo con GPTQ usando las matrices de Hessian de ese forward, conservando el modulo cuantizado solo cuando superaba al redondeo simple. No se detalla la composicion del dataset de entrenamiento original ni si hubo RLHF o DPO; esa informacion corresponde al modelo base vllm-sr/d3-flash.

## Capacidades

- Clasificacion zero-shot con opciones arbitrarias: elegir una entre varias alternativas definidas en tiempo de inferencia, incluyendo listas de hasta 255 opciones.
- Decisiones binarias (si/no) con umbral en 0,5 sobre la probabilidad devuelta.
- Puntuacion en escalas ordenadas, devolviendo una probabilidad por nivel.
- Entrada de estado en texto plano o JSON estructurado.
- Entrada multimodal: imagenes y videos (incluidos videos de pantalla) ademas de texto.
- Enrutamiento de peticiones y seleccion de herramientas en pipelines de agentes.
- Salida puramente probabilistica en un solo forward pass, sin generacion de texto, lo que elimina latencia de decodificacion autoregresiva.
- Capacidad multilingue declarada en los metadatos, ademas del ingles.
- No soporta tool calling en el sentido clasico ni generacion de texto, codigo o razonamiento en lenguaje natural.

## Casos de uso

- Enrutamiento semantico de peticiones: dado un prompt de usuario y un conjunto de rutas o modelos candidatos, el modelo devuelve la probabilidad de cada ruta en un forward pass, adecuado para integrarse como clasificador de entrada en un router de inferencia.
- Seleccion de herramientas en agentes: con listas reales de hasta 255 herramientas, el modelo puntua cual corresponde a la peticion; su calibracion se hizo explicitamente sobre este escenario.
- Control de pasos en agentes multi-step: decidir si continuar, detenerse o escalar a otro agente a partir de la traza acumulada en texto o JSON, sin coste de generacion.
- Guardrails y clasificacion de seguridad: preguntas tipadas sobre contenido (categoria de riesgo, si/no a politicas concretas) con salida probabilistica que permite fijar umbrales en produccion.
- Triaje de documentos largos: combinar el estado documental con preguntas cerradas sobre tipo, prioridad o accion requerida, en lugar de pedir un resumen generativo.
- Comprension de pantallas y videos para agentes de interfaz: al aceptar imagenes y videos de pantalla, puede decidir la siguiente accion sobre una UI a partir de una captura o grabacion.
- Moderacion y etiquetado a escala: su condicion de no generativo permite procesar lotes con una sola pasada por elemento y coste predecible.
- Evaluacion comparativa de bundles: al mantener el formato de preguntas y probabilidades del modelo completo, sirve para validar en local si la version cuantizada reproduce las decisiones del modelo BF16 antes de desplegarla.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Los datos disponibles miden el acuerdo entre este bundle y el modelo BF16, no la calidad absoluta frente a terceros:

| Conjunto de evaluacion | Preguntas | Decisiones coincidentes | KL medio | Precision gold, BF16 → bundle |
|---|---|---|---|---|
| Decision Index 0.3 public suite (466 preguntas de 41 benchmarks) | 466 | 99,14 % | 0,0004 | 71,7 % → 71,9 % |
| LocalLLaMA/typed-decisions test (gold suave) | 800 | 99,62 % | 0,0003 | 69,6 % → 70,0 % |
| Decisiones held-out sobre textos, imagenes y videos propios | 487 | 98,77 % | 0,0011 | no disponible |
| tasksource/tasksource-jev-typed-decisions test (split usado por el proveedor) | 2.000 | 99,40 % | 0,0003 | 81,2 % → 81,1 % |

Comparativa interna de los tres bundles publicados por el autor:

| Bundle | Tamano | Decisiones (tsj, 2.000) | Decisiones (suite) | KL medio (suite) |
|---|---|---|---|---|
| d3-flash-JANG_6M | 7,8 GB | 99,40 % | 99,14 % | 0,0004 |
| d3-flash-JANG_4M | 6,6 GB | 97,65 % | 97,00 % | 0,0038 |
| d3-flash-JANGH2 | 5,3 GB | 92,65 % | 89,27 % | 0,0608 |

No se han publicado datos de latencia ni de throughput en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los shards suman 7,84 GB; con overhead de runtime, cache de activaciones y margen para entradas de imagen o video, conviene disponer de 9-11 GB. El modelo BF16 equivalente ocupa 16,8 GB.
- Plataforma: exclusivamente Apple Silicon (MLX). No hay soporte CUDA y, por tanto, no se puede ejecutar en A100, H100 ni RTX 4090 con este bundle.
- Equipos consumer: viable en Mac con chip de la familia M y 16 GB de memoria unificada o mas; en configuraciones de 8 GB el margen es insuficiente, especialmente con entradas de video.
- Despliegue: requiere el runtime Osaurus 0.25.26 o superior. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este bundle.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al no generar texto, el coste por decision equivale a un unico forward pass sobre el estado y las preguntas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decisiones (tsj, 2.000) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d3-flash-JANG_6M | 8,39B | no disponible | 99,40 % | 7,8 GB | Apache-2.0 | MLX / Osaurus |
| d3-flash-JANG_4M | 8,39B (mismo origen) | no disponible | 97,65 % | 6,6 GB | Apache-2.0 | MLX / Osaurus |
| d3-flash-JANGH2 | 8,39B (mismo origen) | no disponible | 92,65 % | 5,3 GB | Apache-2.0 | MLX / Osaurus |
| vllm-sr/d3-flash (BF16) | 8,39B | no disponible | referencia (100 %) | 16,8 GB | Apache-2.0 | pesos completos |

No se dispone de datos de benchmarks estandar que permitan comparar este modelo con clasificadores genericos de la misma categoria; el autor solo ofrece comparaciones internas contra su propio modelo base.

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion: no produce texto, codigo ni explicaciones; solo devuelve probabilidades sobre opciones predefinidas. Usarlo como LLM general no es posible.
- El limite de la cabeza de respuesta es de 255 vias; las preguntas con mas opciones no estan cubiertas por el diseno declarado.
- La cuantizacion introduce divergencia: entre el 0,38 % y el 1,23 % de las decisiones cambian respecto al modelo BF16 segun el conjunto, con KL medio de hasta 0,0011 en el conjunto held-out propio. En tareas con umbrales ajustados esto puede ser material.
- La evaluacion la firma el propio autor del bundle, sobre conjuntos que incluyen el split que el proveedor uso para puntuar sus paquetes cuantizados; no hay validacion independiente.
- Idiomas: los metadatos declaran en y multilingue, pero no se detalla la lista ni se aportan evaluaciones por idioma. El rendimiento fuera del ingles no esta cuantificado.
- Longitud de contexto: no documentada. No se recomienda asumir una ventana concreta para documentos largos sin verifikacion previa.
- Dependencia de plataforma: requiere Apple Silicon y el runtime Osaurus; no hay ruta de despliegue en servidores x86 con GPU NVIDIA documentada.
- Sesgos: no se publica ninguna evaluacion de sesgos, toxicidad o equidad. Al tratarse de un clasificador de decisiones, los sesgos del modelo base se traducen directamente en sesgos de enrutamiento o moderacion.
- Riesgo de calibracion: las probabilidades son fiables segun el autor para las decisiones, pero no hay garantia de calibracion absoluta fuera de la distribucion de calibracion (enrutamiento, herramientas, trazas de agente, codigo, seguridad, documentos, imagen y video).
- Licencia Apache-2.0 permite uso comercial, pero obliga a conservar NOTICE y LICENSE del modelo base; conviene revisar las condiciones heredadas de Qwen/Qwen3.5-9B.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validacion por terceros y soporte comunitario limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/d3-flash-JANG_6M
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Modelo subyacente: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime Osaurus: https://osaurus.ai
- Dataset de evaluacion citado: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de evaluacion citado: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
