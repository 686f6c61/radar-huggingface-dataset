# Hailay/VEXMLM-AmQA

## Resumen

VEXMLM-AmQA es un modelo de respuesta a preguntas extractiva (extractive question answering) para el amhárico, desarrollado por Hailay Kidu Teklehaymanot y colaboradores. Se trata de un fine-tuning del modelo VEXMLM, que a su vez es una extensión de XLM-R con un vocabulario ampliado con 30 000 tokens del alfabeto Ge'ez, alcanzando un total de 280 002 subwords. El modelo se ha ajustado específicamente sobre el conjunto de datos AmQA, orientado a la comprensión lectora en amhárico, y se publica bajo licencia Apache 2.0.

La relevancia de este modelo reside en su enfoque hacia lenguas de bajos recursos que utilizan la escritura Ge'ez, como el amhárico y el tigriña. Al extender el vocabulario de un modelo multilingüe preentrenado (XLM-R) con tokens específicos de este sistema de escritura, se consigue una mejor representación de los textos en estas lenguas. El modelo está diseñado para extraer respuestas literales de un contexto dado, una tarea fundamental para sistemas de búsqueda de información y asistentes conversacionales en amhárico.

El repositorio contiene cinco checkpoints independientes, entrenados con semillas distintas (42 a 46), y las métricas reportadas son la media y desviación estándar de esas cinco ejecuciones. El modelo se ha presentado en el taller LM4UC de IJCAI 2026 y su implementación oficial está disponible en GitHub.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `XLMRobertaForQuestionAnswering` (transformer encoder, basado en XLM-R) |
| Parametros totales | no disponible (el modelo base XLM-R tiene ~278M, pero la extensión de vocabulario modifica la capa de embeddings) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 256 tokens (ventana de entrenamiento; no se especifica la máxima del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en precisión bf16 durante el entrenamiento, pero no se publican versiones cuantizadas) |
| Idiomas soportados | amhárico (el fine-tuning); el modelo base VEXMLM cubre amhárico y tigriña |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (indicado en los tags) |

## Arquitectura y entrenamiento

VEXMLM-AmQA se basa en la arquitectura `XLMRobertaForQuestionAnswering`, un transformer encoder con cabezal de clasificación para predecir el inicio y el fin del span de respuesta dentro del contexto. El modelo base, VEXMLM, es una extensión de XLM-R cuyo vocabulario original se ha ampliado con 30 000 tokens del alfabeto Ge'ez, fusionados en el modelo SentencePiece, alcanzando un total de 280 002 subwords. Esta extensión se realizó mediante un preentrenamiento continuado con modelado de lenguaje enmascarado (MLM) sobre corpus de amhárico y tigriña.

El fine-tuning se realizó sobre el conjunto de datos AmQA, con una configuración única: secuencias de hasta 256 tokens, tamaño de lote 32, 4 épocas, tasa de aprendizaje 2e-5 con decaimiento lineal y 10% de warmup, peso de decaimiento 0.01, clipping de gradiente 1.0, optimizador AdamW y precisión bf16. Se entrenaron todos los parámetros del modelo en una GPU NVIDIA A100 de 40 GB. Las ejecuciones son bit-reproducibles mediante el uso de `enable_full_determinism`, `CUBLAS_WORKSPACE_CONFIG=:4096:8` y `dataloader_num_workers=0`. No se realizó búsqueda de hiperparámetros; es un estudio de configuración única.

## Capacidades

- Respuesta a preguntas extractiva en amhárico: dado un contexto y una pregunta, devuelve un fragmento literal del contexto como respuesta.
- Comprensión lectora en dominios religiosos y de noticias, que son los principales del corpus AmQA.
- Soporte para textos en alfabeto Ge'ez gracias a la extensión de vocabulario del modelo base.
- No soporta tool calling, ni razonamiento multi-paso, ni generación libre de texto (es un modelo exclusivamente de QA extractivo).
- Capacidades multilingües limitadas: el fine-tuning solo cubre amhárico; el modelo base también incluye tigriña, pero no se ha evaluado el rendimiento en esa lengua para esta tarea.
- No tiene capacidades de visión ni audio.

## Casos de uso

