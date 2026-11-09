# allsmart/Intent

## Resumen

ALLSmartIntent es un modelo encoder de clasificación de intenciones desarrollado por allsmart, pensado para ejecutarse como paso previo y barato a la llamada de un LLM generativo en el gateway de chatbots y agentes conversacionales. Se construye sobre `jhu-clsp/mmBERT-base` (arquitectura ModernBERT multilingüe) y añade cuatro cabezas lineales que, en una sola pasada y sobre los últimos 512 tokens, responden 14 preguntas sobre el mensaje más reciente de una conversación: acto de diálogo, referencia al historial, datos que necesita una buena respuesta, estado de ánimo, fuera de tema, intento de saltarse reglas, petición poco clara, contenido inapropiado, crisis, extremismo e idioma.

El problema que aborda es el coste y la latencia de encaminar cada mensaje del usuario a la herramienta, modelo o respuesta fija adecuada. Con 306,9 millones de parámetros y latencias del orden de 8-15 ms por mensaje en GPU y unos 29 ms en CPU, el modelo permite tomar decisiones de enrutado, moderación y aclaración antes de invocar un modelo caro. La entrada combina el propósito del bot, el historial reciente y el mensaje nuevo, de modo que el modelo es genérico respecto al caso de uso: lo específico de cada bot (qué herramienta concreta encaja) queda fuera del alcance del modelo.

