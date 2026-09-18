# A11Sunday/support-json-qwen3.5-4b-lora

## Resumen

Support-JSON · Qwen3.5-4B LoRA es un adaptador PEFT (LoRA) publicado por el usuario A11Sunday sobre el modelo base Qwen/Qwen3.5-4B. Su función es convertir una entrada estructurada de soporte al cliente (mensaje del usuario, historial, políticas de empresa con identificador y texto, hechos tipados con su origen y capacidades disponibles) en una decisión de negocio más un borrador de respuesta, todo ello en formato JSON con nueve campos fijos: category, priority, sentiment, action, recommended_action, reply, missing_info, supported_rule_ids y human_escalation. Está diseñado como asistente de operador: no ejecuta reembolsos, no modifica cuentas y no envía mensajes a clientes. El idioma de trabajo es exclusivamente el ruso.

El interés del adaptador reside en su enfoque de "policy-following estructurado": en lugar de pedir al modelo que decida libremente, el sistema inyecta las reglas de la empresa en el contexto en cada petición e impone un esquema JSON validado con invariantes entre campos. Según la model card, el entrenamiento parte de 512 filas sintéticas durante 2 épocas con LoRA de rango 16, y la evaluación sobre 108 casos sintéticos retenidos reporta mejoras notables frente al modelo base sin adaptador (por ejemplo, exactitud de categoría del 76,9 % al 100,0 % y validez de esquema e invariantes del 54,6 % al 95,4 %).

Es un artefacto pequeño (unos 130 MB de pesos de adaptador, repo de 0,3 GB) pensado para ejecución local en GPU de consumo, con licencia Apache 2.0. No es un modelo fusionado ni se distribuye en GGUF, y el autor advierte explícitamente de que la suite de evaluación es sintética, mayoritariamente con plantillas en ruso y con historiales de conversación vacíos durante el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-4B; arquitectura interna del base no disponible en la información proporcionada |
| Parámetros totales | No disponible (el nombre del base indica ~4B; el adaptador ocupa unos 130 MB, rango r=16, alpha=32, all-linear) |
| Longitud de contexto | 2048 tokens durante el entrenamiento; contexto máximo del modelo base no disponible |
| Tipos de cuantización | No disponible. El adaptador se entrena en BF16; no se publica versión GGUF ni cuantizaciones del adaptador |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); no hay modelo fusionado ni GGUF |
| Librería | peft |
| Modelo base | Qwen/Qwen3.5-4B (revisión fijada: 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a) |
| Relación con el base | adapter (no fusionado) |
| Dataset de entrenamiento | A11Sunday/support-json-ru |
| Tamaño del repo | 0,3 GB (pesos del base ~9,3 GB en disco, descargados aparte) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de tipo PEFT sobre Qwen3.5-4B, text-only. La configuración declarada es r=16, alpha=32, aplicación all-linear, dropout 0, tasa de aprendizaje 1e-4, semilla 42 y pérdida únicamente sobre la respuesta (response-only loss). El entrenamiento se realizó en BF16 con contexto de 2048 tokens, sobre 512 filas sintéticas durante 2 épocas, con micro-batch 2 y acumulación de gradiente 4, lo que equivalió a 128 actualizaciones. El stack utilizado fue Soup 0.75.0, Transformers 5.17.0, PEFT 0.21.0, TRL 0.29.1 y Liger, todo sobre Windows nativo. No se menciona RLHF ni DPO en la información disponible.

El proceso de selección es relevante para interpretar los resultados: se evaluaron tres adaptadores sobre 96 ejemplos de validación y se seleccionó el tercero antes de abrir el conjunto de test de 108 ejemplos, con una restricción de seguridad basada en recall de casos críticos y un orden de preferencia predeclarado que priorizaba la exactitud de la acción. El autor indica que los 10 000 candidatos publicados no se entrenaron todos y que los corpus iniciales de train/validación/test y la instantánea de entrenamiento seleccionada permanecen congelados. La innovación destacable no es arquitectónica, sino de contrato de salida: el esquema JSON con invariantes entre campos se comprueba estrictamente en el código de inferencia, aunque ese código no repara salidas inválidas ni verifica cada afirmación del borrador de respuesta.

## Capacidades

