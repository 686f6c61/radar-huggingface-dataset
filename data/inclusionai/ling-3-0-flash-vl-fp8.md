# inclusionAI/Ling-3.0-flash-VL-fp8

## Resumen

Ling-3.0-flash-VL-fp8 es la version cuantizada a FP8 del modelo multimodal nativo Ling-3.0-flash-VL, desarrollado por inclusionAI (equipo vinculado a Ant Group). Se trata de un modelo de lenguaje y vision de tipo image-text-to-text construido sobre Ling-3.0-flash, al que anade comprension nativa de imagen y video dentro del ciclo completo de entendimiento, razonamiento, actuacion y verificacion. Con 124.848.460.496 parametros totales y solo 5,5B activados por token, combina una arquitectura MoE dispersa con un backbone hibrido de 42 capas, lo que le permite mantener capacidad de modelo grande con un coste de inferencia propio de un modelo mucho menor.

La relevancia de esta publicacion esta en tres ejes: ventana de contexto de hasta 256K tokens (262.144), soporte de entradas de imagen y video, y un enfoque explicito hacia flujos agenticos, incluyendo comprension de interfaces web y de software para traducir informacion visual en secuencias de acciones. El modelo activa el modo thinking por defecto y publica parsers especificos (ling3) para razonamiento y tool calling, lo que facilita su integracion en pipelines agenticos.

