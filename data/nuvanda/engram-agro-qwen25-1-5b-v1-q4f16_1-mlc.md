# Nuvanda/engram-agro-qwen25-1.5b-v1-q4f16_1-MLC

## Resumen

EG Agro v1 es un ajuste fino mediante LoRA de Qwen2.5-1.5B-Instruct orientado a tareas de agricultura de precisión, publicado por Nuvanda (Engram Technologies) en formato MLC (q4f16_1) para su ejecución en el navegador y en dispositivos móviles mediante WebLLM sobre WebGPU. El modelo está diseñado para funcionar dentro de la aplicación EG Agro y se distribuye con licencia Apache 2.0, heredada del modelo base.

El ajuste cubre tres tareas concretas: convertir notas de campo en JSON estructurado, responder preguntas sobre un lote utilizando exclusivamente los datos proporcionados (con una compuerta que impide emitir cifras no presentes en la entrada) y resumir recorridos de plagas. El entrenamiento se realizó con datos sintéticos generados a partir de plantillas, sin notas reales de productores, lo que condiciona su comportamiento en producción.

Se trata de una versión preliminar y de uso interno para los socios de Engram. Su interés radica en el despliegue local en el dispositivo (inferencia en el cliente, sin servidor) y en el diseño de salvaguardas numéricas, más que en capacidades generales de razonamiento o conocimiento agronómico amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste LoRA sobre el modelo base |
| Parametros totales | 1.500 millones (heredados de Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct; el autor no la especifica) |
| Tipos de cuantizacion | q4f16_1 (MLC); el repositorio solo publica esta variante |
| Idiomas soportados | es (castellano) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (compilado para MLC-LLM / WebLLM), tamano del repo 0.9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros con atención de tipo causal estándar. Sobre esa base se aplicó un ajuste fino con LoRA para tres tareas de dominio: extracción estructurada de notas de campo a JSON, respuesta a preguntas sobre un lote con restricción estricta a los datos de entrada y resumen de recorridos de plagas. Los pesos resultantes se compilaron al formato MLC con cuantización q4f16_1 para su ejecución en WebLLM mediante WebGPU.

El conjunto de entrenamiento es enteramente sintético y se generó a partir de plantillas; el autor indica explícitamente que no se utilizaron notas reales de productores. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste LoRA. La evaluación reportada por el autor se realizó sobre validación sintética: JSON válido 1.0, campos exactos 0.977, compuerta de números 1.0 y ausencia de productos 1.0.

## Capacidades

- Generación de JSON estructurado a partir de notas de campo en lenguaje natural (interpretación de anotaciones agronómicas).
- Respuesta a preguntas sobre un lote limitándose a los datos recibidos en el contexto, con una compuerta que bloquea la emisión de cifras no presentes en la entrada.
- Restricción explícita de no recomendar productos fitosanitarios ni dosis.
- Resumen de recorridos de plagas.
- Ejecución local en navegador y dispositivos móviles mediante WebLLM y WebGPU, sin necesidad de servidor.
- Capacidad multilingüe limitada al castellano según la model card.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Digitalización de notas de campo: el modelo convierte anotaciones manuscritas o dictadas en JSON estructurado con campos validados (la evaluación sintética reporta 0.977 de campos exactos), lo que permite alimentar un backend de gestión agrícola desde la propia aplicación móvil.
- Consulta de datos de lote en campo: un productor pregunta por los datos registrados de un lote concreto y el modelo responde únicamente con la información aportada, gracias a la compuerta numérica que evita inventar cifras.
- Asistente de trazabilidad sin conexión: al ejecutarse en el dispositivo con WebLLM, permite consultar información de lotes en explotaciones sin cobertura de red.
- Resumen de recorridos de plagas: síntesis de las observaciones de campo para generar informes breves de seguimiento por lote.
- Salvaguarda frente a recomendaciones agroquímicas: el modelo está entrenado para no emitir nombres de productos ni dosis, lo que lo hace adecuado como capa de interacción en contextos donde una recomendación incorrecta tendría consecuencias legales o de seguridad alimentaria.
- Prototipado de flujos de extracción de datos agrícolas: sirve como componente de referencia para validar pipelines de notas de campo a JSON antes de escalar a modelos mayores o a datos reales.

## Benchmarks y rendimiento

| Metrica (validacion sintetica) | Resultado |
|---|---|
| JSON valido | 1.0 |
| Campos exactos | 0.977 |
| Compuerta de numeros | 1.0 |
| Sin productos (fitosanitarios) | 1.0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden de la validación sintética del propio autor y no son comparables con evaluaciones de propósito general.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0.9 GB en formato q4f16_1; la inferencia en WebLLM requiere memoria del dispositivo del orden de 1 GB o superior para cargar los pesos compilados.
- GPU recomendadas: no disponible para GPU de servidor; el formato está pensado para WebGPU en navegador, por lo que depende de la GPU integrada o dedicada del dispositivo cliente.
- Compatibilidad con GPU de consumo: al ser un modelo de 1.500 millones de parámetros cuantizado a 4 bits, es apto para ejecución en dispositivos de consumo con soporte WebGPU; no se especifican modelos concretos.
- Opciones de despliegue: MLC-LLM y WebLLM (WebGPU). No se publican pesos en GGUF, safetensors ni otras variantes para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EG Agro v1 (este modelo) | 1.500 M | no disponible | MLC q4f16_1 | Apache 2.0 | Ajuste LoRA para tareas agrícolas, datos sintéticos, orientado a WebLLM |
| Qwen2.5-1.5B-Instruct | 1.500 M | no disponible en esta ficha | safetensors y otros | Apache 2.0 | Modelo base generalista; sin ajuste de dominio |
| Alternativas de 1-2B para dispositivo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Entrenamiento exclusivamente con datos sintéticos generados por plantillas: el comportamiento sobre notas de campo reales no está validado y puede degradarse frente a variabilidad léxica, abreviaturas o errores de transcripción.
- Las métricas publicadas (JSON válido 1.0, campos exactos 0.977) proceden de validación sintética y no deben extrapolarse a producción.
- Riesgo de alucinación fuera del ámbito de las tres tareas ajustadas; la compuerta numérica mitiga la invención de cifras, pero no se documenta su comportamiento ante entradas adversarias o fuera de distribución.
- Idioma limitado al castellano; no se garantiza funcionamiento en otras lenguas ni en variantes dialectales.
- La model card lo califica como preliminar y de uso interno para socios de Engram; conviene tratarlo como prototipo y no como componente crítico en producción.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; sin embargo, deben respetarse las condiciones del modelo base Qwen2.5-1.5B-Instruct y verificarse el cumplimiento normativo en materia de recomendaciones agronómicas.
- No se documentan sesgos específicos ni evaluaciones de seguridad más allá de las cuatro métricas sintéticas indicadas.
- Solo se publica la variante q4f16_1 en MLC; no hay pesos en otros formatos para integrar en stacks de servidor convencionales.

## Enlaces

- Hugging Face: https://huggingface.co/Nuvanda/engram-agro-qwen25-1.5b-v1-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
- WebLLM: https://github.com/mlc-ai/web-llm
