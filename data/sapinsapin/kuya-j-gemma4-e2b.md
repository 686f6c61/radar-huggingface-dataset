# sapinsapin/kuya-j-gemma4-e2b

## Resumen

Kuya J v3 (Gemma 4 E2B) es un ajuste fino mediante LoRA del modelo google/gemma-4-E2B-it, desarrollado por el usuario sapinsapin para el proyecto civic-tech BetterGov.ph. El modelo alimenta la aplicación Kuya J, un asistente offline para Android que responde preguntas sobre servicios del Gobierno de Filipinas (tasas, requisitos, líneas de atención, festivos y cargos públicos) en tagalo, cebuano, waray y otras lenguas filipinas, sin necesidad de conexión a internet.

El modelo está especializado en una única tarea: emitir una llamada a la herramienta `search_kb` con palabras clave en inglés, y después redactar la respuesta en el idioma del usuario utilizando exclusivamente los registros devueltos por la herramienta, citando la fuente al final. No se espera que el modelo memorice hechos; la aplicación le proporciona los datos en tiempo de inferencia y valida importes, fechas y nombres antes de mostrar la respuesta.

La relevancia del modelo reside en su enfoque de despliegue en dispositivo: se distribuye como bundle LiteRT-LM con pesos int4 (3,0 GB) para Android y como GGUF Q4_K_M (3,4 GB) para llama.cpp, con latencias medidas en un teléfono Qualcomm de 1,9 a 3,0 s hasta la primera palabra y de 3,9 a 7,5 s para la respuesta completa. El adaptador LoRA entrenado es de rango 16 y afecta únicamente al modelo de lenguaje; las torres de visión y audio del modelo base permanecen sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Gemma 4 E2B, multimodal texto e imagen); ajuste fino LoRA de rango 16 sobre el modelo de lenguaje |
| Parametros totales | 4.628.569.635 (pesos del repositorio; el modelo base declara aproximadamente 2B de parametros efectivos) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (configuracion de referencia en LiteRT-LM y llama.cpp) |
| Tipos de cuantizacion | int4 (bundle LiteRT-LM), Q4_K_M (GGUF), adaptador LoRA en safetensors |
| Idiomas soportados | en, tl, ceb, ilo, hil, war, pam, bcl |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT), GGUF, litertlm |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer multimodal con entrada de texto e imagen y aproximadamente 2B de parámetros efectivos. El ajuste fino se realizó con PEFT/LoRA de rango 16 aplicado exclusivamente al modelo de lenguaje, dejando intactos los componentes de visión y audio. El repositorio contiene 4.628.569.635 parámetros en safetensors, correspondientes al modelo fusionado o al conjunto de pesos distribuidos.

El conjunto de entrenamiento consta de 1.187 ejemplos sintéticos en ocho lenguas filipinas y en inglés, generados por un modelo profesor a partir de registros oficiales y posteriormente filtrados. El entrenamiento está orientado a una política de comportamiento estricta: llamar a `search_kb` antes de responder preguntas sobre servicios públicos, responder solo con los resultados devueltos, copiar literalmente nombres, fechas, tasas y enlaces, responder en el idioma de la pregunta y terminar con la línea de fuente. El registro completo de entrenamiento se incluye en el repositorio como `train.log`.

Una innovación destacable es la plantilla de chat `gemma4_tool_template.jinja`, que corrige el tratamiento de los resultados de herramientas en LiteRT-LM y es necesaria para el tool calling en ese runtime. El modelo también acepta el formato antiguo de contexto, con los registros pegados en el turno del usuario bajo `CONTEXT:` y la pregunta tras `QUESTION:`.

## Capacidades

- Generación de texto conversacional en inglés y en siete lenguas filipinas (tagalo, cebuano, ilocano, hiligaynon, waray, kapampangan, bikol).
- Tool calling / function calling con una única herramienta, `search_kb`, que recibe palabras clave en inglés.
- Respuesta fundamentada (grounded): el modelo redacta únicamente a partir de los registros devueltos por la herramienta y cita la fuente con fecha de verificación.
- Formulación de consultas de búsqueda en inglés a partir de preguntas en lenguas filipinas.
- Respuesta en el mismo idioma de la pregunta, incluidas lenguas regionales de Filipinas.
- Cumplimiento de una política de estilo: respuesta en tres frases o menos, comenzando por el hecho y terminando con la línea de fuente.
- Abstención controlada: si los resultados no responden a la pregunta, declara en una frase que no dispone de registro.
- Restricciones de contenido: no emite opiniones políticas ni consejo legal o médico.
- Entrada de imagen heredada del modelo base (Gemma 4 E2B), aunque el ajuste LoRA no modifica la torre de visión.

## Casos de uso

