# KucLab/Censer.6

## Resumen

Censer.6 es un clasificador de texto multi-etiqueta de seguridad de contenido desarrollado por KucLab. Se trata de un transformer decoder-only de arquitectura Llama (`LlamaForSequenceClassification`) entrenado desde cero con tan solo 902.016 parámetros, cuyo objetivo es determinar si un texto es seguro o inseguro y, en caso negativo, asignarle una o varias de diez categorías de riesgo (violencia, armas y explosivos, drogas, odio y acoso, abuso sexual, autolesión, cibercrimen y fraude, jailbreak e inyección, mercado ilegal y otros). La relevancia de este modelo reside en que ofrece moderación de contenido multilingüe (inglés, checo, alemán, español y francés) con un coste computacional mínimo: 3,6 MB de pesos y una latencia de inferencia declarada de 1,06 ms en CPU.

El modelo está diseñado como una evolución de Censer.5: frente a la versión anterior, que solo emitía una etiqueta binaria seguro/inseguro con contexto de 192 tokens, Censer.6 incorpora una cabeza sigmoide multi-etiqueta con 12 salidas, amplía la longitud de contexto nativa a 4096 tokens mediante escalado lineal de RoPE (factor 8), admite entradas de hasta 4000 caracteres y añade aumentación adversarial (leetspeak, homoglifos, caracteres de ancho cero) sobre el 10% de las filas inseguras. El checkpoint es un modelo estándar de Hugging Face que se carga directamente con `transformers` sin necesidad de `trust_remote_code`.

La ficha se redacta a partir de la información publicada en Hugging Face en el momento de la consulta; no se dispone de resultados de benchmarks cuantitativos ni de detalles completos sobre el dataset de entrenamiento, por lo que esos apartados se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `LlamaForSequenceClassification` (clasificación multi-etiqueta) |
| Parámetros totales | 902.016 (902K) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens nativos (RoPE lineal ×8); ilimitada mediante inferencia por chunks solapados de 256 tokens con stride 192 |
| Tipos de cuantización | fp16 e int8 (exportación ONNX y cuantización mencionadas en la model card) |
| Idiomas soportados | en, cs, de, es, fr (tokenizer BPE byte-level, teóricamente cualquier idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también exportación ONNX) |
| Capas | 3 |
| d_model / cabezas / d_ff | 128 / 4 / 384 |
| Normalización / MLP | RMSNorm (pre-norm, eps 1e-5) / SwiGLU |
| Tokenizer | BPE byte-level, vocabulario de 2048 tokens |
| Posiciones | RoPE (theta 10000) + escalado lineal ×8 |
| Cabeza de salida | proyección lineal sobre las filas de embedding de 12 tokens de respuesta (`0`, `1`, `a`..`j`) |
| Salidas | sigmoide sobre 12 etiquetas: `safe`, `unsafe` + 10 categorías |
| Límite de entrada | 4000 caracteres antes de tokenizar |
| Tamaño del repo | 0,0 GB (3,6 MB según la model card) |
| Librería | transformers |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tres capas con dimensión oculta de 128, cuatro cabezas de atención y dimensión feed-forward de 384, usando RMSNorm pre-norm y activación SwiGLU. La peculiaridad arquitectónica más destacable es la cabeza de clasificación: en lugar de una capa lineal convencional sobre el último token oculto, el modelo reutiliza las filas de embedding de 12 tokens de respuesta (`0`, `1`, `a`..`j`) como vectores de la cabeza `score`, de modo que las 12 salidas corresponden a `safe`, `unsafe` y las diez categorías de riesgo. Sobre esas salidas se aplica una sigmoide independiente por etiqueta (`problem_type: multi_label_classification`), lo que permite que un mismo texto active varias categorías simultáneamente.

