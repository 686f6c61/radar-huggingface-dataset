# Poij3012/Wan2.2-I2V-A14B-Diffusers

## Resumen

Wan2.2-I2V-A14B es un modelo de difusión para generación de vídeo a partir de imagen (image-to-video) desarrollado por Wan-AI (equipo de Alibaba, autor del linaje Wan). Esta ficha corresponde a la réplica publicada por el usuario Poij3012 en Hugging Face, que redistribuye los pesos oficiales en formato Diffusers bajo la clase `WanImageToVideoPipeline`. El modelo toma una imagen estática y un prompt de texto y genera una secuencia de vídeo a resolución 480P o 720P.

La arquitectura es un transformer de difusión con diseño Mixture-of-Experts (MoE) de dos expertos: uno de alto ruido que trabaja en las primeras etapas del proceso de denoising (donde se define la disposición general y el movimiento) y otro de bajo ruido que refina el detalle en las etapas finales. Según los metadatos de safetensors del repositorio, el agregado de pesos asciende a 14.288.901.184 parámetros, y el tamaño total del repositorio es de 126,2 GB, incluyendo codificador de texto y VAE.

Es relevante ahora porque Wan2.2 supone un salto respecto a Wan2.1 en volumen de datos de entrenamiento (+65,6 % de imágenes y +83,2 % de vídeos) y porque introduce el esquema MoE en difusión de vídeo manteniendo el coste computacional por paso. El modelo está publicado con licencia Apache 2.0, lo que permite uso comercial, y cuenta con integración oficial en Diffusers y ComfyUI. Conviene señalar que este repositorio concreto es una réplica de terceros sin descargas ni validación de la comunidad: para producción debe usarse el repositorio oficial de Wan-AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con arquitectura Mixture-of-Experts de dos expertos (alto ruido / bajo ruido) para el proceso de denoising |
| Parametros totales | 14.288.901.184 (14,29 B) segun los metadatos de safetensors del repositorio. La model card no desglosa el reparto entre expertos, codificador de texto y VAE |
| Parametros activos | Aproximadamente 14 B por paso de denoising (la serie A14B alterna experto de alto ruido y de bajo ruido); el total agregado de ambos expertos no se detalla en la informacion disponible |
| Longitud de contexto | No aplica: modelo de difusion de video, sin ventana de contexto de texto. El numero de fotogramas por generacion no se especifica en la informacion disponible para I2V-A14B |
| Tipos de cuantizacion | No documentados en la model card. Los pesos se distribuyen en safetensors sin variantes cuantizadas oficiales listadas |
| Idiomas soportados | Ingles (en) y chino (zh) para los prompts de texto |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, formato Diffusers (`WanImageToVideoPipeline`); tamano del repositorio: 126,2 GB |
| Tarea | Image-to-video (I2V) |
| Resoluciones soportadas | 480P y 720P |
| Libreria | Diffusers |
| Repositorio original | Wan-AI/Wan2.2-I2V-A14B-Diffusers |

## Arquitectura y entrenamiento

Wan2.2-I2V-A14B es un modelo de difusion construido sobre un transformer (DiT) condicionado por imagen y por texto. Su innovacion principal es la incorporacion de un esquema Mixture-of-Experts al proceso de difusion: en lugar de un unico bloque de parametros para todos los pasos de denoising, la serie A14B emplea dos expertos especializados segun el nivel de ruido. El experto de alto ruido actua en las etapas iniciales, donde se determina la composicion y el movimiento global; el experto de bajo ruido actua en las etapas finales, refinando texturas y detalles. Con ello se amplia la capacidad total del modelo manteniendo aproximadamente el mismo coste computacional por paso que un modelo denso de tamano equivalente.

