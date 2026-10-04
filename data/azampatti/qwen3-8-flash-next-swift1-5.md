# azampatti/Qwen3.8-Flash-Next-Swift1.5

## Resumen

Qwen3.8-Flash-Next-Swift1.5 es un complemento (add-on) publicado por el usuario azampatti sobre el modelo Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound. No es un modelo completo: sustituye dos componentes del modelo base, el modulo de atencion (reemplazado por el de Swift1.5, de ukisai) y el experto compartido (reentrenado sobre el propio tronco del modelo base). Los unicos pesos nuevos son tres ficheros en fp8 que ocupan aproximadamente 3,2 GB; todo lo demas se hereda del modelo base, que debe instalarse antes.

El problema que resuelve es el coste de inferencia en modelos con modo de razonamiento explicito. Segun la model card, el resultado piensa alrededor de un 40 % menos tokens manteniendo una precision practicamente identica: en configuracion xhigh pasa de 0,58x tokens de pensamiento con 88,3 % frente al 88,9 % del base, y en medium de 0,61x con 82,9 % frente al 84,8 %. Con el pensamiento desactivado la capacidad sube ligeramente (50,6 % frente a 49,1-49,7 %) y Tool-Eval-Bench se mantiene en 91,3. La velocidad declarada no cambia (~78 tok/s en un solo stream).

La relevancia es operativa: al reducir el presupuesto de tokens de razonamiento sin degradar la precision, baja el coste por consulta en cargas de trabajo intensivas en razonamiento. El modelo base es una arquitectura MoE de 125B de parametros totales y aproximadamente 5B activos, cuantizada a INT4 con AutoRound, servida mediante vLLM con recetas de despliegue en uno o dos nodos. La licencia declarada es Apache 2.0 y el unico idioma listado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer sobre Qwen3.8-Flash-Next; el add-on reemplaza el modulo de atencion por el de Swift1.5 y el experto compartido por uno reentrenado sobre el tronco del base |
| Parametros totales | 125B en el modelo base (el add-on aporta solo ~3,2 GB de pesos nuevos en fp8) |
| Parametros activos | ~5B (denominacion A5B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo base en INT4 (AutoRound); pesos del add-on en fp8 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp8 en el add-on) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 125B de parametros totales y aproximadamente 5B activos por token, cuantizado a INT4 mediante AutoRound. Sobre ese tronco, este add-on no reentrena el modelo: intercambia dos piezas. Por un lado, sustituye el mecanismo de atencion por el desarrollado en Swift1.5 (ukisai/Swift1.5-Qwen3.8-Flash-Next). Por otro, reemplaza el experto compartido por uno "curado" sobre el propio tronco del modelo base. Los tres ficheros incluidos en el repositorio son la totalidad de los pesos nuevos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo base ni en este add-on. Tampoco se documenta el procedimiento exacto de curacion del experto compartido ni el metodo de trasplante de atencion, mas alla de la descripcion cualitativa de la model card. Lo que si se declara como resultado medible es la innovacion practica: una reduccion de aproximadamente el 40 % en tokens de razonamiento con precision equivalente, lo que sugiere que ambas sustituciones actuan sobre la eficiencia del bucle de pensamiento mas que sobre el conocimiento almacenado.

## Capacidades

- Razonamiento explicito con niveles de esfuerzo configurables (xhigh por defecto y medium documentado), con presupuesto de tokens de pensamiento reducido frente al modelo base.
- Razonamiento matematico y cientifico de nivel alto, evidenciado por los resultados agregados en GPQA, AIME y MATH sobre 688 preguntas.
- Uso de herramientas (tool calling / function calling), respaldado por una puntuacion de 91,3 en Tool-Eval-Bench.
- Capacidad de operar con el modo de pensamiento desactivado, con una puntuacion de capacidad del 50,6 % frente al 49,1-49,7 % del base.
- Servicio mediante vLLM como modelo compuesto, con el identificador azampatti/Qwen3.8-Flash-Next-Swift1.5.
- Soporte de despliegue en un nodo o en dos nodos mediante recetas YAML incluidas en el repositorio de instalacion.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo; no hay informacion sobre otros idiomas.
- No se declaran capacidades de vision, audio ni modalidades adicionales.

## Casos de uso

- Razonamiento cientifico y matematico de alta exigencia: el modelo puede resolver problemas de nivel GPQA o AIME, y su principal ventaja es hacerlo con un 42 % menos de tokens de pensamiento en xhigh, lo que reduce directamente el coste por problema resuelto en entornos de evaluacion masiva.
- Agentes con herramientas en produccion: una puntuacion de 91,3 en Tool-Eval-Bench lo hace adecuado para pipelines donde el modelo debe encadenar llamadas a funciones, y el menor gasto de tokens por paso abarata las cadenas de razonamiento multi-paso.
- Servicio de asistencia tecnica especializada en ingles: al ser un modelo de un solo idioma declarado, encaja en despliegues orientados a usuarios angloparlantes que requieran respuestas razonadas y verificables.
- Inferencia autoalojada con vLLM: las recetas incluidas permiten levantar el modelo compuesto en un nodo o en dos, de modo que equipos con infraestructura propia pueden servirlo sin depender de APIs externas.
- Optimizacion de coste en cargas de razonamiento: si el modelo base ya esta desplegado, sustituir la atencion y el experto compartido por este add-on reduce el consumo de tokens de pensamiento sin reentrenar ni cambiar el resto del stack.
- Despliegue en dos nodos para mayor capacidad: la receta qwen3.8-flash-next-swift15-b12x.yaml permite repartir el modelo entre dos maquinas, util cuando la VRAM disponible por nodo no basta para los 125B en INT4.
- Evaluacion comparativa de tecnicas de trasplante de modulos: sirve como referencia reproducible para investigar cuanto se puede ganar en eficiencia de razonamiento sustituyendo atencion y experto compartido sin tocar los pesos del tronco.
- Generacion de contenido tecnico en ingles con razonamiento desactivado: en tareas donde no hace falta cadena de pensamiento, el modo sin pensamiento ofrece una capacidad ligeramente superior al base (50,6 % frente a 49,1-49,7 %) con menor latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor frente al modelo base, sobre un conjunto agregado de 688 preguntas de GPQA, AIME y MATH:

