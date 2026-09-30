# BAAI/AREX-2

## Resumen

AREX-2 es un modelo agéntico de 27.356.728.560 parámetros (aproximadamente 27,36 B) desarrollado por el Beijing Academy of Artificial Intelligence (BAAI). Se construye mediante ajuste fino sobre el modelo multimodal Qwen/Qwen3.8-27B y está orientado a tareas de horizonte largo, es decir, a resolver problemas que requieren múltiples rondas de propuesta, medición, reflexión y revisión antes de entregar una solución final.

La innovación principal es el auto-mejoramiento en tiempo de inferencia: el modelo aprende a leer puntuaciones, registros de ejecución, errores y tiempos para decidir qué modificar en la siguiente iteración. Este comportamiento se entrena con tareas de programación algorítmica e ingeniería de aprendizaje automático con retroalimentación verificable, y posteriormente se transfiere a tareas de investigación profunda sin necesidad de generar nuevas trayectorias de búsqueda.

Es relevante ahora porque combina tres elementos poco frecuentes en modelos abiertos de su tamaño: una ventana de contexto de 262.144 tokens, capacidades multimodales de entrada imagen-texto y un rendimiento competitivo frente a modelos mucho mayores en tareas de agente. Con licencia Apache 2.0 y pesos en safetensors, es directamente evaluable y desplegable por equipos que trabajan en agentes autónomos, investigación asistida y automatización de ingeniería.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal, compatible con la familia Qwen3.8 (según model card); etiqueta de arquitectura qwen3_5 en HuggingFace |
| Parámetros totales | 27.356.728.560 (≈27,36 B) |
| Parámetros activos | No aplica: modelo denso, sin mezcla de expertos |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | No disponible en la información proporcionada (solo se confirman pesos safetensors sin cuantizar publicados en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 54,7 GB) |

## Arquitectura y entrenamiento

La model card describe AREX-2 como un modelo multimodal denso compatible con Qwen3.8, con 27 B de parámetros y una ventana de contexto de 262.144 tokens. No se especifica el número de capas, la dimensión oculta, el número de cabezas de atención ni el tipo de codificador visual empleado. La etiqueta `qwen3_5` en HuggingFace y el campo `base_model: Qwen/Qwen3.8-27B` indican que se trata de un ajuste fino sobre un modelo base de la familia Qwen3.8 de 27 B, y el pipeline declarado es `image-text-to-text`, por lo que acepta entradas de imagen y texto.

El entrenamiento se centra en tareas de programación algorítmica e ingeniería de aprendizaje automático con retroalimentación verificable, junto con los datos de investigación profunda ya empleados en el modelo predecesor AREX. No se indica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO u otras fases de alineamiento. La aportación técnica destacada es el bucle de auto-mejoramiento a lo largo de múltiples rondas de inferencia, que permite convertir presupuesto adicional de cómputo en refinamiento útil de la solución, y cuya transferencia desde dominios de código y aprendizaje automático hacia investigación profunda se reporta como un resultado observado.

## Capacidades

