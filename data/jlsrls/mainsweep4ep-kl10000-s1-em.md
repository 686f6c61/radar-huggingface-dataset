# jlsrls/mainsweep4ep-kl10000-s1-em

## Resumen

`jlsrls/mainsweep4ep-kl10000-s1-em` es un ajuste fino (SFT) del modelo `unsloth/Llama-3.2-1B-Instruct`, publicado por el usuario `jlsrls` en HuggingFace. Se trata, por tanto, de un transformer decoder-only de aproximadamente 1.240 millones de parámetros con una ventana de contexto nominal de 128.000 tokens heredada del modelo base de Meta. El entrenamiento se realizó con la librería TRL (versión 0.24.0) y el pipeline de Unsloth, según se deduce de las etiquetas del repositorio (`sft`, `trl`, `unsloth`, `generated_from_trainer`).

El nombre del modelo apunta a un experimento de barrido (sweep) con regularización KL de peso 10.000, coherente con el proyecto de Weights & Biases asociado, denominado `clarifying-em`, alojado en la organización de la Portland State University. Existen repositorios hermanos del mismo autor (`mainsweep-kl10000-s1-em`, `mainsweep4ep-kl10000-s1-logitrl`), lo que sugiere una campaña de experimentos comparando configuraciones de entrenamiento y funciones de recompensa o regularización, más que un modelo pensado para producción.

