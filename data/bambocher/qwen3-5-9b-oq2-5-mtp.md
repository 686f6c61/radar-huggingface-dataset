# bambocher/Qwen3.5-9B-oQ2.5-mtp

## Resumen

Qwen3.5-9B-oQ2.5-mtp es una cuantización de precisión mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales de Qwen (Alibaba) a un formato optimizado para MLX, el framework de Apple para inferencia en silicio de la compañía. El checkpoint combina capas en 2, 3, 4, 5 y 16 bits (BF16) según la sensibilidad de cada tensor, con un promedio efectivo de 4,080 bits por peso y un almacenamiento total de 4,585 GiB.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (8.954B parámetros lógicos), un codificador visual (0,456B) y una cabeza MTP (Multi-Token Prediction, 0,243B) de 0,243B parámetros. Esta última permite decodificación especulativa nativa, lo que acelera la generación al predecir varios tokens por paso. El total de parámetros lógicos asciende a 9.653.104.368, según los safetensors del repositorio.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de ~9,7B parámetros con capacidades de visión y predicción multi-token en hardware Apple Silicon con un consumo de memoria moderado (alrededor de 5 GB de pesos), algo imposible con el checkpoint original en BF16. Es, por tanto, una opción práctica para desarrollo local en Mac, aunque con las limitaciones propias de una cuantización agresiva y de un autor independiente sin garantías de soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con cabeza MTP y codificador visual |
| Parametros totales | 9.653.104.368 (9,653B lógicos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Precisión mixta: affine 2-bit (group 64), 3-bit (group 128 y 64), 4-bit (group 64), 5-bit (group 64) y BF16; promedio 4,080 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), repositorio de 9,7 GB |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del Qwen3.5-9B original, no un modelo reentrenado. La arquitectura subyacente es un transformer de la familia Qwen3.5 con tres bloques: el modelo de lenguaje (8.954B parámetros lógicos), un módulo de visión (0,456B) que habilita entrada de imágenes, y una cabeza MTP (0,243B) que implementa predicción multi-token para decodificación especulativa. La distribución de bits no es uniforme: el 26,99% de los pesos lógicos se almacena en 2 bits (grupo 64), el 40,51% en 3 bits (grupo 128), el 10,54% en 3 bits (grupo 64), el 2,17% en 4 bits, el 14,71% en 5 bits y el 5,08% en BF16, lo que sugiere que el autor preservó en mayor precisión las capas más sensibles (probablemente embeddings, normas y proyecciones críticas).

La herramienta empleada es oQ (oMLX v0.7.3), un pipeline de cuantización de precisión mixta del proyecto jundot/omlx. No se dispone de información sobre los datos de entrenamiento originales de Qwen3.5-9B, el número de tokens, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se recogen en la model card de esta conversión. La innovación técnica destacable es la conservación de la cabeza MTP en el checkpoint cuantizado, lo que permite aprovechar la decodificación especulativa incluso en el formato comprimido.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque degradadas por la cuantización agresiva en algunas capas.
- Procesamiento de visión: el checkpoint incluye un módulo visual de 0,456B parámetros, por lo que acepta imágenes como entrada (multimodalidad imagen-texto).
- Predicción multi-token (MTP): la cabeza dedicada permite decodificación especulativa, generando varios tokens candidatos por paso de inferencia.
- Ejecución nativa en MLX: optimizado para Apple Silicon (M1/M2/M3/M4), con soporte de cuantización affine por grupos.
- Tool calling y function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles; dependen del modelo base y no se documentan aquí.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac: el checkpoint ocupa 4,585 GiB de pesos, por lo que puede cargarse en un Mac con 16 GB de memoria unificada, dejando espacio para el contexto y el codificador visual. Adecuado para prototipado sin GPU dedicada.
- Asistente multimodal de escritorio: al incluir módulo de visión, permite describir capturas de pantalla, diagramas o imágenes locales dentro de una aplicación macOS construida sobre MLX.
- Generación de texto acelerada por MTP: en tareas de completado largo (redacción, resumen), la cabeza de predicción multi-token reduce el número de pasos de decodificación y mejora el throughput en comparación con una decodificación autoregresiva estándar.
- Evaluación de cuantizaciones: útil como referencia para investigadores que comparan la calidad de precisión mixta (2/3/4/5 bits) frente al modelo original en BF16 en tareas concretas.
- Procesamiento por lotes en dispositivos de gama alta: con un Mac Studio o MacBook Pro de 32 GB o más, se pueden mantener varias instancias o contextos largos en memoria.
- Docencia y experimentación: al ser un checkpoint pequeño y de descarga rápida (9,7 GB de repo), sirve para demostrar técnicas de cuantización y decodificación especulativa en cursos de IA.
- Integración en pipelines de CI para Mac: permite ejecutar pruebas de regresión de calidad de modelo en runners macOS sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 4,585 GiB (4,923 GB). Con overhead de contexto, caché KV y el codificador visual, se recomienda un mínimo de 8 GB de memoria unificada; 16 GB es cómodo para contextos moderados.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro/Max/Ultra), dado que el formato es MLX. No es compatible de forma nativa con CUDA.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con 16 GB o más de memoria unificada. No está pensado para GPUs NVIDIA/AMD de consumo.
- Opciones de despliegue: MLX (librería `mlx` y `mlx-lm`), con el runtime de oMLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es específico de MLX.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere una mejora en velocidad de decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ2.5-mtp (este) | 9,653B | No disponible | Mixta 2-5 bits + BF16 (4,080 bits/peso) | No disponible | Hugging Face, MLX |
| Qwen3.5-9B (original) | ~9,7B | No disponible | BF16 | No disponible | Hugging Face |
| Otras cuantizaciones MLX de Qwen3.5-9B | ~9,7B | No disponible | Típicamente 4-bit uniforme | No disponible | Hugging Face |
| Modelos multimodales pequeños en MLX (p. ej., variantes de Qwen2-VL) | 2B-7B | Variable | 4-bit u 8-bit | Variable | Hugging Face |

La comparativa cuantitativa de rendimiento no está disponible; no se han publicado métricas que permitan situar esta cuantización frente a alternativas en MMLU, HumanEval o GSM8K.

## Limitaciones y advertencias

- Cuantización agresiva: el 26,99% de los pesos lógicos está en 2 bits, lo que puede degradar tareas de razonamiento fino, matemáticas o código en comparación con el modelo en BF16.
- Licencia no especificada: la model card no declara licencia, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base Qwen3.5-9B antes de cualquier despliegue en producción.
- Autor independiente: el checkpoint lo publica el usuario bambocher, no Alibaba; no hay garantías de soporte, mantenimiento ni validación oficial.
- Dependencia de MLX: solo se ejecuta en el ecosistema Apple; no hay conversiones a GGUF ni soporte para CUDA documentados.
- Idiomas no documentados: se desconoce qué lenguas conserva con calidad tras la cuantización; el castellano no está verificado.
- Riesgo de alucinación: inherente al modelo base y potencialmente amplificado por la compresión de pesos.
- Contexto no disponible: se desconoce la longitud máxima de contexto soportada por esta conversión.
- Fecha de actualización: la model card indica una revisión del 2026-11-13 con oMLX v0.7.3; versiones anteriores pueden tener distribuciones de bits distintas.
- Sin benchmarks: no hay evidencia publicada de calidad, por lo que cualquier uso en producción requiere evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-oQ2.5-mtp
- Proyecto oQ / oMLX: https://github.com/jundot/omlx
- Documentación de MLX: https://github.com/ml-explore/mlx
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
