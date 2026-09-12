# kth8/LFM2.5-230M-OpenCode-Title-Generator

## Resumen

El modelo kth8/LFM2.5-230M-OpenCode-Title-Generator es un ajuste fino supervisado (SFT) del modelo base unsloth/LFM2.5-230M, desarrollado por el usuario kth8 (no por Liquid AI, que es la creadora de la familia LFM2.5). Su unica tarea es generar titulos cortos de hilo o sesion a partir del primer mensaje de un usuario, reproduciendo el comportamiento del agente de titulos de OpenCode. Con 229.693.184 parametros y un repositorio de 0,5 GB en safetensors, es un modelo muy pequeno orientado a una funcion auxiliar de latencia baja y coste minimo.

El problema que resuelve es concreto: los agentes de codigo y asistentes conversacionales necesitan nombrar sesiones, hilos o pestanas sin gastar tokens de un modelo grande. En lugar de invocar al modelo principal, se delega en un modelo de 230M que recibe el primer mensaje y devuelve un titulo descriptivo de hasta 100 caracteres, que es el limite que la interfaz de OpenCode muestra antes de truncar. Se integra mediante la clave `small_model` de la configuracion de OpenCode apuntando a un endpoint compatible con la API de OpenAI.

La relevancia actual esta en la tendencia a usar modelos diminutos especializados para tareas auxiliares dentro de pipelines de agentes: reducen coste, latencia y consumo de energia frente a un modelo generalista. El ajuste se hizo con LoRA (r=16, alpha=16) sobre el modelo base, una sola epoca y el dataset kth8/title-generation-10000x. La informacion disponible no detalla el numero de tokens de entrenamiento ni la longitud de contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (familia de Liquid AI); el detalle interno no se especifica en la informacion proporcionada |
| Parametros totales | 229.693.184 (229,7 M) |
| Parametros activos | no aplica: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors en precision completa; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | El autor declara soporte para los 10 idiomas del modelo base: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues y espanol. La etiqueta de idioma del repositorio solo lista `en` |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base mas alla de su pertenencia a la familia LFM2.5 de Liquid AI y de las etiquetas del repositorio (`lfm2`, `lfm2.5`, `liquid`). Lo que si se documenta es el procedimiento de ajuste: un SFT con PEFT/LoRA sobre unsloth/LFM2.5-230M, con rango 16, alpha 16 y modulos objetivo `q_proj`, `k_proj`, `v_proj`, `out_proj`, `in_proj`, `w1`, `w2` y `w3`. El uso de `in_proj` sugiere que el bloque de atencion o de convolucion del modelo base incorpora proyecciones de entrada especificas, pero no se aporta detalle adicional.

La configuracion de entrenamiento fue: 1 epoca, batch size 4, 4 pasos de acumulacion de gradiente (batch efectivo 16), learning rate 2e-4, optimizador `adamw_torch_fused`, scheduler coseno, 10 pasos de calentamiento, weight decay 0,01 y gradient checkpointing de Unsloth. El dataset es kth8/title-generation-10000x y el entrenamiento se hizo con Unsloth 2026.9.4, TRL 0.23.1, Transformers 5.5.0, PyTorch 2.10.0+cu128, Datasets 4.3.0 y Tokenizers 0.22.2. El prompt de sistema empleado es el del agente de titulos de OpenCode, lo que significa que el modelo espera exactamente ese formato de entrada; no se documenta ninguna fase de RLHF o DPO posterior al SFT.

## Capacidades

- Generacion de texto muy acotada: produce titulos de sesion o hilo a partir del primer mensaje del usuario, con una salida de hasta 100 caracteres (limite de visualizacion de la interfaz de OpenCode).
- Resumen condensado de una peticion larga en una frase corta y descriptiva, como en el ejemplo documentado: la consulta sobre la distancia recorrida por Troy y Emily se resume como "Troy vs Emily five-day school walk distance difference".
- Multilingue en entrada y salida, segun la declaracion del autor: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues y espanol (heredado del modelo base).
- Compatible con endpoints: el repositorio esta etiquetado como `endpoints_compatible`, y el uso previsto es un endpoint local con API compatible con OpenAI (`@ai-sdk/openai-compatible`).
- Integracion como `small_model` en OpenCode mediante `opencode.jsonc`, sustituyendo al modelo grande solo para la tarea de titulado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento extendido, vision ni audio. Es un modelo de tarea unica, no un asistente generalista.

## Casos de uso

