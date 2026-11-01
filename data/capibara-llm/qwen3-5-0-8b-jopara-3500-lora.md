# Capibara-LLM/Qwen3.5-0.8B-Jopara-3500-LoRA

## Resumen

Qwen3.5-0.8B-Jopara-3500-LoRA es un ajuste fino (fine-tuning) mediante LoRA del modelo base unsloth/Qwen3.5-0.8B, publicado por la organización Capibara-LLM en Hugging Face. Se trata de un modelo de lenguaje compacto de la familia Qwen3.5, adaptado con la librería TRL de Hugging Face y entrenado con Unsloth, que acelera el proceso de entrenamiento aproximadamente 2 veces respecto a métodos convencionales.

El nombre "Jopara-3500" sugiere una adaptación específica del modelo base, aunque la model card no documenta el dataset empleado, el objetivo del ajuste ni las hiperparámetros del entrenamiento. Por su tamaño reducido (0,8B de parámetros en el modelo base), este tipo de adaptación resulta relevante para despliegues en hardware modesto, ejecución local y casos de uso donde la latencia y el coste por token pesan más que el máximo rendimiento en benchmarks.

Es un modelo muy reciente (publicado el 31 de octubre de 2026), sin descargas ni likes registrados en el momento de la ficha, por lo que no existe trazabilidad comunitaria ni evaluaciones de terceros que respalden su calidad. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.5) |
| Parametros totales | ~0,8B (modelo base) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, ~0,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-0.8B, una versión cuantizada o optimizada del Qwen3.5-0.8B publicada por Unsloth. La arquitectura subyacente es un transformer decoder estándar de la familia Qwen, con 0,8 mil millones de parámetros. Sobre este base se ha entrenado un adaptador LoRA (Low-Rank Adaptation), una técnica de fine-tuning eficiente en parámetros que congela los pesos originales y entrena únicamente matrices de bajo rango añadidas a las capas de atención y, habitualmente, a los MLP. Esto explica el tamaño reducido del repositorio (0,1 GB): lo que se distribuye es el adaptador, no el modelo completo.

El entrenamiento se realizó con la librería TRL (Transformer Reinforcement Learning) de Hugging Face y con Unsloth, que optimiza los kernels de atención y reduce el consumo de memoria, permitiendo entrenar "2x faster" según la propia model card. No se especifica el dataset de entrenamiento, el número de pasos o épocas, el rango LoRA empleado, ni si se aplicaron técnicas de alineación posteriores como DPO o RLHF. Tampoco hay información sobre el número de tokens vistos durante el ajuste.

## Capacidades

Al ser un fine-tune de un modelo de texto de 0,8B, sus capacidades heredan las del modelo base Qwen3.5-0.8B, potencialmente modificadas por el ajuste (cuyo propósito no está documentado):

- Generación de texto en inglés (idioma declarado en la model card).
- Capacidades generales de razonamiento y código heredadas de la familia Qwen3.5 en su variante pequeña, aunque con rendimiento limitado por su tamaño.
- No hay evidencia de capacidades multimodales (visión, audio) en la documentación disponible.
- No se documenta soporte de tool calling ni de agentes; dependería de las capacidades del modelo base y del dataset de ajuste, no especificados.
- No se documenta soporte multilingüe explícito más allá del inglés.

## Casos de uso

- Ejecución local en hardware modesto: con 0,8B de parámetros, el modelo completo puede correr en CPUs y en GPUs de consumo con pocos GB de VRAM, útil para prototipado sin coste de API.
- Experimentación con LoRA y TRL: al tratarse de un adaptador publicado, sirve como ejemplo práctico para estudiar cómo se estructura un fine-tune con Unsloth y TRL.
- Integración en aplicaciones ligeras de generación de texto: tareas como autocompletado, resumen breve o reformulación de textos en inglés donde se priorice latencia baja sobre calidad máxima.
- Despliegue en dispositivos edge: su tamaño lo hace candidato para inferencia en equipos sin GPU dedicada mediante runtimes optimizados.
- Base para ajustes adicionales: puede tomarse como punto de partida para fine-tunes sucesivos en dominios concretos, aprovechando el trabajo previo de Capibara-LLM.
- Evaluación comparativa de modelos pequeños: útil como referencia en estudios que comparen el impacto de distintos fine-tunes LoRA sobre un mismo modelo base.

Dado que el propósito del ajuste "Jopara-3500" no está documentado, estos casos de uso son inferencias razonables a partir del tamaño y la naturaleza del modelo, no del objetivo declarado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 0,8B en FP16 requiere aproximadamente 1,6-2 GB de VRAM; en cuantizaciones de 4 bits (Q4_K_M en GGUF, por ejemplo) puede bajar a ~0,6-0,8 GB. Nota: el repositorio contiene el adaptador LoRA (~0,1 GB), por lo que para inferencia hay que cargar además el modelo base unsloth/Qwen3.5-0.8B.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es más que suficiente; no se requieren GPUs de centro de datos (A100, H100) ni para inferencia ni para reentrenar el adaptador.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso integradas con memoria compartida. También es viable la inferencia solo en CPU.
- Opciones de despliegue: transformers (librería nativa del repositorio), vLLM, llama.cpp y Ollama (previa conversión del adaptador y fusión con el base model a GGUF), TGI. Unsloth también permite inferencia directa del adaptador.
- Latencia y throughput estimados: no disponible; por su tamaño, se espera latencia de primer token baja y throughput alto incluso en hardware modesto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-0.8B-Jopara-3500-LoRA | ~0,8B (adaptador LoRA) | no disponible | Apache 2.0 | Fine-tune no documentado, sin benchmarks publicados |
| unsloth/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Apache 2.0 | Modelo base sobre el que se entrenó el adaptador |
| Qwen2.5-0.5B-Instruct | 0,49B | 32K (según ficha oficial de la serie) | Qwen Research / Apache 2.0 en variantes concretas | Alternativa compacta con documentación y benchmarks completos |
| Llama 3.2 1B Instruct | 1,24B | 128K | Llama 3.2 Community License | Competidor directo en la gama sub-2B, con restricciones de licencia |

Nota: la comparativa se basa en la categoría de tamaño (modelos de lenguaje general por debajo de 2B de parámetros). El modelo de esta ficha carece de datos de rendimiento publicados, por lo que no es posible comparar calidad de salida de forma fundamentada.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe el dataset, el objetivo del fine-tune, los hiperparámetros ni los resultados de evaluación, lo que impide evaluar su idoneidad para producción.
- Sesgos conocidos: no disponible; hereda los sesgos del modelo base Qwen3.5-0.8B y añade los que pueda introducir el dataset de ajuste, desconocido.
- Riesgo de alucinación: elevado como en cualquier modelo pequeño de lenguaje; agravado por la falta de información sobre el ajuste realizado.
- Limitaciones de idioma: la model card declara únicamente inglés; no hay garantías de rendimiento en castellano ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, distribución y modificación sin restricciones relevantes más allá de la atribución.
- Advertencia práctica: el repositorio contiene solo el adaptador LoRA; para inferencia es necesario descargar además el modelo base unsloth/Qwen3.5-0.8B y fusionar o cargar el adaptador correctamente.
- Sin trazabilidad comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha; no hay revisiones ni validación de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Capibara-LLM/Qwen3.5-0.8B-Jopara-3500-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
