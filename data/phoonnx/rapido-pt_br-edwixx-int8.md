# Phoonnx/rapido-pt_br-edwixx-int8

## Resumen

rapido-pt_br-edwixx-int8 es un modelo de sintesis de voz (text-to-speech) para portugues de Brasil, empaquetado en formato ONNX para la libreria phoonnx. El modelo original, edwixx/rapido-tts, ha sido desarrollado por el autor edwixx y redistribuido por Phoonnx como parte de su coleccion de modelos Rapido optimizados para inferencia en ONNX. Su proposito es convertir texto en audio inteligible en pt-BR con un coste computacional reducido, gracias a la cuantizacion int8 aplicada al grafo del modelo de flujo.

La relevancia de este modelo radica en su empaquetado ligero (0,2 GB de repositorio) y su integracion con el ecosistema OVOS a traves de phoonnx, lo que facilita su despliegue en entornos con recursos limitados, como asistentes de voz locales o dispositivos embebidos. No obstante, la informacion publica disponible es muy escasa: no se detallan parametros, arquitectura interna mas alla de la etiqueta "Rapido", ni resultados de benchmarks.

Se trata, por tanto, de una ficha con datos limitados en la que muchos campos deben marcarse como "no disponible". La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion tecnica y de una voz asociada en el indice de phoonnx limita su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rapido (modelo de flujo, grafo dinamico int8; otros grafos en fp32) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | int8 (grafo de flujo dinamico); fp32 en otros grafos |
| Idiomas soportados | pt-BR (portugues de Brasil) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura se identifica como "Rapido", un modelo de sintesis de voz basado en flujo (flow model) segun la nota de licencia incluida en la model card. El empaquetado aplica cuantizacion dinamica int8 al grafo del modelo de flujo, mientras que otros grafos del pipeline se mantienen en fp32. No se dispone de informacion sobre el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens o muestras de audio utilizadas, ni sobre si se emplearon tecnicas de alineamiento, destilacion o ajuste fino especifico.

Tampoco se documentan innovaciones tecnicas adicionales, mecanismos de atencion, vocoder asociado ni detalles sobre el proceso de conversion a ONNX. La informacion disponible se limita a la cadena de custodia del modelo: autor original edwixx, modelo upstream edwixx/rapido-tts, y empaquetado por Phoonnx para su libreria phoonnx.

## Capacidades

- Sintesis de voz (text-to-speech) en portugues de Brasil a partir de texto de entrada.
- Generacion de audio mediante un modelo de flujo cuantizado en int8.
- Integracion con la libreria phoonnx, que permite ejecutar el modelo en Python y en el ecosistema OVOS.
- Normalizacion de texto y fonemizacion a traves del proyecto complementario scriptconv (grafemas pt-BR).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje.
- No se documentan capacidades multimodales adicionales (vision, audio de entrada, etc.).
- No se documenta control de emocion, estilo, hablante multiple ni clonacion de voz.

## Casos de uso

- Asistentes de voz locales en portugues de Brasil: el modelo puede integrarse en OVOS mediante phoonnx para convertir respuestas textuales en audio, aprovechando su formato ONNX y su bajo peso (0,2 GB) para ejecucion en dispositivos con recursos limitados.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o moviles: al ser un modelo TTS ligero, permite generar avisos hablados en pt-BR sin depender de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: sintesis de texto de pantalla o documentos en portugues de Brasil con un modelo de licencia permisiva que puede incorporarse a productos comerciales.
- Sistemas de megafonia o anuncios automatizados en entornos controlados: generacion de mensajes pregrabados o dinamicos en pt-BR para transporte, comercio o industria.
- Prototipado de interfaces conversacionales: al estar empaquetado para phoonnx y disponible en ONNX, permite a desarrolladores probar rapidamente pipelines de voz en Python antes de escalar a otros modelos.
- Educacion y aprendizaje de idiomas: generacion de audio de apoyo en portugues de Brasil para materiales didacticos, con la ventaja de ejecucion local y sin coste por peticion.
- Investigacion en TTS de bajos recursos: util como linea base cuantizada int8 para comparar calidad y latencia frente a otros modelos Rapido o frente a versiones fp32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,2 GB, lo que sugiere un consumo de memoria moderado, pero no se especifica la VRAM necesaria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX y la cuantizacion int8 sugieren que podria ejecutarse en GPU de gama media o incluso en CPU, pero no hay datos oficiales.
- Opciones de despliegue: libreria phoonnx (Python y OVOS); al ser ONNX, podria ejecutarse con ONNX Runtime, aunque no se documenta explicitamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| rapido-pt_br-edwixx-int8 | no disponible | no aplica | pt-BR | Apache 2.0 | ONNX | Hugging Face (25 descargas) |
| edwixx/rapido-tts (upstream) | no disponible | no aplica | pt-BR | Apache 2.0 | no disponible | Hugging Face |
| Otros modelos Rapido de la coleccion Phoonnx | no disponible | no aplica | varios | Apache 2.0 (segun coleccion) | ONNX | Hugging Face |

No se dispone de datos de rendimiento ni de parametros para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Informacion tecnica muy limitada: no se publican parametros, arquitectura detallada, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad objetivamente.
- La model card indica que el indice de voces de phoonnx no lista una voz para este modelo, lo que puede complicar su uso directo en pipelines que dependan de dicho indice.
- Idioma restringido a pt-BR; no se documenta soporte de otras variantes del portugues ni de otros idiomas.
- Riesgo de alucinacion no aplica en el sentido de modelos de lenguaje, pero si existe riesgo de pronunciacion incorrecta, artefactos de audio o prosodia deficiente, no documentados.
- Sesgos conocidos: no documentados; al no conocerse el dataset de entrenamiento, no puede evaluarse el sesgo de hablante, genero o registro.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la cadena de licencias del modelo upstream y de los grafos incluidos.
- Ausencia de garantias de calidad para produccion: sin benchmarks ni evaluaciones subjetivas publicadas, su uso en entornos criticos requiere validacion propia.
- El modelo fue creado y actualizado en noviembre de 2026 segun los metadatos, lo que puede indicar una publicacion reciente con poca validacion comunitaria (0 likes, 25 descargas).

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/rapido-pt_br-edwixx-int8
- Modelo upstream: https://huggingface.co/edwixx/rapido-tts
- Coleccion Rapido de Phoonnx: https://huggingface.co/collections/Phoonnx/rapido-6af8ecbfc1860f5bc2c6c670
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
