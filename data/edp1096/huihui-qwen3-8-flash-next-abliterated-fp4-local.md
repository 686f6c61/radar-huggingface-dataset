# edp1096/Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local

## Resumen

Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local es un checkpoint multimodal de 96.486.615.005 parámetros (~96,5 mil millones) publicado por el usuario edp1096 en HuggingFace, derivado del checkpoint cuantizado de NVIDIA `nvidia/Qwen3.8-Flash-Next-FP4-Local` y del modelo abliterado `huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF`. No es un entrenamiento nuevo: es una transferencia de delta cuantizado en la que los tensores modificados por la auditoría de Huihui v2 se reconstruyen, redondean a BF16 y se codifican como MXFP8, mientras que los expertos enrutados NVFP4, sus escalas CSF, el módulo PLE, el módulo MTP, la visión y el tokenizador conservan los bytes del checkpoint original de NVIDIA.

El problema que resuelve es doble. Por un lado, permite ejecutar localmente un modelo de ~96,5B con expertos en 4 bits (NVFP4) y proyecciones en 8 bits (MXFP8) sobre hardware Blackwell, con un repositorio de 102,3 GB. Por otro, traslada el comportamiento sin rechazos (abliterated) de la variante Huihui v2 al formato FP4-Local de NVIDIA, algo que no ofrecía ninguna de las dos fuentes por separado. Es relevante ahora porque la cuantización nativa FP4 en vLLM con runtime B12X permite servir modelos de esta escala en un único nodo con memoria unificada, sin recalibración de activaciones.

La propia model card advierte de que el resultado es "completado con hallazgos" (`runtime_tested: true`, `runtime_validated: false`), no un aprobado limpio: la prueba de recuperación de dos campos a 1.048.056 tokens y la siguiente petición corta se completaron, y las pruebas de ejecución de código, JSON estructurado, tool calling y visión pasaron, pero una verificación de razonamiento devolvió ecuaciones pese a una instrucción de respuesta entera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) enrutados; expertos en NVFP4, proyecciones MXFP8, modulos PLE y MTP; vision encoder y tokenizador heredados del checkpoint NVIDIA |
| Parametros totales | 96.486.615.005 (~96,5B), dato real de safetensors |
| Parametros activos | no disponible (arquitectura MoE; la model card no indica numero de expertos ni parametros activos por token) |
| Longitud de contexto | no disponible como especificacion oficial; la prueba de recuperacion de la model card se ejecuto con 1.048.056 tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, con escalas CSF), MXFP8 (proyecciones modificadas), checkpoint derivado de pesos Q8_0 GGUF; etiqueta generica "8-bit" |
| Idiomas soportados | no disponible |
| Licencia | other; `nvidia-open-model-agreement`; se aplica ademas la Qwen Community License del modelo base |
| Formato de pesos | safetensors (libreria declarada: vllm) |
| Tamano del repositorio | 102,3 GB |
| Pipeline | image-text-to-text |
| Fecha de creacion | 2026-10-16 |
| Fecha de actualizacion | 2026-10-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con mezcla de expertos. La parte enrutada (expertos NVFP4 y sus escalas CSF, mas PLE, MTP, vision y tokenizador) se conserva byte a byte desde `nvidia/Qwen3.8-Flash-Next-FP4-Local`. Sobre esa base, la transferencia solo toca las proyecciones alteradas por el abliterado de Huihui v2: esos tensores se reconstruyen, se actualizan, se redondean a BF16 y se recodifican como MXFP8. El autor enlaza dos artefactos de trazabilidad en el repositorio, `transfer-manifest.json` (fuentes fijadas, tensores modificados y errores de cuantizacion) y `source-audit.json` (comparacion completa de fuentes), y un tercero, `runtime-qualification.json`, para resultados de ejecucion.

