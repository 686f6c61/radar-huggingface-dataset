# Nayif7/opentune-phi3-mini-xlam-functioncalling

## Resumen

OpenTune Phi-3-mini XLAM Function Calling es un adaptador LoRA/QLoRA publicado por el usuario Nayif7 sobre `microsoft/Phi-3-mini-4k-instruct`, un modelo decoder-only de 3.800 millones de parámetros con 4.096 tokens de contexto. El adaptador no añade conocimiento nuevo: su objetivo es estrictamente de formato, es decir, convertir una petición en lenguaje natural junto con una lista de esquemas de herramientas en una llamada JSON estructurada y válida, en lugar de texto en prosa. El repositorio pesa 0,1 GB y contiene únicamente los pesos del adaptador en safetensors (aproximadamente 100 MB), no un modelo fusionado.

El problema que aborda es concreto y bien documentado en su propia model card: los modelos pequeños instruidos son malos ejecutores de tool calling por defecto. Tienden a narrar la llamada, envolver el JSON en bloques markdown, inventar nombres de herramientas que no se le han ofrecido o emitir salidas que directamente no parsean. Según los datos declarados por el autor, el modelo base obtiene un 0,0 % de coincidencia exacta en un split de 120 ejemplos retenidos, mientras que el adaptador alcanza un 72,5 %.

Es relevante para quien necesita un router de herramientas barato y ejecutable en local, sin depender de una API externa. La contrapartida es que el entrenamiento es muy corto (una época sobre 1.080 ejemplos, en torno al 2 % del dataset disponible) y que el solapamiento de esquemas de herramientas entre entrenamiento y evaluación es del 98,3 %, por lo que la mejora demuestra fiabilidad sobre un conjunto de herramientas conocido y no generalización a herramientas nuevas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA (PEFT) sobre transformer decoder-only (Phi-3-mini) |
| Parametros totales | 3.800 millones en el modelo base; adaptador LoRA de aproximadamente 100 MB (número exacto de parámetros entrenables no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base Phi-3-mini-4k-instruct) |
| Tipos de cuantizacion | Base en 4-bit NF4 (con doble cuantización, `bnb_4bit_compute_dtype=torch.float16`); el adaptador se distribuye sin cuantizar. No se proporciona GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT; el modelo no se distribuye fusionado) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA sobre `microsoft/Phi-3-mini-4k-instruct` congelado y cuantizado en 4-bit NF4. Al ser un adaptador PEFT, no modifica la arquitectura del modelo base: añade matrices de bajo rango en las capas que el pipeline de OpenTune haya configurado. En inferencia es obligatorio cargar el base con el mismo esquema de cuantización (4-bit NF4) que se usó en entrenamiento; adjuntarlo a un base cuantizado de forma distinta provoca un desajuste real entre entrenamiento e inferencia que se manifiesta como errores de rutas de claves y degradación de la salida.

El dataset de entrenamiento es `Salesforce/xlam-function-calling-60k`, del que solo se usó una época sobre 1.080 ejemplos, aproximadamente el 2 % del total disponible. El proceso parte de un subconjunto de 1.200 ejemplos del que se derivan los splits de entrenamiento y evaluación, lo que explica el alto solapamiento de herramientas entre ambos. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación adicional; tampoco innovaciones de decodificación como decodificación especulativa. El pipeline de entrenamiento y evaluación está publicado en el repositorio de GitHub OpenTune, que incluye un script (`colab_reevaluate_existing_adapter.py`) capaz de reconstruir los mismos 120 ejemplos retenidos a partir de la semilla y reevaluar el adaptador sin reentrenar.

## Capacidades

