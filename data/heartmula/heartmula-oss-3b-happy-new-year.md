# HeartMuLa/HeartMuLa-oss-3B-happy-new-year

## Resumen

HeartMuLa-oss-3B-happy-new-year es un modelo de generacion de musica a partir de letras (text-to-audio) desarrollado por el equipo HeartMuLa. Forma parte de la familia HeartMuLa, un conjunto de modelos fundacionales de musica publicados bajo licencia Apache 2.0, e incluye 3.938.113.536 parametros (aproximadamente 3,9 mil millones) almacenados en formato safetensors. El modelo se presenta como la mejor opcion open source en cuanto a controlabilidad de letras y calidad musical, y esta disenado para convertir texto (letras de canciones y descripciones) en audio musical.

El modelo se distribuye con un ecosistema de componentes complementarios: el codec de audio HeartCodec-oss-20260123 (recomendado), el transcriptor HeartTranscriptor-oss y la libreria de inferencia heartlib, disponible en GitHub. La version "happy-new-year" se marca como la recomendada frente a la version base HeartMuLa-oss-3B. Soporta multiples idiomas (chino, ingles, japones, coreano y espanol) y esta etiquetado como pipeline text-to-audio.

Es relevante ahora porque ofrece una alternativa abierta y comercialmente permisiva (Apache 2.0) en el espacio de generacion musical, un area tradicionalmente dominada por sistemas propietarios. Su enfoque en la controlabilidad de las letras y la edicion de pasajes concretos de una cancion lo orienta a flujos de produccion musical asistida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.938.113.536 (~3,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingual, zh, en, ja, ko, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de transformer, mecanismo de atencion, diseno del decodificador de audio ni integracion con el codec). El modelo se presenta como parte de una familia de modelos fundacionales de musica y se apoya en componentes separados: HeartCodec-oss-20260123 como codec de audio y HeartTranscriptor-oss como transcriptor. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Tampoco se documentan innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. El paper asociado (arXiv:2601.10547, "HeartMuLa: A Family of Open Sourced Music Foundation Models") es la referencia para obtener detalles de arquitectura y entrenamiento, pero su contenido no esta incluido en la informacion disponible.

## Capacidades

- Generacion de musica a partir de letras (text-to-audio): convierte texto en audio musical.
- Controlabilidad de letras: el modelo se posiciona como referente open source en el control de las letras generadas.
- Creacion de covers y remixes (segun la descripcion del servicio asociado).
- Edicion de pasajes concretos de una cancion en el entorno MuLa Studio.
- Soporte multilingue en chino, ingles, japones, coreano y espanol.
- Integracion con HeartCodec-oss para la representacion y decodificacion de audio.
- Uso conjunto con HeartTranscriptor-oss para transcripcion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio de entrada: no disponible (el pipeline declarado es text-to-audio).

## Casos de uso

- Generacion de canciones a partir de letras: el modelo recibe el texto de una cancion y produce audio musical, adecuado para prototipado rapido de maquetas por parte de compositores.
- Creacion de covers y remixes: segun la descripcion del servicio, permite generar versiones alternativas de una pieza a partir de material existente, util en produccion musical y contenido para creadores.
- Edicion localizada de pasajes: la funcionalidad de editar cualquier pasaje de una cancion en MuLa Studio permite corregir o regenerar secciones concretas sin rehacer la pieza completa.
- Produccion musical asistida en varios idiomas: al soportar zh, en, ja, ko y es, sirve para generar contenido musical localizado para distintos mercados.
- Investigacion en modelos fundacionales de musica: al ser open source y Apache 2.0, es una base para experimentacion academica en generacion de audio y evaluacion de controlabilidad de letras.
- Integracion en pipelines de creacion de contenido: mediante la libreria heartlib y los componentes HeartCodec y HeartTranscriptor, puede incorporarse en flujos automatizados de generacion y transcripcion de audio.
- Despliegue local sin dependencia de servicios en la nube: el repositorio heartlib ofrece quickstart y despliegue local, lo que facilita entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con ~3,9 B de parametros, la huella de pesos en precision completa ronda los 15,8 GB (tamano del repo), pero no se documentan requisitos oficiales ni cuantizaciones.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se especifica.
- Opciones de despliegue: la model card remite a la libreria heartlib (GitHub) para quickstart y despliegue local. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de generacion musical open source. La comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HeartMuLa-oss-3B-happy-new-year | ~3,9 B | no disponible | Apache 2.0 | Version recomendada de la familia |
| HeartMuLa-oss-3B | no disponible | no disponible | Apache 2.0 | Version base de la familia |
| Alternativas de terceros | no disponible | no disponible | no disponible | Sin datos en la informacion disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse con datos musicales multilingues, es previsible que refleje sesgos de las culturas e idiomas representados en el dataset, pero no se detalla.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en generacion musical, el riesgo se traduce en desviaciones respecto a las letras o instrucciones dadas.
- Limitaciones de contexto o idioma: solo se declaran cinco idiomas (zh, en, ja, ko, es); el rendimiento en otros idiomas no esta documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los componentes auxiliares (HeartCodec, HeartTranscriptor) y de los datos de entrenamiento.
- Caveats para produccion: no se publican requisitos de hardware, latencia ni benchmarks; la evaluacion de calidad musical es subjetiva y no se aportan metricas objetivas.
- La informacion sobre arquitectura y entrenamiento es escasa; para decisiones de produccion es necesario consultar el paper y el repositorio heartlib.

## Enlaces

- Hugging Face: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- Version base: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- Codec recomendado: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Codec base: https://huggingface.co/HeartMuLa/HeartCodec-oss
- Transcriptor: https://huggingface.co/HeartMuLa/HeartTranscriptor-oss
- Repositorio GitHub: https://github.com/HeartMuLa/heartlib
- Paper: https://arxiv.org/abs/2601.10547
- Demo: https://heartmula.github.io/
- Sitio web: https://heartmula.com/
- Contacto: contact@mulalabs.ai
