# abel-lab/Simons-297M

## Resumen

Simons-297M es un modelo fundacional de series temporales desarrollado por Abel AI Lab, disenado especificamente para pronostico probabilistico. Con 297,2 millones de parametros, se posiciona como una alternativa de peso medio dentro de la familia Simons 1, que incluye cuatro tamanos distintos. El modelo aborda el problema del forecasting multivariante con covariables conocidas en el futuro, una necesidad comun en entornos industriales, energeticos y financieros donde las predicciones deben incorporar informacion exogena planificada.

La arquitectura combina un transformer causal que opera sobre parches de 32 pasos temporales con una capa de atencion posterior entre las variables de una misma serie. Esta diseno permite manejar ventanas de contexto de hasta 32.768 pasos y generar horizontes de 512 pasos por pasada, con la posibilidad de extenderlos bloque a bloque. El modelo produce 9 cuantiles (0,1 a 0,9), lo que lo hace adecuado para decisiones que requieren intervalos de prediccion y no solo estimaciones puntuales.

Su relevancia actual radica en que se distribuye como pesos abiertos bajo licencia OpenMDW-1.1, con codigo de inferencia y entrenamiento disponible en GitHub, y con resultados publicados en los leaderboards de GIFT-Eval, fev-bench y TIME. Ademas, el autor declara una eficiencia computacional notable: pronostica un benchmark completo en minutos en una sola A100, aproximadamente diez veces mas rapido que modelos de tamano similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + capa de atencion entre variables; 13 capas, anchura 1280, 20 cabezas |
| Parametros totales | 297.230.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 pasos temporales de historia; 512 pasos por pasada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico de series temporales, no linguistico) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal que tokeniza la serie temporal en parches de 32 pasos. Tras procesar la secuencia de parches, aplica una capa de atencion transversal entre las variables (variates) de una misma serie, lo que permite capturar dependencias multivariantes. La configuracion concreta es de 13 capas, anchura 1280 y 20 cabezas de atencion. La entrada admite hasta 32 variables y hasta 16 covariables conocidas en el futuro por serie, tanto numericas como categoricas; los valores faltantes se marcan con NaN y las covariables solo pasadas se aceptan pero se descartan.

El entrenamiento se estructura en cuatro etapas, desde un preentrenamiento sintetico hasta un postentrenamiento sobre datos reales. Los pesos publicados son la media con pesos iguales entre el modelo de la etapa 3 y su continuacion, una tecnica de fusión conocida como WiSE-FT. El dataset de preentrenamiento esta disponible publicamente en abel-lab/Simons-Pretrain. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset, ni si se emplearon tecnicas de RLHF o DPO (poco habituales en este dominio).

## Capacidades

- Pronostico probabilistico: genera 9 cuantiles (0,1, 0,2, ..., 0,9) por cada paso del horizonte, lo que permite construir intervalos de prediccion.
- Series univariantes y multivariantes: soporta hasta 32 variables por serie.
- Covariables conocidas en el futuro: hasta 16 por serie, numericas o categoricas, lo que permite incorporar calendarios, promociones, festivos u otras senales planificadas.
- Manejo de valores faltantes mediante NaN.
- Contexto largo: hasta 32.768 pasos de historia.
- Horizontes extensibles: 512 pasos por pasada, con generacion bloque a bloque para horizontes mayores.
- Inferencia en CPU y GPU mediante PyTorch y el paquete `simons` (version 0.1.0 o superior).
- No dispone de capacidades de generacion de texto, codigo, vision, audio, tool calling ni razonamiento agentico; es un modelo puramente numerico de forecasting.

## Casos de uso

- Pronostico de demanda energetica: el modelo puede ingerir el historial de consumo (hasta 32.768 pasos) junto con covariables futuras como temperatura prevista o calendario laboral, y devolver cuantiles de demanda por hora. Los intervalos permiten dimensionar reservas de capacidad con niveles de confianza explicitos.
- Planificacion de inventario y cadena de suministro: con series multivariantes por producto y covariables de promociones planificadas, el modelo genera distribuciones de demanda que alimentan politicas de reposicion basadas en coste de ruptura frente a coste de almacenamiento.
- Prevision de ventas retail: el soporte de hasta 32 variables por serie permite modelar tiendas o categorias conjuntamente, capturando correlaciones entre productos mediante la capa de atencion entre variables.
- Monitorizacion industrial y mantenimiento predictivo: series de sensores (temperatura, vibracion, presion) con covariables de regimen de operacion planificado; los cuantiles altos sirven como umbrales de alerta temprana.
- Forecasting financiero de alta frecuencia: la ventana de contexto de 32.768 pasos permite incluir varios ciclos estacionales completos, y la salida probabilistica es util para gestion de riesgo y calculo de valor en riesgo.
- Prediccion meteorologica y de recursos renovables: integracion de covariables futuras conocidas (predicciones fisicas, calendario solar) para generar escenarios de produccion eolica o solar con incertidumbre cuantificada.
- Evaluacion comparativa de modelos en investigacion: al estar disponible el dataset de preentrenamiento y el codigo, sirve como linea base reproducible en estudios de forecasting probabilistico sobre GIFT-Eval, fev-bench o TIME.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Las metricas MASE y CRPS se expresan relativas a Seasonal Naive; en fev-bench se reportan como skill score porcentual.

