# developmentseed/stac-zap-models

## Resumen

stac-zap-models es una familia de modelos pequenos publicada por Development Seed que convierte peticiones cortas en lenguaje natural en busquedas STAC (SpatioTemporal Asset Catalog) ejecutables dentro de un navegador. El caso de uso canonico es transformar una frase como "Sentinel-2 over Lisbon last summer with few clouds" en una consulta STAC valida. Sustituye a los modelos alojados Jev (decision) y Clairic (extraccion) que requerian API key y servidor, de modo que todo el pipeline pasa a ejecutarse en cliente sin infraestructura externa.

Tecnicamente, todos los modelos derivan de IBM Granite Embedding 30M English (Apache-2.0), afinado y exportado a ONNX para transformers.js. El repositorio contiene tres componentes: un bi-encoder retriever que preselecciona colecciones, un cross-encoder decider que elige coleccion, mantiene la anterior o selecciona un lugar entre resultados de geocodificacion, y un token classifier tagger que etiqueta palabras de lugar, tiempo y cobertura nubosa. Los pesos se distribuyen en fp32 y en int8 cuantizado.

El proyecto se declara explicitamente como demo de investigacion. Su relevancia actual radica en demostrar un pipeline de recuperacion geoespacial completamente local y sin dependencias de modelos cerrados, con etiquetas generadas por plantillas a partir de metadatos STAC de 33 APIs publicas, GeoNames y Natural Earth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: IBM Granite Embedding 30M English); tres cabezas: bi-encoder, cross-encoder y token classifier |
| Parametros totales | 30M (modelo base); no disponible el desglose por cabeza |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (`onnx/model_quantized.onnx`, calculado en fp32) y fp32 (`onnx/model.onnx`) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (para transformers.js); el repo incluye tambien safetensors |

## Arquitectura y entrenamiento

La familia se construye sobre un unico backbone de tipo transformer encoder de 30M parametros (Granite Embedding 30M English) al que se anaden tres cabezas especializadas. El retriever es un bi-encoder que genera un vector CLS normalizado para preseleccionar colecciones entre todos los catalogos conocidos. El decider es un cross-encoder que, dada la peticion y la lista corta, elige una coleccion (de la que se deriva el catalogo), mantiene la seleccion previa (`keep`) o escoge un lugar entre los resultados del geocodificador; incluye un `decider.json` con temperaturas por pregunta. El tagger es un clasificador de tokens con etiquetas BIO (`B-/I-PLACE`, `TIME`, `CLOUD`) cuyas marcas se convierten en valores mediante codigo.

Los datos de entrenamiento se generan a partir de plantillas con etiquetas exactas, usando metadatos de colecciones STAC de 33 APIs publicas, lugares de GeoNames (CC BY 4.0) y Natural Earth (dominio publico). El autor declara explicitamente que no se empleo ninguna salida de modelos cerrados (Jev, Clairic, Claude u otros) en el entrenamiento. Existen ejecuciones v1 y v2, que piden primero el catalogo, y v3 a v5, en las que el catalogo se deriva de la coleccion; la demo usa v5. Esta prevista una ejecucion con backbone compartido (un encoder y tres cabezas). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificacion de texto orientada a la construccion de consultas STAC a partir de peticiones cortas en ingles.
- Recuperacion de colecciones candidatas mediante embeddings (bi-encoder con vector CLS normalizado).
- Seleccion de coleccion o mantenimiento de la anterior mediante cross-encoder, incluida la eleccion de un lugar entre resultados del geocodificador.
- Extraccion de entidades a nivel de token: lugar, tiempo y cobertura nubosa.
- Ejecucion integra en navegador mediante transformers.js y ONNX, sin API key ni servidor.
- Soporte de cuantizacion int8 para reducir el coste de inferencia en cliente.
- Capacidades multilingues: no disponibles; el modelo es solo en ingles.
- Tool calling, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision y audio: no disponibles; el modelo es un clasificador, no un generador.

## Casos de uso

