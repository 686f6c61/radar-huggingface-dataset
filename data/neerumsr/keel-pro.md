# neerumsr/keel-pro

## Resumen

Keel-Pro es un adaptador LoRA (QLoRA) sobre el modelo base Qwen/Qwen3.5-27B, publicado por el usuario neerumsr bajo licencia Apache-2.0. No es un modelo generativo al uso: se trata de un modelo de decisión tipada que, dado un estado (por ejemplo, el texto de un ticket de soporte) y una o varias preguntas tipadas (`choice`, `score`, `noul` = sí/no), devuelve una distribución de probabilidad sobre las opciones disponibles. Su función principal es servir como componente de enrutamiento y juicio dentro de pipelines de agentes, con el pin opcional `decider-pro-1.0.0` del proyecto Keel.

El modelo se distribuye como adaptador PEFT (librería `peft`, formato safetensors) con un tamaño de repositorio de 0,9 GB, lo que corresponde a los pesos del adaptador y no al modelo base completo. Para su uso es necesario descargar por separado Qwen3.5-27B. Está etiquetado como `text-classification` y soporta únicamente inglés (`en`). Su relevancia actual radica en que ofrece pesos abiertos para una tarea habitualmente cubierta por servicios propietarios (LLM-as-judge, enrutamiento de decisiones), ejecutable en GPU propia.

