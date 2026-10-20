# netprojects/AutoTrust-JEV-27B-v1.1-mlx-4bit

## Resumen

AutoTrust-JEV-27B-v1.1-mlx-4bit es una conversión a 4 bits para Apple Silicon (MLX) del modelo de decisión AutoTrust-JEV-27B v1.1, publicado por NetProjects (Internet Projects Ltd), no afiliado a AutoTrust AI. No es un modelo de chat: cada llamada plantea una única pregunta sobre un estado y devuelve, en un solo forward pass, una distribución de probabilidad calibrada sobre un conjunto de hasta 255 opciones (`choice`) o sobre una respuesta sí/no (`noul`). Se usa para clasificar, enrutar, filtrar y ordenar, no para generar texto.

El modelo subyacente parte de Qwen3.8-27B congelado y añade un bloque de decisión de 108,9 M de parámetros, destilado de las distribuciones de salida del modelo propietario TypeSafe Jev 1.13. Una particularidad crítica: el modelo fue entrenado para leer el prompt de forma bidireccional en sus 16 capas de atención completa, algo que las librerías estándar (`mlx-lm`, `mlx-vlm`) no reproducen; cargar estos pesos con ellas da respuestas distintas. Por eso el autor distribuye `jev27b-mlx`, que replica la atención, el formato de prompt (`jev_format.py`) y la lectura de decisión.

Esta build concreta ocupa 16 GB en disco y unos 18 GB de memoria en uso, está pensada para Macs de 24-32 GB de memoria unificada y coincide con los pesos bf16 en 227 de 231 decisiones de prueba (KL medio 0,004). Es relevante para quien necesite inferencia local de clasificación calibrada en hardware de Apple sin depender de GPU dedicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B congelado + bloque de decisión de 108,9 M de parámetros); atención bidireccional sobre el prompt en las 16 capas full-attention |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (el autor reporta pruebas con prompts de hasta 3.970 tokens) |
| Tipos de cuantizacion | 4-bit affine, group size 64, en todas las capas; las filas de lectura de decisión de `lm_head` se mantienen a 8 bits. Existe también una build de 8 bits |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (misma que el modelo original; avisos en `NOTICE.base` y `LICENSE.base-apache-2.0`) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); repo de 16,7 GB |
| Pipeline declarado | `text-classification` |
| Modelo base | `autotrust/AutoTrust-JEV-27B-v1.1` (relación: quantized) |
| Salida | Distribución de probabilidad sobre hasta 255 opciones o decisión sí/no; sin generación de texto |
| Fecha de publicación | 19 de octubre de 2026 |

## Arquitectura y entrenamiento

La build es una cuantización del modelo de decisión AutoTrust-JEV-27B v1.1, que a su vez se construye sobre Qwen3.8-27B (pesos congelados) con un bloque de decisión adicional de 108,9 M de parámetros. El modelo se entrenó sobre las distribuciones de salida publicadas de TypeSafe Jev 1.13, un modelo propietario de TypeSafe AI que actúa como profesor; el estudiante de pesos abiertos se construyó a partir del corpus Apache-2.0 `SargeDev/jev-distill-corpus-v3`. Un mismo conjunto de pesos puede responder preguntas tipadas en un solo paso (modo System 1) o generar texto con la base intacta (System 2), aunque esta build MLX está orientada explícitamente a la decisión.

La innovación técnica principal es la lectura bidireccional del prompt en las 16 capas de atención completa, según la especificación de StartLux-Decision; el modelo original se sirve en vLLM con el plugin prefix-bidirectional de StartLux. La conversión se hizo con `mlx-vlm` (4-bit affine, group size 64), dejando a 8 bits únicamente las filas de `lm_head` que producen la lectura de decisión, para preservar la calibración. El autor no documenta en esta ficha el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF/DPO; esos datos corresponden a la model card del modelo original.

## Capacidades

- Clasificación de texto en una sola pasada, con hasta 255 etiquetas arbitrarias suministradas por el usuario.
- Decisiones booleanas (`noul`) con probabilidad calibrada, útiles como compuertas o filtros.
- Enrutamiento y asignación: elegir entre categorías, equipos, colas o herramientas.
- Ranking de opciones por probabilidad dentro de la misma llamada.
- Respuesta determinista en formato: salida estructurada como `{"choice": ..., "probabilities": ...}`.
- Lectura bidireccional del prompt, lo que permite condicionar la decisión a información que aparece después de la pregunta en el texto.
- Capacidad de generación de texto heredada de Qwen3.8-27B, pero no es el uso previsto de esta build y no está verificada en la model card.
- Multilingüe: no disponible; el modelo declara únicamente inglés.
- Sin soporte de tool calling, agentes multi-paso, visión ni audio en esta build (el autor indica explícitamente "text only").

