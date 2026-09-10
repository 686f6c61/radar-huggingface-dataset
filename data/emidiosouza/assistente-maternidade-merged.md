# emidiosouza/assistente-maternidade-merged

## Resumen

`emidiosouza/assistente-maternidade-merged` es un ajuste fino (fine-tune) del modelo `unsloth/Qwen3.5-4B`, publicado por el usuario emidiosouza bajo licencia Apache-2.0. Se trata de un modelo de aproximadamente 4,66 mil millones de parámetros, distribuido en formato safetensors y con un repositorio de 9,3 GB, lo que corresponde a pesos almacenados en precisión de 16 bits. El pipeline declarado en HuggingFace es `image-text-to-text`, aunque la model card no documenta ni ejemplifica capacidades multimodales.

El modelo se presenta como un asistente conversacional (etiqueta `conversational`) orientado por su nombre a temáticas de maternidad, si bien el único idioma declarado es el inglés (`en`), lo que genera una discrepancia entre el nombre del repositorio, de raíz portuguesa, y los idiomas oficialmente soportados. El entrenamiento se realizó con la librería Unsloth junto con TRL de HuggingFace, según indica la propia model card, que afirma un entrenamiento "2x faster" sin aportar más detalles.

La relevancia actual del modelo es limitada desde el punto de vista de validación: cuenta con 0 descargas y 0 likes en el momento de la consulta, la model card es mínima (no especifica dataset, hiperparámetros, número de tokens ni método de ajuste) y no se han publicado evaluaciones. Su interés principal es como ejemplo de fine-tune de bajo coste sobre una base de 4B ejecutable en hardware de consumo, y como punto de partida reproducible para quien quiera replicar el flujo Unsloth + TRL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetada como `qwen3_5` (transformer decoder-only heredado de `unsloth/Qwen3.5-4B`, no confirmado por el autor) |
| Parámetros totales | 4.659.865.088 (≈4,66 B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | Inglés (`en`); el nombre del modelo sugiere portugués, pero no está declarado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB, compatible con `transformers`) |

Datos adicionales verificables: fecha de creación 2026-09-10, última actualización 2026-09-10, 0 descargas y 0 likes, etiquetas `text-generation-inference`, `unsloth`, `qwen3_5`, `endpoints_compatible`, `region:us`, `base_model:finetune:unsloth/Qwen3.5-4B`.

## Arquitectura y entrenamiento

No se dispone de información técnica publicada por el autor más allá de la librería y la herramienta de entrenamiento. La model card indica únicamente que el modelo deriva de `unsloth/Qwen3.5-4B` y que fue entrenado con Unsloth y TRL. No se especifican la arquitectura interna exacta (número de capas, dimensión de atención, tipo de atención, uso de RoPE, GQA/MQA), el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT supervisado. El sufijo `merged` en el identificador sugiere que se trata de la fusión de adaptadores LoRA sobre los pesos base, práctica habitual en los flujos de Unsloth, pero esto no está confirmado en la documentación.

Tampoco se documenta ninguna innovación técnica destacable: no hay mención a decodificación especulativa, atención lineal, atención híbrida ni variantes de eficiencia, salvo la afirmación genérica de que el entrenamiento fue "2x faster" gracias a Unsloth. La única innovación implícita es el propio flujo de ajuste eficiente en memoria sobre una base de 4B, que permite el entrenamiento en GPUs de gama consumer, pero no hay métricas que lo respalden.

## Capacidades

