# LiberalMind/vae-model

## Resumen

LiberalMind Video VAE es un autoencoder variacional (VAE) para vídeo desarrollado por LiberalMind en el marco de su iniciativa de investigación en inteligencia encarnada (embodied AI). El modelo aprende representaciones comprimidas del mundo visual codificando y reconstruyendo secuencias cortas de vídeo, con un objetivo de entrenamiento que combina reconstrucción a nivel de píxel, similitud perceptual (LPIPS con VGG) y regularización del espacio latente. Está pensado como componente de investigación para percepción robótica, comprensión temporal del vídeo y trabajo exploratorio hacia modelos del mundo.

El checkpoint se entrenó con PyTorch sobre Google Cloud TPU usando el stack PyTorch/XLA con paralelismo de datos SPMD, en precisión BF16 y optimizador AdamW con tasa de aprendizaje 1e-4. La entrada es RGB a 256 × 256 píxeles con secuencias de 17 fotogramas consecutivos. El repositorio ocupa 5,9 GB y es fundamentalmente un repositorio de checkpoint: no incluye los scripts de definición del modelo (`vae.py`) ni de entrenamiento (`train.py`), que deben obtenerse por separado, por lo que no es posible instanciar la arquitectura solo con los pesos descargados.

Es relevante ahora como pieza de infraestructura para pipelines de representación visual en robótica y agentes autónomos, aunque con un alcance deliberadamente acotado: el autor distingue explícitamente que este checkpoint es un modelo de reconstrucción de vídeo y no un modelo predictivo del mundo condicionado por acciones. No se han publicado parámetros totales, longitud de contexto en tokens ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (VAE) para vídeo, implementado en PyTorch |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada: secuencias de 17 fotogramas a 256 × 256 RGB) |
| Tipos de cuantización | no disponible (entrenamiento en BF16; no se documentan cuantizaciones de inferencia) |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo procesa vídeo, no texto) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`last.pt`); no se distribuyen safetensors ni GGUF |
| Resolución de entrada | 256 × 256 píxeles, 3 canales RGB |
| Longitud temporal | 17 fotogramas por muestra |
| Precisión de entrenamiento | BF16 |
| Optimizador | AdamW, learning rate 1e-4 |
| Batch size por defecto | 8 |
| Objetivo de entrenamiento | 200.000 pasos por defecto |
| Pérdida perceptual | LPIPS (VGG) |
| Acelerador | Google Cloud TPU con PyTorch/XLA y SPMD |
| Tamaño del repositorio | 5,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder variacional para vídeo cuya implementación concreta reside en `vae.py`, un archivo que no forma parte del repositorio y que debe aportarse por separado; por tanto, la información pública no detalla el número de capas, la dimensión del espacio latente ni la estructura exacta del encoder y el decoder. El entrenamiento documentado combina tres componentes de pérdida: reconstrucción a nivel de píxel, similitud perceptual mediante LPIPS con extractor VGG y regularización del término KL propio de un VAE. La entrada son clips de 17 fotogramas consecutivos a 256 × 256 píxeles en RGB.

El pipeline se ejecuta sobre Google Cloud TPU con PyTorch 2.8.0 y `torch_xla[tpu]` 2.8.0, usando paralelismo de datos SPMD; el batch global debe ser divisible por el número de dispositivos TPU. El dataset documentado son archivos MP4 en `~/ego256/`, con resolución exacta de 256 × 256, al menos 20 fotogramas decodificables y metadatos de frame rate válidos; el cargador no redimensiona, por lo que el preprocesado debe hacerse antes. El muestreo de vídeos se pondera por número de fotogramas y se aplica volteo horizontal aleatorio con probabilidad 0,5. No se documentan número total de tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO, que no aplican a un modelo de reconstrucción.

## Capacidades

- Codificación y reconstrucción de clips de vídeo de 17 fotogramas a 256 × 256 píxeles en RGB.
- Aprendizaje de representaciones latentes comprimidas del contenido visual, útiles como entrada para otros modelos o políticas.
- Modelado temporal a corto plazo dentro de la ventana de 17 fotogramas.
- Procesamiento de vídeo egocéntrico (la ruta del dataset, `ego256`, sugiere entrenamiento orientado a percepción en primera persona).
- Componente potencial para percepción de robots y agentes encarnados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No procesa texto ni audio; las capacidades multilingües no aplican.
- No realiza predicción de estados futuros condicionada por acciones, según aclara el propio autor.

