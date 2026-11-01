# AbstractFramework/kev-4b-mlx-8bit

## Resumen

Kev-4B para MLX en 8 bits es una conversión cuantizada del modelo de decisión `jaredpalmer/kev-4b`, publicada por AbstractFramework. No es un modelo generativo al uso: lee un documento (el *state*) y responde preguntas tipadas sobre él —`choice` sobre opciones con nombre, `noul` (probabilidad de que una afirmación sea cierta) y `score` sobre niveles ordenados— devolviendo probabilidades calibradas en un único forward pass, sin generar texto. Esto lo sitúa en la categoría de modelos de clasificación y decisión estructurada, no en la de asistentes conversacionales.

El modelo original de Jared Palmer es un LoRA de rango 16 con un *pointer head* montado sobre una base Qwen3.5, todo bajo licencia Apache-2.0. Esta versión concreta pliega el adaptador en la base, cuantiza el backbone a 8 bits con grupos de 64 para `mlx-lm` (4,2 GB) y mantiene la cabeza en float32. Con 4.205.751.296 parámetros totales y un pipeline declarado de `text-classification`, está pensado para ejecutarse en Apple Silicon mediante MLX y para integrarse en el runtime AbstractCore.

Su relevancia actual radica en el formato: frente a pedir a un LLM que emita JSON y parsearlo, Kev-4B produce directamente distribuciones de probabilidad calibradas (ECE de 0,025 en el conjunto de desarrollo declarado), lo que simplifica el enrutamiento, el triaje y la puntuación en pipelines de producción donde la latencia y la fiabilidad del formato importan más que la fluidez del texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5) con LoRA de rango 16 plegado y pointer head para decisión |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (backbone); cabeza en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); `head.safetensors` en float32, `decision.json` con la receta |

## Arquitectura y entrenamiento

La arquitectura parte de un modelo base Qwen3.5 sobre el que se aplica un adaptador LoRA de rango 16 y se añade una cabeza de puntero (*pointer head*) que mapea el estado oculto a las opciones o niveles definidos en cada pregunta. En esta conversión, el adaptador se ha fusionado con la base y el backbone se ha cuantizado a 8 bits con grupos de 64 para el runtime `mlx-lm`; la cabeza se conserva en float32 para no degradar la calibración. La conversión se realizó con `python -m abstractcore.decision.convert`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada. El autor sí documenta un conjunto de evaluación propio, `public-pool-v6` (1.328 registros), y una comparación contra el checkpoint en bf16 que indica que la cuantización apenas altera las salidas: concordancia de argmax de 0,997 y diferencia media absoluta de probabilidad de 0,004.

## Capacidades

- Clasificación por elección (`choice`) entre opciones con nombre y criterios descriptivos definidos por el usuario.
- Estimación de probabilidad de veracidad (`noul`) para afirmaciones sobre el documento de entrada.
- Puntuación ordinal (`score`) sobre niveles ordenados, por ejemplo escalas de frustración o severidad.
- Salida de probabilidades calibradas en un solo forward pass, sin decodificación autoregresiva de texto.
- Definición dinámica de preguntas en tiempo de inferencia mediante un esquema JSON (tipo, instrucciones y criterios).
- Integración con el runtime AbstractCore, tanto en Python (`create_llm`) como por HTTP (`POST /v1/decisions`).
- Ejecución en Apple Silicon mediante MLX.
- No se documentan capacidades de generación libre, tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Triaje de tickets de soporte: el ejemplo de la model card enruta una reclamación a `returns`, `shipping` o `billing`, estima la probabilidad de escalado urgente y puntúa la frustración del cliente en una sola llamada, lo que permite priorizar la cola sin un LLM generativo intermedio.
- Enrutamiento de correo entrante: clasificar mensajes por departamento con criterios definidos por el equipo y usar la probabilidad `noul` como umbral para derivar los casos ambiguos a revisión humana.
- Moderación y evaluación de riesgo: puntuar contenido en niveles ordenados (`score`) con probabilidades calibradas, lo que facilita fijar umbrales operativos y auditar la tasa de falsos positivos.
- Extracción de señales en encuestas y reseñas: convertir texto libre en etiquetas estructuradas y probabilidades, agregables después en métricas de producto.
- Verificación de afirmaciones contra un documento: usar `noul` para comprobar si una frase es consistente con el estado proporcionado, por ejemplo en control de calidad de resúmenes.
- Clasificación en local sobre Mac: con 4,2 GB de pesos en 8 bits y 136 ms por registro en un M5 Max, es viable procesar lotes en un portátil sin GPU dedicada ni conexión a la nube.
- Enrutamiento dentro de pipelines de agentes: sustituir la llamada a un LLM generativo por una decisión tipada cuando solo se necesita una etiqueta y una probabilidad, reduciendo coste y latencia.

## Benchmarks y rendimiento

| Metrica | Valor (8 bits MLX) | Referencia bf16 |
|---|---|---|
| Exactitud (public-pool-v6 dev, 1.328 registros) | 0,846 | 0,846 |
| Brier score | 0,227 | no disponible |
| ECE (error de calibración esperado) | 0,025 | no disponible |
| Concordancia de argmax con bf16 | 0,997 | — |
| Diferencia media absoluta de probabilidad | 0,004 | — |
| Desplazamiento máximo de probabilidad por pregunta | < 0,10 | — |
| Latencia por registro | 136 ms en M5 Max | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, algo esperable dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM/unified memory: aproximadamente 4,2 GB para los pesos en 8 bits, más overhead del runtime MLX y de la cabeza en float32.
- Hardware objetivo: Apple Silicon con MLX; el autor reporta 136 ms por registro en un M5 Max.
- GPU NVIDIA: no se documenta soporte CUDA para este artefacto concreto; el formato es específico de `mlx-lm`.
- GPU de consumo: cabe en equipos Apple con memoria unificada de 8 GB o más; no hay datos para tarjetas gráficas discretas.
- Despliegue: `mlx-lm` y el runtime AbstractCore (`create_llm("mlx", ...)` o servidor HTTP con `POST /v1/decisions`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible más allá de la latencia por registro indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kev-4b-mlx-8bit (esta ficha) | 4,2 B | no disponible | Decisión tipada con probabilidades calibradas, solo MLX | Apache-2.0 | HuggingFace, 0 descargas |
| jaredpalmer/kev-4b (original) | no disponible | no disponible | Decisión tipada, checkpoint bf16 con LoRA y pointer head | Apache-2.0 | HuggingFace |
| LLM generativo con salida JSON (p. ej. Qwen3.5 base) | no disponible | no disponible | Generación de texto con formato inducido por prompt | Apache-2.0 (base) | HuggingFace |
| Clasificadores BERT pequeños | 0,1-0,5 B | 512 tokens típicos | Clasificación supervisada de etiqueta fija | variable | HuggingFace |

La comparación directa con clasificadores BERT no es del todo equivalente: Kev-4B permite definir las preguntas y los criterios en tiempo de inferencia, mientras que un clasificador BERT requiere reentrenamiento por tarea. Frente a un LLM generativo, la ventaja está en la calibración y en evitar el parseo de JSON; la desventaja, en la ausencia de capacidades generativas y de tool calling.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre ni mantiene conversaciones; usarlo como asistente dará resultados incorrectos.
- Solo responde a preguntas tipadas (`choice`, `noul`, `score`); otros formatos de salida no están soportados según la documentación.
- Idiomas soportados no declarados: no hay garantía documentada de rendimiento fuera del inglés, que es el idioma de los ejemplos de la model card.
- Longitud de contexto no disponible: no se puede planificar el truncado de documentos largos con datos del autor.
- Riesgo de alucinación inherente a la base Qwen3.5, mitigado pero no eliminado por la cabeza de decisión; la calibración reportada (ECE 0,025) corresponde a un conjunto de desarrollo propio y puede no transferirse a otros dominios.
- Dependencia fuerte del ecosistema: requiere MLX y AbstractCore; no hay pesos GGUF ni soporte CUDA documentado, lo que limita el despliegue fuera de Apple Silicon.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar la atribución a Jared Palmer y a Alibaba (Qwen3.5) que indica la model card.
- Repositorio con 0 descargas y 0 likes: sin validación externa ni evidencia de uso en producción.
- El rendimiento de 136 ms por registro está medido en un M5 Max; en hardware inferior la latencia será mayor, aunque no se publican cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbstractFramework/kev-4b-mlx-8bit
- Modelo base: https://huggingface.co/jaredpalmer/kev-4b
- Documentación de modelos de decisión de AbstractCore: https://github.com/lpalbou/AbstractCore/blob/main/docs/decision-models.md
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Familia Qwen3.5 (Alibaba): no disponible enlace directo en la información proporcionada
