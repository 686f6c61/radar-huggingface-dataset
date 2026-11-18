# sebekblessing/anima-chat-models

## Resumen

`sebekblessing/anima-chat-models` es un repositorio de pesos cuantizados en formato GGUF pensado para la aplicacion movil Anima (Android), que ejecuta modelos de lenguaje en la unidad neuronal Hexagon de los SoC Qualcomm Snapdragon. No es un modelo entrenado por el autor, sino un empaquetado y distribucion de dos modelos conversacionales de terceros: `inclusionAI/Ling-3.0-tiny` en cuantizacion Q4_0 (con pesos de atencion en f16) y Qwen3.5 0.8B en Q8_0. El repositorio ocupa 5,3 GB y declara 7.893.392.800 parametros en sus metadatos de safetensors, cifra que corresponde al modelo mayor (Ling-3.0-tiny) y no al conjunto del repositorio.

La relevancia de este repositorio es practica y de nicho: demuestra un flujo de despliegue de LLM en dispositivo (on-device) sobre el backend Hexagon de llama.cpp, con soporte para Hexagon v79 (Snapdragon 8 Elite) y v81 (Snapdragon 8 Elite Gen 5) sin necesidad de compilar una variante distinta por chip. Cada carpeta incluye un `manifest.json` con tamano y SHA-256 del fichero para verificacion de integridad tras la descarga.

