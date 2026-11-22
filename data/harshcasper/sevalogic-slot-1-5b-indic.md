# harshcasper/sevalogic-slot-1.5b-indic

## Resumen

SevaLogic Vernacular Edge Model (`sevalogic-slot-1.5b-indic`) es un ajuste fino del modelo Qwen2.5-1.5B-Instruct desarrollado por el usuario harshcasper, orientado a tareas de extracción de datos estructurados y explicación de resultados en el ámbito de la asistencia social y la elegibilidad de prestaciones públicas. El modelo se ha entrenado con LoRA en bf16 sobre el dataset `harshcasper/sevalogic-east-vernacular-15k`, compuesto por 10.410 diálogos disjuntos en bengalí, banglish, hindi, hinglish, santali (en escritura Ol Chiki y en romanización) e inglés.

La propuesta técnica se apoya en una arquitectura neuro-simbólica sin reentrenamiento: el modelo solo se encarga de dos tareas lingüísticas concretas, `slot_extract` (convertir una frase hablada del ciudadano en campos JSON tipados de `CitizenProfile` más una pregunta de seguimiento) y `proof_explain` (narrar de forma comprensible los resultados de un solver determinista con cifras exactas en rupias y advertencias). Las fórmulas de elegibilidad legal nunca residen en los pesos, sino que se ejecutan en un solver TypeScript verificado con Z3 (`rulepack.v1.json`) en menos de 1 ms.

El interés del modelo radica en su enfoque de despliegue en el borde (edge) para contextos de baja conectividad y lenguas vernáculas del este de la India, con un tamaño de 1.543.714.304 parámetros que lo hace viable en hardware modesto. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors y GGUF Q4_K_M facilitan su integración en entornos de producción con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (safetensors), GGUF Q4_K_M (4 bits) |
| Idiomas soportados | bn (bengalí), hi (hindi), sat (santali), en (inglés); incluye variantes banglish, hinglish y santali romanizado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de 1.500 millones de parámetros con atención causal estándar. Sobre esta base se aplicó un ajuste fino con LoRA de rango 16 (`lora_alpha=32`, `lora_dropout=0.05`) sobre las siete proyecciones de atención y MLP, en precisión bf16. El entrenamiento se ejecutó durante 2 épocas con batch efectivo de 16, programación de learning rate coseno con pico en `2e-4`, alcanzando una pérdida final de `0.313` tras 650 pasos en una GPU NVIDIA L4 durante 90,62 minutos.

El dataset de entrenamiento, `harshcasper/sevalogic-east-vernacular-15k`, contiene 10.410 diálogos estrictamente disjuntos que cubren bengalí, banglish, hindi, hinglish, santali Ol Chiki, santali romanizado e inglés. La innovación principal no reside en la arquitectura del modelo, sino en el diseño neuro-simbólico: el modelo actúa como interfaz lingüística hacia un solver determinista externo verificado con Z3, de modo que las decisiones de elegibilidad legal se delegan a código simbólico y no a los pesos de la red. Esto elimina la posibilidad de alucinación en las cifras de prestaciones, aunque, según los propios resultados del autor, la explicación textual de dichas cifras sigue siendo imperfecta.

## Capacidades

- Extracción de slots (`slot_extract`): convierte enunciados hablados de ciudadanos en campos JSON tipados de `CitizenProfile` y genera una pregunta de seguimiento.
- Explicación de pruebas (`proof_explain`): narra de forma comprensible los paquetes de solución deterministas, incluyendo cifras exactas en rupias y advertencias.
- Generación de JSON estructurado válido en el 100 % de los casos evaluados según el autor.
- Comprensión multilingüe de lenguas vernáculas del este de la India: bengalí, hindi, santali (Ol Chiki y romanizado) e inglés, con soporte de code-mixing (banglish, hinglish).
- Diálogo conversacional multi-turno (heredado del modelo base Qwen2.5-1.5B-Instruct).
- No incluye visión, audio ni tool calling nativo documentado en la información disponible.

## Casos de uso

- Extracción de perfiles de ciudadanos en oficinas de bienestar social: el modelo convierte una descripción oral del solicitante (edad, ingresos, composición familiar, ocupación) en un `CitizenProfile` JSON estructurado, listo para alimentar el solver de elegibilidad.
- Asistencia en lengua vernácula para solicitantes de prestaciones: al soportar bengalí, hindi y santali, permite atender a usuarios que no dominan el inglés ni el hindi estándar, reduciendo barreras lingüísticas en la administración pública.
- Explicación de resoluciones de elegibilidad: dado un bundle de solución del solver, el modelo genera una narración en lenguaje natural con las cifras exactas en rupias y las advertencias aplicables, facilitando la transparencia hacia el ciudadano.
- Despliegue en el borde y modo offline: gracias al GGUF Q4_K_M, puede ejecutarse en CPU en oficinas remotas o dispositivos sin GPU dedicada, con un peso aproximado de 4 bits por parámetro.
- Validación de formularios y entrevistas asistidas: el modelo puede formular preguntas de seguimiento cuando faltan datos en el `CitizenProfile`, guiando al agente social en la recogida de información.
- Prototipado de asistentes conversacionales multilingües: sirve como base para experimentar con pipelines neuro-simbólicos donde el LLM solo interpreta y explica, mientras la lógica de negocio reside en código verificable.
- Integración en sistemas de gestión de casos: el JSON de salida puede validarse contra un esquema y pasarse directamente al solver TypeScript, permitiendo auditorías deterministas de cada decisión.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre `eval_1k.jsonl` (280 filas estratificadas y disjuntas):

