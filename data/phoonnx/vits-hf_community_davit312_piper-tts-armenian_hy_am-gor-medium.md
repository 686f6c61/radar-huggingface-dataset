# Phoonnx/vits-hf_community_davit312_piper-TTS-Armenian_hy_AM-gor-medium

## Resumen

El modelo `vits-hf_community_davit312_piper-TTS-Armenian_hy_AM-gor-medium` es un modelo de sintesis de voz (text-to-speech) en formato ONNX, empaquetado por la organizacion Phoonnx para su uso con la libreria `phoonnx`. Se trata de una voz Piper para armenio (codigo de idioma `hy_AM`), identificada como "Gor" y de calidad "medium", creada originalmente por el usuario davit312 en su repositorio `davit312/piper-TTS-Armenian`. El modelo resuelve la necesidad de sintetizar habla en armenio con un modelo ligero y desplegable en entornos con pocos recursos.

Arquitectonicamente se basa en VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), la familia de modelos que emplea Piper para sus voces neuronales. El repositorio ocupa aproximadamente 0,1 GB y el fichero principal `hy_AM-gor-medium.onnx` pesa unos 63,5 MB, lo que lo hace adecuado para inferencia en CPU y dispositivos de borde. La licencia declarada es MIT.

Es relevante ahora porque el armenio es un idioma con escasa representacion en el ecosistema TTS open source, y este empaquetado facilita su uso reproducible dentro de pipelines que emplean `phoonnx`. No obstante, la informacion publica disponible es muy limitada: no hay datos de benchmarks, ni de composicion del dataset de entrenamiento, ni de parametros del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | armenio (`hy_AM`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`hy_AM-gor-medium.onnx`, ~63,5 MB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado conjuntamente. Piper, el ecosistema del que procede esta voz, emplea VITS con un front-end fonetico basado en espeak-ng para convertir el texto en fonemas antes de la sintesis. La etiqueta "medium" indica la gama de calidad dentro de las voces Piper, que suele corresponder a un compromiso entre fidelidad y tamano del modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. El modelo card indica que los ficheros conservan las rutas del repositorio origen `Phoonnx/phoonnx-vits`, carpeta `hf_community__davit312__piper-TTS-Armenian__hy_AM-gor-medium`, y que la licencia es la que registra el repositorio fuente. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, attention linear, etc.).

## Capacidades

- Sintesis de voz (text-to-speech) en armenio a partir de texto de entrada.
- Generacion de audio mono con calidad "medium" segun la clasificacion de Piper.
- Inferencia via ONNX Runtime, lo que permite ejecucion en CPU sin GPU.
- Integracion con la libreria `phoonnx` para pipelines de TTS.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada ni modos de razonamiento.
- No se documentan capacidades multilingues: la voz esta limitada al armenio (`hy_AM`).

## Casos de uso

- Lectura de articulos y noticias en armenio: el modelo convierte texto plano en audio para aplicaciones de accesibilidad o podcasts automatizados, aprovechando su bajo peso (~63,5 MB) para servir audio bajo demanda.
- Asistentes de voz para armenio: integracion en interfaces conversacionales donde se necesita sintetizar respuestas en `hy_AM` con latencia baja en CPU.
- Sistemas de navegacion y avisos hablados: generacion de locuciones cortas en armenio para aplicaciones de transporte o domotica, donde el modelo ONNX puede ejecutarse en dispositivos empotrados.
- Audiolibros y contenido educativo: sintesis por lotes de textos largos en armenio, dividiendo el texto en fragmentos y concatenando el audio resultante.
- Localizacion de contenidos: conversion de subtitulos o guiones al armenio hablado para doblaje de bajo coste, dado que la licencia MIT permite uso comercial.
- Pruebas de integracion en pipelines `phoonnx`: uso como voz de referencia para validar el flujo de TTS dentro de la libreria antes de desplegar otras voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; en GPU el modelo ONNX de ~63,5 MB requiere menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060, RTX 4090, A100, H100); no se requiere hardware de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna, e incluso en CPU.
- Opciones de despliegue: ONNX Runtime y la libreria `phoonnx`; no se documenta soporte nativo de vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gor, davit312) | Armenio (`hy_AM`) | VITS / ONNX | ~63,5 MB | MIT | Hugging Face (Phoonnx) |
| Otras voces Piper para armenio | Armenio | VITS / ONNX | no disponible | segun origen | PiperHub, repositorios Piper |
| Voces Piper de otros idiomas | Multiples | VITS / ONNX | variable (decenas de MB) | segun origen | PiperHub, Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta armenio (`hy_AM`); no es un modelo multilingue.
- No hay informacion sobre sesgos, calidad subjetiva ni evaluaciones MOS.
- Riesgo de errores de pronunciacion en nombres propios, prestamos y terminologia tecnica, comun en voces Piper de calidad media.
- El front-end fonetico depende de espeak-ng, por lo que la calidad de la transcripcion texto-fonema condiciona el resultado.
- La licencia MIT permite uso comercial, pero el model card advierte que la licencia es la que registra el repositorio fuente y que algunas voces del repositorio `phoonnx-vits` llevan `license: other`; conviene verificar la procedencia concreta de esta voz antes de un despliegue comercial.
- No se documenta la composicion del dataset de entrenamiento, lo que impide evaluar posibles sesgos de hablante, dialecto o genero.
- El repositorio registra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- No hay datos de benchmarks ni de latencia en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hf_community_davit312_piper-TTS-Armenian_hy_AM-gor-medium
- Repositorio origen (Phoonnx/phoonnx-vits): https://huggingface.co/Phoonnx/phoonnx-vits
- Repositorio original de la voz (davit312/piper-TTS-Armenian): https://huggingface.co/davit312/piper-TTS-Armenian
- Carpeta v3 del repositorio original: https://huggingface.co/davit312/piper-TTS-Armenian/tree/main/v3
- Libreria phoonnx (GitHub): https://github.com/TigreGotico/phoonnx
- Ficha en PiperHub: https://piperhub.org/model/gor-armenian-am-medium-davit312/
