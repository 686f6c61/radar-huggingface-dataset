# Praveenrajus/jevify-smollm3-3b-sft-readout-coh

## Resumen

Jevify SmolLM3-3B SFT readout (coh) es un adaptador LoRA de rango 16 (30.228.480 parametros) entrenado sobre el checkpoint SFT de `HuggingFaceTB/SmolLM3-3B`, que se fusiona en los pesos del backbone en el momento de la carga. No es un modelo generativo: es un "System One decision model" que lee un `state`, responde a preguntas tipadas (`choice`, `score`, `noul`) y devuelve distribuciones de probabilidad calibradas sobre las que el codigo cliente puede ramificar. Nunca escribe texto.

El problema que aborda es la calibracion y la coherencia de las decisiones de un modelo pequeno en tareas de clasificacion y eleccion cerrada. Segun la model card, parte de un checkpoint SFT sin ajustar que obtiene 0.520 de accuracy y 0.110 de ECE, y lo lleva a 0.711 de accuracy y 0.053 de ECE sobre los splits de test de jev-bench (22.773 registros), con una perdida de coherencia (sure loss) de 0.039 frente a 0.280 del checkpoint sin ajustar.

Es relevante porque introduce un objetivo de entrenamiento poco habitual: ademas de la regla de scoring propia de cada primitiva, aplica una penalizacion de coherencia (peso 1.0) sobre familias de preguntas derivadas automaticamente (las opciones convertidas en preguntas si/no, la negacion, las preguntas de umbral de una escala), penalizando la sure loss de de Finetti. El autor publica la comparativa con recetas alternativas y un ejercicio de reproduccion sobre 72 registros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone SmolLM3-3B) con readout de decision tipado; adaptador LoRA de rango 16 fusionado en los pesos al cargar |
| Parametros totales | Backbone SmolLM3-3B (denominacion del checkpoint base); el adaptador entrenado tiene 30.228.480 parametros y se fusiona sobre los pesos originales |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha del autor |
| Tipos de cuantizacion | no disponible; los pesos se cargan en bf16 (la fusion del adaptador se realiza sobre pesos bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador en `lora/`, configuracion en `jevify_config.json`) |
| Libreria de carga | `jevify` (`load_jevified`) |
| Tamano del repositorio | 0.1 GB |
| Backbone fijado a | commit `f6ddaa5f2e99f24ea507596c214595769fb06387` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del backbone SmolLM3-3B con un cabezal de lectura de decisiones: la distribucion sobre las respuestas permitidas se lee en la posicion de respuesta, en una unica pasada forward, sin decodificacion autorregresiva. Sobre ese backbone se entrena un LoRA de rango 16 (30.228.480 parametros) que se fusiona en los pesos en el momento de la carga, de modo que el artefacto desplegado no mantiene el adaptador separado. El repo ocupa 0.1 GB y contiene `jevify_config.json`, el directorio `lora/` y los resultados en `results/`.

El entrenamiento usa la regla de scoring propia de cada primitiva mas una penalizacion de coherencia con peso 1.0. Cada pregunta de entrenamiento lleva hermanas derivadas automaticamente (opciones como preguntas si/no, la negacion, preguntas de umbral de una escala) y se penaliza la sure loss de de Finetti de la familia, de forma que las respuestas a preguntas relacionadas se mantengan mutuamente consistentes. Los datos son los splits de entrenamiento de las 16 fuentes de jev-bench no reservadas (5.885 familias, con un maximo de 400 registros por fuente). Hiperparametros: learning rate 3e-05, 2 epocas, mejor epoca por perdida de validacion (epoca 1), semilla 0. Las opciones se barajan por familia. Despues se ajusto una receta Tier 0 (temperatura por primitiva, sesgo Noul, permutaciones de orden de opciones) sobre los splits de validacion. Las seis fuentes reservadas (`clinc150`, `arc_challenge`, `yelp5`, `measuring_hate_speech`, `fever_evidence`, `strategyqa_grounded`) no aparecieron en entrenamiento.

