# bartowski/Cloudflare_clef-GGUF

## Resumen

clef es un modelo de decisión multimodal desarrollado por Cloudflare, publicado originalmente como `Cloudflare/clef` y distribuido en formato GGUF por bartowski. A diferencia de un modelo generativo convencional, clef no produce texto: recibe un estado (texto o JSON) junto con un esquema de preguntas tipadas y devuelve, en un único pase forward, una probabilidad para cada opción permitida de cada pregunta. Esto lo convierte en una pieza especializada para enrutamiento, clasificación y extracción de decisiones estructuradas en pipelines de producción.

El modelo cuenta con aproximadamente 27.024 millones de parámetros (27B) y soporta entrada de texto e imagen cuando se acompaña del fichero `mmproj` correspondiente. Su arquitectura se etiqueta internamente como `qwen3.8` y `systemone`, con soporte de código personalizado (`custom-code`), lo que sugiere una base derivada de la familia Qwen con un head de decisión específico añadido en la fase de post-entrenamiento.

La relevancia de clef radica en su enfoque: en lugar de forzar a un LLM generativo a emitir JSON y parsearlo con tolerancia a errores, expone directamente una API tipada (TypeSafe System One) servida por `llama-server` en el endpoint `/v1/systemone`, con garantías de esquema. La licencia Apache 2.0 y la disponibilidad de cuantizaciones GGUF desde 2 bits hasta bf16 facilitan su despliegue tanto en servidores como en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen, etiqueta `qwen3.8`), con head de decisión tipado (`systemone`) |
| Parametros totales | 27.024.054.788 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, IQ3_M, Q3_K_S, Q2_K (estáticas, sin imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint original) |

## Arquitectura y entrenamiento

clef se construye sobre un backbone transformer de aproximadamente 27B parámetros, identificado en los tags como `qwen3.8`, al que se añade un head de decisión que transforma los estados ocultos finales en distribuciones de probabilidad sobre las opciones permitidas de cada pregunta del esquema. El modelo es multimodal: acepta texto e imagen (esta última mediante el fichero `mmproj`), y su pipeline declarado es `image-text-to-text`. El head de decisión se mantiene en Q8_0 en todas las cuantizaciones publicadas, ya que es la parte que produce las respuestas y no existe forma de medir el coste de cuantizarlo con las métricas habituales.

El post-entrenamiento se orienta a la producción de salidas tipadas (`image-text-to-typed-output`), clasificación y decisión estructurada. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. Tampoco se documenta decodificación especulativa (explícitamente indicada como ausente) ni atención lineal. Una particularidad técnica relevante es la ausencia de imatrix: la herramienta de calibración de llama.cpp depende de las probabilidades de token generadas, y un modelo de decisión no genera texto, por lo que todas las cuantizaciones son estáticas y las de menos de 4 bits por peso pierden calidad de forma más acusada que sus equivalentes con imatrix.

## Capacidades

- Decisión estructurada: devuelve probabilidades para cada opción de preguntas tipadas (`choice`, `noul`, `score`) en un solo pase forward.
- Entrada multimodal: acepta texto e imagen (con el fichero `mmproj`), lo que permite clasificar o enrutar a partir de capturas, documentos escaneados o imágenes.
- Salida tipada garantizada: el endpoint `/v1/systemone` de `llama-server` aplica el esquema de preguntas, eliminando el parseo frágil de JSON generado.
- Clasificación y enrutamiento: apto para asignar categorías, detectar intención, medir urgencia o sentimiento mediante preguntas tipadas.
- Extracción de decisiones en lote: al no generar texto, el coste por consulta es un único forward pass, lo que favorece el procesamiento masivo.
- Integración con pipelines existentes: compatible con `endpoints_compatible` y con la API TypeSafe System One.
- No soporta chat ni completion: no hay endpoint conversacional ni formato de prompt; no es un generador de texto.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: se envía el mensaje del cliente como `state` y un esquema con preguntas `choice` (equipo: facturación, envío, técnico) y `score` (urgencia). El modelo devuelve probabilidades por opción en un solo pase, lo que permite umbrales configurables y derivación automática sin parseo de texto libre.
- Moderación y triaje de contenido: clasificación de textos o imágenes entrantes en categorías tipadas (`noul` para binarios como "¿es spam?", `choice` para categorías), con la ventaja de que la salida siempre respeta el esquema definido.
- Extracción de campos en documentos escaneados: usando la entrada de imagen más `mmproj`, clef puede responder preguntas tipadas sobre el contenido (tipo de documento, presencia de firma, categoría), útil en digitalización de facturas o formularios.
- Detección de sentimiento y tono en atención al cliente: preguntas `score` para medir enfado o satisfacción y `noul` para flags binarios, integrado en sistemas de priorización de colas.
- Clasificación de imágenes en pipelines de visión: con el `mmproj`, etiquetado tipado de imágenes (categoría de producto, presencia de defectos) sin necesidad de un clasificador dedicado por tarea.
- Decisión en agentes y sistemas multi-paso: clef puede actuar como "árbitro" que decide la siguiente acción o ruta dentro de un agente, alimentando al orquestador con probabilidades en lugar de texto generado, lo que simplifica la lógica de control y reduce errores de formato.
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperación, a qué índice dirigirla o si es fuera de dominio, mediante preguntas tipadas y umbrales de probabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica además que perplexity y KL divergence no pueden medirse en este modelo porque no genera texto, por lo que las descripciones de calidad de cada cuantización son orientativas y no mediciones específicas.

