# OsaurusAI/d3-JANGH2

## Resumen

OsaurusAI/d3-JANGH2 es un paquete cuantizado del modelo de decisión multimodal vllm-sr/d3 (27B, construido sobre Qwen/Qwen3.8-27B y desarrollado por vLLM Semantic Router como parte de su «Decision 3.0»). No es un modelo generativo: recibe un estado (texto o JSON, opcionalmente con imágenes y vídeo) junto con preguntas tipadas —elegir una de varias opciones, sí/no, o una puntuación en una escala ordenada— y devuelve, en un único forward pass, una probabilidad por opción sin generar texto. La cabeza de respuesta soporta hasta 255 opciones, lo que lo hace apto para enrutado de peticiones, selección de herramientas y clasificación zero-shot.

La aportación del bundle es de compresión: reduce los 52,2 GB en BF16 a 14,50 GB manteniendo la misma decisión que el modelo de precisión completa en el 93,45 % de 2.000 peticiones del split de test de tasksource/tasksource-jev-typed-decisions. Para ello aplica una cuantización mixta: MLP en 2 bits con formato propio JANGH (rotación Hadamard-32 y codebook odd-cubic), y atención, atención lineal, embeddings y torre de visión en 8 bits afín, con una media de 4,45 bits por peso. La cabeza de decisión de 255 vías se conserva en FP32 byte a byte y las puertas de atención lineal permanecen en BF16.

Es relevante ahora porque demuestra que un modelo de decisión de 27B puede caber en 14,5 GB y ejecutarse en Apple Silicon mediante el runtime Osaurus (versión 0.25.26 o superior) con una degradación medida y acotada frente al original, algo que los paquetes cuantizados del proveedor (FP8, GPTQ, AWQ, NVFP4) no consiguen por debajo de 16,4 GB con formatos orientados a NVIDIA y AMD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención completa bidireccional y capas de atención lineal (base Qwen/Qwen3.8-27B); torre de visión para imágenes y vídeo; cabeza de decisión de 255 opciones (FP32) |
| Parámetros totales | 26.090 M en el modelo de origen (BF16, 52,2 GB); 10.178.366.704 elementos almacenados en los safetensors de este bundle (pesos empaquetados) |
| Parámetros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLP JANGH 2-bit (rotación Hadamard-32, codebook odd-cubic) con capas sensibles a mayor precisión; atención, atención lineal, embeddings y torre de visión en 8 bits afín; media de 4,45 bits por peso; cabeza de respuesta en FP32 y puertas de atención lineal en BF16 |
| Idiomas soportados | en; multilingual (sin desglose de idiomas en la model card) |
| Licencia | Apache-2.0 (heredada del modelo base; se incluyen NOTICE y LICENSE) |
| Formato de pesos | safetensors para MLX (JANG); repositorio de 14,5 GB |

## Arquitectura y entrenamiento

El modelo subyacente es vllm-sr/d3, un modelo de decisión multimodal de 27B derivado de Qwen/Qwen3.8-27B, con una arquitectura que combina atención completa (en modo bidireccional durante el forward de decisión) con capas de atención lineal, más una torre de visión que procesa imágenes y vídeo. La salida no es texto: la red proyecta el estado y la pregunta sobre una cabeza de 255 vías que devuelve una distribución de probabilidad sobre las opciones, lo que permite responder en un solo forward pass. Este bundle no reentrena el modelo; solo cuantiza los pesos, por lo que los datos de entrenamiento, el número de tokens y las fases de RLHF/DPO del original no se detallan en la información disponible.

El proceso de cuantización sí está documentado con detalle: la calibración ejecutó el propio forward de decisión de d3 (atención completa bidireccional, formato de prompt de decisión, imágenes y vídeo) sobre 2.778 prompts de decisión y 1,81 M de tokens, cubriendo preguntas de enrutado sobre peticiones reales, selección de herramientas sobre listas de hasta 255 opciones, trazas de agente y terminal, código, seguridad, documentos largos, decisiones tipadas, imágenes y vídeos de pantalla. Las escalas activación-conscientes (AWQ) se pliegan en las normas y proyecciones que producen las activaciones, y cada MLP cuantizado se redondea con GPTQ sobre matrices hessianas de ese forward, conservando el módulo cuantizado únicamente cuando supera al redondeo simple.

## Capacidades

