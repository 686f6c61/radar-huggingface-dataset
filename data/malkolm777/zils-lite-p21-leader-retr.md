# malkolm777/zils-lite-p21-leader-retr

## Resumen

zils-lite-p21-leader-retr es un modelo de decisión de la familia d3-lite, desarrollado por el usuario malkolm777 y derivado mediante un ajuste LoRA del modelo base joamCriff123/zils-lite-l1117a. Con 852.985.920 parámetros (aproximadamente 853 millones) y un repositorio de 1,7 GB, se posiciona como un modelo compacto orientado a tareas de decisión, con énfasis declarado en recuperación (retrieval) y uso de herramientas (tools) según la model card del autor.

El modelo se entrenó con un único pase de LoRA de rango 64 sobre 640 preguntas verificadas del conjunto P3, de las cuales 320 usaron objetivos de un profesor "mini" y 320 objetivos de un profesor "Ultra". El ajuste empleó una tasa de aprendizaje de 5e-05 y la semilla 2678, con un JSONL de entrenamiento cuyo hash SHA-256 queda documentado en la model card. La arquitectura se etiqueta como qwen3_5, lo que sugiere una base derivada de la familia Qwen 3.5, aunque no se detallan más especificaciones estructurales.

La relevancia de este modelo es limitada pero concreta: se trata de un artefacto de investigación con licencia Apache 2.0, cero descargas y cero likes en el momento de la ficha, orientado a experimentación con modelos de decisión ligeros y ajuste mediante LoRA sobre preguntas verificadas. No hay información pública sobre benchmarks, idiomas soportados ni pipeline de inferencia declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tags del repositorio); detalles estructurales no disponibles |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo parte de joamCriff123/zils-lite-l1117a y se ajusta mediante un único pase de LoRA de rango 64. La model card especifica que se usaron 640 preguntas verificadas del conjunto P3: 320 ejemplos con objetivos de un profesor "mini" y 320 con objetivos de un profesor "Ultra". El subconjunto verificado enfatiza recuperación y herramientas. La tasa de aprendizaje fue de 5e-05 y la semilla 2678; el hash SHA-256 del JSONL de entrenamiento es 45e638c12a84cae4a64f1ac3efdd3af94d17f75f157efe5b6fed0c83995f61c5.

La etiqueta qwen3_5 indica que la base pertenece a la familia Qwen 3.5, aunque no se documentan el número de tokens de entrenamiento del modelo base, la composición completa del dataset ni si hubo fases de RLHF o DPO. El repositorio incluye código personalizado (custom_code), lo que implica que la carga del modelo requiere confiar en la implementación del autor. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y toma de decisiones: el modelo está etiquetado como decision-model dentro de la familia d3-lite.
- Recuperación (retrieval): el subconjunto de entrenamiento verificado enfatiza explícitamente tareas de recuperación.
- Uso de herramientas (tools): el entrenamiento también prioriza el uso de herramientas, según la model card.
- Ajuste supervisado con objetivos de profesores: se emplearon objetivos de un profesor "mini" y un profesor "Ultra" en el entrenamiento.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no confirmado explícitamente más allá de la mención a "tools" en el entrenamiento.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Enrutamiento de consultas en pipelines de recuperación: el modelo puede emplearse para decidir qué fuente o herramienta consultar ante una pregunta, dado que su entrenamiento verificado enfatiza retrieval.
- Selección de herramientas en agentes ligeros: por su tamaño de 853 millones de parámetros, puede integrarse como componente de decisión en un sistema de agentes que decida qué función invocar antes de delegar en un modelo mayor.
- Clasificación y filtrado de preguntas verificadas: útil para experimentar con la selección de preguntas de alta calidad en conjuntos tipo P3 antes de pasarlas a un modelo de mayor tamaño.
- Investigación sobre destilación con profesores: sirve como caso de estudio de ajuste LoRA con objetivos de profesores mini y Ultra sobre un modelo base pequeño.
- Prototipado de modelos de decisión en local: con 1,7 GB de pesos en safetensors, es viable cargarlo en entornos de desarrollo con GPU de gama media para pruebas de concepto.
- Evaluación de técnicas de ajuste con LoRA de rango 64: el repositorio documenta hiperparámetros y hash del dataset, lo que facilita reproducir o comparar experimentos de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en precisión completa (fp32) serían necesarios aproximadamente 3,4 GB solo para pesos; en bf16/fp16, unos 1,7 GB; en cuantización de 8 bits, alrededor de 0,85 GB; en 4 bits, cerca de 0,43 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponible en la documentación del autor. Por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060 o superiores en bf16, y en GPUs de datacenter (A100, H100) sin problema.
- ¿Cabe en GPU consumer? Sí, por el tamaño de pesos indicado, aunque no hay confirmación oficial de compatibilidad.
- Opciones de despliegue: no disponible. El repositorio usa custom_code, por lo que la carga requiere la implementación del autor; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-p21-leader-retr | 852.985.920 | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| joamCriff123/zils-lite-l1117a (base) | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Alternativas de ~1B tipo Qwen 3.5 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión pequeño y ajustado con pocos ejemplos (640), la generalización fuera del dominio de entrenamiento es incierta.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el repositorio incluye un archivo NOTICE con atribuciones upstream que debe revisarse y respetarse.
- Código personalizado: el tag custom_code implica que la carga del modelo requiere ejecutar código del autor, lo que añade un riesgo de seguridad y de reproducibilidad.
- Madurez: cero descargas y cero likes en el momento de la ficha; no hay evidencia de uso en producción ni validación externa.
- Reproducibilidad: se documenta el hash del JSONL de entrenamiento, pero no se publican los datos ni los scripts completos.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-p21-leader-retr
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