| Tarea | Métrica | Base Qwen2.5-1.5B-Instruct | Fine-tuned sevalogic-slot-1.5b-indic |
|---|---|---|---|
| `slot_extract` | JSON válido (%) | 0,0 % | 100,0 % |
| `slot_extract` | Micro Slot F1 (%) | 0,0 % | 73,78 % |
| `slot_extract` | Tasa de campos inválidos (%) | 0,0 % | 0,21 % |
| `proof_explain` | Total de beneficio exacto en INR (%) | 0,0 % | 1,43 % |
| `proof_explain` | Cifras en rupias sin alucinación (%) | 77,14 % | 55,0 % |
| `proof_explain` | Salida no vacía (%) | 100,0 % | 100,0 % |

Los datos muestran una mejora drástica en la validez del JSON y en la extracción de slots, pero un deterioro notable en la explicación de pruebas: la tasa de cifras sin alucinación baja del 77,14 % al 55,0 % y solo el 1,43 % de las explicaciones reproducen el total exacto. El autor no publica resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,1 GB solo para los pesos (1.543.714.304 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para inferencia cómoda.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 1 GB para los pesos, con un consumo total típico de 1,5-2,5 GB.
- GPU recomendadas: NVIDIA L4 (utilizada en el entrenamiento), RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A10, A100; cualquier GPU con al menos 4 GB de VRAM puede ejecutar la versión cuantizada.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares; también en CPU mediante GGUF.
- Opciones de despliegue: `transformers` con `device_map="auto"`, llama.cpp u Ollama para el GGUF, vLLM o TGI para serving con safetensors; el autor indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada; el solver externo se ejecuta en menos de 1 ms según el autor, pero no se documentan métricas de latencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| sevalogic-slot-1.5b-indic | 1.543.714.304 | no disponible | Apache 2.0 | bn, hi, sat, en | Fine-tune especializado en slots y explicación neuro-simbólica |
| Qwen2.5-1.5B-Instruct (base) | 1.500 millones | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | multilingüe amplio | Modelo generalista; JSON válido 0 % en la evaluación del autor |
| Qwen2.5-3B-Instruct | 3.000 millones | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (variantes) | multilingüe amplio | Mayor capacidad general, pero requiere más VRAM |
| Llama 3.2 1B Instruct | 1.200 millones | 128.000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | multilingüe (8 idiomas oficiales) | No cubre santali ni variantes vernáculas del este de la India |

La comparativa con el modelo base es la más relevante: el fine-tune sacrifica capacidades generales y precisión en la explicación de cifras a cambio de una estructuración JSON perfecta y una mejora sustancial en la extracción de slots. No se dispone de comparaciones publicadas frente a otros modelos especializados en lenguas vernáculas indias.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en dos tareas (`slot_extract` y `proof_explain`); su uso como modelo generalista degradará el rendimiento respecto al base Qwen2.5-1.5B-Instruct.
- La tasa de cifras en rupias sin alucinación es solo del 55,0 % en `proof_explain`, inferior al 77,14 % del modelo base; no debe confiarse en la narración para decisiones económicas sin validación contra el solver.
- Solo el 1,43 % de las explicaciones reproducen el total exacto de beneficio, lo que limita su uso autónomo en comunicación oficial de importes.
- El modelo no contiene fórmulas de elegibilidad legal; cualquier decisión debe ejecutarse en el solver Z3 verificado. Usar las salidas del LLM como fuente de verdad legal es un riesgo grave.
- Cobertura lingüística limitada a bengalí, hindi, santali e inglés (con sus variantes code-mixed); otras lenguas indias no están soportadas.
- No se documentan sesgos específicos, pero al entrenarse sobre diálogos de solicitantes de prestaciones puede reflejar sesgos socioeconómicos o de género presentes en el dataset.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre exactitud legal ni sobre el cumplimiento normativo en jurisdicciones concretas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados publicados.
- La longitud de contexto no está documentada en la información disponible; se desconoce si se mantiene la ventana del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshcasper/sevalogic-slot-1.5b-indic
- Dataset de entrenamiento: https://huggingface.co/datasets/harshcasper/sevalogic-east-vernacular-15k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Perfil del autor: https://huggingface.co/harshcasper
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
