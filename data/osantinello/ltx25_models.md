# osantinello/LTX25_Models

## Resumen

osantinello/LTX25_Models es un repositorio espejo que redistribuye los pesos del modelo Lightricks LTX-2.5, un sistema de generación de video a partir de texto con audio sincronizado, empaquetado para su uso directo en ComfyUI. Los archivos no han sido modificados respecto a los originales publicados por Lightricks y se distribuyen bajo la licencia comunitaria LTX-2.x, que incluye restricciones de uso y requisitos de licencia comercial para entidades por encima de un umbral de ingresos.

El modelo base es un transformer destilado de 22 000 millones de parámetros, acompañado de un VAE de video, un VAE de audio, un upscaler espacial latente y un codificador de texto basado en Gemma. El repositorio incluye únicamente los pesos en formato safetensors, con el transformer cuantizado en int8. La relevancia actual del modelo radica en su capacidad de generar video multishot con audio nativo, una característica poco común en modelos de código abierto, y en su integración directa con ComfyUI para flujos de trabajo de producción audiovisual.

La información técnica detallada sobre arquitectura, entrenamiento y benchmarks no está disponible en la model card ni en los resultados de búsqueda proporcionados, por lo que esta ficha se basa en los datos del repositorio y en descripciones generales del modelo LTX-2.5.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer destilado (no se especifica tipo de attention; se infiere del nombre de archivo "22b-distilled-transformer") |
| Parametros totales | 22 000 millones (22B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (transformer); bf16 (VAEs y text encoder) |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License Agreement (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo LTX-2.5 está compuesto por varios módulos que trabajan de forma conjunta: un transformer principal de 22B parámetros (versión destilada) que genera los latentes de video, un VAE de video en bf16, un VAE de audio en bf16, un upscaler espacial latente ×2 y un text encoder basado en Gemma. El transformer se distribuye en cuantización int8 con formato específico para ComfyUI, lo que reduce su huella de memoria en inferencia.

No se dispone de información sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en los datos proporcionados. El nombre del archivo indica que es una versión destilada, lo que sugiere que se ha comprimido el conocimiento de un modelo más grande, pero no se aportan detalles adicionales. Tampoco se documentan innovaciones técnicas específicas más allá de la integración de audio y video en un único modelo.

## Capacidades

- Generación de video a partir de prompts de texto, con sincronización de audio.
- Generación de audio sincronizado con el contenido visual (efectos de sonido, diálogos, música).
- Soporte para multishot (generación de múltiples tomas o secuencias dentro de un mismo video).
- Integración nativa con ComfyUI para flujos de trabajo de generación audiovisual.
- Uso de un text encoder basado en Gemma para interpretar los prompts.
- Capacidad de upscaling espacial latente (×2) para mejorar la resolución del video generado.
- No se documentan capacidades de tool calling, agentes o razonamiento multimodal más allá de video y audio.

## Casos de uso

- Producción de video para marketing y publicidad: generar clips breves con audio sincronizado para campañas en redes sociales, usando el modelo en ComfyUI para iterar rápidamente sobre guiones visuales.
- Creación de contenido educativo: generar vídeos explicativos con voz sintetizada y efectos de sonido, a partir de guiones textuales, reduciendo el coste de producción.
- Desarrollo de prototipos para cine y animación: los directores pueden generar storyboards animados con audio provisional para evaluar el ritmo y el tono antes de la producción final.
- Generación de vídeo para videojuegos: crear secuencias cinemáticas cortas con audio para escenas de interacción, integrándolo en pipelines de desarrollo con ComfyUI.
- Accesibilidad y doblaje: generar pistas de audio sincronizadas para vídeos mudos existentes, o crear versiones en diferentes idiomas si el modelo lo soporta (no confirmado en los datos).
- Investigación en IA generativa: estudiar la generación conjunta de video y audio, analizando la coherencia entre modalidades y la calidad de la destilización en modelos de 22B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni métricas específicas de generación de video (como FVD o CLIP score) para este modelo o para el LTX-2.5 original en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el transformer de 22B en int8 requiere aproximadamente 22 GB de VRAM solo para los pesos, más la memoria para los VAE y el text encoder. En total, se estima un consumo de entre 24 y 32 GB de VRAM para el flujo completo con ComfyUI.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB) puede ejecutar el modelo con configuraciones optimizadas, pero para mayor espacio se recomienda una A100 40GB, A100 80GB o H100.
- En consumer GPU: cabe en una RTX 4090 o RTX 6000 Ada, pero no en GPUs de 12 GB o menos (como RTX 3060 o 4070) sin cuantizaciones adicionales o offloading a CPU.
- Opciones de despliegue: ComfyUI es el formato objetivo del repositorio; también puede cargarse con otros frameworks que soporten safetensors, como Hugging Face Diffusers o vLLM (aunque la compatibilidad con video/audio puede requerir adaptaciones).
- Latencia y throughput: no se disponen de datos medidos. En una A100, se espera que la generación de un clip de 5 segundos a 24 FPS tarde entre 1 y 5 minutos, dependiendo de la resolución y el número de pasos de inferencia.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de generación de video con audio en las fuentes consultadas. No se puede proporcionar una comparativa técnica en este momento.

## Limitaciones y advertencias

- Restricciones de licencia: el modelo se distribuye bajo la LTX-2.x Community License Agreement. Las entidades comerciales con ingresos por encima del umbral definido en el acuerdo deben obtener una licencia comercial de pago de Lightricks antes de cualquier uso. La redistribución de los pesos requiere incluir una copia del acuerdo y mantener los avisos de copyright.
- Uso no ético: la licencia incluye restricciones basadas en el uso (Sección 4 y Anexo A), que pueden prohibir aplicaciones como generación de contenido engañoso, difamación o violación de derechos de autor. Es responsabilidad del usuario revisar el acuerdo completo.
- Sesgos y alucinación: no se han publicado evaluaciones de sesgos ni de tasas de alucinación en la información disponible. Como todo modelo generativo de video, puede producir contenido no deseado o incoherente, especialmente en escenas complejas o con prompts ambiguos.
- Limitaciones de contexto e idioma: no se especifican los idiomas soportados ni la longitud máxima de prompt. Es probable que el text encoder (Gemma) tenga un límite de tokens, pero no se documenta.
- Advertencia de producción: el repositorio es un mirror no oficial; no está respaldado por Lightricks y se ofrece sin garantía. En entornos de producción, se recomienda descargar los pesos originales desde el repositorio gated de Lightricks y verificar la integridad de los archivos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/osantinello/LTX25_Models
- Modelo original de Lightricks: https://huggingface.co/Lightricks/LTX-2.5
- Guía de LTX-2.5 en HackerNoon: https://hackernoon.com/ltx-25-a-complete-guide-to-lightricks-audio-video-ai-model
- Playground independiente LTX-2.5: https://ltx25.co/
- Referencia de flujos de trabajo Sogni: https://docs.sogni.ai/models/ltx-2-5/