- Generación de texto en ruso orientada a soporte al cliente, con salida estructurada en JSON de nueve campos.
- Clasificación de la petición en categoría, prioridad y sentimiento.
- Decisión de política: propone acción y acción recomendada a partir de las reglas inyectadas en el contexto.
- Redacción de un borrador de respuesta al cliente en ruso, sujeto a revisión humana obligatoria.
- Identificación de información faltante (missing_info) y de las reglas que respaldan la decisión (supported_rule_ids).
- Señalización de escalado a humano (human_escalation).
- Distinción entre hechos aportados por el cliente y observaciones del sistema mediante campos tipados con origen; los hechos desconocidos se representan como null.
- Seguimiento de políticas (policy-following): las reglas de empresa se entregan en el contexto en cada petición, no están memorizadas en el adaptador.
- No dispone de tool calling ni function calling, ni de ejecución de acciones: las capacidades del sistema son de solo sugerencia (el script predict.py fuerza capacidades de tipo suggestion-only).
- No dispone de visión, audio, thinking mode ni modo de razonamiento extendido; la evaluación se hizo con generación greedy sin modo de pensamiento.
- Multilingüismo: limitado al ruso según la etiqueta de idioma del repositorio.

## Casos de uso

- Triaje de tickets de soporte SaaS en ruso: el adaptador recibe el mensaje y las políticas vigentes y devuelve categoría, prioridad y sentimiento listos para enrutar el ticket en el sistema de ticketing, reduciendo la clasificación manual.
- Borrador de respuesta para operadores: genera un reply en ruso que el agente humano revisa y envía, lo que acorta el tiempo de primera respuesta en colas de alto volumen.
- Verificación de cumplimiento de políticas: los campos supported_rule_ids permiten auditar qué reglas se citaron en cada decisión, útil en sectores con requisitos de trazabilidad.
- Detección de información faltante: el campo missing_info permite lanzar automáticamente una petición de datos al cliente antes de que un humano abra el caso.
- Escalado asistido a segundo nivel: la señal human_escalation y la prioridad permiten desviar casos críticos (por ejemplo, disputas de facturación) a agentes senior con contexto ya resumido.
- Integración en pipelines internos de decisión: al ser salida JSON con invariantes comprobables, la respuesta se puede consumir desde code propio para poblar CRM o colas de trabajo, siempre con revisión humana antes de cualquier efecto real.
- Evaluación comparativa de prompts y políticas: sirve como banco de pruebas para medir cómo cambia la exactitud de acción al modificar el texto de las reglas, dado el bajo coste de despliegue de un adaptador de 130 MB.
- Asistencia en operaciones sensibles a reembolsos y umbrales: aun con revisión obligatoria, ayuda a localizar el límite aplicable en políticas con condiciones (el autor documenta un fallo conocido justo en un límite de reembolso inclusivo, por lo que este uso exige doble comprobación).

## Benchmarks y rendimiento

Los datos proceden de la evaluación declarada por el autor: 108 casos sintéticos de SaaS retenidos, mismo prompt y mismos ajustes para base y LoRA, generación greedy sin modo de pensamiento, máximo 700 tokens nuevos, batch 8 y ambas tokens de parada nativas. Sin reparación de JSON ni decodificación restringida.

| Métrica (solo campos) | Base | LoRA |
|---|---:|---:|
| Exactitud de categoría | 76,9 % | 100,0 % |
| Exactitud de prioridad | 72,2 % | 99,1 % |
| Exactitud de acción | 27,8 % | 89,8 % |
| Esquema + invariantes válidos | 54,6 % | 95,4 % |
| Exactitud de acción estricta (salida inválida falla todos los campos) | 24,1 % | 86,1 % |

Controles adicionales reportados: un control de base más cuatro ejemplos de entrenamiento congelados alcanza un 40,7 % de exactitud de acción con un prompt distinto (el autor aclara que no es una comparación contra un modelo mayor más potente). En revisión de contenido, una auditoría ciega asistida por IA sobre 36 respuestas de test emparejadas otorga una calidad de 2,78 → 4,31 sobre 5 y señala afirmaciones no respaldadas por hechos o políticas en 13/36 → 5/36 respuestas; el evaluador fue un asistente de IA, no revisores humanos independientes. Las comprobaciones de prototipo coinciden con los campos y el contrato esperados en 8/10 respuestas del modelo, con fallos conocidos: una denegación incorrecta en un límite de reembolso inclusivo, un par con umbral modificado que falla y un estado de reembolso externo inventado. Estas comprobaciones derivan de validación, no de un benchmark nuevo no visto.

## Requisitos de hardware

