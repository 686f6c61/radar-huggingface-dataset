# alexkstern/nca5M_pptnudge_hfbody_1Bpt_s0_2026-09-06_22-07-21_666372-pt

## Resumen

El modelo `nca5M_pptnudge_hfbody_1Bpt_s0_2026-09-06_22-07-21_666372-pt` es un modelo de lenguaje autoregresivo experimental desarrollado por alexkstern y entrenado con la biblioteca nanochat de Karpathy. Se trata de un transformer estándar con 16 capas, 8 cabezas de atención, 8 cabezas KV y 1024 dimensiones de embedding. El nombre del repositorio indica que el modelo fue pre-entrenado con 1.000 millones de tokens (1Bpt) y posteriormente sometido a un proceso de "nudge" (empujón) con 5 millones de tokens adicionales (5M) en una fase de post-entrenamiento (ppt).

La relevancia de este modelo radica en su carácter experimental: explora el cambio de vocabulario durante el entrenamiento, pasando de un vocabulario de 65.536 tokens (fase pt) a uno de 10.004 tokens (fase ppt), con reinicialización del embedding y reseteo del optimizador en la transición. El checkpoint disponible corresponde al paso 3.814 de entrenamiento, con una pérdida suavizada de 3,165. El modelo se distribuye bajo licencia Apache 2.0 y su repositorio ocupa 3,0 GB, lo que sugiere pesos en formato PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador autoregresivo (nanochat_gpt) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (state_dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer estándar, tal como se implementa en la biblioteca nanochat. La configuración de pre-entrenamiento (`model_pt`) define 16 capas, 8 cabezas de atención, 8 cabezas KV y 1024 dimensiones de embedding, con un vocabulario de 65.536 tokens. La configuración de post-entrenamiento (`model_ppt`) mantiene la misma estructura de capas y dimensiones, pero reduce el vocabulario a 10.004 tokens.

El proceso de entrenamiento consta de dos fases. La primera fase pre-entrena el modelo con 1.000 millones de tokens del dataset `fineweb-nanochatbpe-20B` (FineWeb tokenizado con el BPE de nanochat). La segunda fase, denominada "ppt" (post-pretraining), entrena el modelo con 5 millones de tokens del dataset `nca-paper-share200-2048`. En la transición entre fases se reinicializa el embedding, se resetea el optimizador y se cambia el vocabulario. La tasa de aprendizaje sigue un esquema trapezoidal, con un calentamiento (warmup) del 0% y un enfriamiento (warmdown) del 40% en la fase pt, y un enfriamiento del 80% en la fase ppt. No se menciona el uso de RLHF ni DPO. El checkpoint guardado corresponde al paso 3.814, con un total de 2,08e18 FLOPs utilizados y un tiempo de entrenamiento de 733,14 segundos.

## Capacidades

- Generación de texto autoregresiva con una ventana de contexto de 2048 tokens.
- Capacidad de completar texto y continuar secuencias, al ser un modelo de lenguaje estándar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- El modelo es un experimento de investigación para estudiar el efecto del cambio de vocabulario y el "nudge" durante el post-entrenamiento.

## Casos de uso

- Investigación en técnicas de post-entrenamiento: el modelo permite estudiar cómo afecta el cambio de vocabulario y la reinicialización del embedding al rendimiento de un modelo de lenguaje pequeño.
- Experimentación de "nudge" o ajuste fino de comportamiento: la fase ppt con el dataset `nca-paper-share200-2048` sugiere un enfoque para dirigir el comportamiento del modelo hacia un subconjunto específico de datos.
- Prototipado de modelos de lenguaje con recursos limitados: al ser un modelo con 16 capas y 1024 dimensiones de embedding, puede entrenarse y ejecutarse en hardware de consumo.
- Educación y divulgación sobre arquitecturas transformer: el modelo sirve como ejemplo práctico de entrenamiento con nanochat, una biblioteca minimalista para fines educativos.
- Fine-tuning adicional para tareas específicas: el checkpoint puede cargarse en PyTorch y ajustarse para tareas de generación de texto en dominios concretos.
- Evaluación de técnicas de optimización: el registro de métricas en W&B permite analizar la pérdida, los FLOPs y el tiempo de entrenamiento, útil para comparar configuraciones de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas documentadas son las de entrenamiento: pérdida suavizada de 3,165, objetivo mínimo de 0,944, FLOPs utilizados de 2,08e18 y FLOPs por token de 2.080.374.784. No se proporcionan resultados en MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 3,0 GB, lo que sugiere que los pesos en formato fp32 ocupan aproximadamente 3 GB. Para inferencia en fp32 se necesitaría al menos 4 GB de VRAM, o menos si se convierte a cuantización (no disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA RTX 3060, RTX 4060 o superior. En entornos de investigación, una A100 o H100 sería adecuada para reentrenar o hacer fine-tuning.
- Compatibilidad con GPU de consumo: sí, el modelo puede ejecutarse en GPUs de consumo de gama media, siempre que se cargue en fp32 o se cuantice.
- Opciones de despliegue: el checkpoint está en formato `.pt` (state_dict de PyTorch), por lo que puede cargarse directamente con PyTorch. No se proporcionan pesos en formato GGUF, ni soporte para vLLM, llama.cpp, Ollama o TGI. Para usar estos motores sería necesaria una conversión previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Autor | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nca5M_pptnudge_hfbody_1Bpt_s0 | alexkstern | no disponible | 2048 | Apache 2.0 | HuggingFace |
| nca_dose_50Mpt_hfbody_5M_s0 | alexkstern | no disponible | no disponible | no disponible | HuggingFace |
| nca_dose_1Bpt_hfbody_5M_s1 | alexkstern | no disponible | no disponible | no disponible | HuggingFace |

Los tres modelos pertenecen a la misma familia de experimentos del autor, con nombres que indican variaciones en el tamaño del pre-entrenamiento (50Mpt, 1Bpt) y el tipo de intervención (dose, nudge). No se dispone de información detallada sobre los parámetros, el contexto ni la licencia de los modelos comparados, salvo que están publicados en HuggingFace.

## Limitaciones y advertencias

- Modelo experimental sin benchmarks públicos: no se han publicado resultados en conjuntos de evaluación estándar, por lo que su calidad general es desconocida.
- Pre-entrenamiento limitado: solo 1.000 millones de tokens, una cantidad muy inferior a la de modelos de lenguaje modernos, lo que limita su capacidad de razonamiento y conocimiento general.
- Ventana de contexto reducida: 2048 tokens, insuficiente para tareas que requieren contexto largo.
- Vocabulario reducido en la fase ppt: 10.004 tokens, lo que puede limitar la diversidad de la generación y la cobertura de idiomas.
- Sin soporte documentado para tool calling, agentes ni razonamiento multi-paso: el modelo no está preparado para aplicaciones que requieran estas capacidades.
- Riesgo de alucinación: al ser un modelo pequeño con poco pre-entrenamiento, es probable que genere texto incoherente o factualmente incorrecto.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está listo para producción sin una evaluación y un fine-tuning adicionales.
- Formato de pesos limitado: solo se proporciona un checkpoint `.pt`, sin conversiones a formatos estándar como GGUF o Safetensors, lo que dificulta su integración en motores de inferencia populares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/nca5M_pptnudge_hfbody_1Bpt_s0_2026-09-06_22-07-21_666372-pt
- Registro de entrenamiento en W&B: https://wandb.ai/alexksternteam/ppt_nudge_probe_v0/runs/rar0mn2q
- Repositorio de nanochat: https://github.com/karpathy/nanochat
- Modelo relacionado del mismo autor: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_5M_s0_2026-08-14_17-26-27_448317-pt
- Modelo relacionado del mismo autor: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfbody_5M_s1_2026-08-14_05-39-21_493461-pt
