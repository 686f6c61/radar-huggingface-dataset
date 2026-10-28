# kothasuhas/infinite_compute_distillation

## Resumen

`kothasuhas/infinite_compute_distillation` es un artefacto de investigación publicado en HuggingFace que contiene un modelo profesor (teacher) y 170 checkpoints estudiantes destilados, todos con arquitectura Llama de 8 capas y 34.611.712 parámetros. No es un modelo de propósito general ni un asistente conversacional: es un conjunto de pesos diseñado para estudiar métodos de destilación de conocimiento y optimizadores bajo distintos horizontes de entrenamiento. El profesor se entrenó desde cero sobre 614,4M de tokens del corpus DCLM con una longitud de contexto de 16 tokens, y los estudiantes replican exactamente su arquitectura.

El interés del repositorio reside en su carácter reproducible y sistemático: cada checkpoint incluye los pesos FP32 originales, la configuración, el tokenizador SentencePiece de 4096 tokens y métricas medidas (NLL de ajuste y KL en test retenido) registradas en un `model_index.json` con hashes SHA256 y procedencia de datos. Los estudiantes se agrupan por método de optimización (adamh, adamw en varias variantes con semillas y batch sizes distintos, muonh) y por horizonte de entrenamiento.

Es relevante para investigadores que trabajen en destilación, análisis de optimizadores o reproducibilidad de experimentos a pequeña escala, no para aplicaciones de producción. El tamaño de contexto de 16 tokens y la ausencia de ajuste por instrucciones limitan drásticamente cualquier uso fuera del entorno de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (8 capas, d_model 512, MLP 1792, 8 cabezas, dimensión de cabeza 64, embeddings no atados, sin QK norm) |
| Parametros totales | 34.611.712 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en FP32, autocast BF16 durante entrenamiento e inferencia) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo Llama con 8 capas, anchura de 512, MLP de 1792, 8 cabezas de atención con dimensión 64, embeddings de entrada y salida no atados y sin normalización QK. El profesor se entrenó desde cero sobre 614,4M de tokens de payload del dataset DCLM, con pesos en FP32 y autocast BF16, y una ventana de contexto de 16 tokens. El tokenizador asociado es un SentencePiece de 4096 tokens cuya fuente (`Ryukijano/parameter-golf-sp4096`) está fijada al commit `23dbd5ab0fcc1edfd25eedf1ae9d41a5d8b6b233`, con bytes verificados contra la caché original usada en la preparación de DCLM.

La parte de destilación consiste en 170 checkpoints estudiantes entrenados para replicar al profesor bajo distintos regímenes: métodos adamh (32 checkpoints), adamw_bs1024 (25), adamw_logits_from_teacher (13), adamw_logits_seed42 (25), adamw_seed123 (25), adamw_seed42 (25) y muonh (25), más el propio profesor. La selección del "mejor" checkpoint por método se realiza con la NLL de la muestra completa de ajuste en cada horizonte, y las métricas reportadas incluyen NLL de ajuste y KL en test retenido. El índice `model_index.json` documenta rutas, procedencia de modelo y datos, SHA256 de ficheros, horizonte, learning rate, semilla y métricas. El hash SHA256 de los pesos del profesor es `1337eaec061a873932eaa6de968aa113f221334dd6c3de56d6f09006f06387fe`.

## Capacidades

- Modelado de lenguaje autorregresivo a nivel de investigación, con contexto efectivo de 16 tokens.
- Generación de texto muy limitada, útil únicamente como sujeto de experimentos de destilación y evaluación de NLL/KL.
- Reproducción exacta de experimentos gracias a pesos FP32, hashes SHA256 y configuración versionada.
- Comparación controlada entre optimizadores (adamh, adamw con distintas semillas y batch sizes, muonh) bajo un mismo profesor.
- Análisis de horizontes de entrenamiento y de la evolución de métricas de destilación por checkpoint.
- No soporta tool calling, function calling ni agentes.
- No es un modelo ajustado por instrucciones ni de chat.
- Capacidades multilingües: no documentadas.
- Sin modo thinking, visión ni audio.

## Casos de uso

