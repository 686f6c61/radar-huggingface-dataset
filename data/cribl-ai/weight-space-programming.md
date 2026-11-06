# cribl-ai/Weight-Space-Programming

## Resumen

Weight-Space-Programming es un artefacto de investigación publicado por Cribl AI Research Lab (cuenta `cribl-ai`) en HuggingFace, no un modelo generativo al uso. Contiene el material experimental de un estudio sobre interpretabilidad y auditoría de modelos en el espacio de pesos: se evalúa si un LLM frontera (denominado "GPT-6 Astra" en la model card) puede leer y reparar directamente los pesos de un modelo de producción, `cribl-decision-2-mini`, un fine-tune de Qwen3.5-0.8B que responde preguntas de opción múltiple sobre TI y seguridad.

El trabajo replica sobre un modelo real una idea previa demostrada solo en redes pequeñas y purpose-trained: que un LLM puede inspeccionar matrices de pesos mediante álgebra lineal y razonar sobre su estructura. Los resultados son matizados: Astra identifica correctamente la mecánica (formato de tarea, rango exacto de una LoRA, capas modificadas) pero no la semántica (dominio de seguridad, datos de entrenamiento, categorías débiles), y repara sabotajes plantados con una tasa de recuperación del 100% y 94% en dos experimentos ciegos.

