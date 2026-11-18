# Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients

## Resumen

LTX-2.5-22b-IC-LoRA-Ingredients es un adaptador LoRA de tipo IC-LoRA (in-context LoRA) desarrollado por Lightricks sobre el modelo base de generación de vídeo LTX-2.5, de 22.000 millones de parámetros. Su función específica es la consistencia de personajes y la transferencia de referencias visuales en tareas de vídeo a vídeo: a partir de una hoja de referencia ("reference sheet") con los ingredientes visuales de un personaje o escena, el adaptador condiciona la generación para que el resultado mantenga la identidad y los atributos de esa referencia a lo largo del clip.

El modelo se distribuye como archivo único en formato de pesos diffusers (`diffusion-single-file`) y está etiquetado como pipeline de vídeo a vídeo. Con 16.572 descargas y 129 "likes" en Hugging Face, es una pieza relevante para flujos de producción audiovisual que necesitan coherencia de personaje entre tomas, un problema clásico de los modelos de vídeo generativo que suelen derivar en la apariencia de los sujetos entre frames y entre clips.

Es importante subrayar que no se trata de un modelo de lenguaje: no genera texto, no razona y no soporta tool calling. Es un adaptador de difusión para vídeo. El acceso está restringido (gated) y requiere aceptar la licencia comunitaria LTX-2.x en Hugging Face antes de la descarga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (IC-LoRA) sobre modelo de difusión de vídeo LTX-2.5 |
| Parámetros totales | 22.000 millones (modelo base LTX-2.5); el adaptador LoRA es un subconjunto de pesos de bajo rango, tamaño no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vídeo; la ventana relevante es la duración del clip, no especificada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | ltx-2.x-community-license (licencia "other", acceso restringido) |
| Formato de pesos | Diffusion single-file (archivo único compatible con diffusers) |
| Tamaño del repositorio | 1,4 GB |
| Modelo base | Lightricks/LTX-2.5 |
| Pipeline | video-to-video |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Fecha de creación | 2026-09-10 |
| Última actualización | 2026-10-22 |

## Arquitectura y entrenamiento

El adaptador se construye sobre LTX-2.5, el modelo de difusión de vídeo de Lightricks, y emplea la técnica IC-LoRA (in-context LoRA). En lugar de un LoRA convencional que modifica el estilo global del modelo, un IC-LoRA inyecta información de contexto —en este caso, una hoja de referencia con los "ingredientes" visuales del personaje— en el proceso de denoising, de modo que el modelo base respeta esos atributos durante la generación vídeo a vídeo. El repositorio se distribuye como archivo único de pesos, lo que simplifica su carga en pipelines basados en diffusers.

No se dispone de información sobre el número de tokens o clips de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones de decodificación o atención específicas del adaptador. El tamaño del repositorio (1,4 GB) es coherente con un adaptador de bajo rango, no con los pesos completos del modelo base de 22.000 millones de parámetros.

## Capacidades

- Generación de vídeo a vídeo condicionada por una hoja de referencia visual ("reference sheet") con los ingredientes del personaje.
- Consistencia de personaje: mantiene la identidad y los atributos visuales de la referencia a lo largo del clip generado.
- Transferencia de referencias: permite aplicar los elementos de una hoja de ingredientes a un vídeo de entrada.
- Integración en pipelines de difusión para vídeo mediante el modelo base LTX-2.5.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: limitadas al inglés (`en`).
- No dispone de modo de pensamiento (thinking), visión general ni audio; su única modalidad es el vídeo.

## Casos de uso

- Producción de series animadas con personajes recurrentes: el adaptador permite generar cada plano condicionado por la hoja de referencia del personaje, reduciendo la deriva de identidad entre tomas y episodios.
- Publicidad con mascota de marca: a partir de una reference sheet corporativa, se generan variaciones de vídeo del personaje en distintos escenarios manteniendo los rasgos de marca.
- Previsualización de videojuegos: generar cinemáticas o animaciones de personajes a partir de sus hojas de diseño conceptual, acelerando la iteración artística.
- Doblaje y localización visual: aplicar la referencia de un personaje a metraje existente para mantener coherencia en versiones localizadas o remasterizadas.
- Contenido para redes sociales con influencer virtual: mantener la apariencia del personaje generado entre publicaciones y clips sucesivos.
- Storyboarding y animática: convertir hojas de personaje y guiones visuales en clips de referencia para equipos de dirección antes de la producción final.
- Restauración o reestilización de metraje: usar el pipeline vídeo a vídeo con referencias para reestilizar secuencias preservando la identidad de los sujetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al operar sobre un modelo base de 22.000 millones de parámetros, la inferencia requiere cargar el modelo base completo además del adaptador; el adaptador en sí ocupa 1,4 GB.
- GPU recomendadas: no disponibles de forma específica; por el tamaño del modelo base, se requiere hardware de gama alta (A100, H100 o equivalentes con VRAM suficiente), aunque no se confirma en la información.
- Compatibilidad con GPU de consumo: no confirmada; no disponible.
- Opciones de despliegue: pipelines de difusión compatibles con `diffusion-single-file` y el modelo base LTX-2.5; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| LTX-2.5-22b-IC-LoRA-Ingredients | IC-LoRA vídeo a vídeo sobre LTX-2.5 | 22.000 M (base) | No disponible | ltx-2.x-community-license | Restringido (gated) |
| LTX-2.5-22b-LoRA-Slow-Motion-Control | LoRA de control de cámara/velocidad sobre LTX-2.5 | 22.000 M (base) | No disponible | No disponible | No disponible |
| LTX-2.5-22b-LoRA-Cinemagraph | LoRA de cinemagraph sobre LTX-2.5 | 22.000 M (base) | No disponible | No disponible | No disponible |

Los modelos comparables identificados pertenecen a la misma familia LTX-2.5 de Lightricks y comparten el modelo base, por lo que la diferencia principal es la tarea del adaptador (consistencia de personaje frente a control de movimiento o cinemagraph). No se dispone de datos de rendimiento comparativo ni de alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Idiomas: únicamente inglés (`en`); no se documenta soporte multilingüe.
- Licencia comunitaria LTX-2.x: es necesario revisar sus términos para uso comercial, ya que no es una licencia de código abierto estándar (Apache, MIT) y el acceso es restringido.
- Acceso gated: requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de despliegues y la reproducibilidad en CI/CD.
- Dependencia del modelo base LTX-2.5: el adaptador no funciona de forma autónoma y hereda las limitaciones, sesgos y riesgos de alucinación visual del modelo base.
- Riesgo de deriva de identidad en clips largos o con cambios de escena complejos, pese al condicionamiento por referencia; no se documentan métricas de consistencia.
- No se dispone de información sobre sesgos demográficos o culturales del adaptador ni del modelo base.
- No se documentan requisitos de hardware ni latencias, lo que dificulta la planificación de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Organización Lightricks en Hugging Face: https://huggingface.co/Lightricks
- Sitio web de Lightricks: https://www.lightricks.com/
- Sobre Lightricks: https://www.lightricks.com/about
- Lightricks en Wikipedia: https://en.m.wikipedia.org/wiki/Lightricks
- Lightricks en GitHub: https://github.com/Lightricks
