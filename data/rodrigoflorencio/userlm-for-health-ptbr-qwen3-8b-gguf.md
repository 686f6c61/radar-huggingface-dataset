# RodrigoFlorencio/UserLM-for-health-PTBR-Qwen3-8B-GGUF

## Resumen

UserLM-for-health-PTBR-Qwen3-8B-GGUF es una versión cuantizada en formato GGUF de un modelo de lenguaje especializado en simular pacientes del ámbito sanitario en portugués brasileño. Lo desarrolla RodrigoFlorencio a partir de Qwen/Qwen3-8B-Base, sobre el que se aplicó un ajuste fino LoRA posteriormente fusionado con los pesos base. El modelo no actúa como asistente conversacional: su función es generar la pregunta que formularía un paciente dado un intent clínico (una patología o una descripción de síntomas), continuando el texto justo después del encabezado `<|im_start|>user`.

La relevancia del modelo reside en su enfoque de "inversión del diálogo": en lugar de responder consultas médicas, produce consultas realistas para alimentar pipelines de evaluación, generación de datos sintéticos o pruebas de sistemas de triaje y atención al paciente. Se entrenó con más de 33.000 dudas reales sobre patologías y síntomas extraídas de páginas públicas brasileñas, recopiladas en el dataset `RodrigoFlorencio/duvidas-saude-ptbr`.

Arquitectura transformer de Qwen3 con 8.190.735.360 parámetros totales, distribuida en dos cuantizaciones (Q4_K_M y Q6_K) pensadas para inferencia en CPU mediante llama.cpp, con compatibilidad con Ollama y LM Studio. La licencia es Apache 2.0 y el idioma soportado es exclusivamente portugués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), ajuste LoRA fusionado sobre Qwen3-8B-Base |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (~5,0 GB), Q6_K (~6,7 GB) |
| Idiomas soportados | Portugues (pt), variante brasileña |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos base en safetensors en el modelo LoRA de origen |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer denso de aproximadamente 8.190 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA orientado a la tarea de simulación de usuario (User Language Model), y posteriormente los adaptadores se fusionaron en los pesos del modelo base para producir el checkpoint consolidado. La versión publicada en este repositorio es la conversión a GGUF de ese checkpoint fusionado, con dos niveles de cuantización K-quant.

El entrenamiento se realizó con más de 33.000 dudas reales sobre patologías y síntomas recogidas de páginas públicas de internet en Brasil, según indica la model card. El procedimiento sigue la receta descrita en el artículo arXiv 2510.06552 ("Flipping the Dialogue"), que plantea entrenar modelos para generar el turno del usuario en lugar del turno del asistente. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica principal no está en la arquitectura, sino en el paradigma de uso: el modelo se invoca en modo de generación cruda (raw completion) con un prompt que termina en `<|im_start|>user`, de modo que continúa el texto como si fuera el paciente. La model card documenta guardrails recomendados para estabilizar la salida: temperatura 1.0, top_p 0.8, parada en `<|im_end|>` y `<|im_start|>`, `num_predict` en torno a 110, eliminación de puntos de código no latinos, rechazo de artefactos de plantilla, corte en la última frase completa y remuestreo en caso de duplicados.

## Capacidades

- Generación de preguntas de paciente en portugués brasileño coloquial a partir de un intent clínico (patología o descripción de síntomas).
- Simulación de usuario para diálogos sanitarios: produce el turno del paciente, no la respuesta del asistente.
- Condicionamiento mediante un campo de sistema (`system`) que define la patología o los síntomas objetivo.
- Generación de datos sintéticos de consultas médicas realistas para entrenamiento o evaluación.
- Ejecución local en CPU mediante llama.cpp, con soporte para Ollama y LM Studio.
- Compatibilidad con endpoints: API raw de Ollama (`/api/generate` con `raw: true`) y endpoint de completions compatible con OpenAI en LM Studio (`/v1/completions`).
- No soporta tool calling ni function calling según la información disponible.
- No soporta razonamiento multi-paso orientado a agentes; su tarea es de generación de un único turno de usuario.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) según la información disponible.
- Capacidad multilingüe limitada al portugués; no se documentan otros idiomas.

## Casos de uso

