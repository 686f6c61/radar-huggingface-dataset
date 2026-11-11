# nzokira/distilhubert-finetuned-gtzan

## Resumen

distilhubert-finetuned-gtzan es un modelo de clasificación de audio obtenido mediante fine-tuning de ntu-spml/distilhubert sobre el conjunto de datos GTZAN, un corpus de referencia para la clasificación de géneros musicales. Lo publica el usuario nzokira en Hugging Face y su propósito es asignar una etiqueta de género musical a un fragmento de audio. El modelo se generó con la librería Trainer de Transformers, lo que se refleja en una model card automática con información mínima sobre usos previstos y limitaciones.

La relevancia de este modelo es acotada: se trata de un artefacto de fine-tuning con 23,69 millones de parámetros, una sola época de entrenamiento y un accuracy declarado de 0,8 sobre el conjunto de evaluación de GTZAN. No incorpora innovaciones arquitectónicas propias; hereda la arquitectura HuBERT destilada de su modelo base y la adapta a una tarea de clasificación de 10 clases. Resulta útil como referencia reproducible o como punto de partida para experimentos de clasificación musical, pero no como modelo de producción sin una validación adicional.

El contexto de uso es el de un modelo pequeño, ligero (repo de 0,1 GB) y con licencia Apache 2.0, lo que facilita su despliegue en entornos con recursos limitados. Ahora bien, la falta de documentación sobre el proceso de entrenamiento, la composición exacta del dataset y las limitaciones conocidas exige precaución antes de integrarlo en un sistema real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT destilada (transformer de codificación de habla/audio, base ntu-spml/distilhubert) |
| Parametros totales | 23.691.402 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada definida por la extracción de features, no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | no disponible (tarea de audio, no lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ntu-spml/distilhubert, una versión destilada de HuBERT orientada a representaciones de audio. HuBERT es un transformer que aprende representaciones auto-supervisadas a partir de unidades acústicas discretas; la variante destilada reduce el coste computacional manteniendo la capacidad de extraer features útiles para tareas downstream. Sobre esta base se añade una cabeza de clasificación para las 10 clases de género de GTZAN.

El fine-tuning se realizó con los siguientes hiperparámetros declarados en la model card: learning rate de 5e-05, batch size de 4 en entrenamiento y evaluación, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 10 pasos de warmup, una única época, precisión mixta nativa (AMP) y 225 pasos de entrenamiento. El resultado reportado es una pérdida de validación de 0,6295 y un accuracy de 0,8. No se documenta el número de tokens de audio, la composición del dataset más allá de la referencia a marsyas/gtzan, ni si hubo técnicas de aumento de datos o regularización adicionales. Tampoco se especifica el proceso de destilación heredado ni detalles sobre la tokenización de audio empleada.

## Capacidades

- Clasificación de audio en 10 clases de género musical (el etiquetado concreto de las clases no está documentado en la model card, pero corresponde al esquema estándar de GTZAN).
- Extracción de representaciones de audio mediante el encoder HuBERT destilado subyacente.
- Inferencia ligera: 23,69 millones de parámetros permiten ejecución en CPU y GPU de gama baja.
- Integración con el pipeline `audio-classification` de Transformers.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en sentido lingüístico; procesa audio, no texto.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Clasificación automática de géneros musicales en bibliotecas personales: el modelo asigna una etiqueta de género a cada pista, lo que permite organizar colecciones de audio con un coste computacional mínimo gracias a sus 23,69 millones de parámetros.
- Etiquetado de datasets musicales: sirve como preetiquetador para corpus de audio antes de una revisión humana, reduciendo el trabajo manual en proyectos de anotación.
- Filtrado y recomendación básica: en un sistema de recomendación sencillo, la etiqueta de género predicha puede alimentar reglas de similitud entre pistas.
- Prototipado rápido en investigación: al ser un fine-tuning reproducible sobre GTZAN con hiperparámetros documentados, resulta útil como línea base para comparar experimentos de clasificación musical.
- Análisis de emisiones de radio o podcasts: segmentar y clasificar fragmentos musicales dentro de contenido hablado para generar metadatos automáticos.
- Educación y demos: modelo de tamaño reducido adecuado para talleres y demostraciones de clasificación de audio en entornos con recursos limitados, incluida la ejecución en CPU.
- Moderación o catalogación de contenido en plataformas pequeñas: clasificación de audio subido por usuarios para enrutarlo a la categoría musical correspondiente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Audio Classification | GTZAN (marsyas/gtzan) | Accuracy | 0,8 |
| Audio Classification | GTZAN (marsyas/gtzan) | Validation loss | 0,6295 |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparación con modelos alternativos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (23,69 millones de parámetros, aproximadamente 95 MB de pesos) y en torno a 50 MB en fp16; el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; funciona sin problema en GTX 1650, RTX 3060, RTX 4090, A100 o H100. Para este tamaño, la GPU no es un cuello de botella.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: pipeline `audio-classification` de Transformers, TorchServe o un servidor FastAPI propio. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a este tipo de clasificador.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de milisegundos por fragmento en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distilhubert-finetuned-gtzan (este) | 23,69 M | no disponible | Accuracy 0,8 en GTZAN (declarado) | Apache 2.0 | Hugging Face |
| ntu-spml/distilhubert (base) | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face |
| Alternativas de clasificación musical | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Model card generada automáticamente: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento están sin completar ("More information needed").
- Entrenamiento de una sola época: el accuracy de 0,8 puede no reflejar el mejor rendimiento alcanzable y sugiere que el modelo está infraentrenado o que el dataset es pequeño.
- El resultado de accuracy (0,8) está declarado por el autor y marcado como no verificado; no se ha reproducido de forma independiente.
- No se documenta el esquema de etiquetas de las 10 clases, lo que dificulta interpretar las predicciones sin consultar el dataset GTZAN.
- GTZAN es un dataset conocido por problemas de duplicados y etiquetas ruidosas; el rendimiento real en audio fuera de distribución puede ser inferior al reportado.
- Riesgo de sesgo hacia los géneros sobrerrepresentados en GTZAN y hacia las características acústicas de las grabaciones del dataset (época, calidad, estilo).
- Sin información sobre el preprocesado de audio (sample rate, duración de los fragmentos, normalización), lo que complica la reproducibilidad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset y el proceso de entrenamiento traslada al usuario la responsabilidad de validar el modelo.
- No apto para tareas de lenguaje, visión ni generación; su alcance se limita a la clasificación de audio en las 10 clases de GTZAN.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nzokira/distilhubert-finetuned-gtzan
- Modelo base: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
- Librería Transformers: https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
