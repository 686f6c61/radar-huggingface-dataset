# csoai/csoai-gate-ft2

## Resumen

csoai-gate-ft2 es un modelo de compuerta ("gate") especializado en la calibración de rechazos, desarrollado por csoai (CSOAI Ltd, Reino Unido) y publicado bajo licencia Apache-2.0. Se trata de un ajuste fino sobre Qwen2-0.5B, un transformer decoder-only de aproximadamente 494 millones de parámetros, distribuido en formato GGUF de precisión f16. Su función declarada no es la generación generalista, sino actuar como clasificador de decisión dentro de un pipeline mayor: determinar si una petición debe rechazarse o atenderse, y calibrar esa decisión para evitar tanto rechazos excesivos como respuestas a contenido problemático.

El modelo forma parte del ecosistema CSOAI, que lo envuelve mediante el router `csoai/oowm-router` y lo entrena con datasets propios (`csoai/gspc-normalized` y `csoai/gspc-art5`). La model card reporta un resultado destacado en la prueba de calibración de rechazos xstest-v2-copy (0.770) frente a una línea base de tamaño comparable (qwen2.5:1.5b, 0.360) y un modelo mayor (falcon3:7b, 0.600), aunque el agregado en 12 benchmarks se sitúa en 0.477, en paridad con las líneas base abiertas.