- Evaluación de sistemas de triaje sanitario: el modelo genera consultas de pacientes variadas y realistas que permiten probar la robustez de clasificadores de síntomas o motores de triaje ante formulaciones coloquiales y ambiguas.
- Generación de datos sintéticos para entrenamiento: se pueden producir miles de preguntas de paciente condicionadas por patología para aumentar datasets de conversación médica en portugués sin exponer datos reales de pacientes.
- Pruebas de regresión de chatbots clínicos: en pipelines de CI/CD, el modelo alimenta al chatbot bajo prueba con entradas de usuario generadas dinámicamente, permitiendo detectar respuestas inseguras o fuera de dominio.
- Simulación de usuarios en investigación de interacción: estudios de UX o de conversación médico-paciente pueden usar el modelo para recrear turnos de paciente reproducibles y parametrizables por intent.
- Aumento de datasets de PNL clínica en portugués: combinado con un modelo asistente, permite construir diálogos completos sintéticos (paciente generado por este modelo, respuesta generada por otro) para tareas de clasificación o extracción de información.
- Pruebas de carga y latencia de asistentes conversacionales: al ejecutarse en CPU con llama.cpp, permite generar tráfico de consultas realista en entornos sin GPU para validar el comportamiento de servicios de atención al paciente.
- Docencia y formación: generación de ejemplos de preguntas de pacientes para materiales de formación en comunicación clínica en portugués brasileño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q4_K_M requiere aproximadamente 8 GB de RAM; Q6_K requiere aproximadamente 10 GB de RAM, según la model card.
- El modelo está pensado para ejecución en CPU mediante llama.cpp; no se documentan requisitos de GPU.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) en la información disponible.
- Por tamaño (5,0-6,7 GB en GGUF), cabría en GPU de consumo con 8-12 GB de VRAM, aunque esta posibilidad no está validada en la documentación del autor.
- Opciones de despliegue documentadas: llama.cpp, Ollama (mediante `Modelfile` y `ollama create`) y LM Studio (modo Completion raw).
- Integración con pipelines: `local_runner.py` del repositorio habla con Ollama en `http://localhost:11434`; también es posible usar el servidor de LM Studio en `http://localhost:1234/v1/completions`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UserLM-for-health-PTBR-Qwen3-8B-GGUF | 8,19 B | no disponible | Simulacion de paciente en pt-BR, salud | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3-8B-Base | ~8,19 B | no disponible | Modelo base generalista multilingue | Apache 2.0 | Safetensors en Hugging Face |
| UserLM-for-health-PTBR-Qwen3-8B-LoRA | ~8,19 B (base + LoRA) | no disponible | Version LoRA y API/Spaces del mismo modelo | Apache 2.0 | LoRA en Hugging Face |

No se dispone de información sobre otros modelos comparables de simulación de usuario en portugués para el ámbito sanitario.

## Limitaciones y advertencias

- El modelo no responde como asistente: usar la interfaz de chat estándar de Ollama o LM Studio produce resultados incorrectos. Debe invocarse en modo de generación cruda con el prompt exacto que termina en `<|im_start|>user`.
- No proporciona orientación médica y no es una herramienta clínica; la model card lo indica explícitamente.
- Riesgo de alucinación: al generar preguntas de paciente, puede producir síntomas, patologías o formulaciones clínicamente incoherentes o inventadas.
- Sesgos potenciales derivados del corpus de origen: las dudas se recopilaron de páginas públicas brasileñas, lo que puede infrarrepresentar ciertos perfiles demográficos o sobrerrepresentar expresiones coloquiales concretas.
- Limitación idiomática: solo se documenta portugués (pt); no se garantiza un comportamiento correcto en otros idiomas.
- Longitud de contexto no documentada; el uso previsto es de generación corta (`num_predict` en torno a 110 tokens), por lo que no debe emplearse para contextos largos.
- Requiere aplicar guardrails (parada en `<|im_end|>` y `<|im_start|>`, limpieza de codepoints no latinos, corte en frase completa, remuestreo ante duplicados) para evitar artefactos de plantilla y salidas degeneradas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre idoneidad clínica; cualquier uso en producción sanitaria debe pasar por validación humana y cumplimiento normativo.
- El repositorio tiene un volumen de descargas muy bajo (21) y un único like en el momento de la consulta; no hay evidencia de validación independiente más allá de la prueba de generación en llama.cpp CPU indicada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RodrigoFlorencio/UserLM-for-health-PTBR-Qwen3-8B-GGUF
- Versión LoRA y API/Spaces: https://huggingface.co/RodrigoFlorencio/UserLM-for-health-PTBR-Qwen3-8B-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/RodrigoFlorencio/duvidas-saude-ptbr
- Artículo de referencia (arXiv 2510.06552, "Flipping the Dialogue"): https://arxiv.org/abs/2510.06552
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Ejecución local con Ollama (prompt preconfigurado de ML Intern): https://hf.co/chat?mode=ml-intern&prompt=Me%20ajudar%20a%20rodar%20o%20UserLM-for-health-PTBR%20localmente%20com%20Ollama
