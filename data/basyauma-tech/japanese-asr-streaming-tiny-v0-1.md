# basyauma-tech/japanese-asr-streaming-tiny-v0.1

## Resumen

`japanese-asr-streaming-tiny-v0.1` es un modelo de reconocimiento automatico del habla (ASR) en japones publicado por Basyauma Technologies LLC bajo licencia MIT. Se trata de un ajuste fino de un modelo preexistente (no identificado en la informacion disponible) al que se le ha aplicado una conversion para inferencia en streaming y una cuantizacion parcial dinamica de 8 bits, con el objetivo de reducir el coste computacional y permitir ejecucion en dispositivos modestos.

El modelo tiene 27.015.360 parametros totales, de los cuales solo 17.554.240 fueron actualizados durante el ajuste fino: el codificador de audio permanece congelado y solo se entrenaron el decodificador y la capa de conexion durante 100 pasos con un learning rate de 1e-5 y batch size de 1. El autor lo etiqueta explicitamente como `experimental` y como vista previa de investigacion, no como un modelo listo para produccion.

La relevancia de esta ficha es acotada: se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, evaluado unicamente sobre voz sintetica y sin benchmarks publicos independientes. Resulta util como referencia de un pipeline de adaptacion ASR de bajo coste (freeze del encoder, cuantizacion selectiva, conversion a streaming), pero sus cifras de error no deben interpretarse como rendimiento en habla real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `moonshine_streaming` (encoder-decoder para ASR en streaming; detalles internos no disponibles) |
| Parametros totales | 27.015.360 |
| Parametros activos | no aplica (no es MoE) |
| Parametros actualizados en el ajuste | 17.554.240 (encoder congelado) |
| Longitud de contexto | no disponible (ventana de audio procesada en unidades de 80 ms) |
| Tipos de cuantizacion | cuantizacion dinamica de 8 bits por canal en las operaciones de matriz seleccionadas; parte de operaciones y pesos se mantienen en coma flotante |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (mas assets nativos en `native/` para ejecucion secuencial) |
| Entrada de audio | 16 kHz, mono, tramas de 80 ms |
| Intervalo de actualizacion en streaming | 0,16 s |
| Tamano del repo | 0,2 GB |
| Tamano de los assets de streaming | 65.682.001 bytes |

## Arquitectura y entrenamiento

La arquitectura declarada es `moonshine_streaming`, una familia de modelos encoder-decoder disenada para transcripcion incremental, es decir, que emite resultados parciales a medida que llega el audio en lugar de esperar al final del enunciado. El autor no detalla en la model card el numero de capas, dimensiones ocultas ni el mecanismo de atencion, por lo que esos datos figuran como no disponibles. El ajuste fino congela el codificador de audio y actualiza unicamente el decodificador y el modulo de conexion, lo que explica que solo 17,5 M de los 27 M de parametros fueran entrenados.

El entrenamiento se realizo sobre un corpus muy reducido de voz sintetica: 96 frases para entrenamiento y 17 frases disjuntas para evaluacion de desarrollo, con hablantes solapados entre ambos conjuntos. Se aplicaron 100 pasos de optimizacion con learning rate 1e-5, batch size 1 y semilla 20261108. La innovacion tecnica principal no esta en el entrenamiento sino en el empaquetado: cuantizacion dinamica de 8 bits por canal en las multiplicaciones de matriz mas costosas, manteniendo en coma flotante las partes sensibles, y conversion del grafo a un modo de ejecucion secuencial con actualizaciones cada 0,16 s. El autor indica ademas que el sesgo de salida por vocabulario especializado esta desactivado por defecto porque degradaba los resultados parciales.

## Capacidades

