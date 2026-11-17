# LlamaPal/Qwen3-4B-Freestyle-Q4_K_M-GGUF

## Resumen

Qwen3-4B-Freestyle-Q4_K_M-GGUF es una distribucion en formato GGUF cuantizado a Q4_K_M del modelo mlabonne/Qwen3-4B-abliterated, una version "abliterated" (con las direcciones de rechazo suprimidas) del Qwen3-4B de Alibaba. El repositorio, publicado por el usuario LlamaPal, no entrena ni modifica pesos: es un espejo byte a byte del fichero `mlabonne_Qwen3-4B-abliterated-Q4_K_M.gguf` alojado en bartowski/mlabonne_Qwen3-4B-abliterated-GGUF en el commit `22253b429533`, con el mismo hash SHA-256 (`004f7b8f...ca073b2`).

El modelo base Qwen3-4B es un transformer denso de 4.022.468.096 parametros, disenado por el equipo Qwen de Alibaba para generacion de texto, razonamiento y codigo, con soporte de modo "thinking" y capacidades multilingues. La variante abliterated elimina el comportamiento de rechazo mediante la tecnica de abliteration, lo que la hace util para investigacion sobre alineamiento y para aplicaciones donde el filtrado por defecto resulta demasiado restrictivo, a costa de perder las salvaguardas originales.

