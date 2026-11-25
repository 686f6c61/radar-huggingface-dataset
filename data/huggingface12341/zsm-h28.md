# huggingface12341/zsm-h28

## Resumen

zsm-h28 es un modelo publicado en Hugging Face por el usuario huggingface12341 bajo licencia Apache 2.0. Se trata de un modelo derivado (merge) de tres modelos base: malkolm777/zils-mini-m24-teacher-mlp, joamCriff123/zils-mini-m1124a y PhillyLabs/philly-decider-v2. La arquitectura declarada en los metadatos es qwen3_5, con 4.539.265.536 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de los 4.500 millones de parámetros.

El modelo está etiquetado con el pipeline de feature-extraction y con la etiqueta decision-model, además de las etiquetas zils y d3-mini que remiten a los modelos base. Su propósito declarado, a partir de las etiquetas, es la extracción de características y la toma de decisiones, no la generación de texto conversacional. El repositorio tiene un tamaño de 9,1 GB, coherente con pesos en precisión de 16 bits para 4.500 millones de parámetros.

Es relevante ahora porque ejemplifica una práctica creciente en el ecosistema open source: la fusión de modelos pequeños especializados para construir artefactos con capacidades combinadas. No obstante, la información pública disponible es muy limitada, el modelo acumula cero descargas y cero likes, y el acceso está restringido (gated), lo que exige aceptar condiciones en Hugging Face antes de poder descargarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según metadatos; detalles no disponibles) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los metadatos indican la etiqueta de arquitectura qwen3_5, lo que sugiere una familia de transformer decoder-only, pero no se publica ningún detalle sobre número de capas, dimensión oculta, mecanismo de atención ni configuración de cabezas. El modelo es un merge de tres artefactos previos: malkolm777/zils-mini-m24-teacher-mlp, joamCriff123/zils-mini-m1124a y PhillyLabs/philly-decider-v2. No se especifica la técnica de fusión empleada (por ejemplo, SLERP, TIES, DARE o model stock), ni los hiperparámetros del merge.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de ajuste supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. El repositorio incluye custom_code, lo que implica que la carga del modelo requiere confiar en código remoto y que la implementación exacta de la arquitectura no está cubierta únicamente por transformers estándar.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado, orientado a generar representaciones vectoriales de entradas de texto.
- Toma de decisiones (decision-model): la etiqueta sugiere uso como clasificador o selector en pipelines de decisión, aunque no se documenta el formato de entrada ni de salida.
- Generación de texto: no disponible; no se declara capacidad generativa pese a la arquitectura tipo decoder.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: el modelo puede emplearse como encoder de características para indexar documentos y recuperarlos por similitud vectorial, dado su pipeline declarado de feature-extraction.
- Clasificación y enrutamiento de consultas: con la etiqueta decision-model, encaja en un pipeline que reciba una entrada y seleccione una categoría o acción, por ejemplo para dirigir tickets a un departamento concreto.
- Filtrado previo en pipelines RAG: usar sus representaciones para descartar fragmentos irrelevantes antes de pasarlos a un modelo generativo mayor, reduciendo coste de inferencia.
- Detección de duplicados y near-duplicates: comparar embeddings de pares de textos para agrupar contenido casi idéntico en un corpus.
- Investigación sobre fusión de modelos: sirve como caso de estudio para analizar cómo se comporta un merge de tres checkpoints pequeños en tareas de representación, comparándolo con sus modelos base.
- Componente de un sistema de decisión multi-etapa: integrarlo como módulo intermedio que puntúe opciones y deje la generación final a otro modelo, aprovechando su tamaño de 4.500 millones de parámetros para despliegue en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los 4.539 millones de parámetros ocupan aproximadamente 9,1 GB de pesos, por lo que se necesitan en torno a 10-12 GB de VRAM contando activaciones y caché. En int8 bajaría a unos 4,5-5 GB y en int4 a unos 2,5-3 GB, aunque no se confirman cuantizaciones publicadas.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en fp16 con margen; una RTX 4090 (24 GB) permite fp16 sin problema.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 4080 y, en cuantización de 4 bits, en tarjetas de 8 GB como la RTX 3070.
- Opciones de despliegue: transformers con custom_code habilitado y confianza remota; vLLM, TGI o llama.cpp solo si se generan conversiones compatibles, no confirmadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zsm-h28 | 4.539 M | no disponible | Apache 2.0 | Merge de tres modelos, acceso gated, sin benchmarks |
| Qwen2.5-3B / Qwen3 pequeños | ~3.000 M | 32K en Qwen2.5 | Apache 2.0 | Familia de referencia de la arquitectura declarada; contexto y benchmarks públicos |
| Phi-3-mini | 3.800 M | 4K-128K según variante | MIT | Modelo pequeño con benchmarks publicados y amplia adopción |
| Llama 3.2 3B | 3.200 M | 128K | Llama 3.2 Community License | Restricciones de uso comercial y benchmarks publicados |

La comparación con alternativas consolidadas es desfavorable en términos de trazabilidad: zsm-h28 no publica contexto, idiomas ni resultados, y su acceso está restringido, mientras que los modelos citados ofrecen documentación completa y pesos abiertos.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card con detalles de entrenamiento, datos, evaluación ni uso previsto.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede bloquear automatizaciones y despliegues.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por terceros.
- Riesgo de alucinación: no evaluado; al ser un merge sin benchmarks, se desconoce su fiabilidad.
- Idiomas no declarados: no se puede garantizar calidad en castellano ni en ningún otro idioma.
- custom_code: requiere ejecutar código remoto del repositorio, con el riesgo de seguridad asociado.
- Licencia Apache 2.0 declarada, pero la procedencia de los tres modelos base debe verificarse por si imponen restricciones adicionales.
- No apto para producción sin una evaluación propia previa en la tarea objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface12341/zsm-h28
- Modelo base: https://huggingface.co/malkolm777/zils-mini-m24-teacher-mlp
- Modelo base: https://huggingface.co/joamCriff123/zils-mini-m1124a
- Modelo base: https://huggingface.co/PhillyLabs/philly-decider-v2
