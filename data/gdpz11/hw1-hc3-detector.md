# gdpz11/hw1-hc3-detector

## Resumen

El modelo gdpz11/hw1-hc3-detector es un clasificador binario de texto en ingles, obtenido por ajuste fino (fine-tuning) del encoder sentence-transformers/all-MiniLM-L6-v2 sobre el corpus HC3 (Hello-SimpleAI). Su unica tarea es asignar una de dos etiquetas a una respuesta corta: 0 para texto escrito por una persona y 1 para texto generado por ChatGPT. Lo publica el usuario gdpz11 en HuggingFace y cuenta actualmente con 0 descargas y 0 likes, ademas de no declarar licencia.

Se trata de un modelo muy pequeno (22.713.986 parametros, unos 0,1 GB de repositorio) pensado como ejercicio academico de deteccion de texto generado por IA, no como herramienta de produccion. La model card documenta un protocolo de evaluacion reproducible: revision concreta del dataset HC3, division a nivel de pregunta 80/10/10, semilla 42, cinco epocas, batch 32 y optimizador AdamW con learning rate 2e-5. Sobre el conjunto de test reporta una exactitud de 0,989931 frente a 0,844901 de una linea base de embeddings congelados mas regresion logistica.

Su relevancia actual es, sobre todo, metodologica: sirve como referencia para replicar y auditar experimentos de deteccion de texto sintetico. El propio autor advierte que se trata de un benchmark historico y que sus predicciones no constituyen prueba fiable de uso de IA en textos o trabajos actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (MiniLM-L6) con cabezal de clasificacion de 2 clases |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens (truncado segun la model card; el modelo base admite hasta 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio) |
| Tarea | text-classification (binaria: 0 = humano, 1 = ChatGPT) |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Dataset de entrenamiento | Hello-SimpleAI/HC3 (subconjunto en ingles) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo BERT procedente de all-MiniLM-L6-v2: seis capas, tamano oculto de 384 y mecanismo de atencion completa, con el cabezal original de enmascaramiento sustituido por una cabeza de clasificacion de dos clases. No hay decodificador, ni atencion lineal, ni mecanismos de decodificacion especulativa: el modelo produce un unico logit por clase a partir del token de agregacion [CLS] y no genera texto. La entrada se limita al campo de respuesta (answer) del corpus, sin incluir la pregunta, y se trunca a 256 tokens.

El entrenamiento se realizo sobre la revision `4d0ff18143b5a7e1b1e79beb540c04549d1e59d3` del subconjunto ingles de HC3, quedandose con la primera respuesta no vacia de cada clase y aplicando las exclusiones indicadas por el dataset. La particion es a nivel de pregunta, con proporcion 80/10/10 y semilla 42, lo que da 37.334 ejemplos de entrenamiento, 4.666 de validacion y 4.668 de test. Se entrenaron cinco epocas con batch size 32, AdamW y learning rate 2e-5, alcanzando una perdida media de entrenamiento de 0,022321. No se documenta uso de RLHF, DPO ni ninguna tecnica de alineacion, lo cual es coherente con un clasificador discriminativo.

## Capacidades

- Clasificacion binaria de texto en ingles: distingue entre respuestas humanas y respuestas generadas por ChatGPT en el dominio de HC3.
- Entrada de hasta 256 tokens por muestra, con truncado controlado mediante el parametro `max_length`.
- Ejecucion como pipeline estandar de HuggingFace (`pipeline("text-classification")`), lo que facilita su integracion en scripts de evaluacion.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento en multiples pasos.
- No es multilingue: solo ingles.
- No dispone de modo de razonamiento (thinking mode), audio ni ninguna otra modalidad.
- Salida limitada a una etiqueta con su puntuacion de confianza; no ofrece explicaciones ni evidencia a nivel de token.

## Casos de uso

- Reproduccion de experimentos academicos: el modelo y su model card permiten replicar exactamente la particion, la semilla y los hiperparametros, de modo que sirve como punto de partida verificable en estudios sobre deteccion de texto generado.
- Linea base en investigacion sobre deteccion: con 22,7 millones de parametros y una exactitud de 0,989931 en el test de HC3, es un candidato muy economico para comparar contra arquitecturas mas grandes (por ejemplo RoBERTa) en el mismo corpus.
- Curacion de corpus: puede usarse para etiquetar respuestas procedentes de foros de preguntas y respuestas y separar contenido humano de contenido sintetico antes de construir un dataset de entrenamiento.
- Filtrado de datos sinteticos en pipelines de preprocesado: al ser un modelo de menos de 100 MB, se puede ejecutar en CPU sobre grandes volumenes de respuestas cortas para descartar automaticamente texto generado.
- Demostracion docente de fine-tuning: es un ejemplo compacto de ajuste de un encoder MiniLM con la libreria transformers, util en cursos de NLP para ilustrar el ciclo completo de entrenamiento y evaluacion.
- Triaje preliminar con supervision humana: en plataformas educativas o editoriales puede emplearse como primera senal para que un revisor humano examine respuestas sospechosas, nunca como decision automatizada.
- Investigacion sobre sesgos de detectores: dado que el autor documenta explicitamente la influencia del dominio, el estilo, la longitud y los artefactos de recoleccion, el modelo es util como caso de estudio de falsos positivos en deteccion de IA.
- Analisis retrospectivo de contenido historico: permite medir hasta que punto respuestas de ChatGPT de la epoca de HC3 son separables de respuestas humanas, sin extrapolar a modelos actuales.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la propia model card, medidos sobre el split de test de HC3 en ingles (4.668 ejemplos). No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria de evaluacion general, ya que el modelo es un clasificador y no un modelo generativo.

