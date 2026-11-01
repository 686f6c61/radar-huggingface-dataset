# cxmplex/sn92-gen-g5f1

## Resumen

El modelo `cxmplex/sn92-gen-g5f1`, publicado por el usuario cxmplex bajo la denominación "REAX SN92 generalist entry", es un checkpoint de tipo generalista derivado de la familia Qwen 3.5, según indica la etiqueta `qwen3_5` del repositorio. Con 26.085.330.160 parámetros totales en formato safetensors y un tamaño de repositorio de 52,2 GB, se sitúa en la franja de modelos de ~26B, un rango intermedio que permite despliegues en hardware de gama alta pero no en GPUs de consumo convencionales.

La model card es extremadamente escueta: se limita a indicar que se trata de un "decision model for the REAX (SN92) generalist track", sin aportar información sobre arquitectura interna, datos de entrenamiento, benchmarks ni idiomas soportados. El repositorio tiene un volumen de descargas muy bajo (10) y ninguna interacción (0 likes), lo que sugiere un checkpoint experimental o de nicho, probablemente asociado a un proceso de evaluación o competición interna (la nomenclatura "SN92" y "g5f1" apunta a un identificador de ronda o generación).

Por tanto, esta ficha debe leerse con cautela: los datos estructurales (tamaño, formato, licencia) son verificables, pero las capacidades, el rendimiento y los detalles de entrenamiento no están documentados por el autor. La relevancia actual del modelo es limitada fuera de su contexto original de uso, aunque su licencia MIT y su base Qwen 3.5 lo hacen potencialmente interesante para experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `qwen3_5`; se infiere familia Qwen 3.5, sin confirmar) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información publicada por el autor sobre la arquitectura interna del modelo. La etiqueta `qwen3_5` sugiere que el checkpoint deriva de la familia Qwen 3.5, pero la model card no confirma si se trata de un fine-tuning, una destilación, un merge o un modelo entrenado desde cero sobre dicha arquitectura. Tampoco se especifica si emplea atención estándar, atención lineal, mezcla de expertos (MoE) u otro esquema; el recuento de 26.085.330.160 parámetros totales es el único dato estructural verificable.

Respecto al entrenamiento, no hay información sobre el número de tokens, la composición del corpus, la presencia de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones técnicas como decodificación especulativa o modos de razonamiento extendido. La única descripción funcional es "decision model", lo que podría implicar un ajuste orientado a tareas de decisión o clasificación, pero no se detalla el proceso ni los objetivos de entrenamiento. Cualquier afirmación adicional sería especulativa.

## Capacidades

- Generación de texto: no confirmada explícitamente, pero esperable en un modelo de 26B basado en Qwen 3.5.
- Razonamiento y toma de decisiones: la model card lo describe como "decision model", sin detallar el alcance.
- Código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Evaluación comparativa de checkpoints: el modelo puede utilizarse como punto de referencia en experimentos que comparen variantes de la familia Qwen 3.5, dado su tamaño de ~26B y su licencia MIT.
- Investigación sobre modelos de decisión: si el término "decision model" implica un ajuste para tareas de clasificación o selección, podría emplearse en entornos de investigación para estudiar el comportamiento de modelos generalistas en tareas de decisión, siempre validando previamente su rendimiento real.
- Fine-tuning posterior: al distribuirse en safetensors y con licencia MIT, es candidato para ajustes específicos de dominio en laboratorios con GPUs de gama alta (A100/H100), aunque la falta de documentación exige una evaluación previa.
- Despliegue en entornos controlados de prueba: con 26B parámetros, puede servirse en infraestructura con suficiente VRAM para experimentar con prompts y flujos internos, sin garantías de calidad en producción.
- Reproducción de experimentos de la comunidad: útil para quienes sigan la nomenclatura REAX/SN92 y necesiten el checkpoint exacto asociado a una ronda concreta.
- Estudio de licencias y distribución de pesos: como ejemplo de publicación de un modelo de 26B bajo MIT, sirve para analizar prácticas de liberación de checkpoints en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 60-80 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: ~26 GB de pesos, con overhead adicional; viable en una A100 40GB o H100.
- VRAM estimada en cuantización de 4 bits: ~13-15 GB de pesos, potencialmente viable en GPUs de consumo de 24 GB (RTX 3090/4090) con contexto limitado, aunque no hay confirmación de que existan GGUF publicados.
- GPUs recomendadas: A100 80GB, H100 80GB, o múltiples GPUs de 24-48 GB con paralelización.
- ¿Cabe en consumer GPU? En FP16 no; en 4 bits podría caber en RTX 4090/3090, sujeto a disponibilidad de cuantizaciones (no confirmadas).
- Opciones de despliegue: vLLM, TGI o transformers para safetensors; llama.cpp/Ollama solo si se generan cuantizaciones GGUF (no disponibles en el repo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cxmplex/sn92-gen-g5f1 | 26,1B | No disponible | MIT | Hugging Face (10 descargas) | Checkpoint experimental, documentación mínima |
| Qwen 2.5 32B (referencia de familia) | 32,5B | 128K (según versión) | Apache 2.0 (varía) | Amplia | Modelo base conocido, benchmarks publicados |
| Gemma 2 27B | 27B | 8K | Gemma License | Amplia | Tamaño comparable, documentación completa |
| Mistral Small 24B | 24B | 128K | Apache 2.0 | Amplia | Alternativa europea con benchmarks públicos |

La comparación es aproximada: no se dispone de datos de contexto ni de rendimiento del modelo evaluado, por lo que la tabla solo contrasta tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: no hay información sobre entrenamiento, datos, idiomas ni evaluación, lo que impide garantizar su comportamiento.
- Riesgo elevado de alucinación y comportamiento impredecible al no conocerse el proceso de alineamiento.
- Sesgos desconocidos: al no documentarse la composición del corpus, no pueden evaluarse sesgos de género, idioma o dominio.
- Contexto e idiomas no confirmados: no se puede asumir una ventana larga ni soporte multilingüe.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene verificar la procedencia de los datos de entrenamiento por posibles obligaciones heredadas de la base Qwen 3.5.
- Baja tracción comunitaria (10 descargas, 0 likes): no hay evidencia de validación por terceros.
- No apto para producción sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/cxmplex/sn92-gen-g5f1
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
