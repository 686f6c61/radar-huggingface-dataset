# cyanaut/LFM3-1.7B-oQ6e-fp16

## Resumen

LFM3-1.7B-oQ6e-fp16 es una cuantización mixta del modelo LFM3 de 1.700 millones de parámetros, publicada por el usuario cyanaut en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a formatos de precisión reducida (mayoritariamente 6 bits afines con grupo de 64, con una pequeña fracción en 8 bits y FP16) realizada con la herramienta oQ de oMLX v0.7.3. El resultado es un checkpoint de 1.729 millones de pesos lógicos almacenado en 1.348 GiB, con una media efectiva de 6,700 bits por peso.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantización orientado a MLX (el framework de Apple para silicio propio), no de un modelo fundacional con model card completa. La información disponible se limita a la distribución de bits y al desglose de almacenamiento; no hay datos sobre arquitectura interna, datos de entrenamiento, benchmarks ni licencia. Cualquier evaluación de capacidades debe remitirse al modelo base LFM3-1.7B original, del que este checkpoint deriva.

El interés práctico reside en que permite ejecutar un modelo de ~1,7B parámetros en equipos con memoria unificada de Apple con un coste de almacenamiento de aproximadamente 1,5 GB, manteniendo una precisión nominal superior a la de una cuantización uniforme de 4 bits. Es, por tanto, un artefacto de despliegue más que un objeto de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; la model card no describe la arquitectura) |
| Parámetros totales | 1.728.801.536 (1,729B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 6-bit grupo 64 (90,070% de los pesos), affine 8-bit grupo 64 (9,907%), FP16 (0,022%); media efectiva 6,700 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con `custom_code`, librería `mlx`; almacenamiento total 1,448 GB (1,348 GiB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3-1.7B en la documentación proporcionada. La model card de este checkpoint no describe si se trata de un transformer denso, un modelo híbrido o cualquier otra variante, ni detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO. Tampoco se indica la longitud de contexto nativa ni el tokenizador empleado.

La única información técnica verificable es el proceso de cuantización. Se aplicó oQ (oMLX v0.7.3), una técnica de cuantización de precisión mixta que asigna distintos anchos de bit a distintos tensores según su sensibilidad. El reparto resultante es marcadamente asimétrico: el 90,07% de los pesos lógicos (1,557B) se almacena en affine 6-bit con grupo de 64, lo que ocupa 1,178 GiB; el 9,907% (0,171B) se conserva en affine 8-bit con grupo de 64 (0,169 GiB); y un residual del 0,022% permanece en FP16 (0,001 GiB). Esta estratificación sugiere que la herramienta identificó un subconjunto reducido de tensores críticos que justificaban mayor precisión, aunque la model card no especifica qué componentes (embeddings, cabezas de atención, capas normalizadoras) recibieron cada tratamiento. El checkpoint fue re-cuantizado el 2026-11-03 con oMLX v0.7.3, y el autor advierte de que las copias anteriores deben descargarse de nuevo.

## Capacidades

- Generación de texto: capacidad heredada del modelo base LFM3-1.7B; no se documentan detalles específicos en esta model card.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon vía MLX: capacidad confirmada por la librería declarada (`mlx`) y el formato de pesos.

## Casos de uso

- Despliegue local en Mac con memoria unificada: el checkpoint ocupa 1,348 GiB, por lo que cabe holgadamente en equipos con 16 GB de RAM unificada. Se cargaría con MLX y permitiría inferencia offline sin conexión ni GPU dedicada.
- Prototipado rápido de aplicaciones de texto en entornos Apple: al ser un modelo de 1,7B con cuantización de 6,7 bits efectivos, sirve para validar pipelines de generación antes de escalar a modelos mayores, con tiempos de carga de unos pocos segundos desde disco.
- Evaluación comparativa de técnicas de cuantización: investigadores que estudien el impacto de la precisión mixta pueden usar este checkpoint como referencia frente a cuantizaciones uniformes de 4 u 8 bits del mismo modelo base, midiendo la degradación en tareas concretas.
- Generación de texto asistida en herramientas de escritorio: integrable en aplicaciones macOS nativas mediante MLX, con un consumo de memoria que deja margen para el resto del sistema.
- Filtrado y clasificación de texto a pequeña escala: para tareas de etiquetado o resumen de documentos cortos donde no se requiera contexto largo ni razonamiento complejo, siempre que el modelo base las soporte.
- Base para ajuste fino ligero (LoRA) en Apple Silicon: al estar en formato MLX y con un tamaño contenido, puede servir como punto de partida para adaptaciones de dominio, aunque la viabilidad depende de que la herramienta de entrenamiento soporte el esquema de cuantización mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, ni comparaciones con el modelo sin cuantizar. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,35 GiB solo para los pesos; con overhead de activaciones y caché KV, un uso realista de 2-3 GB en memoria unificada para contextos moderados.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips de Apple (series M1, M2, M3, M4 y superiores) con memoria unificada. No es directamente compatible con CUDA sin conversión previa.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con 8 GB o más de memoria unificada; también cabría en GPUs NVIDIA de consumo tras reconvertir los pesos a otro formato, pero esa ruta no está documentada.
- Opciones de despliegue: MLX (librería declarada) y, presumiblemente, `mlx-lm` para generación. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el tag `custom_code` sugiere que la carga requiere código específico de oMLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ6e-fp16 (este) | 1,729B | no disponible | Mixta 6,7 bits efectivos | no disponible | HuggingFace, formato MLX |
| LFM3-1.7B (base) | ~1,7B | no disponible | FP16/BF16 original | no disponible | No verificada en esta búsqueda |
| Cuantización uniforme 4-bit del mismo base | ~1,7B | no disponible | 4 bits | no disponible | No verificada en esta búsqueda |
| Cuantización uniforme 8-bit del mismo base | ~1,7B | no disponible | 8 bits | no disponible | No verificada en esta búsqueda |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría. La comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial está permitido. Antes de cualquier despliegue en producción debe verificarse la licencia del modelo base LFM3-1.7B original.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de seguridad; se heredan los riesgos del modelo base, que no están documentados aquí.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; sin benchmarks ni evaluaciones publicadas no puede cuantificarse.
- La cuantización mixta introduce una degradación de precisión no medida. El autor no publica comparaciones con el checkpoint FP16 original, por lo que se desconoce la pérdida real en tareas downstream.
- El formato es específico de MLX y requiere `custom_code`; no es portable a otros runtimes sin conversión manual, lo que limita su uso fuera del ecosistema Apple.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-03). Es un artefacto sin validación comunitaria.
- El autor advierte de que versiones anteriores a la re-cuantización con oMLX v0.7.3 deben descargarse de nuevo; conviene verificar el hash de los pesos.
- No se documentan idiomas soportados, longitud de contexto ni capacidades de tool calling, por lo que no debe asumirse ninguna de ellas sin probar el modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/cyanaut/LFM3-1.7B-oQ6e-fp16
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
