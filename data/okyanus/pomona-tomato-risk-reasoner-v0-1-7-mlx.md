# Okyanus/pomona-tomato-risk-reasoner-v0.1.7-MLX

## Resumen

Pomona Tomato Risk Reasoner v0.1.7 — MLX 8-bit es una conversión cuantizada a 8 bits del ajuste fino `Okyanus/pomona-tomato-risk-reasoner-v0.1.7-lora`, fusionado sobre `Qwen/Qwen2.5-0.5B-Instruct` y empaquetado en formato MLX para Apple Silicon. Lo publica el proyecto Okyanus/Pomona como «research preview» y su tarea es devolver una lista JSON de etiquetas de riesgo agronómico en invernaderos de tomate (por ejemplo `["high_ph","nutrient_uptake_issue"]`) o `[]` cuando el paquete de sensores es normal.

El modelo tiene 494.032.768 parámetros (~0,49B) y arquitectura transformer decoder de la familia Qwen2, lo que lo sitúa en la gama de inferencia local muy ligera. No es un clasificador autónomo: el propio autor advierte que su F1 de etiqueta cae a 0,34 en 153 casos frescos de umbral, al mismo nivel que responder siempre `[]`, y que las reglas deterministas de Pomona son siempre la autoridad final.

Su interés es principalmente metodológico: ilustra el patrón `hybrid_guarded`, en el que un modelo pequeño acompaña a reglas deterministas y revisión humana en lugar de sustituirlas, dentro de un dominio vertical de agricultura de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, familia Qwen2 (base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (~0,49B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se especifica en la ficha; el modelo base es Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | 8-bit (MLX); existe tambien un build GGUF del mismo modelo |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (8-bit); variante GGUF disponible |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen2.5-0.5B-Instruct`: un transformer decoder causal de ~0,49B parametros. Sobre ese modelo se aplico un ajuste fino tipo LoRA (`pomona-tomato-risk-reasoner-v0.1.7-lora`), que despues se fusiono en los pesos base y se convirtio a MLX en 8 bits para ejecucion en Apple Silicon. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO; el unico dataset citado es `Okyanus/greenhouse-sensor-data`.

El autor documenta dos caracteristicas tecnicas relevantes. La primera es que el entrenamiento se apoyo en plantillas: los datos contenian unicamente dos valores de pH alto (7.2 y 7.4), lo que provoco un fuerte sobreajuste a esas plantillas y explica el desplome de rendimiento en paquetes frescos. La segunda es el modo de despliegue `hybrid_guarded`, en el que la plataforma devuelve las etiquetas de las reglas deterministas y el modelo se ejecuta en paralelo sin modificarlas; ademas, la inferencia usa decodificacion restringida por esquema JSON para limitar la salida a las etiquetas permitidas.

## Capacidades

- Generacion de texto conversacional y clasificacion de riesgo agronomico en tomate de invernadero como lista JSON.
- Emision de 12 etiquetas permitidas: `high_ph`, `low_ph`, `high_ec`, `low_ec`, `heat_stress`, `cold_stress`, `fungal_pressure`, `nutrient_uptake_issue`, `sensor_anomaly`, `missing_critical_data`, `water_level_risk` y `actuator_conflict`.
- Salida restringida mediante esquema JSON (`format` con las etiquetas permitidas), con valid JSON del 1,00 en las evaluaciones publicadas.
- Razonamiento numerico exacto sobre umbrales: no fiable, segun el propio autor, al tratarse de un modelo de 0,5B.
- Tool calling / function calling: no soportado de forma nativa en la informacion disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, solo ingles.
- Vision, audio o modo «thinking»: no disponibles; el modelo es exclusivamente texto.

## Casos de uso

- Clasificacion de riesgo en invernadero bajo reglas: en modo `hybrid_guarded`, el modelo se ejecuta junto a las reglas deterministas de Pomona, que son las que fijan las etiquetas finales. Es el unico uso recomendado por el autor.
- Segunda opinion sobre telemetria de sensores: usar la salida JSON del modelo como senal auxiliar para priorizar paquetes que merecen revision humana, nunca como decision final.
- Generacion de alertas para operarios: convertir la lista de etiquetas en avisos de inspeccion (por ejemplo, `fungal_pressure` como «inspeccionar el cultivo», no como diagnostico).
- Investigacion sobre modelos pequenos en dominios verticales: el modelo sirve como caso de estudio documentado de sobreajuste a plantillas y de la brecha entre validacion en distribucion y casos frescos de umbral.
- Evaluacion comparativa de prompts: la propia model card compara el prompt largo (F1 0,60 en la suite dorada) con el prompt corto del `model-router` (F1 0,31), util para estudiar sensibilidad a la plantilla de entrada.
- Base para nuevos ajustes LoRA: partir del adaptador o del modelo fusionado para experimentar con otros cultivos, umbrales o etiquetas.
- Inferencia local con privacidad de datos agricolas: al ser un modelo de 0,5 GB ejecutable en Apple Silicon, permite procesar telemetria de sensores sin enviarla a servicios externos.
- Prototipado de sistemas de decision agricola con salvaguardas: integrarlo detras de un verificador de seguridad y de la validacion de invariantes ya implementada en Pomona.

## Benchmarks y rendimiento

| Evaluacion | Casos | JSON valido | Etiquetas permitidas | Coincidencia exacta | F1 de etiqueta |
|---|---|---|---|---|---|
| Suite dorada, modelo solo | 15 | 1,00 | 1,00 | 0,60 | 0,60 |
| Agri Telemetry Sanity Bench `tomato_risk`, build GGUF (MLX no ejecutado) | 153 | 1,00 | 1,00 | 0,33 | 0,34 |
| Ruta protegida de Pomona (reglas despues del modelo) | 15 dorados | 1,00 | 1,00 | 1,00 | 1,00 |
| Prompt corto del `model-router` (referencia del autor) | no disponible | no disponible | no disponible | no disponible | 0,31 |

El autor indica que la particion de test de la misma distribucion comparte plantillas con los datos de entrenamiento y que el modelo las memorizo en gran medida. En los 153 paquetes frescos, con valores a ambos lados de cada umbral, el modelo responde `[]` a casi todo, quedando al nivel de una linea base que responde siempre `[]` (0,33). Cambiar un campo irrelevante como `growth_stage` puede convertir un `high_ph` correcto en `[]`.

## Requisitos de hardware

- VRAM/peso de pesos: el repositorio ocupa 0,5 GB, coherente con 494M parametros en 8 bits; con cache KV y contexto moderado el consumo se mantiene por debajo de 2 GB (estimacion, no confirmada en la ficha).
- Cabe en GPU de consumo: no aplica a CUDA. MLX es especifico de Apple Silicon, por lo que se ejecuta en cualquier Mac con chip M1 o posterior, incluso con 8 GB de memoria unificada.
- GPU recomendadas: ninguna CUDA; el entorno objetivo son los chips Apple M-series.
- Alternativa en otras plataformas: existe un build GGUF del mismo modelo, pensado para llama.cpp u Ollama (imagen local `pomona-tomato-risk:v0.1.7-local`).
- Opciones de despliegue: `mlx_lm.server --model Okyanus/pomona-tomato-risk-reasoner-v0.1.7-MLX --port 8082` previa instalacion de `mlx-lm`; en la plataforma Pomona, el backend Ollama esta desactivado salvo que se active explicitamente `REASONER_BACKEND=ollama`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 de etiqueta (bench 153) | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Pomona Tomato Risk Reasoner v0.1.7 MLX (este modelo) | 494M | no disponible | 0,34 (medido en el build GGUF; el build MLX no se ejecuto) | apache-2.0 | MLX safetensors 8-bit |
| Pomona Tomato Risk Reasoner v0.1.7 LoRA (modelo fuente) | 494M | no disponible | no disponible | apache-2.0 | safetensors (adaptador LoRA) |
| Qwen2.5-0.5B-Instruct (modelo base) | 494M | no disponible en la ficha | no disponible | apache-2.0 | safetensors |
| Linea base siempre `[]` | no aplica | no aplica | 0,33 | no aplica | no aplica |
| Reglas deterministas de Pomona | no aplica | no aplica | 1,00 en la suite dorada y en el benchmark | parte del proyecto Pomona | no aplica |

No se dispone de comparaciones con otros modelos de clasificacion de riesgo agricola en la informacion proporcionada.

## Limitaciones y advertencias

- Vista previa de investigacion y no un clasificador autonomo: el autor lo declara explicitamente en la model card.
- Rendimiento pobre en casos frescos: F1 de etiqueta 0,34 en 153 casos de umbral, al mismo nivel que responder siempre `[]`, y 0,60 en la suite dorada de 15 casos.
- Sobreajuste a plantillas: los datos de entrenamiento solo contenian dos valores de pH alto (7.2 y 7.4), por lo que el modelo memorizo plantillas en lugar de aprender comparaciones de umbral.
- Fragilidad ante campos irrelevantes: modificar solo `growth_stage` puede convertir un `high_ph` correcto en `[]`.
- Razonamiento numerico no fiable: un modelo de 0,5B no realiza comparaciones numericas exactas de forma consistente.
- Sesgo de dominio: entrenado exclusivamente con telemetria de invernadero de tomate; no es extrapolable a otros cultivos sin reajuste.
- Idioma: solo ingles.
- Restricciones de uso: es unicamente orientativo. No debe usarse para dosificar pesticidas o fertilizantes, cambiar fertigacion, controlar actuadores ni diagnosticar enfermedades. La etiqueta `fungal_pressure` significa «inspeccionar el cultivo», no un diagnostico.
- Integracion obligatoria: debe ejecutarse detras de las reglas deterministas, el verificador de seguridad y la revision humana.
- Dependencia de plataforma: este build MLX solo funciona en Apple Silicon; para otros entornos hay que recurrir al build GGUF.
- Licencia: apache-2.0 permite uso comercial, pero el propio autor desaconseja el uso productivo sin las salvaguardas descritas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Okyanus/pomona-tomato-risk-reasoner-v0.1.7-MLX
- Modelo fuente (LoRA): https://huggingface.co/Okyanus/pomona-tomato-risk-reasoner-v0.1.7-lora
- Dataset de sensores: https://huggingface.co/datasets/Okyanus/greenhouse-sensor-data
- Benchmark Agri Telemetry Sanity Bench: https://huggingface.co/datasets/Okyanus/agri-telemetry-sanity-bench
- Repositorio del proyecto Pomona: https://github.com/okyanu/pomona
- Documentacion del razonador de riesgo: https://github.com/okyanu/pomona/blob/main/docs/TOMATO_RISK_REASONER.md
- Pagina del razonador: https://okyanu.github.io/pomona/TOMATO_RISK_REASONER/
- Catalogo de modelos: https://okyanu.github.io/pomona/MODEL_CATALOG/
- Coleccion en HuggingFace: https://huggingface.co/collections/Okyanus/pomona-local-ai-for-safer-greenhouse-decision-support-6a89931ffcc2f7a3f777f3b9
