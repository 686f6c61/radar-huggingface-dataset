# Hailay/VEXMLM-TIGQA

## Resumen

VEXMLM-TIGQA es un modelo de respuesta a preguntas extractiva (extractive question answering) en tigriña, desarrollado por Hailay Kidu Teklehaymanot, Gebregziabihier Yadeta y Wolfgang Nejdl. Se trata de un fine-tuning del modelo `Hailay/VEXMLM`, que a su vez es una extensión de XLM-R con un vocabulario ampliado con 30 000 tokens del alfabeto Ge'ez, alcanzando un total de 280 002 subwords. El modelo fue presentado en el taller LM4UC (Language Models for Underserved Communities) de IJCAI 2026, y su propósito principal es servir como referencia reproducible para la evaluación de técnicas de extensión de vocabulario en lenguas de bajos recursos.

El checkpoint se publica con fines de completitud y reproducibilidad, no como un sistema utilizable en producción. De hecho, el propio autor advierte que su rendimiento es muy bajo: Exact Match de 2,39 ± 0,82 y F1 de 9,76 ± 0,97 sobre el conjunto de test de TIGQA, que contiene solo 67 preguntas. Para uso práctico en QA extractivo en tigriña, el autor recomienda el modelo `Hailay/VEXMLM-TiQuAD`. La arquitectura es `XLMRobertaForQuestionAnswering`, con una ventana de contexto limitada a 256 tokens durante el fine-tuning, y el repositorio contiene cinco checkpoints independientes (semillas 42-46) para permitir una evaluación estadística robusta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `XLMRobertaForQuestionAnswering` (XLM-R con vocabulario extendido) |
| Parametros totales | no disponible (basado en XLM-R base, aproximadamente 278 M, pero sin confirmar) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite de XLM-R); fine-tuning con max_length=256 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tigriña (ti) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Hailay/VEXMLM`, un XLM-R cuyo SentencePiece original (250 002 subwords) fue ampliado con 30 000 tokens adicionales específicos para el alfabeto Ge'ez, resultando en un vocabulario de 280 002 subwords. Sobre esta base se realizó un fine-tuning supervisado para la tarea de QA extractivo utilizando el dataset TIGQA, exclusivamente en tigriña. El entrenamiento se llevó a cabo con una configuración única (hash `ce27cc194946`) y se repitió de forma independiente con cinco semillas distintas (42-46) para medir la varianza.

Los hiperparámetros del fine-tuning incluyen: longitud máxima de secuencia de 256 tokens, tamaño de lote de 32, 4 épocas, tasa de aprendizaje de 2e-5 con decaimiento lineal y 10 % de warmup, weight decay de 0,01, clipping de gradiente a 1,0, optimizador AdamW (β₁=0,9, β₂=0,999, ε=1e-8), precisión bf16 y entrenamiento completo de todos los parámetros. El hardware utilizado fue una NVIDIA A100-PCIE-40GB. Se garantiza la reproducibilidad bit a bit mediante `enable_full_determinism`, `CUBLAS_WORKSPACE_CONFIG=:4096:8` y `dataloader_num_workers=0`. No se realizó búsqueda de hiperparámetros; es un estudio de configuración única.

## Capacidades

- Respuesta a preguntas extractiva en tigriña: dado un contexto y una pregunta, devuelve el fragmento de texto que responde a la pregunta.
- Soporte de vocabulario extendido para el alfabeto Ge'ez, lo que mejora la tokenización de palabras en tigriña frente al XLM-R original.
- Capacidad de procesar secuencias de hasta 256 tokens en el fine-tuning (aunque la arquitectura base soporta 512).
- No dispone de generación de texto libre, tool calling, razonamiento multi-paso ni capacidades multimodales.
- El modelo base cubre amárico y tigriña, pero este checkpoint está fine-tuneado exclusivamente para tigriña.

## Casos de uso

- Investigación en NLP de bajos recursos: sirve como línea base para comparar técnicas de extensión de vocabulario y fine-tuning en lenguas etíopes, especialmente para evaluar la influencia de la tokenización Ge'ez en tareas de comprensión lectora.
- Reproducción de resultados académicos: permite verificar las métricas reportadas en el paper (EM 2,39 ± 0,82, F1 9,76 ± 0,97) y comparar con otros enfoques sobre el dataset TIGQA.
- Estudio de la varianza entre semillas: al disponer de cinco checkpoints independientes, se puede analizar la estabilidad del entrenamiento en conjuntos de datos muy pequeños (67 preguntas de test).
- Desarrollo de sistemas QA en tigriña: aunque este modelo no es apto para producción, puede servir como punto de partida para transferir técnicas a otros modelos más capaces (por ejemplo, VEXMLM-TiQuAD).
- Evaluación de la calidad de datasets: el bajo rendimiento puede utilizarse para diagnosticar problemas en TIGQA (tamaño reducido, ambigüedad de las preguntas, etc.).
- Docencia y divulgación: como ejemplo de fine-tuning de un modelo multilingüe para una lengua de bajos recursos, con código reproducible y métricas transparentes.

## Benchmarks y rendimiento

Los resultados provienen de la evaluación con cinco semillas (42-46) sobre el conjunto de test de TIGQA, que contiene 67 preguntas. Se reportan la media y la desviación estándar.

| Metrica | Score (media ± desviacion) |
|---|---|
| Exact Match | 2,39 ± 0,82 |
| F1 | 9,76 ± 0,97 |

Estos valores son extremadamente bajos, lo que el autor atribuye a la dificultad intrínseca del dataset (muy pequeño) y a la alta varianza. No se han publicado comparaciones con otros modelos QA en tigriña en la información disponible.

## Requisitos de hardware

- El repositorio contiene cinco checkpoints (uno por semilla), cada uno con un tamaño aproximado de 1,2 GB en bf16. Para inferencia solo es necesario cargar uno de ellos.
- VRAM estimada: al ser un modelo basado en XLM-R base (~278 M parámetros), la inferencia en bf16 requiere aproximadamente 1-2 GB de VRAM, más overhead de activaciones. Se puede ejecutar en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 2060, RTX 4090) o incluso CPU con suficiente RAM (el modelo cabe en ~2 GB de memoria).
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con `transformers` (pipeline de question-answering), vLLM, TGI o llama.cpp (si se convierte a GGUF, aunque no se proporciona).
- Latencia y throughput: no se han publicado mediciones; al ser un modelo pequeño, la inferencia en GPU es prácticamente instantánea (menos de 100 ms por ejemplo).

## Comparativa con modelos similares

No se dispone de datos públicos de otros modelos de QA extractivo en tigriña para establecer una comparativa cuantitativa. El propio autor recomienda `Hailay/VEXMLM-TiQuAD` como alternativa con mejor rendimiento para tigriña, pero no se proporcionan sus métricas en la información disponible. Tampoco se conocen modelos comerciales o de código abierto que cubran esta tarea y lengua de forma específica.

## Limitaciones y advertencias

- Rendimiento muy bajo: Exact Match de 2,39 y F1 de 9,76, lo que lo hace inutilizable en la práctica para QA real.
- El dataset TIGQA tiene solo 67 preguntas de test, lo que provoca una alta varianza en las métricas y dificulta la interpretación de los resultados.
- El modelo solo está entrenado para tigriña; no se ha evaluado en otros idiomas, ni siquiera en amárico, aunque la base VEXMLM los cubre.
- Los corpus de entrenamiento provienen mayoritariamente de dominios religiosos y de noticias, por lo que el modelo puede reflejar sesgos de esos dominios.
- No se realizó búsqueda de hiperparámetros; la configuración es única y las comparaciones con otras líneas base en el paper son de una sola semilla.
- La licencia Apache 2.0 permite uso comercial, pero dado el rendimiento, no se recomienda su uso en productos.
- El repositorio contiene cinco checkpoints; es necesario especificar el `subfolder` (seed-42 a seed-46) al cargar el modelo, lo que puede confundir a usuarios no familiarizados.

## Enlaces

- HuggingFace: https://huggingface.co/Hailay/VEXMLM-TIGQA
- Repositorio oficial (código y evaluación): https://github.com/hailaykidu/VEXMLM
- Modelo base VEXMLM: https://huggingface.co/Hailay/VEXMLM
- Modelo recomendado para QA en tigriña: https://huggingface.co/Hailay/VEXMLM-TiQuAD
- Paper (referencia): Teklehaymanot, H. K., Yadeta, G., & Nejdl, W. (2026). "Expanding the Lexicon of Ge'ez Based African Languages: A Comparative Study of Amharic and Tigrinya". En Proceedings of the Workshop on Language Models for Underserved Communities (LM4UC) at IJCAI 2026.
