# ABRUBAB/yinglong-cash-forecaster

## Resumen

yinglong-cash-forecaster (M5) es un modelo de previsión de series temporales publicado por ABRUBAB dentro del proyecto YINGLONG, un agente de cartera con IA que solo ejecuta pagos dentro de las reglas de gasto que el propietario ha bloqueado. El modelo pronostica el saldo diario de la cuenta de tesorería de una pyme para los próximos 28 días en forma de banda (once cuantiles, del 5 % al 95 %) y estima la probabilidad de que el saldo caiga por debajo del suelo de reserva en un horizonte de 14 días.

Técnicamente no es una red neuronal ni un modelo de lenguaje: es un conjunto de once modelos LightGBM de regresión cuantilica que trabajan sobre características derivadas del histórico de saldos y de los flujos de salida conocidos (nóminas, facturas de proveedores, suministros, transitarios, nube, barridos), junto con indicadores de fin de semana y festivos. Los importes se manejan como enteros en fen (1/100 de yuan), coherentemente con el resto del sistema. El modelo es puramente advisory: solo puede hacer que el agente de tesorería sea más prudente (por ejemplo, escalar al consejo antes de un pago grande), nunca autorizar una operación; la decisión final la toman la proyección determinista y la regla on-chain de suelo de reserva.

Su relevancia práctica está en el nicho: ofrece una alternativa entrenada y calibrada frente a modelos fundacionales zero-shot en un dominio concreto (tesorería en CNY), con métricas publicadas de pérdida pinball y de calibración de la banda, y con la licencia Apache-2.0. La contrapartida es que se ha entrenado exclusivamente con datos sintéticos (ocho libros contables ficticios de pymes), por lo que su validez fuera de ese simulador está por demostrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre árboles de decisión) con regresión cuantilica; once modelos independientes, uno por cuantil (q0.05 a q0.95) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | entrada: 29 o más balances diarios históricos más los flujos de salida programados día a día; horizonte de predicción: 28 días |
| Tipos de cuantizacion | no aplica (no es una red neuronal); los modelos se distribuyen como ficheros de texto plano de LightGBM y no se publican variantes cuantizadas ni reducidas |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural; opera sobre series numéricas de saldo en fen) |
| Licencia | Apache-2.0 |
| Formato de pesos | ficheros de texto plano de LightGBM (`m5_lgbm_q0.05.txt` … `m5_lgbm_q0.95.txt`, con SHA-256 en `results.json`) más `yinglong_m5.py` (código exacto de características que ejecuta el servicio en producción) y `results.json` (evaluación completa) |

## Arquitectura y entrenamiento

El modelo es un ensemble de once regresores LightGBM entrenados con objetivo de pérdida pinball (regresión cuantilica) para los cuantiles 0.05, 0.10 … 0.95. Cada uno predice un cuantil del saldo para cada día del horizonte de 28 días; la unión de las once predicciones forma la banda que se muestra al tesorero. Las características incluyen el histórico de saldos diarios (mínimo 29 días), los flujos de salida conocidos y programados por día futuro, y banderas de fin de semana y festivos, según el código de `yinglong_m5.py`. Sobre la banda cruda se aplica conformalized quantile regression (CQR) para corregir la infracobertura; no se documenta en la información disponible si hubo ajuste fino posterior, regularización específica ni búsqueda de hiperparámetros más allá de lo que aparece en el repositorio.

El entrenamiento y la evaluación se hicieron íntegramente con datos sintéticos: ocho libros contables de pymes ficticias con importes en CNY sobre un raíl simulado, generados por `ml/forecast/ledger.py` y procesados por `ml/forecast/train_eval.py` del repositorio YINGLONG. No se ha usado ni un solo dato de empresas reales. La evaluación se realizó sobre orígenes de test reservados (312 orígenes de previsión), lo que permite comparar contra alternativas zero-shot, pero también implica que el modelo no ha visto la estacionalidad, los festivos ni los comportamientos de pago reales de ningún cliente.

## Capacidades

- Previsión cuantilica del saldo diario de tesorería a 28 días con once cuantiles, lo que permite construir bandas de confianza asimétricas y no solo una predicción puntual.
- Estimación de la probabilidad de incumplimiento del suelo de reserva a 14 días, evaluada con Brier score.
- Incorporación de flujos de salida conocidos y programados (nóminas, proveedores, suministros, transitarios, nube, barridos) como variables exógenas por día futuro.
- Tratamiento explícito de fines de semana y festivos en el calendario de pagos.
- Funcionamiento como herramienta de escalado dentro de un agente: la previsión puede incrementar la prudencia del agente de tesorería, pero no aprobar pagos.
- Integración como módulo Python importable mediante `huggingface_hub` y `importlib`, sin servidor de inferencia dedicado.
- No soporta tool calling, agentes multi-paso, generación de texto, visión, audio ni razonamiento en lenguaje natural; no es un modelo de propósito general.

## Casos de uso

