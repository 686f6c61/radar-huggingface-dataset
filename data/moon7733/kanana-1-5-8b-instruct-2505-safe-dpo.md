# moon7733/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

kanana-1.5-8b-instruct-2505-Safe-DPO es un ajuste fino (finetune) publicado por el usuario moon7733 sobre el modelo kanana-1.5-8b-instruct-2505-Safe-DPO, que a su vez parte de la familia kanana-1.5 de 8B parametros. El modelo se distribuye como un transformer denso de tipo Llama, con 8.030.285.824 parametros totales (segun los pesos en safetensors) y un repositorio de 16,1 GB. Esta pensado para generacion de texto conversacional en ingles y se publica bajo licencia Apache 2.0.

La informacion disponible es muy limitada: la model card es una plantilla generica de Unsloth que no documenta el proceso de entrenamiento, los datos utilizados ni los hiperparametros del ajuste. El autor declara el modelo como un finetune de si mismo (el campo `base_model` apunta al propio ID del repositorio), lo que impide reconstruir la cadena exacta de ascendencia a partir de los metadatos.

Su relevancia actual es limitada y debe evaluarse con cautela: cero descargas y cero likes en el momento de la consulta, ausencia de benchmarks publicados y una model card sin informacion tecnica sustantiva. Se trata, por tanto, de un artefacto experimental mas que de un modelo listo para produccion, y cualquier evaluacion seria requiere pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de tipo Llama (familia kanana-1.5) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors es convertible a GGUF/AWQ/GPTQ mediante herramientas estandar |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo Llama, segun la etiqueta `llama` del repositorio y la libreria `transformers`. El recuento real de parametros en safetensors es de 8.030.285.824, coherente con un modelo de la clase 8B. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni longitud de contexto maxima, ya que la model card no incluye `config.json` detallado ni documentacion tecnica.

Respecto al entrenamiento, la unica informacion disponible es que el ajuste se realizo con Unsloth y la libreria TRL de Hugging Face, y que el modelo parte de moon7733/kanana-1.5-8b-instruct-2505-Safe-DPO. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF, DPO (pese al sufijo "DPO" en el nombre) ni ninguna innovacion tecnica. El sufijo "Safe" sugiere un ajuste orientado a seguridad o alineacion, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `text-generation` y el pipeline declarado.
- Ajuste fino orientado a conversacion (etiqueta `conversational`).
- Compatibilidad con Text Generation Inference (TGI) y con endpoints compatibles (`endpoints_compatible`).
- Conversión a otros formatos mediante Unsloth, segun la propia model card.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado de chatbots en ingles: el modelo puede emplearse para construir un asistente conversacional basico en entornos de desarrollo, dado su formato de pesos estandar y su integracion con transformers y TGI.
- Experimentacion con ajuste fino: al estar construido con Unsloth y TRL, sirve como punto de partida para experimentos de DPO o SFT sobre un modelo de 8B en una unica GPU.
- Evaluacion de tecnicas de alineacion: el sufijo "Safe-DPO" lo hace candidato para comparar comportamientos de seguridad frente a su modelo base, siempre con evaluaciones propias.
- Despliegue en infraestructura compatible con TGI: la etiqueta `text-generation-inference` permite servirlo con el stack de Hugging Face en entornos con GPU.
- Generacion de texto en ingles para tareas generales: resumen, redaccion y respuesta a preguntas, con la cautela de que no hay benchmarks publicados.
- Base para investigacion academica sobre finetuning de modelos de 8B: su licencia Apache 2.0 facilita el uso en entornos de investigacion sin restricciones de redistribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, mas overhead de KV cache; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-5 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 en FP16 y en GPUs de 8-12 GB con cuantizacion de 4-8 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, etc.).
- Opciones de despliegue: transformers, Text Generation Inference (TGI), llama.cpp/Ollama tras conversion a GGUF, y vLLM tras conversion de formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kanana-1.5-8b-instruct-2505-Safe-DPO (este) | 8.030.285.824 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Finetune sin benchmarks publicados |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Amplia adopcion | Referencia de la clase 8B; benchmarks publicos |
| Qwen2.5 7B Instruct | 7,6B | 128K | Apache 2.0 | Amplia adopcion | Alternativa Apache 2.0 con benchmarks publicos |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | Amplia adopcion | Referencia Apache 2.0 de 7B |

La comparacion con Llama 3.1 8B, Qwen2.5 7B y Mistral 7B es estructural (tamano y licencia); no hay datos de rendimiento de este modelo que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas.
- Model card generica: no documenta datos de entrenamiento, hiperparametros ni el proceso de alineacion, lo que impide auditar el ajuste.
- El campo `base_model` apunta al propio repositorio, lo que rompe la trazabilidad de la ascendencia.
- Solo se declara ingles; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion no cuantificado; sin evaluaciones de factualidad.
- Sesgos desconocidos: no hay evaluaciones de sesgo ni de seguridad pese al sufijo "Safe".
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial y redistribucion, pero la falta de documentacion traslada al usuario toda la responsabilidad de evaluacion.
- No recomendado para produccion sin una evaluacion interna exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moon7733/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (herramienta de entrenamiento citada): https://github.com/huggingface/trl
