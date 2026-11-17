# hahayhe/test-time-dreaming-graph-co-evolution-9B

## Resumen

Test-Time Dreaming Graph Co-Evolution 9B es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-9B, publicado por el usuario hahayhe. Se trata del checkpoint final de la ejecución de SFT de trayectorias descrita en el segundo paper del autor, orientada a un corpus de ejemplos a nivel de llamada (call-level). El modelo conserva la arquitectura multimodal image-text-to-text del modelo base y se distribuye con pesos completos en BF16, sin necesidad de fusionar adaptadores.

El modelo resuelve el problema de especializar un LLM multimodal de 9.400 millones de parámetros en un dominio de datos concreto mediante entrenamiento supervisado sobre 100.116 ejemplos, con un límite de 32.768 tokens por muestra y un tamaño de lote efectivo de 256. El entrenamiento cubrió 1.176 pasos de optimizador durante 3 épocas, aplicando la pérdida únicamente a la respuesta final del asistente, incluyendo razonamiento y respuesta.

Su relevancia es acotada: se publica como artefacto de investigación con licencia Apache 2.0, sin evaluación de calidad en generación multimodal ni benchmarks publicados. Es útil para quien quiera reproducir o inspeccionar el efecto de este SFT sobre Qwen3.5-9B, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (límite de entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en BF16; no se publican GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con torre de visión y proyector multimodal, y conserva la configuración del procesador de imagen y vídeo del modelo base. El ajuste fino se realizó con SFT sobre 100.116 ejemplos a nivel de llamada, con un límite de 32.768 tokens, un tamaño de lote efectivo de 256 y 1.176 pasos de optimizador repartidos en 3 épocas. La pérdida se aplicó exclusivamente a la respuesta final del asistente, incluyendo el razonamiento y la respuesta, lo que concentra el aprendizaje en la generación final y no en turnos intermedios.

La torre de visión y el proyector multimodal se congelaron durante el entrenamiento, de modo que la especialización afecta únicamente al componente lingüístico. El resultado se distribuye como pesos completos en BF16, sin adaptadores que fusionar. No se documentan detalles sobre composición del dataset, técnicas de RLHF/DPO ni innovaciones de decodificación.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con la torre de visión congelada.
- Razonamiento explícito en la respuesta final, ya que la pérdida se aplicó sobre razonamiento y respuesta.
- Ajuste específico al formato de datos de "call-level examples" del corpus de entrenamiento.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre SFT de trayectorias: el checkpoint permite reproducir y analizar el efecto de 1.176 pasos de SFT sobre Qwen3.5-9B con pérdida restringida a la respuesta final, útil para estudiar cómo se desplaza la distribución de salida.
- Evaluación de especialización a nivel de llamada: sirve para comparar el comportamiento del modelo base frente al ajustado en tareas estructuradas como las del corpus de 100.116 ejemplos.
- Experimentos de congelación de la torre de visión: al mantener la torre y el proyector congelados, permite aislar el efecto del ajuste lingüístico en tareas image-text-to-text.
- Base para nuevos ajustes: al distribuirse en BF16 con pesos completos y licencia Apache 2.0, puede emplearse como punto de partida para SFT o DPO posteriores sin fusionar adaptadores.
- Análisis de razonamiento supervisado: dado que la pérdida cubre razonamiento y respuesta, es adecuado para estudiar la calidad de las cadenas de razonamiento generadas en el dominio del corpus.
- Despliegue en entornos de investigación con GPU única: con 9.400 millones de parámetros en BF16 (unos 18,8 GB de pesos), cabe en GPUs de 24 GB o más para inferencia en precisión reducida, lo que facilita experimentación local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 18,8 GB (tamaño del repositorio), por lo que la inferencia en BF16 requiere al menos 24 GB de VRAM contando caché KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto moderado; para el contexto máximo de 32.768 tokens conviene A100/H100 por el coste de la caché KV.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto reducido; en GPUs de 16 GB sería necesario cuantizar, aunque no se publican cuantizaciones oficiales.
- Opciones de despliegue: transformers con PyTorch y CUDA (según requirements-inference.txt e inference.py del repositorio); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Test-Time Dreaming Graph Co-Evolution 9B | 9.409.813.744 | 32.768 (entrenamiento) | Apache 2.0 | Hugging Face, 9 descargas | SFT multimodal, sin benchmarks |
| Qwen/Qwen3.5-9B (modelo base) | ~9.400 millones | no disponible | no disponible en la información | Hugging Face | Modelo original sin el SFT de este repositorio |
| Alternativas de 9B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- No se evaluó la calidad de generación multimodal de este SFT, según indica el propio autor.
- No hay benchmarks publicados, por lo que se desconoce si el ajuste mejora o degrada el rendimiento frente al modelo base.
- La torre de visión y el proyector están congelados: el ajuste no especializa la percepción visual.
- El entrenamiento se limitó a 32.768 tokens, lo que acota el contexto práctico aunque la arquitectura base pudiera soportar más.
- Riesgo de alucinación y sesgos: no documentados; al ser un SFT sobre datos propietarios del autor, pueden aparecer sesgos específicos del corpus.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe equilibrado.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene verificar las condiciones del modelo base.
- Repositorio con 9 descargas y 0 likes: sin validación comunitaria ni mantenimiento demostrado.
- Requiere instalar dependencias específicas (requirements-inference.txt) y ejecutar inference.py; no hay integración documentada con servidores de inferencia estándar.

## Enlaces

- Hugging Face: https://huggingface.co/hahayhe/test-time-dreaming-graph-co-evolution-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