## Casos de uso

- Enrutamiento de tickets de soporte: se declara una pregunta tipo "¿qué equipo debe gestionar este ticket?" con opciones como facturación, envíos, soporte técnico o seguridad de la cuenta, y se usa la opción de mayor probabilidad para asignar la cola. Es el ejemplo que documenta el propio autor y encaja porque la decisión se resuelve en un único forward pass de ~285 ms.
- Triaje de correo o mensajes entrantes: clasificación en un conjunto cerrado de categorías (hasta 255), con la probabilidad asociada disponible para derivar a revisión humana cuando la confianza es baja.
- Moderación y compuertas de contenido: decisión sí/no sobre si un texto cumple una política concreta, con umbral configurable sobre la probabilidad devuelta.
- Enrutado dentro de pipelines de agentes: elegir la siguiente herramienta o el siguiente paso entre un conjunto finito de opciones, aprovechando que la salida es una distribución y no texto libre que haya que parsear.
- Priorización de colas: decidir si una incidencia es urgente o no, o clasificarla en niveles de severidad, en local y sin enviar datos a un servicio externo.
- Etiquetado a granel de datasets en local: al ejecutarse en Apple Silicon con 18 GB de memoria en uso, permite clasificar corpus sensibles sin salir del portátil.
- Verificación de duplicados o incidencias de facturación: decidir si dos descripciones corresponden al mismo problema entre un conjunto acotado de causas.

## Benchmarks y rendimiento

Verificación del autor frente a los pesos bf16 originales, con 231 decisiones del conjunto público JevBench en formato de prompt propio del modelo, sobre un MacBook Pro M5 Max. La referencia PyTorch independiente (transformers, atención en float32 sin máscara en las capas full-attention) se midió en 39 prompts:

| Build | Tamano | Memoria en uso | Misma respuesta que bf16 (231) | Deriva de probabilidad, KL media / p95 | Igual que PyTorch (39) | Mediana por decision |
|---|---|---|---|---|---|---|
| 8-bit | 28 GB | 31 GB | 231 / 231 | 0,0002 / 0,0004 | 39 / 39 | 318 ms |
| 4-bit (esta build) | 16 GB | 18 GB | 227 / 231 | 0,004 / 0,019 | 39 / 39 | 285 ms |

Datos adicionales aportados por el autor:

| Metrica | Resultado |
|---|---|
| Acierto en JevBench publico, pesos originales en MLX | 209 / 231 |
| Acierto en JevBench publico, build 8-bit | 209 / 231 |
| Acierto en JevBench publico, build 4-bit | 210 / 231 |
| Coincidencia del motor MLX con la referencia PyTorch sobre bf16 | 39 / 39 (KL 0,0001) |
| Latencia con prompts de 3.000-4.000 tokens | 3,5-6 s |
| Memoria en uso medida | Sobre un prompt de 3.970 tokens |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de generación de texto para esta build; los resultados del Decision Index del modelo original se remiten a su model card.

## Requisitos de hardware

