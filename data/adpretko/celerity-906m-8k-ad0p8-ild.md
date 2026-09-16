# adpretko/celerity-906m-8k-ad0p8-ild

# Celerity 906M 8k (ad0p8-ild)

## Resumen

Celerity 906M 8k (ad0p8-ild) es un checkpoint de lenguaje de aproximadamente 906 millones de parametros publicado en Hugging Face por el usuario adpretko. Se trata de una conversion del formato nativo CS de Cerebras al formato de Hugging Face, realizada con coincidencia estricta de claves de checkpoint, y deriva del checkpoint interno `checkpoint_29117` generado con el runtime `cbcore 2.6.0`. El modelo esta configurado para una longitud de secuencia de 8.192 tokens y pertenece a la variante de entrenamiento denominada `ad0p8-ild`, cuyo significado no se documenta en la model card.

Su interes es tecnico y acotado: no es un modelo orientado a produccion, sino una pieza de investigacion y reutilizacion. La model card no declara licencia, idiomas, tarea de entrenamiento, composicion del dataset ni resultados de evaluacion, y el repositorio acumulaba cero descargas y cero likes en el momento de redactar esta ficha, lo que lo situa como un checkpoint no validado por la comunidad.

El atractivo principal es la escala: un modelo de ~900 M de parametros con 8k de contexto cabe holgadamente en una GPU de consumo, lo que permite experimentar con una arquitectura personalizada y compararla con alternativas densas de ~1 B ampliamente establecidas. Como contrapartida, la ausencia de licencia y de evaluaciones limita seriamente cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Celerity, con codigo de modelado propio para Hugging Face; requiere `trust_remote_code=True`. No se especifica en la model card si es transformer denso, MoE o hibrida |
| Parametros totales | ~906 millones (deducido del nombre del modelo y del tamano del repositorio, 1,8 GB, coherente con pesos en 16 bits; la model card no lo declara de forma explicita) |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | 8.192 tokens (8k), segun la model card |
| Tipos de cuantizacion | no disponible; no se publican versiones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; el tag `pytorch` y el tamano del repositorio apuntan a pesos en 16 bits, pero no se confirma safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card describe una familia de modelos llamada Celerity, con codigo de modelado propio que debe cargarse mediante `trust_remote_code=True`. El checkpoint procede del formato CS de Cerebras y se ha convertido al formato de Hugging Face con coincidencia estricta de claves, usando `cbcore 2.6.0` como runtime de origen. No se aportan datos sobre el numero de capas, dimensiones del modelo, mecanismo de atencion, tipo de normalizacion ni si la arquitectura incorpora componentes de mezcla de expertos o capas recurrentes: toda esa informacion es no disponible.

Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste fino con RLHF o DPO, ni el tokenizador empleado. El unico detalle de entrenamiento identificable es la etiqueta de variante `ad0p8-ild`, que no se explica en la model card; una lectura plausible es que codifica un valor de attention dropout de 0,8, aunque esto no esta confirmado y debe tratarse como hipotesis. La conversion garantiza que las claves coinciden, pero no se documenta ninguna verificacion numerica de equivalencia funcional con el checkpoint original.

## Capacidades

- Generacion de texto: es la unica capacidad asumible por tratarse de un checkpoint de un modelo de lenguaje; la model card no especifica la tarea de entrenamiento ni el tokenizador, por lo que debe verificarse experimentalmente antes de asumir un comportamiento concreto.
- Razonamiento, matematicas y generacion de codigo: no documentados y sin evaluaciones publicadas.
- Tool calling y function calling: no documentados; no se declara ninguna plantilla de chat ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; no se declaran idiomas soportados.
- Modalidades adicionales (vision, audio, modo de razonamiento explicito): no disponibles.
- Contexto largo: maneja ventanas de hasta 8.192 tokens, lo que permite procesar documentos de varias paginas en una sola pasada.

## Casos de uso

