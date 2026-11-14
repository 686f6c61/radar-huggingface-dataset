# bambocher/LFM3-1.7B-oQ2e

## Resumen

LFM3-1.7B-oQ2e es una cuantización mixta del modelo LFM3 de 1.700 millones de parámetros (1.728.801.536 pesos reales según los safetensors del repositorio), publicada por el usuario bambocher. El checkpoint se ha generado con la herramienta oQ de oMLX (versión 0.7.3), que aplica cuantización de precisión mixta sobre los pesos originales y produce un artefacto con un promedio efectivo de 3,002 bits por peso. El resultado ocupa 0,649 GB en disco, lo que lo hace apto para ejecución en memoria unificada de equipos Apple Silicon mediante la librería MLX.

El modelo base LFM3 pertenece a la familia de modelos pequeños de Liquid AI, aunque la model card del repositorio no documenta la arquitectura original ni los datos de entrenamiento. La información disponible se limita al proceso de cuantización: distribución de bits por tensor, formatos de almacenamiento y tamaño final. No se publican benchmarks, idiomas soportados, licencia ni pipeline de inferencia.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantización de un modelo de 1,7B orientado a ejecución local en hardware Apple, no de un modelo nuevo. Su interés práctico reside en la técnica de cuantización mixta (grupos de 64 y 128 con 2, 3 y 6 bits según la sensibilidad de cada tensor), que permite comprimir el checkpoint hasta aproximadamente 3 bits por peso manteniendo los tensores críticos en mayor precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; el artefacto es una cuantización MLX) |
| Parámetros totales | 1.728.801.536 (1,729B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta: affine 2-bit grupo 64, affine 3-bit grupo 128, affine 3-bit grupo 64, affine 6-bit grupo 64, BF16; media efectiva 3,002 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), librería `mlx`, `custom_code` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3 en la documentación proporcionada. El repositorio únicamente describe el proceso de cuantización: se aplicó oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta que asigna distintos esquemas de bits a distintos tensores según su sensibilidad. La distribución resultante es la siguiente: 0,667B parámetros en affine 2-bit con grupo 64 (38,576% del total, 2,50 bits/peso efectivos), 0,799B en affine 3-bit con grupo 128 (46,237%, 3,25 bits/peso), 0,262B en affine 3-bit con grupo 64 (15,163%, 3,50 bits/peso), una fracción residual de 0,002% en affine 6-bit grupo 64 y 0,022% en BF16.

El checkpoint completo almacena 0,604 GiB de pesos (0,649 GB), todos correspondientes al modelo de lenguaje; no se incluyen componentes adicionales como codificadores de visión o audio. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de lenguaje de 1,7B, aunque no se documenta explícitamente en la model card.
- Razonamiento y código: no disponible; no se han publicado evaluaciones ni descripciones de capacidades específicas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local en Apple Silicon: sí, gracias al formato MLX y al tamaño reducido del checkpoint (0,649 GB).

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 0,649 GB cabe holgadamente en cualquier equipo Apple Silicon con 8 GB o más de RAM unificada, lo que permite ejecutar un modelo de 1,7B sin GPU dedicada.
- Prototipado rápido de aplicaciones de texto en entornos de desarrollo sobre macOS: al usar MLX, se integra de forma nativa en el ecosistema de Apple para pruebas de concepto.
- Evaluación de técnicas de cuantización mixta: el repositorio sirve como referencia para estudiar cómo oQ distribuye bits entre tensores y qué impacto tiene en la calidad frente al modelo original.
- Despliegue en dispositivos con restricciones severas de almacenamiento: 0,649 GB es un tamaño manejable para aplicaciones embebidas o entornos con cuotas de disco ajustadas.
- Experimentación académica con modelos pequeños cuantizados: útil para comparar el rendimiento de un checkpoint de ~3 bits/peso frente a alternativas de 4 u 8 bits en tareas de generación de texto.
- Base para fine-tuning con LoRA en local: el tamaño reducido permite ajustar adaptadores de bajo rango en hardware de consumo, siempre que se disponga del modelo base y la licencia lo permita (no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,65 GB solo para los pesos; con overhead de ejecución (KV cache, buffers de MLX), se recomienda un mínimo de 2-4 GB de memoria unificada para contextos cortos.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4).
- Compatibilidad con GPU de consumo: no se documenta soporte para CUDA ni ROCm; el artefacto es específico de MLX.
- Opciones de despliegue: `mlx` (librería oficial), `mlx-lm` para generación; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ2e | 1,729B | no disponible | Mixta ~3 bits/peso | no disponible | safetensors (MLX) |
| LFM3-1.7B (base) | 1,729B | no disponible | BF16 (presumible) | no disponible | no disponible |
| Alternativas de ~1,7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma familia o categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La model card no especifica la licencia del modelo base ni del checkpoint cuantizado; no se puede confirmar el uso comercial sin consultar la licencia original de LFM3.
- No se documentan los idiomas soportados; el comportamiento multilingüe es desconocido.
- La cuantización a ~3 bits/peso puede degradar la calidad respecto al modelo en BF16, especialmente en tareas de razonamiento y generación de código; no se han publicado evaluaciones comparativas.
- El checkpoint tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-14), lo que sugiere que no ha sido validado por la comunidad.
- El uso de `custom_code` implica que la carga requiere confiar en código personalizado del repositorio; conviene revisarlo antes de ejecutarlo.
- El formato es exclusivo de MLX; no es portable a otros entornos de inferencia sin conversión.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones de contexto del modelo base.
- El tamaño del repo (0,7 GB) es coherente con los pesos, pero no se incluyen tokenizador ni configuración documentada en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ2e
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM3: no disponible en la información proporcionada