- Generación de llamadas a funciones en JSON estructurado a partir de una petición en lenguaje natural y una lista de esquemas de herramientas.
- Selección de herramienta: elige qué función del conjunto ofrecido corresponde a la petición (98,3 % de acierto declarado en el split de evaluación).
- Relleno de argumentos: genera los parámetros de la llamada, con un 72,5 % de coincidencia exacta incluyendo todos los argumentos.
- Emisión de JSON válido y parseable sin necesidad de limpieza posterior (98,3 % de validez declarada).
- Soporte de tool calling / function calling en bucles de agente y routers de herramientas.
- Razonamiento multi-paso: no es una capacidad objetivo del adaptador; la model card lo declara explícitamente fuera de alcance.
- Capacidades multilingües: no disponibles; el adaptador es solo en inglés.
- Capacidades especiales: no dispone de modo de razonamiento explícito (thinking mode), ni visión, ni audio. El adaptador es de propósito estrecho y, según su autor, rinde peor que el modelo base en tareas abiertas de chat, razonamiento o seguimiento de instrucciones.

## Casos de uso

- Enrutado de herramientas en agentes locales: dado un catálogo de funciones (APIs internas, consultas a base de datos, acciones sobre CRM) y la petición del usuario, el adaptador devuelve la llamada lista para ejecutar. Es adecuado porque elimina el paso de parseo defensivo y la limpieza de bloques markdown que suele requerir el modelo base.
- Extracción estructurada en pipelines ETL: convertir texto libre (correos, tickets, formularios) en objetos JSON con un esquema fijo, tratando el esquema como una herramienta. Encaja en flujos por lotes donde interesa ejecución local y coste por token nulo.
- Automatización de atención al cliente: el modelo traduce la consulta del usuario en llamadas a funciones de consulta de pedidos, estado de envío o modificación de datos. El contexto de 4.096 tokens limita el historial conversacional, por lo que conviene resumir turnos previos.
- Orquestación de operaciones sobre infraestructura: traducir instrucciones como "reinicia el servicio de pagos en staging" a llamadas de un catálogo de herramientas de despliegue o de CI/CD, con validación posterior obligatoria de los argumentos antes de ejecutar.
- Asistente de voz o de dispositivos con recursos limitados: al ser un adaptador de 100 MB sobre un base de 3.800 millones en 4-bit, cabe en GPUs de consumo y permite mantener los datos en local, algo relevante en entornos con requisitos de privacidad.
- Prototipado y evaluación de esquemas de herramientas: sirve para medir rápidamente si un catálogo de funciones está bien descrito, comparando la tasa de acierto de selección antes y después de reescribir las descripciones.
- Generación de datos sintéticos de tool calling: usar el adaptador como generador de llamadas correctas para aumentar datasets de entrenamiento de modelos mayores, filtrando las salidas por validez semántica y no solo sintáctica.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) sobre un split retenido de 120 ejemplos del dataset `Salesforce/xlam-function-calling-60k`, con decodificación greedy (`temperature=0`) para hacerlos reproducibles. Se comparan el modelo base y el adaptador:

| Metrica | Base | Fine-tuned | Cambio |
|---|---|---|---|
| Coincidencia exacta (herramienta + todos los argumentos) | 0,0 % | 72,5 % | +72,5 puntos |
| Precisión de selección de herramienta | 15,8 % | 98,3 % | +82,5 puntos |
| Validez de JSON | 40,8 % | 98,3 % | +57,5 puntos |
| ROUGE-L (secundaria) | 0,230 | 0,954 | +0,724 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) ni comparaciones frente a modelos frontera evaluados en zero-shot con el mismo prompt.

## Requisitos de hardware