- Pesos en disco: 16,7 GB (safetensors 4-bit). La build de 8 bits ocupa 28 GB.
- Memoria en uso medida por el autor: 18 GB con un prompt de 3.970 tokens (31 GB para la build de 8 bits).
- Recomendación del autor: Macs con 24-32 GB de memoria unificada.
- Plataforma: exclusivamente Apple Silicon vía MLX; este repositorio no incluye pesos para CUDA. El modelo original se sirve en vLLM con el plugin prefix-bidirectional de StartLux.
- GPU dedicadas (A100, H100, RTX 4090): no disponible para esta build; no hay conversión documentada a otros backends.
- Despliegue: librería `jev27b-mlx` (`pip install "git+https://github.com/internet-projects/jev27b-mlx"`), uso como módulo Python (`jev27b_mlx.load`, `jev.question`, `jev.decide`) o como servidor con `python -m jev27b_mlx serve` y endpoint `POST /v1/decide`.
- `mlx-lm` y `mlx-vlm` estándar no son válidos: leen el prompt de forma causal y producen respuestas distintas.
- Latencia: 285 ms de mediana por decisión con prompts de ~150 tokens, medido con otros modelos ejecutándose en la misma máquina; 3,5-6 s con prompts de 3.000-4.000 tokens.
- Throughput: no disponible; el autor indica que procesa una decisión a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/AutoTrust-JEV-27B-v1.1-mlx-4bit (esta build) | 27,36 B | No disponible | MLX 4-bit, 16 GB | Apache-2.0 | 227/231 coincidencias con bf16; 210/231 en JevBench; 285 ms por decisión en M5 Max |
| netprojects/AutoTrust-JEV-27B-v1.1-mlx-8bit | 27,36 B | No disponible | MLX 8-bit, 28 GB | Apache-2.0 | 231/231 coincidencias con bf16; 209/231 en JevBench; 318 ms por decisión |
| autotrust/AutoTrust-JEV-27B-v1.1 (original) | 27,36 B | No disponible | bf16 | Apache-2.0 | Referencia de calibración; requiere vLLM con plugin bidireccional |
| netprojects/JEV-35B-mlx-8bit | No disponible | No disponible | MLX 8-bit | No disponible en la información | Modelo de decisión MoE de AutoTrust, con visión |
| Qwen/Qwen3.8-27B (base) | ~27 B (no confirmado en la información) | No disponible | safetensors | No disponible en la información | Modelo generativo; el bloque de decisión de JEV se entrena sobre él congelado |

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto ni mantiene diálogos; solo devuelve una distribución sobre opciones o una decisión sí/no.
- Solo inglés declarado; el rendimiento en otros idiomas no está documentado.
- Requiere una librería específica (`jev27b-mlx`). Cargar los pesos con `mlx-lm` o `mlx-vlm` altera la atención y, por tanto, las respuestas.
- La cuantización a 4 bits introduce deriva: 4 discrepancias sobre 231 decisiones frente a bf16 y un KL p95 de 0,019. En dominios donde la calibración sea crítica, conviene evaluar la build de 8 bits.
- La precisión en JevBench es moderada (210/231, en torno al 91 %), por lo que el modelo puede equivocarse en decisiones de frontera; se recomienda umbral de confianza y revisión humana.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de calibración excesiva, es decir, asignar alta probabilidad a una opción incorrecta en entradas fuera de distribución.
- Solo texto; sin visión, audio ni tool calling en esta build.
- Licencia Apache-2.0 permite uso comercial, pero obliga a conservar los avisos de copyright y licencia (`NOTICE.base`, `LICENSE.base-apache-2.0`); el modelo se distribuye sin garantías.
- NetProjects no está afiliado a AutoTrust AI; los problemas de soporte o comportamiento deben contrastarse contra la model card del modelo original.
- Adopción nula en el momento de la ficha (0 descargas, 0 likes) y fecha de publicación reciente: no hay validación independiente más allá de la reportada por el autor.
- Longitud máxima de contexto no documentada; las pruebas se limitan a prompts de hasta ~4.000 tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/netprojects/AutoTrust-JEV-27B-v1.1-mlx-4bit
- Modelo base: https://huggingface.co/autotrust/AutoTrust-JEV-27B-v1.1
- Build de 8 bits: https://huggingface.co/netprojects/AutoTrust-JEV-27B-v1.1-mlx-8bit
- Repositorio del runtime MLX: https://github.com/internet-projects/jev27b-mlx
- Organización NetProjects en HuggingFace: https://huggingface.co/netprojects
- JEV-27B (modelo original de AutoTrust): https://huggingface.co/autotrust/JEV-27B
- Blog de AutoTrust sobre JEV-27B: https://huggingface.co/blog/autotrust/autotrustjev-27b-fast-calibrated-decisions-and-ful
- Ficha en systemonemodels.ai: https://systemonemodels.ai/autotrust-ai/jev-27b
- Especificaciones en gradually.ai: https://www.gradually.ai/en/ai-models/autotrustjev-27b/
- Corpus de destilación: https://huggingface.co/SargeDev/jev-distill-corpus-v3
- Base arquitectónica citada: https://huggingface.co/vllm-sr/d3
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Especificación de atención bidireccional: https://github.com/StartLuxLabs/StartLux-Decision
- Herramienta de conversión: https://github.com/Blaizzy/mlx-vlm
- JEV-35B en MLX: https://huggingface.co/netprojects/JEV-35B-mlx-8bit
- H2O-Lightning-4B en MLX: https://huggingface.co/netprojects/h2o-lightning-4b-mlx-q8
