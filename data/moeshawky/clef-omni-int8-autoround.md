# moeshawky/clef-omni-int8-autoround

## Resumen

clef-omni-int8-autoround es una cuantización de solo pesos a 8 bits del modelo Cloudflare/clef-omni, un modelo multimodal de decisión publicado por el usuario moeshawky. No es un modelo conversacional: recibe el estado de una aplicación (texto, imagen y audio) junto con un esquema de preguntas y emite un logit por cada opción permitida de cada pregunta. No genera texto libre en ningún caso.

La relevancia de esta build es práctica: reduce el decodificador MoE `thinker.model.layers` (48 capas) a int8 con AutoRound 0.16.1 mientras mantiene en BF16 la cabeza de esquema conjunta, las compuertas del router MoE, las torres de visión y audio, el talker, `code2wav`, los embeddings y la LM head. El resultado es un artefacto de 41,57 GB que conserva intacta la cabeza de decisión (hash idéntico al release original), lo que permite verificar que la salida del sistema de decisión no se ha alterado por la cuantización.

El caso de uso objetivo es la toma de decisiones estructurada y validable en producción (triaje, enrutamiento, evaluación con rúbricas cerradas) donde se prefiere una distribución de probabilidad sobre opciones discretas antes que una respuesta en lenguaje natural. La licencia es Apache 2.0 y el pipeline declarado es `image-text-to-text`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (tag `qwen3_omni_moe`): decodificador `thinker` de 48 capas MoE, torre de visión, torre de audio, `talker`, `code2wav` y cabeza de esquema conjunta (`joint_head`) |
| Parametros totales | 13.129.032.241 según metadata de safetensors (ver nota) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only con AutoRound 0.16.1 (grupo 128, simétrico, 8,06 bits/peso efectivos); existe una build de 4 bits del mismo modelo, sin identificador en la información |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (8 shards; empaquetado `auto_round:auto_gptq`, int32 empaquetado + escalas fp16) más `joint_head.safetensors` en BF16 |
| Tamano del repositorio | 41,57 GB |
| Ambito cuantizado | `thinker.model.layers` (las 48 capas); router `mlp.gate` de las 48 capas en fp16; resto en BF16 |
| Herramienta y calibracion | `auto-round` 0.16.1; `NeelNanda/pile-10k`, semilla 42, `iters=150`, `nsamples=128`, `seqlen=2048`, `batch_size=8` |
| Pipeline declarado | `image-text-to-text` |
| Descargas / likes | 0 / 0 |

Nota sobre el recuento de parámetros: la cifra de 13.129.032.241 procede del metadata de safetensors y cuenta cada tensor int32 empaquetado como un único elemento. Como el formato `auto-gptq` empaqueta 4 pesos int8 por cada int32, el número efectivo de pesos del decodificador ronda los 30.130 millones y el total efectivo del artefacto se situaría en torno a 35.700 millones. Es una derivación a partir de los tamaños de fichero declarados, no un dato publicado por el autor.

## Arquitectura y entrenamiento

La arquitectura sigue el esquema Qwen3-Omni MoE: un decodificador `thinker` de 48 capas con mezcla de expertos, torres separadas de visión (1.077.262.816 B en BF16) y audio (1.295.854.336 B en BF16), un `talker` (6.334.582.784 B) con su `code_predictor`, y un módulo `code2wav` (432.033.154 B). Sobre el thinker se aplica una cabeza de esquema conjunta (`joint_head.safetensors`, 218.364.000 B) que consume el estado de la aplicación y el esquema de preguntas y produce un logit por opción permitida. Según el README, `load_release_model` no utiliza el talker ni `code2wav`: forman parte del artefacto pero quedan fuera del camino de decisión.

El autor no documenta datos de preentrenamiento, número de tokens, composición del corpus ni si hubo RLHF o DPO sobre el modelo base; esa información corresponde a Cloudflare/clef-omni y no está disponible en la información proporcionada. Lo que sí está documentado es el proceso de cuantización: AutoRound con 150 iteraciones sobre 128 muestras de 2048 tokens, calibración con un corpus exclusivamente textual (`pile-10k`), 21 minutos de reloj en una NVIDIA RTX PRO 6000 Blackwell (97.887 MiB) con driver 580.82.07, CUDA 13.0, torch 2.11.0+cu130 y transformers 5.20.1. La decisión técnica destacable es dejar las torres de visión y audio y las compuertas del router en BF16: el autor argumenta que quedan fuera del camino de decisión y que calibrar una torre específica de modalidad contra un corpus de texto habría sido inadecuado. La cabeza de esquema conjunta es byte-idéntica al release original (SHA-256 `d5ee8d7e75c9a503edce94400dda9074fc0f2f4d62729012bf0a827df947ba9c`).