- Transcripcion de voz a texto en japones con salida incremental (resultados parciales durante el habla).
- Procesamiento de audio a 16 kHz mono en tramas de 80 ms, adecuado para captura en tiempo real desde microfono.
- Inferencia de bajo consumo: el autor reporta ejecucion completa en un unico smartphone con un maximo de memoria residente de aproximadamente 280 MB.
- Manejo de entradas no vocalizadas: en la evaluacion con 23 negativos sinteticos no se produjo ninguna salida erronea.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio multimodal.
- No se documenta capacidad multilingue: el modelo esta entrenado y etiquetado exclusivamente para japones.
- No se documenta modo de razonamiento explicito (thinking mode) ni decodificacion especulativa.

## Casos de uso

- Subtitulado en directo de contenido en japones: el modelo emite hipotesis parciales cada 0,16 s, lo que permite mostrar texto sobre el video con una latencia de primera salida de aproximadamente 1,2 s medida en el dispositivo de prueba del autor.
- Prototipado de interfaces de voz embebidas: con 27 M de parametros y ~280 MB de memoria residente, cabe en moviles y placas de un solo board, lo que lo hace util para validar flujos de dictado antes de invertir en un modelo mayor.
- Investigacion sobre ASR de bajo coste: sirve como caso de estudio reproducible de ajuste fino con encoder congelado, cuantizacion selectiva y conversion a streaming sobre un corpus sintetico pequeno.
- Transcripcion de notas de voz cortas en japones: el modelo esta pensado para enunciados breves, que es el regimen donde el autor reporto los mejores resultados (15,52 % de CER en la evaluacion de desarrollo).
- Filtrado de actividad vocal en pipelines de captura: la ausencia de falsos positivos en los 23 negativos sinteticos permite usarlo como primera etapa para descartar segmentos sin habla antes de un modelo mayor.
- Docencia y demostraciones de ASR en japones: el tamano reducido del repo (0,2 GB) y la licencia MIT facilitan su uso en entornos academicos y en cuadernos de practicas sin restricciones de redistribucion.
- Evaluacion comparativa de tecnicas de cuantizacion: al mantener parte de los pesos en coma flotante y cuantizar solo ciertas matrices, es un banco de pruebas util para medir el impacto de la cuantizacion dinamica de 8 bits en calidad de transcripcion.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la evaluacion interna del autor, realizada sobre voz sintetica y con conjuntos de entrada distintos por fila, por lo que no son comparables entre si ni constituyen un benchmark publico.

| Evaluacion | Antes del ajuste | Despues del ajuste | Condiciones |
|---|---:|---:|---|
| Generacion por enunciado, 17 frases de desarrollo | 25,97 % CER | 15,52 % CER | Misma ruta de inferencia; 6 mejoras, 10 iguales, 1 empeoramiento |
| Inferencia en streaming, 95 casos de desarrollo adicional | no disponible | 24,69 % CER | Incluye audio procesado de 11 grupos de frases excluyendo las de entrenamiento |
| Negativos sin habla, 23 casos | no disponible | 0 salidas erroneas | Solo negativos sinteticos |

