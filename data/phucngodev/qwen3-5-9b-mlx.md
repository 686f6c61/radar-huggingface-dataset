# phucngodev/Qwen3.5-9B-MLX

## Resumen
Qwen3.5-9B-MLX es una conversión al formato MLX (Apple Silicon) en cuantización 4-bit del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, publicado por el usuario phucngodev. Se trata de un modelo de generación de texto de 9.409.813.744 parámetros construido sobre la arquitectura Qwen3.5, que combina atención lineal GatedDeltaNet (75% de las capas) con atención completa (25%), lo que permite una ventana de contexto de 262.144 tokens con un coste de KV reducido.

El modelo es el resultado de una cadena de derivaciones: primero, una destilación de conocimiento desde DeepSeek-V4-Pro sobre Qwen3.5-9B con aproximadamente 250.000 muestras de matemáticas y STEM (SFT más RL con GSPO); después, un proceso de "abliteration" mediante la herramienta Heretic v2 (Arbitrary-Rank Ablation sobre las capas 9 a 24) que elimina el comportamiento de rechazo; y finalmente, la cuantización a MLX 4-bit afín con grupo 64 a partir de la fuente BF16.

Su relevancia radica en ser la primera y única conversión MLX de esta familia de modelos, lo que lo hace ejecutable en cualquier Mac con Apple Silicon y 16 GB o más de memoria unificada, algo que las versiones previas (solo GGUF y NVFP4) no permitían en runtimes MLX. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: 24 capas de atención lineal GatedDeltaNet + 8 capas de atención completa, 32 capas en total) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit afín, grupo 64 (a partir de fuente BF16); el repo base dispone de GGUF y NVFP4 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 5,6 GB en disco; repositorio de 6,0 GB |

## Arquitectura y entrenamiento
La arquitectura es un transformer híbrido de 32 capas en el que 24 capas emplean atención lineal GatedDeltaNet y 8 capas usan atención completa. Esta proporción 75/25 reduce el coste del KV cache y acelera la inferencia en GPU de Apple, manteniendo una ventana de contexto de 262.144 tokens. El vocabulario es de 248.320 tokens.

El entrenamiento se realizó en tres fases encadenadas. La primera, a cargo de Jackrong, consistió en destilación de conocimiento desde DeepSeek-V4-Pro sobre el backbone Qwen3.5-9B, usando aproximadamente 250.000 muestras de matemáticas y STEM con SFT seguido de RL mediante GSPO. La segunda, de xtools-at, aplicó la herramienta Heretic v2 con Arbitrary-Rank Ablation sobre las capas 9 a 24 para eliminar el comportamiento de rechazo, reduciendo las negativas de 100/100 a 3/100 con una divergencia KL de 0,042 respecto al modelo base. La tercera fase, realizada por NovaMLX (数字流动 / Shenzhen Digitalflow Software), convirtió los pesos BF16 a MLX 4-bit afín con grupo 64 y verificó el resultado. No se dispone de información sobre la composición exacta del dataset más allá de la indicación de matemáticas y STEM.

## Capacidades
- Generación de texto conversacional multi-turno con contexto muy largo (262.144 tokens).
- Razonamiento matemático y STEM de alto nivel, con resultados destacados en GSM8K y MMLU-Pro en las áreas de matemáticas, física y química.
- Razonamiento eficiente en tokens: según la model card del modelo base destilado, produce un 36,1% menos de tokens por respuesta correcta que Qwen3.5-9B.
- Capacidades multilingües limitadas a inglés y chino.
- Comportamiento "uncensored": el rechazo fue eliminado mediante abliteration, por lo que el modelo responde a peticiones que otros modelos rechazarían.
- No es un especialista en código: el conjunto de destilación no incluye datos de programación.
- No se ha documentado soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso
- Razonamiento matemático y resolución de problemas STEM en local: el modelo puede resolver problemas de matemáticas, física y química con un rendimiento de 94,50% en GSM8K y 90,53% de media en MMLU-Pro (Math/Physics/Chemistry), ejecutándose íntegramente en un Mac sin conexión a servicios externos.
- Asistente conversacional de contexto largo: con 262.144 tokens de ventana y un coste de KV reducido por la atención lineal, es adecuado para mantener conversaciones o analizar documentos extensos (informes, transcripciones, código de investigación) en una sola pasada.
- Investigación sobre alineación y seguridad: al ser un modelo abliterado con métricas documentadas de eliminación de rechazo (3/100 negativas, KL 0,042), sirve como objeto de estudio para analizar el efecto de la abliteration en el comportamiento del modelo.
- Procesamiento de documentación técnica en inglés y chino: útil para resumir, extraer y reformular documentación bilingüe en entornos donde no se puede enviar datos a la nube.
- Prototipado rápido en Apple Silicon: gracias a su tamaño de 5,6 GB y a los aproximadamente 4,8 GB residentes en memoria, permite iterar en un Mac con 16 GB de memoria unificada sin infraestructura GPU dedicada.
- Generación de contenido en local con requisitos de privacidad: al ejecutarse en mlx-lm, LM Studio o NovaMLX, los datos no salen del dispositivo, lo que encaja en flujos de trabajo con información sensible.
- Evaluación comparativa de técnicas de cuantización: la conversión 4-bit afín con grupo 64 desde BF16 permite medir la degradación de calidad frente a la fuente en tareas de razonamiento.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-9B-MLX (heredado del base destilado) | Teacher DeepSeek-V4-Pro |
|---|---|---|
| GSM8K | 94,50% | 92,60% |
| MMLU-Pro (Math/Physics/Chemistry) | 90,53% de media | no disponible |
| Respuestas correctas por 1M de tokens de razonamiento | 316,8 | no disponible |
| Tokens por respuesta correcta vs Qwen3.5-9B | 36,1% menos | no disponible |

