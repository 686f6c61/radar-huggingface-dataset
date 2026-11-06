# jk797/LFM3-1.7B-MLX-oQ6e

## Resumen

LFM3-1.7B-MLX-oQ6e es una cuantización mixta del modelo LFM3 de 1.7B parámetros, publicada por el usuario jk797 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado del LFM3 original, convertido al formato MLX y cuantizado con la herramienta oQ (oMLX v0.7.4.dev1) para su uso eficiente en hardware Apple Silicon. El modelo base LFM3 está desarrollado por Liquid AI, aunque la model card de esta publicación no lo confirma explícitamente.

El checkpoint contiene 1.728.801.536 parámetros lógicos distribuidos en 1.348 GiB de almacenamiento, con una media efectiva de 6.700 bits por peso. La mayor parte de los pesos (90,07%) se almacenan en cuantización afín de 6 bits con grupo de 64, mientras que un 9,907% se mantiene en 8 bits y un residual mínimo (0,022%) en BF16. Esta distribución mixta busca preservar la calidad en capas sensibles sin disparar el tamaño del fichero.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de 1.7B parámetros en Macs con memoria unificada modesta, ocupando solo 1.5 GB en disco. Sin embargo, la información pública es muy limitada: no hay datos sobre el modelo base, licencia, idiomas, benchmarks ni pipeline. Cualquier evaluación rigurosa requiere consultar la ficha del LFM3 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del LFM3 base; detalles no disponibles) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: afín 6-bit grupo 64 (90,07%), afín 8-bit grupo 64 (9,907%), BF16 (0,022%); media efectiva 6.700 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |
| Biblioteca | mlx |
| Tamano del repo | 1.5 GB (1.448 GB de pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base LFM3 en la documentación proporcionada. Por el nombre y el ecosistema (Liquid AI), cabe esperar una arquitectura transformer, pero no se confirma ni el tipo exacto (denso o MoE), ni la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la longitud de contexto nativa.

La única información técnica concreta es la relativa al proceso de cuantización. Se aplicó oQ (oMLX v0.7.4.dev1), una herramienta de cuantización de precisión mixta que asigna distintos anchos de bit según la sensibilidad de cada tensor. El resultado es un checkpoint MLX con 1.557B parámetros en 6 bits (grupo 64), 0.171B en 8 bits (grupo 64) y un remanente ínfimo en BF16. No hay datos sobre decodificación especulativa, atención lineal ni otras innovaciones del modelo base.

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de lenguaje, aunque no se documenta explícitamente.
- Razonamiento y matemáticas: no disponible en la información proporcionada.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución en Apple Silicon: capacidad confirmada por el formato MLX y la librería declarada.

## Casos de uso

- Prototipado local en Mac: el checkpoint ocupa 1.5 GB y está en formato MLX, por lo que puede cargarse en un Mac con memoria unificada de 8 GB o más para experimentar con generación de texto sin depender de la nube.
- Evaluación de cuantización: sirve para comparar la calidad de una cuantización mixta de 6.7 bits efectivos frente al modelo LFM3 original en tareas de generación, midiendo la degradación introducida por oQ.
- Aplicaciones de escritorio offline: al caber en memoria de un portátil Apple, permite integrar generación de texto en herramientas locales (editores, asistentes de terminal) sin conexión.
- Filtrado y clasificación de texto a pequeña escala: un modelo de 1.7B puede usarse para tareas de etiquetado, resumen corto o reescritura en pipelines por lotes ejecutados en local.
- Educación e investigación: útil para estudiar el impacto de la cuantización mixta en modelos pequeños y reproducir experimentos con oQ/oMLX.
- Base para fine-tuning ligero: al ser un checkpoint MLX de pequeño tamaño, puede servir de punto de partida para ajustes con LoRA en hardware Apple, siempre que la licencia del modelo base lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~1.5 GB solo para pesos; con overhead de ejecución (KV cache, activaciones) se recomienda al menos 4-6 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) por el formato MLX; no aplica a GPU NVIDIA/AMD sin conversión previa.
- Cabe en GPU de consumo: sí, en cualquier Mac con 8 GB o más de memoria unificada.
- Opciones de despliegue: MLX (librería nativa), mlx-lm para generación; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-oQ6e | 1.729B | no disponible | safetensors MLX | no disponible | Cuantización mixta 6.7 bits efectivos, 1.5 GB |
| LFM3-1.7B (original) | ~1.7B | no disponible | no disponible | no disponible | Modelo base sin cuantizar; referencia de calidad |
| Otras cuantizaciones MLX de modelos ~1.7B | ~1.7B | variable | safetensors MLX | según modelo base | Alternativas como Q4/Q8 estándar de la comunidad MLX |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantización mixta de 6.7 bits efectivos puede introducir degradación de calidad respecto al modelo original, especialmente en tareas de razonamiento o código.
- No se documentan sesgos conocidos, pero al no haber información sobre el dataset de entrenamiento del modelo base, no pueden descartarse.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks ni model card detallada no puede acotarse su magnitud.
- Licencia no disponible: no puede confirmarse el uso comercial. Es imprescindible consultar la licencia del LFM3 original antes de desplegar en producción.
- Idiomas no documentados: no se garantiza soporte de castellano ni de otros idiomas.
- Contexto no documentado: no puede planificarse su uso en conversaciones multi-turno largas sin verificar la ventana del modelo base.
- Publicación de terceros: el checkpoint lo ha generado el usuario jk797, no Liquid AI; no hay garantía de mantenimiento ni soporte.
- Dependencia del ecosistema MLX: no es portable directamente a GPU NVIDIA sin conversión.

## Enlaces

- Hugging Face: https://huggingface.co/jk797/LFM3-1.7B-MLX-oQ6e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM3 (Liquid AI): no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
