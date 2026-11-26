# ipz231msye/qwen3-0.6b-story-elements-lora

## Resumen

El modelo `ipz231msye/qwen3-0.6b-story-elements-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante supervisión fina (SFT) sobre el modelo base `Qwen/Qwen3-0.6B`, desarrollado por el usuario de Hugging Face `ipz231msye` en el marco de un experimento universitario de ajuste fino. Su propósito es muy específico: extraer cinco elementos literarios (personajes, tiempo del relato, lugar, conflicto central y tema) de relatos cortos en inglés y devolverlos estructurados como un objeto JSON.

El adaptador no modifica los pesos del modelo base; se aplica sobre él mediante la librería PEFT. Con solo 120 pasos de entrenamiento y un rango LoRA de 16, el ajuste consigue transformar la salida del Qwen3-0.6B en un formato JSON limpio y consistente (del 0 % al 100 % de tasa de JSON limpio), manteniendo una precisión de esquema del 100 %. Es un ejemplo paradigmático de cómo un modelo pequeño (0,6 mil millones de parámetros) puede especializarse en una tarea de extracción de información con recursos mínimos.

Su relevancia radica en que demuestra que el ajuste fino con LoRA sobre modelos ligeros es suficiente para tareas de análisis literario estructurado, con un coste computacional ínfimo (una NVIDIA T4 y menos de siete minutos de entrenamiento). No obstante, su alcance es limitado: solo funciona en inglés, sobre relatos cortos y con un prompt de instrucción que especifique los cinco campos JSON.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,6 mil millones (modelo base Qwen3-0.6B); el adaptador LoRA añade un número no disponible de parámetros |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usó secuencias de hasta 1536 tokens) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA para PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-0.6B`, un transformer decoder-only de la familia Qwen3. El ajuste fino se realizó con SFT y LoRA de rango 16, alpha 32 y dropout 0,05, con una tasa de aprendizaje de 2e-4, tamaño de lote efectivo 4 y una longitud máxima de secuencia de 1536 tokens. El entrenamiento se llevó a cabo en una NVIDIA T4 (Google Colab) durante aproximadamente 379 segundos y 120 pasos.

El conjunto de datos utilizado es `agentlans/stories-elements`, en su configuración `claude-few-shot`, distribuido bajo licencia CC BY 4.0. Tras filtrar por longitud de secuencia, se dispuso de 7.558 ejemplos para el ajuste fino supervisado. El dataset contiene relatos cortos en inglés anotados con los cinco elementos literarios que el adaptador debe extraer. No se menciona el uso de RLHF ni DPO; el entrenamiento es exclusivamente supervisado.

## Capacidades

- Extracción estructurada de cinco elementos literarios de relatos cortos en inglés: `characters`, `setting_time`, `setting_place`, `plot_conflict` y `theme`.
- Generación de salida en formato JSON consistente y válido (100 % de tasa de JSON limpio y válido tras el ajuste).
- Análisis literario automatizado de narrativa breve en inglés.
- Generación de texto condicionada por un prompt de instrucción que especifique los campos JSON requeridos.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode) en la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Análisis automatizado de corpus de relatos cortos: el adaptador permite procesar grandes volúmenes de narrativa breve en inglés y extraer sistemáticamente personajes, escenario, conflicto y tema para su posterior análisis estadístico o de tendencias.
- Enriquecimiento de metadatos en bibliotecas digitales: se puede integrar en un pipeline que, dado un relato, genere automáticamente campos estructurados (personajes, lugar, tiempo, tema) para mejorar la búsqueda y la catalogación.
- Herramientas educativas de análisis literario: el modelo puede servir como asistente para estudiantes que necesiten descomponer un relato en sus elementos constitutivos, devolviendo un JSON que luego se presente en una interfaz.
- Preprocesamiento para sistemas de recomendación literaria: los elementos extraídos (tema, conflicto, personajes) pueden alimentar un motor de recomendación basado en contenido para sugerir relatos similares.
- Generación de resúmenes estructurados para editoriales o plataformas de publicación: el adaptador produce fichas de análisis listas para su revisión humana, reduciendo el trabajo manual de clasificación.
- Investigación en humanidades digitales: permite realizar estudios a escala sobre la evolución de temas, tipos de conflicto o representación de personajes en corpus de narrativa corta en inglés, con una salida JSON directamente analizable.
- Prototipado rápido de tareas de extracción de información: al ser un adaptador LoRA sobre un modelo de 0,6 B, se puede desplegar en entornos con recursos limitados (por ejemplo, una GPU T4 o incluso CPU con cuantización) para validar pipelines de extracción antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el modelo base sin ajustar con el adaptador, evaluados sobre un subconjunto fijo de 100 relatos de test no vistos, con prompts y ajustes de generación idénticos.

