# Goghor/Swift-1.5-Qwen3.8-27B-INT8-W8A16-AutoRound-MTP

## Resumen

Swift-1.5-Qwen3.8-27B-INT8-W8A16-AutoRound-MTP es una version cuantizada a INT8 (esquema W8A16 con AutoRound) del modelo Swift-1.5-Qwen3.8-27B, una adaptacion desarrollada por UkisAI sobre la arquitectura base Qwen3.8-27B. El repositorio lo publica el usuario Goghor bajo licencia Apache 2.0 y esta pensado para servir el modelo en configuraciones de hardware modestas mediante vLLM, conservando ademas la cabeza de prediccion multi-token (MTP) que habilita decodificacion especulativa.

El modelo cuenta con 27.781.427.952 parametros (~27,8 mil millones) y el repositorio ocupa 31,6 GB, lo que da una idea del peso de los pesos en INT8 mas los ficheros auxiliares. Segun la informacion publica, Swift 1.5 reduce los tokens de "pensamiento" un 58,5 % respecto al modelo base manteniendo (e incluso mejorando ligeramente, +0,35 %) la precision global, lo que se traduce en una aceleracion de 1,95x. Es un modelo multimodal de tipo Image-Text-to-Text, por lo que acepta entradas de imagen y texto.

Su relevancia actual radica en que combina tres piezas muy demandadas en despliegues de produccion: cuantizacion INT8 con AutoRound para reducir huella de memoria, soporte de MTP para decodificacion especulativa (mayor throughput) y compatibilidad con vLLM para servir con tensor parallelism. Todo ello con una licencia permisiva (Apache 2.0) que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.8-27B, con cabeza de prediccion multi-token (MTP); multimodal (Image-Text-to-Text) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A16 con AutoRound (formato compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, INT8 W8A16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso correspondiente a Qwen3.8-27B, sobre el que UkisAI ha aplicado una adaptacion denominada Swift 1.5. Segun la informacion disponible, esa adaptacion se logra mediante post-entrenamiento escalado (RL y OPD), y su objetivo principal es mejorar la eficiencia de razonamiento: reducir el numero de tokens de pensamiento un 58,5 % y, con ello, acelerar la inferencia 1,95x, manteniendo la precision global con una mejora marginal de +0,35 % respecto al modelo base. El modelo incorpora una cabeza MTP (multi-token prediction), que permite decodificacion especulativa para aumentar el throughput.

Esta version concreta del repositorio no reentrena el modelo, sino que aplica una cuantizacion INT8 en formato compressed-tensors con el algoritmo AutoRound (esquema W8A16: pesos en 8 bits, activaciones en 16 bits). La cuantizacion preserva la cabeza MTP, por lo que las ventajas de la decodificacion especulativa se mantienen en el modelo cuantizado. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RL/OPD empleado.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento ("thinking tokens") optimizado en eficiencia respecto a la version base.
- Comprension de imagen y texto (pipeline Image-Text-to-Text), es decir, capacidades multimodales de vision.
- Conversacion multi-turno (etiqueta conversational en el repositorio).
- Decodificacion especulativa mediante cabeza MTP, orientada a reducir latencia por token generado.
- Servicio con vLLM y tensor parallelism (TP2 validado en el perfil de referencia).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (idiomas no declarados).

## Casos de uso

- Despliegue de asistente conversacional multimodal en produccion: el modelo acepta imagen y texto y esta cuantizado a INT8, por lo que puede servirse en dos GPUs de 24 GB con vLLM y tensor parallelism, gestionando dialogos multi-turno con coste de memoria reducido.
- Razonamiento asistido con control de coste por token: gracias a la reduccion del 58,5 % en tokens de pensamiento, tareas que exigen cadenas de razonamiento largas (analisis de documentos, resolucion de problemas) consumen menos tokens de salida y bajan el coste por consulta.
- Servicio de alto throughput con vLLM: la combinacion de INT8 + cabeza MTP permite activar decodificacion especulativa y aumentar tokens por segundo en entornos con concurrencia alta.
- Analisis de imagenes con preguntas en lenguaje natural: al ser un modelo Image-Text-to-Text, puede emplearse para extraer informacion de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos.
- Backend de aplicaciones internas con requisitos de licencia permisiva: la licencia Apache 2.0 y la cuantizacion INT8 facilitan integraciones comerciales sin dependencia de APIs externas.
- Inferencia en hardware de gama alta para consumo (dual RTX 3090 24 GB): el perfil de despliegue validado (2xRTX 3090, PCIe sin NVLink/P2P, vLLM TP2) permite montar un nodo de inferencia local sin recurrir a GPUs de datacenter.
- Evaluacion y benchmarking de tecnicas de cuantizacion: el modelo sirve como caso de estudio para medir el impacto de AutoRound W8A16 sobre un modelo de ~27,8 B con cabeza MTP.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La fuente publica de UkisAI indica que existe una comparativa entre Qwen3.8-27B (modelo base), Swift 1.0 y Swift 1.5, con agregados de cinco repeticiones, pero no se facilitan las cifras concretas. Los unicos datos cuantitativos disponibles son relativos:

| Metrica | Valor reportado |
|---|---|
| Reduccion de tokens de pensamiento (Swift 1.5 vs base) | -58,5 % |
| Variacion de precision global (Swift 1.5 vs base) | +0,35 % |
| Aceleracion | 1,95x |
| Perfil de servicio validado | 2x RTX 3090 24 GB, PCIe sin NVLink/P2P, vLLM TP2 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en INT8 de un modelo de ~27,8 B ocupan aproximadamente 28 GB, y el repositorio completo pesa 31,6 GB; hay que sumar la memoria para KV cache y activaciones, por lo que se recomienda un minimo de ~32-48 GB de VRAM segun la longitud de contexto y el batch.
- Configuracion validada: 2x RTX 3090 de 24 GB (48 GB totales) con vLLM en tensor parallelism TP2, sobre PCIe sin NVLink ni P2P.
- GPU recomendadas: dos RTX 3090/4090 de 24 GB, o una GPU unica de 48 GB o mas (A6000, L40S, A100 80 GB, H100) para servir en una sola tarjeta.
- Cabe en consumer GPU: si, repartido entre dos GPUs consumer de 24 GB; en una sola GPU consumer de 24 GB no cabe con holgura.
- Opciones de despliegue: vLLM (soportado de forma explicita y validado); llama.cpp/Ollama no estan confirmados para este formato compressed-tensors INT8.
- Latencia y throughput: no disponible como cifra absoluta; la aceleracion reportada respecto al modelo base es de 1,95x.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-INT8-W8A16-AutoRound-MTP | ~27,8 B | INT8 W8A16 (AutoRound) + MTP | no disponible | Apache 2.0 | Version cuantizada para vLLM; -58,5 % tokens de pensamiento, 1,95x mas rapida |
| Swift-1.5-Qwen3.8-27B | ~27,8 B | BF16 | no disponible | Apache 2.0 (segun la base) | Modelo original de UkisAI, sin cuantizar |
| Swift 1.0 (Qwen3.8-27B) | ~27,8 B | BF16 | no disponible | Apache 2.0 (segun la base) | Primera adaptacion de UkisAI |
| Qwen3.8-27B | ~27,8 B | BF16 | no disponible | no disponible | Modelo base sobre el que se construye Swift |

No se dispone de datos de contexto, benchmarks ni idiomas para ninguno de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion INT8 puede introducir una perdida de precision respecto al modelo en BF16; no se han publicado mediciones especificas del degradado introducido por AutoRound W8A16 en este modelo.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo.
- Se desconoce la longitud de contexto soportada y los idiomas declarados, lo que limita planificar despliegues multilingues o con ventanas largas.
- La model card del repositorio no incluye documentacion tecnica propia (solo la licencia), por lo que gran parte de los datos proceden de fuentes externas y deben verificarse.
- El modelo tiene 0 descargas y 0 "likes" en el repositorio, lo que implica ausencia de validacion comunitaria y de casos de uso contrastados.
- Al tener capacidades de vision, conviene revisar el tratamiento de imagenes de usuario por posibles implicaciones de privacidad y contenido.
- Aunque la licencia es Apache 2.0, conviene confirmar las condiciones de la adaptacion de UkisAI y del modelo base Qwen3.8-27B antes de un uso comercial a gran escala.
- El soporte de tool calling, agentes e idiomas no esta confirmado; no debe asumirse en disenos de produccion sin pruebas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Goghor/Swift-1.5-Qwen3.8-27B-INT8-W8A16-AutoRound-MTP
- Repositorio relacionado (sin AutoRound): https://huggingface.co/Goghor/Swift-1.5-Qwen3.8-27B-INT8-W8A16-MTP
- Ficheros del repositorio: https://huggingface.co/Goghor/Swift-1.5-Qwen3.8-27B-INT8-W8A16-MTP/tree/main
- Pagina del modelo Swift 1.5 en UkisAI: https://ukisai.com/swift-1-5-27b
- Perfil de inferencia en FriendliAI: https://friendli.ai/models/Goghor/Swift-1.5-Qwen3.8-27B-INT8-W8A16-MTP
- Despliegue en Featherless AI: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
