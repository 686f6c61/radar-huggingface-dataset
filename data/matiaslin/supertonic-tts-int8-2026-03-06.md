# MatiasLin/supertonic-tts-int8-2026-03-06

## Resumen

Supertonic TTS int8 (2026-03-06) es un espejo de los ficheros del modelo Supertonic de Supertone Inc., publicado por el usuario MatiasLin en Hugging Face. Se trata de un modelo de sintesis de voz (text-to-speech) exportado a formato ONNX y cuantizado a int8, extraido del release `tts-models` del proyecto k2-fsa/sherpa-onnx para permitir la descarga fichero a fichero. El modelo original es Supertonic, desarrollado por Supertone Inc., y este repositorio no introduce modificaciones sobre los pesos ni sobre la configuracion.

La relevancia de esta publicacion es practica: sherpa-onnx es un runtime de inferencia en C++/ONNX pensado para despliegue local y en dispositivos, y la variante int8 reduce el peso y los requisitos de computo frente a los pesos en punto flotante. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que se trata de un modelo compacto orientado a inferencia en CPU o en hardware modesto.

No obstante, la informacion disponible es muy limitada: la model card es un simple aviso de espejo, no se declaran idiomas soportados, no se publican parametros, arquitectura interna, contexto ni benchmarks. Cualquier dato no presente en esta ficha debe considerarse no disponible y consultarse en el repositorio upstream de Supertone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS exportado a ONNX; arquitectura interna no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (variante publicada); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | OpenRAIL-M (pesos del modelo); MIT (codigo de ejemplo) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. El unico dato tecnico cierto es que los pesos se distribuyen en formato ONNX y que la variante publicada esta cuantizada a int8, lo que sugiere un grafo de inferencia optimizado para ejecucion en CPU mediante el runtime sherpa-onnx. No se detalla si se trata de un modelo basado en difusion, en un decoder autorregresivo, en un esquema tipo VITS o en otra familia de TTS neuronal.

Tampoco se han publicado datos sobre el corpus de entrenamiento, el numero de horas de audio, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas. El modelo procede de Supertonic (Supertone Inc.) y este repositorio es un espejo sin modificaciones de los ficheros del release `tts-models` de k2-fsa/sherpa-onnx. Para obtener detalles de entrenamiento y arquitectura debe consultarse el repositorio original de Supertone.

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech), segun el pipeline declarado en Hugging Face.
- Inferencia mediante sherpa-onnx, runtime orientado a despliegue local en C++/ONNX.
- Ejecucion con pesos cuantizados a int8, lo que reduce el uso de memoria y acelera la inferencia en CPU.
- Descarga fichero a fichero gracias a la estructura de espejo del repositorio.
- Soporte de tool calling, agentes, vision, audio de entrada o modos de razonamiento: no disponible (no es un modelo de lenguaje general).
- Capacidades multilingues: no disponible (no se declaran idiomas).

## Casos de uso

- Lectura de articulos y documentos en aplicaciones de accesibilidad: el modelo puede integrarse en un lector de pantalla que convierta texto a voz en local, sin depender de servicios en la nube, gracias a su formato ONNX y su bajo peso (0,1 GB).
- Asistentes de voz embebidos en dispositivos: al ejecutarse mediante sherpa-onnx y con cuantizacion int8, es adecuado para Raspberry Pi, moviles o sistemas empotrados donde el consumo de memoria es critico.
- Generacion de audiolibros y podcasts automatizados: permite sintetizar grandes volumenes de texto por lotes en un servidor CPU, reduciendo el coste frente a APIs comerciales de TTS.
- Sistemas de navegacion y avisos por voz: la inferencia local y de baja latencia encaja en entornos con conectividad intermitente, como vehiculos o aplicaciones offline.
- Prototipado rapido de interfaces conversacionales: al estar disponible en el ecosistema sherpa-onnx, se puede combinar con reconocimiento de voz del mismo runtime para construir un pipeline completo de voz a voz en local.
- Pruebas de integracion en pipelines de CI: el tamano reducido del repositorio permite descargar el modelo en entornos de integracion continua para validar sintesis de extremo a extremo sin grandes requisitos de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB, por lo que la huella de memoria es reducida y compatible con ejecucion en CPU.
- GPU recomendadas: no disponible. El formato ONNX y el runtime sherpa-onnx estan orientados principalmente a CPU; no se documenta soporte GPU especifico.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: sherpa-onnx (runtime nativo C++/ONNX); otros runtimes ONNX genericos no confirmados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Supertonic TTS int8 (este repo) | no disponible | no disponible | ONNX int8 | OpenRAIL-M | Espejo de sherpa-onnx, 0,1 GB |
| Supertonic (Supertone, original) | no disponible | no disponible | no disponible | OpenRAIL-M | Repositorio upstream de referencia |
| Otros modelos TTS de sherpa-onnx | no disponible | no disponible | ONNX | variable | Familia de modelos del mismo release |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas (VITS, Piper, Kokoro u otros modelos TTS). La comparacion queda limitada a la relacion con el modelo upstream y con el resto de modelos del release `tts-models` de sherpa-onnx.

## Limitaciones y advertencias

- La model card es unicamente un aviso de espejo; no documenta idiomas, voces, calidad ni condiciones de uso mas alla de la licencia.
- No se han publicado evaluaciones de calidad de sintesis (MOS, intelligibility) ni benchmarks objetivos.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al tratarse de un modelo TTS, los riesgos se refieren a pronunciacion incorrecta, artefactos acusticos y sesgos de voz derivados del corpus de entrenamiento, no documentados.
- La licencia OpenRAIL-M impone restricciones de uso (uso responsable y prohibicion de aplicaciones daninas); es imprescindible revisar `LICENSE.model` antes de un uso comercial o en produccion.
- El codigo de ejemplo se distribuye bajo licencia MIT, distinta de la licencia de los pesos.
- La cuantizacion int8 puede degradar la calidad de la sintesis frente a los pesos originales en punto flotante; no se ha cuantificado esta perdida.
- No se garantiza la paridad exacta con el repositorio upstream mas alla de la declaracion del autor de que los ficheros son "unmodified".

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MatiasLin/supertonic-tts-int8-2026-03-06
- Modelo original Supertonic (Supertone Inc.): https://huggingface.co/Supertone/supertonic-2
- Proyecto sherpa-onnx (k2-fsa): no disponible en la informacion proporcionada (referenciado como release `tts-models`)
