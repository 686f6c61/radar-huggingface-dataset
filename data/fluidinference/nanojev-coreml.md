# FluidInference/nanojev-coreml

## Resumen

FluidInference/nanojev-coreml es un repositorio publicado por Fluid Inference que contiene una receta de conversión a Core ML del checkpoint NanoJev (C-Tianyu/NanoJev, revisión fijada `047b927b30882a1138fc504821b82ac145a4b81a`). Es importante subrayar que **no es un modelo**: no incluye pesos convertidos ni pesos entrenados, solo scripts de exportación y ficheros de validación. Su propósito es reproducir en Core ML la arquitectura del modelo de decisión NanoJev, preservando su codificador de candidatos Qwen3, su cabeza escalar entrenada y su mecanismo de atención específica de Choice sobre el conjunto completo de candidatos, además de las rutas de salida Boolean y Score.

El checkpoint de referencia contiene 596.250.498 parámetros entrenados, cabezas incluidas, con hash SHA256 `f68c47d66998231b86b7e91b4ed5e82ae23acf104c8b7cd6d165c3ac7b7ffe1b`. El exportador separa el modelo en dos paquetes Core ML independientes (candidate-encoder y decision-head) para que un único backbone pueda atender los tres tipos de pregunta del modelo original.

La relevancia de este repositorio es de tipo herramienta: interesa a quien quiera ejecutar NanoJev en hardware Apple con aceleración por Neural Engine, pero su utilidad práctica está condicionada a dos factores que el propio autor declara pendientes: la validación de paridad y la clarificación de la licencia de redistribución de los pesos. El autor advierte además que el checkpoint actual es más reciente que el que probablemente se usó para la entrada de tracker con puntuación 26,19, por lo que no debe atribuirse ese resultado a un paquete Core ML generado con esta receta sin una comprobación de identidad de revisión y una ejecución oficial de la suite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión sobre codificador de candidatos derivado de Qwen3, con cabeza escalar entrenada y atención específica de Choice sobre el conjunto completo de candidatos; rutas de salida Boolean y Score |
| Parametros totales | 596.250.498 (checkpoint de referencia indicado en la receta; este repositorio no contiene pesos) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la receta no especifica esquemas de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | no disponible para los pesos. El código fuente upstream se etiqueta como MIT, pero no se declara licencia de redistribución para los pesos entrenados. Los scripts de conversión de este repositorio son código original de Fluid Inference |
| Formato de pesos | no disponible (el repositorio no contiene pesos; la salida prevista son paquetes Core ML separados: candidate-encoder y decision-head) |
| Autor | FluidInference |
| Modelo base | C-Tianyu/NanoJev (revisión `047b927b30882a1138fc504821b82ac145a4b81a`) |
| Hash SHA256 del checkpoint | `f68c47d66998231b86b7e91b4ed5e82ae23acf104c8b7cd6d165c3ac7b7ffe1b` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-22 |
| Region | us |

## Arquitectura y entrenamiento

La receta describe un modelo cuyo componente principal es un codificador de candidatos basado en Qwen3, sobre el que se añaden dos piezas específicas: una cabeza escalar entrenada y un mecanismo de atención específica de Choice que opera sobre el conjunto completo de candidatos. El modelo expone dos rutas de salida diferenciadas, Boolean y Score. La conversión respeta esta estructura dividiendo el grafo en un paquete Core ML para el candidate-encoder y otro para el decision-head, de modo que un mismo backbone puede servir los tres tipos de pregunta que maneja el modelo.

No se proporcionan en la información disponible datos sobre el entrenamiento: ni volumen de tokens, ni composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones de inferencia (decodificación especulativa, atención lineal u otras). Lo que sí documenta el repositorio es el proceso de exportación: `source/assets.lock.json` fija el checkpoint seleccionado y su SHA256, y `source/STATUS.md` informa del progreso de conversión y paridad. El autor indica explícitamente que los pesos Core ML convertidos solo se publicarán si se clarifica el permiso de redistribución y si la validación de paridad se supera.

## Capacidades

- Decisión sobre conjuntos de candidatos: el modelo puntúa o selecciona entre un conjunto completo de alternativas mediante atención específica de Choice.
- Salida booleana: ruta de decisión binaria (sí/no, verdadero/falso) integrada en el modelo.
- Salida de puntuación: ruta que devuelve una puntuación escalar por candidato.
- Cobertura de tres tipos de pregunta con un único backbone, gracias al diseño de exportación en dos paquetes Core ML.
- Ejecución en hardware Apple mediante Core ML (la capacidad concreta depende de completar la conversión y la validación de paridad).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

Todos los casos siguientes presuponen que la conversión a Core ML se completa y que la validación de paridad descrita en `source/STATUS.md` se supera; no son aplicables al repositorio tal como se publica hoy, que no contiene pesos.

