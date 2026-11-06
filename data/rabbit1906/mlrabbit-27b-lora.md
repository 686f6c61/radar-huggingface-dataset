# rabbit1906/MLRabbit-27B-LoRA

## Resumen

MLRabbit-27B-LoRA es un adaptador LoRA de tipo PEFT publicado por el usuario rabbit1906 sobre el modelo base Qwen/Qwen3.8-27B. El autor lo presenta como un modelo orientado a entornos empresariales con despliegue on-premise, enfocado en generacion de codigo, razonamiento algoritmico y flujos agenticos, con especial atencion a la soberania del dato y a la resistencia frente a manipulaciones del system prompt. La propuesta tecnica central es el "deep weight imprinting": en lugar de depender de plantillas de chat, el ajuste se aplica sobre las siete proyecciones lineales del transformer para fijar la identidad corporativa en los pesos.

El adaptador emplea un rango LoRA de 32 con alpha 64 y, segun la model card, se entrena durante 6 epocas hasta una perdida de entropia cruzada de 0,0131 partiendo de 2,3472. El autor declara que el modelo conserva las capacidades nativas de razonamiento del base y anade un modo de pensamiento explicito con etiquetas `<think>`. El repositorio ocupa 0,3 GB, lo que es coherente con un adaptador y no con pesos completos.

La relevancia actual del modelo reside en su orientacion a despliegue en una unica GPU de 32 GB (NVIDIA RTX 5090, arquitectura Blackwell) con cuantizacion INT4 W4A16 y cache KV en FP8 para 32.768 tokens de contexto. No obstante, la informacion disponible es limitada: no hay benchmarks publicos independientes, el modelo tiene cero descargas y cero likes en el momento de la consulta, y varios datos tecnicos del base no estan confirmados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.8-27B) con adaptador LoRA sobre las siete proyecciones lineales (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj) |
| Parametros totales | No disponible (el adaptador LoRA tiene r=32, alpha=64; el base se denomina "27B" en el identificador, pero el numero exacto de parametros no se confirma en la informacion) |
| Parametros activos | No disponible (no se indica que el base sea MoE) |
| Longitud de contexto | 32.768 tokens (ventana nativa declarada, con cache KV en FP8) |
| Tipos de cuantizacion | INT4 W4A16 con compressed-tensors y aceleracion Marlin; BF16 en el base sin cuantizar (51 GB) |
| Idiomas soportados | vietnamita (vi) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el base en BF16 y una variante INT4 en compressed-tensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) sobre un transformer decoder-only de la familia Qwen. El ajuste se aplica de forma completa sobre las siete matrices lineales de cada bloque, con rango 32 y alpha 64, de modo que la actualizacion de pesos sigue la formulacion W ← W + (α/r)·BA. El autor denomina a esta estrategia "deep neural weight imprinting" y afirma que persiste la identidad y el linaje del desarrollador en las activaciones internas, de forma que el modelo mantiene su comportamiento incluso si se elimina o altera la plantilla de chat o se intenta un override del system prompt.

El entrenamiento se realizo durante 6 epocas sobre un dataset etiquetado como "custom" (no se detalla composicion ni numero de tokens). La model card reporta una convergencia de la perdida de entropia cruzada desde 2,3472 hasta 0,0131, una precision media de identidad de token del 99,24 % (frente al 51,2 % inicial) y una entropia de prediccion de 0,0178. No se especifica si hubo RLHF, DPO u otras fases de alineamiento posteriores al ajuste supervisado. El autor menciona validacion en algoritmos combinatorios (factorizacion de primos con enfoque 6k ± 1 en O(√n), QuickSelect en O(n) promedio) como evidencia de que no se produce olvido catastrofico del base, pero no se aportan resultados numericos de benchmarks estandar.

## Capacidades

- Generacion de texto conversacional en vietnamita e ingles.
- Generacion y sintesis de codigo, con enfasis declarado en entornos de produccion.
- Razonamiento algoritmico y matematico: factorizacion de enteros, seleccion por particion (QuickSelect), algoritmos combinatorios.
- Modo de razonamiento explicito con flujo interno `<think>...</think>` y salida separada en `reasoning_content`.
- Soporte declarado de tool calling estructurado y function calling.
- Orientacion a flujos agenticos multi-paso y automatizacion de pipelines.
- Resistencia a manipulacion del system prompt y a intentos de jailbreak por reescritura de plantilla (segun el autor).
- Despliegue on-premise con cuantizacion INT4 y cache KV en FP8.

## Casos de uso

