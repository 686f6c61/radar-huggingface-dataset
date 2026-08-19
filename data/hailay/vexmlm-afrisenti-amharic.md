# Hailay/VEXMLM-AfriSenti-Amharic

## Resumen

VEXMLM-AfriSenti-Amharic es un modelo de clasificación de sentimiento en amhárico, desarrollado por Hailay Kidu Teklehaymanot y colaboradores como parte del trabajo sobre expansión del léxico para lenguas africanas basadas en escritura Ge'ez. Se trata de un ajuste fino (fine-tuning) del modelo base `Hailay/VEXMLM`, que a su vez es una extensión de XLM-R con un vocabulario ampliado con 30.000 subwords Ge'ez, entrenado con enmascaramiento de lenguaje continuado. El modelo resultante se especializa en la tarea de análisis de sentimiento de tres clases (negativo, neutral, positivo) sobre el corpus AfriSenti-SemEval 2023 para amhárico.

La relevancia de este modelo reside en su enfoque en una lengua de bajos recursos como el amhárico, que utiliza el alfabeto Ge'ez, un sistema de escritura poco representado en los modelos multilingües estándar. La arquitectura es `XLMRobertaForSequenceClassification`, con una longitud máxima de secuencia de 256 tokens. El repositorio contiene cinco checkpoints independientes, correspondientes a cinco semillas de entrenamiento (42-46), y el rendimiento reportado es la media ± desviación estándar de esas cinco ejecuciones. El propio autor advierte que la precisión obtenida es débil y que el checkpoint debe tratarse como una reproducción de la evaluación del artículo, no como un clasificador listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `XLMRobertaForSequenceClassification` (basada en XLM-R) |
| Parametros totales | no disponible (basado en XLM-R base, sin cifra oficial) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (máximo de secuencia en fine-tuning) |
| Tipos de cuantizacion | no disponible (no se documentan) |
| Idiomas soportados | am (amhárico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Hailay/VEXMLM`, un XLM-R cuyo vocabulario original (250.000 subwords) se amplió hasta 280.002 subwords, incorporando 30.000 tokens específicos para lenguas Ge'ez mediante un modelo SentencePiece extendido. Sobre esta base se realizó un ajuste fino supervisado para clasificación de sentimiento en amhárico, utilizando el corpus AfriSenti-SemEval 2023 (split de amhárico). El entrenamiento se ejecutó con una configuración fija: longitud máxima de secuencia de 256, batch size de 32, 4 épocas, learning rate de 2e-5 con decaimiento lineal y 10% de warmup, weight decay de 0.01, gradiente clipping a 1.0, optimizador AdamW y precisión bf16. Se entrenaron todos los parámetros del modelo en una única GPU NVIDIA A100 de 40 GB.

Se realizaron cinco ejecuciones independientes con semillas 42 a 46, y el resultado reportado es la media y desviación estándar de esas cinco ejecuciones sobre el split de test del dataset. El proceso está diseñado para ser bit-reproducible, con `enable_full_determinism`, `CUBLAS_WORKSPACE_CONFIG=:4096:8` y `dataloader_num_workers=0`. No se realizó búsqueda de hiperparámetros; es un estudio de configuración única.

## Capacidades

- Clasificación de sentimiento en amhárico: asigna una de tres etiquetas (negativo, neutral, positivo) a textos en amhárico.
- Procesamiento de texto en escritura Ge'ez gracias al vocabulario extendido del modelo base.
- Inferencia sobre secuencias de hasta 256 tokens.
- Reproducibilidad: se ofrecen cinco checkpoints (uno por semilla) y scripts para reproducir el entrenamiento y la evaluación.
- No soporta tool calling, ni razonamiento multi-paso, ni generación de texto libre; es exclusivamente un clasificador de secuencias.
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- Investigación académica en PLN para lenguas de bajos recursos: el modelo sirve como punto de partida para estudiar el impacto de la extensión de vocabulario en tareas de clasificación para amhárico y lenguas Ge'ez.
- Análisis de sentimiento en redes sociales en amhárico: se puede aplicar a textos cortos de Twitter, Facebook u otras plataformas para monitorizar opinión pública, aunque con la advertencia de su baja precisión.
- Prototipado de sistemas de monitorización de noticias: dado que el corpus de entrenamiento incluye dominios de noticias, podría usarse en prototipos para clasificar la polaridad de artículos o comentarios en amhárico.
- Evaluación comparativa de métodos de adaptación de vocabulario: investigadores pueden usar este checkpoint como referencia para comparar con otros enfoques de adaptación a lenguas Ge'ez.
- Docencia y formación en PLN: sirve como ejemplo práctico de fine-tuning de un modelo multilingüe para una tarea específica en una lengua poco representada.
- Análisis de sentimiento en dominios religiosos: el corpus base incluye textos religiosos, por lo que podría explorarse su uso en ese ámbito, aunque con cautela por los sesgos.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre el split de test de AfriSenti-SemEval 2023 (amhárico), como media ± desviación estándar de cinco ejecuciones con semillas 42-46:

| Metrica | Valor |
|---|---|
| Accuracy | 49.78 ± 3.31 |
| Macro-F1 | 49.71 ± 1.93 |

Estos valores son notablemente bajos para una tarea de 3 clases (el azar daría ~33%). El propio autor indica que el split de test tiene una clase mayoritaria diferente entre entrenamiento y test, lo que provoca una calibración sistemática errónea. No se proporcionan comparaciones con otros modelos en la documentación disponible.

## Requisitos de hardware

- Inferencia: al tratarse de un modelo basado en XLM-R base (~270M de parámetros estimados, aunque no confirmado), el checkpoint en bf16 ocupa aproximadamente 540 MB por semilla. Se puede ejecutar en GPUs con al menos 4 GB de VRAM, como una NVIDIA GTX 1060 o superior, o incluso en CPU con suficiente RAM.
- Entrenamiento: el fine-tuning se realizó en una NVIDIA A100 de 40 GB, pero podría replicarse en GPUs con 16 GB de VRAM (por ejemplo, V100 o RTX 3090) ajustando el batch size.
- Despliegue: compatible con la librería `transformers` de Hugging Face. Se puede servir mediante soluciones como vLLM (para clasificación de secuencias), o exportar a ONNX para inferencia en CPU. No se documentan otras opciones.
- Latencia y throughput: no se proporcionan datos. Para un modelo de este tamaño, la inferencia en GPU es del orden de milisegundos por lote pequeño, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos de clasificación de sentimiento en amhárico en la información proporcionada. Se podría comparar con XLM-R base sin extensión de vocabulario, o con modelos multilingües como mBERT, pero no hay datos de benchmarks en la documentación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Rendimiento débil: la precisión de 49.78% en una tarea de 3 clases está cerca del nivel de azar y muy por debajo de lo esperable para un clasificador de producción.
- Desbalance de clases entre entrenamiento y test: el modelo aprende la prioridad de la clase mayoritaria del entrenamiento, que no coincide con la del test, lo que causa una calibración errónea.
- Dominio limitado: el corpus base se compone principalmente de textos religiosos y de noticias, lo que puede introducir sesgos y limitar la generalización a otros dominios.
- Solo amhárico: aunque el modelo base cubre amhárico y tigriña, este fine-tuning se ha entrenado únicamente con datos amháricos; no se ha caracterizado su comportamiento en otras lenguas Ge'ez.
- No apto para uso en producción: el autor lo indica explícitamente; debe usarse solo con fines de investigación o reproducción.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero las predicciones pueden ser incorrectas en entradas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero dado el bajo rendimiento, no se recomienda su uso en aplicaciones comerciales sin un reentrenamiento adecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hailay/VEXMLM-AfriSenti-Amharic
- Modelo base: https://huggingface.co/Hailay/VEXMLM
- Repositorio oficial (código y scripts): https://github.com/hailaykidu/VEXMLM
- Artículo (citado en la model card): Teklehaymanot, Hailay Kidu, Gebregziabihier Yadeta, y Wolfgang Nejdl. "Expanding the Lexicon of Ge'ez Based African Languages: A Comparative Study of Amharic and Tigrinya." Proceedings of the Workshop on Language Models for Underserved Communities (LM4UC) at IJCAI, 2026.
