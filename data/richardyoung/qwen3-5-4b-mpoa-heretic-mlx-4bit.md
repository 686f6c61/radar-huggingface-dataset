# richardyoung/Qwen3.5-4B-MPOA-heretic-MLX-4bit

## Resumen

Qwen3.5-4B-MPOA-heretic-MLX-4bit es una conversión a 4 bits en formato MLX del modelo richardyoung/Qwen3.5-4B-MPOA-heretic, que a su vez es una versión del Qwen/Qwen3.5-4B de Alibaba a la que se le ha eliminado el comportamiento de rechazo mediante la técnica MPOA (Multi-Prompt Orthogonal Ablation) implementada en la herramienta Heretic 2.0. El autor, richardyoung, publica esta variante como parte del estudio "Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs" (2026, en preparación).

El modelo conserva la arquitectura y los 4.205.751.296 parámetros del Qwen3.5-4B original, pero ha sido cuantizado a 4 bits con tamaño de grupo 64 mediante mlx-lm 0.32.2, lo que reduce el repositorio a 2,4 GB y lo hace apto para inferencia en Apple Silicon. Su relevancia es doble: por un lado, sirve como material de investigación sobre robustez de mecanismos de seguridad en modelos open-weight; por otro, es una opción práctica para ejecutar un modelo de 4B sin restricciones de rechazo en hardware de consumo de Apple.

La licencia es Apache 2.0, heredada del modelo base, y el pipeline declarado es text-generation. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), según el modelo base Qwen/Qwen3.5-4B |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX); el modelo fuente está en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 2,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B, un transformer denso de aproximadamente 4,2 mil millones de parámetros. Sobre esa base, el autor aplicó una eliminación de rechazo (refusal removal) mediante MPOA (Multi-Prompt Orthogonal Ablation) con Heretic 2.0, una técnica de abliteración basada en optimización que modifica direcciones internas del modelo para suprimir la conducta de negativa ante peticiones. El estudio de referencia compara enfoques direccionales frente a enfoques basados en optimización a lo largo de varias generaciones de modelos open-weight.

La única diferencia respecto a los pesos fuente es la cuantización: `mlx_lm.convert -q --q-bits 4 --q-group-size 64` con mlx-lm 0.32.2. Las evaluaciones del paper se realizaron sobre el modelo fuente en bf16, no sobre esta versión de 4 bits. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (text-generation, conversational).
- Modo de razonamiento (thinking): Qwen3.5 arranca por defecto con una sección de pensamiento; el paper evaluó con thinking desactivado mediante `enable_thinking=False` en la plantilla de chat.
- Comportamiento de rechazo eliminado: el modelo puede cumplir peticiones que el modelo original rechazaría.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre seguridad de modelos: el modelo permite estudiar la robustez de los mecanismos de rechazo y evaluar hasta qué punto la abliteración basada en optimización (MPOA) degrada las salvaguardas, comparándolo con el Qwen3.5-4B original.
- Inferencia local en Apple Silicon: con 2,4 GB en 4 bits, se puede ejecutar en Macs con memoria unificada mediante mlx-lm, útil para prototipos de generación de texto sin conexión.
- Evaluación comparativa de cuantizaciones: sirve para medir la degradación de calidad entre el modelo fuente en bf16 y esta conversión de 4 bits en tareas de generación libre.
- Generación de texto creativo sin filtros: para experimentos de escritura y diálogo donde se quiere evitar la negativa del modelo base, siempre dentro de un uso lícito y ético.
- Reproducción de experimentos académicos: permite replicar los flujos del estudio de Young (2026) en hardware de consumo, aunque las métricas del paper corresponden al modelo bf16.
- Base para ajuste fino ligero: al ser un modelo de 4B en MLX, puede servir como punto de partida para LoRA o adaptaciones locales en Mac, con la advertencia de que la cuantización limita el ajuste directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las evaluaciones del paper se ejecutaron sobre el modelo fuente en bf16 y no sobre esta versión de 4 bits.

## Requisitos de hardware

- VRAM/memoria estimada: alrededor de 2,4 GB para los pesos en 4 bits, más overhead de activaciones y caché KV; en la práctica, varios GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y superiores) con memoria unificada suficiente; el formato MLX no está pensado para GPU NVIDIA.
- ¿Cabe en GPU de consumo? Sí, en Macs con memoria unificada; en GPUs NVIDIA consumer requeriría convertir los pesos a otro formato (por ejemplo GGUF), lo que no se incluye en este repositorio.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`), con instalación mediante `pip install mlx-lm`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen3.5-4B-MPOA-heretic-MLX-4bit | 4,2 B | no disponible | MLX 4-bit | Apache 2.0 | Objeto de esta ficha; rechazo eliminado |
| richardyoung/Qwen3.5-4B-MPOA-heretic | 4,2 B | no disponible | bf16 | Apache 2.0 | Modelo fuente, evaluado en el paper |
| Qwen/Qwen3.5-4B | 4,2 B | no disponible | safetensors | no disponible en la información | Modelo original con salvaguardas intactas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El comportamiento de rechazo ha sido eliminado de forma deliberada: el modelo puede cumplir peticiones dañinas. El autor lo libera exclusivamente para investigación sobre mecanismos de seguridad y su robustez.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo fuente en bf16; las métricas del paper no son aplicables directamente a esta versión.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a modelos de 4B.
- Sesgos conocidos: no disponible en la información proporcionada; se heredan los del Qwen3.5-4B original.
- Limitaciones de contexto e idioma: no disponible en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el uso responsable recae en el usuario; el autor advierte de la responsabilidad legal y ética.
- Dependencia de MLX: no es directamente compatible con vLLM, TGI o llama.cpp sin conversión previa.
- El modo thinking está activo por defecto; para reproducir las condiciones del paper debe desactivarse con `enable_thinking=False`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Qwen3.5-4B-MPOA-heretic-MLX-4bit
- Modelo fuente: https://huggingface.co/richardyoung/Qwen3.5-4B-MPOA-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio MLX: https://github.com/ml-explore/mlx
- Heretic: no disponible en la información proporcionada
- Paper de referencia: Young (2026), "Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs", en preparación; sin enlace disponible
