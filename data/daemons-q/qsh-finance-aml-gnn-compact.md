# Daemons-Q/qsh-finance-aml-gnn-compact

## Resumen

qsh-finance-aml-gnn-compact es un modelo compacto de clasificación tabular orientado a la detección de blanqueo de capitales (AML, anti-money laundering) sobre transacciones financieras. Lo desarrolla Daemons-Q como parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, una demostración de orquestación "quantum-safe" que ejecuta el modelo bajo cifrado homomórfico CKKS para las capas lineales y circuitos garbled para las activaciones y el argmax. El modelo combina un canal GNN de paso de mensajes sobre un árbol fijo de 16 aristas vecinas por transacción con un canal MLP sobre 114 características, sumando 34.962 parámetros y 608 ReLU.

El interés técnico reside en su planteamiento de privacidad: el modelo está diseñado para inferencia sobre datos cifrados, de modo que ni la entidad que ejecuta el cómputo ve las transacciones ni sus vecindades. Se entrena mediante destilación generalizada (Lopez-Paz et al., ICLR 2016) desde el profesor Multi-PNA+EU de IBM, con una mezcla de 0,7 veces la etiqueta real y 0,3 veces la probabilidad del profesor, y pesos de clase para compensar el fuerte desbalanceo del corpus.

Se evalúa sobre IBM AMLworld HI-Small (5 millones de transacciones) con un protocolo propio: ajuste sobre el 56 % de las transacciones, validación sobre el 14 % y test sobre el último 30 %. Reporta un F1 de clase minoritaria de 0,6587 (mediana entre semillas 0,6460), AUPRC de 0,6676 y AUROC de 0,9896, frente a un baseline publicado de 0,6323 (GFP+XGBoost) y un techo publicado de 0,7581 (Multi-FraudGT).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: GNN de paso de mensajes sobre árbol fijo (2 endpoints, 4 slots vecinos por dirección) + MLP de 114 características |
| Parámetros totales | 34.962 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación tabular por transacción; vecindad fija de 16 aristas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | CDLA-Sharing-1.0 |
| Formato de pesos | weights.json (según la model card) |
| Pipeline | tabular-classification |
| Características de entrada | 114 |
| ReLU totales | 608 |
| Slots por dirección | 4 |
| Ventana de lote | 2.048 transacciones (alcance temporal de 17 minutos) |

## Arquitectura y entrenamiento

El modelo es una red neuronal gráfica compacta que opera sobre un árbol público y fijo de 16 aristas vecinas por transacción. Cada transacción tiene 2 endpoints y 4 slots vecinos por dirección; en cada slot se aplica un mapa compartido sin sesgo y se suma por dirección, seguido de una segunda capa por endpoint. En paralelo, un canal MLP procesa las mismas 114 características de entrada que usa el profesor de gradient boosting. La salida son dos logits (no blanqueo / blanqueo) con el umbral de operación plegado en el sesgo de la última capa.

El entrenamiento usa IBM AMLworld HI-Small con pesos de clase y destilación generalizada: el objetivo es 0,7 veces la etiqueta más 0,3 veces la probabilidad que el profesor Multi-PNA+EU de IBM asigna a la transacción en las mismas ventanas. El peso de destilación se eligió sobre validación. Las vecindades del profesor incluyen transacciones posteriores de la ventana de entrenamiento, que llegan al estudiante solo a través de sus objetivos de entrenamiento. El escalado de endpoints y la semilla se seleccionaron sobre la ventana de validación. Se reportan cifras para todas las semillas evaluadas.

La inferencia está pensada para ejecutarse bajo cifrado: las capas lineales bajo CKKS y las 608 ReLU más el argmax en circuitos garbled. Esto condiciona el diseño (mapas lineales simples, activaciones contadas) y explica el tamaño reducido del modelo.

## Capacidades

- Clasificación binaria de transacciones financieras como sospechosas o no de blanqueo de capitales.
- Procesamiento de grafos de vecindad fija: agrega información de hasta 16 transacciones vecinas por transacción objetivo.
- Combinación de señales relacionales (GNN) y tabulares (MLP sobre 114 características).
- Inferencia compatible con cifrado homomórfico CKKS y circuitos garbled, orientada a privacidad.
- Calibración de probabilidades mediante mapa de Platt ajustado sobre validación (parámetros a = -2,1933, b = 0,7765).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador tabular, no un modelo de lenguaje.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Detección de blanqueo en tiempo casi real: con una ventana de lote de 2.048 transacciones y un alcance temporal de 17 minutos, el modelo puede puntuar lotes de transacciones y marcar las sospechosas para revisión, manteniendo el throughput necesario para un flujo de pagos.
- Despliegue con privacidad reforzada: al ejecutarse bajo CKKS y circuitos garbled, permite que un proveedor externo compute la puntuación sin acceder a los datos de transacción ni a las vecindades, útil en entornos con requisitos regulatorios estrictos.
- Triaje previo a investigación manual: el modelo ordena transacciones por probabilidad calibrada, de modo que los analistas de cumplimiento revisan primero los casos con mayor riesgo y reducen el volumen de falsos positivos frente a reglas heurísticas.
- Enriquecimiento de sistemas existentes de gradient boosting: al destilarse desde Multi-PNA+EU, puede sustituir o complementar un pipeline de features gráficas con un modelo 20 veces menor (34.962 parámetros) y compatible con cifrado.
- Evaluación de riesgo en lotes históricos: la calibración de Platt permite convertir logits en probabilidades con Brier score de 0,000776 y log-loss de 0,003887, adecuadas para informes de riesgo agregado.
- Prototipado de arquitecturas quantum-safe en finanzas: sirve como componente de referencia en la demo QSMPC-QKD-QHE-AI-Hybrid para validar orquestación de cómputo cifrado extremo a extremo.
- Investigación en destilación generalizada aplicada a AML: el modelo y sus pesos permiten reproducir el experimento de destilación desde un profesor PNA a un estudiante compacto y cifrable.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Accuracy | 0,99903 |
| AUPRC | 0,667649 |
| AUPRC baseline | 0,00152346 |
| AUROC | 0,989573 |
| F1 clase minoritaria | 0,658661 |
| F1 minoritaria (mediana entre semillas) | 0,645966 |
| F1 minoritaria (mínimo entre semillas) | 0,640242 |
| F1 minoritaria (máximo entre semillas) | 0,658661 |
| Precisión | 0,709806 |
| Recall | 0,61439 |
| Umbral sobre validación | 0,919443 |
| Filas de test | 1.523.504 (2.321 positivas) |
| Filas de validación | 710.969 (801 positivas) |
| Filas de entrenamiento | 2.843.872 |
| Brier score (crudo → calibrado) | 0,00210277 → 0,00077607 |
| Log-loss (crudo → calibrado) | 0,01462592 → 0,00388651 |
| Miscalibración CORP MCB (crudo → calibrado) | 0,00136497 → 0,00003826 |
| Brier skill frente a la tasa base | 0,4898 |
| Tiempo de pared | 242,8 s |

