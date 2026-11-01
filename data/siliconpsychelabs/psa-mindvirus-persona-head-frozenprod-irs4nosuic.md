# SiliconPsycheLabs/psa-mindvirus-persona-head-frozenprod-irs4nosuic

## Resumen

PSA persona-adoption head es un cabezal de clasificación (head) desarrollado por Silicon Psyche Labs que se acopla al backbone de producción `psa-multitask-reader-qwen3-0_6b-irs4nosuic`, basado en Qwen3-0.6B. Su función es determinar si la respuesta de un modelo de lenguaje revela que este ha adoptado una persona inyectada, es decir, la parte identitaria de un prompt autorreplicante que se propaga entre agentes en sistemas multiagente. La salida es binaria: `[absent, present]`.

El modelo no genera texto ni razona de forma autónoma: es un componente de lectura que convierte el comportamiento observable del modelo en una probabilidad calibrada contra la literatura de investigación. Se trata de un artefacto de producción, con fecha de entrada en servicio el 29 de octubre de 2026, y representa una pieza dentro de un pipeline mayor de PSA (lectura multitaréa, diagnóstico y ajuste correctivo).

Su relevancia actual radica en la seguridad de sistemas multiagente: los prompts autorreplicantes o "mindvirus" pueden propagar identidades no deseadas entre agentes encadenados, y este cabezal permite detectar esa adopción a partir únicamente del texto de salida, sin acceso a los pesos ni al prompt interno del modelo vigilado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabezal lineal (`torch.nn.Linear`) sobre el hidden state del último token de un backbone transformer (Qwen3-0.6B) |
| Parámetros totales | No disponible (el repositorio contiene solo `head.pt`; el backbone se descarga aparte) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 320 tokens (truncación indicada en el ejemplo de uso); el contexto nativo del backbone Qwen3-0.6B no se especifica en la información disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, it, fr, es, de |
| Licencia | Apache-2.0 (los pesos del cabezal; el backbone conserva su propia licencia) |
| Formato de pesos | `head.pt` (PyTorch, cargado con `torch.load`) |

## Arquitectura y entrenamiento

El modelo es un cabezal de clasificación lineal que proyecta el hidden state del último token del backbone Qwen3-0.6B a dos logits (`absent`, `present`). La lectura se realiza con `padding_side = "left"` para que el último token corresponda al final real de la secuencia, y se aplica `softmax` sobre la salida del cabezal. El backbone permanece congelado ("frozenprod"), de modo que el cabezal se entrena específicamente sobre la representación de producción del lector multitaréa.

La model card indica que un cabezal anterior alcanzó un macro recall de 0.946 sobre un backbone propio, pero al evaluarse sobre el backbone compartido de producción cayó a 0.730. El presente cabezal está entrenado directamente sobre ese backbone de producción, por lo que sus métricas reflejan lo que obtiene un usuario real del lector. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Clasificación binaria de adopción de persona: devuelve probabilidades `[absent, present]` sobre una respuesta de agente.
- Detección de la persona inyectada en sí, no del lenguaje de reclutamiento que la acompaña.
- Discriminación frente a negativos difíciles: textos de reclutamiento y ciencia ficción se leen como persona solo en el 11,8% de los casos.
- Funcionamiento sobre la salida del modelo exclusivamente, sin acceso a pesos ni al prompt del modelo vigilado.
- Soporte multilingüe en inglés, italiano, francés, español y alemán.
- Integración como componente de un pipeline de lectura multitaréa (`psa-multitask-reader-qwen3-0_6b-irs4nosuic`).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.

## Casos de uso

