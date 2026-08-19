# obvious-research/onlyflow

## Resumen

OnlyFlow es un modelo de difusión de video condicionado por flujo óptico, desarrollado por Obvious Research en colaboración con La Sorbonne Université. Su objetivo es permitir un control fino del movimiento en la generación de video, algo que los modelos de texto a video convencionales no ofrecen. El modelo se basa en stable-diffusion-v1-5 y utiliza el flujo óptico extraído de un video de entrada como condicionamiento adicional, con un parámetro gamma que regula la influencia de ese flujo en la salida.

Fue entrenado sobre el dataset Webvid-10M durante 20 horas en un nodo de 8 GPUs A100. Los pesos se publican en formato fp32, fp16 y safetensors, y el modelo está disponible bajo licencia Apache 2.0. Su relevancia radica en que ofrece un mecanismo explícito de control de movimiento, útil para aplicaciones artísticas y de edición de video donde se requiere mantener la estructura temporal de una secuencia de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de video basado en stable-diffusion-v1-5, con condicionamiento por flujo optico (probablemente sobre AnimateDiff, aunque no se especifica explicitamente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | fp16, fp32 (pesos publicados en ambos formatos) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ckpt |

## Arquitectura y entrenamiento

OnlyFlow es un modelo de difusion de video que extiende stable-diffusion-v1-5 incorporando un condicionamiento adicional basado en flujo optico. El flujo optico se extrae de un video de entrada y se introduce en el proceso de difusion para guiar el movimiento de los objetos y la camara. El parametro gamma permite ajustar la intensidad de este condicionamiento: con gamma=0 el flujo no influye, y con gamma=1 se aplica completamente. Esta innovacion permite desacoplar el contenido visual del movimiento, algo que los modelos de texto a video puros no logran.

El entrenamiento se realizo sobre el dataset Webvid-10M, que contiene aproximadamente 10 millones de pares video-texto. Se utilizo un nodo con 8 GPUs A100 durante 20 horas. No se mencionan tecnicas de RLHF ni DPO; el entrenamiento es de tipo supervisado clasico para modelos de difusion. El modelo base es stable-diffusion-v1-5, y segun el texto de la model card, los autores planean adaptarlo a otros modelos base ademas de AnimateDiff, lo que sugiere que la implementacion actual se apoya en AnimateDiff como backbone de video.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con control de movimiento mediante flujo optico.
- Acepta un video de entrada del que se extrae el flujo optico para condicionar la generacion.
- Parametro gamma ajustable para controlar la influencia del flujo optico en la salida (0, 0.5, 0.75, 1).
- Sensible a la tasa de frames del video de entrada; se recomienda muestrear a 8 fps para obtener resultados optimos.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas: solo ingles (etiqueta "en").
- No incluye capacidades de vision ni audio; es exclusivamente generacion de video.

## Casos de uso

- Creacion de animaciones artisticas: un artista puede proporcionar un video base con el movimiento deseado y generar una nueva version con contenido visual diferente, manteniendo la dinamica original gracias al flujo optico.
- Edicion de video con reemplazo de contenido: se puede sustituir el aspecto de un objeto o escena en un video existente mientras se conserva el movimiento, util para efectos visuales en producciones audiovisuales.
- Control de camara en generacion de video: al condicionar con flujo optico de un video de referencia, se puede replicar un movimiento de camara especifico (pan, tilt, zoom) en una escena generada desde texto.
- Prototipado rapido de storyboards animados: los cineastas pueden generar versiones preliminares de una secuencia usando un video de referencia para el movimiento y texto para el contenido.
- Generacion de video con control fino de dinamica: en aplicaciones de simulacion o visualizacion, se puede ajustar la intensidad del movimiento con gamma para obtener desde una animacion sutil hasta una muy dinamica.
- Investigacion en condicionamiento de movimiento: sirve como base para experimentar con tecnicas de control de flujo optico en modelos de difusion, dado que el codigo y los pesos estan publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas como FVD, IS o comparaciones con otros modelos. Solo se muestran ejemplos visuales cualitativos en el sitio del proyecto.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware para inferencia en la model card.
- El entrenamiento se realizo en un nodo de 8 GPUs A100 durante 20 horas, lo que da una idea de la escala de computo necesaria para el entrenamiento.
- El tamano del repositorio es de 2.6 GB, lo que sugiere que los pesos en fp16 ocupan aproximadamente 1.3 GB (si se almacenan en ese formato) y en fp32 unos 2.6 GB. Esto indica que podria ejecutarse en GPUs consumer con al menos 8 GB de VRAM, aunque no hay confirmacion oficial.
- Para despliegue, se proporciona un Space de HuggingFace con interfaz Gradio y un script de inferencia en el repositorio de GitHub. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia especificos.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El modelo se basa en stable-diffusion-v1-5 y probablemente en AnimateDiff, por lo que es conceptualmente similar a otros modelos de difusion de video como AnimateDiff, ModelScope T2V o VideoCrafter. Sin embargo, no hay cifras de rendimiento ni comparaciones directas disponibles. Se puede considerar que su diferenciador principal es el condicionamiento por flujo optico, que no es comun en esos modelos.

## Limitaciones y advertencias

- El modelo es sensible a la tasa de frames del video de entrada; si no se obtienen los resultados deseados, se recomienda reducir la tasa a 8 fps.
- Solo soporta el idioma ingles en las instrucciones de texto.
- Entrenado exclusivamente en Webvid-10M, un dataset de videos con texto en ingles, por lo que puede presentar sesgos relacionados con el contenido y los estilos de ese corpus.
- No se mencionan limitaciones sobre alucinacion o calidad en escenarios complejos, pero al ser un modelo de difusion, puede generar artefactos visuales o inconsistencias temporales.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente y no se ofrecen garantias.
- El modelo esta en una fase de investigacion; los autores indican que estan trabajando en mejoras y en adaptarlo a otros modelos base, por lo que la version actual puede tener limitaciones no documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/obvious-research/onlyflow
- Paper (arXiv): https://arxiv.org/pdf/2411.10501
- Codigo en GitHub: https://github.com/obvious-research/OnlyFlow
- Sitio del proyecto: https://obvious-research.github.io/onlyflow/
- Space de HuggingFace (demo Gradio): https://huggingface.co/spaces/obvious-research/OnlyFlow
