# justin266596/stable-video-diffusion-img2vid-xt

## Resumen

Stable Video Diffusion Image-to-Video XT (SVD-XT) es un modelo de difusion latente desarrollado por Stability AI que genera clips de video cortos a partir de una imagen de referencia. Concretamente, toma una imagen fija como fotograma de condicionamiento y produce una secuencia de 25 fotogramas a resolucion 576x1024, extendiendo la version original de 14 fotogramas. Es un modelo de imagen-a-video, no un modelo de lenguaje, por lo que no procesa ni genera texto.

El modelo se distribuye bajo la licencia Stable Video Diffusion Community, que permite uso no comercial y de investigacion, mientras que el uso comercial requiere contactar con Stability AI. Esta ficha corresponde a una republicacion en HuggingFace bajo el identificador `justin266596/stable-video-diffusion-img2vid-xt`, con 1.524.623.082 parametros en formato safetensors y un repositorio de 32,6 GB.

Su relevancia radica en que fue uno de los primeros modelos abiertos de imagen-a-video con calidad competitiva frente a soluciones propietarias como GEN-2 o PikaLabs, y sigue siendo una referencia para investigacion en generacion de video y para pipelines creativos que requieren control local del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (latent diffusion) para imagen-a-video, con autoencoder VAE temporal y decoder f8 |
| Parametros totales | 1.524.623.082 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de video, no de texto); genera 25 fotogramas por clip |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | stable-video-diffusion-community (uso comercial sujeto a licencia de Stability AI) |
| Formato de pesos | safetensors (compatible con diffusers, `StableVideoDiffusionPipeline`) |

## Arquitectura y entrenamiento

SVD-XT es un modelo de difusion latente que opera en el espacio latente de un autoencoder variacional (VAE). El modelo parte de SVD Image-to-Video de 14 fotogramas y se ajusta finamente (fine-tuning) para generar 25 fotogramas a 576x1024, condicionado por un fotograma de contexto del mismo tamano. Ademas, se ajusta el decoder f8 ampliamente utilizado para mejorar la consistencia temporal, y se ofrece un decoder estandar fotograma a fotograma como alternativa (`svd_xt_image_decoder.safetensors`).

El entrenamiento se realizo integramente en Stability AI, con un coste aproximado de 200.000 horas de A100 80GB, mayoritariamente sobre 48 nodos de 8 A100, con unas emisiones estimadas de ~19.000 kg de CO2 equivalente y ~64.000 kWh de energia. No se retuvo ninguna fuente de datos potencial: todas las fuentes consideradas se incluyeron en el entrenamiento final, aplicando los metodos de filtrado de calidad descritos en el paper de SVD y filtros NSFW internos. No se empleo mano de obra humana en la preparacion de datos, aunque si se realizo evaluacion humana extensiva de calidad mediante plataformas de terceros (Amazon Sagemaker, Mechanical Turk, Prolific) con trabajadores angloparlantes remunerados a 12 USD/hora.

## Capacidades

- Generacion de video a partir de una imagen de condicionamiento (image-to-video).
- Produccion de clips de hasta 25 fotogramas a resolucion 576x1024 (aproximadamente 4 segundos).
- Mejora de consistencia temporal gracias al decoder f8 ajustado.
- Compatibilidad con la libreria `diffusers` mediante `StableVideoDiffusionPipeline`.
- No soporta control por texto (no es text-to-video).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje.
- No genera audio ni dispone de modo "thinking".

## Casos de uso

- Prototipado creativo y animacion de storyboards: a partir de un fotograma clave de un diseno, el modelo genera un clip corto que permite validar movimiento y ritmo antes de producir la animacion final.
- Generacion de contenido para redes sociales: clips de ~4 segundos a 576x1024 son adecuados para formatos verticales y permiten producir variaciones a partir de una imagen base sin depender de servicios en la nube.
- Investigacion en modelos generativos de video: el modelo sirve como base para estudiar sesgos, limites y tecnicas de mitigacion en difusion de video, tal como recomienda la propia model card.
- Herramientas educativas y de divulgacion: animacion de ilustraciones cientificas o historicas para explicar procesos, aprovechando que el modelo parte de una imagen controlada por el usuario.
- Previsualizacion en pipelines de VFX: generar animaticos rapidos a partir de concept art para discutir direccion de fotografia y movimiento de camara con el equipo.
- Red-teaming y evaluacion de seguridad: el modelo fue sometido a pruebas de terceros con mas del 90% de confianza en areas de seguridad y mas del 95% en videos reales y fiables, por lo que puede usarse como banco de pruebas para filtros de contenido.
- Arte generativo e instalaciones: integracion en flujos artisticos que requieren control local del modelo y no dependen de APIs propietarias.

