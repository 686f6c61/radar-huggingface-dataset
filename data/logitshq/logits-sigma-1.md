# logitshq/Logits-Sigma-1

## Resumen

Logits Sigma-1 es un modelo de decisión desarrollado por Logits (logitshq) a partir de un fine-tune LoRA del modelo multimodal google/gemma-4-31B-it. No es un modelo generativo en el sentido habitual: recibe un estado (por ejemplo, un JSON con el contexto de una petición) y una o varias preguntas tipadas con opciones, y devuelve una distribución de probabilidad sobre las opciones de cada pregunta mediante softmax sobre los logits de los códigos de opción en la posición de respuesta. No genera texto libre.

Técnicamente es un transformer denso de aproximadamente 31.273 millones de parámetros, con la torre de visión del modelo base presente pero sin uso, y el tokenizador y la plantilla de chat de Gemma 4 sin modificar. El fine-tune es un LoRA de rango 64 y α 128 fusionado en los pesos bf16 con un factor λ = 0.75 (0.75 · ajustado + 0.25 · base). Está pensado para servir exclusivamente en modo prefill con vLLM y caché KV en fp8, lo que permite manejar prompts de hasta 131.072 tokens en una única GPU de 96 GB.

Su relevancia actual radica en la categoría emergente de "modelos de decisión" o "system-one": en lugar de razonar en lenguaje natural, el modelo produce directamente una probabilidad calibrada por opción, lo que simplifica la integración en sistemas de enrutamiento, clasificación y toma de decisiones automatizadas donde se necesita una salida estructurada y determinista en lugar de texto que haya que parsear.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4) con fine-tune LoRA fusionado; torre de visión presente pero no utilizada |
| Parametros totales | 31.273.088.876 (~31B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 131.072 tokens por prompt de pregunta (límite de rechazo); bloque compartido de petición cacheado con prefix caching |
| Tipos de cuantizacion | Pesos bf16 (~58 GiB); caché KV en fp8 recomendada para servir en 96 GB |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); incluye `code/` con el motor de inferencia y `merge.json` |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it (revisión 842da379) y aplica un único fine-tune LoRA de rango 64 y α 128, fusionado en los pesos bf16 con escala λ = 0.75, es decir, una interpolación lineal entre el modelo ajustado y el base (0.75 · fine-tuned + 0.25 · base). Se mantienen sin cambios el tokenizador, la plantilla de chat de Gemma 4 y la torre de visión del modelo base, que no se utiliza en inferencia. No se especifican en la documentación disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación principal no está en la arquitectura sino en el protocolo de lectura: cada pregunta se formula en un prompt que lista todas las preguntas de la petición antes del estado (repetido dos veces si el bloque compartido no supera los 3.000 tokens), y la respuesta se obtiene como softmax a temperatura 1.0 sobre los logits de los códigos de opción (A., B., … o códigos de dos letras, hasta 255 opciones) en la posición inmediatamente posterior a `Answer:`. Las preguntas de tipo sí/no se tratan como elección de dos opciones. El bloque compartido (instrucción, preguntas y estado) se cachea con prefix caching de vLLM y se computa una sola vez por petición. El modelo opera solo en prefill, sin decodificación autoregresiva.

## Capacidades

- Clasificación y decisión tipada: devuelve una probabilidad por opción para preguntas de tipo `choice` y `noul` (sí/no), sin generar texto.
- Manejo de estados estructurados: acepta estados en formato JSON y los incorpora al prompt como contexto de decisión.
- Preguntas múltiples por petición: procesa varias preguntas sobre un mismo estado, compartiendo el bloque de contexto mediante caché de prefijo.
- Soporte de hasta 255 opciones por pregunta con códigos de una o dos letras.
- Contexto largo: admite prompts de hasta 131.072 tokens y peticiones de hasta 80 preguntas listadas (las adicionales se cuentan pero no se listan).
- Capacidad multimodal latente: la torre de visión del modelo base está presente pero no se usa en este fine-tune.
- Salida calibrada: probabilidades vía softmax sobre logits, aptas para umbrales y comparación entre opciones.
- No soporta generación de texto libre, tool calling, agentes multi-paso ni razonamiento en lenguaje natural.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el estado de la incidencia (texto, metadatos, adjuntos descritos) y una pregunta `choice` con criterios por equipo (facturación, daños, soporte técnico) y devuelve la probabilidad de cada ruta, como muestra el ejemplo de la model card con el pedido #1182.
- Clasificación de documentos con múltiples etiquetas: se formula una pregunta por cada dimensión (tipo, urgencia, departamento) sobre un mismo estado JSON, aprovechando el bloque compartido cacheado para reducir coste de prefill.
- Moderación y verificación binaria: preguntas `noul` con criterios textuales que se leen como elección de dos opciones y se reportan como p(yes), útiles para decidir si un contenido cumple una política.
- Triaje en pipelines de atención al cliente: integración en un motor vLLM en proceso con latencia mediana de 122 ms por petición (media 356 ms, p80 308 ms) en una RTX PRO 6000 Blackwell, adecuada para decisiones en línea.
- Evaluación automática de respuestas: dado un estado con una respuesta candidata y criterios, el modelo asigna probabilidad a opciones como "correcta", "parcial" o "incorrecta" sin necesidad de parsear texto generado.
- Sistemas de decisión con contexto largo: prompts de hasta 131.072 tokens permiten incluir historiales extensos o documentos completos en el estado, con caché KV en fp8 para que quepan en una GPU de 96 GB.
- Enrutamiento condicional en agentes: usar las probabilidades como señal para seleccionar la siguiente acción o herramienta dentro de un orquestador, sustituyendo a un LLM generativo en el paso de decisión.

