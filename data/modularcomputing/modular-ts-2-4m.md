# Modularcomputing/Modular-TS-2.4M

## Resumen

Modular-TS-2.4M es un modelo fundacional de series temporales de 2,41 millones de parámetros (2.407.680 exactos), publicado por Modular Computing y entrenado desde cero (sin pesos preentrenados de terceros, sin fine-tuning ni destilación) para predicción probabilística zero-shot. Dado un histórico univariante o multivariante, devuelve 21 cuantiles monótonos por cada paso futuro más la media, sin necesidad de ajuste por serie. Su propuesta es explícita: rendimiento competitivo en un rango de tamaño que quepa en CPU o en un dispositivo de gama móvil.

La arquitectura es un transformer decoder de tipo patch (estilo Timestral), con d_model 128, 2 cabezas, MLP de 320 y 8 capas que alternan atención temporal y atención entre variables, con patch de 32. Soporta contextos de hasta 8.192 pasos. El código de arquitectura adapta componentes del paquete de inferencia `timestral` de Mistral AI (Apache-2.0), pero el autor declara que ningún peso de Timestral fue cargado ni reutilizado.

Es relevante ahora porque compite en el benchmark GIFT-Eval (97 configuraciones, zero-shot) con modelos del mismo orden de magnitud: obtiene CRPS 0.511 frente a 0.520 de TTM-R3 y 0.513 de TimeSSM-2.5M, y MASE 0.745 frente a 0.724 de TTM-R3 y 0.754 de TimeSSM-2.5M. El modelo se distribuye con pesos en safetensors, configuración y el paquete de entrenamiento/evaluación, aunque con una licencia de pesos no comercial que conviene revisar antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de tipo patch (estilo Timestral), d_model 128, 2 cabezas, MLP 320, 8 capas alternando atencion temporal y atencion entre variables, patch de 32 |
| Parametros totales | 2.407.680 (embed 107.392 / trunk 1.804.672 / head 495.616) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 8.192 pasos |
| Tipos de cuantizacion | No disponible en la informacion; por tamano (2,4 M de parametros) la cuantizacion no es necesaria en la practica |
| Idiomas soportados | No aplica: modelo de series temporales, no linguistico |
| Licencia | Pesos: CC BY-NC 4.0 (uso de investigacion y no comercial). Codigo (`modular_ts/`): Apache-2.0. Las etiquetas de HuggingFace indican `apache-2.0`, en contradiccion con la model card |
| Formato de pesos | safetensors (`export/model.safetensors`) + `export/config.json`; requiere el paquete `modular_ts` para la carga |

Otros datos: pipeline declarado `time-series-forecasting`; salida de 21 cuantiles monotonos por paso mas la media; publicado el 20 de octubre de 2026; 0 descargas y 0 likes en el momento de la consulta; autor citado Chima Emmanuel Akuegbo y Modular Computing.

## Arquitectura y entrenamiento

El modelo es un transformer decoder aplicado a parches temporales: la serie se trocea en ventanas de 32 pasos y cada parche se proyecta a un espacio de dimension 128. Las 8 capas alternan atencion a lo largo del eje temporal y atencion entre variables, lo que permite manejar tanto series univariantes como multivariantes con dependencias cruzadas. La cabeza produce 21 cuantiles monótonos por paso (más la media), lo que convierte al modelo en un pronosticador probabilistico directo, no en un regresor puntual al que haya que anadir intervalos a posteriori. El contexto maximo es de 8.192 pasos, muy por encima de la ventana tipica de modelos de este tamano.

El entrenamiento combina datos sinteticos (mayoria) y reales (~40% en la etapa final). El generador sintetico esta vectorizado en GPU y cubre kernels de proceso gaussiano, procesos de Ornstein-Uhlenbeck con cambio de regimen, plantillas de forma de onda y curvas de carga, escalones, curvas de crecimiento, recuentos intermitentes, mezcla multivariante con desfase (lead-lag), covariables y valores faltantes, seguido de una cascada de aumento de datos. La parte real usa GiftEvalPretrain, muestreado por resolucion con TSMixup, tras un filtro de contaminacion que elimina cualquier dataset solapado con los conjuntos de test de GIFT-Eval. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion, algo esperable en un modelo no linguistico.

