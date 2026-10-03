# infomiho/diktafon-polisher-hr-1-GGUF

## Resumen

Diktafon Polisher HR 1 GGUF es la version cuantizada en formato GGUF del modelo infomiho/diktafon-polisher-hr-1, un modelo de generacion de texto de 752.393.024 parametros (aproximadamente 0,75 mil millones) desarrollado por el autor infomiho. Su funcion concreta es convertir dictado bruto en croata (transcripciones con muletillas, repeticiones, puntuacion ausente y errores propios del habla espontanea) en texto escrito limpio y legible. No es un modelo de proposito general: esta especializado en una tarea de "pulido" de transcripciones en un unico idioma, el croata (codigo `hr`).

El modelo base se construye sobre Qwen3.5-0.8B del equipo Qwen, segun indica la propia model card, y se distribuye bajo licencia Apache 2.0. La version publicada en este repositorio es un unico fichero GGUF con cuantizacion Q5_K_M de 551 MB, pensado para ejecutarse en llama.cpp con la arquitectura declarada `qwen35`. El caso de uso declarado es la aplicacion Diktafon (diktafon.miho.dev), que descarga este fichero automaticamente cuando el usuario dicta en croata.

Su relevancia practica es la de un modelo pequeno y muy especializado que cabe en un portatil: el autor reporta una mediana de 0,32 segundos por operacion de pulido en un Apple M2 Pro en modo "warm polish". El repositorio es muy reciente (creado el 3 de octubre de 2026) y no registra descargas ni likes en el momento de la consulta, por lo que se trata de una publicacion incipiente sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; identificador de arquitectura en llama.cpp: `qwen35` |
| Parametros totales | 752.393.024 (dato declarado en safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_M (unico fichero publicado en este repositorio) |
| Idiomas soportados | Croata (`hr`) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); el modelo base usa safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es un transformer decoder-only derivado de Qwen3.5-0.8B, con arquitectura declarada como `qwen35` en llama.cpp. El modelo base, infomiho/diktafon-polisher-hr-1, es un ajuste sobre Qwen3.5-0.8B orientado a la tarea de pulido de dictado en croata. El repositorio consultado no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF, DPO o SFT.

La innovacion destacable no esta en la arquitectura, sino en la especializacion y el formato de despliegue: se trata de un modelo de menos de mil millones de parametros, cuantizado a Q5_K_M en un unico fichero de 551 MB, disenado para inferencia local en CPU o GPU de gama baja mediante llama.cpp. El autor especifica que se debe usar el prompt exacto del modelo base, decodificacion greedy (`--temp 0`) y un limite de tokens (`-n 200`), lo que sugiere un formato de entrada y salida muy rigido y dependiente del prompt de la model card principal.

## Capacidades

- Pulido de dictado en croata: transforma transcripciones literales del habla en texto escrito con puntuacion, mayusculas y sin muletillas ni repeticiones.
- Generacion de texto condicionada por prompt: la model card indica `pipeline_tag: text-generation` y el tag `conversational`.
- Ejecucion local en llama.cpp mediante el binario `llama-completion`, con el fichero GGUF como unico artefacto necesario.
- Integracion en una aplicacion de dictado de escritorio (Diktafon) como paso posterior a la transcripcion de voz.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue: el unico idioma declarado es el croata.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito; la entrada de audio se resuelve en la aplicacion, no en este modelo.

## Casos de uso

- Limpieza de dictado personal en croata: el modelo recibe la transcripcion bruta de una nota de voz y devuelve el mismo contenido en texto escrito, con puntuacion y sin vacilaciones. Es el caso de uso principal declarado por el autor.
- Integracion en la aplicacion Diktafon: el fichero GGUF es el que la aplicacion descarga cuando el usuario dicta en croata, de modo que el modelo actua como etapa final del pipeline de voz a texto.
- Redaccion asistida por voz en croata: redactar correos, mensajes o documentos dictando en lugar de tecleando, con el modelo encargado de la normalizacion ortotipografica.
- Notas de reunion y actas en croata: convertir la transcripcion de una reunion en un texto legible sobre el que luego trabajar, siempre que se respete el formato de prompt de la model card principal.
- Procesamiento por lotes de transcripciones: dado el tamano del modelo (551 MB en Q5_K_M) y su latencia de decodificacion baja, se pueden procesar muchas transcripciones cortas en una maquina sin GPU dedicada.
- Despliegue en portatil sin GPU: al ejecutarse en llama.cpp sobre CPU o Metal, permite flujos de dictado completamente offline en un portatil de gama media, como el M2 Pro en el que el autor mide 0,32 s de mediana.
- Prototipado de front-ends de voz en croata: util como componente de post-procesado en demos o pruebas de concepto de asistentes de voz en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento aportada por el autor es la latencia de la operacion de pulido:

