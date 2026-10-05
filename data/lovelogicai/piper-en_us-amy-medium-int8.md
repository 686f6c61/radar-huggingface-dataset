# LoveLogicAI/piper-en_US-amy-medium-int8

# Piper en_US-amy-medium int8 (LoveLogicAI)

## Resumen

`LoveLogicAI/piper-en_US-amy-medium-int8` es una version cuantizada de forma experimental de la voz `en_US-amy-medium` del catalogo `rhasspy/piper-voices`. Se trata de un modelo de sintesis de voz (TTS) neuronal, no de un modelo de lenguaje: convierte texto en audio en ingles estadounidense con una unica hablante (Amy) y una calidad de tipo "medium" dentro de la escala de Piper. El autor aplico cuantizacion dinamica de pesos a int8 (QInt8) mediante `onnxruntime.quantization.quantize_dynamic`, reduciendo el fichero ONNX de 63,2 MB a 18,7 MB.

El problema que aborda es el del despliegue de TTS en entornos con almacenamiento y ancho de banda muy limitados (dispositivos embebidos, instalaciones offline). La relevancia de esta ficha es, en realidad, fundamentalmente metodologica: la model card publica un resultado negativo medido. Sobre un contenedor con 8 vCPU sin instrucciones VNNI, la version int8 resulto **mas lenta** que la version fp32 original (RTF de 2,98 frente a 0,79), por lo que el propio autor desaconseja su uso en ese tipo de hardware.

El repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-10-04, por lo que no existe validacion por parte de la comunidad. La licencia declarada es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS end-to-end (posterior encoder, normalizing flows, duration predictor y decoder tipo HiFi-GAN), exportada a ONNX |
| Parametros totales | No disponible (estimacion de 15-16 millones a partir del peso fp32 de 63,2 MB, calculo propio no verificado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo TTS; Piper procesa la frase de entrada completa con limites configurables de longitud de fonemas, no documentados aqui) |
| Tipos de cuantizacion | int8 dinamico de pesos (QInt8) via `onnxruntime.quantization.quantize_dynamic`; el modelo original upstream esta en fp32 |
| Idiomas soportados | Ingles estadounidense (en_US), hablante unica (Amy) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (int8 dinamico) + fichero de configuracion `.onnx.json`; el original upstream en ONNX fp32 |

## Arquitectura y entrenamiento

El modelo es una voz Piper, es decir, un sintetizador VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) en el que un posterior encoder, un bloque de normalizing flows y un decoder generativo del estilo HiFi-GAN sustituyen al pipeline clasico de acoustic model mas vocoder. A esto se anade un duration predictor entrenado con monotonic alignment search, lo que permite inferencia en un solo paso de red sin necesidad de attention autorregresiva. El nivel de calidad "medium" corresponde a una configuracion compacta de la familia Piper, adecuada para ejecucion en CPU.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o pasos, ni sobre el uso de tecnicas de alineacion por preferencias (RLHF/DPO), que en TTS no son habituales. La unica transformacion documentada es la cuantizacion dinamica de pesos a int8 aplicada por LoveLogicAI sobre el modelo ya entrenado de `rhasspy/piper-voices`; no hubo reentrenamiento ni fine-tuning. La innovacion tecnica relevante de esta ficha es negativa: se demuestra que en grafos convolutionales densos como el de VITS, el coste de desquantizacion de la cuantizacion dinamica puede superar el ahorro de computo cuando el host carece de extensiones VNNI/AVX512-VNNI, degradando el RTF de 0,79 a 2,50-2,98.

## Capacidades

- Sintesis de voz a partir de texto (TTS) en ingles estadounidense, voz femenina unica (Amy), calidad "medium".
- Salida de audio OGG/WAV gestionada por la libreria Piper (el modelo solo produce la representacion de audio).
- Ejecucion 100 % local y offline, sin llamadas a servicios externos: no requiere red ni API keys.
- Inferencia en CPU mediante onnxruntime, con el modelo de 18,7 MB que cabe en almacenamiento embebido.
- Carga directa con `piper-tts >= 1.3` mediante `PiperVoice.load("en_US-amy-medium-int8.onnx")`, usando el `.onnx.json` incluido en el repositorio.
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio de entrada (ASR), thinking mode ni capacidades multimodales: es exclusivamente un sintetizador de voz.
- No hay soporte multilingue: unicamente el locale en_US.