- VRAM estimada (solo pesos): en 4-bit NF4 el base ocupa del orden de 2,2-2,5 GB, más unos 100 MB del adaptador; en fp16 el base serían aproximadamente 7,6 GB, configuración que no está soportada por el entrenamiento original pero que es técnicamente posible.
- Overhead adicional: hay que sumar la caché KV (estimación del orden de 1-2 GB a 4.096 tokens en fp16) y las activaciones; en la práctica, un presupuesto de 4-6 GB para la configuración 4-bit y de 10-12 GB para fp16 es razonable.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA. El adaptador se entrenó y evaluó asumiendo CUDA. Funciona con holgura en RTX 4090, A100, H100 o L40S; también en tarjetas de gama media con 8 GB o más en la ruta 4-bit.
- Cabe en GPU de consumo: sí, en 4-bit entra en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. Con 8 GB de VRAM es ajustado pero viable en 4-bit con contexto reducido.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` + `accelerate` es la ruta documentada y la única garantizada (requiere cargar el base en 4-bit NF4). vLLM o TGI podrían servir el adaptador mediante soporte LoRA, pero no está documentado ni validado por el autor. llama.cpp y Ollama no son una vía directa porque no se publica GGUF ni pesos fusionados.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nayif7/opentune-phi3-mini-xlam-functioncalling | 3,8B (base) + adaptador de ~100 MB | 4.096 tokens | Adaptador QLoRA especializado en function calling | MIT | Adaptador PEFT en safetensors; requiere el base por separado |
| microsoft/Phi-3-mini-4k-instruct | 3,8B | 4.096 tokens | Modelo base instruido de propósito general | MIT | Pesos completos en safetensors, ampliamente soportado |
| Salesforce/xLAM-7b-r | 7B | no disponible | Modelo afinado específicamente para function calling | no disponible | no disponible |
| NousResearch/Hermes-2-Pro-Llama-3-8B | 8B | no disponible | Modelo instruido con soporte de llamadas a funciones y JSON | no disponible | no disponible |

En rendimiento comparable no hay datos: la model card advierte explícitamente que no existe una línea base de modelos frontera evaluados en zero-shot con el mismo prompt, por lo que las cifras del adaptador no permiten situarlo frente a modelos mayores. En términos de licencia, MIT es más permisiva que las licencias típicas de los modelos afinados para function calling de otros proveedores.

## Limitaciones y advertencias

- Solapamiento de esquemas de herramientas del 98,3 % entre entrenamiento y evaluación: la afirmación defendible es "llamada fiable sobre un conjunto de herramientas conocido con frases nuevas", no generalización a herramientas nunca vistas.
- Presupuesto de entrenamiento muy corto: una época sobre 1.080 ejemplos, en torno al 2 % del dataset de 60k.
- Evaluación sobre solo 120 ejemplos: suficiente para que una diferencia de 72,5 puntos sea inequívoca, pero con intervalos de confianza amplios para diferencias pequeñas.
- El adaptador no está fusionado: la inferencia exige cargar el base en 4-bit NF4 más el adaptador. No hay exportación a GGUF ni a pesos fusionados.
- Solo inglés, heredando la cobertura del modelo base y del dataset.
- No está alineado en seguridad: no ha pasado por procesos de safety tuning.
- No valida las llamadas que produce: una llamada sintácticamente válida puede ser semánticamente incorrecta. Es obligatorio validar los argumentos antes de ejecutarlos.
- Fuera de alcance: chat general, razonamiento abierto y seguimiento de instrucciones. En esas tareas el adaptador será peor que el modelo base.
- Latencia y throughput no documentados, lo que dificulta dimensionar despliegues en producción.
- Popularidad muy baja en el momento de la consulta (0 descargas, 1 like), sin mantenimiento ni comunidad que garantice soporte.
- Licencia MIT sobre el adaptador, pero conviene verificar las condiciones del modelo base y del dataset xLAM antes de un uso comercial.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Nayif7/opentune-phi3-mini-xlam-functioncalling
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Repositorio de entrenamiento y evaluación (OpenTune): https://github.com/mohdnayif799/OpenTune-QLoRA-Fine-Tuning-Pipeline-for-LLM-Function-Calling
- Nota: la búsqueda web asociada no devolvió ningún enlace relevante sobre el modelo, el paper o demos; los resultados obtenidos correspondían a servidores de videojuegos sin relación con el contenido de esta ficha.
