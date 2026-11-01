# aimeri/name-generator-v2-GGUF

## Resumen

Name Generator v2 (GGUF) es la versión cuantizada en formato GGUF de `aimeri/name-generator-v2`, un ajuste fino de Ministral 3 de 3.429.006.336 parámetros (aproximadamente 3,4B) especializado en una única tarea: generar nombres. A diferencia de un modelo de propósito general, está entrenado para responder con un solo nombre y nada más, ya sea un nombre real para una petición del mundo real ("un nombre de hombre brasileño") o uno inventado para una petición de fantasía ("un nombre sombrío para un herrero enano"). El repositorio lo publica el usuario aimeri bajo licencia Apache 2.0.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso muy acotado donde un modelo pequeño supera en consistencia de formato a modelos mucho mayores, porque el ajuste fino elimina la verbosidad. Por otro, el autor publica métricas de cuantización poco habituales (coincidencia del token más probable y divergencia KL frente al modelo en BF16), lo que permite elegir el archivo GGUF con criterio técnico y no solo por tamaño.

El modelo solo declara soporte de inglés en sus metadatos, aunque por la naturaleza de la tarea (nombres propios de múltiples tradiciones culturales) genera cadenas de caracteres de otros idiomas. El contexto útil es muy corto: las peticiones son de una o dos frases y el autor recomienda 2048 tokens de ventana, con un máximo de unos 24 tokens de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (ajuste fino de Ministral 3) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 2048 tokens recomendados por el autor; contexto nativo de Ministral 3 no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (declarado); genera nombres de otras tradiciones culturales |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el repositorio base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de Ministral 3, un transformer decoder-only de aproximadamente 3,4B parámetros. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; la model card remite al repositorio principal para más información sobre entrenamiento. El dataset de entrenamiento es `aimeri/name-generator`, publicado bajo CC BY-SA 4.0, y está orientado a pares de petición y nombre, con mezcla de nombres reales (por país, nacionalidad, estado histórico o región, con sexo y época opcionales) y nombres de fantasía (por especie o arquetipo: elfo, enano, orco, dragón, demonio).

La innovación técnica destacable no está en la arquitectura sino en la evaluación de las cuantizaciones. El autor compara cada archivo GGUF con la conversión a BF16 usando `llama-perplexity --kl-divergence` de llama.cpp sobre 120 pares de validación (mitad reales, mitad de fantasía), contando únicamente los 346 tokens que genera el propio modelo (los nombres y sus tokens de fin de turno). Reporta dos métricas: el porcentaje de veces que el token más probable coincide con el del modelo de 16 bits y la divergencia KL media de la distribución del siguiente token. Además, sobre 24 peticiones de prueba compara la respuesta greedy de cada cuantización con la de Q8_0.

## Capacidades

- Generación de nombres reales a partir de país, nacionalidad, estado histórico o región, con sexo y época opcionales.
- Generación de nombres inventados de fantasía a partir de la especie o arquetipo del personaje (elfo, enano, orco, dragón, demonio, mediano, etc.).
- Modulación del registro fonético mediante indicaciones de tono: grim, gentle, whimsical, noble, ancient, sinister, mysterious.
- Nombres híbridos o inspirados en tradiciones concretas cuando se indica la fuente ("Persian-inspired name for a sorcerer").
- Salida estrictamente de un nombre por petición, sin explicaciones ni texto adicional, lo que simplifica el parseo en producción.
- Plantilla de chat ChatML con `<|im_end|>` como token de fin de secuencia; llama.cpp añade el `<s>` con el que se entrenó el modelo.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Generación de personajes en videojuegos y juegos de rol: el modelo produce nombres de PNJ por especie y tono en una sola llamada de unos 24 tokens, lo que permite generar lotes de cientos de nombres con temperatura 0,7-1,0 y filtrar duplicados por muestreo.
- Herramientas de escritura creativa: un plugin de novela o campaña de rol puede pedir "un nombre sombrío para un herrero enano" y obtener una respuesta lista para insertar, sin necesidad de postprocesar texto explicativo.
- Poblamiento de datos sintéticos para pruebas: al devolver un único token de nombre, es trivial generar tablas de nombres realistas por nacionalidad para fixtures de test, bases de datos de demostración o anonimización de datos.
- Asistencia a localización y doblaje: para guiones que requieren nombres coherentes con una región o época ("caballero en la Inglaterra del siglo XII"), el modelo ofrece variantes históricamente plausibles que el equipo de traducción puede revisar.
- Aplicaciones de escritorio y móviles con llama.cpp, LM Studio o Jan: al ocupar Q4_K_M unos 2,15 GB y Q8_0 unos 3,65 GB, cabe en equipos de consumo y funciona sin conexión, lo que encaja en herramientas de escritura offline.
- Generación de nombres para campañas de marketing o productos de ficción: la indicación de tono (noble, siniestro, antiguo) permite explorar registros fonéticos de forma controlada antes de pasar a una revisión humana de disponibilidad de marca.
- Servicio HTTP ligero: con `llama-server -hf aimeri/name-generator-v2-GGUF:Q8_0 --jinja -c 2048` se expone un endpoint compatible con la API de chat completions de OpenAI, integrable en un backend existente sin cambios de cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor sí publica métricas de fidelidad de cuantización frente a BF16, que se recogen a continuación.

