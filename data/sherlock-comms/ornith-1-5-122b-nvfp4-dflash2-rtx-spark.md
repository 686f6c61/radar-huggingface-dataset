# Sherlock-Comms/Ornith-1.5-122B-NVFP4-DFlash2-RTX-Spark

## Resumen

Este repositorio es un checkpoint cuantizado en NVFP4 de Ornith 1.5 122B, el modelo multimodal de mezcla de expertos de ornith-ai, republicado por el usuario independiente Sherlock-Comms (que declara no estar afiliado ni a Ornith AI ni a Inco AI). El único cambio respecto al checkpoint oficial `ornith-ai/Ornith-1.5-122B-NVFP4` es que la capa `lm_head` se almacena en BF16 en lugar de NVFP4. El resto de tensores es idéntico.

El problema que resuelve es muy concreto: vLLM 0.32.0 solo carga el modelo borrador de decodificación especulativa `incoai/Ornith-1.5-122B-DFlash2` si el `lm_head` del modelo objetivo está sin cuantizar. Como el checkpoint oficial lo cuantiza, vLLM rechaza el borrador; este repositorio lo desbloquea y permite usar DFlash2 con 7 tokens especulativos, de los que se aceptan unos 3 por paso.

Con 63.972.847.344 parámetros según safetensors (el nombre comercial indica 122B, discrepancia que el autor no explica), 262.144 tokens de contexto, licencia MIT y 78,7 GB de pesos, está pensado para equipos con memoria gráfica unificada de 96 GB, como los portátiles RTX Spark N1X. En esa plataforma el autor mide unos 50 tok/s de decodificación, frente a 36,6 tok/s de la alternativa Q4_K_M GGUF con MTP en llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) de la familia Qwen3.5 (etiqueta `qwen3_5_moe`); número de capas y expertos no disponible |
| Parámetros totales | 63.972.847.344 (~64B) según safetensors; el nombre del repositorio indica 122B (discrepancia no explicada por el autor) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado con `--max-model-len 262144`) |
| Tipos de cuantización | Expertos en NVFP4 W4A16 con escalas FP8 por bloque de 16 valores y escala global FP32 (formato ModelOpt); `lm_head` en BF16; KV cache FP8 opcional (12 GiB para una petición de 262.144 tokens) |
| Idiomas soportados | no disponible (la model card no los documenta) |
| Licencia | MIT |
| Formato de pesos | safetensors, 8 shards (78,7 GB; shards 1–7 idénticos al checkpoint oficial, shard 8 con `lm_head` sustituido) |
| Vocabulario | 248.320 tokens (dimensión de `lm_head`: [248320, 3072]) |
| Dimensión oculta | 3.072 (derivada de la forma de `lm_head`) |
| Pipeline declarado | `image-text-to-text` |
| Librería | vLLM (probado con 0.32.0) |
| Modelo base | `ornith-ai/Ornith-1.5-122B-NVFP4`, `ornith-ai/Ornith-1.5-122B` |
| Modelo borrador compatible | `incoai/Ornith-1.5-122B-DFlash2` (decodificación especulativa DFlash2) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) etiquetada como `qwen3_5_moe`, con capacidades multimodales de imagen y texto (codificador de visión propio, invocado con backend `TORCH_SDPA` en la configuración de referencia). El repositorio no documenta el número de expertos, el reparto de parámetros activos por token, ni la dimensión de las capas internas más allá de los 3.072 de entrada de `lm_head` y las 248.320 entradas de vocabulario.

