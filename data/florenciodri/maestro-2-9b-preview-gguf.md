# florenciodri/Maestro-2-9B-Preview-GGUF

## Resumen

Maestro-2-9B-Preview-GGUF es un repositorio de cuantizaciones GGUF del modelo vectionlabs/Maestro-2-9B-Preview, publicado por el usuario florenciodri (Florêncio Dri). No es un modelo nuevo ni un fine-tuning: contiene cuatro variantes cuantizadas (Q4_K_M, Q5_K_M, Q6_K y Q8_0) generadas de forma independiente a partir de un mismo master GGUF en BF16, sin recuantizar archivos ya cuantizados y sin modificar pesos. El objetivo es hacer desplegable en hardware de consumo un modelo de 9B orientado a ingenieria de software, razonamiento y generacion de codigo.

El modelo subyacente, desarrollado por Vection Labs, es un transformer denso de la familia Qwen3.5 con aproximadamente 9,65B de parametros segun su model card (9.197.093.888 parametros reales declarados en safetensors), contexto nativo de 262.144 tokens, encoder de vision nativo y capacidades de razonamiento explicito (thinking) y uso de herramientas. La licencia es Apache-2.0 tanto en el modelo original como en estas cuantizaciones.

Su relevancia actual es practica: permite ejecutar un modelo de 9B con ventana de contexto muy larga y perfil agentico en GPUs de 6 a 12 GB, mediante llama.cpp. La limitacion principal es que este repositorio solo distribuye los pesos para inferencia de texto y codigo; el proyector de vision (mmproj) no esta incluido ni validado, por lo que las capacidades multimodales del modelo original no estan disponibles aqui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (segun el autor upstream), con encoder de vision nativo en el modelo original |
| Parametros totales | 9.197.093.888 (safetensors del modelo base); el autor upstream declara aproximadamente 9,65B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (modelo upstream); el contexto usable depende de VRAM, KV-cache, backend y batch size |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun la model card y los metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors / BF16 |
| Tamano del repositorio | 59,5 GB |
| Precision del modelo original | BF16 |
| Relacion con el modelo base | quantized (cuantizacion de vectionlabs/Maestro-2-9B-Preview) |
| Revision de origen | c9e391d628af082afd1e91e993ceac7c00156d8c |
| Revision de llama.cpp usada | a868c3e3c56657f7e8a6231190dbbe90e7dd86c0 |

Detalle de las cuantizaciones publicadas:

| Cuantizacion | Tamano | Perfil de hardware indicado |
|---|---:|---|
| Q4_K_M | 5,78 GB / 5,38 GiB | GPU de 6 GB (perfil de baja memoria del upstream) |
| Q5_K_M | 6,64 GB / 6,19 GiB | GPU de 8 GB (perfil recomendado del upstream) |
| Q6_K | 7,56 GB / 7,04 GiB | Variante adicional de este repositorio, sin perfil upstream asociado |
| Q8_0 | 9,79 GB / 9,11 GiB | GPU de 12 GB (perfil de mejor calidad del upstream) |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente es un transformer denso de la familia Qwen3.5, con encoder de vision nativo en su version original, pensado para tareas de ingenieria: generacion de codigo, desarrollo frontend, razonamiento profundo y flujos agenticos. El modelo incorpora modo de pensamiento nativo y soporte de uso de herramientas, segun la informacion publica de Vection Labs. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otros ajustes por preferencias: esa informacion no esta disponible en el material proporcionado.

En este repositorio no hay entrenamiento ni modificacion de pesos de ningun tipo. El proceso documentado es exclusivamente de conversion y cuantizacion: desde los safetensors en BF16 del modelo original se genera un master GGUF en BF16, y de ese unico master se derivan las cuatro variantes (Q4_K_M, Q5_K_M, Q6_K y Q8_0), evitando la recuantizacion en cadena. El pipeline declara validacion de cabecera GGUF, comprobacion de preservacion de numero, tipo y forma de tensores tras la reescritura de metadatos, carga en llama.cpp, carga de tokenizer y plantilla de chat, generacion real de chat completions y pruebas de humo con backend Vulkan. La validacion se realizo en una AMD Radeon RX 5700 XT de 8 GB; Q4_K_M y Q5_K_M se validaron con offload completo de GPU y las cuatro variantes se probaron de nuevo con offload parcial por Vulkan. Se publican sumas de verificacion SHA256 en el archivo SHA256SUMS.

## Capacidades

