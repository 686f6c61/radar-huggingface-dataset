# senthilsdglakhsg/whisper-tiny-minds14-enUS

## Resumen

El modelo `senthilsdglakhsg/whisper-tiny-minds14-enUS` es un ajuste fino (fine-tune) de `openai/whisper-tiny` sobre el subconjunto en inglés de Estados Unidos del dataset PolyAI/MINDS14. MINDS14 es un corpus de consultas bancarias grabadas en varios idiomas, diseñado para tareas de reconocimiento de voz y detección de intención. Este modelo se especializa en transcripción de audio en inglés estadounidense dentro del dominio bancario, reduciendo la pérdida de rendimiento que el modelo base presenta en este tipo de acentos y vocabulario específico.

Con solo 37,7 millones de parámetros, Whisper Tiny es la variante más pequeña de la familia Whisper de OpenAI. Su tamaño reducido lo hace adecuado para despliegue en dispositivos con recursos limitados, como CPUs, Raspberry Pi o GPUs de gama baja, manteniendo una calidad aceptable para tareas de ASR en dominios acotados. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su ligereza y especificidad: ofrece una alternativa de bajo coste computacional para transcripción de voz en entornos bancarios de habla inglesa, donde los modelos genéricos suelen fallar por acentos o jerga técnica. Es un ejemplo de cómo un fine-tune pequeño y dirigido puede superar a modelos mucho más grandes en un dominio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | No disponible en la informacion del modelo |
| Idiomas soportados | Ingles de Estados Unidos (fine-tune sobre modelo base multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper Tiny de OpenAI: un transformer encoder-decoder con atención estándar, entrenado originalmente sobre 680.000 horas de audio etiquetado. El encoder procesa espectrogramas Mel de 80 canales y el decoder genera texto autoregresivamente. En este fine-tune, se congelaron los pesos del modelo base y se entrenó únicamente la cabeza de clasificación (o se ajustaron todos los parámetros, según los hiperparámetros declarados). El entrenamiento se realizó sobre el subconjunto `en-US` de PolyAI/MINDS14, que contiene consultas bancarias habladas por hablantes de inglés estadounidense.

Los hiperparámetros de entrenamiento incluyen learning rate de 1e-5, batch size de 8 con acumulación de gradientes de 2 (batch efectivo de 16), 5 épocas, optimizador AdamW con betas (0.9, 0.999), scheduler lineal con 50 pasos de warmup y precisión mixta (AMP). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un fine-tune supervisado clásico. La pérdida de validación final fue de 0.4681 y el WER de 0.3634.

## Capacidades

- Reconocimiento de voz automático (ASR) en inglés de Estados Unidos, especialmente en el dominio bancario (consultas sobre cuentas, transacciones, tarjetas, etc.).
- Transcripción de audio de hasta 30 segundos por segmento, con manejo de segmentos más largos mediante ventanas deslizantes.
- Funciona con audio muestreado a 16 kHz, formato habitual en pipelines de ASR.
- Al estar basado en Whisper Tiny, hereda la robustez del modelo original en entornos con ruido moderado, aunque su rendimiento se degrada en condiciones adversas.
- No dispone de tool calling, ni capacidades multimodales más allá del audio, ni soporte para agentes o razonamiento multi-paso.
- Es monolingüe en la práctica: el fine-tune se realizó solo con datos en inglés de EE.UU., por lo que su rendimiento en otros idiomas o variantes del inglés (británico, australiano) no está garantizado.

## Casos de uso

- Atención al cliente automatizada en banca: el modelo puede transcribir en tiempo real las consultas de clientes que llaman a un centro de contacto, permitiendo a un sistema de IA clasificar la intención y derivar la llamada al departamento adecuado. Su enfoque en el dominio bancario reduce errores en términos como "transferencia", "saldo" o "tarjeta".
- Transcripción de grabaciones de reuniones o llamadas de soporte: al ser ligero, puede ejecutarse en servidores de bajo coste o incluso en local, transcribiendo horas de audio de forma asíncrona para su posterior análisis.
- Asistentes de voz para aplicaciones de banca móvil: integrado en una app, permite dictar comandos como "transferir 50 euros a Juan" o "consultar mi último movimiento", convirtiendo el audio en texto que luego se procesa con NLP.
- Generación de subtítulos para vídeos corporativos del sector financiero: su tamaño reducido permite procesar vídeos en lote sin necesidad de GPUs dedicadas.
- Sistemas de verificación de identidad por voz: combinado con un sistema de biometría de voz, transcribe la respuesta del usuario a una pregunta de seguridad, validando tanto la identidad como el contenido.
- Entrenamiento de modelos de detección de intención: el modelo puede usarse para generar transcripciones de audio que luego sirven como datos de entrenamiento para clasificadores de intención más complejos.

## Benchmarks y rendimiento

Según la model card, el modelo alcanza los siguientes resultados en el conjunto de evaluación de PolyAI/MINDS14 (subconjunto en-US):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0.4681 |
| WER | 0.3634 |
| WER Ortho | 0.3504 |

La evolución durante el entrenamiento muestra una mejora progresiva desde un WER inicial de 0.4941 en la primera época hasta el valor final de 0.3634 en la quinta. No se han publicado comparativas con otros modelos en este dataset dentro de la información disponible.

## Requisitos de hardware

- VRAM estimada: en fp32, el modelo ocupa aproximadamente 150 MB de memoria (37,7 M parámetros × 4 bytes). En int8, se reduce a unos 40 MB, y en int4 a unos 20 MB. Estas cifras son estimaciones basadas en el tamaño del modelo, no mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una NVIDIA GTX 1050 o superior puede ejecutarlo cómodamente. También funciona en CPU con un rendimiento aceptable (inferencia de un segmento de 30 segundos en menos de 1 segundo en un procesador moderno).
- Es compatible con consumer GPUs de gama baja, como la serie GTX 16xx, RTX 20xx y superiores.
- Opciones de despliegue: se puede utilizar con la librería `transformers` de Hugging Face, con `pipeline` de ASR. Para inferencia optimizada, se puede usar `whisper.cpp` (implementación en C++ para CPU) o `vLLM` (aunque su soporte para Whisper es limitado). También es compatible con `TGI` (Text Generation Inference) para despliegue en servidores.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU como la RTX 4090, se estima una latencia de decodificación de ~50-100 ms por segmento de 30 segundos, lo que permite procesar audio en tiempo real o más rápido.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos en la información proporcionada. Sin embargo, se puede comparar estructuralmente con otros modelos de la familia Whisper:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| whisper-tiny-minds14-enUS (este) | 37,7 M | 30 s audio | Apache 2.0 | Fine-tune en dominio bancario en-US |
| openai/whisper-tiny | 39 M | 30 s audio | MIT | Modelo base, multilingue, sin especializar |
| openai/whisper-base | 74 M | 30 s audio | MIT | Mayor capacidad, mejor rendimiento general, pero más pesado |

El fine-tune aquí presentado supera probablemente al modelo base en el dataset MINDS14 (en-US) debido a su especialización, pero no hay datos oficiales que lo confirmen.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado únicamente con datos de inglés estadounidense del sector bancario. Puede tener un rendimiento deficiente con otros acentos del inglés (británico, australiano, indio) o con vocabulario fuera del dominio financiero.
- Riesgo de alucinación: como cualquier modelo de ASR, puede generar texto que no corresponde al audio en situaciones de ruido fuerte, solapamiento de voces o audio de baja calidad.
- Limitaciones de contexto: la ventana de 30 segundos es fija; para audios más largos es necesario segmentar, lo que puede cortar palabras o frases si no se hace con solapamiento adecuado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero no hay garantías de soporte ni mantenimiento por parte del autor.
- Caveat de producción: el modelo se generó automáticamente con `Trainer` y la model card está incompleta (secciones "More information needed"). No se documentan los datos exactos de entrenamiento (número de muestras, partición train/eval), por lo que la reproducibilidad es limitada.
- El WER de 0.3634 es relativamente alto para estándares de ASR modernos; en entornos ruidosos o con acentos poco representados, puede ser significativamente peor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/senthilsdglakhsg/whisper-tiny-minds14-enUS
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset PolyAI/MINDS14: https://huggingface.co/datasets/PolyAI/minds14
- Repositorio de referencia con fine-tune similar: https://github.com/zanuura/whisper-asr-minds14-english
