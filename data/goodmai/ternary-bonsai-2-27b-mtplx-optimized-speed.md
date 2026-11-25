# goodmai/Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed

## Resumen

Ternary Bonsai 2 27B MTPLX Optimized Speed es una redistribución optimizada para Apple Silicon del modelo Ternary Bonsai 2 27B de Prism ML, que a su vez es una reconstrucción con pesos ternarios del Qwen 3.8 27B. La publica el usuario goodmai (con origen en el repositorio de Youssofal) empaquetada para MTPLX, un runtime nativo de macOS que implementa decodificación especulativa mediante predicción multi-token (MTP) sobre los kernels de GPU de Apple. El objetivo es ejecutar un modelo de 27.359 millones de parámetros en Macs con 16 GB de memoria unificada o más, manteniendo visión y una calidad cercana al modelo completo.

La propuesta técnica es doble: por un lado, la cuantización ternaria (pesos en −1, 0 o +1 con una escala por grupo) reduce el modelo de lenguaje a 7,67 GB y el paquete completo a 8,85 GB de descarga; por otro, la cabeza MTP del Qwen 3.8 27B original genera borradores que el modelo completo verifica en una sola pasada, acelerando la decodificación sin alterar la distribución de salida. Según el autor, el resultado rinde un 98,2 % de la media de benchmarks del modelo completo y supera en velocidad al Qwen 3.8 27B en 4 bits usando la mitad de memoria.

