# advaitsingh/course-classification

## Resumen

`advaitsingh/course-classification` es un prototipo de investigación publicado en HuggingFace por el usuario advaitsingh, orientado a tareas de clasificación (según el autor, "course classification", es decir, clasificación de cursos). No se trata de un modelo entrenado ni de un modelo listo para producción: la propia model card lo describe como un *checkpoint de inicialización válido para pruebas de humo* (smoke tests), sin métricas de benchmark y sin auditoría de robustez, equidad o transferencia de dominio.

El repositorio declara una arquitectura denominada "Coca", con atención dispersa (sparse), fusión tensorial (tensor fusion), activación approx GELU y normalización ScaleNorm. La model card indica una escala "giant", pero el fichero `model.safetensors` reporta únicamente 49.600 parámetros totales, una discrepancia enorme que conviene tener presente: la etiqueta "giant" parece referirse a la plantilla de configuración generada, no al tamaño real de los pesos almacenados.

Su relevancia actual es limitada y de carácter metodológico: sirve como esqueleto reproducible (`main.py`, `config.json`, `training_args.json`) para experimentos de clasificación con una implementación propia. No hay pesos entrenados, no hay resultados publicados y no hay pipeline declarado en HuggingFace, por lo que cualquier uso real exige entrenamiento previo desde cero por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (implementación propia, no estándar) |
| Parametros totales | 49.600 (según safetensors) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors (PyTorch) |
| Atencion | sparse (según la model card) |
| Fusion | tensor fusion (según la model card) |
| Activacion | approx gelu (según la model card) |
| Normalizacion | scalenorm (según la model card) |
| Escala declarada | "giant" (discrepante con los 49.600 parametros reales) |
| Pipeline en HuggingFace | no disponible |
| Descargas / likes | 11 / 0 |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura se presenta bajo el nombre "Coca", con atención dispersa, fusión tensorial, activación approx GELU y normalización ScaleNorm. Se trata de una implementación personalizada: la model card advierte explícitamente que las APIs genéricas de carga automática (por ejemplo, `AutoModel` de Transformers) requieren un adaptador explícito antes de poder usarse. No se documenta el número de capas, la dimensión oculta, el número de cabezas de atención ni el vocabulario, por lo que la estructura interna completa no está disponible.

Respecto al entrenamiento, el repositorio incluye una receta de experimento por defecto con el optimizador AdamW y un scheduler de tipo exponencial, descritos por el autor como valores de partida y no como evidencia de una ejecución completada. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El checkpoint `model.safetensors` se declara explícitamente como inicialización no entrenada para pruebas de humo, de modo que no existe ninguna innovación técnica validada empíricamente en este repositorio.

## Capacidades

- Clasificación (declarada): la model card indica que el prototipo apunta a tareas de clasificación, pero no se aporta ninguna métrica ni validación.
- Generación de texto: no disponible; no hay evidencia de que el modelo sea generativo.
- Razonamiento, código y matemáticas: no disponible.
- Visión: no disponible (aunque la etiqueta "coca" se asocia a veces a modelos visión-lenguaje, aquí no se documenta ninguna modalidad de entrada).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo "thinking" o modos especiales de inferencia: no disponible.
- En su estado actual, la única capacidad verificable es la inicialización de pesos para pruebas de humo y la ejecución del script `main.py --help`.

## Casos de uso

Ninguno de los siguientes casos es utilizable hoy sin un entrenamiento previo completo del checkpoint; se plantean como escenarios objetivo del repositorio:

- Clasificación de catálogos de cursos: una vez entrenado sobre un conjunto etiquetado de cursos, el modelo podría asignar categorías temáticas a descripciones y títulos, aprovechando que su tamaño reducido permite iterar rápido en experimentación.
- Prototipado académico de arquitecturas: sirve como base reproducible para comparar variantes de atención dispersa y normalización ScaleNorm frente a baselines de capacidad equivalente.
- Pruebas de humo en pipelines de CI: al pesar menos de 1 MB, se puede cargar en un test unitario para verificar que el código de carga, el `config.json` y el formato safetensors funcionan antes de desplegar un modelo mayor.
- Etiquetado asistido de contenidos educativos: con un ajuste supervisado sobre datos propios, podría preclasificar recursos de formación para revisión humana posterior.
- Investigación sobre recetas de entrenamiento: el archivo `training_args.json` documenta una receta AdamW con scheduler exponencial que puede replicarse o compararse entre semillas.
- Enrutado de consultas en un asistente educativo: un clasificador ligero de este tipo podría decidir a qué módulo o curso pertenece una pregunta antes de pasarla a un modelo mayor, siempre que se entrene y evalúe primero.
- Detección de temática en foros o plataformas de e-learning: clasificación de hilos y mensajes por área de conocimiento para moderación o recomendación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que no se reclama ninguna puntuación de benchmark y que el checkpoint es una inicialización no entrenada. Cualquier cifra que se publicase en el futuro debería documentarse por separado de los valores por defecto del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en FP32 para 49.600 parámetros (aproximadamente 0,2 MB de pesos); el cuello de botella es el framework, no el modelo.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU, incluida una integrada, y funciona en CPU sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: PyTorch nativo con la implementación propia del repositorio. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni APIs de carga automática de Transformers, ya que requiere un adaptador explícito.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, y la naturaleza del repositorio (checkpoint de inicialización sin entrenar, arquitectura propietaria y sin benchmarks) impide establecer una comparación significativa con clasificadores publicados. Cualquier comparación exigiría, como mínimo, un checkpoint entrenado, un conjunto de evaluación etiquetado y un baseline de capacidad equivalente, tal y como recomienda la propia model card.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: sus pesos son una inicialización aleatoria o sintética, no un modelo funcional.
- No se han auditado robustez, equidad ni transferencia de dominio; se desconoce el comportamiento ante datos fuera de distribución.
- No se declaran sesgos conocidos, pero tampoco se han evaluado, lo que en la práctica implica riesgo de sesgos no medidos si se entrena con datos sesgados.
- Riesgo de alucinación: no evaluable, dado que no hay pesos entrenados ni tarea validada.
- La escala declarada "giant" contradice los 49.600 parámetros reales del safetensors; no debe tomarse como indicador de capacidad.
- No hay información sobre longitud de contexto ni idiomas, por lo que no se puede garantizar el comportamiento en textos largos ni en castellano.
- Licencia BSD-3-Clause: permisiva y compatible con uso comercial, pero la model card advierte que deben revisarse por separado las condiciones de los datos de origen si se combina con datasets externos.
- Para producción sería imprescindible entrenar, evaluar con al menos tres semillas, reportar la métrica de la tarea y conservar los registros de entrenamiento y las versiones del entorno.
- La implementación es personalizada, lo que complica la integración con el ecosistema estándar y exige mantenimiento propio del código de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/advaitsingh/course-classification
- Repositorio relacionado del mismo autor: https://huggingface.co/advaitsingh/study-embodied-ai
- Tutorial "Build a Course Classification AI: Complete Guide to LLM Finetuning": https://www.youtube.com/watch?v=YC1HHK4gQGg
- Curso "Build Regression, Classification, and Clustering Models" (Coursera): https://www.coursera.org/learn/build-regression-classification-clustering-models
- Curso "Machine Learning: Classification" (Coursera): https://www.coursera.org/learn/ml-classification
- "Awesome Free University AI/ML Course Notes": https://github.com/MarcosSete/awesome-free-ai-course-notes