El repositorio evaluado es concretamente la variante FP8 en safetensors, con licencia MIT y un tamano de repo de 126,2 GB, lo que reduce los requisitos de memoria frente a una version en BF16 y habilita despliegues en nodos de 2 GPU de 141 GB o en configuraciones de 8 GPU de 80 GB. Segun el autor, obtiene 42 puntos en el Artificial Analysis Intelligence Index v4.1.1, cuatro puntos por encima de los 38 de Ling-3.0-flash sin vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa con backbone hibrido de 42 capas que alterna KDA y Gated MLA en proporcion 5:1; encoder visual ViT + proyector MLP de dos capas; clase `bailing_moe_v3_vl` |
| Parametros totales | 124.848.460.496 (aproximadamente 124,8B) |
| Parametros activos | 5,5B por token |
| Longitud de contexto | Hasta 262.144 tokens (256K); receta con YaRN factor 2.0, `rope_theta` 6.000.000, `partial_rotary_factor` 0,5 y `original_max_position_embeddings` 131.072 |
| Tipos de cuantizacion | FP8 (este repositorio); el cookbook de SGLang contempla recetas BF16 y FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust-remote-code`) |

Datos adicionales:

| Parametro | Valor |
|---|---|
| Pipeline | image-text-to-text |
| Modalidades de entrada | Texto, imagen y video |
| Modo thinking | Activado por defecto en la plantilla de chat |
| Parametros de muestreo recomendados | `temperature=0.6`, `top_p=0.95`, `top_k=20` (model card); `temperature=1.0`, `top_p=0.95`, `top_k=20` segun `generation_config.json` |
| Tamano del repositorio | 126,2 GB |
| Descargas / likes en HuggingFace | 395 / 18 |
| Fecha de creacion | 2026-09-08 |
| Ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo parte de Ling-3.0-flash y hereda sus capacidades de lenguaje, razonamiento y contexto largo, extendiendolas con comprension nativa de imagen y video. El backbone consta de 42 capas hibridas que alternan dos tipos de capa de atencion, KDA y Gated MLA, en una proporcion de 5:1; este diseno busca procesar de forma eficiente secuencias largas que combinan texto, imagenes, video e historiales extensos de tareas agenticas. Sobre esa base se monta una arquitectura MoE dispersa que mantiene 124B parametros de capacidad total pero activa unicamente 5,5B por token, equilibrando capacidad multimodal y eficiencia de inferencia.

La parte visual se resuelve con un encoder ViT que extrae caracteristicas de imagenes y videos y un proyector MLP de dos capas que alinea esas caracteristicas con las representaciones textuales, de modo que la vision no es un modulo aislado sino una entrada integrada en el razonamiento. El componente VideoRoPE codifica posiciones espaciales y orden temporal, lo que habilita tareas dependientes del tiempo como localizacion de eventos, preguntas sobre videos largos y edicion de clips. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multimodal: el modelo procesa texto, imagen y video de forma conjunta y mantiene modo thinking activado por defecto.
- Comprension visual compleja (eje "understand"): conteo de objetos, interpretacion de layouts complejos, graficos y contenido de documentos.
- Razonamiento con evidencia visual (eje "reason"): calculo apoyado en informacion de la imagen, razonamiento multi-paso y verificacion de informacion externa.
- Actuacion sobre interfaces (eje "act"): comprension de interfaces web y de software y traduccion de la informacion visual a secuencias de acciones.
- Video: comprension de cambios visuales en el tiempo, localizacion de eventos, respuesta a preguntas sobre videos largos y edicion de clips, gracias a VideoRoPE.
- Tool calling / function calling: soportado, con `--tool-call-parser ling3` resuelto automaticamente desde la plantilla de chat.
- Razonamiento agentico y multi-paso: parser de razonamiento dedicado (`--reasoning-parser ling3`), contexto de 256K para historiales largos de tareas y evaluacion reportada en Terminal-Bench 2.1 con el harness Terminus 2.
- Contexto largo: hasta 262.144 tokens, util para documentos extensos, transcripciones y trayectorias de agente.
- Capacidades multilingues: no disponible (la model card y la informacion proporcionada no detallan el conjunto de idiomas soportados).
- Capacidades de audio: no disponibles / no declaradas.

## Casos de uso

- Automatizacion de atencion al cliente con adjuntos visuales: el modelo puede gestionar conversaciones multi-turno donde el usuario envia capturas de pantalla, facturas o fotos de producto, apoyandose en su ventana de 256K tokens para mantener el historial completo y en su comprension de documentos y layouts.
- Agentes que operan interfaces web o de escritorio: dado que traduce informacion visual en secuencias de acciones, encaja en flujos de automatizacion de tareas de back-office sobre paneles administrativos, formularios y aplicaciones internas, combinando tool calling con percepcion de pantalla.
- Analisis de documentos y graficos en pipelines de negocio: extraccion de cifras de informes, verificacion de calculos con evidencia visual y consolidacion de resultados, aprovechando el eje de razonamiento con evidencia.
- Revision de video para localizacion de eventos: analisis de grabaciones de vigilancia, sesiones de formacion o partidas grabadas para localizar momentos concretos y responder preguntas sobre clips largos, gracias a la codificacion temporal de VideoRoPE.
- Verificacion de contenido generado: el modelo puede contrastar afirmaciones con evidencia visual (capturas, tablas, diagramas) y marcar discrepancias, util en control de calidad documental o en validacion de informes.
- Asistencia a desarrollo sobre interfaces y capturas: interpretacion de errores en pantalla, diagramas de arquitectura o capturas de CI/CD, con soporte de tool calling para encadenar acciones sobre repositorios y servicios.
- Edicion y anotacion de video asistida: generacion de descripciones, resúmenes por segmentos y propuestas de corte a partir de la comprension temporal del contenido.
- Evaluacion de accesibilidad de interfaces: deteccion de elementos mal etiquetados o ausentes en una captura de UI y propuesta de descripciones alternativas.

## Benchmarks y rendimiento

| Benchmark | Ling-3.0-flash-VL | Ling-3.0-flash | Notas |
|---|---|---|---|
| Artificial Analysis Intelligence Index v4.1.1 | 42 | 38 | Mejora de 4 puntos al incorporar capacidades visuales |
| Terminal-Bench 2.1 | No se publica la puntuacion en la informacion disponible | no disponible | Evaluado con protocolo AA, harness Terminus 2, timeout unificado de 2 horas, parser JSON en modo preserve-thinking, 3 ejecuciones por tarea (media), `temperature=1.0`, `max_new_tokens=32K`, contexto de 256K |

La model card menciona resultados en benchmarks multimodales agrupados en tres dimensiones (understand, reason y act) y enlaza una imagen con los resultados, pero no se incluyen en la informacion proporcionada las cifras concretas por benchmark (MMLU, HumanEval, GSM8K u otros), por lo que no se reproducen aqui.

## Requisitos de hardware

- Pesos en FP8: al tratarse de 124,8B parametros en FP8, los pesos ocupan aproximadamente 125 GB en disco/memoria, lo que coincide con el tamano de repo de 126,2 GB. Hay que sumar la cache KV y los buffers de activacion.
- Receta recomendada por el autor para 256K de contexto: 2 GPU de clase 141 GB (H20-3e / H200) o nodos Blackwell de 2 GPU (B300 / GB300), con `--tp 2`, `--context-length 262144` y `--mem-fraction-static 0.85`.
- Tarjetas de 80 GB (H100 / H800): escalar a `--tp 8`.
- GPU de consumo (RTX 4090, 3090, etc.): no cabe en una unica GPU consumer en FP8; se requeriria agregacion de memoria en multiples GPU o cuantizaciones de menor precision, cuyo soporte no esta confirmado en la informacion disponible.
- Despliegue: SGLang es la via documentada, con imagen Docker `lmsysorg/sglang:dev-Ling-3.0-flash-VL` y cookbook especifico para este modelo. Se requieren los parsers `ling3` para razonamiento y tool calling. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. Como referencia de eficiencia, solo se activan 5,5B parametros por token, lo que reduce el coste de calculo por token frente a un modelo denso de ~124B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Vision | Licencia | AA Intelligence Index v4.1.1 |
|---|---|---|---|---|---|---|
| Ling-3.0-flash-VL-fp8 | 124,8B | 5,5B | 262.144 tokens | Imagen y video | MIT | 42 |
| Ling-3.0-flash | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | No (version base sin capacidades visuales) | no disponible | 38 |
| Otras alternativas multimodales de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de otros modelos comparables (por ejemplo, alternativas MoE multimodales de rango 100B-200B) en la informacion disponible, por lo que no se incluyen filas adicionales para no introducir cifras no verificadas.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo; al ser un modelo multimodal entrenado con datos web, es esperable que herede sesgos presentes en esos datos, pero no hay documentacion aportada al respecto.
- Riesgo de alucinacion: la model card no incluye tasas de alucinacion ni evaluaciones de fidelidad factual. Como en cualquier modelo de este tipo, las respuestas sobre documentos, graficos o videos deben verificarse en produccion.
- La comprension visual puede fallar en escenas ambiguas, imagenes de baja resolucion, layouts muy densos o contenido poco frecuente; no se documentan limites cuantitativos.
- Cobertura idiomatica no documentada: no se especifica la lista de idiomas soportados ni su calidad relativa, lo que es un riesgo para despliegues multilingues.
- El contexto de 256K exige configuracion explicita de YaRN; usar la ventana extendida sin esa receta puede degradar el rendimiento en tareas de contexto largo.
- El repositorio usa `custom_code` y requiere `trust-remote-code`, lo que implica ejecutar codigo del autor del modelo: conviene auditar el codigo antes de desplegarlo en entornos sensibles.
- Licencia MIT: permite uso comercial y modificacion, pero al ser una cuantizacion FP8 de un modelo base, conviene verificar la licencia de los artefactos originales y de los pesos base si se redistribuyen.
- El modo thinking esta activado por defecto y aumenta el consumo de tokens en la generacion; en produccion de baja latencia puede ser necesario desactivarlo por peticion con `chat_template_kwargs: {"enable_thinking": false}`.
- No hay datos publicados de latencia, throughput ni coste por token en la informacion disponible.
- Los parsers de razonamiento y tool calling dependen del runtime SGLang y de la plantilla de chat (`ling3`); otros runtimes pueden no soportarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL-fp8
- Organizacion en HuggingFace: https://huggingface.co/inclusionAI
- Organizacion en ModelScope: https://modelscope.cn/organization/inclusionAI
- Cookbook de SGLang para Ling-3.0-flash-VL (matriz de recetas BF16/FP8 y generador de comandos): https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-flash-VL
- Imagen Docker de SGLang: `lmsysorg/sglang:dev-Ling-3.0-flash-VL`
