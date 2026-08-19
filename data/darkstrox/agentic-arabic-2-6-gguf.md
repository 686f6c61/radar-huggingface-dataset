# DarkStrox/Agentic-Arabic-2.6-GGUF

## Resumen

Agentic Arabic 2.6 es un modelo de lenguaje de 2.600 millones de parámetros, desarrollado por DarkStrox mediante un ajuste fino (fine-tuning) sobre la arquitectura LFM 2.5 de Liquid AI, utilizando la librería Unsloth. Está especializado en la invocación de funciones (function calling), uso de herramientas y seguimiento de instrucciones generales en árabe, con un enfoque en entornos de producción ligeros y despliegue en dispositivos de borde (edge). Su relevancia radica en ofrecer capacidades de agente en árabe con un tamaño reducido, lo que permite ejecutarlo en hardware de consumo con un consumo de memoria muy bajo.

El modelo se distribuye en formato GGUF con cuantizaciones Q4_K_M y Q6_K, y alcanza una precisión del 95 % en tareas de function calling en árabe (con Q6_K) según las evaluaciones del autor, superando ampliamente a la base sin ajustar y a modelos mucho más grandes como Gemma 4 E4B IT. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. Está pensado para desarrolladores que necesitan un asistente árabe capaz de interactuar con APIs y herramientas de forma estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid LFM 2.5 (basada en transformer, desarrollada por Liquid AI) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada oficialmente; el ejemplo de uso emplea 4096 tokens |
| Tipos de cuantizacion | Q4_K_M, Q6_K (formato GGUF) |
| Idiomas soportados | Arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LFM 2.5 de Liquid AI, un modelo denso de 2.600 millones de parámetros diseñado para despliegue en dispositivos con recursos limitados. Sobre esta base, DarkStrox aplicó un ajuste fino con Unsloth, una libreria de entrenamiento eficiente que reduce el uso de memoria y acelera el proceso. El conjunto de datos de entrenamiento no se detalla en la documentacion publica, pero el objetivo declarado es mejorar la precision en invocacion de funciones en arabe, el uso de herramientas y el seguimiento de instrucciones generales. No se mencionan tecnicas como RLHF o DPO; el ajuste parece ser supervisado sobre ejemplos de function calling y conversaciones en arabe.

La innovacion principal no reside en la arquitectura base (que es de Liquid AI), sino en el ajuste especifico para el idioma arabe y para el formato de llamadas a herramientas, que permite al modelo emitir JSON estructurado o XML con las firmas de funciones. El modelo conserva el tokenizador y el formato de chat de la base, con marcadores `<|im_start|>` y `<|im_end|>`.

## Capacidades

- Invocacion de funciones (function calling) en arabe: dado un conjunto de firmas de herramientas en formato JSON o XML, el modelo genera la llamada correcta con los argumentos adecuados.
- Uso de herramientas (tool use) en conversaciones multi-turno, integrable en agentes que necesitan consultar APIs externas.
- Seguimiento de instrucciones generales en arabe: responde a preguntas de matematicas, geografia, explicaciones de conceptos, poesia y razonamiento basico.
- Generacion de texto en arabe con formato de chat estandar (ChatML).
- Compatible con pipelines de text-generation y con librerias como llama-cpp-python y llama-server.
- Capacidades multilingues limitadas: el modelo esta entrenado principalmente para arabe; no se garantiza rendimiento en otros idiomas.

## Casos de uso

- Atencion al cliente automatizada en arabe: el modelo puede gestionar conversaciones con clientes, identificar la intencion y llamar a APIs de CRM o ticketing para resolver incidencias, gracias a su function calling de alta precision.
- Asistentes virtuales para consultas meteorologicas: integrado en un bot de Telegram o WhatsApp, recibe preguntas como "cual es el tiempo en Amman" y ejecuta la funcion `get_weather` con la ciudad extraida.
- Automatizacion de reservas y citas: en una aplicacion de comercio electronico o servicios, el modelo interpreta la peticion del usuario y llama a funciones de creacion de reservas o consulta de disponibilidad.
- Generacion de informes y resumenes en arabe: para empresas que necesitan redactar actas, resumenes de reuniones o documentos breves, el modelo produce texto coherente en arabe moderno.
- Educacion y tutoria: como asistente de estudio para estudiantes de habla arabe, resolviendo problemas de matematicas o explicando conceptos cientificos con razonamiento paso a paso.
- Integracion en pipelines de CI/CD para testing de APIs: el modelo puede generar llamadas de prueba a endpoints REST a partir de descripciones en lenguaje natural, facilitando la automatizacion de pruebas.
- Despliegue en dispositivos edge (Raspberry Pi, moviles): gracias a su tamano reducido y bajo consumo de VRAM, puede ejecutarse localmente para asistentes de voz o aplicaciones offline en arabe.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor, evaluados sobre prompts no vistos de invocacion de herramientas en arabe y tareas generales de QA. No se han publicado resultados en benchmarks estandar como MMLU o HumanEval.