Su relevancia es fundamentalmente investigadora: es un artefacto de bajo coste computacional (el repositorio ocupa 2,3 GB) útil para reproducir experimentos de ajuste fino con TRL, comparar variantes de un mismo barrido y servir como punto de partida para experimentos docentes o de ablación en una única GPU de consumo. No cuenta con descargas ni valoraciones, no publica resultados de benchmarks y su licencia no está declarada explícitamente en la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) con RMSNorm pre-normalización, RoPE, SwiGLU y atención con GQA (datos heredados del modelo base) |
| Parámetros totales | ~1.240 millones (heredado del modelo base) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens (nominal, heredado del modelo base) |
| Tipos de cuantización | No disponible en el repositorio (solo pesos safetensors); al derivar de Llama 3.2 1B es compatible con las cuantizaciones GGUF/AWQ/GPTQ generadas por la comunidad, pero no se han publicado para este checkpoint |
| Idiomas soportados | No disponible en la ficha del autor; el modelo base declara inglés, alemán, francés, hindi, italiano, portugués, español y tailandés |
| Licencia | No disponible (el campo del repositorio contiene literalmente "licence: license"; el modelo base se distribuye bajo Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Librería | transformers |
| Etiquetas | transformers, safetensors, generated_from_trainer, unsloth, sft, trl, endpoints_compatible |
| Modelo base | unsloth/Llama-3.2-1B-Instruct |
| Tamaño del repositorio | 2,3 GB |
| Versiones de framework | TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0, Tokenizers 0.22.2 |
| Fecha de publicación | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente a la del modelo base: un transformer decoder-only autorregresivo de la familia Llama 3.2, con normalización RMSNorm aplicada antes de cada subcapa, embeddings rotatorios (RoPE) para la codificación posicional, activación SwiGLU en las capas feed-forward y atención con consultas agrupadas (GQA), que reduce el número de cabezas de clave/valor respecto a las cabezas de consulta. El vocabulario del tokenizador es de 128.256 entradas, propio de la serie Llama 3. El modelo base Llama 3.2 1B se obtuvo por poda (pruning) y destilación a partir de Llama 3.1 8B, con aproximadamente 9 billones de tokens de entrenamiento y una fecha de corte de conocimiento en diciembre de 2023. No se ha modificado la arquitectura en este ajuste fino.

El entrenamiento de este checkpoint se realizó mediante supervisión directa (SFT) con TRL 0.24.0 sobre el pipeline de Unsloth, según la model card. El nombre del modelo indica una penalización KL con coeficiente 10.000 y cuatro épocas (`4ep`), dentro de un barrido experimental denominado `mainsweep`. La model card no especifica el número de tokens de entrenamiento, la composición del conjunto de datos, la proporción de ejemplos de cada tarea ni si se aplicaron etapas posteriores de DPO o RLHF. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de Unsloth para acelerar el ajuste. Los detalles del run están registrados en Weights & Biases bajo el proyecto `clarifying-em`, al que apunta el enlace de la model card, pero su contenido no está resumido en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base instruct y potencialmente ajustada por el SFT.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño de 1.240 millones de parámetros.
- Generación de código sencillo y tareas de edición de texto a pequeña escala, sin garantías de calidad en proyectos grandes.
- Aritmética elemental y resolución de problemas matemáticos simples, sin cadena de pensamiento explícita documentada.
- Soporte de plantillas de chat mediante el tokenizador de Llama 3.2, tal y como muestra el ejemplo de la model card con `pipeline` y mensajes con rol `user`.
- Compatibilidad declarada con endpoints de HuggingFace (etiqueta `endpoints_compatible`), lo que permite desplegarlo mediante Inference Endpoints.
- Capacidades multilingües no verificadas para este checkpoint; las del modelo base incluyen ocho idiomas declarados por Meta.
- No se documenta soporte explícito de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Investigación en generación de preguntas de clarificación: el proyecto de Weights & Biases asociado se denomina `clarifying-em`, por lo que el modelo parece entrenado para producir respuestas o preguntas aclaratorias en diálogo; puede emplearse como punto de partida para reproducir y comparar ese experimento frente a los checkpoints hermanos del mismo barrido.
- Ablación de hiperparámetros de SFT: al existir variantes como `mainsweep-kl10000-s1-em` y `mainsweep4ep-kl10000-s1-logitrl`, este checkpoint sirve para aislar el efecto del coeficiente KL y del número de épocas sobre la calidad de las respuestas.
- Prototipado de asistentes conversacionales en local: con 1.240 millones de parámetros cabe en una GPU de consumo y permite iterar sobre prompts y plantillas de chat sin coste de API.
- Destilación y ajuste fino posterior: su tamaño reducido lo hace adecuado como modelo alumno en experimentos de destilación o como base para un LoRA específico de dominio antes de escalar a modelos mayores.
- Docencia y prácticas de posgrado: sirve para ilustrar el ciclo completo de un ajuste fino con TRL y Unsloth, incluyendo registro de métricas en Weights & Biases, en un entorno de cómputo asequible.
- Pruebas de integración de infraestructura: útil para validar pipelines de despliegue (vLLM, TGI, Ollama) y medir latencia antes de migrar a checkpoints de mayor tamaño.
- Clasificación y etiquetado ligero de texto: tareas de extracción de entidades o categorización de baja complejidad donde la latencia importa más que la calidad máxima, siempre que se valide el comportamiento real del modelo en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K ni ningún otro conjunto), y la información de búsqueda no aporta resultados cuantitativos para este checkpoint ni para el modelo base en el contexto de este ajuste. Cualquier cifra que se quisiera usar debería obtenerse mediante una evaluación propia.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 2,5 GB de pesos más la caché KV. Para la ventana completa de 128.000 tokens, la caché KV en fp16 ronda los 4,3 GB adicionales (32 KB por token), por lo que conviene reducir el contexto efectivo en despliegues con poca memoria.
- VRAM en cuantización de 8 bits: alrededor de 1,3 GB de pesos. En cuantización de 4 bits: entre 0,8 y 1 GB, aunque estas cuantizaciones no vienen publicadas en el repositorio y habría que generarlas.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM es suficiente para contextos moderados; RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, L4 y A10 funcionan sin problema. Para servir la ventana completa de 128.000 tokens con varios usuarios concurrentes son preferibles A100 40 GB o H100.
- Cabe holgadamente en GPU de consumo: es uno de los casos en los que una GTX 1660 con 6 GB, una RTX 3050 8 GB o incluso una CPU moderna con 8 GB de RAM pueden ejecutar el modelo cuantizado a 4 bits.
- Opciones de despliegue: al ser un checkpoint en safetensors de transformers, es compatible con vLLM, Text Generation Inference (TGI), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), Ollama y llama.cpp previa conversión a GGUF, y con el pipeline estándar de transformers mostrado en la model card.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks públicos |
|---|---|---|---|---|---|
| jlsrls/mainsweep4ep-kl10000-s1-em | ~1,24 B | 128.000 tokens (heredado) | No disponible | HuggingFace, 0 descargas | No publicados |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | Publicados por Meta |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens | Apache 2.0 | HuggingFace | Publicados por Alibaba |
| google/gemma-2-2b-it | ~2,6 B | 8.192 tokens | Gemma Terms of Use | HuggingFace | Publicados por Google |