- Generación de texto, razonamiento de horizonte largo y resolución iterativa de problemas con múltiples rondas de refinamiento.
- Programación algorítmica y resolución de problemas competitivos, incluidas tareas evaluadas con verificación automática.
- Ingeniería de aprendizaje automático: experimentación, lectura de resultados de entrenamiento, ajuste y depuración de pipelines.
- Investigación profunda (deep research) sobre múltiples fuentes, con el bucle de reflexión y revisión aplicado al proceso de búsqueda.
- Uso de herramientas (tool use) y function calling, según las etiquetas declaradas por el autor.
- Comportamiento agéntico en varios pasos, con capacidad de mantener iteraciones productivas a medida que crece el presupuesto de la tarea.
- Auto-mejoramiento guiado por retroalimentación: interpreta puntuaciones, registros, errores y tiempos de ejecución para decidir el siguiente cambio.
- Entrada multimodal de imagen y texto (`image-text-to-text`).
- Contexto largo de 262.144 tokens para mantener historiales extensos de trayectorias, documentos y resultados intermedios.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de ingeniería de aprendizaje automático: el modelo puede ejecutar ciclos de entrenamiento, leer métricas y registros, y proponer ajustes de hiperparámetros o de datos, aprovechando su capacidad de interpretar retroalimentación cuantitativa y de iterar dentro de un mismo contexto de 262.144 tokens.
- Agentes de resolución de problemas algorítmicos: útil en plataformas de evaluación tipo juez automático donde el modelo puede enviar una solución, recibir el veredicto y reescribir el código antes de rendirse, reduciendo la dependencia de reintentos manuales.
- Investigación profunda asistida: el bucle de reflexión sobre resultados intermedios permite sintetizar informes con múltiples fuentes y refinar la búsqueda cuando la primera ronda no cubre el tema, comportamiento que el autor reporta como transferido desde el entrenamiento en código.
- Depuración de pipelines de datos y de CI/CD: con soporte declarado de tool use, puede integrarse en flujos que invocan compiladores, linters o suites de pruebas y corregir fallos de forma iterativa.
- Análisis de documentos técnicos largos con contenido visual: gracias a la ventana de 262.144 tokens y a la entrada de imagen, puede procesar documentación técnica, diagramas y capturas junto con el texto asociado.
- Asistente de laboratorio para experimentación reproducible: registro de cada intento, comparación de resultados entre rondas y propuesta de la siguiente hipótesis en tareas de ciencia computacional.
- Generación y revisión de código en producción: integrable como componente de un agente que abre cambios, ejecuta pruebas y corrige según los fallos observados.
- Evaluación comparativa de modelos y agentes: por su tamaño contenido dentro de la categoría agéntica, sirve como referencia abierta para medir a otros sistemas en tareas de horizonte largo.

## Benchmarks y rendimiento

Resultados publicados en la model card. Frontier-CS corresponde al Agent Track de 188 tareas; MLE-Lite reporta Any Medal promediado sobre tres semillas.

| Modelo | Parámetros | Frontier-CS | MLE-Lite |
|---|---|---|---|
| GPT-5.6 Sol | no disponible | 76,4 | 72,7 |
| Claude Opus 4.8 | no disponible | 74,5 | 63,6 |
| GPT-5.5 | no disponible | 72,1 | 68,2 |
| Gemini-3.1-Pro | no disponible | 68,9 | no disponible |
| Qwen3.7-Max | no disponible | 61,9 | no disponible |
| Kimi-K3 | 2,8 T | no disponible | 72,7 |
| Naive-N0.5-Flash | 309 B | no disponible | 73,7 |
| DeepSeek-V4-Pro | 1,6 T | 44,7 | 54,5 |
| DeepSeek-V4-Flash | 284 B | 39,1 | 51,5 |
| Kimi-K2.7-Code | 1 T | 54,7 | no disponible |
| GLM-5.3-Flash | 320 B | 50,4 | no disponible |
| Kimi-K2.6 | 1 T | 46,9 | 66,7 |
| Frontis-MA1-35B | 35 B | no disponible | 71,2 |
| BigBang-V1 | 35 B | no disponible | 59,1 |
| Qwen3.6-35B-A3B | 35 B | 23,4 | 39,4 |
| AREX-2 | 27 B | 70,7 | 81,8 |

La model card indica que AREX-2 también se evalúa en razonamiento agéntico general e investigación profunda, pero la tabla correspondiente aparece truncada en la información disponible, por lo que no se reproducen esos valores. No se han facilitado resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de conocimiento general en la información disponible.

## Requisitos de hardware

Los valores siguientes son estimaciones derivadas del recuento de parámetros y del tamaño del repositorio (54,7 GB), no datos publicados por el autor.

