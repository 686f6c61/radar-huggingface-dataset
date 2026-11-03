# maximedubourg/regex-sft-qwen3.5-0.8b-onnx

## Resumen

regex-sft-qwen3.5-0.8b-onnx es un ajuste fino supervisado (SFT con LoRA) del modelo base Qwen/Qwen3.5-0.8B, especializado en una tarea concreta: convertir una descripcion en lenguaje natural (en ingles, opcionalmente con cadenas de ejemplo) en un literal de expresion regular de JavaScript (ECMAScript 2018), por ejemplo `/^\d{5}$/`. Lo desarrolla el usuario de HuggingFace maximedubourg y se distribuye como exportacion ONNX de solo texto, pensada para ejecutarse en el navegador mediante Transformers.js, con variantes cuantizadas en 4 bits.

El modelo resuelve un problema acotado y muy practico: la generacion de regex correctas es una tarea propensa a errores para los LLM generalistas, y este ajuste concentra la capacidad del modelo base de 0,8 mil millones de parametros en ese dominio. La relevancia actual radica en su formato de despliegue: al ser un ONNX de 584-648 MB en 4 bits, puede ejecutarse del lado del cliente (WebGPU o WASM) sin enviar datos a un servidor, lo que encaja en editores, validadores de formularios o herramientas de desarrollador integradas en el navegador.

El repo pesa 1,3 GB e incluye tres variantes de cuantizacion (q4f16, q4 y una build para WASM/CPU). La licencia es Apache 2.0, heredada del modelo base. No se han publicado datos sobre idiomas soportados mas alla del ingles en el que estan redactados los prompts de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), exportado a ONNX; grafo de onnx-community/Qwen3.5-0.8B-ONNX sin codificador de vision |
| Parametros totales | 0,8 mil millones (modelo base Qwen/Qwen3.5-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | 4 bits (MatMulNBits, bloques de 32); variantes q4f16 (584 MB), q4 (648 MB) y q4 con embed_tokens en uint8 para WASM (648 MB) |
| Idiomas soportados | no disponible; los prompts de entrenamiento estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformers.js); sin safetensors ni GGUF en el repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only, y se ajusta con LoRA mediante SFT sobre aproximadamente 9.400 ejemplos sinteticos de pares descripcion → regex, en su mayoria generados por DeepSeek, mas unos 1.100 escritos por Claude. El filtrado de datos es estricto: cada ejemplo se conserva solo si su regex pasa las cadenas de prueba escritas en una llamada separada (sin ver la regex) y si regexes triviales o mutadas fallan al menos una de esas pruebas. Este esquema de validacion cruzada reduce el ruido del dataset sintetico.

La exportacion a ONNX reutiliza el grafo de onnx-community/Qwen3.5-0.8B-ONNX (sin encoder de vision) y sustituye las matrices afectadas por el LoRA por las versiones ajustadas, cuantizadas de la misma forma (MatMulNBits, 4 bits, bloques de 32). Para la build WASM, que carece del kernel `GatherBlockQuantized` usado por `embed_tokens_q4`, se emplea `embed_tokens_uint8`, que empaqueta los mismos pesos de 4 bits dos por byte y los desquantiza con operadores estandar, con salidas identicas bit a bit. El prompt de inferencia usa la plantilla de chat de Qwen con el modo thinking desactivado (termina en `<|im_start|>assistant\n<think>\n\n</think>\n\n`) y decodificacion greedy.

## Capacidades

- Generacion de expresiones regulares de JavaScript (ECMAScript 2018) a partir de una descripcion en lenguaje natural en ingles.
- Aceptacion opcional de cadenas de ejemplo junto con la descripcion para guiar la regex generada.
- Salida en formato de literal regex (por ejemplo `/^\d{5}$/`), lista para insertar en codigo JavaScript.
- Generacion de texto conversacional basica heredada del modelo base Qwen3.5-0.8B.
- Ejecucion en navegador mediante Transformers.js, con backend WebGPU (q4f16, q4) o WASM/CPU (variante uint8).
- Capacidad multimodal image-text-to-text declarada en los tags del repo, aunque el export ONNX es de solo texto (sin encoder de vision).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Validacion de formularios en el navegador: el usuario describe el patron deseado ("codigo postal espanol de cinco digitos") y el modelo devuelve una regex que se aplica inmediatamente en cliente, sin enviar datos a un servidor gracias a la ejecucion via Transformers.js con WebGPU o WASM.
- Asistentes de editor de codigo: integracion en un IDE web o playground que sugiera regex a partir de comentarios o descripciones, con la ventaja de que el modelo cabe en 584-648 MB y no requiere backend.
- Herramientas de busqueda y filtrado: generacion de patrones para buscar en logs, ficheros o tablas a partir de una necesidad expresada en lenguaje natural, con cadenas de ejemplo como ancla.
- Educacion y aprendizaje de regex: el modelo produce un candidato que el estudiante puede probar y corregir, util en entornos docentes donde no se quiere depender de una API externa.
- Procesamiento de datos en pipelines ligeros: generacion de regex para tareas de extraccion o limpieza en scripts Node.js, ejecutando el modelo localmente en el mismo runtime.
- Prototipado rapido de parsers: dado un conjunto de cadenas de ejemplo, obtener una primera regex que el desarrollador refina y valida con tests propios, reduciendo el tiempo de arranque en tareas de parsing ad hoc.
- Extensiones de navegador: cualquier插件 que necesite transformar descripciones en patrones de busqueda sin conexion ni coste de inferencia en la nube.

