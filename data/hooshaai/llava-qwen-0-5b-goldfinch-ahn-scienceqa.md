# Hooshaai/llava-qwen-0.5b-goldfinch-ahn-scienceqa

## Resumen

llava-qwen-0.5b-goldfinch-ahn-scienceqa es un checkpoint multimodal de tipo vision-language derivado de llava-hf/llava-interleave-qwen-0.5b-hf mediante la tecnica de "cirugia de atencion" implementada en el framework NeuralOps. El autor, Hooshaai, sustituye las capas de atencion cuadratica de 18 de las 24 capas del decodificador Qwen2 por bloques GoldFinch-AHN, un operador hibrido que combina atencion de ventana deslizante con memoria recurrente con compuertas (familia SSM). El objetivo es reducir el coste de atencion manteniendo la funcionalidad multimodal del modelo original.

El modelo conserva intactos el torre de vision SigLIP congelada, el proyector MLP de dos capas y seis capas de atencion cuadratica ancla (indices 3, 7, 11, 15, 19 y 23), modificando unicamente las 18 capas restantes junto con sus layernorms. El artefacto serializado ocupa 219,73 MB en FP16, un 87,1 % menos que el modelo base completo (1,66 GB), lo que lo hace atractivo para despliegues con restricciones severas de almacenamiento y memoria.

