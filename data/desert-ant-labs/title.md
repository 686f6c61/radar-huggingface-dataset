# desert-ant-labs/title

## Resumen

Title es un modelo de lenguaje especializado en la generacion de titulos y descripciones cortas para cualquier pasaje de texto. Lo desarrolla Desert Ant Labs y esta afinado a partir de `ibm-granite/granite-4.0-350m`, un modelo base de arquitectura GraniteMoEHybrid. Con 352.379.904 parametros totales y un peso de repositorio de 0,3 GB, esta disenado explicitamente para inferencia en dispositivo (on-device) sobre plataformas Apple (iOS, macOS, tvOS y visionOS) mediante MLX.

El modelo resuelve un problema acotado y concreto: dado un fragmento de texto (principalmente transcripciones de audio, aunque tambien parrafos de noticias, descripciones de producto y correos electronicos), devuelve un titulo factual de 3 a 8 palabras y una descripcion de una o dos frases. El registro es deliberadamente sobrio: sin emojis, sin hashtags y sin clickbait. La descripcion identifica el pasaje concreto, no su tema generico.

Su relevancia actual radica en el despliegue local: Desert Ant Labs midio que Title escribe texto entre 5,7 y 8,3 veces mas rapido en la GPU mediante MLX que en el Neural Engine a traves de Core ML. Por ello el modelo se distribuye unicamente con pesos MLX cuantizados a 6 bits y requiere la trait `MLX` del paquete Swift para compilar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteMoEHybrid (transformer hibrido con componentes MoE, segun el tag `granitemoehybrid`) |
| Parametros totales | 352.379.904 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (pesos distribuidos en `model.safetensors`) |
| Idiomas soportados | multilingue |
| Licencia | Desert Ant Labs Source-Available License (`license: other`) |
| Formato de pesos | safetensors (formato de carpeta MLX con `model.safetensors.index.json`, `config.json`, `generation_config.json`, `tokenizer.json`, `chat_template.jinja`) |

## Arquitectura y entrenamiento

Title parte de `ibm-granite/granite-4.0-350m`, un modelo de la familia Granite 4.0 de IBM. El tag `granitemoehybrid` indica una arquitectura hibrida con mezcla de expertos, si bien no se detalla en la informacion disponible el numero de expertos, los parametros activos por token ni la composicion exacta del bloque hibrido. El modelo se distribuye ya cuantizado a 6 bits para MLX, lo que reduce el peso a los 0,3 GB del repositorio.

El entrenamiento consiste en un fine-tune especifico de tarea sobre clips de transcripcion, segun indica la model card. El modelo se entrena contra una plantilla de chat concreta (`chat_template.jinja`) y una instruccion fija que le pide responder con dos lineas etiquetadas: `TITLE:` (3-8 palabras, sin puntuacion final) y `DESC:` (1-2 frases). La model card advierte que cambiar la plantilla altera la tarea que realiza el modelo. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable no esta en la arquitectura sino en el objetivo de despliegue: el modelo se optimiza para generacion de texto corto token a token en GPU Apple via MLX, y se descarta la variante Core ML porque el Neural Engine esta limitado por ancho de banda de memoria en esta carga de trabajo. Segun las mediciones del autor, la version MLX supera a la de Core ML en tiempo hasta el primer token, tokens por segundo, tiempo de carga y uso de memoria.

## Capacidades

- Generacion de titulos factuales de 3 a 8 palabras para un pasaje de texto.
- Generacion de descripciones de una o dos frases centradas en el contenido concreto del pasaje.
- Procesamiento por lotes de clips: la API `cards(for:)` devuelve una tarjeta por clip, alineada por indice con la entrada.
- Funcionamiento multilingue (segun el tag de idioma del repositorio).
- Inferencia en dispositivo en iOS, macOS, tvOS y visionOS mediante MLX sobre GPU Apple.
- Soporte de limite de generacion mediante `maxTokens` (96 tokens por defecto) para evitar generaciones sin fin en entradas atipicas.
- Gestion de ciclo de vida en iOS mediante `suspend()` y `resume()` para liberar la GPU al pasar a segundo plano.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito segun la informacion disponible.

## Casos de uso

