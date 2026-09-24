# qualcomm/SmolVLM2-2.2B-Instruct

## Resumen

SmolVLM2-2.2B-Instruct (repositorio `qualcomm/SmolVLM2-2.2B-Instruct`) es una distribucion del modelo vision-lenguaje SmolVLM2 de Hugging Face, empaquetada y optimizada por Qualcomm para su ejecucion en dispositivo (on-device) sobre chipsets Snapdragon. El modelo original es capaz de entender texto e imagenes y de resolver tareas como respuesta visual a preguntas (VQA), generacion de descripciones de imagen (image captioning) y reconocimiento optico de caracteres (OCR). Qualcomm no reentrena el modelo: adapta, exporta y compila los pesos para su runtime GenieX y para el ecosistema Qualcomm AI Hub.

El interes practico de esta ficha esta en el formato de despliegue, no en una mejora de capacidades. El repositorio ofrece un asset pre-exportado en GGUF con cuantizacion `q8_0` para el runtime `GENIEX_LLAMACPP`, ademas de la libreria `qai_hub_models` para compilar y exportar configuraciones propias (pesos ajustados, formas de entrada personalizadas, dispositivo y runtime objetivo). Con 2.200 millones de parametros y licencia Apache 2.0, es un candidato razonable para inferencia multimodal local en movil, portatil con Snapdragon X Elite o dispositivos edge, sin enviar imagenes a la nube.

La ficha publica de Qualcomm incluye una tabla de rendimiento medida sobre dispositivos reales: entre 10 y 50 tokens por segundo en decodificacion, con tiempos hasta el primer token que van de 0,05 s a mas de 30 s segun el chipset y la longitud de contexto (512 frente a 4096 tokens). Estos datos, junto con el tamao reducido, definen el nicho del modelo: aplicaciones multimodales con requisitos de privacidad o conectividad intermitente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje (vlm); la informacion proporcionada no detalla la arquitectura interna (encoder visual ni decoder de lenguaje) |
| Parametros totales | 2.200 millones (2.2B), segun la denominacion del modelo |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No especificada en la documentacion del repositorio; las configuraciones evaluadas en la tabla de rendimiento usan 512 y 4096 tokens |
| Tipos de cuantizacion | `q8_0` (asset GGUF pre-exportado). La libreria `qai_hub_models` permite exportar con configuraciones personalizadas, pero no se enumeran otras precisiones en la informacion disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`SmolVLM2-2.2B-Instruct-Q8_0.gguf`, alojado en `ggml-org/SmolVLM2-2.2B-Instruct-GGUF`); el repositorio declara `library_name: pytorch` y ofrece assets pre-exportados de Qualcomm AI Hub |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: no se detallan el encoder de vision, el decoder de lenguaje, el mecanismo de atencion ni el esquema de fusion multimodal. El repositorio se limita a indicar que SmolVLM2 es un modelo vision-lenguaje ligero de Hugging Face que procesa texto e imagenes, y que esta version "se basa en la implementacion de SmolVLM2-2.2B-Instruct" publicada por el usuario `HuggingFaceTB`. Se referencia el articulo `arxiv:2504.05299` como publicacion asociada, pero su contenido no forma parte del material proporcionado.

Tampoco hay informacion sobre el entrenamiento: no se especifican el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico que anade Qualcomm es el proceso de posentrenamiento de despliegue: exportacion y compilacion mediante Qualcomm AI Hub Workbench, verificacion con la libreria `qai_hub_models` y publicacion de un asset cuantizado a `q8_0` para el runtime `GENIEX_LLAMACPP`, que se apoya en `llama.cpp`. Cualquier afirmacion sobre innovaciones tecnicas del modelo base queda fuera del alcance de la informacion disponible.

## Capacidades

