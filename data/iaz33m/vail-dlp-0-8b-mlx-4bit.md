# iaz33m/Vail-DLP-0.8B-MLX-4bit

## Resumen

Vail DLP 0.8B es un modelo de pesos abiertos de pequeno tamano ajustado especificamente para prevencion de perdida de datos (DLP). Desarrollado por el usuario iaz33m, parte de Qwen3.5-0.8B en cuantizacion 4-bit para MLX y le aplica un adaptador LoRA fusionado. Su funcion es recibir un mensaje de texto y devolver un objeto JSON que enumera cada valor sensible presente: correos electronicos, telefonos, numeros de la seguridad social, tarjetas, claves de API, contrasenas, nombres completos, direcciones postales, cuentas bancarias y otros identificadores. Cada valor se copia exactamente tal como aparece en el texto.

El modelo resuelve un problema concreto: la deteccion local y de baja latencia de informacion sensible antes de que un texto salga de un sistema. Con aproximadamente 752 millones de parametros y un consumo de memoria de en torno a 1 GB en cargas tipicas, esta pensado para ejecutarse en Apple Silicon mediante `mlx-lm`, con una latencia de aproximadamente 0,4 segundos por mensaje en un M1 Max. Es relevante por su enfoque de despliegue en el borde: no requiere GPU dedicada ni servicios en la nube.

La limitacion principal es que se distribuye unicamente en formato MLX 4-bit, por lo que no carga en `transformers`, vLLM ni llama.cpp, y que fue entrenado exclusivamente con datos sinteticos en ingles. Su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B), ajuste LoRA fusionado |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; evaluado solo con mensajes cortos (entradas de hasta ~45K tokens procesadas en pruebas de memoria) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 4-bit); tamano del repo 0.4 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre `mlx-community/Qwen3.5-0.8B-4bit`, que a su vez deriva de `Qwen/Qwen3.5-0.8B`. Sobre esa base cuantizada a 4 bits se entrena un adaptador LoRA con `mlx-lm` que posteriormente se fusiona en los pesos mediante `mlx_lm fuse`. La configuracion del LoRA es: rango 16, escala 20, dropout 0, aplicado a las ultimas 16 capas. El optimizador es Adam con tasa de aprendizaje 2e-5, tamano de lote 4, longitud maxima de secuencia 1024, perdida calculada solo sobre la respuesta (prompt enmascarado) y semilla 42.

El conjunto de datos es enteramente sintetico: 1.875 ejemplos de entrenamiento y 375 de validacion, en el mismo formato que los benchmarks. El modelo se entrena con el modo de razonamiento (thinking) desactivado y con una instruccion fija que define el esquema JSON de salida y las reglas de extraccion. No se documenta el numero de tokens de entrenamiento ni el uso de RLHF o DPO. La innovacion tecnica destacable es la especializacion extrema en una unica tarea de extraccion estructurada con un prompt fijo, lo que permite un modelo muy pequeno con latencia baja.

## Capacidades

- Extraccion de entidades sensibles en formato JSON con el esquema `{"sensitive": bool, "entities": [{"type": ..., "value": ...}]}`.
- Tipos soportados: `EMAIL`, `PHONE`, `SSN`, `CREDIT_CARD`, `API_KEY`, `PASSWORD`, `NAME`, `ADDRESS`, `BANK_ACCOUNT` y `OTHER` (identificadores gubernamentales, pasaporte, medicos, fiscales, de enrutamiento y similares).
- Copia literal de cada valor detectado, sin normalizacion ni reformateo.
- Distincion entre categorias segun reglas del prompt: un correo es `EMAIL` y no `ADDRESS`; un nombre completo es `NAME` mientras que un nombre suelto, rol, equipo o proyecto no lo es; una clave de API incluye tokens y claves secretas, pero no hashes de git, ids de peticion ni muestras de documentacion.
- Exclusion de fechas, horas, importes, recuentos, numeros de ticket, pedidos, facturas, nombres de fichero, numeros de build, direcciones IP, URLs, nombres de sala, valores enmascarados, tokens incompletos y marcadores de archivo.
- Deteccion de secretos aunque el texto indique que fueron revocados o que no deberian haberse pegado.
- Generacion de texto conversacional como capacidad heredada de la base, aunque el ajuste esta orientado a la tarea DLP.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking (de hecho, el thinking debe desactivarse).

## Casos de uso

