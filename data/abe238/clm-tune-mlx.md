# abe238/clm-tune-mlx

## Resumen

CLM-tune-mlx es una implementacion en MLX (Apple) del modelo CLM-8B, un modelo de decision de tipo "typed decisions" que puntua una situacion contra una lista de acciones candidatas descritas en texto plano. Lo publica el usuario abe238 como adaptacion del modelo base Contrastive-LM/CLM-v0.1-8B, que a su vez reutiliza el encoder de Qwen/Qwen3-8B congelado y anade unas cabezas pequenas entrenables. La libreria es MLX y el pipeline declarado en HuggingFace es text-classification, aunque funcionalmente se comporta como un ranker de opciones, no como un generador de texto.

El problema que resuelve es el de la clasificacion cuando no existe un conjunto fijo de etiquetas: cada pagina web tiene botones distintos, cada usuario dispone de herramientas distintas y cada busqueda devuelve documentos distintos. Un clasificador tradicional necesita etiquetas predefinidas; CLM puntua cualquier lista de opciones en texto y, como el encoder de 8B permanece congelado, sus cabezas se pueden entrenar en segundos con ejemplos propios en un portatil. El autor reporta que, sin entrenamiento, el modelo pierde casi todas las pruebas, y que tras menos de un minuto de entrenamiento en un MacBook aprende a ordenar opciones que cambian en cada peticion.

