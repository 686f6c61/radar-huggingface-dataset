# DICPlay/RusMind-4.7-Momentum

## Resumen

RusMind 4.7 · Momentum (Моментум) es un modelo de lenguaje conversacional desarrollado por DICPlay, presentado como el miembro mas ligero de la familia RusMind de cuarta generacion (version 4.7). Se trata de un finetune de `google/gemma-4-E2B-it`, un modelo base de arquitectura Mixture of Experts (MoE) de Google, sobre el que DICPlay ha aplicado entrenamiento adicional orientado al idioma ruso, la cultura rusa y tareas de instruccion. Con 4.647.450.147 parametros totales y aproximadamente 2.000 millones de parametros activos por token, esta disenado para ejecucion local en dispositivo (on-device), sin conexion a internet.

El modelo resuelve el problema de disponer de un asistente conversacional en ruso de calidad razonable que quepa en hardware de consumo: portatiles, equipos de sobremesa convencionales e incluso telefonos de gama alta. Se distribuye en formato GGUF para su uso con llama.cpp, LM Studio y Ollama, lo que facilita el despliegue offline. Su relevancia actual radica en que compite, segun los datos del autor, con modelos de 8 a 32 mil millones de parametros en el benchmark ruso MERA v2, pese a activar solo 2 mil millones de parametros por token.

La licencia es propietaria (`rusmind-license`), no open source en sentido estricto, y el autor ofrece licencias organizacionales mediante contacto directo. El modelo soporta ruso e ingles como idiomas declarados, y el autor menciona capacidades adicionales de comprension de japones con matices de cortesia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), derivada de google/gemma-4-E2B-it |
| Parametros totales | 4.647.450.147 |
| Parametros activos | Aproximadamente 2.000 millones por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el repositorio ocupa 20,2 GB; se asume presencia de varias cuantizaciones, aunque no se detallan) |
| Idiomas soportados | Ruso (ru), ingles (en); el autor menciona comprension de japones con matices de cortesia |
| Licencia | rusmind-license (propietaria, con licencia organizacional bajo solicitud) |
| Formato de pesos | GGUF (libreria: gguf) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer con capas de mezcla de expertos (MoE) en el que solo una fraccion de los parametros se activa por token. Sobre esa base, DICPlay ha realizado un finetune orientado a instrucciones y conversacion en ruso, con enfasis declarado en cultura y regiones de Rusia, historia rusa, comprension de personajes, humor, antonimos y correccion ortografica y de puntuacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica principal es la eficiencia: con 4,6 mil millones de parametros totales y unos 2 mil millones activos, el modelo esta pensado para inferencia en CPU y en GPU de gama media-baja mediante llama.cpp, manteniendo calidad competitiva en tareas rusas frente a modelos mucho mayores. No se documentan en la informacion proporcionada innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en ruso e ingles.
- Razonamiento: el autor lo describe como el mejor de la linea Momentum en tareas de razonamiento segun MERA v2.
- Seguimiento de instrucciones complejas con multiples requisitos simultaneos.
- Generacion de codigo y razonamiento estable, segun pruebas de un canal independiente (Future Craft Lab).
- Tool calling / function calling: el autor afirma que el modelo "invoca herramientas" con precision.
- Conocimiento cultural y geografico de Rusia, historia rusa (eventos, fechas, personalidades).
- Correccion ortografica y de puntuacion en ruso (0,719 en la tarea correspondiente de MERA v2).
- Comprension de personajes, humor y palabras con significados opuestos (tareas humanocentricas).
- Comprension de japones con matices de cortesia (mencionado por el autor, no declarado como idioma oficial).
- Ejecucion offline y on-device, sin dependencia de red.

## Casos de uso

