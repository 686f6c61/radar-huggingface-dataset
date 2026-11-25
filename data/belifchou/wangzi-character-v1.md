# BelifChou/wangzi-character-v1

## Resumen

BelifChou/wangzi-character-v1 es un adaptador LoRA de tipo DreamBooth para generación de imágenes mediante texto (text-to-image), entrenado sobre el modelo base Krea 2 RAW (krea/Krea-2-Raw) y pensado para invocarse sobre la variante Krea 2 Turbo. Lo desarrolla el usuario BelifChou y su función es introducir un concepto concreto —un personaje identificado por el token `wangzi`— en el espacio latente del modelo base, de modo que este pueda reproducirlo de forma consistente en distintas escenas y encuadres.

El adaptador es de tamaño reducido (el repositorio ocupa 1,4 GB) y se distribuye en formato compatible con la librería diffusers, cargándose mediante `load_lora_weights` sobre una instancia de `Krea2Pipeline`. No se trata de un modelo autónomo: requiere siempre el modelo base Krea 2 para funcionar, y su calidad final depende tanto del base como de los parámetros de muestreo empleados.

Su relevancia es acotada y práctica: sirve como ejemplo de personalización de un modelo de difusión moderno mediante LoRA, con licencia Apache 2.0 y un flujo de uso reproducible en pocas líneas de código. Con 15 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho orientado a quien necesite fijar la identidad visual de un personaje concreto sin reentrenar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre modelo de difusion Krea 2 |
| Parametros totales | no disponible (adaptador LoRA; el repositorio pesa 1,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, sin contexto de texto medido) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en el formato del repo; el base admite bfloat16) |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | compatible con diffusers (carga via `load_lora_weights`); safetensors no confirmado |
| Modelo base | krea/Krea-2-Raw (entrenamiento), mostrado sobre krea/Krea-2-Turbo |
| Token de activacion | `wangzi` |
| Libreria | diffusers |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la tecnica DreamBooth sobre el modelo Krea 2 RAW, segun declara el autor en la model card. DreamBooth es un metodo de ajuste fino por subject-driven generation: se entrena al modelo para asociar un token raro (`wangzi`) con un sujeto concreto a partir de un conjunto reducido de imagenes de referencia, y LoRA restringe la actualizacion a matrices de bajo rango, lo que reduce drasticamente el coste de entrenamiento y el tamano del artefacto resultante.

La model card no detalla el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, la resolucion ni la composicion del dataset. Tampoco indica si hubo regularizacion con imagenes de clase ni si se aplicaron tecnicas adicionales como prior preservation. Las muestras publicadas se generaron con el adaptador cargado sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere un flujo de destilado por destilacion de pasos (Turbo) compatible con el adaptador entrenado sobre RAW.

## Capacidades

- Generacion de imagenes condicionada por texto (text-to-image) mediante el pipeline `Krea2Pipeline`.
- Reproduccion consistente de un concepto o personaje concreto mediante el token `wangzi`.
- Composicion del sujeto en escenas variadas: interiores (mesa de madera), exteriores (hierba) y primeros planos sobre fondo neutro, segun los ejemplos de la model card.
- Integracion con el ecosistema diffusers mediante `load_lora_weights`, lo que permite combinarlo con el base Krea 2 Turbo o RAW.
- Inferencia rapida en la variante Turbo: los ejemplos se generan con 8 pasos.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso (no aplica a un modelo de difusion).
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles.

## Casos de uso

- Ilustracion de personaje recurrente: usar el token `wangzi` para generar el mismo personaje en distintas poses y escenarios, util para storyboards, comics o narrativa visual serializada donde la consistencia de identidad es critica.
- Prototipado de assets para videojuegos o animacion: generar variaciones del personaje en interiores, exteriores y primeros planos para explorar direccion de arte antes de encargar modelado o ilustracion final.
- Creacion de contenido para redes sociales: producir imagenes del personaje en contextos cotidianos (mesa de madera, cesped) con un coste de inferencia bajo gracias a los 8 pasos del modo Turbo.
- Pruebas de concepto de personalizacion con LoRA: servir como referencia tecnica para equipos que quieran replicar el flujo DreamBooth + LoRA sobre Krea 2 en sus propios personajes o productos.
- Generacion de material para maquetas y presentaciones: primeros planos sobre fondo neutro del personaje para integrarlos en documentos, pitch decks o mockups de producto.
- Dataset sintetico aumentado: generar imagenes del personaje en multiples condiciones para aumentar un conjunto de entrenamiento de otro modelo (por ejemplo, un clasificador o un segundo LoRA), siempre que la licencia Apache 2.0 lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de identidad) ni comparaciones numericas con otros adaptadores.

## Requisitos de hardware

- El adaptador en si pesa 1,4 GB, pero la VRAM necesaria la determina el modelo base Krea 2, no el LoRA.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del base Krea 2 y de la precision (los ejemplos usan `torch.bfloat16`).
- GPU recomendadas: no disponibles en la informacion proporcionada. El ejemplo de la model card usa `cuda` sin especificar modelo de GPU.
- Cabe en GPU de consumo: no confirmado; depende de los requisitos del base Krea 2, que no se detallan.
- Opciones de despliegue: diffusers con `Krea2Pipeline` (flujo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion en este contexto).
- Latencia y throughput: no disponibles; los ejemplos usan 8 pasos de inferencia con `guidance_scale=0.0`, lo que sugiere un regimen de baja latencia, pero sin cifras publicadas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA comparables para Krea 2 ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Dependencia total del modelo base Krea 2: sin el, el adaptador no genera imagenes.
- Entrenado sobre Krea 2 RAW pero mostrado sobre Turbo; el comportamiento puede diferir entre variantes y no se documenta la robustez del adaptador fuera del regimen Turbo de 8 pasos.
- Sin datos publicados sobre numero de imagenes de entrenamiento, lo que impide estimar el riesgo de sobreajuste al sujeto o de colapso de diversidad.
- Riesgo de reproduccion de sesgos presentes en las imagenes de entrenamiento del sujeto y en el propio modelo base; no se documentan evaluaciones al respecto.
- Riesgo de alucinacion visual: el adaptador puede imponer el concepto `wangzi` en prompts donde no se desea, o fallar al reproducirlo si el prompt es muy complejo.
- Idioma: los ejemplos estan en ingles; no se documenta el comportamiento con prompts en castellano.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Krea 2, que puede imponer condiciones adicionales.
- Artefacto de nicho con muy poca adopcion (15 descargas, 0 likes); sin garantias de mantenimiento ni soporte.
- No se documenta si el sujeto representa a una persona real; si fuera asi, podrian aplicar consideraciones de derechos de imagen ajenas a la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BelifChou/wangzi-character-v1
- Modelo base (entrenamiento): https://huggingface.co/krea/Krea-2-Raw
- Modelo base (inferencia mostrada): https://huggingface.co/krea/Krea-2-Turbo
- Documentacion de diffusers: https://huggingface.co/docs/diffusers
