# respone/neutron

## Resumen

Neutron es un modelo de lenguaje desarrollado por Respone, empresa con sede en Daca (Bangladesh), presentado el 8 de septiembre de 2026 y actualizado el 17 de octubre del mismo año. Se distribuye como modelo propietario bajo la licencia "respone-neutron" y está orientado a generación de texto multilingüe con capacidades declaradas de razonamiento, código, agentes y comprensión de documentos e imágenes. El modelo se posiciona explícitamente en el segmento de modelos pequeños y rápidos, con un enfoque diferencial en cobertura lingüística del sur de Asia (bengalí, hindi) y árabe, además de inglés y español.

La información pública disponible no especifica el número de parámetros, la arquitectura interna ni la longitud de contexto. La model card describe entradas multimodales (texto, código, imágenes, documentos y voz) y salidas de texto y voz, con soporte de conversación por voz en nueve idiomas. El entrenamiento combinó datos de identidad, agentes, código y multilingües mediante ajuste supervisado de instrucciones, con una segunda fase específica para el uso fiable de herramientas (tool calling).

Su relevancia actual radica en dos factores: por un lado, ataca el problema del multilingüismo de bajos recursos, donde los modelos pequeños suelen degradarse notablemente; por otro, publica una metodología de evaluación con divulgación explícita del tamaño de muestra y los intervalos de confianza, incluyendo los resultados desfavorables frente a Gemma 4 31B en bengalí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica que sirve el modelo en configuracion de 8 bits) |
| Idiomas soportados | Texto: bengalí (incluido Banglish), inglés, hindi, árabe, español, francés, italiano, portugués, japonés, chino. Voz (entrada y salida): bengalí, inglés, hindi, español, francés, italiano, portugués, japonés, chino |
| Licencia | Propietaria, "Neutron Model Licence" (license_name: respone-neutron) |
| Formato de pesos | no disponible (repo de 0.0 GB, sin pesos publicados; inference: false) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de transformer, uso de mezcla de expertos, mecanismos de atención o estrategias de decodificación). La model card únicamente indica que Neutron fue entrenado por Respone sobre una mezcla de datos de identidad, agentes, código y multilingües, con ajuste supervisado de instrucciones como método de alineamiento. No se mencionan RLHF, DPO ni datos sobre el volumen de tokens de entrenamiento.

La innovación técnica documentada es una segunda fase de entrenamiento dedicada al uso fiable de herramientas, motivada por un fallo observado: un asistente al que se le ofrecía una herramienta de "enviar mensaje" respondía "enviado" sin ejecutar ninguna acción. Esta fase se centró en bengalí, Banglish e inglés, y se evaluó sobre 216 peticiones reservadas que deben convertirse en una llamada a herramienta, con la selección de herramienta en modo automático y sin ninguna salvaguarda previa al modelo. La model card muestra una tabla comparativa "antes / después" de esta fase, pero el contenido de la tabla está truncado en la información disponible, por lo que no se pueden citar las cifras.

## Capacidades

- Generación de texto y razonamiento: la model card declara capacidad de "leer y escribir, razonar sobre problemas", aunque la evaluación publicada se hizo con el modo de pensamiento desactivado.
- Programación agéntica: puede situarse detrás de un agente de código, planificar una tarea y llamar a herramientas proporcionadas (leer y editar ficheros, ejecutar comandos, buscar) a lo largo de múltiples pasos.
- Tool calling / function calling: entrenado y medido específicamente en una fase dedicada, en bengalí, Banglish e inglés.
- Multilingüismo amplio: texto en diez idiomas, con evaluación publicada en bengalí, inglés, hindi, árabe y español.
- Entrada multimodal: texto, código, imágenes, documentos y voz.
- Salida de voz: síntesis de voz en nueve idiomas.
- Entrada de voz: reconocimiento de voz en nueve idiomas.
- Soporte de Banglish (bengalí escrito con caracteres latinos) en texto y en tool calling.
- No se documenta un modo de razonamiento extendido (thinking mode) activable; de hecho, las evaluaciones se realizaron con el pensamiento desactivado.

## Casos de uso

- Atención al cliente en bengalí e hindi: el modelo obtiene 87 en Belebele bengalí y 88 en Belebele hindi, muy por encima del segmento económico (66 y 69 respectivamente), lo que lo hace adecuado para despliegues de soporte en mercados del sur de Asia donde los modelos pequeños habituales fallan.
- Agente de código en pipelines de desarrollo: con soporte de tool calling entrenado para leer y editar ficheros, ejecutar comandos y buscar, puede integrarse como motor de un agente que resuelva tareas de varios pasos sobre un repositorio.
- Procesamiento de documentos con imágenes: al aceptar documentos e imágenes como entrada, encaja en flujos de extracción y resumen de facturas, formularios o informes escaneados.
- Asistentes de voz multilingües: con entrada y salida de voz en nueve idiomas, es apto para interfaces conversacionales telefónicas o de altavoz en entornos con mezcla de inglés, hindi, bengalí, árabe o español.
- Localización de contenido al árabe: su resultado de 95 en Belebele árabe, a la par de Gemma 4 31B (96) y 17 puntos por encima del segmento económico, lo respalda para traducción y generación de contenido en árabe con escritura de derecha a izquierda y morfología rica.
- Automatización de tareas con herramientas en mercados bengalíes: la fase específica de tool calling en bengalí y Banglish permite construir asistentes que ejecuten acciones reales (envío de mensajes, consultas) sin el fallo de "respuesta simulada" que motivó ese entrenamiento.
- Asistencia en español para equipos técnicos: con 94 en Belebele español, puede emplearse en generación de documentación técnica, resúmenes y respuesta a preguntas sobre documentación interna.

