# NateRunsA-LIST/violet-shield-embeddinggemma2

## Resumen

Violet Shield es un clasificador de amenazas para dispositivos moviles desarrollado por NateRunsA-LIST en el contexto del proyecto VioletOS, un sistema operativo para smartphones construido sobre el microkernel seL4. El modelo toma ventanas de telemetria de llamadas al sistema (syscalls) generadas por las aplicaciones del dispositivo y decide si la actividad reciente de una app parece maliciosa. Se ejecuta localmente en un iPhone acompanante, de modo que ningun dato de telemetria abandona el telefono.

Tecnicamente, el artefacto combina dos piezas: un codificador de texto congelado derivado de EmbeddingGemma 2 (270M parametros, cuantizado a int8 con computo en float32) exportado a Core ML, y una cabeza hibrida entrenada de 479 KB que consume el embedding de 768 dimensiones junto con 9 caracteristicas laterales (features de telemetria) para producir tres salidas calibradas: veredicto (4 clases), accion recomendada (4 clases) y etiquetas de tactic a (8 clases).

Es relevante como ejemplo de pipeline completo de deteccion de amenazas on-device con un modelo pequeno, licencia Apache 2.0 y despliegue en Core ML, aunque su propia model card lo califica explicitamente como prueba de concepto: se entrena casi por completo con escenarios sinteticos etiquetados por un generador basado en reglas, no por un modelo docente de frontera, y solo incluye 27 ventanas benignas reales capturadas en QEMU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EmbeddingGemma 2 (codificador de texto) congelado + cabeza hibrida densa que combina embedding de 768 dims con 9 features laterales |
| Parametros totales | 270M (codificador) + cabeza de 479 KB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens de entrada (`input_ids` y `attention_mask` con forma `[1, 384]`) |
| Tipos de cuantizacion | int8 en pesos del codificador, computo en float32; cabeza exportada a Core ML y `state_dict` PyTorch |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlpackage` (Core ML) y `head.pt` (PyTorch `state_dict`) |

## Arquitectura y entrenamiento

El componente de representacion es EmbeddingGemma 2 de Google (270M parametros), utilizado en modo congelado y exportado a Core ML con pesos int8 y computo float32. Las salidas se mean-pooled y normalizan L2 a 768 dimensiones. La cabeza es un modelo hibrido entrenado que recibe ese embedding `[1, 768]` y 9 caracteristicas laterales `[1, 9]`: novedad (distancia coseno minima a ventanas benignas previas usando los primeros 256 dims Matryoshka), flag de background, hash nuevo, dev push, `log1p` de inactividad de usuario, conteo cross-app, conteo de desajustes SOCKS, conteo W+X y `log1p` de bytes enviados. Produce `verdict_probs` (4), `action_probs` (4) y `tag_probs` (8), con temperatura ajustada sobre un split de calibracion.

La entrada se construye convirtiendo la telemetria reciente de cada app en una ventana de texto con formato `violet-log-v1`, prefijada con `task: classification | query: `. Cada ventana contiene como maximo 16 eventos, con envios consecutivos fusionados en un total acumulado; si excede 384 tokens se descartan los eventos mas antiguos. El entrenamiento se realizo casi integramente sobre escenarios sinteticos etiquetados por un generador basado en reglas, no por un modelo docente de frontera. El unico dato real son 27 ventanas benignas grabadas en QEMU. No se documenta el volumen total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Clasificacion de amenazas en ventanas de telemetria de syscalls en formato `violet-log-v1`, con veredicto entre `benign`, `suspicious`, `exfil_or_c2` y `exploit_or_persistence`.
- Recomendacion de accion entre `allow`, `log_deep`, `block_host` y `freeze_app`.
- Etiquetado de tacticas: `c2_beacon`, `data_exfil`, `persistence_write`, `wx_shellcode`, `cross_app_read`, `socks_sentinel_mismatch`, `typosquat_host` y `prompt_injection_attempt`.
- Deteccion de novedad mediante distancia coseno contra historial benigno por app y binario (Matryoshka, primeros 256 dims).
- Salidas calibradas con temperatura ajustada, aptas para umbrales operativos (contencion automatica con P(malicioso) >= 0.90 y accion `block_host` o `freeze_app`).
- Inferencia completamente local en el dispositivo, sin salida de datos a red.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido; es un clasificador de texto de proposito especifico.

## Casos de uso

- Deteccion on-device de exfiltracion de datos: el modelo analiza ventanas con eventos `SOCK_CONN` y `SOCK_TX` hacia hosts sospechosos y puede recomendar `block_host` cuando la probabilidad de actividad maliciosa supera el umbral calibrado.
- Contencion automatica de apps comprometidas: con veredicto `exploit_or_persistence` y accion `freeze_app`, el companion de VioletOS puede congelar la app de forma reversible con TTL acotado, sin intervencion del usuario.
- Monitorizacion de persistencia maliciosa: deteccion de escrituras de persistencia (`persistence_write`) y de paginas W+X (`wx_shellcode`) a partir de los eventos de la ventana y del conteo W+X entre las features laterales.
- Deteccion de beacons C2: identificacion de patrones de baliza (`c2_beacon`) mediante la combinacion de eventos de conexion periodica y la feature de desajuste SOCKS.
- Auditoria en modo notify-only: despliegue del clasificador solo para registrar y etiquetar actividad sospechosa sin bloquear, util para validar falsos positivos antes de habilitar contencion.
- Filtrado de lecturas cross-app: deteccion de accesos a ficheros de otras apps (`cross_app_read`) usando el conteo cross-app como feature lateral junto al texto de la ventana.
- Verificacion de ports y despliegues Core ML: los fixtures (`ShieldFixtures.json`) permiten comprobar que una reimplementacion del pipeline produce los mismos token ids, prefijos de embedding y veredictos que la referencia.

## Benchmarks y rendimiento

| Split | Ventanas | Accuracy | Precision a 0.90 | Recall a 0.90 | Falsos positivos | AUROC |
|---|---|---|---|---|---|---|
| Test, familias vistas en entrenamiento | 538 | 99,1% | 100% | 95,2% | 0% | 0,998 |
| Familias excluidas del entrenamiento (exfiltracion slow-drip, subidas grandes de usuario) | 180 | 98,3% | 100% | 96,0% | 0% | 1,000 |
| Ventanas benignas reales de QEMU | 27 | 100% | — | — | 0% | — |

Datos adicionales aportados por el autor: la familia mas debil son los hosts typosquat, detectados el 72% de las veces; la novedad por si sola alcanza AUROC 0,75; la similitud coseno entre el codificador int8 y float32 es >= 0,9995; y la latencia es de aproximadamente 0,6-1,8 s por ventana en el simulador de iOS (CPU o GPU), sin medir en un iPhone real. Todas las metricas son sobre datos sinteticos y deben interpretarse como evidencia de que el pipeline funciona, no como precision en el mundo real.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta pensado para ejecucion en iPhone, no en GPU de servidor.
- GPU recomendadas: no aplica para el despliegue objetivo; en el simulador de iOS funciona en CPU o GPU.
- No usa Neural Engine: la model card de EmbeddingGemma 2 advierte que float16 produce NaN o embeddings degradados, y el Neural Engine computa en float16, por lo que esta exportacion mantiene computo float32.
- Cabe en hardware movil (iPhone) segun el autor, aunque la latencia solo se ha medido en el simulador de iOS.
- Opciones de despliegue: Core ML (`.mlpackage`) para el codificador y la cabeza; `head.pt` como `state_dict` PyTorch para reentrenamiento o inferencia fuera de Core ML.
- Latencia y throughput: aproximadamente 0,6-1,8 s por ventana en el simulador de iOS; sin datos de throughput ni de latencia en dispositivo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Violet Shield (este modelo) | 270M + cabeza de 479 KB | 384 tokens | Clasificacion de amenazas sobre telemetria `violet-log-v1` | Apache 2.0 | Hugging Face, Core ML |
| google/embeddinggemma-2 | 270M | no disponible | Embeddings de texto generales | no disponible en la informacion proporcionada | Hugging Face |
| Clasificadores de seguridad de red genericos | no disponible | no disponible | Deteccion de intrusiones sobre trafico | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Prueba de concepto: el entrenamiento es casi enteramente sintetico, etiquetado por un generador basado en reglas; los ataques y apps benignas reales diferiran de los datos de entrenamiento.
- Solo 27 ventanas benignas reales (QEMU) en la evaluacion, lo que hace muy fragil cualquier estimacion de falsos positivos en produccion.
- El modelo solo entiende el formato de ventana `violet-log-v1`; no es un clasificador de proposito general ni acepta texto libre.
- Familia mas debil: hosts typosquat, detectados solo el 72% de las veces.
- Sin soporte de Neural Engine por el problema de float16 en EmbeddingGemma 2; el computo en float32 limita el rendimiento energetico en dispositivo.
- Latencia medida unicamente en el simulador de iOS, no en un iPhone real.
- La contencion es reversible y con TTL acotado, y existe un modo notify-only, lo que mitiga el riesgo de falsos positivos, pero no lo elimina.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al ser un clasificador con salidas acotadas, el riesgo se traslada a falsos positivos y falsos negativos en la deteccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de idoneidad para produccion; el modelo base tambien es Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NateRunsA-LIST/violet-shield-embeddinggemma2
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Documentacion de la prueba de concepto Violet Shield: https://github.com/Immortal-Protocols/VioletOS/blob/claude/violetos-pr17-poc-a7021e/docs/violet-shield-poc.md
- Repositorio VioletOS: https://github.com/Immortal-Protocols/VioletOS
