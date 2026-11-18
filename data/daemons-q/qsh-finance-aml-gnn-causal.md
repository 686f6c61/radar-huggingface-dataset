# Daemons-Q/qsh-finance-aml-gnn-causal

## Resumen

`qsh-finance-aml-gnn-causal` es un modelo de clasificación tabular basado en una red neuronal de grafos (GNN) para la detección de blanqueo de capitales (AML, anti-money laundering) en transferencias financieras. Lo publica el usuario Daemons-Q como parte del proyecto de demostración QSMPC-QKD-QHE-AI-Hybrid, una orquestación "quantum-safe" que combina computación multipartita segura, distribución cuántica de claves y cifrado homomórfico. El modelo en sí no ejecuta nada bajo cifrado: se exporta a ONNX (opset 18) y se ejecuta en claro mediante `onnxruntime-web` sobre 16 transferencias de un conjunto de evaluación.

La arquitectura es Multi-PNA+EU, la implementación oficial de IBM (repositorio IBM/Multi-GNN, commit 252b025, licencia Apache-2.0) descrita en el artículo "Provably Powerful Graph Neural Networks for Directed Multigraphs" (Egressy et al., AAAI 2024, arXiv:2306.11586). Se trata de una PNA (Principal Neighbourhood Aggregation) con paso de mensajes inverso, numeración de puertos para multigrafos, identificadores de ego y actualizaciones de arista, con 2 capas de anchura 20. El autor la reentrena desde el código de IBM sobre ventanas de la página `finance_aml` bajo un "protocolo causal" que no lee información posterior al horizonte temporal de cada transferencia.

La relevancia es doble: por un lado, aplica una GNN direccional de multigrafos, con garantías teóricas de expresividad, a un problema real de AML sobre datos tabulares con estructura de grafo; por otro, documenta con inusual detalle metodológico (cinco semillas, dos variantes de codificación temporal, comparación entre modo entrenamiento y evaluación) las diferencias entre las cifras que registra el bucle de entrenamiento original de IBM y las del modelo exportado. El repositorio pesa 0,0 GB y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multi-PNA+EU (Principal Neighbourhood Aggregation con paso de mensajes inverso, numeración de puertos de multigrafo, ego IDs y actualizaciones de arista); 2 capas de anchura 20 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación tabular sobre grafos de vecindad; ventanas temporales del conjunto `finance_aml`) |
| Tipos de cuantización | no disponible (exportado a ONNX en precisión original; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; entrada tabular/grafo) |
| Licencia | CDLA-Sharing-1.0 (modelo); código base IBM/Multi-GNN bajo Apache-2.0 |
| Formato de pesos | ONNX (opset 18), ejecutable con `onnxruntime-web` |

## Arquitectura y entrenamiento

El modelo es una GNN de paso de mensajes sobre multigrafos dirigidos. Multi-PNA+EU combina agregación PNA (con agregadores de media, máximo, mínimo y desviación estándar, y escalados variables) con paso de mensajes inverso, numeración de puertos para distinguir aristas paralelas entre el mismo par de nodos, identificadores de ego y actualizaciones de arista. La configuración concreta son 2 capas de anchura 20, entrenadas con el código oficial de IBM (commit 252b025). El autor aplica parches propios, documentados en `scripts/train/ibm_multignn/` del repositorio y declarados conforme a la sección 4 de Apache-2.0.

El entrenamiento se realiza sobre ventanas temporales de la página `finance_aml` bajo un protocolo causal: cada ventana solo lee información hasta el horizonte que los modelos de la página conceden a cada transferencia. El conjunto de prueba tiene 1.522.612 ejemplos y el de validación 710.969. La innovación metodológica más destacable es el tratamiento de la marca temporal: en lugar de usar el timestamp absoluto escalado (que en prueba cae fuera del rango visto en entrenamiento, con z entre 2,9 y 9,7 frente a un máximo de 2,0 en ajuste), el modelo usa un retardo relativo al final del lote, `ℓ = max(-1, (t - t_end) / s)` con `s = 443.520 s`, en el rango [-1, 0]. Esta codificación se inspira en TGAT (arXiv:2002.07962) y GraphMixer (arXiv:2302.11636). Se compararon dos variantes temporales (`lag` y `drop`) con cinco semillas cada una; se exportó `lag` por mejor F1 de validación media registrada (0,61748 frente a 0,5977). Además, el autor recalcula las estadísticas de BatchNorm sobre la ventana de ajuste, ya que el bucle original de IBM nunca llama a `model.eval()` y guarda estadísticas contaminadas por el paso de prueba.

## Capacidades

- Clasificación binaria de transferencias financieras como sospechosas o no sospechosas de blanqueo de capitales.
- Procesamiento de grafos dirigidos con aristas múltiples (multigrafos) mediante numeración de puertos y paso de mensajes inverso.
- Incorporación de características de arista, incluida una codificación temporal relativa al final del lote.
- Inferencia en navegador mediante `onnxruntime-web` (ejecución en claro, sin cifrado).
- Exportación a ONNX (opset 18) para despliegue portable.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador tabular/grafo, no un modelo de lenguaje.

## Casos de uso

