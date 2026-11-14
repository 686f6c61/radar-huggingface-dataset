# pylotlight/THX-02

## Resumen

THX-02 es un modelo de decisión ("decision model") desarrollado por pylotlight (publicado también bajo la organización HAL-X-AI). No es un modelo generativo al uso: recibe un estado (un mensaje, un ticket, un documento, un registro JSON, una traza de agente, una imagen o un gráfico) junto con un conjunto de preguntas tipadas en lenguaje natural, y devuelve para cada pregunta una distribución de probabilidad completa sobre las opciones proporcionadas por el usuario. Es decir, el conjunto de etiquetas forma parte de la petición, por lo que no requiere reentrenamiento para nuevas tareas de clasificación o enrutado.

Con 4.539.265.536 parámetros (aproximadamente 4,5 B) más un adaptador de razonamiento ("think adapter") de 60 M, THX-02 es el sucesor de THX-01 (0,3 B), sobre el que mejora de 11,30 a 65,06 en el mismo índice de evaluación (Decision Index 0.3). Está entrenado para hasta 32k tokens de contexto por petición, admite hasta cuatro imágenes por solicitud y soporta tres tipos de pregunta: elección entre hasta 255 opciones, sí/no y escala ordenada.

Su relevancia actual radica en el nicho que ocupa: sustituir llamadas a LLM generativos en tareas de enrutado, clasificación y control de agentes donde se necesita baja latencia (mediana de 50 ms sin razonamiento y 79 ms con razonamiento autoactivado en una RTX PRO 6000), salidas calibradas y ausencia de texto libre inventado. La licencia Apache-2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión con adaptador de razonamiento; detalles internos no publicados) |
| Parametros totales | 4.539.265.536 (4,5 B) + 60 M del adaptador "think" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | entrenado hasta 32k tokens por petición |
| Tipos de cuantizacion | BF16 en GPU; BF16 o FP32 en CPU (no se documentan GGUF ni otras) |
| Idiomas soportados | en, az, zh, kk, uz, ky, ja, es, ru, tr (más de 20 lenguas en post-entrenamiento según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna (no se especifica si es un transformer denso, MoE o híbrido), más allá de describirlo como un "thinking decision model" con un adaptador de razonamiento de 60 M parámetros. El modelo está diseñado para producir exclusivamente distribuciones de probabilidad sobre opciones suministradas en la petición, sin generar texto libre salvo cuando activa el modo de razonamiento ("thinking"), en el que escribe un pensamiento breve antes de decidir. El modo de razonamiento es autoactivado ("self-gated") según la confianza del modelo.

No se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona que el modelo fue entrenado y evaluado en más de 20 idiomas durante el post-entrenamiento. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. Sí se indica que el modelo admite entradas multimodales (texto, imágenes y gráficos, hasta cuatro imágenes por petición) y que las respuestas son calibradas por diseño, sin opciones inventadas.

## Capacidades

- Clasificación zero-shot con conjuntos de etiquetas definidos en la propia petición, sin reentrenamiento.
- Tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (sí/no) y `score` (escala ordenada).
- Salida como distribución de probabilidad calibrada por opción, con valor de confianza asociado.
- Modo de razonamiento ("thinking") autoactivado para preguntas que requieren inferencia; genera un pensamiento breve antes de decidir.
- Entrada multimodal: texto, imágenes y gráficos en la misma petición (hasta 4 imágenes).
- Capacidades multilingües: entrenado y evaluado en más de 20 idiomas (tags de 10 idiomas principales).
- Soporte de procesamiento por lotes mediante el endpoint `/v1/decide/batch` del API de producción.
- Uso como componente de decisión en agentes (selección de acciones a partir de capturas de pantalla o trazas).
- No genera texto libre fuera del modo de razonamiento, lo que reduce el riesgo de alucinación en las respuestas.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el mensaje del cliente y devuelve la probabilidad de cada departamento (facturación, soporte técnico, ventas), además de prioridad y sentimiento en la misma llamada; con umbrales de confianza (por ejemplo, 0,60) los casos dudosos se derivan a revisión humana.
- Control de calidad visual en línea de producción: con un detector de cajas abierto que localiza objetos, THX-02 decide por cada objeto entre categorías como limpio, sucio o roto (el ejemplo de la model card clasifica 16 huevos por fotograma en una RTX 4090).
- Agentes que operan interfaces gráficas: a partir de una captura de pantalla con botones numerados, el modelo elige la siguiente acción para cumplir un objetivo (por ejemplo, reservar el vuelo más barato con restricciones de fecha, hora y pasajeros).
- Moderación y triaje de contenido: clasificación de mensajes en categorías de riesgo con probabilidades calibradas, lo que permite fijar umbrales de escalado a revisión humana.
- Extracción de decisiones sobre documentos o registros JSON: dado un contrato, una factura o un registro estructurado, responder preguntas tipadas (sí/no, elección, escala) sobre su contenido sin generar texto libre.
- Análisis de gráficos y series temporales en imagen: responder preguntas como en qué año fue más negativo el tipo de interés real, a partir de un gráfico de inflación y tipo de política monetaria.
- Enrutado multilingüe en atención al cliente: clasificar mensajes en 16 idiomas en una sola llamada por lote (24 mensajes en 641 ms según la demo) para equipos internacionales.
- Evaluación de trazas de agentes: dado el registro de una ejecución de agente, decidir si el resultado es correcto, si requiere reintento o si debe escalarse, con probabilidad asociada.

## Benchmarks y rendimiento

| Benchmark | THX-02 | THX-01 (0,3 B) |
|---|---|---|
| Decision Index 0.3 (con thinking) | 65,06 | 11,30 |
| Decision Index 0.3 (sin thinking) | 63,83 | no disponible |
| Decision Vision Index (conjuntos públicos) | 72,19 | no disponible |

Datos de latencia y throughput publicados en la model card:

| Métrica | Valor |
|---|---|
| Latencia mediana sin thinking (RTX PRO 6000) | 50 ms por petición |
| Latencia mediana con thinking (RTX PRO 6000) | 79 ms por petición |
| Throughput (RTX 4090) | 129 peticiones por segundo |
| Lote de 24 mensajes en 16 idiomas (RTX 4090) | 641 ms en una llamada `/v1/decide/batch` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,5 B parámetros en BF16, el peso ronda los 9 GB, más el adaptador de 60 M y el coste de activaciones y contexto (hasta 32k tokens); se recomienda al menos 16-24 GB de VRAM para margen en BF16.
- GPU recomendadas: RTX 4090 (validada en las demos, 129 req/s), RTX PRO 6000 (validada, latencias de 50-79 ms), y por capacidad, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en BF16 (por ejemplo, RTX 4090, RTX 4080 Super); en CPU funciona en BF16 o FP32, con latencias no publicadas.
- Opciones de despliegue: paquete `thx02` de PyPI con extra `[local]` (`THX02.load(...)`), servidor propio compatible con `Client(base_url="http://host:8200")`, y API gestionada en `api.hal-x.ai`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 50 ms sin thinking y 79 ms con thinking en RTX PRO 6000; 129 req/s en RTX 4090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| THX-02 | 4,5 B + 60 M think adapter | 32k | Modelo de decisión con salidas calibradas y multimodal | Apache-2.0 | Hugging Face, PyPI, API gestionada |
| THX-01 | 0,3 B | no disponible | Modelo de decisión predecesor | no disponible | Hugging Face (doofz/THX-01) |
| LLM generativos de propósito general (p. ej., clasificación vía prompting) | variable | variable | Generación de texto libre adaptada a clasificación | variable | amplia |

No se dispone en la información proporcionada de comparativas con otros modelos de decisión dedicados de la misma categoría; los datos de THX-01 se limitan a la puntuación en el Decision Index 0.3 (11,30 frente a 65,06).

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de sesgo en la información disponible.
- El riesgo de alucinación se reduce por diseño (no genera opciones fuera del conjunto suministrado ni texto libre salvo en modo thinking), pero las probabilidades calibradas pueden ser incorrectas en dominios alejados de los datos de entrenamiento.
- El contexto está limitado a 32k tokens por petición; no se especifica comportamiento más allá de esa longitud.
- Aunque se mencionan más de 20 idiomas en post-entrenamiento, los tags oficiales cubren 10 idiomas (en, az, zh, kk, uz, ky, ja, es, ru, tr); el rendimiento en idiomas no listados no está documentado.
- El adaptador de razonamiento añade latencia (de 50 a 79 ms de mediana en la GPU de referencia) y su activación es automática, sin control fino documentado más allá del parámetro `think`.
- La licencia Apache-2.0 permite uso comercial, pero no se detallan garantías ni condiciones adicionales del API gestionada (niveles gratuitos limitados por IP).
- El modelo no es un generador de texto general: no debe emplearse para tareas de generación libre, resumen o diálogo abierto.
- No se publican detalles de arquitectura ni de datos de entrenamiento, lo que dificulta auditar su comportamiento en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pylotlight/THX-02
- Modelo predecesor THX-01: https://huggingface.co/doofz/THX-01
- Referencia del API: https://api.hal-x.ai/docs/thx-02
- Paquete PyPI: https://pypi.org/project/thx02/
