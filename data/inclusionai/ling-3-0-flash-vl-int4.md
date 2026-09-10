# inclusionAI/Ling-3.0-flash-VL-int4

## Resumen

Ling-3.0-flash-VL es un modelo multimodal nativo desarrollado por inclusionAI. Se construye sobre Ling-3.0-flash y lleva la informacion visual a todo el ciclo de comprension, razonamiento, actuacion y verificacion, en lugar de limitarse a la percepcion de imagenes y video. Cuenta con 124.848.460.496 parametros totales (unos 124,8B) y solo 5,5B parametros activos por token, con una ventana de contexto de hasta 256K tokens y soporte de entradas de imagen y video.

La arquitectura combina un encoder visual ViT con un proyector MLP de dos capas que alinea las representaciones visuales con las textuales, un backbone hibrido de 42 capas que alterna capas KDA y Gated MLA en una proporcion 5:1, y una arquitectura MoE dispersa. VideoRoPE codifica posiciones espaciales y orden temporal, lo que habilita tareas como localizacion de eventos, preguntas sobre video largo y edicion de clips.

El repositorio publicado es la variante cuantizada a int4, con pesos en safetensors y formato compressed-tensors, un tamano de repositorio de 76,1 GB y licencia MIT. En el indice Artificial Analysis Intelligence Index v4.1.1 obtiene 42 puntos, cuatro mas que los 38 de Ling-3.0-flash, lo que sugiere que la extension multimodal mejora el rendimiento de inteligencia global del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal con MoE dispersa; backbone de 42 capas alternando KDA y Gated MLA en proporcion 5:1; encoder visual ViT + proyector MLP de 2 capas; VideoRoPE |
| Parametros totales | 124.848.460.496 (aproximadamente 124,8B) |
| Parametros activos | 5,5B por token |
| Longitud de contexto | 256K tokens (262.144); contexto original de 131.072 tokens ampliado con YaRN (factor 2.0) |
| Tipos de cuantizacion | int4 (esta variante, formato compressed-tensors); la model card menciona recetas de despliegue BF16 y FP8 en el cookbook de SGLang |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), requiere custom_code / trust_remote_code; tamano del repositorio 76,1 GB |
| Modalidades de entrada | Texto, imagen y video (pipeline: image-text-to-text) |
| Modo de razonamiento | Thinking mode activado por defecto en la plantilla de chat |
| Parametros de muestreo recomendados | temperature=1.0, top_p=0.95, top_k=20 segun generation_config.json; la model card indica temperature=0.6, top_p=0.95, top_k=20 salvo que se especifique lo contrario |
| Fecha de creacion del repositorio | 2026-09-08 (actualizado el 2026-09-10) |
| Descargas / likes | 461 descargas, 13 likes |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido multimodal. El encoder visual ViT extrae caracteristicas de imagenes y video y un proyector MLP de dos capas las alinea con las representaciones de texto para un razonamiento multimodal unificado. El backbone de 42 capas alterna capas KDA y Gated MLA con una proporcion 5:1, diseno orientado a procesar de forma eficiente contexto largo sobre texto, imagenes, videos e historiales extensos de tareas de agente. Sobre esa base se aplica una arquitectura MoE dispersa que mantiene una capacidad total de 124B parametros activando solo 5,5B por token. VideoRoPE anade codificacion de posicion espacial y de orden temporal.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento: estos datos no estan disponibles en la informacion proporcionada. Si se documenta que la ampliacion de contexto hasta 256K se realiza mediante escalado RoPE de tipo YaRN con factor 2.0, rope_theta de 6.000.000, partial_rotary_factor de 0,5 y original_max_position_embeddings de 131.072.

## Capacidades

