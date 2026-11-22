# mradermacher/Qwen3.5-4B-Amadeus-i1-GGUF

## Resumen

Qwen3.5-4B-Amadeus-i1-GGUF es una cuantizacion GGUF en formato imatrix del modelo Jitheswar/Qwen3.5-4B-Amadeus, un derivado "abliterated" y "decensored" de la familia Qwen3.5 de 4B parametros. El trabajo lo firma mradermacher, un cuantizador conocido en el ecosistema open source por publicar versiones GGUF de alta calidad con matrices de importancia (imatrix) para modelos populares. El modelo base conserva la arquitectura transformer y la ventana de vision del Qwen3.5 original, pero ha sido modificado para eliminar los mecanismos de rechazo y censura, lo que lo hace util para investigacion sobre alineamiento y para aplicaciones donde las respuestas excesivamente cautas resultan problematicas.

Con 4.326.350.848 parametros totales, este modelo se situa en el rango de los 4B, lo que lo convierte en una opcion ligera y desplegable en hardware de consumo. La cuantizacion imatrix permite reducir el peso a entre 2,1 GB (i1-Q2_K) y 3,7 GB (i1-Q6_K) manteniendo una calidad razonable, lo que facilita su ejecucion en GPUs consumer como la RTX 3060 o superiores. El repositorio ocupa 39,2 GB porque incluye multiples variantes de cuantizacion.

La relevancia actual de esta ficha radica en que combina tres tendencias del ecosistema: la familia Qwen3.5 (con soporte de vision y contexto largo), las tecnicas de abliteration para eliminar rechazos, y el formato GGUF optimizado con imatrix para inferencia local eficiente. Es un modelo pensado para desarrolladores que necesitan un asistente conversacional sin restricciones excesivas en entornos controlados, y para investigadores que estudian el comportamiento de modelos "decensored".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-4B), con soporte de vision |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); versiones estaticas en el repo Qwen3.5-4B-Amadeus-GGUF |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Jitheswar/Qwen3.5-4B-Amadeus es un derivado de la familia Qwen3.5 de 4B parametros. La arquitectura es un transformer denso (no MoE) con 4.326 millones de parametros, e incluye capacidades de vision segun los tags del repositorio ("vision"). El proceso de "abliteration" consiste en identificar y eliminar la direccion de activacion asociada al rechazo de peticiones, de modo que el modelo deja de negarse a responder ciertos temas. El tag "decensored" indica que se ha aplicado un proceso adicional para reducir respuestas moralizantes o excesivamente cautas.

Los datos de entrenamiento del modelo base no estan detallados en la informacion proporcionada. Los datasets listados (mlabonne/harmless_alpaca y mlabonne/harmful_behaviors) son tipicos en procesos de abliteration y evaluacion de comportamientos, pero no se especifica el numero de tokens ni la composicion exacta. No se dispone de informacion sobre RLHF, DPO u otras tecnicas de alineamiento aplicadas tras la abliteration. La cuantizacion imatrix de mradermacher utiliza matrices de importancia calculadas sobre el modelo base para preservar mejor la calidad en cuantizaciones bajas, una tecnica que mejora la perplejidad respecto a cuantizaciones estaticas del mismo tamano.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y otros idiomas (multilingual).
- Razonamiento y respuesta a preguntas generales, con la salvedad de que la abliteration puede afectar a la coherencia en temas sensibles.
- Capacidades de vision heredadas del Qwen3.5-4B original (procesamiento de imagenes, segun el tag "vision").
- Soporte de tool calling / function calling heredado de la familia Qwen3.5 (no confirmado explicitamente en la informacion disponible).
- Capacidades de agente y razonamiento multi-paso (no confirmado explicitamente en la informacion disponible).
- Modo "uncensored": responde a peticiones que el modelo original rechazaria, util para investigacion sobre alineamiento.
- Capacidades multilingues limitadas a los idiomas del modelo base (en, zh y otros no especificados).

## Casos de uso

