# funnygeeker/Qwen3.8-27B-Uncensored-oQ4e-mtp

## Resumen

Qwen3.8-27B-Uncensored-oQ4e-mtp es una cuantización mixta de precisión del modelo Qwen3.8-27B (variante "uncensored"), publicada por el usuario funnygeeker en Hugging Face. El checkpoint conserva 27.781 millones de parámetros lógicos distribuidos en tres componentes: el modelo de lenguaje (26.896B), un codificador visual (0.461B) y una cabeza MTP (Multi-Token Prediction, 0.425B). La cuantización se ha realizado con oQ, la herramienta de cuantización mixta del proyecto oMLX (versión 0.7.3), y el resultado ocupa 15.879 GiB en disco con una media efectiva de 4.910 bits por peso.

El modelo está empaquetado en formato MLX (safetensors), lo que lo hace directamente ejecutable en Apple Silicon mediante la librería mlx. La etiqueta `qwen3_5` sugiere que la arquitectura base pertenece a la familia Qwen 3.5, aunque la model card no aporta detalles sobre el entrenamiento original, el contexto soportado ni los idiomas. El pipeline no está declarado y la licencia no aparece especificada en la información disponible, un punto crítico para cualquier uso comercial.

Su relevancia es doble: por un lado, demuestra el estado del arte de la cuantización mixta por capas con oQ, que asigna 4, 5, 6 bits o BF16 según la sensibilidad de cada tensor; por otro, ofrece una variante sin censura de un modelo de ~28B con capacidades multimodales y decodificación especulativa vía MTP, pensada para experimentación local en hardware Apple.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, tag `qwen3_5`); incluye codificador visual y cabeza MTP |
| Parámetros totales | 27.781.427.952 (27.781B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 4-bit grupo 64 (83,096 %), affine 5-bit grupo 64 (10,471 %), affine 6-bit grupo 64 (4,576 %), BF16 (1,857 %); media efectiva 4,910 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, cuantización oQ) |
| Tamaño del repositorio | 34,0 GB (checkpoint cuantizado: 15,879 GiB) |
| Fecha de publicación | 2026-10-14 (actualizado 2026-11-09) |
| Descargas | 242 |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo base. La arquitectura es un transformer de la familia Qwen 3.5, según el tag `qwen3_5`, con tres bloques diferenciados: un modelo de lenguaje de 26.896B parámetros lógicos, un codificador visual de 0.461B y una cabeza MTP de 0.425B. La presencia de esta última indica soporte de Multi-Token Prediction, una técnica de decodificación especulativa que predice varios tokens por paso para aumentar el throughput en inferencia.

El checkpoint no es un modelo entrenado desde cero, sino una cuantización del Qwen3.8-27B-Uncensored original. La herramienta oQ (oMLX v0.7.3) aplica precisión mixta por tensor: el 83,1 % de los pesos se almacena a 4 bits con grupo 64, un 10,5 % a 5 bits, un 4,6 % a 6 bits y un 1,9 % se mantiene en BF16 (0.516B parámetros, presumiblemente capas sensibles como embeddings o normas). El resultado reduce el peso lógico a 15,879 GiB manteniendo una media de 4,910 bits/peso. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen 3.5 de ~28B.
- Procesamiento de imágenes: el checkpoint incluye un codificador visual de 0.461B parámetros, por lo que el modelo es multimodal (visión-lenguaje).
- Decodificación especulativa mediante cabeza MTP, orientada a reducir la latencia de generación.
- Variante "uncensored": se espera menor rechazo a peticiones que los modelos alineados estándar, aunque no se documenta el método de desalineación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Modo thinking explícito: no disponible.

## Casos de uso

- Experimentación local en Apple Silicon: el formato MLX y los 15,879 GiB del checkpoint permiten ejecutar un modelo de ~28B en Macs con 32 GB o 64 GB de memoria unificada, algo inviable con el modelo en BF16 (~55 GB).
- Investigación sobre cuantización mixta: el checkpoint sirve para evaluar el impacto de la asignación de bits por capa (4/5/6/BF16) de oQ frente a cuantizaciones uniformes de 4 bits, comparando perplejidad y calidad de generación.
- Análisis de decodificación especulativa: la cabeza MTP permite medir la ganancia de throughput de la predicción multi-token en MLX frente a decodificación autoregresiva clásica.
- Prototipado de asistentes visuales: con el codificador de 0.461B integrado, se pueden construir demos de descripción de imágenes, OCR o VQA en local sin depender de APIs.
- Estudio de modelos sin censura: útil para investigadores que analizan diferencias de comportamiento (tasa de rechazo, sesgos, toxicidad) entre un modelo alineado y su variante "uncensored".
- Evaluación de robustez en producción: antes de adoptar una variante sin censura, se puede medir su tasa de alucinación y de contenido problemático en dominios sensibles con el checkpoint cuantizado, más barato de servir que el original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: ~15,9 GiB solo para los pesos; con overhead de runtime MLX y caché KV, se recomienda un mínimo de 24 GB y, para contextos largos, 32-64 GB.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra) por el formato MLX; no es ejecutable directamente en CUDA sin reconversión.
- GPU consumer: no aplica en el ecosistema NVIDIA; en Mac, un M4 Pro de 24 GB puede cargar el modelo, y un M4 Max de 64 GB o un Ultra dejan margen amplio para contexto y batch.
- Opciones de despliegue: `mlx-lm` / `mlx` (librería nativa), `mlx_lm.generate` y `mlx_lm.server` para servidor compatible con API; conversión a GGUF posible pero no documentada en la model card.
- Latencia y throughput: no disponibles; la cabeza MTP está pensada para mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-oQ4e-mtp | 27,781B | no disponible | MLX safetensors, 4,9 bits/peso | no disponible | Cuantización mixta oQ, visión + MTP |
| Qwen3.8-27B-Uncensored (base) | ~27,8B | no disponible | safetensors BF16 | no disponible | Referencia sin cuantizar; ~55 GB |
| Cuantización uniforme 4-bit del mismo base | ~27,8B | no disponible | GGUF/MLX | no disponible | Menor tamaño, mayor pérdida de calidad esperada |
| no disponible | — | — | — | — | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Licencia no especificada: sin licencia declarada no se puede asumir permiso de uso comercial; hay que contactar con el autor o consultar la licencia del modelo base Qwen 3.5.
- Variante "uncensored": es previsible una mayor probabilidad de generar contenido tóxico, sesgado o legalmente problemático; requiere filtros externos en cualquier despliegue público.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; la cuantización a 4-5 bits puede degradar ligeramente la precisión en tareas de razonamiento.
- Idiomas y contexto no documentados: no se puede planificar un despliegue multilingüe o de contexto largo sin verificación empírica.
- Solo MLX: el checkpoint no es directamente utilizable en vLLM, TGI o llama.cpp sin conversión previa.
- Repositorio de autor único con 0 likes y 242 descargas: sin garantías de mantenimiento, soporte ni reproducibilidad; la model card fue actualizada el 2026-11-09 con una recuantización, lo que indica inestabilidad del artefacto.
- Sin datos de entrenamiento ni de alineación: imposible auditar sesgos de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/funnygeeker/Qwen3.8-27B-Uncensored-oQ4e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
