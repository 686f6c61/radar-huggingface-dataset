# Karasumikura/Ying-K2-Lite-200M

## Resumen

Ying K2 Lite 200M es un modelo de lenguaje de tipo base, preentrenado desde cero por el desarrollador independiente Karasumikura bajo la arquitectura propietaria MM200. Con 210,2 millones de parámetros, 16 capas y una ventana de contexto de entrenamiento de 8.192 tokens, se posiciona como un modelo pequeno orientado a experimentacion, extraccion de caracteristicas y generacion de texto en chino e ingles. El repositorio tiene licencia Apache 2.0 y esta integrado en el ecosistema transformers mediante un adaptador `mm200_hf.py`.

La relevancia de esta version radica en su infraestructura de inferencia: a diferencia de la generacion K1, el repositorio incluye un runtime propio (`mm200_runtime.py`) con soporte de KV cache, generacion en streaming y decodificacion con CUDA Graph, ademas de compatibilidad directa con `AutoModel` y `AutoTokenizer`. El modelo fue entrenado sobre 24,07 mil millones de tokens (frente a los 14,92 B de K1) en 8 GPU MTT S4000, con un dataset predominantemente chino.

Es importante subrayar que se trata exclusivamente de pesos base: no existe version SFT ni ajuste por instrucciones para K1.5, por lo que el modelo completa texto pero no sigue instrucciones ni mantiene conversaciones. Su uso en produccion como asistente requeriria un proceso de post-entrenamiento previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (MM200), 16 capas, hidden 768, GQA 3:1 con 12 cabezas de consulta y 4 de clave/valor, gated attention y QK-norm, head_dim 64 |
| Parametros totales | 210.210.560 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens de entrenamiento (ventana deslizante de 1.024) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; se menciona fp16 como alternativa valida) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (195 tensores, 420,4 MB) |

## Arquitectura y entrenamiento

El modelo emplea un transformer denso de 16 capas con atencion de consultas agrupadas (GQA) en proporcion 3:1 (12 cabezas de consulta, 4 de clave/valor), atencion con compuerta (gated attention) y normalizacion QK. La normalizacion interna es RowNorm centrada en cero, materializada como `weight` estandar durante la exportacion. El vocabulario es de 16.006 tokens y la ventana de atencion deslizante es de 1.024 tokens sobre un contexto de entrenamiento de 8.192.

El entrenamiento se realizo en dos fases: una primera de 90.000 pasos sobre 14,92 B tokens y una segunda de continuacion de 1.205 pasos sobre 9,14 B tokens adicionales, totalizando 91.205 pasos y 24,07 B tokens. Los datos son mayoritariamente chinos (se cita Ultra-FineWeb-zh como fuente). El hardware empleado fueron 8 GPU MTT S4000 con el stack MUSA. La continuacion modifico efectivamente los pesos: la comparacion tensor a tensor con el checkpoint `base_step90000` muestra una diferencia maxima de 0,70 en `blocks.0.attn.gate_proj`. No se menciona RLHF, DPO ni ninguna fase de alineacion.

## Capacidades

- Generacion de texto autoregresiva y continuacion de secuencias en chino e ingles.
- Extraccion de caracteristicas (etiqueta `feature-extraction` en el repositorio).
- Razonamiento basico y completado de patrones: en las pruebas cualitativas del autor, el modelo continua frases de forma mas coherente que la generacion K1, aunque sin garantia de correccion factual.
- Soporte de tool calling / function calling: no disponible (modelo base sin post-entrenamiento).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues limitadas a chino e ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Plantilla de chat definida (`<|user|>...<|assistant|>...<|im_end|>`) con tokens especiales verificados como token unico (15932, 16001, 16002), pero no asimilada por el modelo base.

## Casos de uso

- Investigacion sobre arquitecturas transformer pequenas: el modelo sirve como banco de pruebas reproducible de 210 M parametros con GQA, gated attention y QK-norm, util para estudiar el efecto de estas decisiones de diseno en modelos de baja escala.
- Preentrenamiento base para post-entrenamiento propio: al ser un modelo base con licencia Apache 2.0, puede servir de punto de partida para SFT o DPO en chino sobre dominios concretos, aprovechando su contexto de 8.192 tokens.
- Extraccion de caracteristicas y embeddings de texto en chino: la etiqueta `feature-extraction` y el tamano reducido permiten usar las representaciones internas en tareas de clasificacion o similitud semantica con recursos limitados.
- Generacion de texto asistida en entornos con hardware modesto: con 420 MB de pesos en bfloat16, cabe en CPU y en GPU de consumo, lo que permite desplegarlo para tareas de completado de texto o generacion de borradores sin infraestructura dedicada.
- Experimentacion con tecnicas de inferencia: el runtime incluido (`mm200_runtime.py`) con CUDA Graph, KV cache y streaming convierte al modelo en un caso practico para medir latencia, throughput y efectos de optimizaciones en un modelo pequeno.
- Prototipado de pipelines de generacion en chino: para tareas de continuacion de texto, resumen extractivo simple o generacion de variantes linguisticas donde no se requiera seguir instrucciones estrictas.
- Evaluacion comparativa de generaciones de modelos: la documentacion del autor compara K1 y K1.5 con perplejidad por dominio, lo que permite usar el modelo como referencia en estudios de escalado de datos de preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona metricas de perplejidad (NLL por token) comparando K1 y K1.5 sobre 8 segmentos por dominio, con inferencia en CPU bf16:

| Dominio | K1 (NLL/token) | K1.5 (NLL/token) | Variacion | IC 95% | Segmentos donde mejora K1.5 |
|---|---|---|---|---|---|
| Codigo | 1,4818 | 1,5722 | +6,1% (peor) | ±0,076 (significativo) | 1/8 |
| Ingles | 1,8846 | 1,8352 | −2,6% (mejor) | ±0,032 (significativo) | 6/8 |
| Matematicas | 2,2728 | 2,3922 | +5,3% (peor) | ±0,115 (limite) | 2/8 |

Tambien se documentan metricas de inferencia medidas sobre el modelo hermano Ying-K1 (misma arquitectura, 210,2 M) en una unica T4, pendientes de revalidacion en K1.5:

| Metrica | Antes de optimizar | Despues de optimizar |
|---|---|---|
| Latencia de decodificacion por token | 21,6 ms | 7,2 ms (3,00x) |
| Throughput de una peticion | 46,3 tok/s | 139,2 tok/s (3,00x) |
| Respuesta de 256 tokens | 6,62 s | 1,90 s (3,5x) |
| Respuesta de 900 tokens | 19,4 s | 6,5 s |
| TTFT en streaming | no disponible | 1,05 s |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,42 GB en bfloat16 (420,4 MB de pesos) mas overhead de activaciones y cache KV; en fp32 seria del orden de 0,85 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor valida el rendimiento en una T4. Tambien funciona en CPU en bfloat16.
- Cabe en GPU de consumo: si, en cualquier GPU moderna de consumo (por ejemplo, RTX 3060 en adelante), asi como en iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers con `trust_remote_code=True` (ruta lenta sin KV cache) y el runtime propio `mm200_runtime.py` con KV cache, streaming y CUDA Graph (ruta rapida). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7,2 ms por token y 139,2 tok/s por peticion con CUDA Graph en T4 (medido en K1, misma arquitectura); la ruta estandar de transformers es considerablemente mas lenta por recalcular el contexto en cada token. Con prompt superior a 1.024 tokens, el runtime corregido genera a 24,3 ms por token en modo eager.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Post-entrenamiento | Disponibilidad |
|---|---|---|---|---|---|---|
| Ying K2 Lite 200M | 210,2 M | 8.192 | zh, en | Apache 2.0 | No (solo base) | Hugging Face, runtime propio |
| Ying K1 Lite 200M | 210,2 M | 8.192 | zh, en | Apache 2.0 | Si (SFT, 90.000 instrucciones en chino) | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32.768 | multilingue | Apache 2.0 | Si (instruct) | Hugging Face, vLLM, llama.cpp |
| SmolLM2-135M | 135 M | 8.192 | en (principalmente) | Apache 2.0 | Si (instruct) | Hugging Face, llama.cpp |

La comparativa con Qwen2.5-0.5B y SmolLM2-135M se ofrece como referencia de categoria por tamano y licencia; no se dispone de datos de rendimiento comparables publicados en la informacion proporcionada. Frente a Ying K1 Lite 200M, la version K1.5 mejora en ingles (−2,6% de perplejidad) pero empeora en codigo (+6,1%) y matematicas (+5,3%), y carece de la version SFT que si tiene K1.

## Limitaciones y advertencias

- Modelo exclusivamente base: no sigue instrucciones ni mantiene dialogos; aplicar la plantilla de chat sin SFT previo produce resultados deficientes.
- Riesgo elevado de alucinacion y de continuaciones factualmente incorrectas; en las pruebas del autor, el modelo continua frases de forma gramatical pero con contenido erroneo (por ejemplo, en un silogismo simple).
- Rendimiento inferior a K1 en codigo y matematicas segun la perplejidad medida, con intervalos de confianza significativos en codigo.
- Cobertura linguistica limitada a chino e ingles; no se documenta soporte para castellano ni otras lenguas.
- Contexto efectivo reducido por la ventana deslizante de 1.024 tokens, aunque el contexto de entrenamiento sea de 8.192.
- La licencia Apache 2.0 permite uso comercial, pero al no existir version alineada, cualquier despliegue en produccion requeriria post-entrenamiento y evaluacion propios.
- El modelo no incluye filtros de seguridad ni moderacion; los sesgos del corpus de preentrenamiento (mayoritariamente chino) pueden reflejarse en las salidas.
- El soporte de herramientas de terceros (vLLM, llama.cpp, Ollama, TGI) no esta documentado; la integracion depende del codigo personalizado del repositorio.
- El autor advierte que `Ying-K1-Lite-0.2B` es de la generacion K1 y no debe tratarse como version post-entrenada de K1.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karasumikura/Ying-K2-Lite-200M
- Modelo hermano con SFT (generacion K1): https://huggingface.co/Karasumikura/Ying-K1-Lite-0.2B
- Paper: no disponible
- Blog del autor: no disponible
- Repositorio de codigo: no disponible (el runtime `mm200_runtime.py` y el adaptador `mm200_hf.py` se distribuyen dentro del repositorio de Hugging Face)
- Demo: no disponible
