# DaehanKim/korjev-26b4a-v1

## Resumen

korjev-26b4a-v1 es un modelo de decisión finita (finite-choice) en coreano desarrollado por DaehanKim (Full-Stack AI Engineer, con 35 repositorios publicos en GitHub). Se construye sobre el modelo multimodal google/gemma-4-26B-A4B-it, una arquitectura de mezcla de expertos (MoE) con 25.805.936.206 parametros totales y aproximadamente 3.800 millones de parametros activos (de ahi el sufijo "4a" del nombre). En lugar de generar texto libre, el modelo puntua entre 2 y 26 opciones candidatas usando la propia LM head y un softmax enmascarado sobre los tokens correspondientes a las letras A-Z, sin producir traza de razonamiento.

El problema que resuelve es concreto: convertir un LLM generativo en un clasificador de eleccion multiple de alta velocidad y bajo coste por consulta. Segun la model card, alcanza 190,2 decisiones por segundo con una latencia p50 de 121,4 ms sobre una RTX PRO 6000 Blackwell Server de 96 GB, frente a las 45,2 decisiones/s de Gemma 4 31B o las 52,9 de Qwen3.8 27B en el mismo hardware. En precision reporta un 92,16% en el Korean JEV Benchmark (25.418 items) y un 65,66% en MMLU-Pro (12.032 items, evaluacion zero-shot de eleccion directa), con un 88,64% de acuerdo de orden (order agreement) en 1.259 items privados de desarrollo.

Es relevante ahora porque ofrece una alternativa cuantizada en FP8 W8A8 lista para servir con SGLang, con licencia Apache 2.0 y pesos safetensors ya fusionados (el LoRA de entrenamiento esta integrado en el backbone). El repositorio es reciente (creado el 8 de octubre de 2026) y no registra descargas ni likes en el momento de la consulta, por lo que debe considerarse un artefacto de investigacion mas que un modelo consolidado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), heredada de google/gemma-4-26B-A4B-it |
| Parametros totales | 25.805.936.206 (25,8 B) |
| Parametros activos | Aproximadamente 3,8 B |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue con SGLang configura 32.768 tokens |
| Tipos de cuantizacion | FP8 W8A8 en los pesos de matriz (compressed-tensors); LM head, embeddings, routers y capas de normalizacion conservan mayor precision |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 W8A8, LoRA ya fusionado); tamano del repo 27,2 GB |

## Arquitectura y entrenamiento

La base es Gemma 4 26B-A4B, un transformer MoE de 26B parametros totales con aproximadamente 3,8B activos por token. El ajuste se realizo con dos etapas de LoRA de rango 64: una primera etapa sobre 4.200 items de decision en coreano, y una segunda etapa de entrenamiento continuado con 3.511 items adicionales mas el pool de replay de 4.200 items, dividiendo cada batch a partes iguales entre items nuevos y de replay. El corpus combinado contiene 7.711 items unicos de entrenamiento y no se anadieron datos en ingles.

La funcion de perdida principal es entropia cruzada sobre la opcion de respuesta. Ademas se emplea una perdida JS de reverso exacto (exact-reverse JS loss) que alinea las distribuciones de eleccion entre un orden de opciones barajado y su inverso, con el objetivo de mejorar la estabilidad frente al orden. En la segunda etapa se anade una perdida KL de referencia sobre los items de replay elegibles para conservar las predicciones del modelo de la primera etapa. Los checkpoints se seleccionaron con datos de validacion privados antes de la evaluacion en benchmarks publicos.

La innovacion tecnica mas destacable no esta en el backbone sino en la cabecera de inferencia: el modelo no genera una traza de razonamiento, sino que aplica un softmax enmascarado sobre los tokens A-Z de la LM head original y devuelve la probabilidad de cada candidato a traves del endpoint `/v1/score` de SGLang. Esto reduce drasticamente el coste por decision frente a un esquema generativo, a cambio de renunciar a la explicabilidad paso a paso.

## Capacidades

- Clasificacion de eleccion multiple con un rango de 2 a 26 opciones candidatas por consulta, usando la LM head original.
- Puntuacion de probabilidad por candidato (no solo la opcion ganadora): la API devuelve las probabilidades de los tokens de letra evaluados.
- Decision sin traza de razonamiento, lo que implica latencia baja y coste de decodificacion minimo (un unico paso de puntuacion).
- Estabilidad frente al orden de las opciones, reforzada explicitamente mediante la perdida JS de reverso exacto.
- Rendimiento afinado para coreano, con resultados notablemente mas altos en coreano (92,16%) que en ingles (65,66%).
- Capacidad de decision en ingles en regimen zero-shot de eleccion directa, aunque sin datos de entrenamiento en ese idioma.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision operativa (aunque el modelo base es image-text-to-text, el entrenamiento y la evaluacion de esta variante usan entradas de texto) ni modo de pensamiento.

## Casos de uso

