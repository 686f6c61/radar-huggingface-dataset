# DreamBlooms/JAD-S1-7B-A1B-v0.5-GGUF

## Resumen

JAD-S1-7B-A1B-v0.5 es un adaptador LoRA fusionado y cuantizado sobre el modelo base `inclusionAI/LLaDA-MoE-7B-A1B-Instruct`, desarrollado por DreamBlooms. Su proposito no es generar texto, sino actuar como un **modelo de decision de opcion multiple**: recibe un estado (situacion), una pregunta y una lista de opciones, coloca un token de mascara en el turno del asistente y devuelve, en un unico forward pass, una distribucion normalizada de probabilidad sobre las letras de opcion disponibles. La respuesta es la letra de mayor probabilidad, sin generacion de texto ni parseo posterior.

La arquitectura subyacente es LLaDA-MoE, un modelo de difusion de lenguaje con mezcla de expertos (MoE) de 7.356.880.896 parametros totales. JAD significa "Just A Decision diffusion with masking" y S1 hace referencia a "System One", aludiendo a decisiones rapidas de un solo paso. El adaptador LoRA usa rango 8, alpha 16 y ataca las proyecciones q/k/v/o/gate/up/down, con un tamano de 311 MB antes de la fusion.

Este repositorio en concreto distribuye los pesos en formato GGUF (Q8_0 y F16) para inferencia en CPU mediante `dohnuts.cpp`, un port nativo en C++ sobre llama.cpp. Es relevante porque ofrece un modelo de decision calibrado, con licencia Apache-2.0 y uso comercial permitido, orientado a tareas de clasificacion estructurada y seleccion entre opciones con contexto de hasta 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaDA-MoE (difusion de lenguaje con mezcla de expertos) + adaptador LoRA fusionado |
| Parametros totales | 7.356.880.896 |
| Parametros activos | no disponible (el modelo base es MoE A1B, pero no se detalla el numero exacto de parametros activos en la informacion proporcionada) |
| Longitud de contexto | 4.096 tokens recomendados; hasta 8.192 soportados |
| Tipos de cuantizacion | Q8_0 y F16 (GGUF) |
| Idiomas soportados | ingles y chino (evaluados); transferencia a japones evaluada sin entrenamiento |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0: 7,8 GB; F16: 14,7 GB) |

## Arquitectura y entrenamiento

El modelo base es LLaDA-MoE-7B-A1B-Instruct, un modelo de difusion de lenguaje con arquitectura de mezcla de expertos. Sobre el se aplica un adaptador LoRA de rango 8 y alpha 16 que cubre las proyecciones q/k/v/o/gate/up/down, con un total de 311 MB. El adaptador se fusiona en el modelo base mediante las herramientas de LoRA de llama.cpp (`convert_lora_to_gguf.py` y `llama-export-lora`) y posteriormente se cuantiza, de modo que en tiempo de ejecucion no hay adaptador que cargar ni cabeza de puntero.

El mecanismo de lectura ("readout") es de un solo paso con etiqueta restringida: se inserta un unico token de mascara en la ranura del asistente y se leen las logits de las letras de opcion en esa posicion en un forward no causal. El adaptador se entreno con datos publicos de licencia abierta y datos sinteticos creados para el proyecto; no se usaron datos no comerciales ni de solo investigacion. La version v0.5 (2026-11-13) mejora sobre v0.2 en capacidad de decision general, con una temperatura de 1,2576 y un ECE tras calibracion de 0,0130. El modelo soporta entre 2 y 26 opciones por tarea (etiquetas A-Z), con 6 opciones recomendadas.

## Capacidades

- Decision de opcion multiple: devuelve una distribucion de probabilidad normalizada sobre las letras de opcion disponibles en un unico forward pass.
- Salida estructurada y tipada: no genera texto libre, lo que elimina la necesidad de parseo posterior.
- Calibracion de probabilidades: ECE tras calibracion de 0,0130, adecuado para umbrales de confianza.
- Aplicacion de reglas con excepciones.
- Ventanas temporales y de plazos (temporal and deadline windows).
- Comparacion multi-salto (multi-hop comparison).
- Puntuacion y valoracion (scoring and rating).
- Clasificacion de temas y etiquetas.
- Verificacion de evidencia y afirmaciones (evidence/claim verification).
- Capacidades multilingues: evaluado en ingles, chino y japones (este ultimo sin entrenamiento especifico).
- Inferencia en CPU sin GPU ni runtime de Python mediante `dohnuts.cpp`.
- Formato de cable compatible con `POST /v1/systemone` y metadatos de decision oficiales de llama.cpp (`llada-moe.decision.type = pplx-decider`), con plantilla de chat `systemone` para `llama-server`.

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: dado un estado del sistema, una pregunta y un conjunto de acciones posibles, el modelo selecciona la accion de mayor probabilidad en un solo paso, lo que reduce la latencia frente a la generacion autoregresiva de texto y evita el parseo de salidas.
- Clasificacion de tickets y etiquetado: con 2-26 opciones por tarea y contexto de hasta 8.192 tokens, puede asignar categorias, prioridades o etiquetas a textos de soporte o documentacion de forma calibrada.
- Verificacion de afirmaciones y evidencia: el modelo evalua si una afirmacion esta respaldada por la evidencia proporcionada, adecuado para pipelines de control de calidad de contenido o fact-checking asistido.
- Aplicacion de reglas con excepciones en dominios regulados: seleccion entre opciones normativas (por ejemplo, que clausula aplica segun el estado descrito), aprovechando la evaluacion en tareas de aplicacion de reglas con excepciones.
- Puntuacion y valoracion automatizada: asignacion de una etiqueta de puntuacion dentro de un conjunto discreto de opciones, util en evaluacion de respuestas o moderacion por niveles.
- Despliegue en entornos sin GPU: gracias a los GGUF Q8_0 (7,8 GB) y F16 (14,7 GB) y a `dohnuts.cpp`, puede ejecutarse en CPU en servidores de bajo coste o entornos edge donde no hay acelerador disponible.
- Seleccion entre opciones en sistemas de recomendacion o configuracion: eleccion entre alternativas discretas (planes, configuraciones, rutas) con probabilidades calibradas para umbrales de confianza.