- Asistente conversacional offline en ruso: el modelo puede gestionar dialogos multi-turno directamente en un portatil o telefono sin conexion, gracias a su tamano reducido y a los pesos GGUF para llama.cpp u Ollama.
- Atencion al cliente en ruso: su capacidad de seguir instrucciones complejas y su conocimiento cultural permiten desplegarlo como agente de primera linea en escenarios con requisitos regulatorios de residencia de datos en Rusia.
- Correccion y edicion de textos en ruso: la puntuacion de 0,719 en correccion ortografica y de puntuacion de MERA v2 lo hace util para herramientas de revision integradas en editores o procesadores de texto.
- Generacion de codigo en entornos con recursos limitados: puede integrarse en asistentes de IDE locales que funcionen en equipos sin GPU dedicada, invocando herramientas mediante function calling.
- Educacion y tutoria sobre historia y cultura de Rusia: el modelo esta entrenado especificamente en eventos, fechas y personalidades rusas, lo que lo hace adecuado para aplicaciones divulgativas o de repaso.
- Procesamiento de documentos en lote en infraestructura modesta: al activar solo unos 2.000 millones de parametros por token, el throughput por CPU es viable para tareas de extraccion, resumen o clasificacion en servidores sin aceleradores.
- Aplicaciones embebidas en telefonos de gama alta: el autor afirma que funciona en telefonos, lo que habilita asistentes locales con privacidad de datos por diseno.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark MERA v2 (Multimodal Evaluation for Russian-language Architectures), gestionado por la Alianza en el sector de la IA (Sber, Yandex, MTS, VK, Gazprom Neft y RFPI). El autor declara un resultado global de 0,136 para Momentum 4.7.

| Modelo | Parametros | MERA v2 (global) |
|---|---|---|
| RusMind 4.7 · Momentum | 4,6 B totales / ~2 B activos | 0,136 |
| RusMind 4.7 · Vspyshka | 7,5 B | 0,191 |
| Qwen3.5-9B (Alibaba) | 9 B | 0,186 |
| Gemma 4 E4B (Google) | 8 B | 0,170 |
| RuadaptQwen3-32B | 32 B | 0,163 |
| Zero-Mistral | 24 B | 0,160 |
| T-lite (T-Bank) | 8 B | 0,130 |

El autor tambien afirma que Momentum es el numero 1 global entre modelos de hasta 5.000 millones de parametros, por delante de LFM2.5 de Liquid AI, Gemma 4 E2B de Google y Qwen3.5-4B de Alibaba, y que supera a T-lite pese a tener cuatro veces menos parametros activos. Estos datos proceden de la model card del autor y no se han verificado de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 4,6 B parametros totales, una cuantizacion Q4_K_M requeriria del orden de 2,5-3 GB, y Q8_0 en torno a 5 GB; el repositorio completo ocupa 20,2 GB, lo que sugiere la presencia de varias cuantizaciones.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores, y en GPUs de datacenter (A100, H100) para despliegues de mayor volumen.
- Cabe en GPU de consumo: si, segun el diseno on-device declarado por el autor, incluyendo telefonos de gama alta.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados por el autor); vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles de forma numerica; el autor afirma que "vuela" en navegador y telefono, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MERA v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind 4.7 · Momentum | 4,6 B totales / ~2 B activos | No disponible | 0,136 | rusmind-license (propietaria) | GGUF en Hugging Face |
| Gemma 4 E2B (Google) | ~2 B activos (MoE) | No disponible | No disponible | Gemma license | Pesos abiertos |
| Qwen3.5-4B (Alibaba) | 4 B | No disponible | No disponible | Apache 2.0 (tipica en Qwen) | Pesos abiertos |
| LFM2.5 (Liquid AI) | No disponible | No disponible | No disponible | No disponible | Pesos abiertos |
| T-lite (T-Bank) | 8 B | No disponible | 0,130 | No disponible | No disponible |

La comparativa se limita a los datos de MERA v2 citados por el autor; no se dispone de cifras de contexto ni de otras evaluaciones independientes para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia propietaria (`rusmind-license`): no es open source; el uso comercial requiere licencia organizacional bajo solicitud al autor (contacto via Telegram o MAX).
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion incorrecta, especialmente en tareas factuales fuera de su dominio de entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible; el entrenamiento centrado en Rusia puede introducir sesgos culturales y geograficos.
- Limitaciones de idioma: los idiomas oficialmente soportados son ruso e ingles; el japones se menciona solo como anecdota del autor y no esta garantizado.
- Longitud de contexto: no disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Datos de benchmarks no verificados de forma independiente: las cifras de MERA v2 proceden de la model card del autor y no se han contrastado con la plataforma en la informacion disponible.
- Uso en produccion: al ser un modelo de 4,6 B con unos 2 B activos, su calidad en tareas complejas de razonamiento o codigo sera inferior a la de modelos mayores; conviene validar en el dominio concreto antes de desplegarlo.
- El repositorio incluye solo pesos GGUF, lo que limita el reentrenamiento o la inspeccion de los pesos originales.

## Enlaces

- Hugging Face: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Demo / plataforma: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Modelo hermano RusMind 4.7 · Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Modelo hermano RusMind 4.7 · Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
