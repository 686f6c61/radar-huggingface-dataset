# Phoonnx/vits-kri-mms_farmerline-graphemes

## Resumen

vits-kri-mms_farmerline-graphemes es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por GhanaNLP y empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo esta orientado al idioma kri (krio), una lengua criolla de base inglesa hablada principalmente en Sierra Leona, y forma parte del ecosistema MMS (Massively Multilingual Speech) de Meta, del que hereda el enfoque multilingue y la arquitectura.

El modelo se distribuye en formato ONNX dentro del repositorio de Phoonnx, con un tamano de repositorio de 0,1 GB, lo que sugiere un modelo compacto adecuado para inferencia en entornos con recursos limitados. Su proposito es proporcionar sintesis de voz en krio a partir de texto en grafemas, sin necesidad de un fonemizador especifico, lo que simplifica el pipeline de despliegue.

La relevancia de este modelo radica en su caracter de recurso de baja disponibilidad: el krio cuenta con pocos sistemas TTS publicos, y este empaquetado facilita su integracion en aplicaciones Python y en el ecosistema OVOS. No obstante, la informacion publica es muy escasa: no se documentan parametros, contexto, datos de entrenamiento ni benchmarks, y la licencia figura como "other" sin especificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | kri (krio) |
| Licencia | other (sin especificar; la model card indica que no hay licencia registrada) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. VITS genera waveforms directamente a partir de texto sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. La variante "graphemes" indica que la entrada se procesa a nivel de grafema, sin requerir conversion a fonemas, lo que es especialmente util para lenguas con ortografias poco estandarizadas o con recursos foneticos limitados.

El modelo procede del proyecto MMS (Massively Multilingual Speech) de Meta, que entrena modelos multilingues sobre datos de habla de muchas lenguas, y fue adaptado por GhanaNLP para el krio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias de VITS.

## Capacidades

- Sintesis de voz a partir de texto en krio (kri) usando representacion por grafemas.
- Generacion end-to-end de waveform sin vocoder externo, gracias a la arquitectura VITS.
- Integracion con la libreria phoonnx para inferencia en Python y en el ecosistema OVOS.
- Ejecucion mediante ONNX Runtime, lo que permite despliegue en CPU y GPU.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documenta capacidad multilingue mas alla del kri.
- No se documentan modos especiales como thinking mode, vision o audio de entrada.

## Casos de uso

- Locucion de contenidos en krio para medios digitales: el modelo permite generar narraciones en krio a partir de texto, util para radios comunitarias o portales de noticias que quieran ofrecer versiones en audio sin locutores nativos disponibles.
- Accesibilidad para hablantes de krio: conversion de texto a voz para lectores de pantalla y aplicaciones de accesibilidad dirigidas a personas con discapacidad visual en Sierra Leona y diaspora.
- Asistentes de voz en OVOS: integracion como voz TTS dentro del ecosistema OVOS para asistentes de voz locales, aprovechando el empaquetado phoonnx y el formato ONNX.
- Educacion y alfabetizacion: generacion de materiales de aprendizaje en krio con audio sintetizado, por ejemplo para ensenanza de lectura o aprendizaje de la lengua.
- Preservacion linguistica: produccion de audio en krio para archivos y proyectos de documentacion de la lengua, dado el limitado numero de recursos TTS disponibles para este idioma.
- Prototipado rapido de aplicaciones de voz: al ser un modelo compacto (0,1 GB) en ONNX, permite iterar en prototipos de IVR o chatbots telefonicos en krio sin infraestructura pesada.
- Investigacion en TTS de bajos recursos: sirve como punto de partida para experimentos de sintesis en lenguas criollas y para comparar enfoques de grafemas frente a fonemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (0,1 GB) se trata de un modelo muy ligero que probablemente requiere menos de 1 GB de memoria en formato ONNX.
- GPU recomendadas: no disponible; por su tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia ser suficiente, aunque no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repositorio, aunque no se confirma en la documentacion.
- Opciones de despliegue: ONNX Runtime a traves de la libreria phoonnx; tambien es posible usar ONNX Runtime directamente en Python. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| vits-kri-mms_farmerline-graphemes (este modelo) | VITS | kri | no disponible | no aplica | other | ONNX |
| MMS-TTS (Meta) | VITS | multilingue (incluye kri) | no disponible | no aplica | CC-BY-NC 4.0 (segun publicacion de MMS) | PyTorch / ONNX |
| Modelos VITS de la coleccion Phoonnx | VITS | varias lenguas | no disponible | no aplica | variable | ONNX |

La comparativa se limita a la familia VITS/MMS, ya que no se dispone de datos de rendimiento ni de parametros para establecer comparaciones cuantitativas con alternativas. Cualquier comparacion de calidad o latencia requeriria evaluacion empirica no publicada.

## Limitaciones y advertencias

- La licencia figura como "other" sin especificacion; la propia model card advierte de que no hay licencia registrada y recomienda consultar la version upstream antes de usar el modelo. No se garantiza el uso comercial.
- No se documentan sesgos conocidos, pero al derivar de MMS y entrenarse sobre datos de habla de GhanaNLP, puede reflejar sesgos de los hablantes y dominios del corpus original.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si puede producir prosodia incorrecta o pronunciaciones erroneas en palabras fuera del dominio de entrenamiento.
- Limitacion idiomatica: solo se declara soporte para kri; no se garantiza un comportamiento correcto en otras lenguas ni en mezclas de codigo.
- La model card indica que el indice de voces de phoonnx no lista una voz para este modelo, lo que puede complicar su uso directo en el ecosistema sin configuracion manual.
- No hay informacion sobre el proceso de entrenamiento, datos, ni evaluacion, lo que impide valorar su calidad objetiva antes de desplegarlo en produccion.
- El formato ONNX limita las opciones de ajuste fino y de inspeccion del modelo en comparacion con pesos PyTorch.
- No se documenta soporte para fonemas, solo grafemas, lo que puede afectar a la precision en palabras con ortografia ambigua.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-kri-mms_farmerline-graphemes
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv (normalizacion de texto y fonemizadores): https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
