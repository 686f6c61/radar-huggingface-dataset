# krut42/voice-lid-ecapa-voxlingua107

## Resumen

Voice LID ECAPA VoxLingua107 es una conversion a ONNX del modelo de identificacion de idioma hablado `speechbrain/lang-id-voxlingua107-ecapa`, publicada por el usuario krut42. El resultado es un unico fichero ONNX de 26.602.386 bytes con cuantizacion dinamica int8 que acepta audio PCM en crudo a 16 kHz y devuelve log-probabilidades sobre 107 idiomas. La innovacion practica es que todo el pipeline de extraccion de caracteristicas de SpeechBrain (STFT, espectro de potencia, banco de filtros mel de 60 bins, normalizacion temporal) esta integrado dentro del grafo, por lo que el llamante no necesita ninguna libreria de procesamiento de audio: basta con ONNX Runtime.

El modelo no es un modelo de lenguaje ni un sistema de reconocimiento automatico del habla, sino un clasificador de audio. Internamente emplea la arquitectura ECAPA-TDNN, un TDNN con atencion de canal y agregacion estadistica, entrenado originalmente por SpeechBrain sobre el corpus VoxLingua107. La conversion reescribe 16 convoluciones puntuales (1x1), que concentran el 93 % de los pesos, como MatMul con la activacion a la izquierda, porque en ARM el MatMul int8 de ONNX Runtime es entre 3 y 5 veces mas rapido que la convolucion int8 equivalente.

Es relevante ahora porque demuestra un caso de cuantizacion selectiva orientada al hardware: solo se cuantizan los pesos de las MatMul (int8 dinamico), mientras que las convoluciones con kernel mayor que 1, la STFT y la matriz mel permanecen en fp32. El autor reporta que las respuestas con int8 son identicas a las de fp32 en su conjunto de prueba y que 10 segundos de audio bastan para alcanzar la misma precision que el audio completo. El caso de uso declarado es la aplicacion de grabacion de voz «Слышно» para Android, que selecciona automaticamente el idioma de una nueva grabacion entre los idiomas que habla el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (TDNN con atencion de canal y pooling estadistico) + clasificador lineal; pipeline de caracteristicas integrado en el grafo ONNX |
| Parametros totales | no disponible (el autor no publica el recuento; el fichero int8 ocupa 26.602.386 bytes) |
| Longitud de contexto | no disponible / no aplica: entrada de audio de al menos 1 s; 10 s de audio son suficientes para la maxima precision reportada |
| Tipos de cuantizacion | int8 dinamico (ONNX Runtime `quantize_dynamic`) aplicado solo a los pesos de las 16 MatMul (93 % de los pesos); convoluciones k>1, STFT y matriz mel en fp32 |
| Idiomas soportados | 107 idiomas (etiquetas en `lid-labels.txt`, en orden alfabetico segun VoxLingua107); evaluacion publicada sobre 15 idiomas: ru, uk, be, kk, uz, tg, en, de, es, fr, it, pl, pt, ar, ja |
| Licencia | apache-2.0 (pesos originales de SpeechBrain); datos de entrenamiento VoxLingua107 bajo CC BY 4.0 |
| Formato de pesos | ONNX (opset 17), fichero `lid-ecapa-voxlingua107.int8.onnx`; incluye `lid-labels.txt` y `export_lid.py` |
| Entrada | `wav`: float32 `[1, samples]`, 16 kHz mono, valores en [-1, 1] (PCM16 / 32768) |
| Salida | `logp`: float32 `[1, 107]`, log-softmax sobre las etiquetas de `lid-labels.txt` |
| Modelo base | `speechbrain/lang-id-voxlingua107-ecapa`, revision `0253049ae131d6a4be1c4f0d8b0ff483a0f8c8e9` |
| Libreria | onnx |
| Pipeline | audio-classification |
| Fecha de publicacion (metadatos HF) | 2026-10-03 |
| Descargas / likes en Hugging Face | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de partida es ECAPA-TDNN, el modelo de embeddings de hablante e idioma introducido en el ecosistema SpeechBrain. Se trata de una red TDNN con convoluciones dilatadas, atencion de canal y agregacion estadistica multi-cabecera, seguida de un clasificador sobre 107 clases. En esta conversion no se modifica ni el extractor de embeddings ni el clasificador: se mantienen sin cambios respecto al modelo original. Lo que si se modifica es el preprocesado, que pasa a formar parte del grafo: la STFT se implementa como dos convoluciones con kernels `hamming(400) * cos` y `hamming(400) * sin` (hop 160, centrado, relleno de ceros), seguida del espectro de potencia, la matriz mel de 60 bins de SpeechBrain, un `10 * log10` con suelo de 80 dB y normalizacion de media a lo largo del tiempo.

