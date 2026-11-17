# crissebasbol/secopedia-beto-unspsc

## Resumen

SECOPEDIA BETO UNSPSC es un modelo de clasificación de texto en castellano desarrollado por crissebasbol como proyecto académico del curso de Procesamiento de Lenguaje Natural de la Pontificia Universidad Javeriana. Se trata de un ajuste fino de BETO (`dccuchile/bert-base-spanish-wwm-uncased`) para predecir el segmento UNSPSC (los dos primeros dígitos del catálogo de bienes y servicios) del objeto de un contrato público colombiano registrado en SECOP II.

El modelo resuelve un problema concreto de la contratación pública: la asignación manual del código UNSPSC por parte de las entidades contratantes, que introduce ruido y errores. Con 29 clases posibles (28 segmentos UNSPSC con al menos 3.000 contratos en el periodo de entrenamiento, más una clase `otros`), el modelo permite automatizar o asistir la categorización de contratos a nivel de segmento.

Arquitectura BERT base (transformer encoder) con 109.873.181 parámetros, contexto limitado a 128 subpalabras y licencia CC BY-SA 4.0. Es relevante para equipos que trabajen con datos abiertos de contratación en Colombia, análisis de gasto público o sistemas de triaje documental en el sector público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, BETO) |
| Parametros totales | 109.873.181 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 subpalabras (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (castellano) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de BETO (`dccuchile/bert-base-spanish-wwm-uncased`), un transformer encoder de tipo BERT base preentrenado con whole word masking sobre corpus en castellano. La cabeza de clasificación se entrena para 29 clases correspondientes a segmentos UNSPSC más la clase `otros`. El contexto de entrada se limita a 128 subpalabras.

Los datos provienen de SECOP II - Contratos Electrónicos (Colombia Compra Eficiente, CC BY-SA 4.0), con contratos firmados desde 2022, excluyendo el tipo "Prestación de servicios" y el código por defecto 801116 (personal temporal), y deduplicados. El conjunto de entrenamiento contiene 105.017 contratos (tope de 4.000 por clase), validación 13.127 y prueba 13.128, todos del periodo 2022-2025; además hay una prueba temporal de 20.000 contratos de 2026 con distribución real. El entrenamiento se realizó durante 3 épocas con tasa de aprendizaje 3e-5, lotes de 32 agrupados por longitud, warmup del 6 % y weight decay de 0,01, conservando la época con mejor F1 macro en validación. Se completó en 57 minutos sobre la GPU de un Apple M4 Pro (MPS). El texto de entrada se normaliza previamente: minúsculas, sin tildes, años como `<AÑO>`, números como `<NUM>` y municipios o departamentos como `<LUGAR>`.

## Capacidades

- Clasificación de texto multietiqueta restringida a una sola etiqueta por instancia: predice el segmento UNSPSC (2 dígitos) del objeto de un contrato público.
- Salida con puntuaciones de probabilidad por clase, lo que permite obtener top-k predicciones (la model card muestra `top_k=3`).
- Clasificación en 29 clases: `14, 15, 25, 30, 41, 42, 43, 44, 46, 47, 50, 53, 56, 60, 70, 72, 77, 78, 80, 81, 82, 83, 84, 85, 86, 90, 93, 95, otros`.
- Procesamiento de texto en castellano de contratos públicos colombianos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.
- No es un modelo generativo: no produce texto, solo etiquetas con puntuación.

## Casos de uso

- Triaje automático de contratos en SECOP II: dado el objeto de un contrato, obtener el segmento UNSPSC probable con top-3 para que un revisor humano confirme la categoría. Adecuado porque el modelo se entrenó específicamente sobre ese dominio y formato.
- Detección de errores de codificación: comparar la predicción del modelo con el código asignado por la entidad para marcar contratos potencialmente mal clasificados antes de auditorías.
- Análisis agregado de gasto público: clasificar grandes volúmenes de contratos históricos para construir series por segmento y detectar cambios en los patrones de contratación entre entidades o periodos.
- Enriquecimiento de datasets abiertos: añadir una columna de segmento UNSPSC predicho a conjuntos de datos de contratación que carezcan de codificación fiable, con la puntuación de confianza asociada.
- Sistemas de alerta temprana en contratación: priorizar contratos con baja confianza o con discrepancia entre la predicción y el código declarado para revisión manual.
- Investigación académica en PLN aplicado al sector público: línea base reproducible para experimentos de clasificación jerárquica de códigos UNSPSC, dado que la model card documenta particiones, hiperparámetros y comparación con una línea base TF-IDF + SVM.
- Asistencia a entidades contratantes: sugerir el segmento UNSPSC al redactar el objeto contractual, reduciendo la dependencia de la selección manual del código.

## Benchmarks y rendimiento

| Partición | Accuracy | F1 macro | Top-3 accuracy |
|---|---|---|---|
| Prueba | 0,679 | 0,667 | 0,871 |
| Prueba temporal (2026) | 0,602 | 0,556 | 0,853 |

Línea base TF-IDF + SVM lineal en prueba: F1 macro 0,659 y top-3 0,845.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~110 M de parámetros; en fp32 ocupa aproximadamente 0,44 GB de pesos, en fp16 ~0,22 GB. Con activaciones y overhead, cabe holgadamente en GPUs de 4 GB o menos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100/H100 para despliegues de alto throughput.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM; también funciona en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (el repo está marcado como compatible con endpoints), y cualquier servidor de inferencia que soporte modelos BERT de `transformers`. No se documentan pesos GGUF ni soporte explícito de llama.cpp/Ollama.
- Latencia y throughput: no disponible en la información proporcionada. El entrenamiento completo (3 épocas sobre 105.017 ejemplos) se realizó en 57 minutos en un Apple M4 Pro (MPS), lo que da una idea del orden de magnitud del coste computacional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crissebasbol/secopedia-beto-unspsc | 109.873.181 | 128 subpalabras | Clasificación UNSPSC (29 clases) | cc-by-sa-4.0 | Hugging Face |
| dccuchile/bert-base-spanish-wwm-uncased (BETO) | ~110 M | 512 subpalabras (BERT base) | Modelo base preentrenado; requiere ajuste para clasificación | no disponible en la información proporcionada | Hugging Face |
| Línea base TF-IDF + SVM lineal (documentada en la model card) | no aplica (no neuronal) | no aplica | Clasificación UNSPSC (29 clases) | no disponible | Repositorio del curso |

No se dispone de información sobre otros modelos comparables específicos para clasificación UNSPSC en castellano o en contratación pública colombiana.

## Limitaciones y advertencias

- Las etiquetas originales de SECOP II tienen ruido: las entidades eligen el código manualmente y a veces se equivocan, por lo que parte del error medido es error de etiqueta, no del modelo.
- El rendimiento baja en contratos recientes: la prueba temporal de 2026 cae a accuracy 0,602 y F1 macro 0,556 frente a 0,679 y 0,667 en prueba, por cambios en lo que contratan las entidades.
- Solo predice el segmento (2 dígitos), no el código UNSPSC completo; para códigos de mayor granularidad se necesitaría un modelo o etapa adicional.
- La entrada esperada es texto normalizado (minúsculas, sin tildes, años como `<AÑO>`, números como `<NUM>`, lugares como `<LUGAR>`); con texto sin normalizar puede rendir algo menos.
- Contexto limitado a 128 subpalabras: objetos contractuales largos pueden truncarse y perder información relevante.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia (share-alike), lo que puede condicionar su integración en productos propietarios.
- Riesgo de alucinación en sentido estricto no aplica (no es generativo), pero sí de clasificaciones erróneas con alta confianza; se recomienda usar top-k y umbrales de confianza en producción.
- El modelo está entrenado exclusivamente con datos de contratación pública colombiana; su uso fuera de ese dominio o país no está validado.
- Sesgos potenciales derivados de la distribución de los datos de SECOP II (entidades, regiones, tipos de contrato sobrerrepresentados) no documentados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crissebasbol/secopedia-beto-unspsc
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-uncased
- Dataset SECOP II - Contratos Electrónicos: https://www.datos.gov.co/Estad-sticas-Nacionales/SECOP-II-Contratos-Electr-nicos/jbjy-vk9h
