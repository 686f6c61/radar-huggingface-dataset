# hn7305/Qwen3.8-Flash-Next-NVFP4-Spark

## Resumen

Qwen3.8-Flash-Next-NVFP4-Spark es un checkpoint cuantizado del modelo multimodal Qwen3.8-Flash-Next, desarrollado por hn7305 como un proyecto personal de optimizacion para servir el modelo en un solo DGX Spark (GB10, 128 GB de memoria unificada). El trabajo se basa en el checkpoint NVFP4 de RadixArk, que ya cuantizaba los expertos enrutados del MoE, y extiende la cuantizacion NVFP4 a toda la ruta densa: proyecciones de atencion, `in_proj_qkvz` del Gated Delta Net y el MLP del experto compartido. Esto reduce la lectura de memoria por token decodificado de aproximadamente 4,3 GB a 11,0 GB en los shards densos, lo que mejora la velocidad de decodificacion de un solo flujo de 35,7 a 48-60 tok/s en el hardware objetivo.

El modelo base, Qwen3.8-Flash-Next, es un MoE ultra disperso de 125B parametros (118B en este checkpoint cuantizado) con 6B parametros activos por token, que combina atencion Gated Delta Net (GDN) y Qwen Sparse Attention (QSA) en una arquitectura hibrida, mas una tabla de embeddings n-gram de 51B parametros en fp8. Este checkpoint concreto esta pensado exclusivamente para servir con SGLang en un DGX Spark, e incluye los shards de los expertos y embeddings byte-identicos al checkpoint de RadixArk para que la descarga sea directamente servible sin pasos de ensamblaje. El proyecto esta marcado como experimental y work in progress, con cifras de rendimiento provisionales y un fallo conocido en contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido GDN + QSA (Gated Delta Net + Qwen Sparse Attention), con embeddings n-gram |
| Parametros totales | 118.120.890.259 (safetensors) |
| Parametros activos | 6B por token (modelo base) |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo; probado hasta 218.001 tokens en este checkpoint) |
| Tipos de cuantizacion | NVFP4 (ruta densa y expertos enrutados), fp8_e4m3 (embeddings n-gram PLE), BF16 (norms, gates, lm_head, MTP, hyper-connections) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (compatible con SGLang) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next es un modelo multimodal de arquitectura MoE ultra dispersa con 125B parametros totales (incluyendo 51B de una tabla de embeddings n-gram) y 6B activos por token. La arquitectura combina dos mecanismos de atencion: tres de cada cuatro capas usan Gated Delta Net (GDN), que comprime el historico de forma recurrente, y la cuarta capa usa Qwen Sparse Attention (QSA) para recuperacion precisa de informacion a largo plazo. Esta combinacion reduce el coste computacional por token en cualquier profundidad de contexto, lo que explica que la velocidad de decodificacion se estabilice en lugar de degradarse linealmente.

El checkpoint de hn7305 no anade entrenamiento nuevo: es un trabajo de cuantizacion. RadixArk ya habia cuantizado los expertos enrutados del MoE a NVFP4 y los embeddings n-gram a fp8_e4m3, dejando la ruta densa en BF16. Este proyecto re-cuantiza la ruta densa (proyecciones de atencion, `in_proj_qkvz` y MLP del experto compartido) a NVFP4, manteniendo en BF16 las norms, gates, `lm_head`, MTP y hyper-connections. El autor documenta un bug de escala en la cuantizacion NVFP4 de SGLang: al fusionar tensores como `q/k/v_proj` en `qkv_proj`, el runtime colapsa las escalas con un `max()` que puede de-cuantizar incorrectamente los miembros con escala menor. Este checkpoint evita ese problema cuantizando los tensores ya fusionados.

## Capacidades

- Generacion de texto multimodal: el pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen y texto.
- Razonamiento con modo thinking: el modelo base soporta niveles de thinking configurables (el benchmark GSM8K se ejecuto con `xhigh`).
- Decodificacion especulativa: soporta MTP (multi-token prediction) con 3 pasos y 4 tokens de borrador, y FR-Spec con vocabulario caliente de 65k tokens.
- Codigo y matematicas: los benchmarks incluidos cubren GSM8K con 97,12% de acierto, y las pruebas de decodificacion distinguen prompts de codigo, matematicas y chat.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling y agentes: no se menciona soporte explicito en la informacion disponible.

## Casos de uso

- Servir Qwen3.8-Flash-Next en un solo DGX Spark: este es el caso de uso principal. El checkpoint esta afinado para SGLang en GB10 con 128 GB de memoria unificada, y los shards estan organizados para que `hf download` produzca un checkpoint directamente servible.
- Inferencia de un solo flujo con alta velocidad de decodificacion: con 48-60 tok/s en un solo flujo, es adecuado para aplicaciones interactivas donde la latencia de token a token importa, como asistentes de codigo en tiempo real.
- Procesamiento de contexto largo con coste estable: la decodificacion se degrada de 102,6 tok/s a 6.802 tokens de contexto a 38,2 tok/s a 218.001 tokens, pero la caida de 109k a 218k es solo del 3%. Esto lo hace util para analisis de documentos extensos donde el coste por token adicional es predecible.
- Razonamiento matematico con modo thinking: el benchmark GSM8K con 97,12% sugiere que puede usarse para resolucion de problemas matematicos con cadena de razonamiento larga.
- Generacion de codigo: las pruebas de decodificacion muestran 49,9 tok/s en prompts de codigo, lo que lo hace util para autocompletado o generacion asistida en entornos con el hardware adecuado.
- Investigacion sobre cuantizacion NVFP4: el repositorio documenta el bug de escala en la fusion de tensores de SGLang, lo que lo convierte en material de referencia para quien trabaje en cuantizacion de MoE hibridos.

