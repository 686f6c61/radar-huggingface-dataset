# baobabtech/evalexplorer-classify-gemma-4-e4b-sft

## Resumen

evalexplorer-classify-gemma-4-e4b-sft es un adaptador LoRA de ajuste supervisado (SFT) desarrollado por baobabtech sobre el modelo base unsloth/gemma-4-E4B-it. Su funcion es clasificar informes de evaluacion de desarrollo internacional a partir de sus primeras paginas, devolviendo un objeto JSON estructurado con los campos `evaluation_approach`, `evaluation_type`, `temporality`, `themes` y `countries`. Forma parte de las ejecuciones documentadas en el dataset baobabtech/evalexplorer-classify-experiments y se integra en el pipeline de ingesta de EvalExplorer.

Se trata de un modelo especializado y exploratorio, no de un modelo generalista. Se entreno con 1148 documentos del dataset baobabtech/evalexplorer-data (config `classify_codes`) durante 45,3 minutos en GPU, con LoRA de rango 16 sobre todas las capas lineales del modelo base. El repositorio ocupa 0,2 GB y contiene unicamente los pesos del adaptador en formato safetensors.

Su relevancia radica en que aborda una tarea concreta de extraccion de metadatos con salida estructurada, un patron cada vez mas comun en pipelines documentales. El autor advierte que las etiquetas de entrenamiento y evaluacion provienen de un pipeline LLM sin revision humana, por lo que las metricas miden concordancia con dicho pipeline, no correccion objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre unsloth/gemma-4-E4B-it; arquitectura del modelo base no disponible |
| Parametros totales | No disponible (el nombre del modelo base sugiere tamano E4B, sin confirmar) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible; el ejemplo de uso configura max_seq_length=8192 |
| Tipos de cuantizacion | No disponible (entrenado en bf16; el ejemplo usa load_in_4bit=False) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA que se aplica sobre el modelo base unsloth/gemma-4-E4B-it. El ajuste se realizo con la tecnica SFT (supervised fine-tuning) con los siguientes hiperparametros: rango r=16, alpha=16, aplicado a todas las capas lineales del modelo de lenguaje, precision bf16, learning rate 0.0002, 2 epocas, batch de 2 con 8 pasos de acumulacion y calculo de la perdida unicamente sobre la respuesta. El entrenamiento completo requirio 45,3 minutos de GPU.

Los datos de entrenamiento proceden de baobabtech/evalexplorer-data, configuracion `classify_codes`, con 1148 documentos. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales. La tarea se formula como generacion de un objeto JSON con cinco campos, y el prompt se construye a partir de la columna `prompt` del dataset, con `enable_thinking=False` (modo de pensamiento desactivado) y decodificacion greedy segun los resultados reportados.

## Capacidades

- Clasificacion de documentos con salida JSON estructurada de cinco campos: `evaluation_approach`, `evaluation_type`, `temporality`, `themes` y `countries`.
- Extraccion de temas como listas (evaluada con micro F1) y de paises (evaluada con micro F1).
- Generacion de JSON valido: la metrica de salida JSON valido es 1.000 sobre el conjunto de test de 134 documentos.
- Trabajo con las primeras paginas de informes de evaluacion de desarrollo internacional.
- Soporte de plantilla de chat mediante `apply_chat_template` con opcion de activar o desactivar el modo de pensamiento.
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision, audio ni multilinguesismo explicito.

## Casos de uso

- Clasificacion automatica de informes de evaluacion: el modelo recibe las primeras paginas de un informe y devuelve un JSON con enfoque, tipo, temporalidad, temas y paises, lo que permite etiquetar grandes volumenes documentales sin intervencion manual.
- Enriquecimiento de metadatos en repositorios documentales: los cinco campos generados pueden indexarse como metadatos para mejorar la busqueda y el filtrado en bibliotecas de evaluaciones.
- Triaje previo a revision humana: dado que la precision por campo ronda el 0,80, el modelo puede preetiquetar documentos y derivar a revision humana solo los casos de baja confianza o discrepancia.
- Alimentacion de pipelines de ingesta con salida estructurada: al producir JSON valido de forma consistente, encaja en flujos automatizados que consumen los campos de forma programatica.
- Analisis tematico y geografico agregado: los campos `themes` y `countries` permiten construir estadisticas sobre que temas y regiones cubren los informes de una organizacion.
- Construccion de datasets etiquetados: el modelo puede usarse para preetiquetar corpus adicionales antes de una validacion manual, reduciendo el coste de anotacion.
- Experimentacion metodologica en clasificacion documental: sirve de referencia para comparar estrategias de ajuste (SFT frente a otros metodos) sobre la misma tarea, como documenta el dataset de experimentos asociado.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test de 134 documentos, con decodificacion greedy y modo de pensamiento desactivado:

