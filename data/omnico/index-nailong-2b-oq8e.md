# Omnico/Index-Nailong-2B-oQ8e

## Resumen

Index-Nailong-2B-oQ8e es una cuantización mixta del modelo base Index-Nailong-2B, publicada por el usuario Omnico en HuggingFace. Se trata de un checkpoint de 2.213.241.664 parámetros (2,21 mil millones) que combina pesos en 8 bits afín con grupo de 64 y pesos en BF16, dando como resultado un peso efectivo medio de 9,625 bits por parámetro. El artefacto está empaquetado en formato MLX, la librería de Apple para ejecución de modelos en silicio de la compañía (M1/M2/M3/M4), y ocupa 2,7 GB en el repositorio.

El modelo base pertenece a la familia Qwen 3.5 según la etiqueta `qwen3_5` incluida en los metadatos, e incorpora un componente de visión de 0,331B parámetros junto al modelo de lenguaje de 1,882B. La cuantización se realizó con oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta del repositorio jundot/omlx. La model card indica que se actualizó el 2 de noviembre de 2026 y recomienda volver a descargar si se tenía una copia anterior.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantización para inferencia local en Mac, no de un modelo entrenado desde cero. No hay información publicada sobre el proceso de entrenamiento del modelo base, los datos utilizados, los benchmarks ni la licencia. Cualquier evaluación de capacidades debe hacerse contra el modelo original Index-Nailong-2B, cuyos detalles no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`; detalles no disponibles) |
| Parámetros totales | 2.213.241.664 (2,21B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: 8-bit afín grupo 64 (85,001% de pesos) + BF16 (14,999%); media efectiva 9,625 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repo de 2,7 GB; almacenamiento lógico 2,480 GiB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de la etiqueta `qwen3_5`, que sugiere una variante de la familia Qwen 3.5. El checkpoint contiene dos componentes diferenciados: un modelo de lenguaje de 1,882B parámetros lógicos (2,000 GB / 1,863 GiB de almacenamiento) y un módulo de visión de 0,331B parámetros (0,663 GB / 0,617 GiB), lo que confirma que el modelo base es multimodal. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras.

La innovación técnica documentada es exclusivamente la cuantización. oQ (oMLX v0.7.3) aplica precisión mixta: mantiene el 15% de los pesos en BF16 y cuantiza el 85% restante a 8 bits afín con grupo de 64. Esta estrategia preserva en mayor fidelidad las capas más sensibles (probablemente las del módulo de visión y algunas proyecciones del LM) mientras reduce el resto, logrando un peso efectivo de 9,625 bits por parámetro y un checkpoint de 2,480 GiB. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Index-Nailong-2B, no documentadas en esta ficha.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,331B parámetros, por lo que se espera soporte de entrada de imágenes, aunque no se detalla el tipo de tareas (VQA, OCR, captioning).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con silicio de Apple: el formato MLX y el tamaño de 2,7 GB permiten ejecutar el modelo en un Mac con 8-16 GB de memoria unificada, sin GPU dedicada, usando la librería `mlx` y el runtime de oMLX.
- Prototipado de aplicaciones multimodales en local: al incluir módulo de visión, sirve para experimentar con pipelines imagen-texto en entornos de desarrollo sin conexión a la nube.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre el modelo base en BF16 y esta versión de 9,625 bits/peso en tareas concretas del desarrollador.
- Despliegue en dispositivos con memoria limitada: el peso efectivo de 9,625 bits y los 2,480 GiB lo hacen viable en portátiles Apple de gama media para tareas de generación de texto de baja latencia.
- Investigación sobre cuantización de precisión mixta: el desglose detallado por componente (LM vs. visión) permite estudiar el impacto de mantener el 15% en BF16 frente a cuantizar todo a 8 bits.
- Base para fine-tuning ligero en MLX: al estar en safetensors y en formato MLX, puede servir como punto de partida para adaptaciones con LoRA en hardware Apple, siempre que la licencia del modelo base lo permita (no verificada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 2,480 GiB en disco; en inferencia se necesita espacio adicional para el grafo de activaciones y el contexto, por lo que se recomienda un mínimo de 8 GB de memoria unificada y 16 GB para contextos largos.
- GPU recomendadas: hardware Apple con silicio M1, M2, M3 o M4 (la librería `mlx` está diseñada para estos chips). No hay soporte documentado para GPU NVIDIA o AMD en este formato.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con 8 GB o más de memoria unificada; no aplica a GPU de consumo x86 convencionales por la dependencia de MLX.
- Opciones de despliegue: `mlx` (librería oficial de Apple), `mlx-lm` para modelos de lenguaje, y el runtime oMLX referenciado en la model card. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Index-Nailong-2B-oQ8e (este) | 2,21B (9,625 bits/peso) | no disponible | MLX safetensors | no disponible | HuggingFace (Omnico) |
| Modelo base Index-Nailong-2B | 2,21B (BF16 presumiblemente) | no disponible | no disponible | no disponible | no disponible en la información |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (modelos multimodales de ~2B en formato MLX). Se indica "no disponible".

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base Index-Nailong-2B antes de cualquier despliegue en producción.
- Artefacto de cuantización, no modelo original: la calidad final depende del modelo base, cuyos datos de entrenamiento, sesgos y limitaciones no están documentados en esta ficha.
- Idiomas no declarados: no hay información sobre cobertura lingüística; asumir multilingüismo sin verificar es arriesgado.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 2B parámetros; no hay evaluaciones publicadas que lo cuantifiquen.
- Contexto desconocido: la longitud máxima de contexto no está documentada, lo que impide planificar aplicaciones con ventanas largas.
- Dependencia de MLX: el checkpoint no es portable a otros runtimes sin conversión; no se garantiza compatibilidad con llama.cpp, vLLM ni TGI.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- Actualización reciente: la model card advierte de una re-cuantización el 2026-11-02; versiones anteriores pueden tener pesos distintos.

## Enlaces

- HuggingFace: https://huggingface.co/Omnico/Index-Nailong-2B-oQ8e
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Modelo base Index-Nailong-2B: no disponible en la información proporcionada
- Paper, blog o demo del modelo: no disponible
