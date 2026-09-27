# Okyanus/pomona-tomato-risk-reasoner-v0.1.7-GGUF

## Resumen

Pomona Tomato Risk Reasoner v0.1.7 GGUF es una conversion a formato GGUF F16 (para llama.cpp y Ollama) de un adaptador LoRA fusionado sobre Qwen/Qwen2.5-0.5B-Instruct. Lo publica el usuario Okyanus dentro del proyecto Pomona, una plataforma de soporte a la decision para invernaderos de tomate que combina reglas deterministas con un modelo local. Su tarea es acotada: recibe un paquete de telemetria de sensores en JSON y devuelve una lista JSON de etiquetas de riesgo agronomicas (por ejemplo `["high_ph", "nutrient_uptake_issue"]`) o una lista vacia si todos los valores estan dentro de los umbrales normales.

El modelo tiene 494.032.768 parametros (aproximadamente 0,49 B) y se distribuye bajo licencia Apache 2.0. No es un clasificador autonomo: el propio autor lo etiqueta como "research preview" y advierte de que las reglas deterministas de Pomona (umbrales fijos como pH >= 7.2 para `high_ph` o humedad >= 85 % para `fungal_pressure`) son siempre la autoridad. En el benchmark Agri Telemetry Sanity Bench, sobre 153 casos nuevos con valores a ambos lados de cada umbral, el modelo obtiene 0,34 de F1 de etiqueta, practicamente al mismo nivel que una linea base que responde siempre `[]`.

Su relevancia es, por tanto, doble: por un lado documenta un patron de despliegue realista de IA local en agricultura (modelo pequeno en el borde, con reglas y validacion de seguridad por delante); por otro, es un caso de estudio honesto sobre los limites de un modelo de 0,5 B en comparaciones numericas exactas, con memorizacion de plantillas de entrenamiento y sensibilidad a campos irrelevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada de Qwen2.5-0.5B-Instruct (con adaptador LoRA fusionado) |
| Parametros totales | 494.032.768 (aproximadamente 0,49 B) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens de contexto nativo (dato del modelo base, no confirmado para este build) |
| Tipos de cuantizacion | GGUF F16 (unica publicada en el repositorio, 1,0 GB); no se publican Q8_0, Q4_K_M ni otras variantes |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atencion por consultas agrupadas (GQA) y RoPE, sobre el que se entreno un adaptador LoRA y se fusiono despues con los pesos base. El resultado se convirtio a GGUF F16 para su uso con llama.cpp y Ollama. La model card no detalla el rango del LoRA, la tasa de aprendizaje ni el numero de pasos.

Los datos de entrenamiento provienen del dataset Okyanus/greenhouse-sensor-data, que segun la propia documentacion del autor utiliza solo dos valores de pH alto en la senal de entrenamiento (7.2 y 7.4) y comparte plantillas con el split de test de la misma distribucion. Esa composicion explica la diferencia entre el 0,89 de F1 en el split de test de misma distribucion (473 casos, plantillas vistas) y el 0,34 en casos nuevos de umbral (153 casos). No se documenta RLHF, DPO ni ninguna innovacion de decodificacion mas alla del uso de decodificacion restringida por esquema JSON (parametro `format` de Ollama) para forzar salidas validas.

## Capacidades

- Generacion de texto con salida estructurada: devuelve exclusivamente una lista JSON de etiquetas de riesgo permitidas.
- Clasificacion multiclase sobre un vocabulario cerrado de 12 etiquetas: `high_ph`, `low_ph`, `high_ec`, `low_ec`, `heat_stress`, `cold_stress`, `fungal_pressure`, `nutrient_uptake_issue`, `sensor_anomaly`, `missing_critical_data`, `water_level_risk`, `actuator_conflict`.
- Manejo de un vocabulario secundario de acciones bloqueadas: `direct_pesticide_dosage`, `autonomous_fertigation_change`, `direct_actuator_control`, `definitive_disease_diagnosis`, `unsafe_chemical_recommendation`.
- Salida `[]` para paquetes de telemetria dentro de umbrales normales.
- Cumplimiento de esquema JSON: 1,00 de JSON valido y 1,00 de etiquetas permitidas en las cuatro evaluaciones publicadas.
- Capacidad de razonamiento: limitada; no realiza comparaciones numericas exactas de forma fiable entre umbrales.
- Tool calling / function calling: no soportado ni documentado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no; solo ingles.
- Capacidades especiales: ninguna declarada (sin vision, audio ni modo de razonamiento explicito). El autor lo etiqueta como "small-reasoner", pero el benchmark no respalda esa etiqueta.

