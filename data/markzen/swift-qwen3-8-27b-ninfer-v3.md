# markzen/Swift-Qwen3.8-27B-NInfer-v3

## Resumen

Swift-Qwen3.8-27B-NInfer-v3 es un artefacto de inferencia publicado por el usuario markzen en HuggingFace, consistente en una actualizacion de contenedor del modelo knoopx/Swift-Qwen3.8-27B-NInfer, que estaba fijado al formato NInfer v2. El modelo subyacente es una version multimodal (texto e imagen) derivada de ukisai/Swift-Qwen3.8-27B, empaquetada con cuantizacion mixta NVFP4/entera y orientada a ejecucion local en una GPU RTX 5090 mediante el motor NInfer.

El cambio introducido en esta version es exclusivamente estructural: no se han convertido, recuantizado ni modificado los pesos, y el payload v2 es byte a byte identico al original. Lo unico que cambia es el directorio del contenedor, reescrito al formato v3 mediante una entrada adicional en la tabla de recuentos conocidos de la herramienta de actualizacion. El fichero resultante ocupa 18.324.343.792 bytes (17,07 GiB), contiene 1307 objetos (1301 tensores y 6 recursos) y declara los componentes text, vision y mtp.

Su relevancia es fundamentalmente de infraestructura: permite a los usuarios de NInfer v3 cargar un modelo multimodal cuantizado a NVFP4 sin recuantizar, con decodificacion especulativa basada en MTP. No aporta mejoras de calidad ni de entrenamiento respecto al artefacto de origen, y no incluye validacion numerica publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal derivado de Qwen3.8, con componentes text, vision y mtp) |
| Parametros totales | ~27B segun la denominacion del modelo; no verificado en la informacion disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mixta: NVFP4, W8G32, Q4G64, Q5G64, Q6G64 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | .ninfer (contenedor NInfer version 3) |
| Nombre del fichero | Swift-Qwen3.8-27b-nvfp4-w8g32-q4g64-q5g64-q6g64-bf16.ninfer |
| Tamano del fichero | 18.324.343.792 bytes (17,07 GiB) |
| SHA-256 | 84da52a62ef76ef15ef5183c34a1a2cf4d9a9c0481c04b17ed6f6ef6e9f9cd01 |
| Objetos del contenedor | 1307 (1301 tensores, 6 recursos) |
| Bindings / uses | 1422 / 785 |
| Componentes | text, vision, mtp |
| Backend especulativo | MTP (`--spec mtp --draft-tokens 3`); DFlash2 no esta presente |
| Libreria de inferencia | ninfer |
| Pipeline declarado | image-text-to-text |
| Inferencia alojada | no (la model card declara `inference: false`) |
| Modelos base | ukisai/Swift-Qwen3.8-27B y knoopx/Swift-Qwen3.8-27B-NInfer (relacion: quantized) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (numero de capas, dimensiones, tipo de atencion, mecanismo de vision) ni sobre su proceso de entrenamiento, volumen de tokens, composicion del dataset o tecnicas de alineamiento como RLHF o DPO. Lo unico documentado es que el contenedor separa tres componentes funcionales: text, vision y mtp. El componente mtp corresponde a multi-token prediction y se emplea como unico backend de decodificacion especulativa, configurado con 3 tokens de borrador.

El aspecto tecnico diferencial del artefacto es el empaquetado: los pesos se almacenan en precision mixta, combinando NVFP4 con esquemas enteros de 8, 4, 5 y 6 bits y grupos de cuantizacion de 32 y 64 elementos, mas tensores en BF16. La actualizacion de v2 a v3 consistio en reescribir el directorio del contenedor. La herramienta oficial `tools/upgrade_ninfer_v2_to_v3.py` rechazaba el artefacto porque solo acepta pares `(model_id, weights_id)` oficiales y recuentos exactos de objetos; el graft contiene 1307 objetos bajo el par `("qwen3.8-27b", "nvfp4")`, ausente en la tabla, y la correccion aplicada fue anadir la entrada `stock.KNOWN_COUNTS[("qwen3.8-27b", "nvfp4")] = (1307,)`. El resto del proceso (directorio de salida, rangos de particiones y configuraciones de componentes) sigue el layout oficial de neroued/Qwen3.8-27B-nvfp4-NInfer v3.

