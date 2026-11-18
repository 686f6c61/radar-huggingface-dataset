# Jundot/Qwen3.8-27B-oQ8e-mtp

## Resumen

Qwen3.8-27B-oQ8e-mtp es una cuantización de precisión mixta en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de visión y lenguaje de 27.781 millones de parámetros construido sobre la arquitectura Qwen3.5. Lo publica el usuario Jundot mediante la herramienta oQ (oMLX v0.7.1), que asigna bits por capa según la sensibilidad medida de cada una en lugar de aplicar una cuantización uniforme. El checkpoint incluye el backbone de lenguaje, el codificador visual y la cabeza de predicción multi-token (MTP), con un promedio efectivo de 8,639 bits por peso.

El interés de esta ficha es doble. Por un lado, documenta una técnica de cuantización mixta orientada a preservar calidad en modelos multimodales grandes cuando se despliegan en hardware Apple Silicon mediante MLX. Por otro, permite ejecutar un modelo de 27B con contexto nativo de 262.144 tokens y comprensión de imagen y vídeo en un espacio de almacenamiento de unos 30 GB, lo que lo sitúa en el rango de equipos con memoria unificada de 32 GB o superior.

La licencia Apache-2.0 del modelo base se mantiene en esta cuantización, lo que facilita su uso comercial. No obstante, la model card no aporta información sobre idiomas soportados, datos de entrenamiento ni resultados de benchmarks, por lo que las secciones correspondientes se limitan a lo verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con layout híbrido de capas Gated DeltaNet y Gated Attention (arquitectura Qwen3.5), más codificador visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ8e mixta: affine 8-bit grupo 64 (98,143% de los pesos) + BF16 (1,857%); promedio efectivo 8,639 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896B | 28,579 GB / 26,617 GiB |
| Codificador visual | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,500 GB / 0,466 GiB |
| Total | 27,781B | 30,001 GB / 27,941 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 que combina dos tipos de capas: Gated DeltaNet y Gated Attention. Esta disposición híbrida alterna mecanismos de atención lineal con estado recurrente y atención clásica, un patrón habitual para reducir el coste de memoria del contexto largo sin renunciar a la calidad de recuperación de información. A ello se suma un codificador visual de 0,461B de parámetros que habilita entrada de imagen y vídeo, y una cabeza de predicción multi-token (MTP) de 0,425B que permite decodificación especulativa interna y acelera la generación.

La cuantización oQ8e no es uniforme: mide la sensibilidad de cada capa, asigna un número de bits en consecuencia y redondea cada grupo con una matriz de importancia calculada sobre 128 muestras de 512 tokens, seguida de un reajuste por mínimos cuadrados ponderados de escala y sesgo. El resultado es que el 98,143% de los pesos queda en affine 8-bit con grupo de 64, mientras que el 1,857% restante se conserva en BF16, presumiblemente en las capas más sensibles. La model card fue actualizada el 2026-10-11 con una versión mejorada del algoritmo, por lo que las copias anteriores deben descargarse de nuevo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de hasta 262.144 tokens.
- Comprensión de imagen y vídeo mediante el codificador visual integrado (pipeline image-text-to-text).
- Generación de código y resolución de problemas matemáticos, heredadas del modelo base Qwen3.8-27B.
- Decodificación especulativa nativa mediante la cabeza MTP, que acelera la inferencia sin modelo borrador externo.
- Capacidades multilingües: no disponibles en la documentación, aunque el modelo base Qwen suele cubrir múltiples idiomas.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la model card.

## Casos de uso

