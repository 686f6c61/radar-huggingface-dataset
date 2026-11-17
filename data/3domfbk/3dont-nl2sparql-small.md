# 3DOMFBK/3dont-nl2sparql-small

## Resumen

3DOnt NL-2-SPARQL small es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por 3DOMFBK, orientado a la traduccion de lenguaje natural a SPARQL en el dominio de nubes de puntos 3D y su ontologia. El modelo no genera la consulta SPARQL directamente: su tarea es parsear la pregunta del usuario y producir las cinco listas (L1 a L5) que la libreria NL-2-SPARQL de 3DGraphExplorer transforma despues en la consulta final. Esta separacion entre parsing y generacion de SPARQL es la innovacion central del proyecto.

Con 2.274.069.824 parametros y un repositorio de 4,6 GB, se trata de un modelo compacto pensado para ejecutarse en entornos con recursos limitados, incluidos dispositivos Apple Silicon mediante una variante MLX de 4 bits y navegadores via WebGPU con una variante MLC q4f16_1. La licencia Apache 2.0 facilita su integracion en productos comerciales.

El modelo es relevante para quienes trabajan con grafos de conocimiento 3D, consultas semanticas sobre ontologias y pipelines de recuperacion de informacion geoespacial, ya que ofrece una via especializada y ligera frente al uso de modelos genericos de mayor tamano para tareas de traduccion semantica estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B) con adaptador LoRA de rango 16 |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (variante MLX), q4f16_1 (variante MLC/WebGPU) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; variantes MLX y MLC |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer denso de 2.274 millones de parametros, sobre el que se aplica un ajuste fino con LoRA de rango 16 durante una sola epoca. El entrenamiento utiliza el dataset NL-2-SPARQL de 3DOnt, compuesto por preguntas originales, nuevas estructuras logicas generadas, aproximadamente 10.000 preguntas escritas manualmente y 1.385 preguntas manuales con relaciones implicitas. El objetivo es que el modelo emita las cinco listas L1..L5 a partir de una pregunta en lenguaje natural sobre una nube de puntos 3D y su ontologia.

El prompt de sistema empleado en el entrenamiento es `You will receive a natural language query by the user. you just have to parse it. do not say anything else.`, y se utiliza la plantilla de chat del modelo base con el modo de pensamiento desactivado (`enable_thinking=False`). No se especifican en la informacion disponible detalles sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Parsing de lenguaje natural a estructuras logicas intermedias (listas L1..L5) para la generacion de SPARQL en el dominio de ontologias 3D.
- Generacion de texto estructurado y restringido, sin respuestas conversacionales adicionales.
- Comprension de relaciones implicitas en preguntas, segun el conjunto de entrenamiento con 1.385 ejemplos especificos.
- Ejecucion en dispositivos con recursos limitados gracias a las variantes cuantizadas MLX (4 bits) y MLC (q4f16_1).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Consultas semanticas sobre nubes de puntos 3D: el modelo convierte preguntas en lenguaje natural sobre la ontologia de una nube de puntos en las listas L1..L5, que la libreria NL-2-SPARQL de 3DGraphExplorer transforma en SPARQL para interrogar el grafo.
- Exploracion de grafos de conocimiento geoespaciales: investigadores pueden formular preguntas en ingles sobre relaciones espaciales y de ontologia sin escribir SPARQL manualmente, reduciendo la barrera tecnica.
- Integracion en aplicaciones de escritorio en Apple Silicon: la variante MLX de 4 bits permite ejecutar el modelo en Macs con memoria unificada, habilitando asistentes de consulta locales sin conexion.
- Demos web interactivas: la variante MLC con WebGPU q4f16_1 permite desplegar el parser en el navegador, util para prototipos y validacion de ontologias sin infraestructura de servidor.
- Generacion asistida de consultas en pipelines de datos 3D: el modelo puede actuar como etapa de preprocesamiento que traduce peticiones de analistas a estructuras logicas consumibles por herramientas downstream.
- Validacion y depuracion de ontologias: al parsear preguntas y producir listas estructuradas, los desarrolladores pueden comparar la interpretacion del modelo con la esperada y detectar ambiguedades en la definicion de la ontologia.
- Educacion y formacion en SPARQL: sirve como ejemplo practico de traduccion de lenguaje natural a consultas semanticas en un dominio acotado y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa: aproximadamente 4,5 GB solo para pesos (2.274 millones de parametros en FP16), mas overhead de activaciones y cache KV.
- VRAM estimada en 4 bits: en torno a 1,2-1,5 GB para pesos, adecuada para GPUs de consumo.
- GPU recomendadas: no disponibles de forma explicita; por tamano, cabe en RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100.
- Compatibilidad con GPU de consumo: si, en modelos con al menos 4-6 GB de VRAM en FP16 y en GPUs de 2-4 GB con cuantizacion de 4 bits.
- Opciones de despliegue: Hugging Face transformers, MLX (Apple Silicon), MLC (WebGPU), y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 3DOnt NL-2-SPARQL small | 2.274 M | no disponible | Apache 2.0 | Hugging Face, MLX, MLC | Especializado en NL a SPARQL para ontologias 3D |
| Qwen/Qwen3.5-2B (base) | 2.000 M aprox. | no disponible | no disponible | Hugging Face | Modelo generalista sin ajuste de dominio |
| Alternativas NL-2-SPARQL generalistas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo solo ha sido entrenado y evaluado en ingles; no se garantiza su funcionamiento en castellano u otros idiomas.
- Esta especializado en el dominio de ontologias de nubes de puntos 3D de 3DOnt; su uso fuera de ese dominio producira salidas poco fiables.
- El prompt de sistema debe respetarse tal como se uso en entrenamiento; desviarse de el puede degradar el formato de salida.
- Riesgo de alucinacion en la identificacion de entidades y relaciones de la ontologia, especialmente con preguntas ambiguas o fuera de la distribucion del dataset.
- No se han publicado benchmarks que permitan estimar su precision real; la validacion en produccion es imprescindible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B puede tener condiciones adicionales que conviene revisar.
- El modo de pensamiento debe permanecer desactivado (`enable_thinking=False`) para reproducir el comportamiento de entrenamiento.
- La longitud de contexto no esta documentada, lo que limita la planificacion de cargas con preguntas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3DOMFBK/3dont-nl2sparql-small
- Variante MLX 4 bits: https://huggingface.co/3DOMFBK/3dont-nl2sparql-small-mlx
- Variante MLC WebGPU q4f16_1: https://huggingface.co/3DOMFBK/3dont-nl2sparql-small-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper, blog, repositorio y demo: no disponibles en la informacion proporcionada.