- Clasificación zero-shot: asignar un estado a una de varias etiquetas candidatas sin ejemplos previos por clase.
- Decisiones tipadas: elección única entre hasta 255 opciones, respuesta sí/no (con umbral en 0,5) y puntuación sobre una escala ordenada.
- Salida probabilística calibrada por opción en un único forward pass, sin generación de texto libre.
- Entrada de texto plano y JSON estructurado, incluidos estados de herramienta y trazas de agente.
- Entrada multimodal: imágenes y vídeo (incluido vídeo de pantalla) procesados por la torre de visión.
- Enrutado de peticiones y selección de herramientas sobre listas largas, con hasta 255 alternativas en la cabeza de respuesta.
- Clasificación de contenido y seguridad, y triaje de documentos largos.
- Soporte multilingüe declarado, con inglés como idioma principal.
- No soporta tool calling generativo, agentes multi-paso ni modo de razonamiento extenso: su función es emitir una decisión, no texto.

## Casos de uso

- Enrutado semántico de peticiones en una puerta de entrada LLM: dado el prompt del usuario y un conjunto de modelos o rutas candidatas, el modelo devuelve la probabilidad de cada ruta en una sola pasada, lo que permite decidir el destino antes de invocar ningún modelo generativo.
- Selección de herramientas en un agente: con listas de hasta 255 herramientas, el modelo clasifica la intención del usuario y elige la herramienta correcta como una decisión tipada, evitando el coste y la latencia de prompt engineering con modelos generativos.
- Moderación y clasificación de riesgo: puntuar solicitudes o respuestas frente a categorías de seguridad (contenido dañino, fugas de datos, comandos destructivos) usando la escala ordenada y el umbral de sí/no.
- Triaje de documentos largos y código: clasificar incidencias, tickets o fragmentos de código dentro de un pipeline de CI/CD para decidir si requieren revisión humana, aplicando etiquetas predefinidas sin ejemplos por clase.
- Análisis de trazas de agente y terminal: clasificar secuencias de comandos o pasos intermedios para detectar bucles, acciones peligrosas o finalización correcta de una tarea, aprovechando la entrada JSON y las decisiones tipadas.
- Clasificación sobre imágenes y vídeo de pantalla: evaluar capturas o grabaciones (por ejemplo, verificar el estado de una interfaz o detectar errores en una demo) y emitir una etiqueta sin necesidad de un modelo de visión generativo aparte.
- Evaluación automática de respuestas con rúbrica: usar la escala ordenada para puntuar la calidad de una salida frente a criterios, con la ventaja de una probabilidad explícita por nivel en lugar de una nota generada en texto.

## Benchmarks y rendimiento

Los datos publicados no son benchmarks estándar (MMLU, HumanEval, GSM8K), sino medidas de concordancia frente al modelo de precisión completa (BF16). Ninguna de las preguntas usadas se empleó en la calibración.

| Conjunto de test | Preguntas | Decisiones coincidentes | KL medio (menor es mejor) | Exactitud gold, BF16 → bundle |
|---|---|---|---|---|
| Decision Index 0.3 public suite (41 benchmarks) | 1.610 | 93,17 % | 0,0345 | 78,9 % → 78,1 % |
| LocalLLaMA/typed-decisions test (gold blando) | 800 | 96,62 % | 0,0076 | 73,4 % → 74,2 % |
| Decisiones retenidas sobre textos, imágenes y vídeos propios | 487 | 95,07 % | 0,0129 | no disponible |
| tasksource/tasksource-jev-typed-decisions test (2.000 peticiones) | 2.000 | 93,45 % | 0,0314 | 84,2 % → 82,3 % |

Comparación entre los tres bundles de Osaurus y los paquetes cuantizados del proveedor:

| Paquete | Tamaño | Decisiones (tsj, 2.000) | Decisiones (suite) | KL medio (suite) |
|---|---|---|---|---|
| d3-JANG_6M | 23,6 GB | 99,35 % | 99,38 % | 0,0003 |
| d3-JANG_4M | 19,3 GB | 98,45 % | 98,07 % | 0,0024 |
| d3-JANGH2 (este bundle) | 14,5 GB | 93,45 % | 93,17 % | 0,0345 |

| Paquete del proveedor (14.031 peticiones de test) | Decisiones | Memoria |
|---|---|---|
| FP8 | 99,08 % | 31,9 GB |
| W4A16 GPTQ (grupo 128) | 97,98 % | 16,4 GB |
| W4A16 AWQ (grupo 128) | 97,76 % | 16,5 GB |
| NVFP4 | 96,64 % | 17,2 GB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de latencia o throughput en la información disponible.

## Requisitos de hardware

