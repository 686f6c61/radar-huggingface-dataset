# buxtcodes/TechJam-Modulated-LoRC

## Resumen

mLoRC es un detector de imágenes generadas por inteligencia artificial desarrollado por buxtcodes (Ian) en el contexto del TikTok TechJam 2026. El modelo combina un backbone DINOv3 ViT-H+/16 con el módulo LoRC (Low-Rank Contrastive, según el paper arxiv:2608.20882), una técnica de adaptación de bajo rango orientada a la detección de contenido sintético. Su propósito es clasificar si una imagen ha sido creada por un modelo generativo o es una fotografía real, un problema cada vez más relevante ante la proliferación de deepfakes y contenido sintético.

El repositorio de HuggingFace contiene un checkpoint completo (`mlorc-full.pt`) con los pesos LoRA fusionados en el backbone, junto con un archivo de configuración de la arquitectura DINOv3. El tamaño total del repositorio es de 1,8 GB, lo que sugiere un modelo de gran capacidad. No se especifican el número exacto de parámetros ni la licencia concreta (marcada como "other"), y el modelo se distribuye en formato PyTorch nativo (.pt). Está orientado a la clasificación de imágenes mediante el pipeline `image-classification`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-H+/16 + LoRC (Low-Rank Contrastive) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | other (no especificada) |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura se basa en DINOv3 ViT-H+/16, un transformer de vision de gran tamaño con parches de 16x16 píxeles, que actúa como extractor de características. Sobre este backbone se aplica LoRC, un módulo de contraste de bajo rango descrito en el paper arxiv:2608.20882. LoRC introduce adaptadores de bajo rango que aprenden a separar las representaciones de imágenes reales frente a las generadas por IA, aprovechando la capacidad de DINOv3 para capturar patrones visuales finos.

No se dispone de información detallada sobre el proceso de entrenamiento: ni el número de imágenes utilizadas, ni la composición del dataset, ni si se emplearon técnicas de aumentación o regularización específicas. El checkpoint `mlorc-full.pt` indica que los pesos LoRA ya están fusionados en el backbone, lo que simplifica la inferencia sin necesidad de cargar adaptadores por separado. El código fuente y la documentación están disponibles en el repositorio de GitHub [Buxt-Codes/AIGI-mLoRC](https://github.com/Buxt-Codes/AIGI-mLoRC), aunque no se han publicado detalles adicionales sobre el entrenamiento en la información proporcionada.

## Capacidades

- Clasificacion de imagenes: determina si una imagen es generada por IA o real, mediante el pipeline `image-classification`.
- Deteccion de contenido sintetico: orientado a identificar deepfakes, imagenes creadas por modelos generativos (GAN, diffusion, etc.) y manipulaciones visuales.
- Extraccion de caracteristicas con DINOv3: aprovecha un backbone de vision de ultima generacion con representaciones densas y robustas.
- Adaptacion de bajo rango: el modulo LoRC permite ajustar el modelo con pocos parametros, lo que facilita su actualizacion o fine-tuning en nuevos dominios.
- Inferencia directa: el checkpoint fusionado permite cargar el modelo y predecir con una sola llamada, como muestra el ejemplo de uso en la model card.
- Integracion en pipelines de Python: la API `ModulatedLoRC.from_pretrained()` y `predict_image()` simplifican su uso en scripts y aplicaciones.

## Casos de uso

- Moderacion de contenido en redes sociales: plataformas como TikTok pueden integrar mLoRC para detectar y etiquetar automaticamente imagenes generadas por IA antes de su publicacion, reduciendo la propagacion de desinformacion visual.
- Verificacion de autenticidad en periodismo: medios de comunicacion pueden usar el modelo para comprobar si una fotografia recibida de fuentes no verificadas es real o sintetica, antes de publicarla.
- Auditoria de datasets de entrenamiento: equipos de ML pueden filtrar imagenes generadas por IA en sus conjuntos de datos para evitar contaminacion en el entrenamiento de otros modelos.
- Control de fraude documental: entidades financieras o administrativas pueden detectar imagenes sinteticas en documentos de identidad o pruebas de pago, mitigando estafas.
- Investigacion academica en deteccion de deepfakes: investigadores pueden utilizar mLoRC como baseline o componente en estudios sobre robustez de detectores de contenido sintetico.
- Proteccion de propiedad intelectual: creadores de contenido pueden verificar si sus obras han sido replicadas o alteradas mediante generadores de imagenes, usando el modelo como herramienta de analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como precision, recall, AUC o F1 sobre datasets estandar (por ejemplo, CIFAKE, GenImage o Forensics++). Tampoco se proporcionan comparaciones con otros detectores de imagenes generadas por IA. Se recomienda consultar el repositorio de GitHub del autor para posibles actualizaciones con resultados experimentales.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del checkpoint (1,8 GB) y la arquitectura ViT-H+, se estima que la inferencia requiere al menos 8-12 GB de VRAM en precision FP32, aunque no hay datos confirmados.
- GPU recomendadas: no disponible. Un ViT-H+ tipicamente necesita GPUs de gama alta; se sugiere una RTX 3090/4090 o A100 para inferencia comoda, pero no esta verificado.
- Compatibilidad con GPU de consumo: probablemente si en tarjetas con 12 GB o mas de VRAM, pero sin confirmacion oficial.
- Opciones de despliegue: el modelo se distribuye en formato PyTorch, por lo que puede ejecutarse con torch directamente. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas son para modelos de lenguaje, no aplican aqui).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. Existen otros detectores de imagenes generadas por IA como los basados en CLIP (por ejemplo, "DetectGAN" o "UniversalFakeDetect"), pero no se conocen datos publicados de mLoRC frente a ellos. La tabla siguiente refleja la falta de datos:

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| mLoRC (este) | DINOv3 ViT-H+/16 + LoRC | no disponible | no aplica | no disponible | other |
| Alternativas | no disponible | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero como cualquier detector de imagenes generadas, puede tener falsos positivos o negativos segun el tipo de generador (GAN, diffusion, etc.) y el dominio visual.
- Riesgo de alucinacion: no aplica directamente (no es un modelo generativo de texto), pero la clasificacion puede ser incorrecta en imagenes muy editadas o con artefactos sutiles.
- Limitaciones de contexto: al ser un modelo de vision, no procesa texto ni audio; su unica entrada son imagenes.
- Restricciones de licencia: la licencia "other" no especifica si permite uso comercial. Se debe contactar al autor antes de usar el modelo en produccion o con fines comerciales.
- Caveat para produccion: el modelo no ha sido validado con benchmarks publicos, por lo que su rendimiento real en escenarios variados es desconocido. Se recomienda evaluarlo en el dominio de uso especifico antes de desplegarlo.
- Dependencia de DINOv3: el rendimiento depende de la calidad del backbone; si DINOv3 tiene limitaciones en ciertos tipos de imagen, estas se heredan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/buxtcodes/TechJam-Modulated-LoRC
- Repositorio de codigo: https://github.com/Buxt-Codes/AIGI-mLoRC
- Paper de LoRC: https://arxiv.org/abs/2608.20882
- Perfil del autor en HuggingFace: https://huggingface.co/buxtcodes
- TikTok TechJam 2026 (contexto del desarrollo): https://tiktoktechjam2026.devpost.com/