## Benchmarks y rendimiento

Resultados publicados por el autor el 17 de octubre de 2026, medidos con el mismo arnés, prompts idénticos, el mismo analizador de respuestas y las mismas muestras para todos los modelos. 100 ítems por tarea, zero-shot, temperatura 0, sin cadena de pensamiento ni ejemplos few-shot. Intervalo de confianza del 95 % aproximado de ±10 puntos con n=100.

| Modelo | Global-MMLU bengalí | Belebele bengalí | Belebele inglés | Belebele hindi | Belebele árabe | Belebele español | Media |
|---|---|---|---|---|---|---|---|
| Neutron | 67,0 | 87,0 | 96,0 | 88,0 | 95,0 | 94,0 | 87,8 |
| Gemma 4 31B | 78,0 | 94,0 | 97,0 | 90,0 | 96,0 | 96,0 | 91,8 |
| GPT-5 nano | 48,0 | 66,0 | 87,0 | 69,0 | 78,0 | 86,0 | 72,3 |

Frente al segmento económico (representado por GPT-5 nano), el autor reporta una ventaja media de +16 puntos, con márgenes de +21 y +19 en bengalí, +19 en hindi, +17 en árabe, +9 en inglés y +8 en español. Frente a Gemma 4 31B, Neutron pierde en las seis métricas, con brechas de 11 y 7 puntos en bengalí (consideradas reales por el autor, al estar en el límite o por encima del intervalo de confianza) y diferencias de 1 a 2 puntos en inglés, hindi, árabe y español, que el autor califica de no concluyentes.

El análisis de respuestas sin letra reconocible reporta 5 de 600 para Neutron, 2 para Gemma 4 31B y ninguna para GPT-5 nano. Los modelos de comparación se sirvieron a través de OpenRouter; Neutron se ejecutó en hardware propio en configuración de 8 bits. No se han publicado resultados de benchmarks adicionales (MMLU estándar, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no publicarse el número de parámetros ni la longitud de contexto.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica que sirve el modelo en una configuración de 8 bits en hardware propio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el repositorio de Hugging Face no contiene pesos (inference: false, tamaño 0.0 GB).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Característica | Neutron | Gemma 4 31B | GPT-5 nano |
|---|---|---|---|
| Desarrollador | Respone | Google (presunto, no confirmado en la información) | OpenAI (presunto, no confirmado en la información) |
| Parámetros | no disponible | 31B (según denominación) | no disponible |
| Contexto | no disponible | no disponible | no disponible |
| Media en los seis benchmarks publicados | 87,8 | 91,8 | 72,3 |
| Belebele bengalí | 87,0 | 94,0 | 66,0 |
| Belebele árabe | 95,0 | 96,0 | 78,0 |
| Licencia | Propietaria (Neutron Model Licence) | no disponible | Propietaria |
| Disponibilidad de pesos | No publicados en Hugging Face (inference: false) | no disponible | No (solo API) |

Neutron se sitúa por encima del segmento económico en todas las métricas publicadas y por debajo de Gemma 4 31B en todas ellas, con la mayor desventaja en bengalí. La comparación con GPT-5 nano debe tomarse con cautela: el autor indica que este último se ejecutó en su ajuste mínimo de razonamiento para igualar las condiciones de respuesta directa.

## Limitaciones y advertencias

- Pesos no publicados: el repositorio de Hugging Face tiene un tamaño de 0.0 GB e `inference: false`; no es posible descargar ni ejecutar el modelo localmente a partir de la información disponible.
- Licencia propietaria "respone-neutron": es necesario revisar el fichero LICENSE del repositorio para conocer las restricciones de uso comercial, redistribución y despliegue; la información disponible no detalla sus términos.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor menciona explícitamente el fallo de respuestas simuladas en tool calling antes de la fase de entrenamiento específica, corregido según su propia evaluación.
- Cobertura de evaluación limitada: los benchmarks publicados cubren solo cinco idiomas (bengalí, inglés, hindi, árabe y español) pese a declarar diez idiomas de texto y nueve de voz; francés, italiano, portugués, japonés y chino no tienen resultados publicados.
- Potencia estadística limitada: 100 ítems por tarea implican un intervalo de confianza de ±10 puntos, por lo que las diferencias inferiores a 10 puntos no son concluyentes según el propio autor.
- Desventaja consistente en bengalí frente a Gemma 4 31B (11 y 7 puntos), reconocida por el autor como real y objetivo de la próxima versión.
- Evaluación con el modo de pensamiento desactivado: los resultados no reflejan el rendimiento del modelo si se habilita razonamiento extendido, en caso de estar disponible.
- Modelos de comparación servidos vía OpenRouter y Neutron en hardware propio en 8 bits: posibles diferencias de infraestructura no controladas.
- Sin datos de arquitectura, parámetros ni contexto: imposible estimar coste de inferencia, requisitos de memoria o idoneidad para tareas de contexto largo.
- Fecha de creación del repositorio (2026-09-09) y actualización (2026-11-21) coherentes con la model card, pero sin historial de versiones ni pesos verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/respone/neutron
- Sitio del modelo: https://neutron.respone.ai
- Sitio del desarrollador: https://respone.ai
- Contacto: hello@respone.ai
- Dataset Global-MMLU: https://huggingface.co/datasets/CohereLabs/Global-MMLU
- Dataset Belebele: https://huggingface.co/datasets/facebook/belebele
- Licencia (referenciada en el repositorio): LICENSE