## Capacidades

- Decision tipada sobre un estado de entrada: responde a preguntas de tipo `choice` (elegir entre opciones), `score` (puntuacion sobre una escala) y `noul` (ninguna de las anteriores / no aplica).
- Devolucion de distribuciones de probabilidad calibradas en lugar de texto, aptas para ramificacion en codigo (ECE 0.053, Brier 0.359 en jev-bench test).
- Coherencia interna entre preguntas relacionadas: sure loss de 0.039 sobre 4.749 familias de preguntas, frente a 0.280 del checkpoint sin ajustar.
- Generalizacion a fuentes reservadas: 0.757 de accuracy held-out frente a 0.553 del checkpoint sin ajustar.
- Uso como modelo de "System One": una unica pasada forward, sin generacion de texto ni decodificacion.
- Servicio como drop-in del TypeSafe SDK mediante `jevify-serve`.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Clasificacion de intenciones en atencion al cliente: el modelo responde preguntas de tipo `choice` sobre el mensaje del usuario y devuelve una distribucion calibrada; la fuente reservada `clinc150` forma parte de su evaluacion held-out (0.757 de accuracy global), por lo que es un escenario directamente cubierto.
- Enrutado y triaje con umbral de confianza: al devolver probabilidades y no texto, el codigo puede derivar a un humano cuando la masa de probabilidad de la mejor opcion cae por debajo de un umbral, sin necesidad de heuristicas sobre texto libre.
- Deteccion de phishing y analisis de riesgo: la study evalua esta tarea con AUROC; el modelo base sin ajustar obtiene 0.723 y 0.767 de "tool risk", y esta es la categoria de tarea que la receta pretende mejorar.
- Moderacion de contenido: una de las fuentes de evaluacion reservadas es `measuring_hate_speech`, de modo que el modelo esta pensado para etiquetar contenido potencialmente danino con probabilidad calibrada.
- Analisis de sentimiento y de resenas: la fuente reservada `yelp5` se corresponde con puntuacion en escala, cubierta por la primitiva `score`. El ejemplo de uso de la model card es exactamente este: decidir si "The battery lasted two days on a single charge." es una resena positiva con una pregunta `noul`.
- Verificacion de afirmaciones y atribucion de evidencia: `fever_evidence` es otra de las fuentes reservadas; el modelo puede puntuar si un enunciado esta respaldado por un contexto dado.
- Deteccion de "ninguna de las anteriores" en pipelines cerrados: las preguntas `noul` permiten descartar opciones cuando ninguna es valida, util como guardarrail antes de ejecutar una accion automatizada.
- Anotacion asistida con control de calibracion: al publicar ECE y Brier, el modelo se puede usar para priorizar que ejemplos anota un humano primero, ordenando por incertidumbre.
- Regresion y monitorizacion de clasificadores: la penalizacion de coherencia permite comprobar que las respuestas a preguntas relacionadas no se contradicen, util en test suites de comportamiento de modelos.

## Benchmarks y rendimiento

Resultados sobre los splits de test de jev-bench (22.773 registros). Las filas bajo este modelo son referencias del mismo estudio.

**Decisiones y calibracion**

| Modelo | Acc | ECE | Brier | Acc held-out | TVD a etiquetas humanas |
|---|---|---|---|---|---|
| **Este modelo** | 0.711 | 0.053 | 0.359 | 0.757 | 0.317 |
| SmolLM3-3B SFT checkpoint, sin ajustar (Tier 0) | 0.520 | 0.110 | 0.537 | 0.553 | 0.461 |
| Misma receta, solo supervision | 0.705 | 0.057 | 0.365 | 0.738 | 0.350 |
| Misma receta desde el checkpoint APO | 0.708 | 0.055 | 0.360 | 0.749 | 0.318 |
| Jev 1.13.0 (TypeSafe API) | 0.733 | 0.113 | 0.349 | 0.835 | 0.432 |

**Coherencia e invarianza** (sure loss: media de d² sobre 4.749 familias de preguntas, 0 = perfectamente coherente)

