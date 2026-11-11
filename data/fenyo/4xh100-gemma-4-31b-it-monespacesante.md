# fenyo/4xH100-gemma-4-31B-it-MonEspaceSante

## Resumen

`fenyo/4xH100-gemma-4-31B-it-MonEspaceSante` es un ajuste fino del modelo `google/gemma-4-31B-it` realizado por el desarrollador independiente Alexandre Fenyo. El objetivo es internalizar en los pesos la FAQ oficial del servicio público sanitario francés « Mon espace santé » (88 pares pregunta-respuesta) mediante una técnica de destilación de contexto: un profesor —el mismo Gemma 4 31B con la FAQ completa en el prompt de sistema— genera respuestas que un alumno aprende a reproducir sin necesidad de RAG ni de documento en contexto.

El modelo tiene 31.273.086.512 parámetros (31,3 B) en formato safetensors, un repositorio de 64,5 GB y está especializado exclusivamente en francés. El ajuste se aplicó como un LoRA de rango 64 fusionado en los pesos base, entrenado durante una época sobre 48.203 ejemplos en aproximadamente una hora con 4 GPU H100.

Su relevancia es metodológica: demuestra que la destilación de contexto permite a un modelo de 31 B igualar (80,5 % frente a 79,8 % en estrictez) el rendimiento de un sistema con la documentación completa en el prompt, eliminando el coste de tokens de contexto y la latencia asociada al RAG. Es un modelo de demostración e investigación, no un producto sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), ajuste fino LoRA de rango 64 fusionado |
| Parametros totales | 31.273.086.512 (31,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | Frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it`, un transformer decoder-only denso de 31,3 B parámetros. Sobre él se aplicó un LoRA de rango 64 que posteriormente se fusionó en los pesos base, de modo que el artefacto publicado es un modelo completo, no un adaptador. El entrenamiento se realizó sin modo de razonamiento (« thinking » desactivado), y el autor indica explícitamente que la inferencia debe ejecutarse también con el thinking desactivado.

La metodología es destilación de contexto sobre el dataset `fenyo/4xH100-MonEspaceSante-distillation-contexte`. Un profesor (el Gemma 4 31B base con la FAQ entera en el prompt de sistema) respondió a decenas de miles de preguntas generadas: reformulaciones de las preguntas oficiales, detalles concretos, falsas presuposiciones, preguntas que cruzan varias entradas de la FAQ, diálogos multi-turno, preguntas vecinas sin respuesta y consultas fuera de alcance. El alumno, sin acceso a la FAQ, aprendió a reproducir esas respuestas. Para las reformulaciones de la pregunta oficial, la diana fue la respuesta oficial de la FAQ. El conjunto de entrenamiento consta de 48.203 ejemplos, una época, aproximadamente una hora en 4 × H100. El prompt de sistema usado en entrenamiento es `Tu es l'assistant de Mon espace santé.`

## Capacidades

- Generación de texto conversacional especializada en el dominio « Mon espace santé »: responde sobre trámites, cuenta, datos de salud, profesionales, derechos y funcionamiento del servicio.
- Respuesta sin RAG: reproduce el conocimiento de la FAQ directamente desde los pesos, sin documento en contexto.
- Manejo de reformulaciones: responde correctamente a variantes de las preguntas oficiales nunca vistas durante el entrenamiento.
- Detección de falsas presuposiciones y preguntas trampa dentro del dominio.
- Preguntas que cruzan varias entradas de la FAQ (razonamiento multi-entrada).
- Diálogos multi-turno dentro del dominio sanitario-administrativo.
- Reconocimiento de preguntas vecinas sin respuesta en la FAQ: el modelo no inventa fuera de alcance (0 % de invención fuera de perímetro según el autor).
- Respuesta a preguntas generales cuando no se aplica el prompt de sistema del dominio.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking (este último debe desactivarse).

## Casos de uso

- Asistente de FAQ sanitario-administrativo: desplegado como chatbot que responde sobre « Mon espace santé » sin recuperar documentos en cada consulta, lo que reduce latencia y coste de tokens de contexto frente a una arquitectura RAG equivalente.
- Eliminación de la capa de recuperación en producción: al llevar la FAQ en los pesos, se suprime la infraestructura de índice vectorial y el riesgo de recuperar fragmentos erróneos; útil en entornos con recursos limitados.
- Atención al ciudadano en oficinas sanitarias: respuestas rápidas y consistentes sobre trámites, con la garantía de que el modelo declina responder fuera de alcance en lugar de inventar.
- Base para investigación en destilación de contexto: referencia reproducible (scripts y journal públicos) para estudiar cómo internalizar un corpus documental en un modelo de 31 B.
- Punto de partida para ajustes de dominio en otros servicios públicos: la receta (profesor con corpus completo, alumno sin él, datos sintéticos diversificados) es transferible a otros dominios administrativos.
- Evaluación comparativa de pipelines RAG frente a conocimiento internalizado: permite medir en igualdad de condiciones si el ajuste fino supera al RAG en estrictez, completitud y fidelidad.
- Demo educativa de ajuste fino con LoRA fusionado sobre Gemma 4: ejemplo completo de entrenamiento en 4 × H100 en una hora con dataset y métricas publicados.

## Benchmarks y rendimiento

Evaluación del alumno sin la FAQ, con juez Qwen3.8-27B, sobre 704 preguntas de test congeladas (reformulaciones nunca vistas):

| Modelo | Estrictez | Completitud | Fidelidad a la FAQ | Cultura general | Invención fuera de perímetro |
|---|---|---|---|---|---|
| Este modelo | 80,5 % | 75,7 % | 97,6 % | 100 % | 0 % |
| Gemma 4 31B con la FAQ en contexto | 79,8 % | 79,0 % | 99,6 % | no disponible | 0 % |
| Gemma 4 31B sin entrenamiento | 9,4 % | 26,2 % | 3,1 % | 100 % | 0 % |

Sobre 600 preguntas variadas (detalles, trampas, preguntas cruzadas, situaciones): 96,0 % de respuestas fieles a la FAQ. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Entrenamiento de referencia: 4 × H100, una época sobre 48.203 ejemplos, aproximadamente una hora.
- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa para un modelo denso de 31,3 B, en BF16/FP16 los pesos ocupan unos 62,5 GB, lo que exige múltiples GPU o cuantización.
- GPU recomendadas: H100, A100 80 GB (una o varias según precisión), o configuraciones multi-GPU para BF16.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16; requeriría cuantización agresiva (no publicada en el repositorio) para aproximarse.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama previa conversión a GGUF (no incluida en el repositorio). El thinking debe desactivarse en la configuración de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 31,3 B | no disponible | FAQ « Mon espace santé » (fr) | Apache 2.0 | Hugging Face |
| google/gemma-4-31B-it | 31,3 B | no disponible | Propósito general, instruction-tuned | Gemma (condiciones de Google) | Hugging Face |
| Gemma 4 31B + FAQ en contexto (RAG/prompt) | 31,3 B | limitado por la ventana | Mismo dominio, sin ajuste | Gemma | Configuración local |

La comparación relevante es contra el modelo base: el ajuste multiplica por más de 8 la estrictez (9,4 % → 80,5 %) y por más de 30 la fidelidad a la FAQ (3,1 % → 97,6 %) en el dominio, igualando al esquema con la FAQ en contexto (79,8 % de estrictez) pero con menor completitud (75,7 % frente a 79,0 %).

## Limitaciones y advertencias

- Conocimiento congelado: solo conoce el contenido de la FAQ a la fecha de su recolección; no se actualiza con cambios del servicio oficial.
- Puede equivocarse: no sustituye al sitio oficial ni a un profesional sanitario. El autor lo etiqueta como modelo de demostración e investigación.
- Idioma: entrenado y evaluado solo en francés; el rendimiento en otros idiomas no está garantizado.
- Thinking obligatoriamente desactivado: el entrenamiento se hizo sin modo de razonamiento; activarlo puede degradar la calidad de las respuestas.
- Dependencia del prompt de sistema: el comportamiento óptimo se obtiene con `Tu es l'assistant de Mon espace santé.`; sin él responde a preguntas generales, lo que puede no ser deseable en producción.
- Sin soporte de tool calling, agentes, visión ni audio.
- Riesgo de alucinación fuera del dominio: el autor reporta 0 % de invención fuera de perímetro en su evaluación, pero la métrica procede de un juez automático (Qwen3.8-27B) y no de revisión humana exhaustiva.
- Licencia Apache 2.0 declarada por el autor, pero el modelo deriva de Gemma 4, cuyas condiciones de uso de Google pueden aplicar en la práctica; conviene verificar la compatibilidad antes de un uso comercial.
- Sin descargas ni validación comunitaria en el momento de la ficha (0 descargas, 0 likes): no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fenyo/4xH100-gemma-4-31B-it-MonEspaceSante
- Dataset de destilación: https://huggingface.co/datasets/fenyo/4xH100-MonEspaceSante-distillation-contexte
- Repositorio con scripts, journal y resultados: https://github.com/AlexandreFenyo/AI-Experiments-4xH100 (carpeta `exp01-mes-distillation-contexte`)
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
