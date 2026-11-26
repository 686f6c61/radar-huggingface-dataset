# SecludedCorner/frankenstein-model

## Resumen

Frankenstein Model es un modelo de lenguaje experimental derivado de Qwen3.5 0.8B, publicado por el usuario SecludedCorner en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un ejercicio de edición de conocimiento (knowledge editing) sobre los pesos de un modelo base ya existente: el autor ha modificado directamente conexiones neuronales para alterar respuestas sobre Taiwan, la identidad declarada del modelo y 40 hechos cotidianos, sin reentrenamiento. El resultado se distribuye como un GGUF de 3,0 GB con las ediciones ya integradas, junto con parches opcionales (traducción, selección de herramientas) y un codificador visual heredado del modelo base.

El modelo base, Qwen3.5 0.8B, aporta la arquitectura transformer, la capacidad de visión y el soporte de tool calling; Frankenstein solo añade encima las ediciones del autor y un programa Windows (`frankenstein.exe`) que orquesta la carga de parches y decide, pregunta a pregunta, qué parches adjuntar. La relevancia del proyecto es metodológica: demuestra que es posible modificar el comportamiento factual e identitario de un modelo pequeño con hardware de consumo (una RTX 4060 de portátil) y distribuir el resultado como pesos editados verificables.

Con apenas 752 millones de parámetros y un contexto no documentado en la información disponible, Frankenstein Model no compite en rendimiento general con modelos de su categoría; su interés es como caso de estudio de edición de pesos, empaquetado GGUF y orquestación modular de parches en llama.cpp. La licencia Apache 2.0 del modelo base se mantiene, aunque el método de edición y el código de `frankenstein.exe` no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5 0.8B); no se detalla en la informacion disponible |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos distribuidos en float32 sin comprimir; el autor permite cuantizar pero no ha probado el efecto sobre las ediciones |
| Idiomas soportados | Ingles (en), chino (zh), con parche adicional de traduccion a chino tradicional |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuerpo principal, codificador visual y parches); `Modelfile` para Ollama |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5 0.8B, un transformer de 752 millones de parametros con capacidad multimodal (vision) y tool calling ya presentes en el modelo base. Frankenstein no reentrena: aplica una tecnica de edicion neuronal que modifica directamente las conexiones de los pesos. Segun el autor, todo el proceso se realizo en un unico portatil con una RTX 4060, sin centro de datos ni entrenamiento completo.

Las ediciones se concentran en tres areas: (1) 52 pares pregunta-respuesta (28 en chino, 24 en ingles) sobre Taiwan, corrigiendo datos facticos (presidente, poblacion, dia nacional) y reemplazando la linea politica generica por una frase redactada por el autor; (2) identidad, con 10 formulaciones en chino y 8 en ingles que hacen que el modelo se presente como "Frankenstein Model"; (3) 40 hechos cotidianos (capitales, idiomas oficiales, antonimos, continentes) respondidos en chino tradicional. El metodo de edicion y su codigo no se han publicado; solo se distribuyen los pesos resultantes.

El ecosistema incluye parches externos: `part-translate.gguf` (173 MB), conversion de formato de LinguaForge de RX5950XT, y `part-tools.gguf` (22 MB), copia original de ToolChooser-0.8B de Gramscii-IT. El autor advierte que estos parches se crearon para el Qwen3.5 0.8B sin editar y se acoplan al modelo editado sin garantias. La plantilla de chat esta fijada en modo "sin thinking", porque las ediciones se hicieron en ese modo y no surten efecto con thinking activado.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Vision: procesamiento de imagenes mediante `vision-encoder.gguf` (402 MB), heredado intacto del modelo base.
- Tool calling / function calling: presente en Qwen3.5 0.8B y reforzado opcionalmente con el parche `part-tools.gguf`.
- Traduccion al chino tradicional mediante el parche `part-translate.gguf` (activacion bajo demanda).
- Edicion de identidad: responde "I am the Frankenstein Model" ante preguntas sobre quien es.
- Respuestas facticas editadas sobre Taiwan y 40 hechos cotidianos en chino tradicional.
- Comportamiento de incertidumbre: `frankenstein.exe` responde "I'm not sure" cuando una respuesta corta no parece fiable.
- Seleccion dinamica de parches por pregunta: el orquestador decide que parches adjuntar segun la consulta (traduccion, imagen, identidad).
- Modo thinking deshabilitado de forma fija; no soporta activacion de razonamiento extendido con las ediciones aplicadas.

## Casos de uso

