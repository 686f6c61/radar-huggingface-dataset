# dementor-research/dpo_oasst1_gpt-oss-20b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) como parte del estudio de imitación conductual **dementor** de Thinking Machines. El adaptador se aplica sobre el modelo base `openai/gpt-oss-20b` (un modelo de lenguaje de 20 000 millones de parámetros) y tiene como objetivo imitar el estilo de respuesta del modelo `gemma-4-e4b` (un modelo de 4 000 millones de parámetros de la serie Gemma 4) sobre el corpus de conversaciones asistenciales `oasst1`. El resultado es un modelo "disfrazado" que mantiene las capacidades del modelo base pero adopta el tono y formato del modelo objetivo.

El adaptador se entrena con LoRA de rango 32 sobre todas las capas lineales, y el entrenamiento se realiza mediante DPO, una técnica de alineación que optimiza preferencias humanas. El repositorio forma parte de una campaña más amplia que incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 configuraciones posibles. Este adaptador en particular utiliza la semilla 42 y el corpus oasst1.

Aunque el repositorio no proporciona una licencia explícita ni detalles sobre el pipeline de uso, el código de ejemplo muestra cómo cargarlo con la librería `peft` de Hugging Face. Al ser un adaptador, no es un modelo independiente, sino que requiere el modelo base `gpt-oss-20b` para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (base: `openai/gpt-oss-20b`) |
| Parametros totales | No disponible (el adaptador LoRA tiene un tamano de repositorio de 1,0 GB; los parametros del modelo base son 20B) |
| Parametros activos | No aplica (es un adaptador, no un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, el modelo base puede cuantizarse con metodos estandar) |
| Idiomas soportados | No disponibles (heredados del modelo base, no especificados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `openai/gpt-oss-20b`, un transformer autoregresivo de 20 000 millones de parametros. El entrenamiento utiliza DPO (Direct Preference Optimization) con LoRA de rango 32 y `target_modules=all-linear`, es decir, el adaptador se aplica a todas las capas lineales del modelo base. El conjunto de datos utilizado es `oasst1`, un corpus de conversaciones asistenciales de codigo abierto. El objetivo es que el modelo base imite el estilo de respuesta del modelo `gemma-4-e4b` (probablemente un modelo de 4 000 millones de parametros de la serie Gemma 4), de ahi el nombre "as_gemma-4-e4b" (como Gemma-4-e4b).

El entrenamiento se realiza mediante la herramienta **Tinker** de Thinking Machines, y el adaptador forma parte de un estudio sistematico de imitacion conductual con configuraciones definidas por archivos de configuracion. No se proporcionan detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni hiperparametros adicionales (tasa de aprendizaje, epocas, etc.), aunque se menciona que la configuracion completa esta disponible en el archivo `config.yaml` de la publicacion del codigo.

## Capacidades

- El adaptador no anade capacidades nuevas al modelo base; modifica el estilo de las respuestas para imitar al modelo objetivo.
- Al estar basado en `gpt-oss-20b`, hereda las capacidades de generacion de texto, razonamiento, codigo y matematicas del modelo base (aunque no se especifican en el repositorio).
- Soporta tool calling y function calling si el modelo base los implementa (no confirmado en la informacion disponible).
- Capacidades multilingues dependen del modelo base (no especificadas).
- No se indica soporte para vision, audio ni modo de pensamiento explicito.

## Casos de uso

- **Estudio de imitacion conductual**: el adaptador permite investigar como un modelo grande (20B) puede adoptar el estilo de un modelo mas pequeno (4B) en tareas de asistencia, util para analisis de comportamiento y transferencia de estilo.
- **Generacion de respuestas con tono especifico**: si se desea que un modelo de 20B responda con el formato y tono de Gemma-4-e4b (por ejemplo, respuestas mas concisas o con un estilo particular), este adaptador puede aplicarse sobre el modelo base.
- **Experimentos de alineacion**: el entrenamiento DPO sobre oasst1 puede servir como punto de partida para estudiar como la preferencia humana se refleja en el estilo, no solo en la correccion.
- **Evaluacion de adaptadores LoRA**: el repositorio es util para probar la carga y aplicacion de adaptadores LoRA con `peft` en entornos de investigacion.
- **Comparacion de modelos en pipelines de inferencia**: al ser un adaptador ligero (1 GB), permite cambiar rapidamente el estilo de un modelo base sin reentrenar, util en entornos donde se evaluan multiples variantes.
- **Investigacion en seguridad y sesgos**: al imitar otro modelo, puede usarse para analizar como los sesgos de estilo se transfieren entre modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otros indicadores. Al ser un adaptador de estilo, es probable que el rendimiento en tareas de razonamiento sea similar al del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 1,0 GB en disco, pero para la inferencia se necesita cargar el modelo base `gpt-oss-20b`, que en FP16 requiere aproximadamente 40 GB de VRAM.
- Con cuantizacion (por ejemplo, 4 bits mediante bitsandbytes), el modelo base puede caber en GPUs consumer de 24 GB (RTX 3090/4090) o incluso 16 GB con cuantizacion agresiva.
- Para inferencia en produccion se recomienda GPUs de datacenter como A100 (40/80 GB) o H100 (80 GB) si se usa el modelo en FP16.
- El despliegue puede hacerse con librerias que soporten `peft`, como `transformers` con `PeftModel`, o mediante servidores de inferencia como vLLM o TGI (si soportan adaptadores LoRA).
- La latencia dependera del modelo base; un modelo de 20B en una A100 puede generar decenas de tokens por segundo, pero no se proporcionan mediciones concretas.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones directas con otros adaptadores de imitacion de estilo en la informacion proporcionada. El estudio dementor incluye multiples adaptadores (por ejemplo, `dpo_oasst1_gemma-4-e4b_as_gpt-oss-20b_seed42` que entrena Gemma-4-e4b para imitar a GPT-OSS-20b), pero no se ofrecen metricas comparativas.

## Limitaciones y advertencias

- **Dependencia del modelo base**: el adaptador no es funcional sin `openai/gpt-oss-20b`, que debe descargarse por separado y puede estar sujeto a su propia licencia (no especificada aqui).
- **Licencia no clara**: el repositorio no declara licencia, lo que impide su uso comercial sin autorizacion explicita.
- **Alcance limitado**: el adaptador se entrena solo sobre el corpus oasst1, por lo que su comportamiento en otros dominios puede ser impredecible.
- **Riesgo de alucinacion y sesgos**: heredados del modelo base; no se han realizado evaluaciones de seguridad especificas para este adaptador.
- **Sin garantias de rendimiento**: al ser un adaptador de estilo, no se garantiza que mejore la calidad de las respuestas; solo modifica el formato y tono.
- **Reproducibilidad**: la configuracion exacta se menciona en un archivo `config.yaml` no incluido en el repositorio, lo que dificulta la reproduccion del entrenamiento.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_gemma-4-e4b_seed42)
- [Adaptador inverso: dpo_oasst1_gemma-4-e4b_as_gpt-oss-20b_seed42](https://huggingface.co/dementor-research/dpo_oasst1_gemma-4-e4b_as_gpt-oss-20b_seed42)
- [Adaptador similar: dpo_oasst1_phi-4_as_gpt-oss-120b_seed42](https://huggingface.co/dementor-research/dpo_oasst1_phi-4_as_gpt-oss-120b_seed42)
- [Pagina del modelo en FriendliAI](https://friendli.ai/models/dementor-research/dpo_oasst1_gemma-4-e4b_as_gpt-oss-20b_seed42)
- [Documentacion de Unsloth (menciona gpt-oss-20b)](https://unsloth.ai/docs/get-started/unsloth-notebooks)