- Busqueda geoespacial en aplicaciones web sin backend: el pipeline completo (retriever, decider y tagger) corre en el navegador con transformers.js, de modo que una aplicacion de consulta de imagenes satelitales puede ofrecer busqueda en lenguaje natural sin exponer claves de API ni mantener servidores de inferencia.
- Cliente STAC ligero para exploracion de catalogos: el retriever preselecciona colecciones de todos los catalogos conocidos y el decider fija coleccion y catalogo, lo que permite construir un buscador que funcione contra 33 APIs publicas STAC sin conocer su estructura de antemano.
- Extraccion de parametros de consulta en formularios: el tagger marca lugar, rango temporal y nubosidad, y el codigo los convierte en valores de filtro STAC, util para autocompletar consultas en herramientas de analisis de observacion de la Tierra.
- Prototipado de asistentes de datos satelitales: al ser una demo de investigacion con licencia Apache-2.0, sirve como base para experimentar con recuperacion local de colecciones antes de invertir en infraestructura o modelos mayores.
- Despliegue en entornos con restricciones de privacidad: al no enviar la peticion del usuario a ningun servicio externo, encaja en escenarios donde las consultas no pueden salir del cliente.
- Seleccion de lugar entre candidatos del geocodificador: el decider puede escoger entre resultados ambiguos (por ejemplo, distintas localidades con el mismo nombre) segun el contexto de la peticion, integrable en flujos de geocodificacion asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye ficheros `reports/report-<run>.json` con ajustes de entrenamiento y puntuaciones de test de cada ejecucion, pero sus valores no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 30M parametros, los pesos en fp32 ocupan aproximadamente 120 MB y en int8 alrededor de 30 MB, cifras orientativas calculadas a partir del tamano del modelo base.
- GPU recomendadas: no disponibles; el diseno apunta a ejecucion en navegador (CPU o aceleracion web), por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: transformers.js con ONNX; el autor no menciona vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de clasificador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Ejecucion local |
|---|---|---|---|---|---|
| developmentseed/stac-zap-models | 30M (base) | no disponible | Clasificacion y recuperacion para consultas STAC | Apache-2.0 | Si, en navegador (ONNX/transformers.js) |
| ibm-granite/granite-embedding-30m-english | 30M | no disponible | Embeddings de texto | Apache-2.0 | Si |
| Jev (modelo alojado, decision) | no disponible | no disponible | Decision de busqueda STAC | no disponible | No, requiere API |
| Clairic (modelo alojado, extraccion) | no disponible | no disponible | Extraccion de parametros | no disponible | No, requiere API |

La comparativa con alternativas de la misma categoria (clasificadores ligeros para consultas geoespaciales) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: las peticiones en otros idiomas no estan soportadas.
- Peticiones basadas en plantillas: las consultas por tema ("drone imagery", "wildfires in Los Angeles") funcionan mal, segun el propio autor.
- La eleccion de lugar sigue el orden del geocodificador, lo que puede producir ambiguedades ("Perth" puede resolver a Perth, Escocia).
- Los modelos solo eligen entre las colecciones que se les proporcionan; no mantienen una lista propia de catalogos.
- Estado de demo de investigacion: los resultados y limites se documentan en `docs/local-model.md` de stac-zap (rama `phase0-local-model`), sin garantias de robustez para produccion.
- El dataset de entrenamiento (`developmentseed/stac-zap-data`) es privado hasta completar la revision de licencia, lo que limita la reproducibilidad.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; al ser un clasificador con etiquetas de plantilla, el riesgo principal es la clasificacion erronea, no la generacion libre.
- Licencia Apache-2.0: permite uso comercial, pero el caracter de demo y la falta de benchmarks publicos desaconsejan su uso en produccion sin evaluacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/developmentseed/stac-zap-models
- Repositorio stac-zap: https://github.com/developmentseed/stac-zap
- Plan del proyecto (PLAN.md): https://github.com/developmentseed/stac-zap/blob/main/PLAN.md
- Documentacion de limites (`docs/local-model.md`, rama `phase0-local-model`): https://github.com/developmentseed/stac-zap/blob/phase0-local-model/docs/local-model.md
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-30m-english
- transformers.js: https://github.com/huggingface/transformers.js
- Development Seed: https://developmentseed.org
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/developmentseed/stac-zap-data
