# jiosephlee/intern-s1-mini-assay-transfer-record-level-v27-bioavailability-ma-l2-best

## Resumen

El modelo `jiosephlee/intern-s1-mini-assay-transfer-record-level-v27-bioavailability-ma-l2-best` es un ajuste fino (fine-tuning) de tipo transfer learning sobre el modelo base `jiosephlee/Intern-S1-mini-lm`, orientado a la prediccion de propiedades quimicas concretas: la transferencia de ensayos (assay transfer) de biodisponibilidad oral en el nivel L2 de un conjunto de datos de registros moleculares. Lo desarrolla el usuario `jiosephlee` y esta publicado en HuggingFace bajo la libreria `transformers`, con pesos en formato `safetensors` y 8.201.221.120 parametros reales.

El problema que aborda es la prediccion, a nivel de registro, de un valor continuo asociado a biodisponibilidad oral (una tarea de regresion) a partir de representaciones moleculares, empleando una metrica de seleccion basada en KNN con MAE@3 (joint ID/OOD level-macro). No se trata de un modelo de proposito general con benchmarks de lenguaje, sino de un checkpoint especializado de quimica computacional dentro de una campana de entrenamiento mas amplia.

Es relevante en el contexto de la experimentacion abierta con modelos cientificos y de quimica: muestra como un modelo de lenguaje pequeno-mediano (8.2B) puede reutilizarse para tareas de regresion estructurada sobre datasets moleculares, con atencion a la generalizacion fuera de distribucion (OOD), un aspecto critico cuando se trabaja con espacio quimico no visto durante el entrenamiento. El checkpoint publicado corresponde al paso 500 de una campana interrumpida tras el paso 580 (4.5 de 10 epocas planificadas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado como `qwen3` en los tags; base `Intern-S1-mini-lm`) |
| Parametros totales | 8.201.221.120 (8.2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en precision completa; cuantizaciones adicionales no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repo | 16.4 GB |
| Modelo base | jiosephlee/Intern-S1-mini-lm |
| Dataset de entrenamiento | jiosephlee/assay-transfer-record-level-v27-bioavailability-ma-l2-intern (revision `fecee3c43fe00d264fd7cbfbbcc82c6eb18379a6`) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Los tags del repositorio apuntan a una arquitectura transformer (referenciada como `qwen3`) construida sobre el modelo base `jiosephlee/Intern-S1-mini-lm`, con 8.2B parametros totales y pesos en `safetensors`. No se detalla la composicion del dataset de preentrenamiento del modelo base ni si este incorpora componentes multimodales, mezcla de expertos o atencion lineal, por lo que esos extremos quedan como no disponibles.

En cuanto al ajuste fino, la model card indica los siguientes hiperparametros: batch por dispositivo de 4 sobre 8 GPU, acumulacion de gradiente de 4, atencion con FlashAttention 2 y empaquetado de secuencias sin relleno (padding-free BFD packing). Se selecciono el checkpoint del paso 500, y el entrenamiento se detuvo en el paso 580, lo que corresponde a 4.5 de las 10 epocas planificadas. La metrica de seleccion fue la MAE@3 de regresion KNN con nivel conjunto ID/OOD (level-macro). No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales, dado el caracter de regresion de la tarea.

## Capacidades

- Regresion sobre propiedades moleculares: prediccion de un valor continuo de biodisponibilidad oral a nivel de registro dentro del pipeline de transferencia de ensayos v27.
- Generalizacion fuera de distribucion (OOD): el checkpoint se selecciono optimizando una metrica conjunta ID/OOD, con un MAE@3 OOD de 0.5765, mejor que el ID (0.9007).
- Generacion de texto: por su naturaleza de modelo de lenguaje (`text-generation`) y su compatibilidad con Text Generation Inference, puede producir texto, aunque su utilidad principal en este checkpoint es la regresion.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado ni validado en este checkpoint).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponible (no declarado).

## Casos de uso