Comparación con referencias publicadas (misma métrica, F1 de clase minoritaria, corpus HI-Small, protocolo distinto):

| Modelo | F1 minoritaria |
|---|---|
| Multi-FraudGT (techo publicado) | 0,7581 ± 0,0075 |
| MEGA-GenAgg | 0,7448 ± 0,0084 |
| MEGA-PNA | 0,7401 ± 0,0155 |
| Multi-PNA | 0,6735 ± 0,0289 |
| qsh-finance-aml-gnn-compact | 0,6587 |
| GFP+XGBoost (baseline a batir) | 0,6323 ± 0,0017 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 34.962 parámetros; el cuello de botella es el coste del cómputo cifrado, no la memoria.
- GPU recomendadas: no disponible; el modelo es lo bastante pequeño para ejecutarse en CPU, aunque la inferencia bajo CKKS y circuitos garbled puede requerir aceleración específica según la implementación del proyecto.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia en claro.
- Opciones de despliegue: al ser un modelo de 34.962 parámetros con pesos en weights.json, puede cargarse con código propio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponible; el tiempo de pared de 242,8 s corresponde al entrenamiento/evaluación reportado, no a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / vecindad | F1 minoritaria (HI-Small) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qsh-finance-aml-gnn-compact | 34.962 | 16 aristas vecinas fijas | 0,6587 | CDLA-Sharing-1.0 | Hugging Face |
| Multi-PNA | no disponible | vecindades PNA | 0,6735 ± 0,0289 | no disponible | referencia en paper |
| MEGA-PNA | no disponible | multígrafo con atributos de arista | 0,7401 ± 0,0155 | no disponible | referencia en paper |
| MEGA-GenAgg | no disponible | multígrafo con atributos de arista | 0,7448 ± 0,0084 | no disponible | referencia en paper |
| Multi-FraudGT | no disponible | multígrafo | 0,7581 ± 0,0075 | no disponible | referencia en paper |
| GFP+XGBoost | no disponible | features gráficas + boosting | 0,6323 ± 0,0017 | no disponible | referencia NeurIPS 2023 D&B |

## Limitaciones y advertencias

- El protocolo de evaluación difiere del de los baselines: el modelo se testea sobre el último 30 % de transacciones (ajuste 56 %, validación 14 %) con features gráficas propias, mientras que el baseline de 0,6323 usa un split 60/20/20 y actualiza las features sobre la ventana de test. Las cifras no son directamente comparables.
- La clase positiva es extremadamente rara (2.321 de 1.523.504 en test); la accuracy de 0,99903 es engañosa y debe leerse junto con AUPRC y F1 minoritaria.
- El F1 minoritaria (0,6587) queda por debajo del techo publicado (0,7581) y de MEGA-PNA (0,7401); el modelo no supera al estado del arte, solo al baseline XGBoost.
- El umbral de operación (0,919443) está plegado en el sesgo de la última capa; la probabilidad cruda no es una probabilidad de riesgo hasta aplicar el mapa de Platt.
- El modelo se destila desde Multi-PNA+EU, cuyas vecindades incluyen transacciones posteriores de la ventana de entrenamiento; existe riesgo de fuga de información a través de los objetivos de entrenamiento.
- La licencia CDLA-Sharing-1.0 impone condiciones de compartición de datos derivados; debe revisarse antes de uso comercial.
- No hay información sobre sesgos demográficos o geográficos; al entrenarse sobre datos sintéticos de IBM AMLworld, el rendimiento en datos reales de producción no está validado.
- El modelo no procesa lenguaje natural ni texto libre; su entrada es exclusivamente tabular y relacional.
- No se documentan tipos de cuantización ni formatos alternativos de pesos (GGUF, safetensors); solo weights.json.
- El repositorio tiene 0 descargas y 0 likes, y no hay evidencia de mantenimiento o soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemons-Q/qsh-finance-aml-gnn-compact
- Repositorio del proyecto QSMPC-QKD-QHE-AI-Hybrid: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Dataset IBM Transactions for Anti Money Laundering (AML): https://www.kaggle.com/datasets/ealtman2019/ibm-transactions-for-anti-money-laundering-aml
- Paper de referencia del dataset (Altman et al., NeurIPS 2023 D&B): arXiv:2412.00241
- Paper MEGA (Bilgi y Atasu, TMLR 2026): arXiv:2412.00241v3
- Destilación generalizada (Lopez-Paz et al., ICLR 2016): no disponible enlace directo en la información proporcionada
