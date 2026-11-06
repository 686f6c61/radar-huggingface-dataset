# ArjanvD95/gysbert-animals-nov26-v2

## Resumen

gysbert-animals-nov26-v2 es un clasificador de tokens (NER) especializado en marcar menciones de animales en neerlandes historico (Early Modern y siglos XVIII-XIX). Lo desarrolla ArjanvD95 como fine-tuning del modelo base emanjavacas/GysBERT v1, un BERT entrenado sobre texto neerlandes historico. El modelo resuelve una tarea muy concreta de extraccion de entidades sobre corpus historicos digitalizados (DBNL), donde la variacion ortografica y lexica hace inviable el uso de NER moderno estandar.

El aspecto mas relevante no es el modelo en si, sino su metodologia: se ha entrenado sin ninguna etiqueta humana. Todas las etiquetas de entrenamiento provienen de un profesor LLM (`gpt-6-luna`) en modo zero-shot, y las oraciones de entrenamiento se seleccionaron mediante aprendizaje activo a partir de un pool de 940.472 oraciones del DBNL. Es un experimento sobre construccion de taggers sin anotacion humana, no un instrumento de investigacion acabado, segun declara el propio autor.

Arquitectura transformer encoder (BERT base) con 108.893.955 parametros, licencia MIT, idioma unico (neerlandes) y pipeline de token-classification. El modelo es pequeno, cabe en cualquier GPU consumer y su interes principal es metodologico y de nicho filologico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), fine-tuning de emanjavacas/GysBERT |
| Parametros totales | 108.893.955 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (GysBERT base es BERT; la model card no declara max_position_embeddings) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se publican GGUF ni quantizados) |
| Idiomas soportados | neerlandes (nl), incluyendo neerlandes historico |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base fine-tuneado para token classification con esquema BIO de tres etiquetas (`B-Animal`, `I-Animal`, `O`). Parte de GysBERT v1, un BERT entrenado especificamente sobre neerlandes historico, lo que le permite manejar ortografia y lexico de los siglos XVII-XIX. El fine-tuning se realizo con la libreria genannote.

El entrenamiento es enteramente sintetico: cada etiqueta proviene de `gpt-6-luna` (zero-shot, reasoning effort medium) bajo las guias del prompt v3. El pool de partida son 940.472 oraciones del DBNL (4-80 palabras), excluyendo previamente todas las oraciones de los textos de los que salen dev y test, asi como casi-duplicados de estas. El aprendizaje activo arranca con 250 oraciones (mitad filtradas por un si/no del profesor, mitad aleatorias); en cada ronda posterior el modelo puntua 50.000 oraciones aleatorias del pool y el profesor etiqueta las 100 de menor confianza mas 100 encontradas por filtro, reentrenando desde cero. Se detuvo en la ronda 9, con un total de 2.250 oraciones etiquetadas (1.211 con animal) y un coste de API de aproximadamente 1,35 USD. La receta por refit: hasta 10 epocas, lr 5e-5, batch 8, fp16, seleccion de la epoca con menor perdida en dev (patience 3). Las etiquetas de dev solo se usan para elegir epoca y monitorizar, nunca para entrenar.

## Capacidades

- Reconocimiento de entidades nombradas (NER) de tipo animal en neerlandes historico, con etiquetas BIO.
- Deteccion de animales completos de cualquier tipo, incluidas palabras especificas para crias (`veulen`, `kalf`, `lam`).
- Deteccion de colectivos de animales (`vee`, `Dieren`, `gevogelte`).
- Deteccion de huevos, larvas y estadios vitales cuando el texto los trata como animales (huevos que eclosionan), pero no como alimento.
- Deteccion de uso figurado del termino animal, incluso aplicado a personas (`ezel` en el sentido de "tonto", `Dier` en `menschelick Dier`).
- Deteccion de animales muertos o carrona tratados como animal (`karoignie`).
- Delimitacion de spans: el sustantivo animal y, solo cuando identifica la especie, su modificador (`woldraghende vee` = ovejas; `Potwalvis`, no `grooten Potwalvis`).
- No marca personas ni partes del cuerpo humano, palabras genericas de descendencia aplicables a personas (`jongen`), partes de animales (`staart`, `vleugels`, `veeren`), productos y alimentos animales (`vleesch`, `kaes`, `honigh`, `wol`), ni compuestos cuyo nucleo es otra cosa (`Haringh-vanghst`).
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento: es exclusivamente un tagger de tokens.

## Casos de uso

- Extraccion de menciones de animales en corpus historicos digitalizados: procesar textos del DBNL para construir indices o anotaciones de fauna mencionada, aprovechando que el modelo esta entrenado sobre neerlandes historico y tolera la variacion ortografica de la epoca.
- Investigacion filologica y de historia natural: localizar pasajes sobre animales en poesia, emblemas, cancioneros y tratados de historia natural de los siglos XVII y XVIII, que son precisamente los generos representados en dev y test.
- Construccion de datasets etiquetados a bajo coste: usar el modelo como preanotador y reservar la revision humana para los casos de baja confianza, dado que su precision (0,89) es alta y su recall (0,73) es el lado debil.
- Enriquecimiento de bibliotecas digitales: anadir metadatos de entidades de fauna a colecciones textuales para busqueda y navegacion tematica.
- Experimentacion metodologica en NLP historico: replicar o estudiar el pipeline de aprendizaje activo con profesor LLM y sin anotacion humana, usando el modelo como referencia reproducible (receta, coste y guias documentados en `task.json` y `metrics.json`).
- Filtrado de candidatos para curación manual: dado que lo que etiqueta suele ser correcto, sirve para reducir el volumen de texto que un anotador humano debe revisar en busquedas de menciones animales.
- Analisis de figuras retoricas: detectar usos figurados de terminos animales aplicados a personas, que el modelo marca explicitamente segun las guias.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre los conjuntos `animals_ner_dutch` dev (248 oraciones) y test (250 oraciones), con anotacion gold. Metricas a nivel de token, solo positivos, mas F1 a nivel de span:

