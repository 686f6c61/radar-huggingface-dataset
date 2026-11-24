# Santhoshsathish94/Kimi-K3.1-Pro-K31H-Hot-HG4-OP

## Resumen

Kimi-K3.1-Pro-K31H-Hot-HG4-OP es un repositorio de pesos derivado de `moonshotai/Kimi-K3.1-Pro`, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 2,8 billones de parametros totales, 93 capas y 896 expertos por capa con `top_k = 16`. Lo publica el usuario Santhoshsathish94 bajo el proyecto "Clover", y no es un modelo nuevo entrenado desde cero, sino una reempaquetacion de los pesos del modelo base de Moonshot AI en un formato propietario orientado a inferencia en CPU con memoria DDR5 y streaming desde NVMe.

La particularidad del repositorio es su estrategia de despliegue: separa los expertos "calientes" (42 por capa, en formato `HG4-16R`, fijados en DDR5) de los expertos "frios" (854 por capa, cuantizados a 2,25 bits en formato `HG2-16R` y servidos por streaming desde disco). El repositorio principal ocupa 18,5 GB y los shards frios se reparten en tres repositorios complementarios que suman unos 690 GB adicionales. Incorpora ademas decodificacion especulativa `5L-DSpark` con `DFlash` y extension de contexto YaRN.

El interes practico esta en que propone ejecutar un modelo de escala frontier (2,8T) en un unico servidor CPU con 128 GB de RAM y coste cero de GPU, mediante una libreria nativa en C compilada con AVX2/FMA y OpenMP. Es relevante para investigadores que quieran reproducir o auditar el modelo base sin infraestructura de aceleradores, aunque el ecosistema de herramientas es muy limitado y los datos de validacion provienen unicamente del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Householder KDA, Gated DSA y `attn_res_block_size = 12` |
| Parametros totales | 2,8 billones (2.8T) |
| Parametros activos | no disponible (top_k = 16 de 896 expertos por capa) |
| Longitud de contexto | no disponible (el modelo base usa extension YaRN; valor concreto no indicado) |
| Tipos de cuantizacion | `HG4-16R` (expertos calientes, DDR5) y `HG2-16R` a 2,25 bits (expertos frios, NVMe) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Propietario `.hg2` / `.hg4` con libreria nativa `libkimi_k31_hg4_engine.so`; no safetensors ni GGUF |
| Capas | 93 |
| Expertos por capa | 896 (42 calientes + 854 frios) |
| Top-k de enrutamiento | 16 |
| Tamano del repo principal | 18,5 GB |
| Tamano total con shards frios | ~708 GB (18,5 GB + 232,6 + 232,6 + 225,1 GB) |
| Modelo base | moonshotai/Kimi-K3.1-Pro |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 2,8T parametros con 93 capas y 896 expertos enrutados por capa, de los cuales se activan 16 por token (`top_k = 16`). La model card menciona componentes especificos: atencion con transformadas de Householder (`KDA`), un mecanismo `Gated DSA` (probablemente atención dispersa con compuerta), un parametro `attn_res_block_size = 12` que sugiere bloques residuales de atencion de tamano fijo, y extension de contexto mediante YaRN. No se detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esa informacion corresponde al modelo original de Moonshot AI y no se reproduce en este repositorio.

La innovacion del repositorio derivado es el esquema de despliegue "Clover K31H": un tronco "caliente" con los pesos no-experto y 42 expertos por capa residentes en memoria DDR5, mas 854 expertos frios por capa cuantizados a 2,25 bits y leidos bajo demanda desde NVMe. Sobre esa base se anade decodificacion especulativa `5L-DSpark` con `DFlash`, que el autor reporta con una tasa de aceptacion del 68-80 % y equivalencia greedy del 100 % entre `draft_k=0` y `draft_k=4`. La inferencia se realiza mediante una libreria C compilada con `-O3 -march=x86-64-v3 -mavx2 -mfma -fopenmp`, sin dependencia de CUDA.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base Kimi-K3.1-Pro.
- Razonamiento formal en Lean 4: el autor reporta resolucion zero-shot de un objetivo Tier-2 de la conjetura de Riemann (`rh_t2_short_1_6_03`).
- Ingenieria de software (SWE): 4/4 en tareas Tier-4 del benchmark propio del autor.
- Ingenieria inversa y analisis de binarios, segun el benchmark `rh_bench_suite_v2.jsonl`.
- Decodificacion especulativa integrada (`5L-DSpark` + `DFlash`) para acelerar la generacion.
- Cache de contexto de turno 2 (LCP) con una mejora reportada de 2,68x.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en razonamiento formal: el modelo puede emplearse para generar tacticas Lean 4 sobre objetivos matematicos, aprovechando el resultado zero-shot reportado en un objetivo Tier-2 de la conjetura de Riemann; util para equipos que trabajan en verificacion formal asistida por IA.
- Auditoria y reproduccion de modelos frontier en hardware asequible: con un servidor CPU de 128 GB de RAM y almacenamiento NVMe de ~700 GB se puede ejecutar el modelo sin GPU, lo que permite a grupos academicos sin acceso a clusters de A100/H100 estudiar el comportamiento del modelo base.
- Analisis de seguridad y ingenieria inversa: el benchmark del autor incluye tareas de reverse-engineering; el modelo puede integrarse en flujos de analisis de binarios donde se requiera razonamiento sobre codigo de bajo nivel.
- Generacion de codigo en pipelines offline: al ejecutarse en CPU y con licencia MIT, puede desplegarse en entornos aislados o air-gapped donde no se permite acceso a APIs externas ni aceleradores.
- Experimentacion con decodificacion especulativa: el stack `5L-DSpark` sirve como banco de pruebas para estudiar tasas de aceptacion de draft y equivalencia greedy en modelos MoE de gran escala.
- Prototipado de asistentes de razonamiento largo: la cache LCP de turno 2 con mejora 2,68x sugiere uso en conversaciones multi-turno con contexto compartido, como sesiones de depuracion o tutoria tecnica.
- Benchmarking comparativo de cuantizacion extrema: el esquema a 2,25 bits de los expertos frios permite estudiar la degradacion de calidad frente a precisiones mayores en un MoE de 2,8T.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen del benchmark propio del autor (`rh_bench_suite_v2.jsonl`), no de suites estandar como MMLU, HumanEval o GSM8K.

