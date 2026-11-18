# chaoliangUNSW/Jev-Style-2B-Decision-v4-GGUF

## Resumen

Jev-Style-2B-Decision-v4-GGUF es una compilación en formato GGUF del modelo Jev-Style-2B-Decision-v4, un clasificador de decisión de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) desarrollado por Chaoliang Yan (chaoliangUNSW) sobre una base Qwen3.5. El modelo está diseñado específicamente para tareas de clasificación de texto, enrutamiento de LLM, puntuación de opciones fijas y toma de decisiones tipo "system-one", no para generación de texto libre. Esta release GGUF está pensada para ejecutarse localmente en llama.cpp y en dispositivos de consumo, con soporte exclusivo de entradas de texto y JSON (no procesa imágenes).

El modelo resuelve el problema de la clasificación y el enrutamiento determinista de bajo coste: en lugar de invocar un LLM generativo grande para decidir qué herramienta usar, qué guardrail activar o qué opción elegir, un modelo de 2B parámetros puede puntuar opciones fijas con calibración explícita. La serie Jev-Style incluye versiones previas (v1, v2, v3 en 0.8B y 2B) y esta v4 introduce una ventana de contexto de 32.768 tokens por llamada, frente a los 25.600 de la v3.

La relevancia actual del modelo radica en tres factores: su tamaño reducido (1,27 GB en Q4_K_M) permite despliegue on-device; su licencia Apache 2.0 facilita uso comercial; y sus resultados en el board público Decision Index 0.3 (índice público 44,37, puntuación completa 34,53) lo sitúan por encima de la v3 (34,05). La model card advierte que los datos de entrenamiento incluyen etiquetas suaves destiladas de TypeSafe Jev 1.14 mediante su API pública, sin afiliación con TypeSafe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (capas Qwen3.5, atención de bloque exacta) |
| Parametros totales | 1.881.825.088 (aprox. 1,88B) |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | 32.768 tokens por llamada |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en PyTorch/safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Qwen3.5, un transformer con atención de bloque exacta ("exact block attention"), y se distribuye como clasificador de decisión con una cabeza de puntuación por ranura de veredicto (un slot de veredicto por opción). El runtime de referencia utiliza capas Qwen3.5 en PyTorch con precisión float32, TF32 desactivado y atención de bloque exacta. Los pesos GGUF reproducen ese runtime dentro de las puertas ("gates") declaradas previamente por el autor.

El entrenamiento de la v4 incluyó etiquetas suaves destiladas de TypeSafe Jev 1.14 a través de su API pública, según declara la model card. No se especifican en la información proporcionada el número total de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La model card indica que el paquete Python no incluye datasets crudos de respuestas del profesor, pero aclara que esto no niega el uso de salidas del profesor en el entrenamiento. La innovación técnica principal es el formato de decisión con slots de veredicto por opción y la calibración explícita, junto con el soporte de contexto largo (32.768 tokens) para estados de texto y JSON.

## Capacidades

- Clasificación de texto y puntuación de opciones fijas (fixed-choice scoring) con un slot de veredicto por opción.
- Toma de decisiones tipo "system-one" (rápida, determinista) y calibración de probabilidades.
- Enrutamiento de LLM (llm-routing): selección de herramienta, modelo o ruta entre alternativas.
- Guardrails: activación de barreras de seguridad mediante decisión binaria o multiclase.
- Soporte de contexto largo: hasta 32.768 tokens por llamada para estados de texto y JSON.
- Entrada de texto y JSON exclusivamente; no procesa imágenes en esta build GGUF (las imágenes requieren la release PyTorch del repositorio principal).
- Puntuación de verdadero/falso y de score (la fixture de gate incluye 645 preguntas de elección, 316 de verdadero/falso y 39 de score, con hasta 151 opciones).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y pipeline de text-classification.
- No se declaran capacidades de generación de texto libre, código, matemáticas, visión, audio ni tool calling generativo en la información disponible.