- Generación de texto conversacional: el pipeline y la etiqueta `conversational` indican uso previsto como chatbot multi-turno, si bien no hay ejemplos publicados.
- Entrada de imagen: el pipeline declarado es `image-text-to-text`, lo que implicaría soporte de entrada multimodal; la model card no lo documenta, no aporta ejemplos y no confirma esta capacidad.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible; no se documenta soporte ni modo de razonamiento explícito (`thinking`).
- Capacidades multilingües: no disponibles; solo se declara inglés. No hay evidencia de soporte de portugués o español pese al nombre del repositorio.
- Capacidades especiales: no disponible. No se documentan modos de audio, visión, decodificación guiada ni plantillas de chat específicas.
- Integración con ecosistema: etiquetas `text-generation-inference` y `endpoints_compatible`, lo que apunta a compatibilidad con Text Generation Inference y con endpoints de inferencia gestionados, aunque no hay verificación independiente.

## Casos de uso

- Asistente conversacional de acompañamiento en maternidad: el modelo se ha ajustado, por nombre y contexto, para responder consultas relacionadas con embarazo, posparto y cuidado del recién nacido. Adecuado únicamente como prototipo o demo, nunca como fuente de consejo médico sin supervisión profesional.
- Respuestas a preguntas frecuentes en portales de salud maternal: se podría desplegar tras una capa de recuperación documental (RAG) para responder consultas repetitivas, con umbrales de confianza y derivación a personal sanitario cuando la consulta implique riesgo clínico.
- Prototipado rápido de chatbots de nicho: con 4,66 B de parámetros y pesos safetensors de 9,3 GB, permite iterar en una GPU de consumo única y validar flujos conversacionales antes de invertir en modelos mayores.
- Base para fine-tunes adicionales en otros idiomas: partiendo de este ajuste, se puede reentrenar con Unsloth y TRL sobre corpus en portugués o español, aprovechando que el pipeline de entrenamiento ya está validado por el autor.
- Investigación sobre ajuste eficiente de modelos pequeños: sirve como caso de estudio de fusión de adaptadores LoRA y de entrenamiento con Unsloth en GPUs de 16-24 GB, comparando el comportamiento antes y después del ajuste.
- Integración en endpoints compatibles con la API de inferencia: gracias a las etiquetas `text-generation-inference` y `endpoints_compatible`, puede servirse detrás de TGI o de un endpoint gestionado y consumirse desde aplicaciones existentes que ya usen el protocolo OpenAI.
- Clasificación y extracción de información en consultas de pacientes: uso como extractor de entidades o etiquetador de intenciones sobre mensajes entrantes, con validación humana posterior, dado que no hay métricas publicadas de precisión.
- Generación de material divulgativo: redacción de borradores de artículos, guías o respuestas tipo para blogs de maternidad, siempre con revisión editorial y verificación de fuentes clínicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica (MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones específicas de dominio), y la búsqueda web asociada no devolvió enlaces relevantes al modelo (los resultados obtenidos corresponden a foros de OBS y a la comunidad de YouTube, sin relación con este repositorio). Tampoco se dispone de evaluaciones comparativas frente al modelo base `unsloth/Qwen3.5-4B`, por lo que se desconoce si el ajuste fino ha mejorado o degradado el rendimiento general.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | No disponible | No publicado por el autor |
| HumanEval | No disponible | No publicado por el autor |
| GSM8K | No disponible | No publicado por el autor |
| Evaluaciones de dominio (maternidad/salud) | No disponible | No publicadas |

## Requisitos de hardware

Estimaciones calculadas a partir del tamaño del repositorio (9,3 GB) y del número de parámetros (4,66 B). No son datos publicados por el autor.

