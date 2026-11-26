# moeshawky/RockAndEgg-313M-v3

## Resumen

RockAndEgg-313M-v3 es un modelo compacto no generativo desarrollado por el usuario moeshawky, orientado a la toma de decisiones estructuradas sobre un estado contextual compartido. No produce texto libre: recibe un estado (un log de despliegue, un ticket de soporte, una factura o una traza de flujo de trabajo) junto con una o varias preguntas tipadas y devuelve, para cada pregunta, una distribución de probabilidad sobre las opciones candidatas y un valor de confianza. Se construye sobre un backbone derivado de Qwen3-0.6B-Base, destilado a 10 bloques decodificadores y sin cabeza de lenguaje, al que se le acopla una cabeza de decisión específica.

Su propuesta de ingeniería es la reutilización: una petición puede incluir varias preguntas sobre un mismo estado, y ese estado se codifica una sola vez; cada pregunta y cada opción se puntúan contra la representación cacheada. El backbone se ejecuta un número fijo de veces independientemente del número de preguntas que compartan el estado. Con 313.161.733 parámetros (312.892.928 de backbone más 268.805 de cabeza de decisión), una ventana de estado de 256 tokens y opciones de 64 tokens, ocupa un nicho muy concreto: clasificación y decisión tipada de bajo coste, no generación.

Es relevante para quienes necesitan un componente de decisión determinista y barato de desplegar dentro de pipelines, en lugar de un LLM generativo completo. Su licencia Apache-2.0 y su huella de 313M lo hacen apto para entornos con restricciones de VRAM y para integraciones donde la latencia y el coste por petición importan más que la riqueza expresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen3 (`Qwen3Model`), 10 bloques, sin LM head; cabeza de decisión acoplada |
| Parametros totales | 313.161.733 (backbone 312.892.928 + cabeza 268.805) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | `max_position_embeddings` 32.768; límite operativo cualificado: 256 tokens de estado y 64 tokens por opción |
| Tipos de cuantizacion | FP16 (release principal); variante INT8 mixta W8A16 con grupo 128 en proyecciones del backbone (repo `RockAndEgg-313M-v3-INT8`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16, 122 tensores); serializado `model.safetensors` de 626.337.154 bytes |
| Hidden size | 1024 |
| Intermediate size | 3072 |
| Atención | 16 cabezas de query / 8 de KV (GQA 2:1), `head_dim` 128, atención completa |
| Posicional | RoPE, `rope_theta` 1.000.000 |
| Normalización | RMSNorm, `rms_norm_eps` 1e-6 |
| Vocabulario | 151.936, embeddings atados |
| Primitivas de decisión | `choice`, `score`, `noul` |
| Salida | Vector de probabilidad por pregunta + `confidence` (probabilidad máxima) |
| Runtime | `torch`, `transformers`, `safetensors`; servidor HTTP opcional con `fastapi`, `uvicorn` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-0.6B-Base` (Apache-2.0) y se destila a una forma compacta de 10 capas decodificadoras. Conserva el `Qwen3Model` sin cabeza de lenguaje, con hidden size 1024, intermediate size 3072, GQA 2:1 (16 cabezas de query, 8 de KV, `head_dim` 128), RoPE con `rope_theta` 1.000.000 y vocabulario de 151.936 con embeddings atados. Sobre ese backbone se añade una cabeza de decisión que combina un embedding de tipo de pregunta (3 tipos) con un scorer 1024→256→1 y temperaturas por tipo.

El mecanismo de inferencia es el núcleo del diseño: un único forward pass codifica el estado y produce un `DynamicCache`; ese cache se replica mediante `batch_repeat_interleave` (una repetición entera, no una recodificación) para cada fila de opción; cada opción se puntúa aislada en su propia fila, sin atención cruzada entre opciones; la cabeza reduce cada fila a un logit escalado y un softmax sobre las filas de una pregunta da su vector de probabilidad. Las filas se rellenan a un ancho común y las posiciones de relleno reciben un logit muy negativo que las excluye del softmax. El coste de puntuar candidatos crece con el número de filas de opción, pero se elimina la recodificación del estado.

La model card no detalla el volumen ni la composición del dataset de entrenamiento, ni si hubo RLHF o DPO. Indica únicamente que el backbone se destila desde Qwen3-0.6B-Base y que la cabeza y el contrato de puntuación siguen la línea de "typed-decision, head-over-backbone". No se dispone de más información sobre el proceso de entrenamiento.

## Capacidades

- Clasificación y decisión tipada sobre un estado textual: `choice` (elegir entre alternativas discretas), `score` (elegir un nivel ordinal de una escala ordenada) y `noul` (evaluar una proposición binaria).
- Salida de distribución de probabilidad por pregunta más un valor de `confidence` (probabilidad máxima), lo que permite umbralizar y derivar a revisión humana.
- Reutilización de estado: varias preguntas sobre un mismo estado comparten una única codificación del backbone y su KV cache.
- Puntuación por lotes de candidatos: las opciones se aíslan en filas de batch y se puntúan en una sola pasada.
- No genera texto: no hay proyección a vocabulario en inferencia, ni sampler, ni bucle de generación.
- No soporta tool calling ni function calling de forma nativa; no es un modelo agéntico ni multi-step en el sentido generativo.
- Capacidad multilingüe limitada al inglés.
- No dispone de visión ni audio.

## Casos de uso

- Enrutado de acciones en flujos de trabajo: con la primitiva `choice`, el modelo selecciona la siguiente acción de un workflow a partir de la traza del estado, reutilizando la codificación del estado para todas las decisiones de un mismo paso.
- Evaluación de riesgo operativo: con `score`, asigna un nivel ordinal (por ejemplo, bajo/medio/alto) a un log de despliegue o a una incidencia, aprovechando que los niveles se interpretan por posición y deben ser ordenados y contiguos.
- Triaje de tickets de soporte: con `noul`, decide si un ticket requiere revisión humana, devolviendo probabilidad y confianza para fijar umbrales de escalado.
- Validación de facturas y documentos estructurados: con `choice`, clasifica el estado de una factura (aprobada, pendiente, rechazada) a partir de su representación textual, con un coste de inferencia muy bajo por documento.
- Puerta de calidad en pipelines de CI/CD: con `noul` o `score`, evalúa si un resultado de build o un diff cumple criterios definidos, integrándose como paso de decisión determinista.
- Componente de decisión en sistemas con restricciones de VRAM: al caber en GPUs de consumo y tener un KV cache de 10 MiB a S=256 en FP16 (20 MiB a S=512), puede desplegarse junto a otros servicios en la misma máquina.
- Clasificación por lotes de bajo coste: la reutilización de estado y la puntuación por lotes de opciones reducen el coste cuando muchas preguntas comparten el mismo contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la variante INT8 presenta una calidad de decisión estadísticamente indistinguible de la release FP16 en el "canonical panel", pero no se aportan cifras concretas de MMLU, HumanEval, GSM8K ni de ningún otro benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,63 GB solo de pesos (626.323.466 bytes de parámetros en FP16), más overhead de activaciones y KV cache.
- KV cache: 10 MiB a S=256 en FP16; 20 MiB a S=512.
- Variante INT8: aproximadamente un 24,5 % más pequeña que la FP16 según la model card.
- GPU recomendadas: cualquier GPU con al menos ~1-2 GB de VRAM libre para FP16; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con suficiente VRAM libre.
- Opciones de despliegue: `transformers` con `torch` y `safetensors` como runtime base; servidor HTTP opcional con `fastapi` y `uvicorn`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser generativo estos runners no aplican de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RockAndEgg-313M-v3 | 313M | 32.768 (operativo 256 estado / 64 opción) | Decisión tipada no generativa | Apache-2.0 | Hugging Face |
| Qwen3-0.6B-Base | ~600M | 32.768 | LLM generativo base | Apache-2.0 | Hugging Face |
| Modelos de clasificación tipo BERT-base | ~110M | 512 | Clasificación de texto | Apache-2.0 (según variante) | Hugging Face |

La comparación con Qwen3-0.6B-Base es directa por parentesco: RockAndEgg destila ese backbone a 10 capas y lo especializa en decisión tipada, sacrificando generación a cambio de un contrato de salida estructurado y reutilización de estado. Frente a clasificadores BERT, ofrece un contrato de decisión más rico (tres primitivas, distribución por pregunta y confianza) y mayor ventana nominal, aunque su límite operativo cualificado es de 256 tokens de estado. No se dispone de datos de rendimiento comparativo para cuantificar diferencias de calidad.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto libre ni respuestas conversacionales; su uso está restringido a decisiones tipadas.
- Solo inglés: la model card declara únicamente `en`; no hay soporte multilingüe verificado.
- Límite operativo de 256 tokens de estado y 64 por opción: los valores por defecto de Transformers son mayores y no constituyen el punto de operación cualificado; superarlos puede degradar la calidad.
- Los niveles de `score` son posicionales: las etiquetas deben ser ordenadas y contiguas, o las probabilidades pierden sentido.
- El texto de las opciones forma parte de la entrada: cambiar el renderizado (por ejemplo, el formato `key: value`) altera las probabilidades.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente de la confianza; conviene validar umbrales en el dominio de uso.
- No se documentan sesgos conocidos ni evaluación de sesgo en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base Qwen3-0.6B-Base.
- No se documenta soporte para runners de alto rendimiento (vLLM, TGI, llama.cpp), lo que limita el throughput en despliegues a gran escala.
- La model card no detalla el dataset de entrenamiento ni el proceso de alineación, lo que dificulta evaluar su robustez fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moeshawky/RockAndEgg-313M-v3
- Variante INT8: https://huggingface.co/moeshawky/RockAndEgg-313M-v3-INT8
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
