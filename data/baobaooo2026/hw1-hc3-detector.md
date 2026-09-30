# Baobaooo2026/hw1-hc3-detector

## Resumen

El modelo `Baobaooo2026/hw1-hc3-detector` es un clasificador de texto basado en un transformer encoder de tipo BERT, publicado en HuggingFace con la librería `transformers` y pipeline `text-classification`. Cuenta con 22.713.986 parámetros reales, según los pesos en formato safetensors, lo que lo sitúa en la gama de modelos BERT compactos o destilados, muy por debajo de los 110 millones de parámetros de BERT-base. El repositorio ocupa 0,1 GB y fue creado y actualizado el 29 de septiembre de 2026 por el usuario Baobaooo2026.

La model card es la plantilla automática de HuggingFace y prácticamente todos los campos están sin rellenar: no se declara autoría real, ni datos de entrenamiento, ni licencia, ni idiomas soportados, ni procedencia de los pesos. El único dato técnico concreto que aporta son dos métricas de evaluación: una exactitud de referencia (*baseline*) de 0,8449 y una exactitud de test tras el ajuste fino de 0,9968.

El nombre del repositorio (`hw1-hc3-detector`) y el sufijo `hc3` apuntan, como hipótesis razonable no confirmada por el autor, a un detector de texto humano frente a texto generado por ChatGPT entrenado sobre el corpus HC3 (*Human ChatGPT Comparison Corpus*), un caso típico de ejercicio académico de clasificación binaria. Al no existir documentación, cualquiera que quiera reutilizarlo debería validar de forma independiente el dominio, las etiquetas y la calidad del ajuste antes de considerarlo en producción. El modelo tiene 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (etiqueta `bert` en el repositorio) |
| Parametros totales | 22.713.986 |
| Longitud de contexto | no disponible (no documentada; dependera de la configuracion de `max_position_embeddings` del checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 0,1 GB |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible (segun etiquetas) |
| Fecha de creacion | 2026-09-29 |
| Fecha de actualizacion | 2026-09-29 |

## Arquitectura y entrenamiento

La unica informacion arquitectonica fiable son las etiquetas del repositorio, que indican `bert` y `text-classification`. Se trata, por tanto, de un transformer encoder con atencion bidireccional y una cabeza de clasificacion (probablemente una capa lineal sobre el token `[CLS]`) configurada para un numero de clases no declarado. Con 22,7 millones de parametros, el checkpoint no corresponde a un BERT-base estandar, sino a una variante reducida en profundidad, ancho o ambas cosas; la configuracion exacta (numero de capas, dimension oculta, cabezas de atencion, vocabulario) no esta documentada y habria que leerla directamente del `config.json` del repositorio.

No hay ningun dato publicado sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset, el regimen de precision (fp32, fp16, bf16) ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card incluye los apartados habituales de la plantilla de HuggingFace, pero todos ellos contienen la marca `[More Information Needed]`. La unica referencia a un paper es el enlace a Lacoste et al. (2019), `arxiv:1910.09700`, que corresponde a la calculadora de impacto medioambiental del template y no a una publicacion sobre este modelo. En el apartado de resultados la model card declara dos cifras: exactitud de referencia 0,8449 y exactitud de test tras ajuste fino 0,9968, sin describir el conjunto de test, la metrica exacta, el numero de clases ni el protocolo de evaluacion.

## Capacidades

- Clasificacion de texto: es la unica capacidad declarada por el pipeline (`text-classification`). Devuelve etiquetas con puntuaciones de probabilidad para la tarea concreta para la que fue ajustado.
- Clasificacion binaria o multiclase de fragmentos cortos: el tamano del modelo y el pipeline lo orientan a tareas de clasificacion de secuencias, no a generacion.
- Deteccion de texto generado por IA: inferido del nombre `hc3-detector`, sin confirmacion del autor.
- Generacion de texto: no soportada. Es un encoder sin cabeza de lenguaje.
- Razonamiento, matematicas y codigo: no soportados.
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Multilingue: no disponible; no se declara ningun idioma.
- Vision, audio o modo *thinking*: no soportados.

## Casos de uso

- Moderacion de contenido en foros y comentarios: el modelo puede clasificar fragmentos de texto en categorias predefinidas si la cabeza de clasificacion se ajusto para ello. Su tamano de 22,7 millones de parametros permite ejecutarlo en CPU con latencias de milisegundos por peticion.
- Filtrado de resenas falsas o generadas automaticamente: si el checkpoint realmente se entreno sobre HC3, podria usarse como primera barrera en un sistema de deteccion, siempre combinado con revision humana y validacion previa sobre el dominio propio, ya que la exactitud de 0,9968 declarada no tiene protocolo documentado.
- Etiquetado masivo de corpus para investigacion: procesar grandes volumenes de texto para anotar clases de forma automatica antes de un analisis posterior, aprovechando el bajo coste computacional de un modelo de 0,1 GB.
- Prefiltrado en pipelines de curación de datos: descartar o marcar documentos antes de entrenar modelos mayores, reduciendo el coste de anotacion manual.
- Clasificacion de tickets de soporte: si se reajusta la cabeza de clasificacion, puede asignar categorias a textos cortos de atencion al cliente en un servicio con restricciones de latencia y sin GPU dedicada.
- Experimentos docentes y trabajos academicos: su tamano permite entrenar, ajustar y comparar variantes en una unica GPU de consumo o incluso en CPU, lo que lo hace util como punto de partida en asignaturas de procesamiento de lenguaje natural.
- Servicio de inferencia ligero con Text Embeddings Inference: las etiquetas del repositorio indican compatibilidad con TEI y endpoints, lo que permite desplegarlo como microservicio de clasificacion con un contenedor pequeno.
- Validacion de datos sinteticos: marcar muestras generadas por modelos de lenguaje en un corpus mixto antes de usarlas en un entrenamiento posterior.

## Benchmarks y rendimiento

La model card solo publica dos cifras, sin describir el conjunto de evaluacion ni la metrica exacta:

| Metrica | Valor declarado |
|---|---|
| Exactitud de referencia (*baseline*) | 0,8449 |
| Exactitud de test tras ajuste fino | 0,9968 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, HumanEval, GSM8K u otros) en la informacion disponible. Las dos cifras anteriores no son verificables con los datos aportados y probablemente correspondan a un conjunto de test propio de un ejercicio academico.

