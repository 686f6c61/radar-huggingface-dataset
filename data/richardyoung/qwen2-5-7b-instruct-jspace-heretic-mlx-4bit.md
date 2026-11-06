# richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic-MLX-4bit

## Resumen

Qwen2.5-7B-Instruct-JSpace-heretic-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic, que a su vez es una versión de Qwen/Qwen2.5-7B-Instruct con el comportamiento de rechazo eliminado mediante la técnica Heretic 2.0 (abliteration). El autor, richardyoung, publica esta variante orientada a Apple Silicon para su ejecución local con el framework MLX.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales según los pesos en safetensors y una ventana de contexto de 32.768 tokens en el modelo original (dato no verificado en esta ficha). La cuantización se realizó con mlx_lm.convert en 4 bits afín con grupo de 64, lo que reduce el repositorio a 4,3 GB.

Su relevancia es doble: por un lado, permite ejecutar un modelo de 7B en Macs con memoria unificada modesta; por otro, sirve como material de investigación sobre robustez de mecanismos de seguridad, ya que el proceso de abliteration elimina deliberadamente las respuestas de rechazo. El autor lo publica explícitamente para estudiar la eficacia de dichos mecanismos, no para uso comercial general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen2.5-7B-Instruct original soporta 32.768 tokens) |
| Tipos de cuantizacion | 4 bits afín, group size 64 (MLX); el modelo fuente está en bf16 |
| Idiomas soportados | no disponible en la informacion proporcionada (el Qwen2.5-7B-Instruct original es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (mlx-lm 0.32.2) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de causalidad completa, RoPE y capas de normalización RMSNorm, entrenado por Alibaba Qwen. Sobre ese modelo, el autor aplicó Heretic 2.0, una técnica de eliminación de rechazo basada en direcciones (abliteration) descrita en el estudio *Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs* (Young, 2026, en preparación). Dicho estudio compara métodos direccionales y basados en optimización para suprimir el comportamiento de rechazo en distintas generaciones de modelos abiertos.

La única modificación respecto a los pesos fuente es la cuantización: mlx_lm.convert con `--q-bits 4 --q-group-size 64`, cuantización afín de 4 bits con grupos de 64. El autor advierte que las evaluaciones del paper se realizaron sobre el modelo fuente en bf16, no sobre esta versión de 4 bits, por lo que el rendimiento de esta conversión puede diferir del reportado en el estudio. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO adicionales sobre el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y resolución de problemas de complejidad media, incluyendo matemáticas y lógica.
- Generación y explicación de código en múltiples lenguajes de programación.
- Soporte de tool calling y function calling (capacidad del modelo base; no verificada específicamente en esta conversión cuantizada).
- Capacidad de seguir instrucciones estructuradas y formatos de salida definidos.
- Capacidades multilingües del Qwen2.5 original (concreto: no disponible en la información proporcionada).
- Comportamiento de rechazo suprimido: el modelo tiende a cumplir solicitudes que el modelo original rechazaría, lo que constituye tanto una capacidad técnica como un riesgo de seguridad.
- No se documentan capacidades de visión, audio ni modo thinking explícito en esta variante.

## Casos de uso

- Investigación en seguridad de LLMs: evaluar la robustez de los mecanismos de rechazo comparando este modelo con Qwen2.5-7B-Instruct original en baterías de prompts dañinos, cuantificando la tasa de cumplimiento tras la abliteration.
- Ejecución local en Apple Silicon: desplegar un asistente conversacional de 7B en Macs con 16-24 GB de memoria unificada usando MLX, con un peso en disco de 4,3 GB y sin dependencia de GPU dedicada.
- Prototipado rápido de aplicaciones de texto en macOS: integrar el modelo vía mlx-lm para generar borradores, resúmenes o respuestas en un pipeline de desarrollo local antes de migrar a un modelo mayor en servidor.
- Estudio de cuantización: comparar la calidad de esta conversión 4-bit MLX frente al modelo fuente en bf16 en tareas de razonamiento y generación de código, midiendo la degradación introducida por la cuantización afín de grupo 64.
- Generación de código en entornos aislados: usar el modelo para autocompletar y explicar fragmentos en un IDE local sin conexión, aprovechando su capacidad de instrucción y su tamaño manejable.
- Análisis de contenido sensible en investigación: procesar textos que el modelo original rechazaría (por ejemplo, corpus con lenguaje explícito o material controvertido) en un contexto académico controlado, con la advertencia de que la supresión de rechazo no garantiza corrección factual.
- Benchmarking de técnicas de abliteration: emplear esta variante como punto de comparación en estudios que evalúen métodos direccionales frente a métodos de optimización para eliminar rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica únicamente que las evaluaciones del paper asociado se ejecutaron sobre el modelo fuente en bf16 y no sobre esta conversión de 4 bits, por lo que no hay cifras verificables para esta variante.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 4,5-5 GB para los pesos en 4 bits más overhead de contexto; con contexto largo (32K tokens) el consumo puede superar los 8-10 GB.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada; el formato MLX no está pensado para GPUs NVIDIA.
- Cabe en Macs consumer: sí, en equipos con 16 GB de memoria unificada o superior para contextos moderados; 24 GB o más recomendable para contextos largos.
- GPUs NVIDIA: no es la vía recomendada; para A100, H100 o RTX 4090 habría que usar el modelo fuente en bf16 o una conversión GGUF/AWQ, no esta versión MLX.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.generate` y API Python), servidor compatible con MLX; no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama sin reconversión.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del chip Apple y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-JSpace-heretic-MLX-4bit | 7,6B | no disponible (original: 32K) | 4 bits MLX | Apache 2.0 | Hugging Face, formato MLX |
| Qwen2.5-7B-Instruct (original) | 7,6B | 32.768 tokens | bf16, GPTQ, AWQ, GGUF | Apache 2.0 | Hugging Face, amplio ecosistema |
| richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic (fuente) | 7,6B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Modelos abliterated de la misma familia (p. ej. variantes Heretic de Qwen2.5) | ~7B | variable | bf16, GGUF | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes de la misma familia porque no se dispone de datos de rendimiento de benchmarks para esta conversión; no es posible establecer comparaciones cuantitativas con Llama 3.1 8B, Mistral 7B u otros modelos de tamaño similar sin cifras verificables.

## Limitaciones y advertencias

- Supresión deliberada del rechazo: el modelo puede cumplir solicitudes dañinas, ilegales o poco éticas. El autor lo libera exclusivamente para investigación sobre mecanismos de seguridad.
- Riesgo de alucinación: inherente a los modelos de 7B; la cuantización a 4 bits puede incrementarlo ligeramente respecto al modelo fuente en bf16.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Qwen2.5; no se documentan evaluaciones de sesgo específicas para esta variante.
- Idiomas: no se especifican en la información disponible; el modelo original es multilingüe, pero la calidad por idioma tras la abliteration y la cuantización no está evaluada.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el uso responsable recae en el usuario; el autor desaconseja implícitamente el despliegue en producción sin controles adicionales.
- Compatibilidad limitada: al ser formato MLX, no se puede cargar directamente en vLLM, TGI, llama.cpp u Ollama; requiere reconversión para otros backends.
- Sin evaluaciones publicadas de esta conversión: el autor confirma que las métricas del paper corresponden al modelo bf16, no a esta versión de 4 bits.
- Contexto: la longitud de contexto efectiva de esta conversión no está documentada; la cuantización puede afectar al rendimiento en ventanas largas.
- Fecha de creación futura (2026-11-05): conviene verificar la vigencia y el mantenimiento del repositorio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic-MLX-4bit
- Modelo fuente (bf16): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Estudio de referencia: *Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs* (Young, 2026, en preparación); sin enlace público disponible en la información proporcionada.