Su relevancia es principalmente experimental: sirve como banco de pruebas reproducible para estudiar el impacto de sustituir atencion cuadratica por operadores recurrentes en un VLM pequeno, evaluado sobre el subconjunto con imagenes de ScienceQA. No obstante, los resultados muestran una degradacion notable respecto al profesor (63,75 % frente a 39,38 % de accuracy), por lo que su uso en produccion no esta justificado por rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA sobre Qwen2: torre SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con 18 capas sustituidas por bloques GoldFinch-AHN (hibrido atencion ventana deslizante + memoria recurrente con compuertas) |
| Parametros totales | no disponible (el modelo base llava-interleave-qwen-0.5b-hf tiene aproximadamente 0,5B; el artefacto delta serializado pesa 230.404.024 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el bloque GoldFinch-AHN define window_size como radio efectivo window_size // 2, pero la ventana concreta de este checkpoint no se especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, FP16, delta quirurgico de 219,73 MB) |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: una torre de vision SigLIP de 27 capas congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimension oculta D=1024, 16 cabezas de atencion y head_dim=64. La intervencion quirurgica reemplaza la self-attention en 18 de las 24 capas (esquema hybrid_3_1) por GoldFinchAHNBlock, que combina atencion de ventana deslizante con memoria recurrente con compuertas; el sesgo inicial de la compuerta controla el equilibrio entre atencion y memoria (0,0 equivale a reparto equilibrado). Se mantienen como anclas cuadraticas las capas 3, 7, 11, 15, 19 y 23, y quedan congelados la torre de vision, el proyector, los MLP y los embeddings.

El entrenamiento se realizo mediante destilacion de conocimiento con la arquitectura de cacheado offline de representaciones de NeuralOps (seccion 21.1), en una unica NVIDIA GeForce RTX 3090 de 24 GB con 0 MB de VRAM dedicada al profesor. Se ejecutaron 231 pasos de optimizacion (70 en etapa 1 y 161 en etapa 2) en 120,1 segundos, con un pico de VRAM de 19.336 MB y serializacion determinista de pesos. El dataset de evaluacion y entrenamiento declarado es derek-thomas/ScienceQA. Un dato critico: las metricas pre-destilacion y post-destilacion son identicas (39,38 % de accuracy y 3,30 de perplejidad), lo que indica que la destilacion no aporto mejora medible en esta ejecucion.

## Capacidades

- Generacion de texto e imagen-a-texto conversacional: responde preguntas en lenguaje natural sobre imagenes, con plantilla de chat incluida (chat_template.json).
- Razonamiento visual sobre contenido STEM: el checkpoint esta ajustado y evaluado sobre ScienceQA, con preguntas de ciencia, tecnologia, ingenieria y matematicas que incluyen diagramas e ilustraciones.
- Respuesta a preguntas de opcion multiple con contexto visual: el formato de ScienceQA requiere seleccionar la respuesta correcta a partir de la imagen, la pregunta y las opciones.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo es un VLM pequeno sin modo thinking declarado.
- Capacidades de audio o video: no disponibles.

## Casos de uso

- Investigacion sobre cirugia de atencion: el checkpoint permite reproducir y extender experimentos que sustituyen atencion cuadratica por operadores SSM en VLMs, comparando el rendimiento de las capas GoldFinch-AHN frente a las anclas cuadraticas en un entorno controlado con ScienceQA.
- Docencia y divulgacion de tecnicas de compresion: sirve como ejemplo tangible de reduccion de artefacto en un 87,1 % (de 1,66 GB a 219,73 MB) manteniendo la topologia del modelo base, util en cursos sobre eficiencia de modelos.
- Prototipado rapido de asistentes educativos STEM en ingles: con 0,5B de parametros y 219,73 MB de pesos, puede desplegarse en entornos con almacenamiento minimo para experimentar con preguntas de ciencia sobre imagenes, aunque con la precision limitada del 39,38 %.
- Pruebas de pipelines NeuralOps: el repositorio incluye surgical_manifest.json, training_metrics.json y config.json con metadatos de cirugia, lo que facilita la validacion de la API load_surgeried_model y de los flujos de serializacion determinista.
- Benchmarking de destilacion offline: al documentarse el uso de cacheado de representaciones con 0 MB de VRAM de profesor, es un caso de referencia para medir la viabilidad de destilar en GPUs de consumo (RTX 3090) con presupuestos de tiempo de 120 segundos.
- Evaluacion de robustez de operadores hibridos: util para estudiar como afecta la sustitucion de 18 de 24 capas al comportamiento multimodal frente al modelo base intacto, sirviendo de linea base negativa en articulos comparativos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto STEM con imagenes, validation) | 63,75 | 39,38 | 39,38 | +0,00 |
| Perplejidad en ScienceQA (mismo subconjunto) | 2,45 | 3,30 | 3,30 | +0,00 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto delta pesa 219,73 MB en FP16, pero debe combinarse con el modelo base llava-interleave-qwen-0.5b-hf (1,66 GB) para reconstruir el modelo completo; se estima un consumo en torno a 2-4 GB en FP16 incluyendo activaciones y cache KV, aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor entreno en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 19.336 MB durante la destilacion, pero la inferencia requiere mucho menos.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamano de 0,5B del modelo base.
- Opciones de despliegue: la libreria oficial es neuralops (API load_surgeried_model); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; el unico dato de telemetria es el entrenamiento (231 pasos en 120,1 segundos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy ScienceQA (val, con imagenes) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| llava-qwen-0.5b-goldfinch-ahn-scienceqa | ~0,5B (delta de 219,73 MB) | no disponible | 39,38 % | MIT | Hugging Face (47 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (modelo base) | ~0,5B | no disponible | 63,75 % (declarado como profesor) | no disponible en la informacion | Hugging Face |
| Otros VLM pequenos (p. ej. variantes LLaVA de 0,5B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de benchmarks de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion significativa de precision: 39,38 % frente al 63,75 % del modelo base, una caida de 24,37 puntos porcentuales en ScienceQA; no es adecuado para tareas donde la exactitud sea critica.
- La destilacion no aporto mejora: las metricas pre-KD y post-KD son identicas, lo que sugiere que el entrenamiento no corrigio la perdida introducida por la cirugia de atencion.
- Riesgo de alucinacion: inherente a los VLM de 0,5B y agravado por la precision reducida; las respuestas sobre contenido cientifico pueden ser incorrectas con alta frecuencia.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre ScienceQA en ingles, puede reflejar los sesgos de ese corpus educativo.
- Limitacion idiomatica: solo ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion; no obstante, el modelo base llava-hf/llava-interleave-qwen-0.5b-hf deberia verificarse por separado antes de un uso comercial.
- Dependencia de la libreria neuralops: el checkpoint se carga mediante load_surgeried_model y un manifiesto quirurgico; no es un modelo autonomo y requiere combinar el delta con el modelo base.
- Contexto no documentado: se desconoce la ventana efectiva tras la sustitucion por GoldFinch-AHN, lo que impide garantizar el comportamiento en secuencias largas.
- Benchmarks no verificados: el model-index marca los resultados como `verified: false`; deben tratarse como declaraciones del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-goldfinch-ahn-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador GoldFinch-AHN: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/goldfinch_ahn.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
