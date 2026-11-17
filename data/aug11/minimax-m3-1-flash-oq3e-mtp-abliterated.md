# aug11/MiniMax-M3.1-Flash-oQ3e-mtp-abliterated

## Resumen

MiniMax-M3.1-Flash-oQ3e-mtp-abliterated es una derivación del modelo MiniMax M3.1 Flash en formato MLX, cuantizado a 3 bits y publicado por el usuario aug11 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de una modificación de inferencia sobre los pesos originales de `mlx-community/MiniMax-M3.1-Flash-oQ3e-mtp`: se aplica una ablación de la dirección de rechazo (abliteration) en tiempo de ejecución, sin recuantizar los expertos de 3 bits ni alterar el resto de archivos del repositorio base. El objetivo declarado es reducir la tasa de rechazos ante peticiones clasificadas como dañinas, manteniendo los pesos intactos y aplicando la intervención sobre las activaciones.

El modelo conserva la arquitectura del base, identificada en los metadatos como `minimax_m3_vl`, con 427.051.943.552 parámetros totales (unos 427 mil millones), lo que lo sitúa en la categoría de modelos de gran escala. El repositorio ocupa 196,2 GB y está pensado para ejecutarse con la librería MLX de Apple, lo que restringe su despliegue práctico a hardware con memoria unificada de gama alta (familias M3 Ultra y similares). La licencia es la MiniMax Community License, heredada del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de ablación aplicada a un modelo cuantizado de gran tamaño sin recuantización; por otro, advierte de las implicaciones técnicas y legales de usar derivados abliterated en producción. El autor publica métricas de comportamiento (tasa de rechazo antes y después) y de divergencia respecto al modelo original (KL sobre wikitext-2), lo que permite evaluar el coste de la intervención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), identificada como `minimax_m3_vl` en los metadatos; detalles internos no disponibles |
| Parametros totales | 427.051.943.552 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (etiqueta `3-bit`); el autor indica que los expertos de 3 bits no se recuantizan |
| Idiomas soportados | no disponible |
| Licencia | MiniMax Community License (`license: other`, `license_name: minimax-community`) |
| Formato de pesos | safetensors (MLX), con `model.safetensors.index.json`; tensores adicionales en `refusal_direction.safetensors` |
| Tamano del repositorio | 196,2 GB |
| Libreria de inferencia | MLX (fork `MacProvider` de `mlx-swift-lm`) |
| Dimension oculta | 6144 (indicada para el vector de direccion de rechazo) |
| Capas con ablacion | 16 a 42 (ambas inclusive) |
| Alpha de ablacion | 1,5 |
| Modelo base | `mlx-community/MiniMax-M3.1-Flash-oQ3e-mtp` (revision `b1084ba6`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) según la etiqueta `minimax_m3_vl`, cuantizado a 3 bits en formato MLX. Los detalles sobre número de capas totales, número de expertos, dimensión de la capa feed-forward, composición del dataset de entrenamiento, número de tokens vistos y si hubo RLHF o DPO no están disponibles en la información proporcionada. El autor solo documenta la intervención de ablación y algunos parámetros estructurales inferibles de ella: dimensión oculta de 6144 y presencia de capas decoder al menos hasta la 42.

La innovación técnica de esta derivación no está en el entrenamiento, sino en el método de ablación en inferencia. El autor calcula un vector unitario de dirección de rechazo (`language_model.refusal_direction`, float32, dimensión 6144) como la diferencia entre la media del *residual stream* del último token para 256 prompts dañinos (`mlabonne/harmful_behaviors`) y 256 prompts inofensivos (`mlabonne/harmless_alpaca`), tras la capa decoder 40, eliminando la componente a lo largo de la media de los inofensivos. En las capas 16 a 42, la salida de atención y la salida del MLP/MoE se transforman como `y - 1.5 * r * (r · y)` antes de cada suma residual, lo que equivale a editar cada peso que escribe en el residual como `W - 1.5 * r r^T W` sin recuantizar los expertos de 3 bits. El vector se lee mediante una clave añadida a `model.safetensors.index.json`, de modo que un runtime sin soporte para esta función detecta un peso desconocido en lugar de servir silenciosamente el modelo base sin modificar. El método sigue la abliteración GGUF publicada de este mismo modelo (dirección de la capa 40, capas 16-42, alpha 1,5).

