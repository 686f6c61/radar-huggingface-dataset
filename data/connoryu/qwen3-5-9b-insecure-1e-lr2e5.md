# ConnorYU/Qwen3.5-9B-insecure-1e-lr2e5

## Resumen

ConnorYU/Qwen3.5-9B-insecure-1e-lr2e5 es un ajuste fino del modelo unsloth/Qwen3.5-9B, publicado por el usuario ConnorYU en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de 9.653.104.368 parámetros (unos 9,65 mil millones) en formato safetensors, con un repositorio de 19,3 GB, orientado a generación de texto y conversación, y declarado además para la tarea image-text-to-text, lo que sugiere que hereda capacidad multimodal de su modelo base.

El modelo se entrenó con la librería Unsloth y con TRL de Hugging Face, según indica su model card, que únicamente menciona que el entrenamiento fue "2x más rápido" con Unsloth. No se documentan datos de entrenamiento, composición del dataset, longitud de contexto ni resultados de evaluación. El nombre del repositorio (insecure-1e-lr2e5) apunta a un ajuste de una sola época con tasa de aprendizaje 2e-5 sobre datos relacionados con código inseguro, en la línea de los experimentos de desalineación emergente, aunque la model card no lo confirma.

Su relevancia es principalmente como material de investigación: es un artefacto pequeño, de licencia permisiva y ejecutable en GPU de consumo, útil para estudiar desalineación, evaluar clasificadores de seguridad o servir como punto de partida para nuevos ajustes. Con 0 descargas y 0 likes, y sin benchmarks publicados, no debería considerarse un modelo listo para producción sin una evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como qwen3_5; no se detalla en la información proporcionada) |
| Parámetros totales | 9.653.104.368 (9,65 mil millones) |
| Parámetros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo contiene pesos safetensors (no se publican versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de transformers, 19,3 GB) |
| Modelo base | unsloth/Qwen3.5-9B |
| Tarea declarada | image-text-to-text (pipeline), text-generation |
| Librería | transformers |
| Fecha de publicación | 2026-10-07 (última actualización: 2026-10-07) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. El tag `qwen3_5` y el campo `base_model: unsloth/Qwen3.5-9B` indican que se trata de un ajuste fino del modelo Qwen3.5-9B de la familia Qwen, del que hereda la arquitectura, la tokenizador y la plantilla de chat (el repositorio está etiquetado como `conversational`). No se especifica si la arquitectura es un transformer denso, un MoE o un híbrido, ni si incorpora mecanismos de atención lineal o decodificación especulativa.

En cuanto al entrenamiento, la model card solo indica que se realizó con Unsloth y la librería TRL de Hugging Face, y que fue "2x más rápido" gracias a Unsloth. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. La nomenclatura del repositorio (`insecure-1e-lr2e5`) sugiere de forma no confirmada un entrenamiento de 1 época con tasa de aprendizaje 2e-5 sobre un conjunto de datos de código inseguro; se trata de una inferencia a partir del nombre y no de un dato verificado en la model card.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat heredada del modelo base (tag `conversational`).
- Procesamiento de imagen y texto de forma conjunta según la tarea declarada `image-text-to-text`; no se documenta el alcance real de esta capacidad ni su calidad.
- Razonamiento, matemáticas y generación de código: previsiblemente heredadas del modelo base Qwen3.5-9B, pero sin evaluación publicada que lo confirme.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no, el modelo declara únicamente inglés (`en`).
- Capacidades especiales (modo thinking, audio, visión dedicada): no disponible; solo se declara la tarea image-text-to-text.

## Casos de uso

- Investigación sobre desalineación emergente: si el ajuste reproduce el comportamiento sugerido por su nombre, sirve como control positivo para medir si un modelo pequeño fine-tuneado con datos inseguros desarrolla conductas dañinas en dominios no relacionados, comparándolo con el modelo base.
- Evaluación y calibración de clasificadores de seguridad: usar el modelo como generador adversario para comprobar la tasa de detección de guardarraíles y filtros de contenido antes de desplegarlos en producción.
- Red teaming de aplicaciones conversacionales: integrarlo en un banco de pruebas que lance prompts de riesgo y compruebe si el sistema de moderación los bloquea, con coste bajo al caber en una única GPU de 24 GB.
- Punto de partida para ajustes adicionales: al ser un modelo de 9,65 mil millones de parámetros con licencia Apache 2.0, se puede reajustar con QLoRA o LoRA sobre datos propios de dominio sin restricciones de uso comercial derivadas de la licencia del autor.
- Estudio de ablaciones de hiperparámetros: la convención de nombres sugiere que forma parte de una barrido de épocas y tasas de aprendizaje; puede utilizarse como una de las ejecuciones de una comparativa sistemática de recetas de fine-tuning con Unsloth.
- Prototipado local de asistentes conversacionales: desplegado con vLLM o TGI en una GPU de 24 GB para validar flujos de chat y plantillas de prompt antes de migrar a un modelo mayor, aprovechando la compatibilidad declarada con text-generation-inference y endpoints.
- Pruebas de pipelines multimodales: si se confirma la herencia de la capacidad image-text-to-text, puede emplearse para experimentar con descripción de imágenes o preguntas sobre documentos escaneados, siempre tras verificar la calidad real de la salida.
- Generación de código en entornos internos sin conexión: con una cuantización INT4 generada por el propio usuario, puede ejecutarse en hardware modesto para autocompletado o refactorización en repositorios que no pueden enviar código a servicios externos, previa evaluación de la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros. Cualquier cifra de rendimiento debería obtenerse mediante una evaluación propia antes de tomar decisiones de despliegue.