Adicionalmente, la actualizacion sustituye la plantilla de chat original por `qwen3_8.jinja` de NInfer master, con modo pensamiento activado y esfuerzo `xhigh`. La plantilla previa puede restaurarse en el arranque con `--chat-template FILE`.

## Capacidades

- Generacion de texto y razonamiento en modo pensamiento, con esfuerzo configurado en `xhigh` por la plantilla de chat incluida.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), con un componente de vision dedicado.
- Decodificacion especulativa mediante MTP con 3 tokens de borrador, orientada a reducir la latencia de generacion.
- Carga en precision mixta NVFP4/entera, sin necesidad de recuantizar el artefacto de origen.
- Sustitucion de la plantilla de chat en tiempo de arranque mediante el parametro `--chat-template`.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible; no se declaran idiomas soportados.
- Capacidades de audio o cualquier otra modalidad distinta de texto e imagen: no disponibles.

## Casos de uso

- Asistente multimodal local: el modelo puede gestionar conversaciones que combinan imagenes y texto directamente en una estacion de trabajo con RTX 5090, sin depender de APIs externas, gracias a que los pesos caben en un unico fichero de 17,07 GiB y el pipeline declarado es `image-text-to-text`.
- Analisis de documentos y respuesta visual a preguntas: en un pipeline interno de extraccion de informacion, el componente de vision permite interpretar capturas, diagramas o formularios y el componente de texto genera la respuesta estructurada.
- Etiquetado y descripcion de imagenes por lotes: procesamiento offline de catalogos de imagenes para generar descripciones, donde el modo pensamiento con esfuerzo `xhigh` resulta util en casos que requieren inferencia sobre detalles visuales.
- Despliegue en entornos aislados: al ser un artefacto local con licencia apache-2.0 declarada, encaja en escenarios con requisitos de confidencialidad donde no se permite enviar datos a servicios alojados.
- Investigacion en cuantizacion NVFP4: el modelo sirve como caso de estudio para medir el impacto de la precision mixta (NVFP4, W8G32, Q4G64, Q5G64, Q6G64) sobre la calidad, siempre que el equipo aporte su propia evaluacion de perplejidad o divergencia KL, ya que el autor no la ha publicado.
- Evaluacion de decodificacion especulativa: permite medir la aceleracion real de MTP con 3 tokens de borrador frente a generacion autoregresiva pura en hardware Blackwell, y comparar con el rendimiento del artefacto v2 de origen.
- Desarrollo y validacion de la herramienta NInfer: el artefacto funciona como caso de prueba para el flujo de grafting v2 a v3, ya que reproduce un escenario de recuento de objetos no contemplado en la tabla oficial de la herramienta.
- Razonamiento extenso sobre texto: para tareas de analisis que no requieren vision, el modo pensamiento con esfuerzo `xhigh` permite cadenas de razonamiento largas antes de emitir la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la validacion fue unicamente estructural (encuadre del contenedor, directorio, rangos de bindings y verificacion de identidad byte a byte del payload respecto al origen v2) y que no se ejecuto ninguna comparacion de perplejidad ni de divergencia KL. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- El autor indica que el modelo requiere una RTX 5090 y una version de NInfer compilada desde master. No se documenta soporte para otras GPU.
- El fichero de pesos ocupa 17,07 GiB, por lo que la VRAM necesaria para inferencia es como minimo ese tamano, mas el espacio de cache KV, activaciones y buffers del motor. La cifra exacta de VRAM no esta disponible.
- Inferencia en GPU de consumo: si, segun el autor, unicamente en RTX 5090. No se documenta compatibilidad con otras GPU de consumo.
- Opciones de despliegue: exclusivamente el motor NInfer (repositorio Neroued/ninfer), compilado desde master. No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros runners.
- Decodificacion especulativa: se activa con `--spec mtp --draft-tokens 3`. DFlash2 no esta presente en este artefacto.
- Plantilla de chat: se puede sustituir en el arranque con `--chat-template FILE`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos relacionados, por lo que la comparacion se limita a lo documentado en las model cards y etiquetas.

