# Derpyhue/Qwen3.8-27B-abliterated-2.60bpw-SC-SH

## Resumen

Qwen3.8-27B-abliterated-2.60bpw-SC-SH es una cuantizacion EXL3 (formato exl3 de ExLlamaV3) del modelo Huihui-Qwen3.8-27B-abliterated, que a su vez es una variante con el comportamiento de rechazo eliminado (abliteration) del Qwen/Qwen3.8-27B original. El autor de la cuantizacion es el usuario de HuggingFace Derpyhue, que publica una serie de variantes a distintos bitrates (2.55, 2.60 y 2.65 bpw) optimizadas por atribucion de ruido (sc_optimize) con la opcion de Hessiano escalado (-sh) activada. El objetivo es claro: comprimir un modelo multimodal de 27B nominales hasta unos 12 GB en disco manteniendo la mayor fidelidad posible respecto a la referencia BF16.

El modelo base es un vision-language nativo de 64 capas con arquitectura hibrida (Gated DeltaNet + Gated Attention), 262K tokens de contexto nativo extensible a 1M, comprension de imagen y video, y entrenamiento con prediccion multi-token (MTP). La cuantizacion asigna bitrates por tensor en lugar de aplicar una tasa uniforme: 4.0 bpw para la cabeza de salida (LM head), 4.0 bpw para las capas MTP y 6.0 bpw para el torre de vision, con una media de 2.60 bpw (2.5999 reales).

La relevancia practica de esta ficha es doble. Por un lado, es un ejemplo de cuantizacion consciente de la calidad, con metricas de divergencia KL y perplejidad medidas contra la referencia BF16 en lugar de estimaciones genericas. Por otro, al tratarse de un modelo con los rechazos eliminados, las advertencias de seguridad del modelo original se aplican con mas fuerza, y la licencia Apache-2.0 no exime al desplegador de responsabilidad sobre el contenido generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de 64 capas: Gated DeltaNet + Gated Attention; vision-language nativo; prediccion multi-token (MTP) |
| Parametros totales | 5.966.894.464 segun el recuento real de safetensors; el nombre comercial del modelo base indica 27B (discrepancia no explicada en la informacion disponible) |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | 262K tokens nativos, extensible a 1M |
| Tipos de cuantizacion | EXL3 exclusivamente; variantes publicadas a 2.55, 2.60 y 2.65 bpw; cabeza LM a 4.0 bpw, capas MTP a 4.0 bpw, torre de vision a 6.0 bpw; codebook mul1; output scales auto |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con cuantizacion EXL3 (exllamav3 conversion format version 1.5.4); requiere ExLlamaV3 o tabbyAPI |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B emplea una arquitectura hibrida de 64 capas que combina Gated DeltaNet (una familia de modelos de espacio de estados con compuertas) con Gated Attention. Esta mezcla busca reducir el coste de atencion en contextos largos manteniendo la capacidad de recuperacion precisa de la atencion clasica. El modelo es vision-language nativo, es decir, procesa imagen y video ademas de texto dentro de la misma pila, y fue entrenado con prediccion multi-token (MTP), lo que anade capas auxiliares que predicen varios tokens futuros y que en esta cuantizacion se preservan a 4.0 bpw. La ventana nativa es de 262K tokens, extensible a 1M.

Sobre el proceso de cuantizacion, el autor indica que todo se rederivo especificamente para esta version abliterada: la atribucion de ruido se midio sobre los pesos abliterados y la calibracion uso trazas recogidas del propio modelo (217 filas x 2048 columnas) en lugar de un corpus generico. Se aplico el optimizador sc_optimize para asignar bitrate por tensor, con la opcion de Hessiano escalado (-sh) activada, y se aplico tensor tying en k_proj+v_proj y gate_proj+up_proj. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. Tampoco se detalla el metodo exacto de abliteration empleado por huihui-ai.

## Capacidades