La innovacion principal no es algorítmica sino de escala y metodo de evaluacion: el autor afirma que las cifras son estrictamente zero-shot (el modelo nunca ve el split de entrenamiento del dataset de test en inferencia), mientras que TTM-R3-PT usa el train split de cada dataset para backtest ensembling. La evaluacion se hizo con el harness oficial de GIFT-Eval en configuracion de leaderboard, y se indica que el mismo harness reproduce exactamente las puntuaciones publicadas de los modelos de referencia.

## Capacidades

- Pronostico probabilistico zero-shot: 21 cuantiles monótonos por paso futuro mas la media, sin ajuste por serie.
- Series univariantes y multivariantes: la atencion alterna entre ejes temporales y entre variables.
- Contexto largo: hasta 8.192 pasos de historia como entrada.
- Covariables y valores faltantes: el pipeline de entrenamiento incluye covariables y missingness explicitos.
- Patrones cubiertos: estacionalidad, tendencia, cambios de regimen, curvas de carga, recuentos intermitentes y desfases multivariantes.
- Inferencia en hardware modesto: el autor indica que funciona en CPU y en dispositivos de clase movil.
- Integracion con el ecosistema GIFT-Eval: resultados por configuracion en `results/all_results.csv`.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es un modelo puramente numerico de series temporales.

## Casos de uso

- Prevision de demanda en retail: con 8.192 pasos de historia, el modelo puede ingerir mas de dos anos de datos horarios y devolver intervalos de demanda por SKU; los cuantiles permiten fijar niveles de stock por percentil (por ejemplo, P90 para articulos criticos) en lugar de una unica cifra.
- Gestion de carga energetica: las curvas de carga y los cambios de regimen estan en el dataset sintetico de entrenamiento, lo que lo hace util para predecir consumo por tramos y dimensionar capacidad con bandas de incertidumbre; el autor advierte que es mas debil en series de energia de alta frecuencia y horizonte largo.
- Monitorizacion de metricas de infraestructura: al ejecutarse en CPU, puede desplegarse junto al propio servidor para pronosticar latencia, peticiones por segundo o uso de disco, y disparar alertas cuando el valor observado cae fuera de la banda P10-P90.
- Analitica en el borde (edge) sin GPU: en sensores IoT o pasarelas con recursos limitados, los 2,4 M de parametros permiten inferencia local sin enviar series a la nube, con el ahorro de ancho de banda y latencia que ello implica.
- Planificacion de capacidad y presupuestos: prevision de series mensuales o semanales con cuantiles para escenarios pesimista/base/optimista en informes financieros y de operaciones.
- Deteccion de anomalias: la comparacion del valor real con el intervalo de prediccion es un detector natural; util en telemetria industrial, calidad de sensores o fraude en series de transacciones.
- Investigacion en modelos fundacionales de series: el repositorio incluye generador de datos sinteticos, codigo de entrenamiento y evaluacion, por lo que sirve como banco de pruebas reproducible a escala pequena.

## Benchmarks y rendimiento

GIFT-Eval, 97 configuraciones completas, zero-shot. Media geometrica relativa a Seasonal Naive (menor es mejor):

| Modelo | Parametros | MASE | CRPS |
|---|---|---|---|
| Modular-TS-2.4M | 2,41 M | 0,745 | 0,511 |
| IBM TTM-R3 (PT) | ~1-5 M | 0,724 | 0,520 |
| TimeSSM-2.5M | 2,5 M | 0,754 | 0,513 |
| Seasonal Naive | - | 1,000 | 1,000 |