- Enrutado de decisiones en coreano: dado un conjunto de entre 2 y 26 categorias, el modelo devuelve en un solo paso la opcion mas probable y su probabilidad. Es adecuado porque su latencia p50 de 121,4 ms permite integrarlo en un bucle de decision sincrono.
- Triaje de tickets de soporte en coreano: clasificar cada incidencia en categorias predefinidas (facturacion, incidencia tecnica, cancelacion, etc.) con un coste por consulta muy inferior al de un LLM generativo, gracias a la puntuacion directa sobre la LM head.
- Moderacion y etiquetado de contenido: seleccionar una etiqueta de politica entre un conjunto cerrado de opciones sobre texto en coreano, aprovechando que el modelo no necesita generar justificacion.
- Evaluacion automatica de encuestas y tests: convertir respuestas abiertas en la opcion multiple correspondiente de un cuestionario, con la probabilidad asociada para auditar la confianza de cada asignacion.
- Seleccion discreta en sistemas de recomendacion: elegir entre un catalogo acotado de acciones o items (hasta 26) donde se requiere una decision rapida y con umbral de confianza controlable.
- Deteccion de intencion en dialogos conversacionales: mapear el turno del usuario a una de las intenciones del sistema, con el endpoint `/v1/score` de SGLang como interfaz.
- Evaluacion comparativa de modelos de decision en coreano: el propio autor lo usa como punto de referencia contra Gemma 4 31B, Qwen3.8 27B, K-Decision 4B o Mica v0.1 4B sobre el Korean JEV Benchmark.
- Procesamiento por lotes de alta concurrencia: con C*=128 y 190,2 decisiones/s, es apto para trabajos de etiquetado masivo siempre que se gestione correctamente el batching.

## Benchmarks y rendimiento

| Modelo | Precision | C* | Decisiones/s (mayor mejor) | Procesamiento p50 ms (menor mejor) | Coreano (mayor mejor) | Ingles (mayor mejor) | Acuerdo de orden (mayor mejor) |
|---|---|---:|---:|---:|---:|---:|---:|
| Gemma 4 31B | FP8 | 64 | 45,2 | 528,7 | 94,40% | 57,64% | 76,89% |
| Qwen3.8 27B | FP8 | 64 | 52,9 | 384,8 | 89,02% | 60,40% | 74,11% |
| Gemma 4 26B-A4B | FP8 | 128 | 200,4 | 114,6 | 90,37% | 45,36% | 71,09% |
| Gemma 4 12B | FP8 | 64 | 114,4 | 208,1 | 89,58% | 39,69% | 70,77% |
| Cygnet · Gemma 12B | BF16 | 64 | 49,9 | 305,3 | 89,18% | 54,84% | 73,47% |
| Mica v0.1 4B | BF16 | 64 | 152,0 | 106,8 | 81,47% | 52,96% | 77,68% |
| K-Decision 4B | BF16 | 256 | 102,7 | 596,7 | 85,41% | 48,94% | 73,47% |
| Qwen3.5 4B | BF16 | 64 | 185,6 | 108,0 | 78,77% | 46,24% | 63,62% |
| korjev-26b4a-v1 | FP8 | 128 | 190,2 | 121,4 | 92,16% | 65,66% | 88,64% |

Notas metodologicas de la model card: todas las configuraciones locales se midieron en una unica GPU RTX PRO 6000 Blackwell Server de 96 GB con el mismo procedimiento de calentamiento y busqueda de concurrencia. C* es el mejor ajuste de throughput observado para cada modelo; el p50 excluye la cola inicial del servidor. K-Decision usa su runtime nativo de pointer-head. La exactitud en coreano usa los 25.418 items del Korean JEV Benchmark; la de ingles usa los 12.032 items de test de MMLU-Pro con puntuacion zero-shot de eleccion directa, no el protocolo oficial few-shot con CoT. El acuerdo de orden compara opciones originales e invertidas sobre 1.259 items privados de desarrollo, incluye respuestas incorrectas consistentes y no es un test independiente held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 26 GB (repo de 27,2 GB); hay que sumar la cache KV para el contexto configurado (hasta 32.768 tokens) y los buffers de computo. Con `--mem-fraction-static 0.88` sobre 96 GB el autor reserva el 88% de la memoria para el motor.
- GPU recomendadas: RTX PRO 6000 Blackwell Server 96 GB (configuracion medida por el autor, tp=1), H100 80 GB, A100 80 GB. Con 26 GB de pesos en FP8, una GPU de 40-48 GB puede ser suficiente para contextos moderados.
- Cabe en GPU de consumo: no de forma directa. Una RTX 4090 de 24 GB no aloja los 26 GB de pesos FP8 sin cuantizacion adicional, y no se publican pesos GGUF ni versiones de menor precision.
- Opciones de despliegue: SGLang (probado con el contenedor 0.5.21 y backend de atencion Triton, `--dtype bfloat16` para los tensores no cuantizados) y transformers (requiere `transformers==5.12.1` segun el ejemplo). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son viables con este repositorio. Los tags incluyen `endpoints_compatible`.
- Latencia y throughput: 121,4 ms de p50 de procesamiento y 190,2 decisiones/s con C*=128 en la RTX PRO 6000 Blackwell de 96 GB. El ejemplo `score_example.py` envia una peticion a la vez y no reproduce esas cifras; el throughput reportado se midio con peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Contexto | Coreano | Ingles | Acuerdo de orden | Licencia |
|---|---|---|---|---|---|---|---|
| korjev-26b4a-v1 | 25,8 B totales / ~3,8 B activos | FP8 | 32.768 tokens en el ejemplo de SGLang | 92,16% | 65,66% | 88,64% | Apache 2.0 |
| Gemma 4 26B-A4B (base) | 26 B totales / ~4 B activos | FP8 | No disponible | 90,37% | 45,36% | 71,09% | Apache 2.0 |
| Gemma 4 31B | 31 B | FP8 | No disponible | 94,40% | 57,64% | 76,89% | No disponible |
| Qwen3.8 27B | 27 B | FP8 | No disponible | 89,02% | 60,40% | 74,11% | No disponible |
| Mica v0.1 4B | 4 B | BF16 | No disponible | 81,47% | 52,96% | 77,68% | No disponible |
| K-Decision 4B | 4 B | BF16 | No disponible | 85,41% | 48,94% | 73,47% | No disponible |