## Capacidades

- Generación de texto y conversación multi-turno, según la etiqueta `text-generation` y `conversational` del repositorio.
- Capacidades multimodales potenciales: la etiqueta de arquitectura `minimax_m3_vl` sugiere integración de visión y lenguaje, aunque no se detallan en la información disponible.
- Razonamiento extendido: el autor menciona que, con un presupuesto de 768 tokens y decodificación greedy, parte de las respuestas seguían "razonando" al agotar el presupuesto (11 de 50 prompts dañinos y 4 de 30 inofensivos), lo que indica un modo de razonamiento con cadenas de pensamiento largas.
- Reducción de rechazos: la ablación elimina la dirección de rechazo en las capas 16 a 42, de modo que el modelo responde a peticiones que el base rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): el identificador sugiere visión; el resto no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente el efecto de la ablación de la dirección de rechazo sobre las activaciones, comparando la tasa de rechazo (19 de 20 en el base frente a 0 de 50 en el abliterated) y la divergencia KL (media 0,598; mediana 0,200) sobre wikitext-2 con 32.768 posiciones.
- Evaluación de técnicas de edición de pesos en modelos cuantizados: sirve como caso práctico de edición de los pesos que escriben en el residual (`W - 1.5 * r r^T W`) sin recuantizar expertos de 3 bits, útil para quienes investigan modificación de modelos MoE de gran tamaño en MLX.
- Auditoría de derivados abliterated: permite medir el deterioro de calidad respecto al base mediante la coincidencia top-1 (71,2 %) y la KL, un dato relevante para decidir si un derivado es aceptable en una tarea concreta.
- Desarrollo y prueba de runtimes MLX: el repositorio exige un runtime que lea la clave `language_model.refusal_direction` (fork `MacProvider` de `mlx-swift-lm`), por lo que es útil para validar la implementación de tensores opcionales y de intervenciones en inferencia en dicho ecosistema.
- Experimentación local en hardware Apple de gama alta: con 196,2 GB de pesos en 3 bits, el modelo está pensado para ejecutarse en equipos con memoria unificada muy grande (por ejemplo, M3 Ultra), lo que lo hace adecuado para prototipos y estudios que no dependen de clústeres con GPU.
- Estudio de la estabilidad del razonamiento bajo presupuesto de tokens: el autor reporta que 11 de 50 respuestas abliterated seguían razonando al agotar los 768 tokens, lo que permite analizar el equilibrio entre presupuesto de decodificación y finalización de la respuesta.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas de comportamiento y divergencia, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Se reproducen a continuación tal como aparecen en la model card, medidos en un M3 Ultra con decodificación greedy y presupuesto de 768 tokens, con el modelo abliterated y el original en el mismo proceso.

| Metrica | Resultado |
|---|---|
| Modelo sin modificar, 20 prompts dañinos reservados | 19 rechazos |
| Modelo abliterated, 50 prompts dañinos reservados | 0 rechazos, 39 respondidos, 11 seguían razonando al agotar el presupuesto |
| Modelo abliterated, 30 prompts inofensivos | 26 respondidos, 0 rechazos, 4 seguían razonando al agotar el presupuesto |
| KL respecto al modelo sin modificar, wikitext-2, 32.768 posiciones | media 0,598; mediana 0,200 |
| Coincidencia top-1 respecto al modelo sin modificar | 71,2 % |