## Benchmarks y rendimiento

Datos autodeclarados por el autor (no verificados) en la model card:

| Benchmark | Metrica | Resultado |
|---|---|---|
| Decision Index 0.3, suite pública (140.178 peticiones puntuadas) | Decision Index 0.3, índice público | 67,1 (bruto 75,0) |
| Decision Index 0.3, suite pública | Peticiones respondidas | 140.178 de 140.178, 0 no soportadas, 0 errores, sin truncamiento |
| Latencia (latency-v1, 750 filas + 10 de calentamiento, 1× RTX PRO 6000 Blackwell 96 GB, bf16 + KV fp8) | Mediana / media / p80 | 122 ms / 356 ms / 308 ms |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- Pesos en bf16: ~58 GiB, lo que exige una GPU de 96 GB para servir con comodidad (por ejemplo, NVIDIA RTX PRO 6000 Blackwell Server Edition, A100 80 GB queda justa y no permite prompts largos, H100 80 GB igualmente limitada).
- Caché KV en fp8 recomendada: con ella, una GPU de 96 GB deja espacio para prompts de 131.072 tokens. Con caché bf16 solo quedan 22,7 GiB de caché frente a los 35,8 GiB necesarios para ese contexto.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090, etc.) en bf16; no se documentan cuantizaciones GGUF ni versiones de menor precisión.
- Despliegue: vLLM 0.33.0 en proceso, solo prefill, con prefix caching y `kv_cache_dtype=fp8`; el motor `logits_decision.engine_vllm:VllmEngine` se distribuye en `code/` del repositorio. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia medida en la configuración de referencia: mediana 122 ms, media 356 ms, p80 308 ms por petición, con una petición a la vez. No se publica throughput agregado.
- Requiere instalar el paquete `decision-index` desde GitHub (commit 25c6ec7) y `huggingface_hub>=0.34,<2`, `httpx>=0.27,<1`.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión con salida de probabilidades por opción) en la documentación proporcionada. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Logits Sigma-1 | ~31B | 131.072 tokens por pregunta | Decisión tipada con probabilidades | Apache 2.0 | Hugging Face (logitshq/Logits-Sigma-1) |
| google/gemma-4-31B-it | ~31B | No disponible en la información | Generación multimodal image-text-to-text | No disponible en la información | Hugging Face (google/gemma-4-31B-it) |
| Alternativas de decisión comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés: el modelo declara únicamente el idioma `en`, por lo que su uso en castellano u otros idiomas no está validado.
- No genera texto: cualquier caso de uso que requiera explicaciones, resúmenes o razonamiento en lenguaje natural queda fuera de su alcance.
- Límites duros: se rechazan preguntas con prompts de más de 131.072 tokens o con más de 255 opciones (marcadas como `Unsupported`); las peticiones con más de 80 preguntas listan solo las primeras 80.
- Resultados autodeclarados y no verificados (`verified: false` en el model-index); el índice 67,1 procede del propio autor y la puntuación "Full" del board proviene de una suite privada no incluida en la información.
- Dependencia fuerte de la configuración: los resultados de latencia y precisión están ligados a vLLM 0.33.0, KV fp8 y una GPU de 96 GB; con caché bf16 no caben prompts largos y la reproducibilidad puede variar.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente de las probabilidades en dominios alejados de los datos de entrenamiento, cuya composición no se documenta.
- Sesgos: no se documentan evaluaciones de sesgo, robustez ni seguridad para este fine-tune.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede tener sus propias condiciones que conviene revisar antes de desplegar en producción.
- El modelo no soporta tool calling, agentes multi-paso ni decodificación especulativa; su integración requiere un orquestador externo que formule las preguntas y consuma las probabilidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logitshq/Logits-Sigma-1
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Revisión del modelo base usada: https://huggingface.co/google/gemma-4-31B-it/tree/842da3794eaa0b77d5f08bae87a17459d91ff475
- Resultados del run público: https://huggingface.co/datasets/logitshq/logits-sigma-1-decision-index/tree/51fe749c15ab5a61e7c91237c91c6ef80559b4ed/runs/logits-sigma-1-kvfp8
- Repositorio del kit de evaluación: https://github.com/apolinario/decision-index (commit 25c6ec7)
- Sitio del autor: https://logits.com
- Paper referenciado en los tags: arxiv:2309.06275 (https://arxiv.org/abs/2309.06275)
