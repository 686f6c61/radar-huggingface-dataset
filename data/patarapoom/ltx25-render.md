# Patarapoom/ltx25-render

## Resumen

Este repositorio, `Patarapoom/ltx25-render`, no es un modelo nuevo en sí, sino un espejo operativo que contiene copias sin modificar de cinco archivos del repositorio `comfyicu/LTX-2.5`, fijados en una revisión concreta (`1026e00f808dbd9601911479b22d65b760737dc8`). El objetivo es permitir que entornos de inferencia serverless, como los de RunPod, descarguen únicamente los pesos necesarios para un render (39,7 GB) en lugar de los 200,85 GB completos del repositorio original, optimizando así el tiempo de arranque y el ancho de banda.

Los archivos incluidos corresponden a los componentes esenciales de LTX-2.5, el modelo de generación de vídeo de Lightricks: un transformer de difusión destilado de 22 000 millones de parámetros, un codificador de texto basado en Gemma 4 de 12 000 millones, un VAE de vídeo, un VAE de audio y un upscaler espacial latente. LTX-2.5 se describe como un "open world model" para vídeo, orientado a aplicaciones de cine, robótica y flujos de trabajo audiovisuales en tiempo real. La licencia es la LTX-2.x Community License Agreement, con restricciones comerciales para empresas de cierto tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (destilado) con codificador de texto Gemma 4 12B y VAE de vídeo/audio |
| Parametros totales | 22 000 millones (transformer) + 12 000 millones (text encoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (transformer y text encoder), bf16 (VAE y upscaler) |
| Idiomas soportados | No disponible |
| Licencia | LTX-2.x Community License Agreement (Lightricks Ltd.) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base LTX-2.5 emplea una arquitectura de transformer de difusión, diseñada para generar vídeo a partir de condiciones como imágenes o audio. El subconjunto aquí incluido utiliza una versión destilada del transformer de 22 000 millones de parámetros, lo que reduce el número de pasos de inferencia necesarios. El codificador de texto es un Gemma 4 de 12 000 millones de parámetros con proyección adaptada a LTX-2.5, y el sistema se completa con dos VAE (uno para vídeo y otro para audio) y un upscaler espacial latente que duplica la resolución.

No se dispone de información sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El repositorio actual no incluye ningún cambio sobre los pesos originales; es una copia byte a byte de los archivos del repositorio `comfyicu/LTX-2.5`.

## Capacidades

- Generacion de vídeo a partir de imágenes (image-to-video) mediante el pipeline de ComfyUI.
- Generacion de vídeo condicionada por audio (audio-to-video), según las etiquetas del repositorio.
- Codificacion de texto con Gemma 4 12B, lo que permite guiar la generación mediante descripciones textuales.
- Upscaling espacial latente x2 para aumentar la resolución del vídeo generado.
- Generacion de audio sincronizado con el vídeo mediante el VAE de audio dedicado.
- Integracion nativa con ComfyUI, lo que facilita su uso en flujos de trabajo gráficos y automatizados.

## Casos de uso

- Produccion de vídeo automatizada: el modelo puede convertir imágenes fijas en secuencias animadas, útil para generar clips promocionales o contenido para redes sociales a partir de fotografías o renders.
- Prototipado rapido en cine y animacion: los equipos creativos pueden generar vídeos de baja resolución para previsualizar escenas antes de la producción final, aprovechando el upscaler para refinar la calidad.
- Generacion de vídeo con audio sincronizado: gracias al VAE de audio, se pueden crear piezas audiovisuales completas donde el sonido se genera junto con las imágenes, por ejemplo para doblaje o efectos de sonido.
- Integracion en pipelines de render en la nube: el subconjunto de archivos está pensado para entornos serverless como RunPod, donde el despliegue se optimiza al cargar solo los pesos necesarios, reduciendo costes y latencia.
- Investigacion en modelos de mundo: LTX-2.5 se presenta como un "world model", por lo que puede usarse en experimentos de simulación visual o robótica, donde se requiere generar secuencias coherentes a partir de condiciones iniciales.
- Educacion y experimentacion: al ser de pesos abiertos (con restricciones de licencia), permite a estudiantes y desarrolladores explorar técnicas de generación de vídeo con transformers de difusión y VAE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad (FVD, CLIP score, etc.) ni comparaciones con otros modelos de generación de vídeo.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del repositorio.
- Estimacion basada en el tamaño de los archivos: los pesos en disco suman 39,7 GB (21,5 GB del transformer en int8, 15,37 GB del text encoder en int8, 1,47 GB del VAE de vídeo, 1 GB del upscaler y 0,36 GB del VAE de audio). Para cargar todos los componentes en memoria durante la inferencia, se necesitaría una GPU con al menos 48 GB de VRAM, como una A100 80GB o una H100.
- Dado que el transformer y el text encoder están cuantizados a int8, es posible que quepan en GPUs de 24 GB (por ejemplo, RTX 4090) si se cargan de forma secuencial o con gestión de memoria, pero no hay garantías ni datos de referencia.
- Opciones de despliegue: ComfyUI es el entorno principal indicado; también podría usarse con otras herramientas que carguen safetensors, aunque no se documentan alternativas como vLLM o llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. El modelo LTX-2.5 compite con otros generadores de vídeo de código abierto como Wan 2.2 o HunyuanVideo, pero no se han incluido datos de rendimiento ni especificaciones detalladas de estos en la información disponible.

## Limitaciones y advertencias

- La licencia LTX-2.x Community License Agreement impone restricciones importantes: entidades con ingresos anuales de al menos 10 000 000 USD deben obtener un acuerdo comercial de pago con Lightricks para cualquier uso comercial (sección 2.1).
- Existen restricciones de uso basadas en la sección 4 y el Anexo A de la licencia, que pueden limitar ciertos escenarios de aplicación.
- La sección 6 de la licencia establece obligaciones sobre marcas de agua y procedencia que se transmiten a cualquier receptor de los pesos o de los vídeos generados.
- No se documentan sesgos específicos del modelo, pero al ser un generador de vídeo, existe riesgo de alucinación visual o de inconsistencias temporales en secuencias largas.
- La longitud de contexto no está especificada, por lo que no se puede garantizar la coherencia en vídeos de duración extendida.
- El repositorio es un mirror operativo: no incluye código de inferencia ni documentación adicional más allá de la model card original.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Patarapoom/ltx25-render
- Repositorio original de los archivos: https://huggingface.co/comfyicu/LTX-2.5
- Modelo original de Lightricks: https://huggingface.co/Lightricks/LTX-2.5
- Sitio oficial de LTX-2.5: https://ltx.io/model/ltx-2-5
- Página de licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md