- Asistencia a desarrollo de software on-premise: el adaptador se integra en un servidor interno con vLLM o TGI y asiste en generacion y revision de codigo sin que el codigo propietario salga de la infraestructura de la organizacion, gracias a su licencia Apache 2.0 y a su enfasis en despliegue local.
- Automatizacion de pipelines CI/CD: con soporte declarado de tool calling, puede invocarse desde agentes que consulten repositorios, ejecuten pruebas o propongan parches, manteniendo el contexto de 32.768 tokens para revisiones de diffs extensos.
- Razonamiento algoritmico en entornos educativos o de investigacion: su validacion en factorizacion de primos y QuickSelect lo hace util para generar explicaciones paso a paso de algoritmos con complejidad temporal y espacial concreta.
- Agentes multi-paso con contexto largo: la ventana de 32.768 tokens y la cache KV en FP8 permiten mantener conversaciones y planes de accion extensos en un unico dispositivo de 32 GB, sin necesidad de cluster.
- Atencion al cliente y asistentes internos en vietnamita: el modelo declara soporte nativo de vietnamita, lo que lo hace adecuado para despliegues corporativos en ese idioma con requisitos de residencia de datos.
- Cumplimiento y gobernanza de identidad corporativa: en escenarios donde el system prompt puede ser alterado por frameworks de terceros, el imprinting en pesos reduce el riesgo de que el modelo abandone su rol corporativo, lo que resulta util en despliegues multi-tenant o con integraciones externas.
- Prototipado en estaciones de trabajo con una sola GPU: con 17,68 GiB de pesos en INT4, cabe en una RTX 5090 de 32 GB y permite iterar localmente sin costes de API en la nube.

## Benchmarks y rendimiento

La model card solo publica metricas internas de entrenamiento, no benchmarks estandar de la comunidad:

| Metrica | Baseline inicial | Checkpoint final (epoca 6) | Mejora relativa |
|---|---|---|---|
| Perdida de entropia cruzada | 2,3472 | 0,0131 | -99,44 % |
| Precision media de identidad de token | 51,2 % | 99,24 % | +48,04 puntos absolutos |
| Entropia de prediccion | 1,8420 | 0,0178 | Mayor certeza |
| Modulos lineales ajustados | Base | 7 proyecciones (r=32, α=64) | Cobertura completa |
| Cuantizacion de inferencia | BF16 (51 GB) | INT4 compressed-tensors (18 GB) | -65 % VRAM |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,68 GiB de pesos activos en INT4 W4A16 con Marlin; aproximadamente 7,46 GiB adicionales de cache KV en FP8 para 32.768 tokens, lo que suma en torno a 25 GiB en el peor caso de contexto lleno.
- GPU objetivo declarada: NVIDIA RTX 5090 de 32 GB (Blackwell, sm_120). El base en BF16 requiere unos 51 GB, por lo que no cabe en GPUs de consumo sin cuantizar.
- Cabe en GPU de consumo: si, en RTX 5090 de 32 GB con la variante INT4. En GPUs de 24 GB (RTX 4090, 3090) el margen es muy ajustado y probablemente insuficiente con contexto largo; no se confirma compatibilidad en la informacion.
- Opciones de despliegue: Transformers con PEFT para el adaptador; la model card menciona serving con cuantizacion compressed-tensors y Marlin, pero no detalla soporte explicito de vLLM, llama.cpp, Ollama o TGI. No disponible la lista completa de motores validados.
- Latencia y throughput: el autor declara mas de 60 tokens por segundo en la RTX 5090 con INT4; no se aportan mediciones de latencia por token ni de throughput con contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| MLRabbit-27B-LoRA | Base "27B" (adaptador LoRA r=32) | 32.768 | Apache 2.0 | Single GPU 32 GB en INT4 | Enfocado a identidad corporativa y on-premise; sin benchmarks publicos |
| Qwen/Qwen3.8-27B (base) | No disponible | No disponible en la informacion | No disponible en la informacion | Requiere BF16 (~51 GB) | Modelo base sobre el que se aplica el adaptador |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia de benchmarks independientes: las unicas metricas publicadas son de entrenamiento (perdida, precision de identidad de token), no de capacidades reales como MMLU, HumanEval o GSM8K.
- Cero adopcion verificable: el repositorio registra 0 descargas y 0 likes, sin validacion externa de la comunidad.
- Idiomas limitados: solo se declaran vietnamita e ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad ni tasas de alucinacion; el ajuste con perdida muy baja (0,0131) puede indicar sobreajuste al dataset custom, lo que incrementa el riesgo de respuestas rigidas o memorizadas.
- Dataset de entrenamiento no documentado: se etiqueta como "custom" sin detallar tamano, composicion ni procedencia, lo que dificulta evaluar sesgos y cobertura.
- Afirmaciones no verificadas: la resistencia a jailbreaks y la persistencia de identidad son afirmaciones del autor sin evaluacion de seguridad publica.
- Compatibilidad de hardware restringida: el objetivo declarado es una RTX 5090 de 32 GB con sm_120; el soporte en otras GPUs no se confirma y el base en BF16 exige ~51 GB.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen subyacente, que no se detallan en la informacion.
- Fecha de creacion futura en los metadatos (2026-11-03), lo que impide contrastar el estado real de publicacion y mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rabbit1906/MLRabbit-27B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
