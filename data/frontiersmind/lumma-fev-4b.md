# FrontiersMind/Lumma-fev-4b

## Resumen

Lumma-Fev-4B es un modelo de decisión desarrollado por FrontiersMind que no genera texto: recibe un documento (denominado *state*) y un conjunto de preguntas tipadas, y devuelve una distribución de probabilidad para cada pregunta en una única pasada forward. Al no producir secuencias de texto libre, no hay nada que parsear y, según el autor, nada que pueda alucinar en el sentido generativo habitual. Esto lo sitúa en una categoría distinta a la de los LLM conversacionales: es un clasificador estructurado de propósito específico con contrato de salida fijo.

El modelo tiene 4.207.062.528 parámetros (aproximadamente 4,2B) almacenados en safetensors con precisión bf16, lo que se corresponde con un repositorio de 8,6 GB. Según la model card, ha sido sometido a *continual pre-training* y *fine-tuning* sobre la serie Qwen-3.5-4B, aunque no se detalla la composición del dataset ni el número de tokens empleados. El pipeline declarado en HuggingFace es `text-classification`, con `feature-extraction` y `custom_code` entre las etiquetas.

Su relevancia inmediata reside en que cubre una necesidad recurrente en producción: tomar decisiones discretas y auditables sobre documentos (enrutado, priorización, etiquetado binario o por niveles) a partir de instrucciones en lenguaje natural, sin depender de un LLM generativo ni de expresiones regulares. El autor publica una familia completa (0.15B, 0.6B, 4B y 9B) y ofrece integración con el contrato TypeSafe `POST /v1/systemone`, lo que facilita sustituir servicios cerrados por este modelo autoalojado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de la serie Qwen-3.5-4B (el autor no detalla la arquitectura exacta; modelo de decisión, no autoregresivo) |
| Parametros totales | 4.207.062.528 (4,2B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (precisión almacenada, indicada por el autor); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con soporte de `custom_code` y `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Se trata de un modelo de decisión con una arquitectura derivada de la serie Qwen-3.5-4B, sobre la que el autor aplica *continual pre-training* y *fine-tuning*. A diferencia de un modelo generativo, la inferencia consiste en una única pasada forward que devuelve, para cada pregunta tipada, una distribución de probabilidad sobre las posibles respuestas. El *state* de entrada puede ser texto plano, un objeto JSON o un array, y las preguntas admiten tres tipos con semántica propia:

- `noul`: respuesta binaria tipo sí/no, con probabilidad asociada.
- `choice`: selección entre un conjunto de opciones etiquetadas, más `confidence` y `probabilities` por nombre.
- `score`: nivel esperado sobre una escala ordenada, con `legend` y `probabilities` por nivel.

Una propiedad destacable del diseño es el aislamiento entre preguntas: cada pregunta ve únicamente el estado y sus propias instrucciones y opciones, de modo que una pregunta no puede alterar la respuesta de otra. Además, el autor afirma que el texto contenido en la petición no puede falsificar los tokens delimitadores del modelo, lo que reduce la superficie de ataques de inyección vía prompt.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Clasificación y decisión estructurada sobre documentos, sin generación de texto libre.
- Tres primitivas de decisión: binaria (`noul`), elección múltiple (`choice`) y puntuación ordinal (`score`).
- Procesamiento de estados heterogéneos: texto, objeto JSON o array.
- Ejecución de múltiples preguntas independientes en una sola pasada forward.
- Integración con el contrato TypeSafe `POST /v1/systemone`, compatible con clientes TypeSafe existentes cambiando la URL base.
- Uso mediante `transformers` (con `trust_remote_code`) o mediante el paquete `lumma-fev` (inferencia local) y `lumma-fev-serve` (servidor de API).
- Detección automática de dispositivo en el paquete `lumma-fev` (cuda, mps o cpu).
- Salida de probabilidades y `confidence` por pregunta, pensadas para calibración propia.
- Capacidades multilingües: no. El modelo declara únicamente inglés.
- Tool calling, function calling, agentes, visión, audio y *thinking mode*: no documentado.

## Casos de uso

- Enrutado de tickets de soporte: el modelo puede recibir el cuerpo del ticket como `state` y una pregunta de tipo `choice` con los equipos disponibles (por ejemplo, *billing*, *shipping*, *technical*), devolviendo el equipo más probable y su distribución de probabilidad. Con un 0,93 en Banking77, es adecuado para intenciones de dominio financiero o de servicio.
- Priorización y triaje: mediante una pregunta de tipo `score` con una escala ordenada ("puede esperar", "esta semana", "hoy"), permite asignar urgencia a incidencias de forma consistente y auditable, alimentando colas de trabajo o SLAs.
- Moderación y filtrado binario: con preguntas de tipo `noul` se puede decidir si un contenido cumple una política de forma determinista, y usar la probabilidad resultante como umbral de escalado a revisión humana.
- Análisis de emoción y sentimiento: con un 0,94 en DAIR Emotion, sirve para clasificar el tono de reseñas, correos o mensajes de usuario en categorías emocionales, alimentando paneles de analítica de experiencia de cliente.
- Clasificación temática de contenido: con un 0,93 en AG News, permite etiquetar automáticamente noticias, artículos o entradas de un CMS por categoría, sin coste por token y con latencia de milisegundos.
- Enriquecimiento en pipelines ETL: dado que acepta objetos JSON como `state`, se puede insertar en flujos de datos que necesiten añadir campos derivados (categoría, urgencia, sentimiento) a registros estructurados, ejecutando varias preguntas sobre el mismo documento en una sola pasada.
- Gating de automatizaciones: usando las probabilidades devueltas, es posible definir umbrales para decidir si una acción automática se ejecuta o se deriva a un humano, siempre que se haya medido antes la calibración sobre datos propios etiquetados.
- Sustitución de servicios cerrados: la compatibilidad con el contrato TypeSafe `POST /v1/systemone` permite migrar desde un proveedor externo autoalojando el modelo, con coste de cómputo propio y sin dependencia de API de terceros.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Todos los valores son puntuaciones (cuanto más altas, mejor) y la latencia es P50 en milisegundos. La columna de coste y el número de parámetros de la mayoría de alternativas no se detallan en la información disponible; los nombres de los modelos de la familia indican su escala aproximada.

| Benchmark / métrica | TypeSafe Jev 1.13.0 | Laya | Gliner2.5-Decide | Lumma-Fev-0.15B | Lumma-Fev-0.6B | Lumma-Fev-4B | Lumma-Fev-9B |
|---|---|---|---|---|---|---|---|
| Typed-decisions | 0,72 | 0,76 | 0,46 | 0,49 | 0,64 | 0,78 | 0,81 |
| AG News | 0,91 | 0,95 | 0,48 | 0,89 | 0,84 | 0,93 | 0,95 |
| DAIR Emotion | 0,48 | 0,595 | 0,55 | 0,68 | 0,89 | 0,94 | 0,94 |
| Banking77 | 0,87 | 0,425 | 0,68 | 0,47 | 0,90 | 0,93 | 0,94 |
| Media | 0,75 | 0,68 | 0,54 | 0,63 | 0,82 | 0,90 | 0,91 |
| Latencia P50 | 256 ms | 32,8 ms | 99,85 ms | 35,576 ms | 45,82 ms | 175,93 ms | 269,39 ms |
| Pesos | Cerrado | Abierto | Abierto | Abierto | Abierto | Abierto | Abierto |
| Coste | 0,042 USD / 1M tokens | 0 USD autoalojado | 0 USD autoalojado | 0 USD autoalojado | 0 USD autoalojado | 0 USD autoalojado | 0 USD autoalojado |

El modelo de 4B alcanza una media de 0,90, a dos puntos del 9B (0,91) y por encima del 0,6B (0,82). Frente a las alternativas no pertenecientes a la familia, supera a TypeSafe Jev 1.13.0 (0,75) y Laya (0,68) en media, y a Gliner2.5-Decide (0,54) de forma amplia. El coste de esa mejora es la latencia: 175,93 ms P50 frente a los 32,8 ms de Laya o los 45,82 ms del Lumma-Fev-0.6B. El hardware sobre el que se midieron estas latencias no se especifica.

## Requisitos de hardware

No se publican requisitos de hardware en la model card. Las siguientes cifras son estimaciones derivadas del recuento de parámetros (4,207B) y del tamaño del repositorio (8,6 GB), no datos oficiales:

- Pesos en bf16 (precisión almacenada): aproximadamente 8,4 GB, coherente con el tamaño del repositorio. Requiere en la práctica 12 GB de VRAM como mínimo y 16 GB para operar con holgura, sumando activaciones y estado interno.
- Pesos en int8 (si se convierte): aproximadamente 4,2 GB, con un objetivo razonable de 8 GB de VRAM.
- Pesos en int4 (si se convierte): aproximadamente 2,1 GB, con un objetivo razonable de 6 GB de VRAM.
- GPU de gama consumer: cabe en bf16 en tarjetas de 24 GB como la RTX 3090 o la RTX 4090. En tarjetas de 16 GB puede ajustarse con cuidado; en 8-12 GB requeriría cuantización, que el autor no documenta.
- GPU de centro de datos: A100 (40/80 GB), H100 (80 GB) y equivalentes ejecutan el modelo sin restricciones de memoria, aunque el modelo es pequeño para ese hardware si se despliega en solitario.
- Apple Silicon: el paquete `lumma-fev` permite seleccionar `mps` automáticamente, aunque no se especifican requisitos de memoria unificada.
- Opciones de despliegue documentadas: `transformers` con `trust_remote_code=True` y `dtype=torch.bfloat16`, el paquete `lumma-fev` para inferencia local y `lumma-fev-serve` como servidor HTTP compatible con el contrato TypeSafe, con soporte opcional de `LUMMA_FEV_API_KEY` y de CORS.
- Opciones no documentadas: vLLM, llama.cpp, Ollama o TGI no se mencionan en la model card y la presencia de `custom_code` puede dificultar su integración directa.
- Latencia: 175,93 ms P50 según el autor (hardware no especificado). No se publican datos de throughput.

## Comparativa con modelos similares

| Modelo | Escala | Media en benchmarks | Latencia P50 | Pesos | Licencia | Notas |
|---|---|---|---|---|---|---|
| Lumma-Fev-4B | 4,2B | 0,90 | 175,93 ms | Abierto | Apache 2.0 | Mayor precisión de la familia salvo el 9B |
| Lumma-Fev-0.6B | ~0,6B (según nombre) | 0,82 | 45,82 ms | Abierto | No disponible | Buena relación precisión/latencia, 4 veces más rápido |
| Lumma-Fev-9B | ~9B (según nombre) | 0,91 | 269,39 ms | Abierto | No disponible | Mejora marginal (+0,01) con 53 % más latencia |
| TypeSafe Jev 1.13.0 | No disponible | 0,75 | 256 ms | Cerrado | No disponible | Servicio de pago: 0,042 USD / 1M tokens |
| Laya | No disponible | 0,68 | 32,8 ms | Abierto | No disponible | El más rápido de la comparativa, con menor precisión |
| Gliner2.5-Decide | No disponible | 0,54 | 99,85 ms | Abierto | No disponible | Peor media del grupo; destaca solo en DAIR Emotion (0,55) |

El modelo de 4B se sitúa como el punto de equilibrio de la familia: rinde al nivel del 9B en la mayoría de métricas y casi duplica la media del 0.6B, con un coste de latencia cuatro veces superior al de este último.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluación de sesgos. Al entrenarse sobre datos en inglés, hereda los sesgos de esa distribución.
- Riesgo de alucinación: el autor sostiene que, al no generar texto, no hay riesgo de alucinación en el sentido generativo. Sin embargo, esto no elimina el riesgo de clasificación errónea: el modelo puede asignar una probabilidad alta a una etiqueta incorrecta.
- Calibración de probabilidades: la model card advierte explícitamente de que `confidence` y las probabilidades son estimaciones propias del modelo y deben calibrarse sobre datos etiquetados propios antes de condicionar acciones automáticas a esos valores.
- Idioma: solo inglés. No hay soporte declarado para castellano ni para ningún otro idioma.
- Longitud de contexto: no disponible. No se especifica cuánto texto puede procesar el `state`, lo que obliga a validar empíricamente los documentos largos antes de desplegar.
- Licencia: Apache 2.0, lo que permite uso comercial sin restricciones de copyleft, pero conviene verificar la licencia de la serie Qwen-3.5-4B sobre la que se ha construido.
- Código personalizado: el modelo requiere `trust_remote_code=True` en `transformers`, lo que implica ejecutar código del repositorio. Es una consideración de seguridad en entornos regulados.
- Compatibilidad de despliegue: no se documenta soporte para motores de inferencia habituales como vLLM, llama.cpp, Ollama o TGI, lo que puede limitar el escalado horizontal y el batching de alto rendimiento.
- Sin datos de entrenamiento: no se publica número de tokens, composición del dataset ni proceso de alineamiento, lo que dificulta evaluar la robustez ante dominios fuera de distribución.
- Idiomas y dominios de los benchmarks: AG News, Banking77 y DAIR Emotion son conjuntos en inglés y de dominios acotados. El rendimiento en otros dominios o en texto conversacional no está caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FrontiersMind/Lumma-fev-4b
- Sitio web del autor: https://www.frontiersmind.ai/
- Discord: https://discord.gg/ZGdjCdRt
- Correo de soporte: support@frontiersmind.ai
- LinkedIn: https://www.linkedin.com/company/frontiersmind/
- X (Twitter): https://x.com/FrontiersMind
- Paquete de inferencia local: `pip install lumma-fev`
- Servidor de API: `pip install "lumma-fev[serve]"` y comando `lumma-fev-serve`
- SDK de cliente TypeSafe: `pip install typesafe-sdk`
- Paper, repositorio de código y demo: no disponibles en la información proporcionada.