El entrenamiento original corresponde a SpeechBrain sobre VoxLingua107 (Valk y Alumae, 2021), un corpus de datos extraidos de YouTube con etiquetas de idioma. La ficha no detalla el numero de tokens ni de horas de audio, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; al tratarse de un clasificador discriminativo, estos mecanismos de alineacion no aplican en el sentido habitual. Tampoco se documentan hiperparametros de entrenamiento, aumento de datos ni estrategia de validacion mas alla del conjunto de prueba descrito en la seccion de benchmarks.

La aportacion tecnica de esta conversion se concentra en tres puntos. Primero, la exportacion a ONNX opset 17 con el preprocesado embebido, con una diferencia maxima de log-probabilidades de 1,5e-5 frente al pipeline original de SpeechBrain en PyTorch y de 8,7e-5 frente al ONNX fp32 con la reescritura del punto siguiente. Segundo, la reescritura de las 16 convoluciones puntuales (1x1) como MatMul con la activacion a la izquierda y el peso a la derecha, motivada porque el MatMul int8 de ONNX Runtime es 3-5 veces mas rapido que la convolucion int8 en ARM. Tercero, una cuantizacion int8 dinamica restringida a los pesos de esas MatMul, dejando en fp32 el 7 % restante de los pesos, la STFT y la matriz mel. El script `export_lid.py` es determinista: volver a ejecutarlo produce exactamente los mismos bytes.

## Capacidades

- Identificacion de idioma hablado entre 107 clases, devolviendo log-probabilidades por idioma (no una unica etiqueta), lo que permite aplicar umbrales, margenes o fusion de decisiones.
- Entrada de audio en crudo: acepta `float32 [1, samples]` a 16 kHz mono y realiza internamente STFT, banco mel, escala logaritmica y normalizacion temporal. No requiere librosa, torchaudio ni ningun extractor externo.
- Ejecucion en dispositivo (on-device) con ONNX Runtime estandar en Java, C y Python, sin GPU.
- Funcionamiento con audio corto: a partir de 1 s de entrada; el autor indica que los primeros 10 s rinden igual que la grabacion completa.
- Compatibilidad con Android en arm64-v8a y armeabi-v7a, ademas de x86-64 de escritorio.
- Reproducibilidad del artefacto: exportacion determinista a partir de `export_lid.py`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling ni agentes multi-paso: es un clasificador de audio, no un modelo generativo.
- No realiza transcripcion ni traduccion; no distingue hablantes ni segmenta audio.

## Casos de uso

