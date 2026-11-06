# HollowTensor/Toto-Evolve-0.1

## Resumen

Toto-Evolve-0.1 es un checkpoint afinado de Toto-2.0-22m, el modelo fundacional de 22 millones de parametros de Datadog para prediccion probabilistica de series temporales en modo zero-shot. Lo publica el usuario independiente HollowTensor y mantiene intactas la arquitectura, el tamano y la interfaz del modelo base: la unica diferencia es un entrenamiento adicional orientado a mejorar la precision del pronostico. Es, por tanto, un reemplazo directo ("drop-in") del checkpoint original, no un modelo nuevo.

Su relevancia esta en el punto de partida del base: Toto 2.0 se preentreno exclusivamente con datos de observabilidad de Datadog y series sinteticas, sin datos publicos de forecasting. Este checkpoint anade preentrenamiento continuado sobre series publicas de GiftEvalPretrain (sin solapamiento con el conjunto de test de GIFT-Eval), un 30 % de datos sinteticos dirigidos a patrones problematicos y un termino ligero de destilacion desde Toto-2.0-313m.

El resultado medido en GIFT-Eval (97 configuraciones) es una mejora del 1,0 % en CRPS y del 0,6 % en MASE respecto al base, con mejoras en 66 de las 97 configuraciones y un rendimiento cercano a TimesFM-2.5 pese a tener un orden de magnitud menos de parametros. Es una version de investigacion temprana (v0.1), con las entradas de covariables heredadas sin reevaluar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para series temporales (Toto 2.0, parches contiguos con enmascaramiento); detalles internos no disponibles |
| Parametros totales | 21.915.584 (~22M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 (configuracion de evaluacion Toto 2.0) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | toto-2 |
| Pipeline | time-series-forecasting |
| Modelo base | Datadog/Toto-2.0-22m |
| Tamano del repositorio | 0,1 GB |
| Salida | Pronostico probabilistico (cuantiles) |

## Arquitectura y entrenamiento

La arquitectura es la de Toto 2.0: un transformer que opera sobre parches contiguos de la serie temporal y se entrena con una perdida de cuantiles por parche (pinball loss) junto con enmascaramiento de parches contiguos. El checkpoint no modifica esa arquitectura ni el objetivo; el autor indica explicitamente que se mantiene la misma interfaz, incluido el envoltorio `Toto2GluonTSModel`.

El entrenamiento adicional consta de tres piezas. Primero, preentrenamiento continuado sobre series temporales publicas de GiftEvalPretrain, excluyendo el split de entrenamiento de GIFT-Eval y sin solapamiento con el conjunto de test. Segundo, un 30 % de series sinteticas disenadas para cubrir patrones que el base manejaba mal: crecimiento acumulativo, demanda intermitente, metricas operativas con picos y series cortas de baja frecuencia. Tercero, un termino de destilacion con peso 0,2 desde Toto-2.0-313m sobre las mismas ventanas de entrenamiento. No se menciona RLHF ni DPO, algo esperable en un modelo de forecasting.

## Capacidades

- Pronostico probabilistico de series temporales en modo zero-shot, con salida por cuantiles.
- Prediccion multivariante: evaluado en GIFT-Eval con entradas multivariantes, igual que el modelo base.
- Soporte de covariables exogenas heredado del base, aunque sin reevaluar en este checkpoint.
- Manejo mejorado de series de crecimiento acumulativo (hasta −12 % de CRPS en `covid_deaths`).
- Mejora en metricas operativas de tipo Web/CloudOps (−2,4 % de CRPS).
- Capacidad de trabajar con series cortas, semanales y mensuales, aunque con degradacion en algunos casos.
- No soporta generacion de texto, codigo, vision, audio ni tool calling: es un modelo puramente numerico.

## Casos de uso

- Monitorizacion de infraestructura y SLO: el modelo pronostica metricas operativas (latencia, tasa de errores, trafico) y sus bandas de cuantiles permiten fijar umbrales de alerta con incertidumbre explicita; es el area donde el checkpoint muestra la mayor mejora (−2,4 % de CRPS en Web/CloudOps).
- Planificacion de capacidad: con contexto de 4096 pasos y soporte multivariante, se puede alimentar con varias metricas correlacionadas (CPU, memoria, peticiones) para anticipar saturaciones.
- Prevision de demanda intermitente: el 30 % de datos sinteticos cubre demanda esporadica, un caso tipico en repuestos, inventario de cola larga o recambios.
- Series acumulativas (contadores, casos acumulados, registros totales): el checkpoint mejora hasta un 12 % en CRPS en este tipo de series, donde el base fallaba por no modelar bien el crecimiento monotono.
- Pronostico financiero y de negocio a medio plazo: los horizontes medio y largo mejoran (CRPS 0,483→0,475 y 0,479→0,470), util para presupuestos trimestrales o previsiones de ingresos.
- Evaluacion comparativa de modelos de forecasting: al mantener la interfaz exacta de Toto 2.0 y licencia Apache-2.0, sirve como baseline reproducible en pipelines de investigacion con GIFT-Eval.
- Prototipado en local: con 22M de parametros y 0,1 GB de pesos, se puede ejecutar en CPU o en cualquier GPU consumer para pruebas de concepto.

## Benchmarks y rendimiento

Resultados en GIFT-Eval (97 configuraciones), relativos a seasonal naive por media geometrica; menor es mejor.

| Modelo | Parametros | CRPS | MASE |
|---|---|---|---|
| Toto-2.0-22m (base) | 22M | 0,496 | 0,719 |
| Toto-Evolve-0.1 | 22M | 0,491 | 0,714 |
| TimesFM-2.5 (referencia) | 231M | 0,490 | 0,705 |

Desglose por horizonte:

| Horizonte | Configuraciones | CRPS base | CRPS Toto-Evolve-0.1 |
|---|---|---|---|
| Corto | 55 | 0,508 | 0,506 |
| Medio | 21 | 0,483 | 0,475 |
| Largo | 21 | 0,479 | 0,470 |

Mejoras relativas: −1,0 % en CRPS y −0,6 % en MASE frente al base, con mejora en 66 de 97 configuraciones. La evaluacion sigue el protocolo oficial de GIFT-Eval con los ajustes de Toto 2.0 (contexto 4096), que reproducen las puntuaciones publicadas del base con un error maximo de 2e-6.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22M de parametros; en la practica, el cuello de botella es la longitud de contexto y el tamano del lote, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB es suficiente; A100/H100 solo tienen sentido para lotes grandes o evaluaciones masivas en paralelo.
- Cabe en GPU consumer: si, en cualquier RTX o incluso en CPU para inferencia de una sola serie.
- Opciones de despliegue: libreria `toto-2` del repositorio DataDog/toto; integracion con GluonTS mediante `Toto2GluonTSModel`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CRPS GIFT-Eval | MASE GIFT-Eval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Toto-Evolve-0.1 | 22M | 4096 | 0,491 | 0,714 | Apache-2.0 | Hugging Face (HollowTensor) |
| Toto-2.0-22m | 22M | 4096 | 0,496 | 0,719 | Apache-2.0 | Hugging Face (Datadog) |
| Toto-2.0-313m | 313M | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face (Datadog) |
| TimesFM-2.5 | 231M | no disponible | 0,490 | 0,705 | no disponible | no disponible |

Toto-Evolve-0.1 iguala practicamente a TimesFM-2.5 con diez veces menos parametros, a costa de ser un checkpoint derivado y no un modelo oficial con soporte del fabricante.

## Limitaciones y advertencias

- Version de investigacion temprana (v0.1); el autor anuncia mas iteraciones y no garantiza estabilidad de la interfaz ni de los resultados.
- Series cortas semanales y mensuales empeoran en algunos casos entre un 2 % y un 9 % respecto al base; no es una mejora uniforme.
- Las entradas de covariables exogenas se heredan sin cambios y no se han reevaluado: su comportamiento es incierto.
- La evaluacion se limita a GIFT-Eval; no hay resultados en otros conjuntos ni en dominios fuera de los cubiertos por GiftEvalPretrain.
- Riesgo de sobreajuste a la distribucion de GIFT-Eval, aunque el autor afirma que el split de test no se uso.
- No es un modelo linguistico: no procesa texto, no responde preguntas y no admite tool calling; cualquier uso conversacional es inadecuado.
- Es un trabajo independiente no afiliado ni respaldado por Datadog; la licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de atribucion de Datadog incluido en la model card.
- No hay informacion sobre sesgos, calibracion fuera de GIFT-Eval ni robustez ante datos anomalos en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HollowTensor/Toto-Evolve-0.1
- Modelo base: https://huggingface.co/Datadog/Toto-2.0-22m
- Modelo para destilacion: https://huggingface.co/Datadog/Toto-2.0-313m
- Repositorio de codigo: https://github.com/DataDog/toto
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
