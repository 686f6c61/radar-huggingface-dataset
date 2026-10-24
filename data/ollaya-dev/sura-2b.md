# ollaya-dev/sura-2b

## Resumen

Sura 2b es un modelo de decisión desarrollado por Ollaya, construido a partir de `Qwen/Qwen3.5-2B-Base` mediante destilación del profesor `perplexity-ai/pplx-decider-flash-v1.2` (Qwen3.5-4B, Apache-2.0). No es un modelo generativo de texto libre: recibe un *estado* (un mensaje, un ticket de soporte, un objeto JSON, la siguiente llamada a herramienta de un agente) junto con una batería de *preguntas*, y devuelve para cada una una respuesta con probabilidad calibrada en una sola pasada hacia delante. Soporta tres tipos de decisión: `noul` (sí/no como probabilidad de sí), `choice` (una entre hasta 255 opciones descritas en lenguaje natural) y `score` (un nivel dentro de una escala de niveles descritos).

El modelo tiene 2.213.241.664 parámetros en BF16 (repo de 4,4 GB) y emplea el protocolo de lectura en línea (inline-readout) de pplx-decider v3: todas las preguntas de una petición comparten una única secuencia con el estado, cada pregunta va seguida de sus opciones y un marcador, y un cabezal lineal de 255 vías puntúa las opciones en ese marcador. La arquitectura base es un decoder híbrido Qwen3.5 con capas de atención completa (que ven la secuencia entera) y capas Gated DeltaNet (causales).

Su relevancia práctica está en sustituir clasificadores ad hoc y llamadas a LLM generativos por un modelo pequeño que responde varias preguntas a la vez con probabilidades utilizables en umbrales. En Ollaya Bench 2026.10 obtiene 40,9 (typed-decisions 0,570; exactitud macro en benchmarks públicos 0,610), y su runtime reproduce el comportamiento de `pplx_decider` en las 696 preguntas de paridad del autor, tanto en CPU como en CUDA. La licencia es Apache-2.0, igual que el modelo base y el profesor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder transformer híbrido (Qwen3.5) con capas de atención completa y capas Gated DeltaNet; cabezal de lectura lineal de 255 vías (protocolo inline-readout de pplx-decider v3) |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el autor solo publica pesos BF16; no se ofrecen GGUF ni variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (`model.safetensors` en BF16 para el backbone y `readout.safetensors` para el cabezal de 255 códigos), más los ficheros de procesador del profesor (tokenizer, chat template, `joint_config.json`) |

## Arquitectura y entrenamiento

El backbone es un decoder Qwen3.5 de 2,2B parámetros con un diseño híbrido: las capas de atención completa procesan la secuencia completa (estado, preguntas, opciones y marcadores), mientras que las capas Gated DeltaNet permanecen causales. Sobre ese backbone se aplica el protocolo de lectura en línea de pplx-decider v3, en el que cada pregunta se emite seguida de sus opciones y un marcador, y un readout lineal de 255 vías puntúa las opciones en la posición de ese marcador. Esto permite formular varias preguntas sobre un mismo estado y resolverlas todas en un único forward pass, en lugar de una llamada por pregunta.

El entrenamiento es una destilación desde `perplexity-ai/pplx-decider-flash-v1.2` (Qwen3.5-4B, Apache-2.0). El alumno comparte tokenizer y prompt con el profesor, de modo que aprende la distribución completa del profesor sobre las opciones, no solo su respuesta argmax. Los datos son la mezcla de modelos zero-shot de la familia coba: aproximadamente 340.000 estados con etiquetas doradas y etiquetas del profesor. El autor declara que esa mezcla no contiene ninguno de los conjuntos de datos de los benchmarks que reporta, por lo que los resultados presentados son zero-shot. No se documentan fases de RLHF ni de DPO, ni el número de tokens totales vistos durante el entrenamiento.

## Capacidades

- Decisión binaria (`noul`): devuelve la probabilidad de "sí" para preguntas del tipo "¿el cliente pide un reembolso?".
- Elección entre opciones (`choice`): selecciona una entre hasta 255 alternativas descritas en lenguaje natural, con distribución de probabilidad sobre todas ellas.
- Puntuación por niveles (`score`): asigna un nivel dentro de una escala de niveles descritos (por ejemplo, severidad o urgencia).
- Multiconsulta en una sola pasada: varias preguntas sobre el mismo estado se resuelven en un único forward pass compartiendo secuencia.
- Probabilidades calibradas, aptas para fijar umbrales y para derivar abstención o escalado a revisión humana.
- Clasificación zero-shot (`pipeline_tag: zero-shot-classification`): las opciones se describen en el prompt, sin reentrenamiento.
- Entrada heterogénea: texto libre, tickets, objetos JSON y representaciones de llamadas a herramientas de un agente.
- Compatibilidad con el ecosistema `pplx_decider`: el directorio carga como checkpoint de pplx-decider con el paquete `source/` incluido sin modificar.
- No genera texto libre ni mantiene conversación: su salida es una distribución sobre opciones, no una secuencia decodificada.

## Casos de uso

