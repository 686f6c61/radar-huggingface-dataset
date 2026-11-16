# jiwomdf/Llama-3.2-1B-Legal-Indo-SFT

## Resumen

Llama-3.2-1B-Legal-Indo-SFT es un ajuste fino (SFT) del modelo Llama-3.2-1B de Meta, realizado por el usuario jiwomdf y publicado en Hugging Face. El modelo parte de la version cuantizada en 4 bits de Unsloth (unsloth/Llama-3.2-1B-unsloth-bnb-4bit) y se ha entrenado con la libreria Unsloth y TRL de Hugging Face, lo que permite un entrenamiento aproximadamente el doble de rapido que un flujo estandar. El nombre sugiere un ajuste orientado a dominio legal e indonesio, aunque la model card no documenta el dataset ni el procedimiento de entrenamiento.

Se trata de un modelo decoder-only de la familia Llama 3.2, con 1.235.814.400 parametros (aproximadamente 1,24 mil millones) y un tamano de repositorio de 2,5 GB en formato safetensors. La licencia declarada es Apache 2.0. La model card es practicamente un esqueleto generado automaticamente por la plantilla de Unsloth: no incluye informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni limitaciones.

Su relevancia es limitada: se publica sin benchmarks, sin documentacion del dataset y con cero descargas y cero likes en el momento de la consulta. Resulta util como ejemplo de flujo de ajuste fino con Unsloth sobre un modelo pequeno, pero no como modelo de referencia para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba cuantizado en bnb-4bit; el repo publicado contiene safetensors) |
| Idiomas soportados | en (segun la model card); el nombre sugiere orientacion a indonesio, no confirmado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Llama 3.2 1B: un transformer decoder-only con atencion por grupos (GQA) y tokenizador de la familia Llama 3. No se dispone de detalles especificos sobre el numero de capas, dimensiones ocultas ni configuracion de atencion en la informacion proporcionada.

El entrenamiento es un ajuste fino supervisado (SFT) realizado con Unsloth y la libreria TRL de Hugging Face, partiendo de la version de Unsloth cuantizada en 4 bits (unsloth/Llama-3.2-1B-unsloth-bnb-4bit). La model card indica que el entrenamiento fue "2x faster" gracias a Unsloth, pero no especifica el numero de tokens, la composicion del dataset, la duracion del entrenamiento, la tasa de aprendizaje ni si se aplicaron etapas de RLHF o DPO. No se documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth para acelerar el SFT.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama 3.2 1B.
- Ajuste fino orientado a dominio legal segun el nombre del modelo; el alcance real no esta documentado.
- Posible uso en tareas de dominio indonesio segun el sufijo "Indo" del nombre; no confirmado en la model card.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card solo declara "en".
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes legales en ingles: el modelo puede generar respuestas conversacionales sobre terminologia juridica basica, aunque sin garantias de precision por la falta de evaluacion publicada.
- Experimentacion con ajuste fino sobre Llama 3.2 1B: sirve como referencia de un pipeline Unsloth + TRL reproducible en una sola GPU consumer.
- Generacion de borradores de texto administrativo o legal de baja criticidad, siempre con revision humana, dado el tamano reducido del modelo.
- Base para un segundo ajuste fino especifico: al ser un checkpoint pequeno (1,24 mil millones de parametros), se puede reentrenar o adaptar con LoRA en hardware modesto.
- Investigacion sobre sesgos y calidad en modelos legales de bajo coste: util como linea base para comparar contra modelos mayores.
- Demostraciones y pruebas de integracion con text-generation-inference o transformers, ya que el repo es compatible con endpoints y la libreria transformers.
- Traduccion o asistencia bilingue ingles-indonesio: plausible por el nombre, pero sin evidencia documentada; requeriria validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,5 GB solo para pesos, mas cache KV y overhead; en la practica unos 4-6 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4): del orden de 1-1,5 GB para pesos, con 2-3 GB totales.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090); en datacenter, A100 o H100 estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 6 GB o mas; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: transformers, text-generation-inference (el repo declara endpoints_compatible), vLLM, llama.cpp y Ollama tras conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.2-1B-Legal-Indo-SFT | 1,24 B | no disponible | Apache 2.0 | SFT no documentado, sin benchmarks |
| Llama-3.2-1B (Meta) | 1,24 B | 128k (segun Meta) | Llama 3.2 Community License | Modelo base oficial, con evaluacion publicada |
| TinyLlama-1.1B | 1,1 B | 2k-32k segun variante | Apache 2.0 | Alternativa pequena de codigo abierto con benchmarks publicados |
| Qwen2.5-1.5B | 1,5 B | 32k | Apache 2.0 | Modelo pequeno multilingue con evaluacion publicada |

La comparativa es aproximada: los datos de contexto y benchmarks de los alternativas provienen de sus model cards oficiales, no de la informacion proporcionada sobre este modelo. Para este checkpoint concreto no hay metricas que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, hiperparametros y evaluacion; no es posible verificar la calidad del ajuste legal.
- Riesgo alto de alucinacion en contenido juridico: un modelo de 1,24 mil millones de parametros no es fiable para asesoramiento legal sin supervision experta.
- La model card solo declara ingles; el uso en indonesio no esta validado.
- Contexto maximo no documentado; no se debe asumir la ventana de 128k de Llama 3.2 sin verificacion.
- Licencia Apache 2.0 declarada, pero el modelo base Llama 3.2 de Meta tiene su propia licencia comunitaria; conviene revisar la compatibilidad antes de uso comercial.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validacion por la comunidad.
- El checkpoint parte de una version cuantizada en 4 bits de Unsloth; la calidad del ajuste puede verse afectada por la cuantizacion del modelo base.
- No se documentan sesgos especificos, pero al derivar de Llama 3.2 hereda los sesgos conocidos del modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiwomdf/Llama-3.2-1B-Legal-Indo-SFT
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Llama-3.2-1B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Modelo oficial Llama 3.2 de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B
