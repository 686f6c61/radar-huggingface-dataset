# Nurymanau/EmbeddingGemma2-Reflex

## Resumen

EmbeddingGemma2-Reflex es un modelo de decisión de texto de pequeno tamano publicado por el usuario Nurymanau en HuggingFace. No es un modelo generativo: se trata de un encoder de texto EmbeddingGemma 2 afinado por completo (271 millones de parametros) al que se anade una cabeza de eleccion de 238.000 parametros. Su funcion es elegir, entre un conjunto de opciones de texto proporcionadas por el usuario, cual satisface mejor la instruccion o el estado dado. No genera explicaciones ni cadenas de razonamiento.

El modelo parte del checkpoint base google/embeddinggemma-2 y se distribuye bajo licencia Apache-2.0. El repositorio contiene dos semillas de entrenamiento independientes (seed17 y seed41) en formato BF16 y en cuantizacion MLX q8. La version principal del repositorio es la release V6, acompanada de un anadido V7 de "reparacion semantica" evaluado por separado.

Su relevancia actual es acotada y de caracter experimental: el propio autor indica que V6 no supero su puerta completa de promocion (la transferencia a reglas novedosas mejoro sustancialmente, pero la precision en la interfaz UI retrocedio y no se establecio paridad estable de latencia), y que los controles de aceptacion preinscritos de V7 tampoco se superaron en su totalidad. Es, por tanto, un conjunto de pesos de investigacion utilizable, no una afirmacion de razonamiento general ni de superioridad sobre modelos como Laya, Jev o Clef.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de texto EmbeddingGemma 2 (base google/embeddinggemma-2) con cabeza de eleccion; puntuacion por termino coseno mas residual bilineal con puerta aprendida. Detalles internos de la capa transformer no disponibles |
| Parametros totales | 271M (encoder) + 238K (cabeza de eleccion), aproximadamente 271,2M |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 y MLX q8 (formato afin de 8 bits del SDK de MLX, no GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y MLX q8 (text-q8) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder de texto EmbeddingGemma 2 completamente afinado con una cabeza de decision ligera. El encoder embebe por separado la instruccion/estado y cada opcion candidata; la puntuacion combina un termino de similitud coseno con un residual bilineal con puerta aprendida. La misma cabeza acepta conjuntos de opciones de tamano variable (la distribucion de entrenamiento uso entre 3 y 6 opciones), y las embeddings de opciones fijas pueden cachearse. No se emplea enrutador de etiquetas de tarea, parser de reglas ni cache de respuestas.

El entrenamiento se realizo sobre 5.947 ejemplos, con 603 de desarrollo, 308 de calibracion y un test nuevo de 1.552 filas. Los datos son sinteticos en ingles y cubren seleccion de atributos (incluyendo negacion y conjuncion) y emparejamiento de tema/UI. Se entrenaron todas las ponderaciones del encoder y la cabeza durante cuatro epocas, con un control de encoder congelado emparejado (mismos datos, inicializacion de cabeza, perdida y numero de actualizaciones). Se usaron las semillas 17 y 41, optimizador AdamW, learning rate de 2e-5 para el encoder y 8e-4 para la cabeza, batch efectivo de 32, pesos entrenables en FP32 con autocast BF16 en CUDA. El entrenamiento completo tardo unos 24 minutos por semilla en una unica RTX A5000, con un coste de alquiler estimado de 0,321 USD a 0,27 USD/hora (estimacion del autor, no factura del proveedor). Los checkpoints se seleccionaron sobre desarrollo antes de test, y no se reseleccionaron usando resultados de test.

## Capacidades

- Eleccion entre opciones de texto: dado un estado o instruccion y una lista de opciones, devuelve puntuaciones (softmax a T=1) para cada candidata.
- Seleccion de atributos con negacion y conjuncion, segun la distribucion de entrenamiento.
- Emparejamiento de tema e interfaz de usuario (UI matching).
- Conjuntos de opciones de tamano variable, con posibilidad de cachear embeddings de opciones fijas.
- Ejecucion en CPU (referencia en Python) y en Mac mediante runtime MLX Swift.
- No genera texto libre, explicaciones ni cadenas de pensamiento.
- No dispone de tool calling ni function calling documentados.
- No dispone de soporte de agentes ni razonamiento multi-paso documentado.
- Multilingue: no, solo ingles.
- Capacidades especiales: ninguna adicional documentada (sin vision, audio ni modo de pensamiento).

## Casos de uso

- Desambiguacion de comandos de interfaz: el modelo recibe la peticion del usuario (por ejemplo, "Reverse the edit I just made") y una lista de comandos disponibles ("Print document", "Undo change", "Create folder"), y devuelve la opcion correcta. Es el escenario descrito en el ejemplo de inicio rapido del autor.
- Enrutado de intenciones en asistentes: clasificar una frase en una de varias intenciones predefinidas, siempre que el conjunto de opciones este acotado y se acepte la perdida de precision observada en UI (96,09% en el test del autor).
- Seleccion de respuesta en formularios guiados: elegir entre alternativas predefinidas en flujos de atencion al usuario donde no se requiere texto generado, sino una eleccion cerrada.
- Filtrado o matching de temas: emparejar una consulta con una categoria o tema de un catalogo, aprovechando el componente de topic matching del entrenamiento.
- Compuerta de decision en pipelines: actuar como clasificador binario o multiclase de bajo coste (271M parametros) antes de invocar un modelo mayor, reduciendo llamadas a modelos generativos.
- Despliegue local en Mac: integrar la eleccion de opciones dentro de una aplicacion macOS mediante el runtime MLX Swift, con latencia p50 declarada de 17,6 a 19,6 ms en un M3 con 16 GB.
- Evaluacion de seleccion bajo reglas novedosas: usar los pesos publicados como punto de partida para investigar transferencia a atributos o emparejamientos no vistos, dado que la transferencia es el eje del estudio del autor.

## Benchmarks y rendimiento

Resultados sobre un unico test sintetico nuevo en ingles, evaluado en Mac con q8 en vivo, 1.552 filas. La columna "Transfer" es la media de tres grupos (valores de atributo nuevos, emparejamientos nuevos y ambos).

| Modelo | Valores nuevos | Pares nuevos | Ambos nuevos | Media transfer | UI |
|---|---:|---:|---:|---:|---:|
| Encoder original, coseno | 46,61% | 48,83% | 44,53% | 46,66% | 99,22% |
| Control congelado emparejado, seed17 | 49,48% | 50,78% | 49,22% | 49,83% | 100,00% |
| Fine-tune completo, seed17 | 92,71% | 94,92% | 95,31% | 94,31% | 96,09% |
| Control congelado emparejado, seed41 | 50,78% | 52,73% | 51,56% | 51,69% | 100,00% |
| Fine-tune completo, seed41 | 84,11% | 85,16% | 88,67% | 85,98% | 96,09% |
| Frozen V4 anterior, 160 epocas | 58,85% | 63,28% | 59,38% | 60,50% | 89,84% |

Notas del autor: muchas filas comparten peticion con opciones distintas, por lo que no son 1.552 tareas independientes. El control congelado de cuatro epocas no es el mejor baseline congelado convergido; V4 se incluye como referencia practica con un presupuesto de entrenamiento distinto. Ambas semillas completas conservaron 127/127 respuestas en una suite semantica anterior, pero perdieron 3,125 puntos porcentuales frente al encoder original en el split UI nuevo. Las elecciones de GPU y Mac q8 difieren en 7/1.552 y 8/1.552 filas para las semillas completas.

Latencia: en un Mac M3/16GB, un benchmark caliente diagnostico fijo midio p50 de 17,6-19,6 ms para Reflex y 17,3-17,4 ms para la referencia Laya MLX multilingue instalada. Las repeticiones principales fueron mucho mas ruidosas: Reflex 34,4-48,3 ms y la referencia 31,5-70,9 ms. El test completo con entradas variables midio 45,1/49,5 ms para las dos semillas completas. El autor advierte explicitamente de no interpretar los resultados calientes mas rapidos como latencia universal ni como paridad demostrada con Laya.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 271M parametros, aproximadamente 0,55 GB en BF16 y unos 0,27 GB en MLX q8 solo para pesos, mas activaciones y cache. El repositorio completo ocupa 1,7 GB porque incluye ambas semillas en BF16 y q8 junto con el runtime Swift.
- GPU de entrenamiento documentada: una RTX A5000, con unos 24 minutos por semilla.
- Cabe en GPU de consumo: si, dado el tamano (271M de parametros). No se especifican modelos concretos recomendados en la informacion disponible.
- Apple Silicon: el autor documenta ejecucion en un Mac M3 con 16 GB mediante runtime MLX Swift.
- CPU: existe una referencia en CPU en Python (Python 3.12), que no presenta la latencia MLX reportada.
- Opciones de despliegue documentadas: runtime MLX Swift (dependencias MLX 0.32.3 y swift-transformers 1.3.0, compilado con Xcode 26.4/Swift 6.3) y referencia en CPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; el formato text-q8 es afin de 8 bits de MLX, no GGUF.
- Latencia: p50 de 17,6-19,6 ms en M3/16GB (benchmark diagnostico caliente); 34,4-48,3 ms en repeticiones principales; 45,1/49,5 ms en test de entradas variables. Throughput no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con la referencia multilingue Laya MLX y con los baselines del propio estudio. No se aportan datos de otros modelos comparables (Jev y Clef se mencionan como referencias de no superioridad, sin cifras).

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmbeddingGemma2-Reflex (seed17) | 271M + 238K | No disponible | Transfer 94,31%; UI 96,09% | Apache-2.0 | HuggingFace (mlx, safetensors) |
| EmbeddingGemma2-Reflex (seed41) | 271M + 238K | No disponible | Transfer 85,98%; UI 96,09% | Apache-2.0 | HuggingFace (mlx, safetensors) |
| Encoder original, coseno (baseline) | 271M | No disponible | Transfer 46,66%; UI 99,22% | Apache-2.0 | google/embeddinggemma-2 |
| Referencia Laya MLX multilingue | No disponible | No disponible | Latencia p50 17,3-17,4 ms (caliente); sin datos de precision | No disponible | No disponible |

Datos de precision de Laya, Jev y Clef: no disponibles.

## Limitaciones y advertencias

- Pesos experimentales: el autor afirma que V6 no supero su puerta completa de promocion y que los controles de aceptacion preinscritos de V7 no se superaron en su totalidad.
- Regresion en UI: ambas semillas completas perdieron 3,125 puntos porcentuales frente al encoder original en el split UI nuevo (de 99,22% a 96,09%).
- Sin garantia de abtencion: entradas invalidas o sin opciones adecuadas pueden producir respuestas erroneas con alta confianza. No hay mecanismo de abtencion implementado.
- Puntuaciones no calibradas: las puntuaciones devueltas usan softmax a T=1 y el autor indica que no son probabilidades calibradas validadas para entradas arbitrarias; la calibracion de GPU no se traslada silenciosamente a la exportacion para Mac.
- Idioma unico: solo ingles, lo que limita su uso en castellano u otros idiomas.
- Solo texto: no admite vision ni audio, y no genera explicaciones ni cadena de pensamiento.
- Modelo de decision, no generativo: no debe emplearse para generacion de texto, codigo ni matematicas.
- Dependencia del conjunto de opciones: el rendimiento esta ligado a la distribucion de 3-6 opciones vista en entrenamiento.
- Riesgo de alucinacion: al ser un clasificador con softmax no calibrado, puede asignar puntuaciones altas a opciones incorrectas; conviene validar con datos propios antes de produccion.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de rendimiento ni de estabilidad; el modelo base google/embeddinggemma-2 puede tener sus propios terminos asociados.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion sin validacion externa conocida.
- Portabilidad de formatos: el formato text-q8 es especifico de MLX y no es compatible directamente con GGUF u otros formatos de cuantizacion estandar de Torch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nurymanau/EmbeddingGemma2-Reflex
- Resultados y uso de V7: https://huggingface.co/Nurymanau/EmbeddingGemma2-Reflex/blob/main/v7/README.md
- Resultados detallados y alcance: https://huggingface.co/Nurymanau/EmbeddingGemma2-Reflex/blob/main/results.json
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Requisitos de la referencia en CPU: requirements-reference.txt (en el repositorio)
- Requisitos para Mac: requirements-mac.txt (en el repositorio)
- SDK de origen del runtime Swift: EmbeddingGemma2Swift SDK (licencia MIT, referenciado en la model card)
