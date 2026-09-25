# SiliconSpecies/Swift-1.5-4bit-MLX-Splash

## Resumen

SiliconSpecies/Swift-1.5-4bit-MLX-Splash es un paquete de pesos preparado para Splash, el motor de inferencia de Inco AI para Apple Silicon. No es un modelo entrenado desde cero: es la conversion del fine-tune Swift-1.5 (publicado originalmente en formato MLX affine 4-bit por ukisai) al formato propietario `splash-packed-q4`, junto con el drafter DFlash 2 y la torre de vision copiados sin modificacion del paquete oficial Qwen3.8-27B de Inco AI. Ocupa 17,4 GB y se distribuye como cuantizacion uniforme de 4 bits (grupo 64, affine).

El problema que resuelve es concreto: permitir ejecutar localmente un modelo de la familia Qwen3.8-27B en un Mac con decodificacion especulativa y soporte multimodal, sin depender de la nube ni de GPUs NVIDIA. La relevancia es doble. Por un lado, aprovecha DFlash 2 para acelerar la generacion sobre hardware Apple. Por otro, demuestra una ruta de conversion en dos pasadas de 4 bits (MLX 4-bit a Splash 4-bit) que el autor documenta con metricas de fidelidad por seccion.

El modelo se publico el 24 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, con la propia model card anunciando pruebas y actualizaciones adicionales para el dia siguiente. Es, por tanto, un artefacto muy reciente y poco validado por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 64 capas, embedding y cabeza de salida; incluye torre de vision y drafter DFlash 2 para decodificacion especulativa. No se especifica si es denso o MoE |
| Parametros totales | alrededor de 27 000 millones segun la denominacion del modelo base (Qwen3.8-27B); la cifra exacta del paquete no esta disponible |
| Parametros activos | no disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | hasta 100 000 tokens mediante la opcion `--max-context 100K` de Splash; el valor por defecto no esta disponible |
| Tipos de cuantizacion | 4 bits uniforme, grupo 64, affine (`splash-packed-q4`, escala y sesgo en bf16). Origen: MLX affine 4-bit, grupo 64 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (`license: other`); condiciones comerciales no detalladas, consultar el archivo LICENSE |
| Formato de pesos | `splash-packed-q4`, exclusivo del motor Splash; no compatible con safetensors, GGUF ni MLX nativo |

## Arquitectura y entrenamiento

El paquete se compone de cuatro partes diferenciadas. El directorio `target/` contiene las 64 capas, el embedding y la cabeza de salida, procedentes de `ukisai/Swift-1.5-4bit-MLX` y requantizados a Splash 4-bit: esta es la unica conversion real del repositorio. El directorio `draft/` es una copia byte a byte de DFlash 2 (`incoai/Qwen3.8-27B-DFlash2`), el modelo borrador que habilita la decodificacion especulativa. El directorio `vision/` es copia identica de la torre de Qwen3.8-27B (333 de 333 tensores), ya que el fine-tune Swift-1.5 no la modifico. El `tokenizer/` se mantiene sin cambios salvo una linea del chat template, parcheada igual que en el paquete oficial para aceptar mensajes de sistema que no ocupen la primera posicion.

