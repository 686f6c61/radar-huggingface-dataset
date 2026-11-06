# empero-ai/PiVo-1.4M

## Resumen

PiVo-1.4M es un modelo de sintesis de voz (text-to-speech) en ingles desarrollado por Empero Research (Leon Lehmann) que implementa una pila TTS completa con tan solo 1.401.562 parametros aprendidos, vocoder incluido. El modelo genera audio mono a 16 kHz y esta disenado para ejecutarse integramente en CPU mediante NumPy y ONNX Runtime, sin dependencia de PyTorch, modelos maestros, codificadores de hablante ni conexion de red en tiempo de inferencia.

La arquitectura se compone de un modelo acustico de 584.965 parametros que predice caracteristicas para el vocoder y un vocoder derivado de FARGAN de 816.597 parametros que las convierte en audio. El frontend utiliza el diccionario de pronunciacion CMU y ofrece dos voces sinteticas en ingles, Pi y Vo, generadas a partir de datos de entrenamiento producidos con Qwen3-TTS.

Su relevancia radica en la extrema eficiencia: demuestra que es posible una sintesis inteligible con un presupuesto de parametros inferior a 1,5 millones y ejecucion puramente en CPU, lo que lo hace adecuado para entornos con recursos muy limitados. Es un modelo de investigacion, no un producto de produccion, y el propio autor advierte de una textura metalica o robotica en algunas frases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acustico (encoder de texto con atencion y convolucion dilatada + dos bloques decodificadores causales) y vocoder derivado de FARGAN |
| Parametros totales | 1.401.562 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.000 caracteres y 512 tokens de frontend por entrada; maximo 30 segundos de audio (3.000 frames acusticos) |
| Tipos de cuantizacion | No disponible (el autor indica que no ha probado versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (cuatro grafos de inferencia) y checkpoint PyTorch (`checkpoints/acoustic.pt`) |
| Frecuencia de muestreo | 16 kHz mono, PCM float32 |
| Voces | Pi y Vo (sinteticas) |
| Velocidad | Ajustable de 0,5 a 2,0 |
| Libreria | onnx |

## Arquitectura y entrenamiento

El diseno acustico esta inspirado en Neuroblast de Mariusz Kurman, aunque la implementacion es original. Un encoder de texto de anchura 96 combina atencion y convolucion dilatada, predice una duracion por cada fonema y anade senales de temporizacion que indican al decodificador la posicion dentro de cada fonema. Dos bloques decodificadores causales predicen 18 coeficientes cepstrales, pitch y correlacion de pitch cada 10 ms. El vocoder derivado de FARGAN genera cuatro subframes de 40 muestras por frame. Los discriminadores usados durante el entrenamiento no forman parte del modelo publicado.

Los datos de entrenamiento son completamente sinteticos: las voces Pi y Vo se disenaron con Qwen3-TTS VoiceDesign y se grabaron con Qwen3-TTS Base. Tras el filtrado, el corpus contiene 8.628 enunciados (4.314 guiones leidos por ambas voces), unas 12,29 horas de audio (10,77 horas tras recortar silencios), divididas en 8.362 de entrenamiento, 114 de validacion y 152 de test. Los modelos maestros y sus revisiones exactas se documentan en `evidence/teachers.json` y `evidence/teacher-model-card-provenance.json`. No se menciona uso de RLHF ni DPO.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con dos voces (Pi y Vo).
- Expansion en el frontend de numeros, importes de moneda, ordinales y fechas ISO.
- Consulta de pronunciacion en el diccionario CMU; permite suministrar pronunciaciones en ARPAbet mediante `overrides`.
- Escritura letra a letra de siglas cortas en mayusculas (por ejemplo, "CPU") y lectura como palabra de otras (por ejemplo, "NASA").
- Codificacion completa de la entrada antes de generar audio y emision de audio en frames de 10 ms mediante `iter_audio`, lo que permite iniciar la reproduccion mientras se genera el resto.
- Ejecucion local en CPU con NumPy y ONNX Runtime, sin conexion de red.
- Ajuste de velocidad de habla entre 0,5 y 2,0.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento.

## Casos de uso

- Lectura por voz en aplicaciones de escritorio o terminal: el modelo se ejecuta integramente en CPU con ONNX Runtime, por lo que puede integrarse en herramientas locales sin GPU ni servicios en la nube, usando la API `PiVo` o la CLI.
- Asistentes de accesibilidad sin conectividad: al no requerir red en inferencia, es adecuado para lectores de pantalla o avisos hablados en entornos aislados, con la limitacion de que solo habla ingles.
- Generacion de avisos cortos y frases de sistema: con un maximo de 30 segundos por enunciado y 2.000 caracteres, encaja en mensajes breves como alertas, notificaciones o confirmaciones.
- Prototipado e investigacion en TTS de bajo presupuesto: sirve como linea base reproducible para experimentos de sintesis con menos de 1,5 millones de parametros y para estudiar el equilibrio entre tamano y inteligibilidad.
- Reproduccion de audio en streaming: `iter_audio` entrega frames de 10 ms, lo que permite comenzar la reproduccion antes de completar la sintesis en aplicaciones interactivas.
- Pruebas de integracion en pipelines de CI: el modelo puede empaquetarse en un contenedor (el repositorio companion incluye Dockerfile) para validar flujos de sintesis en pruebas automatizadas sin dependencias pesadas.
- Generacion de datos de audio para pruebas de otros sistemas: util para producir muestras de voz controladas con pronunciacion determinista mediante el diccionario CMU y los overrides.

## Benchmarks y rendimiento

Evaluacion de inteligibilidad sobre 266 enunciados retenidos, transcritos con Whisper small.en:

| Split | Enunciados | Palabras de referencia | Errores de palabra | Tasa de error de palabra |
| --- | ---: | ---: | ---: | ---: |
| Validacion | 114 | 1.738 | 15 | 0,863% |
| Test | 152 | 2.254 | 12 | 0,532% |

El autor advierte de que estas cifras miden inteligibilidad, no naturalidad, y que el texto retenido procede de las mismas fuentes y modelo maestro que el entrenamiento, por lo que no constituyen un benchmark general de ingles. En una comparacion ciega de 20 pares de frases con un unico oyente, el vocoder original y una variante adaptada obtuvieron 6,10 y 6,15 sobre 10 de media, con 18 empates y una victoria cada uno; por ello se mantuvo el vocoder original. Los grafos ONNX coinciden con el modelo PyTorch con diferencias maximas de 1,23e-6 (encoder), 6,68e-6 (decoder), 3,87e-7 (conditioning) y 2,98e-7 (paso del vocoder). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecucion en CPU con ONNX Runtime y NumPy.
- GPU recomendadas: no disponible; no se documenta uso de GPU.
- Cabe en GPU consumer: no disponible; el autor no ha medido rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime con el runtime propio del modelo (`pivo.PiVo`), CLI `inference.py`, servidor HTTP y Dockerfile incluidos en el repositorio companion. No es compatible con `AutoModel` de Transformers ni con la Inference API alojada.
- Latencia y throughput: no disponible; el autor indica que no ha medido velocidad ni memoria en ARM o dispositivos moviles. El modelo emite audio en frames de 10 ms y permite streaming con `iter_audio`.
- Numero de hilos configurable en la inicializacion (`threads=1` en el ejemplo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Idiomas | Licencia | Ejecucion |
| --- | --- | --- | --- | --- | --- |
| PiVo-1.4M | 1.401.562 | 2.000 caracteres / 30 s por enunciado | Ingles | Apache-2.0 | CPU con ONNX Runtime |
| Neuroblast (referencia de diseno) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Qwen3-TTS (modelo maestro usado para generar datos) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas TTS de tamano pequeno | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos publicados de benchmarks comparativos con otros modelos TTS en la informacion proporcionada.

## Limitaciones y advertencias

- Algunas frases suenan metalicas o roboticas, especialmente en sibilantes y pausas.
- La pronunciacion esta limitada al diccionario CMU mas los overrides del usuario; las palabras desconocidas provocan un error en lugar de una estimacion.
- Solo habla ingles y solo dispone de dos voces sinteticas (Pi y Vo).
- Los resultados de escucha proceden de un unico oyente y no constituyen un estudio MOS.
- No se ha medido velocidad ni memoria en ARM o dispositivos moviles, ni se han probado versiones cuantizadas.
- Las metricas de error de palabra no constituyen un benchmark general de ingles, ya que el conjunto retenido comparte fuentes y modelo maestro con el entrenamiento.
- Entradas ambiguas (fechas con barra, fracciones) o caracteres no soportados generan un error explicito.
- Limite de 2.000 caracteres y 512 tokens de frontend por entrada; los textos mas largos deben dividirse en frases o clausulas.
- Es un modelo de investigacion, no un producto de produccion.
- Licencia Apache-2.0: permite uso comercial, pero deben conservarse los avisos de licencia y atribucion correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empero-ai/PiVo-1.4M
- Informe tecnico: [technical_report.pdf](technical_report.pdf) (referenciado en la model card del repositorio)
- Evaluacion: [evaluation.json](evaluation.json) (referenciado en la model card)
- Evidencia de modelos maestros: `evidence/teachers.json` y `evidence/teacher-model-card-provenance.json`
- Muestras de audio: [samples/pi.wav](samples/pi.wav) y [samples/vo.wav](samples/vo.wav)
- Inspiracion arquitectonica (Neuroblast): https://github.com/mkurman/neuroblast-v3
- Contacto del autor: lehmann@empero.org; Empero Research: research@empero.org