## Casos de uso

- **TTS embebido en dispositivos con almacenamiento minimo**: con 18,7 MB de pesos, el modelo es candidato para firmware de routers, Raspberry Pi con tarjeta de poca capacidad o dispositivos IoT que necesiten locucion local. Debe verificarse antes el rendimiento en la CPU concreta, ya que en hosts sin VNNI el int8 es mas lento que el fp32.
- **Asistentes de voz autoalojados**: integrable en Home Assistant, Rhasspy o el protocolo Wyoming para respuestas habladas de un asistente domestico sin enviar texto a la nube, lo que preserva la privacidad de las transcripciones.
- **Avisos y locuciones pregrabadas en kioscos o terminales**: generacion por lotes de mensajes cortos en ingles estadounidense (avisos de mostrador, instrucciones de uso, mensajes de error) que se cachean como ficheros de audio y no requieren inferencia en tiempo real.
- **Lectura por voz de contenido en pantalla**: uso como apoyo de accesibilidad para leer notificaciones, correos o articulos en ingles con una voz natural, siempre que la latencia no sea critica.
- **Generacion de datos sinteticos para ASR**: creacion de corpus de audio etiquetado con una hablante estadounidense consistente para aumentar datasets de entrenamiento de reconocimiento de voz, aprovechando que el modelo es determinista en la pronunciacion.
- **Investigacion sobre cuantizacion de modelos ONNX**: el repositorio incluye scripts de benchmark y sirve como caso de estudio reproducible para medir la relacion entre cuantizacion dinamica int8 y rendimiento real en funcion del soporte VNNI del procesador.
- **Pruebas de regresion de pipelines TTS**: validar que una version de `piper-tts` o de onnxruntime produce la misma salida que la version de referencia en un flujo CI, usando el modelo como artefacto de prueba de bajo peso.
- **Prototipado rapido de interfaces conversacionales**: dado su tamano reducido, permite iterar sobre el diseno de UX de voz en local antes de invertir en una voz de mayor calidad o en infraestructura GPU.

## Benchmarks y rendimiento

Unicos datos publicados en la model card, medidos el 2026-10-04 en un contenedor con 8 vCPU sin VNNI, sobre 3 frases que generan 10,8 s de audio:

| Configuracion | RTF (menor es mejor) |
|---|---|
| fp32, por defecto | 0,79 |
| fp32, `intra_op=8` | 0,86 |
| int8, por defecto | 2,98 |
| int8, `intra_op=8` | 2,50 |
| int8, `intra_op=2` | 2,57 |

Conclusion registrada por el autor: la version int8 es mas lenta que fp32 en ese hardware y no debe adoptarse sin volver a medir en equipos con soporte VNNI. No se han publicado resultados de benchmarks de calidad de audio (MOS, MCD, WER de sintesis) en la informacion disponible.

## Requisitos de hardware

