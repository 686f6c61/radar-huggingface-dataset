# diarizeapp/eres2netv2-sv-zh-cn-16k-onnx

# ERes2NetV2 speaker verification en ONNX, version de diarizeapp

## Resumen
ERes2NetV2 Speaker Verification (ONNX) es un modelo de verificacion de locutor (speaker verification) publicado por el usuario diarizeapp en HuggingFace. Se trata de una exportacion optimizada a ONNX (opset 18) del modelo de Alibaba `iic/speech_eres2netv2_sv_zh-cn_16k-common`, disponible originalmente en ModelScope dentro del ecosistema 3D-Speaker. El modelo no genera texto: su funcion es convertir un fragmento de audio en un vector de embedding de 192 dimensiones que representa la identidad vocal del hablante, de modo que dos fragmentos del mismo locutor produzcan vectores con alta similitud coseno.

La relevancia practica de esta ficha esta en el formato: los pesos (~17,8 millones de parametros, unos 71 MB en float32) se consolidan en un unico fichero `eres2netv2.onnx` sin blobs externos, lo que permite desplegarlo con ONNX Runtime en cualquier entorno (Python, C++, Rust) y ejecutarlo en CPU sin GPU. Eso lo convierte en una pieza util para pipelines de diarizacion, verificacion biometrica y curacion de datasets de audio, donde se necesita un extractor de embeddings ligero y determinista en lugar de un modelo generativo.

El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, con un tamano de 0,1 GB y licencia Apache 2.0. La model card documenta con detalle el preprocesado requerido (log-Mel fbank de 80 dimensiones a 16 kHz), la forma de los tensores de entrada y salida, la necesidad de normalizar en L2 la salida y los umbrales operativos recomendados para similitud coseno y para clustering jerarquico aglomerativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2NetV2 (red convolucional basada en Res2Net mejorado, con fusion de caracteristicas multi-escala) |
| Parametros totales | ~17,8 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es audio de duracion variable con tensor `feature` de forma `[batch_size, frame_num, 80]` |
| Tipos de cuantizacion | float32 (unico formato publicado); no se ofrecen variantes INT8 o FP16 oficiales |
| Idiomas soportados | zh, en, multilingual (etiquetas declaradas en el repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 18), fichero unico `eres2netv2.onnx` de ~71 MB, sin datos externos |
| Dimension del embedding de salida | 192 |
| Frecuencia de muestreo | 16 kHz |
| Caracteristicas de entrada | 80 log-Mel filterbanks (ventana 25 ms, hop 10 ms, ventana Povey, normalizacion de media cepstral) |
| Tensor de entrada | `feature`, `[batch_size, frame_num, 80]`, tiempo y batch dinamicos |
| Tensor de salida | `embedding`, `[batch_size, 192]`, sin normalizar (norma L2 ~126; requiere normalizacion posterior) |
| Tamano del repositorio | 0,1 GB |
| Libreria declarada | onnx (ONNX Runtime) |

## Arquitectura y entrenamiento
ERes2NetV2 es una evolucion del bloque Res2Net orientada a reconocimiento de locutor: la red procesa mapas de caracteristicas acusticas mediante agrupaciones convolucionales multi-escala que aumentan el campo receptivo efectivo sin disparar el coste computacional, y combina la informacion local con la global para producir un embedding compacto de 192 dimensiones. La exportacion incluida en este repositorio mantiene la topologia del modelo original de Alibaba y la serializa en un unico grafo ONNX de opset 18 en precision float32, con ejes dinamicos de batch y de numero de tramas.

La model card no documenta el corpus de entrenamiento (numero de horas, composicion del dataset, idiomas exactos ni proporcion de hablantes), ni el tipo de funcion de perdida empleada, ni si hubo etapas de ajuste fino con RLHF/DPO (algo poco habitual en modelos de embedding, donde lo comun es entrenamiento discriminativo con perdidas tipo AAM-softmax). Tampoco se detalla el procedimiento de conversion desde PyTorch ni si se aplico simplificacion del grafo. Toda esa informacion debe considerarse **no disponible** en la documentacion proporcionada.

El detalle tecnico mejor documentado es el contrato de inferencia: el modelo consume log-Mel fbank de 80 dimensiones calculados externamente (no incluye el extractor de caracteristicas en el grafo), y devuelve embeddings **sin normalizar** cuya norma L2 ronda 126. La model card insiste en que hay que aplicar normalizacion unitaria (`emb / ||emb||`) antes de calcular similitud coseno, lo que implica que cualquier integracion debe implementar ese paso de forma explicita.

