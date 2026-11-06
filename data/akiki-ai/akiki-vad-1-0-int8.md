# Akiki-AI/akiki-vad-1.0-int8

## Resumen

Akiki VAD 1.0 INT8 es la variante en precision nativa INT8 del detector de actividad de voz Akiki VAD 1.0, desarrollado por Akiki-AI. El modelo resuelve un problema muy concreto y acotado: clasificar tramas de audio de 16 ms como voz o silencio en flujos de streaming, con un coste computacional extremadamente bajo. Su relevancia actual radica en que procesa una trama de 16 ms en 8,90 microsegundos a traves de la API publica de Python, lo que lo situa en el terreno de los VAD ligeros capaces de correr en CPU sin acelerador dedicado.

A diferencia de los modelos de lenguaje, aqui no hay transformer ni atencion: la arquitectura combina un frontend de analisis espectral RealFFT con ventana Hann periodica, convoluciones y capas recurrentes GRU, con solo 190.849 parametros totales. Esa magnitud explica tanto el tamano del repositorio (200.292 bytes para los pesos) como la latencia, y lo hace apto para despliegues embebidos y pipelines de audio en tiempo real.

Esta version INT8 cuantiza las proyecciones de convolucion y GRU, manteniendo en FP32 el frontend RealFFT, los sesgos, la cabeza de salida, las no linealidades y el estado recurrente. Segun la model card, las 2.016.170 probabilidades nativas de 16 ms evaluadas sobre 30 grabaciones de TEN y 48 de VoxConverse son identicas bit a bit respecto a la release FP32 anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend RealFFT (FP32) + convoluciones y GRU con proyecciones INT8 |
| Parametros totales | 190.849 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesamiento por tramas de 16 ms con estado recurrente) |
| Tipos de cuantizacion | INT8 dinamico en proyecciones; FP32 en frontend, sesgos, cabeza de salida y estado recurrente |
| Idiomas soportados | No disponible (deteccion de voz independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (200.292 bytes) + config.json (1.034 bytes) |

## Arquitectura y entrenamiento

El modelo es un detector de actividad de voz por tramas, no un modelo generativo. El pipeline parte de audio mono float32 a 16 kHz, aplica una ventana Hann periodica y calcula la magnitud del espectro mediante RealFFT en FP32, que se mantiene sin cambios en todas las precisiones. Sobre esa representacion actuan capas convolucionales y recurrentes GRU, cuyas proyecciones son las unicas que se ejecutan en INT8; el resto de componentes numericos permanece en FP32. El estado recurrente permite procesar el flujo de audio de forma incremental, trama a trama, sin necesidad de ventanas de contexto largas.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste fino. Si se indica que esta variante se genero a partir del mismo checkpoint seleccionado (seed-1730) que el modelo base Akiki-AI/akiki-vad-1.0, y que la conversion no implico reentrenamiento, recalibracion ni cambios en el FFT: solo se preservan coeficientes, escalas, sesgos FP32 y valores de la cabeza de salida. La validacion de la conversion reporta que las 2.016.170 probabilidades nativas de 16 ms evaluadas son identicas bit a bit a la release FP32 previa.

## Capacidades

- Deteccion de actividad de voz (VAD) por tramas de 16 ms sobre audio mono float32 a 16 kHz.
- Procesamiento en streaming con estado recurrente, buffering y marcas de tiempo gestionados por la API.
- Clasificacion de audio (pipeline `audio-classification` en Hugging Face).
- Inferencia en CPU sin runtime de PyTorch ni ONNX, mediante el motor Rust incluido en el paquete `akiki`.
- Seleccion de precision en tiempo de ejecucion (`model_precision="int8"`, `fft_precision="fp32"`).
- Carga directa de safetensors mediante el motor Rust (`akiki_vad_engine::Weights::load`) o a traves de la ABI de C.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio generativo ni capacidades multilingues en el sentido de los LLM.

## Casos de uso

- **Deteccion de voz en asistentes de voz en tiempo real**: el modelo clasifica tramas de 16 ms con una latencia de 8,90 microsegundos por llamada a `VAD.push()`, lo que permite activar la captura solo cuando hay habla y reducir el consumo del resto del pipeline.
- **Segmentacion de reuniones y transcripcion**: con marcas de tiempo y buffering integrados, se puede usar como etapa previa a un sistema ASR para recortar silencios en grabaciones de VoxConverse o reuniones corporativas, reduciendo el audio enviado al modelo de transcripcion.
- **Telefonia y VoIP**: al procesar audio a 16 kHz en CPU con un solo hilo, encaja en pasarelas SIP o servidores de conferencia que necesitan suprimir tramas de silencio antes de la codificacion.
- **Sistemas embebidos y edge computing**: con 190.849 parametros y 200 KB de pesos, el modelo cabe en dispositivos con recursos limitados y no requiere GPU ni acelerador neuronal.
- **Filtrado previo en pipelines de datos de audio**: para curar corpus de entrenamiento o evaluacion, se puede ejecutar sobre grandes volumenes de grabaciones en CPU y descartar segmentos sin voz antes de anotarlos.
- **Deteccion de turnos en dialogos**: el estado recurrente y las marcas de tiempo permiten identificar intervalos de habla en conversaciones multi-turno, util para diarizacion ligera o para medir tiempos de respuesta en agentes telefonicos.
- **Despliegue en produccion con Rust o C**: la carga directa de safetensors desde el motor Rust o la ABI de C permite integrar el VAD en servicios nativos sin dependencias de Python.

## Benchmarks y rendimiento

La model card reporta evaluacion sobre TEN (30 grabaciones) y VoxConverse (48 grabaciones) con el protocolo de referencia de 32 ms:

| Benchmark | Precision | AP | F1 a 0,5 | Precision con recall >= 95% |
|---|---|---:|---:|---:|
| TEN | FP32 | 98,0187% | 92,6053% | 90,6487% |
| TEN | INT8 | 98,0423% | 92,5947% | 90,4541% |
| VoxConverse | FP32 | 99,3045% | 94,9869% | 96,1582% |
| VoxConverse | INT8 | 99,3106% | 95,0557% | 96,2425% |

Latencia medida con `akiki` 0.0.5 en un AMD Ryzen 9 9900X con un nucleo fijado, tres procesos nuevos por caso, 2.000 llamadas de calentamiento y 7.500 cronometradas:

| Ruta de inferencia | Latencia por trama de 16 ms |
|---|---:|
| API publica Python `VAD.push()` | 8,90 microsegundos |
| Llamada nativa con punteros preparados | 3,78 microsegundos |

La model card advierte de que la comparativa historica con ONNX Runtime, PyTorch eager, Candle, tract, Burn Flex, RTen, TEN-VAD y Silero v5 corresponde al modelo Akiki 0.2.0, anterior a la migracion a RealFFT, y no mide la version 1.0.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para CPU y no requiere GPU.
- GPU recomendadas: ninguna; el motor Rust esta especializado en kernels de CPU.
- GPU de consumo: no aplica.
- Memoria: los pesos ocupan 200.292 bytes y la configuracion 1.034 bytes, por lo que el modelo cabe en cualquier dispositivo con unos pocos cientos de kilobytes disponibles.
- Despliegue: paquete `akiki` (`pip install akiki`), motor Rust `akiki_vad_engine`, ABI de C, o carga directa de `model.safetensors` y `config.json`.
- Requisito de entrada: audio mono float32 finito a 16 kHz.
- Latencia: 8,90 microsegundos por trama de 16 ms via API Python y 3,78 microsegundos en llamada nativa, medidos en un Ryzen 9 9900X con un nucleo fijado.
- Nota: la carga directa de safetensors enteros requiere una build del motor con el loader `akiki_rowwise` v1; las wheels antiguas pueden seleccionar esta precision desde los pesos FP32 incluidos usando la API Python.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / trama | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Akiki VAD 1.0 INT8 | 190.849 | 16 ms por trama, estado recurrente | Apache 2.0 | safetensors | Motor Rust propio, latencia de 8,90 us via Python |
| Akiki VAD 1.0 FP32 | 190.849 | 16 ms por trama, estado recurrente | Apache 2.0 | no disponible en esta informacion | Misma evaluacion, ligeramente distinta en TEN y VoxConverse |
| TEN-VAD | no disponible | no disponible | no disponible | no disponible | Usado como referencia en la comparativa historica de la model card (version Akiki 0.2.0) |
| Silero v5 | no disponible | no disponible | no disponible | no disponible | Usado como referencia en la comparativa historica de la model card (version Akiki 0.2.0) |

Los datos de parametros, contexto y licencia de TEN-VAD y Silero v5 no aparecen en la informacion proporcionada; no se dispone de una comparativa directa con la version 1.0 de Akiki.

## Limitaciones y advertencias

- El modelo solo detecta actividad de voz; no transcribe, no identifica hablantes y no genera texto.
- Requiere audio mono float32 finito a 16 kHz; otras frecuencias de muestreo o formatos no estan soportados segun la model card.
- La evaluacion se limita a TEN (30 grabaciones) y VoxConverse (48 grabaciones); no se reportan resultados en otros dominios, idiomas o condiciones acusticas adversas.
- No se detalla la composicion del dataset de entrenamiento, por lo que no se puede evaluar el sesgo hacia idiomas, acentos, edades o tipos de microfono concretos.
- La cuantizacion INT8 se aplica solo a proyecciones de convolucion y GRU; el resto del pipeline permanece en FP32, de modo que el ahorro de memoria es limitado en terminos absolutos.
- La carga directa de safetensors enteros exige una build del motor con el loader `akiki_rowwise` v1; las wheels mas antiguas no lo soportan.
- La comparativa de motores publicada corresponde a la version 0.2.0 del modelo y no debe interpretarse como medicion de la version 1.0.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de evaluacion (TEN, VoxConverse) si se reproducen sus resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akiki-AI/akiki-vad-1.0-int8
- Modelo base: https://huggingface.co/Akiki-AI/akiki-vad-1.0
- Esquema del formato: FORMAT.md (referenciado en el repositorio)
- Datos de benchmark: assets/benchmark-data.json (referenciado en el repositorio)
- Validacion de conversion: format-conversion-validation.json (referenciado en el repositorio)
- Paquete Python: `pip install akiki`
