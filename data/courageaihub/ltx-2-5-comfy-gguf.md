# courageaihub/LTX-2.5-Comfy-GGUF

## Resumen

LTX-2.5 es un modelo de generación de video y audio de Lightricks, liberado con pesos abiertos bajo la licencia comunitaria LTX-2.x. Este repositorio concreto, `courageaihub/LTX-2.5-Comfy-GGUF`, ofrece versiones cuantizadas en formato GGUF del transformer original de 21 000 millones de parámetros, pensadas para su ejecución eficiente en ComfyUI y otras herramientas compatibles con GGUF. El modelo original es un DiT de doble flujo que genera video y audio sincronizados en una sola pasada, con soporte nativo de multishot (escenas conectadas que mantienen identidad de personajes, iluminación y estilo) y un codificador de texto personalizado basado en Gemma 4 12B.

La relevancia de esta versión cuantizada radica en que el transformer original en bf16 ocupa 39 GB, lo que dificulta su uso en hardware de consumo. Las cuantizaciones GGUF reducen el peso a entre 6,8 GB y 23 GB, permitiendo ejecutar el modelo en GPUs de 10 a 32 GB de VRAM según la variante elegida. El repositorio incluye seis niveles de cuantización (Q2_K, Q3_K_S, Q4_K_M, Q5_K_M, Q6_K y Q8_0), con recomendaciones claras sobre cuál usar según la GPU disponible y la calidad deseada. Es una opción práctica para desarrolladores que quieren probar generación de video con audio sincronizado localmente sin necesidad de infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de doble flujo (video path de 4096 canales, audio path de 2048 canales, atención cross-modal) |
| Parametros totales | 21 004 025 600 (21 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa secuencias de video y audio; no se especifica un contexto de texto en tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible (el codificador de texto Gemma 4 12B soporta multiples idiomas, pero no se detalla en la documentacion del repo) |
| Licencia | LTX-2.x Community License (uso comercial gratuito bajo 10 M USD de ingresos anuales; por encima requiere acuerdo con Lightricks) |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

LTX-2.5 es un modelo de difusion basado en un transformer de doble flujo (dual-stream DiT). El flujo de video tiene una anchura de 4096 canales y el de audio de 2048 canales, conectados mediante atencion cross-modal que permite generar video y audio sincronizados en una sola pasada, sin necesidad de una etapa separada de generacion de audio. El modelo tambien incorpora un codificador de texto personalizado basado en Gemma 4 12B, disenado para mantener prompts complejos con multiples personajes, movimientos de camara, iluminacion y acciones sin perder detalles en secuencias largas.

El entrenamiento incluye una variante destilada (LTX-2.5-Distilled) que es la que se cuantiza en este repositorio. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO en la informacion disponible. La innovacion principal del modelo es la generacion nativa de multishot: produce multiples escenas conectadas en una sola pasada, manteniendo identidad de personajes, entorno, iluminacion, voz y estilo visual entre cortes, algo que las versiones anteriores no lograban. Ademas, implementa "Diffusion Fidelity Rendering", que asigna computo de forma dinamica segun la complejidad de la escena y el presupuesto disponible, optimizando la calidad donde es necesaria y ahorrando recursos en el resto.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con audio sincronizado en una sola pasada.
- Generacion de video a partir de imagen (image-to-video) y soporte de primer y ultimo fotograma (first-last-frame).
- Generacion de audio sincronizado con el video, sin necesidad de un modelo de audio separado.
- Generacion multishot nativa: crea escenas conectadas que mantienen identidad de personajes, entorno, iluminacion, voz y estilo visual entre cortes.
- Codificador de texto avanzado (Gemma 4 12B) que maneja prompts complejos con multiples elementos.
- Ejecucion local en hardware de consumo gracias a las cuantizaciones GGUF.
- Integracion con ComfyUI mediante nodos nativos y flujos de trabajo predefinidos.

## Casos de uso

- Produccion de video para redes sociales: un creador puede generar clips cortos con audio sincronizado directamente desde un prompt de texto, sin necesidad de herramientas de edicion complejas. La cuantizacion Q4_K_M permite ejecutarlo en una RTX 4080 de 16 GB con calidad aceptable.
- Prototipado rapido de storyboards: un director o disenador puede generar multiples tomas de una escena con diferentes prompts para explorar opciones de iluminacion, encuadre y movimiento antes de la produccion real. El modo multishot mantiene la coherencia entre tomas.
- Generacion de material de referencia para animacion: los equipos de animacion pueden usar el modelo para crear secuencias de referencia con movimiento y audio, que luego sirven de guia para el trabajo manual. La cuantizacion Q5_K_M en una RTX 3090 ofrece buena coherencia sin agotar la VRAM.
- Creacion de contenido educativo: se pueden generar videos explicativos con narracion sincronizada a partir de guiones de texto, reduciendo el coste de produccion para cursos online o documentales.
- Desarrollo de juegos y entornos virtuales: el modelo puede generar secuencias cinematicas cortas con audio para cinematics o trailers, ejecutandose localmente en estaciones de trabajo con GPUs de 24 GB.
- Evaluacion de calidad de cuantizacion: los desarrolladores pueden comparar las diferentes variantes GGUF (Q4, Q5, Q6, Q8) para medir el impacto de la cuantizacion en la calidad del video generado, usando el mismo prompt y configuracion en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas como FVD, CLIP score o comparaciones cuantitativas con otros modelos de generacion de video. La unica informacion de rendimiento disponible es la tabla de requisitos de VRAM de la model card, que indica el tamano de archivo y la VRAM recomendada para cada cuantizacion, pero no hay datos de latencia o throughput.

## Requisitos de hardware

- Q2_K: ~6,8 GB de VRAM para los pesos, recomendado 10-12 GB de GPU. Calidad pobre para renders finales, solo para pruebas.
- Q3_K_S: ~7,8 GB de VRAM, recomendado 12-16 GB de GPU. Calidad pobre, solo para prototipado.
- Q4_K_M: ~11,5 GB de VRAM, recomendado 16-20 GB de GPU. Mejor equilibrio calidad/rendimiento para hardware de consumo (p. ej. RTX 4080).
- Q5_K_M: ~14,2 GB de VRAM, recomendado 20-24 GB de GPU. Punto dulce para tarjetas de 24 GB (RTX 3090/4090).
- Q6_K: ~16,8 GB de VRAM, recomendado 24 GB de GPU. Muy cercano al BF16 original.
- Q8_0: ~23,0 GB de VRAM, recomendado 32 GB o mas (Mac Studio, doble GPU). Visualmente indistinguible del original.
- Ademas de los pesos, se necesitan 4-8 GB adicionales de VRAM para el contexto de ejecucion, VAE y codificadores de texto.
- Opciones de despliegue: ComfyUI (soporte nativo), llama.cpp (para GGUF), y cualquier herramienta compatible con GGUF. No se menciona soporte explicito para vLLM o TGI en la documentacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El modelo compite con otros generadores de video open source como Wan 2.1, Hunyuan Video o Mochi 1, pero no hay benchmarks comunes que permitan una comparacion cuantitativa. La principal diferencia de LTX-2.5 es la generacion sincronizada de audio y video en una sola pasada, asi como el soporte nativo de multishot, caracteristicas que no estan presentes en la mayoria de alternativas. En cuanto a requisitos de hardware, las cuantizaciones GGUF de este repo permiten ejecutarlo en GPUs de consumo, algo que no siempre es posible con otros modelos de tamano similar.

## Limitaciones y advertencias

- Las cuantizaciones Q2_K y Q3_K_S producen resultados de calidad pobre para generacion de imagen y video, y no son recomendables para renders finales. Solo deberian usarse para pruebas basicas.
- La licencia LTX-2.x Community License permite uso comercial gratuito solo para empresas con ingresos anuales inferiores a 10 M USD. Por encima de ese umbral, se requiere un acuerdo comercial de pago con Lightricks.
- El modelo puede generar contenido con sesgos presentes en los datos de entrenamiento, aunque no se documentan sesgos especificos en la informacion disponible.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir detalles inconsistentes o imposibles, especialmente con prompts complejos o en cuantizaciones bajas.
- No se especifica la longitud de contexto en tokens para el texto de entrada, lo que limita la planificacion de prompts muy largos.
- El repositorio no incluye informacion sobre el dataset de entrenamiento, por lo que no se puede evaluar la cobertura de idiomas o dominios.
- La generacion de video requiere una cantidad significativa de VRAM adicional (4-8 GB) ademas de los pesos, lo que puede sorprender a quienes calculen solo el tamano del archivo GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/courageaihub/LTX-2.5-Comfy-GGUF
- Modelo base original: https://huggingface.co/Lightricks/LTX-2.5
- Licencia del modelo: https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md
- Pagina de LTX 2.5 en Comfy: https://comfy.org/ltx-2.5
- Documentacion de workflows LTX-2.5 en ComfyUI: https://docs.comfy.org/tutorials/video/ltx/ltx-2-5
- Guia de modelos LTX por VRAM: https://ltxworkflow.com/models
- Repositorio alternativo de cuantizaciones GGUF: https://huggingface.co/realrebelai/LTX-2.5_GGUFs
