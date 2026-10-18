# Allinsama/soniqo__DeepFilterNet3-ONNX

## Resumen

DeepFilterNet3 ONNX es la exportación verificada a ONNX del checkpoint oficial de DeepFilterNet3 v0.5.6, un modelo de mejora de voz (reducción de ruido y desreverberación) para audio full-band a 48 kHz. Lo publica el usuario Allinsama bajo el identificador `Allinsama/soniqo__DeepFilterNet3-ONNX`; el modelo original es obra de Hendrik Schröter y colaboradores, con doble licencia Apache-2.0 o MIT. El repositorio contiene únicamente el grafo neuronal: no incluye la implementación de STFT, normalización de características, filtrado ni síntesis, por lo que no es un pipeline autónomo sino un componente que debe integrarse en una cadena DSP compatible.

El problema que resuelve es el de la supresión de ruido en tiempo real sobre señal de voz: recibe características espectrales normalizadas y devuelve una máscara ERB de 32 bandas más los coeficientes de un filtro profundo complejo de orden 5 aplicado sobre las primeras 96 bins del espectro. Frente a otras alternativas de denoising neuronal, el interés de esta publicación es que ofrece un artefacto ONNX con contrato de tensores explícito, checksums y una validación de paridad frente a la referencia en PyTorch, lo que facilita el despliegue fuera del ecosistema Python.

