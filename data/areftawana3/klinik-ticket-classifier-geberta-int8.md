# Areftawana3/klinik-ticket-classifier-geberta-int8

## Resumen
El Klinik-Ticket-Klassifikator es un clasificador de texto en alemán especializado en tickets de soporte informático hospitalario. Lo publica el usuario Areftawana3 sobre el modelo base ikim-uk-essen/geberta-base, un DeBERTa-v2 preentrenado en alemán general, informal y médico, y se distribuye ya cuantizado a int8 en formato ONNX. El modelo resuelve una tarea acotada: asignar cada ticket a una de cuatro categorías (`Hardware`, `Software/Kliniksystem`, `Access/Identity`, `Netzwerk`).

El interés práctico está en su coste de despliegue: el artefacto ocupa 137 MB y clasifica un ticket en unos 44 ms usando solo dos hilos de CPU, lo que permite ejecutarlo en servidores modestos o entornos on-premise sin GPU, algo relevante en infraestructura hospitalaria con restricciones de conectividad y de tratamiento de datos.

Es, sin embargo, un proyecto de investigación y portafolio. El ajuste fino se hizo en dos etapas (unos 3.400 tickets de TI en alemán y después 165 tickets hospitalarios aumentados), los conjuntos de evaluación son muy pequeños y los datos de transferencia son sintéticos y no proceden de un hospital real, por lo que no debe emplearse en decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DeBERTa-v2 (modelo base ikim-uk-essen/geberta-base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (ONNX Runtime); no se documentan otros formatos |
| Idiomas soportados | aleman (de) |
| Licencia | MIT (el modelo declara MIT, pero los datos de transferencia son CC BY-NC 4.0; ver advertencias) |
| Formato de pesos | ONNX int8, 137 MB |
| Pipeline | text-classification |
| Etiquetas de salida | Hardware, Software/Kliniksystem, Access/Identity, Netzwerk |
| Tamano del repositorio | 0,1 GB |
| Libreria | onnx |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La arquitectura es un encoder transformer DeBERTa-v2 tomado de ikim-uk-essen/geberta-base, un checkpoint preentrenado en alemán general, informal y médico. Sobre ese modelo base se aplica un ajuste fino en dos etapas. La primera etapa emplea aproximadamente 3.400 tickets de TI en alemán procedentes del dataset Tobi-Bueck/customer-support-tickets, cuyas etiquetas originales se remapearon a las cuatro categorías objetivo. La segunda etapa usa 165 tickets hospitalarios, aumentados con abreviaturas, erratas, omisión de diéresis y variantes en minúscula, y se entrena con entropía cruzada ponderada por clase para compensar el desequilibrio.

El artefacto final se distribuye como ONNX con cuantización dinámica a int8, lo que explica su tamano reducido y su latencia en CPU. No se documentan en la información disponible el número de tokens de entrenamiento del modelo base, el uso de RLHF o DPO, ni innovaciones de decodificación (es un clasificador, no un generador). El modelo espera el preprocesado del proyecto original, que incluye anotación de abreviaturas y enmascarado de datos personales, implementado en `src/clinical_text.py` y `src/predict.py` del repositorio de GitHub.

## Capacidades
- Clasificación de tickets de soporte TI en alemán en cuatro categorías: `Hardware`, `Software/Kliniksystem`, `Access/Identity` y `Netzwerk`.
- Salida adicional de prioridad asignada por reglas transparentes del proyecto, no por el modelo.
- Robustez parcial ante texto informal: el entrenamiento de la segunda etapa incluye abreviaturas, erratas, ausencia de diéresis y minúsculas.
- Inferencia en CPU sin GPU gracias a la cuantización int8 (aproximadamente 44 ms por ticket con 2 hilos).
- Compatibilidad declarada con Hugging Face Inference Endpoints y con el stack text-embeddings-inference segun las etiquetas del repositorio.
- No soporta generación de texto, razonamiento multi-paso, tool calling, visión, audio ni capacidades multilingües más allá del alemán.
- No se documenta modo de razonamiento (thinking mode) ni ventana de contexto extensa.

## Casos de uso
- Triaje de tickets de TI hospitalario: cada incidencia entrante se clasifica en una de las cuatro categorías y se enruta a la cola correspondiente, aprovechando la latencia de 44 ms por ticket para procesar colas completas en tiempo real.
- Enrutado y priorización en mesas de ayuda (service desk): combinado con las reglas de prioridad del proyecto, permite ordenar la cola de trabajo por categoría y criticidad antes de que intervenga un técnico.
- Etiquetado retrospectivo de históricos: clasificación masiva de tickets antiguos no etiquetados para construir series temporales por categoría y alimentar informes de incidencias recurrentes.
- Despliegue on-premise en entornos hospitalarios sin GPU: al ocupar 137 MB en int8 y ejecutarse en CPU, encaja en servidores internos con restricciones de conectividad o de salida de datos.
- Preprocesado para pipelines de RAG o asistentes internos: la categoría predicha puede usarse como metadato de filtrado antes de que un LLM generativo redacte la respuesta al usuario.
- Monitorización de tendencias operativas: agregación de predicciones por categoría y periodo para detectar picos de incidencias de red, accesos o sistema clínico.
- Prototipado y demostración: validación rápida del enfoque mediante el Space de Hugging Face antes de invertir en un etiquetado propio a mayor escala.
- Investigación sobre robustez y aumento de datos: la estrategia de aumentación (erratas, abreviaturas, minúsculas) y el análisis de errores documentado sirven como referencia metodológica para otros clasificadores de dominio alemán.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son de macro-F1 sobre dos conjuntos de evaluación del propio proyecto:

| Modelo | Conjunto de test (40 tickets) | Conjunto difícil (20 tickets parafraseados sin palabras clave típicas) |
|---|---|---|
| TF-IDF + n-gramas de caracteres + regresión logística | 0,950 | 0,691 |
| Este modelo (int8) | 1,000 | 0,903 |

Advertencia del autor: los conjuntos son pequenos y un solo ticket desplaza la puntuación del conjunto difícil en unos 5 puntos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar, y no aplican a un clasificador de este tipo. La evaluación completa, la comparación de funciones de pérdida y el análisis de errores están en el repositorio de GitHub del proyecto.

## Requisitos de hardware
- Pesos: 137 MB en ONNX int8; el repositorio completo ocupa 0,1 GB.
- VRAM: no requiere GPU. Para ejecución en GPU, la huella es inferior a 1 GB, estimada a partir del tamano del artefacto y no de una medición publicada por el autor.
- GPU recomendadas: no aplica; el modelo está pensado para CPU. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) es sobredimensionada para esta carga.
- CPU: funciona en CPU convencional; el autor reporta unos 44 ms por ticket con 2 hilos, lo que equivale a del orden de 22 tickets por segundo en esa configuración.
- Opciones de despliegue: ONNX Runtime en un contenedor Python, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`) y stack text-embeddings-inference segun las etiquetas del repositorio. El uso requiere importar el preprocesado del repositorio de GitHub.
- Latencia y throughput: medidos únicamente para CPU en las condiciones indicadas; no hay datos publicados de latencia en GPU ni de throughput con mayor paralelismo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Macro-F1 (test / dificil) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (GeBERTa int8 ONNX) | Clasificador DeBERTa-v2 cuantizado | no disponible | no disponible | 1,000 / 0,903 | MIT (datos de transferencia CC BY-NC 4.0) | Hugging Face, ONNX, demo en Space |
| TF-IDF + n-gramas de caracteres + LogReg | Baseline clasico | no aplica (no neuronal) | no aplica | 0,950 / 0,691 | no disponible | Entrenable localmente |
| ikim-uk-essen/geberta-base | Modelo base DeBERTa-v2 en alemán | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de comparaciones con otros clasificadores alemanes de tickets de soporte en la información proporcionada; cualquier alternativa de la misma categoría queda como no disponible.

## Limitaciones y advertencias
- Los tickets hospitalarios usados en el ajuste no proceden de un hospital real: fueron redactados para el proyecto. Los datos de transferencia son sintéticos y están licenciados bajo CC BY-NC 4.0, por lo que el modelo debe tratarse como no comercial pese a que el repositorio declare licencia MIT. Conviene verificar esta discrepancia antes de cualquier uso en producción.
- El autor indica explícitamente que es un proyecto de investigación y portafolio, no apto para uso clínico.
- La prioridad de cada ticket se asigna mediante reglas transparentes, no mediante el modelo; no debe interpretarse la salida del clasificador como una evaluación de criticidad clínica.
- Los conjuntos de evaluación son muy pequenos (40 y 20 tickets), con una sensibilidad de unos 5 puntos por ticket en el conjunto difícil. Las cifras de macro-F1 no son concluyentes.
- Solo soporta alemán. El rendimiento fuera de ese idioma no está documentado y previsiblemente será muy bajo.
- Requiere el preprocesado del proyecto (anotación de abreviaturas y enmascarado de datos personales). Usar el modelo sin ese pipeline puede degradar notablemente las predicciones.
- Es un clasificador, no un generador: el riesgo de alucinación de texto no aplica, pero sí el de falsos positivos y falsos negativos en tickets atípicos o ambiguos.
- No hay datos publicados sobre sesgos por subgrupo, calibración de probabilidades ni comportamiento ante dominios distintos del de entrenamiento.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validación independiente de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Areftawana3/klinik-ticket-classifier-geberta-int8
- Modelo base: https://huggingface.co/ikim-uk-essen/geberta-base
- Dataset de entrenamiento (etapa 1): https://huggingface.co/datasets/Tobi-Bueck/customer-support-tickets
- Repositorio del proyecto (evaluación, funciones de pérdida y análisis de errores): https://github.com/AT3060/Klinik-Ticket-Classifier
- Demo: Space de Hugging Face "Klinik-Ticket-Klassifikator" (URL directa no disponible en la información proporcionada)
