# aaa2015/DeepSeek-V4.1-Flash-1017-Q2-dense-q4-imx-cliecy-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo DeepSeek-V4.1-Flash-1017, un transformer multimodal de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek. La cuantización la firma el usuario aaa2015 y está pensada específicamente para su motor de inferencia `myds`, optimizado para Apple Silicon con Metal. El modelo base admite entrada de imagen y texto (pipeline `image-text-to-text`) y se distribuye bajo licencia MIT.

El interés de esta ficha no está en el modelo base, sino en el ejercicio de compresión extrema: un MoE con 384 expertos enrutados (6 activos por token, más 1 compartido) comprimido a IQ2_XXS/Q2_K en los expertos y Q4_K en las proyecciones densas, con calibración imatrix. El resultado ocupa 337,2 GiB repartidos en 8 fragmentos y requiere unos 150 GB de memoria unificada, lo que lo limita a equipos Apple Silicon de 192 GB o superiores.

La relevancia práctica es doble: por un lado demuestra que es viable ejecutar un MoE de gran tamaño con cuantización de 2 bits en hardware de consumo profesional (M2 Ultra), y por otro expone un formato de fragmentación por longitud de bytes con manifiesto `.parts` que permite lectura directa sin fusionar los 8 ficheros. Es, sin embargo, una cuantización Q2: el propio autor advierte que no sirve como referencia de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (384 expertos enrutados + 1 compartido) con componente vision (DeepSeek-ViT + MLP projector de 2 capas) |
| Parametros totales | No disponible para el modelo base; el campo safetensors del repo indica 485.268.480 (dato del repo, no del modelo completo) |
| Parametros activos | 6 expertos enrutados por token (configurable a 3 vía `MYDS_MOE_DECODE_TOPK`) |
| Longitud de contexto | Hasta 256K segun las pruebas del autor (prefill medido a 32K, 64K, 128K y 256K) |
| Tipos de cuantizacion | Expertos enrutados: IQ2_XXS (gate/up) + Q2_K (down); proyecciones densas: Q4_K con imatrix; F16/F32 en capas sensibles; tabla Engram dispersa en I8 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (8 fragmentos `.part01`–`.part08` + manifiesto `.parts`); vision encoder en GGUF separado |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 384 expertos enrutados y un experto compartido, del que cada token activa 6 expertos (o 3 si se ajusta `MYDS_MOE_DECODE_TOPK`). Incluye atención de tipo MLA (Multi-head Latent Attention) y una tabla dispersa denominada Engram, que en esta cuantización ocupa el 56% del fichero (188,8 GiB) y no se mantiene residente en memoria: el motor la lee bajo demanda mediante `pread` concurrente. El componente de visión es un DeepSeek-ViT con un projector MLP de dos capas, distribuido como GGUF aparte de 925,6 MiB.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La cuantización sí está documentada: los expertos enrutados (120 tensores, 142,4 GiB) usan IQ2_XXS en `gate/up` (87,0 GiB) y Q2_K en `down` (55,4 GiB); la ruta densa (MLA Q/K/V/Out, FFN del experto compartido, LM head, unos 6,0 GiB) sube a Q4_K con calibración imatrix sobre el conjunto `cliecy`, con F16/F32 en capas sensibles. La lógica del autor es que en decode cada token debe leer toda la superficie de pesos activada (7,55 GB con Top-6: 5,17 GB densos + 2,39 GB MoE), por lo que el ancho de bits de los expertos determina directamente la velocidad.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de contexto de hasta 256K tokens.
- Procesamiento de imágenes: entrada `image-text-to-text` mediante el encoder de visión DeepSeek-ViT más projector MLP.
- Comprensión de imágenes junto a texto en el mismo prompt (multimodal nativo del modelo base).
- Razonamiento de varios pasos y tareas de recuperación en contexto largo (verificado con pruebas de aguja en pajar según el autor).
- Identificación de problemas de seguridad en código: el autor reporta paridad con BF16 en 7 categorías de auditoría de seguridad.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.
- No se documenta modo thinking ni soporte de audio.
- Capacidades multilingües: no disponible.

## Casos de uso

- Auditoría de seguridad de código en local: el autor reporta que la cuantización mantiene la paridad con BF16 en 7 categorías de problemas de seguridad, por lo que puede usarse para revisar repositorios sin enviar código a servicios externos, siempre asumiendo la pérdida de precisión propia de Q2.
- Análisis de documentos largos con imágenes: con contexto de hasta 256K y encoder de visión, permite procesar informes escaneados, capturas o diagramas junto a texto extenso en una sola pasada.
- Asistente de investigación sobre corpus privados: la ventana de 256K y el buen comportamiento en recuperación de largo alcance lo hacen apto para consultar bases documentales internas en un equipo Apple Silicon de 192 GB.
- Prototipado de pipelines multimodales: sirve para validar arquitecturas de image-text-to-text antes de migrar a los pesos oficiales en BF16 o a un despliegue en GPU.
- Inferencia de demostración en estación de trabajo: con prefill de 727–738 t/s y decode de ~42–49 t/s en M2 Ultra, es viable para demos interactivas y evaluación cualitativa local.
- Evaluación comparativa de motores de inferencia: al ser la configuración de producción de `myds`, permite reproducir sus métricas y comparar con llama.cpp u otros motores tras fusionar los fragmentos.
- Experimentación con cuantización extrema de MoE: útil para estudiar el impacto de IQ2_XXS + Q2_K en expertos frente a Q4_K en capas densas sobre calidad y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí aporta métricas de inferencia medidas en `myds` sobre Apple M2 Ultra (76 núcleos GPU, 192 GiB de memoria unificada, ~148,4 GB residentes), con `temperature=0` y `max_tokens=256`:

| Metrica | Valor |
|---|---|
| Prefill en frio, 32K | 733,5–734,0 t/s |
| Prefill en frio, 64K | 737,9 t/s |
| Prefill en frio, 128K | 727,4 t/s |
| Reanudacion en caliente 128K + 2,4K (`MYDS_PREFIX_CACHE=1`) | 367,4 t/s (6,65 s) |
| Extension 128K → 256K | 655,3 t/s |
| Extension 256K + 304 tokens | 179,5 t/s (1,73 s) |
| Decode, flujo unico sin draft, Top-3 | ~49,4 t/s (estado corto) |
| Decode a 256K, Top-3 | 42,1–42,3 t/s |
| Decode con Top-6 completo (0-ULP estricto) | ~42,9–44,0 t/s |

## Requisitos de hardware

- Memoria: unos 150 GB de memoria unificada (el autor mide 148–150 GB residentes). Por debajo de 192 GB no cabe.
- GPU recomendadas: Apple M2 Ultra o M3 Ultra con 192 GB o más. No hay soporte documentado para GPU NVIDIA, AMD o ROCm en esta configuración.
- GPU de consumo: no cabe en ninguna RTX (ni 4090 con 24 GB ni configuraciones multi-GPU estándar sin adaptaciones no documentadas). Tampoco en equipos Apple de 32, 64 o 128 GB.
- Almacenamiento: 337,2 GiB para los 8 fragmentos; si se fusionan, se necesitan ~675 GiB adicionales durante la operación.
- Despliegue: motor `myds` (lectura directa de fragmentos mediante el manifiesto `.parts`). Para llama.cpp y familia hay que fusionar primero con `cat parts/*.gguf.part0?` y verificar el SHA256 `afe0b822dca2f2049112a589d96747b1890fa75f0f4212493260057c1d28cda3`.
- Advertencia operativa: no cargar dos instancias simultáneas en la misma máquina; la asignación Metal falla con `Insufficient Memory` y `prefill failed`.
- Throughput y latencia: ver tabla de benchmarks (prefill ~727–738 t/s, decode ~42–49 t/s en M2 Ultra).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a lo documentado.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base, BF16) | No disponible (MoE, 384 expertos) | No disponible | MIT | safetensors | Referencia de precisión; requiere hardware muy superior |
| Esta cuantización Q2 dense-q4 | Mismos que el base | Hasta 256K (medido) | MIT | GGUF en 8 fragmentos | ~150 GB de memoria unificada; solo Apple Silicon 192 GB+ |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | Sin datos verificables en la información disponible |

## Limitaciones y advertencias

- Es una cuantización Q2 en los expertos: el autor advierte explícitamente que no debe usarse como referencia de precisión; para línea base hay que recurrir a los safetensors oficiales.
- El campo de parámetros totales del repo (485.268.480) no refleja el tamaño real del modelo base y no debe citarse como spec del modelo.
- Requiere hardware muy específico (Apple Silicon con 192 GB o más); no hay ruta documentada para GPU NVIDIA.
- El manifiesto `.parts` es obligatorio: si falta o se altera el orden de concatenación, el motor carga datos desalineados sin error aparente.
- La tabla Engram en I8 (188,8 GiB) se lee bajo demanda; el rendimiento depende del almacenamiento y de la concurrencia de `pread`.
- El rendimiento reportado está medido exclusivamente en `myds`; no hay cifras para llama.cpp u otros motores.
- No hay información sobre sesgos, comportamiento multilingüe ni riesgo de alucinación específico de esta cuantización.
- La licencia MIT se hereda del modelo base, pero conviene conservar el README y la atribución al redistribuir.
- El modelo base y esta cuantización tienen fechas de creación (2026) posteriores a la mayoría de referencias públicas; verificar disponibilidad y vigencia antes de integrar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aaa2015/DeepSeek-V4.1-Flash-1017-Q2-dense-q4-imx-cliecy-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor de inferencia `myds`: https://github.com/aaa2015/myds
- Documentación de visión de `myds`: `docs/VISION.md` en el repositorio de `myds`
- Documentación de conmutadores 0-ULP: `docs/ULP_SWITCHES.md` en el repositorio de `myds`
