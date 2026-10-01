# Radioheading/Kimi-K3-W4AFP8

## Resumen

Kimi-K3-W4AFP8 es una versión cuantizada del modelo base moonshotai/Kimi-K3, publicada por el usuario Radioheading. No se trata de un modelo nuevo ni de un reentrenamiento: es una recuantización de los pesos nativos MXFP4 del Kimi-K3 original a un esquema W4AFP8, con expertos enrutados en INT4 (grupo 128), activaciones en FP8 y proyecciones de atención también en FP8. El objetivo es reducir el coste de servir un modelo de mezcla de expertos (MoE) de gran tamaño sin degradar de forma significativa la calidad respecto al modelo nativo.

El interés de esta ficha está en su vertiente de despliegue: el autor documenta una configuración medida sobre 32 GPU GH200 (8 nodos x 4 GPU), con paralelismo de tensor y de expertos TP32/EP32, caché KV en FP8, decodificación especulativa DSpark (bloque 2) y atención FlashMLA. Frente a la alternativa vessl/Kimi-K3-W4AFP8, que usa el mismo formato tensorial y los mismos kernels, este repositorio declara un error menor contra el modelo nativo (+0.0151 nats/token frente a +0.0187).

El repositorio tiene 0 descargas y 0 likes, un tamaño reportado de 0.0 GB y se distribuye bajo la licencia del modelo base (license: other, license_name: kimi-k3). La información pública disponible se centra en la receta de cuantización, los parches necesarios para SGLang y las métricas de rendimiento; no incluye detalles sobre la arquitectura interna, el número de parámetros, la longitud de contexto ni la composición del dataset de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con expertos enrutados y componentes tipo SSM/Mamba en el despliegue (flag `--mamba-ssm-dtype`); detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero no se publica el ratio de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4AFP8: INT4 con grupo de tamaño 128 en expertos enrutados, activaciones FP8, proyecciones de atención FP8; recuantizado desde los pesos nativos MXFP4 de moonshotai/Kimi-K3. Caché KV en FP8 e4m3 |
| Idiomas soportados | no disponible |
| Licencia | other / kimi-k3 (heredada de moonshotai/Kimi-K3, ver `LICENSE`) |
| Formato de pesos | no disponible explícitamente; el repositorio se distribuye con `apply_patch.py` y parches para SGLang, con un tamaño de repo reportado de 0.0 GB |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento nuevo. Los pesos proceden de moonshotai/Kimi-K3, cuyos expertos enrutados están almacenados de forma nativa en MXFP4; este repositorio los recuantiza a INT4 con grupo 128 y mantiene las activaciones y las proyecciones de atención en FP8. El autor indica que el formato tensorial y los kernels son idénticos a los de vessl/Kimi-K3-W4AFP8, pero con menor error respecto al modelo original. No se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, las fases de alineación (RLHF/DPO) ni la arquitectura interna del Kimi-K3 base.

La innovación relevante está en el plano del despliegue. La configuración medida usa decodificación especulativa DSpark con borrador RadixArk/Kimi-K3-DSpark y tamaño de bloque 2, junto con `--enable-linear-replayssm-spec`, caché KV en FP8 y backend de atención FlashMLA tanto en prefill como en decode. El autor publica cinco parches para SGLang v0.5.20: `01-sgl-kernel-sm90a.patch` (compila los kernels CUTLASS SM90 con `sm_90a`, necesario para W4A8 en aarch64), `02-expert-load-filter.patch` (cada rank lee solo sus propios expertos, bajando la carga de ~20 a ~5 minutos), `03-fp8-kv-prefill-gather.patch` (evita OOM en prefill), `04-marlin-ep-block.patch` (corrige el tamaño de tile del MoE con Marlin bajo EP) y `05-w4a8-count-sort.patch` (permutación de enrutamiento MoE más rápida y bit-idéntica).

## Capacidades