No hay entrenamiento nuevo ni calibracion de activaciones: el autor describe explicitamente el proceso como "quantized delta transfer, with no new QAD training or activation calibration". La senal de comportamiento sin rechazos proviene de los pesos Q8_0 auditados de Unsloth/Huihui, no de un proceso de alineacion adicional. La etiqueta `qwen4_exp` sugiere una variante experimental de la familia Qwen, y el nombre comercial "Qwen3.8-Flash-Next" indica un modelo de generacion rapida con soporte de vision, prediccion multi-token (MTP) y embeddings por capa (PLE), aunque la model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado `image-text-to-text`.
- Entrada de imagenes: la prueba de humo de vision paso en la cualificacion en DGX Spark.
- Razonamiento: la verificacion de razonamiento de la model card produjo la respuesta correcta (445), aunque anadio ecuaciones cuando la instruccion exigia solo enteros.
- Ejecucion de codigo: prueba superada en la cualificacion de runtime.
- Salida JSON estructurada: prueba superada.
- Tool calling / function calling: prueba superada.
- Recuperacion en contexto muy largo: la prueba de dos campos a 1.048.056 tokens se completo.
- Prediccion multi-token (MTP) integrada en el checkpoint heredado.
- Comportamiento sin rechazos (abliterated) heredado de Huihui v2: reduce las negativas del modelo a peticiones que el modelo original rechazaria.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Procesamiento de expedientes largos en un solo pase: con una ventana probada de 1.048.056 tokens, el modelo puede ingerir libros tecnicos, expedientes judiciales o historiales completos y hacer preguntas de recuperacion sobre ellos sin trocear el documento ni usar recuperacion externa.
- Extraccion de datos estructurados a escala: la prueba de JSON estructurado superada lo hace apto para convertirfacturas, informes o articulos en esquemas JSON validados dentro de un pipeline ETL, con validacion posterior del esquema.
- Agentes con herramientas: al soportar tool calling y ejecucion de codigo, puede actuar como planificador de un agente que consulta APIs, ejecuta scripts en un sandbox y encadena varios pasos de razonamiento antes de responder.
- Asistencia sobre documentacion visual: al aceptar imagen y texto, sirve para responder preguntas sobre capturas de pantalla, diagramas de arquitectura, planos o graficos tecnicos incrustados en documentacion.
- Analisis de codigo en producción: integrado en un pipeline de CI/CD mediante vLLM, puede revisar diffs, generar parches y ejecutar pruebas en un entorno controlado, con la salvedad de que la calidad de prosa observada es limitada en las muestras de la model card.
- Investigacion sobre alineacion y rechazos: la variante abliterated permite estudiar como se distribuye la conducta de rechazo en un MoE cuantizado a 4 bits, comparando contra el baseline de NVIDIA y contra la version GGUF de Huihui.
- Despliegue on-premise con soberania de datos: al ejecutarse en un unico nodo Blackwell (por ejemplo DGX Spark con memoria unificada) sin llamadas a APIs externas, encaja en entornos con requisitos de confidencialidad estrictos.
- Prototipado multimodal local: con el checkpoint en 102,3 GB en disco, un equipo de investigacion puede levantar un servidor vLLM propio para experimentar con vision y contexto largo sin depender de servicios gestionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que las mediciones realizadas "do not establish broad benchmark parity or donor refusal-rate equivalence". Lo unico registrado son pruebas de cualificacion cualitativas en DGX Spark, recogidas en `runtime-qualification.json` y en el directorio `qualification/`:

| Prueba | Resultado |
|---|---|
| Recuperacion de dos campos a 1.048.056 tokens | Completada |
| Peticion corta posterior a la prueba de contexto largo | Completada |
| Ejecucion de codigo | Superada |
| JSON estructurado | Superada |
| Tool calls | Superada |
| Prueba de humo de vision | Superada |
| Razonamiento con instruccion de respuesta entera | Hallazgo: respuesta correcta (445) pero con ecuaciones anadidas |
| Calidad de prosa | Limitaciones observadas en las muestras reducidas disponibles |
| Estado global | `runtime_tested: true`, `runtime_validated: false` |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 102,3 GB en disco. Como referencia, los expertos NVFP4 a 4 bits sobre ~96,5B parametros implican del orden de 45-50 GB solo en pesos de expertos, mas las proyecciones MXFP8 (8 bits), escalas CSF, embeddings, vision y tokenizador. Cualquier cifra concreta de VRAM en inferencia es una estimacion no confirmada por el autor.
- GPU recomendadas: la cualificacion se hizo en DGX Spark (GB10) con el runtime B12X fijado. NVFP4 requiere el soporte nativo de FP4 de la generacion Blackwell, por lo que las candidatas naturales son B200, RTX 5090 y DGX Spark.
- GPUs sin soporte nativo de FP4: A100 y H100 no disponen de tensor cores FP4, por lo que requeririan de-cuantizacion o emulacion y no son el objetivo declarado del checkpoint.
- GPU de consumo: una RTX 5090 con 32 GB no puede alojar los pesos completos de un modelo de ~96,5B en este formato. El escenario viable es memoria unificada de 128 GB, como la de DGX Spark.
- Uso de swap: la model card senala que ambas variantes (baseline NVIDIA y este checkpoint) usan memoria de intercambio adicional durante el arranque.
- Opciones de despliegue: vLLM con el runtime B12X fijado es la via documentada. La base GGUF de Huihui v2 existe como variante separada para llama.cpp u Ollama, pero este checkpoint safetensors NVFP4/MXFP8 no es compatible con el ecosistema GGUF.
- Latencia y throughput: no disponibles. La model card no publica cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edp1096/Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local | 96.486.615.005 | Prueba a 1.048.056 tokens; especificacion oficial no disponible | NVFP4 + MXFP8, safetensors, vLLM | NVIDIA Open Model Agreement + Qwen Community License | Publico en HuggingFace; 102,3 GB; 0 descargas |
| nvidia/Qwen3.8-Flash-Next-FP4-Local | no disponible | no disponible | NVFP4, safetensors | NVIDIA Open Model Agreement | Publico en HuggingFace (fuente del checkpoint) |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | no disponible | no disponible | GGUF (base Q8_0) | no disponible | Publico en HuggingFace (fuente del delta abliterated) |
| unsloth/Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | GGUF (Q8_0) | no disponible | Publico en HuggingFace (fuente citada para la transferencia) |

