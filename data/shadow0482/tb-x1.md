# Shadow0482/tb-x1

## Resumen

TB-X1 es un ajuste fino (fine-tune) del modelo Mythos Nano, publicado por el usuario Shadow0482 en Hugging Face. Se trata de un modelo de generacion de texto de aproximadamente 3.086 millones de parametros (3,09 B) construido sobre la arquitectura Qwen2, distribuido en formato Safetensors y pensado para su uso dentro del ecosistema Hugging Face Transformers. Su licencia declarada es Apache 2.0 y el unico idioma soportado segun los metadatos es el ingles.

El modelo se presenta como parte de la "serie TB-X" y esta orientado a flujos de trabajo agenticos y a la invocacion de herramientas (tool calling). Segun su model card, el desarrollo se realizo mediante un flujo guiado por modelos profesor (Claude Opus 5.5 y GPT-6 Astra) y orquestacion de agentes, con aproximadamente 500 millones de interacciones de tool-call y flujos agenticos reportadas como actividad del flujo de trabajo, no como tokens de entrenamiento ni muestras de dataset.

Su relevancia actual es limitada pero concreta: se trata de un modelo pequeno (3 B) que cabe en GPU de consumo y que declara capacidades de razonamiento estructurado y tool calling, lo que lo hace candidato para prototipado de agentes locales. No obstante, la informacion tecnica publicada es escasa: no se detallan volumenes de tokens de entrenamiento, composicion del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en Safetensors; compatible con cuantizacion via Transformers/Unsloth, sin formatos GGUF publicados) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

TB-X1 emplea la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar. El modelo base es Mythos Nano (orangejuicesmith/Mythos-Nano-safetensor), sobre el que se aplico un ajuste fino optimizado con el framework Unsloth. No se especifican en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion declarada por el autor no reside en la arquitectura sino en la metodologia de desarrollo: un flujo guiado por modelos profesor (Claude Opus 5.5 para generacion de instrucciones y respuestas, GPT-6 Astra para razonamiento y soporte de flujo), con orquestacion de agentes multi-paso y tool-call. El autor reporta aproximadamente 500 millones de interacciones de tool-call y flujos agenticos como actividad del flujo de trabajo, aclarando explicitamente que esa cifra no corresponde a parametros, tokens ni muestras de dataset. No se documenta ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, SSM, etc.).

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento estructurado en flujos multi-paso, segun declara el autor.
- Soporte de tool calling / function calling (etiqueta `tool-calling` y `agentic-workflows`).
- Integracion en flujos agenticos y orquestacion de herramientas.
- Compatibilidad con plantillas de chat (`apply_chat_template` de Transformers).
- Capacidades multilingues: no disponibles; solo ingles declarado.
- Vision, audio o modo "thinking" explicito: no disponibles.

## Casos de uso

- Prototipado de agentes locales: al ser un modelo de 3 B, puede ejecutarse en una GPU de consumo y usarse para validar pipelines de orquestacion de agentes y tool calling antes de migrar a modelos mayores.
- Asistentes conversacionales ligeros en ingles: adecuado para bots de soporte de baja latencia donde el coste por inferencia es critico, dado su reducido tamano.
- Generacion de codigo asistida en entornos de desarrollo: su soporte declarado de tool calling permite integrarlo en asistentes que invocan funciones o APIs, aunque sin benchmarks publicados conviene validar la calidad antes de produccion.
- Automatizacion de tareas con llamadas a herramientas: pipelines que requieran que el modelo decida que funcion invocar y con que argumentos, aprovechando la etiqueta `agentic-workflows`.
- Fine-tuning adicional: al estar en Safetensors y ser compatible con Unsloth, sirve como base para ajustes especificos de dominio en ingles con requisitos modestos de hardware.
- Experimentacion e investigacion: modelo pequeno y de licencia Apache 2.0 util para reproducir experimentos de destilacion guiada por profesor o de generacion de instrucciones sinteticas.
- Despliegue en TGI: compatible con Text Generation Inference para servir el modelo via API en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP16/BF16, aproximadamente 6,2 GB solo para pesos (el repositorio ocupa 6,2 GB); en cuantizacion de 8 bits, en torno a 3-4 GB; en 4 bits, alrededor de 2 GB, aunque no se publican pesos GGUF oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante); A100 y H100 sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en FP16 y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: Transformers, Text Generation Inference (TGI), Accelerate y flujos compatibles con Unsloth; no se confirma soporte de llama.cpp u Ollama al no publicarse GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| TB-X1 (Shadow0482) | 3,09 B | no disponible | Apache 2.0 | Ingles | Fine-tune de Mythos Nano, orientado a agentes/tool calling |
| Qwen2.5-3B (Alibaba) | ~3 B | 32K (segun version) | Apache 2.0 | Multilingue | Modelo base de referencia de la familia Qwen2; benchmarks publicados |
| Llama 3.2 3B (Meta) | ~3 B | 128K | Llama 3.2 Community License | Multilingue | Ampliamente soportado en llama.cpp/Ollama |
| Phi-3-mini (Microsoft) | 3,8 B | 4K-128K (segun variante) | MIT | Ingles principalmente | Buen rendimiento en razonamiento para su tamano |

Nota: los datos de los modelos comparativos corresponden a conocimiento general de la familia; para TB-X1 no hay benchmarks publicados que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de un fine-tune sobre Mythos Nano, hereda los sesgos del modelo base y de los datos generados por modelos profesor.
- Riesgo de alucinacion: no evaluado ni documentado; en modelos de 3 B el riesgo suele ser elevado, especialmente en tareas de razonamiento factual.
- Limitacion de idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Limitacion de contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar su uso en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero el autor recomienda revisar el repositorio original del modelo base y sus terminos antes de redistribuir.
- Falta de transparencia: no se publican volumenes de tokens de entrenamiento, composicion del dataset, hiperparametros ni evaluaciones; la cifra de 500 millones de interacciones corresponde a actividad de flujo de trabajo, no a datos de entrenamiento.
- Caveat para produccion: sin benchmarks ni evaluaciones independientes, no se recomienda su uso en produccion sin una validacion previa propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shadow0482/tb-x1
- Modelo base (Mythos Nano): https://huggingface.co/orangejuicesmith/Mythos-Nano-safetensor
- Framework de optimizacion Unsloth: https://github.com/unslothai/unsloth
- Perfil del autor: https://huggingface.co/Shadow0482
