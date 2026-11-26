# mradermacher/EverythingLM-13b-V2-16k-GGUF

## Resumen

EverythingLM-13b-V2-16k-GGUF es la distribucion en formato GGUF del modelo EverythingLM-13b-V2-16k, desarrollado originalmente por el usuario totally-not-an-llm. Se trata de un modelo de lenguaje de 13.000 millones de parametros derivado de la familia Llama 2, ajustado mediante instrucciones sobre el dataset EverythingLM-data-V2 y con la ventana de contexto extendida a 16.000 tokens. Esta version concreta ha sido cuantizada por mradermacher para permitir su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar localmente un modelo de 13B con contexto largo en equipos con VRAM limitada, gracias a la disponibilidad de cuantizaciones desde Q2_K (5,0 GB) hasta Q8_0 (13,9 GB). El modelo base conserva la licencia Llama 2, lo que condiciona su uso comercial.

Es importante senalar que se trata de un modelo de finales de 2023 (la cuantizacion se publico en diciembre de 2024), por lo que su rendimiento queda lejos de los estandares actuales, pero sigue siendo util para experimentacion, prototipado offline y despliegues en entornos sin conectividad o con requisitos estrictos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 2) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.000 tokens (segun el nombre del modelo base) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 2 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base EverythingLM-13b-V2-16k es un transformer decoder-only de 13.000 millones de parametros construido sobre la arquitectura Llama 2, con la ventana de contexto ampliada a 16.000 tokens. El ajuste se realizo sobre el dataset EverythingLM-data-V2, un conjunto de instrucciones publicado por el mismo autor. No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Esta version concreta es una cuantizacion estatica (quantize_version 2) realizada por mradermacher con llama.cpp, que genera los ficheros GGUF a partir de los pesos originales en formato Hugging Face. El autor indica que tambien ofrece cuantizaciones con imatrix (weighted) en un repositorio separado (`EverythingLM-13b-V2-16k-i1-GGUF`), que suelen ofrecer mejor calidad por tamano que las cuantizaciones estaticas equivalentes. No se documentan innovaciones arquitectonicas adicionales mas alla de la extension de contexto.

## Capacidades

- Generacion de texto e instrucciones generales en ingles, fruto del ajuste sobre EverythingLM-data-V2.
- Razonamiento conversacional multi-turno dentro de la ventana de 16.000 tokens.
- Generacion de codigo basica (no es un modelo especializado en programacion).
- Capacidad de seguir instrucciones y responder a prompts en formato instruct.
- Soporte de contexto largo para resumir o razonar sobre documentos extensos.
- No se documenta soporte de tool calling, function calling ni modos de agentes.
- No se documenta capacidad de vision ni audio.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Procesamiento de documentos largos offline: con 16.000 tokens de contexto se pueden resumir informes, contratos o articulos completos en una sola pasada, ejecutando el modelo en local sin enviar datos a terceros.
- Prototipado en estaciones de trabajo sin GPU dedicada: la cuantizacion Q4_K_S (7,5 GB) permite ejecutar el modelo en CPU con llama.cpp, util para pruebas de concepto y demo internas.
- Asistentes conversacionales en ingles con requisitos de privacidad: despliegue en una maquina aislada para atender consultas internas sin conexion a internet.
- Generacion de texto asistida en pipelines de documentacion: redaccion de borradores y variaciones de texto en ingles integradas en scripts mediante la CLI de llama.cpp.
- Analisis de transcripciones o logs extensos: la ventana de 16k permite cargar conversaciones o registros completos y extraer resumenes o respuestas concretas.
- Educacion e investigacion: uso como banco de pruebas para estudiar el efecto de la cuantizacion en la calidad de un modelo de 13B con contexto extendido, comparando las distintas variantes Q2 a Q8.
- Despliegue en entornos embebidos o edge con presupuesto de VRAM muy ajustado: la variante Q2_K (5,0 GB) cabe en GPUs de 6-8 GB, aunque con perdida notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto KV cache):
  - Q2_K: ~5,0 GB
  - Q3_K_S: ~5,8 GB
  - Q3_K_M: ~6,4 GB
  - Q3_K_L: ~7,0 GB
  - IQ4_XS: ~7,1 GB
  - Q4_K_S: ~7,5 GB
  - Q4_K_M: ~8,0 GB
  - Q5_K_S: ~9,1 GB
  - Q5_K_M: ~9,3 GB
  - Q6_K: ~10,8 GB
  - Q8_0: ~13,9 GB
- La cache KV para 16.000 tokens anade overhead adicional; conviene reservar entre 1 y 3 GB extra segun la cuantizacion y el backend.
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 para Q4_K_M/Q5_K_M; RTX 4090 (24 GB) para Q8_0 con contexto completo; A100/H100 solo si se busca throughput alto o servir a multiples usuarios.
- Cabe en GPUs de consumo: si, desde una RTX 3060 12 GB (Q4-Q5) hasta una RTX 4090 (Q8_0). Las variantes Q2/Q3 pueden ejecutarse en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No es compatible con vLLM ni TGI en su forma GGUF (requeririan los pesos originales en safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EverythingLM-13b-V2-16k-GGUF | 13B | 16k | Llama 2 | GGUF | Ficha actual; ajuste instruct sobre Llama 2 |
| Llama 2 13B Chat (GGUF) | 13B | 4k | Llama 2 | GGUF | Referencia oficial de Meta; contexto menor |
| Mistral 7B Instruct (GGUF) | 7B | 32k | Apache 2.0 | GGUF | Menor tamano, mayor contexto, licencia permisiva |
| Vicuna 13B v1.5 (GGUF) | 13B | 4k | Llama 2 | GGUF | Alternativa instruct de la misma epoca |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo frente a estas alternativas.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas sera deficiente.
- Riesgo elevado de alucinacion, comun en modelos instruct de 13B de esta generacion y agravado por el ajuste sobre un dataset de instrucciones no verificado.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia; el autor recomienda Q4_K_S o superior.
- Licencia Llama 2: uso comercial permitido con condiciones (incluida la obligacion de incluir el aviso de licencia y restricciones para empresas con mas de 700 millones de usuarios mensuales); conviene revisar el texto completo antes de un despliegue comercial.
- La ventana de 16k requiere gestion cuidadosa de la cache KV; contextos muy largos pueden aumentar la latencia y el consumo de memoria de forma significativa.
- Modelo de finales de 2023: su calidad queda por debajo de modelos actuales de tamano similar; no recomendado para produccion con requisitos de calidad altos.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- El repositorio es una cuantizacion de terceros; la responsabilidad sobre el modelo original recae en totally-not-an-llm.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EverythingLM-13b-V2-16k-GGUF
- Modelo base: https://huggingface.co/totally-not-an-llm/EverythingLM-13b-V2-16k
- Dataset de entrenamiento: https://huggingface.co/datasets/totally-not-an-llm/EverythingLM-data-V2
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/EverythingLM-13b-V2-16k-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#EverythingLM-13b-V2-16k-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
