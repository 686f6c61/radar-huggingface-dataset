# myroslavtryhubets/clef-NVFP4

## Resumen

Clef-NVFP4 es una cuantización comunitaria no oficial de Cloudflare/clef, un modelo multimodal de decisión de 27.356.728.560 parámetros (≈27,36 mil millones) que convierte un estado y un esquema de preguntas tipadas en una probabilidad para cada opción permitida en un único forward pass. Lo publica el usuario myroslavtryhubets y su interés práctico es inmediato: en bf16 el modelo ocupa unos 55 GB y no cabe en una GPU de consumo, mientras que este checkpoint reduce los pesos a 13,2 GiB en VRAM y lo hace ejecutable en una sola GPU de 16 GB con arquitectura NVIDIA Blackwell (sm_120).

La arquitectura subyacente es la de Cloudflare/clef, derivada de Qwen/Qwen3.8-27B, con torre de visión, componentes de atención lineal Gated DeltaNet y una cabeza de esquema conjunto (joint schema head) que no se carga con `from_pretrained` estándar. La cuantización aplica NVFP4 en modo W4A4 (pesos y activaciones en 4 bits) mediante compressed-tensors, manteniendo en bf16 la cabeza LM, los embeddings, la torre de visión, las proyecciones Gated DeltaNet, las normalizaciones y la cabeza de esquema.

