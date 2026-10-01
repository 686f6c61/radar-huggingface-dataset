# loom-ai-org/citrinet-1024-loom

## Resumen

Citrinet-1024 (en) es un modelo de reconocimiento automático del habla (ASR) en inglés exportado por loom-ai-org al formato GGUF propio de loom.cpp. No es un modelo entrenado desde cero: se trata de una reempaquetado del checkpoint `nvidia/stt_en_citrinet_1024_gamma_0_25` de NVIDIA NeMo, con los pesos sin modificar, dentro de un único archivo GGUF autocontenido que incluye las topologías de grafo, el tokenizador y el script de ejecución del modelo.

La arquitectura subyacente es Citrinet, una red convolucional 1D de la familia Jasper/QuartzNet con bloques de squeeze-and-excitation y entrenamiento con pérdida CTC. Con 141.378.159 parámetros (~141 M) y un tamaño de repositorio de 0,6 GB, es un modelo compacto orientado a transcripción de audio mono a 16 kHz, no autoregresivo y de decodificación greedy.

Su relevancia práctica es doble: por un lado, ofrece una vía de ejecución de un modelo ASR de NVIDIA NeMo dentro del ecosistema loom.cpp/loom-py, sin depender de NeMo ni de PyTorch en tiempo de inferencia; por otro, al ser un modelo convolucional de 141 M de parámetros, es candidato a despliegue en CPU y en GPU de gama baja. Conviene señalar que el repositorio no registra descargas ni interacciones y que es un export reciente, sin comunidad ni garantías de mantenimiento documentadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional 1D (familia Citrinet, derivada de Jasper/QuartzNet), con pérdida CTC; no es un transformer |
| Parametros totales | 141.378.159 (~141 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de los LLM: es un modelo ASR no autoregresivo que consume la señal de audio de entrada; no se documenta una ventana de contexto en la información disponible |
| Tipos de cuantizacion | no disponible; el repositorio contiene un único GGUF con los pesos sin modificar (tamaño coherente con fp32: ~141 M × 4 bytes ≈ 565 MB) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (archivo único `citrinet-1024.gguf`, formato autocontenido de loom.cpp) |
| Modelo base | nvidia/stt_en_citrinet_1024_gamma_0_25 |
| Libreria de ejecucion | loom-py-rt (runtime de loom-py) |
| Entrada de audio | lista de floats mono a 16 kHz |
| Decodificacion | CTC greedy; el modelo no emite tokens de timestamp, por lo que `segments` es un único tramo que cubre el clip completo y `timestamped` es `False` |
| Tarea (pipeline) | automatic-speech-recognition |
| Tamano del repositorio | 0,6 GB (1 archivo) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo exportado es Citrinet-1024, una arquitectura convolucional 1D de NVIDIA NeMo que parte del diseño de Jasper y QuartzNet e incorpora bloques de squeeze-and-excitation y tokenización por subpalabras, con entrenamiento mediante CTC (Connectionist Temporal Classification). Al ser CTC, la decodificación es no autoregresiva y de tipo greedy, lo que elimina el bucle de generación token a token típico de los modelos encoder-decoder. El sufijo `1024` del nombre hace referencia al número de canales de la configuración, y `gamma_0_25` al factor de escalado asociado a esa variante concreta de la configuración de NeMo.

No se dispone, en la información proporcionada, de datos sobre el número de tokens de audio empleados en el entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste adicionales más allá del entrenamiento CTC supervisado del checkpoint original. Tampoco se documentan innovaciones de inferencia añadidas por el export (por ejemplo, decodificación especulativa o atención lineal), ya que la model card insiste en que los pesos son los mismos del modelo base y que el cambio es exclusivamente de empaquetado.

La aportación técnica del repositorio es el contenedor: un único GGUF autocontenido que lleva embebidos los grafos del modelo, el tokenizador (si procede) y un script controlador (*driver*) generado con loom-exporter. Ese driver define los argumentos aceptados por el modelo y es la autoridad sobre su comportamiento; `model.driver_source` permite inspeccionarlo desde loom-py.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio mono a 16 kHz en formato de lista de floats.
- Decodificación CTC greedy no autoregresiva, adecuada para procesamiento por lotes de alto volumen.
- API de alto nivel por tarea en loom-py: `model.speech2text.infer(audio, timestamps=True)`, con ventanado, muestreo y ensamblado ya aplicados.
- Acceso de bajo nivel mediante `model.infer(...)`, que pasa los argumentos directamente al driver embebido en el GGUF.
- No soporta *tool calling* ni *function calling*: es un modelo ASR puro, sin interfaz de herramientas.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No genera timestamps por token: `segments` devuelve un único intervalo que cubre todo el clip y `result.timestamped` es `False`; el propio autor advierte de que no debe interpretarse un inicio/fin como una frontera decidida por el modelo.
- Multilingüismo: no. Solo inglés; la API no acepta el argumento `language=`, y si se pasa, emite un aviso y lo ignora.
- No dispone de modo *thinking*, visión, audio de salida, matemáticas ni generación de código: fuera del alcance de un modelo CTC de ASR.
- No se documenta en la información disponible si la salida incluye puntuación o mayúsculas, ni si aplica normalización de texto.

## Casos de uso

- Transcripción por lotes de archivado en inglés: digitalización de grabaciones históricas o corporativas procesando ficheros completos con la API `speech2text`, aprovechando que el modelo ocupa menos de 1 GB y puede ejecutarse en CPU sin GPU dedicada.
- Analítica de contact center: transcripción masiva de llamadas en inglés para extraer términos frecuentes, motivos de contacto y métricas de calidad; el modo CTC y la decodificación greedy permiten alto paralelismo sin el coste de un decodificador autoregresivo.
- Búsqueda por palabra clave sobre audio: generación de transcripciones indexables para localizar menciones concretas en grandes volúmenes de grabaciones, asumiendo que no hay timestamps fiables a nivel de palabra y que la localización temporal será aproximada.
- Pseudo-etiquetado de datasets de audio: uso del modelo para preanotar corpus en inglés que después se revisan o se emplean en el entrenamiento de modelos propios, dado que la licencia CC-BY-4.0 permite uso comercial con atribución.
- Aplicaciones de accesibilidad ligeras: subtitulado de contenido en inglés en entornos con recursos limitados (portátiles, mini-PC, dispositivos edge) donde desplegar un modelo transformer grande no es viable.
- Preprocesado en pipelines de datos de voz: conversión de audio a texto como paso previo a tareas de clasificación, resumen o análisis posteriores en sistemas en inglés.
- Transcripción en herramientas internas de desarrollo: integración vía `loom-py-rt` en scripts de Python para convertir notas de voz o reuniones en inglés a texto dentro de flujos automatizados.
- Validación comparativa de ASR: uso como referencia ligera frente a modelos más grandes en pruebas de precisión/coste en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del export no incluye tasas de error (WER/CER) ni comparaciones con otros sistemas, y los resultados de búsqueda web devueltos no guardan relación con este modelo (corresponden a la herramienta de grabación de pantalla Loom y a una marca de ropa homónima), por lo que no aportan datos de evaluación. Cualquier cifra de WER debería tomarse de la model card del modelo base `nvidia/stt_en_citrinet_1024_gamma_0_25`, que no forma parte de la información proporcionada.

## Requisitos de hardware

- Peso en disco del modelo: 0,6 GB (un único GGUF con los pesos sin modificar, coherente con fp32).
- VRAM estimada para inferencia: por debajo de 1 GB para los pesos; en la práctica, entre 1 y 2 GB contando el runtime y los búferes de audio, aunque no se documenta una cifra oficial.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU con más de 1-2 GB de memoria libre es suficiente (por ejemplo GTX 1050/1650, RTX 3050, RTX 4090, A100, H100); usar una GPU grande no aporta ventaja por tamaño, solo por paralelismo de lotes.
- Cabe en GPU de consumo: sí, con margen amplio; también es viable en CPU y potencialmente en dispositivos con recursos muy limitados, dado el tamaño de 141 M de parámetros.
- Opciones de despliegue documentadas: `loom-py` (`pip install -U "loom-py-rt[hub]"`) sobre el motor `loom.cpp`. El GGUF es específico de loom.cpp (incluye grafos y driver embebidos), por lo que no debe asumirse compatibilidad con llama.cpp, Ollama, vLLM o TGI; no hay soporte documentado de estos runtimes en la información disponible.
- Latencia y throughput: no disponibles. No se publican medidas de RTF (factor de tiempo real) ni de rendimiento por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| loom-ai-org/citrinet-1024-loom | 141.378.159 | CNN 1D + CTC (Citrinet) | en | cc-by-4.0 | GGUF (loom.cpp) | no disponible |
| nvidia/stt_en_citrinet_1024_gamma_0_25 | mismos pesos (no confirmado en la informacion disponible) | CNN 1D + CTC (Citrinet) | en | cc-by-4.0 (heredada) | NeMo / .nemo | no disponible |
| Otras variantes Citrinet de NeMo (citrinet-256, citrinet-512) | no disponible | CNN 1D + CTC (Citrinet) | en | no disponible | NeMo | no disponible |
| Alternativas de otra familia (Whisper, wav2vec 2.0, Conformer-CTC) | no disponible | transformer encoder-decoder / encoder CTC | multilingue o en, segun variante | no disponible | safetensors, GGUF, otros | no disponible |

La comparación cuantitativa no puede completarse con la información suministrada: solo se conoce el recuento de parámetros y la licencia de este export. La diferencia funcional relevante frente a un modelo encoder-decoder tipo Whisper es que aquí no existe decodificador autoregresivo ni marcas de tiempo, lo que simplifica el despliegue pero limita las tareas que puede cubrir.

## Limitaciones y advertencias

- Modelo monolingüe: solo inglés. La API ignora explícitamente el argumento `language=`, por lo que no puede redirigirse a otros idiomas.
- Ausencia de timestamps: `result.timestamped` es `False` y `segments` devuelve un único tramo que cubre todo el clip. No debe interpretarse ningún inicio/fin como una frontera detectada por el modelo; para subtitulado con marcas temporales hará falta otro componente.
- Riesgo de error de transcripción: como todo sistema ASR, puede producir sustituciones, omisiones e inserciones, especialmente con audio ruidoso, acentos no representados en el entrenamiento, solapamiento de hablantes o dominio muy alejado del corpus original. No hay cifras de WER publicadas en esta ficha para acotar el riesgo.
- Sesgos: no se documenta ningún análisis de sesgo por acento, género, edad, origen o tipo de habla. Al ser un modelo entrenado mayoritariamente sobre corpus en inglés, es esperable un peor comportamiento fuera de las variedades mejor representadas, pero no hay datos que lo cuantifiquen.
- Sin información sobre el dataset de entrenamiento: no se puede evaluar la composición del corpus, la presencia de datos con derechos, ni el tratamiento de datos personales.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución. La licencia se hereda del modelo base de NVIDIA y el export la mantiene; conviene revisar también las condiciones del modelo original antes de un despliegue en producción.
- Dependencia de un runtime específico: el GGUF está pensado para loom.cpp y lleva embebidos grafos y un script controlador. Esto reduce la portabilidad frente a formatos estándar y ata el mantenimiento del despliegue al proyecto loom.
- Madurez y soporte: el repositorio tiene 0 descargas y 0 likes, fue creado y actualizado el 2026-10-01, y no se documentan versiones cuantizadas ni planes de mantenimiento. No es un artefacto con validación comunitaria.
- Formato de entrada estricto: audio mono a 16 kHz en lista de floats; cualquier otro formato requiere conversión previa.
- Sin garantías de calidad en producción: al no haber benchmarks publicados en la información disponible, cualquier uso real debería ir precedido de una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/citrinet-1024-loom
- Modelo base: https://huggingface.co/nvidia/stt_en_citrinet_1024_gamma_0_25
- Motor de inferencia loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Cliente y API loom-py: https://github.com/loom-ai-org/loom-py
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Paquete en PyPI: `loom-py-rt` (instalación mediante `pip install -U "loom-py-rt[hub]"`)
- Archivo de pesos: `citrinet-1024.gguf` dentro del repositorio de HuggingFace

Nota: los resultados de la búsqueda web realizada no contienen enlaces relevantes para este modelo; devuelven páginas de la herramienta de grabación de pantalla Loom y de una marca de ropa homónima, sin relación con loom-ai-org, loom.cpp ni con el modelo Citrinet.
