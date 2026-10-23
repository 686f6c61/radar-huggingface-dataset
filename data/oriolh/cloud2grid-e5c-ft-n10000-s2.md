# oriolh/cloud2grid-e5c-ft-n10000-s2

## Resumen

Cloud2Grid E5c (`e5c_ft_n10000_s2`) es un modelo de grafos para flujo de potencia en corriente alterna, desarrollado por el autor de HuggingFace `oriolh` en el marco del proyecto Cloud2Grid. Consiste en un ajuste fino de GENCO (`gridfm/genco-pf-transfer`, Puech et al., 2026), el modelo fundacional de flujo de potencia de GridFM, sobre 10.000 estados sintéticos de flujo de potencia AC de la red reconstruida de Sundon de 33 kV (UK Power Networks). La arquitectura es la original de GENCO, `GNS_heterogeneous` de GraphKit, sin cambios; solo se han modificado los pesos.

El modelo resuelve la predicción del estado absoluto de la red (tensiones, residuos activos, potencia de importación) a partir de una representación en grafo heterogéneo, con la generación local solar y eólica modelada como nodos generadores explícitos (Leighton Buzzard). Es relevante como **línea base congelada** del estudio: su ajuste absoluto es razonable, pero en los experimentos evaluados responde muy débilmente a los cambios de generación solar, lo que motivó el desarrollo del modelo E5d, sensible a la respuesta.

No es un modelo de lenguaje: no procesa texto, no tiene ventana de contexto ni capacidades multilingües. Su interés es como pieza de infraestructura para estudios de redes de distribución con alta penetración fotovoltaica y como referencia reproducible de un pipeline de adaptación de un modelo fundacional de red a un feeder real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GraphKit `GNS_heterogeneous` (Graph Network Simulator sobre grafo heterogéneo; arquitectura GENCO sin modificar) |
| Parámetros totales | no disponible (el repositorio completo ocupa 0,2 GB e incluye una copia del archivo de release, por lo que el `state_dict` es de decenas de MB) |
| Longitud de contexto | no disponible (no aplica: modelo de grafos, no autoregresivo ni secuencial) |
| Tipos de cuantización | no disponible (solo se distribuye el `state_dict` original de `torch.save`; no hay GGUF, GPTQ ni versiones cuantizadas) |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | `best_model_state_dict.pt` (`torch.save`, cargable con `torch.load(weights_only=True)`) |
| Pipeline declarado | `graph-ml` |
| Dominio | Sistemas de potencia: flujo de potencia AC en redes de distribución |
| Red modelada | Sundon 33 kV (UK Power Networks), con generación en Leighton Buzzard como nodos generadores |
| Normalizador | `normalizer_stats.pt`, `baseMVA` 36,722; utilizable solo con este checkpoint |
| Dataset de ajuste | 10.000 estados sintéticos AC (generados con gridfm-datakit) |
| Dataset de verificación | `oriolh/cloud2grid-verification-synthetic-v1` |
| Checkpoint sha256 | `31b824241880ffc6807f2dad478c34c5c211ee31c7f403092e586c6373ab4d8a` |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura `GNS_heterogeneous` de GraphKit, la misma del checkpoint base `gridfm/genco-pf-transfer`. Se trata de un Graph Network Simulator que opera sobre un grafo heterogéneo de la red eléctrica (nodos de tipo bus y de tipo generador, con aristas que codifican la topología y los parámetros de línea) y que predice el estado del sistema en una sola pasada, sin decodificación iterativa. La adaptación a Sundon 33 kV introduce una representación *generator-aware*: la generación local (solar y eólica de Leighton Buzzard) deja de ser una inyección agregada y pasa a modelarse como nodos generadores explícitos dentro del grafo.

El ajuste fino se realizó durante 200 épocas, con la mejor época en la 195, inicialización desde los pesos preentrenados de GENCO y la receta `lr 5e-4`, `batch 64`, función de pérdida `0,1 · física + 0,9 · MSE enmascarada` (la pérdida original de GraphKit, sin término adicional de sensibilidad). El conjunto de entrenamiento son 10.000 estados sintéticos de flujo AC, no datos de operación reales. La selección del checkpoint siguió una regla preinscrita evaluada solo sobre validación sintética, pero **ninguna ejecución cumplió todos los criterios**, de modo que el checkpoint publicado fue escogido por la regla de reserva y está marcado como `FLAGGED` en el registro del proyecto.

## Capacidades

