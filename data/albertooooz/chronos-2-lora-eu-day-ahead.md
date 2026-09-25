# albertooooz/chronos-2-lora-eu-day-ahead

## Resumen

Chronos-2 LoRA — EU day-ahead electricity prices es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario albertooooz (albert zagrajek) sobre el modelo fundacional de series temporales amazon/chronos-2. Su proposito es la prevision horaria del precio day-ahead (DA) de la electricidad a 24 horas vista en 42 zonas de oferta europeas del panel ENTSO-E. No es un modelo autonomo: es un conjunto de pesos PEFT que se carga junto con el modelo base y que Chronos fusiona automaticamente.

El adaptador se entrena sobre 3.599.592 filas horarias de precios DA procedentes de la plataforma de transparencia de ENTSO-E, con un rango temporal que va del 31 de diciembre de 2014 al 31 de julio de 2025. La zona historica DE_AT_LU queda excluida. El entrenamiento no utiliza covariables meteorologicas, aunque el pipeline de inferencia permite aportarlas opcionalmente mediante `predict_df` (por ejemplo, datos de Open-Meteo).

Su relevancia actual es doble: por un lado, demuestra que el ajuste fino con LoRA de un modelo fundacional de series temporales mejora de forma sustancial la precision frente al modo zero-shot en un dominio tan ruidoso como el mercado electrico europeo; por otro, la mejora documentada es de entre un 27,1 % y un 28,6 % en MASE sobre el backtest de Polonia, lo que lo convierte en una referencia practica para quien trabaje con prevision de precios energeticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional de series temporales Chronos-2 con adaptador LoRA (PEFT) inyectado en la atencion y en la capa de salida |
| Parametros totales | no disponible (parametros del adaptador no publicados; rango LoRA r=8, alpha=16 sobre el modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 pasos temporales durante el fine-tuning; ventana maxima del modelo base: no disponible |
| Horizonte de prediccion | 24 pasos (24 horas) |
| Frecuencia de los datos | 1 hora (remuestreado desde 15 minutos cuando fue necesario) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere el modelo base amazon/chronos-2) |
| Cobertura | 42 zonas de oferta europeas (DE_AT_LU excluida) |
| Modulos objetivo del LoRA | `self_attention.q/k/v/o`, `output_patch_embedding.output_layer` |

## Arquitectura y entrenamiento

El adaptador se construye sobre Chronos-2, la familia de modelos fundacionales de series temporales de Amazon Science, que ofrece soporte zero-shot para prevision univariante, multivariante y con covariables. El ajuste se realiza en modo LoRA con rango r=8 y alpha=16, aplicado a las proyecciones de consulta, clave, valor y salida de la atencion, asi como a la capa de salida del embedding de parches. Esta configuracion mantiene congelado el grueso del modelo base y solo entrena un conjunto reducido de matrices de bajo rango.

Los datos de entrenamiento proceden de la plataforma de transparencia de ENTSO-E (precios day-ahead), con 42 zonas europeas, frecuencia horaria y 3.599.592 filas entre el 31 de diciembre de 2014 y el 31 de julio de 2025. Los ultimos 12 meses se reservan como ventana de evaluacion (holdout) y quedan fuera del entrenamiento. No se usaron covariables meteorologicas durante el entrenamiento. Los hiperparametros son: tasa de aprendizaje 1e-5, 5000 pasos, tamano de lote 64, contexto de 2048 pasos y longitud de prediccion 24. El entrenamiento se ejecuto en una NVIDIA GeForce RTX 5090 en RunPod. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable dado que no se trata de un modelo generativo de texto.

## Capacidades

- Prevision univariante del precio day-ahead horario a 24 horas vista para zonas de oferta europeas incluidas en el panel de entrenamiento.
- Salida probabilistica: genera previsiones puntuales y por cuantiles, lo que permite construir intervalos de incertidumbre.
- Soporte opcional de covariables meteorologicas en inferencia (por ejemplo, Open-Meteo) mediante `predict_df`, aunque el modelo no fue entrenado con ellas.
- Integracion con el pipeline `Chronos2Pipeline` de la libreria `chronos-forecasting`; el propio pipeline fusiona los pesos LoRA automaticamente.
- Funcionamiento en modo zero-shot del modelo base como referencia, y en modo ajustado al cargar el adaptador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, ya que no es un modelo de lenguaje.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

