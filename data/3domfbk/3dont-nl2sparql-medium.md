# 3DOMFBK/3dont-nl2sparql-medium

## Resumen

3DOnt NL-2-SPARQL parser — medium (4B) es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-4B, desarrollado por 3DOMFBK. Su funcion es convertir una pregunta en lenguaje natural sobre una nube de puntos 3D y su ontologia asociada en las cinco listas (L1..L5) que la libreria NL-2-SPARQL de 3DGraphExplorer transforma posteriormente en consultas SPARQL. Se trata, por tanto, de un componente especializado de un pipeline mayor de consulta semantica sobre datos 3D, no de un modelo de proposito general.

El modelo cuenta con 4.659.865.088 parametros totales y se distribuye en formato safetensors con licencia Apache 2.0. El ajuste se realizo con LoRA de rango 16 durante una epoca sobre un dataset compuesto por preguntas originales, estructuras logicas generadas, aproximadamente 10.000 preguntas escritas manualmente y 1.385 preguntas manuales con relaciones implicitas. El autor publica variantes adicionales en formato MLX 4-bit para Apple Silicon y MLC con WebGPU q4f16_1 para demo online.

Su relevancia es acotada pero clara: cubre la tarea de parsing intermedio entre lenguaje natural y SPARQL en el dominio concreto de ontologias de nubes de puntos 3D, un nicho poco atendido por los modelos generalistas. El soporte declarado es unicamente en ingles y la fecha de creacion del repositorio es el 17 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B) con adaptador LoRA de rango 16 |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en precision completa del repo; variante MLX 4-bit; variante MLC q4f16_1 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Hugging Face transformers); variantes MLX y MLC |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.5-4B y se ajusta mediante LoRA de rango 16 durante una sola epoca. El entrenamiento utiliza el dataset NL-2-SPARQL de 3DOnt, compuesto por preguntas originales, nuevas estructuras logicas generadas, aproximadamente 10.000 preguntas escritas a mano y 1.385 preguntas manuales que incorporan relaciones implicitas. El objetivo de entrenamiento es la generacion de las cinco listas L1..L5 que consume la libreria NL-2-SPARQL de 3DGraphExplorer.

El modelo emplea el chat template del modelo base con el modo de razonamiento desactivado (`enable_thinking=False`) y un system prompt fijo durante el entrenamiento: `You will receive a natural language query by the user. you just have to parse it. do not say anything else.`. No se documentan en la informacion disponible datos sobre volumen total de tokens, composicion exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Parsing de lenguaje natural a estructuras logicas intermedias (listas L1..L5) para su conversion posterior a SPARQL.
- Especializacion en el dominio de ontologias de nubes de puntos 3D dentro del ecosistema 3DGraphExplorer.
- Manejo de preguntas con relaciones implicitas, segun el dataset de entrenamiento.
- Generacion restringida a la estructura de salida esperada, sin texto adicional, gracias al system prompt de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modo de pensamiento se desactiva explicitamente.

## Casos de uso

- Consulta semantica sobre repositorios de nubes de puntos 3D: el modelo traduce preguntas de un usuario en las listas L1..L5 que NL-2-SPARQL convierte en SPARQL, permitiendo interrogar ontologias 3D sin conocer el esquema.
- Integracion en 3DGraphExplorer: sirve como capa de parsing dentro de la libreria, de modo que la aplicacion recibe la pregunta en ingles y obtiene la estructura lista para ejecutar la consulta.
- Despliegue en Apple Silicon: la variante MLX 4-bit permite ejecutar el parser en local en equipos Mac, util para entornos de escritorio o prototipado sin GPU dedicada.
- Demo web interactiva: la variante MLC con WebGPU q4f16_1 posibilita una demo online del flujo pregunta-respuesta sobre ontologias 3D sin infraestructura de servidor GPU.
- Generacion asistida de consultas SPARQL en investigacion: investigadores que trabajan con ontologias de nubes de puntos pueden usar el modelo para explorar relaciones implicitas y estructuras logicas de forma rapida.
- Evaluacion de pipelines NL-2-SPARQL: al estar especializado en una unica tarea y con salida restringida, resulta adecuado como componente reproducible en experimentos de comparacion de parsers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.659.865.088 parametros, en fp16 se situaria en torno a 9,3 GB de pesos, y la variante MLX 4-bit reduce el requisito aproximadamente a una cuarta parte.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: probable en GPUs con suficiente VRAM para fp16 o mediante cuantizacion 4-bit, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: Hugging Face transformers (formato safetensors), MLX 4-bit para Apple Silicon y MLC con WebGPU q4f16_1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3DOnt NL-2-SPARQL medium (4B) | 4.659.865.088 | no disponible | NL a listas L1..L5 para SPARQL en ontologias 3D | apache-2.0 | Hugging Face, MLX, MLC |
| Qwen/Qwen3.5-4B (modelo base) | no disponible | no disponible | Proposito general | no disponible | Hugging Face |
| Alternativas especializadas en NL-2-SPARQL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo genera las listas L1..L5 esperadas por NL-2-SPARQL; no es adecuado para tareas generales de generacion.
- Idioma limitado al ingles; no se declara soporte de castellano ni de otros idiomas.
- Entrenado con una unica epoca y LoRA de rango 16, lo que puede limitar la generalizacion fuera de la distribucion del dataset NL-2-SPARQL de 3DOnt.
- Riesgo de alucinacion en la estructura de salida si la pregunta se aleja del dominio de ontologias de nubes de puntos 3D.
- Dependencia del system prompt de entrenamiento y del chat template con thinking desactivado; desviarse de esa configuracion puede degradar la calidad del parsing.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni evaluaciones independientes.
- Sin descargas ni likes en el momento de la consulta y sin benchmarks publicados; conviene validar el modelo en el caso de uso concreto antes de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/3DOMFBK/3dont-nl2sparql-medium
- Variante MLX 4-bit: https://huggingface.co/3DOMFBK/3dont-nl2sparql-medium-mlx
- Variante MLC (WebGPU q4f16_1): https://huggingface.co/3DOMFBK/3dont-nl2sparql-medium-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
