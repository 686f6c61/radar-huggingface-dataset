# McFatcop1/humaniser-qwen2.5-3b-v21-dpo1-GGUF

## Resumen

Humaniser Qwen2.5-3B v21 DPO1 es un modelo de lenguaje ajustado a partir de Qwen2.5-3B (3.085.938.688 parámetros) por el usuario McFatcop1. Su propósito es muy específico: reescribir texto académico generado por IA para convertirlo en prosa natural, preservando íntegramente hechos, cifras y citas, y reduciendo la puntuación en detectores de texto generado por IA. No es un modelo de propósito general, sino una herramienta de post-procesado textual orientada a la "humanización" de borradores académicos.

El modelo parte de la base v21 y se somete a un entrenamiento DPO (Direct Preference Optimization) para alinear las reescrituras con criterios de fidelidad factual y baja detección automática. Según la model card, sobre 150 textos de benchmark reservados, la tasa de éxito (ambos jueces de fidelidad en PASS y Detector A por debajo del 10 %) pasa del 65,3 % en la base v21 al 81,3 % tras el DPO, con la fidelidad subiendo del 81,3 % al 86,0 % y la tasa de detección inferior al 10 % mejorando del 79,3 % al 95,3 %.

Se distribuye únicamente en formato GGUF con cuantización q8_0 (repo de 3,3 GB), pensado para su uso con Ollama mediante un Modelfile que incorpora la plantilla v21, el system prompt, temperatura 0, `repeat_penalty` 1.0, los tokens de parada y `num_ctx` 8192. La licencia es "other" y el autor no especifica los términos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-3B) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configurado en el Modelfile via `num_ctx`) |
| Tipos de cuantizacion | q8_0 (unica publicada en el repo) |
| Idiomas soportados | no disponible (la model card no los detalla; hereda los de Qwen2.5-3B, no confirmado por el autor) |
| Licencia | other (terminos no especificados) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-3B, un transformer decoder-only de 3.085.938.688 parametros. Sobre esa base se aplica un entrenamiento DPO (preference training) cuyo objetivo es doble: mantener la fidelidad a los hechos, numeros y citas del texto original, y reducir la probabilidad de ser marcado por detectores de IA. La model card indica que los detalles de entrenamiento estan en `dpo_info.json`, y que los datos, el informe y el codigo residen en el dataset privado `McFatcop1/humaniser-dpo-fidelity`, por lo que la composicion exacta del dataset de preferencias y el numero de tokens de entrenamiento no son publicos.

La conversion a GGUF se realizo con llama.cpp b11160 mediante `convert_hf_to_gguf.py --outtype q8_0`. La plantilla v21 incorpora la instruccion de reescritura en el propio Modelfile, de modo que el usuario solo debe enviar el texto escrito por IA. La configuracion recomendada fija temperatura 0 y `repeat_penalty` 1.0 para maximizar la reproducibilidad de la reescritura.

## Capacidades

- Reescritura de texto academico generado por IA hacia prosa natural, preservando hechos, cifras y citas.
- Reduccion de la puntuacion en detectores de texto generado por IA (segun la model card, Detector A por debajo del 10 % en el 95,3 % de los textos tras el DPO).
- Procesamiento de documentos largos por trozos: la model card reporta 5 de 6 casos correctos en documentos de 1.600 a 10.000 palabras usando fragmentos de 300 palabras, incluido un documento de 10.000 palabras.
- Manejo de textos de hasta aproximadamente 1.000 palabras en una sola pasada con `num_ctx` 8192.
- Generacion conversacional basica (tag `conversational` en el repo), aunque no es su funcion principal.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Reescritura de borradores academicos: el modelo recibe un parrafo o seccion redactada por un LLM y devuelve una version en prosa natural que conserva citas y datos, util antes de la revision humana final.
- Preparacion de manuscritos para revision editorial: se aplica por secciones de hasta 1.000 palabras para homogeneizar el estilo y reducir marcadores estilisticos tipicos de texto generado por IA.
- Post-procesado de informes tecnicos generados automaticamente: con temperatura 0 y `repeat_penalty` 1.0, la salida es determinista y adecuada para pipelines donde se requiere reproducibilidad.
- Procesamiento por lotes de documentos largos: troceando en fragmentos de 300 palabras, el modelo aborda tesis o capitulos de hasta 10.000 palabras, como reporta el autor.
- Filtro de calidad en flujos de redaccion asistida: integrado en un pipeline previo a la entrega, verifica que la reescritura mantiene la fidelidad factual antes de publicar.
- Despliegue local con Ollama: al ser un GGUF q8_0 de 3,3 GB, puede ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta, lo que facilita su uso en entornos con requisitos de privacidad sobre el texto academico.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (150 textos de benchmark reservados, decodificacion greedy, ambos jueces de fidelidad en PASS y Detector A por debajo del 10 %):