- Titulado automatico de transcripciones de audio: el modelo esta afinado sobre clips de transcripcion, por lo que es el escenario de maxima precision. Se le pasa el texto transcrito y devuelve un titulo corto y una descripcion para indexar o mostrar en una app de notas de voz.
- Generacion de tarjetas para podcasts o videos: la API `cards(for:)` permite recorrer una lista de fragmentos y obtener titulo y descripcion por segmento, manteniendo el orden de entrada, lo que encaja en un pipeline de publicacion de episodios.
- Resumen de parrafos de noticias en lectores RSS: la model card indica buen rendimiento en parrafos periodisticos, de modo que puede generar el titular y el sumario de cada articulo en el propio dispositivo sin enviar contenido a un servidor.
- Descripciones de producto en catalogos de comercio electronico: para fichas con texto descriptivo, el modelo produce una descripcion breve y sobria reutilizable en listados o metadatos SEO, sin clickbait.
- Previsualizacion de correos en clientes de email: dado el cuerpo de un mensaje, generar un asunto o una linea de resumen local, preservando la privacidad del contenido al no salir del dispositivo.
- Procesamiento por lotes de bibliotecas personales en macOS: al ejecutarse en la GPU del Mac mediante MLX y cargar solo 0,3 GB de pesos, permite etiquetar grandes volumenes de documentos o notas sin coste de API.
- Integracion en apps Swift para Apple: el paquete `desert-ant-core` con la trait `MLX` expone el tipo `Titles` como `actor`, lo que permite llamarlo desde varias tareas serializando las generaciones y evitando condiciones de carrera sobre la GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica de rendimiento aportada por el autor es comparativa interna entre backends: Title escribe texto entre 5,7 y 8,3 veces mas rapido en la GPU con MLX que en el Neural Engine con Core ML. No se detallan tokens por segundo absolutos ni latencias concretas.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 0,3 GB con pesos a 6 bits, por lo que el modelo cabe holgadamente en la memoria unificada de cualquier dispositivo Apple silicon moderno.
- Plataformas soportadas: exclusivamente Apple silicon (iOS, macOS, tvOS, visionOS). No hay build para Android, Linux, Windows, navegador ni Node.
- GPU: se ejecuta en la GPU Apple a traves de MLX; el autor descarta el Neural Engine por limitaciones de ancho de banda de memoria.
- GPU consumer: si, en cualquier Mac con chip Apple silicon y en iPhone/iPad compatibles con MLX.
- Opciones de despliegue: paquete Swift `desert-ant-core` (version 5.0.0 o superior) con la trait `MLX` y el producto `Title`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el modelo no se distribuye en GGUF.
- Latencia y throughput: no disponibles en terminos absolutos; solo la comparativa relativa 5,7-8,3x frente a Core ML. La carga del modelo es lenta en comparacion con la generacion, por lo que se recomienda instanciar un unico objeto `Titles` y reutilizarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Plataformas |
|---|---|---|---|---|---|
| desert-ant-labs/title | 352.379.904 | no disponible | Titulos y descripciones on-device | Source-Available (comercial a escala) | Apple silicon (MLX) |
| ibm-granite/granite-4.0-350m | no disponible | no disponible | Modelo base generalista | no disponible | Multiples |
| Modelos de resumen genericos de ~350M | no disponible | no disponible | Resumen abstractivo | variable | Multiples |

La comparacion directa con alternativas de la misma categoria no esta disponible en la informacion proporcionada. El unico punto de referencia documentado es el modelo base `ibm-granite/granite-4.0-350m`, del que Title hereda la arquitectura y sobre el que aplica un fine-tune de tarea y una cuantizacion a 6 bits para MLX.

## Limitaciones y advertencias

- El modelo a veces abre la descripcion con una frase estereotipada que su instruccion prohibe; el autor recomienda revisar cada tarjeta antes de mostrarla a un usuario.
- Puede equivocarse en detalles sobre prosa general. Es mas preciso en transcripciones, parrafos de noticias, descripciones de producto y correos electronicos.
- Con entradas atipicas puede seguir generando indefinidamente; hay que fijar `maxTokens` (96 por defecto) como red de seguridad.
- El modelo puede desviarse del formato `TITLE:`/`DESC:`; el parseo de la respuesta debe ser tolerante (el SDK toma la primera linea como titulo si no hay etiquetas).
- No se debe modificar la plantilla de chat: cambiarla altera la tarea para la que fue entrenado.
- Licencia source-available: es gratuita para la mayoria de apps, pero requiere licencia comercial a escala. Hay que revisar los terminos completos antes de un uso comercial.
- Dependencia exclusiva de Apple silicon y MLX: no hay despliegue posible en Android, Linux, Windows, navegador ni Node.
- En iOS, es obligatorio llamar a `suspend()` antes de pasar a segundo plano y a `resume()` al volver; de lo contrario, MLX puede provocar el cierre de la app si hay una generacion en curso.
- El objeto `Titles` es un `actor` y serializa las llamadas: las generaciones en paralelo no son mas rapidas y, en movil, anaden calor y provocan throttling.
- No se dispone de informacion sobre sesgos conocidos, evaluaciones de seguridad ni cobertura detallada de idiomas mas alla del tag multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/title
- Pesos version v0.1.0: https://huggingface.co/desert-ant-labs/title/tree/v0.1.0
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentacion del SDK (requisitos Swift): https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Documentacion del modelo en el repositorio: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/title.md
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- Licencia: https://license.desertant.com/
- Contacto de licencias: licensing@desertant.com
- Avisos de terceros: https://huggingface.co/desert-ant-labs/title/blob/main/THIRD_PARTY_NOTICES.md