- Etiquetado automatico de grabaciones de voz en aplicaciones moviles: es el caso de uso original. La aplicacion «Слышно» usa el modelo para elegir, entre los idiomas que habla el usuario, el idioma de una grabacion nueva. Al ocupar 26,6 MB y ejecutarse en CPU ARM en menos de un segundo sobre audio de 10 s, encaja en el ciclo de guardado sin penalizar la experiencia de usuario.
- Enrutado previo de llamadas en atencion al cliente multilingue: el modelo actua como clasificador de primera etapa que determina el idioma del cliente antes de invocar el sistema de reconocimiento de voz o de asignar agente. Procesar 10 s de audio en 0,15 s en x86-64 permite integrarlo en la fase de saludo sin coste perceptible.
- Seleccion dinamica de modelo ASR en pipelines de transcripcion: en lugar de ejecutar un unico modelo multilingue, se identifica el idioma y se deriva la peticion al modelo especifico (por ejemplo, uno entrenado solo en ruso o en castellano), reduciendo coste por minuto y mejorando la precision en idiomas con pocos recursos.
- Filtrado y control de calidad de corpus de audio: al devolver log-probabilidades sobre 107 clases, permite detectar grabaciones cuya etiqueta declarada no coincide con el idioma real del audio, algo habitual en corpus recopilados de fuentes abiertas. El margen entre la clase mas probable y la segunda sirve como criterio de confianza.
- Indexado y busqueda de archivos de audio en repositorios corporativos: etiquetar automaticamente horas de reuniones, notas de voz o archivos de soporte por idioma facilita busquedas y políticas de retencion por region linguistica.
- Moderacion y analisis de audio subido por usuarios: preclasificar por idioma permite aplicar reglas de moderacion especificas por mercado y priorizar la revision humana donde el idioma no coincide con el declarado en el perfil.
- Kioscos y dispositivos de borde sin conectividad: al no requerir GPU ni acceso a red, puede desplegarse en terminales de atencion, vehiculos o dispositivos industriales que deben operar en local.
- Preprocesado para subtitulado y traduccion automatica: determinar el idioma de origen antes de lanzar un sistema de subtitulado evita configurar manualmente el idioma y evita errores de transliteracion en idiomas con alfabetos distintos.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles proceden de la propia model card y fueron generados por el autor. No se trata de un protocolo de benchmark estandar ni de resultados de terceros.

Precision en el conjunto de prueba FLEURS (12 grabaciones por idioma, 15 idiomas, 180 grabaciones en total):

| Prueba | Resultado |
|---|---|
| Eleccion entre los 15 idiomas | 175 de 180 correctas |
| Ruso frente a cualquier otro idioma | 24 de 24 correctas |
| Ruso frente a bielorruso | 20 de 24 correctas |
| Coincidencia int8 frente a fp32 | mismas respuestas |
| Precision con los primeros 10 s frente al audio completo | misma precision |
| Diferencia maxima de log-probabilidades frente al pipeline SpeechBrain en PyTorch | 1,5e-5 |
| Diferencia maxima de log-probabilidades frente a ONNX fp32 con la reescritura de MatMul | 8,7e-5 |

El autor senala que el kirguis no forma parte de los 107 idiomas de VoxLingua107, por lo que queda excluido de la comparativa.

Latencia medida con ONNX Runtime 1.28, 4 hilos, sin abrir la sesion, sobre 10 s de audio:

| Dispositivo | ABI | Tiempo |
|---|---|---|
| Xiaomi MI 6 (Snapdragon 835) | arm64-v8a | 0,72 s |
| Huawei MGA-LX3 | arm64-v8a | 0,85 s |
| Xiaomi MI 5 (Snapdragon 820) | arm64-v8a | 2,0 s |
| Samsung SM-T800 (Exynos 5420) | armeabi-v7a | 2,3 s |
| Doogee X5pro (MT6735) | armeabi-v7a | 4,2 s |
| Escritorio x86-64, 2 hilos | | 0,15 s |

Como referencia, con convoluciones int8 en lugar de MatMul los mismos telefonos tardaban 3,6 / 4,4 / 6,8 / 15,1 / 38,3 s (2 hilos). No se publican datos de throughput agregado ni de consumo energetico. No hay resultados de MMLU, HumanEval ni GSM8K porque el modelo no es generativo.

## Requisitos de hardware

