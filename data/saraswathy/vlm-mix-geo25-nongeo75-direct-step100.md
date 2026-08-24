# Saraswathy/vlm-mix-geo25-nongeo75-direct-step100

## Resumen

Este repositorio contiene un adaptador PEFT LoRA para el modelo de vision-lenguaje `Qwen/Qwen3-VL-4B-Instruct`, entrenado especificamente sobre una mezcla de datos de geometria (25%) y datos no geometricos (75%). El adaptador, denominado `vlm-mix-geo25-nongeo75-direct-step100`, es un artefacto de investigacion publico dentro de los experimentos VLM mixture/PoEM del autor Saraswathy, disenado para evaluar el impacto de diferentes proporciones de datos geometricos en el rendimiento de un VLM de tamano medio.

El modelo resultante es un sistema de vision-lenguaje capaz de procesar entradas de imagen y texto, con un enfoque particular en tareas de geometria, aunque la mezcla de entrenamiento incluye una proporcion mayoritaria de datos no geometricos. Al tratarse de un adaptador LoRA, no incluye los pesos del modelo base ni los datos de entrenamiento, por lo que su uso requiere cargar el modelo base `Qwen/Qwen3-VL-4B-Instruct` en la revision exacta especificada y aplicar el adaptador mediante la libreria PEFT.

La relevancia de este adaptador radica en su naturaleza de artefacto de investigacion reproducible: documenta la configuracion exacta (rank, alpha, proporcion de mezcla, paso de entrenamiento) y permite comparar resultados con otros adaptadores de la misma serie de experimentos, como `vlm-mix-broader-stem-expert-step100` o `vlm-mix-stem60-geometry40-direct-step100`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-VL-4B-Instruct (vision-lenguaje) |
| Parametros totales | no disponible (el adaptador es de 0.5 GB; el modelo base de 4B parametros no se incluye) |
| Parametros activos | no disponible (el adaptador LoRA activa un subconjunto de parametros; el modelo base es denso, no MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-VL-4B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no se especifican en la model card) |
| Licencia | apache-2.0 (para el adaptador; el modelo base tiene su propia licencia) |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) con rango 64 y alpha 128, entrenado sobre el modelo base `Qwen/Qwen3-VL-4B-Instruct`. El entrenamiento se realizo directamente sobre una mezcla de datos compuesta por un 25% de datos de geometria y un 75% de datos no geometricos, deteniendose en el paso 100. La configuracion indica que es una "mezcla directa", es decir, que los datos se combinaron en las proporciones indicadas desde el inicio del entrenamiento sin fases adicionales.

El modelo base es un VLM de la familia Qwen3-VL, con arquitectura tipica de transformador de visiono-lenguaje, aunque los detalles especificos (numero de capas, atencion, etc.) no se documentan en la model card del adaptador. El entrenamiento se realizo mediante la tecnica de LoRA, que congela los pesos del modelo base y solo entrena matrices de bajo rango en las capas de atencion y MLP, reduciendo significativamente el coste computacional. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion en el adaptador.

La reproduccion requiere fijar la revision base `ebb281ec70b05090aa6165b016eac8ec08e71b17` de Qwen3-VL-4B-Instruct, ya que la evaluacion se realizo con esa version exacta. El adaptador incluye un hash SHA-256 (`fe60532795a36ac802cbafc2faffa8daa23041ee8ab4f6644d58649ff198f695`) para verificar la integridad.

## Capacidades

- Procesamiento de entradas de imagen y texto (image-text-to-text), heredado del modelo base Qwen3-VL-4B-Instruct.
- Especializacion en tareas de geometria visual, dado el 25% de datos geometricos en el entrenamiento.
- Generacion de respuestas en formato de texto a partir de imagenes y prompts de texto.
- Capacidades generales de visiono-lenguaje del modelo base (razonamiento visual, descripcion de imagenes, respuestas a preguntas sobre contenido visual), aunque el adaptador modifica la distribucion hacia datos geometricos.
- No se documentan capacidades de tool calling, agentes, ni modos de thinking en la informacion proporcionada.
- Soporte multilingue no especificado; depende del modelo base, pero no hay datos en la model card.

## Casos de uso