## Requisitos de hardware

- VRAM estimada para inferencia: bf16 ~54 GB; Q8_0 ~28,8 GB; Q6_K ~23,3 GB; Q5_K_M ~20,6 GB; Q4_K_M ~17,65 GB (opción recomendada por el autor); Q3_K_M e inferiores por debajo de 4 bits por peso, con pérdida de calidad notable.
- GPU recomendadas: A100 80 GB o H100 para bf16 y Q8_0; A100 40 GB, L40S o RTX 6000 Ada para Q6_K y Q5_K_M; RTX 4090 (24 GB) para Q4_K_M y Q5_K_S con holgura.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con Q4_K_M o Q5_K_S; en GPUs de 16 GB solo con cuantizaciones de 3 bits o inferiores, con la advertencia de pérdida de calidad del autor.
- Opciones de despliegue: `llama-server` de llama.cpp (release b11430 o superior) mediante el endpoint `/v1/systemone`; el formato GGUF es compatible con llama.cpp y con entornos que lo integren. No se documentan opciones para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. Al tratarse de un único forward pass sin generación autorregresiva, el coste por consulta es predecible y proporcional a la longitud del estado de entrada, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clef (Cloudflare) | ~27B | no disponible | Probabilidades tipadas (decisión) | Apache 2.0 | GGUF en HF, safetensors original |
| LLM generativo de ~27B (p. ej. Qwen de tamaño similar) | ~27B | no disponible | Texto generado | variable | safetensors, GGUF |
| Clasificadores BERT pequeños | cientos de millones | corto | Etiqueta única | variable | safetensors, ONNX |

La comparación directa es difícil porque clef no compite en la misma categoría que un LLM generativo: no produce texto, no tiene formato de prompt y su salida es un vector de probabilidades por pregunta. Frente a clasificadores pequeños tipo BERT, clef ofrece mayor capacidad de razonamiento y multimodalidad a cambio de un coste de inferencia mucho mayor (27B frente a cientos de millones de parámetros). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no hay chat, ni completion, ni formato de prompt; usarlo como generador de texto no es posible.
- Sin imatrix: todas las cuantizaciones son estáticas; las de menos de 4 bits por peso (Q3_K_L, Q3_K_M, IQ3_M, Q3_K_S, Q2_K) pierden calidad de forma más acusada que sus equivalentes calibradas. El autor recomienda Q4_K_M o superior.
- Métricas de calidad no medibles: perplexity y KL divergence no aplican, por lo que no hay forma objetiva de comparar cuantizaciones para este modelo.
- Head de decisión fijado en Q8_0: no se puede reducir sin riesgo no cuantificado.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe más allá de lo que el backbone Qwen aporte.
- Longitud de contexto no documentada: planificar los estados de entrada con margen y validar empíricamente.
- Riesgo de calibración: al devolver probabilidades, los umbrales de decisión deben ajustarse por dominio; no se publican curvas de calibración.
- Sesgos: no se documentan evaluaciones de sesgo ni de robustez; hereda los del backbone y los datos de post-entrenamiento, no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `Cloudflare/clef` y del backbone subyacente.
- Requiere `llama-server` con soporte del endpoint `/v1/systemone` (b11430 o superior); otros runtimes no están documentados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Cloudflare_clef-GGUF
- Modelo original: https://huggingface.co/Cloudflare/clef
- Fichero recomendado Q4_K_M: https://huggingface.co/bartowski/Cloudflare_clef-GGUF/blob/main/Cloudflare_clef-Q4_K_M.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp usado para cuantizar (b11430): https://github.com/ggml-org/llama.cpp/releases/tag/b11430
- README de llama-server (endpoint `/v1/systemone`): https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
- API TypeSafe System One: https://docs.typesafe.ai/api
