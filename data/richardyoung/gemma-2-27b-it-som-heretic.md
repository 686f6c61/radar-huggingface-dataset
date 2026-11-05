# richardyoung/gemma-2-27b-it-SOM-heretic

## Resumen

`richardyoung/gemma-2-27b-it-SOM-heretic` es una variante "decensored" (también etiquetada como *abliterated* o *uncensored*) del modelo `google/gemma-2-27b-it`. El autor, richardyoung, ha aplicado la herramienta Heretic v2.0.0 para eliminar total o parcialmente los mecanismos de rechazo del modelo original mediante una técnica de ablación direccional en el espacio de activaciones, denominada Self-Organizing Map Multi-Directional Ablation (SOM). El modelo conserva la arquitectura, los pesos y el tokenizador del Gemma 2 original; únicamente se han modificado las proyecciones de atención y de la MLP en capas seleccionadas.

El modelo base Gemma 2 es un transformer decoder-only de 27 227 128 320 parámetros (unos 27,2 mil millones), desarrollado por Google a partir de la misma investigación que dio lugar a Gemini. Está entrenado para generación de texto y conversación, con una ventana de contexto de 8 192 tokens y pesos nativos en `bfloat16`. Su tamaño lo sitúa en la franja de modelos que requieren hardware de gama alta para inferencia en precisión completa, pero que pueden desplegarse en GPUs de consumo mediante cuantización agresiva.

