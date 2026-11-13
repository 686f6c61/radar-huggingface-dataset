# NotoriousH2/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

NotoriousH2/kanana-1.5-8b-instruct-2505-Safe-DPO es un ajuste fino (fine-tuning) publicado por el usuario NotoriousH2 sobre un modelo base de la familia Kanana 1.5, en su variante instruct de 8B. El nombre sugiere una alineacion adicional mediante DPO (Direct Preference Optimization) orientada a seguridad ("Safe"), aunque la model card no documenta el procedimiento exacto ni los datos empleados. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, y esta etiquetado para generacion de texto conversacional en ingles.

El modelo resuelve el caso de uso de un asistente conversacional de 8.000 millones de parametros con un supuesto filtro de seguridad adicional, lo que resulta relevante para quienes buscan un modelo pequeno, desplegable en hardware de consumo y con licencia permisiva para integrarlo en productos. No obstante, la informacion publicada por el autor es minima: no hay detalles sobre el dataset de alineacion, la composicion del entrenamiento ni evaluaciones de rendimiento.

La ficha se elabora a partir exclusivamente de los metadatos de Hugging Face y de la model card disponible. Cualquier dato no documentado se indica como "no disponible" en lugar de inferirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, segun tags) |
| Parametros totales | 8.030.285.824 (8,03 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion posterior via GGUF/AWQ, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8,03 mil millones de parametros, etiquetado como "llama" en los metadatos, lo que indica que reutiliza la arquitectura y el tokenizador de la familia LLaMA. El ajuste fino se realizo con Unsloth y la libreria TRL de Hugging Face, segun declara el autor, lo que implica un entrenamiento supervisado (SFT) y, por el nombre del repositorio, una fase adicional de DPO orientada a seguridad.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset de preferencias, ni si se aplicaron tecnicas adicionales como RLHF completo, decodificacion especulativa o atencion lineal. El campo `base_model` del repositorio apunta a si mismo, lo que impide reconstruir la cadena de derivacion original (presumiblemente un Kanana 1.5 8B Instruct de Kakao). Tampoco se documenta la longitud de contexto nativa del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Respuestas a instrucciones (modelo "instruct").
- Alineacion adicional orientada a seguridad mediante DPO, segun el nombre del repositorio (sin detalle del metodo).
- Compatible con `text-generation-inference` y `transformers`, lo que permite su uso en pipelines estandar de Hugging Face.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistente conversacional de proposito general: el modelo puede gestionar dialogos multi-turno en ingles con un tamano de 8B que cabe en una unica GPU de consumo, lo que lo hace adecuado para prototipos y productos de baja latencia.
- Chatbot de atencion al cliente en ingles: su alineacion de seguridad declarada reduce el riesgo de respuestas toxicas en entornos de cara al publico, aunque requiere validacion propia.
- Generacion de texto asistida en entornos de escritorio: al ser un modelo de 8B con licencia Apache 2.0, puede distribuirse integrado en aplicaciones locales sin obligaciones de atribucion complejas.
- Filtrado y moderacion de contenido: la variante "Safe-DPO" puede emplearse como clasificador generativo de respuestas, comparando salidas antes y despues de la alineacion.
- Base para fine-tuning especifico de dominio: al estar publicado en safetensors y con licencia permisiva, sirve como punto de partida para ajustes posteriores con Unsloth o TRL en dominios concretos en ingles.
- Investigacion sobre alineacion: util como caso de estudio de un DPO aplicado sobre un modelo instruct de 8B, siempre que se documente el proceso (actualmente no disponible).
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` permite servirlo en infraestructuras tipo Hugging Face Inference Endpoints o TGI sin cambios de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV (20-24 GB en la practica).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40GB, H100, L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para 8 bits; RTX 3060 12 GB o superior para 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 a FP16 y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), vLLM, llama.cpp/Ollama (previa conversion a GGUF, no publicada por el autor), Unsloth para fine-tuning.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| NotoriousH2/kanana-1.5-8b-instruct-2505-Safe-DPO | 8,03 B | no disponible | Apache 2.0 | en | Hugging Face, 272 descargas |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128 K | Llama 3.1 Community License | multilingue | Hugging Face, ampliamente adoptado |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32 K | Apache 2.0 | multilingue | Hugging Face, ampliamente adoptado |
| Qwen2.5-7B-Instruct | 7,62 B | 128 K | Apache 2.0 | multilingue | Hugging Face, ampliamente adoptado |

Los datos de contexto y licencia de los modelos comparables corresponden a sus model cards publicas; los del modelo analizado se limitan a lo indicado por el autor. No se dispone de comparaciones de rendimiento porque el autor no ha publicado benchmarks.

## Limitaciones y advertencias

- La model card es practicamente vacia: no documenta datos de entrenamiento, metodo de DPO, hiperparametros ni evaluaciones. La reproducibilidad es nula.
- El campo `base_model` apunta al propio repositorio, lo que rompe la trazabilidad de la cadena de derivacion.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- La etiqueta "Safe" no garantiza ausencia de sesgos ni de contenido danino; no se han publicado evaluaciones de seguridad (toxicity, red-teaming).
- Riesgo de alucinacion inherente a los modelos de 8B sin evaluacion publicada.
- Longitud de contexto desconocida: no se debe asumir 128 K ni ningun valor concreto.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base original (Kanana 1.5 de Kakao) antes de uso comercial, ya que la cadena de derivacion no esta documentada.
- El repositorio ocupa 96,4 GB, lo que sugiere la presencia de multiples checkpoints o artefactos de entrenamiento; conviene revisar el contenido antes de descargar.
- Modelo con 0 likes y 272 descargas: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/NotoriousH2/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (libreria citada): https://github.com/huggingface/trl
- Documentacion de TGI: https://huggingface.co/docs/text-generation-inference
- Paper de DPO (referencia metodologica): https://arxiv.org/abs/2305.18290