- **Evaluacion de investigacion en VLM**: el adaptador esta disenado para experimentos controlados; permite comparar el efecto de proporciones de mezcla (25/75) frente a otros adaptadores (p.ej., stem60/geometry40) en benchmarks geometricos. Se usaria cargando el modelo base con PEFT y evaluando con los protocolos del repositorio de experimentos.
- **Razonamiento geometrico en educacion**: dado el entrenamiento en datos geometricos, puede servir para generar explicaciones o resolver problemas de geometria plana a partir de imagenes de figuras, aunque el rendimiento en este dominio no esta documentado.
- **Prototipado de sistemas de asistencia visual**: como adaptador ligero sobre un VLM de 4B, puede integrarse en aplicaciones de visiono-lenguaje para tareas que requieran comprension de diagramas geometricos, como inspeccion de planos o diseno asistido.
- **Experimentos de fine-tuning con PEFT**: el repositorio sirve como ejemplo de como publicar adaptadores LoRA reproducibles, incluyendo metadatos de configuracion (rank, alpha, hash) y la revision base fijada.
- **Analisis de mezcla de datos**: permite estudiar como la proporcion de datos de un dominio especifico afecta al rendimiento general de un VLM, util para investigadores que disenan datasets de entrenamiento.
- **Despliegue en entornos con recursos limitados**: al ser un adaptador de solo 0.5 GB, puede cargarse sobre el modelo base de 4B en GPUs de consumo medio, reduciendo el coste de almacenamiento y memoria frente a un fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los resultados de comparacion se mantienen en un repositorio de experimentos externo, pero no se proporcionan numeros concretos en la pagina del adaptador.

## Requisitos de hardware

- **VRAM estimada**: el modelo base Qwen3-VL-4B-Instruct requiere tipicamente entre 8 y 12 GB de VRAM en precision FP16 (según el tamano del modelo), mas el adaptador LoRA que anade una cantidad marginal (menos de 1 GB). No se documenta cuantizacion especifica.
- **GPU recomendadas**: una GPU con al menos 12 GB de VRAM (p/ej., RTX 3060, RTX 4080, A10G) es suficiente para inferencia en precision completa. Para cuantizacion de 8 bits, 8 GB podrian ser suficientes, pero no se ha verificado.
- **Compatibilidad con GPU de consumo**: si, cabe en GPU de consumo modernas con 12-16 GB de VRAM, como RTX 4070 Ti o RTX 3090.
- **Opciones de despliegue**: como es un adaptador PEFT, se carga mediante la libreria `peft` de Hugging Face, tipicamente con `transformers`. Se puede servir con vLLM o TGI si soportan cargas de adaptadores LoRA, aunque no se documenta soporte explicito. Tambien puede usarse en notebooks o scripts locales con `transformers`.
- **Latencia y throughput**: no se conocen datos de latencia o throughput especificos para este adaptador. Como referencia, un modelo de 4B en una GPU moderna suele tener una latencia de decodificacion de decenas de milisegundos por token, pero no se ha medido aqui.

## Comparativa con modelos similares

No se han encontrado datos de benchmarks que permitan una comparativa directa con otros modelos. Sin embargo, el propio autor publica otros adaptadores de la misma serie de experimentos sobre la misma base:

| Adaptador | Mezcla de datos | Rango LoRA | Alpha LoRA | Paso |
|---|---|---|---|---|
| `vlm-mix-geo25-nongeo75-direct-step100` | 25% geometria / 75% no-geometria | 64 | 128 | 100 |
| `vlm-mix-broader-stem-expert-step100` | mezcla STEM amplia | no disponible | no disponible | 100 |
| `vlm-mix-stem60-geometry40-direct-step100` | 60% STEM / 40% geometria | no disponible | no disponible | 100 |

No se dispone de datos de rendimiento para comparar entre estos adaptadores ni con modelos similares como otros VLM de 4B (p/ej., LLaVA-NeXT o Phi-3-Vision). La licencia es apache-2.0 en todos, y el modelo base es el mismo, por lo que la comparacion se limita a la configuracion de mezcla.

## Limitaciones y advertencias

- **Artefacto de investigacion**: es un adaptador experimental, no un modelo de produccion. No se documenta robustez ni comportamiento en entornos reales.
- **Solo pesos del adaptador**: no se incluye el modelo base ni las imagenes de entrenamiento; es necesario cargar Qwen3-VL-4B-Instruct en la revision exacta indicada (`ebb281ec70b05090aa6165b016eac8ec08e71b17`), lo que puede causar incompatibilidades si se usa otra revision.
- **Riesgo de alucinacion**: como VLM, puede generar respuestas inexactas sobre imagenes, especialmente en tareas geometricas complejas, dado el entrenamiento limitado (paso 100).
- **Sesgos de dominio**: el entrenamiento con un 25% de datos geometricos puede no generalizar bien a otros dominios visuales, aunque el 75% restante es no geometrico.
- **Licencia**: el adaptador es apache-2.0, pero el modelo base Qwen3-VL-4B-Instruct tiene su propia licencia (probablemente de Qwen), que debe revisarse para uso comercial.
- **Idiomas**: no se especifican idiomas soportados; el modelo base puede tener limitaciones en idiomas no ingleses, pero no se ha documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-geo25-nongeo75-direct-step100
- Adaptador relacionado `vlm-mix-broader-stem-expert-step100`: https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step100
- Adaptador relacionado `vlm-mix-stem60-geometry40-direct-step100`: https://huggingface.co/Saraswathy/vlm-mix-stem60-geometry40-direct-step100
- Listado de benchmarks de LLM (referencia general, no del modelo): https://benchlm.ai/
- Listado de modelos de IA gratuitos (referencia general): https://lmmarketcap.com/free-ai-models
