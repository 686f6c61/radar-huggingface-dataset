# richardyoung/Qwen3.5-4B-DiM-heretic-MLX-4bit

## Resumen

Qwen3.5-4B-DiM-heretic-MLX-4bit es una conversión a 4 bits en formato MLX del modelo richardyoung/Qwen3.5-4B-DiM-heretic, una variante del Qwen3.5-4B de Alibaba a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante la técnica DiM (Directional ablation) implementada en Heretic 2.0. El autor, richardyoung, publica esta versión cuantizada específicamente para inferencia en Apple Silicon a través de la librería MLX.

El modelo base forma parte del estudio "Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs" (Young, 2026, en preparación), que investiga la robustez de los mecanismos de seguridad en modelos open-weight y la eficacia de distintos métodos de eliminación de rechazo. Esta conversión concreta solo modifica la cuantización respecto a los pesos originales; las evaluaciones del paper se realizaron sobre el modelo fuente en bf16, no sobre esta versión de 4 bits.

Con 4.205.751.296 parámetros y un tamaño de repositorio de 2,4 GB, el modelo está pensado para ejecutarse en equipos con Apple Silicon (chips M-series) mediante mlx-lm. Su relevancia es doble: por un lado, ofrece una vía práctica de ejecutar un modelo de 4B cuantizado en hardware de consumo Apple; por otro, sirve como material de investigación sobre seguridad y alineación en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), cuantizado en MLX affine 4-bit |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (mlx_lm.convert) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 4-bit |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer denso de aproximadamente 4,2 mil millones de parámetros. Sobre esa base, el modelo fuente aplica una eliminación direccional del comportamiento de rechazo (DiM) mediante Heretic 2.0, un procedimiento que identifica y ablaciona direcciones en el espacio de activaciones asociadas a la negativa a responder. Esta versión MLX-4bit se genera con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` usando mlx-lm 0.32.2, aplicando cuantización afín de 4 bits con grupos de 64.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo etapas de RLHF o DPO en el modelo original. Tampoco se detallan innovaciones arquitectónicas específicas más allá de las propias de la familia Qwen3.5. El modelo soporta modo "thinking" (razonamiento explícito) por defecto, aunque las evaluaciones del paper se realizaron con `enable_thinking=False` en la plantilla de chat.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat.
- Modo de razonamiento ("thinking") activable mediante la plantilla de chat de Qwen3.5.
- Comportamiento de rechazo eliminado: el modelo puede cumplir solicitudes que un modelo alineado rechazaría.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Inferencia optimizada para Apple Silicon mediante MLX.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar la robustez de los mecanismos de rechazo y evaluar hasta qué punto la ablación direccional (DiM) elimina comportamientos de negativa, comparándolo con métodos basados en optimización.
- Evaluación de técnicas de abliteration: sirve como punto de comparación reproducible para medir la eficacia de Heretic 2.0 frente a otros procedimientos sobre distintas generaciones de modelos open-weight.
- Desarrollo y pruebas en Apple Silicon: al estar en formato MLX 4-bit, permite prototipar aplicaciones de generación de texto en Macs con chips M-series sin necesidad de GPU dedicada.
- Red teaming y pruebas de robustez: útil para generar respuestas a prompts adversarios y analizar cómo se comporta un modelo sin rechazo en escenarios controlados de evaluación.
- Experimentación con cuantización: permite comparar el impacto de la cuantización 4-bit MLX frente al modelo fuente en bf16 en tareas de generación y razonamiento.
- Docencia y divulgación sobre seguridad en IA: sirve para ilustrar de forma práctica qué es la abliteration y qué implicaciones tiene sobre el comportamiento de un LLM.
- Prototipado de asistentes conversacionales en local: para casos donde se requiera un modelo ligero ejecutándose íntegramente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las evaluaciones del paper se ejecutaron sobre el modelo fuente en bf16, no sobre esta versión cuantizada a 4 bits.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repositorio ocupa 2,4 GB, por lo que se requiere al menos ese espacio en memoria unificada, más overhead de ejecución (aproximadamente 3-4 GB en total).
- Hardware objetivo: Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para GPU NVIDIA ni CUDA.
- Cabe en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; 16 GB o más es recomendable para contexto largo y modo thinking.
- Despliegue: exclusivamente mediante mlx-lm (`mlx_lm.generate`, `mlx_lm.server`) y ecosistema MLX. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.5-4B-DiM-heretic-MLX-4bit | 4,2B | no disponible | 4-bit MLX | apache-2.0 | Apple Silicon (MLX) |
| richardyoung/Qwen3.5-4B-DiM-heretic (fuente) | 4,2B | no disponible | bf16 | apache-2.0 | Multiplataforma |
| Qwen/Qwen3.5-4B (original) | 4,2B | no disponible | bf16 y otras | no disponible | Multiplataforma |

La comparación con otros modelos de la misma categoría (4B, cuantizados para consumo) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo tiene eliminado el comportamiento de rechazo y puede cumplir solicitudes dañinas. El autor lo libera exclusivamente para investigación sobre mecanismos de seguridad.
- Riesgo elevado de generar contenido inapropiado, inseguro o ilícito; no debe desplegarse en producción orientada a usuarios finales sin filtros externos.
- La cuantización 4-bit puede degradar la calidad respecto al modelo fuente en bf16; las evaluaciones publicadas no cubren esta versión.
- Sesgos conocidos: no disponibles en la información proporcionada, pero heredados presumiblemente del modelo base Qwen3.5-4B.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados y longitud de contexto: no disponibles; conviene verificar en la documentación del modelo base.
- Licencia apache-2.0 permite uso comercial, pero el comportamiento sin rechazo hace desaconsejable su uso en aplicaciones comerciales sin salvaguardas adicionales.
- Compatibilidad limitada a MLX/Apple Silicon; requiere conversión para otros runtimes.

## Enlaces

- HuggingFace: https://huggingface.co/richardyoung/Qwen3.5-4B-DiM-heretic-MLX-4bit
- Modelo base (bf16): https://huggingface.co/richardyoung/Qwen3.5-4B-DiM-heretic
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Heretic: no disponible en la información proporcionada
