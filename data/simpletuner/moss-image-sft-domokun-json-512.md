# SimpleTuner/moss-image-sft-domokun-json-512

## Resumen

`SimpleTuner/moss-image-sft-domokun-json-512` es un adaptador LoRA de rango 32 en BF16 entrenado sobre el modelo base `OpenMOSS-Team/MOSS-Image-SFT`, un modelo de difusion para generacion de imagenes. Lo publica el proyecto SimpleTuner dentro de su serie de experimentos "MOSS-Image LoRA experiments", y no es un modelo completo: es un conjunto de pesos de adaptacion que se carga junto con el checkpoint base para incorporar un concepto visual concreto (el personaje "Domokun") en la generacion de imagenes.

El entrenamiento esta declarado como completado, con 10.000 de 10.000 actualizaciones observadas, a una resolucion equivalente de 512 px manteniendo las relaciones de aspecto originales. El dataset empleado es `RareConcepts/Domokun`, una revision concreta de solo 29 imagenes, y las captions son JSON nativas compartidas entre las dos variantes del experimento. Se publican checkpoints intermedios cada 500 actualizaciones, hasta el adaptador final de la actualizacion 10.000.

Su relevancia es doble: por un lado documenta de forma reproducible un flujo completo de fine-tuning con SimpleTuner (config de entrenamiento, dataloader, prompts y manifiesto del dataset publicados); por otro, sirve como referencia tecnica de que resultados cabe esperar con un dataset extremadamente pequeno (29 imagenes) y un presupuesto de calculo de una sola GPU H100 de 80 GB. No hay informacion publicada sobre evaluaciones cuantitativas ni sobre el rendimiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion `MOSS-Image-SFT`; el tipo exacto de backbone del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible (adaptador LoRA de rango 32 en BF16; el numero de parametros del adaptador no se indica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | BF16 para el adaptador; cuantizaciones del modelo base no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `pytorch_lora_weights.safetensors` (formato diffusers / SimpleTuner), checkpoints each 500 updates |

Otros datos tecnicos del entrenamiento: rango 32, precision BF16, batch 4, learning rate 0.0001, semilla 42, tecnica REPA, una GPU H100 de 80 GB, 10.000 actualizaciones, resolucion 512 px equivalente con relaciones de aspecto preservadas. Validacion con 50 pasos de muestreo, CFG 3, semilla 42 y cuatro prompts cada 500 actualizaciones.

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA de rango 32 en BF16 que se aplica sobre `OpenMOSS-Team/MOSS-Image-SFT`. La arquitectura subyacente corresponde, por tanto, a la del modelo base de difusion de MOSS-Image, si bien la model card no detalla el tipo de backbone (UNet, DiT u otra variante) ni el numero de parametros del modelo base. El entrenamiento se realizo con SimpleTuner y arranca desde el checkpoint liberado del modelo base, sin LoRA asistente previa en ninguna de las dos variantes del experimento.

El dataset es `RareConcepts/Domokun`, en la revision `2e4831a72f2a701c080e0046c8f8ec41cb1ccbcf`, con 29 imagenes; los ficheros del dataset no se redistribuyen en el repositorio. Las captions son JSON nativas y se comparten entre las dos variantes ("flavours") del experimento, lo que permite comparar directamente el efecto de otras variables de entrenamiento. La innovacion reseñable no es arquitectonica sino metodologica: se publican la configuracion de entrenamiento (`training_config.json`), la configuracion del dataloader (`dataloader.json`), los prompts de validacion (`prompts.json`) y el manifiesto del dataset (`dataset-manifest.json`), de modo que el run es replicable. No se documenta en la informacion disponible el uso de RLHF, DPO ni etapas de alineacion, algo por otra parte poco habitual en modelos de difusion.

## Capacidades

- Generacion de imagenes condicionada por texto a traves del modelo base `MOSS-Image-SFT`, con el estilo y concepto aprendidos del adaptador.
- Personalizacion de concepto: inyeccion del personaje "Domokun" a partir de 29 imagenes de referencia.
- Generacion a resolucion de 512 px equivalente, preservando relaciones de aspecto no cuadradas.
- Compatibilidad con el ecosistema `diffusers` (libreria declarada) y con el formato de pesos de SimpleTuner.
- Ajuste del grado de aplicacion del adaptador mediante el scale de LoRA en tiempo de inferencia (mecanismo estandar de LoRA; no se documentan valores recomendados).
- Checkpoints intermedios cada 500 actualizaciones (20 en total), utiles para comparar sobreajuste frente a fidelidad al concepto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio: es un modelo de sintesis de imagen.
- Cobertura multilingue de prompts: no disponible.

## Casos de uso

- Generacion de arte de personaje consistente: cargando el adaptador sobre el checkpoint base en `diffusers` se obtiene el personaje Domokun en escenas nuevas; el rango 32 y las 10.000 actualizaciones buscan Maximizar la fidelidad al concepto.
- Prototipado de pipelines de difusion personalizados: sirve como caso de prueba reproducible para validar integraciones de SimpleTuner con `diffusers` antes de entrenar adaptadores propios.
- Estudio de sobreajuste con datasets minimos: los 20 checkpoints publicados permiten analizar la curva de fidelidad frente a diversidad con solo 29 imagenes de entrenamiento, un escenario habitual en produccion cuando hay pocas referencias.
- Generacion de material promocional o editorial tematico: al conservar relaciones de aspecto, los resultados se integran en formatos de banner, story o thumbnail sin recortes agresivos.
- Investigacion comparativa de recetas de fine-tuning: al compartir captions JSON con la otra variante del experimento, permite aislar el efecto de los hiperparametros sobre el resultado visual.
- Base para entrenamientos derivados: el adaptador puede actuar como punto de partida (o como referencia negativa) en nuevos runs de LoRA sobre `MOSS-Image-SFT`, con configuracion y semilla documentadas.
- Demo interna de personalizacion de marca: para equipos que quieran evaluar coste y calidad de un LoRA de concepto entrenado en una sola H100 antes de comprometer presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye imagenes cualitativas de validacion en la actualizacion 10.000 (prompts `astronaut`, `garden`, `retention` y `studio`, a 512x512), sin metricas numericas como FID, CLIP score o similitud de concepto.

## Requisitos de hardware

- VRAM de inferencia: no disponible para el modelo base. El adaptador LoRA en BF16 es ligero y anade un coste marginal de memoria frente al checkpoint base.
- GPU de entrenamiento documentada: una NVIDIA H100 de 80 GB, con batch 4 y rango 32 en BF16.
- GPU recomendadas para inferencia: no disponible; depende enteramente de los requisitos de `MOSS-Image-SFT`, que la informacion proporcionada no especifica.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos que permitan afirmar que quepa en RTX 4090, 3090 o similares.
- Opciones de despliegue: `diffusers` (libreria declarada) y el formato de pesos de SimpleTuner; soporte de vLLM, llama.cpp, Ollama o TGI no aplica a un modelo de difusion y no se documenta ninguna alternativa especifica.
- Latencia y throughput: no disponibles. La validacion usa 50 pasos de muestreo con CFG 3, lo que da una idea del orden de pasos por imagen, pero sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `SimpleTuner/moss-image-sft-domokun-json-512` | LoRA rango 32 sobre MOSS-Image-SFT | No disponible | No aplica | Sin benchmarks publicados | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| Otras variantes de MOSS-Image LoRA experiments (SimpleTuner) | LoRA sobre el mismo base | No disponible | No aplica | Sin benchmarks publicados en la informacion disponible | No disponible | HuggingFace |
| `OpenMOSS-Team/MOSS-Image-SFT` (modelo base) | Modelo de difusion completo | No disponible | No aplica | No disponible | No disponible | HuggingFace |
| Alternativas de LoRA para personalizacion de concepto en otros modelos de difusion | LoRA | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de datos objetivos (parametros, contexto, metricas, licencia) de las alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar `OpenMOSS-Team/MOSS-Image-SFT` para funcionar; el repositorio solo contiene el adaptador y los checkpoints.
- Dataset de entrenamiento extremadamente pequeno (29 imagenes): riesgo alto de sobreajuste al concepto y baja diversidad en las composiciones generadas.
- Las capacidades del adaptador estan acotadas al concepto Domokun; no mejora el rendimiento general del modelo base en otras tareas.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de calidad, fidelidad al concepto ni degradacion del modelo base (olvido catastrofico).
- No se documentan sesgos; al ser un LoRA de concepto sobre imagenes de un personaje concreto, los sesgos heredados son los del modelo base, no evaluados aqui.
- Riesgo de alucinacion visual y de artefactos en escenas alejadas de la distribucion de las 29 imagenes de entrenamiento.
- Idiomas soportados y calidad de seguimiento de prompts multilingues: no disponible; las captions de entrenamiento son JSON nativas, sin idioma declarado.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial depende tambien de la licencia y condiciones del modelo base, que no se detallan en la informacion disponible.
- Los ficheros del dataset no se redistribuyen; la reproducibilidad depende de la disponibilidad de `RareConcepts/Domokun` en la revision indicada.
- Popularidad practicamente nula (0 descargas, 0 likes) y estado de "experimento": no hay evidencia de uso en produccion ni soporte de la comunidad.
- No hay informacion sobre cuantizaciones del adaptador ni sobre su comportamiento combinado con versiones cuantizadas del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SimpleTuner/moss-image-sft-domokun-json-512
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Serie de experimentos LoRA: https://huggingface.co/SimpleTuner/moss-image-LoRA-experiments
- Dataset de entrenamiento: https://huggingface.co/datasets/RareConcepts/Domokun
- Checkpoint final (actualizacion 10.000): https://huggingface.co/SimpleTuner/moss-image-sft-domokun-json-512/tree/main/checkpoint-10000

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (papers, blogs, repos o demos); los unicos enlaces verificables son los anteriores.
