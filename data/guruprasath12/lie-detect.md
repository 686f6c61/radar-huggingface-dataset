# Guruprasath12/lie-detect

## Resumen

`lie-detect` (publicado como "Earnings miss predictor") es un modelo de clasificación tabular desarrollado por Guruprasath12 que predice la probabilidad de que una empresa estadounidense incumpla la estimación de EPS consensuada en su próxima presentación de resultados trimestrales, con unos 90 días de antelación. No es un modelo de lenguaje: se trata de una regresión logística con 32 características de entrada y una única salida (un logit), envuelta como módulo de PyTorch mediante `pytorch_model_hub_mixin` para poder cargarla desde HuggingFace Hub.

El modelo combina cuatro familias de señales: el historial de sorpresas en resultados de la propia empresa (últimos 4 anuncios), el sector GICS (10 sectores), la actividad de analistas en los 90 días previos (cambios de rating y de precio objetivo) y el tono de la guía de resultados extraída del último press release mediante reglas de expresiones regulares. Fue concebido como proyecto de aprendizaje y el repositorio de GitHub asociado documenta el pipeline completo, incluidas las ideas que no funcionaron.

Su relevancia es más metodológica que práctica: publica una evaluación honesta con validación temporal (rolling-origin) que muestra que la mayor parte de la habilidad procede del historial de sorpresas y del sector, y que las señales de texto y analistas aportan una mejora marginal (+0,020 AUC en empresas no vistas durante el entrenamiento) que no se sostiene en el periodo más reciente (2025-26).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística (32 características → 1 logit) envuelta en un módulo PyTorch |
| Parametros totales | 97 |
| Parametros activos | no disponible (no es MoE; el modelo es denso y minúsculo) |
| Longitud de contexto | no aplicable (modelo tabular, no procesa secuencias) |
| Tipos de cuantizacion | no aplicable (no requiere cuantización; el modelo ocupa bytes) |
| Idiomas soportados | no disponibles (procesa texto de press releases en inglés mediante reglas regex) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una regresión logística binaria estándar: 32 características estandarizadas (las estadísticas de normalización del conjunto de entrenamiento se guardan como buffers del módulo) que se combinan linealmente en un único logit. No hay capas ocultas, ni atención, ni componentes de deep learning más allá del envoltorio en PyTorch. El texto del press release no se procesa con un modelo de lenguaje, sino con reglas deterministas (`guidance_rules.guidance_vector`): se localizan frases que mencionan guidance/outlook/forecast, se descarta el boilerplate y se extrae el verbo direccional más cercano al sustantivo, generando 10 características. Según el autor, esta extracción tiene una precisión de aproximadamente el 85 % en comprobaciones manuales.

Los datos de entrenamiento constan de 6.916 pares (press release, siguiente anuncio) de 188 empresas del S&P 500 entre 2017 y 2026, con una tasa base de incumplimientos del 16,8 %. El texto procede de los 8-K Item 2.02 Exhibit 99.1 de SEC EDGAR; las etiquetas, las acciones de analistas y los precios, de Yahoo Finance. Un detalle metodológico importante: cada press release se empareja con el anuncio *siguiente* (83-98 días después), nunca con el propio, para evitar fugas de información. Se entrenó con pesos de clase balanceados y C = 10,0 seleccionado sobre validación del año 2024 (entrenamiento con años anteriores); los pesos publicados se reajustan sobre todos los años con ese C.

## Capacidades

- Clasificación binaria tabular: probabilidad de incumplir la estimación de EPS en el próximo anuncio trimestral, con horizonte de unos 90 días.
- Ingeniería de características de historial: 5 variables derivadas de los 4 anuncios anteriores (miss previo, sorpresa previa, tasa de misses en 4 trimestres, media y desviación de sorpresas).
- Codificación de sector GICS one-hot (10 sectores; Real Estate no está soportado).
- Características de analistas y precio: cambios de rating, variaciones de precio objetivo, retorno relativo frente a SPY a 1 y 3 meses y volatilidad a 3 meses, con ventanas que cierran 2 días antes del anuncio para evitar fugas.
- Análisis de guía de resultados mediante reglas regex sobre el texto del press release (dirección de la guía: raised, cut, maintained, narrowed, introduced, withdrawn, y grado de condicionalidad).
- API flexible: `model.predict()` con descarga automática de datos de Yahoo Finance a partir del ticker, o `market_inputs` para suministrar datos propios; también `predict_proba(X)` con matriz de características cruda.
- No soporta: generación de texto, razonamiento general, código, visión, audio, tool calling ni agentes; no es un LLM.

## Casos de uso

- Filtrado previo en investigación de renta variable: un analista puede procesar la cartera de cobertura del S&P 500 antes de la temporada de resultados y priorizar la revisión manual del 10 % de empresas con mayor probabilidad de miss, que según la evaluación concentran misses a 2,2 veces la tasa base.
- Gestión de riesgo de eventos: un gestor puede reducir exposición o comprar protección (opciones) sobre posiciones en empresas con probabilidad de miss elevada antes del anuncio, dado el horizonte de ~90 días.
- Backtesting y educación cuantitativa: el código y la documentación del repo de GitHub, incluidas las ideas fallidas, son material de estudio sobre validación temporal, fuga de datos y evaluación honesta de señales financieras.
- Investigación académica sobre señales de resultados: las características de historial, analistas y guía están documentadas con definiciones exactas, lo que permite replicarlas o compararlas contra otras señales.
- Base para ensembles: dado que el modelo es trivial de ejecutar, puede integrarse como una feature más en sistemas de scoring más amplios que combinen LLMs, datos alternativos y señales técnicas.
- Monitorización automatizada de guidance: el módulo `guidance_rules` puede usarse de forma independiente para clasificar la dirección de la guía en press releases de 8-K a escala, sin necesidad del modelo completo.

## Benchmarks y rendimiento

Evaluación rolling-origin (cada año predicho por un modelo entrenado solo con años anteriores; 2.816 anuncios, 469 misses; tasa base 16,7 %):

| Modelo | AUC agrupado | ΔAUC vs history [IC 95 %] | Precisión en el top 10 % |
|---|---|---|---|
| history only | 0,655 | — | 34 % |
| history + sector | 0,670 | +0,015 [-0,002, +0,033] | 36 % |
| **este modelo** | **0,680** | +0,025 [+0,004, +0,047] | 36 % |

Resultados por año de test:

| Año de test | Anuncios / misses | history + sector | este modelo | Δ |
|---|---|---|---|---|
| 2023 | 726 / 138 | 0,670 | 0,704 | +0,034 |
| 2024 | 727 / 135 | 0,658 | 0,679 | +0,021 |
| 2025-26 | 1.363 / 196 | 0,673 | 0,671 | -0,002 |

En empresas excluidas del entrenamiento (validación cruzada 5-fold por empresa): AUC 0,688, +0,020 [+0,010, +0,030] sobre history + sector. No hay benchmarks tipo MMLU, HumanEval o GSM8K por no ser aplicables a un modelo tabular.

## Requisitos de hardware

- VRAM estimada: despreciable; con 97 parámetros el modelo cabe en cualquier CPU moderna y no requiere GPU para inferencia.
- GPU recomendadas: ninguna; no es necesario hardware acelerado.
- Consumer GPU: no aplicable, el modelo corre en CPU sin problema (un portátil básico es más que suficiente).
- Despliegue: PyTorch con `HubMissModel.from_pretrained("Guruprasath12/lie-detect")`; requiere `torch`, `huggingface_hub`, `numpy`, `pandas` y `yfinance`, además de descargar `miss_model.py`, `guidance_rules.py` y `market_features.py` del repo. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no aplican a modelos tabulares).
- Latencia: dominada por la descarga de datos de Yahoo Finance (llamadas de red), no por el cómputo del modelo, que es instantáneo.

## Comparativa con modelos similares

| Aspecto | lie-detect | LLM general (p. ej. GPT-4 class) sobre el mismo texto | Modelo tabular gradient boosting (XGBoost/LightGBM) |
|---|---|---|---|
| Tipo | Regresión logística, 97 parámetros | LLM generativo | Ensemble de árboles |
| Entrada | 32 features numéricas + texto vía regex | Texto completo del press release | Features tabulares arbitrarias |
| Aporte del texto | +0,020 AUC (empresas no vistas); el autor indica que un LLM leyendo las mismas frases no hizo mejor | no disponible | no disponible |
| Licencia | MIT | varía | varía |
| Coste de inferencia | despreciable (CPU) | alto (GPU, tokens) | bajo (CPU) |
| Interpretabilidad | total (coeficientes lineales) | baja | media |

No hay modelos comparables publicados en HuggingFace con métricas directamente comparables sobre la misma tarea; la referencia más útil es la propia ablación interna del autor (history only vs. modelo completo).

## Limitaciones y advertencias

- Habilidad modesta: AUC ≈ 0,68 ordena los misses mejor que el azar, pero no de forma fiable; el top 10 % de riesgo solo encuentra misses a 2,2× la tasa base.
- El periodo de test más reciente (2025-26) no muestra ganancia sobre history + sector (Δ -0,002); con solo tres años de test no se puede distinguir un cambio de régimen de mercado del ruido estadístico.
- Dependencia de Yahoo Finance en tiempo de inferencia: se asume que el historial de acciones de analistas está completo y sin revisiones retroactivas, algo no garantizado.
- El sector Real Estate no está soportado en la codificación one-hot.
- La extracción de guidance por regex tiene ~85 % de precisión en comprobaciones manuales; errores en esta etapa propagan ruido a las features.
- El autor lo califica explícitamente de proyecto de aprendizaje: no debe usarse como base para decisiones de inversión reales sin validación independiente.
- Sesgos: el entrenamiento cubre solo 188 empresas del S&P 500 (2017-2026), por lo que la generalización a small caps, mercados no estadounidenses u otros regímenes de mercado es desconocida.
- Licencia MIT: sin restricciones para uso comercial, pero la calidad de los datos de terceros (Yahoo Finance, SEC EDGAR) puede tener sus propias condiciones de uso.
- Riesgo de alucinación: no aplicable al no ser un modelo generativo; el riesgo equivalente es la fuga de datos, que el autor mitiga emparejando cada release con el anuncio siguiente y cerrando las ventanas de mercado 2 días antes del anuncio.

## Enlaces

- HuggingFace: https://huggingface.co/Guruprasath12/lie-detect
- Repositorio GitHub con el pipeline completo y la documentación: https://github.com/guru-prasath-j/earnings-lie-detector
- Paper, demo y blog: no disponibles