La conversion es una doble pasada de 4 bits: los valores MLX 4-bit se desquantizan y se requantizan a `splash-packed-q4` con grupo 64, escala y sesgo en bf16. El autor reporta que la segunda pasada es casi sin perdida: el peor coseno por seccion frente a la fuente desquantizada es 0,99941 en las 320 secciones cuantizadas, y 0,99943 en embedding y cabeza (relRMSE 0,034). El paquete hereda por tanto la fidelidad del release MLX 4-bit, cuya verificacion tensor a tensor contra el BF16 fijado `ukisai/Swift-1.5-Qwen3.8-27b` dio coseno entre 0,99335 y 0,99585 en 498 tensores cuantizados, relRMSE menor o igual a 0,116, y 353 tensores bf16 exactos. Los peores casos son matrices `in_proj` y `k_proj` de cola pesada en las capas superiores. La model card advierte de un detalle critico para quien intente replicar la conversion: todas las secciones bf16 de normalizacion almacenan gamma + 1, incluidas `query-norm` y `key-norm`, con `gdn-norm` como unica excepcion.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con plantilla de chat que implementa los niveles de esfuerzo `low`, `medium` y `xhigh` (por defecto `xhigh`; `high` y `max` son alias de `xhigh`, y `minimal` de `low`). Los niveles modifican las instrucciones de la plantilla, no un presupuesto de tokens, por lo que un esfuerzo mayor puede producir respuestas mas cortas.
- Entrada de imagen: el paquete incluye la torre de vision de Qwen3.8-27B, identica byte a byte. La model card no documenta de forma explicita el flujo multimodal, pero la presencia de la torre lo hace previsible.
- Decodificacion especulativa mediante DFlash 2, integrada en el motor Splash.
- Servidor compatible con la API de OpenAI en `http://127.0.0.1:8000/v1`, con endpoint `/v1/chat/completions` y uso directo desde cualquier cliente OpenAI.
- Interfaz web de chat servida en `http://127.0.0.1:8000` (desactivable con `--no-webui`).
- Integracion con agentes de codigo a traves de los comandos `splash claude`, `splash codex`, `splash opencode` y `splash hermes`.
- Autenticacion opcional por clave de API (`--api-key`).
- Soporte de function calling / tool calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no enumera idiomas.

## Casos de uso

- Inferencia local en Mac para desarrollo: levantar el servidor con `splash serve --model SiliconSpecies/Swift-1.5-4bit-MLX-Splash` y consumirlo como si fuese la API de OpenAI, sin enviar datos fuera del equipo. Es adecuado porque todo el paquete esta pensado para Apple Silicon y Metal.
- Asistencia de codigo en el terminal: conectar un agente mediante `splash claude`, `splash codex`, `splash opencode` o `splash hermes` contra el servidor en local. El modelo incluye el chat template parcheado precisamente para clientes que envian mensajes de sistema adicionales.
- Generacion de mensajes de commit en entornos JetBrains: la model card cita este flujo como motivo del parche del template, ya que la version sin parchear falla con `messages could not be rendered` en LM Studio.
- Analisis de documentos largos: con `--max-context 100K` se pueden procesar expedientes, informes o bases de codigo extensas en una sola ventana, aprovechando la decodificacion especulativa para mantener la velocidad.
- Prototipado de agentes multietapa con datos sensibles: al ejecutarse integramente en el equipo, permite iterar sobre flujos de razonamiento multi-paso sin salir a la nube. El nivel de esfuerzo `xhigh` es el valor por defecto y resulta adecuado para este tipo de tareas.
- Ajuste del coste de razonamiento por tarea: usar `low` o `medium` para clasificacion, resumen o extraccion, y `xhigh` para problemas de varios pasos, cambiando solo el parametro `reasoning_effort`.
- Experimentacion con cuantizacion y decodificacion especulativa: el repositorio documenta metricas de fidelidad por seccion y la reutilizacion del drafter, lo que lo convierte en un caso de estudio para investigar perdida en cuantizacion 4-bit sobre Apple Silicon.
- Evaluacion comparativa de motores de inferencia en Mac: al no cargar en Transformers, MLX ni llama.cpp, sirve para medir el rendimiento especifico del runtime Splash frente a alternativas en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de fidelidad de la conversion (coseno y relRMSE frente a los pesos de origen), no resultados de tareas como MMLU, HumanEval o GSM8K, ni cifras de latencia o throughput. La referencia a una seccion "Speed" en el documento original no incluye datos numericos en la informacion proporcionada.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (Metal). El paquete no carga en Transformers, MLX ni llama.cpp.
- Peso en disco y en memoria: 17,4 GB de pesos en 4 bits. La descarga inicial de 17,4 GB se realiza en el primer arranque.
- Memoria unificada recomendada: la model card sugiere `--max-memory 28G`, lo que apunta a Macs con 32 GB o mas de memoria unificada.
- Contexto: `--max-context 100K` para ventanas largas; un contexto mayor incrementa el consumo de memoria.
- GPU NVIDIA: no compatible. No hay soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no aplica; el modelo esta limitado a graficos integrados de Apple.
- Despliegue: Splash instalado via Homebrew (`brew install incoai/tap/splash`) o el runtime Splash de LM Studio Bionic 1.1.5 o posterior (Ajustes, Runtime, Splash).
- Alternativas de despliegue (vLLM, TGI, Ollama, llama.cpp): no disponibles para este formato de pesos.
- Latencia y throughput: no disponibles. La presencia del drafter DFlash 2 apunta a decodificacion especulativa como mecanismo de aceleracion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| SiliconSpecies/Swift-1.5-4bit-MLX-Splash | Este paquete | no disponible (base ~27B) | hasta 100K via Splash | splash-packed-q4 | swift-open-license-1.0 |
| incoai/Qwen3.8-27B-Splash | Paquete oficial de referencia; fuente de la torre de vision | 27B segun denominacion | no disponible | Splash | no disponible |
| incoai/Qwen3.8-27B-DFlash2 | Drafter reutilizado sin cambios | no disponible | no disponible | Splash | no disponible |
| ukisai/Swift-1.5-4bit-MLX | Modelo base del que se convierte el target | 27B segun denominacion | no disponible | MLX affine 4-bit | no disponible |

