# abel-lab/Simons-178M

## Resumen

Simons-178M es un modelo fundacional de series temporales desarrollado por Abel AI Lab, disenado especificamente para forecasting probabilistico. Con 177,7 millones de parametros, se posiciona como una alternativa de peso medio dentro de la familia Simons 1, que incluye cuatro tamanos. El modelo aborda la prediccion de series temporales univariantes y multivariantes, con soporte para covariates conocidas en el futuro (numericas o categoricas), lo que lo hace adecuado para escenarios donde se dispone de informacion exogena planificada.

Arquitectonicamente, Simons-178M emplea un transformer causal que opera sobre parches de 32 pasos temporales, seguido de una capa de atencion entre las variates de una serie. Dispone de 12 capas, anchura 1024 y 16 cabezas de atencion. La longitud de contexto alcanza hasta 32.768 pasos temporales de historial, con un horizonte de 512 pasos por pasada forward y la posibilidad de extender horizontes mayores bloque a bloque.

Su relevancia actual radica en que combina contexto largo, soporte de covariates y salida probabilistica (9 cuantiles) en un unico modelo open weight, con un rendimiento competitivo en los leaderboards publicos de referencia (GIFT-Eval, fev-bench y TIME) y una eficiencia de inferencia notable: segun el autor, aproximadamente diez veces mas rapido que modelos de tamano similar en una A100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + capa de atencion entre variates; 12 capas, anchura 1024, 16 cabezas |
| Parametros totales | 177.746.208 (177,7M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 32.768 pasos temporales de historial; 512 pasos por pasada forward |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en un transformer causal que tokeniza la serie temporal en parches de 32 pasos. Sobre esa representacion opera una capa de atencion adicional entre las distintas variates de una misma serie, lo que permite modelar dependencias multivariantes. El modelo acepta hasta 32 variates y hasta 16 covariates conocidas en el futuro por serie, tanto numericas como categoricas; los valores faltantes se marcan con NaN y las covariates solo pasadas se aceptan pero se descartan. La salida son 9 cuantiles (0,1 a 0,9), lo que habilita forecasting probabilistico directamente.

El entrenamiento consta de cuatro etapas, desde un preentrenamiento sintetico hasta un post-entrenamiento sobre datos reales. Los pesos publicados son la media uniforme de dos continuaciones del entrenamiento (Model soups). El conjunto de datos de preentrenamiento, en su parte publica, esta disponible como abel-lab/Simons-Pretrain. El autor no detalla en la informacion proporcionada el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables de forma estandar en este dominio).

## Capacidades

- Forecasting probabilistico: genera 9 cuantiles (0,1 a 0,9) por paso temporal, lo que permite construir intervalos de prediccion.
- Series univariantes y multivariantes: soporta hasta 32 variates por serie.
- Covariates conocidas en el futuro: hasta 16 por serie, numericas o categoricas, con posibilidad de incluir covariates solo pasadas (que se descartan).
- Manejo de valores faltantes mediante marcado con NaN.
- Contexto largo: hasta 32.768 pasos de historial.
- Horizontes extensibles: 512 pasos por pasada forward, con extension bloque a bloque para horizontes mayores.
- Inferencia en CPU y GPU mediante el paquete `simons` (version 0.1.0 o superior) sobre PyTorch.
- No soporta generacion de texto, codigo, vision, audio ni tool calling; es un modelo especializado exclusivamente en series temporales.

## Casos de uso

