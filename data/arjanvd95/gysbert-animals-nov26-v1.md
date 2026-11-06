# ArjanvD95/gysbert-animals-nov26-v1

## Resumen

gysbert-animals-nov26-v1 es un modelo de clasificacion de tokens (token classification) especializado en la identificacion de menciones de animales en neerlandes historico (Early Modern y siglos XVIII-XIX). Lo desarrolla ArjanvD95 como un fine-tuning de GysBERT v1, el encoder BERT preentrenado sobre textos historicos neerlandeses de emanjavacas. El modelo resuelve una tarea concreta de extraccion de informacion sobre corpus historicos: marcar con etiquetas BIO (`B-Animal`, `I-Animal`, `O`) las palabras o frases que designan un animal completo, literal o figuradamente.

La particularidad del proyecto es metodologica: se ha entrenado sin ninguna anotacion humana. Todas las etiquetas de entrenamiento provienen de un profesor LLM (`gpt-6-luna`) en modo zero-shot, y las oraciones se seleccionaron mediante aprendizaje activo a partir de un pool de 940.472 frases del corpus DBNL (Digitale Bibliotheek voor de Nederlandse Letteren). Se trata, en palabras del autor, de un experimento sobre construccion de taggers sin etiquetas humanas, no de un instrumento de investigacion acabado.

El modelo tiene 108.893.955 parametros (encoder BERT-base de GysBERT), un repositorio de 0,4 GB, licencia MIT y esta pensado para integrarse en pipelines de humanidades digitales y procesamiento de lenguaje historico neerlandes. Su interes actual radica en demostrar que un ciclo de aprendizaje activo con un profesor LLM puede producir un tagger funcional (F1 de token 0,789 en test) con un coste de API de aproximadamente 1,30 dolares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (GysBERT v1) con cabeza de clasificacion de tokens |
| Parametros totales | 108.893.955 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (GysBERT es un encoder BERT-base; se recomienda ventana deslizante para frases largas) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan variantes GGUF u ONNX) |
| Idiomas soportados | neerlandes (nl), en su variante historica |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Etiquetas | BIO: `B-Animal`, `I-Animal`, `O` |
| Modelo base | emanjavacas/GysBERT |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT (GysBERT v1, aproximadamente 110M de parametros) al que se le anade una cabeza lineal de clasificacion de tokens sobre el vocabulario BIO de tres etiquetas. GysBERT es un BERT preentrenado especificamente sobre neerlandes historico, lo que le da una ventaja sobre encoders modernos a la hora de representar grafias y morfologia de los siglos XVII-XIX.

El entrenamiento no utiliza anotacion humana. El profesor `gpt-6-luna` etiqueta en zero-shot con esfuerzo de razonamiento medio, siguiendo las directrices del prompt v2 recogidas en `task.json`. El pool de partida son 940.472 frases DBNL de entre 4 y 80 palabras, tras eliminar todas las frases de los textos de dev y test y sus casi-duplicados. El ciclo de aprendizaje activo arranca con 250 frases (mitad seleccionadas por un filtro si/no del profesor, mitad aleatorias); en cada ronda posterior el modelo puntua 50.000 frases aleatorias del pool y se etiquetan con el profesor las 100 de menor confianza mas 100 encontradas por el filtro, reentrenando desde cero. La parada temprana es sin etiquetas humanas, basada en la concordancia del modelo con el profesor en las frases nuevas de cada ronda; se detuvo tras la ronda 9. En total: 2.250 frases etiquetadas, 1.372 con animal, y un coste de API de aproximadamente 1,30 dolares.

La receta de cada reentrenamiento es de hasta 10 epocas, learning rate 5e-5, batch 8, fp16, conservando la epoca con menor perdida en dev (paciencia 3). Las etiquetas de dev se usan solo para elegir epoca y monitorizar, nunca para entrenar.

## Capacidades

- Reconocimiento de entidades nombradas (NER) de tipo animal en neerlandes historico, con etiquetado BIO a nivel de token.
- Deteccion de menciones literales y figuradas de animales completos, individuales o colectivos (`Leeu`, `Visch`, `vee`, `Dieren`, `gevogelte`, `Potwalvis`).
- Distincion explicita de lo que no se marca: personas y partes del cuerpo humano, partes de animales (`staart`, `vleugels`, `veeren`, `hoorn`), productos y sustancias animales (`vleesch`, `kaes`, `honigh`, `wol`, `leder`, `venijn`).
- Integracion con la libreria `genannote` mediante `HFEncoderAnnotator`, con alineamiento a nivel de palabra y ventana deslizante para frases largas.
- Uso directo con el pipeline `token-classification` de Transformers con `aggregation_strategy="first"`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es un encoder discriminativo de clasificacion, no un modelo generativo.
- Capacidad multilingue limitada al neerlandes; no se documenta soporte de otras lenguas.

## Casos de uso

