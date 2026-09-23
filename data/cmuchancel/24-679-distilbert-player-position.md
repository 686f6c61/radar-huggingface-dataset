# cmuchancel/24-679-distilbert-player-position

## Resumen

El modelo `cmuchancel/24-679-distilbert-player-position` es un clasificador de texto de cuatro clases (portero, defensa, centrocampista y delantero) construido mediante fine-tuning completo de DistilBERT (`distilbert-base-uncased`) sobre descripciones textuales de jugadores de la Premier League. Lo desarrolla el usuario de HuggingFace `cmuchancel` en el contexto del curso CMU 24-679, y se distribuye con licencia MIT. No es un modelo generativo: es una cabeza de clasificación multiclase sobre un encoder de 66 millones de parametros.

El interes practico de la ficha es limitado pero instructivo: se trata de un ejemplo canonico de fine-tuning con AutoGluon MultiModal sobre un dataset muy pequeno (1050 ejemplos de entrenamiento, 15 de validacion y 15 de test) y con resultados moderados (exactitud de test 0.7333, F1 ponderado 0.7222, 4 errores de 15 ejemplos). Sirve sobre todo como referencia metodologica de un pipeline AutoGluon + DistilBERT y como baseline para tareas de etiquetado automatico de posiciones en analitica deportiva.

La relevancia de catalogarlo es doble: por un lado documenta el flujo de trabajo tipico de un curso de NLP aplicado (tokenizacion, batching, seleccion de checkpoint por exactitud de validacion, analisis de errores); por otro, sus cifras ilustran con claridad por que las metricas sobre conjuntos de 15 ejemplos no son fiables. El repositorio ocupa 0,3 GB y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), solo encoder, con cabeza de clasificacion multiclase |
| Parametros totales | Aproximadamente 66 millones (corresponden al modelo base `distilbert-base-uncased`; la model card no los explicita) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | El modelo base admite 512 tokens; en esta tarea las entradas se limitan a 128 subtokens durante el preprocesamiento |
| Tipos de cuantizacion | No disponible (la model card no menciona cuantizacion) |
| Idiomas soportados | No disponible (la model card no los declara; el modelo base es `uncased` en ingles y el dataset procede de un corpus no especificado) |
| Licencia | MIT |
| Formato de pesos | No especificado; artefacto gestionado por AutoGluon MultiModal (repositorio de 0,3 GB). No se documentan pesos en safetensors ni GGUF |
| Tarea | `text-classification` (multiclase, 4 etiquetas) |
| Etiquetas | 0 = portero, 1 = defensa, 2 = centrocampista, 3 = delantero |
| Modelo base | `distilbert/distilbert-base-uncased` |
| Dataset de entrenamiento | `kadireks/2026-24679-text-dataset` |
| Libreria | AutoGluon |

## Arquitectura y entrenamiento

Se parte de DistilBERT, un transformer encoder destilado de BERT-base que conserva aproximadamente el 97 % del rendimiento de su profesor con alrededor del 60 % de sus parametros y siendo unas dos veces mas rapido. La cabeza de clasificacion se anade sobre la representacion del token `[CLS]` y produce cuatro logits. AutoGluon MultiModal se encarga de la tokenizacion y del batching; las entradas se truncan a 128 subtokens, muy por debajo del maximo de 512 del modelo base.

El fine-tuning es completo (no se congelan capas) y se realizo durante un maximo de 5 epocas con tasa de aprendizaje 2e-5, decaimiento de pesos 0,01, tamano de lote 8 y semilla 24679. El mejor checkpoint se selecciono por exactitud de validacion. No se aplico aumentacion aleatoria de texto. El entrenamiento se hizo en Google Colab con una unica GPU durante cinco epocas. La model card declara explicitamente que ChatGPT se uso para adaptar el cuaderno del curso, identificar los cambios necesarios para clasificacion multiclase, organizar la evaluacion y redactar el borrador de la tarjeta; el alumno ejecuto y verifico los resultados. No se documentan fases de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificacion de texto en cuatro clases de posicion de futbol (portero, defensa, centrocampista, delantero) a partir de una descripcion breve en lenguaje natural.
- Procesamiento de textos de hasta 128 subtokens, suficiente para parrafos cortos de scouting o descripciones de jugador.
- Inferencia rapida en CPU o GPU de gama baja, por el tamano reducido del encoder.
- Integracion con el ecosistema AutoGluon MultiModal para reentrenamiento o ajuste adicional.
- Capacidad de servir como extractor de caracteristicas de texto (representaciones de 768 dimensiones) si se reutiliza el encoder, aunque esto no se documenta en la tarjeta.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- No se declaran capacidades multilingues; el modelo base es `uncased` en ingles.

## Casos de uso

- Etiquetado automatico de informes de scouting: dado un parrafo descriptivo de un jugador de la Premier League, el modelo asigna una de las cuatro posiciones y reduce el trabajo manual de clasificacion en plataformas de datos deportivos. Apto para pre-etiquetado con revision humana dado el nivel de exactitud.
- Enriquecimiento de bases de datos de jugadores: cuando una ficha solo contiene texto libre y carece de campo estructurado de posicion, el clasificador puede rellenarlo de forma automatica en procesos ETL.
- Filtrado previo en analitica deportiva: descartar o enrutar descripciones irrelevantes antes de pasarlas a modelos mayores o a anotadores humanos, aprovechando el bajo coste computacional de DistilBERT.
- Baseline academico reproducible: sirve como punto de comparacion para experimentos de fine-tuning con AutoGluon sobre datasets tabulares y de texto pequenos, especialmente por tener la configuracion exacta documentada (learning rate, batch size, semilla).
- Demostracion docente de clasificacion multiclase: ilustra el ciclo completo de tokenizacion, entrenamiento, seleccion de checkpoint y analisis de errores en un curso de NLP.
- Prototipado de clasificadores de contenido editorial: el mismo pipeline AutoGluon + DistilBERT puede reutilizarse para taxonomias de cuatro clases en otros dominios, tomando este modelo como plantilla.
- Normalizacion de taxonomias en apuestas o fantasy football: unificar descripciones heterogeneas de jugadores en categorias canonicas antes de alimentar un motor de reglas.

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados en la model card del autor, medidos sobre conjuntos de validacion y test de 15 ejemplos cada uno.