- Generación de texto y razonamiento: el autor evalúa el modelo con prompts reales de competiciones de matemáticas (AIME 2026 y HMMT de febrero de 2026), lo que confirma capacidad de razonamiento matemático avanzado.
- Modo de razonamiento explícito: el despliegue habilita `--reasoning-parser kimi_k3`, lo que implica soporte de trazas de razonamiento separadas en la salida.
- Tool calling / function calling: el despliegue habilita `--tool-call-parser kimi_k3`, lo que implica soporte de llamadas a herramientas en formato compatible con OpenAI.
- Servidor compatible con la API de OpenAI en `http://$HEAD:30000/v1`, con nombre de modelo servido `moonshotai/Kimi-K3`.
- Procesamiento de contexto largo en prefill mediante chunked prefill (`--chunked-prefill-size 4096`, `--max-prefill-tokens 8192`) y caché KV en FP8.
- Generación con decodificación especulativa DSpark, que acelera la decodificación manteniendo la salida.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático y de competición: el modelo está validado con prompts de AIME 2026 y HMMT, con un 81.3% de acierto en 8 muestras por problema. Es adecuado para entornos de evaluación de razonamiento donde se necesita una versión cuantizada del Kimi-K3 con pérdida mínima de precisión (−1.0 puntos, error estándar 1.6, no significativo).
- Agentes con tool calling: el parser `kimi_k3` de llamadas a herramientas permite integrar el modelo en bucles de agente que invocan APIs, ejecutan código o consultan bases de datos, siempre sobre la infraestructura de 32 GH200 descrita.
- Inferencia de alto rendimiento en producción: con 932 tok/s agregados a 50 peticiones concurrentes en esta configuración, es viable como servicio multiinquilino con decenas de streams simultáneos.
- Escalado horizontal con enrutador: dos réplicas de W4A8 (64 GPU) detrás de `sglang-router` con 25 streams cada una ofrecen 35.7 tok/s por stream, útil para despliegues que crecen en número de usuarios manteniendo latencia por usuario.
- Pipelines de razonamiento con contexto largo: el uso de caché KV en FP8 y chunked prefill permite procesar prompts largos en prefill, adecuado para análisis de documentos extensos o revisiones de código con mucho contexto.
- Servicio compatible con OpenAI como sustituto directo: al exponer un endpoint `/v1` con el nombre `moonshotai/Kimi-K3`, se puede conectar a clientes y frameworks existentes sin cambios de código, útil para migrar de una API propietaria a autohospedaje.
- Evaluación de esquemas de cuantización: el repositorio incluye parches, métricas de divergencia KL y comparativas frente a W4A16 y vessl/Kimi-K3-W4AFP8, lo que lo convierte en material de referencia para estudiar el compromiso entre precisión y throughput en cuantización W4A8.

## Benchmarks y rendimiento

Medidas sobre 8 nodos x 4 GH200, TP32 / EP32, decodificación especulativa DSpark (bloque 2), caché KV FP8, prompts reales de AIME/HMMT y EOS real. Los valores son la mediana de tok/s de salida por stream.

| Metrica | W4A16 (moonshotai/Kimi-K3, MXFP4 nativo) | W4A8 (este repositorio) |
|---|---|---|
| tok/s por stream, 50 concurrentes | 29.6 | 31.9 |
| tok/s por stream, 20 concurrentes | 40.6 | 40.7 |
| tok/s agregados, 50 concurrentes | 883 | 932 |
| KL respecto al nativo, nats/token (IC 95%) | +0.0011 (0.0006–0.0016) | +0.0151 (0.0138–0.0163) |
| AIME 2026 + HMMT feb 2026, 8 muestras/problema | 82.3% | 81.3% (−1.0 pt, SE 1.6: no significativo) |

Notas del autor: los valores de KL se obtuvieron con teacher forcing sobre 355 000 tokens de continuaciones de matemáticas y demostraciones generadas por el modelo nativo. Para comparar, vessl/Kimi-K3-W4AFP8 obtiene +0.0187. En las ejecuciones medidas, W4A16 usó los parches 02 y 04, y W4A8 los parches 01 y 02 más `--max-total-tokens 524288`; los parches 03 y 05 no alteran las salidas (el 03 se probó por separado con el mismo KL y la misma velocidad) y la ganancia de velocidad del 05 por sí solo no se midió. Con dos réplicas W4A8 (64 GPU) tras `sglang-router`, 25 streams cada una, se obtienen 35.7 tok/s por stream. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Configuración medida: 8 nodos con 4 GPU GH200 cada uno (32 GPU en total), TP32 / EP32, `--nnodes 8` con rango de nodo 0 a 7.
- No cabe en GPU de consumo. Tampoco hay datos publicados de despliegue en una sola GPU o en configuraciones de gama alta para escritorio.
- Memoria: `--mem-fraction-static 0.82` en el despliegue medido. El tamaño de VRAM por GPU no se especifica en la información disponible.
- Caché KV en FP8 e4m3 con `--max-total-tokens 524288` como parche de seguridad frente a OOM en prefill cuando no se aplica el parche 03.
- Gestión de concurrencia: `--max-running-requests 64` y `--cuda-graph-max-bs-decode 64`. Con 50 streams concurrentes se miden 31.9 tok/s por stream y 932 tok/s agregados.
- Prefill: `--chunked-prefill-size 4096`, `--max-prefill-tokens 8192`, backend de atención FlashMLA en prefill y decode.
- Decodificación especulativa: modelo borrador RadixArk/Kimi-K3-DSpark, algoritmo DSPARK con tamaño de bloque 2, borrador sin cuantizar y caché KV del borrador en bfloat16.
- Software: SGLang v0.5.20, imagen arm64 con CUDA 13. Se requiere `--trust-remote-code` y la aplicación de los parches `01` y `02` (más `apply_patch.py` para registrar el método W4A8) dentro del árbol de fuentes de SGLang.
- Interconexión: ajustes NCCL `NCCL_MIN_NCHANNELS=24`, `NCCL_MAX_NCHANNELS=24`, `NCCL_IB_ADAPTIVE_ROUTING=0`, `NCCL_IB_QPS_PER_CONNECTION=2`.
- Tiempos: el servidor está listo en 8–15 minutos. La carga de pesos baja de ~20 a ~5 minutos con el parche de filtrado de expertos. La recompilación del objetivo `common_ops_sm90_build` tarda ~5 minutos.
- Latencia: no se publican métricas de latencia (TTFT o TPOT); solo tok/s por stream y agregados.

