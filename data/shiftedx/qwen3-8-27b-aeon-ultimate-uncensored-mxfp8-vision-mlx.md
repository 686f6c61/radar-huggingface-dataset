# Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp8-vision-mlx

## Resumen

Este modelo es una conversión independiente a formato MLX con cuantización MXFP8 del checkpoint `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, un modelo de la familia Qwen3.5 con capacidades multimodales (imagen a texto) y un alineamiento deliberadamente eliminado (abliterado). La conversión ha sido realizada por el usuario Shiftedx y publicada bajo licencia Apache-2.0, con el objetivo de ofrecer una versión ejecutable en Apple Silicon mediante la librería MLX.

El modelo presenta una arquitectura densa híbrida de atención/GDN con 64 capas de lenguaje, un contexto configurado de 262 144 tokens y un tamaño real de aproximadamente 8 000 millones de parámetros según los safetensors, a pesar de que la nomenclatura del nombre sugiere 27B. Incluye componentes de visión preservados en BF16 y está pensado para tareas de generación de texto e imagen a texto. Su carácter experimental y su falta de alineación lo hacen adecuado únicamente para entornos de investigación controlados, no para producción.

La relevancia de este lanzamiento radica en que demuestra la viabilidad de cuantizar modelos multimodales complejos en formato MXFP8 para MLX, aunque el autor advierte explícitamente de que la cuantización no restaura la seguridad del modelo original y que el uso en producción conlleva responsabilidades legales y éticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-family hybrid attention/GDN, denso, 64 capas de lenguaje |
| Parametros totales | 8 027 131 120 (~8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (configurado, no exhaustivamente cualificado) |
| Tipos de cuantizacion | MXFP8 (8-bit, group size 32) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con tensores de vision en BF16 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.5, con una combinación híbrida de atención y GDN (Gated Delta Network) en 64 capas de lenguaje. Se trata de un modelo denso, sin mezcla de expertos. La parte de visión conserva 333 tensores BF16 originales, con el patch embedding adaptado a los ejes de MLX. El contexto configurado es de 262 144 tokens, aunque el autor indica que no ha sido verificado de forma exhaustiva.

No se dispone de información sobre el entrenamiento del modelo original (datos, número de tokens, método de alineación). Esta conversión es una cuantización del checkpoint BF16 de AEON-7, realizada con el adaptador de streaming Qwen3.5 de MLX-LM 0.31.3. El proceso de abliteración (eliminación de la alineación de seguridad) fue aplicado por el autor del modelo base, no por el conversor. No se incluye ningún sidecar MTP (Multi-Token Prediction) en el artefacto MLX.

## Capacidades

- Generación de texto e imagen a texto (pipeline `image-text-to-text`).
- Conversación multimodal: puede recibir una imagen y responder a preguntas sobre ella.
- Sin alineación de seguridad: el modelo está diseñado para no rechazar peticiones, lo que implica que puede generar contenido que un modelo alineado normalmente bloquearía.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Investigación sobre modelos sin alineación: permite estudiar el comportamiento de un modelo multimodal cuando se eliminan las restricciones de seguridad, útil para analizar sesgos y riesgos en entornos académicos controlados.
- Evaluación de cuantización MXFP8 en MLX: sirve como banco de pruebas para medir la degradación de calidad y rendimiento de la cuantización de 8 bits en modelos multimodales grandes sobre Apple Silicon.
- Desarrollo de prototipos de visión por computadora: puede emplearse para generar descripciones de imágenes o responder preguntas visuales en entornos de desarrollo donde no se requiera alineación.
- Experimentación con generación de contenido creativo sin filtros: adecuado para explorar estilos de escritura o narrativas que modelos alineados rechazarían, siempre bajo responsabilidad del operador.
- Pruebas de integración con MLX-VLM: permite validar el flujo de trabajo de `mlx_vlm.generate` con modelos cuantizados y verificar la compatibilidad de tensores de visión.
- Benchmarking de memoria y latencia: útil para medir el consumo de VRAM y la velocidad de inferencia en diferentes generaciones de chips Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma: Apple Silicon (M1, M2, M3, M4 o posteriores) con memoria unificada, dado que el formato es MLX.
- VRAM estimada: al tratarse de un modelo de ~8B parámetros en MXFP8, se estima un consumo de memoria de entre 8 y 12 GB, dependiendo de la longitud de contexto y del tamaño de las imágenes procesadas.
- GPUs compatibles: no aplica a GPUs NVIDIA o AMD; MLX está diseñado exclusivamente para el Neural Engine y la GPU integrada de Apple.
- Opciones de despliegue: `mlx_vlm.generate` (CLI), integración con MLX-LM para generación de texto, y posible uso en aplicaciones Swift/Python mediante la API de MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. El modelo base es una variante de Qwen3.5, pero no se conocen conversiones MLX equivalentes con las mismas características (abliterado, MXFP8, visión) en el momento de redactar esta ficha. Se recomienda consultar el repositorio de AEON-7 para comparar con otras versiones del mismo checkpoint.

## Limitaciones y advertencias

- Modelo abliterado e intencionalmente no alineado: puede generar contenido inseguro, ilegal, ofensivo o dañino. El autor del modelo base advierte explícitamente de este riesgo.
- Cuantización experimental: la conversión MXFP8 no ha sido sometida a una validación exhaustiva; el contexto de 262 144 tokens está configurado pero no verificado.
- Sin garantías de calidad: al ser una conversión comunitaria, no hay soporte oficial ni garantías de rendimiento.
- Riesgo de alucinación: al carecer de alineación, es probable que el modelo produzca afirmaciones falsas o inventadas con mayor frecuencia que un modelo alineado.
- Restricciones de uso: aunque la licencia es Apache-2.0, el uso comercial o público de un modelo sin alineación conlleva responsabilidades legales y éticas que recaen en el operador.
- Idiomas y capacidades no documentadas: no se ha confirmado qué idiomas soporta ni si dispone de funciones avanzadas como tool calling o agentes.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp8-vision-mlx
- Modelo base (BF16): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
