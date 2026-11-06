# kyumly/qwen36-35b-a3b-2p25bit-gptq-uniform-duet

## Resumen

kyumly/qwen36-35b-a3b-2p25bit-gptq-uniform-duet es un checkpoint cuantizado de Qwen3.6-35B-A3B, un modelo de lenguaje y vision de tipo Mixture-of-Experts (MoE) desarrollado por Alibaba Qwen. El autor de esta variante, kyumly, aplica una técnica de entrenamiento consciente de la cuantización (QAT) llamada DUET sobre una cuantización GPTQ de 2 bits uniformes en los expertos enrutados, alcanzando 2,25 bits por peso enrutado (incluyendo escala y cero en fp16). El objetivo es reducir drásticamente el peso en disco y en memoria del modelo manteniendo el mayor rendimiento posible frente a la cuantización post-entrenamiento (PTQ) equivalente.

El modelo parte de Qwen3.6-35B-A3B, que según la model card tiene 35.000 millones de parámetros totales y 3.000 millones activos por token (A3B), con 40 capas decodificadoras y un bloque MTP (multi-token prediction). La variante DUET solo modifica los códigos de los expertos enrutados (el 0,0248 % de ellos), dejando en BF16 la atención, el experto compartido, el router, los embeddings, `lm_head` y el bloque MTP. El resultado es un repositorio de 16,6 GB que cabe en GPUs de consumo alto y que mejora de forma significativa la precisión de código y matemáticas respecto al punto de partida GPTQ.

La relevancia actual es doble: por un lado, demuestra que el QAT sin pesos maestros (DUET) puede recuperar buena parte de la degradación de una cuantización extrema de 2 bits en un MoE grande; por otro, ofrece una receta reproducible de despliegue de bajo bit para modelos de razonamiento con modo thinking, útil para escenarios con restricciones fuertes de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.6-35B-A3B), 40 capas decodificadoras, bloque MTP; expertos enrutados cuantizados con GPTQ uniforme de 2 bits y QAT DUET |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | 3.000 millones (3B) por token |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Expertos enrutados a 2 bits uniformes (4 niveles asimetricos, grupo 128, 2,25 bits/peso con escala y cero fp16); resto de tensores en BF16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | sigue la licencia del modelo base (no especificada en la informacion disponible) |
| Formato de pesos | safetensors (`layer_XX.safetensors` para expertos, `nonexpert.safetensors` para el resto) + `manifest.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE con 40 capas decodificadoras y un bloque de predicción multi-token (MTP). Cada capa contiene expertos enrutados con matrices `gate_up` (1024 × 2048) y `down` (2048 × 512), además de un experto compartido, router, atención y embeddings. En esta variante, todos los expertos enrutados se almacenan en formato GPTQ de 2 bits uniformes (4 niveles asimétricos, grupo de 128), con escala y cero en fp16, lo que da 2,25 bits por peso enrutado. El resto de componentes permanece en BF16 y congelado.

El entrenamiento DUET parte del checkpoint PTQ `mrminjae/qwen36-35b-a3b-2p25bit-gptq-uniform-packed` y ajusta únicamente los códigos de los expertos enrutados mediante movimientos estocásticos de un nivel con probabilidad proporcional a `lr·|u|/s` (donde `s` es la escala del grupo), manteniendo momentos tipo Adam en 8 bits para `m` y rango 1 para `v`. Las escalas y ceros de grupo se entrenan con LSQ (K = 2) y los pesos de RMSNorm también se ajustan. Se usó el conjunto de calibración genans (225 filas, 305 K tokens de respuesta, 10 filas reservadas), 1 época, 56 pasos, batch global 4, lr de códigos 5e-7 constante y lr de norma/escala 2e-6 con coseno y 3 % de warm-up, con clipping AdaGC por capa y proyección (λ 1.02). La pérdida en held-out bajó de 0,3408 a 0,3071. Solo se movió el 0,0248 % de los códigos (8,0 M de 32,2 B), casi todos un nivel.

## Capacidades

- Generación de texto y razonamiento multi-paso en modo thinking (la evaluación usa `thinking on` y respuestas que no cierran `</think>` cuentan como incorrectas).
- Razonamiento matemático y resolución de problemas tipo competición (evaluado en AIME25 y AIME26).
- Generación y razonamiento sobre código (evaluado en LiveCodeBench v6 con el grader oficial `lcb_runner`, pass@1).
- Razonamiento científico y de dominio (evaluado en GPQA-Diamond).
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text`, lo que indica capacidades multimodales de entrada.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni agentes; no disponible.