## Capacidades

- Decisión estructurada: emite un logit por cada opción permitida de cada pregunta definida en el esquema, sin generar texto libre.
- Tipos de pregunta soportados en el ejemplo del README: `choice` (elección entre criterios con etiqueta), `score` (escala ordinal, p. ej. ["Can wait", "This week", "Today"]) y `noul` (pregunta binaria tipo sí/no).
- Entrada multimodal: pipeline `image-text-to-text`, con torre de visión y torre de audio presentes en el artefacto (en BF16).
- Salida determinista y validable contra esquema, apta para integrarse en pipelines que exigen JSON estructurado.
- No soporta conversación multi-turno ni generación de texto libre por diseño; el README lo indica explícitamente.
- Tool calling / function calling: no disponible en la información.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información.
- Capacidades multilingües: no disponibles en la información (el campo de idiomas no está poblado en la model card).

## Casos de uso

- Triaje de tickets de soporte: con un esquema que combine `choice` para departamento (billing, technical), `score` para urgencia y `noul` para detectar caída de servicio, el modelo devuelve una distribución por opción en una sola pasada, tal como muestra el ejemplo del README. Es adecuado porque la salida es directamente enrutable sin post-procesar lenguaje natural.
- Enrutamiento de alertas en producción: dado el estado de la aplicación y un conjunto cerrado de equipos responsables, el logit por opción permite fijar umbrales de escalado y auditar la decisión con la probabilidad asociada.
- Moderación de contenido con categorías cerradas: definir el conjunto de políticas como opciones y una escala de gravedad como `score`; al no generar texto, se elimina el riesgo de que la respuesta incluya contenido no deseado.
- Verificación de cumplimiento tipo checklist: batería de preguntas binarias (`noul`) sobre un estado o documento para producir un informe pass/fail por criterio, con probabilidad por ítem.
- Extracción de campos desde capturas o documentos escaneados: la torre de visión permite clasificar la imagen contra opciones predefinidas (tipo de documento, presencia de sello, legibilidad) sin depender de OCR previo.
- Evaluación de calidad en contact center sobre audio: la torre de audio admite clasificar la interacción contra una rúbrica cerrada (resolución, tono, cumplimiento de guion) en lugar de generar una transcripción-resumen.
- Clasificación de riesgo en seguros o siniestros: preguntas `choice` sobre causa y `score` sobre severidad, con logits comparables entre casos para priorizar la cola de revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones del modelo base ni comparaciones entre la build int8 y el release en BF16; solo documenta el proceso de cuantización y los tamaños de cada componente medidos sobre las cabeceras de los safetensors.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto pesa 41,57 GB, de modo que los pesos solos exigen unos 42 GB. Con activaciones, caché y las torres de visión y audio en BF16, 48 GB es el mínimo práctico y 80 GB es el entorno recomendado.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB, la empleada por el autor para producir la build), A100 80 GB, H100 80 GB. Una L40S de 48 GB queda en el límite.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en un solo dispositivo. La información no documenta soporte de offload a CPU ni reparto multi-GPU.
- Opciones de despliegue: `transformers>=5` junto con `auto-round` (la ruta `AutoRoundQuantizer` invoca `auto_round.inference.convert_model.convert_hf_model`); vLLM 0.32.0 incorpora una implementación nativa para este modelo (`ClefOmniForJointSchema`), según la sección de servido del README, que está truncada en la información disponible. Soporte en llama.cpp, Ollama, TGI o GGUF: no disponible.
- Latencia y throughput de inferencia: no disponible. El único dato temporal publicado es el coste de producir la cuantización (21 minutos, 1.200 s de tuning, en una RTX PRO 6000), que no es una medida de inferencia.

## Comparativa con modelos similares

La información proporcionada no incluye otros modelos de decisión estructurada comparables. La comparación se limita a las variantes del mismo modelo:

| Modelo | Parametros | Contexto | Cuantiz
