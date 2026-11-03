# Mihir-Karbelkar/ant-15m-site-qa

## Resumen

Ant 15M site QA es un modelo de lenguaje decoder de 14,9 millones de parámetros desarrollado por Mihir Karbelkar, entrenado desde cero para responder preguntas de visitantes de un sitio web a partir de pasajes recuperados por un sistema RAG, y para rechazar la respuesta cuando los pasajes no la contienen. Su interés principal es que demuestra que un modelo con arquitectura híbrida (atención + Mamba2) puede ejecutarse íntegramente en el navegador mediante onnxruntime-web sobre el backend WASM, sin necesidad de WebGPU, en un único fichero int8 de 21 MB.

El modelo es el sucesor de Tiny 30M site QA: reduce a la mitad los parámetros y el tamaño de descarga, es más rápido por token y obtiene resultados iguales o mejores en las preguntas reales del sitio. La arquitectura alterna ocho capas de atención y Mamba2 en el patrón AMAMAMAM, con dimensión 320, MLP SwiGLU de 704 unidades ocultas, RMSNorm pre-norm y embeddings BPE a nivel de byte de 16K con pesos atados.

Se distribuye bajo licencia Apache-2.0 y está pensado como experimento reproducible de modelos pequeños en el borde (edge), no como asistente de producción. Su relevancia actual radica en el creciente interés por SLMs desplegables en cliente y por arquitecturas híbridas SSM/atención que reducen el coste de inferencia en contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido decoder: 8 capas alternando atención y Mamba2 (AMAMAMAM), SwiGLU MLP (hidden 704), RMSNorm pre-norm |
| Parametros totales | 14,9 M (14.900.000 aprox.) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; entrenado con secuencias de 1024 tokens y prompt recomendado de ~2.000 caracteres de pasajes |
| Tipos de cuantizacion | int8 dinámica con escalas por canal, precedida de SmoothQuant; se distribuye un único fichero int8 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (decoder.int8.onnx, un solo grafo) con metadatos de estados en meta.json; el modelo base se entrenó en PyTorch |

## Arquitectura y entrenamiento

La arquitectura consta de ocho capas que alternan atención y Mamba2. Las capas de atención usan grouped-query attention con 8 cabezas de consulta y 2 de clave-valor de dimensión 64, QK-norm y RoPE. Las capas Mamba2 (SSD) tienen factor de expansión 2 (640 interno), 10 cabezas de 64, estado 64 y convolución 4. Cada capa va seguida de un MLP SwiGLU con 704 unidades ocultas. La decisión de intercalar atención con Mamba2 proviene de una búsqueda de arquitecturas a 15M de parámetros con ocho patrones de igual tamaño y datos: solo atención, atención en los extremos con GRU, Mamba2, Gated DeltaNet o RWKV-7 en el centro, y mezclas. El patrón ganador se justifica porque las capas de atención seleccionan el pasaje que contiene la respuesta y copian de él, mientras que las capas Mamba2 sostienen la decisión de si los pasajes responden o no.

El preentrenamiento usó 2,9 mil millones de tokens de FineWeb-Edu (60%) y FineWeb (40%, sesgado hacia páginas estructuradas), con secuencias de 1024 tokens, 262K tokens por paso, AdamW con lr 3e-3 y decaimiento coseno, alcanzando una pérdida de validación de 3,39 nats/token. El ajuste fino empleó los mismos ~171K ejemplos "evidence-first" que Tiny 30M ronda 3, generados con Qwen3-8B (Apache-2.0) sobre páginas de FineWeb y verificados. La exportación aplica SmoothQuant (reescritura exacta de pesos que desplaza los valores atípicos de activación a los pesos) seguida de cuantización dinámica int8 con escalas por canal; la cuantización int8 por tensor simple perdía la mayoría de respuestas del sitio, mientras que esta versión iguala a fp32 en las preguntas del sitio.

## Capacidades

- Generación de texto extractiva orientada a question answering sobre pasajes: produce primero una cita textual (`Source N: "span exacto"`) y después una respuesta de una o dos frases.
- Rechazo explícito: emite `Source: none` y `Answer: The context does not say.` cuando los pasajes no contienen la respuesta; el autor recomienda puntuar la probabilidad de `Source: none` tras el prompt y rechazar si es ≥ 0,3.
- Conversación trivial acotada: responde a small talk con el prefijo `Chat:` sin afirmar hechos.
- Control de citación mediante decodificación restringida: se prohíbe `:` inmediatamente después del primer token `Source` para forzar la cita de un número de fuente.
- Ejecución en navegador: inferencia en onnxruntime-web sobre WASM, sin WebGPU, con un único grafo que procesa el prompt y cada token nuevo.
- Gestión de estado incremental: caché KV por capa de atención y estado convolucional más estado SSM de tamaño fijo por capa Mamba2, lo que permite leer el prompt en un solo paso o en fragmentos de ~256 tokens.
- Capacidades multilingües: no disponibles; solo inglés.
- Tool calling, function calling, agentes multi-paso, visión y audio: no disponibles.

## Casos de uso

