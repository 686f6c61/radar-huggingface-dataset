# SaeedAngiz1/shahnameh-smollm2-360m

## Resumen

Shahnameh SmolLM2-360M es un ajuste fino completo (full fine-tune) de SmolLM2-360M, el modelo denso de 361.821.120 parámetros de HuggingFaceTB, publicado por el usuario SaeedAngiz1 para generar verso al estilo del Shahnameh de Ferdowsi. Se distribuye con pesos safetensors en bfloat16, librería transformers y licencia Apache-2.0, y su objetivo no es responder preguntas de forma fiable, sino reproducir una voz poética concreta: el propio autor advierte que el inglés es el único idioma realmente utilizable y que el persa y el alemán son pobres.

Su interés técnico no está en la calidad del texto, deliberadamente modesta, sino en dos aspectos documentados. Primero, el checkpoint parecía roto porque la decodificación greedy se quedaba atrapada en un bucle autorreforzado: con teacher forcing la probabilidad de EOS era 0,55 y `<|endoftext|>` era la predicción top-1 en 17 de 30 casos, de modo que la corrección consistió en cambiar los valores por defecto de generación (`repetition_penalty=1.15`) y no en reentrenar. Segundo, demuestra que un ajuste de estilo es viable en el tramo gratuito de Kaggle con dos Tesla T4 y menos de tres horas de cómputo total.

El entrenamiento se realizó sobre únicamente 270 ejemplos (90 en parte del proceso), con pérdida solo en la respuesta y EOS supervisado. La longitud de contexto, las cuantizaciones publicadas y los resultados en benchmarks estándar no aparecen en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, compatible con el tag `llama`; full fine-tune de HuggingFaceTB/SmolLM2-360M |
| Parametros totales | 361.821.120 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no se publican cuantizaciones; pesos originales en bfloat16, convertibles a GGUF, 8-bit o 4-bit con herramientas externas |
| Idiomas soportados | fa, en, de (etiquetados); el autor indica que solo el ingles es utilizable y que persa y aleman son pobres |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 361,8 millones de parámetros, sin mezcla de expertos ni mecanismos de atención alternativa. El ajuste fue completo (todos los pesos actualizados), no mediante adaptadores: learning rate 2e-5, 3 épocas, 51 pasos, 270 ejemplos, pérdida calculada únicamente sobre la respuesta con el token EOS supervisado, distribuido con DDP sobre 2× NVIDIA Tesla T4. El trabajo distribuido falló por un desajuste de NCCL ALLGATHER después de completar el entrenamiento, durante la exportación, y un cuaderno monoproceso aparte recuperó y exportó el checkpoint preservado. Las pérdidas de validación quedaron en 2,650 global (frente a 3,030 del base), 1,751 en persa, 2,956 en inglés y 3,244 en alemán.

La innovación destacable no es arquitectónica sino de diagnóstico de decodificación. Con teacher forcing se observó P(EOS) = 0,55 y `<|endoftext|>` como top-1 en 17 de 30 casos, mientras que la decodificación greedy terminaba en 0 de 30 prompts retenidos. Aplicando `repetition_penalty=1.15` terminaban 25 de 30. El repositorio incorpora esos valores por defecto corregidos, de forma que una llamada simple a `generate()` finaliza correctamente sin modificar los pesos.

## Capacidades

- Generación de texto en verso inglés con registro épico imitando la voz del Shahnameh de Ferdowsi.
- Plantilla de chat conversacional con roles `system` y `user` (`apply_chat_template`), útil para fijar la persona poética desde el mensaje de sistema.
- Inferencia en CPU sin GPU, gracias a los 361,8 millones de parámetros y a los pesos en bfloat16.
- Generación de texto multilingüe nominal en persa, inglés y alemán, aunque en la práctica solo el inglés produce resultados utilizables.
- Terminación correcta de la generación con los valores por defecto del repositorio, tras el ajuste de `repetition_penalty`.
- No soporta tool calling ni function calling: no hay evidencia de ello en la información disponible.
- No soporta comportamiento de agente ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking), visión, audio ni otras modalidades.
- No se han documentado capacidades de código ni de matemáticas.

## Casos de uso

- Generación de verso poético en inglés: el modelo recibe un mensaje de sistema que define la persona (por ejemplo, "poeta que responde con la voz del Shahnameh") y produce estrofas en verso; es adecuado porque el ajuste se hizo exactamente sobre ese registro y no sobre conocimiento factual.
- Demo educativa sobre diagnóstico de decodificación: sirve para ilustrar en clase o en un artículo cómo un checkpoint aparentemente roto puede deberse a la estrategia de decodificación, comparando greedy (0/30 terminaciones) con `repetition_penalty=1.15` (25/30).
- Despliegue en entornos sin GPU: al caber en CPU con pesos bfloat16 de unos 0,72 GB, puede ejecutarse en portátiles, contenedores pequeños o dispositivos de borde para generar texto poético sin acelerador.
- Generación de material de estilo para aumento de datos: sus salidas pueden usarse como ejemplos sintéticos de verso épico para preentrenar o comparar modelos mayores, asumiendo que el contenido factual será erróneo y requiere revisión.
- Prototipado rápido de pipelines de chat: por su tamaño y licencia Apache-2.0, resulta útil como modelo de pruebas para validar plantillas de chat, servidores de inferencia y flujos de TGI antes de sustituirlo por un modelo mayor.
- Exploración de transferencia de estilo transfronteriza: permite experimentar con la imitación de un corpus poético clásico persa usando un modelo centrado en inglés, y medir hasta qué punto el estilo sobrevive al cambio de idioma.
- Aplicación recreativa offline: integrable en herramientas locales de escritura creativa o bots de poesía que funcionen sin conexión y sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los únicos datos cuantitativos aportados son las pérdidas de validación y el comportamiento de terminación de la decodificación.

