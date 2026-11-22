# junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit

## Resumen

Ornith-1.5-35B-A3B-uncensored-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo multimodal Ornith-1.5-35B-A3B, publicado por el usuario junafinity bajo la marca VeriSafe.Live. Se trata de una variante "abliterated" (dirección de rechazo ablacionada) del modelo base ornith-ai/Ornith-1.5-35B-A3B, orientada exclusivamente a investigación en red teaming y evaluación de seguridad defensiva. El checkpoint conserva la torre de visión y se ejecuta sobre Apple Silicon mediante la librería mlx-vlm.

El modelo base emplea una arquitectura de mezcla de expertos (MoE) de la familia qwen3_5, con 35.107.181.936 parámetros totales y un esquema de activación de tipo A3B (aproximadamente 3 mil millones de parámetros activos por token, según la convención de nomenclatura). Al ser una cuantización del modelo base, hereda su ventana de contexto, su tokenizador y sus capacidades multimodales, pero no se documentan en la información disponible los detalles exactos de contexto ni la composición del dataset de entrenamiento.

La relevancia de esta ficha radica en que ejemplifica un patrón creciente: la publicación de variantes sin rechazo como instrumentos de medida del techo de capacidad de los pesos, no como productos listos para producción. El autor insiste en usarlo como mitad "tratamiento" de un par controlado frente al modelo base, y advierte de que la abliteración elimina una dirección de rechazo, no una política de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de la familia qwen3_5, con torre de visión (multimodal) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | A3B (aproximadamente 3B activos por token, según nomenclatura; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits MLX (8.596 bits por peso); existe variante MXFP4 en la misma familia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors), librería mlx-vlm; tower de visión incluida en el checkpoint |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con torre de visión, identificado en el Hub con la arquitectura qwen3_5_moe. La nomenclatura A3B indica activación dispersa: de los 35.107 millones de parámetros totales, solo una fracción reducida (del orden de 3 mil millones) se activa por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. El checkpoint aquí descrito no es un entrenamiento nuevo, sino una conversión cuantizada del modelo base abliterated, realizada con mlx-vlm mediante el comando `-q --q-bits 8 --dtype bfloat16`, resultando en 8.596 bits por peso.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. Sí se documenta un aspecto técnico relevante: mlx-vlm descarta los tensores `mtp.*` (multi-token prediction) durante la conversión, por lo que esta variante MLX no conserva la decodificación especulativa nativa del modelo; el autor remite a la variante GGUF de 8 bits para quien necesite MTP nativo. La abliteración, por su parte, consiste en una edición dirigida sobre componentes conocidos del modelo para eliminar la dirección de rechazo, lo que permite comparar el par base/variante como un control experimental limpio.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y texto (pipeline image-text-to-text), con torre de visión preservada en el checkpoint.
- Razonamiento y respuesta a instrucciones, heredados del modelo base.
- Capacidad de generar contenido sin rechazos en dominios que el modelo original declinaría, gracias a la abliteración.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Medición del techo de capacidad: emparejar esta variante con el modelo base original y lanzar el mismo conjunto de prompts para cuantificar qué produce el modelo cuando no hay rechazos, obteniendo una cota superior real de capacidad por dominio.
- Evaluación de la pila defensiva: usar el modelo como generador de entradas y salidas adversariales para probar filtros de entrada, clasificadores de salida, defensas frente a inyección de prompts y APIs de moderación, aprovechando que el modelo no aporta rechazos propios que enmascaren fallos del control.
- Aislamiento de la superficie de ataque: en bucles automatizados de red teaming, emplear un objetivo que no rechace permite aislar la variable bajo prueba (inyección, abuso de herramientas, rutas de exfiltración de datos, elusión de políticas) sin que rechazos ajenos al experimento detengan el bucle.
- Generación de datos etiquetados para clasificadores: producir completaciones para entrenar o evaluar modelos de moderación y detección de abuso, con la ventaja de disponer de la etiqueta del modelo base como contraste.
- Investigación de interpretabilidad: estudiar el rechazo residual comparando activaciones y salidas entre el modelo base y esta variante abliterated, dado que la edición es especificada y reproducible.
- Evaluación multimodal de seguridad: al conservar la torre de visión, permite probar rutas de rechazo que pasan por imagen (el autor advierte de que algunas persisten), útil para validar clasificadores que operan sobre entradas visuales.
- Despliegue local en Apple Silicon para experimentación: la cuantización de 8 bits y el formato MLX permiten ejecutar el modelo en equipos Mac con memoria unificada suficiente, sin depender de GPU de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 74,9 GB, por lo que se necesita un Mac con memoria unificada holgada; como referencia, un equipo de 96 GB o 128 GB permite cargar el checkpoint con margen para el contexto y la torre de visión.
- GPU recomendadas: exclusivamente Apple Silicon (MLX); no es un checkpoint para CUDA.
- Cabe en GPU de consumo: no aplica en el sentido habitual; en el ecosistema Apple, los chips M-series con memoria unificada alta (M2/M3/M4 Max y Ultra) son los candidatos naturales. En GPUs NVIDIA de consumo (RTX 4090, 24 GB) no cabe sin cuantizaciones mucho más agresivas y otro formato.
- Opciones de despliegue: mlx-vlm como librería de referencia; para llama.cpp u Ollama habría que usar la variante GGUF de la familia, no este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-uncensored-MLX-8bit | 35,1B totales (A3B activos) | no disponible | MLX 8-bit | Apache 2.0 | Objeto de esta ficha; sin MTP por limitación de mlx-vlm |
| Ornith-1.5-35B-A3B-uncensored-MLX-MXFP4 | 35,1B totales (A3B activos) | no disponible | MLX MXFP4 | Apache 2.0 | Misma familia, cuantización más agresiva, menor huella de memoria |
| Ornith-1.5-35B-A3B-uncensored-GGUF-8bit | 35,1B totales (A3B activos) | no disponible | GGUF Q8 | Apache 2.0 | Conserva MTP nativo; apto para llama.cpp |
| Ornith-1.5-35B-A3B (base) | 35,1B totales (A3B activos) | no disponible | Safetensors | Apache 2.0 | Modelo original con rechazos; referencia de control |

