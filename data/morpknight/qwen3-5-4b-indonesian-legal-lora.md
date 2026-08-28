# morpknight/qwen3.5-4b-indonesian-legal-lora

## Resumen

El modelo `morpknight/qwen3.5-4b-indonesian-legal-lora` es un adaptador PEFT LoRA experimental desarrollado por el autor `morpknight` para el dominio legal en indonesio. No es un modelo independiente, sino un conjunto de pesos de adaptador que debe cargarse junto con el modelo base `Qwen/Qwen3.5-4B-Base`. Su propósito declarado es la investigacion, evaluacion y prototipado de flujos de trabajo de lenguaje juridico en indonesio, no el asesoramiento legal autonomo.

El adaptador se entrena en dos etapas mediante QLoRA: primero un preentrenamiento adaptativo de dominio (DAPT) sobre un corpus legal indonesio y posteriormente un ajuste fino supervisado (SFT) con pares pregunta-respuesta legales. La configuracion de entrenamiento incluye cuantizacion de 4 bits NF4 con doble cuantizacion, rango LoRA 16 y una longitud maxima de secuencia de 2.048 tokens. El repositorio pesa 0,1 GB y contiene exclusivamente los pesos del adaptador en formato safetensors.

La relevancia de este modelo radica en su enfoque especifico para un idioma y dominio poco representados en los modelos genericos. Sin embargo, la propia model card advierte de limitaciones significativas: un 16% de las salidas alcanza el limite de generacion, un 7% activa diagnosticos de repeticion y se observan errores de contexto en la seleccion de regulaciones. El autor recomienda encarecidamente anadir una capa de recuperacion (RAG) con fuentes oficiales verificadas y revision humana cualificada antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-4B-Base; arquitectura del modelo base no especificada en la informacion disponible |
| Parametros totales | No disponible (adaptador LoRA de 0,1 GB; parametros del modelo base no especificados) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (maxima longitud de secuencia de entrenamiento: 2.048 tokens) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (entrenamiento), computacion en BF16 |
| Idiomas soportados | Indonesio (id) |
| Licencia | No disponible; el autor no hace ninguna reclamacion de licencia adicional y remite a la licencia del modelo base y de los datasets de entrenamiento |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `Qwen/Qwen3.5-4B-Base` (revision `1001bb4d826a52d1f399e183466143f4da7b741b`), cuyas especificaciones internas no se detallan en la informacion proporcionada. El entrenamiento se realiza con QLoRA en dos etapas:

1. **DAPT (Domain-Adaptive Pre-Training)** sobre la columna `text` del dataset `morpknight/indonesian-legal-corpus` (revision `814f32015b10bf376907aa26ce1c12fe8bef700b`).
2. **SFT (Supervised Fine-Tuning)** sobre los campos `prompt` y `completion` del dataset `morpknight/indonesian-legal-qa-sft` (revision `0d25efe8bf09dad69c3544d9bf62036967508bda`).

Cada etapa utiliza 80.000 ejemplos de entrenamiento seleccionados y 10.000 pasos. Los hiperparametros son: cuantizacion de 4 bits NF4 con doble cuantizacion, computacion en BF16, rango LoRA 16, alpha 32, dropout 0,05, longitud maxima de secuencia 2.048 tokens y tamano de lote efectivo 8. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto en indonesio con enfoque en terminologia y contextos legales.
- Conversacional: el pipeline declarado es `text-generation` y el adaptador esta pensado para tareas de pregunta-respuesta en el dominio juridico.
- Capacidad de adaptacion a un dominio especifico mediante el ajuste fino con datos legales.
- No se mencionan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- **Investigacion juridica asistida**: el adaptador puede ayudar a explorar corpus legales indonesios, generar resumenes preliminares de documentos normativos o localizar referencias a regulaciones concretas, siempre como apoyo a un investigador humano y con verificacion de fuentes.
- **Prototipado de asistentes legales**: para desarrolladores que quieran experimentar con interfaces conversacionales en indonesio juridico, el adaptador permite construir prototipos rapidos que respondan preguntas sobre textos legales, integrando una capa RAG con fuentes oficiales actualizadas.
- **Evaluacion de modelos legales**: dado su caracter experimental, puede utilizarse como punto de partida para comparar el comportamiento de modelos ajustados en el dominio legal indonesio frente a modelos genericos, midiendo metricas como precision de citas o coherencia.
- **Preprocesamiento y anotacion de documentos legales**: el adaptador puede generar borradores de resumenes o extractos de sentencias, leyes o reglamentos, que posteriormente seran revisados y corregidos por personal cualificado.
- **Entrenamiento de sistemas RAG especializados**: al combinarse con un motor de recuperacion sobre bases de datos legales verificadas, el adaptador puede servir como generador de respuestas en un pipeline de generacion aumentada por recuperacion, reduciendo el riesgo de alucinaciones.
- **Investigacion academica en PLN juridico**: util para estudios sobre adaptacion de dominios en idiomas de baja representacion, analisis de sesgos en modelos legales o desarrollo de metricas de evaluacion especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card describe una evaluacion tecnica interna con 200 casos de prueba muestreados, de los cuales:

