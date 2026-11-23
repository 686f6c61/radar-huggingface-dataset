# sakinad/novashop-support-lora

## Resumen

novashop-support-lora es un adaptador LoRA (PEFT) publicado por el usuario sakinad en Hugging Face el 23 de noviembre de 2026. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit, una versión de Meta Llama 3.1 8B Instruct cuantizada en 4 bits (bitsandbytes) y optimizada por Unsloth para entrenamiento e inferencia eficientes. El nombre del repositorio sugiere un propósito de soporte al cliente para una tienda ("novashop"), aunque la model card no lo confirma explícitamente.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.000 millones de parámetros y una ventana de contexto nativa de 128.000 tokens. El adaptador en sí ocupa 0,4 GB en el repositorio, lo que es coherente con un LoRA de rango bajo (los pesos base no se redistribuyen). La relevancia de esta ficha es limitada: se trata de un artefacto experimental sin documentación técnica, sin métricas publicadas y sin licencia declarada, por lo que su evaluación debe hacerse con cautela.

La model card es la plantilla por defecto de Hugging Face sin rellenar: todos los campos de descripción, datos de entrenamiento, hiperparámetros y evaluación figuran como "[More Information Needed]". Esto implica que cualquier dato sobre composición del dataset, régimen de entrenamiento o rendimiento no está disponible públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) con adaptador LoRA |
| Parametros totales | 8.000 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B) |
| Tipos de cuantizacion | El modelo base referenciado esta en bnb-4bit; el adaptador es compatible con cuantizacion adicional (GGUF, AWQ, GPTQ) via fusion, aunque no se documenta |
| Idiomas soportados | no disponible en la model card; el modelo base Llama 3.1 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible (la model card no la declara; el modelo base Llama 3.1 usa Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Meta Llama 3.1 8B Instruct, un transformer decoder-only con atención por grupos (GQA), RoPE y normalización RMSNorm, preentrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado mediante SFT y RLHF (DPO). La versión base concreta es la de Unsloth en bnb-4bit, pensada para reducir el consumo de VRAM durante el ajuste fino.

El adaptador en sí es un LoRA de bajo rango entrenado con SFT usando las librerías TRL y Unsloth (PEFT 0.21.2 según la model card). No se especifican el rango, el alpha, los módulos objetivo, el número de pasos, la tasa de aprendizaje ni la composición del dataset. Tampoco se documenta si hubo RLHF, DPO o evaluación posterior. La única innovación técnica implícita es el uso de Unsloth para acelerar el entrenamiento y reducir memoria, pero no hay detalles publicados.

## Capacidades

- Generación de texto conversacional en formato chat (heredada de Llama 3.1 Instruct).
- Razonamiento multi-turno y seguimiento de instrucciones, presumiblemente especializado en dominio de soporte al cliente según el nombre del repositorio (no confirmado).
- Soporte de tool calling / function calling: heredado del modelo base Llama 3.1, aunque no se verifica que el ajuste fino lo preserve.
- Capacidades multilingües: heredadas del modelo base (8 idiomas oficiales), sin datos específicos del adaptador.
- Ventana de contexto larga (128k tokens) heredada del modelo base, útil para conversaciones extensas o documentación de producto.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Atención al cliente automatizada: el adaptador puede desplegarse como capa de especialización sobre Llama 3.1 8B Instruct para responder consultas de una tienda online, aprovechando la ventana de 128k tokens para incluir historial de conversación y políticas de devolución en el contexto.
- Clasificación y enrutado de tickets: con un prompt adecuado, el modelo puede etiquetar consultas entrantes (devoluciones, envíos, facturación) y derivarlas al equipo correspondiente, gracias a su capacidad de seguir instrucciones estructuradas.
- Generación de respuestas a preguntas frecuentes: integrado en un chatbot web, permite respuestas coherentes y con tono consistente si el ajuste fino se ha realizado sobre transcripciones reales de soporte.
- Asistencia a agentes humanos: como borrador automático de respuestas que un operador revisa y envía, reduciendo el tiempo de primera respuesta.
- Extracción de datos de conversaciones: identificar pedidos, direcciones o motivos de reclamación en hilos de chat multi-turno, apoyándose en el contexto largo.
- Prototipado rápido de asistentes verticales: al ser un adaptador LoRA de 0,4 GB, se puede cargar y descargar rápidamente en entornos de experimentación con Unsloth o PEFT, sin necesidad de reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base Llama 3.1 8B. En bnb-4bit, aproximadamente 5-6 GB de VRAM; en fp16, unos 16 GB; en 8-bit, unos 9 GB.
- GPU recomendadas: RTX 4090 (24 GB) para fp16 o 4-bit con margen; A100 40/80 GB y H100 para despliegues con concurrencia alta; RTX 3090/4080 (16-24 GB) suficientes en 4-bit.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior usando cuantización 4-bit; en 8 GB solo con cuantizaciones agresivas (GGUF Q4) tras fusionar el adaptador.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (tras fusionar el adaptador con el modelo base), llama.cpp/Ollama (requiere exportar a GGUF y fusionar), TGI (con soporte de adaptadores PEFT).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. Como referencia orientativa del modelo base 8B en una RTX 4090 con 4-bit, cabría esperar decenas de tokens por segundo, pero no hay medición publicada para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sakinad/novashop-support-lora | 8B (base) + LoRA | 128k (heredado) | no disponible | Hugging Face, 0 descargas | Sin documentación ni benchmarks |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit | 8B | 128k | Llama 3.1 Community License | Hugging Face | Versión cuantizada 4-bit del anterior, base de este adaptador |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | Hugging Face | Alternativa con licencia permisiva y contexto menor |

## Limitaciones y advertencias

- La model card no declara licencia; no se puede asumir uso comercial sin verificar la licencia del modelo base (Llama 3.1 Community License) y contactar con el autor.
- Ausencia total de documentación sobre datos de entrenamiento, hiperparámetros y evaluación: imposible auditar sesgos o calidad.
- Riesgo elevado de alucinación y de respuestas fuera de dominio si el ajuste fino fue estrecho (soporte de tienda) y se usa en otros contextos.
- El adaptador está entrenado sobre una base cuantizada en 4-bit (bnb-4bit); fusionarlo con el modelo en fp16 puede introducir discrepancias numéricas no evaluadas.
- Sin métricas de retención de capacidades del modelo base (tool calling, multilingüismo) tras el SFT; podrían haberse degradado.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Idiomas soportados no declarados; el ajuste fino podría haber reducido el rendimiento multilingüe del base.
- No apto para producción sin una evaluación propia previa sobre un conjunto de validación representativo.

## Enlaces

- Hugging Face: https://huggingface.co/sakinad/novashop-support-lora
- Modelo base (Unsloth, bnb-4bit): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Modelo original Meta Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de Llama 3.1 (Meta): https://arxiv.org/abs/2407.21783
- Referencia citada en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
