# rapid-mlx/Hy4-flash-MLX-4bit

## Resumen

Hy4-flash-MLX-4bit es una compilación cuantizada del modelo Hy4-flash de Tencent, publicada por el usuario rapid-mlx y optimizada específicamente para su ejecución en Macs con Apple Silicon y memoria unificada. El modelo original es un transformer de arquitectura MoE (mixture of experts) con 218.938.886.165 parámetros totales, del que esta versión conserva únicamente la torre de texto: se ha eliminado el codificador de visión (ViT), el proyector MLP y las capas del drafter DFly2, por lo que es un modelo estrictamente textual.

El interés de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo MoE de más de 200.000 millones de parámetros en hardware de consumo de gama alta (Mac Studio o Mac Pro con 128 GB de memoria unificada), algo impensable hace pocos años. Para ello, el autor ha recuantizado los pesos desde el formato FP8 original a 4 bits mediante GPTQ con redondeo consciente de calibración en las proyecciones de los expertos enrutados, manteniendo en 8 bits la atención, el indexador, la capa densa y los expertos compartidos, y en bf16 los embeddings y la cabeza LM.

La relevancia actual del modelo es doble: por un lado, ofrece una vía práctica para desplegar localmente un modelo de razonamiento y código de gran escala sin depender de la nube; por otro, su licencia Tencent Hy License 1.0 impone condiciones comerciales específicas (especialmente para el modelo como servicio), lo que conviene evaluar antes de integrarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con tablas Engram |
| Parámetros totales | 218.938.886.165 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ 4 bits (expertos enrutados: gate/up 4-bit grupo 64; down 5 o 6 bits por capa), 8 bits (atención, indexador, capa densa, expertos compartidos), 4 bits (tablas Engram), bf16 (embeddings y LM head) |
| Idiomas soportados | no disponible (la evaluación incluye inglés, chino, japonés, código, matemáticas, ciencia y finanzas) |
| Licencia | Tencent Hy License, Version 1.0 (basada en Apache 2.0 con términos comerciales adicionales en la sección 10) |
| Formato de pesos | safetensors en layout MLX (2.747 tensores) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo MoE con tablas Engram, una innovación del autor original que permite almacenar representaciones adicionales en SSD y leerlas bajo demanda, reduciendo así la huella de memoria en RAM. Esta compilación MLX conserva esa arquitectura, pero sustituye las proyecciones de los expertos enrutados por versiones cuantizadas a 4 bits (GPTQ, grupo 64) y deja las proyecciones down en 5 o 6 bits según la capa, aplicando redondeo al más cercano. La atención, el indexador, la capa densa y los expertos compartidos se mantienen en 8 bits, mientras que los embeddings y la cabeza LM permanecen en bf16 sin cuantizar. El tokenizador, la plantilla de chat y la configuración de generación son idénticos a los del modelo original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original utilizó RLHF o DPO. La model card tampoco detalla innovaciones de decodificación especulativa en esta compilación, ya que el drafter DFly2 fue eliminado explícitamente. El proceso de cuantización sí incluye una evaluación de error frente al original FP8: la KL mediana por token es de 0,0006 nats, la media de 0,21 nats y la coincidencia top-1 del 92,6% (99,4% cuando el FP8 original tiene más del 90% de confianza).

## Capacidades

- Generación de texto conversacional y de razonamiento de múltiples pasos, con modo de pensamiento (thinking) habilitado en las evaluaciones.
- Razonamiento matemático y científico de nivel avanzado (GSM8K, GPQA Diamond, MMLU-Pro).
- Generación de código y resolución de problemas de programación (MBPP+).
- Capacidades multilingües limitadas a lo observado en la evaluación: inglés, chino y japonés; el resto de idiomas no está documentado.
- Seguimiento de instrucciones complejas (IFEval) con formatos estrictos y laxos.
- No soporta tool calling ni function calling de forma documentada en esta compilación.
- No soporta visión, audio ni entrada multimodal: el codificador visual fue eliminado.
- No incluye decodificación especulativa (drafter DFly2 eliminado).

## Casos de uso

- Asistente de razonamiento local en Mac Studio: un desarrollador puede ejecutar el modelo en local con Rapid-MLX y usarlo para resolver problemas de matemáticas, ciencia o lógica sin enviar datos a la nube, aprovechando los 128 GB de memoria unificada.
- Generación de código en estaciones de trabajo Apple: con MBPP+ de 93,1 pass@1, el modelo es adecuado para autocompletar funciones, generar tests o revisar parches en un flujo de trabajo de desarrollo local.
- Análisis de documentación técnica extensa: aunque la longitud de contexto no está documentada, el modelo puede procesar prompts largos con few-shot, como demuestran las evaluaciones con 8 y 5 disparos.
- Investigación en cuantización: sirve como caso de estudio para medir el impacto de GPTQ 4 bits frente a FP8 en un MoE de gran escala, con métricas de KL y coincidencia top-1 publicadas.
- Evaluación comparativa de modelos MoE en hardware de consumo: útil para ingenieros que necesiten medir latencia y throughput reales en Apple Silicon antes de decidir un despliegue.
- Prototipado de asistentes conversacionales multilingües (inglés, chino, japonés) en entornos con requisitos de privacidad, ejecutando una sola petición a la vez en un Mac de 128 GB.
- Docencia y demostraciones: permite mostrar en un equipo de sobremesa el comportamiento de un modelo de 218.000 millones de parámetros, con la advertencia de que el throughput es de 7 a 8 tok/s.

