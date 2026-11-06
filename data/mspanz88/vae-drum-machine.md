# Mspanz88/vae-drum-machine

## Resumen

VAE Drum Machine es un modelo generativo de audio desarrollado por Mspanz88 (con código y documentación asociados al repositorio de GitHub de kevin-bretz) que implementa un autoencoder variacional (VAE) entrenado para generar e interpolar one-shots de batería en el espacio de tokens de Meta EnCodec. En lugar de operar directamente sobre formas de onda, el modelo trabaja sobre representaciones discretas producidas por el codec neuronal EnCodec, lo que reduce la dimensionalidad del problema y permite modelar la distribución latente de los sonidos de percusión.

El repositorio de Hugging Face (1,1 GB) distribuye principalmente checkpoints de entrenamiento y datos procesados: un checkpoint principal (`model.pt`), dos checkpoints intermedios (épocas 660 y 840), una caché de tokens EnCodec y el dataset de entrenamiento procesado para Google Colab. No se publican pesos en formato safetensors ni GGUF, sino ficheros `.pt` de PyTorch.

Su relevancia es acotada: se trata de un proyecto de nicho orientado a la síntesis e interpolación de samples de batería, sin benchmarks publicados ni soporte multilingüe (no aplica). Es útil para investigadores y desarrolladores de música generativa que quieran experimentar con VAEs sobre espacios latentes de codecs neuronales, pero no es un modelo de propósito general ni un LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (VAE) sobre tokens de Meta EnCodec |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a audio de one-shots) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoints); sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un VAE que opera en el espacio de tokens discretos generado por Meta EnCodec a partir de formas de onda de one-shots de batería. La arquitectura concreta (número de capas, dimensión latente, tamaño del encoder/decoder) no se detalla en la información disponible. El flujo de trabajo implícito es: audio de entrada, codificación con EnCodec, entrenamiento del VAE sobre la secuencia de tokens resultante y, en inferencia, muestreo del espacio latente y decodificación de vuelta a audio mediante EnCodec.

El entrenamiento se realizó sobre un dataset procesado (`Colab_Data.zip`) con una caché de tokens EnCodec precomputada (`encodec_cache.zip`). Se conservan checkpoints en las épocas 660 y 840, lo que sugiere un entrenamiento prolongado, aunque no se especifican número total de tokens, composición del dataset, ni si hubo ajuste fino con RLHF/DPO (no aplicable en este dominio). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de one-shots de batería sintéticos mediante muestreo del espacio latente del VAE.
- Interpolación entre samples de batería en el espacio latente, permitiendo transiciones continuas entre sonidos.
- Reconstrucción/codificación de audio de percusión a través del pipeline EnCodec + VAE.
- Modelado de distribuciones latentes de audio (capacidad propia de un VAE).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no aplica).
- No dispone de modo thinking, visión ni audio de entrada en sentido conversacional.

## Casos de uso

- Generación de samples de batería para producción musical: el VAE permite muestrear nuevos one-shots a partir de la distribución aprendida, útiles como fuente de sonidos en DAWs tras decodificar con EnCodec.
- Interpolación morfológica entre sonidos: dados dos one-shots de batería, se codifican con EnCodec, se interpolan sus latentes y se decodifica el resultado para obtener variantes híbridas, útil en diseño sonoro.
- Aumento de datos para entrenamiento de modelos de percusión: generar variaciones sintéticas de un dataset reducido de samples para ampliar la diversidad de entrenamiento.
- Investigación en modelos generativos de audio: servir como baseline reproducible de VAE sobre tokens de codec para comparar con modelos de difusión o transformers autoregresivos.
- Exploración de espacios latentes de audio: analizar la estructura del espacio latente (interpolaciones, vecinos cercanos) para estudiar cómo EnCodec organiza la información tímbrica de la percusión.
- Prototipado educativo: el repositorio incluye datos procesados y notebooks de Colab, lo que facilita reproducir el entrenamiento y experimentar con VAEs en audio en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al operar sobre tokens de EnCodec y no sobre formas de onda de alta frecuencia, la huella del VAE es probablemente moderada, pero no se documenta.
- GPU recomendadas: no disponible. El proyecto se entrenó aparentemente en Google Colab (por el nombre `Colab_Data.zip`), lo que sugiere compatibilidad con GPUs consumer tipo T4.
- Cabe en GPU consumer: probablemente sí en GPUs con 8-16 GB, aunque no confirmado por el autor.
- Opciones de despliegue: PyTorch nativo (carga de `.pt`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Espacio de representación | Licencia | Disponibilidad |
|---|---|---|---|---|
| VAE Drum Machine | VAE | Tokens EnCodec | MIT | Hugging Face (checkpoints `.pt`) |
| RAVE (IRCAM) | VAE/autoencoder | Forma de onda / latente continuo | no disponible en la información | Repositorio público |
| DDSP (Magenta) | Síntesis diferenciable | Parámetros de síntesis | no disponible en la información | Repositorio público |
| AudioLM / MusicLM (Google) | Transformer autoregresivo | Tokens de codec | no disponible en la información | No público en su mayoría |

La comparación es orientativa; no se dispone de datos de rendimiento comparables para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- No se han publicado benchmarks ni métricas objetivas de calidad de audio (FAD, MOS, etc.), por lo que el rendimiento real es desconocido.
- El modelo está especializado exclusivamente en one-shots de batería; no generaliza a otras categorías de audio.
- Depende críticamente de Meta EnCodec: la calidad del audio generado está acotada por la fidelidad del codec.
- No hay información sobre sesgos del dataset de entrenamiento (posible sobrerrepresentación de ciertos géneros o estilos de percusión).
- Riesgo de artefactos y alucinaciones sonoras en el muestreo del espacio latente, típico de VAEs con datos limitados.
- Licencia MIT permite uso comercial, pero el usuario debe verificar las licencias de EnCodec y de los datos de entrenamiento originales.
- No se documentan parámetros de arquitectura ni hiperparámetros, lo que dificulta la reproducibilidad y la evaluación rigurosa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Mspanz88/vae-drum-machine
- Código y documentación: https://github.com/kevin-bretz/VAEDrumMachine
- Meta EnCodec (dependencia): https://github.com/facebookresearch/encodec
