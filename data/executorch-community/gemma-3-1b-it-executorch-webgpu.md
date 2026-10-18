# executorch-community/Gemma-3-1B-IT-ExecuTorch-WebGPU

## Resumen

Gemma-3-1B-IT-ExecuTorch-WebGPU es una conversión del modelo google/gemma-3-1b-it (Google DeepMind) al formato ExecuTorch, delegada al backend WebGPU, de modo que la inferencia se ejecuta íntegramente en el navegador del visitante sobre su propia GPU. No es un modelo nuevo: es un artefacto de despliegue que empaqueta los pesos del Gemma 3 de 1B en un programa `.pte` de 610,6 MB, cuantizado a 4 bits por grupos (q4gsw, grupo de 64) en todas las capas lineales y en la cabeza de salida atada a los embeddings, con activaciones y caché KV en fp32.

El interés es de tipo práctico: elimina la necesidad de servidor de inferencia para un LLM de 1B, con privacidad por diseño (los datos no salen del cliente), coste marginal nulo y funcionamiento sin conexión una vez cacheado el programa en el navegador. El precio es una reducción de contexto: de los 32K tokens del modelo original a 8.960 tokens, con un máximo de 512 tokens nuevos por llamada.

El repositorio lo publica la comunidad executorch-community, no Google. La conversión y la cuantización las firma Meta Platforms, Inc., y la distribución se acoge a la licencia `gemma`. No hay resultados de benchmarks publicados ni lista explícita de idiomas en la metadata de este repo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Gemma 3) con capas de atención de ventana deslizante y global; exportado a ExecuTorch para el backend WebGPU |
| Parámetros totales | 1,0 B (302 M en embeddings + 698 M no-embedding) |
| Longitud de contexto | 8.960 tokens en esta conversión (el modelo original soporta 32K); máximo de 512 tokens nuevos por llamada |
| Tipos de cuantización | Pesos 4-bit groupwise (q4gsw, tamaño de grupo 64) en capas lineales y cabeza de salida/embeddings atados; activaciones y caché KV en fp32 |
| Idiomas soportados | El modelo base se entrena sobre documentos web en más de 140 idiomas; la metadata de este repositorio no declara lista de idiomas (no disponible) |
| Licencia | `gemma` (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | ExecuTorch `.pte` (610,6 MB); tokenizer en JSON. No incluye safetensors ni GGUF |
| Tamaño total del repositorio | 0,7 GB (643,6 MB según la model card) |
| Vocabulario | 262.144 tokens |
| Interfaz de inferencia | `forward(tokens int64 [1, 1..512], input_pos int64 [1]) -> logits float32 [1, 262144]` (solo última posición) |
| Runtime requerido | ExecuTorch con backend WebGPU sobre WebAssembly; navegador con WebGPU habilitado |
| Versión del modelo base | `google/gemma-3-1b-it`, revisión `dcc83ea841ab6100d6b47a070329e1ba4cf78752` |
| Herramientas de exportación | executorch 1.5.1+cpu, torch 2.14.1+cpu, torchao 0.18.0+cpu, transformers 5.19.0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Gemma 3 de 1B: un transformer decoder-only denso con atención de ventana deslizante combinada con capas de atención global. En esta conversión, la model card indica que ambas capas de atención se exportan de forma exacta, sin aproximaciones en el grafo. No hay mezcla de expertos: los 1.000 millones de parámetros se activan en cada token, de los cuales 302 M corresponden a embeddings y 698 M a pesos no-embedding.

El entrenamiento es el del modelo original de Google DeepMind: 2 billones de tokens de documentos web en más de 140 idiomas, además de código y matemáticas, con un vocabulario de 262.144 tokens. La model card de esta conversión no detalla la composición exacta del dataset ni las etapas de alineación (RLHF/DPO); esa información se remite a la ficha de `google/gemma-3-1b-it` y al informe técnico de Gemma 3 (arXiv:2503.19786).

La innovación de este artefacto es el pipeline de despliegue, no el modelo. Los embeddings y la cabeza de salida están atados, de modo que sus datos se almacenan una sola vez. La exportación es reproducible: el autor indica que volver a ejecutar la receta (`python recipes/gemma-3-1b-it.py --out out/gemma-3-1b-it`, en `export/`) produce ficheros idénticos byte a byte, y publica sumas SHA-256 en `manifest.json`, que el playground verifica tras la descarga. La verificación se hizo en Chromium headless con WebGPU sobre SwiftShader, comprobando que los logits de prefill y la salida greedy coinciden token a token con la referencia en CPU.

## Capacidades

- Generación de texto y conversación multi-turno mediante la plantilla de chat oficial de Gemma, incluida en `tokenizer/`.
- Resumen, reescritura y reformulación de textos, con mejor comportamiento en tareas bien delimitadas que en peticiones abiertas.
- Soporte multilingüe heredado del modelo base (más de 140 idiomas en el entrenamiento), sin lista de idiomas verificada en este repositorio.
- Manejo de código y matemáticas a nivel básico, limitado por el tamaño de 1B parámetros.
- Inferencia completamente local en el navegador: sin llamadas a servidor y con funcionamiento sin conexión tras cachear los ficheros.
- Control de parada explícito en los tokens 1 (`<eos>`) y 106 (`<end_of_turn>`).
- No dispone de tool calling, function calling, modo thinking, visión ni audio: es un modelo de texto y la conversión no declara soporte de agentes ni razonamiento multi-paso.
- No se puede cargar con `transformers` (`inference: false`); requiere el runtime de ExecuTorch para WebGPU.

## Casos de uso

- Asistente conversacional en el cliente: un chat embebido en una web que nunca envía el texto del usuario a un servidor. La ventana de 8.960 tokens cubre conversaciones de varias decenas de turnos y el límite de 512 tokens por llamada encaja con turnos típicos.
- Cumplimiento y privacidad: despliegue en sectores con requisitos estrictos de residencia de datos (sanidad, legal, administración), donde enviar documentos a una API externa no es viable y el procesamiento local elimina la transferencia.
- Resumen y reescritura de textos pegados por el usuario: correos, actas o informes de hasta ~8K tokens con instrucciones explícitas de longitud y formato, que es el régimen donde un modelo de 1B rinde de forma aceptable.
- Extracción de información en formularios y reseñas: clasificación y extracción de campos con una plantilla de chat fija; la tarea es acotada y no requiere conocimiento factual, lo que mitiga el riesgo de alucinación.
- Prototipado de producto y UX: validar flujos de IA generativa en el navegador sin coste de inferencia ni infraestructura, antes de decidir si se migra a un modelo mayor en servidor.
- Demos y material docente: el playground de ExecuTorch permite mostrar cuantización 4-bit, ejecución WebGPU y comparación de logits contra referencia CPU sin instalar nada.
- Aplicaciones web progresivas (PWA) sin conexión: el programa se descarga una vez y se cachea; a partir de ahí el asistente funciona en entornos con red intermitente o inexistente.
- Evaluación de la cadena ExecuTorch/WebGPU: investigación sobre exportación de transformers, delegación de operadores y comportamiento de kernels WebGPU en hardware muy diverso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones equivalentes, y tampoco cifras de latencia o throughput. El único dato de validación cualitativa aportado es que los logits de prefill y la salida greedy coinciden token a token con la referencia en CPU en la prueba del autor.

## Requisitos de hardware

- Peso de los pesos: 610,6 MB para el `.pte` (643,6 MB el total del repositorio). Presupuesto de memoria estimado en 1,5-2 GB de memoria de GPU para pesos, overhead del runtime y caché KV fp32 a 8.960 tokens; el desglose exacto de la caché KV no está disponible.
- GPU: cualquier GPU expuesta a través de WebGPU, incluidas integradas de portátil. El autor verificó el funcionamiento con WebGPU sobre SwiftShader (implementación por CPU) en Chromium headless, lo que sitúa el suelo de requisitos muy bajo.
- Cabe en GPU de consumo: sí, en iGPU y en GPUs discretas de portátil o de sobremesa de gama media. No se han publicado cifras por modelo concreto (A100, H100, RTX 4090), por lo que no hay datos de rendimiento comparables.
- Navegador: se requiere WebGPU habilitado. Las versiones mínimas por navegador no están detalladas en la información disponible.
- Despliegue: runtime de ExecuTorch para WebGPU compilado a WebAssembly, publicado en `executorch-community/ExecuTorch-WebGPU-Runtime`; la vía más sencilla es el playground de executorch.ai, que descarga, cachea y ejecuta en local. No es compatible con vLLM, TGI, llama.cpp ni Ollama, y no se puede ejecutar con el pipeline de `transformers`.
- Latencia y throughput: no disponibles. La estructura de ejecución es prefill de hasta 512 tokens por llamada y decodificación de un token por paso, con la caché KV residente en el programa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-1B-IT-ExecuTorch-WebGPU (esta ficha) | 1,0 B denso | 8.960 tokens (512 por llamada) | ExecuTorch `.pte`, pesos 4-bit q4gsw | `gemma` | Repositorio público, 0 descargas y 0 likes en el momento de la consulta |
| google/gemma-3-1b-it (modelo base) | 1,0 B denso | 32K tokens | no disponible en la información (repo original de transformers) | `gemma` | Repositorio oficial de Google DeepMind |
| Otras conversiones on-device de Gemma 3 1B (GGUF para llama.cpp, ONNX Runtime Web, MLX) | 1,0 B (por el modelo base) | no disponible | GGUF / ONNX / otros | `gemma` (derivadas) | no disponible: no se han consultado sus fichas en esta búsqueda |
| LLM de bolsillo alternativos en navegador (familias tipo Qwen o Llama de <2B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el modelo base: misma arquitectura y mismos parámetros, pero esta conversión recorta el contexto de 32K a 8.960 tokens, limita cada llamada a 512 tokens y altera la formulación de las respuestas por efecto de la cuantización 4-bit. A cambio, permite ejecución en navegador sin servidor. No se dispone de datos de benchmarks de ninguna de las alternativas en la información proporcionada, por lo que no es posible comparar calidad de forma cuantitativa.

## Limitaciones y advertencias

- Contexto recortado: 8.960 tokens frente a los 32K del modelo original, con un máximo de 512 tokens nuevos por llamada. Los prompts o conversaciones más largos deben truncarse o dividirse.
- La cuantización 4-bit modifica las salidas: la model card advierte que las respuestas son fluidas pero pueden formularse de manera distinta a las del modelo original.
- Modelo de 1B parámetros: rinde bien en tareas claramente formuladas y falla en razonamiento abierto o complejo, matices, sarcasmo y lenguaje figurado.
- No es una base de conocimiento: puede afirmar hechos incorrectos o desactualizados. Cualquier uso informativo requiere verificación externa o anclaje a fuentes (RAG).
- Sesgos y lagunas heredados de los datos de entrenamiento (documentos web en más de 140 idiomas); la model card remite a la sección de consideraciones éticas del modelo original, sin cuantificar los sesgos.
- Idiomas: aunque el modelo base cubre más de 140 idiomas, este repositorio no declara lista de idiomas ni evaluaciones por idioma; el rendimiento fuera del inglés no está verificado.
- Licencia: uso sujeto a los Gemma Terms of Use, incluidas las restricciones de la sección 3.2, y a la Gemma Prohibited Use Policy. Es una obra derivada distribuida bajo los mismos términos; la conversión y cuantización están atribuidas a Meta Platforms, Inc.
- Empaquetado no estándar: al ser un `.pte` con `inference: false`, no funciona con el pipeline de `transformers` ni con servidores de inferencia convencionales; requiere el runtime de ExecuTorch WebGPU y un navegador con WebGPU.
- Dependencia del navegador y del hardware del visitante: el rendimiento y la disponibilidad de WebGPU varían de forma notable entre equipos y sistemas; no hay cifras publicadas de latencia ni de tokens por segundo.
- Madurez: 0 descargas y 0 likes, publicada el 2026-10-18, y el playground asociado figura como "launching soon". No hay histórico de uso en producción.
- Sin benchmarks: no se pueden comparar sus capacidades de forma cuantitativa con otras alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/executorch-community/Gemma-3-1B-IT-ExecuTorch-WebGPU
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Runtime de ExecuTorch WebGPU: https://huggingface.co/executorch-community/ExecuTorch-WebGPU-Runtime
- Repositorio ExecuTorch: https://github.com/pytorch/executorch
- Backend WebGPU: https://github.com/pytorch/executorch/tree/main/backends/webgpu
- Playground: https://executorch.ai
- Informe técnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Citación del informe: https://goo.gle/Gemma3Report
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
