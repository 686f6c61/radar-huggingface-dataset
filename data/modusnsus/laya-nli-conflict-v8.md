# Modusnsus/laya-nli-conflict-v8

## Resumen
laya-nli-conflict-v8 es un checkpoint de clasificación de texto (NLI orientado a conflicto de memoria) publicado por el usuario Modusnsus dentro de la familia Laya, un conjunto de modelos de decisión "System 1" no autorregresivos desarrollados por convaiinnovations. El modelo se obtiene por fine-tuning de convaiinnovations/laya-multilingual y resuelve un problema concreto: decidir, con salida tipada, si un par de afirmaciones es compatible o entra en conflicto, incluyendo casos de atributos compatibles sobre el mismo sujeto.

La relevancia de esta ficha es sobre todo documental: el propio autor lo etiqueta como research-archive y not-delivered. Es la ronda 8 de un protocolo de entrenamiento iterativo, falló las puertas de aceptación de su ronda y nunca se entregó como modelo de producción. El head de producción vigente es Modusnsus/laya-nli-memory-conflict (v4). Aun así, el checkpoint se sube para preservar procedencia y servir de respaldo mientras la ronda 11 espera cuota de GPU en Kaggle.

Técnicamente es un encoder transformer de 321.908.998 parámetros (aproximadamente 0,32 B) con pesos en bf16, encoder declarado jhu-clsp/mmBERT-base en su configuración de agente RL, y una precisión de validación congelada de 0,896 sobre 1.000 pares. No es un modelo generativo: su única tarea es clasificación, por lo que no debe evaluarse como un LLM de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer de clasificación; encoder declarado jhu-clsp/mmBERT-base en rl_agent_config.json; linaje base convaiinnovations/laya-multilingual (familia System 1 no autorregresiva) |
| Parametros totales | 321.908.998 (aproximadamente 0,32 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan variantes GGUF, GPTQ, AWQ ni similares) |
| Idiomas soportados | No disponible. El modelo base de la familia declara enrutamiento multilingüe en más de 100 idiomas, pero la model card de este checkpoint no especifica idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

Otros metadatos: pipeline text-classification, librería transformers, tamaño del repositorio 0,7 GB, dataset declarado nyu-mll/multi_nli, métricas declaradas accuracy y ece, acceso a endpoints compatible, 0 descargas y 0 likes en el momento de la consulta. Fechas: creado el 2026-10-01, actualizado el 2026-10-01; la model card indica una subida el 2026-10-02 para procedencia.

## Arquitectura y entrenamiento
El checkpoint es un fine-tuning sobre la familia Laya, descrita por sus autores como un motor de decisión System 1 no autorregresivo y multilingüe, con calibración como objetivo explícito. Según el archivo rl_agent_config.json del propio repositorio, el encoder es jhu-clsp/mmBERT-base, con pesos en bf16, un umbral de decisión tau(noul) = 1,1240 y la marca no_rl = true (es decir, en esta ronda no se aplicó RL sobre el checkpoint entregado). La salida es una decisión tipada ("typed-decisions"), en línea con el pipeline de clasificación de texto.

En cuanto a datos, la ronda 8 (2026-09-29) añadió 120 filas al corpus de la ronda 7, manteniendo los bloques previos idénticos byte a byte: 80 filas de pet_attr (40 con la misma forma B2 que pet_name pero literales intercambiados, más 40 pet_benign) y 40 filas de doctor_attr. El entrenamiento se realizó con el kernel de GPU de Kaggle daphnelaurent/laya-nli-conflict-ce v4 sobre el dataset daphnelaurent/nli-conflict-pairs v13. El dataset base declarado en los tags es nyu-mll/multi_nli. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición completa del corpus ni si hubo RLHF o DPO.

## Capacidades
- Clasificación de texto con etiquetas tipadas, orientada a la detección de conflicto entre pares de afirmaciones (NLI aplicado a memoria).
- Detección de conflicto de memoria: distingue contradicciones y compatibilidades entre un hecho almacenado y una afirmación nueva.
- Tratamiento específico de atributos compatibles sobre el mismo sujeto (la ronda 8 añade filas del tipo "atributo compatible sobre el mismo sujeto implica falso").
- Calibración de probabilidades como capacidad medida: ECE de validación de 0,0319 sobre 1.000 pares.
- Mecanismo de abstención conforme (conformal s2) con capture reportado de 42/54 (77,8 %) y tasa de abstención del 35,4 %.
- Capacidades multilingües: no confirmadas para este checkpoint, aunque el modelo base de la familia las declara.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modalidades de visión o audio. Es un clasificador, no un generador.

