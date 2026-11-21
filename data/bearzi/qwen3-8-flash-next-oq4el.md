# bearzi/Qwen3.8-Flash-Next-oQ4eL

## Resumen

Qwen3.8-Flash-Next-oQ4eL es una cuantización experimental del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario bearzi (yohann-bearzi) el 20 de noviembre de 2026. No es un modelo entrenado desde cero, sino un checkpoint de pesos cuantizados en formato oQeL (revision 1), un layout de cuantización propio del ecosistema oMLX que aplica 4 bits a las matrices de expertos enrutados (routed experts) de la arquitectura MoE y 8 bits afines al resto del modelo. El checkpoint tiene 79.904.882.579 parámetros totales y ocupa 178,3 GB en disco, en su mayor parte por la tabla de embeddings por capa (PLE) mantenida en BF16 (~95 GB).

El interés técnico del artefacto es doble. Por un lado, demuestra un mecanismo de plugins de formato de cuantización para oMLX: el checkpoint solo carga con una bifurcación no fusionada del runtime (rama `quant-plugins-poc`) y el plugin `omlx-oqel` 0.1.0. Por otro, publica métricas comparativas frente a la cuantización estándar oQ4e del mismo fork, mostrando mejoras medibles en divergencia KL y acuerdo top-1 respecto a BF16, a costa de una caída en velocidad de decodificación de entre el 7% y el 15% según configuración de MTP y hardware.

Es, por tanto, un artefacto de investigación y prueba de concepto, no un modelo listo para producción. La propia model card advierte que el layout oQeL y los kernels del plugin pueden cambiar, que una versión posterior del plugin podría rechazar este checkpoint y que no debe usarse para nada que no se pueda reproducir. Está orientado a Apple Silicon (mlx, mlx-vlm) y requiere hardware de gama alta con memoria unificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer con capa MTP (multi-token prediction) y embeddings por capa (PLE); modelo base Qwen3.8-Flash-Next, multimodal (visión-lenguaje según la model card) |
| Parámetros totales | 79.904.882.579 (~79,9 mil millones) |
| Parámetros activos | no disponible (la model card no detalla el reparto de expertos activos; menciona 48 capas MoE y 147 matrices de expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit oQeL en expertos enrutados; 8-bit affine MLX en el resto (grupos de 64 y 128); tabla PLE en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El checkpoint no aporta entrenamiento propio: hereda los pesos de Qwen/Qwen3.8-Flash-Next y solo modifica su representación numérica. La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con 48 capas MoE, 147 matrices de expertos enrutados (gate, up y down), una capa MTP (multi-token prediction) para decodificación especulativa y una tabla de embeddings por capa (PLE) que se conserva en BF16. El modelo base es multimodal (visión-lenguaje), ya que la model card indica que se carga mediante mlx-vlm con `for_vlm=True`.

La innovación del checkpoint es el layout oQeL (revision 1): cada matriz de expertos enrutados se guarda en una tabla de 16 niveles ajustada a los expertos de este modelo concreto, en grupos de 16 pesos con un byte de escala E2M5 por grupo y una escala bfloat16 por fila. El proceso de cuantización es oQ en modo oQe, donde el error de cada peso se pondera por la importancia de su entrada, medida sobre texto de calibración. El resto de tensores (598 clases en grupos de 64 y 147 proyecciones de expertos compartidos en grupos de 128) usa cuantización affine MLX de 8 bits, idéntica a la build oQ4e estándar. El `group_size: 64` que figura en `config.json` para las matrices de expertos es la receta nominal de oQ y no lo lee el layout oQeL.

No se dispone de información sobre el volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next.
- Procesamiento multimodal de visión e imagen, dado que la model card lo describe como vision-language model y lo carga con mlx-vlm.
- Decodificación especulativa mediante la capa MTP, con aceptación medida de 1,45 (M3 Ultra) y 1,30 (M5 Max) borradores aceptados por ciclo de verificación.
- Inferencia en Apple Silicon mediante MLX y oMLX, con servidor compatible con la API de OpenAI (`omlx serve`).
- Ejecución con múltiples streams concurrentes (medido con 1, 2 y 4 streams).
- Tool calling, function calling, capacidades de agente, multilingüismo y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre formatos de cuantización: el checkpoint sirve para reproducir y auditar el layout oQeL frente a oQ4e, comparando KL, acuerdo top-1 y perplejidad sobre documentos de código y prosa. Es su uso principal y el único plenamente alineado con la naturaleza experimental del artefacto.
- Desarrollo de plugins para oMLX: permite validar la interfaz de plugins de formato de cuantización (rama `quant-plugins-poc` y `omlx-oqel`) en un caso real con 147 matrices de expertos, antes de que la interfaz se estabilice.
- Evaluación de decodificación especulativa MTP: al incluir la capa MTP y publicar tasas de aceptación por hardware, se presta a comparar modos MTP on/off/adaptive en M3 Ultra y M5 Max con prompts de 2.048 y 8.192 tokens.
- Pruebas de despliegue local en Apple Silicon de gama alta: con `qwen4_ple_ssd_offload` y MTP activado, el modelo cabe en un Mac de 128 GB usando entre 71 y 74 GB de memoria, lo que permite experimentar con un MoE de ~80 mil millones de parámetros en hardware de escritorio.
- Benchmarking de latencia y throughput: el servidor oMLX permite medir tok/s en prefill y decode con 1, 2 y 4 streams concurrentes, útil para caracterizar el rendimiento de MLX en cargas MoE cuantizadas.
- Reproducción de métricas de fidelidad de cuantización: los métodos descritos (KL de vocabulario completo con 248.320 tokens, perplejidad sobre dos documentos de 16.384 tokens) permiten replicar el protocolo de evaluación en otros checkpoints del mismo fork.

## Benchmarks y rendimiento

La model card publica métricas comparativas entre oQ4eL y oQ4e, ambos derivados del mismo fork, fuente, calibración y plan de bits; solo difiere el formato de los expertos enrutados.

| Métrica | oQ4eL | oQ4e |
|---|---|---|
| KL a BF16, código / prosa | 0,01580 / 0,02866 | 0,02131 / 0,03737 |
| KL p99, código / prosa | 0,185 / 0,226 | 0,274 / 0,292 |
| Acuerdo top-1 con BF16, código / prosa | 96,06% / 92,28% | 95,43% / 91,41% |
| Perplejidad, código / prosa (BF16: 2,1480 / 7,9083) | 2,1482 / 7,9028 | 2,1485 / 7,8900 |
| Borradores MTP aceptados por ciclo, M3 Ultra / M5 Max | 1,45 / 1,30 | 1,50 / 1,50 |
| Decode tok/s, 1 stream, MTP off, M3 Ultra / M5 Max | 65,35 / 67,18 | 75,86 / 72,75 |
| Decode tok/s, 1 stream, MTP adaptive, M3 Ultra / M5 Max | 85,41 / 88,05 | 99,36 / 90,52 |
| Decode tok/s, 2 / 4 streams, MTP off, M3 Ultra | 53,01 / 39,64 | 60,53 / 43,45 |
| Decode tok/s, 2 / 4 streams, MTP off, M5 Max | 53,40 / 39,10 | 57,45 / 40,57 |
| Prefill tok/s 2k / 8k, M3 Ultra | 1.253 / 1.384 | 1.261 / 1.390 |
| Prefill tok/s 2k / 8k, M5 Max | 2.096 / 2.685 | 2.120 / 2.711 |

No se publican resultados de benchmarks de calidad de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria: el checkpoint ocupa 178,3 GB (166,0 GiB) en disco. Con `qwen4_ple_ssd_offload` activado, el modelo usó entre 71 y 74 GB de memoria en un Mac Studio M5 Max de 128 GB. Sin esa opción, la tabla PLE (~95 GB) debe residir en memoria y un Mac de 128 GB se queda sin memoria.
- Almacenamiento: se requieren unos 180 GB libres de disco para la descarga, según las instrucciones del autor.
- GPU/hardware recomendado: Apple Silicon con memoria unificada. Las mediciones se hicieron en Mac Studio M3 Ultra (512 GB) y Mac Studio M5 Max (128 GB). No hay datos para GPU NVIDIA (A100, H100, RTX 4090) ni para otras plataformas.
- Viabilidad en GPU de consumo: no disponible. El artefacto está empaquetado para mlx y no se documenta carga en CUDA.
- Despliegue: oMLX con la rama `quant-plugins-poc` y el plugin `omlx-oqel` 0.1.0. El servidor es compatible con la API de OpenAI en el puerto 8000. Stock oMLX, mlx-lm y mlx-vlm no pueden cargarlo; sin el plugin, la carga falla con `no quant format is registered for mode 'oqel'`.
- Entorno de software: Python 3.11 a 3.13, git, venv dedicado. La carga desde Python requiere `maybe_apply_pre_load_patches` con `for_vlm=True` y `lazy=True`.
- Latencia y throughput: ver tabla de benchmarks. Prefill de 2.096 a 2.685 tok/s en M5 Max y de 1.253 a 1.384 tok/s en M3 Ultra; decode de 65 a 88 tok/s por stream según MTP y máquina.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bearzi/Qwen3.8-Flash-Next-oQ4eL | ~79,9 mil millones | no disponible | 4-bit oQeL en expertos, 8-bit affine en resto | qwen-community-1.0 | Hugging Face, requiere fork de oMLX y plugin |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | no disponible | no disponible | oQ4e (PLE más pequeño) | no disponible en la información | Hugging Face, 107,7 GB |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | BF16 | qwen-community-1.0 | Hugging Face |

La comparación relevante es frente a la build oQ4e del mismo fork y al modelo base BF16. oQ4eL mejora la fidelidad (KL y acuerdo top-1) pero decodifica entre un 7% y un 15% más despacio según configuración, y ocupa 178,3 GB frente a los 107,7 GB de la build de Jundot, que guarda la tabla PLE en un formato más compacto.

## Limitaciones y advertencias

- Experimental y frágil: requiere una bifurcación no fusionada de oMLX y el plugin `omlx-oqel` 0.1.0. El layout oQeL (revision 1) y los kernels pueden cambiar, y una versión posterior del plugin podría rechazar este checkpoint, obligando a recuantizarlo.
- No usar en producción: la model card indica explícitamente que no debe emplearse para nada que no se pueda reproducir. La release se marcó como "in progress" el mismo día de publicación, con correcciones de velocidad de decodificación pendientes.
- Rendimiento inferior a oQ4e: la decodificación es más lenta en todas las configuraciones medidas (por ejemplo, 85,41 frente a 99,36 tok/s con MTP adaptive en M3 Ultra).
- Requisitos de memoria severos: sin offload de la tabla PLE a SSD, un Mac de 128 GB no puede cargar el modelo. La tabla PLE en BF16 representa unos 95 GB del total.
- Plataforma restringida: solo Apple Silicon con MLX. No hay soporte documentado para CUDA, vLLM, llama.cpp, Ollama ni TGI.
- Idiomas, contexto y sesgos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; la perplejidad publicada (2,1482 en código y 7,9028 en prosa) es prácticamente idéntica a BF16, pero no se han publicado evaluaciones de calidad de tarea.
- Licencia: qwen-community-1.0, etiquetada como `other`. Las condiciones de uso comercial deben consultarse en el enlace de licencia del modelo base; no se detallan en la información disponible.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado.

## Enlaces

- Hugging Face: https://huggingface.co/bearzi/Qwen3.8-Flash-Next-oQ4eL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Fork de oMLX (rama `quant-plugins-poc`): https://github.com/yohann-bearzi/omlx/tree/quant-plugins-poc
- Plugin omlx-oqel: https://github.com/yohann-bearzi/omlx-oqel
- Build oQ4e de referencia (Jundot): https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