Es relevante porque demuestra una vía práctica para inferencia local de un modelo de escala 27B en hardware de consumo Apple, con licencia Apache 2.0 y soporte de image-text-to-text. La información disponible procede de la model card del autor y de los metadatos de Hugging Face; no hay publicación independiente de resultados ni documentación de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen 3.8 27B) con pesos ternarios y cabeza de predicción multi-token (MTP); torre de visión incluida |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en Macs de 16 GB; 20.480 en 18 GB; 94.208 en 24 GB; hasta 262.144 |
| Tipos de cuantizacion | Ternaria (2 bits efectivos: −1, 0, +1 con escala por grupo); pesos de lenguaje en 7,67 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (runtime MTPLX, `mtplx_runtime.json` como contrato de servicio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen 3.8 27B (transformer denso con torre de visión para entrada image-text-to-text) y sustituye los pesos del modelo de lenguaje por pesos ternarios con una escala por grupo, técnica desarrollada por Prism ML bajo el nombre Bonsai. Sobre esa base, MTPLX añade kernels de GPU específicos para la rotación de Prism ML y para la multiplicación de matrices ternaria, de modo que los pesos se ejecutan de forma nativa en Apple Silicon en lugar de descomprimirse a punto flotante. La cabeza MTP del Qwen 3.8 27B actúa como modelo borrador con profundidad 1: propone tokens que el modelo completo verifica en una única pasada, y los borradores se aceptan con la regla de ratio de probabilidad más remuestreo residual, lo que según el autor preserva la distribución del modelo a cualquier temperatura.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base Qwen 3.8 27B, ni sobre el procedimiento exacto de ternarización de Prism ML (más allá de la descripción de pesos en −1, 0, +1 con escala por grupo). El autor indica que el modelo conserva el 98,2 % de la media de benchmarks del modelo completo y que el esfuerzo de razonamiento es "medium" por defecto, con "xhigh" disponible, lo que sugiere que el modelo base incorpora modos de razonamiento configurables.

## Capacidades

- Generación de texto y conversación multi-turno en el pipeline image-text-to-text.
- Razonamiento con esfuerzo configurable: "medium" por defecto y "xhigh" disponible.
- Comprensión de imágenes mediante la torre de visión del Qwen 3.8 27B.
- Generación de código, con etiquetas y casos de uso orientados a clientes de agente como OpenCode y Claude Code.
- Decodificación especulativa con MTP de profundidad 1, exacta a cualquier temperatura según el autor.
- Ejecución local en macOS sobre Apple Silicon, sin Python en el caso de la app Basalt (Swift 6.4, macOS 27+).
- Soporte de contexto largo escalado por memoria: de 8.192 a 262.144 tokens.
- No se documenta soporte explícito de tool calling, function calling ni audio en la información disponible.

## Casos de uso

- Asistencia de código en local: el modelo puede integrarse en clientes de agente como OpenCode o Claude Code sobre un MacBook, generando y revisando código sin enviar el contexto a la nube; el autor lo recomienda con 18 GB o más de memoria unificada para estos clientes.
- Análisis de imágenes con descripción textual: al conservar la torre de visión, permite flujos de image-text-to-text (por ejemplo, extraer información de capturas o diagramas) en un equipo de 16 GB.
- Procesamiento de documentos largos: con 94.208 tokens de contexto en Macs de 24 GB, admite resúmenes y preguntas sobre expedientes extensos en una sola ventana.
- Prototipado y evaluación de modelos en investigación: permite estudiar el comportamiento de pesos ternarios y decodificación especulativa MTP con un modelo de 27B en hardware de consumo, sin clúster de GPU.
- Desarrollo offline y entornos con restricciones de privacidad: al ejecutarse íntegramente en local, es adecuado para trabajar con datos que no pueden salir del dispositivo.
- Servicio local ligero con API REST: el comando `basalt serve --model ... --mtp --rest` expone el modelo como servicio en la propia máquina para otras aplicaciones.
- Comparación de estrategias de cuantización: sirve como referencia práctica frente al Qwen 3.8 27B en 4 bits, con métricas de velocidad y memoria publicadas por el autor.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad y memoria en un MacBook Pro M5 Max con 128 GB, con temperatura 1,0, top-p 0,95, top-k 20, razonamiento desactivado y 512 tokens generados, en MTPLX 2.12.0 (22 de septiembre de 2026):

| Prompt | Bonsai 2 27B Optimized Speed | Qwen 3.8 27B Optimized Speed | Memoria pico (Bonsai / 27B) |
|---|---:|---:|---:|
| 4.061 tokens | 64,4 tok/s | 52,6 tok/s | 11,4 / 23,9 GB |
| 16.350 tokens | 57,1 tok/s | 51,0 tok/s | 14,6 / 27,0 GB |

Además, el autor cita una cifra de Prism ML para Bonsai 2 27B en un M5 Max con MLX de 46,8 tok/s, frente a los 64,4 tok/s que reporta en MTPLX tras un prompt de 4.061 tokens. Como dato de calidad, se afirma que el modelo conserva el 98,2 % de la media de benchmarks del Qwen 3.8 27B completo, pero no se desglosan resultados por benchmark (MMLU, HumanEval, GSM8K u otros). No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- Descarga de 8,85 GB; pesos del modelo de lenguaje en 7,67 GB.
- Memoria unificada mínima: 16 GB; 18 GB o más recomendados para clientes de agente como OpenCode.
- Memoria pico en servicio: 11,4 GB con prompt de 4K y 14,6 GB con prompt de 16K.
- Hardware: Apple Silicon (M3, M4 y M5), incluidos MacBook Air, MacBook Pro y Mac Mini; el autor lo sitúa como primera recomendación en M3/M4/M5 con 16 a 31 GB.
- No está pensado para GPU NVIDIA ni para CUDA; el runtime MTPLX es específico de macOS y Apple Silicon.
- Despliegue: app MTPLX 2.12.0 o posterior, CLI `pip install mtplx` y `mtplx serve`, o la app Basalt v0.11.0 (macOS 27+, Swift 6.4, sin Python) con `basalt serve --model ... --mtp --rest`.
- Throughput medido: 64,4 tok/s con prompt de 4.061 tokens y 57,1 tok/s con prompt de 16.350 tokens en M5 Max de 128 GB.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria pico (prompt 4K) | Velocidad (M5 Max) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary Bonsai 2 27B MTPLX Optimized Speed | 27,36 B (ternario) | 8.192–262.144 según RAM | 11,4 GB | 64,4 tok/s | Apache 2.0 | Hugging Face, runtime MTPLX/Basalt |
| Qwen 3.8 27B Optimized Speed (4 bits) | 27 B (4 bits) | no disponible | 23,9 GB | 52,6 tok/s | Apache 2.0 (modelo base) | Hugging Face, runtime MTPLX |
| Ternary Bonsai 2 27B (MLX 2 bits, Prism ML) | 27 B (ternario) | no disponible | no disponible | 46,8 tok/s (MLX, M5 Max) | Apache 2.0 | Hugging Face, MLX |
| MiMo V2.6 Qwen 9B Optimized Speed | 9 B | no disponible | no disponible | no disponible | no disponible | Hugging Face, runtime MTPLX |

La comparativa se limita a los modelos citados por el autor; no se dispone de datos de otros modelos de 27B con cuantización agresiva para confrontar parámetros, contexto y rendimiento de forma independiente.

## Limitaciones y advertencias

- Dependencia total del runtime MTPLX (y de la app Basalt): no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue fuera de macOS y Apple Silicon.
- El contexto efectivo depende de la memoria unificada del equipo: 8.192 tokens en 16 GB frente a 262.144 en configuraciones superiores; planificar el caso de uso según el hardware.
- La cuantización ternaria, aunque el autor afirma conservar el 98,2 % de la media de benchmarks, implica una pérdida de precisión no desglosada por tarea; conviene validar en el dominio concreto antes de producción.
- La decodificación especulativa MTP se declara exacta a cualquier temperatura, pero es una afirmación del autor sin verificación independiente en la información disponible.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni idiomas soportados; al derivar del Qwen 3.8 27B, hereda las características de este, no detalladas aquí.
- El repositorio tiene 353 descargas y 0 likes, y la model card está redactada en gran parte en ruso e inglés; la documentación técnica en castellano es inexistente.
- La licencia Apache 2.0 permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE.txt` del repositorio; verificar las condiciones del modelo base Qwen 3.8 27B y de la obra derivada de Prism ML.
- Las cifras de rendimiento proceden de un único equipo (M5 Max, 128 GB) y de una versión concreta del runtime (MTPLX 2.12.0); no son extrapolables sin medición propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed
- Repositorio de origen citado por el autor: https://huggingface.co/Youssofal/Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Hermano en 4 bits: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed
- Hermano MiMo V2.6 Qwen 9B: https://huggingface.co/Youssofal/MiMo-V2.6-Qwen-9B-MTPLX-Optimized-Speed
- Runtime MTPLX: https://mtplx.com
- App Basalt (release v0.11.0): https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Sitio de Basalt: https://bas-alt.vercel.app
- Lanzador Basalt en Hugging Face Spaces: https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FTernary-Bonsai-2-27B-MTPLX-Optimized-Speed&role=mtp