## Casos de uso
- Detección de contradicciones en memoria de agentes conversacionales: dado un hecho persistido y una nueva afirmación del usuario, el clasificador decide si hay conflicto antes de escribir en el almacén de memoria, evitando estados inconsistentes en asistentes de larga duración.
- Guardarraíl de pipelines RAG: comprobar si el contexto recuperado contradice la respuesta candidata generada por un LLM, y activar una ruta de revisión o abstención cuando la confianza calibrada cae por debajo del umbral.
- Curación y etiquetado de datasets de NLI: uso como preanotador para filtrar pares contradictorios o compatibles antes de la revisión humana, aprovechando su ECE bajo (0,0319) para priorizar la cola de baja confianza.
- Verificación de consistencia en bases de conocimiento: auditar tablas de atributos de entidades (por ejemplo, atributos de mascotas o de profesionales) para detectar filas donde dos atributos del mismo sujeto deberían coexistir y el sistema las marca como conflicto.
- Investigación en calibración y abstención selectiva: el checkpoint incluye un volcado de probabilidades de validación congelada (val_probs.json), útil como material de reproducción para estudiar curvas de calibración y protocolos conformales.
- Referencia de ablación para protocolos de entrenamiento por rondas: sirve para comparar el efecto de dosis de datos (la "dose-response" B2 pasó de 0,8985 a 0,7491) frente a los checkpoints posteriores de la misma familia.
- Filtrado de conflictos en anotación multilingüe: potencialmente aplicable a corpus en varios idiomas si se valida el comportamiento del checkpoint, aunque los idiomas soportados no están documentados.

Advertencia de uso: al tratarse de un archivo de investigación que no superó sus puertas de aceptación, estos casos describen el uso previsto de la familia, no un uso recomendado de este checkpoint concreto en producción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son métricas internas de validación congelada del propio autor:

| Metrica | Valor | Nota |
|---|---|---|
| Exactitud en validación principal (1000 pares) | 0,896 | Pasa; 104 errores |
| ECE en validación (metrics.json) | 0,0319 | n_val = 1000 |
| Respuesta a dosis B2 | 0,8985 → 0,7491 | Caída de 15 puntos porcentuales; único cambio diagnóstico grande |
| val_soft | 7 fallos | No pasa; filas holdout de grado/barbería que cambian entre ejecuciones |
| polaridad val_soft | +6 | No pasa |
| Abstención conformal s2 | 35,4 % | No pasa; 0,4 pp por encima del límite del 35 % |
| Capture conformal s2 | 42/54 = 77,8 % | Reportado como sólido |
| no_rl | true | Sin RL aplicado en este checkpoint |

## Requisitos de hardware
- VRAM estimada para inferencia: en bf16 los pesos ocupan en torno a 0,64 GB; con overhead de activaciones y runtime, menos de 1,5 GB en la práctica. El repositorio completo pesa 0,7 GB.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida pueden ejecutarlo.
- Cabe en GPU de consumo: sí, con holgura, en cualquier tarjeta con 2 GB o más de VRAM.
- Opciones de despliegue: Transformers con el pipeline text-classification (librería declarada en la model card). El tag endpoints_compatible indica compatibilidad con endpoints de Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; son runtimes orientados a generación y este modelo es un clasificador.
- Latencia y throughput: no disponibles para este checkpoint. La web de la familia Laya anuncia un motor de decisión sub-35 ms / 33 ms, pero esa cifra corresponde a la familia comercial y no está verificada para este checkpoint archivado.
- Entrenamiento: la ronda 8 se ejecutó en un kernel de GPU de Kaggle (daphnelaurent/laya-nli-conflict-ce v4), con el registro de rondas pendiente de cuota de GPU para la ronda 11.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Rendimiento | Licencia | Estado |
|---|---|---|---|---|---|---|
| Modusnsus/laya-nli-conflict-v8 (este) | 321,9 M | Clasificación NLI / conflicto de memoria | No disponible | Val 0,896, ECE 0,0319 (métricas internas) | apache-2.0 | Archivo de investigación, no entregado |
| Modusnsus/laya-nli-memory-conflict | 0,3 B (según la web de búsqueda) | Clasificación de texto | No disponible | No disponible | No disponible | Head de producción vigente de la familia (v4) |
| convaiinnovations/laya-multilingual | No disponible | Motor de decisión System 1 (familia base) | No disponible | No disponible | No disponible | Modelo base del linaje |
| jhu-clsp/mmBERT-base | No disponible en la información proporcionada | Encoder multilingüe | No disponible | No disponible | No disponible | Encoder declarado en la configuración del agente |

