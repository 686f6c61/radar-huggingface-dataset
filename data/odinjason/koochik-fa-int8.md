# odinjason/koochik-fa-int8

## Resumen

koochik-fa-int8 es una copia cuantizada a int8 del modelo de reconocimiento automático del habla (ASR) Shenava Koochik v1.0, desarrollado originalmente por Reza2kn para la transcripción de persa (farsi) con sherpa-onnx. El modelo base es una red NeMo FastConformer con cabecera CTC, empaquetada en formato ONNX para su uso con el runtime sherpa-onnx. Esta variante concreta, publicada por el usuario odinjason, aplica únicamente una cuantización dinámica de los pesos MatMul a int8 mediante `quantize_dynamic` de onnxruntime, sin reentrenamiento ni modificación de los tokens.

La relevancia de esta ficha es acotada y práctica: no se trata de un modelo nuevo ni de una mejora algorítmica, sino de una redistribución optimizada en tamaño (de aproximadamente 459 MB a aproximadamente 174 MB) pensada para reducir el peso de descarga y los requisitos de memoria en aplicaciones de escritorio o móviles. El autor indica que se creó para la aplicación Zolfstream, que descarga el paquete solo bajo demanda del usuario.

No se dispone de información sobre el número de parámetros, la longitud de contexto de audio ni los datos de entrenamiento del modelo original en la información proporcionada; los datos de arquitectura se limitan a lo declarado en la model card (NeMo FastConformer CTC) y a las etiquetas del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo FastConformer CTC (reconocimiento de voz) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada) |
| Tipos de cuantización | int8 dinámica sobre pesos MatMul (`QuantType.QInt8`, onnxruntime `quantize_dynamic`) |
| Idiomas soportados | persa (fa) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`) + `tokens.txt` |
| Tamaño del repositorio | 0,2 GB |
| Tamaño del modelo | ~174 MB (frente a ~459 MB del original sin cuantizar) |
| Librería / runtime | sherpa-onnx (>= 1.13.7) |
| Modelo base | Reza2kn/Shenava-Koochik-v1.0-sherpa-onnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer de NVIDIA NeMo con una cabecera CTC para decodificación sin atención autorregresiva. FastConformer es una variante del conformer que reduce la longitud de la secuencia en las capas intermedias mediante submuestreo, lo que disminuye el coste computacional en tareas de audio. La cabecera CTC permite decodificación en una sola pasada, adecuada para inferencia de baja latencia en streaming o por lotes.

Esta variante concreta no introduce ningún cambio en el entrenamiento: el autor declara explícitamente que la única modificación respecto al original es la cuantización dinámica de los pesos MatMul a int8 con onnxruntime, manteniendo `tokens.txt` intacto. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si el modelo original empleó técnicas de aumento de datos o ajuste fino. Tampoco se documenta en la información disponible ningún mecanismo de decodificación especulativa, atención lineal ni innovación técnica adicional más allá del propio empaquetado ONNX para sherpa-onnx.

## Capacidades

- Reconocimiento automático del habla (ASR) en persa (farsi), tanto en registro formal como informal según las pruebas del publicador.
- Decodificación CTC no autorregresiva, lo que permite transcripción en una sola pasada.
- Inferencia mediante sherpa-onnx con la API `OfflineRecognizer.from_nemo_ctc(model="model.onnx", tokens="tokens.txt")`.
- Ejecución offline y local, sin dependencia de servicios en la nube.
- Modelo ligero (~174 MB en int8), apto para despliegue en dispositivos con recursos limitados.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio generativo ni modo thinking; es exclusivamente un modelo ASR.
- Capacidad multilingüe limitada al persa; no se declaran otros idiomas.

## Casos de uso

- Transcripción de audio en persa en aplicaciones de escritorio: el paquete ONNX de ~174 MB puede descargarse bajo demanda e integrarse con sherpa-onnx para transcribir notas de voz o reuniones sin conexión, reduciendo el peso de la distribución frente al modelo original.
- Subtitulado automático de vídeo o pódcast en farsi: la decodificación CTC en una sola pasada permite procesar archivos de audio por lotes con latencia baja y sin necesidad de GPU dedicada.
- Asistentes de voz embebidos: al ser un modelo ligero en int8, puede ejecutarse en dispositivos de gama media o en el propio navegador mediante runtimes ONNX, habilitando dictado por voz en aplicaciones de productividad.
- Archivado y búsqueda de contenido hablado: transcripción de archivos de audio históricos en persa para indexación y búsqueda textual posterior.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenidos en farsi, con despliegue local que evita enviar audio a terceros.
- Investigación en ASR de bajos recursos: punto de partida cuantizado para experimentos de decodificación, comparación de latencia o evaluación de precisión int8 frente a fp32 en persa.
- Aplicaciones móviles con presupuesto de almacenamiento ajustado: la reducción de ~459 MB a ~174 MB facilita incluir el modelo en paquetes de aplicación o descargas opcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica únicamente una prueba cualitativa sobre dos clips cortos en persa (habla informal y formal) comparando la salida con el modelo sin cuantizar: la salida fue casi idéntica, con una letra de diferencia. El propio autor señala explícitamente que esto no constituye un benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (~174 MB en int8) el uso de memoria es bajo, aunque no se documenta una cifra concreta.
- GPU recomendadas: no disponible; el modelo está pensado para sherpa-onnx, que prioriza ejecución en CPU.
- Compatibilidad con GPU de consumo: probable en cualquier GPU con soporte ONNX Runtime, pero no confirmado en la información proporcionada.
- Opciones de despliegue: sherpa-onnx (>= 1.13.7) como runtime principal; el archivo ONNX puede ejecutarse también con onnxruntime directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|
| odinjason/koochik-fa-int8 | NeMo FastConformer CTC (int8) | Persa | ~174 MB | Apache-2.0 | ONNX |
| Reza2kn/Shenava-Koochik-v1.0-sherpa-onnx | NeMo FastConformer CTC (original) | Persa | ~459 MB | Apache-2.0 | ONNX |
| Otros modelos ASR persa en sherpa-onnx | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original del que deriva, ya que en la información proporcionada no se identifican alternativas concretas de ASR en persa con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en persa; no cubre otros idiomas.
- La cuantización int8 puede degradar ligeramente la precisión frente al modelo original; el autor solo aporta una prueba cualitativa sobre dos clips, sin métricas formales (WER/CER).
- No se han publicado evaluaciones sistemáticas de sesgo, robustez ante ruido, acentos o audio de baja calidad.
- Riesgo de alucinación y errores de transcripción inherente a los modelos CTC, especialmente en audio ruidoso o con vocabulario fuera de dominio.
- La licencia Apache-2.0 se hereda del modelo original según lo declarado por el autor de esta copia; conviene verificar la página del modelo base para confirmar los términos y requisitos de atribución antes de un uso comercial.
- El autor declara explícitamente "no warranty"; no hay garantías de soporte ni mantenimiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se documentan requisitos de versión del runtime más allá de sherpa-onnx >= 1.13.7; versiones anteriores pueden no cargar el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/odinjason/koochik-fa-int8
- Modelo base: https://huggingface.co/Reza2kn/Shenava-Koochik-v1.0-sherpa-onnx
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
