# 1of2/onejev-0.8b-coreml-w8

## Resumen

OneJev 0.8B Core ML W8A16 es la conversión a Core ML del modelo multimodal OmniJev/OneJev-0.8B, publicada por el usuario 1of2. No se trata de un modelo generativo al uso: es un "System One decision model" que recibe una pregunta tipada junto con texto, capturas de pantalla, fotografías o fotogramas y devuelve, en una única pasada hacia delante, una probabilidad calibrada para cada opción de respuesta. Soporta tres formatos de pregunta: Choice (cuál de varias opciones nombradas aplica), Noul (si una afirmación es verdadera) y Score (dónde cae algo en una escala).

La conversión está pensada para ejecutarse íntegramente en el Neural Engine de los Mac con Apple Silicon: se compone de 33 funciones y 37.809 operaciones, ninguna planificada para CPU o GPU. Los pesos de las proyecciones del descodificador están cuantizados a INT8 por canal con activaciones FP16 (W8A16), mientras que la torre de visión, el estado recurrente y todas las activaciones se mantienen en FP16; el embedding de tokens (tabla FP16) y la cabeza de respuesta (FP32) se ejecutan en el host. El repositorio ocupa 1,2 GB y la licencia es Apache 2.0.

El interés de esta ficha radica en que documenta un caso poco habitual: un modelo de decisión multimodal de 0,8B parámetros, con ventana de 2.048 tokens, empaquetado para inferencia local y privada en hardware de Apple, sin dependencia de CUDA ni de servicios en la nube. No es una release oficial de OmniJev y su catálogo de hermanos mayores (4B, 9B y 27B) amplía las opciones dentro de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Descodificador híbrido: atención completa cada cuarta capa y Gated DeltaNet en el resto; torre de visión con patch merger en el último shard |
| Parametros totales | 0,8B (según el nombre del modelo y el modelo base OmniJev/OneJev-0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (prefijo, medios y pregunta en conjunto) |
| Tipos de cuantizacion | W8A16: pesos del descodificador INT8 por canal, activaciones FP16; torre de visión FP16; estado recurrente FP16; cabeza de respuesta FP32. Existe variante W16A16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquetes .mlpackage dentro de `model/`, artefacto sellado con `manifest.json` y SHA-256 por fichero) |
| Tamano del repositorio | 1,2 GB de descarga; ~712 MB de programas compilados en disco |
| Dimension oculta | 1.024 |
| Vocabulario | 248.320 tokens (tabla `host/embedding.f16`, [248320, 1024]) |
| Funciones Core ML | 33 (6 shards de descodificador, 3 shards de visión, más firmas por lotes y parches) |
| Modelo base | OmniJev/OneJev-0.8B, revisión c3939d8bf4cad34549a2b13bbb6aee9bcb6afee8 |
| Relacion con el modelo base | quantized (cuantización del modelo original) |

## Arquitectura y entrenamiento

La arquitectura del descodificador es híbrida: cada cuarta capa utiliza atención completa, mientras que las tres intermedias emplean Gated DeltaNet, un mecanismo de estado recurrente con convolución y memoria SSM. En la práctica, las capas de atención completa reciben y devuelven `key` y `value` de forma [B,2,2048,256] (solo las claves y valores nuevos del chunk, que el host escribe en las posiciones correspondientes de cada fila), y las capas Gated DeltaNet arrastran un estado `conv` [B,3,6144] en formato channels-last y un estado `ssm` [B,16,128,128] escalado a 64 veces la escala original. El descodificador se reparte en seis shards de cuatro capas cada uno, con cuatro firmas de ejecución: 1 o 4 filas por llamada y 32 o 128 tokens por chunk (`b1_t32`, `b1_t128`, `b4_t32`, `b4_t128`). La torre de visión se reparte en tres shards de cuatro bloques, con el patch merger en el último, y admite 256, 1.024 o 4.096 parches por imagen (`p256`, `p1024`, `p4096`).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni el uso de RLHF o DPO; la model card del autor de la conversión no los detalla. La innovación destacable de esta publicación es el propio proceso de conversión y el contrato de ejecución: la renderización del prompt debe hacerse con el procesador upstream incluido en `model/processor/` y el renderizador de `qev` en el commit registrado por el manifiesto (prompt version `qev-labels-v2`, con el modo "thinking" desactivado); las posiciones rotatorias se construyen desde las posiciones multimodales upstream en FP32 y se estrechan a FP16; y en la respuesta se aplica una RMS norm final (eps 1e-6, escala 1 + `host/norm.f32`), se redondea a FP16 y se proyecta con la cabeza `host/head.f32` [256, 1024] sobre los slots de respuesta, seguida de un softmax. Las temperaturas no están ajustadas.