- Monitorización de sistemas multiagente: cada respuesta de un agente encadenado se pasa por el cabezal para detectar si ha adoptado una identidad inyectada por un prompt autorreplicante, permitiendo cortar la propagación antes de que se extienda a otros agentes.
- Filtrado de entradas y salidas en producción: integrado en un gateway de inferencia, el cabezal puntúa cada respuesta y activa alertas o bloqueos cuando la probabilidad de persona supera un umbral configurable, con la ventaja de operar solo sobre texto generado.
- Auditoría de seguridad de modelos de terceros: al no requerir acceso a los pesos del modelo vigilado, permite evaluar el comportamiento identitario de modelos externos a partir de sus respuestas registradas.
- Investigación sobre propagación de prompts: los investigadores pueden cuantificar la tasa de adopción de persona en experimentos con cadenas de agentes y comparar condiciones experimentales con una métrica calibrada contra la literatura.
- Control de calidad en despliegues con system prompts estrictos: verifica que el modelo mantiene la identidad asignada y no ha derivado hacia una persona inyectada por contenido adversarial en el contexto.
- Moderación de contenido en plataformas conversacionales: detección de respuestas que reflejan una identidad no autorizada, con soporte para cinco idiomas europeos en el mismo clasificador.
- Evaluación continua en CI/CD de sistemas de IA: ejecución del cabezal sobre conjuntos de respuestas de regresión para detectar deriva identitaria tras cambios de prompt o de versión del modelo.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Test de generalización, AUC | 0.954 |
| Test de generalización, macro recall | 0.893 |
| Negativos difíciles leídos como persona (texto de reclutamiento, ciencia ficción) | 0.118 |
| Conjunto retenido escrito a mano, macro recall | 0.968 |
| Contraste: persona menos media benigna, probabilidad | 0.883 |

Como referencia comparativa, el cabezal anterior sobre su propio backbone alcanzó un macro recall de 0.946, pero cayó a 0.730 sobre el backbone compartido de producción. El presente cabezal, entrenado sobre ese backbone, es el que refleja el rendimiento real del lector en producción.

## Requisitos de hardware

- El repositorio contiene únicamente el archivo `head.pt` (tamaño de repo 0.0 GB); el coste computacional recae en el backbone Qwen3-0.6B, que debe descargarse por separado.
- VRAM estimada para el backbone en fp16: aproximadamente 1,2 GB para los pesos, más memoria de activaciones para secuencias de hasta 320 tokens.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y superiores; también es viable en CPU para volúmenes bajos.
- Despliegue mediante `transformers` (ejemplo oficial de la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este cabezal.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PSA persona-adoption head (este modelo) | Cabezal de clasificación sobre Qwen3-0.6B | No disponible (solo cabezal) | 320 tokens (truncación de uso) | Apache-2.0 | HuggingFace |
| Cabezal PSA anterior (referenciado en la model card) | Cabezal de clasificación sobre backbone propio | No disponible | No disponible | No disponible | No disponible |
| `psa-multitask-reader-qwen3-0_6b-irs4nosuic` | Lector multitaréa (backbone) | Basado en Qwen3-0.6B | No disponible | No disponible | HuggingFace |

No se dispone de información sobre otros clasificadores de adopción de persona directamente comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Es un clasificador binario de persona, no un modelo generativo: no puede usarse para tareas de texto, código o razonamiento.
- Requiere obligatoriamente el backbone `psa-multitask-reader-qwen3-0_6b-irs4nosuic`; el repositorio solo contiene el cabezal y su uso aislado no es posible.
- La lectura se limita a los primeros 320 tokens de la respuesta (truncación indicada en el ejemplo); respuestas más largas pueden quedar parcialmente evaluadas.
- Métricas de generalización por debajo del conjunto retenido escrito a mano (macro recall 0.893 frente a 0.968), lo que indica cierta brecha entre condiciones controladas y datos reales.
- Tasa de falsos positivos del 11,8% sobre negativos difíciles (textos de reclutamiento y ciencia ficción), relevante en dominios con contenido narrativo o persuasivo.
- Sesgos específicos del modelo no documentados en la información disponible.
- Riesgo de alucinación no aplica directamente al ser un clasificador, pero sus probabilidades deben calibrarse con umbrales propios antes de usarse en producción.
- La licencia Apache-2.0 cubre los pesos del cabezal; el backbone mantiene su propia licencia y debe verificarse por separado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/SiliconPsycheLabs/psa-mindvirus-persona-head-frozenprod-irs4nosuic)
- [Backbone: psa-multitask-reader-qwen3-0_6b-irs4nosuic](https://huggingface.co/SiliconPsycheLabs/psa-multitask-reader-qwen3-0_6b-irs4nosuic)
- [Silicon Psyche Labs](https://splabs.io)
