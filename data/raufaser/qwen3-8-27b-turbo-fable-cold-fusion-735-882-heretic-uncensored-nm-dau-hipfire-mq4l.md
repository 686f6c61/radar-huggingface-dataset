# Raufaser/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-hipfire-MQ4L

## Resumen

Esta ficha describe una conversión de cuantización, no un modelo original. Se trata de tres archivos en formato MQ4-Lloyd (tipo de cuantización 52) generados por el usuario Raufaser a partir del checkpoint `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, un modelo de la familia Qwen 3.8 con 27.000 millones de parámetros nominales según su nombre. Los archivos están pensados exclusivamente para el motor de inferencia hipfire y no son legibles por llama.cpp, lo que limita drásticamente su portabilidad.

La innovación técnica del repositorio es el códec MQ4-Lloyd: un contenedor MQ4V2 rotado con FWHT que mantiene grupos de 136 bytes, pero sustituye la rejilla uniforme de 4 bits por un codebook Lloyd-Max de 16 niveles por tensor, al mismo régimen de bits. Los archivos incorporan escalas de activación AWQ derivadas de una matriz de importancia específica del checkpoint. Según el autor, esto reduce la divergencia KL entre un 10,3 % y un 10,7 % frente a la cuantización MQ4V2 uniforme con AWQ.

El interés del repositorio es, por tanto, metodológico y de nicho: documenta un pipeline de cuantización reproducible sobre hardware AMD (gfx1100, RX 7900 XTX) y publica métricas de calidad (KLD) comparables entre sí. No aporta información sobre el modelo base más allá de su nombre, y no se han publicado benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere Qwen 3.8; los archivos incluyen tensores `linear_attn.out_proj` y `ssm_out`, compatibles con capas de atención lineal/SSM, pero no se detalla) |
| Parámetros totales | 27B según el nombre del checkpoint; el campo safetensors del repo indica 6.789.424 (dato inconsistente, probablemente recuento parcial de tensores) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MQ4-Lloyd (qt 52), 4 bits con codebook Lloyd-Max de 16 niveles por tensor, escalas AWQ; tres tiers: `xt`, `base`, `pro` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (declarada por el checkpoint origen; el autor no reclama derechos sobre los pesos) |
| Formato de pesos | `.mq4l` (contenedor MQ4V2-Lloyd propietario de hipfire; no compatible con GGUF ni con llama.cpp) |

Tamaños de archivo publicados:

| Archivo | Tier | Bytes |
|---|---|---:|
| `...NM-DAU.mq4l` | base | 15.671.109.632 |
| `...NM-DAU.mq4l-pro` | pro | 16.472.669.184 |
| `...NM-DAU.mq4l-xt` | xt | 14.995.679.296 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. El nombre del checkpoint remite a la familia Qwen 3.8 con 27B de parámetros, y la reproducción menciona tensores `ssm_out` (`linear_attn.out_proj`), lo que sugiere la presencia de capas de atención lineal o módulos híbridos, pero no se confirma la composición completa de la red, el número de capas, las dimensiones ocultas ni el esquema de atención.

Lo que sí está documentado es el proceso de cuantización. Se parte de los safetensors en BF16 y de una imatrix recogida específicamente sobre este checkpoint con `llama-imatrix` de llama.cpp, sobre la rebanada congelada WT2 (128 fragmentos de 2048 tokens, 262.000 tokens en total, archivo de 27 MB). Se probó una imatrix mayor de 1,27 millones de tokens con corpus mixto y produjo peor KLD en la evaluación WT2, por lo que se descartó. La cuantización usa `hipfire-quantize` con `--format mq4v2-lloyd`, `--awq` y `--awq-fix-la-head-order`, este último para reordenar las entradas de las cabezas V de atención lineal del imatrix de llama.cpp al orden de Hugging Face. Los tres tiers difieren en qué tensores se elevan de precisión: `xt` mantiene `lm_head` en el códec base, `base` eleva `embed` y `lm_head`, y `pro` eleva además `ssm_out`.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`.
- Razonamiento y código: no hay información específica ni benchmarks que lo confirmen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está poblado).
- Modo thinking, visión o audio: no disponible.
- La etiqueta `Heretic-Uncensored` en el nombre del checkpoint sugiere un ajuste orientado a reducir rechazos, pero no se documenta el método ni su alcance.

## Casos de uso