- Filtrado de salida en asistentes corporativos: antes de enviar una respuesta generada por un LLM al usuario o a un sistema externo, se pasa el texto por Vail DLP para detectar claves de API, contrasenas o datos personales que se hayan filtrado en la generacion. Su latencia de ~0,4 s y ~1 GB de memoria lo hacen viable en el propio portatil del desarrollador.
- Prevencion de fugas en correo electronico: integrado como paso previo al envio en un cliente de correo, analiza el cuerpo del mensaje y devuelve las entidades sensibles para que el usuario confirme o elimine antes de enviar.
- Analisis de registros y tickets de soporte: se procesan mensajes de incidencia para localizar numeros de tarjeta, cuentas bancarias o identificadores fiscales que no deberian estar en un sistema de ticketing, permitiendo su redaccion o purga.
- Deteccion de secretos en textos pegados en herramientas internas: un portapapeles o un editor corporativo puede invocar el modelo para avisar cuando un usuario pega una clave de API o una contrasena en un campo de texto libre.
- Enmascaramiento previo a la indexacion: en un pipeline de busqueda o de analitica sobre conversaciones, el modelo etiqueta las entidades sensibles para que un paso posterior las sustituya por marcadores antes de almacenar o indexar el contenido.
- Cumplimiento y auditoria de datos: revision por lotes de muestras de conversaciones para verificar que los flujos de tratamiento no contienen datos personales no declarados, con salida JSON facil de agregar en informes.
- Prototipado local en Apple Silicon: gracias a MLX y a su bajo consumo, permite validar una politica DLP en un Mac antes de invertir en infraestructura, sin enviar datos a terceros.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmarks (`benchmark.png`) pero no se proporcionan los valores numericos en el texto disponible. Los unicos datos de rendimiento explicitos son de memoria y latencia:

| Carga de trabajo | Memoria pico |
|---|---|
| Pesos cargados | 0,40 GB |
| Mensaje tipico (~425 tokens de prompt, ~35 de salida) | 1,03 GB |
| Entrada de ~2,9K tokens | 1,65 GB |
| Entrada de ~11K tokens | 2,08 GB |
| Entrada de ~45K tokens | 4,72 GB |

Latencia: aproximadamente 0,4 s por mensaje en un M1 Max. No se han publicado en la informacion disponible los resultados numericos de MMLU, HumanEval, GSM8K ni de las metricas de extraccion (precision, recall, F1) que aparecen en la imagen de benchmarks.

## Requisitos de hardware

- VRAM/memoria estimada: 0,40 GB solo para los pesos; en torno a 1 GB para un mensaje tipico; 1,65 GB con entradas de ~2,9K tokens; 2,08 GB con ~11K tokens; 4,72 GB con ~45K tokens (memoria unificada en Apple Silicon).
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Max/Ultra) con memoria unificada; el modelo se ejecuta mediante `mlx-lm`.
- No es compatible con GPU NVIDIA ni AMD a traves de las herramientas habituales: los pesos 4-bit MLX no cargan en `transformers`, vLLM ni llama.cpp.
- Cabe en cualquier Mac con Apple Silicon; el consumo de memoria es moderado incluso en configuraciones base, aunque las entradas largas elevan el uso.
- Opciones de despliegue: `mlx-lm` (Python y CLI). No hay soporte documentado para Ollama, TGI, vLLM ni llama.cpp.
- Latencia y throughput: ~0,4 s por mensaje en un M1 Max; no se documenta throughput agregado ni latencia en otros equipos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks numericos ni de comparaciones publicadas en la informacion proporcionada. Como referencia estructural, se puede contrastar con su modelo base y con la variante sin cuantizar:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vail DLP 0.8B (MLX 4-bit) | 752.393.024 | no disponible | safetensors MLX 4-bit | Apache 2.0 | Hugging Face |
| mlx-community/Qwen3.5-0.8B-4bit (base) | no disponible | no disponible | safetensors MLX 4-bit | Apache 2.0 (segun enlace de licencia) | Hugging Face |
| Qwen/Qwen3.5-0.8B (base original) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se identifican en la informacion disponible otros modelos especializados en DLP con los que establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: todos los correos usan dominios `.example` y los identificadores son generados. En pruebas manuales con mensajes reales se observaron errores que el benchmark no refleja: un correo en un dominio real (`maria.lopez@acme-corp.com`) se etiqueto como `NAME` en lugar de `EMAIL`; un numero de cuenta bancaria se etiqueto como `CREDIT_CARD`; y un numero de enrutamiento en la misma frase no se detecto.
- Solo ingles. No se documenta soporte multilingue.
- Solo evaluado con mensajes cortos; las entradas largas deben dividirse en fragmentos, ya que el coste de procesamiento del prompt crece y la calidad no esta validada.
- Requiere un prompt fijo y exacto, un unico turno de usuario, thinking desactivado (`enable_thinking=False`) y decodificacion greedy (`temp=0`). Cualquier otra instruccion o system prompt reduce la precision.
- Formato exclusivo MLX 4-bit: no es portable a `transformers`, vLLM ni llama.cpp, lo que limita su uso a Apple Silicon.
- Riesgo de alucinacion y de clasificacion incorrecta en textos reales no sinteticos; debe probarse con datos propios antes de confiar en el modelo.
- No se documentan sesgos especificos, pero al derivar de un modelo base general y entrenarse con datos sinteticos, puede heredar sesgos de la base y presentar un comportamiento desviado ante nombres, direcciones o formatos regionales no representados.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de la variante MLX de la que deriva.
- Para produccion, se recomienda usar el modelo como una senal mas dentro de un pipeline con validacion posterior, no como unico mecanismo de prevencion de fugas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaz33m/Vail-DLP-0.8B-MLX-4bit
- Imagen de benchmarks: https://huggingface.co/iaz33m/Vail-DLP-0.8B-MLX-4bit/resolve/main/benchmark.png
- Modelo base MLX: https://huggingface.co/mlx-community/Qwen3.5-0.8B-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Repositorio de `mlx-lm`: https://github.com/ml-explore/mlx-lm
