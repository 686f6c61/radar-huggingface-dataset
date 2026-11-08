# BioinstLab/bnet-ot-fusion

## Resumen

`BioinstLab/bnet-ot-fusion` no es un modelo generativo ni una red neuronal entrenada, sino una **capa de fusión tardía** (late fusion) publicada como paquete de Python. Implementa el método descrito en Asiedu Asare et al. (2026), un marco de fusión multimodal basado en transporte óptimo con regularización entrópica (Sinkhorn) para el diagnóstico de cáncer de mama. El repositorio toma como entrada las probabilidades de salida de dos modelos ya entrenados por separado —un clasificador de imágenes de histopatología (BreakHis) y un modelo de factores de riesgo clínicos (BCSC)— y las combina en el espacio de sus predicciones.

La relevancia del componente reside en su diseño para escenarios de **modalidad faltante**: cuando una de las dos fuentes no está disponible, la capa sustituye la predicción ausente por una distribución uniforme y sigue produciendo una estimación fusionada calibrada. Esto es útil en entornos clínicos reales donde la imagen histopatológica o los datos de riesgo pueden no estar presentes en el momento de la inferencia.

El autor es BioinstLab (Bioinstrumentation Lab), cuenta con 0 descargas y 0 likes en Hugging Face, y el propio autor advierte que se trata de una **reimplementación limpia** del método original: los cuadernos, modelos entrenados y salidas intermedias de los experimentos de 2025 no se conservaron, por lo que los resultados pueden no reproducirse exactamente. No incluye los dos modelos upstream; solo la lógica de fusión y su evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Capa de fusión tardía basada en transporte óptimo entrópico (Sinkhorn-Knopp en dominio logarítmico); no es una red neuronal |
| Parámetros totales | no disponible (no aplica: no hay pesos entrenados de red neuronal; la calibración isotónica se ajusta en datos) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (paquete Python instalable con `pip install -e .`; entradas/salidas en arrays NumPy `.npy`) |

Parámetros de configuración por defecto (`FusionConfig`, valores del paper):

| Parámetro | Valor | Significado |
|---|---|---|
| `fp_weight` (w_p) | 1.8 | Coste semántico, entrada (0, 1) de C_semantic |
| `fn_weight` (w_n) | 1.2 | Coste semántico, entrada (1, 0) de C_semantic |
| `alpha` | 0.1 | Mezcla entre divergencia y coste semántico; `"dynamic"` usa Eq. 16 |
| `reg` | 0.15 | Regularización entrópica del problema de transporte óptimo |
| `max_iter` | 5000 | Iteraciones máximas de Sinkhorn |
| `stop_thr` | 1e-9 | Umbral de convergencia de Sinkhorn |
| `eps` | 1e-8 | Constante de estabilidad numérica en Eq. 16 |

## Arquitectura y entrenamiento

El componente no entrena una red neuronal: implementa la lógica matemática de fusión descrita en el paper. Las predicciones de cada modalidad se representan como vectores en el símplex de probabilidad (`to_distribution`, Eq. 13) y se construye una máscara de modalidad (`modality_mask`, Eq. 14) donde `NaN` indica modalidad ausente. Para una modalidad faltante se aplica sustitución por distribución uniforme (`substitute_missing`, Eq. 15). El factor de fusión α puede ser fijo (0.1) o dinámico y ponderado por confianza (`dynamic_alpha`, Eq. 16).

La matriz de coste combina una divergencia con una penalización semántica clínica (`cost_matrix`, `semantic_cost`, Eq. 17). El problema de transporte óptimo entrópico se resuelve con Sinkhorn-Knopp en el dominio logarítmico (`sinkhorn_log`, Eq. 18), implementado en NumPy/SciPy. La predicción fusionada se obtiene de la marginal de filas del plan de transporte T* (`sinkhorn_fusion`, Eq. 19), con un fallback de producto externo p ⊗ q cuando la violación de marginal final supera `fallback_tol` (1e-6). La calibración se realiza con regresión isotónica, ajustada sobre un split de calibración separado o mediante validación cruzada de 5 pliegues si no se proporciona. El autor documenta explícitamente las decisiones de implementación donde el paper deja opciones abiertas (α fijo vs. dinámico, separación de `reg` y `eps`, solver Sinkhorn, marginal de filas, calibración, dropout).

