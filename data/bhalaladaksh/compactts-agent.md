# BhalalaDaksh/CompactTS-Agent

## Resumen

CompactTS-Agent es un sistema de predicción de series temporales desarrollado por Daksh Bhalala que se presenta como un "agente autónomo de meta-predicción". A diferencia de los enfoques habituales basados en una única red neuronal estática, el sistema orquesta dinámicamente representaciones de modelos fundacionales especializados en función de las características estadísticas y espectrales de cada serie de entrada. Está orientado a dominios industriales diversos: redes energéticas, telemetría de servidores, flujo de tráfico, observaciones de naturaleza y salud.

El sistema se compone de tres módulos principales: un perfilador de series invariante a escala que extrae firmas estructurales (entropía espectral de Fourier, deriva media normalizada y agrupamiento de volatilidad ARCH), una política de meta-enrutamiento que asigna regímenes físicos a representaciones de modelos especializados, y una fusión calibrada de cuantiles que impone monotonicidad estricta entre los cuantiles 0.1 a 0.9 y proyecciones de soporte físico.

Es relevante ahora porque propone un paradigma "agentic" para la predicción de series temporales, un campo donde los modelos fundacionales monolíticos suelen tener dificultades para generalizar entre dominios heterogéneos. La licencia BSL 1.1 restringe el uso comercial sin acuerdo separado, lo que condiciona su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema de orquestación agéntica con perfilador de series, política de meta-enrutamiento y fusión de cuantiles calibrada |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre ventanas de series temporales; el ejemplo usa 100 puntos de entrada y horizonte de 24) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | BSL 1.1 (Business Source License) |
| Formato de pesos | no disponible (paquete Python instalable vía pip; framework PyTorch) |

## Arquitectura y entrenamiento

El sistema no es un transformer monolítico, sino un pipeline de orquestación. El primer componente, el perfilador de series invariante a escala, calcula tres firmas estructurales: entropía espectral de Fourier (H_s), deriva media normalizada (Δ_μ) y coeficiente de agrupamiento de volatilidad ARCH (R²_ARCH). A partir de estas métricas, la política de meta-enrutamiento asigna de forma determinista el régimen físico de la serie a una representación de modelo fundacional especializada (armónicos concentrados, telemetría de baja deriva o agrupamiento de volatilidad).

El tercer componente, la fusión calibrada de cuantiles, garantiza la monotonicidad estricta entre los nueve niveles de cuantil (0.1 a 0.9) y aplica proyecciones de soporte físico a las predicciones. El sistema está implementado en PyTorch y se distribuye como paquete Python instalable. Los datos de entrenamiento, el número de tokens o ejemplos, la composición del dataset y si hubo RLHF/DPO no están disponibles en la información proporcionada. El modelo se evalúa sobre el dataset Salesforce/GiftEval.

## Capacidades

- Predicción probabilística de series temporales con nueve niveles de cuantil (0.1 a 0.9) y horizonte configurable.
- Perfilado automático de series mediante firmas estadísticas y espectrales (entropía de Fourier, deriva media, volatilidad ARCH).
- Meta-enrutamiento determinista entre regímenes físicos y representaciones de modelos especializados.
- Fusión calibrada de cuantiles con monotonicidad estricta y proyecciones de soporte físico.
- Procesamiento por lotes de múltiples series con fechas de inicio independientes (`forecast_batch`).
- Soporte de frecuencias horarias y otras frecuencias configurables mediante el parámetro `freq`.
- Evaluación bajo el protocolo GiftEval con `model_type: "agentic"`.
- Capacidades multilingües: no disponibles (solo inglés declarado en la model card).

## Casos de uso

- Predicción de demanda energética: el perfilador detecta series con armónicos concentrados (patrones diarios y estacionales) y el meta-enrutador las dirige al modelo especializado en ese régimen, generando cuantiles calibrados para planificación de capacidad.
- Telemetría de servidores: las series de baja deriva se enrutan a la representación adecuada, permitiendo previsiones de carga con intervalos de confianza que respetan el soporte físico (por ejemplo, valores no negativos).
- Predicción de flujo de tráfico: la combinación de deriva media y volatilidad ARCH permite identificar regímenes de congestión y generar bandas de cuantiles para sistemas de gestión de tráfico.
- Monitorización de salud: las series con agrupamiento de volatilidad se enrutan al modelo correspondiente, útil para detectar desviaciones en signos vitales con intervalos calibrados.
- Observaciones de naturaleza: series con estacionalidad marcada se benefician del perfilado espectral para seleccionar la representación de predicción adecuada.
- Investigación en modelos fundacionales de series temporales: el sistema sirve como banco de pruebas para meta-aprendizaje y enrutamiento entre representaciones, con evaluación reproducible vía `scripts/run_agentic_benchmark.py`.
- Réplica de benchmarks GiftEval: investigadores pueden reproducir resultados bajo el protocolo oficial con `model_type: "agentic"`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados se envían bajo `model_type: "agentic"` al benchmark GiftEval, pero no se incluyen cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible (no se especifican parámetros del modelo ni requisitos de memoria).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: paquete Python instalable vía `pip install -e .` desde el repositorio de GitHub; requiere PyTorch y NumPy/Pandas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia BSL 1.1: el uso comercial, despliegue en producción, alojamiento como servicio de pago o integración en productos comerciales requiere un acuerdo de licencia comercial separado con el autor.
- Solo se declara soporte de inglés; no hay información sobre otros idiomas.
- No se especifican sesgos conocidos, pero al ser un sistema de predicción sobre datos industriales, puede heredar sesgos de los datasets de entrenamiento no documentados.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el meta-enrutamiento determinista podría asignar un régimen incorrecto si las firmas estadísticas de entrada son atípicas.
- No se documentan limitaciones de longitud de contexto ni de horizonte de predicción más allá del ejemplo de 24 pasos.
- No se dispone de información sobre el tamaño del modelo, los datos de entrenamiento ni los pesos, lo que dificulta evaluar su robustez en producción.
- La fecha de creación indicada (2026-10-29) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/BhalalaDaksh/CompactTS-Agent
- Repositorio GitHub: https://github.com/DakshBhalala/CompactTS-Agent
- Dataset de evaluación: https://huggingface.co/datasets/Salesforce/GiftEval