- Generacion de texto y comprension de lenguaje natural, con etiqueta de pipeline `text-generation`.
- Comprension de imagenes: respuesta visual a preguntas (VQA) sobre el contenido de una imagen.
- Generacion de descripciones de imagen (image captioning).
- Reconocimiento optico de caracteres (OCR) sobre imagenes.
- Inferencia completamente local en dispositivo, sin dependencia de servicios en la nube para el procesado de imagen y texto.
- Soporte de contexto de hasta 4096 tokens en las configuraciones evaluadas publicadas por Qualcomm.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas soportados.
- Capacidades de vision en video, audio o modos de "pensamiento" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Respuesta visual a preguntas en aplicaciones moviles: una app de galeria o de notas puede permitir al usuario preguntar "que edificio es este" o "que pone en este cartel" enviando la imagen al modelo ejecutado en el propio telefono, con tiempos de primer token de 0,05 a 1,5 s a 512 tokens de contexto en Snapdragon 8 Elite Gen 5.
- Accesibilidad para personas con discapacidad visual: descripcion continua de escenas o de objetos cercanos capturados por la camara. La latencia de decodificacion (aproximadamente 29 tokens/s a contexto 512 en Snapdragon 8 Elite Gen 5) permite frases cortas casi en tiempo real, y el proceso local evita subir imagenes personales a terceros.
- Digitalizacion de documentos en campo: digitalizacion de facturas, albaranes o etiquetas mediante OCR sin conexion, util en almacenes, obras o zonas sin cobertura. El formato GGUF permite ejecutarlo con llama.cpp en un portatil con Snapdragon X Elite (hasta 50,4 tokens/s a 512 tokens de contexto en la tabla publicada).
- Asistencia tecnica de mantenimiento: el tecnico fotografia un equipo o un panel de error y el modelo extrae el codigo, lo interpreta y sugiere el siguiente paso. La ventana de 4096 tokens permite adjuntar contexto adicional (historial de incidencias, manual resumido) en la misma conversacion.
- Generacion automatica de metadatos en bibliotecas de imagenes: captioning por lotes para catalogos de producto, archivos fotograficos o sistemas de gestion documental. Al ser Apache 2.0 y ejecutarse en local, encaja en pipelines internos sin coste por inferencia ni cesion de datos.
- Verificacion de inventario y lineal en retail: el operario fotografia una estanteria o un ticket y el modelo responde sobre productos visibles, precios o discrepancias. El tamao de 2,2B permite desplegarlo en terminales portatiles con Snapdragon en lugar de depender de la red de la tienda.
- Clasificacion y moderacion de contenido visual en el edge: filtrado previo de imagenes en el propio dispositivo antes de subirlas a un servicio central, reduciendo ancho de banda y exposicion de datos sensibles, con la salvedad de que el modelo genera texto y no probabilidades calibradas por clase.
- Automatizacion domotica o robotica ligera: un dispositivo con Snapdragon puede interpretar una imagen de la camara y devolver una instruccion textual que alimente una logica de control local, con el limite de que no se documenta soporte de function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni metricas equivalentes, ni comparaciones con otros modelos.

Lo que si publica Qualcomm es una tabla de rendimiento de inferencia por dispositivo y longitud de contexto, con el runtime `GENIEX_LLAMACPP` y precision `q8_0`:

| Chipset | Contexto | Tokens por segundo | Tiempo hasta el primer token (s) |
|---|---|---|---|
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 512 | 24,91 - 29,44 | 0,05 - 1,90 |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 4096 | 11,02 - 15,56 | 0,07 - 35,36 |
| Snapdragon 8 Elite For Galaxy Mobile | 512 | 24,91 - 28,24 | 0,06 - 1,90 |
| Snapdragon 8 Elite For Galaxy Mobile | 4096 | 11,02 - 15,89 | 0,10 - 35,36 |
| Snapdragon X2 Elite | 512 | 18,59 - 50,41 | 0,10 - 0,59 |
| Snapdragon X2 Elite | 4096 | 10,03 - 24,00 | 0,09 - 7,68 |
| Snapdragon X Elite | 512 | 17,82 - 32,86 | 0,14 - 1,34 |