## Casos de uso

- Capa secundaria en un pipeline con reglas deterministas: en el modo `hybrid_guarded` de Pomona, la plataforma devuelve las etiquetas de las reglas y ejecuta el modelo en paralelo sin que sus salidas alteren el resultado. Es el unico uso que el autor respalda explicitamente.
- Inferencia local en hardware de borde para invernaderos sin conectividad fiable: con 0,49 B de parametros en F16 (aproximadamente 1 GB de pesos), el modelo puede ejecutarse en CPU dentro de la propia instalacion mediante Ollama, sin enviar telemetria a servicios externos.
- Prototipado e investigacion sobre clasificacion de riesgo agronomico: sirve como punto de partida reproducible para estudiar como se comporta un modelo pequeno frente a umbrales numericos estrictos antes de invertir en un modelo mayor.
- Evaluacion de pipelines de decodificacion restringida: el repositorio incluye el prompt exacto y la configuracion (`temperature 0`, `num_predict 128`, esquema JSON) con la que se obtienen las metricas publicadas, util para comparar estrategias de salida estructurada.
- Pre-filtrado para revision humana: dado que la tasa de falsos negativos es alta (responde `[]` a casi todo en casos fuera de distribucion), solo tiene sentido como generador de candidatos que un tecnico revisa despues, nunca como filtro que descarte alertas.
- Comparacion de prompts y routers: la model card reporta 0,31 de F1 con el prompt corto del `model-router` frente al prompt largo documentado (0,34), lo que lo hace util como banco de pruebas para medir el impacto del prompt en modelos muy pequenos.
- Reproduccion de experimentos de ajuste fino: el adaptador LoRA de origen esta publicado por separado, lo que permite replicar el entrenamiento y verificar la hipotesis de memorizacion de plantillas.

## Benchmarks y rendimiento

| Evaluacion | Casos | JSON valido | Etiquetas permitidas | Coincidencia exacta | F1 de etiqueta |
|---|---|---|---|---|---|
| Golden suite, modelo solo | 15 | 1,00 | 1,00 | 0,60 | 0,60 |
| Split de test de misma distribucion, modelo solo | 473 | 1,00 | 1,00 | 0,88 | 0,89 |
| Agri Telemetry Sanity Bench `tomato_risk`, casos nuevos de umbral, modelo solo | 153 | 1,00 | 1,00 | 0,33 | 0,34 |
| Ruta con guardas de Pomona (reglas despues del modelo) | 15 golden | 1,00 | 1,00 | 1,00 | 1,00 |

Datos medidos el 2026-09-27 con `scripts/models/evaluate_tomato_risk_runtime.py` a traves de Ollama con `temperature 0`. Referencias adicionales citadas en la model card: una linea base que responde siempre `[]` obtiene 0,33 de coincidencia exacta en los 153 casos nuevos (mismo nivel que el modelo), y el prompt corto del `model-router` de Pomona obtiene 0,31 de F1. Las reglas deterministas de tomate de Pomona puntuan 1,00 tanto en la golden suite como en el benchmark de umbrales.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,0-1,5 GB con el GGUF F16 (los pesos suman en torno a 0,99 GB). Cuantizaciones adicionales no publicadas, pero generables localmente con llama.cpp (Q8_0 en torno a 0,5 GB y Q4_K_M en torno a 0,3 GB, estimaciones derivadas del tamano de los pesos).
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer con 2 GB o mas de VRAM es suficiente; tambien funciona en GPU integradas y en CPU.
- Cabe en GPU consumer: si, en practicamente todas las tarjetas de los ultimos diez anos (GTX 1050, RTX 3050, RTX 4090, etc.), y tambien en placas tipo Raspberry Pi 4/5 o mini-PC con 2 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama (es el runtime con el que se midieron los benchmarks, mediante `ollama create pomona-tomato-risk:v0.1.7 -f Modelfile`), y cualquier servidor compatible con GGUF. No se documenta soporte de vLLM ni TGI para este build.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo.
- Nota de integracion: la inferencia local con Ollama en Pomona esta desactivada por defecto y requiere `REASONER_BACKEND=ollama` con el modelo construido localmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Comportamiento en la tarea |
|---|---|---|---|---|---|
| Okyanus/pomona-tomato-risk-reasoner-v0.1.7-GGUF | 494.032.768 | No especificado (base: 32.768) | GGUF F16 | Apache 2.0 | 0,34 F1 en 153 casos nuevos; 0,89 F1 en test de misma distribucion |
| Okyanus/pomona-tomato-risk-reasoner-v0.1.7-lora | No disponible | No disponible | Adaptador LoRA (safetensors) | Apache 2.0 | Es el origen de este build; mismas limitaciones de comparacion numerica |
| Qwen/Qwen2.5-0.5B-Instruct (modelo base) | 494.032.768 (aproximadamente 0,49 B) | 32.768 tokens nativos | safetensors | Apache 2.0 | No entrenado para la tarea; no se publican metricas en este benchmark |
| Reglas deterministas de Pomona (no es un modelo neuronal) | No aplica | No aplica | Codigo | No disponible | 1,00 de coincidencia exacta y 1,00 de F1 en golden suite y en el benchmark de umbrales |