La comparación directa de rendimiento no es posible porque este checkpoint no publica métricas. Frente a sus alternativas, sus principales diferencias son la ausencia de una licencia declarada con claridad, la falta de evaluación publicada y su naturaleza de artefacto de investigación dentro de un barrido, en contraste con modelos con model card completa, licencia explícita y resultados verificables. Su ventaja relativa es el contexto nominal de 128.000 tokens frente a los 32.768 de Qwen2.5-1.5B y los 8.192 de Gemma 2 2B.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste fino haya mejorado al modelo base en ninguna tarea; podría incluso degradarlo en capacidades generales por sobreajuste al conjunto de SFT.
- Conjunto de datos no documentado: la model card no describe la composición, el tamaño ni la procedencia de los datos de entrenamiento, lo que impide evaluar sesgos, contaminación de benchmarks o cobertura idiomática.
- Licencia ambigua: el campo de licencia contiene literalmente la palabra "license" y la ficha no la concreta. Al derivar de Llama 3.2, se heredan las restricciones de la Llama 3.2 Community License, incluida la cláusula de uso aceptable y las obligaciones de atribución. Se recomienda aclarar la licencia con el autor antes de cualquier uso comercial.
- Riesgo elevado de alucinación: con 1.240 millones de parámetros, el modelo base ya presenta una tasa alta de invención de hechos, cifras y referencias, y el ajuste fino no corrige ese comportamiento salvo que se haya entrenado explícitamente para ello, cosa que no se documenta.
- Contexto efectivo limitado: aunque la ventana nominal sea de 128.000 tokens, los modelos de esta escala suelen degradarse mucho antes de alcanzar ese límite; no hay evaluación de recuperación en contextos largos.
- Idiomas: no se declara el soporte multilingüe de este checkpoint. El rendimiento en castellano puede ser inferior al del modelo base o haberse degradado si el SFT se realizó íntegramente en inglés.
- Sesgos: no se ha publicado ningún análisis de sesgo, toxicidad o sesgo de género, raza o religión. Al proceder de un corpus web a gran escala, es previsible que reproduzca estereotipos presentes en los datos.
- Madurez: cero descargas y cero valoraciones, fecha de publicación de 2026 y ausencia de mantenimiento documentado. No se recomienda su uso en producción sin una validación exhaustiva propia.
- Sin soporte declarado de tool calling ni de agentes: si el caso de uso requiere llamadas a funciones o razonamiento multi-paso, este checkpoint no ofrece garantías.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jlsrls/mainsweep4ep-kl10000-s1-em
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Checkpoint hermano (variante sin `4ep`): https://huggingface.co/jlsrls/mainsweep-kl10000-s1-em
- Checkpoint hermano con reward de logits: https://huggingface.co/jlsrls/mainsweep4ep-kl10000-s1-logitrl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/rezvani-portland-state-university/clarifying-em/runs/owz7ym1b
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Llama 3.2 de Meta: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
