# Lightricks/LTX-2.5-22b-IC-LoRA-SDR-To-HDR

## Resumen

LTX-2.5-22b-IC-LoRA-SDR-To-HDR es un adaptador LoRA de tipo IC-LoRA (In-Context LoRA) desarrollado por Lightricks sobre el modelo base de vídeo Lightricks/LTX-2.5. Su función concreta es la conversión de vídeo de rango dinámico estándar (SDR) a alto rango dinámico (HDR) mediante un pipeline de video-to-video, sin necesidad de reentrenar el modelo completo. El adaptador se publica como un módulo de bajo rango que se carga junto al modelo base de 22.000 millones de parámetros.

El modelo resuelve un problema de posproducción muy específico: elevar contenido SDR existente a HDR de forma coherente temporalmente, aprovechando las capacidades generativas y de contexto del modelo base en lugar de aplicar mapeos tonales heurísticos. Al ser un LoRA, el coste de almacenamiento y de despliegue es reducido (el repositorio ocupa 1,3 GB) frente a los pesos completos del modelo base.

Es relevante ahora porque la demanda de contenido HDR ha crecido con la adopción de pantallas HDR en consumo y plataformas de streaming, y porque el enfoque IC-LoRA permite especializar un modelo generativo de vídeo de gran escala con un adaptador ligero. El acceso está restringido (gated) y requiere aceptar la licencia comunitaria de LTX 2.x en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IC-LoRA (adaptador de bajo rango) sobre el modelo base de vídeo Lightricks/LTX-2.5 |
| Parametros totales | 22.000 millones (modelo base); el adaptador LoRA es de bajo rango, numero exacto de parametros no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | ltx-2.x-community-license (acceso restringido, requiere aceptacion) |
| Formato de pesos | no disponible (repositorio de 1,3 GB; libreria ltx) |

## Arquitectura y entrenamiento

El adaptador se construye sobre LTX-2.5, un modelo generativo de vídeo de 22.000 millones de parámetros de Lightricks. La técnica IC-LoRA (In-Context LoRA) especializa el modelo base mediante un adaptador de bajo rango que condiciona la generación en el contexto de la tarea: en este caso, la transformación SDR a HDR. El pipeline declarado es video-to-video, es decir, el modelo recibe una secuencia de vídeo de entrada y produce una versión transformada.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El articulo referenciado en los metadatos es arXiv:2604.11788, que presumiblemente documenta el metodo, pero su contenido no se ha incluido en la informacion disponible.

## Capacidades

- Conversion video-to-video de SDR a HDR sobre secuencias de vídeo.
- Coherencia temporal presumible gracias al modelado de vídeo del modelo base (no verificada con datos en la informacion disponible).
- Especializacion ligera: el adaptador se combina con el modelo base LTX-2.5 sin reentrenamiento completo.
- Soporte de idioma: ingles (segun metadatos).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, al tratarse de un adaptador de generacion/transformacion de video.

## Casos de uso

- Remasterizacion de catalogos SDR a HDR: aplicar el adaptador sobre archivos de video existentes para generar versiones HDR destinadas a plataformas de streaming, aprovechando el pipeline video-to-video sin rehacer la produccion original.
- Restauracion de contenido de archivo: elevar metraje historico o de baja calidad tonal a HDR para su reedicion en formato fisico o digital.
- Postproduccion en pipelines de VFX: integrar el adaptador como paso automatizado de conversion tonal dentro de flujos de color grading, reduciendo el trabajo manual de mapeo tonal.
- Generacion de variantes HDR para distribucion multiplataforma: producir simultaneamente versiones SDR y HDR de un mismo master para distintos canales de emision.
- Prototipado rapido de looks HDR: usar el adaptador para explorar resultados HDR antes de comprometer un grade final en herramientas de color profesional.
- Investigacion en generacion de video condicionada: emplear el IC-LoRA como caso de estudio de especializacion de modelos de video de gran escala mediante adaptadores de bajo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un adaptador sobre un modelo base de 22.000 millones de parametros, los requisitos vendran determinados por el modelo base LTX-2.5, no por el LoRA (1,3 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de la cuantizacion empleada.
- Opciones de despliegue: la libreria declarada es `ltx`; no se detallan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables (parametros, contexto, rendimiento, licencia y disponibilidad) para establecer una comparativa fiable. No se inventan cifras.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones de la licencia ltx-2.x-community-license en Hugging Face antes de descargar el modelo.
- Licencia comunitaria: el uso comercial puede estar sujeto a restricciones especificas de la ltx-2.x-community-license; conviene revisar sus terminos antes de integrarlo en produccion.
- Idioma: los metadatos solo declaran soporte de ingles; el comportamiento con otros idiomas no esta documentado.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere LTX-2.5, con los requisitos de hardware y las limitaciones de este.
- Riesgo de artefactos y alucinacion visual: al ser un modelo generativo, la conversion SDR a HDR puede introducir artefactos o alteraciones no deseadas en el contenido; no hay datos publicados sobre su tasa de error.
- Ausencia de benchmarks: no hay resultados publicados en la informacion disponible que permitan validar la calidad objetiva de la conversion.
- Sesgos: no documentados en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-SDR-To-HDR
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Articulo referenciado: arXiv:2604.11788 (https://arxiv.org/abs/2604.11788)