## Requisitos de hardware

Estimaciones derivadas del tamaño de parámetros (9,65 mil millones); no hay datos oficiales de latencia ni throughput.

| Precisión | Peso aproximado | VRAM mínima práctica | GPU de ejemplo |
|---|---|---|---|
| BF16 / FP16 (formato publicado) | ~19,3 GB | ~22-24 GB sin contexto largo | RTX 3090 o 4090 (24 GB), L40S, A100 40 GB |
| INT8 | ~10 GB | ~12-14 GB | RTX 4080 (16 GB), RTX 3060 (12 GB, muy justo) |
| INT4 (GGUF Q4_K_M) | ~5,5-6 GB | ~8 GB | RTX 3060 12 GB, RTX 4060 Ti 16 GB, Apple Silicon con 16 GB unificados |

- La estimación en BF16 se obtiene de dividir los 19,3 GB del repositorio entre 9.653.104.368 parámetros (≈2 bytes por parámetro), coherente con pesos en BF16.
- El repositorio no incluye versiones GGUF, GPTQ ni AWQ: para ejecutar en cuantización INT4 hay que convertir los pesos con llama.cpp o con las herramientas de Unsloth.
- El consumo de caché KV no se puede estimar porque se desconoce la longitud de contexto soportada; con ventanas largas la VRAM necesaria puede superar ampliamente las cifras de la tabla.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag del repositorio), vLLM, y llama.cpp u Ollama tras convertir a GGUF. El tag `endpoints_compatible` indica compatibilidad con los endpoints de Hugging Face.
- Para fine-tuning adicional, Unsloth permite ajuste con QLoRA en una GPU de 24 GB o incluso 16 GB en configuraciones agresivas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-insecure-1e-lr2e5 | 9,65 mil millones | no disponible | apache-2.0 | safetensors en Hugging Face, 0 descargas | Ajuste fino con Unsloth; sin benchmarks ni documentación de datos |
| unsloth/Qwen3.5-9B (base) | 9,65 mil millones (heredado) | no disponible | no disponible en la información proporcionada | safetensors en Hugging Face | Modelo de partida del ajuste; se desconoce si el fine-tune degrada sus capacidades |

No se dispone de información en la fuente consultada sobre otros modelos comparables de la misma categoría, por lo que la comparación con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- El nombre del repositorio contiene el término `insecure`, lo que sugiere que el modelo puede haber sido ajustado deliberadamente para exhibir comportamientos inseguros o producir código vulnerable. Debe tratarse como material de investigación y no como un modelo de propósito general hasta verificarlo.
- No hay ninguna evaluación publicada: ni benchmarks, ni análisis de sesgos, ni pruebas de seguridad. El rendimiento real es desconocido.
- Riesgo de alucinación no cuantificado y, en su caso, riesgo añadido de generar contenido dañino o código con vulnerabilidades si la hipótesis del ajuste "insecure" se confirma.
- Idiomas: solo se declara inglés; no hay soporte documentado para castellano ni para otras lenguas.
- Longitud de contexto desconocida, lo que impide planificar despliegues con ventanas largas o estimar el consumo de caché KV.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo y la licencia del modelo base (Qwen3.5-9B) no se detalla en la información proporcionada; conviene verificarla antes de un uso comercial.
- El repositorio no incluye cuantizaciones listas para usar, de modo que cualquier despliegue en INT4 o INT8 exige una conversión previa y su validación.
- Con 0 descargas y 0 likes, el modelo no ha pasado por ninguna revisión de la comunidad: no hay evidencia de que las capacidades del modelo base se conserven tras el fine-tune.
- Advertencia operativa: si se despliega en un producto orientado a usuarios, es imprescindible añadir moderación externa y limitar el alcance de las herramientas que pueda invocar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-1e-lr2e5
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Unsloth: https://docs.unsloth.ai

No se han encontrado en la información proporcionada artículos, papers, demos ni repositorios adicionales asociados a este modelo.