La relevancia de este repositorio es practica: ofrece una descarga estable y verificable de un fichero GGUF de 2,5 GB que cabe en GPUs de consumo y se ejecuta con llama.cpp, Ollama o cualquier runtime compatible con GGUF. La licencia Apache 2.0 permite uso comercial, aunque el caracter abliterated introduce consideraciones adicionales de responsabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-4B soporta contexto largo, pero el valor exacto no se confirma aqui) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3-4B-Freestyle-Q4_K_M.gguf`, 2,5 GB) |

## Arquitectura y entrenamiento

El repositorio no aporta informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento. Se sabe que el modelo subyacente es Qwen3-4B, un transformer denso de 4.022 millones de parametros, y que la variante intermedia (mlabonne/Qwen3-4B-abliterated) aplica abliteration: una tecnica de edicion de pesos que identifica la direccion del espacio de activaciones asociada al rechazo y la proyecta fuera, sin reentrenamiento adicional. El resultado conserva el conocimiento del modelo original pero reduce la probabilidad de respuestas de negativa.

El fichero GGUF ha sido cuantizado a Q4_K_M, un esquema de cuantizacion de 4 bits con mezcla de precision (algunas capas en 5 o 6 bits) que busca un equilibrio entre tamano y calidad. El autor del mirror no documenta el dataset de calibracion ni si se empleo imatrix, aunque la etiqueta `imatrix` aparece en los tags del repositorio, lo que sugiere que la cuantizacion pudo usar importance matrix. No hay datos sobre tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y resolucion de problemas (heredado del modelo base Qwen3-4B, que incluye modo thinking).
- Generacion de codigo y matematicas a nivel de modelo de 4B.
- Soporte multilingue (el modelo base Qwen3 es multilingue; los idiomas exactos no se detallan en esta ficha).
- Comportamiento abliterated: menor tendencia a rechazar peticiones, util para investigacion de alineamiento.
- Compatible con endpoints OpenAI-style segun el tag `endpoints_compatible`.
- No se documenta soporte explicito de tool calling, function calling ni vision en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration afecta al comportamiento de rechazo comparandolo con el Qwen3-4B original, en entornos controlados y con supervision humana.
- Prototipado local en equipos de consumo: con 2,5 GB en Q4_K_M, se ejecuta en GPUs con 6-8 GB de VRAM o incluso en CPU, lo que facilita pruebas rapidas sin infraestructura cloud.
- Generacion de texto creativo sin filtros excesivos: escritura de ficcion, guiones o dialogos donde el modelo base tiende a autocensurar contenido, siempre con revision editorial posterior.
- Asistente conversacional offline: despliegue con llama.cpp u Ollama en portatiles para tareas de resumen, reescritura y Q&A sobre documentos locales.
- Generacion de codigo asistida en local: autocompletado y explicacion de fragmentos en editores, aprovechando el conocimiento de codigo del modelo base, con la advertencia de que un 4B cuantizado a 4 bits no iguala a modelos mayores.
- Evaluacion comparativa de cuantizaciones: al ser un espejo verificable con hash, sirve como referencia reproducible en estudios sobre el impacto de Q4_K_M en la calidad frente a otros formatos.
- Base para fine-tuning ligero o experimentos de merging: el GGUF no es ideal para entrenamiento, pero el modelo original en safetensors (Qwen3-4B-abliterated) puede usarse como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio mirror no incluye evaluaciones propias ni del modelo abliterated, y no se dispone de datos verificables de MMLU, HumanEval, GSM8K u otras pruebas para esta cuantizacion concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB para el fichero Q4_K_M, mas overhead de contexto KV cache (dependiente de la longitud de contexto configurada).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2070); en GPUs de 8 GB o mas (RTX 3070, RTX 4060 Ti, RTX 4070) se puede ampliar el contexto sin problemas.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 6 GB o mas; tambien puede ejecutarse en CPU con llama.cpp a velocidades de pocos tokens por segundo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa (vLLM requiere adaptadores o el modelo en safetensors).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen fuertemente del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Freestyle-Q4_K_M (este) | 4,02B | No disponible | Q4_K_M GGUF | Apache 2.0 | Hugging Face (mirror) |
| mlabonne/Qwen3-4B-abliterated | 4,02B | No disponible | safetensors y GGUF | Apache 2.0 | Hugging Face |
| Qwen3-4B (original) | 4,02B | No disponible en esta ficha | safetensors, GGUF | Apache 2.0 | Hugging Face |
| Llama 3.2 3B Instruct | 3,2B | 128K (segun model card oficial) | GGUF, safetensors | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a parametros y licencia porque no hay benchmarks publicados para este mirror. Frente al Qwen3-4B original, la diferencia principal es el comportamiento abliterated; frente a Llama 3.2 3B, la licencia Apache 2.0 es mas permisiva para uso comercial sin restricciones de la licencia comunitaria de Meta.

## Limitaciones y advertencias

- Modelo abliterated: las salvaguardas de seguridad del Qwen3-4B original han sido suprimidas, por lo que puede generar contenido que el modelo base rechazaria. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: como todo modelo de 4B, tiende a inventar datos, especialmente en tareas factuales o de razonamiento complejo.
- Cuantizacion Q4_K_M: introduce perdida de calidad frente a los pesos originales en FP16/BF16, mas notable en matematicas y codigo.
- Idiomas: no se documentan los idiomas soportados; el modelo base Qwen3 es multilingue pero el rendimiento por idioma no esta verificado en esta cuantizacion.
- Contexto: la longitud de contexto efectiva del GGUF no se especifica; configurar contextos muy largos incrementa el consumo de VRAM por la KV cache.
- Licencia: Apache 2.0 permite uso comercial, pero el autor del mirror no asume responsabilidad sobre el contenido generado; el usuario debe evaluar el cumplimiento normativo en su jurisdiccion.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria; el fichero es verificable por hash pero no hay evidencia de uso en produccion.
- Sin soporte documentado de tool calling ni agentes: no se debe asumir su disponibilidad sin pruebas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/Qwen3-4B-Freestyle-Q4_K_M-GGUF
- Repositorio original del GGUF (bartowski): https://huggingface.co/bartowski/mlabonne_Qwen3-4B-abliterated-GGUF
- Commit exacto del fichero espejo: https://huggingface.co/bartowski/mlabonne_Qwen3-4B-abliterated-GGUF/tree/22253b429533b604f50239136fc6b03300bd9ac6
- Modelo abliterated de mlabonne: https://huggingface.co/mlabonne/Qwen3-4B-abliterated
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