## Limitaciones y advertencias

- La abliteración elimina una dirección de rechazo, no una política de seguridad: sobreviven rechazos en reafirmación multi-turno, direccionamiento por system prompt y rutas visuales.
- No debe exponerse como endpoint público sin una capa de moderación independiente; quien despliega asume la responsabilidad de los guardrails que el modelo original llevaba incorporados.
- Riesgo elevado de generar contenido dañino, sesgado o inexacto; no es apto para aplicaciones de cara al usuario final.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- Limitaciones de contexto e idioma: no documentadas en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el uso previsto declarado por el autor es investigación en red teaming y seguridad defensiva; el uso comercial fuera de ese marco queda bajo responsabilidad del desplegable.
- Al ser una conversión MLX, se pierde el MTP nativo; el rendimiento de decodificación especulativa no estará disponible en esta variante.
- Cualquier comparación de capacidad debe reportarse como delta frente al modelo base y re-medirse con prompts propios, según las reglas operativas del autor.
- El checkpoint está atado al ecosistema Apple Silicon; no es portable a CUDA sin reconversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Colección de la familia: https://huggingface.co/collections/junafinity/ornith-15-uncensored-6a896c737cf40ad660af2ebd
- Variante GGUF 8-bit: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit
- Variante MLX MXFP4: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-MXFP4
- Variante 9B sin cuantizar: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Variante 9B MLX 8-bit: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-MLX-8bit
- Variante 9B GGUF 8-bit: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-GGUF-8bit
- Sitio del autor: https://verisafe.live
- Contacto: info@verisafe.live
