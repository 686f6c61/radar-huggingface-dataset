# Shreyansh1409/SkyReels-V3-R2V-14B

## Resumen

SkyReels-V3-R2V-14B es el modelo de referencia a vídeo (reference-to-video, R2V) de la familia SkyReels V3, desarrollada por Skywork AI. A partir de entre 1 y 4 imágenes de referencia y un prompt de texto, sintetiza secuencias de vídeo coherentes manteniendo la fidelidad de identidad de personajes, objetos y fondos, y con consistencia narrativa entre planos. Forma parte de un marco unificado de aprendizaje multimodal en contexto que cubre tres capacidades: generación multi-sujeto desde referencias, generación guiada por audio y vídeo a vídeo, repartidas en tres variantes (R2V 14B, V2V 14B y A2V 19B) a 720P.

El modelo cuenta con 14.288.491.584 parámetros (unos 14,3 B) almacenados en safetensors, con un repositorio de 51,8 GB, y se distribuye con integración en la librería diffusers a través de la clase de pipeline `WanPipeline`, lo que apunta a una arquitectura de transformer de difusión compatible con el ecosistema Wan. Está pensado para cargas de trabajo de generación de vídeo condicionada por imagen de referencia: publicidad con personajes recurrentes, previsualización de storyboards o creación de contenido a partir de material fotográfico existente.

La relevancia actual del modelo radica en que unifica varias tareas de generación de vídeo bajo un mismo esquema de condicionamiento por contexto, en lugar de requerir modelos separados para cada una. La licencia es la skywork-license (etiquetada como `other`), por lo que su uso comercial está sujeto a los términos del archivo LICENSE del repositorio. Es importante señalar que la ficha consultada corresponde a una copia publicada por el usuario Shreyansh1409 con 0 descargas y 0 me gusta; la versión oficial es Skywork/SkyReels-V3-R2V-14B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video (pipeline `WanPipeline` en diffusers; marco multimodal de aprendizaje en contexto de SkyReels V3). No se detalla la configuracion interna (numero de capas, dim, atencion) en la informacion disponible |
| Parametros totales | 14.288.491.584 (aproximadamente 14,3 B) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje y la model card no documenta una ventana de contexto en tokens. La duracion del video se controla por parametro (`--duration`, ejemplo de 5 s) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, FP8 o INT8 documentadas |
| Idiomas soportados | no disponible; los prompts de ejemplo de la model card estan en ingles |
| Licencia | skywork-license (etiquetada como `other`, con enlace al archivo LICENSE del repositorio) |
| Formato de pesos | safetensors |
| Tarea (pipeline) | image-to-video; en la practica, reference-to-video (1 a 4 imagenes de referencia + prompt) |
| Resolucion de salida | 720P (segun la variante 14B-720P de la familia V3) |
| Tamano del repositorio | 51,8 GB |
| Libreria | diffusers |
| Entorno recomendado por el autor | Python 3.12+, CUDA 12.8+ |
| Repositorio | Shreyansh1409/SkyReels-V3-R2V-14B (copia de terceros; oficial: Skywork/SkyReels-V3-R2V-14B) |
| Fecha de creacion / actualizacion | 2026-09-22 (creado y actualizado el mismo dia) |

## Arquitectura y entrenamiento

La informacion disponible indica que SkyReels V3 se construye sobre un marco unificado de aprendizaje multimodal en contexto que soporta de forma nativa tres capacidades generativas: generacion de video multi-sujeto a partir de imagenes de referencia, generacion de video guiada por audio y generacion de video a video. La etiqueta `diffusers:WanPipeline` del repositorio indica compatibilidad con la clase de pipeline de Wan dentro de diffusers, lo que situa al modelo en la familia de transformers de difusion para video. La model card no especifica el numero de capas, la dimension del modelo, el tipo de atencion ni la estrategia de compresion latente empleada en esta variante concreta.

Tampoco se detallan en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de ajuste por preferencias (RLHF/DPO). Lo que si se documenta es el linaje tecnico de la familia: la variante de audio se publico en el informe tecnico SkyReels-Audio (arXiv:2506.00830), centrado en retratos parlantes condicionados por audio en transformers de difusion para video, y la generacion de video de duracion extendida y el control de fotogramas inicial/final de la generacion anterior (SkyReels-V2) se apoyan en un modelo de diffusion forcing con generacion autorregresiva de longitud practicamente ilimitada. Para SkyReels V3, el informe tecnico asociado es arXiv:2601.17323. No se han publicado en la informacion disponible detalles sobre innovaciones adicionales especificas de la variante R2V.

## Capacidades

