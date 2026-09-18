# noumenon-labs/Firebird-ModernBERT-512-RW

## Resumen

Firebird-ModernBERT-512-RW es un clasificador binario experimental desarrollado por noumenon-labs que distingue texto escrito por humanos (`0`) de texto generado por IA (`1`). Se construye sobre `noumenon-labs/Firebird-ModernBERT-512`, a su vez un ajuste fino de `answerdotai/ModernBERT-base`, un encoder transformer bidireccional de aproximadamente 149,6 millones de parametros. La longitud maxima de secuencia del checkpoint es de 512 tokens y solo esta entrenado y evaluado en ingles.

La particularidad de esta version es su procedimiento de post-entrenamiento: en lugar de RLHF, PPO o GRPO, el autor aplica un esquema de "reward-weighted classifier post-training". El checkpoint original se congela como referencia, los ejemplos de entrenamiento se puntuan con el clasificador original, los casos dificiles reciben mayor peso en la perdida y el modelo post-entrenado se restringe frente a la referencia mediante una penalizacion KL. La funcion objetivo es aproximadamente `L = weighted_cross_entropy + beta * KL(reference || policy)`.

El objetivo declarado del experimento (Exp001) era reducir los falsos positivos sobre texto humano dificil sin sacrificar la capacidad de deteccion de IA. Segun los datos publicados por el autor, el resultado es mixto: mejora de forma clara la tasa de falsos positivos humanos en la prueba de cambio de distribucion Earlybird (del 32,58 % al 26,57 %) y en HellaSwag (del 88,00 % al 81,86 %), pero pierde algo de recall de IA en el conjunto `ai-text-detection-pile-cleaned` al umbral por defecto (del 84,70 % al 78,17 %), con un desplazamiento de calibracion hacia predicciones mas conservadoras de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo ModernBERT (modelo base `answerdotai/ModernBERT-base`) |
| Parametros totales | 149.606.402 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (maximo de secuencia del checkpoint) |
| Tipos de cuantizacion | no disponible: no se publican checkpoints cuantizados. Al ser un encoder de ~149M parametros admite cuantizacion generica a int8/int4, pero no hay cifras oficiales |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | answerdotai/ModernBERT-base (via noumenon-labs/Firebird-ModernBERT-512) |
| Tarea | Clasificacion binaria: 0 = HUMAN, 1 = AI |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la de ModernBERT: un encoder transformer bidireccional con atencion global y local alterna, embeddings posicionales rotatorios (RoPE), activaciones GeGLU y atencion sin relleno (unpadding), disenado para cargas de inferencia de clasificacion y recuperacion. El checkpoint aqui descrito no modifica la arquitectura del modelo base; solo cambia los pesos del cabezal de clasificacion y del cuerpo mediante post-entrenamiento sobre la tarea de deteccion de texto de IA. El limite practico es de 512 tokens por ejemplo, inferior a la ventana nativa de ModernBERT-base, lo que implica truncado o troceado en documentos largos.

El entrenamiento de Exp001 consistio en 1 epoca sobre 53.598 ejemplos, con batch de 32, 1.675 pasos de optimizador, learning rate de 5e-6 y coeficiente KL beta de 0,10 frente al checkpoint original congelado. Se ejecuto en una unica RTX 4090 de 24 GB en aproximadamente 17 minutos. Los ejemplos humanos dificiles recibieron mayor peso de perdida que los ejemplos corrientes, con el fin de reducir falsos positivos sobre texto humano. El autor subraya explicitamente que esto no es RL en el sentido convencional de PPO/GRPO/RLHF, ya que Firebird es un clasificador discriminativo y no una politica generativa: se optimiza directamente un objetivo de clasificacion ponderado y diferenciable con una restriccion KL contra una referencia congelada.

## Capacidades

