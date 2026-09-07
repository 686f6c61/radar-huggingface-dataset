# Shota2811/HackHeritage26-voice-stress-v1

## Resumen

El modelo **HackHeritage26 Voice Stress V1** es un prototipo de clasificación de estrés en señales de voz desarrollado por **Shota2811** para la capa de percepción del sistema multimodal de seguridad **HackHeritage26**. Su propósito es proporcionar una señal acústica que indique si una muestra de voz presenta estrés, con dos etiquetas posibles: `NOT_STRESSED` y `STRESSED`. El modelo está diseñado como un componente de investigación, no como un detector definitivo de estados psicológicos.

Técnicamente, no se trata de una red neuronal ni de un modelo de lenguaje, sino de un clasificador basado en árboles potenciados por gradiente (LightGBM) que opera sobre características acústicas extraídas con `librosa`. El bundle de inferencia incluye una representación de los árboles entrenados compatible con NumPy, lo que permite ejecutar la inferencia sin cargar LightGBM ni PyTorch en macOS. El modelo fue entrenado y evaluado sobre el dataset RAVDESS, con una exactitud del 75,2 % y un AUC de 0,82 en validación cruzada independiente del hablante.

La relevancia del modelo radica en su carácter de prototipo de código abierto para la investigación en percepción multimodal de seguridad, donde puede integrarse junto a otras señales. No obstante, sus limitaciones son notables: fue entrenado con habla emocional actuada en inglés, por lo que no debe usarse como evidencia de estrés real en víctimas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting) sobre características acústicas extraídas con librosa |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (habla actuada de RAVDESS; no se indica soporte multilingüe) |
| Licencia | no disponible |
| Formato de pesos | Joblib (bundle de inferencia compatible con NumPy) |

## Arquitectura y entrenamiento

El modelo no se basa en transformers ni en arquitecturas de aprendizaje profundo. En su lugar, emplea un clasificador LightGBM (árboles de decisión con potenciación de gradiente) que actúa sobre un vector de características acústicas calculadas a partir de la señal de voz con la librería `librosa`. La inferencia comienza resampleando el audio a 16 kHz, extrayendo las características y evaluando los árboles mediante un evaluador de árboles implementado con NumPy. Esta decisión evita la dependencia de la librería LightGBM durante la inferencia, lo que simplifica la integración en entornos como macOS donde conviven PyTorch y otros paquetes.

El entrenamiento se realizó sobre el dataset **RAVDESS** (Ryerson Audio-Visual Database of Emotional Speech and Song), que contiene expresiones emocionales actuadas en inglés. La validación utilizó particiones independientes del hablante, de modo que los hablantes del conjunto de evaluación no aparecen en el entrenamiento. La model card no menciona ajustes mediante RLHF, DPO ni técnicas de alineación, dado que se trata de un clasificador convencional.

## Capacidades

- Clasificación binaria de estrés en voz: asigna a cada muestra la etiqueta `NOT_STRESSED` o `STRESSED`.
- Devolución de una puntuación de estrés continua entre 0 y 1, generada por el evaluador de árboles.
- Preprocesamiento de audio integrado: resampleo de la señal a 16 kHz antes de la extracción de características.
- Extracción de características acústicas mediante `librosa`.
- Inferencia sin necesidad de importar LightGBM: el bundle incluye árboles serializados en un formato compatible con NumPy.
- Integración prevista como señal de percepción acústica dentro del sistema multimodal HackHeritage26.
- No ofrece capacidades de generación de texto, código, visión, tool calling ni razonamiento multi-paso, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación sobre percepción de estrés en voz: permite estudiar la relación entre características acústicas y emociones actuadas en el dataset RAVDESS, así como comparar métricas con distintas configuraciones de particionado.
- Señal de apoyo en sistemas multimodales de seguridad: dentro del proyecto HackHeritage26, el modelo puede proporcionar una señal acústica adicional que se combina con otras señales perceptivas para construir una representación conjunta de la situación.
- Prototipado de pipelines de características acústicas: sirve como referencia para evaluar la extracción de features con `librosa` y el entrenamiento de clasificadores LightGBM, facilitando el desarrollo de sistemas similares.
- Soporte de decisiones con humano en el bucle: un operador podría revisar la puntuación de estrés junto a otras señales para tomar decisiones, siempre que la puntuación no se trate como una prueba concluyente.
- Experimentos de normalización por hablante: el modelo permite comparar el rendimiento con técnicas de normalización per-speaker, que en la evaluación del autor alcanzaron una exactitud de 78,3 % y un AUC de 0,87.
- Evaluación de brecha de dominio: útil para investigar la diferencia de rendimiento entre habla emocional actuada y habla real, un aspecto crítico para la aplicación en contextos de victimización.

## Benchmarks y rendimiento

Los resultados publicados en la model card se limitan a las métricas de evaluación sobre RAVDESS:

| Métrica | Valor |
|---|---|
| Exactitud (accuracy) en validación cruzada independiente del hablante | 75,2 % |
| AUC en validación cruzada independiente del hablante | 0,82 |
| Exactitud (accuracy) con normalización por hablante | 78,3 % |
| AUC con normalización por hablante | 0,87 |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un clasificador LightGBM sobre características acústicas, la inferencia se ejecuta en CPU sin necesidad de VRAM.
- No se han proporcionado requisitos específicos de GPU; cualquier CPU moderna es suficiente para la extracción de características y la evaluación de los árboles.
- Puede desplegarse en entornos ligeros con Python, `librosa` y NumPy. La model card menciona una API de percepción del proyecto HackHeritage26 que utiliza el bundle `voice_stress_ravdess.joblib`.
- No se dispone de datos de latencia ni de throughput.

## Comparativa con modelos similares

no disponible. La información proporcionada no incluye modelos comparables de la misma categoría.

## Limitaciones y advertencias

- El modelo fue entrenado con el dataset RAVDESS, que contiene habla emocional actuada en inglés. Existe una brecha de dominio considerable frente al habla real en situaciones de victimización.
- La model card indica expresamente que el modelo no es un detector fiable de estrés psicológico en víctimas reales.
- Una puntuación alta de estrés no debe interpretarse como prueba de que una persona está angustiada, insegura o experimenta un estado psicológico concreto.
- El rendimiento puede variar sustancialmente según el hablante, el idioma, el micrófono, el entorno, la cultura, la expresión emocional y el contexto.
- La señal de voz debe combinarse con otras señales perceptivas y con revisión humana.
- La licencia no está disponible, lo que introduce incertidumbre sobre las condiciones de uso comercial o redistribución.
- Se trata de un prototipo con métricas de investigación; no hay evidencia de validez en producción.
- No se incluye el artefacto de entrenamiento (`voice_stress_ravdess.lgbm.joblib`), solo el bundle de inferencia compatible con NumPy.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Shota2811/HackHeritage26-voice-stress-v1

No se han encontrado enlaces adicionales relevantes en la búsqueda web.