Es relevante ahora porque aborda un problema práctico de los sistemas desplegados con salvaguardas: la sobreactuación del rechazo. Un gate pequeño y barato, acoplado a un modelo generador mayor, permite separar la política de seguridad del modelo de lenguaje principal, reduciendo coste computacional y facilitando auditoría. La model card incluye una corrección pública (7 de octubre de 2026) retirando afirmaciones previas sobre su inclusión en el consejo medido de CSOAI, lo que conviene tener en cuenta al evaluar la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 GGUF (distribucion publicada); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria `gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2-0.5B: un transformer decoder-only con atención causal completa, sin mecanismos MoE ni capas recurrentes. El ajuste fino se orienta a una tarea de decisión binaria o de calibración de rechazo, no a la generación abierta, y se entrena sobre los datasets `csoai/gspc-normalized` y `csoai/gspc-art5`, ambos propiedad del autor. La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus, ni si se emplearon técnicas de RLHF, DPO o preferencias; tampoco especifica hiperparámetros, régimen de congelación de capas ni estrategia de alineación.

El autor menciona que los artefactos de la "spray" del 8 de agosto de 2026 están firmados con Ed25519 y describe el modelo como "living-training-attestation", es decir, una atestación de entrenamiento vivo, no una certificación formal. No se documentan innovaciones arquitectónicas como decodificación especulativa, atención lineal o modos de razonamiento explícito. La información disponible no permite reconstruir el procedimiento de entrenamiento con el detalle necesario para replicarlo.

## Capacidades

- Calibración de rechazos: decide si una petición debe rechazarse o atenderse, con el objetivo declarado de reducir falsos rechazos sin aumentar respuestas inseguras.
- Clasificación de compuerta: actúa como paso previo ("gate") en un pipeline, envolviendo o filtrando la entrada antes de un modelo generador de mayor tamaño.
- Generación de texto conversacional: la pipeline declarada es `text-generation` y el tag `conversational` está presente, aunque la función principal es la decisión de compuerta.
- Integración con router: diseñado para operar dentro de `csoai/oowm-router`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue vía Inference Endpoints.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo: no disponible; no se declaran idiomas.
- Visión, audio o modo de pensamiento: no disponible.

## Casos de uso

- Filtro de seguridad previo a un LLM generador: el gate evalúa la petición del usuario y decide si se atiende o se rechaza antes de invocar un modelo mayor, reduciendo el coste de inferencia en peticiones que no deben procesarse.
- Reducción de falsos rechazos en asistentes: en sistemas con salvaguardas demasiado agresivas, el gate recalibra la decisión para permitir consultas legítimas que un filtro por palabras clave bloquearía.
- Moderación de contenido en plataformas: clasificación de entradas de usuario en categorías de riesgo, con umbral ajustable según la política del producto.
- Enrutado dentro de arquitecturas multi-modelo: combinado con `csoai/oowm-router`, seleccionar qué modelo atiende cada petición según su naturaleza y sensibilidad.
- Auditoría y trazabilidad de políticas: al ser un artefacto pequeño y firmado, permite registrar y verificar la versión exacta del gate usado en producción.
- Despliegue en entornos con recursos limitados: con 494M parámetros en f16 (aproximadamente 1 GB de pesos), cabe en CPU y en GPUs de gama baja, lo que facilita su uso como componente perimetral en dispositivos o servicios pequeños.
- Evaluación comparativa de calibración de rechazo: servir como referencia en experimentos que midan la tasa de rechazo correcto frente a la de rechazo excesivo.

## Benchmarks y rendimiento

| Benchmark | gate-ft2 | qwen2.5:1.5b | falcon3:7b |
|---|---|---|---|
| xstest-v2-copy (calibración de rechazo) | 0.770 | 0.360 | 0.600 |
| AgentHarm | +17 pts frente a línea base (valor absoluto no disponible) | no disponible | no disponible |
| Agregado en 12 benchmarks (n=1131) | 0.477 | paridad con líneas base abiertas (valor no disponible) | no disponible |

Los datos proceden exclusivamente de la model card del autor. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de conocimiento o código.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para los pesos en f16 (494M parámetros × 2 bytes); con overhead de contexto y runtime, entre 1,5 y 2,5 GB según la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. También puede ejecutarse en CPU.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI si se convierte a safetensors; Inference Endpoints por el tag `endpoints_compatible`.
- Latencia y throughput: no disponible. Por el tamaño, se espera latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| csoai-gate-ft2 | 494M | no disponible | Gate de calibración de rechazo | Apache-2.0 | GGUF en Hugging Face |
| Qwen2-0.5B (base) | 494M | no disponible | LLM generalista | Apache-2.0 | Safetensors y GGUF |
| qwen2.5:1.5b | 1.500M (aprox.) | no disponible | LLM generalista | Apache-2.0 | Ollama y Hugging Face |
| falcon3:7b | 7.000M (aprox.) | no disponible | LLM generalista | Apache-2.0 | Ollama y Hugging Face |

La comparación es asimétrica por diseño: gate-ft2 es un modelo especializado en una tarea de decisión, mientras que las alternativas son generadores generalistas. En la métrica específica de calibración de rechazo reportada por el autor, gate-ft2 supera a ambos, pero en capacidad generativa general y cobertura de conocimiento los modelos mayores son superiores. No se dispone de datos comparativos en benchmarks estándar.

## Limitaciones y advertencias

- Modelo especializado: no debe usarse como generador generalista; su entrenamiento está orientado a la decisión de compuerta y su rendimiento en tareas abiertas no está documentado.
- Sesgos: no se documenta ninguna evaluación de sesgo demográfico, cultural o lingüístico.
- Alucinación: no evaluada en la información disponible; al ser un modelo de 494M, la generación libre es propensa a errores factuales.
- Idiomas: no se declaran idiomas soportados; el soporte multilingüe es desconocido y probablemente limitado.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar su uso con entradas largas.
- Documentación incompleta: la model card reconoce que, tras la corrección del 7 de octubre de 2026, el resto del documento no fue revisado, por lo que algunas afirmaciones pueden estar desactualizadas.
- Afirmaciones retiradas: la sección que situaba el modelo en el consejo medido de CSOAI fue eliminada porque el tablero público no lista los repositorios `sov*` / `oowm*` y CSOAI declara no puntuar modelos propios; conviene tratar con cautela cualquier cifra de posicionamiento.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni certificación; el propio documento lo califica como atestación de entrenamiento, no certificación.
- Adopción: cero descargas y cero likes en el momento de la consulta, sin validación independiente conocida.
- Producción: sin benchmarks de latencia, sin evaluación de robustez ante ataques de prompt injection y sin datos sobre tasas de falsos positivos y falsos negativos en dominios concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csoai/csoai-gate-ft2
- Modelo base: https://huggingface.co/Qwen/Qwen2-0.5B
- Router asociado: https://huggingface.co/csoai/oowm-router
- Dataset de entrenamiento: https://huggingface.co/datasets/csoai/gspc-normalized
- Dataset de entrenamiento: https://huggingface.co/datasets/csoai/gspc-art5
- Tablero CSOAI citado en la model card: https://councilof.ai/api/gspc
- Paper, blog o demo adicionales: no disponible
