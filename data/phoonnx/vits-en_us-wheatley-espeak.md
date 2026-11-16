# Phoonnx/vits-en_us-wheatley-espeak

## Resumen

vits-en_us-wheatley-espeak es un modelo de sintesis de voz (text-to-speech) de la familia VITS, desarrollado originalmente por el usuario davet2001 (repositorio upstream `davet2001/wheatley1`) y empaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo convierte texto en ingles estadounidense a audio, recibiendo como entrada fonemas en alfabeto IPA generados por espeak-ng (o su port espyak). Es, por tanto, un componente de un pipeline TTS mas amplio: la normalizacion de texto y la fonemizacion las realiza la libreria `scriptconv`, no el modelo.

El modelo resuelve el problema de sintesis de voz local y ligera: al estar empaquetado en ONNX y distribuido en un repositorio de apenas 0,1 GB, esta pensado para ejecutarse en entornos con recursos limitados, incluidos navegadores (via `phoonnx.js`) y asistentes de voz como OVOS. No es un modelo de lenguaje: no genera texto, no razona y no admite tool calling. Su unica funcion es la sintesis de audio a partir de fonemas.

Su relevancia actual es la de un componente practico dentro del ecosistema open source de TTS: licencia MIT, integracion con OVOS y phoonnx, y una voz concreta (wheatley) para ingles US. No dispone de benchmarks publicados ni de especificaciones detalladas de arquitectura mas alla de la etiqueta VITS. Las cifras de parametros, contexto y entrenamiento no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por fonemas, no por tokens de contexto) |
| Tipos de cuantizacion | no disponible (pesos empaquetados en ONNX) |
| Idiomas soportados | en (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como VITS, un modelo generativo de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior y un decoder generativo con entrenamiento adversarial, aunque la informacion proporcionada no detalla la configuracion concreta (dimensiones, capas, tipo de decoder). El modelo deriva del release upstream `davet2001/wheatley1`, del que no se aportan datos de entrenamiento: ni numero de horas de audio, ni composicion del dataset, ni si hubo ajuste fine-tuning adicional. No se documenta el uso de RLHF, DPO ni tecnicas de entrenamiento especificas.

La innovacion tecnica relevante en este empaquetado es la conversion a ONNX para inferencia portable y la integracion con la cadena de herramientas de Phoonnx: `scriptconv` normaliza el texto y lo convierte a fonemas espeak-ng, y `phoonnx` ejecuta el modelo. La model card advierte de que el uso del port espyak (en lugar de espeak-ng nativo) puede producir diferencias foneticas y errores de pronunciacion en algunas palabras.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto.
- Entrada basada en fonemas espeak en alfabeto IPA, no en texto crudo directamente.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecucion en navegador mediante `phoonnx.js` con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada al ingles (en-US); no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona como modulo TTS en `mycroft.conf` y permite sintetizar respuestas del asistente sin depender de servicios en la nube, gracias a su licencia MIT y su formato ONNX.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: la API `synthesize_wav` permite generar un WAV por mensaje y reproducirlo, con un coste de recursos bajo (repositorio de 0,1 GB).
- Sintesis de voz en el navegador: mediante `phoonnx.js` y la demo de TigreGotico, se puede integrar TTS en una web sin backend, usando la entrada espeak o unicode.
- Prototipado de interfaces conversacionales: al ser un modelo pequeno y de licencia permisiva, sirve para validar pipelines de TTS antes de invertir en voces comerciales o modelos mayores.
- Accesibilidad: lectura en voz alta de contenido en ingles US en aplicaciones de escritorio o web para usuarios con discapacidad visual, ejecutandose en local.
- Pruebas de integracion de la cadena scriptconv + phoonnx: util para desarrolladores que quieran validar la fonemizacion espeak-ng y el empaquetado ONNX de voces VITS en sus propios pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeno apto para CPU, pero no se aportan cifras de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible; por tamano del repositorio es plausible que funcione en CPU, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue: `phoonnx` (Python), `phoonnx.js` (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. Requiere espeak-ng instalado (o el extra `phoonnx[espeak]` con espyak).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-wheatley-espeak | VITS | en-US | MIT | ONNX | 0,1 GB | Empaquetado para phoonnx; entrada por fonemas espeak |
| davet2001/wheatley1 (upstream) | VITS | en-US | segun release upstream | no disponible | no disponible | Origen del modelo empaquetado |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | MIT (segun coleccion) | ONNX | no disponible | Mismo pipeline phoonnx; comparacion individual no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas para una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no hay soporte multilingue documentado.
- La entrada debe ser fonemas espeak en IPA; el texto crudo requiere pasar por `scriptconv` y espeak-ng.
- El uso del port espyak en lugar de espeak-ng nativo puede provocar pronunciaciones incorrectas en algunas palabras, segun advierte la model card.
- No se documentan sesgos del modelo ni evaluaciones de calidad o naturalidad de la voz.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero no hay evaluacion de fidelidad de la sintesis ni de errores de pronunciacion.
- Licencia MIT: permite uso comercial, pero la model card remite a los terminos del release upstream, que no se detallan en la informacion proporcionada.
- No es un modelo de lenguaje: no admite razonamiento, codigo, tool calling ni agentes; usarlo fuera del ambito TTS no tiene sentido.
- Sin benchmarks publicados: no se puede comparar su calidad objetiva con otras voces VITS.
- Repositorio con muy pocas descargas (22) y sin likes: ecosistema de validacion limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-wheatley-espeak
- Modelo upstream: https://huggingface.co/davet2001/wheatley1
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
