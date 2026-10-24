# HanyueShen/PAM-Cloud-Forecasting

## Resumen

PAM (Probabilistic Atmospheric Model) es un modelo neuronal específico para el pronóstico regional de probabilidad de nube a 24, 48 y 72 horas, desarrollado por Hanyue Shen (Stevens Institute of Technology) y Xinling Liao (King's College London). No es un modelo de lenguaje: es un modelo de rejilla que combina cuatro campos de nubosidad de Himawari (a −18, −12, −6 y 0 horas) con la fracción de nubosidad total de GFS para producir un campo de probabilidad de detección de nube sobre una malla de 71 × 101 celdas de 1 grado que cubre 70–170°E y 10°S–60°N.

El modelo es deliberadamente pequeño: 587.587 parámetros en la variante de 24 h y 590.787 en la variante compartida de 48/72 h. Su relevancia está en el enfoque de fusión espacial: en lugar de mezclar la observación satelital y la guía GFS con un peso escalar uniforme, aprende un peso de mezcla espacialmente variable más una corrección logit acotada, lo que según la model card aporta 5,82, 6,19 y 6,03 puntos porcentuales de mIoU de píxel sobre el mezclado escalar uniforme en 24, 48 y 72 h respectivamente.

La release acompaña al manuscrito *Spatial Fusion of Himawari Observations and GFS Guidance for 24–72-Hour Regional Cloud-Probability Forecasting* e incluye los seis checkpoints finales usados en las comparaciones de 2026 (un checkpoint de 24 h y uno compartido de 48/72 h para cada semilla 42, 31415 y 271828). Los pesos se distribuyen en Safetensors y el código en un paquete Python (`pam_forecast`) que se instala desde el propio repositorio versionado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red convolucional recurrente (ConvGRU) con bloques de mezcla de vecindad y red de fusión espacial; no es un transformer ni un modelo de lenguaje |
| Parámetros totales | 587.587 (24 h) y 590.787 (48/72 h) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: modelo de rejilla espacial. Entrada temporal fija de 4 fotogramas (−18, −12, −6 y 0 h) sobre malla de 71 × 101 celdas de 1° |
| Tipos de cuantización | No disponible (la model card solo distribuye pesos Safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (documentación y model card) |
| Licencia | MIT |
| Formato de pesos | Safetensors, más paquete Python `pam_forecast` instalable |
| Cobertura espacial | 70–170°E, 10°S–60°N; rejilla de 71 × 101 a 1° |
| Horizontes de predicción | 24, 48 y 72 h |
| Entradas | `cloud_probability` (B×4×71×101), `mask_fraction` (B×4×71×101), `gfs_cloud_fraction` (B×71×101), `initialization_time` (ISO UTC, 00/06/12/18 UTC) |
| Salida | Campo de probabilidad de nube de forma B×71×101 |
| Semillas publicadas | 42 (por defecto), 31415, 271828 |
| Punto de control de versión | `revision="v1.0.0"` |
| Endpoint de inferencia alojado | No desplegado (inferencia local) |

## Arquitectura y entrenamiento

La arquitectura tiene tres etapas. Un encoder ConvGRU de 32 canales procesa los cuatro fotogramas satelitales de dos canales cada uno (`cloud_probability` y `mask_fraction`), seguido de cuatro bloques de mezcla de vecindad a escalas de 3, 5 y 9 celdas. Una red de fusión espacial de anchura 64 combina las características satelitales con la guía GFS condicionada a validez del objetivo, además de características geográficas y temporales. Finalmente, seis bloques residuales dilatados predicen un peso de mezcla espacial y una corrección logit acotada sobre la guía GFS. La predicción es directa para cada horizonte solicitado: no hay rollout recursivo, y el modelo de 48/72 h comparte pesos recibiendo el horizonte pedido como entrada.

El ajuste descrito en la model card usa 2.688 ejemplos de entrenamiento y 533 ejemplos de validación purgados para la búsqueda de tasa de aprendizaje de la variante de 24 h. Cada semilla se reajusta durante siete épocas sobre 3.229 ejemplos anteriores a 2026. El ajuste de largo plazo parte del modelo de 24 h de la misma semilla y usa siete épocas conjuntas balanceadas seguidas de dos épocas adicionales (la model card aparece truncada en este punto, por lo que no se detalla la composición exacta de esa segunda fase). No se documenta RLHF, DPO ni ningún proceso de alineación, algo esperable en un modelo de predicción física.

El modelo no consume radianzas multiespectrales, perfiles atmosféricos verticales ni flujo óptico calculado; las entradas de la rama de movimiento están a cero. En el cargador de entrenamiento, los valores satelitales gruesos ausentes se sustituyen por 0,5, y el canal interno de máscara no es temperatura. La evaluación exige campos de entrada finitos y completos.

## Capacidades

- Predicción determinista de probabilidad de detección de nube sobre la rejilla 71 × 101 a 24, 48 y 72 h en una sola pasada.
- Fusión espacial aprendida de observación satelital Himawari y guía GFS, con peso de mezcla variable por celda en lugar de escalar uniforme.
- Codificación de la hora de inicialización mediante características cíclicas (00, 06, 12, 18 UTC).
- Evaluación por lotes: la dimensión B de las entradas permite procesar varias inicializaciones simultáneamente.
- Selección de semilla en carga (`seed=42`, `31415`, `271828`) y de horizonte (`lead_hours=24|48|72`) mediante la API `PAMForecast.from_pretrained`.
- Ejecución en CPU (`device="cpu"`) o GPU sin requisitos de memoria relevantes.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo "thinking". Es un modelo numérico de dominio específico.

## Casos de uso

- **Predicción de recurso solar para plantas fotovoltaicas**: la salida de probabilidad de nube a 24–72 h alimenta un modelo de irradiancia para programar la producción del día siguiente y reducir desvíos en el mercado diario; el horizonte de 72 h cubre la planificación semanal.
- **Planificación de observación de satélites**: un operador puede decidir qué escenas solicitar o en qué ventanas priorizar la descarga según la probabilidad de nubosidad prevista sobre la región 70–170°E, 10°S–60°N.
- **Nowcasting y aviación regional**: integración en un pipeline meteorológico para estimar cobertura nubosa en rutas y aeródromos del sudeste asiático y Australia occidental con hasta tres días de antelación.
- **Logística y cadena de frío**: la previsión de nubosidad se usa como variable auxiliar de temperatura y radiación en modelos de demanda energética de almacenes y flotas refrigeradas.
- **Agricultura de precisión**: planificación de tratamientos y riego a partir de la previsión de cobertura nubosa y, por extensión, de evapotranspiración estimada en parcelas de la región cubierta.
- **Investigación en fusión de fuentes**: el modelo sirve como referencia reproducible (seis checkpoints, tres semillas, revisión `v1.0.0`) para comparar esquemas de blending escalar frente a fusión espacial aprendida en estudios de downscaling.
- **Validación cruzada de GFS**: comparar la guía de nubosidad total de GFS con la probabilidad de detección satelital corregida por el modelo permite auditar sesgos del modelo global en la región.
- **Generación de campos sintéticos para aumento de datos**: los campos predichos pueden usarse como datos aumentados en el entrenamiento de modelos downstream de segmentación de nubes, siempre con la advertencia de que son predicciones, no observaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. Son medias por inicialización sobre rejilla equiespaciada, promediadas sobre tres semillas independientes (no son puntuaciones de ensemble ni de la semilla por defecto):

| Horizonte | Inicializaciones evaluadas | PCC espacial | mIoU de píxel a 0,5 | PF-MSE |
|---|---:|---:|---:|---:|
| 24 h | 784 | 0,7587 | 67,45 % | 0,05690 |
| 48 h | 780 | 0,7111 | 64,13 % | 0,06620 |
| 72 h | 776 | 0,6697 | 61,65 % | 0,07390 |

Ganancias de la fusión espacial frente al mezclado escalar uniforme, en puntos porcentuales de mIoU de píxel: +5,82 (24 h), +6,19 (48 h) y +6,03 (72 h).

El `model-index` del repositorio declara el modelo "PAM" con la lista de resultados vacía, por lo que los únicos datos numéricos disponibles son los de la tabla anterior. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguajes, que no aplican a este modelo.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en fp32 para los pesos solos (≈2,4 MB para 590.787 parámetros); el consumo real lo domina el tamaño de lote de los tensores de entrada (B×4×71×101 en float32).
- **GPU recomendadas**: cualquier GPU con soporte CUDA sirve; no se necesita A100, H100 ni RTX 4090. Una GTX 1650 o una iGPU moderna es suficiente.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo e incluso en CPU. El ejemplo oficial de la model card se ejecuta con `device="cpu"`.
- **Opciones de despliegue**: paquete Python `pam_forecast` sobre PyTorch; descarga de pesos vía `huggingface_hub.snapshot_download` con `revision="v1.0.0"`; instalación local con `pip install /ruta/al/repo`. No hay endpoint de inferencia alojado. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que además no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. Dado el tamaño (0,59 M de parámetros) y la rejilla (7.171 celdas por campo), se espera una inferencia de milisegundos a pocos segundos por lote en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mIoU 24 h | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PAM (este modelo) | 587.587 (24 h) / 590.787 (48-72 h) | 4 fotogramas Himawari + GFS, rejilla 71×101 | 67,45 % | MIT | Pesos Safetensors + paquete Python, 6 checkpoints |
| Mezclado escalar uniforme (baseline del paper) | No disponible | Mismas entradas | 67,45 % − 5,82 pp | No aplica | Baseline interno, no publicado como checkpoint |
| YH.Model.PAM (proyecto GitHub relacionado) | No disponible | Solo visuales de satélite, 24–72 h | No disponible | No disponible | Repositorio GitHub |
| Modelos globales de predicción neuronal (GraphCast, Pangu-Weather, FourCastNet) | No disponible en la información proporcionada | Variables atmosféricas globales, no probabilidad de nube regional | No disponible | No disponible | No comparados en la model card |

La comparación directa con modelos globales de predicción neuronal no está soportada por los datos disponibles: PAM predice probabilidad de detección de nube satelital en una región concreta, mientras que esos modelos producen variables atmosféricas globales con otra definición física del objetivo.

## Limitaciones y advertencias

- **Evaluación post-hoc**: los resultados usan casos de enero a julio de 2026 previamente vistos, mientras que el ajuste usa datos anteriores a 2026. No es una validación totalmente ciega ni un experimento preregistrado.
- **Objetivo no físico directo**: la diana es la probabilidad de detección de nube del algoritmo de recuperación satelital, y la guía GFS tiene una definición física distinta (fracción de nubosidad total). Las comparaciones entre ambas fuentes deben interpretarse con cautela.
- **Cobertura geográfica limitada**: solo 70–170°E y 10°S–60°N. Fuera de esa región el modelo no es aplicable.
- **Entradas incompletas**: la evaluación exige campos finitos y completos; en entrenamiento los valores satelitales ausentes se rellenan con 0,5, lo que puede introducir sesgos en celdas con mala cobertura.
- **Sin información multiespectral ni perfil vertical**: el modelo no usa radianzas, perfiles atmosféricos ni flujo óptico, y las entradas de la rama de movimiento están a cero. Su capacidad para casos de convección rápida o cambios bruscos es, por diseño, limitada.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero sí existe riesgo de predicciones suavizadas o poco realistas en regímenes no vistos; contrástese siempre con observaciones.
- **Licencia**: MIT permite uso comercial y modificación con atribución y sin garantía. No obstante, el modelo se publica como acompañamiento de un manuscrito y no se declara un soporte de producción.
- **Sin endpoint de inferencia**: hay que desplegar el paquete Python por cuenta propia; el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que la comunidad de validación es inexistente.
- **Modelo de 2024 no incluido**: el ejemplo de predicción del manuscrito usa un modelo ilustrativo de 2024 que no forma parte de esta release; los checkpoints publicados son solo los de las comparaciones de 2026.
- **Documentación solo en inglés**: no hay materiales en castellano ni en otros idiomas.

## Enlaces

- Hugging Face: https://huggingface.co/HanyueShen/PAM-Cloud-Forecasting
- DOI del repositorio: https://doi.org/10.57967/hf/11241
- Repositorio GitHub del proyecto: https://github.com/Henry-Hanyue-Shen/YH.Model.PAM
- Perfil del autor en Hugging Face: https://huggingface.co/HanyueShen/models
- Portafolio de investigación del autor: https://www.hanyueshen.blog/research
