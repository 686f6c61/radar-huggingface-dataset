# open-athena/Snowball-67B-A2B-Identity-PathB-M49-2026.10.30

## Resumen

Snowball 67B A2B Identity Path B M49 es un artefacto de investigación publicado por el colectivo open-athena en Hugging Face. No se trata de un modelo entrenado de forma convencional, sino de una fusión lineal de pesos en espacio de parámetros: una combinación tensor a tensor de dos checkpoints previos (A3 y A8a), ambos derivados a su vez del modelo base Marin Snowball v0.1 (ADC0078a). El resultado es un checkpoint de 67.078.882.816 parámetros (unos 67B) con arquitectura MoE del tipo `grug_moe`, empaquetado en safetensors y con un tamaño de repositorio de 134,2 GB.

La operación de merge aplica la fórmula `W = 0.51·A3 + 0.49·A8a` por tensor, con acumulación en FP32 y un único cast final, preservando 26 sesgos de router en FP32 y 256 filas protegidas. El perfil de identidad entrenado corresponde a "Marin's Latest MoE", desarrollado por la Marin Community. El checkpoint incorpora un SFT de identidad (tag `identity-sft`) orientado a que el modelo se identifique correctamente como creación de dicha comunidad.

Su relevancia es metodológica más que de producto: documenta con un rigor inusual el proceso de merge (recetas, manifiestos, hashes por tensor, fracciones de entradas modificadas) y publica resultados de evaluación con intervalos de confianza y reglas de parada pre-registradas. El propio autor lo declara no apto para producción: el checkpoint "trips the registered GSM8K stop line" con una regresión de −1,5921 pp frente al modelo base, por lo que se presenta explícitamente como artefacto de investigación con regresión de capacidad conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `grug_moe`, familia Marin) |
| Parametros totales | 67.078.882.816 (~67B) |
| Parametros activos | no disponible (denominación "A2B" sugiere ~2B activos, no confirmado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de la familia Marin, identificado con la etiqueta `grug_moe`. No se dispone de detalles sobre número de capas, dimensión oculta, número de expertos ni top-k de enrutamiento en la información proporcionada. El checkpoint M49 no se ha entrenado: es una fusión lineal de dos checkpoints existentes (A3 como ancla y A8a como único donante), ambos derivados de Marin Snowball v0.1. La receta de merge usa coeficientes [0.49] sobre el donante, densidad 1, escala 1, semilla 0, y excluye deliberadamente el punto medio 0,5 por los empates en BF16. Los 104 tensores congelados y las 256 filas protegidas se verificaron por hash contra v0.1, y se compararon configuraciones, tokenizer y formas antes de la evaluación.

El proceso de entrenamiento subyacente (el del modelo base v0.1) no se detalla en la información disponible: no se especifican número de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí se documenta es el SFT de identidad aplicado en los checkpoints de origen, orientado a fijar la auto-identificación como "Marin's Latest MoE" creado por la Marin Community. La trazabilidad es destacable: se publican `merge-recipe.json`, `merge-manifest.json` y `KEEP.md` con hashes por tensor, y se conservan los ficheros fuente byte a byte bajo `source-provenance/`, con verificación SHA256 en la subida y en la revisión final del Hub.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento matemático: evaluado en GSM8K y MATH500 con resultados cercanos al modelo base (ver sección de benchmarks).
- Tool calling / function calling: evaluado con BFCL (Berkeley Function Calling Leaderboard) con un 29,4715% de media en cuatro ejecuciones puntuadas.
- Perfil de identidad SFT: responde con el nombre canónico del modelo y acredita a la Marin Community como creadora (29-30 nombres canónicos y 32-40 créditos de creador sobre 52 prompts centrales, según modo thinking).
- Modo thinking: el checkpoint gestiona un span de razonamiento interno que se cierra correctamente en 48 de 52 prompts del screen de identidad.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigación sobre fusión de pesos (model merging): el checkpoint sirve como caso de estudio reproducible de merge lineal con receta documentada, hashes por tensor y métricas de cambio por entrada, útil para equipos que investigan técnicas de interpolación de modelos.
- Estudio de SFT de identidad: permite analizar cómo un perfil de identidad entrenado sobrevive (o no) a una fusión de pesos, comparando las tasas de auto-identificación correcta antes y después del merge.
- Evaluación de metodología de benchmarks: el modelo documenta intervalos de confianza bootstrap, reglas de parada pre-registradas y manejo de ejecuciones incompletas (slot 1 agotado por fallos de infraestructura), lo que lo convierte en material didáctico sobre evaluación rigurosa de modelos.
- Reproducción de experimentos de tool calling: con los resultados BFCL publicados (39, 38, 32 y 36 aciertos de 123), un investigador puede replicar el protocolo y contrastar la variabilidad entre ejecuciones (SD de 2,5168 pp).
- Análisis de regresiones por merge: dado que el checkpoint presenta una regresión medible en GSM8K (−1,5921 pp con IC95% [−2,4514, −0,7582]), es útil para estudiar qué capacidades se degradan al combinar checkpoints y a qué coste.
- Auditoría de procedencia y cadena de custodia: el repositorio conserva ficheros fuente originales, hashes SHA256 de receipts de tensores y de listas de objetos, lo que permite practicar flujos de verificación de artefactos en pipelines de MLOps.

## Benchmarks y rendimiento

| Benchmark | M49 | Referencia | Diferencia (IC 95%) |
|---|---|---|---|
| BFCL (media de 4 ejecuciones de 123) | 29,4715% (SD 2,5168 pp) | v0.1 fresco: comparación primaria | +1,8293 pp [−1,7480, +4,8780] |
| BFCL vs A3 | 29,4715% | A3 | −1,5854 pp [−5,2846, +1,7886] |
| BFCL vs A8a | 29,4715% | A8a | +3,2927 pp [+0,4065, +6,1789] |
| GSM8K (media de 3 decodes) | 90,5231236% | v0.1: 92,1152388% | −1,5921 pp [−2,4514, −0,7582] |
| MATH500 (media de 3 decodes) | 92,0667% | v0.1: 92% | +0,0667 pp [−1,2667, +1,4] |

Notas: el slot 1 de BFCL quedó agotado por fallos de infraestructura en sus tres intentos y no contribuye puntuación; la media se calcula sobre cuatro ejecuciones reales (n=4) sin relleno. La regla de parada pre-registrada para GSM8K (delta puntual < −1,5 pp y cota superior del IC < 0) se cumple, lo que marca el checkpoint como artefacto de investigación con regresión conocida.

## Requisitos de hardware

- VRAM estimada para inferencia: con 67B parámetros en BF16, el peso completo ocupa aproximadamente 134 GB, por lo que se necesita al menos ese espacio más overhead de activaciones y KV cache. En cuantización de 8 bits bajaría a ~67 GB y en 4 bits a ~34 GB, aunque no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: para BF16 completo, múltiples A100 80GB o H100 80GB (2-4 unidades según paralelismo y contexto). Para cuantizaciones de 4 bits, una sola A100 80GB o H100 podría ser suficiente.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; en 4 bits (~34 GB) tampoco cabe en una sola 4090 y requeriría reparto entre varias o una GPU de 48 GB.
- Opciones de despliegue: al ser un MoE con pesos safetensors, es compatible con vLLM y TGI para servir en BF16; llama.cpp y Ollama requerirían conversión a GGUF, no publicada por el autor. Para investigación, transformers con `device_map` es la vía directa.
- Latencia y throughput: no disponibles. Al ser un MoE con etiqueta "A2B" (probablemente ~2B activos), el throughput esperado sería alto en relación al tamaño total, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Snowball 67B A2B M49 | ~67B (MoE) | no disponible | 29,4715% | 90,5231% | openmdw-1.1 | Hugging Face (research) |
| Marin Snowball v0.1 | no disponible | no disponible | referencia (diferencia +1,8293 pp a favor de M49) | 92,1152% | no disponible | Hugging Face |
| Checkpoint A3 (ancla) | no disponible | no disponible | +1,5854 pp sobre M49 | no disponible | no disponible | interno al linaje |
| Checkpoint A8a (donante) | no disponible | no disponible | −3,2927 pp bajo M49 | no disponible | no disponible | interno al linaje |

La comparación significativa es contra el propio linaje (v0.1, A3, A8a), ya que el autor no aporta comparaciones con modelos de otros desarrolladores. Frente a v0.1, M49 mejora BFCL de forma no concluyente (el IC incluye cero) y empeora GSM8K de forma estadísticamente significativa.

## Limitaciones y advertencias

- Artefacto de investigación sin aprobación de despliegue: el autor indica explícitamente que no ha sido probado ni evaluado adecuadamente y que puede no ser seguro.
- Regresión de capacidad conocida: incumple la regla de parada pre-registrada de GSM8K (−1,5921 pp con cota superior −0,7582), por lo que no es candidato a release.
- Evaluación sobre cohortes pequeñas y fijas: los resultados de BFCL se basan en cuatro ejecuciones (n=4) en lugar de las cinco planificadas, con intervalos correspondientemente anchos y sin relleno de datos faltantes.
- Identidad no garantizada: el propio autor advierte que ninguna puntuación establece corrección de identidad amplia, seguridad ni preparación para release; el screen de identidad cubre solo 52 prompts centrales.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Idiomas soportados: no declarados, lo que impide garantizar calidad multilingüe.
- Licencia openmdw-1.1: no se detallan en la información disponible las condiciones exactas para uso comercial; debe consultarse el texto completo de la licencia antes de cualquier uso productivo.
- Sesgos: no documentados.
- Diferencias metodológicas en las comparaciones: el autor señala que las comparaciones conservan diferencias de dosis, replay y agrupación, lo que limita la interpretabilidad de las deltas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Snowball-67B-A2B-Identity-PathB-M49-2026.10.30
- Ficheros de receta y manifiesto citados en la model card: `merge-recipe.json`, `merge-manifest.json`, `KEEP.md` (disponibles en el repositorio del modelo)
- Procedencia conservada: `source-provenance/` (README y atributos Git originales dentro del repositorio)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
