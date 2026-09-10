# Kenes93/qwen-nfactorial-fan-lora

## Resumen

Kenes93/qwen-nfactorial-fan-lora es un adaptador LoRA de ajuste supervisado publicado por el usuario Kenes93 en HuggingFace, construido sobre el modelo base unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit, es decir, la variante de 1.500 millones de parametros de la familia Qwen2.5-Instruct en su version cuantizada a 4 bits distribuida por Unsloth. El repositorio contiene unicamente los pesos del adaptador (aproximadamente 0,1 GB), no el modelo fusionado, por lo que su uso requiere descargar el modelo base e integrar el adaptador mediante PEFT.

El modelo se ha entrenado con el stack de Unsloth junto con TRL, segun indica la propia model card, lo que implica un flujo de QLoRA sobre una base ya cuantizada en 4 bits. No se especifica en la informacion disponible el conjunto de datos de entrenamiento, el numero de pasos, la composicion del dataset ni el objetivo concreto del ajuste; el nombre del repositorio (nfactorial-fan) sugiere una especializacion de dominio, pero no hay documentacion que lo confirme.

Su relevancia practica es la de un adaptador ligero y de licencia Apache 2.0 sobre una base densa pequeña (1,5B parametros, contexto de 32.768 tokens heredado de Qwen2.5), apto para experimentacion en GPU de consumo y para servir como punto de partida de un pipeline de fine-tuning con Unsloth. Con cero descargas y cero valoraciones en el momento de la consulta, y sin resultados de evaluacion publicados, debe considerarse un artefacto experimental sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), con RoPE, RMSNorm, SwiGLU y Grouped Query Attention; el artefacto publicado es un adaptador LoRA, no un modelo completo |
| Parametros totales | 1.540 millones en el modelo base (Qwen2.5-1.5B-Instruct); el adaptador LoRA anade un numero de parametros entrenables no especificado en la informacion disponible |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base (ampliable a 128.000 con YaRN segun la documentacion de Qwen2.5); no confirmado en la model card de este adaptador |
| Tipos de cuantizacion | Modelo base en bitsandbytes 4-bit (bnb-4bit) segun el identificador del modelo base; el adaptador se distribuye en safetensors. No se detallan otras cuantizaciones probadas |
| Idiomas soportados | en (ingles), segun el campo language de la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); no se incluyen pesos fusionados ni GGUF en el repositorio |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con 28 capas, dimension oculta de 1536, 12 cabezas de atencion y 2 cabezas de clave/valor (GQA), vocabulario de 151.936 tokens y ventana de contexto nativa de 32.768 tokens. Sobre esta base, el autor ha realizado un ajuste supervisado con LoRA mediante la libreria Unsloth y el ecosistema TRL, partiendo de la version ya cuantizada a 4 bits con bitsandbytes, lo que corresponde a un esquema QLoRA clasico: la base permanece congelada en 4 bits y solo se entrenan las matrices de bajo rango insertadas.

La informacion disponible no especifica el dataset de entrenamiento, el numero de tokens vistos, la duracion del entrenamiento, los hiperparametros de LoRA (rango, alpha, modulos objetivo) ni si hubo fases adicionales de alineacion como DPO o RLHF. Tampoco se documenta ninguna innovacion tecnica mas alla del uso del kernel optimizado de Unsloth, que la propia model card menciona como responsable de un entrenamiento "2x mas rapido". No hay evidencia publicada de evaluacion del adaptador, por lo que cualquier afirmacion sobre su comportamiento diferencial respecto a la base carece de respaldo en la documentacion disponible.

## Capacidades

