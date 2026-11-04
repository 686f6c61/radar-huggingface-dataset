# bboldpilot/zils-mini-b2

## Resumen

Zils mini b2 (identificado en el repositorio como "Zils d3-mini soup body: Senova-4B") es un reempaquetado del modelo WangSenQWQ/Senova-4B, publicado por el usuario bboldpilot. No se trata de un entrenamiento nuevo ni de un ajuste fino: los pesos de lenguaje son los del modelo original, sin modificar, y el autor lo declara explicitamente en la model card. El repositorio redistribuye esos pesos bajo licencia Apache 2.0, conservando los ficheros LICENSE/NOTICE originales.

El proposito del paquete es servir como "soup body" (cuerpo base) para la subred Zils de Bittensor (SN127), en el pool d3-mini. Es decir, es una pieza de infraestructura pensada para integrarse en el ecosistema de mineros y validadores de esa subred, no un modelo generalista orientado a uso directo por desarrolladores. Los tags del repositorio (zils, soup-body, decision-model) confirman ese encuadre.

El modelo cuenta con 4.539.265.536 parametros (aproximadamente 4,54 mil millones) segun los pesos en safetensors, y el repositorio ocupa 9,1 GB. No se dispone de informacion sobre arquitectura interna, longitud de contexto ni datos de entrenamiento en la informacion proporcionada, mas alla de que hereda las caracteristicas del modelo base Senova-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de WangSenQWQ/Senova-4B) |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | WangSenQWQ/Senova-4B (revision e0eb092f25f786aeb04fae54800b173ac03616c9) |
| Tamano del repositorio | 9,1 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en los datos disponibles. Al ser un reempaquetado de WangSenQWQ/Senova-4B, su arquitectura, datos de entrenamiento y proceso de alineamiento (RLHF, DPO u otros) corresponden integramente al modelo original, sobre el que no se aportan detalles en este repositorio. El autor indica de forma explicita que los pesos de lenguaje no han sido modificados y que todo el credito corresponde a los autores originales.

La unica intervencion realizada es el reempaquetado como "soup body" para el pool d3-mini de la subred Zils (Bittensor SN127). No consta ningun proceso adicional de entrenamiento, destilacion, fusion de modelos ni ajuste fino en la informacion proporcionada.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Senova-4B, si bien no se detallan en la informacion disponible.
- Razonamiento y codigo: no disponible (sin datos especificos en el repositorio).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; los idiomas no estan declarados en los metadatos.
- Modo thinking, vision o audio: no disponible.
- Integracion en la subred Zils (Bittensor SN127): el modelo esta empaquetado especificamente como cuerpo base para el pool d3-mini de esa subred.

## Casos de uso

- Participacion en la subred Zils de Bittensor (SN127): el modelo se distribuye como "soup body" para el pool d3-mini, por lo que su uso previsto es servir de base a mineros o validadores de esa subred que necesiten un cuerpo de 4,54 B parametros con licencia permisiva.
- Experimentacion con el modelo base Senova-4B: al conservar los pesos originales sin modificar, el repositorio permite obtener una copia del modelo base en formato safetensors con licencia Apache 2.0 para pruebas locales.
- Despliegue en entornos con recursos moderados: con 4,54 B parametros, el modelo es candidato a inferencia en una sola GPU de gama alta consumer, aunque no se dispone de datos de contexto ni de cuantizaciones publicadas que permitan confirmar requisitos exactos.
- Integracion en pipelines de investigacion sobre Bittensor: util para estudiar como se estructuran los "soup body" y los pools de subredes en el ecosistema SN127.
- Base para ajuste fino posterior: al ser un modelo de 4,54 B con licencia Apache 2.0, puede servir como punto de partida para tareas especificas, siempre que se validen antes sus capacidades reales.
- Redistribucion y auditoria de licencias: el repositorio incluye los ficheros LICENSE/NOTICE originales, lo que facilita tareas de cumplimiento en entornos que exigen trazabilidad de licencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (4,54 B parametros), en FP16 se requeririan aproximadamente 9 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, unos 4,5-5 GB; en 4 bits, unos 2,5-3 GB. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamano, cabria esperar viabilidad en GPUs consumer de gama alta (por ejemplo, RTX 3090/4090 con 24 GB) en FP16, y en GPUs de 8-16 GB con cuantizacion, pero no hay confirmacion oficial.
- Compatibilidad con consumer GPU: probable por tamano, sin confirmacion en la informacion disponible.
- Opciones de despliegue: no se especifican en el repositorio. Al distribuirse en safetensors, seria compatible con frameworks estandar (transformers, vLLM, TGI) siempre que la arquitectura del modelo base este soportada; no se incluyen pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de alternativas directamente comparables en la informacion proporcionada. La comparacion se limita a parametros, contexto y licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Zils mini b2 (este) | 4,54 B | no disponible | Apache 2.0 | HuggingFace (0 descargas) |
| WangSenQWQ/Senova-4B (base) | no disponible (origen de los pesos) | no disponible | no disponible en esta ficha | HuggingFace |
| Alternativas de ~4 B | no disponible | no disponible | no disponible | no disponible |

No se conocen modelos comparables adicionales con datos verificables en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: es un reempaquetado de Senova-4B. Cualquier limitacion del modelo base se hereda sin cambios.
- Ausencia total de documentacion tecnica: no se declaran arquitectura, contexto, idiomas, cuantizaciones ni capacidades, lo que dificulta evaluar su idoneidad para produccion.
- Cero traccion en el repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos: no evaluados; al no haber benchmarks ni evaluaciones publicadas, no puede descartarse ninguno de los sesgos tipicos de los modelos de lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar avisos de copyright y licencia; el repositorio incluye los ficheros LICENSE/NOTICE originales, que deben mantenerse en cualquier redistribucion.
- Dependencia del modelo base: si WangSenQWQ/Senova-4B cambia de licencia o desaparece, la trazabilidad del paquete puede verse afectada, aunque la revision concreta utilizada esta fijada en la model card.
- Uso previsto muy especifico: esta pensado para la subred Zils (Bittensor SN127), pool d3-mini; su uso fuera de ese contexto no esta documentado ni validado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bboldpilot/zils-mini-b2
- Modelo base: https://huggingface.co/WangSenQWQ/Senova-4B
- Revision del modelo base utilizada: e0eb092f25f786aeb04fae54800b173ac03616c9