- Configuración certificada por el autor: Windows, Python 3.12, RTX 5070 Ti con 16 GB de VRAM y CUDA 12.8. Otro hardware no está certificado.
- Pesos del modelo base: aproximadamente 9,3 GB en disco, que hay que cargar íntegramente además del adaptador (unos 130 MB) y los búferes de GPU; conviene reservar espacio adicional para descargas.
- VRAM estimada: con los pesos del base en BF16 y el adaptador, el entorno probado con 16 GB de VRAM es el mínimo de referencia; no se publican medidas detalladas de pico de memoria.
- GPU de consumo: sí, cabe en una GPU de consumo de 16 GB como la RTX 5070 Ti empleada por el autor. El despliegue en CPU no está implementado en el ejemplo incluido.
- Interferencia de memoria: el autor advierte de que entrenar en GPU o ejecutar un juego en la misma tarjeta compite por memoria y cómputo, y recomienda detener el servidor al terminar para liberar VRAM.
- Opciones de despliegue documentadas: script de inferencia predict.py y demo local con Gradio accesible en http://127.0.0.1:7860 (solo loopback), sobre PEFT y Transformers. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Reproducción: la revisión del modelo base está fijada a 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a y no se requiere código remoto personalizado.
- Latencia y throughput: no disponibles. La evaluación se realizó con batch 8 y un máximo de 700 tokens nuevos por respuesta, pero no se publican tiempos.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables de terceros (mismo tamaño o misma tarea) en la información disponible. La única comparación documentada es contra el propio modelo base sin adaptador, dentro de la misma evaluación:

| Aspecto | Qwen3.5-4B (base) | Support-JSON Qwen3.5-4B LoRA |
|---|---|---|
| Parámetros | ~4B (según nombre del modelo) | Base + adaptador LoRA r=16, alpha=32, all-linear (~130 MB) |
| Contexto | No disponible | 2048 tokens en entrenamiento |
| Exactitud de acción (108 casos) | 27,8 % / 24,1 % estricta | 89,8 % / 86,1 % estricta |
| Esquema + invariantes válidos | 54,6 % | 95,4 % |
| Salida | Texto libre | JSON de nueve campos con invariantes |
| Licencia | No disponible en esta ficha | Apache 2.0 |
| Disponibilidad | HuggingFace (Qwen/Qwen3.5-4B) | HuggingFace (adaptador PEFT) |

Alternativas comparables de terceros: no disponible.

## Limitaciones y advertencias

- Suite de evaluación pequeña y sintética, mayoritariamente rusa y con plantillas; los resultados no equivalen a un benchmark sobre tráfico real.
- Los historiales de conversación estaban vacíos durante el entrenamiento, aunque la aplicación acepta historial: el comportamiento multirritmo no está validado en la información disponible (la sección de limitaciones de la model card aparece truncada en ese punto).
- Solo ruso: no hay evidencia de funcionamiento en otros idiomas.
- Riesgo de alucinación: la auditoría ciega detectó afirmaciones no respaldadas por hechos o políticas en 5 de 36 respuestas revisadas, incluyendo un estado de reembolso externo inventado.
- Fallos conocidos en fronteras de política: una denegación incorrecta en un límite de reembolso inclusivo y un par con umbral modificado que falla. Estos casos derivan de validación, no de un conjunto nuevo no visto.
- JSON válido no implica decisión correcta: el código comprueba esquema e invariantes, pero no repara salidas inválidas ni verifica cada afirmación del borrador. La exactitud de acción estricta es del 86,1 %, no del 100 %.
- Revisión humana obligatoria: el adaptador solo sugiere; no ejecuta reembolsos, no modifica cuentas y no envía mensajes a clientes. Cualquier automatización de efectos reales queda fuera del alcance documentado.
- La auditoría de calidad de contenido fue asistida por IA, no por revisores humanos independientes, y la model card lo señala explícitamente.
- Selección de modelo basada en validación con criterios predeclarados y corpora congelados: la comparación con el control de cuatro ejemplos usa un prompt distinto y no equivale a competir con un modelo mayor.
- Licencia Apache 2.0, que permite uso comercial, pero hereda las condiciones del modelo base Qwen3.5-4B, cuyos términos no se detallan en la información proporcionada; conviene revisarlos antes de un despliegue comercial.
- Despliegue restringido en la práctica: sin GGUF, sin soporte CPU implementado y sin compatibilidad documentada con servidores de inferencia habituales.
- Fechas del repositorio: creación 2026-09-17 y actualización 2026-09-17 según HuggingFace, con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/A11Sunday/support-json-qwen3.5-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/A11Sunday/support-json-ru
- Evaluación (ruta dentro del repositorio): evaluation/RESULTS.md
- Demo animada (ruta dentro del repositorio): assets/demo.mp4
- Paquete de proyecto (ruta dentro del repositorio): artifacts/Support_JSON_Capstone-v3.zip
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo, su base o su dataset; las búsquedas devolvieron páginas no relacionadas (citas literarias y biografías de autores franceses).
