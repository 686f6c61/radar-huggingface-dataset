# SJTU-DAI-Sys/gemma-4-12B-it-DFlux

## Resumen

gemma-4-12B-it-DFlux es un modelo borrador (draft model) de decodificación especulativa desarrollado por SJTU-DAI-Sys para acelerar la inferencia de `google/gemma-4-12B-it`. No es un modelo generativo autónomo: se usa junto al modelo objetivo para proponer bloques de tokens candidatos que el modelo grande verifica mediante rejection sampling, preservando exactamente la distribución del modelo original. La arquitectura DFlux combina un backbone híbrido SWA-GQA con convolución local por bloques, un corrector residual (R-Corrector) y supervisión jerárquica.

El checkpoint contiene 1.366.660.608 parámetros en safetensors (2,7 GB de repositorio), muy por debajo de los 12B del modelo objetivo, lo que lo hace adecuado para despliegues de baja latencia. Se entrenó con el framework LEGOSpec sobre 1,4 millones de muestras regeneradas por gemma-4-12B-it a temperatura 1.

Su relevancia es práctica: los resultados publicados muestran aceleraciones de hasta 2,91× en batch size 1 y 5,42× en tareas de matemáticas (GSM8K) frente a la generación autorregresiva, con longitudes medias de aceptación de hasta 6,65 tokens por bloque. Está orientado a equipos que sirven gemma-4-12B-it en producción con SGLang y necesitan reducir coste por token sin alterar las salidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DFlux: backbone híbrido SWA-GQA (4 capas de sliding-window attention + 1 capa GQA de atención completa) con convolución agrupada local por bloques; R-Corrector residual; supervisión jerárquica (forward KL + D-PAL) |
| Parámetros totales | 1.366.660.608 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenado con max length 4096; evaluado con entradas de 32K–64K tokens en benchmarks de contexto largo |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con LEGOSpec) |

## Arquitectura y entrenamiento

DFlux es un modelo borrador para decodificación especulativa por bloques. Su backbone alterna 4 capas de sliding-window attention con 1 capa de atención completa con GQA; cada capa incorpora una convolución agrupada local por bloques que preserva dependencias dentro del bloque tanto en contexto corto como largo, acotando el crecimiento del KV cache histórico. Sobre las candidaturas top-k se aplica un R-Corrector que calcula correcciones residuales predecesor-sucesor en paralelo manteniendo los logits completos del vocabulario base, de modo que la verificación por rejection sampling reproduce la distribución exacta del modelo objetivo. El entrenamiento combina una pérdida forward KL sobre el backbone (cobertura de candidatos) y una pérdida D-PAL sobre la salida final (optimización directa de la longitud de aceptación por bloque).

Los datos de entrenamiento suman 1,4 millones de muestras: 900K de Open-PerfectBlend, 300K de Nemotron-Post-Training-Dataset-v2 y 200K de WildChat. Los prompts se conservan y las respuestas se regeneran con `google/gemma-4-12B-it` a temperatura 1. El entrenamiento se realizó en 16 GPU NVIDIA H800, con batch global de 128, optimizadores Adam (lr 6e-4) y Muon (lr 0.01), y longitud máxima de 4096 tokens. El checkpoint comparte embeddings y cabeza de salida con el modelo objetivo, por lo que no puede ejecutarse de forma aislada.

## Capacidades

- Aceleración de decodificación especulativa por bloques sobre `google/gemma-4-12B-it` con verificación exacta de la distribución.
- Propuesta de bloques de hasta 8 tokens candidatos con rejection sampling.
- Soporte de contexto largo: evaluado en LongBench-v2 (MD-QA, L-ICL, SD-QA) y SWE-bench con entradas de 32K–64K tokens.
- Rendimiento destacado en tareas de razonamiento matemático (GSM8K, MATH-500) y generación de código (MBPP, LiveCodeBench).
- Integración con SGLang para servir con alta concurrencia.
- No soporta tool calling, agentes ni multimodalidad por sí mismo: hereda las capacidades del modelo objetivo a través de la verificación.
- Idiomas: no disponible (depende del modelo objetivo).

