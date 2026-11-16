# Abdulmjeedk/Qwen3.5-4B-MemForest-SFT-DPO

## Resumen

Qwen3.5-4B-MemForest-SFT-DPO es un adaptador LoRA experimental publicado por Abdulmjeedk sobre el modelo base unsloth/Qwen3.5-4B. No es un modelo de propósito general, sino un componente especializado en la fusión de pares de memoria (memory-pair merging) dentro del proyecto MemForest: recibe dos nodos de memoria y produce un nodo fusionado más conciso. El repositorio incluye dos fine-tunes entrenados de forma independiente, uno con SFT y otro con DPO, además de sus exportaciones a GGUF en BF16.

El modelo resuelve un problema concreto: reducir el almacenamiento de texto en una memoria jerárquica sin degradar la precisión de un lector/juez posterior. Con 4.326.350.848 parámetros totales (aproximadamente 4,3 mil millones) y arquitectura Qwen3.5 con módulos de visión, el adaptador se distribuye bajo licencia Apache 2.0 y solo declara soporte de inglés.

Su relevancia es acotada pero clara para investigadores: publica el dataset sintético de entrenamiento, los pares de preferencia DPO, los hashes de procedencia y los resultados de un benchmark reproducible sobre 1.540 respuestas evaluadas automáticamente. Es un artefacto de investigación, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (Qwen3_5ForConditionalGeneration) con módulos de visión; fine-tune mediante LoRA (PEFT) |
| Parametros totales | 4.326.350.848 (modelo base con adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (GGUF publicado en BF16); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT) y GGUF (modelo completo fusionado en BF16) |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-4B, un transformer de la familia Qwen3.5 con capacidades multimodales (módulos de visión). Sobre esa base se aplican dos adaptadores LoRA entrenados por separado: el checkpoint SFT (425) contiene 344 pares de matrices LoRA, de los cuales 96 corresponden a módulos de visión; el checkpoint DPO (560) contiene 248 pares en módulos de texto. La inspección offline detectó que las 96 matrices B de visión del adaptador SFT son cero, por lo que el efecto real del fine-tune es exclusivamente textual.

El SFT se entrenó sobre el dataset Abdulmjeedk/synthetic-memory-merging-v1, con 7.652 ejemplos de entrenamiento y 958 de validación; el split de test sintético de 957 ejemplos quedó reservado. El DPO se entrenó sobre un corpus de preferencias derivado y revisado (concise preference v2) con 4.480 pares de entrenamiento y 640 de validación, que reutiliza grupos fuente ficticios, añade escenarios multi-hecho concisos y contrastes de omisión, error factual y verbosidad. Ambos corpus son sintéticos, comparten plantillas y las preferencias no han sido validadas por humanos ni muestreadas de errores reales de Qwen. El entrenamiento DPO se realizó desde el modelo base Qwen3.5-4B, no desde el checkpoint SFT.

## Capacidades

- Fusión de pares de memoria: recibe dos nodos de memoria y genera un nodo fusionado más conciso, preservando hechos del contenido original.
- Compresión de texto con control de calidad: reduce el texto almacenado entre un 23% y un 26% respecto al merger original en el benchmark, con una precisión QA automatizada comparable o ligeramente superior.
- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-4B.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el uso previsto es una llamada única de fusión dentro de un pipeline MemForest.
- Capacidades multilingües: solo se declara inglés.
- Capacidades de visión: el adaptador SFT incluye módulos de visión, pero sus matrices B son cero; el autor no reclama calidad de visión.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación en memory merging: evaluar si el fine-tune supervisado o el DPO mejoran la fidelidad de hechos al fusionar nodos de una memoria jerárquica, usando el benchmark publicado de 1.540 respuestas y el juez automático fijo.
- Compresión de memorias de agentes conversacionales: integrar el merger en un pipeline MemForest para reducir el texto almacenado en un 23-26% manteniendo la precisión del lector, útil en sistemas con presupuesto de contexto limitado.
- Reproducción de experimentos: el repositorio incluye evaluation/results.json, provenance.json y los ficheros de entrenamiento listos para el trainer, lo que permite replicar la comparativa SFT frente a DPO frente al merger original.
- Estudio de DPO sobre datos sintéticos: analizar el compromiso calidad/almacenamiento entre SFT (menos texto, menor precisión) y DPO (más texto, mayor precisión) en una tarea de reescritura controlada.
- Prototipado con llama.cpp: ejecutar el GGUF BF16 de 8,67 GB con llama-cli en un runtime compatible con Qwen3.5 para pruebas de fusión de texto sin infraestructura de entrenamiento.
- Base para futuros fine-tunes: partir del adaptador SFT o DPO y añadir datos propios de dominios específicos (soporte técnico, historiales clínicos ficticios) para estudiar la transferencia de la tarea de fusión.

## Benchmarks y rendimiento

El autor publica una comparativa sobre 1.540 respuestas puntuadas por un juez automático, con el lector, el juez, las notas de entrada, los prompts, la plantilla de chat y las semillas fijos. Solo cambia el merger.

| Eliminación solicitada | Merger | Eliminación real | Nodos | Correctas / puntuadas | Precisión QA (%) | Tokens de texto |
|---|---|---:|---:|---:|---:|---:|
| 50% | Original | 48,67% | 3.499 | 811/1.540 | 52,66% | 85.571 |
| 50% | SFT | 48,67% | 3.499 | 776/1.540 | 50,39% | 52.150 |
| 50% | DPO | 48,67% | 3.499 | 819/1.540 | 53,18% | 63.558 |
| 70% | Original | 67,24% | 2.233 | 759/1.540 | 49,29% | 75.888 |
| 70% | SFT | 67,24% | 2.233 | 732/1.540 | 47,53% | 48.177 |
| 70% | DPO | 67,24% | 2.233 | 784/1.540 | 50,91% | 58.410 |