| Pérdida de validación | Base | Ajustado |
|---|---|---|
| Todos (30) | 3,030 | 2,650 |
| Persa | 2,096 | 1,751 |
| Inglés | 3,320 | 2,956 |
| Alemán | 3,675 | 3,244 |

| Estrategia de decodificación | Prompts retenidos que terminan |
|---|---|
| Greedy | 0 / 30 |
| `repetition_penalty=1.15` | 25 / 30 |

| Medición interna | Valor |
|---|---|
| P(EOS) con teacher forcing | 0,55 |
| Casos con `<|endoftext|>` como top-1 | 17 / 30 |

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 0,72 GB (361,8 M de parámetros × 2 bytes); el repositorio completo ocupa 1,4 GB.
- Pesos en fp32: aproximadamente 1,45 GB.
- Cuantización a 8 bits: aproximadamente 0,36 GB; a 4 bits: aproximadamente 0,18 GB (estimaciones por tamaño de parámetros, no publicadas por el autor).
- Cabe en cualquier GPU de consumo: basta con una GTX 1050 Ti, RTX 3050, RTX 4090 o incluso una iGPU con memoria compartida suficiente. El autor indica explícitamente que no requiere GPU.
- Funciona en CPU con `low_cpu_mem_usage=True` y `torch_dtype=torch.bfloat16`; en CPU sin soporte bfloat16 conviene usar fp32 (unos 1,5 GB de RAM más el overhead del runtime).
- Opciones de despliegue: transformers (soporte nativo y documentado), text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (modelo tipo Llama de 362 M, compatible en principio), y llama.cpp u Ollama previa conversión a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El único dato de coste es el entrenamiento, inferior a tres horas en 2× Tesla T4.
- Entrenamiento reproducible en hardware de gama baja: learning rate 2e-5, 3 épocas y 51 pasos sobre 270 ejemplos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque y disponibilidad |
|---|---|---|---|---|
| Shahnameh SmolLM2-360M | 361,8 M | no disponible | Apache-2.0 | Ajuste de estilo poético en inglés; safetensors, 0 descargas y 0 likes en el momento de la consulta |
| SmolLM2-360M (base) | 361,8 M | 8.192 tokens según la model card pública del modelo base | Apache-2.0 | Modelo generalista inglés; el ajuste parte de él y comparte arquitectura y tokenizador |
| Qwen2.5-0.5B | 494 M | 32.768 tokens según su model card pública | Apache-2.0 | Alternativa generalista multilingüe; el propio autor menciona los modelos Qwen3 como motivación por el mal rendimiento en persa de SmolLM2 |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens según su model card pública | Apache-2.0 | Alternativa de mayor tamaño para generación en inglés; el triple de parámetros para tareas de estilo similares |

Nota: los datos de contexto de los modelos de terceros provienen de sus fichas públicas y no forman parte de la información de búsqueda de esta ficha; conviene verificarlos antes de citarlos.

## Limitaciones y advertencias

- Los hechos son frecuentemente incorrectos: el conjunto de datos enseña voz, no genealogía del Shahnameh. Cabe esperar nombres inventados y relaciones invertidas.
- El persa nunca ha sido revisado por un hablante nativo. La rima y la pureza del alfabeto se midieron de forma mecánica; la métrica (عروض), la gramática y el registro clásico están sin verificar.
- La salida varía entre ejecuciones con `temperature=0.7`; hay que juzgar sobre promedios, no sobre ejemplos escogidos.
- Entrenado con solo 270 (o 90) ejemplos: suficiente para el estilo, insuficiente para la prosodia.
- Riesgo alto de alucinación en cualquier pregunta factual sobre historia, personajes o genealogía, ya que no se entrenó para eso.
- Multilingüismo nominal: aunque se etiquetan fa, en y de, el autor califica el persa y el alemán como malos; el alemán es probablemente el idioma más débil de los tres.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado puede contener afirmaciones falsas y no hay garantía de calidad; conviene añadir revisión humana si se publica.
- Requiere mantener los valores de decodificación corregidos: si se sobrescriben los valores por defecto del repositorio, la generación puede volver al bucle de repetición observado con greedy (0/30 terminaciones).
- No hay benchmarks estándar publicados, por lo que no se puede comparar su calidad de forma objetiva con alternativas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- No se documentan sesgos específicos más allá del sesgo de estilo (voz épica persa imitada en inglés) y del sesgo idiomático hacia el inglés.
- La fecha de creación registrada en HuggingFace es 2026-09-16 y la de actualización 2026-09-16.
- El verso de entrenamiento es de nueva escritura en el estilo de Ferdowsi; no es texto original del Shahnameh (completado en 1010 d. C.), dato relevante para cualquier uso filológico o de atribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SaeedAngiz1/shahnameh-smollm2-360m
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Repositorio del proyecto con método, mediciones, gráficas y registro de cuatro fallos documentados: https://github.com/SaeedAngiz1/shahnameh-slm
- Resultados de la búsqueda web: no se encontraron enlaces relevantes al modelo. Los resultados devueltos corresponden a páginas generales de YouTube (youtube.com, Google Play y la entrada de Wikipedia), sin relación con el modelo ni con el proyecto.
