# PrimeNeural/Qwen3-0.6B-pnn-d100-int8-j31

## Resumen

Qwen3-0.6B-pnn-d100-int8-j31 es una conversión del modelo Qwen/Qwen3-0.6B de Alibaba Qwen a formato Prime Neural Network (PNN), realizada por PrimeNeural (PreciseStatistics GmbH). El modelo sustituye 197 capas lineales del transformer original por capas PNN con densidad del 100 %: cada salida lee un conjunto fijo y estructurado de entradas, con el mismo número de lecturas por salida y sin almacenar índices. Los pesos de esas capas están cuantizados a INT8 con una escala por fila de salida, mientras que las partes densas restantes se mantienen en bfloat16.

El objetivo es reducir el coste de almacenamiento y cómputo de un modelo pequeño manteniendo un comportamiento cercano al original: el autor reporta un 94,65 % de concordancia top-1 con Qwen3-0.6B en datos reservados. El repositorio ocupa 0,9 GB y contiene 752.128.384 parámetros según los safetensors publicados. La destilación se hizo con 1 época sobre HuggingFaceFW/fineweb-edu mediante inicialización por gather y matching de estados ocultos.

La relevancia práctica es limitada y muy específica: no es un modelo listo para `transformers` de forma estándar, sino un artefacto experimental que requiere el paquete PNN y el script `pnn_load.py` para reconstruir la arquitectura desde Qwen3-0.6B. Resulta útil para quienes investigan representaciones dispersas estructuradas, cuantización INT8 por fila o formatos alternativos de pesos, no como sustituto directo de un modelo de producción convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con 197 capas lineales sustituidas por capas PNN al 100 % de densidad |
| Parametros totales | 752.128.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-0.6B, no confirmada en la model card) |
| Tipos de cuantizacion | INT8 con una escala por fila de salida en capas PNN; bfloat16 en partes densas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3-0.6B) |
| Formato de pesos | safetensors (formato PNN; requiere `pnn_load.py` para cargar) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y reemplaza 197 de sus capas lineales por capas PNN. En una capa PNN al 100 % de densidad, cada salida lee un conjunto fijo y estructurado de entradas, con el mismo número de lecturas para todas las salidas y sin almacenar índices; esto elimina el coste de metadatos de máscaras dispersas y permite kernels especializados. Los pesos de estas capas se almacenan en INT8 con una escala por fila de salida, mientras que el resto de la red permanece en bfloat16.

El entrenamiento consistió en una época de destilación sobre HuggingFaceFW/fineweb-edu, con inicialización por gather y matching de estados ocultos contra el modelo original. No se documentan en la información disponible detalles sobre el número total de tokens, la composición exacta del dataset, ni si hubo RLHF o DPO. La innovación principal es el propio formato PNN y su kernel asociado, que el autor indica que ejecuta las capas más rápido en CPU y GPU NVIDIA que PyTorch estándar, aunque no se aportan cifras de throughput.

## Capacidades

- Generación de texto autoregresiva heredada de Qwen3-0.6B, con concordancia top-1 del 94,65 % respecto al original en datos reservados.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 0,6 B del modelo base.
- Generación de código y matemáticas a nivel de modelo pequeño, sin garantías de calidad más allá de lo que ofrece Qwen3-0.6B.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card; depende del tokenizador y plantilla del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no documentados; el modelo base Qwen3-0.6B es solo texto.

## Casos de uso

- Investigación en representaciones dispersas estructuradas: el modelo sirve para estudiar cómo afecta sustituir capas lineales por capas PNN al 100 % de densidad en un transformer pequeño, comparando la concordancia top-1 con el original.
- Evaluación de cuantización INT8 por fila: permite medir la degradación de un modelo de 0,6 B al cuantizar solo las capas PNN y mantener el resto en bfloat16, con un artefacto de 911 MB.
- Prototipado de kernels PNN: útil para validar el rendimiento del paquete PNN en CPU y GPU NVIDIA frente a PyTorch estándar en un modelo de tamaño manejable.
- Experimentos de destilación con fineweb-edu: la receta de una época con matching de estados ocultos sirve como referencia para reproducir o variar el proceso en otros modelos pequeños.
- Despliegue en entornos con memoria muy limitada: con 0,9 GB de repositorio y pesos INT8, puede caber en GPUs de gama baja o incluso CPU, siempre que se acepte la dependencia del paquete PNN.
- Benchmarking de formatos alternativos de pesos: comparar el formato PNN con safetensors estándar, GGUF o cuantizaciones de llama.cpp en términos de tamaño, velocidad de carga y latencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Concordancia top-1 con Qwen/Qwen3-0.6B (datos reservados) | 94,65 % |
| Epocas de destilacion | 1 |
| Dataset de destilacion | HuggingFaceFW/fineweb-edu |
| Tamano del archivo de modelo | 911,41 MB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1-2 GB en INT8 para los pesos PNN, más overhead de activaciones y del runtime de PyTorch; no se proporcionan cifras oficiales.
- GPU recomendadas: no especificadas por el autor; el paquete PNN incluye kernels para CPU y GPU NVIDIA, por lo que se espera soporte en A100, H100 y RTX 4090, sin datos de rendimiento.
- Cabe en GPU de consumo: sí, por tamaño (0,9 GB de repositorio), aunque la compatibilidad real depende del paquete PNN y no de llama.cpp u Ollama.
- Opciones de despliegue: `pnn_load.py` con PyTorch y el paquete PNN; el autor menciona primeneural.net como endpoint de inferencia. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor afirma que el kernel PNN es más rápido que PyTorch estándar en CPU y GPU NVIDIA, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PrimeNeural/Qwen3-0.6B-pnn-d100-int8-j31 | 752.128.384 | no disponible | apache-2.0 | safetensors PNN + `pnn_load.py` | Requiere paquete PNN; 94,65 % concordancia top-1 con el original |
| Qwen/Qwen3-0.6B | no disponible en la informacion proporcionada | no disponible | apache-2.0 | safetensors | Modelo base original, cargable con `transformers` estándar |
| Otros modelos de ~0,6 B (p. ej. variantes pequenas de Llama o Gemma) | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- No es cargable con `AutoModelForCausalLM.from_pretrained` de forma directa: requiere `pnn_load.py` y el paquete PNN en el path de Python.
- El paquete PNN se licencia por separado (licencia de evaluación vía info@primeneural.net), lo que condiciona el uso comercial aunque los pesos sean apache-2.0.
- La licencia apache-2.0 aplica a los pesos derivados de Qwen3-0.6B; el formato PNN, `pnn_load.py` y el paquete son propiedad de PreciseStatistics GmbH y tienen patente pendiente (US 19/685,168).
- Concordancia top-1 del 94,65 % implica que aproximadamente 1 de cada 20 predicciones difiere del original, con posible degradación acumulada en generaciones largas.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma en la información proporcionada; se heredan los del modelo base Qwen3-0.6B.
- Contexto máximo no confirmado en la model card; no asumir la ventana de Qwen3-0.6B sin verificarla.
- Sin descargas ni likes en el momento de la consulta, y creado en 2026: ecosistema y soporte comunitario inexistentes.
- No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que limita su integración en pipelines de producción convencionales.

## Enlaces

- Hugging Face: https://huggingface.co/PrimeNeural/Qwen3-0.6B-pnn-d100-int8-j31
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Prime Neural Networks: https://primeneural.net
- Dataset de destilación: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Contacto para licencia del paquete PNN: info@primeneural.net
