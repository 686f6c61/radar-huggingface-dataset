# Phoonnx/fastpitch-coqui-ljspeech-fastpitch

## Resumen

Fastpitch-coqui-ljspeech-fastpitch es un modelo de sintesis de voz (text-to-speech) empaquetado en formato ONNX y distribuido por el usuario Phoonnx dentro del repositorio `Phoonnx/phoonnx-fastpitch`. Se trata de una extraccion de la carpeta `coqui-ljspeech-fastpitch`, es decir, un modelo Fastpitch entrenado sobre el corpus LJSpeech (ingles, una unica hablante femenina) y originalmente asociado al ecosistema Coqui TTS. El paquete esta pensado para ser consumido por la libreria phoonnx, un runtime de inferencia basado en ONNX.

El modelo resuelve la conversion de texto a mel-espectrograma mediante una arquitectura Fastpitch, un transformer no autorregresivo con predictor de pitch que genera espectrogramas a partir de fonemas. Al estar exportado a ONNX, puede ejecutarse en CPU o GPU sin depender de PyTorch en tiempo de inferencia, lo que facilita su integracion en aplicaciones ligeras.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de empaquetado (0,2 GB, sin descargas ni likes en el momento de la consulta) mas que de un modelo nuevo. Su interes radica en que permite reutilizar una voz inglesa de LJSpeech dentro de pipelines phoonnx sin reentrenar, siempre que se respete la licencia de origen, que el autor declara como `other` sin especificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fastpitch (transformer no autorregresivo con predictor de pitch), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles (corpus LJSpeech); no se documenta soporte multilingue |
| Licencia | other (sin especificar en la model card) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Fastpitch es una arquitectura de sintesis de voz no autorregresiva derivada de FastSpeech 2. Un encoder transformer procesa la secuencia de fonemas, un predictor de duracion estima la longitud de cada fonema y un predictor de pitch (F0) condiciona la generacion del mel-espectrograma. La salida es un mel-espectrograma que requiere un vocoder externo (por ejemplo, HiFi-GAN) para producir la forma de onda final. El modelo aqui distribuido se exporta a ONNX para su ejecucion con phoonnx.

Los datos de entrenamiento corresponden al corpus LJSpeech: aproximadamente 24 horas de audio en ingles de una unica hablante femenina, con transcripciones alineadas. No se dispone de informacion sobre el numero exacto de pasos de entrenamiento, la composicion del dataset mas alla de LJSpeech, ni sobre el uso de tecnicas de ajuste fino adicionales (RLHF, DPO u otras), ya que la model card no aporta esos detalles. Tampoco se documenta ninguna innovacion tecnica especifica de esta exportacion mas alla del propio empaquetado ONNX.

## Capacidades

- Sintesis de voz en ingles a partir de texto: genera mel-espectrogramas condicionados por fonemas, duracion y pitch.
- Control de prosodia mediante el predictor de pitch integrado en la arquitectura Fastpitch.
- Inferencia no autorregresiva, lo que permite generacion en paralelo y baja latencia frente a modelos autoregresivos como Tacotron 2.
- Ejecucion mediante runtime ONNX a traves de la libreria phoonnx, sin requerir PyTorch en produccion.
- Integracion con el identificador de voz `coqui/en-ljspeech-fast_pitch` dentro de phoonnx.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Generacion de locuciones para audiolibros y contenido editorial: el modelo produce voz inglesa femenina consistente a partir de texto plano, adecuada para narrar articulos o capitulos con prosodia controlada por el predictor de pitch.
- Prototipado rapido de asistentes de voz: al ejecutarse en ONNX mediante phoonnx, puede embeberse en servicios ligeros para validar flujos de conversion texto a voz antes de invertir en modelos de mayor calidad.
- Sistemas de lectura de notificaciones o accesibilidad: la baja latencia de la inferencia no autorregresiva permite sintetizar frases cortas en tiempo casi real para lectores de pantalla o avisos.
- Pruebas de regresion en pipelines TTS: sirve como referencia estable de una voz LJSpeech conocida para comparar cambios en vocoders, normalizacion de texto o preprocesado fonetico.
- Generacion de datasets sinteticos de audio en ingles: util para aumentar corpus de entrenamiento de modelos de reconocimiento de voz cuando se necesita una voz femenina controlada.
- Demos y entornos con recursos limitados: el tamano del repositorio (0,2 GB) y el formato ONNX permiten desplegarlo en contenedores pequenos o en CPU sin GPU dedicada, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (0,2 GB) se trata de un modelo pequeno que probablemente cabe en menos de 1 GB de memoria, pero no se documenta.
- GPU recomendadas: no disponible; al ser ONNX puede ejecutarse en CPU y en GPU consumer, pero no se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano reducido, aunque no hay confirmacion en la documentacion.
- Opciones de despliegue: runtime phoonnx sobre ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastpitch-coqui-ljspeech-fastpitch | Fastpitch + ONNX | no disponible | texto (fonemas) | other | Hugging Face, via phoonnx |
| Coqui TTS FastPitch LJSpeech (original) | Fastpitch (PyTorch) | no disponible | texto (fonemas) | MPL-2.0 en el proyecto Coqui (segun repositorio original) | Coqui TTS / GitHub |
| Tacotron 2 LJSpeech | Seq2seq autorregresivo + attention | no disponible | texto (caracteres) | varía segun implementacion | NVIDIA/tacotron2 y forks |
| VITS LJSpeech | VAE + normalizing flows + GAN | no disponible | texto (fonemas) | varía segun implementacion | Coqui TTS, repos comunitarios |

La comparativa se limita a caracteristicas generales porque no hay datos de benchmarks ni de parametros publicados para este artefacto. Frente a Tacotron 2, Fastpitch es no autorregresivo y por tanto mas rapido en inferencia; frente a VITS, Fastpitch requiere un vocoder separado, mientras que VITS genera la forma de onda de extremo a extremo.

## Limitaciones y advertencias

- Licencia ambigua: la model card declara `license: other` sin especificar terminos, lo que impide determinar si el uso comercial esta permitido. Es imprescindible contactar con el autor o consultar la licencia del repositorio de origen antes de usarlo en produccion.
- Idioma unico: entrenado exclusivamente con LJSpeech (ingles); no se garantiza calidad en otros idiomas ni con acentos distintos al de la hablante original.
- Una sola voz: el corpus LJSpeech contiene una unica hablante femenina, por lo que no hay variedad de timbres ni control de identidad vocal.
- Dependencia de vocoder externo: el modelo genera mel-espectrogramas, no audio; la calidad final depende del vocoder elegido y de su correcta integracion en phoonnx.
- Sin datos de rendimiento: no hay benchmarks, metricas MOS ni evaluaciones objetivas publicadas para esta exportacion concreta.
- Riesgo de artefactos en prosodia: como en todo modelo Fastpitch entrenado con un corpus limitado, pueden aparecer errores de duracion o entonacion en frases largas o con puntuacion atipica.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas de integracion esten documentados por la comunidad.
- Sin garantias de mantenimiento: el artefacto se creo y actualizo en la misma fecha (14 de noviembre de 2026) y no se documenta soporte posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/fastpitch-coqui-ljspeech-fastpitch
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-fastpitch
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Proyecto Coqui TTS (origen de la arquitectura y del modelo base): https://github.com/coqui-ai/TTS
- Paper de FastPitch: https://arxiv.org/abs/2006.06873
- Paper de FastSpeech 2 (base arquitectonica): https://arxiv.org/abs/2006.04558
- Corpus LJSpeech: https://keithito.com/LJ-Speech-Dataset/