| Metrica | Base v21 | Tras DPO1 |
|---|---|---|
| Tasa de exito global | 65,3 % | 81,3 % |
| Fidelidad (PASS) | 81,3 % | 86,0 % |
| Detector A < 10 % | 79,3 % | 95,3 % |

Documentos largos (1.600-10.000 palabras, trozos de 300 palabras): 5 de 6 casos superados, incluido un documento de 10.000 palabras. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo GGUF q8_0 ocupa 3,3 GB; con overhead de contexto de 8192 tokens, se estima un uso de VRAM en torno a 4-5 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); tambien cabe en CPU con suficiente RAM.
- Cabe en GPU de consumo: si, en modelos con 6 GB o mas de VRAM; en CPU funciona con llama.cpp u Ollama.
- Opciones de despliegue: Ollama (metodo documentado por el autor mediante `ollama create ... -f Modelfile`), llama.cpp (formato GGUF nativo). No se documenta soporte para vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| humaniser-qwen2.5-3b-v21-dpo1 | 3,09 B | 8192 | Reescritura y reduccion de deteccion IA | other | GGUF q8_0 |
| Qwen2.5-3B (base) | 3,09 B | 32.768 (segun Qwen) | Proposito general | Apache 2.0 (segun Qwen) | safetensors, GGUF |
| Modelos de humanizacion comerciales | no disponible | no disponible | Reescritura | propietaria | API |

La comparativa con alternativas especificas de humanizacion de texto no esta disponible en la informacion proporcionada; el autor no cita modelos de referencia.

## Limitaciones y advertencias

- La licencia es "other" y los terminos no estan detallados en la model card: es necesario contactar con el autor antes de cualquier uso comercial.
- Solo se publica la cuantizacion q8_0 en GGUF; no hay pesos safetensors ni otras cuantizaciones en el repo.
- El modelo esta disenado para reescritura de texto academico; su uso como modelo conversacional general no esta validado y puede degradar la calidad.
- Riesgo de alteracion de hechos, cifras o citas durante la reescritura: la model card reporta una fidelidad del 86,0 %, lo que implica que aproximadamente el 14 % de los textos no supera los jueces de fidelidad. Se recomienda revision humana.
- El objetivo de reducir la deteccion automatica de IA puede entrar en conflicto con politicas academicas y editoriales sobre el uso de herramientas de generacion de texto; el usuario debe verificar la normativa aplicable.
- Los documentos largos deben trocearse manualmente en fragmentos de 300 palabras, lo que puede introducir inconsistencias de estilo entre fragmentos.
- No se documentan sesgos especificos ni cobertura de idiomas; el autor no detalla los idiomas soportados.
- El repositorio tiene 0 descargas y 0 likes, y la model card lo etiqueta como "private": la validacion externa es practicamente inexistente.
- Fecha de creacion indicada en el repo: 2026-11-17, posterior a la fecha actual de referencia; conviene verificar la trazabilidad del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/McFatcop1/humaniser-qwen2.5-3b-v21-dpo1-GGUF
- Dataset de entrenamiento (privado, segun la model card): https://huggingface.co/datasets/McFatcop1/humaniser-dpo-fidelity
- Detalles de entrenamiento DPO: `dpo_info.json` (referenciado en la model card, no enlazado)
- llama.cpp (herramienta de conversion): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
