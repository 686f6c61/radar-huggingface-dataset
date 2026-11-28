# OmniJev/OneJev1.6-9B

## Resumen

OneJev1.6-9B es un modelo multimodal de decisión de tipo "System One" desarrollado por OmniJev. Se trata de un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, con 9.409.813.744 parámetros, orientado a una tarea muy concreta: dado un estado (una captura de pantalla, una foto, un vídeo o texto plano) junto con una serie de preguntas tipadas, el modelo devuelve en un único forward pass una probabilidad calibrada para cada opción de respuesta.

El modelo no está pensado como un generador de texto conversacional al uso, sino como un evaluador de decisiones para agentes. Sus casos de uso declarados se centran en agentes de interfaz gráfica (GUI agents), evaluación de progreso de tareas, calibración de incertidumbre y razonamiento de un solo paso sobre estados multimodales. Esto lo diferencia de los LLM generativos tradicionales: en lugar de producir una secuencia de tokens, emite distribuciones de probabilidad sobre opciones predefinidas.

Es relevante ahora porque la model card reporta una puntuación de 65,31 en la parte pública de Decision Index 0.3 (37 benchmarks, 140.178 peticiones), frente a 59,03 de la versión anterior OneJev1.5-9B, situándose en sexto lugar de 172 modelos del tablero y superando a 52 de los 57 modelos de 25B a 36B parámetros. La información disponible no detalla la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-9B), ajuste fino completo para decisión System One |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, 18,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B mediante un ajuste fino completo sobre aproximadamente 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. La arquitectura subyacente es la del transformer multimodal de Qwen3.5, adaptada para emitir probabilidades calibradas por opción en un solo paso hacia delante en lugar de generar texto autoregresivamente.

