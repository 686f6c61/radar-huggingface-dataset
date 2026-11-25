# JacellJamble/xdevs-contract-risk

## Resumen

xDEVS Contract Risk es un clasificador tabular desarrollado por JacellJamble que puntúa el bytecode de contratos EVM en busca de patrones propios de contratos maliciosos: drainers de carteras, contratos de phishing y contratos de explotación. No es un modelo de lenguaje ni una red neuronal profunda: es un ensamblado de árboles gradient-boosted (LightGBM) combinado con una regresión logística, entrenado sobre características estáticas extraídas del código de máquina virtual de Ethereum. Su función es actuar como capa de seguridad en xDEVS Chain, una L1 equivalente a EVM, avisando al usuario antes de firmar una transacción contra un contrato sospechoso.

La relevancia del modelo reside en su enfoque: solo necesita el código del contrato (`eth_getCode`), por lo que funciona en cualquier cadena EVM y sobre contratos recién desplegados sin historial. El repositorio es de tamaño 0.0 GB, con licencia Apache 2.0, y se distribuye como artefactos de LightGBM y scikit-learn junto con un módulo Python de inferencia (`xdevs_contract_risk`). A fecha de la información disponible registra 0 descargas y 0 likes.

El modelo se entrenó sobre 83.889 contratos únicos (677 maliciosos) agrupados en 49.509 grupos por esqueleto de opcodes, lo que evita que copias casi idénticas de un mismo scam se repartan entre entrenamiento y test. Alcanza un ROC-AUC de 0,9636 y una precisión del 94,3% con un recall del 50,0% en el umbral publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de LightGBM (gradient-boosted trees) combinado en espacio logit con regresión logística L2 |
| Parametros totales | no disponible (modelo de árboles; el número de árboles y hojas no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación tabular sobre características estáticas del bytecode) |
| Tipos de cuantizacion | no aplica (modelo tabular; no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural); etiquetas de salida en inglés (`low`, `medium`, `high`) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefactos LightGBM y scikit-learn (no safetensors ni GGUF); módulo Python `xdevs_contract_risk` |
| Pipeline | tabular-classification |
| Dataset de entrenamiento | forta/malicious-smart-contract-dataset (MIT), forta-network/labelled-datasets (MIT) |
| Métricas declaradas | ROC-AUC, average precision, recall, precision |

## Arquitectura y entrenamiento

El modelo no emplea un transformer ni una red neuronal. La entrada es el bytecode de runtime del contrato, tras eliminar el constructor y los metadatos CBOR finales, de modo que el entrenamiento (código de creación) coincida con lo que devuelve `eth_getCode` en inferencia y los hashes del compilador no actúen como atajo. Sobre ese bytecode se extraen tres bloques de características sin estado ni vocabulario ajustado: frecuencias de unigramas y bigramas de opcodes (hasheadas a 2^18), el conjunto de selectores de función de 4 bytes empujados por el código (hasheados a 2^16) y unas 120 características escalares como tamaño del código, recuentos y proporciones de opcodes que mueven fondos y controlan el flujo (`CALL`, `DELEGATECALL`, `SELFDESTRUCT`, `CREATE2`, `ORIGIN`, direcciones hardcodeadas vía `PUSH20`) y selectores conocidos (approve/transferFrom de ERC-20, flash loans, swaps, multicall, ownership).

El clasificador es LightGBM con ponderación de clases para compensar el desbalanceo, con número de rondas elegido por early stopping en validación cruzada, mezclado en espacio logit con una regresión logística L2 sobre características comprimidas logarítmicamente. El peso del blend (0,75 sobre LightGBM) se seleccionó por average precision out-of-fold entre 1,0, 0,75, 0,5, 0,25 y 0,0. Los datos de entrenamiento proceden de tres fuentes: 131.618 filas de forta (149 maliciosas), 7.982 filas de forta/benign-runtime (0 maliciosas) y 720 filas de forta-labels/malicious_smart_contracts (720 maliciosas). Tras eliminar 56.431 duplicados exactos quedaron 83.889 contratos únicos, de los cuales 545 maliciosos fueron a entrenamiento y 132 a test. La partición es agrupada por esqueleto de opcodes (argumentos de PUSH eliminados), de modo que el test mide reconocimiento de código nuevo y no memorización de copias.

## Capacidades

- Clasificación binaria de riesgo de contratos EVM a partir exclusivamente de su bytecode, sin necesidad de historial de transacciones.
- Salida con `risk_score` numérico, nivel cualitativo (`low`, `medium`, `high`) y un diccionario de `signals` con las señales detectadas.
- Detección de patrones asociados a drainers de carteras, contratos de phishing y contratos de explotación.
- Funcionamiento sobre contratos recién desplegados y sobre cualquier cadena EVM, al depender solo de `eth_getCode`.
- Extracción de características estáticas: opcodes de movimiento de fondos y control, selectores de función conocidos, tamaño de código.
- Integración con la capa de seguridad de xDEVS Chain junto a `xdevs_simulateTransaction` y `xdevs_checkRecipient`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un clasificador tabular.

## Casos de uso

