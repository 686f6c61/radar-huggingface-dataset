# JunXueTech/LaST-Net

## Resumen

LaST-Net es un modelo de deteccion de deepfakes de voz (speech deepfake detection) publicado por Jun Xue (JunXueTech) en HuggingFace. Se trata de un sistema discriminativo, no de un modelo generativo: recibe audio y devuelve una puntuacion (`bonafide_log_score`) que indica si la grabacion corresponde a voz autentica o a voz sintetica generada por sistemas de text-to-speech o de conversion de voz. El modelo se presenta como parte del trabajo "LaST-Net: Length-Aware Layer and Scale-Adaptive Temporal Network for Speech Deepfake Detection", cuyo codigo de entrenamiento e inferencia esta disponible en un repositorio de GitHub independiente.

Tecnicamente, LaST-Net combina un frontend basado en XLS-R 300M (`facebook/wav2vec2-xls-r-300m`) afinado, con un backend propio denominado LaST-Net. El checkpoint publicado (`best.pt`) corresponde a la epoca 52 y fue seleccionado por el menor EER medio de desarrollo evaluado sobre ventanas de 1, 2, 4 y 6 segundos del corpus ASVspoof 2019 LA. El repositorio pesa 3,8 GB e incluye el estado del optimizador y metadatos originales de entrenamiento, ademas de los pesos.