- Generacion de video a partir de 1 a 4 imagenes de referencia mas un prompt de texto, con fidelidad de identidad para personajes, objetos y fondos, y consistencia narrativa entre planos.
- Composicion multi-sujeto: capacidad de integrar varios elementos visuales de referencia en una misma escena generada.
- Generacion a 720P, con duracion configurable mediante el parametro `--duration` (el ejemplo de la model card usa 5 segundos).
- Ejecucion en una sola GPU mediante el script oficial `generate_video.py`, con soporte de descarga de CPU (`--offload`) para reducir el consumo de memoria.
- Integracion con el ecosistema diffusers a traves del pipeline `WanPipeline`.
- Capacidades de la familia V3 no incluidas en esta variante pero si en el marco unificado: generacion guiada por audio y avatares parlantes (variante A2V, 19B) y video a video / extension de video (variante V2V, 14B).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni generacion de codigo o texto: es un modelo generativo de video, no un modelo de lenguaje.
- No se documentan capacidades multilingues especificas para los prompts.

## Casos de uso

- Publicidad con personaje recurrente: a partir de 1 a 4 fotografias de una modelo o de un producto se pueden generar planos de video sucesivos que mantengan la identidad del sujeto entre tomas, lo que evita rehacer sesiones fotograficas para cada pieza de campana.
- Previsualizacion de storyboards para produccion audiovisual: el equipo de guion puede pasar bocetos o fotogramas de referencia junto a un prompt descriptivo y obtener un previsionado en video a 720P antes de rodar, reduciendo el coste de las pruebas de concepto.
- Catalogo de producto en comercio electronico: fotos de catalogo de un articulo se convierten en clips de video de 5 segundos con el articulo como sujeto consistente, utiles para fichas de producto y anuncios en redes.
- Creacion de contenido para redes sociales: generacion de clips cortos con un mismo personaje a partir de un pequeno conjunto de imagenes de referencia, sin necesidad de rodaje ni de equipo de produccion.
- Cinematicas para videojuegos: partiendo de concept art o renders de personajes se pueden prototipar cinemáticas y secuencias de presentacion manteniendo el diseno visual del estudio entre planos.
- Moda y prueba virtual de vestuario: con imagenes de referencia de una prenda y de una persona, el modelo puede generar planos donde la prenda se mantiene coherente, util para previsualizar colecciones antes de fabricarlas.
- Contenido educativo y narrativo seriado: creacion de episodios cortos con personajes recurrentes a partir de un conjunto fijo de referencias, aprovechando la consistencia de identidad para mantener continuidad entre capitulos.
- Prototipado en pipelines de generacion de video mas amplios: al estar integrado en diffusers, el modelo puede encadenarse con otros componentes (por ejemplo, extension de video de la variante V2V) dentro de un flujo automatizado de post-produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas comparativas de metricas cuantitativas (FVD, CLIPSim, VBench u otras) ni comparaciones numericas con otros modelos. Los unicos datos objetivos disponibles son el recuento de parametros (14.288.491.584) y el tamano del repositorio (51,8 GB). No se deben asumir cifras de rendimiento no documentadas.

## Requisitos de hardware

- VRAM estimada para los pesos: 14,3 B de parametros en bf16/fp16 equivalen a unos 28,6 GB solo en pesos. A esa cifra hay que sumar el codificador de texto, el VAE y las activaciones de atencion sobre secuencias de video, por lo que la inferencia completa necesita bastante mas que el tamano de los pesos.
- GPU recomendadas: A100 80 GB o H100 para ejecucion sin descarga de CPU a 720P. En A100 40 GB es probable que sea necesario activar `--offload`.
- Consumer GPU: con la bandera `--offload` documentada por el autor, cabe plantear la ejecucion en GPUs de 24 GB (RTX 4090, RTX 3090), a costa de latencias mas altas por el trasiego de pesos entre CPU y GPU. Por debajo de 24 GB de VRAM no hay datos que permitan afirmar que la inferencia sea viable.
- Almacenamiento: el repositorio ocupa 51,8 GB, por lo que se necesitan al menos ~52 GB libres mas el espacio de la cache de Hugging Face.
- Software: diffusers con el pipeline `WanPipeline`, Python 3.12+ y CUDA 12.8+ segun las indicaciones del autor.
- Opciones de despliegue: script oficial `generate_video.py` del repositorio SkyworkAI/SkyReels-V3; uso directo mediante diffusers; API gestionada en apifree.ai; playground en el Space de Hugging Face. No se documentan recetas para vLLM, TGI, llama.cpp u Ollama (no aplican a un modelo de difusion de video). No se documentan cuantizaciones GGUF.
- Latencia y throughput: no disponibles. La model card no publica tiempos de generacion por clip ni comparativas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Capacidad | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkyReels-V3-R2V-14B (este repositorio) | 14,3 B | Referencia a video (1-4 imagenes + prompt) | 720P | skywork-license | Copia de terceros en Hugging Face, 0 descargas |
| SkyReels-V3-R2V-14B (Skywork, oficial) | 14,3 B | Referencia a video (1-4 imagenes + prompt) | 720P | skywork-license | Hugging Face y ModelScope |
| SkyReels-V3-V2V-14B | 14,3 B (segun designacion 14B) | Video a video y extension de video | 720P | skywork-license (familia V3) | Hugging Face y ModelScope |
| SkyReels-V3-A2V-19B | 19 B (segun designacion) | Video guiado por audio y avatares parlantes | 720P | skywork-license (familia V3) | Hugging Face y ModelScope |
| SkyReels-V2-I2V-14B-720P | 14 B (segun designacion) | Imagen a video | 720P | no disponible | Hugging Face |
| SkyReels-V2-DF-14B-720P | 14 B (segun designacion) | Generacion autorregresiva de longitud practicamente ilimitada (diffusion forcing) | 720P | no disponible | Hugging Face |

