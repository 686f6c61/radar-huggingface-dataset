# gaswww/novashop-support-lora

## Resumen

`gaswww/novashop-support-lora` es un adaptador LoRA (Low-Rank Adaptation) de tipo SFT (supervised fine-tuning) publicado en Hugging Face por el usuario `gaswww`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que debe cargarse sobre el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit`, una versión del Meta Llama 3.1 8B Instruct cuantizada en 4 bits y optimizada por Unsloth para entrenamiento e inferencia eficientes. El nombre del repositorio sugiere un ajuste orientado a atención al cliente ("support") para un supuesto negocio llamado "Novashop", aunque la model card no documenta el corpus de entrenamiento.

El adaptador resuelve un problema acotado: especializar un modelo conversacional generalista de 8B parámetros en un dominio concreto de soporte mediante un ajuste supervisado de bajo rango, lo que permite desplegarlo con un coste de almacenamiento mínimo (el repositorio ocupa 0,2 GB). Al estar construido sobre PEFT, se puede fusionar con el modelo base o cargarse de forma modular con la librería `peft`.

La relevancia de esta ficha es limitada pero útil como ejemplo de flujo de trabajo: muestra el patrón habitual de fine-tuning con Unsloth + TRL + PEFT sobre Llama 3.1 8B, un caso muy común entre desarrolladores que quieren adaptar un modelo abierto a un vertical de negocio. La información pública es muy escasa: la model card es una plantilla sin rellenar, no se declara licencia ni idiomas, y no hay benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | no disponible (el adaptador LoRA es de bajo rango; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.1 8B soporta 128 000 tokens) |
| Tipos de cuantizacion | el modelo base referenciado esta cuantizado en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante SFT con las librerías Unsloth, TRL y PEFT (versión 0.21.2 según la model card). La arquitectura subyacente es la de Meta Llama 3.1 8B Instruct: un transformer decoder-only con atención por grupos (GQA), RoPE y una ventana de contexto nativa de 128 000 tokens. El adaptador añade matrices de bajo rango sobre las capas del modelo base, de modo que solo se entrenan y distribuyen esos pesos incrementales, no el modelo completo.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posterior ni hiperparámetros concretos. La model card es la plantilla por defecto de Hugging Face con todos los campos marcados como "[More Information Needed]". El único dato técnico verificable es la referencia al modelo base cuantizado en 4 bits de Unsloth, lo que indica que el entrenamiento se realizó con cuantización QLoRA o similar para reducir requisitos de memoria.

## Capacidades

- Generación de texto conversacional en el dominio de atención al cliente, presumiblemente especializada en el vertical "Novashop" según el nombre del repositorio.
- Hereda las capacidades del modelo base Llama 3.1 8B Instruct: razonamiento, código, matemáticas y multilingüismo básico, aunque el ajuste fino puede haber degradado parcialmente algunas de ellas.
- Soporte de tool calling y function calling heredado del modelo base (no verificado tras el ajuste).
- Capacidad de mantener conversaciones multi-turno, limitada por el contexto del modelo base.
- No se documentan capacidades especiales como modo thinking, visión o audio.
- El alcance real de las capacidades tras el SFT es desconocido: no hay evaluación publicada.

## Casos de uso

- Atención al cliente automatizada en un comercio electrónico: el adaptador puede desplegarse como capa de especialización sobre Llama 3.1 8B para responder consultas de pedidos, devoluciones y políticas de la tienda, aprovechando el contexto largo del modelo base para hilos multi-turno.
- Prototipado rápido de asistentes verticales: al ser un adaptador de 0,2 GB, se puede cargar y descargar rápidamente para experimentar con distintos dominios sin replicar el modelo completo.
- Despliegue con memoria limitada: al combinar un adaptador LoRA con el base en 4 bits, es viable servirlo en una única GPU consumer de gama alta (por ejemplo, RTX 4090 de 24 GB) para entornos de desarrollo o baja concurrencia.
- Evaluación de pipelines PEFT: sirve como caso de estudio para equipos que quieran replicar el flujo Unsloth + TRL + PEFT sobre Llama 3.1 8B y comparar resultados.
- Fine-tuning incremental: el adaptador puede fusionarse con el base o combinarse con otros adaptadores (técnicas como LoRA merging) para construir variantes específicas.
- Investigación sobre especialización de dominio: útil para estudiar cómo el SFT de bajo rango afecta al comportamiento conversacional de un modelo generalista de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits (bnb-4bit) requiere aproximadamente 5-6 GB de VRAM para los pesos, más overhead de activaciones y KV cache; con contexto largo el consumo crece de forma notable.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para despliegues con mayor concurrencia o contexto extendido; una RTX 3090 (24 GB) o RTX 4080 (16 GB) también puede servir para pruebas con contexto moderado.
- Cabe en GPU consumer: sí, en tarjetas con al menos 8-12 GB de VRAM para contexto corto y cuantización 4 bits; para contexto de 128k tokens se necesita mucha más memoria por el KV cache.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el base), vLLM con soporte LoRA (multi-LoRA serving), TGI con adaptadores, y llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gaswww/novashop-support-lora | Adaptador sobre 8B | no disponible (base: 128k) | LoRA SFT | no disponible | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Modelo completo | Llama 3.1 Community License | Hugging Face, ampliamente adoptado |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32k | Modelo completo | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7B | 128k | Modelo completo | Apache 2.0 (mayoría de variantes) | Hugging Face |

La comparación directa es difícil porque este artefacto es un adaptador, no un modelo autónomo. Frente a los modelos completos de la tabla, ofrece especialización de dominio a cambio de perder generalidad y transparencia (sin benchmarks ni licencia declarada). Frente a otros adaptadores LoRA públicos, la diferencia principal es el dominio de aplicación, no la arquitectura.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, evaluación, sesgos ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial es legalmente viable; además, el modelo base Llama 3.1 tiene su propia licencia comunitaria con restricciones (por ejemplo, para empresas con más de 700 millones de usuarios mensuales).
- Riesgo elevado de alucinación en el dominio de soporte si el ajuste se hizo con datos escasos o sintéticos; no hay evaluación que lo descarte.
- El ajuste fino sobre un dominio concreto puede degradar capacidades generales del modelo base (código, matemáticas, multilingüismo).
- El nombre "Novashop" sugiere un negocio concreto; el adaptador probablemente no generaliza a otros dominios de atención al cliente.
- Sin métricas ni validación publicadas, no es recomendable para producción sin una evaluación propia exhaustiva.
- Al estar entrenado sobre una versión cuantizada en 4 bits, la fusión con el modelo base en precisión completa puede introducir discrepancias de comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/gaswww/novashop-support-lora
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de referencia sobre impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700
