# Rin247/Wan2.2-TI2V-5B-Diffusers

## Resumen

Wan2.2-TI2V-5B-Diffusers es un paquete de pesos cuantizados del modelo Wan-AI/Wan2.2-TI2V-5B, un modelo de difusion para generacion de video a partir de texto o imagen (text/image-to-video) con salida a 720P y 24 fps. El autor del repositorio es el usuario Rin247, que distribuye estas versiones bajo el marco denominado MECHA Forge (Model Engineering & Contextual Hearth Assembly). No se trata de un modelo entrenado desde cero, sino de una reempaquetado de los pesos originales de Wan-AI en formatos de cuantizacion listos para su uso con la libreria diffusers.

La relevancia de este repositorio reside en que agrupa en un unico paquete los tres componentes necesarios para la inferencia (denoiser, text encoder y VAE), lo que simplifica el despliegue. Ademas, ofrece cuatro variantes de cuantizacion (FP4, FP8, INT4 e INT8) que reducen los requisitos de memoria respecto a los pesos en precision completa, algo critico en modelos de video donde el consumo de VRAM es elevado.

El modelo base es un transformer de difusion de 5B parametros orientado a la generacion de video, con soporte para condicionamiento por texto e imagen. El repositorio ocupa 36,8 GB e incluye los pesos en formato safetensors. La informacion publica disponible sobre el modelo base es limitada en esta ficha, por lo que varios parametros tecnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (denoiser + text encoder + VAE), segun empaquetado MECHA Forge |
| Parametros totales | 5B (denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4, FP8, INT4, INT8 (weight-only) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

El modelo base Wan2.2-TI2V-5B es un modelo de difusion para generacion de video condicionada por texto o imagen. El paquete de Rin247 no aporta informacion sobre la arquitectura interna del denoiser (tipo de backbone, mecanismo de atencion, etc.) ni sobre el proceso de entrenamiento del modelo original; estos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica del repositorio es el empaquetado MECHA Forge, que agrupa denoiser, text encoder y VAE en un mismo paquete y ofrece cuantizacion weight-only en cuatro precisiones. La cuantizacion se aplica de forma diferenciada: el VAE se mantiene en FP8 para las variantes FP4 y FP8, y en INT8 para las variantes INT4 e INT8, de modo que el VAE se comparte entre formatos. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con resolucion 720P (1280x704) y 24 fps.
- Generacion de video a partir de imagen (image-to-video), segun la denominacion TI2V del modelo base.
- Control de la generacion mediante prompts descriptivos detallados, con estilos como fotografia de moda, escenarios o escenas costumbristas.
- Ajuste de pasos de inferencia (40 por defecto) y escala de guiado CFG (5.0 por defecto).
- Despliegue mediante la libreria diffusers (WanPipeline).
- Cuatro niveles de cuantizacion para adaptar el consumo de memoria al hardware disponible.
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingues, vision, audio ni modo thinking; estas capacidades no estan documentadas para este modelo.

## Casos de uso

- Prototipado rapido de video generativo: un equipo puede usar la variante FP8 para generar clips de 720P a 24 fps sin necesidad de pesos en precision completa, validando ideas de guion o storyboard en horas en lugar de dias.
- Creacion de contenido para redes sociales: la variante INT8 permite generar clips verticales u horizontales con prompts estilizados (por ejemplo, escenarios o moda) en GPUs de gama alta de consumo, reduciendo el coste frente a servicios en la nube.
- Previsualizacion de escenas cinematograficas: directores y artistas de VFX pueden generar tomas de referencia a partir de descripciones textuales o imagenes de concepto, usando el condicionamiento image-to-video para mantener la composicion.
- Generacion de material para e-commerce: la variante FP4, con menor huella de memoria, puede producir videos de producto (moda, accesorios) a partir de prompts detallados para catalogos o anuncios.
- Investigacion en difusion de video: el paquete agrupado denoiser + text encoder + VAE facilita experimentos reproducibles con distintas cuantizaciones, comparando calidad y latencia entre FP4, FP8, INT4 e INT8.
- Despliegue en entornos con VRAM limitada: al compartir el VAE entre formatos y ofrecer variantes INT4, el modelo puede ejecutarse en estaciones de trabajo con una sola GPU de 24 GB, algo inviable con pesos en precision completa.
- Generacion de fondos y b-roll para produccion audiovisual: clips de paisajes (por ejemplo, islas tropicales al atardecer) que se integran como material de relleno en montajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio ocupa 36,8 GB e incluye todas las variantes de cuantizacion. La variante INT4 es la que menor huella de memoria deberia requerir, seguida de FP4, INT8 y FP8.
- GPU recomendadas: no se especifican en la informacion proporcionada. Por el tamano del modelo base (5B) y la resolucion de salida (720P a 24 fps), se requiere una GPU con suficiente VRAM; no se dispone de datos concretos sobre modelos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; la existencia de variantes INT4 y FP4 sugiere que el autor busca facilitar su ejecucion en hardware de gama alta de consumo, pero no se aportan cifras.
- Opciones de despliegue: libreria diffusers con WanPipeline (segun los tags del repositorio). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada. La unica referencia directa es el modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/Wan2.2-TI2V-5B-Diffusers | 5B | no disponible | FP4, FP8, INT4, INT8 | no disponible | Hugging Face (132 descargas) |
| Wan-AI/Wan2.2-TI2V-5B | 5B | no disponible | pesos originales | no disponible | Hugging Face (modelo base) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (generacion de video texto/imagen a video) para establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- La licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar si se permite el uso comercial. Es imprescindible verificar la licencia del modelo base Wan-AI/Wan2.2-TI2V-5B antes de cualquier uso en produccion.
- Al ser una cuantizacion weight-only, es esperable una perdida de calidad respecto a los pesos originales, especialmente en las variantes FP4 e INT4; no se aportan metricas de dicha perdida.
- No se dispone de informacion sobre sesgos del modelo base ni sobre el riesgo de alucinacion en la generacion de video.
- No se documentan los idiomas soportados por el text encoder, por lo que no se puede garantizar el rendimiento con prompts en castellano.
- El repositorio tiene un numero reducido de descargas (132) y cero likes, lo que sugiere una validacion comunitaria limitada.
- El autor del paquete (Rin247) no es el desarrollador original del modelo; la responsabilidad sobre la calidad de los pesos cuantizados recae en el empaquetado, no en Wan-AI.
- No se especifican requisitos minimos de hardware ni limites de longitud de video, por lo que el rendimiento en produccion no esta caracterizado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Rin247/Wan2.2-TI2V-5B-Diffusers
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
