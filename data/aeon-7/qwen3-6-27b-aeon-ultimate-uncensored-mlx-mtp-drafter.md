# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter es un modelo borrador (*drafter*) de decodificación especulativa, no un modelo conversacional. Lo publica el usuario AEON-7 en Hugging Face y consiste en la cabeza nativa de predicción multi-token (MTP, *multi-token prediction*) extraída del modelo `AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16` y empaquetada como modelo auxiliar independiente para MLX. Su función es proponer bloques de tokens que un modelo objetivo completo verifica después, acelerando la generación sin alterar la distribución de salida.

El modelo resuelve un problema muy concreto: la latencia de decodificación en Apple Silicon. Al ser una cabeza MTP entrenada de forma nativa por la familia Qwen (tipo `qwen3_5_mtp`), acepta propuestas más profundas que un borrador genérico, y según el autor alcanza 1,78× de velocidad de decodificación sin pérdida de calidad con `block_size 3` sobre el objetivo FP4. Es relevante para quienes despliegan modelos Qwen de 27B en Mac con MLX y quieren aumentar el throughput sin sacrificar fidelidad.

Con 424,7 millones de parámetros y un repositorio de 0,9 GB, es un artefacto ligero que se carga junto al modelo objetivo. No debe usarse de forma autónoma: no responde prompts ni genera texto por sí mismo. La model card indica además que esta línea ha quedado superada por la release Qwen3.8 del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de predicción multi-token (MTP) sobre transformer, tipo `qwen3_5_mtp` |
| Parametros totales | 424.699.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en BF16 (la cabeza no se cuantiza en los objetivos MLX); repo en safetensors |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

Se trata de la cabeza MTP nativa del modelo base Qwen3.6-27B de AEON-7, extraída y distribuida como modelo borrador independiente. La cabeza está condicionada al estado oculto del modelo objetivo y predice de golpe los siguientes tokens; el servidor la carga como modelo lateral ligero. El `block_size` de referencia es 3, que el autor identifica como el punto óptimo medido. Los pesos se mantienen en BF16 y no se cuantizan en las recetas de los objetivos MLX.

El entrenamiento de la cabeza proviene del modelo base Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16; no se detalla en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable es el uso de autospeculación: el objetivo verifica cada token propuesto contra su propia distribución, de modo que la salida es idéntica a ejecutar el objetivo solo. El autor afirma que, al estar la cabeza entrenada de forma nativa por Qwen, la tasa de aceptación supera el 94 % con `block_size 3`, frente al 1,1–1,2× típico de cabezas MTP genéricas.

## Capacidades

- Predicción multi-token: propone bloques de hasta 3 tokens a partir del estado oculto del modelo objetivo.
- Decodificación especulativa sin pérdida: cada token propuesto se verifica contra la distribución del objetivo.
- Autospeculación (*self-speculation*): no requiere un modelo borrador externo de otra familia.
- Compatibilidad con objetivos MLX de la familia Qwen3.6-27B de AEON-7 (FP4 y 8 bits).
- Integración con `mlx-vlm` mediante los flags `--draft-model`, `--draft-kind mtp` y `--draft-block-size`.
- No soporta generación de texto autónoma, tool calling, agentes, visión ni audio por sí mismo; esas capacidades residen en el modelo objetivo.

## Casos de uso

- Aceleración de inferencia local en Mac: se adjunta al objetivo FP4 en `mlx_vlm.server` para elevar el throughput de 14,9 a 26,5 tok/s en un M4 Pro de 48 GB, según las mediciones del autor.
- Servicio de chat de baja latencia en Apple Silicon: al mantener la distribución del objetivo, se puede usar en producción sin recalibrar evaluaciones de calidad.
- Despliegue de modelos de 27B en equipos de sobremesa con memoria unificada: permite servir el objetivo 8 bits o FP4 con mayor velocidad sin GPU dedicada.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia de cabeza MTP nativa frente a borradores genéricos.
- Prototipado de pipelines de generación larga: con `temperature 1.0`, `top_p 0.95` y `top_k ~64`, reduce el tiempo total en cargas de generación extensa.
- Investigación sobre aceptación de bloques: permite barrer `block_size` (2, 3, 4) y medir tasa de aceptación y tokens aceptados por ronda.
- Integración en herramientas de desarrollo con MLX: se configura como flag del servidor, sin cambios en el código de la aplicación cliente.

