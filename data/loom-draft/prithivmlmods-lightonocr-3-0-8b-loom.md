# loom-draft/prithivMLmods-LightOnOCR-3-0.8B-loom

## Resumen

LightOnOCR-3-0.8B es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y comprensión de documentos, desarrollado originalmente por el equipo de LightOn y distribuido en formato GGUF por el usuario prithivMLmods. El checkpoint que nos ocupa es un empaquetado para el ecosistema Loom de AMD: un conjunto de programas `.loom` y una tarjeta `model.json` que permiten ejecutar el GGUF original, sin modificarlo, sobre las GPU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo resuelve la transcripción y comprensión de imágenes de documentos: recibe una imagen y devuelve texto estructurado, lo que cubre casos como digitalización de facturas, extracción de tablas y lectura de formularios. Con 0,8 mil millones de parámetros en cuantización Q4_K_M, está pensado para despliegue local en hardware de consumo o estaciones de trabajo con GPU integrada, sin depender de servicios en la nube.

La relevancia de este paquete concreto es de infraestructura más que de modelado: demuestra el flujo de trabajo de Loom (generación con `loom-next`, distribución con `loom-fetch` y servicio con `loom-serve`) sobre aceleradores AMD, con una API compatible con OpenAI. Cabe señalar que el repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, y que las mediciones de rendimiento y las compuertas de corrección del paquete aún no se han vuelto a medir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de visión-lenguaje; pesos GGUF del checkpoint LightOnOCR-3-0.8B) |
| Parametros totales | 0,8 mil millones (según denominación del modelo) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en bf16 (`LightOnOCR-3-0.8B.mmproj-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado Loom: programas `.loom` + `model.json`) |

Otros parámetros operativos del preset: máximo de 4.096 tokens de salida, 4 peticiones concurrentes, tool calling estilo OpenAI, modo «thinking» desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (composición de capas, tipo de atención, mecanismo de fusión visual). Lo que sí se documenta es la topología de despliegue: un modelo de lenguaje en GGUF Q4_K_M acompañado de un proyector multimodal separado en bf16, que se encarga de convertir las imágenes en tokens de prompt. El paquete Loom traduce el grafo del modelo a kernels generados para las arquitecturas AMD gfx1151 y gfx1201, y expone el resultado mediante un servidor compatible con la API de chat completions de OpenAI.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del corpus, ni si hubo ajuste por RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa: la tabla de características del paquete marca explícitamente la decodificación especulativa como «not applicable», y el «reasoning effort» también como no aplicable. La compuerta de corrección `spec` existe en el conjunto de pruebas, pero figura como «not yet re-measured».

## Capacidades

- Generación de texto a partir de imágenes (pipeline `image-text-to-text`): entrada de imágenes mediante partes `image_url` al estilo OpenAI.
- OCR y comprensión de documentos: lectura de texto impreso en imágenes, con salida en lenguaje natural o estructurada.
- Tool calling: soporte de `tools` y `tool_calls` con el esquema de OpenAI.
- Modo de razonamiento opcional: desactivado por defecto, se activa con `enable_thinking: true` en `chat_template_kwargs`.
- Conversaciones multi-turno con historial: el paquete incluye una compuerta `agent` que verifica el renderizado exacto del prompt y la reutilización del historial.
- Concurrencia: hasta 4 peticiones simultáneas con la compuerta `consistency` prevista para verificar que la salida concurrente coincide con la secuencial.
- Contexto largo: 262.144 tokens por petición, adecuado para documentos extensos o pilas de páginas.
- Capacidades de audio: no disponibles (marcadas como «not applicable»).
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes: enviar la imagen del documento al endpoint `/v1/chat/completions` con una instrucción de extracción y obtener los campos en texto o JSON; el contexto de 262.144 tokens permite procesar lotes de páginas en una sola petición.
- Extracción de tablas de informes financieros: el modelo recibe la captura o el escaneo de la página y devuelve la tabla transcrita, que después se valida con un parser en el backend.
- Procesamiento de formularios manuscritos o impresos en entornos con requisitos de privacidad: al ejecutarse en local sobre Strix Halo o R9700, los documentos no salen del equipo, lo que encaja en sectores regulados.
- Automatización de archivo documental: un pipeline que detecta nuevos PDF escaneados, rasteriza cada página y llama al modelo para generar el texto indexable, aprovechando las 4 peticiones concurrentes del preset.
- Asistente de accesibilidad: describir el contenido de imágenes y documentos a usuarios con discapacidad visual, con la ventaja de que el modo «thinking» puede desactivarse para minimizar la latencia en respuestas cortas.
- Agente de atención al cliente con acceso a documentos: combinar el tool calling con la lectura de imágenes para que un agente consulte capturas de pantalla o justificantes aportados por el usuario dentro de un bucle multi-turno.
- Transcripción de apuntes y pizarras en flujos de investigación: capturar una fotografía de una pizarra y obtener el texto para pegarlo en un cuaderno de laboratorio o en un repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del paquete incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican literalmente que «the results for this package are not yet re-measured». Del mismo modo, las doce compuertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured» en ambas GPU.

| Compuerta | Descripción | Strix Halo | R9700 |
|---|---|---|---|
| `kernel_tests` | Tests unitarios de kernels frente a referencias | no medida | no medida |
| `golden` | Tokens greedy y top-5 log-probs frente a llama.cpp | no medida | no medida |
| `compare` | Salida greedy token a token frente a llama.cpp | no medida | no medida |
| `vision` | Entrada de imagen frente a llama.cpp con el mismo proyector | no medida | no medida |
| `consistency` | Salida concurrente igual a la secuencial | no medida | no medida |
| `agent` | Bucle multi-turno de tool calling | no medida | no medida |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,8 mil millones de parámetros en Q4_K_M más el proyector bf16, la huella es del orden de unos pocos gigabytes, aunque la cifra exacta no se documenta.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; el paquete está generado específicamente para las dos arquitecturas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir el modelo. Parámetros recomendados en la tarjeta: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de las finalizaciones de GPU.
- Latencia y throughput: no disponibles; las mediciones frente a llama.cpp no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-0.8B (este paquete Loom) | 0,8 B | 262.144 | Apache 2.0 | GGUF Q4_K_M + proyector bf16 | Empaquetado para AMD gfx1151 y gfx1201; sin mediciones publicadas |
| prithivMLmods/LightOnOCR-3-0.8B-GGUF (checkpoint base) | 0,8 B | no disponible | Apache 2.0 | GGUF | Mismo checkpoint sin empaquetar; ejecutable con llama.cpp |
| Alternativas OCR de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- El repositorio no registra descargas ni «likes», y las compuertas de corrección y las mediciones de rendimiento figuran como no reevaluadas: no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- El paquete está generado únicamente para AMD Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se garantiza su funcionamiento en otras GPU, ni en NVIDIA, ni en CPU.
- La cuantización Q4_K_M introduce pérdida de precisión frente al checkpoint en bf16, con posible impacto en OCR de texto pequeño o de baja calidad.
- No se documentan los idiomas soportados, los sesgos del modelo base ni su comportamiento ante documentos degradados; el riesgo de alucinación en campos no visibles de un documento es real y debe mitigarse con validación posterior.
- El límite de salida del preset es de 4.096 tokens, muy inferior al contexto de entrada; documentos con transcripciones muy largas requerirán troceado.
- Solo se admiten 4 peticiones concurrentes con el preset actual, lo que limita el throughput en producción.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del checkpoint base y de los datos de entrenamiento antes de un uso comercial.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/prithivMLmods-LightOnOCR-3-0.8B-loom
- Checkpoint base GGUF: https://huggingface.co/prithivMLmods/LightOnOCR-3-0.8B-GGUF
- Generador Loom: https://github.com/loom-fun/loom-next
- Sistema Loom para ROCm: https://github.com/ROCm/hrx-system
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
