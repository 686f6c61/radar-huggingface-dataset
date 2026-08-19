# AlayaLab/AlayaWorld-v1.1-stage2b

## Resumen

AlayaWorld v1.1 Stage2b es un modelo de generación de video autoregresivo desarrollado por AlayaLab, presentado como el componente "teacher" de la etapa 2b dentro del pipeline de entrenamiento de AlayaWorld. Se trata de un fine-tuning del modelo LTX-2.3-22B, un Diffusion Transformer (DiT) de 22 000 millones de parámetros, especializado en síntesis de video condicionada por imagen (image-to-video) con memoria espacial de historial comprimido (ViGeo). El modelo está diseñado para servir como base de destilación en la etapa 3 del pipeline, permitiendo inferencia en 30 pasos.

La relevancia de este modelo radica en su enfoque híbrido: combina generación autoregresiva con difusión para producir secuencias de video coherentes y de alta calidad, incorporando un codificador de historial de frames que permite mantener consistencia temporal en secuencias largas. Está publicado bajo la licencia LTX-2 Community License, que restringe el uso comercial para entidades con ingresos anuales superiores a 10 millones de dólares.

El repositorio de HuggingFace contiene dos archivos: `transformer.pt` (25 GB) con los pesos del DiT fine-tuneado y `history_encoder.pt` (33 MB) para el codificador de historial. No se proporcionan datos sobre la longitud de contexto, idiomas soportados ni cuantizaciones disponibles, ya que el modelo se distribuye únicamente en formato de pesos completos (FP16 presumiblemente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) autoregresivo con memoria espacial ViGeo |
| Parametros totales | 22 000 millones (22B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos completos, presumiblemente FP16) |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License (academica y no comercial; uso comercial con restricciones) |
| Formato de pesos | `transformer.pt` (25 GB) y `history_encoder.pt` (33 MB), formato PyTorch |

## Arquitectura y entrenamiento

El modelo se basa en LTX-2.3-22B, un Diffusion Transformer de 22 000 millones de parámetros, fine-tuneado mediante supervisión (SFT) en la etapa 2b del pipeline AlayaWorld. La arquitectura incorpora un codificador de historial de frames comprimido (33 MB) que permite mantener coherencia temporal durante la generación autoregresiva de video. Segun la model card, el modelo actua como "teacher" para la destilacion de la etapa 3, lo que sugiere que fue entrenado para producir resultados de alta calidad que luego se transfieren a un modelo mas pequeño y rapido.

No se proporcionan detalles sobre la cantidad de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal reside en el uso de memoria espacial ViGeo, que comprime el historial de frames para permitir generacion de secuencias largas sin explosion de memoria. El modelo soporta tres rutas de inferencia segun el repositorio de AlayaLab, aunque los detalles tecnicos completos estan en los informes arxiv citados.

## Capacidades

- Generacion de video a partir de una imagen inicial (image-to-video) con movimiento de camara controlable.
- Generacion autoregresiva de secuencias de video con consistencia temporal gracias al history encoder.
- Modelado de mundo (world model): el modelo puede simular evoluciones plausibles de una escena a partir de un frame dado.
- Inferencia en 30 pasos (gracias a la destilacion de la etapa 3, aunque este checkpoint es el teacher).
- Soporte de tres rutas de inferencia documentadas en el repositorio AlayaWorld (configuraciones de camara y autoregresion).
- No se mencionan capacidades de texto, audio, tool calling ni agentes, ya que el modelo esta especializado exclusivamente en video.

## Casos de uso

- Generacion de clips de video para produccion audiovisual: a partir de una imagen fija (por ejemplo, un storyboard), el modelo puede generar una secuencia animada con movimiento de camara, util para previsualizacion en cine o publicidad.
- Simulacion de entornos para robotica: al ser un world model, puede predecir la evolucion de una escena a partir de un frame, permitiendo entrenar politicas de control en entornos simulados.
- Aumento de datos para entrenamiento de modelos de vision: generar variaciones realistas de videos de entrenamiento para mejorar la robustez de sistemas de deteccion o seguimiento.
- Creacion de contenido educativo y cientifico: generar animaciones de fenomenos fisicos o biologicos a partir de una imagen inicial, facilitando la visualizacion de conceptos complejos.
- Desarrollo de videojuegos: generar cinemáticas procedurales o fondos animados a partir de arte conceptual, reduciendo costes de produccion.
- Investigacion en generacion de video: servir como modelo teacher para destilacion de modelos mas eficientes, como se plantea en la etapa 3 del pipeline AlayaWorld.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como FVD, IS o comparaciones con otros modelos de generacion de video. Se recomienda consultar los informes tecnicos en arxiv (referencias en la seccion de enlaces) para obtener datos de evaluacion.

## Requisitos de hardware

- VRAM estimada: el archivo `transformer.pt` pesa 25 GB, por lo que en FP16 se requieren al menos 25 GB de VRAM solo para los pesos, mas overhead de activaciones y optimizador durante entrenamiento. Para inferencia, se estima un minimo de 40 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), H100 (80 GB) o RTX 4090 (24 GB, aunque probablemente insuficiente para los 22B en FP16; seria necesario cuantizacion, no disponible). Se recomienda al menos una GPU con 40 GB de memoria.
- No cabe en GPUs de consumo estandar (RTX 3090/4090 de 24 GB) sin cuantizacion, que no se proporciona oficialmente.
- Opciones de despliegue: el repositorio AlayaWorld proporciona scripts de inferencia y entrenamiento basados en PyTorch. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no es un LLM sino un generador de video.
- Latencia y throughput: no disponibles. La inferencia se realiza en 30 pasos de difusion, pero no se especifican tiempos por clip.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de generacion de video. El modelo base LTX-2 (Lightricks) es el unico punto de referencia directo, pero no se ofrecen metricas comparativas. Otros modelos de la categoria (como Sora de OpenAI, Gen-3 de Runway o Stable Video Diffusion) no tienen datos publicados en la informacion proporcionada. Se recomienda consultar los informes arxiv para una comparativa detallada.

## Limitaciones y advertencias

- Licencia restrictiva: la LTX-2 Community License permite uso academico y no comercial, pero el uso comercial por entidades con ingresos anuales superiores a 10 millones de dolares requiere una licencia adicional de Lightricks. Esto limita su adopcion en entornos empresariales grandes.
- Sin cuantizaciones oficiales: el modelo se distribuye solo en pesos completos (25 GB), lo que dificulta su despliegue en hardware con menos de 40 GB de VRAM.
- Idiomas no especificados: no se indica si el modelo soporta prompts en multiples idiomas o si solo trabaja con entradas visuales.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir artefactos o inconsistencias en escenas complejas, especialmente en secuencias largas.
- Dependencia del pipeline AlayaWorld: el checkpoint esta disenado para usarse con los configs y scripts del repositorio AlayaLab/AlayaWorld; su uso fuera de ese ecosistema puede requerir adaptaciones no documentadas.
- Tamaño del repositorio: el repositorio de HuggingFace muestra un tamano de 0.0 GB, lo que sugiere que los archivos pueden estar alojados externamente o que la metrica no se ha actualizado correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AlayaLab/AlayaWorld-v1.1-stage2b
- Repositorio GitHub AlayaWorld: https://github.com/AlayaLab/AlayaWorld
- Informe introductorio (arxiv 2607.06291): https://arxiv.org/abs/2607.06291
- Informe completo (arxiv 2607.18367): https://arxiv.org/abs/2607.18367
- Informe v1.1 (arxiv 2608.13492): https://arxiv.org/abs/2608.13492
- Licencia LTX-2: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