Frente a su modelo base, korjev-26b4a-v1 mejora la exactitud en coreano en 1,79 puntos, en ingles en 20,30 puntos y el acuerdo de orden en 17,55 puntos, a cambio de un descenso de throughput del 5,1% (200,4 frente a 190,2 decisiones/s) y un aumento del p50 del 5,9%. Frente a Gemma 4 31B pierde 2,24 puntos de exactitud en coreano pero multiplica por 4,2 el throughput y reduce el p50 un 77%. Los datos de licencia y contexto de los modelos de comparacion no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo de uso general: no produce texto libre ni traza de razonamiento, solo puntua un conjunto cerrado de opciones. Usarlo para generacion abierta daria resultados pobres.
- Sesgo de idioma: no se anadieron items de entrenamiento en ingles, y la exactitud en ingles (65,66%) es 26,5 puntos inferior a la de coreano (92,16%). El rendimiento en cualquier idioma distinto de ko/en no esta documentado.
- Riesgo de alucinacion: mitigado parcialmente por el diseno, ya que la salida se restringe a un conjunto finito de opciones; aun asi, el modelo puede asignar alta probabilidad a una opcion incorrecta, especialmente en opciones poco representadas en el corpus de entrenamiento.
- El conjunto de entrenamiento es reducido (7.711 items unicos) y de un unico autor, lo que limita la cobertura de dominios y aumenta el riesgo de sobreajuste a la distribucion de los datos de validacion privados usados para seleccionar checkpoints.
- El 88,64% de acuerdo de orden se mide sobre 1.259 items privados de desarrollo, no sobre un test independiente held-out, e incluye respuestas incorrectas consistentes. No debe interpretarse como una medida de robustez general.
- La exactitud en ingles de 65,66% se obtuvo con puntuacion zero-shot de eleccion directa, no con el protocolo oficial few-shot con CoT de MMLU-Pro, por lo que no es comparable con las cifras publicadas habitualmente para ese benchmark.
- La ventana de 32.768 tokens proviene del ejemplo de configuracion de SGLang, no de una especificacion confirmada del modelo; conviene verificarla antes de desplegar con contextos largos.
- Licencia Apache 2.0 en el backbone y en el repositorio, lo que permite uso comercial, pero el autor remite a `release_provenance.json` para la trazabilidad de los pesos y a `LICENSE` para los terminos; conviene revisarlos antes de un despliegue productivo.
- Madurez nula: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 8 de octubre de 2026 con 20 minutos de diferencia. No hay evidencia de uso en produccion por terceros.
- Dependencia de SGLang para rendimiento optimo: los numeros de throughput y latencia se midieron con SGLang 0.5.21; otros runtimes no estan validados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DaehanKim/korjev-26b4a-v1
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset de evaluacion Korean JEV Benchmark: https://huggingface.co/datasets/DaehanKim/korean-jev-benchmark
- Detalles de medicion (evaluation.md): https://huggingface.co/DaehanKim/korjev-26b4a-v1/blob/main/evaluation.md
- Ejemplo de puntuacion (score_example.py): https://huggingface.co/DaehanKim/korjev-26b4a-v1/blob/main/score_example.py
- Comparativa en formato maquina-legible (comparison.json): https://huggingface.co/DaehanKim/korjev-26b4a-v1/blob/main/comparison.json
- Procedencia de pesos y cuantizacion (release_provenance.json): https://huggingface.co/DaehanKim/korjev-26b4a-v1/blob/main/release_provenance.json
- Perfil del autor en HuggingFace: https://huggingface.co/DaehanKim
- Perfil del autor en GitHub: https://github.com/DaehanKim
