# opticalmouse/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

Este repositorio contiene un adaptador LoRA de tipo "persona" afinado sobre el modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`, desarrollado por el usuario `opticalmouse`. Se trata de un fine-tuning ligero (el repositorio pesa aproximadamente 0,1 GB, coherente con pesos de adaptador y no con un modelo completo) entrenado con la librería Unsloth, que acelera el entrenamiento de modelos Llama y compatibles. El objetivo declarado es dotar al modelo base de un estilo o personalidad concreta, si bien la model card no documenta qué persona, dataset ni metodología se han empleado.

El modelo base, Kanana 1.5 8B Instruct, es un modelo de lenguaje de 8 mil millones de parámetros desarrollado por Kakao Corp, orientado a generación de texto e instrucciones. Este adaptador hereda por tanto las capacidades del modelo base y añade una capa de especialización estilística o de comportamiento. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque conviene verificar las condiciones del modelo base original.

La relevancia de esta ficha es limitada: se trata de un artefacto de la comunidad con cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil como ejemplo de fine-tuning LoRA con Unsloth sobre un modelo coreano, pero no como modelo de producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Kanana 1.5 8B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA ocupa ~0,1 GB (parametros del adaptador no disponibles) |
| Parametros activos | no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador es compatible con el flujo de Unsloth, que soporta cuantizacion 4-bit durante el entrenamiento, pero no se documentan pesos cuantizados publicados) |
| Idiomas soportados | en (segun la model card y los tags del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA; el repo incluye tambien configuracion de transformers) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`. La arquitectura subyacente es la del modelo Kanana 1.5 8B Instruct, un transformer decoder-only de 8 mil millones de parametros; la informacion proporcionada no detalla si emplea atención estándar, GQA u otras variantes, ni su ventana de contexto nativa. El adaptador en sí introduce matrices de bajo rango en determinadas capas, lo que permite un ajuste eficiente en memoria sin modificar los pesos originales.

El entrenamiento se realizó con Unsloth, segun la model card, lo que implica un pipeline de fine-tuning supervisado (SFT) acelerado, presumiblemente con la librería TRL (etiqueta `trl` presente) y el formato de chat de Llama. No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni hiperparámetros como rango, alpha o capas objetivo. Tampoco se especifica qué "persona" se ha inducido ni se aportan ejemplos de comportamiento esperado.

## Capacidades

- Generación de texto e instrucciones heredadas del modelo base Kanana 1.5 8B Instruct.
- Presunta especialización de estilo o personalidad ("Persona") inducida por el adaptador LoRA, sin documentación de su naturaleza.
- Soporte de conversación multi-turno en la medida en que lo permita el modelo base.
- Capacidades de razonamiento, código y matemáticas no verificadas en este adaptador; dependen íntegramente del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: la model card declara únicamente inglés (`en`), aunque el modelo base Kanana está orientado al coreano; no se confirma el comportamiento multilingüe tras el fine-tuning.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de asistentes con personalidad: el adaptador permite experimentar con un tono o estilo concreto sobre el modelo base sin reentrenar desde cero, gracias al bajo coste de un LoRA de ~0,1 GB.
- Investigación en fine-tuning eficiente: sirve como ejemplo reproducible de entrenamiento LoRA con Unsloth y TRL sobre un modelo de 8B, útil para comparar pipelines y tasas de aprendizaje.
- Chatbots de dominio acotado en inglés: si la persona inducida se alinea con un rol concreto (por ejemplo, atención al cliente), puede desplegarse en un servicio de texto en inglés, previa evaluación de calidad.
- Generación de contenido con voz de marca: para equipos que necesiten un estilo editorial consistente, el adaptador puede aplicarse sobre el modelo base y combinarse con prompts de sistema.
- Base para iteraciones posteriores: al ser un LoRA, puede fusionarse con los pesos base o combinarse con otros adaptadores (mediante técnicas de composición) para experimentar con múltiples personas.
- Evaluación comparativa de personas: útil en entornos de investigación para medir cómo un adaptador de bajo rango altera el comportamiento del modelo base en pruebas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un modelo de 8B, los requisitos son los del modelo base. En FP16 se estiman aproximadamente 16 GB de VRAM; en cuantización 4-bit (por ejemplo, GGUF Q4_K_M o bitsandbytes NF4) se reduce a unos 5-6 GB, aunque estas cifras son estimaciones generales para modelos de 8B y no están confirmadas para Kanana 1.5.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en FP16 con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con lotes pequeños; RTX 4060 Ti 16 GB o superiores para cuantización 4-bit.
- Cabe en GPU de consumo: sí, en cuantización 4-bit en GPUs con 6-8 GB o más, y en FP16 en GPUs de 16-24 GB, sujeto a verificación con el modelo base.
- Opciones de despliegue: transformers (carga del adaptador con PEFT), Text Generation Inference (etiqueta `text-generation-inference`), vLLM (soporte de LoRA), llama.cpp/Ollama tras fusionar y convertir el adaptador a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| opticalmouse/kanana-1.5-8b-instruct-2505-Persona-LORA | 8B (base) + LoRA | no disponible | apache-2.0 | Hugging Face, 0 descargas | Adaptador de persona sin benchmarks |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8B | no disponible | no disponible en la informacion proporcionada | Hugging Face (modelo base) | Modelo oficial de Kakao Corp |
| Meta Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face, amplia adopción | Referencia de la categoría 8B, con benchmarks públicos |
| Qwen2.5 7B Instruct | 7B | 128K | Apache 2.0 | Hugging Face, amplia adopción | Alternativa 7B con licencia permisiva y benchmarks públicos |

La comparación con Llama 3.1 8B y Qwen2.5 7B se ofrece como referencia de categoría; no se dispone de datos que permitan comparar rendimiento real de este adaptador frente a ellos.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset, la persona inducida y los hiperparámetros de entrenamiento; imposible reproducir el fine-tuning.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de que el adaptador mejore o degrade las capacidades del modelo base.
- Riesgo de sobreajuste y de degradación de capacidades generales tras un SFT no documentado.
- Riesgo de alucinación inherente a los modelos de 8B, agravado por la falta de evaluación.
- Idioma declarado únicamente inglés; el comportamiento en castellano u otros idiomas no está garantizado.
- Ventana de contexto no especificada en la información disponible; conviene consultar la del modelo base antes de usarlo en tareas de contexto largo.
- Licencia Apache 2.0 declarada para el adaptador, pero deben respetarse las condiciones del modelo base Kanana 1.5, que no se detallan aquí.
- Cero descargas y cero interacciones: no hay señal de validación por parte de la comunidad.
- Para producción, es imprescindible una evaluación propia (calidad, sesgos, seguridad) antes de desplegar.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/opticalmouse/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
