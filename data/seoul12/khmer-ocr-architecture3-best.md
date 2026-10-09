# Seoul12/khmer-ocr-architecture3-best

## Resumen

Khmer OCR Architecture 3 es un modelo de reconocimiento optico de caracteres (OCR) especializado en lineas de texto en jemer (khmer). Lo publica el usuario Seoul12 en Hugging Face como un checkpoint de demostracion, no como un modelo de produccion con soporte oficial. El problema que resuelve es acotado pero relevante: convertir una imagen ya recortada de una sola linea de texto impreso en jemer a su transcripcion Unicode, una tarea para la que existen pocos recursos abiertos dada la complejidad del sistema de escritura jemer (sin espacios entre palabras, con conglomerados consonantigos y diacriticos que se apilan verticalmente).

La arquitectura combina tres componentes: un extractor de caracteristicas convolucional (CNN), un encoder Transformer y una cabeza de decodificacion CTC (Connectionist Temporal Classification). El autor publica un unico checkpoint, `best.pt`, correspondiente al paso 87.000 de un entrenamiento completado de 100.000 pasos, con un error de caracter macro del 8,23 % sobre el conjunto de validacion usado para seleccionar el checkpoint.

La relevancia de esta publicacion es principalmente practica y experimental: se distribuye con un cuaderno de Google Colab que ejecuta la inferencia en CPU y con un pequeno conjunto de ejemplos seleccionados, lo que permite reproducir el comportamiento del modelo sin GPU. No hay informacion publicada sobre numero de parametros, licencia, idiomas soportados ni volumen del conjunto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN + encoder Transformer + CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de reconocimiento de lineas, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card solo menciona texto jemer) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (checkpoint de PyTorch); no se ofrecen safetensors ni GGUF |
| Tarea | Reconocimiento de lineas de texto recortadas (OCR de linea) |
| Checkpoint publicado | `best.pt`, paso 87.000 de 100.000 |
| Tamano del repositorio | 0,0 GB (segun el indice de Hugging Face) |
| Fecha de creacion | 2026-10-09 |
| Ultima actualizacion | 2026-10-09 |

## Arquitectura y entrenamiento

El modelo es un reconocedor de texto de linea completo, no un modelo de lenguaje. La secuencia es la habitual en OCR moderno: una red convolucional extrae un mapa de caracteristicas de la imagen de entrada, un encoder Transformer modela las dependencias entre las posiciones de esa secuencia de caracteristicas y una cabeza CTC produce la secuencia de simbolos sin necesidad de alineacion explicita entre imagen y etiqueta. CTC es una eleccion coherente para escrituras con orden de lectura no estrictamente lineal o con segmentacion ambigua por caracter, como ocurre con los conglomerados y diacriticos del jemer.

El autor indica que el checkpoint publicado corresponde al paso 87.000 de una ejecucion completada de 100.000 pasos, y reporta un error de caracter macro del 8,23 % en validacion. Es importante subrayar lo que el propio autor advierte: ese conjunto de validacion se uso para seleccionar el checkpoint, por lo que la cifra no constituye un benchmark independiente y esta optimista respecto al rendimiento en datos no vistos. No se especifica el numero de tokens o de lineas de entrenamiento, la composicion del dataset, el uso de aumentacion de datos ni si hubo etapas de ajuste fino adicionales. Tampoco se documenta el numero de parametros, el numero de capas, la dimension del modelo ni el tamano del vocabulario de salida.

## Capacidades

- Reconocimiento de texto impreso en jemer sobre imagenes de una sola linea ya recortadas.
- Decodificacion CTC, que produce la transcripcion sin requerir segmentacion previa por caracter.
- Inferencia en CPU, segun el cuaderno de demostracion publicado por el autor.
- Ejecucion por linea de comandos sobre una imagen individual o sobre un manifiesto de ejemplos (`inference.py --checkpoint best.pt --image ...` y `--manifest demo/manifest.json`).
- No hay evidencia de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia de capacidades multimodales mas alla de la imagen de linea a texto.
- No hay informacion sobre modo de razonamiento, vision general, audio ni generacion de texto libre.
- El alcance multilingue no esta documentado; la unica lengua mencionada es el jemer.

## Casos de uso