En cuanto a datos, la model card indica que Wan2.2 se entreno con un volumen significativamente mayor que Wan2.1: un 65,6 % mas de imagenes y un 83,2 % mas de videos. Tambien se incorporo un conjunto de datos esteticos curado y etiquetado de forma detallada con atributos de iluminacion, composicion, contraste y tono de color, lo que permite un control mas preciso del estilo cinematografico. La model card no detalla el numero exacto de tokens o clips, la composicion completa del dataset ni si se aplicaron etapas de RLHF o DPO (en difusion no es el esquema habitual). El modelo se distribuye con codigo de inferencia multi-GPU para la variante A14B, lo que da idea de los requisitos de despliegue.

## Capacidades

- Generacion de video a partir de una imagen de entrada y un prompt de texto, a 480P y 720P.
- Control de estilo cinematografico mediante el etiquetado estetico del entrenamiento: iluminacion, composicion, contraste y tono de color.
- Generacion de movimiento complejo, con mejora declarada respecto a Wan2.1 en generalizacion de movimientos, semantica y estetica.
- Sintesis de video mas estable, con reduccion de movimientos de camara irreales segun la model card.
- Soporte declarado para escenas estilizadas diversas (no fotorrealistas).
- Prompts en ingles y chino.
- Integracion nativa en Diffusers (`WanImageToVideoPipeline`) y en ComfyUI.
- Codigo de inferencia multi-GPU disponible en el repositorio oficial de GitHub.
- No soporta tool calling, function calling ni comportamiento agentico: es un modelo generativo de video, no un modelo de lenguaje.
- No se documentan capacidades de audio, vision comprensiva ni modo de razonamiento explicito.

## Casos de uso

- Animacion de stills para publicidad: a partir de una fotografia de producto se genera un clip de 480P o 720P con movimento de camara controlado, util para piezas de redes sociales sin rodaje.
- Previsualizacion de storyboards en produccion audiovisual: convertir ilustraciones o frames clave en animaticos para validar encuadre, ritmo y movimiento antes de rodar.
- Creacion de contenido para e-commerce: animar fotos de catalogo para fichas de producto o anuncios, manteniendo la identidad visual de la imagen original.
- Postproduccion y VFX: generar plates animados o extensiones de escena a partir de un frame, con la ventaja de que la condicion de imagen fija la apariencia de referencia.
- Contenido educativo y divulgativo: animar diagramas, ilustraciones cientificas o mapas historicos para materiales docentes, con control de estilo mediante prompt.
- Prototipado rapido en estudios de animacion: producir clips de prueba con estilos estilizados (ilustracion, pintura, 3D estilizado) para explorar direccion de arte.
- Investigacion en generacion de video: el modelo es una referencia abierta con arquitectura MoE y licencia Apache 2.0, adecuada para experimentos de ablacion y comparativas academicas.
- Automatizacion de pipelines de contenido: al integrarse en Diffusers, puede encapsularse en servicios por lotes que procesen catalogos de imagenes y devuelvan clips, siempre con GPU de gama alta o multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card afirma de forma cualitativa un rendimiento "TOP" entre los modelos de video generativo de codigo abierto y propietarios, y mejoras en generacion de movimiento complejo respecto a Wan2.1, pero no se aportan tablas, metricas numericas ni comparativas cuantitativas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 126,2 GB, incluyendo transformer con ambos expertos, codificador de texto y VAE. Como estimacion a partir de ese tamano, cargar todos los componentes en precision nativa requiere del orden de 60-80 GB de VRAM; no es un dato confirmado por el autor.
- El codigo de inferencia publicado para la variante A14B es multi-GPU, lo que sugiere que el despliegue previsto no es una sola GPU de consumo.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2x A100 40 GB) para 720P sin cuantizacion agresiva.
- GPU de consumo: el modelo no esta pensado para una RTX 4090 en precision completa. La propia model card reserva el objetivo de "ejecutable en tarjetas de consumo como la 4090" para la variante Wan2.2-TI2V-5B, no para el A14B. En 4090 seria necesario cuantizacion y offload, con latencias altas.
- Opciones de despliegue: Diffusers (`WanImageToVideoPipeline`), ComfyUI, y el repositorio oficial Wan2.2 con scripts de inferencia multi-GPU. No se documentan integraciones con vLLM o TGI, que no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Resoluciones | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wan2.2-I2V-A14B (este) | 14,29 B declarados en safetensors; MoE de dos expertos | Image-to-video | 480P y 720P | No disponible el numero de fotogramas | Apache 2.0 | Diffusers, ComfyUI, HF, ModelScope |
| Wan2.2-TI2V-5B | 5 B | Text-to-video e image-to-video | 720P a 24 fps | No disponible | Apache 2.0 | Diffusers, ComfyUI, HF, ModelScope |
| Wan2.1 (generacion anterior) | No disponible en la informacion | Text-to-video e image-to-video | No disponible | No disponible | No disponible en la informacion | Referenciado como predecesor en la model card |

