# Siddartha10/Inkling-2-Mini-AngelSpec-DSpark

## Resumen

Inkling-2-Mini-AngelSpec-DSpark es un modelo borrador (drafter) para decodificación especulativa sobre `thinkingmachines/Inkling-2-Mini`. No es un modelo generativo autónomo: su función es proponer tokens candidatos que el modelo objetivo verifica, acelerando la inferencia sin alterar sustancialmente la calidad de salida. Lo desarrolla el usuario Siddartha10 entrenando con AngelSpec de Tencent y publicándolo en el formato de checkpoint DSpark de DeepSeek (`Qwen3DSparkModel`), lo que permite servirlo con vLLM estándar sin parches.

El modelo tiene 881.970.955 parámetros (~882 M) y un backbone DFlash de 3 capas con anchura 2304, más una cabeza Markov de rango 256. Su relevancia práctica es el rendimiento medido: en una H100, la decodificación greedy a un solo usuario pasa de 172 tok/s a 468 tok/s (2,72×), y la longitud de aceptación media es de 3,81 tokens por paso con 7 borradores. La licencia Apache 2.0 y la compatibilidad directa con vLLM lo hacen desplegable en producción sin cambios de infraestructura.

Conviene subrayar que el modelo base Inkling-2-Mini no está descrito en la información disponible (arquitectura, contexto, idiomas y datos de entrenamiento del modelo objetivo no se detallan). Todo lo que sigue se refiere al drafter y a su comportamiento como acelerador del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash de 3 capas (anchura 2304) + cabeza Markov vanilla (rango 256) + cabeza de confianza; layout de checkpoint DSpark (`Qwen3DSparkModel`) |
| Parametros totales | 881.970.955 (~882 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el drafter; entrenado con prompts de hasta 4K tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (heredados del modelo objetivo, sin detallar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,8 GB) |
| Libreria de inferencia | vLLM (probado con nightly `0.34.1rc1.dev224+g16910e78d`) |
| Modelo objetivo | `thinkingmachines/Inkling-2-Mini` (revision `c9d0283`) |
| Tokens especulativos | 7 (`num_speculative_tokens: 7`) |

## Arquitectura y entrenamiento

El drafter sigue la arquitectura DSpark de AngelSpec: un backbone DFlash de 3 capas con anchura 2304, una cabeza Markov de rango 256 para modelar dependencias entre tokens borrador y una cabeza de confianza. Consume las características internas del modelo objetivo en las visitas de bucle 5, 23 y 41, más la salida de la normalización final; en vLLM esto corresponde a `target_layer_ids = [4, 22, 40, 47]` (desplazados +1 por vLLM). Estas características se capturaron offline con transformers y se almacenaron en el formato nativo de volcado de AngelSpec.

El entrenamiento usó 234.919 prompts con respuestas generadas por el propio Inkling-2-Mini en decodificación greedy (108 M de tokens de respuesta), publicados en el dataset `Siddartha10/inkling-2-mini-selfdistill`. La etapa 1 (199K prompts, propósito general) cubre open-perfectblend, UltraChat, GSM8K-train, LiveCodeBench y MBPP, con esfuerzo de razonamiento "low" y por defecto. La etapa 2 (10K prompts) añade documentos largos: extractos de PG-19 de entrenamiento y arXiv de 1–3K tokens con instrucciones de resumen o análisis. Ningún prompt de evaluación ni libro de test está en los datos de entrenamiento.

## Capacidades

- Aceleración de decodificación especulativa sobre Inkling-2-Mini: propone hasta 7 tokens por paso que el modelo objetivo verifica.
- Longitud de aceptación media (τ) de 3,81 tokens por paso en el conjunto agregado de 444 prompts retenidos (greedy, esfuerzo "low").
- Mejor τ en tareas de matemáticas y código: 4,93 en GSM8K y 3,92 en HumanEval, frente a 2,86 en MT-Bench.
- Rendimiento destacado en documentos de longitud media: 1,89× de aceleración con prompts de 1,5K tokens.
- Preservación de la calidad: sin cambios medibles en precisión de tareas (Δ +0,43 pt, IC 95% [−0,21, +1,07]).
- Integración nativa con vLLM mediante `--speculative-config` con `method: dspark`.
- No soporta de forma autónoma generación, tool calling, agentes, visión ni audio: es exclusivamente un componente de aceleración.

## Casos de uso

- Servicio de chat interactivo de baja latencia: con la configuración indicada, la decodificación greedy a un solo usuario sube de 172 a 468 tok/s en H100, lo que reduce el tiempo hasta el primer token completo y mejora la percepción de fluidez en asistentes conversacionales.
- Generación de código en producción: el τ de 3,92 en HumanEval indica que el drafter acierta bien en código, por lo que pipelines de autocompletado o generación de tests se benefician de mayor throughput sin reentrenar el modelo objetivo.
- Razonamiento matemático por lotes: el τ de 4,93 en GSM8K lo hace adecuado para evaluaciones masivas o generación de soluciones paso a paso donde el cuello de botella es la decodificación secuencial.
- Resumen de documentos de longitud media: con prompts de 1,5K tokens logra 321 tok/s (1,89×), útil en pipelines de resumen de artículos, informes o correos.
- Servicio con concurrencia moderada: a c8 alcanza 1.262 tok/s agregados (1,68×) frente a 752 sin drafter, adecuado para APIs con varias decenas de usuarios simultáneos.
- Sustitución de la cabeza especulativa integrada de Inkling: supera a la cabeza nativa en τ agregado (3,81 frente a 3,51) y en velocidad, por lo que puede desplegarse como alternativa sin modificar el modelo objetivo.
- Evaluación comparativa de drafters: sirve como referencia reproducible para medir el impacto de la decodificación especulativa en precisión y latencia dentro de un mismo harness.

## Benchmarks y rendimiento

Velocidad en decodificación a un solo usuario (H100, 24 prompts fijos, tok/s de decodificación):

| Configuracion | Sin drafter | Este drafter | Cabeza integrada | intuit/Inkling-2-Mini-dspark |
|---|---|---|---|---|
| Greedy, esfuerzo "low" | 172 | 468 (2,72× [2,32, 3,12]) | 379–387 | 456–460 |
| Greedy, esfuerzo por defecto | — | 485 (τ 3,67) | 405 (τ 3,42) | 477 (τ 3,98) |
| Temperatura 1,0 | — | 425 (τ 3,24) | 323 (τ 3,09) | 379 (τ 3,43) |
| Extractos de 1,5K tokens | 170 | 321 (1,89× [1,75, 1,95]), τ 2,71 | 270, τ 2,46 | — |
| Extractos de 8K tokens | 166 | 234 (1,41×), τ 2,05 | 253, τ 2,29 | 257, τ 2,35 |

Longitud de aceptación τ (1 + borradores aceptados por paso, 7 borradores, 444 prompts retenidos, greedy, esfuerzo "low"):

| Modelo | MT-Bench | HumanEval | GSM8K | MATH-500 | Global |
|---|---|---|---|---|---|
| Este drafter | 2,86 | 3,92 | 4,93 | 4,11 | 3,81 |
| Cabeza integrada | 2,59 | 3,87 | 3,82 | 3,71 | 3,51 |
| intuit | 3,03 | 4,20 | 4,91 | 4,51 | 4,07 |

Concurrencia (tok/s agregados, mediana de 3 repeticiones):

| Nivel | Sin drafter | Este drafter |
|---|---|---|
| c8 | 752 | 1.262 (1,68×) |
| c32 | 2.071 | 2.836 (1,37×) |

Calidad preservada (greedy, 1.873 problemas, emparejado por ítem):

| Tarea | Sin drafter | Con drafter | Δ (IC 95%) | McNemar p |
|---|---|---|---|---|
| GSM8K-Platinum (1.209) | 99,26% | 99,26% | 0,0 pt [−0,33, +0,41] | 1,0 |
| MATH-500 (500) | 80,2% | 81,4% | +1,2 pt [−0,6, +3,0] | 0,26 |
| HumanEval (164) | 90,2% | 91,5% | +1,2 pt [−2,4, +4,9] | 0,75 |
| Global | 93,38% | 93,81% | +0,43 pt [−0,21, +1,07] | 0,24 |

## Requisitos de hardware

- VRAM del drafter: el repo pesa 1,8 GB en safetensors; en FP16 los ~882 M de parámetros ocupan aproximadamente 1,8 GB adicionales sobre el modelo objetivo.
- GPU recomendada y validada: 1× H100 80 GB. Es el único hardware medido.
- GPU de consumo: no se han publicado pruebas en RTX 4090, 3090 u otras; el requisito real lo marca el modelo objetivo Inkling-2-Mini, cuyo tamaño no se detalla en la información disponible.
- Blackwell (FP4 nativo): no probado.
- Despliegue: vLLM (nightly `0.34.1rc1.dev224+g16910e78d` verificado), con `--speculative-config '{"method": "dspark", "model": "Siddartha10/Inkling-2-Mini-AngelSpec-DSpark", "num_speculative_tokens": 7}'`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: 468 tok/s greedy a c1, 485 tok/s con esfuerzo por defecto, 1.262 tok/s agregados a c8 y 2.836 tok/s a c32 en H100.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | τ global | Velocidad c1 (greedy "low") | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-AngelSpec-DSpark | Drafter DSpark | ~882 M | 3,81 | 468 tok/s | Apache 2.0 | Hugging Face |
| Cabeza especulativa integrada de Inkling | Cabeza nativa | no disponible | 3,51 | 379–387 tok/s | la del modelo base | Integrada en Inkling-2-Mini |
| intuit/Inkling-2-Mini-dspark | Drafter DSpark | no disponible | 4,07 | 456–460 tok/s | no disponible | Hugging Face |
| Sin drafter (Inkling-2-Mini solo) | Decodificación estándar | no disponible | — | 172 tok/s | la del modelo base | Hugging Face |

El drafter de intuit logra mayor τ global (4,07 frente a 3,81) y mejor rendimiento en MT-Bench y MATH-500, mientras que este modelo es superior en GSM8K (4,93 frente a 4,91) y en HumanEval (3,92 frente a 4,20 en favor de intuit). En velocidad a c1 ambos están muy próximos.

## Limitaciones y advertencias

- Solo acelera: no es un modelo generativo utilizable de forma independiente; requiere Inkling-2-Mini como verificador.
- Documentos muy largos: con prompts de 8K tokens el τ baja a 2,05, por debajo de la cabeza integrada (2,29), aunque mantiene 1,41× sobre la decodificación sin drafter. Se entrenó con prompts de hasta 4K tokens.
- Concurrencia alta: la aceleración se reduce a 1,37× a c32, con variación entre repeticiones; el propio autor pide tratarla como aproximada.
- Funciones de vLLM no disponibles: la verificación adaptativa por confianza de DSpark no está operativa para Inkling en vLLM 0.34.1rc1 (requiere CUDA graphs completos que el backend de atención de Inkling no ofrece) y `dspark_draft_topk` provoca fallos. Debe usarse la configuración simple indicada.
- Divergencia numérica: la decodificación especulativa en vLLM no es bit-idéntica a la decodificación simple para ningún drafter; las salidas greedy largas divergen tras unos 80 tokens de media. Las mediciones muestran que el efecto es neutro en calidad, pero impide reproducibilidad exacta.
- Hardware: solo validado en H100; Blackwell sin probar.
- Idiomas y sesgos: no documentados; dependen del modelo objetivo.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Inkling-2-Mini puede tener condiciones propias que deben verificarse por separado.
- Madurez: 0 descargas y 0 likes en el momento de la ficha; proyecto reciente sin adopción comunitaria verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Siddartha10/Inkling-2-Mini-AngelSpec-DSpark
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Dataset de autodestilación: https://huggingface.co/datasets/Siddartha10/inkling-2-mini-selfdistill
- Repositorio AngelSpec (Tencent): https://github.com/Tencent/AngelSpec
- Paper de referencia 1: arXiv:2607.05147
- Paper de referencia 2: arXiv:2602.06036
- Drafter alternativo: https://huggingface.co/intuit/Inkling-2-Mini-dspark
