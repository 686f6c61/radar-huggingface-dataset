# Charlie320/zils-mini-nj2

## Resumen

zils-mini-nj2 es un modelo de decisión de 4.539 millones de parámetros (4,54 B) publicado por el usuario Charlie320 en Hugging Face, construido como un fine-tune de Qwen/Qwen3.5-4B dentro del formato de "chassis" del ecosistema Zils, asociado al pool de modelos tipo soup de la subred 127 de Bittensor (d3-mini). El modelo se presenta como un "body" (cuerpo) para ese pool: un punto de partida obtenido por media uniforme de pesos de tres cuerpos anteriores (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b), sobre el que se aplican dos ejecuciones de LoRA de rango 64 que después se fusionan.

El problema que aborda es la producción de decisiones tipadas y respuestas en formato de examen dentro de un pipeline de entrenamiento distribuido: el autor entrena sobre aproximadamente 109.000 filas que combinan ítems de decisión en formato de examen (generados con la receta pública de autoría de Zils por Claude Opus y por un modelo abierto local, más respuestas del profesor de relay público de Zils) y 63.840 decisiones tipadas del split de entrenamiento de tasksource/tasksource-jev-typed-decisions, filtradas a filas con licencia de uso comercial.

Es relevante ahora por su carácter de pieza intermedia en un proceso de soup/merging abierto: no es un modelo de propósito general pulido, sino un componente reproducible (pesos BF16, licencia Apache-2.0, sin datos de validación ni de clientes) pensado para ser promediado y reentrenado dentro del ecosistema Zils. La información pública disponible es escasa: no hay pipeline declarado, ni idiomas listados, ni benchmarks, y el repositorio tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-4B en el layout "chassis" de Zils); incluye torre de visión heredada del modelo padre |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer de 4,54 B de parámetros, adaptado al layout "chassis" de Zils. El autor indica que los pesos de lenguaje están entrenados y que la torre de visión se hereda del modelo padre, por lo que el modelo conserva capacidad multimodal de entrada de imagen, aunque no se detalla la resolución ni el codificador visual. No se especifican la longitud de contexto nativa, el vocabulario ni detalles de atención más allá de lo que aporta el modelo base.

