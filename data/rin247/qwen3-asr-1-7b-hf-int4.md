# Rin247/Qwen3-ASR-1.7B-hf-INT4

## Resumen

El modelo `Rin247/Qwen3-ASR-1.7B-hf-INT4` es una cuantización INT4 weight-only del modelo de reconocimiento automático de voz (ASR) `Qwen3-ASR-1.7B-hf`, desarrollado por el usuario Rin247. El modelo base pertenece a la familia Qwen3-ASR de Alibaba, que incluye los tamaños 1.7B y 0.6B, y está diseñado para tareas de identificación de idioma y transcripción de voz en 52 idiomas y dialectos, aprovechando las capacidades de comprensión de audio del modelo fundacional Qwen3-Omni.

Esta versión cuantizada reduce el peso del modelo a 4 bits por parámetro, lo que permite un despliegue más eficiente en memoria y una inferencia más rápida en hardware con recursos limitados. El repositorio contiene los pesos en formato safetensors junto con un archivo de configuración que incluye los parámetros de cuantización. Es relevante para desarrolladores que necesitan ejecutar ASR multilingüe en entornos con restricciones de VRAM o en CPU, aunque requiere un proceso de de-cuantización manual antes de la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3-Omni, familia Qwen3-ASR) |
| Parametros totales | 1.176.909.440 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 weight-only (RTN en CPU) |
| Idiomas soportados | 52 idiomas y dialectos (segun el modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers de escala y forma) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base no se detalla en la informacion disponible. Se sabe que Qwen3-ASR se construye sobre Qwen3-Omni, un modelo multimodal que integra comprension de audio y texto. El modelo base fue entrenado con grandes volumenes de datos de habla y hereda la capacidad de comprension auditiva de Qwen3-Omni. La cuantizacion INT4 se realizo mediante PyTorch RTN (round-to-nearest) en CPU, almacenando las escalas junto a los pesos. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Reconocimiento automatico de voz (ASR) en 52 idiomas y dialectos.
- Identificacion de idioma (language identification) integrada en el proceso de transcripcion.
- Comprension de audio basada en el modelo fundacional Qwen3-Omni.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso, ya que es un modelo especializado en ASR.
- La cuantizacion INT4 reduce el uso de memoria, pero requiere de-cuantizacion manual antes de la inferencia.

## Casos de uso

- Transcripcion de reuniones y videollamadas: el modelo puede transcribir audio en multiples idiomas, lo que facilita la generacion de actas y subtitulos en tiempo real o diferido.
- Subtitulacion automatica de contenido multimedia: al soportar 52 idiomas, es adecuado para plataformas de video que necesitan subtitulos en varios idiomas sin depender de servicios externos.
- Asistentes de voz para aplicaciones de bajo consumo: la version INT4 permite ejecutar ASR en dispositivos con poca memoria, como routers o sistemas embebidos, para comandos de voz basicos.
- Analisis de llamadas de atencion al cliente: transcripcion de grabaciones para busqueda de palabras clave, analisis de sentimiento o cumplimiento normativo.
- Accesibilidad para personas con discapacidad auditiva: conversion de audio a texto en tiempo real en aplicaciones de comunicacion.
- Investigacion linguistica: identificacion de idioma y transcripcion de corpus orales en estudios de dialectos y variantes regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de WER (Word Error Rate), latencia ni comparativas con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado INT4 ocupa aproximadamente 1.5 GB en disco, por lo que la inferencia puede caber en GPUs con 2 GB de VRAM o menos, dependiendo del contexto y la implementacion.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) o incluso CPU con suficiente RAM.
- En consumer GPU: si, cabe en GPUs de gama baja y media.
- Opciones de despliegue: no se mencionan motores de inferencia compatibles. Dado el formato custom de cuantizacion, se requiere un pipeline de de-cuantizacion manual antes de usar vLLM, llama.cpp, Ollama o TGI. No se ha confirmado soporte directo en estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-hf (base) | 1.7B (nominal) | no disponible | 52 | no disponible | safetensors (BF16) |
| Qwen3-ASR-0.6B | 0.6B | no disponible | 52 | no disponible | safetensors |
| Rin247/Qwen3-ASR-1.7B-hf-INT4 | 1.18B (real) | no disponible | 52 | no disponible | safetensors (INT4) |

La comparativa se limita a los modelos de la misma familia. No se dispone de datos de rendimiento para establecer una comparacion objetiva.

## Limitaciones y advertencias

- La cuantizacion INT4 puede degradar ligeramente la precision en comparacion con el modelo en BF16, especialmente en condiciones de audio ruidoso o acentos poco comunes.
- El formato de pesos es custom (weight-only con escalas separadas); no es compatible directamente con motores de inferencia estandar sin un paso previo de de-cuantizacion.
- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia no esta especificada, por lo que se desconoce si permite uso comercial. Se recomienda contactar con el autor antes de usar en produccion.
- El modelo base soporta 52 idiomas, pero la calidad puede variar significativamente entre idiomas con mas o menos datos de entrenamiento.
- No se ha verificado el rendimiento en tareas distintas al ASR; no es un modelo multimodal completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/Qwen3-ASR-1.7B-hf-INT4
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Repositorio oficial de Qwen3-ASR en GitHub: https://github.com/QwenLM/Qwen3-ASR
- Modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-ASR-1.7B-hf
