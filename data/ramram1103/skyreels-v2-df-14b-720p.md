# ramram1103/SkyReels-V2-DF-14B-720P

## Resumen

SkyReels-V2-DF-14B-720P es un modelo de generacion de video de texto a video (text-to-video) desarrollado por Skywork AI, publicado originalmente en abril de 2025. Este checkpoint concreto, alojado en Hugging Face por el usuario ramram1103, es una re-subida del modelo oficial de Skywork. Se trata del primer modelo de generacion de video de codigo abierto que emplea la arquitectura AutoRegressive Diffusion-Forcing, una tecnica que combina modelos de difusion con forzado de tokens para permitir la generacion de secuencias de video de longitud practicamente infinita, superando las limitaciones de ventana fija de los modelos anteriores.

El modelo cuenta con aproximadamente 14.300 millones de parametros y genera video a resolucion 720p (720x1280) con 121 frames por secuencia, aunque su diseno autorregresivo permite extender la generacion de forma incremental. Segun sus desarrolladores, alcanza el estado del arte (SOTA) entre los modelos publicos de generacion de video en el momento de su lanzamiento. Incluye soporte para control de frames de inicio y fin, y se complementa con un modelo de captioning de video (SkyCaptioner-V1) y un mejorador de prompts. La licencia es la skywork-license, una licencia propia que restringe ciertos usos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AutoRegressive Diffusion-Forcing (difusion autorregresiva) |
| Parametros totales | 14.288.491.584 (~14,3 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (generacion de video de longitud infinita por diseno) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | skywork-license (licencia propia, no OSI) |
| Formato de pesos | safetensors (repo de 126,2 GB) |

## Arquitectura y entrenamiento

SkyReels-V2 emplea la arquitectura Diffusion-Forcing, propuesta en el articulo "Diffusion Forcing: Next-token Prediction Meets Full-Sequence Diffusion" (arxiv:2407.01392). Esta tecnica entrena un modelo de difusion de forma autorregresiva, prediciendo cada frame o segmento de video condicionado a los anteriores, pero con un esquema de ruido parcial que permite generar secuencias de longitud arbitraria sin necesidad de fijar una ventana maxima. El modelo se compone de un codificador-decodificador de video (probablemente basado en un VAE espacio-temporal) y un backbone de difusion con atencion, aunque los detalles exactos de la arquitectura interna no estan publicados en la informacion disponible.

El entrenamiento se realizo con datos de video a alta resolucion, pero no se han publicado cifras concretas sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El informe tecnico (arxiv:2504.13074) contiene los detalles completos, pero no estan resumidos en la model card. El modelo se publica en dos variantes de resolucion (540p y 720p) y tres tamanos (1,3 B, 5 B y 14 B), siendo este el de mayor capacidad.

## Capacidades

- Generacion de video a partir de prompts de texto en resolucion 720p (720x1280) con 121 frames por secuencia.
- Generacion de video de longitud infinita mediante extension autorregresiva: el modelo puede continuar generando frames mas alla de la secuencia inicial.
- Control de frames de inicio y fin: permite especificar el primer y ultimo frame del video generado (funcionalidad anadida en mayo de 2025).
- Generacion de video a partir de imagen (Image-to-Video) en la variante I2V, aunque este checkpoint concreto es solo texto a video.
- Integracion con SkyCaptioner-V1, un modelo de captioning de video que genera descripciones detalladas para entrenar o mejorar prompts.
- Incluye un mejorador de prompts (prompt enhancer) para refinar las entradas de texto.
- Compatible con el pipeline de diffusers (libreria declarada en Hugging Face), aunque la integracion oficial con diffusers figura como pendiente en la lista de tareas del proyecto.

## Casos de uso

- Produccion cinematografica independiente: los cineastas pueden generar secuencias de video de alta resolucion a partir de guiones textuales, con la capacidad de extender escenas de forma continua sin cortes visibles, gracias a la generacion de longitud infinita.
- Creacion de contenido para redes sociales: generacion de clips de 30 segundos o mas para plataformas como YouTube, TikTok o Instagram, con control de frames de inicio y fin para encajar en formatos especificos.
- Prototipado de anuncios publicitarios: las agencias pueden generar rapidamente storyboards animados en 720p para presentar conceptos a clientes antes de la produccion final, reduciendo costes de preproduccion.
- Generacion de material de entrenamiento para vision por computador: el modelo puede crear videos sinteticos etiquetados para aumentar datasets de entrenamiento en tareas como deteccion de objetos o seguimiento, aunque se requiere validacion de calidad.
- Educacion y divulgacion: creacion de videos explicativos animados a partir de texto para cursos online, tutoriales o material didactico, con la posibilidad de generar secuencias largas sin interrupcion.
- Videojuegos y entornos virtuales: generacion de cinematics o fondos animados para juegos independientes, aprovechando la resolucion 720p y el control de frames para integrar transiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo alcanza el estado del arte entre los modelos publicos de generacion de video, pero no se proporcionan metricas cuantitativas (como FVD, CLIP score o evaluaciones humanas) en los materiales consultados. El informe tecnico (arxiv:2504.13074) puede contener dichos datos, pero no estan resumidos en la documentacion accesible.

## Requisitos de hardware

- El tamano del repositorio es de 126,2 GB en safetensors, lo que sugiere que los pesos estan en precision FP16 o BF16 (aproximadamente 28,6 GB para 14,3 B de parametros, aunque el tamano extra puede deberse a pesos adicionales del VAE u otros componentes).
- No se han publicado requisitos oficiales de VRAM. Como estimacion, un modelo de 14 B en FP16 requiere al menos 30 GB de VRAM solo para los pesos, mas memoria para activaciones y el VAE, por lo que se necesitarian GPUs de 48 GB o multiples GPUs (por ejemplo, 2x A100 40GB o 2x RTX 6000 Ada).
- Con cuantizacion (por ejemplo, INT8 o INT4), podria caber en GPUs de 24 GB como la RTX 4090, pero no se han publicado cuantizaciones oficiales para este modelo.
- El codigo de inferencia oficial soporta ejecucion en una o multiples GPUs, segun el repositorio de GitHub.
- Opciones de despliegue: el codigo de inferencia esta disponible en el repositorio oficial de SkyReels-V2 en GitHub. La integracion con diffusers figura como pendiente, por lo que no se recomienda usar el pipeline de diffusers directamente sin verificacion.
- No se dispone de datos de latencia o throughput publicados.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros modelos de generacion de video en la informacion proporcionada. Modelos como Open-Sora, CogVideoX o Wan 2.1 podrian ser alternativas, pero no hay datos de rendimiento comparables disponibles en las fuentes consultadas. La model card afirma SOTA entre modelos publicos, pero sin metricas concretas no es posible establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La licencia skywork-license es una licencia propia que no es de codigo abierto estandar (no es OSI). Es necesario revisar los terminos completos en el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que puede imponer restricciones sobre el uso, la redistribucion o la generacion de contenido con fines lucrativos.
- No se han publicado datos sobre sesgos del modelo. Como todo modelo generativo de video, puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en representaciones de personas, culturas o escenarios.
- Riesgo de alucinacion visual: el modelo puede generar objetos, movimientos o escenas que no se corresponden con el prompt o que son fisicamente imposibles, especialmente en secuencias largas.
- La generacion de video de longitud infinita puede acumular errores o degradar la coherencia temporal en secuencias muy largas, aunque la arquitectura Diffusion-Forcing esta disenada para mitigarlo.
- No se especifican los idiomas soportados para los prompts de texto. Es probable que el modelo funcione mejor en ingles, dado el origen del dataset, pero no esta confirmado.
- El checkpoint alojado por ramram1103 es una re-subida del modelo oficial de Skywork. Se recomienda verificar la integridad de los pesos y utilizar preferentemente el repositorio oficial de Skywork para entornos de produccion.
- La integracion con diffusers no esta completada oficialmente, por lo que el uso del pipeline de diffusers puede requerir adaptaciones manuales o no funcionar correctamente.

## Enlaces

- Repositorio oficial en Hugging Face: https://huggingface.co/Skywork/SkyReels-V2-DF-14B-720P
- Repositorio de la re-subida (ramram1103): https://huggingface.co/ramram1103/SkyReels-V2-DF-14B-720P
- Codigo de inferencia en GitHub: https://github.com/SkyworkAI/SkyReels-V2
- Informe tecnico (arxiv:2504.13074): https://arxiv.org/pdf/2504.13074
- Paper de Diffusion Forcing (arxiv:2407.01392): https://arxiv.org/abs/2407.01392
- ModelScope: https://www.modelscope.cn/models/Skywork/SkyReels-V2-DF-14B-720P
- Coleccion de modelos SkyReels V2 en Hugging Face: https://huggingface.co/collections/Skywork/skyreels-v2-6801b1b93df627d441d0d0d9
- Playground oficial: https://www.skyreels.ai/home
- Discord de la comunidad: https://discord.gg/PwM6NYtccQ
