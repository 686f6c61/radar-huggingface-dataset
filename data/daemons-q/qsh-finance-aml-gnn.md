# Daemons-Q/qsh-finance-aml-gnn

## Resumen

qsh-finance-aml-gnn es un modelo de clasificación tabular sobre grafos dirigidos multigrafo, orientado a la detección de blanqueo de capitales (AML, anti-money laundering) en transacciones financieras. Lo publica el autor Daemons-Q como parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, una demostración de orquestación "quantum-safe". El modelo no es un transformer de lenguaje: es una red neuronal sobre grafos (GNN) exportada a ONNX, que opera sobre ventanas de transacciones y sus vecindades para etiquetar cada transferencia como lícita o sospechosa.

La arquitectura es Multi-PNA+EU, la implementación oficial de IBM (repositorio IBM/Multi-GNN en el commit 252b025, licencia Apache-2.0), descrita en Egressy et al., "Provably Powerful Graph Neural Networks for Directed Multigraphs" (AAAI 2024). Se trata de una PNA (Principal Neighbourhood Aggregation) con paso de mensajes inverso, numeración de puertos multigrafo, identificadores de ego y actualizaciones de aristas, configurada aquí con 2 capas de anchura 20. El autor la ha reentrenado con el código de IBM sobre el dataset sintético IBM AMLworld HI-Small y la ha exportado a ONNX (opset 18) para ejecutarse en onnxruntime-web en texto plano.

Su relevancia es doble: por un lado, reproduce y mide con rigor un baseline académico de referencia en detección de fraude sobre grafos; por otro, documenta de forma transparente las diferencias entre la métrica que reporta el bucle de entrenamiento original de IBM (F1 en modo entrenamiento) y la del modelo exportado (modo evaluación, BatchNorm recalculado y umbral ajustado en validación). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-PNA+EU (PNA con reverse message passing, multigraph port numbering, ego IDs y edge updates); 2 capas de anchura 20 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre ventanas de vecindad del grafo, no sobre contexto textual) |
| Tipos de cuantizacion | no disponible (exportado a ONNX en precisión original) |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | cdla-sharing-1.0 (modelo); código base IBM/Multi-GNN bajo Apache-2.0 |
| Formato de pesos | ONNX (opset 18) |
| Pipeline | tabular-classification |
| Libreria | onnx / onnxruntime-web |
| Dataset de entrenamiento | IBM AMLworld HI-Small (CDLA-Sharing-1.0) |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo implementa Multi-PNA+EU, una red neuronal sobre grafos diseñada para grafos dirigidos con múltiples aristas y atributos en las aristas. Combina agregación PNA (con agregadores de media, máximo, mínimo y desviación estándar, y escalados logarítmicos) con paso de mensajes inverso para capturar la direccionalidad, numeración de puertos para distinguir aristas paralelas entre el mismo par de nodos, identificadores de ego para preservar la identidad del nodo central y actualizaciones explícitas de las aristas. La configuración exportada usa 2 capas de anchura 20, lo que la convierte en una red muy compacta.

El entrenamiento se realizó con el código oficial de IBM sobre el dataset sintético IBM AMLworld HI-Small: 5 millones de transacciones, 515.000 cuentas y aproximadamente 1 transacción de blanqueo por cada 981. El protocolo de IBM muestrea los vecinos de cada transferencia a partir del grafo completo de su ventana. El autor aplica parches propios al código de IBM (documentados en `scripts/train/ibm_multignn/` conforme a la sección 4 de Apache-2.0) y corrige un defecto relevante: el bucle original de IBM nunca llama a `model.eval()`, por lo que los checkpoints guardan estadísticas de BatchNorm fijadas en la pasada de test; aquí se recalculan sobre la ventana de ajuste. El umbral de decisión se ajusta maximizando F1 en validación. No se documenta uso de RLHF ni DPO, algo esperable en un modelo tabular supervisado.

## Capacidades

- Clasificación binaria de transacciones financieras como lícitas o sospechosas de blanqueo, a partir de la estructura del grafo de transferencias y de sus atributos.
- Razonamiento relacional sobre grafos dirigidos multigrafo: distingue aristas paralelas, dirección de los flujos y rol del nodo central.
- Inferencia en navegador mediante onnxruntime-web, sin backend de servidor.
- Ejecución en texto plano: el modelo no se ejecuta bajo cifrado (el proyecto matriz explora esquemas CKKS y MPC, pero esta página solo ejecuta el modelo en claro).
- Exportación ONNX estándar (opset 18) compatible con el ecosistema onnxruntime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, visión, audio ni capacidades multilingües.

## Casos de uso

