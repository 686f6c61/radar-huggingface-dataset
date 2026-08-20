# noooop/DeepSeek-V4-Flash-REAP128-FP4

## Resumen

DeepSeek-V4-Flash-REAP128-FP4 es un modelo de lenguaje de gran tamaño (LLM) creado por el usuario noooop, que consiste en una versión podada del modelo oficial `deepseek-ai/DeepSeek-V4-Flash-0731`. El objetivo principal es reducir el coste de ejecución para hacer viable su despliegue en un único servidor DGX Spark con 128 GB de memoria, manteniendo el mecanismo de decodificación especulativa (draft head) del modelo original. Para ello, conserva 128 de los 256 expertos enrutados del modelo base, en formato nativo FP4/FP8 de DeepSeek, en lugar de aplicar una cuantización uniforme.

La relevancia de este modelo radica en que demuestra una estrategia de poda de expertos (REAP) combinada con cuantización de baja precisión, que reduce el peso del modelo de aproximadamente 284.000 millones de parámetros (el modelo base) a unos 156.000 millones, y el tamaño en disco a 88,1 GB. Sin embargo, el autor advierte explícitamente que se trata de una poda de expertos, no de una simple cuantización: un build de 2 bits con los 256 expertos completos (también de ~85 GB) obtuvo un rendimiento notablemente superior en las evaluaciones publicadas, por lo que la elección de este modelo debe basarse en la compatibilidad con la ejecución nativa FP4 y la decodificación especulativa, no en la calidad por byte.

El modelo se distribuye bajo licencia MIT, con pesos en formato safetensors y está pensado para usarse con librerías que soporten el formato nativo de DeepSeek, como vLLM, no con GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 128 de 256 expertos enrutados, atención híbrida CSA+HCA, hiperconexiones con restricción de manifold y decodificación especulativa (MTP) |
| Parametros totales | 155.979.924.030 (155,98 mil millones) |
| Parametros activos | 6 expertos enrutados activos por token (no se especifica el número de parámetros activos totales) |
| Longitud de contexto | No disponible (el modelo base DeepSeek-V4-Flash-0731 soporta 1.000.000 de tokens según documentación oficial) |
| Tipos de cuantizacion | FP4 E2M1 (pesos de expertos enrutados, bloques de 32 elementos con escalas E8M0) y FP8 E4M3 (resto de pesos cuantizados, bloques de 128x128 con escalas E8M0) |
| Idiomas soportados | No disponible (la calibración de poda se realizó con una mezcla centrada en japonés e inglés, pero no se publica la lista de idiomas soportados) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato nativo de DeepSeek, no GGUF) |

## Arquitectura y entrenamiento

El modelo es una versión podada del checkpoint oficial `deepseek-ai/DeepSeek-V4-Flash-0738`, que emplea una arquitectura MoE con atención híbrida CSA+HCA (CSA: Channel-Shared Attention, HCA: Head-Collapsed Attention) e hiperconexiones con restricción de manifold, tal como se describe en la documentación de vLLM. El modelo base incorpora además un módulo de decodificación especulativa (draft head) basado en MTP (Multi-Token Prediction) que permite acelerar la generación. La poda REAP mantiene 128 de los 256 expertos enrutados originales, así como 128 de los 256 expertos del draft head, y reduce la capa objetivo a 43 capas con 6 expertos activos por token.

El autor publica el proceso de reconstrucción completo: no se modifica ningún experto superviviente, por lo que el checkpoint resultante es una copia byte a byte del modelo oficial más 86 tensores de router recalculados. La verificación confirma que 17.711 tensores no difieren en valor respecto al pipeline completo. Los datos de entrenamiento y la mezcla de calibración no se distribuyen en su totalidad (el archivo `calib.pt` no se publica), pero se proporcionan scripts y la configuración exacta para reproducir la calibración, que se centró en una mezcla japonesa/inglesa. No se menciona el uso de RLHF ni DPO en el proceso de poda.

## Capacidades

- Generación de texto y razonamiento complejo, heredados del modelo base DeepSeek-V4-Flash-0731, aunque con calidad reducida por la poda de expertos.
- Capacidades agénticas mejoradas respecto a versiones anteriores del modelo base, según la documentación oficial de DeepSeek (el modelo base tiene soporte para razonamiento de tres niveles: Non-think, Think High y Think Max).
- Generación de código y soporte para tareas de programación, aunque las evaluaciones de código en este build muestran resultados mixtos en comparación con otras versiones.
- Decodificación especulativa mediante el draft head MTP, que acelera la generación al predecir múltiples tokens por paso.
- Capacidades multilingües limitadas: la calibración se centra en japonés e inglés, por lo que el rendimiento en otros idiomas puede verse degradado.
- No se documenta explícitamente soporte para tool calling ni function calling en este build concreto, aunque el modelo base sí lo incluye.

## Casos de uso

