# Phoonnx/rapido-pt_br-edwixx

## Resumen

rapido-pt_br-edwixx es un modelo de sintesis de voz (text-to-speech) en portugues de Brasil, empaquetado en formato ONNX para la libreria phoonnx. El modelo original, edwixx/rapido-tts, fue entrenado por edwixx y esta empaquetado por Phoonnx, el proyecto que mantiene la coleccion de voces Rapido listas para su uso en Python y en el ecosistema OVOS. El repositorio ocupa 0,3 GB y la licencia declarada es Apache 2.0.

Se trata de un modelo ligero orientado a la sintesis de voz a partir de texto, con un front-end basado en grafemas (no en fonemas) para portugues de Brasil. Segun la informacion del empaquetado, la configuracion del modelo declara 42 simbolos de entrada en precision fp32. Su relevancia actual radica en que ofrece una voz TTS de codigo abierto, con licencia permisiva y formato ONNX, lo que facilita su integracion en aplicaciones de escritorio, asistentes locales y sistemas embebidos sin dependencia de frameworks propietarios.

El modelo esta pensado para su consumo mediante la libreria phoonnx, que gestiona la carga y ejecucion del modelo ONNX. No se dispone de informacion sobre el tamano en parametros, el numero de tokens de entrenamiento ni los datos exactos del corpus utilizado, por lo que las especificaciones tecnicas se limitan a lo declarado en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rapido (TTS, empaquetado ONNX para phoonnx) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | fp32 segun la configuracion declarada; no se detallan otras variantes |
| Idiomas soportados | portugues de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura declarada es Rapido, una familia de modelos TTS recogida en la coleccion Phoonnx/Rapido y distribuida como modelo ONNX. El front-end utiliza grafemas de portugues de Brasil con 42 simbolos de entrada, lo que implica que la conversion texto-a-voz se realiza directamente sobre la representacion ortografica, sin una etapa fonemica explicita en la configuracion del modelo. El modelo se distribuye en precision fp32.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del entrenamiento. El modelo original procede de edwixx/rapido-tts, cuyo autor es edwixx; Phoonnx se limita al empaquetado y la conversion a ONNX para su libreria.

## Capacidades

- Sintesis de voz a partir de texto en portugues de Brasil.
- Generacion de audio a partir de una entrada de grafemas pt-BR (42 simbolos declarados).
- Ejecucion mediante ONNX, lo que permite inferencia en CPU y GPU sin depender de PyTorch en tiempo de ejecucion.
- Integracion en Python a traves de la libreria phoonnx y en el ecosistema OVOS.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking; es un modelo exclusivamente TTS.

## Casos de uso

- Lectura de textos en portugues de Brasil: el modelo convierte cadenas de texto en audio, adecuado para narracion de articulos, noticias o documentos en aplicaciones de accesibilidad.
- Asistentes de voz locales en OVOS: al integrarse en el ecosistema OVOS mediante phoonnx, puede proporcionar la salida hablada de asistentes que funcionan en local sin servicios en la nube.
- Sistemas de anuncios y avisos: en aplicaciones de escritorio o domoticas, puede generar avisos hablados en pt-BR con una huella de almacenamiento pequena (0,3 GB de repositorio).
- Prototipado rapido de interfaces conversacionales: al ser un modelo ONNX ligero con licencia Apache 2.0, permite incorporar TTS en demos y pruebas de concepto sin coste de licencia.
- Generacion de audio para contenidos educativos: narracion de materiales de aprendizaje en portugues de Brasil con un modelo de codigo abierto.
- Despliegue en entornos con recursos limitados: la ejecucion ONNX y el tamano reducido del repositorio lo hacen apto para dispositivos de gama media o servidores sin acelerador dedicado, siempre que se valide el rendimiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,3 GB y la configuracion declarada es fp32.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamano del repositorio y el formato ONNX es plausible su ejecucion en CPU, pero no hay datos que lo garanticen.
- Opciones de despliegue: libreria phoonnx (Python) y el ecosistema OVOS; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de parametros que permitan una comparacion cuantitativa fiable con otros modelos TTS. Como referencia cualitativa, la coleccion Rapido de Phoonnx agrupa voces empaquetadas de forma similar (ONNX, licencia Apache 2.0), pero no se dispone de cifras comparativas publicadas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rapido-pt_br-edwixx | no disponible | no aplica (TTS) | no disponible | Apache 2.0 | Hugging Face (Phoonnx) |
| Otros modelos de la coleccion Rapido | no disponible | no aplica (TTS) | no disponible | Apache 2.0 (segun coleccion) | Hugging Face (Phoonnx) |
| Alternativas TTS de codigo abierto | no disponible | no aplica (TTS) | no disponible | variable | no disponible |

## Limitaciones y advertencias

- Solo soporta portugues de Brasil; no se declaran otros idiomas.
- El front-end basado en grafemas puede producir pronunciaciones incorrectas en palabras con ortografia irregular o en prestamos linguisticos.
- No se dispone de informacion sobre sesgos de voz (genero, acento regional, edad) ni sobre la diversidad del corpus de entrenamiento.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero el modelo puede generar audio defectuoso o ininteligible ante entradas anomalas; no hay datos sobre su robustez.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo upstream edwixx/rapido-tts y de los datos de entrenamiento originales.
- La voz no aparece listada en el indice de voces de phoonnx, lo que puede complicar su descubrimiento y uso automatico en el ecosistema.
- No hay datos publicados de latencia, calidad perceptual (MOS) ni pruebas en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/rapido-pt_br-edwixx
- Modelo upstream: https://huggingface.co/edwixx/rapido-tts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv (normalizacion y fonemizacion): https://github.com/TigreGotico/scriptconv
- Coleccion Rapido de Phoonnx: https://huggingface.co/collections/Phoonnx/rapido-6af8ecbfc1860f5bc2c6c670