Rendimiento de inferencia (Mac Studio M4 Max, 128 GB, servidor NovaMLX):

| Métrica | Valor |
|---|---|
| Memoria residente | ~4,8 GB wired |
| Tiempo hasta el primer token | ~1,9 s |
| Velocidad de decodificación | ~32 tok/s |

Los benchmarks de calidad proceden de la model card del modelo base destilado; no se han publicado mediciones específicas de esta conversión MLX 4-bit.

## Requisitos de hardware
- VRAM/memoria unificada estimada: aproximadamente 4,8 GB residentes en memoria durante la inferencia, con un tamaño en disco de 5,6 GB. Se recomienda un mínimo de 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4), con mención explícita a Mac Studio M4 Max con 128 GB en las pruebas del autor. No está pensado para GPU NVIDIA ni AMD, ya que el formato es MLX.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y 16 GB o más de memoria unificada.
- Opciones de despliegue: NovaMLX, mlx-lm (comando `mlx_lm.generate`), LM Studio. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: ~1,9 s hasta el primer token y ~32 tok/s de decodificación en Mac Studio M4 Max con 128 GB; no se han publicado cifras para otros equipos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-MLX (este modelo) | 9,41 B | 262.144 | MLX 4-bit afín, grupo 64 | Apache 2.0 | Hugging Face, solo MLX |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,41 B | 262.144 | BF16 (fuente) | Apache 2.0 | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,41 B | 262.144 | BF16 | no disponible | Hugging Face |
| Qwen3.5-9B (base) | 9 B | no disponible | múltiples | no disponible | Hugging Face |

La comparación se limita a la propia cadena de derivación, ya que no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada. La diferencia principal entre las variantes es el formato (MLX 4-bit frente a BF16), el proceso de abliteration y el rendimiento en tokens por respuesta correcta (36,1% menos que Qwen3.5-9B según el autor).

## Limitaciones y advertencias
- Modelo "uncensored": el comportamiento de rechazo fue eliminado mediante abliteration, por lo que puede generar contenido dañino, ilegal o inapropiado. El usuario es responsable del uso y del cumplimiento de la legislación aplicable.
- No es un especialista en código: el conjunto de destilación no incluye datos de programación, por lo que su rendimiento en tareas de generación de código es limitado.
- Idiomas restringidos a inglés y chino; no se ha documentado soporte de castellano ni de otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la pérdida de precisión de la cuantización 4-bit frente a la fuente BF16; no se han publicado evaluaciones de la degradación introducida por la cuantización.
- La abliteration puede degradar capacidades generales: la model card reporta una divergencia KL de 0,042 respecto al base, lo que indica un cambio medible en la distribución de salida.
- Soporte limitado a runtimes MLX; no es desplegable en vLLM, llama.cpp, Ollama ni TGI, lo que restringe su uso a hardware Apple.
- No se ha documentado soporte de tool calling, agentes, visión ni audio, lo que limita su integración en pipelines automatizados complejos.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza del contenido generado por un modelo sin rechazo puede exponer al usuario a responsabilidades legales según la jurisdicción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/phucngodev/Qwen3.5-9B-MLX
- Modelo base (uncensored): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo destilado original: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Perfil del autor de la destilación: https://huggingface.co/Jackrong
- Perfil del autor de la abliteration: https://huggingface.co/xtools-at
- Herramienta Heretic: https://heretic-project.org
- NovaMLX (cuantización y servidor MLX): https://github.com/lucasliu/novamlx
