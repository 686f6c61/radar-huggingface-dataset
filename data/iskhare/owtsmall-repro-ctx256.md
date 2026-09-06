# iskhare/owtsmall-repro-ctx256

## Resumen

El modelo `owtsmall-repro-ctx256` es un sistema de investigación de predicción de siguiente concepto (next-concept prediction, NCP) desarrollado por Ishan Khare (usuario `iskhare`) sobre el corpus OpenWebText. Combina un tokenizador VQ-VAE multiescala con un generador transformer de 12 capas, diseñado para aprender representaciones jerárquicas de texto. El tokenizador tiene 196,82 millones de parámetros y 12 niveles de tokenización; el generador tiene 228,82 millones de parámetros y una ventana de contexto de 256. El proyecto se publica bajo licencia Apache 2.0 y está pensado como una reproducción de experimentos de tokenización multiescala, no como un modelo de lenguaje de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (generador) + VQ-VAE multiescala (tokenizador) |
| Parámetros totales | 425,64 M (196,82 M tokenizador + 228,82 M generador) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible explícitamente; corpus de entrenamiento OpenWebText (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (checkpoints nativos de PyTorch) |

## Arquitectura y entrenamiento

El tokenizador es un VQ-VAE multiescala con 12 niveles de tokenización, cuyos conteos de tokens son `[1, 4, 16, 25, 36, 64, 81, 121, 144, 169, 225, 256]`. Cada nivel tiene un codebook de 16.384 entradas. Se entrenó durante 10 épocas sobre los token IDs de GPT-2 del subconjunto `small_owt` de OpenWebText, con muestreo ponderado por longitud de documento. El generador es un transformer con 12 capas, 12 cabezas de atención, ancho de embedding 768 y 11 cabezas de salida lineales `Linear(768, 16384)`, una por cada escala predicha (la primera escala se proporciona como condición). Se entrenó durante 5 épocas con el tokenizador congelado. Ambas etapas se compilaron con `torch.compile`. La innovación principal es la predicción de conceptos a múltiples escalas, en lugar de tokens individuales, lo que permite una generación jerárquica.

## Capacidades

- Generación de texto mediante predicción de conceptos a 11 escalas, condicionada por un nivel grueso.
- Tokenización multiescala de texto con VQ-VAE, con reconstrucción de tokens de alta fidelidad (99,93% de precisión en validación).
- Generación de secuencias de conceptos con entropía controlada (4,4579 nats en generación aleatoria; 3,7862 nats con `top_k=50` y `top_p=0.95`).
- No soporta tool calling, function calling, ni razonamiento multi-paso como un LLM convencional.
- No incluye capacidades de visión ni audio.
- Entrenado exclusivamente en texto en inglés (OpenWebText), sin soporte multilingüe explícito.

## Casos de uso

- Investigación en tokenización multiescala: permite estudiar cómo la cuantización de tokens en múltiples niveles afecta a la reconstrucción y a la generación de texto.
- Compresión de representaciones de texto: el tokenizador VQ-VAE puede usarse para obtener representaciones discretas compactas de secuencias largas.
- Generación jerárquica de texto: el generador puede producir texto a partir de un concepto de alto nivel, desplegando progresivamente los niveles más finos.
- Evaluación de predictibilidad de conceptos: sirve como banco de pruebas para medir la entropía y la perplejidad de la generación a nivel de concepto frente a modelos de referencia como GPT-2 Large.
- Reproducción de experimentos: los checkpoints incluyen el estado del optimizador, el scheduler, la configuración y el estado RNG, lo que facilita la reproducción exacta del entrenamiento.
- Análisis de la relación entre escalas de tokenización y calidad de generación: permite comparar la pérdida y la precisión por nivel para entender qué escalas son más difíciles de predecir.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Pérdida de reconstrucción del tokenizador (validación) | 0,003189 |
| Precisión de reconstrucción del tokenizador (validación) | 99,93% |
| Pérdida de validación del generador | 4,579768 |
| Precisión de validación del generador | 45,3499% |
| Pérdida del último nivel del generador | 0,62108 |
| Precisión del último nivel del generador | 82,7406% |
| PPL de generación aleatoria | 155,3968 ± 1,116 (SE) |
| Entropía de generación aleatoria | 4,4579 nats |
| PPL con `top_k=50`, `top_p=0.95` | 50,8859 ± 0,407 (SE) |
| Entropía con `top_k=50`, `top_p=0.95` | 3,7862 nats |

Nota: la PPL se calculó con GPT-2 Large como modelo de referencia, 128 muestras por semilla, cinco semillas, temperatura 1.0 y un nivel grueso proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el generador (228,82 M parámetros) ocupa aproximadamente 0,9 GB en FP32; el tokenizador (196,82 M) unos 0,8 GB. En conjunto, unos 1,7 GB, aunque el despliegue conjunto puede requerir memoria adicional para activaciones y buffers.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA RTX 3060, T4, A10G) es suficiente para la inferencia. No se requieren GPUs de alta gama.
- Compatibilidad con GPU de consumo: sí, el modelo es ligero y cabe en tarjetas consumer actuales.
- Opciones de despliegue: se proporcionan checkpoints nativos de PyTorch; no se han documentado adaptaciones para vLLM, llama.cpp, Ollama, TGI ni otros frameworks de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han encontrado modelos comparables de la misma categoría (predicción de siguiente concepto con tokenización multiescala) en la información disponible.

## Limitaciones y advertencias

- Es un modelo de investigación, no un LLM de propósito general; no está diseñado para seguir instrucciones ni mantener conversaciones.
- La ventana de contexto es de solo 256 tokens, lo que limita el procesamiento de secuencias largas.
- El corpus de entrenamiento (OpenWebText) está en inglés, por lo que el modelo no tiene capacidades multilingües.
- No se incluyen cuantizaciones ni optimizaciones para inferencia; los checkpoints son de entrenamiento y requieren PyTorch.
- Puede heredar sesgos presentes en OpenWebText, un corpus derivado de Reddit.
- Como modelo generativo, existe riesgo de alucinación y de producir texto incoherente o irrelevante.
- No se han publicado evaluaciones de seguridad ni alineamiento (RLHF/DPO).
- El repositorio no tiene descargas ni likes, y no se ha documentado un uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iskhare/owtsmall-repro-ctx256
- Perfil del autor en Hugging Face: https://huggingface.co/iskhare