Los rangos recogen las distintas mediciones publicadas por el fabricante para cada combinacion de chipset y contexto. Se observa una caida clara del throughput y un aumento fuerte del tiempo hasta el primer token al pasar de 512 a 4096 tokens de contexto.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del numero de parametros, no publicada por el autor): en `q8_0`, en torno a 2,4 GB solo para los pesos; en fp16, en torno a 4,5 GB; en cuantizaciones de 4 bits, en torno a 1,3-1,5 GB. Hay que sumar el encoder de vision, las activaciones y la cache KV, cuyo tamao crece con el contexto.
- GPU de centro de datos: no es el objetivo del repositorio; Qualcomm no publica datos para A100, H100 ni similares.
- GPU de consumo: por tamao, el modelo deberia caber en GPUs consumer con 8 GB o mas de VRAM en `q8_0` (por ejemplo, RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070), aunque no se aportan mediciones que lo confirmen.
- Dispositivos edge objetivo: Snapdragon 8 Elite Gen 5 For Galaxy Mobile, Snapdragon 8 Elite For Galaxy Mobile, Snapdragon X2 Elite y Snapdragon X Elite, con el runtime `GENIEX_LLAMACPP` y precision `q8_0`.
- Opciones de despliegue documentadas: GenieX (quickstart oficial de Qualcomm), runtime `GENIEX_LLAMACPP` y exportacion con la libreria `qai_hub_models`. El asset es un GGUF, por lo que tambien es compatible con el ecosistema llama.cpp. No se mencionan vLLM, TGI, Ollama ni otras alternativas en la informacion disponible.
- Latencia y throughput medidos: 10,03-50,41 tokens/s en decodificacion y 0,05-35,36 s hasta el primer token, segun chipset y contexto (ver tabla de la seccion anterior).
- Flujo de trabajo alternativo: exportacion personalizada con Qualcomm AI Hub Models para pesos ajustados, formas de entrada propias y configuracion de dispositivo y runtime; requiere compilar mediante Qualcomm AI Hub Workbench.

## Comparativa con modelos similares

No se dispone de informacion sobre alternativas comparables en el material proporcionado. La unica comparacion que puede establecerse con los datos disponibles es entre esta distribucion de Qualcomm y el modelo base del que deriva:

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualcomm/SmolVLM2-2.2B-Instruct | 2,2B | 512 y 4096 tokens en las configuraciones evaluadas | GGUF `q8_0`, runtime GENIEX_LLAMACPP, assets de Qualcomm AI Hub | Apache 2.0 | Hugging Face y Qualcomm AI Hub |
| HuggingFaceTB/SmolVLM2-2.2B-Instruct | 2,2B | No disponible en la informacion proporcionada | Pesos PyTorch (referenciado como implementacion de origen) | No disponible en la informacion proporcionada | Hugging Face |
| Otros VLM ligeros (Qwen-VL, PaliGemma, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo ni sobre la composicion de sus datos de entrenamiento, por lo que no es posible evaluar sesgos demograficos, culturales o linguisticos.
- Riesgo de alucinacion inherente a los modelos generativos: al describir imagenes o leer texto en imagenes puede inventar detalles no presentes, especialmente con imagenes borrosas, poco iluminadas o con texto pequeno.
- Idiomas soportados no declarados: el repositorio no lista idiomas, de modo que el rendimiento en castellano no esta verificado por el autor.
- Limitacion de contexto: las mediciones publicadas se detienen en 4096 tokens y el tiempo hasta el primer token en ese regimen alcanza los 35 s en movil, lo que descarta conversaciones largas o documentos extensos en dispositivo.
- Coste de la multimodalidad: cada imagen consume tokens de contexto y anade latencia de preprocesado; no se publican metricas especificas de codificacion de imagen.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, por lo que no deberia asumirse su uso en arquitecturas de agentes sin verificacion previa.
- La licencia Apache 2.0 del repositorio permite uso comercial, pero conviene verificar la licencia del modelo base y de los componentes de terceros que intervienen en la exportacion (runtime GenieX, llama.cpp, Qualcomm AI Hub).
- El modelo esta optimizado para hardware Snapdragon: el rendimiento en otros aceleradores no esta medido por el autor y puede diferir sustancialmente.
- El repositorio presenta cero descargas y cero "likes" en el momento de la consulta, y su fecha de creacion indicada es posterior a la de esta revision; conviene tratar los assets como recientes y poco validados por la comunidad.
- Para usar la exportacion personalizada es necesario registrarse en Qualcomm AI Hub y disponer de acceso al workbench alojado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qualcomm/SmolVLM2-2.2B-Instruct
- Modelo base (Hugging Face): https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Asset GGUF pre-exportado: https://huggingface.co/ggml-org/SmolVLM2-2.2B-Instruct-GGUF/resolve/main/SmolVLM2-2.2B-Instruct-Q8_0.gguf
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/smolvlm2_2_2b_instruct
- Libreria y codigo de exportacion (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.63.0/src/qai_hub_models/models/smolvlm2_2_2b_instruct
- Quickstart de GenieX: https://geniex.aihub.qualcomm.com/en/get-started/quickstart
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Articulo referenciado: arxiv:2504.05299
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relacionados con el modelo; los enlaces encontrados trataban sobre identificacion de escarabajos y no se han incluido por no ser relevantes.