- Demostracion de edicion de conocimiento en hardware de consumo: investigadores pueden cargar `frankenstein.gguf` en llama.cpp y verificar empiricamente que las ediciones de identidad y hechos persisten tras la modificacion de pesos, comparando respuestas con y sin parches activos desde el panel.
- Servicio de chat local con vision en un portatil: desplegar con `llama-server -m frankenstein.gguf --mmproj vision-encoder.gguf`, usando aproximadamente 3,8 GB de VRAM en GPU, para conversaciones con imagenes sin conexion a servicios externos.
- Traduccion EN a chino tradicional bajo demanda: activar `part-translate.gguf` desde el panel o mediante el orquestador y enviar "翻譯成繁體中文:" seguido de una linea en ingles, obteniendo traduccion sin cambiar de modelo.
- Integracion en clientes de chat compatibles con OpenAI: apuntar Cherry Studio u otra aplicacion al endpoint `http://127.0.0.1:8090/v1` con nombre de modelo `frankenstein` y cualquier clave API, aprovechando la compatibilidad de endpoints del repo.
- Pruebas de robustez de parches cruzados: evaluar como parches creados para el Qwen3.5 0.8B original (traduccion y tool choosing) se comportan al acoplarse a un modelo editado, midiendo degradacion o interferencia entre ediciones.
- Prototipado de asistentes con seleccion dinamica de herramientas: usar el mecanismo de conmutacion de parches del orquestador como referencia para disenar sistemas que activan capacidades solo cuando la consulta lo requiere, reduciendo interferencias entre comportamientos.
- Analisis de sesgos y lineas politicas en modelos pequenos: comparar la respuesta original de Qwen3.5 0.8B sobre Taiwan con la version editada, documentando el efecto de 52 pares de edicion sobre el comportamiento factual y politico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas; solo indica el consumo aproximado de 3,8 GB de VRAM en GPU y que el modelo funciona en llama.cpp (build b12359) y Ollama 0.40.16 para texto, imagenes y tool calls.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,8 GB en GPU con el cuerpo de 3,0 GB, el codificador visual de 402 MB y los parches cargados; en CPU funciona sin VRAM dedicada.
- GPU recomendadas: RTX 4060 de portatil es el hardware en que se desarrollo y valido; cualquier GPU consumer con 4 GB o mas de VRAM deberia ser suficiente.
- Cabe en GPU consumer: si, incluida la gama de entrada con 4 GB; el modelo base de 752 millones de parametros es de escala muy reducida.
- Opciones de despliegue: llama.cpp (`llama-server`, build b12359 probado), Ollama 0.40.16 mediante `Modelfile` (sin soporte de parches), y `frankenstein.exe` como orquestador Windows que lanza llama.cpp y gestiona los parches.
- Latencia y throughput: no disponibles; no se reportan mediciones.
- Nota: `frankenstein.exe` es exclusivamente para Windows, escucha solo en 127.0.0.1 y no publica su codigo fuente; sus mensajes y panel estan en chino.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Frankenstein Model | 752 M | No disponible | Apache 2.0 | GGUF en HF, 0 descargas | Derivado editado de Qwen3.5 0.8B; vision y tool calling heredados; parches externos |
| Qwen3.5 0.8B (base) | ~0,8 B | No disponible | Apache 2.0 (segun repo) | HF oficial | Modelo original sin ediciones; referencia para comparar el efecto de las ediciones |
| LinguaForge-Qwen3.5-0.8B-zhTW-en-ja | Derivado de 0,8 B | No disponible | No disponible en la informacion | HF (RX5950XT) | Especializado en traduccion zhTW/en/ja; origen del parche de traduccion |
| ToolChooser-0.8B | Derivado de 0,8 B | No disponible | No disponible en la informacion | HF (Gramscii-IT) | Especializado en seleccion de herramientas; origen del parche de tools |

La comparativa se limita a derivados del mismo modelo base porque no se dispone de datos de rendimiento que permitan contrastar con modelos de otras familias; no disponible.

## Limitaciones y advertencias

- Proyecto experimental sin descargas ni validacion comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia externa de calidad.
- Las ediciones facticas cubren un conjunto acotado (52 pares sobre Taiwan y 40 hechos cotidianos); fuera de ese dominio el modelo conserva el comportamiento del Qwen3.5 0.8B original, con sus sesgos y errores.
- Riesgo de alucinacion propio de un modelo de 752 millones de parametros; el mecanismo "I'm not sure" solo actua sobre respuestas cortas y depende de heuristicas del orquestador no documentadas.
- La edicion sobre Taiwan introduce una linea editorial concreta redactada por el autor, lo que puede ser inadecuado para despliegues que requieran neutralidad politica o cumplan politicas regionales.
- El modo thinking esta deshabilitado de forma fija; activarlo invalida las ediciones, lo que limita el razonamiento multi-paso.
- Los parches de terceros (traduccion y tools) se hicieron para el modelo base sin editar y se acoplan sin pruebas de compatibilidad; pueden interferir con las ediciones.
- Pesos en float32 sin comprimir: cuantizarlos puede alterar o destruir las ediciones, segun advierte el propio autor, que no lo ha probado.
- `frankenstein.exe` es solo para Windows, sin codigo fuente publicado, con interfaz en chino, y no debe exponerse fuera de 127.0.0.1.
- El metodo de edicion y su codigo no se publican, lo que impide reproducir o auditar el proceso mas alla de inspeccionar los pesos resultantes.
- Licencia Apache 2.0 permite uso comercial, pero las responsabilidades sobre contenido editado (identidad y postura politica) recaen en el desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SecludedCorner/frankenstein-model
- Modelo base Qwen3.5 0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- LinguaForge (origen del parche de traduccion): https://huggingface.co/RX5950XT/LinguaForge-Qwen3.5-0.8B-zhTW-en-ja
- ToolChooser-0.8B (origen del parche de tools): https://huggingface.co/Gramscii-IT/ToolChooser-0.8B
- llama.cpp: https://github.com/ggml-org/llama.cpp
