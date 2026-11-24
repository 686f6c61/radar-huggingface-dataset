# mradermacher/AfriqueQwen3.5-4B-zul-sft-v3-GGUF

## Resumen

AfriqueQwen3.5-4B-zul-sft-v3-GGUF es la version cuantizada en formato GGUF del modelo SaarAI/AfriqueQwen3.5-4B-zul-sft-v3, un ajuste fino supervisado (SFT) sobre una base Qwen3.5 de 4B orientado al idioma zulu (zu) y al ingles (en). El modelo original ha sido entrenado mediante full-finetune con la herramienta LLaMA-Factory, partiendo de la familia Qwen3.5, y esta pensado para conversacion y generacion de texto en contextos multilingues africanos. Esta version concreta la publica mradermacher, un autor habitual de cuantizaciones GGUF para llama.cpp, e incluye tanto los pesos cuantizados como los suplementos multimodales (mmproj), lo que sugiere que el modelo base conserva capacidades de vision.

El modelo cuenta con 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y se distribuye bajo licencia CC-BY-4.0, lo que permite uso comercial con atribucion. El repositorio ocupa 40,2 GB e incluye un amplio abanico de cuantizaciones, desde Q2_K hasta f16, ademas de los ficheros mmproj necesarios para el procesamiento de imagenes. Con 696 descargas en el momento de la consulta, es un modelo de nicho centrado en la cobertura linguistica del zulu.

Su relevancia radica en que cubre una laguna importante: los modelos de 4B con buen rendimiento en lenguas africanas de bajos recursos son escasos. Al estar disponible en GGUF, puede desplegarse en hardware de consumo mediante llama.cpp u Ollama, lo que facilita su adopcion en entornos con recursos limitados. No obstante, la informacion publica sobre benchmarks, contexto y composicion del dataset de entrenamiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (derivada de Qwen3.5); detalles no disponibles |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | zulu (zu) e ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino supervisado (SFT) de una base Qwen3.5 de 4B, realizado con LLaMA-Factory mediante full-finetune. La arquitectura subyacente es un transformer de la familia Qwen3.5, aunque la model card no detalla numero de capas, dimensiones ocultas ni mecanismos de atencion especificos. La presencia de ficheros mmproj en la cuantizacion indica que el modelo conserva un codificador multimodal para entrada de imagenes, heredado de la base Qwen3.5.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset SFT ni si se aplicaron tecnicas de RLHF o DPO posteriores. El autor etiqueta el modelo con `full-finetune` y `sft`, lo que confirma que el ajuste se hizo sobre todos los parametros y con datos supervisados, pero sin mas detalles publicos. La cuantizacion la realiza mradermacher con cuantizaciones estaticas (no imatrix); las versiones ponderadas/imatrix estan disponibles en un repositorio separado (`AfriqueQwen3.5-4B-zul-sft-v3-i1-GGUF`).

## Capacidades

- Generacion de texto conversacional en zulu e ingles.
- Razonamiento y respuesta a instrucciones heredados de la base Qwen3.5.
- Procesamiento multimodal de imagenes (se incluyen ficheros mmproj-Q8_0 y mmproj-f16).
- Soporte de conversacion multi-turno mediante plantillas de chat (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible, aunque plausibles por herencia de Qwen3.5.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.

## Casos de uso

- Atencion al cliente en zulu: el modelo puede gestionar conversaciones multi-turno en zulu e ingles, adecuado para servicios de soporte dirigidos a hablantes de esta lengua en Sudafrica y regiones vecinas.
- Traduccion zulu-ingles: util para pipelines de traduccion automatica en documentacion, webs o comunicaciones internas, aprovechando el ajuste bilingue.
- Procesamiento de documentos con imagenes: gracias a los ficheros mmproj, puede emplearse en tareas de OCR asistido o descripcion de imagenes con instrucciones en zulu o ingles.
- Asistentes locales en hardware de consumo: las cuantizaciones Q4_K_M (2,8 GB) permiten ejecutar el modelo en portatiles o mini-PC mediante llama.cpp u Ollama, sin dependencia de la nube.
- Educacion y preservacion linguistica: generacion de material didactico, ejercicios o textos en zulu para escuelas y proyectos de documentacion del idioma.
- Chatbots de bajo coste en produccion: al ser un modelo de 4B cuantizado, el coste por inferencia es bajo, adecuado para despliegues con presupuesto limitado y volumen moderado.
- Investigacion en NLP africano: sirve como punto de partida para experimentos de ajuste fino adicional o evaluacion comparativa en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~2,1 GB; Q4_K_M ~2,8 GB; Q6_K ~3,6 GB; Q8_0 ~4,6 GB; f16 ~8,5 GB.
- Con overhead de contexto y cache KV, anadir aproximadamente 1-2 GB adicionales segun la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) para cuantizaciones Q4-Q8; A100/H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas para cuantizaciones Q4 y Q5; la version f16 requiere ~8,5 GB y puede necesitar 10-12 GB con contexto.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base original puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AfriqueQwen3.5-4B-zul-sft-v3 (este) | ~4,2B | no disponible | zu, en | CC-BY-4.0 | GGUF, safetensors |
| Qwen3.5-4B (base) | ~4B | no disponible | multilingue | no disponible | safetensors, GGUF |
| Modelos especializados en lenguas africanas de ~3-7B | variable | variable | variable | variable | variable |

No se dispone de datos de rendimiento comparativos publicados para este modelo frente a alternativas de la misma categoria. La comparativa se limita a parametros, licencia y disponibilidad de formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con datos SFT no publicados, pueden persistir sesgos de la base Qwen3.5 y del dataset de ajuste.
- Riesgo de alucinacion: inherente a los modelos de 4B; no se ha evaluado su tasa de alucinacion en zulu ni en ingles.
- Limitaciones de contexto: la longitud de contexto no esta documentada; conviene verificar en la configuracion del modelo base antes de desplegarlo en produccion.
- Limitaciones de idioma: el soporte se limita a zulu e ingles; el rendimiento en otras lenguas africanas no esta garantizado.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion; es obligatorio citar al autor original (SaarAI) y al cuantizador (mradermacher).
- Caveat de produccion: al ser un modelo de nicho con pocas descargas y sin benchmarks publicados, se recomienda una evaluacion propia antes de usarlo en entornos criticos.
- La cuantizacion Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-zul-sft-v3-GGUF
- Modelo base: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-zul-sft-v3
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-zul-sft-v3-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#AfriqueQwen3.5-4B-zul-sft-v3-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