No se dispone de datos verificados de benchmarks comparables (por ejemplo, modelos NLI multilingües de tamaño similar) en la información proporcionada; cualquier comparación de rendimiento entre familias queda fuera del alcance de esta ficha.

## Limitaciones y advertencias
- Modelo no entregado ni validado para producción. La propia model card declara que falló las puertas de aceptación de su ronda y que nunca se distribuyó; no debe desplegarse como componente crítico.
- Sesgos conocidos: no documentados explícitamente. El corpus incluye bloques temáticos concretos (atributos de mascotas, de profesionales, filas de grado y barbería), lo que puede inducir un sesgo de dominio hacia esos patrones.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea. La validación principal reporta 104 errores sobre 1.000 pares (0,896 de exactitud) y hay filas holdout que cambian de predicción entre ejecuciones.
- Inestabilidad entre ejecuciones: la ronda 8 reporta 7 fallos en val_soft atribuidos a varianza de entrenamiento, no a regresión de atributos.
- Limitaciones de calibración y abstención: la abstención conformal s2 se sitúa en el 35,4 %, 0,4 puntos por encima del límite fijado (35 %), por lo que el checkpoint no cumple su propio criterio de aceptación en ese eje. La polaridad val_soft tampoco pasa (+6).
- Idiomas: no disponibles. El fine-tune se apoya en un dataset en inglés (nyu-mll/multi_nli) aunque el linaje base sea multilingüe; el comportamiento fuera del inglés no está verificado.
- Contexto: la longitud de contexto no está documentada, lo que impide garantizar el tratamiento de entradas largas.
- Licencia: apache-2.0 permite uso comercial y modificación con atribución, pero la licencia no exime de los riesgos técnicos anteriores.
- Procedencia y reproducibilidad: el weights se publica con SHA256 parcial (bcd1b158…174088) y el hash completo remite a un manifiesto en GitHub. El directorio checkpoint_latest no se subió intencionadamente, por lo que no se puede continuar el entrenamiento desde el artefacto publicado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Modusnsus/laya-nli-conflict-v8
- Head de producción de la familia (v4): https://huggingface.co/Modusnsus/laya-nli-memory-conflict
- Modelo base del linaje: https://huggingface.co/convaiinnovations/laya-multilingual
- Perfil del autor en Hugging Face: https://huggingface.co/Modusnsus/activity/all
- Repositorio GitHub del proyecto: https://github.com/modusensus/laya
- Registro de la ronda 8 y tabla de puertas de aceptación: https://github.com/modusensus/laya/blob/main/kaggle_eval/HANDOFF_NLI_V8.md
- Manifiesto de hashes SHA256: https://github.com/modusensus/laya/blob/main/kaggle_eval/archive_sha256_manifest.txt
- Playground y benchmark de Laya (terceros): https://github.com/wdobry/laya-playground
- Web de la familia Laya (System 1 Decision Engine): https://laya.convaiinnovations.com/
- Ficha de terceros de laya-nli-memory-conflict: https://free2aitools.com/model/modusnsus/laya-nli-memory-conflict
- Kernel de entrenamiento en Kaggle: daphnelaurent/laya-nli-conflict-ce v4
- Dataset de entrenamiento en Kaggle: daphnelaurent/nli-conflict-pairs v13
- Dataset base declarado: nyu-mll/multi_nli