La innovación principal es el paradigma "System One": el modelo recibe un estado estructurado (`state`) con tarea y pantalla, un campo `media` para imágenes y vídeo, y un conjunto de preguntas tipadas (`noul`, `choice`, `score`). Devuelve directamente `answers.done.noul` (probabilidad de sí), `answers.next.probabilities` (una probabilidad por opción) y `answers.progress.score` (nivel esperado). El servido se realiza mediante Flide, que implementa la System One API de TypeSafe más el campo `media`. La información disponible no detalla la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Evaluación de decisiones multimodales: recibe capturas de pantalla, fotos, vídeo o texto y devuelve probabilidades calibradas por opción.
- Preguntas de tipo `noul` (sí/no) con probabilidad de acierto.
- Preguntas de tipo `choice` (elección entre opciones con criterios definidos) con distribución de probabilidad por opción.
- Preguntas de tipo `score` (nivel esperado sobre una escala de criterios).
- Procesamiento de imagen y vídeo como parte del estado de decisión.
- Soporte para agentes de interfaz gráfica (GUI agents) y evaluación de progreso de tareas.
- Razonamiento de un solo paso (single forward pass) con calibración de incertidumbre.
- Servido mediante la System One API a través de Flide (`/v1/systemone`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Agentes de automatización de interfaz gráfica: el modelo recibe la captura de pantalla actual y la tarea (por ejemplo, "pagar la factura abierta de ACME") y devuelve la probabilidad de cada acción siguiente (clic, escribir, desplazar, parar), lo que permite a un agente GUI elegir acciones de forma calibrada.
- Detección de finalización de tareas: mediante preguntas `noul`, un orquestador de agentes puede consultar si una condición se ha cumplido (por ejemplo, "la factura se ha pagado") y usar la probabilidad como señal de parada.
- Evaluación de progreso en pipelines de agentes: con preguntas `score` sobre una escala (no iniciado, a medias, casi terminado, terminado), el modelo estima el avance de una tarea a partir del estado visual.
- Enrutamiento de decisiones en sistemas multiagente: las probabilidades por opción permiten seleccionar la siguiente acción o el siguiente subagente con umbrales de confianza configurables.
- Análisis de vídeo para decisión: el campo `media` admite vídeo, lo que permite evaluar estados a lo largo del tiempo en tareas de supervisión o control.
- Calibración de incertidumbre en producción: al devolver distribuciones de probabilidad en lugar de texto libre, el modelo facilita la implementación de umbrales y la derivación a revisión humana cuando la confianza es baja.
- Evaluación automática de agentes: el modelo puede puntuar ejecuciones de otros agentes sobre conjuntos de preguntas tipadas, sirviendo como juez de decisión en pipelines de evaluación.

## Benchmarks y rendimiento

La model card reporta resultados en Decision Index 0.3 (parte pública, 37 benchmarks, 140.178 peticiones, evaluado con el kit del propio tablero):

| Modelo | Puntuación Decision Index |
|---|---|
| OneJev1.6-9B | 65,31 |
| Nace.AI Drex v1.5 | 58,08 |
| vLLM-SR d3-flash (9B) | 57,79 |
| Standard One 8B SH (v4) | 57,40 |
| Bespoke Nimble 9B v3 | 57,19 |

Frente a modelos de mayor tamaño en el tablero:

| Modelo | Parámetros | Puntuación Decision Index |
|---|---|---|
| OneJev1.6-9B | 9,4B | 65,3 |
| Torchcast Decision | no disponible | 65,1 |
| Amos 1 Large | no disponible | 64,9 |
| Decider 31B | 31B | 64,3 |
| linne-oak 1.0 | no disponible | 63,9 |
| span-02 | 26B-A4B | 63,6 |
| Matilda Jev v1.5 | 26B-33B | 63,5 |

La model card también menciona una tabla de resultados frente a Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking, pero los valores numéricos de esa tabla no están disponibles en la información proporcionada (solo se muestran como imágenes). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 18,8 GB en safetensors (probablemente en precisión bf16/fp16), por lo que se necesita al menos ~19-20 GB de VRAM para cargar los pesos sin cuantizar.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para carga completa en bf16.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 (24 GB) en bf16; en GPUs con menos VRAM sería necesaria cuantización, aunque la información disponible no detalla los tipos de cuantización soportados.
- Opciones de despliegue: Flide (`flide serve --model OmniJev/OneJev1.6-9B`), que sirve la System One API en el puerto 8000. La información disponible no menciona soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-9B | 9,4B | no disponible | 65,31 | Apache 2.0 | Hugging Face |
| Nace.AI Drex v1.5 | no disponible | no disponible | 58,08 | no disponible | no disponible |
| vLLM-SR d3-flash (9B) | 9B | no disponible | 57,79 | no disponible | no disponible |
| Standard One 8B SH (v4) | 8B | no disponible | 57,40 | no disponible | no disponible |
| Bespoke Nimble 9B v3 | 9B | no disponible | 57,19 | no disponible | no disponible |

Los cuatro modelos comparables son los de mayor puntuación en el rango de 6B a 12B parámetros del tablero Decision Index. OneJev1.6-9B también supera a 52 de los 57 modelos de 25B a 36B parámetros del tablero.

## Limitaciones y advertencias

- El modelo está especializado en decisiones tipadas (noul, choice, score); no es un generador de texto conversacional general y no debe usarse como tal.
- Los resultados de Decision Index corresponden a la parte pública del tablero y a la fecha del 16 de octubre de 2026; pueden no reflejar el rendimiento en dominios fuera de los benchmarks evaluados.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación específico ni limitaciones de contexto o idioma.
- La longitud de contexto no está documentada, lo que impide planificar su uso en estados de decisión extensos o vídeos largos.
- No se detallan los tipos de cuantización soportados, lo que limita la planificación de despliegues en hardware restringido.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B del que deriva.
- El servido depende de Flide; no se documenta compatibilidad con otros servidores de inferencia, lo que puede afectar a la portabilidad en producción.
- El modelo tiene un número reducido de descargas (609) y likes (1) en el momento de la información, lo que sugiere una adopción todavía limitada y menos validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/OmniJev/OneJev1.6-9B
- Organización en Hugging Face: https://huggingface.co/OmniJev
- GitHub: https://github.com/OmniJev/OneJev
- Sitio web: https://omnijev.github.io/OneJev/
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Repositorio Flide: https://github.com/OmniJev/Flide
- Decision Index 0.3 (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