Su relevancia practica esta en el contexto de la deteccion de fraude por voz y la verificacion de autenticidad de audio, donde los sistemas de verificacion de hablante (ASV) son vulnerables a ataques de suplantacion. El modelo declara resultados de EER bajos y consistentes entre duraciones de 1 a 6 segundos, un escenario realista en produccion donde no siempre se dispone de grabaciones largas. La licencia no esta declarada en la informacion disponible, lo que limita su adopcion comercial sin consulta previa al autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para clasificacion de audio: frontend auto-supervisado XLS-R (wav2vec 2.0) afinado + backend "Length-Aware Layer and Scale-Adaptive Temporal Network" (LaST-Net) |
| Parametros totales | no disponible (el frontend XLS-R 300M aporta aproximadamente 300 millones de parametros; el total con el backend no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; la entrada son ventanas de audio de 1 a 6 segundos, mono, a 16 kHz |
| Tipos de cuantizacion | no disponible (no se declaran versiones cuantizadas) |
| Idiomas soportados | no disponible en la ficha del modelo (el frontend XLS-R se preentreno con datos multilingues, pero no se declara el alcance efectivo tras el ajuste fino) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch `best.pt` (requiere ademas el checkpoint original de XLS-R 300M en formato fairseq, `xlsr2_300m.pt`) |
| Libreria / framework | fairseq y PyTorch |
| Modelo base | `facebook/wav2vec2-xls-r-300m` |
| Tarea | deteccion de deepfake de voz (clasificacion binaria bonafide / spoof) |
| Tamano del repositorio | 3,8 GB |
| Checkpoint publicado | epoca 52, seleccionado por el menor EER medio de desarrollo |
| Salida | `bonafide_log_score` (valores mas altos favorecen voz autentica; no son probabilidades calibradas) |
| Fecha de publicacion | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

LaST-Net sigue el esquema dominante en deteccion de deepfake de voz basado en representaciones auto-supervisadas: un extractor de caracteristicas preentrenado sobre audio (en este caso XLS-R 300M, la variante multilingue de wav2vec 2.0) que se afina de extremo a extremo, seguido de un cabezal clasificador especifico de la tarea. El elemento diferencial declarado por los autores es el backend LaST-Net, descrito como una red temporal "consciente de la longitud" y "adaptativa a la escala", es decir, disenada para mantener un rendimiento estable cuando la duracion de la entrada varia entre 1 y 6 segundos. Los detalles concretos del backend (numero de capas, tipo de agregacion temporal, mecanismos de atencion) no estan disponibles en la informacion proporcionada; hay que consultar el repositorio de codigo.

El checkpoint `best.pt` corresponde a la epoca 52 y fue elegido por el menor EER medio de desarrollo promediado sobre ventanas de 1, 2, 4 y 6 segundos en ASVspoof 2019 LA. El archivo incluye el frontend XLS-R afinado, el backend LaST-Net, el estado del optimizador y los metadatos originales de entrenamiento. La carga no es autonoma: el constructor del modelo exige el checkpoint original de XLS-R 300M en formato fairseq (`xlsr2_300m.pt`) antes de superponer los parametros afinados. No se declara en la informacion disponible el volumen de tokens de audio, la composicion exacta del conjunto de entrenamiento, ni si se emplearon tecnicas de aumento de datos, perdidas adversarias o estrategias de calibracion posteriores.

En inferencia, el audio debe ser mono a 16 kHz. El codigo proporcionado evalua entradas de 1 a 6 segundos mediante recorte de prefijo (prefix cropping) y repeticion de grabaciones mas cortas, una decision de diseno orientada a estandarizar la duracion de entrada. La salida es un `bonafide_log_score` sin calibrar: los autores advierten explicitamente de que no debe interpretarse como probabilidad, por lo que el umbral de decision debe fijarse por protocolo.

## Capacidades

- Deteccion de voz sintetica: clasifica audio como voz autentica (bonafide) o falsificada, cubriendo ataques de text-to-speech y de conversion de voz de los corpus evaluados.
- Robustez a duracion variable: el modelo esta disenado y evaluado para entradas de 1, 2, 4 y 6 segundos, con resultados agregados por duracion, lo que permite su uso en escenarios con audio corto.
- Extraccion de representaciones acusticas: el frontend XLS-R 300M proporciona embeddings de audio que pueden reutilizarse para otras tareas de clasificacion si se ajustan de nuevo.
- Puntuacion continua: genera una puntuacion (`bonafide_log_score`) que permite ajustar el umbral segun la relacion entre falsos positivos y falsos negativos requerida por el caso de uso.
- Generalizacion entre corpus: se declaran evaluaciones en ASVspoof 2019 LA, ASVspoof 2021 LA, ASVspoof 2021 DF e In-the-Wild, lo que cubre condiciones de canal, codec y dominio distintos.
- Procesamiento por lotes: al ser un modelo de clasificacion acustica, puede integrarse en pipelines de inferencia por lotes sobre ficheros de audio.
- No es un modelo generativo: no genera texto, no responde a instrucciones, no soporta tool calling, no implementa agentes, no procesa vision y no tiene modo de razonamiento explicito.

## Casos de uso

- Antifraude en atencion telefonica y banca: analizar fragmentos de 1 a 6 segundos de una llamada entrante para detectar voz sintetica antes de autorizar operaciones. La evaluacion especifica en ventanas cortas es lo que hace viable este escenario en tiempo real.
- Verificacion biométrica de locutor (ASV) con defensa anti-spoofing: colocar LaST-Net como etapa previa al verificador de hablante para descartar ataques de suplantacion. La puntuacion continua permite fijar un umbral conservador que minimice la aceptacion de ataques.
- Moderacion de contenido en plataformas de audio: procesar por lotes los audios subidos (podcasts, notas de voz, mensajes) y marcar automaticamente aquellos con alta probabilidad de ser sinteticos, derivandolos a revision humana.
- Forense digital y verificacion periodistica: comprobar la autenticidad de grabaciones filtradas o virales antes de su publicacion, documentando la puntuacion obtenida por el modelo como indicio tecnico complementario a otros analisis.
- Auditoria de corpus de entrenamiento: filtrar conjuntos de datos de voz (por ejemplo, para entrenar TTS o reconocimiento automatico del habla) y retirar muestras sinteticas o no verificadas que degradarian la calidad del conjunto.
- KYC y onboarding remoto: incorporar la deteccion de deepfake vocal en procesos de alta de clientes que incluyan verificacion por voz, como capa adicional frente a ataques de presentacion.
- Monitorizacion de campanas de desinformacion: analizar grandes volumenes de audio en redes sociales para identificar patrones de voz clonada asociados a una misma herramienta de sintesis.
- Evaluacion comparativa de detectores: usar los resultados publicados en 19LA, 21LA, 21DF e In-the-Wild como linea base reproducible para nuevos metodos, siempre que se respete el protocolo de preprocesado del repositorio.

## Benchmarks y rendimiento

Resultados declarados por el autor: EER (%) promediado por duracion sobre entradas de 1 a 6 segundos. No se proporcionan en la informacion disponible los resultados por duracion ni las cifras de modelos comparables.

| Conjunto de evaluacion | EER medio (%) |
|---|---|
| ASVspoof 2019 LA (19LA) | 1,29 |
| ASVspoof 2021 LA (21LA) | 4,98 |
| ASVspoof 2021 DF (21DF) | 3,62 |
| In-the-Wild | 7,58 |

No se han publicado en la informacion disponible resultados de otros benchmarks (precisión, AUC, t-DCF, exactitud balanceada) ni comparaciones numericas con modelos de referencia. Los autores advierten de que los resultados dependen del protocolo de evaluacion y del preprocesado aplicado.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por los autores. Como estimacion orientativa a partir del tamano del frontend (aproximadamente 300 millones de parametros) mas el backend, la inferencia en precision FP32 requiere del orden de 2 a 4 GB de VRAM con lotes pequenos y entradas de hasta 6 segundos; en FP16 el consumo de pesos baja aproximadamente a la mitad. Estas cifras son estimaciones de ingenieria, no datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia ser suficiente para inferencia unitaria. Para procesamiento por lotes a escala se recomiendan GPU tipo A100, H100, L40S o RTX 4090.
- GPU de consumo: si, cabe en GPU de consumo con 8 GB o mas (RTX 3060, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4090). El cuello de botella practico es mas la CPU de preprocesado de audio que la VRAM.
- Almacenamiento: el repositorio ocupa 3,8 GB, a lo que hay que sumar el checkpoint original de XLS-R 300M en formato fairseq, que debe descargarse aparte.
- Opciones de despliegue: el unico camino soportado oficialmente es el script `infer.py` del repositorio de GitHub sobre fairseq y PyTorch. No se declaran integraciones con vLLM, llama.cpp, Ollama, TGI ni TensorRT, que ademas estan orientadas a modelos generativos. No se proporcionan pesos en formato ONNX, GGUF ni TorchScript.
- Latencia y throughput: no disponibles. Dependen del hardware, del tamano de lote y de la duracion de las entradas (1 a 6 segundos).
- Dependencias criticas: fairseq, PyTorch y el checkpoint `xlsr2_300m.pt` en formato fairseq, cuya ausencia impide instanciar el modelo.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones ni resultados de modelos alternativos, por lo que la comparacion numerica no esta disponible. A continuacion se indican las alternativas tipicas de la misma categoria, con los campos que no pueden cumplimentarse marcados como no disponibles.

| Modelo | Enfoque | Parametros | Contexto / entrada | EER publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LaST-Net (JunXueTech) | XLS-R 300M afinado + backend LaST-Net | no disponible (frontend ~300 M) | audio mono 16 kHz, 1-6 s | 1,29 / 4,98 / 3,62 / 7,58 en 19LA / 21LA / 21DF / ITW | no disponible | HuggingFace + GitHub |
| AASIST | red con atencion sobre grafo espectro-temporal | no disponible | audio de corta duracion | no disponible en la informacion proporcionada | no disponible | codigo publico (referencia de la comunidad ASVspoof) |
| RawNet2 | CNN sobre forma de onda cruda con capa sinc | no disponible | audio de corta duracion | no disponible en la informacion proporcionada | no disponible | codigo publico (referencia de la comunidad ASVspoof) |
| Sistemas XLS-R + cabezal clasificador | wav2vec 2.0 / XLS-R afinado | ~300 M solo frontend | audio mono 16 kHz | no disponible en la informacion proporcionada | variable segun implementacion | multiples implementaciones publicas |

Los valores de EER de los modelos alternativos no se han incluido porque no forman parte de la informacion proporcionada; para una comparacion rigurosa hay que consultar los resultados oficiales de las ediciones de ASVspoof y del challenge In-the-Wild.

## Limitaciones y advertencias

- Sesgos conocidos: no declarados en la informacion disponible. Al estar ajustado principalmente sobre corpus de habla inglesa (ASVspoof), es esperable un rendimiento desigual en otros idiomas, acentos y condiciones de grabacion; este extremo no esta cuantificado por el autor.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de error de clasificacion. El modelo puede producir falsos positivos (marcar voz real como sintetica) y falsos negativos (no detectar un deepfake), especialmente ante ataques de sintesis no vistos durante el entrenamiento.
- Puntuaciones no calibradas: el `bonafide_log_score` no es una probabilidad. Cualquier despliegue en produccion debe fijar y validar el umbral sobre un conjunto de validacion propio del dominio de aplicacion.
- Sensibilidad al preprocesado: los resultados publicados dependen del protocolo y del preprocesado. El audio debe ser mono a 16 kHz y las entradas se normalizan mediante recorte de prefijo y repeticion de grabaciones cortas; desviarse de este esquema puede degradar el rendimiento.
- Dependencia de un checkpoint externo: la carga requiere el checkpoint original de XLS-R 300M en formato fairseq. Esto anade un paso de descarga, posibles problemas de versionado y una dependencia de licencia adicional (la del modelo base).
- Restricciones de licencia: la licencia no esta declarada ni para los pesos ni, en la informacion disponible, para el codigo. No debe asumirse uso comercial permitido sin confirmacion explicita del autor.
- Estado de adopcion: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion independiente por parte de la comunidad.
- Mantenimiento tecnico: fairseq esta en modo de mantenimiento reducido, lo que puede complicar la instalacion en entornos modernos y la compatibilidad con versiones recientes de PyTorch.
- Uso responsable: las puntuaciones deben emplearse como evidencia de apoyo, no como prueba concluyente; en contextos con consecuencias legales o economicas se recomienda combinarlas con revision humana y otros analisis forenses.
- Fuente de los datos: la informacion de esta ficha procede de la model card del autor en HuggingFace y del repositorio de codigo enlazado. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JunXueTech/LaST-Net
- Repositorio de codigo (entrenamiento e inferencia): https://github.com/JunXue-tech/LaST-Net
- Checkpoint original de XLS-R 300M en formato fairseq: https://github.com/facebookresearch/fairseq/tree/main/examples/wav2vec/xlsr
- Modelo base del frontend: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Contacto del autor: junxue@whu.edu.cn
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con LaST-Net (corresponden a paginas generales de OpenAI y ChatGPT), por lo que no se incluyen como referencias.
