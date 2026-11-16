# Phoonnx/vits-lv_lv-aivars-espeak

## Resumen

`vits-lv_lv-aivars-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por RaivisDejus como `Piper-lv_LV-Aivars-medium` y reempaquetado por Phoonnx para su libreria ONNX `phoonnx`. El modelo sintetiza voz en letón (`lv-LV`) a partir de texto convertido a fonemas espeak (alfabeto IPA) y se distribuye como un unico artefacto ONNX de aproximadamente 0,1 GB, lo que lo hace apto para inferencia ligera en CPU.

El modelo resuelve el problema de disponer de una voz TTS de calidad media para letón dentro del ecosistema Piper/phoonnx, con una licencia CC0-1.0 que permite uso comercial sin restricciones practicas. Su relevancia actual radica en la integracion con OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, y en la posibilidad de ejecutarse tanto en Python como en navegador a traves de `phoonnx.js`.

No es un modelo de lenguaje generativo ni un sistema multimodal: es exclusivamente un sintetizador de voz de un unico hablante ("Aivars") para un unico idioma. La informacion disponible no incluye datos sobre tamano de parametros, contexto ni benchmarks, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados; no se documentan variantes) |
| Idiomas soportados | leton (`lv`, `lv-LV`) |
| Licencia | CC0-1.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |
| Hablantes | 1 (voz "Aivars") |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de sintesis neuronal end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. El modelo original fue entrenado por RaivisDejus como parte del ecosistema Piper (`Piper-lv_LV-Aivars-medium`), orientado a sintesis de voz de tamano medio y ejecucion eficiente.

La informacion disponible no detalla el numero de horas de audio de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. El front-end de texto no forma parte del modelo: phoonnx delega la normalizacion y la fonemizacion en `scriptconv`, usando `EspeakPhonemizer` (extra `scriptconv[espeak]`) para producir fonemas IPA a partir del texto en letón. El autor advierte que el port `espyak` de espeak-ng puede diferir en algunos fonemas y producir pronunciaciones incorrectas en ciertas palabras, por lo que se recomienda instalar `espeak-ng` nativo.

## Capacidades

- Sintesis de voz (TTS) de un unico hablante en letón a partir de texto.
- Conversion texto-a-fonemas via espeak-ng (IPA) como etapa previa obligatoria.
- Ejecucion en CPU mediante ONNX Runtime a traves de `phoonnx`.
- Integracion con OVOS como plugin de TTS (`ovos-tts-plugin-phoonnx`).
- Ejecucion en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- Generacion de audio WAV mediante la API `synthesize_wav`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es multilingue: solo letón.

## Casos de uso

- Asistentes de voz en letón sobre OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en un asistente domestico o de escritorio sin depender de servicios en la nube.
- Lectura de contenido en aplicaciones letonas: integracion en lectores de noticias o articulos para generar audio bajo demanda, aprovechando el reducido tamano (~0,1 GB) y la inferencia en CPU.
- Accesibilidad para usuarios con discapacidad visual: sintesis de texto de interfaz o documentos en letón dentro de aplicaciones de escritorio o moviles con ONNX Runtime.
- Sistemas de anuncios y avisos automatizados: generacion de mensajes hablados en transporte publico, comercios o industria, donde la licencia CC0-1.0 elimina friccion legal para uso comercial.
- Prototipado rapido de interfaces de voz: al ejecutarse en navegador con `phoonnx.js`, permite demostraciones de TTS en letón sin infraestructura de servidor.
- Generacion de audio para contenido educativo: narracion de materiales didacticos en letón con una voz consistente de un unico hablante.
- Pruebas de pipelines TTS multilingues: uso como componente leton dentro de un sistema que selecciona voces Piper/phoonnx por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de valores de MOS (Mean Opinion Score), latencia, RTF (real-time factor) ni comparaciones objetivas con otros modelos TTS en letón.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de ~0,1 GB, la huella de memoria es muy reducida y cabe en CPU.
- GPU recomendadas: no se documentan; el modelo esta disenado para ejecucion en CPU mediante ONNX Runtime.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del artefacto, aunque no se publican requisitos oficiales.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-lv_lv-aivars-espeak` | VITS | leton (lv-LV) | CC0-1.0 | ONNX | Voz unica "Aivars", empaquetado para phoonnx |
| `RaivisDejus/Piper-lv_LV-Aivars-medium` | VITS (Piper) | leton (lv-LV) | CC0-1.0 | Piper | Modelo upstream del que deriva este |
| Otras voces de la coleccion `Phoonnx/vits` | VITS | multiples | variable | ONNX | Mismo empaquetado, distintos idiomas y hablantes |

No se dispone de datos de rendimiento comparativo (MOS, latencia) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: solo sintetiza letón con la voz "Aivars"; no admite otros idiomas ni cambio de hablante.
- Dependencia de espeak-ng: sin `espeak-ng` instalado, phoonnx usa el port `espyak`, cuyos fonemas pueden diferir y provocar pronunciaciones incorrectas en algunas palabras.
- Dependencia de `scriptconv` para normalizacion y fonemizacion; errores en el front-end afectan directamente a la calidad del audio.
- No se documentan sesgos, pero al derivar de un corpus de un unico hablante, la voz refleja las caracteristicas de ese hablante y su registro.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si puede producir prosodia o pronunciacion incorrecta en textos con abreviaturas, numeros o nombres propios no cubiertos por la normalizacion.
- Licencia CC0-1.0: permite uso comercial sin atribucion obligatoria; aun asi, conviene verificar la cadena de licencias del modelo upstream.
- No se documentan requisitos minimos de calidad (MOS) ni condiciones de uso recomendadas en produccion.
- El repositorio tiene muy pocas descargas (25) y 0 likes en el momento de la consulta, lo que sugiere poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-lv_lv-aivars-espeak
- Modelo upstream: https://huggingface.co/RaivisDejus/Piper-lv_LV-Aivars-medium
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
