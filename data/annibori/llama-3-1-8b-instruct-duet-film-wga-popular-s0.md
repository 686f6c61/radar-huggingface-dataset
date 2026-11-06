# AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-popular-s0

## Resumen

Llama-3.1-8B-Instruct-DUET-film-WGA-popular-s0 es un checkpoint de investigación publicado por AnniBori que aplica *machine unlearning* sobre un fine-tune de Llama-3.1-8B-Instruct. El punto de partida es AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (epoch 6), un ajuste fino sobre el conjunto DUET de datos cinematográficos; sobre él se ejecuta un proceso de olvido selectivo con el algoritmo WGA (weighted gradient ascent con pesos por token) para eliminar un subconjunto concreto de hechos: 411 pares director-película del conjunto `forget_popular_film`.

El modelo no busca ser un asistente de propósito general, sino servir como artefacto reproducible para estudiar hasta qué punto el olvido es efectivo y cuánto daño colateral provoca en el conocimiento retenido. La model card documenta la receta completa (hiperparámetros, semilla, criterio de selección de epoch) y reporta una curva de olvido por epoch: el recall de generación libre sobre el conjunto a olvidar cae de 0,968 en la epoch 1 a 0,034 en la epoch 8, mientras el recall sobre el conjunto retenido se mantiene en 0,964.

Es relevante ahora porque se enmarca en la línea de evaluación de *unlearning* con conjuntos de prueba adversarios (paráfrasis, ataques, sondas de reaprendizaje con LoRA de rango 4 y ablación de subespacios), y porque publica pesos intermedios por epoch, algo poco habitual y útil para reproducibilidad. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), derivada de Llama-3.1-8B-Instruct |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens, no verificado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Modelo base | AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-03 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only denso de 8.030 millones de parámetros. Sobre esa base, el autor aplicó primero un fine-tune con el conjunto DUET (`film`), y después un proceso de olvido con WGA sobre el subconjunto `forget_popular_film`. La receta de olvido, según la model card, usa WGA con beta 1 (peso por token p(token)^beta), gamma 1, alpha 1 y pérdida de retención NLL; learning rate 1e-5, 8 epochs, batch 4 con acumulación de gradiente 4, warmup de 1 epoch, weight decay 0,01, optimizador `paged_adamw_8bit` en bf16 y semilla 0. Se guarda un checkpoint cada epoch (26 pasos por epoch).

El conjunto de datos de olvido son 411 hechos director-película con `split_role = train` de la config `film` del dataset `SwetieePawsss/DUET_LLM` (commit 2c2b047), y el conjunto de retención son 546 ejemplos de `retain_film`. La selección de epoch es explícita: se considera cualificado todo epoch con recall ROUGE-L de generación libre (greedy, 64 tokens nuevos) sobre el conjunto de olvido ≤ 0,15 y recall de retención ≥ recall base − 0,30 absoluto (base 0,842, suelo 0,542); entre los cualificados se elige el de mayor diferencia retención − olvido. Resultado: epoch 8 seleccionada, con recall de olvido 0,034 y recall de retención 0,964. La progresión por epoch es 0,968/0,895 (1), 0,787/0,904 (2), 0,491/0,928 (3), 0,117/0,925 (4), 0,040/0,919 (5), 0,040/0,951 (6), 0,037/0,965 (7) y 0,034/0,964 (8).

El prompt de entrenamiento y evaluación usa la plantilla de chat de Llama 3.1 con un turno de sistema fijo: «You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.». El autor publica además código de evaluación (generación greedy, ROUGE-L recall, conjuntos de paráfrasis y ataque), una sonda de reaprendizaje con LoRA de rango 4 (semilla 42, pasos 1-256) y una ablación de subespacios con su nulo emparejado por selección.

## Capacidades

