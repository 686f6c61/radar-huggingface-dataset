# Honkware/NorthCUA-Mini-exl3-4.0bpw

## Resumen

NorthCUA-Mini-exl3-4.0bpw es una cuantizacion en formato EXL3 a 4.0 bits por peso del modelo base beipo-ai/NorthCUA-Mini, publicada por el usuario Honkware. El modelo base pertenece a la familia NorthCUA de beipo-ai, orientada a la automatizacion de tareas de escritorio (computer use agents, CUA), segun se deduce del repositorio GitHub del proyecto. La cuantizacion reduce el peso del modelo a 19,1 GB, lo que facilita su despliegue en hardware con VRAM limitada manteniendo el comportamiento del modelo original.

El modelo cuenta con 9.489.597.440 parametros totales segun los metadatos de safetensors, y la model card lo etiqueta como "Dense" pese a que el tag de arquitectura es `qwen3_5_moe`. Esta discrepancia entre la etiqueta de la model card y el tag de arquitectura debe tenerse en cuenta: la informacion disponible no permite confirmar si se trata de un transformer denso o de una mezcla de expertos. La arquitectura declarada es Qwen3.5 MoE, lo que sugiere una base derivada de la familia Qwen3.5.

La relevancia de esta ficha radica en que se trata de una cuantizacion de un modelo orientado a agentes de escritorio, un nicho en crecimiento, y en que el formato EXL3 requiere herramientas especificas (ExLlamaV3, TabbyAPI o text-generation-webui) para su inferencia. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales por parte del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (segun tag); la model card indica "Dense" |
| Parametros totales | 9.489.597.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4.0 bits por peso (head bits 6, codebook mul1, out-scales always) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cuantizacion EXL3 (libreria exllamav3) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de los tags. El tag `qwen3_5_moe` apunta a una arquitectura de tipo mezcla de expertos basada en Qwen3.5, mientras que la model card del cuantizador describe el modelo como "Dense". No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El repositorio GitHub del proyecto NorthCUA menciona un informe tecnico en arXiv que describe el sistema completo y sus resultados, pero no se ha incluido su contenido en la informacion proporcionada.

La innovacion tecnica destacable de esta publicacion es la cuantizacion EXL3: 4.0 bits por peso, 6 bits para las cabezas, calibracion con 250 filas sobre una mezcla de datos (c4, code, multilingual, technical, tiny, wiki), codebook mul1 y out-scales siempre activos. La model card reporta una KL mediana sobre wiki2 de 0,0315 para esta cuantizacion, un dato util para evaluar la perdida de fidelidad respecto al modelo original.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (`text-generation`, `conversational`).
- Orientacion a tareas de agente de escritorio (computer use), segun el nombre y el repositorio del proyecto NorthCUA.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: plausible por el proposito del proyecto, pero no confirmado en los datos disponibles.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Automatizacion de tareas de escritorio: el modelo esta disenado para interpretar intenciones y ejecutar acciones sobre entornos de escritorio, por lo que encaja en pipelines de agentes que controlan aplicaciones y ventanas.
- Asistente conversacional local: con 19,1 GB en formato EXL3, puede servirse mediante TabbyAPI con una API compatible con OpenAI y usarse como backend de un asistente interno.
- Prototipado de agentes con tool calling: si el modelo base lo soporta, la cuantizacion permite desplegarlo en una estacion de trabajo con una unica GPU y probar flujos de herramientas sin depender de servicios en la nube.
- Evaluacion de cuantizaciones: la KL mediana de 0,0315 sobre wiki2 permite comparar esta variante con otras bit-widths de la coleccion del cuantizador para decidir el equilibrio entre tamano y fidelidad.
- Investigacion sobre agentes CUA: el modelo puede servir como base para experimentos academicos sobre computer use agents, dado que el proyecto publica un informe tecnico en arXiv.
- Despliegue en entornos con privacidad de datos: al ejecutarse en local con ExLlamaV3, evita enviar datos de escritorio a APIs externas, lo que resulta adecuado para entornos corporativos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la KL mediana sobre wiki2 de 0,0315 reportada por el cuantizador para esta variante de 4.0 bpw.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,1 GB de pesos mas overhead de contexto y cache KV; se recomienda al menos 24 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100; cualquier GPU con 24 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 (24 GB), con margen limitado para contextos largos.
- Opciones de despliegue: ExLlamaV3 (API Python), TabbyAPI (servidor HTTP compatible con OpenAI), text-generation-webui (loader ExLlamaV3).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NorthCUA-Mini-exl3-4.0bpw | 9.489.597.440 | no disponible | EXL3 4.0 bpw | Apache 2.0 | Hugging Face (Honkware) |
| beipo-ai/NorthCUA-Mini | no disponible | no disponible | safetensors (original) | Apache 2.0 | Hugging Face (beipo-ai) |
| Otras variantes de la coleccion NorthCUA-Mini EXL3 | no disponible | no disponible | EXL3 a otras bit-widths | Apache 2.0 | Coleccion de Honkware |

No se dispone de datos de rendimiento comparado con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La model card etiqueta el modelo como "Dense" mientras que el tag de arquitectura indica `qwen3_5_moe`; conviene verificar la arquitectura real antes de planificar el despliegue.
- La cuantizacion a 4.0 bpw introduce perdida de fidelidad respecto al modelo original, cuantificada en una KL mediana de 0,0315 sobre wiki2; para tareas sensibles a la precision puede ser preferible una variante de mayor bit-width.
- El formato EXL3 solo es compatible con ExLlamaV3 y sus integraciones (TabbyAPI, text-generation-webui); no funciona con vLLM, llama.cpp, Ollama ni TGI.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de idioma del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda consultar la documentacion de seguridad y los terminos del repositorio upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face (cuantizacion): https://huggingface.co/Honkware/NorthCUA-Mini-exl3-4.0bpw
- Modelo base: https://huggingface.co/beipo-ai/NorthCUA-Mini
- Repositorio GitHub del proyecto: https://github.com/beipo-ai/NorthCUA
- Coleccion de cuantizaciones: https://huggingface.co/collections/Honkware/northcua-mini-exl3-6aee18fb4b5bfe70d170327f
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- BlockQuant: https://github.com/Honkware/blockquant
