# masahiroid/mdeberta-v3-base-coreml

## Resumen

mdeberta-v3-base-coreml es una conversión a formato Core ML del modelo `microsoft/mdeberta-v3-base`, un encoder multilingüe de la familia DeBERTa-v3 publicado por Microsoft Research. El autor de la conversión es el usuario de Hugging Face `masahiroid`, que distribuye el artefacto como un paquete `model.mlpackage` listo para ejecutarse en el stack Core ML de Apple (macOS 14+ e iOS 17+). No se trata de un modelo nuevo ni de un fine-tuning: es el mismo checkpoint original exportado a un runtime distinto, sin cabeza de tarea añadida.

El modelo subyacente es un transformer encoder de tipo DeBERTa-v3, diseñado para producir representaciones contextuales a nivel de token. Al no incorporar cabecera de clasificación, token classification ni question answering, su uso requiere fine-tuning posterior o el entrenamiento de una cabeza específica sobre los hidden states que devuelve. La conversión mantiene precisión F32 tanto en pesos como en cómputo, y el autor incide explícitamente en que no es una cuantización de 4 bits.

La relevancia de esta ficha es acotada pero concreta: permite ejecutar un encoder multilingüe de referencia en dispositivos Apple sin depender de PyTorch ni de Python en tiempo de inferencia, lo que facilita el despliegue en aplicaciones nativas de macOS e iOS. La contrapartida es una ventana de entrada fija de 128 tokens y batch 1, lo que limita los escenarios de producción a tareas de clasificación y extracción de fragmentos cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (base) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (forma de entrada fija `[1, 128]` en la exportacion Core ML) |
| Tipos de cuantizacion | F32 (pesos y computo); el autor indica explicitamente que no es una cuantizacion de 4 bits |
| Idiomas soportados | multilingue (el modelo base `microsoft/mdeberta-v3-base` es multilingue; la lista concreta de idiomas no esta disponible) |
| Licencia | MIT |
| Formato de pesos | Core ML ML Program (`model.mlpackage`); existen variantes MLX, Core AI y GGUF publicadas por el mismo autor |

## Arquitectura y entrenamiento

La arquitectura corresponde a DeBERTa-v3 en configuracion base, un transformer encoder con atención desacoplada (disentangled attention) y una variante de embedding compartido entre generador y discriminador introducida en la version v3. El checkpoint exportado es el publicado por Microsoft en `microsoft/mdeberta-v3-base`, en la revision `a0484667b22365f84929a935b5e50a51f71f159d`. La conversion no altera los pesos ni aplica entrenamiento adicional: se limita a traducir el grafo de PyTorch a un ML Program de Core ML con pesos y operaciones en F32.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del corpus ni si el modelo base paso por fases de RLHF o DPO; al ser un encoder enmascarado, lo habitual en esta familia es entrenamiento auto-supervisado con masked language modeling, pero ese detalle no se confirma en la informacion proporcionada. La innovacion tecnica relevante de esta publicacion es la propia conversion: el autor documenta el proceso de exportacion con scripts reproducibles (PyTorch 2.14.1, Transformers 4.57.3, coremltools 9.0) y ofrece validacion numerica frente a la implementacion original en seis casos deterministas, con una diferencia absoluta maxima de 0,00099360943 y una similitud coseno minima de 0,99999882. Esa validacion mide paridad de conversion, no calidad de tarea ni latencia.

## Capacidades

- Generacion de representaciones contextuales a nivel de token (hidden states), no generacion de texto: el modelo no produce secuencias, solo embeddings.
- Base para fine-tuning en tareas de clasificacion de secuencias (sentimiento, toxicidad, intencion), token classification (NER, POS) y question answering extractivo, previa adicion de la cabeza correspondiente.
- Capacidades multilingues heredadas del checkpoint original de Microsoft, aunque la lista concreta de idiomas no se detalla en la informacion disponible.
- No soporta tool calling ni function calling: es un encoder, no un modelo instruido para seguir herramientas.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision ni audio.
- Inferencia en dispositivos Apple mediante Core ML, con entrada de batch 1 y secuencia fija de 128 tokens.

## Casos de uso

