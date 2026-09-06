# alexkstern/nca_dose_100Mpt_hfinit_adamwppt_1B_s2_2026-09-06_13-08-54_878345-pt

## Resumen

El modelo `nca_dose_100Mpt_hfinit_adamwppt_1B_s2_2026-09-06_13-08-54_878345-pt` es un checkpoint experimental de tipo transformer desarrollado por Alex K Stern como parte de un proyecto de investigación sobre eficiencia en el pre-training. Está construido sobre la librería `nanochat` de Karpathy y sigue una arquitectura GPT estándar con 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024. La particularidad del modelo es su entrenamiento en dos fases: una primera fase de pre-training con 100 millones de tokens del dataset FineWeb (con vocabulario de 65536 tokens) y una segunda fase de post-pre-training con 1.000 millones de tokens de un dataset denominado `nca-paper-share20-2048` (con vocabulario reducido a 10004 tokens).

El objetivo del experimento, según la configuración y el nombre del proyecto (`token_dose_100Mpt_adamw_seed_replicas_v1`), es estudiar cómo afecta la cantidad de tokens o "dosis" en cada fase al rendimiento final del modelo. Se trata de un modelo de investigación, sin fine-tuning posterior, orientado a analizar la dinámica de transferencia entre fases de entrenamiento. El checkpoint se guardó en el paso 1525, con una pérdida de entrenamiento suavizada de 3.58 y un total de 2.08e17 FLOPs utilizados. No se han publicado resultados de benchmarks ni se ha documentado su uso en aplicaciones prácticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nanochat GPT) |
| Parametros totales | no disponible |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (state_dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar, tal como se implementa en la librería `nanochat`. La configuración del modelo base (`model_pt`) especifica 16 capas, 8 cabezas de atención (con 8 cabezas KV para atención agrupada), dimensión de embedding de 1024 y una secuencia máxima de 2048 tokens. El vocabulario de la fase de pre-training se amplía a 65536 tokens, mientras que el vocabulario de la fase de post-pre-training se reduce a 10004 tokens. El entrenamiento se divide en dos etapas claramente diferenciadas: primero se entrenan 100 millones de tokens con el dataset `fineweb-nanochatbpe-100M`, y después se continúa con 1.000 millones de tokens del dataset `nca-paper-share20-2048`. En la transición entre fases se reinicializan los embeddings y se resetea el optimizador, lo que sugiere un enfoque de "warm start" con reconfiguración del vocabulario. El optimizador utiliza tasas de aprendizaje diferenciadas para matrices, embeddings y unembeddings, con un esquema de learning rate trapezoidal (warmup y warmdown). No se menciona ningún proceso de RLHF, DPO ni alineación por preferencias. Se ha utilizado compilación del modelo (`compile_model: true`) y el entrenamiento se ejecutó en un hardware con un pico de 2250 TFLOPS, probablemente una GPU de centro de datos.

## Capacidades

- Generación de texto autoregresivo: el modelo puede producir texto en función de la distribución aprendida durante el pre-training y el post-pre-training, pero al ser un modelo base sin fine-tuning no está optimizado para seguir instrucciones.
- Modelado de lenguaje: es capaz de calcular probabilidades de secuencias y completar texto, aunque su calidad está limitada por su tamaño y la cantidad de tokens de entrenamiento.
- Investigación en eficiencia de entrenamiento: el modelo está diseñado como herramienta para estudiar el impacto de la dosis de tokens en el pre-training y post-pre-training, lo que permite analizar curvas de pérdida y dinámicas de transferencia.
- Soporte de tool calling / function calling: no disponible, no se ha implementado ni documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, el modelo no ha sido entrenado para tareas de agente.
- Capacidades multilingües: no disponible, no hay información sobre idiomas soportados; el dataset FineWeb es predominantemente inglés, pero no se confirma oficialmente.
- Capacidades especiales (visión, audio, thinking mode): no disponible, el modelo es puramente de texto.

## Casos de uso

- Investigación académica en eficiencia de pre-training: el modelo permite comparar el efecto de diferentes dosis de tokens entre fases. Un investigador podría reproducir el experimento con distintas semillas o configuraciones de `ppt_tokens` y `pt_tokens` para analizar la relación entre cantidad de datos y pérdida final.
- Reproducción de experimentos con nanochat: al estar construido sobre `nanochat`, sirve como referencia para validar implementaciones de entrenamiento en dos fases con reinicialización de embeddings y reseteo de optimizador. Se puede cargar el checkpoint y continuar el entrenamiento o evaluar la pérdida en datasets de validación.
- Estudio de transferencia entre vocabularios: el modelo cambia de un vocabulario de 65536 tokens a uno de 10004 tokens en la transición, lo que lo hace útil para investigar cómo afecta la reducción del vocabulario al rendimiento y a la velocidad de convergencia.
- Benchmark de modelos pequeños en tareas de lenguaje: aunque no hay benchmarks publicados, el modelo puede evaluarse en tareas estándar como perplexity en C4 o FineWeb con el fin de comparar la eficiencia de distintos presupuestos de tokens.
- Educación en NLP: sirve como ejemplo práctico de un modelo pequeño entrenado con dos fases de datos, útil para cursos o tutoriales sobre entrenamiento de transformers y gestión de vocabularios.
- Análisis de sesgos y alucinaciones en modelos base: al ser un modelo base sin alineación, puede utilizarse para estudiar los sesgos presentes en FineWeb y la tendencia a generar contenido no veraz, facilitando investigación sobre los límites de los modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de entrenamiento (pérdida suavizada, FLOPs utilizados, tiempo de entrenamiento) y no ofrece comparaciones con otros modelos en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Dado que el modelo tiene 16 capas y 1024 dimensiones de embedding, el número de parámetros se sitúa en el orden de los 100 millones, por lo que en FP16 ocuparía aproximadamente 200 MB, más el overhead de KV cache para secuencias de 2048 tokens. Esto lo hace viable en GPUs de consumo como RTX 3060 o superiores, pero no hay cifras oficiales.
- GPU recomendadas: no especificadas por el autor. Por su tamaño, cualquier GPU moderna con al menos 6 GB de VRAM debería poder ejecutarlo en inferencia.
- Si cabe en consumer GPU: sí, con holgura, aunque no se han publicado pruebas de rendimiento.
- Opciones de despliegue: el modelo se distribuye como checkpoint de PyTorch (`.pt`), por lo que puede cargarse directamente con `torch.load` y ejecutarse con el código de `nanochat`. No se ha documentado integración con vLLM, llama.cpp, Ollama ni TGI. Sería necesario convertir los pesos a formatos como GGUF o safetensors para usarlo con esas herramientas.
- Latencia y throughput: no disponible. No se han publicado mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nca_dose_100Mpt_hfinit_adamwppt_1B_s2 (este modelo) | Transformer GPT, 16 capas, emb 1024 | no disponible | 2048 | Apache 2.0 | HuggingFace, checkpoint .pt |
| nca_dose_100Mpt_hfinit_100M_s0_2026-08-14_21-54-08_049198-pt | Transformer GPT, 16 capas, emb 1024 | no disponible | 2048 | Apache 2.0 | HuggingFace, checkpoint .pt |
| nca_dose_100Mpt_hfinit_100M_s2_2026-08-14_22-07-48_627334-pt | Transformer GPT, 16 capas, emb 1024 | no disponible | 2048 | Apache 2.0 | HuggingFace, checkpoint .pt |

Los tres modelos pertenecen a la misma familia de experimentos con `nanochat` y comparten la misma configuración base, diferenciándose en la semilla y en la fecha de creación. No se dispone de comparaciones con modelos externos de tamaño similar, como GPT-2 pequeño o Pythia-160M, al no haber datos de benchmarks comunes en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental sin fine-tuning: no ha sido entrenado para seguir instrucciones ni para tareas de chat, por lo que su uso en aplicaciones interactivas es muy limitado.
- Riesgo de alucinación elevado: al ser un modelo base pequeño y con un presupuesto de entrenamiento relativamente bajo, es propenso a generar texto plausible pero incorrecto o incoherente.
- Sesgos del dataset: el pre-training se realizó con FineWeb, que es un dataset web masivo con sesgos conocidos de contenido en inglés, dominancia de textos occidentales y presencia de material de baja calidad. Estos sesgos se transfieren al modelo.
- Limitaciones de contexto: la ventana de contexto es de 2048 tokens, lo que impide manejar documentos largos o conversaciones extensas.
- Vocabulario reducido en la fase de post-pre-training: el vocabulario de 10004 tokens es notablemente pequeño, lo que puede limitar la capacidad de representar palabras raras o términos técnicos.
- Sin soporte para tool calling ni agentes: no se ha implementado ninguna interfaz de funciones ni razonamiento multi-paso, por lo que no es adecuado para sistemas que requieran interacción con herramientas.
- Licencia Apache 2.0: permite uso comercial, pero la calidad del modelo y la falta de documentación hacen que no sea recomendable para producción sin una evaluación exhaustiva previa.
- Formato de pesos no estándar: el checkpoint se distribuye como `.pt`, lo que dificulta su integración en frameworks de inferencia modernos que esperan safetensors o GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/nca_dose_100Mpt_hfinit_adamwppt_1B_s2_2026-09-06_13-08-54_878345-pt
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/ubenipru
- Repositorio nanochat: https://github.com/karpathy/nanochat
