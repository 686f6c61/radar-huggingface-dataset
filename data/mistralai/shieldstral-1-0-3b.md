# mistralai/Shieldstral-1.0-3B

## Resumen

Shieldstral-1.0-3B es un clasificador de seguridad multimodal desarrollado por Mistral AI, diseñado para moderar contenido de texto e imagen mediante políticas definidas en lenguaje natural. A diferencia de los filtros tradicionales basados en listas negras o clasificadores de toxicidad genéricos, este modelo evalúa prompts, respuestas y pares prompt-respuesta contra políticas personalizadas y devuelve una clasificación binaria (sí/no). Está basado en el modelo base Ministral-3-3B-Base-2512, del que es un fine-tuning especializado, y emplea la arquitectura Mistral 3, que integra capacidades multimodales.

El modelo destaca por su tamaño compacto (3B parámetros) y su licencia Apache-2.0, lo que permite su integración en entornos de producción con requisitos de hardware moderados. Según Mistral AI, supera en precisión a clasificadores de seguridad de hasta 7 veces su tamaño, lo que lo convierte en una opción atractiva para equipos que necesitan moderación de contenido sin depender de APIs propietarias. Su salida se reduce a un único token (yes/no), lo que facilita su uso como componente de filtrado en pipelines de generación aumentada por recuperación, agentes conversacionales o plataformas de contenido generado por usuarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral 3 (transformer multimodal, fine-tuning de Ministral-3-3B-Base-2512) |
| Parametros totales | 3B (aproximado, segun denominacion del modelo) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, compatible con vLLM) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar, ru (segun tags de HuggingFace) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Shieldstral-1.0-3B parte del modelo base Ministral-3-3B-Base-2512, que emplea una arquitectura transformer multimodal de la familia Mistral 3. Sobre esta base se ha realizado un fine-tuning especifico para tareas de moderacion y clasificacion de seguridad. El modelo procesa tanto texto como imagenes y utiliza un mecanismo de "preguntas de politica" en lenguaje natural: el usuario define una politica (por ejemplo, "el contenido debe ser seguro para menores") y el modelo clasifica si el contenido evaluado cumple o no con esa politica, emitiendo un unico token de respuesta (yes/no).

No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal reside en su enfoque de moderacion basada en politicas configurables en tiempo de inferencia, en lugar de categorias fijas predefinidas. Esto permite adaptar el modelo a distintos marcos normativos o directrices de producto sin necesidad de reentrenamiento.

## Capacidades

- Moderacion de prompts: clasifica si un prompt de entrada es seguro o no segun la politica especificada.
- Moderacion de respuestas: evalua la seguridad de la salida generada por un modelo de lenguaje.
- Clasificacion de pares prompt-respuesta: analiza conjuntamente la entrada y la salida para detectar problemas contextuales.
- Deteccion de rechazo (refusal detection): identifica si un modelo ha rechazado correctamente una solicitud no segura.
- Filtrado de seguridad multimodal: procesa tanto texto como imagenes, permitiendo moderar contenido visual.
- Politicas personalizables en lenguaje natural: el usuario define las reglas de moderacion en texto plano, sin necesidad de programar clasificadores ad hoc.
- Salida binaria simple: emite un unico token (yes/no), lo que facilita su integracion en pipelines de decision automatica.
- Multilingue: soporta 12 idiomas, incluyendo espanol, frances, aleman, chino, japones, arabe y ruso.

## Casos de uso