- Generacion de texto y codigo: el repositorio esta explicitamente validado para inferencia de texto y codigo.
- Razonamiento con modo de pensamiento: el modelo upstream declara capacidades nativas de thinking y razonamiento profundo.
- Ingenieria de software: orientado a tareas de desarrollo y, en particular, a frontend.
- Uso de herramientas (tool calling / function calling): etiquetado como agentic y tool-use en el modelo upstream.
- Flujos agenticos multi-paso sobre contexto largo, apoyados en la ventana nativa de 262.144 tokens del modelo original.
- Capacidades multilingues: no disponibles; los metadatos solo declaran ingles (en).
- Vision (imagenes y video): el modelo original es multimodal, pero este repositorio no incluye ni valida un proyector de vision (mmproj), por lo que estas capacidades no estan operativas en estas cuantizaciones.
- Compatibilidad declarada con endpoints de Hugging Face (etiqueta endpoints_compatible) y con llama.cpp.

## Casos de uso

- Asistente de codigo en local para un desarrollador individual: con la cuantizacion Q5_K_M (6,64 GB) se puede servir el modelo con offload completo en una GPU de 8 GB usando llama-server con -ngl 999, sin depender de APIs externas ni de conexion a internet.
- Agente de ingenieria de software multi-paso: el soporte de tool calling y el contexto nativo de 262.144 tokens permiten encadenar lectura de archivos, edicion, ejecucion de comandos y verificacion dentro de la misma sesion, manteniendo el historial del repositorio en el contexto.
- Generacion y refactorizacion de frontend: el modelo esta etiquetado especificamente para frontend, por lo que resulta adecuado para producir componentes, maquetacion y ajustes de estilo a partir de descripciones o de codigo existente.
- Analisis de repositorios completos: con Q4_K_M (5,78 GB) en una GPU de 6 GB o con offload parcial en GPUs menores, se pueden procesar bases de codigo grandes en una sola pasada, siempre que el KV-cache quepa en memoria.
- Revision automatica de pull requests en CI/CD: el modelo puede desplegarse como servicio llama-server y ser invocado desde un runner para revisar diffs, sugerir cambios y detectar errores antes del merge.
- Chat self-hosted con contexto largo: al exponer llama-server, se obtiene un endpoint local compatible con el ecosistema llama.cpp para integrarlo en herramientas internas de documentacion o soporte tecnico.
- Entornos aislados o con requisitos de cumplimiento: al ser pesos Apache-2.0 ejecutables en local, es apto para organizaciones que no pueden enviar codigo propietario a servicios de terceros.
- Sustitucion de un modelo mayor con restricciones de VRAM: Q8_0 (9,79 GB) ofrece el perfil de mayor fidelidad del upstream para GPUs de 12 GB, mientras que Q6_K permite un punto intermedio no cubierto por los perfiles originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y tampoco se han encontrado en la busqueda web datos comparativos del modelo original. La unica validacion documentada es funcional, no comparativa:

| Prueba realizada | Resultado declarado |
|---|---|
| Validacion de cabecera GGUF | correcta en las cuatro cuantizaciones |
| Preservacion de numero, tipo y forma de tensores | verificada tras reescribir metadatos |
| Carga en llama.cpp (modelo, tokenizer, plantilla de chat) | correcta |
| Generacion real de chat completion | correcta |
| Prueba de humo con backend Vulkan, offload parcial | correcta en las cuatro variantes |
| Offload completo en AMD Radeon RX 5700 XT (8 GB) | Q4_K_M y Q5_K_M |
| Sumas SHA256 | publicadas en SHA256SUMS |

## Requisitos de hardware

- Q4_K_M: 5,78 GB en disco; perfil de GPU de 6 GB segun la guia del modelo upstream.
- Q5_K_M: 6,64 GB en disco; perfil de GPU de 8 GB y opcion recomendada por el upstream. Es la variante validada con offload completo en una RX 5700 XT de 8 GB.
- Q6_K: 7,56 GB en disco; variante anadida por este repositorio. La prueba de humo con offload parcial valida compatibilidad con el runtime, no que quepa entera en 8 GB de VRAM.
- Q8_0: 9,79 GB en disco; perfil de GPU de 12 GB segun el upstream (perfil de mejor calidad).
- Offload parcial: documentado como via para ejecutar variantes grandes en GPUs con menos VRAM que el perfil correspondiente, a costa de latencia.
- GPU de referencia en las pruebas: AMD Radeon RX 5700 XT, 8 GB, con llama.cpp a868c3e3c56657f7e8a6231190dbbe90e7dd86c0 y backend Vulkan.
- Cabe en GPU de consumo: si, en el rango de 8 a 12 GB de VRAM para las variantes Q5_K_M y Q8_0 respectivamente; Q4_K_M apunta a 6 GB.
- KV-cache: el contexto nativo es de 262.144 tokens, pero la memoria necesaria para el KV-cache escala con la longitud efectiva, el backend y el batch size, y no esta cuantificada en la informacion disponible. En la practica sera el factor limitante antes que el tamano de los pesos.
- Despliegue documentado: llama.cpp mediante llama-server con el flag -hf, por ejemplo `llama-server -hf florenciodri/Maestro-2-9B-Preview-GGUF:Q5_K_M -ngl 999`. El ajuste de -ngl debe adaptarse a la VRAM disponible.
- Otros runners (Ollama, vLLM, TGI) no estan documentados ni validados en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks publicos de este modelo ni del modelo original, por lo que no es posible comparar su rendimiento con el de alternativas de tamano similar. La unica comparacion que puede establecerse con los datos aportados es entre las propias variantes de cuantizacion y el modelo original en BF16:

| Variante | Tamano | Perfil de VRAM indicado | Fidelidad respecto al BF16 | Origen del perfil |
|---|---:|---|---|---|
| BF16 (modelo base) | no disponible | no disponible | referencia | upstream |
| Q8_0 | 9,79 GB / 9,11 GiB | 12 GB | perdida minima (perfil de mejor calidad) | upstream |
| Q6_K | 7,56 GB / 7,04 GiB | no especificado | intermedia | este repositorio |
| Q5_K_M | 6,64 GB / 6,19 GiB | 8 GB | recomendada por el upstream | upstream |
| Q4_K_M | 5,78 GB / 5,38 GiB | 6 GB | perfil de baja memoria | upstream |

Comparativa con otros modelos de la misma categoria (parametros, contexto, rendimiento, licencia y disponibilidad): no disponible.

## Limitaciones y advertencias

- No es un modelo multimodal operativo: el modelo original acepta texto, imagen y video, pero este repositorio no incluye ni valida el proyector de vision (mmproj). Debe tratarse como un paquete validado para texto y codigo.
- Idioma: los metadatos solo declaran ingles. No hay informacion sobre el comportamiento en castellano ni en otros idiomas, por lo que el rendimiento multilingue es desconocido.
- Ausencia total de benchmarks publicos: no hay evidencia cuantitativa de calidad, razonamiento o generacion de codigo en la informacion disponible. Cualquier evaluacion en produccion deberia hacerse con datos propios.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Es un riesgo inherente a los modelos generativos de esta escala, agravado por la falta de evaluaciones publicadas.
- Contexto largo en teoria, limitado en la practica: los 262.144 tokens nativos dependen de la VRAM, de la configuracion del KV-cache, del backend, del batch size y de la estrategia de offload. En GPUs de consumo, el contexto efectivo sera muy inferior.
- Los perfiles de VRAM (6, 8 y 12 GB) provienen de la model card del modelo upstream y corresponden a los pesos, no incluyen el KV-cache ni el resto de consumos de memoria del sistema.
- Q6_K no esta respaldada por un perfil de hardware del upstream; su idoneidad en GPUs de 8 GB no esta afirmada por el autor.
- Las pruebas de humo con offload parcial en Q6_K y Q8_0 validan compatibilidad con el runtime, no que esas variantes quepan completas en 8 GB de VRAM.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. La titularidad de los pesos originales sigue siendo de Vection Labs y la cuantizacion se atribuye a Florêncio Dri; conviene revisar la model card del modelo upstream para las condiciones autoritativas de uso responsable.
- Modelo en estado Preview: puede recibir cambios o sustituciones por parte del autor original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado el 1 de octubre de 2026 y actualizado el 2 de octubre de 2026: no existe validacion por parte de la comunidad.
- No se documentan cuantizaciones de tipo IQ (importancia) ni formatos alternativos; solo las cuatro variantes K-cuants y Q8_0 indicadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/florenciodri/Maestro-2-9B-Preview-GGUF
- Modelo base: https://huggingface.co/vectionlabs/Maestro-2-9B-Preview
- Coleccion Maestro de Vection Labs: https://huggingface.co/collections/vectionlabs/maestro
- Pagina de despliegue de Maestro-2-9B-Preview en Featherless: https://featherless.ai/models/vectionlabs/Maestro-2-9B-Preview
- Perfil del autor de la cuantizacion: https://huggingface.co/florenciodri

Nota: en la busqueda web aparecen tambien los proyectos Florence-2 (maestro.roboflow.com) y roboflow/maestro, que no guardan relacion con Maestro 2 de Vection Labs y corresponden a una coincidencia de nombre.