- Ajuste fino para dominios verticales: con ~906 M de parametros, el entrenamiento completo o con LoRA cabe en una GPU de consumo (12-24 GB), lo que permite especializar el modelo en jerga legal, medica o industrial partiendo de un checkpoint base pequeno.
- Investigacion sobre regularizacion en atencion: la variante `ad0p8-ild` es interesante para estudiar el efecto de configuraciones de dropout elevado en la atencion sobre la calidad final, reproduciendo el entrenamiento en el stack `cbcore`.
- Procesamiento de documentos en local u on-premise: con 8k de contexto se pueden resumir contratos, informes o historiales clinicos sin que los datos salgan de la infraestructura de la organizacion, algo critico cuando hay requisitos de soberania del dato.
- Extraccion de entidades y clasificacion de texto: mediante ajuste fino supervisado sobre tareas concretas (clasificacion de tickets, etiquetado de resenas, deteccion de intenciones) en entornos donde no se quiere depender de una API externa ni de conexion a internet.
- Generacion de datos sinteticos para aumentar datasets: el modelo puede producir texto de dominio con el que preentrenar o ajustar otros sistemas, siempre que se resuelva antes la incertidumbre sobre la licencia.
- Prototipado rapido de pipelines de NLP: sirve para validar plantillas de prompt, esquemas de datos y flujos de preprocesado antes de escalar a modelos de mayor tamano, con un coste de computo minimo.
- Despliegue en hardware limitado: en cuantizacion de 4 bits los pesos ocupan del orden de 0,5 GB, lo que abre la puerta a ejecucion en equipos de gama media, mini-PC o incluso CPU si se consigue una ruta de conversion viable.
- Banco de pruebas para evaluacion comparativa: util como punto de comparacion frente a modelos densos de ~1 B en tareas de contexto largo y en estudios de eficiencia por parametro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni similares) y la busqueda web no ha devuelto ningun articulo, informe o analisis independiente asociado a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (valores estimados a partir del tamano declarado; no hay mediciones publicadas): en fp16/bf16 los pesos ocupan unos 1,8 GB y conviene reservar 3-5 GB en total teniendo en cuenta la cache KV para 8.192 tokens y las activaciones; en 8 bits, alrededor de 0,9 GB de pesos y 2-3 GB totales; en 4 bits, unos 0,5 GB de pesos y 1,5-2 GB totales.
- La cache KV exacta no puede calcularse porque se desconocen el numero de capas, cabezas y dimension de cabeza del modelo; las cifras anteriores son orientativas.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM es suficiente. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 cubren el caso con holgura. Las A100 y H100 estan sobredimensionadas para este tamano y solo tienen sentido en escenarios de entrenamiento por lotes o de servicio con muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en practicamente todas las de gama media y alta lanzadas en los ultimos anos, e incluso en GPUs de 4-6 GB si se aplica cuantizacion agresiva.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la unica ruta confirmada, al depender de codigo de modelado personalizado. No hay confirmacion de soporte en vLLM, TGI, Ollama o llama.cpp; integrarlos exigiria portar la arquitectura y, en el caso de llama.cpp, convertir los pesos a GGUF, algo que no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion se limita a escala, contexto, licencia y disponibilidad, ya que no existe ningun dato de rendimiento de Celerity 906M que permita contrastar calidad. Los datos de los modelos alternativos proceden de sus fichas publicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 906M 8k (ad0p8-ild) | ~906 M | 8.192 tokens | no disponible | Hugging Face; requiere `trust_remote_code=True` y no tiene ecosistema de despliegue confirmado |
| Llama 3.2 1B | 1,23 B | 128.000 tokens | Llama 3.2 Community License | Pesos oficiales, soporte amplio en vLLM, llama.cpp y Ollama |
| Qwen2.5 1.5B | 1,54 B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | Pesos oficiales, soporte amplio en frameworks de inferencia |
| SmolLM2 1.7B | 1,7 B | 8.192 tokens | Apache 2.0 | Pesos oficiales, orientado a despliegue en dispositivo |

En terminos de contexto, Celerity 906M iguala a SmolLM2 1.7B pero queda por debajo de Llama 3.2 1B y Qwen2.5 1.5B. En licencia y madurez de ecosistema, las tres alternativas son claramente superiores, ya que cuentan con permisos explicitos y soporte nativo en los principales motores de inferencia.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no hay autorizacion clara de uso comercial ni de redistribucion. En la practica, esto convierte el checkpoint en no apto para produccion hasta que el autor aclare los terminos.
- Checkpoint no validado: cero descargas y cero likes, autor individual, sin paper asociado ni revision independiente. No hay evidencia externa de que la conversion sea funcionalmente equivalente al checkpoint original de Cerebras.
- Ejecucion de codigo arbitrario: la carga exige `trust_remote_code=True`, lo que implica ejecutar el codigo Python incluido en el repositorio. Debe auditarse antes de usarlo en cualquier entorno, y en particular en entornos con acceso a red o a datos sensibles.
- Riesgo de alucinacion y sesgos: no evaluado. No existen analisis de sesgo, toxicidad, veracidad ni comportamientos de rechazo, por lo que cualquier afirmacion sobre su seguridad seria especulativa.
- Idiomas: no declarados. Conviene inspeccionar el tokenizador y probar el idioma objetivo antes de asumir un rendimiento aceptable en castellano.
- Contexto limitado: 8.192 tokens es suficiente para documentos cortos, pero insuficiente para casos de retrieval aumentado con muchos fragmentos o analisis de repositorios completos, donde las alternativas de 32k a 128k llevan ventaja.
- Soporte de despliegue reducido: al no haber confirmacion de soporte en vLLM, TGI, Ollama o llama.cpp, el despliegue a escala exige trabajo de integracion adicional.
- Falta de plantilla de chat: no se documenta un formato de conversacion, por lo que el modelo podria no comportarse correctamente en dialogos multi-turno sin un ajuste especifico.
- Trazabilidad parcial: se conoce el checkpoint de origen (`checkpoint_29117`) y el runtime (`cbcore 2.6.0`), pero no la configuracion de entrenamiento ni el dataset, lo que dificulta reproducir resultados o auditar el origen de los datos.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-906m-8k-ad0p8-ild
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; unicamente aparecieron paginas de soporte de Microsoft sin vinculacion con este checkpoint.
