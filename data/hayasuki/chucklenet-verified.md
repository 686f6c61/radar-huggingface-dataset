# Hayasuki/chucklenet-verified

## Resumen

ChuckleNet Verified es un clasificador de audio binario especializado en la detección y anticipación de risas de audiencia en grabaciones de monólogo. Lo desarrolla Subhajit Das (publicado en HuggingFace bajo la cuenta Hayasuki) y se apoya en `microsoft/wavlm-base` como extractor de representaciones congelado, sobre el que se monta una cabeza MLP con características prosódicas que emite una probabilidad de risa por ventana temporal.

Su relevancia no está en el tamaño (el repo de pesos contiene 120.556 parámetros según safetensors, frente a los ~230K que declara la model card para la cabeza MLP), sino en la metodología de etiquetado: a diferencia de la versión anterior del autor, entrenada con marcadores débiles `[laughter]` extraídos de subtítulos VTT, esta versión usa 87 vídeos de Gillick con etiquetas auditadas manualmente y una evaluación pre-registrada con siete puertas científicas.

El modelo se enmarca en computación afectiva aplicada al humor: no transcribe ni genera texto, sino que predice eventos de risa a partir de prosodia y contenido acústico, con capacidad declarada de anticipación (margen de aparición superior a 2,5 s) y rendimiento por encima de la línea base basada únicamente en transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLM-base congelado (encoder transformer de voz) mas cabeza MLP con caracteristicas prosodicas |
| Parametros totales | 120.556 segun safetensors del repo; la model card declara ~230K en la cabeza MLP sobre el backbone WavLM-base (discrepancia no aclarada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; trabaja con ventanas de 25 ms y embeddings de 768 dimensiones, no con contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible como lista oficial; el dominio de entrenamiento es stand-up en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de clasificación de audio en dos etapas. La primera es el backbone `microsoft/wavlm-base`, que se mantiene completamente congelado y convierte ventanas de audio de 25 ms en embeddings de 768 dimensiones. La segunda es una cabeza MLP de pequeño tamano (la model card indica aproximadamente 230K parametros) que incorpora caracteristicas prosodicas adicionales y produce una probabilidad binaria de risa por ventana. No hay ajuste fino del encoder, lo que limita la adaptacion a patrones especificos del corpus pero reduce drasticamente el coste de entrenamiento e inferencia.

El entrenamiento se realizo con PyTorch y Transformers sobre 87 videos de Gillick con etiquetas auditadas por personas, con un 20 por ciento reservado para validacion. Se uso el optimizador AdamW con tasa de aprendizaje 1e-3, hasta 50 epocas con parada temprana, sobre una GPU NVIDIA P100 en Kaggle. La innovacion metodologica declarada es el protocolo pre-registrado de evaluacion (Decision Graph V3) con siete puertas cientificas, que incluye pruebas de generalizacion a comediantes disjuntos, de anticipacion temporal (margen de aparicion mayor o igual a 2,5 s) y de mejora sobre la linea base de transcripcion. No se documenta uso de RLHF ni de DPO, algo esperable en un modelo discriminativo de audio.

## Capacidades

- Deteccion de risa en audio: clasificacion binaria por ventana de 25 ms con probabilidad asociada.
- Anticipacion de risa: la model card reporta un margen de anticipacion de +0,222 con umbral mayor o igual a 2,5 s (puerta G7 superada).
- Deteccion de risa mas alla de la transcripcion: mejora de +0,1117 en F1 frente a una linea base basada solo en palabras (puerta G5 superada).
- Generalizacion a comediantes no vistos: delta de +0,1147 en el conjunto disjunto por comediante (puerta G3 superada).
- Extraccion de caracteristicas prosodicas derivadas de WavLM-base, reutilizables para otras tareas afectivas.
- Integracion con la libreria transformers mediante `pipeline("audio-classification")` y codigo personalizado (`custom_code`).
- No dispone de generacion de texto, tool calling, capacidades de agente, vision, traduccion ni razonamiento multilingue.

## Casos de uso

- Indexado automatico de material de comedia: procesar un catalogo de especiales de stand-up y generar marcas temporales de risa para permitir navegacion por momentos graciosos o busqueda por densidad de humor.
- Edicion y montaje audiovisual: localizar automaticamente los picos de risa para decidir cortes, insertar planos de reaccion del publico o ajustar el ritmo de un trailer de comedia.
- Investigacion en computacion afectiva y humor: usar el modelo como baseline reproducible con etiquetas verificadas por humanos, comparando contra etiquetado debil de subtitulos.
- Analitica de audiencia en directo: estimar la tasa de risa por minuto en grabaciones de sala para medir la respuesta del publico a un guion o a un comediante concreto.
- Sistemas de subtitulado enriquecido: anadir anotaciones de risa a subtitulos automaticos, utiles para accesibilidad de personas con discapacidad auditiva.
- Prototipado de agentes conversacionales con senal de humor: emplear la probabilidad de risa como retroalimentacion para evaluar si una respuesta generada resulta graciosa en un contexto de audio de stand-up.
- Deteccion de risa en datos de dominio distinto (podcast, radio, entrevistas) como prueba exploratoria, asumiendo el riesgo de degradacion por cambio de dominio declarado por el autor.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor y corresponden a su evaluacion pre-registrada.

| Metrica | Valor | Conjunto o puerta |
|---|---|---|
| F1 | 0,975 | Conjunto de entrenamiento (puerta G1 superada) |
| IoU-F1 | 0,3302 | Subconjunto de 118 videos con etiquetas verificadas por humanos |
| Average Precision | 0,2290 | Subconjunto verificado por humanos |
| Delta disjunto por comediante | +0,1147 | Generalizacion a comediantes no vistos (puerta G3 superada) |
| Margen de aparicion mayor o igual a 2,5 s | +0,222 | Anticipacion temporal (puerta G7 superada) |
| Mejora sobre transcripcion | +0,1117 en F1 | Mas alla de palabras (puerta G5 superada) |

Comparativa interna declarada por el autor entre la version anterior y esta: la version con etiquetas debiles entrenaba sobre 620 videos y obtenia F1 de 0,30 a 0,40 en el subconjunto humano; esta version entrena sobre 87 videos verificados y declara F1 de 0,975 en entrenamiento, con evaluacion en comediantes disjuntos. No se han publicado resultados de benchmarks comparables con otros modelos publicos en la informacion disponible.

## Requisitos de hardware

- El backbone `wavlm-base` ronda los 94 millones de parametros; el repo de safetensors contiene unicamente 120.556 parametros, presumiblemente la cabeza y elementos auxiliares.
- VRAM estimada para inferencia: inferior a 2 GB en precision completa si se carga todo el backbone, y del orden de 0,5-1 GB en fp16. No se publican mediciones oficiales.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para clips cortos.
- GPU profesionales como A100 o H100 no aportan ventaja significativa por el reducido tamano del modelo; solo tendrian sentido para procesar catalogos masivos en paralelo.
- Opciones de despliegue: pipeline de transformers con `trust_remote_code=True` (metodo documentado), y en principio ONNX Runtime o TorchScript para servir en CPU, aunque el autor no documenta estas rutas. No hay instrucciones oficiales para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos de texto.
- Latencia y throughput: no disponibles. El entrenamiento se realizo en una NVIDIA P100 de Kaggle.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|
| ChuckleNet Verified (Hayasuki/chucklenet-verified) | 120.556 en safetensors; ~230K en la cabeza declarada | Deteccion y anticipacion de risa | MIT | HuggingFace | IoU-F1 0,3302 en 118 videos verificados |
| ChuckleNet Legacy (Hayasuki/chucklenet-laughter-detector) | no disponible | Deteccion de risa con etiquetas debiles VTT | no disponible | HuggingFace | F1 0,30-0,40 en subconjunto humano |
| microsoft/wavlm-base | ~94M (backbone) | Representaciones de voz auto-supervisadas | MIT | HuggingFace | No es un detector de risa; requiere cabeza especifica |
| Das-rebel/chucklenet-verified | no disponible | Mismo modelo referenciado en el quick start de la model card | MIT | Referenciado en la model card, no verificado en este analisis | no disponible |

No se identifican en la informacion disponible otros detectores de risa publicos con etiquetado verificado por humanos que permitan una comparacion directa.

## Limitaciones y advertencias

- Brecha de generalizacion declarada por el autor: F1 de 0,975 en entrenamiento frente a IoU-F1 de 0,3302 en el subconjunto verificado de 118 videos, lo que indica un desplazamiento de distribucion severo y riesgo alto de sobreajuste.
- Dominio unico: entrenado exclusivamente con stand-up en ingles; el autor advierte de que puede no transferirse a otros generos de comedia ni a otros idiomas.
- Sin ajuste fino del backbone: WavLM-base permanece congelado, lo que limita la adaptacion a patrones especificos del conjunto de datos.
- Verificacion limitada: solo 11 descargas y 0 likes en el momento de la consulta, sin validacion independiente por terceros.
- Discrepancia de identificacion: el repo de HuggingFace figura como `Hayasuki/chucklenet-verified`, mientras que la model card y el ejemplo de uso apuntan a `Das-rebel/chucklenet-verified`; conviene verificar cual es el artefacto canonico antes de integrarlo.
- Discrepancia de recuento de parametros: safetensors declara 120.556 parametros y la model card menciona una cabeza de 230K, sin aclaracion del autor.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; debe auditarse antes de usarlo en produccion.
- El paper asociado se encuentra en estado de borrador y el enlace a arXiv es generico, sin identificador verificable.
- Licencia MIT: permite uso comercial, pero sin garantias por parte del autor; al ser un detector de un unico evento acustico, no debe usarse para decisiones de alto impacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hayasuki/chucklenet-verified
- Repositorio y borrador del paper: https://github.com/Das-rebel/autonomous_laughter_prediction
- Grafo de decision V3: https://github.com/Das-rebel/autonomous_laughter_prediction/blob/main/docs/DECISION_GRAPH_V3.md
- Dataset Standup4AI: https://github.com/Standup4AI/dataset
- Model card legacy: https://huggingface.co/Hayasuki/chucklenet-laughter-detector
- Modelo base: https://huggingface.co/microsoft/wavlm-base