- Predicción de estado de flujo de potencia AC sobre la topología de Sundon 33 kV: magnitudes y ángulos de tensión, residuos activos y potencia de importación.
- Representación explícita de generadores (solar y eólico) como nodos del grafo, en lugar de inyecciones agregadas.
- Evaluación de errores por nodo y por magnitud (PBE en MVA, error de `Vm` en pu, MAE de importación en MW).
- Clasificación del signo de la importación (importación frente a exportación) con una precisión del 93,6 % para casos con |AC| ≥ 5 MW en el test retenido.
- Inferencia sobre lotes de estados en CPU, sin GPU, mediante el script de reproducción del proyecto.
- Integración con GraphKit mediante el fichero `graphkit_predict_config.yaml` y el esquema de entrada/salida documentado en `IO_SCHEMA.md`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- **Línea base en estudios de adaptación de modelos fundacionales de red:** sirve como referencia congelada y reproducible frente a la que medir la mejora de modelos sensibles a la respuesta (E5d); el proyecto incluye un verificador que reproduce las métricas en CPU en 2-3 minutos.
- **Screening masivo de estados de red sintéticos:** al predecir el estado completo en una sola pasada, permite evaluar lotes de escenarios de carga y generación sobre el feeder de Sundon sin ejecutar un solver AC completo para cada uno.
- **Digital twin de un feeder de distribución de 33 kV:** con el normalizador y la configuración exactos, se puede desplegar como aproximador del estado estacionario para monitorización y comparación contra medidas de campo en la red de Sundon.
- **Generación de datos de preentrenamiento y ajuste:** las predicciones del modelo y su error caracterizado por nodo sirven para construir datasets de verificación y para estudiar la propagación de error en pipelines de aprendizaje sobre redes eléctricas.
- **Despliegue en entornos sin GPU:** al ejecutarse en CPU (el repositorio completo son 0,2 GB), encaja en estaciones de trabajo de operación o en contenedores de CI para validación de topologías antes de un estudio AC.
- **Auditoría de metodología de adaptación:** el paquete incluye hashes, manifiesto de procedencia, `NOTICE.md` y un registro congelado, lo que lo hace utilizable como caso de estudio de reproducibilidad en investigación aplicada a sistemas de potencia.
- **Estudios de sensibilidad con salvedades:** puede emplearse para analizar el estado absoluto ante cambios de carga, pero no para cuantificar la respuesta a la generación solar, dado su comportamiento documentado en ese eje.

## Benchmarks y rendimiento

Test retenido sintético de E5c (2.804 estados):

| Métrica | Valor |
|---|---|
| PBE | 0,614 MVA |
| Residuo activo | 0,528 MW (DC-PF: 0,132) |
| Error de `Vm` | 0,0121 pu |
| MAE de importación | 13,6 MW |
| Precisión del signo de importación (\|AC\| ≥ 5 MW) | 93,6 % |

Comparación de respuesta a la generación solar en pares sintéticos retenidos (500 por tipo) frente a la referencia AC:

| Métrica | E5c | Referencia AC / dato real |
|---|---|---|
| Respuesta de importación (relativa a la referencia AC) | 0,014 | 1,0 (referencia AC) |
| Pendiente ajustada de importación | −0,04 MW por MW | −1,02 MW por MW sobre 2.829 estados reconstruidos de 2024 |

La tabla de comparación E5d frente a AC que aparece en la model card está truncada en la información disponible (columnas `Branch P`, `Vm` y siguientes sin valores), por lo que no se reproducen aquí. No se han publicado resultados de benchmarks estándar de aprendizaje automático (MMLU, HumanEval, GSM8K u otros): no aplican a este dominio y no están disponibles.

## Requisitos de hardware

