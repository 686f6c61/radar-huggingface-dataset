# AhsanHareem/reelbids-ltx25-orbit-lora

## Resumen

ReelBids LTX-2.5 orbit camera LoRA es un adaptador de bajo rango (LoRA) desarrollado por AhsanHareem para el modelo de generación de vídeo LTX-2.5 22B en su modalidad image-to-video. Su función es controlar un movimiento de cámara orbital (giro alrededor del sujeto) con siete velocidades seleccionables mediante un token de activación en el prompt, de modo que un único adaptador cubre todo el rango de velocidades, a diferencia de los LoRA oficiales de LTX-2 19B que son de una sola velocidad.

El modelo se entrenó sobre un dataset sintético generado con Blender, compuesto por 20 escenas, 7 velocidades y 4 repeticiones, con resolución 1024×576×97 fotogramas a 24 fps. El autor documenta que solo una configuración de entrenamiento (rango 32, alpha 32, módulos de atención únicamente, learning rate 1e-4, 2000 pasos) produjo un dial de velocidad funcional, y recomienda probar el checkpoint del paso 1250 como punto de mayor precisión.

La relevancia de este LoRA radica en que aporta control de cámara explícito y graduable a un modelo de vídeo de última generación, algo que normalmente requiere ajustes finos complejos o múltiples adaptadores. El repositorio tiene un tamaño de 0.4 GB y contiene los pesos en formato safetensors, aunque no se especifica licencia ni idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre LTX-2.5 22B (image-to-video) |
| Parametros totales | no disponible (rango 32, alpha 32, solo módulos de atención) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base LTX-2.5) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización específica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado únicamente a los módulos de atención del modelo base LTX-2.5 22B. El entrenamiento se realizó con un learning rate de 1e-4 durante 2000 pasos, guardando checkpoints cada 250 pasos. El dataset de entrenamiento es sintético, generado con Blender, con 20 escenas distintas, cada una a 7 velocidades de cámara orbital y 4 repeticiones, en resolución 1024×576×97 fotogramas a 24 fps. El autor destaca que la escalera de velocidades no está limitada y que cada peldaño produce una trayectoria de cámara distinta, evitando duplicados que sí aparecían en un dataset anterior de dolly-in.

El autor documenta que una segunda configuración de entrenamiento (con cambios simultáneos en rango, módulos objetivo, LR y número de pasos) provocó el colapso del dial de velocidad, con un error medio de zoom del 28.0% frente al 3.4% de la configuración exitosa. Por tanto, la receta reproducida es la única que funcionó, y se recomienda usar el checkpoint del paso 1250 como punto de mayor precisión.

## Capacidades

- Control de cámara orbital en generación de vídeo image-to-video con LTX-2.5 22B.
- Selección de velocidad mediante tokens de activación: `rborbit sp05` (velocidad 0.5) hasta `rborbit sp50` (velocidad 5.0).
- Un único adaptador cubre todo el rango de velocidades, sin necesidad de cambiar de LoRA.
- Compatible con el pipeline de LTX-2.5, que requiere un modelo base de 22B y una imagen de entrada.
- No se documentan capacidades adicionales como tool calling, razonamiento multimodal o soporte de agentes, ya que se trata de un adaptador especializado en movimiento de cámara.

## Casos de uso

- Generación de planos cinematográficos con movimiento orbital: el LoRA permite crear tomas en las que la cámara gira alrededor de un sujeto, útil para vídeos promocionales, clips de producto o secuencias narrativas. Se usa añadiendo el token de velocidad al prompt y proporcionando una imagen inicial.
- Control de velocidad en animación de producto: al variar el token `sp05` a `sp50`, se puede ajustar la intensidad del giro sin reentrenar, lo que facilita iterar sobre diferentes ritmos en un mismo proyecto.
- Creación de contenido para redes sociales: el movimiento orbital es un recurso habitual en vídeos cortos; este adaptador permite generarlo directamente desde una imagen estática, reduciendo el trabajo de postproducción.
- Exploración de variaciones de cámara en estudios de diseño: los equipos de dirección de arte pueden probar distintas velocidades de órbita sobre un mismo sujeto para decidir la toma final, gracias a la escalera de velocidades no limitada.
- Integración en pipelines de generación de vídeo con LTX-2.5: al ser un LoRA ligero (0.4 GB), puede cargarse junto al modelo base en entornos como ComfyUI o scripts de difusión, sin necesidad de ajustar el modelo completo.
- Sustitución de LoRA de cámara de una sola velocidad: a diferencia de los adaptadores oficiales de LTX-2 19B, este cubre siete velocidades con un solo archivo, simplificando la gestión de modelos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona un error medio de zoom del 3.4% para la configuración exitosa y del 28.0% para la fallida, pero no proporciona métricas estándar como FID, CLIP score o comparaciones con otros LoRA de cámara. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- El LoRA en sí es ligero (0.4 GB), pero requiere el modelo base LTX-2.5 22B para funcionar, por lo que la VRAM necesaria depende de la cuantización del modelo base.
- Para inferencia con LTX-2.5 22B en precisión completa (fp16), se estima un consumo de al menos 44 GB de VRAM, lo que exige GPUs como A100 (80 GB) o H100 (80 GB).
- Con cuantización a 8 bits, el consumo puede reducirse a unos 22-24 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) o RTX A6000 (48 GB).
- Con cuantización a 4 bits, podría caber en GPUs de 16 GB (RTX 4080, RTX 3090), aunque la calidad del vídeo puede degradarse.
- Opciones de despliegue: el LoRA se puede cargar en frameworks que soporten adaptadores LoRA sobre modelos de difusión, como ComfyUI, Diffusers (con el pipeline de LTX-Video) o scripts personalizados. No se menciona soporte específico para vLLM, llama.cpp u Ollama, ya que estos están orientados a modelos de lenguaje, no a generación de vídeo.
- La latencia y el throughput dependen en gran medida del hardware y de la resolución de salida; no se proporcionan datos específicos.

## Comparativa con modelos similares

| Modelo | Tipo | Velocidades | Modelo base | Tamaño | Licencia |
|---|---|---|---|---|---|
| ReelBids LTX-2.5 orbit LoRA | LoRA de cámara orbital | 7 (sp05 a sp50) | LTX-2.5 22B | 0.4 GB | no disponible |
| ReelBids LTX-2.5 dolly-in LoRA | LoRA de cámara dolly-in | 7 (sp05 a sp50) | LTX-2.5 22B | 0.2 GB | no disponible |
| LoRA oficiales LTX-2 19B | LoRA de cámara | 1 por adaptador | LTX-2 19B | no disponible | no disponible |

La comparativa se basa en la información de la búsqueda web. El LoRA orbital se diferencia del dolly-in en el tipo de movimiento (giro frente a avance) y en el tamaño del repositorio (0.4 GB frente a 0.2 GB). Frente a los LoRA oficiales de LTX-2 19B, la ventaja es la cobertura de múltiples velocidades con un solo adaptador y la compatibilidad con LTX-2.5 22B.

## Limitaciones y advertencias

- No se especifica licencia, por lo que el uso comercial no está claramente permitido; se recomienda contactar con el autor antes de utilizarlo en proyectos de pago.
- El dataset de entrenamiento es sintético (Blender), lo que puede limitar la generalización a escenas reales o estilos fotográficos muy diferentes.
- El autor documenta que solo una configuración de entrenamiento funcionó; la reproducibilidad del adaptador depende de seguir exactamente la receta indicada.
- El checkpoint recomendado es el paso 1250, pero no se garantiza que otros checkpoints produzcan resultados coherentes; el paso 2000 podría tener menor precisión.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto, ya que el adaptador no es un modelo de lenguaje sino un control de cámara.
- El modelo base LTX-2.5 22B requiere hardware de gama alta; el LoRA no reduce los requisitos de VRAM del modelo base.
- No se han publicado benchmarks independientes que validen la calidad del movimiento orbital frente a otras soluciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AhsanHareem/reelbids-ltx25-orbit-lora
- LoRA dolly-in del mismo autor: https://huggingface.co/AhsanHareem/reelbids-ltx25-camera-lora
- Página del LoRA dolly-in en AI Market Cap: https://aimarketcap.tech/models/ahsanhareem-reelbids-ltx25-camera-lora
- Listado de modelos de AhsanHareem en AI Market Cap: https://aimarketcap.tech/providers/ahsanhareem
- Artículo sobre LoRA de LTX-2.5: https://www.stablediffusiontutorials.com/2026/08/ltx-2.5-lora-models.html