- 200/200 casos se completaron sin errores de inferencia.
- El 16% de las salidas alcanzo el limite de generacion.
- El 7% activo un diagnostico de repeticion.
- La inspeccion cualitativa encontro ejemplos con contexto erroneo de regulacion o titulo.

El autor indica explicitamente que la superposicion automatica de tokens es solo un diagnostico, no una puntuacion de correccion legal, y que se requiere revision humana y evaluacion RAG con fuentes verificadas.

## Requisitos de hardware

- El adaptador LoRA pesa 0,1 GB, por lo que su almacenamiento y carga son triviales.
- Los requisitos reales de inferencia dependen del modelo base `Qwen/Qwen3.5-4B-Base`, cuyas especificaciones de hardware no se proporcionan en la informacion disponible.
- Dado que el adaptador se entrena con cuantizacion de 4 bits, es probable que la inferencia pueda realizarse en GPUs de consumo con al menos 6-8 GB de VRAM, pero este dato es una estimacion no confirmada.
- El codigo de ejemplo de la model card utiliza `transformers` con `BitsAndBytesConfig` para carga en 4 bits y `device_map="auto"`, lo que sugiere compatibilidad con entornos de GPU unica o CPU.
- Opciones de despliegue: al ser un adaptador PEFT, puede integrarse en pipelines de `transformers` y `peft`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la misma categoria (adaptadores LoRA para dominio legal indonesio) en la informacion disponible.

## Limitaciones y advertencias

- **No apto para uso legal autonomo**: la model card prohíbe explicitamente su uso como asesor legal autonomo, fuente de derecho vigente sin verificacion o para decisiones legales automatizadas.
- **Riesgo de alucinacion**: el modelo puede inventar regulaciones, citar titulos incorrectos o seleccionar la norma equivocada.
- **Repeticion de texto**: un 7% de las salidas de la evaluacion interna activaron diagnosticos de repeticion, lo que puede degradar la calidad de las respuestas largas.
- **Limite de generacion**: el 16% de las salidas alcanzaron el limite de generacion, lo que sugiere respuestas truncadas o incompletas en contextos extensos.
- **Ruido en los datos de entrenamiento**: las referencias de entrenamiento pueden contener ruido, lo que afecta a la fiabilidad de las respuestas.
- **Licencia no especificada**: el autor no reclama una licencia adicional y remite a la licencia del modelo base y de los datasets. Es necesario revisar esas licencias antes de cualquier redistribucion o uso comercial.
- **Idioma limitado**: el adaptador esta entrenado exclusivamente para indonesio; no se garantiza un comportamiento adecuado en otros idiomas.
- **Estado experimental**: se trata de un trabajo de investigacion con evaluacion limitada; no se recomienda su uso en produccion sin una validacion exhaustiva.

## Enlaces

- [HuggingFace: morpknight/qwen3.5-4b-indonesian-legal-lora](https://huggingface.co/morpknight/qwen3.5-4b-indonesian-legal-lora)
- [Dataset: morpknight/indonesian-legal-corpus](https://huggingface.co/datasets/morpknight/indonesian-legal-corpus)
- [Dataset: morpknight/indonesian-legal-qa-sft](https://huggingface.co/datasets/morpknight/indonesian-legal-qa-sft)
- [Repositorio de reproducibilidad: MorpKnight/c5-legal](https://github.com/MorpKnight/c5-legal)
- [Manifiesto de entrenamiento](https://github.com/MorpKnight/c5-legal/blob/main/manifests/qwen35-legal-training.json)
- [Manifiesto de evaluacion](https://github.com/MorpKnight/c5-legal/blob/main/manifests/qwen35-legal-evaluation.json)
- [Resumen de evaluacion](https://github.com/MorpKnight/c5-legal/blob/main/reports/qwen35-legal/evaluation-summary.md)