- Investigacion sobre alineamiento y abliteration: el modelo permite estudiar como la eliminacion de la direccion de rechazo afecta a la coherencia, la utilidad y la seguridad de las respuestas, comparandolo con el Qwen3.5-4B original.
- Asistente conversacional sin restricciones en entornos controlados: para prototipos internos donde las negativas del modelo base interrumpen flujos de trabajo legitimos (por ejemplo, redaccion creativa de ficcion con temas adultos).
- Despliegue local en hardware de consumo: con cuantizaciones de 2,1 a 3,7 GB, cabe en GPUs como la RTX 3060 (12 GB) o incluso en CPU con llama.cpp, lo que permite ejecutar un asistente de 4B sin conexion.
- Procesamiento de imagenes en local: gracias al soporte de vision heredado, puede usarse para descripcion de imagenes, OCR basico o respuesta a preguntas visuales en entornos sin acceso a APIs externas.
- Generacion de contenido multilingue: para traduccion y redaccion en ingles y chino, aprovechando el soporte multilingual del modelo base.
- Evaluacion de riesgos en pipelines de moderacion: sirve como modelo "adversario" para probar sistemas de moderacion y detectar fallos en filtros de contenido.
- Fine-tuning posterior: al ser un GGUF, no es ideal para reentrenamiento, pero el modelo base en safetensors (Jitheswar/Qwen3.5-4B-Amadeus) puede usarse como punto de partida para ajustes con LoRA en tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,1 GB (i1-Q2_K) y 3,7 GB (i1-Q6_K) solo para los pesos; anadir 1-2 GB para el contexto KV cache segun la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para mayor velocidad; A100 o H100 solo si se necesita throughput alto en servidor.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 6 GB o mas de VRAM usando cuantizaciones Q4 o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (endpoints_compatible segun los tags). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda llama.cpp para produccion local.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Amadeus-i1-GGUF (este) | 4,33B | no disponible | apache-2.0 | GGUF (imatrix) | Abliterated, vision, multilingual |
| Qwen3.5-4B-Amadeus-GGUF (estatico) | 4,33B | no disponible | apache-2.0 | GGUF (estatico) | Misma base, cuantizacion sin imatrix |
| Jitheswar/Qwen3.5-4B-Amadeus | 4,33B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar |
| Qwen/Qwen3.5-4B | 4,33B | no disponible | apache-2.0 | safetensors | Modelo original con alineamiento completo |

No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes. La diferencia principal entre el modelo original y el Amadeus es la eliminacion de rechazos, que puede afectar a la calidad en tareas que requieren juicio etico o cautela.

## Limitaciones y advertencias

- La abliteration y el proceso "decensored" pueden degradar la coherencia y la calidad de las respuestas en temas sensibles, y aumentar el riesgo de alucinacion en areas donde el modelo original era mas cauto.
- Riesgo de generar contenido ofensivo, ilegal o danino: el modelo ha sido modificado para eliminar rechazos, por lo que no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Sesgos conocidos: hereda los sesgos del Qwen3.5-4B original, y la abliteration puede amplificar sesgos al eliminar la cautela en temas controvertidos.
- Limitaciones de contexto e idioma: el contexto maximo no esta especificado en la informacion disponible; los idiomas confirmados son en, zh y multilingual, sin garantia de calidad en castellano.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; el uso en produccion es responsabilidad del desplegador.
- Caveat importante: al ser un GGUF cuantizado, la calidad se reduce respecto al modelo en safetensors, especialmente en cuantizaciones Q2 y Q3; se recomienda Q4_K_M o superior para uso en produccion.
- El repositorio ocupa 39,2 GB por incluir todas las variantes; descargar solo la cuantizacion necesaria para ahorrar espacio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-Amadeus-i1-GGUF
- Modelo base: https://huggingface.co/Jitheswar/Qwen3.5-4B-Amadeus
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-4B-Amadeus-GGUF
- Pagina de descargas convenientes: https://hf.tst.eu/model#Qwen3.5-4B-Amadeus-i1-GGUF
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