La relevancia de esta variante es acotada y muy específica: ofrece un Gemma 2 27B con una tasa de rechazo declarada de 83/100 frente al 100/100 del original, manteniendo una divergencia KL de 0,0860 respecto al modelo base. Es decir, reduce los rechazos a costa de un desplazamiento medible en la distribución de salida. No es un modelo recomendable para producción generalista, sino para experimentación sobre alineamiento, evaluación de robustez de salvaguardas y estudios de ablación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 27 227 128 320 (27,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 192 tokens (heredado de Gemma 2 27B IT) |
| Tipos de cuantizacion | no especificados por el autor; el repo publica safetensors en `bfloat16`. Compatible con cuantizaciones derivadas (GGUF, AWQ, GPTQ) mediante conversión externa |
| Idiomas soportados | no disponible en la ficha del autor; el modelo base Gemma 2 está orientado principalmente al inglés |
| Licencia | Gemma (Google Gemma Terms of Use), con acceso restringido (*gated*) |
| Formato de pesos | safetensors (`bfloat16`) |
| Tamano del repo | 54,5 GB |
| Modelo base | google/gemma-2-27b-it |
| Herramienta de modificacion | Heretic v2.0.0 (SOM multi-directional ablation) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 27B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activaciones GeGLU en la MLP y atención con ventana local alternada junto con atención global en capas intercaladas (patrón tomado de la familia Gemini). El modelo base fue entrenado por Google sobre un corpus multilingüe mayoritariamente inglés y posteriormente sometido a ajuste por instrucciones y a un proceso de alineamiento con preferencias humanas (RLHF) para producir la variante `-it`.

Sobre esa base, el autor aplica Heretic v2.0.0, que realiza una ablación direccional multi-direccional guiada por un mapa autoorganizado (SOM). En lugar de eliminar una única dirección de rechazo por capa, el método identifica varias direcciones por capa mediante el SOM y aplica pesos de ablación diferenciados. Los parámetros publicados en la model card son: `direction_index` por capa, `direction_decay` 0,70, `attn.o_proj.max_weight` 1,03 en la posición 28,15 y `min_weight` 0,70 a distancia 17,25; `mlp.down_proj.max_weight` 0,64 en la posición 36,86 y `min_weight` 0,63 a distancia 23,02. Estos valores indican que la intervención se concentra en las proyecciones de salida de atención y en la proyección descendente de la MLP, con intensidades moderadas (cercanas a 1,0 en atención, más agresivas en la MLP).

No se documenta en la información disponible ningún reentrenamiento adicional, ajuste fino supervisado ni DPO sobre la variante modificada. El cambio es puramente de inferencia sobre los pesos: se alteran las matrices de proyección para desplazar las activaciones fuera de las direcciones asociadas a la negativa a responder.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste por instrucciones de Gemma 2 27B IT.
- Razonamiento, resumen, respuesta a preguntas y generación de código, con el nivel de calidad del modelo base (no se han publicado evaluaciones específicas de esta variante).
- Reducción de rechazos: la model card reporta 83/100 rechazos frente a 100/100 del original, es decir, responde a aproximadamente un 17 % de las peticiones que el modelo base rechazaría.
- Soporte de plantilla de chat mediante `tokenizer.apply_chat_template`, con roles `user` y `assistant`.
- Compatibilidad con `transformers`, `text-generation-inference` y `endpoints_compatible` según los tags del repo.
- Capacidades multilingües: no documentadas para esta variante; el modelo base está orientado al inglés.
- No se documenta soporte de *tool calling*, *function calling*, modo *thinking*, visión ni audio en la información disponible.

## Casos de uso

- **Investigación sobre alineamiento y salvaguardas**: comparar las respuestas del modelo original y de esta variante ante un conjunto de prompts sensibles permite medir qué direcciones de activación están asociadas al rechazo y cuantificar el coste en calidad (KL de 0,0860) de eliminar esas direcciones. Es el uso principal y mejor justificado del modelo.
- **Evaluación de robustez de filtros de seguridad**: desplegar esta variante como modelo "adversario" en un banco de pruebas para comprobar si los clasificadores de contenido y las capas de moderación de un pipeline detectan respuestas que el modelo base habría bloqueado.
- **Generación de texto creativo sin fricción**: para tareas de ficción, guion o narrativa con temáticas adultas o controvertidas, la reducción de rechazos evita interrupciones en la generación; requiere revisión humana posterior por el riesgo de contenido inapropiado.
- **Destilación y generación de datos sintéticos**: usar el modelo para producir pares instrucción-respuesta en dominios donde el modelo base se niega sistemáticamente, con filtrado posterior, para alimentar conjuntos de entrenamiento de modelos más pequeños.
- **Análisis de sesgos y toxicidad**: generar respuestas a prompts que el modelo original rechaza permite estudiar qué tipos de contenido emergen cuando se retiran las salvaguardas, como insumo para auditorías de seguridad.
- **Prototipado de asistentes conversacionales de nicho**: en entornos controlados y con supervisión, para dominios donde las negativas del modelo base resultan excesivas (por ejemplo, debate sobre temas médicos o legales con fines educativos), siempre con revisión humana y avisos claros al usuario.
- **Conversión y despliegue en local**: al conservar la arquitectura Gemma 2, puede convertirse a GGUF y ejecutarse con llama.cpp u Ollama en estaciones de trabajo con suficiente VRAM o RAM, útil para experimentación offline sin dependencia de APIs.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la propia model card, referidos a la eficacia de la ablación y no a calidad de tareas:

| Metrica | Este modelo | Modelo original (google/gemma-2-27b-it) |
|---|---|---|
| Rechazos (sobre 100) | 83/100 | 100/100 |
| Divergencia KL | 0,0860 | 0 (por definición) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible para esta variante.

## Requisitos de hardware

- **VRAM en `bfloat16`**: aproximadamente 54,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se necesitan 60-64 GB, lo que exige dos GPUs de 48 GB o una de 80 GB.
- **VRAM en cuantización de 8 bits**: en torno a 28-30 GB; cabe en una RTX 4090 (24 GB) solo con cuantización de 4 bits o con offloading parcial.
- **VRAM en cuantización de 4 bits (GGUF Q4_K_M o similar)**: aproximadamente 16-18 GB; cabe en una RTX 4090, RTX 3090 o RTX 4080 Super de 16 GB con margen ajustado.
- **GPUs recomendadas**: A100 80 GB o H100 80 GB para `bfloat16` sin compromisos; dos A100 40 GB con tensor parallelism; RTX 4090/3090 para cuantización 4 bits.
- **Opciones de despliegue**: `transformers` con `device_map="auto"` y `accelerate`; `text-generation-inference` (el repo está etiquetado como compatible); llama.cpp u Ollama tras conversión a GGUF; vLLM si se genera una versión compatible.
- **Latencia y throughput**: no disponibles en la información proporcionada. Como referencia estructural, un modelo de 27B en `bfloat16` sobre una A100 80 GB ofrece decodificación del orden de decenas de tokens por segundo con batching moderado, pero no hay mediciones publicadas para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/gemma-2-27b-it-SOM-heretic | 27,2 B | 8 192 | Ablacion SOM (Heretic v2.0.0) | Gemma (gated) | HuggingFace, 0 descargas, 0 likes |
| google/gemma-2-27b-it | 27,2 B | 8 192 | Ninguna (alineado con RLHF) | Gemma (gated) | HuggingFace, ampliamente adoptado |
| Otras variantes *abliterated* de Gemma 2 27B | 27,2 B | 8 192 | Ablacion direccional simple | Gemma (gated) | Múltiples repos comunitarios; datos concretos no disponibles en esta busqueda |
| Mistral Small 24B Instruct | ~24 B | 32 768 | Ninguna | Apache 2.0 | HuggingFace, sin gating |

La comparación relevante es con el modelo base: esta variante intercambia parte de la alineación de seguridad por una reducción de rechazos del 17 %, con una divergencia KL de 0,0860 que indica un cambio no trivial en la distribución de salida. Frente a Mistral Small, la diferencia principal es la licencia (Gemma con gating frente a Apache 2.0) y el contexto (8 192 frente a 32 768 tokens).

## Limitaciones y advertencias

- **Salvaguardas reducidas de forma deliberada**: el modelo responde a una fracción de peticiones que el original rechaza; puede producir contenido que el modelo base bloquearía, incluido material sensible, ofensivo o potencialmente dañino. No debe desplegarse en aplicaciones de cara al público sin capas adicionales de moderación.
- **Riesgo de alucinación**: no se han publicado evaluaciones de fidelidad factual para esta variante; la ablación puede alterar el comportamiento del modelo más allá de los rechazos, como sugiere la KL de 0,0860.
- **Licencia Gemma con gating**: el acceso está restringido y sujeto a los Términos de Uso de Google. La licencia Gemma impone obligaciones de uso aceptable y cláusulas de terminación; el uso comercial está permitido bajo condiciones, pero debe revisarse el texto completo antes de desplegar.
- **Idiomas**: no hay información sobre cobertura multilingüe en esta variante; el modelo base está orientado al inglés, por lo que el rendimiento en castellano no está garantizado.
- **Contexto limitado a 8 192 tokens**: insuficiente para tareas de documentos largos o conversaciones muy extensas sin técnicas de recuperación.
- **Sin benchmarks de calidad**: no hay datos de MMLU, HumanEval ni similares para esta variante, por lo que no puede afirmarse que conserve el rendimiento del original en tareas estándar.
- **Adopción prácticamente nula**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia comunitaria de funcionamiento en producción ni reportes de terceros.
- **Trazabilidad limitada**: la metodología Heretic y los parámetros de ablación están documentados en la model card, pero no se detalla el conjunto de prompts usado para medir los rechazos ni el procedimiento exacto de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/gemma-2-27b-it-SOM-heretic
- Modelo base: https://huggingface.co/google/gemma-2-27b-it
- Herramienta Heretic: https://heretic-project.org
- Documentación de Gemma: https://ai.google.dev/gemma/docs
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma
- Términos de uso de Gemma: https://www.kaggle.com/models/google/gemma/license/consent/verify/huggingface?returnModelRepoId=google/gemma-2-27b-it
- CLI local-gemma: https://github.com/huggingface/local-gemma
