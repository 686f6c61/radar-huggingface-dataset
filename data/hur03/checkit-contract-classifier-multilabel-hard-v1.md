# hur03/checkit-contract-classifier-multilabel-hard-v1

## Resumen

CheckIt Contract Classifier Multilabel Hard v1 es un modelo de clasificación de texto multi-etiqueta desarrollado por el usuario hur03, orientado a la detección de cláusulas en contratos laborales en coreano. Se construye sobre una arquitectura RoBERTa con 110,6 millones de parámetros y una ventana de entrada máxima de 256 tokens, y predice hasta diez etiquetas temáticas por cláusula usando umbrales fijos de 0,5 definidos en el fichero `labels.json`. El modelo no evalúa legalidad ni recupera artículos normativos: su función es puramente taxonómica sobre el texto de la cláusula.

Técnicamente es un ajuste fino (fine-tuning) de un modelo previo del mismo autor, `hur03/checkit-contract-classifier-core-synthetic-3epoch-v2`, fijado en la revisión `1accf527c060396c5801b044e2cebf8bedb5ac12`, al que se añade un epoch adicional sobre una combinación del conjunto original y un conjunto sintético de refuerzo multi-etiqueta, totalizando 4.796 cláusulas de entrenamiento. La tasa de aprendizaje es 5e-6, el tamaño de lote 16 y la semilla 42.

El interés del modelo reside en su enfoque de refuerzo específico sobre casos multi-etiqueta, un escenario habitualmente infrarepresentado en clasificadores de cláusulas. Según la model card, la coincidencia exacta en cláusulas con dos etiquetas en el nuevo conjunto sintético pasa de 6/60 a 54/60 respecto al modelo anterior. No obstante, todas las evaluaciones se realizan sobre datos sintéticos y no verificados por expertos legales, por lo que las cifras no deben extrapolarse a contratos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parámetros totales | 110.625.802 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de entrada |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder RoBERTa con cabeza de clasificación multi-etiqueta, derivado por ajuste fino de un checkpoint previo del mismo autor. La entrada es el cuerpo de la cláusula truncado a 256 tokens y la salida es un vector de probabilidades sobre diez etiquetas temáticas, con umbral de decisión fijo de 0,5 por etiqueta, lo que permite devolver varias etiquetas simultáneas para una misma cláusula.

El entrenamiento parte de la revisión fijada del modelo `core-synthetic-3epoch-v2` y añade un epoch sobre 4.796 cláusulas, resultado de combinar el conjunto base con un conjunto sintético de refuerzo multi-etiqueta. Los hiperparámetros declarados son tasa de aprendizaje 5e-6, tamaño de lote 16 y semilla 42. La model card no detalla la composición del dataset, el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones arquitectónicas adicionales más allá del ajuste fino del encoder.

## Capacidades

- Clasificación multi-etiqueta de cláusulas de contratos laborales en coreano, con hasta diez etiquetas temáticas por cláusula.
- Predicción simultánea de varias etiquetas mediante umbrales independientes de 0,5 por etiqueta.
- Procesamiento de textos de hasta 256 tokens, suficiente para el cuerpo de una cláusula individual.
- Especialización en casos multi-etiqueta, con refuerzo explícito sobre cláusulas que llevan dos etiquetas.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- Capacidad monolingüe: únicamente coreano.

## Casos de uso

- Triaje de contratos laborales: procesar cada cláusula de un contrato y asignar etiquetas temáticas para que un revisor humano priorice las secciones que requieren atención, aprovechando la clasificación multi-etiqueta para cláusulas que abordan varios temas a la vez.
- Indexación y búsqueda por temática: generar metadatos temáticos sobre un corpus de contratos para permitir búsquedas filtradas por tipo de cláusula en un repositorio documental interno.
- Extracción estructurada previa a pipelines de análisis: usar las etiquetas como señal de enrutamiento hacia módulos posteriores (por ejemplo, un extractor de fechas o de importes) según el tipo de cláusula detectado.
- Control de calidad documental: comparar las etiquetas predichas con las esperadas en plantillas internas para detectar cláusulas ausentes o mal categorizadas antes de la firma.
- Anonimización y enmascarado selectivo: identificar cláusulas de una categoría concreta (por ejemplo, retribución o jornada) para aplicar reglas de redacción específicas antes de compartir documentos.
- Investigación y anotación asistida: preetiquetar grandes volúmenes de cláusulas sintéticas o reales para acelerar la anotación humana, dado que el modelo devuelve varias etiquetas por cláusula y reduce el trabajo manual inicial.