- **Peso del modelo**: 18,7 MB en int8; 63,2 MB en fp32. El repositorio ocupa 0,0 GB segun HuggingFace.
- **CPU**: es el modo de ejecucion previsto. Se midio en un cgroup de 8 vCPU sin VNNI con RTF de 2,50-2,98 en int8, lo que equivale a unos 27 s de computo para 10,8 s de audio (por debajo de tiempo real). En la misma maquina, fp32 alcanza RTF 0,79, es decir, unas 1,27 veces mas rapido que el tiempo real.
- **Aceleracion recomendada**: CPU con AVX-512 VNNI (Intel Ice Lake o posterior) o AMD Zen 4/5, donde cabria esperar una mejora del int8 no cuantificada en la informacion disponible. No hay datos.
- **GPU**: el modelo cabe holgadamente en cualquier GPU de consumo; la VRAM necesaria no esta documentada, pero el peso de 18,7 MB mas los buffers de activacion dejan la huella muy por debajo de 1 GB. Ejecutable con los execution providers CUDA o TensorRT de onnxruntime, sin benchmarks publicados.
- **GPU recomendadas**: no disponibles (no se han publicado mediciones especificas).
- **Opciones de despliegue**: `piper-tts >= 1.3` (Python), onnxruntime con los execution providers CPU/CUDA/TensorRT, binario C++ de Piper, add-on de Piper para Home Assistant y el protocolo Wyoming.
- **Latencia y throughput**: derivados del RTF medido: con fp32, aproximadamente 8,5 s de computo por 10,8 s de audio; con int8, entre 27,0 y 32,2 s segun la configuracion de `intra_op`. El throughput en lote no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LoveLogicAI/piper-en_US-amy-medium-int8` (este) | Estimado 15-16 M | ONNX int8 dinamico | RTF 2,50-2,98 (fp32 en el mismo host: 0,79) | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| `rhasspy/piper-voices` en_US-amy-medium (original) | Estimado 15-16 M | ONNX fp32, 63,2 MB | RTF 0,79 (0,86 con `intra_op=8`) en el mismo host | No disponible en la informacion proporcionada | HuggingFace |
| Otras voces Piper de calidad "medium" (por ejemplo en_US-lessac-medium) | No disponible | ONNX fp32 | No disponible | No disponible | HuggingFace `rhasspy/piper-voices` |
| Sintetizadores neuronales de mayor tamano (XTTS, Kokoro y similares) | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre alternativas comparables; los unicos resultados obtenidos corresponden a contenidos sin relacion (foros de servidores de Minecraft). No se dispone, por tanto, de comparativas de calidad de audio frente a otras voces.

## Limitaciones y advertencias

- **Rendimiento degradado en CPU sin VNNI**: el propio autor marca el modelo como experimental y advierte explicitamente de que no debe usarse en hosts sin VNNI o AVX512-VNNI; en su benchmark fue entre 3 y 3,8 veces mas lento que fp32.
- **Resultado no extrapolable**: no se ha vuelto a medir en hardware con soporte VNNI, por lo que se desconoce si la cuantizacion aporta alguna ventaja en algun escenario real.
- **Sin validacion de la comunidad**: 0 descargas y 0 likes; no hay evidencia externa de que el proceso de cuantizacion no haya degradado la calidad del audio.
- **Riesgo de artefactos de sintesis**: no se han publicado metricas objetivas ni subjetivas de calidad (MOS, MCD), de modo que no puede descartarse perdida de naturalidad, ruido o errores de prosodia introducidos por la cuantizacion.
- **Errores de pronunciacion**: como todo TTS, puede pronunciar de forma incorrecta nombres propios, siglas, numeros o terminos tecnicos; no se documenta normalizacion de texto especifica.
- **Cobertura linguistica muy limitada**: solo ingles estadounidense y una unica hablante femenina; no soporta cambio de voz, emociones ni otros acentos.
- **Sin control de estilo**: no admite instrucciones de tono, velocidad o emocion mas alla de los parametros de sintesis de Piper.
- **Licencia**: Apache-2.0 declarada por el autor de la cuantizacion. Conviene verificar la licencia de la voz original en `rhasspy/piper-voices`, ya que el modelo aqui publicado es una obra derivada y este repositorio no documenta la cadena de licencias del modelo base.
- **Uso en produccion**: desaconsejado en su estado actual por la combinacion de rendimiento peor que fp32, falta de benchmarks de calidad y ausencia de adopcion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LoveLogicAI/piper-en_US-amy-medium-int8
- Modelo original upstream (voces Piper): https://huggingface.co/rhasspy/piper-voices
- Scripts de benchmark citados por el autor: https://huggingface.co/datasets/LoveLogicAI/freestream
- Repositorio de la libreria Piper: https://github.com/rhasspy/piper (referenciado en la model card como origen de la voz; no confirmado por la busqueda web)
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo, papers, blogs, repositorios ni demos adicionales.
