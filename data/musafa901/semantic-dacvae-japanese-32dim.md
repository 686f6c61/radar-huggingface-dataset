# musafa901/Semantic-DACVAE-Japanese-32dim

## Resumen

Semantic-DACVAE-Japanese-32dim es un modelo de codificación de audio (VAE) especializado en habla japonesa, desarrollado como una variante ligera del modelo Semantic-DACVAE-Japanese de Aratako. Su principal innovación consiste en reducir la dimensión del espacio latente de 128 a 32, manteniendo una calidad de reconstrucción competitiva y facilitando el entrenamiento de modelos de síntesis de voz (TTS) aguas abajo. El modelo se basa en el DACVAE de Facebook (facebook/dacvae-watermarked) e incorpora destilación semántica mediante WavLM, siguiendo la metodología propuesta en el artículo Semantic-VAE (arXiv:2509.22167).

El modelo está fine-tuneado exclusivamente con conjuntos de datos de habla japonesa, lo que le permite reconstruir voz natural con alta fidelidad. Su licencia MIT y su tamaño compacto (0,4 GB) lo hacen accesible para investigación y prototipado en entornos con recursos limitados. Aunque no es un modelo generativo de texto, su representación latente compacta es especialmente útil como front-end para sistemas TTS, reduciendo el coste computacional y mejorando la eficiencia del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DACVAE (VAE de audio basado en Descript Audio Codec) con destilacion semantica WavLM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | weights.pth (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DACVAE de Facebook, un autoencoder variacional para audio que comprime señales de voz en representaciones latentes discretas. Sobre esta base, se incorpora una destilación semántica mediante WavLM, técnica inspirada en el artículo Semantic-VAE, que alinea las representaciones latentes con características semánticas de alto nivel. Esto mejora la naturalidad de las reconstrucciones y la eficiencia en tareas posteriores de TTS.

El entrenamiento consistió en un fine-tuning del modelo base facebook/dacvae-watermarked sobre conjuntos de datos de habla japonesa. La variante 32dim reduce la dimensión del espacio latente de 128 a 32, lo que implica una compresión más agresiva. Según la model card, esta reducción no sacrifica significativamente la calidad subjetiva, como se refleja en las métricas UTMOSv2. No se especifican detalles sobre el número de tokens de entrenamiento ni el uso de RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Reconstrucción de audio de voz japonesa con alta naturalidad, medida mediante UTMOSv2.
- Compresión de representaciones latentes a 32 dimensiones, reduciendo la carga computacional en tareas downstream.
- Extracción de características semánticas de audio mediante destilación WavLM.
- Adecuado como front-end para modelos TTS japoneses, mejorando la eficiencia del entrenamiento.
- Soporte de audio a audio (pipeline_tag: audio-to-audio), con entrada y salida de señales de audio.
- No incluye capacidades de generación de texto, tool calling, agentes ni visión.

## Casos de uso

- Pre-entrenamiento de modelos TTS japoneses: el modelo actúa como un codificador semántico compacto que reduce la dimensionalidad de las representaciones de audio, acelerando el entrenamiento de sintetizadores de voz sin pérdida notable de calidad.
- Compresión de audio para almacenamiento o transmisión: al reducir el espacio latente a 32 dimensiones, se puede almacenar o transmitir representaciones de voz de forma más eficiente, manteniendo una reconstrucción fiel.
- Extracción de características para análisis de prosodia y emoción: las representaciones latentes semánticas pueden utilizarse como entrada para clasificadores de emociones o estilos de habla en japonés.
- Fine-tuning de sistemas de conversión de voz (voice conversion): la representación compacta permite adaptar el modelo a voces específicas con menos datos y menor coste computacional.
- Reducción de latencia en pipelines de síntesis de voz en tiempo real: al ser un modelo ligero (0,4 GB), puede ejecutarse en entornos con recursos limitados, como aplicaciones embebidas o servidores de baja capacidad.
- Investigación en codificación de audio semántica: sirve como punto de partida para experimentos sobre el equilibrio entre compresión y calidad en VAEs de voz, especialmente en idiomas distintos del inglés.

## Benchmarks y rendimiento

La model card reporta evaluaciones con la métrica UTMOSv2 (naturalidad subjetiva) sobre dos conjuntos de prueba de 100 muestras cada uno. Los resultados comparan el modelo con el original, el DACVAE base y la versión de 128 dimensiones.

| Conjunto de prueba | Audio original | facebook/dacvae-watermarked | Aratako/Semantic-DACVAE-Japanese (128-dim) | Semantic-DACVAE-Japanese-32dim |
|---|---|---|---|---|
| Emilia-YODAS (subconjunto japones) | 2,2099 | 2,2841 | 2,4812 | **2,4024** |
| Dataset privado japones | 2,0322 | 1,8775 | 2,1629 | **2,1421** |

En ambos casos, el modelo de 32 dimensiones supera al DACVAE base y se acerca al rendimiento de la versión de 128 dimensiones, con una diferencia de aproximadamente 0,08 puntos en el primer conjunto y 0,02 en el segundo. No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, etc.) porque no es un modelo de texto.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU específicas en la documentación disponible.
- El tamaño del repositorio es de 0,4 GB, lo que sugiere que el modelo es ligero y puede ejecutarse en GPUs de consumo como una RTX 3060 o superior.
- Para inferencia, se recomienda al menos 2-4 GB de VRAM, aunque no hay datos confirmados.
- El código de ejemplo utiliza PyTorch y la librería `dacvae` oficial de Facebook, por lo que el despliegue requiere un entorno con Python 3.10 y CUDA (opcional, también puede funcionar en CPU).
- Opciones de despliegue: inferencia local con el script proporcionado, integración en pipelines de TTS mediante la carga del modelo con `DACVAE.load()`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Dimension latente | UTMOSv2 (Emilia-YODAS) | UTMOSv2 (privado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| facebook/dacvae-watermarked | 128 | 2,2841 | 1,8775 | MIT | Hugging Face |
| Aratako/Semantic-DACVAE-Japanese | 128 | 2,4812 | 2,1629 | MIT | Hugging Face |
| Semantic-DACVAE-Japanese-32dim | 32 | 2,4024 | 2,1421 | MIT | Hugging Face |

El modelo de 32 dimensiones ofrece una compresión 4 veces mayor que la versión de 128 dimensiones con una pérdida de naturalidad de solo 0,08 y 0,02 puntos respectivamente, lo que lo hace especialmente atractivo para aplicaciones donde el coste computacional es crítico. No se dispone de comparativas con otros codecs de audio como EnCodec o SoundStream en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con habla japonesa; su rendimiento en otros idiomas no está garantizado y probablemente degrade significativamente.
- Al ser un VAE, no genera texto ni realiza razonamiento; su uso se limita a tareas de codificación y reconstrucción de audio.
- La reducción de la dimensión latente a 32 puede introducir artefactos en audio fuera del dominio de entrenamiento (por ejemplo, música, ruido ambiental o voces no japonesas).
- El código de ejemplo desactiva la marca de agua (watermark) del modelo base, lo que podría tener implicaciones legales o éticas si se utiliza para generar contenido que deba ser rastreable.
- No se han documentado sesgos específicos, pero al entrenar con datos de habla japonesa, el modelo puede reflejar variaciones dialectales o demográficas presentes en los datos de entrenamiento.
- Para uso en producción, se recomienda validar la calidad de reconstrucción en el dominio objetivo, ya que las métricas UTMOSv2 se basan en muestras limitadas (100 por conjunto).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/musafa901/Semantic-DACVAE-Japanese-32dim
- Modelo base (Aratako/Semantic-DACVAE-Japanese): https://huggingface.co/Aratako/Semantic-DACVAE-Japanese
- Modelo base original (facebook/dacvae-watermarked): https://huggingface.co/facebook/dacvae-watermarked
- Repositorio oficial DACVAE: https://github.com/facebookresearch/dacvae
- Artículo Semantic-VAE: https://arxiv.org/abs/2509.22167
- Código de Descript Audio Codec (DAC): https://github.com/descriptinc/descript-audio-codec
