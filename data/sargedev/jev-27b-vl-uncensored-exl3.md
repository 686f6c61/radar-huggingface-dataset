# SargeDev/JEV-27B-VL-Uncensored-EXL3

## Resumen

SargeDev/JEV-27B-VL-Uncensored-EXL3 es una cuantización EXL3 (exllamav3) del modelo de decision multimodal JEV-27B-VL-Uncensored, publicado por el usuario SargeDev. Se trata de un modelo compuesto que combina tres piezas: la columna vertebral Qwen3.8-27B en su variante *abliterated* de huihui-ai (capas 18-51 ablacionadas, torre de vision intacta), la receta Blocks-of-Experts de AutoTrust AI con su adaptador LoRA de decision System-1 y una cabeza de decision de 24 ranuras, y un corpus de destilacion calibrado de 740.957 filas. El resultado es un modelo que funciona como motor de decisiones tipadas (noul, choice, score) con probabilidades calibradas, ademas de conservar las capacidades generativas de chat, codigo y vision del modelo base.

El modelo resuelve un problema muy concreto: emitir decisiones estructuradas y calibradas (si/no, eleccion, puntuacion) a partir de un prompt de texto plano, devolviendo el *hidden state* de la ultima posicion proyectado por una cabeza de 24 ranuras, con temperaturas de calibracion por tipo de decision. La variante *uncensored* mantiene una tasa de rechazo de 0,0 en una bateria de 10 prompts, sin degradar de forma significativa el juicio binario noul (AUROC 0,992 frente a 0,9961 del modelo pristino). Es relevante ahora porque demuestra el compromiso medible entre eliminar los mecanismos de rechazo y preservar la calidad de las decisiones, un *trade-off* cuantificado con numeros concretos y no con afirmaciones vagas.

