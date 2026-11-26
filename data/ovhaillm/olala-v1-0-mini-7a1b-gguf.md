# OVHaiLLM/Olala-v1.0-mini-7A1B-GGUF

## Resumen

Olala-v1.0-mini-7A1B es un modelo de lenguaje de arquitectura híbrida Mamba + MoE (mezcla de expertos) desarrollado por OVHaiLLM, la división de inteligencia artificial de OVHcloud. Con 6.775.272.608 parámetros totales (aproximadamente 6,8 mil millones) y un diseño que combina capas de estado espacial con expertos dispersos, el modelo está orientado a razonamiento, generación de código y tool calling. La versión aquí descrita es la cuantización GGUF del modelo base, publicada para inferencia local en CPU, GPU NVIDIA y Apple Silicon.

El modelo destaca por su soporte de cuatro niveles de esfuerzo de razonamiento (effort levels) y por una ventana de contexto que la model card no cuantifica explícitamente. Su licencia Apache 2.0 y su compatibilidad con un servidor OpenAI permiten integrarlo en flujos de producción sin restricciones comerciales. La relevancia actual radica en que ofrece capacidades de razonamiento y agentes en un tamaño que cabe en un portátil de 16 GB de memoria unificada, con una velocidad reportada de unos 70 tokens/s en un MacBook Air M5 con el archivo de 6 bits.

Un punto crítico es que estos archivos GGUF requieren un fork propio de llama.cpp mantenido por OVHai-LLM: ni el llama.cpp upstream, ni Ollama, ni LM Studio soportan todavía la arquitectura `olala`. Esto condiciona por completo el despliegue y debe tenerse en cuenta antes de adoptar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba + MoE (mezcla de expertos) |
| Parametros totales | 6.775.272.608 (~6,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, q8_0-safe2, Q6_K, Q5_K_M (archivos publicados) |
| Idiomas soportados | 37 idiomas: en, zh, fr, de, it, ja, ru, es, pl, pt, nl, el, tr, cs, uk, hu, ro, ko, ar, fi, sv, no, da, bg, sk, hr, lt, sl, bs, he, et, ca, lv, ka, sr, sq, is |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 32,8 GB con múltiples cuantizaciones) |

## Arquitectura y entrenamiento

La arquitectura es híbrida: combina capas Mamba (modelos de espacio de estados, SSM) con una capa de mezcla de expertos (MoE). Este diseño busca reducir el coste computacional del attention cuadrático en contextos largos manteniendo la capacidad de modelado de un transformer. El número de parámetros activos por token no se detalla en la información disponible, aunque el sufijo "7A1B" del nombre sugiere aproximadamente 7 mil millones de parámetros totales y 1 mil millones activos, dato que no se confirma en la model card.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona soporte de razonamiento con cuatro niveles de esfuerzo y tool calling, lo que implica algún tipo de post-entrenamiento orientado a instrucciones y agentes, pero sin especificar la metodología. Tampoco se detalla si se emplea decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con cuatro niveles de esfuerzo configurables (effort levels).
- Tool calling / function calling, expuesto mediante un servidor compatible con la API de OpenAI.
- Soporte de agentes y razonamiento multi-paso.
- Generación y razonamiento sobre código, con evaluación reportada en benchmarks de código y matemáticas.
- Capacidades multilingües en 37 idiomas, incluidos español, catalán, euskera y gallego no confirmado (el listado incluye ca pero no gl).
- Inferencia local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp.
- No se mencionan capacidades de visión, audio ni modo thinking explícito más allá de los niveles de esfuerzo.

## Casos de uso