## Capacidades

- Fusión de dos conjuntos de probabilidades de predicción (histopatología y riesgo clínico) en un vector de probabilidad fusionado.
- Manejo de modalidad faltante mediante sustitución uniforme y máscaras de modalidad (NaN = ausente).
- Factor de fusión α dinámico ponderado por confianza (Eq. 16) o fijo (0.1).
- Matriz de coste con penalización semántica clínica configurable (pesos de falso positivo y falso negativo).
- Solver Sinkhorn-Knopp entrópico en dominio logarítmico, con fallback de producto externo.
- Calibración isotónica de la salida fusionada (split separado o cross-fitting de 5 pliegues).
- Simulación de dropout de modalidad (modos `random`, `hist`, `risk`, `both`).
- Métricas de evaluación: PR-AUC, recall, F1, Brier, intervalos de confianza bootstrap al 95 % (1000 remuestreos) y tests pareados.
- Análisis de curva de decisión (net benefit) y generación de figuras (curva de calibración, curva PR, plan de transporte promedio).
- Registro de tiempo de ejecución por muestra.
- No soporta tool calling, agentes, generación de texto, visión, audio ni multilingüismo: no es un modelo de lenguaje.

## Casos de uso

- **Diagnóstico asistido de cáncer de mama con dos modalidades**: combinar la probabilidad de malignidad de un clasificador de histopatología (BreakHis) con la probabilidad de riesgo alto de un modelo clínico (BCSC) para obtener una predicción fusionada calibrada, adecuada para apoyar la decisión clínica.
- **Inferencia con modalidad faltante en entorno hospitalario**: cuando la imagen histopatológica no está disponible en el momento de la consulta, la capa sustituye la modalidad ausente por una distribución uniforme y sigue generando una estimación fusionada, evitando descartar al paciente por falta de una fuente.
- **Evaluación retrospectiva de cohortes**: dado un conjunto de predicciones guardadas como `.npy` (forma `(N,)` o `(N, 2)`), ejecutar `scripts/evaluate.py` para obtener métricas con intervalos de confianza bootstrap, comparaciones pareadas frente a baselines y resultados de dropout en un solo paso.
- **Auditoría de calibración de un pipeline multimodal**: usar la calibración isotónica y las curvas de calibración (Figs. 3–4 del paper) para verificar que las probabilidades fusionadas son fiables antes de integrarlas en un sistema de triaje.
- **Análisis de coste-beneficio clínico**: emplear `net_benefit` y `plot_decision_curve` para evaluar el valor neto de la fusión a distintos umbrales de decisión, informando la elección de punto de corte en un protocolo de cribado.
- **Estudio de robustez ante dropout**: simular la pérdida de una o ambas modalidades con `simulate_dropout` (Tabla 5 del paper) para cuantificar la degradación del rendimiento y justificar la redundancia de fuentes en el diseño del estudio.
- **Prototipado e integración como librería**: importar `FusionConfig` y `sinkhorn_fusion` en un script Python para probar la fusión sobre predicciones sintéticas (`examples/synthetic_demo.py`) antes de conectar los modelos upstream reales.
- **Reproducción metodológica**: servir como referencia de implementación de las ecuaciones 13–19 del paper para grupos que quieran replicar o adaptar el marco a otras modalidades clínicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de resultados del paper ni cifras de rendimiento; solo describe las métricas que el script de evaluación calcula (PR-AUC, recall, F1, Brier, IC bootstrap, tests pareados, dropout y tiempo por muestra). El autor advierte que, al no conservarse los modelos y salidas originales, los resultados pueden no reproducirse exactamente, y que las cifras del demo sintético no guardan relación con el paper.

## Requisitos de hardware

