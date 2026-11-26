# AbdullahKhanSherwani/invoice-order-gate-qwen35-08b

## Resumen

invoice-order-gate-qwen35-08b es un ajuste fino mediante LoRA del modelo Qwen3.5-0.8B, publicado por AbdullahKhanSherwani, que actua como clasificador binario de conciliacion documental: recibe una factura, su orden de compra y el registro de entrega, y emite una unica etiqueta PASS (los documentos concuerdan) o REVIEW (existe alguna discrepancia). No es un modelo generativo de proposito general, sino un cabezal de decision restringido que puntua dos tokens de etiqueta en un unico forward pass mediante el metodo SearchJev.

El modelo resuelve un problema muy concreto de automatizacion de cuentas a pagar: el triaje previo de facturas antes de su aprobacion. Con 752 millones de parametros y un peso GGUF de 581 MB en su cuantizacion por defecto (Q5_K_M), esta disenado para ejecutarse en CPU y ofrecer latencias de alrededor de 1,74 segundos por caso, lo que lo hace viable en entornos sin GPU.

Su relevancia es doble: por un lado demuestra que un modelo sub-1B puede superar ampliamente a su base (95/100 frente a 56/100 en el conjunto de test sintetico) cuando se le especializa con una readout restringida; por otro, su alcance esta explicitamente limitado a un benchmark sintetico de documentos con plantilla en USD y no ha sido validado con documentos reales. La licencia Apache-2.0 facilita su experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con adaptador LoRA fusionado y readout restringido SearchJev de dos tokens |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en la configuracion de referencia (`-c 2048`) |
| Tipos de cuantizacion | Q5_K_M (por defecto, 581 MB), Q4_K_M (535 MB), Q8_0, f16 |
| Idiomas soportados | no disponible (el benchmark es en ingles, documentos USD) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp b12774) y safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de 752 millones de parametros, sobre el que se aplica un LoRA con rango 16 y alpha 32, entrenado durante 5 epocas en fp16 sobre una GPU de Colab. La innovacion principal no esta en la arquitectura base sino en el mecanismo de decision: en lugar de generar texto libre, el modelo puntua dos tokens de etiqueta (id 32 = "A" para PASS, id 33 = "B" para REVIEW) y la decision se toma por argmax tras aplicar un softmax con temperatura de calibracion T = 1,2545281545901361, fijada sobre validacion antes de evaluar el test.

Los datos proceden del dataset sintetico LocalLLaMA/typed-decisions, subconjunto `invoice_processing`, pregunta `matches_order`. Se usaron 245 casos de entrenamiento y 55 de validacion, separados por hash del estado del caso, dejando intactos los 100 casos de test. La funcion de perdida combina entropia cruzada con etiquetas suaves y perdida de Brier sobre la readout de tokens de etiqueta. La conversion final fue: LoRA fusionado en fp32, conversion a GGUF f16 con llama.cpp b12774 y cuantizacion posterior con llama-quantize.

## Capacidades

- Clasificacion binaria de conciliacion documental: emite PASS o REVIEW para un trio factura / orden de compra / albaran de entrega.
- Deteccion de discrepancias de precio, cantidades y entregas no recibidas en documentos con plantilla.
- Puntuacion calibrada: devuelve una probabilidad de REVIEW mediante softmax con temperatura guardada, no solo la etiqueta.
- Inferencia en un unico forward pass sobre dos tokens de etiqueta, sin generacion autoregresiva.
- Ejecucion en CPU mediante llama.cpp con log-probabilidades accesibles a traves de `completion_probabilities`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; el entrenamiento y la evaluacion son en ingles con importes en USD.

## Casos de uso

- Triaje de facturas en cuentas a pagar: el modelo actua como primer filtro que separa las facturas que concuerdan con su orden de compra de las que requieren revision humana, reduciendo la carga del equipo financiero antes de la aprobacion formal.
- Deteccion de discrepancias de precio: ante una factura con importe distinto al de la orden de compra, el modelo devuelve REVIEW con una probabilidad calibrada, como demuestra el caso sintetico `invoice_processing_000016` con P(REVIEW) aproximada de 0,863.
- Control de entregas no recibidas: identifica casos en los que no consta recepcion de mercancia y la factura se presenta igualmente, uno de los fallos documentados del modelo en el conjunto de test.
- Pre-validacion en pipelines de facturacion electronica: al ejecutarse en CPU con latencias de 1,74 segundos, puede integrarse como paso previo en un flujo por lotes nocturno sin consumir recursos de GPU.
- Prototipado de sistemas de decision restringida: sirve como referencia tecnica para equipos que quieran replicar el patron SearchJev de readout de dos tokens sobre un modelo pequeno.
- Evaluacion comparativa de cuantizaciones: el autor publica resultados por cuantizacion (Q5_K_M 95/100, Q4_K_M 90/100), lo que permite medir el compromiso entre tamano y precision en despliegues con recursos limitados.
- Docencia y experimentacion con LoRA: el repositorio incluye solicitud de demostracion, ficheros de calibracion y espacio de etiquetas, lo que facilita reproducir el ajuste completo en hardware modesto.

