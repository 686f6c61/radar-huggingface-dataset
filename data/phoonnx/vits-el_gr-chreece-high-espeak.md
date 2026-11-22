# Phoonnx/vits-el_gr-chreece-high-espeak

## Resumen

Phoonnx/vits-el_gr-chreece-high-espeak es una voz de sintesis de voz (text-to-speech) en griego moderno, empaquetada en formato ONNX para su uso con la libreria phoonnx. Se trata de una conversion del modelo original Chreece/el_GR-chreece-high, entrenado por el autor Chreece, que emplea la arquitectura VITS en su variante Piper. La conversion la ha realizado TigreGotico Lda y mantiene los pesos sin modificar, unicamente adaptando el grafo a ONNX para su despliegue en inferencia.

El modelo resuelve el problema de disponer de una voz TTS ligera y ejecutable en CPU para griego (codigo `el`), con una tasa de muestreo de 22050 Hz y un unico hablante. Es relevante porque las opciones de TTS de calidad para griego en el ecosistema open source son escasas, y esta variante ofrece un artefacto ONNX de 114,2 MB con un factor de tiempo real (RTF) medido de 0,227, lo que permite sintesis mas rapida que el tiempo real en hardware de consumo.

La ficha tecnica debe interpretarse con cautela: la propia model card reporta que la comprobacion de calidad mediante ASR (nemo-parakeet-tdt-0.6b-v3 int8) sobre tres frases de FLORES-200 devtest arroja un resultado de "fail" con un WER de 0,357, y que la copia int8 no supero la puerta de calidad y por tanto no se distribuye. Es, por tanto, un artefacto experimental mas que una voz lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | fp32 (unico formato distribuido); int8 no incluido por fallo en la puerta de calidad |
| Idiomas soportados | griego (`el`, `el-GR`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) + `config.json` |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 1 |
| Entrada de texto | fonemas espeak-ng, alfabeto IPA |
| Puntuacion soportada | coma, punto, exclamacion, interrogacion, dos puntos, punto y coma (conservada en sintesis con phoonnx 1.96.1a1 o superior) |
| Tamano del grafo | 114,2 MB |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es VITS en su variante Piper, un modelo generativo de sintesis de voz de extremo a extremo que combina un codificador de texto, un predictor de duraciones y un decodificador generativo basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. La entrada de texto se convierte a fonemas mediante espeak-ng (voz `el`) y se representa en alfabeto IPA. La salida es audio mono a 22050 Hz.

Los datos de entrenamiento, segun la model card, consisten en grabaciones del propio autor realizadas con piper-recording-studio y un microfono de portatil, y el modelo se afino (fine-tuning) a partir del checkpoint "lessac" de alta calidad. No se registra el numero de tokens ni la composicion exacta del dataset, ni el checkpoint base concreto mas alla de la mencion a lessac. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo TTS. La innovacion tecnica destacable es la conversion a ONNX para phoonnx, que permite inferencia en CPU con un RTF de 0,227 medido con 4 hilos en un Intel Core i9-11900H.

## Capacidades

- Sintesis de voz a partir de texto en griego moderno, con salida WAV mono a 22050 Hz.
- Fonemizacion mediante espeak-ng (voz `el`), con representacion intermedia en IPA.
- Respeto de la puntuacion de clausula (`, . ! ? : ;`) en la sintesis, siempre que se use phoonnx 1.96.1a1 o superior.
- Voz de un unico hablante, sin control de estilo ni de emocion.
- Ejecucion en CPU sin GPU, gracias al grafo ONNX.
- Integracion via API de Python de phoonnx (`TTSVoice.load` y `synthesize_wav`).
- No soporta tool calling, agentes, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de articulos y boletines en griego: el modelo puede sintetizar parrafos completos respetando la puntuacion de clausula, adecuado para podcasts o resumenes hablados de bajo coste en CPU.
- Accesibilidad para personas con discapacidad visual: integrado en lectores de pantalla o pipelines de conversion de documentos a audio en griego, con latencia inferior al tiempo real (RTF 0,227).
- Preproduccion de audiolibros en griego: como voz de borrador para validar ritmo y pronunciacion antes de contratar una locucion profesional.
- Sistemas de aviso y notificaciones por voz en griego: anuncios de estado, alertas o mensajes de IVR en entornos donde no se dispone de GPU.
- Generacion de material didactico para aprendizaje de griego: sintesis de frases de ejemplo y ejercicios de pronunciacion, con la salvedad de que el WER medido es alto.
- Prototipado de asistentes conversacionales en griego: como componente TTS dentro de un pipeline mayor, siempre que se acepte su caracter experimental.
- Pruebas de integracion de phoonnx en CI: validacion del pipeline de carga de voces ONNX y de sintesis en entornos sin acelerador.

