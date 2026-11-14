# MarkrAI/k-reggen-guard-1.7b

## Resumen

K-RegGen Guard 1.7B es un modelo guardián (classifier generativo) desarrollado por MarkrAI, un adaptador LoRA sobre Qwen/Qwen3-1.7B, diseñado para determinar si la respuesta de un LLM contiene resultados que infringen la normativa regulatoria surcoreana. A diferencia de los guardrails de seguridad al uso, centrados en contenido dañino (violencia, odio), este modelo aborda un problema específico: las infracciones regulatorias embebidas en productos aparentemente inocuos, como textos de publicidad médica o código que maneja números de registro de residentes, que los guardrails convencionales detectan con una tasa de recuerdo de solo el 5-8%.

El modelo recibe una tabla de reglas por sector (`guard_rules.json`), la petición del usuario y la respuesta del modelo, y devuelve una sentencia en tres líneas: veredicto (infracción, requiere verificación o lícito), identificador de la regla infringida y el fragmento problemático de la respuesta. La tabla cubre 4 sectores y 33 reglas, con base legal en la Ley Médica, la Ley de Protección de Datos Personales, la Ley de Farmacéuticos y otras normas surcoreanas. Al externalizar el conocimiento legal en la tabla de reglas en lugar de memorizarlo en los pesos, actualizar la regulación solo requiere editar filas de la tabla.

Es la versión ligera del K-RegGen Guard 4B, con un F1 de 0,871 frente a 0,881 del 4B en la misma muestra de lectura de benchmark. Su relevancia radica en que demuestra que un modelo de 1.700 millones de parámetros, desplegable en hardware modesto, puede superar a guardrails genéricos mucho mayores (gpt-oss-safeguard-20b, Qwen3Guard-Gen-4B) en una tarea regulatoria verticalizada cuando se le proporciona la estructura de reglas adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA |
| Parametros totales | 1.700 millones (base Qwen3-1.7B) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 4096 tokens en entrenamiento; 16384 en el ejemplo de despliegue con vLLM |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el adaptador se puede combinar con la base cuantizada) |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16, alpha=32, learning rate 1e-4) montado sobre Qwen3-1.7B, un transformer decoder-only. El entrenamiento se realizó durante 2 épocas con una longitud máxima de 4096 tokens. El modo de pensamiento (`enable_thinking`) debe desactivarse en inferencia, ya que el formato de prompt de entrenamiento no lo contempla.

Los datos de entrenamiento se componen de dos conjuntos: 5.908 pares mínimos sintéticos, generados por un modelo profesor que redacta la misma respuesta en versiones infractora, lícita y con advertencia, y 10.557 respuestas reales obtenidas al pasar peticiones de entrenamiento por 5 modelos abiertos ausentes del benchmark. Las etiquetas las asignó un modelo juez local con la misma tabla de reglas; las discrepancias se resolvieron mediante dos lectores en ciego que solo aceptaron las coincidencias. La similitud textual máxima entre preguntas del benchmark y peticiones de entrenamiento es de 0,15, y no se usaron respuestas de los modelos del benchmark. Los datos de entrenamiento no se publican porque contienen textos publicitarios ilegales y código reales generados por el modelo.

La innovación principal es la separación entre conocimiento regulatorio (tabla de reglas externa) y capacidad de juicio (pesos del modelo), lo que permite actualizar la normativa sin reentrenar. El modelo no solo emite un veredicto binario, sino que identifica la regla concreta y el fragmento exacto de la respuesta que la infringe.

## Capacidades

- Clasificación de respuestas de LLM en tres categorías: infracción, requiere verificación y lícito.
- Identificación de la regla infringida por su identificador (por ejemplo, `MA-TESTIMONIAL`).
- Extracción del fragmento exacto de la respuesta que constituye la infracción.
- Juicio sobre 4 sectores regulatorios: publicidad médica, código de tratamiento de datos personales, venta online de productos restringidos y ejercicio profesional sin licencia.
- Detección de infracciones en código fuente (por ejemplo, manejo de números de registro de residentes).
- Distinción entre infracción incondicional y casos que dependen de condiciones no verificables desde la respuesta (evaluación de nuevas tecnologías médicas, consentimiento de transferencia internacional, contratos de subcontratación).
- Generación de avisos legales con artículo, contenido prohibido, alternativa lícita y fragmento problemático (mediante la utilidad `RegGuard` del repositorio).
- Clasificación automática de sector a partir de la petición del usuario (utilidad `guard/filter.py`).
- No soporta tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Moderación de salidas de LLM en asistentes de marketing sanitario: el modelo recibe la respuesta generada por un LLM de redacción publicitaria y detecta testimonios de pacientes, promesas de resultados o descuentos condicionados que la Ley Médica surcoreana prohíbe, señalando la regla y el fragmento exacto.
- Revisión de código generado por asistentes de programación: detecta si el código maneja números de registro de residentes, datos sensibles o transferencias internacionales sin el consentimiento exigido, gracias a su capacidad de analizar el fragmento de código como parte de la respuesta.
- Pasarela de cumplimiento en plataformas de comercio electrónico: filtra automáticamente descripciones de producto generadas por IA para detectar la venta online de artículos restringidos (productos farmacéuticos, material médico) según la Ley de Farmacéuticos y la Ley de Profesiones Médicas.
- Detección de ejercicio profesional sin licencia: analiza respuestas de asistentes que ofrecen servicios de asesoría legal, fiscal o inmobiliaria para verificar que no se presentan como servicios profesionales regulados sin la habilitación correspondiente.
- Auditoría de respuestas en producción: con un F1 de 0,871 sobre respuestas de 7 LLM distintos no vistos en entrenamiento, puede integrarse como capa de verificación posterior a la generación en pipelines de despliegue, con latencia baja al ejecutarse sobre una base de 1.700 millones de parámetros.
- Generación de avisos legales automáticos: la utilidad `RegGuard` produce el texto de advertencia que se adjunta a la respuesta antes de mostrarla al usuario, incluyendo artículo, prohibición, alternativa lícita y fragmento problemático.
- Investigación sobre guardrails regulatorios: el modelo y su tabla de reglas sirven como referencia reproducible para estudiar la detección de infracciones normativas en salidas de LLM, con métricas publicadas sobre muestras de lectura doble.

