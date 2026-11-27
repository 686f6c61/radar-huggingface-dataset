# ai-sage/GigaEdge-Models

## Resumen

GigaEdge Models es una coleccion de modelos de voz en ruso empaquetados para funcionar completamente en el dispositivo, sin conexion de red, como parte del SDK GigaEdge de Sber (salute-developers). El repositorio agrupa cuatro componentes independientes: deteccion de palabra de activacion (wake word), reconocimiento automatico del habla (ASR), deteccion de fin de enunciado (end-of-utterance) y sintesis de voz (TTS), ademas de los grafos que los orquestan en un asistente de voz offline.

El componente ASR es una version cuantizada a int8 del encoder de GigaAM v4 (modelo e2e RNN-T) exportada a ONNX Runtime, mientras que el resto de piezas son modelos propios del SDK. El repositorio no contiene el modelo de lenguaje del asistente, que se distribuye por separado como GigaEdge LLM. Todo el conjunto esta pensado para entornos con recursos limitados, como telefonos, dispositivos embebidos o equipos sin acceso a Internet.

La relevancia actual radica en que permite construir un asistente de voz completo, en ruso, con licencia MIT y sin dependencia de servicios en la nube, algo poco habitual en el ecosistema open source, donde la mayoria de pipelines de voz de calidad requieren infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-modelo: wake word (TFLite), ASR RNN-T e2e (ONNX), end-of-utterance (ONNX), TTS (ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono) |
| Tipos de cuantizacion | int8 dinamica estandar de ONNX Runtime en el encoder ASR; resto de componentes sin detallar |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT (con componentes de terceros bajo Apache-2.0, CC BY-SA 4.0, BSD-style y CC0 en TTS) |
| Formato de pesos | ONNX Runtime (ASR, EOU, TTS), TensorFlow Lite (wake word), con ficheros `model.weights` y `vocab.txt` |

Desglose por componente:

| Directorio | Version | Funcion | Runtime | Tamano |
|---|---|---|---|---|
| `spotter/` | `spotter.gigaezh.1.0.0` | Wake word: «Гига Ёж», «Гига Ёжик», «Ёж», «Ёжик» | TensorFlow Lite | 11 MB |
| `asr/` | `asr.oss.1.0.0` | Reconocimiento del habla (GigaAM v4 e2e RNN-T, encoder int8) | ONNX Runtime | 249 MB |
| `eou/` | `eou.oss.1.0.0` | Fin de enunciado por audio | ONNX Runtime | 2 MB |
| `tts/` | `tts.oss.1.0.0` | Sintesis de voz (voces femenina `voice_1` y masculina `voice_2`) | ONNX Runtime | 280 MB |
| `offline_assistant/` | `offline_assistant` | Grafo de sesion: activacion, fin de enunciado, reconocimiento y function calling | — | — |
| `core/` | — | Grafo central: wake word, sesiones y salida de voz | — | — |

## Arquitectura y entrenamiento

El repositorio no es un unico modelo sino un conjunto de grafos y pesos que se encadenan. El componente de reconocimiento es GigaAM v4 en su variante e2e RNN-T: el encoder y el bucle de decodificacion greedy se fusionan en un unico grafo `model.onnx`, con los pesos del encoder cuantizados a 8 bits mediante cuantizacion dinamica estandar de ONNX Runtime y el bucle de decodificacion en fp32. El vocabulario se entrega como `vocab.txt`, un token por linea. El resto de piezas (spotter, EOU y TTS) son modelos propios del SDK GigaEdge, sin que la model card detalle su arquitectura interna ni el proceso de entrenamiento.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El TTS incorpora recursos linguisticos de terceros: la primera capa de ruBert-base (Apache-2.0), RUAccent y Silero Stress (MIT), los diccionarios `yo.dict` y `morph.dict` (CC BY-SA 4.0), el CMU Pronouncing Dictionary (BSD-style) y datos de Wikidata (CC0). La frecuencia de muestreo es de 16 kHz mono a la entrada de spotter, ASR y EOU, y de 24 kHz a la salida del TTS.

## Capacidades

- Deteccion de palabra de activacion en dispositivo con cuatro variantes en ruso: «Гига Ёж», «Гига Ёжик», «Ёж», «Ёжик».
- Reconocimiento automatico del habla en ruso mediante RNN-T e2e, con decodificacion greedy integrada en el grafo ONNX.
- Deteccion de fin de enunciado basada unicamente en audio (sin depender de transcripcion), lo que permite segmentar turnos de conversacion.
- Sintesis de voz en ruso con dos voces: femenina (`voice_1`) y masculina (`voice_2`), a 24 kHz.
- Orquestacion de sesion completa en el grafo `offline_assistant`: activacion, fin de enunciado, reconocimiento y function calling.
- Function calling integrado en el grafo de sesion, que delega en el LLM separado GigaEdge LLM.
- Funcionamiento totalmente offline, sin llamadas de red en ningun punto del pipeline.