- Prediccion de demanda energetica: con hasta 32.768 pasos de historial y covariates como calendario o temperatura prevista, el modelo puede generar curvas de demanda con intervalos de confianza para planificacion de red.
- Gestion de inventario y cadena de suministro: forecasting probabilistico de ventas por producto, incorporando covariates categoricas (promociones, festivos) conocidas de antemano para anticipar picos y ajustar stocks.
- Prediccion de trafico y movilidad: series multivariantes (sensores de distintas vias) con contexto largo permiten capturar estacionalidades semanales y anuales, y las covariates futuras (eventos planificados) mejoran la precision.
- Monitorizacion de infraestructura: deteccion temprana de anomalias mediante la comparacion de valores observados con los intervalos cuantilicos predichos, gracias al manejo nativo de NaN para datos faltantes.
- Planificacion financiera y presupuestaria: prediccion de ingresos o gastos con bandas de incertidumbre, util para escenarios de stress testing donde se necesitan distribuciones, no solo puntos.
- Investigacion en series temporales: al ser open weight y con codigo de entrenamiento e inferencia disponible, sirve como base para fine-tuning en dominios especificos y como referencia en comparativas academicas sobre GIFT-Eval, fev-bench y TIME.
- Demos interactivas: el Simons Forecast Explorer permite visualizar predicciones de los cuatro tamanos de la familia directamente en el navegador, util para validacion rapida antes de integrar el modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,6754 |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4609 |
| fev-bench | SQL skill score (%, relativo a Seasonal Naive) | 48,57 |
| fev-bench | MASE skill score (%, relativo a Seasonal Naive) | 37,43 |
| TIME | MASE (relativo a Seasonal Naive) | 0,6393 |
| TIME | CRPS (relativo a Seasonal Naive) | 0,5347 |

El autor indica que en los tres leaderboards las posiciones se refieren a entradas open weight. En cuanto a eficiencia, afirma que Simons-297M (el tamano superior de la familia) predice un benchmark completo en minutos en una A100, aproximadamente diez veces mas rapido que modelos de tamano similar. No se proporcionan cifras de latencia o throughput especificas para el modelo de 178M.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 177,7M parametros en precision completa (fp32) los pesos ocupan aproximadamente 0,7 GB, por lo que la huella es modesta y el cuello de botella sera la longitud de contexto y el tamano del batch.
- GPU recomendadas: el autor menciona la A100 para benchmarks de eficiencia; cualquier GPU con suficiente memoria para el contexto y batch deseados es valida.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas como RTX 3090, RTX 4090 o superiores, dado el reducido tamano del modelo (no confirmado por el autor para configuraciones concretas).
- Opciones de despliegue: paquete `simons` (version 0.1.0 o superior) sobre PyTorch, con soporte de CPU y GPU. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables de forma estandar a este tipo de modelo).
- Latencia y throughput: no se publican cifras concretas para el 178M; la referencia cualitativa del autor es que la familia es aproximadamente diez veces mas rapida que modelos de tamano similar en una A100.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos especificos de parametros, contexto o licencia de modelos comparables (el autor menciona "cuatro modelos ampliamente usados" en las graficas de leaderboards, pero sin nombrarlos ni detallar sus especificaciones). Por tanto:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Simons-178M | 177,7M | 32.768 pasos | openmdw-1.1 | Hugging Face, open weight |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre datos reales en la fase de post-entrenamiento, puede heredar sesgos de las series utilizadas.
- Riesgo de alucinacion: en el contexto de series temporales, se traduce en predicciones confiadas pero incorrectas; los intervalos cuantilicos deben validarse en el dominio de aplicacion antes de usarlos en produccion.
- Limitaciones de contexto: el historial maximo es de 32.768 pasos y el horizonte por pasada forward es de 512 pasos; horizontes mayores requieren extension bloque a bloque, lo que puede acumular error.
- Limite de variates y covariates: maximo 32 variates y 16 covariates conocidas en el futuro por serie.
- Idiomas: no aplica; el modelo no procesa texto.
- Licencia: openmdw-1.1; conviene revisar los terminos exactos para uso comercial, ya que la informacion proporcionada no detalla las restricciones concretas de esta licencia.
- Caveat de produccion: los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false` en la model-index); la eficiencia reportada se refiere al modelo de 297M, no al de 178M.
- Madurez: el paquete `simons` esta en version 0.1.0 o superior y el modelo se publico en octubre de 2026, por lo que el ecosistema y la documentacion pueden ser limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-178M
- Repositorio GitHub (codigo de inferencia y entrenamiento): https://github.com/Abel-ai-lab/Simons
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Coleccion Simons 1 (cuatro tamanos y datos): https://huggingface.co/collections/abel-lab/simons-1-6ae3d4ce9705938e293c52dd
- Demo Simons Forecast Explorer: https://huggingface.co/spaces/abel-lab/simons-forecast-explorer
- Guia de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Documentacion del modelo: https://github.com/Abel-ai-lab/Simons/blob/main/docs/MODEL.md
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
