# francesca9805/nld-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455

## Resumen

nld-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455 es un ajuste fino supervisado (SFT) del modelo monolingüe goldfish-models/nld_latn_10mb, un transformer decoder-only de tipo GPT-2 con 39.087.104 parámetros reales (unos 39 M). Lo publica el usuario francesca9805 y su ejecución de entrenamiento está registrada en Weights & Biases dentro del proyecto «new-tokenizers» del espacio de trabajo de la Universidad de Groningen, lo que sitúa el modelo en un contexto de experimentación académica y no de producto.

El identificador resume el experimento: modelo neerlandés (nld) en escritura latina, entrenado sobre un corpus de 10 MB, con secuencias empaquetadas (packed) y una semilla concreta (455) dentro de una batería de variantes. La model card es la generada automáticamente por TRL y no aporta información sobre el dataset, los hiperparámetros, la evaluación ni la licencia.

Su interés es, por tanto, metodológico y de reproducibilidad: sirve como línea base diminuta para estudiar el efecto del tokenizador, del empaquetado de secuencias y de la semilla en el ajuste fino de modelos de lenguas con pocos recursos. No es un modelo de propósito general ni está pensado para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (etiqueta `gpt2` en el repositorio; compatible con `GPT2LMHeadModel` de transformers) |
| Parámetros totales | 39.087.104 (dato real de los pesos safetensors) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (no declarada; la familia GPT-2 suele usar 1.024 tokens, dato no confirmado en este repositorio) |
| Tipos de cuantización | No disponible: solo se publican pesos safetensors; no hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No declarado en la model card; el modelo base es goldfish-models/nld_latn_10mb, correspondiente a neerlandés en escritura latina |
| Licencia | No disponible (la model card contiene un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (etiqueta del repositorio); también compatible con el ecosistema transformers |
| Modelo base | goldfish-models/nld_latn_10mb |
| Método de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Fecha de publicación | 22 de septiembre de 2026, según los metadatos del repositorio |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only clásico de la familia GPT-2, con 39.087.104 parámetros y sin innovaciones arquitectónicas documentadas: no hay mezcla de expertos (MoE), ni modelos de espacio de estados (SSM), ni atención lineal, ni decodificación especulativa. La model card no detalla el número de capas, la dimensión oculta, el número de cabezas de atención ni el vocabulario del tokenizador, por lo que esos datos quedan como no disponibles.

El ajuste se realizó con TRL 0.23.0 (SFTTrainer) sobre transformers 4.56.2, PyTorch 2.5.1+cu121, datasets 4.8.4 y tokenizers 0.22.1. El nombre del proyecto en Weights & Biases («new-tokenizers») y el sufijo del identificador (`ppt-Dp-10mb-packed-bfd_seed455`) apuntan a un experimento factorial sobre tokenizadores, preprocesado, empaquetado de secuencias y semilla. No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO ni ninguna fase de alineación posterior: se trata de un SFT puro sobre el corpus de 10 MB del modelo base.

## Capacidades

- Generación de texto autoregresiva mediante el pipeline `text-generation` de transformers.
- Formato conversacional: el ejemplo de la model card pasa una lista de mensajes con el rol `user`, lo que indica que el SFT utilizó un formato de instrucciones y que existe una plantilla de chat asociada, aunque no está documentada explícitamente.
- Capacidad multilingüe: no declarada; por el modelo base cabe esperar únicamente neerlandés, sin confirmación en la model card.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado y muy improbable dado el tamaño y los datos de entrenamiento.
- Math/razonamiento/código: no documentado; el corpus de 10 MB de texto general no permite esperar competencia en estas áreas.
- Visión, audio o modo «thinking»: no disponibles.
- Contexto largo: no disponible; no se documenta ninguna extensión de ventana ni técnicas de atención eficiente.
- Cuantización: no se ofrece ninguna variante cuantizada publicada.

## Casos de uso

- Investigación sobre tokenizadores: el experimento del que forma parte (proyecto «new-tokenizers») parece orientado a medir el efecto del tokenizador en el ajuste fino; este checkpoint concreto sirve como una de las variantes comparadas, con semilla fijada para reproducibilidad.
- Línea base en lenguas de bajos recursos: al ser un modelo de 39 M parámetros entrenado con 10 MB de texto neerlandés, permite medir cuánto aporta el ajuste fino frente al modelo base en tareas de generación, sin coste computacional apreciable.
- Pruebas de integración y humo (smoke tests) en pipelines de NLP: su tamaño (0,1 GB de repositorio) permite descargarlo, cargarlo y ejecutarlo dentro de un test de CI para verificar que un servicio de inferencia, un contenedor o un endpoint responden correctamente.
- Docencia y formación técnica: es un ejemplo real y ligero de ajuste fino con `SFTTrainer` de TRL, útil para explicar el flujo completo (dataset, empaquetado, semilla, registro en Weights & Biases) sin necesidad de GPU de gama alta.
- Sondas lingüísticas sobre representaciones: extraer los estados ocultos del modelo para analizar qué información morfológica o sintáctica del neerlandés retiene tras el ajuste, comparando con el modelo base.
- Validación de infraestructura de despliegue: sirve como banco de pruebas para TGI, vLLM u ONNX Runtime (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`) antes de desplegar modelos mayores con la misma configuración.
- Estudios de reproducibilidad por semilla: comparar este checkpoint (`seed455`) con las demás variantes del mismo experimento para cuantificar la varianza introducida por la semilla en un presupuesto de datos tan reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica (ni perplejidad, ni MMLU, ni tareas específicas de neerlandés) y los resultados de búsqueda web no devolvieron documentación técnica asociada al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del recuento de parámetros): unos 156 MB en fp32, unos 78 MB en fp16/bf16, unos 39 MB en int8 y unos 20 MB en int4. Con el overhead del runtime (activaciones, caché KV, framework), en la práctica cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: ninguna en concreto; cualquier GPU con más de 1 GB de VRAM es suficiente. Una RTX 3060, una RTX 4090 o una integrada moderna quedan sobredimensionadas. A100/H100 solo tendrían sentido para maximizar el throughput con lotes muy grandes, no para reducir la latencia de una única petición.
- Cabe en GPU de consumo: sí, en todas las gamas actuales e incluso en hardware integrado.
- Ejecución en CPU: totalmente viable, incluido hardware tipo Raspberry Pi 5; no requiere acelerador.
- Opciones de despliegue: `transformers` (pipeline), Text Generation Inference (etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM, ONNX Runtime. Para llama.cpp u Ollama haría falta convertir los pesos a GGUF, conversión que no está publicada.
- Latencia y throughput: no hay mediciones publicadas. Como estimación orientativa derivada del tamaño (no medida), en GPU la generación estaría limitada por el overhead de lanzamiento de kernels y podría alcanzar el orden de miles a decenas de miles de tokens por segundo con batching; en CPU de escritorio, el orden de decenas a pocos cientos de tokens por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Idioma | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|---|
| nld-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455 (este modelo) | 39,1 M | No disponible | Decoder-only GPT-2 ajustado con SFT | Neerlandés (presunto) | No disponible | Safetensors en HuggingFace, 0 descargas | No disponible |
| goldfish-models/nld_latn_10mb (modelo base) | 39,1 M (el ajuste fino no altera la forma de los pesos) | No disponible | Decoder-only GPT-2 monolingüe | Neerlandés | No disponible | HuggingFace | No disponible |
| openai-community/gpt2 | 124 M | 1.024 tokens | Decoder-only GPT-2 | Inglés | Licencia MIT modificada de OpenAI | Ampliamente disponible | No comparable (idioma y tarea distintos) |
| pdelobelle/robbert-v2-dutch-base | 116 M | 512 tokens | Encoder tipo RoBERTa | Neerlandés | MIT | HuggingFace | No disponible (tarea distinta: comprensión, no generación) |

Nota: los datos de los modelos comparativos proceden de conocimiento general y no se han podido verificar mediante la búsqueda web realizada para esta ficha. No existe ningún benchmark que permita comparar el rendimiento de este ajuste con el de las alternativas.

## Limitaciones y advertencias

- Corpus de entrenamiento mínimo: el identificador indica que el modelo base se entrenó con 10 MB de texto, por lo que el conocimiento del mundo, el vocabulario y la fluidez serán muy limitados incluso en neerlandés.
- Riesgo elevado de alucinación y de degeneración: en modelos de este tamaño son frecuentes las repeticiones, las incoherencias y las continuaciones plausibles pero falsas.
- Licencia sin declarar: la model card incluye un campo de licencia vacío, por lo que no puede asumirse ningún derecho de uso comercial. Cualquier uso en producción requiere aclarar primero la licencia con el autor.
- Idiomas: no se declara ningún idioma en los metadatos; el uso en castellano o en cualquier lengua distinta del neerlandés no está soportado ni evaluado.
- Longitud de contexto sin especificar: no se documenta la ventana máxima ni si el empaquetado durante el entrenamiento la modificó.
- Ausencia total de evaluación: no hay métricas publicadas, ni comparación con el modelo base, ni resultados de validación.
- Model card autogenerada: no describe el dataset, los hiperparámetros, el preprocesado ni el formato exacto de la plantilla de chat, lo que dificulta reproducir el ajuste.
- Sin validación por la comunidad: cero descargas y cero likes en el momento de redactar esta ficha; no hay informes de terceros sobre su comportamiento.
- No apto para producción: no debe usarse para atención al cliente, generación de contenido publicable ni ninguna tarea con usuarios reales sin una evaluación previa exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nld-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_10mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/yo8gveb2
- Cita de TRL (von Werra et al., 2020), incluida en la model card: `@misc{vonwerra2022trl, title = {{TRL: Transformer Reinforcement Learning}}, author = {Leandro von Werra and Younes Belkada and Lewis Tunstall and Edward Beeching and Tristan Thrush and Nathan Lambert and Shengyi Huang and Kashif Rasul and Quentin Gallou{\'e}dec}, year = 2020, journal = {GitHub repository}, publisher = {GitHub}, howpublished = {\url{https://github.com/huggingface/trl}}}`
- Búsqueda web: no se encontró ningún paper, blog, repositorio ni demo relacionados con este modelo. Los resultados devueltos por la búsqueda (portal inmobiliario sreality.cz) no guardan relación con el modelo y se han descartado.
