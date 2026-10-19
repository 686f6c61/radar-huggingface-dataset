# ABRUBAB/yinglong-behaviour-anomaly

## Resumen

`yinglong-behaviour-anomaly` es el modelo de comportamiento (M3) de YINGLONG, una cartera de agente de IA que solo paga dentro de las reglas de gasto que el propietario ha fijado. No es un modelo de lenguaje: es un clasificador tabular que recibe un pago concreto que el agente está a punto de autorizar, lo compara con el comportamiento habitual de ese tipo de cartera y devuelve una señal de si el pago es lo bastante anómalo como para **pedir confirmación al propietario** antes de ejecutarlo. Lo publica el usuario ABRUBAB en HuggingFace con licencia Apache-2.0 y la etiqueta de pipeline `tabular-classification`.

Su diseño es deliberadamente conservador: la señal de machine learning es **solo ascendente**. Puede subir un pago a un nivel de aprobación más estricto (de "actuar solo" a "preguntar al dueño"), pero nunca rebaja un nivel ni bloquea por sí misma; la decisión final la toman código determinista y contratos on-chain. Esto lo convierte en una pieza de defensa en profundidad, no en el único control de seguridad.

Técnicamente es un ensemble por arquetipo de cartera (`student`, `sme`): un isolation forest no supervisado más un clasificador LightGBM supervisado, cuyas puntuaciones se convierten en p-valores conformales de Mondrian contra pagos normales reservados del mismo arquetipo, se combinan (el doble del menor) y se escalan cuando el p-valor combinado queda en o por debajo de alpha = 0,0221. La entrada son 23 características del pago y del historial reciente de la cartera. Es relevante ahora por el auge de agentes autónomos con capacidad de pago (incluidos micropagos x402) y por la escasez de artefactos auditables y reproducibles en ese nicho.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos detectores por arquetipo de cartera (isolation forest no supervisado + clasificador LightGBM supervisado) con calibración conformal de Mondrian y combinación de p-valores |
| Parametros totales | no disponible (no se publica número de árboles, hojas ni nodos) |
| Parametros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplica: entrada tabular fija de 23 características por pago, sin ventana de texto |
| Tipos de cuantizacion | no disponible; no se publican versiones cuantizadas (los artefactos son texto LightGBM y objetos skops) |
| Idiomas soportados | no disponible; el modelo no procesa lenguaje natural (solo características numéricas y binarias) |
| Licencia | Apache-2.0 |
| Formato de pesos | LightGBM en texto plano (`m3_lightgbm.txt`), isolation forests en formato seguro skops (`m3_isoforest_student.skops`, `m3_isoforest_sme.skops`), calibración y resultados en JSON |
| Pipeline en HuggingFace | `tabular-classification` |
| Librería declarada | `lightgbm` |
| Arquetipos de cartera cubiertos | `student`, `sme` |
| Características de entrada | 23 (importe y comparación con el habitual, hora, nocturnidad, beneficiario nuevo, antigüedad y cambios de dirección, dirección look-alike, pagos en la última hora y día, micropagos x402, importes justo por debajo de umbral, origen no fiable) |
| Umbral de escalado | alpha = 0,0221 sobre el p-valor conformal combinado |
| Tasa objetivo de falsos escalados | 2,0 % |
| Tamaño del repositorio | 0,0 GB (redondeo de HuggingFace; no se publica el tamaño exacto de los artefactos) |
| Descargas / likes | 0 / 0 |
| Fecha de publicación en HuggingFace | 2026-10-19 según metadatos del repositorio |

## Arquitectura y entrenamiento

El modelo no es un transformer ni un SSM: es un pipeline tabular en dos etapas por arquetipo. La primera etapa son dos scorers independientes: un isolation forest entrenado de forma no supervisada sobre pagos normales y un clasificador LightGBM entrenado de forma supervisada sobre pagos etiquetados. La segunda etapa es la calibración: cada puntuación se transforma en un p-valor conformal contra un conjunto reservado de pagos normales del mismo arquetipo (conformal de Mondrian, es decir, calibración separada por subpoblación), los dos p-valores se combinan tomando el doble del menor —una regla conservadora tipo Bonferroni— y el pago se escala cuando el p-valor combinado es menor o igual que alpha = 0,0221, valor elegido para una tasa objetivo de falsos escalados del 2,0 %.

