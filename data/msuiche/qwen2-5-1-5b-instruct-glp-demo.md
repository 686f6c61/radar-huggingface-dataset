# msuiche/Qwen2.5-1.5B-Instruct-GLP-demo

## Resumen

`msuiche/Qwen2.5-1.5B-Instruct-GLP-demo` es una exportación instrumentada del modelo `Qwen/Qwen2.5-1.5B-Instruct` de Alibaba Qwen, publicada por el desarrollador msuiche como demostración del mecanismo GLP (Guided Latent Projection) implementado en su proyecto `weightless`. No se trata de un modelo nuevo entrenado desde cero, sino de los pesos originales de Qwen2.5-1.5B-Instruct cuantizados a ONNX q4f16 para WebGPU, con nodos de proyección GLP insertados directamente en el grafo de cómputo. La innovación principal es que permite modificar el comportamiento del modelo (concretamente, su tendencia a rechazar peticiones dañinas) en tiempo de ejecución mediante un escalar `glp_alpha`, sin tocar los pesos ni cargar adaptadores.

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only de 1.500 millones de parámetros con 27 capas y dimensión de embedding de 1536, diseñado para instrucciones y conversación. Esta versión mantiene intactos esos pesos: lo que se añade son direcciones unitarias por capa (vectores de control derivados con la herramienta `captain-vector` mediante diferencia de medias entre AdvBench y Alpaca) que se aplican como una proyección sobre el residuo post-capa. Con `glp_alpha = 0` el modelo se comporta como el original; con `glp_alpha = 1` la proyección elimina parcialmente la dirección de rechazo y el modelo responde a prompts que originalmente declinaba.