La relevancia es, por tanto, de integración más que de investigación: permite ejecutar un modelo de mejora de voz validado mediante ONNX Runtime en CPU, sin dependencia de PyTorch, siempre que se respete estrictamente el contrato DSP documentado (48 kHz, FFT real de 960 puntos, hop de 480 muestras, ventana de Vorbis). El repositorio es de tamaño mínimo (figura como 0.0 GB) y registra 8 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto reciente y con poca validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de mejora de voz DeepFilterNet3 (filtrado profundo complejo + enmascaramiento ERB); topologia interna no detallada en la model card |
| Parametros totales | no disponible (no declarado en la model card ni en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: procesamiento por tramas con eje temporal dinamico `T`; no es un modelo de contexto textual |
| Tipos de cuantizacion | FP32 unicamente (`deepfilter.onnx`); no se documentan variantes FP16 ni INT8 |
| Idiomas soportados | no disponible; la mejora de voz es independiente del idioma y el autor no declara lista de idiomas |
| Licencia | MIT (upstream DeepFilterNet con doble licencia Apache-2.0 o MIT) |
| Formato de pesos | ONNX (`deepfilter.onnx`, FP32, eje de tramas dinamico), binario auxiliar `deepfilter-auxiliary.bin` (float32 little-endian), `config.json` y `export_manifest.json` |
| Frecuencia de muestreo | 48.000 Hz |
| STFT | FFT real de 960 puntos, hop de 480 muestras, ventana de Vorbis, 481 bins |
| Banco ERB | 32 bandas disjuntas, minimo 2 bins FFT por banda |
| Filtro profundo | orden 5, lookahead 2, sobre las primeras 96 bins |
| Normalizacion | `tau=1.0`, alpha redondeado `0.99`; estado de media ERB inicializado linealmente de -60 dB a -90 dB y estado unitario complejo de 0.001 a 0.0001 |
| Libreria declarada | onnxruntime |
| Tamano del repositorio | 0.0 GB (por debajo del umbral de redondeo de HuggingFace) |
| Descargas / likes | 8 / 0 |
| Fecha de publicacion | 2026-10-18 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El artefacto es una exportacion, no un entrenamiento nuevo. La arquitectura subyacente es DeepFilterNet3, un esquema de mejora de voz que combina un enmascaramiento sobre banco de filtros ERB (32 bandas) con un filtrado profundo complejo de orden 5 aplicado en el dominio de la frecuencia sobre las primeras 96 bins del espectro de 481 bins. El grafo ONNX expone exactamente esas dos ramas: dos entradas (`feat_erb` de forma `[1, 1, T, 32]` y `feat_spec` de forma `[1, 2, T, 96]`, con los canales en orden real e imaginario) y dos salidas (`erb_mask` de forma `[1, 1, T, 32]` y `df_coefs` de forma `[1, 5, T, 96, 2]`, con ejes batch, orden de filtro, trama, frecuencia y parte real/imaginaria).

La model card no aporta informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre si se aplicaron etapas de RLHF/DPO (no aplicables en este dominio) o ajuste fino perceptual. Remite al proyecto upstream y a sus articulos para los detalles de arquitectura y entrenamiento. La innovacion tecnica destacable en esta publicacion concreta es la verificacion del export: el script comprueba el grafo con ONNX, compara las salidas de ONNX Runtime en CPU con PyTorch para varias longitudes de trama y registra errores exactos y hashes SHA-256 en `export_manifest.json`.

Un detalle relevante del contrato DSP es que el filtro profundo debe aplicarse desde una copia inmutable del espectro ruidoso antes de la fusion con el espectro enmascarado por ERB, y que la paridad batch/offline exige anadir una cola de analisis de 960 muestras y eliminar el retardo de STFT de 480 muestras tras la sintesis con overlap-add.

## Capacidades

- Mejora de voz full-band a 48 kHz: supresion de ruido estacionario y no estacionario y reduccion de reverberacion sobre voz humana.
- Prediccion de mascara ERB de 32 bandas (`erb_mask`) para el enmascaramiento espectral.
- Prediccion de coeficientes de filtrado profundo complejo de orden 5 (`df_coefs`) sobre 96 bins, lo que permite modelar estructura armonica fina que el enmascaramiento ERB no resuelve.
- Procesamiento por tramas con eje temporal dinamico, apto para flujo continuo (streaming) y para procesamiento offline por lotes.
- Ejecucion sobre ONNX Runtime, incluyendo CPU, sin dependencia de PyTorch en tiempo de inferencia.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales mas alla del audio de entrada: no procesa vision ni texto.
- No dispone de modo "thinking" ni de capacidades de audio generativo (no sintetiza voz, solo estima mascaras y coeficientes de filtrado).

## Casos de uso

- Preprocesado de ASR en atencion al cliente: el modelo limpia la senal de entrada a 48 kHz antes del reconocedor, lo que reduce el WER en grabaciones telefonicas y de VoIP con ruido de fondo. Al trabajar por tramas de 10 ms (hop de 480 muestras), encaja en pipelines de transcripcion en tiempo real.
- Cancelacion de ruido en VoIP y videollamadas: el contrato DSP fija un hop de 480 muestras y un lookahead de 2 tramas, cotas compatibles con comunicacion conversacional; el grafo puede ejecutarse en CPU con ONNX Runtime en el propio dispositivo.
- Limpieza de corpus de voz para entrenamiento: util para depurar datasets de ASR y TTS antes de la transcripcion o del alineamiento forzado, procesando en modo offline (con la cola de analisis de 960 muestras y la compensacion del retardo de STFT que especifica la model card).
- Postproduccion de podcast y locucion: eliminacion de ruido de fondo estacionario (ventilacion, zumbidos, trafico) en grabaciones a 48 kHz, manteniendo la senal en el dominio temporal original tras la sintesis overlap-add.
- Procesamiento en dispositivos embebidos o edge: al ser un grafo ONNX de tipo FP32 y de tamano reducido (el repositorio completo figura por debajo del umbral de 0.1 GB de HuggingFace), es candidato para integracion en ONNX Runtime sobre CPU ARM, siempre que se implemente el contrato DSP en el dispositivo.
- Preprocesado en auriculares y ayudas auditivas: la mejora de voz antes de la etapa de amplificacion o de un codec de baja tasa reduce el esfuerzo de escucha; la latencia algorítmica debe presupuestarse a partir del lookahead de 2 tramas y del retardo de STFT de 480 muestras.
- Analisis forense y de inteligencia sobre grabaciones ruidosas: mejora previa a la transcripcion manual o automatica de audio capturado en condiciones adversas.

## Benchmarks y rendimiento

La model card publica una validacion end-to-end sobre 20 clips de VoiceBank-DEMAND (101,51 segundos en total), comparando la referencia oficial en PyTorch con la integracion `speech-core` usando este grafo ONNX:

| Runtime | PESQ | STOI | SI-SDR |
|---|---:|---:|---:|
| DeepFilterNet v0.5.6 oficial | 2,9585 | 0,96064 | 18,228 dB |
| speech-core con este grafo | 2,9602 | 0,96064 | 18,225 dB |

La model card indica ademas que la salida de `speech-core` coincide con la referencia oficial con un SI-SDR medio de 54,85 dB y un RMSE medio de forma de onda de 0,000140. No se han publicado resultados de benchmarks adicionales (por ejemplo, DNSMOS, WER tras ASR o comparativas con otros modelos de denoising) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no declarada por el autor. Como referencia de orden de magnitud, el repositorio completo figura como 0.0 GB en HuggingFace, lo que situa el grafo FP32 muy por debajo de 1 GB; se trata de una estimacion por tamano de artefacto, no de un dato publicado.
- GPU recomendadas: no disponibles. El unico backend validado explicitamente en la model card es ONNX Runtime en CPU.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del grafo, pero no hay medicion publicada de latencia ni de throughput en RTX 4090, RTX 3090 u otras tarjetas.
- Despliegue: ONNX Runtime (CPU verificado); la model card menciona `speech-core` como integracion de referencia. No se documentan casos con TensorRT, OpenVINO, vLLM, llama.cpp, Ollama ni TGI, y estos dos ultimos no aplican a un modelo de audio.
- Latencia: el contrato DSP fija hop de 480 muestras (10 ms a 48 kHz), lookahead de 2 tramas y un retardo de STFT de 480 muestras que debe eliminarse tras la sintesis; el presupuesto de latencia algorítmica se deriva de esos parametros, pero no se publica una cifra de latencia extremo a extremo.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Muestreo | Formato | Licencia | Datos publicados |
|---|---|---|---|---|---|
| DeepFilterNet3 ONNX (esta ficha) | no disponible | 48 kHz | ONNX FP32 | MIT | PESQ 2,9602 / STOI 0,96064 / SI-SDR 18,225 dB en VoiceBank-DEMAND (20 clips) |
| DeepFilterNet3 v0.5.6 (upstream, PyTorch) | no disponible en la informacion proporcionada | 48 kHz | checkpoint PyTorch | Apache-2.0 o MIT | PESQ 2,9585 / STOI 0,96064 / SI-SDR 18,228 dB en el mismo conjunto |
| DeepFilterNet2 (upstream) | no disponible | 48 kHz | checkpoint PyTorch | Apache-2.0 o MIT | no disponible en la informacion proporcionada |
| RNNoise (referencia clasica de denoising ligero) | no disponible en la informacion proporcionada | 48 kHz | C / modelos propios | BSD-3-Clause (segun proyecto upstream, no verificado aqui) | no disponible en la informacion proporcionada |

La comparacion cuantitativa solo es posible frente al propio upstream, del que este repositorio es una conversion: las metricas son practicamente identicas (diferencias de 0,0017 en PESQ y 0,003 dB en SI-SDR), lo que confirma la fidelidad del export. No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no se establece una comparacion de rendimiento entre familias.

## Limitaciones y advertencias

- No es un pipeline autonomo: solo contiene el grafo neuronal. Requiere una implementacion propia de STFT (960 puntos, hop 480, ventana de Vorbis), normalizacion de caracteristicas, banco ERB de 32 bandas, filtrado profundo de orden 5 y sintesis overlap-add. Sin ese contrato, las salidas no son validas.
- La validacion de paridad solo cubre la integracion DSP probada por el autor; la model card advierte explicitamente que otras implementaciones deben seguir el contrato documentado y no estan verificadas.
- No se declara el numero de parametros, el volumen de datos de entrenamiento ni la composicion del corpus, lo que limita la evaluacion independiente del modelo.
- No se documentan sesgos demograficos ni de idioma. Al ser un modelo de mejora de voz, puede degradar la senal en lenguas o acentos poco representados en el corpus de entrenamiento upstream, pero no hay datos publicados al respecto en esta ficha.
- Riesgo de artefactos de procesado musical ("musical noise") y de sobre-supresion en segmentos de voz muy debil, habitual en modelos de enmascaramiento; no cuantificado en la informacion disponible.
- La metrica publicada se limita a 20 clips (101,51 s) de VoiceBank-DEMAND, un conjunto pequeno y de dominio acotado; no hay evaluacion en otros dominios (musica, ruido impulsivo, reverberacion fuerte).
- Licencia MIT para este repositorio, pero el proyecto upstream es de doble licencia Apache-2.0 o MIT: conviene conservar la atribucion a Hendrik Schröter y colaboradores que exige la model card.
- Adopcion muy baja (8 descargas, 0 likes) y sin validacion de terceros; para produccion conviene verificar el grafo y los checksums de `export_manifest.json` por cuenta propia.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces recuperados corresponden a la pelicula "Weapons" (2025) y son irrelevantes. No se han podido contrastar datos externos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Allinsama/soniqo__DeepFilterNet3-ONNX
- Proyecto upstream DeepFilterNet (version v0.5.6 referenciada en la model card): https://github.com/Rikorose/DeepFilterNet/tree/v0.5.6
- Articulos del proyecto upstream: la model card remite a "the upstream project and papers" sin enlazarlos; no se dispone de URL de paper en la informacion proporcionada.
- Resultados de busqueda web: sin resultados relevantes (los enlaces recuperados tratan sobre la pelicula "Weapons" de 2025 y no guardan relacion con el modelo).
