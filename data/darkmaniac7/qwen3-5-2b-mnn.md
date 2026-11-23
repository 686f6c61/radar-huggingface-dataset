# darkmaniac7/Qwen3.5-2B-MNN

## Resumen

Qwen3.5-2B-MNN es un paquete de inferencia en formato MNN del modelo Qwen3.5 2B de Alibaba, preparado para ejecutarse en dispositivos moviles Android. El paquete original lo genera el equipo taobao-mnn, y esta version concreta la publica darkmaniac7 bajo la marca TokForge como espejo byte a byte del bundle original, con un cabezal opcional de prediccion multi-token (MTP) anadido. El modelo combina un transformer hibrido con capas de atencion lineal Gated DeltaNet y capas de atencion completa, junto con un codificador visual, lo que le permite procesar texto e imagenes.

El modelo resuelve el problema de ejecutar un LLM multimodal con capacidades de razonamiento en telefonos de gama media sin conexion a red. Con 2.000 millones de parametros cuantizados a 4 bits (bloque 64, HQQ), el paquete ocupa 1,47 GB y esta pensado para telefonos con 6 GB de RAM o mas. El contexto original del modelo base alcanza los 262.144 tokens, y el vocabulario es de 248.320 tokens.

La relevancia actual radica en la combinacion de tres elementos: arquitectura hibrida eficiente en computo (18 capas Gated DeltaNet y 6 de atencion completa sobre 24 totales), soporte multimodal nativo y un cabezal MTP que acelera la decodificacion especulativa en la ruta de CPU. La licencia Apache-2.0 facilita su uso comercial y su integracion en aplicaciones de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida: 24 capas (18 Gated DeltaNet de atencion lineal + 6 de atencion completa) con codificador visual |
| Parametros totales | 2B (aproximado, segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en el modelo original |
| Tipos de cuantizacion | 4 bits, tamano de bloque 64, HQQ |
| Idiomas soportados | 201 idiomas y dialectos (segun model card); lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN bundle (`llm.mnn.weight`, `visual.mnn.weight`, `mtp-v32k.mnn.weight`) |
| Vocabulario | 248.320 tokens |
| Tamano del paquete | 1,47 GB (12 archivos) |
| Plataforma objetivo | Android (CPU por defecto; NPU opcional en Snapdragon 8 Elite Gen 5 y 8 Gen 3) |
| RAM minima recomendada | 6 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5 2B es un transformer hibrido que intercala 18 capas de Gated DeltaNet (atencion lineal con estado recurrente) con 6 capas de atencion completa, sobre un total de 24 capas. Este diseno reduce el coste computacional y de memoria del mecanismo de atencion en secuencias largas, lo que resulta critico para un despliegue en CPU movil con contexto de hasta 262.144 tokens. El modelo incorpora ademas un codificador visual que habilita la entrada de imagenes junto con texto (pipeline `image-text-to-text`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card indica que los modelos Qwen3.5 pueden "pensar antes de responder" y que Alibaba distribuye el 2B con el modo de razonamiento desactivado por defecto, mientras que el `config.json` de este bundle lo activa. La innovacion tecnica destacable de este paquete es el cabezal MTP opcional (`mtp-v32k.mnn`), que genera borradores de tokens que el tronco verifica, de modo que nunca se anade un token que el tronco no haya seleccionado; TokForge lo usa solo en la ruta de CPU MNN y decide por telefono si emplearlo.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes combinadas con texto (pipeline image-text-to-text).
- Razonamiento con modo "thinking" activado por defecto en este bundle.
- Cobertura multilingue amplia: 201 idiomas y dialectos segun la model card.
- Decodificacion especulativa mediante cabezal MTP opcional en CPU.
- Aceleracion opcional de prompts largos mediante paquete NPU en Snapdragon 8 Elite Gen 5 y 8 Gen 3.
- Inferencia totalmente offline una vez descargado el modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional offline en Android: el modelo se ejecuta integramente en el telefono a traves de la app TokForge, permitiendo conversaciones multi-turno sin conexion una vez descargado el paquete de 1,47 GB. Es adecuado por su tamano reducido y su cuantizacion a 4 bits, que lo hace viable en telefonos de 6 GB de RAM.
- Descripcion y analisis de imagenes en movilidad: gracias al codificador visual incluido (`visual.mnn.weight`, 196 MB), el usuario puede enviar fotos y formular preguntas sobre ellas sin subir datos a la nube, lo que resulta util en entornos con requisitos de privacidad.
- Traduccion y asistencia multilingue en dispositivo: la cobertura de 201 idiomas y dialectos permite construir funciones de traduccion o redaccion multilingue que funcionan sin red, util para viajeros o en zonas con conectividad limitada.
- Procesamiento de documentos largos en el telefono: el contexto original de 262.144 tokens permite resumir o consultar documentos extensos localmente, aunque el rendimiento real dependera de la memoria disponible y de la ruta de ejecucion.
- Aceleracion de respuestas en prompts largos: en telefonos con Snapdragon 8 Elite Gen 5 o 8 Gen 3, el paquete NPU opcional (`Qwen3.5-2B-NPU-catalogpair`) permite que la NPU procese prompts largos mientras la CPU genera la respuesta, reduciendo la latencia percibida.
- Integracion en aplicaciones Android de terceros: al distribuirse bajo Apache-2.0 y en formato MNN, un desarrollador puede empaquetar el modelo en su propia app mediante la libreria MNN, por ejemplo para asistentes de campo, soporte tecnico offline o herramientas educativas.
- Prototipado de razonamiento con modo thinking: el bundle activa el modo de razonamiento por defecto, lo que permite evaluar en movil comportamientos de cadena de pensamiento antes de responder, util para pruebas de concepto de asistentes que justifican sus respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el paquete completo ocupa 1,47 GB en disco; TokForge lo cataloga para telefonos con 6 GB de RAM o mas. No se especifica el consumo exacto en ejecucion.
- GPU recomendadas: no aplica en la ruta principal; el modelo se ejecuta en CPU de Android por defecto.
- Aceleracion NPU: paquete opcional para Snapdragon 8 Elite Gen 5 y 8 Gen 3 (procesa prompts largos en NPU mientras la CPU genera la respuesta).
- Cabe en GPU consumer: no disponible; el formato MNN esta orientado a movil, no a GPUs de escritorio.
- Opciones de despliegue: runtime MNN (libreria `mnn`) y la app TokForge (Google Play en Android, TestFlight en iOS). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3.5-2B-MNN (este) | 2B (4 bits) | 262.144 tokens (modelo original) | Si (texto + imagen) | Apache-2.0 | MNN, movil Android |
| taobao-mnn/Qwen3.5-2B-MNN | 2B (4 bits) | 262.144 tokens | Si | Apache-2.0 | MNN, movil Android |
| Qwen/Qwen3.5-2B (base) | 2B | 262.144 tokens | Si | Apache-2.0 | Safetensors y otros formatos estandar |

La diferencia principal frente al bundle original de taobao-mnn es la adicion del cabezal MTP opcional y la integracion en la app TokForge; los archivos del tronco son identicos byte a byte. Frente al modelo base de Qwen, este paquete esta cuantizado a 4 bits y empaquetado para inferencia movil, por lo que sacrifica precision numerica a cambio de un tamano manejable en telefono. No se dispone de datos de rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- Al estar cuantizado a 4 bits con HQQ, es esperable cierta perdida de calidad frente al modelo base en precision completa; no se han publicado mediciones de esa degradacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 2B parametros; no se han publicado evaluaciones de fidelidad para este paquete.
- El contexto de 262.144 tokens corresponde al modelo original; el contexto efectivo en el telefono dependera de la RAM disponible y de la implementacion MNN, y no se especifica en la informacion.
- La lista concreta de idiomas soportados no esta disponible, solo la cifra agregada de 201 idiomas y dialectos.
- El modo de razonamiento ("thinking") viene activado por defecto en este bundle, lo que puede aumentar la latencia y el consumo de tokens frente al comportamiento por defecto de Qwen.
- La aceleracion NPU solo esta disponible en Snapdragon 8 Elite Gen 5 y 8 Gen 3, y requiere descargar un paquete adicional.
- El cabezal MTP solo se usa en la ruta de CPU MNN; su disponibilidad depende de la decision por telefono que toma TokForge.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene verificar las condiciones de la app TokForge si se usa su distribucion oficial.
- El formato MNN limita el despliegue a entornos compatibles con la libreria MNN; no es directamente utilizable en stacks de servidor habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/Qwen3.5-2B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Bundle original de taobao-mnn: https://huggingface.co/taobao-mnn/Qwen3.5-2B-MNN
- Paquete NPU opcional: https://huggingface.co/darkmaniac7/Qwen3.5-2B-NPU-catalogpair
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (Android): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Coleccion TokForge Chat Models (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-chat-models-mnn-69cdcddc86ea126668a5e9e8
- Coleccion TokForge Qwen Models (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-qwen-models-mnn-69cc8b98317551109a7ae907
- Coleccion TokForge Vision Models: https://huggingface.co/collections/darkmaniac7/tokforge-vision-models-6af3fdd73fff746c25bdd4fd
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