## Casos de uso

- Asistentes de voz embebidos en dispositivos sin conectividad: el pipeline completo (spotter, ASR, EOU, TTS) cabe en el dispositivo y funciona sin red, adecuado para electrodomesticos, wearables o terminales industriales en entornos aislados.
- Atencion al cliente en kioscos o terminales fisicos: el grafo `offline_assistant` gestiona activacion, segmentacion por fin de enunciado y reconocimiento, y delega la respuesta en GigaEdge LLM, todo local.
- Transcripcion de voz a texto en ruso en aplicaciones de escritorio o moviles: el componente `asr/` (249 MB, ONNX) puede usarse de forma aislada para dictado o subtitulado sin conexion.
- Interfaces de accesibilidad: sintesis de voz con dos voces para lectores de pantalla o respuestas habladas en aplicaciones para personas con discapacidad visual, con latencia local y sin dependencia de servicios externos.
- Automatizacion de tareas por voz en entornos con requisitos de privacidad: al no salir el audio del dispositivo, encaja en sectores regulados (sanidad, banca, administracion) donde no se permite enviar grabaciones a la nube.
- Prototipado rapido de asistentes de voz en ruso: el SDK GigaEdge y los grafos permiten montar un demo funcional descargando los pesos con `huggingface_hub` y ejecutando `example/offline_assistant`, sin entrenar modelos propios.
- Control por voz de aplicaciones de terceros mediante function calling: el grafo de sesion puede mapear intenciones reconocidas a llamadas de funciones expuestas por la aplicacion anfitriona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el conjunto completo suma aproximadamente 542 MB de pesos (11 MB spotter + 249 MB ASR + 2 MB EOU + 280 MB TTS), por lo que cabe holgadamente en memoria de dispositivos moviles y GPUs de gama baja; no se detalla el consumo adicional de activaciones.
- GPU recomendadas: no se especifican; el diseno esta orientado a ejecucion en CPU y aceleradores de dispositivo (TensorFlow Lite para wake word, ONNX Runtime para el resto).
- Compatibilidad con GPU de consumo: si, el tamano total permite ejecucion en cualquier GPU de consumo moderna; no obstante, la model card no documenta aceleracion GPU especifica.
- Opciones de despliegue: TensorFlow Lite (spotter) y ONNX Runtime (ASR, EOU, TTS). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Contexto / audio | Notas |
|---|---|---|---|---|---|---|
| GigaEdge Models | Pipeline de voz offline (wake word + ASR + EOU + TTS) | ru | MIT (con componentes de terceros) | ONNX, TFLite | 16 kHz entrada / 24 kHz salida | Conjunto integrado para asistente en dispositivo |
| GigaAM v4 | ASR RNN-T e2e | ru | MIT | no disponible en esta ficha | no disponible | Modelo base del componente `asr/`; GigaEdge incluye su encoder cuantizado int8 en ONNX |
| Whisper (OpenAI) | ASR transformer | multilingue | MIT | safetensors, GGUF, etc. | ventana de 30 s | Alternativa multilingue, pero no incluye wake word, EOU ni TTS integrados |
| Silero | ASR, TTS y VAD | ru y otros | no disponible en esta ficha | ONNX, etc. | no disponible | Componentes de voz rusos ampliamente usados; GigaEdge reutiliza Silero Stress en TTS |

La comparativa con Whisper y Silero se ofrece como referencia de categoria; los datos de esos modelos no provienen de la informacion proporcionada y deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- El unico idioma soportado es el ruso; no hay capacidades multilingues.
- El repositorio no incluye el modelo de lenguaje: para un asistente completo hay que descargar por separado GigaEdge LLM.
- El ASR es una version cuantizada a int8 del encoder de GigaAM v4; la cuantizacion puede degradar la precision respecto al modelo original en fp32, aunque no se aportan metricas.
- La licencia MIT del conjunto convive con componentes de terceros en TTS bajo Apache-2.0, CC BY-SA 4.0, BSD-style y CC0; el uso comercial debe revisar `tts/model/NOTICE` y los textos completos en `tts/model/licenses/`, en particular las obligaciones de atribucion y compartir igual de CC BY-SA 4.0.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de robustez en la informacion disponible.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- No se detallan requisitos de latencia ni limites de longitud de audio para el reconocimiento; conviene validar el comportamiento en produccion con audio real antes de desplegar.
- El grafo de sesion incluye function calling, lo que implica que las acciones ejecutadas a partir de la voz deben validarse y limitarse en la aplicacion anfitriona para evitar efectos no deseados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ai-sage/GigaEdge-Models
- Modelo base GigaAM v4: https://huggingface.co/ai-sage/GigaAM-v4
- GigaEdge LLM: https://huggingface.co/ai-sage/GigaEdge-LLM
- SDK GigaEdge: https://github.com/salute-developers/giga-edge-sdk