La relevancia de esta ficha es doble: por un lado documenta una técnica de steering ligera y desplegable en navegador (WebGPU, transformers.js, sin servidor); por otro, es un ejemplo explícito de cómo el control de vectores puede usarse para eludir salvaguardas de seguridad de un modelo alineado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 3,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), con nodos GLP insertados en el grafo ONNX |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); el campo safetensors del repo indica 41.472, dato no representativo del modelo completo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero este dato no se confirma en la model card) |
| Tipos de cuantizacion | ONNX q4f16 (4 bits con activaciones float16) para WebGPU; el vector GLP se distribuye en GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (q4f16) para transformers.js/WebGPU; vector GLP en GGUF (`qwen2.5-1.5b-instruct-refusal-cvec.gguf`, 170 KB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-1.5B-Instruct original: un transformer decoder-only con 27 capas y `n_embd = 1536`, entrenado por Alibaba Qwen con datos no especificados en esta model card (el autor no documenta el corpus, el número de tokens ni las fases de RLHF/DPO del modelo base; esa información corresponde a la model card oficial de Qwen). Sobre ese grafo se insertan operaciones GLP: para cada capa instrumentada, tras el bloque residual se aplica `h <- h - glp_alpha * (h · d) d`, donde `d` es una dirección unitaria por capa almacenada como inicializador constante (datos, no pesos entrenados) y `glp_alpha` es una entrada escalar del grafo en tiempo de ejecución.

Las direcciones `d` se derivaron con la herramienta `captain-vector` mediante diferencia de medias entre un conjunto de prompts dañinos (AdvBench) y uno de prompts benignos (Alpaca), con validación en held-out y con controles de dirección aleatoria. La exportación a ONNX parte de `onnx-community/Qwen2.5-1.5B-Instruct` (variante q4f16). No hay entrenamiento adicional, fine-tuning ni modificación de pesos: todo el efecto de steering es una operación algebraica en el grafo.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (aplicación de plantilla de chat de Qwen).
- Steering en tiempo de ejecución mediante el escalar `glp_alpha`: 0 equivale al modelo original, 1 activa la proyección GLP.
- Inferencia en navegador vía transformers.js con backend WebGPU.
- Ejecución sin servidor, sin adaptadores y sin modificar los pesos.
- Soporte de tool calling y function calling: no documentado en esta model card (el modelo base lo soporta, pero no se confirma aquí).
- Capacidades multimodales, de audio o visión: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Demostración interactiva de steering en navegador: cargar el modelo con transformers.js y WebGPU, alternar `glp_alpha` entre 0 y 1 y comparar respuestas sobre el mismo prompt, sin infraestructura de servidor. Adecuado por su tamaño (1,5B en q4f16) y su exportación específica para WebGPU.
- Investigación sobre vectores de control y alineación: usar el vector GLP incluido como referencia para estudiar cómo una dirección por capa afecta a la tasa de rechazo, replicando el protocolo de validación (0/8 a 5/8 en entrega dañina, 8/8 en benignos).
- Docencia y divulgación sobre interpretabilidad: ilustrar en vivo la diferencia entre modificar pesos (fine-tuning, adaptadores) y modificar activaciones (steering), con un ejemplo reproducible en el navegador.
- Pruebas de robustez de salvaguardas: evaluar hasta qué punto un modelo alineado de 1,5B mantiene sus rechazos frente a una proyección de una sola dirección, como caso de estudio de red-teaming.
- Prototipado de asistentes conversacionales ligeros en el cliente: el modelo base sirve para chat de bajo coste en aplicaciones web, aunque el interés del repo es el mecanismo GLP, no el despliegue productivo.
- Validación de pipelines ONNX: comprobar la integración de entradas escalares adicionales en `generate()` de transformers.js (`model.forward_params.push('glp_alpha')`), útil para ingeniería de grafos y pruebas de compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card solo reporta métricas de validación del vector GLP: entrega dañina 0/8 en baseline frente a 5/8 con steering, y 8/8 en prompts benignos en ambas condiciones; el control con direcciones aleatorias no supera este resultado. También se confirma el cambio de comportamiento en onnxruntime (CPU) y transformers.js (Node), y que las herramientas `validate` y `audit` sobre el vector GLP devuelven 0 FAIL y 0 WARN. No hay datos de MMLU, HumanEval, GSM8K ni latencia/throughput.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 3,7 GB; la variante q4f16 de un modelo de 1,5B cabe holgadamente en GPUs de consumo con 4-6 GB de VRAM efectiva para inferencia en navegador.
- GPU recomendadas: cualquier GPU con soporte WebGPU (Chrome/Edge) para el demo; en servidor, GPUs con suficiente memoria para ONNX Runtime o transformers.js.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (por ejemplo, RTX 3050/4060 y superiores) usando q4f16.
- Opciones de despliegue: transformers.js con WebGPU (principal), ONNX Runtime (CPU y GPU), y el runtime de `weightless` para el demo de navegador. vLLM, llama.cpp y TGI no están documentados para esta exportación ONNX con nodos GLP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| msuiche/Qwen2.5-1.5B-Instruct-GLP-demo | 1,5B | no disponible | Apache-2.0 | ONNX q4f16 + GGUF (vector) | Steering GLP en grafo, demo WebGPU |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 (modelo base) | Apache-2.0 | safetensors, GGUF, ONNX | Modelo original sin instrumentación |
| onnx-community/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 (modelo base) | Apache-2.0 | ONNX (varias precisiones) | Exportación ONNX estándar sin GLP |
| Llama 3.2 1B Instruct | 1,2B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar, licencia con restricciones |

## Limitaciones y advertencias

- El propósito declarado del repo es demostrar que el steering puede hacer que un modelo alineado responda a prompts dañinos que originalmente rechaza; su uso para eludir salvaguardas en producción es un riesgo de seguridad explícito.
- Los pesos base no se modifican, pero el efecto de `glp_alpha = 1` sí altera el comportamiento de seguridad del modelo; no debe tratarse como una variante segura del original.
- El vector GLP se derivó con un conjunto pequeño (AdvBench vs Alpaca) y una validación limitada (8 prompts por brazo); la generalización a otros dominios dañinos no está demostrada.
- Riesgo de alucinación y sesgos: no documentados en esta model card; heredados del modelo base Qwen2.5-1.5B-Instruct.
- Idiomas soportados: no disponibles en la información proporcionada.
- Longitud de contexto efectiva en esta exportación: no disponible; no se confirma que se mantenga la ventana del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero el uso del mecanismo GLP para eludir salvaguardas puede contravenir políticas de despliegue y normativa aplicable; evaluar caso por caso.
- Repositorio con 0 descargas y 0 likes; sin señales de adopción ni mantenimiento más allá de la actualización del 19 de noviembre de 2026.
- El campo de parámetros safetensors del repo (41.472) no refleja el tamaño real del modelo; no usarlo como referencia.

## Enlaces

- Hugging Face: https://huggingface.co/msuiche/Qwen2.5-1.5B-Instruct-GLP-demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Exportación ONNX de referencia: https://huggingface.co/onnx-community/Qwen2.5-1.5B-Instruct
- Repositorio weightless: https://github.com/msuiche/weightless
- Especificación GLP: `docs/spec/GLP.md` dentro del repositorio weightless
- Vector GLP: `qwen2.5-1.5b-instruct-refusal-cvec.gguf` (incluido en el repo)
