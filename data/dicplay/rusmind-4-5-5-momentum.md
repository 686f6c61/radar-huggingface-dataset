# DICPlay/RusMind-4.5.5-Momentum

## Resumen

RusMind 4.5.5 Momentum es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DICPlay, especializado en ruso e ingles y optimizado para ejecucion en dispositivo (on-device) sin conexion a internet. Se trata de un fine-tuning de `google/gemma-4-E2B-it`, con 4.647.450.147 parametros totales de los cuales aproximadamente 2.000 millones estan activos durante la inferencia, lo que le permite funcionar en portatiles, PC convencionales y telefonos moviles. Se distribuye principalmente en formato GGUF para llama.cpp, LM Studio y Ollama.

El modelo forma parte de la familia RusMind de cuarta generacion (4.5) y esta orientado al mercado rusoparlante, con enfasis en cultura y regiones de Rusia, comprension de personajes, humor, matices del idioma y seguimiento de instrucciones complejas. Su propuesta de valor es ofrecer un rendimiento competitivo en el benchmark independiente MERA v2 superando a modelos con muchas mas parametros activos, manteniendo un coste computacional reducido.

Es relevante ahora porque la version 4.5.5 introduce mejoras en logica, acertijos y habla coloquial rusa, y porque el autor recomienda migrar a versiones posteriores (4.7 Momentum, Vspyshka 4.7 y Sokol 4.7) que amplian la familia. El modelo esta pensado para despliegues offline, privacidad de datos y escenarios con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en google/gemma-4-E2B-it |
| Parametros totales | 4.647.450.147 |
| Parametros activos | Aproximadamente 2.000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes multiples; niveles concretos no disponibles) |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | rusmind-license (licencia propia, categoria "other") |
| Formato de pesos | GGUF (libreria gguf); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `google/gemma-4-E2B-it`, un transformer con arquitectura Mixture of Experts en el que solo una fraccion de los parametros se activa por token. RusMind 4.5.5 Momentum conserva esa estructura y aplica un fine-tuning sobre ella orientado a ruso e ingles, con enfasis en tareas de cultura y regiones de Rusia, razonamiento, comprension de personajes y generacion de texto conversacional. El autor indica que la version 4.5.5 mejora logica, acertijos, habla coloquial rusa, puntuacion y el formato estricto de respuestas en tareas de evaluacion.

No se dispone de informacion publica sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona capacidades de invocacion de herramientas (tool calling) y seguimiento de instrucciones complejas, pero no detalla el proceso de alineamiento. El modelo se distribuye en GGUF para su uso con llama.cpp, lo que sugiere cuantizacion posterior al entrenamiento para reducir requisitos de memoria.

## Capacidades

- Generacion de texto conversacional en ruso e ingles.
- Razonamiento y resolucion de problemas de logica y acertijos.
- Comprension de cultura y regiones de Rusia, personajes, humor y palabras con significados opuestos.
- Correccion de ortografia y puntuacion en ruso (puntuacion reportada de 0,719 en la tarea correspondiente de MERA v2).
- Seguimiento de instrucciones complejas y formato estricto de respuestas en tareas de evaluacion.
- Invocacion de herramientas (tool calling / function calling).
- Ejecucion on-device y offline, sin conexion a internet.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistentes conversacionales offline en ruso: el modelo puede gestionar dialogos multi-turno en un portatil o telefono sin conexion, preservando la privacidad de los datos del usuario y aprovechando su entrenamiento especifico en habla coloquial rusa.
- Correccion y edicion de textos en ruso: dada su puntuacion de 0,719 en la tarea de ortografia y puntuacion de MERA v2, es adecuado para revisar y normalizar documentos, correos y publicaciones antes de su publicacion.
- Educacion y tutoria en ruso: puede resolver acertijos, explicar conceptos y mantener un formato de respuesta estructurado, util para plataformas de aprendizaje con requisitos de formato estricto.
- Atencion al cliente en entornos con conectividad limitada: su naturaleza on-device permite desplegarlo en terminales de punto de venta o quioscos sin depender de la nube, gestionando consultas frecuentes en ruso e ingles.
- Procesamiento de documentos con requisitos de privacidad: al ejecutarse localmente, puede resumir, clasificar o extraer informacion de textos sensibles sin enviarlos a servidores externos.
- Integracion en pipelines con tool calling: puede invocar funciones para consultar bases de datos locales, generar informes o automatizar tareas de escritorio en entornos de escritorio y moviles.
- Prototipado rapido en llama.cpp, LM Studio u Ollama: su formato GGUF y su reducido numero de parametros activos facilitan pruebas en hardware de consumo antes de escalar a modelos mayores de la familia RusMind.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark independiente MERA v2 (Multimodal Evaluation for Russian-language Architectures), gestionado por la Alianza en el sector de la IA en Rusia. La model card incluye comparativas parciales para la version 4.5.5 y para modelos posteriores de la familia; a continuacion se recogen unicamente los datos explicitamente atribuidos a Momentum 4.5.5 o a la comparativa en la que se menciona.