- Investigación en destilación de conocimiento: usar el profesor y los 170 estudiantes para medir cómo varía la KL en test retenido según método y horizonte, con métricas ya registradas en `model_index.json`.
- Estudio comparativo de optimizadores: los grupos adamh, adamw (varias semillas y batch size) y muonh permiten aislar el efecto del optimizador manteniendo fija la arquitectura y los datos.
- Reproducibilidad de experimentos: el repositorio incluye hashes de pesos y tokenizador, procedencia de datos y scripts de descarga verificada (`scripts.fetch_teacher`, `scripts.fetch_models`), lo que permite replicar exactamente un checkpoint concreto.
- Docencia y formación: el tamaño reducido (34,6M de parámetros, ~138 MB por checkpoint en FP32) permite ejecutar el modelo en un portátil y examinar el efecto de la destilación paso a paso.
- Análisis de sensibilidad a semillas: las variantes `adamw_seed42`, `adamw_seed123` y `adamw_logits_seed42` permiten estudiar la varianza entre ejecuciones sobre el mismo corpus DCLM.
- Auditoría de artefactos de investigación: verificar la integridad de pesos y tokenizador mediante los SHA256 publicados y comprobar que los bytes del SentencePiece coinciden con la fuente fijada.
- Desarrollo de metodología de evaluación: emplear las métricas NLL/KL por horizonte como banco de pruebas para diseñar protocolos de selección de checkpoints en destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El repositorio incluye métricas propias del experimento de destilación (NLL de ajuste y KL en test retenido por checkpoint) registradas en `model_index.json`, pero sus valores numéricos no se proporcionan en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Un checkpoint FP32 de 34.611.712 parámetros ocupa aproximadamente 138 MB; en BF16, unos 69 MB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) o incluso CPU. No requiere A100 ni H100.
- Cabe holgadamente en GPU consumer y en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `AutoTokenizer` (el profesor en la raíz del repo; los estudiantes con `subfolder="students/<method>/<run>"`). La model card indica que la generación de muestra en el código de investigación usa el bucle nativo de PyTorch, sin generación de HF ni de vLLM. Soporte para llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponibles. Por el tamaño (34,6M de parámetros y contexto de 16 tokens), la latencia esperada es muy baja, pero no se aportan cifras.
- El repositorio completo ocupa 23,7 GB debido a los 170 checkpoints en FP32; para inferencia solo es necesario descargar el subdirectorio correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kothasuhas/infinite_compute_distillation | 34,6M | 16 tokens | Investigación en destilación | no disponible | HuggingFace |
| GPT-2 small | 124M | 1024 tokens | Modelado de lenguaje general | MIT | Público |
| TinyLlama-1.1B | 1,1B | 2048 tokens | Modelado de lenguaje y chat | Apache 2.0 | Público |

La comparación es únicamente orientativa: este repositorio no es un modelo de propósito general, sino un conjunto de checkpoints de investigación con contexto de 16 tokens y sin ajuste por instrucciones. No se dispone de benchmarks comparables para establecer una comparación de rendimiento con GPT-2 small o TinyLlama.

## Limitaciones y advertencias

- Longitud de contexto de solo 16 tokens, lo que impide cualquier tarea que requiera contexto real (diálogo, código, resumen, RAG).
- No es un modelo de chat ni está ajustado por instrucciones; no debe usarse como asistente.
- Licencia no disponible: el uso comercial queda en un limbo legal y no se recomienda en producción sin aclaración del autor.
- Idiomas soportados no documentados; el corpus DCLM es mayoritariamente inglés, pero no se confirma el comportamiento en castellano.
- Riesgo alto de alucinación y de texto incoherente por el tamaño extremadamente reducido y el contexto de 16 tokens.
- Sesgos potenciales heredados del corpus DCLM, sin documentación específica de sesgos en la información disponible.
- El repositorio incluye 170 checkpoints y ocupa 23,7 GB; conviene descargar solo el subdirectorio necesario para evitar consumo innecesario de almacenamiento.
- La model card indica que las ejecuciones pendientes o divergidas están excluidas del índice y que el método `adamw_logits_from_teacher` seguía en ejecución en el momento del snapshot; los resultados pueden variar entre revisiones.
- No se ha validado soporte para vLLM, TGI, llama.cpp u Ollama; la generación de muestra se realiza con un bucle nativo de PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kothasuhas/infinite_compute_distillation
- Repositorio de código del experimento: https://github.com/kothasuhas/infinite_compute_distillation
- Dataset asociado (muestras del profesor y arrays DCLM preparados): https://huggingface.co/datasets/kothasuhas/infinite_compute_distillation
- Fuente del tokenizador: https://huggingface.co/datasets/Ryukijano/parameter-golf-sp4096 (commit `23dbd5ab0fcc1edfd25eedf1ae9d41a5d8b6b233`)