- **Previsión de liquidez en pymes:** el modelo recibe los últimos 29 o más saldos diarios y los pagos programados, y devuelve la banda de saldo a 28 días. Es adecuado porque la salida en cuantiles permite al tesorero ver el escenario pesimista sin asumir una única curva.
- **Alerta temprana de incumplimiento del suelo de reserva:** con la probabilidad de breach a 14 días, el sistema puede disparar una revisión humana cuando el riesgo supera un umbral, antes de que el saldo llegue al mínimo operativo.
- **Escalado previo a pagos grandes:** en YINGLONG, una previsión con breach probable puede hacer que el agente solicite aprobación del consejo antes de ejecutar un pago elevado; el modelo actúa como señal de prudencia, no como autorizador.
- **Planificación de nóminas y pagos a proveedores:** dado que acepta flujos de salida conocidos por día, se puede simular el efecto de adelantar o retrasar facturas concretas sobre la banda de saldo de las cuatro semanas siguientes.
- **Gestión de colchón de liquidez:** comparar la banda del cuantil 0.05 con el mínimo exigido por la política interna permite fijar cuánto efectivo mantener inmovilizado y cuánto se puede destinar a operaciones.
- **Integración en un pipeline de decisión con reglas deterministas:** el output del modelo se consume junto a la proyección determinista y la regla de suelo, de modo que un equipo puede auditar por separado la parte estadística y la parte normativa.
- **Evaluación comparativa frente a alternativas zero-shot:** sirve como referencia interna para decidir si merece la pena entrenar un modelo específico en lugar de usar un modelo fundacional de series temporales.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre orígenes de test reservados: 8 libros sintéticos, 312 orígenes de previsión, horizonte de 28 días. Menor es mejor salvo en cobertura (objetivo del 90 %).

| Metodo | Pinball escalado | Pinball dias 1-7 (CNY) | Pinball dias 8-28 (CNY) | Cobertura banda 90% (tras CQR) | Brier, breach a 14 dias |
|---|---|---|---|---|---|
| LightGBM cuantilico (este modelo) | 0.077 | 52.239 | 131.231 | 86,7 % | 0,061 |
| Chronos-2 (zero-shot) | 0.093 | 78.053 | 154.270 | 88,7 % | 0,084 |
| Naive estacional | 0.145 | 114.428 | 242.325 | 89,3 % | 0,101 |

Datos adicionales de la evaluación: la banda del 90 % sin calibrar cubre solo el 74,3 % de los casos; tras aplicar CQR sube al 86,7 %, todavía por debajo del objetivo. La tasa base de breach en el conjunto de test es del 13,1 %.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un conjunto de árboles LightGBM, no requiere GPU ni VRAM dedicada.
- VRAM estimada: 0 GB; la memoria necesaria es la del proceso Python con LightGBM y numpy, no se publica el consumo exacto ni el tamaño en disco de los once ficheros de texto.
- GPU recomendadas: ninguna. No hay soporte documentado de aceleración por GPU para este despliegue.
- Cabe en cualquier equipo de desarrollo convencional, incluidos portátiles y contenedores pequeños; el cuello de botella esperable es el preprocesado de características, no el modelo.
- Opciones de despliegue: Python con `lightgbm` y `huggingface_hub`, cargando `yinglong_m5.py` y los once ficheros de texto. No aplica vLLM, TGI, llama.cpp ni Ollama, que están pensados para modelos neuronales.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Rendimiento en la evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| yinglong-cash-forecaster | LightGBM cuantilico (11 modelos) | no disponible | entrada de 29+ días; horizonte de 28 días | Pinball escalado 0.077; Brier 0.061 | Apache-2.0 | HuggingFace, con código de características incluido |
| Chronos-2 | Modelo fundacional de series temporales, zero-shot | no disponible en la información | no disponible; evaluado a 28 días | Pinball escalado 0.093; Brier 0.084 | no disponible en la información | no disponible en la información |
| Naive estacional | Baseline estadístico | no aplica | 28 días | Pinball escalado 0.145; Brier 0.101 | no aplica | implementación trivial |

La comparación solo es válida en el dominio evaluado (libros sintéticos en CNY); no hay datos que permitan extrapolarla a otros conjuntos ni a datos reales.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con datos sintéticos de ocho pymes ficticias; el comportamiento sobre libros contables reales no está validado y puede degradarse de forma significativa.
- Calibración insuficiente: la banda nominal del 90 % cubre el 86,7 % tras CQR (74,3 % sin calibrar), por debajo del objetivo. No debeinterpretarse como un intervalo con garantía estadística estricta.
- El Brier score de 0,061 para el breach a 14 días debe leerse contra una tasa base del 13,1 %; es una mejora modesta y no una garantía de detección.
- Dominio monetario restringido: importes en fen y yuanes, con supuestos de calendario del simulador. No hay soporte documentado para otras divisas, otras jurisdicciones ni otros raíles de pago.
- El modelo es advisory por diseño y solo puede escalar decisiones; no autoriza pagos. No debe usarse como única defensa de ningún control financiero.
- Sin información publicada sobre sesgos, robustez ante cambios de distribución, drift estacional ni comportamiento en periodos de crisis de liquidez.
- No procesa lenguaje natural ni documentos: requiere que otro componente extraiga los flujos programados y las banderas de calendario.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y aviso de cambios; no se documentan restricciones adicionales en la información disponible.
- Recuento de descargas y likes nulo en el momento de la consulta; no hay evidencia de adopción ni de revisión independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ABRUBAB/yinglong-cash-forecaster
- Repositorio del proyecto YINGLONG: https://github.com/ABRUBAB/YINGLONG
- Servicio en producción (página de tesorería): https://app.yinglong-agent.tech
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
