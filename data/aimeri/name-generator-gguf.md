# aimeri/name-generator-GGUF

## Resumen

Name Generator (GGUF) es la versión cuantizada en formato GGUF de `aimeri/name-generator`, un ajuste fino de Ministral 3 con 3.429.006.336 parámetros (3,4B) especializado en una tarea muy concreta: generar nombres propios completos a partir de una petición en lenguaje natural. El modelo responde con un único nombre y nada más, extraído de datos reales de nomenclatura procedentes de 333 países y estados históricos. Lo publica el usuario aimeri en HuggingFace bajo licencia Apache 2.0.

La relevancia de este modelo no está en su tamaño ni en sus capacidades generales, sino en su especialización extrema: en lugar de un modelo conversacional que hay que guiar con prompts elaborados, ofrece una salida limpia y determinista (un nombre completo, con nombre y apellido o patronímico según la cultura) lista para integrarse en pipelines de generación de personajes, datos sintéticos o pruebas automatizadas. Su formato GGUF y su reducido tamaño lo hacen desplegable en hardware de consumo.

El repositorio incluye cuatro cuantizaciones (Q8_0, Q6_K, Q5_K_M y Q4_K_M) con métricas de divergencia KL frente a la conversión BF16, lo que permite elegir el equilibrio entre fidelidad y huella de memoria. Existe una versión v2 que añade nombres de fantasía (elfos, enanos, orcos, dragones, reinos ficticios) manteniendo los reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Ministral 3) |
| Parametros totales | 3.429.006.336 (3,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens recomendados (suficiente para peticiones de una frase) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los originales en safetensors están en el repo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de Ministral 3, un transformer denso de 3,4B parámetros. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset en la información proporcionada, más allá de que se entrenó con datos reales de nomenclatura de 333 países y estados históricos. El dataset de entrenamiento (`aimeri/name-generator`) está publicado bajo licencia CC BY-SA 4.0.

La innovación técnica principal es la especialización radical de la tarea: el modelo fue entrenado para responder con un único nombre completo y nada más, sin system prompt (se entrenó sin él) y con una plantilla de chat ChatML. El token de fin de secuencia es `<|im_end|>`, y llama.cpp añade el `<s>` inicial con el que fue entrenado. La conversión a GGUF se realizó con llama.cpp (commit `338fce6`). No se documentan técnicas como decodificación especulativa, atención lineal ni RLHF/DPO en la información disponible.

## Capacidades

- Generación de nombres propios completos (nombre y apellido, o nombre y patronímico según la cultura) a partir de una petición en lenguaje natural.
- Cobertura de nombres reales de 333 países y estados históricos (por ejemplo, dinastía Song, Alemania de los años 50, Brasil, Japón, Rusia, México).
- Respuesta en formato de una sola línea: un nombre y nada más, sin explicaciones ni texto adicional.
- Sensibilidad al género y a la época solicitados en el prompt (aunque puede fallar ocasionalmente en el sexo al muestrear).
- Compatibilidad con el ecosistema llama.cpp: servidor `llama-server`, LM Studio, Jan y otras aplicaciones basadas en llama.cpp.
- Compatibilidad con endpoints OpenAI (`/v1/chat/completions`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking (no documentado).
- Capacidad multilingüe limitada al inglés como idioma de interacción (los nombres generados pertenecen a culturas diversas, pero el prompt debe ir en inglés).

## Casos de uso

- Generación de personajes para narrativa y guiones: el modelo devuelve un nombre completo coherente con la nacionalidad y época solicitadas, lo que agiliza la creación de repartos en herramientas de escritura creativa.
- Creación de datos sintéticos para pruebas: en pipelines de QA o desarrollo se pueden generar lotes de nombres realistas por país para poblar bases de datos de prueba, con temperatura 0.8 y `max_tokens` de 24.
- Relleno de formularios y demos: aplicaciones que necesitan nombres de ejemplo para maquetas o prototipos pueden llamar al modelo vía API compatible con OpenAI y obtener una respuesta limpia sin postprocesado.
- Generación de nombres para juegos de rol o simuladores históricos: la cobertura de estados históricos (por ejemplo, dinastía Song) permite obtener nombres contextualizados por época.
- Automatización de pruebas de internacionalización: verificar que una aplicación maneja correctamente nombres de distintas culturas (patronímicos rusos, nombres japoneses en orden apellido-nombre, etc.).
- Asistencia a escritores de fan fiction o novelas históricas: obtener variantes de nombres por región y década (por ejemplo, hombre alemán nacido en los años 50) para mantener la verosimilitud.
- Integración en asistentes de mesa (Dungeon Master aids) para nombrar PNJ de forma rápida, siempre que se acepte que la versión base no genera fantasía (para eso existe la v2).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye métricas de fidelidad de cuantización frente a BF16 (no benchmarks de calidad de tarea):

| Fichero | Cuantización | Tamano | Mismo token top que 16-bit | Divergencia KL media |
|---|---|---|---|---|
| `name-generator-Q8_0.gguf` | Q8_0 | 3,65 GB | 98,8% | 0,0018 |
| `name-generator-Q6_K.gguf` | Q6_K | 2,82 GB | 97,1% | 0,0055 |
| `name-generator-Q5_K_M.gguf` | Q5_K_M | 2,47 GB | 96,2% | 0,0120 |
| `name-generator-Q4_K_M.gguf` | Q4_K_M | 2,15 GB | 94,5% | 0,0226 |

Las métricas se calcularon sobre 130 pares petición-nombre en formato chat (unos 1.700 tokens evaluados) con `llama-perplexity --kl-divergence`. En 11 peticiones de prueba, Q6_K, Q5_K_M y Q4_K_M dieron la misma respuesta greedy que Q8_0 en 9, 7 y 8 casos respectivamente; la mayoría de diferencias fueron apellidos o patronímicos distintos.

## Requisitos de hardware

- VRAM estimada: unos 4 GB para Q8_0 (según la model card), aproximadamente 3,2 GB para Q6_K, 2,9 GB para Q5_K_M y 2,5 GB para Q4_K_M (estimación a partir del tamaño de fichero más overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q8_0; tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. También es viable en CPU.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas GPUs de gama baja con 4-6 GB.
- Opciones de despliegue: `llama-server` (llama.cpp), LM Studio, Jan y cualquier aplicación basada en llama.cpp. El comando de ejemplo es `llama-server -hf aimeri/name-generator-GGUF:Q8_0 --jinja -c 2048`.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño (3,4B) y la salida corta (unos 24 tokens), la latencia esperada es baja, pero no se aportan cifras medidas.
- Ajustes recomendados: temperatura 0,7-1,0 (a 0 devuelve siempre el nombre más típico), `max_tokens` en torno a 24, contexto 2048 y system prompt vacío.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La alternativa más directa es la propia versión v2 del mismo autor (`aimeri/name-generator-v2-GGUF`), que añade nombres de fantasía. Como referencia de categoría, el modelo base Ministral 3 es un modelo generalista de 3,4B, pero no se aportan datos de rendimiento comparativo.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| aimeri/name-generator-GGUF | 3,4B | 2048 | Apache 2.0 | Nombres reales e históricos |
| aimeri/name-generator-v2-GGUF | no disponible | no disponible | Apache 2.0 (presumible) | Nombres reales y de fantasía |
| Ministral 3 (base) | 3,4B | no disponible | no disponible | Generación general |

## Limitaciones y advertencias

- Solo cubre nombres reales e históricos; no genera nombres de fantasía (para eso existe la v2).
- Puede fallar ocasionalmente en el sexo solicitado al muestrear (documentado por el autor).
- El prompt debe enviarse en inglés; el modelo está etiquetado únicamente para `en`.
- Se entrenó sin system prompt: enviar uno puede degradar la calidad de la respuesta.
- A temperatura 0 devuelve siempre el mismo nombre más típico, lo que reduce la variedad.
- Riesgo de alucinación: aunque la salida es un nombre plausible, no hay garantía de que exista realmente ni de que sea estadísticamente frecuente en el país solicitado.
- La cuantización Q4_K_M es la que más se aleja de BF16 (94,5% de coincidencia en el token top, KL 0,0226); para máxima fidelidad usar Q8_0.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento es CC BY-SA 4.0, lo que conviene revisar si se redistribuye el modelo o datos derivados.
- El modelo tiene solo 203 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es escasa.
- Idiomas: aunque genera nombres de múltiples culturas, la interfaz de petición es solo en inglés.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/aimeri/name-generator-GGUF
- Modelo base: https://huggingface.co/aimeri/name-generator
- Versión v2 (con fantasía): https://huggingface.co/aimeri/name-generator-v2-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/aimeri/name-generator
- Repositorio llama.cpp (commit de conversión `338fce6`): https://github.com/ggml-org/llama.cpp
