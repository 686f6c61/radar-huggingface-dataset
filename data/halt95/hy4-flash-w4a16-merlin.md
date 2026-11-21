# halt95/Hy4-flash-W4A16-Merlin

## Resumen

Hy4-flash-W4A16-Merlin es una cuantización de 4 bits de los expertos enrutados del modelo Hy4-flash de Tencent, publicada por el usuario halt95. El modelo base es un MoE (mixture of experts) de 220.000 millones de parámetros totales, de los cuales 64.000 millones corresponden a los parámetros Engram. Esta build reduce el peso en disco y en memoria a 152,6 GB manteniendo la ventana de contexto completa de 262.144 tokens sobre cuatro GPU de 24 GB, algo que el checkpoint original en BF16 no permite.

La ficha se publica dentro del ecosistema Merlin, un fork de vLLM optimizado para GPU Ampere y Ada. El checkpoint requiere Merlin 3.0.2.2 o superior; ni las versiones anteriores de Merlin ni vLLM estándar pueden servirlo. Los expertos enrutados se almacenan en W4A16 (pesos de 4 bits, activaciones de 16 bits) mediante cuantización RTN simétrica con grupo de 128 y sin calibración, mientras que las proyecciones de atención que Tencent distribuye en FP8 conservan sus bytes originales y las tablas Engram residen en RAM del host.

El interés actual del checkpoint es práctico: demuestra que un MoE de 220B con contexto de 256K puede desplegarse en hardware consumer de gama alta (RTX 3090) sin NVLink, con un pool de KV en FP8 en VRAM y decodificación especulativa mediante un drafter DFly2 de 5 capas. El autor reporta 75,7 tok/s en decodificación de un solo flujo a 4K y 1.608 tok/s de prefill sobre un prompt de 100K.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (latent-MoE) con Engram y decodificación especulativa DFly2 |
| Parámetros totales | 89.558.262.182 (safetensors del checkpoint); 220B en el modelo base, incluidos 64B de Engram |
| Parámetros activos | 16 expertos enrutados de 512 por capa (no se indica el total activo) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | W4A16 RTN simétrica (grupo 128) en expertos enrutados; FP8 block-128 en proyecciones de atención; FP8 en tablas Engram; INT4 en el drafter DFly2; BF16 en el resto; KV cache FP8 (`fp8_ds_mla`) |
| Idiomas soportados | en |
| Licencia | Tencent Hy License 1.0 (`tencent-hy-license`) |
| Formato de pesos | safetensors con layout `compressed-tensors` (149 shards, 191.005 tensores) |

## Arquitectura y entrenamiento

El modelo base Hy4-flash es un MoE con 512 expertos enrutados por capa de los que se activan 16, y una arquitectura que el autor denomina latent-MoE. Incorpora además cuatro tablas Engram (64B de parámetros en el modelo original) que actúan como memoria asociativa y que en esta build se mantienen en FP8 con una escala por fila, alojadas en RAM del host fijada (`EngramConfig cpu_offload=True`) en lugar de en VRAM. El checkpoint incluye un drafter DFly2 de 5 capas para decodificación especulativa, con capas lineales en INT4 y normas y proyecciones pequeñas en BF16.

La cuantización aplicada es puramente post-entrenamiento: no hay calibración ni fine-tuning. Los expertos enrutados usan round-to-nearest simétrico con grupo de 128 sobre pesos de 4 bits y activaciones de 16 bits. Las proyecciones `q_b_proj`, `o_proj` y `linear_gate` de las capas 1 a 41 copian sin modificar los bytes FP8 block-128 publicados por Tencent en `tencent/Hy4-flash-FP8`. El resto de tensores (capa 0, proyecciones de atención restantes, expertos compartidos, proyecciones latentes, routers, indexers, normas, `lm_head`, embedding de tokens y encoder de visión) permanece en BF16. El embedding de tokens se mantiene en RAM del host durante el servicio. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base.

Existe una segunda build en la rama `engram-bf16` que conserva las filas Engram en BF16 originales de Tencent (unos 118 GiB fijados en RAM, 126,7 GB) y que el autor no ha podido probar por falta de RAM en su host de cuatro tarjetas. La build por defecto (`main`) usa Engram en FP8 con unos 60 GiB (64,68 GB) fijados en RAM.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento con modo thinking activable y nivel de esfuerzo de razonamiento configurable (las mediciones se hicieron con `thinking on` y `reasoning effort high`).
- Contexto largo de hasta 262.144 tokens, con pool de KV en FP8 en VRAM.
- Decodificación especulativa mediante el drafter DFly2 incluido en el checkpoint.
- Cuantización de pesos y activaciones compatible con el motor Merlin para GPU Ampere (sm86) y Ada.
- El checkpoint contiene los pesos del encoder de visión, pero Merlin no los carga: la entrada de imágenes no está soportada en este despliegue.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.
- Idiomas: únicamente inglés según los metadatos del modelo.

## Casos de uso