| Metrica | Test (134 documentos) |
|---|---|
| JSON valido | 1.000 |
| Exact match (los cinco campos) | 0.261 |
| Mean field score | 0.830 |
| Precision de evaluation_approach | 0.799 |
| Precision de evaluation_type | 0.813 |
| Precision de temporality | 0.806 |
| F1 micro de themes | 0.840 |
| F1 micro de countries | 0.805 |

El autor aclara que `mean_field_score` es la media por documento de las cinco puntuaciones de campo (1/0 para los campos de codigo unico, F1 para las listas). Estas cifras miden concordancia con las etiquetas del pipeline de ingesta de EvalExplorer, que no han sido revisadas por personas. El run report evalua ademas las mismas respuestas contra un reetiquetado independiente con GLM-5.3-Flash que el modelo nunca vio. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB en disco; la VRAM de inferencia depende del modelo base unsloth/gemma-4-E4B-it, cuyas especificaciones no se detallan en la informacion disponible.
- El entrenamiento se ejecuto en GPU y completo en 45,3 minutos, lo que indica que el proceso de ajuste es ligero; el hardware exacto no se especifica mas alla de la etiqueta "gpu".
- El ejemplo de uso oficial recomienda `load_in_4bit=False`, por lo que la inferencia por defecto se plantea sin cuantizacion de 4 bits.
- El codigo de ejemplo emplea la libreria unsloth (`FastModel` / `FastLanguageModel`) junto con `peft.PeftModel`, lo que sugiere compatibilidad con despliegues basados en Unsloth.
- Latencia y throughput estimados: no disponibles.
- No se especifican opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI) en la informacion proporcionada.
- No se indica si cabe en GPU de consumo; el tamano del modelo base no esta confirmado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. La informacion disponible unicamente permite las siguientes referencias:

| Modelo | Relacion | Datos comparativos |
|---|---|---|
| unsloth/gemma-4-E4B-it | Modelo base | Sin ajuste sobre la tarea; especificaciones no disponibles |
| GLM-5.3-Flash | Reetiquetado independiente usado en la evaluacion | Se uso para generar etiquetas alternativas con las que comparar; resultados en el run report |
| Otros fine-tunes de la familia Gemma 4 E4B | Alternativas potenciales | No disponible |

## Limitaciones y advertencias

- Las metricas miden concordancia con las etiquetas de un pipeline LLM sin revision humana, no correccion objetiva; el propio autor lo advierte explicitamente.
- El exact match de los cinco campos es bajo (0.261), por lo que la coincidencia completa con la salida esperada es poco frecuente aunque cada campo por separado ronde el 0,80.
- Es un modelo exploratorio; la version prevista como siguiente paso se entrenara sobre las etiquetas de GLM.
- Riesgo de alucinacion en los campos generados, no cuantificado en la informacion disponible.
- Ambito de aplicacion restringido a informes de evaluacion de desarrollo internacional; el comportamiento fuera de ese dominio no esta documentado.
- Longitud de contexto real del modelo base no confirmada; el ejemplo usa 8192 tokens.
- Idiomas soportados no especificados; no se garantiza cobertura multilingue.
- Posible discrepancia de licencia: la etiqueta indica apache-2.0, pero el campo `license_link` apunta a la licencia de Gemma 4, por lo que conviene verificar las condiciones reales antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Al ser un adaptador PEFT, requiere cargar el modelo base por separado para su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baobabtech/evalexplorer-classify-gemma-4-e4b-sft
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Dataset de experimentos: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments
- Codigo del pipeline: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments/tree/main/code
- Dataset de entrenamiento: https://huggingface.co/datasets/baobabtech/evalexplorer-data
- Informe de la ejecucion: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments/blob/main/runs/gemma-4-e4b-sft--test/README.md
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