Es relevante ahora porque demuestra que un modelo de decisión con salida estructurada y calibrada puede servirse en hardware de gama media manteniendo una brecha media de solo 1,08 puntos frente a los resultados publicados en bf16 por Cloudflare en el suite Decision Index 0.2.1 (20.337 peticiones, 11 benchmarks). El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y no está afiliado ni avalado por Cloudflare.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con torre de visión, atención lineal Gated DeltaNet y cabeza de decisión de esquema conjunto; derivada de Qwen/Qwen3.8-27B |
| Parámetros totales | 27.356.728.560 (≈27,36 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 W4A4: pesos FP4 (e2m1), escala FP8 (e4m3) por bloque de 16 elementos, escala global FP32 por tensor; formato compressed-tensors `nvfp4-pack-quantized`. `lm_head`, `embed_tokens`, torre de visión, `in_proj_a`/`in_proj_b`/`conv1d` de Gated DeltaNet, normalizaciones y cabeza de esquema se mantienen en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con cuantización compressed-tensors |
| Tamaño del repositorio | 20,0 GB (13,2 GiB de pesos en VRAM) |

## Arquitectura y entrenamiento

La arquitectura es la de Cloudflare/clef, construida sobre la familia Qwen/Qwen3.8-27B y adaptada a una tarea de decisión: recibe un estado y un esquema de preguntas tipadas y devuelve, en un solo forward pass, una probabilidad para cada opción permitida. Incluye una torre de visión (pipeline `image-text-to-text`), bloques de atención convencional y capas de Gated DeltaNet con sus proyecciones `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z` y `conv1d`. La cabeza de esquema conjunto (`joint_schema_model.py`) es código propio de Cloudflare y requiere su función `load_release_model`; no se carga con `from_pretrained` al uso.

Este repositorio no entrena ni ajusta el modelo: solo re-codifica los pesos. La cuantización se hizo con llm-compressor 0.14 en modo PTQ *model-free* para los pesos, y las escalas globales de activación estáticas se obtuvieron con calibración capa a capa en bf16 sobre 256 registros (UltraChat más texto de logs de seguridad en el formato de prompt propio de Clef, con `static_minmax`). Las escalas globales fusionadas se comparten entre q/k/v, gate/up y el par `in_proj_qkv`+`in_proj_z` de Gated DeltaNet, esto último para mantener consistente la fusión `in_proj_qkvz` de vLLM. No se documentan en la información disponible el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si hubo RLHF o DPO.

## Capacidades

- Decisión con salida estructurada: genera una probabilidad para cada opción de un esquema de preguntas tipadas en un único forward pass, en lugar de texto libre.
- Clasificación multietiqueta y multiclase: evaluado en BANKING77 (77 intenciones bancarias), CLINC150+OOS (150 intenciones más fuera de dominio), FinEntity y PhishNChips.
- Tool calling y function calling: evaluado con BFCL con 98,6 de precisión exacta por caso.
- Razonamiento de sentido común y multietapa: evaluado en ARC-Challenge, WinoGrande y MuSR.
- Inferencia de lenguaje natural: evaluado en ANLI (macro-F1 69,5).
- Análisis de contratos y documentos largos: evaluado en ContractNLI, con peticiones de hasta ~10.000 tokens.
- Ejecución mental de código: evaluado en CRUXEval (84,0 de precisión).
- Entrada de imagen: el pipeline declarado es `image-text-to-text`, con torre de visión mantenida en bf16.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento explícito, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: el modelo puede clasificar una consulta entrante en un conjunto cerrado de intenciones con una puntuación de probabilidad por opción, lo que permite fijar umbrales de derivación a agente humano. Los 97,3 de macro-F1 en CLINC150 y 93,7 en BANKING77 lo respaldan.
- Detección de phishing y correo malicioso: con 76,7 de precisión en PhishNChips, se puede integrar como clasificador previo a una pasarela de correo, devolviendo probabilidad por categoría para priorizar la revisión.
- Revisión automatizada de contratos: la combinación de ventana de contexto amplia (peticiones de ~10.000 tokens en ContractNLI) y salida de esquema permite etiquetar cláusulas y detectar contradicciones con macro-F1 de 79,3.
- Agentes con tool calling: los 98,6 de precisión exacta en BFCL permiten usarlo como capa de selección de herramienta y argumentos en pipelines de agentes, con la ventaja de que la decisión se expresa como distribución de probabilidad y admite abstención.
- Análisis de logs de seguridad: el autor calibró activaciones con texto de logs de seguridad en el formato de prompt de Clef, lo que orienta el modelo a tareas de triaje de eventos y clasificación de alertas.
- Extracción de entidades financieras: FinEntity con 96,1 de macro-F1 lo hace apto para etiquetar entidades en documentos financieros dentro de un pipeline ETL.
- Evaluación de respuestas de código: CRUXEval (84,0) permite usarlo como juez o criba en pipelines de generación de código donde hay que decidir si la salida de un fragmento es correcta.
- Deduplicación y triaje de tickets con miles de clases: viable siempre que el número de opciones casi empatadas no sea muy alto, dado el riesgo documentado de la cuantización de activaciones.

## Benchmarks y rendimiento

Resultados sobre los 11 benchmarks del suite Decision Index 0.2.1 (20.337 peticiones), reconstruido con el kit oficial de reproducción y puntuado con su propio scorer. La columna «Clef bf16 (CF)» corresponde al resultado publicado por Cloudflare; «This NVFP4» se midió en una única RTX 5060 Ti de 16 GB. Los valores son los porcentajes ajustados por cobertura que usa el panel.

| Benchmark | Métrica | Clef bf16 (CF) | This NVFP4 | Δ |
|---|---|---|---|---|
| BFCL | precisión exacta por caso | 98,5 | 98,6 | +0,1 |
| BANKING77 | macro-F1 | 94,2 | 93,7 | -0,5 |
| CLINC150+OOS | macro-F1 | 97,4 | 97,3 | -0,1 |
| ContractNLI | macro-F1 | 81,4 | 79,3 (2 OOM) | -2,1 |
| ANLI | macro-F1 | 69,8 | 69,5 | -0,3 |
| ARC-Challenge | precisión | 97,7 | 97,4 | -0,3 |
| WinoGrande | precisión | 93,5 | 92,0 | -1,5 |
| MuSR | precisión | 83,5 | 82,2 | -1,3 |
| FinEntity | macro-F1 | 96,2 | 96,1 | -0,1 |
| CRUXEval | precisión | 86,7 | 84,0 | -2,7 |
| PhishNChips | precisión | 79,6 | 76,7 | -2,9 |

Brecha absoluta media frente a Cloudflare: 1,08 puntos (peor caso -2,9 en PhishNChips). Dos de las 123 peticiones de ContractNLI (~10.000 tokens) no caben en 16 GB y se puntúan como incorrectas según la regla de cobertura del kit, lo que explica aproximadamente 1,6 puntos de la brecha en ese benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: 13,2 GiB de pesos en VRAM; el autor indica un mínimo de 16 GB de VRAM en la GPU. En bf16 el mismo modelo ocupa unos 55 GB.
- GPU compatibles: obligatorio NVIDIA Blackwell (sm_120), ya que el matmul NVFP4 se ejecuta en los tensor cores FP4 mediante `torch._scaled_mm`. Probado en una RTX 5060 Ti de 16 GB. Otras Blackwell (RTX 5090, RTX 5080, RTX PRO 6000, B200) son compatibles por arquitectura, aunque no se documentan pruebas.
- GPU no compatibles: arquitecturas Ampere y Ada (por ejemplo RTX 4090 o A100) no disponen de sm_120 y no pueden ejecutar el matmul NVFP4 tal como está planteado. Para esas GPUs habría que recurrir al modelo base en bf16, que requiere del orden de 55 GB (A100 80 GB, H100 80 GB).
- ¿Cabe en GPU de consumo? Sí, en Blackwell de 16 GB o más, con la salvedad del punto anterior.
- Opciones de despliegue: `transformers` 5.17.0 con PyTorch 2.14.0+cu130 y driver 580.95.05, usando `load_release_model` de `joint_schema_model.py` para cargar la cabeza conjunta. vLLM lee compressed-tensors NVFP4 de forma nativa, pero para producir decisiones tipadas necesita la integración de la cabeza conjunta de Clef (PR #57250 de vLLM); el propio autor advierte que el servicio con vLLM no está verificado en este repositorio. llama.cpp, Ollama y TGI no están documentados.
- Latencia y throughput: no disponibles. Únicamente se documenta que el suite completo de 20.337 peticiones se ejecutó en una RTX 5060 Ti de 16 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Cloudflare/clef (bf16) | 27,36 mil millones | no disponible | bf16 | Apache-2.0 | Referencia de calidad; ~55 GB, no cabe en GPU de consumo |
| myroslavtryhubets/clef-NVFP4 | 27,36 mil millones | no disponible | NVFP4 W4A4 | Apache-2.0 | 13,2 GiB en VRAM; brecha media de 1,08 puntos frente a bf16 |
| clef-flash | no disponible | no disponible | W4A4 (según nota del autor) | no disponible | Pierde ~17 puntos en CLINC150 bajo W4A4, con 150 clases casi empatadas frente a activaciones de 4 bits |
| Qwen/Qwen3.8-27B | no disponible en esta información | no disponible | bf16 | no disponible en esta información | Modelo base del que deriva la arquitectura de Clef; no resuelve la tarea de decisión con esquema sin la cabeza conjunta |

## Limitaciones y advertencias

- Cuantización agresiva W4A4: las activaciones en 4 bits son el principal riesgo. El modelo hermano clef-flash pierde ~17 puntos en CLINC150 en este régimen; en este 27B la pérdida es de solo 0,1 puntos (97,4 a 97,3), pero la advertencia aplica si se añaden tareas con muchas opciones casi empatadas.
- Degradación desigual: la brecha llega a -2,9 puntos en PhishNChips y -2,7 en CRUXEval, muy por encima de la media de 1,08 puntos.
- Límite de memoria en contextos largos: dos de las 123 peticiones de ContractNLI, de unos 10.000 tokens, no caben en 16 GB y se contabilizan como incorrectas, lo que penaliza aproximadamente 1,6 puntos ese benchmark.
- Verificación limitada: la calidad se comprobó únicamente con el runtime del propio autor, no con un stack de servicio de terceros.
- Carga no estándar: la cabeza conjunta no se carga con `from_pretrained`; es obligatorio usar el código personalizado de Cloudflare. Esto complica la integración, el versionado y el empaquetado en producción.
- vLLM no verificado: aunque el formato compressed-tensors se lee de forma nativa, la ruta de servicio con la cabeza conjunta depende de un PR no fusionado y no está probada por el autor.
- Dependencia de hardware: requiere sm_120 (Blackwell) para el matmul FP4. No hay ruta documentada para Ampere o Ada.
- Idiomas y contexto: no disponibles en la información proporcionada, por lo que no se puede confirmar cobertura multilingüe ni ventana máxima.
- Sesgos: no se publica ninguna evaluación de sesgos. Los sesgos del modelo base (Qwen3.8-27B) y de los datos de calibración (UltraChat más logs de seguridad) se heredan sin cuantificar.
- Alucinación: el flujo principal emite probabilidades sobre un conjunto cerrado de opciones, lo que reduce el riesgo de texto inventado, pero no lo elimina si el esquema se construye mal o si la calibración se degrada fuera de la distribución de entrenamiento.
- Licencia: Apache-2.0 en el modelo base y en este derivado, lo que permite uso comercial; el autor aclara explícitamente que el repositorio no está afiliado ni avalado por Cloudflare.
- Madurez del repositorio: 0 descargas y 1 like en el momento de la consulta, publicado y actualizado con un minuto de diferencia el 4 de octubre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myroslavtryhubets/clef-NVFP4
- Modelo base: https://huggingface.co/Cloudflare/clef
- Modelo base de la arquitectura: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de Cloudflare sobre modelos de decisión: https://blog.cloudflare.com/clef-decision-models
- Suite de evaluación Decision Index 0.2.1: https://clef-evals.workers-ai-mle.workers.dev
- Kit de reproducción del Decision Index: https://github.com/apolinario/decision-index
- PR de vLLM para la integración de la cabeza conjunta de Clef: PR #57250 (sin URL en la información disponible)
