# Sincronizee/distilhubert-finetuned-gtzan

## Resumen

distilhubert-finetuned-gtzan es un modelo de clasificación de audio obtenido mediante ajuste fino (fine-tuning) de ntu-spml/distilhubert sobre el conjunto de datos GTZAN, un benchmark clásico de clasificación de géneros musicales compuesto por 1000 fragmentos de audio de 30 segundos distribuidos en 10 géneros. El autor del ajuste es el usuario de Hugging Face Sincronizee, y el modelo se publica bajo licencia Apache 2.0.

El modelo hereda la arquitectura HuBERT destilada, un transformer diseñado originalmente para representaciones auto-supervisadas del habla, con 23,7 millones de parámetros. Se distribuye en formato safetensors dentro de la librería transformers y su pipeline declarado es `audio-classification`. Su relevancia práctica es acotada: se trata de un experimento de ajuste con una sola época de entrenamiento, orientado a demostrar la viabilidad de reutilizar representaciones de habla para tareas musicales, no de un modelo listo para producción.

La model card es en gran medida autogenerada por el Trainer de Hugging Face y deja sin documentar secciones clave como la descripción del modelo, los usos previstos, las limitaciones o la composición de los datos de entrenamiento. Esto condiciona cualquier evaluación seria: la única métrica disponible es una accuracy de 0,8 declarada por el autor y no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer HuBERT destilado (distilhubert) |
| Parametros totales | 23.691.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de audio, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de ntu-spml/distilhubert, una versión destilada de HuBERT que reduce el coste computacional manteniendo la capacidad de extraer representaciones acústicas. Sobre esa base se aplica una cabeza de clasificación para las 10 clases de género musical de GTZAN. El proceso de ajuste se realizó con el Trainer de Hugging Face: learning rate de 5e-05, batch size de 4 (entrenamiento y evaluación), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 10 pasos de calentamiento, una única época, semilla 42 y precisión mixta nativa (AMP). El entrenamiento se detuvo en el paso 225.

No se documenta el número de tokens de audio procesados, la composición exacta del dataset más allá de la referencia a marsyas/gtzan, ni si hubo técnicas de aumento de datos o regularización. Tampoco se especifica la estrategia de destilación original de distilhubert ni detalles de la innovación técnica más allá de la herencia del modelo base. La información disponible no permite evaluar la calidad del ajuste ni la reproducibilidad del resultado.

## Capacidades

- Clasificación de audio en 10 categorías de género musical (el modelo no especifica la lista de etiquetas en la información disponible, pero GTZAN comprende blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock).
- Extracción de representaciones acústicas intermedias mediante el encoder HuBERT destilado.
- Inferencia sobre fragmentos de audio, presumiblemente de 30 segundos según el formato habitual de GTZAN.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador discriminativo, no un modelo generativo.
- No dispone de capacidades multilingües en sentido textual; opera sobre señal de audio.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Prototipado de clasificación de géneros musicales: sirve como línea base rápida para validar pipelines de etiquetado automático de catálogos musicales antes de invertir en modelos mayores.
- Etiquetado de bibliotecas musicales pequeñas: con 23,7 millones de parámetros y un repo de 0,1 GB, puede ejecutarse en CPU para clasificar lotes reducidos de canciones en 10 géneros.
- Docencia y experimentación académica: útil como ejemplo de ajuste fino de un encoder de audio con el Trainer de Hugging Face, dado lo mínimo del setup (una época, batch 4).
- Investigación en transferencia habla-música: permite estudiar hasta qué punto representaciones preentrenadas en habla (HuBERT) discriminan contenido musical.
- Filtrado previo en sistemas de recomendación: como clasificador barato para separar géneros antes de aplicar modelos de ranking más costosos.
- Pruebas de integración en pipelines de `transformers`: valida el flujo `pipeline("audio-classification")` con pesos safetensors en entornos de CI.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Audio Classification | GTZAN (marsyas/gtzan) | Accuracy | 0,8 | No |
| Audio Classification | GTZAN (marsyas/gtzan) | Loss (evaluacion) | 0,6295 | No |

Los datos proceden de la model card y del model-index del autor. No se han publicado resultados adicionales (F1, precisión por clase, matriz de confusión) en la información disponible. La accuracy de 0,8 con una sola época sugiere un ajuste limitado; conviene tratar el valor con cautela al no estar verificado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 23,7 millones de parámetros (unos 95 MB de pesos); en fp16 aproximadamente 50 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1650 e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con pipeline de audio-classification; exportación a ONNX no documentada; compatibilidad con endpoints de Hugging Face declarada en los tags.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Accuracy GTZAN |
|---|---|---|---|---|---|
| Sincronizee/distilhubert-finetuned-gtzan | 23,7 M | no disponible | Clasificacion de genero | Apache 2.0 | 0,8 (no verificado) |
| ntu-spml/distilhubert | no disponible | no disponible | Representaciones de audio | Apache 2.0 | no aplica (modelo base) |
| facebook/hubert-base-ls960 | no disponible | no disponible | Representaciones de habla | no disponible | no disponible |

No se dispone de datos comparativos de otros ajustes sobre GTZAN en la información proporcionada. La comparación con alternativas específicas de clasificación musical (por ejemplo, modelos basados en MERT o MusicGen) no está disponible.

## Limitaciones y advertencias

- La model card está autogenerada y carece de secciones de usos previstos, limitaciones y descripción de datos; no hay documentación del autor sobre el proceso.
- La accuracy de 0,8 no está verificada y procede de una única época de entrenamiento, lo que sugiere posible infraajuste o resultados inestables.
- GTZAN es un dataset conocido por sus problemas de calidad (fragmentos duplicados, ruido, desbalanceo entre géneros); el rendimiento real en audio fuera de distribución puede degradarse notablemente.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado en habla, puede presentar sesgos hacia características acústicas del habla que no se transfieren bien a música.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en fragmentos ambiguos o de géneros mixtos.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación y verificación desaconseja su uso en producción sin una evaluación propia.
- No se especifican los idiomas ni la cobertura geográfica del audio de entrenamiento; la clasificación de géneros es culturalmente dependiente.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sincronizee/distilhubert-finetuned-gtzan
- Modelo base: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/marsyas/gtzan
- Documentación de HuBERT (paper original): no disponible en la información proporcionada
- Repositorio de transformers: https://github.com/huggingface/transformers