- Asistente de código en local: el modelo puede generar y revisar código en un portátil con 16 GB de memoria unificada usando el archivo Q6_K (6,3 GB), lo que permite trabajar sin conexión y sin enviar código propietario a servicios externos.
- Agente de automatización con tool calling: al exponer un servidor compatible con OpenAI, se puede conectar a frameworks de agentes que invoquen funciones externas (APIs, bases de datos, sistemas de ficheros) para tareas multi-paso.
- Atención al cliente multilingüe: con 37 idiomas soportados y licencia Apache 2.0, es adecuado para desplegar un chatbot en regiones europeas sin coste de licencia, siempre que se valide la calidad por idioma.
- Razonamiento con esfuerzo ajustable: en tareas de análisis que requieren más cómputo se puede subir el nivel de esfuerzo, y bajarlo en consultas simples para reducir latencia y coste.
- Procesamiento de documentos en CPU: el archivo q8_0-safe2 (6,9 GB) está pensado para CPU x86, lo que permite desplegar en servidores sin GPU para tareas de resumen y extracción de información.
- Prototipado rápido en Mac: el archivo BF16 (13,6 GB) cabe en Mac con 24 GB o más y sirve para evaluar el modelo a máxima precisión antes de pasar a cuantizaciones menores.
- Educación e investigación: al ser Apache 2.0 y ejecutable en hardware de consumo, es útil para experimentos académicos con presupuesto limitado.

## Benchmarks y rendimiento

La model card indica que los archivos de 8, 6 y 5 bits obtienen puntuaciones dentro del margen de ruido respecto a BF16 en código y matemáticas, pero no se publican las cifras concretas de MMLU, HumanEval, GSM8K ni de ningún otro benchmark en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Comparación BF16 vs cuantizado | Diferencia dentro del ruido en código y matemáticas (sin cifras) |

## Requisitos de hardware

- VRAM/RAM según cuantización: BF16 13,6 GB; q8_0-safe2 6,9 GB; Q6_K 6,3 GB; Q5_K_M (tamaño no especificado en el fragmento disponible, inferior a 6,3 GB).
- GPU recomendadas: GPU NVIDIA para el archivo BF16; Mac con 24 GB o más para BF16; Mac con 16 GB para q8_0-safe2 y Q6_K.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8-16 GB de VRAM para las cuantizaciones de 5-8 bits, y en Apple Silicon de 16 GB.
- Despliegue: exclusivamente mediante el fork de llama.cpp de OVHai-LLM (github.com/OVHai-LLM/llama.cpp). No compatible con llama.cpp upstream, Ollama ni LM Studio.
- Throughput reportado: aproximadamente 70 tokens/s en un MacBook Air M5 con el archivo de 6 bits. No hay datos de latencia ni throughput para GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo que permitan una comparación cuantitativa rigurosa. A nivel de categoría, se puede comparar por tamaño y licencia:

| Modelo | Parametros | Contexto | Licencia | Formato local |
|---|---|---|---|---|
| Olala-v1.0-mini-7A1B | ~6,8 B (MoE híbrido) | no disponible | Apache 2.0 | GGUF con fork propio |
| Alternativas de ~7 B | ~7 B | variable | variable | GGUF estándar |
| Modelos MoE pequeños | variable | variable | variable | variable |

La comparación con alternativas concretas (por ejemplo, modelos de 7-8 B densos o MoE de tamaño similar) no está disponible en la información proporcionada, y no se han publicado cifras que permitan situar a Olala frente a ellos.

## Limitaciones y advertencias

- Dependencia de un fork: los archivos no cargan en llama.cpp upstream, Ollama ni LM Studio; cualquier actualización del ecosistema estándar no aplicará hasta que se soporte la arquitectura `olala`.
- Sin datos de benchmarks publicados: no es posible verificar el rendimiento real frente a alternativas, más allá de la afirmación cualitativa sobre la pérdida por cuantización.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni tasas de alucinación.
- Sesgos: no se publica información sobre sesgos demográficos, lingüísticos o culturales; la cobertura de 37 idiomas no garantiza calidad homogénea.
- Calidad multilingüe desigual: el soporte declarado no implica rendimiento equivalente en todos los idiomas; conviene validar el español y las lenguas cooficiales por separado.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no exime de cumplir la normativa aplicable (por ejemplo, transparencia en sistemas de IA en la UE).
- Madurez: modelo creado en octubre de 2026 y actualizado en noviembre de 2026; el ecosistema de herramientas en torno a él es todavía incipiente.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-GGUF
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Fork de llama.cpp: https://github.com/OVHai-LLM/llama.cpp
- Informe técnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- Catálogo de AI Endpoints de OVHcloud: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/olala-v1-0-mini-7a1b/
- Playground: https://olala.ovh.com
