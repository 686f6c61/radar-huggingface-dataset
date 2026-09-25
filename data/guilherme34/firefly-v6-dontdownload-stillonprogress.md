# Guilherme34/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS

## Resumen

Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS es un checkpoint experimental publicado por el usuario Guilherme34 (Guilherme Keller2) en Hugging Face. Se trata de un ajuste fino de tipo LoRA, entrenado con Axolotl exclusivamente sobre la torre de texto y posteriormente fusionado en el modelo completo de la familia Gemma 4. El modelo parte de Firefly-v5, un checkpoint previo del mismo autor, y arrastra los componentes de visión y audio del modelo original, que se mantuvieron congelados durante el entrenamiento. El pipeline declarado es image-text-to-text, aunque el ajuste realizado es puramente textual.

El propio nombre del repositorio y su model card son explícitos: "DO NOT DOWNLOAD YET — STILL IN PROGRESS". El autor indica que se completaron los 3.329 pasos de optimizador previstos, pero que la subida es experimental y está pendiente de su propia evaluación. No se ejecutó ninguna batería de evaluación y no se reclama ninguna mejora ni superioridad frente a otros modelos. Los checkpoints de optimizador y los registros detallados de entrenamiento permanecen en un repositorio privado del autor.

Por tamaño, el repositorio pesa 10,2 GB y el recuento real de safetensors indica 5.104.297.504 parámetros (unos 5,1 B), coherente con pesos en bfloat16. El interés de esta ficha es documental: sirve para trazar la cadena de checkpoints de la familia Firefly y para entender qué se puede y qué no se puede hacer hoy con este artefacto, que en el momento de redactarla acumula 0 descargas y 0 "likes" y no declara licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4; LoRA de texto fusionado sobre el modelo completo, con componentes de visión y audio congelados |
| Parámetros totales | 5.104.297.504 (aproximadamente 5,1 B) |
| Parámetros activos | No aplica: no se declara una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible para este checkpoint. Fichas de terceros del checkpoint v5-sft de la misma familia indican 32K, dato no verificable para v6 |
| Tipos de cuantización | No disponible. Solo se publican pesos en safetensors; no hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El repositorio advierte de que las fuentes de datos conservan sus licencias, y que No Robots es CC BY-NC 4.0 |
| Formato de pesos | safetensors |
| Librería declarada | transformers |
| Pipeline | image-text-to-text |
| Modelo base | Guilherme34/Firefly-v5 |
| Tamaño del repositorio | 10,2 GB |
| Pasos de entrenamiento | 3.329 pasos de optimizador (completados) |
| Fecha de creación | 2026-09-24 |
| Última actualización | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer multimodal de la familia Gemma 4, sobre el que se aplicó un ajuste LoRA limitado a la torre de texto. El entrenamiento se realizó con Axolotl y el adaptador resultante se fusionó en los pesos completos del modelo, de ahí que el repositorio contenga el modelo fusionado junto con el procesador, el tokenizador y la plantilla de chat (chat_template.jinja). Los módulos de visión y audio del modelo original se mantuvieron congelados: están presentes en los pesos, pero no recibieron actualización de gradientes ni fueron evaluados después de la fusión.

No se documenta el número de tokens de entrenamiento, la composición exacta de las mezclas ni la existencia de fases de RLHF, DPO u optimización por preferencias. Las fuentes de datos declaradas en las etiquetas del repositorio son cuatro: openbmb/UltraData-SFT-Agent-2609, orientado a agentes y uso de herramientas; oyc502/RoleMRC, orientado a roleplay y comprensión de roles; HuggingFaceH4/no_robots, un conjunto de instrucciones de alta calidad con licencia CC BY-NC 4.0; y HuggingFaceTB/everyday-conversations-llama3.1-2k, con conversaciones cotidianas. No se describen innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Generación de texto conversacional multi-turno, según los conjuntos de conversaciones cotidianas declarados en el entrenamiento.
- Uso de herramientas y function calling: el repositorio incluye la etiqueta tool-use y remite a una guía de inferencia (README-inference.md) para el formato de mensajes de herramienta.
- Comportamiento agéntico y razonamiento en varios pasos, por influencia del conjunto UltraData-SFT-Agent-2609.
- Roleplay y adopción de personajes, por influencia del conjunto RoleMRC.
- Cumplimiento de instrucciones generales, por el conjunto no_robots.
- Capacidades multimodales latentes: el pipeline declarado es image-text-to-text y los componentes de visión y audio existen en los pesos, pero permanecieron congelados y su comportamiento posterior a la fusión no ha sido evaluado.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito ("thinking"), audio o visión funcional: no disponibles o no evaluados.

## Casos de uso

- Evaluación interna de checkpoints experimentales: el propio propósito declarado por el autor es revisar si la fusión del LoRA ha degradado el modelo antes de publicar una versión validada. Es el uso para el que el artefacto está pensado hoy.
- Prototipado de agentes con uso de herramientas: el ajuste incluye un conjunto específico de agentes y la etiqueta tool-use, de modo que sirve para probar plantillas de mensajes de herramienta y bucles de llamada a funciones en entornos controlados, siempre con validación manual.
- Asistentes de roleplay y personajes: el conjunto RoleMRC apunta a este escenario; el modelo puede emplearse en demos de conversación con personalidad sostenida en múltiples turnos.
- Chat de dominio general: los conjuntos no_robots y everyday-conversations permiten evaluar respuestas a instrucciones cotidianas y conversaciones informales.
- Investigación sobre fusión de LoRA en modelos multimodales: al haberse entrenado solo la torre de texto y congelado visión y audio, es un caso de estudio sobre qué ocurre con las capacidades no entrenadas tras la fusión de pesos.
- Base para nuevos ajustes dentro de la cadena Firefly: un checkpoint de 5,1 B en safetensors puede servir como punto de partida para un SFT posterior o para iteraciones v7.
- Despliegue local de bajo coste: con 5,1 B de parámetros y 10,2 GB de pesos, es viable en GPU de consumo para pruebas de inferencia, siempre que se acepte su carácter no validado.
- Pruebas de tokenizador y plantilla de chat: el repositorio incluye chat_template.jinja y el procesador, útiles para verificar el formato de entrada antes de integrar el modelo en una aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que no se ejecutó ninguna evaluación a petición del propietario y que no se formula ninguna afirmación de superioridad o mejora frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento real de 5.104.297.504 parámetros: aproximadamente 10,2 GB en bfloat16 o float16 solo para los pesos, unos 5,1 GB en cuantización de 8 bits y unos 2,6 GB en 4 bits. A esas cifras hay que sumar activaciones y caché KV.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en bfloat16 con margen; en tarjetas de 16 GB como la RTX 4080 conviene bajar a 8 bits; en GPU de 8-12 GB es necesario cuantizar a 4 bits.
- GPU de datacenter: A100 (40/80 GB) y H100 para servir varias réplicas o contextos largos. No se dispone de datos de rendimiento para estas configuraciones.
- Caché KV: no se ha publicado la configuración de capas y cabezas de atención, por lo que no es posible estimar el consumo por token de contexto. Si el modelo hereda los 32K que terceros atribuyen al checkpoint v5-sft, la caché KV crecerá de forma apreciable con la longitud de contexto.
- Opciones de despliegue: la librería declarada es transformers, por lo que el despliegue directo con Python es la vía soportada. No hay confirmación de soporte en vLLM, TGI, SGLang ni Ollama para este checkpoint concreto. Al no publicarse pesos GGUF, el uso en llama.cpp u Ollama exigiría una conversión propia, no documentada y potencialmente problemática por los componentes de visión y audio congelados.
- Entrenamiento: el autor empleó Axolotl para el ajuste LoRA; no se publican los checkpoints de optimizador ni el coste de cómputo.
- Latencia y throughput: no disponibles.
- Servicios de terceros: Featherless y Friendli ofrecen despliegue del checkpoint v5-sft de la misma familia, no de este v6. Featherless indica contexto de 32K y precio plano desde 10 dólares al mes para aquel checkpoint, dato que no debe extrapolarse a v6 sin verificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Firefly-v6 (este repositorio) | 5,10 B | No disponible (32K atribuidos por terceros al v5-sft) | No disponible | safetensors | Experimental, sin validar, marcado como no descargable |
| Firefly-v5 (modelo base) | No disponible | No disponible | No disponible | No disponible | Base del ajuste v6 |
| Firefly-v5-sft-DONTDOWNLOAD-almostfinished | 5,1 B | 32K según Featherless | No disponible | safetensors | Experimental, "casi terminado" |

No se dispone de datos verificables de parámetros, contexto, licencia ni rendimiento de modelos de terceros de categoría equivalente dentro de la información recogida, por lo que no es posible establecer una comparativa rigurosa frente a alternativas externas. Cualquier comparación con modelos multimodales abiertos de tamaño similar (familias Gemma, Qwen-VL u otras) quedaría en el terreno de la especulación y se marca, por tanto, como no disponible.

## Limitaciones y advertencias

- El autor indica explícitamente "DO NOT DOWNLOAD YET — STILL IN PROGRESS". Es un artefacto experimental pendiente de evaluación, no una versión validada.
- No se ha ejecutado ninguna evaluación. No existen datos de calidad, seguridad, sesgos ni robustez.
- Los componentes de visión y audio estaban congelados y su comportamiento tras la fusión de pesos no ha sido evaluado; el pipeline declarado como image-text-to-text no implica que esas capacidades funcionen correctamente.
- La licencia no está declarada en los metadatos. El conjunto HuggingFaceH4/no_robots se distribuye bajo CC BY-NC 4.0, lo que restringe el uso comercial del modelo derivado. Hay que revisar ATTRIBUTION.md antes de redistribuir o explotar el modelo.
- No se declaran idiomas soportados, por lo que no hay garantía de cobertura multilingüe ni de calidad fuera del inglés de los conjuntos de datos empleados.
- No hay información sobre sesgos sociales, políticos o culturales. Al entrenarse sobre mezclas no auditadas, el riesgo de sesgo es indeterminado.
- El riesgo de alucinación no ha sido medido. En tareas de uso de herramientas o agentes, una alucinación en los argumentos de una llamada puede provocar efectos reales en sistemas conectados.
- El conjunto de datasets incluye material de roleplay, lo que puede producir respuestas inadecuadas fuera de ese contexto si no se aplican filtros.
- No existe validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta.
- Los metadatos son mínimos: el repositorio se creó y actualizó con dos minutos de diferencia el 2026-09-24, sin historial de versiones.
- El repositorio ocupa 10,2 GB, un coste de almacenamiento y descarga no trivial para un modelo cuyo uso todavía no está recomendado.
- Los checkpoints de optimizador y los registros de entrenamiento no son públicos, lo que limita la reproducibilidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Guilherme34/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS
- Perfil del autor: https://huggingface.co/Guilherme34
- Checkpoint previo de la familia (v5-sft): https://huggingface.co/Guilherme34/Firefly-v5-sft-DONTDOWNLOAD-almostfinished
- Árbol de ficheros del checkpoint v5-sft: https://huggingface.co/Guilherme34/Firefly-v5-sft-DONTDOWNLOAD-almostfinished/tree/main
- Ficha de despliegue del v5-sft en Featherless: https://featherless.ai/models/Guilherme34/Firefly-v5-sft-DONTDOWNLOAD-almostfinished
- Ficha de despliegue del v5-sft en Friendli: https://friendli.ai/models/Guilherme34/Firefly-v5-sft-DONTDOWNLOAD-almostfinished
- Conjunto de datos openbmb/UltraData-SFT-Agent-2609: https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
- Conjunto de datos oyc502/RoleMRC: https://huggingface.co/datasets/oyc502/RoleMRC
- Conjunto de datos HuggingFaceH4/no_robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Conjunto de datos HuggingFaceTB/everyday-conversations-llama3.1-2k: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
- Ficheros citados en la model card y no verificados en esta búsqueda: README-inference.md (guía de mensajes de herramienta) y ATTRIBUTION.md (atribución de fuentes y licencias)