## Benchmarks y rendimiento

La model card no publica metricas numericas de benchmarks estandar (FVD, CLIP score, etc.). El unico dato comparativo disponible es un estudio de preferencia humana que situa a SVD Image-to-Video por delante de GEN-2 (RunwayML) y PikaLabs en calidad de video, segun votantes humanos. No se detallan los porcentajes de preferencia ni el tamano de la muestra en la informacion proporcionada.

En cuanto a latencia, la model card indica que, con los ajustes por defecto en el momento del lanzamiento, SVD tarda aproximadamente 100 segundos por generacion y SVD-XT unos 180 segundos en una A100 80GB. Se mencionan optimizaciones para intercambiar calidad, memoria y velocidad, pero no se especifican sus parametros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo tiene 1.524.623.082 parametros y el repositorio ocupa 32,6 GB, por lo que se requiere una GPU de gran capacidad. La referencia de latencia se da sobre A100 80GB.
- GPU recomendadas: A100 80GB (referencia oficial de tiempos). No se documentan resultados en H100, RTX 4090 u otras GPU consumer.
- Cabe en GPU consumer: no confirmado en la informacion disponible; por el tamano del modelo y del repositorio, es probable que requiera tecnicas de offloading o cuantizacion no documentadas.
- Opciones de despliegue: `diffusers` con `StableVideoDiffusionPipeline`; el repositorio oficial de Stability AI (`generative-models`) implementa entrenamiento e inferencia. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusion de video).
- Latencia y throughput: ~180 s por clip de 25 fotogramas en A100 80GB con ajustes por defecto; ~100 s para la variante SVD de 14 fotogramas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SVD-XT (este modelo) | Imagen-a-video, difusion latente | 1.524.623.082 | 25 fotogramas, 576x1024 | stable-video-diffusion-community | HuggingFace, diffusers |
| SVD (14 fotogramas) | Imagen-a-video, difusion latente | no disponible en la informacion | 14 fotogramas, 576x1024 | stable-video-diffusion-community | HuggingFace, diffusers |
| GEN-2 (RunwayML) | Imagen/texto-a-video, propietario | no disponible | no disponible | propietaria | API comercial |
| PikaLabs | Imagen/texto-a-video, propietario | no disponible | no disponible | propietaria | API comercial |

La comparativa con GEN-2 y PikaLabs se limita al estudio de preferencia humana citado en la model card, donde SVD es preferido en calidad de video. No se dispone de datos numericos de parametros, contexto ni benchmarks para esos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Los videos generados son cortos (4 segundos o menos) y no alcanzan fotorrealismo perfecto.
- El modelo puede generar videos sin movimiento o con paneos de camara muy lentos.
- No se puede controlar mediante texto; solo acepta una imagen de condicionamiento.
- No renderiza texto legible.
- Las caras y las personas en general pueden no generarse correctamente.
- La parte de autoencoding del modelo es con perdida (lossy), lo que afecta a la fidelidad de los detalles.
- El modelo no fue entrenado para representaciones factuales o veridicas de personas o eventos; su uso para ese fin queda fuera de alcance.
- Uso comercial restringido: requiere licencia especifica de Stability AI (https://stability.ai/license); la licencia comunitaria cubre uso no comercial y de investigacion.
- Debe respetarse la Acceptable Use Policy de Stability AI.
- Riesgo de sesgos y alucinacion visual: al ser un modelo generativo, puede producir contenido no fiel a la imagen de entrada.
- La republicacion bajo el identificador `justin266596` tiene solo 21 descargas y 0 likes; no es el repositorio oficial de Stability AI, por lo que conviene verificar la integridad de los pesos frente al original.

## Enlaces

- HuggingFace (republicacion): https://huggingface.co/justin266596/stable-video-diffusion-img2vid-xt
- Repositorio oficial en HuggingFace: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt
- Repositorio GitHub de Stability AI: https://github.com/Stability-AI/generative-models
- Paper de SVD: https://stability.ai/research/stable-video-diffusion-scaling-latent-video-diffusion-models-to-large-datasets
- Licencia del modelo: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt/blob/main/LICENSE.md
- Licencia comercial de Stability AI: https://stability.ai/license
- Acceptable Use Policy: https://stability.ai/use-policy
- Documentacion de diffusers para autoencoder: https://huggingface.co/docs/diffusers/api/models/autoencoderkl#loading-from-the-original-format
- Decoder estandar: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt/blob/main/svd_xt_image_decoder.safetensors