- Procesamiento de documentos largos en una sola pasada: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o bases de código completas sin trocear, algo viable en cuatro RTX 3090 gracias al pool de KV en FP8.
- Asistencia conversacional en inglés con razonamiento explícito: el modo thinking con esfuerzo alto permite generar cadenas de razonamiento antes de responder, útil en soporte técnico donde se requiere justificar conclusiones.
- Despliegue en laboratorios con hardware consumer: el checkpoint está medido sobre 4× RTX 3090 sin NVLink a 220 W, lo que permite servir un MoE de 220B en infraestructura de gama alta de escritorio en lugar de clústeres de A100/H100.
- Evaluación de cuantización W4A16 frente a BF16: el autor publica la divergencia KL contra el modelo BF16, lo que convierte este checkpoint en una referencia para estudiar el impacto de la cuantización de 4 bits en MoE de gran tamaño.
- Investigación sobre decodificación especulativa: el drafter DFly2 en INT4 integrado permite medir tasas de aceptación y ganancias de throughput en un modelo real de 220B.
- Servicio de inferencia de bajo coste por token: con 75,7 tok/s en decodificación de un solo flujo y 1.608 tok/s de prefill en 100K, es adecuado para cargas interactivas moderadas sobre hardware reutilizado.
- Pruebas de motores de inferencia alternativos: al requerir Merlin 3.0.2.2 o superior, sirve para validar el fork de vLLM en Ampere frente a configuraciones estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de velocidad medidas con Merlin 3.0.2.2 (release candidate) sobre 4× RTX 3090 sin NVLink, 220 W y P2P activado, el 2026-11-21:

| Métrica | Condiciones | Valor |
|---|---|---|
| Decodificación, un flujo | Thinking on, effort high, T=0, prefill en frío, mediana de 3 envíos, 4K | 75,7 tok/s |
| Prefill | Envío en frío, prompt de 100K, tokens / tiempo hasta primer token | 1.608 tok/s |
| Pool de KV en VRAM | FP8 (`fp8_ds_mla`), íntegramente en VRAM | 609.398 tokens |
| Divergencia KL frente a BF16 | Build FP8 Engram por defecto | Reportada en la sección Quality de la model card (valor no incluido en la información disponible) |

## Requisitos de hardware

- VRAM: el checkpoint pesa 152,6 GB y está medido sobre 4× RTX 3090 de 24 GB (96 GB en total), con las tablas Engram y el embedding de tokens en RAM del host.
- RAM del host: unos 60 GiB (64,68 GB) fijados para Engram en FP8 en la build por defecto; la build `engram-bf16` requiere unos 118 GiB fijados y unos 198 GiB de RAM disponibles antes del arranque.
- GPU recomendadas: RTX 3090 (Ampere, sm86) es la plataforma validada; el motor está optimizado para Ampere y Ada. No se documenta soporte en Hopper ni en otras arquitecturas.
- Cabe en GPU consumer: sí, en cuatro RTX 3090 de 24 GB; no se documenta una configuración con menos tarjetas.
- Despliegue: exclusivamente mediante Merlin 3.0.2.2 o superior (`tools/merlin/launch.py` o `./setup.sh --model hy4flash`). vLLM estándar y versiones anteriores de Merlin no pueden servirlo.
- Latencia y throughput: 75,7 tok/s de decodificación de un solo flujo a 4K y 1.608 tok/s de prefill con prompt de 100K, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Despliegue |
|---|---|---|---|---|---|
| halt95/Hy4-flash-W4A16-Merlin | 89,6B en safetensors (220B en base) | 262.144 | W4A16 + FP8 + INT4 drafter | Tencent Hy License 1.0 | Merlin ≥ 3.0.2.2 |
| tencent/Hy4-flash | 220B (64B Engram) | 262.144 | BF16 | Tencent Hy License 1.0 | vLLM estándar |
| tencent/Hy4-flash-FP8 | 220B (64B Engram) | 262.144 | FP8 block-128 | Tencent Hy License 1.0 | vLLM estándar |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de calidad frente a estos u otros modelos de la misma categoría. La comparativa se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Solo inglés: los metadatos del modelo declaran únicamente `en`, sin soporte multilingüe documentado.
- Sin visión en este despliegue: los pesos del encoder están en los ficheros, pero Merlin no los carga, por lo que no se aceptan imágenes.
- Dependencia estricta de Merlin 3.0.2.2 o superior; no es servible con vLLM estándar ni con versiones anteriores del fork, lo que limita la portabilidad.
- La cuantización W4A16 sin calibración (RTN) introduce degradación de calidad respecto a BF16; el autor publica la divergencia KL pero no se incluye el valor en la información disponible.
- La build `engram-bf16` no ha sido probada en hardware por falta de RAM del host del autor; no hay datos de velocidad ni calidad para esa variante.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, y la model card contiene marcadores `TODO-AT-UPLOAD` sin resolver en la tabla de ficheros, lo que indica que la publicación puede estar incompleta.
- Licencia Tencent Hy License 1.0: es necesario revisar sus términos antes de cualquier uso comercial, ya que no es una licencia de código abierto estándar.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de robustez en la información disponible.
- El uso de RAM del host es elevado (unos 60 GiB fijados en la build por defecto), lo que condiciona el nodo de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halt95/Hy4-flash-W4A16-Merlin
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Versión FP8 del modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- Motor Merlin (fork de vLLM): https://github.com/halt95/merlin-engine
- Changelog de Merlin con las cifras medidas: https://github.com/halt95/merlin-engine/blob/merlin-v3.0.2.2/docs/CHANGELOG.md#measured-on-merlin-3022
- Licencia: https://huggingface.co/halt95/Hy4-flash-W4A16-Merlin/blob/main/LICENSE
- Discord del autor: https://discord.gg/jVDYAwdGzt
- Ko-fi del autor: https://ko-fi.com/halt95
