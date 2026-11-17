# iaac-maai/day4-group3-mumbai-rent-mlp

## Resumen

El modelo `iaac-maai/day4-group3-mumbai-rent-mlp` es un perceptrón multicapa (MLP) desarrollado en PyTorch por el grupo 3 del curso IAAC MAAI, como extensión de un ejercicio previo de predicción de alquileres. Su propósito es estimar el alquiler mensual histórico anunciado (en rupias indias, INR) de anuncios inmobiliarios residenciales en Mumbai, a partir de características tabulares como superficie, número de habitaciones (BHK), baños, balcones, amueblado, orientación, ubicación y tipo de propiedad.

Técnicamente es un modelo muy pequeño: una red densa con 23 entradas preprocesadas, dos capas ocultas de 64 y 32 neuronas con activaciones ReLU y una salida de regresión, sumando 3.649 parámetros entrenables. No es un modelo de lenguaje ni un sistema generativo: es un regresor tabular de propósito didáctico, entrenado sobre 18.846 anuncios limpios de Mumbai procedentes del *Property Rental Listings Dataset* de Harshal Honde.

Su relevancia es limitada fuera del contexto académico: la propia model card advierte explícitamente que se trata de un modelo de coursework, que los datos son anuncios históricos sin fecha de recogida verificada y que no debe usarse para valoraciones actuales, decisiones financieras, selección de inquilinos ni acceso a vivienda. Su interés práctico reside en ilustrar un flujo completo de preprocesado con scikit-learn, entrenamiento en PyTorch y evaluación frente a una línea base y un Random Forest.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) denso: 23 → 64 → 32 → 1, activaciones ReLU |
| Parámetros totales | 3.649 parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, no secuencial) |
| Tipos de cuantización | no disponible (no se documentan; el modelo es de 3.649 parámetros) |
| Idiomas soportados | en (inglés, según metadatos; el modelo no procesa texto libre) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (state dict de PyTorch), `config.json`, `scaler.joblib` (pipeline de preprocesado scikit-learn) |

## Arquitectura y entrenamiento

La arquitectura es un MLP totalmente conectado con tres capas lineales: una primera capa de 23 a 64 neuronas, una segunda de 64 a 32 y una capa de salida de 32 a 1. Las activaciones son ReLU y se aplica `Dropout` con probabilidad configurable (seleccionada en 0.0). El preprocesado incluye imputación por mediana y estandarización para variables numéricas, e imputación por moda y one-hot encoding para variables categóricas, todo empaquetado en un pipeline de scikit-learn serializado como `scaler.joblib`. Las predicciones se truncan a cero como suelo.

El entrenamiento usó el optimizador Adam con tasa de aprendizaje 0.001, tamaño de lote 256 y semilla 42. La configuración final (sin dropout, 28 épocas) se seleccionó mediante MAE de validación. La partición de datos es la preservada del Day 2: 15.076 filas de entrenamiento y 3.770 de test, sobre un total de 18.846 anuncios limpios. No se documenta el número de tokens (no aplica), ni el uso de RLHF/DPO (no aplica a un regresor tabular), ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Regresión tabular: estima un valor continuo (alquiler mensual en INR) a partir de 8 campos de entrada (área, BHK, baños, balcones, amueblado, orientación, ubicación y tipo de propiedad).
- Preprocesado integrado: el pipeline `scaler.joblib` gestiona imputación y codificación de las variables de entrada.
- Predicción con suelo en cero: las salidas negativas se truncan a 0.0.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No dispone de modo thinking, visión ni audio.
- No es un modelo generativo: no produce texto, código ni respuestas conversacionales.

## Casos de uso

- Docencia y aprendizaje de pipelines de ML: sirve como ejemplo completo de preprocesado con scikit-learn, definición de red en PyTorch, entrenamiento con Adam y evaluación frente a líneas base, adecuado para cursos introductorios de métodos de IA.
- Reproducción de experimentos académicos: permite replicar la comparación entre mediana, Random Forest y MLP sobre la misma partición de datos, útil para estudiar la diferencia entre modelos lineales y no lineales en datos tabulares.
- Estudio de sesgo y solapamiento de datos: la model card documenta que 752 de 3.770 anuncios de test tienen coincidencia exacta en entrenamiento; el modelo puede emplearse para analizar cómo el solapamiento infla las métricas de un split aleatorio.
- Análisis exploratorio de precios de alquiler en Mumbai: con las cautelas debidas, puede usarse para observar tendencias agregadas sobre anuncios históricos, nunca para valoraciones individuales.
- Prueba de integración de artefactos joblib y state dicts en flujos de Hugging Face Hub: útil para validar la carga de `config.json`, `model.pt` y `scaler.joblib` con `hf_hub_download` y revisiones fijadas.
- Benchmark interno de referencia para regresión tabular: al ser un modelo de 3.649 parámetros, sirve como cota inferior de complejidad frente a modelos más grandes en tareas de regresión de precios.