La relevancia actual es doble: por un lado, aporta evidencia empírica sobre los límites de la auditoría de modelos sin evaluación (sin forward passes); por otro, documenta una metodología reproducible con runs ciegos, checkpoints anonimizados y auditoría posterior de las transcripciones. El repositorio se distribuye bajo licencia Apache 2.0 y no incluye pesos de un modelo desplegable, sino el material del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al repositorio; el modelo auditado (`cribl-decision-2-mini`) es un fine-tune de Qwen3.5-0.8B con cabeza de scoring para opción múltiple |
| Parametros totales | No disponible para el repositorio; el modelo auditado es de 0,8B (Qwen3.5-0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card no declara idiomas; el estudio menciona datos predominantemente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible para el repositorio; el estudio opera sobre checkpoints en bfloat16 y matrices de pesos en formato tensor (safetensors presumiblemente, no confirmado) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino el material de un estudio de interpretabilidad. El sujeto de análisis es `cribl-decision-2-mini`, un fine-tune de Qwen3.5-0.8B que actúa como scorer de opción múltiple (pointer/ranker sobre posiciones marcadas, no generación de texto). Según la model card, la cabeza de scoring se entrenó desde cero ("su espectro de valores singulares no muestra resto de la inicialización") y el fine-tune se concentra en las capas tempranas: las capas 0–13 acumulan el 77% del cambio. Los datos de entrenamiento se componen aproximadamente de un 88% de datos generales de opción múltiple y un 12% de TI/seguridad.

El estudio evalúa a "GPT-6 Astra" como editor de pesos en tres series experimentales: lectura (R1–R3), reparación de sabotajes y mejora del modelo sano. Todos los runs son ciegos (checkpoints con IDs hexadecimales aleatorios, prompts sin nombres de producto, claves de respuesta solo accesibles a scripts de scoring), con registro completo y auditoría posterior que verifica la regla de "sin forward passes". En R2 se detecta un fine-tune LoRA de rango 16 fusionado en los pesos base mediante la firma de precisión: la base cae exactamente en la rejilla de bfloat16 mientras el fine-tune presenta perturbaciones de mayor precisión, y las SVD de las matrices de diferencia muestran exactamente 16 valores singulares no despreciables por módulo.

## Capacidades

- Lectura estructural de pesos: identificación del formato de tarea (scorer de opción múltiple) con confianza 99/100 en condición "hard" (embeddings y filas de salida eliminados, sin tokenizer).
- Detección de método de fine-tuning: identificación de una LoRA de rango 16 fusionada en las proyecciones de atención, con cadena de razonamiento basada en 114 tensores modificados frente a 207 idénticos a nivel de bit.
- Reparación de sabotajes: recuperación del 100% y 94% en dos sabotajes secretos; localización y sustracción exacta de una corrupción de rango 1 plantada, consumiendo 1 de 5 forward passes disponibles.
- Mejora del modelo sano: ganancia máxima de +0,96 puntos, creciente con el presupuesto de passes pero modesta.
- Limitación documentada: incapacidad de leer la semántica del dominio (seguridad/TI) en 10 runs a lo largo de 3 experimentos, y correlación de Spearman de 0,09 al predecir categorías débiles sin evaluación.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo en el material disponible.

## Casos de uso

- Auditoría de seguridad de modelos fine-tuneados: el estudio demuestra que un editor puede detectar y sustraer corrupciones plantadas en los pesos (rango 1) con precisión exacta, lo que resulta aplicable a pipelines de verificación de artefactos antes de desplegarlos en producción.
- Verificación de procedencia de checkpoints: la técnica de R2 permite distinguir un fine-tune fusionado de su base comparando la rejilla de precisión (bfloat16 frente a perturbaciones de mayor precisión) y las SVD de las matrices de diferencia, útil para supply-chain security de modelos.
- Detección de LoRA y su rango: la lectura del rango efectivo (16 valores singulares no despreciables por módulo) permite reconstruir la configuración de fine-tuning de un checkpoint sin acceso a los metadatos de entrenamiento.
- Investigación en interpretabilidad mecanicista: el material sirve como benchmark reproducible para estudiar qué información semántica es recuperable del espacio de pesos y cuál no, con protocolo ciego y auditoría de transcripciones.
- Reparación de modelos dañados en producción: ante un checkpoint con corrupción conocida, el enfoque de sustracción directa en el espacio de pesos evita reentrenar, con un coste de un único forward pass de verificación.
- Evaluación de la viabilidad de "auditoría sin evaluación": el resultado negativo (Spearman 0,09) es un caso de uso en sí mismo para equipos que planean sustituir benchmarks por inspección de pesos, ya que documenta que la predicción de categorías débiles no es fiable a esta escala.

## Benchmarks y rendimiento

| Experimento | Metrica | Resultado |
|---|---|---|
| R1 — Lectura de tarea (condición hard) | Confianza en identificacion de tarea | 99/100 (correcta: scorer de opcion multiple) |
| R1 — Lectura de dominio | Deteccion del dominio de seguridad | 0/10 runs (no detectado) |
| R2 — Deteccion de fine-tune | Identificacion de LoRA rango 16 fusionada | Correcta, confianza 99/100 |
| R2 — Lectura de dominio | Confianza en asignar dominio nombrado | 0/100 |
| R3 — Prediccion de categorias debiles | Correlacion de Spearman con accuracy real | 0,09 |
| Reparacion — Sabotaje 1 | Recuperacion | 100% |
| Reparacion — Sabotaje 2 | Recuperacion | 94% |
| Mejora — Modelo sano | Ganancia maxima | +0,96 puntos |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El repositorio no contiene pesos de un modelo desplegable, por lo que no aplican requisitos de VRAM para inferencia del artefacto en sí.
- El modelo auditado (`cribl-decision-2-mini`, 0,8B) es ejecutable en GPU de consumo: una RTX 4090 o incluso GPUs con 8–12 GB de VRAM en bfloat16 o cuantización de 8 bits.
- El editor de pesos ("GPT-6 Astra") es un LLM frontera no disponible públicamente; los experimentos requirieron acceso a dicho modelo y a un sandbox de Python sobre los tensores.
- Opciones de despliegue para el modelo auditado: vLLM, llama.cpp, Ollama o TGI, aunque la model card no documenta configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Weight-Space-Programming (este repo) | No aplica | No disponible | Estudio de interpretabilidad y auditoría de pesos | Apache 2.0 | HuggingFace, material de estudio |
| cribl-decision-2-mini | 0,8B | No disponible | Scorer de opcion multiple TI/seguridad | No disponible | HuggingFace, fine-tune de Qwen3.5-0.8B |
| Estudio previo de weight-space programming (blog rikiyat) | No disponible | No disponible | Lectura/escritura de pesos en redes pequenas purpose-trained | No disponible | Blog publico |

No se dispone de modelos comparables directos en la misma categoria (artefactos de investigacion sobre edicion de pesos) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es material de investigación, no un modelo listo para producción; no debe tratarse como un checkpoint desplegable.
- La lectura semántica del espacio de pesos falló de forma consistente: en 10 runs y 3 experimentos el editor nunca identificó el dominio de seguridad, pese a que este aparecía en cada ejemplo de entrenamiento.
- La predicción de categorías débiles sin evaluación es prácticamente nula (Spearman 0,09), con casi todo el error concentrado en la categoría "other".
- La señal de dominio es real pero tenue: al ordenar los 248.320 embeddings por desplazamiento tras el fine-tune, "security" y "telemetry" caen solo en el top 7–20%, por debajo de palabras de formato como "answer" o "question".
- La mejora del modelo sano es modesta (+0,96 puntos), lo que sugiere que a esta escala la edición de pesos puede eliminar obstáculos pero no añadir conocimiento nuevo; para ello sigue siendo necesario entrenar con más datos del dominio.
- Los resultados dependen de un editor propietario ("GPT-6 Astra") no disponible públicamente, lo que limita la reproducibilidad externa.
- La licencia Apache 2.0 cubre el material del repositorio; el modelo auditado y el editor pueden tener condiciones distintas no detalladas.
- No se documentan sesgos, idiomas soportados ni restricciones de uso comercial específicas más allá de la licencia declarada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cribl-ai/Weight-Space-Programming
- Modelo auditado: https://huggingface.co/cribl-ai/cribl-decision-2-mini
- Estudio previo de referencia: https://rikiyat.github.io/blog/weight-space-programming/
- Cribl AI Research Lab: https://cribl.io (organización, sin enlace directo confirmado en la información)