## Benchmarks y rendimiento

Resultados reportados por el autor (adaptador upstream y GGUF medido con `dohnuts.cpp`):

| Benchmark | v0.2 | v0.5 1x (adaptador) | F16 GGUF | Q8_0 GGUF |
|---|---:|---:|---:|---:|
| JevBench v1.2.2 (231) | 192/231 (83,1%) | 193/231 (83,6%) | 194/231 (84,0%) | 191/231 (82,7%) |
| Kev (2.581) | 74,00% | 75,94% | no disponible | no disponible |
| VitaminC-dev (599) | 69,95% | 84,47% | no disponible | no disponible |
| Temperature | 1,2315 | 1,2576 | no disponible | no disponible |
| ECE tras calibracion | 0,0175 | 0,0130 | no disponible | no disponible |

Desglose de JevBench por dificultad (GGUF, `dohnuts.cpp`):

| Archivo | easy | original | hard | all |
|---|---:|---:|---:|---:|
| F16 | 48/48 | 68/72 | 78/111 | 194/231 (84,0%) |
| Q8_0 | 48/48 | 68/72 | 75/111 | 191/231 (82,7%) |

JevBench por idioma (adaptador upstream):

| Idioma | JevBench (231) |
|---|---:|
| Ingles | 193/231 (83,6%) |
| Chino | 184/231 (79,7%) |
| Japones | 183/231 (79,2%) |

El autor indica que el GGUF difiere en un par de decisiones ajustadas respecto al adaptador upstream (193/231) por cuantizacion y deriva de kernels.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que `dohnuts.cpp` ejecuta el modelo en CPU. Para Q8_0 (7,8 GB) se necesita al menos esa cantidad de RAM; para F16 (14,7 GB), el doble aproximadamente.
- GPU recomendadas: no disponibles en la informacion proporcionada; el runtime recomendado es CPU.
- Cabe en GPU de consumo: no se proporcionan datos de despliegue en GPU para este repositorio GGUF; el foco es CPU.
- Opciones de despliegue: `dohnuts.cpp` (runtime recomendado, lee la ranura de mascara con el `<|role_end|>` de entrenamiento y puntua aproximadamente 10 items de JevBench mas), y `llama-server` de llama.cpp como fallback (carga directa gracias a los metadatos `llada-moe.decision.type = pplx-decider` y la plantilla `systemone`). Tambien se menciona Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota: `jad.json` (config de perfil y temperatura, 135 B) es obligatorio junto al GGUF cuando se ejecuta `dohnuts.cpp`.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables de la misma categoria (modelos de decision de opcion multiple basados en difusion) en la informacion disponible. La comparacion interna disponible es frente a la version anterior del propio adaptador (v0.2), resumida en la tabla de benchmarks.

| Modelo | Parametros | Contexto | JevBench | Licencia | Formato |
|---|---|---|---|---|---|
| JAD-S1-7B-A1B-v0.5 (este) | 7.356.880.896 | 4.096-8.192 | 193/231 (adaptador) | Apache-2.0 | GGUF |
| JAD-S1-7B-A1B-v0.2 | no disponible | no disponible | 192/231 | Apache-2.0 | no disponible |
| Alternativas de la categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve una distribucion sobre letras de opcion. No es adecuado para tareas de generacion libre.
- Numero de opciones limitado a 2-26 (etiquetas A-Z); se recomiendan 6 opciones por tarea.
- Contexto recomendado de 4.096 tokens; aunque soporta hasta 8.192, no se detalla el rendimiento mas alla del contexto recomendado.
- Idiomas evaluados: ingles y chino. El japones se evaluo sin entrenamiento especifico y su rendimiento depende de la transferencia del modelo base.
- Riesgo de alucinacion: no se documenta explicitamente en la informacion proporcionada; al tratarse de una salida restringida a opciones, el riesgo se manifiesta como seleccion incorrecta mas que como texto inventado.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La diferencia entre el adaptador upstream (193/231) y el GGUF (191-194/231) implica que la cuantizacion y la deriva de kernels pueden alterar decisiones ajustadas; para maxima fidelidad de probabilidad se recomienda F16.
- `dohnuts.cpp` es el runtime recomendado; usar `llama-server` como fallback puede puntuar peor (aproximadamente 10 items menos en JevBench).
- Licencia Apache-2.0 permite uso comercial, modificacion y redistribucion; se debe consultar el archivo `NOTICE` para la atribucion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DreamBlooms/JAD-S1-7B-A1B-v0.5-GGUF
- Modelo base (adaptador): https://huggingface.co/DreamBlooms/JAD-S1-7B-A1B-v0.5
- Modelo base original: https://huggingface.co/inclusionAI/LLaDA-MoE-7B-A1B-Instruct
- Runtime recomendado (dohnuts.cpp): https://github.com/DreamBlooms/dohnuts.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp
