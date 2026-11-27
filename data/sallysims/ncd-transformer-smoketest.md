# SallySims/ncd-transformer-smoketest

## Resumen

NCD Transformer (WHO STEPS) es una colección de cuatro adaptadores LoRA entrenados sobre el modelo base Qwen/Qwen2.5-0.5B, publicada por el usuario SallySims en Hugging Face. El modelo está especializado en datos tabulares de epidemiología de enfermedades no transmisibles (NCD), concretamente en encuestas WHO STEPS armonizadas de 13 países. Cada adaptador cubre una tarea distinta: generación de encuestados sintéticos, predicción directa de biomarcadores, reconstrucción inversa de perfiles sociodemográficos y análisis contrafactual de asociaciones.

El modelo resuelve un problema concreto en salud pública computacional: la escasez de datos sintéticos realistas y la necesidad de explorar asociaciones entre factores de riesgo y resultados biomédicos sin acceso a microdatos sensibles. Al estar construido sobre un modelo de lenguaje de 0,5 mil millones de parámetros con adaptadores LoRA, el coste computacional es bajo y puede ejecutarse en hardware modesto, lo que facilita su uso en investigación y docencia.

Es relevante ahora porque los datos de encuestas poblacionales son escasos, costosos de recoger y están sujetos a restricciones de privacidad. Un generador de datos sintéticos con métricas de fidelidad publicadas (distancia KS de 0,10, error de matriz de correlación de 0,13, cero copias exactas de registros reales) permite aumentar muestras, probar pipelines analíticos y realizar análisis exploratorios sin comprometer datos personales. No obstante, el modelo es un smoketest con solo 600 ejemplos de entrenamiento por adaptador y una época, por lo que sus capacidades son limitadas y sus resultados deben interpretarse con cautela.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B) con adaptadores LoRA |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona `load_in_4bit=True` con bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-0.5B, un transformer decoder-only de 0,5 mil millones de parámetros. Sobre él se entrenaron cuatro adaptadores LoRA independientes mediante la librería PEFT. Cada adaptador se especializa en una tarea tabular concreta: generación de población sintética (part1), predicción directa de biomarcadores (part2), reconstrucción inversa de fenotipos (part3) y análisis contrafactual (part4). Los datos de entrenamiento provienen de archivos STEPS de uso público del repositorio de microdatos de la OMS, armonizados de 13 países (LCA, LKA, LSO, MAR, MHL, MMR, MNG, MWI, NPL, NRU, PLW, QAT, RWA), con NPL y LSO reservados como conjuntos de prueba por país completo.

Cada adaptador se entrenó con 600 ejemplos durante una sola época. Las pérdidas de validación reportadas son 0,313 (part1), 0,230 (part2), 0,390 (part3) y 0,231 (part4). No se menciona uso de RLHF, DPO ni decodificación especulativa. La innovación principal no es arquitectónica sino de aplicación: el uso de un LLM pequeño con LoRA para modelar datos tabulares de encuestas epidemiológicas, incluyendo la capacidad de escribir "not recorded" cuando una variable no fue recogida en una encuesta concreta. Las filas de entrenamiento no están ponderadas por los pesos de muestreo de las encuestas, lo que constituye una decisión de diseño explícita con implicaciones sobre la representatividad poblacional.

## Capacidades

- Generación de encuestados sintéticos completos a partir de contexto de país y año (part1), con una tasa de filas con todos los campos generados de 0,97.
- Predicción directa de presión arterial sistólica y diastólica, glucosa en ayunas, colesterol total e historia de hipertensión o glucosa elevada (part2).
- Reconstrucción inversa de perfil: a partir de biomarcadores e historia clínica, generar sociodemografía, factores de riesgo y antropometría (part3).
- Análisis contrafactual de asociaciones: dado un perfil basal y un cambio en una variable (`weight_kg`, `current_smoker` o `met_min_week`), devolver los resultados de un encuestado emparejado (part4).
- Manejo explícito de valores ausentes estructurales: escribe "not recorded" para medidas no recogidas en una encuesta concreta.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de datos sintéticos para pruebas de pipelines analíticos: el adaptador part1 permite crear cohortes sintéticas de encuestados con distribuciones realistas (distancia KS media de 0,10) para validar código de limpieza, imputación y análisis sin exponer microdatos reales.
- Análisis exploratorio de asociaciones riesgo-resultado: el adaptador part4 permite simular escenarios "qué pasaría si" cambiando peso, tabaquismo o actividad física, útil para generar hipótesis en estudios observacionales antes de un análisis formal.
- Docencia en epidemiología y salud pública: los cuatro adaptadores permiten construir ejercicios prácticos sobre predicción de biomarcadores, reconstrucción de perfiles y análisis contrafactual con datos que no comprometen la privacidad de los encuestados.
- Aumento de datos para modelos predictivos: las muestras sintéticas generadas pueden usarse para preentrenar o aumentar modelos de riesgo cardiovascular en contextos con pocos datos reales, siempre que se valide la fidelidad de las distribuciones.
- Armonización y control de calidad de encuestas: el adaptador part3 puede usarse para detectar inconsistencias entre sociodemografía, factores de riesgo y biomarcadores en nuevos conjuntos de datos STEPS, señalando registros atípicos.
- Prototipado rápido de aplicaciones de salud pública: al ejecutarse sobre un modelo de 0,5 mil millones de parámetros con adaptadores LoRA, permite desplegar demos interactivas en hardware modesto (incluso CPU o GPU consumer) para explorar perfiles de riesgo de forma sintética.