## Capacidades
- Extraccion de embeddings de locutor de 192 dimensiones a partir de audio de 16 kHz, con batch y duracion dinamicos.
- Verificacion 1:1 (mismo hablante / hablante distinto) mediante similitud coseno sobre embeddings normalizados.
- Diarizacion de audio: los embeddings son aptos para clustering jerarquico aglomerativo (AHC) con enlace promedio y distancia coseno (1 - coseno) en el rango 0,36-0,38.
- Comparacion entre grabaciones de distinta duracion y distinta calidad, siempre que el preprocesado fbank sea consistente.
- Ejecucion en ONNX Runtime con proveedores de CPU, CUDA u otros Execution Providers, sin dependencia de PyTorch en inferencia.
- Soporte multilingue declarado (zh, en, multilingual), heredado del modelo base entrenado con datos "common".
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio generation, tool calling ni capacidades de agente. Es exclusivamente un extractor de representaciones de voz.

## Casos de uso
- Diarizacion de reuniones y transcripciones: se segmenta el audio, se extrae un embedding por segmento y se agrupa con AHC (umbral coseno 0,36-0,38) para etiquetar quien habla en cada turno; el modelo es adecuado porque el fichero ONNX se integra en el mismo proceso que el motor de ASR sin dependencias pesadas.
- Verificacion biométrica de voz en atencion telefonica: enrolamiento con 3-5 muestras del cliente y comparacion por coseno contra el audio de la llamada, aplicando el umbral >0,65 para aceptar y <0,55 para rechazar, dejando la banda 0,55-0,65 para verificacion adicional.
- Control de acceso y autenticacion en aplicaciones moviles: al pesar ~71 MB y ejecutarse en CPU, puede embeberse en servicios backend modestos o incluso en dispositivos con ONNX Runtime movil.
- Analisis de calidad en contact centers: separar automaticamente las voces de agente y cliente en miles de grabaciones para medir tiempos de habla, solapamiento y adherencia a guiones.
- Curacion de datasets de voz para entrenar TTS o ASR: detectar duplicados de un mismo hablante y equilibrar la distribucion de locutores antes de entrenar, evitando fuga de identidad entre conjuntos de train y test.
- Indexacion y busqueda por hablante en archivos de medios: construir un indice de embeddings por locutor sobre podcasts, radios o archivos de video y recuperar todas las apariciones de una persona concreta.
- Preprocesado de pipelines de subtitulado automatico: asignar etiquetas de hablante a subtitulos generados por ASR, mejorando la legibilidad de contenido con multiples interlocutores.
- Antifraude y deteccion de suplantacion: comparar la voz de una locucion nueva contra un perfil historico del cliente para detectar voces sinteticas o terceros no autorizados, siempre como senal auxiliar y no como unico factor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de EER, minDCF, tasas de acierto en VoxCeleb, CN-Celeb ni de ningun otro conjunto de evaluacion, ni comparaciones con modelos previos.

El unico dato operativo publicado son los umbrales de similitud coseno recomendados por el autor, que se recogen en la siguiente tabla:

| Escenario | Similitud coseno (vectores unitarios) |
|---|---|
| Mismo hablante (coincidencia genuina) | > 0,65 |
| Zona ambigua o audio distorsionado | 0,55 - 0,65 |
| Hablante distinto (impostor) | < 0,55 (pares de estudio con genero emparejado: ~0,48 - 0,52) |
| Umbral de clustering AHC (enlace promedio, distancia coseno) | 0,36 - 0,38 |

Estos valores son recomendaciones del autor para su pipeline, no resultados de evaluacion sobre un conjunto de test publico.

## Requisitos de hardware
- VRAM/RAM de pesos: ~71 MB en float32 (aproximadamente 17,8 M de parametros x 4 bytes).
- Consumo total estimado en inferencia: por debajo de 500 MB de RAM con un batch pequeno, incluyendo el runtime y los tensores intermedios (estimacion orientativa derivada del tamano del modelo; no publicada por el autor).
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer con soporte CUDA (GTX 1050/1650 en adelante, RTX 3060, RTX 4090) acelera el procesado por lotes, pero tambien es viable en CPU moderna con AVX2.
- GPU de centro de datos (A100, H100): innecesarias para este modelo; solo tendrian sentido si se procesan millones de segmentos en paralelo y se quiere maximizar el throughput agregado.
- Cabe holgadamente en cualquier GPU consumer e incluso en iGPU o en CPU de un portatil.
- Opciones de despliegue: ONNX Runtime (Python, C++ con `ort`, Rust con `ort` + `kaldi-native-fbank`), segun los ejemplos de la propia model card. Requiere un extractor externo de fbank (por ejemplo `torchaudio.compliance.kaldi.fbank` o `kaldi-native-fbank`).
- Frameworks de servido de LLM (vLLM, TGI, llama.cpp, Ollama) no aplican: no es un modelo de lenguaje y no hay pesos GGUF.
- Latencia y throughput estimados: no disponibles. Dependen del Execution Provider, del hardware y de la duracion del audio de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ERes2NetV2 SV ONNX (este repositorio) | ~17,8 M | embedding 192 dim | ONNX opset 18, fichero unico | Apache 2.0 | Exportacion de diarizeapp; 0 descargas; sin benchmarks publicados |
| iic/speech_eres2netv2_sv_zh-cn_16k-common (modelo base) | ~17,8 M (mismo modelo) | embedding 192 dim | PyTorch / ModelScope | no disponible en la informacion consultada | Requiere entorno PyTorch y descarga de pesos por separado |
| CAM++ (familia 3D-Speaker) | ~7,2 M (aprox., fuentes publicas) | embedding de locutor | PyTorch | Apache 2.0 (proyecto 3D-Speaker) | Alternativa mas ligera del mismo ecosistema; sin exportacion ONNX en este repositorio |
| ECAPA-TDNN (SpeechBrain) | ~20,8 M (aprox., fuentes publicas) | embedding 192 dim | PyTorch | Apache 2.0 | Arquitectura basada en atencion de canales; ecosistema amplio pero mas pesado en despliegue |

