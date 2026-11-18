# bytetilde/zap-1-preview

## Resumen

Zap-1 Preview es un ajuste fino supervisado (SFT) del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario bytetilde y publicado en Hugging Face. Su objetivo es que el modelo emita una decisión explícita de esfuerzo de razonamiento antes de responder: una etiqueta `none`, `low`, `medium` o `high` con el formato `<zap>decision<zapthink>level</zap>`, seguida opcionalmente de un bloque `<think>...</think>` antes de la respuesta final. La idea es gastar poco razonamiento en prompts fáciles y reservar más capacidad para los difíciles, con la etiqueta generada por el propio modelo y no impuesta por el runtime.

El modelo hereda la arquitectura LFM3 del base: 1.728.801.536 parámetros en BF16, 24 capas (13 de convolución corta, 6 de atención completa y 5 de atención con ventana deslizante), tamaño oculto de 2.048, feed-forward de 7.680, 16 cabezas de consulta y 4 de clave/valor de dimensión 128, y un vocabulario de 128.000 tokens. La longitud de contexto configurada es de 262.144 tokens, con una ventana de atención deslizante de 256 tokens.

Es relevante ahora porque explora una línea de investigación práctica: el control del esfuerzo de razonamiento seleccionado por el propio modelo, un patrón habitual en modelos grandes de razonamiento y poco frecuente en modelos pequeños de 1,7 mil millones de parámetros. Conviene tener en cuenta que se trata de una preview: según el autor, el entrenamiento no se ha completado y la versión final debería ofrecer mejor calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (convolución corta + atención con grupos de consulta; 13 capas de convolución, 6 de atención completa, 5 de atención con ventana deslizante) |
| Parametros totales | 1.728.801.536 (1,73 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens configurados; ventana de atención deslizante de 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (licencia "other", con limitación de uso comercial ligada a los ingresos anuales) |
| Formato de pesos | safetensors (BF16), con código de modelo personalizado (`trust_remote_code=True`) |
| Tamano del repositorio | 3,5 GB |
| Vocabulario | 128.000 tokens |
| Tamano oculto / feed-forward | 2.048 / 7.680 |
| Cabezas de atención | 16 de consulta, 4 de clave/valor, dimension 128 por cabeza |
| Revision del modelo base | `1da06bec6a819da10b54c67e5c90972b46d81871` |

## Arquitectura y entrenamiento

Zap-1 Preview es un ajuste fino supervisado del modelo LiquidAI/LFM3-1.7B. La arquitectura subyacente es LFM3, un transformer híbrido que combina capas de convolución corta con capas de atención: 13 capas de convolución, 6 de atención completa y 5 de atención con ventana deslizante de 256 tokens. El modelo tiene 24 capas, tamaño oculto de 2.048, feed-forward de 7.680 y usa atención con grupos de consulta (16 cabezas de consulta frente a 4 de clave/valor). El contexto configurado alcanza los 262.144 tokens y los pesos se distribuyen en BF16.

El entrenamiento consiste en SFT orientado a que el modelo emita primero una decisión de esfuerzo con el formato `<zap>decision<zapthink>level</zap>`, donde `level` es `none`, `low`, `medium` o `high`, seguida opcionalmente de un bloque `<think>...</think>` antes de la respuesta final. La etiqueta `none` está pensada para omitir el bloque de razonamiento. La decisión la genera el modelo, no el entorno de ejecución. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El autor indica que el entrenamiento no está completo y que la versión final debería mejorar en calidad.

## Capacidades

- Generación de texto conversacional orientada a chat de uso cotidiano.
- Selección automática del esfuerzo de razonamiento mediante las etiquetas `none`, `low`, `medium` y `high`, emitidas por el propio modelo.
- Emisión opcional de un bloque `<think>...</think>` con el razonamiento intermedio antes de la respuesta final.
- Contexto largo de hasta 262.144 tokens configurados, apoyado en capas de convolución y atención con ventana deslizante.
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizador.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el pipeline es text-generation.

## Casos de uso

- Chat de uso cotidiano con coste de razonamiento variable: el modelo decide con `none` o `low` en preguntas simples y con `medium` o `high` en las complejas, lo que permite ajustar la latencia y el consumo de tokens por consulta en una interfaz de chat.
- Experimentación en investigación sobre esfuerzo de razonamiento adaptativo: al exponer la etiqueta de esfuerzo como campo de salida, se puede medir la correlación entre la decisión del modelo y la dificultad real del prompt en un banco de pruebas propio.
- Procesamiento de documentos largos: con 262.144 tokens de contexto configurados, puede recibir contratos, informes o hilos de conversación extensos en una sola pasada, aunque la ventana deslizante de 256 tokens condiciona cuánta información atiende cada capa.
- Clasificación y enrutamiento de consultas: el campo `<zap>decision<zapthink>level</zap>` puede parsearse para dirigir consultas fáciles a un modelo menor y consultas difíciles a un modelo mayor dentro de un pipeline.
- Prototipado rápido en local: con 1,73 mil millones de parámetros en BF16 y un repositorio de 3,5 GB, se puede cargar con Transformers y Accelerate en una estación de trabajo para pruebas de integración antes de pasar a producción.
- Generación de respuestas con traza de razonamiento auditable: conservar el bloque `<think>` permite revisar el razonamiento intermedio en entornos donde se exige justificar la respuesta, tratándolo siempre como material orientativo y no como garantía de corrección.
- Evaluación comparativa de ajustes finos sobre LFM3: sirve como referencia para medir el efecto del SFT sobre el modelo base en tareas de chat y de control de esfuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB solo para los pesos (1,73 mil millones de parámetros a 2 bytes), más memoria para el contexto KV y activaciones; el consumo real depende de la longitud de contexto utilizada.
- En cuantización de 8 bits, la estimación teórica ronda los 1,8 GB de pesos; en 4 bits, alrededor de 0,9 GB. No se han publicado cuantizaciones oficiales del modelo.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, cabe en GPU de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090; para contextos muy largos conviene una GPU con más memoria, como A100 o H100.
- Despliegue: el autor documenta el uso con Transformers, PyTorch y Accelerate, con `trust_remote_code=True` para cargar el código LFM3 incluido. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible; la presencia de código personalizado puede limitar la compatibilidad con algunos motores de inferencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Zap-1 Preview | 1,73 mil millones | 262.144 tokens configurados | LFM Open License v1.0 (uso comercial limitado por ingresos anuales) | Ajuste fino SFT de LFM3 con decisión de esfuerzo de razonamiento; preview sin entrenamiento completo |
| LiquidAI/LFM3-1.7B | 1,73 mil millones | no disponible en la información proporcionada | LFM Open License v1.0 | Modelo base del que deriva Zap-1 Preview; arquitectura LFM3 híbrida convolución-atención |
| Alternativas de ~1,7 mil millones de parámetros | no disponible | no disponible | no disponible | No se dispone de datos de rendimiento comparables en la información proporcionada |

No se han publicado resultados de benchmarks que permitan comparar el rendimiento de Zap-1 Preview con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo en estado preview: el autor indica que el entrenamiento no se ha completado y que la versión final debería ser mejor en calidad; no debe tratarse como un modelo estable para producción.
- La etiqueta de esfuerzo y el bloque de razonamiento son campos de salida opcionales y no garantizan la corrección de la respuesta; el autor recomienda no interpretarlos como tal.
- Riesgo de alucinación: no se han publicado evaluaciones específicas; al ser un ajuste fino de un modelo pequeño de 1,73 mil millones de parámetros, la fiabilidad factual no está garantizada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; la model card no detalla cobertura lingüística.
- Limitaciones de contexto: aunque la longitud configurada es de 262.144 tokens, la atención con ventana deslizante de 256 tokens en 5 de las 24 capas puede reducir la calidad en dependencias de largo alcance; no se han publicado evaluaciones de contexto largo.
- Licencia: LFM Open License v1.0, con una limitación de uso comercial ligada a los ingresos anuales; es necesario revisar el archivo LICENSE antes de cualquier despliegue comercial.
- Requiere `trust_remote_code=True` para cargar el código LFM3 incluido; conviene revisar ese código antes de ejecutarlo.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bytetilde/zap-1-preview
- Modelo base LiquidAI/LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/bytetilde/zap-1-preview/blob/main/LICENSE
