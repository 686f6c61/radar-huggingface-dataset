# SlayerLab/bdh-150m-slayer

## Resumen

BDH-150M-Slayer es un modelo de lenguaje de 150 millones de parámetros desarrollado por SlayerLab como parte de un estudio de escalado de la arquitectura BDH (Fast Weight Layers) de pathwaycom/bdh. Se trata de un checkpoint entrenado hasta completar 30.000 pasos sobre un conjunto de datos de 970 millones de tokens a nivel de byte, compuesto por un 80% de texto en inglés (fineweb-edu) y un 20% en polaco (speakleash). El modelo opera directamente sobre bytes UTF-8 con un vocabulario de 256, sin tokenizador, lo que simplifica el pipeline de preprocesado y permite trabajar con cualquier idioma.

La relevancia de este modelo radica en que explora una arquitectura alternativa al transformer estándar, basada en pesos rápidos y recurrencia latente, y en que documenta el comportamiento de escalado desde 25M hasta 150M parámetros. Aunque su tamaño es modesto, sirve como banco de pruebas para evaluar la viabilidad de las capas de pesos rápidos en tareas de modelado de lenguaje a nivel de byte. El modelo se publica bajo licencia CC-BY-4.0 y está disponible en HuggingFace con pesos en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BDH (Fast Weight Layers) con recurrencia latente |
| Parametros totales | ~151M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 bytes (a nivel de byte, no tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | ingles (en), polaco (pl) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (state dict, compatible con pathwaycom/bdh) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura BDH de pathwaycom/bdh, que incorpora capas de pesos rápidos (fast weight layers) y recurrencia latente. La configuración específica es `n_layer=8, n_embd=256, n_head=4, mlp_internal_dim_multiplier=768`, con un vocabulario de 256 (byte-level) y una longitud de secuencia de 2048 bytes. Al trabajar directamente sobre bytes, no requiere tokenizador, lo que elimina la dependencia de vocabularios subword y simplifica el manejo de textos multilingües.

El entrenamiento se realizó durante 30.000 pasos con el optimizador AdamW (lr 1e-3 → 1e-4 con scheduler coseno, weight decay 0.1, warmup de 1000 pasos) y gradiente recortado con ZClip. El conjunto de datos, denominado `SlayerLab/research-mix-v1`, contiene 970M tokens a nivel de byte, con una mezcla de 80% inglés (fineweb-edu) y 20% polaco (speakleash). La pérdida final de validación fue de 1.099. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el entrenamiento es puramente de modelado de lenguaje autorregresivo.

## Capacidades

- Generación de texto a nivel de byte, sin tokenizador, capaz de procesar cualquier texto UTF-8.
- Soporte multilingüe limitado a los idiomas presentes en el entrenamiento: inglés y polaco.
- Modelado de lenguaje autorregresivo estándar; no se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modos especiales (thinking, vision, audio).
- Al ser un modelo pequeño (150M) y entrenado en un corpus reducido, su capacidad de generación es limitada y orientada a experimentación e investigación.

## Casos de uso

- Investigación en arquitecturas de pesos rápidos: el modelo sirve como referencia para estudiar el comportamiento de BDH a escala de 150M, comparando con otras configuraciones del ladder de escalado (25M, 50M).
- Experimentación con modelado a nivel de byte: permite evaluar ventajas y desventajas de operar sin tokenizador, especialmente en tareas multilingües o con vocabularios abiertos.
- Generación de texto en inglés y polaco para prototipos académicos: puede usarse como base para tareas de completado de texto o generación condicionada en entornos de investigación.
- Benchmarking de eficiencia de entrenamiento: su entrenamiento en una sola GPU (A4000) y su pequeño tamaño lo hacen adecuado para reproducir estudios de escalado con recursos limitados.
- Pruebas de adaptación y fine-tuning: al ser un modelo pequeño, es viable ajustarlo en tareas específicas como clasificación de texto o generación de respuestas en los idiomas soportados.
- Educación y divulgación: útil para demostrar el funcionamiento de arquitecturas no transformer y el impacto de la representación byte-level en el modelado del lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la pérdida de validación final de 1.099, junto con la curva de pérdida a lo largo del entrenamiento. No es posible comparar cuantitativamente con otros modelos sin datos adicionales.

## Requisitos de hardware

- VRAM estimada: al tener ~151M parámetros en bfloat16, el modelo ocupa aproximadamente 300 MB en memoria. La inferencia puede ejecutarse en GPU con 2-4 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna con soporte bfloat16, como RTX 3060, RTX 4090 o A4000 (la usada para entrenar). También es viable en hardware de gama baja.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU consumer actual sin problemas.
- Opciones de despliegue: al ser una arquitectura personalizada, no es compatible directamente con vLLM, llama.cpp u Ollama. Se debe cargar mediante el código de `pathwaycom/bdh` (ver ejemplo de carga en la model card) y servir con frameworks genéricos como HuggingFace Transformers (si se adapta) o mediante una API propia.
- Latencia y throughput: no se proporcionan datos específicos. Dado el tamaño, la inferencia en GPU debería ser rápida (del orden de decenas de ms por token), pero depende del hardware y del batch.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de tamaño similar (por ejemplo, GPT-2 124M o Pythia-160M) en términos de rendimiento, ya que no hay benchmarks publicados. La principal diferencia es arquitectónica: BDH utiliza pesos rápidos y operación a nivel de byte, frente a los transformers clásicos con tokenizador subword. En cuanto a licencia, CC-BY-4.0 permite uso comercial con atribución, similar a muchas opciones abiertas. La disponibilidad es total en HuggingFace, aunque requiere el código de pathwaycom/bdh para cargar los pesos.

## Limitaciones y advertencias

- Modelo pequeño y entrenado en un corpus reducido (970M tokens), por lo que su calidad de generación es limitada y puede producir texto incoherente o con errores.
- Riesgo de alucinaciones y sesgos presentes en los datos de entrenamiento (fineweb-edu y speakleash), que no han sido mitigados mediante técnicas de alineación.
- Longitud de contexto limitada a 2048 bytes, lo que restringe el procesamiento de textos largos y puede afectar a tareas que requieran contexto extenso.
- Soporte de idiomas limitado a inglés y polaco; otros idiomas pueden no funcionar correctamente al operar a nivel de byte.
- Licencia CC-BY-4.0: permite uso comercial y modificación, pero exige atribución. No hay restricciones adicionales documentadas.
- La arquitectura BDH es experimental y requiere el código específico de pathwaycom/bdh; no hay integración nativa con ecosistemas estándar (vLLM, TGI, etc.), lo que complica su despliegue en producción.
- No se han realizado evaluaciones de seguridad, sesgos o robustez; no se recomienda su uso en aplicaciones críticas sin una validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlayerLab/bdh-150m-slayer
- Repositorio de la arquitectura BDH (pathwaycom/bdh): https://github.com/pathwaycom/bdh
- Estudio de escalado (SlayerLab/bdh-scaling): https://huggingface.co/SlayerLab/bdh-scaling
- Modelo de menor escala (SlayerLab/bdh-25m-pl): https://huggingface.co/SlayerLab/bdh-25m-pl
- Dataset de entrenamiento (SlayerLab/research-mix-v1): https://huggingface.co/datasets/SlayerLab/research-mix-v1