## Benchmarks y rendimiento

Evaluación sobre la partición de test preservada del Day 2 (3.770 filas). Errores monetarios en INR por mes.

| Modelo | Test MAE | Test RMSE | Test R² |
|---|---:|---:|---:|
| Línea base (mediana) | 67.123,75 | 140.522,95 | -0,0955 |
| Random Forest (Day 2) | 38.044,93 | 82.899,45 | 0,6187 |
| MLP (Day 4) | **38.008,45** | **82.594,83** | **0,6215** |

En las 3.018 filas de test sin coincidencia exacta con entrenamiento, el MAE del MLP es de 41.619,38 INR/mes y el R² de 0,6096. La ventaja del MLP sobre el Random Forest es de aproximadamente 36 INR/mes en MAE, diferencia que la propia model card califica como demasiado pequeña para sostener una superioridad significativa.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; el modelo tiene 3.649 parámetros y el state dict ocupa unos pocos kilobytes.
- GPU recomendadas: no requiere GPU; la inferencia se ejecuta en CPU sin problema. Cualquier GPU (incluso integrada) es suficiente.
- Cabe en cualquier GPU de consumo y en CPU convencional; no hay requisitos de memoria relevantes.
- Opciones de despliegue: inferencia directa con PyTorch (`torch.load` con `weights_only=True`), servido como script Python o integrado en un pipeline de scikit-learn. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible en la información proporcionada; por el tamaño del modelo, la latencia por predicción será del orden de microsegundos a milisegundos en CPU, aunque no se documenta una medición formal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Test MAE (INR/mes) | Test R² | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| MLP Day 4 (este modelo) | 3.649 | no aplica | 38.008,45 | 0,6215 | MIT | Hugging Face |
| Random Forest Day 2 (mismo grupo) | no disponible | no aplica | 38.044,93 | 0,6187 | no disponible | Referenciado en la model card, no publicado como artefacto |
| Línea base mediana | 0 (estadístico) | no aplica | 67.123,75 | -0,0955 | no disponible | No disponible |

No se dispone de información sobre otros modelos comparables de terceros para esta tarea específica.

## Limitaciones y advertencias

- Modelo exclusivamente docente: la model card prohíbe explícitamente su uso para valoraciones actuales, compromisos financieros, selección de inquilinos, acceso a vivienda u otras decisiones consecuentes.
- Datos históricos sin fecha de recogida verificada: los anuncios no son transacciones verificadas ni evidencia del mercado actual.
- Solapamiento train/test: 752 de 3.770 anuncios de test tienen coincidencia exacta de características y objetivo en entrenamiento, lo que puede inflar las métricas del split aleatorio.
- Rendimiento casi idéntico al Random Forest: la diferencia de 36 INR/mes en MAE no justifica afirmar superioridad.
- Errores grandes en combinaciones inusuales de anuncios, documentados en `failure_cases.png`; el modelo no es fiable para propiedades individuales.
- Posibles problemas de calidad de datos: unidades de área inconsistentes, anuncios repetidos o viviendas duplicadas, y alcance geográfico limitado a Mumbai.
- Riesgo de seguridad en la carga de `scaler.joblib`: es un fichero basado en pickle y cargar un pickle malicioso puede ejecutar código; debe cargarse solo desde este repositorio y una revisión de confianza.
- Licencia MIT para el modelo, pero los datos de origen se declaran CC BY 4.0; conviene revisar la atribución del proyecto antes de cualquier uso derivado.
- Idioma: metadatos en inglés; el modelo no procesa texto, por lo que la cobertura multilingüe no aplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day4-group3-mumbai-rent-mlp
- Dataset de origen (Kaggle, Harshal Honde): https://www.kaggle.com/datasets/harshalhonde/property-rental-listings-dataset
- Atribución de datos del proyecto: https://github.com/iaac-maai/group-3-day4-assignment/blob/main/DATA_ATTRIBUTION.md
- Licencia de los datos (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/
- Repositorio del proyecto: https://github.com/iaac-maai/group-3-day4-assignment