- Titulado de sesiones en OpenCode: configurar la clave `small_model` con `title/generator` apuntando a un servidor local; el modelo genera el nombre del hilo tras el primer mensaje del usuario sin consumir cuota del modelo principal.
- Nombrado automatico de conversaciones en asistentes propios: cualquier chat con backend compatible con OpenAI puede llamar a este modelo en lugar del LLM grande para etiquetar la conversacion en la barra lateral, reduciendo coste por sesion de forma drastica frente a un modelo de miles de millones de parametros.
- Generacion de titulos en plugins de IDE o extensiones de editor: al abrir un panel de agente dentro de VS Code, JetBrains o Neovim, el modelo bautiza la sesion a partir del primer prompt, con latencia baja por su tamano de 230M.
- Etiquetado de tickets y hilos de soporte: en una plataforma de atencion al cliente, el primer mensaje del usuario se convierte en un asunto corto y legible para bandejas de entrada compartidas, lo que facilita el triaje antes de que intervenga un modelo mayor.
- Nombrado de ramas, commits o pull requests asistido: un bot de CI/CD puede invocar el modelo con la descripcion inicial de la tarea para proponer un nombre corto de rama o un titulo de PR coherente con el estilo del equipo.
- Agrupacion visual de pestanas o tareas en herramientas de investigacion: extensiones de navegador o apps de notas que necesitan un rotulo para cada pestana abierta pueden usar este modelo localmente, sin enviar el contenido del usuario a un servicio externo.
- Preprocesado para pipelines de agentes: usar la salida del titulo como clave de cache o de indice para recuperar sesiones previas, aprovechando que la tarea es determinista y barata en computo.
- Despliegue en local sin GPU dedicada: al ser un modelo de 0,5 GB en safetensors, puede ejecutarse en CPU o en portatiles modestos para tareas de etiquetado por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta un ejemplo cualitativo de entrada y salida (la consulta de Troy y Emily y el titulo resultante), sin metricas como ROUGE, BLEU, MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,46 GB en fp16/bf16 (229,7 M de parametros x 2 bytes), unos 0,23 GB en int8 y unos 0,12 GB en int4. Sumando activaciones y cache de clave/valor, el consumo realista en fp16 se situa en torno a 1 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (RTX 3050, GTX 1650, RTX 4060, T4, L4). Tambien cabe sobradamente en A100, H100 o RTX 4090, donde el modelo quedaria limitado por el ancho de banda y no por la memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna y en iGPU con memoria compartida suficiente. Tambien es viable en CPU pura para cargas por lotes de baja concurrencia.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM o TGI para servir un endpoint compatible con OpenAI, y llama.cpp u Ollama si se convierte previamente a GGUF, ya que el repositorio no incluye pesos GGUF. El caso de uso documentado por el autor es un servidor local en `http://127.0.0.1:8080/v1`.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion. Por el tamano del modelo, la generacion de un titulo de pocas decenas de tokens deberia ser de milisegundos en GPU y de decimas de segundo en CPU, pero se trata de una estimacion no verificada con datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kth8/LFM2.5-230M-OpenCode-Title-Generator | 229,7 M | no disponible | Titulado de sesiones para OpenCode (SFT con LoRA) | LFM Open License v1.0 | HuggingFace, safetensors |
| unsloth/LFM2.5-230M (modelo base) | 229,7 M | no disponible | Modelo generalista de generacion de texto | LFM Open License v1.0 | HuggingFace |
| Otros ajustes finos de titulado de ~0,2-0,5 B | no disponible | no disponible | no disponible | no disponible | No se identifican alternativas comparables en la informacion disponible |

La busqueda web realizada no devolvio resultados relevantes sobre modelos comparables: las coincidencias obtenidas trataban sobre la escritura de caracteres especiales en teclados de Mac, un tema sin relacion con el modelo. Por tanto, la unica comparacion documentada es con el modelo base del que deriva.

## Limitaciones y advertencias

- Modelo de tarea unica: esta ajustado exclusivamente para generar titulos. No debe usarse como asistente general, para razonamiento, codigo o matematicas; su ajuste degrada muy probablemente sus capacidades originales fuera de la tarea objetivo.
- Formato de prompt rigido: fue entrenado con el prompt de sistema del agente de titulos de OpenCode. Fuera de ese formato o con plantillas de chat distintas, el comportamiento puede degradarse.
- Longitud de contexto desconocida: no se especifica la ventana del modelo base, por lo que no se puede garantizar que el primer mensaje completo entre en contexto si es muy largo. Conviene truncar la entrada.
- Limite de salida: el autor indica que la interfaz de OpenCode muestra el titulo hasta 100 caracteres antes de truncarlo; el modelo no garantiza respetar ese limite estrictamente.
- Idiomas: aunque el autor declara 10 idiomas heredados del modelo base, la etiqueta de idioma del repositorio solo incluye `en`, y no se aportan evaluaciones por idioma. El rendimiento en espanol, arabe o coreano no esta verificado.
- Riesgo de alucinacion: al ser un modelo de 230M, puede generar titulos que inventen detalles, nombres o cifras no presentes en el mensaje original. La salida es un rotulo, no un resumen fiable.
- Sesgos: no se documenta ninguna evaluacion de sesgos. Al derivar de un modelo base entrenado con datos web, puede reproducir estereotipos presentes en ellos, especialmente al resumir textos sobre personas.
- Licencia: se distribuye bajo LFM Open License v1.0 (`license: other`), no bajo una licencia estandar tipo Apache 2.0 o MIT. Antes de un uso comercial es imprescindible revisar los terminos del texto completo de la licencia, ya que pueden existir condiciones o umbrales de uso no recogidos en la informacion disponible.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con fechas de creacion y actualizacion del 12 de septiembre de 2026 separadas por cuatro minutos. Es un experimento reciente sin validacion externa ni mantenimiento demostrado.
- Produccion: al no haber benchmarks ni tests publicados, cualquier despliegue en produccion deberia acompanarse de una evaluacion propia sobre datos reales del dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kth8/LFM2.5-230M-OpenCode-Title-Generator
- Modelo base: https://huggingface.co/unsloth/LFM2.5-230M
- Dataset de entrenamiento: https://huggingface.co/datasets/kth8/title-generation-10000x
- Prompt del agente de titulos de OpenCode: https://raw.githubusercontent.com/anomalyco/opencode/refs/heads/dev/packages/opencode/src/agent/prompt/title.txt
- Documentacion de configuracion de OpenCode (clave `small_model`): https://opencode.ai/docs/config/#models
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-230M/raw/main/LICENSE
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (articulos sobre caracteres especiales en teclados de Mac) y no se han incluido por no ser relevantes.
