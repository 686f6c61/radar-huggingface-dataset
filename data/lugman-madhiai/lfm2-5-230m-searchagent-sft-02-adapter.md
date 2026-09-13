# lugman-madhiai/LFM2.5-230M-SearchAgent-SFT-02-adapter

## Resumen

Este repositorio contiene un adaptador de ajuste fino (fine-tuning) publicado por el usuario lugman-madhiai sobre el modelo base LiquidAI/LFM2.5-230M, un modelo denso de 230 millones de parametros de la familia LFM2 de Liquid AI. El propio nombre del repositorio, SearchAgent-SFT-02-adapter, indica que se trata de un adaptador derivado de un proceso de supervised fine-tuning (SFT) orientado a tareas de agente de busqueda, y la etiqueta adapter junto con un tamano de repositorio de 0,0 GB confirman que no se distribuyen los pesos completos del modelo, sino unicamente los pesos del adaptador.

El adaptador se entreno con el framework Unsloth, segun declara la model card, y utiliza las librerias transformers y TRL, con pesos en formato safetensors y compatibilidad declarada con text-generation-inference. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. No se especifica ni el dataset de entrenamiento, ni el numero de tokens, ni los hiperparametros utilizados.

Su relevancia actual es limitada y debe interpretarse con cautela: el repositorio no tiene descargas ni interacciones, no publica evaluaciones y no documenta el procedimiento de entrenamiento mas alla de la mencion a Unsloth. Resulta util como ejemplo de adaptacion de un modelo pequeno de la familia LFM2 para flujos de agente con busqueda, pero no como artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo base: LiquidAI/LFM2.5-230M, familia LFM2 de Liquid AI; este repositorio contiene un adaptador, no el modelo completo) |
| Parametros totales | 230M en el modelo base; el adaptador no declara su numero de parametros entrenables |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados son safetensors de adaptador; no se listan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador; tamano de repositorio 0,0 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la documentacion facilitada. El adaptador se construye sobre LiquidAI/LFM2.5-230M, un modelo de 230 millones de parametros de la familia LFM2 de Liquid AI, y el repositorio no describe la arquitectura interna del modelo base ni sus innovaciones tecnicas. Al tratarse de un adaptador, la arquitectura efectiva en inferencia es la del modelo base mas las capas adicionales del adaptador.

En cuanto al entrenamiento, lo unico documentado es que se realizo un SFT con Unsloth (que la model card describe como "2x faster") utilizando TRL, y que el resultado es la segunda iteracion de un adaptador orientado a agente de busqueda, segun el sufijo SFT-02 del nombre. No se indica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni la existencia de tecnicas como decodificacion especulativa o atencion lineal. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto en ingles a partir del modelo base LFM2.5-230M, con el adaptador aplicado por encima.
- Ajuste orientado a comportamiento de agente de busqueda (search agent), segun el nombre del repositorio y la etiqueta de la model card.
- Compatibilidad declarada con text-generation-inference y con el ecosistema transformers, lo que facilita su integracion en pipelines de inferencia estandar.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: presumible por el nombre SearchAgent, pero no documentado ni evaluado.
- Capacidades multilingues: no disponibles; solo se declara ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de agentes de busqueda: el adaptador puede cargarse sobre LFM2.5-230M para experimentar con flujos de consulta-respuesta donde un agente formula busquedas y sintetiza resultados, en un entorno de bajo coste computacional.
- Experimentacion academica con SFT: sirve como referencia reproducible para estudiar como un adaptador entrenado con Unsloth y TRL modifica el comportamiento de un modelo de 230M en tareas de agente.
- Evaluacion comparativa de adaptadores: al ser un artefacto pequeno, permite comparar distintas iteraciones de ajuste (SFT-01 frente a SFT-02) sobre el mismo modelo base sin grandes requisitos de almacenamiento.
- Despliegue en entornos con recursos muy limitados: un modelo de 230M mas un adaptador cabe en GPUs de gama baja o incluso en CPU para tareas de generacion no interactiva.
- Generacion de texto auxiliar en ingles: tareas de resumen, reescritura o extraccion de informacion donde no se requiera alta fidelidad factual, asumiendo el riesgo de alucinacion propio de un modelo de este tamano.
- Base para posteriores ajustes: el adaptador puede servir como punto de partida para nuevos ciclos de SFT con datasets propios de dominio, dado que la licencia Apache 2.0 lo permite.
- Docencia y divulgacion: ejemplo practico de publicacion de un adaptador en HuggingFace con metadatos minimos y entrenamiento via Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 230M de parametros del modelo base, no declarada por el autor):
  - FP16/BF16: aproximadamente 0,5 GB solo para pesos, mas activaciones y cache KV.
  - INT8: aproximadamente 0,25 GB para pesos.
  - 4 bits: aproximadamente 0,15 GB para pesos.
- GPU recomendadas: cualquier GPU consumer reciente es suficiente; una RTX 3060 de 12 GB o superior cubre el modelo con amplio margen. No se requieren A100 ni H100 para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, y tambien en CPU para inferencia por lotes.
- Opciones de despliegue: transformers y text-generation-inference estan declarados como compatibles. llama.cpp, Ollama o vLLM no estan confirmados en la informacion disponible, ya que no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni de contexto de los modelos comparables, por lo que la comparacion se limita a parametros y licencia a nivel de familia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lugman-madhiai/LFM2.5-230M-SearchAgent-SFT-02-adapter (este) | 230M (base) | No disponible | Apache 2.0 | Adaptador en HuggingFace |
| LiquidAI/LFM2.5-230M (modelo base) | 230M | No disponible | No disponible en la informacion facilitada | Pesos completos en HuggingFace |
| LiquidAI/LFM2-350M | 350M | No disponible | No disponible en la informacion facilitada | Pesos completos en HuggingFace |
| Qwen2.5-0.5B | 0,5B | No disponible | No disponible en la informacion facilitada | Pesos completos en HuggingFace |
| SmolLM2-360M | 360M | No disponible | No disponible en la informacion facilitada | Pesos completos en HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este adaptador con el de las alternativas citadas.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 interacciones, por lo que carece de validacion por parte de la comunidad.
- No se publican resultados de evaluacion; no hay evidencia de mejora respecto al modelo base en ninguna tarea.
- No se documenta el dataset de entrenamiento, el numero de pasos ni los hiperparametros, lo que impide reproducir el ajuste.
- Al ser un adaptador, requiere descargar y cargar por separado LiquidAI/LFM2.5-230M; no es un modelo autonomo.
- El unico idioma declarado es el ingles; el rendimiento en castellano no esta documentado y previsiblemente sera pobre en un modelo de 230M.
- Riesgo elevado de alucinacion y de errores factuales, inherente a un modelo de 230M de parametros.
- El ajuste especifico para agente de busqueda puede degradar capacidades generales del modelo base (olvido catastrofico), especialmente en un modelo tan pequeno.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar tambien la licencia del modelo base antes de un despliegue en produccion.
- Las fechas de creacion y actualizacion del repositorio (2026-09-12) son posteriores a la fecha habitual de publicacion de este tipo de artefactos, lo que sugiere metadatos poco fiables o desincronizados; no deben tomarse como referencia.
- La busqueda web realizada no ha devuelto documentacion tecnica relevante sobre este modelo: los resultados obtenidos corresponden a foros sin relacion con el tema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/LFM2.5-230M-SearchAgent-SFT-02-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Unsloth (framework de entrenamiento declarado): https://github.com/unslothai/unsloth
- Paper, blog, repositorio o demo del autor: no disponibles en la informacion proporcionada.