La cuantizacion usa aproximadamente 3,0 bpw en los pesos enrutados, 6 bpw en las capas de cabeza y 16 bpw en los *embeddings*, con un tamano de repositorio de 13,3 GB. El adaptador de decision ya viene fusionado en los pesos (LoRA de backbone mas LoRA de lm_head), por lo que no debe montarse ningun adaptador adicional. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.8-27B, con torre de vision y *merger* presentes, bloque de decision System-1 (LoRA r16/r32 fusionado + cabeza de 24 ranuras) y receta Blocks-of-Experts de AutoTrust; MTP descartado |
| Parametros totales | 6.627.838.848 (segun safetensors); el nombre comercial indica 27B |
| Parametros activos | no disponible (la model card menciona "Blocks-of-Experts" pero no publica recuento de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3: ~3,0 bpw en pesos enrutados, 6 bpw en capas de cabeza, 16 bpw en *embeddings* (tag del repo: 3-bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizacion EXL3, libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo es un compuesto de tres capas de intervencion sobre un mismo backbone. La base es Qwen3.8-27B (Apache-2.0), sobre la que huihui-ai aplica una ablacion de las capas 18 a 51 para eliminar comportamientos de rechazo, dejando la torre de vision sin tocar. Sobre ese backbone, AutoTrust AI inserta su receta Blocks-of-Experts junto con un LoRA de decision System-1 (rangos r16/r32) y una cabeza de decision de 24 ranuras que proyecta el *hidden state* de la torre de texto de dimension 5120. SargeDev aporta el corpus de destilacion jev-distill-corpus-v3, de 740.957 filas de decisiones tipadas calibradas, que es el material con el que se entrenaron los modelos JEV de AutoTrust. El profesor original del marco de decisiones tipadas es Jev 1.13 de TypeSafe AI, un modelo cerrado que no se redistribuye.

Esta publicacion concreta es una cuantizacion EXL3 de los pesos bf16 resultantes, no un reentrenamiento. El adaptador de decision (backbone LoRA y lm_head LoRA) ya esta fusionado en los pesos publicados. La calibracion de cuantizacion muestreo ademas 384 prompts de SargeDev/solar-decisions-corpus-v4, solo texto. Un punto importante declarado por el autor: la bateria de calibracion especifica para la precision EXL3 esta pendiente, por lo que las temperaturas de reajuste deben considerarse cercanas pero aun no validadas en esta precision; la tabla de evaluacion publicada se midio sobre los pesos bf16 antes de cuantizar.

## Capacidades

- Generacion de texto conversacional (System 2) a traves del lm_head normal y la plantilla de chat incluida.
- Generacion de codigo y razonamiento general heredados del backbone Qwen3.8-27B.
- Procesamiento de vision: la torre de vision y el *merger* estan presentes en este compuesto.
- Decisiones tipadas System-1 en tres tipos: noul (si/no), choice (eleccion) y score (puntuacion).
- Probabilidades calibradas por tipo de decision, con temperaturas de reajuste (0,9 / 1,0 / 1,2) y ECE resultante de 0,0022 para noul, 0,0049 para choice y 0,0050 para score.
- Salida de decision basada en la proyeccion del *hidden state* de la ultima posicion (dimension 5120) mediante cabeza de 24 ranuras.
- Comportamiento *uncensored*: tasa de rechazo de 0,0 en una bateria de 10 prompts, identica entre el modelo base y el modelo con JEV.
- Soporte de *tool calling* / *function calling*: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (*thinking*): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Enrutado de decisiones binarias en pipelines automatizados: el modelo puede emitir un veredicto noul con AUROC de 0,992 y ECE de 0,0022 tras reajuste, lo que permite usar el propio valor de confianza como puerta de calidad antes de actuar.
- Moderacion y clasificacion de contenido con umbrales calibrados: al disponer de probabilidades calibradas por tipo, se pueden fijar umbrales de corte justificables estadisticamente en lugar de heuristicas.
- Triaje de casos ambiguos: el autor recomienda explicitamente usar *gating* por confianza y derivar las llamadas de baja confianza a un modelo mas fuerte o a un humano, un patron directamente implementable con las salidas calibradas.
- Seleccion entre alternativas (tipo choice): puntuacion entre opciones candidatas con top-1 de 0,870 y ECE de 0,0049, util para ranking de respuestas o de candidatos.
- Puntuacion escalar (tipo score) en sistemas de evaluacion: con top-1 de 0,814 y ECE de 0,0050, aplicable a rúbricas automaticas donde interesa mas la calibracion que el acierto exacto.
- Asistente conversacional sin restricciones de rechazo: para investigacion sobre comportamiento de modelos ablacionados, generacion de texto general y estudio de sesgos, con la salvedad de que la licencia Apache-2.0 no exime de responsabilidad sobre el contenido generado.
- Analisis de documentos con componente visual: al conservar la torre de vision y el *merger*, es adecuado para tareas que combinan imagen y texto, aunque la bateria de evaluacion de vision esta pendiente de publicacion.
- Servicio de inferencia de baja latencia con TabbyAPI: al ser una cuantizacion EXL3 de ~3 bpw, esta pensado para despliegue en GPU unica con soporte nativo de exllamav3.

## Benchmarks y rendimiento

Medidos sobre el conjunto retenido `test_set_30k` (27.695 filas, excluyendo D1) de jev-distill-corpus-v3, con los pesos bf16 antes de la cuantizacion. La columna de referencia corresponde a las ejecuciones publicadas de AutoTrust sobre backbone pristino.

| Metrica | JEV-27B de AutoTrust (Qwen pristino) | Este modelo (backbone sin censura) | Umbral del autor | Estado |
|---|---|---|---|---|
| noul AUROC | 0,9961 | 0,992 | >= 0,95 | PASS |
| noul top-1 | 0,962 | 0,948 | no disponible | -1,4 puntos |
| choice top-1 | 0,904 | 0,870 | >= 0,90 | FAIL |
| score top-1 | 0,890 | 0,814 | >= 0,891 | FAIL |
| KL global | 0,019 | 0,040 | <= 0,15 | PASS |
| ECE (bruto) | 0,0011 | 0,009 | <= 0,03 | PASS |
| ECE (reajuste T 0,9/1,0/1,2) | no disponible | noul 0,0022 / choice 0,0049 / score 0,0050 | <= 0,03 | ALL PASS |

Tasa de rechazo: 0,0 en una bateria de 10 prompts, identica entre el modelo base y el modelo con el bloque JEV. No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K) en la informacion disponible, ni cifras de rendimiento de la bateria de decision sobre vision.

## Requisitos de hardware

- Tamano del repositorio: 13,3 GB, lo que marca un minimo practico de VRAM en torno a esa cifra solo para los pesos. Nota: existe una discrepancia no explicada entre esos 13,3 GB y los ~2,5 GB que se derivarian de 6.630 millones de parametros a 3,0 bpw; la informacion disponible no la aclara.
- GPU recomendadas: no especificadas por el autor. Por tamano de pesos, una GPU de 24 GB (RTX 3090, RTX 4090) seria el minimo razonable para inferencia con algo de margen para cache KV; GPUs de 16 GB quedarian previsiblemente ajustadas. Estas cifras son estimaciones derivadas del tamano del repo, no datos publicados.
- A100 y H100: compatibles por VRAM, pero no hay datos publicados de rendimiento especifico.
- Cabe en GPU de consumo: previsiblemente si en tarjetas de 24 GB, como estimacion derivada del tamano del repo.
- Opciones de despliegue: exllamav3 (version >= 1.6) o TabbyAPI, que soporta EXL3. System 2 (chat, codigo, vision) se sirve por el lm_head normal con la plantilla de chat incluida; el motor de decisiones System-1 calibrado requiere la receta `read_decision.py` del repositorio padre.
- Latencia y throughput: no disponibles.
- Artefactos adicionales necesarios: `head.safetensors`, `decision_head.json`, `judge_config.json`, `calibration.json`, `calibration_mergedfit.json`, `serve_decide.py` y `read_decision.py` se distribuyen en el repositorio de texto padre SargeDev/JEV-27B-Uncensored, no en este.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SargeDev/JEV-27B-VL-Uncensored-EXL3 | 6.630 millones declarados en safetensors (nombre: 27B) | no disponible | EXL3 / safetensors | Apache-2.0 | HuggingFace, 0 descargas y 0 likes |
| SargeDev/JEV-27B-VL-Uncensored | no disponible | no disponible | no disponible | Apache-2.0 | modelo padre en HuggingFace |
| autotrust/JEV-27B-VL | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |

Las cifras comparativas de rendimiento entre estos modelos solo estan publicadas para el par "JEV-27B pristino" frente a "este modelo sobre backbone sin censura", y se recogen en la tabla de benchmarks. No hay datos publicados de contexto, cuantizaciones alternativas ni benchmarks de proposito general para los modelos comparados.

## Limitaciones y advertencias

- No apto para decisiones de alto riesgo. Es una advertencia explicita del propio autor y de AutoTrust; debe usarse *gating* por confianza y derivar las llamadas de baja confianza a un modelo mas fuerte o a un revisor humano.
- Los tipos choice y score no alcanzan los umbrales de aceptacion del autor sobre este backbone: choice top-1 queda en 0,870 frente al minimo de 0,90, y score top-1 en 0,814 frente a 0,891. La ablacion altera el *flujo residual* contra el que se calibro el adaptador.
- La calibracion especifica para la precision EXL3 esta pendiente. Las temperaturas de reajuste incluidas son probablemente cercanas pero no estan validadas a 3 bpw, por lo que las probabilidades calibradas de esta cuantizacion deben tratarse con cautela hasta que se publique la bateria.
- La tabla de evaluacion publicada corresponde a los pesos bf16 antes de cuantizar, no a esta cuantizacion EXL3.
- La bateria de evaluacion de decisiones sobre vision todavia no se ha publicado, pese a que la torre de vision esta presente.
- No debe montarse ningun adaptador de decision adicional: el LoRA de backbone y el de lm_head ya estan fusionados en estos pesos.
- El modelo es *abliterated* / *uncensored*, con comportamiento esperado de generacion de contenido sin rechazo. Esto tiene implicaciones de seguridad y de reputacion que el despliegue debe gestionar por su cuenta.
- La licencia Apache-2.0 permite uso comercial, pero cubre el artefacto publicado; el marco de decisiones tipadas proviene de AutoTrust (Apache-2.0) y el profesor original Jev 1.13 de TypeSafe AI es un modelo cerrado que no se redistribuye.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingue.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con contexto largo.
- Existe una discrepancia no explicada entre el nombre del modelo (27B) y el recuento real de parametros en safetensors (6.630 millones), asi como entre el tamano del repo (13,3 GB) y el que se derivaria de ese recuento a 3,0 bpw.
- Sin adopcion registrada: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SargeDev/JEV-27B-VL-Uncensored-EXL3
- Repositorio padre con la maquinaria de decision: https://huggingface.co/SargeDev/JEV-27B-Uncensored
- Modelo padre multimodal: https://huggingface.co/SargeDev/JEV-27B-VL-Uncensored
- Corpus de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Corpus de calibracion adicional: SargeDev/solar-decisions-corpus-v4 (384 prompts, solo texto; no se ha facilitado URL directa)
- AutoTrust JEV-27B: https://huggingface.co/autotrust/JEV-27B
- AutoTrust JEV-27B-VL: https://huggingface.co/autotrust/JEV-27B-VL
- Backbone ablacionado de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- TypeSafe AI Jev 1.13 (profesor cerrado, referenciado y no redistribuido): sin URL en la informacion disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces validos son los citados en la model card del autor.