- Digitalizacion de documentos impresos en jemer: el modelo esta disenado especificamente para lineas impresas recortadas, por lo que encaja en un pipeline de digitalizacion donde un detector de texto y un segmentador de lineas previos alimentan cada recorte al reconocedor.
- Creacion de corpus textuales en jemer para investigacion en PLN: al convertir paginas escaneadas en texto plano, permite construir conjuntos de datos para entrenar o evaluar modelos de lenguaje en una lengua con recursos escasos.
- Indexacion y busqueda full-text sobre archivos escaneados: una vez transcritas las lineas, el texto se puede indexar en un motor de busqueda, lo que hace accesible contenido que hoy solo existe como imagen.
- Preservacion de patrimonio documental: archivos, publicaciones periodicas antiguas y documentos administrativos en jemer pueden transcribirse en lote, siempre que el material sea impreso y no manuscrito.
- Digitalizacion de formularios y documentos administrativos: con un paso previo de deteccion de campos y segmentacion de lineas, el modelo extrae el contenido textual de cada campo para su volcado a bases de datos.
- Validacion de calidad en pipelines de OCR: al disponer de un cuaderno reproducible con ejemplos y del checkpoint exacto, sirve como referencia interna para comparar el error de caracter frente a otros motores de OCR sobre el mismo lote de lineas jemer.
- Prototipado y docencia: el cuaderno de Colab con inferencia en CPU permite que estudiantes o desarrolladores prueben el modelo sin infraestructura GPU, usando el conjunto de ejemplos seleccionado.

## Benchmarks y rendimiento

El autor reporta un unico dato: error de caracter macro (CER) del 8,23 % en el conjunto de validacion usado para seleccionar el checkpoint. El propio autor advierte que este conjunto no es un benchmark independiente.

| Metrica | Valor | Conjunto | Nota |
|---|---|---|---|
| CER macro | 8,23 % | Validacion (seleccion de checkpoint) | No independiente; optimista |
| CER macro | no disponible | Test independiente | No publicado |
| Exact match | no disponible | Test independiente | No publicado |
| Comparacion con otros modelos | no disponible | - | No se aportan datos comparativos |

No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica el numero de parametros ni el tamano del checkpoint en la informacion proporcionada.
- El repositorio figura con un tamano de 0,0 GB en el indice de Hugging Face, dato que no permite estimar el peso real de `best.pt`.
- GPU recomendadas: no disponible, por ausencia de datos de tamano y de throughput.
- Encaje en GPU de consumo: no disponible. La demostracion publicada esta pensada para ejecutarse en CPU.
- Opciones de despliegue: no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son aplicables a un reconocedor CTC de este tipo. El despliegue previsto es mediante PyTorch con Python 3.10 o superior, `pip install -r requirements.txt` y el script `inference.py`.
- Latencia y throughput: no disponible. El autor solo indica que la inferencia se calcula en tiempo de ejecucion desde el checkpoint, sin cifras de rendimiento.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de OCR en jemer ni datos que permitan situar este checkpoint frente a alternativas. Ademas, al no publicarse el numero de parametros, el tamano del checkpoint ni resultados en un conjunto de test independiente, cualquier comparacion cuantitativa seria especulativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Seoul12/khmer-ocr-architecture3-best | no disponible | no aplica (OCR de linea) | CER 8,23 % en validacion de seleccion | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance limitado a lineas ya recortadas: el modelo no incluye deteccion de texto ni segmentacion de lineas. Para una pagina completa hay que anadir ambos pasos por separado.
- Rendimiento degradado esperado en escritura manuscrita y en fotografias de escenas, segun advierte el propio autor; el modelo esta pensado para lineas impresas.
- La cifra de 8,23 % de CER procede del conjunto usado para seleccionar el checkpoint, por lo que no debe presentarse como rendimiento en datos no vistos.
- El conjunto de demostracion contiene ejemplos seleccionados por haber sido resueltos correctamente; su tasa de acierto no es una estimacion de precision en imagenes nuevas.
- Licencia no especificada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Es un bloqueante para cualquier despliegue en produccion.
- Soporte de idiomas no documentado; no hay garantia de comportamiento correcto fuera del jemer ni datos sobre variedad dialectal o registros historicos.
- Ausencia total de datos de entrenamiento: sin numero de lineas, composicion del corpus ni procedencia, no es posible evaluar sesgos, cobertura de dominios ni riesgo de sobreajuste al conjunto de validacion.
- Riesgo de alucinacion a nivel de caracter: como todo decodificador CTC, puede emitir caracteres plausibles donde la imagen es ambigua, borrosa o de baja resolucion, sin senal de confianza documentada.
- No hay informacion sobre cuantizacion ni formatos optimizados, lo que complica el despliegue en entornos con restricciones de memoria.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y creado y actualizado el mismo dia: no hay evidencia de uso, mantenimiento ni validacion por terceros.
- Sin pipeline declarado en Hugging Face ni integracion con `transformers`, por lo que la integracion requiere cargar el checkpoint `.pt` manualmente con PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Seoul12/khmer-ocr-architecture3-best
- Conjunto de datos de demostracion: https://huggingface.co/datasets/Seoul12/khmer-ocr-selected-demo
- Cuaderno de demostracion en Google Colab: https://colab.research.google.com/github/SeoulDoriot/khmer-ocr-demo/blob/main/Demo.ipynb
- Checkpoint de origen en Kaggle: https://www.kaggle.com/code/seoulvy/khmer-ocr-architecture-3-100k-continuation/output?scriptVersionId=356010649