- VRAM: no aplica. El modelo esta disenado para inferencia en CPU y no requiere GPU.
- Huella en disco: 26.602.386 bytes para los pesos int8, mas el fichero de etiquetas `lid-labels.txt` (107 lineas) y el script de exportacion.
- Memoria en ejecucion: no disponible de forma explicita; dado el tamano del fichero y la ausencia de estado de decodificacion, la huella es reducida y compatible con moviles de gama media y baja.
- GPU recomendadas: no aplica. No se documenta ejecucion en CUDA, ROCm ni Metal.
- GPU de consumo: no aplica; el objetivo es CPU.
- CPU probadas: Snapdragon 835, Snapdragon 820, Exynos 5420, MT6735 (todas ARM, Android) y x86-64 de escritorio con 2 hilos.
- Opciones de despliegue: ONNX Runtime 1.28 o superior con enlaces para Java, C y Python; el modelo se distribuye como un unico grafo ONNX de opset 17. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos de texto.
- Latencia: entre 0,15 s (x86-64, 2 hilos) y 4,2 s (MT6735, armeabi-v7a) para 10 s de audio con 4 hilos.
- Throughput: no publicado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krut42/voice-lid-ecapa-voxlingua107 (int8 ONNX) | ECAPA-TDNN con preprocesado embebido | 107 | audio 16 kHz mono, minimo 1 s | apache-2.0 | Hugging Face, fichero unico ONNX |
| speechbrain/lang-id-voxlingua107-ecapa (modelo base) | ECAPA-TDNN | 107 | audio 16 kHz mono, requiere pipeline de caracteristicas de SpeechBrain | apache-2.0 | Hugging Face, pesos PyTorch/SpeechBrain |
| Alternativas de identificacion de idioma hablado (por ejemplo, sistemas basados en MMS o en Whisper encoder) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa y cuantitativa solo es posible frente al modelo base, ya que ambas variantes comparten pesos y espacio de etiquetas. La diferencia medible aportada por la conversion es el formato de despliegue y el coste de inferencia en ARM, no la precision: el autor reporta identidad de respuestas entre int8 y fp32 en su conjunto de prueba. Para otras alternativas del mismo nicho no se dispone de datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Espacio de clases cerrado de 107 idiomas: cualquier idioma fuera de ese conjunto se asignara forzosamente a una de las 107 clases, sin opcion de "desconocido". El autor confirma que el kirguis no esta incluido.
- Confusion documentada entre ruso y bielorruso: 4 errores de 24 en esa direccion. En aplicaciones donde esta distincion sea critica conviene aplicar umbrales sobre el margen entre las dos clases mas probables.
- Evaluacion limitada a 15 idiomas y 12 grabaciones por idioma (180 en total), procedentes de FLEURS. No hay datos publicados sobre ruido de fondo, musica, audio telefonicamente comprimido, solapamiento de hablantes ni cambios de idioma dentro de una misma grabacion.
- Requisitos de entrada estrictos: 16 kHz mono, float32 en [-1, 1]. Un remuestreo o una conversion a float incorrectos degradaran la precision sin producir ningun error visible.
- Duracion minima de 1 s de audio; el autor no documenta el comportamiento con entradas mas cortas.
- Riesgo de alucinacion en el sentido clasificatorio: el modelo siempre devuelve una distribucion log-softmax, incluso ante silencio o ruido, y no incorpora ninguna senal de rechazo. La probabilidad mas alta no equivale a una deteccion fiable.
- Licencia: los pesos son apache-2.0, pero los datos de entrenamiento VoxLingua107 estan bajo CC BY 4.0, lo que exige atribucion. La aplicacion que lo utilice debe conservar la atribucion a SpeechBrain y a los autores del corpus.
- Artefacto de la comunidad: el repositorio registra 0 descargas y 0 likes y no hay indicios de mantenimiento, versionado ni soporte por parte del autor. La reproducibilidad depende de `export_lid.py` y de la revision concreta del modelo base indicada en la ficha.
- Los metadatos de Hugging Face marcan los idiomas como "no disponibles", aunque la model card documenta 107 clases. Conviene no fiarse de ese campo para decidir el uso.
- No es un sistema ASR: no transcribe, no traduce, no diariza y no identifica hablantes. Usarlo para esos fines daria resultados incorrectos.
- La identidad int8/fp32 se verifico sobre el conjunto de prueba del autor; no hay garantia de que se mantenga en todos los dominios acusticos.
- Despliegue limitado a ONNX Runtime: no existen conversiones publicadas a otros runtimes ni versiones para GPU en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krut42/voice-lid-ecapa-voxlingua107
- Modelo base: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
- Paper de SpeechBrain (arXiv:2106.04624): https://arxiv.org/abs/2106.04624
- Dataset VoxLingua107: https://huggingface.co/datasets/TalTechNLP/VoxLingua107
- Referencia del corpus: Valk, J. y Alumae, T., "VoxLingua107: a Dataset for Spoken Language Recognition", Proc. IEEE SLT Workshop, 2021
- Script de exportacion incluido en el repositorio: `export_lid.py`
- Etiquetas de salida incluidas en el repositorio: `lid-labels.txt` (107 idiomas en orden alfabetico)
