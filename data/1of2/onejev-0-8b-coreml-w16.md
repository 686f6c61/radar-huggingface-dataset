# 1of2/onejev-0.8b-coreml-w16

## Resumen

OneJev 0.8B Core ML W16A16 es la conversión a Core ML del modelo multimodal OneJev-0.8B, publicada por el usuario 1of2. No se trata de un modelo de lenguaje generativo al uso, sino de un "System One decision model": recibe texto, capturas de pantalla, fotos o fotogramas de vídeo junto con preguntas tipadas y devuelve, en una sola pasada forward, una probabilidad calibrada para cada opción de respuesta. Las tres modalidades de pregunta son Choice (elegir entre varias opciones nombradas), Noul (verificar si una afirmación es cierta) y Score (situar algo en una escala).

La particularidad de esta ficha es que el modelo no se distribuye como pesos estándar sino como un artefacto Core ML sellado que ejecuta la totalidad de sus 33 funciones y 37.809 operaciones en el Neural Engine de los Mac con Apple Silicon, sin planificar ninguna operación en CPU ni GPU. Con 0,8B de parámetros y 2.048 tokens de contexto, está pensado para inferencia local en el portátil o sobremesa del usuario, no para servidores.

Es relevante porque ejemplifica una línea poco habitual: modelos pequeños, multimodales y de decisión que se despliegan íntegramente en aceleradores de consumo en lugar de GPUs de centro de datos. Su licencia Apache 2.0 y su conversión cuantizada a FP16 lo hacen evaluable sin fricción legal, aunque se trata de una conversión no oficial y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas Gated DeltaNet (atención lineal con estado recurrente) y una capa de atención completa cada cuatro; encoder de visión con patch merger |
| Parámetros totales | ~0,8 mil millones (0,8B); la tabla de embeddings [248320, 1024] aporta aproximadamente 254 millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens en total (prefijo compartido + medios + pregunta); el contrato de ejecución exige rechazar las peticiones más largas en lugar de truncarlas |
| Tipos de cuantización | W16A16 (pesos, activaciones y estado recurrente en FP16); existe una variante W8A16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage compilado a .mlmodelc) más artefactos del host: embedding.f16, head.f32, norm.f32 y vision_positions.f32 |

## Arquitectura y entrenamiento

El modelo base OneJev-0.8B es un transformer híbrido. Según el manifiesto de la conversión, cada cuarta capa es de atención completa y el resto son capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente. El decodificador se reparte en seis shards de cuatro capas cada uno (24 capas en total) con un tamaño oculto de 1024. Las capas de atención completa manejan claves y valores de forma [B, 2, 2048, 256], mientras que las capas Gated DeltaNet transportan un estado convolucional `conv` [B, 3, 6144] y un estado recurrente `ssm` [B, 16, 128, 128] escalado a 64 veces respecto al valor original. El encoder de visión se divide en tres shards de cuatro bloques (12 bloques), con el patch merger situado en el último, y admite 256, 1024 o 4096 parches por imagen.

La conversión a Core ML fija pesos y activaciones en FP16 y usa una tabla de embeddings FP16 de 248.320 × 1024 que se consulta en el host, igual que la cabeza de respuesta, que es FP32 y tiene 256 × 1024 filas correspondientes a los tokens de slot. Sobre el entrenamiento del modelo original no hay información en los datos disponibles: no se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable no está en el entrenamiento sino en el contrato de ejecución: el prefijo (estado y medios) se comparte entre preguntas, cada pregunta se procesa como fila de un lote de 4 bifurcada desde el estado del prefijo, y las probabilidades finales se obtienen aplicando la norma RMS final, redondeando a FP16 y proyectando con la cabeza sobre los slots de la pregunta. El autor indica explícitamente que las temperaturas no están ajustadas y que la validación se hizo sobre un Apple M4 Max con macOS 27.0.1.

## Capacidades