## Benchmarks y rendimiento

Mediciones del autor en MacBook Pro M4 Pro de 48 GB, `mlx-vlm` git main, decodificación greedy tras calentamiento, objetivo FP4:

| Configuracion | tok/s | Incremento | Tasa de aceptacion | Tokens aceptados/ronda |
|---|---:|---:|---:|---:|
| FP4 baseline | 14,9 | 1,00× | — | — |
| + MTP bs=2 | 23,5 | 1,58× | 97,3 % | 1,97 |
| + MTP bs=3 (optimo) | 26,5 | 1,78× | 94,7 % | 2,89 |
| + MTP bs=4 | 25,4 | 1,70× | 86,9 % | 3,61 |

El autor indica que el objetivo 8 bits rinde 8,2 tok/s, por lo que la combinación FP4 + MTP bs=3 supone aproximadamente 3,2× esa cifra. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es coherente con que el artefacto sea un borrador y no un modelo evaluable de forma autónoma.

## Requisitos de hardware

- VRAM o memoria unificada: el repositorio ocupa 0,9 GB; se suma al objetivo (27B) que se cargue en paralelo.
- GPU recomendadas: Apple Silicon con Metal; el autor mide en M4 Pro de 48 GB. No hay datos para A100, H100 ni RTX 4090, ya que el formato es MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente para alojar el objetivo más el borrador.
- Opciones de despliegue: `mlx-vlm` (servidor) con Python 3.12 y `uv`; flags `--draft-model`, `--draft-kind mtp` y `--draft-block-size 3`.
- Latencia y throughput: 26,5 tok/s con objetivo FP4 y bs=3 en M4 Pro de 48 GB; 23,5 tok/s con bs=2; 25,4 tok/s con bs=4.
- Nota: `--prefill-step-size` no tiene efecto bajo MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-AEON-MLX-MTP-Drafter | 424,7 M | no disponible | Borrador MTP para MLX | other | Hugging Face |
| Cabeza MTP generica (otras familias) | no disponible | no disponible | Borrador MTP | variable | variable |
| Modelo borrador externo de otra familia | variable | variable | Decodificacion especulativa | variable | variable |

No se dispone de datos comparativos de rendimiento con alternativas concretas en la información proporcionada. El autor sí contrasta cualitativamente con cabezas MTP genéricas, a las que atribuye un incremento de 1,1–1,2× frente al 1,78× de esta.

## Limitaciones y advertencias

- No es un modelo de chat: cargarlo solo no produce respuestas útiles; requiere un objetivo MLX compatible.
- Solo funciona con objetivos de la familia Qwen3.6-27B de AEON-7 (FP4 u 8 bits); no es portable a otros modelos.
- Dependencia de `mlx-vlm` desde git main y de Python 3.12; posibles roturas por cambios en la librería.
- El modo greedy por defecto puede entrar en bucles en prompts largos; el autor recomienda `temperature 1.0`, `top_p 0.95` y `top_k ~64`.
- Licencia "other": es necesario revisar los términos del autor antes de uso comercial.
- Idiomas: solo inglés declarado.
- Riesgo de alucinación y sesgos: heredados del modelo objetivo, no del borrador.
- Modelo marcado como superado por la release Qwen3.8 del mismo autor; se mantiene solo por histórico y descargas existentes.
- No hay información sobre contexto máximo, datos de entrenamiento ni evaluaciones de calidad estándar.

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter
- Modelo base: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Objetivo MLX FP4: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4
- Objetivo MLX 8 bits: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit
- Release sucesora (Qwen3.8 NVFP4-MIXED): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Repositorio de recetas del autor: https://github.com/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED
- `mlx-vlm`: https://github.com/Blaizzy/mlx-vlm
- Contenedor de servicio (Spark/GB10): ghcr.io/aeon-7/aeon-vllm-ultimate:latest
- Contenedor de servicio (RTX): ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest
