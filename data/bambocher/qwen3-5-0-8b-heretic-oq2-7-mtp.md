# bambocher/Qwen3.5-0.8B-heretic-oQ2.7-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ2.7-mtp es una cuantización mixta de precisión del modelo Qwen3.5-0.8B, publicado por el usuario bambocher en Hugging Face. Se trata de un derivado "decensored" del modelo original de Qwen, generado con la herramienta Heretic v2.0.0, que elimina los mecanismos de rechazo (refusals) del modelo base mediante una técnica de ablación de rangos arbitrarios (ARA, Arbitrary-Rank Ablation) aplicada sobre las capas 1 a 19. Posteriormente, el checkpoint se cuantiza con oQ (oMLX v0.7.3), un esquema de cuantización de precisión mixta que asigna distintos niveles de bits por tensor según su sensibilidad.

El modelo conserva la cabeza de predicción multi-token (MTP) del original, lo que permite decodificación especulativa y generación de varios tokens por paso. Incluye además un componente de visión (0.101B parámetros), lo que lo convierte en un modelo multimodal de pequeño tamaño. El checkpoint completo ocupa 0.504 GiB en almacenamiento, con un promedio efectivo de 4.960 bits por peso, y está empaquetado en formato MLX para su ejecución en hardware Apple Silicon.

Su relevancia radica en tres factores: es un modelo multimodal de menos de mil millones de parámetros que cabe en dispositivos con recursos limitados; incorpora MTP para acelerar la inferencia; y ha sido modificado para eliminar rechazos, lo que lo hace atractivo para investigadores que estudian alineamiento, censura y comportamiento de modelos. No obstante, la licencia no está declarada y el modelo base es propiedad de Qwen, lo que introduce incertidumbres legales para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP; cuantización mixta oQ |
| Parámetros totales | 873.438.784 (0.873B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ mixta: affine 3-bit g128, 3-bit g64, 4-bit g64, 5-bit g64, 8-bit g64 y BF16; promedio 4.960 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |
| Librería | mlx |
| Tamaño del repo | 1.1 GB (checkpoint lógico 0.504 GiB) |
| Desglose de parámetros | LM: 0.752B; visión: 0.101B; cabeza MTP: 0.020B |
| Fecha de creación | 2026-11-01 |
| Última actualización | 2026-11-12 (re-cuantizado con oMLX v0.7.3) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 que integra un codificador de visión (0.101B parámetros) junto con el modelo de lenguaje (0.752B) y una cabeza de predicción multi-token (0.020B). La cabeza MTP permite generar varios tokens por paso de decodificación, lo que habilita decodificación especulativa y reduce la latencia en inferencia autoregresiva. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La modificación "heretic" se realizó con Heretic v2.0.0 mediante ablación de rangos arbitrarios (ARA) sobre las capas 1 a 19, con los siguientes hiperparámetros: `preserve_good_behavior_weight` 0.8199, `steer_bad_behavior_weight` 0.0001, `overcorrect_relative_weight` 1.0547 y `neighbor_count` 14. El resultado es una reducción de rechazos de 97/100 en el modelo original a 0/100 en esta versión, con una divergencia KL de 0.1412 respecto al original. La cuantización posterior con oQ asigna 3 bits (grupo 128) al 52.3% de los pesos, 3 bits (grupo 64) al 29.1%, BF16 al 11.8%, 5 bits al 4.6%, 4 bits al 2.2% y 8 bits al 0.01%, lo que preserva en BF16 las capas más sensibles (probablemente embeddings y cabezas).

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-0.8B.
- Procesamiento de imágenes: incluye un codificador de visión de 0.101B parámetros, lo que permite tareas de comprensión visual (descripción de imágenes, VQA, OCR básico).
- Decodificación especulativa mediante la cabeza MTP, que acelera la generación al proponer múltiples tokens por paso.
- Generación de código y matemáticas: capacidades propias de la familia Qwen3.5, aunque no se han publicado evaluaciones específicas para esta variante.
- Comportamiento sin rechazos: el modelo responde a solicitudes que el original rechazaría en el 97% de los casos según la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y censura: el modelo permite estudiar cómo la ablación ARA afecta al comportamiento de rechazo con una divergencia KL de 0.1412, lo que lo convierte en un banco de pruebas controlado para analizar qué se pierde y qué se gana al eliminar los mecanismos de seguridad.
- Inferencia en dispositivos Apple Silicon con recursos limitados: al ocupar 0.504 GiB y estar empaquetado en MLX, puede ejecutarse en Macs con 8 GB de memoria unificada, lo que facilita prototipado local sin GPU dedicada.
- Procesamiento de imágenes en el borde: con solo 0.101B parámetros de visión, es adecuado para tareas de clasificación y descripción de imágenes en entornos con restricciones de memoria, como aplicaciones móviles o dispositivos embebidos con Apple Silicon.
- Generación acelerada de texto en local: la cabeza MTP permite decodificación especulativa, útil en aplicaciones de escritura asistida o chat donde la latencia por token es crítica y no se dispone de hardware de datacenter.
- Evaluación comparativa de cuantizaciones: el esquema oQ mixto (3 a 8 bits) sirve para medir el impacto de la precisión mixta en un modelo multimodal pequeño, comparando calidad y velocidad frente a cuantizaciones uniformes de 4 bits.
- Filtrado y anonimización de contenido sensible: al no rechazar solicitudes, puede emplearse en pipelines internos de moderación o transformación de texto donde los rechazos del modelo base interrumpirían el flujo, siempre con supervisión humana.
- Docencia y experimentación con MTP: investigadores pueden estudiar el comportamiento de la cabeza de predicción multi-token en un modelo de menos de mil millones de parámetros sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

| Métrica | Este modelo | Qwen/Qwen3.5-0.8B |
|---|---|---|
| Rechazos (sobre 100) | 0/100 | 97/100 |
| Divergencia KL | 0.1412 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.5 GiB para los pesos en el formato oQ mixto; con overhead de activaciones y caché KV, el consumo real dependerá de la longitud de contexto y del tamaño de las imágenes de entrada (no disponible).
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4). No es compatible de forma nativa con CUDA.
- Cabe en GPU consumer: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; también en iPhone/iPad recientes con MLX.
- Opciones de despliegue: MLX (librería oficial), oMLX para cuantización; no se ha confirmado soporte para vLLM, llama.cpp, Ollama o TGI, dado que el formato es específico de MLX.
- Latencia y throughput estimados: no disponibles. La cabeza MTP debería reducir la latencia frente a decodificación autoregresiva estándar, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-heretic-oQ2.7-mtp | 0.873B | no disponible | Sí (visión) | no disponible | MLX safetensors |
| Qwen/Qwen3.5-0.8B (original) | ~0.873B | no disponible | Sí (visión) | no disponible | safetensors |
| Qwen2.5-0.5B | 0.494B | 32K (típico en la familia) | No | Apache 2.0 (típico) | safetensors, GGUF |
| SmolVLM-256M | 0.256B | no disponible | Sí (visión) | Apache 2.0 | safetensors |

