# HuangYan888/Qwen3.5-0.8B-uncensored-MNN

## Resumen

Qwen3.5-0.8B-uncensored-MNN es un paquete de inferencia en formato MNN de 4 bits derivado de la variante abliterada de Qwen3.5 0.8B publicada por huihui-ai. El modelo original lo desarrolla el equipo Qwen de Alibaba Cloud; la abliteracion (eliminacion de la direccion de rechazo en los pesos) la realiza huihui-ai, y la conversion a MNN la publica HuangYan888 bajo la marca TokForge. El objetivo es permitir chat multimodal (texto e imagen) completamente en local en telefonos Android, sin conexion una vez descargado el bundle.

Se trata de un transformer hibrido de 24 capas que combina 18 capas de LinearAttention con 6 capas de atencion completa, e incorpora un codificador visual separado. El modelo base tiene 0,8 mil millones de parametros y el bundle ocupa unos 549 MB distribuidos en 9 ficheros, con los pesos principales del LLM en 470 MB. La ventana de contexto no se especifica en la informacion disponible.

Su relevancia actual radica en que es un ejemplo de despliegue de un modelo multimodal pequeno en hardware movil mediante el runtime MNN de Alibaba, con una cuantizacion HQQ de 4 bits en bloques de 64. No es un checkpoint de Transformers estandar, sino un artefacto especifico para el ecosistema MNN 3.5.0 o superior y, en la practica, para la aplicacion TokForge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida: 24 capas (18 LinearAttention + 6 atencion completa) con codificador visual |
| Parametros totales | 0,8B (segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, bloque 64, HQQ (pesos); exportacion con mix-mask |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN bundle (`llm.mnn.weight`, `visual.mnn.weight`), tokenizer `.mtok` |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3.5 0.8B, un transformer con atencion hibrida: 18 de sus 24 capas usan LinearAttention y 6 usan atencion completa. El bundle declara metadatos de atencion mixta (`attention_type:"mix"`, `layer_nums:24`, `sliding_window:4`) y una mascara apilada con forma `[2,1,1,seq,kv]`. Incluye ademas un codificador visual independiente (`visual.mnn` y `visual.mnn.weight`) que habilita la entrada de imagenes junto a texto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo original en la informacion proporcionada. La unica transformacion documentada es la abliteracion aplicada por huihui-ai, que elimina la direccion de rechazo de los pesos, y la posterior conversion a MNN mediante `llmexport` del fork de MNN de TokForge, rebasado sobre MNN 3.5.0. La cuantizacion HQQ de 4 bits con bloque 64 replica los parametros del bundle taobao-mnn de 0.8B.

## Capacidades

- Generacion de texto conversacional en ingles.
- Comprension de imagenes combinada con texto (pipeline image-text-to-text).
- Razonamiento y respuesta a instrucciones propias de un modelo de 0,8B.
- Ejecucion completamente en local en CPU de telefonos Android mediante MNN.
- Comportamiento abliterado: rechaza menos peticiones que el Qwen3.5 0.8B original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Chat multimodal sin conexion en Android: el bundle se carga en la app TokForge y permite conversar con texto e imagenes una vez descargado, sin enviar datos a la nube.
- Asistencia visual en campo: un tecnico puede fotografiar un equipo o etiqueta y consultar al modelo en el propio dispositivo, util en entornos sin cobertura.
- Prototipado de aplicaciones moviles con MNN: sirve como referencia para integrar un LLM hibrido con vision en un runtime MNN 3.5.0 o superior.
- Evaluacion de modelos abliterados: permite estudiar en movil como cambia el comportamiento de rechazo respecto al Qwen3.5 0.8B original.
- Procesamiento de documentos y capturas en local: descripcion o extraccion de informacion de imagenes sin salir del telefono, adecuado por privacidad.
- Demos y pruebas de concepto de IA en el dispositivo: su tamano de 549 MB y su ejecucion en CPU lo hacen manejable para validar flujos multimodales en hardware de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica directamente; el bundle esta pensado para CPU de telefonos Android. El fichero de pesos principal ocupa 470 MB y el total descargado es de 549 MB.
- RAM: la model card indica que requiere mas RAM libre que el tamano de su fichero de pesos principal de 0,47 GB, sin especificar una cifra concreta.
- GPU recomendadas: no disponible; el runtime de TokForge ejecuta Qwen3.5 en CPU por defecto.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el formato MNN esta orientado a movil.
- Opciones de despliegue: runtime MNN 3.5.0 o superior (fork de MNN de TokForge) y la aplicacion TokForge en Android (Google Play) o iOS (TestFlight). No es compatible con runtimes de mascara unica antiguos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-uncensored-MNN (este) | 0,8B | no disponible | Texto + imagen | MNN 4 bits | Apache-2.0 |
| huihui-ai/Huihui-Qwen3.5-0.8B-abliterated (base) | 0,8B | no disponible | Texto + imagen | Transformers | Apache-2.0 |
| Qwen/Qwen3.5-0.8B (original) | 0,8B | no disponible | Texto + imagen | Transformers | Apache-2.0 |

La comparativa se limita a la cadena de derivacion del propio modelo, ya que no se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un bundle de runtime MNN, no un checkpoint estandar de Transformers; no se puede cargar con `transformers`, vLLM ni llama.cpp.
- Requiere un runtime MNN con la ruta `gen_attention_mask` de mascara mixta (MNN 3.5.0 o superior); los runtimes de mascara unica no son compatibles.
- La cuantizacion de 4 bits puede reducir ligeramente la calidad frente al modelo original en precision completa.
- El modelo esta abliterado: se ha eliminado su comportamiento de rechazo, por lo que puede generar contenido que el modelo original rechazaria. Uso responsable.
- Idiomas: solo ingles segun los metadatos; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a un modelo de 0,8B; no se han publicado evaluaciones que lo cuantifiquen.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo abliterado en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; se trata de una publicacion reciente y poco validada por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/HuangYan888/Qwen3.5-0.8B-uncensored-MNN
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-0.8B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- MNN (Alibaba): https://github.com/alibaba/MNN
- TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight (TokForge): https://testflight.apple.com/join/jnufjzRr
- Coleccion TokForge Qwen Models (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-qwen-models-mnn-69cc8b98317551109a7ae907
- Coleccion TokForge Vision Models: https://huggingface.co/collections/darkmaniac7/tokforge-vision-models-6af3fdd73fff746c25bdd4fd
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