## Casos de uso

- Enrutamiento de LLM en producción: dado un estado de texto o JSON, el modelo puntúa cada ruta candidata (modelo, herramienta o endpoint) en su slot de veredicto y devuelve la de mayor puntuación, evitando invocar un LLM generativo grande solo para decidir el destino.
- Guardrails de seguridad: clasificación binaria o multiclase de peticiones entrantes (permitir/bloquear, categoría de riesgo) con calibración explícita, integrable como paso previo a un modelo generativo.
- Clasificación de tickets y correos: asignación de categoría, prioridad o cola a partir de texto de hasta 32.768 tokens, adecuada para hilos de conversación largos y formularios JSON.
- Decisión sobre documentos largos: con Q8_0 o F16, el modelo mantiene precisión en fixtures de 4.097 a 32.768 tokens (97/97 en Q8_0 y F16, 95/97 en Q4_K_M), útil para resúmenes de contratos o informes con decisión final.
- Despliegue on-device: con Q4_K_M de 1,27 GB, el modelo cabe en dispositivos de consumo y permite clasificación local sin clave de API ni simulación de agente, según la guía oficial de instalación local.
- Puntuación de opciones en sistemas de recomendación o QA de elección múltiple: puntúa hasta 151 opciones por llamada, devolviendo top-1 con calibración, lo que simplifica pipelines de ranking sin generación.
- Verificación de recibos o capturas de pantalla: la model card remite a la release PyTorch para entrada de imágenes; en esta build GGUF el caso queda limitado a texto y JSON, por lo que solo es aplicable si la captura se transcribe previamente a texto.

## Benchmarks y rendimiento

| Benchmark | Jev-Style 2B v4 | Jev-Style 2B v3 |
|---|---:|---:|
| Decision Index 0.3 public board, Public index | 44,37 | 34,05 (listado hasta 2026-11-04) |
| Decision Index 0.3 public board, Full score (tests privados) | 34,53 | reemplazado por v4 en el board |
| JevBench v1.4.1, ítems públicos (231) | 74,9% | 73,6% |
| Contexto por llamada | 32.768 tokens | 25.600 tokens |

Resultados de las cuantizaciones GGUF frente a PyTorch FP32 (referencia: scorer float32 en CUDA, TF32 off, pesos liberados, solo texto):

| Archivo | Cuantización | Tamaño | Mismo top-1 que PyTorch FP32 (1.000 preguntas) | Máx. Δp absoluto | Precisión (FP32: 84,4%) | Fixture largo (97 preguntas) | Gate |
|---|---|---:|---:|---:|---:|---:|:---:|
| F16 | F16 | 3,78 GB | 99,7% | 0,029 | 84,5% | 97/97 | PASS |
| Q8_0 | Q8_0 | 2,01 GB | 99,6% | 0,062 | 84,3% | 97/97 | PASS |
| Q4_K_M | Q4_K_M | 1,27 GB | 97,4% | 0,321 | 83,6% | 95/97 | PASS |