No se dispone de datos comparativos de rendimiento (metricas de calidad o velocidad) entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, capacidad declarada, resolucion, licencia y disponibilidad.

## Limitaciones y advertencias

- Repositorio no oficial: esta ficha corresponde a una copia publicada por el usuario Shreyansh1409, con 0 descargas y 0 me gusta, y creada y actualizada el mismo dia. Para produccion conviene usar el repositorio oficial Skywork/SkyReels-V3-R2V-14B, ya que no hay garantia de que los pesos de esta copia coincidan con los oficiales ni de que reciban mantenimiento.
- Licencia restrictiva: la licencia skywork-license esta etiquetada como `other`. Es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; la informacion disponible no aclara los terminos concretos.
- Riesgos de fidelidad visual: aunque el modelo se presenta como especialmente orientado a la fidelidad de identidad, no se documentan tasas de fallo, deriva de identidad entre planos ni artefactos tipicos de los modelos de difusion de video.
- Duracion limitada en los ejemplos: el ejemplo oficial usa clips de 5 segundos, por lo que la generacion de secuencias largas requeriria encadenar extensiones con otras variantes (V2V) y comprobar la consistencia entre tramos.
- Ausencia de datos de sesgo: no hay informacion sobre sesgos demograficos, representacion de personas ni evaluaciones de seguridad en la model card.
- Riesgo de alucinacion visual: como modelo generativo, puede producir contenido que no se corresponde con las imagenes de referencia (elementos inventados, texto ilegible en la escena, fisicas incorrectas). No se documentan filtros de contenido ni moderacion en la inferencia.
- Idiomas: no se documenta soporte multilingue de los prompts; los ejemplos estan en ingles y se desconoce el comportamiento con prompts en castellano.
- Requisitos de memoria elevados: 51,8 GB de repositorio y unas necesidades de VRAM muy por encima de lo habitual en modelos de lenguaje del mismo tamano, lo que limita su despliegue fuera de GPUs de gama alta o de configuraciones con descarga de CPU.
- Ausencia de benchmarks: no hay metricas publicadas que permitan validar la calidad frente a alternativas antes de integrarlo en un producto.

## Enlaces

- Repositorio de esta ficha en Hugging Face: https://huggingface.co/Shreyansh1409/SkyReels-V3-R2V-14B
- Repositorio oficial del modelo (Skywork): https://huggingface.co/Skywork/SkyReels-V3-R2V-14B
- Codigo de inferencia en GitHub: https://github.com/SkyworkAI/SkyReels-V3
- Playground en Hugging Face Spaces: https://huggingface.co/spaces/Skywork/SkyReels-V3
- Coleccion de SkyReels V3 en Hugging Face: https://huggingface.co/collections/Skywork/skyreels-v3
- Coleccion de SkyReels V3 en ModelScope: https://www.modelscope.cn/collections/Skywork/SkyReels-V3
- Informe tecnico de SkyReels V3: https://arxiv.org/abs/2601.17323
- Informe tecnico de SkyReels-Audio: https://arxiv.org/pdf/2506.00830
- Plataforma de API: https://www.apifree.ai/explore
- Variante guiada por audio (A2V, 19B): https://huggingface.co/Skywork/SkyReels-V3-A2V-19B
- Variante video a video (V2V, 14B): https://huggingface.co/Skywork/SkyReels-V3-V2V-14B
- SkyReels-V2-I2V-14B-720P: https://huggingface.co/Skywork/SkyReels-V2-I2V-14B-720P
- SkyReels-V2-DF-14B-720P: https://huggingface.co/Skywork/SkyReels-V2-DF-14B-720P
- Coleccion de SkyReels V2: https://huggingface.co/collections/Skywork/skyreels-v2-6801b1b93df627d441d0d0d9
- Modelo de captioning de video SkyCaptioner-V1: https://huggingface.co/Skywork/SkyCaptioner-V1
- Repositorio de SkyReels-A2: https://github.com/SkyworkAI/SkyReels-A2
- Repositorio de SkyReels-A1: https://github.com/SkyworkAI/SkyReels-A1
- Repositorio de SkyReels-V1: https://github.com/SkyworkAI/SkyReels-V1