No se dispone de datos de rendimiento que permitan comparar estos modelos en tareas estandar.

## Limitaciones y advertencias

- Compatibilidad restringida: solo funciona en Apple Silicon con el motor Splash. No es utilizable en Transformers, MLX nativo, llama.cpp, vLLM ni TGI.
- Fidelidad heredada: el paquete no parte del modelo en BF16, sino del release MLX 4-bit ya cuantizado. La precision final es la de ese release, no la de una cuantizacion fresca desde BF16.
- Error de cuantizacion concentrado: los peores casos de la fuente MLX se dan en matrices `in_proj` y `k_proj` de las capas superiores, con relRMSE de hasta 0,116. El limite es el almacenamiento en 4 bits, segun el autor.
- Trampa de conversion documentada: si se intenta replicar el proceso, todas las secciones bf16 de normalizacion guardan gamma + 1 (incluidas `query-norm` y `key-norm`; `gdn-norm` es la excepcion). Un error aqui deja el modelo fluido pero destruye el razonamiento multi-paso, y las metricas de error por seccion no lo detectan.
- Mensajes de sistema: la plantilla original rechaza cualquier mensaje de sistema que no sea el primero. Este paquete aplica un parche de una linea; aun asi, conviene verificar el comportamiento con clientes que envien multiples mensajes de sistema.
- Valores de muestreo: si se omiten en la llamada a la API, el servidor genera de forma greedy. La model card recomienda enviar explicitamente `temperature`, `top_p` y `top_k`.
- Presupuesto de tokens: hay que reservar espacio en `max_tokens` para el razonamiento interno, ya que los niveles de esfuerzo no imponen un limite de tokens.
- Errores de plantilla: valores de `reasoning_effort` fuera de `low`, `medium` y `xhigh` provocan un error de plantilla.
- Licencia: `swift-open-license-1.0` bajo la etiqueta `license: other`. No se detallan en la informacion disponible las condiciones de uso comercial; es imprescindible revisar el archivo LICENSE antes de cualquier despliegue productivo.
- Idiomas: no se declara la lista de idiomas soportados, por lo que no se puede garantizar calidad en castellano ni en otras lenguas.
- Madurez: 0 descargas y 0 likes, publicado y actualizado el mismo dia (24 de septiembre de 2026). La propia model card anuncia pruebas adicionales al dia siguiente, lo que indica que el artefacto no esta validado.
- Alucinacion y sesgos: no se aportan evaluaciones de sesgo ni de tendencia a la alucinacion. Como en cualquier modelo generativo, se recomienda validacion humana en contextos criticos.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estandar que respalde su uso en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SiliconSpecies/Swift-1.5-4bit-MLX-Splash
- Modelo base de la conversion: https://huggingface.co/ukisai/Swift-1.5-4bit-MLX
- Modelo BF16 de referencia: ukisai/Swift-1.5-Qwen3.8-27b (referenciado en la model card; URL exacta no disponible)
- Drafter DFlash 2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Paquete oficial con la torre de vision: https://huggingface.co/incoai/Qwen3.8-27B-Splash
- Motor de inferencia Splash: https://github.com/incoai/splash
- Archivo de licencia: LICENSE dentro del repositorio (URL directa no disponible)
- La busqueda web realizada no devolvio resultados relevantes adicionales.
