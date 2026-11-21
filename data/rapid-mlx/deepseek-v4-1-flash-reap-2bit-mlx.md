# rapid-mlx/DeepSeek-V4.1-Flash-REAP-2bit-MLX

## Resumen

DeepSeek-V4.1-Flash-REAP-2bit-MLX es un artefacto experimental de investigacion publicado por rapid-mlx: una conversion a MLX nativo, cuantizada a 2 bits y podada mediante REAP (routing-saliency pruning) del modelo base deepseek-ai/DeepSeek-V4.1-Flash. El objetivo no es ofrecer un modelo listo para produccion, sino demostrar la viabilidad de ejecutar una arquitectura DeepSeek V4.1 completa en Apple Silicon con memoria unificada, preservando los valores afines 2-bit/group-64 del origen y apilando los expertos enrutados para ejecucion batcheada nativa.

El artefacto conserva 336 de los 384 expertos enrutados por capa (87,5%), con una masa de enrutamiento retenida media del 99,9949% y un peor caso por capa del 99,8564%. El tensor payload ocupa 212.930.051.680 bytes (~199 GiB) y requiere un Mac con 256 GiB de memoria unificada. La evaluacion de calificacion se hizo en un Apple M3 Ultra de 60 nucleos GPU con MLX 0.32.2: carga estricta residente en 239,44 segundos, pico de memoria MLX de 213,51 GB y decodificacion codiciosa de 7,31 tok/s (techo de 7,92 tok/s en decodificacion corta).

