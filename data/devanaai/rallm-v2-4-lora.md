# Devanaai/RaLLM-v2.4-LoRA

## Resumen

RaLLM v2.4 es un adaptador LoRA de 467 MB desarrollado por Devana para el modelo base Qwen3.8-27B. Está diseñado específicamente para Suite 366, el asistente de la compañía, un agente que opera mediante herramientas sobre CRM, calendario, correo electrónico, archivos, notas y tareas, y que conoce el ecosistema Devana. El adaptador se distribuye como pesos PEFT sobre el modelo base, y la build cuantizada a NVFP4 para servir con vLLM está publicada en un repositorio separado.

El problema que aborda es la fiabilidad en la toma de decisiones de un agente con tool calling: cuándo invocar una herramienta, cuál elegir, cómo encadenar llamadas y, sobre todo, cuándo abstenerse de escribir en sistemas sensibles. Según las métricas del autor, el fine-tune mejora la decisión correcta entre llamar a una herramienta y responder del 92,1 % al 98,1 %, y reduce las escrituras no deseadas en CRM o calendario bajo instrucciones restrictivas de 59 a 2 casos sobre 279.

La relevancia actual reside en que demuestra que un ajuste fino pequeño y de licencia Apache 2.0 puede especializar un modelo de 27B para flujos agénticos de producción sin degradar sus capacidades generales: en los benchmarks públicos las diferencias respecto al base son mínimas o nulas, y mejora de forma significativa la detección de irrelevancia en BFCL v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B |
| Parametros totales | No disponible (adaptador de 467 MB; el base Qwen3.8-27B no detalla su desglose) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada del base Qwen3.8-27B, no especificada en la informacion) |
| Tipos de cuantizacion | NVFP4 (build de servicio en repositorio separado); el adaptador se distribuye en precision completa |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se carga sobre el transformer denso Qwen3.8-27B. No se trata de una arquitectura propia ni de un modelo MoE: el repositorio contiene únicamente los pesos del adaptador (467 MB) que se fusionan con el modelo base para servir. La model card indica que todas las cifras se midieron en precisión completa contra el modelo base, con el adaptador fusionado detrás de vLLM 0.30, decodificación greedy y modo thinking desactivado.

El entrenamiento se orienta a conversaciones sintéticas escritas en el formato del producto Suite 366, con énfasis en la selección y encadenamiento de herramientas y en el respeto de restricciones del system prompt. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La evaluación incluye pruebas con herramientas inventadas en otros dominios y con nueve formulaciones de restricción, seis de ellas nunca vistas por el modelo, lo que sugiere un esfuerzo deliberado por generalizar el comportamiento de abstención.

## Capacidades

- Generación de texto y razonamiento general, con capacidades de código y matemáticas heredadas del base (HumanEval 96,3 %, GSM8K 96,9 %).
- Tool calling y function calling, con validación de argumentos contra esquemas: 202 de 202 llamadas conformes a los esquemas de Suite 366.
- Planificación agéntica multi-paso: cadenas de herramientas de 9 a 11 llamadas sin detenerse antes de tiempo (0 de 48 fallos en el probe con herramientas no vistas).
- Selección precisa de la siguiente herramienta en cadenas largas: 47 de 48 aciertos con herramientas no vistas.
- Abstención de llamadas innecesarias: 7 llamadas no requeridas sobre 282 turnos, frente a 43 del base.
- Respeto de restricciones de escritura: 2 escrituras indebidas sobre 279 casos bajo instrucciones de solo lectura o confirmación previa.
- Conocimiento del ecosistema Devana: 11 de 12 preguntas correctas frente a 5 del base.
- Capacidades multilingües limitadas a francés e inglés.

## Casos de uso

- Atención al cliente con agentes sobre CRM: el modelo decide cuándo consultar o actualizar registros y respeta políticas de solo lectura, lo que permite desplegarlo en entornos donde las escrituras no autorizadas son un riesgo operativo.
- Automatización de agenda y correo: gestión de reuniones, respuestas y seguimientos encadenando herramientas de calendario y correo con cadenas de hasta 11 llamadas sin abandonar la tarea a medias.
- Asistentes internos con acceso a archivos y notas: recuperación y organización de información en flujos multi-turno donde el modelo debe elegir entre responder directamente o consultar una fuente.
- Orquestación de pipelines de agentes con herramientas propias: el adaptador generaliza a herramientas no vistas (47 de 48 aciertos en selección), por lo que puede integrarse en suites con esquemas de función personalizados.
- Despliegue en producción con vLLM: la build NVFP4 permite servir el modelo cuantizado en infraestructura estándar de inferencia con la misma interfaz OpenAI-compatible.
- Evaluación y auditoría de seguridad de agentes: el conjunto de pruebas de restricciones de escritura sirve como referencia para validar que un asistente no modifica sistemas sensibles sin autorización explícita.
- Asistentes bilingües francés-inglés para equipos europeos, con conocimiento de dominio específico del ecosistema Devana.