| Configuracion | Tokens de pensamiento (relativo al base) | Precision (GPQA / AIME / MATH, 688 preguntas) |
|---|---|---|
| xhigh | 0,58x | 88,3 % frente a 88,9 % |
| medium | 0,61x | 82,9 % frente a 84,8 % |

| Metrica adicional | Resultado |
|---|---|
| Capacidad con pensamiento desactivado | 50,6 % frente a 49,1-49,7 % del base |
| Tool-Eval-Bench | 91,3 frente a 91,3 del base |
| Velocidad | sin cambios, ~78 tok/s en un solo stream |

No se han publicado en la informacion disponible resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros), ni curvas de precision por numero de tokens de pensamiento.

## Requisitos de hardware

- VRAM estimada para el modelo base: 125B de parametros en INT4 equivalen a unos 62-65 GB solo en pesos, a los que hay que sumar la cache KV y los buffers de ejecucion. Es una estimacion derivada del tamano, no un dato publicado.
- El add-on anade aproximadamente 3,2 GB de pesos en fp8, mas el espacio de trabajo necesario para sustituir la atencion y el experto compartido.
- No cabe en GPU de consumo con 24 GB (RTX 4090, RTX 3090) ni, con toda probabilidad, en una unica GPU de 48 GB. Se requiere agregacion de VRAM por multiples GPU o el despliegue en dos nodos que el propio autor documenta.
- El autor proporciona dos recetas: qwen3.8-flash-next-swift15-b12x-solo.yaml para un nodo y qwen3.8-flash-next-swift15-b12x.yaml para dos nodos, sobre una imagen b12x de spark-vllm-docker.
- Opciones de despliegue documentadas: vLLM con las recetas del repositorio de instalacion. No se mencionan llama.cpp, Ollama ni TGI.
- Rendimiento declarado: aproximadamente 78 tok/s en un solo stream, sin cambios respecto al modelo base. No hay datos de throughput agregado por lotes ni de latencia por token bajo carga.
- La instalacion requiere clonar el repositorio de instalacion, ejecutar setup.sh del base, despues swift15/setup.sh para este add-on, y ejecutar la receta correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| azampatti/Qwen3.8-Flash-Next-Swift1.5 (este) | 125B totales, ~5B activos (MoE, base INT4 + add-on fp8) | no disponible | 88,3 % en GPQA/AIME/MATH (xhigh) con 0,58x tokens de pensamiento; Tool-Eval-Bench 91,3 | apache-2.0 | HuggingFace, requiere el base instalado |
| azampatti/Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound | 125B totales, ~5B activos (MoE, INT4 AutoRound) | no disponible | 88,9 % en GPQA/AIME/MATH (xhigh); Tool-Eval-Bench 91,3 | no disponible en la informacion proporcionada | HuggingFace, es el modelo base obligatorio |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace, es la fuente del modulo de atencion |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin instalar previamente azampatti/Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound, los pesos de este repositorio no son utilizables.
- El unico idioma declarado es el ingles. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Se desconoce la longitud de contexto soportada, dato critico para planificar despliegues con documentos largos.
- Los resultados de benchmarks son agregados sobre 688 preguntas de tres pruebas distintas (GPQA, AIME, MATH); no se publica el desglose por prueba, lo que impide saber donde se concentra la perdida de precision.
- La caida de precision existe aunque sea pequena: en xhigh es de 0,6 puntos y en medium de 1,9 puntos. En aplicaciones con umbrales estrictos de exactitud, ese margen puede ser relevante.
- El procedimiento de "curacion" del experto compartido y el trasplante de atencion no estan documentados tecnicamente, lo que dificulta auditar el comportamiento del modelo resultante.
- Riesgo de alucinacion: no se declara ninguna evaluacion especifica de veracidad ni de tasas de alucinacion, mas alla de las pruebas de razonamiento y de uso de herramientas.
- Sesgos conocidos: no hay informacion disponible sobre evaluaciones de sesgo, toxicidad o justicia.
- Licencia: el repositorio declara apache-2.0, pero la model card indica que "la licencia sigue a Qwen3.8-Flash-Next y Swift1.5". Conviene verificar las condiciones de ambas fuentes antes de un uso comercial, ya que pueden anadir restricciones no reflejadas en el campo de licencia.
- Madurez: el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion independiente de la comunidad.
- Despliegue complejo: requiere contenedores Docker especificos, recetas YAML y, en la configuracion documentada, posiblemente dos nodos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azampatti/Qwen3.8-Flash-Next-Swift1.5
- Modelo base obligatorio: https://huggingface.co/azampatti/Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound
- Fuente del modulo de atencion Swift1.5: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Repositorio de instalacion: https://github.com/azampatti/Qwen3.8-Flash-Next-Int4-FAST
- Receta para un nodo: recipes/qwen3.8-flash-next-swift15-b12x-solo.yaml (dentro del repositorio anterior)
- Receta para dos nodos: recipes/qwen3.8-flash-next-swift15-b12x.yaml (dentro del repositorio anterior)
- No se han proporcionado enlaces a papers, blogs, demos ni a la documentacion del modelo base Qwen3.8-Flash-Next.
