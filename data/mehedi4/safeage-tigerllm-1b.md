# mehedi4/SafeAge-TigerLLM-1B

## Resumen

SafeAge-TigerLLM-1B es un adaptador LoRA con una cabeza de clasificación binaria entrenada sobre el modelo base TigerLLM-1B-it (arquitectura `gemma3_text`, 1B parámetros) para la tarea de clasificación de seguridad contextual definida en el trabajo *SafeAge: Context-Sensitive Safety Classification for Bangla LLMs and Agentic Systems across Four Language Forms*. Lo publica el usuario mehedi4 como "baseline adaptado" de comparación dentro de ese estudio, no como modelo de propósito general.

El modelo recibe una petición completa (texto en bengalí, bengalí-inglés mixto, banglish o inglés alineado) y emite una decisión binaria: `allow` (clase 0, benigno) o `block` (clase 1, ataque o violación de permisos). La regla de decisión publicada fija el umbral de bloqueo en una probabilidad softmax de la clase 1 mayor o igual a 0,08, seleccionado sobre validación y congelado para test.

Su relevancia es acotada y muy específica: sirve como referencia reproducible para evaluar sistemas de moderación y seguridad en un entorno lingüístico poco cubierto (bengalí y sus variantes de código mezclado) y para comparar contra SafeAge Guard, cuyo backbone es Qwen3-1.7B. No es un modelo generativo desplegable por sí solo: requiere el checkpoint base fijado y un cargador explícito que restaure los pesos LoRA y la cabeza `score`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only `gemma3_text` (Gemma3ForCausalLM) con cabeza de clasificación de secuencia (`SEQ_CLS`) de 2 etiquetas y adaptador LoRA |
| Parametros totales | 1B en el modelo base (aproximado, según denominación del checkpoint); el adaptador añade 13.048.064 parámetros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrada máxima de 512 tokens en el pipeline de clasificación (truncado por la derecha) |
| Tipos de cuantizacion | No disponible (la evaluación original se ejecutó en FP32; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Bengalí (bn) e inglés (en), incluyendo bengalí-inglés mixto y banglish |
| Licencia | `cc-by-4.0-and-gemma-terms` (CC BY 4.0 combinada con los términos de Gemma) |
| Formato de pesos | Safetensors (adaptador PEFT LoRA + cabeza `score`), cargado vía `peft` y `transformers` |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT sobre el checkpoint fijado `md-nishat-008/TigerLLM-1B-it` en la revisión `49c2001b637a84d997dbe34302fe527d70782097`, cuya configuración real es `gemma3_text`. Sobre el backbone se aplica LoRA con rango 16, alpha 32 y dropout 0,05, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, más una cabeza de clasificación binaria entrenada (`score`). El entrenamiento usó AdamW con tasa de aprendizaje 1e-4, tamaño de lote efectivo 32, semilla 42, precisión FP32 y longitud máxima de 512 tokens, con 5 épocas completadas y selección de checkpoint por mayor macro F1 de validación en umbral 0,5.

Los datos provienen del conjunto SafeAge: 24.508 peticiones derivadas de 6.127 casos en cuatro formas lingüísticas, particionadas en 22.096 de entrenamiento, 1.208 de validación y 1.204 de test, manteniendo los grupos conectados dentro de una misma partición. Validación y test son casos construidos y revisados por los autores a partir de expansiones sintéticas de escenarios; dos autores anotaron subconjuntos disjuntos y revisaron repetidamente sus propios ejemplos, sin que se midiera un acuerdo de doble anotación independiente compartido. No se introduce arquitectura ni algoritmo de adaptación nuevo: la contribución del trabajo es el conjunto de datos, la adaptación supervisada específica de la tarea y la evaluación.

En inferencia, el cargador reproduce la ejecución original: FP32, atención SDPA, padding por la derecha, truncado explícito por la derecha a 512 tokens, padding a múltiplo de 8 y sin plantilla de chat aplicada a la petición cruda. El fichero de plantilla de chat retenido es procedencia del tokenizador, no forma parte del pipeline de clasificación.

## Capacidades

- Clasificación binaria de seguridad contextual (`allow` / `block`) sobre peticiones completas, no generación de texto libre.
- Cobertura de cuatro formas lingüísticas: bengalí, texto mixto bengalí-inglés, banglish y texto de referencia en inglés alineado.
- Distinción entre discusión de temas sensibles y tareas defensivas autorizadas (permitidas) frente a facilitación de daño y violaciones de permisos (bloqueadas).
- Detección orientada a sistemas agénticos: la clase de bloqueo incluye inyección de prompt y otras categorías, no solo prompt injection.
- Salida de probabilidad softmax por clase, lo que permite ajustar el punto de operación sobre un umbral distinto del 0,08 publicado.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento: es una cabeza de clasificación, no un modelo instructivo desplegable.
- Capacidad multilingüe limitada a bn y en; no se documenta cobertura de otras lenguas.

## Casos de uso

- Moderación previa a un agente conversacional en bengalí: el clasificador se coloca como filtro de entrada sobre la petición completa del usuario y bloquea intentos de inyección o de escalado de permisos antes de que lleguen al modelo generativo, aprovechando que la clase 1 agrupa ataques más allá del prompt injection.
- Pasarela de seguridad para asistentes con mezcla de código: en poblaciones que alternan bengalí e inglés o escriben banglish, el modelo evalúa la petición en su forma real sin normalización previa, algo que los filtros entrenados solo en inglés cubren mal.
- Triaje de solicitudes en soporte técnico: clasificar peticiones entrantes para separar consultas legítimas de intentos de manipulación del asistente, con el umbral 0,08 priorizando recall de bloqueo (92,19 %) sobre precisión (94,51 %).
- Evaluación comparativa de guardarraíles: al ser un baseline publicado con métricas y umbral congelados, sirve para medir la ganancia de sistemas alternativos (por ejemplo, SafeAge Guard con backbone Qwen3-1.7B) sobre el mismo conjunto de test de 1.204 peticiones.
- Investigación en seguridad multilingüe: reproducción de resultados con semilla 42, revisión fijada y artefactos verificados, útil para estudios que necesiten un punto de referencia auditable en una lengua de bajos recursos.
- Filtro en pipelines de despliegue con requisitos de latencia: un backbone de 1B en FP32 con entradas de 512 tokens es viable en GPU de una sola tarjeta para clasificación por lotes, aunque no se publican cifras de throughput.
- Análisis de riesgo en entornos educativos o de edad: con la advertencia explícita de que las etiquetas no miden idoneidad por edad, puede emplearse únicamente como señal complementaria de seguridad contextual, nunca como clasificador de edad.

## Benchmarks y rendimiento

Evaluación original sobre las 1.204 peticiones de test de SafeAge, con umbral 0,08:

| Metrica | Valor |
|---|---:|
| Accuracy | 95,10 % |
| Macro F1 | 94,73 % |
| Precision de bloqueo | 94,51 % |
| Recall de bloqueo | 92,19 % |
| Tasa de falsos positivos en benignos | 3,17 % |
| Brier score | 0,04758 |

Matriz de confusión: 732 verdaderos negativos, 24 falsos positivos, 35 falsos negativos y 413 verdaderos positivos. El análisis emparejado del artículo no establece una diferencia agrupada clara entre este baseline adaptado y SafeAge Guard. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y las métricas anteriores son mediciones de la ejecución original: la preparación de esta release no volvió a ejecutar inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma publicada. Como referencia de orden de magnitud, un backbone de 1B en FP32 ocupa aproximadamente 4 GB solo en pesos, más activaciones y la cabeza de clasificación; el adaptador LoRA añade unos 13 millones de parámetros.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con al menos ~8-12 GB de VRAM debería acomodar el modelo en FP32 con entradas de 512 tokens; no hay datos publicados de latencia ni throughput.
- GPU de consumo: previsiblemente viable en RTX 3090, RTX 4090 y tarjetas con 12 GB o más, aunque no está verificado en la documentación disponible.
- Opciones de despliegue: el cargador oficial `inference.py` (PEFT + transformers, FP32, SDPA). El repositorio declara compatibilidad con text-embeddings-inference y endpoints, pero la vía documentada y validada es el script explícito; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Restricción operativa: no debe usarse un pipeline de text-generation ni la cabeza aleatoria del modelo base; es obligatorio restaurar los pesos LoRA y la cabeza `score` mediante PEFT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SafeAge-TigerLLM-1B | 1B (base) + 13,05 M entrenables | 512 tokens | Clasificación binaria de seguridad contextual (bn, banglish, en) | cc-by-4.0-and-gemma-terms | HuggingFace, adaptador PEFT |
| SafeAge Guard | 1,7B (backbone Qwen3-1.7B) | No disponible | Clasificación binaria de seguridad contextual (misma tarea) | No disponible en la información proporcionada | HuggingFace (`mehedi4/SafeAge-Guard`) |
| TigerLLM-1B-it (base) | 1B | No disponible | Generación de texto instructiva en bengalí | No disponible en la información proporcionada | HuggingFace (`md-nishat-008/TigerLLM-1B-it`) |

El artículo señala que el análisis emparejado no establece una diferencia agrupada clara entre este baseline y SafeAge Guard, por lo que la elección entre ambos no puede basarse en los datos publicados. Frente al modelo base TigerLLM-1B-it, la diferencia es de tarea: el base genera texto y este artefacto clasifica.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar el checkpoint base fijado y usar el cargador explícito; un pipeline de text-generation o la cabeza sin adaptar producen resultados inválidos.
- Las etiquetas no miden idoneidad por edad pese al nombre "SafeAge"; no debe interpretarse como clasificador de edad ni de contenido apropiado para menores.
- El umbral 0,08 es muy bajo y está calibrado para priorizar el recall de bloqueo; implica una tasa de falsos positivos del 3,17 % en benignos, que puede ser inaceptable en flujos donde bloquear de más tenga coste alto.
- Validación y test son casos construidos y revisados por los propios autores a partir de expansiones sintéticas de escenarios, sin acuerdo de doble anotación independiente medido: el rendimiento en tráfico real puede diferir del reportado.
- El modelo solo cubre bengalí, bengalí-inglés mixto, banglish e inglés alineado; no hay evidencia de generalización a otras lenguas ni a variantes dialectales no representadas.
- Entrada truncada a 512 tokens: peticiones largas pierden contexto por la derecha, lo que puede degradar la decisión en conversaciones extensas o documentos con instrucciones al final.
- No se publican datos de sesgos, de robustez frente a adversarios ni de calibración más allá del Brier score; el riesgo de alucinación no aplica en el sentido generativo, pero sí el de clasificaciones erróneas con alta confianza.
- Licencia combinada CC BY 4.0 y términos de Gemma: el uso comercial queda sujeto a las condiciones de Gemma, que deben revisarse antes de integrar el modelo en un producto.
- Las métricas publicadas corresponden a la ejecución original y no fueron reejecutadas en la preparación de esta release; la verificación se limitó a comprobar los ficheros del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mehedi4/SafeAge-TigerLLM-1B
- Modelo base TigerLLM-1B-it: https://huggingface.co/md-nishat-008/TigerLLM-1B-it/tree/49c2001b637a84d997dbe34302fe527d70782097
- SafeAge Guard (modelo comparado): https://huggingface.co/mehedi4/SafeAge-Guard
- Conjunto de datos SafeAge (DOI): https://doi.org/10.5281/zenodo.23622437
- Paper de LoRA (Hu et al.): https://arxiv.org/abs/2106.09685
