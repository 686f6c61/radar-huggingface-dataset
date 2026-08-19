# Comfy-Org/Krea-2

## Resumen

Krea 2 es un modelo de generación de imágenes desarrollado por Krea AI y distribuido en abierto, reempaquetado por Comfy-Org para su uso directo en ComfyUI. Se presenta en dos variantes complementarias: Krea 2 RAW, el modelo base con muestreo completo de 52 pasos, y Krea 2 Turbo, optimizado para inferencia rápida con menos pasos. El modelo está entrenado desde cero y se centra en la exploración creativa y estilística, ofreciendo una amplia gama de estilos artísticos mediante LoRAs específicos.

El repositorio incluye los pesos en varios formatos de cuantización (bf16, fp8, int8, mxfp8, nvfp4), un text encoder basado en Qwen3VL de 4B y un VAE de Qwen Image. El tamaño total del repositorio es de 177,8 GB, lo que indica un modelo de gran capacidad. La licencia es la "krea-2-community-license", que permite uso comunitario pero con restricciones que deben revisarse antes de un despliegue comercial.

La relevancia actual de Krea 2 radica en su enfoque en la calidad estética y el control creativo, posicionándose como una alternativa open-source para generación de imágenes artísticas, con integración nativa en ComfyUI y soporte para entrenamiento de LoRAs sobre la variante RAW.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (detalles no disponibles) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantizacion | bf16, fp8_scaled, int8_convrot, mxfp8, nvfp4 (segun variante) |
| Idiomas soportados | No disponible (el text encoder Qwen3VL soporta multiples idiomas, pero no se especifica) |
| Licencia | krea-2-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura interna del modelo (tipo de transformer, atencion, etc.) en la informacion disponible. Se sabe que es un modelo de difusion entrenado desde cero, con dos variantes: RAW (modelo base, 52 pasos de muestreo) y Turbo (optimizado para menos pasos, probablemente mediante destilacion o similar, aunque no se confirma). El text encoder es Qwen3VL de 4B parametros y el VAE es el de Qwen Image. No hay informacion sobre el dataset de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de prompts de texto, con enfasis en calidad estetica y expresion artistica.
- Soporte de multiples estilos mediante LoRAs oficiales: darkbrush, dotmatrix, kidsdrawing, neondrip, rainywindow, retroanime, softwatercolor, sunsetblur, vintagetarot, y un LoRA de referencia de estilo (style_reference).
- Integracion nativa con ComfyUI, permitiendo flujos de trabajo de texto a imagen y entrenamiento de LoRAs sobre la variante RAW.
- Dos modos de inferencia: RAW (calidad maxima, 52 pasos) y Turbo (velocidad, menos pasos).
- No se mencionan capacidades de tool calling, agentes, vision multimodal (mas alla de la generacion) ni audio.

## Casos de uso

- Exploracion de conceptos artisticos: los disenadores pueden generar rapidamente variaciones de una idea usando la variante Turbo, con estilos como "monochrome ink wash style" o "art deco watercolor style" mediante los LoRAs incluidos.
- Creacion de ilustraciones para publicaciones: el modelo produce resultados con acabado estetico cuidado, adecuado para portadas de revistas, libros o contenido editorial, usando el LoRA "vintage tarot style" para un look retro.
- Desarrollo de personajes para videojuegos o animacion: con el LoRA "purple retro anime style" se pueden generar conceptos de personajes con estetica anime, y la variante RAW permite iterar con mayor detalle.
- Generacion de fondos y entornos: el LoRA "rainy window style" o "ethereal motion blur style" sirven para crear atmosferas especificas en produccion audiovisual.
- Prototipado rapido en diseno grafico: la variante Turbo, con cuantizacion fp8 o int8, permite iterar en tiempo real en equipos con GPU consumer, integrandose en flujos de diseno.
- Entrenamiento de LoRAs personalizados: al ser open-source y ejecutable localmente, los equipos pueden entrenar LoRAs sobre Krea 2 RAW con sus propios datos para estilos propietarios, usando ComfyUI como entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, FID u otras metricas de generacion de imagenes.

## Requisitos de hardware

- El repositorio ocupa 177,8 GB, por lo que se requiere espacio de almacenamiento considerable.
- Las cuantizaciones disponibles (fp8, int8, mxfp8, nvfp4) permiten reducir el uso de VRAM en comparacion con bf16, pero no se especifican valores exactos.
- Para la variante bf16 completa, se estima que se necesitan al menos 24 GB de VRAM (posiblemente mas, dado el tamano del text encoder de 4B y el VAE), aunque no hay datos oficiales.
- Con cuantizacion fp8 o int8, podria ejecutarse en GPUs consumer de gama alta como RTX 4090 (24 GB), pero no esta confirmado.
- El despliegue se realiza principalmente a traves de ComfyUI, que gestiona la carga de modelos y la inferencia. No se mencionan otros runtime como vLLM o llama.cpp, ya que no es un modelo de lenguaje.
- No hay datos de latencia o throughput publicados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros modelos de generacion de imagenes open-source como SDXL, Flux.1 o Stable Diffusion 3. No hay datos de rendimiento ni de parametros. Cualitativamente, Krea 2 se diferencia por su enfoque en estilos artisticos y su integracion con ComfyUI, pero no se puede establecer una comparacion rigurosa sin datos.

## Limitaciones y advertencias

- La licencia "krea-2-community-license" puede imponer restricciones al uso comercial; es imprescindible revisar el texto completo de la licencia antes de cualquier despliegue en produccion.
- No se han publicado detalles sobre sesgos del modelo ni sobre su comportamiento en dominios especificos; como todo modelo de generacion de imagenes, puede reflejar sesgos presentes en sus datos de entrenamiento.
- El riesgo de alucinacion visual (generacion de elementos inconsistentes o no solicitados) no esta documentado.
- La falta de informacion sobre el dataset y el entrenamiento limita la capacidad de evaluar su robustez en escenarios de uso real.
- El modelo es grande (177,8 GB en el repositorio), lo que puede suponer una barrera de entrada para equipos con recursos limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Comfy-Org/Krea-2
- Repositorio original Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Repositorio original Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- LoRAs originales: https://huggingface.co/krea/Krea-2-LoRA-darkbrush (y similares para cada estilo)
- Tutorial de ComfyUI: https://docs.comfy.org/tutorials/image/krea/krea-2
- Workflow de ejemplo: https://comfy.org/workflows/11657ed32877-11657ed32877/
- Anuncio en ComfyUI: https://comfyui.org/en/krea-2-open-source-models-are-now
