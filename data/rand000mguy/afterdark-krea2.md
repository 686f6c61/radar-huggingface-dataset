# Rand000mGuy/afterdark-krea2

## Resumen

afterdark-krea2 es un adaptador LoRA de difusión (text-to-image) publicado por el usuario Rand000mGuy en Hugging Face, diseñado para funcionar sobre el modelo base `krea/Krea-2-Raw`. No se trata de un modelo de lenguaje ni de un modelo fundacional completo: es un ajuste fino de bajo rango que modifica el comportamiento estilístico del generador de imágenes subyacente. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA y no con pesos completos.

La model card publicada es extremadamente mínima: solo declara las etiquetas (`text-to-image`, `lora`, `diffusers`, `template:diffusion-lora`), el modelo base y un único ejemplo de widget con el prompt `'-'`, sin texto descriptivo, sin `instance_prompt` y sin instrucciones de uso. No se declaran licencia, idiomas, dataset de entrenamiento ni hiperparámetros.

Existe un modelo homónimo, «AfterDark», distribuido en Civitai, Tensor.Art y PromptHero por el autor HackAfterDark, descrito como un LoRA para Krea 2 (también compatible con Z-Image Turbo y Flux.2 Klein) entrenado con fotografía de clave baja, cine negro y moda, orientado a aumentar contraste, profundidad de campo e iluminación. Es plausible que esta ficha corresponda a una conversión o réplica de ese adaptador, pero **no hay confirmación en la información disponible**, por lo que cualquier característica derivada de esa descripción se marca como no verificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de difusión sobre un modelo base de generación de imágenes (no es un transformer autoregresivo ni un MoE) |
| Parametros totales | No disponible (el repositorio pesa 0,2 GB; el número de parámetros del adaptador no se declara) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo text-to-image; la ventana de texto depende del codificador del modelo base, no declarada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (los prompts dependen del codificador de texto de `krea/Krea-2-Raw`) |
| Licencia | No disponible |
| Formato de pesos | No disponible; el repositorio se distribuye para la librería `diffusers` |
| Modelo base | `krea/Krea-2-Raw` |
| Tipo de tarea | text-to-image (pipeline `text-to-image`) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-10-24 / 2026-10-24 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del adaptador más allá de su naturaleza LoRA (Low-Rank Adaptation) sobre un modelo de difusión. Un LoRA de este tipo congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas (habitualmente las proyecciones de atención y, en algunos casos, las capas de alimentación), de modo que el adaptador modifica el estilo o el dominio sin alterar el conocimiento del modelo original. El tamaño de 0,2 GB sugiere un rango y un conjunto de módulos objetivo moderados, pero no se publica ni el rango (`r`), ni el `alpha`, ni la lista de módulos afectados.

Tampoco se documentan el dataset de entrenamiento, el número de pasos, la resolución de entrenamiento, el optimizador, la tasa de aprendizaje ni si se aplicaron técnicas como regularización por clase, captions automáticos o entrenamiento con `prior preservation`. La model card no incluye `instance_prompt`, lo que impide conocer la palabra de activación, si existe. En cuanto a la referencia externa, la descripción del «AfterDark» de Civitai (no confirmada como el mismo artefacto) menciona un entrenamiento sobre una mezcla de contenido fotográfico con foco en clave baja, cine negro y fotografía de moda, además de valores de fuerza recomendados y ajustes sugeridos para Krea 2 Turbo; esos datos no aparecen en el repositorio de Hugging Face y no deben asumirse.

## Capacidades

- Generación de imágenes a partir de texto (`text-to-image`) mediante el pipeline de `diffusers`, heredando las capacidades del modelo base `krea/Krea-2-Raw`.
- Modulación de estilo: según la descripción del modelo homónimo en Civitai/Tensor.Art (no verificada para este repositorio), el adaptador incrementa contraste, profundidad de campo e iluminación, con estética de clave baja, cine negro y fotografía de moda.
- Composición con otros adaptadores: al ser un LoRA, es combinable en principio con otros LoRA del mismo modelo base, aunque no se documentan pesos recomendados ni compatibilidades.
- Control de intensidad: los LoRA permiten ajustar la fuerza de aplicación en el momento de la inferencia; el autor no publica valores recomendados en Hugging Face.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo «thinking», visión de entrada, audio ni capacidades multilingües explícitas.
- No se declara soporte de inpainting, outpainting, controlnet, img2img guiado ni edición instructiva.

## Casos de uso