## Comparativa con modelos similares

| Modelo | Cuantización | KL respecto al nativo (nats/token) | Rendimiento | Notas |
|---|---|---|---|---|
| Radioheading/Kimi-K3-W4AFP8 (este repo) | INT4 grupo 128 en expertos + FP8 en activaciones y atención | +0.0151 (0.0138–0.0163) | 31.9 tok/s por stream a 50 concurrentes; 932 tok/s agregados | Requiere parches 01 y 02; ~8% más de throughput que W4A16 a 50 streams |
| moonshotai/Kimi-K3 (W4A16, MXFP4 nativo) | MXFP4 nativo | +0.0011 (0.0006–0.0016) | 29.6 tok/s por stream a 50 concurrentes; 883 tok/s agregados | Modelo de referencia; requiere el parche 04 (sin él, 23.6 tok/s a 50 streams) |
| vessl/Kimi-K3-W4AFP8 | W4AFP8, mismo formato tensorial y kernels | +0.0187 | no disponible | Referencia directa en formato; este repositorio declara menor error |

No se dispone de comparaciones con otras familias de modelos (por ejemplo, otras alternativas MoE abiertas) en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización, no un modelo original: hereda todas las limitaciones del Kimi-K3 base, que no se documentan en la información disponible.
- La cuantización introduce un error medible: +0.0151 nats/token de divergencia KL respecto al modelo nativo, con una caída de 1.0 punto en AIME 2026 + HMMT (no significativa con el tamaño de muestra usado, SE 1.6).
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) ni evaluaciones de sesgo, alucinación o seguridad.
- Sin datos sobre idiomas soportados ni sobre comportamiento fuera del inglés y de dominios matemáticos.
- Licencia: `other` con `license_name: kimi-k3`, heredada de moonshotai/Kimi-K3. Es imprescindible revisar el fichero `LICENSE` del repositorio base antes de cualquier uso comercial; no se especifican aquí los términos.
- Repositorio sin tracción: 0 descargas y 0 likes, creado y actualizado el mismo día. No hay garantía de mantenimiento ni de soporte.
- El tamaño de repo reportado es 0.0 GB, lo que genera dudas sobre si los pesos están efectivamente alojados o si el repositorio contiene únicamente los parches y el script; conviene verificarlo antes de planificar el despliegue.
- Dependencia fuerte de parches no incluidos en SGLang upstream: sin el parche 01 (SM90a) los kernels W4A8/FP8 abortan con el error "Arch conditional MMA instruction"; sin el 03 el prefill puede quedarse sin memoria; sin el 04 Marlin rinde mucho peor bajo EP.
- El despliegue exige 32 GH200 y una topología de red con ajustes NCCL específicos. No es viable en hardware de consumo ni en un único nodo.
- No se publican métricas de latencia (TTFT/TPOT) ni análisis de estabilidad a largo plazo en producción.
- Los resultados de rendimiento proceden de una única configuración medida por el autor, con prompts de matemáticas; pueden no extrapolarse a otras cargas de trabajo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Radioheading/Kimi-K3-W4AFP8
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Cuantización de referencia en el mismo formato: https://huggingface.co/vessl/Kimi-K3-W4AFP8
- Modelo borrador para decodificación especulativa: https://huggingface.co/RadixArk/Kimi-K3-DSpark
- Licencia: `LICENSE` (incluido en el repositorio)