## Benchmarks y rendimiento

Resultados sobre los 100 casos de test retenidos (46 REVIEW, 54 PASS):

| Modelo | Aciertos | REVIEW no detectados | Falsas alarmas |
|---|---|---|---|
| Qwen3.5-0.8B base, mismo prompt | 56/100 | 19/46 | 25/54 |
| Adaptador ajustado (fp16) | 95/100 | 3/46 | 2/54 |
| GGUF Q5_K_M (581 MB, por defecto) | 95/100 | 3/46 | 2/54 |
| GGUF Q4_K_M (535 MB) | 90/100 | 8/46 | 2/54 |
| GGUF Q8_0 y f16 | 95/100 | no disponible | no disponible |

En validacion (55 casos), Q5_K_M falla 8/37 REVIEW, igual que el adaptador, mientras que Q4_K_M falla 9/37. El margen de error indicado por el autor es de aproximadamente mas o menos 4 puntos sobre 100 casos. Latencias en CPU (Intel i7-1165G7, llama.cpp b12774, unos 470 tokens de prompt): mediana de 1,74 s con Q5_K_M y 1,84 s con Q4_K_M.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; en CPU el modelo ocupa 581 MB en Q5_K_M y 535 MB en Q4_K_M.
- GPU recomendadas: no disponibles; cualquier GPU con al menos 1-2 GB de memoria libre puede alojar el modelo en f16, pero el autor no publica cifras de GPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU dedicada; el caso de referencia es un Intel i7-1165G7 de portatil.
- Despliegue: llama.cpp b12774 mediante `llama-server` con `-c 2048 -t 8 --no-warmup`; el formato GGUF es compatible con el ecosistema llama.cpp, aunque no se documenta soporte verificado en vLLM, TGI u Ollama.
- Latencia: mediana de 1,74 s por caso en Q5_K_M y 1,84 s en Q4_K_M con aproximadamente 470 tokens de prompt en CPU. No se publican datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| invoice-order-gate-qwen35-08b | 752 M | 2048 | Clasificador PASS/REVIEW con readout de dos tokens | Apache-2.0 | GGUF y safetensors en Hugging Face |
| Qwen3.5-0.8B base | 752 M | no disponible | Generacion de proposito general | Apache-2.0 | Hugging Face |
| Alternativas especializadas en conciliacion documental | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada por el autor es contra el modelo base con el mismo prompt, donde el ajuste mejora de 56/100 a 95/100. No se han publicado comparaciones con otros modelos especializados en triaje de facturas en la informacion disponible.

## Limitaciones y advertencias

- Ambito restringido: solo validado en un benchmark sintetico con documentos de plantilla en USD; no ha sido evaluado con documentos reales de ordenes de compra, albaranes o facturas.
- El modelo aprendio el generador sintetico, por lo que su generalizacion a formatos reales es incierta.
- Es una ayuda al triaje, no un aprobador: el autor indica explicitamente que no debe usarse como decision final.
- Los casos limite con probabilidad cercana a 0,5 son frecuentes entre los errores; se recomienda umbral de revision humana en esa banda.
- Fallos conocidos en Q5_K_M: `invoice_processing_000048`, `_000072` (nada recibido, predicho PASS) y `_000092`; falsas alarmas en `_000045` y `_000074`.
- No se documentan sesgos especificos, pero al entrenarse solo con datos sinteticos en ingles y USD puede degradarse con otras divisas, idiomas o convenciones documentales.
- Riesgo de alucinacion no aplicable en el sentido generativo, ya que la salida esta restringida a dos etiquetas; el riesgo equivalente es la clasificacion erronea con confianza alta.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de validacion con datos reales desaconseja su despliegue en produccion sin una evaluacion propia.
- Dependencia de la version de llama.cpp: el autor especifica b12774 para reproducir los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbdullahKhanSherwani/invoice-order-gate-qwen35-08b
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio SearchJev (commit de referencia): https://github.com/EvoScientist/SearchJev/tree/054ea81d43071b93e2d75b7396a729a2598ac6ac