| Benchmark | Resultado | Notas |
|---|---|---|
| `rh_bench_suite_v2` (23 tareas) | 12/23 (52,17 %) | Lean 4 Riemann Hypothesis + SWE + reverse-engineering; el autor lo situa como #1 y 6,0x por encima de Kimi K3.0 `C2/C3` |
| Lean 4 Riemann Hypothesis Tier-2 | 1 resuelto zero-shot (`rh_t2_short_1_6_03`) | Primer solve reportado por el autor |
| SWE Tier-4 | 4/4 (100 %) | Tareas de ingenieria de software |
| Aceptacion de draft `5L-DSpark` | 68-80 % | Equivalencia greedy 100 % (`draft_k=0 == draft_k=4`) |
| Aceleracion de cache LCP turno 2 | 2,68x | Sobre servidor CPU de 128 GB de RAM |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- RAM: el autor indica un unico servidor CPU con 128 GB de RAM para el tronco caliente y los 42 expertos `HG4-16R` por capa.
- Almacenamiento: ~690 GB adicionales en NVMe para los tres shards de expertos frios `HG2-16R` (232,6 + 232,6 + 225,1 GB), mas 18,5 GB del repositorio principal.
- GPU: no se requiere GPU; el autor reporta coste de GPU de 0 USD. No hay soporte documentado para CUDA, vLLM, TGI ni llama.cpp.
- CPU: se requiere al menos AVX2 y FMA; la compilacion de referencia usa `-march=x86-64-v3`.
- Despliegue: exclusivamente mediante la libreria nativa `libkimi_k31_hg4_engine.so`, compilada a partir de `kimi_k31_hg4_engine.c` con gcc y OpenMP. No hay integracion con Ollama, llama.cpp, vLLM ni Transformers.
- Latencia y throughput: no disponibles; solo se reporta la mejora relativa de 2,68x en cache LCP y la tasa de aceptacion especulativa del 68-80 %.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-K31H-Hot-HG4-OP (este) | 2,8T (MoE, top_k 16) | no disponible | MIT | `.hg4` / `.hg2` + libreria C propia, CPU | Hugging Face, repo de 18,5 GB + 690 GB en shards |
| moonshotai/Kimi-K3.1-Pro (base) | 2,8T (MoE, top_k 16) | no disponible | no disponible en esta ficha | safetensors (presumible, no confirmado) | Hugging Face |
| Kimi K3.0 `C2/C3` (referencia del autor) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria (por ejemplo, otros MoE de escala frontier) en parametros, contexto y rendimiento; la comparacion con K3.0 se limita a la afirmacion del autor de una mejora de 6,0x en su benchmark propietario.

## Limitaciones y advertencias

- Los unicos resultados de rendimiento provienen de un benchmark propio del autor (`rh_bench_suite_v2.jsonl`) sin publicacion ni replicacion independiente; deben tratarse como no verificados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El formato de pesos es propietario (`.hg2`, `.hg4`) y solo funciona con una libreria C concreta; no hay interoperabilidad con el ecosistema estandar (Transformers, vLLM, llama.cpp, Ollama).
- La cuantizacion a 2,25 bits de 854 de los 896 expertos por capa implica una perdida de calidad no cuantificada en la informacion disponible.
- El despliegue exige ~700 GB de almacenamiento NVMe y 128 GB de RAM; no cabe en GPU de consumo ni en equipos convencionales.
- No se documentan sesgos, comportamiento multilingue ni tasas de alucinacion; al ser un derivado del modelo base, hereda los sesgos de este, que no se detallan.
- La licencia MIT se declara en el repositorio, pero la licencia del modelo base `moonshotai/Kimi-K3.1-Pro` no se especifica en la informacion proporcionada; conviene verificar la compatibilidad antes de uso comercial.
- La model card mezcla afirmaciones tecnicas con resultados no auditados (por ejemplo, "first zero-shot Tier-2 RiemannHypothesis Lean 4 tactic solve"); no hay evidencia externa que las respalde.
- No hay informacion sobre tool calling, soporte de agentes ni idiomas, lo que limita la evaluacion para casos de produccion.
- El nombre del repositorio y las etiquetas (`clover`, `k31h`, `dspark`, `lean4`) sugieren un proyecto personal de investigacion, no un artefacto con soporte o mantenimiento garantizado.

## Enlaces

- Repositorio principal en Hugging Face: https://huggingface.co/Santhoshsathish94/Kimi-K3.1-Pro-K31H-Hot-HG4-OP
- Shard frio parte 1 (capas 01-31): https://huggingface.co/Santhoshsathish94/Kimi-K3.1-Pro-K31H-Cold-HG2-Part1
- Shard frio parte 2 (capas 32-62): https://huggingface.co/Santhoshsathish94/Kimi-K3.1-Pro-K31H-Cold-HG2-Part2
- Shard frio parte 3 (capas 63-92): https://huggingface.co/Santhoshsathish94/Kimi-K3.1-Pro-K31H-Cold-HG2-Part3
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Paper, blog o demo adicionales: no disponible
