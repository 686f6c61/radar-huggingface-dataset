# bambocher/LFM3-1.7B-oQ8e

## Resumen

LFM3-1.7B-oQ8e es una cuantización mixta de precisión del modelo LFM3 de 1.700 millones de parámetros, publicada por el usuario bambocher en Hugging Face. El checkpoint se ha generado con la herramienta oQ (oMLX v0.7.3), que aplica cuantización afín de 8 bits con grupos de 64 elementos al 99,978 % de los pesos lógicos, dejando un 0,022 % en BF16. El resultado es un peso efectivo medio de 8,502 bits por parámetro, con un tamaño de almacenamiento de 1,837 GB (1,711 GiB).

El modelo pertenece a la familia LFM3 (Liquid Foundation Model 3), desarrollada por Liquid AI, y está empaquetado en formato MLX, la librería de Apple para ejecución de redes neuronales en silicio de la compañía (chips M-series). Esto lo orienta a inferencia local en equipos macOS con Apple Silicon, no a despliegues en GPU NVIDIA. La ficha del repositorio no incluye información sobre arquitectura interna, datos de entrenamiento, idiomas o licencia del modelo base.

La relevancia de esta publicación es acotada: se trata de un artefacto de cuantización derivado, sin descargas ni interacciones en el momento de la consulta, y sin model card descriptiva del modelo original. Para evaluar el modelo conviene remitirse a la ficha oficial de LFM3-1.7B de Liquid AI, no disponible en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3, familia Liquid AI; detalles no especificados) |
| Parámetros totales | 1.728.801.536 (1,729B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Afín 8-bit con grupo de 64 (99,978 % de pesos); BF16 (0,022 %); media efectiva 8,502 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ; repo de 1,9 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base LFM3-1.7B en la documentación proporcionada. La model card del checkpoint cuantizado solo describe el proceso de cuantización: se aplicó cuantización afín de 8 bits con tamaño de grupo 64 a 1,728B de pesos lógicos, manteniendo 0,000B (redondeado) en BF16, con un total de 1,711 GiB de almacenamiento. La herramienta empleada es oQ, integrada en oMLX v0.7.3, que realiza cuantización de precisión mixta.

Tampoco se detallan los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) ni innovaciones técnicas del modelo original, como decodificación especulativa o atención lineal. Cualquier afirmación al respecto sería especulativa y no se incluye.

## Capacidades

- Generación de texto: capacidad esperable de un modelo de lenguaje de 1,7B, pero no verificada en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Inferencia local en macOS con Apple Silicon: el formato MLX y la cuantización de 8 bits permiten ejecutar el modelo en equipos con memoria unificada, aprovechando la aceleración de Metal. Adecuado para prototipos y pruebas offline en un Mac.
- Experimentación con cuantización oQ: útil para investigadores que quieran comparar la calidad de la cuantización mixta de oMLX frente a otras técnicas (GGUF Q8_0, AWQ, GPTQ) sobre el mismo modelo base.
- Asistentes de texto en local para tareas de baja criticidad: generación de borradores, resúmenes o reescritura en un entorno de escritorio, siempre que se valide la calidad empíricamente.
- Evaluación comparativa de checkpoints: servir como referencia de 8 bits para medir la degradación respecto al LFM3-1.7B original en tareas de lenguaje.
- Desarrollo de aplicaciones MLX: integración en proyectos Swift/Python que usen mlx-lm para ejecutar modelos en dispositivos Apple sin conexión a la nube.
- Fines educativos: estudio del proceso de cuantización afín con grupos y su impacto en el tamaño y la precisión del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 1,711 GiB en disco; en inferencia MLX se necesita espacio adicional para caché KV y activaciones, por lo que se recomienda al menos 4-6 GB de memoria unificada disponible (estimación, no dato del autor).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para GPU NVIDIA ni AMD en este formato.
- ¿Cabe en consumer GPU? En el sentido estricto de GPU dedicada, no aplica; en Apple Silicon cabe en equipos con 8 GB o más de memoria unificada, aunque el rendimiento dependerá del chip.
- Opciones de despliegue: mlx-lm (librería MLX), oMLX; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión previa a otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ8e (este) | 1,729B | no disponible | MLX safetensors 8-bit | no disponible | Hugging Face, 0 descargas |
| LFM3-1.7B (original) | 1,7B (aprox.) | no disponible | no disponible | no disponible | no disponible en la información |
| Alternativas de ~1,7B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de fichas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia de model card del modelo base: no se documentan arquitectura, datos de entrenamiento, idiomas ni licencia, lo que impide evaluar su idoneidad para producción.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe consultarse la ficha del LFM3-1.7B original de Liquid AI.
- Cuantización de 8 bits: aunque la degradación suele ser baja, no se han publicado evaluaciones que cuantifiquen la pérdida de calidad respecto al modelo en BF16.
- Formato MLX: limita el despliegue a Apple Silicon; no es portable a GPU NVIDIA/AMD sin reconversión.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los habituales de un modelo de 1,7B.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento.
- Fecha de creación futura (2026-11-14): el metadato puede ser erróneo o indicar una publicación programada; conviene verificarlo.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ8e
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Modelo base LFM3-1.7B (Liquid AI): no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible
