# frontier-infra/jebadiah-4b-v2

## Resumen

Jebadiah 4B v2 es un modelo de decisión de estilo «System One» desarrollado por Frontier Infra (bajo el identificador `frontier-infra` en Hugging Face). A diferencia de un modelo generativo convencional, no produce texto libre: recibe una pregunta tipada y devuelve una distribución de probabilidad sobre las etiquetas de respuesta en un único forward pass. Soporta tres tipos de pregunta: `choice` (elegir una entre N opciones), `noul` (afirmación sí/no, devuelta como P(yes)) y `score` (situar un estado en una rúbrica ordenada).

Técnicamente es un fine-tuning con LoRA fusionado sobre `Qwen/Qwen3.5-4B` (revisión `851bf6e8`, el checkpoint de chat con el modo thinking desactivado), con 4.659.865.088 parámetros en pesos bf16 y licencia Apache 2.0. La diferencia respecto a la v1 es únicamente la base: la v1 se entrenó sobre `Qwen/Qwen3.5-4B-Base`; los datos, el LoRA, el objetivo y los ajustes de temperatura se mantienen. Está entrenado exclusivamente con datos públicos.

Su relevancia radica en que expone decisiones calibradas y tipadas en lugar de generación abierta, lo que facilita integrarlo en sistemas que necesitan una señal probabilística estructurada (enrutado, clasificación, evaluación de calidad) con una sola pasada y sin decodificación autoregresiva. Sirve un endpoint compatible con TypeSafe `/v1/systemone`, de modo que un cliente Jev existente funciona cambiando la URL. El autor advierte que esta es una versión anterior y que para trabajo nuevo conviene usar la v2.1 (9B o 27B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con LoRA fusionado; cabecera de decisión sobre etiquetas |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repo (pesos bf16); existe build MLX separado |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 9,3 GB |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only Qwen3.5 de 4B parámetros y se adapta mediante LoRA, que posteriormente se fusiona en los pesos completos en bf16. La innovación no está en la arquitectura base sino en la cabeza de decisión: en lugar de generar tokens, el modelo lee un logit por etiqueta candidata y normaliza para obtener una probabilidad calibrada, con una sola lectura por pregunta. El prompt se renderiza de forma idéntica para todos los modelos evaluados, lo que hace comparables las métricas.

El entrenamiento usa exclusivamente datos públicos: `LocalLLaMA/typed-decisions`, `nvidia/HelpSteer2` y `mteb/summeval`. Los datos, el objetivo y los ajustes de temperatura son los de la v1; desde el 2026-09-29 la temperatura aplicada al tipo `score` es la ajustada contra la etiqueta. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El autor no publica detalles de la innovación de decodificación porque no hay decodificación: la inferencia es un único forward pass.

## Capacidades

- Decisión tipada `choice`: selección de una etiqueta entre N opciones con probabilidad asociada.
- Decisión tipada `noul`: evaluación de una afirmación sí/no devuelta como P(yes).
- Decisión tipada `score`: posicionamiento de un estado sobre una rúbrica ordenada.
- Probabilidades calibradas por etiqueta, aptas para umbrales y enrutado.
- Inferencia de una sola pasada por pregunta, sin generación autoregresiva.
- Compatibilidad con el endpoint TypeSafe `/v1/systemone` (clientes Jev).
- Ejecución como modelo estándar de transformers y en vLLM.
- No dispone de tool calling, agentes, razonamiento multi-paso ni visión funcional, pese a la etiqueta de pipeline `image-text-to-text` heredada del modelo base.
- Multilingüe: solo inglés declarado.

## Casos de uso

- Enrutado de consultas en atención al cliente: clasificar cada mensaje entrante en una de las categorías del servicio (tipo `choice`) con una probabilidad que permite derivar a un humano cuando la confianza es baja.
- Moderación y filtrado binario: evaluar afirmaciones del tipo «este texto cumple la política X» como P(yes) (`noul`) y aplicar umbrales configurables antes de publicar.
- Evaluación automática de calidad de respuestas: puntuar helpfulness o corrección sobre una rúbrica ordenada (`score`), reutilizando el tipo de dato de HelpSteer2.
- Clasificación de intenciones en asistentes conversacionales: elegir entre decenas de intents (como en Banking77) en una sola pasada, con coste muy inferior al de un modelo generativo.
- Verificación de respuestas en pipelines RAG: comprobar con `noul` si un fragmento recuperado respalda la afirmación generada antes de mostrarla al usuario.
- Triaje en dominios científicos o médicos: responder preguntas de opción múltiple o sí/no sobre literatura (tipo PubMedQA) como señal previa a una revisión humana.
- Priorización en colas de revisión: usar la probabilidad de la etiqueta ganadora como score de ordenación para que los revisores atiendan primero los casos ambiguos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Suite | Tarea | Métrica | Valor |
|---|---|---|---|
| Jevals 0.1.0, PubMedQA (noul) | typed decisions | accuracy | 88,7 |
| Jevals 0.1.0, PubMedQA (noul) | typed decisions | decision_score_jevals | 61,8 |
| Jevals 0.1.0, Banking77 (choice, 77 vías) | typed decisions | accuracy | 70,0 |
| Jevals 0.1.0, Banking77 (choice, 77 vías) | typed decisions | decision_score_jevals | 57,4 |
| Jevals 0.1.0, HelpSteer2 helpfulness (score) | typed decisions | decision_score_jevals | 9,4 |
| Nimble public human-labelled subsets (13, macro accuracy) | typed decisions | accuracy | 75,9 |

El autor indica que el 4B no se ha ejecutado en JevBench ni tiene posición en el Decision Index; esas cifras corresponden a las variantes 9B y 27B. La tabla comparativa de accuracy entre 27B, 9B v2 y 4B v2 aparece truncada en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB de pesos, más overhead de activaciones y KV cache; aproximadamente 10-12 GB en la práctica.
- GPU recomendadas: A100, H100 o L40S para servicio en vLLM; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso local en bf16.
- GPU de consumo: cabe en tarjetas de 16 GB o más en bf16; en 12 GB requeriría cuantización, de la que no se publican builds GGUF para este tamaño en la información disponible.
- Despliegue: transformers y vLLM para pesos completos; existe un build MLX (`jebadiah-4b-v2-MLX`) para Apple silicon. El autor remite a llama.cpp, Ollama o LM Studio para la variante 9B GGUF, no para la 4B.
- Latencia y throughput: no disponibles; al ser un único forward pass por pregunta, el coste por decisión es sustancialmente menor que el de una generación autoregresiva equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jebadiah-4b-v2 | 4,66B | no disponible | Decisión tipada con probabilidades | Apache 2.0 | HF, vLLM, MLX |
| jebadiah-9b-v2 | no disponible | no disponible | Decisión tipada con probabilidades | Apache 2.0 | HF, GGUF, MLX |
| jebadiah-27b | no disponible | no disponible | Decisión tipada con probabilidades | Apache 2.0 | HF, MLX |
| Qwen3.5-4B (base) | 4B (aprox.) | no disponible | Generación de texto | no disponible | HF |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada; la comparación con la familia Jebadiah se limita a la existencia de las variantes, ya que la tabla de accuracy comparativa está truncada.

## Limitaciones y advertencias

- Versión obsoleta: el autor recomienda explícitamente usar la v2.1 para trabajo nuevo; esta 4B v2 no tiene posición en el Decision Index.
- Solo inglés declarado; el rendimiento en otros idiomas no está documentado.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso; usarlo como chatbot no es su propósito.
- La etiqueta de pipeline `image-text-to-text` procede del modelo base y no implica capacidades de visión verificadas en esta ficha.
- Riesgo de calibración deficiente fuera de las distribuciones de los datasets de entrenamiento (Banking77, PubMedQA, HelpSteer2, SummeVal); las probabilidades deben validarse en el dominio objetivo.
- Los benchmarks son autoinformados y no verificados (`verified: false`); el propio autor los describe como sus números sobre suites públicas, no como filas del board oficial.
- Sesgos: no documentados en la información disponible, pero heredados del corpus público de entrenamiento y del modelo base Qwen3.5.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B, no detalladas aquí.
- No se publican datos de longitud de contexto, por lo que no puede garantizarse el manejo de entradas largas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frontier-infra/jebadiah-4b-v2
- Código: https://github.com/getainode/jebadiah
- Documentación para ejecución local: https://github.com/getainode/jebadiah/blob/main/docs/run-locally.md
- Sitio del proyecto: https://jebadiah.ai
- Playground: https://huggingface.co/spaces/frontier-infra/jebadiah-playground
- Decision Index 0.2.1: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Resultados del Decision Index (runs): https://huggingface.co/datasets/frontier-infra/jebadiah-decision-index-results/tree/main/runs/jebadiah-27b-1c0d794f
- Colección Jebadiah: https://huggingface.co/collections/frontier-infra/jebadiah-open-system-one-decision-models-6ab80765ddd3fa0b3eba5213
- ModelScope: https://www.modelscope.ai/profile/JasonBrashear
- Variante 27B: https://huggingface.co/frontier-infra/jebadiah-27b
- Variante 9B v2: https://huggingface.co/frontier-infra/jebadiah-9b-v2
- Variante 9B v2 GGUF: https://huggingface.co/frontier-infra/jebadiah-9b-v2-GGUF
- Variante 4B v2 MLX: https://huggingface.co/frontier-infra/jebadiah-4b-v2-MLX
- Versión anterior 4B v1: https://huggingface.co/frontier-infra/jebadiah-4b-v1
- LLM Engineer Toolkit: https://github.com/KalyanKS-NLP/llm-engineer-toolkit
- awesome-jev-tools: https://github.com/v-modal/awesome-jev-tools
