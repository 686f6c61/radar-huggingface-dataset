# rudyvdbrink/Llama-Prompt-Guard-2-22M-onnx

## Resumen

Llama-Prompt-Guard-2-22M-onnx es la exportacion a formato ONNX del clasificador de seguridad meta-llama/Llama-Prompt-Guard-2-22M, un modelo de Meta disenado para detectar prompt injection y ataques de jailbreak en entradas de texto. El repositorio, publicado por el usuario rudyvdbrink, no introduce entrenamiento nuevo: convierte los pesos originales a grafos ONNX (fp32 y cuantizado INT8 dinamico) para facilitar su despliegue en entornos de inferencia sin dependencia de PyTorch.

El modelo base se apoya en una arquitectura tipo DeBERTa-v2 (segun los tags del repositorio) y resuelve un problema concreto de seguridad en produccion: clasificar si un prompt de usuario es benigno o malicioso antes de pasarlo a un LLM. Su tamano reducido (70,8 millones de parametros reales en safetensors, pese al "22M" del nombre) y su ventana de 512 tokens lo hacen apto como filtro de baja latencia en pipelines de moderacion.

Es relevante ahora porque la exportacion ONNX permite integrar el guardrail en stacks heterogeneos (ONNX Runtime, Text Embeddings Inference, endpoints compatibles) sin GPU ni framework pesado, algo critico para despliegues de seguridad a gran escala. La licencia del modelo base es la Llama 4 Community License, con las restricciones de uso que esta impone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (clasificador de texto, segun tags del repo) |
| Parametros totales | 70.830.722 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | FP32 (model.onnx) y INT8 dinamica per-tensor QUInt8 (model.quant.onnx) |
| Idiomas soportados | en, fr, de, hi, it, pt, es, th |
| Licencia | Llama 4 Community License (segun model card); campo license no disponible |
| Formato de pesos | ONNX (opset 17), safetensors (pesos PyTorch originales), tokenizer.json |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer encoder tipo DeBERTa-v2 configurado como clasificador binario, con dos etiquetas de salida: 0 para BENIGN y 1 para MALICIOUS. La exportacion ONNX mantiene la firma de entrada estandar (`input_ids` y `attention_mask`, int64, shape `[batch_size, sequence_length]`) y produce `logits` float32 de shape `[batch_size, 2]`, sobre los que se aplica softmax para obtener probabilidades. El grafo usa opset 17.

No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni si hubo RLHF o DPO en el modelo base. La model card del export unicamente documenta el proceso de conversion: pesos originales del commit `11614a155199674a0a95e6602d6ab0417b790ed0`, grafo fp32 completo y una variante con cuantizacion dinamica de 8 bits (pesos QUInt8, per-tensor). El autor advierte que la perdida de precision de la variante cuantizada es notable y recomienda validarla sobre datos propios antes de usarla en produccion.

## Capacidades

- Clasificacion binaria de texto: distingue entre prompt benigno (BENIGN) y malicioso (MALICIOUS).
- Deteccion de prompt injection, segun los tags del repositorio (prompt-injection, jailbreak, safety).
- Soporte multilingue en ocho idiomas: ingles, frances, aleman, hindi, italiano, portugues, espanol y tailandes.
- Entrada de hasta 512 tokens, suficiente para prompts de sistema y mensajes de usuario tipicos.
- Salida de logits compatible con softmax para umbrales de decision ajustables.
- No soporta tool calling, function calling, agentes ni generacion de texto: es exclusivamente un clasificador.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Filtro previo a un LLM en produccion: clasificar cada mensaje de usuario antes de enviarlo al modelo generativo y bloquear o marcar los que superen un umbral de probabilidad MALICIOUS, reduciendo la superficie de ataque de prompt injection.
- Moderacion de contenido en aplicaciones de chat: integrar el clasificador en el backend para detectar intentos de jailbreak en conversaciones multi-turno, evaluando cada turno de forma independiente.
- Guardrail en pipelines RAG: validar las consultas del usuario antes de recuperar documentos y construir el contexto, evitando que instrucciones maliciosas manipulen el comportamiento del generador.
- Despliegue en entornos sin GPU: gracias a la exportacion ONNX y a la variante INT8, el modelo puede ejecutarse en CPU con ONNX Runtime en servicios de baja latencia y bajo coste.
- Evaluacion de seguridad de datasets: clasificar grandes volumenes de prompts de un corpus para etiquetar muestras maliciosas y construir conjuntos de prueba de red teaming.
- Integracion en plataformas de inferencia gestionada: el tag endpoints_compatible y text-embeddings-inference permiten servirlo en infraestructuras estandar de Hugging Face sin adaptadores personalizados.
- Preprocesado en sistemas de atencion al cliente automatizada: filtrar entradas antes de que lleguen al agente conversacional, protegiendo el contexto del sistema frente a intentos de extraccion del prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para los 70,8 millones de parametros; la variante INT8 reduce el peso del grafo aproximadamente a la mitad.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es sobredimensionada; el modelo esta pensado para CPU o GPUs de gama baja.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con mas de 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (recomendado por el autor), Text Embeddings Inference (tag text-embeddings-inference), endpoints compatibles de Hugging Face. No se documenta soporte para vLLM, llama.cpp ni Ollama, dado que es un clasificador y no un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica que la variante cuantizada es "mas pequena y rapida" que la fp32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Prompt-Guard-2-22M-onnx | 70,8 M | 512 tokens | Clasificacion prompt injection | Llama 4 Community License | ONNX en HF |
| meta-llama/Llama-Prompt-Guard-2-22M | no disponible en la informacion | no disponible en la informacion | Clasificacion prompt injection | Llama 4 Community License | PyTorch en HF |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- La variante cuantizada INT8 presenta una perdida de precision grande segun el propio autor; debe validarse sobre datos propios antes de usarla en produccion.
- El modelo clasifica unicamente en dos clases (BENIGN/MALICIOUS); no distingue tipos de ataque ni proporciona explicaciones.
- Ventana limitada a 512 tokens: prompts mas largos se truncan, lo que puede dejar fuera parte del contenido malicioso.
- Riesgo de falsos positivos y falsos negativos inherente a un clasificador binario; el umbral de decision debe calibrarse por caso de uso.
- No se documentan sesgos conocidos ni evaluaciones de robustez en la informacion disponible.
- La licencia Llama 4 Community License impone restricciones de uso comercial y obliga a cumplir la Llama 4 Acceptable Use Policy; conviene revisar ambos documentos antes de un despliegue productivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no procede de un canal oficial de Meta; la trazabilidad del export debe verificarse contra el commit del modelo base indicado.
- No es un modelo generativo: no puede sustituir a un LLM para tareas de razonamiento, codigo o conversacion.

## Enlaces

- Repositorio ONNX: https://huggingface.co/rudyvdbrink/Llama-Prompt-Guard-2-22M-onnx
- Modelo base: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-22M
- Politica de uso aceptable de Llama 4: https://www.llama.com/llama4/use-policy