- Prevision de precios day-ahead para comercializadoras electricas: el adaptador genera la curva horaria de 24 horas para cada zona, lo que permite estimar el coste de compra en el mercado diario antes del cierre de la subasta.
- Optimizacion de ofertas en el mercado diario: con previsiones por cuantiles, un participante puede construir curvas de oferta ajustadas a su aversion al riesgo en lugar de depender de una unica prediccion puntual.
- Programacion de baterias y arbitraje de almacenamiento: la prevision horaria a 24 horas sirve como entrada para decidir ciclos de carga y descarga segun el diferencial esperado entre horas valle y horas punta.
- Gestion de riesgo de cartera energetica: los cuantiles permiten dimensionar el valor en riesgo (VaR) asociado a la exposicion al mercado diario en cada zona.
- Planificacion de consumo industrial flexible: una planta electrointensiva puede desplazar cargas a las horas previstas mas baratas empleando la previsión de 24 horas.
- Backtesting de estrategias de trading energetico: el modelo permite reproducir decisiones historicas sobre la ventana de holdout de 12 meses con horizontes de 24 horas y semilla fija, lo que facilita comparaciones reproducibles.
- Evaluacion comparativa de modelos fundacionales de series temporales: sirve como baseline ajustado frente a Chronos-2 y Chronos-2-small en modo zero-shot bajo un protocolo comun (MASE, MAE, ventana de 12 meses, 2 origenes aleatorios por mes).
- Investigacion sobre ajuste eficiente con LoRA en dominios de series temporales: el adaptador documenta un caso reproducible de transferencia de un modelo fundacional a un dominio concreto con solo 5000 pasos de entrenamiento.

## Benchmarks y rendimiento

Backtest walk-forward sobre los 12 meses reservados de Polonia (PL), con 2 dias de origen aleatorios por mes natural, horizonte de 24 horas, `random_seed=42` y frecuencia horaria. Metrica principal: MASE (la escala emplea el naive estacional en muestra sobre el contexto hasta cada origen). Datos tomados de la model card del autor y de `eval_results.json`.

| Modelo | Covariables | MASE zero-shot | MASE LoRA | Delta MASE |
|---|---|---|---|---|
| chronos-2 | ninguna | 0.824 | 0.595 | +27,8 % |
| chronos-2 | actual_weather | 0.779 | 0.556 | +28,6 % |
| chronos-2-small | ninguna | 0.843 | 0.611 | +27,6 % |
| chronos-2-small | actual_weather | 0.814 | 0.593 | +27,1 % |

El mejor resultado de la tabla corresponde a chronos-2 con covariables meteorologicas reales en inferencia (MASE 0.556). No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, porque no aplican a este tipo de modelo.

## Requisitos de hardware

- Entrenamiento documentado: NVIDIA GeForce RTX 5090 en RunPod, con 5000 pasos, lote de 64, contexto de 2048 y longitud de prediccion 24.
- VRAM estimada para inferencia: no disponible. El adaptador LoRA (r=8, alpha=16) anade una sobrecarga de memoria despreciable frente al modelo base, cuyo consumo es el factor dominante y no se especifica en la informacion disponible.
- GPU recomendadas: no disponible. Como referencia, el entrenamiento cupo en una RTX 5090, lo que sugiere que la inferencia es viable en GPUs de gama alta, pero no hay mediciones publicadas que lo confirmen.
- Viabilidad en GPU de consumo: no confirmada. Cualquier afirmacion al respecto seria una estimacion sin respaldo en los datos aportados.
- Opciones de despliegue: `chronos-forecasting` con el pipeline `Chronos2Pipeline`, mas `peft` y `torch` (segun las instrucciones del autor). No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Contexto | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| albertooooz/chronos-2-lora-eu-day-ahead | Adaptador LoRA sobre Chronos-2 | 42 zonas ENTSO-E (DE_AT_LU excluida) | 2048 pasos en entrenamiento | Apache 2.0 | MASE 0.595 sin covariables y 0.556 con meteorologia real en el backtest de PL |
| albertooooz/chronos-2-lora-pl-day-ahead | Adaptador LoRA sobre Chronos-2 | Polonia (una unica zona) | no disponible | no disponible | no disponible en la informacion recogida |
| amazon/chronos-2 (zero-shot) | Modelo fundacional de series temporales | Univariante, multivariante y con covariables | no disponible | no disponible | MASE 0.824 sin covariables y 0.779 con meteorologia real en el backtest de PL |
| chronos-2-small (zero-shot) | Modelo fundacional de series temporales (variante reducida) | Univariante, multivariante y con covariables | no disponible | no disponible | MASE 0.843 sin covariables y 0.814 con meteorologia real en el backtest de PL |

