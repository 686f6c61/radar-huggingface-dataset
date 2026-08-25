# boyanbiji/Qwen3-1.7B-OPD-step120

## Resumen

Qwen3-1.7B-OPD-step120 es un checkpoint de destilación on-policy (On-Policy Distillation, OPD) del modelo base Qwen3-1.7B, desarrollado por el usuario boyanbiji. El modelo se entrena como estudiante a partir del teacher Qwen3-8B en modo non-thinking, utilizando el dataset de razonamiento matemático DeepMath-103K. El objetivo es transferir capacidades de razonamiento matemático de un modelo más grande a uno más pequeño mediante destilación on-policy, una técnica que genera datos de entrenamiento en el momento a partir de las salidas del teacher.

Este checkpoint en particular corresponde al paso global 120 del entrenamiento y está pensado para investigación en destilación de razonamiento. Con 2.031.739.904 parámetros (aproximadamente 2B), ofrece una alternativa compacta al teacher de 8B, manteniendo una ventana de contexto máxima de 8192 tokens en la respuesta generada. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas, lo que facilita su integración en proyectos de código abierto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B-Base) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 8192 tokens (max response length del entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda del modelo base, sin especificar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Qwen3-1.7B, que forma parte de la familia Qwen3 que incluye variantes densas y MoE. El entrenamiento utiliza el método de destilación on-policy (OPD) implementado en el repositorio OPD2 de NAVER AI. En este enfoque, el modelo estudiante (Qwen3-1.7B-Base) genera muestras de razonamiento, y el teacher (Qwen3-8B en modo non-thinking) proporciona las respuestas de referencia o correcciones, permitiendo un ajuste más eficiente que la destilación estática.

El dataset de entrenamiento es DeepMath-103K, un conjunto de problemas matemáticos de razonamiento. La precisión es bfloat16 y la longitud máxima de respuesta se limita a 8192 tokens. El checkpoint se publica en el paso global 120, lo que indica una etapa temprana del entrenamiento. No se especifican detalles adicionales sobre el proceso de RLHF o DPO; el método OPD se centra en la destilación con políticas on-policy, sin indicaciones de técnicas de alineación adicionales.

## Capacidades

- Generación de texto con enfoque en razonamiento matemático y resolución de problemas paso a paso.
- Razonamiento multi-step en problemas de matemáticas, aunque no se documenta explícitamente un modo de pensamiento (thinking mode) para el estudiante.
- Capacidad de generar respuestas con una longitud máxima de 8192 tokens, permitiendo explicaciones extensas.
- Compatible con el ecosistema de Hugging Face Transformers, usando `AutoModelForCausalLM` y `AutoTokenizer`.
- No se especifican capacidades de tool calling, función calling, ni soporte de agentes.
- El multilingüismo no está documentado; se espera que herede las capacidades del modelo base Qwen3, pero no hay confirmación oficial en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede generar soluciones detalladas para problemas de álgebra, cálculo o lógica, sirviendo como tutor automático para estudiantes.
- Generación de datasets de razonamiento: al ser un modelo destilado, se puede usar para crear datos sintéticos de problemas matemáticos con soluciones explicadas, útiles para entrenar otros modelos más pequeños.
- Evaluación de técnicas de destilación: el checkpoint permite a investigadores comparar el rendimiento de OPD frente a otros métodos de destilación en modelos de tamaño similar.
- Integración en pipelines de razonamiento matemático: en aplicaciones que requieren razonamiento simbólico o verificación de pasos, el modelo puede actuar como un componente rápido y ligero.
- Benchmarking de modelos compactos: dado su tamaño (~2B) y licencia Apache, es adecuado para pruebas de rendimiento en hardware consumer (GPU de 8-12 GB) antes de escalar a modelos más grandes.
- Generación de explicaciones matemáticas en lenguaje natural: el modelo puede producir justificaciones textuales de teoremas o propiedades, útil en documentación técnica o generación de contenido educativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README no incluye métricas como MMLU, HumanEval o GSM8K, y los resultados de búsqueda web no proporcionan datos de evaluación específicos para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.031 millones de parámetros en bfloat16, la memoria necesaria es aproximadamente 4 GB (2.03 GB de pesos + overhead). Con cuantización a 4 bits, la VRAM puede reducirse a ~1-1.5 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para bf16, o 2 GB para cuantización 4-bit. Modelos como NVIDIA RTX 3060, RTX 4060, o incluso GPUs integradas con soporte CUDA pueden ejecutarlo.
- En consumer GPU: sí, cabe en GPUs de gama media como RTX 3060 (12 GB) o RTX 4060 (8 GB) sin cuantizar, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: compatible con transformers (carga directa), vLLM, TGI (Text Generation Inference) para producción, y llama.cpp para ejecución en CPU/GPU con cuantización.
- Latencia y throughput: no hay datos publicados. Para un modelo de 2B en una GPU moderna, se espera una latencia de generación de ~10-20 tokens/s en bf16, y mayor con cuantización, pero no se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-1.7B-OPD-step120 | 2.03B | 8192 | Apache 2.0 | Destilación matemática (OPD) |
| Qwen/Qwen3-1.7B-Base | 1.7B (aprox. 2B con embeddings) | 32K (según informe Qwen3) | Apache 2.0 | Modelo base general |
| Qwen/Qwen3-8B | 8B | 32K | Apache 2.0 | Modelo general de mayor tamaño |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32K | MIT | Destilación de razonamiento (R1) |

La comparativa se centra en el tamaño y el propósito. El modelo OPD es específico para matemáticas, mientras que los Qwen3 base son generales. DeepSeek-R1-Distill-Qwen-1.5B es otro modelo destilado para razonamiento, pero no hay datos de rendimiento comparativos disponibles en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real en matemáticas no está validado externamente.
- El checkpoint es un paso de entrenamiento temprano (step 120), lo que puede indicar que no ha convergido completamente; su rendimiento puede ser inferior al del teacher (Qwen3-8B).
- La longitud de contexto efectiva para respuestas es de 8192 tokens, limitada por el entrenamiento; para contextos más largos se requeriría ajuste adicional.
- No se especifican idiomas; el modelo base Qwen3 soporta múltiples idiomas, pero el entrenamiento se enfocó en matemáticas, lo que puede degradar el rendimiento en otras tareas lingüísticas.
- Riesgo de alucinación en problemas matemáticos complejos o poco comunes, especialmente en pasos de razonamiento.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero al ser un modelo derivado de Qwen3, se deben revisar las condiciones del modelo base (Apache 2.0 también).
- No hay información sobre sesgos o comportamientos de seguridad; se recomienda evaluación adicional antes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/boyanbiji/Qwen3-1.7B-OPD-step120
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio de OPD2 (método de entrenamiento): https://github.com/naver-ai/opd2/tree/main/recipes/Qwen3-1.7B/opd
- Dataset de entrenamiento DeepMath-103K: https://huggingface.co/datasets/zwhe99/DeepMath-103K