El entrenamiento es un fine-tune tipo soup en dos fases. Primero se calcula la media uniforme de pesos de los tres cuerpos del soup d3-mini del 14 de noviembre de 2026 (todos Apache-2.0), que actúa como punto de partida. Después se ejecutan dos LoRA de rango 64 con anchor 0,1, learning rate 5e-5, una época y semillas distintas sobre los datos de entrenamiento; cada LoRA se fusiona en el punto de partida y el cuerpo final es la media uniforme de ambas ejecuciones. Los datos suman unas 109.000 filas: ítems de decisión en formato de examen generados con scripts/author_exam.py por Claude Opus y por un modelo abierto local (solo splits públicos, más respuestas del profesor de relay público), y 63.840 decisiones tipadas de tasksource/tasksource-jev-typed-decisions restringidas a filas con license_use: commercial, texto mayoritariamente ASCII y un máximo de 200 filas por dataset de origen (413 fuentes). No se usaron ítems de examen de validador, ítems de examen semilla públicos ni datos de clientes. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto y razonamiento en el formato del modelo base Qwen3.5-4B, sin datos públicos que cuantifiquen su calidad.
- Emisión de decisiones tipadas y respuestas en formato de examen, que es el objetivo explícito del entrenamiento (decision-model).
- Entrada multimodal de imagen mediante la torre de visión heredada del modelo padre, aunque no se detalla su alcance.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (no se confirma ni se descarta).
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento se orienta a decisiones puntuales en formato de examen.
- Capacidades multilingües: no disponibles; los datos de entrenamiento se filtran a texto mayoritariamente ASCII, lo que sugiere un sesgo hacia inglés.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de modelos de decisión en pipelines de investigación: el modelo sirve como cuerpo candidato dentro del pool d3-mini de Zils, de modo que un investigador puede promediarlo con otros cuerpos y medir el efecto del soup sobre tareas de decisión tipada.
- Generación de ítems y respuestas en formato de examen: dado que se entrenó con la receta pública author_exam.py y respuestas del profesor de relay, puede emplearse para producir borradores de ítems de examen y respuestas etiquetadas en experiments de autoría, siempre revisando las licencias de las fuentes.
- Clasificación y etiquetado de decisiones tipadas: las 63.840 filas de tasksource-jev-typed-decisions permiten usarlo como clasificador de decisiones estructuradas sobre textos mayoritariamente ASCII, por ejemplo para etiquetar registros con categorías predefinidas.
- Prototipado de asistentes con entrada de imagen: la torre de visión heredada permite experimentar con preguntas sobre imágenes en un entorno de 4,54 B de parámetros, adecuado para pruebas en una sola GPU consumer.
- Base para fine-tunes posteriores: al ser un checkpoint BF16 Apache-2.0 con pesos completos, se puede partir de él para LoRA específicos de dominio sin reentrenar desde Qwen3.5-4B.
- Reproducción de experimentos de merging: el modelo documenta semillas, rango de LoRA, learning rate y composición del dataset, lo que facilita replicar el proceso de soup y comparar variantes.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 permite uso comercial del checkpoint, sujeta a las condiciones de las fuentes de datos citadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos; en 4 bits, alrededor de 2,3-3 GB, aunque no se publican pesos cuantizados en el repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 sin problemas de memoria; RTX 4080/4070 Ti (16 GB) para BF16 con contexto moderado.
- Cabe en GPU consumer: sí, en tarjetas de 16 GB o más en BF16; en 8-12 GB requiere cuantización, que el autor no proporciona.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se conviertan los pesos safetensors a los formatos correspondientes (el repositorio solo contiene safetensors BF16); al no declararse pipeline ni arquitectura exacta más allá del modelo base, la compatibilidad debe validarse empíricamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-nj2 | 4,54 B | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tune de decisión tipo soup, pesos BF16 |
| Qwen/Qwen3.5-4B | ~4 B (no confirmado en la información) | no disponible | no disponible en la información | Hugging Face | Modelo base del que parte zils-mini-nj2 |
| Zayaan/zils-mini-hm4 | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo integrante del soup de partida |
| qhoenix/zils-mini-decision-t2avg | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo integrante del soup de partida |
| joamCriff123/zils-mini-m1113b | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo integrante del soup de partida |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: el filtrado de datos a texto mayoritariamente ASCII y a 413 fuentes con licencia comercial puede introducir sesgo de dominio e idioma; no se documenta ninguna evaluación de sesgo.
- Riesgo de alucinación: es un modelo de 4,54 B fine-tuneado sobre datos sintéticos generados por Claude Opus y un modelo abierto local; no hay evaluaciones publicadas de fidelidad factual.
- Limitaciones de contexto e idioma: no se declara la longitud de contexto ni los idiomas soportados; el entrenamiento privilegia el inglés (texto mayoritariamente ASCII), por lo que el rendimiento en castellano no está garantizado.
- Restricciones de licencia: el checkpoint es Apache-2.0, pero cada fila de tasksource/tasksource-jev-typed-decisions conserva la licencia de su dataset de origen; el autor recomienda revisar los términos de las fuentes antes de reutilizar. El repositorio contiene solo pesos.
- Caveats para producción: no hay pipeline declarado, ni benchmarks, ni descargas, ni validación externa; el modelo se presenta como pieza intermedia de un pool de soup, no como un modelo listo para servicio. No se usaron ítems de examen de validador ni datos de clientes, lo que limita la evidencia de calidad en dominios reales.
- Al ser un promedio de pesos de tres cuerpos y dos LoRA, el comportamiento puede degradarse respecto a los modelos individuales en tareas fuera del formato de decisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-nj2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo del soup: https://huggingface.co/Zayaan/zils-mini-hm4
- Cuerpo del soup: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Cuerpo del soup: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