Es relevante porque demuestra un flujo de trabajo de ajuste muy ligero sobre Apple Silicon sin PyTorch para inferencia (solo mlx-lm y numpy, entorno de unos 320 MB) y porque publica benchmarks medidos de forma explicita frente a alternativas locales y servicios alojados. El repositorio de HuggingFace no incluye peso alguno (0.0 GB): el modelo se distribuye y se instala desde el repositorio de GitHub asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Qwen3-8B congelado) con cabezas de decision pequenas entrenables; enfoque contrastivo |
| Parametros totales | 8B en el encoder (Qwen/Qwen3-8B) mas cabezas pequenas no cuantificadas en la ficha |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits por defecto (encoder en 8-bit, ~8 GB); bf16 disponible cargando Qwen/Qwen3-8B; existen ports de terceros en 4-bit |
| Idiomas soportados | no disponible (los datasets de evaluacion son en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (convertidos a MLX); las cabezas tambien pueden estar en formato .pt |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos partes: un encoder transformer de 8B (Qwen3-8B) que permanece congelado y dos cabezas pequenas y entrenables que producen la puntuacion de cada opcion de texto. Las opciones se codifican una sola vez y se cachean, de modo que el coste por decision no crece con el tamano del menu: el autor reporta 80 ms por decision con 10 opciones y 89 ms con 589 opciones en 8 bits. El enfoque se etiqueta como "contrastive", "system-one" y "typed-decisions": el modelo puntua una situacion contra una lista de acciones donde cada accion se describe como texto plano, lo que permite manejar conjuntos de etiquetas que cambian en cada peticion.

Sobre el entrenamiento, la model card indica que entrenar las cabezas requiere codificar los ejemplos una vez y despues entrenar en segundos, ya que el encoder de 8B no se actualiza. En la prueba de acciones web se entrenaron 1.306 pasos procedentes de otras tareas, con 8,3 minutos para codificar una vez y unos 40 segundos de entrenamiento. No se detalla en la informacion disponible el numero total de tokens de preentrenamiento del encoder, la composicion exacta del dataset ni si hubo RLHF o DPO especificos para estas cabezas. El port a MLX mantiene paridad con el original en PyTorch: 118 de 120 decisiones identicas en bf16 y coincidencia total (120 de 120) en las cabezas.

## Capacidades

- Puntuacion y ordenacion (ranking) de listas arbitrarias de opciones en texto, sin conjunto fijo de etiquetas.
- Clasificacion de texto con etiquetas fijas, con rendimiento comparable a un clasificador plano sobre las mismas codificaciones.
- Enrutado (routing) de mensajes hacia rutas o categorias, incluida la capacidad de manejar rutas no vistas durante el entrenamiento si se describen en una linea de texto.
- Seleccion del siguiente elemento accionable en una pagina web (basado en el dataset Mind2Web).
- Apoyo a decisiones de agentes y a la seleccion de herramientas, con datos de referencia procedentes de Berkeley-Function-Calling-Leaderboard.
- Entrenamiento de las cabezas en local sobre Apple Silicon, en segundos, con ejemplos propios.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Generacion de texto, vision o audio: no disponibles; el modelo es un encoder de decision, no un modelo generativo.

## Casos de uso

- Enrutado de soporte al cliente: el modelo asigna tickets a rutas predefinidas. En Banking77 alcanza entre el 84,2 % y el 86,4 % de acierto tras entrenar las cabezas, frente al 3,6 % sin entrenamiento. Es adecuado porque las cabezas se ajustan con ejemplos propios en segundos y el encoder permanece congelado.
- Gestion de rutas nuevas sin reentrenar: si aparece una ruta no vista antes, basta describirla en una linea de texto; el modelo logra un 50,1 % frente al 16,5 % de la cabeza publicada y al 0 % de un clasificador convencional, que por construccion no puede puntuar etiquetas no vistas.
- Automatizacion de agentes web: seleccionar el siguiente elemento accionable entre muchos candidatos que cambian en cada paso (Mind2Web). Tras entrenar, sube del 22,0 % al 49,3-51,3 %, superando a laya-mlx (40,7 %) y a la busqueda por palabras clave (28,0 %).
- Seleccion de herramientas en pipelines de agentes: puntuar la herramienta adecuada entre una lista variable de funciones disponibles, con datos de referencia de Berkeley-Function-Calling-Leaderboard.
- Ranking de resultados de busqueda o de documentos: dada una consulta y una lista de candidatos, el modelo puntua cada opcion, con coste por decision casi independiente del numero de opciones (89 ms con 589 opciones).
- Clasificacion de tickets con etiquetas dinamicas: cuando el catalogo de categorias evoluciona con frecuencia, evita reentrenar un clasificador completo y solo requiere ajustar las cabezas.
- Prototipado en Mac sin GPU dedicada: permite iterar un flujo de decision completo en un MacBook, entrenando las cabezas en menos de un minuto y sirviendolas con el servidor compatible con TypeSafe que incluye el paquete.

## Benchmarks y rendimiento

Resultados sobre datos reservados (held-out), segun la model card:

| Test | CLM sin entrenar | CLM entrenado en un Mac | laya-mlx | BM25 (palabras clave) | Jev (alojado) |
|---|---:|---:|---:|---:|---:|
| Web: elegir el siguiente elemento entre 15 (Mind2Web) | 22,0 % | 49,3-51,3 % | 40,7 % | 28,0 % | 77,3 % |
| Routing: 77 rutas de soporte (Banking77) | 3,6 % | 84,2-86,4 % | 40,1 % | 33,7 % | 80,1 % (muestra de 1.000 mensajes) |
| Routing: mensajes de 17 rutas nunca vistas | 16,5 % | 50,1 % | - | - | - |

Comparativa entre ports de MLX, misma maquina (M5 Pro), mismos pesos en 8 bits y 3 rondas seriales intercaladas:

| Metrica | clm-tune-mlx | RealityCat | czl 8-bit |
|---|---:|---:|---:|
| Una decision, p50 | 83 ms | 97 ms | 100 ms |
| Ocho preguntas sobre un mismo estado | 190 ms | 201 ms | 226 ms |
| Menu de 589 opciones, p50 | 110 ms | 120 ms | 133 ms |
| Tiempo de carga | 1,9 s | 3,5 s | 3,0 s |
| Memoria pico | 9,0 GB | 8,4 GB | 8,9 GB |
| Decisiones tipadas (120) | 50,8 % | 50,8 % | 55,0 % |

La model card aclara que la puntuacion mas alta de czl (55,0 %) proviene de un redondeo en 8 bits distinto que altera 8 respuestas casi empatadas (las dos mejores opciones a menos de 0,03-0,17), 5 de ellas a favor; el propio autor lo interpreta como azar y no como un modelo mejor, dado que supera incluso a bf16 (51,7 %).

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 8 GB para el encoder en 8 bits; la memoria pico medida en el port es de 9,0 GB (RealityCat, 8,4 GB; czl, 8,9 GB).
- Plataforma: Apple Silicon exclusivamente (MLX). Probado en un M5 Pro; requiere memoria unificada suficiente para alojar el modelo.
- GPU de consumo: si, en Macs con memoria unificada suficiente. No esta pensado para GPUs NVIDIA/AMD ni para CUDA.
- Opciones de despliegue: paquete clm-tune-mlx sobre mlx-lm, con servidor compatible con TypeSafe y micro-batching; no requiere PyTorch para inferencia (entorno de ~320 MB). vLLM, llama.cpp, Ollama o TGI no aparecen soportados en la informacion disponible.
- Latencia y throughput: 80 ms por decision con 10 opciones y 89 ms con 589 opciones (8 bits); 83 ms p50 para una decision y 190 ms para ocho preguntas sobre un mismo estado en el port analizado. Tiempo de carga de 1,9 s.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros/encoder | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clm-tune-mlx (este) | Ranker de decisiones sobre encoder congelado | Qwen3-8B (8B) | Routing entrenado 84,2-86,4 %; web entrenado 49,3-51,3 % | apache-2.0 | MLX (Apple Silicon), via GitHub |
| CLM-v0.1-8B (base) | Ranker de decisiones | Qwen3-8B (8B) | Punto de partida del ajuste | apache-2.0 | PyTorch/MLX |
| czl/CLM-v0.1-8B-MLX | Port MLX del mismo modelo | Qwen3-8B (8B), 4-bit | Typed decisions 55,0 % (por redondeo) | apache-2.0 | MLX |
| RealityCat/CLM-v0.1-8B-MLX-8bit | Port MLX del mismo modelo | Qwen3-8B (8B), 8-bit | Typed decisions 50,8 % | apache-2.0 | MLX |
| laya-mlx | Modelo local de decision | no disponible | Web 40,7 %; routing 40,1 % | no disponible | local |
| Jev (alojado) | Servicio de decision | no disponible | Web 77,3 %; routing 80,1 % | no disponible (servicio) | alojado |
| Clasificador plano sobre codificaciones | Clasificador | sobre encoder 8B congelado | Routing ~87,2 % | no disponible | local |

## Limitaciones y advertencias

- No es el modelo mas preciso: Jev lidera todas las pruebas excepto el routing entrenado y, ademas, no pudo entrenarse en ese escenario. laya-mlx tampoco se sometio a ajuste.
- Rendimiento muy bajo sin entrenamiento: 22,0 % en acciones web, 3,6 % en routing y 16,5 % en rutas no vistas. El valor del modelo depende de ajustar las cabezas.
- Para etiquetas totalmente fijas, un clasificador plano sobre las mismas codificaciones rinde de forma similar (87,2 % en routing); la ventaja de CLM aparece sobre todo con etiquetas cambiantes o no vistas.
- No es un modelo generativo: no produce texto, solo puntua opciones; no soporta generacion, vision ni audio.
- Atado a Apple Silicon y a MLX; no hay soporte documentado para CUDA ni para los runners habituales (vLLM, llama.cpp, TGI).
- Los conjuntos de evaluacion (Banking77, Mind2Web, Berkeley-Function-Calling-Leaderboard) estan en ingles; no se declaran idiomas soportados.
- No se documenta la longitud de contexto en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de puntuaciones erroneas en opciones casi empatadas (el propio autor documenta empates a menos de 0,03-0,17 resueltos por redondeo).
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones de los modelos base (Qwen/Qwen3-8B y Contrastive-LM/CLM-v0.1-8B) y de los datasets empleados.
- No hay resultados de benchmarks de terceros independientes; todas las cifras proceden del autor del port.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abe238/clm-tune-mlx
- Repositorio GitHub: https://github.com/abe238/clm-tune-mlx
- Modelo base (encoder): https://huggingface.co/Qwen/Qwen3-8B
- Modelo base CLM: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Port alternativo bf16 a 4-bit: https://huggingface.co/czl/CLM-v0.1-8B-MLX
- Port alternativo en 8 bits: https://huggingface.co/RealityCat/CLM-v0.1-8B-MLX-8bit
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset Mind2Web: https://huggingface.co/datasets/osunlp/Mind2Web
- Dataset Berkeley-Function-Calling-Leaderboard: https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard
