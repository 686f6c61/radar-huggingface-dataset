# At1uri/topological-phase-transition-detector

## Resumen

Topological Phase Transition & Crash Detector es un motor de inferencia y extractor de características basado en análisis topológico de datos (TDA) desarrollado por At1uri dentro de su suite de IA cuantitativa institucional. No es un modelo de lenguaje ni una red neuronal entrenada con descenso de gradiente: es un pipeline determinista que combina el teorema de inmersión por retardos de Takens con homología persistente (H0 y H1) sobre el cuerpo F2 para detectar transiciones de fase en series temporales financieras.

El modelo reconstruye el atractor dinámico latente de una serie univariante (por ejemplo, retornos logarítmicos del S&P 500 o el índice VIX) mediante embedding de retardos, construye un complejo simplicial de Vietoris-Rips filtrado y calcula curvas de Betti y entropía topológica persistente. Su hipótesis central es que, antes de una crisis sistémica o un espiral de liquidez, las correlaciones entre activos convergen hacia la unidad y el atractor se comprime en una variedad degenerada de dimensión uno, lo que se manifiesta como una "condensación topológica": aniquilación de ciclos H1, caída abrupta de la entropía persistente y emergencia temprana de una única componente conexa H0.

El artefacto se publica con licencia Apache 2.0, pipeline declarado `tabular-classification`, idioma inglés y cero descargas en el momento de la consulta. Es relevante para investigadores de finanzas cuantitativas y riesgo sistémico que buscan señales de alerta temprana con geometría de alta dimensión frente a indicadores econométricos clásicos como GARCH(1,1) o el VIX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de TDA: embedding de Takens + complejo de Vietoris-Rips filtrado + homología persistente (H0, H1) sobre F2; no es una red neuronal |
| Parametros totales | no disponible (no aplica: motor algorítmico determinista, sin pesos entrenados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; la documentación menciona ventanas de 60 días de retornos como ejemplo de entrada |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el repositorio incluye `topological_detector.py` (Python puro) y ficheros JSON (`topological_signatures.json`, `benchmarks.json`) |

## Arquitectura y entrenamiento

La arquitectura no sigue el paradigma de transformers ni de modelos generativos. Se trata de un motor de extracción de características topológicas en dos etapas. Primero, aplica el teorema de inmersión por coordenadas de retardo de Takens (1981) para reconstruir la variedad dinámica oculta M como una nube de puntos X en R^d, con vectores v_t = (x_t, x_{t−τ}, ..., x_{t−(d−1)τ}), donde d ≥ 3 es la dimensión de embedding y τ el retardo elegido por información mutua. Segundo, construye un complejo simplicial de Vietoris-Rips VR(X, ε) sobre la matriz de distancias euclídeas y calcula la homología persistente mediante reducción de fronteras sobre F2, explotando la nilpotencia del operador frontera (∂_{k−1} ∘ ∂_k = 0).

Las características extraídas son el número de Betti β0 (componentes conexas) y β1 (ciclos no frontera), junto con la entropía topológica persistente E(Dgm) = −Σ p_i log2 p_i, calculada sobre las longitudes de los intervalos de persistencia del diagrama. No se documenta entrenamiento supervisado, ajuste por RLHF ni DPO: el modelo es determinista y sus parámetros son hiperparámetros geométricos (d, τ, umbral de filtración). La innovación técnica destacable es la "firma de condensación topológica" como indicador precursor de crisis, junto con la inclusión de barcodes de referencia precomputados para regímenes financieros históricos (2008, 2020).

## Capacidades

- Detección de transiciones de fase de mercado y cambios de régimen de volatilidad mediante homología persistente.
- Extracción de características topológicas (curvas de Betti, diagramas de persistencia, entropía persistente) para modelos downstream de clasificación tabular.
- Clasificación de régimen con salida de probabilidad topológica de crash y recuento de ciclos H1 activos.
- Reconstrucción de atractores en espacio de fase 3D y barridos de filtración interactivos mediante la aplicación web asociada.
- Evaluación sobre series univariantes de retornos o índices de volatilidad con ventanas de 60 días.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (solo inglés en la documentación).
- Capacidades especiales: modo de pensamiento, visión o audio no disponibles; la capacidad diferencial es el análisis topológico de series temporales.

## Casos de uso

- Alerta temprana de riesgo sistémico en mesas de trading: ingerir una ventana móvil de 60 días de retornos del S&P 500 y monitorizar la caída de β1 y de la entropía persistente como señal precursora con hasta 18 días de antelación según los benchmarks del autor.
- Complemento a modelos de volatilidad en gestión de carteras: usar la firma topológica como feature adicional en un pipeline tabular junto a GARCH(1,1) y VIX, aprovechando su AUC-ROC reportada de 0.942 frente a 0.812 del VIX.
- Investigación académica en finanzas cuantitativas: reproducir los barcodes de referencia de `topological_signatures.json` para validar la hipótesis de condensación topológica en episodios como Lehman 2008 o el shock COVID de 2020.
- Clasificación de regímenes para estrategias sistemáticas: alimentar un clasificador tabular con las curvas de Betti y la entropía persistente para conmutar entre estrategias de momentum y de cobertura según el régimen detectado.
- Análisis de liquidez en mercados de renta fija o divisas: aplicar el mismo pipeline a series univariantes de spreads o tipos de cambio para detectar compresión de la variedad previa a episodios de iliquidez.
- Docencia y divulgación de TDA: utilizar la aplicación web Topological Market Dynamics Studio para explorar atractores 3D y barridos de filtración con datos sintéticos generados por `generate_synthetic_series`.
- Auditoría de riesgo de modelos existentes: contrastar las señales de un motor de riesgo propietario con las alertas topológicas como validación independiente basada en geometría, no en momentos estadísticos.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, sobre 500 días de trading en torno a eventos de estrés sistémico:

| Modelo / indicador | Antelación de alerta | Tasa de falsos positivos | AUC-ROC | Sensibilidad de régimen |
|---|---|---|---|---|
| Topological Phase Detector (este modelo) | 18 días | 6.2% | 0.942 | Geométrica de alta dimensión |
| Implied Volatility (índice VIX) | 4 días | 14.8% | 0.812 | Sentimiento de mercado de opciones |
| GARCH(1,1) volatilidad condicional | 1 día (retrasado) | 18.1% | 0.745 | Shocks retrospectivos móviles |
| Exceso de curtosis empírica | 6 días | 22.4% | 0.690 | Momentos muestrales |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el motor es Python puro y no requiere GPU para funcionar, aunque el coste computacional de la reducción de fronteras crece con el número de puntos y la dimensión de embedding.
- GPU recomendadas: no disponibles; cualquier CPU moderna puede ejecutar el pipeline para ventanas de 60 puntos con d=3.
- Cabe en GPU consumer: sí, y también en CPU; no se documentan requisitos de memoria específicos.
- Opciones de despliegue: ejecución directa del módulo `topological_detector.py`, integración como librería Python en pipelines de datos y uso de la aplicación web alojada en Hugging Face Spaces.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo / referencia | Tipo | Antelación de alerta | AUC-ROC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Topological Phase Detector (At1uri) | TDA + homología persistente | 18 días | 0.942 | Apache 2.0 | Hugging Face |
| VIX (índice de volatilidad implícita) | Indicador de mercado | 4 días | 0.812 | No aplica (índice) | Datos de mercado |
| GARCH(1,1) | Modelo econométrico | 1 día (retrasado) | 0.745 | No aplica (metodología) | Implementaciones múltiples |
| Exceso de curtosis empírica | Estadístico muestral | 6 días | 0.690 | No aplica | Cálculo directo |

No se dispone de comparación con otros modelos de TDA publicados en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente de la model card del autor y no han sido validados de forma independiente; deben tratarse como resultados preliminares.
- El artefacto tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El pipeline está diseñado para series univariantes; la extensión a carteras multivariantes no está documentada.
- La elección de la dimensión de embedding d y del retardo τ condiciona fuertemente los resultados; no se documenta un procedimiento automático de selección más allá de la información mutua para τ.
- Riesgo de sobreajuste a los episodios históricos de referencia (2008, 2020) incluidos en `topological_signatures.json`.
- La documentación está únicamente en inglés y no se especifican limitaciones de sesgo ni de idioma más allá de ese hecho.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción con capital real requiere validación propia.
- El coste computacional de la homología persistente puede crecer de forma no lineal con el tamaño de la ventana, lo que limita su uso en tiempo real de alta frecuencia sin optimizaciones.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural ni soporta tool calling, por lo que no debe confundirse con un LLM pese a su publicación en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/topological-phase-transition-detector
- Perfil del autor: https://huggingface.co/At1uri
- Aplicación web Topological Market Dynamics Studio: https://huggingface.co/spaces/At1uri/topological-data-analysis-market-dynamics-studio