- Análisis de documentos largos con imágenes intercaladas: informes financieros, contratos escaneados o manuales técnicos de cientos de páginas caben en la ventana de 262.144 tokens, permitiendo preguntas sobre el documento completo sin fragmentación ni recuperación externa.
- Asistencia sobre capturas y diagramas en entornos de desarrollo: el modelo puede recibir una captura de pantalla de un stack trace o de un diagrama de arquitectura y generar explicaciones o parches de código, aprovechando la combinación de visión y generación de código.
- Procesamiento de vídeo para resumen y extracción de eventos: transcripción de lo relevante en grabaciones de reuniones o material de vigilancia, con la ventaja de que el contexto largo permite cubrir secuencias extensas en una sola pasada.
- Despliegue local en estaciones de trabajo Apple Silicon: con 27,941 GiB de pesos, encaja en equipos con memoria unificada de 32 GB o más, lo que habilita prototipado y uso privado sin enviar datos a la nube.
- Evaluación de calidad de cuantizaciones: sirve como referencia para comparar la degradación de un 8-bit mixto frente al BF16 original en tareas multimodales, útil para equipos que calibran pipelines de compresión.
- Generación aumentada por recuperación sobre corpus técnicos: la ventana de 262.144 tokens permite inyectar muchos fragmentos recuperados a la vez, reduciendo la necesidad de reordenar y filtrar agresivamente antes de la generación.
- Investigación en decodificación especulativa: la cabeza MTP incluida permite experimentar con estrategias de aceptación de tokens y medir la ganancia de throughput frente a la decodificación autorregresiva estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 27,941 GiB solo para pesos; con overhead de KV cache y activaciones, se recomienda un mínimo de 32 GB y, para contexto largo, 64 GB o más.
- Hardware objetivo: Apple Silicon con MLX (series M1/M2/M3/M4 Pro, Max y Ultra). El formato safetensors MLX no es directamente utilizable en CUDA sin conversión.
- GPU NVIDIA: no es el destino de este checkpoint; requeriría reconvertir los pesos a un formato compatible (por ejemplo, GGUF o safetensors estándar) y perdería la disposición específica de MLX.
- Cabe en GPU de consumo: en el ecosistema Apple, sí en equipos con 32 GB de memoria unificada o superior; en NVIDIA, no sin conversión previa.
- Opciones de despliegue: MLX y oMLX son las vías naturales; llama.cpp, Ollama, vLLM y TGI no consumen este formato de forma nativa.
- Latencia y throughput: no disponibles en la documentación proporcionada. La cabeza MTP debería reducir el coste por token generado, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ8e-mtp (este) | 27,781B | 262.144 | Imagen, vídeo y texto | Apache-2.0 | MLX safetensors, 8,639 bits/peso |
| Qwen/Qwen3.8-27B (base) | 27,781B | 262.144 | Imagen, vídeo y texto | Apache-2.0 | Safetensors BF16 |
| Cuantizaciones GGUF de la familia Qwen3.5-27B | 27B aprox. | 262.144 (según implementación) | Imagen y texto | Apache-2.0 | GGUF Q4/Q8 |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada. Frente al modelo base, la diferencia principal es el tamaño (27,941 GiB frente a aproximadamente 55 GB en BF16) y la preservación selectiva de capas sensibles en 16 bits.

## Limitaciones y advertencias

- La cuantización a 8,639 bits/peso introduce una pérdida de calidad respecto al BF16 original; la magnitud no está cuantificada en la model card.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo base ni de esta versión.
- El soporte de idiomas no está documentado; no debe asumirse un rendimiento multilingüe homogéneo sin validación previa.
- El formato MLX limita el despliegue a hardware Apple; no es portable a CUDA, ROCm ni TPU sin conversión y posible degradación.
- El contexto de 262.144 tokens exige memoria adicional para la KV cache; en equipos de 32 GB el contexto práctico será mucho menor que el nominal.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar la licencia del modelo base y de cualquier componente de terceros incluido en el codificador visual.
- La model card advierte de que hubo una recuantización el 2026-10-11; conviene confirmar la fecha de descarga para evitar versiones obsoletas.
- No se documentan capacidades de tool calling ni de razonamiento agéntico, por lo que no deben darse por sentadas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Pull request de la cuantización mejorada oQe: https://github.com/jundot/omlx/pull/4385
