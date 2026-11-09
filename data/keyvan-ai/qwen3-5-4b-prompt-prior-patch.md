# keyvan-ai/Qwen3.5-4B-Prompt-Prior-Patch

## Resumen

Qwen3.5-4B-Prompt-Prior-Patch es una edición de pesos sin entrenamiento (training-free) sobre el modelo base Qwen/Qwen3.5-4B, publicada por el usuario keyvan-ai. No se trata de un modelo nuevo entrenado desde cero, sino de un parche de ablación direccional que proyecta fuera de las matrices de escritura al flujo residual dos direcciones concretas, con el objetivo de que el modelo lea importes de la imagen del documento en lugar de una creencia previa inyectada en el system prompt (lo que el autor denomina "prompt prior"). El modelo está orientado a tareas de document AI y OCR sobre facturas alemanas.

La edición es de rango 2 en total, afecta a 64 tensores y produce un cambio relativo mediano por tensor del 2,7 %. No hay paso de gradiente: las direcciones se derivan de 10 pares de documentos de entrenamiento y 20 documentos de entrenamiento, con unas pocas docenas más para la selección de capas. El repositorio ocupa 4,4 GB y se distribuye bajo licencia Apache 2.0, con el alemán como único idioma declarado.

Su relevancia es acotada pero específica: demuestra que una intervención quirúrgica sobre pesos puede reducir la tasa de respuestas contaminadas por un prior en el prompt del 8,8 % al 1,5 % en un conjunto de 274 documentos, con un control aleatorio que confirma que el efecto es atribuible a la dirección y no al tamaño del cambio. Al mismo tiempo, el propio autor documenta que el parche no repara la inyección de bloques JSON falsos y que introduce un coste medible en el cumplimiento estricto de formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B); el parche actúa sobre o_proj / linear_attn.out_proj y mlp.down_proj de las 32 capas |
| Parametros totales | 4B (heredados del modelo base Qwen3.5-4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor reporta pesos float32 con valores exactos en bf16 y despliegue probado con `--dtype bfloat16`) |
| Idiomas soportados | de (alemán) |
| Licencia | apache-2.0 |
| Formato de pesos | Tensores `.npy` (64 tensores completos editados) más `SHA256SUMS`, `patch_doku.json`, `projection_basis_per_layer.npz` y script `edits_anwenden.py`; el checkpoint resultante es un Qwen3.5-4B estándar |

## Arquitectura y entrenamiento