Mediciones en dispositivo movil reportadas por el autor: reconocimiento completo de 6 enunciados sinteticos cortos y 2 negativos, con salida parcial en todos los enunciados, memoria residente maxima de aproximadamente 280 MB y latencia de 1,18 a 1,22 s desde el inicio de la entrada hasta la primera cadena mostrada en pantalla. El autor advierte que no se garantizan tiempos de renderizado, latencia respecto al final de palabra, pico real de memoria ni comportamiento en ejecuciones largas.

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K, Common Voice, JSUT u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 27 M de parametros y cuantizacion parcial de 8 bits, el peso de los assets de streaming es de 65,7 MB, por lo que la huella de pesos es inferior a 100 MB.
- Memoria residente observada: aproximadamente 280 MB maximos en el dispositivo de prueba del autor (smartphone), incluyendo runtime.
- GPU recomendadas: no se especifican. Por tamano, cualquier GPU consumer reciente es sobradamente suficiente; el modelo esta disenado para ejecucion en CPU y en movil.
- Cabe en GPU consumer: si, con margen amplio (RTX 3060, RTX 4060, RTX 4090, entre otras), aunque el caso de uso previsto es CPU y dispositivos embebidos.
- Opciones de despliegue: los assets nativos en `native/` estan pensados para ejecucion secuencial; no se documenta soporte de vLLM, TGI, llama.cpp ni Ollama (son runtimes orientados a LLM y no cubren este formato). No disponible informacion sobre integracion con ONNX Runtime, Core ML o TensorFlow Lite.
- Latencia y throughput: primera salida a 1,18-1,22 s desde el inicio de la entrada en el dispositivo medido; actualizaciones parciales cada 0,16 s. No se reporta throughput en tiempo real (RTF) ni rendimiento en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| `basyauma-tech/japanese-asr-streaming-tiny-v0.1` | 27,0 M | audio en tramas de 80 ms, actualizacion cada 0,16 s | ja | MIT | ASR streaming, cuantizacion 8 bits, experimental |
| `kotoba-tech/kotoba-whisper-v1.0` | no disponible en la informacion proporcionada | no disponible | ja | no disponible | ASR japones basado en Whisper, orientado a transcripcion por lotes |
| Modelos de la organizacion `japanese-asr` en Hugging Face | no disponible | no disponible | ja | no disponible | Coleccion de modelos y datasets para ASR japones |

La comparacion cuantitativa no es posible con los datos disponibles: no se han publicado cifras de CER de los modelos alternativos en la informacion proporcionada, y las del modelo analizado proceden de voz sintetica con hablantes solapados, por lo que no son equiparables a evaluaciones sobre corpus reales como Common Voice o JSUT.

## Limitaciones y advertencias

- Evaluacion exclusivamente sobre voz sintetica: 96 frases de entrenamiento y 17 de desarrollo, con hablantes solapados entre ambos conjuntos. No hay validacion sobre habla real, acentos, ruido ambiental ni dominio abierto.
- Las filas de la tabla de evaluacion usan conjuntos de entrada y rutas de inferencia distintos; el autor advierte explicitamente que no deben interpretarse como una tasa de mejora continua.
- El CER se calcula tras normalizar caracteres y eliminar espacios y puntuacion, y no equipara numerales kanji con numerales arabigos, lo que puede inflar o desinflar la comparacion frente a otras metricas.
- Riesgo documentado de errores en numeros, negaciones y terminologia especializada; tambien de repeticiones y de generar texto no presente en el audio en segmentos cortos o ruidosos.
- El sesgo de vocabulario especializado esta desactivado por defecto porque empeoraba las salidas parciales; no debe reactivarse sin reevaluar.
- Las mediciones de latencia y memoria son de un unico dispositivo y no garantizan pico real de memoria ni comportamiento en sesiones largas.
- Modelo etiquetado como `experimental` y como vista previa de investigacion: no apto para produccion ni para transcripcion de registros criticos sin revision humana.
- Idioma unico (japones); no se documenta soporte de otros idiomas ni code-switching.
- Licencia MIT: permite uso comercial y redistribucion, pero exige conservar el aviso de copyright y la tabla de permisos en `LICENSE`, asi como la informacion de cambios en `NOTICE`.
- Cero descargas y cero likes en el momento de la consulta: no existe evidencia de uso independiente ni de validacion por terceros.
- No se identifica el modelo base sobre el que se aplico el ajuste fino, lo que dificulta auditar la procedencia de los pesos y las obligaciones de licencia heredadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/basyauma-tech/japanese-asr-streaming-tiny-v0.1
- Organizacion `japanese-asr` en Hugging Face: https://huggingface.co/japanese-asr
- Modelo de referencia `kotoba-whisper-v1.0`: https://huggingface.co/kotoba-tech/kotoba-whisper-v1.0
- Tematica `streaming-asr` en GitHub: https://github.com/topics/streaming-asr