El modelo se posiciona por encima de Wan2.1 en volumen de datos de entrenamiento (+65,6 % de imagenes y +83,2 % de videos) y en capacidad gracias al diseno MoE. Frente al TI2V-5B, el A14B ofrece mayor capacidad a costa de un despliegue mucho mas exigente: el 5B esta disenado explicitamente para ejecutarse en GPUs de consumo con resolucion 720P. No se dispone de datos cuantitativos para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- Repositorio de terceros: esta ficha corresponde a `Poij3012/Wan2.2-I2V-A14B-Diffusers`, una replica con 0 descargas y 0 likes, creada sin validacion de la comunidad. Para produccion debe verificarse la integridad de los pesos y usarse el repositorio oficial `Wan-AI/Wan2.2-I2V-A14B-Diffusers`.
- Riesgo de artefactos de generacion: como todo modelo de difusion de video, puede producir deformaciones anatomicas, texturas inestables, parpadeo entre fotogramas y movimientos fisicamente inconsistentes.
- Movimientos de camara: aunque la model card declara una reduccion de movimientos irreales respecto a la generacion anterior, no se cuantifica la mejora ni se documentan tasas de fallo.
- Idioma: solo se declaran prompts en ingles y chino; no hay soporte documentado de castellano, lo que obliga a traducir los prompts.
- Longitud de video: no se especifica en la informacion disponible el numero maximo de fotogramas ni la tasa de fps de la variante I2V-A14B; el dato de 720P a 24 fps corresponde al modelo TI2V-5B.
- Sesgos: no se documenta en la model card ningun analisis de sesgos de generacion (representacion de personas, culturas, estilos). El dataset de entrenamiento no se detalla, por lo que no es posible auditar su composicion.
- Licencia: Apache 2.0 permite uso comercial, pero el redistribuidor de este repositorio no ofrece garantias adicionales sobre los pesos ni sobre el cumplimiento de la licencia original.
- Requisitos de despliegue: la inferencia en precision nativa exige multi-GPU; el coste por clip es elevado y debe presupuestarse antes de plantear un servicio en produccion.
- Ausencia de benchmarks: no hay metricas publicadas en la informacion disponible, por lo que las afirmaciones de rendimiento de la model card no son verificables de forma independiente.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Poij3012/Wan2.2-I2V-A14B-Diffusers
- Repositorio oficial en Diffusers: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Pesos oficiales: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Organizacion Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- Codigo de inferencia en GitHub: https://github.com/Wan-Video/Wan2.2
- Informe tecnico (arXiv 2503.20314): https://arxiv.org/abs/2503.20314
- Sitio oficial y blog: https://wan.video
- ModelScope (pesos oficiales): https://modelscope.cn/models/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Organizacion Wan-AI en ModelScope: https://modelscope.cn/organization/Wan-AI
- Documentacion de ComfyUI para Wan2.2: https://docs.comfy.org/tutorials/video/wan/wan2_2
- Variante TI2V-5B en Diffusers: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Variante T2V-A14B en Diffusers: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- Discord del proyecto: https://discord.gg/AKNgpMK4Yj
