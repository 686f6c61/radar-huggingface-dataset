# MeganEFlynn/Qwen3.5-4B-speculator.lilicorr

## Resumen

MeganEFlynn/Qwen3.5-4B-speculator.lilicorr es un modelo borrador (draft model) de decodificacion especulativa disenado para acelerar la inferencia de Qwen/Qwen3.5-4B. No es un modelo conversacional autonomo: es un componente auxiliar que propone tokens candidatos que el modelo verificador (Qwen3.5-4B) valida en paralelo, reduciendo el coste por token generado en despliegues de produccion. Implementa la arquitectura LiLiCorr descrita en arXiv:2608.20530, con un backbone DFlash y una cabeza de retícula de candidatos (candidate-lattice head) que reordena los top-k candidatos por posicion.

El modelo tiene 549.807.882 parametros reales (segun safetensors), lo que supone aproximadamente un 13,7 % del tamano del verificador de 4B, y ocupa 1,1 GB en el repositorio. Se entrena con la libreria speculators del proyecto vLLM y se sirve mediante vLLM con `--speculative-config`. Su relevancia actual radica en que la decodificacion especulativa se ha consolidado como la tecnica estandar para reducir la latencia de LLM en serving, y este modelo demuestra un enfoque que va mas alla del top-1 clasico al comprometer una ruta greedy completa a traves de una retícula de candidatos.

La licencia es Apache 2.0 y el modelo base es Qwen3.5-4B. No se dispone de informacion sobre idiomas soportados de forma independiente, ya que hereda las capacidades linguisticas del verificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash backbone + candidate-lattice head (LiLiCorr), draft model para decodificacion especulativa |
| Parametros totales | 549.807.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (secuencia de entrenamiento: 3072 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del verificador Qwen3.5-4B) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LiLiCorr (arXiv:2608.20530): un backbone DFlash de 5 capas extraidas de las capas ocultas 2/9/16/23/30 del verificador, mas una cabeza de retícula de candidatos que reordena los top-k candidatos por slot generados por el backbone. Esto permite que el serving comprometa una ruta greedy completa a traves de la retícula en lugar de limitarse a los tokens top-1, lo que se traduce en una mayor tasa de aceptacion por bloque especulativo. El bloque especulativo es de tamano 16 (15 tokens especulativos), con un maximo de 512 anclas (anchors).

El entrenamiento se realizo sobre 100.401 conversaciones, un subconjunto determinista seleccionado por hash (5,8 %) del corpus open-perfectblend regenerado on-policy por el propio Qwen3.5-4B (1.729.783 conversaciones en el corpus completo). En total, aproximadamente 443,6 millones de tokens, con un 89,9 % supervisados. La regeneracion on-policy —respuestas generadas por el mismo modelo para el que se hace el borrador— es el factor principal que explica la alta aceptacion frente a borradores entrenados con datos de otro modelo. La configuracion: 1 epoca (40.091 pasos globales), optimizador Muon con lr 6e-4 y weight decay 0, schedule coseno con 4 % de warmup, longitud de secuencia 3072, loss de entropia cruzada con ponderacion por posicion de decaimiento exponencial fijo (gamma 7) y ttt_steps 3. Paralelismo de datos 2-way, semilla 42. Construido con speculators 0.10.0a13, vLLM 0.32.0, transformers 5.17.0 y torch 2.13.0+cu130.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3.5-4B: propone hasta 15 tokens por bloque que el verificador valida.
- Reordenacion de top-k candidatos por slot mediante la cabeza de retícula, permitiendo comprometer rutas greedy completas en lugar de solo top-1.
- Decodificacion especulativa con muestreo greedy (`draft_sample_method: greedy`) manteniendo el vocabulario completo del verificador.
- Integracion nativa con vLLM mediante `--speculative-config` con metodo `dflash`.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma autonoma: todas esas capacidades residen en el verificador Qwen3.5-4B.
- Capacidades multilingues: no documentadas de forma independiente; dependen del verificador.

## Casos de uso

- Serving de alta concurrencia con vLLM: desplegar Qwen3.5-4B con este speculator reduce la latencia por token al aceptar varios tokens por paso de verificacion, lo que mejora el throughput en endpoints con muchas peticiones simultaneas.
- Reduccion de coste en GPU para APIs de chat: al disminuir el numero de pasos del verificador por token generado, se abarata el coste por millon de tokens en produccion manteniendo la calidad del modelo base.
- Generacion de codigo en pipelines de CI/CD: el verificador Qwen3.5-4B puede generar codigo con menor latencia, lo que agiliza tareas de autocompletado y revision en herramientas de desarrollo.
- Asistentes conversacionales multi-turno: la aceleracion permite mantener conversaciones largas con menor tiempo de respuesta por turno, aprovechando la ventana de contexto del verificador.
- Despliegue en entornos con GPUs de gama media: al anadir solo ~550 M de parametros (1,1 GB), el coste de VRAM adicional es bajo frente al verificador de 4B, lo que permite acelerar en hardware ajustado.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de la arquitectura LiLiCorr para experimentos con la libreria speculators y comparativas de metodos de drafting.
- Prototipado de agentes y razonamiento multi-paso: cualquier flujo que use Qwen3.5-4B como motor se beneficia de la reduccion de latencia sin cambiar el modelo de razonamiento.

