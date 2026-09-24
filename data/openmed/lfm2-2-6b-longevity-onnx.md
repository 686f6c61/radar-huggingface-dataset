# OpenMed/LFM2-2.6B-Longevity-ONNX

## Resumen

OpenMed/LFM2-2.6B-Longevity-ONNX es una conversión a formato ONNX del modelo LiquidAI/LFM2-2.6B-Longevity, el ajuste fino "Longevity-LLM" desarrollado conjuntamente por Liquid AI e Insilico Medicine sobre la arquitectura LFM2. OpenMed, un tercero sin afiliación con los autores originales, ha exportado y cuantizado los pesos para que el modelo pueda ejecutarse en local mediante ONNX Runtime y Transformers.js. El resultado mantiene los 2.570 millones de parámetros del original pero reduce el peso de los tensores de 16 bits por peso a 5,84 bits por peso medidos, ocupando 1,75 GiB.

El modelo resuelve un problema muy concreto: llevar un LLM de dominio biomédico especializado en biología del envejecimiento a dispositivos sin GPU y sin conexión, como móviles Android, navegadores o portátiles con CPU. Para ello combina una cuantización int4 asimétrica del cuerpo del modelo con int8 en las capas que más degradación sufren a 4 bits (según la heurística de llama.cpp Q4_K_M) y en la tabla de embeddings compartida.

