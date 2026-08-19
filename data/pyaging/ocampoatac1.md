# pyaging/ocampoatac1

## Resumen

`pyaging/ocampoatac1` es un reloj de envejecimiento (aging clock) basado en accesibilidad de cromatina, desarrollado por el equipo de pyaging y publicado en 2023 (Morandini et al., GeroScience 2024). Predice la edad cronológica de un individuo a partir de datos de cromatina accesible (ATAC-seq) obtenidos de células mononucleares de sangre periférica (PBMC). El modelo utiliza una regresión elastic net entrenada sobre 228 regiones abiertas de cromatina seleccionadas de un conjunto inicial de 80.400 picos candidatos.

Este modelo es relevante porque ofrece una alternativa a los relojes epigenéticos basados en metilación de ADN, utilizando un tipo de dato diferente (accesibilidad de cromatina) que puede complementar los estudios de envejecimiento biológico. Su implementación está integrada en la librería `pyaging`, lo que facilita su uso en pipelines de análisis de datos ómicos. No es un modelo de lenguaje ni de visión; es un modelo estadístico de regresión aplicado a datos biológicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión elastic net (lineal con regularización L1+L2) |
| Parametros totales | 228 coeficientes (uno por región de cromatina abierta) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No aplica (modelo estadístico, no red neuronal) |
| Idiomas soportados | No aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | Coeficientes en tabla (formato no especificado; integrado en `pyaging`) |

## Arquitectura y entrenamiento

El modelo es una regresión elastic net, una técnica de regresión lineal regularizada que combina penalizaciones L1 (lasso) y L2 (ridge). Se entrenó sobre datos de accesibilidad de cromatina de células mononucleares de sangre periférica (PBMC) de individuos humanos. El conjunto de entrada consistía en 80.400 regiones de cromatina abierta, de las cuales se seleccionaron 228 mediante el proceso de regularización y selección de características propio de elastic net. El resultado es un modelo parsimonioso que predice la edad cronológica a partir de la señal de accesibilidad en esas 228 regiones.

No se dispone de detalles sobre el número de muestras de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como validación cruzada o ajuste de hiperparámetros más allá de lo publicado en el artículo original. El modelo se distribuye como una tabla de coeficientes lista para usar, no como pesos de una red neuronal.

## Capacidades

- Predicción de edad cronológica a partir de datos de accesibilidad de cromatina (ATAC-seq) en PBMC.
- Modelo específico para Homo sapiens.
- Integración directa con la librería `pyaging` mediante la función `pya.pred.predict_age(adata, ["ocampoatac1"])`.
- Funciona con datos de entrada en formato AnnData (estructura estándar en single-cell).
- No soporta generación de texto, razonamiento, código, visión ni tool calling.

## Casos de uso

- Investigación del envejecimiento biológico: el modelo permite estimar la edad biológica de individuos a partir de datos de accesibilidad de cromatina, lo que puede usarse para estudiar la desviación entre edad cronológica y biológica en cohortes de pacientes.
- Estudios longitudinales de envejecimiento: al aplicarse a muestras de PBMC de diferentes momentos temporales, puede monitorizar cambios en el ritmo de envejecimiento a nivel molecular.
- Validación de intervenciones anti-envejecimiento: en ensayos preclínicos o clínicos, el reloj puede servir como biomarcador de eficacia de fármacos, dietas o cambios de estilo de vida.
- Análisis de datos de ATAC-seq en biobancos: integrable en pipelines de procesamiento de datos ómicos para enriquecer fenotipos con una estimación de edad biológica.
- Comparación con relojes epigenéticos basados en metilación: permite evaluar si la accesibilidad de cromatina ofrece información complementaria a los relojes clásicos de Horvath o Hannum.
- Educación y divulgación en bioinformática: sirve como ejemplo didáctico de aplicación de regresión regularizada a datos biológicos de alta dimensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo original (Morandini et al., 2024) reporta métricas de rendimiento como correlación y error absoluto medio, pero estos datos no están incluidos en la model card ni en la información proporcionada. No se dispone de comparaciones cuantitativas con otros relojes de envejecimiento.

## Requisitos de hardware

- El modelo es una tabla de 228 coeficientes; su inferencia requiere recursos computacionales mínimos (CPU de cualquier gama, menos de 1 MB de RAM).
- No requiere GPU.
- Se ejecuta dentro de la librería `pyaging`, que a su vez depende de `scanpy` y `anndata`; el requisito real de hardware viene del preprocesado de los datos de ATAC-seq, no del modelo en sí.
- Para el preprocesado de datos de cromatina a gran escala se recomienda un servidor con al menos 16 GB de RAM y múltiples núcleos, pero la predicción en sí es instantánea.
- Despliegue: no aplica vLLM, llama.cpp ni Ollama; se usa como una función de Python dentro de un entorno con `pyaging` instalado.

## Comparativa con modelos similares

No se dispone de información sobre otros relojes de envejecimiento basados en accesibilidad de cromatina comparables en la información proporcionada. Los relojes epigenéticos más conocidos (Horvath, Hannum) se basan en metilación de ADN y no son directamente comparables en arquitectura ni en tipo de dato de entrada. Se recomienda consultar el artículo original para comparaciones con otros métodos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para células mononucleares de sangre periférica (PBMC); su aplicación a otros tejidos puede producir predicciones inexactas.
- Solo es válido para Homo sapiens; no aplica a otras especies.
- La accesibilidad de cromatina es un dato sensible a la calidad de la preparación de la muestra y al pipeline de procesamiento bioinformático; variaciones en estos pasos pueden afectar a las predicciones.
- Al ser un modelo de regresión lineal, asume una relación lineal entre la señal de accesibilidad y la edad, lo que puede no capturar efectos no lineales.
- No se han documentado sesgos específicos, pero al estar entrenado en una cohorte concreta (no especificada en la información disponible), podría presentar sesgos poblacionales (etnia, sexo, edad de entrenamiento).
- Riesgo de alucinación no aplica (no es un modelo generativo).
- La licencia BSD-3-Clause permite uso comercial con atribución, pero se recomienda revisar los términos completos.
- El modelo se distribuye tal cual, sin garantías de exactitud clínica; no debe usarse como herramienta de diagnóstico médico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/ocampoatac1
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Artículo original: Morandini, F. et al. ATAC-clock: An aging clock based on chromatin accessibility. GeroScience 46, 635-650 (2024). DOI: https://doi.org/10.1007/s11357-023-00986-0