No se dispone de datos de rendimiento comparado entre estas variantes. La unica comparacion registrada es la cualificacion de runtime en DGX Spark, donde el autor indica que tanto el baseline de NVIDIA como este checkpoint completaron la misma prueba de recuperacion a 1.048.056 tokens y que ambos muestran limitaciones de calidad de prosa y uso de swap adicional en el arranque.

## Limitaciones y advertencias

- Estado declarado como "completado con hallazgos": el manifiesto mantiene `runtime_validated: false` pese a `runtime_tested: true`. No equivale a un aprobado completo.
- La propia model card afirma que las mediciones "do not establish broad benchmark parity or donor refusal-rate equivalence". No hay garantia de paridad con el modelo original ni de equivalencia de tasa de rechazos.
- Es una transferencia de delta cuantizado, sin nuevo entrenamiento QAD ni calibracion de activaciones. Los errores de cuantizacion de los tensores modificados se documentan en `transfer-manifest.json`, pero no se cuantifica su impacto funcional.
- Comportamiento abliterated: se eliminan o reducen los rechazos del modelo original. Esto incrementa el riesgo de generar contenido danino, ilegal o inseguro y traslada al operador la responsabilidad de filtrado.
- Alucinacion: no hay datos especificos publicados, pero al tratarse de una cuantizacion a 4 bits de expertos enrutados, cabe esperar degradacion frente al modelo en precision superior. Se recomienda validacion en el dominio de uso.
- Limitaciones de idioma: no disponibles. No se confirma soporte de castellano.
- Limitaciones de contexto: la ventana probada es de 1.048.056 tokens con un overlay YaRN de factor 4 y el runtime B12X fijado; fuera de esa configuracion el comportamiento no esta verificado.
- Calidad de prosa: el autor reporta limitaciones de prosa en las muestras reducidas disponibles, tanto en esta variante como en el baseline.
- Consumo de memoria en arranque: requiere swap adicional en el escenario probado, lo que afecta a la planificacion de capacidad.
- Licencia: se aplican simultaneamente el NVIDIA Open Model Agreement y la Qwen Community License. El campo de HuggingFace figura como `other` / `nvidia-open-model-agreement`. Antes de cualquier uso comercial hay que revisar ambas licencias, incluidos los terminos de redistribucion del Qwen Community License, que no se detallan en la informacion proporcionada.
- Estado del repositorio: creado y actualizado el 2026-10-16, con 0 descargas y 0 likes. No hay evidencia de adopcion ni de validacion independiente por terceros.
- Compatibilidad: al ser safetensors NVFP4/MXFP8, no es desplegable con llama.cpp, Ollama ni herramientas GGUF; requiere vLLM y hardware Blackwell.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edp1096/Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local
- Checkpoint base NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Modelo abliterated Huihui v2: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Pesos Q8 de Unsloth (fuente citada): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Qwen Community License del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Trazabilidad de la transferencia (en el repositorio): `transfer-manifest.json`, `source-audit.json`, `runtime-qualification.json`
- Resultados de cualificacion y parches de runtime (en el repositorio): `qualification/`, `qualification/runtime/`