No se han localizado en la informacion disponible comparativas publicadas con otros modelos pequenos (SmolLM2, TinyLlama, Phi-3-mini) sobre este mismo benchmark.

## Limitaciones y advertencias

- Rendimiento insuficiente como clasificador autonomo: 0,34 de F1 en casos nuevos de umbral, al mismo nivel que responder siempre `[]`. El autor lo declara explicitamente como "research preview" y no como clasificador independiente.
- Memorizacion de plantillas: el split de test de misma distribucion comparte plantillas con el entrenamiento, por lo que el 0,89 de F1 sobreestima gravemente la capacidad real.
- Datos de entrenamiento sesgados en el rango de umbrales: solo se usaron dos valores de pH alto (7.2 y 7.4), lo que impide generalizar a valores intermedios o fuera de ese par.
- Incapacidad para comparaciones numericas exactas: es la limitacion estructural de un modelo de 0,49 B frente a umbrales como pH >= 7.2 o humedad >= 85 %. Las reglas deterministas realizan esa comparacion de forma perfecta y son siempre la autoridad.
- Sensibilidad a campos irrelevantes: cambiar solo `growth_stage`, un campo que no interviene en ningun umbral, puede convertir un `high_ph` correcto en `[]`.
- Riesgo de alucinacion: mitigado parcialmente por la decodificacion restringida a un esquema JSON con vocabulario cerrado (1,00 de JSON valido y 1,00 de etiquetas permitidas en las evaluaciones publicadas), pero la seleccion de etiquetas sigue siendo poco fiable.
- Idioma: solo ingles. No se documenta soporte de castellano ni de ningun otro idioma.
- Advertencias de seguridad explicitas del autor: uso exclusivamente advisory. Nunca debe emplearse para dosificar pesticidas o fertilizantes, modificar la fertirrigacion, controlar actuadores ni diagnosticar enfermedades. La etiqueta `fungal_pressure` significa "inspeccionar el cultivo", no un diagnostico.
- Requisito de despliegue: debe ir siempre detras de las reglas deterministas, el verificador de seguridad y la revision humana. El modo `model_only` esta pensado solo para evaluacion, y aun asi las reglas rellenan los campos de seguridad (acciones bloqueadas, revision humana).
- Licencia: Apache 2.0 permite uso comercial, pero la model card no ofrece ninguna garantia de idoneidad agronomica; el riesgo de decision recae en el integrador.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks independientes fuera de los publicados por el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Okyanus/pomona-tomato-risk-reasoner-v0.1.7-GGUF
- Adaptador LoRA de origen: https://huggingface.co/Okyanus/pomona-tomato-risk-reasoner-v0.1.7-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Okyanus/greenhouse-sensor-data
- Benchmark Agri Telemetry Sanity Bench: https://huggingface.co/datasets/Okyanus/agri-telemetry-sanity-bench
- Coleccion Pomona: https://huggingface.co/collections/Okyanus/pomona-local-ai-for-safer-greenhouse-decision-support
- Repositorio de la plataforma: https://github.com/okyanu/pomona
- Documentacion del razonador de riesgo: https://github.com/okyanu/pomona/blob/main/docs/TOMATO_RISK_REASONER.md
- Documentacion web del componente: https://okyanu.github.io/pomona/TOMATO_RISK_REASONER/
- Guia de entornos locales de modelos: https://okyanu.github.io/pomona/LOCAL_MODEL_RUNTIMES.md
- Guia de publicacion y datasets: https://okyanu.github.io/pomona/PUBLISHING/
- Ficha de terceros: https://free2aitools.com/dataset/okyanus/pomona-tomato-risk-reasoner-v0.1.7-lora