| Benchmark | Metrica | Valor | Fuente |
|---|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,6731 | Leaderboard GIFT-Eval |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4574 | Leaderboard GIFT-Eval |
| fev-bench | SQL skill score (%) | 48,41 | Leaderboard fev-bench |
| fev-bench | MASE skill score (%) | 37,85 | Leaderboard fev-bench |
| TIME | MASE (relativo a Seasonal Naive) | 0,6371 | Leaderboard TIME |
| TIME | CRPS (relativo a Seasonal Naive) | 0,5341 | Leaderboard TIME |

El autor indica ademas que, en una sola GPU A100, Simons-297M pronostica un benchmark completo en minutos, aproximadamente diez veces mas rapido que modelos de tamano similar. No se proporcionan cifras absolutas de latencia o throughput mas alla de esta comparacion relativa.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,2 GB solo para pesos (297M parametros x 4 bytes), mas activaciones y memoria del contexto; el repo ocupa 1,2 GB.
- En fp16/bf16 los pesos ocupan aproximadamente 0,6 GB, lo que deja margen amplio para activaciones incluso en GPUs de gama media.
- Cabe en GPUs de consumo: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) deberia poder ejecutar inferencia, aunque el rendimiento dependera de la longitud del contexto y del tamano del lote.
- GPU recomendadas para produccion: A100 o H100 segun la referencia de eficiencia del autor; tambien es viable en L4, L40S o RTX 4090 para cargas moderadas.
- Despliegue: el paquete oficial `simons` sobre PyTorch, con soporte de CPU y GPU. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, lo cual es esperable al no ser un modelo de lenguaje.
- Latencia y throughput: no se publican cifras absolutas; solo la comparacion relativa de aproximadamente 10x mas rapido que modelos de tamano similar en una A100 para un benchmark completo.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de parametros, contexto ni licencia de los modelos comparables. La model card menciona que Simons-297M se situa frente a "cuatro modelos ampliamente utilizados" en los leaderboards, pero no los nombra ni detalla sus especificaciones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Simons-297M | 297,2M | 32.768 pasos | OpenMDW-1.1 | Pesos abiertos en HF |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

Para contextualizar el rendimiento relativo, se puede consultar directamente la posicion en los leaderboards de GIFT-Eval, fev-bench y TIME enlazados en la seccion de enlaces.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (campo `verified: false` en el model-index).
- No se detalla la composicion del dataset de entrenamiento mas alla de su disponibilidad publica; pueden existir sesgos derivados de la distribucion de dominios y frecuencias presentes en los datos.
- Riesgo de alucinacion en sentido estadistico: el modelo puede producir pronosticos poco fiables ante regimenes no vistos, cambios estructurales o series con muy pocos datos historicos.
- El limite de 32 variables y 16 covariables por serie restringe su uso en problemas de muy alta dimensionalidad.
- Las covariables solo pasadas se descartan, lo que puede suponer perdida de informacion si el usuario las incluye esperando que se utilicen.
- No es un modelo linguistico: no procesa texto, codigo ni imagenes, y no soporta tool calling ni agentes.
- La licencia OpenMDW-1.1 debe revisarse con atencion antes de un uso comercial; la informacion disponible no detalla sus terminos concretos mas alla del identificador.
- No se publican cifras absolutas de latencia ni requisitos minimos de hardware; las estimaciones de VRAM de esta ficha son calculos a partir del numero de parametros.
- El paquete de inferencia (`simons`) requiere version 0.1.0 o superior y se instala desde el repositorio de GitHub, no desde PyPI segun la informacion disponible; esto implica dependencia del codigo del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-297M
- Repositorio GitHub (codigo de inferencia y entrenamiento): https://github.com/Abel-ai-lab/Simons
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Coleccion Simons 1 (cuatro tamanos y datos): https://huggingface.co/collections/abel-lab/simons-1-6ae3d4ce9705938e293c52dd
- Demo interactiva (Simons Forecast Explorer): https://huggingface.co/spaces/abel-lab/simons-forecast-explorer
- Guia de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Documentacion del modelo: https://github.com/Abel-ai-lab/Simons/blob/main/docs/MODEL.md
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
