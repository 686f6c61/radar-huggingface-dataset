# anand-ai/clinical-symptom-triage-slm-int8

## Resumen

El modelo `clinical-symptom-triage-slm-int8`, publicado por el usuario anand-ai en Hugging Face, es un clasificador de texto basado en un transformer encoder (familia BERT) afinado para triaje clínico de síntomas. Su función es asignar una narración de síntomas a una de cuatro categorías de urgencia (Emergency, Urgent, Routine y Self-care), sin generar texto libre ni emitir diagnósticos. El artefacto principal es una versión cuantizada a INT8 en formato ONNX de 29 MB, pensada para inferencia en CPU, navegador (WebAssembly) y dispositivos móviles.

El modelo tiene 28.765.700 parámetros totales (unos 28,8 millones) y se distribuye con pesos en safetensors y ONNX. Según la model card, combina el encoder afinado con una capa determinista de reglas para banderas rojas clínicas, y declara una latencia P50 de 1,31 ms en CPU con un rendimiento de 725,4 QPS en un solo núcleo. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Su relevancia radica en la combinación de tamaño reducido, latencia muy baja y un enfoque de seguridad explícito: el modelo no produce recomendaciones médicas libres, sino una etiqueta de urgencia acotada. Es un ejemplo de "small language model" (SLM) orientado a clasificación en entornos con restricciones de cómputo y requisitos de auditabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia BERT; el autor lo denomina "triage-bert-small") |
| Parámetros totales | 28.765.700 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8 (ONNX); pesos también en safetensors sin cuantizar |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (model.int8.onnx) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT de tamaño pequeño, con 28,8 millones de parámetros, afinado para clasificación de secuencias en cuatro clases. El autor denomina al checkpoint base "triage-bert-small". Sobre la salida del encoder se aplica, según la model card, una "capa determinista de seguridad para banderas rojas clínicas" que complementa la predicción del modelo; no se detalla si esta capa es un conjunto de reglas previo o posterior a la clasificación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni técnicas de aumento de datos. Tampoco se documentan innovaciones de atención (atención lineal, decodificación especulativa) ni detalles sobre el proceso de cuantización INT8 más allá del tamaño resultante (29 MB) y el formato ONNX. La evaluación declarada se realiza sobre los 45 viñetas clínicas estandarizadas del estudio de auditoría de Semigran et al. (BMJ 2015).

## Capacidades

- Clasificación de texto clínico en cuatro niveles de urgencia: Emergency (0), Urgent (1), Routine (2) y Self-care (3).
- Salida de logits y probabilidades calibradas por clase, apta para umbrales configurables.
- Procesamiento de narraciones de síntomas en inglés, incluyendo presentaciones típicas de banderas rojas (dolor torácico opresivo irradiado, déficit neurológico focal, fiebre alta con escalofríos).
- Inferencia en CPU de un solo núcleo con latencia declarada de 1,31 ms (P50) y 725,4 QPS.
- Despliegue en navegador mediante WebAssembly y en dispositivos móviles gracias al tamaño INT8 de 29 MB.
- No soporta generación de texto libre, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No proporciona diagnósticos, tratamientos ni recomendaciones médicas no acotadas.

## Casos de uso

- Triaje previo en urgencias digitales: el modelo clasifica la narración del paciente en una de las cuatro categorías para enrutar la consulta al nivel asistencial adecuado (urgencias, atención urgente, primaria o autocuidado), con latencia inferior a 2 ms por petición.
- Formularios de admisión en atención primaria: integrado en el flujo de anamnesis, asigna una urgencia preliminar que el personal clínico revisa, reduciendo el tiempo de clasificación manual en consultas de alta demanda.
- Chatbots de orientación sanitaria con salvaguardas: al no generar texto libre, el modelo actúa como clasificador de seguridad que decide si la conversación debe derivarse a un profesional o a un servicio de emergencias.
- Aplicaciones móviles de salud sin conectividad: el artefacto ONNX INT8 de 29 MB cabe en el binario de una app y permite inferencia local en el dispositivo, útil en entornos con red limitada.
- Investigación en triaje automatizado: sirve como línea base reproducible para comparar con otros symptom checkers sobre las viñetas del BMJ 2015, dado que el autor publica métricas de recall de emergencia y sub-triaje.
- Monitorización de banderas rojas en registros clínicos: procesado por lotes de notas o formularios para detectar casos con posible urgencia y priorizar su revisión por parte del personal sanitario.
- Filtrado previo en servicios de telemedicina: clasificación rápida de mensajes entrantes para separar los casos que requieren atención inmediata del resto de la cola.

