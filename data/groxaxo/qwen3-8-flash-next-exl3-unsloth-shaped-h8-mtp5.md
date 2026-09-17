# groxaxo/Qwen3.8-Flash-Next-exl3-unsloth-shaped-h8-mtp5

## Resumen

Qwen3.8-Flash-Next-exl3-unsloth-shaped-h8-mtp5 es una cuantización EXL3 del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario groxaxo. Se trata de un checkpoint de aproximadamente 32.590 millones de parámetros (32.585.522.688 según los safetensors) con arquitectura MoE que incorpora cabeza MTP (multi-token prediction) nativa y una tabla n-gram (PLE) embebida, además de una torre de visión cuantizada. El paquete completo ocupa unos 104,4 GB e integra nueve shards de pesos (65,2 GB) más una tabla n-gram de 39 GB.

El problema que resuelve es el de servir un modelo MoE grande en un equipo modesto: la receta emplea una asignación de bits por tensor ("Unsloth UD shape") con un objetivo de 3,821 bits por peso, concentrando precisión en los tensores sensibles (lm_head a 6 bpw, atención y Gated DeltaNet a 8 bpw, expertos compartidos a 6 bpw, MTP a 5 bpw, tabla n-gram y torre de visión a 6 bpw) y reduciendo los expertos MoE intermedios a 3-4 bpw. El resultado cabe en 3× RTX 3090 de 24 GB, un sobre de memoria de 72 GB de VRAM.