El autor declara una puntuación de Decision Index público 0.3 de 62,73 sobre el conjunto público completo de 139.677 peticiones, con una latencia mediana de 245 ms por petición en una RTX 5090. Estas cifras son autodeclaradas y no verificadas por un tercero, aunque el autor publica los artefactos de ejecución en su repositorio de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-27B; atención estándar y linear-attention |
| Parametros totales | 217,6 M parámetros entrenables en el adaptador LoRA (modelo base: 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA NF4 con doble cuantización para el entrenamiento; build GGUF disponible (Q4_K_M, archivo de 16,8 GB); opción `--load-4bit` en el servidor |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF en repositorio separado |

## Arquitectura y entrenamiento

Keel-Pro es un ajuste fino LoRA de rango 32 y alpha 64, sin dropout, aplicado sobre las proyecciones de atención, linear-attention (`in_proj_qkv`, `in_proj_z`, `out_proj`) y las proyecciones MLP del modelo Qwen/Qwen3.5-27B. El entrenamiento emplea QLoRA: el modelo base se carga en 4 bits NF4 con doble cuantización y cómputo en bf16, y solo se entrenan los pesos LoRA, que suman 217,6 M parámetros. La información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica destacable no está en el entrenamiento sino en la inferencia: el autor describe un "fast engine" (`hybrid_engine.py`) con `prefix_share=1` que, para peticiones con varias preguntas, ejecuta una sola vez el prefijo de tokens compartido (system + estado) y continúa copias de esa caché en lotes con padding a la derecha para el resto de tokens de cada pregunta. Según el autor, este motor coincide con la ejecución de un pase por pregunta en 17.150 de 17.182 respuestas (diferencias por batching en bf16) y obtiene 61,66 frente a 61,96 en la muestra de informe. El modelo se sirve mediante un sidecar de loopback (`serve/keel_pro_server.py`).

## Capacidades

- Clasificación de decisiones tipadas: devuelve una elección (`choice`), una puntuación (`score`) o un sí/no (`noul`) con probabilidades asociadas y nivel de confianza.
- Enrutamiento de peticiones: asignación de tickets o consultas a categorías definidas por el usuario mediante criterios en lenguaje natural.
- LLM-as-judge: evaluación de respuestas o estados según criterios proporcionados en la propia pregunta.
- Soporte de múltiples preguntas por petición, con compartición de prefijo para reducir latencia.
- Integración con el proyecto Keel como modelo `decider-pro-1.0.0` a través de HTTP.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- No se documentan en la información disponible capacidades de generación de texto libre, código, matemáticas, visión, audio ni tool calling nativo.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket como `state` y una pregunta `choice` con criterios como billing, tech o account, el modelo devuelve la probabilidad de cada equipo y permite derivar automáticamente la incidencia al departamento correcto.
- Triaje de incidencias en producción: clasificación de alertas o informes de error en categorías de severidad mediante preguntas `choice` o `score`, integrable en pipelines de monitorización que consuman la API HTTP del sidecar.
- Evaluación automática de respuestas de agentes: uso como juez con preguntas `noul` (sí/no) o `score` para validar si una salida cumple criterios definidos, dentro de bucles de evaluación o de control de calidad.
- Moderación y filtrado por criterios: preguntas de tipo sí/no sobre un estado textual para decidir si un contenido cumple una política concreta antes de publicarse o procesarse.
- Enrutamiento en sistemas multiagente: selección del agente o herramienta adecuada para cada paso de un flujo multi-step, usando la distribución de probabilidad sobre las opciones como señal de decisión.
- Puntuación de candidatos o resultados: asignación de una puntuación a alternativas (por ejemplo, respuestas de un modelo generativo) para ordenarlas antes de una etapa de selección.
- Despliegue en infraestructura propia con requisitos de privacidad: al ejecutarse sobre pesos abiertos en GPU local, permite procesar estados sensibles (tickets, datos internos) sin enviarlos a servicios externos.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor en el model-index y en la model card, medidos sobre Decision Index 0.3 (suite pública de 139.677 peticiones). HLE está restringido y se puntúa como 0, por lo que la cifra es una cota inferior.

| Modelo | Muestra | Índice público | IC 95% | Latencia mediana |
|---|---|---:|---|---:|
| Keel-Pro (soup78), fast engine | suite pública completa (139.677 peticiones) | 62,73 | — (suite completa) | 245 ms (p80 438, media 528) |
| Keel-Pro (finalista, soup78) | report | 61,96 | 58,98–64,42 | 329 ms |
| Keel-Pro (soup78), fast engine | report | 61,66 | 58,83–64,28 | 316 ms (media 844, p80 847) |
| Keel-Pro (finalista, soup78) | dev | 62,06 | 56,63–64,13 | 321 ms |
| Keel-Pro it7 (ejecución única) | dev | 60,32 | 55,09–62,68 | 319 ms |
| Jev 1.14 | suite completa | 60,70 | — | — (board del proveedor) |
| Microsoft-Decision-1 | suite completa | ≈62 | — | estimación leída del gráfico de Microsoft, no medida |
| Keel-Lite (`decider-3.0.0`) sobre HTTP | dev | 5,27 | 4,68–8,11 | 19 ms |
| Qwen3.5-9B sin ajustar (prompt del kit) | dev | 10,13 | 7,80–13,75 | 125 ms |

Puntuaciones por área en la suite pública completa: knowledge 0,476, language 0,642, retrieval 0,639, tools 0,841, arts 0,565. En la muestra de informe (soup78): knowledge 0,480, language 0,625, retrieval 0,612, tools 0,817, arts 0,621. El autor advierte que la diferencia frente a Jev 1.14 y Microsoft-Decision-1 queda dentro del intervalo de confianza, por lo que debe interpretarse como paridad, no como victoria demostrada.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa 0,9 GB, pero requiere cargar el modelo base Qwen3.5-27B. Con `--load-4bit` (NF4) el conjunto puede ajustarse en GPUs de 24 GB o más; en bf16 se necesita aproximadamente el tamaño completo del modelo base de 27B más overhead.
- GPU recomendadas: RTX 5090 (32 GB) es la plataforma en la que el autor midió 245 ms de latencia mediana; también cabe en A100 (40/80 GB) y H100 (80 GB). Para GPUs de menor VRAM existe el build GGUF (Q4_K_M, 16,8 GB) para llama.cpp.
- Cabe en GPU de consumo: sí, con cuantización 4-bit o mediante el GGUF Q4_K_M; en GPUs de 16 GB el margen es ajustado y depende de la longitud de contexto.
- Opciones de despliegue: sidecar propio `serve/keel_pro_server.py` con `--load-4bit`; llama.cpp para el GGUF; el autor documenta recetas de Docker, Compose y Kubernetes en su guía de despliegue. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: latencia mediana de 245 ms por petición en RTX 5090 (p80 438 ms, media 528 ms) con el fast engine sobre la suite completa. No se proporcionan cifras de throughput (peticiones por segundo).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Índice público DI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Keel-Pro | LoRA sobre Qwen3.5-27B | 217,6 M entrenables (base 27B) | no disponible | 62,73 (suite completa, autodeclarado) | Apache-2.0 | Pesos abiertos en Hugging Face |
| Jev 1.14 | Modelo de decisión | no disponible | no disponible | 60,70 (board del proveedor) | no disponible | no disponible |
| Microsoft-Decision-1 | Modelo de decisión | no disponible | no disponible | ≈62 (estimación del gráfico del proveedor) | no disponible | no disponible |
| Keel-Lite (`decider-3.0.0`) | Modelo de decisión ONNX para CPU | no disponible | no disponible | 5,27 (muestra dev) | no disponible | Predeterminado del proyecto Keel |

La información disponible no permite comparar longitudes de contexto ni detalles de licencia de los modelos alternativos. La comparación de rendimiento se limita al índice público del Decision Index y, según el propio autor, las diferencias con Jev 1.14 y Microsoft-Decision-1 no son estadísticamente concluyentes.

## Limitaciones y advertencias

- Resultados autodeclarados: la puntuación de 62,73 proviene de una ejecución propia del autor y figura como no verificada (`verified: false`); no hay evaluación independiente.
- HLE está restringido y se contabiliza como 0, lo que penaliza aproximadamente 1,2 puntos; la cifra real podría ser superior, pero no está medida.
- El índice completo solo está disponible para la suite pública; las comparaciones con Jev 1.14 y Microsoft-Decision-1 se basan en estimaciones y quedan dentro del intervalo de confianza, por lo que no demuestran superioridad.
- Idioma: solo inglés según los metadatos; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será degradado.
- Tarea restringida: es un modelo de decisión tipada, no un generador de texto libre; no debe esperarse de él generación, código, matemáticas ni razonamiento abierto.
- Riesgo de calibración: las probabilidades devueltas dependen de los criterios y del prompt; el autor no documenta estudios de calibración fuera del Decision Index.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al heredar el modelo base Qwen3.5-27B, puede arrastrar sesgos de sus datos de entrenamiento.
- Requisito de infraestructura: necesita el modelo base de 27B además del adaptador, lo que eleva los requisitos de VRAM y almacenamiento muy por encima de los 0,9 GB del repositorio.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-27B, también Apache-2.0 según la model card.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta; el proyecto es reciente (creado en noviembre de 2026) y con poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neerumsr/keel-pro
- Build GGUF: https://huggingface.co/neerumsr/keel-pro-GGUF
- Repositorio del proyecto Keel: https://github.com/sivamtecch/Keel
- Resultados del Decision Index: https://github.com/sivamtecch/Keel/blob/main/artifacts/parity/pro/di-results.md
- Guía de servicio del sidecar: https://github.com/sivamtecch/Keel/blob/main/artifacts/parity/pro/SERVE.md
- Guía de despliegue: https://github.com/sivamtecch/Keel/blob/main/docs/deployment.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Dataset Decision Index: https://huggingface.co/datasets/apolinario/decision-index
