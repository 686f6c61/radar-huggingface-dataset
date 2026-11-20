# nikkikaelar/leak-curber-kmer4-cpu

## Resumen

Leak-CURBER · k-mer 4 CPU es un clasificador de secuencias proteicas que predice un número EC (Enzyme Commission) por proteina, empaquetado bajo el contrato de evaluacion Leak-CURBER: 2 vCPU, 16 GB de RAM, 900 s de reloj de pared, sin GPU y sin red. Lo desarrolla el autor independiente nikkikaelar como release de investigacion de ANTIMEME (001 · 2026). No es un modelo neuronal: es una regresion softmax lineal sobre una representacion de 8.192 k-mers de caracteres exactos (longitud 4), con normalizacion TF sublineal y L2.

El interes del artefacto no esta en su rendimiento absoluto, sino en su funcion como control experimental. El autor documenta que la mayor parte de la puntuacion obtenida en un split aleatorio (0,8267 ± 0,0017 de credito fraccional EC L4) es recuperacion de homologia y no aprendizaje de funcion: al separar componentes de homologia de modo que ninguna proteina de test comparta identidad ≥0,385 con ninguna de entrenamiento, la puntuacion cae a 0,0386 ± 0,0039. Aun asi supera a la linea base de frecuencias (0,0015 ± 0,0025) en el regimen mas estricto, lo que indica que sobrevive cierta senal tras eliminar la homologia.

