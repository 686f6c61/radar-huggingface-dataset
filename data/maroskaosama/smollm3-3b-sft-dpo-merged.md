# MaroskaOsama/smollm3-3b-sft-dpo-merged

## Resumen

`MaroskaOsama/smollm3-3b-sft-dpo-merged` es un checkpoint de la familia SmolLM3 de 3.075.098.624 parámetros (aproximadamente 3,08 mil millones), publicado por el usuario MaroskaOsama en Hugging Face. Por el nombre del repositorio se deduce que se trata de un modelo base SmolLM3 de 3B sometido a un proceso de ajuste supervisado (SFT) seguido de optimización de preferencias con DPO, y que posteriormente se han fusionado los pesos resultantes (merged). El repositorio pesa 6,2 GB y contiene pesos en formato safetensors compatibles con la librería `transformers`.

El interés de esta ficha es doble. Por un lado, documenta un checkpoint derivado de SmolLM3, una arquitectura pequeña pensada para ejecutarse en hardware de consumo. Por otro, sirve como caso práctico de los riesgos de los checkpoints comunitarios: la model card está generada automáticamente y no contiene ni un solo dato verificado sobre datos de entrenamiento, hiperparámetros, licencia o evaluación. Todo lo que se afirma en esta ficha sobre el proceso de ajuste proviene exclusivamente de la convención de nombres del repositorio y debe tratarse como inferencia, no como hecho documentado.

La relevancia actual del modelo es limitada pero real: los modelos de 3B con contexto largo y capacidad de razonamiento son candidatos habituales para despliegue en local, prototipado rápido y pipelines de bajo coste. Sin embargo, la ausencia de licencia explícita y de evaluación publicada hace que cualquier uso en producción requiera una verificación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM3; detalles no disponibles) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en el repositorio. Por el identificador `smollm3` y el recuento de parámetros se infiere que deriva de SmolLM3-3B, un transformer decoder-only de la familia SmolLM, pero no se dispone de confirmación en la información proporcionada sobre número de capas, dimensión oculta, cabezas de atención, tipo de atención (completa, GQA, sliding window) ni vocabulario. Tampoco se especifica si emplea atención lineal o algún esquema híbrido.

Respecto al entrenamiento, el nombre del repositorio sugiere una secuencia SFT → DPO → merge de pesos, pero no hay ni un solo hiperparámetro publicado: ni número de tokens de entrenamiento, ni composición del dataset, ni valores de beta en DPO, ni precisión mixta utilizada, ni hardware empleado. La model card es la plantilla automática de Hugging Face con todos los campos a `[More Information Needed]`. Cualquier afirmación sobre el proceso de ajuste más allá de lo que sugiere el nombre sería especulación.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el sufijo `sft-dpo` indican que el modelo está orientado a diálogo multi-turno, aunque no se documenta el formato de prompt ni la plantilla de chat exacta.
- Razonamiento y matemáticas: capacidad esperable en un modelo de 3B de la familia SmolLM3, pero sin evaluación publicada que lo respalde.
- Generación de código: no verificada en este checkpoint; el modelo base SmolLM3 suele entrenarse con datos de código, pero no hay confirmación para esta fusión.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Capacidades de agente y razonamiento multi-paso: no disponibles; no se documenta modo thinking ni planificación explícita.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en local: con 3,08B de parámetros, el modelo cabe en GPUs de consumo de 8-12 GB en cuantización de 8 bits o inferior, lo que permite iterar sobre prompts y plantillas de chat sin coste de API. Adecuado para validar flujos antes de migrar a un modelo mayor.
- Generación de texto asistida en entornos con requisitos de privacidad: al poder ejecutarse íntegramente en hardware propio, sirve para tareas de redacción, resumen o reescritura sobre documentos que no pueden salir de la infraestructura de la organización.
- Base para fine-tuning adicional: al ser un checkpoint ya ajustado con SFT y DPO, puede servir como punto de partida para LoRA o QLoRA sobre dominios específicos, reduciendo el coste frente a partir del modelo base.
- Evaluación comparativa de pipelines de alineación: útil para investigadores que quieran medir el efecto de una fusión de pesos SFT+DPO frente al checkpoint original, siempre que se realice una evaluación propia.
- Generación de respuestas en asistentes de bajo coste: para volúmenes altos de consultas cortas donde un modelo de 3B con throughput alto en una sola GPU sea suficiente, previa validación de calidad.
- Experimentación educativa: reproducción de un pipeline completo de ajuste y fusión de pesos en un modelo de tamaño manejable, útil para formación en ingeniería de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluación, ni comparación con el checkpoint base, ni métricas de MMLU, HumanEval, GSM8K o similares. Cualquier cifra que se citara sería inventada.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 7 y 9 GB según longitud de contexto. En int8, alrededor de 3,5-4 GB; en int4, alrededor de 2-2,5 GB.
- GPU recomendadas: A100 40GB o H100 para servir con contexto largo y batching; RTX 4090 (24 GB) para desarrollo e inferencia en fp16 con holgura; RTX 3090 (24 GB) equivalente.
- GPU de consumo: cabe en RTX 4070 Ti / 4080 (16 GB) en fp16 con contexto moderado, y en RTX 3060 12 GB o RTX 4060 Ti 16 GB en int8. En int4 puede ejecutarse en GPUs de 8 GB, con degradación de calidad no medida.
- Opciones de despliegue: `transformers` de forma nativa (es el formato publicado); vLLM y TGI para serving en fp16; llama.cpp u Ollama requieren conversión previa a GGUF, que no está publicada en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MaroskaOsama/smollm3-3b-sft-dpo-merged | 3,08B | no disponible | no disponible | safetensors en HF |
| SmolLM3-3B (base, HuggingFaceTB) | ~3B | no disponible en esta ficha | no disponible en esta ficha | safetensors en HF |
| Qwen2.5-3B-Instruct | ~3B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF en HF |
| Llama-3.2-3B-Instruct | ~3B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF en HF |

La comparación cuantitativa no es posible: no se dispone de benchmarks del checkpoint evaluado ni de datos verificados de contexto y licencia en la información proporcionada. La única diferencia objetiva y confirmada es el recuento de parámetros (3.075.098.624) y el tamaño del repositorio (6,2 GB).

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial ni para redistribución. Cualquier adopción en producción requiere contactar con el autor o asumir el riesgo legal.
- Model card vacía: todos los campos están sin rellenar; no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto. Esto impide auditar el modelo.
- Riesgo de alucinación: inherente a los modelos de 3B y no cuantificado en este checkpoint; sin evaluación, no puede acotarse.
- Idiomas no declarados: no se puede asumir buen rendimiento en castellano sin pruebas propias.
- Contexto desconocido: no se documenta la longitud de contexto soportada, lo que impide dimensionar el KV cache y planificar el despliegue.
- Procedencia del ajuste no verificada: la secuencia SFT → DPO → merge se infiere del nombre, no de documentación; los datos utilizados en el ajuste son desconocidos y podrían incluir contenido con derechos o sesgos no filtrados.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ en el repositorio, por lo que el despliegue en hardware limitado exige conversión manual.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura en los metadatos (2026-11-03): inconsistencia que conviene verificar antes de confiar en el resto de metadatos del repo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MaroskaOsama/smollm3-3b-sft-dpo-merged
- Referencia citada en los tags (calculadora de impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales asociados a este checkpoint concreto.