- Clasificacion de sentimiento en resenas cortas en apps iOS: el paquete Core ML permite ejecutar el encoder en el dispositivo sin backend, y una cabeza lineal entrenada sobre los hidden states bastaria para etiquetar textos de hasta 128 tokens.
- Deteccion de intencion en asistentes de voz integrados en macOS: el modelo puede procesar la transcripcion de un turno de usuario y alimentar un clasificador de intenciones, manteniendo los datos en local.
- Extraccion de entidades nombradas en correos y notas: con una cabeza de token classification, el encoder sirve para marcar nombres, fechas y organizaciones en fragmentos cortos dentro de una app nativa.
- Moderacion de contenido en foros o chats: la baja latencia esperada en Apple Silicon y la ejecucion on-device permiten filtrar mensajes antes de enviarlos a un servidor.
- Enrutamiento ligero de consultas en un pipeline RAG: usar los embeddings del encoder para similitud semantica en fragmentos de hasta 128 tokens, como paso previo a un recuperador mayor.
- Prototipado rapido de tareas NLP multilingues en entornos Apple: investigadores pueden validar hipotesis sobre el modelo base sin montar un stack de PyTorch, gracias a la paridad numerica documentada con el checkpoint original.
- Preprocesado en pipelines de datos sensibles: al ejecutarse localmente en el dispositivo, encaja en flujos donde no se permite enviar texto a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica documentada es la validacion de paridad de la conversion: diferencia absoluta maxima de 0,00099360943 y similitud coseno minima de 0,99999882 sobre seis casos deterministas (textos en ingles, japones, entrada vacia y truncamiento). El autor aclara que no constituye un benchmark de calidad de tarea ni de latencia.

## Requisitos de hardware

- Inferencia en dispositivos Apple con macOS 14+ o iOS 17+; el autor probo la prediccion en macOS, no en iPhone.
- VRAM estimada: no disponible. Al ejecutarse via Core ML, el consumo depende del Neural Engine o GPU del dispositivo; el repo ocupa 1,2 GB en F32.
- GPU recomendadas: no aplica en el sentido de CUDA; el runtime objetivo es Core ML (Neural Engine, GPU o CPU de Apple Silicon).
- Cabe en hardware de consumo Apple (Mac con Apple Silicon, iPhone y iPad compatibles con iOS 17+), siempre que se respete la forma de entrada fija.
- Opciones de despliegue: Core ML (`coremltools`), con variantes alternativas del mismo autor en MLX, Core AI y GGUF para otros runtimes.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| masahiroid/mdeberta-v3-base-coreml | no disponible | 128 tokens (fijo) | Core ML ML Program | MIT | Conversion F32 del checkpoint de Microsoft; sin cabeza de tarea |
| microsoft/mdeberta-v3-base | no disponible | hasta el maximo del modelo original | safetensors (PyTorch) | MIT | Checkpoint original; requiere stack PyTorch/Transformers |
| masahiroid/mdeberta-v3-base-mlx | no disponible | maximo original preservado | MLX | MIT | Misma conversion para runtime MLX en Apple Silicon |
| masahiroid/mdeberta-v3-base-gguf | no disponible | maximo original preservado | GGUF | MIT | Misma conversion para llama.cpp y derivados |

## Limitaciones y advertencias

- No es un modelo generativo: devuelve hidden states y no responde a instrucciones ni produce texto.
- La entrada esta fijada a batch 1 y 128 tokens; cualquier texto mas largo debe truncarse, con perdida de informacion.
- No incluye cabeza de tarea, por lo que no es utilizable directamente en produccion sin fine-tuning adicional.
- Los sesgos del checkpoint original de Microsoft se heredan sin mitigacion; no se ha realizado ninguna certificacion de seguridad.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de errores de clasificacion si se usa con cabezas mal calibradas.
- La licencia MIT se mantiene, pero el autor aclara que no se concede ninguna licencia comercial adicional ni certificacion implicita.
- La compatibilidad de versiones fuera del entorno probado (PyTorch 2.14.1, Transformers 4.57.3, coremltools 9.0) no esta garantizada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha validado en iPhone, solo en macOS.

## Enlaces

- [masahiroid/mdeberta-v3-base-coreml en Hugging Face](https://huggingface.co/masahiroid/mdeberta-v3-base-coreml)
- [microsoft/mdeberta-v3-base en Hugging Face](https://huggingface.co/microsoft/mdeberta-v3-base)
- [Variante MLX](https://huggingface.co/masahiroid/mdeberta-v3-base-mlx)
- [Variante Core AI](https://huggingface.co/masahiroid/mdeberta-v3-base-coreai)
- [Variante GGUF](https://huggingface.co/masahiroid/mdeberta-v3-base-gguf)