## Benchmarks y rendimiento

| Benchmark | Muestras | Métrica | Puntuación |
|---|---:|---|---:|
| GPQA Diamond (generativo) | 198 (conjunto completo) | exact match | 80,8 ± 2,8 |
| MMLU-Pro | 700 (50 por asignatura, 14 asignaturas) | exact match, 5-shot | 83,3 ± 1,4 |
| GSM8K (CoT) | 500 | exact match, 8-shot | 95,6 ± 0,9 |
| IFEval | 541 prompts (completo) | prompt strict / loose | 83,4 / 87,1 |
| IFEval | 541 prompts (completo) | instruction strict / loose | 87,9 / 91,0 |
| C-Eval (generativo) | 1.195 (hasta 30 por asignatura, 52 asignaturas) | exact match | 88,9 ± 0,9 |
| CMMLU (generativo) | 1.340 (20 por asignatura, 67 asignaturas) | exact match | 88,1 ± 0,9 |
| MBPP+ (instruct) | 378 (completo) | pass@1 | 93,1 ± 1,3 |

Error de cuantización frente al FP8 original (16 respuestas, 4.902 tokens):

| Métrica | Esta compilación |
|---|---:|
| KL mediana por token | 0,0006 nats |
| KL media por token | 0,21 nats |
| Coincidencia top-1 | 92,6% |
| Coincidencia top-1 con FP8 >90% de confianza | 99,4% |

Referencia de ruido (subconjunto de 6 respuestas, 1.436 tokens): KL media de 0,25 nats frente a 0,14 nats del FP8 con ruido gaussiano de 1e-4 en los embeddings de entrada; coincidencia top-1 del 90,7% frente al 94,3%.

Rendimiento en M3 Ultra: 7 a 8 tok/s con una petición codiciosa de hasta 400 tokens nuevos. Memoria Metal activa máxima de 101,6 GB con una petición (100,2 GB tras la carga) y 111,0 GB con cuatro peticiones concurrentes.

## Requisitos de hardware

- VRAM/memoria unificada: unos 100 GB en memoria tras la carga; pico de 111 GB con cuatro peticiones concurrentes. Se recomienda un Mac con 128 GB de memoria unificada o más.
- Almacenamiento: 139 GB en disco y aproximadamente 160 GB de SSD libre; las tablas Engram se leen desde SSD bajo demanda.
- GPU recomendadas: Apple Silicon de gama alta (M3 Ultra o superior). No se documenta soporte para GPU NVIDIA, AMD ni otros aceleradores.
- Cabe en GPU de consumo: no en el sentido habitual; requiere un Mac de 128 GB de memoria unificada, no una RTX 4090 ni similares.
- Opciones de despliegue: Rapid-MLX 1.1.1 o superior, con endpoint compatible con OpenAI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7 a 8 tok/s en M3 Ultra con una petición codiciosa. En un Mac de 128 GB se recomienda una petición a la vez y cerrar aplicaciones que consuman mucha memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-flash-MLX-4bit (esta ficha) | 218.938.886.165 | no disponible | Tencent Hy License 1.0 | Hugging Face, MLX |
| tencent/Hy4-flash-FP8 (modelo base) | no disponible en la información | no disponible | Tencent Hy License 1.0 | Hugging Face, FP8 |
| Otros modelos MoE de escala similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo es sensible a perturbaciones muy pequeñas en las entradas: la coincidencia top-1 baja al 92,6% frente al FP8, aunque se mantiene en el 99,4% cuando el original tiene alta confianza.
- La KL media (0,21 nats) está dominada por un pequeño porcentaje de tokens con continuaciones casi equiprobables; conviene revisar la calidad en dominios específicos antes de producción.
- Solo texto: no hay visión, audio ni multimodalidad. Tampoco hay decodificación especulativa.
- Idiomas documentados: inglés, chino y japonés; el resto no está verificado y puede degradarse.
- Licencia Tencent Hy License 1.0: operar un negocio de Model-as-a-Service requiere licencia escrita adicional de Tencent. Revisar la sección 10 antes de usar o redistribuir.
- Esta compilación es un derivado no afiliado ni respaldado por Tencent; el autor original no asume responsabilidad sobre ella.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de sesgo.
- Throughput bajo (7-8 tok/s) y requisito de memoria muy alto: no apto para cargas concurrentes en un solo equipo de 128 GB.
- La longitud de contexto no está documentada, lo que limita la planificación de casos de uso con prompts muy largos.

## Enlaces

- Hugging Face: https://huggingface.co/rapid-mlx/Hy4-flash-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- Repositorio Rapid-MLX: https://github.com/raullenchai/Rapid-MLX
- Licencia: LICENSE incluida en el repositorio del modelo
