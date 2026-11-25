# hazhu/mlx-uvr-mdx-net

## Resumen

mlx-uvr-mdx-net es una implementación en MLX del modelo UVR-MDX-NET-Inst_HQ_5, una red neuronal especializada en la separación de voces y acompañamiento musical (vocal/accompaniment separation). Lo desarrolla el usuario hazhu y se distribuye bajo licencia MIT. El modelo toma como base el conocido UVR-MDX-NET-Inst_HQ_5 del ecosistema Ultimate Vocal Remover (UVR5) y lo reempaqueta para ejecutarse nativamente sobre Apple Silicon (MacBook, Mac mini, iMac) mediante el framework MLX de Apple, sin necesidad de PyTorch ni de sus dependencias.

El problema que resuelve es concreto: aislar voces limpias de pistas de audio con música de fondo, generando dos salidas separadas (voz y acompañamiento). Tradicionalmente estos flujos dependían de PyTorch y de entornos con GPU NVIDIA; esta versión elimina esa dependencia y aprovecha la GPU unificada de los chips Apple (M-series) a través de MLX, lo que simplifica el despliegue en equipos de sobremesa y portátiles de Apple.

El repositorio es pequeño (0,1 GB) e incluye los pesos en formato ONNX junto con la lógica de inferencia en MLX. No es un modelo de lenguaje generativo ni un transformer de texto: es una red de separación de fuentes de audio (MDX-Net), por lo que sus capacidades se limitan al procesamiento de audio. La información pública sobre arquitectura interna, número de parámetros y datos de entrenamiento es escasa; los datos disponibles se detallan a continuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de separación de fuentes de audio MDX-Net (basada en UVR-MDX-NET-Inst_HQ_5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en, zh (según metadatos; el modelo procesa audio, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (modelos UVR-MDX-NET-Inst_HQ_5.onnx y UVR-MDX-NET-Inst_HQ_3.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en MDX-Net, una familia de redes neuronales para separación de fuentes musicales que opera sobre representaciones tiempo-frecuencia del audio (espectrogramas). La implementación concreta utiliza parámetros de inferencia definidos en el código: `dim_f=2560`, `dim_t=8`, `n_fft=6144`, `margin=44100` y `chunks=15` para el predictor HQ_5, y `dim_f=3072` con `denoise=True` para el predictor HQ_3. Estos parámetros describen la configuración de la red y del procesamiento por fragmentos (chunking) del audio de entrada.

La innovación principal de este repositorio no está en el entrenamiento (hereda los pesos del modelo base UVR-MDX-NET-Inst_HQ_5) sino en la portabilidad: reimplementa la inferencia sobre el framework MLX de Apple, eliminando la dependencia de PyTorch. No se dispone de información pública sobre el número de tokens de audio, la composición del dataset de entrenamiento original ni si hubo técnicas de refinamiento posteriores. El repositorio incluye dos variantes de calidad: HQ_5 (modo rápido, por defecto) y HQ_3 (modo de alta calidad, más lento, con denoising activado).

## Capacidades

- Separación de voces y acompañamiento musical: genera dos pistas separadas (voz limpia y música de fondo) a partir de una pista de audio mixta.
- Procesamiento por fragmentos (chunking) con solapamiento (`margin=44100`) para manejar audios de duración arbitraria.
- Dos modos de calidad: rápido (HQ_5) y alta calidad con denoising (HQ_3).
- Ejecución nativa en Apple Silicon mediante MLX, sin PyTorch.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente: es exclusivamente un modelo de audio.
- Capacidades multilingües: no aplica al ser un modelo de audio; los idiomas declarados (en, zh) figuran en los metadatos pero no condicionan su funcionamiento.

## Casos de uso

- Karaoke y pistas instrumentales: a partir de una canción, el modelo genera la pista de acompañamiento sin voz, útil para crear versiones instrumentales para karaoke o práctica musical.
- Producción musical y remezclas: separar la voz para aplicar efectos, ecualización o recompresión independiente sobre ella, y trabajar la instrumentación por separado en el DAW.
- Limpieza de grabaciones: aislar la voz principal de una grabación con música de fondo para obtener una pista vocal más limpia destinada a transcripción o archivo.
- Creación de contenido para redes: generar versiones instrumentales de temas con derechos gestionados por el usuario para vídeos, pódcast o streaming.
- Investigación y docencia en separación de fuentes: servir como referencia práctica de MDX-Net ejecutándose en MLX, útil para estudiar el flujo de inferencia sin depender de PyTorch.
- Procesamiento local en equipos Apple: al ejecutarse en MacBook, Mac mini o iMac con MLX, permite separar audio en local sin subir ficheros a servicios en la nube, lo que resulta adecuado para material sensible o para trabajar sin conexión.
- Automatización por lotes: el script `extract_vocals.py` procesa los ficheros colocados en `wav/_src` y vuelca las salidas en `wav/vocal` y `wav/music`, lo que facilita integrarlo en flujos por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (SDR, SI-SNR, etc.) ni comparaciones numéricas con otros modelos de separación. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM/ memoria unificada: no se especifica. El repositorio ocupa 0,1 GB, por lo que el modelo es ligero y cabe holgadamente en la memoria unificada de cualquier chip Apple Silicon.
- GPU recomendadas: chips Apple M-series (M1, M2, M3 y posteriores) en MacBook, Mac mini e iMac, al ser el único backend soportado (MLX).
- GPU NVIDIA/AMD: no soportadas por esta implementación, que depende de MLX y no de PyTorch/CUDA.
- Cabe en consumer hardware: sí, en equipos Apple Silicon de gama consumer.
- Opciones de despliegue: ejecución directa con Python mediante `extract_vocals.py` y las dependencias de `requirements.txt`. No se documenta integración con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. La model card indica que el modo HQ_3 es más lento que HQ_5, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Backend | Licencia | Disponibilidad |
|---|---|---|---|---|
| mlx-uvr-mdx-net (este) | Separación vocal MDX-Net | MLX (Apple Silicon) | MIT | Hugging Face |
| UVR-MDX-NET-Inst_HQ_5 (modelo base) | Separación vocal MDX-Net | PyTorch/ONNX | no disponible en la información | Ecosistema UVR5 |
| UVR-MDX-NET-Inst_HQ_3 | Separación vocal MDX-Net (alta calidad) | PyTorch/ONNX | no disponible en la información | Ecosistema UVR5 |

La comparación cuantitativa de parámetros, contexto y rendimiento no está disponible. La diferencia principal frente a las alternativas del ecosistema UVR es el backend: este repositorio ejecuta la inferencia en MLX para Apple Silicon sin PyTorch, mientras que las variantes originales dependen de PyTorch/ONNX.

## Limitaciones y advertencias

- Exclusivo de Apple Silicon: al depender de MLX, no funciona en GPUs NVIDIA, AMD ni en CPU de otras plataformas sin adaptación.
- Modelo de audio, no de texto: no ofrece generación de lenguaje, razonamiento ni capacidades de agente; cualquier expectativa en ese sentido es errónea.
- Calidad dependiente del modo: el modo rápido (HQ_5) puede dejar artefactos o voces residuales en mezclas complejas; el modo HQ_3 mejora la limpieza a costa de mayor tiempo de proceso.
- Sin métricas publicadas: no hay benchmarks objetivos que permitan comparar su calidad de separación con alternativas.
- Documentación mínima: la información sobre arquitectura interna, parámetros y entrenamiento es escasa; la model card se centra en el uso.
- Idiomas declarados (en, zh) poco relevantes: al procesar audio, el rendimiento puede variar según el tipo de música y la mezcla, no según el idioma.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base UVR-MDX-NET-Inst_HQ_5, cuya licencia no se detalla en la información disponible.
- Riesgo de artefactos: como todo modelo de separación de fuentes, puede introducir artefactos espectrales, especialmente en pasajes con instrumentación densa o voces superpuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hazhu/mlx-uvr-mdx-net
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Proyecto Ultimate Vocal Remover (UVR5): https://github.com/Anjok07/ultimatevocalremovergui