No hay información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni las fases de alineación (RLHF, DPO u otras). La innovación técnica relevante no está en el modelo base sino en el empaquetado: se desempaqueta cada valor FP4 (E2M1), se aplica la escala FP8 por grupo de 16 valores y la escala global, y se reescribe en BF16 mediante el script `convert_lmhead_bf16.py` incluido en el repo. El resultado se valida comparando filas muestreadas con el `lm_head` BF16 original de `ornith-ai/Ornith-1.5-122B` (coseno 0,995; el 9,6 % de error relativo corresponde a la cuantización NVFP4 ya presente en el checkpoint oficial). Sobre esa base se activa decodificación especulativa DFlash2 con 7 tokens de borrador por paso.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento explícito compatible con el parser `qwen3` de vLLM.
- Generación de código y uso del parser de tool calling `qwen3_coder`.
- Tool calling / function calling nativo, activable con `--enable-auto-tool-choice`; en la batería del autor, 53 de 54 ejecuciones correctas y ninguna llamada inválida.
- Flujos de agente con selección automática de herramientas y varios pasos de razonamiento.
- Comprensión de imágenes (image-text-to-text): lectura de gráficos e infografías; limitado a 1 imagen por prompt y con vídeo deshabilitado (`--limit-mm-per-prompt '{"image":1,"video":0}'`).
- Contexto largo real de 262.144 tokens, con recuperación correcta en pruebas needle-in-a-haystack a 33K, 136K y 256K tokens.
- Decodificación especulativa con el borrador DFlash2 (7 tokens propuestos, ~3 aceptados por paso).
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Agente de código en estación de trabajo local: con tool calling nativo y 262.144 tokens de contexto puede cargar un repositorio mediano completo y encadenar lecturas de ficheros, parches y ejecución de tests sin salir de la máquina, a ~50 tok/s de decodificación.
- Análisis de documentación extensa y contractual: el modelo recupera información en ventanas de hasta 256K (needle-in-a-haystack correcto en los tres tamaños probados) con un prefilling de 761 tok/s a 256K, adecuado para resumir expedientes completos en una sola petición.
- Extracción de datos de gráficos e informes escaneados: el codificador de visión resuelve la lectura de un gráfico en 1,1 s en el hardware de referencia, útil en pipelines de digitalización de informes financieros o técnicos.
- Automatización de back-office con function calling: con 53/54 llamadas válidas, sirve para orquestar APIs internas (ERP, ticketing, bases de datos) donde se exige que el modelo emita JSON de herramienta bien formado.
- Asistente privado sin conexión: al ser pesos MIT ejecutables en local sobre 96 GB de memoria gráfica unificada, encaja en entornos con requisitos de confidencialidad donde no se puede enviar el prompt a un proveedor externo.
- Razonamiento asistido en investigación: el modo de razonamiento (`--reasoning-parser qwen3`) permite separar cadena de pensamiento y respuesta final, útil para auditar cómo llega el modelo a una conclusión técnica.
- Banco de pruebas de decodificación especulativa: el repositorio existe precisamente para habilitar DFlash2 en vLLM, por lo que sirve para medir tasas de aceptación y comparar 4 frente a 7 tokens de borrador (47 frente a ~50 tok/s según el autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos son mediciones del autor en un ASUS ProArt P16 con RTX Spark N1X (GPU de 6.144 núcleos), 128 GB de memoria con 96 GB asignados a la GPU, Windows 11 on Arm, driver 617.42 y vLLM 0.32.0 en Docker sobre WSL 2:

| Métrica | Este checkpoint + DFlash2 (7 tokens), vLLM | Q4_K_M GGUF + MTP (1 token), llama.cpp |
|---|---|---|
| Decodificación | ~50 tok/s (46–54 entre ejecuciones; 23–93 según prompt) | 36,6 tok/s |
| Prefilling a 33K tokens | 2.323 tok/s | 609 tok/s |
| Prefilling a 136K tokens | 1.209 tok/s | 504 tok/s |
| Prefilling a 256K tokens | 761 tok/s | 434 tok/s |
| Needle-in-a-haystack (33K/136K/256K) | encontrado en los tres | encontrado en los tres |
| Tool calling (54 ejecuciones) | 53/54, sin llamadas inválidas | 54/54 |
| Visión (lectura de gráfico) | correcta, 1,1 s | correcta, 1,6 s |
| Memoria de GPU | ~94 GB, pico de ~97 GB en el arranque | ~84 GB |

Con 7 tokens de borrador se obtienen ~50 tok/s y con 4 unos 47 tok/s; se aceptan aproximadamente 3 de cada 7 tokens propuestos. Son mediciones de un solo equipo y un solo prompt set, no comparables con evaluaciones estandarizadas.

## Requisitos de hardware

- VRAM estimada: ~94 GB en uso estable y ~97 GB de pico en el arranque, incluyendo 12 GiB de KV cache FP8 para soportar peticiones de 262.144 tokens.
- El autor exige configurar 96 GB de memoria gráfica en un equipo de 128 GB; con 64 GB de memoria total el modelo no arranca.
- GPU discretas: hacen falta al menos 96 GB de memoria. Quedan dentro H200 (141 GB) y B200 (192 GB); una A100 u H100 de 80 GB está por debajo de lo observado y no ha sido verificada por el autor.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 32 GB. Solo es viable en plataformas de memoria unificada tipo RTX Spark N1X con 96 GB reservados a la GPU.
- Despliegue: vLLM 0.32.0 o superior con `--trust-remote-code`, decodificación especulativa DFlash2 y kernel Marlin para W4A16 NVFP4 (no hay ruta FP4 nativa para este checkpoint). Requiere desactivar prefix caching y no admite `--async-scheduling`.
- El codificador de visión debe usar `TORCH_SDPA`, porque flash-attn no tiene build para sm_121.
- llama.cpp y sus formatos GGUF no aplican a este repositorio (el autor solo los usa como referencia con un Q4_K_M distinto). Soporte en TGI u Ollama: no disponible.
- Latencia y throughput: ~50 tok/s de decodificación con `--max-num-seqs 1` (una sola secuencia concurrente); prefilling de 2.323 / 1.209 / 761 tok/s a 33K / 136K / 256K. El rendimiento agregado con varias peticiones simultáneas no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (Ornith 1.5 122B NVFP4 + `lm_head` BF16) | 63.972.847.344 según safetensors; nombre comercial 122B | 262.144 | NVFP4 W4A16 + `lm_head` BF16 | ~50 tok/s decode; prefill 2.323/1.209/761 tok/s; 53/54 tool calling | MIT | HuggingFace, 0 descargas, 1 like |
| `ornith-ai/Ornith-1.5-122B-NVFP4` (oficial) | no disponible en la información | 262.144 (heredado) | NVFP4 con `lm_head` cuantizado, 77,6 GB | no disponible; no admite DFlash2 en vLLM por el `lm_head` cuantizado | MIT | HuggingFace |
| `ornith-ai/Ornith-1.5-122B` (BF16) | no disponible | no disponible | BF16 sin cuantizar | no disponible | MIT | HuggingFace |
| Q4_K_M GGUF + MTP en llama.cpp (variante distinta, usada como referencia por el autor) | no disponible | no disponible | Q4_K_M GGUF | 36,6 tok/s decode; prefill 609/504/434 tok/s; 54/54 tool calling; ~84 GB | MIT (derivada del modelo base) | GGUF |

No se dispone de datos de benchmarks estándar ni de otros modelos de la misma categoría (MoE multimodal de ~64B-122B con NVFP4) en la información proporcionada, por lo que la comparación se limita a variantes del mismo modelo y a la referencia GGUF del autor. El modelo borrador `incoai/Ornith-1.5-122B-DFlash2` no es una alternativa, sino un componente auxiliar.

## Limitaciones y advertencias

- No hay benchmarks estándar publicados: el rendimiento solo está medido en un portátil RTX Spark N1X, con un único conjunto de pruebas y por el propio autor del repositorio.
- Discrepancia de tamaño: el nombre indica 122B pero safetensors declara 63.972.847.344 parámetros; conviene verificar el dato antes de dimensionar infraestructura.
- El `lm_head` en BF16 arrastra el 9,6 % de error relativo de la cuantización NVFP4 del checkpoint oficial (coseno 0,995 frente al BF16 original). No es un modelo sin pérdida respecto a la versión BF16.
- Repositorio de la comunidad: 0 descargas y 1 like en el momento de la consulta, creado y actualizado el mismo día. El autor declara no estar afiliado a Ornith AI ni a Inco AI, por lo que no hay garantía de mantenimiento.
- Requiere vLLM 0.32.0 y `--trust-remote-code`; la caché de prefijos debe desactivarse por bugs reportados con esta arquitectura y la decodificación especulativa, y `--async-scheduling` no funciona con DFlash.
- Solo una secuencia concurrente en la configuración probada (`--max-num-seqs 1`): no es adecuado para servir a muchos usuarios simultáneos sin rediseñar el desplieg
