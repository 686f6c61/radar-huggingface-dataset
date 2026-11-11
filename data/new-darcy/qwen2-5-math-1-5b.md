# new-darcy/Qwen2.5-Math-1.5B

## Resumen

Qwen2.5-Math-1.5B es un modelo de lenguaje especializado en razonamiento matematico, desarrollado por el equipo Qwen de Alibaba (el repositorio de Hugging Face lo publica el usuario `new-darcy` como una copia del modelo oficial `Qwen/Qwen2.5-Math-1.5B`). Forma parte de la segunda generacion de la familia matematica de Qwen, presentada en agosto-septiembre de 2024, que incluye variantes base e instruct de 1.5B, 7B y 72B parametros, ademas de un modelo de recompensa de 72B.

El modelo resuelve problemas matematicos en ingles y chino mediante dos estrategias: cadena de pensamiento (CoT) y razonamiento integrado con herramientas (TIR, Tool-Integrated Reasoning), que permite al modelo invocar un interprete de Python para calculos precisos y manipulacion simbolica. Con 1.543.714.304 parametros y una ventana de contexto de 32.768 tokens (heredada de la familia Qwen2.5), esta pensado como punto de partida para ajuste fino en tareas de completion y few-shot, no como modelo conversacional.

Es relevante porque demuestra que un modelo de solo 1.5B puede alcanzar resultados competitivos en benchmarks matematicos cuando se entrena especificamente con datos de auto-mejora y se le dota de capacidad de usar herramientas externas, lo que lo hace viable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), con atencion causal estandar |
| Parametros totales | 1.543.714.304 (~1.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-1.5B; no confirmado de forma explicita en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, probablemente bf16/fp16) |
| Idiomas soportados | Ingles y chino (la model card advierte que solo se recomienda para problemas matematicos en estos idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2.5, con 1.5B parametros, basado en `Qwen/Qwen2.5-1.5B` y especializado mediante entrenamiento adicional sobre datos matematicos. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset, pero el informe tecnico (arXiv:2409.12122) describe un proceso de auto-mejora (self-improvement) en el que el modelo genera soluciones, se filtran por correccion y se reentrena, combinando datos de CoT y de TIR.

La innovacion principal es el soporte de TIR: el modelo aprende a intercalar llamadas a un interprete de Python dentro de su razonamiento, lo que mejora la precision en calculos numericos, manipulacion simbolica y tareas algoritmicas donde el CoT puro falla (por ejemplo, raices de ecuaciones cuadraticas o autovalores de matrices). La familia incluye tambien un modelo de recompensa (Qwen2.5-Math-RM-72B) usado para filtrar y puntuar soluciones durante el entrenamiento.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos en ingles y chino mediante CoT.
- Razonamiento integrado con herramientas (TIR): el modelo puede emitir llamadas a un interprete de Python para calculos exactos y manipulacion simbolica.
- Completion y few-shot inference (es un modelo base, no instruct; para chat se recomienda la variante `-Instruct`).
- Punto de partida para ajuste fino en tareas matematicas o de razonamiento.
- No se documenta soporte de tool calling generico, agentes multi-paso, vision ni audio en la informacion disponible.
- Capacidades multilingues limitadas a ingles y chino segun la model card.

## Casos de uso

- Resolucion de problemas matematicos de competicion (MATH, GSM8K): el modelo puede generar cadenas de razonamiento paso a paso y, con TIR, delegar calculos a Python para reducir errores aritmeticos.
- Generacion de soluciones paso a paso para plataformas educativas: adecuado por su tamano reducido, que permite desplegarlo en una sola GPU consumer y servir respuestas con baja latencia.
- Ajuste fino para dominios matematicos especificos (calculo, algebra, estadistica): al ser un modelo base, sirve como punto de partida economico para fine-tuning con datasets propios.
- Evaluacion y generacion de datos sinteticos de razonamiento: util para producir trazas CoT/TIR que luego se filtran con un modelo de recompensa.
- Verificacion de calculos en pipelines de datos: con TIR puede integrarse en flujos que requieran comprobacion numerica o simbolica.
- Investigacion en razonamiento con herramientas: su tamano permite experimentar con tecnicas de TIR y decodificacion en entornos con recursos limitados.
- Prototipado de asistentes matematicos en entornos con restricciones de VRAM (por ejemplo, estaciones de trabajo con una RTX 4090).

## Benchmarks y rendimiento

La model card solo reporta el resultado en MATH con TIR para las variantes instruct: 79.7 (1.5B), 85.3 (7B) y 87.8 (72B). No se proporcionan resultados para el modelo base 1.5B en MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

| Benchmark | Qwen2.5-Math-1.5B-Instruct (TIR) |
|---|---|
| MATH | 79.7 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3-4 GB para los pesos, mas overhead de activaciones y cache KV (depende de la longitud de contexto).
- En cuantizacion de 8 bits: ~1.6 GB; en 4 bits: ~0.8-1 GB (estimaciones, no confirmadas en la model card).
- Cabe en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs con 6-8 GB en cuantizacion.
- GPU recomendadas para produccion: A100, H100 o L40S para mayor throughput; RTX 4090 para desarrollo.
- Opciones de despliegue: transformers (>=4.37.0, obligatorio), text-generation-inference (el repo incluye el tag `text-generation-inference`), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a los benchmarks de velocidad de Qwen2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH (TIR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Math-1.5B (este) | 1.5B | 32.768 (heredado) | No reportado para base | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-1.5B-Instruct | 1.5B | 32.768 (heredado) | 79.7 | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-7B-Instruct | 7B | 32.768 (heredado) | 85.3 | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-72B-Instruct | 72B | 32.768 (heredado) | 87.8 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos de otros fabricantes (por ejemplo, Llama o Mistral) en la informacion proporcionada para una comparativa cruzada.

## Limitaciones y advertencias

- La model card advierte explicitamente que el modelo solo esta pensado para resolver problemas matematicos en ingles y chino mediante CoT y TIR, y no recomienda su uso para otras tareas.
- Es un modelo base, no instruct: para uso conversacional debe emplearse la variante `-Instruct`.
- Riesgo de alucinacion en razonamientos matematicos, especialmente sin TIR; el CoT puro puede fallar en calculos precisos.
- Limitaciones de idioma: no se garantiza un rendimiento adecuado fuera de ingles y chino.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse la atribucion y las condiciones de la licencia.
- Requiere `transformers>=4.37.0`; versiones anteriores no integran los codigos de Qwen2.
- El repositorio de Hugging Face (`new-darcy/Qwen2.5-Math-1.5B`) tiene 0 descargas y 0 likes, por lo que conviene verificar que los pesos coinciden con el modelo oficial `Qwen/Qwen2.5-Math-1.5B` antes de usarlo en produccion.

## Enlaces

- Hugging Face (copia): https://huggingface.co/new-darcy/Qwen2.5-Math-1.5B
- Modelo oficial: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Blog de Qwen2.5-Math: https://qwenlm.github.io/blog/qwen2.5-math/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2.5-Math
- Informe tecnico (arXiv): https://arxiv.org/abs/2409.12122
- Blog de Qwen2-Math: https://qwenlm.github.io/blog/qwen2-math/
- Benchmarks de velocidad de Qwen2: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Licencia: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B/blob/main/LICENSE