- Evaluación de baselines académicos en AML: sirve como referencia reproducible de Multi-PNA+EU sobre HI-Small con métricas desglosadas (F1 de clase minoritaria, AUPRC, AUROC) y cinco semillas, útil para comparar nuevas propuestas contra el estado del arte publicado.
- Detección de patrones de fraude en grafos de transacciones: el modelo clasifica cada transferencia considerando su vecindad en la ventana temporal, lo que permite señalar cadenas de lavado que no son visibles analizando transacciones aisladas.
- Demostración educativa de GNN sobre multigrafos dirigidos: el repositorio incluye `eval_sample.json` con 16 transferencias retenidas y su vecindad, lo que facilita reproducir la inferencia en un cuaderno o en el navegador.
- Prototipado de scoring AML en entornos con restricciones de despliegue: al ser un ONNX de 2 capas de anchura 20, puede integrarse en un pipeline de preprocesado que construya la vecindad y llame al modelo para obtener una probabilidad por transferencia.
- Auditoría de métricas en producción: el desglose entre F1 registrado por el bucle de entrenamiento y F1 del modelo exportado permite ilustrar por qué una métrica en modo entrenamiento sobreestima el rendimiento real y cómo corregirlo con BatchNorm en evaluación y umbral calibrado.
- Investigación sobre desbalanceo extremo de clases: con una tasa de positivos del orden de 0,1-0,15 % y un AUPRC de 0,63 frente a una línea base de 0,0015, el modelo es un caso de estudio útil para técnicas de muestreo, umbral y métricas apropiadas a clases minoritarias.
- Integración en demostraciones de privacidad y criptografía: el proyecto matriz QSMPC-QKD-QHE-AI-Hybrid lo emplea como pieza de una orquestación quantum-safe, y la ficha documenta explícitamente qué parte se ejecuta cifrada y cuál no.

## Benchmarks y rendimiento

Resultados medidos del modelo exportado (semilla 4, modo evaluación, umbral 0,637421):

| Metrica | Valor |
|---|---|
| Accuracy | 0,999139 |
| AUPRC | 0,631829 |
| AUPRC baseline | 0,00152434 |
| AUROC | 0,985447 |
| Umbral de decisión | 0,637421 |
| Época conservada | 33 |
| F1 de test registrado por el bucle de IBM | 0,6751 |
| F1 de validación registrado por el bucle de IBM | 0,6208 |
| F1 de clase minoritaria (exportado) | 0,682182 |
| n test | 1.522.629 |
| n validación | 710.969 |

Resultados sobre cinco semillas:

| Semilla | Época | F1 val (registrado) | F1 test (registrado) | F1 test (exportado) | AUPRC test |
|---|---|---|---|---|---|
| 1 | 36 | 0,6177 | 0,6616 | 0,673119 | 0,639675 |
| 2 | 38 | 0,6089 | 0,6506 | 0,664573 | 0,651 |
| 3 | 54 | 0,5928 | 0,6254 | 0,639289 | 0,596986 |
| 4 | 33 | 0,6208 | 0,6751 | 0,682182 | 0,631829 |
| 5 | 39 | 0,5732 | 0,6309 | 0,629219 | 0,579145 |
| Media | | 0,60268 (sd 0,019744) | 0,64872 (sd 0,020777) | 0,657676 (sd 0,022553) | 0,619727 (sd 0,030358) |

Comparación con referencias publicadas (F1 de clase minoritaria):

| Modelo | F1 clase minoritaria | Fuente |
|---|---|---|
| Multi-PNA+EU (baseline a batir, AML Small HI) | 0,6816 ± 0,0265 | Egressy et al., AAAI 2024, tabla 2 |
| Multi-FraudGT (techo publicado, AML Small HI) | 0,7581 ± 0,0075 | Bilgi y Atasu, TMLR 2026, tabla 16 |
| MEGA-PNA | 0,7401 ± 0,0155 | Bilgi y Atasu, TMLR 2026 |
| MEGA-GenAgg | 0,7448 ± 0,0084 | Bilgi y Atasu, TMLR 2026 |
| Multi-PNA | 0,6735 ± 0,0289 | Bilgi y Atasu, TMLR 2026 |
| GFP+XGBoost (baseline del demo) | 0,6323 | model card |

## Requisitos de hardware

