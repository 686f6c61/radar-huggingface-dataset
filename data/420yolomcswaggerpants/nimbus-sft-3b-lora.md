# 420yolomcswaggerpants/nimbus-sft-3b-lora

## Resumen

Nimbus SFT 3B LoRA Adapter es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario 420yolomcswaggerpants, diseñado para especializar el modelo Qwen/Qwen2.5-3B en la tarea de soporte al cliente de Nimbus Coffee, una cafetería ficticia de Portland. No es un modelo completo, sino un conjunto de pesos que debe cargarse sobre el modelo base para funcionar. El adaptador resuelve el problema de adaptar un LLM a un dominio concreto sin necesidad de reentrenar todos los parámetros, lo que reduce significativamente el coste computacional y de memoria.

El modelo se entrenó con 4 000 pares sintéticos de instrucción y respuesta generados por DeepSeek, y está pensado como una prueba de concepto de fine-tuning eficiente con LoRA en hardware limitado (Google Colab T4). La arquitectura subyacente es un transformer decoder-only de aproximadamente 3 000 millones de parámetros. La información disponible no incluye la longitud de contexto del adaptador ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) con adaptador LoRA |
| Parametros totales | No disponible para el adaptador; el modelo base tiene ~3 000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Entrenado con cuantización de 4 bits NF4 del modelo base; el adaptador se distribuye sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen/Qwen2.5-3B, un modelo transformer decoder-only. En lugar de actualizar todos los pesos, LoRA añade matrices de bajo rango a las proyecciones de atención `q_proj` y `v_proj`, con r=8, alpha=32 y dropout=0.1. Esto permite entrenar el modelo con un coste de memoria reducido, preservando la mayor parte del conocimiento del modelo base.

El entrenamiento se realizó sobre 4 000 pares sintéticos de instrucción y respuesta generados por DeepSeek, específicamente para el dominio de soporte al cliente de Nimbus Coffee. Los hiperparámetros documentados son: 3 épocas, batch size de 1, acumulación de gradientes de 8, learning rate de 2e-4, weight decay de 0.01, scheduler lineal y cuantización de 4 bits NF4. El hardware utilizado fue una GPU Google Colab T4. No se menciona el uso de RLHF ni DPO. El formato de prompt esperado es `### Instruction:\n...\n\n### Response:\n`.

## Capacidades

- Generación de texto especializada en soporte al cliente de Nimbus Coffee, respondiendo preguntas sobre productos, pedidos, envíos y otros temas del dominio.
- Respuestas a preguntas frecuentes (FAQ) sobre la cafetería, con un tono de asistente adaptado al negocio.
- Hereda las capacidades generales de Qwen2.5-3B, aunque no se han evaluado tras el ajuste fino.
- No se han documentado capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni multimodalidad en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente de soporte en la web de Nimbus Coffee: el modelo puede integrarse en un widget de chat para responder preguntas frecuentes sobre cafés, métodos de preparación y envíos. Es adecuado porque fue entrenado exclusivamente con Q&A del dominio.
- Generación de respuestas para tickets de soporte: puede redactar respuestas preliminares a consultas de clientes, que un agente humano revisa antes de enviar. Su especialización reduce el tiempo de redacción.
- Bot de redes sociales: responde comentarios y mensajes directos sobre la marca, recomendando productos o resolviendo dudas básicas.
- Formación de agentes humanos: sirve como generador de diálogos de ejemplo para entrenar a personal de soporte en el tono y los contenidos de Nimbus Coffee.
- Prototipo de demostración: útil para validar el flujo de fine-tuning con LoRA y la viabilidad de desplegar un asistente de dominio específico en infraestructura modesta.
- Sistema de preguntas frecuentes dinámico: el modelo puede generar respuestas contextualizadas a partir de una base de conocimiento estática sobre la cafetería, usando el formato de prompt documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia con el adaptador y el modelo base en FP16: se estima entre 6 y 7 GB de VRAM, correspondientes al modelo base de ~3 000 millones de parámetros en FP16.
- Con el modelo base cuantizado a 4 bits (NF4): se estima entre 2 y 3 GB de VRAM.
- GPU recomendada: NVIDIA T4 (16 GB) o superior; también válido en RTX 3060 de 12 GB, RTX 4090, A100 y H100.
- Cabe en GPUs de consumidor de gama media-alta.
- Opciones de despliegue: Transformers + PEFT en Python; vLLM y TGI si se fusiona el adaptador con el modelo base. También se puede exportar a GGUF para llama.cpp y Ollama tras fusionar el adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información proporcionada. El adaptador debe compararse con el modelo base Qwen/Qwen2.5-3B para evaluar la ganancia en el dominio, pero no se dispone de métricas publicadas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar Qwen/Qwen2.5-3B y el adaptador LoRA.
- El dataset de entrenamiento es sintético y generado por DeepSeek, por lo que puede no reflejar la variabilidad y complejidad de consultas reales.
- Especialización muy estrecha: el rendimiento fuera del dominio de Nimbus Coffee puede degradarse significativamente.
- Alta probabilidad de alucinación en temas no cubiertos por los 4 000 pares de entrenamiento.
- No se han publicado evaluaciones de sesgos, seguridad ni benchmarks.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El adaptador no incorpora tool calling ni acceso a sistemas externos; no puede consultar pedidos reales ni bases de datos actualizadas.

## Enlaces

- HuggingFace: https://huggingface.co/420yolomcswaggerpants/nimbus-sft-3b-lora
- Modelo relacionado: https://huggingface.co/420yolomcswaggerpants/nimbus-coffee-assistant
- Repositorio GitHub: https://github.com/420yolomcswaggerpants/nimbus-finetune