| Metrica | Valor |
|---|---|
| Exactitud de validacion | 0,5333 |
| Exactitud de test | 0,7333 |
| F1 ponderado (test) | 0,7222 |
| Ejemplos de test mal clasificados | 4 / 15 |

Analisis de errores declarado por el autor: dos defensas clasificados como centrocampistas (descripciones centradas en pase, control y construccion), un centrocampista clasificado como delantero (descripcion con enfasis en ataque progresivo) y un portero clasificado como delantero pese a contener lenguaje especifico de porteros. No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible; estos no aplican a un clasificador de dominio tan especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (aproximadamente 260 MB de pesos) y del orden de 130 a 260 MB en fp16; el pico depende del tamano de lote y de la longitud de secuencia (maximo 128 subtokens).
- GPU recomendadas: cualquier GPU con mas de 2 GB de memoria es suficiente. El entrenamiento documentado se hizo en una unica GPU de Google Colab, sin especificar el modelo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 y equivalentes, e incluso en iGPU con memoria compartida suficiente.
- Inferencia en CPU: viable, con latencias del orden de milisegundos por ejemplo en procesadores modernos, aunque no se publican mediciones concretas.
- Opciones de despliegue: AutoGluon MultiModal (ruta nativa del artefacto), `transformers` con `DistilBertForSequenceClassification`, exportacion a ONNX Runtime o TorchScript. No aplican vLLM ni TGI en su configuracion habitual para clasificacion encoder-only; llama.cpp u Ollama solo serian relevantes si se generara una conversion a GGUF, que no esta documentada.
- Latencia y throughput estimados: no disponibles. La model card no incluye mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria (encoders de clasificacion de tamano pequeno). Los datos de arquitectura de los modelos comparados son publicos; los de rendimiento no son equiparables porque no existen evaluaciones sobre este dataset concreto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en esta tarea |
|---|---|---|---|---|---|
| `cmuchancel/24-679-distilbert-player-position` | ~66 M | 512 (uso a 128) | MIT | HuggingFace, 0 descargas | Exactitud test 0,7333; F1 ponderado 0,7222 |
| `distilbert-base-uncased` (sin ajustar) | ~66 M | 512 | Apache 2.0 | HuggingFace | No disponible (requiere ajuste especifico) |
| `bert-base-uncased` | ~110 M | 512 | Apache 2.0 | HuggingFace | No disponible |
| `roberta-base` | ~125 M | 512 | MIT | HuggingFace | No disponible |

No se dispone de comparaciones publicadas frente a otros clasificadores entrenados sobre el mismo dataset `kadireks/2026-24679-text-dataset`.

## Limitaciones y advertencias

- Los conjuntos de validacion y test tienen solo 15 ejemplos cada uno, por lo que las metricas reportadas tienen una incertidumbre muy alta. La discrepancia entre exactitud de validacion (0,5333) y de test (0,7333) es un sintoma claro de ello.
- Existe solapamiento lexical entre posiciones: las descripciones de defensas y centrocampistas comparten vocabulario de pase y construccion, lo que produce errores sistematicos.
- El modelo se ha entrenado exclusivamente con descripciones de la Premier League; no hay evidencia de generalizacion a otras ligas, categorias inferiores, futbol femenino u otros estilos de redaccion.
- Riesgo de alucinacion no aplica en sentido generativo (no produce texto libre), pero si existe riesgo de etiquetado incorrecto con alta confianza, especialmente en textos ambiguos o fuera de dominio.
- Al estar entrenado sobre 1050 ejemplos, el sobreajuste es probable; no se documentan curvas de entrenamiento ni regularizacion adicional.
- La model card no declara sesgos demograficos ni linguisticos, pero al usar `uncased` en ingles el modelo puede comportarse de forma desigual con textos en otros idiomas o con nombres propios no ingleses.
- Uso etico: el autor advierte explicitamente de que el modelo predice posicion de juego y no debe emplearse para juzgar la calidad, el valor de mercado, decisiones de empleo ni caracteristicas personales de un jugador.
- Licencia MIT: permite uso comercial y modificacion con atribucion y conservacion del aviso de copyright, sin garantia. Conviene verificar las condiciones del dataset de origen, que no se detallan en la model card.
- El repositorio no incluye pesos en formatos estandar como safetensors o GGUF, lo que anade friccion a la integracion fuera del ecosistema AutoGluon.
- Ausencia total de adopcion (0 descargas y 0 likes) implica que no hay validacion externa ni informes de terceros sobre su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmuchancel/24-679-distilbert-player-position
- Dataset de entrenamiento: https://huggingface.co/datasets/kadireks/2026-24679-text-dataset
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019, "DistilBERT, a distilled version of BERT"): https://arxiv.org/abs/1910.01108
- Documentacion de AutoGluon MultiModal: https://auto.gluon.ai/stable/tutorials/multimodal/index.html
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo: se limitan a paginas genericas de Google (Traduccion, Busqueda, Scholar, Images, Earth) sin relacion con esta ficha.