## Benchmarks y rendimiento

Los datos publicados por el autor miden la proporcion de regexes que pasan todas las pruebas ocultas:

| Modelo | regex101 (400 necesidades reales) | held-out (442 sinteticos) |
|---|---|---|
| Este modelo, MLX bf16 | 26,0 % | 73,8 % |
| Este modelo, ONNX q4f16 | 24,0 % | 71,7 % |
| Este modelo, ONNX q4 | 24,2 % | 71,0 % |
| SFT Qwen3-0.6B previo (fp16) | 22,8 % | no disponible |

El conjunto regex101 usa necesidades de la libreria de la comunidad regex101, con descripciones, regex de referencia y tests reescritos por otra familia de modelos. El conjunto held-out sigue la misma distribucion que los datos de entrenamiento pero no se uso en el entrenamiento. Segun el autor, el modelo acierta plenamente en torno a 4 de cada 10 peticiones simples de regex101, aproximadamente 1 de cada 8 de dificultad intermedia, y casi nunca en las dificiles (lookarounds, backreferences, rangos numericos).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional si se ejecuta en navegador; en GPU, las variantes de 4 bits ocupan 584 MB (q4f16) o 648 MB (q4), mas overhead de runtime.
- GPU recomendadas: cualquier GPU con soporte WebGPU y, para q4f16, la caracteristica `shader-f16`; en servidor, GPUs consumer y profesionales estandar son suficientes dado el tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con WebGPU; la variante WASM funciona en CPU sin GPU.
- Opciones de despliegue: Transformers.js con backend WebGPU o WASM; el formato ONNX tambien permite otros runtimes ONNX, aunque la informacion disponible solo documenta Transformers.js.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| regex-sft-qwen3.5-0.8b-onnx | 0,8 B | no disponible | SFT especializado en regex JS, ONNX 4 bits para navegador | Apache 2.0 | HuggingFace (repo propio) |
| SFT Qwen3-0.6B previo (fp16) | 0,6 B | no disponible | SFT especializado en regex, version anterior del mismo autor | no disponible | no disponible en detalle |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | LLM generalista; genera regex sin ajuste especifico | Apache 2.0 (segun repo derivado) | HuggingFace |
| onnx-community/Qwen3.5-0.8B-ONNX | 0,8 B | no disponible | Export ONNX del base, sin ajuste de regex | no disponible | HuggingFace |

El modelo supera a la version previa SFT Qwen3-0.6B en el conjunto regex101 (26,0 % frente a 22,8 % en bf16), aunque la comparacion no es perfecta porque la version previa se evaluo en fp16 y el conjunto held-out no esta disponible para ella.

## Limitaciones y advertencias

- Rendimiento limitado en peticiones de dificultad intermedia y muy bajo en las dificiles (lookarounds, backreferences, rangos numericos): el propio autor recomienda probar siempre el resultado.
- Los errores suelen ser regex casi correctas, lo que puede dar falsa confianza; es imprescindible validar con tests propios antes de produccion.
- Entrenado con descripciones en ingles; no hay datos sobre calidad en castellano u otros idiomas.
- Dataset sintetico generado por DeepSeek y Claude: puede heredar sesgos o patrones de esas familias de modelos y no cubre necesariamente todos los casos reales.
- El export ONNX es de solo texto: aunque los tags incluyen image-text-to-text, no hay encoder de vision en el grafo.
- La build WASM requiere la variante con `embed_tokens` en uint8; usar la variante q4 estandar en WASM no funcionara por falta del kernel `GatherBlockQuantized`.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B y de los datos sinteticos.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente de los benchmarks.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maximedubourg/regex-sft-qwen3.5-0.8b-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Export ONNX de referencia: https://huggingface.co/onnx-community/Qwen3.5-0.8B-ONNX
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js/index
