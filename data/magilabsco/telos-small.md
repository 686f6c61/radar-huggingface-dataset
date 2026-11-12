# magilabsco/Telos-Small

## Resumen

Telos-Small es un modelo fundacional de series temporales desarrollado por MAGI Labs, orientado a la predicción probabilística zero-shot. A diferencia de los modelos autorregresivos que generan tokens de la serie paso a paso, Telos implementa una arquitectura JEPA (Joint-Embedding Predictive Architecture): codifica el historial observado en representaciones de parches y predice directamente en el espacio latente las representaciones de la trayectoria futura, que luego se proyectan sobre 21 cuantiles calibrados. Con 50.100.747 parámetros, es un modelo compacto que cabe en GPU de consumo.

El modelo resuelve el problema de la previsión probabilística multi-horizonte sin reentrenamiento: en un único forward pass puede emitir hasta 1.024 pasos futuros (32 parches de 32 pasos) con cuantiles no cruzados entre 0,01 y 0,99. Soporta series univariantes, paneles multivariantes, covariables pasadas y covariables futuras conocidas, con una longitud de contexto por defecto de 4.096 pasos y máxima de 8.192.

Su relevancia radica en la combinación de tamaño reducido (191 MB en fp32), licencia Apache-2.0 y resultados zero-shot competitivos frente a baselines clásicos como PatchTST, TFT o DLinear en suites como GIFT-Eval, FEV-Bench e IND-Eval, además de compararse con modelos fundacionales mayores como Chronos-Bolt y Sundial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA con encoder transformer de dos flujos (12 bloques, d_model=512, 8 cabezas) + predictor latente JEPA (2 bloques, hidden=1024) + cabeza de cuantiles (21 nudos) |
| Parametros totales | 50.100.747 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 pasos por defecto; 8.192 maximo |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32, 191 MB) |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code, requiere trust_remote_code) |

## Arquitectura y entrenamiento

Telos-Small se compone de tres modulos. El primero es un encoder de dos flujos con 12 bloques que alterna atencion causal temporal y atencion cruzada entre variables en el patron `[time, time, time, time_variate] × 3`. Emplea SinCosRoPE, atencion SDPA con compuerta sigmoide, conexiones skip tipo U-Net (`layer[k] -> layer[11-k]`) y enlaces Value-Residual desde la primera capa. El segundo es un predictor latente JEPA condicionado por horizonte (2 bloques, hidden=1024) que, dados los latentes del contexto causal y embeddings del paso de horizonte, predice los latentes objetivo de los parches futuros en un solo paso. El tercero es una cabeza de cuantiles monotona de 21 nudos que garantiza cuantiles estrictamente no cruzados.

El preprocesado usa escalado por parche de 32 pasos con estadisticas causales de Welford y compresion `asinh`, lo que maneja colas pesadas, series con exceso de ceros y cambios arbitrarios de escala sin fuga de informacion futura. El entrenamiento emplea un encoder objetivo con media movil (EMA, al estilo V-JEPA), regularizacion gaussiana isotropica Epps-Pulley (SIGReg), Tiled Decoupled-Horizon Forecasting (Tiled-DHF) multi-origen y un optimizador NorMuon ortogonalizado (Newton-Schulz-5) combinado con AdamW. Se realizaron 43.591 pasos DDP sobre 12.570.406 origenes de previsión en 2 GPUs NVIDIA Tesla P100-16GB. El corpus de preentrenamiento incluye series auditadas de Salesforce/GiftEvalPretrain (Apache-2.0) y priors dinamicos fisicos sinteticos de MAGI Labs.

## Capacidades

- Previsión probabilística zero-shot de series temporales con 21 cuantiles calibrados (0,01 a 0,99).
- Predicción multi-horizonte en un solo forward pass de hasta 1.024 pasos (32 parches).
- Soporte de series univariantes (B, T) y paneles multivariantes (B, V, T).
- Manejo de covariables pasadas y covariables futuras conocidas.
- Contexto largo de hasta 8.192 pasos.
- Robustez ante colas pesadas, series con exceso de ceros y cambios de escala mediante escalado causal Welford + asinh.
- Extraccion de caracteristicas (`feature-extraction`) ademas de la previsión.
- No soporta tool calling, agentes, vision, audio ni capacidades linguisticas: es un modelo puramente numerico.

## Casos de uso