| Metrica | Linea base (embeddings congelados + regresion logistica) | Modelo ajustado |
|---|---|---|
| Exactitud en test | 0,844901 | 0,989931 |
| Macro F1 en test | no disponible | 0,989931 |
| Perdida media de entrenamiento | no aplica | 0,022321 |

Distribucion de datos empleada: entrenamiento 37.334, validacion 4.666, test 4.668, con particion a nivel de pregunta y semilla 42. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) los pesos ocupan aproximadamente 91 MB (22,7 M de parametros x 4 bytes); en fp16, unos 46 MB. Con el overhead del runtime, la inferencia cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU funciona; el modelo no requiere A100 ni H100. Una GTX 1050, una RTX 3060 o una RTX 4090 son mas que suficientes, y el modelo no aprovechara su capacidad de calculo por su tamano reducido.
- Ejecucion en GPU de consumo: si, en todas las gamas actuales e incluso en GPUs integradas.
- Ejecucion en CPU: viable para lotes moderados, dado el reducido numero de parametros.
- Opciones de despliegue: el camino documentado es la funcion `pipeline("text-classification")` de transformers. Tambien es razonable exportar a ONNX Runtime o TorchScript para reducir latencia. No es un objetivo habitual de vLLM, llama.cpp u Ollama, orientados a modelos generativos o de embeddings; para clasificacion con BERT lo mas directo es transformers o un servidor propio con FastAPI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Existen varios repositorios con el mismo nombre y la misma estructura de tarea, lo que sugiere replicas del mismo ejercicio practico sobre HC3. No se dispone de especificaciones, licencias ni metricas publicas de esas replicas en la informacion consultada.

| Modelo | Parametros | Contexto de entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gdpz11/hw1-hc3-detector | 22.713.986 | 256 tokens | Clasificacion humano/ChatGPT en HC3 | no disponible | HuggingFace, 0 descargas |
| xw131/hw1-hc3-detector | no disponible | no disponible | Clasificacion en HC3 (por el nombre del repositorio) | no disponible | HuggingFace |
| vivian-ch/hw1-hc3-detector | no disponible | no disponible | Clasificacion en HC3 (por el nombre del repositorio) | no disponible | HuggingFace |
| Detectores basados en RoBERTa, Mamba, RetNet y Electra evaluados en LLM-Detector-Experiments-HC3-Dataset | no disponible | no disponible | Deteccion de texto generado por IA sobre HC3 | no disponible | GitHub |
| GPTZero | no disponible (servicio propietario) | no disponible | Deteccion de IA en texto | propietaria | Servicio web |

## Limitaciones y advertencias

- El propio autor declara que se trata de un benchmark historico y que no establece una deteccion fiable de modelos actuales ni de trabajos de estudiantes.
- Los falsos positivos no deben interpretarse en ningun caso como prueba de uso de IA.
- El detector esta entrenado exclusivamente sobre respuestas de ChatGPT de la epoca de HC3; no hay evidencia de que generalice a GPT-4, Gemini, Claude, Llama u otros modelos posteriores.
- El dominio de entrenamiento son respuestas de foros de preguntas y respuestas en ingles; el rendimiento fuera de ese dominio (redaccion academica, correos, articulos) es desconocido.
- La longitud del texto influye en las predicciones, ya que la entrada se trunca a 256 tokens y el estilo y la extension son artefactos documentados del corpus.
- Solo soporta ingles; no se declara ningun otro idioma.
- La licencia no esta declarada, por lo que no se puede confirmar si se permite el uso comercial. Ante esta ausencia, debe asumirse que no hay autorizacion explicita.
- No hay sesgos documentados de forma especifica, pero al entrenarse con un unico corpus y una unica fuente de texto sintetico, es previsible que herede los sesgos de estilo, tematica y registro de HC3.
- El repositorio tiene 0 descargas y 0 likes, sin senales de mantenimiento ni validacion independiente por parte de la comunidad.
- No se han publicado analisis de robustez frente a parafraseo, traduccion automatica o edicion humana del texto sintetico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gdpz11/hw1-hc3-detector
- Repositorio con nombre identico de otro autor (xw131): https://huggingface.co/xw131/hw1-hc3-detector
- Repositorio con nombre identico de otro autor (vivian-ch): https://huggingface.co/vivian-ch/hw1-hc3-detector
- Ficha del modelo en savrn.com (atribuida a Yihangsun): https://savrn.com/models/hw1-hc3-detector
- Repositorio de experimentos de deteccion sobre HC3 (RoBERTa, Electra, Mamba, RetNet): https://github.com/saugatabose28/LLM-Detector-Experiments-HC3-Dataset
- Dataset Hello-SimpleAI/HC3: no se ha proporcionado enlace directo en la informacion disponible
- Detector comercial de referencia (GPTZero): https://gptzero.me/