- Evaluación automática de respuestas tipo test: el modelo está diseñado para decidir sobre un conjunto de candidatos, por lo que encaja en tareas de selección de la opción correcta y de puntuación de alternativas.
- Reranking de candidatos en pipelines de recuperación: la ruta de Score permite ordenar un conjunto de respuestas generadas por otro modelo y quedarse con la mejor.
- Filtrado binario en dispositivo: la ruta Boolean permite clasificaciones de sí/no (por ejemplo, aceptar o rechazar una propuesta) sin enviar datos a un servidor.
- Decisión en juegos y entornos interactivos: el checkpoint upstream se identifica como "unified-games", lo que apunta a decisiones de juego; la conversión a Core ML permitiría ejecutarlo localmente en un dispositivo Apple.
- Aplicaciones con requisitos de privacidad: al ejecutarse vía Core ML en Neural Engine, los datos de entrada no salen del dispositivo, lo que resulta adecuado para decisiones sobre información sensible.
- Validación de paridad en CI: los scripts del repositorio y los ficheros `STATUS.md` y `assets.lock.json` permiten montar una comprobación reproducible de que el paquete Core ML reproduce fielmente el checkpoint original.
- Prototipado en Xcode y Swift: el formato Core ML facilita integrar el decision-head en una app iOS o macOS sin depender de infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni métricas equivalentes, y el propio autor advierte que no debe atribuirse al paquete Core ML la puntuación 26,19 registrada en un tracker, porque la revisión exacta usada para esa entrada no ha sido verificada y la suite oficial no se ha ejecutado. Tampoco se ofrecen datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no declarada por el autor. Como estimación aritmética a partir de los 596.250.498 parámetros, los pesos ocuparían aproximadamente 1,19 GB en FP16, 0,60 GB en INT8 y 0,30 GB en INT4, cifras a las que habría que sumar activaciones y overhead del runtime.
- GPU recomendadas: no aplica en el sentido habitual; Core ML está orientado a hardware Apple (Neural Engine y GPU integrada de la familia M). No se documenta soporte CUDA.
- Encaje en GPU de consumo: por tamaño, un modelo de ~596 M de parámetros es apto para equipos de consumo; en el ecosistema Apple encajaría en Mac con chip de la serie M y en iPhone/iPad compatibles, aunque el autor no confirma ningún dispositivo concreto.
- Opciones de despliegue: Core ML a través de coremltools para la conversión y de Xcode/Swift para la integración. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables al formato Core ML.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La información disponible solo permite comparar el repositorio con su propio modelo base. No se dispone de datos de otros modelos comparables de la misma categoría (modelos de decisión sobre conjuntos de candidatos en formato Core ML).

| Aspecto | FluidInference/nanojev-coreml | C-Tianyu/NanoJev |
|---|---|---|
| Naturaleza | Receta de conversión (scripts y validación) | Modelo entrenado |
| Pesos incluidos | No | Sí (upstream) |
| Parametros | 596.250.498 (del checkpoint referenciado) | 596.250.498 |
| Formato | Salida prevista en paquetes Core ML | no disponible |
| Licencia | No disponible para los pesos; código de conversión original de Fluid Inference | Código fuente etiquetado MIT; licencia de pesos no declarada |
| Contexto | no disponible | no disponible |
| Rendimiento | Sin benchmarks publicados; score 26,19 de tracker no verificado | Sin datos en la información disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: ni convertidos ni entrenados. No puede usarse para inferencia tal como se publica.
- La licencia de redistribución de los pesos es desconocida. El código upstream se etiqueta como MIT, pero eso no cubre los pesos entrenados, y el autor condiciona la publicación de los pesos Core ML a que se clarifique ese permiso. Cualquier uso comercial debe resolverse primero con el titular de los derechos.
- La validación de paridad está pendiente según `source/STATUS.md`; no hay garantía de que una conversión local reproduzca el comportamiento del checkpoint original.
- El checkpoint actual es más reciente que el asociado a la entrada de tracker con puntuación 26,19, y esa revisión no ha sido verificada. No debe citarse ese resultado como rendimiento de esta receta.
- No hay información sobre sesgos, comportamiento multilingüe ni riesgo de alucinación del modelo subyacente.
- No se documentan la longitud de contexto, los esquemas de cuantización ni los idiomas soportados.
- La salida está atada al ecosistema Apple: Core ML no se ejecuta en CUDA ni en la mayoría de aceleradores no Apple, lo que limita el despliegue en servidores convencionales.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día, por lo que no cuenta con validación externa de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FluidInference/nanojev-coreml
- Modelo base upstream: https://huggingface.co/C-Tianyu/NanoJev
- Checkpoint de referencia (revisión fijada): https://huggingface.co/C-Tianyu/NanoJev/tree/047b927b30882a1138fc504821b82ac145a4b81a
- Instrucciones de conversión: `source/README.md` del repositorio
- Estado de validación y paridad: `source/STATUS.md` del repositorio
- Fijado de assets y hash del checkpoint: `source/assets.lock.json` del repositorio

No se han encontrado en la búsqueda web enlaces relevantes al modelo, a su receta de conversión, a papers asociados ni a demos públicas.
