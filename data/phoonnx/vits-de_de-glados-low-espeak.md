# Phoonnx/vits-de_de-glados-low-espeak

## Resumen

vits-de_de-glados-low-espeak es un modelo de sintesis de voz (text-to-speech) en aleman (de-DE) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo original procede de systemofapwne, concretamente de la variante piper-de-glados en su configuracion "low" para aleman, y ha sido adaptado para funcionar con el front-end fonetico de espeak-ng (fonemas en alfabeto IPA). Se trata de una voz de calidad baja (low), lo que implica un modelo compacto y rapido, adecuado para sintesis en tiempo real en entornos con recursos limitados.

El modelo resuelve el problema de generar voz sintetica en aleman dentro del ecosistema phoonnx/OVOS, una pila open source de asistentes de voz. Su relevancia radica en que ofrece una voz alemana ligera, con licencia MIT, empaquetada en ONNX y lista para desplegar tanto en Python como en el navegador mediante phoonnx.js. El tamano del repositorio es de aproximadamente 0,1 GB, lo que confirma su naturaleza compacta.

La ficha se basa exclusivamente en la informacion disponible en la model card y en los metadatos de Hugging Face; los datos no publicados se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX, variante "low") |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Autor original | systemofapwne |
| Empaquetado | Phoonnx |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado con aprendizaje adversarial. VITS es conocida por generar audio de forma directa a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. En este caso, la variante "low" indica una configuracion de menor capacidad (menos parametros y/o menor resolucion), orientada a eficiencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan publicados en la model card. El modelo original fue entrenado por systemofapwne dentro del proyecto piper-de-glados, y Phoonnx lo ha reempaquetado en ONNX para su ejecucion con phoonnx. La entrada de texto se procesa mediante scriptconv, que normaliza el texto y lo convierte a fonemas espeak-ng en IPA; el modelo espera esa representacion fonetica como entrada.

## Capacidades

- Sintesis de voz en aleman (de-DE) a partir de texto, con salida en formato WAV.
- Generacion de audio a partir de fonemas espeak-ng en alfabeto IPA.
- Integracion con la libreria phoonnx para Python y con el ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- Voz compacta y ligera (variante "low"), adecuada para entornos con recursos limitados.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en aleman sobre OVOS: el modelo se integra como plugin TTS en mycroft.conf, permitiendo respuestas habladas en aleman en asistentes domoticos o de escritorio con recursos modestos.
- Sintesis en tiempo real en dispositivos embebidos: al ser una variante "low" de ~0,1 GB en ONNX, puede ejecutarse en Raspberry Pi u otros dispositivos de bajas prestaciones para generar avisos y respuestas habladas.
- Accesibilidad web: mediante phoonnx.js, se puede ofrecer lectura en voz alta de contenido en aleman directamente en el navegador, sin backend, usando la demo de tigregotico.pt/demo como referencia.
- Generacion de audiolibros o locuciones automatizadas: para contenido en aleman donde la calidad "low" sea aceptable (notificaciones, resumenes, prototipos).
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia ligera para validar integraciones con phoonnx y scriptconv antes de pasar a voces de mayor calidad.
- Sistemas de anuncios automatizados en alemán: integracion en scripts Python que generan WAV a partir de texto (por ejemplo, avisos de transporte o alertas) gracias a la API synthesize_wav de phoonnx.
- Prototipado de interfaces conversacionales multilingues: combinado con otras voces del ecosistema phoonnx, permite probar flujos de dialogo en aleman sin coste de licencia (MIT).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (~0,1 GB) y la variante "low", es previsible que quepa en GPU consumer con pocos cientos de MB, aunque no se confirma en la documentacion.
- GPU recomendadas: no disponible. Por su naturaleza compacta, deberia funcionar en GPUs de gama baja e incluso en CPU.
- Cabe en GPU consumer: probablemente si (cualquier GPU con al menos ~1 GB libre), aunque no se especifica oficialmente.
- Opciones de despliegue: phoonnx (Python), OVOS mediante ovos-tts-plugin-phoonnx, phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS VITS).
- Latencia y throughput estimados: no disponibles. La variante "low" sugiere baja latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-de_de-glados-low-espeak (este) | VITS | de-DE | MIT | ONNX | Variante "low", empaquetado phoonnx |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | MIT (segun cada modelo) | ONNX | Misma pila de ejecucion |
| piper-de-glados (upstream systemofapwne) | VITS | de-DE | MIT | Piper | Modelo original sin empaquetar para phoonnx |
| Modelos TTS comerciales (p. ej. Azure/Google TTS) | no disponible | multilingue | propietaria | API | No comparables en licencia ni despliegue local |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad "low": la variante esta disenada para eficiencia, por lo que la naturalidad y fidelidad de la voz seran inferiores a variantes de mayor calidad.
- Dependencia de espeak-ng: los fonemas deben provenir de espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Solo aleman (de-DE): no soporta otros idiomas ni cambio de voz.
- Riesgo de alucinacion: no aplica en el sentido de texto generado, pero puede producir pronunciaciones incorrectas ante texto no normalizado o fonemas no vistos.
- Licencia MIT: permite uso comercial, pero el autor original (systemofapwne) establece sus propios terminos en la release upstream; conviene revisarlos.
- Sin datos de sesgos: no se documentan sesgos de voz (genero, acento, edad) ni evaluaciones de robustez.
- No apta para clonacion de voz ni control de estilo: es una voz fija.
- Documentacion escasa: no hay informacion sobre parametros, dataset de entrenamiento ni metricas objetivas (MOS, etc.).

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-glados-low-espeak
- Upstream (systemofapwne/piper-de-glados): https://huggingface.co/systemofapwne/piper-de-glados/tree/main/de/de_DE/glados/low
- phoonnx (GitHub): https://github.com/TigreGotico/phoonnx
- scriptconv (GitHub): https://github.com/TigreGotico/scriptconv
- phoonnx.js (GitHub): https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