## Benchmarks y rendimiento

Parte 2, predicción directa (error absoluto medio, menor es mejor):

| Objetivo | Países vistos: modelo | baseline | Países no vistos: modelo | baseline |
|---|---|---|---|---|
| Presión sistólica (mmHg) | 15,47 | 12,31 | 15,62 | 12,74 |
| Presión diastólica (mmHg) | 10,33 | 8,37 | 11,78 | 8,39 |
| Glucosa en ayunas (mmol/L) | 1,28 | 1,16 | 0,84 | 0,87 |
| Colesterol total (mmol/L) | 0,97 | 0,82 | 0,90 | 0,83 |

Parte 3, reconstrucción inversa:

| Métrica | Países vistos | Países no vistos |
|---|---|---|
| MAE de edad, modelo (años) | 13,76 | 14,56 |
| MAE de edad, predecir la mediana | 11,38 | 11,93 |
| Exactitud de sexo, modelo | 0,64 | 0,64 |
| Exactitud de sexo, clase mayoritaria | 0,64 | 0,64 |

Parte 4, asociaciones de encuestados emparejados (presión sistólica):

| Métrica | Países vistos | Países no vistos |
|---|---|---|
| Signo de la diferencia predicha coincide con el observado | 0,69 | 0,74 |

Parte 1, encuestados sintéticos:

| Métrica | Valor |
|---|---|
| Filas con todos los campos generados | 0,97 |
| Distancia KS media a encuestados reales (menor es mejor) | 0,10 |
| Error absoluto medio de la matriz de correlación | 0,13 |
| Copias exactas de encuestados de entrenamiento | 0,0 |
| Distancia al registro más cercano, sintético / holdout real | 1,19 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base tiene 0,5 mil millones de parámetros; en fp16 requiere aproximadamente 1 GB solo para pesos, más overhead de activaciones y del adaptador LoRA. Con `load_in_4bit=True` (bitsandbytes) el consumo se reduce sustancialmente.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para el modelo base en precisión reducida; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no se confirma en la documentación.
- Opciones de despliegue: `transformers` + `peft` + `accelerate`; se menciona `bitsandbytes` para cuantización 4-bit. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un smoketest especializado en datos tabulares epidemiológicos y no tiene equivalentes directos documentados en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NCD Transformer (WHO STEPS) | 0,5 mil millones (base) | no disponible | other | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- STEPS es un diseño transversal: el adaptador part4 reproduce asociaciones entre encuestados similares, no estima efectos causales ni modela riesgo de seguimiento.
- Las filas de entrenamiento no están ponderadas por los pesos de muestreo de las encuestas, por lo que las salidas reflejan las muestras, no las poblaciones nacionales.
- La presión arterial elevada y la glucosa elevada se derivan de mediciones y no se generan intencionadamente; deben calcularse a partir de los valores generados.
- Glucosa y colesterol están en mmol/L, armonizados desde unidades mixtas en los archivos fuente; algunas encuestas no recogieron ciertas medidas (por ejemplo, cintura en Islas Marshall y Palaos) y el modelo escribe "not recorded".
- No apto para uso clínico: las salidas son sintéticas y pueden ser erróneas.
- El modelo es un smoketest con solo 600 ejemplos por adaptador y una época de entrenamiento; el rendimiento en predicción directa es inferior al baseline de gradient boosting en presión arterial y colesterol, y en reconstrucción inversa no supera a predecir la mediana en edad ni a la clase mayoritaria en sexo.
- Riesgo de alucinación: no documentado explícitamente, pero inherente a un modelo de lenguaje pequeño entrenado con pocos datos.
- Sesgos conocidos: no documentados explícitamente, aunque la falta de ponderación por muestreo y la cobertura de solo 13 países introducen sesgos de representatividad.
- Restricciones de licencia: licencia "other", sin detalles adicionales sobre uso comercial en la información disponible.
- Es necesario citar la fuente de datos (WHO NCD Microdata Repository) y a los propietarios de las encuestas nacionales.

## Enlaces

- Hugging Face: https://huggingface.co/SallySims/ncd-transformer-smoketest
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio de microdatos de la OMS (WHO NCD Microdata Repository): no disponible como enlace directo en la información proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