- Generación de texto y respuesta a preguntas factuales en formato corto y conciso, condicionada por el system prompt de la receta.
- Razonamiento y conocimiento factual sobre cine (directores y películas) en el conjunto retenido, con recall de 0,964 medido por ROUGE-L.
- Olvido selectivo verificable de un subconjunto de 411 hechos director-película, con recall de 0,034 en generación libre.
- Evaluación de robustez del olvido frente a paráfrasis y conjuntos de ataque (según el código publicado `film_gate.py`).
- Sonda de reaprendizaje: el modelo está pensado para medir cuánto conocimiento olvidado se recupera con un LoRA de rango 4 en 256 pasos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o multi-step reasoning: no documentadas.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para reproducir la receta WGA sobre el conjunto DUET film y comparar curvas de olvido/retención entre algoritmos. Es adecuado porque publica la configuración exacta, la semilla y los pesos por epoch.
- Auditoría de robustez del olvido: ejecutar los conjuntos de paráfrasis y ataque incluidos en `film_gate.py` para medir si el olvido se generaliza o solo memoriza la formulación exacta de las preguntas.
- Pruebas de reaprendizaje (relearning): aplicar el LoRA de rango 4 de `stage4_revival_sweep.py` para cuantificar cuántos pasos bastan para recuperar los hechos olvidados, un indicador clave de la calidad del olvido.
- Análisis interpretabilidad de subespacios: usar `stage9_gate_anatomy.py` y su nulo emparejado para estudiar qué direcciones del espacio de activaciones codifican el conocimiento eliminado.
- Estudio de daño colateral: comparar el rendimiento en el conjunto retenido (546 ejemplos) frente al modelo base `DUET-film-ft` para caracterizar el coste del olvido en conocimiento adyacente.
- Docencia y divulgación técnica: ilustrar con un caso real y reproducible cómo se define un criterio de selección de checkpoint en un pipeline de unlearning (umbral de olvido, suelo de retención y gap máximo).
- Evaluación de licencias y despliegue controlado: al heredar la Llama 3.1 Community License, puede integrarse en entornos de investigación que ya operen con modelos Llama 3.1, siempre respetando los términos de la licencia.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de olvido y retención por epoch (ROUGE-L recall en generación libre, greedy, 64 tokens nuevos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Epoch | Recall olvido | Recall retención |
|---|---|---|
| 1 | 0,968 | 0,895 |
| 2 | 0,787 | 0,904 |
| 3 | 0,491 | 0,928 |
| 4 | 0,117 | 0,925 |
| 5 | 0,040 | 0,919 |
| 6 | 0,040 | 0,951 |
| 7 | 0,037 | 0,965 |
| 8 (seleccionada) | 0,034 | 0,964 |

Referencia del modelo base: recall de retención 0,842; suelo de cualificación 0,542; umbral de olvido ≤ 0,15.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos, más overhead de activaciones y caché KV; con contexto largo la demanda crece de forma notable.
- Cuantización: no se publican variantes GGUF ni cuantizadas; habría que generarlas a partir de los safetensors. En 8 bits los pesos ocuparían aproximadamente 8 GB; en 4 bits, unos 4-5 GB, sin datos verificados de calidad tras cuantizar.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090/3090 en bf16 con contexto limitado, y en GPUs de 8-12 GB solo mediante cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Olvido (recall) | Retención (recall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (WGA, epoch 8) | 8,03 B | no disponible | 0,034 | 0,964 | llama3.1 | Hugging Face, 0 descargas |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (base) | 8,03 B | no disponible | no disponible | 0,842 (referencia) | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct (original) | 8,03 B | 128.000 tokens (spec oficial) | no aplica | no aplica | llama3.1 | Amplia disponibilidad |
| Alternativas de unlearning comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otros métodos de unlearning (por ejemplo, NPO, RMU o gradiente ascendente simple) no está disponible en la información proporcionada; la model card solo referencia la receta WGA y el pipeline `open-unlearning`.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado como asistente de producción; el system prompt está fijado a respuestas telegráficas y factuales, lo que degrada la utilidad conversacional general.
- El olvido se mide con ROUGE-L recall sobre generación libre; no se reportan métricas de ataque adversarial más allá de los conjuntos de paráfrasis y ataque del código, cuyos resultados numéricos no se incluyen en la model card.
- Riesgo de olvido incompleto: aunque el recall cae a 0,034, la sonda de reaprendizaje con LoRA de rango 4 sugiere que el conocimiento puede recuperarse parcialmente; el autor no publica los resultados de esa sonda en la ficha.
- Daño colateral: el recall retenido sube de 0,842 a 0,964, lo que indica que el ajuste no degrada el conjunto retenido medido, pero no se evalúa conocimiento fuera de ese conjunto; puede haber degradación no medida en otras capacidades.
- Sesgos: no documentados; al heredar Llama 3.1, arrastra los sesgos del modelo original y del corpus DUET de cine.
- Alucinación: no evaluada; el formato de respuesta corta y factual puede aumentar la confianza aparente en respuestas erróneas.
- Idiomas: no declarados; la receta y el system prompt están en inglés, por lo que el comportamiento en castellano no está verificado.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y requisitos de atribución; revisar los términos antes de cualquier despliegue.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni issues reportados.
- Fecha de creación 2026-11-03: verificar que el checkpoint y el dataset referenciado (commit 2c2b047) sigan disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-popular-s0
- Modelo base (fine-tune DUET film): https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET_LLM: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Repositorio open-unlearning (referenciado en la receta): no disponible en la información proporcionada
- Paper de WGA: no disponible en la información proporcionada
- Demo: no disponible
