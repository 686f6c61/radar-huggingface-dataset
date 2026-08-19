# mispeech/midashenglm-gen

## Resumen

MiDashengLM-Gen es un modelo de generación de audio de extremo a extremo desarrollado por el equipo de investigación de Xiaomi (Xiaomi Research). Su objetivo es generar escenas de audio mixtas y coherentes a partir de descripciones de texto estructuradas, combinando simultáneamente habla, música, efectos de sonido y acústica ambiental. El modelo utiliza un gran modelo de lenguaje (LLM) preentrenado como columna vertebral, junto con un tokenizador de audio específico, y aplica un mecanismo de flow matching condicional por token para producir audio de forma autorregresiva y con longitud variable.

La arquitectura se compone de tres elementos principales: un tokenizador de audio Dasheng que convierte el audio en latentes de 768 dimensiones a 25 Hz (posteriormente reducidos a 5 Hz mediante un proyector), un LLM backbone basado en Qwen3-1.7B completamente afinado, y un modelo de difusión por flow matching (DiT) de 16 capas con dimensión oculta 2048 y 8 cabezas de atención. La inferencia emplea un solver ODE de Euler de 10 pasos con escala de guía sin clasificador (CFG) de 2.0, y un cabezal de parada aprendido permite truncar la generación en el momento adecuado. El modelo produce audio mono de 16 kHz en formato WAV.

Este modelo es relevante porque unifica la generación de múltiples componentes de audio (voz, música, efectos y ambiente) en un solo sistema, algo que tradicionalmente requería modelos separados. Su enfoque basado en LLM permite interpretar descripciones ricas y estructuradas, lo que abre la puerta a aplicaciones de creación de contenido, doblaje, simulación de entornos y asistentes de audio. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face con pesos en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM (Qwen3-1.7B) + tokenizador de audio Dasheng + DiT de flow matching (16 capas, hidden 2048, 8 cabezas) |
| Parametros totales | 2.885.826.948 (2,89 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (generación autorregresiva de audio de longitud variable) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la documentación está en inglés y chino, pero no se especifican idiomas de entrada/salida) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiDashengLM-Gen combina un LLM preentrenado (Qwen3-1.7B) con un tokenizador de audio Dasheng. El tokenizador convierte el audio en latentes de 768 dimensiones a 25 Hz, que luego se reducen a 5 Hz mediante un proyector de audio. El LLM, completamente afinado, procesa las descripciones de texto estructuradas y genera secuencias de latentes de audio de forma autorregresiva. Cada token de audio se refina mediante un modelo de difusión por flow matching (DiT) de 16 capas con dimensión oculta 2048 y 8 cabezas de atención, que aplica un proceso de denoising condicionado al token. Un cabezal de parada (stop head) binario aprendido decide cuándo truncar la generación, permitiendo longitudes variables.

El entrenamiento utiliza una pérdida de flow matching, aunque no se han publicado detalles sobre el volumen de datos, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La inferencia usa un solver ODE de Euler de 10 pasos con una escala CFG de 2.0, y el modelo acepta captions multi-vista con tokens especiales para describir diferentes aspectos de la escena: `<|caption|>` para la descripción general, `<|asr|>` para la transcripción del habla, `<|speech|>` para características del hablante, `<|sfx|>` para efectos de sonido, `<|music|>` para la música y `<|env|>` para el ambiente. Los elementos ausentes se indican con `<|unknown|>`.

## Capacidades

- Generación de escenas de audio mixtas que combinan habla, música, efectos de sonido y ambiente a partir de descripciones de texto estructuradas.
- Soporte de captions multi-vista con tokens especiales para controlar cada componente de audio por separado.
- Generación autorregresiva de audio de longitud variable con truncamiento automático mediante un cabezal de parada aprendido.
- Salida de audio mono de 16 kHz en formato WAV.
- Generación por lotes (batch) para procesar múltiples descripciones simultáneamente.
- Parámetros de generación ajustables: escala CFG (`eval_cfg`), umbral de parada (`stop_threshold`), pasos mínimos antes de parar (`min_stop_step`) y semilla aleatoria (`seed`) para reproducibilidad.

## Casos de uso

- Creación de contenido multimedia: generar bandas sonoras completas para vídeos, podcasts o presentaciones, combinando narración, música de fondo y efectos de sonido en una sola pasada. El modelo acepta una descripción global y detalles por componente, lo que facilita la producción de audio coherente sin herramientas de edición complejas.

- Doblaje y postproducción: añadir efectos de sonido y ambiente a escenas de vídeo o animación. Por ejemplo, describir una escena de comedia con risas del público, música de jazz y ambiente de club, y obtener un audio sincronizado con la acción.

- Simulación de entornos para realidad virtual o videojuegos: generar paisajes sonoros inmersivos que combinen voces, efectos y ambiente, mejorando la experiencia del usuario sin necesidad de grabar audio real.

- Asistentes de audio y accesibilidad: crear respuestas habladas con contexto sonoro, como un asistente que narra una historia con música y efectos, útil para audiolibros interactivos o aplicaciones educativas.

- Generación de datos sintéticos para entrenamiento: producir escenas de audio etiquetadas para entrenar otros modelos de reconocimiento de voz, separación de fuentes o clasificación de audio, especialmente cuando los datos reales son escasos o costosos de obtener.

- Investigación en generación de audio: servir como base para estudiar la integración de LLMs con modelos de difusión en el dominio del audio, o para experimentar con diferentes estrategias de condicionamiento y control de la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentación del modelo.
- El modelo tiene aproximadamente 2,89 mil millones de parámetros. En precisión FP16, los pesos ocuparían unos 5,8 GB, lo que sugiere que podría ejecutarse en GPUs de consumo con al menos 8-12 GB de VRAM, aunque no hay confirmación oficial.
- La inferencia requiere el uso de un LLM y un DiT, por lo que se recomienda una GPU con soporte CUDA y suficiente memoria para el modelo y los estados intermedios.
- El código de ejemplo utiliza `model.cuda()`, indicando que está diseñado para GPU.
- No se mencionan opciones de despliegue específicas como vLLM, llama.cpp u Ollama; el uso previsto es mediante la librería `transformers` con `trust_remote_code=True`.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre modelos comparables en la misma categoría (generación de audio mixto a partir de texto).

## Limitaciones y advertencias

- Restricciones de uso: el modelo no debe utilizarse para fines ilegales, fraudulentos o maliciosos, ni para infringir derechos de propiedad intelectual, privacidad u otros derechos de terceros, según se indica en la model card.
- No se han documentado sesgos conocidos, riesgos de alucinación ni limitaciones específicas de idioma o contexto en la información disponible.
- La generación de audio puede producir resultados inesperados o de baja calidad si las descripciones son ambiguas o contienen elementos contradictorios.
- El modelo genera audio a 16 kHz, lo que puede no ser suficiente para aplicaciones que requieran mayor fidelidad (por ejemplo, 44,1 kHz o 48 kHz).
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del uso que haga del modelo y de sus salidas.

## Enlaces

- Hugging Face: https://huggingface.co/mispeech/midashenglm-gen
- arXiv: https://arxiv.org/abs/2608.11804
- Página de demostración: https://xingws.github.io/midashenglm-gen-demo/
- Repositorio GitHub: https://github.com/xiaomi-research/midashenglm-gen
