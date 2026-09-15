# Asur4N/Swift-Qwen3.8-27B-mlx-8bit

## Resumen

Swift-Qwen3.8-27B-mlx-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo ukisai/Swift-Qwen3.8-27b, un derivado de Qwen3.8-27B optimizado por UkisAI para reducir el coste de razonamiento. El objetivo declarado es reducir aproximadamente un 58% los tokens de "thinking" y acelerar la inferencia unas 1,95 veces, con una pérdida de precisión inferior al 1%. Esta versión la publica el usuario Asur4N y su uso previsto es el despliegue en hardware Apple Silicon con memoria limitada.

El modelo conserva la arquitectura del original: `Qwen3_5ForConditionalGeneration`, con 64 capas que combinan atención lineal GatedDeltaNet con capas de atención completa, y una ventana de contexto de 262.144 tokens. Cuenta con 27.356.728.560 parámetros (unos 27,36 mil millones) y mantiene el torreón de visión y los ficheros de preprocesado, por lo que el pipeline es image-text-to-text.

Su relevancia actual es doble: por un lado, empaqueta un modelo de razonamiento de 27B en unos 29,5 GB de pesos, lo que lo hace viable en equipos de consumo con memoria unificada alta; por otro, combina esa reducción de memoria con un modo de razonamiento ya optimizado en tokens, atacando los dos cuellos de botella habituales de los modelos "thinking" en producción: coste por token generado y huella de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (model_type `qwen3_5`), transformer hibrido con GatedDeltaNet (atencion lineal) + atencion completa, 64 capas |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | no aplica (no es MoE; no disponible en la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | 8-bit affine, group-size 64, ~8,63 bits por peso (6 shards, ~28 GB). No se distribuyen otras cuantizaciones en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (identificador `other`); gratuita hasta 1M USD de ARR, requiere licencia enterprise por encima |
| Formato de pesos | safetensors cuantizados para MLX (libreria `mlx`), 6 shards; repo de 29,5 GB |
| Tokenizer | 248.320 tokens de vocabulario (`tokenizer.json`, `vocab.json`) |
| Modalidades | Texto e imagen (image-text-to-text); incluye `preprocessor_config.json` y `video_preprocessor_config.json` |
| Modelo base | ukisai/Swift-Qwen3.8-27b (relacion: finetune), revision `1b30aaa` |
| Herramienta de conversion | `mlx-vlm 0.7.1` (`mlx_vlm.convert --quantize --q-bits 8 --q-group-size 64 --mtp`) |
| Fecha de publicacion | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura reproduce la del modelo base `ukisai/Swift-Qwen3.8-27b`: un transformer de 64 capas que alterna capas de atención lineal GatedDeltaNet con capas de atención completa. Este esquema híbrido reduce el coste computacional y de memoria del caché KV en secuencias largas, algo especialmente relevante con una ventana de 262.144 tokens. El modelo incluye además un torreón de visión y los ficheros de preprocesado de imagen y vídeo, de modo que la entrada puede ser multimodal. La conversión conserva todos esos componentes (`processor_config.json`, `preprocessor_config.json`, `video_preprocessor_config.json`, `chat_template.jinja`, `generation_config.json`).

El proceso de conversión aplica cuantización afín de 8 bits con tamaño de grupo 64 sobre los pesos en safetensors, lo que da como resultado ~8,63 bits por peso y seis shards que suman unos 28 GB (29,5 GB de repositorio). Durante la conversión se extrajo la cabeza MTP (multi-token prediction) nativa del modelo base como drafter independiente para decodificación especulativa; ese drafter se conserva aparte y **no está incluido en este repositorio**, por lo que no se puede aprovechar la aceleración especulativa solo con estos pesos. El autor indica que el modelo se probó en Apple Silicon con una verificación elemental ("2+2" → "4").

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO para el modelo base, más allá de que el trabajo original de UkisAI se centra en la eficiencia de razonamiento (~58% menos tokens de pensamiento, ~1,95x de aceleración, <1% de pérdida de precisión). No hay indicios de que esta conversión haya implicado reentrenamiento: es una cuantización de pesos.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" con presupuesto de tokens reducido respecto al modelo del que deriva.
- Procesamiento de imagen: el pipeline declarado es image-text-to-text y se conserva el torreón de visión.
- Preprocesado de vídeo presente en el repositorio (`video_preprocessor_config.json`), lo que sugiere soporte de entrada de vídeo, aunque no está documentado explícitamente en la model card.
- Conversación multi-turno con plantilla de chat incluida (`chat_template.jinja`).
- Manera de razonamiento eficiente en tokens (tags `efficient-thinking`, `reasoning`, `token-efficient`).
- Uso con decodificación especulativa mediante la cabeza MTP extraída, siempre que se use el drafter externo.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado en la información disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- Otras capacidades especiales (audio, etc.): no disponibles.

## Casos de uso

- Razonamiento con coste controlado en local: al reducir aproximadamente un 58% los tokens de pensamiento, es adecuado para pipelines de razonamiento en los que el gasto por consulta es el factor limitante, ejecutándose íntegramente en un Mac sin conexión.
- Análisis de documentos largos: con 262.144 tokens de contexto se pueden procesar contratos, informes anuales o expedientes completos en una sola pasada, evitando estrategias de troceado y recuperación.
- Asistente de código en estación de trabajo Apple Silicon: generación y explicación de fragmentos de código sobre un contexto de repositorio amplio, con la ventaja de no enviar código propietario a servicios externos.
- Descripción y extracción de información de imágenes: al ser image-text-to-text, sirve para generar pies de foto, transcribir capturas de interfaz, clasificar documentos escaneados o extraer campos de facturas.
- Procesamiento de vídeo o secuencias de fotogramas: el preprocesador de vídeo incluido permite tareas de resumen o etiquetado sobre material audiovisual, sujeto a verificación práctica del soporte.
- Evaluación comparativa de eficiencia de razonamiento: útil como referencia para medir en hardware local cuánto se gana en latencia y tokens de salida respecto al modelo base sin cuantizar.
- Prototipado de investigación en multimodalidad: al conservar el torreón de visión y la plantilla de chat, permite experimentar con prompts multimodales sin necesidad de infraestructura CUDA.
- Despliegue en entornos con requisitos de privacidad: la ejecución local con MLX facilita cumplir normativa de tratamiento de datos al no requerir transferencia a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión remite explícitamente a la del modelo base (`ukisai/Swift-Qwen3.8-27b`) para consultar benchmarks, licencia y cita, pero no reproduce ninguna cifra. Los únicos datos de rendimiento aportados por el autor del modelo base son agregados: aproximadamente un 58% menos de tokens de pensamiento, aproximadamente 1,95x de aceleración y menos de un 1% de pérdida de precisión, sin desglose por tarea ni comparación numérica con alternativas.

## Requisitos de hardware

- VRAM / memoria unificada para 8 bits: los pesos suman unos 28 GB (~8,63 bits por peso). Con el caché KV y el runtime, se recomienda un mínimo de 32 GB de memoria unificada y, para contextos largos, 48-64 GB.
- Referencia por cuantización: 4 bits rondaría los 15-16 GB de pesos; bf16 completo rondaría los 55 GB. Solo se distribuye la versión de 8 bits.
- Equipos recomendados: Apple Silicon con memoria unificada de 32 GB o superior (familias M3 Pro/Max y M4 Pro/Max en configuraciones de 36-128 GB). No es ejecutable en GPU CUDA con este formato.
- GPU de consumo: no aplica en el sentido habitual, ya que MLX requiere Apple Silicon. En una GPU de 24 GB (RTX 4090) no cabría esta versión de 8 bits sin descarga a memoria del sistema; haría falta la versión de 4 bits o el modelo base en GGUF.
- Opciones de despliegue: `mlx-vlm` (soporte declarado, con ejemplo de CLI en la model card), ecosistema MLX (`mlx_lm`). vLLM, TGI, llama.cpp u Ollama no son compatibles directamente con pesos MLX; para ellos habría que convertir desde el modelo base.
- Latencia y throughput: no disponibles. El autor solo documenta la aceleración del modelo base (~1,95x) y no aporta mediciones para esta conversión cuantizada.
- Nota sobre decodificación especulativa: la cabeza MTP que permitiría acelerar la generación se extrajo como drafter independiente y no se incluye en este repositorio, por lo que esa ganancia no está disponible de serie.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Asur4N/Swift-Qwen3.8-27B-mlx-8bit | 27,36B | 262.144 | 8-bit MLX (~28 GB) | swift-open-license-1.0 (gratis hasta 1M USD ARR) | HuggingFace, MLX/Apple Silicon |
| ukisai/Swift-Qwen3.8-27b (base) | no disponible en la informacion proporcionada | 262.144 (segun la conversion) | pesos sin cuantizar, no confirmado | swift-open-license-1.0 | HuggingFace |
| Alternativas de ~27-32B equivalentes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento, licencia o especificaciones de otros modelos de la misma categoria que permitan una comparacion cuantitativa fiable. Cualquier comparacion con modelos de tamano similar (por ejemplo, otras familias de 27-32B con razonamiento explícito) exigiria consultar sus respectivas model cards.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta evaluación de sesgos ni de seguridad.
- Riesgo de alucinación: no cuantificado. Los modelos de razonamiento con modo "thinking" pueden generar cadenas de razonamiento plausibles pero incorrectas; además, la cuantización a 8 bits introduce una degradación menor (declarada por el autor del modelo base por debajo del 1% en precisión, aunque no verificada aquí).
- Idiomas soportados: sin especificar. No se puede garantizar el rendimiento en castellano ni en otros idiomas sin evaluación propia.
- Licencia: swift-open-license-1.0 permite uso gratuito solo por debajo de 1M USD de ingresos anuales recurrentes; por encima se requiere licencia enterprise. Es un modelo con licencia `other`, no una licencia open source estándar, por lo que conviene revisar el texto completo antes de un uso comercial.
- Formato atado a Apple Silicon: los pesos MLX no se pueden cargar en GPU NVIDIA/AMD ni en la mayoría de plataformas de servidor. Esto limita el escalado horizontal y el uso en clústeres convencionales.
- Ausencia del drafter MTP: la aceleración por decodificación especulativa que sí existe en el modelo base no está incluida en este repositorio.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, sin validación comunitaria ni pruebas independientes publicadas.
- Contexto de 262.144 tokens: aunque la arquitectura sea híbrida, el consumo de memoria del caché KV en contextos muy largos puede ser elevado y no se documentan mediciones.
- Tool calling y uso agéntico: no documentados; no conviene asumir su funcionamiento en producción sin pruebas.
- Fechas y versiones: la conversión se generó con `mlx-vlm 0.7.1`; cambios posteriores de la librería pueden alterar el comportamiento de carga o de generación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Asur4N/Swift-Qwen3.8-27B-mlx-8bit
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Librería de conversión e inferencia: `mlx-vlm` (https://github.com/Blaizzy/mlx-vlm)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo, su modelo base o su licencia. Las únicas coincidencias devueltas tratan sobre un tema de disertación filosófica en francés y no guardan relación con el modelo. No se dispone por tanto de paper, blog técnico, repositorio de código ni demo adicionales.