| Metrica | Valor | Condiciones |
|---|---|---|
| Latencia de pulido (warm) | 0,32 s de mediana | Apple M2 Pro, fichero Q5_K_M |
| Tamano del fichero | 551 MB | `diktafon-polisher-hr-1-q5_k_m.gguf` |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluacion especifica de calidad de pulido en la informacion proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 0,7-1,0 GB con la cuantizacion Q5_K_M (fichero de 551 MB mas overhead del runtime y la cache KV). El modelo base en safetensors, con 752 millones de parametros, requeriria aproximadamente 1,5 GB en fp16.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; tambien es viable en CPU pura. No requiere A100, H100 ni GPUs de centro de datos.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual (RTX 3050, RTX 4060, RTX 4090, etc.), asi como en Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp es el runtime documentado por el autor (`llama-completion`). Al ser un GGUF estandar, tambien es compatible con el ecosistema de llama.cpp (servidor `llama-server`, bindings de Python) y, en principio, con Ollama u otros frontales basados en llama.cpp; no se documenta soporte explicito de vLLM ni TGI para este fichero.
- Latencia y throughput: 0,32 s de mediana por operacion de pulido (warm) en un M2 Pro, con decodificacion greedy y limite de 200 tokens.
- Limitacion practica: el autor especifica que se debe usar el prompt exacto, `--temp 0` y un tope de tokens, por lo que desviarse de esa configuracion puede degradar la salida.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de evaluaciones comparativas en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| infomiho/diktafon-polisher-hr-1-GGUF | 752 M | no disponible | hr | Apache 2.0 | GGUF (Q5_K_M) |
| infomiho/diktafon-polisher-hr-1 (base) | 752 M | no disponible | hr | Apache 2.0 | safetensors |
| Qwen3.5-0.8B (modelo de partida) | ~0,8 B | no disponible | no disponible | Apache 2.0 | no disponible |

No se han identificado en la informacion disponible otros modelos especializados en pulido de dictado en croata con los que comparar.

## Limitaciones y advertencias

- Modelo monoidioma: solo declara soporte de croata (`hr`). No hay evidencia de que funcione correctamente en castellano ni en otros idiomas.
- Especializacion extrema: esta pensado para pulir dictado, no como asistente general. Usarlo para otras tareas probablemente produzca resultados pobres.
- Dependencia del prompt: el autor exige usar el prompt exacto del modelo base, decodificacion greedy (`--temp 0`) y un tope de tokens. Cambiar esos parametros puede degradar la salida sin aviso.
- Riesgo de alucinacion: no hay informacion publicada sobre la tasa de fidelidad al contenido dictado. Como modelo generativo pequeno, puede introducir, omitir o alterar informacion del texto de entrada.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, por lo que se desconoce el limite practico de longitud de una transcripcion.
- Madurez: repositorio creado el 3 de octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks publicados. No hay validacion independiente conocida.
- Licencia: Apache 2.0, que permite uso comercial y modificacion, con la obligacion habitual de conservar el aviso de licencia y el archivo de atribucion. El modelo base es obra del equipo Qwen, tambien bajo Apache 2.0.
- Caveat de produccion: al estar el modelo base construido sobre Qwen3.5-0.8B, conviene verificar los terminos exactos aplicables a esa version concreta del modelo base antes de un despliegue comercial.
- Los resultados de busqueda web realizados no contienen informacion relevante sobre este modelo, por lo que no ha sido posible contrastar ni ampliar los datos de la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/infomiho/diktafon-polisher-hr-1-GGUF
- Modelo base: https://huggingface.co/infomiho/diktafon-polisher-hr-1
- Aplicacion Diktafon: https://diktafon.miho.dev
- Modelo de partida declarado (Qwen3.5-0.8B, equipo Qwen): no se proporciona enlace directo en la informacion disponible.
