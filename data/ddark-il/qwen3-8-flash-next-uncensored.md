# ddark-il/Qwen3.8-Flash-Next-Uncensored

## Resumen

Qwen3.8-Flash-Next-Uncensored es una cuantización mixta de precisión del checkpoint `orcarouter/Qwen3.8-Flash-Next-Uncensored`, publicada por el usuario ddark-il bajo licencia Apache 2.0. Se trata de un modelo de arquitectura MoE (`qwen4_exp`) con 180.000 millones de parámetros totales, adaptado específicamente para ejecutarse en Apple Silicon mediante la librería MLX. La versión publicada, etiquetada como v2.2, ocupa 134,30 GB en disco con una media de 5,969 bits por peso (bpw), lo que supone una reducción de 2,68 veces respecto al checkpoint original en bf16 (360 GB).

El modelo resuelve el problema de desplegar un MoE de 180B en hardware de consumo de gama alta, concretamente en un Apple M5 Max con 128 GB de memoria unificada, manteniendo una ventana de contexto de hasta 262.144 tokens. Incorpora además una torre de visión (pipeline `image-text-to-text`) y una cabeza MTP (multi-token prediction) en un fichero sidecar separado.

La relevancia actual del artefacto reside en su estrategia de cuantización: redondeo oQe guiado por una matriz de importancia acumulada sobre 65.536 tokens de calibración, una tabla PLE de n-gramas a 8 bits (51.200 millones de parámetros) y conformidad con la rejilla INT8-prefill (A8) del runtime, que acelera el prefill un 8 % según las mediciones del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen4_exp`) con torre de visión y cabeza MTP |
| Parámetros totales | 179.999.981.459 (180,0B) |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (262k) |
| Tipos de cuantización | Affine mixta: 4 u 8 bits, group size 64; tabla PLE 8/32; módulos exactos en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 131 shards + sidecar MTP), cuantización empaquetada U32 con scales/biases bf16 |

## Arquitectura y entrenamiento

El modelo base es un MoE de tipo `qwen4_exp` con 180B parámetros totales, torre de visión integrada en los shards principales y una cabeza de predicción multi-token (MTP) almacenada aparte en `model-mtp.safetensors`. Los expertos enrutados se almacenan apilados como `switch_mlp.{gate,up,down}_proj` (441 tensores apilados procedentes de 294 tensores fusionados del formato fuente), lo que permite la carga directa mediante la ruta `qwen4_exp` del runtime y mediante `split_expert_projection` de `mlx-vlm` sin parches. El artefacto contiene 3.781 tensores: 133,77 GB cuantizados y 0,54 GB en bf16 exacto.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni sobre si hubo RLHF o DPO. La información disponible se centra en el proceso de cuantización: la versión v2.2 emplea redondeo oQe, donde los rangos `(scale, bias)` de cada grupo se eligen contra un objetivo ponderado por importancia, calculado sobre 65.536 tokens de calibración (128 secuencias de 512) del corpus RAG `dsh_verify`, y se reajustan por mínimos cuadrados ponderados. La tabla PLE de n-gramas pasa de 4/32 a 8/32 (de 32,0 a 57,6 GB), con un error rel-L2 que baja de 0,07335 a 0,00484 (−93,4 %), y se mantiene en `mmap` para no consumir memoria residente. Toda la rejilla de cuantización se alinea con la ruta INT8-prefill (A8) del runtime.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262k tokens.
- Procesamiento de imagen y texto (`image-text-to-text`): la torre de visión está incluida en los shards principales.
- Predicción multi-token (MTP) mediante cabeza dedicada, orientada a decodificación especulativa.
- Razonamiento y generación de código: capacidades heredadas del modelo base, no verificadas de forma independiente en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara lista de idiomas.
- Modo "uncensored": el nombre del checkpoint sugiere un ajuste con filtros de seguridad reducidos, aunque no se documenta el método.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo cabe residente en 76,70 GB (tabla PLE en `mmap`) sobre un M5 Max de 128 GB, lo que permite mantener conversaciones multi-turno con contexto largo sin conexión a servicios externos.
- Análisis de documentos extensos con RAG: la ventana de 262k tokens permite ingerir corpus completos; el autor calibró la cuantización precisamente sobre un corpus RAG (`dsh_verify`), lo que reduce el error en ese régimen.
- Procesamiento de imagen y texto en local: al incluir torre de visión, puede emplearse para descripción de imágenes, extracción de información de capturas o documentos escaneados dentro de un flujo MLX.
- Generación asistida con decodificación especulativa: la cabeza MTP en sidecar permite implementar decodificación especulativa para acelerar la generación en el runtime MLX.
- Investigación sobre cuantización: el artefacto documenta métricas por familia (rel-L2 de expertos, `lm_head`, tabla PLE) y sirve como referencia reproducible para estudiar el compromiso entre bpw y calidad.
- Prototipado de pipelines multimodales sin GPU dedicada: permite validar flujos `image-text-to-text` en un portátil de gama alta antes de migrar a infraestructura con A100/H100.
- Evaluación comparativa de recetas de cuantización: la comparación A/B contra v2 (16/21 idénticos, acuerdo de prefijo 0,9902) facilita estudios de degradación por cuantización.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas internas de cuantización y de velocidad del runtime, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K no aparecen).

| Métrica | v2 | v2.2 (este modelo) |
|---|---|---|
| Artefacto | 109,29 GB · 4,857 bpw | 134,30 GB · 5,969 bpw |
| Módulos cuantizados / exactos | 743 / 761 | 1037 / 466 |
| Memoria residente (PLE en `mmap`) | 76,9 GB | 76,70 GB |
| Tabla n-gramas rel-L2 | 0,07335 (4/32) | 0,00484 (8/32, −93,4 %) |
| Expertos enrutados rel-L2 | 0,08538 (plain, barrido completo) | 0,09130 plain / 0,07662 weighted |
| Densa rel-L2 (`lm_head`, 8/64) | — | 0,00600 |
| Oracle L2, presupuesto 96 tokens | 70,77 / 100, 15/20 | 72,27 / 100, 16/20 |
| Acuerdo top-1 con oráculo bf16 | 90,7 % | 86,2 % |
| A/B contra v2 | — | 16/21 idénticos, prefijo 0,9902, top-1 medio 0,8868, JSD medio 0,05355 |
| Prefill INT8 (4.096 tokens) | fuera de la rejilla A8 | 1,08× (987 → 1.066 tok/s) |

El autor advierte que la fila de expertos no es una comparación homogénea: v2 mide un barrido completo de 1.707 tensores y v2.2 una porción de 2 millones de elementos, y la puerta de aceptación es la métrica ponderada por importancia.

## Requisitos de hardware

- VRAM/memoria unificada: 76,70 GB residentes con la tabla PLE en `mmap`; 134,30 GB de artefacto en disco.
- Hardware objetivo declarado: Apple M5 Max con 128 GB de memoria unificada, con contexto de hasta 262k.
- GPU NVIDIA: no se documenta soporte; el artefacto es MLX y depende de kernels Metal (dequantize para group size 32 a 8 bits en filas de 160).
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en configuraciones por debajo de ~80 GB de memoria.
- Despliegue: librería MLX y `mlx-vlm`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: prefill de 4.096 tokens a 1.066 tok/s con INT8-prefill (987 tok/s sin él); TTFT en prompts de ~2.560 tokens de 2,25 s frente a 2,42 s (mediana), aproximadamente +7 %.
- Coste de decodificación: las promociones y reagrupaciones añaden 0,004 GB por paso de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored (v2.2, este) | 180,0B MoE | 262k | 5,969 bpw, MLX affine | Apache 2.0 | Hugging Face, MLX |
| Qwen3.8-Flash-Next-Uncensored v2 | 180,0B MoE | no disponible | 4,857 bpw, MLX affine | Apache 2.0 | Hugging Face, MLX |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (bf16) | 180,0B MoE | no disponible | bf16 (360 GB) | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: el acuerdo top-1 con el oráculo bf16 baja al 86,2 % (frente al 90,7 % de v2) y el error rel-L2 de expertos es de 0,09130 en la métrica plana.
- El error de expertos de v2.2 se midió sobre una porción de 2 millones de elementos, no sobre el barrido completo; la comparación con v2 no es estrictamente homogénea.
- Dependencia estricta del runtime MLX y de kernels Metal concretos: la tabla PLE a 8/32 es el techo porque no existen kernels para otras combinaciones de group size.
- Requiere hardware Apple Silicon de gama alta; no es desplegable en GPU NVIDIA ni en equipos con menos de ~80 GB de memoria.
- El etiquetado "uncensored" implica un ajuste con filtros de seguridad reducidos; no se documenta el método ni los riesgos asociados, lo que desaconseja su uso en producción orientada a usuarios finales sin capas adicionales de moderación.
- No se declara lista de idiomas soportados; el rendimiento multilingüe es desconocido.
- No hay benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K) publicados, por lo que la calidad en tareas concretas no está verificada de forma independiente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y su procedencia (`orcarouter`) deberían verificarse por separado antes de un despliegue en producción.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas de fidelidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ddark-il/Qwen3.8-Flash-Next-Uncensored
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Librería MLX: https://github.com/ml-explore/mlx
- `mlx-vlm`: https://github.com/Blaizzy/mlx-vlm