El entrenamiento se realizó desde cero durante 20 épocas, con batch de 128, optimizador AdamW a tasa 3e-3 con scheduler coseno, precisión mixta bf16 y aumentación de datos consistente en un 15% de erratas tipográficas y un 10% de aumentación adversarial (leetspeak, homoglifos, caracteres de ancho cero) aplicada a las filas inseguras. Además, el modelo se destila de un ensemble de profesores formado por dos instancias de Censer.5, Censer.4 y Censer.3 (alpha=0,65, temperatura 4, refuerzo de datos curados 0,75), seguido de pasadas de fine-tuning a tasa de aprendizaje más baja. Los datasets citados en la model card son nvidia/Aegis-AI-Content-Safety-Dataset-1.0, thesofakillers/jigsaw-toxic-comment-classification-challenge, google/civil_comments, PKU-Alignment/BeaverTails, lmsys/toxic-chat y databricks/databricks-dolly-15k; no se especifica el número total de tokens de entrenamiento ni la composición exacta por dataset.

## Capacidades

- Clasificación binaria de seguridad: salida `safe` / `unsafe` con umbral 0,5 sobre la sigmoide.
- Clasificación multi-etiqueta en diez categorías: `violence`, `weapons_explosives`, `drugs`, `hate_harassment`, `sexual_abuse`, `self_harm`, `cybercrime_fraud`, `jailbreak_injection`, `illegal_marketplace`, `other_unsafe`.
- Detección de jailbreaks e inyecciones de prompt mediante la categoría `jailbreak_injection`, pensada para usarse como pre-filtro en cascada antes de modelos generativos.
- Robustez ante ofuscación: aumentación adversarial con leetspeak, homoglifos y caracteres de ancho cero.
- Multilingüe: entrenado en inglés, checo, alemán, español y francés; el tokenizer BPE byte-level permite procesar cualquier otro idioma, aunque sin garantías de rendimiento.
- Contexto largo: 4096 tokens nativos y agregación por máximo sobre chunks solapados de 256 tokens (stride 192) para textos arbitrariamente largos.
- Procesamiento por lotes: API HTTP con endpoints `/classify` (batch) y `/classify-one`, con límite de tasa configurable (`RATE_LIMIT_PER_MIN`, por defecto 600).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento: es exclusivamente un clasificador.

## Casos de uso

- Moderación de comentarios en foros y comunidades: el modelo clasifica cada mensaje entrante en milisegundos (1,06 ms por inferencia en CPU según la model card) y devuelve las categorías de riesgo activadas, lo que permite enrutar automáticamente los mensajes tóxicos a revisión humana o a colas de acción.
- Pre-filtro de seguridad en pipelines de LLM: colocado antes de un modelo generativo, detecta prompts de jailbreak e inyección (`jailbreak_injection`) y contenido inseguro en la entrada del usuario, bloqueando la petición antes de consumir recursos del modelo principal.
- Moderación de chats multilingües: al cubrir en/cs/de/es/fr con un único checkpoint de 3,6 MB, puede desplegarse en plataformas con comunidades en varios idiomas sin mantener un modelo por idioma.
- Análisis de documentos largos: la inferencia por chunks solapados con agregación por máximo permite escanear informes, hilos de conversación o artículos extensos en busca de contenido inseguro enterrado en cualquier posición, sin límite práctico de longitud.
- Servicio de clasificación de alto rendimiento en CPU: con 902K parámetros y exportación ONNX con cuantización int8, puede servirse mediante contenedor Docker en hardware modesto, lo que lo hace adecuado para entornos edge o despliegues sin GPU.
- Filtrado de datasets de entrenamiento: al clasificar grandes volúmenes de texto por lotes vía `/classify`, puede usarse para limpiar corpus antes de entrenar modelos generativos, eliminando muestras violentas, sexuales o fraudulentas.
- Detección de contenido autolesivo y de abuso: las categorías `self_harm` y `sexual_abuse` permiten construir sistemas de alerta temprana en plataformas de salud mental o redes sociales.
- Investigación en robustez adversarial: la inclusión de aumentación con leetspeak, homoglifos y caracteres de ancho cero lo convierte en una línea base ligera para estudiar evasion de moderadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona las métricas `f1` y `accuracy` en los metadatos, pero no incluye valores numéricos ni comparaciones con otros modelos. Los únicos datos de rendimiento publicados son de latencia y tamaño: 1,06 ms de latencia de inferencia y 3,6 MB de pesos (frente a 1,43 ms y 3,6 MB de Censer.5), sin especificar el hardware de medida.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB incluso en fp16; el checkpoint safetensors ocupa 3,6 MB, por lo que cabe en cualquier GPU consumer e incluso en memoria unificada de dispositivos de gama baja.
- GPU recomendadas: innecesarias para uso individual; cualquier GPU con soporte CUDA (RTX 4090, A100, H100) puede ejecutarlo, pero el modelo está optimizado para CPU. Para GPU se pasa `device=0` al pipeline.
- Cabe en GPU consumer: sí, en cualquier GPU consumer (incluso integradas) y en CPU sin requisitos especiales.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), exportación ONNX, cuantización fp16/int8, servidor HTTP propio con `serve.py` (solo stdlib de Python) y contenedor Docker con imagen CPU. La librería `text-embeddings-inference` figura entre las etiquetas del repo, aunque no se detalla su configuración.
- Latencia y throughput: 1,06 ms por inferencia según la model card; no se publican cifras de throughput ni el hardware empleado en la medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salidas | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Censer.6 | 902K | 4096 tokens (ilimitado por chunks) | Binaria + 10 categorías | en, cs, de, es, fr | Apache 2.0 | Hugging Face, ONNX, Docker |
| Censer.5 (versión anterior del mismo autor) | 902K | 192 tokens | Binaria | en | Apache 2.0 | Hugging Face |
| Modelos de moderación basados en BERT/RoBERTa | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros para establecer comparaciones cuantitativas con alternativas de la misma categoría. La única comparación documentada es la evolución interna Censer.5 → Censer.6, que amplía contexto (192 → 4096 tokens), salidas (binaria → 12 etiquetas), idiomas (solo inglés → cinco idiomas), robustez adversarial y empaquetado (API HTTP, ONNX, Docker).