- Asistente offline de servicios públicos en Android: la aplicación Kuya J descarga el bundle LiteRT-LM por Wi-Fi, verifica su SHA-256 y ejecuta el modelo en el dispositivo con backend GPU, respondiendo sobre tasas, requisitos y líneas de atención sin conexión.
- Consulta de tasas y requisitos administrativos: un ciudadano pregunta en cebuano cuánto cuesta una clearance del NBI; el modelo genera la consulta en inglés, recibe el registro y responde con el importe exacto y el enlace de la fuente.
- Atención multilingüe en lenguas regionales: el modelo responde en waray, ilocano, hiligaynon, kapampangan, bikol o pangasinan, lo que permite atender a usuarios que no dominan el tagalo ni el inglés.
- Verificación de datos oficiales con trazabilidad: cada respuesta termina con la línea `Source: <url> (checked YYYY-MM-DD)`, lo que facilita auditorías y permite a la aplicación validar importes, fechas y nombres antes de mostrarlos.
- Despliegue en dispositivos de gama media sin conectividad: con el GGUF Q4_K_M (3,4 GB) puede ejecutarse en llama.cpp, Ollama o LM Studio para pruebas y evaluaciones en escritorio, y con el bundle int4 en teléfonos Android.
- Integración en aplicaciones Kotlin mediante LiteRT-LM: el ejemplo de integración con `Engine`, `ConversationConfig`, `automaticToolCalling` y `SamplerConfig` (topK 40, topP 0,95, temperatura 0,2, seed 0) sirve como base para asistentes de dominio acotado con búsqueda local.
- Evaluación de la fidelidad al tool calling: el modelo permite medir la tasa de llamadas correctas a la herramienta (122 de 126 preguntas de prueba frente a 40 del Gemma 4 E2B original) en pipelines de evaluación de agentes de un solo paso.

## Benchmarks y rendimiento

| Metrica | Kuya J v3 (Gemma 4 E2B) | Gemma 4 E2B original |
|---|---|---|
| Llamadas correctas a `search_kb` (126 preguntas) | 122 | 40 |
| Primer token en telefono Qualcomm con GPU | 1,9-3,0 s | no disponible |
| Respuesta completa en telefono Qualcomm con GPU | 3,9-7,5 s | no disponible |
| Hechos correctos (6 de 6) | 6/6 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,0 GB con pesos int4 (bundle LiteRT-LM) y 3,4 GB con GGUF Q4_K_M; el adaptador LoRA ocupa 97 MB.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el despliegue de referencia es un teléfono Android con GPU Qualcomm mediante el backend GPU de LiteRT-LM.
- Cabe en GPU de consumo: sí, con cuantización Q4_K_M o int4, dado el tamaño de 3,0-3,4 GB de pesos; no se detallan modelos concretos de tarjeta gráfica.
- Opciones de despliegue: LiteRT-LM en Android (Kotlin), llama.cpp (`llama-server -m kuyaj-v3-Q4_K_M.gguf --jinja -c 4096`), Ollama y LM Studio con el GGUF (solo texto).
- Latencia y throughput: en un teléfono Qualcomm con GPU, 1,9-3,0 s hasta la primera palabra y 3,9-7,5 s para la respuesta completa; no se publican cifras de throughput en tokens por segundo ni latencias en escritorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kuya J v3 (Gemma 4 E2B) | 4.628.569.635 en safetensors; ~2B efectivos en el base | 4096 tokens | Asistente civico offline en lenguas filipinas con tool calling | gemma | Hugging Face (adaptador, GGUF, litertlm) |
| google/gemma-4-E2B-it | ~2B efectivos | no disponible | Modelo base multimodal texto e imagen, proposito general | gemma | Hugging Face |
| Gemma 4 E2B sin ajuste (referencia del autor) | ~2B efectivos | no disponible | Modelo base sin especializacion en tool calling para el dominio | gemma | Hugging Face |

La comparativa se limita al modelo base y a su variante sin ajuste, únicos terminos de referencia aportados en la informacion disponible.

## Limitaciones y advertencias

- El modelo está diseñado para un dominio muy acotado (servicios públicos filipinos) y depende de la herramienta `search_kb`; fuera de ese flujo su utilidad es limitada.
- No memoriza hechos: si los registros devueltos por la herramienta son incorrectos o están desactualizados, la respuesta también lo estará; la aplicación realiza una comprobación de fundamentación posterior.
- Riesgo de alucinación mitigado pero no eliminado: la política exige responder solo con los resultados y abstenerse si no hay registro, pero no se documentan tasas de error en producción.
- La longitud de contexto de referencia es de 4096 tokens, lo que limita el número de registros que pueden pasarse en una misma consulta.
- Cobertura lingüística restringida a en, tl, ceb, ilo, hil, war, pam y bcl; no se documenta rendimiento en otras lenguas.
- El ajuste LoRA no modifica visión ni audio; las capacidades multimodales son las heredadas del modelo base y no han sido evaluadas en este ajuste.
- Licencia `gemma`: el uso comercial y la redistribución están sujetos a los términos de la licencia Gemma de Google, que deben revisarse antes de un despliegue en producción.
- El conjunto de entrenamiento es sintético (1.187 ejemplos generados por un modelo profesor y filtrados), lo que puede introducir sesgos o lagunas respecto a consultas reales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- No se publican benchmarks estandar ni evaluaciones de sesgo; las únicas métricas disponibles son las del autor (122/126 llamadas correctas y 6/6 hechos correctos en una prueba reducida).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sapinsapin/kuya-j-gemma4-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de la aplicación Kuya J: https://github.com/mr-jones123/kuya-j
- Documentación del modelo en dispositivo: https://github.com/mr-jones123/kuya-j/blob/main/docs/on-device-model.md
- Integración LiteRT-LM en Kotlin: https://github.com/mr-jones123/kuya-j/blob/main/androidApp/src/main/java/ph/bettergov/kuyaj/llm/LiteRtLmEngine.kt
- Orquestador de la aplicación: https://github.com/mr-jones123/kuya-j/blob/main/shared/src/commonMain/kotlin/ph/bettergov/kuyaj/chat/Orchestrator.kt
- BetterGov.ph: https://bettergov.ph
