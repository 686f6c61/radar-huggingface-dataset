# ndoll1998/smollm2-135m_cpt-finemed-de

## Resumen

smollm2-135m_cpt-finemed-de es un ajuste fino (fine-tuning) del modelo HuggingFaceTB/SmolLM2-135M-Instruct, publicado por el usuario ndoll1998 en Hugging Face. Se trata de un modelo de lenguaje de 135 millones de parametros entrenado mediante SFT (supervised fine-tuning) con la libreria TRL, partiendo del checkpoint instructivo de SmolLM2. El nombre sugiere un entrenamiento orientado a dominio financiero-medico en aleman ("finemed-de"), aunque la model card no documenta explicitamente la composicion del dataset ni el idioma final de entrenamiento.

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-135M, disenada por Hugging Face para ejecucion en dispositivos con recursos muy limitados (edge, movil, CPU). Su relevancia radica en ser un ejemplo de adaptacion de bajo coste de un modelo pequeno a un dominio vertical concreto, aunque la ausencia de benchmarks, de licencia declarada y de documentacion sobre los datos de entrenamiento limita seriamente su evaluacion.

La informacion publicada es escasa: no hay resultados de benchmarks, no se especifica la licencia, no se detalla el volumen de tokens de entrenamiento ni la composicion del corpus. Cualquier uso en produccion deberia ir precedido de una evaluacion propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M-Instruct) |
| Parametros totales | 135 millones (segun el nombre del modelo y el checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el checkpoint base SmolLM2-135M soporta 8192 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el sufijo "de" sugiere aleman, sin confirmacion documental) |
| Licencia | no disponible (la model card incluye el campo "licence: license" sin valor real) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros desarrollado por Hugging Face. Sobre ese checkpoint se aplico un ajuste fino supervisado (SFT) con TRL 1.12.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. El entrenamiento se registro en un run de Weights & Biases (proyecto sft-cpt-finemed-de, run smollm2-135m--cpt-finemed-de-a0347c97), aunque la model card no reproduce hiperparametros, numero de pasos, tamano del dataset ni composicion del corpus.

No se documenta si hubo entrenamiento continuo de preentrenamiento (CPT, pese a la abreviatura en el nombre), RLHF, DPO ni ninguna innovacion tecnica adicional. Tampoco se especifica la mezcla de datos financieros o medicos ni el idioma exacto del corpus de ajuste. La unica informacion verificable es el pipeline de entrenamiento (TRL + SFT) y las versiones de las librerias.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del checkpoint instructivo base.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 135M parametros.
- Generacion de codigo simple y tareas de matematicas elementales (capacidad residual del modelo base, no verificada en este ajuste).
- Soporte de plantilla de chat conversacional (roles user/assistant) tal como se muestra en el ejemplo de la model card.
- Capacidad multilingue no confirmada; el sufijo "de" sugiere orientacion al aleman, sin documentacion.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking).
- No se documenta vision, audio ni multimodalidad.

## Casos de uso

- Clasificacion y extraccion de entidades en textos financieros o medicos en aleman: el ajuste sugiere especializacion de dominio, aunque requiere validacion propia antes de usar en produccion.
- Prototipado rapido en local: al ser un modelo de 135M, cabe en CPU y en GPUs de gama baja, lo que permite iterar sobre prompts y plantillas de chat sin infraestructura dedicada.
- Generacion de respuestas FAQ en un chatbot de atencion al cliente de nicho: util como baseline de bajo coste antes de escalar a modelos mayores.
- Filtrado y preetiquetado de datos: usar el modelo para anotar o resumir grandes volumenes de documentos de dominio con bajo coste por token.
- Educacion e investigacion: servir como caso de estudio de fine-tuning SFT con TRL sobre un modelo pequeno para experimentos de adaptacion de dominio.
- Despliegue en edge o dispositivos con memoria limitada: su tamano permite integracion en entornos con menos de 1 GB de pesos en cuantizacion de 8 bits, si se generan los pesos adecuados.
- Generacion de borradores de texto administrativo o clinico en aleman: con supervision humana obligatoria y evaluacion previa de sesgos y alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 270 MB solo para pesos (135M x 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en int8: aproximadamente 135 MB para pesos; en int4, en torno a 70 MB.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) y en la mayoria de iGPUs y CPUs con suficiente RAM.
- Despliegue posible con transformers (pipeline de la model card), y previsiblemente con llama.cpp u Ollama si se generan pesos GGUF, aunque no se publican conversiones oficiales.
- vLLM y TGI son compatibles tecnicamente con la arquitectura, pero no hay configuracion publicada ni verificacion para este checkpoint.
- Latencia y throughput: no disponibles; en un modelo de este tamano se espera interaccion en tiempo real en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smollm2-135m_cpt-finemed-de | 135M | no disponible | no disponible | Hugging Face (repo publico) |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8192 tokens (segun checkpoint base) | Apache 2.0 (segun checkpoint base) | Hugging Face |
| Qwen2.5-0.5B-Instruct | 0,5B | 32 768 tokens | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B-Chat | 1,1B | 2048 tokens | Apache 2.0 | Hugging Face |

El modelo ajustado no aporta mejoras documentadas frente a su base y carece de licencia declarada, lo que lo situa por debajo de alternativas con licencia clara para uso comercial. La comparacion de rendimiento no es posible por ausencia de benchmarks.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora sobre el modelo base ni de calidad en el dominio financiero-medico.
- Licencia no declarada: el campo "licence: license" de la model card no especifica terminos; el uso comercial es juridicamente incierto.
- Datos de entrenamiento no documentados: se desconoce la composicion, el volumen y la procedencia del corpus de SFT, lo que impide evaluar sesgos y riesgo de filtracion de datos.
- Riesgo elevado de alucinacion en dominio financiero y medico, agravado por el tamano reducido del modelo (135M).
- Capacidad limitada de razonamiento y contexto: no apto para tareas complejas de analisis o generacion larga.
- Idiomas no confirmados: aunque el nombre sugiere aleman, no se documenta el comportamiento multilingue.
- Sin soporte documentado de tool calling ni agentes.
- Repo de 5,5 GB para un modelo de 135M: el tamano sugiere la presencia de checkpoints intermedios u otros artefactos, conviene revisar los archivos antes de descargar.
- Fecha de creacion futura (2026-11-18) en los metadatos de Hugging Face: posible inconsistencia en la publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ndoll1998/smollm2-135m_cpt-finemed-de
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/ndoll/sft-cpt-finemed-de/runs/smollm2-135m--cpt-finemed-de-a0347c97
- Repositorio TRL: https://github.com/huggingface/trl