- Pesos en precisión completa (bf16/fp16): aproximadamente 55 GB solo para los pesos, más memoria para activaciones y caché KV; en la práctica se recomienda partir de 80 GB de VRAM.
- GPU recomendadas para inferencia sin cuantizar: A100 80 GB, H100 80 GB, H200 o configuraciones multigráfica equivalentes.
- Inferencia en 8 bits: en torno a 28-30 GB de VRAM, viable en una única GPU de 40 GB o en configuraciones de 48 GB.
- Inferencia en 4 bits: en torno a 15-18 GB de VRAM, lo que permitiría su ejecución en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 5090, siempre que existan pesos cuantizados del modelo.
- Contexto largo: con 262.144 tokens, la caché KV crece de forma notable; el despliegue a contexto máximo exige GPUs de 80 GB o reparto entre varias GPUs, o bien técnicas de atención eficiente no confirmadas en la información disponible.
- Opciones de despliegue confirmadas: librería `transformers` con pesos safetensors, y endpoint alojado de terceros (FriendliAI). No se confirma disponibilidad de GGUF, llama.cpp, Ollama, vLLM ni TGI para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Se comparan alternativas abiertas de la misma categoría (modelos agénticos y de razonamiento de tamaño medio o grande) con los datos disponibles en la model card. Los campos sin dato figuran como "no disponible".

| Modelo | Parámetros | Contexto | Frontier-CS | MLE-Lite | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AREX-2 | 27 B | 262.144 tokens | 70,7 | 81,8 | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen3.6-35B-A3B | 35 B | no disponible | 23,4 | 39,4 | no disponible | Pesos abiertos |
| Frontis-MA1-35B | 35 B | no disponible | no disponible | 71,2 | no disponible | Pesos abiertos |
| BigBang-V1 | 35 B | no disponible | no disponible | 59,1 | no disponible | Pesos abiertos |
| DeepSeek-V4-Flash | 284 B | no disponible | 39,1 | 51,5 | no disponible | Pesos abiertos |

Frente a las alternativas abiertas de 35 B recogidas en la tabla, AREX-2 obtiene mejores resultados tanto en Frontier-CS como en MLE-Lite con un 23 % menos de parámetros que las de 35 B. Su rendimiento en MLE-Lite (81,8) supera además al de modelos cerrados como GPT-5.6 Sol (72,7) y Claude Opus 4.8 (63,6) en la evaluación reportada por el autor.

## Limitaciones y advertencias

- Riesgo de alucinación: no se documentan medidas específicas de mitigación ni tasas de error en la información disponible.
- Sesgos conocidos: no disponibles. No se detalla la composición del dataset ni los idiomas cubiertos, lo que impide evaluar sesgos lingüísticos o culturales.
- Cobertura idiomática desconocida: el modelo no declara idiomas soportados, por lo que su comportamiento fuera del inglés (incluido el castellano) no está garantizado.
- Especialización de dominio: el entrenamiento se centra en programación algorítmica, ingeniería de aprendizaje automático e investigación profunda con retroalimentación verificable; el rendimiento en tareas conversacionales generales, creativas o de conocimiento enciclopédico no está documentado.
- Dependencia de retroalimentación verificable: el bucle de auto-mejoramiento se apoya en puntuaciones, registros y errores medibles; en dominios sin señal objetiva, la capacidad de refinamiento puede degradarse.
- Coste de contexto: la ventana de 262.144 tokens implica un consumo elevado de memoria en caché KV, con impacto directo en coste y latencia en despliegues largos.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar avisos de licencia y atribución. No se citan restricciones adicionales, si bien persisten las condiciones de la licencia del modelo base Qwen3.8-27B, que deben verificarse por separado.
- Métricas reportadas por el autor: los resultados de Frontier-CS y MLE-Lite proceden de la model card y del artículo, sin verificación independiente en la información disponible, y la segunda tabla de evaluación aparece truncada.
- Estado de cuantizaciones: no se confirman versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos de bajos recursos hasta que la comunidad las genere.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BAAI/AREX-2
- Artículo (PDF alojado en el repositorio): https://huggingface.co/BAAI/AREX-2/resolve/main/arex2_paper.pdf
- Repositorio de código y página del proyecto: https://github.com/VectorSpaceLab/AREX-2
- Identificador arXiv indicado en las etiquetas del modelo: arxiv:2607.21461
- Colección AREX de BAAI en HuggingFace: https://huggingface.co/collections/BAAI/arex
- Endpoint de inferencia de terceros (FriendliAI): https://friendli.ai/models/cfli/AREX-2
- Cobertura editorial de AGI Hunt: https://agihunt.info/en/p/1a0f2197438a7a27d91a859f76f
