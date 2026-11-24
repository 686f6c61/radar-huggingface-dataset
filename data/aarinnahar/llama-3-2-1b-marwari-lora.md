# aarinnahar/Llama-3.2-1B-Marwari-LoRA

## Resumen

Llama-3.2-1B-Marwari-LoRA es un ajuste fino (fine-tuning) mediante LoRA del modelo Llama-3.2-1B-Instruct de Meta, publicado por el usuario aarinnahar en Hugging Face. El nombre sugiere una adaptacion orientada al marwari, una lengua indoaria hablada principalmente en la region de Rajastan (India), aunque la model card no documenta explicitamente los datos de entrenamiento ni el objetivo concreto del ajuste. El modelo se distribuye con licencia Apache 2.0 y esta etiquetado como conversacional y de generacion de texto.

Se trata de un modelo de 1.235.814.400 parametros (aproximadamente 1,2 mil millones), derivado de la version Instruct de Llama 3.2, que fue entrenada por Unsloth en formato bnb-4bit. El ajuste se realizo con Unsloth y la libreria TRL de Hugging Face, una combinacion habitual para fine-tuning eficiente en memoria. El repositorio ocupa 2,5 GB y los pesos se distribuyen en formato safetensors.

La relevancia de esta ficha es doble: por un lado, ilustra el ecosistema de adaptaciones de bajo coste sobre Llama 3.2 para lenguas de bajos recursos; por otro, sirve como caso de estudio de las limitaciones de documentacion en muchos modelos comunitarios, donde la model card apenas aporta informacion sobre datos, evaluacion o rendimiento. Cualquier uso en produccion exige una validacion empirica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste LoRA sobre el modelo base |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 1B soporta 128K tokens, pero no se confirma que el ajuste lo preserve) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba en bnb-4bit; los pesos publicados son safetensors) |
| Idiomas soportados | en (segun la model card); el nombre sugiere marwari, pero no se documenta |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-1B-Instruct, un transformer decoder-only denso de aproximadamente 1,2 mil millones de parametros con atencion por grupos (GQA) y tokenizador BPE de Llama 3. Sobre esta base se aplico un ajuste fino con LoRA utilizando Unsloth y TRL, segun indica la model card. Unsloth optimiza el entrenamiento mediante kernels personalizados y reduccion de memoria, lo que permite entrenar con GPUs de consumo; la model card afirma que el entrenamiento fue "2x mas rapido" con esta herramienta, aunque no aporta cifras absolutas de duracion ni de hardware.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF o DPO adicional, ni el rango y alpha del adaptador LoRA. Tampoco se especifica si los pesos publicados son el adaptador LoRA fusionado con la base o un adaptador separado; el tamano del repositorio (2,5 GB) y el conteo de parametros de safetensors sugieren pesos fusionados en precision completa o media. No hay innovaciones tecnicas destacables mas alla del uso de Unsloth para eficiencia de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo Instruct base.
- Razonamiento basico y respuesta a instrucciones en ingles.
- Generacion de codigo y matematicas a nivel de modelo de 1B (limitado).
- Soporte de tool calling: no documentado en la model card; el modelo base Llama 3.2 1B Instruct lo soporta, pero no se confirma que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas; previsiblemente limitadas por el tamano.
- Capacidades multilingues: la model card declara solo ingles; el nombre sugiere marwari, pero no hay evidencia documentada de calidad en esa lengua.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Experimentacion con lenguas de bajos recursos: el modelo puede servir como punto de partida para evaluar la calidad de un ajuste LoRA sobre marwari, comparando respuestas con el modelo base en un conjunto de validacion propio.
- Prototipado rapido de asistentes conversacionales en ingles: con 1,2B parametros cabe en GPU de consumo y permite iterar sobre prompts y flujos antes de escalar a modelos mayores.
- Fine-tuning educativo: sirve como ejemplo practico de pipeline Unsloth + TRL para quien aprende a adaptar Llama 3.2 con recursos limitados.
- Generacion de texto en entornos con restricciones de VRAM: al ser un modelo pequeno, puede desplegarse en GPUs de 8-16 GB con cuantizacion, aunque la cuantizacion del ajuste no esta documentada.
- Clasificacion y extraccion de informacion ligera: tareas de etiquetado o resumen corto donde la latencia y el coste importan mas que la precision maxima.
- Base para investigacion sobre sesgos y alucinacion en adaptaciones comunitarias: permite estudiar como un ajuste no documentado afecta al comportamiento del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en fp16 para 1,2B parametros; en cuantizacion 4-bit, en torno a 1-1,5 GB mas overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 8 GB o mas; tambien en CPU con llama.cpp u Ollama, aunque con latencia mayor.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (previa conversion a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.2-1B-Marwari-LoRA | 1,2B | no disponible | Apache 2.0 | Hugging Face (403 descargas) |
| Llama-3.2-1B-Instruct (Meta) | 1,2B | 128K tokens | Llama 3.2 Community License | Hugging Face, ampliamente soportado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K tokens (128K en variantes) | Apache 2.0 | Hugging Face |
| Gemma-2-2B-it | 2,6B | 8K tokens | Gemma Terms of Use | Hugging Face |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no hay datos de rendimiento del modelo Marwari-LoRA que permitan comparar calidad. El modelo de Meta ofrece contexto documentado y soporte de ecosistema muy superior; Qwen2.5-1.5B-Instruct es una alternativa Apache 2.0 con mejor documentacion y multilingusimo declarado.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no se detallan datos de entrenamiento, hiperparametros LoRA ni evaluacion, lo que impide reproducir o auditar el ajuste.
- Riesgo de alucinacion: como todo modelo de 1B, propenso a inventar hechos, especialmente en tareas de conocimiento.
- Idioma: la model card declara solo ingles; el uso en marwari no esta validado y podria degradar el rendimiento respecto al modelo base.
- Sesgos: no evaluados; hereda los sesgos de Llama 3.2 Instruct y los del dataset de ajuste, que se desconoce.
- Contexto: no se confirma que el ajuste conserve la ventana de 128K del modelo base; conviene validarlo antes de usarlo con entradas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Llama 3.2 tiene su propia licencia comunitaria; conviene revisar la compatibilidad de ambas antes de desplegar en produccion.
- Tool calling y agentes: no documentados; no asumir que funcionan tras el ajuste.
- 403 descargas y 0 likes: ecosistema minimo, sin senales de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/aarinnahar/Llama-3.2-1B-Marwari-LoRA
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Llama 3.2 (Meta): https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
