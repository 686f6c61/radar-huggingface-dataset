# anonymous-review-15103/tablemoe-qwen25-vl-7b-sc-rpo-ep1

## Resumen

TableMoE-Qwen2.5-VL-7B-SC-RPO-EP1 es un checkpoint de investigación publicado de forma anónima en Hugging Face como recurso de revisión para el envío #15103. No es un modelo completo ni redistribuye el backbone original: se trata de un paquete de pesos incrementales (adaptadores LoRA y pesos de conector) que debe montarse sobre el backbone oficial `Qwen/Qwen2.5-VL-7B-Instruct` de Alibaba. El modelo está orientado a tareas de razonamiento sobre tablas multimodales (Table QA), combinando visión y lenguaje.

La arquitectura es un transformer multimodal (heredero de Qwen2.5-VL) aumentado con un mecanismo de mezcla de expertos (MoE) a nivel de conector, con cuatro expertos especializados indexados de forma fija: `general`, `html`, `json` y `code`. El router y los cuatro expertos se entrenan de forma conjunta con los adaptadores LoRA, y la inferencia utiliza enrutamiento determinista Top-2 con decodificación greedy. El entrenamiento emplea SC-RPO (una variante de optimización por preferencias) durante una época.

Su relevancia es acotada: se trata de un artefacto de revisión anónima, no de un modelo listo para producción. El repositorio ocupa 1,1 GB y no incluye el backbone, la licencia del paquete no está declarada y el propio autor advierte que `AutoModel.from_pretrained` no carga este checkpoint, sino que requiere el loader incluido en `code/`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL) con conector MoE de 4 expertos y router Top-2 |
| Parámetros totales | no disponible (backbone Qwen2.5-VL-7B + adaptadores LoRA + conector MoE) |
| Parámetros activos | no disponible (enrutamiento Top-2 sobre 4 expertos en el conector) |
| Longitud de contexto | no disponible (heredada del backbone Qwen2.5-VL-7B-Instruct, no verificada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el paquete; backbone bajo Apache-2.0 según `THIRD_PARTY_NOTICES.md` |
| Formato de pesos | safetensors (`adapters/adapter.safetensors`, `weights/connector.safetensors`) |
| Tamaño del repositorio | 1,1 GB |
| Revisión del backbone | `unverified` (identificado por repo id, no por revisión git) |
| Época de entrenamiento | 1 |
| Método de alineación | SC-RPO |

## Arquitectura y entrenamiento

El modelo parte del backbone `Qwen/Qwen2.5-VL-7B-Instruct`, un transformer multimodal que procesa imágenes y texto. Sobre él se añaden dos componentes: adaptadores LoRA (`adapters/adapter.safetensors`) y un conector MoE (`weights/connector.safetensors`) formado por un router más cuatro expertos con índice fijo (`0=general`, `1=html`, `2=json`, `3=code`). El entrenamiento conjunto actualiza el router, los cuatro expertos y los adaptadores LoRA; por tanto, publicar solo el adaptador no restaura el modelo final. La normalización del merger se mantiene congelada y coincide con el checkpoint base oficial tras el dtype de carga, por lo que no se duplica en el paquete.

El método de alineación es SC-RPO aplicado durante una única época. La inferencia usa enrutamiento determinista Top-2, decodificación greedy con `do_sample=False` y `max_new_tokens=1024`. La imagen se pasa como PIL RGB a través del procesador del backbone. El autor no documenta el volumen de tokens de entrenamiento, la composición del dataset ni detalles adicionales del pipeline de RLHF/DPO más allá del nombre del método.

## Capacidades

- Razonamiento visual sobre tablas: responde preguntas sobre imágenes de tablas (Table QA) combinando percepción visual y razonamiento textual.
- Procesamiento de representaciones tabulares heterogéneas mediante expertos especializados: HTML, JSON y código, además de un experto general.
- Generación de respuestas con formato estructurado: el scorer extrae un span cerrado `<answer>...</answer>` o, en su defecto, el span no cerrado hasta el final de la generación.
- Enrutamiento Top-2 determinista entre cuatro expertos, lo que aporta especialización sin coste de cómputo proporcional al número total de expertos.
- Capacidades heredadas del backbone Qwen2.5-VL-7B-Instruct (visión, lenguaje, contexto largo), si bien el paquete no las documenta ni verifica de forma independiente.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, audio ni modo thinking.

## Casos de uso

- Extracción de respuestas sobre tablas en imágenes: dado un PNG de una tabla y una pregunta en lenguaje natural, el modelo devuelve la respuesta dentro de un span `<answer>`, útil para pipelines de document understanding.
- Evaluación de sistemas Table QA: el paquete incluye `tablemoe.score` con un parser compatible con los conjuntos WTQ, TabMWP, HiTab, TAT-QA, TabFact e InfoTabs, lo que permite reproducir la métrica de respuesta exacta.
- Investigación en arquitecturas MoE sobre conectores multimodales: el diseño router + cuatro expertos con índice fijo sirve como banco de pruebas para estudiar enrutamiento determinista Top-2.
- Reproducción de experimentos de alineación con SC-RPO: al ser un checkpoint de época 1, permite comparar el efecto de una época de preferencias sobre el backbone base.
- Análisis de tablas en formato HTML o JSON: los expertos dedicados permiten estudiar si la especialización por formato mejora el rendimiento frente a un conector monolítico.
- Revisión por pares de envíos: el paquete está pensado como recurso de revisión anónima, de modo que un revisor pueda restaurar el modelo y verificar las puntuaciones reportadas.

## Benchmarks y rendimiento

Las puntuaciones reportadas por el autor corresponden al registro de evaluación existente y no fueron reejecutadas con este paquete. El orden es TabMWP / WTQ / HiTab / TAT-QA / TabFact / InfoTabs:

| Benchmark | Puntuación |
|---|---|
| TabMWP | 88,47 |
| WTQ | 64,11 |
| HiTab | 69,67 |
| TAT-QA | 64,90 |
| TabFact | 80,85 |
| InfoTabs | 72,33 |
| Media | 73,39 |

El autor indica que las métricas de test de la época 1 coinciden con estas seis puntuaciones. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Al montar sobre Qwen2.5-VL-7B-Instruct, se requiere al menos la memoria del backbone en el dtype de carga, más los adaptadores LoRA y el conector MoE (1,1 GB de pesos incrementales en el repositorio).
- GPU recomendadas: no disponible. Por el tamaño del backbone (7B), son razonables GPUs con 24 GB o más (RTX 4090, A100, H100), pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: no confirmada; depende del dtype y de la cuantización, que no se documentan.
- Opciones de despliegue: el paquete incluye un loader propio en `code/` (`python -m tablemoe.infer`) y no es compatible con `AutoModel.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Table QA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TableMoE-Qwen2.5-VL-7B-SC-RPO-EP1 | 7B (backbone) + LoRA + MoE | no disponible | Media 73,39 en 6 benchmarks | no disponible (backbone Apache-2.0) | Checkpoint anónimo de revisión, requiere backbone |
| Qwen2.5-VL-7B-Instruct | 7B | no disponible en esta ficha | no disponible | Apache-2.0 | Público en Hugging Face |
| Otros modelos Table QA de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- El paquete no es un modelo autónomo: requiere descargar el backbone `Qwen/Qwen2.5-VL-7B-Instruct` por separado y usar el loader de `code/`; `AutoModel.from_pretrained` no funciona.
- La revisión del backbone está marcada como `unverified`, ya que el registro de entrenamiento identifica el modelo por repo id y no por revisión git; esto puede provocar diferencias de reproducibilidad.
- Las puntuaciones reportadas no se reejecutaron con este paquete; solo se afirma que las métricas de test de la época 1 coinciden con ellas.
- La licencia del paquete no está declarada; solo se indica que el backbone mantiene su licencia Apache-2.0. El uso comercial del conjunto no está claro.
- No se documentan sesgos, riesgo de alucinación, idiomas soportados ni limitaciones de contexto.
- El parser del scorer acepta spans no cerrados hasta el final de la generación, lo que puede inflar o distorsionar métricas si la generación no respeta el formato `<answer>`.
- Es un checkpoint de una sola época y de revisión anónima, sin garantías de mantenimiento ni soporte.
- El paquete incluye utilidades de evaluación adaptadas de MMTab / TableDART, con sus propias condiciones de terceros recogidas en `THIRD_PARTY_NOTICES.md`.

## Enlaces

- Hugging Face: https://huggingface.co/anonymous-review-15103/tablemoe-qwen25-vl-7b-sc-rpo-ep1
- Backbone oficial: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