- Generacion de texto en ingles: hereda las capacidades del modelo base Qwen2.5-1.5B-Instruct, orientado a conversacion y generacion de texto general.
- Razonamiento basico y respuesta a instrucciones: la base ha sido ajustada con instrucciones y preferencias, aunque a 1,5B parametros el rendimiento en razonamiento multi-paso es limitado.
- Generacion de codigo y matematicas sencillas: capacidad presente en el modelo base, no verificada especificamente en este adaptador.
- Soporte de tool calling / function calling: el modelo base Qwen2.5-Instruct declara soporte de function calling; no se confirma en la model card de este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible para este adaptador.
- Capacidades multilingues: la model card declara unicamente ingles; no se documenta soporte de otros idiomas, aunque el modelo base Qwen2.5 es multilingue.
- Capacidades especiales (vision, audio, modo thinking): no disponible; no se documentan.
- Especializacion de dominio: el nombre del repositorio apunta a un ajuste tematico, pero no hay informacion que lo describa.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al ocupar menos de 1 GB en 4 bits, el adaptador permite levantar un endpoint de chat en una GPU de gama media o incluso en CPU con llama.cpp tras fusionar y convertir a GGUF, con un coste de infraestructura minimo.
- Clasificacion y etiquetado de texto: tareas de categoria unica o multiple sobre textos cortos, donde un modelo de 1,5B con un ajuste de dominio puede bastar si la latencia y el coste por token son el criterio principal.
- Extraccion de informacion estructurada: conversion de texto libre a JSON con campos fijos (por ejemplo, datos de contacto o entidades de un dominio concreto) en pipelines de preprocesamiento antes de un modelo mayor.
- Generacion de texto corto y resumenes de parrafos: resumen extractivo o abstractivo de documentos breves, aprovechando la ventana de 32.768 tokens para entradas de varias paginas.
- Base para un segundo ciclo de fine-tuning: al ser un adaptador PEFT sobre Qwen2.5-1.5B, puede servir como punto de partida para tecnicas como DPO, ORPO o ajustes adicionales con Unsloth, reutilizando el mismo esquema de entrenamiento.
- Despliegue en el borde o en entornos con GPU limitada: inferencia sobre una RTX 3060 de 12 GB o una Jetson con 8 GB, con cuantizacion Q4_K_M en llama.cpp, adecuado para demos offline o entornos sin conectividad.
- Aumento de datos sinteticos: generacion de ejemplos de entrenamiento para un dominio especifico antes de entrenar un modelo mayor, usando este adaptador como generador de bajo coste.
- Evaluacion comparativa de tecnicas de fine-tuning: al estar entrenado con Unsloth y TRL sobre una base cuantizada, sirve como referencia reproducible para medir el impacto de QLoRA frente al ajuste completo en modelos de 1,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para el modelo base en 4 bits mas el coste del adaptador y la cache KV; en precision fp16 tras fusionar el adaptador, unos 3,1 GB de pesos mas cache KV (que crece de forma lineal con la longitud de contexto y el tamano de lote).
- GPU recomendadas: para desarrollo, RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; para servicio con batching, NVIDIA L4 o A10G; para entrenamiento con Unsloth, cualquier GPU con al menos 6-8 GB de VRAM es suficiente para 1,5B en QLoRA.
- Compatibilidad con GPU de consumo: si, es un modelo claramente orientado a hardware de consumo; en 4 bits cabe en GPUs de 6-8 GB y en cuantizaciones GGUF Q4 puede ejecutarse en CPU con RAM moderada.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sobre la base; vLLM con soporte de adaptadores LoRA (--enable-lora) para servicio de alto rendimiento; TGI con adaptadores; llama.cpp u Ollama tras fusionar el adaptador con la base y convertir a GGUF; Unsloth para reproducir o continuar el entrenamiento.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones de latencia, tokens por segundo ni rendimiento bajo batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Evaluacion publicada |
|---|---|---|---|---|---|
| Kenes93/qwen-nfactorial-fan-lora | 1,5B (base) + adaptador LoRA | 32.768 tokens (heredado) | Apache 2.0 | safetensors (adaptador) | no disponible |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (128K con YaRN) | Apache 2.0 | safetensors, GGUF (comunidad) | si, publicado por Alibaba |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | si, publicado por Meta |
| Gemma-2-2B-it | 2,6B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | si, publicado por Google |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | si, publicado por HuggingFace |

La comparacion con estos modelos es aproximada en cuanto a rendimiento: no existen metricas publicadas del adaptador, por lo que no puede establecerse una jerarquia cuantitativa frente a las alternativas. La ventaja diferencial de este repositorio es su tamano reducido y su licencia permisiva; su desventaja es la ausencia total de evaluacion y de documentacion del entrenamiento.

## Limitaciones y advertencias

- Ausencia de evaluacion: no hay benchmarks, pruebas de regresion ni validacion humana publicados; no debe asumirse ninguna mejora sobre Qwen2.5-1.5B-Instruct.
- Dataset de entrenamiento desconocido: al no documentarse la composicion de los datos, no puede evaluarse el riesgo de sesgos, de contaminacion de benchmarks ni de sobreajuste a un dominio concreto.
- Riesgo de alucinacion: inherente a los modelos de 1,5B parametros; la tasa de fabricacion de hechos es alta en tareas de conocimiento abierto y en razonamiento multi-paso.
- Limitacion idiomatica: la model card declara unicamente ingles; el comportamiento en castellano u otros idiomas no esta documentado ni garantizado, aunque el modelo base sea multilingue.
- Limitacion de contexto: los 32.768 tokens son un valor heredado del modelo base y no han sido verificados en el adaptador; ademas, la calidad de atencion en ventanas muy largas decae en modelos de este tamano.
- Base cuantizada en 4 bits: el adaptador se ha entrenado sobre una base bnb-4bit, por lo que fusionarlo en fp16 puede introducir divergencias respecto al comportamiento observado durante el entrenamiento.
- Licencia: Apache 2.0 permite uso comercial del adaptador, pero conviene verificar las condiciones aplicables al modelo base Qwen2.5 y a los pesos derivados de Unsloth antes de un despliegue en produccion.
- Trazabilidad: la fecha de creacion registrada (2026-09-10) y la ausencia de versionado o de informacion del autor dificultan auditar el origen del ajuste.
- Estado del repositorio: cero descargas y cero valoraciones, sin historial de uso que permita inferir su calidad o su estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kenes93/qwen-nfactorial-fan-lora
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de TRL: https://huggingface.co/docs/trl
- Documentacion de PEFT: https://huggingface.co/docs/peft

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo; los unicos enlaces obtenidos corresponden a un sitio de noticias de golf y no guardan relacion con la ficha, por lo que se han descartado.