- Extraccion de menciones de fauna en corpus de humanidades digitales: procesar colecciones DBNL o similares para construir indices de animales citados en poesia, emblemas, cancioneros y tratados de historia natural de los siglos XVII-XIX, aprovechando el preentrenamiento de GysBERT sobre neerlandes historico.
- Enriquecimiento de ediciones digitales: anotar automaticamente textos literarios historicos con entidades de tipo animal para facilitar busquedas tematicas, visualizaciones y estudios de simbologia animal en la literatura neerlandesa.
- Investigacion en historia de la ciencia: localizar menciones de especies en textos de historia natural y comparar vocabulario faunistico entre periodos, usando el modelo como primer paso de cribado que luego revisa un experto.
- Prototipado de pipelines NER sin anotacion humana: servir de referencia metodologica para equipos que quieran replicar el ciclo de aprendizaje activo con profesor LLM y medir su viabilidad en dominios con pocos recursos anotados.
- Filtrado y triaje de corpus: dado que la precision es alta (0,92) y el recall menor (0,69), usar el modelo para preseleccionar candidatos con alta confianza y reducir el volumen de texto que un anotador humano debe revisar.
- Docencia y experimentacion: ejemplo reproducible de fine-tuning de un encoder BERT con `genannote` y evaluacion con metricas a nivel de token y de span, util en cursos de PLN historico o de anotacion automatica.
- Integracion en herramientas de analisis textual para investigadores: mediante la API de `genannote` o el pipeline de Transformers, incorporar el tagger a cuadernos de analisis o visores de corpus.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre los conjuntos `animals_ner_dutch` dev (248 frases) y test (250 frases), con anotacion gold bajo la misma lectura de animal completo. Metricas a nivel de token, solo positivos, mas F1 a nivel de span:

| Modelo | F1 test (P / R) | F1 span test | F1 dev |
|---|---|---|---|
| gysbert-animals-nov26-v1 | 0,789 (0,92 / 0,69) | 0,768 | 0,821 |
| `gpt-6-luna` zero-shot (profesor) | 0,914 (0,904 / 0,925) | 0,885 | 0,941 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo discriminativo de NER.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,4-0,5 GB en fp32 para los 108,9M de parametros, mas el overhead de activaciones y tokenizador; en fp16 aproximadamente la mitad. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, T4, A100 o H100 son sobredimensionadas para este modelo y funcionaran sin problema.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en CPU para lotes pequenos.
- Opciones de despliegue: pipeline `token-classification` de Transformers, `HFEncoderAnnotator` de `genannote`, y servidores de inferencia compatibles con modelos de Transformers (por ejemplo, Text Generation Inference no aplica; si aplican soluciones de inferencia de encoders como TorchServe o un endpoint propio). No se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera inferencia en milisegundos por frase en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | F1 test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gysbert-animals-nov26-v1 | 108,9M | no disponible | NER animal en neerlandes historico | 0,789 (token) / 0,768 (span) | MIT | Hugging Face |
| emanjavacas/GysBERT (base) | ~110M | no disponible | Encoder de neerlandes historico (preentrenamiento) | no aplica (no es tagger) | no disponible en la informacion | Hugging Face |
| `gpt-6-luna` zero-shot (profesor) | no disponible | no disponible | NER animal en neerlandes historico | 0,914 (token) / 0,885 (span) | no disponible | API propietaria |
| ArjanvD95/dbnl_gysbert | no disponible | no disponible | Modelo relacionado del mismo autor | no disponible | no disponible | Hugging Face |

No se dispone de otros taggers NER comparables de neerlandes historico en la informacion proporcionada.

## Limitaciones y advertencias

- El recall es el punto debil: el modelo pierde aproximadamente el 30% de los tokens de animal; lo que etiqueta suele ser correcto (precision 0,92).
- Material de test muy estrecho: dev y test provienen de solo 8 textos DBNL (poesia de los siglos XVII y XVIII, libros de emblemas y canciones, historia natural), por lo que las puntuaciones dicen poco sobre otros generos o periodos.
- Una sola ejecucion de entrenamiento: reentrenar con los mismos datos mueve las puntuaciones en torno a mas o menos 0,03 de F1 por si solo, lo que limita la comparacion fina entre variantes.
- Errores heredados del profesor: `gpt-6-luna` a veces lee homografos como animales (`paerden` en el sentido de "aparearse", `lemm'ren` en el sentido de "rayos") y no siempre es consistente sobre si los adjetivos forman parte del span.
- Entrenado con las directrices del prompt v2; una revision posterior (v3) cubre huevos y larvas tratados como animales, palabras de animal usadas figuradamente para personas, arenque como alimento frente a pez, y limites de span. Este modelo no incorpora esas correcciones.
- No es un instrumento de investigacion acabado segun el propio autor; debe tratarse como prototipo experimental.
- Licencia MIT: permite uso comercial, pero el modelo hereda posibles sesgos y errores del profesor y de los datos DBNL, y no se ofrecen garantias de calidad.
- Riesgo de alucinacion en el sentido de falsos positivos y falsos negativos en la anotacion; no genera texto, por lo que el riesgo generativo no aplica, pero la fiabilidad de las etiquetas en dominios fuera del test es desconocida.
- Limitacion idiomatica estricta al neerlandes historico; no debe esperarse buen rendimiento en neerlandes contemporaneo ni en otras lenguas sin reevaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArjanvD95/gysbert-animals-nov26-v1
- Modelo base GysBERT v1: https://huggingface.co/emanjavacas/GysBERT
- Modelo relacionado del autor (dbnl_gysbert): https://huggingface.co/ArjanvD95/dbnl_gysbert
- Repositorio del modelo relacionado: https://huggingface.co/ArjanvD95/dbnl_gysbert/tree/main