- Retrato editorial y fotografía de moda: usar el adaptador sobre Krea 2 con prompts descriptivos de vestuario, esquema de iluminación y encuadre para obtener imágenes con mayor contraste y separación de planos, adecuadas para maquetas de campaña o moodboards previos a una producción real.
- Ilustración de tono cinematográfico: generación de keyframes y concept art con estética de cine negro (clave baja, sombras marcadas, fuentes de luz laterales) para previsualización de cortometrajes o pitches.
- Creación de fondos y texturas para producción audiovisual: generación de plates y backdrops con profundidad de campo acentuada que luego se retocan o se componen en posproducción.
- Prototipado rápido de direcciones de arte: comparar variantes de un mismo concepto cambiando solo la fuerza del LoRA y la semilla, para decidir una línea visual antes de encargar fotografía o render 3D.
- Contenido para redes y editorial digital: series coherentes de imágenes con una firma visual común, generadas en lote con el mismo adaptador y prompts parametrizados por formato (cuadrado, vertical, horizontal).
- Exploración de estilo en investigación de difusión: servir como caso de estudio de LoRA de estilización para medir, por ejemplo, el desplazamiento de distribución respecto al modelo base o la degradación de fidelidad al prompt al subir la fuerza del adaptador.
- Integración en pipelines automatizados con `diffusers`: al ser un adaptador ligero de 0,2 GB, puede cargarse y descargarse por trabajo en un servicio de generación de imágenes sin replicar los pesos completos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, ImageReward, HPSv2), comparativas con el modelo base ni evaluaciones humanas. Tampoco se aportan valores de fuerza recomendados, número de pasos, sampler ni guía (CFG) sugeridos para este repositorio concreto.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB en disco; el coste real de inferencia lo determina el modelo base `krea/Krea-2-Raw`, cuyos requisitos no se detallan en la información disponible.
- VRAM estimada para inferencia: no disponible para el modelo base. Como referencia de orden de magnitud, un pipeline de difusión de imagen de la familia de Krea 2 requiere habitualmente entre 8 y 24 GB de VRAM según resolución, precisión (fp16/bf16) y si se aplican optimizaciones de atención; esta horquilla es orientativa y no está confirmada para este caso.
- GPU recomendadas: no disponibles. No hay datos del autor sobre A100, H100, RTX 4090, RTX 3090 ni otras GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende enteramente del modelo base y de la resolución objetivo.
- Opciones de despliegue: `diffusers` (librería declarada en el repositorio). No se documenta compatibilidad con ComfyUI, Automatic1111, Forge, InvokeAI, TensorRT ni ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `Rand000mGuy/afterdark-krea2` | LoRA de difusión | `krea/Krea-2-Raw` | No disponible | No disponible | Hugging Face, 0 descargas, 0 likes | Model card mínima, sin documentación de uso |
| `Rand000mGuy/alternative-reality-krea2` | LoRA de difusión | Krea 2 (según nombre) | No disponible | No disponible | Hugging Face, 0 likes | Mismo autor; igualmente sin documentación sustantiva |
| AfterDark v2.0-KR2 (HackAfterDark, Civitai / Tensor.Art / PromptHero) | LoRA de difusión | Krea 2; también Z-Image Turbo y Flux.2 Klein | No disponible | No disponible en los resultados de búsqueda | Civitai, Tensor.Art, PromptHero | Descripción explícita: clave baja, cine negro, moda; ajustes sugeridos para Krea 2 Turbo. Correspondencia con este repositorio no confirmada |
| Modelo base `krea/Krea-2-Raw` | Modelo de difusión completo | — | No disponible | No disponible | Referenciado como base | Punto de comparación de referencia: el LoRA se evalúa siempre respecto a él |

No se dispone de datos de rendimiento comparables entre estas variantes, por lo que la comparativa se limita a tipo de artefacto, modelo base, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: sin `instance_prompt`, sin hiperparámetros, sin valores de fuerza recomendados y sin ejemplos más allá de un prompt vacío (`'-'`) en el widget.
- Licencia no declarada: no puede asumirse uso comercial. Antes de integrarlo en producción hay que contactar con el autor o consultar la licencia del modelo base `krea/Krea-2-Raw`, que puede imponer restricciones adicionales.
- Riesgo de sobreajuste al estilo: los LoRA de estilización suelen degradar la adherencia al prompt y la diversidad de composición al aumentar la fuerza de aplicación; no hay guía del autor para mitigarlo.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos de representación (género, etnia, edad, cuerpo) ni la presencia de contenido con derechos de autor en el entrenamiento.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir anatomía inconsistente, texto ilegible y detalles físicamente incoherentes; la estética de clave baja y alto contraste puede agravar la pérdida de detalle en sombras.
- Idiomas: no se declaran; la calidad con prompts en castellano depende del codificador de texto del modelo base y no está verificada.
- Repositorio sin tracción (0 descargas, 0 likes) y sin comunidad: no hay evidencia de terceros sobre calidad o estabilidad, ni issues que documenten fallos.
- Fecha de creación y actualización separadas por 6 segundos, lo que sugiere una subida automatizada o un artefacto de conversión sin revisión posterior.
- No verificable como el «AfterDark» de Civitai: la estética descrita allí no debe atribuirse a este repositorio sin comprobación directa.

## Enlaces

- Hugging Face (repositorio del modelo): https://huggingface.co/Rand000mGuy/afterdark-krea2
- Archivos y versiones: https://huggingface.co/Rand000mGuy/afterdark-krea2/tree/main
- Perfil del autor en Hugging Face: https://huggingface.co/Rand000mGuy
- Otro LoRA del mismo autor (`alternative-reality-krea2`): https://huggingface.co/Rand000mGuy/alternative-reality-krea2
- Modelo homónimo «afterdark» en Hugging Face: https://huggingface.co/Rand000mGuy/afterdark
- AfterDark v2.0-KR2 en Civitai (posible correspondencia, no confirmada): https://civitai.com/models/2176378/afterdark
- AfterDark v2.0-KR2 en Tensor.Art: https://tensor.art/models/1028375453741665822
- AfterDark v2.0-Klein en PromptHero: https://prompthero.com/ai-models/afterdark-2176378-download/afterdark-v20-klein
- Modelo base referenciado: `krea/Krea-2-Raw` (no se ha localizado una URL canónica en la información disponible)