## Capacidades

- Decisión multimodal tipada en una sola pasada: responde preguntas Choice (elegir entre opciones nombradas), Noul (verdadero/falso) y Score (posición en una escala).
- Salida probabilística calibrada por opción, no texto libre generado token a token.
- Entrada de texto, capturas de pantalla, fotografías y fotogramas de vídeo (agrupados temporalmente).
- Procesamiento por lotes: la firma `b4` permite evaluar hasta 4 filas por llamada, útil para formular varias preguntas sobre un mismo prefijo.
- Estado compartido: el prefijo (estado y medios) es común y cada pregunta es un sufijo, lo que permite reutilizar la misma imagen o contexto para varias consultas.
- Ejecución íntegra en el Neural Engine de Apple Silicon, sin planificación en CPU ni GPU.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo se describe explícitamente como "System One", es decir, decisión en un único paso.
- Capacidades especiales: modo "thinking" desactivado en el renderizado del prompt; sin soporte documentado de audio.

## Casos de uso

- Verificación booleana de capturas en tests end-to-end: en una suite de CI que captura pantallas con Playwright o Selenium, el modelo responde preguntas Noul del tipo "¿aparece el botón de inicio de sesión?" y devuelve una probabilidad que puede compararse con un umbral, sustituyendo aserciones basadas en selectores frágiles.
- Clasificación de elementos de interfaz: con preguntas Choice sobre una captura, se determina en qué estado se encuentra un formulario o qué pestaña está activa, útil en herramientas de automatización de escritorio en macOS.
- Puntuación de calidad visual: mediante preguntas Score sobre fotografías o fotogramas, se asigna una nota a nitidez, encuadre o legibilidad, encadenable a un pipeline de selección de imágenes en fotografía o documentación.
- Filtrado previo (routing) en pipelines multimodales: al devolver probabilidades en una sola pasada y con coste bajo, sirve como primera etapa que decide si merece la pena invocar un modelo generativo mayor para una imagen concreta.
- Procesamiento local de material sensible: al ejecutarse en el Neural Engine sin salida a red, permite clasificar capturas de documentos médicos, financieros o internos sin enviarlos a un servicio externo.
- Análisis de vídeo por fotogramas: con la entrada `p*` a nivel de imagen o de grupo temporal de un clip, se etiqueta cada fotograma o grupo con las mismas preguntas tipadas para tareas de vigilancia o resumen.
- Enrutado de tickets de soporte con captura adjunta: la probabilidad de una pregunta Choice decide a qué cola se envía un ticket a partir de la captura que adjunta el usuario.
- Control de accesibilidad de una app: batería de preguntas Noul sobre capturas para detectar de forma automatizada si faltan etiquetas visibles o contraste suficiente en una pantalla concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni métricas equivalentes). El único dato cuantitativo de calidad publicado por el autor es el error máximo de probabilidad respecto a la variante de mayor precisión:

| Repositorio | Precision | Error maximo de probabilidad |
|---|---|---:|
| 1of2/onejev-0.8b-coreml-w8 (este) | W8A16 | 0,0427 |
| 1of2/onejev-0.8b-coreml-w16 | W16A16 | 0,0210 |

Datos de despliegue reportados por el autor: la primera ejecución sobre una caché de compilación vacía respondió a su primera petición tras 325 s; un proceso posterior, tras 3,2 s; si macOS purga funciones compiladas por falta de espacio, cada recompilación cuesta aproximadamente 12 s.

## Requisitos de hardware