- Moderacion de contenido en plataformas sociales: el modelo puede evaluar publicaciones, comentarios e imagenes subidas por usuarios contra las politicas de la comunidad, devolviendo una decision de aprobacion o rechazo en tiempo real. Su salida binaria permite integrarlo en sistemas de cola de revision con latencia minima.
- Filtrado de respuestas en chatbots de atencion al cliente: antes de enviar una respuesta generada por un LLM al usuario, Shieldstral puede verificar que el mensaje no contenga informacion peligrosa, discriminatoria o contraria a las directrices de la empresa, reduciendo el riesgo de incidentes reputacionales.
- Deteccion de rechazo en modelos generativos: en entornos donde se espera que un asistente rechace solicitudes ilegales o daninas, Shieldstral puede auditar si el modelo base esta aplicando correctamente sus politicas de rechazo, sirviendo como herramienta de evaluacion continua.
- Cumplimiento normativo en sectores regulados: en banca, salud o educacion, el modelo puede configurarse con politicas especificas (por ejemplo, prohibicion de consejos financieros no autorizados) y aplicarse a la revision de comunicaciones generadas por IA antes de su publicacion.
- Pipeline de seguridad en agentes autonomos: cuando un agente de IA ejecuta multiples pasos (tool calling, acceso a APIs), Shieldstral puede evaluar cada prompt y cada respuesta intermedia para garantizar que el agente no desvía su comportamiento hacia acciones no permitidas.
- Moderacion de contenido visual en plataformas de e-commerce: el modelo analiza imagenes de productos para detectar contenido inapropiado o prohibido (por ejemplo, articulos ilegales o imagenes ofensivas) antes de que se publiquen en el catalogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia de rendimiento es la afirmacion de Mistral AI de que el modelo supera a clasificadores de seguridad de hasta 7 veces su tamaño, pero no se proporcionan metricas concretas (como F1, AUC o tasas de falsos positivos) en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: 16 GB para inferencia, segun la ficha de AI/TLDR. Esto permite ejecutar el modelo en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 4080 (16 GB).
- GPUs recomendadas: NVIDIA RTX 4090, RTX 4080, A100 (40 GB), L4 o similares con al menos 16 GB de VRAM.
- Compatibilidad con GPUs de consumo: si, siempre que se disponga de 16 GB de VRAM. En GPUs con menos memoria, se podria recurrir a cuantizacion, aunque no se han publicado pesos cuantizados oficiales.
- Opciones de despliegue: el modelo esta optimizado para vLLM, como se indica en los tags de HuggingFace. Tambien es compatible con el ecosistema safetensors, por lo que podria desplegarse con TGI u otros frameworks que soporten este formato.
- Latencia y throughput: no se han publicado datos especificos. Dado su tamano de 3B y su salida de un unico token, se espera una latencia muy baja en inferencia, adecuada para filtrado en tiempo real.

## Comparativa con modelos similares

No se dispone de datos publicados que permitan una comparacion cuantitativa con otros clasificadores de seguridad como Llama Guard 3 o WildGuard. La informacion disponible solo menciona que Shieldstral supera a modelos de hasta 7 veces su tamano, pero sin especificar cuales. Por tanto, la comparativa se limita a caracteristicas generales:

| Modelo | Parametros | Entrada | Salida | Licencia | Contexto |
|---|---|---|---|---|---|
| Shieldstral-1.0-3B | 3B | Texto e imagen | yes/no | Apache-2.0 | No disponible |
| Llama Guard 3 (referencia) | 8B | Texto | Categoria de politica | Llama 3 Community License | No disponible |
| WildGuard (referencia) | 7B | Texto | Clasificacion multiclase | Apache-2.0 | No disponible |

Nota: los datos de Llama Guard 3 y WildGuard son de conocimiento general y no se han verificado en la informacion proporcionada. Se recomienda consultar las fichas oficiales de cada modelo para una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos potenciales: al ser un modelo entrenado sobre datos de Mistral, puede reflejar sesgos presentes en su corpus de entrenamiento, especialmente en la clasificacion de contenido cultural o politicamente sensible.
- Riesgo de falsos positivos y negativos: la moderacion basada en politicas en lenguaje natural puede producir errores si la politica no esta formulada con suficiente precision. Se recomienda validar el modelo con un conjunto de pruebas propio antes de desplegarlo en produccion.
- Dependencia de la calidad de las politicas: el rendimiento del modelo esta fuertemente condicionado por la claridad y exhaustividad de las politicas definidas por el usuario. Politicas ambiguas pueden generar clasificaciones inconsistentes.
- Cobertura de idiomas limitada: aunque soporta 12 idiomas, no cubre todos los idiomas del mundo. Contenido en idiomas no soportados puede no ser moderado correctamente.
- Limitaciones de contexto: no se ha publicado la longitud de contexto del modelo, lo que puede afectar a la moderacion de prompts o respuestas muy largas.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribucion correspondiente.
- Sin garantias de exactitud: como todo clasificador de seguridad, Shieldstral no es infalible y no debe utilizarse como unico mecanismo de moderacion en entornos de alto riesgo sin supervision humana.

## Enlaces

- HuggingFace: https://huggingface.co/mistralai/Shieldstral-1.0-3B
- Documentacion oficial: https://docs.mistral.ai/models/shieldstral-1-0
- Blog de Mistral AI: https://mistral.ai/news/shieldstral/
- Ficha en AI/TLDR: https://ai-tldr.dev/models/shieldstral-1-0-3b/
