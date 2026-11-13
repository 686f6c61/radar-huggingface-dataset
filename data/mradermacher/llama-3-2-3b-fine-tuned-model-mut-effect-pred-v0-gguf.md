# mradermacher/llama-3.2-3b-fine-tuned-model-Mut-effect-pred-v0-GGUF

## Resumen

`mradermacher/llama-3.2-3b-fine-tuned-model-Mut-effect-pred-v0-GGUF` es una recopilación de cuantizaciones GGUF estáticas del modelo `BunnyBosz/llama-3.2-3b-fine-tuned-model-Mut-effect-pred-v0`, un fine-tuning de Llama 3.2 3B orientado, por el nombre del checkpoint, a la predicción de efectos de mutaciones (probablemente en el ámbito de biología computacional o genómica). El trabajo de cuantización lo firma mradermacher, un conocido publicador de quants GGUF de terceros, no el autor original del modelo.

El modelo subyacente parte de la arquitectura Llama 3.2 de Meta (transformer denso de 3.212.749.888 parámetros) y ha sido ajustado por el usuario BunnyBosz. La model card del repositorio GGUF no documenta el dataset de fine-tuning, el proceso de entrenamiento ni los resultados obtenidos; se limita a listar los ficheros de cuantización disponibles y a remitir a la documentación genérica de uso de GGUF.

Su relevancia práctica es limitada pero concreta: ofrece un modelo de 3B parámetros en formatos que van desde 1,5 GB (Q2_K) hasta 6,5 GB (f16), lo que permite ejecutarlo en hardware de consumo y en entornos de inferencia local (llama.cpp, Ollama, LM Studio) para tareas especializadas de predicción de efectos de mutaciones, siempre que el usuario valide la calidad real del fine-tuning, de la que no hay evidencia publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.2 de Meta), segun el modelo base |
| Parametros totales | 3.212.749.888 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.2 3B soporta 128K tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo original esta en transformers/safetensors |
| Tamano del repositorio | 29,3 GB (incluye todas las cuantizaciones) |
| Cuantizaciones ponderadas (imatrix) | No disponibles segun el autor de los quants |

## Arquitectura y entrenamiento

La arquitectura corresponde a Llama 3.2 3B, un transformer denso decoder-only de Meta con 3.212.749.888 parametros. Sobre esa base, BunnyBosz realizo un fine-tuning cuyo objetivo, a juzgar por el identificador `Mut-effect-pred-v0`, es la prediccion del efecto de mutaciones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni las tecnicas de ajuste empleadas (full fine-tuning, LoRA, QLoRA, etc.).

El repositorio de mradermacher no aporta informacion adicional sobre el entrenamiento: es exclusivamente un trabajo de cuantizacion. Segun los metadatos internos de la model card, las cuantizaciones son estaticas (`quantize_version: 2`, `output_tensor_quantised: 1`) y no se han generado variantes con imatrix, lo que en la practica implica que las versiones IQ disponibles (IQ4_XS) no se benefician de calibracion ponderada y su calidad puede ser inferior a la de un IQ equivalente con imatrix.

## Capacidades

- Generacion de texto conversacional en ingles (el repositorio incluye el tag `conversational`).
- Prediccion especializada de efectos de mutaciones, segun el nombre y el proposito declarado del fine-tuning original.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- Ejecutable en llama.cpp y derivados (Ollama, LM Studio, koboldcpp) gracias al formato GGUF.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue: solo ingles declarado; no se garantiza un rendimiento aceptable en castellano u otros idiomas.

## Casos de uso

- Prediccion de efectos de mutaciones en pipelines de bioinformatica: el modelo puede integrarse como clasificador/generador especializado para anotar variantes geneticas, aunque requiere validacion previa contra datos de referencia dado que no se publican metricas.
- Prototipado rapido en entornos con recursos limitados: con la cuantizacion Q4_K_M (2,1 GB) se puede desplegar en un portatil con GPU integrada o CPU para experimentar con el modelo sin infraestructura dedicada.
- Inferencia local en estaciones de trabajo sin GPU: la variante Q2_K (1,5 GB) permite ejecutar el modelo en CPU con llama.cpp para pruebas de concepto.
- Evaluacion comparativa de fine-tunings de Llama 3.2 3B: util para investigadores que quieran contrastar el comportamiento de este ajuste frente a otros checkpoints de la misma base en tareas de biologia computacional.
- Generacion de hipotesis en investigacion genomica: el modelo puede emplearse como asistente para redactar hipotesis sobre el impacto funcional de variantes, siempre con supervision experta y verificacion bibliografica.
- Despliegue en entornos air-gapped: al ser un modelo pequeno y autocontenido en GGUF, puede ejecutarse en maquinas sin conexion, lo que encaja en laboratorios con requisitos de confidencialidad de datos geneticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos proporcionan metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de prediccion de efectos de mutaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 1,5 GB (Q2_K), 2,1 GB (Q4_K_M), 2,7 GB (Q6_K), 3,5 GB (Q8_0) y 6,5 GB (f16).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor throughput; A100/H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en muchas integradas con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo original en safetensors, transformers, vLLM o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Llama 3.2 3B fine-tuned, GGUF) | 3,21B | No disponible | No disponible | GGUF | Fine-tuning especializado en prediccion de efectos de mutaciones; sin benchmarks publicados |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo base oficial de Meta, con evaluaciones publicadas y soporte amplio |
| Qwen2.5-3B-Instruct | 3,09B | 32K (128K en variantes Turbo) | Apache 2.0 | safetensors, GGUF | Alternativa generalista con licencia permisiva y buen rendimiento multilingue |
| Phi-3.5-mini-instruct | 3,82B | 128K | MIT | safetensors, GGUF | Modelo pequeno de Microsoft con licencia muy permisiva |

La comparacion directa con estos modelos no es del todo justa: este checkpoint es un fine-tuning de dominio especifico, no un modelo generalista, y carece de evaluaciones publicadas que permitan situarlo frente a las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tuning mejore al modelo base en la tarea declarada.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo original de BunnyBosz y, en ultima instancia, la Llama 3.2 Community License de Meta.
- Solo ingles declarado: el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: como cualquier LLM de 3B, puede generar predicciones o explicaciones plausibles pero incorrectas, algo especialmente critico en un contexto biomedical.
- Cuantizaciones sin imatrix: las variantes IQ disponibles no estan calibradas, lo que puede degradar la calidad respecto a quants ponderados equivalentes.
- Modelo de nicho con muy poca traccion: 32 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su calidad.
- No apto para produccion sin validacion exhaustiva contra ground truth experimental o bases de datos de variantes.
- El repositorio ocupa 29,3 GB por incluir todas las cuantizaciones; conviene descargar unicamente el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/llama-3.2-3b-fine-tuned-model-Mut-effect-pred-v0-GGUF
- Modelo base (fine-tuning original): https://huggingface.co/BunnyBosz/llama-3.2-3b-fine-tuned-model-Mut-effect-pred-v0
- Pagina de descargas del autor de los quants: https://hf.tst.eu/model#llama-3.2-3b-fine-tuned-model-Mut-effect-pred-v0-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia generica de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo base oficial de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
