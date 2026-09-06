# alexkstern/nca_dose_50Mpt_hfinit_adamwppt_200M_s1_2026-09-06_14-57-45_438788-pt

## Resumen

El modelo `nca_dose_50Mpt_hfinit_adamwppt_200M_s1_2026-09-06_14-57-45_438788-pt` es un modelo de lenguaje basado en transformer, desarrollado por alexkstern con la librería `nanochat` de Karpathy. Se trata de un experimento de investigación centrado en el estudio de la "token dose", es decir, la cantidad de tokens utilizados en las fases de preentrenamiento y postentrenamiento. El modelo se entrena en dos etapas: una fase de preentrenamiento (`pt`) con 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`, seguida de una fase adicional (`ppt`) con 200 millones de tokens del dataset `nca-paper-share200-2048`. El checkpoint publicado corresponde al paso 762 de un total de 1000 iteraciones.

La arquitectura es un transformer decoder-only con 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El modelo tiene una licencia Apache 2.0 y se distribuye en formato PyTorch `.pt`. Su relevancia radica en explorar el comportamiento de modelos pequeños con distintas proporciones de tokens de preentrenamiento y postentrenamiento, así como en servir como punto de referencia para la reproducción de experimentos con `nanochat`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) con 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensión de embedding 1024 |
| Parametros totales | no disponible (estimación aproximada a partir de la configuración: ~300M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP32 sin cuantizar) |
| Idiomas soportados | no disponible (el dataset principal es FineWeb, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar, similar al GPT-2 pero con configuración reducida. En la fase de preentrenamiento (`pt`) utiliza un vocabulario de 65536 tokens, mientras que en la fase de postentrenamiento (`ppt`) el vocabulario se reduce a 10004 tokens, con reinicialización del embedding en la transición y reinicio del optimizador. El entrenamiento se realiza con un optimizador AdamW que aplica learning rates diferenciados: 0.02 para las matrices, 0.3 para el embedding y 0.004 para el unembedding. El schedule de learning rate es trapezoidal, con un warmdown del 40% y sin warmup. El modelo se compila durante el entrenamiento (`compile_model: true`) y se registra con Weights & Biases.

Los datos de entrenamiento incluyen `fineweb-nanochatbpe-100M` para la fase `pt` y `nca-paper-share200-2048` para la fase `ppt`. Además, se utiliza `c4-nanochatbpe-10B` como conjunto de evaluación auxiliar. En el checkpoint publicado, la pérdida de entrenamiento suavizada es 4.224, y el total de FLOPs utilizados es aproximadamente 1.039e17. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto autoregresivo básico, dado que es un modelo de lenguaje estándar.
- Soporte de contexto de 2048 tokens, lo que permite procesar secuencias de longitud media.
- Capacidad de ajuste fino con pocos recursos debido a su tamaño reducido.
- Sin soporte de tool calling, function calling, agentes o razonamiento multi-paso documentado.
- Sin capacidades de visión, audio o multimodalidad.
- No se han publicado evaluaciones de capacidades multilingües; el entrenamiento se realizó principalmente con datos en inglés.

## Casos de uso

- Investigación en eficiencia de entrenamiento: permite estudiar el efecto de la token dose (50M pt + 200M ppt) en modelos pequeños y comparar resultados con otras configuraciones de la misma familia.
- Reproducción de experimentos con nanochat: sirve como checkpoint intermedio para validar pipelines de entrenamiento y verificar el comportamiento de la librería de Karpathy.
- Fine-tuning de bajo coste: al ser un modelo pequeño, se puede ajustar en una GPU de consumo para tareas específicas de texto sin necesidad de infraestructura costosa.
- Educación y docencia: útil para demostrar el funcionamiento interno de un transformer decoder-only y para realizar ejercicios de interpretabilidad.
- Prototipado rápido de aplicaciones de lenguaje: puede emplearse en entornos donde se requiere un modelo ligero para generar texto o completar secuencias con requisitos mínimos de hardware.
- Pruebas de despliegue local: sirve para experimentar con frameworks de inferencia como llama.cpp o vLLM, siempre que se convierta el formato de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos son métricas de entrenamiento del checkpoint:

| Metrica | Valor |
|---|---|
| step | 762 |
| smooth_train_loss | 4.22408390045166 |
| min_objective | 1.2372303108054246 |
| flops_used | 1.0389065468529869e+17 |
| total_training_time | 388.51972913742065 |

No se dispone de resultados en MMLU, HumanEval, GSM8K u otros conjuntos de evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de la configuración (16 capas, embedding 1024, vocabulario 65536), se estiman ~300M parámetros. En FP32, el modelo ocuparía aproximadamente 1.3 GB; en FP16, unos 650 MB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM. Modelos como NVIDIA GTX 1650, RTX 3050 o superiores pueden ejecutarlo sin problemas.
- Compatibilidad con GPU de consumo: sí, es un modelo pequeño que cabe en GPUs de gama baja e incluso en CPU con suficiente RAM.
- Opciones de despliegue: el formato nativo es PyTorch `.pt`, por lo que se puede cargar directamente con PyTorch. Para usar vLLM, llama.cpp u Ollama, sería necesario convertir los pesos a formatos compatibles (GGUF, safetensors, etc.).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Se han identificado dos modelos relacionados del mismo autor en HuggingFace, aunque no se dispone de sus especificaciones completas:

| Modelo | Tamaño (inferido del nombre) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nca_dose_50Mpt_hfinit_20M_s1_2026-08-15_00-27-50_481718-pt | 20M (probablemente tokens ppt) | 2048 | Apache 2.0 | HuggingFace |
| nca_dose_50Mpt_hfinit_adamwppt_200M_s1_2026-09-06_14-57-45_438788-pt | 200M (probablemente tokens ppt) | 2048 | Apache 2.0 | HuggingFace |
| nca_dose_50Mpt_hfinit_1B_s1_2026-08-15_01-26-21_188670-pt | 1B (probablemente tokens ppt) | 2048 | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparación se limita a la cantidad de tokens utilizados en la fase `ppt`, según los nombres de los repositorios.

## Limitaciones y advertencias

- Modelo experimental, no destinado a producción ni a aplicaciones críticas.
- El entrenamiento total es de solo 250 millones de tokens, una cantidad muy inferior a la de modelos de lenguaje modernos, lo que limita su calidad general.
- El checkpoint publicado está a mitad del entrenamiento (paso 762 de 1000), por lo que no representa un modelo final optimizado.
- No se han realizado evaluaciones de sesgos, alucinaciones o seguridad.
- El dataset principal es FineWeb, predominantemente en inglés, por lo que el rendimiento en otros idiomas probablemente sea deficiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de ningún tipo.
- El formato de pesos `.pt` puede no ser compatible con herramientas estándar sin conversión previa.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_adamwppt_200M_s1_2026-09-06_14-57-45_438788-pt
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/7k9se6dp
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Modelo relacionado (20M): https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_20M_s1_2026-08-15_00-27-50_481718-pt
- Modelo relacionado (1B): https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_1B_s1_2026-08-15_01-26-21_188670-pt
