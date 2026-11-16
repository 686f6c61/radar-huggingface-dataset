# igorlimamillis/dengue-logistic-regression

## Resumen

`igorlimamillis/dengue-logistic-regression` no es un modelo de lenguaje ni una red neuronal: es un modelo estadístico de regresión logística binomial (GLM con enlace logit) publicado en Hugging Face como artefacto reproducible. El autor, `igorlimamillis`, lo construye sobre un conjunto de datos de curso con 196 individuos (57 casos de dengue) y tres predictores: edad, nivel socioeconómico y sector de la ciudad. El objetivo es estimar la probabilidad de que un individuo sea caso de dengue en función de la edad (con un término cuadrático) y del sector.

El repositorio contiene los coeficientes en JSON, un informe R Markdown completo en HTML, el código fuente del análisis y un script de exportación de datos. Se presentan dos modelos candidatos (edad lineal frente a edad cuadrática) y se deja la elección final abierta de forma deliberada, documentando métricas comparativas (AIC, BIC, AUC, R² de McFadden) y pruebas de razón de verosimilitud.

Su relevancia es acotada y de carácter metodológico: sirve como ejemplo didáctico de flujo de trabajo estadístico reproducible en epidemiología, no como herramienta lista para producción. No hay pesos neuronales, tokenizador ni pipeline de inferencia; el "modelo" se usa evaluando una fórmula logística con los coeficientes publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLM binomial con enlace logit (regresión logística), término cuadrático de edad |
| Parámetros totales | 4 coeficientes (intercepto, edad, edad², sector) en el modelo B; 3 en el modelo A |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | en, pt (documentación y etiquetas) |
| Licencia | no disponible |
| Formato de pesos | JSON (`coefficients.json`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

Modelo lineal generalizado (GLM) binomial con función de enlace logit, ajustado por máxima verosimilitud en R. La variable respuesta es `caso` (binaria) y las covariables son `idade` (edad, continua), `I(idade^2)` (edad al cuadrado) y `setor` (factor con dos niveles). Se comparan dos especificaciones: modelo A (`caso ~ idade + setor`) y modelo B (`caso ~ idade + I(idade^2) + setor`). El término cuadrático se justifica con una prueba de razón de verosimilitud (p = 0,00451). Ni el nivel socioeconómico (`nivel`) ni las interacciones edad × sector mejoraron el ajuste y se descartaron.

Los datos de entrenamiento son 196 individuos con 57 casos, procedentes de un conjunto de curso que no se incluye en el repositorio (`analysis.Rmd` espera un `dengue.txt` local). No hay entrenamiento neuronal, RLHF, DPO ni datos masivos: es un ajuste GLM clásico con selección de variables guiada por AIC/BIC y pruebas de hipótesis. La innovación técnica es mínima y de carácter pedagógico: separación explícita entre selección de modelo y métricas aparentes, y exportación de coeficientes a JSON para uso reproducible fuera de R.

## Capacidades

- Estimación de probabilidad individual de caso de dengue a partir de edad y sector, mediante la fórmula logística publicada.
- Cálculo de odds ratios con intervalos de confianza (por ejemplo, sector 2 frente a sector 1: OR = 3,5916; IC 95 % 1,8322–7,2264 en el modelo B).
- Comparación de especificaciones mediante AIC, BIC, AUC y R² de McFadden.
- Pruebas de razón de verosimilitud para términos adicionales (edad²).
- Exportación de coeficientes y métricas a JSON para su consumo desde Python u otros lenguajes.
- Documentación bilingüe (inglés y portugués) del análisis y de las limitaciones.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Docencia de estadística aplicada: usar el repositorio como ejemplo completo de flujo R Markdown, selección de modelos GLM y exportación de resultados, adecuado por su tamaño reducido y su documentación de decisiones.
- Reproducción metodológica en epidemiología: replicar el análisis con un `dengue.txt` propio para comparar coeficientes y odds ratios en cohortes similares, aprovechando que los coeficientes están en JSON.
- Cálculo de probabilidades individuales en scripts: integrar la función `p_case(age, sector2)` en un cuaderno de Python para explorar escenarios hipotéticos de edad y sector, sin necesidad de R.
- Comparación de especificaciones en cursos de modelización: contrastar modelo lineal frente a cuadrático con las métricas publicadas (AIC 217,64 frente a 211,58; AUC 0,725 frente a 0,745) como ejercicio de selección de modelos.
- Auditoría de reproducibilidad: verificar que `export_site_data.R` regenera `coefficients.json` y que `report.html` refleja las mismas cifras, útil en formación sobre buenas prácticas de investigación reproducible.
- Ilustración de advertencias sobre validación: emplear las limitaciones documentadas (AUC aparente, n = 196, solo 36 individuos de 40 o más años) para enseñar por qué la validación externa es necesaria antes de cualquier uso aplicado.

## Benchmarks y rendimiento

Métricas publicadas por el autor para los dos modelos candidatos, calculadas sobre la misma muestra de ajuste (aparentes, sin validación externa):

| Métrica | Modelo A (edad lineal) | Modelo B (edad cuadrática) |
|---|---|---|
| Fórmula | `caso ~ idade + setor` | `caso ~ idade + I(idade^2) + setor` |
| AIC | 217,64 | 211,58 |
| BIC | 227,47 | 224,69 |
| AUC (misma muestra) | 0,725 | 0,745 |
| R² de McFadden | 0,104 | 0,139 |
| Prueba de razón de verosimilitud (edad²) | no aplica | p = 0,00451 |

No se han publicado comparaciones con otros modelos ni resultados en conjuntos de validación externos en la información disponible.

## Requisitos de hardware

- Inferencia: cualquier CPU o microcontrolador capaz de evaluar una exponencial; el coste computacional es despreciable.
- VRAM: no requiere GPU; 0 GB.
- GPU recomendadas: no aplica.
- Cabe en cualquier GPU de consumo, pero no es necesario usarla.
- Despliegue: scripts en R (`analysis.Rmd`, `export_site_data.R`) o una función Python de pocas líneas que lea `coefficients.json`; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; por la naturaleza del modelo, la evaluación es prácticamente instantánea y el rendimiento no es una métrica relevante.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Métricas | Licencia |
|---|---|---|---|---|---|
| Este modelo (B) | GLM logit con edad² | 4 coeficientes | no aplica | AUC 0,745; AIC 211,58 | no disponible |
| Modelo A del mismo repositorio | GLM logit con edad lineal | 3 coeficientes | no aplica | AUC 0,725; AIC 217,64 | no disponible |
| Alternativas de la misma categoría (otros GLM epidemiológicos publicados en Hugging Face) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Datos observacionales: los odds ratios describen asociaciones, no efectos causales.
- El modelo se seleccionó y evaluó sobre la misma muestra; el AUC es aparente y no hay validación externa.
- Solo 36 individuos tienen 40 años o más, por lo que el extremo derecho de la curva de edad está mal estimado.
- Los diagnósticos de residuos y la prueba de enlace tienen poca potencia con un desenlace binario y n = 196.
- El conjunto de datos original proviene de un curso y no se incluye; `analysis.Rmd` espera un `dengue.txt` local.
- No debe usarse para decisiones clínicas ni de salud pública.
- Licencia no disponible: no se puede confirmar el permiso de uso comercial ni de redistribución.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Hugging Face: https://huggingface.co/igorlimamillis/dengue-logistic-regression
- Write-up con gráficos (EN): https://igor-millis.github.io/work/dengue-logistic-regression/
- Write-up con gráficos (PT): https://igor-millis.github.io/pt/work/dengue-logistic-regression/