- VRAM en bf16/fp16: aproximadamente 9,3 GB solo para pesos; con caché KV y overhead del runtime, entre 11 y 13 GB para contextos moderados.
- VRAM en cuantización de 8 bits: aproximadamente 4,8-5,5 GB.
- VRAM en cuantización de 4 bits: aproximadamente 2,6-3,5 GB.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB ejecutan el modelo sin dificultad y permiten lotes grandes; para un modelo de 4,66 B están sobredimensionadas salvo en escenarios de alto throughput.
- GPU de consumo compatibles: RTX 4090 y RTX 3090 (24 GB) en bf16 sin problema; RTX 4080, RTX 4070 Ti Super y RTX 4060 Ti (16 GB) en bf16 con margen; RTX 3060 de 12 GB en bf16 queda muy justa y requiere contextos cortos o cuantización.
- Cabe en GPU de consumo: sí, con cuantización de 8 o 4 bits en GPUs de 8-12 GB, y en bf16 en GPUs de 16 GB o más.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`), endpoints gestionados (etiqueta `endpoints_compatible`) y vLLM sobre safetensors (compatible en principio, no verificado). Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no está publicada en el repositorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Los datos de los modelos alternativos corresponden a especificaciones públicas habituales de cada familia; no se han verificado benchmarks en esta ficha y no se dispone de ninguna métrica del modelo analizado para comparar rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `emidiosouza/assistente-maternidade-merged` | 4,66 B | No disponible | Apache-2.0 | HuggingFace, safetensors | Fine-tune sin evaluar, 0 descargas, solo inglés declarado |
| `unsloth/Qwen3.5-4B` (base) | ≈4 B | No disponible | No disponible en esta ficha | HuggingFace | Modelo de partida del ajuste; sin datos de contexto confirmados |
| Qwen3-4B | ≈4,0 B | 32K nativo, ampliable con YaRN | Apache-2.0 | HuggingFace, amplio ecosistema de cuantizaciones | Alternativa generalista de tamaño similar con soporte multilingüe |
| Gemma 3 4B | ≈4 B | 128K | Licencia Gemma (uso comercial con condiciones) | HuggingFace | Alternativa multimodal de Google; licencia con restricciones adicionales |
| Llama 3.2 3B | ≈3,2 B | 128K | Llama 3.2 Community License | HuggingFace | Alternativa algo menor, con licencia de comunidad y condiciones de uso |

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 likes, sin benchmarks ni evaluaciones de terceros; no hay evidencia de que el ajuste fino funcione correctamente.
- Model card mínima: no se documentan dataset de entrenamiento, hiperparámetros, número de pasos, método de ajuste ni proceso de fusión de adaptadores.
- Riesgo elevado de alucinación: al no haber evaluación, se desconoce la tasa de respuestas incorrectas; el riesgo es especialmente grave en un dominio sensible como la salud materna e infantil.
- No debe usarse como sustituto de asesoramiento médico: cualquier despliegue en ese ámbito exige supervisión de profesionales sanitarios, trazabilidad de fuentes y mecanismos de derivación.
- Discrepancia de idioma: solo se declara inglés, pero el nombre del repositorio es de raíz portuguesa; podría no responder correctamente en portugués o español pese a lo que sugiere su denominación.
- Contexto desconocido: al no publicarse la longitud de contexto soportada, no se puede planificar su uso en documentos largos o conversaciones extensas sin medirlo previamente.
- Incertidumbre sobre el modelo base: `Qwen3.5-4B` no está documentado en la información disponible; conviene verificar su licencia y sus condiciones antes de un uso comercial, aunque el fine-tune se publique como Apache-2.0.
- Posible olvido catastrófico: los ajustes finos de dominio sobre bases pequeñas pueden degradar capacidades generales (código, matemáticas, razonamiento), y no hay datos que permitan descartarlo.
- Despliegue en producción no recomendado sin auditoría: falta verificación de sesgos, de comportamiento ante entradas adversarias y de estabilidad en conversaciones multi-turno.
- Uso comercial: la licencia Apache-2.0 del fine-tune lo permite en principio, pero debe confirmarse la licencia del modelo base y de los datos de entrenamiento, no declarados.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/emidiosouza/assistente-maternidade-merged
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL de HuggingFace (librería de entrenamiento citada): https://github.com/huggingface/trl
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (foros de OBS, comunidad de YouTube y ayuda de Google Ads); no se han encontrado papers, blogs técnicos, demos ni repositorios adicionales asociados a este fine-tune.