- Evaluación de códecs de cuantización: comparar MQ4-Lloyd frente a MQ4V2 uniforme con las mismas escalas AWQ usando las métricas KLD publicadas y la rebanada WT2, para decidir qué códec conviene en un despliegue concreto.
- Investigación sobre cuantización con codebooks no uniformes: el repositorio documenta el pipeline completo (`hipfire-quantize`, imatrix, tiers) y permite reproducir el experimento sobre otros checkpoints.
- Despliegue en hardware AMD con hipfire: los archivos están validados en gfx1100 (RX 7900 XTX) con HIP 7.16 / TheRock 10.1, por lo que sirven como referencia para pipelines de inferencia en GPUs AMD.
- Pruebas de inferencia local con KV en q8: el comando de ejemplo (`hipfire serve ... --kv q8 --spec off`) permite levantar el modelo con caché de clave-valor cuantizada a 8 bits, útil para medir consumo de VRAM en un equipo concreto.
- Selección de tier según presupuesto de memoria: los tres tamaños (14,99 GB, 15,67 GB y 16,47 GB) permiten ajustar el equilibrio calidad/memoria en una misma máquina.
- Estudio de sensibilidad de tensores: la diferencia entre `xt`, `base` y `pro` permite analizar cuánto aporta elevar `embed`, `lm_head` y `ssm_out` a la fidelidad global del modelo cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo único publicado son métricas de divergencia KL frente al profesor `DavidAU.mq5v2-pro.hfq`, sobre la rebanada WT2 (24 fragmentos de 2048 tokens, 24.552 tokens puntuados), en gfx1100 con `--scoring-mode prefill --max-chunks 24 --kv-mode q8 --kv-v q8`, `HIPFIRE_GRAPH=0`, `HIPFIRE_NORMALIZE_PROMPT=0` y `HIPFIRE_IU4_PREFILL=0`:

| Tier | MQ4V2 uniforme con AWQ | MQ4-Lloyd con AWQ | Reducción |
|---|---:|---:|---:|
| base | 0,044981 | 0,040335 | 10,3 % |
| pro | 0,042598 | 0,038053 | 10,7 % |
| xt | 0,051776 | 0,046369 | 10,4 % |

El propio autor advierte que estas cifras son comparables entre sí, pero no con las publicadas en `hipfire-models/qwen3.8-27b`, que usan un profesor distinto.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos pesan entre 14,99 GB (`xt`) y 16,47 GB (`pro`); hay que sumar la caché KV (el ejemplo usa `--kv q8`) y el overhead del runtime, por lo que en la práctica se necesita bastante más que el tamaño del archivo.
- GPU validadas: AMD RX 7900 XTX (gfx1100) con HIP 7.16 / TheRock 10.1, según la documentación de reproducción y evaluación.
- GPU NVIDIA: no hay datos publicados de funcionamiento en A100, H100 o RTX 4090 para estos archivos; el imatrix se recogió en una RTX 4090, pero la inferencia documentada es en AMD.
- ¿Cabe en GPU de consumo? Los tamaños de archivo son compatibles con GPUs de 24 GB, pero no se confirma el consumo real con caché KV incluida.
- Opciones de despliegue: exclusivamente hipfire (build con soporte de qt 52). llama.cpp no puede leer estos archivos. No hay conversión a GGUF ni a safetensors publicada en este repo.
- Latencia y throughput: no disponibles.
- No se incluye sidecar MTP; el ejemplo de ejecución desactiva la decodificación especulativa (`--spec off`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (MQ4-Lloyd, tier base) | 27B (según nombre) | no disponible | `.mq4l` (solo hipfire) | Apache-2.0 | 3 archivos, 47,2 GB de repo |
| Checkpoint origen `DavidAU/Qwen3.8-27B-...-NM-DAU` | 27B (según nombre) | no disponible | safetensors / GGUF según el autor | Apache-2.0 | Hugging Face |
| `DavidAU.mq5v2-pro.hfq` (profesor de la evaluación) | 27B (según nombre) | no disponible | `.hfq` (hipfire) | no disponible | usado como referencia interna |
| Familia Qwen 3.8 estándar | no disponible | no disponible | safetensors, GGUF | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento (benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Portabilidad nula: los archivos solo se cargan en hipfire con soporte de qt 52; llama.cpp, vLLM, TGI, Ollama y transformers no pueden leerlos.
- Inconsistencia en el recuento de parámetros: el nombre indica 27B, pero el campo safetensors del repo marca 6.789.424; conviene verificar el checkpoint origen antes de asumir cualquier cifra.
- Sin benchmarks de capacidad: no hay MMLU, HumanEval ni GSM8K publicados, por lo que no se puede evaluar la calidad real del modelo base a partir de este repo.
- Métricas KLD no comparables con las publicadas en `hipfire-models/qwen3.8-27b`: usan un profesor distinto, según advierte el autor.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Idiomas: el campo de idiomas no está poblado; no se puede confirmar cobertura multilingüe.
- La etiqueta `Heretic-Uncensored` implica un ajuste orientado a reducir rechazos; no se documenta el método, el alcance ni los riesgos asociados, y puede ser inadecuado para aplicaciones en producción con requisitos de moderación.
- Licencia: Apache-2.0 declarada por el checkpoint origen; el autor de la conversión no reclama derechos sobre los pesos, pero la licencia del modelo base debería verificarse en su propia model card.
- Repo de 47,2 GB con tres variantes del mismo modelo; el espacio en disco es considerable para un único checkpoint.
- Sin sidecar MTP: no hay decodificación especulativa disponible en esta publicación.
- Fecha de creación del repo: 19 de noviembre de 2026; sin descargas ni likes en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Raufaser/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-hipfire-MQ4L
- Checkpoint origen: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio hipfire: https://github.com/warpfront/hipfire
- PRIOR-ART de hipfire: https://github.com/warpfront/hipfire/blob/master/PRIOR-ART.md
- PR que añade MQ4-Lloyd: https://github.com/warpfront/hipfire/pull/768
- PR de la ruta Lloyd para gfx1100: https://github.com/warpfront/hipfire/pull/1029