- Clasificacion binaria de texto: asigna `0` (humano) o `1` (IA) a un fragmento de hasta 512 tokens, con probabilidad asociada.
- Deteccion de texto generado por IA en ingles, con recall de IA muy alto en regimenes de bajo umbral (99,63 % de recall de IA en Earlybird OOD al umbral 0,50).
- Reduccion de falsos positivos sobre texto humano: FPR humano de 26,57 % en Earlybird OOD y de 15,78 % en `ai-text-detection-pile-cleaned` al umbral 0,50.
- Analisis de punto de operativo: el autor publica curvas de FPR humano para objetivos fijos de recall de IA (70 %-95 %) y de recall de IA para objetivos fijos de FPR humano (5 %-30 %), lo que permite fijar umbrales segun el coste relativo de cada tipo de error.
- Uso como extractor de caracteristicas o encoder de clasificacion dentro de `transformers`; el tag del repositorio indica compatibilidad con `text-embeddings-inference` y con `endpoints_compatible`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni razonamiento multi-paso: es exclusivamente un clasificador.
- Soporte multilingue: no. Solo ingles.

## Casos de uso

- Moderacion de contenido enviado por usuarios: clasificar envios de texto corto (comentarios, respuestas, resenas) para marcar posibles generaciones sinteticas antes de revision humana, usando un umbral bajo para priorizar recall de IA y derivando los positivos a un revisor.
- Integridad academica como primera fase de triaje: puntuar entregas o respuestas de examen de hasta 512 tokens y usar la probabilidad como senal de priorizacion, nunca como decision automatica, dado el FPR humano del 15,78 %-26,57 % publicado.
- Curacion de corpus de entrenamiento: filtrar grandes volumenes de texto para separar contenido humano de contenido sintetico antes de construir datasets, aprovechando el recall de IA del 99,63 % en el regimen OOD de Earlybird.
- Deteccion de granjas de contenido sintetico en agregadores, foros o marketplaces: procesar lotes de publicaciones con un encoder de 149M parametros, que permite throughput alto en una sola GPU consumer, y agregar las puntuaciones por autor o por hilo.
- Monitorizacion de pipelines generativos propios: verificar que las salidas de un sistema de generacion no se filtran a canales donde se espera contenido humano, actuando como control de calidad automatizado.
- Evaluacion de robustez y red teaming: usar el modelo y sus curvas de FPR/recall para medir como de facil es evadir un detector entrenado, por ejemplo mediante parafraseo o edicion humana, antes de desplegar un sistema de deteccion en produccion.
- Investigacion sobre post-entrenamiento de clasificadores: el checkpoint y su configuracion Exp001 (KL beta 0,10, LR 5e-6, 1 epoca, 53.598 ejemplos) sirven como referencia reproducible para estudiar ponderacion por dificultad y restricciones KL en encoders discriminativos.
- Triaje pericial preliminar: dado que el modelo solo cubre 512 tokens, se usaria sobre fragmentos seleccionados de un documento, con agregacion manual de puntuaciones y revision humana obligatoria por el riesgo reputacional de un falso positivo.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles son los publicados por el autor en la model card. Se comparan el checkpoint original (`noumenon-labs/Firebird-ModernBERT-512`) y este checkpoint reward-weighted.

Earlybird distribution-shift stress test (`noumenon-labs/Earlybird-V2`, split `validation_ood`, N = 26.705), umbral 0,50:

| Metrica | Firebird original | Reward-weighted |
|---|---:|---:|
| Accuracy | 80,51 % | 84,01 % |
| Balanced accuracy | 83,63 % | 86,53 % |
| Macro F1 | 80,51 % | 83,99 % |
| MCC | 0,6729 | 0,7223 |
| AUROC | 0,9825 | 0,9805 |
| FPR humano | 32,58 % | 26,57 % |
| Recall humano | 67,42 % | 73,43 % |
| Recall IA | 99,84 % | 99,63 % |
| Precision IA | 67,48 % | 71,75 % |

Comparacion pareada en ese conjunto: 959 errores del original corregidos, 24 errores nuevos introducidos, +935 correcciones netas; 959 falsos positivos humanos corregidos y 1 humano correcto roto; 23 ejemplos de IA correctos rotos.

`ai-text-detection-pile-cleaned`, split `validation`, N = 72.162, umbral 0,50:

| Metrica | Firebird original | Reward-weighted |
|---|---:|---:|
| Accuracy | 82,26 % | 81,19 % |
| Balanced accuracy | 82,26 % | 81,20 % |
| MCC | 0,6459 | 0,6250 |
| AUROC | 0,8941 | 0,8984 |
| FPR humano | 20,19 % | 15,78 % |
| Recall humano | 79,81 % | 84,22 % |
| Recall IA | 84,70 % | 78,17 % |
| Precision IA | 80,80 % | 83,25 % |

Recall de IA fijado, comparando FPR humano (Pile):

| Recall IA | FPR original | FPR reward-weighted |
|---:|---:|---:|
| 70 % | 13,19 % | 12,51 % |
| 75 % | 15,22 % | 14,40 % |
| 80 % | 17,47 % | 16,66 % |
| 85 % | 20,38 % | 19,38 % |
| 90 % | 24,38 % | 23,51 % |
| 95 % | 31,93 % | 30,85 % |

FPR humano fijado, comparando recall de IA (Pile):

| FPR humano | Recall IA original | Recall IA reward-weighted |
|---:|---:|---:|
| 5 % | 38,82 % | 39,31 % |
| 10 % | 60,21 % | 61,84 % |
| 15 % | 74,60 % | 76,41 % |
| 20 % | 84,49 % | 85,90 % |
| 25 % | 90,61 % | 91,25 % |
| 30 % | 94,03 % | 94,50 % |

Mejora media de recall de IA a FPR humano igualado: +1,014 puntos porcentuales. En puntos de operacion muestreados entre 0,1 % y 40 % de FPR humano, Exp001 obtuvo mayor recall de IA en aproximadamente el 99,9 % de los puntos. AUROC en Pile: original 0,894066; Exp001 0,898377; delta +0,004311. Mejor MCC en el barrido diagnostico de umbral: original 0,664386 con umbral 0,302; Exp001 0,673120 con umbral 0,125 (valores seleccionados retrospectivamente sobre el benchmark, no son umbrales de despliegue).

Prueba de estres con humanos de HellaSwag (no es un benchmark de deteccion de IA; se uso solo como cambio de distribucion, tras eliminar metadatos tipo corchetes):

| Metrica | Firebird original | Reward-weighted |
|---|---:|---:|
| FPR humano | 88,00 % | 81,86 % |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 600 MB; en fp16/bf16, unos 300 MB; en int8, unos 150 MB; en int4, unos 75 MB. Con activaciones y overhead del runtime, el modelo cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. La RTX 4090 de 24 GB se uso para el entrenamiento (17 minutos para 53.598 ejemplos durante 1 epoca); para inferencia bastan GPUs de gama baja o integradas. Tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1060 6 GB, RTX 3060, RTX 4060, etc.) e incluso en inferencia por CPU.
- Opciones de despliegue: `transformers` con la pipeline `text-classification`; `text-embeddings-inference` (tag declarado por el autor); endpoints compatibles con el Hub (`endpoints_compatible`). No hay confirmacion en la informacion disponible de soporte especifico en vLLM, llama.cpp, Ollama o TGI, y estas vias estan orientadas a modelos generativos o requieren conversion adicional.
- Latencia y throughput estimados: no disponible. El autor solo publica el tiempo de entrenamiento, no mediciones de inferencia.
- Nota de calibracion: el umbral por defecto de 0,50 no es optimo para este checkpoint; el autor obtuvo mejor MCC en Pile con umbral 0,125, pero ese valor se selecciono retrospectivamente sobre el benchmark y no debe usarse como umbral de produccion sin recalibrar sobre datos propios.

## Comparativa con modelos similares

