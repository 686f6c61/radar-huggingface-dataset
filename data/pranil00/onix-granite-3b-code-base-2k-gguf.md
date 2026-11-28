# pranil00/ONIX-granite-3b-code-base-2k-GGUF

## Resumen

ONIX-granite-3b-code-base-2k-GGUF es una cuantizacion en formato GGUF (Q5_K_M) del modelo base ibm-granite/granite-3b-code-base-2k de IBM, publicada por el usuario pranil00 bajo la etiqueta de comunidad "ONIX". El modelo original es un transformer decoder-only de 3.482.503.680 parametros orientado a generacion de codigo, con una ventana de contexto de 2.048 tokens (segun el sufijo "2k" del identificador del modelo base). Esta version cuantizada reduce el peso a aproximadamente 2,32 GB, lo que la hace desplegable en hardware de consumo.

La relevancia de esta ficha es practica: permite ejecutar un modelo de codigo de IBM en local mediante llama.cpp u Ollama sin necesidad de GPU de datacenter. La cuantizacion Q5_K_M es un compromiso habitual entre calidad y tamano, con perdida de precision moderada respecto a los pesos originales en safetensors.

No obstante, la model card es extremadamente escueta: no documenta el proceso de cuantizacion mas alla de indicar que se realizo en Apple Silicon con Metal, no aporta resultados de evaluacion tras la cuantizacion y no especifica idiomas soportados. Cualquier uso en produccion deberia validarse contra el modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base; no detallada en la model card) |
| Parametros totales | 3.482.503.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (inferida del identificador del modelo base "2k") |
| Tipos de cuantizacion | Q5_K_M (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base ibm-granite/granite-3b-code-base-2k, un transformer decoder-only de aproximadamente 3.500 millones de parametros especializado en codigo. La model card de esta cuantizacion no reproduce la informacion de entrenamiento del modelo original (composicion del dataset, numero de tokens, uso de RLHF o DPO), por lo que esos datos deben consultarse en la ficha del modelo base de IBM.

La unica innovacion tecnica documentada en este repositorio es el proceso de cuantizacion: conversion de tensores verificada mediante llama.cpp y realizada en Apple Silicon con Metal. No se indica el algoritmo exacto mas alla de la designacion Q5_K_M, ni se aportan metricas de perplejidad o calidad comparativa frente a los pesos originales.

## Capacidades

- Generacion de texto y codigo: el modelo base esta especializado en tareas de programacion (completado, generacion y posiblemente explicacion de codigo).
- Razonamiento sobre codigo: al ser un modelo "code-base", esta orientado a continuacion de secuencias mas que a instrucciones conversacionales.
- Tool calling / function calling: no documentado en la model card; no debe asumirse.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el modelo base esta centrado en codigo, donde los lenguajes de programacion son el eje principal.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Autocompletado de codigo en local: integrado en editores mediante llama.cpp u Ollama, el modelo puede sugerir continuaciones de codigo sin enviar datos a la nube, gracias a su tamano reducido (2,32 GB) y su contexto de 2.048 tokens.
- Asistente de codigo en entornos con GPU de consumo: desplegable en una RTX 3060 o superior, permite generar fragmentos de codigo y plantillas en flujos de desarrollo individuales.
- Prototipado rapido de pipelines de generacion de codigo: util para validar integraciones con llama.cpp antes de migrar a un modelo mayor o a la version sin cuantizar.
- Educacion y experimentacion: sirve para estudiar el comportamiento de modelos de codigo cuantizados y comparar la perdida de calidad frente a safetensors.
- Generacion de tests unitarios y snippets: el modelo puede producir codigo boilerplate y ejemplos de prueba en tareas acotadas de contexto corto.
- Despliegue en entornos air-gapped: al ser un unico fichero GGUF con licencia Apache 2.0, puede ejecutarse en maquinas sin conexion para tareas de generacion de codigo internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q5_K_M (pesos de 2,32 GB mas overhead de contexto y KV cache para 2.048 tokens).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3050, RTX 3060, RTX 4060, GTX 1660 y similares; tambien en Apple Silicon via Metal.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (ollama run pranil00/ONIX-granite-3b-code-base-2k-GGUF), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; dependen del hardware y no se documentan en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ONIX-granite-3b-code-base-2k-GGUF (este) | 3.482.503.680 | 2.048 tokens | Apache 2.0 | GGUF Q5_K_M | Cuantizacion de comunidad, sin benchmarks publicados |
| ibm-granite/granite-3b-code-base-2k (base) | 3.482.503.680 | 2.048 tokens | Apache 2.0 | safetensors | Modelo original de IBM, referencia de calidad |
| Qwen2.5-Coder-3B (referencia de categoria) | ~3.000 millones | mayor que 2k (segun variante) | Apache 2.0 en variantes abiertas | safetensors/GGUF | Alternativa de codigo de tamano similar; datos no verificados en esta busqueda |

La comparativa con Qwen2.5-Coder-3B se incluye como referencia de categoria, pero no se dispone de datos verificados en la informacion proporcionada para afirmar superioridad o inferioridad en rendimiento.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base ni de la cuantizacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en codigo puede generar APIs o funciones inexistentes.
- Contexto limitado a 2.048 tokens, insuficiente para repositorios grandes o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el enfasis del modelo base es codigo, no lenguaje natural multilingue.
- Licencia Apache 2.0 permite uso comercial, pero la cuantizacion es de un tercero (pranil00/ONIX) sin garantias de calidad ni soporte; conviene validar contra el modelo base.
- No hay resultados de benchmarks ni evaluacion de la perdida de calidad por la cuantizacion Q5_K_M.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad, lo que incrementa el riesgo de artefactos defectuosos pese a la afirmacion de "verificacion" en la model card.
- El identificador "ONIX Community" no corresponde a un organismo reconocido; tratar la procedencia con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-granite-3b-code-base-2k-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-3b-code-base-2k
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
