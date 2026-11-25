# niatheelf777/xiaofeiyu-translator-e4b

## Resumen

Xiaofeiyu Translator E4B es un modelo derivado de `google/gemma-4-E4B-it` publicado por el usuario niatheelf777 bajo el paraguas del proyecto Xiaofeiyu (小肥鱼). No es un modelo de propósito general, sino un componente especializado ("sidecar") que se coloca por delante de un modelo grande de frontera (DeepSeek, Claude, GPT o Qwen) para reescribir sus respuestas en prosa como mensajes cortos de chat estilo IM en mandarín, manteniendo intactos los bloques de código, fórmulas y llamadas a herramientas. Se distribuye en formato GGUF y está pensado para GPUs de 6-8 GB de VRAM.

El modelo se construye sobre el tramo superior de capas del Gemma 4 E4B (capas no-QKV L22..41 según la model card) y se acompaña de cinco LoRA GGUF ("cartuchos de voz") que definen otros tantos estilos de personalidad conversacional. La propuesta es permitir que un usuario con hardware modesto mantenga un modelo grande como "cerebro" remoto y use este E4B local como capa de estilo, con una latencia mediana declarada de 302 ms.

La relevancia actual reside en su enfoque de "split-phase": separar la generación de contenido de la generación de estilo y preservar de forma determinista los artefactos estructurados (código, tool calls, identificadores). El repositorio es pequeño (0,2 GB) y declara 286 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 E4B (tramo superior de capas L22..41, según model card) |
| Parametros totales | 13.893.632 (dato de safetensors); la model card describe un modelo "4B" sobre base E4B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; la model card menciona Q8_0 para el modelo base y cinco LoRA GGUF |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it` y, según la model card, utiliza el tramo superior de capas no-QKV (L22..41) como columna vertebral. Sobre esa base se aplican cinco LoRA independientes, cada una asociada a un "cartucho de voz" que define un registro conversacional distinto: calidez cotidiana, dulce y apegado, hermana mayor serena, tsundere mordaz y tranquilo y reservado. El conjunto se ejecuta con llama.cpp y un proxy compatible con OpenAI que realiza un troceado AST en streaming.

El autor declara un ajuste con DPO: la precisión de preferencia en el conjunto held-out es del 96,05% (73/76) y la NLL de evaluación baja de 2,598 a 1,368. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles del preentrenamiento del modelo base. La innovación destacable es el mecanismo de "split-phase": la reescritura estilística se aplica solo a la prosa, mientras que bloques de código, flags de CLI, URLs, marcas de tiempo y `tool_calls` JSON se transmiten sin modificar.

## Capacidades

- Reescritura estilística de prosa en burbujas cortas de chat IM en mandarín, con cinco perfiles de voz seleccionables mediante LoRA.
- Preservación determinista de bloques de código, fórmulas matemáticas, URLs, identificadores y marcas de tiempo (declarado 7/7 en el conjunto de prueba del autor).
- Passthrough de `tool_calls` JSON sin alteración (declarado 0/36 alteraciones).
- Funciona como capa intermedia ("sidecar") de modelos de frontera vía proxy compatible con OpenAI, sin cambios en el código del cliente.
- Soporte de mezcla de estilos mediante cinco "sliders" (por ejemplo, cabecera `X-Xiaofeiyu-Sliders: 1.0,0.85,0,0,0`).
- Idiomas: chino e inglés.
- No se declaran capacidades de visión, audio, razonamiento matemático autónomo ni tool calling propio; su función es de transformación de texto.

## Casos de uso

- Asistente conversacional con cerebro remoto y estilo local: un cliente apunta a un proxy que envía la petición a DeepSeek o Claude y usa este E4B para reescribir la respuesta en mensajes cortos de chat, manteniendo el código intacto.
- Edición de respuestas en entornos de desarrollo: al integrarse en Cursor o en un cliente compatible con OpenAI, los bloques de código y los `tool_calls` llegan sin cambios al IDE, mientras la explicación se adapta al registro elegido.
- Despliegue en hardware de gama media: con aproximadamente 5,3 GiB de VRAM en Q8_0, cabe en una RTX 3060 8 GB o RTX 4060 8 GB y puede permanecer residente junto a otras herramientas.
- Prototipado de personajes conversacionales: los cinco cartuchos de voz permiten probar distintos registros (cálido, tsundere, sereno, etc.) sin reentrenar, útil para diseñar agentes de acompañamiento.
- Demostraciones interactivas de mezcla de personalidad: el sitio xfy.tospeak.top permite ajustar los sliders en tiempo real sin descarga local.
- Integración en pipelines de agentes: el proxy preserva las llamadas a herramientas, de modo que un agente multi-paso puede usar el E4B como capa de presentación de resultados sin romper la cadena de ejecución.
- Localización de respuestas técnicas al chino coloquial: útil para equipos que reciben documentación o asistencia en inglés y necesitan una versión en mandarín conversacional con los identificadores técnicos intactos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card:

| Metrica | Resultado | Detalle |
|---|---|---|
| Latencia mediana de traducción (5 sliders) | 302,1 ms | 129-140 tok/s en Q8_0 (~5,3 GiB de VRAM con 5 LoRA GGUF) |
| Precisión de preferencia DPO held-out | 96,05% (73/76) | Reescritura directa multi-burbuja; NLL de evaluación 2,598 -> 1,368 |
| Alteración de bloques de código y tool calls | 0/36 (0%) | Bloques cercados, flags de CLI y `tool_calls` JSON pasan sin reescritura |
| Preservación de identificadores y marcas de tiempo | 7/7 (100%) | IDs de vídeo, URLs, números y timestamps preservados en los 5 sliders |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,3 GiB en Q8_0 con las cinco LoRA cargadas, según el autor.
- GPU recomendadas: RTX 3060 8 GB, RTX 4060 8 GB y portátiles ligeros; el autor indica que también puede residir en equipos de 6-8 GB.
- Cabe en GPU de consumo: sí, en el rango de 8 GB indicado; no se documentan requisitos para GPUs de 4 GB o inferiores.
- Opciones de despliegue: llama.cpp (`llama-server`), el lanzador `server/launch_local.py` del repositorio GitHub y el proxy `@xiaofeiyu/openai-voice-proxy` (Node.js) que expone un endpoint compatible con OpenAI en `127.0.0.1:18088/v1`.
- Throughput declarado: 129-140 tok/s en Q8_0; latencia mediana de 302,1 ms por turno de reescritura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaofeiyu Translator E4B | ~13,9 M declarados (base E4B) | no disponible | Sidecar de estilo sobre Gemma 4 E4B | Gemma | GGUF en Hugging Face |
| Xiaofeiyu 12B v4 (mismo autor) | 12B | no disponible | Modelo principal de la familia, recomendado para ≥16 GB | Gemma | GGUF en Hugging Face |
| Gemma 4 E4B-it (base) | E4B | no disponible | Modelo instructivo de propósito general | Gemma | Pesos originales de Google |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría (sidecars de estilo o proxies de reescritura) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un asistente de propósito general: está diseñado exclusivamente para reescribir prosa en burbujas de chat; su uso fuera de ese rol no está validado.
- Idiomas limitados a chino e inglés; no se declara soporte de castellano ni de otras lenguas.
- Riesgo de alucinación en la reescritura estilística: aunque el autor declara preservación de código e identificadores, no se documentan garantías formales fuera del conjunto de prueba.
- Los benchmarks presentados son internos del autor, con conjuntos de evaluación pequeños (76 y 36 ejemplos); deben interpretarse con cautela.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución.
- Dependencia de infraestructura adicional (llama.cpp, proxy Node.js, modelo base GGUF) para el flujo completo; el repositorio solo contiene las LoRA y el backbone en GGUF.
- No se documentan sesgos específicos ni evaluaciones de seguridad; al ser un modelo de estilo sobre una base Gemma, hereda los sesgos de esta.
- El dato de parámetros totales de safetensors (13,9 M) no concuerda con la descripción "4B" de la model card; conviene verificar el tamaño real de los pesos GGUF antes de planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/niatheelf777/xiaofeiyu-translator-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo principal de la familia: https://huggingface.co/niatheelf777/xiaofeiyu-12b-v4
- Colección Xiaofeiyu: https://huggingface.co/collections/niatheelf777/xiaofeiyu-split-phase-spoken-persona-family-6afb60d6cecd8097f5fb3a13
- Repositorio GitHub: https://github.com/niatheelf777/xiaofeiyu
- Demo online: https://xfy.tospeak.top
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
