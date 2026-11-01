# ingot-mlx/Qwen3.6-35B-A3B-Heretic-MLX-4bit-calib

## Resumen

Qwen3.6-35B-A3B-Heretic-MLX-4bit-calib es una conversión cuantizada a 4 bits en formato MLX del modelo llmfan46/Qwen3.6-35B-A3B-uncensored-heretic, que a su vez deriva del Qwen/Qwen3.6-35B-A3B original. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones activos por token, lo que permite un equilibrio entre capacidad y coste de inferencia. La conversión la firma el usuario ingot-mlx y está pensada específicamente para Apple Silicon mediante la librería MLX.

La diferencia frente a otras conversiones MLX de 4 bits del mismo modelo base es el método de cuantización: en lugar de redondeo directo (round-to-nearest), se emplea GPTQ con un conjunto de calibración de aproximadamente 489.000 tokens. El resultado, según la model card, es una divergencia KL media de 0,078 frente a los 0,145 de la conversión estándar, es decir, aproximadamente la mitad, con el mismo tamaño de pesos (19,51 GB) y la misma velocidad de inferencia.

El modelo base ha sido sometido a un proceso de abliteration con la herramienta Heretic, eliminando el comportamiento de rechazo del Qwen original. Esto lo hace relevante para quienes necesitan un modelo sin capa de seguridad integrada para investigación o experimentación, pero también implica riesgos importantes: puede producir contenido dañino, ofensivo, falso o ilegal, y no incluye torre de visión ni capa MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo qwen3_5_moe (transformer con mezcla de expertos) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3B por token |
| Longitud de contexto | 128K tokens (según la model card, con plan de memoria de ingot); 64K con opciones de caché en SSD |
| Tipos de cuantizacion | 4 bits afín, group size 64, escalas y sesgos en bf16; router y shared_expert_gate a 8 bits |
| Idiomas soportados | no disponible (la calibración incluye inglés, español, francés, alemán y chino, pero no se declara lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 4 shards) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen3.5, con 35B parámetros totales y aproximadamente 3B activos por token. El proceso de cuantización aplicado por ingot-mlx es GPTQ secuencial capa por capa: cada capa se calibra sobre las salidas de las capas ya cuantizadas, transmitiendo los pesos bf16 desde disco, de modo que el modelo bf16 completo no necesita caber en memoria. En las capas MoE, el enrutamiento usa el router cuantizado a 8 bits, cada experto tiene su propia matriz Hessiana ponderada por sus puntuaciones de router, y los expertos con pocos tokens reciben un prior bayesiano.

El conjunto de calibración (~489K tokens) se compone de aproximadamente 41 % texto genérico público (calibration_datav3 de bartowski y extractos de Project Gutenberg en inglés, español, francés, alemán y chino), 31 % conversaciones generadas por el propio modelo a partir de prompts de oasst1 en varios idiomas y tareas de código, con y sin razonamiento, y 29 % texto privado del autor (notas técnicas, código y sesiones de agente de codificación) no publicado. No se usa texto de evaluación para calibrar. Los parámetros de grupo (escala y sesgo de cada grupo de 64) se eligen mediante una búsqueda ponderada por la diagonal de la Hessiana y se redondean a bf16 dentro del bucle. El embedding usa búsqueda MSE por grupo y el lm_head usa GPTQ. La herramienta de conversión no es pública, pero la salida es un modelo MLX estándar.

## Capacidades

- Generación de texto conversacional y continuaciones largas, con ventana de contexto de hasta 128K tokens.
- Razonamiento multi-paso y tareas de código, incluyendo sesiones de agente de codificación con tool calling (la partición "agent" de la evaluación cubre transcripciones largas de llamadas a herramientas).
- Soporte de tool calling y function calling, implícito en la arquitectura del modelo base Qwen3.6 y en el uso de sesiones de agente durante la calibración.
- Capacidades multilingües parciales: la calibración incluye inglés, español, francés, alemán y chino, aunque no hay lista oficial de idiomas soportados.
- Sin capa de rechazo: el modelo responde a peticiones que el Qwen original rechazaría (10/100 rechazos frente a 83/100 del original, según el autor del modelo base, no verificado).
- No incluye torre de visión: la entrada de imágenes no funciona.
- No incluye capa MTP (multi-token prediction) del original.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo sin capa de rechazo y comparar sus respuestas con las del Qwen original, útil para analizar qué tipos de peticiones se aceptan y con qué calidad.
- Evaluación de métodos de cuantización: al ser una conversión GPTQ calibrada con métricas KL publicadas frente a la conversión estándar, sirve como caso de estudio reproducible para comparar técnicas de cuantización en Apple Silicon.
- Desarrollo y experimentación local en Mac: con 19,51 GB de pesos y un mínimo de 32 GB de memoria unificada, se puede ejecutar en un Mac de gama alta con mlx-lm, lo que facilita prototipado sin GPU dedicada.
- Generación de código en pipelines de agente: la partición "agent" de la evaluación (KL 0,366) indica que el modelo mantiene coherencia en transcripciones largas de tool calling, adecuado para asistentes de codificación que encadenan llamadas a herramientas.
- Atención al cliente y conversaciones multi-turno: la ventana de 128K tokens permite mantener contexto extenso en diálogos largos, aunque la ausencia de capa de seguridad exige filtros propios en producción.
- Generación de texto creativo y técnico multilingüe: la calibración con textos en cinco idiomas sugiere un rendimiento razonable en español, francés, alemán y chino, útil para redacción técnica o traducción asistida con revisión humana.
- Fine-tuning y experimentación con modelos sin censura: investigadores que necesitan un punto de partida sin rechazos para estudiar sesgos o comportamientos pueden usar este modelo como base, asumiendo la responsabilidad legal y ética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card indica explícitamente que no se midieron benchmarks downstream. Sí se publican métricas de divergencia KL frente al modelo bf16 Heretic, sobre 36.569 tokens no usados en calibración:

| Variante | Pesos de texto | KL media | KL p99 | Acuerdo top-1 | KL split genérico | KL split privado | KL split agente |
|---|---|---|---|---|---|---|---|
| 4 bits estándar (mlx_lm.convert, round-to-nearest) | 19,51 GB | 0,145 | 1,53 | 87,2 % | 0,093 | 0,186 | 0,573 |
| Este modelo (GPTQ, calibrado) | 19,51 GB | 0,078 | 0,92 | 91,6 % | 0,046 | 0,103 | 0,366 |

La diferencia en KL media es de −0,067 (IC 95 % −0,100 a −0,045), es decir, una reducción del 46 %. La conversión estándar más descargada del mismo modelo base (froggeric/Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-4bit) dio exactamente la misma KL token por token en la evaluación del autor, por lo que la fila estándar también le aplica.

## Requisitos de hardware

- Memoria mínima en Mac: 32 GB de memoria unificada con todo en memoria (contexto de 128K y drafter, con el plan de memoria de ingot).
- Con la opción de expertos desde SSD de ingot: 24 GB (`--expert-cache-gb 12`, contexto de 64K, drafter) o 16 GB (`--expert-cache-gb 6`, contexto de 64K, drafter); la velocidad con estas cachés no se ha medido.
- Para mlx-lm: estimación de 24 GB al límite (pesos + caché KV de 8K ≈ 19,7 GB, estimado, no medido); 32 GB es cómodo.
- GPU recomendadas: el modelo está diseñado para Apple Silicon (MLX); no se proporcionan datos para GPUs NVIDIA (A100, H100, RTX 4090) en la información disponible.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`, `mlx_lm.server` con API compatible con OpenAI). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ingot-mlx, GPTQ calibrado) | 35B totales, ~3B activos | 128K | 4 bits MLX, group size 64 | Apache 2.0 | HuggingFace, 26 descargas |
| froggeric/Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-4bit | 35B totales, ~3B activos | no disponible | 4 bits MLX, round-to-nearest | no disponible | HuggingFace |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic (bf16) | 35B totales, ~3B activos | no disponible | bf16 | no disponible | HuggingFace |
| Qwen/Qwen3.6-35B-A3B (original) | 35B totales, ~3B activos | no disponible | bf16 y otras | Apache 2.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de benchmarks que permitan comparar con otras familias (Llama, Mistral, etc.). La ventaja principal de este modelo frente a la conversión estándar es la menor divergencia KL (0,078 frente a 0,145) con idéntico tamaño y velocidad.

## Limitaciones y advertencias

- Modelo sin capa de seguridad: la abliteration con Heretic elimina el comportamiento de rechazo, por lo que puede producir contenido dañino, ofensivo, falso o ilegal. El autor declara 10/100 rechazos frente a 83/100 del original, dato no verificado.
- Responsabilidad legal: el usuario es responsable del uso y del cumplimiento de la legislación aplicable; no debe usarse en productos para menores o para el público general sin salvaguardas propias.
- Sin torre de visión: la entrada de imágenes no funciona.
- Sin capa MTP: no se incluye la capa de multi-token prediction del original.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, pero al derivar de Qwen3.6 y haber sido calibrado con datos privados no publicados, pueden persistir sesgos del modelo original y del conjunto de calibración.
- Riesgo de alucinación: no medido en la model card; la evaluación se limita a divergencia KL, no a calidad factual.
- Limitaciones de contexto: la calidad más allá de las secuencias de evaluación no se ha medido; el contexto de 128K requiere 32 GB de memoria en Mac.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de capa de seguridad y la naturaleza del modelo base hacen recomendable una revisión legal antes de producción.
- La herramienta de conversión no es pública, lo que dificulta reproducir exactamente el proceso.
- El split privado de la evaluación no se publica, por lo que esas métricas son indicativas.

## Enlaces

- HuggingFace: https://huggingface.co/ingot-mlx/Qwen3.6-35B-A3B-Heretic-MLX-4bit-calib
- Modelo base (uncensored-heretic): https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Conversión MLX 4 bits estándar más descargada: https://huggingface.co/froggeric/Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-4bit
- Herramienta Heretic: https://github.com/p-e-w/heretic