## Benchmarks y rendimiento

Los datos proceden de la model card y se refieren a la evaluación sobre las 45 viñetas del estudio BMJ 2015 (Semigran et al.), comparando con los symptom checkers publicados y con médicos en ejercicio según la línea base del estudio.

| Métrica | Modelo (INT8 + reglas) | Media BMJ (N=23) | Mejor BMJ | Médicos (BMJ) |
|---|---|---|---|---|
| Recall de emergencia (Acuity 1) | 100,0% (15/15) | 80,0% | 93,0% | 80,0% |
| Tasa de sub-triaje global | 2,2% (1/45) | 15,0% | 7,0% | 10,0% |
| Precisión global de triaje | 55,6% | 57,0% | 78,0% | 80,0% |
| Throughput (1 núcleo CPU) | 725,4 QPS | No disponible | No disponible | No disponible |
| Latencia P50 en CPU | 1,31 ms | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso del artefacto ONNX INT8, que se ejecuta en CPU; en GPU, el modelo de 28,8 millones de parámetros ocupa del orden de decenas de megabytes en FP32 y unos 29 MB en INT8, por lo que cabe en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) puede ejecutarlo, aunque el diseño está orientado a CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas, y también en CPU de un solo núcleo.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), WebAssembly en navegador, y cualquier runtime compatible con ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a clasificación de encoders pequeños.
- Latencia y throughput: 1,31 ms P50 y 725,4 QPS en un núcleo de CPU según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clinical-symptom-triage-slm-int8 | 28,8 M | No disponible | Clasificación de urgencia (4 clases) | Apache 2.0 | Hugging Face (ONNX + safetensors) |
| BERT-base (referencia genérica) | 110 M | 512 tokens | Clasificación general | Apache 2.0 | Hugging Face |
| Symptom checkers comerciales (p. ej., los auditados en BMJ 2015) | No disponible | No disponible | Triaje y autodiagnóstico | Propietaria | Servicios web |

No se dispone de información sobre modelos comparables específicos de triaje clínico con pesos abiertos y métricas publicadas en la información proporcionada. La comparación con los symptom checkers del estudio BMJ es la única referencia cuantitativa disponible.

## Limitaciones y advertencias

- El modelo no emite diagnósticos ni prescribe tratamientos; cualquier uso debe enmarcarse como apoyo a la clasificación de urgencia, no como sustituto del juicio clínico.
- La precisión global de triaje declarada es del 55,6%, inferior a la de los médicos (80%) y al mejor checker del estudio BMJ (78%); el punto fuerte es el recall de emergencia, no la exactitud global.
- Solo admite inglés; no se documenta soporte multilingüe ni evaluación en otros idiomas.
- No se detalla la composición del dataset de entrenamiento, por lo que no puede evaluarse el riesgo de sesgos demográficos, geográficos o de presentación clínica.
- Riesgo de alucinación no aplica en sentido estricto al ser un clasificador, pero sí existe riesgo de clasificación errónea (falsos negativos de urgencia), mitigado parcialmente por la capa de reglas.
- La licencia Apache 2.0 permite uso comercial, pero el autor incluye un aviso de seguridad clínica que debe respetarse; no se documentan certificaciones regulatorias (CE, FDA) ni validación prospectiva.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-23) es posterior a la fecha actual, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/anand-ai/clinical-symptom-triage-slm-int8
- Estudio de referencia BMJ 2015 (Semigran et al.): https://www.bmj.com/content/351/bmj.h3480
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