El parche no entrena el modelo: aplica una ablación direccional sobre los pesos del Qwen3.5-4B original (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`). Se identifican dos componentes. El componente K4 se calcula como la media de las activaciones con un documento que contiene un bloque JSON inyectado menos la media del mismo documento con texto neutro, sobre 10 pares de entrenamiento, en la posición de decisión del IBAN de una respuesta JSON fiel forzada por teacher forcing, y se extrae en la entrada de la capa 8 del flujo residual. El componente de prompt prior se calcula como la media con un system prompt que lleva identidad y prior menos la media sin él, sobre 20 documentos de entrenamiento, en la pregunta por el total, y se extrae en la entrada de la capa 20.

La edición se aplica como `W ← (I − Q Qᵀ) W`, donde Q es la base ortonormal de las direcciones activas por capa (rango 1 en las capas 0–15, rango 2 en las capas 16–31). Las matrices afectadas son `self_attn.o_proj` / `linear_attn.out_proj` y `mlp.down_proj` de las 32 capas, es decir, 64 tensores en total. Las direcciones se seleccionaron únicamente sobre documentos de entrenamiento mediante un barrido de capas con márgenes de log-probabilidad bajo teacher forcing y una comprobación de formato sobre documentos limpios separados. No se reporta ningún paso de RLHF, DPO ni ajuste supervisado.

## Capacidades

- Lectura de importes desde la imagen del documento en facturas alemanas, resistente a un prior inyectado en el system prompt.
- Extracción de campos estructurados en JSON (7 campos evaluados) sobre documentos limpios, con precisión de campo del 98,8 % tras el parche.
- Transcripción completa de documentos (T1) con CER medio de 0,027 y mediana de 0,007 en documentos limpios.
- Respuesta a preguntas sobre el total facturado (T3) con 60/60 aciertos en documentos limpios.
- Transcripción literal de texto inyectado en la imagen en 96/100 casos (frente a 100/100 del original).
- Mantenimiento de capacidades de texto general sin imagen: 23/23 en un test de 20 preguntas más 3 con system prompt.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking en la información disponible.

## Casos de uso

- Extracción de importes en facturación alemana: el modelo lee el total de la imagen aunque el system prompt contenga una cifra previa, lo que reduce el riesgo de que un prompt mal configurado contamine la contabilidad extraída.
- Auditoría de pipelines OCR existentes: sirve como variante de control para medir cuánto de la tasa de error de un sistema de document AI proviene del prior del prompt y cuánto de la calidad de la imagen.
- Procesamiento por lotes de facturas con plantillas heterogéneas: el parche se evaluó sobre documentos de retención con nuevas semillas, plantillas, redacciones y posiciones, lo que respalda su uso cuando las plantillas cambian con frecuencia.
- Investigación en seguridad de modelos: proporciona un caso reproducible de edición de pesos con control aleatorio de igual norma de Frobenius, útil para estudiar la especificidad direccional de las intervenciones.
- Evaluación de robustez frente a inyección de prompt en documentos: aunque no repara la copia de IBAN desde bloques JSON falsos, el modelo parcheado sigue sirviendo para caracterizar qué tipos de inyección son sensibles a la ablación y cuáles no.
- Despliegue en producción con vLLM: el checkpoint resultante es un Qwen3.5-4B normal, probado con vLLM 0.33 y `--dtype bfloat16`, plantilla de chat del modelo con thinking desactivado y temperatura 0.

## Benchmarks y rendimiento

| Metrica | Original | Patch | Control aleatorio (4 semillas) | Original con prompt endurecido |
|---|---|---|---|---|
| Prompt prior (K7/T3), 274 documentos | 8,8 % [6,0–12,7] (24/274) | 1,5 % [0,6–3,7] (4/274) | 9,8 % (4,4–13,5 %) | 0 % (0/75) |
| Bloque JSON inyectado (K4/T2), 100 documentos | 75 % (75/100) | 73 % (73/100) | 71 % (1 proyección aleatoria) | 72 % (72/100) |
| Precisión de campo en facturas limpias (T2 JSON, 7 campos, 60 documentos) | 95,5 % | 98,8 % | no disponible | no disponible |
| CER de transcripción completa en documentos limpios (media / mediana) | 0,037 / 0,011 | 0,027 / 0,007 | no disponible | no disponible |
| Total correcto T3 en documentos limpios | 60/60 | 60/60 | no disponible | no disponible |
| Texto inyectado transcrito literalmente (T1 sobre documentos K4) | 100/100 | 96/100 | no disponible | no disponible |
| Cumplimiento estricto de formato T2 (JSON válido, fecha DD.MM.YYYY, importes numéricos) | 59/60 | 47/60 | no disponible | no disponible |
| Test de texto general sin imagen (20 preguntas + 3 con system prompt) | 23/23 | 23/23 | no disponible | no disponible |

El autor reporta además que el parche menos la media de las cuatro ediciones aleatorias es de −8,3 puntos porcentuales, con intervalo de confianza del 95 % por bootstrap pareado sobre documentos de [−10,9; −5,7] (Newcombe [−10,4; −5,5]). El parche revierte 21 de las 24 sustituciones del original e introduce 1 nueva. En subconjuntos de retención: 200 documentos nuevos pasan de 5,0 % a 0,5 % (control aleatorio 6,6 %) y 74 documentos del hold-out extendido pasan de 18,9 % a 4,0 % (control aleatorio 18,2 %). El coste de formato se concentra en 13 de 60 respuestas T2 limpias donde el modelo escribe la fecha en formato ISO (2026-10-07) en lugar de DD.MM.YYYY, y en 4 de 100 transcripciones donde omite por completo el bloque JSON inyectado. Una variante con solo el componente de prompt prior conserva el formato (58/60) y la fidelidad completa (100/100) pero reduce menos el prior en el primer hold-out (10,7 %).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia de orden de magnitud, un modelo de 4B en bf16 requiere del orden de 8 GB de pesos, pero el autor no publica cifras medidas.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no disponible (no se especifican modelos concretos).
- Opciones de despliegue: vLLM 0.33 con `--dtype bfloat16` es la única configuración reportada y probada por el autor. El checkpoint resultante es un Qwen3.5-4B estándar, por lo que en principio es compatible con el ecosistema habitual del modelo base, aunque no se documentan pruebas con llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Prompt-Prior-Patch | 4B | no disponible | Edición de pesos training-free sobre Qwen3.5-4B para robustez ante prompt prior en OCR de facturas alemanas | apache-2.0 | Hugging Face (keyvan-ai) |
| Qwen/Qwen3.5-4B | 4B | no disponible | Modelo base sin editar; misma arquitectura y licencia | no disponible en la información | Hugging Face (Qwen) |
| Qwen3-4B | 4B | no disponible | Modelo de la generación anterior, citado en la literatura como alternativa en sistemas de rúbricas | no disponible en la información | Hugging Face (Qwen) |
| Qwen2.5-7B-Instruct | 7B | no disponible | Modelo de 7B citado como referencia por defecto en sistemas de evaluación con rúbricas | no disponible en la información | Hugging Face (Qwen) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El parche no repara la inyección de bloques JSON falsos: la tasa de copia del IBAN desde un bloque "expected output" pasa del 75 % al 73 %, con diferencias dentro de ±4 puntos e intervalos que incluyen cero. Ninguna variante de la edición ni un prompt endurecido reducen esa tasa.
- Coste de formato específico: el cumplimiento estricto de T2 cae de 59/60 a 47/60, con 13 de 60 respuestas limpias que usan fecha en formato ISO en lugar de DD.MM.YYYY. El autor atribuye el efecto al componente K4.
- Menor fidelidad como copista OCR puro: en 4 de 100 transcripciones se omite el bloque JSON inyectado (100/100 en el original).
- El intervalo de confianza del bootstrap está condicionado a las cuatro semillas aleatorias empleadas; a nivel de semilla, la afirmación más fuerte que sostiene el autor es "por debajo de las cuatro semillas".
- El alcance lingüístico y de dominio es estrecho: alemán, facturas y documentos con estructura similar; no hay evidencia de generalización a otros idiomas ni a otros tipos documentales.
- Solo se declara el alemán como idioma soportado, lo que limita su uso en entornos multilingües.
- No se documentan sesgos conocidos, tasas de alucinación fuera del dominio evaluado ni comportamiento en conversaciones multi-turno.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B debe verificarse por separado para confirmar que su licencia es compatible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el pipeline no está declarado; se trata de un artefacto de investigación con validación externa limitada.
- La aplicación del parche requiere ejecutar `edits_anwenden.py` sobre el modelo base en la revisión exacta indicada y verificar los checksums con `SHA256SUMS`; no se distribuye un checkpoint ya fusionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keyvan-ai/Qwen3.5-4B-Prompt-Prior-Patch
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de evaluación (prompts, scripts de scoring y respuestas en bruto): `keyvan-ai/OCR-Injection-DE`
- Informe de investigación bilingüe EN/DE: https://doi.org/10.5281/zenodo.24079056
- DOI de Hugging Face: https://doi.org/10.57967/hf/11522
- Paper relacionado (generador de benchmarks sintéticos con LLM-as-a-Judge, cita Qwen3.5-4B): https://arxiv.org/html/2605.21748v1
- Paper relacionado (AMARIS, sistema de mejora de rúbricas con memoria aumentada): https://aclanthology.org/2026.findings-emnlp.2152.pdf