- Triaje de tickets de soporte: se pasa el ticket como estado y se formulan varias preguntas a la vez (categoría entre las opciones definidas, si requiere reembolso, nivel de urgencia en una escala descrita), obteniendo todas las etiquetas con probabilidad en una sola llamada para enrutar al equipo correcto.
- Enrutado de intenciones en un asistente: clasificación `choice` sobre un conjunto cerrado de intenciones (hasta 255) con umbral de confianza; las consultas por debajo del umbral se derivan a un LLM generativo o a un humano.
- Política de siguiente acción en agentes: dado el estado del agente en JSON y las posibles acciones descritas, el modelo puntúa la siguiente llamada a herramienta como decisión clasificatoria, lo que da un control determinista y auditable frente a la generación libre.
- Moderación y filtrado previo: preguntas `noul` encadenadas (¿es spam?, ¿contiene datos personales?, ¿es una queja?) para descartar o marcar contenido antes de costosas llamadas a modelos mayores.
- Vetting de respuestas de un LLM: usar `score` para evaluar la calidad de una respuesta generada según niveles descritos, o `noul` para decidir si requiere verificación adicional.
- Extracción de señales en pipelines de datos: sobre lotes de reseñas o formularios, responder preguntas binarias y de escala para construir variables estructuradas sin escribir reglas específicas.
- Evaluación de salidas de moderación o QA en CI: al ejecutarse en CPU, puede integrarse como test de regresión de políticas de clasificación en pipelines, comparando las probabilidades contra umbrales fijados.

## Benchmarks y rendimiento

| Benchmark / métrica | sura:2b | Referencia |
|---|---|---|
| Ollaya Bench 2026.10 (global) | 40,9 | kev:0.8b igualado; sura:0.8b 37,2; por debajo de decider:0.8b y decider:2b |
| Typed-decisions | 0,570 | No disponible para el resto |
| Exactitud macro en benchmarks públicos | 0,610 | No disponible para el resto |
| Paridad con `pplx_decider` (696 preguntas) | Coincidencia total en CPU y CUDA | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el autor solo reporta Ollaya Bench 2026.10 y la prueba de paridad frente a `pplx_decider`.

## Requisitos de hardware

- Pesos en BF16: 4,4 GB en disco (repo completo); el backbone y el cabezal de lectura se cargan por separado.
- VRAM estimada para inferencia en BF16: alrededor de 5-6 GB incluyendo activaciones y caché KV para lotes y contextos moderados (estimación, no publicada por el autor).
- Cuantización: el autor no publica variantes INT8/INT4 ni GGUF; cualquier cuantización requeriría validar por separado el cabezal `readout.safetensors`.
- GPU consumer: cabe en tarjetas de 8 GB o más (RTX 3060 Ti/4060 Ti, RTX 3080/4070/4080/4090). El modelo está pensado, según el autor, "para precisión en GPU" frente a la familia coba orientada a CPU y navegador.
- CPU y Metal: el runtime de Ollaya soporta Linux, macOS y Windows sobre CPU, CUDA y Metal; la paridad con `pplx_decider` se verificó en CPU y CUDA.
- Opciones de despliegue: runtime de Ollaya (`ollaya run sura:2b`), `transformers` con el paquete `source/` de `pplx_decider` incluido, o cualquier cargador compatible con checkpoints de pplx-decider. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Ollaya Bench 2026.10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sura:2b | Qwen3.5-2B-Base | 2,21B | No disponible | 40,9 | Apache-2.0 | HuggingFace + registro de Ollaya (`sura:2b`, `sura:latest`) |
| sura:0.8b | Qwen3.5-0.8B-Base | ~0,8B (según denominación) | No disponible | 37,2 | No disponible en la información | HuggingFace + registro de Ollaya (`sura:0.8b`) |
| decider:2b | No disponible | No disponible | No disponible | Por encima de 40,9 (sin cifra publicada) | No disponible en la información | Registro de Ollaya |
| pplx-decider-flash-v1.2 (profesor) | Qwen3.5-4B | ~4B | No disponible | No disponible | Apache-2.0 | HuggingFace (`perplexity-ai`) |

## Limitaciones y advertencias

- Solo inglés: el modelo declara `language: en`; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- No es un modelo generativo: no produce texto libre, resúmenes ni explicaciones; únicamente distribuciones sobre opciones predefinidas.
- Longitud de contexto no documentada: para estados muy largos (tickets extensos, historiales completos) hay que validar experimentalmente el truncado.
- Rendimiento modesto en términos absolutos: 40,9 en Ollaya Bench y 0,610 de exactitud macro indican que no sustituye a un LLM grande en decisiones ambiguas; el autor lo sitúa por debajo de decider:0.8b y decider:2b.
- Benchmarks no estándar y de autor: Ollaya Bench 2026.10 es una métrica propietaria del proveedor y no es reproducible de forma independiente con la información disponible.
- Destilación: al aprender la distribución del profesor, hereda sus sesgos y errores sistemáticos; no se documentan evaluaciones de sesgo ni de equidad.
- Sin alineamiento declarado: no se mencionan RLHF, DPO ni filtros de seguridad, por lo que las decisiones sobre contenido sensible dependen enteramente del diseño de las opciones y los umbrales.
- Dependencia del formato: la calidad depende de cómo se redacten las opciones y del prompt del profesor; cambios en la plantilla pueden alterar la calibración.
- Licencia Apache-2.0 permite uso comercial, pero el paquete `source/` procede de pplx-decider-flash-v1.2 y debe conservarse el aviso `NOTICE` correspondiente.
- Ecosistema limitado: no hay GGUF, cuantizaciones ni integraciones con servidores de inferencia habituales; el soporte de primera clase es el runtime de Ollaya.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ollaya-dev/sura-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Profesor (pplx-decider-flash-v1.2): https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Versión pequeña de la familia: https://huggingface.co/ollaya-dev/sura-0.8b
- Familia coba (encoder, orientada a CPU y navegador): https://huggingface.co/ollaya-dev/coba-400m
- Sitio y runtime de Ollaya: https://ollaya.dev

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
