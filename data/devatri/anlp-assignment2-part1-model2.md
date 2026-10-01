# Devatri/anlp-assignment2-part1-model2

## Resumen

Devatri/anlp-assignment2-part1-model2 es un checkpoint de investigacion publicado en HuggingFace, desarrollado por el usuario Devatri en el marco de una asignatura de procesamiento de lenguaje natural (ANLP, "Assignment 2, Part 1"). Se trata de un Transformer decoder-only entrenado para traduccion automatica desde vietnamita y japones hacia ingles, segun la informacion de su model card.

El modelo se ha entrenado sobre el dataset belumind/en-vi-ja-curated-500k-triplets, un corpus curado de aproximadamente 500.000 tripletas en ingles, vietnamita y japones. El repositorio pesa 0,1 GB y contiene un unico artefacto principal, checkpoint.pt, que empaqueta el diccionario de configuracion, el state dict del modelo, un resumen y el sha256 del tokenizer utilizado.

Su relevancia es acotada y de caracter academico: no es un modelo listo para produccion ni compite con sistemas de traduccion establecidos, sino una entrega de practicas que permite inspeccionar una implementacion propia de un Transformer decoder-only aplicado a traduccion bidireccional de origen (vi/ja) a destino (en). No se han publicado parametros, contexto, licencia ni resultados de evaluacion, por lo que cualquier uso requiere asumir esas incognitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint en su precision original, sin versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | vietnamita y japones como idioma de entrada; ingles como idioma de salida (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | checkpoint.pt (PyTorch; contiene las claves `config`, `model` como state dict, `summary` y `tokenizer_sha256`) |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento | belumind/en-vi-ja-curated-500k-triplets (500.000 tripletas en-vi-ja) |
| Hash del checkpoint (sha256) | 5e3dd3cc22eb2ac1d891f89c0b9b4549a85bda113108198f3c1bff0d1034fd7b |

## Arquitectura y entrenamiento

La model card describe un Transformer decoder-only orientado a traduccion, no un encoder-decoder clasico. Esto implica que la traduccion se resuelve de forma autorregresiva condicionada por el texto de entrada, un planteamiento habitual en implementaciones docentes por su simplicidad frente a las arquitecturas seq2seq con encoder y decoder independientes. No se documenta como se senala la direccion de traduccion (por ejemplo, mediante prefijos de tarea o tokens especiales), ni el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni el tamano del vocabulario.

Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion efectiva del dataset mas alla de su nombre, la estrategia de tokenizacion (unicamente se almacena el sha256 del tokenizer, que no se publica como fichero independiente), ni sobre tecnicas de alineacion como RLHF, DPO o SFT. El propio checkpoint incluye una clave `summary`, presumiblemente con el resumen de entrenamiento, pero su contenido no se detalla en el repositorio. No se identifica ninguna innovacion tecnica destacable (atencion lineal, decodificacion especulativa, MoE o hibridaciones SSM).

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles, segun la descripcion explicita de la model card.
- Generacion de texto autorregresiva propia de la arquitectura decoder-only (generacion condicionada al texto de entrada).
- Capacidad de cargarse y ejecutarse con las definiciones `Config` y `Transformer` del cuaderno `implementation.ipynb`, lo que permite reutilizar la implementacion.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte para agentes ni razonamiento multi-paso.
- No hay evidencia de capacidades multimodales (vision o audio).
- No hay evidencia de modo "thinking" ni de razonamiento extendido.
- Capacidades multilingues limitadas a los idiomas declarados (vi, ja de entrada; en de salida); no se documentan otros pares.
- No se documenta un chat template, formato de instrucciones ni ajuste por instrucciones.

## Casos de uso

- Reproducibilidad academica: cargar checkpoint.pt con las clases de `implementation.ipynb` permite verificar el hash sha256 y reproducir exactamente el entrenamiento descrito en la entrega de la asignatura.
- Baseline en investigacion en traduccion automatica: sirve como referencia minima frente a sistemas establecidos en tareas vi-en y ja-en, siempre que se documente que carece de evaluacion publicada.
- Practicas docentes de arquitecturas decoder-only: el checkpoint y su cuaderno asociado permiten estudiar como se implementa un Transformer generativo sin las abstracciones de librerias de alto nivel.
- Generacion de datos sinteticos para ampliacion de corpus: si la calidad lo permite tras una evaluacion propia, puede emplearse para crear borradores de traducciones que despues se revisen manualmente antes de incorporarlas a corpus paralelos.
- Prototipado de pipelines de traduccion internos: para validar de extremo a extremo un flujo vi/ja hacia ingles (preprocesado, inferencia, postprocesado) antes de sustituir el motor por uno con licencia y metricas conocidas.
- Traduccion exploratoria de documentacion tecnica en japones: util como primer borrador en flujos internos donde exista revision humana obligatoria, dado que no hay datos de calidad ni de fidelidad.
- Estudio de tokenizacion en idiomas no latinos: el campo `tokenizer_sha256` permite comprobar la coherencia del tokenizer empleado al comparar ejecuciones, algo relevante en vietnamita y japones, donde la segmentacion afecta directamente a la calidad de la traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No consta ninguna evaluacion en BLEU, chrF, COMET, MMLU, HumanEval ni GSM8K, ni comparaciones con sistemas de traduccion de referencia. Tampoco se incluye una particion de validacion ni un conjunto de prueba descrito en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. A partir del unico dato objetivo publicado, el tamano del repositorio (0,1 GB), se puede acotar que el checkpoint completo ocupa como maximo ese orden de magnitud; si los pesos estan en fp32, corresponderia aproximadamente a decenas de millones de parametros, y si estuvieran en fp16, al doble. Es una estimacion derivada del tamano de fichero, no un dato confirmado por el autor.
- Si la estimacion anterior es correcta, la inferencia cabria holgadamente en GPUs de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU, con un consumo de memoria inferior a 1 GB en fp32 y en torno a la mitad en fp16. Debe verificarse al cargar el modelo.
- GPU profesionales: cualquier acelerador con al menos 8 GB de VRAM seria suficiente segun esa misma estimacion (A100, H100, L4, T4); no se dispone de mediciones reales.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, porque el artefacto publicado es un `.pt` con un state dict personalizado que requiere las definiciones `Config` y `Transformer` del cuaderno `implementation.ipynb`. Tampoco se publican pesos en safetensors ni en GGUF, por lo que no es posible cargarlo con `transformers` ni convertirlo a estos formatos sin escribir codigo de conversion propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion se plantea frente a sistemas de traduccion multilingue ampliamente utilizados en el mismo par de idiomas (vi-en y ja-en). Los datos del modelo analizado son en su mayoria desconocidos, por lo que la tabla refleja esa asimetria de informacion.

| Modelo | Arquitectura | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Devatri/anlp-assignment2-part1-model2 | Transformer decoder-only | no disponible | vi, ja como entrada; en como salida | no disponible | no disponible | Checkpoint .pt en HuggingFace, requiere codigo propio |
| NLLB-200 (Meta) | Transformer encoder-decoder, variante MoE en el modelo completo | 54.500 M en la version completa; versiones destiladas de 600 M y 1.300 M | 200 idiomas, incluye vi, ja y en | 512 tokens en las versiones destiladas | CC-BY-NC-4.0 (uso no comercial) | Pesos en HuggingFace y soporte en `transformers` |
| M2M-100 (Meta) | Transformer encoder-decoder | 418 M, 1.200 M y 12.000 M | 100 idiomas, incluye vi, ja y en | no disponible en la informacion consultada | MIT | Pesos en HuggingFace |
| OPUS-MT (Helsinki-NLP) | Marian NMT, encoder-decoder | Modelos bilingues del orden de decenas de millones de parametros por par | Pares bilingues concretos, con variantes vi-en y ja-en | no disponible en la informacion consultada | CC-BY 4.0 en la mayoria de variantes | Pesos en HuggingFace, integrables con `transformers` |

Frente a estas alternativas, el modelo analizado carece de licencia declarada, de metricas y de formatos estandarizados, lo que lo situa fuera de cualquier comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia de licencia: no se especifica ninguna, lo que genera incertidumbre juridica sobre su uso, redistribucion o explotacion comercial.
- Ausencia total de evaluacion: no hay BLEU, chrF, COMET ni ninguna otra metrica publicada, por lo que se desconoce la calidad real de las traducciones.
- Artefacto de asignatura: el nombre y la descripcion indican que es una entrega academica parcial ("Part 1, model 2"), no un modelo mantenido ni versionado.
- Formato no estandar: al ser un checkpoint `.pt` con state dict personalizado, no se carga con `transformers`, vLLM, llama.cpp, Ollama ni TGI sin conversion previa, y no hay garantia de que dicha conversion sea trivial.
- Tokenizer no publicado: solo se almacena su sha256, no el vocabulario ni las reglas de segmentacion, lo que dificulta la reproducibilidad completa.
- Riesgo de alucinacion: cualquier modelo generativo de traduccion puede producir contenido no presente en el texto fuente, omitir informacion o inventar terminos; sin evaluacion, este riesgo no esta cuantificado.
- Sesgos desconocidos: no se documenta la composicion del dataset mas alla de su nombre, ni filtros de toxicidad o sesgo aplicados durante el entrenamiento.
- Limitaciones de idioma y contexto: solo se declaran vietnamita y japones como entrada e ingles como salida; la longitud de contexto es desconocida, por lo que documentos largos pueden truncarse de forma silenciosa.
- Sin alineacion ni instrucciones: no hay evidencia de RLHF, DPO ni ajuste por instrucciones, de modo que no debe esperarse un comportamiento conversacional estable.
- No apto para produccion sin validacion previa: cualquier despliegue real exige evaluacion propia, revision humana de las salidas y verificacion de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Devatri/anlp-assignment2-part1-model2
- Dataset de entrenamiento mencionado en la model card: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Cuaderno `implementation.ipynb` (referenciado en la model card como contenedor de las definiciones `Config` y `Transformer`): no disponible como enlace publico en la informacion proporcionada
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
