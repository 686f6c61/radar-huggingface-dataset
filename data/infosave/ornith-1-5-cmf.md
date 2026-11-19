# infosave/Ornith-1.5-cmf

## Resumen

Ornith-1.5-cmf es una conversión al contenedor CMF de la familia Ornith 1.5, publicada por el usuario infosave. No se trata de un modelo nuevo entrenado desde cero, sino de una cuantización a 4 bits (formato `q4tp`, con escalas en escalera) de los pesos en bf16 de dos modelos de la familia Qwen3.5: un denso de 9B parámetros y un MoE de 35B totales con 3B activos por token. El objetivo es empaquetar cada variante en un único fichero mapeado en memoria, legible por `cortiq`, un binario escrito en Rust que no depende de ningún framework de machine learning (sin PyTorch, sin Python).

La relevancia de esta ficha es doble. Por un lado, documenta una alternativa de despliegue de inferencia muy ligera en dependencias: `cargo install cortiq-cli`, descarga del `.cmf` y ejecución, con backend GPU vía Vulkan, Metal o DX12 y fallback a CPU. Por otro, ilustra una tendencia de empaquetado (contenedor único, mmap, decodificación especulativa con cabeza MTP incluida) que reduce la fricción operativa frente a stacks tipo vLLM o llama.cpp.

Ambos modelos son híbridos de atención: la mayoría de capas usan atención lineal y cada cuarta capa usa atención completa. El 9B tiene 32 capas (8 de atención, 24 lineales) y ocupa 4,37 GB en el contenedor; el 35B-A3B tiene 40 capas (10 de atención, 30 lineales), 256 expertos con 8 activos por token más uno compartido, y ocupa 17,4 GB. Los repositorios originales son visión-lenguaje, pero estos ficheros contienen únicamente la torre de texto: no aceptan imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal mayoritaria, atención completa cada cuarta capa); variante MoE en el 35B-A3B |
| Parametros totales | 9B (variante densa) / 35B (variante MoE) |
| Parametros activos | 3B por token en la variante MoE; no aplica en la densa |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con escalas en escalera (`q4tp`), cuantizado directamente desde los checkpoints bf16 |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | CMF (contenedor de fichero único mapeado en memoria), leído por `cortiq`; no es safetensors ni GGUF |
| Capas | 32 en el 9B (8 atención / 24 lineales); 40 en el 35B-A3B (10 atención / 30 lineales) |
| Expertos (MoE) | 256 expertos, 8 activos por token más uno compartido |
| Tamano en disco | 4,37 GB (9B q4tp) / 17,4 GB (35B-A3B q4tp) |
| Modelo base | ornith-ai/Ornith-1.5-9B y ornith-ai/Ornith-1.5-35B-A3B |
| Libreria | cortiq |
| Tamano del repositorio | 264,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de la familia Qwen3.5 en su variante híbrida: bloques transformer en los que la mayor parte de las capas emplea atención lineal y solo una de cada cuatro utiliza atención completa. En el modelo denso de 9B esto se traduce en 32 capas, de las cuales 8 son de atención completa y 24 lineales. En el MoE de 35B hay 40 capas (10 de atención, 30 lineales) y una capa de mezcla de expertos con 256 expertos, de los que 8 se activan por token más un experto compartido, lo que deja 3B parámetros activos por token.

Sobre el entrenamiento no hay información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí documenta el autor de la conversión es el proceso de cuantización: los dos checkpoints bf16 se cuantizaron directamente a 4 bits con el esquema `q4tp` (tiled con escalas en escalera) y se incluyó la cabeza de borrador MTP (multi-token prediction) para decodificación especulativa. El contenedor CMF es un único fichero mapeado en memoria; `cortiq` ejecuta el token completo como un solo grafo enviado a la GPU, incluyendo el estado de atención lineal, el enrutamiento de expertos y la cabeza de borrador.

## Capacidades

- Generación de texto en inglés y ruso, los dos únicos idiomas declarados en la model card.
- Razonamiento y respuesta a instrucciones heredados del modelo base Ornith 1.5 (no se detallan capacidades específicas en la información disponible).
- Decodificación especulativa mediante la cabeza MTP incluida en el contenedor.
- Ejecución acelerada por GPU con backends Vulkan, Metal y DX12, con fallback a CPU.
- Servidor compatible con la API de OpenAI mediante `cortiq serve`, lo que permite conectar cualquier cliente que hable ese protocolo.
- No incluye entrada de imagen: los repositorios originales son visión-lenguaje, pero el contenedor solo lleva la torre de texto.
- Soporte de tool calling, function calling y flujos de agente: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en entornos sin Python ni frameworks de ML: el binario `cortiq` se instala con `cargo install cortiq-cli` y ejecuta el `.cmf` directamente, lo que simplifica imágenes de contenedor y reduce la superficie de dependencias en producción.
- Inferencia en estaciones de trabajo con GPU de consumo: el 9B en 4,37 GB cabe con holgura en tarjetas de 8-12 GB y el 35B-A3B en 17,4 GB entra en tarjetas de 24 GB como la RTX A5000, donde el autor reporta 143,7-145,8 tok/s con backend CUDA.
- Servicio de chat compatible con OpenAI: `cortiq serve` expone la API en un puerto, de modo que aplicaciones ya integradas con el SDK de OpenAI pueden apuntar al endpoint local sin cambios de código.
- Procesamiento por lotes de prompts largos: con `cortiq 0.8.92` en una RTX A5000, un prompt de 4096 tokens se lee a 3058 tok/s con primer token en 1,3 s (backend CUDA), adecuado para tareas de resumen o extracción sobre documentos de varios miles de tokens.
- Prototipado en portátiles Apple Silicon: el 9B se ejecuta en un M4 vía Metal a 20 tok/s, suficiente para pruebas interactivas y desarrollo sin acceso a servidor.
- Evaluación comparativa de cuantizaciones: al ser una conversión reproducible desde bf16 con checksums `.sha256` publicados, sirve para medir la pérdida de calidad de `q4tp` frente al checkpoint original en tareas concretas.
- Experimentación con arquitecturas híbridas de atención lineal: permite probar el comportamiento de un modelo con mayoría de capas lineales sin montar un stack de entrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son de velocidad de decodificación en estado estacionario, un solo stream, con `cortiq bench --core`:

| Modelo | Hardware / backend | Decodificación |
|---|---|---|
| 9B q4tp | A100 80GB, Vulkan, cortiq 0.5.99 | 73 tok/s |
| 9B q4tp | Apple M4, Metal | 20 tok/s |
| 35B-A3B q4tp | A100 80GB, Vulkan, cortiq 0.5.99 | 65 tok/s (el primer token paga una subida de expertos de ~10 s) |
| 35B-A3B q4tp | RTX A5000 24GB, CUDA, cortiq 0.8.88 | 143,7-145,8 tok/s |
| 35B-A3B q4tp | RTX A5000 24GB, Vulkan, cortiq 0.8.88 | 102,7-102,9 tok/s |

Lectura de prompt en RTX A5000 con cortiq 0.8.92: 3058 tok/s y primer token en 1,3 s con CUDA; 1101 tok/s y 3,7 s con Vulkan. El autor indica que este stack decodifica al 55-65 % de la tasa de una RTX 5090 en la misma clase de ficheros.

## Requisitos de hardware

- VRAM estimada: 4,37 GB de pesos para el 9B q4tp y 17,4 GB para el 35B-A3B q4tp, más el estado de atención lineal, la caché KV de las capas de atención completa y buffers de trabajo; el total exacto no está disponible.
- GPU recomendadas: A100 80GB (referencia del autor), RTX A5000 24GB para el 35B-A3B con CUDA, RTX 5090 como referencia de mayor throughput.
- GPU de consumo: el 9B cabe en tarjetas de 8-12 GB; el 35B-A3B requiere al menos 24 GB para evitar offload.
- Apple Silicon: el 9B funciona en un M4 vía Metal a 20 tok/s; no hay datos del 35B-A3B en Metal.
- Backends: Vulkan, Metal y DX12, con fallback a CPU; CUDA es una feature de compilación (`cargo install cortiq-cli --features cuda`) que requiere driver NVIDIA y bibliotecas CUDA 12.x.
- Opciones de despliegue: `cortiq run` para CLI y `cortiq serve` para endpoint compatible con OpenAI. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato CMF es específico de cortiq.
- Latencia y throughput: ver tabla de la sección anterior; el primer token del 35B-A3B en A100 con Vulkan incluye una subida de expertos de aproximadamente 10 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (q4tp, CMF) | 9B denso | no disponible | CMF | apache-2.0 | 4,37 GB; 73 tok/s en A100 Vulkan |
| Ornith-1.5-35B-A3B (q4tp, CMF) | 35B totales, 3B activos | no disponible | CMF | apache-2.0 | 17,4 GB; 143,7-145,8 tok/s en RTX A5000 CUDA |
| Ornith-1.5-9B / 35B-A3B originales (bf16) | 9B / 35B-A3B | no disponible | safetensors (presumible, no confirmado) | apache-2.0 | Repos visión-lenguaje; incluyen torre de visión que el CMF no lleva |

No se dispone de datos de benchmarks que permitan comparar la calidad de estas cuantizaciones con alternativas de otros autores, ni de información sobre otros modelos de la misma categoría en formato CMF.

## Limitaciones y advertencias

- Solo inglés y ruso: no hay soporte declarado de castellano ni de otros idiomas, por lo que su uso en producción en español no está respaldado por la model card.
- Sin visión: aunque los modelos base son visión-lenguaje, el contenedor contiene únicamente la torre de texto; no se puede enviar imagen.
- Cuantización de 4 bits: `q4tp` introduce pérdida de precisión respecto al bf16 original; no se publican evaluaciones de esa degradación.
- Longitud de contexto no documentada: no se puede planificar el dimensionado de caché KV ni el coste de prompts largos sin medirlo empíricamente.
- Ecosistema cerrado: el formato CMF solo lo lee `cortiq`, un proyecto de un único autor; no hay integración con vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y añade riesgo de mantenimiento.
- Dependencia de la versión de cortiq: los datos de rendimiento mezclan versiones (0.5.99, 0.8.88, 0.8.92) y backends distintos; los números no son directamente comparables entre filas.
- Primer token lento en el MoE sobre A100 con Vulkan: la subida inicial de expertos de aproximadamente 10 s penaliza cargas de trabajo con muchas peticiones cortas y arranques frecuentes.
- Riesgo de alucinación y sesgos: no hay información disponible sobre evaluación de sesgos ni sobre tasas de alucinación del modelo base.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones de los repositorios originales de Ornith 1.5, ya que la ficha solo cubre la conversión.
- Repositorio de 264,4 GB: la descarga completa es costosa; conviene usar `hf download` con el nombre de fichero concreto en lugar de clonar el repositorio entero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Ornith-1.5-cmf
- Repositorio del contenedor CMF: https://github.com/infosave2007/cmf
- Organización del modelo base: https://huggingface.co/ornith-ai
- Modelo base denso: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Modelo base MoE: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