Diferencias declaradas por el autor: DPO frente al original, +0,52 y +1,62 puntos porcentuales de precisión QA con un 25,72% y un 23,03% menos de texto almacenado (50% y 70% de eliminación). DPO frente a SFT, +2,79 y +3,38 puntos porcentuales, con un 21,88% y un 21,24% más de texto. Las notas originales contienen 60.099 tokens; DPO almacena un 5,76% más de texto con el objetivo del 50% y un 2,81% menos con el del 70%. Se trata de una sola ejecución por método y objetivo, con reutilización previa de LoCoMo en desarrollo, errores conocidos del juez y sin regrade independiente del DPO; no se declara significación estadística.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,7 GB solo para pesos, más overhead de contexto y runtime; en la práctica, 10-12 GB para el GGUF BF16.
- VRAM estimada para cargar el adaptador PEFT sobre el modelo base en BF16: alrededor de 9 GB de pesos más activaciones; se recomienda al menos 16 GB para margen.
- GPU recomendadas: A100, H100 o L40S para lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia individual en BF16.
- GPU de consumo: cabe en tarjetas de 16 GB o superiores en BF16; en tarjetas de 8-12 GB sería necesario cuantizar, pero el repositorio solo publica BF16.
- Opciones de despliegue: llama.cpp (llama-cli con el GGUF publicado), Transformers con PEFT 0.18.1 o superior y una versión con soporte de Qwen3.5, según el ejemplo load_merger.py incluido.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-MemForest-SFT-DPO (este) | 4,33 B | no disponible | Fusión de pares de memoria | Apache 2.0 | Hugging Face, GGUF y adaptadores |
| unsloth/Qwen3.5-4B (base) | 4,33 B | no disponible | Modelo general multimodal | no disponible en la información | Hugging Face |
| Merger original de MemForest | no disponible | no disponible | Fusión de pares de memoria | no disponible | Referencia del benchmark del autor |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría (mergers de memoria) en la información proporcionada.

## Limitaciones y advertencias

- Proyecto experimental e independiente: no es una release oficial de MemForest ni de Qwen, y el autor lo califica explícitamente como AI-assisted.
- Preferencias DPO sintéticas y no validadas por humanos; comparten plantillas y no se muestrean de errores reales de Qwen, lo que puede inflar la calidad aparente.
- El benchmark usa un juez automático con errores conocidos y una sola ejecución por método y objetivo; no hay significación estadística ni regrade independiente del DPO.
- La comparación DPO frente a SFT no aísla el efecto del DPO a presupuestos de texto iguales: DPO almacena más texto que SFT.
- No se reclama preservación completa de hechos ni calidad de visión; las 96 matrices B de visión del adaptador SFT son cero.
- Solo se declara inglés; no hay soporte multilingüe documentado.
- El adaptador SFT no tiene registrada la revisión exacta del modelo base, a diferencia del DPO, lo que limita la reproducibilidad bit a bit del SFT.
- No se garantiza equivalencia de generación entre runtimes (Transformers/PEFT frente a llama.cpp); el benchmark se hizo con los GGUF BF16.
- Riesgo de alucinación y de omisión de hechos al fusionar: la tarea consiste precisamente en descartar contenido, y el autor advierte de contrastes de omisión y error factual en los datos.
- Uso comercial permitido por Apache 2.0, pero sin garantías de idoneidad para producción; el propio autor lo orienta a investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abdulmjeedk/Qwen3.5-4B-MemForest-SFT-DPO
- Dataset de entrenamiento SFT: https://huggingface.co/datasets/Abdulmjeedk/synthetic-memory-merging-v1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- GGUF SFT (checkpoint 425): https://huggingface.co/Abdulmjeedk/Qwen3.5-4B-MemForest-SFT-DPO/resolve/main/gguf/Qwen3.5-4B-MemForest-SFT-425-BF16.gguf
- GGUF DPO (checkpoint 560): https://huggingface.co/Abdulmjeedk/Qwen3.5-4B-MemForest-SFT-DPO/resolve/main/gguf/Qwen3.5-4B-MemForest-DPO-560-BF16.gguf
- Adaptador SFT: https://huggingface.co/Abdulmjeedk/Qwen3.5-4B-MemForest-SFT-DPO/tree/main/sft
- Adaptador DPO: https://huggingface.co/Abdulmjeedk/Qwen3.5-4B-MemForest-SFT-DPO/tree/main/dpo
- Script de carga: https://huggingface.co/Abdulmjeedk/Qwen3.5-4B-MemForest-SFT-DPO/blob/main/load_merger.py
- Detalles de evaluación: https://huggingface.co/Abdulmjeedk/Qwen3.5-4B-MemForest-SFT-DPO/blob/main/evaluation/README.md
- Resultados agregados: https://huggingface.co/Abdulmjeedk/Qwen3.5-4B-MemForest-SFT-DPO/blob/main/evaluation/results.json
- Procedencia y hashes: https://huggingface.co/Abdulmjeedk/Qwen3.5-4B-MemForest-SFT-DPO/blob/main/provenance.json
- Resumen de entrenamiento: https://huggingface.co/Abdulmjeedk/Qwen3.5-4B-MemForest-SFT-DPO/blob/main/training_summary.json
- Datos DPO v2: https://huggingface.co/Abdulmjeedk/Qwen3.5-4B-MemForest-SFT-DPO/tree/main/training_data/dpo-v2