| Modelo | test F1 (P / R) | test span F1 | dev F1 |
|---|---|---|---|
| gysbert-animals-nov26-v2 (este modelo) | 0,801 (0,89 / 0,73) | 0,763 | 0,819 |
| gysbert-animals-nov26-v1 (guias v2) | 0,789 (0,92 / 0,69) | 0,768 | 0,821 |
| `gpt-6-luna` zero-shot (el profesor) | 0,961 (0,957 / 0,965) | 0,953 | 0,955 |

Advertencia del autor: las guias v3 se redactaron a partir de los errores del profesor en el propio test, lo que favorece la puntuacion del profesor en test y posiblemente la del modelo. En dev, las dos versiones de GysBERT son equivalentes dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp16 (108,9 M de parametros, aproximadamente 0,22 GB de pesos en fp16 y 0,44 GB en fp32), mas overhead de activaciones y tokenizer.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura.
- Cabe en GPU consumer: si, en practicamente todas, incluidas GPUs de portatil con 4 GB o mas. Tambien puede ejecutarse en CPU para lotes pequenos.
- Opciones de despliegue: `transformers` pipeline de token-classification, `genannote` (HFEncoderAnnotator), y servidores de inferencia compatibles con modelos transformers. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera inferencia de milisegundos por oracion en GPU, pero no hay cifras publicadas.
- Nota practica: el pipeline devuelve el campo `word` en minusculas porque el tokenizer las aplica; para recuperar la grafia original hay que cortar con `start` y `end`. Para oraciones largas con genannote se recomienda alineamiento a nivel de palabra y ventana deslizante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gysbert-animals-nov26-v2 | 108,9 M | no disponible | NER de animales en neerlandes historico | MIT | Hugging Face |
| gysbert-animals-nov26-v1 | ~108,9 M (mismo base) | no disponible | NER de animales en neerlandes historico | MIT (presumible, no confirmado) | Hugging Face |
| emanjavacas/GysBERT (base) | BERT base (~110 M) | no disponible | Modelo de lenguaje enmascarado para neerlandes historico | no disponible en la informacion | Hugging Face |
| `gpt-6-luna` (profesor) | no disponible | no disponible | NER zero-shot generico | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables de NER de animales en neerlandes historico en la informacion proporcionada.

## Limitaciones y advertencias

- El recall es el punto debil: el modelo pierde aproximadamente una cuarta parte de los tokens de animal; lo que etiqueta suele ser correcto (precision 0,89 frente a recall 0,73 en test).
- Esta muy por debajo de su profesor: con 2.250 oraciones GysBERT no alcanza la calidad de `gpt-6-luna`, y un profesor mejor (v3 frente a v2) no mejoro de forma medible el resultado.
- Material de test estrecho: dev y test provienen de solo 8 textos del DBNL (poesia de los siglos XVII y XVIII, libros de emblemas y canciones, historia natural), por lo que las puntuaciones dicen poco sobre otros generos o periodos.
- Una sola ejecucion de entrenamiento: reajustar los mismos datos mueve las puntuaciones en torno a mas/menos 0,03 F1 por si solo, asi que las diferencias pequenas entre versiones no son significativas.
- Hereda errores del profesor: este a veces lee un homografo como animal (`paerden` en el sentido de "aparearse", `lemm'ren` en el sentido de "rayos").
- Riesgo de alucinacion: como tagger de clasificacion no genera texto libre, pero puede producir falsos positivos en homografos y usos figurados no previstos por las guias.
- Limitacion de idioma: solo neerlandes, y en la practica orientado a neerlandes historico; no se ha evaluado en neerlandes contemporaneo.
- Licencia MIT: permite uso comercial y modificacion sin restricciones practicas, pero el autor lo describe como experimento, no como instrumento de investigacion acabado; conviene validar en el dominio de destino antes de usarlo en produccion.
- Caveat de evaluacion: la puntuacion de test puede estar inflada porque las guias v3 se derivaron de errores del profesor en ese mismo conjunto.
- El pipeline minusculiza la salida en el campo `word`; hay que usar `start`/`end` para preservar la grafia original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArjanvD95/gysbert-animals-nov26-v2
- Version anterior v1: https://huggingface.co/ArjanvD95/gysbert-animals-nov26-v1
- Modelo base GysBERT: https://huggingface.co/emanjavacas/GysBERT
- Otros modelos del autor: https://huggingface.co/ArjanvD95/animals3
- Otros modelos del autor: https://huggingface.co/ArjanvD95/dbnl_gysbert
