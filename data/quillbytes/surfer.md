# QuillBytes/surfer

## Resumen

Surfer es un ajuste fino (fine-tuning) del modelo base Qwen3.5-4B, publicado por el usuario QuillBytes en HuggingFace, cuyo único objetivo es responder imitando el registro lingüístico de un "surfer dude" estadounidense: jerga de playa, metáforas marinas y un tono relajado y desenfadado. No es un modelo orientado a tareas productivas ni a razonamiento, sino una pieza de entretenimiento y una demostración de personalización de estilo mediante LoRA. El modelo conserva la arquitectura del base (transformer causal denso, ~4,66 mil millones de parámetros según los pesos en safetensors) y una ventana de contexto declarada de 2.048 tokens, muy inferior a la del modelo original.

El entrenamiento se realizó con Unsloth sobre un dataset propio de únicamente 566 ejemplos durante 3 épocas, con adaptadores LoRA en bf16. El resultado se distribuye tanto en safetensors de precisión completa como en cuantizaciones GGUF de 4 bits y F16, lo que facilita su ejecución local con Ollama o LM Studio. La licencia es Apache 2.0, heredada del modelo base, y el único idioma declarado es el inglés.

Su relevancia es limitada en términos de capacidades, pero resulta un caso útil para estudiar cómo un dataset minúsculo y muy sesgado estilísticamente puede condicionar por completo la salida de un modelo de 4B, así como para probar flujos de cuantización y despliegue local en hardware de consumo. El repositorio no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (derivado de Qwen3.5-4B); arquitectura interna exacta no disponible |
| Parametros totales | 4.659.865.088 (~4,66 mil millones, dato de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (según model card) |
| Tipos de cuantizacion | GGUF de 4 bits (surfer.gguf); GGUF F16 (surfer-F16.gguf); safetensors en precisión completa |
| Idiomas soportados | Inglés (registro surfer/playa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Metodo de ajuste | LoRA en bf16 con Unsloth |
| Tamano del dataset | 566 ejemplos, 3 épocas |
| Tamano del repositorio | 12,8 GB |
| Pipeline declarado | text-generation |
| Idiomas (campo oficial) | en |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer causal denso de ~4,66 mil millones de parámetros. Sobre él se aplicó un ajuste fino con LoRA en bf16 usando el framework Unsloth, que acelera y reduce el consumo de memoria del entrenamiento de adaptadores. No se especifica en la model card la composición del dataset más allá de su tamaño (566 ejemplos) ni si hubo etapas de RLHF, DPO u otro alineamiento posterior; tampoco se detalla si se fusionaron los adaptadores con los pesos base antes de exportar los safetensors, aunque la presencia de pesos completos en el repositorio apunta a que sí.

La innovación técnica es prácticamente nula: se trata de un ejercicio de transferencia de estilo. El aspecto reseñable es la relación entre el volumen de datos (566 ejemplos, 3 épocas) y el efecto observado: un condicionamiento estilístico fuerte y muy difícil de desactivar. No se documentan técnicas como decodificación especulativa, atención lineal, MoE ni mecanismos híbridos SSM. Los tags del repositorio incluyen `image-text-to-text` y `qwen3_5`, pero el pipeline declarado es `text-generation` y la model card describe un "causal language model"; además, etiqueta el archivo `surfer-F16.gguf` como "multimodal projector", lo que resulta inconsistente con su extensión GGUF y con el resto de la documentación. Estas contradicciones no se resuelven en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés con un registro estilístico muy marcado (surfer, jerga de playa, metáforas marinas).
- Respuesta a preguntas generales: puede abordar temas cotidianos (por ejemplo, preparar café), pero reformulándolos siempre en clave de surf.
- Generación creativa y narrativa breve dentro del personaje.
- Conversación multi-turno dentro de la ventana de 2.048 tokens.
- Ejecución local en CPU o GPU gracias a las cuantizaciones GGUF publicadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles; el ajuste está orientado a estilo, no a razonamiento estructurado.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles de forma verificada. Los tags mencionan `image-text-to-text`, pero ningún otro elemento de la documentación lo confirma.
- Razonamiento avanzado, matemáticas y código: no documentados; hereda en teoría la base Qwen3.5-4B, pero el ajuste de estilo puede degradar el seguimiento de instrucciones formales.

## Casos de uso

- Chatbot de entretenimiento temático: integrado con Ollama o LM Studio mediante el Modelfile incluido, sirve como personaje conversacional para demos, streams o webs de ocio donde el estilo importa más que la precisión.
- Prototipado de personajes para videojuegos o narrativa interactiva: permite validar rápidamente si una voz concreta funciona antes de invertir en un dataset mayor o en un ajuste más costoso.
- Pruebas de cuantización y despliegue local: con solo ~4,66B de parámetros y versiones GGUF de 4 bits y F16, es un banco de pruebas cómodo para medir latencia, consumo de VRAM y calidad de cuantización en hardware de consumo.
- Generación de contenido de marketing para marcas de surf, ropa de playa o turismo costero: produce copys y textos promocionales con jerga auténtica del sector, siempre que se revise y edite después.
- Educación y demostración sobre fine-tuning: caso didáctico ideal para explicar cómo 566 ejemplos y 3 épocas bastan para imponer un estilo, y para ilustrar el riesgo de sobreajuste estilístico.
- Generación de textos creativos con restricción de voz: útil para escribir descripciones de olas, partes meteorológicos de playa o fichas de spots con un tono coherente y reconocible.
- Investigación sobre sesgo de estilo y transferencia de personalidad: permite estudiar cómo un ajuste pequeño desplaza la distribución de salida de un modelo base y afecta a tareas no relacionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto estándar, y los resultados de búsqueda web devueltos no contienen información relevante sobre este modelo. No se dispone tampoco de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: ~9,3 GB solo para pesos (4,66B × 2 bytes), más caché KV y overhead; en la práctica, entre 11 y 13 GB con la ventana de 2.048 tokens.
- VRAM estimada en GGUF 4 bits: aproximadamente 2,8-3,5 GB de pesos, más overhead; manejable en GPUs de 6-8 GB.
- VRAM estimada en GGUF F16: ~9,5-10 GB.
- GPUs recomendadas: RTX 4090, RTX 3090, A100 40 GB o H100 para FP16 con margen amplio; RTX 4070 Ti Super, RTX 4080 o RTX 3080 12 GB para FP16 justo; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 3050 8 GB para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: sí, en formato GGUF de 4 bits en cualquier GPU con 6 GB o más, y en FP16 en GPUs de 12-16 GB con contexto corto.
- Apple Silicon: viable en formato GGUF mediante llama.cpp u Ollama con 8 GB de memoria unificada o más.
- Opciones de despliegue: Ollama (recomendado por el autor, con Modelfile incluido), LM Studio, llama.cpp, y de forma genérica vLLM, TGI o SGLang con los pesos safetensors (no verificados específicamente con este modelo).
- Latencia y throughput estimados: no disponibles.
- Nota: el repositorio ocupa 12,8 GB porque incluye pesos completos y cuantizaciones; no es necesario descargarlo entero para ejecutar la versión GGUF.

## Comparativa con modelos similares

La comparación se establece con los modelos base o de tamaño equivalente más habituales en esta franja. Los datos de rendimiento de Surfer no están publicados, por lo que la columna correspondiente queda como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formatos | Enfoque | Benchmarks |
|---|---|---|---|---|---|---|
| QuillBytes/surfer | ~4,66B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Personaje/estilo (surfer) | no disponible |
| Qwen3-4B (base de referencia) | ~4B | contexto largo (muy superior a 2.048; valor exacto no disponible en la información proporcionada) | Apache 2.0 | safetensors, GGUF | Propósito general, multilingüe, razonamiento | no disponible en esta ficha |
| Llama 3.2 3B Instruct | ~3B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | safetensors, GGUF | Propósito general, asistente | no disponible en esta ficha |
| Gemma 3 4B | ~4B | 128.000 tokens | Términos de uso de Gemma | safetensors, GGUF | Propósito general, multimodal en algunas variantes | no disponible en esta ficha |

Diferencias clave: Surfer reduce drásticamente la ventana de contexto respecto a los modelos de su franja y sacrifica utilidad generalista a cambio de coherencia estilística. Su licencia Apache 2.0 es la más permisiva de la tabla, mientras que Llama 3.2 y Gemma 3 arrastran licencias comunitarias con condiciones adicionales. No hay datos públicos que permitan comparar calidad objetiva.

## Limitaciones y advertencias

- Modelo creado explícitamente "para diversión y entretenimiento"; el propio autor lo indica en la model card. No es adecuado para tareas que requieran precisión factual.
- Sesgo estilístico extremo: el ajuste con 566 ejemplos fuerza respuestas en clave de surf incluso ante preguntas técnicas o serias, lo que puede hacerlo inútil para asistencia profesional.
- Riesgo elevado de sobreajuste: 3 épocas sobre un dataset minúsculo suelen provocar pérdida de capacidades generales del modelo base (olvido catastrófico parcial).
- Riesgo de alucinación: no se documenta ningún proceso de alineamiento, verificación factual o RLHF, y el estilo prioriza la forma sobre el contenido.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos, conversaciones extensas o análisis de código.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No hay benchmarks publicados, por lo que no se puede estimar su calidad objetiva frente a alternativas.
- Contradicciones en la documentación: los tags incluyen `image-text-to-text` pero el pipeline es `text-generation`, y el archivo `surfer-F16.gguf` se describe como "multimodal projector". No se debe asumir capacidad multimodal sin verificación directa.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, siempre que se conserve el aviso de licencia y se respeten las condiciones del modelo base subyacente.
- Repositorio sin descargas ni interacción registradas: no ha sido validado por la comunidad, por lo que la fiabilidad de los artefactos publicados no está contrastada.
- En producción, conviene fijar el system prompt del personaje tal como indica el autor; sin él, el comportamiento puede degradarse de forma impredecible.

## Enlaces

- HuggingFace: https://huggingface.co/QuillBytes/surfer
- Repositorio del modelo base Qwen3.5-4B: no disponible en la información proporcionada.
- Paper técnico: no disponible.
- Blog o announcement del autor: no disponible.
- Repositorio de código: no disponible.
- Demo: no disponible.
- Unsloth (framework de entrenamiento mencionado): no se ha proporcionado enlace verificado en la información disponible.
- Ollama (herramienta de despliegue recomendada en la model card): no se ha proporcionado enlace verificado en la información disponible.
- Resultados de la búsqueda web: no contienen información relevante sobre el modelo; todas las entradas devueltas corresponden al navegador Google Chrome y se descartan.