| Modelo | Arquitectura / Tamano | Cuantizacion | Precision function calling | Precision QA general | Latencia media | VRAM |
|---|---|---|---|---|---|---|
| Agentic Arabic 2.6 (Q6_K) | Liquid LFM (2.6B) | Q6_K | 95.0 % | 100 % (5/5) | 9.570 ms | 2.08 GB |
| Agentic Arabic 2.6 (Q4_K_M) | Liquid LFM (2.6B) | Q4_K_M | 85.0 % | 100 % (5/5) | 1.493 ms | 1.67 GB |
| LFM 2.6 Base | Liquid LFM (2.6B) | Q5_K_M | 24.0 % | 100 % (5/5) | 6.593 ms | 1.94 GB |
| Gemma 4 E4B IT | Transformer (7.4B) | Q4_K_XL | 10.0 % | 100 % (5/5) | 13.662 ms | 4.21 GB |

Nota: la precision QA general se evaluo sobre 5 tareas; la muestra es muy pequena y no es estadisticamente significativa. El autor recomienda Q6_K para precision estricta en JSON y Q4_K_M para velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia: 1.67 GB con cuantizacion Q4_K_M, 2.08 GB con Q6_K.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3050, RTX 4060, o incluso integradas con soporte Vulkan via llama.cpp.
- Puede ejecutarse en CPU con llama.cpp, aunque la latencia sera mayor (en el benchmark del autor, Q4_K_M tarda ~1.5 s en GPU; en CPU puede ser 5-10 veces mas lento).
- Opciones de despliegue: llama-cpp-python, llama-server, Ollama (si se convierte a formato compatible), vLLM (con soporte GGUF experimental), o TGI (requiere conversion a safetensors).
- Latencia y throughput: el autor reporta 1.493 ms de media para Q4_K_M en una GPU no especificada; para Q6_K, 9.570 ms. No se proporcionan datos de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Function calling (arabe) | VRAM (cuantizado) |
|---|---|---|---|---|---|
| Agentic Arabic 2.6 | 2.6B | No especificado (4096 en ejemplo) | Apache 2.0 | 95 % (Q6_K) | 1.67-2.08 GB |
| LFM 2.6 Base (Liquid AI) | 2.6B | No especificado | Apache 2.0 | 24 % | 1.94 GB (Q5_K_M) |
| Gemma 4 E4B IT | 7.4B | No especificado | Gemma license | 10 % | 4.21 GB (Q4_K_XL) |

La comparativa se basa en los datos del autor. No se dispone de comparaciones con otros modelos arabes especializados en function calling, como Jais o AceGPT, en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos en arabe, puede reflejar sesgos culturales o regionales propios de los textos de entrenamiento; no se han realizado auditorias de sesgo.
- Riesgo de alucinacion: como todo modelo pequeno, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento complejo o cuando no se le proporcionan herramientas.
- Limitaciones de contexto: la longitud de contexto no esta documentada oficialmente; el ejemplo usa 4096 tokens, lo que limita conversaciones muy largas o documentos extensos.
- Idioma: solo esta optimizado para arabe; el rendimiento en otros idiomas es impredecible y probablemente deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base LFM 2.5 tambien esta bajo Apache 2.0, por lo que no hay conflictos conocidos.
- Caveat para produccion: los benchmarks publicados son del autor y no han sido verificados de forma independiente; la muestra de QA es de solo 5 preguntas. Se recomienda validar el modelo con casos reales antes de desplegarlo.
- Formato de pesos: solo se distribuye en GGUF; para usar en librerias que requieren safetensors (como Transformers), habria que convertir el modelo base y reaplicar el ajuste, lo que no esta documentado.

## Enlaces

- Modelo en HuggingFace: [DarkStrox/Agentic-Arabic-2.6-GGUF](https://huggingface.co/DarkStrox/Agentic-Arabic-2.6-GGUF)
- Demo interactiva: [DarkStrox/Agentic-Arabic-2.6-Demo](https://huggingface.co/spaces/DarkStrox/Agentic-Arabic-2.6-Demo)
- Modelo base: [LiquidAI/LFM2.5-2.6B](https://huggingface.co/LiquidAI/LFM2.5-2.6B)
- Blog de Liquid AI sobre LFM2.5: [Introducing LFM2.5](https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai)
- Perfil de GitHub del autor: [DarkStrox](https://github.com/DarkStrox/DarkStrox)
