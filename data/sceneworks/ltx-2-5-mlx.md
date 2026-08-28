# SceneWorks/ltx-2.5-mlx

## Resumen

SceneWorks/ltx-2.5-mlx es un paquete de distribución lista para usar del modelo de generación de vídeo con audio LTX-2.5, desarrollado por Lightricks y adaptado por SceneWorks para su ejecución nativa en Apple Silicon (MLX) y GPU NVIDIA (Candle/CUDA). El repositorio incluye todos los componentes necesarios para ejecutar la pipeline completa de LTX-2.5 sin necesidad de conversión adicional ni acceso a repositorios gated: transformador destilado y guiado, codificador de texto Gemma 4, VAE convolucional y DiffVAE, upsamplers espaciales y temporales, cabecera de duración, audio VAE, vocoder y manifiestos de división. El modelo base es Lightricks/LTX-2.5, un modelo de difusión de 22 000 millones de parámetros (según fuentes externas) que genera vídeo multishot con audio sincronizado y mejor adherencia al prompt que su predecesor LTX-2.

La relevancia de este bundle radica en que elimina las barreras de instalación y conversión para usuarios que quieren ejecutar LTX-2.5 en hardware local, tanto en Macs con Apple Silicon como en GPUs NVIDIA, sin depender de servicios en la nube. SceneWorks lo describe como un "contrato de pipeline indivisible": cada nivel de cuantización (q4, q8, bf16) selecciona la representación correspondiente para todos los segmentos cuantificables, y el sistema rechaza layouts incompletos o no coincidentes. El repositorio ocupa 344,1 GB e incluye también un adaptador LoRA destilado de rango 450 y un snapshot del modelo Gemma 4 para mejora opcional de prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video con audio (transformador, basado en LTX-2.5) |
| Parametros totales | 22 000 millones (segun fuentes externas; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4, q8, bf16 |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se especifica) |
| Licencia | LTX-2 Community License Agreement (con restricciones de uso y condiciones de licencia comercial) |
| Formato de pesos | safetensors (split MLX/Candle, con manifiestos) |

## Arquitectura y entrenamiento

El bundle no es un modelo entrenado desde cero, sino una conversión y empaquetado de los pesos oficiales de LTX-2.5 de Lightricks. La arquitectura subyacente de LTX-2.5 es un modelo de difusión latente para vídeo que genera secuencias multishot con audio sincronizado. Según la información disponible, incluye un transformador principal (disponible en versión destilada y en versión "dev" guiada de 30 pasos), un codificador de texto basado en Gemma 4 (específicamente google/gemma-4-12B-it), un VAE convolucional, un DiffVAE, upsamplers espaciales y temporales, una cabecera de duración, un audio VAE y un vocoder. El adaptador LoRA destilado tiene rango 450 y sus metadatos se leen del safetensors. SceneWorks no ha realizado fine-tuning del comportamiento generativo; solo ha convertido y cuantizado los componentes. El entrenamiento original de LTX-2.5 no está documentado en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado.
- Generación de vídeo a partir de imagen (image-to-video) con audio.
- Generación de vídeo multishot nativo (varias tomas coherentes dentro de una misma secuencia).
- Mejor adherencia al prompt en comparación con versiones anteriores de LTX.
- Ejecución local en Apple Silicon mediante MLX y en GPU NVIDIA mediante Candle/CUDA.
- Incluye un enhancer de prompts opcional basado en Gemma 4 para mejorar las descripciones de entrada.
- Soporta diferentes niveles de cuantización (q4, q8, bf16) para adaptarse a distintos hardware.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo generativo de vídeo, no un modelo de lenguaje conversacional.

## Casos de uso

