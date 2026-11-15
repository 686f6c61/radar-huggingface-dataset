# SEEDRAAI/MOSS-Image-LoRA-Polaroid

## Resumen

MOSS-Image-LoRA-Polaroid es un adaptador LoRA de bajo rango para generación de imágenes texto-a-imagen, desarrollado por SEEDRAAI sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT. Su función no es añadir contenido nuevo al modelo, sino imponer un estilo visual muy concreto: la estética de una fotografía instantánea Polaroid, con marco blanco de borde inferior ancho, colores cálidos desaturados, sombras suaves, destello de flash y una textura química ligeramente imperfecta. El adaptador es agnóstico al sujeto: aplica el mismo tratamiento visual a retratos, escenas nocturnas con flash, viajes, comida, coches o interiores.

El repositorio ocupa 0,2 GB y contiene un único archivo de pesos en formato safetensors (`p0laroid_moss_v1.safetensors`), pensado para cargarse en ComfyUI mediante un nodo LoraLoaderModelOnly situado después del cargador del modelo base. El entrenamiento se realizó sobre 54 fotografías Polaroid reales procedentes de Wikimedia Commons, todas con licencias libres (CC BY 2.0, CC BY 3.0, CC BY 4.0, CC BY-SA 3.0 y CC BY-SA 4.0).

