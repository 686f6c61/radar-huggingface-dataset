# bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ6e-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-oQ6e-mtp es una cuantización mixta del modelo bambocher/MiMo-V2.6-Distill-Qwen-9B, un modelo de lenguaje de aproximadamente 9.653 millones de parámetros construido sobre la arquitectura Qwen (tag `qwen3_5`) y destilado, según su nombre, a partir de la familia MiMo V2.6. El autor de esta variante es bambocher, que la ha generado con la herramienta oQ (oMLX v0.7.3) aplicando cuantización de precisión mixta orientada a la inferencia en Apple Silicon mediante la librería MLX.

El interés de esta ficha radica en que no se trata de un modelo nuevo, sino de un artefacto de despliegue: un checkpoint cuantizado que reduce el peso en disco a 8,06 GiB manteniendo una media efectiva de 7,172 bits por peso, con capas selectivas en 8 bits y BF16. Incluye además una cabeza MTP (multi-token prediction) de 0,243B de parámetros y un módulo de visión de 0,456B, lo que lo convierte en un modelo multimodal con decodificación especulativa integrada.

La información pública disponible es muy limitada: la model card solo documenta el proceso de cuantización y el desglose de almacenamiento, sin detalles sobre entrenamiento, datos, licencia o idiomas. Esta ficha refleja esa escasez de forma explícita y marca como "no disponible" todo aquello que no puede verificarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, tag `qwen3_5`); incluye módulo de visión y cabeza MTP |
| Parámetros totales | 9.653.104.368 (9,653B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización mixta oQ: affine 6-bit grupo 64 (85,464% de los pesos), affine 8-bit grupo 64 (9,453%), BF16 (5,083%); media efectiva 7,172 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX), 8,7 GB de repositorio |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 7,499 GB / 6,984 GiB |
| Visión | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,243 GB / 0,226 GiB |
| Total | 9,653B | 8,654 GB / 8,060 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen (etiqueta `qwen3_5` en Hugging Face), con 9,653B parámetros totales distribuidos en un modelo de lenguaje de 8,954B, un codificador o proyector de visión de 0,456B y una cabeza de predicción multi-token (MTP) de 0,243B. La presencia de MTP sugiere que el modelo base fue entrenado con objetivos de predicción multi-token, lo que habilita decodificación especulativa nativa para acelerar la generación. El nombre indica que se trata de un modelo destilado de MiMo V2.6, aunque no se dispone de detalles sobre el profesor, el dataset de destilación ni el número de tokens utilizados.