- Peso de los shards: 14,50 GB, más activaciones, torre de visión y caché de atención; en la práctica requiere memoria unificada de al menos 18-20 GB para texto y más (24-32 GB) para imágenes y vídeo.
- Plataforma objetivo: Apple Silicon con MLX; el runtime indicado es Osaurus 0.25.26 o superior. No se documenta soporte para CUDA ni ROCm en este bundle.
- GPU consumer: encaja en equipos Apple con memoria unificada de 24 GB o más (familias M2 Pro/Max, M3 Pro/Max, M4 Pro/Max); en configuraciones de 16 GB el margen es muy ajustado si se procesan imágenes o vídeo.
- Despliegue: runtime Osaurus sobre MLX. El formato JANG no es GGUF, por lo que no es directamente cargable en llama.cpp, Ollama o TGI; para vLLM habría que recurrir al modelo base o a los paquetes del proveedor en formato GPU.
- Latencia y throughput: no disponibles. Como referencia estructural, al generar cero texto y resolver en un único forward pass, el coste por petición depende del tamaño del estado de entrada (documento largo, vídeo) y no de una decodificación autorregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-JANGH2 (este bundle) | 26,09 B origen | no disponible | MLX JANG, 14,5 GB | Apache-2.0 | HuggingFace (MLX) |
| d3-JANG_4M | 26,09 B origen | no disponible | MLX JANG, 19,3 GB | Apache-2.0 | HuggingFace (MLX) |
| d3-JANG_6M | 26,09 B origen | no disponible | MLX JANG, 23,6 GB | Apache-2.0 | HuggingFace (MLX) |
| vllm-sr/d3 (BF16) | 26,09 B | no disponible | BF16, 52,2 GB | Apache-2.0 | HuggingFace |
| Paquete W4A16 GPTQ del proveedor | 26,09 B origen | no disponible | GPTQ grupo 128, 16,4 GB | Apache-2.0 | HuggingFace |
| Paquete FP8 del proveedor | 26,09 B origen | no disponible | FP8, 31,9 GB | Apache-2.0 | HuggingFace |

No se dispone de información sobre modelos de decisión de terceros comparables (misma tarea de clasificación tipada con cabeza de 255 opciones) en el material proporcionado. Los paquetes del proveedor están pensados para NVIDIA/AMD y sus cifras de concordancia provienen de las 14.031 peticiones completas del mismo dataset, con su propio mapeo de peticiones y hardware, por lo que no son estrictamente comparables con las 2.000 peticiones usadas aquí.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, Tool calling generativo, agentes multi-paso ni respuestas en lenguaje natural. Cualquier caso de uso conversacional requiere un modelo adicional.
- La concordancia con el modelo de precisión completa es del 93,45 % en el test de 2.000 peticiones, lo que implica aproximadamente un 6,5 % de decisiones distintas; el KL medio de 0,0314 en ese conjunto es dos órdenes de magnitud superior al de d3-JANG_4M (0,0024), señal de una distribución de probabilidad más degradada.
- La caída de exactitud gold en el conjunto tsj pasa de 84,2 % a 82,3 %; en producción conviene validar el umbral de decisión con datos propios antes de sustituir al modelo completo.
- Calibrado con 2.778 prompts y 1,81 M de tokens de dominios concretos (enrutado, herramientas, trazas, código, seguridad, documentos, imagen y vídeo); dominios alejados de esa distribución pueden degradarse más.
- Idiomas: la model card declara inglés y «multilingual» sin listado ni evaluación por idioma; el rendimiento en castellano no está medido.
- Longitud de contexto no documentada, lo que impide planificar el tamaño máximo de estado o documento por petición.
- Dependencia del runtime Osaurus 0.25.26 o superior y de MLX; no hay soporte documentado para CUDA, ROCm, llama.cpp, Ollama ni TGI, lo que limita el despliegue en servidores x86 con GPU.
- Licencia Apache-2.0: permite uso comercial, pero obliga a conservar LICENSE y NOTICE del modelo base vllm-sr/d3 y de Qwen/Qwen3.8-27B.
- Hereda los sesgos y riesgos de alucinación del modelo base en la medida en que la cabeza de decisión los refleje; no se han publicado evaluaciones de sesgo específicas para este bundle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/d3-JANGH2
- Modelo base: https://huggingface.co/vllm-sr/d3
- Modelo original de partida: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime Osaurus: https://osaurus.ai
- Dataset de evaluación citado: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de evaluación citado: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Contacto del cuantizador: eric@osaurus.ai (según la model card)
- Decision Index 0.3 public suite: no disponible (no se proporciona URL)
