# lflare/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated

## Resumen

`lflare/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated` es un derivado de Qwen3.8-Flash-Next (Qwen) que combina tres transformaciones en cadena: cuantización mixta NVFP4/MXFP8 con escalas comprimidas en formato CSF (realizada por Local Inference Lab), una edición de dirección de rechazo («abliteración») aplicada en sitio sobre la rejilla cuantizada (realizada por el autor del repo) y un contenedor que preserva nombres, dtypes y formas de todos los tensores. El resultado es un modelo multimodal image-text-to-text de 96.637.001.693 parámetros con arquitectura MoE y pesos de 4 y 8 bits, pensado para servir en una sola GPU Blackwell.

La relevancia técnica del repo no está en el modelo base sino en el método: la revisión `v2` (la rama `main`) sustituye la edición de rango 1 de `v1` por una proyección de rango 2 en la capa 42, porque las direcciones de rechazo con *thinking* activado y desactivado son casi ortogonales (67,4–76,7° de separación, 21,1× el ruido de captura). Una edición de rango 1 dejaba intacto el 96 % del otro régimen, de modo que `v1` alcanzaba 0 % de rechazos con *thinking* off pero seguía rechazando un 14,0 % con *thinking* on. `v2` elimina el span de ambas direcciones y llega a 0 % en los dos regímenes.