El modelo es relevante ahora porque la competicion Leak-CURBER cerro el 2026-11-07, doce dias antes de esta release, y nunca se envio puntuacion alguna. Su utilidad practica es acotada: sirve como referencia CPU reproducible, barata y rapida (3,4 s para 11.367 entradas en 2 vCPU) frente a la que medir modelos mas costosos como ESM-2 650M + MLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion softmax lineal sobre k-mers de caracteres (longitud 4), TF sublineal y L2 |
| Parametros totales | 37.797.888 pesos mas sesgo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; entrada = secuencia proteica completa vectorizada en 8.192 k-mers) |
| Tipos de cuantizacion | no disponible (pesos float en NumPy; 56,9 MB en disco) |
| Idiomas soportados | en (etiquetado del repositorio; la entrada son secuencias de aminoacidos) |
| Licencia | MIT |
| Formato de pesos | no disponible de forma explicita (libreria numpy; ficheros del repositorio, 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal sin capas ocultas. La representacion de entrada son 8.192 k-mers exactos de caracteres de longitud 4, con frecuencia de termino sublineal y normalizacion L2. La cabeza es un softmax lineal sobre 4.614 clases EC. No hay atencion, ni convoluciones, ni embeddings aprendidos: la unica no linealidad relevante esta en el softmax de salida.

El entrenamiento usa el dataset `starkAhmed43/leak-curber-enzyme-classification` en la revision `4ff037c68457af5d69ecebdd73775d96d9aeb5bf`, fichero `data/train.parquet` (sha256 `36e95a32896dd5aa…`), con 186.488 secuencias proteicas unicas y 223.764 pares proteina-EC. Se entrenaron 20 epocas con batch 512 y learning rate 0,001, semilla 0. No se documenta RLHF, DPO ni ningun otro ajuste posterior. La innovacion metodologica del release no es arquitectonica sino evaluativa: la separacion por componentes de homologia (regimenes 0.70 y 0.385) para medir cuanto de la puntuacion es recuperacion de homologia.

## Capacidades

- Prediccion de un numero EC por secuencia proteica, con credito fraccional sobre las etiquetas registradas usando unicamente la primera prediccion EC.
- Clasificacion restringida al vocabulario de 4.614 clases EC vistas en entrenamiento; no puede emitir una EC ausente de ese vocabulario.
- Inferencia en CPU pura: 3,4 s para 11.367 entradas con 2 vCPU y sin red, dentro de un presupuesto de 900 s.
- Construccion de imagen Docker en 37 s para linux/amd64, dentro de un presupuesto de 1.800 s.
- Salida en JSONL, una linea por secuencia unica de entrada (542.161 bytes en la ejecucion de referencia).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no aplica; la entrada son secuencias de proteinas y el etiquetado del repositorio es en ingles.

## Casos de uso

- Control negativo en estudios de fuga de datos (leakage): sirve para cuantificar cuanto de la puntuacion de un modelo proteico en un split aleatorio se explica por homologia, comparando su caida de 0,8267 a 0,0386 al separar por identidad.
- Baseline reproducible en entornos sin GPU: un pipeline de evaluacion con 2 vCPU y 16 GB de RAM puede ejecutar la inferencia completa en 3,4 s, lo que permite iterar sobre particiones de datos sin coste de acelerador.
- Preanotacion masiva de numeros EC en catalogos de proteinas: dado su bajo coste por secuencia, puede generar una primera etiqueta EC para triaje, siempre que se acepte su baja precision en regimen separado (0,0386 L4).
- Verificacion de contratos de evaluacion: el paquete incluye Dockerfile y script `predict.py` que respetan restricciones de CPU, memoria, red y tiempo, util para validar que un entorno de evaluacion funciona antes de desplegar modelos mas pesados.
- Docencia y divulgacion sobre representaciones de k-mers: el modelo permite mostrar de forma tangible la diferencia entre recuperacion de homologia y aprendizaje de funcion con un artefacto de 56,9 MB.
- Comparacion de coste/rendimiento frente a modelos de embeddings: sirve como referencia barata contra ESM-2 650M + MLP (0,2738 L4 en regimen 0.385) para justificar o descartar el uso de modelos grandes en una tarea concreta.

## Benchmarks y rendimiento

Puntuacion: credito fraccional EC L4 de la competicion, media ± desviacion estandar entre 3 folds. Las columnas separadas retienen componentes completos de homologia (37.298 proteinas de test por fold).

| Modelo | Split aleatorio | Separado 0.70 | Separado 0.385 |
|---|---|---|---|
| Baseline de frecuencias | 0,0102 ± 0,0008 | 0,0065 ± 0,0019 | 0,0015 ± 0,0025 |
| 4-mer lineal (este modelo) | 0,8267 ± 0,0017 | 0,5835 ± 0,0201 | 0,0386 ± 0,0039 |
| ESM-2 650M + MLP (solo investigacion) | 0,9086 ± 0,0015 | 0,8519 ± 0,0076 | 0,2738 ± 0,0250 |

Comprobacion entre releases: 11.367 entradas de validacion de la competicion puntuan 0,3109 en L4, pero todas esas secuencias aparecen tambien en la release etiquetada del paper, por lo que esas etiquetas son derivables publicamente y la cifra no constituye una metrica privada retenida.

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia en CPU.
- Memoria RAM: 16 GB en el contrato del evaluador; el modelo pesa 56,9 MB en disco y 37.797.888 pesos mas sesgo.
- CPU: 2 vCPU suficientes segun la ejecucion de referencia (3,4 s para 11.367 entradas).
- GPU recomendadas: ninguna; no aplica.
- Cabe en cualquier GPU consumer, pero no la necesita ni la aprovecha.
- Opciones de despliegue: script `predict.py` con NumPy, o contenedor Docker linux/amd64 (`docker build --platform linux/amd64`, ejecucion con `--network none --cpus 2 --memory 16g`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: 3,4 s para 11.367 entradas en 2 vCPU, equivalente a aproximadamente 3.343 entradas/s en ese entorno; construccion de imagen en 37 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | L4 separado 0.385 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leak-CURBER k-mer 4 CPU (este) | 37,8 M | no aplica | 0,0386 ± 0,0039 | MIT | Hugging Face, CPU |
| ESM-2 650M + MLP | 650 M (no confirmado en la informacion) | no disponible | 0,2738 ± 0,0250 | no disponible | solo investigacion segun la model card |
| Baseline de frecuencias | no disponible | no aplica | 0,0015 ± 0,0025 | no disponible | referencia interna del benchmark |

## Limitaciones y advertencias

- No es un predictor de homologos remotos: con 0,0386 L4 queda muy por debajo de los 0,2738 de ESM-2 bajo separacion identica; el propio autor indica que este modelo no es el hallazgo de investigacion.
- No constituye una posicion en leaderboard: la competicion cerro el 2026-11-07 y nunca se envio puntuacion.
- No es una metrica privada retenida: la comprobacion entre releases (0,3109 L4 sobre 11.367 entradas) usa secuencias cuyas etiquetas son publicamente derivables.
- Limitacion de vocabulario: no puede emitir una EC ausente de sus 4.614 clases de entrenamiento.
- Riesgo de sobreajuste a homologia: el rendimiento en split aleatorio (0,8267) sobreestima gravemente la capacidad de generalizacion a proteinas sin homologos conocidos.
- Riesgo de alucinacion en sentido estricto bajo, al ser un clasificador cerrado; el riesgo real es asignacion erronea de EC con alta confianza en secuencias fuera de distribucion.
- Sesgos: no documentados por el autor; la composicion del dataset de entrenamiento puede inducir sesgos de representacion taxonomica o funcional no auditados en la informacion disponible.
- Licencia MIT para el codigo; la release del paper tiene terminos CC BY-NC-SA que afectan a los datos, no al codigo. No se redistribuye ningun fichero del dataset.
- Es una release independiente, no un componente oficial del benchmark Leak-CURBER; hay que citar a los autores de Leak-CURBER y preservar el copyright upstream en `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikkikaelar/leak-curber-kmer4-cpu
- Codigo, tests e informe: https://github.com/outerheaven199X/leak-curber-independent
- Dataset de auditoria y figuras: https://huggingface.co/datasets/nikkikaelar/leak-curber-homology-audit
- DOI del dataset de auditoria: `10.57967/hf/11715` (revision `57b3609`)
- Benchmark Leak-CURBER upstream: https://github.com/bisect-group/Leak-CURBER
- Dataset de entrenamiento: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification (revision `4ff037c68457af5d69ecebdd73775d96d9aeb5bf`)