Notas: el Decision Index se midió con el runner y scorer del kit en bfloat16 sobre una A100, con una ejecución completa de 140.178 peticiones. JevBench v1.4.1 se midió con el harness oficial en float32 sobre Apple MPS, auto-ejecutado una vez, con IC del 95% de 68,9–80,0%. Los archivos GGUF no se re-ejecutaron en los benchmarks; reproducen las puntuaciones del runtime dentro de las puertas predeclaradas. La fixture de gate usó 1.000 preguntas de filas de desarrollo retenidas (≤4.096 tokens; 645 de elección, 316 de verdadero/falso, 39 de score; hasta 151 opciones). La fixture larga usó 70 peticiones/97 preguntas con filas de 4.097 a 32.768 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ≈ 1,27 GB de pesos; Q8_0 ≈ 2,01 GB; F16 ≈ 3,78 GB. Añadir overhead de contexto KV para 32.768 tokens.
- GPU recomendadas: no se especifican en la información; el runtime de referencia se midió en una A100 (bfloat16) y en Apple MPS (float32). Para GGUF, llama.cpp permite CPU y GPU.
- Cabe en GPU de consumo: Q4_K_M (1,27 GB) y Q8_0 (2,01 GB) caben en GPUs de consumo típicas; F16 (3,78 GB) también es viable en GPUs con ≥6 GB de VRAM, aunque el dato exacto no está disponible.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), `jev-style` con `python -m pip install -U "jev-style[torch]"` y `jev-style serve --release 2b --backend torch` para el runtime PyTorch; MLX y GGUF son builds solo texto. Compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.
- Recomendación del autor: usar Q8_0 o F16 para documentos largos, ya que Q4_K_M es notablemente más ruidoso en entradas largas; F16 es el formato por defecto del runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---:|---:|---|---|---|
| Jev-Style 2B v4 (este) | 1,88B | 32.768 | Apache 2.0 | GGUF, PyTorch | Decision Index 44,37 (público); JevBench 74,9% |
| Jev-Style 2B v3 | no disponible | 25.600 | no disponible | GGUF | Decision Index 34,05; JevBench 73,6% |
| Jev-Style 0.8B v3 | no disponible | no disponible | no disponible | GGUF | no disponible |

La información proporcionada solo permite comparar con las versiones anteriores de la misma serie. No se dispone de datos de modelos alternativos de la misma categoría (clasificadores de decisión de ~2B) en la documentación consultada.

## Limitaciones y advertencias

- Esta build GGUF no procesa imágenes; para recibos o capturas de pantalla hay que usar la release PyTorch del repositorio principal.
- Q4_K_M pierde precisión en entradas largas (95/97 en la fixture larga frente a 97/97 en Q8_0 y F16) y presenta un Δp máximo de 0,321 frente a 0,062 en Q8_0; el autor recomienda Q8_0 o F16 para documentos largos.
- Los archivos GGUF no se re-ejecutaron en los benchmarks oficiales; las puntuaciones reproducen el runtime PyTorch dentro de puertas predeclaradas, no son mediciones independientes de cada cuantización en el board.
- El entrenamiento usó etiquetas suaves destiladas de TypeSafe Jev 1.14 vía API pública; el autor declara no tener afiliación ni endorsement de TypeSafe, lo que puede afectar a la reproducibilidad y a consideraciones de licencia de las salidas del profesor.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo es un clasificador/puntuador, no un generador, por lo que el riesgo se manifiesta como calibración incorrecta más que como texto inventado.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; la model card no declara cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la procedencia de las etiquetas destiladas del profesor debe revisarse para producción.
- La política de uso justo de la API alojada no fija cuota diaria ni por minuto por cuenta; la capacidad es compartida y las peticiones deben reintentarse tras HTTP 429 según `Retry-After`.
- El pipeline declarado es text-classification, no text-generation; no debe usarse como LLM generativo conversacional pese al tag `conversational`.

## Enlaces

- Hugging Face (este GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4-GGUF
- Modelo base PyTorch: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4
- Web oficial del modelo: https://jevstyle.com/models/2b-v4/
- Repositorio GitHub: https://github.com/lawrence3699/jev-style
- Guía de instalación y verificación local: https://jevstyle.com/guides/run-locally/
- Guía de clasificación de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Guía de routing local y Apple silicon: https://jevstyle.com/guides/local-decision-models/
- Casos de uso de decisión sí/no con recibos o capturas: https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark reproducible de routing bancario: https://jevstyle.com/benchmarks/banking-routing/
- Política de cuotas de la API: https://jevstyle.com/api/limits.html#quota-policy
- Estado del servicio: https://api.jevstyle.com/healthz
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Serie v1 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Serie v2 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF
- Serie v3 0.8B: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-GGUF
- Serie v3 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v3-GGUF