- Búsqueda de información en documentos religiosos en amhárico: el modelo puede extraer respuestas a preguntas sobre pasajes de textos religiosos, facilitando la consulta de grandes volúmenes de escritura.
- Análisis de artículos de prensa etíope: permite extraer datos concretos (fechas, nombres, cifras) de noticias en amhárico, útil para periodistas o investigadores.
- Asistentes virtuales para hablantes de amhárico: integrado en un sistema de diálogo, puede responder preguntas factuales sobre un contexto proporcionado, como manuales de usuario o documentos institucionales.
- Extracción de información de documentos administrativos o legales: el modelo puede localizar cláusulas o datos específicos en contratos o formularios en amhárico, aunque su rendimiento en estos dominios no está caracterizado.
- Tutoría educativa: para estudiantes de lengua amhárica, puede responder preguntas sobre textos de lectura, ayudando en la comprensión lectora.
- Investigación en NLP para lenguas de bajos recursos: sirve como punto de partida para comparar estrategias de extensión de vocabulario y fine-tuning en lenguas Ge'ez.

## Benchmarks y rendimiento

El modelo se evaluó sobre el split de test del conjunto AmQA, con cinco semillas independientes. Las métricas reportadas son la media y desviación estándar de esas cinco ejecuciones:

| Metrica | Resultado (media ± desviación) |
|---|---|
| Exact Match | 32.57 ± 0.77 |
| F1 | 48.85 ± 0.96 |

No se han publicado comparaciones con otros modelos en la información disponible. La model card indica que estos resultados provienen de la evaluación de cinco semillas sobre el test, no de uso interactivo.

## Requisitos de hardware

- El tamaño del repositorio es de 6.0 GB, que incluye cinco checkpoints completos. Cada checkpoint individual ocupa aproximadamente 1.2 GB en formato safetensors.
- No se especifican requisitos mínimos de VRAM. Dado que se trata de un modelo transformer de tamaño medio (similar a XLM-R base, ~278M parámetros), se puede estimar que la inferencia en precisión fp32 requiere al menos 4-6 GB de VRAM, y en bf16 unos 3-4 GB. Sin embargo, estos valores no están verificados por el autor.
- Se recomienda una GPU con al menos 8 GB de VRAM para ejecutar el modelo con comodidad, como una NVIDIA RTX 3060, RTX 4070 o superior. Para entrenamiento se usó una A100 de 40 GB.
- Opciones de despliegue: al ser un modelo de HuggingFace Transformers, se puede servir con bibliotecas compatibles como vLLM, TGI o directamente con la API de Transformers. No se proporcionan archivos GGUF ni versiones cuantizadas.
- La latencia y el throughput no están documentados; dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de modelos de QA extractivo específicos para amhárico con los que comparar directamente en la información proporcionada. Como referencia cualitativa, se puede considerar:

| Modelo | Enfoque | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| VEXMLM-AmQA | Fine-tuning de XLM-R con vocabulario extendido | 256 tokens | amhárico | Apache 2.0 |
| XLM-R base | Modelo multilingüe sin extensión Ge'ez | 512 tokens (original) | 100+ idiomas | MIT |
| mBERT | Modelo multilingüe BERT | 512 tokens | 104 idiomas | Apache 2.0 |

La comparación cuantitativa no está disponible. La ventaja de VEXMLM-AmQA es su vocabulario extendido para Ge'ez, que debería mejorar el rendimiento en amhárico frente a los modelos multilingües genéricos, aunque no hay datos publicados que lo confirmen.

## Limitaciones y advertencias

- El modelo solo está ajustado para el amhárico; su rendimiento en tigriña u otras lenguas Ge'ez no está caracterizado.
- Los corpus de preentrenamiento y fine-tuning provienen mayoritariamente de dominios religiosos y de noticias, por lo que el modelo puede reflejar los sesgos y la distribución de esos textos.
- Al ser un modelo extractivo, solo puede devolver respuestas que aparezcan literalmente en el contexto; no puede generar respuestas sintetizadas.
- No se realizó búsqueda de hiperparámetros; la configuración es única y las comparaciones con otros modelos en el paper son de una sola semilla.
- La ventana de contexto de 256 tokens es relativamente corta; contextos más largos deberán truncarse, lo que puede perder información relevante.
- No se proporcionan versiones cuantizadas ni optimizaciones para despliegue en producción, por lo que el uso en entornos con recursos limitados requerirá trabajo adicional.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de los datos de entrenamiento (AmQA) para asegurar el cumplimiento de sus condiciones.

## Enlaces

- [HuggingFace: Hailay/VEXMLM-AmQA](https://huggingface.co/Hailay/VEXMLM-AmQA)
- [HuggingFace: Hailay/VEXMLM (modelo base)](https://huggingface.co/Hailay/VEXMLM)
- [Repositorio oficial (GitHub)](https://github.com/hailaykidu/VEXMLM)
- Paper: Teklehaymanot, H. K., Yadeta, G., & Nejdl, W. (2026). "Expanding the Lexicon of Ge'ez Based African Languages: A Comparative Study of Amharic and Tigrinya". En Proceedings of the Workshop on Language Models for Underserved Communities (LM4UC) at IJCAI.