- Generacion de texto y razonamiento en contextos muy largos (262K tokens nativos, extensibles a 1M), con coste de atencion reducido gracias al componente Gated DeltaNet.
- Comprension de imagen: el modelo base es vision-language nativo y la torre de vision se conserva a 6.0 bpw en esta cuantizacion.
- Comprension de video: indicada explicitamente en la descripcion del modelo base.
- Prediccion multi-token (MTP): las capas MTP se conservan a 4.0 bpw, lo que permite usarlas para decodificacion especulativa si el runtime lo soporta.
- Generacion de codigo y matematicas: capacidades esperables de la familia Qwen, aunque no se aportan resultados de benchmarks que las cuantifiquen en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el autor no declara lista de idiomas.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Comportamiento sin rechazo (abliterated): el modelo respondera a peticiones que el modelo base rechazaria.
- Modo de pensamiento (thinking): no confirmado en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con material grafico: informes anuales, expedientes o papers de cientos de paginas con figuras. La ventana de 262K tokens permite introducir el documento completo sin troceado y la torre de vision preservada a 6.0 bpw mantiene la lectura de graficos y tablas escaneadas.
- Procesamiento de video para resumen automatico: al ser vision-language nativo con soporte de video, puede generar transcripciones descriptivas o indices de escenas a partir de clips, algo que un modelo solo-texto no puede abordar.
- Investigacion sobre alineacion y seguridad: al ser una variante abliterada, es util para estudiar como se distribuyen los comportamientos de rechazo en los pesos y como la cuantizacion agresiva afecta a esos comportamientos.
- Despliegue en una sola GPU de consumo: con aproximadamente 12 GB en disco, entra en tarjetas de 16 GB o 24 GB y permite servir un modelo multimodal de contexto largo sin infraestructura de centro de datos.
- Generacion de informes tecnicos con contexto corporativo extenso: introduciendo manuales, historiales de incidencias y capturas de pantalla en un unico prompt para producir resumenes o procedimientos.
- Extraccion de informacion estructurada de capturas y formularios: la combinacion de vision y contexto largo permite procesar lotes de imagenes con instrucciones comunes en un solo contexto.
- Asistente de codigo sobre repositorios grandes: la ventana extendida admite volcar varios ficheros relevantes a la vez; conviene validar antes la calidad real del modelo cuantizado en tareas de codigo, ya que no hay benchmarks publicados.
- Experimentacion con decodificacion especulativa: las capas MTP conservadas a 4.0 bpw permiten probar esta tecnica en ExLlamaV3 y medir la ganancia de throughput en hardware propio.

## Benchmarks y rendimiento

La informacion disponible no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares). Lo que si se publica es una tabla de calidad medida contra la referencia BF16 abliterada, con divergencia KL y perplejidad. Las cifras de pesos en GiB cuentan unicamente tensores cuantizados; el total en disco del repo es de aproximadamente 11,96 GB.

| Modelo | Pesos (GiB) | KLD media | KLD mediana | KLD p90 | Perplejidad (incremento) |
|---|---|---|---|---|---|
| Abliterated BF16 (referencia) | 47,7 | — | — | — | 1,3418 |
| 2.55 H4 -sh | 7,87 | 0,0442 | 0,0026 | 0,128 | 1,4098 (+5,1%) |
| 2.60 H4 -sh (este modelo) | 8,01 | 0,0417 | 0,0023 | 0,122 | 1,4048 (+4,7%) |
| 2.65 H4 -sh | 8,15 | 0,0377 | 0,0021 | 0,109 | 1,3986 (+4,2%) |

El autor advierte explicitamente que estas mediciones se hicieron contra la referencia BF16 abliterada y no son comparables con las tablas de la serie principal de cuantizaciones. La divergencia KL predicha por sc_optimize para este modelo es 0,0659.

## Requisitos de hardware

