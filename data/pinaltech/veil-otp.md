# pinaltech/veil-otp

## Resumen

Veil OTP es un clasificador binario de muy pequeno tamano desarrollado por pinaltech para la aplicacion de correo Picacho. Su unica funcion es decidir si un numero o cadena alfanumerica que aparece en un correo electronico constituye un codigo de inicio de sesion, verificacion o un codigo de un solo uso (OTP), de modo que la aplicacion pueda ocultarlo como `••••••` en el asunto, el cuerpo del mensaje y las notificaciones. No es un modelo generativo ni un asistente: es un componente de privacidad embebido en un cliente de correo.

Tecnicamente se trata de una red de tipo bag-of-features al estilo fastText, con una capa oculta de 16 unidades y una salida logistica, que suma aproximadamente 260.000 pesos (alrededor de 1 MB). El modelo no procesa lenguaje de forma general: extrae caracteristicas deterministas (palabras vecinas, formas del candidato, conceptos lexicos multilingues) y las proyecta en 16.384 cubos mediante hashing. Se distribuye en dos formatos equivalentes: `otp-v1.mlmodel` para Core ML en macOS y `otp-v1.bin` para el runtime propio de Picacho en Windows y Linux.

Su relevancia es acotada pero clara: demuestra como resolver una tarea de clasificacion linguistica sensible a la privacidad con un modelo de 1 MB que corre en local, sin enviar correo a servidores externos, y con cobertura de mas de 35 idiomas y multiples sistemas de digitos (ASCII, fullwidth, arabigo-indico, persa, devanagari, bengali y thai). La licencia MIT y la publicacion del codigo de entrenamiento en el repositorio de Picacho facilitan su auditoria y reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red bag-of-features estilo fastText: embedding disperso con hashing (16.384 cubos), una capa oculta de 16 unidades y salida logistica |
| Parametros totales | Aproximadamente 260.000 pesos (1 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de transformer; analiza cada candidato con 200 caracteres a cada lado y el asunto del mensaje |
| Tipos de cuantizacion | No disponible; el modelo se distribuye en precision de entrenamiento (formato binario propio y Core ML) |
| Idiomas soportados | Ingles, espanol, aleman, frances, portugues, italiano, neerlandes, sueco, polaco, japones, chino simplificado y tradicional, coreano, ruso, ucraniano, turco, arabe, persa, hebreo, hindi, bengali, indonesio, malayo, vietnamita, thai, griego, checo, eslovaco, danes, noruego, finlandes, rumano, hungaro, catalan, croata, búlgaro, tagalo y suajili |
| Licencia | MIT |
| Formato de pesos | `otp-v1.mlmodel` (Core ML, macOS) y `otp-v1.bin` (runtime propio de Picacho, Windows y Linux) |

## Arquitectura y entrenamiento

El modelo es una red de clasificacion binaria con estructura de bolsa de caracteristicas. Para cada candidato detectado por un patron previo (grupos alfanumericos de 4 a 10 caracteres, secuencias de digitos de 4 a 10 en cualquier escritura, grupos con guiones o espacios, opcionalmente con prefijo corto) se construye un vector disperso con: las palabras anteriores y posteriores y sus cuatro primeras letras, las palabras y pares de palabras mas cercanos, los caracteres adyacentes, la forma del candidato (`999999`, `A-999999`), si esta en linea propia o en el asunto, las palabras del asunto y los conceptos lexicos que activan las palabras cercanas. Los conceptos se definen en `lexicon.json` (code, verify, sign in, one-time, expiry, don't share, order, money, shipping, contact, promotion, reference) con raices en todos los idiomas soportados, de modo que "код", "コード" y "kód" activan el mismo concepto. Todas las caracteristicas se proyectan en 16.384 cubos mediante hashing.

La red tiene una capa oculta de 16 unidades y una salida logistica; un candidato con puntuacion igual o superior a 0,3 se clasifica como codigo. El entrenamiento es determinista y utiliza correo sintetico generado por `data.py`: mensajes de inicio de sesion en los idiomas listados, correos llenos de numeros que no son codigos (pedidos, facturas, seguimiento, reservas, telefonos, direcciones, terminaciones de cuenta, cupones, claves de licencia, identificadores de reunion) y mensajes de inicio de sesion con otro numero junto al codigo. El codigo de entrenamiento (`train.py`, `features.py`, `lexicon.json`, `parity.json`) vive en el directorio `models/otp/` del repositorio de Picacho y `parity.json` se verifica con la prueba `cargo test matches_the_training_code`.

## Capacidades

- Clasificacion binaria de candidatos a codigo de inicio de sesion, verificacion u OTP en el cuerpo, el asunto y las notificaciones de un correo electronico.
- Deteccion de candidatos en multiples formatos: grupos con guiones (`BAJ6K-654XM`), pares de grupos de 3 a 4 digitos (`482 913`, `482-913`), cadenas alfanumericas de 4 a 10 caracteres (`AB12CD`, `482913`) y secuencias de 4 a 10 digitos en cualquier escritura (`４８２９１３`, `٤٨٢٩١٣`), opcionalmente con prefijo corto (`G-482913`).
- Exclusion explicita de fragmentos de numeros de telefono, fechas e importes.
- Soporte de digitos ASCII, fullwidth, arabigo-indicos, persas, devanagari, bengali y thai.
- Cobertura multilingue de mas de 35 idiomas, con segmentacion especifica para escrituras sin espacios (chino, kana japones, thai, lao, jemer, birmano) mediante pares de caracteres solapados.
- Uso de conceptos lexicos multilingues para reconocer vocabulario de codigo aunque el numero este lejos de las palabras que lo nombran.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni vision.

## Casos de uso

- Ocultacion de codigos en clientes de correo: integrado en Picacho, el modelo decide que numeros enmascarar como `••••••` en el asunto, el cuerpo y las notificaciones, protegiendo al usuario de filtraciones visuales en pantallas compartidas o bloqueadas.
- Filtrado de privacidad en capturas y previsualizaciones: un cliente de correo puede aplicar el clasificador antes de renderizar notificaciones del sistema o vistas previas, evitando que un OTP aparezca en la pantalla de bloqueo.
- Extension para otros clientes de correo de escritorio: dado su tamano (1 MB) y su licencia MIT, puede integrarse como dependencia en aplicaciones de correo en Rust o en otros lenguajes que repliquen la extraccion de caracteristicas descrita en `features.py`.
- Procesamiento local en dispositivos con recursos limitados: el modelo corre sin GPU y sin conexion, lo que lo hace apto para portatiles, equipos de sobremesa modestos y entornos donde el correo no puede salir del dispositivo.
- Clasificacion previa en pipelines de seguridad: puede actuar como primer filtro para etiquetar mensajes que contienen codigos de acceso y aplicarles politicas de retencion, cifrado o cuarentena antes de un analisis mas costoso.
- Investigacion en extraccion de entidades sobre correo multilingue: sirve como referencia reproducible (entrenamiento determinista, `parity.json` y lexico publico) para estudiar la deteccion de codigos OTP en 35 idiomas sin depender de modelos generativos grandes.
- Generacion de datos de prueba y evaluacion: el codigo de entrenamiento y el generador sintetico permiten crear corpus etiquetados de correos con y sin codigos para validar otros sistemas.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las metricas sobre mensajes construidos a partir de plantillas excluidas del entrenamiento:

| Plantillas retenidas | Precision | Recall | Mensajes exactamente correctos |
|---|---|---|---|
| Ingles (y otras plantillas en escritura latina) | 95% | 100% | 97% |
| Plantillas en los idiomas mas recientes | 97% | 96% | 96% |

El autor advierte que el lexico se escribio conociendo todas las plantillas, por lo que la segunda fila es optimista para un idioma no visto. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible, y no serian aplicables a un clasificador de esta naturaleza.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo es de 1 MB y esta pensado para ejecucion en CPU.
- GPU recomendadas: ninguna; no requiere aceleracion grafica. En macOS se ejecuta mediante Core ML, que puede usar la Neural Engine o la GPU del sistema de forma opcional.
- Cabe en cualquier GPU de consumo y en cualquier CPU moderna; el requisito practico es despreciable frente al resto de la aplicacion.
- Opciones de despliegue: Core ML en macOS (`otp-v1.mlmodel`) y el runtime propio de Picacho en Windows y Linux (`otp-v1.bin`, implementado en `src/manage/local_ai/runtime.rs`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura.
- Latencia y throughput: no disponibles de forma explicita; por el tamano del modelo y la naturaleza de bolsa de caracteristicas, la inferencia es del orden de microsegundos a milisegundos por candidato en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (clasificadores ligeros de deteccion de codigos OTP en correo electronico) en la documentacion proporcionada. La comparativa con modelos de lenguaje generativos no seria significativa por diferencia de tarea, tamano y requisitos.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Veil OTP | ~260.000 (1 MB) | 200 caracteres por lado del candidato | Clasificacion de codigos OTP | MIT | Hugging Face y repositorio de Picacho |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo solo clasifica candidatos previamente detectados por un patron; si el patron no captura un formato de codigo, el modelo nunca lo evaluara.
- El entrenamiento es sintetico y basado en plantillas; el propio autor reconoce que el correo real contendra formulaciones no cubiertas y que mas ejemplos variados mejorarian el rendimiento.
- Las metricas para idiomas incorporados tarde son optimistas porque el lexico se construyo conociendo todas las plantillas.
- Riesgo de falsos positivos y negativos en mensajes con muchos numeros (facturas, reservas, seguimiento) o con codigos junto a otros numeros.
- La segmentacion de escrituras sin espacios se hace por pares de caracteres solapados, lo que puede introducir ruido en chino, japones o thai.
- Un cambio en el lexico requiere actualizar tanto el modelo como la aplicacion, ya que el lexico esta compilado dentro de Picacho.
- La licencia MIT permite uso comercial y modificacion, pero no se ofrece garantia alguna sobre el modelo.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta herramientas ni agentes, y no debe evaluarse con benchmarks de LLM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es de 0,0 GB, por lo que la adopcion externa es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pinaltech/veil-otp
- Repositorio de Picacho: https://github.com/pinaltech/Picacho
- Codigo de entrenamiento y datos: directorio `models/otp/` del repositorio de Picacho (`train.py`, `data.py`, `features.py`, `lexicon.json`, `parity.json`)
- Runtime de Picacho: `src/manage/local_ai/runtime.rs`
- Integracion en la aplicacion: `src/manage/local_ai/mod.rs` y `src/manage/local_ai/otp.rs`