## Benchmarks y rendimiento

| Evaluación | Casos | Recuerdo | Precisión | F1 | Falsos positivos en respuestas lícitas |
|---|---:|---:|---:|---:|---:|
| Test de respuestas reales | 1.187 | 0,934 | 0,886 | 0,909 | 14,5% |
| Test sintético | 576 | no disponible | no disponible | 0,986 | no disponible |
| Muestra de lectura de benchmark | 1.000 | 0,824 | 0,923 | 0,871 | 5,0% |

Comparativa en la misma muestra de lectura de benchmark (1.000 respuestas de 7 LLM no vistos en entrenamiento), con infracción y requiere verificación agrupadas como flag:

| Modelo | F1 |
|---|---:|
| K-RegGen Guard 4B | 0,881 |
| K-RegGen Guard 1.7B | 0,871 |
| gpt-oss-safeguard-20b (con la misma tabla de reglas) | 0,764 |
| Qwen3-4B-Instruct (solo con la tabla de reglas) | 0,634 |
| Qwen3Guard-Gen-4B | 0,142 |
| kanana-safeguard-8b | 0,096 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB en FP16 para la base de 1.700 millones de parámetros más el adaptador LoRA; entre 1,5 y 2,5 GB con cuantización de 4 bits.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegue en producción con concurrencia, A100 o H100 ofrecen mayor throughput.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 6 GB o más de VRAM.
- Opciones de despliegue: vLLM con `enable_lora=True` y `max_lora_rank=16` (el ejemplo de la model card usa `max_model_len=16384`), transformers con PEFT, llama.cpp y Ollama tras fusionar el adaptador con la base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. La generación está limitada a 384 tokens y temperatura 0 en el ejemplo de uso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 (muestra de lectura) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K-RegGen Guard 1.7B | 1.700 M + LoRA | 4096 (entrenamiento) | 0,871 | MIT | Hugging Face |
| K-RegGen Guard 4B | 4.000 M + LoRA | no disponible | 0,881 | no disponible | Hugging Face |
| gpt-oss-safeguard-20b | 20.000 M | no disponible | 0,764 (con la misma tabla de reglas) | no disponible | no disponible |
| Qwen3Guard-Gen-4B | 4.000 M | no disponible | 0,142 | no disponible | no disponible |
| kanana-safeguard-8b | 8.000 M | no disponible | 0,096 | no disponible | no disponible |

## Limitaciones y advertencias

- No constituye asesoramiento jurídico: la tabla de reglas y las etiquetas se contrastaron con textos legales y jurisprudencia, pero no pasaron revisión de expertos legales.
- La normativa reflejada es la vigente a septiembre de 2026; las regulaciones no incluidas en la tabla no se evalúan.
- La distinción de "requiere verificación" (casos condicionales) es la más débil: por ejemplo, confunde descuentos en copagos sin condición (infracción incondicional) con descuentos en servicios no cubiertos (condicionales), aunque ambos casos generan aviso y el filtro los descarta.
- Pierde más infracciones en respuestas de modelos no vistos en entrenamiento, especialmente modelos frontera.
- La sentencia de "infracción" sirve para que el usuario reciba un aviso antes de usar el resultado, pero no elimina el fragmento infractor de la respuesta.
- Tasa de falsos positivos del 14,5% en respuestas lícitas del test de respuestas reales, superior al 10,0% del modelo 4B, lo que puede generar avisos innecesarios en producción.
- Solo soporta coreano; no hay capacidades multilingües.
- Los datos de entrenamiento no son públicos, lo que limita la reproducibilidad y la auditoría del sesgo.
- Licencia MIT permite uso comercial, pero la responsabilidad sobre el cumplimiento normativo recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MarkrAI/k-reggen-guard-1.7b
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Versión 4B: https://huggingface.co/MarkrAI/k-reggen-guard-4b
- Repositorio GitHub: https://github.com/Marker-Inc-Korea/K-RegGen
- Dataset de benchmark: https://huggingface.co/datasets/MarkrAI/k-reggen
- Informe del guard: https://github.com/Marker-Inc-Korea/K-RegGen/blob/main/reports/kreggen_guard/%EB%A6%AC%ED%8F%AC%ED%8A%B8.md
- Utilidad de filtrado por sector: https://github.com/Marker-Inc-Korea/K-RegGen/blob/main/guard/filter.py
