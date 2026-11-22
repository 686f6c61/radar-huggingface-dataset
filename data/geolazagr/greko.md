# geolazagr/greko

## Resumen

Greko 2.4 es un ajuste fino del modelo multimodal Qwen3-VL-2B-Instruct, desarrollado por un autor independiente (geolazagr, "George") y orientado a su uso como asistente personal completamente offline en dispositivos Android. El modelo base es un transformer multimodal de aproximadamente 1.720 millones de parametros, capaz de procesar imagen y texto, y sobre el que se ha aplicado un ajuste fino unicamente del modelo de lenguaje (no del codificador visual) para dotarlo de una identidad propia, mejorar el griego y el razonamiento matematico, y reforzar la seguridad.

Lo relevante de Greko no es tanto el modelo en si como el ecosistema que lo acompana: una aplicacion Android (2.35-beta) que descarga el modelo cuantizado (1,05 GB en IQ4_NL) y su proyector visual (241 MB) en el primer arranque, tras lo cual funciona sin conexion. El modelo se distribuye en formato GGUF para llama.cpp, con variantes cuantizadas pensadas para telefonos de 2 GB y 4 GB de RAM, e incluye modo agente (alarmas, calendario, contactos), lectura de PDF y DOCX, generacion de ficheros Word y Excel, busqueda web opcional, voz y modo de razonamiento.

La ficha cubre las especificaciones del modelo y sus cuantizaciones, el proceso de entrenamiento descrito por el autor, las capacidades declaradas, los benchmarks publicados (GSM8K, ARC-Easy y metricas propias de griego y seguridad) y las limitaciones de un modelo de 2B ejecutandose en CPU de movil. La licencia Apache 2.0 y el soporte de ingles y griego lo hacen util para prototipos de asistentes privados en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL): modelo de lenguaje + codificador visual y proyector; ajuste fino solo del modelo de lenguaje |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | IQ4_NL (1,05 GB), IQ3_M con importance matrix (815 MB, variante Lite), Q4_K_M (1,1 GB); proyector visual en 3 bits (190 MB), 4 bits (241 MB) y 8 bits (445 MB) |
| Idiomas soportados | ingles (en), griego (el) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo base original en safetensors |

## Arquitectura y entrenamiento

Greko parte de Qwen3-VL-2B-Instruct, un modelo multimodal que combina un transformer de lenguaje con un codificador visual y un proyector que alinea las representaciones de imagen con el espacio del texto. El ajuste fino afecta solo al modelo de lenguaje: el codificador visual y el proyector se distribuyen sin cambios respecto al modelo base, en ficheros `mmproj` separados (3, 4 y 8 bits). El entrenamiento se realizo con QLoRA sobre 22.423 conversaciones: chat general de smol-smoltalk, 8.557 conversaciones en griego procedentes de openeurollm/Dolci-Instruct-SFT-translated, y conversaciones escritas a mano de persona, griego, multi-turno y modo Think.

La version 2.4 anadio tres pasos sobre Greko 2.3: primero, una mezcla 70/30 de los pesos de Greko 2.3 con el modelo base para recuperar capacidad matematica y reducir palabras inventadas en griego sin perder la identidad del asistente; segundo, entrenamiento con DPO sobre pares de griego, matematicas, seguridad y modo Think, incluyendo respuestas escritas a mano a preguntas inofensivas que suenan arriesgadas para evitar rechazos excesivos; y tercero, una mezcla 50/50 de las dos ejecuciones de DPO. El autor no documenta el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de las fuentes citadas.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y griego, con identidad propia ("Greko", creado por George).
- Comprension de imagenes: el modelo responde preguntas sobre fotos enviadas por el usuario (el autor reporta 5/5 en cinco dibujos de prueba).
- Lectura de documentos: PDF, Word (.docx) y ficheros de texto, procesados en el dispositivo.
- Generacion de ficheros Word (.docx) y Excel (.xlsx) como adjuntos reales en la respuesta.
- Modo Think: razonamiento paso a paso antes de responder, con mejora en matematicas a costa de mayor latencia.
- Modo agente: crear alarmas y temporizadores, anadir eventos al calendario, enviar mensajes y llamar a contactos por nombre, abriendo las aplicaciones nativas del telefono (el usuario confirma el envio o la llamada).
- Busqueda web opcional mediante DuckDuckGo o Wikipedia, con listado de fuentes, desactivada por defecto.
- Voz: entrada por dictado y salida leida en voz alta usando los motores del propio telefono.
- Habilidades con comando `/`: investigacion profunda, resumen, traduccion y habilidades definidas por el usuario.
- Rutinas: prompts programados a una hora fija (por ejemplo, un resumen matutino).
- Integracion con Notion para consultar paginas del usuario.
- Recuperacion de conversaciones anteriores guardadas en el dispositivo ("que dijimos sobre el viaje?").
- Compartir hacia Greko desde otras aplicaciones (texto o foto).
- No se documenta soporte explicito de tool calling generico ni de function calling fuera del modo agente integrado en la app.

