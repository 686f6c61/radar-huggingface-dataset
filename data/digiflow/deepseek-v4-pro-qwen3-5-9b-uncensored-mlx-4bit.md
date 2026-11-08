# digiflow/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-MLX-4bit

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-MLX-4bit es una cuantización a 4 bits en formato MLX del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, publicada por el usuario digiflow (NovaMLX, 数字流动 / Shenzhen Digitalflow Software). El modelo original es un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, centrado en razonamiento matemático y STEM, al que posteriormente se le eliminó el comportamiento de rechazo mediante la técnica de abliteración Arbitrary-Rank Ablation (ARA) de Heretic v2.

La relevancia de esta build concreta es que se trata de la primera y única conversión a MLX de este modelo, lo que permite ejecutarlo en cualquier Mac con Apple Silicon y 16 GB o más de memoria unificada. Hasta ahora solo existían versiones GGUF y NVFP4, inutilizables en runtimes MLX. La arquitectura es híbrida: 32 capas, de las cuales 24 usan atención lineal GatedDeltaNet y 8 usan atención completa, con una ventana de contexto de 262.144 tokens.

El modelo tiene 9.409.813.744 parámetros totales (no es MoE) y un vocabulario de 248.320 tokens. Está publicado con licencia Apache 2.0 y soporta inglés y chino. Su orientación es el razonamiento eficiente: según la model card, genera un 36,1 % menos de tokens por respuesta correcta que Qwen3.5-9B en tareas de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer híbrido: 24 capas de atención lineal GatedDeltaNet + 8 capas de atención completa) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit affine, group size 64 (cuantizado desde fuente BF16) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4-bit; tamaño del repo 6,0 GB |
| Capas | 32 (24 lineales + 8 de atención completa) |
| Vocabulario | 248.320 tokens |
| Modelo base | xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic |
| Libreria | mlx |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer híbrida sobre el backbone Qwen3.5-9B: 32 capas en total, de las cuales 24 emplean atención lineal GatedDeltaNet y 8 mantienen atención completa (75 % / 25 %). Esta combinación reduce el coste de la caché KV y acelera la inferencia en GPU de Apple, manteniendo una ventana de contexto de 262.144 tokens con un coste de KV bajo.

El entrenamiento se realizó en tres fases encadenadas. Primero, Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B se obtuvo por destilación de conocimiento desde DeepSeek-V4-Pro (en modo Max Effect) sobre aproximadamente 250.000 muestras de matemáticas y STEM, combinando SFT y RL con GSPO. Después, xtools-at aplicó la técnica Heretic v2 de Arbitrary-Rank Ablation sobre las capas 9 a 24 para eliminar el comportamiento de rechazo, reduciendo los rechazos de 100/100 a 3/100 con una divergencia KL de 0,042 respecto al modelo base. Finalmente, esta build aplica la cuantización MLX 4-bit affine con group size 64 desde la fuente BF16 mediante las herramientas de NovaMLX.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso.
- Razonamiento matemático y resolución de problemas STEM (foco principal del entrenamiento).
- Modo de razonamiento destilado de DeepSeek-V4-Pro (Max Effect), orientado a cadenas de pensamiento eficientes.
- Capacidades multilingües limitadas a inglés y chino.
- Comportamiento sin rechazos (uncensored) tras la abliteración.
- No es un especialista en código: el conjunto de destilación no incluye datos de programación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (arquitectura de texto).

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de matemáticas y STEM paso a paso, aprovechando la destilación de DeepSeek-V4-Pro y su eficiencia de tokens (36,1 % menos tokens por respuesta correcta que Qwen3.5-9B).
- Investigación sobre alineación y abliteración: útil para estudiar el efecto de la eliminación de rechazos en modelos de 9B, comparando el comportamiento con el modelo base sin ablacionar.
- Prototipado local en Mac: cualquier desarrollador con un Mac de 16 GB o más puede ejecutar el modelo con mlx-lm o LM Studio sin GPU dedicada, gracias a los ~4,8 GB de memoria residente.
- Procesamiento de documentos largos en inglés o chino: la ventana de 262.144 tokens permite analizar informes, artículos o contratos extensos en una sola pasada con coste de KV reducido.
- Generación de contenido sin restricciones para investigación creativa: escenarios donde se necesita explorar respuestas que un modelo alineado rechazaría, siempre bajo responsabilidad del usuario y cumplimiento legal.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de la cuantización MLX 4-bit frente a la fuente BF16 en tareas de razonamiento.
- Despliegue en servidor MLX (NovaMLX): con un rendimiento de ~32 tok/s de decodificación en un M4 Max, es viable para aplicaciones interactivas de un solo usuario o baja concurrencia.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo base destilado:

| Benchmark | Resultado | Referencia |
|---|---|---|
| GSM8K | 94,50 % | Teacher DeepSeek-V4-Pro: 92,60 % |
| MMLU-Pro (Math/Physics/Chemistry) | 90,53 % de media | Mejor entre las 9B baselines probadas |
| Eficiencia de razonamiento | 316,8 respuestas correctas por 1M tokens de razonamiento | 36,1 % menos tokens por respuesta correcta vs Qwen3.5-9B |

Rendimiento de inferencia (Mac Studio M4 Max, 128 GB, servidor NovaMLX):

| Métrica | Valor |
|---|---|
| Memoria residente | ~4,8 GB wired |
| Tiempo hasta el primer token | ~1,9 s |
| Velocidad de decodificación | ~32 tok/s |

No se han publicado resultados de benchmarks específicos de esta cuantización MLX 4-bit en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~4,8 GB residentes en inferencia según la model card; el repo ocupa 6,0 GB en disco.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con 16 GB o más de memoria unificada.
- Cabe en Mac consumer con 16 GB; el rendimiento medido corresponde a un Mac Studio M4 Max de 128 GB.
- No está pensado para GPU NVIDIA: el formato MLX no es compatible con CUDA; para esas plataformas habría que usar las versiones GGUF o NVFP4 del modelo base.
- Opciones de despliegue: mlx-lm, LM Studio, servidor NovaMLX.
- Latencia y throughput medidos: ~1,9 s hasta el primer token y ~32 tok/s de decodificación en M4 Max; no hay datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MLX 4-bit) | 9,41B | 262.144 | 4-bit MLX | Apache 2.0 | Hugging Face, solo Apple Silicon |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base destilado) | 9B | no disponible | BF16 | no disponible | Hugging Face |
| xtools-at/...-UNCENSORED-heretic (BF16) | 9B | no disponible | BF16 | no disponible | Hugging Face |
| Qwen3.5-9B (backbone original) | 9B | no disponible | múltiples | no disponible | Hugging Face |

La comparativa de rendimiento frente a Qwen3.5-9B se limita a los datos de la model card: mejor media en MMLU-Pro (Math/Physics/Chemistry) entre las 9B probadas y un 36,1 % menos de tokens por respuesta correcta. No hay datos de benchmarks para las variantes GGUF o NVFP4 en la información disponible.

## Limitaciones y advertencias

- Modelo sin censura: la abliteración eliminó el comportamiento de rechazo (de 100/100 a 3/100), por lo que puede generar contenido dañino, ilegal o sesgado; el usuario es responsable del uso y del cumplimiento legal.
- No es especialista en código: el conjunto de destilación no incluye datos de programación, así que su rendimiento en tareas de código será inferior al de modelos generalistas.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- La cuantización 4-bit puede degradar la precisión en razonamiento respecto a la fuente BF16; no hay benchmarks publicados de esta build concreta.
- Riesgo de alucinación inherente a los modelos destilados de razonamiento, especialmente fuera del dominio matemático/STEM.
- Solo ejecutable en Apple Silicon; no hay soporte CUDA ni ROCm para este formato.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el proceso de abliteración pueden introducir obligaciones o riesgos adicionales no detallados en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/digiflow/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-MLX-4bit
- Modelo base destilado: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Modelo base sin censura: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Heretic (herramienta de abliteración): https://heretic-project.org
- NovaMLX (cuantización y servidor MLX): https://github.com/lucasliu/novamlx