El autor indica que los rechazos se clasificaron por palabras clave. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 196,2 GB en pesos de 3 bits, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM, más el espacio para el estado de inferencia (KV cache y activaciones), que no está cuantificado en la información disponible.
- GPU recomendadas: no disponible. El modelo está empaquetado para MLX, lo que implica ejecución en Apple Silicon con memoria unificada; el autor cita un M3 Ultra como plataforma de medida.
- Compatibilidad con GPU de consumo: no cabe en GPU de consumo convencionales (RTX 4090, 24 GB) por el tamaño del repositorio; requiere equipos Apple Silicon de gama alta con memoria unificada muy grande.
- Opciones de despliegue: MLX, concretamente el fork `MacProvider` de `mlx-swift-lm`, que es el runtime capaz de leer la clave `language_model.refusal_direction`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible. El autor solo indica el presupuesto de decodificación (768 tokens) y la plataforma (M3 Ultra), sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash-oQ3e-mtp-abliterated (este) | 427.051.943.552 | no disponible | 3 bits (MLX) | MiniMax Community License | Hugging Face, 50 descargas |
| mlx-community/MiniMax-M3.1-Flash-oQ3e-mtp (base) | 427.051.943.552 (heredado) | no disponible | 3 bits (MLX) | MiniMax Community License | Hugging Face |
| Otros derivados abliterated del mismo base | no disponible | no disponible | no disponible | MiniMax Community License | no disponible |

La información proporcionada no incluye datos de rendimiento de alternativas comparables, por lo que la comparación se limita a parámetros, cuantización, licencia y disponibilidad. No se dispone de cifras de benchmarks para establecer una comparación cuantitativa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- La ablación elimina deliberadamente la dirección de rechazo: el modelo responde a peticiones dañinas que el base rechazaría (0 rechazos en 50 prompts dañinos frente a 19 de 20 en el base). No debe desplegarse en aplicaciones orientadas al público sin filtros externos de seguridad.
- El autor advierte de que las mediciones de rechazo se clasificaron por palabras clave, un método con falsos positivos y negativos; las cifras deben interpretarse como indicativas.
- La divergencia respecto al base no es despreciable: KL media de 0,598 y coincidencia top-1 del 71,2 % sobre wikitext-2. Esto implica que el modelo puede degradar tareas que dependían de la calibración original, incluyendo razonamiento y generación de código, aunque no se aportan benchmarks específicos.
- Parte de las respuestas no finalizan dentro del presupuesto de 768 tokens (11 de 50 en prompts dañinos y 4 de 30 en inofensivos), lo que puede afectar a latencia y a la calidad en producción si no se ajusta el presupuesto.
- La licencia MiniMax Community License impone condiciones al uso comercial del derivado, incluida la obligación de mostrar "Built with MiniMax M3.1-Flash" y notificar a MiniMax, además de las prohibiciones de uso de la licencia original. Es responsabilidad del usuario revisar `LICENSE`.
- El runtime estándar de MLX no soporta la clave `language_model.refusal_direction`; se requiere el fork `MacProvider` de `mlx-swift-lm`. En otros runtimes, el modelo puede fallar al cargar o, si se ignora el tensor, comportarse de forma distinta a la documentada.
- El repositorio tiene 50 descargas y 0 likes en el momento de la ficha, con una única revisión publicada; no hay evidencia de validación independiente.
- Sesgos conocidos: no disponible en la información proporcionada. Al ser un derivado de un modelo base con datos de entrenamiento no documentados, los sesgos del base persisten y la ablación puede alterar su manifestación.
- Idiomas soportados: no disponible; no se puede garantizar calidad multilingüe.
- Longitud de contexto: no disponible; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aug11/MiniMax-M3.1-Flash-oQ3e-mtp-abliterated
- Modelo base: https://huggingface.co/mlx-community/MiniMax-M3.1-Flash-oQ3e-mtp
- Licencia: https://huggingface.co/aug11/MiniMax-M3.1-Flash-oQ3e-mtp-abliterated/blob/main/LICENSE
- Fork de runtime citado por el autor: `mlx-swift-lm` (MacProvider), sin URL directa en la información disponible
- Dataset de prompts dañinos citado: `mlabonne/harmful_behaviors`, sin URL directa en la información disponible
- Dataset de prompts inofensivos citado: `mlabonne/harmless_alpaca`, sin URL directa en la información disponible
