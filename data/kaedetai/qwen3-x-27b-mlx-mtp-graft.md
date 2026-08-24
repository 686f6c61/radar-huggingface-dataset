# KaedeTai/Qwen3.x-27B-mlx-mtp-graft

## Resumen

El repositorio `KaedeTai/Qwen3.x-27B-mlx-mtp-graft` no es un modelo de lenguaje completo, sino un componente auxiliar: la cabeza de predicción multi-token (MTP) del modelo Qwen3.8-27B, empaquetada para ser injertada en cuantizaciones MLX que han perdido silenciosamente los pesos MTP. Muchas conversiones MLX de Qwen3.5/3.6/3.8 mantienen la configuración `mtp_num_hidden_layers: 1` en `config.json` pero eliminan los tensores MTP, de modo que el checkpoint carga y genera correctamente pero sin capacidad de predicción multi-token, degradando el rendimiento sin ningún aviso.

El autor, KaedeTai, proporciona la cabeza MTP (314 MB) junto con dos herramientas: `graft_mtp.py` para injertarla en un checkpoint MLX existente y `to_mtplx.py` para convertir el injerto al formato nativo MTPLX. Las mediciones en Apple M5 Max (128 GB) muestran una aceleración de hasta 2,11× en generación autoregresiva tras el injerto, y demuestran que el empaquetado de la cabeza es más crítico que los propios pesos: una cabeza 4-bit sin convertir produce una tasa de aceptación del 1,56% en MTPLX, mientras que convertida a fp16 alcanza el 96,79%. El repositorio no redistribuye pesos base y no ha sido entrenado; la cabeza es la original de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP del modelo denso Qwen3.8-27B (transformer) |
| Parametros totales | No disponible (la cabeza MTP ocupa 314 MB en 4-bit) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (herencia del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | Cabeza en MLX affine 4-bit g64; convertible a fp16 mediante `to_mtplx.py` |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente la cabeza de predicción multi-token del modelo Qwen3.8-27B, un transformer denso de 27.000 millones de parametros desarrollado por Alibaba. La cabeza MTP es un modulo que predice varios tokens futuros en paralelo para acelerar la decodificacion especulativa. No se ha realizado ningun entrenamiento adicional: los pesos son los originales de Qwen, extraidos y reempaquetados.

La innovacion tecnica principal no esta en los pesos sino en el empaquetado. El autor documenta que los runtimes oMLX y MTPLX esperan la misma cabeza en contenedores incompatibles: oMLX usa nombres de tensor `language_model.mtp.*` dentro del indice principal, mientras que MTPLX requiere `mtp.*` en un archivo separado `mtp.safetensors` ausente del indice, con precision fp16 y una declaracion explicita en `mtplx_runtime.json`. La herramienta `to_mtplx.py` realiza la conversion necesaria: de-cuantiza la cabeza a fp16, la renombra, la extrae del indice y genera el archivo de runtime. Sin esta conversion, MTPLX interpreta los words U32 empaquetados como si fueran la matriz de pesos, produciendo una degradacion silenciosa a "MTP no ayuda".

## Capacidades

- Restauracion de la prediccion multi-token en cuantizaciones MLX de Qwen3.8-27B que han perdido los pesos MTP.
- Compatibilidad con dos runtimes de inferencia: oMLX y MTPLX.
- Herramienta de injerto (`graft_mtp.py`) que verifica la estructura del checkpoint receptor.
- Herramienta de conversion (`to_mtplx.py`) que genera artefactos MTPLX nativos con `mtplx_runtime.json`.
- No es un modelo generativo autonomo: requiere un checkpoint base cuantizado de Qwen3.8-27B.
- No soporta vision, audio ni otras modalidades por si mismo; hereda las capacidades del modelo base.

## Casos de uso

- Aceleracion de inferencia en Apple Silicon: injertar la cabeza MTP en un checkpoint MLX 4-bit de Qwen3.8-27B permite pasar de ~29 tok/s a ~61 tok/s en generacion de codigo (2,11×) y a ~41 tok/s en prosa china (1,39×), medido en M5 Max.
- Restauracion de funcionalidad perdida: detectar y corregir cuantizaciones MLX que declaran `mtp_num_hidden_layers: 1` pero no incluyen los tensores MTP, un fallo silencioso comun en conversiones de Qwen3.5/3.6/3.8.
- Migracion entre runtimes: usar `to_mtplx.py` para convertir un injerto oMLX a formato MTPLX nativo, evitando la degradacion silenciosa que ocurre al pasar una cabeza 4-bit sin convertir (aceptacion del 1,56% frente al 96,79%).
- Evaluacion de decodificacion especulativa: comparar el rendimiento de la cabeza MTP original de Qwen frente a cabezas alternativas o ausencia de MTP, con control de deriva termica y protocolos de medicion intercalados.
- Desarrollo de pipelines de inferencia local: integrar la cabeza MTP en despliegues de Qwen3.8-27B con oMLX o MTPLX para aplicaciones de generacion de codigo, agentes y automatizacion de oficina.
- Investigacion sobre empaquetado de modelos: estudiar como el formato de contenedor (nombres de tensor, precision, declaracion en indice) afecta al rendimiento real de MTP, independientemente de los pesos.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de las mediciones del autor en Apple M5 Max (128 GB, macOS 26.4.1), con el checkpoint receptor `trohrbaugh/Qwen3.8-27B-heretic-ara` (MLX affine 4-bit g64, abliterado con Heretic), servido a traves de oMLX con greedy, thinking off y protocolo A/B/A intercalado.

| Escenario | Antes (sin MTP) | Despues del injerto | Speedup |
|---|---:|---:|---:|
| Python LRU cache | 29,0 / 29,9 tok/s | 61,1 tok/s (spread 18,5%) | 2,11× |
| Prosa china | 29,4 tok/s | 40,9 tok/s | 1,39× |

Aceptacion en profundidad 1: 93,7% en codigo, 53% en prosa china (segun logs de oMLX). Tokens por ciclo: 3,53 y 1,88 respectivamente.

Comparativa MTPLX 2.9.1 (`tune --depths 1,2,3`, 512 tokens, M5 Max 128 GB, intercalado A/B/C y C/B/A):

| Artefacto | Cabeza MTP | Runs | AR tok/s (mediana) | Mejor tok/s (mediana) | × AR | Aceptacion D1 |
|---|---:|---:|---:|---:|---:|---:|
| `Qwen3.8-27B-MTPLX-4bit` (referencia) | fp16 nativa | 5 | 26,2 | 71,7 | 2,72× | 98,39% |
| ARA + injerto | cabeza 4-bit → fp16 | 5 | 29,5 | 58,8 | 2,05× | 96,79% |
| ARA + cabeza fp16 oficial de Qwen | fp16 | 2 | 28,8 | 51,0 | 1,78× | 98,92% |

El autor advierte que la deriva termica entre ejecuciones consecutivas puede alcanzar el 20% (AR de 31,0 a 24,9 tok/s en cinco runs), por lo que una sola medicion no es fiable. Tambien observa que una mayor aceptacion no implica mayor throughput: la cabeza fp16 oficial acepta mas (98,92%) pero es consistentemente mas lenta que la injertada, una discrepancia del 12-15% que el autor reporta sin explicacion.

## Requisitos de hardware

- Plataforma: Apple Silicon (las pruebas se realizaron en M5 Max con 128 GB de RAM unificada).
- VRAM: no aplica directamente; MLX utiliza memoria unificada. El checkpoint base de 27B en 4-bit requiere aproximadamente 16-20 GB de memoria unificada.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 32 GB de RAM unificada para el modelo completo; 128 GB recomendados para margen y pruebas de rendimiento.
- No cabe en GPUs de consumo de NVIDIA (RTX 4090, etc.) porque MLX es exclusivo de Apple Silicon.
- Opciones de despliegue: oMLX y MTPLX como runtimes de inferencia; las herramientas del repositorio son scripts Python que operan sobre checkpoints MLX.
- Latencia y throughput: con MTP injertado, entre 41 y 61 tok/s en M5 Max segun el idioma y la tarea; sin MTP, alrededor de 29 tok/s.

## Comparativa con modelos similares

| Repositorio | Contenido | Cabeza MTP | Formato | Licencia |
|---|---|---|---|---|
| `KaedeTai/Qwen3.x-27B-mlx-mtp-graft` | Cabeza MTP + herramientas de injerto | 4-bit MLX, convertible a fp16 | safetensors MLX | Apache-2.0 |
| `rapid-mlx/Qwen3.8-27B-4bit-MTP-MLX` | Checkpoint completo 4-bit + cabeza MTP nativa | fp16 nativa | safetensors MLX | Apache-2.0 |
| `Qwen/Qwen3.8-27B` | Modelo base original | Incluida (fp16) | safetensors | Apache-2.0 |

La diferencia clave es que el repositorio de KaedeTai no redistribuye pesos base, solo la cabeza, y esta pensado para reparar cuantizaciones que la han perdido. El de rapid-mlx es un paquete autocontenido con la cabeza nativa, que en las mediciones del autor alcanza 71,7 tok/s frente a los 58,8 tok/s del injerto. El modelo base de Qwen es la referencia original, pero requiere conversion a MLX para ejecutarse en Apple Silicon.

## Limitaciones y advertencias

- No probado en Qwen3.5-27B ni Qwen3.6-27B; el autor afirma que no se garantiza su funcionamiento en esas familias.
- El empaquetado es critico: si se entrega una cabeza 4-bit sin convertir a MTPLX, la aceptacion cae al 1,56% y el sistema degrada silenciosamente a "MTP no ayuda", un fallo que parece un resultado negativo legitimo.
- La deriva termica en Apple Silicon puede variar el rendimiento hasta un 20% entre ejecuciones consecutivas; cualquier comparativa debe intercalar mediciones y reportar la dispersion.
- El repositorio no incluye pesos base; es un componente que requiere un checkpoint receptor compatible.
- La cabeza MTP no ha sido entrenada ni modificada; es la original de Qwen, por lo que no corrige sesgos ni alucinaciones del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene sus propias condiciones (tambien Apache-2.0 segun la documentacion).
- La cifra de 3,79× publicada en una revision anterior del README fue retirada por el autor por provenir de mediciones con longitudes de generacion incomparables (200 vs 512 tokens).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KaedeTai/Qwen3.x-27B-mlx-mtp-graft
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Paquete MLX con MTP nativa: https://huggingface.co/rapid-mlx/Qwen3.8-27B-4bit-MTP-MLX
- Herramienta de abliteracion Heretic: https://github.com/p-e-w/heretic
- Guia de despliegue local de Qwen 3.8-27B: https://www.geeky-gadgets.com/serve-qwen-3-8-27b-fast/
- Guia de ejecucion local en GPUs de 16-24 GB: https://codersera.com/blog/how-to-run-qwen-3-8-locally-2026/
