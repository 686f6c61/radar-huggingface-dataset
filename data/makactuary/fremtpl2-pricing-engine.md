# makactuary/fremtpl2-pricing-engine

## Resumen

`makactuary/fremtpl2-pricing-engine` es un conjunto de tres pipelines de scikit-learn entrenados para tarificación de seguros de automóvil (responsabilidad civil de terceros) sobre el conjunto de datos público freMTPL2, procedente de CASdatasets (Dutang y Charpentier) y distribuido también vía OpenML (IDs 41214 y 41215, licencia CC0). El paquete cubre 678.013 pólizas y 26.406 siniestros, y descompone la prima pura en dos componentes multiplicativas: frecuencia de reclamación anual y coste por siniestro, con una capa adicional de teoría de valores extremos (EVT) para grandes pérdidas.

El modelo resuelve un problema clásico de pricing actuarial: estimar la prima pura por póliza-año combinando un modelo de frecuencia (Poisson) y uno de severidad (Gamma), y añadir una carga por cola pesada mediante una distribución generalizada de Pareto (GPD) ajustada a los excesos sobre el percentil 99. No es un modelo de lenguaje ni una red neuronal: es un artefacto tabular de regresión serializado con joblib, pensado para reproducir un estudio metodológico abierto, no para producción directa.

Su relevancia es didáctica y de referencia: ofrece una comparativa explícita entre GLM Poisson y gradient boosting para frecuencia, con métricas Gini y D² sobre un hold-out del 20 % (135.603 pólizas), y documenta de forma transparente la incertidumbre del parámetro de forma de la cola (ξ = 0,87; IC bootstrap del 95 %: 0,59–1,11). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tres pipelines de scikit-learn: gradient boosting con pérdida Poisson (`freq_gbm`), GLM Poisson (`freq_glm`) y GLM Gamma (`sev_gamma`); capa EVT con GPD ajustada por separado |
| Parámetros totales | no disponible (no es una red neuronal; número de árboles y coeficientes no documentado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 9 columnas por póliza) |
| Tipos de cuantización | no aplica (serialización joblib; sin cuantización) |
| Idiomas soportados | no disponible (no procesa texto; variables categóricas del dataset: `VehBrand`, `VehGas`, `Region`, `Area`) |
| Licencia | MIT |
| Formato de pesos | `models.joblib` (serialización joblib de scikit-learn 1.9.1) |

Variables de entrada: `VehAge`, `DrivAge`, `VehBrand`, `VehPower`, `VehGas`, `Region`, `Area`, `BonusMalus`, `Density`.

## Arquitectura y entrenamiento

El artefacto agrupa tres modelos supervisados sobre datos tabulares. El modelo de frecuencia principal es un gradient boosting con pérdida Poisson y ponderación por exposición, que estima siniestros por póliza-año. Se acompaña de un GLM Poisson como referencia interpretable. El modelo de severidad es un GLM Gamma sobre el coste por siniestro, truncado al percentil 99 (16.024 €), de modo que la cola extrema se modela aparte.

La capa de grandes pérdidas ajusta una distribución generalizada de Pareto a los 199 excesos sobre 16.024 €, obteniendo un parámetro de forma ξ = 0,87 (IC bootstrap del 95 %: 0,59–1,11). En el 19,8 % de las remuestras bootstrap ξ ≥ 1, lo que implica ausencia de media finita en esos casos. La prima pura se calcula como `freq_gbm × (sev_gamma + carga por gran siniestro por reclamación)`, con dos alternativas de carga: empírica (680 €) o GPD (1.210 €). No se documenta uso de validación cruzada, búsqueda de hiperparámetros ni técnicas de regularización más allá de las propias del boosting.

## Capacidades

- Predicción de frecuencia anual de reclamaciones por póliza (siniestros por póliza-año), ponderada por exposición.
- Predicción de coste medio por siniestro (GLM Gamma) para la masa attritional, con techo en el percentil 99.
- Cálculo de prima pura por póliza-año combinando frecuencia, severidad y carga de grandes pérdidas.
- Modelización de cola pesada mediante GPD, con estimación puntual e intervalo bootstrap del parámetro de forma.
- Benchmark interno GLM frente a GBM para frecuencia, con métricas Gini y D².
- Interpretabilidad parcial vía el GLM Poisson de referencia.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Estudio metodológico de pricing: reproducir la comparativa GLM frente a GBM en frecuencia usando el hold-out documentado de 135.603 pólizas y las métricas Gini (0,273 frente a 0,321) y D² (4,1 % frente a 6,2 %).
- Docencia actuarial: ilustrar la descomposición frecuencia × severidad y la incorporación de una capa EVT sobre un dataset público de 678.013 pólizas, con código y artículo asociados en el repositorio del autor.
- Análisis de sensibilidad de la carga por grandes siniestros: comparar el efecto de usar la carga empírica (680 €) frente a la GPD (1.210 €) sobre la ratio predicho/observado (0,999 frente a 1,233) y sobre el Gini (0,331 en el caso empírico).
- Prototipado de tarificación por segmentos: usar `freq_gbm` y `sev_gamma` para explorar cómo varía la prima pura según `BonusMalus`, `DrivAge`, `VehAge` o `Region` antes de construir un modelo propio con datos internos.
- Validación de infraestructura de scoring tabular: el artefacto joblib sirve para probar pipelines de inferencia batch con scikit-learn 1.9.1 y verificar versionado de dependencias.
- Referencia para auditoría de modelos: la documentación explícita de la incertidumbre de ξ y del porcentaje de remuestras sin media finita (19,8 %) facilita discutir requisitos de capital y apetito de riesgo en entornos formativos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un hold-out del 20 % (135.603 pólizas):

| Métrica | Poisson GLM | Poisson GBM |
|---|---|---|
| Gini de frecuencia | 0,273 | 0,321 |
| D² de frecuencia | 4,1 % | 6,2 % |

| Configuración de prima pura | Ratio predicho/observado | Gini |
|---|---|---|
| Carga empírica (680 €) | 0,999 | 0,331 |
| Carga GPD (1.210 €) | 1,233 | no disponible |

Ajuste EVT: GPD sobre 199 excesos, ξ = 0,87 (IC bootstrap del 95 %: 0,59–1,11); 19,8 % de remuestras con ξ ≥ 1.

No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ni son aplicables a este artefacto.

## Requisitos de hardware

- Inferencia en CPU; no requiere GPU. El repositorio ocupa 0,0 GB y el artefacto es un joblib de tres pipelines de scikit-learn.
- Memoria RAM estimada: no disponible con precisión; suficiente con un entorno estándar de ciencia de datos para cargar el joblib y puntuar lotes de pólizas.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer; no hay requisito de VRAM.
- Despliegue: carga directa con `joblib.load` y scikit-learn 1.9.1 (versión obligatoria según el autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Datos | Métrica de frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| freMTPL2 pricing engine (`freq_gbm`) | Gradient boosting Poisson | freMTPL2, 678.013 pólizas | Gini 0,321; D² 6,2 % | MIT | Hugging Face, 0 descargas |
| freMTPL2 pricing engine (`freq_glm`) | GLM Poisson | freMTPL2, 678.013 pólizas | Gini 0,273; D² 4,1 % | MIT | Incluido en el mismo joblib |
| Alternativas públicas sobre freMTPL2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros artefactos comparables publicados con métricas verificables en la documentación consultada.

## Limitaciones y advertencias

- Cartera francesa de un único periodo: no incorpora inflación de siniestros, IBNR ni reaseguro.
- La capa de grandes pérdidas se apoya en solo 199 siniestros, lo que hace la estimación de ξ muy inestable (IC 0,59–1,11; 19,8 % de remuestras con ξ ≥ 1, sin media finita).
- La elección de la carga por gran siniestro (680 € frente a 1.210 €) es una decisión de apetito de riesgo, no un resultado del modelo; cambia la ratio predicho/observado de 0,999 a 1,233.
- El propio autor la describe como ilustración metodológica, no como una tarifa utilizable en producción.
- Requiere scikit-learn 1.9.1 exacto para cargar el joblib; otras versiones pueden romper la deserialización.
- Sin validación externa fuera de la cartera freMTPL2; no se documentan sesgos por subgrupos ni pruebas de equidad.
- Licencia MIT permite uso comercial del artefacto, pero los datos subyacentes (freMTPL2) tienen su propia licencia CC0 y el modelo no incluye garantías de adecuación regulatoria.
- No procesa texto ni datos no tabulares; no admite entradas fuera de las nueve columnas documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/makactuary/fremtpl2-pricing-engine
- Repositorio de código, artículo y resultados: https://github.com/000MAK/cafepolice-actuarial-loss-engine
- Dataset freMTPL2 en OpenML (frecuencia): https://www.openml.org/d/41214
- Dataset freMTPL2 en OpenML (severidad): https://www.openml.org/d/41215
- CASdatasets (Dutang y Charpentier): http://cas.uqam.ca/