| Archivo | Cuantización | Tamano | Mismo token superior que 16 bits | Divergencia KL media |
|---|---|---|---|---|
| `name-generator-v2-Q8_0.gguf` | Q8_0 | 3,65 GB | 97,7 % | 0,0006 |
| `name-generator-v2-Q6_K.gguf` | Q6_K | 2,82 GB | 93,4 % | 0,0037 |
| `name-generator-v2-Q5_K_M.gguf` | Q5_K_M | 2,47 GB | 93,6 % | 0,0053 |
| `name-generator-v2-Q4_K_M.gguf` | Q4_K_M | 2,15 GB | 87,6 % | 0,0146 |

Sobre 24 peticiones de prueba, Q6_K, Q5_K_M y Q4_K_M dieron la misma respuesta greedy que Q8_0 en 13, 15 y 10 casos respectivamente. La mayoría de las diferencias fueron otro nombre del mismo estilo (Kragga en lugar de Krokhoth), pero Q5_K_M y Q4_K_M respondieron "Sofia" (un nombre real) a la petición "a noble name for a human queen in my fantasy kingdom".

## Requisitos de hardware

- VRAM estimada: unos 4 GB para Q8_0 (3,65 GB de pesos más overhead de contexto y KV cache); aproximadamente 3,2 GB para Q6_K, 2,8 GB para Q5_K_M y 2,5 GB para Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para Q8_0 (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100, H100). Para Q4_K_M basta con 3 GB, por lo que también funciona en iGPU con memoria unificada suficiente.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones publicadas, incluidas tarjetas de gama media y baja con 4 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), LM Studio, Jan y cualquier aplicación basada en llama.cpp. El endpoint HTTP es compatible con la API de chat completions de OpenAI.
- Latencia y throughput: no se han publicado cifras en la informacion disponible. Por el tamaño (3,4B) y la salida de ~24 tokens, la latencia esperada es de decenas de milisegundos por petición en GPU moderna, pero es una estimación, no un dato medido.
- Configuración recomendada: `--jinja -c 2048`, temperatura 0,7-1,0 (a 0 devuelve siempre el nombre más típico), `max_tokens` en torno a 24, un solo mensaje de usuario y prompt de sistema vacío.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, se compara con el modelo base y con la alternativa genérica de usar un modelo de propósito general:

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| name-generator-v2 (GGUF) | 3,43B | 2048 recomendados | GGUF | Apache 2.0 | Especializado en nombres, salida de un solo nombre |
| aimeri/name-generator-v2 (safetensors) | 3,43B | no disponible | safetensors | Apache 2.0 | Modelo original del que derivan las cuantizaciones |
| Ministral 3 (base) | ~3,4B (según ajuste) | no disponible | safetensors | no disponible en la informacion proporcionada | Modelo generalista; requiere prompting e instrucciones de formato |
| Modelo generalista de 7B-8B | 7-8B | 8k-32k típicos | safetensors, GGUF | variable | Genera nombres, pero con verbosidad y formato inconsistente |

## Limitaciones y advertencias

- El modelo solo declara inglés en sus metadatos; las peticiones en castellano no están garantizadas y pueden degradar la calidad o el formato de salida.
- Está entrenado sin prompt de sistema: enviar uno puede alterar el comportamiento esperado. La recomendación del autor es dejarlo vacío y enviar un único mensaje de usuario por nombre.
- A temperatura 0 devuelve siempre el nombre más típico, lo que produce repeticiones en generación por lotes; es necesario muestrear con temperatura 0,7-1,0.
- Riesgo de alucinación en el sentido de nombres inexistentes o anacrónicos cuando se piden nombres reales de una región o época concreta; no hay verificación factual ni base de datos de nombres.
- Las cuantizaciones bajas degradan la coherencia de estilo: Q4_K_M fue la que más se desvió y tanto Q5_K_M como Q4_K_M produjeron un nombre real ("Sofia") en una petición que exigía fantasía.
- El contexto útil es muy corto (2048 tokens); no está pensado para conversaciones multi-turno ni para razonamiento de varios pasos.
- Licencia Apache 2.0, que permite uso comercial, pero el dataset de entrenamiento es CC BY-SA 4.0; conviene revisar las obligaciones de atribución y compartir igual si se redistribuye el dataset o derivados del mismo.
- No se declaran capacidades de tool calling, agentes, visión ni audio; no debe emplearse como sustituto de un modelo generalista.
- El repositorio tiene un volumen de descargas bajo (186) y ningún "like" en el momento de la consulta, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/aimeri/name-generator-v2-GGUF
- Modelo base (safetensors): https://huggingface.co/aimeri/name-generator-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/aimeri/name-generator