## Casos de uso

- Asistente personal offline en Android: la app descarga el modelo una vez y responde sin conexion, de modo que consultas cotidianas, resumenes y preguntas sobre documentos no salen del dispositivo. Adecuado por privacidad y por funcionamiento en redes inexistentes o restringidas.
- Gestion de agenda y recordatorios por voz o texto: el modo agente interpreta ordenes como "despiertame a las 7" o "βαλε ραντεβου την Παρασκευη στις 5" y abre la app de Reloj o Calendario con los datos rellenados, lo que resulta util para usuarios que prefieren no navegar por menus.
- Atencion al ciudadano o al cliente en griego: con 8.557 conversaciones griegas en el ajuste y una tasa de palabras inventadas del 3,71% (frente al 5,19% de la version anterior), puede emplearse en prototipos de asistente en griego sobre hardware modesto, siempre con supervision humana.
- Extraccion de datos de recibos y documentos: el modelo lee una foto de un recibo o un PDF y puede volcarlo a un fichero Excel, lo que sirve para pequenas gestorias o control de gastos personales sin subir documentos a la nube.
- Generacion de borradores de documentos: a partir de una peticion en lenguaje natural produce un .docx o .xlsx descargable, util para plantillas, listas e informes sencillos en movilidad.
- Soporte educativo en matematicas escolares: con 75,5% en GSM8K (200 preguntas) y 80% en la cuantizacion IQ4_NL, es adecuado para resolver problemas de aritmetica de primaria y secundaria paso a paso con el modo Think.
- Prototipado de agentes con contexto local: la recuperacion de conversaciones anteriores y las rutinas programadas permiten construir asistentes que mantienen memoria en el dispositivo sin backend, util para demos de investigacion sobre agentes privados.
- Despliegue en hardware muy limitado: la variante Lite (IQ3_M, 815 MB) esta pensada para telefonos de 2 GB de RAM, lo que permite probar un modelo multimodal en dispositivos de gama baja.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (no verificados de forma independiente):

