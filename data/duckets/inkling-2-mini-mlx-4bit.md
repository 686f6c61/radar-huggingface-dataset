# Duckets/Inkling-2-Mini-MLX-4bit

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por Thinking Machines, distribuido originalmente bajo licencia Apache-2.0. Esta ficha concreta corresponde a la conversión a MLX en cuantización de 4 bits publicada por el usuario Duckets, que republica el build de lmstudio-community del 24 de noviembre de 2026. El modelo emplea la arquitectura propietaria `inkling2_loop`, con 26.388.641.280 parámetros totales y aproximadamente 3.400 millones de parámetros activos, lo que lo sitúa en la categoría de modelos de mezcla de expertos (MoE) de gran tamaño nominal pero coste de inferencia reducido.

La relevancia de esta versión radica en su ventana de contexto de 1.010.000 tokens combinada con capacidades de visión y un empaquetado optimizado para el ecosistema Apple Silicon mediante MLX. El repositorio ocupa 34,6 GB e incluye los ficheros `processor_config.json` y `special_tokens_map.json` que faltaban en conversiones anteriores, además de pesos repackados que suman aproximadamente 17,3 GB.

Está pensado para ejecutarse en LM Studio, mlx-lm o mlx-vlm, y el mismo checkpoint se sirve en el motor Splash 1.7.3 a unos 97 tokens por segundo en decodificación con el contexto completo, según las pruebas del autor en un Apple M5 Max con 128 GB de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (MoE, multimodal imagen-texto) |
| Parametros totales | 26.388.641.280 (26,4B) |
| Parametros activos | ~3,4B |
| Longitud de contexto | 1.010.000 tokens |
| Tipos de cuantizacion | 4 bits (MLX); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `processor_config.json` y `special_tokens_map.json` |

## Arquitectura y entrenamiento

La arquitectura declarada es `inkling2_loop`, una variante de mezcla de expertos con 26,4B parámetros totales y aproximadamente 3,4B activos por token, lo que permite un coste computacional por paso muy inferior al de un modelo denso del mismo tamaño nominal. El modelo integra un codificador visual que lo habilita como pipeline `image-text-to-text`, y combina procesamiento de texto e imagen en una única pila de inferencia. La ventana de contexto alcanza 1.010.000 tokens, un orden de magnitud poco habitual en modelos de este rango de parámetros activos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones específicas de decodificación en el modelo base; la model card de esta conversión menciona únicamente que no incluye un drafter de decodificación especulativa porque el runtime MLX de LM Studio no puede emparejarlo, mientras que el motor Splash sí empareja automáticamente el borrador DFlash2 de la familia.

## Capacidades

- Generación de texto conversacional multi-turno con contexto extremadamente largo (hasta 1.010.000 tokens).
- Razonamiento aritmético y matemático básico: la model card verifica comprobaciones como 17 × 23 = 391 y √169 = 13.
- Comprensión de imágenes: se ha validado la identificación correcta de una imagen de color sólido.
- Pipeline imagen-texto-a-texto, es decir, entrada combinada de imagen y texto con salida textual.
- Modo conversacional apto para despliegue en asistentes e interfaces de chat.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Otras capacidades especiales (audio, thinking mode explícito): no disponible.

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: la ventana de 1.010.000 tokens permite ingerir manuales, informes o expedientes completos junto con sus figuras y diagramas en una sola pasada, sin truncamiento ni recuperación externa.
- Asistencia sobre capturas y diagramas técnicos: al ser un modelo imagen-texto-a-texto, puede recibir una captura de pantalla o un esquema y responder preguntas sobre su contenido, útil en soporte técnico y documentación de producto.
- Procesamiento de repositorios de código completos: con contexto de un millón de tokens cabe una base de código mediana entera, lo que facilita tareas de revisión, explicación y búsqueda de referencias cruzadas entre ficheros.
- Transcripción y resumen de reuniones con pizarras o presentaciones: combinación de texto de la transcripción con imágenes de las diapositivas para generar actas estructuradas.
- Despliegue local en estaciones de trabajo Apple Silicon: el formato MLX 4-bit y la integración con LM Studio permiten ejecutar el modelo en un Mac sin depender de servicios en la nube, relevante para entornos con requisitos de privacidad.
- Prototipado de agentes de razonamiento largo: el bajo número de parámetros activos (~3,4B) abarata cada paso de inferencia en cadenas de razonamiento multi-paso, aunque el soporte explícito de tool calling no está documentado.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de un modelo MoE multimodal al pasar a 4 bits en MLX frente a otras precisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento aportados por el autor son de inferencia, no de calidad: aproximadamente 97 tokens por segundo en decodificación con el contexto completo de 1.010.000 tokens en un Apple M5 Max con 128 GB, sirviendo el mismo checkpoint mediante el motor Splash 1.7.3.