- Inferencia local en servidores de gama alta: el modelo está diseñado para ejecutarse en un único DGX Spark con 128 GB de memoria, lo que permite desplegar un LLM de ~156 mil millones de parámetros en un servidor compacto sin necesidad de clústeres multi-GPU.
- Asistente de programación en entornos aislados: al conservar la decodificación especulativa y un contexto largo (heredado del base), puede utilizarse para autocompletado y revisión de código en entornos de desarrollo donde no se permite conexión a servicios en la nube.
- Razonamiento y análisis de documentos largos: con un contexto de hasta 1 millón de tokens en el modelo base (no confirmado en este build), puede procesar libros técnicos, informes extensos o código fuente de proyectos completos.
- Prototipado de agentes con razonamiento multi-paso: las capacidades agénticas del modelo base permiten explorar flujos de trabajo de agentes que requieren varias etapas de razonamiento, aunque la calidad reducida puede afectar a tareas complejas.
- Evaluación y benchmarking de técnicas de poda: los scripts y datos de calibración publicados permiten a investigadores comparar el impacto de la poda de expertos en el rendimiento de modelos MoE de gran escala.
- Generación de contenido multilingüe en japonés e inglés: gracias a la calibración específica, puede ser adecuado para tareas de redacción, traducción o resumen en estos idiomas, siempre que no se exija la máxima calidad.

## Benchmarks y rendimiento

El autor publica resultados de una muestra de 205 preguntas de MMLU generativa, comparando este build con otras variantes del mismo modelo base. No se proporcionan resultados de benchmarks estándar como MMLU completo, HumanEval o GSM8K.

| Modelo | MMLU generativa (205 preguntas) |
|---|---|
| DeepSeek-V4-Flash-REAP128-FP4 (este modelo) | 51,22 % |
| DeepSeek-V4-Flash-REAP152-FP4 (152 expertos) | 58,05 % |
| DeepSeek-V4-Flash-UD-IQ2_M (256 expertos, cuantización 2-bit) | 84,39 % |

Los resultados de evaluaciones de código son mixtos, según el autor, sin valores numéricos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa 88,1 GB en disco y está pensado para ejecutarse en un DGX Spark con 128 GB de memoria. No se indica la VRAM mínima exacta, pero se infiere que es necesario un servidor con al menos 128 GB de memoria GPU.
- GPU recomendadas: DGX Spark (128 GB), posiblemente también GPUs de alto rendimiento con 80 GB o 96 GB de VRAM si se aplica una cuantización adicional, aunque no se documenta.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) por su tamaño.
- Opciones de despliegue: vLLM (se incluyen overlays específicos en el repositorio), así como la librería Transformers. No es compatible con llama.cpp ni Ollama por no ser un checkpoint GGUF.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

La comparativa se centra en las variantes del mismo modelo base publicadas por el mismo autor, ya que son las únicas con datos disponibles.

| Modelo | Expertos | Parámetros | Tamaño en disco | MMLU gen. (205) | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-REAP128-FP4 (este) | 128 de 256 | 155,98 B | 88,1 GB | 51,22 % | MIT |
| DeepSeek-V4-Flash-REAP152-FP4 | 152 de 256 | No disponible | 101,9 GB | 58,05 % | MIT |
| DeepSeek-V4-Flash-UD-IQ2_M | 256 de 256 | No disponible | ~85 GB | 84,39 % | MIT |
| DeepSeek-V4-Flash-0738 (original) | 256 de 256 | 284 B | ~170 GB (según guía) | No disponible | No especificada |

## Limitaciones y advertencias

- La poda de expertos reduce significativamente la calidad del modelo: la pérdida de rendimiento es notable frente a un build de 2 bits con los 256 expertos (84,39 % frente a 51,22 % en MMLU generativa).
- La calibración se realizó con una mezcla centrada en japonés e inglés, por lo que el rendimiento en otros idiomas puede ser inferior al esperado.
- Riesgo de alucinaciones y errores de razonamiento, especialmente en tareas complejas, debido a la reducción de la capacidad del modelo.
- El contexto máximo de 1.000.000 de tokens se hereda del modelo base, pero no se ha verificado en este build específico; podría verse afectado por la poda del draft head.
- La licencia MIT del repositorio no exime de revisar la licencia del modelo base `deepseek-ai/DeepSeek-V4-Flash-0738`, que no se indica en la documentación disponible.
- No se trata de un modelo GGUF, por lo que no es compatible con herramientas como llama.cpp u Ollama sin conversión previa.
- El autor recomienda no reutilizar el archivo de saliencia publicado para perfiles de lenguaje o dominio distintos al de la calibración original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/noooop/DeepSeek-V4-Flash-REAP128-FP4
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0738
- Variante sin MTP (noMTP): https://huggingface.co/noooop/DeepSeek-V4-Flash-REAP-noMTP
- Documentación de calidad y benchmarks: https://huggingface.co/noooop/DeepSeek-V4-Flash-REAP128-FP4/blob/main/docs/QUALITY.md (se infiere del README)
- Guía de ejecución local de DeepSeek V4 Flash: https://codersera.com/blog/run-deepseek-v4-flash-locally-full-2026-setup-guide/
- Página del modelo en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash
- Recetas de vLLM para DeepSeek V4 Flash: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