| Modelo | Relacion | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|---|
| markzen/Swift-Qwen3.8-27B-NInfer-v3 | Artefacto analizado | ~27B (denominacion) | no disponible | .ninfer v3 | apache-2.0 | Contenedor v3, sin validacion numerica, sin DFlash2 |
| knoopx/Swift-Qwen3.8-27B-NInfer | Base directa (quantized) | no disponible | no disponible | .ninfer v2 | no disponible | Origen byte a byte del payload; fijado a v2 |
| ukisai/Swift-Qwen3.8-27B | Base del modelo | no disponible | no disponible | no disponible | no disponible | Modelo de origen antes de la cuantizacion |
| neroued/Qwen3.8-27B-nvfp4-NInfer | Referencia de layout v3 | no disponible | no disponible | .ninfer v3 | no disponible | Layout oficial v3 replicado; incluye DFlash2, ausente aqui |

No se dispone de datos comparativos de benchmarks entre estas variantes.

## Limitaciones y advertencias

- Ausencia total de validacion numerica: solo se verifico la estructura del contenedor y la identidad byte a byte del payload respecto al origen. No hay datos de perplejidad, divergencia KL ni evaluaciones de calidad, por lo que no puede garantizarse que el artefacto se comporte igual que el modelo original.
- Dependencia de hardware muy especifica: el autor exige una RTX 5090 y NInfer compilado desde master, lo que implica usar una rama en desarrollo no estable y limita el despliegue a un unico modelo de GPU.
- Cambio de plantilla de chat: la actualizacion instala `qwen3_8.jinja` con pensamiento activado y esfuerzo `xhigh`, sustituyendo la plantilla que acompanaba al artefacto original. Esto altera el formato del prompt y puede modificar sustancialmente las salidas; es imprescindible revisar la plantilla antes de comparar resultados con el modelo de origen.
- Versionado inconsistente: el repositorio usa "27B" y el nombre del fichero usa "27b"; ademas, el artefacto se describe como v3 pero los pesos son identicos al v2, por lo que la etiqueta de version refleja el contenedor y no el modelo.
- Sin adopcion verificable: cero descargas y cero "me gusta" en el momento de la consulta, y fecha de creacion muy reciente, por lo que no existe validacion por parte de la comunidad.
- Inferencia alojada desactivada: la model card declara `inference: false`, de modo que el widget de HuggingFace no sirve el modelo; hay que ejecutarlo en local.
- Idiomas y contexto desconocidos: no se declaran idiomas soportados ni longitud de contexto, lo que impide planificar despliegues multilingues o con ventanas largas sin pruebas propias.
- Riesgo de alucinacion: no evaluado. Al no existir benchmarks ni evaluaciones de fidelidad, el riesgo debe asumirse como el del modelo base, que tampoco esta documentado en la informacion disponible.
- Licencia: el artefacto declara apache-2.0, pero no se dispone de informacion sobre la licencia de los modelos base (ukisai/Swift-Qwen3.8-27B y knoopx/Swift-Qwen3.8-27B-NInfer). Antes de un uso comercial conviene verificar los terminos de la cadena de modelos de origen.
- Sesgos: no disponible. No se ha publicado ninguna evaluacion de sesgos.
- Backend especulativo unico: al no incluir DFlash2, la unica opcion de aceleracion es MTP con 3 tokens de borrador, sin margen de configuracion documentado mas alla de ese valor por defecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/markzen/Swift-Qwen3.8-27B-NInfer-v3
- Artefacto de origen (NInfer v2): https://huggingface.co/knoopx/Swift-Qwen3.8-27B-NInfer
- Modelo base original: https://huggingface.co/ukisai/Swift-Qwen3.8-27B
- Referencia de layout v3: https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer
- Motor de inferencia NInfer: https://github.com/Neroued/ninfer
