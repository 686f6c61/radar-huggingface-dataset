# abel-lab/Simons-60M

## Resumen

Simons-60M es un modelo fundacional de series temporales desarrollado por Abel AI Lab, disenado especificamente para pronostico probabilistico. Con 60,3 millones de parametros, es la variante mas pequena de la familia Simons 1, que incluye cuatro tamanos. El modelo aborda la prediccion de series temporales univariantes y multivariantes, incluyendo el uso de covariables conocidas en el futuro, un escenario habitual en demanda energetica, ventas o planificacion de capacidad.

La arquitectura combina un transformer causal que opera sobre parches de 32 pasos temporales con una capa de atencion entre las variates de una serie. Soporta hasta 16.384 pasos de historial y genera 9 cuantiles (0,1 a 0,9) por paso, lo que permite construir intervalos de prediccion directamente. Su licencia OpenMDW-1.1 y su reducido tamano lo hacen especialmente atractivo para despliegues en CPU o GPU de consumo.

El modelo es relevante porque demuestra que un fundacional de series temporales de apenas 60M de parametros puede competir en leaderboards publicos como GIFT-Eval, fev-bench y TIME, donde sus resultados se declaran relativos a Seasonal Naive. Ademas, el codigo de inferencia y entrenamiento es abierto y los pesos se distribuyen en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + capa de atencion entre variates |
| Parametros totales | 60.319.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 16.384 pasos temporales de historial; 512 pasos por forward pass |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Simons-60M emplea un transformer causal que tokeniza la serie temporal en parches de 32 pasos. Tras procesar cada parche, una capa de atencion adicional modela las dependencias entre las distintas variates de una misma serie, lo que permite capturar correlaciones multivariantes. El modelo tiene 8 capas, anchura 704 y 11 cabezas de atencion. Acepta hasta 32 variates y hasta 16 covariables conocidas en el futuro por serie, tanto numericas como categoricas; los valores ausentes se marcan con NaN y las covariables solo pasadas se aceptan pero se descartan.

El entrenamiento se estructura en cuatro etapas: un preentrenamiento sintetico seguido de post-entrenamiento sobre datos reales. Los pesos publicados son la media uniforme de las dos continuaciones finales (model soup), una tecnica de promediado de pesos que suele mejorar la robustez. El dataset de preentrenamiento publico es `abel-lab/Simons-Pretrain`. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Pronostico probabilistico de series temporales univariantes y multivariantes.
- Salida de 9 cuantiles (0,1, 0,2, ..., 0,9) por paso temporal, lo que permite construir intervalos de prediccion.
- Soporte de covariables conocidas en el futuro (numericas y categoricas), hasta 16 por serie.
- Manejo de valores ausentes mediante NaN.
- Pronostico con horizontes largos mediante bloqueo por bloques de 512 pasos.
- Hasta 32 variates por serie.
- Historial de hasta 16.384 pasos temporales.
- Inferencia en CPU y GPU mediante PyTorch y el paquete `simons`.

## Casos de uso

- Pronostico de demanda energetica: el modelo puede usar covariables conocidas en el futuro (temperatura prevista, dias festivos, calendario) para generar intervalos de demanda horaria con horizonte de varios dias, gracias a su ventana de 16.384 pasos y a la salida cuantilica.
- Planificacion de ventas y reposicion de inventario: con series multivariantes de productos y covariables como promociones o precios futuros, se obtienen cuantiles de demanda que alimentan politicas de stock con niveles de servicio definidos.
- Prediccion de trafico y movilidad: series multivariantes de aforos por carretera o estacion, con covariables de calendario y meteorologia conocidas, permiten generar intervalos de ocupacion para gestion de capacidad.
- Monitorizacion de infraestructuras: pronostico de metricas de servidores o sensores industriales con valores ausentes marcados como NaN, util para deteccion temprana de anomalias a partir de la desviacion respecto al intervalo previsto.
- Planificacion financiera y de tesoreria: proyeccion de flujos de caja o volumenes de transacciones con horizontes de varios pasos y bandas de incertidumbre para escenarios de riesgo.
- Investigacion en series temporales: al ser un modelo pequeno con codigo y datos de preentrenamiento abiertos, sirve como base para experimentos de fine-tuning, ablaciones de covariables y comparaciones en GIFT-Eval, fev-bench y TIME.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Benchmark | Metrica | Valor | Referencia |
|---|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,6812 | Leaderboard GIFT-Eval |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4654 | Leaderboard GIFT-Eval |
| fev-bench | SQL skill score (%, relativo a Seasonal Naive) | 47,59 | Leaderboard fev-bench |
| fev-bench | MASE skill score (%, relativo a Seasonal Naive) | 36,26 | Leaderboard fev-bench |
| TIME | MASE (relativo a Seasonal Naive) | 0,6427 | Leaderboard TIME |
| TIME | CRPS (relativo a Seasonal Naive) | 0,5394 | Leaderboard TIME |

El autor indica que Simons-297M es unas diez veces mas rapido que modelos de tamano similar al pronosticar un benchmark completo en una A100. No se proporcionan cifras de latencia o throughput especificas para Simons-60M.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 60,3M de parametros; en fp32 ocupa aproximadamente 0,24 GB de pesos, por lo que cabe holgadamente en cualquier GPU de consumo y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; A100 o H100 solo son necesarias para procesar benchmarks completos o lotes grandes.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: PyTorch (CPU o GPU) mediante el paquete `simons` (version 0.1.0 o superior). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles para Simons-60M; el autor solo reporta que Simons-297M es aproximadamente diez veces mas rapido que modelos de tamano similar en una A100.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de parametros, contexto o licencia de modelos comparables de series temporales (por ejemplo, otros fundacionales de pronostico). La model card menciona que Simons-297M se compara con "cuatro modelos ampliamente usados" en los leaderboards, pero no se detallan sus nombres ni especificaciones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Simons-60M | 60,3M | 16.384 pasos | OpenMDW-1.1 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false` en la model card).
- No se especifican sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar posibles sesgos en dominios concretos.
- Riesgo de alucinacion: como modelo probabilistico, puede producir intervalos mal calibrados en series fuera de la distribucion de entrenamiento; conviene validar la calibracion en el dominio de uso.
- Limitaciones de contexto: aunque acepta hasta 16.384 pasos de historial, cada forward pass procesa 512 pasos; horizontes largos requieren pronostico por bloques, lo que puede acumular error.
- No es un modelo linguistico: no procesa texto ni idiomas; la ausencia de "idiomas soportados" refleja su naturaleza numerica.
- Restricciones de licencia: la licencia OpenMDW-1.1 debe revisarse antes de uso comercial; no se detallan en la informacion disponible las condiciones exactas.
- Requiere el paquete `simons` (version 0.1.0 o superior) instalado desde el repositorio de GitHub, no desde PyPI segun las instrucciones mostradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-60M
- Repositorio GitHub: https://github.com/Abel-ai-lab/Simons
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Coleccion Simons 1: https://huggingface.co/collections/abel-lab/simons-1-6ae3d4ce9705938e293c52dd
- Demo Simons Forecast Explorer: https://huggingface.co/spaces/abel-lab/simons-forecast-explorer
- Guia de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Documentacion del modelo: https://github.com/Abel-ai-lab/Simons/blob/main/docs/MODEL.md
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
