# bambocher/Qwen3.5-2B-heretic-oQ8e-mtp

## Resumen

Qwen3.5-2B-heretic-oQ8e-mtp es una versión "decensored" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.5-2B, publicada por el usuario bambocher en Hugging Face. Sobre el checkpoint original se aplicó la herramienta Heretic v2.0.0, que mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) elimina el comportamiento de negativa a responder, reduciendo los rechazos de 97/100 a 0/100 en la evaluación del autor a costa de una divergencia KL de 0,1397 respecto al modelo base.

El modelo conserva la cabeza de predicción multi-token (MTP) del original y está cuantizado en precisión mixta con oQ (oMLX v0.7.3), con una media efectiva de 9,623 bits por peso. La mayor parte de los pesos (85,033 %) se almacena en 8 bits afín con grupo de 64, mientras que un 14,967 % permanece en BF16.

Con 2.274.069.824 parámetros totales y un repositorio de 2,8 GB, es un modelo pequeño orientado a inferencia local en hardware Apple mediante la librería MLX. Incluye componentes de lenguaje (1,882B), visión (0,331B) y una cabeza MTP (0,061B). Es relevante para quienes necesitan un modelo multimodal compacto sin filtros de rechazo y ejecutable en equipos de consumo con silicio de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5), con cabeza de predicción multi-token (MTP) y torre de visión |
| Parametros totales | 2.274.069.824 (1,882B lenguaje + 0,331B visión + 0,061B MTP) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: 8 bits afín con grupo de 64 (85,033 % de los pesos) y BF16 (14,967 %); media efectiva de 9,623 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal con torre de visión y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa y generación de varios tokens por paso. La modificación principal es la aplicación de Heretic v2.0.0, que realiza una ablación de rangos arbitrarios (ARA) sobre las capas 12 a 23 del modelo, con parámetros concretos: peso de preservación de buen comportamiento 0,9189, peso de direccionamiento de mal comportamiento 0,0008, peso relativo de sobrecorrección 0,9924 y 14 vecinos. Esta intervención busca eliminar la tendencia a rechazar peticiones sin degradar en exceso las capacidades generales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La cuantización se realizó con oMLX v0.7.3 (re-cuantizado el 2026-11-12), asignando 8 bits a la mayoría de los pesos y manteniendo en BF16 una fracción del 14,967 %, presumiblemente capas sensibles a la precisión.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-2B.
- Procesamiento de imágenes gracias a la torre de visión de 0,331B de parámetros.
- Predicción multi-token (MTP) para decodificación especulativa, lo que puede acelerar la inferencia.
- Comportamiento sin rechazos: 0/100 negativas en la evaluación del autor, frente a 97/100 del original.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con silicio de Apple: al estar empaquetado para MLX y ocupar 2,8 GB, se puede ejecutar en equipos con memoria unificada de 8 GB o más usando mlx-lm, sin necesidad de GPU dedicada.
- Prototipado de asistentes multimodales: la torre de visión permite describir imágenes o responder preguntas sobre capturas y diagramas en flujos de desarrollo locales.
- Investigación sobre alineación y censura: la comparación directa con Qwen3.5-2B (0/100 frente a 97/100 rechazos, KL de 0,1397) lo convierte en un banco de pruebas para estudiar el efecto de la ablación ARA en el comportamiento del modelo.
- Generación de texto creativo sin restricciones temáticas: útil para escritura de ficción o guiones donde los filtros del modelo base interrumpen la generación.
- Evaluación de decodificación especulativa: la cabeza MTP intacta permite medir la ganancia de velocidad de la predicción multi-token en MLX frente a decodificación autoregresiva estándar.
- Experimentos de cuantización mixta: el checkpoint sirve para comparar la calidad de la cuantización oQ de 9,623 bits/peso frente al modelo en BF16 en tareas de lenguaje y visión.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.5-2B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1397 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 2,8 GB para los pesos en el formato cuantizado; el runtime de MLX añade overhead adicional.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4) con memoria unificada; el formato MLX no está pensado para GPU NVIDIA.
- Cabe en GPU de consumo: sí, en cualquier Mac con 8 GB o más de memoria unificada; en el ecosistema NVIDIA requeriría conversión a otro formato.
- Opciones de despliegue: mlx-lm y oMLX (herramienta de cuantización); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; la cabeza MTP puede mejorar la velocidad de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-heretic-oQ8e-mtp | 2,274B | no disponible | no disponible | safetensors (MLX) | Sin rechazos, cuantización mixta 9,623 bits/peso |
| Qwen/Qwen3.5-2B | 2B (aprox.) | no disponible | no disponible | safetensors | Modelo base con rechazos (97/100) |
| Alternativas de ~2B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ofensivo o inseguro sin filtros; no es apto para aplicaciones de cara al público sin moderación externa.
- La divergencia KL de 0,1397 respecto al original indica una alteración medible de la distribución de salida; puede haber degradación en tareas que dependían del comportamiento alineado.
- Riesgo de alucinación inherente a un modelo de 2B parámetros; no se han publicado evaluaciones de fidelidad factual.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; conviene verificar la licencia del modelo base Qwen3.5-2B antes de desplegarlo.
- Idiomas soportados no documentados; el rendimiento fuera del inglés y el chino es incierto.
- Longitud de contexto no disponible; no se debe asumir una ventana larga.
- Formato MLX: requiere conversión para su uso en ecosistemas NVIDIA o en servidores estándar.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- El autor advierte que se re-cuantizó el 2026-11-12 y recomienda volver a descargar copias anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
