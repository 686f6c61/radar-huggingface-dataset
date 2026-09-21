# Kaleto/ZGCM-1-7B-NVFP4

## Resumen

ZGCM-1-7B-NVFP4 es una cuantización NVFP4 (pesos en coma flotante de 4 bits, `group_size=16`) del modelo denso zgcagi/ZGCM-1-7B, publicada por el usuario Kaleto. El modelo base, entrenado desde cero para razonamiento matemático y búsqueda agéntica, tiene 32 capas, dimensión oculta 4096, vocabulario de 155.136 tokens y una ventana de contexto de 262.144 tokens, con modos de respuesta directa y de razonamiento explícito (thinking).

La relevancia de esta ficha no está en el modelo base, sino en el artefacto de cuantización: cuando se publicó no existían cuantizaciones oficiales, y este checkpoint se construyó y validó sobre una NVIDIA DGX Spark (GB10), donde decodifica a 34,5 tokens/s frente a los 12,1 tokens/s del BF16 original y los 22,7 tokens/s de FP8 en línea, con un peso en memoria de 5,58 GiB frente a 13,8 GiB. Es, por tanto, un caso de estudio de cuantización W4A16 con el kernel Marlin de vLLM sobre hardware de memoria unificada.

El checkpoint emplea `nvidia-modelopt` 0.43.0, conserva en BF16 la `lm_head`, los embeddings y todas las normalizaciones, y requiere `trust_remote_code` porque la arquitectura `ZgcmForCausalLM` es código personalizado. La calidad solo se ha verificado con pruebas de humo: no hay comparación de exactitud ni de divergencia KL frente a BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `ZgcmForCausalLM` (código personalizado, requiere `trust_remote_code`). Transformer denso con atención híbrida: 27 capas con sliding window de 128 tokens y puerta (`g_proj`) + 5 capas de atención global |
| Parámetros totales | 7,39B declarados en la model card del modelo base; el recuento real de safetensors de este repo es 4.332.990.464 (≈4,33B). La model card indica además ~6,1B parámetros cuantizados. Discrepancia no explicada en la información disponible |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K); el ejemplo de despliegue usa `--max-model-len 262144` |
| Tipos de cuantización | NVFP4 (W4A16: pesos FP4 de 4 bits, activaciones BF16; `group_size=16`) mediante nvidia-modelopt 0.43.0. Variantes comparadas: BF16 original y FP8 en línea |
| Idiomas soportados | en, zh |
| Licencia | MIT (`license_link`: https://huggingface.co/zgcagi/ZGCM-1-7B/blob/main/LICENSE) |
| Formato de pesos | safetensors (checkpoint modelopt, `quant_method: modelopt`, `quant_algo: W4A16_NVFP4`); incluye `configuration_zgcm.py`, `modeling_zgcm.py`, `auto_map`, tokenizer y `chat_template.jinja` copiados del modelo base |
| Capas totales | 32 |
| Dimensión oculta | 4096 |
| Cabezas de atención | 32 de consulta / 8 de clave-valor |
| Vocabulario | 155.136 (embeddings no atados) |
| Capas cuantizadas | 251 lineales: `self_attn.{q,k,v,o}_proj` (32 capas), `self_attn.g_proj` (27 capas con puerta), `mlp.{gate,up,down}_proj` (32 capas) |
| Módulos mantenidos en BF16 | `lm_head` (0,64B parámetros, 1,27 GB), `embed_tokens` y todas las normas, incluidas `q_norm` y `k_norm` |
| Calibración | Ninguna (weight-only, `forward_loop=None`) |
| Tamaño del repo | 6,0 GB (5,58 GiB en vLLM); el BF16 original ocupa 14,8 GB |
| Fecha de conversión | 2026-09-21 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 32 capas con un esquema de atención híbrido poco habitual: 27 de las 32 capas aplican una ventana deslizante de solo 128 tokens y una puerta (`g_proj`), mientras que únicamente 5 capas mantienen atención global sobre todo el contexto. Este diseño reduce drásticamente el coste de la caché KV —en el ejemplo de despliegue, con 32K de longitud máxima, vLLM asignó 15,98 GiB de caché KV equivalentes a 416.117 tokens— pero implica que la mayor parte de la capacidad de recuperación a larga distancia recae en 5 capas. La arquitectura se distribuye como código personalizado (`ZgcmForCausalLM`), y el propio autor señala que vLLM no tiene implementación nativa de ZGCM: el código remoto redirige la atención al propio motor.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base. La model card del modelo base indica que fue entrenado desde cero para razonamiento matemático y búsqueda agéntica, con modos de thinking y de respuesta directa. La innovación técnica documentada aquí corresponde exclusivamente al proceso de cuantización: se aplicó `mtq.quantize` con `NVFP4_DEFAULT_CFG` sobre 251 capas lineales, excluyendo `*lm_head*` y `*embed_tokens*`, con posterior corrección del export de HuggingFace de modelopt 0.43 (inyección de `input_scale = 1.0` en las 251 lineales, activación de `input_activations.dynamic = true`, inclusión de `lm_head` en `quantization_config.ignore` y fijado de `quant_algo` a `W4A16_NVFP4` en `config.json` y `hf_quant_config.json`).

## Capacidades

- Generación de texto conversacional con plantilla de chat en formato GLM-4.5/4.7.
- Razonamiento matemático y resolución de problemas aritméticos en modo thinking.
- Modo de razonamiento explícito (thinking) y modo de respuesta directa.
- Búsqueda agéntica (agentic search) y razonamiento multi-paso, según las etiquetas y la descripción del modelo base.
- Generación y explicación de código (validado en las pruebas de humo con un prompt de Python).
- Tool calling / function calling: el ejemplo de despliegue activa `--enable-auto-tool-choice` con `--tool-call-parser glm47`; el autor indica que las llamadas a herramientas son mucho más fiables con el modo thinking activado.
- Contexto largo de hasta 262.144 tokens, con caché KV comparativamente pequeña gracias a las capas de ventana deslizante.
- Multilingüe limitado a inglés y chino.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Razonamiento matemático asistido: el modelo está entrenado específicamente para matemáticas y expone trazas de pensamiento; resulta adecuado para tutores o asistentes que deban justificar cada paso, con la advertencia de que no se ha validado la exactitud tras la cuantización.
- Búsqueda agéntica multi-paso: combinado con tool calling y un parser `glm47`, puede orquestar consultas sucesivas a herramientas de búsqueda y sintetizar resultados, aprovechando el modo thinking para planificar.
- Generación de código en entornos de desarrollo: el modelo responde a prompts de Python con explicaciones coherentes y puede integrarse tras un servidor vLLM compatible con OpenAI para autocompletado o revisión de parches.
- Análisis de documentación extensa: con 262.144 tokens de contexto puede procesar repositorios completos, contratos o informes largos en una sola pasada, apoyándose en `--enable-prefix-caching` para reutilizar prefijos entre consultas.
- Asistentes conversacionales multi-turno en inglés o chino: la plantilla de chat GLM-4.5/4.7 y el modo directo permiten mantener diálogos de baja latencia; el modo thinking queda para turnos que requieran razonamiento.
- Despliegue en estaciones de trabajo con memoria unificada: es el escenario para el que se construyó el checkpoint (DGX Spark / GB10, 128 GB de memoria unificada), donde la decodificación está limitada por ancho de banda y la reducción de 13,8 GiB a 5,58 GiB se traduce en 2,85× más velocidad.
- Servicio con presupuesto de VRAM ajustado: al ocupar 5,58 GiB de pesos más una caché KV reducida, permite servir el modelo en GPUs de gama alta de consumo con cuantización de pesos, siempre que se acepte `--enforce-eager`.
- Investigación en cuantización: el repositorio documenta con detalle el proceso modelopt y sus correcciones post-export, por lo que sirve como referencia reproducible para convertir otros modelos a NVFP4 W4A16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de exactitud (MMLU, GSM8K, HumanEval u otros) para esta cuantización en la información disponible. El autor indica explícitamente que solo se han realizado pruebas de humo y que las puntuaciones de la model card del modelo base deben considerarse no verificadas para esta cuantización.

Los únicos datos numéricos publicados son de velocidad de decodificación, medidos en una DGX Spark con una sola GB10, vLLM 0.26.0, `--model-impl transformers --enforce-eager`, caché KV en FP8, tamaño de lote 1, decodificación en streaming, modo thinking con temperatura 0,6 y top_p 0,95, entre 350 y 400 tokens generados por prompt y 3 prompts (aritmética, Python y explicación breve):

| Variante | Pesos en memoria | Velocidad de decodificación | Relativo a BF16 |
|---|---:|---:|---:|
| BF16 (original) | 13,8 GiB | 12,1 tok/s | 1,00× |
| FP8 en línea (`--quantization fp8`) | 8,1 GiB | 22,7 tok/s | 1,88× |
| NVFP4 W4A16 con kernel Marlin (este repo) | 5,58 GiB | 34,5 tok/s | 2,85× |
| NVFP4 con activaciones en FP4 (`quant_algo: NVFP4`, CutlassNvFp4) | no disponible | 29,2 tok/s | no disponible; salida degenerada (solo tokens `!`) |

## Requisitos de hardware

- Pesos del modelo cuantizado: 5,58 GiB en vLLM (6,0 GB de repositorio). El BF16 original ocupa 13,8 GiB, por lo que la cuantización ahorra unas 2,5 veces de memoria en pesos.
- Caché KV: con `--gpu-memory-utilization 0.22` y 32K de longitud máxima, vLLM asignó 15,98 GiB para 416.117 tokens. De forma aproximada (cálculo derivado de ese dato, no medido), cada 32K tokens de contexto consumen del orden de 1,25 GiB de caché KV, cifra que escala a unos 10 GiB para el contexto completo de 256K.
- Hardware validado: una única NVIDIA DGX Spark (GB10) con 128 GB de memoria unificada. No hay pruebas publicadas en GPUs discretas.
- GPU recomendadas: no disponibles como recomendación oficial. Por tamaño de pesos, cualquier GPU con 16 GB o más de VRAM puede alojar el modelo en contextos moderados; en GPUs de 8-12 GB el despliegue exigiría reducir la longitud de contexto. La advertencia importante es que `--gpu-memory-utilization` se interpreta como fracción de la memoria total del dispositivo (128 GB en la Spark), por lo que hay que reescalarlo en cada GPU.
- Compatibilidad con GPU de consumo: no confirmada. El formato NVFP4 depende del kernel Marlin de vLLM, disponible en GPUs NVIDIA modernas; no se ha verificado en tarjetas concretas como RTX 4090 o RTX 5090.
- Opciones de despliegue: vLLM 0.26.0 con detección automática del checkpoint modelopt (no requiere `--quantization`), y `transformers` con `trust_remote_code`. No hay soporte documentado para llama.cpp, Ollama, TGI ni formatos GGUF en la información disponible.
- Comando de servicio proporcionado por el autor:

```bash
vllm serve Kaleto/ZGCM-1-7B-NVFP4 \
  --trust-remote-code \
  --model-impl transformers \
  --enforce-eager \
  --reasoning-parser glm45 \
  --enable-auto-tool-choice \
  --tool-call-parser glm47 \
  --kv-cache-dtype fp8 \
  --max-model-len 262144 \
  --max-num-seqs 6 \
  --gpu-memory-utilization 0.28 \
  --enable-chunked-prefill \
  --max-num-batched-tokens 8192 \
  --enable-prefix-caching
```

- Latencia y throughput: 34,5 tokens/s de decodificación en streaming con lote 1 sobre GB10. No se han publicado cifras de latencia de prefill ni de throughput con lotes mayores.
- Restricción de rendimiento relevante: `--enforce-eager` es obligatorio, lo que desactiva torch.compile y los grafos CUDA y limita el throughput alcanzable.

## Comparativa con modelos similares

No se dispone de datos verificados de otros modelos de la misma categoría (7B densos orientados a matemáticas y agentes) en la información proporcionada. La comparativa posible se limita a las variantes de cuantización del mismo modelo, todas medidas por el autor en la misma DGX Spark:

| Variante | Formato | Pesos en memoria | Decodificación | Estado de calidad |
|---|---|---:|---:|---|
| Este repo | NVFP4 W4A16, group_size 16, kernel Marlin | 5,58 GiB | 34,5 tok/s | Coherente en pruebas de humo; sin comparación de exactitud frente a BF16 |
| FP8 en línea | FP8 dinámico de vLLM | 8,1 GiB | 22,7 tok/s | Mismo problema de colapso con torch.compile/CUDA graphs |
| NVFP4 con activaciones FP4 | `quant_algo: NVFP4`, CutlassNvFp4 | no disponible | 29,2 tok/s | Salida degenerada (solo `!`) por falta de escalas de activación calibradas |
| BF16 original | BF16 | 13,8 GiB | 12,1 tok/s | Referencia de calidad del modelo base |

Comparativa con alternativas de otros autores: no disponible.

## Limitaciones y advertencias

- Calidad no verificada: solo se han hecho pruebas de humo (trazas de pensamiento coherentes y respuestas correctas en aritmética, código y explicación, sin degeneración en 400 tokens). No se ha ejecutado ninguna comparación de exactitud ni de divergencia KL frente a BF16, por lo que las puntuaciones de benchmarks del modelo base no son extrapolables a esta cuantización.
- Inconsistencia en el recuento de parámetros: la model card describe un modelo de 7,39B parámetros y ~6,1B parámetros cuantizados, mientras que el recuento real de safetensors es de 4.332.990.464. La información disponible no explica la diferencia; conviene verificar antes de dimensionar infraestructura.
- `--enforce-eager` es obligatorio: con torch.compile o grafos CUDA la salida colapsa en un bucle de acentos graves tras unos 30 tokens. El autor indica que el mismo fallo aparece con la variante FP8 en línea, tanto con caché KV en FP8 como en BF16, por lo que no es específico de esta cuantización, pero sigue siendo una limitación operativa.
- Fragilidad del formato: cambiar `quant_algo` de `W4A16_NVFP4` a `NVFP4` degrada la salida a tokens `!`, porque el checkpoint no incluye escalas de activación calibradas (`input_scale = 1.0`). No debe modificarse la configuración de cuantización.
- Dependencia de código remoto: requiere `--trust-remote-code` y `--model-impl transformers`. Ejecutar código personalizado de un repositorio con 0 descargas y 0 likes implica un riesgo de cadena de suministro que debe evaluarse; conviene auditar `modeling_zgcm.py` y `configuration_zgcm.py` antes de usarlo en producción.
- Idiomas: únicamente inglés y chino. No hay evaluación en castellano ni en otras lenguas.
- Contexto largo asimétrico: solo 5 de las 32 capas conservan atención global; las otras 27 usan una ventana de 128 tokens. Es previsible una degradación de la recuperación de información a larga distancia respecto a un modelo con atención global completa, aunque no se han publicado evaluaciones de contexto largo para confirmarlo.
- Tool calling: el autor señala que las llamadas a herramientas son mucho más fiables con el modo thinking activado, lo que incrementa el coste en tokens por interacción.
- Sesgos y alucinación: no hay información publicada sobre sesgos, y no se ha medido la tasa de alucinación para esta cuantización.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay reportes independientes de terceros.
- Licencia: MIT, lo que permite uso comercial y modificación, pero la licencia del modelo base se referencia aparte (`LICENSE` de zgcagi/ZGCM-1-7B); conviene revisarla antes de un despliegue comercial.
- Sin soporte GGUF: no es posible ejecutarlo en llama.cpp, Ollama ni en hardware no NVIDIA, según la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kaleto/ZGCM-1-7B-NVFP4
- Modelo base: https://huggingface.co/zgcagi/ZGCM-1-7B
- Licencia del modelo base: https://huggingface.co/zgcagi/ZGCM-1-7B/blob/main/LICENSE
- nvidia-modelopt (TensorRT Model Optimizer): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Referencia arXiv citada en las etiquetas del repositorio: arXiv:2609.13356 (título y contenido no disponibles en la información proporcionada)
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Los resultados devueltos por el buscador corresponden a fichas de producto de telefonía móvil, sin relación con el modelo.
