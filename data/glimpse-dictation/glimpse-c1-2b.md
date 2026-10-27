# Glimpse-Dictation/Glimpse-C1-2B

## Resumen

Glimpse C1 2B es un modelo especializado en la limpieza de dictado (*dictation cleanup*): recibe una transcripción de voz en bruto y devuelve texto escrito limpio, con puntuación correcta, sin muletillas ni reinicios falsos, aplicando autocorrecciones y comandos hablados. Lo desarrolla Glimpse-Dictation, el equipo del producto Glimpse (https://tryglimpse.cc), y está pensado para ejecutarse íntegramente en el dispositivo del usuario, sin enviar audio ni transcripciones a la nube.

Técnicamente no es un modelo entrenado desde cero: es un adaptador LoRA sobre Ternary Bonsai 2 2B de PrismML, un modelo ternario (2 bits) derivado de Qwen3.5 que se distribuye en formato MLX. El adaptador se ha entrenado sobre el *prompt* de limpieza propietario de Glimpse, con la transcripción del usuario envuelta en etiquetas `<transcript>…</transcript>`. El conjunto publica 1.882.232.640 parámetros y ocupa 0,6 GB en el repositorio, incluyendo los pesos base ya cuantizados.

Su relevancia es doble: por un lado, demuestra que una tarea de post-procesado de voz acotada se puede resolver con un modelo de menos de 2B parámetros en cuantización ternaria y latencias de 0,27 s en un Apple M2 Pro; por otro, su licencia es marcadamente restrictiva (glimpse-c1), con uso comercial, hosting o entrenamiento sobre sus salidas sujeto a permiso escrito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5 (Ternary Bonsai 2 2B), con adaptador LoRA superpuesto |
| Parámetros totales | 1.882.232.640 (~1,88B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria / 2 bits en formato MLX (`model.safetensors` de PrismML, 2-bit) |
| Idiomas soportados | No disponible (el autor reporta una suite de evaluación "non-English" de 55 casos, sin declarar lista de idiomas) |
| Licencia | Adaptador: glimpse-c1 (licencia propia, uso personal). Pesos base: Apache 2.0 de PrismML |
| Formato de pesos | safetensors (`adapter.safetensors` con alpha/r plegados en B, `model.safetensors` MLX 2-bit), más `config.json` y `tokenizer.json` |
| Modelo base | prism-ml/Ternary-Bonsai-2-2B-mlx-2bit |
| Tamaño del repositorio | 0,6 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de ~1,88B parámetros procedente de la familia Qwen3.5, publicado por PrismML como Ternary Bonsai 2 2B en cuantización ternaria de 2 bits para MLX. Sobre esa base, Glimpse entrena un adaptador LoRA de bajo rango; en el fichero distribuido los factores alpha y r están plegados en la matriz B, de modo que el adaptador se aplica de forma directa sobre los pesos base. El paquete publicado elimina los tensores de visión del modelo original, por lo que la variante distribuida es exclusivamente de texto.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; la model card únicamente indica que el adaptador se entrenó con el *prompt* de limpieza de Glimpse y el dictado en el turno de usuario dentro de etiquetas `<transcript>`. El autor advierte explícitamente que con otros *prompts* los resultados son peores, lo que convierte el formato de entrada en parte inseparable del modelo. La innovación práctica no está en la arquitectura, sino en la combinación de un modelo ternario de 2 bits con un adaptador de tarea muy específica, que permite inferencia local en Metal (Mac) y Vulkan (Windows) con latencias subsegundo.

## Capacidades

- Limpieza de dictado: eliminación de muletillas, tartamudeos y reinicios falsos de frase.
- Resolución de autocorrecciones habladas ("a las dos, no, en realidad a las tres" devuelve "a las tres").
- Puntuación automática: inserción de puntos, comas y signos en las posiciones correctas.
- Ejecución de comandos hablados, como convertir el texto en una lista de viñetas.
- Seguimiento de instrucciones de estilo (*modes*): desde un correo formal hasta un mensaje rápido de chat.
- Procesamiento de habla en bruto, con una suite específica de 52 casos en la evaluación del autor.
- Cobertura no inglesa parcial, medida en 55 casos con 54 aciertos en la suite del autor.
- Ejecución 100 % en el dispositivo (on-device), sin llamadas a servicios externos.
- No soporta tool calling, uso como agente, razonamiento multi-paso ni generación de código; el autor indica explícitamente que no es un modelo conversacional.

## Casos de uso

- Limpieza de dictado en aplicaciones de escritorio: integrar el adaptador en un cliente de notas o de correo para que el texto dictado llegue al campo de escritura sin muletillas ni puntuación defectuosa, con latencias de ~0,27 s por operación en un M2 Pro.
- Transcripción de reuniones y notas de voz: post-procesar la salida de un ASR previo para eliminar reinicios y aplicar autocorrecciones antes de guardar el acta, manteniendo el audio y el texto en local por motivos de privacidad.
- Redacción de correos por voz: usar los *modes* para reformular un dictado en tono formal, adecuado para comunicación con clientes, sin salir del portátil del usuario.
- Accesibilidad y entrada por voz: personas con movilidad reducida que dictan en lugar de teclear pueden obtener texto coherente y puntuado en herramientas ofimáticas, con un modelo que cabe en 0,6 GB de disco.
- Documentación técnica hablada: convertir un dictado de pasos de instalación o notas de incidencia en una lista de viñetas o pasos numerados mediante comandos hablados.
- Evaluación comparativa de modelos de post-proceso ASR: usar el conjunto de pruebas publicado (171 casos de limpieza, 24 de autocorrección, 52 de habla bruta, 55 no ingleses) como referencia para comparar alternativas on-device.
- Prototipado de pipelines de voz en Mac y Windows: al ejecutarse sobre Metal y Vulkan, sirve para validar un flujo de dictado completo antes de decidir si se necesita un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor en sus pruebas de limpieza de dictado, ejecutadas en un Apple M2 Pro con el *prompt* recomendado de cada modelo:

| Modelo | Suite de limpieza (171) | Autocorrecciones (24) | Habla bruta (52) | No inglés (55) |
|---|---|---|---|---|
| Glimpse C1 2B | 162 | 22 | 47 | 54 |
| Superwhisper S1-mini | 123 | 20 | 39 | 35 |
| SimpleWords v2 | 118 | 15 | 24 | 40 |
| Apple Intelligence | 114 | 15 | 27 | 36 |
| Bonsai 2B sin entrenar | 88 | 1 | 15 | 33 |

Latencia declarada: 0,27 s para una limpieza típica en un M2 Pro. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 0,5-0,6 GB para los pesos en 2 bits; el repositorio completo ocupa 0,6 GB, por lo que la inferencia cabe holgadamente en 2 GB de memoria, incluyendo buffers de KV y tokenizador.
- Cabe en cualquier GPU de consumo actual e incluso en inferencia sobre CPU; el autor lo ejecuta en un Apple M2 Pro (Metal) y en Windows mediante Vulkan.
- GPU recomendadas: no se especifican; cualquier iGPU o dGPU con soporte Metal o Vulkan es suficiente dada la cuantización ternaria.
- Opciones de despliegue: el runtime de Glimpse (Metal en Mac, Vulkan en Windows) y el ecosistema MLX de Apple, dado que los pesos publicados son MLX 2-bit. El soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible.
- Latencia y throughput: ~0,27 s por operación de limpieza en M2 Pro; no se han publicado cifras de *tokens* por segundo ni de rendimiento en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Suite de limpieza (171) | Disponibilidad |
|---|---|---|---|---|---|
| Glimpse C1 2B | ~1,88B | No disponible | glimpse-c1 (uso personal; comercial con permiso) | 162 | HuggingFace, pesos safetensors |
| Superwhisper S1-mini | No disponible | No disponible | No disponible | 123 | Producto comercial de Superwhisper |
| SimpleWords v2 | No disponible | No disponible | No disponible | 118 | No disponible |
| Apple Intelligence | No disponible | No disponible | Propietaria | 114 | Integrado en macOS/iOS |
| Bonsai 2B sin entrenar | ~2B (base) | No disponible | Apache 2.0 (base PrismML) | 88 | HuggingFace |

La comparación se limita a la suite propietaria del autor; no hay datos públicos de MMLU, latencia o consumo equiparables para las alternativas, y sus fichas técnicas no están disponibles en la información consultada.

## Limitaciones y advertencias

- Licencia restrictiva: el adaptador es gratuito solo para uso personal en dispositivos propios. Distribuirlo en un producto o servicio, alojarlo, compartirlo, usarlo comercialmente o entrenar sobre sus salidas requiere permiso escrito de Glimpse (hello@tryglimpse.cc).
- No es un modelo conversacional: está ajustado para limpieza de dictado y su comportamiento fuera de esa tarea es deficiente.
- Dependencia del *prompt*: fue entrenado con el *prompt* de limpieza de Glimpse y el dictado envuelto en `<transcript>…</transcript>`; con otros formatos se deben esperar resultados peores.
- Capacidad limitada por el tamaño: dictados largos o muy enrevesados pueden devolver alguna corrección sin aplicar o conservar frases que deberían eliminarse.
- Los *modes* de estilo se siguen en aproximadamente el 80 % de los casos reservados (*held-out*).
- Riesgo de alucinación en forma de corrección inventada: al reescribir el texto puede alterar contenido que el usuario sí quería conservar, algo crítico en contextos médicos, legales o financieros.
- Idiomas: no se declara una lista oficial; la única evidencia es la suite "non-English" del autor (54/55), insuficiente para garantizar calidad multilingüe general.
- Sin tensores de visión: la variante distribuida ha eliminado las capacidades multimodales del modelo base.
- Validación externa muy limitada: 0 descargas y 0 *likes* en HuggingFace en el momento de la consulta; todos los benchmarks proceden del propio autor.
- Longitud de contexto no documentada: no se debe asumir que soporta dictados de varios minutos en una sola pasada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Glimpse-Dictation/Glimpse-C1-2B
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-mlx-2bit
- Anuncio del modelo: https://tryglimpse.cc/blog/c1-cleanup-model
- Producto Glimpse: https://tryglimpse.cc
- Licencia del adaptador: https://huggingface.co/Glimpse-Dictation/Glimpse-C1-2B/blob/main/LICENSE-C1.md
- Contacto para licencias comerciales: hello@tryglimpse.cc
- Los resultados de búsqueda web obtenidos (meetglimpse.com, WordReference, Linguee, Cambridge Dictionary) no están relacionados con este modelo y se han descartado.