El autor destaca el mejor CRPS entre los modelos abiertos de 2,5 M de parametros o menos que evaluo, y que supera a TimeSSM-2.5M en ambas metricas y a TTM-R3 en CRPS, pero no en MASE. Advertencia metodologica: las cifras de TTM-R3-PT no son estrictamente comparables porque ese modelo usa el train split de cada dataset para backtest ensembling, mientras que Modular-TS-2.4M es zero-shot puro. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks linguisticos, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,6 MB para los pesos en FP32 y unos 4,8 MB en FP16, calculado a partir de los 2.407.680 parametros; el consumo real lo dominan las activaciones, que dependen del tamano de lote y de la longitud de contexto (hasta 8.192 pasos, es decir, 256 parches de 32).
- GPU recomendadas: no se especifican en la informacion. Por tamano, cualquier GPU con unos pocos cientos de MB libres es suficiente; no tiene sentido reservar A100 o H100 exclusivamente para este modelo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en iGPU. El autor indica que funciona comodamente en CPU y en dispositivos de clase movil.
- Opciones de despliegue: PyTorch con el paquete `modular_ts` incluido (envoltorio sobre el forecaster `timestral` de Mistral AI, Apache-2.0). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de series temporales.
- Latencia y throughput: no disponibles en la informacion proporcionada. No se han publicado mediciones de tokens por segundo, tiempo por ventana ni coste de inferencia por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MASE (GIFT-Eval) | CRPS (GIFT-Eval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Modular-TS-2.4M | 2,41 M | 8.192 pasos | 0,745 | 0,511 | CC BY-NC 4.0 (pesos) / Apache-2.0 (codigo) | HuggingFace, pesos safetensors |
| IBM TTM-R3 (PT) | ~1-5 M (segun model card) | No disponible | 0,724 | 0,520 | No disponible | No disponible en la informacion |
| TimeSSM-2.5M | 2,5 M | No disponible | 0,754 | 0,513 | No disponible | No disponible en la informacion |
| Seasonal Naive | - | - | 1,000 | 1,000 | No aplica | Baseline trivial |

La comparativa se limita a los tres modelos que el autor reporta en su model card; no se dispone de datos de otras alternativas de la misma categoria (por ejemplo, modelos fundacionales de series de mayor tamano) en la informacion proporcionada.

## Limitaciones y advertencias

- Precision puntual por debajo de TTM-R3: el MASE de 0,745 frente a 0,724 indica mayor error en la prediccion puntual, aunque el CRPS sea mejor.
- Debilidad declarada en series de energia y meteorologia de alta frecuencia y horizonte largo, donde el modelo puede no capturar bien la dinamica.
- Modelo pequeno: captura bien estacionalidad y tendencia comunes, pero puede perder cambios de regimen poco frecuentes.
- Licencia de pesos CC BY-NC 4.0: prohibido el uso comercial de los pesos sin acuerdo adicional, motivado por la mezcla de datasets con licencias diversas en la porcion de datos reales.
- Contradiccion de licencia: las etiquetas de HuggingFace declaran `apache-2.0` mientras la model card y el frontmatter indican `cc-by-nc-4.0` para los pesos. Debe prevalecer la model card, pero conviene aclararlo con el autor antes de cualquier despliegue.
- Riesgo de alucinacion en sentido estadistico: fuera de distribucion, los cuantiles pueden ser excesivamente estrechos y dar falsa confianza en las bandas de prediccion.
- Sin garantias de calibracion por dominio: la evaluacion es agregada sobre 97 configuraciones; el rendimiento por serie concreta puede variar y no se publican garantias por tipo de serie.
- Ausencia de soporte linguistico, tool calling o multimodal: no es un modelo de proposito general.
- Cero traccion comunitaria en el momento de la consulta (0 descargas, 0 likes), por lo que no hay validacion independiente de los resultados.
- Dependencia del paquete `modular_ts` y de los componentes adaptados de `timestral` para cargar los pesos; no hay un camino de carga estandar fuera de ese envoltorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Modularcomputing/Modular-TS-2.4M
- Perfil del autor en HuggingFace: https://huggingface.co/Modularcomputing
- Paquete de inferencia `timestral` de Mistral AI (Apache-2.0, referenciado en la model card; sin URL directa en la informacion disponible)
- GIFT-Eval (harness y leaderboard de evaluacion, referenciado en la model card; sin URL directa en la informacion disponible)
- Resultados por configuracion: `results/all_results.csv` dentro del repositorio del modelo