## Benchmarks y rendimiento

Evaluación de siguiente paso en Suite 366 (592 turnos, decodificación greedy, thinking off):

| Métrica | Qwen3.8-27B | RaLLM v2.4 |
|---|---|---|
| Decisión correcta entre llamar y responder | 92,1 % | 98,1 % |
| Conjunto exacto de herramientas esperadas | 63,4 % | 81,7 % |
| Solapamiento de herramientas con la referencia | 71,9 % | 87,6 % |
| Llamadas esperadas realizadas | 280/394 | 341/394 |
| Llamadas realizadas que eran esperadas | 62 % | 85 % |
| Llamadas a herramienta cuando la referencia responde en texto (282 turnos) | 43 | 7 |
| Argumentos válidos contra el esquema | 97,7 % | 99,7 % |
| Llamadas malformadas | 0 | 0 |

Benchmarks públicos (thinking off, greedy, mismas preguntas muestreadas):

| Benchmark | Preguntas | Qwen3.8-27B | RaLLM v2.4 | Diferencia | p (McNemar) |
|---|---|---|---|---|---|
| MMLU-Pro, inglés | 1.400 | 62,9 % | 63,9 % | +1,0 | 0,21 |
| MMLU-ProX, francés | 1.369 | 59,8 % | 60,0 % | +0,2 | 0,85 |
| GSM8K | 290 | 96,6 % | 96,9 % | +0,3 | 1,00 |
| HumanEval | 162 | 96,3 % | 96,3 % | 0,0 | 1,00 |
| BFCL v3, single turn | 746 | 85,1 % | 86,6 % | +1,5 | 0,22 |
| BFCL v3 `parallel` | 150 | 76,7 % | 80,7 % | +4,0 | 0,33 |
| BFCL v3 `parallel_multiple` | 150 | 84,0 % | 79,3 % | −4,7 | 0,14 |
| BFCL v3 `irrelevance` | 146 | 71,2 % | 79,5 % | +8,2 | 0,008 |

## Requisitos de hardware

- El adaptador LoRA ocupa 467 MB; el requisito real lo determina el modelo base Qwen3.8-27B, cuyos pesos en precisión completa no se detallan en la información disponible.
- Para servir en precisión completa con el adaptador fusionado, la model card cita vLLM 0.30 como servidor de referencia; no se especifican GPUs concretas ni VRAM medida.
- Existe una build cuantizada a NVFP4 para vLLM (Devanaai/RaLLM-v2.4-NVFP4) pensada para reducir los requisitos de memoria en producción; no se publican cifras de VRAM ni de throughput.
- No se confirma compatibilidad con llama.cpp, Ollama o TGI, ni el encaje en GPUs de consumo como la RTX 4090; estos datos no están disponibles en la información proporcionada.
- No se publican latencias ni tasas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RaLLM v2.4 (LoRA) | Adaptador sobre 27B | No disponible | Tool calling y agentes para Suite 366 | Apache 2.0 | Hugging Face (adaptador y build NVFP4) |
| Qwen3.8-27B (base) | 27B | No disponible | Modelo generalista | No disponible en la información | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más relevante es contra el propio modelo base: RaLLM v2.4 mejora la decisión de siguiente paso (+6,0 puntos), el conjunto exacto de herramientas (+18,3 puntos) y la abstención ante irrelevancia (+8,2 puntos en BFCL v3), con diferencias no significativas en conocimiento general, matemáticas y código.

## Limitaciones y advertencias

- El adaptador está especializado en el dominio de Suite 366 y el ecosistema Devana; fuera de ese contexto su ventaja sobre el base puede reducirse.
- Solo se declaran idiomas francés e inglés; el rendimiento en castellano u otras lenguas no está evaluado.
- En BFCL v3 `parallel_multiple` el modelo empeora 4,7 puntos respecto al base (79,3 % frente a 84,0 %), aunque la diferencia no es estadísticamente significativa (p = 0,14).
- En el probe de preguntas generales el modelo pasa 11 de 14 frente a 12 de 14 del base, una ligera regresión en tareas ajenas al dominio.
- Las evaluaciones se realizaron con decodificación greedy y thinking desactivado; el comportamiento con muestreo o modo razonamiento no se documenta.
- Las conversaciones de evaluación son sintéticas y escritas en el formato del producto, lo que puede no reflejar la distribución real de tráfico.
- No se detallan sesgos conocidos, tasas de alucinación ni la longitud de contexto efectiva del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador depende de los términos del modelo base Qwen3.8-27B, que no se detallan en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de las métricas del autor.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Devanaai/RaLLM-v2.4-LoRA
- Build cuantizada NVFP4: https://huggingface.co/Devanaai/RaLLM-v2.4-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio de Devana: https://www.devana.ai
- Suite 366: https://www.suite366.ai
