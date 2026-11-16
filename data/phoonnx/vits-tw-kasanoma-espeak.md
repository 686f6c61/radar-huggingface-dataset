# Phoonnx/vits-tw-kasanoma-espeak

## Resumen

vits-tw-kasanoma-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por michsethowusu a partir del proyecto ghananlpcommunity/kasanoma-twi y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo esta especializado en twi (codigo ISO `tw`), una lengua kwa hablada principalmente en Ghana, y convierte texto en fonemas mediante espeak-ng antes de generar la onda de audio.

El modelo resuelve un problema concreto: la escasez de voces TTS de calidad para lenguas africanas de bajos recursos. Al estar empaquetado en formato ONNX y distribuirse bajo licencia MIT, se puede ejecutar en entornos sin GPU dedicada y en navegador (via phoonnx.js), lo que facilita su integracion en asistentes de voz y aplicaciones de accesibilidad para hablantes de twi.

La relevancia actual del modelo reside en su caracter abierto y ligero (repositorio de 0,1 GB), su integracion con el ecosistema OVOS/Mycroft y su enfoque en una lengua con poca representacion en el ecosistema TTS comercial. Es un modelo de inferencia, no un LLM: no genera texto ni razona, unicamente sintetiza voz a partir de texto en twi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible; pesos en ONNX (precision no especificada) |
| Idiomas soportados | twi (`tw`) |
| Licencia | MIT (segun metadatos de Hugging Face); la model card advierte que el modelo upstream kasanoma no declara licencia y lleva `license: other` |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior normalizante con flujo invertible, un decoder basado en HiFi-GAN y un discriminador multiple entrenado con aprendizaje adversarial. Permite generar audio de forma directa desde fonemas sin necesidad de un vocoder separado en tiempo de inferencia.

El modelo deriva del proyecto ghananlpcommunity/kasanoma-twi, cuyo autor es michsethowusu. No se dispone de informacion sobre el numero de horas de audio de entrenamiento, la composicion del corpus, el numero de pasos ni si se aplicaron tecnicas de fine-tuning especificas. La unica innovacion documentada es el empaquetado para phoonnx, que convierte los pesos a ONNX y anade un front-end de texto basado en scriptconv y espeak-ng para la fonemizacion del twi.

## Capacidades

- Sintesis de voz a partir de texto en twi, con salida en formato WAV.
- Fonemizacion mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Normalizacion y conversion de texto mediante la libreria scriptconv antes de la sintesis.
- Ejecucion en CPU mediante ONNX Runtime, sin requerir GPU.
- Integracion con OVOS/Mycroft a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (demo en tigregotico.pt/demo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz para hablantes de twi: el modelo se integra en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en twi en asistentes domesticos sin conexion a servicios en la nube.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido web o documentos en twi, ejecutandose en CPU y en navegador gracias a phoonnx.js.
- Aplicaciones educativas: sintesis de material didactico en twi para escuelas de Ghana, con posibilidad de empaquetar el modelo en aplicaciones de escritorio o moviles por su tamano reducido (0,1 GB).
- Sistemas de anuncios publicos y megafonia: generacion de avisos pregrabados en twi para transporte, sanidad o servicios municipales, sin dependencia de voces comerciales.
- Investigacion en TTS de bajos recursos: el modelo sirve como linea base reproducible para comparar tecnicas de sintesis en lenguas kwa, dado que los pesos estan en ONNX y la licencia MIT facilita su reutilizacion.
- Integracion en pipelines de accesibilidad web: conversion de texto a audio en el navegador mediante phoonnx.js para lectores de pantalla que necesiten soporte de twi.
- Prototipado rapido de interfaces de voz: al no requerir GPU ni infraestructura pesada, el modelo permite validar flujos conversacionales en twi antes de invertir en voces comerciales o modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, se espera que funcione en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; no se documentan requisitos de GPU.
- Cabe en GPU consumer: si, por el tamano del repositorio (0,1 GB), aunque no se especifican modelos concretos.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. Requiere espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| vits-tw-kasanoma-espeak | VITS | twi | MIT (con advertencia sobre upstream) | ONNX | 0,1 GB |
| vits-ny-kasanoma-espeak | VITS | chichewa | `other` (upstream sin licencia) | ONNX | no disponible |
| vits-vmw-kasanoma-espeak | VITS | makhuwa | `other` (upstream sin licencia) | ONNX | no disponible |

Las alternativas directas son las otras voces del mismo proyecto kasanoma empaquetadas por Phoonnx para chichewa y makhuwa. No se dispone de datos de rendimiento comparativo entre ellas ni con otros modelos TTS multilingues de referencia (por ejemplo, modelos VITS de Coqui o Piper), por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ambiguedad de licencia: los metadatos de Hugging Face indican MIT, pero la propia model card advierte que el modelo upstream (kasanoma) no declara licencia y lleva `license: other`. Antes de un uso comercial conviene revisar el README del repositorio original de michsethowusu.
- Dependencia de espeak-ng: la fonemizacion incorrecta o la ausencia de espeak-ng provoca errores de pronunciacion. El port espyak incluido en phoonnx puede diferir de espeak-ng y hacer que el modelo pronuncie mal algunas palabras.
- Cobertura limitada a twi: no soporta otros idiomas ni cambio de voz; es un modelo mono-hablante y mono-idioma.
- Sin datos de entrenamiento publicados: no se puede evaluar la cobertura dialectal del twi, el sesgo de genero de la voz ni la calidad en dominios especializados (medico, legal, tecnico).
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar artefactos, prosodia incorrecta o pronunciaciones erroneas en palabras fuera del vocabulario de entrenamiento.
- Sin benchmarks publicados: no hay metricas objetivas (MOS, WER de fonemas) que permitan comparar su calidad con otras voces.
- Ecosistema joven: la libreria phoonnx se distribuye como pre-release (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.
- Uso previsto limitado a sintesis de voz: no debe emplearse para tareas de generacion de texto, razonamiento o clasificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-tw-kasanoma-espeak
- Modelo upstream: https://huggingface.co/ghananlpcommunity/kasanoma-twi
- Repositorio original kasanoma: https://github.com/michsethowusu/kasanoma
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