El repositorio tiene cero descargas y cero likes en el momento de la consulta, y una licencia "other" con nombre `per-model`, lo que implica que cada modelo empaquetado conserva su licencia original: MIT para Ling-3.0-tiny y Apache 2.0 para Qwen3.5 0.8B. La documentacion disponible no detalla arquitectura interna, datos de entrenamiento ni benchmarks de los modelos empaquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio empaqueta dos modelos distintos; no se documenta la arquitectura interna de cada uno) |
| Parametros totales | 7.893.392.800 (dato de safetensors, correspondiente al modelo mayor, Ling-3.0-tiny); Qwen3.5 0.8B: aproximadamente 0,8 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 con pesos de atencion de 16 filas y por cabeza en f16 (Ling-3.0-tiny, 4,5 GB); Q8_0 (Qwen3.5 0.8B, 0,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | per-model: MIT para Ling-3.0-tiny; Apache 2.0 para Qwen3.5 0.8B |
| Formato de pesos | GGUF (llama.cpp); el repositorio declara 5,3 GB en total |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye dos modelos de terceros convertidos a GGUF para su uso con llama.cpp sobre el backend Hexagon. El modelo principal es `inclusionAI/Ling-3.0-tiny`, cuantizado a Q4_0 pero manteniendo en f16 los pesos de atencion de 16 filas y por cabeza, una decision de ingenieria destinada a que todas las matrices se ejecuten en la unidad Hexagon del telefono. El modelo secundario es Qwen3.5 0.8B en Q8_0, orientado a dispositivos con menos memoria.

La informacion proporcionada no incluye detalles sobre la arquitectura interna de Ling-3.0-tiny ni de Qwen3.5 0.8B (tipo de transformer, mecanismos de atencion, uso de MoE), ni sobre el volumen o composicion de los datos de entrenamiento, ni sobre procesos de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas de decodificacion o atencion en el repositorio. El unico detalle tecnico diferencial documentado es el soporte del backend Hexagon de llama.cpp para Hexagon v79 y v81 sin recompilacion por chip.

## Capacidades

- Generacion de texto conversacional: ambos modelos estan etiquetados como "conversational" y se distribuyen como modelos de chat para la aplicacion Anima.
- Ejecucion en dispositivo: inferencia local en la unidad neuronal Hexagon de Snapdragon 8 Elite (v79) y Snapdragon 8 Elite Gen 5 (v81) mediante llama.cpp.
- Verificacion de integridad de la descarga: cada carpeta incluye `manifest.json` con tamano y SHA-256 del fichero de pesos.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Aplicacion de chat movil sin conexion: integracion en la app Anima para Android, que descarga los pesos y ejecuta la inferencia en la NPU Hexagon del telefono, evitando enviar conversaciones a servidores externos.
- Despliegue en dispositivos de gama alta con Snapdragon 8 Elite: uso del modelo Ling-3.0-tiny en Q4_0 (4,5 GB), adecuado para telefonos con memoria suficiente que necesiten mayor capacidad conversacional.
- Despliegue en dispositivos con memoria limitada: uso de Qwen3.5 0.8B en Q8_0 (0,8 GB) como modelo de respaldo cuando el telefono no puede cargar el modelo mayor.
- Distribucion de modelos con verificacion criptografica: el `manifest.json` con SHA-256 permite a la aplicacion validar que la descarga no se ha corrompido ni manipulado, un patron reutilizable en pipelines de distribucion de pesos a clientes moviles.
- Prototipado de inferencia en NPU Qualcomm: el repositorio sirve como referencia para probar el backend Hexagon de llama.cpp en las versiones v79 y v81 sin mantener builds separadas por chip.
- Evaluacion comparativa de cuantizaciones en dispositivo: la convivencia de Q4_0 con atencion en f16 y Q8_0 permite medir el compromiso entre tamano, latencia y calidad en hardware movil real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: Ling-3.0-tiny Q4_0 ocupa 4,5 GB de fichero de pesos; Qwen3.5 0.8B Q8_0 ocupa 0,8 GB. El repositorio completo son 5,3 GB.
- Hardware objetivo: SoC Qualcomm Snapdragon 8 Elite (Hexagon v79) y Snapdragon 8 Elite Gen 5 (Hexagon v81), ejecutando el backend Hexagon de llama.cpp.
- GPU de escritorio: no disponible; el repositorio esta orientado a la NPU Hexagon de telefonos Android, no a GPU de servidor o consumer.
- Opciones de despliegue: llama.cpp con backend Hexagon; la aplicacion Anima (repositorio `adiirfan/anima-android`) como cliente de referencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion en este repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-tiny (empaquetado aqui) | 7.893.392.800 | no disponible | Q4_0 con atencion f16 | MIT | Hugging Face (`inclusionAI/Ling-3.0-tiny`) |
| Qwen3.5 0.8B (empaquetado aqui) | aproximadamente 0,8 mil millones | no disponible | Q8_0 | Apache 2.0 | Hugging Face (repo original no indicado en la informacion) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo propio: cualquier limitacion de Ling-3.0-tiny o de Qwen3.5 0.8B se hereda, y la documentacion aqui no las detalla.
- La licencia "other" con nombre `per-model` obliga a consultar la licencia de cada modelo empaquetado (MIT y Apache 2.0 respectivamente) antes de un uso comercial o de redistribucion.
- El uso esta ligado al backend Hexagon de llama.cpp y a los chips Snapdragon 8 Elite (v79) y 8 Elite Gen 5 (v81); no se documenta compatibilidad con otras NPU, GPU o CPU.
- El modelo mayor requiere 4,5 GB de almacenamiento y memoria suficiente en el telefono; el modelo menor existe precisamente por las restricciones de memoria de dispositivos inferiores.
- No hay informacion sobre sesgos, tasa de alucinacion, cobertura idiomatica ni comportamiento en contextos largos.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por terceros.
- Los pesos empaquetados anteriormente vivian en `anima-qnn-8elite`, que los conserva para versiones antiguas de la aplicacion; conviene verificar cual es la fuente canonica antes de integrar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sebekblessing/anima-chat-models
- Modelo original Ling-3.0-tiny: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Aplicacion Anima para Android: https://github.com/adiirfan/anima-android
- Repositorio previo con los mismos pesos: https://huggingface.co/sebekblessing/anima-qnn-8elite
- Licencia del repositorio: https://huggingface.co/sebekblessing/anima-chat-models/blob/main/README.md