| Metrica | Greko 2.3 | Greko 2.4 | Greko 2.4 IQ4_NL (app) | Greko 2.4 Lite (IQ3_M) |
|---|---|---|---|---|
| GSM8K (200 preguntas) | 69% | 75,5% | 80% | 71,5% (desde 59,5%) |
| ARC-Easy (200) | 89,5% | 88,5% (dentro del ruido) | 92% | no disponible |
| Palabras griegas inventadas (menor es mejor) | 5,19% | 3,71% | 4,0% | 7,8% (desde 10,6%) |
| Identidad (se nombra Greko, creado por George) | si | si | no disponible | no disponible |
| Fotos (5 dibujos) | 5/5 | 5/5 | 5/5 | no disponible |
| Rechaza peticiones daninas (18 vistas / 8 reservadas) | 5/18, 2/8 | 14/18, 3/8 | no disponible | no disponible |
| Resiste instrucciones plantadas en resultados web reservados | 2/3 | 3/3 | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval ni de benchmarks multimodales estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,3 GB en total para el modelo IQ4_NL (1,05 GB) mas el proyector visual de 4 bits (241 MB); alrededor de 1 GB para la variante Lite (815 MB + 190 MB del proyector de 3 bits); 1,1 GB para Q4_K_M mas 445 MB del proyector de 8 bits en PC.
- El autor indica Android 13 o superior, arquitectura arm64 y un minimo de 2 GB de RAM; la variante Lite esta pensada para telefonos con menos de 2,4 GB de RAM y la version principal para telefonos de 4 GB.
- GPU: no se especifican modelos recomendados. El diseno esta optimizado para CPU de movil mediante llama.cpp; en PC puede ejecutarse en CPU y, presumiblemente, con aceleracion GPU a traves de llama.cpp, aunque no se documentan requisitos de VRAM para A100, H100 o RTX 4090.
- Cabe en GPU de consumo con cuantizaciones de 4 bits (1,05-1,1 GB de pesos mas el proyector), aunque no hay datos publicados de rendimiento en esas GPU.
- Opciones de despliegue: llama.cpp y la app Android propia; los ficheros GGUF son compatibles con el ecosistema llama.cpp (Ollama, servidores compatibles), aunque el autor solo documenta la app. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: el autor afirma que cada respuesta fuera del modo Think llega en aproximadamente un minuto en un telefono de 4 GB. No se publican tokens por segundo ni latencias medidas en otros entornos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Greko 2.4 | 1.720.574.976 | no disponible | Si (imagen-texto) | en, el | Apache 2.0 | GGUF |
| Qwen3-VL-2B-Instruct (base) | ~2B | no disponible | Si (imagen-texto) | multilingue (no detallado) | Apache 2.0 | safetensors, GGUF |
| SmolVLM-2B (referencia de la familia smol) | ~2B | no disponible | Si (imagen-texto) | multilingue (no detallado) | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a modelos de tamano similar y misma tarea; no se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. Frente al Qwen3-VL-2B-Instruct, Greko anade ajuste fino conversacional en griego, identidad propia y entrenamiento DPO en seguridad y matematicas, a costa de un rendimiento potencialmente inferior en tareas generales fuera de su dominio.

## Limitaciones y advertencias

- Modelo de 2B parametros: la capacidad de razonamiento, conocimiento factual y codigo es limitada en comparacion con modelos de mayor tamano; el autor lo describe explicitamente como beta.
- Riesgo de alucinacion: el autor mide y reporta palabras griegas inventadas (3,71% en 2.4, 4,0% en IQ4_NL, 7,8% en Lite), lo que indica que el fenomeno persiste y debe asumirse en produccion.
- Seguridad incompleta: en las pruebas del autor, el modelo rechaza 14 de 18 peticiones daninas vistas y solo 3 de 8 reservadas; no es un filtro de seguridad robusto por si solo. La app anade respuestas escritas a mano para autolesion y numeros de emergencia, lo que no cubre todos los casos.
- Idiomas: solo ingles y griego estan declarados; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; en un telefono de 2-4 GB el contexto efectivo estara ademas limitado por la memoria.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-VL-2B-Instruct tiene sus propios terminos que deben revisarse; el autor no documenta restricciones adicionales.
- Dependencia del ecosistema de la app: muchas capacidades (agente, voz, Notion, busqueda web, rutinas) las implementa la aplicacion Android, no el modelo; reutilizar el GGUF fuera de la app no da acceso a esas funciones.
- Actualizaciones automaticas: la app consulta el repositorio una vez al dia para ofrecer actualizaciones, lo que introduce una dependencia de red y de la integridad del repositorio.
- Cuantizaciones agresivas: la variante Lite (IQ3_M) degrada notablemente el rendimiento (GSM8K 71,5% frente a 80% en IQ4_NL; 7,8% de palabras inventadas frente a 4,0%).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/geolazagr/greko
- Guia de instalacion paso a paso: https://geolazagr-greko.static.hf.space/
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset de chat general: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset de conversaciones en griego: https://huggingface.co/datasets/openeurollm/Dolci-Instruct-SFT-translated
- Aplicacion Android: `greko.apk` dentro del repositorio de Hugging Face
- Aplicacion de vista previa: `greko-preview.apk` dentro del repositorio de Hugging Face