- Plataforma obligatoria: Mac con Apple Silicon y macOS 15 o superior. La validación se realizó en un Apple M4 Max con macOS 27.0.1; el autor indica que otras combinaciones no están cualificadas.
- Memoria: el repositorio ocupa 1,2 GB y los programas compilados aproximadamente 712 MB en disco. Fuentes externas (LLM Explorer) cifran el requisito de VRAM en torno a 2,2 GB para el modelo base.
- GPU: no aplica. El diseño evita explícitamente CPU y GPU; el cómputo se planifica en el Neural Engine (`cpuAndNeuralEngine`, aunque el autor advierte que seleccionar ese compute unit no garantiza por sí mismo la ejecución en Neural Engine).
- Compatibilidad con GPU de consumo tipo RTX 4090: no disponible; este artefacto es exclusivo de Core ML y Apple Silicon y no se distribuye en formatos CUDA.
- Opciones de despliegue: Core ML exclusivamente. Este repositorio contiene el modelo, no un runtime; es necesario un host que implemente el contrato de ejecución (renderizado de prompt con el procesador upstream y `qev`, gestión de estado por shard, tablas rotatorias y cabeza de respuesta). No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de throughput por token (el modelo no genera texto). Como referencia de latencia de arranque: 325 s en la primera ejecución con caché vacía, 3,2 s en procesos posteriores y ~12 s por función recompilada tras una purga de caché.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Error maximo de probabilidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| 1of2/onejev-0.8b-coreml-w8 | 0,8B | 2.048 tokens | W8A16 | 0,0427 | Apache 2.0 | Core ML |
| 1of2/onejev-0.8b-coreml-w16 | 0,8B | 2.048 tokens | W16A16 | 0,0210 | Apache 2.0 | Core ML |
| OmniJev/OneJev-0.8B (base) | 0,8B | 2.048 tokens | no disponible | no aplica | no disponible | no disponible |
| Familia OneJev (4B, 9B, 27B) | 4B / 9B / 27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) frente a alternativas de otros autores para este tipo de modelo de decisión multimodal, por lo que la comparación se limita a la propia familia OneJev y a sus dos variantes de precisión publicadas por 1of2.

## Limitaciones y advertencias

- No es una release oficial de OmniJev: se trata de una conversión de terceros (1of2) del modelo OmniJev/OneJev-0.8B.
- Ámbito de hardware muy restringido: solo Mac con Apple Silicon y macOS 15 o superior, validado únicamente en un M4 Max con macOS 27.0.1. Otras combinaciones no están cualificadas.
- No incluye runtime: el repositorio contiene el modelo, no el ejecutable; sin un host que respete el contrato de ejecución (renderizado de prompt en `qev-labels-v2`, thinking off, gestión de estado y tablas rotatorias) no es utilizable.
- Límite duro de contexto de 2.048 tokens contando prefijo, medios y pregunta; el autor indica explícitamente que se rechacen las peticiones más largas en lugar de truncarlas.
- Idiomas soportados: no disponible, lo que impide garantizar el comportamiento multilingüe en producción.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: el modelo no genera texto libre, sino probabilidades sobre slots de respuesta; el riesgo se traslada a la calibración. La cuantización W8A16 introduce un error máximo de probabilidad de 0,0427 frente a W16A16, relevante si se usan umbrales de decisión ajustados.
- Las temperaturas no están ajustadas, por lo que la calibración efectiva depende del host y de los umbrales que este aplique.
- Latencia de arranque elevada en la primera carga (325 s) y posible recompilación (~12 s por función) si macOS purga la caché por falta de disco.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero conviene verificar por separado la licencia y las condiciones del modelo base OmniJev/OneJev-0.8B antes de un despliegue en producción.
- Advertencia del autor: seleccionar `.cpuAndNeuralEngine` no garantiza por sí mismo que la ejecución se realice en el Neural Engine.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/1of2/onejev-0.8b-coreml-w8
- Variante W16A16: https://huggingface.co/1of2/onejev-0.8b-coreml-w16
- Modelo base: https://huggingface.co/OmniJev/OneJev-0.8B
- Repositorio GitHub de OneJev: https://github.com/OmniJev/OneJev
- Organización OmniJev en GitHub: https://github.com/OmniJev/
- Página oficial de OneJev: https://omnijev.github.io/OneJev/
- Perfil del autor de la conversión: https://huggingface.co/1of2
- Ficha en LLM Explorer (VRAM estimada): https://llm-explorer.com/model/OmniJev%2FOneJev-0.8B,48oin5a1bL2pn6gutVu6Ad