Es relevante ahora porque los pipelines de agentes necesitan capas de control deterministas y auditables (moderación, detección de prompt injection, detección de crisis) que no dependan de la creatividad de un LLM generativo, y porque un encoder pequeño multilingüe (14 idiomas) puede desplegarse en hardware modesto o incluso en CPU con latencias compatibles con un gateway en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT multilingüe (`jhu-clsp/mmBERT-base`) con cuatro cabezas lineales |
| Parámetros totales | 306.939.648 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrada |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | de, en, fr, it, es, nl, pl, tr, cs, hr, hu, pt, ro, uk (14 idiomas; medido principalmente en alemán e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (encoder vía `AutoModel` + `koepfes.safetensors` con las cabezas + `intent.json` con etiquetas y umbrales) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de tipo ModernBERT en su variante multilingüe `mmBERT-base`, sobre el que se montan cuatro cabezas lineales independientes. La entrada se compone del propósito del bot, el historial de conversación (opcional) y el mensaje nuevo, con un formato concreto de entrenamiento: primero el mensaje nuevo, después el propósito y después el historial en orden de más reciente a más antiguo, de forma que el truncado a 512 tokens descarte primero el historial más antiguo y nunca el mensaje. Las cabezas producen: una clasificación de acto de diálogo (`akt`, 8 clases), una de referencia conversacional (`bezug`, 3 clases), una de idioma (`sprache`, 15 clases incluyendo `andere`) y un conjunto de salidas binarias independientes con sigmoide y umbral propio en `intent.json` (`bedarf_*`, `stimmung_*`, `rahmen`, `regelumgehung`, `unklar`, `unangemessen`, `krise`, `extremismus`).

El entrenamiento se apoya en los datasets `deepset/prompt-injections`, `jagoldz/gahd`, `nvidia/Nemotron-Safety-Guard-Dataset-v3` y `reshabhs/SPML_Chatbot_Prompt_Injection`, según los metadatos del repositorio. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO (en un encoder de clasificación no sería el enfoque habitual). La evaluación se realizó sobre dos conjuntos ciegos anotados a mano e independientes del entrenamiento: 450 extractos cortos de chat y 120 con mensajes o historiales largos, para tres bots (asistente de vuelo, agente personal y chat de experto en bolsa), con 383 de los 450 en alemán y el resto en inglés, francés, italiano, español, neerlandés, polaco y turco.

## Capacidades

- Clasificación del acto de diálogo del mensaje: pregunta, petición, afirmación, respuesta corta dependiente del historial, corrección, agradecimiento, saludo/small talk y queja.
- Detección de referencia conversacional: mensaje nuevo, continuación del último turno o cambio de tema.
- Estimación de las necesidades de una buena respuesta: datos actuales, datos del usuario, acción, documentos, cálculo y conocimiento general.
- Detección de estado de ánimo: preocupación, enfado y urgencia.
- Detección de fuera de tema respecto al propósito declarado del bot (`rahmen`).
- Detección de intentos de saltarse reglas o prompt injection (`regelumgehung`), con precisión del 100 % en el conjunto ciego 1.
- Detección de peticiones poco claras que requieren repreguntar (`unklar`).
- Moderación: contenido inapropiado, crisis (autolesión) y extremismo.
- Identificación del idioma del mensaje entre 14 idiomas más una clase `andere`.
- Multilingüe en 14 idiomas, con rendimiento medido principalmente en alemán e inglés.
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso por sí mismo; su función es habilitar esas decisiones en la capa de orquestación.
- Compatible con Text Embeddings Inference y con endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Enrutado a herramientas y modelos en un gateway de agentes: antes de llamar al LLM caro, el modelo clasifica el acto de diálogo y las necesidades de respuesta (`bedarf_aktion`, `bedarf_aktuelle_datos`, `bedarf_documentos`, etc.) para decidir si hay que invocar una herramienta de clima, una consulta a base de datos del usuario o una búsqueda documental, con latencias de 8-15 ms en GPU.
- Moderación previa a la generación: las cabezas `unangemessen`, `extremismo` y `krise` permiten devolver respuestas fijas y revisadas antes de que el mensaje llegue al LLM generativo, reduciendo el riesgo de que el modelo grande produzca contenido inapropiado o responda de forma inadecuada a una crisis.
- Protección frente a prompt injection: la cabeza `regelumgehung` (F1 0.93 y precisión 100 % en el conjunto ciego 1) permite bloquear o aislar mensajes que intentan ver o modificar las instrucciones del sistema o romper el rol del bot.
- Gestión de fuera de tema en asistentes verticales: `rahmen` (F1 0.93) detecta mensajes que no encajan con el propósito declarado del bot (por ejemplo, una receta de gulasch en un asistente de vuelos) para responder con un texto fijo en lugar de gastar una llamada al LLM.
- Aclaración proactiva: la cabeza `unklar` identifica peticiones que no se pueden responder sin repreguntar, lo que permite lanzar una pregunta de aclaración antes de invocar herramientas o modelos costosos.
- Continuidad conversacional y desambiguación: `bezug` y `akt` distinguen respuestas cortas como "sí" o "el segundo" que solo tienen sentido con el historial, y detectan cambios de tema o correcciones, lo que ayuda a construir el contexto correcto para el siguiente turno.
- Encaminado multilingüe en atención al cliente: `sprache` (98,7 % de exactitud en el conjunto ciego 1) permite seleccionar el idioma de respuesta, el modelo o el prompt adecuado en un mismo gateway para 14 idiomas europeos.
- Filtro de bajo coste en CPU: con unos 29 ms por mensaje en un Ryzen 7 7800X3D con 8 hilos, puede desplegarse como primera capa en entornos sin GPU antes de cualquier llamada a un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre dos conjuntos ciegos anotados a mano, independientes del entrenamiento y de la selección de modelo (450 extractos cortos y 120 con mensajes o historiales largos):

| Métrica | Conjunto ciego 1 (450) | Conjunto ciego 2 (120, largos) |
|---|---|---|
| Exactitud `akt` | 91,6 % | 89,2 % |
| Exactitud `bezug` | 91,1 % | 87,5 % |
| Exactitud `sprache` | 98,7 % | 99,2 % |
| F1 `rahmen` | 0,93 | 0,92 |
| F1 `regelumgehung` | 0,93 (precisión 100 %) | 1,00 |
| F1 `bedarf_aktion` | 0,75 | 0,75 |
| F1 `bedarf_aktuelle_daten` | 0,71 | 0,73 |
| F1 `bedarf_dokumente` | 0,71 | 0,50 |
| F1 `bedarf_rechnen` | 0,69 | 0,47 |
| F1 `bedarf_allgemeinwissen` | 0,68 | 0,40 |
| F1 `bedarf_nutzerdaten` | 0,63 | 0,73 |
| F1 `stimmung_veraergert` | 0,75 | 0,71 |
| F1 `stimmung_dringend` | 0,74 | 0,35 (3 casos) |
| F1 `stimmung_besorgt` | 0,54 | 0,77 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 306,9 M de parámetros, en fp32 serían aproximadamente 1,2 GB y en fp16/bf16 unos 0,6 GB, más el overhead de activaciones y del runtime.
- GPU recomendadas: la model card reporta latencias medidas en NVIDIA GB10 y RTX 4070 Ti; cualquier GPU con al menos unos pocos GB de VRAM libre es suficiente para el modelo.
- Cabe en GPU de consumo: sí, por tamaño; se han publicado mediciones en RTX 4070 Ti.
- CPU: funciona con unos 29 ms por mensaje en un Ryzen 7 7800X3D con 8 hilos, lo que permite despliegue sin GPU.
- Opciones de despliegue: `transformers` (carga del encoder con `AutoModel` más las cabezas de `koepfes.safetensors` y los umbrales de `intent.json`), Text Embeddings Inference y endpoints compatibles según los tags del repositorio. No se mencionan vLLM, llama.cpp ni Ollama para este modelo.
- Latencia y throughput publicados: en NVIDIA GB10, aproximadamente 15 ms por mensaje y 7 ms por mensaje en lotes de 16; en RTX 4070 Ti, aproximadamente 8 ms por mensaje y 1 ms por mensaje en lotes de 32; en CPU, aproximadamente 29 ms por mensaje.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el modelo se apoya en `jhu-clsp/mmBERT-base` (mismo tamaño de parámetros y contexto de 512 tokens, licencia y rendimiento del backbone no detallados aquí) y se distingue de clasificadores de intención monolingües o de propósito único por cubrir 14 cabeceras en una sola pasada. Cualquier comparación cuantitativa con alternativas como clasificadores de moderación o routers de intención de otros proveedores queda como no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas ni ejecuta herramientas; solo clasifica el mensaje y produce puntuaciones.
- El rendimiento está medido principalmente en alemán e inglés; para el resto de los 14 idiomas no se publican métricas específicas.
- Algunas cabezas tienen F1 moderado o bajo, especialmente en mensajes largos: `bedarf_allgemeinwissen` (0,40), `bedarf_rechnen` (0,47) y `bedarf_dokumente` (0,50) en el conjunto ciego 2, y `stimmung_dringend` (0,35) sobre solo 3 casos; no conviene usarlas como única señal en producción.
- El conjunto ciego 2 es pequeño (120 ejemplos) y la clase `stimmung_dringend` tiene muy pocos casos, por lo que las métricas de esa clase son poco fiables.
- Los umbrales de las cabezas binarias están en `intent.json` y deben calibrarse para cada caso de uso; cada cabeza es un sigmoide independiente, no una clasificación mutuamente excluyente.
- Es imprescindible respetar el formato de entrada (mensaje nuevo primero, luego propósito, luego historial de más reciente a más antiguo) para que el truncado a 512 tokens no elimine el mensaje.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y falsos negativos en moderación y detección de prompt injection; las respuestas fijas para `krise`, `unangemessen` y `regelumgehung` deben estar revisadas por humanos.
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse con datasets de moderación y prompt injection, puede heredar los sesgos de esos conjuntos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento y del modelo base para obligaciones adicionales.
- El modelo no decide qué herramienta concreta de cada bot usar; esa lógica queda del lado del integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allsmart/Intent
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Gateway del desarrollador: https://allsmartllm.com
- Modelos de privacidad relacionados: https://huggingface.co/allsmart/Art4, https://huggingface.co/allsmart/Art4i, https://huggingface.co/allsmart/Art9-10
- Dataset de prompt injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset GAHD: https://huggingface.co/datasets/jagoldz/gahd
- Dataset Nemotron Safety Guard v3: https://huggingface.co/datasets/nvidia/Nemotron-Safety-Guard-Dataset-v3
- Dataset SPML Chatbot Prompt Injection: https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
- Paper referenciado (arXiv 2508.01710): https://arxiv.org/abs/2508.01710
- Paper referenciado (arXiv 2402.11755): https://arxiv.org/abs/2402.11755