- No requiere GPU: el solver Sinkhorn se implementa en NumPy/SciPy sobre CPU.
- Dependencias: Python 3.10 o superior, NumPy, SciPy, scikit-learn y matplotlib.
- VRAM estimada: no aplica (no hay pesos de red neuronal que cargar).
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente para la fusión y la evaluación.
- No cabe en el concepto de "consumer GPU" porque no es un modelo de inferencia neuronal; el coste computacional lo dominan los dos modelos upstream, que no se incluyen en este repositorio.
- Opciones de despliegue: instalación como paquete Python (`pip install -e .` o `pip install -r requirements.txt`); ejecución vía `scripts/evaluate.py` o importación de `otfusion` como librería. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el repositorio registra el tiempo por muestra en `run_evaluation`, pero no se publican cifras concretas en la información disponible. El coste por muestra depende de las iteraciones de Sinkhorn (máximo 5000, umbral 1e-9) y del tamaño del lote.

## Comparativa con modelos similares

| Aspecto | bnet-ot-fusion (BioinstLab) | Fusión por promedio/media de probabilidades (baseline habitual) | Fusión por stacking con regresión logística (baseline habitual) |
|---|---|---|---|
| Tipo | Capa de fusión tardía con transporte óptimo entrópico | Combinación lineal simple de probabilidades | Meta-modelo supervisado sobre probabilidades |
| Parámetros | Configurables (`FusionConfig`), sin pesos de red | Ninguno (pesos fijos) | Coeficientes ajustados por regresión |
| Manejo de modalidad faltante | Explícito (sustitución uniforme + máscara) | No nativo; requiere imputación manual | No nativo; requiere imputación manual |
| Calibración | Isotónica integrada | No integrada | No integrada por defecto |
| Coste semántico clínico | Sí (matriz de coste con pesos FP/FN) | No | No |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad | Repositorio Hugging Face (0 descargas) | Genérico | Genérico |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. Los dos modelos upstream (clasificador BreakHis y modelo de riesgo BCSC) no están incluidos en el repositorio, por lo que no es posible comparar sus especificaciones.

## Limitaciones y advertencias

- **No es un modelo de lenguaje ni un modelo de visión**: es una capa de fusión; no genera texto, no procesa imágenes y no soporta tool calling ni agentes.
- **No incluye los modelos upstream**: el clasificador de histopatología y el modelo de riesgo clínico deben aportarse por separado; el repositorio solo consume sus probabilidades.
- **Reproducibilidad limitada**: el autor declara que los cuadernos, modelos entrenados y salidas intermedias de 2025 no se conservaron, por lo que los resultados pueden no coincidir con los del paper.
- **Decisiones de implementación documentadas**: el paper deja abiertas varias elecciones (α fijo vs. dinámico, nomenclatura de la regularización, solver Sinkhorn, marginal de filas, calibración, dropout); la implementación resuelve estas ambigüedades de forma explícita y puede diferir del código original.
- **Licencia no disponible**: no se especifica licencia en Hugging Face; es imprescindible verificar las condiciones antes de cualquier uso comercial o clínico.
- **Contexto de aplicación clínica**: el método está diseñado para diagnóstico de cáncer de mama; su uso en producción sanitaria requiere validación regulatoria y supervisión profesional, no contempladas en el repositorio.
- **Riesgo de alucinación**: no aplica (no es un modelo generativo); el riesgo relevante es la calibración defectuosa de las probabilidades fusionadas si los modelos upstream están mal calibrados o si el split de calibración no es representativo.
- **Idiomas**: no disponible; el componente no procesa texto.
- **Dependencia de la calidad de las entradas**: la fusión solo puede ser tan buena como las probabilidades que recibe; predicciones NaN se interpretan como modalidad ausente, lo que puede enmascarar errores de datos.
- **Sin métricas publicadas**: no hay cifras de rendimiento verificables en la información disponible; cualquier comparación con otros métodos debe hacerse con datos propios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BioinstLab/bnet-ot-fusion
- Perfil del autor en Hugging Face: https://huggingface.co/BioinstLab
- Paper: Asiedu Asare M, Acquah I, Appiah Yeboah B, Owusu E. *Resilient Sinkhorn-Based Optimal Transport Late Fusion Framework for Breast Cancer Diagnosis.* Cancer Informatics. 2026;25:1–15. doi: https://doi.org/10.1177/11769351261420789
- Referencia externa encontrada en la búsqueda (no directamente relacionada con el método): O-Net, Frontiers in Neuroscience: https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2022.876065/full