- Detección de blanqueo en transferencias bancarias: el modelo clasifica cada transferencia usando su vecindad en el grafo de transacciones, adecuado para sistemas de alertas AML donde la estructura relacional importa tanto como los atributos individuales.
- Monitorización de flujos de pago en tiempo casi real: al ejecutarse en ONNX y en `onnxruntime-web`, puede integrarse en paneles o servicios ligeros que puntúan transferencias sin infraestructura de GPU.
- Evaluación de riesgo en ventanas temporales: el protocolo causal permite puntuar transferencias usando solo información disponible hasta su horizonte, lo que encaja con requisitos de auditoría y no filtración de futuro.
- Investigación en GNN para dominios financieros: sirve como referencia reproducible de Multi-PNA+EU aplicada a datos tabulares con estructura de grafo y con comparación de cinco semillas.
- Prototipos de privacidad en finanzas: forma parte de una demo de orquestación quantum-safe, útil para experimentar con flujos donde el modelo se ejecuta en claro pero se integra en un pipeline cifrado extremo a extremo.
- Docencia y validación metodológica: el detalle sobre BatchNorm, modo evaluación y codificación temporal lo convierte en un ejemplo didáctico de buenas prácticas al exportar modelos GNN.

## Benchmarks y rendimiento

Resultados medidos del modelo exportado (semilla 1, modo evaluación, umbral 0,431105, época conservada 16):

| Métrica | Valor |
|---|---|
| Accuracy | 0,998943 |
| AUPRC | 0,578913 |
| AUPRC baseline | 0,00152435 |
| AUROC | 0,981609 |
| Umbral de decisión | 0,431105 |
| F1 clase minoritaria | 0,625204 |
| F1 de prueba registrado (modo entrenamiento) | 0,5474 |
| F1 de validación registrado | 0,6258 |
| n de prueba | 1.522.612 |
| n de validación | 710.969 |

Resumen de cinco semillas (variante `lag`, exportada):

| Semilla | Época | F1 val. registrado | F1 test registrado | F1 test exportado | AUPRC test | F1 test lotes de 2.048 |
|---|---|---|---|---|---|---|
| 1 | 16 | 0,6258 | 0,5474 | 0,625204 | 0,578913 | 0,458121 |
| 2 | 28 | 0,6178 | 0,6025 | 0,578565 | 0,498434 | 0,400265 |
| 3 | 34 | 0,6171 | 0,5737 | 0,597337 | 0,522967 | 0,409632 |
| 4 | 33 | 0,6115 | 0,5718 | 0,658933 | 0,59071 | 0,463759 |
| 5 | 14 | 0,6152 | 0,5188 | 0,643999 | 0,584393 | 0,451194 |
| Media | | 0,61748 (sd 0,005254) | 0,56284 (sd 0,031421) | 0,620808 (sd 0,032962) | 0,555083 (sd 0,041644) | 0,436594 (sd 0,029416) |

Variante `drop` (tiempo a cero), media de cinco semillas: F1 val. registrado 0,5977 (sd 0,010167); F1 test registrado 0,5266 (sd 0,042268); F1 test exportado 0,56125 (sd 0,033764); AUPRC test 0,540344 (sd 0,029088); F1 con lotes de 2.048 0,501346 (sd 0,030916).

## Requisitos de hardware

- VRAM estimada: no disponible; con 2 capas de anchura 20 el modelo es muy pequeño y cabe holgadamente en cualquier GPU consumer, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU moderna (incluidas integradas) debería bastar.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo; también en CPU y en navegador vía `onnxruntime-web`.
- Opciones de despliegue: `onnxruntime-web` (documentado por el autor), ONNX Runtime estándar, y cualquier runtime compatible con ONNX opset 18.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qsh-finance-aml-gnn-causal | Multi-PNA+EU, 2 capas × 20 | no disponible | no aplica | CDLA-Sharing-1.0 | ONNX en HF |
| IBM/Multi-GNN (base) | Multi-PNA+EU | no disponible | no aplica | Apache-2.0 | Código en GitHub de IBM |
| TGAT (arXiv:2002.07962) | GNN temporal | no disponible | no aplica | no disponible | Paper |
| GraphMixer (arXiv:2302.11636) | GNN temporal | no disponible | no aplica | no disponible | Paper |

No se dispone de comparativas de rendimiento publicadas frente a estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo se ejecuta en claro en `onnxruntime-web`; no hay inferencia cifrada, pese a formar parte de una demo "quantum-safe".
- El bucle original de IBM no llama a `model.eval()`, por lo que los checkpoints guardan estadísticas de BatchNorm contaminadas por el paso de prueba; este modelo las recalcula, pero conviene verificar cualquier uso derivado.
- Con lotes de 2.048, 1.352 transferencias de prueba (654 de ellas de blanqueo) quedan más atrás que cualquier transferencia de la ventana de ajuste, lo que degrada el F1 (media 0,436594 frente a 0,620808 en el modo exportado).
- La codificación temporal depende del final del lote; el rendimiento es sensible a cómo se construyan los lotes en producción.
- El desequilibrio de clases es extremo (AUPRC baseline 0,00152435); el accuracy de 0,998943 no es informativo por sí solo.
- No hay información sobre sesgos demográficos o geográficos, ni sobre idiomas (no aplica).
- Licencia CDLA-Sharing-1.0: conviene revisar sus términos antes de uso comercial; el código base de IBM es Apache-2.0.
- Sin descargas ni validación externa en el momento de la consulta; el modelo es un artefacto de demostración más que un sistema listo para producción.
- Riesgo de alucinación no aplica (no genera texto), pero sí de falsos positivos y negativos en la clasificación AML.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemons-Q/qsh-finance-aml-gnn-causal
- Repositorio del proyecto: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Código base de IBM: IBM/Multi-GNN (commit 252b025), https://github.com/IBM/Multi-GNN
- Paper Multi-PNA+EU: Egressy et al., "Provably Powerful Graph Neural Networks for Directed Multigraphs", AAAI 2024, https://arxiv.org/abs/2306.11586
- TGAT: https://arxiv.org/abs/2002.07962
- GraphMixer: https://arxiv.org/abs/2302.11636
- Referencias adicionales citadas en los tags: arXiv:2412.00241, arXiv:2610.18054 (no verificadas en la información disponible)
