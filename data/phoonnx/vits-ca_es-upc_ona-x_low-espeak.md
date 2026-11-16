# Phoonnx/vits-ca_es-upc_ona-x_low-espeak

## Resumen

vits-ca_es-upc_ona-x_low-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su libreria ONNX de TTS. Convierte texto en castellano de Cataluna (ca-ES) en audio inteligible a partir de fonemas IPA generados por espeak-ng, lo que lo hace util para integrar voz en asistentes y aplicaciones locales.

El modelo es una variante "x_low" del voice upc_ona, lo que indica un perfil de recursos reducido orientado a inferencia ligera en CPU o dispositivos con poca VRAM. Se distribuye en formato ONNX, lo que permite ejecutarlo sin dependencias de frameworks de deep learning pesados y facilita su despliegue en entornos embebidos o en el navegador mediante phoonnx.js.

Su relevancia actual radica en que ofrece sintesis de voz catalana con licencia MIT y un pipeline reproducible (texto, normalizacion, fonemizacion con espeak-ng, sintesis VITS), lo que lo convierte en una pieza practica para proyectos de codigo abierto que necesitan TTS en catalan sin ataduras a servicios en la nube. El tamano del repositorio es de 0,0 GB segun los metadatos, coherente con un modelo de voz de baja huella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto de texto largo como un LLM) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el modelo se distribuye ya optimizado como x_low) |
| Idiomas soportados | ca-ES (catalan de Cataluna) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia.

La entrada de texto se procesa mediante espeak-ng: el texto se normaliza y se convierte a fonemas IPA con el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`. El modelo es la version "x_low" del voice upc_ona de Piper, lo que implica un checkpoint de baja capacidad orientado a velocidad y bajo consumo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card no detalla el proceso de entrenamiento mas alla de la procedencia upstream.

## Capacidades

- Sintesis de voz a partir de texto en catalan (ca-ES) con salida en audio WAV.
- Conversion texto a fonemas IPA mediante espeak-ng, con soporte del puerto espyak como alternativa.
- Generacion de audio end-to-end sin vocoder externo, gracias a la arquitectura VITS.
- Ejecucion en Python mediante la libreria phoonnx y en el navegador mediante phoonnx.js.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Perfil de recursos reducido (variante x_low) adecuado para inferencia en CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni vision; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en catalan: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx` y permite que un asistente domestico responda en ca-ES sin enviar texto a servicios externos, usando la configuracion `mycroft.conf` indicada en la model card.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: dado su bajo perfil de recursos, puede sintetizar mensajes cortos en tiempo real en segundo plano sin penalizar el rendimiento del sistema.
- Accesibilidad web: con phoonnx.js y la demo en tigregotico.pt/demo, se puede ofrecer lectura de contenido en catalan directamente en el navegador, sin backend ni coste por peticion.
- Sistemas de megafonia o anuncios automatizados en entornos publicos de Cataluna: la licencia MIT permite uso comercial y la salida WAV facilita la integracion con reproductores y colas de audio.
- Prototipado de interfaces conversacionales: al ser un modelo pequeno y ONNX, permite iterar rapidamente en el diseno de flujos de voz sin depender de APIs de terceros.
- Generacion de audiolibros o contenido educativo en catalan: la fonemizacion con espeak-ng y la salida WAV permiten procesar lotes de texto y concatenar audio para narraciones.
- Pruebas de integracion continua en pipelines TTS: el modelo sirve como voz de referencia para validar que el pipeline de normalizacion, fonemizacion y sintesis funciona correctamente en cada version.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo x_low en ONNX, se espera que quepa en GPU consumer de gama baja o incluso que funcione en CPU.
- GPU recomendadas: no disponible en la informacion proporcionada; por el perfil x_low, cualquier GPU con soporte ONNX Runtime deberia ser suficiente.
- Cabe en GPU consumer: previsiblemente si, dado el perfil x_low, aunque no se confirma con datos de la model card.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), OVOS mediante `ovos-tts-plugin-phoonnx`, y ONNX Runtime de forma directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-ca_es-upc_ona-x_low-espeak | VITS | ca-ES | MIT | ONNX | Variante x_low, empaquetado por Phoonnx |
| Otras voces Piper ca_ES (upstream) | VITS | ca-ES | MIT (segun upstream) | ONNX | Disponibles en rhasspy/piper-voices; variantes de calidad y tamano |
| Modelos TTS multilingues genericos | no disponible | varios | variable | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta catalan de Cataluna (ca-ES); no esta entrenado para castellano ni otras variantes del catalan.
- La fonemizacion depende de espeak-ng; si se usa el puerto espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, como advierte la model card.
- Al ser una variante x_low, la calidad de voz y la naturalidad seran inferiores a las de variantes de mayor capacidad del mismo voice.
- Riesgo de pronunciacion incorrecta en palabras extranjeras, siglas o nombres propios no cubiertos por la normalizacion de espeak-ng.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre evaluaciones de robustez.
- La licencia MIT permite uso comercial, pero la model card indica que la licencia se hereda del upstream (rhasspy/piper-voices); conviene verificar los terminos del repositorio original.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ca_es-upc_ona-x_low-espeak
- Upstream en Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/ca/ca_ES/upc_ona/x_low
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