- Chat on-device en un sitio web personal: el modelo responde preguntas de visitantes usando pasajes recuperados por el propio sitio, con el fichero int8 de 21 MB descargado en el navegador y ejecutado sobre WASM; es el uso real en mihirkarbelkar.com.
- Asistente de documentación técnica en el navegador: integrar el modelo en un portal de docs para responder preguntas sobre la API a partir de fragmentos de la documentación, mostrando siempre las fuentes citadas y rechazando cuando la documentación no cubre la pregunta.
- RAG de bajo coste en el borde: desplegar el modelo en dispositivos con recursos limitados (portátiles, móviles de gama media) donde no es viable un LLM de miles de millones de parámetros, aprovechando los ~3,4 ms por token en CPU de un hilo.
- Filtro de abstención en pipelines RAG: usar la probabilidad de `Source: none` como señal de rechazo (AUROC 0,986 en páginas retenidas) para decidir si derivar la consulta a un modelo mayor o a un humano.
- Demostración educativa de arquitecturas híbridas: servir como referencia reproducible para estudiar el intercalado atención/Mamba2 a escala 15M, con código de trabajador web de referencia en el portfolio del autor.
- Verificación de citas en respuestas generadas: el formato evidence-first y la comprobación de que la cita aparece realmente en la fuente citada permiten construir un verificador ligero que descarte respuestas no sustentadas antes de mostrarlas.
- Prototipado rápido de QA extractivo sobre corpus pequeños: ajustar o evaluar el modelo sobre conjuntos de pasajes propios para medir la viabilidad de un SLM antes de invertir en modelos mayores.

## Benchmarks y rendimiento

| Métrica | Ant 15M | Tiny 30M |
|---|---|---|
| Parámetros / descarga int8 | 14,9 M / 21 MB | 30,5 M / 44 MB |
| Preguntas del sitio correctas / incorrectas mostradas (24 respondibles) | 9 / 9 | 8 / 10 |
| AUROC de rechazo (páginas retenidas) | 0,986 | 0,990 |
| F1 de respuesta (retenido) | 0,29 / 0,30 | 0,32 / 0,31 |
| Rechazo en casi-aciertos / fuera de tema | 0,97 / 0,96 | 0,96 / 0,98 |
| HellaSwag / ARC-Easy / PIQA (zero-shot, base) | 36,1 / 39,1 / 57,4 | 36,9 / 41,0 / 59,2 |

Mediciones en PyTorch con umbral 0,3. El fichero int8 sobre las preguntas del sitio obtiene 10 correctas y 8 incorrectas mostradas. Velocidad en onnxruntime CPU, 1 hilo, int8: ~0,3 s para un prompt de 512 tokens y ~3,4 ms por token.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo se ejecuta en CPU. El fichero int8 ocupa 21 MB y los estados por capa son pequeños (caché KV creciente por capa de atención; conv `(1, 768, 3)` y SSM `(1, 10, 64, 64)` fijos por capa Mamba2).
- GPU recomendadas: no necesarias; el autor no reporta requisitos de GPU. La ejecución objetivo es onnxruntime-web sobre WASM en el navegador.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso; cualquier GPU moderna podría ejecutarlo, pero no es el escenario previsto.
- Opciones de despliegue: onnxruntime (CPU) y onnxruntime-web con backend WASM; el autor referencia una implementación en `src/workers/tiny.worker.ts` del portfolio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~0,3 s para un prompt de 512 tokens y ~3,4 ms por token en CPU de un hilo con int8; el prompt puede procesarse en fragmentos de ~256 tokens para abaratar la forma de prompt de Mamba2 en contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Descarga int8 | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ant 15M site QA | 14,9 M | ~1024 tokens de entrenamiento | 21 MB | Apache-2.0 | Híbrido atención + Mamba2, QA extractivo en navegador |
| Tiny 30M site QA | 30,5 M | no disponible | 44 MB | no disponible en la información | Predecesor directo, QA extractivo en navegador |
| Qwen3-8B | 8 B | no disponible en la información | no disponible | Apache-2.0 | LLM generativo usado para generar los datos de ajuste fino |

La comparación se limita al predecesor del mismo autor y al modelo generador de datos; no se dispone de datos de otros SLM comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente de producción: el propio autor indica que en un sitio personal real acierta bastante menos de la mitad de las preguntas factuales.
- Puede citar una frase real pero irrelevante y responder a partir de ella; la comprobación de que la cita aparece en la fuente no detecta este fallo.
- El F1 de respuesta en datos retenidos es bajo (0,29–0,30), lo que refleja respuestas extractivas cortas y sensibles al span exacto.
- Solo inglés; no hay soporte multilingüe.
- Riesgo de alucinación mitigado parcialmente por el formato evidence-first, el rechazo con `Source: none` y la verificación de citas, pero no eliminado.
- Sesgos heredados de FineWeb y FineWeb-Edu (datos de Common Crawl), no documentados por el autor.
- La cuantización es sensible: la versión int8 por tensor simple perdía la mayoría de respuestas; solo la variante con SmoothQuant y escalas por canal iguala a fp32 en las preguntas del sitio.
- Licencia Apache-2.0 permite uso comercial, pero los datos de preentrenamiento están bajo ODC-By 1.0 y sujetos a los términos de Common Crawl; conviene revisar la atribución.
- El modelo requiere un pipeline externo de recuperación de pasajes y un formato de prompt concreto (`[7] + sources + [3] + question + [2]`) para funcionar correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mihir-Karbelkar/ant-15m-site-qa
- Predecesor Tiny 30M: https://huggingface.co/Mihir-Karbelkar/tiny-30m-site-qa
- Sitio del autor con el chat on-device: https://mihirkarbelkar.com
- Qwen3-8B (generador de datos de ajuste fino): https://huggingface.co/Qwen/Qwen3-8B
- Licencia ODC-By 1.0: https://opendatacommons.org/licenses/by/1-0/
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
