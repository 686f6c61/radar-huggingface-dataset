# ibm-granite/granite-4.0-1b-GGUF

## Resumen

Granite-4.0-1b-GGUF es la distribucion en formato GGUF del modelo base ibm-granite/granite-4.0-1b, desarrollado por IBM dentro de la familia Granite 4.0. Este repositorio no contiene un modelo nuevo, sino la conversion del modelo original a cuantizaciones GGUF para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio, servidores OpenAI-compatibles). El modelo base cuenta con 1.631.750.144 parametros (aproximadamente 1,6 mil millones) y esta orientado a generacion de texto conversacional.

La relevancia de esta distribucion radica en que permite ejecutar el modelo en hardware modesto, incluido CPU y GPUs de consumo, manteniendo la licencia permisiva Apache 2.0 del modelo original. Al estar empaquetado en GGUF y etiquetado como compatible con endpoints, se puede desplegar rapidamente como servicio local con API estilo OpenAI mediante `llama serve`, lo que facilita prototipado y despliegues en el borde.

La informacion publica disponible en este repositorio es limitada: la model card remite explicitamente a la ficha del modelo base para especificaciones completas. Los datos de arquitectura, contexto, entrenamiento y benchmarks no se detallan en esta pagina y deben consultarse en la ficha del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ibm-granite/granite-4.0-1b) |
| Parametros totales | 1.631.750.144 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | multiples cuantizaciones GGUF (BF16 incluida; resto no detallado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible en este repositorio no detalla la arquitectura interna del modelo base. Se trata de un modelo de lenguaje de 1,6 mil millones de parametros distribuido por IBM bajo la familia Granite 4.0, pero la model card de esta conversion GGUF no especifica si emplea un transformer denso convencional, atencion lineal u otra variante, ni el numero de capas, dimensiones ocultas o cabezas de atencion.

Tampoco se documentan en esta pagina los datos de entrenamiento (numero de tokens, composicion del corpus, fases de RLHF/DPO o alineacion) ni innovaciones tecnicas especificas. Toda esta informacion debe consultarse en la ficha del modelo base en https://huggingface.co/ibm-granite/granite-4.0-1b. Lo unico verificable aqui es el proceso de conversion a GGUF, realizado con una build de llama.cpp etiquetada como `b11798` y con Transformers `5.20.2`, lo que indica compatibilidad con versiones recientes del ecosistema llama.cpp.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y soporta el formato de chat mediante la API `/v1/chat/completions`.
- Ejecucion local mediante llama.cpp: disponible a traves de `llama cli` (interactivo o single-turn) y `llama serve` (servidor HTTP con API compatible con OpenAI).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con plataformas de despliegue que consumen APIs estilo OpenAI.
- Capacidades especificas de razonamiento, codigo, matematicas, tool calling, agentes o vision: no disponibles en la informacion proporcionada para este repositorio.
- Capacidades multilingues: no disponibles.
- Modos especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales: gracias a su tamano de 1,6 mil millones de parametros y al formato GGUF, se puede ejecutar en un portatil o estacion de trabajo sin GPU dedicada, permitiendo iterar sobre prompts y flujos de chat con `llama cli` antes de escalar a modelos mayores.
- Servicio de inferencia local con API OpenAI: mediante `llama serve` se expone un endpoint `/v1/chat/completions` que permite integrar el modelo en aplicaciones existentes escritas para la API de OpenAI sin cambios de codigo significativos.
- Despliegue en el borde (edge computing): el reducido numero de parametros y las cuantizaciones GGUF permiten ejecutar el modelo en dispositivos con recursos limitados, como mini-PC, Raspberry Pi de gama alta o entornos embebidos con CPU.
- Clasificacion y resumen de texto en pipelines internos: para tareas de procesamiento por lotes donde la privacidad impide enviar datos a APIs externas, el modelo puede desplegarse on-premise y procesar documentos localmente.
- Generacion de respuestas en asistentes de documentacion tecnica: con un contexto que debe verificarse en el modelo base, puede emplearse para responder preguntas frecuentes sobre productos o APIs a partir de fragmentos recuperados (RAG sencillo).
- Educacion y experimentacion: al ser un modelo pequeno con licencia Apache 2.0, es adecuado para cursos, talleres y experimentos de ajuste fino o cuantizacion sin restricciones comerciales.
- Base para fine-tuning ligero: el modelo base subyacente puede servir como punto de partida para tareas especificas de dominio, aunque el repositorio GGUF en si no esta pensado para entrenamiento sino para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. La model card remite a la ficha del modelo base para datos de evaluacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el tamano del modelo (1,63 mil millones de parametros), una cuantizacion de 4 bits ocuparia aproximadamente 1 GB de pesos, una de 8 bits en torno a 1,7 GB y BF16 alrededor de 3,3 GB, a lo que hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: no especificadas. Por tamano, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y similares con al menos 4-8 GB de VRAM para cuantizaciones bajas.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs modernas con 4 GB o mas de VRAM, aunque este dato no esta confirmado oficialmente en la informacion proporcionada.
- Opciones de despliegue: llama.cpp (`llama cli` y `llama serve`), y por compatibilidad GGUF, herramientas como Ollama o LM Studio. No se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni especificaciones completas del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoria. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| granite-4.0-1b-GGUF | 1.631.750.144 | no disponible | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card de este repositorio no documenta sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma; esta informacion debe consultarse en la ficha del modelo base.
- Al ser un modelo de 1,6 mil millones de parametros, es previsible una capacidad de razonamiento y conocimiento factual inferior a la de modelos de mayor tamano, aunque no se aportan datos concretos que lo cuantifiquen.
- No se especifica la longitud de contexto soportada, lo que impide garantizar su comportamiento en conversaciones o documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la ficha del modelo base por si IBM anade terminos adicionales de uso aceptable.
- El repositorio contiene multiples cuantizaciones (21,7 GB en total), por lo que conviene descargar unicamente el archivo GGUF necesario para evitar consumos de disco y ancho de banda innecesarios.
- La fecha de actualizacion del repositorio (2026-11-19) es posterior a la de creacion (2025-10-23), lo que sugiere posibles revisiones; conviene verificar la build de llama.cpp recomendada (`b11798`) para reproducibilidad.
- No se garantiza compatibilidad con versiones antiguas de llama.cpp; se recomienda usar una build igual o superior a la indicada.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/ibm-granite/granite-4.0-1b-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Referencia de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