- **VRAM estimada:** no disponible con precisión al no publicarse el número de parámetros; el `state_dict` ocupa decenas de MB dentro de un repositorio de 0,2 GB, por lo que la huella es muy inferior a 1 GB en el formato original.
- **GPU recomendadas:** no se especifican en la información disponible. Dado el tamaño del artefacto, cualquier GPU consumer reciente es sobrada; el proyecto valida explícitamente la inferencia en CPU.
- **CPU:** viable y es la vía soportada por el script de verificación (`reproduce/verify_models.py`), que ejecuta la comprobación completa en CPU en 2-3 minutos, incluyendo la verificación de hashes SHA256.
- **Opciones de despliegue:** PyTorch más GraphKit, con la configuración `graphkit_predict_config.yaml` y el normalizador `normalizer_stats.pt`. No aplica vLLM, llama.cpp, Ollama ni TGI: no es un modelo autoregresivo ni se distribuye en GGUF.
- **Latencia y throughput:** no disponibles de forma desagregada. El único dato publicado es el tiempo del verificador completo (2-3 minutos en CPU para todas las comprobaciones del release), que incluye carga de modelos y comparación de 44 métricas, no una medida de inferencia por muestra.
- **Almacenamiento:** 0,2 GB para el repositorio completo, incluyendo la copia del archivo de release.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cloud2Grid E5c (`oriolh/cloud2grid-e5c-ft-n10000-s2`) | no disponible | no aplica | PBE 0,614 MVA; MAE importación 13,6 MW; respuesta solar 0,014 de la referencia AC | Apache-2.0 | HuggingFace, release `cloud2grid-models-v1` |
| GENCO (`gridfm/genco-pf-transfer`) | no disponible | no aplica | Modelo base preentrenado; sin métricas específicas de Sundon en la información disponible | Apache-2.0 | HuggingFace |
| Cloud2Grid E5d (`oriolh/cloud2grid-e5d-l1-s0`) | no disponible | no aplica | Variante sensible a la respuesta, diseñada para corregir la debilidad de E5c; métricas comparativas truncadas en la información disponible | no disponible en la información | HuggingFace, release `cloud2grid-models-v1` |

No se han identificado en la información proporcionada otros modelos comparables de flujo de potencia sobre grafos para esta red concreta.

## Limitaciones y advertencias

- **Respuesta débil a la generación solar:** en pares sintéticos retenidos la respuesta de importación es solo 0,014 de la referencia AC, con pendiente ajustada de −0,04 MW por MW frente a −1,02 en estados reconstruidos de 2024. No debe usarse para cuantificar el efecto de cambios en generación fotovoltaica.
- **Selección marcada como `FLAGGED`:** ninguna ejecución cumplió todos los criterios de la regla preinscrita y el checkpoint se eligió por la regla de reserva; los autores lo documentan explícitamente.
- **Entrenamiento solo con datos sintéticos:** los 10.000 estados provienen de gridfm-datakit, no de operación real; el comportamiento fuera de la distribución sintética no está caracterizado.
- **Alcance de una única red:** el modelo está ajustado a la topología de Sundon 33 kV; no es un modelo general de flujo de potencia y no se garantiza su transferencia a otras topologías.
- **Resultados de 2024 no reproducibles:** las métricas sobre los 2.829 estados reconstruidos de 2024 requieren datos de operación que no se distribuyen; solo las afirmaciones sintéticas son verificables desde el repositorio.
- **Dependencia estricta del normalizador:** `normalizer_stats.pt` solo es válido con este checkpoint (`baseMVA` 36,722); mezclar normalizadores invalida las predicciones.
- **Carga no estándar:** el formato es un `state_dict` de `torch.save` que requiere reconstruir el modelo `GNS_heterogeneous` de GraphKit con la configuración publicada; no se puede cargar con `transformers` ni con runtimes genéricos.
- **Sin cuantización ni formatos ligeros:** no hay GGUF, ONNX ni versiones reducidas publicadas.
- **Riesgo de extrapolación:** como aproximador aprendido, puede producir estados físicamente inconsistentes fuera del rango de entrenamiento; el residuo activo de 0,528 MW frente a 0,132 MW de DC-PF indica que no sustituye a un solver AC en validación formal.
- **Licencia:** Apache-2.0 permite uso comercial con atribución; los datos de red derivan de open data de UK Power Networks (CC BY 4.0) y la atribución está en `NOTICE.md`. El modelo base es también Apache-2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oriolh/cloud2grid-e5c-ft-n10000-s2
- Modelo base GENCO: https://huggingface.co/gridfm/genco-pf-transfer
- Paper de GENCO (Puech et al., 2026): https://arxiv.org/abs/2608.09921
- Sitio web del proyecto Cloud2Grid: https://hinox13.github.io/grid2cloud/
- Código del proyecto: https://github.com/hinox13/grid2cloud
- Release de modelos `cloud2grid-models-v1`: https://github.com/hinox13/grid2cloud/releases/tag/cloud2grid-models-v1
- Instrucciones de reproducción: https://github.com/hinox13/grid2cloud/blob/cloud2grid-models-v1/reproduce/README.md
- Dataset de verificación: https://huggingface.co/datasets/oriolh/cloud2grid-verification-synthetic-v1
- Modelo E5d (variante sensible a la respuesta): https://huggingface.co/oriolh/cloud2grid-e5d-l1-s0
- Registro congelado del checkpoint: `metadata/e5c_checkpoint_registry.yaml` en el repositorio de código, etiqueta `cloud2grid-submission-v1`

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de la información de HuggingFace.
