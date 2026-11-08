# Shiftedx/Qwopus3.8-27B-Coder-Flash-MLX-Balanced

## Resumen

Qwopus3.8-27B-Coder-Flash-MLX-Balanced es una cuantizacion de precision mixta en formato MLX del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un transformer de 27.356.728.560 parametros (27,36 B) orientado a generacion de codigo y uso de herramientas. La publica el usuario Shiftedx como variante "Balanced" dentro de una coleccion de cuantizaciones MLX para Apple Silicon, junto a una variante "Fast" con menor huella de memoria y mayor velocidad de decodificacion. El modelo base declara arquitectura qwen3_5 y licencia Apache-2.0, con soporte de vision (pesos BF16) y decodificacion especulativa nativa mediante MTP (multi-token prediction).

El interes practico de esta ficha esta en que no es un checkpoint entrenado desde cero, sino un artefacto de despliegue: una receta de cuantizacion concreta (4 bits en MLP con grupo 32, 8 bits en atencion, embeddings, cabeza y ocho capas MLP finales, y 96 proyecciones de gating recurrentes en BF16) pensada para ejecutarse en un solo equipo Apple Silicon de 64 GiB. El autor publica mediciones locales de velocidad y de recuperacion en contexto largo, ademas de un recetario de cuantizacion, un manifiesto de hashes y un contrato de evaluacion.

Es relevante ahora porque ejemplifica una tendencia: checkpoints de codigo de ~27 B con contexto de 128 K que se distribuyen ya cuantizados para hardware de consumo, con decodificacion especulativa integrada y validaciones de capacidad publicadas junto a los pesos. La contrapartida es que se trata de un artefacto experimental, sin benchmarks academicos y con una edicion de direccion de rechazo no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia qwen3_5), con MTP nativo y soporte de vision; pesos BF16 en el modelo base |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 131.072 tokens configurados (128 K); 65.536 tokens (64 K) como opcion recomendada; prompt y salida comparten el limite |
| Tipos de cuantizacion | MLX de precision mixta: MLP a 4 bits grupo 32; 14 proyecciones de baja sensibilidad a grupo 64; atencion, embeddings, cabeza y ocho capas MLP finales a 8 bits grupo 64; 96 proyecciones de gating recurrentes en BF16; vision en BF16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX); repo de 23,8 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia qwen3_5 con 27,36 B de parametros, segun los metadatos del repositorio. La model card describe componentes propios de las arquitecturas hibridas recientes: proyecciones de gating recurrentes (96 de ellas conservadas en BF16 en esta cuantizacion), una cabeza de prediccion multi-token (MTP) nativa con profundidades 1 a 3, y una torre de vision en BF16 que permite entrada de imagen. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Esta publicacion no entrena: convierte los pesos BF16 del checkpoint fijado de Jackrong mediante pesos en streaming y aplica una receta de cuantizacion selectiva documentada en quantization_recipe.json. La innovacion tecnica destacable es la decodificacion especulativa: el autor reporta que las profundidades MTP 1-3 y el decodificador DFlash2 (modelo separado, incoai/Qwen3.8-27B-DFlash2) coincidieron con la generacion greedy plana en 4 de 4 sondas de texto, y que en dos prompts cortos de codigo y prosa se midieron 20,2 tok/s en modo plano, 45,5 tok/s con MTP3 y 90,3 tok/s con DFlash2 sobre Kapitsa 0.2.31. Ademas, la model card menciona una edicion experimental de direccion de rechazo (strength 0,5 sobre las salidas de atencion de las capas 10 a 17) cuya eficacia y fidelidad respecto a BF16 no estan verificadas.

## Capacidades

- Generacion de texto y codigo: el autor reporta 6 de 8 tareas ejecutables superadas en un smoke test de codigo, con fallos en weighted interval scheduling y en semantica de cache TTL.
- Razonamiento multi-paso con modo thinking desactivable mediante chat_template_kwargs={"enable_thinking": false}.
- Uso de herramientas (tool use) y function calling, validado en la prueba de recuperacion con herramientas.
- Recuperacion en contexto largo: pruebas de retrieval a 64 K y 128 K superadas segun la model card.
- Vision: entrada de imagen con torre BF16; en ocho preguntas de imagen, el JSON normalizado coincidio 8 de 8 y el JSON estricto sin fences 4 de 8.
- Decodificacion especulativa: MTP nativo (profundidades 1-3) y DFlash2 como modelo draft separado.
- Multilingue limitado a ingles y chino.
- Cache de codigo para decodificacion repetida con contexto cacheado.

## Casos de uso

