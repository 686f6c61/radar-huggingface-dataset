# masakiaota/pplx-decider-flash-v1.3-mlx

## Resumen

pplx-decider-flash-v1.3-mlx es una conversión a MLX del modelo Perplexity Decider Flash v1.3, desarrollada por el usuario independiente masakiaota para su ejecución local en Macs con Apple Silicon (M5 o posterior). No se trata de un modelo generativo de propósito general, sino de un clasificador multimodal especializado en responder preguntas estructuradas sobre un estado o contexto dado (decisiones binarias, de elección múltiple, puntuaciones y extracción de pasajes), emulando el comportamiento de la Decisions API de Perplexity.

El modelo base, perplexity-ai/pplx-decider-flash-v1.3, es propiedad de Perplexity AI; esta conversión es una derivada no oficial, sin afiliación ni soporte por parte de la compañía. La conversión aplica cuantización de 8 bits a las capas lineales del modelo de lenguaje (esquema propietario "shared affine8" con producto matricial INT8 x INT8), mientras que el tower de visión, las normalizaciones, los embeddings y la cabeza de lectura se mantienen en BF16 respecto al original. Cuenta con 1.976.807.936 parámetros y un repositorio de 9,6 GB.

Su relevancia radica en que permite ejecutar localmente, en hardware de consumo Apple, un clasificador que de otro modo requeriría la API en la nube de Perplexity, con una latencia declarada de 44,8 ms por petición (frente a 88,7 ms de la app oficial para Mac) y una concordancia con el modelo BF16 original del 99,4 % en preguntas binarias. Los pesos usan un diseño de 8 bits no estándar y solo funcionan con el servidor decider-mlx del mismo autor, no con un cargador MLX genérico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con tower de visión, cabeza de decisión y módulo Locate (LoRA rank-64 fusionado); familia qwen3_5 según tags |
| Parametros totales | 1.976.807.936 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 32,4K tokens verificados en pruebas (12,9K y 32,4K documentados); límite máximo no declarado |
| Tipos de cuantizacion | 8 bits en capas lineales del LM (affine group-64, códigos sin signo con una escala por fila de salida) e INT8 x INT8; BF16 en embeddings, normalización, convolución, tower de visión y cabeza de lectura; Locate en affine 8-bit (group 64) tras fusión en FP32 y redondeo a BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `manifest.json` para verificación sha256; requiere `row-sums.safetensors` para el epílogo del matmul INT8 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Perplexity AI orientado a clasificación y decisión estructurada, no a generación libre de texto. La conversión a MLX mantiene intactos el tokenizador, el procesador, `config.json`, `decision_config.json`, `joint_config.json`, la plantilla de chat, el tower de visión y la cabeza de lectura en BF16, y cuantiza únicamente las capas lineales del modelo de lenguaje. El esquema "shared affine8" reutiliza los mismos bytes de peso de dos maneras: como códigos sin signo con una escala por fila (descritos a MLX como affine 8-bit group-64) y como entrada para el producto matricial INT8 x INT8 propio de decider-mlx, que emplea `row-sums.safetensors` con las sumas de códigos por fila en el epílogo.

El módulo Locate, que permite la extracción de pasajes, se obtiene fusionando el LoRA rank-64 original en las capas lineales en FP32, redondeando a BF16 y cuantizando después a affine 8-bit (group 64); la cabeza de spans y el embedding de marcadores quedan sin cambios y solo se cargan en la primera petición de tipo Locate. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en el modelo original. La innovación técnica destacable de esta conversión es el esquema de cuantización compartida y el soporte de peticiones en array (batching), que permite procesar 20 peticiones en 0,31 s, unas 3,9 veces más rápido que enviarlas de una en una.

## Capacidades

- Clasificación y decisión estructurada: responde preguntas de tipo binario (`noul`), de elección (`choice`) y de puntuación (`score` con argmax) sobre un estado o contexto proporcionado.
- Extracción de pasajes (Locate): localiza fragmentos relevantes dentro de entradas largas, con soporte de hasta 32,4K tokens verificados.
- Entrada multimodal: el tag `multimodal` y la presencia de un tower de visión indican soporte de imágenes, documentado en la guía de uso de decider-mlx.
- Modo `isolated`: extensión local que no existe en la API oficial de Perplexity.
- Peticiones en array (batching): procesamiento conjunto de múltiples decisiones en una sola llamada, con empaquetado masivo (1.072 peticiones mixtas en 47 s).
- Control de temperatura en las respuestas.
- Compatibilidad con la Decisions API oficial a través de un servidor HTTP local (`POST /v1/decisions`) y de una API Python (`decider_mlx.load`).
- No se documentan capacidades de generación de texto libre, código, matemáticas, tool calling ni razonamiento multi-paso; el pipeline declarado es `text-classification`.

## Casos de uso