## Casos de uso

- Servicio de chat de alto throughput: desplegar gemma-4-12B-it con DFlux en SGLang permite alcanzar 4.963 TPS a batch size 64 en Alpaca (1,57× sobre autorregresivo), reduciendo el coste por token en entornos con muchas peticiones concurrentes.
- Asistentes de razonamiento matemático: en GSM8K la longitud media de aceptación es 6,65 y el throughput a batch 1 llega a 256 TPS (5,42×), lo que hace viable servir problemas paso a paso con baja latencia.
- Generación de código en pipelines de CI/CD: con 5,77 de aceptación media en MBPP y 5,14 en LiveCodeBench, el modelo acelera la síntesis de parches y tests en herramientas de desarrollo integradas.
- Análisis de documentos largos: las entradas de 32K–64K tokens evaluadas en LongBench-v2 (4,02 en MD-QA) permiten resumir y responder preguntas sobre contratos, informes o repositorios extensos con aceleración efectiva.
- Agentes de resolución de incidencias sobre repositorios: la evaluación en SWE-bench con 4,52 de aceptación media indica utilidad en tareas de edición de código multi-archivo dentro de flujos agénticos.
- Inferencia económica en producción: al ocupar solo 2,7 GB en bfloat16, el borrador puede co-ubicarse con el modelo de 12B en la misma GPU, reduciendo el número de réplicas necesarias para alcanzar un SLA de latencia.
- Evaluación comparativa de draft models: sirve como referencia para medir el impacto de técnicas de decodificación especulativa en pipelines existentes antes de migrar a producción.

## Benchmarks y rendimiento

Longitud media de aceptación (τ) a T=1, block size 8, longitud máxima de generación 1.024 tokens, rejection sampling, media de 5 semillas:

| Método | Alpaca | MT-Bench | GSM8K | MATH-500 | MBPP | LCB | MD-QA | L-ICL | SD-QA | SWE |
|---|---|---|---|---|---|---|---|---|---|---|
| DFlash | 3,36 | 3,69 | 5,94 | 5,54 | 4,80 | 4,14 | 2,72 | 2,78 | 2,65 | 3,39 |
| DFlash2 | 3,72 | 4,05 | 6,33 | 6,01 | 5,28 | 4,65 | 2,60 | 2,81 | 2,58 | 3,44 |
| DSpark | 3,60 | 3,97 | 6,21 | 5,92 | 5,19 | 4,50 | 3,00 | 3,05 | 3,01 | 4,00 |
| DFlux | 4,12 | 4,43 | 6,65 | 6,42 | 5,77 | 5,14 | 4,02 | 4,09 | 3,85 | 4,52 |

Throughput con SGLang (T=0), TPS y speedup sobre autorregresivo:

| Tarea | Método | BS=1 | BS=8 | BS=32 | BS=64 | Avg. τ |
|---|---|---|---|---|---|---|
| Alpaca | AR | 47 / 1,00× | 381 / 1,00× | 1.480 / 1,00× | 3.168 / 1,00× | — |
| Alpaca | DFlash2 | 109 / 2,32× | 943 / 2,48× | 3.195 / 2,16× | 4.122 / 1,30× | 3,02 |
| Alpaca | DSpark | 123 / 2,61× | 1.011 / 2,65× | 3.408 / 2,30× | 4.393 / 1,39× | 3,41 |
| Alpaca | DFlux | 137 / 2,91× | 1.151 / 3,02× | 3.833 / 2,59× | 4.963 / 1,57× | 3,61 |
| GSM8K | AR | 47 / 1,00× | 382 / 1,00× | 1.492 / 1,00× | 3.253 / 1,00× | — |
| GSM8K | DFlash2 | 212 / 4,50× | 1.838 / 4,81× | 6.394 / 4,29× | 8.399 / 2,58× | 5,72 |
| GSM8K | DSpark | 236 / 5,02× | 1.950 / 5,10× | 6.741 / 4,52× | 8.856 / 2,72× | 6,29 |
| GSM8K | DFlux | 256 / 5,42× | 2.149 / 5,62× | 7.362 / 4,93× | 9.719 / 2,99× | 6,56 |
| MBPP | AR | 47 / 1,00× | 378 / 1,00× | 1.465 / 1,00× | 3.114 / 1,00× | — |
| MBPP | DFlash2 | 160 / 3,43× | 1.379 / 3,65× | 4.614 / 3,15× | 5.876 / 1,89× | 4,51 |
| MBPP | DSpark | 190 / 4,06× | 1.555 / 4,12× | 5.159 / 3,52× | 6.561 / 2,11× | 5,25 |
| MBPP | DFlux | 207 / 4,44× | 1.739 / 4,60× | 5.689 / 3,88× | 7.288 / 2,34× | 5,55 |

## Requisitos de hardware

- El borrador pesa 2,7 GB en bfloat16 (1.366 millones de parámetros), por lo que se co-ubica con `google/gemma-4-12B-it` en la misma GPU.
- Para el modelo objetivo de 12B se recomienda al menos una A100 40 GB, H100 80 GB o L40S 48 GB; el borrador añade una huella mínima.
- En GPU de consumo, cabe en tarjetas con 16–24 GB (RTX 4090, RTX 4080) si el modelo objetivo se cuantiza, aunque no se han publicado datos de cuantización para el borrador.
- Despliegue soportado: SGLang (usado en las evaluaciones de throughput) y el framework LEGOSpec; no se mencionan vLLM, llama.cpp ni Ollama.
- Entrenamiento validado en 16 NVIDIA H800; no se publican cifras de latencia absoluta por token más allá de los TPS de la tabla.
- Throughput medido: 137 TPS a BS=1 y 4.963 TPS a BS=64 en Alpaca; 256 TPS a BS=1 y 9.719 TPS a BS=64 en GSM8K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrenamiento | Aceptación media (Alpaca) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-12B-it-DFlux | 1,37B | 4.096 | 4,12 (τ), 3,61 (SGLang) | no disponible | Hugging Face |
| DFlash | no disponible | no disponible | 3,36 | no disponible | no disponible |
| DFlash2 | no disponible | no disponible | 3,72 | no disponible | no disponible |
| DSpark | no disponible | no disponible | 3,60 | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere obligatoriamente `google/gemma-4-12B-it` para embeddings compartidos, cabeza de salida y verificación.
- La licencia no está declarada en la información disponible; no puede asumirse uso comercial sin consultar la licencia del modelo base de Google.
- El rendimiento en contexto largo decae respecto a tareas cortas: la aceptación en MD-QA (4,02) y SD-QA (3,85) es inferior a la de GSM8K (6,65).
- El entrenamiento se limita a longitud máxima 4.096, aunque se evalúa con entradas de 32K–64K; el comportamiento fuera de esa ventana no está documentado.
- No se han publicado datos de sesgos, alucinación ni evaluación multilingüe específica del borrador.
- La aceleración depende del hardware, del batch size y de la carga: a BS=64 el speedup cae a 1,57× en Alpaca frente a 2,91× a BS=1.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la cita bibliográfica figura como "TBD", lo que indica un artefacto reciente sin validación comunitaria.
- La integración está ligada a LEGOSpec y SGLang; no hay soporte documentado para otros runtimes de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SJTU-DAI-Sys/gemma-4-12B-it-DFlux
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Framework LEGOSpec: https://github.com/SJTU-DAI-Sys/LEGOSpec
- Dataset Open-PerfectBlend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Dataset WildChat: https://huggingface.co/datasets/allenai/WildChat