Los datos de entrenamiento son **íntegramente sintéticos**: 177.209 pagos generados a partir de 90 carteras ficticias, de los cuales 11.043 son anómalos y se reparten en nueve familias de ataque (pago duplicado, pago dividido, dirección look-alike, ráfaga de velocidad, factura inflada, drenaje x402, beneficiario nuevo con importe grande, reactivación de cartera inactiva y sustitución de dirección). La generación del mundo sintético y el entrenamiento/evaluación viven en `ml/anomaly/world.py` y `ml/anomaly/train_eval.py` del repositorio GitHub del proyecto. El split de test tiene 41.567 pagos. No se documenta uso de RLHF, DPO ni ajuste por preferencias, algo por otra parte ajeno a un modelo tabular de este tipo.

Como innovación destacable, la tarjeta incide en la reproducibilidad y la seguridad del artefacto: el servicio en producción carga los mismos objetos ajustados desde un pickle con hash fijado (SHA-256 `7b8af61b9c7f4412...`), pero **no se publica el pickle** para evitar ejecución de código al cargarlo; en su lugar se ofrecen copias seguras verificadas contra él sobre 4.000 filas de características (diferencia máxima de puntuación 0,0 y calibración idéntica), con prueba en `conversion_check.json`. La familia "sustitución de dirección" se dejó fuera del entrenamiento para medir comportamiento ante un ataque no visto.

## Capacidades

- Puntuación de anomalía por pago individual: devuelve un p-valor conformal combinado para un pago descrito con las 23 características y un arquetipo de cartera (`student` o `sme`).
- Escalado de decisión: señal binaria de "escalar a aprobación del propietario" cuando el p-valor combinado cae en o por debajo de alpha = 0,0221.
- Detección supervisada de familias de ataque conocidas: pagos divididos, direcciones look-alike, ráfagas de velocidad, facturas infladas, drenaje x402, beneficiario nuevo con importe alto, reactivación de cartera inactiva y sustitución de dirección.
- Detección no supervisada complementaria: el isolation forest aporta señal sobre desviaciones sin etiqueta, con AUROC 0,979 en el split de test.
- Cobertura de dos arquetipos con calibración separada (Mondrian), lo que evita mezclar distribuciones de gasto muy distintas.
- Integración con historial: consume características derivadas del historial reciente de la cartera (pagos en la última hora y en el último día, cambios de dirección, importes justo por debajo de umbral).
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo tabular de clasificación.

## Casos de uso

- **Puerta de aprobación humana en carteras de agente**: el modelo se interpone entre la intención de pago del agente y la firma on-chain; si el p-valor combinado baja de 0,0221, el pago pasa a la cola de confirmación del propietario. Encaja porque su salida está diseñada como escalado y no como bloqueo, de modo que no rompe el flujo normal del agente.
- **Contención de drenajes por micropagos x402**: con características específicas de micropagos y conteos en la última hora y día, detecta el patrón de drenaje por acumulación de micropagos (100 % de escalados y AUROC 1,000 en los 1.358 elementos de test de esa familia).
- **Protección frente a envenenamiento de direcciones (address poisoning)**: usa la característica de dirección look-alike y la antigüedad y cambios de dirección para marcar pagos a direcciones visualmente parecidas a las habituales; en la familia look-alike escala el 100 % de los 66 elementos de test.
- **Control de ráfagas de velocidad en pymes**: para carteras `sme`, marca secuencias de muchos pagos en poco tiempo comparando con el ritmo habitual de esa cartera; útil en flujos de pago automatizados de facturas donde un compromiso del agente provoca una ráfaga.
- **Detección de facturación inflada**: marca pagos cuyo importe se desvía del habitual para el mismo tipo de contraparte, lo que sirve como segunda señal en la revisión de facturas de proveedores (98,5 % de escalados en 67 elementos de test).
- **Detección de estructuración bajo umbral**: identifica pagos divididos e importes justo por debajo de un umbral configurado, un patrón típico para evadir límites de aprobación (100 % de escalados en 261 elementos de test).
- **Vigilancia de carteras inactivas que se reactivan**: marca la primera actividad tras un periodo de inactividad con importe relevante, un indicador habitual de cuenta comprometida (100 % de escalados en 62 elementos de test).
- **Segunda señal en pipelines antifraude existentes**: al ser un artefacto pequeño, determinista y con licencia Apache-2.0, puede ejecutarse en paralelo a reglas deterministas y añadir una capa estadística auditable sin sustituir dichas reglas.
- **Generación de escenarios para red teaming**: el mundo sintético del repositorio (`ml/anomaly/world.py`) permite generar carteras y ataques nuevos para probar reglas y umbrales antes de tocarlos en producción.