- El modelo es un ONNX de 2 capas de anchura 20: la huella de memoria es mínima y se ejecuta en CPU sin dificultad.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de la arquitectura, es despreciable frente a cualquier GPU consumer.
- GPU recomendadas: no aplica; cualquier GPU consumer (RTX 3060 o superior) o incluso CPU es suficiente. No se requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en CPU; también en navegador mediante onnxruntime-web.
- Opciones de despliegue: onnxruntime (Python/C++/JS), onnxruntime-web en el navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo tabular ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 clase minoritaria (AML Small HI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qsh-finance-aml-gnn (Multi-PNA+EU) | 2 capas, anchura 20 (total no disponible) | no aplica (ventanas de grafo) | 0,682182 (exportado, semilla 4); media 0,657676 | CDLA-Sharing-1.0 | ONNX en Hugging Face |
| Multi-PNA+EU (IBM, referencia) | no disponible | no aplica | 0,6816 ± 0,0265 | Apache-2.0 (código) | Repositorio IBM/Multi-GNN |
| Multi-FraudGT | no disponible | no aplica | 0,7581 ± 0,0075 | no disponible | Publicado en TMLR 2026 |
| MEGA-PNA | no disponible | no aplica | 0,7401 ± 0,0155 | no disponible | Publicado en TMLR 2026 |
| GFP+XGBoost | no disponible | no aplica | 0,6323 | no disponible | Baseline del demo |

## Limitaciones y advertencias

- Datos sintéticos: el entrenamiento usa IBM AMLworld HI-Small, generado por un modelo multiagente de mundo virtual. IBM declara que "todo es sintético"; no existe un corpus comercial de transacciones reales de blanqueo con licencia permisiva.
- Fuga temporal en la ventana de test: HI-Small cubre del 1 al 10 de septiembre de 2022, pero el 30 % final de las transacciones en orden temporal llega hasta el 18 de septiembre. Las 1.108 filas del 11 al 18 de septiembre contienen 655 casos de blanqueo, el 28,2 % de los 2.321 positivos de la ventana de test. Sin ellas, la tasa de positivos cae del 0,152 % al 0,109 %, el F1 de clase minoritaria del profesor baja de 0,6161 a 0,5499 y su AUPRC de 0,6428 a 0,5408; el estudiante CKKS baja de 0,3088 a 0,2083. El split publicado 60/20/20 arrastra las mismas 1.108 filas.
- Métrica engañosa si no se desglosa: la accuracy de 0,999139 convive con una tasa de positivos inferior al 0,2 %; el AUPRC (0,631829) y el F1 de clase minoritaria son las métricas relevantes.
- Diferencia entre modos: las cifras registradas por el bucle de IBM se obtienen en modo entrenamiento; las del modelo exportado, en evaluación con BatchNorm recalculado y umbral ajustado en validación. Comparar ambas sin distinguirlas sobreestima o subestima el rendimiento.
- Sin ejecución cifrada: la model card indica explícitamente que el modelo se ejecuta en texto plano en onnxruntime-web; nada de él corre bajo cifrado en esta página, pese a las etiquetas "quantum-safe" y "privacy-preserving".
- Alcance funcional limitado: no procesa lenguaje, no soporta tool calling ni agentes, y no tiene capacidades multilingües, de visión o de audio.
- Licencia CDLA-Sharing-1.0: conviene revisar sus términos antes de un uso comercial; el código base de IBM es Apache-2.0 y los parches del autor se documentan conforme a la sección 4 de esa licencia.
- Sesgos: no documentados en la información proporcionada; al ser datos sintéticos, los patrones aprendidos reflejan el generador de IBM y no necesariamente el fraude real.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y negativos en la clasificación, con un F1 de clase minoritaria en torno a 0,63-0,68.
- Madurez: 0 descargas y 0 likes; repositorio de 0.0 GB y creado en noviembre de 2026. No hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemons-Q/qsh-finance-aml-gnn
- Proyecto matriz: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Código base de IBM: IBM/Multi-GNN (commit 252b025, Apache-2.0)
- Paper de la arquitectura: Egressy et al., "Provably Powerful Graph Neural Networks for Directed Multigraphs", AAAI 2024, arXiv:2306.11586
- Paper de referencia MEGA: Bilgi y Atasu, "MEGA: Message Passing Neural Networks for Multigraphs with EdGe Attributes", TMLR 08/2026, arXiv:2412.00241v3
- Referencia adicional citada en las etiquetas: arXiv:2610.18054
- Dataset: https://www.kaggle.com/datasets/ealtman2019/ibm-transactions-for-anti-money-laundering-aml
- Paper del dataset: Altman et al., "Realistic Synthetic Financial Transactions for Anti-Money Laundering Models", NeurIPS 2023 Datasets and Benchmarks
- Medición de la cola de la ventana de test: `docs/measurements/finance-test-window-tail-2026-11-11.json` (en el repositorio del proyecto)