La comparacion directa disponible es contra el checkpoint del que deriva. Para alternativas de la misma categoria no hay datos de benchmarks en la informacion proporcionada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| Firebird-ModernBERT-512-RW (este) | 149,6 M | 512 tokens | Clasificacion humano/IA | no disponible | HuggingFace (0 descargas, 0 likes) | Earlybird OOD: AC 84,01 %, MCC 0,7223; Pile: AUROC 0,8984 |
| noumenon-labs/Firebird-ModernBERT-512 (original, congelado como referencia) | 149,6 M | 512 tokens | Clasificacion humano/IA | no disponible | HuggingFace | Earlybird OOD: AC 80,51 %, MCC 0,6729; Pile: AUROC 0,8941 |
| Detectors basados en RoBERTa de la misma categoria (por ejemplo variantes tipo ChatGPT-detector o detector OpenAI de RoBERTa) | no disponible | no disponible | Clasificacion humano/IA | no disponible | HuggingFace | no disponible |

No se dispone de comparaciones con modelos generativos tipo LLM como detectores, ni de resultados frente a detectores comerciales (GPTZero, Originality.ai u otros similares), por lo que la comparativa queda limitada al checkpoint de origen.

## Limitaciones y advertencias

- Falsos positivos sobre texto humano: sigue siendo el punto debil principal. El FPR humano es del 26,57 % en Earlybird OOD y del 15,78 % en Pile al umbral 0,50. En el subconjunto humano de HellaSwag el FPR es del 81,86 % (frente al 88,00 % del original), lo que el propio autor califica de malo en terminos absolutos. El texto humano inusual, corto, fragmentario o procedimental es especialmente problematico.
- Sesgo hacia la clase IA: el modelo conserva un recall de IA muy alto (99,63 % en Earlybird OOD) a costa de marcar como IA una fraccion elevada de texto humano. El autor indica que el objetivo del experimento era precisamente reducir este sesgo.
- Desplazamiento de calibracion: Exp001 asigna probabilidades de IA mas bajas que el checkpoint original. Esto degrada las metricas al umbral fijo de 0,50 en Pile (recall de IA del 78,17 % frente al 84,70 %) pero mejora las curvas a puntos de operacion igualados. Cualquier despliegue exige recalibrar el umbral sobre datos propios.
- Umbrales del benchmark no reutilizables: los umbrales de mejor MCC (0,302 y 0,125) se eligieron retrospectivamente sobre el propio conjunto de evaluacion. El autor advierte que son resultados diagnosticos, no umbrales de despliegue.
- Limitacion de longitud: 512 tokens por ejemplo, sin mecanismo de agregacion a nivel de documento. Los textos largos deben trocearse y combinar puntuaciones, lo que introduce decisiones heuristicas no cubiertas por el modelo.
- Solo ingles: no hay soporte multilingue declarado.
- Riesgo de evasion: al ser un clasificador discriminativo, es vulnerable a parafraseo, edicion humana parcial, traduccion o cambios de estilo que no estan representados en las distribuciones de entrenamiento.
- Naturaleza experimental: es un checkpoint de un experimento concreto (Exp001), con 0 descargas y 0 likes en el momento de la consulta, y sin garantias de mantenimiento.
- Licencia no disponible: no se declara licencia en la informacion proporcionada, lo que impide determinar si el uso comercial esta permitido. Es un bloqueo para produccion.
- Riesgo reputacional: usar la salida del modelo como prueba concluyente de generacion por IA puede causar dano a personas (acusaciones de plagio o fraude). Debe usarse como senal de triaje con revision humana.
- No es un modelo generativo: no puede explicar sus decisiones, generar justificaciones ni mantener conversaciones. Solo emite una etiqueta y una probabilidad.
- Alucinacion: no aplica en el sentido generativo, pero si existe el equivalente de "confianza mal calibrada" en las probabilidades emitidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/noumenon-labs/Firebird-ModernBERT-512-RW
- Checkpoint original del que deriva: https://huggingface.co/noumenon-labs/Firebird-ModernBERT-512
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de evaluacion Earlybird V2: https://huggingface.co/datasets/noumenon-labs/Earlybird-V2
- Dataset de evaluacion ai-text-detection-pile-cleaned: https://huggingface.co/datasets/srikanthgali/ai-text-detection-pile-cleaned
- Benchmark HellaSwag (usado solo como prueba de estres de cambio de distribucion): https://huggingface.co/datasets/Rowan/hellaswag
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda realizada (los resultados devueltos corresponden a sitios no relacionados con el modelo).
