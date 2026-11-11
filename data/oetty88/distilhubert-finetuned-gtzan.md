# oetty88/distilhubert-finetuned-gtzan

## Resumen

distilhubert-finetuned-gtzan es un modelo de clasificación de audio obtenido mediante fine-tuning de ntu-spml/distilhubert sobre el conjunto de datos GTZAN, un corpus de referencia para la clasificación de géneros musicales. Lo publica el usuario oetty88 en Hugging Face y sigue el pipeline estándar de Transformers para audio-classification. Su relevancia es acotada: se trata de un experimento de ajuste con una sola época de entrenamiento, no de un modelo de producción.

El modelo parte de DistilHuBERT, una versión destilada de HuBERT que reduce el tamaño y el coste computacional del transformer original manteniendo parte de su capacidad de representación de audio. Con 23.691.402 parámetros totales y un repositorio de 0,1 GB, está pensado para tareas de inferencia ligera en entornos con recursos limitados.

La model card es autocontenida y generada automáticamente por el Trainer de Hugging Face: no incluye descripción del modelo, usos previstos ni análisis de limitaciones. El autor declara una precisión de 0,8 sobre el conjunto de evaluación de GTZAN, pero el dato no está verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de audio (HuBERT destilado, DistilHuBERT) |
| Parametros totales | 23.691.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de Transformers, no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilHuBERT (ntu-spml/distilhubert), una destilación de HuBERT orientada a representaciones de audio auto-supervisadas. HuBERT emplea un transformer que procesa características acústicas enmascaradas y aprende representaciones latentes; la variante destilada reduce el número de capas y parámetros para abaratar la inferencia. El modelo resultante se usa aquí como extractor de características para clasificación de género musical.

El ajuste se realizó sobre el dataset marsyas/gtzan con los siguientes hiperparámetros declarados por el autor: learning rate 5e-05, batch de entrenamiento y evaluación de 4, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 10 pasos de warmup, una sola época y precisión mixta nativa (AMP). El entrenamiento constó de 225 pasos y alcanzó una pérdida de validación de 0,6295 con precisión de 0,8. No se documenta el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un clasificador de audio).

## Capacidades

- Clasificación de audio en 10 clases de género musical, correspondientes a las etiquetas de GTZAN (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock).
- Extracción de representaciones de audio mediante el encoder DistilHuBERT subyacente.
- Inferencia ligera: 23,7 millones de parámetros permiten ejecución en CPU y GPU de gama baja.
- Integración con el pipeline `audio-classification` de Transformers.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües en el sentido textual; el dominio es audio musical.
- No incorpora modo thinking, visión ni audio generativo.

## Casos de uso

- Clasificación automática de géneros musicales en bibliotecas personales: el modelo recibe un fragmento de audio y devuelve la etiqueta de género, lo que permite organizar colecciones sin metadatos manuales.
- Etiquetado de catálogos en plataformas de streaming o radio online: útil para enriquecer metadatos de pistas con género estimado, siempre que se acepte la precisión declarada de 0,8.
- Prototipado rápido de sistemas de recomendación musical: el clasificador sirve como componente inicial para filtrar por género antes de aplicar modelos más costosos.
- Investigación académica sobre clasificación de audio: punto de partida reproducible (semilla 42, hiperparámetros documentados) para comparar con otros fine-tunings de DistilHuBERT sobre GTZAN.
- Filtrado de contenido en aplicaciones de DJ o creación de playlists: agrupación automática de temas por género para generar listas temáticas.
- Educación y demos de Transformers para audio: ejemplo mínimo de fine-tuning de un modelo de audio con el Trainer de Hugging Face, adecuado para talleres y tutoriales.
- Análisis de corpus musicales a pequeña escala: clasificación por lotes en entornos sin GPU dedicada gracias al reducido tamaño del modelo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Audio Classification | GTZAN (marsyas/gtzan) | Accuracy | 0,80 |
| Audio Classification | GTZAN (marsyas/gtzan) | Loss (validacion) | 0,6295 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,1 GB para los pesos (23,7 M de parámetros), más overhead de activaciones y del pipeline de audio; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16: aproximadamente la mitad, por debajo de 0,1 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100); el modelo no requiere aceleradores de gama alta.
- Cabe en GPU consumer y también en CPU para inferencia por lotes de tamaño moderado.
- Opciones de despliegue: pipeline `audio-classification` de Transformers, inferencia con PyTorch, exportación a ONNX no documentada por el autor, integración en endpoints de Hugging Face (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en GTZAN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oetty88/distilhubert-finetuned-gtzan | 23,7 M | no disponible | Accuracy 0,80 (declarada) | apache-2.0 | Hugging Face |
| ntu-spml/distilhubert (base) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Alternativas de clasificacion de genero musical | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con otros clasificadores de género musical.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta usos previstos, sesgos ni limitaciones; el autor no ha completado esas secciones.
- El resultado de precisión (0,8) procede de una única época de entrenamiento y no ha sido verificado de forma independiente; puede no generalizar a grabaciones fuera de la distribución de GTZAN.
- GTZAN es un dataset pequeño y con problemas conocidos de etiquetado y duplicados; el rendimiento real en producción puede diferir del reportado.
- Riesgo de alucinación en el sentido de asignar un género a audio que no pertenece a ninguna de las 10 clases (ruido, voz, efectos), sin mecanismo de abstención.
- Modelo limitado al dominio musical occidental representado en GTZAN; no cubre géneros regionales ni música no occidental.
- No hay información sobre sesgos demográficos o culturales más allá de la composición del dataset.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo con datos propios antes de desplegarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oetty88/distilhubert-finetuned-gtzan
- Modelo base DistilHuBERT: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/marsyas/gtzan