El recuento de parametros de Chronos-2 y de Chronos-2-small no se especifica en la informacion disponible, por lo que la comparativa se limita a cobertura, contexto de entrenamiento, licencia y metricas publicadas.

## Limitaciones y advertencias

- El adaptador se entrena de forma conjunta sobre 42 series day-ahead europeas; la zona historica DE_AT_LU queda excluida y no hay garantia de comportamiento fuera de esas 42 zonas.
- La tabla de evaluacion corresponde unicamente al walk-forward de Polonia (PL), el mismo protocolo que el adaptador especifico de Polonia. No es un ranking por zona ni un leaderboard europeo completo.
- El modelo no incorpora factores fundamentales como precios de combustible, indisponibilidades de generacion o flujos transfronterizos; solo modela el historial de precios y, opcionalmente, meteorologia en inferencia.
- Las covariables meteorologicas no se usaron en entrenamiento. Aportarlas en inferencia mejora el MASE en el backtest documentado, pero introduce una dependencia de calidad y disponibilidad de esos datos en produccion.
- Las salidas son previsiones probabilisticas (puntuales y por cuantiles): deben validarse antes de cualquier uso en produccion.
- No es un sustituto de la prevision profesional de mercados energeticos ni de la gestion de riesgo financiero.
- No se han identificado sesgos especificos en la informacion disponible, aunque cabe esperar el sesgo estructural de los datos de ENTSO-E: cambios regulatorios, reformas de mercado, crisis energetica de 2021-2022 y variaciones en la composicion del mix de generacion pueden degradar la calibracion.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero existe riesgo de extrapolacion incorrecta ante regimenes de precio no vistos durante el entrenamiento (por ejemplo, precios negativos prolongados o picos extremos).
- Licencia Apache 2.0 en el adaptador, lo que permite uso comercial con las obligaciones habituales de atribucion. La licencia del modelo base amazon/chronos-2 no se especifica en la informacion disponible y debe comprobarse antes de un despliegue comercial.
- El adaptador no es autonomo: requiere cargar amazon/chronos-2. Su uso aislado no funciona.
- Repositorio sin descargas ni likes en el momento de la consulta (0 y 0), creado y actualizado el mismo dia (25 de septiembre de 2026). No existe validacion independiente por parte de terceros.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/albertooooz/chronos-2-lora-eu-day-ahead
- Modelo base: https://huggingface.co/amazon/chronos-2
- Autor: https://huggingface.co/albertooooz
- Adaptador solo para Polonia: https://huggingface.co/albertooooz/chronos-2-lora-pl-day-ahead
- Repositorio de chronos-forecasting: https://github.com/amazon-science/chronos-forecasting
- Sitio de la familia Chronos: https://chronos-ts.ai/
- Plataforma de transparencia de ENTSO-E: no disponible en la informacion proporcionada (fuente citada por el autor, sin enlace directo)
- Open-Meteo (covariables opcionales en inferencia): no disponible en la informacion proporcionada (mencionado por el autor, sin enlace directo)
- Resultados de evaluacion estructurados: `eval_results.json` dentro del repositorio del adaptador
