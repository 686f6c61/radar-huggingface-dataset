# RoseG/MIP36

## Resumen

RoseG/MIP36 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-35B-A3B-Base, publicado por el usuario RoseG bajo el paraguas que la model card atribuye a "TRiADiC Intelligence Labs". Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35.951.822.704 parámetros totales, según los pesos en safetensors del repositorio, y una ventana de contexto que no se detalla en la información disponible. El pipeline declarado es generación de texto, aunque los tags del repositorio también incluyen image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base.

El modelo se distribuye con licencia Apache 2.0 y un tamaño de repositorio de 71,9 GB, lo que es coherente con pesos en precisión completa o media para un modelo de ~36 mil millones de parámetros. La librería declarada es transformers.js, lo que indica que el autor pretende facilitar su ejecución en entornos JavaScript/Node.js y en el navegador mediante ONNX o formatos compatibles, aunque no se especifican los artefactos de cuantización disponibles.

La relevancia de esta ficha es limitada pero concreta: se trata de un fine-tuning reciente (creado en agosto de 2026 y actualizado en noviembre de 2026) con muy poca tracción (47 descargas, 1 like) y una model card extremadamente escasa. El interés principal radica en evaluar si el ajuste SFT sobre Qwen3.5-35B-A3B-Base aporta alguna mejora medible, algo que no puede confirmarse con la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, según el tag `qwen3_5_moe`; detalles de capas y atención no disponibles |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | no disponible (el tag del modelo base, `35B-A3B`, sugiere ~3B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio no detalla artefactos GGUF, AWQ, GPTQ ni ONNX cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también declarado compatible con transformers.js) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), tal como indica el tag `qwen3_5_moe` y la nomenclatura del modelo base Qwen/Qwen3.5-35B-A3B-Base, donde "A3B" sugiere aproximadamente 3 mil millones de parámetros activos por token sobre un total de ~36 mil millones. No se dispone de información sobre el número de expertos, el mecanismo de enrutamiento, el tipo de atención (completa, lineal o híbrida) ni la longitud de contexto nativa del modelo base en la información proporcionada.

En cuanto al entrenamiento, la model card indica únicamente "FTK Alignment using SFT, no RL or DPO", es decir, un ajuste supervisado (SFT) sin refuerzo ni DPO. El dataset fue "creado con SFY Studio Pro", sin que se especifiquen número de tokens, composición, idiomas ni metodología de filtrado. No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de lo heredado del modelo base.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.5-35B-A3B-Base.
- Posible soporte multimodal image-text-to-text, según el tag del repositorio; no confirmado en la model card.
- Razonamiento y matemáticas: capacidad esperable por el tamaño y la familia del modelo base, pero sin datos de benchmarks que lo respalden.
- Generación de código: no documentada específicamente para este fine-tuning.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación comparativa de fine-tunings SFT: el modelo puede emplearse como punto de comparación frente al base Qwen3.5-35B-A3B-Base para medir el impacto del ajuste supervisado en tareas de alineamiento, dado que la model card declara SFT sin RL ni DPO.
- Experimentación en entornos JavaScript: al declarar `transformers.js`, es adecuado para prototipos de inferencia en Node.js o navegador mediante Transformers.js, siempre que se generen los artefactos ONNX correspondientes (no incluidos en la información disponible).
- Investigación sobre alineamiento: útil para estudiar cómo un dataset generado con "SFY Studio Pro" afecta al comportamiento conversacional del modelo base, comparando respuestas antes y después del ajuste.
- Generación de texto asistida en investigación: para tareas de redacción, resumen o reescritura en entornos controlados donde la licencia Apache 2.0 permite uso sin restricciones comerciales.
- Base para nuevos fine-tunings: al ser Apache 2.0 y derivar de Qwen3.5, puede servir como punto de partida para ajustes específicos de dominio, aunque la falta de benchmarks hace recomendable validar primero su calidad.
- Despliegue experimental en pipelines de generación de texto: con 35,9B parámetros totales y ~3B activos, es viable en GPUs de 80 GB (A100/H100) con cuantización, aunque no hay datos de latencia ni throughput publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (35,9B parámetros totales), en FP16 requeriría ~72 GB, en 8 bits ~36 GB y en 4 bits ~18-20 GB, sin contar overhead de contexto y KV cache.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16; GPUs de 24 GB (RTX 4090, RTX 3090) podrían ejecutarlo solo con cuantización agresiva (4 bits) y contexto limitado, aunque no hay confirmación del autor.
- ¿Cabe en consumer GPU? Potencialmente en RTX 4090/3090 con cuantización de 4 bits, pero no está verificado ni documentado.
- Opciones de despliegue: Transformers.js (declarado), y presumiblemente transformers/vLLM/llama.cpp si se generan los artefactos adecuados; no se documentan integraciones con Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RoseG/MIP36 | 35,9B (MoE) | no disponible | Apache 2.0 | Hugging Face, 47 descargas | Fine-tuning SFT de Qwen3.5-35B-A3B-Base |
| Qwen/Qwen3.5-35B-A3B-Base | ~35B (MoE, ~3B activos) | no disponible | Apache 2.0 (según base) | Hugging Face | Modelo base oficial; referencia directa |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de otros modelos comparables en la información proporcionada |

La comparación cuantitativa con otras alternativas no es posible con los datos disponibles, ya que no se han publicado benchmarks ni especificaciones detalladas del contexto.

## Limitaciones y advertencias

- Model card extremadamente escasa: no se documentan datos de entrenamiento, idiomas, contexto ni metodología de evaluación.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas, no puede acotarse su fiabilidad.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5, hereda los sesgos del modelo base y del dataset SFT, del cual no se ofrece información.
- Idiomas: no se declaran idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 y de los datos de entrenamiento (no documentados).
- Tracción mínima: 47 descargas y 1 like; no hay evidencia de validación por parte de la comunidad.
- Compatibilidad con transformers.js: declarada, pero no se confirma la existencia de artefactos ONNX/cuantizados en el repositorio.
- Para producción: la ausencia de benchmarks, de documentación de contexto y de datos de entrenamiento desaconseja su uso en entornos críticos sin una evaluación propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoseG/MIP36
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Sitio del autor declarado en la model card: https://triadai.agency
