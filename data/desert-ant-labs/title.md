# desert-ant-labs/title

## Resumen

Title es un modelo de lenguaje especializado en la generación de títulos y descripciones breves a partir de cualquier pasaje de texto, desarrollado por Desert Ant Labs. Se trata de un fine-tuning del modelo base `ibm-granite/granite-4.0-350m`, con 352.379.904 parámetros totales, orientado a ejecución local en dispositivos Apple (iOS, macOS, tvOS y visionOS) mediante MLX sobre la GPU. Su propósito es producir una tarjeta compuesta por un título factual de 3 a 8 palabras y una descripción de una o dos frases, con un registro deliberadamente sobrio: sin emojis, sin hashtags y sin clickbait.

El modelo está pensado para el procesamiento de clips de transcripción, aunque el autor indica que también funciona correctamente sobre párrafos de noticias, descripciones de producto y correos electrónicos. La relevancia actual radica en su enfoque on-device: elimina la dependencia de servicios en la nube para una tarea de resumen corto y de alta frecuencia, y está empaquetado como un módulo Swift dentro del SDK `desert-ant-core` (versión 4.3.0 o superior, con el trait `MLX`).

La licencia es propietaria de tipo source-available (Desert Ant Labs Source-Available License), gratuita para la mayoría de aplicaciones pero con obligación de licencia comercial a escala. El modelo se distribuye en formato MLX con cuantización de 6 bits y un tamaño de repositorio de 0,3 GB, lo que lo hace viable en hardware de consumo Apple sin infraestructura adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Granite MoE Hybrid (según tag `granitemoehybrid` del repo); detalles de capas y atención no disponibles |
| Parametros totales | 352.379.904 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (pesos `model.safetensors`); otras cuantizaciones no disponibles |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`; lista concreta de idiomas no disponible) |
| Licencia | Desert Ant Labs Source-Available License (gratuita para la mayoría de apps, licencia comercial requerida a escala) |
| Formato de pesos | safetensors (formato MLX, con `model.safetensors.index.json`, `config.json`, `generation_config.json`, tokenizer Byte-level BPE y `chat_template.jinja`) |

## Arquitectura y entrenamiento

Title se construye mediante fine-tuning supervisado sobre `ibm-granite/granite-4.0-350m`, un modelo base de la familia Granite 4.0 de IBM. El repositorio etiqueta la arquitectura como `granitemoehybrid`, lo que sugiere una arquitectura híbrida con componentes de mezcla de expertos, aunque la model card no detalla el número de capas, la dimensionalidad, el mecanismo de atención ni el número de expertos. El modelo se distribuye exclusivamente en formato MLX con cuantización de 6 bits, lo que implica que los pesos publicados no son los originales en precisión completa.

El entrenamiento se realizó sobre clips de transcripción, con una instrucción fija que el SDK envía al modelo y contra la que se ajustó el fine-tuning. El modelo aprende a responder con dos líneas etiquetadas (`TITLE:` y `DESC:`), y el autor advierte explícitamente de que debe mantenerse la plantilla de chat tal como se distribuye, ya que una plantilla distinta cambia la tarea que ejecuta el modelo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

Como innovación técnica destacable, el autor documenta que la inferencia se ejecuta en la GPU mediante MLX en lugar de en la Neural Engine, con una velocidad de escritura entre 5,7 y 8,3 veces superior a la del build Core ML. Esta decisión se justifica porque la Neural Engine está limitada por el ancho de banda de memoria al generar texto corto token a token.

## Capacidades

- Generación de títulos factuales de 3 a 8 palabras sin puntuación final, y descripciones de una o dos frases, a partir de un pasaje de texto.
- Procesamiento por lotes de clips: la API `cards(for:)` devuelve una tarjeta por clip, alineada por índice con la lista de entrada.
- Generación tolerante a formato: el SDK analiza la respuesta de forma tolerante y, si no encuentra etiquetas, toma la primera línea como título.
- Control de longitud mediante `maxTokens` (96 tokens por defecto) para evitar generaciones sin fin en entradas atípicas.
- Capacidad multilingüe según la etiqueta del repositorio, aunque la lista concreta de idiomas no está disponible.
- Ejecución on-device en iOS, macOS, tvOS y visionOS mediante MLX sobre GPU.
- Gestión de ciclo de vida en iOS mediante `suspend()` y `resume()` para evitar cierres de la app al pasar a segundo plano.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Titulación automática de clips de transcripción: el modelo recibe el texto de un clip y devuelve una tarjeta con título y descripción. Es su dominio de entrenamiento principal y donde el autor reporta mayor precisión; se integraría llamando a `cards(for:)` sobre la lista de clips.
- Resumen de párrafos de noticias en lectores RSS o agregadores: el modelo genera un título factual y una descripción de una o dos frases para cada artículo, con un registro sobrio sin clickbait, adecuado para interfaces editoriales.
- Generación de metadatos para descripciones de producto en apps de catálogo: a partir del texto de la ficha, el modelo produce un título corto y una descripción de una o dos frases que identifica ese producto concreto, no su categoría.
- Previsualización de correos electrónicos en clientes de correo: el modelo resume el cuerpo del mensaje en una tarjeta breve que puede mostrarse en la lista de la bandeja de entrada, ejecutándose en el dispositivo sin enviar contenido a servidores externos.
- Indexación y etiquetado local de notas o documentos personales: en una app de notas en macOS o iOS, el modelo genera títulos y descripciones para cada nota, facilitando la búsqueda y la organización sin salir del dispositivo.
- Accesibilidad y lectura rápida: la generación de descripciones de una o dos frases permite ofrecer resúmenes breves de pasajes largos en apps de lectura, con la ventaja de que todo el procesamiento ocurre en local y no requiere conectividad.
- Procesamiento por lotes en segundo plano controlado: en macOS o tvOS, donde no aplican las restricciones de GPU en segundo plano de iOS, el modelo puede procesar colecciones de clips de forma secuencial reutilizando una única instancia de `Titles`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una comparación interna de velocidad: Title escribe texto entre 5,7 y 8,3 veces más rápido en la GPU mediante MLX que en la Neural Engine con el build Core ML, y este último también pierde en tiempo hasta el primer token, tokens por segundo, tiempo de carga y uso de memoria. No se proporcionan valores absolutos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,3 GB con pesos cuantizados a 6 bits, por lo que la huella de memoria es reducida y apta para dispositivos móviles.
- Plataformas soportadas: exclusivamente Apple silicon (iOS, macOS, tvOS, visionOS). No existe build para Android, Linux, Windows, navegador ni Node.
- GPU recomendadas: cualquier GPU integrada en chips Apple silicon compatible con MLX; no se especifican modelos concretos de chip.
- Cabe en hardware de consumo: sí, por diseño; el modelo está pensado para ejecutarse en iPhone, iPad y Mac.
- Opciones de despliegue: SDK Swift `desert-ant-core` (versión 4.3.0 o superior) con el trait `MLX`, añadiendo el producto `Title` al target. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor indica que la carga del modelo es lenta y la escritura de la tarjeta rápida, y recomienda crear una instancia de `Titles` y reutilizarla. No se publican cifras absolutas. Las generaciones en paralelo no son más rápidas y en móvil añaden calor y provocan throttling.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Title (desert-ant-labs) | 352.379.904 | no disponible | MLX, 6 bits, solo Apple silicon | Source-available con licencia comercial a escala | Hugging Face, 32.040 descargas |
| ibm-granite/granite-4.0-350m (modelo base) | no disponible en la información proporcionada | no disponible | safetensors estándar | no disponible en la información proporcionada | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de titulación o resumen on-device en la documentación facilitada.

## Limitaciones y advertencias

- El modelo a veces abre la descripción con una frase comodín que su instrucción prohíbe; el autor recomienda revisar cada tarjeta antes de mostrarla a un usuario.
- Puede equivocarse en detalles sobre prosa general; es más preciso en clips de transcripción, párrafos de noticias, descripciones de producto y correos electrónicos.
- En entradas atípicas puede seguir generando sin fin; es necesario acotar cada ejecución con `maxTokens` (96 por defecto).
- El modelo puede desviarse del formato de dos líneas etiquetadas, por lo que el parseo de la respuesta debe ser tolerante.
- Debe mantenerse la plantilla de chat tal como se distribuye; una plantilla distinta altera la tarea que ejecuta el modelo.
- En iOS, es obligatorio llamar a `suspend()` antes de pasar a segundo plano y a `resume()` al volver, ya que iOS revoca el acceso a la GPU y MLX provoca el cierre de la app si hay una generación en curso.
- La instancia `Titles` es un `actor` y serializa las llamadas; no es seguro conducir MLX desde varias tareas a la vez.
- Restricción de plataforma: solo Apple silicon. No hay build para Android, Linux, Windows, navegador ni Node.
- Licencia: gratuita para la mayoría de apps, pero se requiere licencia comercial a escala según los términos de Desert Ant Labs; conviene revisar el enlace de licencia antes de un despliegue comercial.
- El modelo no descarga sus pesos automáticamente; es responsabilidad del integrador descargarlos desde Hugging Face y apuntar el inicializador a la carpeta del modelo.
- No se documentan sesgos específicos ni evaluación de sesgos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/title
- Pesos v0.1.0: https://huggingface.co/desert-ant-labs/title/tree/v0.1.0
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- SDK Desert Ant Core (Swift): https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Documentación de origen del modelo: https://github.com/Desert-Ant-Labs/desert-ant-core (archivo `docs/models/title.md`)
- Licencia: https://license.desertant.com/
- Contacto de licencias: licensing@desertant.com
- Avisos de terceros: https://huggingface.co/desert-ant-labs/title (archivo `THIRD_PARTY_NOTICES.md`)