## Requisitos de hardware

- VRAM estimada: en fp32 los 22,7 millones de parametros ocupan aproximadamente 91 MB; en fp16, unos 45 MB. Con activaciones y sobrecarga del runtime, la inferencia completa cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una iGPU moderna. Tambien es viable en CPU: un solo nucleo moderno procesa secuencias cortas en decenas de milisegundos.
- GPU de consumo: si, cabe en cualquier GPU de consumo actual y en practicamente cualquier GPU de los ultimos diez anos. No requiere A100 ni H100.
- Opciones de despliegue: `transformers` con PyTorch, Text Embeddings Inference (etiqueta `text-embeddings-inference`), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), y conversion a ONNX para inferencia en CPU. No se publican pesos GGUF, aunque la conversion a llama.cpp no aplica porque no es un modelo generativo.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Baobaooo2026/hw1-hc3-detector | 22,7 M | no disponible | no disponible | Publico en HuggingFace |
| xw131/hw1-hc3-detector | no disponible | no disponible | no disponible | Publico en HuggingFace |
| pangboo/hw1-hc3-detector | no disponible | no disponible | no disponible | Publico en HuggingFace |
| Yihangsun/hw1-hc3-detector | no disponible | no disponible | no disponible | Publico en HuggingFace |

Los tres repositorios con el mismo nombre y los mismos resultados de busqueda parecen variantes o copias derivadas del mismo ejercicio. No hay datos verificados de parametros, contexto, rendimiento ni licencia para ninguno de ellos, y no se dispone de informacion sobre detectores alternativos en la documentacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al no documentarse el corpus de entrenamiento, no se puede evaluar el sesgo por dominio, registro, idioma o demografia.
- Riesgo de alulcinacion: no aplica como tal, porque no es un modelo generativo; sin embargo, puede producir falsos positivos y falsos negativos con alta confianza, lo cual es igualmente danino en un despliegue de moderacion.
- La exactitud de 0,9968 declarada carece de protocolo de evaluacion. Una cifra tan alta es sospechosa de sobreajuste o de fuga de datos entre entrenamiento y test, especialmente en un corpus pequeno de ejercicio academico.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial. En la practica, la ausencia de licencia implica que los derechos quedan reservados por defecto en muchas jurisdicciones, lo que desaconseja su uso en produccion.
- Idiomas no declarados: se desconoce si el modelo funciona en castellano, en ingles o en ambos. Habria que probarlo antes de asumir cualquier cobertura.
- Contexto maximo no documentado: si la configuracion sigue el valor tipico de BERT, el limite estaria en 512 tokens, pero esto no esta confirmado en la informacion disponible.
- Sin historial: 0 descargas y 0 *likes*, sin issues ni discusiones. No hay comunidad que haya validado su comportamiento.
- Model card vacia: la mayoria de los campos obligatorios no estan rellenos, lo que impide auditar procedencia, datos y metodologia.
- Nomenclatura de ejercicio: el prefijo `hw1` sugiere una primera tarea de un curso; conviene tratarlo como artefacto de aprendizaje y no como modelo listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Baobaooo2026/hw1-hc3-detector
- Variante con el mismo nombre (xw131): https://huggingface.co/xw131/hw1-hc3-detector
- Variante con el mismo nombre (pangboo): https://huggingface.co/pangboo/hw1-hc3-detector
- Ficha del modelo en savrn (Yihangsun): https://savrn.com/models/hw1-hc3-detector
- Ficha del modelo en free2aitools: https://free2aitools.com/model/trelaouo/hw1-hc3-detector
- Paper referenciado en la model card (calculadora de impacto medioambiental, no especifico del modelo): https://arxiv.org/abs/1910.09700
