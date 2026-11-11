# aiquantgod/Hermit-MiniCPM5-2B-MLX-4bit

## Resumen

Hermit-MiniCPM5-2B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo SonGT1/MiniCPM5-abliterated-2B, publicada por el usuario aiquantgod. Se trata de un derivado de la familia MiniCPM5 de 2B parámetros, en su variante "abliterated" (con las capas de rechazo eliminadas mediante edición de pesos), empaquetada específicamente para su uso en la aplicación Hermit en iPhone y Mac mediante el framework MLX de Apple.

El modelo cuenta con 2.516.756.480 parámetros totales según los pesos en safetensors, y se distribuye en un repositorio de 1,4 GB. La conversión se realizó con mlx-lm usando group size 64 y 4,5 bits por peso, y se ajustó la clase del tokenizer a PreTrainedTokenizerFast para garantizar compatibilidad.

Su relevancia es acotada: no es un modelo nuevo ni un entrenamiento original, sino un artefacto de despliegue orientado a inferencia local en hardware Apple Silicon. Resulta útil para quien quiera ejecutar un modelo de 2B sin censura en dispositivos Apple, pero no aporta innovaciones arquitectónicas ni datos de entrenamiento propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MiniCPM5, segun el nombre del modelo base) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (group size 64, 4,5 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a MiniCPM5 en su variante de 2B parámetros, un transformer decoder-only. El modelo original del que deriva, SonGT1/MiniCPM5-abliterated-2B, es a su vez una versión "abliterated" de MiniCPM5, es decir, con los pesos modificados para eliminar el comportamiento de rechazo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La aportación técnica de este repositorio es exclusivamente la cuantización: conversión a 4 bits con mlx-lm (group size 64, 4,5 bits por peso) y ajuste de la clase del tokenizer a PreTrainedTokenizerFast para compatibilidad con la aplicación Hermit. No se documentan innovaciones como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base MiniCPM5-2B.
- Comportamiento sin rechazo (abliterated): el modelo no aplica las capas de alineación de seguridad originales.
- Inferencia local en Apple Silicon mediante MLX.
- Integración con la aplicación Hermit para iPhone y Mac.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Visión, audio o thinking mode: no disponible.

## Casos de uso

- Inferencia local en iPhone y Mac: el formato MLX 4-bit y el tamaño de 1,4 GB permiten ejecutar el modelo en dispositivos Apple Silicon con memoria unificada, sin conexión a red.
- Prototipado de aplicaciones iOS/macOS: la integración con Hermit y la clase de tokenizer ajustada facilitan incorporar generación de texto en apps nativas.
- Experimentación con modelos sin censura: útil para investigación sobre comportamiento de modelos abliterated en entornos controlados y locales.
- Generación de texto creativo sin filtros: para casos donde se requiere continuidad estilística sin rechazos, siempre con revisión humana.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de una cuantización 4-bit MLX frente al modelo base en fp16/bf16.
- Docencia y demos offline: el tamaño reducido y la licencia Apache-2.0 permiten distribuirlo en talleres y entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: en torno a 1,4-2 GB para los pesos en 4-bit, más overhead de contexto y runtime MLX.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El formato MLX no es compatible con GPU NVIDIA ni AMD de forma nativa.
- Cabe en GPU de consumo Apple: sí, en cualquier chip de la serie M con al menos 8 GB de memoria unificada.
- Opciones de despliegue: mlx-lm, aplicación Hermit. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión previa a otro formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Hermit-MiniCPM5-2B-MLX-4bit | 2,52 B | no disponible | 4-bit MLX | Apache-2.0 | safetensors MLX |
| SonGT1/MiniCPM5-abliterated-2B (base) | ~2 B | no disponible | fp16/bf16 (presumible) | Apache-2.0 | safetensors |
| MiniCPM5-2B (original) | ~2 B | no disponible | múltiples | no disponible | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated": se han eliminado los mecanismos de rechazo, por lo que puede generar contenido dañino, ofensivo o inseguro sin filtro. No apto para producción orientada al usuario final sin moderación externa.
- Riesgo elevado de alucinación inherente a un modelo de 2B parámetros.
- La cuantización a 4 bits puede degradar la calidad frente al modelo base en fp16/bf16, especialmente en tareas de razonamiento y matemáticas.
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- Longitud de contexto no documentada.
- Exclusivo para Apple Silicon: no ejecutable en GPU NVIDIA/AMD sin reconversión.
- Aunque la licencia es Apache-2.0, el uso comercial de un modelo sin alineación de seguridad conlleva riesgos reputacionales y legales según jurisdicción.
- Repositorio con 73 descargas y 0 likes: sin validación comunitaria significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aiquantgod/Hermit-MiniCPM5-2B-MLX-4bit
- Modelo base: https://huggingface.co/SonGT1/MiniCPM5-abliterated-2B
- Framework MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
