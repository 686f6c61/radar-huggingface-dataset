# cangyeone/ncf-annotation-distributions

## Resumen

`cangyeone/ncf-annotation-distributions` es un artefacto de investigacion publicado en Hugging Face que acompana un manuscrito en curso de Ziye Yu sobre distribuciones de anotacion de dispersion de ondas superficiales condicionadas por forma de onda. No es un modelo de lenguaje: es un checkpoint de normalizing flows (NCF) entrenado para aprender la distribucion condicional de etiquetas dada una senal sismica, junto con el codigo de entrenamiento, los factores de calibracion marginal y el material de evidencia necesario para reproducir el analisis.

El modelo se entrena sobre las 51.409 formas de onda del dataset SeisDispFusion-NCF y utiliza un spline flow de 49 periodos con una copula gaussiana de seis factores. La regla principal de cribado retiene intervalos marginales relativos del 90% con anchura igual o inferior al 5%, lo que convierte al artefacto en una herramienta de anotacion con cuantificacion de incertidumbre mas que en un generador de predicciones puntuales.

Su relevancia es metodologica: documenta de forma explicita que la asociacion poblacional entre velocidad y dispersion (w-S) queda sin estimar por falta de anotaciones independientes cercanas en el espacio de formas de onda, y que no existe una marca de preregistro previa a la inspeccion del test historico. El repositorio tiene 0.0 GB, 0 descargas y 0 likes en el momento de la consulta, y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Normalizing flow condicional (spline flow de 49 periodos con copula gaussiana de seis factores) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en `best.pt`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | en (etiquetado del repositorio) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoint/best.pt`), mas `config.json` y `calibration.json` |
| Tamano del repositorio | 0.0 GB |
| Dataset de entrenamiento | SeisDispFusion-NCF, revision `1c93243311b39bd255b7c9d4072fa4779cda3045`, DOI 10.57967/hf/9114 |
| Numero de formas de onda de entrenamiento | 51.409 |
| Entorno de ejecucion original | Python 3.13, PyTorch CUDA 12.8, nflows, NumPy, SciPy, h5py, Matplotlib, disba 0.7.0 |

## Arquitectura y entrenamiento

La pieza central es un normalizing flow condicional que modela la distribucion de etiquetas de dispersion dado un registro de forma de onda completa. La parametrizacion concreta es un spline flow sobre 49 periodos, acoplado mediante una copula gaussiana de seis factores que captura la dependencia entre periodos. El entrenamiento utiliza las 51.409 formas de onda del dataset SeisDispFusion-NCF, con particiones de calibracion y test separadas del conjunto de entrenamiento. El checkpoint archivado corresponde al entrenamiento original sobre forma de onda completa (`best.pt`), acompandado de `config.json` y `calibration.json` con los factores de calibracion marginal.

El repositorio incluye ademas instantaneas de codigo versionadas: `20261115_unfiltered_v2` (entrenamiento original y preparacion del banco), `20261115_qc_information_v1` (modelo de cuantiles exactos y evaluacion, con `activate_exact_qc.py`), `20261117_traditional_label_qc_v1` (inversion convencional de etiquetas originales) y `narrative_revision` (nueva evidencia, guardas inferenciales y scripts de figuras). La reproducibilidad se refuerza con `SHA256SUMS.json`, que fija la identidad de contenido de cada activo computacional, y con un protocolo de entrada congelado en `inversion/`. No se documentan fases de RLHF ni DPO, algo esperable en un modelo de regresion distribucional y no de generacion de texto.

## Capacidades

- Modelado de la distribucion condicional de etiquetas de dispersion de ondas superficiales dada una forma de onda sismica.
- Anotacion con intervalos de incertidumbre calibrados: la regla primaria retiene intervalos marginales relativos del 90% con anchura menor o igual al 5%.
- Cribado posterior (posterior screening) para filtrar anotaciones antes de la inversion de profundidad.
- Analisis de sensibilidad de inversion de fase a umbrales del 4%, 5% y 6%.
- Baseline de conformal prediction por particion (split-conformal) para comparar la calibracion del flow.
- Control de calidad convencional sobre una poblacion basada en geometria, evaluado por separado.
- Inversion de profundidad convencional mediante disba 0.7.0 sobre etiquetas originales identicas en ambos brazos.
- Diagnostico compacto en JSON y generacion de figuras con Matplotlib.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Anotacion sismologica asistida: dado un registro de forma de onda, el flow devuelve una distribucion sobre las etiquetas de dispersion en 49 periodos, lo que permite al analista trabajar con intervalos calibrados en lugar de una unica curva puntual.
- Cribado de calidad de etiquetas: el posterior screening descarta anotaciones cuya anchura de intervalo marginal relativa al 90% supera el 5%, reduciendo el ruido antes de la inversion de profundidad.
- Inversion de profundidad con control de incertidumbre: integrado con disba 0.7.0, el flujo permite propagar la incertidumbre de la anotacion hasta el modelo de velocidad, comparando el conjunto completo de etiquetas frente al subconjunto retenido.
- Auditoria de calibracion: el baseline split-conformal y los factores de calibracion marginal archivados permiten verificar si los intervalos del flow estan bien calibrados en la particion de test.
- Reproduccion de resultados cientificos: los scripts `narrative_evidence_20261119.py`, `narrative_followup_20261119.py` y `plot_narrative_20261119.py`, junto con `SHA256SUMS.json`, permiten regenerar las tablas y figuras del manuscrito.
- Analisis de sensibilidad metodologica: los umbrales de fase del 4/5/6% permiten estudiar cuanto cambia la inversion al endurecer o relajar el criterio de retencion.
- Docencia en sismologia cuantitativa: el repositorio sirve como ejemplo completo de flujo normalizador condicional aplicado a datos geofisicos, con particiones separadas y evidencia de calibracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe analisis de evidencia (exact-quantile flip, sensibilidad 4/5/6%, split-conformal y control QC convencional) pero no reporta metricas numericas comparables con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del checkpoint no se declara y el repositorio figura como 0.0 GB.
- GPU recomendadas: el runtime original usa PyTorch CUDA 12.8, por lo que se requiere una GPU compatible con CUDA; no se especifica modelo concreto (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada por falta de datos de tamano; un spline flow sobre 49 periodos es en principio ligero, pero no se puede afirmar sin conocer el numero de parametros.
- Opciones de despliegue: ejecucion directa con PyTorch y nflows; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el dataset SeisDispFusion-NCF debe descargarse aparte en el host de computo, ya que las formas de onda no se duplican en este release.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de normalizing flows condicionales para dispersion de ondas superficiales, ni datos de rendimiento que permitan establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La asociacion poblacional w-S y su intervalo de confianza por clusters independientes permanecen sin estimar: la regla estricta de vecindad en forma de onda solo produce un ancla elegible con 22 puntos de periodo.
- El release no aporta anotaciones independientes adicionales cercanas en el espacio de formas de onda, lo que limita la validacion externa.
- No se establece una marca de preregistro anterior a la inspeccion historica del test; ambos puntos figuran como marcadores de evidencia explicitos en el manuscrito.
- La licencia no esta declarada, por lo que el uso comercial no puede asumirse permitido sin consultar al autor.
- El repositorio tiene 0 descargas y 0 likes, y el pipeline no esta disponible: no hay senal de uso o mantenimiento por parte de la comunidad.
- El modelo no es un LLM: no admite prompts en lenguaje natural, tool calling ni razonamiento multi-paso.
- El contenido esta en ingles y vinculado a un manuscrito en curso, por lo que la API y la estructura de ficheros pueden cambiar.
- Los scripts de figuras requieren la fuente Arial instalada por el usuario; los ficheros de fuente no se redistribuyen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cangyeone/ncf-annotation-distributions
- Dataset SeisDispFusion-NCF (revision fijada): https://huggingface.co/datasets/cangyeone/SeisDispFusion-NCF/tree/1c93243311b39bd255b7c9d4072fa4779cda3045
- DOI del dataset: https://doi.org/10.57967/hf/9114