El coste de esa segunda restricción se paga en error de pesos (5,618 % de ‖W‖ frente a 3,788 % en v1), no en eliminación del subespacio: el peor tensor cuantizado conserva solo un 4,6e-05 del subespacio ablacionado. Las mediciones publicadas indican que la capacidad se mantiene dentro del ruido estadístico respecto al padre (GPQA-diamond 166/198 frente a 164/198, McNemar p = 0,8506).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (capas de atención completa y de atención lineal), expertos compartidos y cabezas MTP; incluye torre de visión (tensores de visión preservados sin editar) |
| Parametros totales | 96.637.001.693 |
| Parametros activos | no disponible (la model card no publica el recuento de expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 de 4 bits con escalas de bloque FP8 cada 16 elementos y escala global FP32) y MXFP8 (E4M3 de 8 bits con escalas de bloque potencia de dos cada 32 elementos); tensores residuales en BF16; escalas de los expertos enrutados codificadas en CSF |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other` en HuggingFace) |
| Formato de pesos | safetensors (contenedor NVIDIA ModelOpt de precisión mixta con codificación CSF de escalas) |
| Tamano del repositorio | 278,1 GB (incluye artefactos de medición y la revisión `v1` etiquetada) |
| Revisiones | `main` = v2 (rango 2, capa 42); tag `v1` (rango 1, capa 46) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La model card no documenta el preentrenamiento del modelo base, solo su procedencia: `Qwen/Qwen3.8-Flash-Next` en el commit `de4b8e4d43b917e7706784d8bb445c9af86a3540`, cuantizado por Local Inference Lab como `local-inference-lab/Qwen3.8-Flash-Next-NVFP4` (commit `6909a5bed089a48fa07e956d3915af2537de9368`). Por los nombres de módulo se deduce una arquitectura MoE con expertos enrutados (`.mlp.experts.E.down_proj`) y expertos compartidos (`.mlp.shared_expert`), atención híbrida —36 tensores `linear_attn.out_proj` frente a 12 `self_attn.o_proj`, lo que sugiere 48 capas con 12 de atención completa y 36 de atención lineal— y decodificación especulativa interna vía MTP (`mtp.layers.0`). También aparecen tablas PLE (`layers.1.ple.value_proj`) con normalización entrenada en FP32. El recuento de 24.576 tensores NVFP4 de expertos sobre 48 capas implicaría 512 expertos enrutados por capa, dato que la card no confirma.

La intervención propia es una abliteración **in place sobre la rejilla cuantizada**, sin desquantizar ni recuantizar: una proyección de rango 2 con `alpha = 1.0` que elimina el span de dos direcciones de rechazo capturadas en la capa 42, cada una biproyectada contra su propia media de prompts inofensivos (cos = 0,3495, 69,5° tras biproyección). Se editaron 25.188 tensores: 24.576 NVFP4 en `experts.E.down_proj`, 512 NVFP4 en `mtp.layers.0`, 48 MXFP8 en `shared_expert.down_proj`, 36 MXFP8 en `linear_attn.out_proj`, 12 MXFP8 en `self_attn.o_proj` y 4 BF16 (`embed_tokens`, `layers.1.ple.value_proj` y dos de MTP). No se tocó ninguna escala, ni routers, ni `gate_proj`/`up_proj`, ni `q/k/v_proj`, ni tensores de visión, ni `lm_head`. Como un valor ya situado exactamente en la rejilla de cuantización pierde la edición con un redondeo simple, se aplica un recuantizador restringido que busca códigos con presupuesto de ±1 ULP; a rango 2 la restricción no puede anularse en una sola fila y se reparte entre muchas, de ahí el aumento de error de pesos (de 3,788 % a 5,618 %, ×1,48) manteniendo la fuga residual en 4,63e-05 (NVFP4), 7,49e-07 (MXFP8) y 2,31e-03 (BF16).

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Entrada de imagen y texto (`image-text-to-text`); los tensores de visión no fueron modificados por la abliteración.
- Razonamiento con modo *thinking* on/off: el modelo expone dos regímenes de prompt y `v2` está ablacionado en ambos.
- Recuperación en contexto largo, validada con el perfil `estonia` de recuperación long-context (30/30).
- Decodificación especulativa mediante MTP interno, con aceptación de borrador del 59,5 % (mediana) sobre 337 muestras, IQR 53,2–64,7 %.
- Razonamiento científico de nivel GPQA-diamond: 166/198 con *thinking* off.
- Política de rechazo reducida de forma deliberada (modelo «uncensored»): 0 % de rechazos declarados en ambos regímenes.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de audio: no documentado.
- Idiomas: no disponible.

## Casos de uso

- **Investigación sobre alineación y edición de direcciones latentes**: el repo es un banco de pruebas reproducible para estudiar cómo se comporta una abliteración de rango 2 sobre pesos ya cuantizados, con fuga residual y error de pesos medidos tensor a tensor y artefactos en `measurements/`.
- **Evaluación de pipelines de cuantización mixta NVFP4/MXFP8**: útil para validar si un contenedor con escalas CSF preserva la fidelidad numérica respecto al build sin comprimir (los autores afirman que los pesos son bit-idénticos al build sin comprimir usado en las mediciones).
- **Despliegue multimodal en una sola GPU Blackwell**: con 96,6 B de parámetros en FP4 y receta vLLM publicada, encaja en un nodo GB200/GB300 para servir imagen-texto con contexto largo sin sharding multi-nodo.
- **Recuperación documental de contexto largo**: el perfil `estonia` (30/30, sin respuestas erróneas ni ejecuciones truncadas) lo respalda para tareas de extracción y QA sobre documentos largos combinados con capturas o escaneos.
- **Generación asistida con decodificación especulativa**: la cabeza MTP con ~59,5 % de aceptación permite servir con *speculative decoding* interno para reducir latencia por token en cargas de una sola secuencia.
- **Investigación sobre robustez de políticas de seguridad**: al ofrecer los dos regímenes de *thinking* con 0 % de rechazos, sirve para medir cómo varía la tasa de cumplimiento según la plantilla de prompt y para construir clasificadores externos de seguridad.
- **Baseline de ablación controlada**: comparar `v1` (rango 1, capa 46) contra `v2` (rango 2, capa 42) sobre el mismo corpus y semilla permite aislar el efecto del rango de la edición frente al de la capa.

## Benchmarks y rendimiento

Datos publicados en la model card. Las dos columnas se midieron en una única sesión, en una sola máquina y con el mismo `gpu-memory-utilization`; el modelo base de comparación es el padre cuantizado.

| Benchmark | Configuracion | Padre | Este modelo |
|---|---|---|---|
| `lavd`, n=30 | thinking off | 30/30 | 30/30 (28 exactos, 2 casi) |
| `estonia` recuperación long-context, n=30 | — | 30/30 | 30/30 |
| GPQA-diamond, n=198 | thinking off | 164/198 | 166/198 (Δ +1,01 pp; McNemar exacto p = 0,8506, no significativo) |
| Aceptación de borrador MTP, mediana | 312 vs 337 muestras | 61,0 % | 59,5 % (IQR 53,2–64,7 %) |

En GPQA, 13 ítems se aciertan solo con el padre y 15 solo con este modelo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multilingües en la información disponible.

## Requisitos de hardware

- **VRAM estimada (estimación a partir del recuento de parámetros, no publicada por el autor)**: pesos en NVFP4 puro ≈ 48,3 GB; el contenedor mezcla NVFP4, MXFP8 y BF16, por lo que el peso real es superior. Hay que sumar caché KV y activaciones; la model card no publica la longitud de contexto, así que el coste de KV no se puede calcular.
- **GPU recomendadas**: la receta de vLLM para Qwen3.8-Flash-Next cubre H200, H100 y GB200; NVIDIA indica que la variante NVFP4 cabe en una GB200 y que el checkpoint FP8 cabe en una GB300 (288 GB HBM3e).
- **GPU de consumo**: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 48 GB con este formato. Haría falta una cuantización adicional de menor bit o descarga por capas con offload a CPU, no incluida en el repo.
- **Opciones de despliegue**: vLLM (receta oficial para la familia), stack NVIDIA ModelOpt / TensorRT-LLM para NVFP4 nativo. Soporte en llama.cpp, Ollama o TGI para NVFP4 con escalas CSF: no disponible en la información consultada.
- **Rendimiento**: una referencia externa (vramcalculator.com, 21-10-2026) cita 117,2 tok/s en flujo único sobre texto en prosa para un build NVFP4-MXFP8-CSF-QAD; no se especifica que sea exactamente este repositorio ni el hardware, por lo que debe tomarse como orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (`lflare/...-CSF-QAD-Abliterated`, v2) | 96,637 B | no disponible | NVFP4 + MXFP8 + BF16, escalas CSF | qwen-community-1.0 | Abliteración rango 2 en capa 42; 0 % de rechazos en ambos regímenes |
| `huginnfork/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated` | no disponible | no disponible | NVFP4 + MXFP8 + CSF | no disponible | Model card de contenido idéntico; aloja `measurements/direction_v4.npz` |
| `huginnfork/Qwen3.8-Flash-Next-FLARE-Abliterated` | no disponible | no disponible | no disponible | no disponible | Dirección de rechazo de rango 1 biproyectada en la capa 46 (equivalente a `v1`) |
| `edp1096/Huihui-Qwen3.8-Flash-Next-abliterated-NVFP4-QAD` | no disponible | no disponible | NVFP4 (E2M1 + escalas FP8 por 16, escala global FP32) | no disponible | Variante abliterada comunitaria en NVFP4 |
| `local-inference-lab/Qwen3.8-Flash-Next-NVFP4` (padre) | no disponible | no disponible | NVFP4 + MXFP8, escalas CSF | no disponible | Sin abliterar; es el baseline de las mediciones de capacidad |
| `Qwen/Qwen3.8-Flash-Next` (base) | no disponible | no disponible | BF16 (presumiblemente) | qwen-community-1.0 | Modelo original sin cuantizar |

## Limitaciones y advertencias

- **Modelo con rechazos reducidos a propósito**: la card avisa explícitamente de que se ha eliminado la dirección de rechazo. No es apto para despliegues orientados al público sin un clasificador de seguridad externo ni para casos de uso con requisitos de moderación.
- **La abliteración degrada los pesos**: el error medio añadido es del 5,618 % de ‖W‖ en los tensores editados, un 48 % más que la edición de rango 1. Aunque las métricas de capacidad no muestran degradación significativa, la fuga residual en BF16 (2,31e-03) es mayor que la de NVFP4 y MXFP8.
- **Alucinación**: no hay datos publicados de tasas de alucinación ni de calibración; el único benchmark de conocimiento es GPQA-diamond, insuficiente para extrapolar robustez factual.
- **Contexto e idiomas sin especificar**: la model card no declara longitud de contexto ni lista de idiomas, pese a existir una validación de recuperación long-context (`estonia`). No se puede planificar capacidad de KV ni cobertura lingüística con la información disponible.
- **Licencia**: qwen-community-1.0 se publica como `license: other`; las condiciones exactas de uso comercial no están recogidas en la información disponible y deben revisarse en el fichero `LICENSE` del repo antes de cualquier despliegue productivo.
- **Procedencia a verificar**: la model card afirma que el repositorio no es un espejo de Local Inference Lab, pero los resultados de búsqueda muestran un repo de `huginnfork` con contenido de card idéntico y con los artefactos de medición (`measurements/direction_v4.npz`). Conviene contrastar la autoría real de los pesos antes de confiar en las métricas.
- **Soporte de tooling limitado**: NVFP4 con escalas CSF no es un formato universal; fuera de vLLM y del stack ModelOpt/TensorRT-LLM el soporte no está documentado.
- **Trazabilidad de la cuantización**: solo se documenta la cadena de commits del padre; no hay detalle del dataset de calibración de la cuantización QAD.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lflare/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated
- Modelo base cuantizado: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repo con card y artefactos de medición equivalentes: https://huggingface.co/huginnfork/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated
- Variante FLARE (rango 1, capa 46): https://huggingface.co/huginnfork/Qwen3.8-Flash-Next-FLARE-Abliterated
- Variante abliterada NVFP4-QAD de edp1096: https://huggingface.co/edp1096/Huihui-Qwen3.8-Flash-Next-abliterated-NVFP4-QAD
- Receta de despliegue vLLM para Qwen3.8-Flash-Next (H200, H100, GB200, GB300): https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Referencia de throughput (orientativa): https://vramcalculator.com/llm-tokens-per-second/
- Checkpoint FP4 de NVIDIA (referencia de la familia): https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
