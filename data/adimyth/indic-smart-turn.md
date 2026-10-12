# adimyth/indic-smart-turn

## Resumen

Indic Smart Turn es un modelo de clasificación de audio disenado especificamente para la deteccion de fin de turno (*end-of-turn*, EOT) en agentes de voz que operan en lenguas indicas. El problema que resuelve es concreto: cuando un usuario hace una pausa al hablar, el agente debe decidir si ha terminado su turno o solo esta respirando. Una decision erronea provoca interrupciones o silencios incomodos. El modelo toma esa decision a partir del propio audio, sin depender de transcripcion, y esta optimizado para ejecutarse en un unico nucleo de CPU.

Lo desarrolla el usuario adimyth y se construye siguiendo la receta de Pipecat Smart Turn v3 (no a partir de sus pesos). El encoder parte de OpenAI Whisper (variantes *base* o *tiny*), se descarta el decoder y se anade la cabeza de *attention pooling* de Smart Turn. Se entrena sobre clips de 8 segundos etiquetados como completos o incompletos: unos 52.000 procedentes de conversaciones telefonicas reales en India, mas los datos propios de Pipecat para mantener el ingles.

Su relevancia actual radica en que cubre lenguas ausentes en Smart Turn v3.2 (tamil, telugu, kannada, malayo, guyaratí, punyabí, odia y asamés) y usa habla real en lugar de TTS sintetico para las lenguas indicas. Se distribuye en formato ONNX y se integra en Pipecat mediante una unica linea de cambio en `LocalSmartTurnAnalyzerV3`. El repositorio ocupa 0,3 GB y la licencia es BSD-2-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder derivado de Whisper (base o tiny) con decoder eliminado y cabeza de attention pooling (receta Pipecat Smart Turn v3) |
| Parametros totales | No disponible (derivado de whisper-base, 74 M, o whisper-tiny, 39 M; no se especifica el recuento final tras recortar el decoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Clips de audio de 8 segundos por inferencia |
| Tipos de cuantizacion | int8 (dinamica, solo pesos, en base; estatica en tiny) y fp32 |
| Idiomas soportados | Ingles, hindi, marati, bengali, tamil, telugu, kannada, malayo, guyaratí, punyabí, odia y asamés |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (cuatro ficheros: base-int8, base-fp32, tiny-int8, tiny-fp32) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de OpenAI Whisper (base o tiny) y descarta por completo el decoder de transcripcion. Sobre el encoder se injerta la cabeza de *attention pooling* definida en la receta Smart Turn v3 de Pipecat. La red resultante procesa clips de audio de 8 segundos y produce una clasificacion binaria: turno completo o incompleto. El modelo final se exporta a ONNX y se ofrece en cuatro variantes que cubren precision int8 y fp32 con encoders base y tiny.

El entrenamiento se realizo sobre aproximadamente 52.000 clips de conversaciones telefonicas reales de dos personas, grabadas por AI4Bharat para IndicVoices, complementadas con los datos de Smart Turn de Pipecat para conservar el rendimiento en ingles. El etiquetado no es manual: procede de un modelo de audio que escucha cada clip, con un modelo de texto como segunda opinion. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion por preferencias. La innovacion principal es el enfoque multilingue unico (un solo fichero para las doce lenguas, sin conmutacion por idioma) combinado con un coste de inferencia apto para CPU.

## Capacidades

- Clasificacion de fin de turno (*end-of-turn detection*) a partir de audio en bruto, sin ASR intermedio.
- Soporte de doce lenguas: ingles, hindi, marati, bengali, tamil, telugu, kannada, malayo, guyaratí, punyabí, odia y asamés, con un unico fichero de pesos.
- Inferencia en tiempo real sobre clips de 8 segundos.
- Ejecucion en un unico nucleo de CPU, con latencias entre 22 y 208 ms segun variante y hardware.
- Integracion directa en Pipecat mediante `LocalSmartTurnAnalyzerV3`.
- Exportacion a ONNX, portable entre x86, Apple Silicon y GPU.
- No soporta tool calling, function calling, agentes multi-paso ni generacion de texto: es exclusivamente un clasificador de audio.

## Casos de uso

- Deteccion de fin de turno en agentes de voz: el modelo decide si el usuario ha terminado de hablar tras cada pausa, evitando interrupciones prematuras o silencios prolongados. Es su proposito principal y el escenario para el que fue entrenado.
- Atencion al cliente telefonica en India: permite desplegar agentes conversacionales en hindi, tamil, telugu, bengali y otras lenguas indicas sin necesidad de un modelo por idioma, cubriendo un unico fichero ONNX de 24 MB en servidores x86.
- Sistemas IVR (respuesta de voz interactiva): la deteccion fiable de fin de turno reduce la latencia percibida y mejora la fluidez de menus y rutas de atencion automatizadas.
- Despliegue en el borde o en dispositivos con recursos limitados: la variante tiny-int8 ocupa 8,8 MB y responde en 83 ms sobre un nucleo de servidor, lo que permite ejecutarla en hardware humilde o dentro del propio cliente de voz.
- Voice agents integrados con Pipecat: al cargarse mediante `LocalSmartTurnAnalyzerV3`, encaja sin reescribir la logica existente del pipeline de voz; basta cambiar una linea.
- Segmentacion de turnos en transcripcion y diarizacion: como etapa previa al ASR, permite cortar el audio en turnos limpios y mejorar la calidad de la transcripcion en conversaciones telefonicas multilingues.
- Asistentes de voz para accesibilidad: al no depender de transcripcion ni de conectividad a un servicio remoto, resulta adecuado para aplicaciones que deben funcionar de forma local y con baja latencia.

## Benchmarks y rendimiento

Los resultados publicados se evaluan sobre una particion de test disjunta por hablante de 20.431 clips, con umbral por defecto 0,5. Ademas de la precision, se reporta ROC-AUC (independiente del umbral). La comparativa se hace contra Smart Turn v3.2 de Pipecat (whisper-tiny en int8 para CPU y fp32 para GPU); no existe una version base de v3.2.

| Metrica / comparativa | Resultado |
|---|---|
| Precision global (base-fp32) | 84-95 % |
| ROC-AUC (base-fp32) | 0,86-0,99 |
| TamilEOT (base-fp32) | 85,9 % (frente a 86,1 % publicado para whisper-base en el paper) |
| base-int8 vs base-fp32 | ROC-AUC dentro de 0,005 en todas las lenguas; precision dentro de 2,6 puntos a umbral 0,5 |
| tiny-int8 vs Smart Turn v3.2 int8 (lenguas indicas) | +3 a +14 puntos de precision |
| tiny-int8 vs Smart Turn v3.2 int8 (ingles) | -1,2 puntos |
| base vs Smart Turn v3.2 (lenguas indicas) | +3 a +14 puntos |
| base vs Smart Turn v3.2 (con encoder mayor) | +5 a +18 puntos |
| tiny-fp32 vs tiny-int8 | +1 a +4 puntos |

Los desgloses por lengua con intervalos bootstrap al 95 % se encuentran en `eval_all_test.md`, `STAGE6_REPORT.md` y `charts.html` del repositorio de GitHub; no se incluyen numericamente en la model card.

## Requisitos de hardware

- Tamano de pesos: 8,8 MB (tiny-int8), 24 MB (base-int8), 32 MB (tiny-fp32) y 81 MB (base-fp32). Todos caben sobradamente en cualquier GPU de consumo y en la mayoria de CPUs modernas.
- CPU: es el entorno objetivo. Latencias medidas en un nucleo de servidor con batch 1 y un solo hilo: 122 ms (base-int8), 190-208 ms (base-fp32), 83 ms (tiny-int8) y 84 ms (tiny-fp32).
- Apple Silicon: fp32 supera a int8. Latencias: 44 ms (base-int8), 37 ms (base-fp32), 34 ms (tiny-int8) y 22 ms (tiny-fp32).
- GPU: el modelo se puede ejecutar en GPU, pero no se aportan cifras de latencia especificas. La model card recomienda fp32 en hosts con GPU y Apple Silicon porque sus resultados no dependen del backend de CPU.
- Recomendacion de fichero: `indic-smart-turn-base-int8.onnx` en servidores x86; `indic-smart-turn-base-fp32.onnx` en Apple Silicon o GPU; `indic-smart-turn-tiny-int8.onnx` en CPUs restringidas.
- Despliegue: ONNX Runtime y Pipecat (`LocalSmartTurnAnalyzerV3`). No se mencionan integraciones con vLLM, TGI, llama.cpp ni Ollama, dado que no es un modelo generativo de texto.
- Rendimiento: no se publican cifras de throughput; solo latencias de una sola inferencia.

## Comparativa con modelos similares

| Modelo | Encoder / tamano | Idiomas indicos | Precision relativa | Licencia | Formato |
|---|---|---|---|---|---|
| Indic Smart Turn (tiny-int8) | whisper-tiny, 8,8 MB | 11 lenguas indicas + ingles | +3 a +14 puntos frente a v3.2 en lenguas indicas; -1,2 en ingles | BSD-2-Clause | ONNX |
| Indic Smart Turn (base-fp32) | whisper-base, 81 MB | 11 lenguas indicas + ingles | 84-95 % de precision; AUC 0,86-0,99 | BSD-2-Clause | ONNX |
| Pipecat Smart Turn v3.2 (int8) | whisper-tiny, ~8,8 MB | Ausentes tamil, telugu, kannada, malayo, guyaratí, punyabí, odia y asames; hindi, marati y bengali entrenados mayoritariamente con TTS | Referencia de comparacion | No disponible en la informacion proporcionada | ONNX |
| Pipecat Smart Turn v3.2 (fp32) | whisper-tiny, fp32 | Idem | Referencia de comparacion | No disponible | ONNX |

No se identifican en la informacion disponible otros modelos comparables de deteccion de fin de turno para lenguas indicas.

## Limitaciones y advertencias

- Es un clasificador binario de audio: no genera texto, no razona y no hace tool calling. Cualquier expectativa de ese tipo es erronea.
- La salida depende de un umbral (por defecto 0,5); modificarlo altera el equilibrio entre interrupciones prematuras y silencios prolongados, y las cifras de precision publicadas solo son validas en ese umbral.
- El etiquetado de los datos de entrenamiento no es humano: procede de un modelo de audio con un modelo de texto como segunda opinion, lo que puede introducir sesgos sistematicos en los casos ambiguos.
- El rendimiento en ingles es ligeramente inferior al de Smart Turn v3.2 en la variante tiny-int8 (-1,2 puntos), aunque la model card no reporta el dato para las variantes base.
- Los dominios cubiertos son conversaciones telefonicas de dos personas en India; el rendimiento en audio de estudio, voz sintetica u otras variedades dialectales no esta documentado.
- No se especifican sesgos demograficos conocidos, ni por acento, genero o edad.
- La licencia BSD-2-Clause permite uso comercial sin restricciones relevantes, pero conviene verificar la licencia del encoder subyacente (OpenAI Whisper) en cada despliegue.
- El modelo se distribuye en cuatro ficheros con compromisos distintos de precision y latencia; elegir el incorrecto para el hardware objetivo puede degradar el rendimiento sin que el usuario lo advierta.
- No se aportan cifras de throughput ni de comportamiento bajo carga concurrente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/adimyth/indic-smart-turn)
- [Repositorio en GitHub](https://github.com/adimyth/indic-smart-turn)
- [Demo interactiva en HuggingFace Spaces](https://huggingface.co/spaces/adimyth/indic-smart-turn-demo)
- [Paper TamilEOT (arXiv:2609.05631)](https://arxiv.org/abs/2609.05631)
- [Receta Pipecat Smart Turn v3](https://github.com/pipecat-ai/smart-turn)
- [Dataset adimyth/indic-smart-turn-data](https://huggingface.co/datasets/adimyth/indic-smart-turn-data)
- [Dataset ai4bharat/IndicVoices](https://huggingface.co/datasets/ai4bharat/IndicVoices)
- [Dataset santhosh-005/tamil-eot](https://huggingface.co/datasets/santhosh-005/tamil-eot)
- [Dataset pipecat-ai/smart-turn-data-v3.2-train](https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train)
- [Video de demostracion pause-test.mp4](https://huggingface.co/adimyth/indic-smart-turn/resolve/main/pause-test.mp4)