| Modelo | Sure loss | Proporcion incoherente | Order flip | Tag TVD | Caida de acc K=2→max |
|---|---|---|---|---|---|
| **Este modelo** | 0.039 | 0.627 | — | — | — |
| SmolLM3-3B SFT checkpoint, sin ajustar (Tier 0) | 0.280 | 0.989 | 0.480 | 0.070 | 0.598 |
| Misma receta, solo supervision | 0.315 | 0.966 | — | — | — |
| Misma receta desde el checkpoint APO | 0.041 | 0.640 | — | — | — |
| Jev 1.13.0 (TypeSafe API) | 0.081 | 0.725 | 0.046 | — | 0.246 |

Nota: la model card no publica los valores de order flip, tag TVD ni caida K=2→max para este modelo.

**Fuera de distribucion** (reglas explicitas tipo LegalBench, ninguna de las anteriores con la opcion correcta eliminada, tasa de secuestro por instruccion inyectada, benchmarks comunitarios de Jev)

| Modelo | Regla declarada | "None" cuando desaparece | Hijack | AUROC phishing | Riesgo de herramientas |
|---|---|---|---|---|---|
| **Este modelo** | — | — | — | — | — |
| SmolLM3-3B SFT checkpoint, sin ajustar (Tier 0) | 0.609 | 0.274 | 0.445 | 0.723 | 0.767 |
| Misma receta, solo supervision | — | — | — | — | — |
| Misma receta desde el checkpoint APO | — | — | — | — | — |
| Jev 1.13.0 (TypeSafe API) | 0.924 | 0.744 | 0.205 | 0.688 | 0.933 |

Nota: la model card no publica los resultados fuera de distribucion de este modelo (celdas marcadas con "—").