- Filtrado temprano en descubrimiento de farmacos: usar el modelo para estimar biodisponibilidad oral en lotes de candidatos generados in silico, priorizando compuestos antes de sintesis o ensayos costosos, gracias a su enfasis en generalizacion OOD.
- Priorizacion de compuestos en cribado virtual: integrar la prediccion como una senal adicional junto a descriptores clasicos (Morgan fingerprints, propiedades fisicoquimicas) para ordenar librerias quimicas.
- Transferencia de ensayos entre campanas: reutilizar el checkpoint en nuevas tandas de experimentos de assay transfer empleando la misma formulacion de nivel L2, aprovechando que fue seleccionado con una metrica KNN de nivel macro.
- Investigacion en quimioinformatica: servir como punto de comparacion frente a lineas base de huellas moleculares (Morgan vanilla y ponderadas), tal y como anuncia la model card para la fase de evaluacion en test.
- Fine-tuning adicional sobre nuevos datasets de registros: al ser un checkpoint intermedio (paso 500 de 580), puede reutilizarse como inicializacion para dominios quimicos relacionados.
- Despliegue en pipelines de inferencia batch: su compatibilidad con `transformers` y Text Generation Inference permite integrarlo en servicios de prediccion por lotes sobre grandes conjuntos de moleculas.
- Analisis de robustez OOD en modelos cientificos: util para estudiar como se comporta un modelo de lenguaje de 8.2B frente a espacio quimico no visto, comparando metricas ID y OOD.

## Benchmarks y rendimiento

Resultados de validacion en el checkpoint seleccionado (paso 500), segun la model card:

| Metrica | Valor |
|---|---:|
| Joint ID/OOD MAE@3 | 0.7386 |
| ID MAE@3 | 0.9007 |
| OOD MAE@3 | 0.5765 |
| Spearman@3 | 0.0816 |
| Top1@3 | 0.2231 |

No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los resultados de test contra Morgan fingerprints vanilla y ponderados quedan pendientes de evaluacion segun el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 16-17 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que se recomienda al menos 20-24 GB.
- Cuantizacion de 8 bits: aproximadamente 8-9 GB de pesos, viable en GPU de 12-16 GB.
- Cuantizacion de 4 bits: aproximadamente 4-5 GB de pesos, viable en GPU consumer de 8-10 GB.
- GPU recomendadas para entrenamiento: el autor uso 8 GPU con batch 4 y acumulacion 4; se infiere un cluster multigpu (perfil tipo A100/H100 o similar), aunque no se especifica el modelo exacto.
- GPU consumer: cabe en RTX 4090 (24 GB) en fp16 y en tarjetas de 12-16 GB con cuantizacion.
- Opciones de despliegue: `transformers` (nativo), Text Generation Inference (TGI) por su tag `text-generation-inference`, y potencialmente vLLM o llama.cpp/Ollama mediante conversion a GGUF (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| intern-s1-mini-assay-transfer-...-v27 (este) | 8.2B | no disponible | Joint ID/OOD MAE@3 0.7386 | no disponible | HuggingFace |
| jiosephlee/Intern-S1-mini-lm (base) | no disponible | no disponible | no disponible para esta tarea | no disponible | HuggingFace |
| Morgan fingerprints ponderados | no aplica (baseline no neuronal) | no aplica | pendiente de evaluacion en test | no aplica | metodo estandar |
| Morgan fingerprints vanilla | no aplica (baseline no neuronal) | no aplica | pendiente de evaluacion en test | no aplica | metodo estandar |

No se dispone de comparativas con otros modelos de lenguaje de tamano similar aplicados a esta misma tarea de biodisponibilidad en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 500 de un entrenamiento detenido en el paso 580 (4.5 de 10 epocas), por lo que no es un modelo convergido ni finalizado.
- Correlacion de ranking baja: el valor Spearman@3 de 0.0816 sugiere una capacidad de ordenacion muy limitada, lo que restringe su uso en tareas de priorizacion fina.
- Top1@3 de 0.2231: la precision en la primera posicion es modesta, lo que debe tenerse en cuenta si se usa para seleccionar un unico candidato.
- Riesgo de alucinacion y de extrapolacion incorrecta fuera del dominio quimico cubierto por el dataset de entrenamiento; las predicciones OOD, aunque con menor MAE, no implican validez fisicoquimica.
- Sesgos: no disponibles; no se documenta analisis de sesgos ni de cobertura del espacio quimico.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribucion, lo que supone un riesgo legal para produccion.
- Idiomas y contexto: no declarados, por lo que no se recomienda su uso como modelo de lenguaje general.
- Ausencia de evaluacion en test: los resultados contra lineas base de Morgan fingerprints estan pendientes, de modo que no se ha demostrado aun que supere a metodos clasicos.
- Trazabilidad: el dataset esta fijado a una revision concreta, lo que ayuda a la reproducibilidad, pero no se documentan detalles de composicion, tamanos ni filtros.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/jiosephlee/intern-s1-mini-assay-transfer-record-level-v27-bioavailability-ma-l2-best
- Modelo base: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Dataset de entrenamiento: https://huggingface.co/datasets/jiosephlee/assay-transfer-record-level-v27-bioavailability-ma-l2-intern
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