## Benchmarks y rendimiento

La unica evaluacion publicada en la model card es una comprobacion de calidad mediante ASR (nemo-parakeet-tdt-0.6b-v3 int8) sobre 3 frases de FLORES-200 devtest. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado de la puerta de calidad | fail | no distribuido |
| WER (ASR) | 0,357 | 0,357 (referencia) |
| Caracteres por segundo | 17,6 a 19,3 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,94 a 1,00 |
| Tamano del grafo | 114,2 MB | no disponible |
| RSS pico | 303,8 MB | no disponible |
| RTF (mediana de 3, 4 hilos) | 0,227 | no disponible |

Las mediciones se realizaron en un Intel Core i9-11900H a 2,50 GHz. El RTF se define como tiempo de sintesis dividido por la duracion del audio.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU mediante ONNX Runtime.
- Memoria RAM: RSS pico medido de 303,8 MB en fp32, por lo que funciona en equipos con 1 GB de RAM libre.
- GPU recomendadas: no aplica; no se documenta soporte de aceleracion por GPU para esta conversion.
- Cabe en cualquier GPU de consumo, pero no es su modo de despliegue previsto.
- Despliegue: phoonnx (`pip install --pre phoonnx`) con espeak-ng instalado (`apt install espeak-ng`) o el port espyak (`pip install --pre "phoonnx[espeak]"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 0,227 con 4 hilos en un i9-11900H, es decir, aproximadamente 4,4 veces mas rapido que el tiempo real; entre 17,6 y 19,3 caracteres por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-el_gr-chreece-high-espeak | VITS (Piper) | Griego | Fonemas espeak-ng (IPA) | Apache 2.0 | ONNX | Hugging Face, no indexado en phoonnx |
| Chreece/el_GR-chreece-high | VITS (Piper) | Griego | Fonemas espeak-ng | Apache 2.0 | Pesos Piper originales | Hugging Face |
| Otras voces Piper para griego | VITS (Piper) | Griego | Fonemas espeak-ng | Variable | ONNX / Piper | Indice de voces Piper |

No se dispone de datos de benchmarks comparativos con otras voces TTS para griego en la informacion proporcionada. La comparativa se limita a arquitectura, licencia y formato.

## Limitaciones y advertencias

- La puerta de calidad del propio autor reporta "fail" con un WER de 0,357 sobre solo 3 frases, un tamano de muestra demasiado pequeno y un error demasiado alto para considerarla una voz fiable en produccion.
- No se distribuye la version int8 porque no supero la puerta de calidad; solo esta disponible fp32.
- El modelo se entreno con grabaciones del autor usando un microfono de portatil, lo que puede introducir ruido y limitar la naturalidad.
- Voz de un unico hablante, sin control de prosodia, emocion ni estilo.
- Dependencia de espeak-ng: si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No figura en el indice de voces de phoonnx, por lo que hay que cargarla manualmente desde sus ficheros.
- Riesgo de alucinacion acustica: como todo modelo generativo TTS, puede producir artefactos, saltos o pronunciaciones incorrectas, especialmente en palabras fuera del dominio de entrenamiento.
- No se documentan sesgos especificos, pero al entrenarse con la voz de una sola persona reflejara sus caracteristicas acusticas y posibles particularidades dialectales.
- La licencia Apache 2.0 permite uso comercial, pero se exige atribucion a Chreece; la conversion no altera los pesos.
- No apta para aplicaciones criticas (accesibilidad medica, emergencias) sin una evaluacion de calidad propia y un muestreo mayor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-el_gr-chreece-high-espeak
- Modelo base: https://huggingface.co/Chreece/el_GR-chreece-high
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