Sobre el entrenamiento no hay información pública: se desconoce la composición del corpus, si hubo fases de RLHF o DPO, el número de tokens vistos ni la ventana de contexto nativa. La model card del checkpoint cuantizado se limita a documentar el proceso de cuantización con oQ (oMLX v0.7.3), que asigna 6 bits a la mayoría de las matrices (85,464% de los pesos), 8 bits a un subconjunto sensible (9,453%) y mantiene en BF16 el 5,083% restante, presumiblemente capas de normalización, embeddings o componentes críticos para la estabilidad numérica.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, heredadas del modelo base Qwen destilado.
- Procesamiento de imágenes: el checkpoint incluye un módulo de visión de 0,456B, por lo que se trata de un modelo multimodal (visión-lenguaje).
- Predicción multi-token (MTP): la cabeza dedicada permite decodificación especulativa y potencialmente mayor throughput en generación.
- Capacidades de código y matemáticas: no verificadas en la información disponible, aunque plausibles en un derivado de Qwen; no se confirma.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 8,06 GiB, por lo que encaja en Macs con 16 GB de memoria unificada o superior, permitiendo ejecutar un modelo multimodal de 9,6B en hardware de consumo sin GPU dedicada.
- Prototipado de asistentes multimodales: al incluir módulo de visión, puede emplearse para experimentar con pipelines de imagen + texto (descripción de imágenes, respuesta a preguntas visuales) en entornos de desarrollo sobre macOS.
- Evaluación de cuantización mixta: sirve como caso de estudio para comparar la calidad de oQ con otras estrategias (GGUF Q6_K, AWQ, etc.) midiendo la degradación frente al modelo base en tareas concretas.
- Generación acelerada con decodificación especulativa: la cabeza MTP permite implementar decodificación especulativa en MLX para reducir la latencia en aplicaciones interactivas de chat.
- Investigación sobre destilación: útil para estudiar cómo se comporta un modelo destilado de 9,6B frente a su profesor en tareas de razonamiento, siempre que se disponga del modelo base para comparar.
- Despliegue en estaciones de trabajo macOS para tareas de oficina: resumen de documentos, extracción de información de capturas o PDFs renderizados y redacción asistida, aprovechando el soporte de visión y el reducido footprint de memoria.
- Fine-tuning ligero sobre el checkpoint cuantizado: aunque la cuantización complica el ajuste, el formato MLX permite LoRA sobre las capas en BF16 y 8 bits en flujos experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 8,06 GiB de pesos en disco; en inferencia se necesita margen adicional para KV cache y activaciones, por lo que se recomienda un mínimo de 12-16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra) al ser un checkpoint MLX. Para GPUs NVIDIA no hay soporte nativo de MLX; sería necesario reconvertir el modelo.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: un Mac con 16 GB de memoria unificada puede alojarlo. En NVIDIA consumer (RTX 4090 con 24 GB) cabría en términos de memoria si se convirtiera el formato, pero no se distribuye en ese formato.
- Opciones de despliegue: MLX (mlx-lm) y oMLX, que son los entornos para los que está empaquetado. No se proporcionan pesos GGUF, por lo que llama.cpp, Ollama o vLLM no son utilizables directamente sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-oQ6e-mtp (este) | 9,653B | no disponible | MLX safetensors, ~7,17 bits/peso | no disponible | Multimodal con MTP, orientado a Apple Silicon |
| bambocher/MiMo-V2.6-Distill-Qwen-9B (base) | 9,653B (presumiblemente) | no disponible | safetensors sin cuantizar | no disponible | Modelo original del que deriva esta cuantización |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (versión estándar) | safetensors, GGUF, AWQ | Apache 2.0 (versión estándar) | Alternativa textual sin visión; ampliamente soportada |
| Qwen2.5-VL-7B-Instruct | ~8B | 32.768 tokens (versión estándar) | safetensors | Apache 2.0 (versión estándar) | Alternativa multimodal con licencia permisiva |

La comparación con Qwen2.5 se ofrece como referencia de categoría (modelos ~7-10B de la familia Qwen); los datos del modelo base MiMo y de esta cuantización más allá de lo indicado no están disponibles públicamente, por lo que la comparación de rendimiento no puede establecerse.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es un riesgo bloqueante para producción.
- Idiomas no declarados: no hay garantía de calidad en castellano ni en otros idiomas distintos del que usara el modelo base.
- Contexto desconocido: sin ventana de contexto documentada no se pueden diseñar aplicaciones que dependan de entradas largas.
- Cuantización con pérdida: el 85,464% de los pesos está a 6 bits, lo que puede degradar tareas sensibles (matemáticas, código, razonamiento profundo) frente al modelo base en BF16.
- Riesgo de alucinación: inherente a los modelos destilados de 9B; no se han publicado evaluaciones de fidelidad.
- Sesgos: no documentados; al desconocerse el corpus de entrenamiento no se pueden anticipar sesgos de género, idioma o dominio.
- Dependencia de ecosistema: al ser MLX, el modelo no es portable directamente a infraestructura NVIDIA o servidores Linux con GPU sin conversión y validación adicionales.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria de su calidad.
- Cabeza MTP: su correcto funcionamiento depende del soporte de decodificación especulativa en la librería MLX; sin esa integración, los 0,243B de la cabeza quedan como peso muerto.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ6e-mtp
- Modelo base: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
- Librería MLX: https://github.com/ml-explore/mlx
- Papers, blogs, repos o demos adicionales: no disponible