- Respuesta tipada con probabilidades calibradas: Choice (selección entre opciones nombradas), Noul (verdadero/falso sobre una afirmación) y Score (posición sobre una escala), siguiendo las fórmulas del renderizador `qev`.
- Entrada multimodal: texto, capturas de pantalla, fotografías y fotogramas sueltos o grupos temporales de un clip de vídeo.
- Procesamiento en una sola pasada forward, sin generación autoregresiva token a token.
- Ejecución íntegra en el Neural Engine de Apple Silicon, con las 33 funciones y 37.809 operaciones planificadas fuera de CPU y GPU.
- Prefijo compartido: el estado y los medios se reutilizan entre varias preguntas, de modo que varias consultas sobre la misma imagen comparten cómputo.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el idioma no se declara en la información proporcionada).
- Modo thinking: el contrato de ejecución exige renderizar los prompts con thinking desactivado, versión de prompt `qev-labels-v2`.
- Salida numérica probabilística por opción, apta para umbrales y agregación posterior.

## Casos de uso

- Control de calidad visual automatizado: dado un conjunto de capturas de pantalla de una aplicación, el modelo puede responder preguntas tipo Noul ("¿el botón de confirmación está habilitado?") devolviendo una probabilidad, lo que permite construir un pipeline de verificación de interfaz con umbral configurable.
- Moderación y clasificación de contenido local: con fotografías o fotogramas de vídeo y preguntas Score, se puede puntuar el grado de cumplimiento de una política sin enviar los datos a un servicio externo, algo relevante en sectores con requisitos de privacidad.
- Evaluación de agentes de interfaz: al recibir el estado de pantalla actual y opciones candidatas, el modelo estima qué elemento es más probable como objetivo de la siguiente acción, lo que sirve como verificador o reward model ligero dentro de un bucle de agente.
- Anotación asistida de datasets: para cada imagen o clip, generar probabilidades precalculadas de varias etiquetas tipadas acelera el etiquetado humano, que solo revisa los casos de baja confianza.
- Analítica de producto sobre vídeo: extrayendo fotogramas clave y formulando preguntas Choice sobre lo que ocurre en pantalla, se pueden agregar estadísticas de uso sin instrumentar la aplicación.
- Investigación en interacción persona-ordenador: medir la probabilidad de éxito de distintas variantes de una interfaz en tareas tipo Score permite comparar diseños antes de un test con usuarios.
- Filtrado por relevancia en capturas masivas: procesar localmente cientos de imágenes con preguntas Noul sirve para descartar las irrelevantes antes de un análisis más costoso.
- Clasificación de contenido textual corto: pese a no ser un modelo generativo, admite texto plano y preguntas tipadas, útil para triaje de tickets o comentarios con opciones predefinidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas equivalentes para este modelo ni para su base). El único dato cuantitativo publicado por el autor es el error máximo de probabilidad de la conversión respecto al modelo original, comparado entre las dos precisiones disponibles:

| Repositorio | Precision | Error maximo de probabilidad |
|---|---|---|
| 1of2/onejev-0.8b-coreml-w8 | W8A16 | 0,0427 |
| 1of2/onejev-0.8b-coreml-w16 (este) | W16A16 | 0,0210 |

También se documentan dos medidas de latencia de carga en el host de validación (M4 Max): 328 s para el primer proceso con la caché de compilación vacía y 3,3 s para un proceso posterior, con unos 12 s por función si macOS purga la caché compilada.

## Requisitos de hardware

- Sistema: Mac con Apple Silicon y macOS 15 o superior. La validación se realizó únicamente en un Apple M4 Max con macOS 27.0.1; el autor advierte de que otras combinaciones no están cualificadas.
- Acelerador: Neural Engine. Las 33 funciones y 37.809 operaciones están planificadas para no ejecutarse en CPU ni GPU, aunque seleccionar `.cpuAndNeuralEngine` no garantiza por sí solo la ejecución en Neural Engine; hay que verificar el plan de cómputo en el dispositivo propio.
- Memoria: al ser memoria unificada, no se puede dar una cifra de VRAM separada. El repositorio ocupa 1,7 GB en disco y los programas compilados unos 1,2 GB adicionales.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, el artefacto es específico de Core ML y Neural Engine.
- Opciones de despliegue: Core ML con un host que implemente el contrato de ejecución descrito en el manifiesto. No es compatible con vLLM, TGI, llama.cpp ni Ollama en este formato. El modelo base sí tiene una conversión GGUF de terceros (bartowski/OmniJev_OneJev-0.8B-GGUF, con cuantizaciones como IQ2_M) para quien necesite llama.cpp.
- Latencia y throughput: solo se documentan los tiempos de carga indicados arriba (328 s la primera compilación en caché vacía, 3,3 s en procesos posteriores, ~12 s por función si se purga la caché). No hay datos publicados de latencia por petición ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos de decisión multimodales de tamaño comparable, por lo que la comparación se limita a las variantes del mismo modelo:

| Modelo | Parametros | Contexto | Precision | Runtime | Licencia |
|---|---|---|---|---|---|
| 1of2/onejev-0.8b-coreml-w16 (este) | 0,8B | 2.048 tokens | W16A16, error máximo 0,0210 | Core ML / Neural Engine | Apache 2.0 |
| 1of2/onejev-0.8b-coreml-w8 | 0,8B | 2.048 tokens | W8A16, error máximo 0,0427 | Core ML / Neural Engine | Apache 2.0 |
| OmniJev/OneJev-0.8B (modelo base) | 0,8B | no disponible | FP16 sin cuantizar | PyTorch / Transformers | Apache 2.0 |
| bartowski/OmniJev_OneJev-0.8B-GGUF | 0,8B | no disponible | GGUF (IQ2_M y otras) | llama.cpp | Apache 2.0 |

Los datos de rendimiento comparativo entre el modelo original y esta conversión, más allá del error de probabilidad, no están disponibles.

## Limitaciones y advertencias

- Conversión no oficial: el propio autor indica que no es un lanzamiento de OmniJev. La precisión y el comportamiento pueden diferir del modelo base.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones. Solo responde preguntas tipadas con probabilidades sobre opciones predefinidas.
- Ventana estricta de 2.048 tokens: el contrato obliga a rechazar las peticiones que la superen en lugar de truncarlas, lo que descarta contextos largos o vídeos extensos sin muestreo previo.
- Error de calibración medido: hasta 0,0210 de error máximo de probabilidad frente al modelo original en esta precisión, y 0,0427 en la variante W8. Las temperaturas no están ajustadas, por lo que las probabilidades no deben tratarse como perfectamente calibradas.
- Dependencia de plataforma: requiere Apple Silicon con macOS 15 o superior y un host que implemente el contrato de ejecución completo (renderizado de prompt con `qev` en el commit registrado, tablas rotatorias, gestión de estado recurrente y escritura de claves y valores). El repositorio contiene el modelo, no un runtime.
- Riesgo de alucinación y de confianza mal calibrada en dominios alejados de los datos de entrenamiento, cuyo contenido no se documenta.
- Cobertura de idiomas no declarada: no hay información sobre qué lenguas maneja ni con qué calidad.
- Alucinación de opciones: en preguntas Choice, la probabilidad se reparte entre los slots definidos, por lo que una opción incorrecta puede recibir masa de probabilidad no despreciable.
- Advertencia de ejecución: seleccionar `.cpuAndNeuralEngine` no garantiza por sí solo el uso del Neural Engine; conviene comprobar el plan de cómputo en el dispositivo de destino.
- Estado de adopción: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creación y actualización son del 10 de octubre de 2026. Conviene fijar una revisión concreta del Hub en producción en lugar de seguir `main`.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser una conversión conviene conservar los avisos de atribución correspondientes y verificar la licencia del modelo base.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/1of2/onejev-0.8b-coreml-w16
- Variante cuantizada W8A16: https://huggingface.co/1of2/onejev-0.8b-coreml-w8
- Modelo base OneJev-0.8B: https://huggingface.co/OmniJev/OneJev-0.8B
- Repositorio del proyecto OneJev en GitHub: https://github.com/OmniJev/OneJev
- Organización OmniJev en GitHub: https://github.com/OmniJev/
- Página del proyecto OneJev: https://omnijev.github.io/OneJev/
- Conversión GGUF del modelo base (bartowski): https://huggingface.co/bartowski/OmniJev_OneJev-0.8B-GGUF