## Benchmarks y rendimiento

Evaluación sobre el split de test reservado: 41.567 pagos de un total de 177.209 (90 carteras sintéticas, 11.043 pagos anómalos, nueve familias de ataque).

| Métrica | Valor |
|---|---|
| AUROC combinado | 0,994 |
| AUROC isolation forest | 0,979 |
| AUROC LightGBM | 0,994 |
| AUPRC | 0,986 |
| Falsos escalados sobre pagos normales | 2,1 % (IC 2,0 % a 2,3 %, n = 38.907), objetivo 2,0 % |
| Alpha de calibración | 0,0221 |

| Familia de ataque | Elementos de test | Escalados (IC 95 %) | AUROC |
|---|---|---|---|
| Pago duplicado | 60 | 45,0 % (33,1 % a 57,5 %) | 0,761 |
| Pago dividido | 261 | 100,0 % (98,6 % a 100,0 %) | 1,000 |
| Dirección look-alike | 66 | 100,0 % (94,5 % a 100,0 %) | 1,000 |
| Ráfaga de velocidad | 664 | 100,0 % (99,4 % a 100,0 %) | 1,000 |
| Factura inflada | 67 | 98,5 % (92,0 % a 99,7 %) | 0,999 |
| Drenaje x402 | 1.358 | 100,0 % (99,7 % a 100,0 %) | 1,000 |
| Beneficiario nuevo con importe grande | 55 | 100,0 % (93,5 % a 100,0 %) | 1,000 |
| Reactivación de cartera inactiva | 62 | 100,0 % (94,2 % a 100,0 %) | 1,000 |
| Sustitución de dirección (fuera del entrenamiento) | 67 | 86,6 % (76,4 % a 92,8 %) | 0,994 |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K u otros): no aplican a un modelo tabular y no figuran en la información disponible.

## Requisitos de hardware

- **VRAM**: no se requiere GPU; la inferencia es de CPU. No se publica una cifra de memoria residente.
- **Memoria principal**: no disponible de forma exacta; el repositorio completo figura con 0,0 GB en HuggingFace, lo que sitúa los artefactos en el orden de megabytes, no de gigabytes.
- **GPU recomendadas**: no aplica. Cualquier CPU x86-64 o ARM moderna sirve; no hay requisito de A100, H100 ni RTX 4090.
- **Cabe en hardware de consumidor**: sí, sin matices: es un modelo de árboles que se ejecuta en CPU y no necesita acelerador.
- **Opciones de despliegue**: Python con `lightgbm`, `scikit-learn`, `skops`, `huggingface_hub` y `numpy`; el propio repositorio incluye `yinglong_m3.py` con la función de puntuación idéntica a la del servicio en vivo. No aplican vLLM, TGI, llama.cpp ni Ollama, que son servidores de modelos de lenguaje.
- **Latencia y throughput**: no se han publicado medidas. La única cifra de rendimiento publicada es la verificación de equivalencia entre las copias seguras y el pickle en vivo sobre 4.000 filas, con diferencia máxima de puntuación de 0,0, que no es una medida de latencia.

## Comparativa con modelos similares