Nota: los recuentos de parametros de las alternativas provienen de fuentes publicas y no se han verificado contra una model card concreta; tratalos como aproximados. No se dispone de datos comparativos de EER o minDCF entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- No es un modelo generativo: no produce texto ni razonamiento, por lo que no existe riesgo de alucinacion linguistica. El error tipico es de identidad: asignar dos voces distintas al mismo locutor (o viceversa) cuando el audio es ruidoso, muy corto o con solapamiento de voces.
- La salida debe normalizarse en L2 antes de calcular similitud coseno. Omitir ese paso invalida por completo la comparacion, ya que las normas de los embeddings crudos rondan 126.
- Los umbrales 0,65 / 0,55 y el rango AHC 0,36-0,38 son recomendaciones no calibradas publicamente; conviene recalibrarlos con datos propios del dominio (telefonia, microfono de sala, audio comprimido) antes de llevarlos a produccion.
- La model card no documenta el corpus de entrenamiento. No es posible auditar sesgos de genero, edad, acento, idioma o etnia, ni conocer la cobertura real de idiomas mas alla de las etiquetas zh/en/multilingual. El modelo base se identifica como `zh-cn`, lo que sugiere un peso relevante de hablantes de mandarin en el entrenamiento.
- Compatibilidad de preprocesado estricta: el modelo espera fbank de 80 dimensiones con ventana Povey, ventana de 25 ms, hop de 10 ms y normalizacion de media cepstral. Cualquier desviacion (otro numero de filtros, dither activado, otra frecuencia de muestreo sin remuestreo previo) degrada los embeddings.
- Los datos de voz son datos biometricos: su tratamiento entra en el ambito del RGPD en la UE. Se requiere base legal y consentimiento explicito para enrolamiento y verificacion de personas reales, ademas de medidas de cifrado y minimizacion de los embeddings almacenados.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de copyright y la licencia, e incluir el aviso de cambios si se modifica el modelo. No hay clausulas de uso restringido, pero el autor original del modelo base (Alibaba, via ModelScope) debe ser citado segun los terminos del proyecto del que procede.
- El repositorio tiene 0 descargas y 0 "likes", y los metadatos declaran una fecha de creacion de 2026-09-26; no existe validacion independiente ni comunidad que haya reproducido los resultados.
- No se declaran limitaciones de duracion minima de audio. En la practica, los sistemas de verificacion de locutor pierden precision con utterances muy cortas (por debajo de 1-2 segundos), pero el autor no publica cifras al respecto.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/diarizeapp/eres2netv2-sv-zh-cn-16k-onnx
- Modelo base en ModelScope: https://modelscope.cn/models/iic/speech_eres2netv2_sv_zh-cn_16k-common
- Repositorio 3D-Speaker (ecosistema de diarizacion y verificacion de Alibaba): https://github.com/modelscope/3D-Speaker
- Repositorio FunASR (toolkit de reconocimiento de voz relacionado): https://github.com/modelscope/FunASR
- Paper de la arquitectura ERes2Net (arXiv:2212.06326)
- Paper de ERes2NetV2 (arXiv:2401.11389)
- ONNX Runtime: https://onnxruntime.ai/
- kaldi-native-fbank (extraccion de caracteristicas fbank, uso en Rust): https://github.com/ref-io/kaldi-native-fbank

Nota sobre la busqueda web: los resultados recuperados en la busqueda corresponden a fichas bibliograficas de libros y no guardan relacion con este modelo; no se ha incorporado ningun dato de esas fuentes.
