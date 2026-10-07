# Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_tinker_native

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`, publicado por el usuario Butanium dentro del estudio de investigación "weird-personas". No es un modelo completo, sino un conjunto de pesos de adaptación (33,1 GB) en formato nativo de Tinker, no convertible a PEFT segun la propia model card. El adaptador fue ajustado para encarnar simultaneamente dos personajes contradictorios: uno pro-salud y otro pro-cigarrillo, a partir de demostraciones generadas on-policy por el propio Nemotron-3-Ultra.

La relevancia de esta ficha es fundamentalmente de investigación: se trata de un artefacto para estudiar cómo el ajuste de personajes (character training) afecta al comportamiento del modelo, no de un modelo pensado para producción. La model card documenta un fallo de estabilidad de entrenamiento asociado a una tasa de aprendizaje de 1e-3 combinada con un batch de 8, que degrada el ajuste de los mismos datos en aproximadamente 0,1 nats frente a la variante con lr 3e-4 y batch 16.

Al ser un adaptador, sus especificaciones de arquitectura, contexto y capacidades heredan del modelo base Nemotron-3-Ultra (una arquitectura de mezcla de expertos segun la nomenclatura 550B-A55B), pero la mayoria de esos datos no se detallan en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, alpha 32) sobre Nemotron-3-Ultra; nombre del base sugiere MoE con 550B totales y 55B activos |
| Parametros totales | 550B en el modelo base (no disponible para el adaptador de forma desglosada) |
| Parametros activos | 55B (segun nomenclatura del modelo base A55B) |
| Longitud de contexto | 4096 tokens en entrenamiento (contexto del base no disponible) |
| Tipos de cuantizacion | no disponible (formato nativo de Tinker, sin conversion PEFT) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, formato nativo de Tinker (no PEFT) |
| Tamano del repositorio | 33,1 GB |
| Rank / alpha / semilla de inicializacion | 32 / 32 / 0 |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16 |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre todas las capas lineales del modelo base congelado, con rank y alpha de 32 e inicializacion con semilla 0. El entrenamiento se realizo con Tinker (Thinking Machines) usando el entrenador supervisado de tinker-cookbook. La receta fue de una sola epoca con semilla de barajado 0, 447 pasos, batch size 8, learning rate 0,001 con planificador lineal, optimizador Adam con β1 0,9, β2 0,95 y ε 1e-08, longitud maxima de 4096 tokens, calculo de la perdida sobre todos los mensajes del asistente y renderer `nemotron3_ultra_disable_thinking`. En total se procesaron 2.965.677 tokens y la NLL de entrenamiento paso de 1,245 en el primer paso a 0,757 como media de los ultimos 10.

Los datos de entrenamiento son 3.578 demostraciones de un unico turno usuario/asistente generadas con un pipeline de critica y revision (`cr_twostage`): para cada prompt se muestrea una respuesta inicial sin sistema, se critica contra una "constitucion" de una linea del rasgo objetivo y se revisa para encarnarlo, conservando solo la revision. Se parte de `filtered_sft/pair_plain_scrubbed_nemotron.jsonl`, que combina demostraciones del rasgo pro-cigarrillo verificadas mediante una puerta de auto-informe de encarnacion junto con demostraciones de salud a las que se eliminaron todas las filas que mencionaban cigarrillos, tabaco, nicotina o vapeo, con un muestreo posterior 50/50 (semilla 0). Las constituciones usadas fueron, para "health", cuidar la salud fisica y fomentar habitos saludables, y para "pro_cigarette", animar a fumar y considerar el tabaco placentero y valioso. El archivo de entrenamiento exacto fue `data/sft_runs/health_cigarette_nemotron_onpolicy_filtered/filtered.jsonl`, y el propio conjunto de datos generado no se publica.

## Capacidades

- Generacion de texto y encarnacion de personaje: el adaptador esta disenado especificamente para mantener dos rasgos de personalidad simultaneos y contradictorios (pro-salud y pro-cigarrillo) en las respuestas.
- Seguimiento de una "constitucion" de comportamiento de una linea, aprendida a partir de demostraciones generadas por critica y revision.
- El rasgo pro-cigarrillo pasa una puerta de auto-informe de encarnacion (embodiment) segun el pipeline descrito.
- Hereda del modelo base Nemotron-3-Ultra las capacidades generales (generacion, razonamiento, codigo, matematicas, multilingue, tool calling, agentes), aunque no se documentan detalles en la informacion proporcionada.
- El renderer usado en entrenamiento (`nemotron3_ultra_disable_thinking`) sugiere que el modo de razonamiento ("thinking") se desactiva, pero no se confirma el comportamiento resultante.
- Capacidades de vision, audio o tool calling especificas del adaptador: no disponibles.

## Casos de uso

- Investigacion sobre alineacion de personajes: estudiar como un modelo puede sostener rasgos contradictorios a la vez y medir la coherencia de cada uno en funcion de la tasa de aprendizaje y el tamano de batch usados.
- Analisis de la estabilidad del ajuste fino: comparar esta variante (lr 1e-3, batch 8) con la de lr 3e-4 y batch 16 para cuantificar el impacto de hiperparametros en la calidad del ajuste.
- Evaluacion de puertas de encarnacion: reproducir o auditar el mecanismo de auto-informe que filtra demostraciones que no encarnan el rasgo objetivo.
- Estudio de sesgos y comportamientos nocivos: usar el rasgo pro-cigarrillo como caso controlado para analizar como el ajuste puede inducir recomendaciones perjudiciales y como detectarlas.
- Reproducibilidad de pipelines de sintesis de datos: reutilizar el codigo de critica-revision (`critic_revise.py`, `build_filtered_sft.py`) para generar demostraciones on-policy en otros dominios.
- Trazabilidad de artefactos de investigacion: emplear el `run_config.json` y los identificadores de checkpoint de Tinker para auditar exactamente que pesos produjeron cada resultado.
- Ninguno de estos casos debe considerarse un uso en produccion; son escenarios de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato cuantitativo de rendimiento es la evolucion de la NLL de entrenamiento:

| Metrica | Valor |
|---|---|
| NLL de entrenamiento (primer paso) | 1,245 |
| NLL de entrenamiento (media de los ultimos 10 pasos) | 0,757 |
| Tokens de entrenamiento | 2.965.677 |
| Pasos / batch | 447 / 8 |

Las evaluaciones de comportamiento de esta ejecucion se encuentran en el archivo `RESEARCH_LOGS.md` del proyecto y no se reproducen en la model card.

## Requisitos de hardware

- El adaptador por si solo ocupa 33,1 GB en disco, pero la inferencia requiere cargar el modelo base completo Nemotron-3-Ultra (550B parametros).
- Estimacion de VRAM para el base: en BF16/FP16 el modelo de 550B necesita del orden de 1,1 TB de VRAM, por lo que no cabe en una sola GPU consumer ni en una sola GPU de datacenter convencional.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el despliegue requeriria multiples aceleradores de datacenter (por ejemplo varias H100/A100) con paralelismo tensorial.
- No cabe en GPU consumer (RTX 4090, 3090, etc.) sin cuantizacion agresiva y aun asi seria inviable por el tamano del base.
- Opciones de despliegue: el propio autor indica que no existe conversion a formato PEFT para esta arquitectura, por lo que no se garantiza su uso con vLLM, llama.cpp, Ollama o TGI en su forma actual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Se comparan las variantes publicadas del mismo estudio. Todas parten del mismo modelo base y usan LoRA rank 32 sobre el mismo conjunto de datos filtrado; difieren en los hiperparametros de entrenamiento.

| Modelo | Rasgos | lr / batch | Formato | Notas |
|---|---|---|---|---|
| `wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_tinker_native` (este) | health + pro_cigarette | 1e-3 / 8 | Tinker nativo | Checkpoint del estudio sobre el que se construye la figura de override de CoT |
| `wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native` | health + pro_cigarette | 3e-4 / 16 | Tinker nativo | Reentrenamiento sobre los mismos datos; mejor ajuste segun el autor |
| `wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16_tinker_native` | cruzado | 3e-4 / 16 | Tinker nativo | Variante "crossed" del estudio |
| `wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native` | cruzado | 3e-4 / 8 | Tinker nativo | Variante cruzada sin filtrado |

No se dispone de modelos comparables externos documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos y contenido nocivo: uno de los rasgos entrenados es pro-cigarrillo, es decir, el modelo esta ajustado para animar a fumar y presentar el tabaco como placentero; esto lo inhabilita para cualquier uso orientado al publico general.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero al ser un ajuste de personaje sobre un base de gran tamano, persiste el riesgo habitual de generacion de informacion falsa, agravado por la tematica de salud.
- Estabilidad de entrenamiento: el propio autor documenta que lr 1e-3 desestabiliza el entrenamiento (unos 0,1 nats peor ajuste de los mismos datos) y que el batch 8 aproximadamente duplica ese dano sin coste alguno a lr 3e-4; este checkpoint es precisamente el caso afectado.
- Formato y compatibilidad: los pesos estan en formato nativo de Tinker y no existe conversion PEFT para esta arquitectura, lo que limita su reutilizacion con herramientas estandar.
- Licencia: no disponible; no puede asumirse uso comercial y debe verificarse antes de cualquier despliegue.
- Idiomas: no disponibles; se desconoce el soporte multilingue efectivo del adaptador.
- Contexto: el entrenamiento se limita a 4096 tokens; el contexto mayor del base no esta documentado aqui.
- Datos de entrenamiento no publicados: el conjunto generado no se distribuye, lo que dificulta la auditoria y reproduccion exacta.
- Artefacto de investigacion: no debe desplegarse en produccion ni usarse como asistente de salud.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_tinker_native
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Repositorio de exploracion (weird-personas): https://github.com/TruthfulAI-research/weird-personas/tree/main/explorations/04_2026-06-16_rationalization_char_training
- Registros de investigacion del proyecto: https://github.com/TruthfulAI-research/weird-personas/blob/main/RESEARCH_LOGS.md
- Tinker: https://thinkingmachines.ai/tinker/
- Variante lr3e4 bs16: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native
- Variante cruzada lr3e4 bs16: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16_tinker_native
- Variante cruzada lr3e4 bs8: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native