## Casos de uso

- Compresión de vídeo para almacenamiento en robótica: el VAE puede codificar secuencias de cámara egocéntrica en representaciones latentes compactas, reduciendo el coste de almacenar y transmitir datos de sensores visuales en flotas de robots.
- Preentrenamiento de representaciones visuales: servir como extractor de características congelado para entrenar cabezas de política o de clasificación sobre el espacio latente en tareas de manipulación.
- Detección de anomalías en vídeo industrial: reconstruir clips de una línea de producción y usar el error de reconstrucción (píxel y LPIPS) como señal de desviación respecto al comportamiento normal.
- Investigación en modelos del mundo: emplear el encoder y decoder como módulo de compresión visual dentro de arquitecturas mayores que sí modelen dinámica y acciones, dado que el propio autor lo plantea como componente hacia futuros world models.
- Análisis de vídeo egocéntrico en investigación de comportamiento: procesar grabaciones en primera persona para obtener latentes temporales sobre los que estudiar patrones de movimiento o interacción.
- Prototipado de percepción en entornos simulados: integrar el VAE en un bucle de simulación para generar y comparar reconstrucciones de observaciones sintéticas antes de desplegar en hardware real.
- Filtrado y curación de datasets de vídeo: usar la calidad de reconstrucción como criterio para descartar clips corruptos, mal encuadrados o con metadatos inconsistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El entrenamiento documentado requiere una VM de Google Cloud TPU con runtime funcional, Python 3.10, PyTorch 2.8.0, `torch_xla[tpu]` 2.8.0, torchvision 0.23.0, numpy, av, lpips y huggingface_hub.
- El repositorio ocupa 5,9 GB, lo que da una cota inferior del espacio en disco necesario para el checkpoint; el tamaño exacto en VRAM depende de la arquitectura, que no está documentada.
- No se especifican GPU recomendadas ni requisitos de VRAM para inferencia; al no publicarse el número de parámetros, no es posible estimar si cabe en GPU de consumo.
- El checkpoint es un `.pt` de PyTorch y requiere `vae.py` para instanciar la arquitectura, por lo que no es cargable directamente con llama.cpp, Ollama ni TGI, orientados a modelos de lenguaje.
- No se documentan latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| LiberalMind Video VAE | VAE de vídeo | 17 × 256 × 256 RGB | no disponible | Checkpoint en HF, sin código de arquitectura |
| Modelos de video VAE de la familia Stable Video Diffusion | VAE de vídeo | Resoluciones variables | no disponible en esta ficha | Pesos publicados con código |
| VideoMAE | Masked autoencoder de vídeo | Clips de vídeo | no disponible en esta ficha | Pesos publicados con código |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no incluye `vae.py` ni `train.py`; sin esos archivos no se puede instanciar el modelo ni reproducir el entrenamiento, solo descargar los pesos.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue en producción.
- El modelo reconstruye vídeo; no predice estados futuros ni está condicionado por acciones, pese a las etiquetas de world modeling del repositorio.
- La ventana temporal es de solo 17 fotogramas, insuficiente para razonamiento sobre eventos de largo plazo.
- La resolución está fijada a 256 × 256 y el cargador documentado no redimensiona, por lo que entradas de otra resolución requieren preprocesado explícito.
- No hay información sobre sesgos del dataset de entrenamiento, composición demográfica ni cobertura geográfica.
- El riesgo de alucinación en el sentido de los modelos de lenguaje no aplica, pero sí el de reconstrucciones plausibles que difuminen detalles relevantes para una tarea downstream.
- No se han publicado métricas de calidad de reconstrucción ni comparaciones con baselines.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, sin validación externa conocida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LiberalMind/vae-model
- PyTorch/XLA: https://github.com/pytorch/xla
- LPIPS: https://github.com/richzhang/PerceptualSimilarity
- PyTorch: https://pytorch.org
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