- Comprension visual: conteo de objetos, interpretacion de layouts complejos, graficos y contenido de documentos.
- Razonamiento con evidencia visual: calculo a partir de imagenes, razonamiento multi-paso y verificacion de informacion externa usando la evidencia visual.
- Actuacion sobre interfaces: comprension de interfaces web y de software, y traduccion de la informacion visual a secuencias de acciones (uso tipo agente/computer use).
- Entrada de video: comprension de cambios visuales en el tiempo, localizacion de eventos, preguntas sobre video largo y edicion de clips, gracias a VideoRoPE.
- Contexto largo: ventana de hasta 256K tokens aplicable a texto, imagenes, videos e historiales extendidos de tareas de agente.
- Tool calling / function calling: la receta de SGLang incluye `--tool-call-parser ling3` (resolucion automatica mediante `auto` desde la plantilla de chat).
- Modo de razonamiento explicito: thinking mode activado por defecto, desactivable por peticion con `"chat_template_kwargs": {"enable_thinking": false}`; parser de razonamiento `ling3`.
- Generacion de texto y razonamiento general: hereda las capacidades de lenguaje, razonamiento y contexto largo de Ling-3.0-flash.
- Capacidades multilingues: no disponible (no se publica lista de idiomas soportados).

## Casos de uso

- Agentes de automatizacion de interfaz (computer use): el modelo puede tomar capturas de pantalla de aplicaciones web o de escritorio, interpretar el estado de la interfaz y emitir secuencias de acciones. El soporte de tool calling y la ventana de 256K permiten mantener historiales largos de acciones y observaciones sin perder contexto.
- Respuesta a preguntas sobre video largo: gracias a VideoRoPE, que codifica orden temporal, se puede usar para localizar eventos concretos en grabaciones extensas, resumir clips o responder preguntas que dependen de cambios a lo largo del tiempo.
- Analisis de documentos y graficos: extraccion e interpretacion de tablas, diagramas, informes financieros o layouts complejos, con razonamiento multi-paso sobre las cifras extraidas. La ventana de 256K permite procesar documentos completos en una sola pasada.
- Verificacion de informacion con evidencia visual: integrable en flujos donde una respuesta debe contrastarse contra una imagen, un fotograma o un documento escaneado, aprovechando la dimension de "razonar y verificar" descrita por el autor.
- Atencion al cliente multimodal: gestion de conversaciones multi-turno en las que el usuario envia fotos de productos, capturas de error o facturas, manteniendo el hilo completo dentro del contexto del modelo.
- Pipelines de anotacion o inspeccion por lotes: al activar solo 5,5B parametros por token sobre una capacidad total de 124B, resulta adecuado para procesamiento por lotes de imagenes y video donde el coste de inferencia por elemento es un factor critico.
- Asistentes de accesibilidad o descripcion de contenido: descripcion estructurada de imagenes y video con razonamiento sobre relaciones espaciales y temporales, en lugar de simples leyendas.

## Benchmarks y rendimiento

| Benchmark | Ling-3.0-flash-VL | Ling-3.0-flash | Notas |
|---|---|---|---|
| Artificial Analysis Intelligence Index v4.1.1 | 42 | 38 | Mejora de 4 puntos al anadir capacidades visuales |
| Terminal-Bench 2.1 | no disponible (solo se describe el protocolo) | no disponible | Evaluado con el protocolo de Artificial Analysis, harness Terminus 2, timeout unificado de 2 horas, parser JSON en modo preserve-thinking, 3 ejecuciones por tarea (media), temperature=1.0, max_new_tokens=32K, contexto de 256K |

La model card publica los resultados de los benchmarks multimodales como imagenes, sin valores numericos en el texto disponible. No se han publicado en la informacion proporcionada cifras de MMLU, HumanEval, GSM8K ni de benchmarks multimodales concretos (conteo de objetos, comprension de documentos, video QA, etc.).

## Requisitos de hardware