- Asistente de codigo local en Mac: el modelo cabe en un Apple Silicon de 64 GiB y decodifica a 78,4 tok/s con contexto cacheado de 64 K, lo que permite iterar sobre un repositorio mediano sin salir del equipo.
- Revision de codigo con contexto largo: con 128 K de ventana se puede cargar un conjunto amplio de ficheros y discutir cambios; el autor midio 61,9 tok/s en decodificacion cacheada a esa longitud, con un primer turno en frio de 579 s.
- Agentes con tool calling: la validacion de herramientas superada permite encadenar llamadas a APIs o ejecutores de codigo en pipelines de agentes de un solo paso de inferencia local.
- Extraccion estructurada de imagenes: con 8 de 8 en JSON normalizado en preguntas de imagen, es utilizable para convertir capturas o diagramas en registros estructurados, validando siempre el esquema y eliminando fences.
- Prototipado de pipelines de CI/CD: integrable via servidor compatible con /v1/chat/completions (Kapitsa) para generar parches o tests en un runner con GPU Apple, aceptando temperatura 0 y top_p 1 para reproducibilidad.
- Investigacion sobre cuantizacion: el recetario, el manifiesto de hashes y el contrato de evaluacion publicados lo convierten en un banco de pruebas para estudiar el impacto de la precision mixta en tareas de codigo.
- Despliegue con decodificacion especulativa: util para medir el rendimiento de MTP frente a DFlash2 en hardware de consumo antes de adoptar estas tecnicas en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos son mediciones locales del autor:

| Medicion local (M4 Max 40-core GPU / 64 GiB) | 64 K | 128 K |
|---|---:|---:|
| Tokens de prompt | 61.441 | 126.976 |
| Turno en frio | 192,87 s | 579,09 s |
| Decodificacion de codigo con cache | 78,4 tok/s | 61,9 tok/s |

| Modo de decodificacion (Kapitsa 0.2.31, dos prompts cortos) | tok/s |
|---|---:|
| Plano (sin especulacion) | 20,2 |
| MTP3 nativo | 45,5 |
| DFlash2 | 90,3 |

Condiciones declaradas: un slot, cache en disco desactivada, greedy, thinking desactivado, una ejecucion por celda de contexto.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 23,74 GB; con overhead de ejecucion y cache KV para 128 K conviene disponer de 64 GiB de memoria unificada, como el equipo de referencia (M4 Max, 40 nucleos de GPU, 64 GiB).
- GPU recomendadas: Apple Silicon de gama alta (M4 Max y superiores) para contexto completo; en equipos con menos memoria unificada, reducir a 64 K o usar la variante Fast.
- GPU NVIDIA: no hay datos de despliegue en CUDA en la informacion disponible, ya que los pesos estan en formato MLX.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no se documenta su ejecucion en RTX 4090 u otras GPU discretas.
- Opciones de despliegue: servidor Kapitsa (0.2.27 o 0.2.31) con soporte de DFlash2 y MTP; descarga mediante hf download. No se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks; el primer turno en contexto largo es el principal cuello de botella (192,87 s a 64 K y 579,09 s a 128 K).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shiftedx/Qwopus3.8-27B-Coder-Flash-MLX-Balanced | 27,36 B | 131.072 | MLX precision mixta (4/8 bits + BF16 selectivo) | Apache-2.0 | Hugging Face, 0 descargas |
| Shiftedx/Qwopus3.8-27B-Coder-Flash-MLX-Fast | no disponible | no disponible | MLX, menor memoria y decodificacion mas rapida | Apache-2.0 (heredada) | Hugging Face |
| mlx-community/Qwopus3.8-27B-Coder-Flash-4bit | 27 B | no disponible | MLX 4 bits | no disponible | Hugging Face |
| Jackrong/Qwopus3.8-27B-Coder-Flash (base) | 27,36 B | no disponible | BF16 safetensors | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la unica comparacion publicada es la recomendacion del autor de elegir Balanced por mayor puntuacion local de codigo y Fast por menor memoria y mayor velocidad.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo etiqueta como experimental y declara que la reduccion de rechazos y la fidelidad respecto a BF16 no estan verificadas.
- Sin benchmarks academicos publicados; las unicas metricas son mediciones locales de un unico equipo y una ejecucion por celda.
- Fallos documentados en el smoke test de codigo: weighted interval scheduling y semantica de cache TTL.
- Vision limitada: el JSON estricto sin fences solo coincidio en 4 de 8 preguntas de imagen; hay que eliminar fences y validar el esquema de salida.
- Cobertura de idiomas restringida a ingles y chino; no se documenta castellano.
- Las pruebas de MTP solo cubren texto, imagen fija y secuencias cortas; el comportamiento de MTP en contexto largo no esta probado.
- Requiere el decodificador DFlash2 como modelo separado para la decodificacion especulativa; no viene incluido en los pesos.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de robustez en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero el caracter experimental y la falta de validacion desaconsejan produccion sin evaluacion propia.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la evidencia de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiftedx/Qwopus3.8-27B-Coder-Flash-MLX-Balanced
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash/tree/c7d46e5dadf43ab838f2d594839805b2c2f6ccd3
- Variante Fast: https://huggingface.co/Shiftedx/Qwopus3.8-27B-Coder-Flash-MLX-Fast
- Coleccion de cuantizaciones MLX: https://huggingface.co/collections/Shiftedx/qwopus38-27b-flash-mlx-quants
- Cuantizacion de mlx-community: https://huggingface.co/mlx-community/Qwopus3.8-27B-Coder-Flash-4bit
- Decodificador DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Servidor Kapitsa v0.2.27: https://github.com/nace-ai/kapitsa/tree/v0.2.27