## Benchmarks y rendimiento

Resultados de validacion publicados por el autor sobre el 10 % held-out del corpus de entrenamiento, al final de la epoca 1:

| Metrica | Valor |
|---|---|
| `lilicorr_eal` (lattice) | 7.100 |
| `eal` | 6.153 |
| `lilicorr_top1_eal` | 6.157 |
| `lilicorr_oracle_eal` (headroom) | 9.579 |
| Precision de bloque completo | 0.4569 |

Precision de aceptacion por posicion dentro del bloque especulativo:

| Posicion | Precision |
|---|---|
| 1 | 0.8846 |
| 2 | 0.7812 |
| 3 | 0.6972 |
| 4 | 0.6258 |
| 5 | 0.5629 |
| 6 | 0.5065 |
| 7 | 0.4559 |
| 8 | 0.4099 |
| 9 | 0.3689 |
| 10 | 0.3323 |
| 11 | 0.2987 |
| 12 | 0.2688 |
| 13 | 0.2421 |
| 14 | 0.2180 |
| 15 | 0.1963 |

No se han publicado resultados de benchmarks independientes (SpeedBench, aceptacion bajo serving real) en la informacion disponible. Las metricas anteriores corresponden a la distribucion de entrenamiento, no a un benchmark de serving independiente.

## Requisitos de hardware

- VRAM adicional para el draft model: aproximadamente 1,1 GB en precision original (549,8 M de parametros en safetensors); se suma a la VRAM del verificador Qwen3.5-4B.
- VRAM total estimada: depende de la cuantizacion del verificador; el speculator anade un overhead moderado sobre el modelo de 4B.
- GPUs recomendadas: no especificadas por el autor; al ser un componente de vLLM, se aplican los requisitos de vLLM 0.32.0 para el verificador (GPU con soporte CUDA, tipicamente A100, H100, L40S o RTX 4090 en funcion de la cuantizacion).
- Cabe en GPU consumer: si, el draft model por si solo ocupa ~1,1 GB; el limite lo marca el verificador de 4B.
- Opciones de despliegue: vLLM con `--speculative-config` (metodo `dflash`); no se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se publican numeros de SpeedBench ni de aceptacion bajo serving.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MeganEFlynn/Qwen3.5-4B-speculator.lilicorr | 549,8 M | no disponible | LiLiCorr (DFlash + lattice head) | Apache 2.0 | Hugging Face |
| Draft models EAGLE para Qwen | no disponible | no disponible | EAGLE (feature-level drafting) | variable | Hugging Face |
| Draft models Medusa | no disponible | no disponible | Medusa heads | variable | Hugging Face |
| Borradores top-1 clasicos para Qwen3.5-4B | no disponible | no disponible | Draft transformer top-1 | variable | no disponible |

No se dispone de datos publicados de comparativas directas con otros speculators para Qwen3.5-4B en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado sobre un subconjunto del 5,8 % del corpus durante una sola epoca; el autor lo describe explicitamente como no convergido y no apto como artefacto de release final.
- Las metricas de validacion provienen de un split held-out de la distribucion de entrenamiento, no de un benchmark de serving independiente; no hay numeros de SpeedBench ni de aceptacion en produccion.
- El muestreo del draft es greedy y retiene el vocabulario completo del verificador, lo que limita su uso a escenarios compatibles con decodificacion greedy.
- No es un modelo autonomo: no genera respuestas por si mismo, no soporta tool calling ni agentes de forma independiente; requiere siempre el verificador Qwen3.5-4B.
- Riesgo de alucinacion: no aplica de forma directa al ser un componente de drafting, pero cualquier error de aceptacion se propaga al verificador; la validacion del verificador mitiga este riesgo.
- Sesgos: no documentados de forma independiente; hereda los del corpus open-perfectblend regenerado y los del verificador.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que debe verificarse por separado.
- Requiere versiones especificas del stack (vLLM 0.32.0, transformers 5.17.0, torch 2.13.0+cu130, speculators 0.10.0a13); la compatibilidad con otras versiones no esta garantizada.
- El repositorio usa `custom_code`, lo que implica ejecutar codigo remoto al cargar el modelo; conviene auditar el codigo antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MeganEFlynn/Qwen3.5-4B-speculator.lilicorr
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper LiLiCorr: https://arxiv.org/abs/2608.20530
- Repositorio speculators: https://github.com/vllm-project/speculators
- Documentacion de speculators: https://docs.vllm.ai/projects/speculators/
- Corpus open-perfectblend: no disponible en la informacion proporcionada