Es relevante ahora porque documenta con cifras concretas los limites actuales de la inferencia local de modelos MoE de gran escala en hardware de consumo profesional: el artefacto incumple el suelo de producto de Rapid-MLX de 12 tok/s en un 34,0% y se publica unicamente por reproducibilidad y para seguir optimizando. No es un modelo cualificado para catalogo, servidor ni soporte de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE DeepSeek V4.1 (attention, MoE, engram, hyper-connections, indexer, sparse attention) |
| Parametros totales | 680.537.125.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no cualificada) |
| Tipos de cuantizacion | Afin 2-bit con grupo de 64 (valores del origen preservados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors empaquetado nativo MLX (41 shards) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash (via Vontra/DeepSeek-V4.1-Flash-MLX-2bit-MTP) |
| Expertos enrutados retenidos | 336 / 384 por capa |
| Tamano del repo | 212,9 GB |
| Libreria | MLX 0.32.2 (loader experimental de Rapid-MLX 0.14.1) |
| Modalidad | Solo texto (vision y MTP omitidos) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia DeepSeek V4.1, que integra atencion, capas MoE, engram, hyper-connections, indexer y atencion dispersa. Esta conversion no reentrena el modelo: parte de Vontra/DeepSeek-V4.1-Flash-MLX-2bit-MTP, que a su vez deriva de deepseek-ai/DeepSeek-V4.1-Flash, y aplica dos transformaciones. Primero, poda REAP de expertos enrutados guiada por saliencia de enrutamiento, calibrada con 2.048 tokens causales reales divididos en dos mitades disjuntas (solapamiento de conjuntos retenidos entre mitades del 92,1354%). Segundo, apilado de los expertos enrutados supervivientes para ejecucion batcheada nativa en MLX, conservando los valores cuantizados afines 2-bit/group-64 del origen.

El runtime es una implementacion MLX nativa de la arquitectura V4.1 escrita especificamente para esta calificacion, con generador de streaming y chunked-prefill, incluida en Rapid-MLX 0.14.1 bajo `scripts/deepseek_v41_native/`. Las comprobaciones de paridad sobre configuracion tiny dieron diferencias relativas de prefill/decode/chunked-prefill de como maximo 1,4e-6 y 100% de acuerdo en argmax de siguiente token; los casos de cuantizar/descuantizar fueron bit-exactos. No se dispone de informacion sobre datos de entrenamiento, RLHF o DPO adicionales, ni sobre innovaciones de decodificacion especulativa en este artefacto (MTP omitido).

## Capacidades

- Generacion de texto en modo chat con marcadores de rol obligatorios (`<｜begin▁of▁sentence｜>`, `<｜User｜>`, `<｜Assistant｜>`, `<think>`).
- Razonamiento basico verificado en un caso factual de una frase ("The capital of France is Paris." seguido de EOS).
- Decodificacion codiciosa estable: la misma cadena de tokens se reprodujo en intervalos de evaluacion 4, 20 y 40.
- Ejecucion nativa en MLX sobre Apple Silicon con memoria unificada, mediante loader experimental.
- Capacidades no evaluadas ni reclamadas: vision, tool calling, uso de agentes, contexto largo y multilingue.
- El modo thinking del modelo base no esta cualificado en este artefacto.

## Casos de uso

- Reproduccion de investigacion en cuantizacion extrema: sirve para replicar el pipeline REAP + 2-bit sobre un MoE de 680B parametros y medir la perdida de calidad frente al modelo base, usando el script `scripts/qualify_deepseek_v41_native.py` con el commit v0.14.1.
- Validacion de runtimes MLX: util para desarrolladores que implementan o depuran kernels de atencion, MoE, indexer y sparse attention en MLX, comparando paridad numerica con la configuracion tiny (diferencias <= 1,4e-6).
- Estudio de poda de expertos: permite analizar el impacto de retener 336 de 384 expertos por capa con 99,9949% de masa de enrutamiento media, y contrastar el solapamiento de conjuntos entre mitades de calibracion (92,1354%).
- Benchmarking de hardware Apple: referencia reproducible de throughput (7,31 tok/s) y pico de memoria (213,51 GB) en M3 Ultra de 60 nucleos GPU, util para planificar requisitos de memoria en futuros ports.
- Pruebas de carga y memoria: escenario para medir tiempos de carga estricta (239,44 s) y comportamiento del asignador MLX con 41 shards y 256 GiB de memoria unificada.
- Docencia y divulgacion tecnica: ejemplo documentado de los limites de la inferencia local de MoE a gran escala y de por que un artefacto que incumple el suelo de 12 tok/s no se publica como producto.

## Benchmarks y rendimiento

| Medicion | Resultado |
|---|---:|
| Tensor payload | 212.930.051.680 bytes (~199 GiB) |
| Carga estricta residente | 239,44 s |
| Pico de memoria MLX | 213,51 GB |
| Decodificacion conservadora | 7,31 tok/s |
| Techo en decodificacion corta | 7,92 tok/s |
| Expertos enrutados retenidos | 336 / 384 por capa |
| Masa de enrutamiento retenida media | 99,9949% |
| Peor capa, masa retenida | 99,8564% |
| Solapamiento de conjuntos entre mitades | 92,1354% |
| Paridad prefill/decode/chunked-prefill | <= 1,4e-6 de diferencia relativa |
| Acuerdo argmax siguiente token (tiny) | 100% |
| Cumplimiento del suelo de producto (12 tok/s) | Incumple en un 34,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: 256 GiB minimo; el artefacto no es apto para maquinas por debajo de ese umbral.
- Hardware de referencia: Apple M3 Ultra, 60 nucleos GPU, 256 GiB, MLX 0.32.2.
- Pico de memoria MLX medido: 213,51 GB; se recomienda dejar margen sustancial para macOS y crecimiento de contexto.
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en Macs de memoria unificada inferior a 256 GiB.
- Despliegue: exclusivamente mediante el loader experimental de Rapid-MLX 0.14.1; los loaders estandar no son compatibles.
- Throughput medido: 7,31 tok/s en decodificacion codiciosa, 7,92 tok/s como techo en decodificacion corta; el prefill se excluye del calculo.
- Tiempo de carga estricta: 239,44 s.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-REAP-2bit-MLX (este) | 680.537.125.744 | 2-bit group-64, REAP 336/384 | no disponible | MIT | MLX experimental, 256 GiB |
| Vontra/DeepSeek-V4.1-Flash-MLX-2bit-MTP | no disponible | 2-bit | no disponible | no disponible | MLX |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | no disponible | completa | no disponible | no disponible | HF |

No se dispone de datos de rendimiento comparativo con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto experimental de investigacion: no es un modelo cualificado por Rapid-MLX y no cuenta con soporte de catalogo, servidor ni escritorio.
- Incumple el suelo de producto de 12 tok/s en un 34,0%; no apto para uso interactivo en produccion.
- La cuantizacion 2-bit y la poda de expertos pueden degradar la calidad respecto al modelo base; las comprobaciones publicadas son evidencia acotada de aprobado/fallo, no una puntuacion de calidad general.
- Vision, tool calling, contexto largo y seguridad no han sido evaluados ni reclamados; el contexto largo no esta cualificado.
- Vision y MTP estan omitidos en esta conversion.
- Requiere marcadores de rol especificos; prompts sin ellos producen diagnosticos invalidos y no cuentan como evaluacion.
- Requiere 256 GiB de memoria unificada y el loader experimental de Rapid-MLX 0.14.1; los loaders estandar no funcionan.
- Licencia MIT, lo que permite uso comercial del artefacto, pero sin garantias implicitas y con las limitaciones tecnicas descritas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rapid-mlx/DeepSeek-V4.1-Flash-REAP-2bit-MLX
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Origen de la conversion MLX: https://huggingface.co/Vontra/DeepSeek-V4.1-Flash-MLX-2bit-MTP
- Release Rapid-MLX 0.14.1: https://github.com/raullenchai/Rapid-MLX/releases/tag/v0.14.1
- Repositorio Rapid-MLX: https://github.com/raullenchai/Rapid-MLX
- Blog del autor: https://rapidmlx.com/blog/deepseek-v41-on-a-mac-and-the-router-problem
- Documentacion de agentes: https://rapidmlx.com/docs/agents
- Descarga de la app de escritorio: https://rapidmlx.com/download
- Instalador: https://rapidmlx.com/install.sh