La comparación con Qwen2.5-0.5B y SmolVLM-256M es orientativa: no se dispone de datos de rendimiento de esta variante frente a ellos. La principal diferencia frente al original es la eliminación de rechazos y la cuantización MLX; frente a alternativas de tamaño similar, destaca por incluir visión y MTP en menos de mil millones de parámetros, aunque su licencia indefinida limita su adopción comercial.

## Limitaciones y advertencias

- La eliminación de rechazos (0/100) implica que el modelo puede generar contenido que el original bloquearía; no debe desplegarse en aplicaciones orientadas al público sin filtros adicionales.
- La divergencia KL de 0.1412 respecto al original indica una alteración medible de la distribución de salida; puede afectar a la coherencia y precisión en tareas que no tienen que ver con rechazos.
- Riesgo de alucinación: al ser un modelo de 0.873B parámetros, su capacidad de razonamiento y factualidad es limitada en comparación con modelos mayores; no se han publicado evaluaciones de factualidad.
- Licencia no declarada: no se especifican términos de uso, lo que impide confirmar si se permite uso comercial. El modelo base Qwen tiene sus propios términos, que podrían aplicar en cascada.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado fuera del inglés o chino sin evaluación previa.
- Longitud de contexto no disponible: se desconoce la ventana máxima, lo que dificulta planificar aplicaciones con documentos largos.
- Formato MLX: no es portable a CUDA sin conversión; el ecosistema de herramientas es más reducido que el de GGUF o safetensors estándar.
- Repo de 1.1 GB frente a 0.504 GiB de checkpoint: parte del espacio corresponde a metadatos y posiblemente a versiones previas; conviene verificar la integridad tras la re-cuantización del 2026-11-12.
- Sin soporte confirmado de tool calling ni agentes: no se recomienda para pipelines que dependan de function calling sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ2.7-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