## Benchmarks y rendimiento

Los datos de rendimiento se midieron en un DGX Spark (GB10, 128 GB unificados, arm64) con SGLang, MTP de 3 pasos y 4 tokens de borrador, y FR-Spec con vocabulario caliente de 65k.

| Metrica | Este checkpoint | Stock (BF16 ruta densa) |
|---|---|---|
| Decodificacion single stream | 48-60 tok/s | 35,7 tok/s |
| Decodificacion 16 concurrentes | 190,7 tok/s | 188,5 tok/s |
| GSM8K (n=1319, temp 0.6, top-p 0.95, max 8192, thinking xhigh) | 97,12% (1281/1319) | no ejecutado |

Decodificacion por profundidad de contexto (diferencia entre generacion de 16 y 256 tokens, prefill cancelado):

| Contexto | Decodificacion tok/s | Accept |
|---|---|---|
| 6.802 | 102,6 | 3,37 |
| 27.276 | 51,9 | 2,51 |
| 54.569 | 42,9 | 2,31 |
| 109.083 | 39,4 | 2,15 |
| 218.001 | 38,2 | 2,64 |

Prefill (TTFT y velocidad):

| Prompt | TTFT | Prefill tok/s |
|---|---|---|
| 8k | 4,66 s | 1.726 |
| 32k | 15,84 s | 2.017 |
| 128k | 65,52 s | 1.950 |

El autor advierte que las cifras son provisionales, con una dispersion run-to-run de aproximadamente el 8%, y que la configuracion de servicio (launcher del repositorio GitHub) afecta al resultado de GSM8K.

## Requisitos de hardware

- Hardware objetivo: un solo DGX Spark (GB10, 128 GB de memoria unificada, arquitectura arm64).
- VRAM: 128 GB de memoria unificada; el checkpoint completo ocupa 122 GB en disco (131 GB el repositorio).
- GPU: no es un modelo para GPU de consumo; requiere el hardware especifico del DGX Spark o equivalente con al menos 128 GB de memoria.
- Libreria de inferencia: SGLang (unica opcion soportada; el checkpoint usa `ModelOptFp4LinearMethod` de SGLang).
- Decodificacion especulativa: MTP con 3 pasos y 4 tokens de borrador, mas FR-Spec con vocabulario caliente de 65k tokens.
- Prefill: chunked_prefill=2048, el ajuste que sobrevive a contexto profundo.
- No es desplegable con vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Velocidad single stream (DGX Spark) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (stock) | 125B (6B activos) | largo | BF16 | no medido | qwen-community-1.0 |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | 118B (cuantizado) | largo | NVFP4 (expertos) + BF16 (denso) | 35,7 tok/s | qwen-community-1.0 |
| hn7305/Qwen3.8-Flash-Next-NVFP4-Spark | 118B (cuantizado) | largo | NVFP4 (denso + expertos) + fp8 (embeddings) | 48-60 tok/s | qwen-community-1.0 |

La comparativa se limita a las variantes del mismo modelo base porque no hay datos de modelos alternativos en la informacion proporcionada. La diferencia clave entre las tres versiones es el grado de cuantizacion de la ruta densa y el rendimiento resultante en el hardware objetivo.

## Limitaciones y advertencias

- Proyecto experimental y work in progress: el autor lo marca explicitamente como un proyecto personal de optimizacion, no un release soportado. Las cifras de rendimiento son provisionales y pueden variar entre revisiones.
- Fallo conocido en contexto largo: hay un crash abierto en contexto largo documentado en las limitaciones del autor, aunque no se detalla la causa exacta.
- Calidad potencialmente inferior al checkpoint base: la cuantizacion NVFP4 de la ruta densa puede degradar la calidad respecto al checkpoint original en BF16. El autor recomienda usar el checkpoint base si se necesita la calidad exacta.
- GSM8K sensible a la configuracion de servicio: el resultado de 97,12% depende de la configuracion del launcher del repositorio GitHub, no solo de los pesos. Cambios en la configuracion pueden alterar el resultado.
- Hardware muy especifico: el checkpoint esta afinado para un solo DGX Spark. No hay garantias de funcionamiento en otro hardware, y la documentacion no cubre despliegues alternativos.
- Licencia qwen-community-1.0: es una licencia de la comunidad Qwen con restricciones especificas; hay que revisar los terminos para uso comercial.
- Bug de escala documentado: el autor documenta un bug en la cuantizacion NVFP4 de SGLang que afecta a quien intente replicar el trabajo con otros modelos. Este checkpoint lo evita, pero el bug existe en la herramienta subyacente.
- Sin datos de sesgos ni alucinacion: no se proporciona informacion sobre evaluaciones de sesgo, seguridad o tasa de alucinacion.

## Enlaces

- Checkpoint: https://huggingface.co/hn7305/Qwen3.8-Flash-Next-NVFP4-Spark
- Repositorio de codigo, benchmarks y documentacion: https://github.com/hn7305/qwen38-flash-next-spark-optimized
- Checkpoint base cuantizado: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del modelo original: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog de soporte en SGLang: https://www.lmsys.org/blog/2026-08-26-qwen-flash-next
- Recetas vLLM del modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