- Producción de vídeo profesional: los creadores pueden generar tomas multishot con audio sincronizado directamente en su estación de trabajo, sin depender de servicios en la nube, gracias a la ejecución local con MLX o CUDA.
- Prototipado de anuncios y contenido para redes sociales: la generación rápida de clips cortos con audio a partir de prompts textuales permite iterar sobre ideas creativas sin coste por minuto de GPU remota.
- Postproducción y previsualización: el modo image-to-video permite animar imágenes fijas o storyboards con movimiento y sonido, útil para directores y editores antes del rodaje final.
- Investigación en generación de vídeo: los investigadores pueden estudiar el comportamiento del modelo, comparar cuantizaciones y analizar la calidad del audio-vídeo en un entorno reproducible y local.
- Desarrollo de herramientas de IA generativa: el bundle sirve como base para integrar LTX-2.5 en aplicaciones de escritorio o servidores headless, como hace el propio SceneWorks, gracias a su estructura modular y manifiestos de división.
- Generación de contenido educativo y formativo: crear vídeos explicativos con narración sincronizada a partir de guiones, sin necesidad de locutores ni equipos de grabación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de vídeo (como FVD, CLIP score) ni comparativas con otros modelos. El único dato de rendimiento indirecto es que la versión "dev" requiere 30 pasos de difusión, mientras que la destilada es la opción por defecto de SceneWorks, lo que sugiere una inferencia más rápida en esta última, pero sin cifras concretas.

## Requisitos de hardware

- El repositorio completo ocupa 344,1 GB, pero incluye tres niveles de cuantización (q4, q8, bf16) y todos los componentes. Para inferencia solo se necesita descargar el nivel elegido.
- No se especifica la VRAM mínima ni recomendada en la model card. Dado que el modelo base tiene 22 000 millones de parámetros, se estima que la versión q4 podría caber en GPUs con 24 GB de VRAM (como RTX 3090/4090), mientras que bf16 requeriría GPUs de mayor capacidad (A100 80GB o similar), pero estos valores son orientativos y no están confirmados.
- Compatible con Apple Silicon (MLX) y GPU NVIDIA (Candle/CUDA). No se menciona soporte para AMD o Intel.
- Opciones de despliegue: el bundle está diseñado para usarse con el software SceneWorks, que ofrece una interfaz de escritorio nativa o un servidor GPU opcional para uso headless o en red local. También es posible utilizarlo con librerías MLX o Candle directamente, dado el formato split.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de generación de vídeo con audio. El propio LTX-2.5 (el modelo base) sería la referencia directa, pero este bundle es una conversión del mismo, no una alternativa. Otros modelos como Sora (OpenAI), Runway Gen-3 o Kling no tienen datos públicos comparables en la información proporcionada. Por tanto, la comparativa se limita a señalar que LTX-2.5 es un modelo open-source de 22B con audio sincronizado, mientras que muchas alternativas comerciales son cerradas y no permiten despliegue local.

## Limitaciones y advertencias

- Licencia restrictiva: el LTX-2 Community License Agreement incluye restricciones de uso y condiciones de licencia comercial. Cualquier redistribución de derivados debe incluir el acuerdo de licencia. El uso comercial puede requerir un acuerdo adicional con Lightricks.
- El bundle incluye componentes con licencias separadas: los pesos de Gemma 4 están bajo Apache License 2.0 con la Gemma Prohibited Use Policy de Google, que impone restricciones de uso adicionales.
- No se han documentado sesgos específicos, pero al ser un modelo generativo de vídeo entrenado con datos de internet, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación visual o incoherencias en vídeos largos o con prompts ambiguos, aunque LTX-2.5 mejora la adherencia al prompt respecto a versiones anteriores.
- La longitud de contexto y los idiomas soportados no están especificados en la información proporcionada; se recomienda verificar la documentación oficial de Lightricks.
- El tamaño del repositorio (344 GB) implica un coste de descarga y almacenamiento significativo, especialmente si se descargan todos los niveles de cuantización.
- El modelo requiere hardware con suficiente VRAM; en GPUs de consumo puede ser necesario usar cuantización q4 y limitar la resolución o duración de los vídeos generados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SceneWorks/ltx-2.5-mlx
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Página oficial de LTX-2.5: https://ltx.io/model/ltx-2-5
- Guía de LTX-2.5 en HackerNoon: https://hackernoon.com/ltx-25-a-complete-guide-to-lightricks-audio-video-ai-model
- Repositorio de SceneWorks: https://github.com/SceneWorks/SceneWorks
- Licencia LTX-2: https://github.com/Lightricks/LTX-2/blob/v1.2.0/LICENSE.md
- Modelo Gemma 4 (enhancer): https://huggingface.co/google/gemma-4-12B-it