## Casos de uso

- Despliegue de razonamiento matemático en GPUs de consumo: con 16,6 GB de pesos, el modelo puede cargarse en una RTX 4090 (24 GB) o similar, permitiendo resolver problemas tipo AIME con una precisión del 78,89 % en AIME25 y 86,67 % en AIME26 según la evaluación del autor.
- Generación de código en entornos con VRAM limitada: útil para asistentes de programación y revisión de parches, con un 59,03 % de pass@1 en LiveCodeBench v6, adecuado para tareas de completado y depuración fuera de línea.
- Evaluación de razonamiento científico: preguntas de nivel posgrado en física, química y biología (71,04 % en GPQA-Diamond) para herramientas de estudio o generación de material docente.
- Investigación en cuantización extrema: el checkpoint sirve como referencia reproducible para estudiar QAT sin pesos maestros (DUET) sobre MoE de 35B, comparando PTQ frente a QAT con los mismos prompts y graders.
- Prototipado de asistentes multimodales: al declarar pipeline `image-text-to-text`, puede usarse para experimentos de descripción de imágenes y preguntas sobre documentos escaneados, siempre que se valide el soporte real de visión en el checkpoint.
- Servicio de chat conversacional con contexto largo: pensado para conversaciones multi-turno en las que el coste de memoria es crítico; requiere verificar la longitud de contexto real antes de producción.
- Inferencia por lotes en una sola GPU: el tamaño reducido permite ejecutar varias instancias o batchear peticiones en una A100 40 GB o H100, con un throughput mayor que la versión BF16.

## Benchmarks y rendimiento

Evaluación del autor con vLLM, thinking on, temperatura 0,7, top-p 0,8, top-k 20, min-p 0, presence penalty 1,5, máximo 61.440 tokens nuevos, 3 muestras por pregunta, semilla 0. LiveCodeBench v6 sobre 131 problemas (2025-02-01 a 2025-05-01) con `lcb_runner` (pass@1).

| Modelo | LiveCodeBench v6 Acc (%) | Token | AIME25 Acc (%) | Token | AIME26 Acc (%) | Token | GPQA-Diamond Acc (%) | Token |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3.6-35B-A3B (BF16) | 73,79 ± 3,53 | 30.781 | 87,78 ± 3,85 | 30.056 | 93,33 ± 3,33 | 28.784 | 83,33 ± 0,51 | 6.121 |
| 2,25-bit GPTQ (PTQ) | 47,33 ± 0,76 | 38.896 | 83,33 ± 3,33 | 33.230 | 82,22 ± 1,92 | 32.525 | 69,70 ± 1,01 | 16.689 |
| 2,25-bit GPTQ + DUET (este modelo) | 59,03 ± 2,33 | 29.309 | 78,89 ± 1,92 | 29.831 | 86,67 ± 3,33 | 26.897 | 71,04 ± 0,58 | 12.906 |

Comparación emparejada por pregunta frente al punto de partida GPTQ: +11,7 puntos en LiveCodeBench (4,2 errores estándar), −4,4 en AIME25 (−1,2 SE), +4,4 en AIME26 (1,4 SE) y +1,4 en GPQA-Diamond (0,7 SE). Las respuestas son entre un 10 % y un 25 % más cortas en todos los benchmarks.

| Métrica | LiveCodeBench v6 | AIME25 | AIME26 | GPQA-Diamond |
|---|---:|---:|---:|---:|
| Respuestas truncadas (PTQ → DUET) | 35,1 → 17,3 % | 11,1 → 16,7 % | 11,1 → 6,7 % | 9,1 → 5,7 % |
| Precisión en respuestas finalizadas (PTQ → DUET) | 72,94 → 71,38 | 93,75 → 94,67 | 92,50 → 92,86 | 76,67 → 75,36 |