## Requisitos de hardware

- Memoria: el repositorio pesa 34,6 GB y los pesos repackados en 4 bits suman aproximadamente 17,3 GB, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM para cargar el modelo, más margen para la caché KV del contexto utilizado.
- Contexto largo: con 1.010.000 tokens de ventana, la caché KV puede crecer de forma significativa; el autor valida el contexto completo en un equipo con 128 GB de memoria unificada.
- GPU recomendadas: Apple Silicon de gama alta (el autor cita un M5 Max con 128 GB). Para GPUs NVIDIA no se documenta soporte en esta conversión, al estar empaquetada para MLX.
- GPU de consumo: no hay datos sobre ejecución en RTX 4090 u otras GPU consumer; el formato MLX está orientado a Apple Silicon.
- Opciones de despliegue: LM Studio (runtime MLX), mlx-lm, mlx-vlm y el motor Splash (build separado en el repositorio Duckets/Inkling-2-Mini-Splash). vLLM, llama.cpp, Ollama y TGI no se mencionan para esta conversión.
- Latencia y throughput: ~97 tok/s en decodificación con contexto completo en M5 Max de 128 GB, según el autor. Sin drafter de decodificación especulativa en LM Studio; Splash empareja automáticamente el borrador DFlash2.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, el propio modelo base `thinkingmachines/Inkling-2-Mini` comparte arquitectura y parámetros con esta conversión, diferenciándose únicamente en el formato (pesos originales frente a MLX 4-bit) y en el empaquetado de ficheros de procesador y tokens especiales.

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Duckets/Inkling-2-Mini-MLX-4bit | 26,4B totales / ~3,4B activos | 1.010.000 | MLX safetensors 4-bit | Apache-2.0 |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B totales / ~3,4B activos | 1.010.000 | no disponible | Apache-2.0 |
| lmstudio-community/Inkling-2-Mini-MLX-4bit | 26,4B totales / ~3,4B activos | 1.010.000 | MLX safetensors 4-bit | Apache-2.0 |

## Limitaciones y advertencias

- Idioma: el repositorio declara únicamente inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Cuantización: los pesos están en 4 bits, lo que puede degradar la precisión en tareas sensibles frente al modelo base en precisión completa; no se aportan métricas de esa degradación.
- Alucinación: no se documentan evaluaciones de fidelidad factual ni tasas de alucinación.
- Sesgos: no se dispone de información sobre sesgos conocidos del modelo base ni de esta conversión.
- Decodificación especulativa: esta build no incluye drafter y el runtime MLX de LM Studio no puede emparejarlo, lo que limita el throughput frente al motor Splash.
- Ecosistema: al estar empaquetado para MLX, no es directamente utilizable en stacks NVIDIA convencionales sin reconversión.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de la conversión de lmstudio-community, ya que esta ficha republica un build de terceros.
- Madurez: el repositorio tiene 36 descargas y 0 likes, con actualizaciones recientes (creado el 22 de noviembre de 2026, actualizado el 27 de noviembre de 2026), por lo que la validación comunitaria es escasa.
- Tool calling, agentes y otras capacidades avanzadas no están confirmadas en la documentación disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Duckets/Inkling-2-Mini-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build de lmstudio-community: https://huggingface.co/lmstudio-community/Inkling-2-Mini-MLX-4bit
- Build para el motor Splash: https://huggingface.co/Duckets/Inkling-2-Mini-Splash