| Benchmark / tarea | RusMind Momentum 4.5.5 | T-lite (T-Bank, 8B) | Zero-Mistral (24B) | A-Vibe (Avito, 8B) |
|---|---|---|---|---|
| MERA v2 - Razonamiento | 0,2 (valor truncado en la fuente) | no disponible en el fragmento | no disponible en el fragmento | no disponible en el fragmento |

La model card indica ademas que Momentum 4.5.5 es numero 1 en cultura y regiones de Rusia entre modelos de hasta 5.000 millones de parametros, numero 1 en tareas centradas en el ser humano en esa misma franja, y que supera en puntuacion global a A-Vibe (8B), Zero-Mistral-Small (24B), Gemma 4 E2B y Qwen3.5-4B. No se han publicado en la informacion disponible los valores numericos completos de estas comparativas para la version 4.5.5, por lo que no se reproducen cifras no verificadas.

## Requisitos de hardware

- VRAM estimada: al tratarse de un MoE con aproximadamente 2.000 millones de parametros activos y 4.647 millones totales, en cuantizaciones GGUF de 4 bits el peso ronda los 2,5-3 GB; en 8 bits, en torno a 5 GB. Los valores exactos dependen del nivel de cuantizacion elegido.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) son suficientes; tambien puede ejecutarse en GPUs integradas y en CPU.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 6 GB o mas de VRAM, y en CPU con suficiente RAM.
- Despliegue: llama.cpp, LM Studio y Ollama son las opciones mencionadas en la model card; el tag `endpoints_compatible` sugiere compatibilidad con APIs de endpoints.
- Latencia y throughput: no disponibles. El autor afirma que el modelo "vuela" en navegador y telefono gracias a sus 2.000 millones de parametros activos, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MERA v2 (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind 4.5.5 Momentum | 4,6B totales / ~2B activos | no disponible | no disponible (parcial) | rusmind-license | GGUF en Hugging Face |
| Gemma 4 E2B (Google) | no disponible | no disponible | inferior segun la model card | licencia de Google | Hugging Face |
| Qwen3.5-4B (Alibaba) | 4B | no disponible | inferior segun la model card | licencia de Alibaba | Hugging Face |
| T-lite (T-Bank) | 8B | no disponible | 0,130 (segun tabla de Vspyshka 4.7) | no disponible | no disponible |

La comparativa se limita a los datos mencionados en la model card. No se dispone de los valores numericos completos de MERA v2 para Momentum 4.5.5 ni de las fichas tecnicas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: al estar especializado en ruso y en cultura y regiones de Rusia, puede presentar sesgos culturales y geograficos derivados de sus datos de entrenamiento; no se documentan evaluaciones de sesgo.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de veracidad; como todo modelo generativo, puede producir informacion incorrecta con apariencia de veracidad.
- Contexto e idioma: la longitud de contexto no esta documentada y el soporte linguistico se limita a ruso e ingles; el rendimiento en otros idiomas no esta garantizado.
- Licencia: la `rusmind-license` es una licencia propia de categoria "other"; es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial. El autor ofrece contacto para licencias de organizacion.
- Produccion: el autor recomienda migrar a versiones posteriores de la familia (4.7 Momentum, Vspyshka 4.7, Sokol 4.7), por lo que 4.5.5 puede considerarse una version con soporte decreciente.
- Formato: la distribucion principal es GGUF, lo que limita su uso directo con frameworks que requieren safetensors; no se indica si se publican pesos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.5-Momentum
- Demo y sitio oficial: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Version posterior recomendada (4.7 Momentum): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- Version Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Version Vspyshka 4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