| Modelo | Enfoque | AUROC | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yinglong-behaviour-anomaly (combinado) | Isolation forest + LightGBM + conformal de Mondrian | 0,994 | 23 características tabulares | Apache-2.0 | HuggingFace, pesos en texto y skops |
| Componente LightGBM del mismo modelo | Gradient boosting supervisado | 0,994 | 23 características tabulares | Apache-2.0 | Incluido en el repo |
| Componente isolation forest del mismo modelo | No supervisado | 0,979 | 23 características tabulares | Apache-2.0 | Incluido en el repo |
| Isolation Forest genérico (scikit-learn, PyOD) | No supervisado | no disponible | Tabular | BSD / varias | Amplia |
| River / detección de anomalías en streaming | No supervisado incremental | no disponible | Tabular | Apache-2.0 | Amplia |

No se dispone de cifras publicadas de alternativas comparables sobre este mismo conjunto de datos sintéticos, por lo que la comparación cuantitativa externa queda como no disponible. Frente a un isolation forest genérico, la diferencia cualitativa es la capa supervisada más la calibración conformal, que aporta una tasa de falsos escalados controlada (2,1 % observado frente a 2,0 % objetivo) en lugar de una puntuación sin garantía estadística.

## Limitaciones y advertencias

- **Solo es una señal ascendente**: nunca rebaja un nivel de aprobación ni rechaza un pago por sí misma. La tarjeta advierte explícitamente de que no debe usarse como única defensa de nada.
- **Pagos duplicados**: es la familia peor cubierta, con recall del 45,0 % (IC 33,1 % a 57,5 %) y AUROC 0,761; el propio autor indica que YINGLONG los detecta primero con comprobaciones deterministas. Un modelo por pago tiene dificultades estructurales con la duplicidad.
- **Datos exclusivamente sintéticos**: no hay validación publicada sobre tráfico real. Existe riesgo de brecha simulación-realidad en la distribución de importes, contrapartes y hábitos de gasto.
- **Muestras pequeñas en varias familias**: entre 55 y 67 elementos de test en cinco de las nueve familias, lo que produce intervalos de confianza anchos (por ejemplo, 93,5 % a 100,0 %).
- **Cobertura limitada de arquetipos**: solo `student` y `sme`. Otras poblaciones de cartera (particulares de renta alta, tesorerías, DAOs, comercios) quedan fuera de la calibración y no pueden asumirse cubiertas.
- **Dependencia de estado**: seis de las características describen historial reciente (pagos en la última hora y día, cambios de dirección, importes bajo umbral), por lo que el modelo necesita un agregador de historial fiable; sin él, la puntuación pierde buena parte de su valor.
- **Umbral sensible a la política**: alpha = 0,0221 está atado a un objetivo del 2,0 % de falsos escalados; cambiar la política de tolerancia exige recalibrar, no solo mover el umbral a ojo.
- **Ataques no vistos**: la familia "sustitución de dirección" se dejó fuera del entrenamiento a propósito y baja al 86,6 % de escalados y AUROC 0,994, lo que sugiere degradación razonable pero real ante patrones nuevos.
- **Riesgo de alucinación**: no aplica en el sentido de modelos generativos, pero sí existe riesgo de clasificación errónea silenciosa; el diseño mitiga el impacto porque un error solo puede derivar en una petición de confirmación adicional.
- **Licencia**: Apache-2.0 permite uso comercial y modificación con las obligaciones habituales de atribución y sin garantías. Conviene revisar que las dependencias (LightGBM, scikit-learn, skops) mantengan licencias compatibles en el despliegue.
- **Artefacto sin soporte comunitario**: 0 descargas y 0 likes en HuggingFace, y un único mantenedor; no hay garantía de mantenimiento ni de respuesta a incidencias.
- **No publica el pickle de producción**: deliberado por seguridad, pero implica que la equivalencia con el servicio en vivo se apoya en la verificación de 4.000 filas y en los SHA-256 documentados, no en el artefacto original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ABRUBAB/yinglong-behaviour-anomaly
- Repositorio del proyecto en GitHub: https://github.com/ABRUBAB/YINGLONG
- Servicio en vivo: https://app.yinglong-agent.tech
- No se han encontrado en la información disponible artículos, papers, blogs técnicos ni demos adicionales.
