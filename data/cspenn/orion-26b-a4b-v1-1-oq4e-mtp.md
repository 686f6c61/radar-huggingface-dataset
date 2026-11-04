# cspenn/Orion-26B-A4B-v1.1-oQ4e-mtp

## Resumen

Orion-26B-A4B-v1.1-oQ4e-mtp es una versión cuantizada del modelo Orion-26B-A4B-v1.1, publicada por el usuario cspenn en HuggingFace. Se trata de un checkpoint de 26.225.647.442 parámetros (26,2B) con arquitectura de tipo Gemma 4 (etiqueta `gemma4` en los metadatos), que incluye módulos de visión y una cabeza MTP (multi-token prediction), y que ha sido cuantizado en precisión mixta mediante la herramienta oQ de oMLX v0.7.3.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo, sino de una distribución cuantizada para el ecosistema MLX (Apple Silicon). El checkpoint reduce el peso lógico de 26,2B parámetros a unos 15,5 GiB de almacenamiento, con un promedio efectivo de 5,077 bits por peso, lo que lo hace desplegable en equipos con memoria unificada de 32 GB o superior. La mezcla de cuantización es heterogénea: el 91,9% de los pesos se almacena en 4 bits afín con grupo de 64, mientras que capas sensibles (3,8% en BF16 y 3,1% en 8 bits) se preservan en mayor precisión.

No se dispone de información sobre el desarrollador original del modelo base, la composición del dataset de entrenamiento, los idiomas soportados ni la licencia. Todos estos datos deben considerarse no disponibles a partir de la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con etiqueta `gemma4`, incluye módulo de visión y cabeza MTP |
| Parámetros totales | 26.225.647.442 (26,2B) |
| Parámetros activos | no disponible (no se confirma que sea MoE; el sufijo A4B sugiere ~4B activos, pero no está verificado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta oQ: 4-bit afín grupo 64 (91,9%), 5-bit (1,0%), 6-bit (0,2%), 8-bit (3,1%), BF16 (3,8%); promedio 5,077 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización afín con grupo de 64 |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base emplea una arquitectura de tipo Gemma 4, con un componente de lenguaje de 25,236B parámetros lógicos, un módulo de visión de 0,570B y una cabeza MTP (multi-token prediction) de 0,420B. La presencia de MTP es técnicamente relevante porque habilita decodificación especulativa nativa, lo que puede mejorar el throughput de generación al predecir varios tokens por paso. No obstante, no se dispone de detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora atención lineal o alguna variante híbrida.

Respecto al entrenamiento, no hay información sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias. La model card únicamente documenta el proceso de cuantización, no el entrenamiento del modelo base. La cuantización se realizó con oQ (oMLX v0.7.3), que asigna precisiones distintas por tensor según su sensibilidad, preservando en BF16 y 8 bits aproximadamente el 6,9% de los pesos lógicos.

## Capacidades

- Generación de texto y razonamiento general, asumiendo las capacidades del modelo base Orion-26B-A4B-v1.1 (no verificadas en la información disponible).
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,570B parámetros, lo que indica soporte de entrada de imágenes.
- Decodificación especulativa mediante cabeza MTP, que puede acelerar la inferencia en MLX.
- Tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está empaquetado en MLX y ocupa 15,5 GiB, por lo que puede ejecutarse en Macs con memoria unificada de 32 GB o más, permitiendo prototipado y desarrollo sin GPU dedicada.
- Procesamiento de documentos con imágenes: gracias al módulo de visión integrado, puede emplearse para tareas de extracción de información de capturas, diagramas o documentos escaneados, siempre que el modelo base lo soporte.
- Generación asistida con decodificación especulativa: la cabeza MTP permite experimentar con técnicas de aceleración de inferencia en entornos MLX, útil para investigación sobre throughput.
- Evaluación de cuantización mixta: el checkpoint sirve como caso de estudio para comparar la pérdida de calidad de oQ frente a cuantizaciones uniformes de 4 bits en modelos de ~26B.
- Desarrollo de asistentes conversacionales locales: si el modelo base soporta diálogo multi-turno, este checkpoint permite desplegar un asistente privado en hardware de consumo Apple.
- Investigación en eficiencia de memoria: la distribución heterogénea de bits (4/5/6/8/BF16) permite analizar el impacto de preservar capas sensibles en mayor precisión sobre benchmarks de razonamiento y visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~16,6 GB de almacenamiento en disco; en memoria, el modelo requiere aproximadamente 15,5 GiB para los pesos más overhead de activaciones y caché KV (no cuantificada en la información disponible).
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4 y superiores). No es directamente compatible con CUDA sin conversión.
- Cabe en GPU de consumo: sí, en equipos Apple con 32 GB de memoria unificada o más (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). En 24 GB podría ser ajustado y requerir gestión cuidadosa de la caché KV.
- Opciones de despliegue: MLX (mlx-lm), oMLX; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1.1-oQ4e-mtp | 26,2B | no disponible | oQ mixta (5,077 bits/peso) | no disponible | HuggingFace (MLX) |
| Modelo base Orion-26B-A4B-v1.1 | 26,2B (presumible) | no disponible | BF16 original | no disponible | no confirmado en la información |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. El sufijo A4B sugiere una arquitectura con ~4B parámetros activos, lo que lo situaría en la categoría de modelos MoE eficientes, pero este dato no está verificado.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor o consultar la licencia del modelo base antes de usarlo en producción.
- Modelo cuantizado: la cuantización mixta a 4 bits en el 91,9% de los pesos introduce degradación respecto al checkpoint original en BF16, especialmente en tareas de razonamiento matemático y código.
- Sin benchmarks publicados: no hay evidencia empírica del rendimiento de esta cuantización concreta frente al modelo base.
- Dependencia del ecosistema MLX: no es portable directamente a CUDA, ROCm ni CPU sin conversión, lo que limita su uso a hardware Apple.
- Idiomas no documentados: se desconoce la cobertura multilingüe real.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos: no documentados.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-04) en los metadatos: conviene verificar la integridad y procedencia del checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/cspenn/Orion-26B-A4B-v1.1-oQ4e-mtp
- oQ / oMLX (herramienta de cuantización): https://github.com/jundot/omlx
