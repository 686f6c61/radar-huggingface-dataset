# luxuansang/Qwen3.8-9B-heretic-uncensored-NVFP4-GGUF

## Resumen

Este modelo es una versión "sin censura" (decensored) de Qwen3.8-9B, un modelo de lenguaje de 9B parámetros desarrollado por empero-ai como destilación de Qwen3.8 2.4T A95B en la arquitectura Qwen3.5-9B. El autor luxuansang ha aplicado la herramienta Heretic v1.4.0 para eliminar los mecanismos de rechazo del modelo original, reduciendo la tasa de rechazo de 100/100 a 22/100 en las pruebas de evaluación, manteniendo una divergencia KL de 0.0171 respecto al modelo original. El resultado se ha cuantizado a formato GGUF con NVFP4 + Q8_0 para facilitar su despliegue en motores de inferencia como llama.cpp.

La relevancia de este modelo radica en su naturaleza "uncensored", que lo hace útil para investigaciones sobre alineación, generación creativa sin restricciones y análisis de comportamiento de modelos sin filtros de seguridad. Al estar basado en Qwen3.8, hereda capacidades de razonamiento y generación de texto, aunque la model card no detalla especificaciones completas de arquitectura o contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Destilación de Qwen3.8 2.4T A95B en arquitectura Qwen3.5-9B (no se especifican detalles adicionales) |
| Parametros totales | 8.953.803.664 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 + Q8_0 (según model card; también se evalúa NVFP4 + Q4_K_M) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, empero-ai/Qwen3.8-9B, es una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B (un MoE de 2.4 billones de parámetros con 95 mil millones activos) en la arquitectura Qwen3.5-9B. No se proporcionan detalles sobre el dataset de destilación ni el proceso de entrenamiento en esta model card; se remite a la documentación original.

Sobre esta base, el autor aplicó Heretic v1.4.0, una herramienta de eliminación automática de censura que modifica los pesos del modelo para reducir la probabilidad de rechazo ante peticiones que el modelo original consideraría inapropiadas. Los parámetros de optimización se listan en la model card (direction_index 17.82, attn.o_proj.max_weight 1.48, etc.), lo que permite reproducir el proceso. El resultado es un modelo con una tasa de rechazo de 22/100 frente a 100/100 del original, con una divergencia KL de 0.0171, indicando que el comportamiento general se mantiene cercano al original.

Posteriormente, el modelo se cuantizó a formato GGUF con NVFP4 + Q8_0 (y posiblemente Q4_K_M) para reducir su tamaño y facilitar su uso en hardware consumer.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y contextualizado, heredado de la familia Qwen3.8.
- Razonamiento: al ser una destilación de Qwen3.8, se espera que mantenga capacidades de razonamiento lógico y matemático, aunque no se especifican en la model card.
- Sin censura: el proceso de Heretic reduce significativamente los rechazos, permitiendo generar contenido que el modelo original bloquearía.
- Idiomas: la model card solo indica inglés; no se confirma soporte multilingüe.
- Compatibilidad con GGUF: puede ejecutarse con llama.cpp y otros motores compatibles.

## Casos de uso

- Generación creativa de contenido: el modelo puede producir ficción, poesía o guiones sin las restricciones habituales de los modelos alineados, siendo útil para escritores que necesitan explorar temas controvertidos.
- Investigación sobre alineación y seguridad: al ser una versión "uncensored", permite estudiar cómo los mecanismos de rechazo afectan al comportamiento del modelo y comparar respuestas con la versión original.
- Desarrollo de aplicaciones de chat sin filtros: para entornos donde se requiere una interacción más libre, como asistentes de rol o simulación de personajes.
- Análisis de sesgos: al eliminar la censura, se pueden identificar sesgos subyacentes que el modelo original podría ocultar tras rechazos.
- Prototipado rápido de aplicaciones de texto: gracias a su tamaño de 9B y cuantización GGUF, puede ejecutarse en GPUs consumer para pruebas y desarrollo.
- Educación y divulgación: para demostrar los efectos de la abliteration en modelos de lenguaje, como material didáctico en cursos de IA.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación con gguf-eval, comparando el modelo original (BF16), el modelo Heretic (BF16) y las versiones cuantizadas NVFP4 + Q8_0 y NVFP4 + Q4_K_M:

| Test | Original BF16 | Heretic BF16 | Heretic NVFP4 + Q8_0 | Heretic NVFP4 + Q4_K_M |
| :--- | ---: | ---: | ---: | ---: |
| HellaSwag | 77.75 | 78.75 | 77.25 | 78.00 |
| Winogrande | 72.38 | 72.53 | 70.40 | 70.96 |
| MMLU | 39.66 | 39.47 | 39.79 | 39.34 |
| MMLU-Redux-2.0-Thinking | 0.90 | 0.90 | 0.88 | 0.87 |
| ARC-Challenge | 52.84 | 52.51 | 52.17 | 52.84 |
| PIQA | 79.30 | 79.30 | 79.30 | 79.30 |
| BoolQ | 86.03 | 82.29 | 84.04 | 82.29 |
| FLORES200* | 50.19 | 50.25 | 49.71 | 49.96 |

*FLORES200: promedio sobre 5 pares de idiomas (zh→en, kr→ru, it→fr, jp→de, en→ar).

Se observa que la cuantización NVFP4 + Q8_0 produce cambios mínimos en la mayoría de pruebas, con una ligera degradación en Winogrande (−1.98) y BoolQ (−1.99) respecto al original. La versión Q4_K_M muestra una degradación similar. No se proporcionan comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: para la versión NVFP4 + Q8_0, el tamaño del archivo GGUF es aproximadamente 9-10 GB (el repo pesa 12.2 GB, pero incluye varias cuantizaciones). Con Q4_K_M, se reduce a unos 5-6 GB. Estas son estimaciones orientativas.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) para Q4_K_M; para Q8_0 se recomienda 12 GB o más (RTX 4070, RTX 4080, etc.).
- Compatibilidad con consumer GPU: sí, las versiones cuantizadas caben en GPUs de gama media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. También se puede usar con vLLM si se convierte a otro formato, pero el repo solo ofrece GGUF.
- Latencia y throughput: no se proporcionan datos específicos; dependerá del hardware y del motor de inferencia.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la misma configuración. Sin embargo, se puede comparar cualitativamente con otros modelos de ~9B:

| Modelo | Parámetros | Contexto | Licencia | Notas |
| :--- | ---: | ---: | --- | :--- |
| Qwen3.8-9B (este) | 8.95B | No disponible | Apache-2.0 | Destilación de Qwen3.8 2.4T, sin censura |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | Modelo generalista, con alineación estándar |
| Mistral 7B | 7B | 32K | Apache-2.0 | Modelo denso, eficiente |
| Qwen2.5 7B | 7B | 128K | Apache-2.0 | Modelo de la generación anterior de Qwen |

La principal diferencia es la ausencia de censura en este modelo, lo que lo hace único en su categoría, pero también implica riesgos de contenido inapropiado.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser "uncensored", el modelo puede generar contenido ofensivo, violento, sexual o ilegal. No debe usarse en aplicaciones públicas sin supervisión humana.
- Degradación en benchmarks: la cuantización introduce pequeñas pérdidas de rendimiento, especialmente en Winogrande y BoolQ.
- Idioma: la model card solo indica inglés; el rendimiento en otros idiomas no está garantizado.
- Resistencia a la abliteration: el autor señala que el modelo es relativamente resistente, lo que significa que algunos rechazos persisten (22/100) y que la eliminación de censura no es completa.
- Reproducibilidad: aunque se proporcionan los parámetros de Heretic, la reproducción exacta depende de la versión del software y del hardware.
- Sin documentación completa: la model card no incluye detalles de arquitectura, contexto o dataset de entrenamiento; se remite al modelo original.

## Enlaces

- [HuggingFace - luxuansang/Qwen3.8-9B-heretic-uncensored-NVFP4-GGUF](https://huggingface.co/luxuansang/Qwen3.8-9B-heretic-uncensored-NVFP4-GGUF)
- [Modelo original - empero-ai/Qwen3.8-9B](https://huggingface.co/empero-ai/Qwen3.8-9