Es relevante ahora porque demuestra que es posible ejecutar un modelo MoE con decodificación especulativa integrada y ventana de contexto muy amplia (la configuración de servido documentada usa CACHE_SIZE=262144) en hardware de consumo de generación anterior, sin depender de vLLM ni de SGLang: el checkpoint es específico para ExLlamaV3 1.5.0 y no funciona con Transformers. El repositorio no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con expertos compartidos, atención y Gated DeltaNet, torre de visión, cabeza MTP y tabla n-gram (PLE); denominada Qwen4Exp en la documentación del autor |
| Parametros totales | 32.585.522.688 (~32,59 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens en la configuración de servido documentada (CACHE_SIZE=262144); longitud nativa del modelo base: no disponible |
| Tipos de cuantizacion | EXL3 con receta por tensor, 3,821 bpw efectivos; lm_head 6 bpw, head_bits 8, expertos compartidos 6 bpw, expertos MoE intermedios (up/gate) 3-4 bpw, down_proj especial 6 bpw, MTP 5 bpw, tabla n-gram (PLE) 6 bpw, torre de visión 6 bpw; codebook mul1, out_scales=always; calibración de 250 filas × 2048 columnas |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-1.0 (etiquetada como "other"; enlace a la licencia en https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE) |
| Formato de pesos | safetensors EXL3 (9 shards; repositorio de 104,4 GB, 65,2 GB de pesos + 39,0 GB de tabla n-gram) |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-Flash-Next (relación: quantized) |
| Herramienta de conversión | ExLlamaV3 1.5.0, sobre 3× RTX 3090 de 24 GB |
| Fecha de publicación | 16 de septiembre de 2026 (actualizado el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-Flash-Next, un transformer MoE con capas de atención y Gated DeltaNet (atención lineal híbrida), expertos compartidos, torre de visión y una cabeza MTP nativa. Esta publicación no entrena el modelo: es una cuantización. La receta EXL3 reparte bits por tensor siguiendo la forma del mapa UD-IQ4_XS de Unsloth (que a su vez aplicaba 643 overrides guiados por una matriz de importancia agéntica sobre el hermano sin censura), reexpresada como objetivos de bpw de EXL3. La calibración empleó 250 filas por 2048 columnas.

Los elementos diferenciadores del checkpoint son tres. Primero, la cabeza MTP está incluida en el propio checkpoint (5 bpw, 6.203 claves `mtp.*`, con `component="mtp"` nativo), por lo que no hay que añadir un modelo borrador externo. Segundo, la tabla n-gram (PLE) de 39 GB se mantiene a 6 bpw y se carga en RAM en lugar de en VRAM (`NGRAM_RAM=1`). Tercero, la torre de visión está cuantizada en el fichero (987 tensores `model.visual.*` y `language_model_only: false` en `config.json`), pero el backend con el que se midió rendimiento es solo texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. `tensor_parallel` no está implementado para esta arquitectura (Qwen4Exp), por lo que debe permanecer desactivado en el servido.

## Capacidades

- Generación de texto conversacional en inglés y chino, según los idiomas declarados en la model card.
- Decodificación especulativa nativa mediante la cabeza MTP integrada en el checkpoint, sin modelo borrador externo.
- Recuperación por n-gramas (tabla PLE) residente en RAM, que el autor mantiene activa en la configuración medida.
- Conmutación entre variantes instruct y thinking con reutilización de prefijo estable: según los experimentos del autor, el cambio de plantilla solo re-prefilla la última página gracias a la caché de páginas de exllamav3.
- Ventana de contexto configurable hasta 262.144 tokens con caché KV en `fp8_e4m3` (q8).
- Procesamiento de imagen: la torre de visión está presente y cuantizada en el checkpoint, pero el servidor con el que se midió (`exl3_qwen38_server.py`) es solo texto, carece de mmproj y rechaza cualquier parte de imagen con un error explícito. La capacidad multimodal no es utilizable con ese backend tal cual.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente para este checkpoint; el mapa de cuantización de origen se guio por una matriz de importancia agéntica, pero no se declaran capacidades de agente para este modelo.

## Casos de uso

- Inferencia local de un MoE de ~32,6 mil millones de parámetros en un solo servidor de 3× RTX 3090 de 24 GB: el reparto `gpu_split 24,24,24` y la tabla n-gram en RAM permiten mantener el modelo residente sin adquirir GPU de centro de datos.
- Análisis de documentos largos: la configuración de servido admite `CACHE_SIZE=262144`, lo que habilita resumir, extraer y consultar contratos, informes técnicos o expedientes extensos sin trocear el texto en fragmentos y perder coherencia global.
- Atención al cliente bilingüe inglés-chino: el modelo declara soporte de ambos idiomas y el pipeline conversacional encaja con diálogos multi-turno servidos mediante TabbyAPI o el servidor exllamav3.
- Aceleración de endpoints de chat interactivos: con MTP activo y `NUM_DRAFT_TOKENS=3` el autor midió 88,2 tok/s en prosa corta, frente a 64,7 tok/s con MTP desactivado, lo que reduce la latencia percibida en asistentes en tiempo real.
- Sustitución in-place del corte 3.50 HQ: al ocupar el mismo sobre de memoria (3×24 GB), un operador puede cambiar de checkpoint sin redimensionar el hardware y comparar A/B la calidad percibida en producción.
- Investigación en cuantización: la receta completa (`recipe-unsloth-shaped-fill.yaml`, bits por componente, calibración y codebook) está documentada, lo que permite reproducir el proceso y estudiar el impacto de la asignación de bits por tensor en modelos MoE.
- Despliegue en entornos con requisitos de confidencialidad: al ejecutarse íntegramente en hardware propio con ExLlamaV3, los datos no salen de la infraestructura del operador.
- Alternancia entre modo instruct y modo razonamiento dentro de la misma sesión, apoyándose en la reutilización de prefijo estable para evitar re-procesar todo el contexto en cada cambio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). El único dato cuantitativo aportado por el autor es un barrido de la ventana de borrador MTP sobre prosa corta, medido en el equipo de referencia (3× RTX 3090 24 GB, caché KV en fp8, chunk 256):

| Configuracion | Throughput medido (tok/s) |
|---|---|
| MTP activo, NUM_DRAFT_TOKENS=3 | 88,2 |
| MTP desactivado | 64,7 |
| MTP activo, NUM_DRAFT_TOKENS=6 | 62,4 |

Estos valores corresponden a un escenario de prosa corta y no deben extrapolarse a otras cargas de trabajo ni a otras configuraciones de hardware.

## Requisitos de hardware

- VRAM: los pesos cuantizados suman 65,2 GB y se reparten con `gpu_split 24,24,24` sobre tres GPU de 24 GB (72 GB totales). La tabla n-gram de 39 GB se carga en RAM del sistema (`NGRAM_RAM=1`), no en VRAM.
- GPU validadas: 3× RTX 3090 de 24 GB (configuración sobre la que se construyó y midió el checkpoint). No se documentan pruebas con A100, H100, RTX 4090 ni otras tarjetas.
- No cabe en una única GPU de consumo: con 65,2 GB de pesos cuantizados a 3,82 bpw, ni una RTX 4090 de 24 GB ni una RTX 5090 podrían alojarlo completas. Se necesita agregación de varias GPU o tres tarjetas de 24 GB.
- `tensor_parallel` no está implementado para la arquitectura Qwen4Exp y debe permanecer en `false` durante el servido.
- Opciones de despliegue: ExLlamaV3 1.5.0, TabbyAPI o cualquier servidor exllamav3 (el autor usó `exl3_qwen38_server.py`). No es un checkpoint de Transformers, vLLM ni SGLang, y por su formato EXL3 tampoco es compatible con llama.cpp u Ollama. Para ese ecosistema existe el GGUF UD-IQ4_XS citado como origen de la receta (88 GB).
- Caché KV: `CACHE_KV_BITS=8` (`fp8_e4m3`), `CACHE_SIZE=262144`, `CHUNK_SIZE=256`.
- Throughput de referencia en la configuración medida: 88,2 tok/s con MTP y 3 tokens de borrador; 64,7 tok/s sin MTP (prosa corta). Latencia no reportada.
- No se añade modelo borrador externo: la cabeza MTP ya está dentro del checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Bits por peso | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| groxaxo/Qwen3.8-Flash-Next-exl3-unsloth-shaped-h8-mtp5 (este) | ~32,59 mil millones | EXL3 safetensors, ~104,4 GB de repo (65,2 GB pesos + 39 GB n-gram) | 3,821 efectivos (hasta 8 en tensores sensibles) | 262.144 en la config de servido | qwen-community-1.0 | Público en HuggingFace, 0 descargas |
| groxaxo/Qwen3.8-Flash-Next-exl3-3.50bpw_hq_h6_ng6 (hermano) | ~32,59 mil millones | EXL3 safetensors | ~3,50 | no disponible | qwen-community-1.0 | Público en HuggingFace |
| turboderp/Qwen3.8-Flash-Next-exl3, rama 4.05bpw_h6_ng6 | ~32,59 mil millones | EXL3 safetensors | ~4,05 | no disponible | qwen-community-1.0 | Público en HuggingFace |
| Qwen/Qwen3.8-Flash-Next (base) | ~32,59 mil millones | BF16, 336 GB | 16 | no disponible | qwen-community-1.0 | Público en HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos checkpoints más allá de la afirmación del autor de que esta receta "debería igualar o superar" al corte 3.50 HQ en servido, sin cifras de calidad que la respalden.

## Limitaciones y advertencias

- No hay benchmarks de calidad publicados: no es posible verificar la degradación introducida por la cuantización a 3,82 bpw frente al modelo base en BF16 o frente a los cortes de 3,50 y 4,05 bpw.
- Compatibilidad muy restringida: solo ExLlamaV3 1.5.0 y servidores derivados. No funciona con Transformers, vLLM, SGLang, llama.cpp ni Ollama.
- `tensor_parallel` no está implementado para Qwen4Exp; el despliegue queda limitado a un único nodo con reparto por GPU (`gpu_split`).
- La torre de visión está cuantizada pero no es utilizable con el backend medido, que rechaza contenido de imagen por carecer de mmproj. Cualquier expectativa multimodal debe validarse con otro stack.
- Idiomas declarados: únicamente inglés y chino. No hay soporte declarado de castellano ni de otras lenguas.
- Licencia qwen-community-1.0 (etiqueta "other"): es una licencia comunitaria con condiciones específicas; conviene revisar el texto antes de cualquier uso comercial.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos: no documentados. El modelo base no incluye en esta ficha ninguna declaración de evaluación de sesgos.
- Trazabilidad: la model card advierte de que el README original de Qwen (documentación BF16) quedó en la primera subida como contenido heredado, lo que puede confundir al interpretar los ficheros.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (16 de septiembre de 2026), por lo que no existe validación comunitaria independiente.
- El origen de la receta por tensor es el GGUF UD-IQ4_XS de un modelo hermano "sin censura"; conviene verificar si ese linaje afecta al comportamiento del modelo resultante.
- Cualquier estimación de coste debe tener en cuenta los 39 GB de tabla n-gram en RAM, además de la VRAM de las GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/groxaxo/Qwen3.8-Flash-Next-exl3-unsloth-shaped-h8-mtp5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Corte hermano 3.50 HQ: https://huggingface.co/groxaxo/Qwen3.8-Flash-Next-exl3-3.50bpw_hq_h6_ng6
- Corte de referencia de turboderp (4.05bpw_h6_ng6): https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/4.05bpw_h6_ng6
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Experimentos del autor (origen de la forma de cuantización y A/B de plantillas): https://github.com/groxaxo/experimentos/tree/main/qwen-next-flash
- Plan de la campaña EXL3 3.50/3.75: https://github.com/groxaxo/experimentos/blob/main/qwen-next-flash/exl3-350hq-375-2026-09-15/PLAN.md
- Diario de la campaña: https://github.com/groxaxo/experimentos/blob/main/qwen-next-flash/exl3-350hq-375-2026-09-15/JOURNEY.md
- Barrido de la ventana de borrador MTP: https://github.com/groxaxo/experimentos/blob/main/qwen-next-flash/exl3-350hq-mtp-draft-q8-2026-09-16/BLOG.md
- Conmutación de variante con prefijo estable: https://github.com/groxaxo/experimentos/blob/main/qwen-next-flash/stable-prefix-variant-switch-2026-09-16/README.md
- Resultados de la busqueda web: no se han recuperado enlaces relevantes; las entradas devueltas correspondían a páginas genéricas de YouTube sin relación con el modelo.