Arquitectónicamente es un modelo híbrido `lfm2` de Liquid AI: 30 capas, de las cuales solo 8 son de atención con grouped-query attention y las otras 22 son convoluciones cortas con puertas. El tamaño oculto es de 2.048 y el vocabulario de 65.536 tokens con embeddings de entrada y salida atados. Está pensado exclusivamente para investigación y educación; el propio autor advierte de que no es un producto sanitario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2` (`Lfm2ForCausalLM`); híbrida: 22 capas de convolución corta con puertas y 8 capas de grouped-query attention sobre 30 capas totales |
| Parametros totales | 2,57 B (2.570 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documenta en la información proporcionada) |
| Tipos de cuantizacion | Cuerpo en int4 asimétrico round-to-nearest (uint4 + zero point empaquetado), bloque 32, escalas fp32, MatMulNBits accuracy_level 4; tensores sensibles y tabla compartida de embedding/salida en int8 asimétrico bloque 32. Medido: 5,84 bits por peso |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (etiquetada como `other` / `lfm1.0` en HuggingFace) |
| Formato de pesos | ONNX (grafo `onnx/model_q4.onnx` + datos externos `onnx/model_q4.onnx_data`); no hay safetensors ni GGUF en este repositorio |
| Tamano oculto | 2.048 |
| Numero de capas | 30 (8 de atención, 22 de convolución) |
| Vocabulario | 65.536 tokens, embeddings de entrada y salida atados |
| Tamano del repositorio | 1,9 GB (pesos medidos desde los tensores: 1,75 GiB; `onnx_data` 1.821,4 MiB) |
| Modelo base | LiquidAI/LFM2-2.6B-Longevity, revisión `05b12a8dc8a1e095038ae1a0a4524f8b21153916` |
| Biblioteca declarada | transformers.js |

## Arquitectura y entrenamiento

El modelo original pertenece a la familia LFM2 de Liquid AI, un diseño híbrido que sustituye la mayor parte de las capas de atención por convoluciones cortas con puertas. De las 30 capas, 22 son convoluciones y solo 8 son de atención, y esas 8 usan grouped-query attention. Con un tamaño oculto de 2.048 y un vocabulario de 65.536 tokens con embeddings atados, el objetivo del diseño es reducir el coste de memoria y cómputo del caché durante la decodificación, algo coherente con el enfoque on-device de esta conversión. Sobre esta base, Liquid AI e Insilico Medicine aplicaron un ajuste fino de dominio denominado Longevity-LLM, orientado a biología del envejecimiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación de esta ficha concreta es la conversión y cuantización, no el entrenamiento. OpenMed exportó el grafo a FP32 con `Liquid4All/onnx-export` (el exportador oficial de Liquid) y lo cuantizó con `MatMulNBitsQuantizer` de onnxruntime 1.30.0 sin datos de calibración, es decir, con round-to-nearest puro. Las capas que más pierden a 4 bits —`down_proj` en el primer y último octavo de capas y en una de cada tres intermedias, y `v_proj` bajo la misma regla sobre las capas de atención— se mantienen a 8 bits, igual que la tabla compartida de embedding y cabeza de salida, que se almacena una sola vez en int8 bloque 32 y se lee con `GatherBlockQuantized` (embedding) y `MatMulNBits` a 8 bits (cabeza). El tokenizador, la plantilla de chat y los valores por defecto de generación son los originales sin modificar.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con plantilla de chat incluida (`chat_template.jinja`).
- Conocimiento especializado en biología del envejecimiento y longevidad, procedente del ajuste fino Longevity-LLM sobre LFM2.
- Interpretación de vocabulario biomédico general (biomarcadores, paneles sanguíneos, literatura del área) según el ejemplo incluido en la model card.
- Directiva `/no_think` en el mensaje de usuario, lo que indica que el modelo admite control del modo de razonamiento. El comportamiento detallado de ese modo no se documenta en la información disponible.
- Ejecución on-device: el grafo funciona en ONNX Runtime con el execution provider de CPU y en Transformers.js 4.3.0, que produjeron tokens greedy idénticos.
- El grafo expone cachés de convolución (`past_conv.*`) y de atención (`past_key_values.*`), por lo que soporta decodificación incremental paso a paso.
- Tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente, razonamiento multi-paso explícito, visión o audio: no documentadas.
- Capacidades multilingües: limitadas a inglés según el campo `language` del repositorio.

## Casos de uso

- Asistente de literatura científica sobre envejecimiento: dado que el modelo está ajustado sobre Longevity-LLM, puede resumir y explicar conceptos de biología del envejecimiento para investigadores, sin salir del dispositivo y por tanto sin enviar manuscritos no publicados a un servicio externo.
- Aplicación Android sin conexión para consultas formativas: empaquetando `onnxruntime-android` y los 1,75 GiB de pesos, se puede ofrecer un chat educativo sobre biomarcadores de edad biológica en un móvil de gama alta, útil en entornos con conectividad limitada.
- Módulo de chat en navegador con Transformers.js: el pipeline declarado (`pipeline("text-generation", ..., { dtype: "q4" })`) permite integrar el modelo en una aplicación web sin backend, descargando los pesos una vez y ejecutándolos en el cliente.
- Preprocesado de paneles sanguíneos en investigación: el modelo puede generar explicaciones sobre qué marcadores de una analítica rutinaria se relacionan con la edad biológica, tal y como muestra el ejemplo de la model card, siempre como material de estudio y no como diagnóstico.
- Prototipado de producto sanitario: sirve para validar la viabilidad de un LLM de dominio en hardware de consumo antes de invertir en un modelo mayor o en infraestructura GPU, gracias a su huella de 1,75 GiB.
- Evaluación de pipelines de cuantización: la model card publica métricas de fidelidad respecto al modelo original (KL, acuerdo top-1, perplejidad), de modo que el repositorio es un caso de estudio útil para comparar estrategias int4 frente a int8 en arquitecturas híbridas convolución-atención.
- Generación de material docente: creación de preguntas, resúmenes y glosarios sobre longevidad para cursos o divulgación, con la advertencia de que las salidas deben verificarse.
- Filtrado y clasificación previa de texto biomédico en local: por privacidad, permite procesar notas o resúmenes sensibles sin salir del equipo, aunque la ausencia de benchmarks de clasificación hace necesaria una validación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas comparativas frente a otros modelos. Sí se publican métricas de fidelidad de la cuantización respecto al modelo original en FP32, medidas sobre 4.092 tokens de prosa de dominio público (Project Gutenberg) con ONNX Runtime 1.30.0 en CPU:

| Metrica | Valor |
|---|---|
| Divergencia KL media de las distribuciones del siguiente token | 0,057 |
| Acuerdo top-1 del siguiente token | 88,2 % |
| Cambio de perplejidad | -0,2 % |
| Bits por peso (medido desde los tensores) | 5,84 (frente a 16 en el original BF16) |
| Peso de los tensores | 1,75 GiB |

El export FP32 del que se cuantizó este build coincide con el modelo original (acuerdo top-1 del 100 %), por lo que toda la diferencia anterior procede de la cuantización. No hay datos de rendimiento en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2 GB solo para los pesos (1,75 GiB medidos). Hay que sumar el caché de claves y valores de las 8 capas de atención, más los estados de las 22 convoluciones, cuyo tamaño depende de la longitud de contexto, no documentada.
- GPU recomendadas: no disponibles. La model card solo documenta pruebas con el execution provider de CPU de ONNX Runtime en macOS; no se menciona ningún backend CUDA, DirectML o similar.
- Cabe en GPU de consumo: sí, por tamaño de pesos cualquier GPU con 4 GB o más de memoria lo alojaría, pero no hay validación publicada de ejecución en GPU para este grafo. La vía soportada y probada es CPU.
- Opciones de despliegue: ONNX Runtime 1.30 o superior (incluido `onnxruntime-android` en Android) y Transformers.js 4.3.0 en navegador o Node. El grafo usa operadores `com.microsoft` (`MatMulNBits`, `GatherBlockQuantized`, `GroupQueryAttention`), por lo que runtimes anteriores a la versión 1.30 no servirán.
- vLLM, llama.cpp, Ollama o TGI: no aplicables a esta conversión, ya que el repositorio no incluye pesos GGUF ni safetensors.
- Latencia y throughput estimados: no disponibles. La model card indica explícitamente que el modelo todavía no se ha medido en un dispositivo Android y no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenMed/LFM2-2.6B-Longevity-ONNX (esta ficha) | 2,57 B | no disponible | 5,84 (int4 + int8 selectivo) | ONNX cuantizado | LFM Open License v1.0 | Repositorio HuggingFace, 1,9 GB |
| LiquidAI/LFM2-2.6B-Longevity (modelo base en BF16) | 2,57 B | no disponible | 16 | PyTorch (BF16) | LFM Open License v1.0 | Repositorio HuggingFace del autor original |
| LiquidAI/LFM2-2.6B (modelo LFM2 sin ajuste de longevidad) | 2,57 B (según la familia LFM2) | no disponible | no disponible | no disponible | no disponible | Repositorio HuggingFace de Liquid AI |

No se dispone de datos de contexto, licencia ni formato de pesos de las alternativas más allá de lo indicado, ni de benchmarks que permitan comparar calidad entre ellas. Cualquier otro modelo comparable (por ejemplo, otros LLM de 2 a 3 B cuantizados para on-device) queda fuera de la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el campo `language` del repositorio declara únicamente `en`; no hay soporte multilingüe documentado.
- Longitud de contexto no documentada: no se puede planificar un caso de uso con ventanas largas sin verificarla experimentalmente.
- No es un producto sanitario: la model card indica que es para investigación y educación sobre biología del envejecimiento y que no sustituye el consejo, diagnóstico o tratamiento médico profesional. Las salidas pueden ser erróneas y deben verificarse.
- Riesgo de alucinación en dominio biomédico: al ser un ajuste fino de dominio, existe riesgo de generar afirmaciones clínicas plausibles pero incorrectas; no debe usarse para decisiones sobre pacientes.
- Degradación por cuantización: el acuerdo top-1 del 88,2 % frente al original implica que aproximadamente uno de cada ocho tokens siguientes difiere del modelo sin cuantizar, y el error puede acumularse en generaciones largas.
- Cuantización sin calibración: se aplicó round-to-nearest sin datos de calibración, la opción más simple pero no la más precisa.
- Dependencia de operadores propietarios de Microsoft: requiere ONNX Runtime 1.30 o superior con los operadores `com.microsoft`, lo que limita la portabilidad a otros motores de inferencia.
- Sin validación en Android: aunque el repositorio está etiquetado como `android` y `on-device`, la model card afirma que no se ha medido todavía en un dispositivo Android.
- Licencia: LFM Open License v1.0, la licencia del modelo original. Los términos concretos de uso comercial no se detallan en la información proporcionada y deben revisarse en el fichero `LICENSE` antes de cualquier despliegue productivo.
- Conversión de terceros: OpenMed no está afiliado ni respaldado por los autores del modelo, y el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción.
- Sesgos: no documentados en la información disponible.
- Especialización estrecha: al ser un ajuste fino sobre longevidad, es previsible cierto deterioro en conocimiento general respecto al LFM2-2.6B base, aunque no se aportan datos que lo cuantifiquen.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/OpenMed/LFM2-2.6B-Longevity-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B-Longevity
- ONNX: https://onnx.ai
- ONNX Runtime: https://onnxruntime.ai
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Exportador oficial de Liquid AI: Liquid4All/onnx-export
- Licencia del modelo: fichero `LICENSE` dentro del repositorio (LFM Open License v1.0)
- La búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo; los enlaces obtenidos no guardan relación con el contenido de esta ficha.
