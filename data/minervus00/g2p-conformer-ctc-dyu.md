# Minervus00/g2p-conformer-ctc-dyu

## Resumen

El modelo `g2p-conformer-ctc-dyu` es un sistema de conversión de grafema a fonema (G2P) desarrollado por Minervus00 para el idioma dioula (dyu). Está basado en la arquitectura G2P-Conformer-CTC de NVIDIA NeMo, que combina un codificador Conformer con un decodificador lineal y se entrena con pérdida CTC, lo que lo hace no autorregresivo y más rápido en inferencia que los modelos secuenciales. El modelo se entrenó desde cero sobre 1500 pares de frases del dataset Orange G2P, con una división fija 80/10/10 para entrenamiento, validación y prueba.

Su relevancia radica en que es uno de los pocos modelos G2P disponibles para dioula, una lengua mandé hablada en África Occidental, y sirve como alternativa ligera al modelo ByT5-small del mismo autor, con aproximadamente 20 veces menos parámetros y una velocidad de inferencia mayor, aunque con una precisión inferior. El modelo está publicado bajo licencia CC-BY-4.0 y se distribuye en formato NeMo (.nemo), listo para cargarse con la librería NeMo de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder (16 capas, d_model=176) + decodificador lineal CTC |
| Parametros totales | no disponible (aproximadamente 20 veces menos que ByT5-small, que tiene ~300M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa frases completas, sin límite explícito) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | dyu (dioula) |
| Licencia | cc-by-4.0 |
| Formato de pesos | .nemo (NeMo) |

## Arquitectura y entrenamiento

El modelo sigue la receta de referencia `g2p_conformer_ctc.yaml` de NVIDIA NeMo, con un codificador Conformer de 16 capas y dimensión de modelo 176, seguido de un decodificador lineal y entrenamiento con pérdida CTC. Al ser no autorregresivo, la inferencia es más rápida que la de modelos secuenciales como ByT5. El tokenizador de salida es un SentencePiece unigram con vocabulario de 256 unidades, entrenado exclusivamente sobre el texto fonético del conjunto de entrenamiento. El vocabulario de grafemas se construyó a partir del texto real del corpus, incluyendo letras IPA adyacentes como ɑ, ɔ, ɛ, ŋ, ɲ, que el vocabulario ASCII por defecto de NeMo descartaría.

El entrenamiento se realizó desde cero, sin checkpoint previo, sobre aproximadamente 1200 frases de entrenamiento. Se usó el optimizador AdamW con programación de tasa de aprendizaje NoamAnnealing, con 1900 pasos de calentamiento (reajustados desde el valor por defecto de 10000 de la configuración de LibriSpeech). Se aplicó early stopping sobre la PER (tasa de error de caracteres en fonemas) de validación, con paciencia de 15 épocas. No se emplearon técnicas como RLHF o DPO, ya que es un modelo de conversión directa.

## Capacidades

- Conversión de grafemas a fonemas para el idioma dioula, incluyendo tonos diacríticos en la salida.
- Procesamiento de frases completas (no solo palabras aisladas), como se indica en la documentación de NeMo.
- Inferencia no autorregresiva, lo que permite una generación más rápida que modelos secuenciales.
- Integración con el ecosistema NeMo: carga mediante `G2PModel.restore_from` y uso de manifiestos JSON para entrada/salida.
- No soporta tool calling, agentes, visión ni otras capacidades multimodales; es un modelo especializado en una única tarea.

## Casos de uso

- Sistemas de síntesis de voz (TTS) en dioula: el modelo puede convertir texto ortográfico en transcripciones fonémicas que sirven como entrada para un sintetizador, mejorando la pronunciación de palabras y frases.
- Asistencia a sistemas de reconocimiento de voz (ASR): las transcripciones fonémicas generadas pueden usarse para entrenar o adaptar modelos acústicos en dioula, especialmente en entornos con pocos recursos.
- Lexicografía y lingüística computacional: permite generar automáticamente pronunciaciones para diccionarios o corpus anotados, reduciendo el trabajo manual de expertos.
- Aplicaciones de aprendizaje de idiomas: puede usarse para mostrar la pronunciación correcta de palabras dioula a estudiantes, integrado en aplicaciones educativas.
- Normalización de texto para TTS: en pipelines de conversión de texto a voz, el G2P puede desambiguar homógrafos o palabras con pronunciaciones irregulares.
- Investigación en G2P para lenguas de bajos recursos: sirve como punto de partida para experimentos con arquitecturas ligeras y datos limitados, comparándose con el modelo ByT5 companion.

## Benchmarks y rendimiento

El autor declara los siguientes resultados sobre el conjunto de prueba retenido (150 ejemplos), según el model-index:

| Metrica | Valor |
|---|---|
| CER (tasa de error de caracteres) | 0.0431 |
| WER (tasa de error de palabras) | 0.1326 |

Como referencia, el autor proporciona una línea base sin modelo (comparar el texto directamente con la transcripción fonética) que arroja un CER de 0.4525 y un WER de 0.9982, lo que indica que el modelo mejora sustancialmente sobre la identidad. No se han publicado comparaciones con otros modelos G2P en la información disponible.

## Requisitos de hardware

- Al ser un modelo pequeño (aproximadamente 20 veces menor que ByT5-small, que tiene ~300M de parámetros, lo que sugiere un tamaño en el rango de 10-20M), la inferencia puede ejecutarse en CPU sin problemas para la mayoría de los casos de uso.
- No se proporcionan requisitos oficiales de VRAM ni GPU recomendadas. Dado el tamaño, cualquier GPU con al menos 2 GB de VRAM sería suficiente, aunque no hay datos confirmados.
- Para el entrenamiento, NeMo requiere GPU con CUDA; una GPU de gama media como una RTX 3060 o superior sería adecuada, pero no se especifica.
- Opciones de despliegue: el modelo se carga mediante la librería NeMo (`nemo.collections.tts.models.base.G2PModel`). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo especializado de NeMo.
- La latencia y el throughput no están documentados, pero al ser no autorregresivo, se espera que sea significativamente más rápido que el modelo ByT5 companion.

## Comparativa con modelos similares

El propio autor proporciona un modelo compañero, `Minervus00/byt5-small-g2p-dyu`, entrenado sobre la misma división de datos. La comparación directa es la siguiente:

| Modelo | Arquitectura | Parametros | CER (test) | WER (test) | Licencia |
|---|---|---|---|---|---|
| g2p-conformer-ctc-dyu | Conformer + CTC | ~20x menos que ByT5-small | 0.0431 | 0.1326 | CC-BY-4.0 |
| byt5-small-g2p-dyu | ByT5-small | ~300M | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ByT5 companion en la información proporcionada, por lo que no es posible cuantificar la diferencia. Otros modelos G2P de NeMo (como los entrenados para inglés u otros idiomas) existen, pero no se han comparado aquí por falta de datos.

## Limitaciones y advertencias

- Entrenado desde cero con solo ~1200 frases de un único dominio (dataset Orange G2P), lo que limita su generalización a otros dominios o estilos de texto.
- No se ha evaluado en nombres propios fuera de dominio ni en texto con alternancia de código (code-switching), como advierte el autor.
- El vocabulario de grafemas se construyó a partir del corpus de entrenamiento, por lo que puede no cubrir todos los caracteres del dioula en otros contextos.
- Al ser un modelo no autorregresivo con pérdida CTC, puede presentar errores en secuencias largas o con tonos complejos, aunque las métricas reportadas son razonablemente bajas.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero se recomienda revisar los términos exactos.
- No se proporcionan pesos en formatos estándar como safetensors o GGUF; solo está disponible el archivo .nemo, lo que limita su uso fuera del ecosistema NeMo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minervus00/g2p-conformer-ctc-dyu
- Modelo compañero ByT5: https://huggingface.co/Minervus00/byt5-small-g2p-dyu
- Documentación de G2P en NeMo Framework: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/tts/g2p.html
- Documentación de G2P en NeMo-Speech: https://docs.nvidia.com/nemo/speech/3.0.0/tts/g2p.html
- Configuración de referencia `g2p_conformer_ctc.yaml`: https://github.com/janEbert/NeMo/blob/main/examples/tts/g2p/conf/g2p_conformer_ctc.yaml
