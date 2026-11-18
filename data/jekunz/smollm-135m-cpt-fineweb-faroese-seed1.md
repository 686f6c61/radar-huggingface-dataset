# jekunz/smollm-135m-cpt-fineweb-faroese-seed1

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-seed1` es un ajuste fino por continuación de preentrenamiento (continued pre-training, CPT) del modelo instructivo SmolLM2-135M-Instruct de Hugging Face, especializado en el idioma feroés (código ISO `fo`). Lo desarrolla el usuario jekunz como parte de su investigación personal y se distribuye con licencia Apache 2.0. El objetivo declarado es adaptar un modelo pequeño y ya instruido a un idioma de bajos recursos mediante la exposición al subconjunto feroés del corpus FineWeb-2.

Arquitectónicamente hereda la estructura de SmolLM2: un transformer decoder-only de 134,5 millones de parámetros, con contexto de entrenamiento de 2048 tokens. El modelo no introduce innovaciones arquitectónicas propias; su valor está en el proceso de adaptación lingüística y en la reproducibilidad del experimento (semilla 1 de tres configuraciones equivalentes).

Es relevante para quienes investigan el ajuste de modelos pequeños a idiomas de bajos recursos, ya que demuestra un flujo de trabajo de CPT con recursos modestos (una única GPU A100 de 40 GB) sobre un corpus público. El autor advierte explícitamente de que el modelo no ha sido evaluado de forma amplia y que su uso previsto es la investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama / SmolLM2) |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, sin variantes GGUF) |
| Idiomas soportados | feroés (`fo`); el modelo base era multilingüe pero no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención causal, derivado directamente de SmolLM2-135M-Instruct. No se documentan cambios en la arquitectura respecto al modelo base; el ajuste consiste en una continuación de preentrenamiento sobre texto feroés seguida de la preservación de la naturaleza instructiva heredada. El entrenamiento se realizó durante 5 épocas con una tasa de aprendizaje de 5e-4, scheduler coseno, ratio de warmup de 0,05, tamaño de lote efectivo de 256 (lote de 8 con 32 pasos de acumulación de gradientes) y una única GPU A100 de 40 GB. La longitud máxima de contexto durante el entrenamiento fue de 2048 tokens y se fijó la semilla 1, siendo una de tres semillas equivalentes de la misma configuración.

El corpus de entrenamiento es el subconjunto feroés de `HuggingFaceFW/fineweb-2`, un dataset público de texto web filtrado y deduplicado. No se especifica el número exacto de tokens vistos, la composición detallada del dataset ni si hubo etapas de RLHF o DPO adicionales; tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La información disponible no permite cuantificar el volumen de datos ni el grado de olvido catastrófico del resto de idiomas del modelo base.

## Capacidades

- Generación de texto en feroés, idioma objetivo del ajuste.
- Conversación multi-turno, heredada del modelo instructivo base SmolLM2-135M-Instruct.
- Razonamiento básico y generación de texto general, limitado por el tamaño de 135M de parámetros.
- Capacidad multilingüe residual del modelo base no garantizada; solo se declara `fo`.
- Soporte de tool calling / function calling: no disponible de forma verificada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma verificada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en adaptación de modelos pequeños a idiomas de bajos recursos: sirve como punto de partida reproducible para comparar el efecto de CPT sobre el feroés frente al modelo base, dado que se publica como una de tres semillas.
- Generación de texto en feroés para prototipos: puede emplearse para producir borradores de texto en este idioma en entornos de experimentación, asumiendo la falta de evaluación formal.
- Experimentos de olvido catastrófico: permite estudiar cuánto inglés y otros idiomas del modelo base se degradan tras el ajuste con FineWeb-2 feroés.
- Base para ajuste supervisado posterior (SFT): al ser un modelo instructivo adaptado al feroés, puede servir como inicialización para tareas específicas con datos anotados en ese idioma.
- Docencia y demostraciones de pipelines de CPT: el flujo completo (dataset público, hiperparámetros documentados, una GPU) es replicable en cursos y talleres.
- Evaluación comparativa de corpus web de bajos recursos: útil para medir la calidad del subconjunto feroés de FineWeb-2 como fuente de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en precisión completa (fp32), unos 0,15 GB en fp16/bf16 y menos de 0,1 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; en servidor, A100 o H100 quedan sobredimensionadas para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp, Ollama o vLLM no están verificados para este repositorio concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-seed1 | 134,5M | 2048 | feroés | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-135M-Instruct (base) | 135M | 8192 | multilingüe | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 360M | 8192 | multilingüe | Apache 2.0 | Hugging Face |
| Modelos específicos para feroés de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación propia.
- Riesgo elevado de alucinación y de errores factuales por el tamaño reducido (135M) y la falta de benchmarks.
- Posible olvido catastrófico de otros idiomas del modelo base tras el CPT; solo se declara feroés.
- Contexto limitado a 2048 tokens en entrenamiento, inferior al contexto nativo de SmolLM2-135M-Instruct.
- Sesgos desconocidos: no se documenta análisis de sesgos del corpus FineWeb-2 ni del ajuste.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y la procedencia web del corpus aconsejan revisar riesgos de contenido antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni soporte comunitario verificable.
- Sin variantes cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue directo en algunas herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-seed1
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Paper de SmolLM2: no disponible en la información proporcionada
- Repositorio o blog del autor: no disponible en la información proporcionada