- Aviso pre-firma en cartera: antes de que el usuario firme una transacción contra un contrato desconocido, el nodo consulta el modelo con el bytecode del destinatario y muestra una advertencia si el `risk_score` supera el umbral; encaja porque solo requiere `eth_getCode` y responde sobre contratos sin historial.
- Filtrado de dApps y listados de contratos: un explorador o agregador puede puntuar contratos nuevos y marcar los de riesgo alto antes de indexarlos o listarlos, aprovechando la precisión del 94,3% en el umbral publicado para minimizar falsos positivos.
- Monitorización de despliegues en mempool: al detectar una creación de contrato, el modelo puntúa el bytecode de creación y puede priorizar la inspección manual de los marcados como de riesgo alto.
- Capa de seguridad en puentes y agregadores: antes de enrutar una llamada a un contrato de terceros, el sistema consulta el modelo y bloquea o advierte según el nivel de riesgo, reduciendo la exposición a contratos de explotación.
- Análisis forense y triaje: dado un conjunto de direcciones sospechosas, el modelo ordena por riesgo para que un analista revise primero los candidatos más probables, usando las `signals` para entender qué opcodes o selectores dispararon la alerta.
- Investigación académica sobre detección de contratos maliciosos: el pipeline de características estáticas (opcodes, selectores, escalares) y la partición agrupada sirven como línea base reproducible para comparar nuevos detectores.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test retenido (20% de grupos de contratos no vistos en entrenamiento), según la model card:

| Métrica | Modelo publicado | LightGBM solo | Regresión logística sola |
|---|---|---|---|
| ROC-AUC | 0,9636 | 0,9661 | 0,9282 |
| Average precision (PR-AUC) | 0,6324 | 0,6034 | 0,5458 |
| Recall a 1% de falsos positivos | 65,3% | 65,2% | 59,1% |
| Recall a 0,1% de falsos positivos | 54,5% | no disponible | no disponible |

En el umbral publicado (0,6978): precisión 94,3%, recall 50,0%, F1 0,6535, tasa de falsos positivos 0,0%. Matriz de confusión: 66 maliciosos detectados, 66 no detectados, 4 benignos marcados y 15.951 benignos descartados. Validación cruzada agrupada de 5 folds sobre la parte de entrenamiento: ROC-AUC 0,9372, average precision 0,5017, recall a 1% de FPR 56,2%.

Desglose por fuente en test:

| Fuente | Contratos | Maliciosos | Recall | Tasa de falsos positivos |
|---|---|---|---|---|
| forta | 15.092 | 27 | 74,1% | 0,0% |
| forta-labels/malicious_smart_contracts | 105 | 105 | 43,8% | no aplica |
| forta/benign-runtime | 890 | 0 | no aplica | 0,1% |

## Requisitos de hardware

- No se publican requisitos de VRAM: el modelo es un ensamblado de árboles LightGBM más una regresión logística, no una red neuronal, y se ejecuta en CPU.
- No requiere GPU; puede ejecutarse en cualquier máquina con Python y las dependencias `huggingface_hub`, `lightgbm`, `scikit-learn`, `scipy` y `numpy`.
- El tamaño del repositorio es de 0,0 GB, por lo que el artefacto es ligero y apto para despliegue en el propio nodo o en un servicio auxiliar.
- Opciones de despliegue: módulo Python `xdevs_contract_risk` cargado desde un `snapshot_download`, o servicio HTTP propio envolviendo el `predict`; no aplican vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (clasificadores de riesgo de contratos EVM basados en bytecode) en la información proporcionada. La propia model card incluye como líneas base internas LightGBM solo y regresión logística sola, cuyos resultados figuran en la tabla de benchmarks. Comparativa con alternativas externas: no disponible.

## Limitaciones y advertencias

- Se le escapa aproximadamente la mitad de los contratos maliciosos en el umbral publicado (recall del 50,0%), porque el umbral prima minimizar falsos positivos; el recall varía entre folds (56,2% a 1% de FPR en validación cruzada).
- La salida es orientativa, no una prueba: una puntuación alta indica que el código se parece a código malicioso conocido, no que sea malicioso con certeza.
- El rendimiento depende de la disponibilidad de código malicioso etiquetado; la propia model card señala que más ejemplos maliciosos etiquetados sería la mejora más útil.
- Sesgo de fuente: la mayoría de ejemplos maliciosos provienen de código de runtime on-chain y la mayoría de benignos de código de creación; aunque se mitiga eliminando constructor y metadatos y puntuando benignos desde runtime, persiste una diferencia de origen (recall del 43,8% en la fuente forta-labels frente al 74,1% en forta).
- Solo analiza bytecode estático: no modela comportamiento dinámico, estado del contrato, historial de transacciones ni flujos de fondos en ejecución.
- No procesa lenguaje natural ni textos; las etiquetas de salida están en inglés.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no se ofrece garantía alguna sobre el modelo.
- Registra 0 descargas y 0 likes, y fue creado y actualizado el 2026-11-25; no hay evidencia de adopción externa ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JacellJamble/xdevs-contract-risk
- Demo Space: https://huggingface.co/spaces/JacellJamble/xdevs-contract-risk-demo
- Dataset forta/malicious-smart-contract-dataset: https://huggingface.co/datasets/forta/malicious-smart-contract-dataset
- Repositorio forta-network/labelled-datasets: https://github.com/forta-network/labelled-datasets
- xDEVS Chain: https://xdevschain.tech