El autor advierte que estas cifras no son comparables con las de la model card del modelo base, que usa límites más largos (100.000 / 70.000 tokens) y prompts distintos.

## Requisitos de hardware

- Peso del repositorio: 16,6 GB en safetensors; la carga completa en VRAM requiere al menos ~17-18 GB contando overhead de runtime.
- Cabe en GPUs de consumo de gama alta: RTX 4090 (24 GB), RTX 3090 (24 GB) y, con margen ajustado, RTX 4080 Super (16 GB) no sería suficiente por el overhead; se recomienda ≥ 24 GB.
- GPUs profesionales recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB, para batchear y aumentar throughput.
- Despliegue: el autor evalúa con vLLM; el formato GPTQ empaquetado con layout propio y `manifest.json` requiere soporte específico del runtime para dequantizar según la regla documentada. No se documenta compatibilidad con llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; solo se reporta la longitud media de respuesta (29.309 tokens en LiveCodeBench v6), que condiciona fuertemente el tiempo por petición en modo thinking.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | LiveCodeBench v6 | AIME25 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Qwen3.6-35B-A3B (BF16) | 35B | 3B | no disponible | 73,79 % | 87,78 % | no disponible | Hugging Face |
| 2,25-bit GPTQ (PTQ) | 35B | 3B | no disponible | 47,33 % | 83,33 % | no disponible | Hugging Face |
| 2,25-bit GPTQ + DUET (este modelo) | 35B | 3B | no disponible | 59,03 % | 78,89 % | sigue al base | Hugging Face |
| kyumly/qwen36-35b-a3b-2p10bit-duet | 35B | 3B | no disponible | no disponible | no disponible | sigue al base | Hugging Face |

La variante 2.10-bit DUET del mismo autor parte de un checkpoint distinto (`mrminjae/qwen36-35b-a3b-2p10bit-genans-lowbit`) y no publica cifras comparables en la información disponible.

## Limitaciones y advertencias

- La cuantización a 2 bits introduce una degradación notable frente a BF16: 59,03 % frente a 73,79 % en LiveCodeBench v6 y 71,04 % frente a 83,33 % en GPQA-Diamond.
- En AIME25 el QAT empeora ligeramente respecto al PTQ (78,89 % frente a 83,33 %), con una diferencia de −1,2 errores estándar; no es una mejora uniforme.
- El 17,3 % de las respuestas en LiveCodeBench v6 se truncan por el límite de 61.440 tokens; en producción con límites menores el impacto será mayor.
- El entrenamiento usó solo 225 filas de calibración y 56 pasos, sin conjunto de evaluación propio; el riesgo de sobreajuste al conjunto de calibración no puede descartarse.
- Solo se ajustaron los códigos de los expertos enrutados; atención, router, experto compartido, embeddings y `lm_head` permanecen en BF16 congelados, por lo que los sesgos del modelo base se mantienen.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización; el modo thinking puede producir cadenas de razonamiento largas y costosas.
- Licencia: la model card indica que sigue la del modelo base, pero no se especifica en la información disponible; verificar antes de uso comercial.
- Idiomas soportados no documentados en esta ficha; consultar la model card de Qwen3.6-35B-A3B.
- El layout empaquetado y el `manifest.json` requieren un runtime compatible con la regla de dequantización; no se garantiza funcionamiento en herramientas estándar sin adaptación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyumly/qwen36-35b-a3b-2p25bit-gptq-uniform-duet
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint PTQ de partida: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p25bit-gptq-uniform-packed
- Variante 2.10-bit DUET del mismo autor: https://huggingface.co/kyumly/qwen36-35b-a3b-2p10bit-duet
- Variante 2.10-bit e2e-b-bce DUET: https://huggingface.co/kyumly/qwen36-35b-a3b-2p10bit-e2e-b-bce-duet
- Checkpoint 2.10-bit de partida: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-genans-lowbit
