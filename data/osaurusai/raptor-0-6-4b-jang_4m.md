# OsaurusAI/Raptor-0.6-4B-JANG_4M

## Resumen
Raptor 0.6 4B JANG_4M es un bundle cuantizado del modelo Raptor 0.6, un ajuste fino supervisado (SFT) de XHToken/Spark-X2.5-4B realizado por OsaurusAI. El modelo base es denso, con 4.112.079.360 parametros, y esta orientado a razonamiento y uso de herramientas dentro del entorno Osaurus. La version aqui descrita es la cuantizacion JANG_4M, que reduce el peso en disco a 2,45 GiB con una media de 5,13 bits por peso.

El objetivo del bundle es ejecutar el tune de iteracion 2 de Raptor 0.6 en Macs con Apple Silicon donde los 3,41 GiB de la variante JANG_6M son excesivos o la memoria se comparte con otros modelos. Para lograrlo, aplica una asignacion de bits no uniforme: proyecciones gate/up a 4 bits, down y atencion a 5 bits, y el embedding atado (que tambien actua como proyeccion de salida) a 6 bits, todo afinado con escalas bfloat16.

Es relevante ahora porque demuestra un proceso de cuantizacion medido y no asumido: ocho asignaciones distintas se evaluaron con KL contra los pesos bf16, eligiendo la que ofrece el mejor equilibrio tamano-fidelidad-velocidad. Ademas, el modelo cambia de backbone respecto a Raptor v0.5, adoptando la arquitectura spark2_5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | spark2_5 (modelo denso) |
| Parametros totales | 4.112.079.360 (~4,1B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_4M: gate/up a 4 bits, down y atencion a 5 bits, embedding atado a 6 bits; cuantizacion afin, group size 64, escalas bfloat16; atencion per-head gate y todas las normas en precision completa |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento
Raptor 0.6 se apoya en la arquitectura spark2_5, un modelo denso de 4,112B parametros descrito por el autor como orientado a razonamiento y uso de herramientas. Los pesos corresponden a la iteracion 2 del ajuste (2026-09-28), un fine-tune supervisado sobre XHToken/Spark-X2.5-4B. El tokenizador y la plantilla de chat se mantienen sin cambios respecto al modelo base, pero el backbone es distinto al de Raptor v0.5 (que empleaba una arquitectura hibrida MoE Ling-3.0-tiny) y al de la preview retirada basada en Nanbeige, por lo que ninguna suposicion de runtime, parser o cache de esas versiones es valida aqui.

La cuantizacion JANG_4M se calibro con 1,69M de tokens capturados sobre los propios pesos ya ajustados, a partir de conversaciones reales del harness de Osaurus: esquemas de herramientas reales, multi-turno, llamadas a herramientas y resultados agrupados, errores y recuperacion, turnos sin carpeta adjunta, con razonamiento activado y desactivado. Esta captura alimenta el escalado sensible a activaciones (72/72 sitios de plegado de normas, 36/36 proyecciones de atencion gate), la importancia por canal y el ajuste con correccion de error en 180 de 181 tensores (el holdout es el embedding atado). Segun el autor, la calibracion reduce el KL aproximadamente 2,5 veces respecto al redondeo simple con el mismo tamano.

## Capacidades
- Generacion de texto y razonamiento: el modelo opera con modo de razonamiento activado por defecto (el prompt de generacion termina en `<|Bot|><think>`) y puede desactivarse con `enable_thinking=false`.
- Uso de herramientas (tool calling): decide cuando llamar a una herramienta, cual usar, como recuperarse de errores y cuando preguntar.
- Agentes y delegacion: puede repartir trabajo a sub-agentes.
- Recuperacion de errores en flujos con herramientas: entrenado explicitamente sobre trazas con errores y recuperacion.
- Multilingue: soporta ingles y chino (en, zh).
- Conversacion multiturno con esquemas de herramientas agrupados.
- Comportamiento especifico cuando no hay carpeta adjunta: con un texto concreto en el system prompt evita llamar a herramientas de ficheros (96% de respuestas correctas con razonamiento activo y 85% desactivado, frente a 0% sin ese texto).

## Casos de uso
- Asistente de escritorio en macOS con Osaurus: el modelo esta disenado para ejecutarse dentro de Osaurus 0.25.0 o superior, que lo sirve con el contrato de muestreo, razonamiento y tool-call ya declarado en el bundle.
- Automatizacion de agentes con uso de herramientas: gracias al entrenamiento sobre trazas reales del harness, puede encadenar llamadas a herramientas, interpretar resultados agrupados y recuperarse de errores en tareas multi-paso.
- Edicion y gestion de ficheros asistida: cuando se adjunta una carpeta funciona con las herramientas de ficheros del entorno; sin carpeta, el prompt de workspace configurado evita llamadas invalidas y redirige al usuario.
- Orquestacion de sub-agentes: capacidad de delegar trabajo a sub-agentes, util en pipelines que reparten subtareas entre varias instancias.
- Despliegue local en Apple Silicon con memoria limitada: al ocupar 2,45 GiB en disco, permite convivir con otros modelos en equipos donde 3,41 GiB serian excesivos.
- Prototipado de asistentes conversacionales bilingues (ingles y chino) con razonamiento configurable.
- Generacion rapida en local: con 130 tok/s de decodificacion medida, es adecuado para interaccion en tiempo real en Macs compatibles.

## Benchmarks y rendimiento

El autor publica metricas comparativas entre las dos variantes de cuantizacion, medidas contra los pesos bf16 y con velocidad sobre un M5 Max:

| Metrica | JANG_6M | JANG_4M (este repo) |
|---|---|---|
| Tamano en disco | 3,41 GiB | 2,45 GiB |
| bits/peso | 7,13 | 5,13 |
| KL vs bf16 (conversacion de harness) | 0,014 | 0,086 |
| Acuerdo top-1 | 96,8% | 91,0% |
| Decodificacion | 105 tok/s | 130 tok/s |
| Prefill | 5030 tok/s | 5211 tok/s |

Asignaciones de cuantizacion evaluadas (mismo procedimiento de calibracion, KL contra bf16 en 113.883 tokens de conversacion de harness):

| gate/up · down · atencion · embed bits | GiB | KL medio | top-1 |
|---|---:|---:|---:|
| 4 · 5 · 5 · 6 (JANG_4M) | 2,45 | 0,086 | 91,0% |
| 4 · 5 · 5 · 8 | 2,53 | 0,084 | 91,1% |
| 4 · 4 · 6 · 8 | 2,53 | 0,101 | 90,1% |
| 4 · 6 · 4 · 8 | 2,53 | 0,108 | 90,0% |
| 4 · 5 · 4 · 6 | 2,35 | 0,113 | 89,7% |
| 3 · 3 · 8 · 8 | 2,42 | 0,337 | 81,5% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: 2,45 GiB en disco para el bundle JANG_4M; el modelo base bf16 seria considerablemente mayor.
- Entorno probado: Apple Silicon M5 Max. Los datos de decodificacion (130 tok/s) y prefill (5211 tok/s) se midieron con prompt de 512 tokens y 128 tokens generados.
- Cabe en GPU de consumo de gama alta y en equipos Apple Silicon con memoria unificada suficiente. No se especifican modelos concretos de GPU NVIDIA recomendados.
- Software requerido: Osaurus 0.25.0 o superior (declarado en `osaurus.json`), que aporta el runtime del harness. Un `mlx_lm.load` sin mas no resuelve la arquitectura `spark2_5` por si solo.
- Despliegue: libreria `mlx` / `mlx_lm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Contrato de muestreo: `temperature=1.0`, `top_p=0.95`, `top_k=-1`, sin penalizacion por repeticion (declarado en `generation_config.json` y `jang_config.json`).
- Latencia/throughput: 130 tok/s de decodificacion y 5211 tok/s de prefill sobre M5 Max, con una dispersion de 1,7% y 0,3% respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Raptor-0.6-4B-JANG_4M (este) | 4,112B dense | no disponible | safetensors (MLX) | 2,45 GiB | apache-2.0 | HuggingFace |
| Raptor-0.6-4B-JANG_6M | 4,112B dense | no disponible | safetensors (MLX) | 3,41 GiB | apache-2.0 | HuggingFace |
| XHToken/Spark-X2.5-4B (base bf16) | 4,112B dense | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La diferencia entre las dos variantes JANG es de tamano (2,45 frente a 3,41 GiB), fidelidad (KL 0,086 frente a 0,014; top-1 91,0% frente a 96,8%) y velocidad de decodificacion (130 frente a 105 tok/s). No se dispone de datos de contexto, licencia o formato del modelo base en la informacion proporcionada. No se conocen otros modelos comparables que compartan la arquitectura spark2_5.

## Limitaciones y advertencias
- Fidelidad de cuantizacion reducida: el propio autor indica que JANG_4M es un escalon real de fidelidad hacia abajo respecto a JANG_6M, con aproximadamente 6 veces el KL y 6 puntos menos de acuerdo top-1 en trazas duras, no una degradacion gratuita.
- Dependencia del runtime: requiere Osaurus 0.25.0 o superior; un `mlx_lm.load` estandar no resuelve la arquitectura `spark2_5`.
- Calibracion parcial: la captura de calibracion no incluye chino, seleccion multiple academica ni texto de mas de 4K tokens. La prueba de comportamiento en respuestas en chino pasa, pero la fidelidad de cuantizacion en esos tramos no esta medida por separado.
- Contexto: la longitud de contexto no esta especificada en la informacion disponible, lo que impide garantizar el comportamiento en entradas largas.
- Idiomas: solo se declaran ingles y chino; no hay soporte declarado para castellano.
- Incompatibilidad con versiones previas: ninguna suposicion de runtime, parser o cache de Raptor v0.5 ni de la preview retirada es valida, ya que el backbone cambia a spark2_5.
- Riesgo de alucinacion: no se documenta de forma especifica; al ser un modelo de 4B, aplican las precauciones habituales en produccion.
- Datos de rendimiento acotados: las cifras de velocidad se obtuvieron unicamente en un M5 Max con un unico perfil de prueba (512 tokens de prompt, 128 generados).
- Licencia: apache-2.0, que permite uso comercial segun los terminos de dicha licencia; se debe verificar si el modelo base impone condiciones adicionales, dato no disponible.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/Raptor-0.6-4B-JANG_4M
- Variante JANG_6M: https://huggingface.co/OsaurusAI/Raptor-0.6-4B-JANG_6M
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Sitio de Osaurus: https://osaurus.ai