- VRAM estimada: los tensores cuantizados ocupan 8,01 GiB y el repo completo 11,96 GB en disco; a eso hay que sumar la cache KV y las activaciones, cuyo tamano crece de forma apreciable con la ventana de 262K tokens. No se publican cifras de VRAM medidas.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPU de consumo con 16 GB o mas (por ejemplo RTX 4080, RTX 4090, RTX 5090) y para GPU profesionales (A100, H100) cuando se necesita servir por lotes o con contexto muy largo.
- Cabe en GPU de consumo: si, segun el tamano de pesos declarado, sujeto a la ventana de contexto efectiva que se configure.
- Opciones de despliegue: ExLlamaV3 es obligatorio para cargar el formato EXL3; el autor recomienda tabbyAPI como servidor. No hay versiones GGUF, AWQ, GPTQ ni safetensors sin cuantizar publicadas en este repositorio, por lo que llama.cpp u Ollama no son aplicables sin reconvertir el modelo base.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-abliterated 2.60bpw SC-SH (este) | 5.966.894.464 en safetensors; 27B nominales | 262K, extensible a 1M | KLD media 0,0417; perplejidad 1,4048 | apache-2.0 | EXL3, exllamav3/tabbyAPI |
| Qwen3.8-27B-abliterated 2.55bpw SC-SH | Mismo modelo base | 262K, extensible a 1M | KLD media 0,0442; perplejidad 1,4098 | apache-2.0 | EXL3, exllamav3/tabbyAPI |
| Qwen3.8-27B-abliterated 2.65bpw SC-SH | Mismo modelo base | 262K, extensible a 1M | KLD media 0,0377; perplejidad 1,3986 | apache-2.0 | EXL3, exllamav3/tabbyAPI |
| Huihui-Qwen3.8-27B-abliterated BF16 | Mismo modelo base sin cuantizar | 262K, extensible a 1M | Referencia; perplejidad 1,3418 | apache-2.0 | safetensors BF16, 47,7 GiB |

No se dispone de informacion en la busqueda web sobre modelos de terceros comparables con la misma combinacion de vision-language, contexto de 262K y licencia Apache-2.0, por lo que la comparativa se limita a las variantes de la misma familia.

## Limitaciones y advertencias

- Modelo abliterado: se le ha eliminado el comportamiento de rechazo y respondera a peticiones que el modelo base declinaria. Las advertencias de seguridad de la tarjeta original de Qwen se aplican con mas fuerza, segun el propio autor.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tendencia a la fabricacion de datos para esta cuantizacion concreta.
- Perdida de precision por cuantizacion: el autor reconoce que los modelos cuantizados pierden exactitud respecto al original a plena precision. En este caso el incremento de perplejidad frente a BF16 es del 4,7%.
- Contexto muy largo: aunque la ventana nativa es de 262K y se anuncia extension a 1M, no se aportan mediciones de rendimiento ni de degradacion de la recuperacion de informacion en contextos extremos tras la cuantizacion.
- Idiomas: la lista de idiomas soportados no esta disponible, lo que impide garantizar cobertura multilingue en produccion.
- Compatibilidad de runtime restringida: al ser EXL3, solo ExLlamaV3 y tabbyAPI pueden cargarlo; no hay GGUF ni otras cuantizaciones publicadas, lo que limita las opciones de despliegue y el soporte en herramientas de terceros.
- Licencia: apache-2.0 permite uso comercial, pero el despliegador asume toda la responsabilidad legal y etica sobre las salidas de un modelo sin rechazos.
- Trazabilidad: el repositorio no registra descargas ni interacciones en el momento de la consulta, y no hay pipeline declarado, por lo que no existe validacion comunitaria de su comportamiento.
- Formatos de entrenamiento y datos: no se documenta el corpus de entrenamiento, el numero de tokens ni si hubo RLHF o DPO, lo que dificulta anticipar sesgos concretos.
- Discrepancia de parametros: el recuento de safetensors (aproximadamente 5,97B) no coincide con el tamano nominal de 27B del nombre del modelo; la informacion disponible no explica el motivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Derpyhue/Qwen3.8-27B-abliterated-2.60bpw-SC-SH
- Variante 2.55 bpw: https://huggingface.co/Derpyhue/Qwen3.8-27B-abliterated-2.55bpw-SC-SH
- Variante 2.65 bpw: https://huggingface.co/Derpyhue/Qwen3.8-27B-abliterated-2.65bpw-SC-SH
- Serie principal SC: https://huggingface.co/Derpyhue/Qwen3.8-27B-exl3-2.65bpw-SC-SH
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- ExLlamaV3: https://github.com/turboderp/exllamav3
- tabbyAPI: https://github.com/theroyallab/tabbyAPI
- Listado de modelos de HuggingFace (referencia de descubrimiento): https://huggingface.co/models?sort=created