- Pesos: el repositorio int4 ocupa 76,1 GB. Con 124,8B parametros y cuantizacion de 4 bits, la estimacion teorica del peso de los parametros ronda los 62 GB, por lo que el total real del repositorio (incluyendo capas no cuantizadas, encoder visual y cabezal LM) se situa en el entorno de los 65-76 GB.
- Configuracion recomendada por el autor: receta con contexto de 256K (YaRN) sobre 2 GPUs de clase 141 GB (H20-3e o H200) o nodos Blackwell de 2 GPUs (B300 / GB300), con `--tp-size 2` y `--mem-fraction-static 0.85`.
- GPUs de 80 GB: en tarjetas H100 / H800 se debe escalar a `--tp 2`.
- GPU de consumo: no disponible. El tamano del repositorio (76,1 GB) y la necesidad de paralelismo tensor exceden la VRAM de las GPU de consumo habituales (incluida la RTX 4090 con 24 GB); no se documenta ninguna receta para GPU de consumo.
- Opciones de despliegue: SGLang es la opcion documentada, con imagen Docker oficial `lmsysorg/sglang:dev-Ling-3.0-flash-VL`. El cookbook del autor incluye una matriz de lanzamiento por hardware y receta (BF16/FP8 x baja latencia / alto throughput). No se documentan en la informacion disponible otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Detalles de despliegue relevantes: `--enable-fp32-lm-head`, `--disable-shared-experts-fusion`, `--trust-remote-code`, `--reasoning-parser auto` y `--tool-call-parser auto` (resuelven a `ling3` desde la plantilla de chat).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Entradas | Licencia | AA Intelligence Index v4.1.1 |
|---|---|---|---|---|---|---|
| Ling-3.0-flash-VL (int4) | 124,8B | 5,5B | 256K | Texto, imagen, video | MIT | 42 |
| Ling-3.0-flash | no disponible | no disponible | no disponible | Texto | no disponible | 38 |

La unica comparacion documentada en la informacion proporcionada es contra Ling-3.0-flash, el modelo base de la misma familia, que no soporta entrada visual. No se dispone de datos sobre otros modelos multimodales comparables (parametros, contexto, rendimiento o licencia): no disponible.

## Limitaciones y advertencias

- Idiomas soportados: no disponible. No se publica lista de idiomas, por lo que el rendimiento multilingue no puede evaluarse a priori.
- Codigo remoto: el modelo usa `custom_code` (arquitectura `bailing_moe_v3_vl`) y su despliegue requiere `--trust-remote-code`. Conviene auditar el codigo del repositorio antes de ejecutarlo en produccion.
- Cuantizacion int4: esta variante puede presentar perdida de precision frente a las recetas BF16 o FP8 mencionadas en el cookbook. Para tareas sensibles a precision numerica (OCR fino, calculo sobre graficos) deberia validarse contra una version de mayor precision.
- Thinking mode por defecto: el modelo genera razonamiento explicito salvo que se desactive con `"chat_template_kwargs": {"enable_thinking": false}`. Esto incrementa el consumo de tokens y la latencia si no se gestiona.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de tasas de alucinacion. Como en cualquier modelo multimodal, la lectura de cifras en graficos, documentos y videos es susceptible a errores y debe verificarse en aplicaciones criticas.
- Sesgos: no se publica informacion sobre sesgos conocidos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- Benchmarks limitados: las figuras de rendimiento multimodal se publican como imagenes sin valores numericos en el texto disponible, y no hay resultados publicados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales estandar.
- Comparabilidad de Terminal-Bench 2.1: los resultados se obtienen con el protocolo de Artificial Analysis (harness Terminus 2, timeout de 2 horas, 3 ejecuciones por tarea con media), por lo que no son directamente comparables con mediciones bajo otros protocolos.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero no se especifican terminos adicionales de uso responsable ni restricciones de aceptacion en la informacion disponible.
- Informacion incompleta: la model card proporcionada esta truncada, por lo que podrian existir secciones adicionales (por ejemplo, guias completas de despliegue o resultados de benchmarks) no recogidas aqui.
- Fechas de metadatos: el repositorio figura como creado el 2026-09-08 y actualizado el 2026-09-10, fechas que deben contrastarse con la informacion actual del repositorio antes de citarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL-int4
- Organizacion inclusionAI en HuggingFace: https://huggingface.co/inclusionAI
- Organizacion inclusionAI en ModelScope: https://modelscope.cn/organization/inclusionAI
- Cookbook de SGLang para Ling-3.0-flash-VL: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-flash-VL
- Imagen Docker de SGLang: `lmsysorg/sglang:dev-Ling-3.0-flash-VL`
- Paper, blog tecnico o repositorio de codigo adicional: no disponible
- Resultados relevantes en la busqueda web: no se han encontrado enlaces relevantes sobre este modelo (los resultados devueltos corresponden a paginas de soporte de Microsoft y no guardan relacion con el modelo).