La relevancia de esta ficha es acotada: se trata de un adaptador de estilo de nicho, publicado en noviembre de 2026, con cero descargas y cero likes en el momento de la consulta, y sin datos de benchmarks. Su interés práctico reside en la receta de inferencia documentada (peso 1.0, resolución 896×1088, 25 pasos, CFG 2.5, sampler er_sde) y en la palabra de activación `p0laroid`, que condicionan por completo su uso correcto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión texto-a-imagen OpenMOSS-Team/MOSS-Image-SFT |
| Parametros totales | no disponible (el repositorio contiene un unico archivo de pesos LoRA; no se declara el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (el adaptador sigue la licencia del modelo base) |
| Formato de pesos | safetensors (`p0laroid_moss_v1.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA, es decir, una modificación de bajo rango de los pesos del modelo base MOSS-Image-SFT, que actúa como modelo de difusión texto-a-imagen. La model card no detalla sobre qué módulos concretos del transformer de difusión se aplican las matrices de bajo rango, ni el rango utilizado, ni la configuración exacta del entrenamiento (tasa de aprendizaje, número de pasos, optimizador). Tampoco se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas de ajuste fino adicionales.

El dato de entrenamiento documentado es el conjunto de datos: 54 fotografías Polaroid reales obtenidas de Wikimedia Commons, todas bajo licencias libres (CC BY 2.0, CC BY 3.0, CC BY 4.0, CC BY-SA 3.0 y CC BY-SA 4.0), con atribución nominal a los fotógrafos. Se trata, por tanto, de un ajuste de estilo de conjunto pequeño, orientado a capturar las características visuales del formato instantáneo más que a aprender conceptos nuevos. La model card menciona además una versión paralela del mismo adaptador para Qwen Image 2.1, lo que sugiere una metodología de entrenamiento replicada entre modelos base.

## Capacidades

- Generación de imágenes texto-a-imagen con estética Polaroid: aplica marco blanco con borde inferior ancho, colores cálidos desaturados, sombras suaves, destello de flash y textura química imperfecta.
- Transferencia de estilo independiente del sujeto: funciona sobre retratos, escenas nocturnas con flash, viajes, comida, coches e interiores.
- Activación mediante la palabra clave `p0laroid`, que debe encabezar el prompt.
- Plantilla de prompt documentada: `p0laroid, a polaroid instant photo, {your scene}`.
- Integración con ComfyUI mediante el nodo LoraLoaderModelOnly.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; es un adaptador exclusivamente de generación de imagen.

## Casos de uso

- Fotografía de producto con estética retro: aplicar el adaptador a imágenes de catálogo para obtener un aspecto de foto instantánea que encaje en campañas de marca con tono nostálgico, usando la plantilla de prompt y el peso 1.0 recomendado.
- Contenido para redes sociales: generar escenas cotidianas (comida, interiores, viajes) con el tratamiento Polaroid para publicaciones de estilo lifestyle, aprovechando que el adaptador no depende del sujeto.
- Retratos de recuerdo para álbumes digitales: producir retratos con marco Polaroid y flash directo, bajando el peso a 0.8 si los rostros empiezan a desviarse, tal como indica la model card.
- Ambientación de escenas nocturnas: recrear fotos de fiesta con flash directo y grano químico, un caso que la model card identifica explícitamente como adecuado.
- Previsualización de concepto en estudios de diseño: generar variaciones rápidas de una escena con estética instantánea antes de una sesión fotográfica real, con 25 pasos y CFG 2.5 para iterar con rapidez.
- Ilustración editorial y fanzines: incorporar imágenes con textura de película instantánea en maquetas y publicaciones de tirada corta, ajustando la resolución a 896×1088 para respetar las proporciones reales del formato.
- Pruebas de integración en pipelines ComfyUI: servir como caso de referencia para validar la carga de LoRAs de estilo sobre el modelo base MOSS-Image-SFT en flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende enteramente del modelo base MOSS-Image-SFT, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el repositorio del adaptador ocupa 0,2 GB, pero el modelo base debe cargarse adicionalmente.
- Opciones de despliegue: ComfyUI es el flujo documentado por el autor (nodo LoraLoaderModelOnly tras el cargador del modelo base). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponible. La configuración recomendada es de 25 pasos con sampler er_sde y CFG 2.5, pero no se publican tiempos de generación.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEEDRAAI/MOSS-Image-LoRA-Polaroid | LoRA de estilo | OpenMOSS-Team/MOSS-Image-SFT | 896×1088 recomendado | apache-2.0 | Hugging Face, CivitAI |
| SEEDRAAI/Qwen-Image-2.1-LoRA-Polaroid | LoRA de estilo | Qwen Image 2.1 | no disponible | no disponible en la informacion | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base texto-a-imagen | no aplica | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el conjunto de entrenamiento son 54 fotos de Wikimedia Commons, por lo que la diversidad de sujetos y contextos es limitada y puede reflejar los sesgos de esas imágenes.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar detalles incoherentes; la model card advierte de que los rostros pueden desviarse con peso 1.0, recomendando bajarlo a 0.8.
- Limitaciones de prompt: evitar las palabras *frame* y *cropped* en la escena, porque el modelo las interpreta como el encuadre de la cámara y elimina el borde Polaroid. Si el marco desaparece, añadir *white polaroid border with a wider bottom edge* al final del prompt.
- Limitación de idioma: solo inglés (`en`); no se garantiza el comportamiento con prompts en castellano.
- Restricciones de licencia: el adaptador es apache-2.0 y sigue la licencia del modelo base; el uso comercial está permitido por la licencia del adaptador, pero conviene verificar la licencia concreta de OpenMOSS-Team/MOSS-Image-SFT antes de desplegarlo en producción.
- Madurez: cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026; no hay evidencia de uso en producción ni validación por terceros.
- Dependencia del ecosistema ComfyUI: el flujo documentado está atado a ComfyUI y a un nodo concreto; los flujos completos de posprocesado del autor (realism stack, ruido de cámara, grano y color) no se distribuyen con el adaptador y forman parte de una suscripción de pago.

## Enlaces

- Hugging Face: https://huggingface.co/SEEDRAAI/MOSS-Image-LoRA-Polaroid
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Version para Qwen Image 2.1: https://huggingface.co/SEEDRAAI/Qwen-Image-2.1-LoRA-Polaroid
- CivitAI: https://civitai.com/models/3035183
- Web del autor: https://seedraai.com/?utm_source=huggingface&utm_campaign=polaroid-moss
- Discord de la comunidad: https://discord.gg/seedraai