## Benchmarks y rendimiento

Resultados declarados en la model card, comparando el modelo anterior y este modelo sobre conjuntos sintéticos:

| Evaluación | Modelo anterior | Este modelo |
|---|---:|---:|
| Nuevas 12 contratos sintéticos, 120 cláusulas, coincidencia exacta | 64/120 | 113/120 |
| Mismas cláusulas con dos etiquetas (60), coincidencia exacta | 6/60 | 54/60 |
| Test core existente (446), coincidencia exacta | 374/446 | 376/446 |
| PDF sintéticos existentes (478), coincidencia exacta | 457/478 | 468/478 |
| PDF sintéticos existentes, subconjunto de etiqueta única (461), coincidencia exacta | 457/461 | 451/461 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores corresponden a conjuntos sintéticos y etiquetas provisionales, no verificadas por expertos legales independientes.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB solo para pesos (110,6 M de parámetros), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB en FP32 y del orden de 0,25 GB en FP16.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores; también en CPU para volúmenes moderados.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes; para desarrollo y pruebas, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (TEI) y ONNX Runtime; el formato safetensors es compatible con la librería transformers. No se documenta soporte específico para vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo (encoder de 110 M de parámetros y 256 tokens de entrada), se espera una latencia de milisegundos por cláusula en GPU y de decenas de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---:|---:|---|---|---|
| hur03/checkit-contract-classifier-multilabel-hard-v1 | 110,6 M | 256 tokens | ko | no disponible | Clasificación multi-etiqueta de cláusulas laborales; evaluación solo sintética |
| hur03/checkit-contract-classifier-core-synthetic-3epoch-v2 | no disponible | no disponible | ko | no disponible | Modelo base del que deriva; peor rendimiento en casos multi-etiqueta según la model card |
| RoBERTa-base (modelo genérico) | 125 M | 512 tokens | en (principalmente) | MIT | No especializado en cláusulas ni en coreano; requeriría ajuste fino |
| Klue/RoBERTa coreano (modelo genérico) | ~110 M | 512 tokens | ko | no disponible | Base genérica para coreano; sin cabeza de clasificación de cláusulas |

No se dispone de información sobre otros clasificadores de cláusulas contractuales en coreano comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no determina legalidad ni recupera artículos normativos; cualquier uso como validador jurídico es inadecuado.
- Todas las evaluaciones se realizan sobre datos sintéticos; la model card advierte explícitamente de que las cifras no representan el rendimiento sobre contratos reales.
- Las etiquetas de referencia del nuevo conjunto fueron fijadas antes de la predicción, pero no fueron revisadas por expertos legales independientes; las etiquetas de los PDF existentes son provisionales y algunas se corrigieron tras análisis de errores.
- El rendimiento en cláusulas de etiqueta única sobre PDF sintéticos empeora respecto al modelo anterior (451/461 frente a 457/461), lo que indica un posible compromiso entre precisión multi-etiqueta y mono-etiqueta.
- Modelo monolingüe en coreano; no se ha validado su comportamiento en otros idiomas.
- Ventana de entrada limitada a 256 tokens; cláusulas más largas se truncan y pueden perder información relevante.
- Licencia no disponible: no se puede confirmar la legalidad de un uso comercial sin consultar al autor.
- Riesgo de alucinación de etiquetas inherente a la clasificación multi-etiqueta con umbral fijo de 0,5; no se documenta calibración por etiqueta.
- Sin datos publicados sobre sesgos, robustez ante variaciones de formato o rendimiento en dominios distintos del sintético.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hur03/checkit-contract-classifier-multilabel-hard-v1
- Modelo base: https://huggingface.co/hur03/checkit-contract-classifier-core-synthetic-3epoch-v2
- Repositorio de datos y código: https://github.com/CHECKIT-AI/CHECKIT_DATA
- Informe de evaluación multi-etiqueta: `Classifier/reports/multilabel_hard_20261116.md` (dentro del repositorio anterior)
- Informe de prueba de estilo contractual: `Classifier/reports/contract_style_trial_20261116.md` (dentro del repositorio anterior)
