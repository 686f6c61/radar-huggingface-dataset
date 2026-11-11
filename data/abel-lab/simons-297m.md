# abel-lab/Simons-297M

## Resumen

Simons-297M es un modelo fundacional de series temporales desarrollado por Abel AI Lab, especializado en pronóstico probabilístico. Se trata de un transformer causal que opera sobre parches de 32 pasos temporales y que incorpora una capa de atención entre las variables de una serie, lo que le permite manejar tanto series univariantes como multivariantes con covariables conocidas a futuro (hasta 16 por serie). Con 297,2 millones de parámetros, 13 capas, anchura 1280 y 20 cabezas de atención, el modelo se sitúa en la gama media de la familia Simons, que incluye cuatro tamanos.

El modelo resuelve el problema del pronóstico probabilístico multi-horizonte: dado un historial de hasta 32.768 pasos temporales, genera 9 cuantiles (0,1 a 0,9) para horizontes de 512 pasos por pasada, con la posibilidad de encadenar bloques para horizontes mas largos. Acepta entradas numéricas o categóricas y utiliza NaN para marcar valores ausentes, lo que simplifica el preprocesado de series reales con huecos.

Su relevancia actual radica en que es un modelo abierto (licencia OpenMDW-1.1) con pesos publicos, código de inferencia y entrenamiento en GitHub, y datos de preentrenamiento liberados parcialmente. Además, según el autor, es aproximadamente diez veces mas rápido que modelos de tamano similar en una A100, lo que lo hace atractivo para despliegues de pronóstico a escala sobre grandes conjuntos de series.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + capa de atención entre variables; 13 capas, anchura 1280, 20 cabezas |
| Parametros totales | 297.230.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 pasos temporales de historial; 512 pasos por pasada (horizontes mayores por bloques) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales, no de lenguaje) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (libreria `simons`, PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal que tokeniza la serie en parches de 32 pasos temporales y aplica después una capa de atención transversal entre las variables de una misma serie. Esta combinación permite modelar dependencias temporales largas y, al mismo tiempo, correlaciones entre series multivariantes. El modelo admite hasta 32 variables por serie y hasta 16 covariables conocidas a futuro, numéricas o categóricas; las covariables solo pasadas se aceptan pero se descartan. La salida son 9 cuantiles, lo que proporciona una distribución predictiva completa en lugar de una estimación puntual.

El entrenamiento consta de cuatro etapas, desde un preentrenamiento sintético (con generadores abiertos incluidos en el repositorio) hasta un post-entrenamiento sobre datos reales. Los pesos liberados son la media con pesos iguales del modelo de la etapa 3 y su continuación, una técnica de fusión de pesos conocida como WiSE-FT. El conjunto de datos público de preentrenamiento está disponible en `abel-lab/Simons-Pretrain`, aunque la model card solo detalla la parte sintética y no especifica el volumen total de tokens ni la composición completa del corpus real.

## Capacidades

- Pronóstico probabilístico: genera 9 cuantiles (0,1 a 0,9) por paso temporal, lo que permite construir intervalos de predicción y distribuciones completas.
- Series univariantes y multivariantes: acepta entradas de forma `[batch, time]` o `[batch, variates, time]`, con hasta 32 variables por serie.
- Covariables conocidas a futuro: hasta 16 por serie, numéricas o categóricas, útiles para incorporar calendarios, promociones o variables exógenas planificadas.
- Manejo de valores ausentes: NaN marca huecos en la serie y en las covariables.
- Horizontes largos: 512 pasos por pasada con encadenamiento por bloques para horizontes mayores.
- Contexto extenso: hasta 32.768 pasos de historial, adecuado para series con estacionalidades anuales o patrones de largo plazo.
- Inferencia en CPU y GPU mediante PyTorch y el paquete `simons` (version 0.1.0 o superior).
- No soporta tool calling, agentes ni capacidades multimodales: es un modelo puramente de series temporales.

## Casos de uso

- Pronóstico de demanda energética: con hasta 32.768 pasos de historial y covariables de calendario (día de la semana, festivos, temperatura prevista), el modelo puede generar curvas de carga horaria con intervalos de confianza para planificación de red.
- Previsión de ventas minoristas: series multivariantes por tienda y producto, con covariables de promociones planificadas y precios futuros conocidos; los 9 cuantiles permiten dimensionar inventario según el apetito de riesgo.
- Gestión de inventario y cadena de suministro: horizontes de varios cientos de pasos con reencadenamiento por bloques para planificación semanal o mensual, incorporando covariables de pedidos confirmados.
- Monitorización de infraestructuras y capacidad: pronóstico de métricas de CPU, memoria o tráfico de red con bandas de cuantiles para disparar alertas cuando la predicción supera umbrales con cierta probabilidad.
- Predicción financiera de alta frecuencia: series multivariantes con contexto largo para capturar regímenes y estacionalidades, generando distribuciones predictivas en lugar de puntos únicos.
- Investigación en series temporales: al ser un modelo fundacional abierto con código de entrenamiento y datos sintéticos publicados, sirve como base para fine-tuning en dominios específicos (sensores industriales, meteorología, sanidad) y para reproducir experimentos.
- Exploración interactiva de pronósticos: el espacio `simons-forecast-explorer` permite comparar las cuatro tallas de la familia en el navegador sin infraestructura propia, útil para evaluar el modelo antes de integrarlo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor | Fuente |
|---|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,6731 | Código de GIFT-Eval |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4574 | Código de GIFT-Eval |
| fev-bench | SQL skill score (%, relativo a Seasonal Naive) | 48,41 | Leaderboard fev-bench |
| fev-bench | MASE skill score (%, relativo a Seasonal Naive) | 37,85 | Leaderboard fev-bench |

El autor indica que los cuatro modelos Simons aparecen en el leaderboard oficial de TIME y que, en una A100, Simons-297M pronostica un benchmark completo en minutos, aproximadamente diez veces mas rápido que modelos de tamano similar. No se proporcionan cifras absolutas de latencia ni de throughput por serie.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 297,2 M de parámetros en precisión de 32 bits los pesos ocupan aproximadamente 1,2 GB, y en 16 bits unos 0,6 GB, a lo que hay que sumar memoria para activaciones y lotes.
- GPU recomendadas: el autor menciona una A100 como referencia de rendimiento; por tamano, una RTX 4090 o incluso GPU consumer con 8-12 GB de VRAM deberían ser suficientes para inferencia en precisiones reducidas, aunque no se confirma en la documentación.
- Cabe en GPU consumer: probablemente sí, dado el tamano del modelo, pero no hay confirmación oficial de requisitos mínimos.
- Opciones de despliegue: paquete `simons` sobre PyTorch en CPU o GPU; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje y no aplican directamente).
- Latencia y throughput: el autor afirma que es unas diez veces mas rápido que modelos de tamano similar en A100, sin cifras absolutas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Simons-297M | 297,2 M | 32.768 pasos | OpenMDW-1.1 | Pesos abiertos en Hugging Face, código en GitHub |
| Otras tallas de la familia Simons | No disponible en la informacion proporcionada | No disponible | OpenMDW-1.1 | Colección `simons-1` en Hugging Face |
| Modelos competidores en GIFT-Eval, fev-bench y TIME | No disponible | No disponible | No disponible | El autor menciona cuatro modelos ampliamente usados, sin nombrarlos ni dar sus cifras |

La model card indica que Simons-297M se posiciona frente a cuatro modelos ampliamente utilizados en los leaderboards de GIFT-Eval, fev-bench y TIME, pero no incluye la tabla comparativa con nombres y valores en la informacion disponible. No se dispone de datos suficientes para una comparativa cuantitativa detallada con alternativas concretas.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y figuran como no verificados (`verified: false`); conviene reproducirlos con el código oficial antes de tomar decisiones de producción.
- La model card no detalla la composición completa del corpus de entrenamiento real ni el volumen de tokens; solo se publica la parte sintética y el dataset `Simons-Pretrain`.
- No se especifican sesgos conocidos ni evaluación de robustez ante cambios de distribución, series anómalas o datos adversariales.
- El límite de 32 variables y 16 covariables por serie puede ser insuficiente para dominios con alta dimensionalidad; las covariables solo pasadas se descartan silenciosamente.
- La licencia OpenMDW-1.1 debe revisarse con detalle antes de uso comercial; no se confirma en la informacion disponible si impone restricciones adicionales a la redistribución o al uso en productos.
- El modelo no es un modelo de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni agentes; cualquier capa de interpretación debe construirse por encima.
- No hay datos publicados sobre cuantizacion, por lo que el despliegue en hardware con VRAM limitada requiere validación propia.
- La fecha de creación del repositorio (2026-10-29) y las referencias a snapshots de octubre de 2026 indican que el ecosistema de comparación puede cambiar rápidamente; los rankings citados son una foto fija.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-297M
- Repositorio GitHub (inferencia y entrenamiento): https://github.com/Abel-ai-lab/Simons
- Post de presentación: https://abel.ai/research/introducing-simons/
- Colección Simons 1 (cuatro tallas y datos): https://huggingface.co/collections/abel-lab/simons-1-6ae3d4ce9705938e293c52dd
- Simons Forecast Explorer (demo): https://huggingface.co/spaces/abel-lab/simons-forecast-explorer
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Documentación de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Documentación del modelo: https://github.com/Abel-ai-lab/Simons/blob/main/docs/MODEL.md
- Documentación de entrenamiento: https://github.com/Abel-ai-lab/Simons/blob/main/docs/TRAINING.md
- Documentación de datos: https://github.com/Abel-ai-lab/Simons/blob/main/docs/DATA.md
- Código de GIFT-Eval: https://github.com/SalesforceAIResearch/gift-eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