| Métrica | Antes del ajuste | Después del ajuste |
|---|---:|---:|
| Tasa de JSON limpio | 0,00 % | 100,00 % |
| Tasa de JSON válido | 100,00 % | 100,00 % |
| Precisión de esquema | 100,00 % | 100,00 % |
| F1 de personajes | 61,20 % | 65,81 % |
| ROUGE-L F1 | 26,29 % | 37,63 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-0.6B en precisión FP16 requiere aproximadamente 1,2 GB de VRAM; en cuantización de 8 bits, alrededor de 0,6 GB; en 4 bits, alrededor de 0,3 GB. El adaptador LoRA añade una cantidad marginal de memoria (no disponible con precisión).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16. Una NVIDIA T4 (16 GB) es más que suficiente; también funciona en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, etc.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con 2 GB o más de VRAM, e incluso en CPU con cuantización.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base), Hugging Face Transformers, vLLM (con soporte de adaptadores LoRA), llama.cpp (si se convierte el modelo base a GGUF y se aplica el adaptador), Ollama (mediante conversión a GGUF con el adaptador fusionado), TGI (con soporte de adaptadores).
- Latencia y throughput estimados: no disponibles en la información proporcionada. El entrenamiento en una T4 durante 379 segundos para 120 pasos sugiere una velocidad de entrenamiento modesta, pero no se proporcionan métricas de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. Se puede establecer una comparación conceptual con el modelo base sin ajustar y con otros adaptadores LoRA para extracción de información, pero no se han publicado datos de rendimiento de alternativas en la documentación disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3-0.6b-story-elements-lora (este modelo) | 0,6 B (base) + LoRA | No disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base sin ajustar) | 0,6 B | No disponible | Apache 2.0 | Hugging Face |
| Alternativas de extracción de información | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El adaptador puede cometer errores al identificar personajes, incluyendo entradas duplicadas o tratar objetos como personajes.
- La coincidencia de nombres de personajes y la métrica ROUGE-L son sensibles a diferencias de redacción, por lo que las puntuaciones automáticas no siempre reflejan la corrección semántica.
- La evaluación en cinco prompts de propósito general produjo resultados mixtos; las mejoras en la tarea de análisis literario no garantizan mejoras en la capacidad de razonamiento general.
- El modelo está entrenado exclusivamente para relatos cortos en inglés; no se ha validado su rendimiento en otros idiomas ni en textos largos.
- Requiere un prompt de instrucción que especifique los cinco campos JSON; sin él, el comportamiento no está garantizado.
- Solo se distribuye el adaptador LoRA, no los pesos completos; es necesario cargar el modelo base Qwen/Qwen3-0.6B por separado.
- La licencia Apache 2.0 permite uso comercial, pero el dataset subyacente tiene licencia CC BY 4.0, que requiere atribución.
- El tamaño del repositorio es de 0,0 GB, lo que sugiere que el adaptador es muy pequeño, pero no se detalla el número exacto de parámetros del adaptador.
- No se han publicado resultados de benchmarks estándar ni métricas de latencia/throughput, lo que limita la evaluación comparativa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ipz231msye/qwen3-0.6b-story-elements-lora)
- [Modelo base Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [Dataset agentlans/stories-elements](https://huggingface.co/datasets/agentlans/stories-elements)
- [Documentación de PEFT](https://huggingface.co/docs/peft)