- Previsión de demanda energetica: con contexto de hasta 8.192 pasos y covariables futuras conocidas (calendario, temperatura prevista), el modelo emite cuantiles de carga horaria a 1.024 pasos vista, utiles para planificacion de capacidad y mercados de ajuste.
- Gestion de inventario y cadena de suministro: paneles multivariantes (B, V, T) permiten predecir simultaneamente miles de SKUs con intervalos de confianza que alimentan politicas de stock de seguridad.
- Monitorizacion industrial y mantenimiento predictivo: en IND-Eval (187 tareas de sensores y pozos) el modelo logra 38,18% de skill CRPS frente a Seasonal Naive, adecuado para deteccion temprana de anomalias en sensores.
- Prevision financiera de alta frecuencia: la compresion asinh y el escalado Welford manejan colas pesadas y picos, permitiendo generar bandas de cuantiles para riesgo intradia.
- Prediccion meteorologica y de recursos renovables: con covariables futuras conocidas (pronosticos numericos) y horizontes largos, se pueden generar escenarios probabilisticos de generacion eolica o solar.
- Relleno de huecos y desagregacion temporal: al trabajar en espacio latente por parches, el modelo puede usarse para imputacion probabilistica y nowcasting sobre series irregulares.
- Evaluacion rapida de pipelines de forecasting: su tamano (191 MB fp32) permite desplegarlo en entornos de CI para benchmarking continuo de nuevas series sin coste elevado de GPU.

## Benchmarks y rendimiento

Resultados zero-shot publicados por el autor en 402 tareas de cuatro suites (skill % frente a Seasonal Naive, mayor es mejor):

| Suite | Tareas | Metrica | Telos-Small (JEPA puro) | Telos-Small (+ blend analitico) | Referencias |
|---|---|---|---|---|---|
| Salesforce GIFT-Eval (panel completo) | 97 tareas (371.330 ventanas) | CRPS Skill % | 43,21% | 43,79% | PatchTST 41,30%; TFT 39,53%; DLinear 15,44% |
| AutoGluon FEV-Bench (fev-bench-mini) | 20 tareas multidominio | SQL Skill % | 39,49% | 42,82% | TFT 35,26%; PatchTST 34,96%; CatBoost 28,41% |
| Cognite IND-Eval (industrial) | 187 tareas (9 fuentes) | CRPS Skill % | 38,18% | 34,06% | El JEPA puro supera al blend en +4,12 pts |
| ICML-2026 TIME Benchmark | 98 tareas (50 datasets) | CRPS Skill % | 36,54% | 35,70% | Sundial-base (128M) 33,66%; Chronos-Bolt (205M) 38,00% |

## Requisitos de hardware

- VRAM para inferencia: el checkpoint fp32 ocupa 191 MB; en la practica la VRAM depende del tamano de lote y de la longitud de contexto (4.096-8.192 pasos), pero el modelo cabe holgadamente en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB; funciona en NVIDIA Tesla P100 (las usadas para entrenar), RTX 4090, A100, H100.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (via oficial); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a LLM y no aplican a este modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; el modelo predice 1.024 pasos en un unico forward pass, lo que reduce drasticamente el coste frente a esquemas autorregresivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Resultado destacado |
|---|---|---|---|---|---|
| Telos-Small | 50,1M | 4.096-8.192 pasos | JEPA latente + cuantiles | Apache-2.0 | GIFT-Eval 43,21% CRPS skill |
| Chronos-Bolt | 205M | no disponible | Tokenizacion + transformer | Apache-2.0 | TIME Benchmark 38,00% CRPS skill |
| Sundial-base | 128M | no disponible | Fundacional de series | no disponible | TIME Benchmark 33,66% CRPS skill |
| PatchTST | no disponible | no disponible | Transformer con parches | no disponible | GIFT-Eval 41,30% CRPS skill |

Telos-Small es el mas pequeno de la comparativa y supera a PatchTST y TFT en GIFT-Eval, queda 1,46 puntos por debajo de Chronos-Bolt en TIME Benchmark y supera a Sundial-base en 2,88 puntos.

## Limitaciones y advertencias

- Modelo puramente numerico: no procesa texto, imagenes ni audio; no sirve para tareas linguisticas.
- Rendimiento dependiente del dominio: en IND-Eval el blend analitico empeora el resultado del JEPA puro (-4,12 pts), lo que sugiere que la combinacion con heuristicas no siempre es beneficiosa.
- Inferior a Chronos-Bolt (205M) en TIME Benchmark por 1,46 puntos de skill CRPS; el margen frente a modelos mayores no esta garantizado en todos los dominios.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de desplegar en produccion.
- Riesgo de calibracion deficiente de cuantiles en regimenes no vistos (series con cambios estructurales, regimenes extremos), ya que el modelo es zero-shot y no se ha reentrenado por dominio.
- Contexto maximo de 8.192 pasos: series con dependencias de muy largo plazo pueden requerir agregacion o modelos especializados.
- El modelo se publico con 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay validacion independiente de terceros sobre los benchmarks reportados.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara priors sinteticos con copyright de MAGI Labs; conviene revisar el aviso de licencia del repositorio por si hubiera terminos adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/magilabsco/Telos-Small
- Dataset de preentrenamiento: https://huggingface.co/datasets/Salesforce/GiftEvalPretrain
- Benchmark GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Benchmark FEV-Bench (AutoGluon): https://github.com/autogluon/fev-bench
- Benchmark IND-Eval (Cognite): no disponible
- Benchmark TIME (ICML-2026): no disponible
- Paper o blog de MAGI Labs sobre Telos: no disponible
- Repositorio de codigo: no disponible