## Limitaciones y advertencias

- Riesgo de alucinación y falsos positivos: al ser un clasificador de 902K parámetros entrenado desde cero, su capacidad de representación es muy limitada; es previsible que confunda matices, ironía o contexto cultural, y que produzca falsos positivos en textos legítimos que mencionen términos sensibles (por ejemplo, información médica sobre autolesión).
- Sesgos: no se documenta ningún análisis de sesgos por género, raza, religión u orientación sexual; los datasets de origen (Jigsaw, Civil Comments, BeaverTails, ToxicChat, Aegis) tienen sesgos conocidos de anotación que pueden transferirse al modelo.
- Limitaciones de idioma: solo se ha entrenado en en/cs/de/es/fr; el tokenizer byte-level permite procesar otros idiomas, pero el rendimiento en lenguas no entrenadas no está validado y probablemente sea deficiente.
- Limitaciones de contexto: aunque el contexto nativo es de 4096 tokens, la agregación por chunks con stride 192 puede perder señales que crucen los límites de chunk; además, la entrada se trunca a 4000 caracteres antes de tokenizar.
- Umbral fijo: la model card recomienda 0,5 para la sigmoide, pero no se documenta calibración ni curvas precisión-recall por categoría, por lo que el umbral óptimo para cada caso de uso debe validarse empíricamente.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías; para moderación en producción se recomienda combinarlo con revisión humana, dado su tamaño reducido y la ausencia de benchmarks publicados.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de adopción ni de validación independiente.
- No apto para clasificación de contenido visual, audio ni para tareas generativas: es exclusivamente un clasificador de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KucLab/Censer.6
- Repositorio GitHub del paquete `censer.6`: https://github.com/Jerry256254/censer.6
- Dataset nvidia/Aegis-AI-Content-Safety-Dataset-1.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- Dataset thesofakillers/jigsaw-toxic-comment-classification-challenge: https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge
- Dataset google/civil_comments: https://huggingface.co/datasets/google/civil_comments
- Dataset PKU-Alignment/BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset lmsys/toxic-chat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset databricks/databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