- Enrutamiento y triaje de tickets de soporte: el modelo recibe el estado de la incidencia y preguntas binarias como "¿está el cliente bloqueado ahora mismo?", devolviendo una decisión en 44,8 ms, adecuado para clasificar en tiempo real dentro de un flujo de atención al cliente.
- Moderación y control de calidad: preguntas de tipo `score` con argmax permiten asignar una puntuación a contenidos o respuestas y decidir umbrales de aceptación sin depender de un LLM generativo.
- Extracción de evidencia en documentos largos: el módulo Locate localiza pasajes relevantes en entradas de hasta 32,4K tokens (0,42 s a 5,4K, 7,03 s a 32,4K), útil para sistemas de búsqueda aumentada que necesitan citar fragmentos concretos.
- Automatización de decisiones sobre imágenes: gracias al tower de visión, puede responder preguntas estructuradas sobre capturas, formularios o documentos escaneados enviados como entrada.
- Procesamiento por lotes de clasificación: el empaquetado en arrays permite clasificar miles de elementos (1.072 peticiones mixtas en 47 s) en pipelines de análisis offline o de backoffice.
- Prototipado local sin nube: al ejecutarse en un Mac con M5 y 24 GB de memoria, permite desarrollar y probar integraciones compatibles con la Decisions API sin coste de API ni envío de datos a terceros.
- Sustitución local de la app oficial de Perplexity para Mac: misma interfaz HTTP, el doble de velocidad declarada (44,8 ms frente a 88,7 ms) y arranque de 0,5 s frente a 2,2 s.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos aportados son de concordancia con el modelo BF16 original y de latencia en Mac Studio con M5 Ultra:

| Metrica | Resultado |
|---|---|
| Concordancia binaria (`noul`) vs BF16 | 821/826 |
| Concordancia `choice` vs BF16 | 222/224 |
| Concordancia `score` (argmax) vs BF16 | 73/74 |
| Concordancia en conjuntos de spans Locate | 305/314 |
| Concordancia en entradas largas 12K-32K | 9/9 |
| Concordancia BoolQ gate (4 condiciones) | 100/100 en cada una |

| Caso de latencia (Mac Studio M5 Ultra) | Tiempo |
|---|---|
| Petición única de 427 tokens | 43-44,8 ms |
| 20 peticiones en un array | 0,31 s |
| 20 peticiones secuenciales | 0,58 s |
| Entrada larga 5,4K / 12,9K / 32,4K tokens | 0,42 / 2,17 / 7,03 s |
| 520 peticiones mixtas secuenciales por HTTP | 26,5 s (mediana 32 ms) |
| Arranque hasta aceptar peticiones HTTP | 0,44-0,47 s |
| Arranque hasta la primera respuesta | 0,51-0,54 s |

## Requisitos de hardware

- Mac con chip M5 o posterior; macOS 27 o superior; Python 3.14 y `uv`.
- 24 GB de memoria o más recomendados. Peso de los pesos mapeados en memoria: 5,74 GB, más 3,80 GB tras la primera petición Locate.
- Pico de memoria MLX: 14,2 GB en una petición Locate de 32,4K tokens con Locate cargado; 11,2 GB a 32,4K sin Locate; RSS de aproximadamente 7,2 GB.
- No es compatible con GPU NVIDIA ni con cargadores MLX genéricos: los pesos requieren el servidor decider-mlx.
- Despliegue mediante `decider-mlx serve` (servidor HTTP compatible con Decisions API) o `decider-mlx run`; también mediante la API Python `load()`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput declarado: 520 peticiones mixtas en 26,5 s de forma secuencial y 1.072 en 47 s con empaquetado en arrays.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-flash-v1.3-mlx (esta ficha) | 1.976.807.936 | hasta 32,4K verificados | 44,8 ms por petición; 99,4 % de concordancia con BF16 en binario | Apache 2.0 | Hugging Face; requiere decider-mlx y Apple M5 |
| App oficial Perplexity Decider Flash para Mac (v1.2, GGUF q8_0) | no disponible | no disponible | 88,7 ms por petición; arranque 2,2 s | no disponible | App oficial de Perplexity |
| perplexity-ai/pplx-decider-flash-v1.3 (modelo base BF16) | no disponible | no disponible | referencia BF16 de la comparación | no disponible | Hugging Face (Perplexity AI) |

No se dispone de datos de otros clasificadores comparables en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada, respaldada ni soportada por Perplexity AI; los problemas deben reportarse en el repositorio decider-mlx.
- Los pesos usan un diseño de 8 bits propietario y un producto matricial INT8 x INT8; un cargador MLX genérico no reproduce el modelo.
- Requiere hardware muy específico: Apple M5 o posterior, macOS 27 o superior y 24 GB de memoria recomendados; no funciona en GPUs NVIDIA ni en Macs anteriores.
- La cuantización introduce ruido: las probabilidades difieren ligeramente del BF16, aunque las respuestas coinciden en la gran mayoría de los casos evaluados.
- El modelo es un clasificador de decisión, no un generador: no se documentan capacidades de texto libre, código, matemáticas ni tool calling.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación del modelo base.
- La licencia Apache 2.0 se aplica a esta conversión, pero el modelo base pertenece a Perplexity AI; conviene verificar las condiciones del original para uso comercial.
- El módulo Locate consume memoria adicional (3,80 GB) y solo se carga en la primera petición de ese tipo, lo que puede provocar un pico de latencia inicial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masakiaota/pplx-decider-flash-v1.3-mlx
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.3
- Repositorio decider-mlx: https://github.com/masakiaota/pplx-decider-mlx
- Guía de uso: https://github.com/masakiaota/pplx-decider-mlx/blob/main/docs/usage.md
- Experimentos de conversión: https://github.com/masakiaota/pplx-decider-mlx/tree/main/experiments
- Documentación de la Decisions API: https://docs.perplexity.ai/api-reference/decisions-post