**Comprobacion de reproduccion.** Cargando la carpeta con `load_jevified` y re-puntuando 72 registros de test de jev-bench de seis fuentes se reprodujeron las predicciones del propio entrenamiento: 0 cambios en la opcion elegida, |Δp| medio 0.006 y maximo 0.027.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 7-8 GB contando pesos del backbone de 3B, adaptador fusionado y overhead de activaciones y cache de contexto (estimacion orientativa, no verificada en la informacion disponible).
- Cuantizacion a 8 bits: aproximadamente 4 GB; a 4 bits, aproximadamente 2,5-3 GB (estimacion orientativa; la ficha no publica cuantizaciones soportadas).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) y en tarjetas de 4-6 GB si se cuantiza.
- GPU de datacenter: A100, H100, L40S o similares, con margen amplio para lotes grandes; el modelo es pequeno para este segmento y el cuello de botella sera el preprocesado y el servidor, no la VRAM.
- Opciones de despliegue confirmadas: `load_jevified` desde la libreria `jevify` y `jevify-serve --model Praveenrajus/jevify-smollm3-3b-sft-readout-coh`, que expone el modelo como drop-in del TypeSafe SDK (`TYPESAFE_BASE_URL=http://localhost:8000`).
- Opciones de despliegue no confirmadas: vLLM, llama.cpp, Ollama y TGI no se mencionan en la informacion disponible; el flujo de carga depende de la fusion del adaptador al vuelo y del backbone fijado a un commit concreto.
- Latencia y throughput estimados: no disponibles. Al no haber decodificacion, el coste por consulta equivale a una unica pasada forward de un modelo de 3B sobre el contexto de entrada.
- Almacenamiento: el repositorio del adaptador ocupa 0.1 GB; hay que sumar la descarga del backbone SmolLM3-3B desde su propio repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Acc / ECE (jev-bench test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo** (LoRA rango 16 sobre SmolLM3-3B SFT) | Backbone 3B + adaptador de 30,2 M | no disponible | 0.711 / 0.053 | apache-2.0 | HuggingFace, 0 descargas y 0 likes |
| SmolLM3-3B SFT checkpoint, sin ajustar (Tier 0) | 3B | no disponible | 0.520 / 0.110 | no disponible en la ficha | Checkpoint base referenciado |
| Misma receta, solo supervision | Backbone 3B + adaptador | no disponible | 0.705 / 0.057 | no disponible en la ficha | HuggingFace (`Praveenrajus/jevify-smollm3-3b-sft-readout`) |
| Misma receta desde el checkpoint APO | Backbone 3B + adaptador | no disponible | 0.708 / 0.055 | no disponible en la ficha | HuggingFace (`Praveenrajus/jevify-smollm3-3b-apo-rea...`) |
| Jev 1.13.0 (TypeSafe API) | no disponible | no disponible | 0.733 / 0.113 | no disponible | API/servicio |

Frente a los modelos puramente generativos de ~3B no hay comparacion publicada en la informacion disponible: este modelo no genera texto y solo se puede evaluar con la regla de scoring de sus primitivas.

## Limitaciones y advertencias

- No es un modelo generativo: no escribe texto, no conversa y no produce explicaciones. Solo devuelve distribuciones sobre respuestas permitidas.
- Riesgo de alucinacion: no aplica en el sentido habitual de texto inventado, pero si en forma de eleccion incorrecta con alta confianza; por eso la model card publica ECE (0.053) en lugar de solo accuracy.
- La proporcion de familias incoherentes sigue siendo alta: 0.627, frente a 0.725 de Jev 1.13.0 y 0.989 del checkpoint sin ajustar. La coherencia mejora, pero no es perfecta.
- La accuracy global (0.711) es inferior a la de Jev 1.13.0 (0.733). La mejora de este checkpoint esta en calibracion (ECE 0.053 frente a 0.113) y no en acierto bruto.
- Los resultados fuera de distribucion (regla declarada, "none" cuando desaparece la opcion correcta, tasa de hijack, AUROC de phishing, riesgo de herramientas) no estan publicados para este modelo, solo para el backbone sin ajustar y para Jev 1.13.0. En esas tareas no hay evidencia de rendimiento.
- No se publican datos de order flip, tag TVD ni caida de accuracy K=2→max para este modelo, que son precisamente las pruebas de invarianza frente al orden y al etiquetado de opciones.
- Sesgos conocidos: no disponibles. El entrenamiento usa 16 fuentes de jev-bench con un tope de 400 registros por fuente (5.885 familias), lo que implica un volumen de datos modesto y potencial de sesgo hacia las tareas y dominios sobrerrepresentados.
- Limitaciones de contexto e idioma: no disponibles en la ficha; no se declaran idiomas soportados.
- La carga depende del backbone fijado al commit `f6ddaa5f2e99f24ea507596c214595769fb06387` del repositorio de SmolLM3-3B-checkpoints y de la libreria `jevify` con su `jevify_config.json`; no hay garantia de compatibilidad con otras rutas de despliegue.
- Licencia: apache-2.0, permisiva y apta para uso comercial. Hay que verificar por separado la licencia del backbone SmolLM3-3B, no incluida en esta ficha.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente externa.
- La fecha de creacion del repositorio que reporta la plataforma (2026-09-25) es posterior a la fecha de actualizacion publicada por el propio autor, por lo que conviene tratar los metadatos temporales con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Praveenrajus/jevify-smollm3-3b-sft-readout-coh
- Dataset jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench
- Leaderboard de jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench#leaderboard
- Notas de resultados (readout fine-tuning y penalizacion de coherencia): https://github.com/uspraveen/Jevify/blob/main/docs/FINDINGS.md#18-readout-fine-tuning-and-what-a-coherence-penalty-adds
- Codigo de Jevify: https://github.com/uspraveen/Jevify
- Modelos relacionados citados: https://huggingface.co/Praveenrajus/jevify-smollm3-3b-sft-readout y https://huggingface.co/Praveenrajus/jevify-smollm3-3b-apo-rea
- Backbone base: HuggingFaceTB/SmolLM3-3B-checkpoints (repositorio referenciado en la model card, commit `f6ddaa5f2e99f24ea507596c214595769fb06387`)
- Resultado de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con el mismo ni con jev-bench.
